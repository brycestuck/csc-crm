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
  id: string;
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
  const activeItem =
    items.find(({ href }) => (href === "/" ? pathname === href : pathname.startsWith(href))) ?? items[0];

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
        </aside>

        <div className="min-w-0">
          <header className="panel mb-4 flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <p className="section-kicker">Workspace</p>
              <div className="mt-1 text-sm font-semibold text-zinc-950">{activeItem.label}</div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/team/${currentUser.id}`}
                className="inline-flex h-10 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 transition hover:border-zinc-300 hover:bg-white"
              >
                <UserAvatar
                  name={currentUser.displayName}
                  color={currentUser.avatarColor}
                  imagePath={currentUser.avatarImagePath}
                  className="h-9 w-9 rounded-lg"
                  textClassName="text-sm"
                  sizes="36px"
                />
                <div className="min-w-0 text-left">
                  <div className="section-kicker">Signed in</div>
                  <div className="truncate text-sm font-semibold text-zinc-950">{currentUser.displayName}</div>
                </div>
                <div className="inline-flex items-center rounded-md border border-zinc-200 bg-white px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                  {currentUser.role}
                </div>
              </Link>

              <Link
                href="/api/auth/logout"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950"
              >
                <LogOut size={14} />
                Sign out
              </Link>
            </div>
          </header>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
