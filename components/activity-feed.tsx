import { RECENT_ACTIVITY } from "@/lib/mock-data";
import { RESTAURANTS } from "@/lib/restaurants";
import { Badge } from "./ui/badge";

export function ActivityFeed({ limit = 6 }: { limit?: number }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-display text-lg">Recent activity</h2>
        <span className="micro text-muted-foreground">Last 24h</span>
      </div>
      <ul className="divide-y divide-border">
        {RECENT_ACTIVITY.slice(0, limit).map((a, i) => {
          const r = RESTAURANTS.find((x) => x.slug === a.location)!;
          return (
            <li key={i} className="px-5 py-3.5 flex items-start gap-3">
              <div
                className="mt-1 h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: r.accentHex }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-medium text-sm">{a.user}</span>
                  <span className="text-sm text-muted-foreground">{a.action.toLowerCase()}</span>
                  <span className="text-xs text-muted-foreground">· {r.shortName}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.detail}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {a.status === "approved" && <Badge variant="success">Approved</Badge>}
                {a.status === "pending" && <Badge variant="warning">Pending</Badge>}
                {a.status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
                <span className="text-xs text-muted-foreground tabular">{a.ts}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
