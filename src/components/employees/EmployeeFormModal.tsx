import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { ApiError, employeesApi } from "@/lib/api";
import type { Employee, EmployeeCreateInput, EmployeeUpdateInput } from "@/types/employee";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  employee?: Employee | null;
}

interface FormState {
  full_name: string;
  phone: string;
  email: string;
  designation: string;
  password: string;
  is_active: boolean;
}

const EMPTY: FormState = {
  full_name: "",
  phone: "",
  email: "",
  designation: "",
  password: "",
  is_active: true,
};

export function EmployeeFormModal({ open, onClose, onSaved, employee }: Props) {
  const isEdit = !!employee;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      employee
        ? {
            full_name: employee.full_name,
            phone: employee.phone ?? "",
            email: employee.email ?? "",
            designation: employee.designation ?? "",
            password: "",
            is_active: employee.is_active,
          }
        : EMPTY
    );
  }, [open, employee]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isEdit && form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      if (isEdit && employee) {
        const payload: EmployeeUpdateInput = {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          designation: form.designation.trim() || null,
          is_active: form.is_active,
        };
        if (form.password.trim()) payload.password = form.password.trim();
        await employeesApi.update(employee.id, payload);
      } else {
        const payload: EmployeeCreateInput = {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || null,
          designation: form.designation.trim() || null,
          password: form.password,
          is_active: form.is_active,
        };
        await employeesApi.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save employee");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit employee" : "Add employee"}
      description={isEdit ? undefined : "They can sign in with their phone or email."}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Name</Label>
          <Input
            id="full_name"
            required
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="9876500011"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            value={form.designation}
            onChange={(e) => set("designation", e.target.value)}
            placeholder="Senior Electrician"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEdit && <span className="text-muted-foreground">(leave blank to keep)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              required={!isEdit}
              minLength={8}
            />
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
            {isEdit ? "Save changes" : "Add employee"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
