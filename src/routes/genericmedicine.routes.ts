import express from "express";
import { upload } from "../utils/multer.js"; // ← import multer config
import { uploadCsvAndSaveToDB } from "../controllers/genericmedicine.controller.js";

const router = express.Router();

// Use multer middleware here
router.post("/upload_generic", upload.single("file"), uploadCsvAndSaveToDB);

export default router;
