
import { Request, Response } from "express";
import { pool } from "../config/database";

export const getMyProfile = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         first_name,
         last_name,
         email,
         phone,
         created_at
       FROM users
       WHERE id = $1 AND is_active = TRUE`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Error al consultar perfil:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible consultar el perfil",
    });
  }
};
