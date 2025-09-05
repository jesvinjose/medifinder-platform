// BrandedMedicine.model.ts
import mongoose from "mongoose";
const brandedMedicineSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Crocin"
    generic: { type: mongoose.Schema.Types.ObjectId, ref: "GenericMedicine", required: true },
    company: String, // e.g., "GSK"
    packing: String, // e.g., "10 tablets"
    price_to_retailer: Number,
    mrp: Number,
    source: { type: String, default: "Uploaded CSV" },
    last_updated: { type: Date, default: Date.now },
});
// ✅ Add full-text search index on 'name'
brandedMedicineSchema.index({ name: "text" });
export const BrandedMedicine = mongoose.model("BrandedMedicine", brandedMedicineSchema);
