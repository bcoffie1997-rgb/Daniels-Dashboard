"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMockStore, selectCurrentUser } from "@/lib/mock/store";

const TABS = [
  { href: "/insights", label: "Overview" },
  { href: "/insights/bar", label: "Bar" },
  { href: "/insights/wine", label: "Wine" },
  { href: "/insights/inventory", label: "Inventory" },
  { href: "/insights/events", label: "Events" },
];

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useMockStore(selectCurrentUser);
  const pathname = usePathname();

  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 lg:px-8">
        <h1 className="font-display text-display-lg text-foreground">
          Manager access required
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          Insights are visible to managers and admins. Switch role in settings
          to continue.
        </p>
        <Link
          href="/settings"
          className="mt-6 inline-block text-body text-accent underline"
        >
          Go to settings
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-10">
      <header className="mb-6">
        <p className="caption text-muted-foreground">Daniel&apos;s · operations</p>
        <h1 className="mt-1 font-display text-display-lg text-foreground lg:text-display-xl">
          Insights
        </h1>
      </header>
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => {
          const active =
            t.href === "/insights"
              ? pathname === "/insights"
              : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "shrink-0 px-4 py-3 text-body transition-colors",
                active
                  ? "border-b-2 border-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
