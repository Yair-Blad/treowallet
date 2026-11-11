
import { Router } from "express";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} from "../controllers/budgets.controller";

import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateToken, getBudgets);
router.post("/", authenticateToken, createBudget);
router.put("/:id", authenticateToken, updateBudget);
router.delete("/:id", authenticateToken, deleteBudget);

export default router;
