import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { customersApi } from "@/lib/api";
import { CUSTOMER_TYPE_LABELS, type CustomerLookupItem } from "@/types/customer";

interface Props {
  selected: CustomerLookupItem | null;
  onSelect: (customer: CustomerLookupItem | null) => void;
}

/**
 * Customer picker for work-order / invoice creation. Searches the active
 * customer master by client name, mobile, GST or PAN; selecting a result hands
 * the full record back so the caller can auto-populate its fields.
 */
export function CustomerLookup({ selected, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerLookupItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced search.
  useEffect(() => {
    if (selected) return; // not searching while a customer is locked in
    const q = query.trim();
    let active = true;
    setLoading(true);
    const t = setTimeout(() => {
      customersApi
        .lookup(q || undefined)
        .then((r) => active && setResults(r))
        .catch(() => active && setResults([]))
        .finally(() => active && setLoading(false));
    }, 250);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query, selected]);

  if (selected) {
    return (
      <div className="flex items-center justify-between rounded-md border border-input bg-muted/40 px-3 py-2">
        <div className="text-sm">
          <span className="font-medium">{selected.client_name}</span>
          <span className="ml-2 font-mono text-xs text-muted-foreground">
            {selected.customer_code} · {CUSTOMER_TYPE_LABELS[selected.customer_type]}
          </span>
          {selected.mobile_number && (
            <span className="ml-2 text-muted-foreground">{selected.mobile_number}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            onSelect(null);
            setQuery("");
          }}
          className="rounded-sm opacity-60 hover:opacity-100"
          aria-label="Clear selected customer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search customer by name, mobile, GST or PAN…"
          className="pl-8"
        />
      </div>
      {open && (
        <div className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-card py-1 shadow-lg">
          {loading ? (
            <div className="px-3 py-3 text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted-foreground">
              No active customers found.
            </div>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c);
                  setOpen(false);
                }}
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{c.client_name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {c.customer_code}
                  {c.mobile_number ? ` · ${c.mobile_number}` : ""}
                  {c.gst_number ? ` · ${c.gst_number}` : ""}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
