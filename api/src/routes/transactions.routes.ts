
import { Router } from "express";

import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  transferToBeneficiary,
  getTransferStatus,
} from "../controllers/transactions.controller";

import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getTransactions);
router.post("/", createTransaction);

router.post("/transfer", transferToBeneficiary);
router.get("/transfer/status", getTransferStatus);

router.delete("/:id", deleteTransaction);

export default router;
