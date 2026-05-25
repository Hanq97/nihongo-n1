"use client";
import { create } from "zustand";
import type {
  User,
  Deck,
  Card,
  UserCardState,
  QuizAttempt,
  MockTestResult,
  ReviewLog,
  Kanji,
  Vocabulary,
  Grammar,
} from "@/types";
import { storage } from "./storage";
import { uid, simpleHash } from "./utils";
import { emptyState } from "./fsrs";
import { SEED_KANJI, SEED_VOCAB, SEED_GRAMMAR } from "@/data";
import { clearMockTestCache } from "@/data/mock-tests";
import { loadBulkData } from "./bulk-loader";

type AppState = {
  hydrated: boolean;
  currentUser: User | null;
  lastSync: { kanji: number; vocab: number; grammar: number } | null;

  hydrate: () => void;
  syncSeedData: (userId: string) => { kanji: number; vocab: number; grammar: number };
  clearLastSync: () => void;
  forceReloadBulk: () => Promise<{ kanji: number; vocab: number; grammar: number }>;

  // Auth
  register: (email: string, password: string, displayName: string) => User | { error: string };
  login: (email: string, password: string) => User | { error: string };
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;

  // Data accessors
  getDecks: () => Deck[];
  getUserDecks: () => Deck[];
  getCardsForDeck: (deckId: string) => Card[];
  getCardState: (cardId: string) => UserCardState | undefined;

  // Seeding
  ensureSeedDecks: (userId: string) => void;

  // Card review
  saveCardState: (s: UserCardState) => void;
  logReview: (log: ReviewLog) => void;

  // Quiz
  saveQuizAttempt: (a: QuizAttempt) => void;

  // Mock
  saveMockResult: (r: MockTestResult) => void;

  // Import
  importData: (data: { kanji?: Kanji[]; vocabulary?: Vocabulary[]; grammar?: Grammar[] }) => {
    counts: { kanji: number; vocab: number; grammar: number };
    decks: string[];
  };

  // Add a deck containing the given entities for the current user (no-op if no user)
  addUserDeck: (
    name: string,
    type: "kanji" | "vocab" | "grammar",
    items: Array<{ id: number }>
  ) => void;
};

export const useApp = create<AppState>((set, get) => ({
  hydrated: false,
  currentUser: null,
  lastSync: null,

  hydrate: () => {
    const id = storage.getCurrentUserId();
    const users = storage.getUsers();
    const u = users.find((x) => x.id === id) ?? null;
    set({ hydrated: true, currentUser: u });

    // Run async: bulk load -> sync seed + create extended decks -> setLastSync
    if (u && u.onboarded) {
      (async () => {
        const bulk = await loadBulkData();
        const seedSync = get().syncSeedData(u.id);

        // Create "Extended" decks per type for the newly-loaded bulk items
        const bulkAdded = { kanji: 0, vocab: 0, grammar: 0 };
        if (bulk) {
          if (bulk.freshKanji.length > 0) {
            get().addUserDeck(`Kanji N1 - Extended`, "kanji", bulk.freshKanji);
            bulkAdded.kanji = bulk.freshKanji.length;
          }
          if (bulk.freshVocab.length > 0) {
            get().addUserDeck(`Vocab N1 - Extended`, "vocab", bulk.freshVocab);
            bulkAdded.vocab = bulk.freshVocab.length;
          }
          if (bulk.freshGrammar.length > 0) {
            get().addUserDeck(`Grammar N1 - Extended`, "grammar", bulk.freshGrammar);
            bulkAdded.grammar = bulk.freshGrammar.length;
          }
        }

        const total =
          bulkAdded.kanji + bulkAdded.vocab + bulkAdded.grammar +
          seedSync.kanji + seedSync.vocab + seedSync.grammar;
        if (total > 0) {
          set({
            lastSync: {
              kanji: bulkAdded.kanji + seedSync.kanji,
              vocab: bulkAdded.vocab + seedSync.vocab,
              grammar: bulkAdded.grammar + seedSync.grammar,
            },
          });
          clearMockTestCache();
        }
      })();
    }
  },

  clearLastSync: () => set({ lastSync: null }),

  forceReloadBulk: async () => {
    const u = get().currentUser;
    if (!u) return { kanji: 0, vocab: 0, grammar: 0 };
    const bulk = await loadBulkData(true); // force = bypass version check
    const added = { kanji: 0, vocab: 0, grammar: 0 };
    if (bulk) {
      if (bulk.freshKanji.length > 0) {
        get().addUserDeck("Kanji N1 - Extended", "kanji", bulk.freshKanji);
        added.kanji = bulk.freshKanji.length;
      }
      if (bulk.freshVocab.length > 0) {
        get().addUserDeck("Vocab N1 - Extended", "vocab", bulk.freshVocab);
        added.vocab = bulk.freshVocab.length;
      }
      if (bulk.freshGrammar.length > 0) {
        get().addUserDeck("Grammar N1 - Extended", "grammar", bulk.freshGrammar);
        added.grammar = bulk.freshGrammar.length;
      }
    }
    clearMockTestCache();
    // Trigger reactive re-fetch by updating lastSync (even if 0)
    set({ lastSync: added.kanji + added.vocab + added.grammar > 0 ? added : null });
    return added;
  },

  addUserDeck: (name, type, items) => {
    const u = get().currentUser;
    if (!u || items.length === 0) return;
    const decks = storage.getDecks();
    const cards = storage.getCards();
    const states = storage.getCardStates();
    const nowIso = new Date().toISOString();

    let deck = decks.find((d) => d.user_id === u.id && d.name === name);
    if (deck) {
      // Additive: append only NEW entity_ids to existing deck of same name
      const existingEntityIds = new Set(
        cards.filter((c) => c.deck_id === deck!.id && c.entity_type === type).map((c) => c.entity_id)
      );
      const missing = items.filter((it) => !existingEntityIds.has(it.id));
      if (missing.length === 0) return;
      missing.forEach((it, i) => {
        const cId = uid();
        const pos = deck!.card_ids.length + i;
        cards.push({ id: cId, deck_id: deck!.id, entity_type: type, entity_id: it.id, position: pos });
        states.push(emptyState(u.id, cId));
        deck!.card_ids.push(cId);
      });
      // Update description to reflect new size
      deck.description = `${deck.card_ids.length} thẻ`;
    } else {
      const deckId = uid();
      const cardIds: string[] = [];
      items.forEach((it, i) => {
        const cId = uid();
        cards.push({ id: cId, deck_id: deckId, entity_type: type, entity_id: it.id, position: i });
        states.push(emptyState(u.id, cId));
        cardIds.push(cId);
      });
      decks.push({
        id: deckId,
        user_id: u.id,
        name,
        type,
        description: `${items.length} thẻ`,
        card_ids: cardIds,
        created_at: nowIso,
      });
    }
    storage.setDecks(decks);
    storage.setCards(cards);
    storage.setCardStates(states);
  },

  syncSeedData: (userId) => {
    const decks = storage.getDecks();
    const cards = storage.getCards();
    const states = storage.getCardStates();
    const added = { kanji: 0, vocab: 0, grammar: 0 };
    let changed = false;
    const nowIso = new Date().toISOString();

    function sync<T extends { id: number }>(
      type: "kanji" | "vocab" | "grammar",
      seed: T[],
      defaultName: string,
      defaultDesc: string
    ) {
      let deck = decks.find((d) => d.user_id === userId && d.type === type);
      if (!deck) {
        deck = {
          id: uid(),
          user_id: userId,
          name: defaultName,
          type,
          description: defaultDesc,
          card_ids: [],
          created_at: nowIso,
        };
        decks.push(deck);
        changed = true;
      }
      const existingEntityIds = new Set(
        cards.filter((c) => c.deck_id === deck!.id && c.entity_type === type).map((c) => c.entity_id)
      );
      const missing = seed.filter((s) => !existingEntityIds.has(s.id));
      missing.forEach((s, i) => {
        const cId = uid();
        const pos = deck!.card_ids.length + i;
        cards.push({ id: cId, deck_id: deck!.id, entity_type: type, entity_id: s.id, position: pos });
        states.push(emptyState(userId, cId));
        deck!.card_ids.push(cId);
      });
      if (missing.length > 0) {
        added[type] = missing.length;
        changed = true;
      }
    }

    sync("kanji", SEED_KANJI, "Kanji N1 - Core", `${SEED_KANJI.length} kanji N1 cơ bản`);
    sync("vocab", SEED_VOCAB, "Mimikara N1 - Vocab", `${SEED_VOCAB.length} từ vựng N1 trọng tâm`);
    sync("grammar", SEED_GRAMMAR, "Shinkanzen N1 - Bunpou", `${SEED_GRAMMAR.length} mẫu ngữ pháp N1`);

    if (changed) {
      storage.setDecks(decks);
      storage.setCards(cards);
      storage.setCardStates(states);
    }
    return added;
  },

  register: (email, password, displayName) => {
    const users = storage.getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: "Email đã được sử dụng" };
    }
    const user: User = {
      id: uid(),
      email,
      display_name: displayName || email.split("@")[0],
      password_hash: simpleHash(password),
      target_exam_date: "",
      daily_goal: 20,
      created_at: new Date().toISOString(),
      onboarded: false,
    };
    storage.setUsers([...users, user]);
    storage.setCurrentUserId(user.id);
    set({ currentUser: user });
    return user;
  },

  login: (email, password) => {
    const users = storage.getUsers();
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return { error: "Email không tồn tại" };
    if (u.password_hash !== simpleHash(password))
      return { error: "Mật khẩu không đúng" };
    storage.setCurrentUserId(u.id);
    let syncResult: { kanji: number; vocab: number; grammar: number } | null = null;
    if (u.onboarded) {
      syncResult = get().syncSeedData(u.id);
      if (syncResult.kanji + syncResult.vocab + syncResult.grammar === 0) syncResult = null;
    }
    set({ currentUser: u, lastSync: syncResult });
    return u;
  },

  logout: () => {
    storage.setCurrentUserId(null);
    set({ currentUser: null });
  },

  updateUser: (patch) => {
    const u = get().currentUser;
    if (!u) return;
    const updated = { ...u, ...patch };
    const users = storage.getUsers().map((x) => (x.id === u.id ? updated : x));
    storage.setUsers(users);
    set({ currentUser: updated });
  },

  getDecks: () => storage.getDecks(),
  getUserDecks: () => {
    const u = get().currentUser;
    if (!u) return [];
    return storage.getDecks().filter((d) => d.user_id === u.id || d.user_id === null);
  },
  getCardsForDeck: (deckId) =>
    storage.getCards().filter((c) => c.deck_id === deckId).sort((a, b) => a.position - b.position),
  getCardState: (cardId) => {
    const u = get().currentUser;
    if (!u) return undefined;
    return storage.getCardStates().find((s) => s.card_id === cardId && s.user_id === u.id);
  },

  ensureSeedDecks: (userId) => {
    const existing = storage.getDecks().filter((d) => d.user_id === userId);
    if (existing.length > 0) return;

    const decks: Deck[] = [];
    const cards: Card[] = [];
    const cardStates: UserCardState[] = [];

    // Kanji deck
    const kanjiDeckId = uid();
    decks.push({
      id: kanjiDeckId,
      user_id: userId,
      name: "Kanji N1 - Core",
      type: "kanji",
      description: `${SEED_KANJI.length} kanji N1 cơ bản`,
      card_ids: [],
      created_at: new Date().toISOString(),
    });
    SEED_KANJI.forEach((k, i) => {
      const cId = uid();
      cards.push({ id: cId, deck_id: kanjiDeckId, entity_type: "kanji", entity_id: k.id, position: i });
      cardStates.push(emptyState(userId, cId));
      decks[0].card_ids.push(cId);
    });

    // Vocab deck
    const vocabDeckId = uid();
    decks.push({
      id: vocabDeckId,
      user_id: userId,
      name: "Mimikara N1 - Vocab",
      type: "vocab",
      description: `${SEED_VOCAB.length} từ vựng N1 trọng tâm`,
      card_ids: [],
      created_at: new Date().toISOString(),
    });
    SEED_VOCAB.forEach((v, i) => {
      const cId = uid();
      cards.push({ id: cId, deck_id: vocabDeckId, entity_type: "vocab", entity_id: v.id, position: i });
      cardStates.push(emptyState(userId, cId));
      decks[1].card_ids.push(cId);
    });

    // Grammar deck
    const grammarDeckId = uid();
    decks.push({
      id: grammarDeckId,
      user_id: userId,
      name: "Shinkanzen N1 - Bunpou",
      type: "grammar",
      description: `${SEED_GRAMMAR.length} mẫu ngữ pháp N1`,
      card_ids: [],
      created_at: new Date().toISOString(),
    });
    SEED_GRAMMAR.forEach((g, i) => {
      const cId = uid();
      cards.push({ id: cId, deck_id: grammarDeckId, entity_type: "grammar", entity_id: g.id, position: i });
      cardStates.push(emptyState(userId, cId));
      decks[2].card_ids.push(cId);
    });

    storage.setDecks([...storage.getDecks(), ...decks]);
    storage.setCards([...storage.getCards(), ...cards]);
    storage.setCardStates([...storage.getCardStates(), ...cardStates]);
  },

  saveCardState: (s) => {
    const all = storage.getCardStates();
    const idx = all.findIndex((x) => x.user_id === s.user_id && x.card_id === s.card_id);
    if (idx >= 0) all[idx] = s;
    else all.push(s);
    storage.setCardStates(all);
  },

  logReview: (log) => {
    storage.setReviewLogs([...storage.getReviewLogs(), log]);
  },

  saveQuizAttempt: (a) => {
    storage.setQuizAttempts([...storage.getQuizAttempts(), a]);
  },

  saveMockResult: (r) => {
    storage.setMockResults([...storage.getMockResults(), r]);
  },

  importData: (data) => {
    const u = get().currentUser;
    const counts = { kanji: 0, vocab: 0, grammar: 0 };
    const newDecks: string[] = [];

    // Append to custom storage (de-duplicate by id). Track newly added items.
    let freshKanji: Kanji[] = [];
    let freshVocab: Vocabulary[] = [];
    let freshGrammar: Grammar[] = [];

    if (data.kanji?.length) {
      const existing = storage.getCustomKanji() as Kanji[];
      const usedIds = new Set([...SEED_KANJI.map((x) => x.id), ...existing.map((x) => x.id)]);
      freshKanji = data.kanji.filter((x) => !usedIds.has(x.id));
      storage.setCustomKanji([...existing, ...freshKanji]);
      counts.kanji = freshKanji.length;
    }
    if (data.vocabulary?.length) {
      const existing = storage.getCustomVocab() as Vocabulary[];
      const usedIds = new Set([...SEED_VOCAB.map((x) => x.id), ...existing.map((x) => x.id)]);
      freshVocab = data.vocabulary.filter((x) => !usedIds.has(x.id));
      storage.setCustomVocab([...existing, ...freshVocab]);
      counts.vocab = freshVocab.length;
    }
    if (data.grammar?.length) {
      const existing = storage.getCustomGrammar() as Grammar[];
      const usedIds = new Set([...SEED_GRAMMAR.map((x) => x.id), ...existing.map((x) => x.id)]);
      freshGrammar = data.grammar.filter((x) => !usedIds.has(x.id));
      storage.setCustomGrammar([...existing, ...freshGrammar]);
      counts.grammar = freshGrammar.length;
    }

    // Auto-seed deck for the current user with only the newly added content
    if (u) {
      const user = u;
      const allDecks = storage.getDecks();
      const allCards = storage.getCards();
      const allStates = storage.getCardStates();
      const nowIso = new Date().toISOString();

      function appendDeck(name: string, type: "kanji" | "vocab" | "grammar", items: Array<{ id: number }>) {
        if (items.length === 0) return;
        const deckId = uid();
        const cardIds: string[] = [];
        items.forEach((it, i) => {
          const cId = uid();
          allCards.push({ id: cId, deck_id: deckId, entity_type: type, entity_id: it.id, position: i });
          allStates.push(emptyState(user.id, cId));
          cardIds.push(cId);
        });
        allDecks.push({
          id: deckId,
          user_id: user.id,
          name,
          type,
          description: `Import ${nowIso.slice(0, 10)} — ${items.length} thẻ`,
          card_ids: cardIds,
          created_at: nowIso,
        });
        newDecks.push(name);
      }

      appendDeck(`Kanji (import ${nowIso.slice(0, 10)})`, "kanji", freshKanji);
      appendDeck(`Vocab (import ${nowIso.slice(0, 10)})`, "vocab", freshVocab);
      appendDeck(`Grammar (import ${nowIso.slice(0, 10)})`, "grammar", freshGrammar);

      storage.setDecks(allDecks);
      storage.setCards(allCards);
      storage.setCardStates(allStates);
    }

    // Mock tests cache stale because pool changed
    clearMockTestCache();

    return { counts, decks: newDecks };
  },
}));
