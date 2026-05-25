#!/usr/bin/env node
/*
  Fetch public N1 datasets and merge into a single JSON file for import.
  Sources (all open licenses):
    - jlpt-vocab GitHub: https://github.com/elzup/jlpt-word-list (MIT)
    - jlpt-resources: https://github.com/wkostelecki/jlpt-resources (open)
    - KANJIDIC subset

  This produces ./n1-full.json that you can import via Decks → Import JSON.

  Run:  node scripts/fetch-n1-data.mjs

  Note: Vietnamese translations are NOT in these datasets. The fetched JSON
  will use English meanings as a placeholder in `meaning_vi`. To add real
  Vietnamese translations, run them through a translation API (or by hand)
  before importing.
*/

import { writeFileSync } from "node:fs";

const N1_VOCAB_URL =
  "https://raw.githubusercontent.com/elzup/jlpt-word-list/master/src/n1.json";

async function fetchN1Vocab() {
  console.log("→ Fetching N1 vocab from elzup/jlpt-word-list...");
  const res = await fetch(N1_VOCAB_URL);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const raw = await res.json();
  // The dataset shape: array of { word, furigana, romaji, mean }
  return raw.map((v, i) => ({
    id: 10000 + i, // offset to avoid colliding with seed IDs
    word: v.word ?? v.kanji ?? "",
    reading: v.furigana ?? v.kana ?? "",
    meaning_vi: v.mean ?? v.meaning ?? "", // English placeholder
    jlpt_level: 1,
  })).filter((v) => v.word && v.reading);
}

(async () => {
  const out = { kanji: [], vocabulary: [], grammar: [] };
  try {
    out.vocabulary = await fetchN1Vocab();
    console.log(`  ✓ ${out.vocabulary.length} vocab entries`);
  } catch (e) {
    console.error("  ✗ Vocab fetch failed:", e.message);
  }

  // For full kanji + grammar, the user needs to source separately:
  console.log("");
  console.log("ℹ️  Kanji and grammar full datasets are not bundled here.");
  console.log("   Recommended sources:");
  console.log("   - Kanji: kanjiapi.dev (free API) or KANJIDIC2");
  console.log("   - Grammar: nihongonomori, JLPT Sensei (manual curation)");
  console.log("");

  writeFileSync("./n1-full.json", JSON.stringify(out, null, 2));
  console.log(`✓ Written ./n1-full.json (${out.vocabulary.length} vocab)`);
  console.log("");
  console.log("Next:");
  console.log("  1. Open the app → Decks → Import JSON");
  console.log("  2. Select ./n1-full.json");
  console.log("  3. New decks auto-created for the user");
  console.log("");
  console.log("⚠️  Meanings are in English — translate to Vietnamese before serious study.");
})();
