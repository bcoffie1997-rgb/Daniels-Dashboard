"use client";

import { useMemo } from "react";
import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { HorizontalBars } from "@/components/charts/bar-chart";
import { formatMoney } from "@/lib/format";

export default function ReportsPage() {
  const avtVariances = useMockStore((s) => s.avtVariances);
  const invoices = useMockStore((s) => s.invoices);

  const sorted = useMemo(
    () =>
      [...avtVariances].sort(
        (a, b) => Math.abs(b.dollar_impact) - Math.abs(a.dollar_impact),
      ),
    [avtVariances],
  );

  const approvedSpend = useMemo(
    () =>
      invoices
        .filter((i) => i.status === "approved")
        .reduce((s, i) => s + i.total, 0),
    [invoices],
  );

  const totalVariance = sorted.reduce((s, v) => s + v.dollar_impact, 0);

  return (
    <>
      <p className="mb-6 text-body text-muted-foreground">
        Actual vs. theoretical usage and COGS-style reporting. Requires Toast
        sales sync + approved counts.
      </p>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Card className="bg-card p-4">
          <p className="caption text-muted-foreground">Approved purchases</p>
          <p className="tabular mt-2 font-display text-display-md text-foreground">
            {formatMoney(approvedSpend, { compact: true })}
          </p>
        </Card>
        <Card className="bg-card p-4">
          <p className="caption text-muted-foreground">AvT dollar variance</p>
          <p
            className={`tabular mt-2 font-display text-display-md ${totalVariance < 0 ? "text-destructive" : "text-accent"}`}
          >
            {formatMoney(totalVariance)}
          </p>
        </Card>
        <Card className="bg-card p-4">
          <p className="caption text-muted-foreground">Items flagged</p>
          <p className="tabular mt-2 font-display text-display-md text-foreground">
            {sorted.length}
          </p>
        </Card>
      </div>

      <Card className="mb-8 bg-card p-5">
        <h2 className="mb-4 font-display text-display-md text-foreground">
          Actual vs. theoretical — this week
        </h2>
        <HorizontalBars
          rows={sorted.map((v) => ({
            label: v.product_name,
            value: Math.abs(v.dollar_impact),
            hint: `${v.variance_qty > 0 ? "+" : ""}${v.variance_qty} ${v.unit} (${v.variance_pct.toFixed(1)}%)`,
          }))}
          variant="warning"
          valueFormat={(n) => formatMoney(n)}
        />
      </Card>

      <Card className="bg-card p-0">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border caption text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 text-right font-medium">Theoretical</th>
              <th className="px-4 py-3 text-right font-medium">Actual</th>
              <th className="px-4 py-3 text-right font-medium">Variance</th>
              <th className="px-4 py-3 text-right font-medium">$ Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((v) => (
              <tr key={v.product_id} className="text-body-sm">
                <td className="px-4 py-3 text-foreground">{v.product_name}</td>
                <td className="tabular px-4 py-3 text-right font-mono text-muted-foreground">
                  {v.theoretical_qty} {v.unit}
                </td>
                <td className="tabular px-4 py-3 text-right font-mono text-foreground">
                  {v.actual_qty} {v.unit}
                </td>
                <td
                  className={`tabular px-4 py-3 text-right font-mono ${v.variance_qty < 0 ? "text-destructive" : "text-accent"}`}
                >
                  {v.variance_qty > 0 ? "+" : ""}
                  {v.variance_qty} ({v.variance_pct.toFixed(1)}%)
                </td>
                <td
                  className={`tabular px-4 py-3 text-right font-mono ${v.dollar_impact < 0 ? "text-destructive" : "text-foreground"}`}
                >
                  {formatMoney(v.dollar_impact)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
