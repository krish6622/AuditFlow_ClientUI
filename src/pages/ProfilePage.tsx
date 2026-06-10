import { Link } from "react-router-dom";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin",
  org_admin: "Organization Admin",
  employee: "Employee",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-muted-foreground">Your account details.</p>
      </div>

      <Card className="max-w-2xl p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.full_name} className="h-14 w-14 text-lg" />
          <div>
            <p className="text-lg font-semibold text-foreground">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">{user.email ?? user.phone ?? "—"}</p>
          </div>
        </div>

        <div className="mt-6">
          <Row label="Role" value={ROLE_LABEL[user.role] ?? user.role} />
          {user.designation && <Row label="Designation" value={user.designation} />}
          <Row label="Phone" value={user.phone ?? "—"} />
          <Row label="Status" value={user.is_active ? "Active" : "Inactive"} />
          <Row
            label="Member since"
            value={new Date(user.created_at).toLocaleDateString()}
          />
        </div>

        <div className="mt-6">
          <Button asChild variant="outline">
            <Link to="/change-password">Change password</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
