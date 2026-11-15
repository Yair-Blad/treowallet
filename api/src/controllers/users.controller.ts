
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

export const getMyProfile = async (
  req: Request,
  res: Response
) => {
  try {
    if (req.userId === undefined) {
      return res.status(401).json({
        success: false,
        message: "No autorizado",
      });
    }

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: {
        id: String(req.userId),
        is_active: true,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error("Error al consultar perfil:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible consultar el perfil",
    });
  }
};
