import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // ✅ ADD THIS LINE
import genericmedicineRoutes from "./routes/genericmedicine.routes";
import brandedmedicineRoutes from "./routes/brandedmedicine.routes";
import authRoutes from "./routes/auth.routes";
import medicalStoreRoutes from "./routes/medicalstore.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT!;
const MONGO_URI = process.env.MONGODB_URI!; // Adjust as needed

// ✅ USE CORS
app.use(
  cors({
    origin: "http://localhost:3000", // ✅ allow frontend origin
    credentials: true, // optional, useful for cookies
  })
);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(express.json());
app.use("/api/genericmedicine", genericmedicineRoutes);
app.use("/api/brandedmedicine", brandedmedicineRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/medicalstore", medicalStoreRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
