import { cn } from "@/lib/utils";

interface BarRow {
  label: string;
  value: number;
  hint?: string;
}

interface BarChartProps {
  rows: BarRow[];
  variant?: "accent" | "warning" | "destructive" | "muted";
  className?: string;
  valueFormat?: (n: number) => string;
}

const FILL = {
  accent: "hsl(var(--accent))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
} as const;

export function HorizontalBars({
  rows,
  variant = "accent",
  className,
  valueFormat = (n) => String(Math.round(n)),
}: BarChartProps) {
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-3">
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-body-sm text-foreground">
                {r.label}
              </span>
              <span className="caption tabular shrink-0 font-mono text-muted-foreground">
                {r.hint ?? ""}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-card">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(2, (r.value / max) * 100)}%`,
                  background: FILL[variant],
                }}
              />
            </div>
          </div>
          <span className="tabular shrink-0 font-mono text-body-sm text-foreground">
            {valueFormat(r.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}
