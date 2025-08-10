// controllers/pharmaCompany.controller.ts
import PharmaCompany from "../models/PharmaCompany";
import { Request, Response } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}
export const createPharmaCompany = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    const userId = req.user._id; // from auth middleware

    const { companyName, gstNumber, contactEmail, contactPhone, address } =
      req.body;

    // Check if user already owns a pharma company
    const existing = await PharmaCompany.findOne({ userId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User already owns a pharma company" });
    }

    const company = await PharmaCompany.create({
      userId,
      companyName,
      gstNumber,
      contactEmail,
      contactPhone,
      address,
    });

    res.status(201).json({ message: "Pharma company created", company });
  } catch (error) {
    res
      .status(500)
      .json({
        message:
          error instanceof Error ? error.message : "Error creating company",
        status: false,
      });
  }
};
