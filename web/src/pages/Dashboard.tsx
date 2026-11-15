
import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import Budgets from "./Budgets";
import Accounts from "./Accounts";
import Beneficiaries from "./Beneficiaries";
import Transactions from "../Transactions";

import {
  getDashboard,
  type AuthUser,
  type DashboardResponse,
  type Transaction,
} from "../services/api";

interface DashboardProps {
  token: string;
  user: AuthUser;
  onLogout: () => void;
}

type ActiveView = "dashboard" | "budgets" | "accounts" | "beneficiaries" | "transactions";

const formatCurrency = (value: number | string | null | undefined) => {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number.isFinite(amount) ? amount : 0);
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function Dashboard({ token, user, onLogout }: DashboardProps) {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDashboard(token);

        if (active) {
          setData(response);
        }
      } catch (err) {
        if (!active) return;

        const message =
          err instanceof Error ? err.message : "Error desconocido";

        if (
          message.toLowerCase().includes("token") ||
          message.toLowerCase().includes("autoriz")
        ) {
          onLogout();
          return;
        }

        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [token, onLogout]);

  const initials = `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase();

  const summary = data?.summary;

  const renderTransaction = (transaction: Transaction) => {
    const isIncome = transaction.transaction_type === "income";

    return (
      <div className="transaction-row" key={transaction.id}>
        <div className={`transaction-icon ${isIncome ? "income" : "expense"}`}>
          {transaction.description?.charAt(0)?.toUpperCase() || "$"}
        </div>

        <div className="transaction-details">
          <strong>{transaction.description}</strong>
          <span>{transaction.category || "Sin categoría"}</span>
        </div>

        <div className="transaction-date">
          {formatDate(transaction.transaction_date)}
        </div>

        <strong className={`transaction-amount ${isIncome ? "income" : "expense"}`}>
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </strong>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">T</div>
          <span>TreoWallet</span>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">MENÚ PRINCIPAL</p>

          <button
            type="button"
            className={`nav-item ${activeView === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveView("dashboard")}
          >
            <span className="nav-icon">▦</span>
            Dashboard
          </button>

          <button
            type="button"
            className={`nav-item ${activeView === "transactions" ? "active" : ""}`}
            onClick={() => setActiveView("transactions")}
          >
            <span className="nav-icon">↔</span>
            Transacciones
          </button>

          <button
            type="button"
            className={`nav-item ${activeView === "accounts" ? "active" : ""}`}
            onClick={() => setActiveView("accounts")}
          >
            <span className="nav-icon">◤</span>
            Cuentas
          </button>

          <button
            type="button"
            className={`nav-item ${activeView === "beneficiaries" ? "active" : ""}`}
            onClick={() => setActiveView("beneficiaries")}
          >
            <span className="nav-icon">♧</span>
            Beneficiarios
          </button>

          <button
            type="button"
            className={`nav-item ${activeView === "budgets" ? "active" : ""}`}
            onClick={() => setActiveView("budgets")}
          >
            <span className="nav-icon">◎</span>
            Presupuestos
          </button>

          <button type="button" className="nav-item" disabled>
            <span className="nav-icon">◥</span>
            Reportes
          </button>

          <p className="nav-label nav-label-bottom">PREFERENCIAS</p>

          <button type="button" className="nav-item" disabled>
            <span className="nav-icon">⚙</span>
            Configuración
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>

            <div className="user-info">
              <strong>{user.firstName} {user.lastName}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <button className="logout-button" onClick={onLogout}>
            <span>↪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {activeView === "budgets" ? (
          <>
            <header className="dashboard-header">
              <div>
                <h1>Presupuestos</h1>
                <p>Administra y controla tus gastos mensuales.</p>
              </div>

              <div className="header-actions">
                <div className="header-avatar">{initials}</div>
              </div>
            </header>

            <Budgets token={token} />
          </>
        ) : activeView === "accounts" ? (
          <>
            <header className="dashboard-header">
              <div>
                <h1>Cuentas</h1>
                <p>Consulta tus cuentas y sus saldos actuales.</p>
              </div>

              <div className="header-actions">
                <div className="header-avatar">{initials}</div>
              </div>
            </header>

            <Accounts token={token} />
          </>
        
        ) : activeView === "beneficiaries" ? (
          <>
            <header className="dashboard-header">
              <div>
                <h1>Beneficiarios</h1>
                <p>Administra tus beneficiarios y sus cuentas de destino.</p>
              </div>

              <div className="header-actions">
                <div className="header-avatar">{initials}</div>
              </div>
            </header>

            <Beneficiaries token={token} />
          </>
        ) : activeView === "transactions" ? (
          <>
            <header className="dashboard-header">
              <div>
                <h1>Transacciones</h1>
                <p>Administra tus ingresos y gastos.</p>
              </div>

              <div className="header-actions">
                <div className="header-avatar">{initials}</div>
              </div>
            </header>

            <Transactions token={token} />
          </>
        ) : (
          <>
            <header className="dashboard-header">
              <div>
                <h1>Dashboard</h1>
                <p>
                  Bienvenido de nuevo, {user.firstName}. Aquí tienes un resumen
                  de tus finanzas.
                </p>
              </div>

              <div className="header-actions">
                <button className="notification-button" aria-label="Notificaciones">
                  ♧
                  <span className="notification-dot"></span>
                </button>

                <div className="header-avatar">{initials}</div>
              </div>
            </header>

            {loading && (
              <p role="status">Cargando información financiera...</p>
            )}

            {error && (
              <p role="alert" className="dashboard-error">
                {error}
              </p>
            )}

            {!loading && !error && data && (
              <>
                <section className="balance-section">
                  <div className="balance-card">
                    <div className="balance-card-top">
                      <span>Balance total</span>
                      <span className="balance-menu">•••</span>
                    </div>

                    <h2>{formatCurrency(summary?.current_balance)}</h2>

                    <div className="balance-footer">
                      <span>Saldo actual de tus cuentas</span>
                    </div>
                  </div>

                  <div className="summary-card">
                    <div className="summary-icon income-icon">↙</div>
                    <span>Ingresos acumulados</span>
                    <h3>{formatCurrency(summary?.total_income)}</h3>
                  </div>

                  <div className="summary-card">
                    <div className="summary-icon expense-icon">↗</div>
                    <span>Gastos acumulados</span>
                    <h3>{formatCurrency(summary?.total_expenses)}</h3>
                  </div>
                </section>

                <section className="dashboard-grid">
                  <div className="content-card transactions-card">
                    <div className="card-header">
                      <div>
                        <h3>Últimas transacciones</h3>
                        <p>Resumen de tus movimientos recientes</p>
                      </div>

                      <button className="text-button" type="button">
                        Ver todas
                      </button>
                    </div>

                    <div className="transactions-list">
                      {data.recentTransactions.length > 0 ? (
                        data.recentTransactions.map(renderTransaction)
                      ) : (
                        <p>No tienes movimientos registrados todavía.</p>
                      )}
                    </div>
                  </div>

                  <div className="content-card quick-actions-card">
                    <div className="card-header">
                      <div>
                        <h3>Acciones rápidas</h3>
                        <p>Administra tu dinero</p>
                      </div>
                    </div>

                    <div className="quick-actions">
                      <button className="quick-action" type="button">
                        <span className="quick-action-icon purple">＋</span>
                        <span>
                          <strong>Agregar ingreso</strong>
                          <small>Registra dinero recibido</small>
                        </span>
                      </button>

                      <button className="quick-action" type="button">
                        <span className="quick-action-icon orange">－</span>
                        <span>
                          <strong>Agregar gasto</strong>
                          <small>Registra un nuevo gasto</small>
                        </span>
                      </button>

                      <button
                        className="quick-action"
                        type="button"
                        onClick={() => setActiveView("budgets")}
                      >
                        <span className="quick-action-icon blue">◤</span>
                        <span>
                          <strong>Crear presupuesto</strong>
                          <small>Organiza tus gastos</small>
                        </span>
                      </button>

                      <button
                        className="quick-action"
                        type="button"
                        onClick={() => setActiveView("accounts")}
                      >
                        <span className="quick-action-icon green">＋</span>
                        <span>
                          <strong>Ver cuentas</strong>
                          <small>Consulta tus cuentas bancarias</small>
                        </span>
                      </button>
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
