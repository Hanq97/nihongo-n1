import { SEED_KANJI } from "./kanji";
import { SEED_VOCAB } from "./vocabulary";
import { SEED_GRAMMAR } from "./grammar";
import { storage } from "@/lib/storage";
import type { Kanji, Vocabulary, Grammar } from "@/types";

export function getAllKanji(): Kanji[] {
  return [...SEED_KANJI, ...(storage.getCustomKanji() as Kanji[])];
}
export function getAllVocab(): Vocabulary[] {
  return [...SEED_VOCAB, ...(storage.getCustomVocab() as Vocabulary[])];
}
export function getAllGrammar(): Grammar[] {
  return [...SEED_GRAMMAR, ...(storage.getCustomGrammar() as Grammar[])];
}

export function getKanjiById(id: number): Kanji | undefined {
  return getAllKanji().find((k) => k.id === id);
}
export function getVocabById(id: number): Vocabulary | undefined {
  return getAllVocab().find((v) => v.id === id);
}
export function getGrammarById(id: number): Grammar | undefined {
  return getAllGrammar().find((g) => g.id === id);
}

export { SEED_KANJI, SEED_VOCAB, SEED_GRAMMAR };
