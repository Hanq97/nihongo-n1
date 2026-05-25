"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Icons } from "@/components/ui/Icon";
import { useApp } from "@/lib/store";
import { applyRating, preview, intervalLabel, type RatingKey } from "@/lib/fsrs";
import { getDueCards } from "@/lib/srs-helpers";
import { getKanjiById, getVocabById, getGrammarById } from "@/data";
import { uid, cn } from "@/lib/utils";
import type { Card as CardT, UserCardState } from "@/types";

type Queue = { card: CardT; state: UserCardState }[];

type Props = { typeFilter?: "kanji" | "vocab" | "grammar" };

export function Flashcard({ typeFilter }: Props = {}) {
  const router = useRouter();
  const { currentUser, saveCardState, logReview } = useApp();
  const [queue, setQueue] = useState<Queue>([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [counts, setCounts] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const due = getDueCards(currentUser.id, currentUser.daily_goal, typeFilter);
    setQueue(due);
    setTotalCount(due.length);
    setLoaded(true);
  }, [currentUser, typeFilter]);

  const current = queue[idx];
  const previews = useMemo(() => (current ? preview(current.state) : null), [current]);

  function rate(key: RatingKey) {
    if (!current || !currentUser) return;
    const newState = applyRating(current.state, key);
    saveCardState(newState);
    const ratingNum = { Again: 1, Hard: 2, Good: 3, Easy: 4 }[key] as 1 | 2 | 3 | 4;
    logReview({
      id: uid(),
      user_id: currentUser.id,
      card_id: current.card.id,
      rating: ratingNum,
      state_before: current.state.state,
      state_after: newState.state,
      reviewed_at: new Date().toISOString(),
    });
    setCounts((c) => ({ ...c, [key.toLowerCase() as keyof typeof c]: c[key.toLowerCase() as keyof typeof c] + 1 }));
    const updatedQueue = [...queue];
    if (key === "Again") updatedQueue.push({ card: current.card, state: newState });
    setQueue(updatedQueue);
    setFlipped(false);
    if (idx + 1 >= updatedQueue.length) setDone(true);
    else setIdx(idx + 1);
    if (navigator.vibrate) navigator.vibrate(10);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!flipped) setFlipped(true);
        else rate("Good");
      } else if (e.key === "Escape") {
        router.push("/dashboard");
      } else if (flipped) {
        if (e.key === "1") rate("Again");
        else if (e.key === "2") rate("Hard");
        else if (e.key === "3") rate("Good");
        else if (e.key === "4") rate("Easy");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, idx, queue, done]);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current || !flipped) {
      touchStart.current = null;
      return;
    }
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    const TH = 60;
    if (Math.abs(dx) < TH && Math.abs(dy) < TH) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) rate("Again");
      else rate("Good");
    } else {
      if (dy < 0) rate("Easy");
      else rate("Hard");
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted">Đang tải thẻ...</div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-bg">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center text-7xl jp-serif font-bold"
          style={{
            background: "color-mix(in srgb, var(--success) 22%, transparent)",
            color: "var(--success)",
          }}
        >
          完
        </div>
        <h1 className="mt-7 text-3xl font-bold text-ink tracking-tight">Không có thẻ cần ôn!</h1>
        <p className="mt-2 text-muted text-center max-w-md leading-relaxed">
          Bạn đã ôn xong tất cả thẻ đáo hạn. Quay lại sau nhé.
        </p>
        <Button size="xl" className="mt-7" onClick={() => router.push("/dashboard")}>
          Về trang chủ
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-bg">
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center text-7xl jp-serif font-bold"
          style={{
            background: "color-mix(in srgb, var(--success) 22%, transparent)",
            color: "var(--success)",
          }}
        >
          完
        </div>
        <h1 className="mt-7 text-3xl font-bold text-ink tracking-tight">Hoàn thành phiên học!</h1>
        <p className="mt-2 text-muted leading-relaxed">
          Bạn vừa ôn xong <b className="text-ink">{totalCount} thẻ</b>
        </p>
        <div className="grid grid-cols-4 gap-2.5 mt-7 w-full max-w-md">
          {(
            [
              { k: "again", l: "Quên", c: "var(--danger)" },
              { k: "hard", l: "Khó", c: "var(--warning)" },
              { k: "good", l: "Tốt", c: "var(--success)" },
              { k: "easy", l: "Dễ", c: "var(--info)" },
            ] as const
          ).map(({ k, l, c }) => (
            <div
              key={k}
              className="rounded-xl p-3 text-center"
              style={{ background: `color-mix(in srgb, ${c} 12%, transparent)` }}
            >
              <div className="text-2xl font-bold tabular-nums" style={{ color: c }}>
                {counts[k]}
              </div>
              <div className="text-[11px] text-muted mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-7 flex gap-3">
          <Button variant="secondary" onClick={() => router.push("/dashboard")} size="lg">
            Về trang chủ
          </Button>
          <Button onClick={() => router.push("/quiz")} size="lg">
            Quiz nhanh
          </Button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  const entity = getEntity(current.card);

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Top progress bar */}
      <div className="px-5 sm:px-8 py-5 flex items-center gap-4 border-b border-[color:var(--border)]">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-8 h-8 rounded-lg bg-surface-alt text-muted flex items-center justify-center hover:text-ink transition-colors"
          title="Thoát (Esc)"
        >
          <Icons.Close />
        </button>
        <div className="flex-1">
          <div className="flex justify-between items-baseline mb-1 gap-3">
            <div className="text-xs text-muted">
              <b className="text-ink">{idx + 1}</b> / {queue.length} thẻ
            </div>
            <div className="text-[11px] text-muted hidden sm:flex items-center gap-1.5">
              <Kbd>Space</Kbd> để lật · <Kbd>1-4</Kbd> để đánh giá
            </div>
          </div>
          <Progress value={idx + 1} max={queue.length} size="md" />
        </div>
      </div>

      {/* Card stage */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-7"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-full max-w-[560px] card-3d" style={{ minHeight: 380 }}>
          <div
            className={cn("card-inner", flipped && "flipped")}
            style={{ minHeight: 380 }}
            onClick={() => setFlipped((f) => !f)}
          >
            {/* Front */}
            <div
              className="card-face bg-surface rounded-[22px] p-8 sm:p-10 shadow-elev flex flex-col items-center cursor-pointer select-none"
              style={{ minHeight: 380 }}
            >
              <div className="text-[11px] font-semibold text-muted tracking-[1.5px] uppercase">
                {labelForType(current.card.entity_type)} · N1
              </div>
              <div className="flex-1 flex items-center justify-center w-full">
                <FrontFace entity={entity} type={current.card.entity_type} />
              </div>
              <div className="text-[13px] text-muted text-center">
                Bấm thẻ hoặc <Kbd>Space</Kbd> để xem đáp án
              </div>
            </div>
            {/* Back */}
            <div
              className="card-face card-back bg-surface rounded-[22px] p-7 sm:p-8 shadow-elev flex flex-col items-center cursor-pointer select-none overflow-auto"
              style={{ minHeight: 380 }}
            >
              <div className="text-[11px] font-semibold text-muted tracking-[1.5px] uppercase">
                Đáp án · <span className="jp">答え</span>
              </div>
              <BackFace entity={entity} type={current.card.entity_type} />
            </div>
          </div>
        </div>

        {/* Rating row */}
        <div className="mt-7 sm:mt-8 w-full max-w-[560px]">
          {flipped ? (
            <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
              {(
                [
                  { k: "Again", num: "1", color: "var(--danger)", label: "Quên" },
                  { k: "Hard", num: "2", color: "var(--warning)", label: "Khó" },
                  { k: "Good", num: "3", color: "var(--success)", label: "Tốt" },
                  { k: "Easy", num: "4", color: "var(--info)", label: "Dễ" },
                ] as const
              ).map((b) => {
                const interval = previews ? intervalLabel(previews[b.k].card.due) : "";
                return (
                  <button
                    key={b.k}
                    onClick={() => rate(b.k as RatingKey)}
                    className="rounded-2xl p-3.5 sm:py-4 text-white font-bold flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-transform"
                    style={{
                      background: b.color,
                      boxShadow: `0 6px 16px color-mix(in srgb, ${b.color} 50%, transparent)`,
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <kbd
                        className="px-1.5 py-px rounded text-[10px] font-bold"
                        style={{ background: "rgba(255,255,255,0.25)" }}
                      >
                        {b.num}
                      </kbd>
                      <span className="text-sm sm:text-base">{b.label}</span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] opacity-90 font-medium">{interval}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <Button variant="ink" size="xl" className="w-full py-3.5" onClick={() => setFlipped(true)}>
              Hiện đáp án (<Kbd className="!bg-white/20 text-white">Space</Kbd>)
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-alt text-muted",
        className
      )}
      style={{ fontFamily: "ui-monospace, monospace" }}
    >
      {children}
    </kbd>
  );
}

function labelForType(t: string) {
  if (t === "kanji") return "Kanji · 漢字";
  if (t === "vocab") return "Từ vựng · 単語";
  return "Ngữ pháp · 文法";
}

function getEntity(card: CardT) {
  if (card.entity_type === "kanji") return getKanjiById(card.entity_id);
  if (card.entity_type === "vocab") return getVocabById(card.entity_id);
  return getGrammarById(card.entity_id);
}

function FrontFace({ entity, type }: { entity: any; type: string }) {
  if (!entity) return null;
  const front = type === "kanji" ? entity.character : type === "vocab" ? entity.word : entity.pattern;
  const sizeClass =
    type === "grammar"
      ? "text-3xl sm:text-5xl jp"
      : "text-7xl sm:text-8xl lg:text-[120px] jp-serif";
  return (
    <div className={cn("font-semibold text-ink leading-tight text-center break-words tracking-tightest", sizeClass)}>
      {front}
    </div>
  );
}

function BackFace({ entity, type }: { entity: any; type: string }) {
  if (!entity) return null;
  if (type === "kanji") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="jp-serif text-6xl sm:text-7xl font-semibold text-ink leading-tight">
          {entity.character}
        </div>
        <div className="jp text-base text-accent mt-3 text-center">
          {entity.onyomi?.length ? `音 ${entity.onyomi.join(", ")}` : ""}
          {entity.onyomi?.length && entity.kunyomi?.length ? "  ·  " : ""}
          {entity.kunyomi?.length ? `訓 ${entity.kunyomi.join(", ")}` : ""}
        </div>
        <div className="mt-4 text-lg sm:text-xl font-medium text-ink text-center">{entity.meaning_vi}</div>
        <div className="mt-3 text-xs text-muted">{entity.stroke_count} nét</div>
      </div>
    );
  }
  if (type === "vocab") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="jp text-xl sm:text-2xl font-medium text-accent text-center">{entity.reading}</div>
        <div className="jp-serif text-5xl sm:text-6xl font-semibold text-ink mt-1.5 text-center tracking-tightest">
          {entity.word}
        </div>
        <div className="mt-4 text-lg sm:text-xl font-medium text-ink text-center">{entity.meaning_vi}</div>
        {entity.example_jp && (
          <div className="mt-5 p-4 rounded-xl bg-surface-alt w-full">
            <div className="text-[11px] text-muted mb-1.5 font-semibold tracking-wide">
              <span className="jp">例文</span> · VÍ DỤ
            </div>
            <div className="jp text-base sm:text-lg text-ink leading-relaxed">{entity.example_jp}</div>
            {entity.example_vi && (
              <div className="mt-1 text-sm text-muted leading-relaxed">{entity.example_vi}</div>
            )}
          </div>
        )}
      </div>
    );
  }
  // grammar
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full">
      <div className="jp text-2xl sm:text-3xl font-semibold text-ink text-center">{entity.pattern}</div>
      <div className="mt-3 text-base sm:text-lg font-medium text-ink text-center">{entity.meaning_vi}</div>
      <div className="mt-2 text-xs sm:text-sm text-muted text-center leading-relaxed">{entity.usage}</div>
      {entity.examples?.[0] && (
        <div className="mt-4 p-3.5 rounded-xl bg-surface-alt w-full">
          <div className="jp text-sm sm:text-base text-ink leading-relaxed">{entity.examples[0].jp}</div>
          <div className="mt-1 text-xs sm:text-sm text-muted">{entity.examples[0].vi}</div>
        </div>
      )}
    </div>
  );
}
