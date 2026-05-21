import { cn } from "@/lib/utils";

interface LinePoint {
  x: string; // ISO date or label
  y: number;
}

interface LineChartProps {
  data: LinePoint[];
  width?: number;
  height?: number;
  className?: string;
  variant?: "accent" | "warning" | "destructive";
  yLabel?: (v: number) => string;
  xTicks?: number;
  yTicks?: number;
}

const STROKE = {
  accent: "hsl(var(--accent))",
  warning: "hsl(var(--warning))",
  destructive: "hsl(var(--destructive))",
} as const;

export function LineChart({
  data,
  width = 640,
  height = 220,
  className,
  variant = "accent",
  yLabel = (v) => String(v),
  xTicks = 4,
  yTicks = 4,
}: LineChartProps) {
  if (data.length === 0) return null;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 28;
  const w = width - padL - padR;
  const h = height - padT - padB;

  const ys = data.map((d) => d.y);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const yPad = (yMax - yMin) * 0.1 || 1;
  const yLow = Math.max(0, yMin - yPad);
  const yHigh = yMax + yPad;

  const px = (i: number) =>
    padL + (i / Math.max(1, data.length - 1)) * w;
  const py = (v: number) =>
    padT + h - ((v - yLow) / (yHigh - yLow)) * h;

  const path = data
    .map((d, i) => (i === 0 ? `M ${px(i)} ${py(d.y)}` : `L ${px(i)} ${py(d.y)}`))
    .join(" ");

  const yGrid = Array.from({ length: yTicks + 1 }).map((_, i) => {
    const v = yLow + ((yHigh - yLow) * i) / yTicks;
    return { v, y: py(v) };
  });

  const xStep = Math.max(1, Math.floor(data.length / xTicks));
  const xLabels: Array<{ x: number; label: string }> = [];
  for (let i = 0; i < data.length; i += xStep) {
    xLabels.push({ x: px(i), label: data[i].x });
  }
  if (xLabels[xLabels.length - 1].x < px(data.length - 1) - 30) {
    xLabels.push({ x: px(data.length - 1), label: data[data.length - 1].x });
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("block w-full", className)}
      preserveAspectRatio="none"
      role="img"
      aria-label="Trend over time"
    >
      {yGrid.map(({ v, y }, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={padL + w}
            y1={y}
            y2={y}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            strokeOpacity={i === 0 ? 0 : 0.6}
          />
          <text
            x={padL - 6}
            y={y + 4}
            textAnchor="end"
            fontSize={11}
            fill="hsl(var(--muted-foreground))"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {yLabel(v)}
          </text>
        </g>
      ))}
      {xLabels.map(({ x, label }, i) => (
        <text
          key={i}
          x={x}
          y={height - 8}
          textAnchor="middle"
          fontSize={11}
          fill="hsl(var(--muted-foreground))"
        >
          {label}
        </text>
      ))}
      <path
        d={`${path} L ${padL + w} ${padT + h} L ${padL} ${padT + h} Z`}
        fill={STROKE[variant]}
        fillOpacity={0.08}
      />
      <path
        d={path}
        fill="none"
        stroke={STROKE[variant]}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}
