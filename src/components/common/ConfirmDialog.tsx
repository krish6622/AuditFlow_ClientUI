import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface Props {
  open: boolean;
  title: string;
  message: string;
  warning?: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

/** Reusable confirmation dialog (Cancel + a primary/destructive confirm). */
export function ConfirmDialog({
  open,
  title,
  message,
  warning,
  confirmLabel,
  destructive,
  loading,
  error,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>
        {warning && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            {warning}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
