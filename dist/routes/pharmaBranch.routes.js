// routes/pharmaBranch.routes.ts
import express from "express";
import { listBranchOrders } from "../controllers/pharmaBranch.controller";
import { authenticate, authorizeRoles, } from "../middleware/authenticate.middleware";
const router = express.Router();
router.post("/list_branch_orders", authenticate, authorizeRoles(["pharma_branch"]), listBranchOrders);
export default router;
