
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Category } from "../entities/Category";

export const getCategories = async (
  req: Request,
  res: Response
) => {
  try {
    const requestedType = req.query.type;

    let categoryType: "income" | "expense" = "expense";

    if (requestedType !== undefined) {
      if (
        typeof requestedType !== "string" ||
        !["income", "expense"].includes(requestedType)
      ) {
        return res.status(400).json({
          success: false,
          message: "Tipo de categoría no válido",
        });
      }

      categoryType = requestedType as "income" | "expense";
    }

    const categoryRepository = AppDataSource.getRepository(Category);

    const categories = await categoryRepository.find({
      where: {
        category_type: categoryType,
      },
      select: {
        id: true,
        name: true,
        category_type: true,
      },
      order: {
        name: "ASC",
      },
    });

    return res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error al consultar categorías:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudieron consultar las categorías",
    });
  }
};
