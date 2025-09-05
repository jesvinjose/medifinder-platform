// models/PharmaCompany.ts
import mongoose, { Schema } from "mongoose";
const pharmaCompanySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true, // one user per pharma company
    },
    companyName: { type: String, required: true },
    gstNumber: { type: String, required: true, unique: true },
    contactEmail: String,
    contactPhone: String,
    address: String,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
export default mongoose.model("PharmaCompany", pharmaCompanySchema);
