"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppUser } from "@/components/auth-provider";
import { hasMinRole } from "@/lib/auth/config";

const TABS = [
  { href: "/back-office", label: "Overview", exact: true },
  { href: "/back-office/invoices", label: "Invoices" },
  { href: "/back-office/vendors", label: "Vendors" },
  { href: "/back-office/products", label: "Products" },
  { href: "/back-office/recipes", label: "Recipes" },
  { href: "/back-office/orders", label: "Orders" },
  { href: "/back-office/reports", label: "Reports" },
  { href: "/back-office/toast", label: "Toast" },
];

export default function BackOfficeShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppUser();
  const pathname = usePathname();

  if (!user || !hasMinRole(user.role, "manager")) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 lg:px-8">
        <h1 className="font-display text-display-lg text-foreground">
          Manager access required
        </h1>
        <p className="mt-3 text-body text-muted-foreground">
          Back office features are for managers and admins.
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
        <p className="caption text-muted-foreground">Platform</p>
        <h1 className="mt-1 font-display text-display-lg text-foreground lg:text-display-xl">
          Back office
        </h1>
        <p className="mt-2 max-w-2xl text-body text-muted-foreground">
          Vendors, invoices, recipes, and Toast sync — built for Daniel&apos;s
          workflow.
        </p>
      </header>
      <nav className="mb-6 -mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 lg:mx-0 lg:px-0">
        {TABS.map((t) => {
          const active = t.exact
            ? pathname === t.href
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
