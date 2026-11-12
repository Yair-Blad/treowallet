
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
}

export interface Transaction {
  id: number;
  description: string;
  transaction_type: "income" | "expense";
  amount: number | string;
  transaction_date: string;
  category: string | null;
}

export interface DashboardSummary {
  opening_balance: number | string;
  total_income: number | string;
  total_expenses: number | string;
  current_balance: number | string;
}

export interface DashboardResponse {
  success: boolean;
  summary: DashboardSummary;
  recentTransactions: Transaction[];
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al comunicarse con el servidor");
  }

  return data as T;
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getDashboard(
  token: string
): Promise<DashboardResponse> {
  return request<DashboardResponse>("/dashboard", {
    method: "GET",
  }, token);
}
