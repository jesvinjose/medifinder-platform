// routes/medicalStore.routes.ts
import express from "express";
import { addOrUpdateStock, createMedicalStore, listStoreMedicines, createOrder, } from "../controllers/medicalstore.controller";
import { authenticate, authorizeRoles, } from "../middleware/authenticate.middleware";
const router = express.Router();
router.post("/create_medical_store", authenticate, createMedicalStore);
router.post("/add_or_update_stock", authenticate, authorizeRoles(["medical_store"]), addOrUpdateStock);
router.get("/list_medical_store_stocks", authenticate, authorizeRoles(["medical_store"]), listStoreMedicines);
router.post("/create_order", authenticate, authorizeRoles(["medical_store"]), createOrder);
export default router;
