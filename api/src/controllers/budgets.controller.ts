
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Budget } from "../entities/Budget";
import { Category } from "../entities/Category";
import { Transaction } from "../entities/Transaction";

const validMonth = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-01$/.test(value) &&
  !Number.isNaN(Date.parse(value));

export const getBudgets = async (
  req: Request,
  res: Response
) => {
  try {
    const month =
      req.query.month ??
      new Date().toISOString().slice(0, 7) + "-01";

    if (!validMonth(month)) {
      return res.status(400).json({
        success: false,
        message: "El mes debe tener formato YYYY-MM-01",
      });
    }

    const budgetRepository = AppDataSource.getRepository(Budget);

    const result = await budgetRepository
      .createQueryBuilder("budget")
      .innerJoin("budget.category", "category")
      .leftJoin(
        Transaction,
        "transaction",
        `transaction.user_id = budget.user_id
         AND transaction.category_id = budget.category_id
         AND transaction.transaction_type = 'expense'
         AND transaction.transaction_date >= budget.budget_month
         AND transaction.transaction_date <
             budget.budget_month + INTERVAL '1 month'`
      )
      .select("budget.id", "id")
      .addSelect("budget.amount", "budget_amount")
      .addSelect("budget.budget_month", "budget_month")
      .addSelect("category.id", "category_id")
      .addSelect("category.name", "category")
      .addSelect(
        "COALESCE(SUM(transaction.amount), 0)",
        "spent"
      )
      .addSelect(
        `GREATEST(
          budget.amount - COALESCE(SUM(transaction.amount), 0),
          0
        )`,
        "remaining"
      )
      .where("budget.user_id = :userId", {
        userId: String(req.userId),
      })
      .andWhere("budget.budget_month = :month", { month })
      .groupBy("budget.id")
      .addGroupBy("budget.amount")
      .addGroupBy("budget.budget_month")
      .addGroupBy("category.id")
      .addGroupBy("category.name")
      .orderBy("category.name", "ASC")
      .getRawMany();

    return res.json({
      success: true,
      budgets: result,
    });

  } catch (error) {
    console.error("Error al consultar presupuestos:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudieron consultar los presupuestos",
    });
  }
};

export const createBudget = async (
  req: Request,
  res: Response
) => {
  try {
    const { categoryId, amount, budgetMonth } = req.body;

    if (
      !Number.isInteger(categoryId) ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !validMonth(budgetMonth)
    ) {
      return res.status(400).json({
        success: false,
        message: "Categoría, importe positivo y mes válido son obligatorios",
      });
    }

    const categoryRepository = AppDataSource.getRepository(Category);
    const budgetRepository = AppDataSource.getRepository(Budget);

    const category = await categoryRepository.findOne({
      where: {
        id: String(categoryId),
        category_type: "expense",
      },
    });

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "La categoría no existe o no es de gastos",
      });
    }

    const result = await budgetRepository
      .createQueryBuilder()
      .insert()
      .into(Budget)
      .values({
        user_id: String(req.userId),
        category_id: String(categoryId),
        amount: String(amount),
        budget_month: budgetMonth,
      })
      .orUpdate(
        ["amount"],
        ["user_id", "category_id", "budget_month"]
      )
      .returning("*")
      .execute();

    return res.status(201).json({
      success: true,
      message: "Presupuesto guardado correctamente",
      budget: result.raw[0],
    });

  } catch (error) {
    console.error("Error al guardar presupuesto:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudo guardar el presupuesto",
    });
  }
};

export const updateBudget = async (
  req: Request,
  res: Response
) => {
  try {
    const budgetId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;
    const { amount } = req.body;

    if (
      typeof budgetId !== "string" ||
      !/^\d+$/.test(budgetId) ||
      BigInt(budgetId) <= 0n ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ID o importe inválido",
      });
    }

    const budgetRepository = AppDataSource.getRepository(Budget);

    const result = await budgetRepository
      .createQueryBuilder()
      .update(Budget)
      .set({ amount: String(amount) })
      .where("id = :budgetId", { budgetId })
      .andWhere("user_id = :userId", {
        userId: String(req.userId),
      })
      .returning("*")
      .execute();

    if (result.affected === 0) {
      return res.status(404).json({
        success: false,
        message: "Presupuesto no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Presupuesto actualizado",
      budget: result.raw[0],
    });

  } catch (error) {
    console.error("Error al modificar presupuesto:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudo modificar el presupuesto",
    });
  }
};

export const deleteBudget = async (
  req: Request,
  res: Response
) => {
  try {
    const budgetId = Array.isArray(req.params.id)
    ? req.params.id[0]
    : req.params.id;

    if (
      typeof budgetId !== "string" ||
      !/^\d+$/.test(budgetId) ||
      BigInt(budgetId) <= 0n
    ) {
      return res.status(400).json({
        success: false,
        message: "ID de presupuesto inválido",
      });
    }

    const budgetRepository = AppDataSource.getRepository(Budget);

    const result = await budgetRepository
      .createQueryBuilder()
      .delete()
      .from(Budget)
      .where("id = :budgetId", { budgetId })
      .andWhere("user_id = :userId", {
        userId: String(req.userId),
      })
      .returning(["id"])
      .execute();

    if (result.affected === 0) {
      return res.status(404).json({
        success: false,
        message: "Presupuesto no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Presupuesto eliminado correctamente",
    });

  } catch (error) {
    console.error("Error al eliminar presupuesto:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudo eliminar el presupuesto",
    });
  }
};
