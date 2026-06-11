import type { WorkOrderStatus } from "@/types/workOrder";

export interface KpiTotals {
  work_orders: number;
  completed_work_orders: number;
  invoices: number;
  awaiting_assignment: number;
  pending_approvals: number;
}

export interface PendingEmployee {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  designation: string | null;
  created_at: string;
}

export interface KpiDeltas {
  work_orders_pct: number | null;
  completed_pct: number | null;
  invoices_pct: number | null;
}

export interface RecentWorkOrder {
  id: string;
  number: string;
  customer_name: string | null;
  assigned_employee_name: string | null;
  status: WorkOrderStatus;
  due_date: string | null;
}

export interface DashboardSummary {
  totals: KpiTotals;
  deltas: KpiDeltas;
  recent_work_orders: RecentWorkOrder[];
  awaiting_assignment: RecentWorkOrder[];
  pending_approvals: PendingEmployee[];
}
