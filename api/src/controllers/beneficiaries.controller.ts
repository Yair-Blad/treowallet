
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Beneficiary } from "../entities/Beneficiary";

// Valida el dígito verificador de una CLABE.
const isValidClabe = (clabe: string): boolean => {
  if (!/^\d{18}$/.test(clabe)) {
    return false;
  }

  const weights = [3, 7, 1];
  let sum = 0;

  for (let i = 0; i < 17; i++) {
    const product = Number(clabe[i]) * weights[i % 3];
    sum += product % 10;
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === Number(clabe[17]);
};

// Consultar beneficiarios del usuario.
export const getBeneficiaries = async (
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

    const repository = AppDataSource.getRepository(Beneficiary);

    const beneficiaries = await repository.find({
      where: { user_id: String(req.userId) },
      select: {
        id: true,
        beneficiary_name: true,
        alias: true,
        clabe: true,
        created_at: true,
      },
      order: { created_at: "DESC" },
    });

    return res.json({
      success: true,
      beneficiaries,
    });
  } catch (error) {
    console.error("Error al consultar beneficiarios:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible consultar los beneficiarios",
    });
  }
};

// Registrar beneficiario.
export const createBeneficiary = async (
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

    const beneficiaryName =
      typeof req.body.beneficiary_name === "string"
        ? req.body.beneficiary_name.trim()
        : "";

    const alias =
      typeof req.body.alias === "string"
        ? req.body.alias.trim()
        : "";

    const clabe =
      typeof req.body.clabe === "string"
        ? req.body.clabe.trim()
        : "";

    if (!beneficiaryName || !alias || !clabe) {
      return res.status(400).json({
        success: false,
        message: "Nombre, alias y CLABE son obligatorios",
      });
    }

    if (!isValidClabe(clabe)) {
      return res.status(400).json({
        success: false,
        message: "La CLABE no es válida",
      });
    }

    const repository = AppDataSource.getRepository(Beneficiary);

    const beneficiary = repository.create({
      user_id: String(req.userId),
      beneficiary_name: beneficiaryName,
      alias,
      clabe,
    });

    const savedBeneficiary = await repository.save(beneficiary);

    return res.status(201).json({
      success: true,
      message: "Beneficiario registrado correctamente",
      beneficiary: savedBeneficiary,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Este beneficiario ya está registrado",
      });
    }

    console.error("Error al registrar beneficiario:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible registrar el beneficiario",
    });
  }
};

// Eliminar beneficiario.
export const deleteBeneficiary = async (
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

    const id = req.params.id;

    if (typeof id !== "string" || !/^[1-9]\d*$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: "ID de beneficiario no válido",
      });
    }

    const repository = AppDataSource.getRepository(Beneficiary);

    const result = await repository.delete({
      id,
      user_id: String(req.userId),
    });

    if (!result.affected) {
      return res.status(404).json({
        success: false,
        message: "Beneficiario no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Beneficiario eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar beneficiario:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible eliminar el beneficiario",
    });
  }
};
