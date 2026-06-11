import { Menu, Moon, Search, Sun } from "lucide-react";

import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { useTheme } from "@/hooks/useTheme";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b border-softgray bg-ivory/85 px-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1020]/85 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-charcoal/60 transition-colors hover:bg-charcoal/5 dark:text-white/60 dark:hover:bg-white/10 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search pill */}
      <div className="relative max-w-xl flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/35 dark:text-white/40" />
        <input
          type="search"
          aria-label="Search"
          placeholder="Search work orders, invoices, customers..."
          className="h-11 w-full rounded-full border border-softgray bg-white pl-11 pr-4 text-sm text-charcoal outline-none transition-all duration-200 placeholder:text-charcoal/40 focus:border-navy/40 focus:ring-4 focus:ring-navy/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <NotificationBell />

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center rounded-full text-charcoal/60 transition-colors hover:bg-charcoal/5 dark:text-white/70 dark:hover:bg-white/10"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <div className="mx-1 hidden h-7 w-px bg-softgray dark:bg-white/10 sm:block" />

        <UserMenu />
      </div>
    </header>
  );
}
