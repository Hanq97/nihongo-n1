import { storage } from "./storage";
import type { Kanji, Vocabulary, Grammar } from "@/types";

// Bump this when you change /public/data/*.json so clients re-load.
export const BULK_VERSION = "v2";

// Chunks to fetch — add more here when adding /public/data/n1-X-bulk-N.json files
const KANJI_CHUNKS = ["/data/n1-kanji-bulk.json", "/data/n1-kanji-bulk-2.json"];
const VOCAB_CHUNKS = ["/data/n1-vocab-bulk.json", "/data/n1-vocab-bulk-2.json"];
const GRAMMAR_CHUNKS = ["/data/n1-grammar-bulk.json", "/data/n1-grammar-bulk-2.json"];

async function fetchJSON<T>(url: string): Promise<T[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      // 404 for missing chunk → silently empty
      if (res.status === 404) return [];
      throw new Error(`${url}: ${res.status}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? (data as T[]) : [];
  } catch (e) {
    console.warn(`[bulk] failed to load ${url}:`, e);
    return [];
  }
}

async function fetchAll<T>(urls: string[]): Promise<T[]> {
  const chunks = await Promise.all(urls.map((u) => fetchJSON<T>(u)));
  // De-dup by id when merging chunks
  const seen = new Set<number>();
  const merged: T[] = [];
  for (const chunk of chunks) {
    for (const item of chunk) {
      const id = (item as any).id;
      if (seen.has(id)) continue;
      seen.add(id);
      merged.push(item);
    }
  }
  return merged;
}

export type BulkLoadResult = {
  freshKanji: Kanji[];
  freshVocab: Vocabulary[];
  freshGrammar: Grammar[];
};

export async function loadBulkData(force = false): Promise<BulkLoadResult | null> {
  if (typeof window === "undefined") return null;
  const loaded = storage.getBulkLoadedVersion();
  console.log(`[bulk] localStorage version=${loaded}, code version=${BULK_VERSION}, force=${force}`);
  if (!force && loaded === BULK_VERSION) {
    console.log(`[bulk] already loaded ${BULK_VERSION}, skipping`);
    return null;
  }

  console.log(`[bulk] fetching chunks...`);
  const [kanji, vocab, grammar] = await Promise.all([
    fetchAll<Kanji>(KANJI_CHUNKS),
    fetchAll<Vocabulary>(VOCAB_CHUNKS),
    fetchAll<Grammar>(GRAMMAR_CHUNKS),
  ]);
  console.log(`[bulk] fetched: ${kanji.length} kanji, ${vocab.length} vocab, ${grammar.length} grammar`);

  const result: BulkLoadResult = { freshKanji: [], freshVocab: [], freshGrammar: [] };

  if (kanji.length) {
    const existing = storage.getCustomKanji() as Kanji[];
    const existingIds = new Set(existing.map((x) => x.id));
    result.freshKanji = kanji.filter((x) => !existingIds.has(x.id));
    storage.setCustomKanji([...existing, ...result.freshKanji]);
  }
  if (vocab.length) {
    const existing = storage.getCustomVocab() as Vocabulary[];
    const existingIds = new Set(existing.map((x) => x.id));
    result.freshVocab = vocab.filter((x) => !existingIds.has(x.id));
    storage.setCustomVocab([...existing, ...result.freshVocab]);
  }
  if (grammar.length) {
    const existing = storage.getCustomGrammar() as Grammar[];
    const existingIds = new Set(existing.map((x) => x.id));
    result.freshGrammar = grammar.filter((x) => !existingIds.has(x.id));
    storage.setCustomGrammar([...existing, ...result.freshGrammar]);
  }

  console.log(
    `[bulk] fresh items added: ${result.freshKanji.length} kanji, ${result.freshVocab.length} vocab, ${result.freshGrammar.length} grammar`
  );

  if (kanji.length > 0 || vocab.length > 0 || grammar.length > 0) {
    storage.setBulkLoadedVersion(BULK_VERSION);
  }
  return result;
}
