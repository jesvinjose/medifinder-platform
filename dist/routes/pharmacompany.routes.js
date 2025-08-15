// routes/pharmacompany.routes.ts
import express from "express";
import { createPharmaCompany, listCompanyOrders, } from "../controllers/pharmacompany.controller";
import { authenticate, authorizeRoles, } from "../middleware/authenticate.middleware";
const router = express.Router();
router.post("/create_pharma_company", authenticate, authorizeRoles(["pharma_company"]), createPharmaCompany);
router.post("/list_company_orders", authenticate, authorizeRoles(["pharma_company"]), listCompanyOrders);
export default router;
