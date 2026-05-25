"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { cn, daysBetween } from "@/lib/utils";

const GOALS = [
  { value: 10, label: "10 thẻ", desc: "Nhẹ nhàng · 5 phút/ngày" },
  { value: 20, label: "20 thẻ", desc: "Cân bằng · 15 phút/ngày", recommended: true },
  { value: 30, label: "30 thẻ", desc: "Tích cực · 25 phút/ngày" },
  { value: 50, label: "50 thẻ", desc: "Hardcore · 40 phút/ngày" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { hydrate, hydrated, currentUser, updateUser, ensureSeedDecks } = useApp();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().slice(0, 10);
  });
  const [goal, setGoal] = useState(20);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (hydrated && !currentUser) router.replace("/login");
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center text-muted">Đang tải...</div>;
  }

  const remaining = daysBetween(new Date(), new Date(date));

  function finish() {
    updateUser({ target_exam_date: date, daily_goal: goal, onboarded: true });
    ensureSeedDecks(currentUser!.id);
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-8 relative overflow-hidden">
      <div
        className="absolute left-[-100px] bottom-[-150px] jp-serif font-bold leading-none pointer-events-none select-none"
        style={{ fontSize: 400, color: "var(--accent-soft)" }}
      >
        始
      </div>
      <div className="w-full max-w-md relative">
        <div className="flex gap-1.5 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-colors",
                step >= i ? "bg-accent" : "bg-surface-alt"
              )}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="bg-surface rounded-3xl shadow-elev p-8">
            <div className="text-5xl text-center mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-center mb-2 text-ink tracking-tight">
              Bạn dự định thi N1 khi nào?
            </h2>
            <p className="text-sm text-muted text-center mb-6">Chúng tôi sẽ tính lộ trình phù hợp</p>
            <div className="border-2 border-accent rounded-2xl p-4 mb-3 bg-accent-soft">
              <label className="text-[11px] text-muted block mb-1 uppercase tracking-wider font-semibold">Ngày thi</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-lg font-bold text-ink w-full outline-none bg-transparent"
              />
            </div>
            <p className="text-center text-sm text-muted mb-6">
              Còn <strong className="text-accent">{remaining} ngày</strong> để ôn thi
            </p>
            <Button size="xl" className="w-full" onClick={() => setStep(2)}>
              Tiếp tục →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-surface rounded-3xl shadow-elev p-8">
            <div className="text-5xl text-center mb-4">📚</div>
            <h2 className="text-xl font-bold text-center mb-6 text-ink tracking-tight">
              Mỗi ngày học bao nhiêu thẻ?
            </h2>
            <div className="space-y-2.5 mb-6">
              {GOALS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={cn(
                    "w-full text-left rounded-2xl p-4 transition-all border-2",
                    goal === g.value ? "border-accent bg-accent-soft" : "border-[color:var(--border)] bg-surface hover:border-muted"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("font-bold text-ink", goal === g.value && "text-accent")}>{g.label}</span>
                    {g.recommended && (
                      <span className="text-[10px] uppercase tracking-wider font-bold text-accent">⭐ Khuyến nghị</span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5">{g.desc}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="xl" className="flex-1" onClick={() => setStep(1)}>
                ← Quay lại
              </Button>
              <Button size="xl" className="flex-1" onClick={() => setStep(3)}>
                Tiếp tục →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-surface rounded-3xl shadow-elev p-8">
            <div className="text-5xl text-center mb-4">🎴</div>
            <h2 className="text-xl font-bold text-center mb-3 text-ink tracking-tight">
              Sẵn sàng bắt đầu!
            </h2>
            <p className="text-sm text-muted text-center mb-6">
              Hệ thống sẽ tạo sẵn cho bạn 3 deck mặc định: Kanji, Vocab, Grammar
            </p>
            <div className="bg-surface-alt rounded-2xl p-4 mb-6 text-sm">
              <Row label="Ngày thi" value={new Date(date).toLocaleDateString("vi-VN")} />
              <Row label="Còn lại" value={`${remaining} ngày`} />
              <Row label="Mục tiêu" value={`${goal} thẻ/ngày`} />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="xl" className="flex-1" onClick={() => setStep(2)}>
                ← Quay lại
              </Button>
              <Button size="xl" className="flex-1" onClick={finish}>
                Bắt đầu học!
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-ink-soft">
      <span>{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
