
import { Router } from "express";

import {
  getBeneficiaries,
  createBeneficiary,
  deleteBeneficiary,
} from "../controllers/beneficiaries.controller";

import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getBeneficiaries);
router.post("/", createBeneficiary);
router.delete("/:id", deleteBeneficiary);

export default router;
