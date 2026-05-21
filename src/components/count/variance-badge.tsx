import { cn } from "@/lib/utils";
import { classifyVariance, formatVariance } from "@/lib/variance";

interface VarianceBadgeProps {
  variance_pct: number | null;
  className?: string;
}

const STYLES = {
  neutral:
    "border-border text-muted-foreground bg-transparent",
  ok: "border-accent/40 text-accent bg-transparent",
  warn: "border-warning/40 text-warning bg-warning/10",
  danger:
    "border-destructive/40 text-destructive bg-destructive/10",
} as const;

export function VarianceBadge({ variance_pct, className }: VarianceBadgeProps) {
  const cls = classifyVariance(variance_pct);
  return (
    <span
      className={cn(
        "tabular inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-mono text-body-sm",
        STYLES[cls],
        className,
      )}
    >
      {formatVariance(variance_pct)}
    </span>
  );
}
