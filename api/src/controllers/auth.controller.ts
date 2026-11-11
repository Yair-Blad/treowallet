
import { Request, Response } from "express";
import { pool } from "../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Correo y contraseña son obligatorios",
      });
    }

    const result = await pool.query(
      `SELECT id, first_name, last_name, email,
              password_hash, is_active
       FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const user = result.rows[0];

    if (!user.is_active || !user.password_hash) {
      return res.status(401).json({
        success: false,
        message: "Usuario inactivo o sin contraseña configurada",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
    throw new Error("JWT_SECRET no está configurado");
    }

    const token = jwt.sign(
    { userId: user.id },
    secret,
    { expiresIn: "8h" }
    );

    return res.status(200).json({
      success: true,
      message: "Inicio de sesión correcto",
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
      success: false,
      message: "Error interno al iniciar sesión",
    });
  }
};
