import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { computeTotals, formatINR } from "@/lib/invoice";
import type { InvoiceFormData, LineItemInput } from "@/types/invoice";

interface Props {
  form: InvoiceFormData;
  setForm: React.Dispatch<React.SetStateAction<InvoiceFormData>>;
  disabled?: boolean;
  /** Hint shown under the (auto-generated) invoice number field. */
  numberHint?: string;
  /** Called when the user manually edits the invoice number. */
  onInvoiceNumberManualEdit?: () => void;
}

export function InvoiceForm({
  form,
  setForm,
  disabled,
  numberHint,
  onInvoiceNumberManualEdit,
}: Props) {
  const totals = computeTotals(form);

  function setField<K extends keyof InvoiceFormData>(key: K, value: InvoiceFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setItem(index: number, patch: Partial<LineItemInput>) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { description: "", amount: "" }] }));
  }

  function removeItem(index: number) {
    setForm((f) => ({
      ...f,
      items: f.items.length > 1 ? f.items.filter((_, i) => i !== index) : f.items,
    }));
  }

  return (
    <div className="space-y-6">
      {/* Invoice meta */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Invoice Details
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="invoice_number">Invoice Number</Label>
            <Input
              id="invoice_number"
              value={form.invoice_number}
              onChange={(e) => {
                setField("invoice_number", e.target.value);
                onInvoiceNumberManualEdit?.();
              }}
              placeholder="Auto-generated"
              disabled={disabled}
            />
            {numberHint && !disabled && (
              <p className="text-xs text-muted-foreground">{numberHint}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice_date">Invoice Date</Label>
            <Input
              id="invoice_date"
              type="date"
              value={form.invoice_date}
              onChange={(e) => setField("invoice_date", e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_name">Customer Name</Label>
          <Input
            id="customer_name"
            value={form.customer_name}
            onChange={(e) => setField("customer_name", e.target.value)}
            placeholder="Acme Pvt Ltd"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_address">Customer Address</Label>
          <Textarea
            id="customer_address"
            value={form.customer_address}
            onChange={(e) => setField("customer_address", e.target.value)}
            placeholder="12 MG Road, Chennai - 600 001"
            disabled={disabled}
          />
        </div>
      </section>

      {/* Service items */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Service Items
          </h2>
          <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={disabled}>
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>

        <div className="space-y-2">
          {form.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Input
                value={item.description}
                onChange={(e) => setItem(i, { description: e.target.value })}
                placeholder={`Service description ${i + 1}`}
                className="flex-1"
                disabled={disabled}
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.amount}
                onChange={(e) => setItem(i, { amount: e.target.value })}
                placeholder="0.00"
                className="w-32"
                disabled={disabled}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(i)}
                disabled={disabled || form.items.length <= 1}
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Charges */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Charges &amp; Discount
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mca_charges">MCA Charges (₹)</Label>
            <Input
              id="mca_charges"
              type="number"
              min="0"
              step="0.01"
              value={form.mca_charges}
              onChange={(e) => setField("mca_charges", e.target.value)}
              placeholder="0.00"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount_percent">Discount (%)</Label>
            <Input
              id="discount_percent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.discount_percent}
              onChange={(e) => setField("discount_percent", e.target.value)}
              placeholder="0"
              disabled={disabled}
            />
          </div>
        </div>
      </section>

      {/* Live totals */}
      <section className="rounded-lg border bg-muted/40 p-4">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Service Total</dt>
            <dd className="tabular-nums">{formatINR(totals.services)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Gross Total</dt>
            <dd className="tabular-nums">{formatINR(totals.gross)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Discount</dt>
            <dd className="tabular-nums">− {formatINR(totals.discountAmount)}</dd>
          </div>
          <div className="flex justify-between border-t pt-1.5 text-base font-semibold">
            <dt>Net Total</dt>
            <dd className="tabular-nums">{formatINR(totals.net)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
