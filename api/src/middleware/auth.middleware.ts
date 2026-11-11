import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface JwtPayload {
  userId: number;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token no proporcionado",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error("JWT_SECRET no está configurado");
    return res.status(500).json({
      success: false,
      message: "Error de configuración del servidor",
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.userId = Number(decoded.userId);

    next();
  } catch (error) {
    console.error("Error al validar JWT:", error);

    return res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
};