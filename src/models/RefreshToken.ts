// models/RefreshToken.ts
import mongoose, { Schema } from "mongoose";

const RefreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "7d" }, // auto-deletes after 7 days
});

export default mongoose.model("RefreshToken", RefreshTokenSchema);
