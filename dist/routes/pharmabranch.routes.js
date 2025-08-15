// routes/pharmaBranch.routes.ts
import express from "express";
import { createBranchUser, createPharmaBranch } from "../controllers/pharmabranch.controller";
import { authenticate, authorizeRoles, } from "../middleware/authenticate.middleware";
const router = express.Router();
router.post("/create_pharma_branch", authenticate, authorizeRoles(["pharma_company"]), createPharmaBranch);
router.post("/create_branch_user", authenticate, authorizeRoles(["pharma_company"]), createBranchUser);
export default router;
