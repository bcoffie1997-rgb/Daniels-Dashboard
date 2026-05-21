import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type Variant = "default" | "accent" | "success" | "warning" | "destructive" | "outline";

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  const variants: Record<Variant, string> = {
    default: "bg-muted text-muted-foreground",
    accent: "bg-accent/20 text-accent border border-accent/40",
    success: "bg-success/20 text-success border border-success/40",
    warning: "bg-warning-bg text-warning border border-warning/40",
    destructive: "bg-destructive-bg text-destructive border border-destructive/40",
    outline: "border border-border text-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
