"use client";

import { cn } from "@/lib/utils";

export type RangePeriod = "7d" | "30d" | "90d" | "ytd" | "all";

const LABELS: Record<RangePeriod, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  ytd: "Year to date",
  all: "Since opening",
};

interface RangePickerProps {
  value: RangePeriod;
  onChange: (v: RangePeriod) => void;
  className?: string;
}

export function RangePicker({ value, onChange, className }: RangePickerProps) {
  const periods: RangePeriod[] = ["7d", "30d", "90d", "ytd", "all"];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1",
        className,
      )}
    >
      {periods.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={cn(
            "rounded-md px-3 py-1.5 text-body-sm transition-colors",
            value === p
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {LABELS[p]}
        </button>
      ))}
    </div>
  );
}
