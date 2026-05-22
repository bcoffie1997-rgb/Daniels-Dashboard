import Link from "next/link";
import { GioiaMark } from "./gioia-mark";
import { RestaurantSwitcher } from "./restaurant-switcher";
import { RoleToggle } from "./role-toggle";
import { CommandPalette } from "./command-palette";
import { SearchButton, SearchButtonMobile } from "./search-button";
import type { Restaurant } from "@/lib/restaurants";
import { Bell } from "lucide-react";

export function SiteHeader({ current }: { current?: Restaurant }) {
  const base = current ? `/r/${current.slug}` : "/r/fort-lauderdale";
  return (
    <>
      <CommandPalette current={current} />
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 items-center gap-4 px-4 md:px-6">
          <Link href={base} className="text-foreground hover:text-accent transition-colors shrink-0">
            <GioiaMark />
          </Link>
          <div className="hidden md:block h-8 w-px bg-border" />
          <div className="hidden md:block">
            <RestaurantSwitcher current={current} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <SearchButtonMobile />
            <div className="hidden sm:block">
              <SearchButton />
            </div>
            <div className="hidden sm:block">
              <RoleToggle />
            </div>
            <button
              className="h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-warning" />
            </button>
          </div>
        </div>
        {/* Mobile: switcher + role + search row */}
        <div className="md:hidden border-t border-border px-4 py-2 flex items-center justify-between gap-2">
          <RestaurantSwitcher current={current} />
          <RoleToggle />
        </div>
      </header>
    </>
  );
}
