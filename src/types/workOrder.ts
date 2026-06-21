export type WorkOrderStatus =
  | "awaiting_assignment"
  | "assigned"
  | "in_progress"
  | "completed"
  | "closed"
  | "cancelled";

export type WorkOrderUrgency = "low" | "medium" | "high";

export type WorkOrderCategory =
  | "income_tax"
  | "gst"
  | "project_report"
  | "audit"
  | "roc"
  | "financial_statement"
  | "tds"
  | "accounting"
  | "others";

export interface WorkOrder {
  id: string;
  number: string;
  category: WorkOrderCategory | null;
  category_other: string | null;
  customer_id: string | null;
  customer_name: string | null;
  contact_number: string | null;
  assignee_id: string | null;
  assigned_employee_name: string | null;
  requested_by_id: string | null;
  description: string | null;
  urgency: WorkOrderUrgency;
  order_date: string | null; // YYYY-MM-DD
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
  category: WorkOrderCategory;
  category_other?: string | null;
  customer_id?: string | null;
  customer_name: string;
  contact_number?: string | null;
  description: string;
  assignee_id?: string | null;
  assigned_employee_name?: string | null;
  urgency?: WorkOrderUrgency;
  order_date?: string | null;
  due_date?: string | null;
  notes?: string | null;
  status?: WorkOrderStatus;
}

export const WORK_ORDER_STATUSES: { value: WorkOrderStatus; label: string }[] = [
  { value: "awaiting_assignment", label: "Awaiting Assignment" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
  { value: "cancelled", label: "Cancelled" },
];

/** Statuses an assigned employee can move an order through. */
export const WORK_ORDER_PROGRESS_STATUSES: { value: WorkOrderStatus; label: string }[] = [
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export const WORK_ORDER_CATEGORIES: { value: WorkOrderCategory; label: string }[] = [
  { value: "income_tax", label: "Income Tax" },
  { value: "gst", label: "GST" },
  { value: "project_report", label: "Project Report" },
  { value: "audit", label: "Audit" },
  { value: "roc", label: "ROC" },
  { value: "financial_statement", label: "Financial Statement" },
  { value: "tds", label: "TDS" },
  { value: "accounting", label: "Accounting" },
  { value: "others", label: "Others" },
];

export const WORK_ORDER_URGENCIES: { value: WorkOrderUrgency; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

/** Human label for a category value (handles the Others free-text case). */
export function categoryLabel(
  category: WorkOrderCategory | null,
  categoryOther?: string | null
): string {
  if (!category) return "—";
  if (category === "others") return categoryOther?.trim() || "Others";
  return WORK_ORDER_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}
