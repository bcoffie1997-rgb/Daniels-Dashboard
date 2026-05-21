import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  variant?: "accent" | "warning" | "destructive" | "muted";
  showLastDot?: boolean;
}

const STROKE: Record<NonNullable<SparklineProps["variant"]>, string> = {
  accent: "hsl(var(--accent))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
  muted: "hsl(var(--muted-foreground))",
};

export function Sparkline({
  data,
  width = 160,
  height = 40,
  className,
  variant = "accent",
  showLastDot = true,
}: SparklineProps) {
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const points = data.map((v, i) => {
    const x = pad + (i / Math.max(1, data.length - 1)) * w;
    const y = pad + h - ((v - min) / span) * h;
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
    .join(" ");
  const [lx, ly] = points[points.length - 1];
  const fillPath = `${path} L ${pad + w} ${pad + h} L ${pad} ${pad + h} Z`;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("block", className)}
      role="img"
      aria-label="Trend sparkline"
    >
      <path d={fillPath} fill={STROKE[variant]} fillOpacity={0.08} />
      <path
        d={path}
        fill="none"
        stroke={STROKE[variant]}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {showLastDot && <circle cx={lx} cy={ly} r={2.5} fill={STROKE[variant]} />}
    </svg>
  );
}
