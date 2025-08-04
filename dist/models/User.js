// models/User.ts
import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["user", "doctor", "pharma_company", "medical_store", "admin"],
        default: "user",
    },
}, { timestamps: true });
export default mongoose.model("User", userSchema);
