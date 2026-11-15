
import { useEffect, useState } from "react";
import "../styles/Budgets.css";

import {
  getBudgets,
  getCategories,
  createBudget,
  updateBudget,
  deleteBudget,
  type Budget,
  type Category,
} from "../services/api";

interface BudgetsProps {
  token: string;
}

const formatCurrency = (value: number | string) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number.isFinite(amount) ? amount : 0);
};

const getCurrentMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
};

function Budgets({ token }: BudgetsProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [month, setMonth] = useState(getCurrentMonth());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const apiMonth = `${month}-01`;

      const [budgetData, categoryData] = await Promise.all([
        getBudgets(token, apiMonth),
        getCategories(token),
      ]);

      setBudgets(budgetData);
      setCategories(categoryData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron consultar los presupuestos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, month]);

  const totalBudget = budgets.reduce(
    (total, budget) => total + Number(budget.budget_amount),
    0
  );

  const totalSpent = budgets.reduce(
    (total, budget) => total + Number(budget.spent),
    0
  );

  const totalRemaining = budgets.reduce(
    (total, budget) => total + Number(budget.remaining),
    0
  );

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setCategoryId("");
    setAmount("");
  };

  const handleCreate = () => {
    setEditingId(null);
    setCategoryId("");
    setAmount("");
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setAmount(String(budget.budget_amount));
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Ingresa un importe válido mayor que cero.");
      return;
    }

    if (!editingId && !categoryId) {
      setError("Selecciona una categoría.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editingId) {
        await updateBudget(token, editingId, numericAmount);
        setSuccess("Presupuesto actualizado correctamente.");
      } else {
        await createBudget(
          token,
          categoryId,
          numericAmount,
          `${month}-01`
        );
        setSuccess("Presupuesto creado correctamente.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar el presupuesto"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (budgetId: string) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este presupuesto?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteBudget(token, budgetId);

      setSuccess("Presupuesto eliminado correctamente.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el presupuesto"
      );
    }
  };

  const formatMonth = (value: string) => {
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);

    return new Intl.DateTimeFormat("es-MX", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <section className="budgets-page">
      <div className="budgets-heading">
        <div>
          <h2>Mis presupuestos</h2>
          <p>Organiza y controla tus gastos mensuales.</p>
        </div>

        <button
          className="budget-primary-button"
          type="button"
          onClick={handleCreate}
        >
          + Nuevo presupuesto
        </button>
      </div>

      <div className="budgets-toolbar">
        <label htmlFor="budget-month">Periodo</label>
        <input
          id="budget-month"
          type="month"
          value={month}
          onChange={(event) => {
            resetForm();
            setSuccess("");
            setMonth(event.target.value);
          }}
        />
      </div>

      {error && <p className="budget-message error">{error}</p>}
      {success && <p className="budget-message success">{success}</p>}

      <div className="budget-summary">
        <article className="budget-summary-card">
          <span>Presupuesto asignado</span>
          <strong>{formatCurrency(totalBudget)}</strong>
        </article>

        <article className="budget-summary-card">
          <span>Gasto acumulado</span>
          <strong className="budget-spent">
            {formatCurrency(totalSpent)}
          </strong>
        </article>

        <article className="budget-summary-card">
          <span>Disponible</span>
          <strong className="budget-remaining">
            {formatCurrency(totalRemaining)}
          </strong>
        </article>
      </div>

      {showForm && (
        <form className="budget-form" onSubmit={handleSubmit}>
          <div className="budget-form-heading">
            <h3>
              {editingId ? "Editar presupuesto" : "Nuevo presupuesto"}
            </h3>

            <button
              type="button"
              className="budget-close-button"
              onClick={resetForm}
              aria-label="Cerrar formulario"
            >
              ×
            </button>
          </div>

          {!editingId && (
            <div className="budget-field">
              <label htmlFor="budget-category">Categoría de gasto</label>

              <select
                id="budget-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
              >
                <option value="">Selecciona una categoría</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {categories.length === 0 && (
                <small>No hay categorías de gastos disponibles.</small>
              )}
            </div>
          )}

          <div className="budget-field">
            <label htmlFor="budget-amount">Importe mensual (MXN)</label>

            <input
              id="budget-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Ej. 2500"
              required
            />
          </div>

          <div className="budget-form-actions">
            <button
              type="button"
              className="budget-secondary-button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="budget-primary-button"
              disabled={
                saving ||
                (!editingId && categories.length === 0)
              }
            >
              {saving ? "Guardando..." : "Guardar presupuesto"}
            </button>
          </div>
        </form>
      )}

      <div className="budget-list-card">
        <div className="budget-list-heading">
          <div>
            <h3>Presupuestos de {formatMonth(`${month}-01`)}</h3>
            <p>Control de gastos por categoría</p>
          </div>

          <span>{budgets.length} presupuestos</span>
        </div>

        {loading ? (
          <p className="budget-empty">Cargando presupuestos...</p>
        ) : budgets.length === 0 ? (
          <div className="budget-empty">
            <span>◎</span>
            <strong>No hay presupuestos registrados</strong>
            <p>Crea tu primer presupuesto para comenzar a controlar tus gastos.</p>
          </div>
        ) : (
          <div className="budget-table-wrapper">
            <table className="budget-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Asignado</th>
                  <th>Gastado</th>
                  <th>Disponible</th>
                  <th>Progreso</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {budgets.map((budget) => {
                  const assigned = Number(budget.budget_amount);
                  const spent = Number(budget.spent);

                  const percentage =
                    assigned > 0
                      ? Math.min((spent / assigned) * 100, 100)
                      : 0;

                  const exceeded = spent > assigned;

                  return (
                    <tr key={budget.id}>
                      <td>
                        <strong>{budget.category}</strong>
                      </td>

                      <td>{formatCurrency(budget.budget_amount)}</td>

                      <td>{formatCurrency(budget.spent)}</td>

                      <td className={exceeded ? "budget-over" : ""}>
                        {formatCurrency(budget.remaining)}
                      </td>

                      <td>
                        <div className="budget-progress-cell">
                          <div className="budget-progress-track">
                            <div
                              className={`budget-progress-fill ${
                                exceeded ? "over" : ""
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <small>
                            {Math.round(
                              assigned > 0
                                ? (spent / assigned) * 100
                                : 0
                            )}%
                          </small>
                        </div>
                      </td>

                      <td>
                        <div className="budget-actions">
                          <button
                            type="button"
                            onClick={() => handleEdit(budget)}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className="delete"
                            onClick={() => handleDelete(budget.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default Budgets;
