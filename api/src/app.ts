
import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import budgetsRoutes from "./routes/budgets.routes";
import categoriesRoutes from "./routes/categories.routes";
import accountsRoutes from "./routes/accounts.routes";
import beneficiariesRoutes from "./routes/beneficiaries.routes";
import transactionsRoutes from "./routes/transactions.routes";
import swaggerUi from "swagger-ui-express";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const app = express();

const openapiPath = path.resolve(
  process.cwd(),
  "docs",
  "openapi.yaml"
);

const openapiDocument = YAML.parse(
  fs.readFileSync(openapiPath, "utf8")
);

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiDocument)
);

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
app.use("/api/categories", categoriesRoutes);
app.use("/api/accounts", accountsRoutes);
app.use("/api/beneficiaries", beneficiariesRoutes);
app.use("/api/transactions", transactionsRoutes);

export default app;
