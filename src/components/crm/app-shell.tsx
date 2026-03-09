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

function HubMark() {
  return (
    <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[26px] border border-white/50 bg-[linear-gradient(155deg,#f6efff_0%,#d7c0f1_45%,#7f61b6_100%)] shadow-[0_20px_40px_rgba(95,70,137,0.28)]">
      <div className="absolute inset-[11px] rounded-[20px] border border-white/35 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),rgba(255,255,255,0.08)_58%,rgba(64,35,98,0.28)_100%)]" />
      <div className="absolute left-[38px] top-[18px] h-[32px] w-[2px] bg-white/60" />
      <div className="absolute left-[22px] top-[33px] h-[2px] w-[32px] bg-white/60" />
      <div className="absolute left-[29px] top-[24px] h-[2px] w-[16px] rotate-[38deg] bg-white/55" />
      <div className="absolute left-[29px] top-[40px] h-[2px] w-[16px] -rotate-[38deg] bg-white/55" />
      <span className="absolute left-[31px] top-[11px] h-[14px] w-[14px] rounded-full border border-white/35 bg-white shadow-[0_6px_12px_rgba(255,255,255,0.35)]" />
      <span className="absolute left-[31px] top-[31px] h-[16px] w-[16px] rounded-full border border-white/35 bg-[var(--accent-deep)] shadow-[0_8px_16px_rgba(48,30,80,0.25)]" />
      <span className="absolute left-[15px] top-[27px] h-[14px] w-[14px] rounded-full border border-white/35 bg-[#f8f3ff] shadow-[0_6px_12px_rgba(255,255,255,0.35)]" />
      <span className="absolute left-[47px] top-[27px] h-[14px] w-[14px] rounded-full border border-white/35 bg-[#efe6fb] shadow-[0_6px_12px_rgba(255,255,255,0.35)]" />
      <span className="absolute left-[31px] top-[50px] h-[14px] w-[14px] rounded-full border border-white/35 bg-[#efe6fb] shadow-[0_6px_12px_rgba(255,255,255,0.35)]" />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[290px_1fr] lg:px-6">
        <aside className="hub-panel rounded-[36px] p-5 text-[var(--ink)]">
          <Link
            href="/"
            className="group relative block overflow-hidden rounded-[30px] border border-[rgba(113,85,156,0.18)] bg-[linear-gradient(160deg,rgba(255,255,255,0.92)_0%,rgba(239,230,251,0.95)_34%,rgba(212,193,240,0.98)_100%)] p-5 shadow-[0_22px_48px_rgba(111,82,160,0.2)]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.7),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(124,99,176,0.18),transparent_28%)] opacity-90" />
            <div className="relative flex items-center gap-4">
              <HubMark />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent-deep)]">
                  Creative Sales Solutions
                </div>
                <h1 className="mt-2 text-[2rem] leading-none text-[var(--ink)]">The Hub</h1>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-deep)]">
                  <span className="rounded-full bg-white/70 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    CSC
                  </span>
                  <span className="rounded-full bg-[rgba(95,70,137,0.12)] px-3 py-1.5">
                    Live workspace
                  </span>
                </div>
              </div>
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
