import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSettings, DEFAULT_SETTINGS } from "../lib/settings.ts";

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
