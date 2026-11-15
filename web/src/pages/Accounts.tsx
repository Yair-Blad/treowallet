
import { useEffect, useState } from "react";
import { getAccounts, type Account } from "../services/api";
import "../styles/Accounts.css";

interface AccountsProps {
  token: string;
}

const formatMoney = (amount: number | string, currency = "MXN") => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(Number(amount) || 0);
};

const accountTypeLabels: Record<Account["account_type"], string> = {
  wallet: "Billetera",
  debit: "Débito",
  savings: "Ahorro",
  credit: "Crédito",
};

export default function Accounts({ token }: AccountsProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAccounts(token);
        setAccounts(response.accounts);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No fue posible consultar las cuentas"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [token]);

  return (
    <section className="accounts-page">
      <div className="accounts-header">
        <div>
          <h1>Mis cuentas</h1>
          <p>Consulta tus cuentas y sus saldos actuales.</p>
        </div>

        <span className="accounts-count">
          {accounts.length} {accounts.length === 1 ? "cuenta" : "cuentas"}
        </span>
      </div>

      {loading ? (
        <div className="accounts-message">
          Consultando tus cuentas...
        </div>
      ) : error ? (
        <div className="accounts-error">{error}</div>
      ) : accounts.length === 0 ? (
        <div className="accounts-empty">
          <h3>No tienes cuentas registradas</h3>
          <p>Cuando tengas cuentas disponibles, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="accounts-grid">
          {accounts.map((account) => (
            <article className="account-card" key={account.id}>
              <div className="account-card-header">
                <div>
                  <span className="account-type">
                    {accountTypeLabels[account.account_type] ??
                      account.account_type}
                  </span>
                  <h2>{account.account_name}</h2>
                </div>

                <span className="account-icon">$
                </span>
              </div>

              <div className="account-balance">
                <span>Saldo actual</span>
                <strong>
                  {formatMoney(account.current_balance, account.currency)}
                </strong>
              </div>

              <div className="account-details">
                <div>
                  <span>Saldo inicial</span>
                  <strong>
                    {formatMoney(account.opening_balance, account.currency)}
                  </strong>
                </div>

                <div>
                  <span>Ingresos</span>
                  <strong className="account-income">
                    {formatMoney(account.total_income, account.currency)}
                  </strong>
                </div>

                <div>
                  <span>Gastos</span>
                  <strong className="account-expenses">
                    {formatMoney(account.total_expenses, account.currency)}
                  </strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
