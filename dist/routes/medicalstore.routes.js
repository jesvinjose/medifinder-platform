// routes/medicalStore.routes.ts
import express from "express";
import { createMedicalStore } from "../controllers/medicalstore.controller";
import { authenticate } from "../middleware/authenticate.middleware";
const router = express.Router();
router.post("/create_medical_store", authenticate, createMedicalStore);
export default router;
