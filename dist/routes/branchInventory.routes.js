// routes/branchInventory.routes.ts
import express from "express";
import { addOrUpdateSharedInventory, listInventory, removeBranchFromInventory, } from "../controllers/branchInventory.controller.js";
import { authenticate, authorizeRoles, } from "../middleware/authenticate.middleware.js";
const router = express.Router();
router.post("/add_or_update_shared_inventory", authenticate, authorizeRoles(["pharma_company"]), addOrUpdateSharedInventory);
router.post("/list_inventory", authenticate, authorizeRoles(["pharma_company", "pharma_branch"]), listInventory);
router.post("/remove_branch_from_inventory", authenticate, authorizeRoles(["pharma_company"]), removeBranchFromInventory);
export default router;
