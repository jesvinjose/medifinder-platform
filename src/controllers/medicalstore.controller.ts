// controllers/medicalStoreController.ts
import { Request, Response } from "express";
import MedicalStore from "../models/MedicalStore.js";
import User from "../models/User.js";

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
    res
      .status(500)
      .json({
        message: "Error creating store",
        error: err.message,
        status: false,
      });
  }
};
