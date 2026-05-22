// Minimal SVG/CSS chart primitives. Pure server-renderable.

export function Sparkline({
  values,
  width = 160,
  height = 40,
  color = "currentColor",
  fillOpacity = 0.12,
  strokeWidth = 1.5,
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
}) {
  if (values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / Math.max(1, values.length - 1);
  const points = values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const fillPath = `M0,${height} L${points.replace(/ /g, " L")} L${width},${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <path d={fillPath} fill={color} fillOpacity={fillOpacity} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LineChart({
  data,
  height = 200,
  yLabels = 4,
  showArea = true,
  color = "currentColor",
}: {
  data: Array<{ label: string; value: number }>;
  height?: number;
  yLabels?: number;
  showArea?: boolean;
  color?: string;
}) {
  if (data.length === 0) return null;
  const values = data.map((d) => d.value);
  const min = 0;
  const max = Math.max(...values) * 1.1 || 1;
  const padL = 36;
  const padR = 4;
  const padT = 8;
  const padB = 20;
  const width = 800;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const stepX = innerW / Math.max(1, data.length - 1);
  const yTicks = Array.from({ length: yLabels + 1 }).map((_, i) =>
    Math.round((max * (yLabels - i)) / yLabels),
  );
  const points = data
    .map((d, i) => {
      const x = padL + i * stepX;
      const y = padT + innerH - ((d.value - min) / (max - min)) * innerH;
      return [x, y];
    });
  const polyStr = points.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const areaPath =
    `M${padL},${padT + innerH} ` +
    points.map((p) => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") +
    ` L${(padL + innerW).toFixed(1)},${padT + innerH} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      {/* Y axis grid */}
      {yTicks.map((v, i) => {
        const y = padT + (innerH * i) / yLabels;
        return (
          <g key={i}>
            <line
              x1={padL}
              y1={y}
              x2={padL + innerW}
              y2={y}
              stroke="currentColor"
              strokeOpacity={i === yLabels ? 0.3 : 0.08}
              strokeDasharray={i === yLabels ? "" : "2 4"}
            />
            <text
              x={padL - 6}
              y={y + 3}
              fontSize="10"
              fill="currentColor"
              opacity={0.5}
              textAnchor="end"
            >
              {formatShort(v)}
            </text>
          </g>
        );
      })}
      {showArea && <path d={areaPath} fill={color} fillOpacity={0.1} />}
      <polyline points={polyStr} fill="none" stroke={color} strokeWidth={2} />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill={color} />
      ))}
      {/* X labels — every Nth so they don't overlap */}
      {data.map((d, i) => {
        const stride = Math.max(1, Math.ceil(data.length / 8));
        if (i % stride !== 0 && i !== data.length - 1) return null;
        const x = padL + i * stepX;
        return (
          <text
            key={i}
            x={x}
            y={padT + innerH + 14}
            fontSize="10"
            fill="currentColor"
            opacity={0.5}
            textAnchor="middle"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

export function BarChart({
  data,
  height = 220,
  color = "currentColor",
}: {
  data: Array<{ label: string; value: number; sub?: string }>;
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div className="space-y-2" style={{ minHeight: height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex items-center gap-3 text-sm">
            <div className="w-32 sm:w-44 truncate text-muted-foreground shrink-0">{d.label}</div>
            <div className="flex-1 h-6 rounded bg-muted/40 overflow-hidden relative">
              <div
                className="h-full rounded transition-all"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
            <div className="w-20 text-right tabular shrink-0">{formatShort(d.value)}</div>
            {d.sub && (
              <div className="w-12 text-right tabular shrink-0 text-xs text-muted-foreground">
                {d.sub}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StackedBars({
  data,
  segments,
  height = 200,
}: {
  data: Array<{ label: string; values: number[] }>;
  segments: Array<{ label: string; color: string }>;
  height?: number;
}) {
  if (data.length === 0) return null;
  const totals = data.map((d) => d.values.reduce((s, v) => s + v, 0));
  const max = Math.max(...totals) || 1;
  return (
    <div>
      <div className="flex items-end justify-between gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const total = totals[i];
          const barH = (total / max) * (height - 24);
          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-0">
              <div
                className="w-full rounded-t overflow-hidden flex flex-col-reverse"
                style={{ height: barH }}
                title={`${d.label}: ${formatShort(total)}`}
              >
                {d.values.map((v, j) => (
                  <div
                    key={j}
                    style={{
                      height: total > 0 ? `${(v / total) * 100}%` : "0%",
                      backgroundColor: segments[j].color,
                    }}
                  />
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1.5 truncate w-full text-center">
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-4 flex-wrap text-xs">
        {segments.map((s) => (
          <div key={s.label} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded" style={{ backgroundColor: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Donut({
  segments,
  size = 140,
  thickness = 18,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  size?: number;
  thickness?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.08}
          strokeWidth={thickness}
        />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const dasharray = `${len} ${c - len}`;
          const dashoffset = -acc;
          acc += len;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </svg>
      <ul className="text-sm space-y-1.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-1 tabular">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatShort(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  if (n === Math.floor(n)) return n.toString();
  return n.toFixed(1);
}
