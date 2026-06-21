import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Printer, Save } from "lucide-react";

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { Button } from "@/components/ui/button";
import { ApiError, invoicingApi } from "@/lib/api";
import type { CustomerLookupItem } from "@/types/customer";
import type { InvoiceCreatePayload, InvoiceFormData, SavedInvoice } from "@/types/invoice";

const today = () => new Date().toISOString().slice(0, 10);

/** Compose a printable address block from a customer-master record. */
function formatCustomerAddress(c: CustomerLookupItem): string {
  const cityState = [c.city, c.state].filter(Boolean).join(", ");
  const lastLine = [cityState, c.pincode].filter(Boolean).join(" - ");
  return [c.address_line_1, c.address_line_2, lastLine]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join("\n");
}

const EMPTY: InvoiceFormData = {
  invoice_number: "",
  invoice_date: today(),
  customer_name: "",
  customer_address: "",
  mca_charges: "",
  discount_percent: "",
  items: [{ description: "", amount: "" }],
  work_order_number: "",
  customer_contact: "",
  customer_gst: "",
  gst_percent: "",
};

function toFormData(inv: SavedInvoice): InvoiceFormData {
  return {
    invoice_number: inv.invoice_number,
    invoice_date: inv.invoice_date,
    customer_name: inv.customer_name,
    customer_address: inv.customer_address ?? "",
    mca_charges: String(Number(inv.mca_charges)),
    discount_percent: String(Number(inv.discount_percent)),
    items: inv.items.map((i) => ({ description: i.description, amount: String(Number(i.amount)) })),
    work_order_number: "",
    customer_contact: "",
    customer_gst: "",
    gst_percent: "",
  };
}

interface InvoicePrefill {
  customerName?: string;
  customerAddress?: string;
  items?: { description: string; amount: number }[];
}

export default function InvoiceBuilderPage() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const idParam = params.get("id");

  const [form, setForm] = useState<InvoiceFormData>(EMPTY);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLookupItem | null>(null);
  const [saved, setSaved] = useState(false); // locked after save / when viewing
  const [loading, setLoading] = useState(false);
  const [savingErr, setSavingErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [numberEdited, setNumberEdited] = useState(false);

  // Load an existing invoice when ?id is present.
  useEffect(() => {
    if (!idParam) return;
    setLoading(true);
    invoicingApi
      .get(idParam)
      .then((inv) => {
        setForm(toFormData(inv));
        setSaved(true);
      })
      .catch((err) => setSavingErr(err instanceof ApiError ? err.message : "Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [idParam]);

  // Prefill from a completed work order ("Create Invoice" action).
  useEffect(() => {
    const prefill = (location.state as { prefill?: InvoicePrefill } | null)?.prefill;
    if (!prefill || idParam) return;
    setForm((f) => ({
      ...f,
      customer_name: prefill.customerName ?? f.customer_name,
      customer_address: prefill.customerAddress ?? f.customer_address,
      items:
        prefill.items && prefill.items.length
          ? prefill.items.map((i) => ({
              description: i.description ?? "",
              amount: i.amount != null ? String(i.amount) : "",
            }))
          : f.items,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-generate the invoice number from the date (unless viewing or edited).
  useEffect(() => {
    if (idParam || saved || numberEdited) return;
    let active = true;
    invoicingApi
      .nextNumber(form.invoice_date)
      .then(({ invoice_number }) => {
        if (active) setForm((f) => ({ ...f, invoice_number }));
      })
      .catch(() => {
        /* leave the field blank; server still auto-assigns on save */
      });
    return () => {
      active = false;
    };
  }, [form.invoice_date, numberEdited, idParam, saved]);

  // Selecting a customer from the master auto-fills the client fields.
  function applyCustomer(customer: CustomerLookupItem | null) {
    setSelectedCustomer(customer);
    if (!customer) return;
    setForm((f) => ({
      ...f,
      customer_name: customer.business_name || customer.client_name,
      customer_contact: customer.mobile_number || f.customer_contact,
      customer_gst: customer.gst_number || f.customer_gst,
      customer_address: formatCustomerAddress(customer) || f.customer_address,
    }));
  }

  function validate(): string | null {
    if (!form.invoice_number.trim()) return "Invoice number is required";
    if (!form.invoice_date) return "Invoice date is required";
    if (!form.customer_name.trim()) return "Customer name is required";
    if (!form.items.some((i) => i.description.trim())) return "Add at least one service item";
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) {
      setSavingErr(err);
      return;
    }
    setSavingErr(null);
    setBusy(true);
    const payload: InvoiceCreatePayload = {
      invoice_number: form.invoice_number.trim(),
      invoice_date: form.invoice_date,
      customer_name: form.customer_name.trim(),
      customer_address: form.customer_address.trim() || null,
      mca_charges: Number(form.mca_charges) || 0,
      discount_percent: Number(form.discount_percent) || 0,
      items: form.items
        .filter((i) => i.description.trim())
        .map((i) => ({ description: i.description.trim(), amount: Number(i.amount) || 0 })),
    };
    try {
      const inv = await invoicingApi.create(payload);
      setSaved(true);
      setParams({ id: inv.id }, { replace: true });
    } catch (e) {
      setSavingErr(e instanceof ApiError ? e.message : "Could not save invoice");
    } finally {
      setBusy(false);
    }
  }

  function resetNew() {
    setForm({ ...EMPTY, invoice_date: today() });
    setSelectedCustomer(null);
    setSaved(false);
    setNumberEdited(false);
    setSavingErr(null);
    setParams({}, { replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Toolbar (hidden when printing) */}
      <div className="no-print sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <h1 className="text-base font-semibold">Invoice Builder</h1>
          <div className="ml-auto flex items-center gap-2">
            {saved && (
              <span className="hidden items-center gap-1 text-sm text-emerald-600 sm:flex">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
            {saved ? (
              <Button variant="outline" size="sm" onClick={resetNew}>
                New Invoice
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Invoice
              </Button>
            )}
            <Button variant="default" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {savingErr && (
          <div className="no-print mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {savingErr}
          </div>
        )}

        <div className="invoice-grid grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Form (hidden when printing) */}
          <div className="no-print rounded-xl border bg-card p-5 shadow-sm">
            {loading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
            ) : (
              <InvoiceForm
                form={form}
                setForm={setForm}
                disabled={saved}
                numberHint="Auto-generated from the invoice date — you can edit it."
                onInvoiceNumberManualEdit={() => setNumberEdited(true)}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={applyCustomer}
              />
            )}
          </div>

          {/* Live preview / print area */}
          <div>
            <InvoicePreview form={form} />
          </div>
        </div>
      </div>
    </div>
  );
}
