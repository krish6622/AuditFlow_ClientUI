import type {
  ApiErrorBody,
  TokenResponse,
  UserProfile,
} from "@/types/auth";
import type {
  WorkOrder,
  WorkOrderInput,
  WorkOrderListResponse,
  WorkOrderStatus,
} from "@/types/workOrder";
import type { DashboardSummary } from "@/types/dashboard";
import type {
  InvoiceCreatePayload,
  InvoiceListItem,
  SavedInvoice,
} from "@/types/invoice";
import type {
  Employee,
  EmployeeCreateInput,
  EmployeeUpdateInput,
} from "@/types/employee";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  ""
) ?? "http://localhost:8000/api/v1";

const ACCESS_KEY = "ea.access_token";
const REFRESH_KEY = "ea.refresh_token";

// --------------------------------------------------------------------------- //
// Token storage
// --------------------------------------------------------------------------- //
export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: TokenResponse) {
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// --------------------------------------------------------------------------- //
// Error type
// --------------------------------------------------------------------------- //
export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function parseError(response: Response): Promise<ApiError> {
  let code = "http_error";
  let message = response.statusText || "Request failed";
  let details: Record<string, unknown> | undefined;
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    if (body.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      details = body.error.details;
    }
  } catch {
    /* non-JSON response; keep defaults */
  }
  return new ApiError(response.status, code, message, details);
}

// --------------------------------------------------------------------------- //
// Single-flight refresh
// --------------------------------------------------------------------------- //
let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refresh_token = tokenStore.refresh;
      if (!refresh_token) return false;
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token }),
        });
        if (!res.ok) {
          tokenStore.clear();
          return false;
        }
        tokenStore.set((await res.json()) as TokenResponse);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

// --------------------------------------------------------------------------- //
// Core request helper (adds auth, retries once after refresh on 401)
// --------------------------------------------------------------------------- //
interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach access token (default true)
  retry?: boolean; // internal: prevent infinite refresh loops
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, retry = true } = opts;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth && tokenStore.access) {
    headers.Authorization = `Bearer ${tokenStore.access}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 401 && auth && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, { ...opts, retry: false });
    }
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

// --------------------------------------------------------------------------- //
// Auth API
// --------------------------------------------------------------------------- //
export const authApi = {
  async login(identifier: string, password: string): Promise<TokenResponse> {
    const tokens = await request<TokenResponse>("/auth/login", {
      method: "POST",
      body: { identifier, password },
      auth: false,
    });
    tokenStore.set(tokens);
    return tokens;
  },

  async register(input: {
    email: string;
    password: string;
    full_name?: string;
    organization_name?: string;
  }): Promise<TokenResponse> {
    const tokens = await request<TokenResponse>("/auth/register", {
      method: "POST",
      body: input,
      auth: false,
    });
    tokenStore.set(tokens);
    return tokens;
  },

  me(): Promise<UserProfile> {
    return request<UserProfile>("/auth/me");
  },

  async logout(): Promise<void> {
    const refresh_token = tokenStore.refresh;
    try {
      if (refresh_token) {
        await request<{ message: string }>("/auth/logout", {
          method: "POST",
          body: { refresh_token },
          auth: false,
        });
      }
    } finally {
      tokenStore.clear();
    }
  },

  forgotPassword(email: string): Promise<{ message: string; reset_token: string | null }> {
    return request("/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    });
  },

  resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    return request("/auth/reset-password", {
      method: "POST",
      body: { token, new_password },
      auth: false,
    });
  },

  changePassword(
    current_password: string,
    new_password: string
  ): Promise<{ message: string }> {
    return request("/auth/change-password", {
      method: "POST",
      body: { current_password, new_password },
    });
  },
};

// --------------------------------------------------------------------------- //
// Work Orders API
// --------------------------------------------------------------------------- //
export interface WorkOrderQuery {
  status?: WorkOrderStatus | "";
  search?: string;
  page?: number;
  page_size?: number;
}

export const workOrdersApi = {
  list(query: WorkOrderQuery = {}): Promise<WorkOrderListResponse> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.search) params.set("search", query.search);
    params.set("page", String(query.page ?? 1));
    params.set("page_size", String(query.page_size ?? 20));
    return request<WorkOrderListResponse>(`/work-orders?${params.toString()}`);
  },

  get(id: string): Promise<WorkOrder> {
    return request<WorkOrder>(`/work-orders/${id}`);
  },

  create(input: WorkOrderInput): Promise<WorkOrder> {
    return request<WorkOrder>("/work-orders", { method: "POST", body: input });
  },

  update(id: string, input: Partial<WorkOrderInput>): Promise<WorkOrder> {
    return request<WorkOrder>(`/work-orders/${id}`, { method: "PUT", body: input });
  },

  remove(id: string): Promise<void> {
    return request<void>(`/work-orders/${id}`, { method: "DELETE" });
  },

  // Employee dashboard: my assigned orders.
  mine(query: { status?: WorkOrderStatus | ""; page?: number; page_size?: number } = {}):
    Promise<WorkOrderListResponse> {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    params.set("page", String(query.page ?? 1));
    params.set("page_size", String(query.page_size ?? 50));
    return request<WorkOrderListResponse>(`/work-orders/mine?${params.toString()}`);
  },

  updateStatus(
    id: string,
    body: { status: WorkOrderStatus; note?: string | null }
  ): Promise<WorkOrder> {
    return request<WorkOrder>(`/work-orders/${id}/status`, { method: "PATCH", body });
  },
};

// --------------------------------------------------------------------------- //
// Employees API (Organization Admin)
// --------------------------------------------------------------------------- //
export const employeesApi = {
  list(search?: string): Promise<Employee[]> {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    return request<Employee[]>(`/employees${q}`);
  },
  get(id: string): Promise<Employee> {
    return request<Employee>(`/employees/${id}`);
  },
  create(input: EmployeeCreateInput): Promise<Employee> {
    return request<Employee>("/employees", { method: "POST", body: input });
  },
  update(id: string, input: EmployeeUpdateInput): Promise<Employee> {
    return request<Employee>(`/employees/${id}`, { method: "PUT", body: input });
  },
  setStatus(id: string, is_active: boolean): Promise<Employee> {
    return request<Employee>(`/employees/${id}/status`, {
      method: "PATCH",
      body: { is_active },
    });
  },
};

// --------------------------------------------------------------------------- //
// Dashboard API
// --------------------------------------------------------------------------- //
export const dashboardApi = {
  summary(): Promise<DashboardSummary> {
    return request<DashboardSummary>("/dashboard/summary");
  },
};

// --------------------------------------------------------------------------- //
// Invoicing API (public — no auth)
// --------------------------------------------------------------------------- //
export const invoicingApi = {
  nextNumber(invoiceDate?: string): Promise<{ invoice_number: string }> {
    const q = invoiceDate ? `?invoice_date=${encodeURIComponent(invoiceDate)}` : "";
    return request<{ invoice_number: string }>(`/invoicing/next-number${q}`, { auth: false });
  },

  create(payload: InvoiceCreatePayload): Promise<SavedInvoice> {
    return request<SavedInvoice>("/invoicing/invoices", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  list(): Promise<InvoiceListItem[]> {
    return request<InvoiceListItem[]>("/invoicing/invoices", { auth: false });
  },

  get(id: string): Promise<SavedInvoice> {
    return request<SavedInvoice>(`/invoicing/invoices/${id}`, { auth: false });
  },
};
