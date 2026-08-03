import { test } from "node:test";
import assert from "node:assert/strict";
import { invertHex, lighten, shuffle, getOptions, REGION_COLORS, LEGEND_ORDER } from "../lib/quiz.ts";
import { STATES } from "../lib/states.ts";

test("invertHex inverts each channel", () => {
  assert.equal(invertHex("#000000"), "rgb(255,255,255)");
  assert.equal(invertHex("#ffffff"), "rgb(0,0,0)");
  assert.equal(invertHex("#2563eb"), "rgb(218,156,20)");
});

test("lighten adds amount and clamps at 255", () => {
  assert.equal(lighten("#000000", 40), "rgb(40,40,40)");
  assert.equal(lighten("#ffffff", 40), "rgb(255,255,255)");
  assert.equal(lighten("#102030", 16), "rgb(32,48,64)");
});

test("shuffle preserves every element (is a permutation)", () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const out = shuffle(input);
  assert.equal(out.length, input.length);
  assert.deepEqual([...out].sort((a, b) => a - b), input);
  // original array is not mutated
  assert.deepEqual(input, [1, 2, 3, 4, 5, 6, 7, 8]);
});

test("getOptions returns 4 unique choices including the correct one", () => {
  for (let i = 0; i < 100; i++) {
    const correct = STATES[i % STATES.length];
    const opts = getOptions(correct, STATES);
    assert.equal(opts.length, 4);
    const ids = opts.map((o) => o.id);
    assert.ok(ids.includes(correct.id), "must include the correct state");
    assert.equal(new Set(ids).size, 4, "all four options must be distinct");
  }
});

test("every region used by a state has a color and a legend slot", () => {
  const legend = new Set(LEGEND_ORDER);
  for (const s of STATES) {
    assert.ok(REGION_COLORS[s.region], `missing color for region ${s.region}`);
    assert.ok(legend.has(s.region as (typeof LEGEND_ORDER)[number]), `region ${s.region} not in legend`);
  }
});

test("state data is internally consistent (unique ids, unique FIPS)", () => {
  const ids = STATES.map((s) => s.id);
  const fips = STATES.map((s) => s.fipsCode);
  assert.equal(new Set(ids).size, ids.length, "state ids must be unique");
  assert.equal(new Set(fips).size, fips.length, "FIPS codes must be unique");
  assert.ok(STATES.length >= 50, "expected at least 50 states");
});
