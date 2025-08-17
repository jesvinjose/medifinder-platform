import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // ✅ ADD THIS LINE
import genericmedicineRoutes from "./routes/genericmedicine.routes.js";
import brandedmedicineRoutes from "./routes/brandedmedicine.routes.js";
import authRoutes from "./routes/auth.routes.js";
import medicalStoreRoutes from "./routes/medicalstore.routes.js";
import pharmaCompanyRoutes from "./routes/pharmacompany.routes.js";
import pharmaBranchRoutes from "./routes/pharmabranch.routes.js";
import branchInventoryRoutes from "./routes/branchinventory.routes.js";

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
app.use("/api/pharmacompany", pharmaCompanyRoutes);
app.use("/api/pharmabranch", pharmaBranchRoutes);
app.use("/api/branchinventory", branchInventoryRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
