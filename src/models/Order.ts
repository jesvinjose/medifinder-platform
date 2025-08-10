// models/Order.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export type OrderStatus =
  | "PENDING" // created by medical store, waiting for pharma
  | "APPROVED" // approved by pharma (inventory reserved)
  | "REJECTED" // rejected by pharma
  | "ASSIGNED" // delivery partner assigned
  | "PICKED_UP" // partner picked up from branch
  | "IN_TRANSIT" // on the way
  | "DELIVERED" // delivered to medical store
  | "CANCELLED"; // cancelled by either side

export interface IOrderItem {
  brandedMedicineId: Types.ObjectId;
  quantity: number;
  price: number; // price per unit at time of order
}

export interface IOrder extends Document {
  medicalStoreId: Types.ObjectId; // MedicalStore that placed order
  branchId: Types.ObjectId; // PharmaBranch being ordered from
  companyId: Types.ObjectId; // PharmaCompany (denormalized)
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  requestedAt: Date;
  approvedAt?: Date;
  assignedTo?: Types.ObjectId; // delivery partner user id
  assignedAt?: Date;
  pickedAt?: Date;
  deliveredAt?: Date;
  notes?: string;
  tracking?: {
    lat?: number;
    lng?: number;
    lastUpdated?: Date;
  };
  proofOfDeliveryUrl?: string;
}

const OrderItemSchema = new Schema<IOrderItem>({
  brandedMedicineId: {
    type: Schema.Types.ObjectId,
    ref: "BrandedMedicine",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const OrderSchema = new Schema<IOrder>(
  {
    medicalStoreId: {
      type: Schema.Types.ObjectId,
      ref: "MedicalStore",
      required: true,
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: "PharmaBranch",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "PharmaCompany",
      required: true,
    },
    items: { type: [OrderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "ASSIGNED",
        "PICKED_UP",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    assignedAt: Date,
    pickedAt: Date,
    deliveredAt: Date,
    notes: String,
    tracking: {
      lat: Number,
      lng: Number,
      lastUpdated: Date,
    },
    proofOfDeliveryUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
