"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  processing: "Processing",
  pending_review: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  processing: "secondary",
  pending_review: "default",
  approved: "secondary",
  rejected: "destructive",
};

export default function InvoicesPage() {
  const invoices = useMockStore((s) => s.invoices);
  const vendors = useMockStore((s) => s.vendors);

  const sorted = useMemo(
    () =>
      [...invoices].sort((a, b) => b.invoice_date.localeCompare(a.invoice_date)),
    [invoices],
  );

  const vendorName = (id: string) =>
    vendors.find((v) => v.id === id)?.name ?? "Unknown";

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body text-muted-foreground">
          Invoice OCR and AP workflow. Approve to update product costs.
        </p>
        <button
          type="button"
          disabled
          className="caption rounded-md border border-border bg-card px-4 py-2 text-muted-foreground"
        >
          Upload invoice (Sprint 11)
        </button>
      </div>

      <Card className="overflow-hidden bg-card p-0">
        <ul className="divide-y divide-border">
          {sorted.map((inv) => (
            <li key={inv.id}>
              <Link
                href={`/back-office/invoices/${inv.id}`}
                className="grid grid-cols-1 gap-2 px-4 py-4 transition-colors hover:bg-muted/30 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <div>
                  <p className="text-body text-foreground">
                    {vendorName(inv.vendor_id)}
                  </p>
                  <p className="caption mt-0.5 text-muted-foreground">
                    #{inv.invoice_number ?? "—"} · {inv.invoice_date}
                  </p>
                </div>
                <span className="tabular font-mono text-body text-foreground sm:text-right">
                  {formatMoney(inv.total)}
                </span>
                <Badge
                  variant={STATUS_VARIANT[inv.status] ?? "outline"}
                  className="w-fit caption"
                >
                  {STATUS_LABEL[inv.status] ?? inv.status}
                </Badge>
                <span className="caption text-accent sm:text-right">
                  View →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
