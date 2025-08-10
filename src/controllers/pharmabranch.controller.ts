// controllers/pharmaBranch.controller.ts
import PharmaBranch from "../models/PharmaBranch";
import PharmaCompany from "../models/PharmaCompany";
import { Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

export const createPharmaBranch = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    const userId = req.user._id; // from auth middleware

    const { branchName, address, city, pincode, contactPhone, coordinates } =
      req.body;

    // Find the company for this user
    const company = await PharmaCompany.findOne({ userId });
    if (!company) {
      return res
        .status(400)
        .json({ message: "You must create a pharma company first" });
    }

    const branch = await PharmaBranch.create({
      companyId: company._id,
      branchName,
      address,
      city,
      pincode,
      contactPhone,
      location: {
        type: "Point",
        coordinates: coordinates || [0, 0], // [lng, lat]
      },
    });

    res.status(201).json({ message: "Branch created", branch });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Error creating branch for the company",
      status: false,
    });
  }
};
