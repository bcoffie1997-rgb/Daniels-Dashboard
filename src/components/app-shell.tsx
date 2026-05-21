"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  History,
  LayoutDashboard,
  LineChart,
  Settings,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMockStore, selectCurrentUser } from "@/lib/mock/store";
import { ProfileMenu } from "@/components/profile-menu";
import { SyncIndicator } from "@/components/sync-indicator";
import type { Role } from "@/lib/mock/types";

interface NavItem {
  href: string;
  label: string;
  icon: typeof ClipboardList;
  minRole: Role;
}

const NAV: NavItem[] = [
  { href: "/", label: "Count", icon: ClipboardList, minRole: "counter" },
  { href: "/sessions", label: "My counts", icon: History, minRole: "counter" },
  {
    href: "/dashboard",
    label: "Sessions",
    icon: LayoutDashboard,
    minRole: "manager",
  },
  {
    href: "/insights",
    label: "Insights",
    icon: LineChart,
    minRole: "manager",
  },
  { href: "/admin/stations", label: "Admin", icon: Shield, minRole: "admin" },
  { href: "/settings", label: "Settings", icon: Settings, minRole: "counter" },
];

const ROLE_RANK: Record<Role, number> = {
  counter: 0,
  manager: 1,
  admin: 2,
};

function visibleFor(role: Role): NavItem[] {
  return NAV.filter((item) => ROLE_RANK[role] >= ROLE_RANK[item.minRole]);
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useMockStore(selectCurrentUser);
  const pathname = usePathname();

  if (!user) return <>{children}</>;
  const items = visibleFor(user.role);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Desktop side nav */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border lg:bg-card">
        <div className="flex h-16 items-center gap-3 border-b border-border px-5">
          <span className="font-display text-display-md text-foreground">
            Mise
          </span>
          <span className="caption text-muted-foreground">Daniel&apos;s</span>
        </div>
        <nav className="flex-1 px-3 py-4">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-body transition-colors",
                  active
                    ? "bg-primary/40 text-foreground"
                    : "text-muted-foreground hover:bg-card hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border px-4 py-3">
          <SyncIndicator />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex flex-1 flex-col">
        {/* Top bar (mobile shows wordmark; desktop shows sync indicator) */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <span className="font-display text-heading-lg">Mise</span>
          <SyncIndicator />
          <ProfileMenu />
        </header>
        <header className="sticky top-0 z-30 hidden h-14 items-center justify-end gap-4 border-b border-border bg-background/95 px-6 backdrop-blur lg:flex">
          <ProfileMenu />
        </header>

        <main className="flex-1 pb-20 lg:pb-0">{children}</main>

        {/* Mobile bottom tab bar */}
        <nav
          className={cn(
            "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden",
            "pb-[env(safe-area-inset-bottom)]",
          )}
        >
          <div className="mx-auto flex max-w-md justify-around">
            {items
              .filter((i) => i.href !== "/settings" || items.length <= 4)
              .slice(0, 5)
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-14 min-w-12 flex-1 flex-col items-center justify-center gap-1 px-2",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="micro">{item.label}</span>
                  </Link>
                );
              })}
          </div>
        </nav>
      </div>
    </div>
  );
}
