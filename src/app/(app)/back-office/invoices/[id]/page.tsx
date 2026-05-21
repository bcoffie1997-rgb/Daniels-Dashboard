"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney, absoluteTime } from "@/lib/format";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const invoice = useMockStore((s) =>
    s.invoices.find((i) => i.id === invoiceId),
  );
  const lines = useMockStore((s) => s.invoiceLines);
  const vendors = useMockStore((s) => s.vendors);
  const products = useMockStore((s) => s.products);
  const users = useMockStore((s) => s.users);
  const approveInvoice = useMockStore((s) => s.approveInvoice);
  const rejectInvoice = useMockStore((s) => s.rejectInvoice);

  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const invLines = useMemo(
    () => lines.filter((l) => l.invoice_id === invoiceId),
    [lines, invoiceId],
  );

  if (!invoice) {
    return (
      <p className="text-body text-muted-foreground">Invoice not found.</p>
    );
  }

  const vendor = vendors.find((v) => v.id === invoice.vendor_id);
  const approver = users.find((u) => u.id === invoice.approved_by);

  const handleApprove = () => {
    approveInvoice(invoiceId);
    router.refresh();
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    rejectInvoice(invoiceId, rejectReason.trim());
    setShowReject(false);
    router.refresh();
  };

  return (
    <>
      <Link
        href="/back-office/invoices"
        className="caption mb-4 inline-block text-accent hover:underline"
      >
        ← All invoices
      </Link>

      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-display-lg text-foreground">
              {vendor?.name ?? "Vendor"}
            </h2>
            <p className="mt-1 text-body text-muted-foreground">
              Invoice #{invoice.invoice_number} · {invoice.invoice_date}
            </p>
          </div>
          <Badge className="caption">{invoice.status.replace("_", " ")}</Badge>
        </div>
      </header>

      <Card className="mb-6 bg-card p-0">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border caption text-muted-foreground">
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 text-right font-medium">Qty</th>
              <th className="px-4 py-3 text-right font-medium">Unit</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invLines.map((line) => {
              const product = products.find((p) => p.id === line.product_id);
              return (
                <tr key={line.id} className="text-body-sm">
                  <td className="px-4 py-3 text-foreground">
                    {line.description}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product?.name ?? "Unmapped"}
                  </td>
                  <td className="tabular px-4 py-3 text-right font-mono">
                    {line.quantity}
                  </td>
                  <td className="tabular px-4 py-3 text-right font-mono text-muted-foreground">
                    {formatMoney(line.unit_price)}
                  </td>
                  <td className="tabular px-4 py-3 text-right font-mono text-foreground">
                    {formatMoney(line.line_total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td colSpan={4} className="px-4 py-3 text-right caption">
                Total
              </td>
              <td className="tabular px-4 py-3 text-right font-mono text-body text-foreground">
                {formatMoney(invoice.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {invoice.status === "approved" && (
        <p className="mb-6 text-body-sm text-muted-foreground">
          Approved by {approver?.full_name ?? "—"}{" "}
          {absoluteTime(invoice.approved_at)}. Product costs updated.
        </p>
      )}

      {invoice.status === "rejected" && invoice.rejection_reason && (
        <Card className="mb-6 border-destructive/30 bg-destructive-bg/30 p-4">
          <p className="caption text-destructive">Rejection reason</p>
          <p className="mt-1 text-body-sm text-foreground">
            {invoice.rejection_reason}
          </p>
        </Card>
      )}

      {invoice.status === "pending_review" && (
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button onClick={handleApprove} className="bg-primary">
            Approve invoice
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowReject((v) => !v)}
          >
            Reject
          </Button>
        </div>
      )}

      {showReject && (
        <Card className="mt-4 bg-card p-4">
          <label className="caption text-muted-foreground">
            Rejection reason
          </label>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="mt-2 border-border bg-background"
            placeholder="Duplicate invoice, wrong vendor, etc."
          />
          <Button
            variant="destructive"
            className="mt-3"
            onClick={handleReject}
            disabled={!rejectReason.trim()}
          >
            Confirm reject
          </Button>
        </Card>
      )}
    </>
  );
}
