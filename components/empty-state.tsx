import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

type Tone = "default" | "success" | "warning" | "destructive" | "accent";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  tone = "default",
  className,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  const borderClass = {
    default: "border-border",
    success: "border-success/40",
    warning: "border-warning/40",
    destructive: "border-destructive/40",
    accent: "border-accent/40",
  }[tone];
  const bgClass = {
    default: "bg-card",
    success: "bg-success/10",
    warning: "bg-warning-bg",
    destructive: "bg-destructive-bg",
    accent: "bg-accent/5",
  }[tone];
  const iconClass = {
    default: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
    accent: "text-accent",
  }[tone];

  return (
    <div className={cn("rounded-lg border p-8 text-center", borderClass, bgClass, className)}>
      <div
        className={cn(
          "h-12 w-12 rounded-full bg-background/50 border flex items-center justify-center mx-auto",
          borderClass,
        )}
      >
        <Icon className={cn("h-6 w-6", iconClass)} />
      </div>
      <div className="font-display text-display-md mt-3.5">{title}</div>
      {body && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
          {body}
        </p>
      )}
      {action && <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">{action}</div>}
    </div>
  );
}
