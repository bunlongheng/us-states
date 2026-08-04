import type { StateData } from "./states";
import { shuffle, getOptions } from "./quiz.ts";

// The quiz as an explicit, fully PURE state machine. All randomness (question order,
// per-question type, multiple-choice options) is resolved once in initQuiz - a factory
// that accepts an injectable rng - so quizReducer itself is a pure function of
// (state, action): every score, phase, reveal, and missed transition is deterministic
// and each is unit-tested.

export type QuizType = "nameIt" | "findIt";
export type QuestionMode = "mixed" | "nameIt" | "findIt";
export type Phase = "asking" | "revealing" | "done";

export interface Question {
  state: StateData;
  quizType: QuizType;
  options: StateData[]; // 4 choices for nameIt, empty for findIt
}

export interface QuizState {
  mode: QuestionMode;
  queue: Question[]; // upcoming, excluding current
  current: Question | null;
  score: { correct: number; total: number };
  phase: Phase;
  wrongId: string | null;
  revealId: string | null; // the correct state, highlighted during "revealing"
  lastCorrect: boolean | null; // was the last answer correct - drives verdict styling (not the copy)
  missed: StateData[];
  verdict: string | null; // human text for the aria-live region + sidebar
  total: number; // questions in this run
}

export type QuizAction =
  | { type: "ANSWER"; choice: StateData }
  | { type: "TIMEOUT" }
  | { type: "ADVANCE" }
  | { type: "RESET"; state: QuizState }; // carries a state pre-built by initQuiz (keeps rng out of the reducer)

export interface InitOptions {
  distractors?: StateData[]; // pool the wrong nameIt options are drawn from (defaults to the question pool)
  rng?: () => number;
}

function pickType(mode: QuestionMode, rng: () => number): QuizType {
  if (mode === "mixed") return rng() < 0.5 ? "nameIt" : "findIt";
  return mode;
}

export function initQuiz(pool: StateData[], mode: QuestionMode, opts: InitOptions = {}): QuizState {
  const rng = opts.rng ?? Math.random;
  const distractors = opts.distractors ?? pool;
  const questions: Question[] = shuffle(pool, rng).map((state) => {
    const quizType = pickType(mode, rng);
    return { state, quizType, options: quizType === "nameIt" ? getOptions(state, distractors, rng) : [] };
  });
  return {
    mode,
    queue: questions.slice(1),
    current: questions[0] ?? null,
    score: { correct: 0, total: 0 },
    phase: questions.length > 0 ? "asking" : "done",
    wrongId: null,
    revealId: null,
    lastCorrect: null,
    missed: [],
    verdict: null,
    total: pool.length,
  };
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "RESET":
      return action.state;

    case "ANSWER": {
      if (state.phase !== "asking" || !state.current) return state;
      const answer = state.current.state;
      const correct = action.choice.id === answer.id;
      if (correct) {
        const nextCorrect = state.score.correct + 1;
        return {
          ...state,
          phase: "revealing",
          score: { correct: nextCorrect, total: state.score.total + 1 },
          wrongId: null,
          revealId: answer.id,
          lastCorrect: true,
          verdict: `Correct! ${nextCorrect} of ${state.total}`,
        };
      }
      return {
        ...state,
        phase: "revealing",
        score: { ...state.score, total: state.score.total + 1 },
        wrongId: action.choice.id,
        revealId: answer.id, // reveal the real answer so the user learns it
        lastCorrect: false,
        missed: [...state.missed, answer],
        verdict: `Not quite - that was ${answer.name}`,
      };
    }

    case "TIMEOUT": {
      if (state.phase !== "asking" || !state.current) return state;
      const answer = state.current.state;
      return {
        ...state,
        phase: "revealing",
        score: { ...state.score, total: state.score.total + 1 },
        wrongId: null,
        revealId: answer.id,
        lastCorrect: false,
        missed: [...state.missed, answer],
        verdict: `Time's up - that was ${answer.name}`,
      };
    }

    case "ADVANCE": {
      if (state.phase !== "revealing") return state;
      const [next, ...rest] = state.queue;
      return {
        ...state,
        queue: rest,
        current: next ?? null,
        phase: next ? "asking" : "done",
        wrongId: null,
        revealId: null,
        lastCorrect: null,
        verdict: null,
      };
    }

    default:
      return state;
  }
}
