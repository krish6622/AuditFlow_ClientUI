import { useLayoutEffect, useRef } from "react";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  Hash,
  Landmark,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  User,
} from "lucide-react";

import { BrandMark } from "@/components/BrandMark";
import { FIRM } from "@/lib/firm";
import { amountInWords, computeTotals, formatINR } from "@/lib/invoice";
import { cn } from "@/lib/utils";
import type { InvoiceFormData } from "@/types/invoice";

/* Elangovan Associates visiting-card palette — print-optimised (dark, high
   contrast) so browser print and the generated PDF match the on-screen preview. */
const NAVY = "#032B5A"; // Primary Navy
const ROYAL = "#0056B3"; // Royal Blue
const GOLD = "#B8860B"; // Signature Gold
const LIGHT_GOLD = "#F7F3E8"; // Ivory / light gold card
const BORDER = "#E5E7EB"; // Hairline border

// Force colour-accurate printing on every coloured fill (waves, header, table,
// totals, footer). Mirrors the `.print-area *` rule for non-print contexts.
const PRINT_EXACT = {
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
} as React.CSSProperties;

// A4 printable area at the @page 6mm margin, in CSS px @96dpi (198mm × 285mm).
// A small safety margin keeps a long invoice on a single page even after the
// browser's own rounding. The measured content scale is published as the
// `--print-scale` CSS variable and applied (with width compensation) only in
// `@media print`, so the on-screen preview is never shrunk.
const PRINT_W = 748;
const PRINT_H = 1062;

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Triple curved corner wave (Dark Navy → Royal Blue → Gold), reproduced from the
 * Elangovan Associates visiting card. Rendered top-left; rotated 180° for the
 * bottom-right mirror that flows into the footer. Pure SVG (not clipped CSS
 * borders) with explicit colours so the curves scale and print perfectly.
 */
function CornerWaves({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none" style={PRINT_EXACT}>
      <path d="M168 6 C 88 12, 14 78, 6 168" stroke={NAVY} strokeWidth="22" strokeLinecap="round" />
      <path d="M132 6 C 70 11, 13 64, 6 132" stroke={ROYAL} strokeWidth="14" strokeLinecap="round" />
      <path d="M100 6 C 54 9, 9 52, 6 100" stroke={GOLD} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

/** Gold uppercase section label with a small leading icon. */
function SectionLabel({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <Icon className="h-3.5 w-3.5" style={{ color: GOLD }} strokeWidth={2.25} />
      <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: GOLD }}>
        {children}
      </span>
    </div>
  );
}

/** Right-column meta row with a navy icon box, label, and value. */
function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: NAVY, ...PRINT_EXACT }}
      >
        <Icon className="h-4 w-4 text-white" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-charcoal/50">{label}</p>
        <p className="truncate text-sm font-semibold" style={{ color: NAVY }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/** A single subtotal/tax line inside the totals card. */
function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6 py-0.5 text-sm">
      <span className="text-charcoal/70">{label}</span>
      <span className="font-medium tabular-nums" style={{ color: NAVY }}>
        {value}
      </span>
    </div>
  );
}

/** One label/value line in the bank-details card. */
function BankRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-0.5">
      <dt className="w-28 shrink-0 text-charcoal/50">{label}</dt>
      <dd className="font-semibold tracking-wide" style={{ color: NAVY }}>
        {value}
      </dd>
    </div>
  );
}

/**
 * Print-ready, A4 branded invoice document for Elangovan Associates.
 * Carries the `print-area` class consumed by the global print CSS and
 * `window.print()` export — all totals/amount-in-words logic is unchanged.
 */
export function InvoicePreview({
  form,
  className,
}: {
  form: InvoiceFormData;
  className?: string;
}) {
  const totals = computeTotals(form);
  const discountPct = parseFloat(form.discount_percent) || 0;
  const gstPct = parseFloat(form.gst_percent ?? "") || 0;
  const mca = parseFloat(form.mca_charges) || 0;
  const hasItems = form.items.some((i) => i.description);
  const halfGst = (gstPct / 2).toFixed(gstPct % 2 ? 2 : 0);

  // Auto-fit to one A4 page: measure the document's natural height at the print
  // width, then publish a downscale factor consumed only by the print stylesheet.
  // Runs before paint (no flicker) and re-measures whenever the form changes.
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prevWidth = el.style.width;
    const prevMinHeight = el.style.minHeight;
    el.style.minHeight = "0px";
    el.style.width = `${PRINT_W}px`;
    const natural = el.scrollHeight; // forces sync reflow at print width
    el.style.width = prevWidth;
    el.style.minHeight = prevMinHeight;
    const scale = Math.max(0.5, Math.min(1, PRINT_H / natural));
    el.style.setProperty("--print-scale", scale.toFixed(4));
  });

  return (
    <div
      ref={ref}
      style={PRINT_EXACT}
      className={cn(
        "print-area relative mx-auto flex min-h-[1123px] w-full max-w-[800px] flex-col overflow-hidden bg-white text-charcoal shadow-md print:min-h-0 print:shadow-none",
        className
      )}
    >
      {/* Visiting-card corner waves — top-left, and bottom-right flowing into the footer */}
      <CornerWaves className="pointer-events-none absolute -left-2 -top-2 z-20 h-36 w-36" />
      <CornerWaves className="pointer-events-none absolute -bottom-2 -right-2 z-30 h-44 w-44 rotate-180" />

      {/* ---------- Body (A4 margins) ---------- */}
      <div className="relative z-10 flex-1 px-12 pb-5 pt-8">
        {/* Header: EL logo + wordmark  |  INVOICE / TAX INVOICE */}
        <header className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3.5 pl-8">
            <BrandMark className="h-14 w-14 shrink-0" />
            <div className="leading-none">
              <p className="font-serif text-[1.7rem] font-semibold tracking-tight" style={{ color: NAVY }}>
                ELANGOVAN
              </p>
              <p
                className="mt-1.5 text-[11px] font-semibold uppercase"
                style={{ color: GOLD, letterSpacing: "8px" }}
              >
                Associates
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-serif text-[2rem] font-bold leading-none tracking-tight" style={{ color: NAVY }}>
              INVOICE
            </p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.32em]" style={{ color: GOLD }}>
              Tax Invoice
            </p>
          </div>
        </header>

        {/* Thin gold divider across the page */}
        <div
          className="mt-4 h-[2px] w-full"
          style={{ background: `linear-gradient(to right, ${GOLD}, ${GOLD}80 60%, ${GOLD}1A)`, ...PRINT_EXACT }}
        />

        {/* Customer + invoice meta */}
        <div className="mt-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {/* Bill To */}
          <div>
            <SectionLabel icon={User}>Bill To</SectionLabel>
            <p className="text-base font-bold" style={{ color: NAVY }}>
              {form.customer_name || "—"}
            </p>
            {form.customer_address && (
              <p className="mt-1.5 flex gap-1.5 whitespace-pre-line text-sm leading-relaxed text-charcoal/70">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                <span>{form.customer_address}</span>
              </p>
            )}
            {form.customer_contact && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal/70">
                <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                {form.customer_contact}
              </p>
            )}
            {form.customer_gst && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal/70">
                <ReceiptText className="h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} />
                GSTIN:&nbsp;
                <span className="font-semibold" style={{ color: NAVY }}>
                  {form.customer_gst}
                </span>
              </p>
            )}
          </div>

          {/* Invoice meta — navy icon boxes */}
          <div className="space-y-2.5 sm:justify-self-end sm:min-w-[270px]">
            <MetaItem icon={Hash} label="Invoice No." value={form.invoice_number || "—"} />
            <MetaItem icon={CalendarDays} label="Date" value={formatDate(form.invoice_date)} />
            {form.work_order_number && (
              <MetaItem icon={ClipboardList} label="Work Order No." value={form.work_order_number} />
            )}
            <MetaItem icon={MapPin} label="Place of Supply" value="Tamil Nadu" />
          </div>
        </div>

        {/* Services table */}
        <table className="mt-5 w-full border-collapse overflow-hidden rounded-md text-sm">
          <thead>
            <tr className="text-left text-white" style={{ backgroundColor: NAVY, ...PRINT_EXACT }}>
              <th className="w-12 px-4 py-2.5 font-semibold">#</th>
              <th className="px-4 py-2.5 font-semibold tracking-wide">Description of Services</th>
              <th className="w-44 px-4 py-2.5 text-right font-semibold tracking-wide">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {!hasItems ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-charcoal/40">
                  Add service items to see them here.
                </td>
              </tr>
            ) : (
              form.items.map((item, idx) => (
                <tr
                  key={idx}
                  className="bg-white transition-colors hover:bg-[#F7F3E8] print:hover:bg-white"
                  style={{ borderBottom: `1px solid ${GOLD}59`, ...PRINT_EXACT }}
                >
                  <td className="px-4 py-2.5 align-top font-medium text-charcoal/60 tabular-nums">{idx + 1}</td>
                  <td className="px-4 py-2.5 align-top text-charcoal">{item.description || "—"}</td>
                  <td className="px-4 py-2.5 text-right align-top font-medium tabular-nums" style={{ color: NAVY }}>
                    {formatINR(parseFloat(item.amount) || 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-[340px]">
            <div className="rounded-t-lg border border-b-0 px-4 py-2.5" style={{ borderColor: BORDER }}>
              <TotalRow label="Subtotal" value={formatINR(totals.services)} />
              {mca > 0 && <TotalRow label="MCA Charges" value={formatINR(mca)} />}
              {discountPct > 0 && (
                <TotalRow label={`Discount (${discountPct}%)`} value={`− ${formatINR(totals.discountAmount)}`} />
              )}
              <div className="my-1 h-px w-full" style={{ backgroundColor: BORDER }} />
              <TotalRow label={`CGST (${halfGst}%)`} value={formatINR(totals.cgst)} />
              <TotalRow label={`SGST (${halfGst}%)`} value={formatINR(totals.sgst)} />
            </div>
            {/* TOTAL AMOUNT — navy label | gold amount */}
            <div className="flex items-stretch overflow-hidden rounded-b-lg">
              <div
                className="flex flex-1 items-center px-4 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-white"
                style={{ backgroundColor: NAVY, ...PRINT_EXACT }}
              >
                Total Amount
              </div>
              <div
                className="flex items-center justify-end px-4 py-2.5 text-lg font-extrabold tabular-nums"
                style={{ backgroundColor: GOLD, color: NAVY, ...PRINT_EXACT }}
              >
                {formatINR(totals.total)}
              </div>
            </div>
          </div>
        </div>

        {/* Amount in words — full-width ivory card */}
        <div
          className="mt-4 flex items-center gap-3 rounded-lg px-4 py-2.5"
          style={{ backgroundColor: LIGHT_GOLD, border: `1px solid ${GOLD}40`, ...PRINT_EXACT }}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: NAVY, ...PRINT_EXACT }}
          >
            <FileText className="h-4 w-4 text-white" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>
              Amount in Words
            </p>
            <p className="text-sm font-semibold" style={{ color: NAVY }}>
              {amountInWords(totals.total)}
            </p>
          </div>
        </div>

        {/* Bank details (55%) + signatory (45%) — equal height */}
        <div className="mt-5 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-[55%_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: BORDER }}>
            <div className="px-4 py-2" style={{ backgroundColor: NAVY, ...PRINT_EXACT }}>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                <Landmark className="h-3.5 w-3.5" style={{ color: GOLD }} strokeWidth={2.25} />
                Bank Details
              </span>
            </div>
            <dl className="px-4 py-2.5 text-sm">
              <BankRow label="A/c Holder" value={FIRM.bank.accountName} />
              <BankRow label="Bank" value={FIRM.bank.bankName} />
              <BankRow label="A/c No." value={FIRM.bank.accountNo} />
              <BankRow label="IFSC" value={FIRM.bank.ifsc} />
              <BankRow label="GPay / PhonePe" value={FIRM.bank.gpay} />
            </dl>
          </div>

          <div
            className="flex flex-col items-center justify-center rounded-lg border px-4 py-4 text-center"
            style={{ borderColor: BORDER }}
          >
            <p className="font-serif text-base font-semibold" style={{ color: NAVY }}>
              For {FIRM.name}
            </p>
            <div className="mt-9 w-48 max-w-full border-t pt-2 text-[11px] font-medium uppercase tracking-[0.14em] text-charcoal/60" style={{ borderColor: NAVY }}>
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Footer (full-bleed navy, gold top border) ---------- */}
      <footer
        className="relative z-20 px-12 py-3"
        style={{ backgroundColor: NAVY, borderTop: `3px solid ${GOLD}`, ...PRINT_EXACT }}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-1.5 pr-16 text-[11px] text-white">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" style={{ color: GOLD }} strokeWidth={2.25} />
            {FIRM.addressLines.join(" ")}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5" style={{ color: GOLD }} strokeWidth={2.25} />
            {FIRM.email}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" style={{ color: GOLD }} strokeWidth={2.25} />
            {FIRM.phone}
          </span>
        </div>
      </footer>
    </div>
  );
}
