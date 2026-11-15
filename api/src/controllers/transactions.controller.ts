
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Transaction } from "../entities/Transaction";
import { Account } from "../entities/Account";
import { Category } from "../entities/Category";

const isValidDate = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value;
};

export const getTransactions = async (
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
    const { type, startDate, endDate } = req.query;

    if (
      type !== undefined &&
      type !== "income" &&
      type !== "expense"
    ) {
      return res.status(400).json({
        success: false,
        message: "Tipo de movimiento no válido",
      });
    }

    if (
      startDate !== undefined &&
      !isValidDate(startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Fecha inicial no válida",
      });
    }

    if (
      endDate !== undefined &&
      !isValidDate(endDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Fecha final no válida",
      });
    }

    if (
      typeof startDate === "string" &&
      typeof endDate === "string" &&
      startDate > endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "El rango de fechas no es válido",
      });
    }

    const repository = AppDataSource.getRepository(Transaction);

    const query = repository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.category", "category")
      .leftJoinAndSelect("transaction.account", "account")
      .where("transaction.user_id = :userId", { userId });

    if (type) {
      query.andWhere("transaction.transaction_type = :type", { type });
    }

    if (startDate) {
      query.andWhere(
        "transaction.transaction_date >= :startDate",
        { startDate }
      );
    }

    if (endDate) {
      query.andWhere(
        "transaction.transaction_date < CAST(:endDate AS date) + INTERVAL '1 day'",
        { endDate }
      );
    }

    const transactions = await query
      .orderBy("transaction.transaction_date", "DESC")
      .getMany();

    return res.json({
      success: true,
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        description: transaction.description,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        transaction_date: transaction.transaction_date,
        category: transaction.category?.name ?? null,
        category_id: transaction.category_id,
        account: transaction.account?.account_name ?? null,
        account_id: transaction.account_id,
      })),
    });
  } catch (error) {
    console.error("Error al consultar movimientos:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible consultar los movimientos",
    });
  }
};

export const createTransaction = async (
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

    const {
      description,
      transaction_type,
      amount,
      account_id,
      category_id,
      transaction_date,
    } = req.body;

    if (
      typeof description !== "string" ||
      !description.trim() ||
      description.trim().length > 255
    ) {
      return res.status(400).json({
        success: false,
        message: "La descripción es obligatoria y debe tener máximo 255 caracteres",
      });
    }

    if (
      transaction_type !== "income" &&
      transaction_type !== "expense"
    ) {
      return res.status(400).json({
        success: false,
        message: "Tipo de movimiento no válido",
      });
    }

    const numericAmount = Number(amount);

    if (
      amount === null ||
      amount === undefined ||
      amount === "" ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "El importe debe ser mayor que cero",
      });
    }

    if (
      typeof account_id !== "string" ||
      !/^[1-9]\d*$/.test(account_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Cuenta no válida",
      });
    }

    if (
      typeof category_id !== "string" ||
      !/^[1-9]\d*$/.test(category_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Categoría no válida",
      });
    }

    let movementDate = new Date();

    if (transaction_date !== undefined) {
      if (
        typeof transaction_date !== "string" ||
        Number.isNaN(Date.parse(transaction_date))
      ) {
        return res.status(400).json({
          success: false,
          message: "Fecha de movimiento no válida",
        });
      }

      movementDate = new Date(transaction_date);
    }

    const accountRepository = AppDataSource.getRepository(Account);
    const categoryRepository = AppDataSource.getRepository(Category);

    const account = await accountRepository.findOne({
      where: {
        id: account_id,
        user_id: userId,
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "La cuenta no existe o no te pertenece",
      });
    }

    const category = await categoryRepository.findOne({
      where: {
        id: category_id,
        category_type: transaction_type,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "La categoría no existe o no corresponde al movimiento",
      });
    }

    const repository = AppDataSource.getRepository(Transaction);

    const transaction = repository.create({
      user_id: userId,
      account_id,
      category_id,
      description: description.trim(),
      transaction_type,
      amount: String(amount),
      transaction_date: movementDate,
    });

    const savedTransaction = await repository.save(transaction);

    return res.status(201).json({
      success: true,
      message: "Movimiento registrado correctamente",
      transaction: {
        id: savedTransaction.id,
        description: savedTransaction.description,
        transaction_type: savedTransaction.transaction_type,
        amount: savedTransaction.amount,
        transaction_date: savedTransaction.transaction_date,
        category: category.name,
        category_id: category.id,
        account: account.account_name,
        account_id: account.id,
      },
    });
  } catch (error) {
    console.error("Error al registrar movimiento:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible registrar el movimiento",
    });
  }
};

export const deleteTransaction = async (
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
        message: "ID de movimiento no válido",
      });
    }

    const repository = AppDataSource.getRepository(Transaction);

    const result = await repository.delete({
      id,
      user_id: String(req.userId),
    });

    if (!result.affected) {
      return res.status(404).json({
        success: false,
        message: "Movimiento no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Movimiento eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar movimiento:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible eliminar el movimiento",
    });
  }
};
