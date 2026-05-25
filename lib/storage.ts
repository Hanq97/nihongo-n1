import type {
  User,
  Deck,
  Card,
  UserCardState,
  QuizAttempt,
  MockTestResult,
  ReviewLog,
} from "@/types";

const KEYS = {
  users: "n1.users",
  currentUserId: "n1.currentUserId",
  decks: "n1.decks",
  cards: "n1.cards",
  userCardStates: "n1.userCardStates",
  quizAttempts: "n1.quizAttempts",
  mockResults: "n1.mockResults",
  reviewLogs: "n1.reviewLogs",
  customKanji: "n1.customKanji",
  customVocab: "n1.customVocab",
  customGrammar: "n1.customGrammar",
  bulkLoadedVersion: "n1.bulkLoadedVersion",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  // Users
  getUsers: () => read<User[]>(KEYS.users, []),
  setUsers: (users: User[]) => write(KEYS.users, users),
  getCurrentUserId: () => read<string | null>(KEYS.currentUserId, null),
  setCurrentUserId: (id: string | null) =>
    id
      ? localStorage.setItem(KEYS.currentUserId, JSON.stringify(id))
      : localStorage.removeItem(KEYS.currentUserId),

  // Decks
  getDecks: () => read<Deck[]>(KEYS.decks, []),
  setDecks: (decks: Deck[]) => write(KEYS.decks, decks),

  // Cards
  getCards: () => read<Card[]>(KEYS.cards, []),
  setCards: (cards: Card[]) => write(KEYS.cards, cards),

  // Card states
  getCardStates: () => read<UserCardState[]>(KEYS.userCardStates, []),
  setCardStates: (s: UserCardState[]) => write(KEYS.userCardStates, s),

  // Quiz attempts
  getQuizAttempts: () => read<QuizAttempt[]>(KEYS.quizAttempts, []),
  setQuizAttempts: (a: QuizAttempt[]) => write(KEYS.quizAttempts, a),

  // Mock results
  getMockResults: () => read<MockTestResult[]>(KEYS.mockResults, []),
  setMockResults: (r: MockTestResult[]) => write(KEYS.mockResults, r),

  // Review logs (for heatmap)
  getReviewLogs: () => read<ReviewLog[]>(KEYS.reviewLogs, []),
  setReviewLogs: (logs: ReviewLog[]) => write(KEYS.reviewLogs, logs),

  // Custom data (imported)
  getCustomKanji: () => read<any[]>(KEYS.customKanji, []),
  setCustomKanji: (k: any[]) => write(KEYS.customKanji, k),
  getCustomVocab: () => read<any[]>(KEYS.customVocab, []),
  setCustomVocab: (v: any[]) => write(KEYS.customVocab, v),
  getCustomGrammar: () => read<any[]>(KEYS.customGrammar, []),
  setCustomGrammar: (g: any[]) => write(KEYS.customGrammar, g),

  // Bulk data version flag (avoid re-loading every page load)
  getBulkLoadedVersion: () => read<string | null>(KEYS.bulkLoadedVersion, null),
  setBulkLoadedVersion: (v: string) => write(KEYS.bulkLoadedVersion, v),

  clearAll: () => {
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
