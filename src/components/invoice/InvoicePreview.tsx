import { FIRM } from "@/lib/firm";
import { amountInWords, computeTotals, formatINR } from "@/lib/invoice";
import { cn } from "@/lib/utils";
import type { InvoiceFormData } from "@/types/invoice";

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function TotalRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 py-1.5 text-sm",
        strong && "border-t border-slate-300 pt-2 text-base font-bold"
      )}
    >
      <span className={cn("text-slate-600", strong && "text-slate-900")}>{label}</span>
      <span className="tabular-nums text-slate-900">{value}</span>
    </div>
  );
}

/** Print-ready invoice document. Apply the `print-area` class for printing. */
export function InvoicePreview({
  form,
  className,
}: {
  form: InvoiceFormData;
  className?: string;
}) {
  const totals = computeTotals(form);
  const discountPct = parseFloat(form.discount_percent) || 0;

  return (
    <div
      className={cn(
        "print-area mx-auto w-full max-w-[800px] bg-white p-8 text-slate-900 shadow-sm sm:p-10",
        className
      )}
    >
      {/* Firm header */}
      <header className="border-b-2 border-slate-800 pb-4 text-center">
        <h1 className="text-2xl font-bold tracking-wide text-slate-900">{FIRM.name}</h1>
        <p className="mt-0.5 text-sm font-medium text-blue-700">{FIRM.tagline}</p>
        <div className="mt-2 text-xs leading-relaxed text-slate-600">
          {FIRM.addressLines.map((l) => (
            <p key={l}>{l}</p>
          ))}
          <p>
            {FIRM.email} · {FIRM.phone} · PAN: {FIRM.pan}
          </p>
        </div>
      </header>

      <p className="my-4 text-center text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        Invoice
      </p>

      {/* Bill To + meta */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Bill To
          </p>
          <p className="font-semibold text-slate-900">{form.customer_name || "—"}</p>
          {form.customer_address && (
            <p className="mt-0.5 whitespace-pre-line text-sm text-slate-600">
              {form.customer_address}
            </p>
          )}
        </div>
        <div className="text-sm">
          <div className="flex justify-between gap-8 py-0.5">
            <span className="text-slate-500">Invoice No.</span>
            <span className="font-semibold text-slate-900">{form.invoice_number || "—"}</span>
          </div>
          <div className="flex justify-between gap-8 py-0.5">
            <span className="text-slate-500">Invoice Date</span>
            <span className="font-semibold text-slate-900">{formatDate(form.invoice_date)}</span>
          </div>
        </div>
      </div>

      {/* Service table */}
      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="w-12 border border-slate-800 px-3 py-2 text-left">#</th>
            <th className="border border-slate-800 px-3 py-2 text-left">Description</th>
            <th className="w-40 border border-slate-800 px-3 py-2 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {form.items.length === 0 || form.items.every((i) => !i.description) ? (
            <tr>
              <td colSpan={3} className="border border-slate-300 px-3 py-6 text-center text-slate-400">
                Add service items to see them here.
              </td>
            </tr>
          ) : (
            form.items.map((item, idx) => (
              <tr key={idx} className="even:bg-slate-50">
                <td className="border border-slate-300 px-3 py-2 align-top">{idx + 1}</td>
                <td className="border border-slate-300 px-3 py-2 align-top">{item.description || "—"}</td>
                <td className="border border-slate-300 px-3 py-2 text-right align-top tabular-nums">
                  {formatINR(parseFloat(item.amount) || 0)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-full max-w-xs">
          <TotalRow label="Service Total" value={formatINR(totals.services)} />
          <TotalRow label="MCA Charges" value={formatINR(parseFloat(form.mca_charges) || 0)} />
          <TotalRow label="Gross Total" value={formatINR(totals.gross)} />
          <TotalRow
            label={`Discount (${discountPct}%)`}
            value={`− ${formatINR(totals.discountAmount)}`}
          />
          <TotalRow label="Net Total" value={formatINR(totals.net)} strong />
        </div>
      </div>

      {/* Amount in words */}
      <div className="mt-4 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
        <span className="font-semibold text-slate-700">Amount in words: </span>
        <span className="text-slate-800">{amountInWords(totals.net)}</span>
      </div>

      {/* Bank details + signature */}
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:justify-between">
        <div className="text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Bank Details
          </p>
          <dl className="space-y-0.5 text-slate-700">
            <div className="flex gap-2">
              <dt className="w-28 text-slate-500">Account Name</dt>
              <dd className="font-medium">{FIRM.bank.accountName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 text-slate-500">Bank</dt>
              <dd className="font-medium">{FIRM.bank.bankName}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 text-slate-500">A/c No.</dt>
              <dd className="font-medium tabular-nums">{FIRM.bank.accountNo}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 text-slate-500">IFSC</dt>
              <dd className="font-medium">{FIRM.bank.ifsc}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 text-slate-500">Branch</dt>
              <dd className="font-medium">{FIRM.bank.branch}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col items-end justify-end text-sm">
          <p className="mb-12 font-semibold text-slate-700">For {FIRM.name}</p>
          <p className="border-t border-slate-400 pt-1 text-slate-600">Authorised Signatory</p>
        </div>
      </div>

      {/* Declaration footer */}
      <footer className="mt-8 border-t border-slate-200 pt-3 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-600">Declaration</p>
        <p className="mt-1">{FIRM.declaration}</p>
        <p className="mt-2">This is a computer-generated invoice.</p>
      </footer>
    </div>
  );
}
