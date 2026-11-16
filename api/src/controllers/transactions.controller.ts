
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Transaction } from "../entities/Transaction";
import { Account } from "../entities/Account";
import { Category } from "../entities/Category";
import { Beneficiary } from "../entities/Beneficiary";
import { Transfer } from "../entities/Transfer";

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


export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
    }

    const {
      account_id,
      category_id,
      description,
      transaction_type,
      amount,
      transaction_date,
    } = req.body;

    if (
      typeof description !== "string" ||
      !description.trim() ||
      description.length > 255
    ) {
      return res.status(400).json({
        success: false,
        message: "La descripción es obligatoria y no debe superar 255 caracteres",
      });
    }

    if (!["income", "expense"].includes(transaction_type)) {
      return res.status(400).json({
        success: false,
        message: "Tipo de transacción inválido",
      });
    }

    if (
      (typeof amount !== "string" && typeof amount !== "number") ||
      amount === "" ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "El monto debe ser un número mayor a cero",
      });
    }

    if (
      !/^[1-9]\d*$/.test(String(account_id)) ||
      !/^[1-9]\d*$/.test(String(category_id))
    ) {
      return res.status(400).json({
        success: false,
        message: "Cuenta o categoría inválida",
      });
    }

    let parsedDate: Date | undefined;

    if (transaction_date !== undefined) {
      if (!isValidDate(transaction_date)) {
        return res.status(400).json({
          success: false,
          message: "Fecha de transacción inválida",
        });
      }

      parsedDate = new Date(transaction_date);
    }

    const result = await AppDataSource.transaction(async (manager) => {
      // Bloqueamos la cuenta para evitar movimientos concurrentes
      // que utilicen simultáneamente el mismo saldo.
      const accounts = await manager.query(
        `
          SELECT id
          FROM accounts
          WHERE id = $1 AND user_id = $2
          FOR UPDATE
        `,
        [String(account_id), userId]
      );

      if (accounts.length === 0) {
        return {
          status: 404,
          body: {
            success: false,
            message: "Cuenta no encontrada",
          },
        };
      }

      // Verificamos que la categoría exista y corresponda al tipo de movimiento solicitado.
      const category = await manager
        .getRepository(Category)
        .findOne({
          where: {
            id: String(category_id),
            category_type: transaction_type,
          },
        });

      if (!category) {
        return {
          status: 400,
          body: {
            success: false,
            message: "La categoría no existe o no corresponde al tipo de transacción",
          },
        };
      }

      // Los gastos no pueden superar el saldo disponible.
      if (transaction_type === "expense") {
        const balances = await manager.query(
          `
            SELECT
              balance.current_balance::text AS current_balance,
              balance.current_balance >= $3::numeric AS has_sufficient_balance
            FROM (
              SELECT
                a.opening_balance +
                COALESCE(
                  SUM(
                    CASE
                      WHEN t.transaction_type = 'income' THEN t.amount
                      WHEN t.transaction_type = 'expense' THEN -t.amount
                      ELSE 0
                    END
                  ),
                  0
                ) AS current_balance
              FROM accounts a
              LEFT JOIN transactions t
                ON t.account_id = a.id
                AND t.user_id = a.user_id
              WHERE a.id = $1 AND a.user_id = $2
              GROUP BY a.id
            ) balance
          `,
          [String(account_id), userId, String(amount)]
        );

        if (!balances[0]?.has_sufficient_balance) {
          return {
            status: 400,
            body: {
              success: false,
              message: "Saldo insuficiente para realizar este gasto",
              current_balance: balances[0]?.current_balance ?? "0",
            },
          };
        }
      }

      const transaction = manager.getRepository(Transaction).create({
        user_id: String(userId),
        account_id: String(account_id),
        category_id: String(category_id),
        description: description.trim(),
        transaction_type,
        amount: String(amount),
        ...(parsedDate && { transaction_date: parsedDate }),
      });

      const savedTransaction = await manager
        .getRepository(Transaction)
        .save(transaction);

      return {
        status: 201,
        body: {
          success: true,
          message: "Transacción registrada correctamente",
          transaction: savedTransaction,
        },
      };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Error al crear transacción:", error);

    return res.status(500).json({
      success: false,
      message: "Error al registrar la transacción",
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


export const transferToBeneficiary = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.userId ? String(req.userId) : undefined;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "No autorizado",
    });
  }

  const { beneficiary_id, account_id, amount } = req.body;
  const idempotencyKey = req.get("Idempotency-Key");

  // Validar clave de idempotencia.
  if (
    !idempotencyKey ||
    idempotencyKey.length > 100 ||
    idempotencyKey.trim() !== idempotencyKey
  ) {
    return res.status(400).json({
      success: false,
      message: "Se requiere una clave de idempotencia válida",
    });
  }

  // Validar identificadores.
  if (
    !/^[1-9]\d*$/.test(String(beneficiary_id ?? "")) ||
    !/^[1-9]\d*$/.test(String(account_id ?? ""))
  ) {
    return res.status(400).json({
      success: false,
      message: "La cuenta o el beneficiario no son válidos",
    });
  }

  // Validar importe: máximo 12 enteros y 2 decimales.
  const amountString = String(amount ?? "");

  if (!/^(0|[1-9]\d{0,11})(\.\d{1,2})?$/.test(amountString)) {
    return res.status(400).json({
      success: false,
      message: "El importe debe ser un número positivo con máximo 2 decimales",
    });
  }

  const [whole, decimal = ""] = amountString.split(".");

  const amountInCents =
    BigInt(whole) * 100n + BigInt(decimal.padEnd(2, "0"));

  if (amountInCents <= 0n) {
    return res.status(400).json({
      success: false,
      message: "El importe debe ser mayor que cero",
    });
  }

  const normalizedAmount =
  `${amountInCents / 100n}.${(amountInCents % 100n)
    .toString()
    .padStart(2, "0")}`;

  try {
    const result = await AppDataSource.transaction(async (manager) => {
      // Serializar las solicitudes con la misma clave para este usuario.
      await manager.query(
        `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`,
        [`${userId}:${idempotencyKey}`]
      );

      const transferRepository = manager.getRepository(Transfer);
      const transactionRepository = manager.getRepository(Transaction);

      // Comprobar si la solicitud ya fue procesada.
      const existingTransfer = await transferRepository.findOne({
        where: {
          user_id: userId,
          idempotency_key: idempotencyKey,
        },
      });

      if (existingTransfer) {
        const sameRequest =
          existingTransfer.account_id === String(account_id) &&
          existingTransfer.beneficiary_id === String(beneficiary_id) &&
          Number(existingTransfer.amount) === Number(normalizedAmount);

        if (!sameRequest) {
          return {
            status: 409,
            body: {
              success: false,
              message: "La clave de idempotencia ya fue utilizada con otros datos",
            },
          };
        }

        const existingTransaction = await transactionRepository.findOne({
          where: { id: existingTransfer.transaction_id },
        });

        return {
          status: 200,
          body: {
            success: true,
            message: "La transferencia ya había sido registrada",
            transfer: existingTransfer,
            transaction: existingTransaction,
            repeated: true,
          },
        };
      }

      // Bloquear la cuenta para evitar transferencias simultáneas sobre ella.
      const accounts = await manager.query(
        `
          SELECT id
          FROM accounts
          WHERE id = $1 AND user_id = $2
          FOR UPDATE
        `,
        [String(account_id), userId]
      );

      if (accounts.length === 0) {
        return {
          status: 404,
          body: {
            success: false,
            message: "La cuenta no existe",
          },
        };
      }

      // Verificar que el beneficiario pertenezca al usuario.
      const beneficiary = await manager
        .getRepository(Beneficiary)
        .findOne({
          where: {
            id: String(beneficiary_id),
            user_id: userId,
          },
        });

      if (!beneficiary) {
        return {
          status: 404,
          body: {
            success: false,
            message: "El beneficiario no existe",
          },
        };
      }

      // Consultar saldo actual de la cuenta.
      const balances = await manager.query(
        `
        SELECT
          balance.current_balance::text AS current_balance,
          balance.current_balance >= $3::numeric AS has_sufficient_balance
        FROM (
          SELECT
            a.opening_balance +
            COALESCE(
              SUM(
                CASE
                  WHEN t.transaction_type = 'income' THEN t.amount
                  WHEN t.transaction_type = 'expense' THEN -t.amount
                  ELSE 0
                END
              ),
              0
            ) AS current_balance
          FROM accounts a
          LEFT JOIN transactions t
            ON t.account_id = a.id
            AND t.user_id = a.user_id
          WHERE a.id = $1 AND a.user_id = $2
          GROUP BY a.id
        ) balance
        `,
        [String(account_id), userId, normalizedAmount]
      );

      const balanceInCents = BigInt(
        Math.round(Number(balances[0].current_balance) * 100)
      );

      if (!balances[0].has_sufficient_balance) {
        return {
          status: 400,
          body: {
            success: false,
            message: "Saldo insuficiente para realizar la transferencia",
          },
        };
      }

      // Buscar la categoría de transferencias.
      const category = await manager.getRepository(Category).findOne({
        where: {
          name: "Transferencias",
          category_type: "expense",
        },
      });

      if (!category) {
        throw new Error("No existe la categoría Transferencias");
      }

      // Crear el movimiento de salida.
      const transaction = transactionRepository.create({
        user_id: userId,
        account_id: String(account_id),
        category_id: category.id,
        description: `Transferencia a ${beneficiary.beneficiary_name}`,
        transaction_type: "expense",
        amount: normalizedAmount,
        transaction_date: new Date(),
      });

      const savedTransaction = await transactionRepository.save(transaction);

      // Registrar la transferencia asociada al movimiento.
      const transfer = transferRepository.create({
        user_id: userId,
        beneficiary_id: String(beneficiary_id),
        account_id: String(account_id),
        amount: normalizedAmount,
        idempotency_key: idempotencyKey,
        transaction_id: savedTransaction.id,
      });

      const savedTransfer = await transferRepository.save(transfer);

      return {
        status: 201,
        body: {
          success: true,
          message: "Transferencia realizada correctamente",
          transfer: savedTransfer,
          transaction: savedTransaction,
          repeated: false,
        },
      };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Error al realizar transferencia:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible realizar la transferencia",
    });
  }
};


export const getTransferStatus = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = req.userId ? String(req.userId) : undefined;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "No autorizado",
    });
  }

  const idempotencyKey = req.get("Idempotency-Key");

  if (
    !idempotencyKey ||
    idempotencyKey.length > 100 ||
    idempotencyKey.trim() !== idempotencyKey
  ) {
    return res.status(400).json({
      success: false,
      message: "Se requiere una clave de idempotencia válida",
    });
  }

  try {
    const result = await AppDataSource.transaction(async (manager) => {
      // Esperar a que termine cualquier transferencia que use esta clave.
      await manager.query(
        `SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`,
        [`${userId}:${idempotencyKey}`]
      );

      const transferRepository = manager.getRepository(Transfer);
      const transactionRepository = manager.getRepository(Transaction);

      // Buscar exclusivamente una transferencia del usuario autenticado.
      const transfer = await transferRepository.findOne({
        where: {
          user_id: userId,
          idempotency_key: idempotencyKey,
        },
      });

      if (!transfer) {
        return {
          status: 200,
          body: {
            success: true,
            status: "not_found",
            message: "No se encontró una transferencia registrada con esta clave",
          },
        };
      }

      const transaction = await transactionRepository.findOne({
        where: {
          id: transfer.transaction_id,
          user_id: userId,
        },
      });

      return {
        status: 200,
        body: {
          success: true,
          status: "confirmed",
          message: "La transferencia fue registrada correctamente",
          transfer,
          transaction,
        },
      };
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Error al consultar estado de transferencia:", error);

    return res.status(500).json({
      success: false,
      message: "No fue posible consultar el estado de la transferencia",
    });
  }
};
