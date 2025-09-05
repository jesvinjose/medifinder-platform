// src/controllers/medicine.controller.ts
import path from "path";
import { importCSV } from "../utils/csvImporter.js";
export const uploadCsvAndSaveToDB = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const filePath = path.resolve("uploads", file.filename);
        await importCSV(filePath, "generic");
        res
            .status(200)
            .json({ message: "CSV processed and DB updated", status: true });
    }
    catch (error) {
        console.error("Upload error:", error);
        res
            .status(500)
            .json({ message: "Error processing CSV", error, status: false });
    }
};
