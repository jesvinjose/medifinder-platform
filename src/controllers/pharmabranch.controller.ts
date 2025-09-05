// controllers/pharmaBranch.controller.ts
import PharmaBranch from "../models/pharmaBranch";
import { Request, Response } from "express";
import Order from "../models/order";

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

export const listBranchOrders = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized", status: false });
    }

    const branch = await PharmaBranch.findOne({ userId: req.user._id });
    if (!branch) {
      return res
        .status(404)
        .json({ message: "Pharma branch not found", status: false });
    }

    const orders = await Order.find({ branchId: branch._id })
      .populate("medicalStoreId", "storeName city")
      .populate("branchId", "branchName city address")
      .populate("items.brandedMedicineId", "name packing");

    res.json({
      message: "Orders fetched successfully",
      data: orders,
      status: true,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Failed to fetch orders for the branch",
      error: err.message,
      status: false,
    });
  }
};

