
import { AppDataSource } from "../config/database";

const run = async () => {
  try {
    await AppDataSource.initialize();

    console.log("Conexión a PostgreSQL establecida.");

    const migrations = await AppDataSource.runMigrations();

    if (migrations.length === 0) {
      console.log("No hay migraciones pendientes.");
    } else {
      console.log("Migraciones ejecutadas:");

      migrations.forEach((migration) => {
        console.log(`- ${migration.name}`);
      });
    }
  } catch (error) {
    console.error("Error al ejecutar migraciones:", error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

run();
