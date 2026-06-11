import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Loader2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { notificationsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/types/notification";

const POLL_MS = 30000;

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function NotificationBell() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    try {
      const r = await notificationsApi.unreadCount();
      setUnread(r.unread);
    } catch {
      /* ignore transient errors */
    }
  }, []);

  useEffect(() => {
    void refreshCount();
    const id = window.setInterval(refreshCount, POLL_MS);
    return () => window.clearInterval(id);
  }, [refreshCount]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        const r = await notificationsApi.list({ page_size: 10 });
        setItems(r.items);
        setUnread(r.unread);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
  }

  async function openItem(n: AppNotification) {
    if (!n.is_read) {
      try {
        await notificationsApi.markRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
        setUnread((u) => Math.max(0, u - 1));
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    navigate(can("workorder:view_all") ? "/work-orders" : "/my-requests");
  }

  async function markAll() {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((x) => ({ ...x, is_read: true })));
      setUnread(0);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal/60 transition-colors hover:bg-charcoal/5 dark:text-white/70 dark:hover:bg-white/10"
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white ring-2 ring-ivory dark:ring-[#0b1020]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_60px_-20px_rgba(11,19,43,0.25)] dark:border-white/10 dark:bg-[#0f1830]">
          <div className="flex items-center justify-between border-b border-softgray px-4 py-3 dark:border-white/10">
            <p className="text-sm font-semibold text-charcoal dark:text-white">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-navy/70 transition-colors hover:text-gold dark:text-white/60"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-charcoal/50 dark:text-white/40">
                You're all caught up.
              </p>
            ) : (
              <ul className="divide-y divide-softgray dark:divide-white/10">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => openItem(n)}
                      className={cn(
                        "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-charcoal/[0.03] dark:hover:bg-white/[0.04]",
                        !n.is_read && "bg-gold/[0.06]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                          n.is_read ? "bg-transparent" : "bg-gold"
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-charcoal dark:text-white">
                          {n.title}
                        </span>
                        {n.body && (
                          <span className="mt-0.5 block truncate text-xs text-charcoal/55 dark:text-white/45">
                            {n.body}
                          </span>
                        )}
                        <span className="mt-0.5 block text-[11px] text-charcoal/40 dark:text-white/30">
                          {timeAgo(n.created_at)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
