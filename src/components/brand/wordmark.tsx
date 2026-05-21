import { cn } from "@/lib/utils";

type WordmarkColor = "forest" | "cream";

interface WordmarkProps {
  height?: number;
  className?: string;
  color?: WordmarkColor;
  ariaLabel?: string;
}

// The source SVG is authored in cream (#FFFDFA). For dark backgrounds we
// render it as-is; for light backgrounds we invert via a hue-preserving filter.
const COLOR_STYLE: Record<WordmarkColor, React.CSSProperties> = {
  cream: {},
  forest: {
    filter:
      "brightness(0) saturate(100%) invert(15%) sepia(74%) saturate(2046%) hue-rotate(146deg) brightness(96%) contrast(102%)",
  },
};

export function Wordmark({
  height = 48,
  className,
  color = "cream",
  ariaLabel = "Daniel's",
}: WordmarkProps) {
  // Width derives from the source viewBox 1536:420
  const width = Math.round((height * 1536) / 420);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/daniels-wordmark.svg"
      alt={ariaLabel}
      width={width}
      height={height}
      style={COLOR_STYLE[color]}
      className={cn("select-none", className)}
    />
  );
}
