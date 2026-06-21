import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Contact, Loader2, Plus } from "lucide-react";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CustomerActionsMenu } from "@/components/customers/CustomerActionsMenu";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { ApiError, customersApi } from "@/lib/api";
import {
  CUSTOMER_TYPE_LABELS,
  type Customer,
  type CustomerStats,
  type CustomerType,
} from "@/types/customer";

type TypeFilter = "" | CustomerType;
type StatusFilter = "" | "active" | "inactive";
type Pending = { kind: "deactivate" | "delete"; customer: Customer };

const EMPTY_STATS: CustomerStats = { total: 0, gst: 0, income_tax: 0, active: 0, inactive: 0 };

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </Card>
  );
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canManage = can("customer:manage");

  const [items, setItems] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>(EMPTY_STATS);
  const [cities, setCities] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [cityFilter, setCityFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const [pending, setPending] = useState<Pending | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, statsResp] = await Promise.all([
        customersApi.list({
          search: search.trim() || undefined,
          customer_type: typeFilter || undefined,
          status: statusFilter || undefined,
          city: cityFilter || undefined,
        }),
        customersApi.stats(),
      ]);
      setItems(list);
      setStats(statsResp);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, cityFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  // City list is independent of the active filters.
  useEffect(() => {
    customersApi.cities().then(setCities).catch(() => setCities([]));
  }, [items.length]);

  async function activate(customer: Customer) {
    setError(null);
    try {
      await customersApi.activate(customer.id);
      void load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not activate customer");
    }
  }

  async function confirmPending() {
    if (!pending) return;
    setConfirmLoading(true);
    setConfirmError(null);
    try {
      if (pending.kind === "deactivate") await customersApi.deactivate(pending.customer.id);
      else await customersApi.remove(pending.customer.id);
      setPending(null);
      void load();
    } catch (err) {
      setConfirmError(err instanceof ApiError ? err.message : "Action failed");
    } finally {
      setConfirmLoading(false);
    }
  }

  const colSpan = 9;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The single source of truth for GST and Income-Tax clients.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        )}
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Customers" value={stats.total} />
        <StatCard label="GST Clients" value={stats.gst} />
        <StatCard label="Income Tax Clients" value={stats.income_tax} />
        <StatCard label="Inactive Customers" value={stats.inactive} />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          placeholder="Search by name, mobile, GST, PAN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select
          className="sm:w-44"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
          aria-label="Filter by customer type"
        >
          <option value="">All types</option>
          <option value="gst">GST</option>
          <option value="income_tax">Income Tax</option>
        </Select>
        <Select
          className="sm:w-40"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Select
          className="sm:w-44"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          aria-label="Filter by city"
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Code</TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Business Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead>PAN Number</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colSpan} className="py-12 text-center text-muted-foreground">
                  <Contact className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              items.map((c) => (
                <TableRow
                  key={c.id}
                  className={c.is_active ? undefined : "opacity-60"}
                >
                  <TableCell className="font-mono text-xs">
                    <button
                      type="button"
                      className="text-royal hover:underline"
                      onClick={() => navigate(`/customers/${c.id}`)}
                    >
                      {c.customer_code}
                    </button>
                  </TableCell>
                  <TableCell className="font-medium">{c.client_name}</TableCell>
                  <TableCell>
                    <Badge variant={c.customer_type === "gst" ? "gold" : "navy"}>
                      {CUSTOMER_TYPE_LABELS[c.customer_type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.business_name ?? "—"}</TableCell>
                  <TableCell>{c.mobile_number ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{c.gst_number ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{c.pan_number ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? "green" : "secondary"}>
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <CustomerActionsMenu
                      customer={c}
                      canManage={canManage}
                      canDelete={canManage}
                      onView={() => navigate(`/customers/${c.id}`)}
                      onEdit={() => {
                        setEditing(c);
                        setModalOpen(true);
                      }}
                      onActivate={() => activate(c)}
                      onDeactivate={() => {
                        setConfirmError(null);
                        setPending({ kind: "deactivate", customer: c });
                      }}
                      onDelete={() => {
                        setConfirmError(null);
                        setPending({ kind: "delete", customer: c });
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CustomerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        customer={editing}
      />

      <ConfirmDialog
        open={pending?.kind === "deactivate"}
        title="Deactivate Customer"
        message="This customer will be marked inactive. Existing work orders and invoices are preserved."
        confirmLabel="Deactivate"
        loading={confirmLoading}
        error={confirmError}
        onConfirm={confirmPending}
        onClose={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending?.kind === "delete"}
        title="Delete Customer"
        message="This permanently removes the customer record. This action cannot be undone."
        warning="If this customer has work orders or invoices, deletion is blocked — deactivate instead."
        confirmLabel="Delete Customer"
        destructive
        loading={confirmLoading}
        error={confirmError}
        onConfirm={confirmPending}
        onClose={() => setPending(null)}
      />
    </div>
  );
}
