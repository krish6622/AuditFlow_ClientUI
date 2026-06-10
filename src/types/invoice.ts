export interface LineItemInput {
  description: string;
  amount: string; // kept as string for controlled inputs
}

export interface InvoiceFormData {
  invoice_number: string;
  invoice_date: string; // YYYY-MM-DD
  customer_name: string;
  customer_address: string;
  mca_charges: string;
  discount_percent: string;
  items: LineItemInput[];
}

export interface InvoiceTotals {
  services: number;
  gross: number;
  discountAmount: number;
  net: number;
}

export interface SavedLineItem {
  id: string;
  position: number;
  description: string;
  amount: string;
}

export interface SavedInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_address: string | null;
  mca_charges: string;
  discount_percent: string;
  gross_total: string;
  discount_amount: string;
  net_total: string;
  items: SavedLineItem[];
  created_at: string;
}

export interface InvoiceListItem {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  net_total: string;
  created_at: string;
}

export interface InvoiceCreatePayload {
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_address?: string | null;
  mca_charges: number;
  discount_percent: number;
  items: { description: string; amount: number }[];
}
