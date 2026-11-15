
import { useEffect, useState } from "react";
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getCategories,
  getAccounts,
  type Transaction,
  type Category,
  type Account,
} from "./services/api";

import "./Transactions.css";

interface TransactionsProps {
  token: string;
}

type TransactionType = "income" | "expense";
type TransactionFilter = "all" | TransactionType;

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(amount));

const Transactions = ({ token }: TransactionsProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [type, setType] = useState<TransactionType>("expense");
  const [filter, setFilter] = useState<TransactionFilter>("all");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [transactionDate, setTransactionDate] = useState(getToday());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadTransactions = async () => {
    try {
      const selectedType =
        filter === "all" ? undefined : filter;

      const data = await getTransactions(token, selectedType);
      setTransactions(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron consultar los movimientos"
      );
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError("");

        const [transactionData, accountData] = await Promise.all([
          getTransactions(token),
          getAccounts(token),
        ]);

        setTransactions(transactionData);
        setAccounts(accountData.accounts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los datos"
        );
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [token]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setError("");
        setCategories([]);
        setCategoryId("");

        const data = await getCategories(token, type);
        setCategories(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron consultar las categorías"
        );
      }
    };

    loadCategories();
  }, [token, type]);

  useEffect(() => {
    if (filter === "all") {
      loadTransactions();
      return;
    }

    loadTransactions();
  }, [filter, token]);

  const handleTypeChange = (
    newType: TransactionType
  ) => {
    setType(newType);
    setCategoryId("");
  };

  const handleCreate = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const numericAmount = Number(amount);

    if (!description.trim()) {
      setError("Ingresa una descripción");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Ingresa un monto válido");
      return;
    }

    if (!accountId || !categoryId || !transactionDate) {
      setError("Completa todos los campos");
      return;
    }

    try {
      setSaving(true);

      await createTransaction(token, {
        description: description.trim(),
        transaction_type: type,
        amount: numericAmount,
        account_id: accountId,
        category_id: categoryId,
        transaction_date: transactionDate,
      });

      setDescription("");
      setAmount("");
      setCategoryId("");
      setTransactionDate(getToday());

      await loadTransactions();

      setMessage("Movimiento registrado correctamente");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el movimiento"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "¿Estás seguro de eliminar este movimiento?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await deleteTransaction(token, id);

      setTransactions((previous) =>
        previous.filter((transaction) => transaction.id !== id)
      );

      setMessage("Movimiento eliminado correctamente");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el movimiento"
      );
    }
  };

  const displayedTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    return transaction.transaction_type === filter;
  });

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <div>
          <h1>Transacciones</h1>
          <p>Administra tus ingresos y gastos.</p>
        </div>
      </div>

      <div className="transaction-form-card">
        <h2>Registrar movimiento</h2>

        <div className="transaction-type-selector">
          <button
            type="button"
            className={type === "expense" ? "active expense" : ""}
            onClick={() => handleTypeChange("expense")}
          >
            Gasto
          </button>

          <button
            type="button"
            className={type === "income" ? "active income" : ""}
            onClick={() => handleTypeChange("income")}
          >
            Ingreso
          </button>
        </div>

        <form onSubmit={handleCreate}>
          <div className="transaction-form-grid">
            <div className="transaction-field">
              <label>Descripción</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Compra de supermercado"
                maxLength={255}
                required
              />
            </div>

            <div className="transaction-field">
              <label>Monto (MXN)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="transaction-field">
              <label>Cuenta</label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                required
              >
                <option value="">Selecciona una cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="transaction-field">
              <label>Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="transaction-field">
              <label>Fecha</label>
              <input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="transaction-alert error">
              {error}
            </div>
          )}

          {message && (
            <div className="transaction-alert success">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="transaction-submit"
            disabled={saving || accounts.length === 0 || categories.length === 0}
          >
            {saving ? "Guardando..." : "Registrar movimiento"}
          </button>

          {accounts.length === 0 && (
            <p className="transaction-hint">
              Primero debes registrar una cuenta para crear movimientos.
            </p>
          )}

          {categories.length === 0 && (
            <p className="transaction-hint">
              No hay categorías disponibles para este tipo de movimiento.
            </p>
          )}
        </form>
      </div>

      <div className="transaction-list-card">
        <div className="transaction-list-header">
          <div>
            <h2>Historial de movimientos</h2>
            <p>{displayedTransactions.length} movimientos</p>
          </div>

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as TransactionFilter)
            }
            aria-label="Filtrar movimientos"
          >
            <option value="all">Todos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>
        </div>

        {loading ? (
          <p className="transaction-empty">Cargando movimientos...</p>
        ) : displayedTransactions.length === 0 ? (
          <p className="transaction-empty">
            No hay movimientos registrados.
          </p>
        ) : (
          <div className="transaction-table-wrapper">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Cuenta</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {displayedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      <div className="transaction-description">
                        {transaction.description}
                      </div>
                      <span
                        className={`transaction-badge ${
                          transaction.transaction_type
                        }`}
                      >
                        {transaction.transaction_type === "income"
                          ? "Ingreso"
                          : "Gasto"}
                      </span>
                    </td>

                    <td>{transaction.category || "Sin categoría"}</td>
                    <td>{transaction.account || "Sin cuenta"}</td>

                    <td>
                      {new Date(
                        transaction.transaction_date
                      ).toLocaleDateString("es-MX")}
                    </td>

                    <td
                      className={
                        transaction.transaction_type === "income"
                          ? "transaction-income"
                          : "transaction-expense"
                      }
                    >
                      {transaction.transaction_type === "income"
                        ? "+"
                        : "-"}
                      {formatCurrency(transaction.amount)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="transaction-delete"
                        onClick={() => handleDelete(transaction.id)}
                        title="Eliminar movimiento"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
