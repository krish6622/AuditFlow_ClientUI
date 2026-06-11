import { useState } from "react";
import { Outlet } from "react-router-dom";

import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";

/** Authenticated app shell: luxury navy sidebar + ivory header + content. */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-ivory text-charcoal dark:bg-[#080d1c] dark:text-white/80">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 pb-20 lg:pb-0">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
