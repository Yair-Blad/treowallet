
import { Router } from "express";

import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from "../controllers/transactions.controller";

import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getTransactions);
router.post("/", createTransaction);
router.delete("/:id", deleteTransaction);

export default router;
