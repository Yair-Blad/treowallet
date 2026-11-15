
import { Router } from "express";
import { getAccounts } from "../controllers/accounts.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateToken, getAccounts);

export default router;
