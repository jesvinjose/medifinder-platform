import mongoose from "mongoose";

const genericMedicineSchema = new mongoose.Schema({
  jan_aushadhi_code: { type: String }, // from "Drug Code"
  name: { type: String, required: true }, // from "Generic Name"
  packing: String, // from "Unit Size"
  mrp: Number, // from "MRP"
  group_name: String, // from "Group Name"
  composition: String, // optional (maybe used in future)
  dosage_form: String, // optional
  strength: String, // optional
  price_to_retailer: Number, // optional
  source: { type: String, default: "Jan Aushadhi" },
  last_updated: { type: Date, default: Date.now },
});


// ✅ Text index for search queries on 'name'
genericMedicineSchema.index({ name: "text" });


export const GenericMedicine = mongoose.model(
  "GenericMedicine",
  genericMedicineSchema
);
