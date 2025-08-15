// models/User.ts
import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: [
            "user",
            "doctor",
            "pharma_company",
            "medical_store",
            "admin",
            "delivery_partner",
            "pharma_branch",
        ],
        default: "user",
    },
    branchId: {
        type: Schema.Types.ObjectId,
        ref: "PharmaBranch",
        required: function () {
            return this.role === "pharma_branch";
        },
    },
}, { timestamps: true });
export default mongoose.model("User", userSchema);
