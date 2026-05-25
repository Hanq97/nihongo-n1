import { cn } from "@/lib/utils";

export function Progress({
  value,
  max = 100,
  className,
  barClassName,
  size = "md",
  color,
}: {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { sm: "h-1", md: "h-1.5", lg: "h-2" };
  return (
    <div className={cn("w-full bg-surface-alt rounded-full overflow-hidden", heights[size], className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-700", color ? "" : "bg-accent", barClassName)}
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
