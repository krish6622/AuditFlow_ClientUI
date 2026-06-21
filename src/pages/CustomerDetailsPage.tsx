import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";

import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { ApiError, customersApi } from "@/lib/api";
import {
  CUSTOMER_TYPE_LABELS,
  type Customer,
  type CustomerAuditEntry,
  type CustomerInvoiceItem,
  type CustomerWorkOrderItem,
} from "@/types/customer";

const AUDIT_LABELS: Record<string, string> = {
  customer_created: "Created",
  customer_updated: "Updated",
  customer_deleted: "Deleted",
  customer_activated: "Activated",
  customer_deactivated: "Deactivated",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleDateString() : "—");
const fmtDateTime = (s: string) => new Date(s).toLocaleString();

export default function CustomerDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can("customer:manage");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [workOrders, setWorkOrders] = useState<CustomerWorkOrderItem[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoiceItem[]>([]);
  const [audit, setAudit] = useState<CustomerAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, wos, invs, logs] = await Promise.all([
        customersApi.get(id),
        customersApi.workOrders(id),
        customersApi.invoices(id),
        customersApi.auditLogs(id),
      ]);
      setCustomer(c);
      setWorkOrders(wos);
      setInvoices(invs);
      setAudit(logs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load customer");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/customers")}>
          <ArrowLeft className="h-4 w-4" /> Back to customers
        </Button>
        <p className="text-sm text-destructive">{error ?? "Customer not found."}</p>
      </div>
    );
  }

  const c = customer;
  const fullAddress = [c.address_line_1, c.address_line_2, c.city, c.state, c.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/customers")} aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {c.client_name}
              </h1>
              <Badge variant={c.customer_type === "gst" ? "gold" : "navy"}>
                {CUSTOMER_TYPE_LABELS[c.customer_type]}
              </Badge>
              <Badge variant={c.is_active ? "green" : "secondary"}>
                {c.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">{c.customer_code}</p>
          </div>
        </div>
        {canManage && (
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Section title="Basic Information">
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Client Name" value={c.client_name} />
            <Field label="Mobile Number" value={c.mobile_number} />
            <Field label="Alternate Mobile" value={c.alternate_mobile_number} />
            <Field label="Email" value={c.email} />
            <Field label="Date of Birth" value={fmtDate(c.date_of_birth)} />
          </dl>
        </Section>

        <Section title="Business Information">
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Business Name" value={c.business_name} />
            <Field label="Proprietor Name" value={c.proprietor_name} />
          </dl>
        </Section>

        <Section title="Tax Information">
          <dl className="grid grid-cols-2 gap-4">
            <Field label="GST Number" value={c.gst_number} />
            <Field label="PAN Number" value={c.pan_number} />
            <Field label="Aadhaar Number" value={c.aadhaar_number} />
          </dl>
        </Section>

        <Section title="Address Information">
          <dl className="grid grid-cols-2 gap-4">
            <Field label="Address Line 1" value={c.address_line_1} />
            <Field label="Address Line 2" value={c.address_line_2} />
            <Field label="City" value={c.city} />
            <Field label="State" value={c.state} />
            <Field label="Pincode" value={c.pincode} />
            <Field label="Full Address" value={fullAddress} />
          </dl>
          {c.remarks && (
            <div className="mt-4">
              <Field label="Remarks" value={c.remarks} />
            </div>
          )}
        </Section>
      </div>

      {/* Work Order History */}
      <Section title={`Work Order History (${workOrders.length})`}>
        {workOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No work orders linked to this customer.</p>
        ) : (
          <ul className="divide-y">
            {workOrders.map((wo) => (
              <li key={wo.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  <span className="font-mono text-xs text-muted-foreground">{wo.number}</span>{" "}
                  {wo.title ?? "Work order"}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-muted-foreground">{fmtDate(wo.order_date)}</span>
                  <Badge variant="outline">{wo.status.replace(/_/g, " ")}</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Invoice History */}
      <Section title={`Invoice History (${invoices.length})`}>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices linked to this customer.</p>
        ) : (
          <ul className="divide-y">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between py-2 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{inv.number}</span>
                <span className="flex items-center gap-3">
                  <span>₹{inv.total}</span>
                  <span className="text-muted-foreground">{fmtDate(inv.issue_date)}</span>
                  <Badge variant="outline">{inv.status}</Badge>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Audit History */}
      <Section title={`Audit History (${audit.length})`}>
        {audit.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit activity yet.</p>
        ) : (
          <ul className="divide-y">
            {audit.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Badge variant="outline">{AUDIT_LABELS[a.action] ?? a.action}</Badge>
                  <span className="text-muted-foreground">
                    by {a.performed_by_name ?? "System"}
                  </span>
                </span>
                <span className="text-muted-foreground">{fmtDateTime(a.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <CustomerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={load}
        customer={c}
      />
    </div>
  );
}
