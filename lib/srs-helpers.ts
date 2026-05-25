import { storage } from "./storage";
import type { Card, UserCardState, ReviewLog } from "@/types";

export function getDueCards(
  userId: string,
  limit?: number,
  typeFilter?: "kanji" | "vocab" | "grammar"
) {
  const now = new Date();
  const states = storage.getCardStates().filter((s) => s.user_id === userId);
  const cards = storage.getCards();
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  const dueStates = states
    .filter((s) => new Date(s.due) <= now)
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  const result: { card: Card; state: UserCardState }[] = [];
  for (const s of dueStates) {
    const c = cardMap.get(s.card_id);
    if (!c) continue;
    if (typeFilter && c.entity_type !== typeFilter) continue;
    result.push({ card: c, state: s });
    if (limit && result.length >= limit) break;
  }
  return result;
}

export function getDueCountsByType(userId: string) {
  const now = new Date();
  const states = storage.getCardStates().filter((s) => s.user_id === userId);
  const cards = storage.getCards();
  const cardMap = new Map(cards.map((c) => [c.id, c]));
  const counts = { kanji: 0, vocab: 0, grammar: 0 };
  for (const s of states) {
    if (new Date(s.due) > now) continue;
    const c = cardMap.get(s.card_id);
    if (!c) continue;
    if (c.entity_type === "kanji") counts.kanji++;
    else if (c.entity_type === "vocab") counts.vocab++;
    else if (c.entity_type === "grammar") counts.grammar++;
  }
  return counts;
}

export function getNewCards(userId: string, limit: number) {
  const states = storage.getCardStates().filter((s) => s.user_id === userId && s.state === "new");
  const cards = storage.getCards();
  const cardMap = new Map(cards.map((c) => [c.id, c]));
  return states
    .slice(0, limit)
    .map((s) => ({ card: cardMap.get(s.card_id)!, state: s }))
    .filter((x) => x.card);
}

export function getStreak(userId: string): number {
  const logs = storage.getReviewLogs().filter((l) => l.user_id === userId);
  if (logs.length === 0) return 0;
  const days = new Set<string>();
  logs.forEach((l) => {
    const d = new Date(l.reviewed_at);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  });
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (days.has(k)) streak++;
    else if (i > 0) break; // missing today is OK; missing prior day breaks
  }
  return streak;
}

export function getProgressByType(userId: string) {
  const states = storage.getCardStates().filter((s) => s.user_id === userId);
  const cards = storage.getCards();
  const cardMap = new Map(cards.map((c) => [c.id, c]));

  const counts = { kanji: { learned: 0, total: 0 }, vocab: { learned: 0, total: 0 }, grammar: { learned: 0, total: 0 } };
  for (const s of states) {
    const c = cardMap.get(s.card_id);
    if (!c) continue;
    counts[c.entity_type].total++;
    if (s.state !== "new") counts[c.entity_type].learned++;
  }
  return counts;
}
