"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useMockStore, selectCurrentUser } from "@/lib/mock/store";

const TABS = [
  { href: "/admin/stations", label: "Stations" },
  { href: "/admin/items", label: "Items" },
  { href: "/admin/users", label: "Users" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useMockStore(selectCurrentUser);
  const pathname = usePathname();

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 lg:px-8">
        <h1 className="font-display text-display-lg text-foreground">
          Admin access required
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          Switch role in Settings or sign in as an admin to continue.
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
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-10">
      <header className="mb-6">
        <p className="caption text-muted-foreground">Catalog</p>
        <h1 className="mt-1 font-display text-display-lg text-foreground lg:text-display-xl">
          Admin
        </h1>
      </header>
      <nav className="mb-6 flex gap-1 border-b border-border">
        {TABS.map((t) => {
          const active = pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                "px-4 py-3 text-body transition-colors",
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
