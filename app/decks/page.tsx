"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/lib/store";
import { storage } from "@/lib/storage";
import type { Deck } from "@/types";

export default function DecksPage() {
  const { currentUser, getUserDecks, importData, lastSync } = useApp();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [importMsg, setImportMsg] = useState<{ text: string; type: "ok" | "err" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Re-fetch when lastSync changes (bulk loader finished async)
  useEffect(() => {
    if (currentUser) setDecks(getUserDecks());
  }, [currentUser, getUserDecks, lastSync]);

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const res = importData({
          kanji: Array.isArray(data.kanji) ? data.kanji : undefined,
          vocabulary: Array.isArray(data.vocabulary) ? data.vocabulary : undefined,
          grammar: Array.isArray(data.grammar) ? data.grammar : undefined,
        });
        const total = res.counts.kanji + res.counts.vocab + res.counts.grammar;
        if (total === 0) {
          setImportMsg({ type: "err", text: "Không có mục mới (toàn bộ ID đã tồn tại)." });
        } else {
          setImportMsg({
            type: "ok",
            text: `✓ Đã import ${res.counts.kanji} kanji, ${res.counts.vocab} vocab, ${res.counts.grammar} grammar. Tạo ${res.decks.length} deck mới.`,
          });
          // Refresh deck list
          if (currentUser) setDecks(getUserDecks());
        }
      } catch (err: any) {
        setImportMsg({ type: "err", text: `✗ Lỗi: ${err.message}` });
      }
      if (fileRef.current) fileRef.current.value = "";
    };
    reader.readAsText(file);
  }

  const stats = (deck: Deck) => {
    const cards = storage.getCards().filter((c) => c.deck_id === deck.id);
    const states = storage.getCardStates().filter(
      (s) => s.user_id === currentUser?.id && cards.find((c) => c.id === s.card_id)
    );
    const due = states.filter((s) => new Date(s.due) <= new Date()).length;
    const reviewed = states.filter((s) => s.state !== "new").length;
    return { total: cards.length, due, reviewed };
  };

  return (
    <AppShell>
      <div className="p-5 sm:p-7 max-w-5xl mx-auto pb-28 lg:pb-7">
        <div className="flex justify-between items-start mb-6 gap-3 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">
              <span className="jp">デッキ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mt-1 tracking-tight">Decks</h1>
            <p className="text-sm text-muted mt-1">Quản lý bộ thẻ học của bạn</p>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="application/json" onChange={handleImport} className="hidden" />
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              📥 Import JSON
            </Button>
          </div>
        </div>

        {importMsg && (
          <div
            className={`mb-4 border text-sm rounded-xl p-3 ${
              importMsg.type === "ok"
                ? "bg-accent-soft border-accent/30 text-accent"
                : "bg-danger/10 border-danger/30 text-danger"
            }`}
          >
            {importMsg.text}
          </div>
        )}

        <details className="mb-6 bg-surface border border-[color:var(--border)] rounded-2xl p-4 text-sm">
          <summary className="font-semibold text-ink">📋 Định dạng file JSON</summary>
          <pre className="mt-3 text-xs bg-surface-alt p-3 rounded-lg overflow-auto text-ink-soft">{`{
  "kanji": [{ "id": 100, "character": "学", "onyomi": ["ガク"], "kunyomi": ["まな-ぶ"],
              "meaning_vi": "học", "stroke_count": 8, "jlpt_level": 5 }],
  "vocabulary": [{ "id": 100, "word": "学校", "reading": "がっこう",
                   "meaning_vi": "trường học", "jlpt_level": 5 }],
  "grammar": [{ "id": 100, "pattern": "～について", "meaning_vi": "về việc ~",
                "usage": "...", "examples": [{ "jp": "...", "vi": "..." }] }]
}`}</pre>
        </details>

        <div className="space-y-3">
          {decks.length === 0 && (
            <Card>
              <CardBody className="text-center text-muted">
                Chưa có deck nào. Hoàn tất onboarding để tạo deck mặc định.
              </CardBody>
            </Card>
          )}
          {decks.map((d) => {
            const s = stats(d);
            const typeIcon = { kanji: "漢", vocab: "単", grammar: "文", mixed: "混" }[d.type];
            return (
              <Link key={d.id} href={`/decks/${d.id}`} className="block">
                <Card className="hover:bg-surface-alt transition-colors cursor-pointer">
                  <CardBody>
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center jp-serif font-semibold text-xl flex-shrink-0 text-white"
                        style={{ background: "linear-gradient(135deg, var(--accent), #8B5CF6)" }}
                      >
                        {typeIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-ink">{d.name}</div>
                        <div className="text-xs text-muted mt-0.5">{d.description}</div>
                        <div className="flex gap-3 mt-2 text-xs flex-wrap">
                          <span className="text-ink-soft">📦 {s.total} thẻ</span>
                          <span className="text-accent font-bold">⏰ {s.due} cần ôn</span>
                          <span className="text-success">✓ {s.reviewed} đã học</span>
                        </div>
                      </div>
                      <span className="text-muted text-lg">›</span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
