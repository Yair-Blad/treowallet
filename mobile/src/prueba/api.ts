
const API_URL = process.env.EXPO_PUBLIC_API_URL;
// ==============================
// AUTENTICACIÓN
// ==============================

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// ==============================
// TRANSACCIONES
// ==============================

export interface Transaction {
  id: number | string;
  description: string;
  transaction_type: "income" | "expense";
  amount: number | string;
  transaction_date: string;
  category?: string | { name: string } | null;
}

export interface DashboardResponse {
  success: boolean;
  summary: {
    opening_balance: number | string;
    total_income: number | string;
    total_expenses: number | string;
    current_balance: number | string;
  };
  recentTransactions: Transaction[];
}

// ==============================
// CUENTAS
// ==============================

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

export interface AccountsResponse {
  success: boolean;
  accounts: Account[];
}

// ==============================
// BENEFICIARIOS
// ==============================

export interface Beneficiary {
  id: string;
  beneficiary_name: string;
  alias: string;
  clabe: string;
  created_at: string;
}

export interface BeneficiariesResponse {
  success: boolean;
  beneficiaries: Beneficiary[];
}

// ==============================
// TRANSFERENCIAS
// ==============================

export interface TransferRequest {
  beneficiary_id: string;
  account_id: string;
  amount: string;
}

export interface Transfer {
  id: string;
  user_id: string;
  beneficiary_id: string;
  account_id: string;
  amount: string;
  idempotency_key: string;
  transaction_id: string;
  created_at: string;
}

export interface TransferResponse {
  success: boolean;
  message: string;
  repeated?: boolean;
  transfer: Transfer;
  transaction?: Transaction;
}

export interface TransferStatusResponse {
  success: boolean;
  status: "confirmed" | "not_found";
  message: string;
  transfer?: Transfer;
  transaction?: Transaction | null;
}

// ==============================
// FUNCIONES AUXILIARES
// ==============================

async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.message || "Ocurrió un error al comunicarse con el servidor.";
  } catch {
    return "No fue posible interpretar la respuesta del servidor.";
  }
}

// ==============================
// LOGIN
// ==============================

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as LoginResponse;
}

// ==============================
// DASHBOARD
// ==============================

export async function getDashboard(
  token: string
): Promise<DashboardResponse> {
  const response = await fetch(`${API_URL}/dashboard`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as DashboardResponse;
}

// ==============================
// CONSULTAR CUENTAS
// ==============================

export async function getAccounts(
  token: string
): Promise<AccountsResponse> {
  const response = await fetch(`${API_URL}/accounts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as AccountsResponse;
}

// ==============================
// CONSULTAR BENEFICIARIOS
// ==============================

export async function getBeneficiaries(
  token: string
): Promise<BeneficiariesResponse> {
  const response = await fetch(`${API_URL}/beneficiaries`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as BeneficiariesResponse;
}

// ==============================
// REALIZAR TRANSFERENCIA
// ==============================

export async function createTransfer(
  token: string,
  transfer: TransferRequest,
  idempotencyKey: string
): Promise<TransferResponse> {
  const response = await fetch(`${API_URL}/transactions/transfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(transfer),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as TransferResponse;
}


// ==============================
// CONSULTAR ESTADO DE TRANSFERENCIA
// ==============================

export async function getTransferStatus(
  token: string,
  idempotencyKey: string
): Promise<TransferStatusResponse> {
  const response = await fetch(
    `${API_URL}/transactions/transfer/status`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as TransferStatusResponse;
}
