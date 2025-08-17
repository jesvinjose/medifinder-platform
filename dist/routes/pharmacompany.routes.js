// routes/pharmacompany.routes.ts
import express from "express";
import { createPharmaCompany, getPharmaCompany, listBranchUsers, listCompanyOrders, listPharmaBranches, updatePharmaCompany, } from "../controllers/pharmacompany.controller";
import { authenticate, authorizeRoles, } from "../middleware/authenticate.middleware";
const router = express.Router();
router.post("/create_pharma_company", authenticate, authorizeRoles(["pharma_company"]), createPharmaCompany);
router.post("/get_pharma_company", authenticate, authorizeRoles(["pharma_company"]), getPharmaCompany);
router.post("/update_pharma_company", authenticate, authorizeRoles(["pharma_company"]), updatePharmaCompany);
router.post("/list_company_branches", authenticate, authorizeRoles(["pharma_company"]), listPharmaBranches);
router.post("/list_company_orders", authenticate, authorizeRoles(["pharma_company"]), listCompanyOrders);
router.post("/list_branch_users", authenticate, authorizeRoles(["pharma_company"]), listBranchUsers);
export default router;
