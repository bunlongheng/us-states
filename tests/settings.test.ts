import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSettings, DEFAULT_SETTINGS, isNewBest } from "../lib/settings.ts";

test("parseSettings returns defaults for junk input", () => {
  assert.deepEqual(parseSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(parseSettings("nope"), DEFAULT_SETTINGS);
  assert.deepEqual(parseSettings(42), DEFAULT_SETTINGS);
  assert.deepEqual(parseSettings({}), DEFAULT_SETTINGS);
});

test("parseSettings accepts valid values and rejects out-of-range ones", () => {
  assert.deepEqual(parseSettings({ difficulty: 4, soundOn: false, timerOn: true, questionMode: "findIt" }), {
    difficulty: 4,
    soundOn: false,
    timerOn: true,
    questionMode: "findIt",
  });
  // invalid difficulty + mode fall back; booleans coerce safely
  const s = parseSettings({ difficulty: 9, soundOn: "yes", timerOn: "no", questionMode: "wat" });
  assert.equal(s.difficulty, 1);
  assert.equal(s.questionMode, "mixed");
  assert.equal(s.soundOn, true, "soundOn defaults on unless explicitly false");
  assert.equal(s.timerOn, false, "timerOn only true when strictly true");
});

test("isNewBest only fires on a full run that beats the stored best", () => {
  assert.equal(isNewBest(true, 42, 40), true, "full run beating best");
  assert.equal(isNewBest(true, 40, 40), false, "tie is not a new best");
  assert.equal(isNewBest(true, 30, 40), false, "worse than best");
  assert.equal(isNewBest(false, 50, 0), false, "retry-missed run never records a best");
});
