import type { Region, StateData } from "./states";

// Ordered geographically left -> right on the US map.
// Colors chosen from distinct segments of the 12-step color wheel - no duplicates.
export const REGION_COLORS: Record<Region, string> = {
  Pacific: "#06b6d4", // cyan       - ocean/AK/HI
  West: "#16a085", // teal          - left coast
  "Mountain West": "#7c3aed", // violet - Rockies
  Midwest: "#65a30d", // lime-green  - plains/great lakes
  South: "#d97706", // amber        - south-central
  Southwest: "#dc2626", // red       - TX/OK/desert
  Southeast: "#ea580c", // orange    - SE coast
  Northeast: "#2563eb", // blue      - NE coast
};

// Legend displayed in left-to-right geographic order.
export const LEGEND_ORDER: readonly Region[] = [
  "Pacific",
  "West",
  "Mountain West",
  "Midwest",
  "South",
  "Southwest",
  "Southeast",
  "Northeast",
];

export function invertHex(hex: string): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = 255 - (num >> 16);
  const g = 255 - ((num >> 8) & 0xff);
  const b = 255 - (num & 0xff);
  return `rgb(${r},${g},${b})`;
}

export function lighten(hex: string, amount = 40): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// One correct state plus 3 distinct wrong ones, shuffled.
export function getOptions(correct: StateData, all: StateData[]): StateData[] {
  const wrong = shuffle(all.filter((s) => s.id !== correct.id)).slice(0, 3);
  return shuffle([correct, ...wrong]);
}
