import { cn } from "@/lib/utils";

interface HeatCell {
  date: string; // ISO YYYY-MM-DD
  value: number;
}

interface CalendarHeatmapProps {
  cells: HeatCell[];
  className?: string;
  valueLabel?: (v: number) => string;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarHeatmap({
  cells,
  className,
  valueLabel,
}: CalendarHeatmapProps) {
  if (cells.length === 0) return null;
  const sorted = [...cells].sort((a, b) => a.date.localeCompare(b.date));
  const values = sorted.map((c) => c.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);

  // Build a 7-row × N-col grid where col is week, row is weekday (Sun..Sat).
  // First column may have empty leading cells based on the first date's weekday.
  const first = new Date(sorted[0].date + "T12:00:00Z");
  const firstWd = first.getUTCDay();
  const last = new Date(sorted[sorted.length - 1].date + "T12:00:00Z");
  const totalDays =
    Math.round((last.getTime() - first.getTime()) / 86400000) + 1;
  const totalCols = Math.ceil((totalDays + firstWd) / 7);

  const cellSize = 11;
  const gap = 2;
  const labelCol = 28;
  const labelRow = 12;
  const width = labelCol + totalCols * (cellSize + gap);
  const height = labelRow + 7 * (cellSize + gap);

  const byDate = new Map(sorted.map((c) => [c.date, c.value]));

  const intensity = (v: number) => {
    if (max === min) return 0.2;
    return 0.15 + ((v - min) / (max - min)) * 0.85;
  };

  // Month label positions (first column of each month)
  const monthTicks: Array<{ x: number; label: string }> = [];
  let seenMonth = "";
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(first.getTime() + i * 86400000);
    const m = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
    const col = Math.floor((i + firstWd) / 7);
    if (m !== seenMonth) {
      seenMonth = m;
      monthTicks.push({
        x: labelCol + col * (cellSize + gap),
        label: m,
      });
    }
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label="Calendar heatmap"
      >
        {monthTicks.map((m, i) => (
          <text
            key={i}
            x={m.x}
            y={labelRow - 2}
            fontSize={10}
            fill="hsl(var(--muted-foreground))"
          >
            {m.label}
          </text>
        ))}
        {DAY_LABELS.map((d, i) =>
          i % 2 === 1 ? (
            <text
              key={d}
              x={labelCol - 4}
              y={labelRow + i * (cellSize + gap) + cellSize - 2}
              fontSize={9}
              textAnchor="end"
              fill="hsl(var(--muted-foreground))"
            >
              {d}
            </text>
          ) : null,
        )}
        {Array.from({ length: totalDays }).map((_, i) => {
          const d = new Date(first.getTime() + i * 86400000);
          const iso = d.toISOString().slice(0, 10);
          const col = Math.floor((i + firstWd) / 7);
          const row = (i + firstWd) % 7;
          const v = byDate.get(iso);
          const op = v == null ? 0.04 : intensity(v);
          return (
            <g key={iso}>
              <rect
                x={labelCol + col * (cellSize + gap)}
                y={labelRow + row * (cellSize + gap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill="hsl(var(--accent))"
                fillOpacity={op}
              >
                {v != null && valueLabel && (
                  <title>{`${iso} — ${valueLabel(v)}`}</title>
                )}
              </rect>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
