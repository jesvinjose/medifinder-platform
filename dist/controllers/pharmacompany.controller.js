// controllers/pharmaCompany.controller.ts
import Order from "../models/Order";
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
