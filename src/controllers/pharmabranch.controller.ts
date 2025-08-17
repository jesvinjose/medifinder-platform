// controllers/pharmaBranch.controller.ts
import PharmaBranch from "../models/PharmaBranch.js";
import PharmaCompany from "../models/PharmaCompany.js";
import { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

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

export const createBranchUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }

    const userId = req.user._id; // from auth middleware
    const { name, email, password, branchId } = req.body;

    const existing = await User.findOne({ email, role: "pharma_branch" });
    if (existing)
      return res.status(400).json({
        message: `User with this ${email} already exists for the role:pharma_branch`,
        status: false,
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "pharma_branch",
      branchId,
    });

    res.status(201).json({
      message: "New User for Branch login is registered",
      data: { name: user.name, email: user.email, role: user.role },
      status: true,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Registration failed",
      error: error.message,
      status: false,
    });
  }
};
