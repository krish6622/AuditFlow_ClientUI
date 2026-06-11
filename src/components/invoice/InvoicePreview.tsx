import { Brand } from "@/components/Brand";
import { FIRM } from "@/lib/firm";
import { amountInWords, computeTotals, formatINR } from "@/lib/invoice";
import { cn } from "@/lib/utils";
import type { InvoiceFormData } from "@/types/invoice";

// Print-safe visiting-card palette (rich, high-contrast for paper/PDF).
const NAVY = "#032B5A";
const ROYAL = "#004D99";
const GOLD = "#B8860B";

// Force colour-accurate printing (waves, table header, gold accents).
const PRINT_EXACT = {
  WebkitPrintColorAdjust: "exact",
  printColorAdjust: "exact",
} as React.CSSProperties;

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Triple curved corner wave (Dark Navy → Royal Blue → Gold), reproduced from
 * the Elangovan Associates visiting card. Rendered top-left; rotate 180° for the
 * bottom-right mirror. SVG (not clipped CSS borders) for perfect scaling, with
 * explicit colours so they survive PDF/print.
 */
function CornerWaves({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" fill="none" style={PRINT_EXACT}>
      <path d="M152 6 C 84 11, 13 72, 6 152" stroke={NAVY} strokeWidth="22" strokeLinecap="round" />
      <path d="M120 6 C 66 10, 12 62, 6 120" stroke={ROYAL} strokeWidth="15" strokeLinecap="round" />
      <path d="M92 6 C 50 9, 9 50, 6 92" stroke={GOLD} strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>
      {children}
    </p>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-8 py-0.5 text-sm">
      <span className="text-charcoal/60">{label}</span>
      <span className="font-semibold" style={{ color: NAVY }}>
        {value}
      </span>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6 py-1.5 text-sm">
      <span className="text-charcoal/70">{label}</span>
      <span className="tabular-nums" style={{ color: NAVY }}>
        {value}
      </span>
    </div>
  );
}

/** Print-ready, A4 branded invoice document. Carries the `print-area` class. */
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

  return (
    <div
      style={PRINT_EXACT}
      className={cn(
        "print-area relative mx-auto w-full max-w-[800px] overflow-hidden bg-white text-charcoal shadow-sm print:shadow-none",
        className
      )}
    >
      {/* Visiting-card corner waves */}
      <CornerWaves className="pointer-events-none absolute -left-1 -top-1 h-32 w-32" />
      <CornerWaves className="pointer-events-none absolute -bottom-1 -right-1 h-44 w-44 rotate-180" />

      <div className="relative z-10 px-10 py-9 sm:px-12">
        {/* Header: EL logo | ELANGOVAN ASSOCIATES */}
        <header className="flex items-start justify-between gap-4">
          <div className="pl-12">
            <Brand variant="onLight" size="lg" />
          </div>
          <div className="text-right">
            <p className="font-serif text-4xl font-medium leading-none tracking-tight" style={{ color: NAVY }}>
              Invoice
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Tax Invoice
            </p>
          </div>
        </header>

        <div
          className="mt-6 h-[2px] w-full"
          style={{ background: `linear-gradient(to right, ${GOLD}, ${GOLD}66, transparent)` }}
        />

        {/* Invoice meta + Bill To */}
        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <SectionLabel>Bill To</SectionLabel>
            <p className="text-base font-semibold" style={{ color: NAVY }}>
              {form.customer_name || "—"}
            </p>
            {form.customer_contact && (
              <p className="mt-0.5 text-sm text-charcoal/70">Contact: {form.customer_contact}</p>
            )}
            {form.customer_address && (
              <p className="mt-0.5 whitespace-pre-line text-sm text-charcoal/70">
                {form.customer_address}
              </p>
            )}
            {form.customer_gst && (
              <p className="mt-0.5 text-sm text-charcoal/70">
                GSTIN: <span className="font-medium" style={{ color: NAVY }}>{form.customer_gst}</span>
              </p>
            )}
          </div>
          <div className="sm:justify-self-end sm:min-w-[260px]">
            <SectionLabel>Invoice Details</SectionLabel>
            <MetaRow label="Invoice No." value={form.invoice_number || "—"} />
            <MetaRow label="Date" value={formatDate(form.invoice_date)} />
            {form.work_order_number && (
              <MetaRow label="Work Order No." value={form.work_order_number} />
            )}
          </div>
        </div>

        {/* Services table — navy header, gold separators, white rows */}
        <table className="mt-7 w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-white" style={{ backgroundColor: NAVY, ...PRINT_EXACT }}>
              <th className="w-12 px-3 py-2.5 font-medium">#</th>
              <th className="px-3 py-2.5 font-medium">Description of Services</th>
              <th className="w-44 px-3 py-2.5 text-right font-medium">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {!hasItems ? (
              <tr>
                <td colSpan={3} className="px-3 py-7 text-center text-charcoal/40">
                  Add service items to see them here.
                </td>
              </tr>
            ) : (
              form.items.map((item, idx) => (
                <tr key={idx} className="bg-white" style={{ borderBottom: `1px solid ${GOLD}66`, ...PRINT_EXACT }}>
                  <td className="px-3 py-2.5 align-top text-charcoal/70">{idx + 1}</td>
                  <td className="px-3 py-2.5 align-top text-charcoal">{item.description || "—"}</td>
                  <td className="px-3 py-2.5 text-right align-top tabular-nums text-charcoal">
                    {formatINR(parseFloat(item.amount) || 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-5 flex justify-end">
          <div className="w-full max-w-sm">
            <TotalRow label="Subtotal" value={formatINR(totals.services)} />
            {mca > 0 && <TotalRow label="MCA Charges" value={formatINR(mca)} />}
            {discountPct > 0 && (
              <TotalRow
                label={`Discount (${discountPct}%)`}
                value={`− ${formatINR(totals.discountAmount)}`}
              />
            )}
            <TotalRow label={`CGST (${halfGst}%)`} value={formatINR(totals.cgst)} />
            <TotalRow label={`SGST (${halfGst}%)`} value={formatINR(totals.sgst)} />

            {/* Total Amount — Signature Gold highlight */}
            <div
              className="mt-2.5 flex items-center justify-between rounded-md px-4 py-3"
              style={{ borderLeft: `4px solid ${GOLD}`, backgroundColor: `${GOLD}1A`, ...PRINT_EXACT }}
            >
              <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: NAVY }}>
                Total Amount
              </span>
              <span className="text-lg font-bold tabular-nums" style={{ color: NAVY }}>
                {formatINR(totals.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div
          className="mt-4 rounded-md bg-ivory px-3 py-2 text-sm"
          style={{ border: `1px solid ${GOLD}4D` }}
        >
          <span className="font-semibold text-charcoal/70">Amount in words: </span>
          <span style={{ color: NAVY }}>{amountInWords(totals.total)}</span>
        </div>

        {/* Bank details (60%) + signatory (40%) */}
        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-5 sm:items-center">
          <div className="text-sm sm:col-span-3">
            <SectionLabel>Bank Details</SectionLabel>
            <dl className="space-y-0.5 text-charcoal/70">
              {[
                ["A/c Name", FIRM.bank.accountName],
                ["Bank", FIRM.bank.bankName],
                ["A/c No.", FIRM.bank.accountNo],
                ["IFSC", FIRM.bank.ifsc],
                ["Branch", FIRM.bank.branch],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <dt className="w-24 shrink-0 text-charcoal/45">{label}</dt>
                  <dd className="font-medium" style={{ color: NAVY }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col items-center justify-center text-center sm:col-span-2">
            <p className="font-serif text-base font-medium" style={{ color: NAVY }}>
              For {FIRM.name}
            </p>
            <div className="mt-14 w-44 max-w-full border-t border-charcoal/40 pt-1.5 text-xs uppercase tracking-wider text-charcoal/60">
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>

      {/* Footer: darker-ivory strip, thin gold top border */}
      <footer
        className="relative z-10 px-10 pb-9 pt-4 sm:px-12"
        style={{ backgroundColor: "#F3EFE4", borderTop: `2px solid ${GOLD}99`, ...PRINT_EXACT }}
      >
        <div className="pr-24 text-center text-[11px] leading-relaxed text-charcoal/65">
          <p className="font-serif text-sm font-semibold tracking-wide" style={{ color: NAVY }}>
            {FIRM.name}
          </p>
          <p className="mt-0.5">{FIRM.addressLines.join(" ")}</p>
          <p className="mt-0.5">{FIRM.email}</p>
          <p className="mt-0.5">{FIRM.phone}</p>
        </div>
      </footer>
    </div>
  );
}
