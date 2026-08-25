import { test } from "node:test";
import assert from "node:assert/strict";
import { STATES } from "../lib/states.ts";
import { LEGEND_ORDER, REGION_COLORS } from "../lib/quiz.ts";
import { STATE_PATHS } from "../lib/mapPaths.ts";

test("the dataset holds exactly 50 states", () => {
  assert.equal(STATES.length, 50);
});

test("every state has a matching precomputed map path (no orphans)", () => {
  const pathFips = new Set(STATE_PATHS.map((p) => p.fips));
  for (const s of STATES) {
    assert.ok(pathFips.has(s.fipsCode), `missing map path for ${s.name} (FIPS ${s.fipsCode})`);
  }
  // Every path carries real geometry and a centroid so the map + labels render.
  for (const p of STATE_PATHS) {
    assert.ok(p.d.length > 0, `empty path data for FIPS ${p.fips}`);
    assert.ok(Number.isFinite(p.cx) && Number.isFinite(p.cy), `bad centroid for FIPS ${p.fips}`);
  }
});

test("ids and FIPS codes are unique and FIPS is 2-char zero-padded", () => {
  const ids = STATES.map((s) => s.id);
  const fips = STATES.map((s) => s.fipsCode);
  assert.equal(new Set(ids).size, 50, "ids unique");
  assert.equal(new Set(fips).size, 50, "FIPS unique");
  for (const s of STATES) {
    assert.match(s.fipsCode, /^\d{2}$/, `${s.id} FIPS should be 2 digits, got ${s.fipsCode}`);
  }
});

test("every cumulative difficulty pool has >= 4 states (getOptions needs 4)", () => {
  for (const level of [1, 2, 3, 4, 5] as const) {
    const pool = STATES.filter((s) => s.difficulty <= level);
    assert.ok(pool.length >= 4, `difficulty ${level} pool has only ${pool.length} states`);
  }
});

test("every region is colored and present in the legend", () => {
  const legend = new Set(LEGEND_ORDER);
  for (const s of STATES) {
    assert.ok(REGION_COLORS[s.region], `missing color for region ${s.region}`);
    assert.ok(legend.has(s.region), `region ${s.region} not in legend`);
  }
});

test("map centers fall within the US bounding box (incl. AK + HI)", () => {
  for (const s of STATES) {
    assert.ok(s.centerLon >= -180 && s.centerLon <= -65, `${s.id} lon ${s.centerLon} out of range`);
    assert.ok(s.centerLat >= 15 && s.centerLat <= 72, `${s.id} lat ${s.centerLat} out of range`);
  }
});

test("no em or en dashes in user-visible fun facts", () => {
  for (const s of STATES) {
    for (const fact of s.funFacts) {
      assert.ok(!/[—–]/.test(fact), `${s.id} fun fact contains a dash: ${fact}`);
    }
  }
});
