"use client";
import Link from "next/link";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

const QUIZ_TYPES = [
  { id: "meaning", icon: "📖", name: "Nghĩa", desc: "Chọn nghĩa tiếng Việt", jp: "意味" },
  { id: "reading", icon: "🔊", name: "Cách đọc", desc: "Chọn furigana đúng", jp: "読み" },
  { id: "typing", icon: "⌨️", name: "Gõ kanji", desc: "Từ furigana → kanji", jp: "入力" },
  { id: "grammar", icon: "📝", name: "Ngữ pháp", desc: "Điền chỗ trống", jp: "文法" },
];

const COUNTS = [10, 15, 20];

export default function QuizMenuPage() {
  const [count, setCount] = useState(10);
  return (
    <AppShell>
      <div className="p-5 sm:p-7 max-w-5xl mx-auto pb-28 lg:pb-7">
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
            <span className="jp">クイズ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1 tracking-tight">Quiz</h1>
          <p className="text-sm text-muted mt-1">Chọn loại quiz để bắt đầu</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {QUIZ_TYPES.map((t) => (
            <Link key={t.id} href={`/quiz/${t.id}/play?count=${count}`}>
              <Card className="hover:bg-surface-alt transition-colors cursor-pointer h-full">
                <CardBody className="text-center">
                  <div className="text-4xl mb-2">{t.icon}</div>
                  <div className="font-bold text-sm text-ink">{t.name}</div>
                  <div className="jp text-[10px] text-muted">{t.jp}</div>
                  <div className="text-[11px] text-muted mt-1">{t.desc}</div>
                  <div className="text-[10px] text-accent mt-2 font-bold">{count} câu</div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>

        <Card>
          <CardBody>
            <div className="text-[11px] font-semibold text-muted mb-3 uppercase tracking-wider">Cài đặt</div>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-sm text-ink">Số câu mỗi quiz</span>
              <div className="flex gap-2">
                {COUNTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCount(c)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-sm font-bold transition-colors",
                      count === c
                        ? "bg-accent text-white"
                        : "bg-surface-alt text-ink-soft hover:text-ink"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
