import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export function KpiStat({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "destructive" | "success";
}) {
  const toneCls = {
    default: "text-foreground",
    warning: "text-warning",
    destructive: "text-destructive",
    success: "text-success",
  }[tone];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="micro text-muted-foreground">{label}</span>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className={cn("font-display text-display-lg tabular", toneCls)}>{value}</span>
        {delta && <span className="text-xs text-muted-foreground">{delta}</span>}
      </div>
    </div>
  );
}
