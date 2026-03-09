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
          <div className="rounded-[28px] bg-[linear-gradient(145deg,rgba(217,200,238,0.92),rgba(255,255,255,0.85))] p-5 shadow-[0_18px_40px_rgba(121,94,164,0.18)]">
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-deep)]">
              Creative Sales Solutions
            </div>
            <h1 className="mt-3 text-3xl font-semibold">The Hub</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              One shared workspace for supplier follow-up, project progress, task ownership, and daily execution.
            </p>
          </div>

          <div className="mt-6 rounded-[24px] border border-[var(--line)] bg-white/60 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-strong)]">
              Today&apos;s focus
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Keep the team aligned on what needs attention now, without relying on scattered notes and spreadsheets.
            </p>
          </div>

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

        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-[var(--line)] bg-white/60 px-5 py-4 shadow-[0_12px_30px_rgba(114,94,147,0.08)]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
                The Hub
              </div>
              <div className="mt-2 text-lg font-medium text-[var(--ink)]">
                Shared operating system for the Creative Sales team
              </div>
            </div>
            <div className="rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-deep)]">
              Live workspace
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
