import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        className,
      )}
      aria-hidden
    />
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4 flex-1", i === 0 ? "max-w-[40%]" : "max-w-[20%]")} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export function PageSkeleton({ title = true, rows = 6 }: { title?: boolean; rows?: number }) {
  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
      {title && (
        <>
          <Skeleton className="h-3 w-32 mb-3" />
          <Skeleton className="h-10 w-72 mb-2" />
          <Skeleton className="h-4 w-96 mb-8" />
        </>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Skeleton className="h-10 w-full rounded-none" />
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </main>
  );
}
