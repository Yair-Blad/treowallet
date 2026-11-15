
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Account } from "../entities/Account";
import { Transaction } from "../entities/Transaction";

export const getDashboard = async (
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

    const accountRepository = AppDataSource.getRepository(Account);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Saldo inicial
    const accountTotals = await accountRepository
      .createQueryBuilder("account")
      .select(
        "COALESCE(SUM(account.opening_balance), 0)",
        "opening_balance"
      )
      .where("account.user_id = :userId", { userId })
      .getRawOne();

    // Ingresos y gastos
    const transactionTotals = await transactionRepository
      .createQueryBuilder("transaction")
      .select(
        `COALESCE(SUM(
          CASE
            WHEN transaction.transaction_type = 'income'
            THEN transaction.amount
            ELSE 0
          END
        ), 0)`,
        "total_income"
      )
      .addSelect(
        `COALESCE(SUM(
          CASE
            WHEN transaction.transaction_type = 'expense'
            THEN transaction.amount
            ELSE 0
          END
        ), 0)`,
        "total_expenses"
      )
      .where("transaction.user_id = :userId", { userId })
      .getRawOne();

    const openingBalance = accountTotals.opening_balance;
    const totalIncome = transactionTotals.total_income;
    const totalExpenses = transactionTotals.total_expenses;

    // Saldo actual
    const [balanceResult] = await AppDataSource.query(
      `SELECT
        CAST($1 AS NUMERIC)
        + CAST($2 AS NUMERIC)
        - CAST($3 AS NUMERIC) AS current_balance`,
      [openingBalance, totalIncome, totalExpenses]
    );

    // Últimos 5 movimientos
    const transactions = await transactionRepository
      .createQueryBuilder("transaction")
      .leftJoin("transaction.category", "category")
      .select("transaction.id", "id")
      .addSelect("transaction.description", "description")
      .addSelect("transaction.transaction_type", "transaction_type")
      .addSelect("transaction.amount", "amount")
      .addSelect("transaction.transaction_date", "transaction_date")
      .addSelect("category.name", "category")
      .where("transaction.user_id = :userId", { userId })
      .orderBy("transaction.transaction_date", "DESC")
      .addOrderBy("transaction.id", "DESC")
      .limit(5)
      .getRawMany();

    return res.json({
      success: true,
      summary: {
        opening_balance: openingBalance,
        total_income: totalIncome,
        total_expenses: totalExpenses,
        current_balance: balanceResult.current_balance,
      },
      recentTransactions: transactions,
    });

  } catch (error) {
    console.error("Error en dashboard:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudo consultar el dashboard",
    });
  }
};
