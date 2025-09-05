// models/MedicalStore.ts
import mongoose, { Schema } from "mongoose";
const medicalStoreSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    storeName: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    pincode: { type: String },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
medicalStoreSchema.index({ location: "2dsphere" });
export default mongoose.model("MedicalStore", medicalStoreSchema);
