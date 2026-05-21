export type VarianceClass = "neutral" | "ok" | "warn" | "danger";

export function computeVariance(
  current: number,
  previous: number | null | undefined,
): number | null {
  if (previous === null || previous === undefined) return null;
  if (previous === 0) return null;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

export function classifyVariance(
  variance_pct: number | null,
): VarianceClass {
  if (variance_pct === null || variance_pct === undefined) return "neutral";
  const abs = Math.abs(variance_pct);
  if (abs >= 50) return "danger";
  if (abs >= 20) return "warn";
  if (abs > 0) return "ok";
  return "neutral";
}

export function formatVariance(variance_pct: number | null): string {
  if (variance_pct === null || variance_pct === undefined) return "—";
  const rounded = Math.round(variance_pct);
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}
