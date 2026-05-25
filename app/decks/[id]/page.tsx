"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { useApp } from "@/lib/store";
import { storage } from "@/lib/storage";
import { getKanjiById, getVocabById, getGrammarById } from "@/data";
import { cn, formatDateVi } from "@/lib/utils";
import type { Deck, Card as CardT, UserCardState } from "@/types";

type Row = {
  card: CardT;
  state: UserCardState | undefined;
  entity: any;
};

const STATE_LABEL: Record<string, { text: string; color: string }> = {
  new: { text: "Mới", color: "bg-surface-alt text-ink-soft" },
  learning: { text: "Đang học", color: "bg-warning/15 text-warning" },
  review: { text: "Đã thuộc", color: "bg-success/15 text-success" },
  relearning: { text: "Ôn lại", color: "bg-danger/15 text-danger" },
};

export default function DeckDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { currentUser, getUserDecks } = useApp();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"all" | "new" | "learning" | "review" | "due">("all");

  useEffect(() => {
    if (!currentUser) return;
    const d = getUserDecks().find((x) => x.id === params.id);
    if (!d) {
      setDeck(null);
      return;
    }
    setDeck(d);
    const allCards = storage.getCards().filter((c) => c.deck_id === d.id);
    const states = storage.getCardStates().filter((s) => s.user_id === currentUser.id);
    const stateMap = new Map(states.map((s) => [s.card_id, s]));
    const built: Row[] = allCards
      .sort((a, b) => a.position - b.position)
      .map((c) => {
        const ent =
          c.entity_type === "kanji"
            ? getKanjiById(c.entity_id)
            : c.entity_type === "vocab"
            ? getVocabById(c.entity_id)
            : getGrammarById(c.entity_id);
        return { card: c, state: stateMap.get(c.id), entity: ent };
      });
    setRows(built);
  }, [currentUser, params.id, getUserDecks]);

  if (!currentUser) return <AppShell>{null}</AppShell>;
  if (!deck) {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <p className="text-muted mb-4">Không tìm thấy deck.</p>
          <Button onClick={() => router.push("/decks")}>← Quay lại</Button>
        </div>
      </AppShell>
    );
  }

  const counts = {
    total: rows.length,
    new: rows.filter((r) => !r.state || r.state.state === "new").length,
    learning: rows.filter((r) => r.state?.state === "learning" || r.state?.state === "relearning").length,
    review: rows.filter((r) => r.state?.state === "review").length,
    due: rows.filter((r) => r.state && new Date(r.state.due) <= new Date()).length,
  };

  const filtered = rows.filter((r) => {
    if (filter === "all") return true;
    if (filter === "due") return r.state && new Date(r.state.due) <= new Date();
    const s = r.state?.state ?? "new";
    if (filter === "learning") return s === "learning" || s === "relearning";
    return s === filter;
  });

  const typeLabel = { kanji: "Kanji", vocab: "Từ vựng", grammar: "Ngữ pháp", mixed: "Hỗn hợp" }[deck.type];

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <Link href="/decks" className="text-sm text-muted hover:text-ink-soft mb-4 inline-block">
          ← Tất cả decks
        </Link>

        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-accent-soft text-accent rounded-2xl flex items-center justify-center jp font-bold text-xl flex-shrink-0">
                  {{ kanji: "漢", vocab: "詞", grammar: "文", mixed: "混" }[deck.type]}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-ink">{deck.name}</h1>
                  <p className="text-sm text-muted mt-0.5">{deck.description}</p>
                  <div className="text-xs text-muted mt-1">
                    {typeLabel} · {counts.total} thẻ · Tạo {formatDateVi(deck.created_at)}
                  </div>
                </div>
              </div>
              {counts.due > 0 && deck.type !== "mixed" && (
                <Link href={`/learn/${deck.type}`}>
                  <Button size="lg">▶ Học {counts.due} thẻ đáo hạn</Button>
                </Link>
              )}
              {counts.due > 0 && deck.type === "mixed" && (
                <Link href={`/learn/all`}>
                  <Button size="lg">▶ Học {counts.due} thẻ đáo hạn</Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <Stat label="Mới" value={counts.new} color="text-ink-soft" />
              <Stat label="Đang học" value={counts.learning} color="text-warning" />
              <Stat label="Đã thuộc" value={counts.review} color="text-success" />
              <Stat label="Cần ôn" value={counts.due} color="text-accent" />
            </div>
            <div className="mt-4">
              <Progress value={counts.review} max={Math.max(counts.total, 1)} />
              <div className="text-xs text-muted mt-1 text-right">
                {Math.round((counts.review / Math.max(counts.total, 1)) * 100)}% đã thuộc
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-2 mb-4 overflow-x-auto -mx-1 px-1 pb-1">
          {[
            { id: "all", label: `Tất cả (${counts.total})` },
            { id: "due", label: `Cần ôn (${counts.due})` },
            { id: "new", label: `Mới (${counts.new})` },
            { id: "learning", label: `Đang học (${counts.learning})` },
            { id: "review", label: `Đã thuộc (${counts.review})` },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                filter === f.id
                  ? "bg-accent text-white"
                  : "bg-surface-alt text-ink-soft hover:text-ink"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <Card>
              <CardBody className="text-center text-muted text-sm">
                Không có thẻ trong nhóm này.
              </CardBody>
            </Card>
          )}
          {filtered.map((r) => (
            <CardRow key={r.card.id} row={r} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center bg-surface-alt rounded-xl p-3">
      <div className={cn("text-2xl font-extrabold tabular-nums", color)}>{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}

function CardRow({ row }: { row: Row }) {
  const [expanded, setExpanded] = useState(false);
  const { card, state, entity } = row;
  if (!entity) return null;
  const stateKey = state?.state ?? "new";
  const meta = STATE_LABEL[stateKey];
  const due = state ? new Date(state.due) : null;
  const dueText = due
    ? due <= new Date()
      ? "Đáo hạn"
      : `Còn ${Math.max(1, Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} ngày`
    : "Chưa học";

  const front = card.entity_type === "kanji" ? entity.character : card.entity_type === "vocab" ? entity.word : entity.pattern;
  const sub = card.entity_type === "vocab" ? entity.reading : card.entity_type === "kanji" ? `${(entity.onyomi ?? []).join(", ")}${entity.onyomi?.length && entity.kunyomi?.length ? " / " : ""}${(entity.kunyomi ?? []).join(", ")}` : "";

  return (
    <Card>
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left"
      >
        <CardBody className="flex items-center gap-4">
          <div className="jp text-2xl font-bold text-ink min-w-[64px]">{front}</div>
          <div className="flex-1 min-w-0">
            {sub && <div className="jp text-xs text-muted truncate">{sub}</div>}
            <div className="text-sm text-ink-soft truncate">{entity.meaning_vi}</div>
          </div>
          <div className="text-right flex flex-col items-end gap-1 flex-shrink-0">
            <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", meta.color)}>
              {meta.text}
            </span>
            <span className="text-[10px] text-muted">{dueText}</span>
          </div>
          <span className={cn("text-muted text-xs transition-transform", expanded && "rotate-90")}>▶</span>
        </CardBody>
      </button>
      {expanded && (
        <div className="px-5 pb-4 -mt-2 text-sm space-y-2 border-t border-[color:var(--border)] pt-3">
          {card.entity_type === "kanji" && (
            <>
              <RowItem label="Âm On" value={(entity.onyomi ?? []).join(", ") || "—"} jp />
              <RowItem label="Âm Kun" value={(entity.kunyomi ?? []).join(", ") || "—"} jp />
              <RowItem label="Số nét" value={String(entity.stroke_count)} />
            </>
          )}
          {card.entity_type === "vocab" && (
            <>
              <RowItem label="Cách đọc" value={entity.reading} jp />
              {entity.part_of_speech && <RowItem label="Loại từ" value={entity.part_of_speech} />}
              {entity.example_jp && (
                <div>
                  <div className="text-xs text-muted mb-0.5">Ví dụ</div>
                  <div className="jp text-ink bg-bg rounded-lg p-2">{entity.example_jp}</div>
                  {entity.example_vi && <div className="text-xs text-muted italic mt-1">{entity.example_vi}</div>}
                </div>
              )}
            </>
          )}
          {card.entity_type === "grammar" && (
            <>
              <RowItem label="Ý nghĩa" value={entity.meaning_vi} />
              <div>
                <div className="text-xs text-muted mb-0.5">Cách dùng</div>
                <div className="text-ink-soft text-xs leading-relaxed">{entity.usage}</div>
              </div>
              {entity.examples?.length > 0 && (
                <div>
                  <div className="text-xs text-muted mb-1">Ví dụ</div>
                  {entity.examples.map((ex: any, i: number) => (
                    <div key={i} className="bg-bg rounded-lg p-2 mb-1">
                      <div className="jp text-ink">{ex.jp}</div>
                      <div className="text-xs text-muted italic mt-0.5">{ex.vi}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {state && (
            <div className="text-[11px] text-muted pt-2 border-t border-[color:var(--border)] grid grid-cols-2 gap-1">
              <span>Trạng thái: {meta.text}</span>
              <span>Reps: {state.reps} · Lapses: {state.lapses}</span>
              <span>Stability: {state.stability.toFixed(2)}</span>
              <span>Difficulty: {state.difficulty.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function RowItem({ label, value, jp }: { label: string; value: string; jp?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs text-muted min-w-[80px]">{label}</span>
      <span className={cn("text-ink-soft", jp && "jp")}>{value}</span>
    </div>
  );
}
