import { Link } from "react-router-dom";
import { FilePlus2, Sparkles } from "lucide-react";

export function PromoCard() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 p-6 text-white shadow-lg">
      {/* Decorative illustration placeholder */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative max-w-md">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
          <Sparkles className="h-5 w-5" />
        </div>
        <h3 className="text-xl font-semibold">Create invoices faster</h3>
        <p className="mt-1.5 text-sm text-blue-100">
          Convert completed work orders into professional invoices in just a few clicks.
        </p>
        <Link
          to="/invoices"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-700 shadow-sm transition-transform hover:scale-[1.02]"
        >
          <FilePlus2 className="h-4 w-4" />
          Create Invoice
        </Link>
      </div>
    </div>
  );
}
