import Link from "next/link";
import { GioiaMark } from "./gioia-mark";
import { RestaurantSwitcher } from "./restaurant-switcher";
import type { Restaurant } from "@/lib/restaurants";
import { Bell, Search } from "lucide-react";

export function SiteHeader({ current }: { current?: Restaurant }) {
  const base = current ? `/r/${current.slug}` : "/r/fort-lauderdale";
  const links: Array<{ href: string; label: string; accent?: boolean }> = [
    { href: `${base}`, label: "Dashboard" },
    { href: `${base}/count`, label: "Count" },
    { href: `${base}/approvals`, label: "Approvals" },
    { href: `${base}/inventory`, label: "Inventory" },
    { href: `${base}/reorder`, label: "Reorder" },
    { href: `${base}/recipes`, label: "Recipes" },
    { href: `${base}/menu`, label: "Menu" },
    { href: `${base}/avt`, label: "AvT", accent: true },
    { href: `${base}/integrations`, label: "Integrations", accent: true },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 lg:gap-6 px-4 md:px-8">
        <Link href={base} className="text-foreground hover:text-accent transition-colors shrink-0">
          <GioiaMark />
        </Link>
        <div className="hidden md:block h-8 w-px bg-border" />
        <div className="hidden md:block">
          <RestaurantSwitcher current={current} />
        </div>
        <nav className="hidden lg:flex items-center gap-0.5 ml-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-muted ${
                l.accent
                  ? "text-accent hover:text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <button className="h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label="Search (Cmd-K · coming v2)" title="Search · v2">
            <Search className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-warning" />
          </button>
        </div>
      </div>
      {/* Tablet nav (md but not lg) — same links, scrollable */}
      <div className="hidden md:flex lg:hidden border-t border-border px-4 py-1.5">
        <nav className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-md px-2.5 py-1 text-sm transition-colors hover:bg-muted ${
                l.accent ? "text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      {/* Mobile: switcher + scrollable nav row */}
      <div className="md:hidden border-t border-border">
        <div className="px-4 py-2">
          <RestaurantSwitcher current={current} />
        </div>
        <nav className="border-t border-border flex items-center gap-1 overflow-x-auto px-3 py-1.5 -mx-0">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-md px-2.5 py-1 text-sm transition-colors hover:bg-muted ${
                l.accent ? "text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
