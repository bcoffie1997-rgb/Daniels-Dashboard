import { cn } from "@/lib/cn";

export function GioiaMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect x="0.5" y="0.5" width="31" height="31" rx="6" stroke="currentColor" />
        <path
          d="M16 8.5C11.85 8.5 8.5 11.85 8.5 16C8.5 20.15 11.85 23.5 16 23.5C18.5 23.5 20.65 22.3 22 20.5L20.3 19.4C19.35 20.65 17.8 21.5 16 21.5C13 21.5 10.5 19 10.5 16C10.5 13 13 10.5 16 10.5C17.7 10.5 19.2 11.25 20.2 12.45L22 11.35C20.65 9.7 18.5 8.5 16 8.5Z"
          fill="currentColor"
        />
        <circle cx="22" cy="16" r="1.5" fill="currentColor" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-display text-base tracking-wide">GIOIA</span>
        <span className="micro text-muted-foreground">Hospitality</span>
      </div>
    </div>
  );
}
