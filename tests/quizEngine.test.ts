import { test } from "node:test";
import assert from "node:assert/strict";
import { STATES, type StateData } from "../lib/states.ts";
import { initQuiz, quizReducer, type QuizState } from "../lib/quizEngine.ts";

const pool = (n: number): StateData[] => STATES.slice(0, n);
const other = (s: QuizState): StateData => STATES.find((x) => x.id !== s.current!.id)!;

// Play a full run, answering every question correctly, and return the final state.
function playAllCorrect(states: StateData[]): QuizState {
  let s = initQuiz(states, "nameIt");
  for (let i = 0; i < states.length; i++) {
    assert.equal(s.phase, "asking");
    s = quizReducer(s, { type: "ANSWER", choice: s.current! });
    assert.equal(s.phase, "revealing");
    s = quizReducer(s, { type: "ADVANCE" });
  }
  return s;
}

test("initQuiz seeds a run: total, first question, and queue size", () => {
  const s = initQuiz(pool(10), "nameIt");
  assert.equal(s.total, 10);
  assert.equal(s.phase, "asking");
  assert.ok(s.current, "a first question is loaded");
  assert.equal(s.queue.length, 9);
  assert.equal(s.score.correct, 0);
  assert.equal(s.score.total, 0);
  assert.equal(s.quizType, "nameIt");
  assert.equal(s.options.length, 4);
});

test("correct answer scores, reveals, and moves to revealing", () => {
  const s0 = initQuiz(pool(5), "nameIt");
  const s1 = quizReducer(s0, { type: "ANSWER", choice: s0.current! });
  assert.equal(s1.phase, "revealing");
  assert.equal(s1.score.correct, 1);
  assert.equal(s1.score.total, 1);
  assert.equal(s1.revealId, s0.current!.id);
  assert.equal(s1.wrongId, null);
  assert.equal(s1.missed.length, 0);
  assert.match(s1.verdict ?? "", /Correct/);
});

test("wrong answer counts total only, reveals the right answer, and records a miss", () => {
  const s0 = initQuiz(pool(5), "nameIt");
  const wrong = other(s0);
  const s1 = quizReducer(s0, { type: "ANSWER", choice: wrong });
  assert.equal(s1.score.correct, 0);
  assert.equal(s1.score.total, 1);
  assert.equal(s1.wrongId, wrong.id);
  assert.equal(s1.revealId, s0.current!.id, "the correct answer is revealed so the user learns it");
  assert.deepEqual(s1.missed.map((m) => m.id), [s0.current!.id]);
});

test("a second ANSWER during revealing is ignored (no double-scoring)", () => {
  const s0 = initQuiz(pool(5), "nameIt");
  const s1 = quizReducer(s0, { type: "ANSWER", choice: s0.current! });
  const s2 = quizReducer(s1, { type: "ANSWER", choice: s0.current! });
  assert.equal(s2, s1, "reducer returns the same state reference");
  assert.equal(s2.score.total, 1);
});

test("TIMEOUT counts as one wrong, reveals the answer, and cannot double-fire", () => {
  const s0 = initQuiz(pool(5), "findIt");
  const s1 = quizReducer(s0, { type: "TIMEOUT" });
  assert.equal(s1.phase, "revealing");
  assert.equal(s1.score.total, 1);
  assert.equal(s1.score.correct, 0);
  assert.equal(s1.revealId, s0.current!.id);
  assert.equal(s1.missed.length, 1);
  const s2 = quizReducer(s1, { type: "TIMEOUT" });
  assert.equal(s2.score.total, 1, "a second timeout in revealing is a no-op");
});

test("ADVANCE only works from revealing and loads the next question", () => {
  const s0 = initQuiz(pool(5), "nameIt");
  assert.equal(quizReducer(s0, { type: "ADVANCE" }), s0, "ADVANCE from asking is a no-op");
  const s1 = quizReducer(s0, { type: "ANSWER", choice: s0.current! });
  const s2 = quizReducer(s1, { type: "ADVANCE" });
  assert.equal(s2.phase, "asking");
  assert.ok(s2.current);
  assert.notEqual(s2.current!.id, s0.current!.id, "advanced to a different question");
  assert.equal(s2.queue.length, 3);
});

test("exhausting the queue ends the run as done", () => {
  const s = playAllCorrect(pool(6));
  assert.equal(s.phase, "done");
  assert.equal(s.current, null);
  assert.equal(s.score.correct, 6);
  assert.equal(s.score.total, 6);
});

test("START rebuilds the run with a new pool and total atomically", () => {
  const s0 = initQuiz(pool(10), "nameIt");
  const s1 = quizReducer(s0, { type: "ANSWER", choice: s0.current! });
  const s2 = quizReducer(s1, { type: "START", pool: pool(4), mode: "findIt" });
  assert.equal(s2.total, 4);
  assert.equal(s2.queue.length, 3);
  assert.equal(s2.score.total, 0, "score resets");
  assert.equal(s2.phase, "asking");
  assert.equal(s2.mode, "findIt");
});

test("findIt questions carry no multiple-choice options", () => {
  const s = initQuiz(pool(5), "findIt");
  assert.equal(s.quizType, "findIt");
  assert.equal(s.options.length, 0);
});

test("missed states collect exactly the wrong ones across a run", () => {
  let s = initQuiz(pool(4), "nameIt");
  const missedIds: string[] = [];
  for (let i = 0; i < 4; i++) {
    const answerWrong = i % 2 === 0;
    if (answerWrong) {
      missedIds.push(s.current!.id);
      s = quizReducer(s, { type: "ANSWER", choice: other(s) });
    } else {
      s = quizReducer(s, { type: "ANSWER", choice: s.current! });
    }
    s = quizReducer(s, { type: "ADVANCE" });
  }
  assert.equal(s.phase, "done");
  assert.deepEqual(s.missed.map((m) => m.id).sort(), missedIds.sort());
});
