// controllers/pharmaCompany.controller.ts
import Order from "../models/Order";
import PharmaBranch from "../models/PharmaBranch";
import PharmaCompany from "../models/PharmaCompany";
export const createPharmaCompany = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: Missing user" });
        }
        const userId = req.user._id; // from auth middleware
        const { companyName, gstNumber, contactEmail, contactPhone, address } = req.body;
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
    }
    catch (error) {
        res.status(500).json({
            message: error instanceof Error ? error.message : "Error creating company",
            status: false,
        });
    }
};
export const updatePharmaCompany = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { companyName, gstNumber, contactEmail, contactPhone, address } = req.body;
        const company = await PharmaCompany.findOneAndUpdate({ userId: req.user._id }, { companyName, gstNumber, contactEmail, contactPhone, address }, { new: true });
        if (!company) {
            return res.status(404).json({ message: "Company not found", status: false });
        }
        res.json({ message: "Company updated", company, status: true });
    }
    catch (err) {
        res.status(500).json({ message: "Update failed", error: err.message, status: false });
    }
};
export const getPharmaCompany = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: Missing user", status: false });
        }
        // Find company for this logged-in user
        const company = await PharmaCompany.findOne({ userId: req.user._id });
        if (!company) {
            return res.status(404).json({
                message: "Pharma company not found for this user",
                status: false,
            });
        }
        res.json({
            message: "Pharma company details fetched successfully",
            data: company,
            status: true,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Failed to fetch pharma company",
            error: err.message,
            status: false,
        });
    }
};
export const listCompanyOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized", status: false });
        }
        const company = await PharmaCompany.findOne({ userId: req.user._id });
        if (!company) {
            return res
                .status(404)
                .json({ message: "Pharma company not found", status: false });
        }
        const orders = await Order.find({ companyId: company._id })
            .populate("medicalStoreId", "storeName city")
            .populate("branchId", "branchName city address")
            .populate("items.brandedMedicineId", "name packing");
        res.json({
            message: "Orders fetched successfully",
            data: orders,
            status: true,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: err.message,
            status: false,
        });
    }
};
export const listPharmaBranches = async (req, res) => {
    try {
        if (!req.user) {
            return res
                .status(401)
                .json({ message: "Unauthorized: Missing user", status: false });
        }
        // Find company for this user
        const company = await PharmaCompany.findOne({ userId: req.user._id });
        if (!company) {
            return res
                .status(404)
                .json({ message: "Pharma company not found", status: false });
        }
        // Fetch all branches under this company
        const branches = await PharmaBranch.find({ companyId: company._id });
        res.json({
            message: "Branches fetched successfully",
            data: branches,
            status: true,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Failed to fetch branches",
            error: err.message,
            status: false,
        });
    }
};
