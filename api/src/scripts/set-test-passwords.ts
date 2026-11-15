
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database";

const setTestPasswords = async () => {
  try {
    await AppDataSource.initialize();

    const password = "TreoDemo2026!";
    const hash = await bcrypt.hash(password, 12);

    const result = await AppDataSource.query(
      `UPDATE users
       SET password_hash = $1
       WHERE email LIKE '%@treowallet.test'
       RETURNING id, email`,
      [hash]
    );

    console.log("Usuarios actualizados:", result.length);
    console.table(result);

  } catch (error) {
    console.error("Error:", error);
    process.exitCode = 1;
  } finally {
    if(AppDataSource.isInitialized){
      await AppDataSource.destroy();
    }
  }
};

setTestPasswords();
