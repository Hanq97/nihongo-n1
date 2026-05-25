"use client";
import { useMemo } from "react";
import type { ReviewLog } from "@/types";

export function Heatmap({ logs, weeks = 52 }: { logs: ReviewLog[]; weeks?: number }) {
  const data = useMemo(() => {
    const counts = new Map<string, number>();
    logs.forEach((l) => {
      const d = new Date(l.reviewed_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - (weeks * 7 - 1));
    const startDay = start.getDay();
    start.setDate(start.getDate() - ((startDay + 6) % 7));

    const cells: { date: Date; count: number }[] = [];
    const d = new Date(start);
    for (let i = 0; i < weeks * 7; i++) {
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      cells.push({ date: new Date(d), count: counts.get(k) ?? 0 });
      d.setDate(d.getDate() + 1);
    }
    return cells;
  }, [logs, weeks]);

  const cellColor = (c: number) => {
    if (c === 0) return "var(--surface-alt)";
    const max = 40;
    const t = Math.min(1, c / max);
    const alpha = Math.round((0.25 + t * 0.75) * 255).toString(16).padStart(2, "0");
    return `color-mix(in srgb, var(--accent) ${Math.round((0.25 + t * 0.75) * 100)}%, transparent)`;
  };

  // Group cells by week (column-major)
  const weeksData: { date: Date; count: number }[][] = [];
  for (let w = 0; w < weeks; w++) {
    weeksData.push(data.slice(w * 7, (w + 1) * 7));
  }

  return (
    <div>
      <div className="flex gap-[3px]">
        <div className="flex flex-col justify-between text-[10px] text-muted py-0.5 pr-1.5 select-none">
          <span>T2</span>
          <span>T4</span>
          <span>T6</span>
        </div>
        <div className="flex gap-[3px] flex-1">
          {weeksData.map((week, w) => (
            <div key={w} className="flex flex-col gap-[3px] flex-1">
              {week.map((cell, d) => (
                <div
                  key={d}
                  title={`${cell.date.toLocaleDateString("vi-VN")} — ${cell.count} thẻ`}
                  className="aspect-square w-full rounded-[2.5px] min-w-[10px]"
                  style={{ background: cellColor(cell.count), maxHeight: 12 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 justify-end mt-3 text-[11px] text-muted">
        <span>Ít</span>
        {[0.12, 0.3, 0.55, 0.85].map((o, i) => (
          <div
            key={i}
            className="w-[11px] h-[11px] rounded-[2.5px]"
            style={{
              background: `color-mix(in srgb, var(--accent) ${Math.round(o * 100)}%, transparent)`,
            }}
          />
        ))}
        <span>Nhiều</span>
      </div>
    </div>
  );
}
