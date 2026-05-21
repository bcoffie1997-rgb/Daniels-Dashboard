import Link from "next/link";
import { GioiaMark } from "./gioia-mark";
import { RestaurantSwitcher } from "./restaurant-switcher";
import type { Restaurant } from "@/lib/restaurants";
import { Bell, Search } from "lucide-react";

export function SiteHeader({ current }: { current?: Restaurant }) {
  const base = current ? `/r/${current.slug}` : "/r/fort-lauderdale";
  const links = [
    { href: `${base}`, label: "Dashboard" },
    { href: `${base}/inventory`, label: "Inventory" },
    { href: `${base}/menu`, label: "Menu" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-6 px-4 md:px-8">
        <Link href={base} className="text-foreground hover:text-accent transition-colors">
          <GioiaMark />
        </Link>
        <div className="hidden md:block h-8 w-px bg-border" />
        <div className="hidden md:block">
          <RestaurantSwitcher current={current} />
        </div>
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 ml-auto md:ml-0">
          <button className="h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
          <button className="h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-warning" />
          </button>
        </div>
      </div>
      <div className="md:hidden border-t border-border px-4 py-2 flex items-center justify-between">
        <RestaurantSwitcher current={current} />
      </div>
    </header>
  );
}
