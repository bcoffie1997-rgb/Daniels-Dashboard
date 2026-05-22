import Link from "next/link";
import type { TimeRange } from "@/lib/seed/analytics";
import { cn } from "@/lib/cn";

const RANGES: Array<{ key: TimeRange; label: string }> = [
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "90d", label: "90d" },
  { key: "12mo", label: "12mo" },
];

export function TimeRangeSelector({
  basePath,
  current,
}: {
  basePath: string;
  current: TimeRange;
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-border bg-card p-0.5">
      {RANGES.map((r) => {
        const active = r.key === current;
        const href = r.key === "30d" ? basePath : `${basePath}?range=${r.key}`;
        return (
          <Link
            key={r.key}
            href={href}
            className={cn(
              "px-3 py-1.5 text-xs rounded-md transition-colors",
              active
                ? "bg-accent/15 text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            {r.label}
          </Link>
        );
      })}
    </div>
  );
}

export function parseRange(s: string | undefined): TimeRange {
  if (s === "7d" || s === "90d" || s === "12mo") return s;
  return "30d";
}
