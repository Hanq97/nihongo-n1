import { getAllKanji, getAllVocab, getAllGrammar } from "@/data";
import type { Vocabulary, Grammar } from "@/types";

export type MockQuestion = {
  id: string;
  section: "moji-goi" | "bunpou";
  prompt: string;
  promptJp?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type MockTest = {
  id: string;
  name: string;
  description: string;
  duration_sec: number;
  questions: MockQuestion[];
};

// Seeded RNG — same seed → same questions across attempts so user can compare scores.
function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(n, a.length));
}

function shuffleArr<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build a Moji-Goi reading question
function makeReadingQ(v: Vocabulary, distractors: Vocabulary[], rng: () => number, idx: number): MockQuestion {
  const opts = shuffleArr([v.reading, ...distractors.slice(0, 3).map((d) => d.reading)], rng);
  return {
    id: `mg-r-${idx}`,
    section: "moji-goi",
    prompt: "「" + v.word + "」の読み方として正しいものを選びなさい。",
    promptJp: v.example_jp?.replace(v.word, "【" + v.word + "】") ?? v.word,
    options: opts,
    correctIndex: opts.indexOf(v.reading),
    explanation: `${v.word} đọc là 「${v.reading}」 — ${v.meaning_vi}`,
  };
}

// Build a Moji-Goi meaning question (Vietnamese meaning)
function makeMeaningQ(v: Vocabulary, distractors: Vocabulary[], rng: () => number, idx: number): MockQuestion {
  const opts = shuffleArr([v.meaning_vi, ...distractors.slice(0, 3).map((d) => d.meaning_vi)], rng);
  return {
    id: `mg-m-${idx}`,
    section: "moji-goi",
    prompt: "「" + v.word + "」(" + v.reading + ") の意味を選びなさい。",
    options: opts,
    correctIndex: opts.indexOf(v.meaning_vi),
    explanation: `${v.word} (${v.reading}) — ${v.meaning_vi}`,
  };
}

// Build a Bunpou (grammar) question
function makeGrammarQ(g: Grammar, distractors: Grammar[], rng: () => number, idx: number): MockQuestion {
  const ex = g.examples[0];
  const cleanPat = g.pattern.replace(/^[～~]/, "");
  const cloze = ex?.jp.includes(cleanPat) ? ex.jp.replace(cleanPat, "【＿＿＿】") : `「${g.meaning_vi}」 を表す文型は？`;
  const opts = shuffleArr([g.pattern, ...distractors.slice(0, 3).map((d) => d.pattern)], rng);
  return {
    id: `bp-${idx}`,
    section: "bunpou",
    prompt: "次の文の【＿＿＿】に入る最も適切な文型を選びなさい。",
    promptJp: cloze,
    options: opts,
    correctIndex: opts.indexOf(g.pattern),
    explanation: `${g.pattern}: ${g.meaning_vi}. ${g.usage}`,
  };
}

const TEST_TEMPLATES: { id: string; name: string; desc: string; mg: number; bp: number; mins: number }[] = [
  { id: "n1-2024-07", name: "JLPT N1 — Đề 07/2024 (mô phỏng)", desc: "Procedurally generated", mg: 25, bp: 20, mins: 70 },
  { id: "n1-2024-12", name: "JLPT N1 — Đề 12/2024 (mô phỏng)", desc: "Procedurally generated", mg: 25, bp: 20, mins: 70 },
  { id: "n1-2023-07", name: "JLPT N1 — Đề 07/2023 (mô phỏng)", desc: "Procedurally generated", mg: 25, bp: 20, mins: 70 },
  { id: "n1-2023-12", name: "JLPT N1 — Đề 12/2023 (mô phỏng)", desc: "Procedurally generated", mg: 25, bp: 20, mins: 70 },
  { id: "n1-2022-07", name: "JLPT N1 — Đề 07/2022 (mô phỏng)", desc: "Procedurally generated", mg: 25, bp: 20, mins: 70 },
  { id: "n1-2022-12", name: "JLPT N1 — Đề 12/2022 (mô phỏng)", desc: "Procedurally generated", mg: 25, bp: 20, mins: 70 },
  { id: "n1-mini-1", name: "Mini Test #1 — Tốc độ", desc: "20 câu / 15 phút", mg: 12, bp: 8, mins: 15 },
  { id: "n1-mini-2", name: "Mini Test #2 — Tốc độ", desc: "20 câu / 15 phút", mg: 12, bp: 8, mins: 15 },
  { id: "n1-mini-3", name: "Mini Test #3 — Tốc độ", desc: "20 câu / 15 phút", mg: 12, bp: 8, mins: 15 },
  { id: "n1-mini-4", name: "Mini Test #4 — Tốc độ", desc: "20 câu / 15 phút", mg: 12, bp: 8, mins: 15 },
];

function generateMockTest(template: typeof TEST_TEMPLATES[number]): MockTest {
  const rng = mulberry32(hashSeed(template.id));
  const vocab = getAllVocab();
  const grammar = getAllGrammar();

  const mgQuestions: MockQuestion[] = [];
  const usedVocab = new Set<number>();
  let mgIdx = 0;
  // Half reading, half meaning
  const halfReading = Math.ceil(template.mg / 2);
  const halfMeaning = template.mg - halfReading;
  const readingPool = vocab.filter((v) => /[一-鿿]/.test(v.word));
  const readingPick = pickN(readingPool, halfReading, rng);
  for (const v of readingPick) {
    const distractors = pickN(vocab.filter((x) => x.id !== v.id), 3, rng);
    mgQuestions.push(makeReadingQ(v, distractors, rng, mgIdx++));
    usedVocab.add(v.id);
  }
  const meaningPick = pickN(vocab.filter((v) => !usedVocab.has(v.id)), halfMeaning, rng);
  for (const v of meaningPick) {
    const distractors = pickN(vocab.filter((x) => x.id !== v.id), 3, rng);
    mgQuestions.push(makeMeaningQ(v, distractors, rng, mgIdx++));
  }

  const bpQuestions: MockQuestion[] = [];
  const gPick = pickN(grammar, template.bp, rng);
  let bpIdx = 0;
  for (const g of gPick) {
    const distractors = pickN(grammar.filter((x) => x.id !== g.id), 3, rng);
    bpQuestions.push(makeGrammarQ(g, distractors, rng, bpIdx++));
  }

  // Interleave so it doesn't feel like batched
  const allQ = shuffleArr([...mgQuestions, ...bpQuestions], rng);

  return {
    id: template.id,
    name: template.name,
    description: template.desc + ` · ${allQ.length} câu`,
    duration_sec: template.mins * 60,
    questions: allQ,
  };
}

let cache: Map<string, MockTest> | null = null;
export function listMockTests(): { id: string; name: string; description: string; duration_sec: number; questionCount: number }[] {
  return TEST_TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.desc + ` · ${t.mg + t.bp} câu`,
    duration_sec: t.mins * 60,
    questionCount: t.mg + t.bp,
  }));
}

export function getMockTestById(id: string): MockTest | undefined {
  if (!cache) cache = new Map();
  if (cache.has(id)) return cache.get(id);
  const tpl = TEST_TEMPLATES.find((t) => t.id === id);
  if (!tpl) return undefined;
  const test = generateMockTest(tpl);
  cache.set(id, test);
  return test;
}

// Force regenerate (useful when custom data is imported)
export function clearMockTestCache() {
  cache = null;
}

// Legacy export for backwards compat
export const MOCK_TESTS = TEST_TEMPLATES;
