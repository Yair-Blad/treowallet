
import { Router } from "express";
import { getMyProfile } from "../controllers/users.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/me", authenticateToken, getMyProfile);

export default router;
