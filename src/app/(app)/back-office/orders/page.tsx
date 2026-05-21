"use client";

import { useMemo } from "react";
import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format";

export default function OrdersPage() {
  const orders = useMockStore((s) => s.orders);
  const orderLines = useMockStore((s) => s.orderLines);
  const vendors = useMockStore((s) => s.vendors);
  const products = useMockStore((s) => s.products);
  const users = useMockStore((s) => s.users);
  const submitOrder = useMockStore((s) => s.submitOrder);

  const draft = useMemo(
    () => orders.filter((o) => o.status === "draft"),
    [orders],
  );

  const vendorName = (id: string) =>
    vendors.find((v) => v.id === id)?.name ?? "—";

  return (
    <>
      <p className="mb-4 text-body text-muted-foreground">
        Par-driven order guides. Suggested quantities from last count vs. par.
      </p>
      {draft.length === 0 ? (
        <Card className="bg-card p-8 text-center">
          <p className="text-body text-muted-foreground">
            No draft orders. Generate from a count session in Sprint 18.
          </p>
        </Card>
      ) : (
        draft.map((order) => {
          const lines = orderLines.filter((l) => l.order_id === order.id);
          const creator = users.find((u) => u.id === order.created_by);
          const estTotal = lines.reduce((sum, line) => {
            const p = products.find((pr) => pr.id === line.product_id);
            return sum + (p?.last_unit_cost ?? 0) * line.quantity;
          }, 0);

          return (
            <Card key={order.id} className="mb-4 bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-display-md text-foreground">
                    {vendorName(order.vendor_id)}
                  </h2>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    Created by {creator?.full_name ?? "—"}
                    {order.notes ? ` · ${order.notes}` : ""}
                  </p>
                </div>
                <Badge variant="outline" className="caption">
                  Draft
                </Badge>
              </div>
              <ul className="mt-4 divide-y divide-border border-y border-border">
                {lines.map((line) => {
                  const product = products.find(
                    (p) => p.id === line.product_id,
                  );
                  const belowPar =
                    line.suggested_qty !== null &&
                    line.quantity < line.suggested_qty;
                  return (
                    <li
                      key={line.id}
                      className="grid grid-cols-[1fr_auto_auto] gap-3 py-3 text-body-sm"
                    >
                      <span className="text-foreground">
                        {product?.name ?? line.product_id}
                      </span>
                      <span className="tabular font-mono text-muted-foreground">
                        Suggested {line.suggested_qty ?? "—"}
                      </span>
                      <span
                        className={`tabular font-mono ${belowPar ? "text-warning" : "text-foreground"}`}
                      >
                        Order {line.quantity} {line.unit}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="tabular text-body text-muted-foreground">
                  Est. {formatMoney(estTotal)}
                </p>
                <Button onClick={() => submitOrder(order.id)}>
                  Submit order
                </Button>
              </div>
            </Card>
          );
        })
      )}
    </>
  );
}
