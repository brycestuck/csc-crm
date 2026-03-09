"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Shield,
  Target,
  User,
  Users2,
} from "lucide-react";
import { UserAvatar } from "@/components/crm/user-avatar";
import { cn } from "@/lib/utils";

type CurrentUser = {
  displayName: string;
  email: string;
  role: "admin" | "member";
  avatarColor: string;
  avatarImagePath: string | null;
};

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/suppliers", label: "Suppliers", icon: Users2 },
  { href: "/projects", label: "Projects", icon: Target },
  { href: "/tasks", label: "Tasks", icon: ClipboardList },
  { href: "/activity", label: "Activity", icon: ScrollText },
  { href: "/team", label: "Team", icon: User },
];

export function AppShell({
  children,
  currentUser,
}: {
  children: React.ReactNode;
  currentUser: CurrentUser;
}) {
  const pathname = usePathname();
  const items = currentUser.role === "admin"
    ? [...navItems, { href: "/leadership", label: "Leadership", icon: Shield }]
    : navItems;

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
            {items.map(({ href, label, icon: Icon }) => {
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

          <div className="mt-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <div className="section-kicker">Signed in as</div>
            <div className="mt-3 flex items-start gap-3">
              <UserAvatar
                name={currentUser.displayName}
                color={currentUser.avatarColor}
                imagePath={currentUser.avatarImagePath}
                className="h-11 w-11"
                textClassName="text-sm"
                sizes="44px"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-zinc-950">
                  {currentUser.displayName}
                </div>
                <div className="truncate text-xs text-zinc-500">{currentUser.email}</div>
                <div className="mt-2 inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                  {currentUser.role}
                </div>
              </div>
            </div>
            <Link
              href="/api/auth/logout"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
            >
              <LogOut size={14} />
              Sign out
            </Link>
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
