"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/lib/store";
import { storage } from "@/lib/storage";
import { listMockTests } from "@/data/mock-tests";

export default function MockTestListPage() {
  const { currentUser } = useApp();
  const [best, setBest] = useState<Record<string, number>>({});
  const tests = listMockTests();

  useEffect(() => {
    if (!currentUser) return;
    const results = storage.getMockResults().filter((r) => r.user_id === currentUser.id);
    const b: Record<string, number> = {};
    for (const r of results) {
      if (!b[r.test_id] || r.total_score > b[r.test_id]) b[r.test_id] = r.total_score;
    }
    setBest(b);
  }, [currentUser]);

  const fullTests = tests.filter((t) => !t.id.includes("mini"));
  const miniTests = tests.filter((t) => t.id.includes("mini"));

  return (
    <AppShell>
      <div className="p-5 sm:p-7 max-w-5xl mx-auto pb-28 lg:pb-7">
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
            <span className="jp">模試</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1 tracking-tight">Mock Test</h1>
          <p className="text-sm text-muted mt-1">10 đề thi mô phỏng N1 — sinh tự động, deterministic để so điểm.</p>
        </div>

        <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">📝 Full test (~45 câu)</h2>
        <div className="space-y-3 mb-6">
          {fullTests.map((t) => (
            <TestRow key={t.id} t={t} best={best[t.id]} />
          ))}
        </div>

        <h2 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">⚡ Mini test (20 câu, 15 phút)</h2>
        <div className="space-y-3">
          {miniTests.map((t) => (
            <TestRow key={t.id} t={t} best={best[t.id]} />
          ))}
        </div>

        <div className="mt-8 text-xs text-muted leading-relaxed">
          <p>
            ℹ️ Mỗi đề có cùng câu hỏi qua các lần làm (deterministic theo seed). Câu sinh từ corpus
            N1 (vocab + grammar). Choukai (nghe) chưa có vì cần audio.
          </p>
          <p className="mt-2">
            Muốn đề khó/đa dạng hơn?{" "}
            <Link href="/decks" className="text-accent underline">
              Import thêm vocab/grammar JSON
            </Link>{" "}
            — đề sẽ tự dùng pool lớn hơn.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function TestRow({ t, best }: { t: ReturnType<typeof listMockTests>[number]; best?: number }) {
  return (
    <Card>
      <CardBody>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-bold text-ink truncate">{t.name}</div>
            <div className="text-xs text-muted mt-1">{t.description}</div>
            <div className="text-xs text-muted mt-0.5">
              ⏱ {Math.round(t.duration_sec / 60)} phút · {t.questionCount} câu
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {best !== undefined && (
              <div className="text-right">
                <div className="text-[11px] text-muted">Điểm cao</div>
                <div className="text-lg font-extrabold text-accent tabular-nums">{best}%</div>
              </div>
            )}
            <Link href={`/mock-test/${t.id}`}>
              <Button>Bắt đầu</Button>
            </Link>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
