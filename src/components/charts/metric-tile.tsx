import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkline } from "./sparkline";

interface MetricTileProps {
  label: string;
  value: string;
  delta?: { label: string; direction: "up" | "down" | "flat"; tone?: "good" | "bad" | "neutral" };
  trend?: number[];
  hint?: string;
  className?: string;
}

export function MetricTile({
  label,
  value,
  delta,
  trend,
  hint,
  className,
}: MetricTileProps) {
  const deltaColor =
    delta?.tone === "good"
      ? "text-accent"
      : delta?.tone === "bad"
        ? "text-destructive"
        : "text-muted-foreground";
  const arrow =
    delta?.direction === "up"
      ? "↑"
      : delta?.direction === "down"
        ? "↓"
        : "→";
  return (
    <Card className={cn("flex flex-col bg-card p-5", className)}>
      <p className="caption text-muted-foreground">{label}</p>
      <p className="tabular mt-2 font-display text-display-lg text-foreground">
        {value}
      </p>
      <div className="mt-1 flex items-center justify-between gap-3">
        {delta ? (
          <span className={cn("text-body-sm font-medium", deltaColor)}>
            {arrow} {delta.label}
          </span>
        ) : (
          <span className="text-body-sm text-muted-foreground">{hint ?? ""}</span>
        )}
        {trend && trend.length > 1 && (
          <Sparkline
            data={trend}
            width={88}
            height={24}
            variant={delta?.tone === "bad" ? "destructive" : "accent"}
          />
        )}
      </div>
    </Card>
  );
}
