// models/PharmaBranch.ts
import mongoose, { Schema } from "mongoose";
const pharmaBranchSchema = new Schema({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "PharmaCompany",
        required: true,
    },
    branchName: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    pincode: { type: String },
    contactPhone: { type: String },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0], // Longitude, Latitude
        },
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
// Add geospatial index
pharmaBranchSchema.index({ location: "2dsphere" });
export default mongoose.model("PharmaBranch", pharmaBranchSchema);
