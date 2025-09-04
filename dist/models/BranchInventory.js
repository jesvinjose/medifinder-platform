// models/BranchInventory.ts
import mongoose, { Schema } from "mongoose";
const branchInventorySchema = new Schema({
    branchIds: [
        {
            type: Schema.Types.ObjectId,
            ref: "PharmaBranch",
            required: true,
        },
    ],
    brandedMedicineId: {
        type: Schema.Types.ObjectId,
        ref: "BrandedMedicine",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    priceToRetailer: {
        type: Number,
        required: true,
        min: 0,
    },
    mrp: {
        type: Number,
        required: true,
        min: 0,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
// ✅ new index: ensure unique per medicine + branch combination
branchInventorySchema.index({ brandedMedicineId: 1, branchIds: 1 }, { unique: true });
export default mongoose.model("BranchInventory", branchInventorySchema);
