import type { UserRole } from "@/types/auth";

export type AuditAction =
  | "role_promoted"
  | "role_demoted"
  | "status_activated"
  | "status_deactivated"
  | "user_deleted";

export interface AuditLogItem {
  id: string;
  action: AuditAction;
  old_role: UserRole | null;
  new_role: UserRole | null;
  performed_by_user_id: string | null;
  performed_by_name: string | null;
  affected_user_id: string | null;
  affected_user_name: string | null;
  timestamp: string;
}

export interface AuditLogListResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  page_size: number;
}
