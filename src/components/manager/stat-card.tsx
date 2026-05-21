import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <Card className={cn("bg-card p-5", className)}>
      <p className="caption text-muted-foreground">{label}</p>
      <p className="tabular mt-2 font-display text-display-lg text-foreground">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-body-sm text-muted-foreground">{hint}</p>
      )}
    </Card>
  );
}
