import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, customersApi } from "@/lib/api";
import type { Customer, CustomerInput, CustomerType } from "@/types/customer";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  customer?: Customer | null;
}

interface FormState {
  customer_type: CustomerType;
  client_name: string;
  business_name: string;
  proprietor_name: string;
  mobile_number: string;
  alternate_mobile_number: string;
  email: string;
  date_of_birth: string;
  gst_number: string;
  pan_number: string;
  aadhaar_number: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  pincode: string;
  remarks: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  customer_type: "gst",
  client_name: "",
  business_name: "",
  proprietor_name: "",
  mobile_number: "",
  alternate_mobile_number: "",
  email: "",
  date_of_birth: "",
  gst_number: "",
  pan_number: "",
  aadhaar_number: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  pincode: "",
  remarks: "",
  is_active: true,
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="border-b pb-1 text-sm font-semibold text-foreground">{children}</h3>
);

export function CustomerFormModal({ open, onClose, onSaved, customer }: Props) {
  const isEdit = !!customer;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      customer
        ? {
            customer_type: customer.customer_type,
            client_name: customer.client_name,
            business_name: customer.business_name ?? "",
            proprietor_name: customer.proprietor_name ?? "",
            mobile_number: customer.mobile_number ?? "",
            alternate_mobile_number: customer.alternate_mobile_number ?? "",
            email: customer.email ?? "",
            date_of_birth: customer.date_of_birth ?? "",
            gst_number: customer.gst_number ?? "",
            pan_number: customer.pan_number ?? "",
            aadhaar_number: customer.aadhaar_number ?? "",
            address_line_1: customer.address_line_1 ?? "",
            address_line_2: customer.address_line_2 ?? "",
            city: customer.city ?? "",
            state: customer.state ?? "",
            pincode: customer.pincode ?? "",
            remarks: customer.remarks ?? "",
            is_active: customer.is_active,
          }
        : EMPTY
    );
  }, [open, customer]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.client_name.trim()) {
      setError("Client name is required");
      return;
    }
    const clean = (v: string) => v.trim() || null;
    const payload: CustomerInput = {
      customer_type: form.customer_type,
      client_name: form.client_name.trim(),
      business_name: clean(form.business_name),
      proprietor_name: clean(form.proprietor_name),
      mobile_number: clean(form.mobile_number),
      alternate_mobile_number: clean(form.alternate_mobile_number),
      email: clean(form.email),
      date_of_birth: clean(form.date_of_birth),
      gst_number: clean(form.gst_number),
      pan_number: clean(form.pan_number),
      aadhaar_number: clean(form.aadhaar_number),
      address_line_1: clean(form.address_line_1),
      address_line_2: clean(form.address_line_2),
      city: clean(form.city),
      state: clean(form.state),
      pincode: clean(form.pincode),
      remarks: clean(form.remarks),
      is_active: form.is_active,
    };
    setSaving(true);
    try {
      if (isEdit && customer) await customersApi.update(customer.id, payload);
      else await customersApi.create(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save customer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${customer?.customer_code}` : "Add customer"}
      description={isEdit ? undefined : "Create a client in the GST or Income-Tax register."}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic */}
        <SectionTitle>Basic information</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer_type">Customer type</Label>
            <Select
              id="customer_type"
              value={form.customer_type}
              onChange={(e) => set("customer_type", e.target.value as CustomerType)}
            >
              <option value="gst">GST</option>
              <option value="income_tax">Income Tax</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="is_active">Status</Label>
            <Select
              id="is_active"
              value={form.is_active ? "active" : "inactive"}
              onChange={(e) => set("is_active", e.target.value === "active")}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="client_name">Client name</Label>
            <Input
              id="client_name"
              required
              value={form.client_name}
              onChange={(e) => set("client_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile_number">Mobile number</Label>
            <Input
              id="mobile_number"
              value={form.mobile_number}
              onChange={(e) => set("mobile_number", e.target.value)}
              placeholder="9876500011"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alternate_mobile_number">
              Alternate mobile <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="alternate_mobile_number"
              value={form.alternate_mobile_number}
              onChange={(e) => set("alternate_mobile_number", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={(e) => set("date_of_birth", e.target.value)}
            />
          </div>
        </div>

        {/* Business */}
        <SectionTitle>Business information</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business name</Label>
            <Input
              id="business_name"
              value={form.business_name}
              onChange={(e) => set("business_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="proprietor_name">Proprietor name</Label>
            <Input
              id="proprietor_name"
              value={form.proprietor_name}
              onChange={(e) => set("proprietor_name", e.target.value)}
            />
          </div>
        </div>

        {/* Tax */}
        <SectionTitle>Tax information</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="gst_number">GST number</Label>
            <Input
              id="gst_number"
              value={form.gst_number}
              onChange={(e) => set("gst_number", e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pan_number">PAN number</Label>
            <Input
              id="pan_number"
              value={form.pan_number}
              onChange={(e) => set("pan_number", e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aadhaar_number">Aadhaar number</Label>
            <Input
              id="aadhaar_number"
              value={form.aadhaar_number}
              onChange={(e) => set("aadhaar_number", e.target.value)}
            />
          </div>
        </div>

        {/* Address */}
        <SectionTitle>Address information</SectionTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address_line_1">Address line 1</Label>
            <Input
              id="address_line_1"
              value={form.address_line_1}
              onChange={(e) => set("address_line_1", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address_line_2">Address line 2</Label>
            <Input
              id="address_line_2"
              value={form.address_line_2}
              onChange={(e) => set("address_line_2", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={form.pincode}
              onChange={(e) => set("pincode", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={form.remarks}
            onChange={(e) => set("remarks", e.target.value)}
            rows={2}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Add customer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
