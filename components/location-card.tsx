import Link from "next/link";
import { ArrowUpRight, AlertTriangle, Clock, ClipboardCheck } from "lucide-react";
import { RESTAURANTS } from "@/lib/restaurants";
import { type LocationKpi } from "@/lib/mock-data";
import { Badge } from "./ui/badge";

export function LocationCard({ kpi }: { kpi: LocationKpi }) {
  const restaurant = RESTAURANTS.find((r) => r.slug === kpi.slug)!;
  const varianceTone =
    kpi.avgVariancePct >= 5 ? "destructive" : kpi.avgVariancePct >= 3 ? "warning" : "success";

  return (
    <Link
      href={`/r/${restaurant.slug}`}
      className="group block rounded-lg border border-border bg-card overflow-hidden hover:border-accent/50 transition-colors"
    >
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: restaurant.accentHex }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-display-md leading-tight">{restaurant.name}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{restaurant.city}</div>
            <div className="text-xs text-muted-foreground mt-1.5 leading-snug">{restaurant.concept}</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div>
            <div className="micro text-muted-foreground">Items</div>
            <div className="font-display text-2xl tabular mt-1">{kpi.itemsTracked}</div>
          </div>
          <div>
            <div className="micro text-muted-foreground">Stations</div>
            <div className="font-display text-2xl tabular mt-1">{kpi.stationsActive}</div>
          </div>
          <div>
            <div className="micro text-muted-foreground">Variance</div>
            <div
              className={`font-display text-2xl tabular mt-1 ${
                varianceTone === "destructive"
                  ? "text-destructive"
                  : varianceTone === "warning"
                  ? "text-warning"
                  : "text-success"
              }`}
            >
              {kpi.avgVariancePct.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Last count
            </span>
            <span className="tabular">{kpi.lastCountAt}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Pending approval
            </span>
            <span>
              {kpi.pendingApproval > 0 ? (
                <Badge variant="warning">{kpi.pendingApproval}</Badge>
              ) : (
                <Badge variant="success">0</Badge>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              Open variances
            </span>
            <span>
              {kpi.openVariances > 0 ? (
                <Badge variant="destructive">{kpi.openVariances}</Badge>
              ) : (
                <Badge variant="success">0</Badge>
              )}
            </span>
          </div>
        </div>

        {kpi.topVariance && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive-bg px-3 py-2.5">
            <div className="micro text-destructive">Biggest variance</div>
            <div className="text-sm mt-0.5 leading-snug">{kpi.topVariance.item}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {kpi.topVariance.station} · {kpi.topVariance.variancePct}%
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
