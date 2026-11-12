
import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import type { AuthUser } from "./services/api";

interface Session {
  token: string;
  user: AuthUser;
}

function getSavedSession(): Session | null {
  try {
    const token =
      localStorage.getItem("treo_token") ||
      sessionStorage.getItem("treo_token");
    
    const savedUser =
      localStorage.getItem("treo_user") ||
      sessionStorage.getItem("treo_user");

    if(!token || !savedUser) return null;

    return {
      token,
      user: JSON.parse(savedUser) as AuthUser,
    };
  } catch {
    return null;
  }
}

function App() {
  const [session, setSession] = useState<Session | null>(
    getSavedSession
  );

  const handleLogin = (
    token: string,
    user: AuthUser,
    remember: boolean
  ) => {
    localStorage.removeItem("treo_token");
    localStorage.removeItem("treo_user");
    sessionStorage.removeItem("treo_token");
    sessionStorage.removeItem("treo_user");

    const storage = remember ? localStorage : sessionStorage;

    storage.setItem("treo_token", token);
    storage.setItem("treo_user", JSON.stringify(user));

    setSession({ token, user });
  };

  const handleLogout = () => {
    localStorage.removeItem("treo_token");
    localStorage.removeItem("treo_user");
    sessionStorage.removeItem("treo_token");
    sessionStorage.removeItem("treo_user");

    setSession(null);
  };

  return session ? (
    <Dashboard
      token={session.token}
      user={session.user}
      onLogout={handleLogout}
    />
  ) : (
    <Login onLogin={handleLogin} />
  );
}

export default App;

