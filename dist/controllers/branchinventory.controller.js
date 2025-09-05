import SharedInventory from "../models/branchInventory";
import PharmaBranch from "../models/pharmaBranch";
import PharmaCompany from "../models/pharmaCompany";
import mongoose from "mongoose";
export const addOrUpdateSharedInventory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: Missing user" });
        }
        const userId = req.user._id; // from auth middleware
        const { branchIds, brandedMedicineId, quantity, priceToRetailer, mrp } = req.body;
        if (!Array.isArray(branchIds) || branchIds.length === 0) {
            return res
                .status(400)
                .json({ message: "At least one branchId is required" });
        }
        // ✅ Find the pharma company of this logged-in user
        const company = await PharmaCompany.findOne({ userId });
        if (!company) {
            return res
                .status(404)
                .json({ message: "Pharma company not found for this user" });
        }
        // ✅ Validate that all branches exist and belong to this company
        const branches = await PharmaBranch.find({
            _id: { $in: branchIds },
            companyId: company._id,
        });
        if (branches.length !== branchIds.length) {
            return res
                .status(404)
                .json({ message: "One or more branches not found" });
        }
        // Upsert shared inventory
        const inventory = await SharedInventory.findOneAndUpdate({ brandedMedicineId }, {
            $set: {
                priceToRetailer,
                mrp,
                lastUpdated: new Date(),
            },
            $inc: { quantity },
            $addToSet: { branchIds: { $each: branchIds } }, // add new branches without duplicates
        }, { upsert: true, new: true });
        res
            .status(200)
            .json({ message: "Inventory updated", status: true, data: inventory });
    }
    catch (error) {
        res.status(500).json({
            message: "Error updating inventory",
            error: error.message,
            status: false,
        });
    }
};
export const listInventory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: Missing user" });
        }
        const { role, _id, branchId } = req.user;
        const { page = 1, limit = 10, search = "" } = req.body;
        const skip = (Number(page) - 1) * Number(limit);
        let branchFilter = [];
        if (role === "pharma_company") {
            // Find company and its branches
            const company = await PharmaCompany.findOne({ userId: _id });
            if (!company) {
                return res.status(404).json({ message: "Company not found" });
            }
            const branches = await PharmaBranch.find({ companyId: company._id });
            branchFilter = branches.map((b) => new mongoose.Types.ObjectId(b._id));
        }
        else if (role === "pharma_branch") {
            if (!branchId) {
                return res.status(400).json({ message: "Branch ID missing" });
            }
            branchFilter = [new mongoose.Types.ObjectId(branchId)];
        }
        else {
            return res.status(403).json({ message: "Unauthorized role" });
        }
        // 🔎 Build aggregation pipeline
        const pipeline = [
            { $match: { branchIds: { $in: branchFilter } } },
            {
                $lookup: {
                    from: "brandedmedicines",
                    localField: "brandedMedicineId",
                    foreignField: "_id",
                    as: "medicine",
                },
            },
            { $unwind: "$medicine" },
            {
                $lookup: {
                    from: "pharmabranches",
                    localField: "branchIds",
                    foreignField: "_id",
                    as: "branches",
                },
            },
        ];
        // ✅ Wide search
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "medicine.name": { $regex: search, $options: "i" } },
                        { "branches.branchName": { $regex: search, $options: "i" } },
                        { "branches.city": { $regex: search, $options: "i" } },
                    ],
                },
            });
        }
        // 🔥 Single aggregation with facet
        const result = await SharedInventory.aggregate([
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        ...pipeline,
                        { $skip: skip },
                        { $limit: Number(limit) },
                        {
                            $project: {
                                _id: 1,
                                quantity: 1,
                                priceToRetailer: 1,
                                mrp: 1,
                                lastUpdated: 1,
                                "medicine._id": 1,
                                "medicine.name": 1,
                                "medicine.company": 1,
                                "branches._id": 1,
                                "branches.branchName": 1,
                                "branches.city": 1,
                            },
                        },
                    ],
                },
            },
        ]);
        const total = result[0]?.metadata[0]?.total || 0;
        let inventories = result[0]?.data || [];
        // Filter branches if branch login
        if (role === "pharma_branch" && branchId) {
            inventories = inventories.map((inv) => ({
                ...inv,
                branches: inv.branches.filter((b) => b._id.toString() === String(branchId)),
            }));
        }
        return res.status(200).json({
            message: "Inventory fetched successfully",
            status: true,
            data: inventories,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error fetching inventory",
            error: error.message,
            status: false,
        });
    }
};
export const removeBranchFromInventory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: Missing user" });
        }
        const userId = req.user._id;
        const { branchId, brandedMedicineId } = req.body;
        if (!branchId || !brandedMedicineId) {
            return res
                .status(400)
                .json({ message: "branchId and brandedMedicineId are required" });
        }
        // ✅ Find the pharma company of this user
        const company = await PharmaCompany.findOne({ userId });
        if (!company) {
            return res
                .status(404)
                .json({ message: "Pharma company not found for this user" });
        }
        // ✅ Verify branch belongs to this company
        const branch = await PharmaBranch.findOne({
            _id: branchId,
            companyId: company._id,
        });
        if (!branch) {
            return res
                .status(403)
                .json({ message: "Not authorized to modify this branch" });
        }
        // ✅ Update inventory: pull branchId from array
        const inventory = await SharedInventory.findOneAndUpdate({ brandedMedicineId, branchIds: branchId }, {
            $pull: { branchIds: branchId },
            $set: { lastUpdated: new Date() },
        }, { new: true });
        if (!inventory) {
            return res
                .status(404)
                .json({ message: "Inventory not found for this branch/medicine" });
        }
        // ✅ Optional: if no branches left, remove inventory entry entirely
        if (inventory.branchIds.length === 0) {
            await SharedInventory.deleteOne({ _id: inventory._id });
            return res.status(200).json({
                message: "Branch removed, and inventory deleted as no branches remain",
                status: true,
            });
        }
        res.status(200).json({
            message: "Branch removed from inventory",
            status: true,
            data: inventory,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error removing branch from inventory",
            error: error.message,
            status: false,
        });
    }
};
