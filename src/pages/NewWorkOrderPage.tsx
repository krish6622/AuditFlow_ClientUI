import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import { CustomerLookup } from "@/components/customers/CustomerLookup";
import { WorkOrderSummaryCard } from "@/components/work-orders/WorkOrderSummaryCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { ApiError, employeesApi, workOrdersApi } from "@/lib/api";
import type { CustomerLookupItem } from "@/types/customer";
import type { Employee } from "@/types/employee";
import {
  WORK_ORDER_CATEGORIES,
  WORK_ORDER_URGENCIES,
  type WorkOrder,
  type WorkOrderCategory,
  type WorkOrderInput,
  type WorkOrderUrgency,
} from "@/types/workOrder";

function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface FormState {
  category: WorkOrderCategory | "";
  category_other: string;
  customer_id: string;
  customer_name: string;
  contact_number: string;
  assignee_id: string;
  urgency: WorkOrderUrgency;
  order_date: string;
  due_date: string;
  description: string;
}

const emptyForm = (): FormState => ({
  category: "",
  category_other: "",
  customer_id: "",
  customer_name: "",
  contact_number: "",
  assignee_id: "",
  urgency: "medium",
  order_date: todayISO(),
  due_date: "",
  description: "",
});

type Errors = Partial<Record<keyof FormState, string>>;

/** Small labelled field wrapper with an inline error slot. */
function Fieldset({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
        {hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function NewWorkOrderPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const isAdmin = can("workorder:manage");
  const backTo = isAdmin ? "/work-orders" : "/my-requests";

  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLookupItem | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<WorkOrder | null>(null);

  useEffect(() => {
    // Only admins assign on create, so only they need the employee list.
    if (isAdmin) employeesApi.list().then(setEmployees).catch(() => setEmployees([]));
  }, [isAdmin]);

  const activeEmployees = useMemo(
    () => employees.filter((e) => e.is_active),
    [employees]
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  // Selecting a customer from the master auto-populates the client fields.
  function applyCustomer(customer: CustomerLookupItem | null) {
    setSelectedCustomer(customer);
    if (customer) {
      setForm((f) => ({
        ...f,
        customer_id: customer.id,
        customer_name: customer.business_name || customer.client_name,
        contact_number: customer.mobile_number ?? f.contact_number,
      }));
      setErrors((e) => ({ ...e, customer_name: undefined, contact_number: undefined }));
    } else {
      setForm((f) => ({ ...f, customer_id: "" }));
    }
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!form.category) next.category = "Please choose a category.";
    if (form.category === "others" && !form.category_other.trim())
      next.category_other = "Please describe the 'Others' category.";
    if (!form.customer_name.trim()) next.customer_name = "Customer name is required.";
    if (!form.contact_number.trim()) next.contact_number = "Contact number is required.";
    else if (!/^[0-9+\-\s()]{6,20}$/.test(form.contact_number.trim()))
      next.contact_number = "Enter a valid contact number.";
    if (!form.description.trim()) next.description = "Please describe the work to be done.";
    if (form.due_date && form.order_date && form.due_date < form.order_date)
      next.due_date = "Due date cannot be before the order date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) {
      setFormError("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    const payload: WorkOrderInput = {
      category: form.category as WorkOrderCategory,
      category_other: form.category === "others" ? form.category_other.trim() : null,
      customer_id: form.customer_id || null,
      customer_name: form.customer_name.trim(),
      contact_number: form.contact_number.trim() || null,
      urgency: form.urgency,
      description: form.description.trim(),
    };
    if (isAdmin) {
      // Only admins may assign / schedule / quote on creation. Employee requests
      // always enter the queue awaiting assignment (the server also enforces this).
      payload.assignee_id = form.assignee_id || null;
      payload.order_date = form.order_date || null;
      payload.due_date = form.due_date || null;
    }
    try {
      setCreated(await workOrdersApi.create(payload));
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not create the work order.");
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setForm(emptyForm());
    setSelectedCustomer(null);
    setErrors({});
    setFormError(null);
    setCreated(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild aria-label="Back">
          <Link to={backTo}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isAdmin ? "New Work Order" : "New Work Request"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {created
              ? "Review the summary below."
              : isAdmin
                ? "Raise a job for a client. The work order number is generated automatically."
                : "Submit a request. An admin will review it and assign an employee."}
          </p>
        </div>
      </div>

      {created ? (
        <WorkOrderSummaryCard workOrder={created} onCreateAnother={reset} />
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6" noValidate>
          {/* Service details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Fieldset id="category" label="Category" required error={errors.category}>
                <Select
                  id="category"
                  value={form.category}
                  onChange={(e) => set("category", e.target.value as WorkOrderCategory | "")}
                >
                  <option value="" disabled>
                    Select a category…
                  </option>
                  {WORK_ORDER_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </Fieldset>

              <Fieldset id="urgency" label="Urgency" required error={errors.urgency}>
                <Select
                  id="urgency"
                  value={form.urgency}
                  onChange={(e) => set("urgency", e.target.value as WorkOrderUrgency)}
                >
                  {WORK_ORDER_URGENCIES.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </Select>
              </Fieldset>

              {form.category === "others" && (
                <div className="sm:col-span-2">
                  <Fieldset
                    id="category_other"
                    label="Describe the category"
                    required
                    error={errors.category_other}
                  >
                    <Input
                      id="category_other"
                      value={form.category_other}
                      placeholder="e.g. Trademark registration"
                      onChange={(e) => set("category_other", e.target.value)}
                    />
                  </Fieldset>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Fieldset
                  id="customer_lookup"
                  label="Find customer"
                  hint="(search the customer master to auto-fill)"
                >
                  <CustomerLookup selected={selectedCustomer} onSelect={applyCustomer} />
                </Fieldset>
              </div>
              <Fieldset id="customer_name" label="Customer name" required error={errors.customer_name}>
                <Input
                  id="customer_name"
                  value={form.customer_name}
                  onChange={(e) => set("customer_name", e.target.value)}
                />
              </Fieldset>
              <Fieldset
                id="contact_number"
                label="Contact Number"
                required
                error={errors.contact_number}
              >
                <Input
                  id="contact_number"
                  inputMode="tel"
                  value={form.contact_number}
                  placeholder="Enter customer contact number"
                  onChange={(e) => set("contact_number", e.target.value)}
                />
              </Fieldset>
            </CardContent>
          </Card>

          {/* Assignment & schedule — admins only (employees can't assign or schedule) */}
          {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignment & schedule</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Fieldset id="assignee_id" label="Assigned employee" hint="(optional)">
                <Select
                  id="assignee_id"
                  value={form.assignee_id}
                  onChange={(e) => set("assignee_id", e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {activeEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}
                      {emp.designation ? ` · ${emp.designation}` : ""}
                    </option>
                  ))}
                </Select>
              </Fieldset>

              <Fieldset id="order_date" label="Date" required error={errors.order_date}>
                <Input
                  id="order_date"
                  type="date"
                  value={form.order_date}
                  onChange={(e) => set("order_date", e.target.value)}
                />
              </Fieldset>

              <Fieldset id="due_date" label="Due Date" hint="(Optional)" error={errors.due_date}>
                <Input
                  id="due_date"
                  type="date"
                  value={form.due_date}
                  placeholder="Select due date"
                  onChange={(e) => set("due_date", e.target.value)}
                />
              </Fieldset>
            </CardContent>
          </Card>
          )}

          {/* Work description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Work description</CardTitle>
            </CardHeader>
            <CardContent>
              <Fieldset id="description" label="Details" required error={errors.description}>
                <Textarea
                  id="description"
                  rows={5}
                  value={form.description}
                  placeholder="Describe the scope of work, documents required, etc."
                  onChange={(e) => set("description", e.target.value)}
                />
              </Fieldset>
            </CardContent>
          </Card>

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(backTo)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isAdmin ? "Save work order" : "Submit request"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
