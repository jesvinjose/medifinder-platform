// models/StoreMedicineStock.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IStoreMedicineStock extends Document {
  storeId: mongoose.Types.ObjectId;
  brandedMedicineId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  lastUpdated: Date;
}

const storeMedicineStockSchema = new Schema<IStoreMedicineStock>(
  {
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalStore",
      required: true,
    },
    brandedMedicineId: {
      type: Schema.Types.ObjectId,
      ref: "BrandedMedicine",
      required: true,
    },
    quantity: { type: Number, default: 0 },
    price: { type: Number }, // store's selling price
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent same medicine being listed twice by same store
storeMedicineStockSchema.index(
  { storeId: 1, brandedMedicineId: 1 },
  { unique: true }
);

export default mongoose.model<IStoreMedicineStock>(
  "StoreMedicineStock",
  storeMedicineStockSchema
);
