// models/Order.ts
import mongoose, { Schema } from "mongoose";
const OrderItemSchema = new Schema({
    brandedMedicineId: {
        type: Schema.Types.ObjectId,
        ref: "BrandedMedicine",
        required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
});
const OrderSchema = new Schema({
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
}, { timestamps: true });
export default mongoose.model("Order", OrderSchema);
