import { useCallback, useEffect, useState } from "react";
import { History, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, auditApi } from "@/lib/api";
import type { AuditAction, AuditLogListResponse } from "@/types/audit";

const PAGE_SIZE = 20;

const ACTION_META: Record<
  AuditAction,
  { label: string; variant: "green" | "amber" | "blue" | "secondary" }
> = {
  role_promoted: { label: "Promoted to Admin", variant: "green" },
  role_demoted: { label: "Demoted to Employee", variant: "amber" },
  status_activated: { label: "Activated", variant: "blue" },
  status_deactivated: { label: "Deactivated", variant: "secondary" },
};

const ROLE_LABEL: Record<string, string> = { admin: "Admin", employee: "Employee" };

export default function AuditLogPage() {
  const [data, setData] = useState<AuditLogListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<AuditAction | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await auditApi.list({ action, page, page_size: PAGE_SIZE }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load the audit log");
    } finally {
      setLoading(false);
    }
  }, [action, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = data?.items ?? [];

  function roleChange(oldRole: string | null, newRole: string | null) {
    if (!oldRole || !newRole) return "—";
    return `${ROLE_LABEL[oldRole] ?? oldRole} → ${ROLE_LABEL[newRole] ?? newRole}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every role change and activation in your organization, newest first.
        </p>
      </div>

      <Select
        value={action}
        onChange={(e) => {
          setPage(1);
          setAction(e.target.value as AuditAction | "");
        }}
        className="sm:max-w-xs"
        aria-label="Filter by action"
      >
        <option value="">All actions</option>
        <option value="role_promoted">Promotions</option>
        <option value="role_demoted">Demotions</option>
        <option value="status_activated">Activations</option>
        <option value="status_deactivated">Deactivations</option>
      </Select>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>When</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Role change</TableHead>
              <TableHead>By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  <History className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No audit activity yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((entry) => {
                const meta = ACTION_META[entry.action];
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.affected_user_name ?? "—"}
                    </TableCell>
                    <TableCell>{roleChange(entry.old_role, entry.new_role)}</TableCell>
                    <TableCell>{entry.performed_by_name ?? "—"}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} {total === 1 ? "entry" : "entries"}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
