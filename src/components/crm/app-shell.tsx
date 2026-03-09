"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutDashboard, ScrollText, Target, User, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/suppliers", label: "Suppliers", icon: Users2 },
  { href: "/projects", label: "Projects", icon: Target },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/activity", label: "Activity", icon: ScrollText },
  { href: "/team", label: "Team", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[290px_1fr] lg:px-6">
        <aside className="hub-panel rounded-[36px] p-5 text-[var(--ink)]">
          <Link
            href="/"
            className="block rounded-[30px] border border-[rgba(113,85,156,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,230,251,0.92))] px-5 py-6 shadow-[0_18px_40px_rgba(111,82,160,0.16)]"
          >
            <div className="min-w-0">
              <h1 className="text-[2.8rem] font-semibold uppercase tracking-[-0.06em] text-[var(--ink)]">
                THE HUB
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Creative Sales Consulting CRM and Project Management Platform
              </p>
            </div>
          </Link>

          <nav className="mt-6 grid gap-2">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                    active
                      ? "bg-[var(--accent-deep)] text-white shadow-[0_14px_28px_rgba(95,70,137,0.25)]"
                      : "text-[var(--ink)] hover:bg-white/70"
                  )}
                >
                  <Icon size={18} />
                  <span className="font-medium">{label}</span>
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
