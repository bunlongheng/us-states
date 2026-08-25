# Contributing

Thanks for taking a look at US States. Contributions of all sizes are welcome.

## Getting started

Requires Node 22+ (`npm test` runs TypeScript via `--experimental-strip-types`).

```bash
npm install
npm run dev
```

The dev server runs on port 3024, so open [http://localhost:3024](http://localhost:3024).

## Before you open a PR

- `npm run typecheck` must pass
- `npm run lint` must pass
- `npm test` must pass
- `npm run e2e` (Playwright) must pass
- PRs should target `main`
- CI must be green before merge

## Project layout

- `app/` - Next.js App Router shell (layout, metadata, PWA manifest, client entry)
- `components/` - the game UI (map, quiz sidebar, study panel, settings, victory card)
- `lib/` - pure logic, the 50-state dataset, and the precomputed map paths
- `scripts/gen-map-paths.mjs` - build-time generator (source: `scripts/states-10m.json`) that writes `lib/mapPaths.ts`
- `tests/` - `node:test` unit tests
- `e2e/` - Playwright end-to-end tests

If you're fixing a bug, a small test that reproduces it is appreciated but not required. If you're adding a feature, keep it in scope and match the existing style. Small PRs are easier to review, so feel free to split larger changes.
