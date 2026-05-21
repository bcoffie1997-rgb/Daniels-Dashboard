"use client";

import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { relativeFromNow, formatMoney } from "@/lib/format";

export default function ToastSyncPage() {
  const toastSync = useMockStore((s) => s.toastSync);
  const menuItems = useMockStore((s) => s.menuItems);

  return (
    <>
      <p className="mb-6 text-body text-muted-foreground">
        Toast POS integration — menu items and daily sales feed recipe costing
        and actual vs. theoretical reports.
      </p>

      <Card className="mb-6 bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="caption text-muted-foreground">Connection status</p>
            <h2 className="mt-2 font-display text-display-lg text-foreground">
              Toast — Daniel&apos;s Fort Lauderdale
            </h2>
          </div>
          <Badge
            className={
              toastSync.connected
                ? "border-accent/30 bg-accent/10 text-accent"
                : "border-destructive/30 text-destructive"
            }
          >
            {toastSync.connected ? "Connected" : "Disconnected"}
          </Badge>
        </div>
        <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="caption text-muted-foreground">Last sync</dt>
            <dd className="mt-1 text-body text-foreground">
              {relativeFromNow(toastSync.last_sync_at)}
            </dd>
          </div>
          <div>
            <dt className="caption text-muted-foreground">Menu items</dt>
            <dd className="tabular mt-1 font-mono text-body text-foreground">
              {toastSync.menu_items_count}
            </dd>
          </div>
          <div>
            <dt className="caption text-muted-foreground">Sales history</dt>
            <dd className="tabular mt-1 font-mono text-body text-foreground">
              {toastSync.sales_days_synced} days
            </dd>
          </div>
        </dl>
        <Button className="mt-6" disabled>
          Sync now (Sprint 15)
        </Button>
      </Card>

      <h3 className="mb-3 font-display text-display-md text-foreground">
        Mapped menu items
      </h3>
      <p className="mb-4 text-body-sm text-muted-foreground">
        Recipes linked to Toast for AvT. Full menu sync in Sprint 15.
      </p>
      <Card className="overflow-hidden bg-card p-0">
        <ul className="divide-y divide-border">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div>
                <p className="text-body text-foreground">{item.name}</p>
                <p className="caption text-muted-foreground">
                  {item.category} · {item.toast_guid}
                </p>
              </div>
              <span className="tabular font-mono text-body text-foreground">
                {formatMoney(item.menu_price)}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="mt-6 border-border bg-muted/20 p-5">
        <p className="caption text-muted-foreground">Sprint 15 setup</p>
        <p className="mt-2 text-body-sm text-muted-foreground">
          Requires Toast API credentials from Daniel&apos;s GM. Nightly cron
          pulls menu + sales; recipes map ingredients to depletion.
        </p>
      </Card>
    </>
  );
}
