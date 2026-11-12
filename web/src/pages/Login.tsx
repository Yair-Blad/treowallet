
import { useState, type FormEvent } from "react";
import { loginUser, type AuthUser } from "../services/api";
import '../App.css';

interface LoginProps {
  onLogin: (
      token: string,
      user: AuthUser,
      remember: boolean
  ) => void;
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try{ 
      const response = await loginUser(email.trim(),password);

      if(!response.success || !response.token || !response.user){
        throw new Error(response.message || "No se pudo iniciar sesión.");
      }
      onLogin(response.token, response.user, remember);
    }catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible conectar con el servidor"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container">
      <section className="login-card">

        <div className="login-header">
          <div className="brand-icon">T</div>
          <h1>TreoWallet</h1>
          <p>Bienvenido de nuevo</p>
          <span>Inicia sesión para continuar</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>

            <div className="password-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Recordarme
            </label>

            <a href="#forgot">¿Olvidaste tu contraseña?</a>
          </div>

          {error && (
            <p role="alert" className="login-error">
              {error}
            </p>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="register-link">
          ¿No tienes una cuenta?
          <a href="#register"> Crear cuenta</a>
        </div>

        <div className="login-footer">
          © 2026 TreoWallet. Todos los derechos reservados.
        </div>

      </section>
    </main>
  );
}

export default Login
