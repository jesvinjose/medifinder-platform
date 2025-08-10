// models/PharmaCompany.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPharmaCompany extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  gstNumber: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
}

const pharmaCompanySchema = new Schema<IPharmaCompany>({
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

export default mongoose.model<IPharmaCompany>("PharmaCompany", pharmaCompanySchema);
