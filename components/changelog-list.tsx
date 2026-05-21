import { RESTAURANTS } from "@/lib/restaurants";
import type { ChangelogAction, ChangelogEntry } from "@/lib/changelog";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  UserPlus,
  Edit3,
  Plus,
  Trash2,
  Download,
  Plug,
  Bell,
  LogIn,
  AlertCircle,
} from "lucide-react";

export function ChangelogList({
  entries,
  showRestaurant,
}: {
  entries: ChangelogEntry[];
  showRestaurant: boolean;
}) {
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
        No activity yet.
      </div>
    );
  }
  const byDate = new Map<string, ChangelogEntry[]>();
  for (const e of entries) {
    const date = e.ts.split(" ")[0];
    if (!byDate.has(date)) byDate.set(date, []);
    byDate.get(date)!.push(e);
  }
  const dates = Array.from(byDate.keys()).sort().reverse();

  return (
    <div className="space-y-8">
      {dates.map((date) => (
        <section key={date}>
          <div className="sticky top-16 z-10 -mx-4 px-4 md:-mx-8 md:px-8 py-2 bg-background/85 backdrop-blur">
            <div className="text-sm text-muted-foreground">
              <span className="micro">{formatDate(date)}</span>
              <span className="ml-2 text-xs">· {byDate.get(date)!.length} events</span>
            </div>
          </div>
          <ul className="mt-2 rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
            {byDate.get(date)!.map((e) => (
              <ChangelogRow key={e.id} entry={e} showRestaurant={showRestaurant} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ChangelogRow({
  entry,
  showRestaurant,
}: {
  entry: ChangelogEntry;
  showRestaurant: boolean;
}) {
  const r = RESTAURANTS.find((x) => x.slug === entry.restaurant);
  const time = entry.ts.split(" ")[1];
  const isSystem = entry.actor.role === "system";
  const { Icon, label, tone } = decorate(entry);

  return (
    <li className="px-4 sm:px-5 py-3.5 hover:bg-muted/30 flex items-start gap-4">
      <div className="mt-0.5 h-8 w-8 rounded-md border border-border bg-muted/30 flex items-center justify-center shrink-0">
        <Icon className={`h-4 w-4 ${toneClass(tone)}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className={`text-sm font-medium ${isSystem ? "text-muted-foreground italic" : ""}`}>
            {entry.actor.name}
          </span>
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-sm font-medium text-foreground">{entry.entity}</span>
          {showRestaurant && r && (
            <span
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
              title={r.name}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.accentHex }} />
              {r.shortName}
            </span>
          )}
          {!showRestaurant && entry.restaurant === "group" && <Badge variant="outline">Group</Badge>}
        </div>
        {entry.detail && (
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{entry.detail}</div>
        )}
      </div>
      <div className="shrink-0 text-right">
        <div className="text-xs tabular text-muted-foreground">{time}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
          {entry.actor.role}
        </div>
      </div>
    </li>
  );
}

function decorate(e: ChangelogEntry) {
  const map: Record<
    ChangelogAction,
    { Icon: any; label: string; tone: "default" | "success" | "destructive" | "warning" | "accent" }
  > = {
    created: { Icon: Plus, label: "created", tone: "success" },
    updated: { Icon: Edit3, label: "updated", tone: "default" },
    deleted: { Icon: Trash2, label: "soft-deleted", tone: "warning" },
    approved: { Icon: CheckCircle2, label: "approved count", tone: "success" },
    rejected: { Icon: XCircle, label: "rejected count", tone: "destructive" },
    invited: { Icon: UserPlus, label: "invited", tone: "accent" },
    role_changed: { Icon: ShieldCheck, label: "changed role for", tone: "accent" },
    login: { Icon: LogIn, label: "signed in", tone: "default" },
    exported: { Icon: Download, label: "exported", tone: "default" },
    integration: { Icon: Plug, label: "modified integration", tone: "accent" },
    system: { Icon: Bell, label: "fired", tone: "default" },
  };
  return map[e.action] ?? { Icon: AlertCircle, label: e.action, tone: "default" as const };
}

function toneClass(tone: "default" | "success" | "destructive" | "warning" | "accent") {
  switch (tone) {
    case "success":
      return "text-success";
    case "destructive":
      return "text-destructive";
    case "warning":
      return "text-warning";
    case "accent":
      return "text-accent";
    default:
      return "text-muted-foreground";
  }
}

function formatDate(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
