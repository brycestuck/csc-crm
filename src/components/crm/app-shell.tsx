"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutDashboard, ScrollText, Target, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/suppliers", label: "Suppliers", icon: Users2 },
  { href: "/projects", label: "Projects", icon: Target },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/activity", label: "Activity", icon: ScrollText },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="rounded-[32px] border border-[var(--line)] bg-[var(--ink)] p-5 text-[var(--paper)] shadow-[0_24px_80px_rgba(24,20,16,0.32)]">
          <div className="mb-8">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              Creative Sales
            </div>
            <h1 className="mt-3 text-2xl font-semibold">CRM</h1>
            <p className="mt-2 text-sm text-white/70">
              Supplier, project, task, and activity tracking for day-to-day broker execution.
            </p>
          </div>

          <nav className="grid gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                    active
                      ? "bg-white text-[var(--ink)]"
                      : "text-white/80 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
