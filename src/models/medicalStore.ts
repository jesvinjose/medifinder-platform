// models/MedicalStore.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IMedicalStore extends Document {
  userId: mongoose.Types.ObjectId;
  storeName: string;
  licenseNumber: string;
  address?: string;
  city?: string;
  pincode?: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  isActive: boolean;
}

const medicalStoreSchema = new Schema<IMedicalStore>({
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

export default mongoose.model<IMedicalStore>("MedicalStore", medicalStoreSchema);
