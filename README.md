<div align="center">
  <img src="docs/icon.png" alt="States" width="96" height="96" />
  <h1>States</h1>
  <p><em>Interactive US map to study and quiz yourself on all 50 states</em></p>
  <p><a href="https://github.com/bunlongheng/us-states">Repo</a> &middot; <a href="https://bunlongheng.com/projects?name=states">Portfolio</a></p>
  <img src="docs/social-preview.png" alt="States - preview" width="820" />
</div>

---

<div align="center">

# US States

**An interactive geography game to learn all 50 US states on a live, color-coded map.**

Study every state's capital, region, bird, flower, motto, and fun facts, then test yourself with two quiz modes across 5 difficulty tiers.

[![CI](https://github.com/bunlongheng/us-states/actions/workflows/ci.yml/badge.svg)](https://github.com/bunlongheng/us-states/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[**Play it live -> us-states-bheng.vercel.app**](https://us-states-bheng.vercel.app)

<img src="docs/demo.png" alt="US States quiz mode - a color-coded US map with a multiple-choice question" width="820">

</div>

## Features

- **Study mode** - click any state to see its capital, region, area, statehood order, state bird, state flower, motto, and fun facts, with a pronounce button (Web Speech).

<img src="docs/demo-study.png" alt="US States study mode - clicking a state shows its capital, region, and fun facts" width="820">

- **Quiz mode** - two question types, mixed at random: *name the highlighted state* (multiple choice) and *find the state on the map* (click it).
- **5 difficulty tiers** - cumulative, from iconic states up to the most confusing ones. Higher tiers hide the state labels and shorten the timer.
- **Color-coded regions** - 8 US regions, each with a distinct color and an interactive legend.
- **Game feel** - confetti on correct answers, Web Audio success/wrong tones, an optional per-question timer, and a victory screen.

## Tech stack

| Area | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | CSS Modules (Tailwind 4 base via PostCSS) |
| Map | [react-simple-maps](https://www.react-simple-maps.io/) + self-hosted [us-atlas](https://github.com/topojson/us-atlas) topojson |
| Effects | canvas-confetti, Web Audio, Web Speech |
| Tests | `node:test` (pure quiz logic) |
| Hosting | Vercel |

## How it works

```mermaid
flowchart LR
  A[Browser] -->|static HTML/JS| B[Next.js App Router]
  B --> C["app/page.tsx<br/>(client game)"]
  C -->|"reads"| D["lib/states.ts<br/>50-state dataset"]
  C -->|"pure logic"| E["lib/quiz.ts<br/>options / colors"]
  C -->|"fetch /states-10m.json"| F["public topojson<br/>(self-hosted)"]
  C -->|"geoAlbersUsa"| G[react-simple-maps]
```

The whole game is a single client component. The US map geometry is served from `public/states-10m.json` rather than a CDN, so the app makes **no external network calls** and its Content-Security-Policy stays locked to `'self'`.

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
| `npm run e2e` | Playwright end-to-end tests (builds + serves on port 3032) |

## Design decisions

| Decision | Why |
|----------|-----|
| Self-host the topojson in `public/` | No CDN dependency, no external calls, CSP stays `'self'`, works offline |
| `legacy-peer-deps` in `.npmrc` | `react-simple-maps@3` declares React 16-18 peers; this app runs React 19 |
| Render the map only after mount | Avoids a benign react-simple-maps SSR hydration mismatch on projected marker coordinates |
| Pure logic in `lib/quiz.ts` | Keeps the quiz math (options, color transforms) unit-testable without a DOM |

## License

[MIT](LICENSE) (c) 2026 Bunlong Heng

---

<p align="center">
  <sub>Built by <a href="https://bunlongheng.com">Bunlong Heng</a> &middot; <a href="https://bunlongheng.com/projects/states">See it in my portfolio &rarr;</a></sub>
</p>

---

<div align="center">

<a href="https://bunlongheng.com"><img src="https://img.shields.io/badge/-bunlongheng.com-3A3A3C?style=for-the-badge&amp;labelColor=2A2A2C&amp;logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y%2BmAAADAFBMVEXx8vLq6v%2F19fX09PT8%2Ff309PT5%2BfnAwMBMaXHx8vL19fX5%2Bfny8vL09PT39%2Ff6%2Bfn6%2Bvr09PTx8fH4%2BPn%2F8vLy8%2FP09PTz8%2FPy8vL%2F%2F%2F%2Fz9PTz9PP19fby8vP19PXz8%2FT19%2Fb08%2FTx8vLy8vL09vby8%2FL29vf19fTv8PDz9vb7%2Bvn%2F%2Ff%2F9%2Ff3w8vH29fb%2F%2FP339%2Ff5%2Bfn59%2Ff19PT09PR7rao3VF3%2F%2Fv8AKDR6sqsBV1vv8fL4%2BPiux8b8%2Bvq90NDy8%2FR%2BlpppnZyZqrACLTxclZJSkI9en5ssZ2luqaUAeWgqbW4BX1gCfG0%2Fa3QaVG0MN0UKNUKUpKsGpYMAKjoRQ1UDf3AQRloJqIgEm32d0cUBg3ElbnQIln8eVWgrmIdP0KzF5d5s2acdfHwppJCP5MMXl4Tz8%2FLv8%2FP39%2FiewL5%2BqahYf4IrTFZkk5KlxsREiIYAHiqDnKFmnJowc3IdVllvpKK7zc3D2tnk5%2BmuycdwpKKuub2yv8Ly%2B%2FkAMT7z%2Bvjq7e09gH93q6kGdWpGgoJZmJSlw8M7c3WwyceTw76w1M8mYmpFfX8lW2AFOEpGiYhxqqRrqaRb2rdIsZ8AVE91jpU7d3t3saqBoKhako4AWVEcUlg3aWwDupAHb2YwmIkPP1ERSVA7WmZ8tq8HT14oZW%2BYuLsMl3wQT10ROksENUc8Z3MJSGVLh4dqpJ%2BXr7U51awUgHM4v6ad1MkPuJZAiowVd3IEhnZH0aoYrI05p5sDtYwkzZ8EPViYxsRel5USbHAIgmwIM0gQamzU4uF2malQi4oWQFQ1zaYrp4UXlYwfiHoyxqFE1q4qeX4yn5JIxKkdrX1b1rAbWGvd5Oh91sRijpomsJEVc3Ukc34dqIcwuJVKwZIXkoQZcXlNv5g%2BqZUZvpNl2rPG9N0WkIoNqouW4sVPwp%2BM0b6h0ssfq4d%2F1r8hpo%2Fh9e4AamUjnI9avaBixqgklYWSwL4xtItUxplYl5qZ58mq78wMgnYXfnlOmJaR1L%2Bj78ny9fS%2FrXQPAAAAFXRSTlP7Brvx%2FsJhAgD87r4U72C4uGH8vhRDodYHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC6UlEQVQokS2Sd3BUVRSHb0KS3QRCiZw5t%2By9j33zXjZkyUs2uekhEAi9dwRCL4JUEQRFAQUs9A4WOopKU0GpFoqCBZUivaqoFKkWLIS5GX7%2FfnPO78yZj%2Fj8UTViK6HggvNgSGuluEZRKbZqlN9H%2FFWiWUzIFQK5fhjOIRTDoqv4ia86S4q3KSByHdSqIhxofBKr5iNxLMm2bQqWVkorJ%2BAkO46nkQJhceSRmCTDvKJIJBLJzMxMLU6POJ4eBPF1KpNEbdt2Cms4LCcnZ%2FX6D3d%2BsKJJ7VSlNLoqgbjUtmkKKxlVmpf3bsFXW3d1b77gueJAQIPQBCilkMKemNi23Ts9T35%2FaMe2rsvmTypylGUFCSIYWJLXrm2nUwOPfNO5w%2B73Okxnjqe0JigQEL3JizoeONr%2F2u99vju4fd1rdZnyspQmnGvAUBprWNqz348%2FhXN%2F6P1%2By4Uvs%2FJkpRQRwpJBRVn7vf16Dfitz5XevQqWt3yalXtKaRIUQmglWfsu5y7%2BMrDs0TMftWo1ZVy64xioOVpcIdt8%2Fvqvf9%2F859KJsrLmrzA%2BOKC0IkFEtJza7JOfr%2FYd0P9G98tdOxe0Hp9qJrOIBgDuOeEtp%2F%2B4d%2FvWX%2F%2F9u%2B%2FtlaUTmOWZg7SQEEyuFe52%2BML9O3cZO%2F5xl06zn2VcadOJUqJTzt7a82XfP7sx9vmGNm1m1MstV4IHCVAAoTLqL1372ddn%2Fz%2B2v%2FWq12c1fSpsaeQWAZAANntxzuI3e3zbo8XGpm%2FMnNqiXrh%2BljaPd6UUabkjps19tdGnX2zKb9b4pTFDCzOMLmYtpW5h%2BpCRTeYtyV%2BT36zx808OL4xYGoFrkqDTbJpSXLdRgwbPZL%2BQnT129OOPFVEEsAMJpHKdeKMJgJSAiALdjJANQKnRJI4R6boAKEwLCiGoBBegQjBftQo1KQWOlplFKSV9qGaF1NpAE7QQESTlMSy6pp%2F4%2FFFVYxMNRBTaiM0tkImxNaL8vgfDR8gvoYRaxgAAAABJRU5ErkJggg%3D%3D" alt="bunlongheng.com"></a>
<a href="https://www.linkedin.com/in/bunlongheng/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
<a href="https://www.instagram.com/ibunlong/"><img src="https://img.shields.io/badge/Instagram-C13584?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"></a>
<a href="mailto:bheng.code@gmail.com"><img src="https://img.shields.io/badge/Email-2E7D32?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"></a>

<br>

Built by **[Bunlong](https://bunlongheng.com)** &nbsp;&middot;&nbsp; [more apps](https://bunlongheng.com/projects)

</div>
