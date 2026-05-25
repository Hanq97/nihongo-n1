"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Icons } from "@/components/ui/Icon";
import { useApp } from "@/lib/store";
import { generateQuestions, type QuizQuestion } from "@/lib/quiz-gen";
import { uid, cn } from "@/lib/utils";
import type { QuizType } from "@/types";

export default function QuizPlayPage() {
  const router = useRouter();
  const params = useParams<{ type: string }>();
  const search = useSearchParams();
  const { currentUser, hydrate, hydrated, saveQuizAttempt } = useApp();
  const count = parseInt(search.get("count") ?? "10", 10);
  const type = params.type as QuizType;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [typingValue, setTypingValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [wrong, setWrong] = useState<QuizQuestion[]>([]);
  const [startMs, setStartMs] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    const qs = generateQuestions(type, count);
    if (qs.length === 0) {
      router.replace("/quiz");
      return;
    }
    setQuestions(qs);
    setStartMs(Date.now());
  }, [hydrated, currentUser, type, count, router]);

  const q = questions[idx];

  function submit() {
    if (!q || !currentUser) return;
    let correct = false;
    if (q.type === "typing") {
      correct = (q.acceptedTypingAnswers ?? []).some(
        (a) => a.trim().toLowerCase() === typingValue.trim().toLowerCase()
      );
    } else {
      correct = selected === q.correctIndex;
    }
    if (correct) setScore((s) => s + 1);
    else setWrong((w) => [...w, q]);

    saveQuizAttempt({
      id: uid(),
      user_id: currentUser.id,
      card_id: `${q.entityType}-${q.entityId}`,
      quiz_type: q.type,
      is_correct: correct,
      response_ms: Date.now() - startMs,
      created_at: new Date().toISOString(),
    });
    setSubmitted(true);
  }

  function next() {
    if (idx + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIdx(idx + 1);
    setSelected(null);
    setTypingValue("");
    setSubmitted(false);
    setStartMs(Date.now());
  }

  if (!q) {
    return <div className="min-h-screen flex items-center justify-center text-muted">Đang tải quiz...</div>;
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen p-5 sm:p-8 bg-bg">
        <div className="max-w-md mx-auto pt-4">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{pct >= 80 ? "🎉" : pct >= 50 ? "💪" : "📚"}</div>
            <h2 className="text-2xl font-bold text-ink tracking-tight">Quiz hoàn thành!</h2>
          </div>
          <div
            className="rounded-3xl p-7 text-center text-white mb-4 relative overflow-hidden"
            style={{
              background: "linear-gradient(120deg, var(--accent), #6366F1)",
              boxShadow: "0 14px 40px rgba(124,92,255,0.3)",
            }}
          >
            <div className="text-xs opacity-85 uppercase tracking-wider font-semibold">Điểm số</div>
            <div className="text-6xl font-extrabold my-2 tabular-nums tracking-tightest">
              {score}/{questions.length}
            </div>
            <div className="text-sm opacity-90 font-medium">
              {pct}% chính xác — {pct >= 80 ? "Tốt lắm!" : pct >= 50 ? "Cố lên!" : "Ôn thêm nhé"}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Card>
              <CardBody className="p-3 text-center">
                <div className="text-3xl font-extrabold text-success tabular-nums">{score}</div>
                <div className="text-[11px] text-muted mt-0.5">Đúng</div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-3 text-center">
                <div className="text-3xl font-extrabold text-danger tabular-nums">{wrong.length}</div>
                <div className="text-[11px] text-muted mt-0.5">Sai</div>
              </CardBody>
            </Card>
          </div>
          {wrong.length > 0 && (
            <Card className="mb-4">
              <CardBody>
                <div className="text-[11px] font-semibold text-muted mb-2 uppercase tracking-wider">
                  Câu sai ({wrong.length})
                </div>
                <ul className="space-y-1.5 text-sm">
                  {wrong.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-danger">⚠️</span>
                      <span>
                        <span className="jp text-ink">{w.promptJp}</span>{" "}
                        <span className="text-xs text-muted">
                          — {w.type === "typing" ? w.acceptedTypingAnswers?.join("/") : w.options[w.correctIndex]}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}
          <Button size="xl" className="w-full mb-2" onClick={() => location.reload()}>
            Làm tiếp {questions.length} câu
          </Button>
          <Button variant="secondary" size="xl" className="w-full" onClick={() => router.push("/dashboard")}>
            Về Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-5 sm:p-7 bg-bg">
      <div className="max-w-md sm:max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6 gap-3 pt-2">
          <button
            onClick={() => router.push("/quiz")}
            className="w-8 h-8 rounded-lg bg-surface-alt text-muted flex items-center justify-center hover:text-ink"
          >
            <Icons.Close />
          </button>
          <Progress value={idx + 1} max={questions.length} className="flex-1" size="md" />
          <span className="text-sm font-bold text-ink tabular-nums">
            {idx + 1}/{questions.length}
          </span>
        </div>

        <div className="text-xs text-muted mb-3">{q.prompt}</div>

        <Card className="mb-6">
          <CardBody className="p-7 text-center">
            {q.promptJp && (
              <div className="jp-serif text-3xl sm:text-5xl font-semibold text-ink tracking-tightest">
                {q.promptJp}
              </div>
            )}
            {q.promptSub && <div className="jp text-sm text-muted mt-2">{q.promptSub}</div>}
          </CardBody>
        </Card>

        {q.type === "typing" ? (
          <div className="space-y-3">
            <Input
              value={typingValue}
              onChange={(e) => setTypingValue(e.target.value)}
              placeholder="Gõ kanji..."
              className="jp text-lg"
              disabled={submitted}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!submitted) submit();
                  else next();
                }
              }}
            />
            {submitted && (
              <div
                className={cn(
                  "border rounded-xl p-3 text-sm",
                  q.acceptedTypingAnswers?.includes(typingValue.trim())
                    ? "bg-success/10 border-success/30 text-success"
                    : "bg-danger/10 border-danger/30 text-danger"
                )}
              >
                {q.acceptedTypingAnswers?.includes(typingValue.trim()) ? "✓ Chính xác!" : "✗ Sai rồi"} — Đáp án:{" "}
                <strong className="jp">{q.acceptedTypingAnswers?.[0]}</strong>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctIndex;
              const isSelected = i === selected;
              let cls = "border-[color:var(--border)] bg-surface hover:bg-surface-alt";
              if (submitted) {
                if (isCorrect) cls = "border-success bg-success/10 text-success";
                else if (isSelected) cls = "border-danger bg-danger/10 text-danger";
              } else if (isSelected) {
                cls = "border-accent bg-accent-soft text-accent";
              }
              return (
                <button
                  key={i}
                  disabled={submitted}
                  onClick={() => setSelected(i)}
                  className={cn(
                    "w-full text-left border-2 rounded-2xl p-4 text-sm transition-all flex justify-between items-center font-medium",
                    cls
                  )}
                >
                  <span className={q.type === "reading" ? "jp" : ""}>
                    {String.fromCharCode(65 + i)}. {opt}
                  </span>
                  {submitted && isCorrect && <span>✓</span>}
                  {submitted && !isCorrect && isSelected && <span>✗</span>}
                </button>
              );
            })}
          </div>
        )}

        {submitted && (
          <div className="mt-4 bg-accent-soft border border-accent/30 rounded-xl p-3 text-xs">
            <strong className="text-accent">Giải thích:</strong>{" "}
            <span className="text-ink-soft">{q.explanation}</span>
          </div>
        )}

        <div className="mt-6">
          {!submitted ? (
            <Button
              size="xl"
              className="w-full"
              disabled={q.type !== "typing" && selected === null}
              onClick={submit}
            >
              Kiểm tra
            </Button>
          ) : (
            <Button size="xl" className="w-full" onClick={next}>
              {idx + 1 >= questions.length ? "Xem kết quả →" : "Câu tiếp theo →"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
