
import "../styles/Dashboard.css";

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const transactions = [
    {
      name: "Netflix",
      category: "Entretenimiento",
      date: "Hoy, 10:30 AM",
      amount: "-$199.00",
      type: "expense",
      icon: "N",
    },
    {
      name: "Nómina",
      category: "Ingresos",
      date: "Ayer, 09:00 AM",
      amount: "+$15,000.00",
      type: "income",
      icon: "$",
    },
    {
      name: "Spotify",
      category: "Entretenimiento",
      date: "10 Nov, 08:15 AM",
      amount: "-$129.00",
      type: "expense",
      icon: "S",
    },
    {
      name: "Supermercado",
      category: "Alimentación",
      date: "09 Nov, 05:20 PM",
      amount: "-$850.00",
      type: "expense",
      icon: "C",
    },
  ];

  return (
    <div className="dashboard">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">T</div>
          <span>TreoWallet</span>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">MENÚ PRINCIPAL</p>

          <a href="#" className="nav-item active">
            <span className="nav-icon">▦</span>
            Dashboard
          </a>

          <a href="#" className="nav-item">
            <span className="nav-icon">↔</span>
            Transacciones
          </a>

          <a href="#" className="nav-item">
            <span className="nav-icon">▤</span>
            Cuentas
          </a>

          <a href="#" className="nav-item">
            <span className="nav-icon">◎</span>
            Presupuestos
          </a>

          <a href="#" className="nav-item">
            <span className="nav-icon">▥</span>
            Reportes
          </a>

          <p className="nav-label nav-label-bottom">PREFERENCIAS</p>

          <a href="#" className="nav-item">
            <span className="nav-icon">⚙</span>
            Configuración
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">YP</div>

            <div className="user-info">
              <strong>Usuario Treo</strong>
              <span>usuario@email.com</span>
            </div>
          </div>

          <button className="logout-button" onClick={onLogout}>
            <span>↪</span>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Bienvenido de nuevo. Aquí tienes un resumen de tus finanzas.</p>
          </div>

          <div className="header-actions">
            <button className="notification-button" aria-label="Notificaciones">
              ♧
              <span className="notification-dot"></span>
            </button>

            <div className="header-avatar">YP</div>
          </div>
        </header>

        {/* BALANCE */}
        <section className="balance-section">
          <div className="balance-card">
            <div className="balance-card-top">
              <span>Balance total</span>
              <span className="balance-menu">•••</span>
            </div>

            <h2>$45,850.00</h2>

            <div className="balance-footer">
              <span className="balance-positive">↑ 12.8%</span>
              <span>respecto al mes pasado</span>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon income-icon">↙</div>
            <span>Ingresos</span>
            <h3>$25,000.00</h3>
            <p className="summary-positive">↑ 8.2% este mes</p>
          </div>

          <div className="summary-card">
            <div className="summary-icon expense-icon">↗</div>
            <span>Gastos</span>
            <h3>$8,450.00</h3>
            <p className="summary-negative">↑ 3.4% este mes</p>
          </div>
        </section>

        {/* CONTENT GRID */}
        <section className="dashboard-grid">

          <div className="content-card transactions-card">
            <div className="card-header">
              <div>
                <h3>Últimas transacciones</h3>
                <p>Resumen de tus movimientos recientes</p>
              </div>

              <button className="text-button">Ver todas</button>
            </div>

            <div className="transactions-list">
              {transactions.map((transaction, index) => (
                <div className="transaction-row" key={index}>
                  <div className={`transaction-icon ${transaction.type}`}>
                    {transaction.icon}
                  </div>

                  <div className="transaction-details">
                    <strong>{transaction.name}</strong>
                    <span>{transaction.category}</span>
                  </div>

                  <div className="transaction-date">
                    {transaction.date}
                  </div>

                  <strong className={`transaction-amount ${transaction.type}`}>
                    {transaction.amount}
                  </strong>
                </div>
              ))}
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
              <button className="quick-action">
                <span className="quick-action-icon purple">＋</span>
                <span>
                  <strong>Agregar ingreso</strong>
                  <small>Registra dinero recibido</small>
                </span>
              </button>

              <button className="quick-action">
                <span className="quick-action-icon orange">－</span>
                <span>
                  <strong>Agregar gasto</strong>
                  <small>Registra un nuevo gasto</small>
                </span>
              </button>

              <button className="quick-action">
                <span className="quick-action-icon blue">▤</span>
                <span>
                  <strong>Crear presupuesto</strong>
                  <small>Organiza tus gastos</small>
                </span>
              </button>

              <button className="quick-action">
                <span className="quick-action-icon green">＋</span>
                <span>
                  <strong>Nueva cuenta</strong>
                  <small>Agrega una cuenta bancaria</small>
                </span>
              </button>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;
