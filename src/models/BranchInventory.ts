// models/BranchInventory.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IBranchInventory extends Document {
  branchId: mongoose.Types.ObjectId;
  brandedMedicineId: mongoose.Types.ObjectId;
  quantity: number;
  priceToRetailer: number;
  mrp: number;
  lastUpdated: Date;
}

const branchInventorySchema = new Schema<IBranchInventory>(
  {
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "PharmaBranch",
      required: true,
    },
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
  },
  { timestamps: true }
);

// Optional: Prevent duplicate entries for the same medicine in a branch
branchInventorySchema.index({ branchId: 1, brandedMedicineId: 1 }, { unique: true });

export default mongoose.model<IBranchInventory>("BranchInventory", branchInventorySchema);
