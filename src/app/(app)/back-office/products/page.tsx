"use client";

import { useMemo } from "react";
import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/format";

export default function ProductsPage() {
  const products = useMockStore((s) => s.products);
  const productVendors = useMockStore((s) => s.productVendors);
  const vendors = useMockStore((s) => s.vendors);
  const items = useMockStore((s) => s.items);

  const rows = useMemo(
    () =>
      [...products]
        .filter((p) => p.active)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [products],
  );

  const vendorName = (id: string) =>
    vendors.find((v) => v.id === id)?.name ?? "—";

  return (
    <>
      <p className="mb-4 text-body text-muted-foreground">
        Purchasable SKUs — source of truth for invoice lines and recipe costing.
        Count items link here for dollar variance.
      </p>
      <Card className="overflow-hidden bg-card p-0">
        <ul className="divide-y divide-border">
          {rows.map((p) => {
            const preferred = productVendors.find(
              (pv) => pv.product_id === p.id && pv.is_preferred,
            );
            const countItems = items.filter((i) => i.product_id === p.id);
            return (
              <li
                key={p.id}
                className="grid grid-cols-1 gap-2 px-4 py-4 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <div>
                  <p className="text-body text-foreground">{p.name}</p>
                  <p className="caption mt-0.5 text-muted-foreground">
                    {p.category ?? "Uncategorized"} · GL {p.gl_code ?? "—"}
                  </p>
                </div>
                <span className="tabular font-mono text-body text-foreground">
                  {p.last_unit_cost
                    ? `${formatMoney(p.last_unit_cost)}/${p.default_unit}`
                    : "—"}
                </span>
                <span className="caption text-muted-foreground">
                  {preferred
                    ? vendorName(preferred.vendor_id)
                    : "No vendor"}
                </span>
                <span className="caption text-muted-foreground">
                  {countItems.length} count item
                  {countItems.length === 1 ? "" : "s"}
                </span>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
