// routes/pharmaBranch.routes.ts
import express from "express";
import { createBranchUser, createPharmaBranch } from "../controllers/pharmabranch.controller.js";
import {
  authenticate,
  authorizeRoles,
} from "../middleware/authenticate.middleware.js";

const router = express.Router();

router.post(
  "/create_pharma_branch",
  authenticate,
  authorizeRoles(["pharma_company"]),
  createPharmaBranch
);

router.post(
  "/create_branch_user",
  authenticate,
  authorizeRoles(["pharma_company"]),
  createBranchUser
)

export default router;
