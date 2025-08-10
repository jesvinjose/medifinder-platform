import BranchInventory from "../models/BranchInventory";
import PharmaBranch from "../models/PharmaBranch";
import { Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

export const addInventory = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    const userId = req.user._id; // from auth middleware

    const { branchId, brandedMedicineId, quantity, priceToRetailer, mrp } =
      req.body;

    // Validate branch ownership
    const branch = await PharmaBranch.findById(branchId).populate("companyId");
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    // Ensure the branch belongs to the logged-in user's company
    // @ts-ignore - because companyId is populated
    if (branch.companyId.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to add inventory to this branch" });
    }

    const inventory = await BranchInventory.findOneAndUpdate(
      { branchId, brandedMedicineId },
      {
        $set: {
          priceToRetailer,
          mrp,
          lastUpdated: new Date(),
        },
        $inc: { quantity },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Inventory updated", inventory });
  } catch (error) {}
};
