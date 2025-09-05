import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors"; // ✅ ADD THIS LINE
import genericmedicineRoutes from "./routes/genericMedicine.routes.js";
import brandedmedicineRoutes from "./routes/brandedMedicine.routes.js";
import authRoutes from "./routes/auth.routes.js";
import medicalStoreRoutes from "./routes/medicalStore.routes.js";
import pharmaCompanyRoutes from "./routes/pharmaCompany.routes.js";
import pharmaBranchRoutes from "./routes/pharmaBranch.routes.js";
import branchInventoryRoutes from "./routes/branchInventory.routes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGODB_URI; // Adjust as needed
// ✅ USE CORS
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://med-finder-application-frontend-8do.vercel.app",
    ], // ✅ allow frontend origin
    credentials: true, // optional, useful for cookies
}));
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
