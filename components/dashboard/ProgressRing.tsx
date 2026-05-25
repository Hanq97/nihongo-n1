export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  color = "var(--success)",
  bg = "var(--surface-alt)",
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  bg?: string;
  label?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - value);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={bg} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s" }}
        />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">{label}</div>
      )}
    </div>
  );
}
