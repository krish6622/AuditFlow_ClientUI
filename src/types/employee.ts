import type { UserRole } from "@/types/auth";

export interface Employee {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  designation: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  deleted_at: string | null;
}

export interface EmployeeCreateInput {
  full_name: string;
  phone: string;
  email?: string | null;
  designation?: string | null;
  password: string;
  is_active?: boolean;
}

export interface EmployeeUpdateInput {
  full_name?: string;
  phone?: string;
  email?: string | null;
  designation?: string | null;
  password?: string;
  is_active?: boolean;
}
