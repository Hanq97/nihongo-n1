"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn, uid, shuffle } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { getMockTestById } from "@/data/mock-tests";
import type { MockQuestion } from "@/data/mock-tests";

export default function MockTestPlayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { currentUser, saveMockResult, hydrate, hydrated } = useApp();
  const rawTest = getMockTestById(params.id);

  // Shuffle option order per session so the correct answer is not always first.
  const test = useMemo(() => {
    if (!rawTest) return undefined;
    const shuffledQuestions: MockQuestion[] = rawTest.questions.map((q) => {
      const correctOpt = q.options[q.correctIndex];
      const newOptions = shuffle(q.options);
      return { ...q, options: newOptions, correctIndex: newOptions.indexOf(correctOpt) };
    });
    return { ...rawTest, questions: shuffledQuestions };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawTest?.id]);

  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(test?.duration_sec ?? 0);
  const [done, setDone] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const startMs = useRef(Date.now());
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!test) return;
    setAnswers(new Array(test.questions.length).fill(null));
    setRemaining(test.duration_sec);
  }, [test]);

  useEffect(() => {
    if (done || paused) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          finalSubmit();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, paused]);

  if (!hydrated) return <div className="p-8 text-muted">Đang tải...</div>;
  if (!test) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-muted">Không tìm thấy đề thi.</p>
        <Button onClick={() => router.push("/mock-test")}>Quay lại</Button>
      </div>
    );
  }

  function setAnswer(qi: number, opt: number) {
    setAnswers((a) => {
      const n = [...a];
      n[qi] = opt;
      return n;
    });
  }

  function toggleFlag(qi: number) {
    setFlagged((s) => {
      const n = new Set(s);
      if (n.has(qi)) n.delete(qi);
      else n.add(qi);
      return n;
    });
  }

  function finalSubmit() {
    if (!currentUser || !test) return;
    const finalAnswers = answersRef.current;
    let correct = 0;
    test.questions.forEach((q, i) => {
      if (finalAnswers[i] === q.correctIndex) correct++;
    });
    const pct = Math.round((correct / test.questions.length) * 100);
    saveMockResult({
      id: uid(),
      user_id: currentUser.id,
      test_id: test.id,
      vocab_score: correct,
      reading_score: 0,
      listening_score: 0,
      total_score: pct,
      duration_sec: Math.floor((Date.now() - startMs.current) / 1000),
      wrong_card_ids: [],
      created_at: new Date().toISOString(),
    });
    setDone(true);
  }

  const q = test.questions[idx];
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const lowTime = remaining < 60;

  if (done) {
    const correct = test.questions.reduce((sum, qq, i) => sum + (answers[i] === qq.correctIndex ? 1 : 0), 0);
    const pct = Math.round((correct / test.questions.length) * 100);
    const passed = pct >= 60;
    return (
      <div className="min-h-screen p-4 sm:p-8 bg-bg">
        <div className="max-w-md mx-auto pt-4">
          <h1 className="text-2xl font-bold text-center mb-1">Kết quả Mock Test</h1>
          <p className="text-sm text-muted text-center mb-6">{test.name}</p>
          <div
            className={cn(
              "rounded-2xl p-6 text-center mb-6 text-white",
              passed ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-orange-500 to-red-500"
            )}
          >
            <div className="text-xs opacity-80 uppercase">Điểm</div>
            <div className="text-5xl font-bold my-2">
              {pct}<span className="text-2xl opacity-80">%</span>
            </div>
            <div className="inline-block bg-surface text-ink px-4 py-1 rounded-full font-bold text-sm">
              {passed ? "✓ ĐẬU" : "✗ CẦN ÔN THÊM"}
            </div>
          </div>
          <div className="bg-surface rounded-xl p-4 mb-4 border border-[color:var(--border)]">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted">Đúng</span>
              <strong>{correct} / {test.questions.length}</strong>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Thời gian</span>
              <strong>{Math.floor((Date.now() - startMs.current) / 60000)} phút</strong>
            </div>
          </div>
          <div className="bg-surface rounded-xl p-4 mb-4 border border-[color:var(--border)]">
            <div className="text-xs font-semibold text-muted mb-2 uppercase">Câu sai</div>
            <ul className="text-sm space-y-2">
              {test.questions.map((qq, i) => {
                if (answers[i] === qq.correctIndex) return null;
                return (
                  <li key={qq.id} className="border-l-2 border-danger pl-2">
                    <div className="text-ink-soft">{i + 1}. {qq.prompt}</div>
                    {qq.explanation && (
                      <div className="text-xs text-muted mt-0.5">{qq.explanation}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <Button size="xl" className="w-full" onClick={() => router.push("/dashboard")}>
            Về Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="sticky top-0 z-10 bg-surface border-b border-[color:var(--border)] px-4 sm:px-8 py-3 flex justify-between items-center gap-3">
        <div>
          <div className="text-xs text-muted">{test.name.split("—")[0].trim()}</div>
          <div className="font-bold text-ink text-sm sm:text-base">
            Câu {idx + 1}/{test.questions.length}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={cn(
              "px-3 py-2 rounded-lg border",
              lowTime ? "bg-danger/10 border-danger/30 text-danger animate-pulse" : "bg-bg border-[color:var(--border)] text-ink-soft"
            )}
          >
            <div className="text-[10px] uppercase opacity-70">Còn lại</div>
            <div className="text-base sm:text-xl font-bold">
              {mins.toString().padStart(2, "0")}:{secs.toString().padStart(2, "0")}
            </div>
          </div>
          <button
            onClick={() => setPaused((p) => !p)}
            className="border border-[color:var(--border)] px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm"
          >
            {paused ? "▶" : "⏸"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 p-4 sm:p-8 max-w-3xl mx-auto w-full">
          <div className="text-sm text-ink-soft mb-3 sm:mb-4">{q.prompt}</div>
          {q.promptJp && (
            <div className="jp text-base sm:text-lg text-ink mb-6 leading-relaxed">
              {q.promptJp.split(/【|】/).map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i} className="bg-warning/20 px-1 rounded">
                    {part}
                  </strong>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </div>
          )}

          <div className="space-y-2 mb-6">
            {q.options.map((opt, i) => {
              const isSel = answers[idx] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(idx, i)}
                  className={cn(
                    "w-full text-left border-2 rounded-xl p-3 sm:p-4 text-sm sm:text-base transition-all",
                    isSel
                      ? "border-accent bg-accent-soft font-semibold text-accent"
                      : "border-[color:var(--border)] hover:border-accent/50"
                  )}
                >
                  {i + 1}. <span className={q.section === "moji-goi" ? "jp" : ""}>{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              disabled={idx === 0}
              onClick={() => setIdx(idx - 1)}
            >
              ← Trước
            </Button>
            <button
              onClick={() => toggleFlag(idx)}
              className={cn(
                "text-sm font-semibold",
                flagged.has(idx) ? "text-warning" : "text-muted"
              )}
            >
              ⚑ {flagged.has(idx) ? "Bỏ flag" : "Flag câu này"}
            </button>
            <button
              onClick={() => setShowNav(true)}
              className="lg:hidden text-sm text-muted underline"
            >
              📋 Tất cả
            </button>
            {idx + 1 < test.questions.length ? (
              <Button onClick={() => setIdx(idx + 1)}>Sau →</Button>
            ) : (
              <Button variant="success" onClick={finalSubmit}>
                ✓ Nộp bài
              </Button>
            )}
          </div>
        </div>

        {/* Desktop nav */}
        <aside className="hidden lg:block w-64 bg-bg border-l border-[color:var(--border)] p-4 overflow-y-auto">
          <h3 className="text-xs font-bold text-ink-soft uppercase mb-3">Bảng điều hướng</h3>
          <QuestionGrid
            count={test.questions.length}
            currentIdx={idx}
            answers={answers}
            flagged={flagged}
            onJump={(i) => setIdx(i)}
          />
          <Legend answered={answers.filter((a) => a !== null).length} unanswered={answers.filter((a) => a === null).length} flagged={flagged.size} />
          <Button variant="success" className="w-full mt-4" onClick={finalSubmit}>
            Nộp bài
          </Button>
        </aside>
      </div>

      {/* Mobile bottom sheet */}
      {showNav && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowNav(false)}>
          <div
            className="bg-surface w-full rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold mb-3">Tất cả câu hỏi</h3>
            <QuestionGrid
              count={test.questions.length}
              currentIdx={idx}
              answers={answers}
              flagged={flagged}
              onJump={(i) => {
                setIdx(i);
                setShowNav(false);
              }}
            />
            <Legend answered={answers.filter((a) => a !== null).length} unanswered={answers.filter((a) => a === null).length} flagged={flagged.size} />
            <Button variant="success" className="w-full mt-4" onClick={finalSubmit}>
              Nộp bài
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionGrid({
  count,
  currentIdx,
  answers,
  flagged,
  onJump,
}: {
  count: number;
  currentIdx: number;
  answers: (number | null)[];
  flagged: Set<number>;
  onJump: (i: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5 mb-4">
      {Array.from({ length: count }, (_, i) => {
        let cls = "bg-surface border-[color:var(--border)] text-muted";
        if (i === currentIdx) cls = "bg-accent text-white border-accent";
        else if (flagged.has(i)) cls = "bg-warning/20 text-warning border-warning/50";
        else if (answers[i] !== null) cls = "bg-accent-soft text-accent border-accent";
        return (
          <button
            key={i}
            onClick={() => onJump(i)}
            className={`border-2 rounded-lg text-xs font-bold text-center py-1.5 ${cls}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

function Legend({ answered, unanswered, flagged }: { answered: number; unanswered: number; flagged: number }) {
  return (
    <div className="text-xs space-y-1">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-accent-soft border border-accent rounded" />
        <span className="text-ink-soft">Đã trả lời ({answered})</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-surface border border-[color:var(--border)] rounded" />
        <span className="text-ink-soft">Chưa làm ({unanswered})</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-warning/20 border border-warning/50 rounded" />
        <span className="text-ink-soft">Flag ({flagged})</span>
      </div>
    </div>
  );
}
