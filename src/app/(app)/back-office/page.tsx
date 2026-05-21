"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  FileText,
  Package,
  Receipt,
  ChefHat,
  ShoppingCart,
  Plug,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMockStore } from "@/lib/mock/store";
import { formatMoney, relativeFromNow } from "@/lib/format";

export default function BackOfficeOverviewPage() {
  const invoices = useMockStore((s) => s.invoices);
  const vendors = useMockStore((s) => s.vendors);
  const products = useMockStore((s) => s.products);
  const recipes = useMockStore((s) => s.recipes);
  const orders = useMockStore((s) => s.orders);
  const toastSync = useMockStore((s) => s.toastSync);
  const avtVariances = useMockStore((s) => s.avtVariances);

  const pendingInvoices = useMemo(
    () => invoices.filter((i) => i.status === "pending_review"),
    [invoices],
  );
  const draftOrders = useMemo(
    () => orders.filter((o) => o.status === "draft"),
    [orders],
  );
  const topVariance = useMemo(
    () =>
      [...avtVariances].sort(
        (a, b) => Math.abs(b.dollar_impact) - Math.abs(a.dollar_impact),
      )[0],
    [avtVariances],
  );

  const modules = [
    {
      href: "/back-office/invoices",
      icon: Receipt,
      title: "Invoices",
      stat: `${pendingInvoices.length} pending`,
      hint: "Upload, review, and approve vendor invoices",
    },
    {
      href: "/back-office/vendors",
      icon: Package,
      title: "Vendors",
      stat: `${vendors.filter((v) => v.active).length} active`,
      hint: "Sysco, US Foods, Breakers, and more",
    },
    {
      href: "/back-office/products",
      icon: FileText,
      title: "Products",
      stat: `${products.length} SKUs`,
      hint: "Purchasable items linked to count catalog",
    },
    {
      href: "/back-office/recipes",
      icon: ChefHat,
      title: "Recipes",
      stat: `${recipes.length} mapped`,
      hint: "Plate costs tied to Toast menu items",
    },
    {
      href: "/back-office/orders",
      icon: ShoppingCart,
      title: "Orders",
      stat: `${draftOrders.length} draft`,
      hint: "Par-driven purchase orders by vendor",
    },
    {
      href: "/back-office/toast",
      icon: Plug,
      title: "Toast POS",
      stat: toastSync.connected ? "Connected" : "Offline",
      hint: `${toastSync.menu_items_count} menu items synced`,
    },
  ];

  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Pending invoices"
          value={String(pendingInvoices.length)}
          tone={pendingInvoices.length > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Invoice spend (pending)"
          value={formatMoney(
            pendingInvoices.reduce((s, i) => s + i.total, 0),
            { compact: true },
          )}
        />
        <StatCard
          label="Recipes with plate cost"
          value={String(recipes.filter((r) => r.plate_cost).length)}
        />
        <StatCard
          label="Toast last sync"
          value={relativeFromNow(toastSync.last_sync_at)}
        />
      </div>

      {topVariance && (
        <Card className="mb-8 border-warning/30 bg-warning-bg/30 p-5">
          <p className="caption text-warning">Largest AvT variance this week</p>
          <p className="mt-2 font-display text-display-md text-foreground">
            {topVariance.product_name}
          </p>
          <p className="mt-1 text-body text-muted-foreground">
            Theoretical {topVariance.theoretical_qty} {topVariance.unit} ·
            Actual {topVariance.actual_qty} {topVariance.unit} ·{" "}
            <span className="tabular font-mono text-destructive">
              {formatMoney(topVariance.dollar_impact)}
            </span>
          </p>
          <Link
            href="/back-office/reports"
            className="caption mt-3 inline-block text-accent hover:underline"
          >
            View full AvT report →
          </Link>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link key={m.href} href={m.href}>
              <Card className="h-full bg-card p-5 transition-colors hover:border-accent/40">
                <div className="flex items-start justify-between gap-3">
                  <Icon className="h-5 w-5 text-accent" />
                  <Badge variant="secondary" className="caption">
                    {m.stat}
                  </Badge>
                </div>
                <h2 className="mt-4 font-display text-display-md text-foreground">
                  {m.title}
                </h2>
                <p className="mt-1 text-body-sm text-muted-foreground">
                  {m.hint}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <Card
      className={`bg-card p-4 ${tone === "warning" ? "border-warning/30" : ""}`}
    >
      <p className="caption text-muted-foreground">{label}</p>
      <p className="tabular mt-2 font-display text-display-md text-foreground">
        {value}
      </p>
    </Card>
  );
}
