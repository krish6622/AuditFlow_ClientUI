import type { InvoiceFormData, InvoiceTotals } from "@/types/invoice";

const toNum = (v: string): number => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Gross  = sum(service amounts) + MCA charges
 * Discount = Gross × Discount%
 * Net    = Gross − Discount  (the GST-taxable value)
 * CGST = SGST = Net × (GST% / 2)
 * Total  = Net + CGST + SGST
 */
export function computeTotals(form: InvoiceFormData): InvoiceTotals {
  const services = round2(form.items.reduce((sum, i) => sum + toNum(i.amount), 0));
  const gross = round2(services + toNum(form.mca_charges));
  const discountAmount = round2((gross * toNum(form.discount_percent)) / 100);
  const net = round2(gross - discountAmount);
  const halfGst = toNum(form.gst_percent ?? "") / 2;
  const cgst = round2((net * halfGst) / 100);
  const sgst = cgst;
  const total = round2(net + cgst + sgst);
  return { services, gross, discountAmount, net, cgst, sgst, total };
}

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(n) ? n : 0);
}

// --------------------------------------------------------------------------- //
// Number → Indian-format words (e.g. 15300 -> "Fifteen Thousand Three Hundred")
// --------------------------------------------------------------------------- //
const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return TENS[t] + (o ? " " + ONES[o] : "");
}

function threeDigits(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  let out = "";
  if (h) out += ONES[h] + " Hundred";
  if (rest) out += (out ? " " : "") + twoDigits(rest);
  return out;
}

/** Returns the rupee amount in words, Indian numbering (Lakh / Crore). */
export function amountInWords(amount: number): string {
  const rupees = Math.floor(Math.abs(amount));
  const paise = Math.round((Math.abs(amount) - rupees) * 100);
  if (rupees === 0 && paise === 0) return "Zero Rupees Only";

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const hundred = rupees % 1000;

  const parts: string[] = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(twoDigits(lakh) + " Lakh");
  if (thousand) parts.push(twoDigits(thousand) + " Thousand");
  if (hundred) parts.push(threeDigits(hundred));

  let words = parts.join(" ").trim() + " Rupees";
  if (paise) words += " and " + twoDigits(paise) + " Paise";
  return words + " Only";
}
