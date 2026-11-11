
import { Request, Response } from "express";
import { pool } from "../config/database";

const validMonth = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-01$/.test(value) &&
  !Number.isNaN(Date.parse(value));

export const getBudgets = async (
  req: Request,
  res: Response
) => {
  try {
    const month = req.query.month ?? new Date().toISOString().slice(0, 7) + "-01";

    if (!validMonth(month)) {
      return res.status(400).json({
        success: false,
        message: "El mes debe tener formato YYYY-MM-01",
      });
    }

    const result = await pool.query(
      `
      SELECT
        b.id,
        b.amount AS budget_amount,
        b.budget_month,
        c.id AS category_id,
        c.name AS category,
        COALESCE(SUM(t.amount), 0) AS spent,
        GREATEST(
          b.amount - COALESCE(SUM(t.amount), 0),
          0
        ) AS remaining
      FROM budgets b
      JOIN categories c ON c.id = b.category_id
      LEFT JOIN transactions t
        ON t.user_id = b.user_id
        AND t.category_id = b.category_id
        AND t.transaction_type = 'expense'
        AND t.transaction_date >= b.budget_month
        AND t.transaction_date < b.budget_month + INTERVAL '1 month'
      WHERE b.user_id = $1
        AND b.budget_month = $2::date
      GROUP BY
        b.id, b.amount, b.budget_month,
        c.id, c.name
      ORDER BY c.name
      `,
      [req.userId, month]
    );

    return res.json({
      success: true,
      budgets: result.rows,
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

    const category = await pool.query(
      `SELECT id FROM categories
       WHERE id = $1 AND category_type = 'expense'`,
      [categoryId]
    );

    if (category.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "La categoría no existe o no es de gastos",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO budgets (user_id, category_id, amount, budget_month)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, category_id, budget_month)
      DO UPDATE SET amount = EXCLUDED.amount
      RETURNING *
      `,
      [req.userId, categoryId, amount, budgetMonth]
    );

    return res.status(201).json({
      success: true,
      message: "Presupuesto guardado correctamente",
      budget: result.rows[0],
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
    const budgetId = Number(req.params.id);
    const { amount } = req.body;

    if (
      !Number.isInteger(budgetId) ||
      budgetId <= 0 ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "ID o importe inválido",
      });
    }

    const result = await pool.query(
      `
      UPDATE budgets
      SET amount = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
      `,
      [amount, budgetId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Presupuesto no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Presupuesto actualizado",
      budget: result.rows[0],
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
    const budgetId = Number(req.params.id);

    if (!Number.isInteger(budgetId) || budgetId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID de presupuesto inválido",
      });
    }

    const result = await pool.query(
      `DELETE FROM budgets
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [budgetId, req.userId]
    );

    if (result.rows.length === 0) {
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
