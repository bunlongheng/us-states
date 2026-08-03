# US States

An interactive geography game to learn all 50 US states on a live, color-coded map. Study every state's capital, region, bird, flower, motto, and fun facts, then test yourself with two quiz modes across 5 difficulty tiers.

## Features

- **Study mode** - click any state to see its capital, region, area, statehood order, state bird, state flower, motto, and fun facts, with a pronounce button.
- **Quiz mode** - two question types: *name the highlighted state* (multiple choice) and *find the state on the map* (click it).
- **5 difficulty tiers** - cumulative, from iconic states up to the most confusing ones. Higher tiers hide the state labels.
- **Color-coded regions** - 8 US regions, each with a distinct color and legend.
- **Feedback** - confetti on correct answers, Web Audio success/wrong tones, optional per-question timer.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + CSS Modules
- [react-simple-maps](https://www.react-simple-maps.io/) with a self-hosted [us-atlas](https://github.com/topojson/us-atlas) topojson
- canvas-confetti

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3032](http://localhost:3032).

## Scripts

| Script | Does |
|--------|------|
| `npm run dev` | Dev server on port 3032 |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Unit tests for the quiz logic (`node:test`) |

## Notes

The US map geometry (`public/states-10m.json`) is self-hosted rather than fetched from a CDN, so the app makes no external network calls and its Content-Security-Policy stays locked to `'self'`.
