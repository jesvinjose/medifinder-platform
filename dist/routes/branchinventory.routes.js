// routes/branchInventory.routes.ts
import express from "express";
import { addInventory } from "../controllers/branchinventory.controller";
import { authenticate, authorizeRoles, } from "../middleware/authenticate.middleware";
const router = express.Router();
router.post("/add_inventory", authenticate, authorizeRoles(["pharma_company"]), addInventory);
export default router;
