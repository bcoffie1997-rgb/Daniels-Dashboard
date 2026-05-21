import { formatDistanceToNow, format } from "date-fns";
import type { Unit } from "./mock/types";

export function relativeFromNow(iso: string | null | undefined): string {
  if (!iso) return "—";
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function absoluteTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return format(new Date(iso), "MMM d, h:mm a");
}

export function formatQuantity(
  quantity: number | null | undefined,
  unit?: Unit,
): string {
  if (quantity === null || quantity === undefined) return "—";
  // Trim trailing zeros for display but keep up to 3 decimals.
  const trimmed = Number(quantity.toFixed(3)).toString();
  return unit ? `${trimmed} ${unit}` : trimmed;
}

export function formatDuration(
  startIso: string,
  endIso: string | null,
): string {
  if (!endIso) return "—";
  const seconds = Math.max(
    0,
    Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 1000),
  );
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export function formatMoney(
  n: number,
  opts: { compact?: boolean } = {},
): string {
  if (opts.compact && Math.abs(n) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}
