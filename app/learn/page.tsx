"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardBody } from "@/components/ui/Card";
import { Icons } from "@/components/ui/Icon";
import { useApp } from "@/lib/store";
import { getDueCountsByType } from "@/lib/srs-helpers";

const CHOICES = [
  { type: "all", jp: "全部", title: "Tất cả", desc: "Học cả 3 mục theo SRS" },
  { type: "kanji", jp: "漢字", title: "Kanji", desc: "Chữ Hán N1" },
  { type: "vocab", jp: "単語", title: "Từ vựng", desc: "Vocabulary N1" },
  { type: "grammar", jp: "文法", title: "Ngữ pháp", desc: "Grammar N1" },
] as const;

export default function LearnHubPage() {
  const { currentUser, lastSync } = useApp();
  const [counts, setCounts] = useState({ kanji: 0, vocab: 0, grammar: 0 });

  useEffect(() => {
    if (!currentUser) return;
    setCounts(getDueCountsByType(currentUser.id));
  }, [currentUser, lastSync]);

  const total = counts.kanji + counts.vocab + counts.grammar;
  const countFor = (t: string) => (t === "all" ? total : counts[t as keyof typeof counts]);

  return (
    <AppShell>
      <div className="p-5 sm:p-7 max-w-5xl mx-auto pb-28 lg:pb-7">
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
            <span className="jp">今日の学習</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1 tracking-tight">Học hôm nay</h1>
          <p className="text-sm text-muted mt-1">
            {total > 0 ? `Tổng cộng ${total} thẻ đáo hạn — chọn mục để bắt đầu` : "Không có thẻ cần ôn 🎉"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CHOICES.map((c) => {
            const due = countFor(c.type);
            const disabled = due === 0;
            const inner = (
              <div
                className="relative overflow-hidden rounded-[22px] p-6 text-white"
                style={{
                  background: `linear-gradient(120deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 60%, #8B5CF6) 100%)`,
                  boxShadow: disabled ? "none" : "0 14px 40px rgba(124, 92, 255, 0.25)",
                  opacity: disabled ? 0.4 : 1,
                  filter: disabled ? "grayscale(1)" : "none",
                }}
              >
                <div
                  className="absolute right-[-30px] bottom-[-60px] jp-serif font-bold leading-none pointer-events-none select-none"
                  style={{ fontSize: 200, color: "rgba(255,255,255,0.10)" }}
                >
                  {c.jp}
                </div>
                <div className="relative">
                  <div className="text-[11px] uppercase tracking-wider opacity-85 font-semibold">{c.title}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold tracking-tightest tabular-nums">{due}</span>
                    <span className="text-sm opacity-90 font-medium">thẻ</span>
                  </div>
                  <div className="mt-1 text-sm opacity-80">{c.desc}</div>
                  <div className="mt-4 text-xs font-semibold inline-flex items-center gap-1.5">
                    {disabled ? "Không có thẻ đáo hạn" : (
                      <>
                        Bắt đầu <Icons.Arrow />
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
            if (disabled) return <div key={c.type}>{inner}</div>;
            return (
              <Link key={c.type} href={`/learn/${c.type}`} className="transition-transform hover:scale-[1.01]">
                {inner}
              </Link>
            );
          })}
        </div>

        <Card className="mt-6">
          <CardBody>
            <div className="font-bold text-ink mb-2">💡 Mẹo</div>
            <ul className="text-sm text-ink-soft space-y-1 list-disc pl-5 leading-relaxed">
              <li>Chọn &quot;Tất cả&quot; để học theo lịch SRS tối ưu cho từng thẻ.</li>
              <li>Học riêng từng mục khi muốn tập trung mảng yếu.</li>
              <li>
                <b>Desktop</b>: Space (lật) · 1/2/3/4 (rate) · Esc (thoát).
              </li>
              <li>
                <b>Mobile</b>: vuốt ← Quên, → Tốt, ↑ Dễ, ↓ Khó.
              </li>
            </ul>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
