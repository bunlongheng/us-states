import type { StateData } from "./states";
import { shuffle, getOptions } from "./quiz.ts";

// The quiz as an explicit state machine. All transitions are pure functions of
// (state, action) so the whole game loop is unit-testable without a DOM. The only
// non-determinism is question ordering / option selection (shuffle + getOptions +
// the mixed coin-flip), which the reducer delegates to lib/quiz.ts; every score,
// phase, reveal, and missed-tracking transition below is deterministic.

export type QuizType = "nameIt" | "findIt";
export type QuestionMode = "mixed" | "nameIt" | "findIt";
export type Phase = "asking" | "revealing" | "done";

export interface QuizState {
  mode: QuestionMode;
  pool: StateData[];
  queue: StateData[];
  current: StateData | null;
  quizType: QuizType;
  options: StateData[];
  score: { correct: number; total: number };
  phase: Phase;
  wrongId: string | null;
  revealId: string | null; // the correct state, highlighted during "revealing"
  missed: StateData[];
  verdict: string | null; // human text for the aria-live region + sidebar
  total: number; // questions in this run
}

export type QuizAction =
  | { type: "START"; pool: StateData[]; mode: QuestionMode }
  | { type: "ANSWER"; choice: StateData }
  | { type: "TIMEOUT" }
  | { type: "ADVANCE" };

function pickType(mode: QuestionMode): QuizType {
  if (mode === "mixed") return Math.random() < 0.5 ? "nameIt" : "findIt";
  return mode;
}

// Load the next question from a queue, or transition to "done" when it is empty.
function loadFrom(queue: StateData[], state: QuizState): QuizState {
  if (queue.length === 0) {
    return { ...state, phase: "done", current: null, quizType: state.quizType, options: [], wrongId: null, revealId: null, verdict: null };
  }
  const [next, ...rest] = queue;
  const quizType = pickType(state.mode);
  return {
    ...state,
    queue: rest,
    current: next,
    quizType,
    options: quizType === "nameIt" ? getOptions(next, state.pool) : [],
    phase: "asking",
    wrongId: null,
    revealId: null,
    verdict: null,
  };
}

export function initQuiz(pool: StateData[], mode: QuestionMode): QuizState {
  const base: QuizState = {
    mode,
    pool,
    queue: [],
    current: null,
    quizType: "nameIt",
    options: [],
    score: { correct: 0, total: 0 },
    phase: "asking",
    wrongId: null,
    revealId: null,
    missed: [],
    verdict: null,
    total: pool.length,
  };
  return loadFrom(shuffle(pool), base);
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "START":
      return initQuiz(action.pool, action.mode);

    case "ANSWER": {
      if (state.phase !== "asking" || !state.current) return state;
      const correct = action.choice.id === state.current.id;
      if (correct) {
        const nextCorrect = state.score.correct + 1;
        return {
          ...state,
          phase: "revealing",
          score: { correct: nextCorrect, total: state.score.total + 1 },
          wrongId: null,
          revealId: state.current.id,
          verdict: `Correct! ${nextCorrect} of ${state.total}`,
        };
      }
      return {
        ...state,
        phase: "revealing",
        score: { ...state.score, total: state.score.total + 1 },
        wrongId: action.choice.id,
        revealId: state.current.id, // reveal the real answer so the user learns it
        missed: [...state.missed, state.current],
        verdict: `Not quite - that was ${state.current.name}`,
      };
    }

    case "TIMEOUT": {
      if (state.phase !== "asking" || !state.current) return state;
      return {
        ...state,
        phase: "revealing",
        score: { ...state.score, total: state.score.total + 1 },
        wrongId: null,
        revealId: state.current.id,
        missed: [...state.missed, state.current],
        verdict: `Time's up - that was ${state.current.name}`,
      };
    }

    case "ADVANCE": {
      if (state.phase !== "revealing") return state;
      return loadFrom(state.queue, state);
    }

    default:
      return state;
  }
}
