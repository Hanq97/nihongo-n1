"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Heatmap } from "@/components/dashboard/Heatmap";
import { Icons } from "@/components/ui/Icon";
import { useApp } from "@/lib/store";
import { storage } from "@/lib/storage";
import { getDueCards, getStreak, getProgressByType } from "@/lib/srs-helpers";
import { daysBetween, formatDateVi } from "@/lib/utils";

export default function DashboardPage() {
  const { currentUser, lastSync, clearLastSync } = useApp();
  const [stats, setStats] = useState({
    due: 0,
    newToday: 0,
    streak: 0,
    daysToExam: 0,
    progress: {
      kanji: { learned: 0, total: 0 },
      vocab: { learned: 0, total: 0 },
      grammar: { learned: 0, total: 0 },
    },
    totalReviews: 0,
    activeDays: 0,
    logs: [] as any[],
    bestMock: null as number | null,
  });

  useEffect(() => {
    if (!currentUser) return;
    const due = getDueCards(currentUser.id).length;
    const newCount = storage
      .getCardStates()
      .filter((s) => s.user_id === currentUser.id && s.state === "new").length;
    const streak = getStreak(currentUser.id);
    const daysToExam = currentUser.target_exam_date
      ? Math.max(0, daysBetween(new Date(), new Date(currentUser.target_exam_date)))
      : 0;
    const progress = getProgressByType(currentUser.id);
    const logs = storage.getReviewLogs().filter((l) => l.user_id === currentUser.id);
    const days = new Set<string>();
    logs.forEach((l) => {
      const d = new Date(l.reviewed_at);
      days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    const mockResults = storage.getMockResults().filter((r) => r.user_id === currentUser.id);
    const bestMock = mockResults.length > 0 ? Math.max(...mockResults.map((r) => r.total_score)) : null;

    setStats({
      due,
      newToday: Math.min(newCount, 12),
      streak,
      daysToExam,
      progress,
      totalReviews: logs.length,
      activeDays: days.size,
      logs,
      bestMock,
    });
  }, [currentUser, lastSync]);

  if (!currentUser) return <AppShell>{null}</AppShell>;

  const totalProgress =
    stats.progress.kanji.total + stats.progress.vocab.total + stats.progress.grammar.total;
  const learnedProgress =
    stats.progress.kanji.learned + stats.progress.vocab.learned + stats.progress.grammar.learned;
  const examDateStr = currentUser.target_exam_date
    ? new Date(currentUser.target_exam_date).toLocaleDateString("vi-VN", { weekday: "long" })
    : "";

  return (
    <AppShell>
      <div className="p-5 sm:p-7 max-w-7xl mx-auto pb-28 lg:pb-7">
        {lastSync && (
          <div className="mb-5 bg-accent-soft border border-accent/30 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="text-xl">✨</div>
            <div className="flex-1 text-sm">
              <div className="font-semibold text-ink">Đã đồng bộ dữ liệu mới</div>
              <div className="text-muted text-xs mt-0.5">
                Thêm {lastSync.kanji > 0 ? `${lastSync.kanji} kanji` : ""}
                {lastSync.kanji > 0 && lastSync.vocab > 0 ? ", " : ""}
                {lastSync.vocab > 0 ? `${lastSync.vocab} từ vựng` : ""}
                {(lastSync.kanji > 0 || lastSync.vocab > 0) && lastSync.grammar > 0 ? ", " : ""}
                {lastSync.grammar > 0 ? `${lastSync.grammar} ngữ pháp` : ""}{" "}
                vào deck mặc định.
              </div>
            </div>
            <button onClick={clearLastSync} className="text-muted hover:text-ink text-lg leading-none">
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT — main */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Hero */}
            <Link
              href="/learn"
              className="relative overflow-hidden rounded-[22px] p-7 sm:p-8 text-white block transition-transform hover:scale-[1.005]"
              style={{
                background: "linear-gradient(120deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 80%, #6366F1) 100%)",
                boxShadow: "0 14px 40px rgba(124, 92, 255, 0.3)",
              }}
            >
              <div
                className="absolute right-[-40px] bottom-[-100px] jp-serif font-bold leading-none pointer-events-none select-none"
                style={{ fontSize: "min(340px, 80vw)", color: "rgba(255,255,255,0.08)" }}
              >
                道
              </div>
              <div className="relative max-w-[480px]">
                <div className="text-[12px] font-semibold uppercase tracking-[1.2px] opacity-85">
                  Chào {currentUser.display_name} • <span className="jp">こんにちは</span>
                </div>
                <div className="mt-2 flex items-baseline gap-2 flex-wrap">
                  <span className="text-5xl sm:text-6xl font-extrabold leading-none tracking-tightest tabular-nums">
                    {stats.due}
                  </span>
                  <span className="text-lg sm:text-xl font-medium opacity-90">thẻ cần ôn hôm nay</span>
                </div>
                <div className="mt-1.5 text-sm opacity-80">
                  + {stats.newToday} thẻ mới • Mục tiêu {currentUser.daily_goal}/ngày • ~{Math.round(stats.due * 0.4)} phút
                </div>
                <div className="mt-5 flex gap-2.5 flex-wrap">
                  <Button variant="secondary" className="bg-white text-accent hover:bg-white/95">
                    Bắt đầu học <Icons.Arrow />
                  </Button>
                  <Link href="/quiz">
                    <Button className="bg-white/15 text-white backdrop-blur hover:bg-white/25 shadow-none">
                      Quiz nhanh 5 phút
                    </Button>
                  </Link>
                </div>
              </div>
            </Link>

            {/* Heatmap */}
            <Card>
              <CardBody className="p-5 sm:p-6">
                <div className="flex justify-between items-end mb-4 gap-3">
                  <div>
                    <div className="text-[15px] font-bold text-ink">Hoạt động học tập</div>
                    <div className="text-xs text-muted mt-0.5">
                      365 ngày qua · {stats.totalReviews} thẻ · {stats.activeDays} ngày học
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Heatmap logs={stats.logs} weeks={52} />
                </div>
              </CardBody>
            </Card>

            {/* Progress + Hardest */}
            <div className="grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] gap-5">
              <Card>
                <CardBody className="p-5 sm:p-6">
                  <div className="text-[15px] font-bold text-ink mb-4">Tiến độ N1</div>
                  <ProgressRow label="Kanji" jp="漢字" done={stats.progress.kanji.learned} total={stats.progress.kanji.total} color="var(--accent)" />
                  <div className="h-3.5" />
                  <ProgressRow label="Từ vựng" jp="単語" done={stats.progress.vocab.learned} total={stats.progress.vocab.total} color="var(--success)" />
                  <div className="h-3.5" />
                  <ProgressRow label="Ngữ pháp" jp="文法" done={stats.progress.grammar.learned} total={stats.progress.grammar.total} color="var(--warning)" />
                  {totalProgress > 0 && (
                    <div className="mt-4 p-3 rounded-[10px] bg-surface-alt text-xs text-ink-soft leading-relaxed">
                      💡 Đã học <b className="text-ink">{learnedProgress}/{totalProgress}</b> thẻ ({Math.round((learnedProgress / totalProgress) * 100)}%)
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card className="p-0 overflow-hidden">
                <div className="px-5 pt-5 pb-2 flex justify-between items-end">
                  <div className="text-[15px] font-bold text-ink">Thẻ khó nhất</div>
                  <span className="text-[11px] text-muted">Top 4</span>
                </div>
                <HardestCards userId={currentUser.id} />
              </Card>
            </div>
          </div>

          {/* RIGHT — sidebar widgets */}
          <div className="flex flex-col gap-4">
            {/* Exam countdown */}
            {stats.daysToExam > 0 && (
              <Card className="relative overflow-hidden">
                <CardBody className="p-5 sm:p-6 relative">
                  <div
                    className="absolute right-[-10px] bottom-[-30px] jp-serif font-bold leading-none pointer-events-none select-none"
                    style={{ fontSize: 130, color: "var(--accent-soft)" }}
                  >
                    試
                  </div>
                  <div className="relative">
                    <div className="text-[11px] text-muted font-semibold uppercase tracking-wider">Ngày thi N1</div>
                    <div className="mt-1.5 flex items-baseline gap-1.5">
                      <span className="text-5xl font-extrabold text-ink tracking-tighter tabular-nums">{stats.daysToExam}</span>
                      <span className="text-sm text-muted font-semibold">ngày</span>
                    </div>
                    <div className="text-[13px] text-ink-soft font-medium">
                      {formatDateVi(currentUser.target_exam_date)} · {examDateStr}
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Best mock */}
            <Card>
              <CardBody className="p-5">
                <div className="flex items-center gap-3.5">
                  <ProgressRing
                    value={stats.bestMock ? stats.bestMock / 100 : 0}
                    color={stats.bestMock && stats.bestMock >= 60 ? "var(--success)" : "var(--warning)"}
                    bg="var(--surface-alt)"
                    label={
                      <div className="text-[15px] font-extrabold text-ink tracking-tight">
                        {stats.bestMock ?? "—"}
                      </div>
                    }
                  />
                  <div className="flex-1">
                    <div className="text-[11px] text-muted font-semibold uppercase tracking-wider">Mock test cao nhất</div>
                    <div className="text-base font-bold text-ink mt-0.5">
                      {stats.bestMock !== null ? `${stats.bestMock}%` : "Chưa thi"}
                    </div>
                    {stats.bestMock !== null && (
                      <div
                        className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{
                          background: stats.bestMock >= 60 ? "color-mix(in srgb, var(--success) 20%, transparent)" : "color-mix(in srgb, var(--warning) 20%, transparent)",
                          color: stats.bestMock >= 60 ? "var(--success)" : "var(--warning)",
                        }}
                      >
                        {stats.bestMock >= 60 ? "ĐẬU" : "CẦN ÔN THÊM"}
                      </div>
                    )}
                  </div>
                </div>
                <Link href="/mock-test">
                  <Button variant="secondary" className="w-full mt-3.5">
                    Làm đề thi tiếp <Icons.Arrow />
                  </Button>
                </Link>
              </CardBody>
            </Card>

            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/quiz">
                <Card className="hover:bg-surface-alt transition-colors cursor-pointer">
                  <CardBody className="p-4 text-center">
                    <div className="text-2xl mb-1">
                      <Icons.Bolt />
                    </div>
                    <div className="text-xs font-semibold text-ink">Quiz nhanh</div>
                  </CardBody>
                </Card>
              </Link>
              <Link href="/decks">
                <Card className="hover:bg-surface-alt transition-colors cursor-pointer">
                  <CardBody className="p-4 text-center">
                    <div className="text-2xl mb-1">📚</div>
                    <div className="text-xs font-semibold text-ink">Decks</div>
                  </CardBody>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ProgressRow({
  label,
  jp,
  done,
  total,
  color,
}: {
  label: string;
  jp: string;
  done: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold text-ink">{label}</span>
          <span className="jp text-[10px] text-muted">{jp}</span>
        </div>
        <div className="text-xs tabular-nums">
          <span className="font-bold text-ink">{done.toLocaleString()}</span>
          <span className="text-muted"> / {total.toLocaleString()}</span>
          <span className="text-muted ml-1.5">{pct}%</span>
        </div>
      </div>
      <Progress value={done} max={Math.max(total, 1)} color={color} size="md" />
    </div>
  );
}

function HardestCards({ userId }: { userId: string }) {
  const cardStates = storage
    .getCardStates()
    .filter((s) => s.user_id === userId && s.lapses > 0)
    .sort((a, b) => b.lapses - a.lapses)
    .slice(0, 4);
  const cards = storage.getCards();
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  if (cardStates.length === 0) {
    return (
      <div className="px-5 py-6 text-center text-xs text-muted">Chưa có thẻ nào lapses.</div>
    );
  }

  // We need to import data lazily — keep this client-side via runtime import
  return (
    <>
      {cardStates.map((s) => {
        const c = cardMap.get(s.card_id);
        if (!c) return null;
        const entity = getEntityForCard(c.entity_type, c.entity_id);
        return (
          <div key={s.card_id} className="px-5 py-2.5 flex items-center gap-3 border-t border-[color:var(--border)]">
            <div className="flex-1 min-w-0">
              <div className="jp-serif text-[17px] font-semibold text-ink truncate">
                {entity?.front ?? "?"}
              </div>
              {entity?.reading && (
                <div className="jp text-[11px] text-muted truncate mt-px">{entity.reading}</div>
              )}
            </div>
            <div
              className="px-2 py-0.5 rounded text-[11px] font-bold"
              style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)", color: "var(--danger)" }}
            >
              ×{s.lapses}
            </div>
          </div>
        );
      })}
    </>
  );
}

function getEntityForCard(type: string, id: number): { front: string; reading?: string } | null {
  // Read from data files via dynamic require to avoid SSR import
  if (typeof window === "undefined") return null;
  const { getKanjiById, getVocabById, getGrammarById } = require("@/data");
  if (type === "kanji") {
    const k = getKanjiById(id);
    return k ? { front: k.character } : null;
  }
  if (type === "vocab") {
    const v = getVocabById(id);
    return v ? { front: v.word, reading: v.reading } : null;
  }
  const g = getGrammarById(id);
  return g ? { front: g.pattern } : null;
}
