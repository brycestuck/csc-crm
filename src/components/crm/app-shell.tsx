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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto grid min-h-screen max-w-[1680px] gap-4 px-4 py-4 lg:grid-cols-[248px_1fr]">
        <aside className="panel flex h-full flex-col gap-4 p-4">
          <Link href="/" className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-4">
            <h1 className="text-[2.4rem] font-black uppercase tracking-[-0.08em] text-zinc-950">
              THE HUB
            </h1>
            <p className="mt-2 text-[11px] uppercase tracking-wider text-zinc-500">
              Creative Sales Consulting CRM and Project Management Platform
            </p>
          </Link>

          <nav className="grid gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                    active ? "bg-zinc-950 text-white" : "text-zinc-700 hover:bg-zinc-100"
                  )}
                >
                  <Icon size={16} />
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
