import { test } from "node:test";
import assert from "node:assert/strict";
import { STATES, type StateData } from "../lib/states.ts";
import { initQuiz, quizReducer, type QuizState } from "../lib/quizEngine.ts";

const pool = (n: number): StateData[] => STATES.slice(0, n);
const other = (s: QuizState): StateData => STATES.find((x) => x.id !== s.current!.state.id)!;

// A deterministic rng: cycles through the given values, so tests can pin randomness.
function seq(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

function playAllCorrect(states: StateData[]): QuizState {
  let s = initQuiz(states, "nameIt");
  for (let i = 0; i < states.length; i++) {
    assert.equal(s.phase, "asking");
    s = quizReducer(s, { type: "ANSWER", choice: s.current!.state });
    assert.equal(s.phase, "revealing");
    s = quizReducer(s, { type: "ADVANCE" });
  }
  return s;
}

test("initQuiz seeds a run: total, first question, queue size, options", () => {
  const s = initQuiz(pool(10), "nameIt");
  assert.equal(s.total, 10);
  assert.equal(s.phase, "asking");
  assert.ok(s.current, "a first question is loaded");
  assert.equal(s.queue.length, 9);
  assert.equal(s.score.correct, 0);
  assert.equal(s.current!.quizType, "nameIt");
  assert.equal(s.current!.options.length, 4);
});

test("correct answer scores, reveals, and moves to revealing", () => {
  const s0 = initQuiz(pool(5), "nameIt");
  const s1 = quizReducer(s0, { type: "ANSWER", choice: s0.current!.state });
  assert.equal(s1.phase, "revealing");
  assert.equal(s1.score.correct, 1);
  assert.equal(s1.score.total, 1);
  assert.equal(s1.revealId, s0.current!.state.id);
  assert.equal(s1.wrongId, null);
  assert.equal(s1.missed.length, 0);
  assert.match(s1.verdict ?? "", /Correct/);
});

test("wrong answer counts total only, reveals the right answer, records a miss", () => {
  const s0 = initQuiz(pool(5), "nameIt");
  const wrong = other(s0);
  const s1 = quizReducer(s0, { type: "ANSWER", choice: wrong });
  assert.equal(s1.score.correct, 0);
  assert.equal(s1.score.total, 1);
  assert.equal(s1.wrongId, wrong.id);
  assert.equal(s1.revealId, s0.current!.state.id, "the correct answer is revealed");
  assert.deepEqual(s1.missed.map((m) => m.id), [s0.current!.state.id]);
});

test("a second ANSWER during revealing is ignored (no double-scoring)", () => {
  const s0 = initQuiz(pool(5), "nameIt");
  const s1 = quizReducer(s0, { type: "ANSWER", choice: s0.current!.state });
  const s2 = quizReducer(s1, { type: "ANSWER", choice: s0.current!.state });
  assert.equal(s2, s1, "reducer returns the same state reference");
  assert.equal(s2.score.total, 1);
});

test("TIMEOUT counts as one wrong, reveals the answer, cannot double-fire", () => {
  const s0 = initQuiz(pool(5), "findIt");
  const s1 = quizReducer(s0, { type: "TIMEOUT" });
  assert.equal(s1.phase, "revealing");
  assert.equal(s1.score.total, 1);
  assert.equal(s1.score.correct, 0);
  assert.equal(s1.revealId, s0.current!.state.id);
  assert.equal(s1.missed.length, 1);
  const s2 = quizReducer(s1, { type: "TIMEOUT" });
  assert.equal(s2.score.total, 1, "a second timeout in revealing is a no-op");
});

test("ADVANCE only works from revealing and loads the next question", () => {
  const s0 = initQuiz(pool(5), "nameIt");
  assert.equal(quizReducer(s0, { type: "ADVANCE" }), s0, "ADVANCE from asking is a no-op");
  const s1 = quizReducer(s0, { type: "ANSWER", choice: s0.current!.state });
  const s2 = quizReducer(s1, { type: "ADVANCE" });
  assert.equal(s2.phase, "asking");
  assert.ok(s2.current);
  assert.notEqual(s2.current!.state.id, s0.current!.state.id, "advanced to a different question");
  assert.equal(s2.queue.length, 3);
});

test("exhausting the queue ends the run as done", () => {
  const s = playAllCorrect(pool(6));
  assert.equal(s.phase, "done");
  assert.equal(s.current, null);
  assert.equal(s.score.correct, 6);
});

test("RESET adopts a freshly built run", () => {
  const s0 = initQuiz(pool(10), "nameIt");
  const s1 = quizReducer(s0, { type: "ANSWER", choice: s0.current!.state });
  const fresh = initQuiz(pool(4), "findIt");
  const s2 = quizReducer(s1, { type: "RESET", state: fresh });
  assert.equal(s2, fresh);
  assert.equal(s2.total, 4);
  assert.equal(s2.score.total, 0);
  assert.equal(s2.mode, "findIt");
});

test("findIt questions carry no multiple-choice options", () => {
  const s = initQuiz(pool(5), "findIt");
  assert.equal(s.current!.quizType, "findIt");
  assert.equal(s.current!.options.length, 0);
});

test("the reducer is pure: identical inputs give identical outputs", () => {
  const s0 = initQuiz(pool(5), "nameIt");
  const a = quizReducer(s0, { type: "ANSWER", choice: s0.current!.state });
  const b = quizReducer(s0, { type: "ANSWER", choice: s0.current!.state });
  assert.deepEqual(a, b);
});

test("mixed mode with a seeded rng produces both question types deterministically", () => {
  // shuffle consumes rng first; feeding a fixed stream makes the run reproducible.
  const s1 = initQuiz(pool(8), "mixed", { rng: seq([0.1]) });
  const s2 = initQuiz(pool(8), "mixed", { rng: seq([0.1]) });
  const types1 = [s1.current!.quizType, ...s1.queue.map((q) => q.quizType)];
  const types2 = [s2.current!.quizType, ...s2.queue.map((q) => q.quizType)];
  assert.deepEqual(types1, types2, "same seed -> same type sequence");
  const both = initQuiz(pool(8), "mixed", { rng: seq([0.2, 0.8]) });
  const allTypes = new Set([both.current!.quizType, ...both.queue.map((q) => q.quizType)]);
  assert.ok(allTypes.has("nameIt") && allTypes.has("findIt"), "an alternating rng yields both types");
});

test("retry-missed keeps 4 options via a separate distractor pool even with a tiny question pool", () => {
  const twoMissed = pool(2);
  const s = initQuiz(twoMissed, "nameIt", { distractors: STATES });
  assert.equal(s.total, 2);
  for (const q of [s.current!, ...s.queue]) {
    assert.equal(q.options.length, 4, "distractors from the full set keep 4 choices");
    assert.equal(new Set(q.options.map((o) => o.id)).size, 4);
  }
});

test("without a distractor pool a sub-4 question pool yields fewer options (documented edge)", () => {
  const s = initQuiz(pool(2), "nameIt");
  assert.equal(s.current!.options.length, 2, "only the 2 available states can be options");
});

test("missed states collect exactly the wrong ones across a run", () => {
  let s = initQuiz(pool(4), "nameIt");
  const missedIds: string[] = [];
  for (let i = 0; i < 4; i++) {
    if (i % 2 === 0) {
      missedIds.push(s.current!.state.id);
      s = quizReducer(s, { type: "ANSWER", choice: other(s) });
    } else {
      s = quizReducer(s, { type: "ANSWER", choice: s.current!.state });
    }
    s = quizReducer(s, { type: "ADVANCE" });
  }
  assert.equal(s.phase, "done");
  assert.deepEqual(s.missed.map((m) => m.id).sort(), missedIds.sort());
});
