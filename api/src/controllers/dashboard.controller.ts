
import { Request, Response } from "express";
import { pool } from "../config/database";

export const getDashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.userId;

    const summary = await pool.query(
      `
      WITH account_totals AS (
        SELECT COALESCE(SUM(opening_balance), 0) AS opening_balance
        FROM accounts
        WHERE user_id = $1
      ),
      transaction_totals AS (
        SELECT
          COALESCE(SUM(
            CASE WHEN transaction_type = 'income'
            THEN amount ELSE 0 END
          ), 0) AS total_income,
          COALESCE(SUM(
            CASE WHEN transaction_type = 'expense'
            THEN amount ELSE 0 END
          ), 0) AS total_expenses
        FROM transactions
        WHERE user_id = $1
      )
      SELECT
        account_totals.opening_balance,
        transaction_totals.total_income,
        transaction_totals.total_expenses,
        (
          account_totals.opening_balance
          + transaction_totals.total_income
          - transaction_totals.total_expenses
        ) AS current_balance
      FROM account_totals, transaction_totals;
      `,
      [userId]
    );

    const transactions = await pool.query(
      `
      SELECT
        t.id,
        t.description,
        t.transaction_type,
        t.amount,
        t.transaction_date,
        c.name AS category
      FROM transactions t
      LEFT JOIN categories c ON c.id = t.category_id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT 5
      `,
      [userId]
    );

    return res.json({
      success: true,
      summary: summary.rows[0],
      recentTransactions: transactions.rows,
    });

  } catch (error) {
    console.error("Error en dashboard:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudo consultar el dashboard",
    });
  }
};
