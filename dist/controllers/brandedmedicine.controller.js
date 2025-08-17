import { BrandedMedicine } from "../models/BrandedMedicine.js";
import { GenericMedicine } from "../models/GenericMedicine.js";
import path from "path";
import { importCSV } from "../utils/csvimporter.js";
// Get all branded medicines
export const getAllBrandedMedicines = async (req, res) => {
    try {
        const medicines = await BrandedMedicine.find().populate("generic");
        res.status(200).json({
            message: "All branded medicines found successfully",
            status: true,
            data: medicines,
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ message: "Error fetching branded medicines", error: err });
    }
};
// Get one branded medicine by ID
export const getBrandedMedicineById = async (req, res) => {
    try {
        const medicine = await BrandedMedicine.findById(req.params.id).populate("generic");
        if (!medicine) {
            return res
                .status(404)
                .json({ message: "Branded medicine not found", status: false });
        }
        res.status(200).json({
            status: true,
            message: "Branded medicine found successfully",
            data: medicine,
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ message: "Error fetching branded medicine", error: err });
    }
};
// Create new branded medicine (linked to existing generic)
export const createBrandedMedicine = async (req, res) => {
    try {
        const { name, generic_name, company, packing, price_to_retailer, mrp } = req.body;
        if (!name || !generic_name) {
            return res
                .status(400)
                .json({ message: "Brand name and generic name are required" });
        }
        const generic = await GenericMedicine.findOne({
            product_name: new RegExp(`^${generic_name.trim()}$`, "i"),
        });
        if (!generic) {
            return res.status(404).json({ message: "Generic medicine not found" });
        }
        const newMedicine = new BrandedMedicine({
            name: name.trim(),
            generic: generic._id,
            company: company?.trim(),
            packing: packing?.trim(),
            price_to_retailer: parseFloat(price_to_retailer),
            mrp: parseFloat(mrp),
        });
        await newMedicine.save();
        res.status(201).json({
            data: newMedicine,
            status: true,
            message: "Branded medicine added successfully",
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ message: "Error creating branded medicine", error: err });
    }
};
export const uploadCsvAndSaveToDB = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const filePath = path.resolve("uploads", file.filename);
        await importCSV(filePath, "branded");
        res
            .status(200)
            .json({ message: "CSV processed and DB updated", status: true });
    }
    catch (error) {
        console.error("Upload error:", error);
        res
            .status(500)
            .json({ message: "Error processing CSV", error, status: false });
    }
};
export const searchMedicines = async (req, res) => {
    try {
        const query = req.query.q?.trim();
        const page = parseInt(req.query.page || "1");
        const limit = parseInt(req.query.limit || "10");
        const sortBy = req.query.sortBy || "mrp";
        const sortOrder = req.query.sortOrder || "asc";
        if (!query) {
            return res
                .status(400)
                .json({ status: false, message: "Search query is required" });
        }
        const skip = (page - 1) * limit;
        if (!query) {
            return res
                .status(400)
                .json({ status: false, message: "Search query is required" });
        }
        // First, try finding a branded medicine
        let branded = await BrandedMedicine.findOne({
            name: { $regex: query, $options: "i" },
        }).populate("generic");
        let generic;
        if (branded) {
            generic = branded.generic;
        }
        else {
            // Try finding by generic name
            generic = await GenericMedicine.findOne({
                name: { $regex: query, $options: "i" },
            });
        }
        if (!generic) {
            return res
                .status(404)
                .json({ status: false, message: "Medicine not found" });
        }
        // Get all branded medicines of this generic
        const total = await BrandedMedicine.countDocuments({
            generic: generic._id,
        });
        const brandedList = await BrandedMedicine.find({ generic: generic._id })
            .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
            .skip(skip)
            .limit(limit);
        res.json({
            status: true,
            message: "Results found",
            data: {
                generic,
                branded_medicines: brandedList,
                total,
                page,
                pages: Math.ceil(total / limit),
            },
        });
    }
    catch (err) {
        console.error("Search error:", err);
        res.status(500).json({ status: false, message: "Server error" });
    }
};
