"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import {
  Activity,
  TrendingUp,
  Coins,
  Users,
  Boxes,
  ClipboardCheck,
  ClipboardList,
  Bell,
  BookOpen,
  Plug,
  Settings,
  ShieldCheck,
  Menu as MenuIcon,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/cn";

type NavLink = {
  href: string;
  label: string;
  Icon: any;
  badge?: string;
  role?: "all" | "manager" | "admin";
  accent?: boolean;
};

type NavGroup = {
  label: string;
  links: NavLink[];
};

// Shared mobile-drawer state via a window event
function openDrawer() {
  window.dispatchEvent(new CustomEvent("mise:open-sidebar"));
}

export function MobileSidebarTrigger({ activeLabel }: { activeLabel?: string }) {
  return (
    <button
      onClick={openDrawer}
      className="lg:hidden w-full inline-flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:border-accent/60"
      aria-label="Open navigation"
    >
      <span className="inline-flex items-center gap-2">
        <MenuIcon className="h-4 w-4" />
        <span>Menu</span>
      </span>
      {activeLabel && (
        <span className="text-xs text-muted-foreground truncate">{activeLabel}</span>
      )}
    </button>
  );
}

export function AppSidebar({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/r/${slug}`;
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups: NavGroup[] = [
    {
      label: "Dashboards",
      links: [
        { href: `${base}`, label: "Operations", Icon: Activity, role: "all" },
        { href: `${base}/sales`, label: "Sales & Revenue", Icon: TrendingUp, role: "manager" },
        { href: `${base}/food-cost`, label: "Inventory & Food Cost", Icon: Coins, role: "manager" },
        { href: `${base}/labor`, label: "Labor", Icon: Users, role: "manager" },
      ],
    },
    {
      label: "Work",
      links: [
        { href: `${base}/count`, label: "Start a count", Icon: ClipboardList, role: "all" },
        { href: `${base}/approvals`, label: "Approvals", Icon: ClipboardCheck, role: "manager" },
        { href: `${base}/sessions`, label: "Sessions", Icon: ClipboardList, role: "all" },
        { href: `${base}/reorder`, label: "Reorder", Icon: Bell, role: "manager" },
      ],
    },
    {
      label: "Catalog",
      links: [
        { href: `${base}/inventory`, label: "Inventory list", Icon: Boxes, role: "all" },
        { href: `${base}/menu`, label: "Menu", Icon: BookOpen, role: "all" },
      ],
    },
    {
      label: "Admin",
      links: [
        { href: `${base}/integrations`, label: "Integrations", Icon: Plug, role: "admin", accent: true },
        { href: `${base}/changelog`, label: "Changelog", Icon: ShieldCheck, role: "admin" },
        { href: `${base}/settings`, label: "Settings", Icon: Settings, role: "admin" },
      ],
    },
  ];

  // Subscribe to global drawer-open event + close on route change
  useEffect(() => {
    function onOpen() {
      setMobileOpen(true);
    }
    window.addEventListener("mise:open-sidebar", onOpen);
    return () => window.removeEventListener("mise:open-sidebar", onOpen);
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  function roleAttr(role?: "all" | "manager" | "admin") {
    if (role === "manager") return "manager";
    if (role === "admin") return "admin";
    return undefined;
  }

  function isActive(href: string) {
    if (href === base) return pathname === base;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const content = (
    <nav className="flex flex-col gap-4 py-4">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="micro text-muted-foreground px-3 mb-1.5">{g.label}</div>
          <ul className="space-y-0.5">
            {g.links.map((l) => {
              const Icon = l.Icon;
              const active = isActive(l.href);
              return (
                <li key={l.href} data-show-when={roleAttr(l.role)}>
                  <Link
                    href={l.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent/15 text-foreground border-l-2 border-accent -ml-0.5 pl-[10px]"
                        : l.accent
                        ? "text-accent hover:bg-muted hover:text-accent"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{l.label}</span>
                    {l.badge && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {l.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="border-t border-border pt-3 px-3" data-show-when="admin">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          <ChevronRight className="h-3 w-3" />
          Switch to group view
        </Link>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 border-r border-border bg-card/40 overflow-y-auto sticky top-16 self-start max-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 border-r border-border bg-popover overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-3 border-b border-border">
              <span className="micro text-muted-foreground">Navigation</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const groups: NavGroup[] = [
    {
      label: "Group · admin",
      links: [
        { href: "/admin", label: "Overview", Icon: Activity },
        { href: "/admin/changelog", label: "Group changelog", Icon: ShieldCheck },
      ],
    },
  ];

  useEffect(() => {
    function onOpen() {
      setMobileOpen(true);
    }
    window.addEventListener("mise:open-sidebar", onOpen);
    return () => window.removeEventListener("mise:open-sidebar", onOpen);
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  }

  const content = (
    <nav className="flex flex-col gap-4 py-4">
      {groups.map((g) => (
        <div key={g.label}>
          <div className="micro text-muted-foreground px-3 mb-1.5">{g.label}</div>
          <ul className="space-y-0.5">
            {g.links.map((l) => {
              const Icon = l.Icon;
              const active = isActive(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent/15 text-foreground border-l-2 border-accent -ml-0.5 pl-[10px]"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{l.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="border-t border-border pt-3 px-3">
        <div className="micro text-muted-foreground mb-2">Restaurants</div>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/r/miami"
              className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#E78F8E" }} />
              Daniel's Miami
            </Link>
          </li>
          <li>
            <Link
              href="/r/fort-lauderdale"
              className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#7BA890" }} />
              Daniel's FTL
            </Link>
          </li>
          <li>
            <Link
              href="/r/ds-sports"
              className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#D4A24A" }} />
              D's Sports Bar
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );

  return (
    <>
      <aside className="hidden lg:block w-60 shrink-0 border-r border-border bg-card/40 overflow-y-auto sticky top-16 self-start max-h-[calc(100vh-4rem)]">
        {content}
      </aside>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-72 border-r border-border bg-popover overflow-y-auto">
            <div className="flex items-center justify-between px-3 py-3 border-b border-border">
              <span className="micro text-muted-foreground">Navigation</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}
