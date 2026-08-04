# Contributing

Thanks for taking a look at US States. Contributions of all sizes are welcome.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on port 3032, so open [http://localhost:3032](http://localhost:3032).

## Before you open a PR

- `npm run typecheck` must pass
- `npm run lint` must pass
- `npm test` must pass
- PRs should target `main`
- CI must be green before merge

## Project layout

- `app/` - UI (the game itself)
- `lib/` - pure logic and the state data
- `tests/` - `node:test` unit tests
- `public/states-10m.json` - self-hosted map geometry, no CDN dependency

If you're fixing a bug, a small test that reproduces it is appreciated but not required. If you're adding a feature, keep it in scope and match the existing style. Small PRs are easier to review, so feel free to split larger changes.
