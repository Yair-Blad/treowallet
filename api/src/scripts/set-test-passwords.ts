
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { pool } from "../config/database";

dotenv.config();

const setTestPasswords = async () => {
  const password = "TreoDemo2026!";
  const hash = await bcrypt.hash(password, 12);

  try {
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1
       WHERE email LIKE '%@treowallet.test'
       RETURNING id, email`,
      [hash]
    );

    console.log("Usuarios actualizados:", result.rowCount);
    console.table(result.rows);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
};

setTestPasswords();
