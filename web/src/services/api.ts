
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
  category_id?: string;
  account?: string | null;
  account_id?: string;
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

export interface Category {
  id: string;
  name: string;
  category_type: "income" | "expense";
}

export interface Budget {
  id: string;
  budget_amount: number | string;
  budget_month: string;
  category_id: string;
  category: string;
  spent: number | string;
  remaining: number | string;
}

export interface Account {
  id: string;
  account_name: string;
  account_type: "wallet" | "debit" | "savings" | "credit";
  currency: string;
  opening_balance: number | string;
  total_income: number | string;
  total_expenses: number | string;
  current_balance: number | string;
  created_at: string;
}

export interface Beneficiary {
  id: string;
  beneficiary_name: string;
  alias: string;
  clabe: string;
  created_at: string;
}

interface BeneficiariesResponse {
  success: boolean;
  beneficiaries: Beneficiary[];
}

interface BeneficiaryMutationResponse {
  success: boolean;
  message: string;
  beneficiary?: Beneficiary;
}

interface CategoriesResponse {
  success: boolean;
  categories: Category[];
}

interface BudgetsResponse {
  success: boolean;
  budgets: Budget[];
}

interface BudgetMutationResponse {
  success: boolean;
  message: string;
  budget?: Budget;
}

interface AccountsResponse {
  success: boolean;
  accounts: Account[];
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

export async function getCategories(
  token: string,
  type: Category["category_type"] = "expense"
): Promise<Category[]> {
  const response = await request<CategoriesResponse>(
    `/categories?type=${type}`,
    { method: "GET" },
    token
  );

  return response.categories;
}

export async function getBudgets(
  token: string,
  month: string
): Promise<Budget[]> {
  const response = await request<BudgetsResponse>(
    `/budgets?month=${encodeURIComponent(month)}`,
    { method: "GET" },
    token
  );

  return response.budgets;
}

export async function createBudget(
  token: string,
  categoryId: string,
  amount: number,
  budgetMonth: string
): Promise<BudgetMutationResponse> {
  return request<BudgetMutationResponse>(
    "/budgets",
    {
      method: "POST",
      body: JSON.stringify({
        categoryId: Number(categoryId),
        amount,
        budgetMonth,
      }),
    },
    token
  );
}

export async function updateBudget(
  token: string,
  budgetId: string,
  amount: number
): Promise<BudgetMutationResponse> {
  return request<BudgetMutationResponse>(
    `/budgets/${budgetId}`,
    {
      method: "PUT",
      body: JSON.stringify({ amount }),
    },
    token
  );
}

export async function deleteBudget(
  token: string,
  budgetId: string
): Promise<BudgetMutationResponse> {
  return request<BudgetMutationResponse>(
    `/budgets/${budgetId}`,
    {
      method: "DELETE",
    },
    token
  );
}

export async function getAccounts(
  token: string
): Promise<AccountsResponse> {
  return request<AccountsResponse>(
    "/accounts",
    { method: "GET" },
    token
  );
}
export async function getBeneficiaries(
  token: string
): Promise<Beneficiary[]> {
  const response = await request<BeneficiariesResponse>(
    "/beneficiaries",
    { method: "GET" },
    token
  );

  return response.beneficiaries;
}

export async function createBeneficiary(
  token: string,
  beneficiary_name: string,
  alias: string,
  clabe: string
): Promise<BeneficiaryMutationResponse> {
  return request<BeneficiaryMutationResponse>(
    "/beneficiaries",
    {
      method: "POST",
      body: JSON.stringify({
        beneficiary_name,
        alias,
        clabe,
      }),
    },
    token
  );
}

export async function deleteBeneficiary(
  token: string,
  beneficiaryId: string
): Promise<BeneficiaryMutationResponse> {
  return request<BeneficiaryMutationResponse>(
    `/beneficiaries/${beneficiaryId}`,
    { method: "DELETE" },
    token
  );
}


interface TransactionsResponse {
  success: boolean;
  transactions: Transaction[];
}

interface TransactionMutationResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
}

export async function getTransactions(
  token: string,
  type?: "income" | "expense"
): Promise<Transaction[]> {
  const params = type ? `?type=${type}` : "";

  const response = await request<TransactionsResponse>(
    `/transactions${params}`,
    { method: "GET" },
    token
  );

  return response.transactions;
}

export async function createTransaction(
  token: string,
  data: {
    description: string;
    transaction_type: "income" | "expense";
    amount: number;
    account_id: string;
    category_id: string;
    transaction_date: string;
  }
): Promise<TransactionMutationResponse> {
  return request<TransactionMutationResponse>(
    "/transactions",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export async function deleteTransaction(
  token: string,
  transactionId: number
): Promise<TransactionMutationResponse> {
  return request<TransactionMutationResponse>(
    `/transactions/${transactionId}`,
    {
      method: "DELETE",
    },
    token
  );
}
