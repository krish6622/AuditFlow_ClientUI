export type UserRole = "admin" | "employee";

export type UserStatus = "pending_approval" | "active" | "inactive";

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string;
  phone: string | null;
  designation: string | null;
  role: UserRole;
  status: UserStatus;
  organization_id: string | null;
  is_active: boolean;
  created_at: string;
}

/** Response from POST /auth/register — no tokens; account awaits approval. */
export interface RegisterResponse {
  message: string;
  status: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/** Shape of the backend's uniform error envelope. */
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
