
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";

export const getAccounts = async (
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

    const userId = String(req.userId);

    const accounts = await AppDataSource.query(
      `
      SELECT
        a.id::text AS id,
        a.account_name,
        a.account_type,
        a.currency,
        a.opening_balance::text AS opening_balance,
        a.created_at,

        COALESCE(
          SUM(
            CASE
              WHEN t.transaction_type = 'income'
              THEN t.amount
              ELSE 0
            END
          ), 0
        )::text AS total_income,

        COALESCE(
          SUM(
            CASE
              WHEN t.transaction_type = 'expense'
              THEN t.amount
              ELSE 0
            END
          ), 0
        )::text AS total_expenses,

        (
          a.opening_balance +
          COALESCE(
            SUM(
              CASE
                WHEN t.transaction_type = 'income'
                THEN t.amount
                WHEN t.transaction_type = 'expense'
                THEN -t.amount
                ELSE 0
              END
            ), 0
          )
        )::text AS current_balance

      FROM accounts a

      LEFT JOIN transactions t
        ON t.account_id = a.id
        AND t.user_id = a.user_id

      WHERE a.user_id = $1

      GROUP BY a.id
      ORDER BY a.created_at ASC
      `,
      [userId]
    );

    return res.json({
      success: true,
      accounts,
    });

  } catch (error) {
    console.error("Error al consultar cuentas:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible consultar las cuentas",
    });
  }
};
