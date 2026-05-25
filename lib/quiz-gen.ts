import { getAllKanji, getAllVocab, getAllGrammar } from "@/data";
import { shuffle } from "./utils";
import type { QuizType } from "@/types";

export type QuizQuestion = {
  id: string;
  type: QuizType;
  prompt: string;
  promptJp?: string;
  promptSub?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  acceptedTypingAnswers?: string[];
  entityId?: number;
  entityType?: "kanji" | "vocab" | "grammar";
};

export function generateQuestions(type: QuizType, count: number): QuizQuestion[] {
  switch (type) {
    case "meaning":
      return generateMeaningQuiz(count);
    case "reading":
      return generateReadingQuiz(count);
    case "typing":
      return generateTypingQuiz(count);
    case "grammar":
      return generateGrammarQuiz(count);
  }
}

function generateMeaningQuiz(count: number): QuizQuestion[] {
  const vocab = getAllVocab();
  if (vocab.length < 4) return [];
  const picks = shuffle(vocab).slice(0, count);
  return picks.map((v, i) => {
    const wrong = shuffle(vocab.filter((x) => x.id !== v.id)).slice(0, 3);
    const all = shuffle([v, ...wrong]);
    return {
      id: `meaning-${i}`,
      type: "meaning",
      prompt: "Nghĩa của từ nào sau đây?",
      promptJp: v.word,
      promptSub: v.reading,
      options: all.map((x) => x.meaning_vi),
      correctIndex: all.findIndex((x) => x.id === v.id),
      explanation: `${v.word} (${v.reading}) nghĩa là "${v.meaning_vi}". ${v.example_jp ? `Ví dụ: ${v.example_jp}` : ""}`,
      entityId: v.id,
      entityType: "vocab",
    };
  });
}

function generateReadingQuiz(count: number): QuizQuestion[] {
  const vocab = getAllVocab().filter((v) => /[一-鿿]/.test(v.word));
  if (vocab.length < 4) return [];
  const picks = shuffle(vocab).slice(0, count);
  return picks.map((v, i) => {
    const wrongRaw = shuffle(vocab.filter((x) => x.id !== v.id)).slice(0, 3);
    const all = shuffle([v, ...wrongRaw]);
    return {
      id: `reading-${i}`,
      type: "reading",
      prompt: "Cách đọc đúng?",
      promptJp: v.word,
      options: all.map((x) => x.reading),
      correctIndex: all.findIndex((x) => x.id === v.id),
      explanation: `${v.word} đọc là "${v.reading}", nghĩa: ${v.meaning_vi}`,
      entityId: v.id,
      entityType: "vocab",
    };
  });
}

function generateTypingQuiz(count: number): QuizQuestion[] {
  const vocab = getAllVocab().filter((v) => /[一-鿿]/.test(v.word));
  if (vocab.length === 0) return [];
  const picks = shuffle(vocab).slice(0, count);
  return picks.map((v, i) => ({
    id: `typing-${i}`,
    type: "typing",
    prompt: "Gõ kanji tương ứng",
    promptJp: v.reading,
    promptSub: v.meaning_vi,
    options: [],
    correctIndex: 0,
    explanation: `${v.word} (${v.reading}) - ${v.meaning_vi}`,
    acceptedTypingAnswers: [v.word],
    entityId: v.id,
    entityType: "vocab",
  }));
}

function generateGrammarQuiz(count: number): QuizQuestion[] {
  const grammar = getAllGrammar();
  if (grammar.length < 4) return [];
  const picks = shuffle(grammar).slice(0, count);
  return picks.map((g, i) => {
    const wrong = shuffle(grammar.filter((x) => x.id !== g.id)).slice(0, 3);
    const all = shuffle([g, ...wrong]);
    const example = g.examples[0];
    return {
      id: `grammar-${i}`,
      type: "grammar",
      prompt: example ? `Chọn cấu trúc phù hợp với ý nghĩa: "${g.meaning_vi}"` : "Chọn cấu trúc phù hợp",
      promptJp: example?.jp.replace(g.pattern.replace(/^[～~]/, ""), "____") ?? g.meaning_vi,
      options: all.map((x) => x.pattern),
      correctIndex: all.findIndex((x) => x.id === g.id),
      explanation: `${g.pattern}: ${g.meaning_vi}. ${g.usage}`,
      entityId: g.id,
      entityType: "grammar",
    };
  });
}
