import {
  fsrs,
  generatorParameters,
  Rating,
  createEmptyCard,
  State,
  type Card as FsrsCard,
} from "ts-fsrs";
import type { UserCardState, SrsState } from "@/types";

const params = generatorParameters({ enable_fuzz: true, maximum_interval: 36500 });
const scheduler = fsrs(params);

const stateMap: Record<number, SrsState> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
};
const reverseStateMap: Record<SrsState, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
};

export function emptyState(userId: string, cardId: string): UserCardState {
  const c = createEmptyCard(new Date());
  return {
    user_id: userId,
    card_id: cardId,
    due: c.due.toISOString(),
    stability: c.stability,
    difficulty: c.difficulty,
    reps: c.reps,
    lapses: c.lapses,
    state: "new",
    last_review: null,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
  };
}

function toFsrsCard(s: UserCardState): FsrsCard {
  return {
    due: new Date(s.due),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: s.elapsed_days,
    scheduled_days: s.scheduled_days,
    reps: s.reps,
    lapses: s.lapses,
    state: reverseStateMap[s.state],
    last_review: s.last_review ? new Date(s.last_review) : undefined,
  } as FsrsCard;
}

function fromFsrsCard(userId: string, cardId: string, fc: FsrsCard): UserCardState {
  return {
    user_id: userId,
    card_id: cardId,
    due: fc.due.toISOString(),
    stability: fc.stability,
    difficulty: fc.difficulty,
    elapsed_days: fc.elapsed_days,
    scheduled_days: fc.scheduled_days,
    reps: fc.reps,
    lapses: fc.lapses,
    state: stateMap[fc.state],
    last_review: fc.last_review ? fc.last_review.toISOString() : null,
  };
}

export const RATINGS = {
  Again: Rating.Again,
  Hard: Rating.Hard,
  Good: Rating.Good,
  Easy: Rating.Easy,
} as const;

export type RatingKey = keyof typeof RATINGS;

export function preview(state: UserCardState, now = new Date()) {
  const fc = toFsrsCard(state);
  const sched = scheduler.repeat(fc, now);
  return {
    Again: sched[Rating.Again],
    Hard: sched[Rating.Hard],
    Good: sched[Rating.Good],
    Easy: sched[Rating.Easy],
  };
}

export function applyRating(
  state: UserCardState,
  rating: RatingKey,
  now = new Date()
): UserCardState {
  const fc = toFsrsCard(state);
  const sched = scheduler.repeat(fc, now);
  const newCard = sched[RATINGS[rating]].card;
  return fromFsrsCard(state.user_id, state.card_id, newCard);
}

export function intervalLabel(target: Date, now = new Date()): string {
  const diffMs = target.getTime() - now.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "<1m";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.round(months / 12)}y`;
}
