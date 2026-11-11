
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import budgetsRoutes from "./routes/budgets.routes";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "TreoWallet API",
    version: "1.0.0",
    status: "running",
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "TreoWallet API está activa",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/budgets", budgetsRoutes);

export default app;
