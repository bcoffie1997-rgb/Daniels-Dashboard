import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/lib/mock/types";

interface StatusBadgeProps {
  status: SessionStatus;
  className?: string;
}

const LABEL: Record<SessionStatus, string> = {
  in_progress: "In progress",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

const STYLE: Record<SessionStatus, string> = {
  in_progress:
    "border-border bg-transparent text-muted-foreground",
  submitted:
    "border-warning/30 bg-warning/10 text-warning",
  approved:
    "border-accent/30 bg-accent/10 text-accent",
  rejected:
    "border-destructive/30 bg-destructive/10 text-destructive",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "caption inline-flex items-center rounded-md border px-2 py-0.5",
        STYLE[status],
        className,
      )}
    >
      {LABEL[status]}
    </span>
  );
}
