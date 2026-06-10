import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/work-orders/StatusBadge";
import type { RecentWorkOrder } from "@/types/dashboard";

interface Props {
  orders: RecentWorkOrder[];
  loading: boolean;
}

export function RecentWorkOrders({ orders, loading }: Props) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Recent Work Orders</h2>
          <p className="text-sm text-muted-foreground">Latest jobs across your team</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/work-orders">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Order</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <TableRow key={i} className="hover:bg-transparent">
                {Array.from({ length: 5 }).map((__, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : orders.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                No work orders yet.{" "}
                <Link to="/work-orders" className="text-primary hover:underline">
                  Create your first one
                </Link>
                .
              </TableCell>
            </TableRow>
          ) : (
            orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.number}</TableCell>
                <TableCell>{o.customer_name ?? "—"}</TableCell>
                <TableCell>{o.assigned_employee_name ?? "—"}</TableCell>
                <TableCell>
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">{o.due_date ?? "—"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
