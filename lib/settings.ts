import type { QuestionMode } from "./quizEngine";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface Settings {
  difficulty: Difficulty;
  soundOn: boolean;
  timerOn: boolean;
  questionMode: QuestionMode;
}

export const DEFAULT_SETTINGS: Settings = { difficulty: 1, soundOn: true, timerOn: false, questionMode: "mixed" };

const SETTINGS_KEY = "us-states:settings";
const bestKey = (d: Difficulty) => `us-states:best:${d}`;

const DIFFICULTIES = [1, 2, 3, 4, 5] as const;
const MODES = ["mixed", "nameIt", "findIt"] as const;

// Validate an untyped parsed blob against the allowed shape - never trust localStorage.
export function parseSettings(raw: unknown): Settings {
  if (typeof raw !== "object" || raw === null) return DEFAULT_SETTINGS;
  const o = raw as Record<string, unknown>;
  const difficulty = DIFFICULTIES.includes(o.difficulty as Difficulty) ? (o.difficulty as Difficulty) : DEFAULT_SETTINGS.difficulty;
  const questionMode = MODES.includes(o.questionMode as QuestionMode) ? (o.questionMode as QuestionMode) : DEFAULT_SETTINGS.questionMode;
  return { difficulty, soundOn: o.soundOn !== false, timerOn: o.timerOn === true, questionMode };
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? parseSettings(JSON.parse(raw)) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable */
  }
}

export function readBest(d: Difficulty): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(localStorage.getItem(bestKey(d))) || 0;
  } catch {
    return 0;
  }
}

export function writeBest(d: Difficulty, score: number): void {
  try {
    localStorage.setItem(bestKey(d), String(score));
  } catch {
    /* storage unavailable */
  }
}
