import express from "express";
import { upload } from "../utils/multer"; // ← import multer config
import { uploadCsvAndSaveToDB } from "../controllers/genericMedicine.controller";

const router = express.Router();

// Use multer middleware here
router.post("/upload_generic", upload.single("file"), uploadCsvAndSaveToDB);

export default router;
