
import app from "./app";
import { AppDataSource } from "./config/database";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await AppDataSource.initialize();

    console.log("PostgreSQL conectado correctamente mediante TypeORM");

    app.listen(PORT, () => {
      console.log(`TreoWallet API: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el backend:", error);
    process.exit(1);
  }
};

startServer();
