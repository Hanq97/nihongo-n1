export type User = {
  id: string;
  email: string;
  display_name: string;
  password_hash: string;
  target_exam_date: string;
  daily_goal: number;
  created_at: string;
  onboarded: boolean;
};

export type Kanji = {
  id: number;
  character: string;
  onyomi: string[];
  kunyomi: string[];
  meaning_vi: string;
  meaning_en?: string;
  stroke_count: number;
  jlpt_level: number;
};

export type Vocabulary = {
  id: number;
  word: string;
  reading: string;
  meaning_vi: string;
  part_of_speech?: string;
  example_jp?: string;
  example_vi?: string;
  jlpt_level: number;
};

export type Grammar = {
  id: number;
  pattern: string;
  meaning_vi: string;
  usage: string;
  examples: { jp: string; vi: string }[];
  category?: string;
};

export type EntityType = "kanji" | "vocab" | "grammar";

export type Deck = {
  id: string;
  user_id: string | null;
  name: string;
  type: "kanji" | "vocab" | "grammar" | "mixed";
  description?: string;
  card_ids: string[];
  created_at: string;
};

export type Card = {
  id: string;
  deck_id: string;
  entity_type: EntityType;
  entity_id: number;
  position: number;
};

export type SrsState = "new" | "learning" | "review" | "relearning";

export type UserCardState = {
  user_id: string;
  card_id: string;
  due: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  state: SrsState;
  last_review: string | null;
  elapsed_days: number;
  scheduled_days: number;
};

export type QuizType = "meaning" | "reading" | "typing" | "grammar";

export type QuizAttempt = {
  id: string;
  user_id: string;
  card_id: string;
  quiz_type: QuizType;
  is_correct: boolean;
  response_ms: number;
  created_at: string;
};

export type MockTestResult = {
  id: string;
  user_id: string;
  test_id: string;
  vocab_score: number;
  reading_score: number;
  listening_score: number;
  total_score: number;
  duration_sec: number;
  wrong_card_ids: string[];
  created_at: string;
};

export type ReviewLog = {
  id: string;
  user_id: string;
  card_id: string;
  rating: 1 | 2 | 3 | 4;
  state_before: SrsState;
  state_after: SrsState;
  reviewed_at: string;
};
