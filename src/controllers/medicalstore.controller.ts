// controllers/medicalStoreController.ts
import { Request, Response } from "express";
import MedicalStore from "../models/medicalStore";
import StoreMedicineStock from "../models/storeMedicineStock";
import Order from "../models/order";
import BranchInventory from "../models/branchInventory";
import { Types } from "mongoose";
import PharmaBranch from "../models/pharmaBranch";

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

export const createMedicalStore = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    const userId = req.user._id; // from auth middleware
    const { storeName, licenseNumber, address, city, pincode, coordinates } =
      req.body;

    const existing = await MedicalStore.findOne({ userId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Store already exists for this user." });
    }

    const store = await MedicalStore.create({
      userId,
      storeName,
      licenseNumber,
      address,
      city,
      pincode,
      location: {
        type: "Point",
        coordinates: coordinates || [0, 0], // optional location
      },
    });

    res
      .status(201)
      .json({ message: "Store created", data: store, status: true });
  } catch (err: any) {
    res.status(500).json({
      message: "Error creating store",
      error: err.message,
      status: false,
    });
  }
};

export const addOrUpdateStock = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const store = await MedicalStore.findOne({ userId: req.user!._id });
    if (!store) return res.status(404).json({ message: "Store not found" });

    const { brandedMedicineId, quantity, price } = req.body;

    const updated = await StoreMedicineStock.findOneAndUpdate(
      { storeId: store._id, brandedMedicineId },
      { quantity, price, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    res
      .status(200)
      .json({ message: "Stock added/updated", data: updated, status: true });
  } catch (err: any) {
    res.status(500).json({
      message: "Failed to update stock",
      error: err.message,
      status: false,
    });
  }
};

export const listStoreMedicines = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized", status: false });
    }

    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const store = await MedicalStore.findOne({ userId: req.user._id });
    if (!store) {
      return res
        .status(404)
        .json({ message: "Store not found", status: false });
    }

    // Aggregation pipeline
    const pipeline: any[] = [
      { $match: { storeId: store._id } },

      {
        $lookup: {
          from: "brandedmedicines",
          localField: "brandedMedicineId",
          foreignField: "_id",
          as: "brandedMedicine",
        },
      },
      { $unwind: "$brandedMedicine" },

      {
        $lookup: {
          from: "genericmedicines",
          localField: "brandedMedicine.generic",
          foreignField: "_id",
          as: "genericInfo",
        },
      },
      { $unwind: "$genericInfo" },
    ];

    // Search across multiple fields
    if (search) {
      const regex = new RegExp(search.toString(), "i");
      pipeline.push({
        $match: {
          $or: [
            { "brandedMedicine.name": regex },
            { "brandedMedicine.company": regex },
            { "brandedMedicine.packing": regex },
            { "genericInfo.name": regex },
          ],
        },
      });
    }

    // Count total results
    const totalCountPipeline = [...pipeline, { $count: "total" }];
    const [countResult] = await StoreMedicineStock.aggregate(
      totalCountPipeline
    );
    const total = countResult?.total || 0;

    // Pagination
    pipeline.push({ $skip: skip }, { $limit: Number(limit) });

    const results = await StoreMedicineStock.aggregate(pipeline);

    res.json({
      message: "Medicines fetched successfully",
      status: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: results,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Failed to fetch store medicines",
      error: err.message,
      status: false,
    });
  }
};

interface OrderItemInput {
  brandedMedicineId: Types.ObjectId;
  quantity: number;
  price: number;
}

export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized", status: false });
    }

    const store = await MedicalStore.findOne({ userId: req.user._id });

    if (!store) {
      return res
        .status(404)
        .json({ message: "Medical store not found", status: false });
    }
    
    const { branchId, items, notes } = req.body as {
      branchId: Types.ObjectId;
      items: OrderItemInput[];
      notes?: string;
    };

    // Fetch branch and ensure it exists
    const branch = await PharmaBranch.findById(branchId);
    if (!branch) {
      return res
        .status(404)
        .json({ message: "Branch not found", status: false });
    }

    const companyId = branch.companyId; // derive from DB, not frontend

    // Validate inventory for each item
    for (const item of items) {
      const inventory = await BranchInventory.findOne({
        branchId,
        brandedMedicineId: item.brandedMedicineId,
      });

      if (!inventory) {
        return res
          .status(400)
          .json({ message: "Medicine not found in branch inventory" });
      }
      if (inventory.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${item.brandedMedicineId}`,
        });
      }
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum: number, i: OrderItemInput) => sum + i.price * i.quantity,
      0
    );

    const order = await Order.create({
      medicalStoreId: store?._id,
      branchId,
      companyId,
      items,
      totalAmount,
      notes,
    });

    res.status(201).json({
      message: "Order placed successfully",
      data: order,
      status: true,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Order creation failed",
      error: err.message,
      status: false,
    });
  }
};


