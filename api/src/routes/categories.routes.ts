
import { Router } from "express";
import { getCategories } from "../controllers/categories.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateToken, getCategories);

export default router;
