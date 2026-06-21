export type CustomerType = "gst" | "income_tax";
export type CustomerStatus = "ACTIVE" | "INACTIVE";

export interface Customer {
  id: string;
  customer_code: string;
  customer_type: CustomerType;
  client_name: string;
  business_name: string | null;
  proprietor_name: string | null;
  mobile_number: string | null;
  alternate_mobile_number: string | null;
  email: string | null;
  date_of_birth: string | null;
  gst_number: string | null;
  pan_number: string | null;
  aadhaar_number: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  remarks: string | null;
  is_active: boolean;
  status: CustomerStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerInput {
  customer_type: CustomerType;
  client_name: string;
  business_name?: string | null;
  proprietor_name?: string | null;
  mobile_number?: string | null;
  alternate_mobile_number?: string | null;
  email?: string | null;
  date_of_birth?: string | null;
  gst_number?: string | null;
  pan_number?: string | null;
  aadhaar_number?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  remarks?: string | null;
  is_active?: boolean;
}

export type CustomerUpdateInput = Partial<CustomerInput>;

export interface CustomerStats {
  total: number;
  gst: number;
  income_tax: number;
  active: number;
  inactive: number;
}

export interface CustomerAuditEntry {
  id: string;
  action: string;
  performed_by_name: string | null;
  customer_name: string | null;
  timestamp: string;
}

/** Slim record returned by the work-order / invoice customer picker. */
export interface CustomerLookupItem {
  id: string;
  customer_code: string;
  customer_type: CustomerType;
  client_name: string;
  business_name: string | null;
  mobile_number: string | null;
  gst_number: string | null;
  pan_number: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

export interface CustomerWorkOrderItem {
  id: string;
  number: string;
  title: string | null;
  status: string;
  order_date: string | null;
  created_at: string;
}

export interface CustomerInvoiceItem {
  id: string;
  number: string;
  status: string;
  total: string;
  issue_date: string | null;
  created_at: string;
}

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  gst: "GST",
  income_tax: "Income Tax",
};
