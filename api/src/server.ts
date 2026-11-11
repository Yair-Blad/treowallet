
import dotenv from "dotenv";
import app from "./app";
import { pool } from "./config/database";

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await pool.query("SELECT 1");

    console.log("PostgreSQL conectado correctamente");

    app.listen(PORT, () => {
      console.log(`TreoWallet API: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Error al iniciar el backend:", error);
    process.exit(1);
  }
};

startServer();
