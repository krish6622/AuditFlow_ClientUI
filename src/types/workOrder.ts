export type WorkOrderStatus = "pending" | "in_progress" | "completed";

export interface WorkOrder {
  id: string;
  number: string;
  customer_name: string | null;
  assignee_id: string | null;
  assigned_employee_name: string | null;
  description: string | null;
  amount: string; // Decimal serialized as string
  due_date: string | null; // YYYY-MM-DD
  notes: string | null;
  status: WorkOrderStatus;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderListResponse {
  items: WorkOrder[];
  total: number;
  page: number;
  page_size: number;
}

export interface WorkOrderInput {
  customer_name: string;
  description: string;
  assignee_id?: string | null;
  assigned_employee_name?: string | null;
  amount?: number | string;
  due_date?: string | null;
  notes?: string | null;
  status?: WorkOrderStatus;
}

export const WORK_ORDER_STATUSES: { value: WorkOrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];
