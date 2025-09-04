import SharedInventory from "../models/BranchInventory.js";
import PharmaBranch from "../models/PharmaBranch.js";

export const addOrUpdateSharedInventory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: Missing user" });
    }
    const userId = req.user._id; // from auth middleware
    const { branchIds, brandedMedicineId, quantity, priceToRetailer, mrp } =
      req.body;
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

    for (const branch of branches) {
      // @ts-ignore populated
      if (company.userId.toString() !== userId.toString()) {
        return res.status(403).json({
          message: `Not authorized to add inventory to branch ${branch._id}`,
        });
      }
    }
    // Upsert shared inventory
    const inventory = await SharedInventory.findOneAndUpdate(
      { companyId: company._id, brandedMedicineId },
      {
        $set: {
          priceToRetailer,
          mrp,
          lastUpdated: new Date(),
        },
        $inc: { quantity },
        $addToSet: { branches: { $each: branchIds } }, // add new branches without duplicates
      },
      { upsert: true, new: true }
    );

    res
      .status(200)
      .json({ message: "Inventory updated", status: true, data: inventory });
  } catch (error) {
    res.status(500).json({
      message: "Error updating inventory",
      error: error.message,
      status: false,
    });
  }
};

