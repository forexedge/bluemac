# Blue Mac — Project Notes

Blue Mac (formerly TradeVault) is a forex trading platform for South African retail traders:
a guided trade checklist + AI trade ideas, a trading journal, rules, a visual Examples library
and a full trading University. Owner: Brahm (Cape Town). Live: https://bluemac.vercel.app

## How we work
- **Never push to `main`.** All work goes to the **`revamp`** branch. Vercel auto-builds a preview
  for every push (find it under Vercel → bluemac → Deployments, filter by `revamp`).
  `main` = the live site; merge `revamp` → `main` only when Brahm says the revamp is done.
- Brahm prefers: casual tone, direct feedback, surgical changes, test before pushing.
  Never rewrite whole files unless asked. Explain changes in plain language.
- Order agreed: new features first → cleanup/redesign → PayFast, monetisation and saving user data last.
- Everything must make sense for SA traders: SAST times, FSCA brokers, ZAR.

## Architecture
Static site, no build step. `index.html` (~730 KB) holds the main app (Checklist / Journal / Rules
pages, guided mode, AI calls, auth). New features live in separate JS files loaded at the end of
`index.html`, in this order:

| File | What it is |
|---|---|
| `patterns.js` | Examples → Patterns tab (53 chart patterns, line-diagram engine) |
| `fibonacci.js` | Examples → Fibonacci tab (17 lessons) |
| `smartmoney.js` | Examples → Smart Money tab (19 lessons: OB, FVG, BOS/CHoCH, liquidity…), candle engine with auto-fit |
| `exengine.js` | `window.BMX` shared chart engine: generates candles from anchor points and computes REAL indicators (SMA, EMA, RSI, MACD, Bollinger, Stochastic, ATR, VWAP, Ichimoku, volume profile). Also `BMX.mount()` / `BMX.filter()` for library tabs |
| `indicators.js` | Examples → Indicators tab (17 lessons, uses BMX) |
| `management.js` | Examples → Trade Management tab (8 lessons, uses BMX) |
| `uni-diagrams.js` | `window.BMUD` — 35 custom SVG diagrams for University lessons |
| `curriculum-1/2/3.js` | University content: 7 levels → 20 modules → 97 lessons + 100 quiz questions (`window.BMU_LEVELS`) |
| `placement.js` | `window.BMP` — placement test shown once after registration (lives in `#quiz-gate`) |
| `university.js` | `window.BMU` — Education tab: degree dashboard, modules, lessons, quizzes, certificates |
| `logo.png` | Single logo file (used to be embedded 4× as base64) |

### Key conventions
- Every Examples card has `data-id` (`pat-hs`, `fib-golden`, `smc-ob-what`, `ind-rsi`, `mgt-rr`…).
  The 20 original cards are matched by title slug (`ex-support-and-resistance`).
  University lessons reuse Examples diagrams via `ref:'<data-id>'` — never duplicate a diagram.
- Library tabs with sub-filters are registered in `filterExamples()` → `SUBTABS` in `index.html`.
- Diagrams: SVG viewBox 260×150, DM Mono labels, palette `--blue #2A8FE3`, light `#96D0FF`,
  bull `#22D67A`, bear `#FF5C5C`, silver `#E4E8EE`, slate `#8AA4BF`, amber `#F5B841` (indicators only).
- University progress: `localStorage['bm_uni_v1']` (device only for now). Strict unlocking:
  pass each module quiz with 80%+. Placement marks lower modules "placed out" (`P.placed.level`);
  certificates still need real quiz passes; Level 7 can never be skipped.
  Placement level is also saved to Supabase user metadata (`tv_placement_level`).
- Auth: Supabase (`_supabase`). One login handler `onSignedIn()` runs once per login:
  placement test → disclaimer → app. If the Supabase CDN fails, `_sbOffline` stub keeps the app alive.
- AI ideas: Supabase Edge Function `trade-idea`. `runStyleAI()` (Scalp/Day/Swing/Position) and
  `runKeyAI()` (Blue Mac Key). Typed chart prices are injected into the prompt as
  "EXACT PRICE LEVELS". Hard-blocked setups (`GM.blocked`) never call the AI.
- Journal table: `trade_journal` (outcomes: pending / win / loss / be).

### Testing approach used so far
Headless Chromium via Playwright (`/opt/pw-browsers`). Stub the Supabase CDN, hide the gates
(`auth-gate`, `quiz-gate`, `disclaimer-gate`), then check every page, style, filter and flow for
zero page errors. Render diagrams to PNG contact sheets and look at them before shipping.
Dead-code checks were done with acorn (reachability from HTML/onclick/other JS files).

## Done on 13 Oct 2026 (all on `revamp`)
1. Examples: Patterns (53), Fibonacci (17), Smart Money (19), Indicators (17), Trade Management (8) → 134 lessons total
2. Education replaced by **Blue Mac University — Self-Mastery Degree** (7 levels, quizzes, resume, certificates)
3. **Placement test** after registration (experience questions + adaptive knowledge check → starting level + style suggestion)
4. **Cleanup pass**: −50% file size, dead code removed, login handler fixed, AI now receives typed prices,
   blocked setups can't generate ideas, journal db_id + plan-adherence reload fixed,
   Blue Mac Key added to Rules/Journal, offline-safe Supabase, Sessions card shows both seasons (SAST)

## Open decisions (waiting on Brahm)
1. **Scalp definition is inconsistent**: style tab says 15m/30m charts; Rules page says H4 bias + 15m entry;
   guided questions + AI prompt use D1 bias, H1 structure, 5m 9/21 EMA entries. Which is correct?
2. **Risk rule**: "TP1 ≥ 1:2, TP2 ≥ 1:3, Entry 2 never beyond SL" is only enforced for Key.
   Apply to all styles (on top of their own minimums: Scalp/Day 1:2, Swing 1:3, Position 1:5)?

## Next up
- **Redesign pass** (agreed): Examples filter bar now wraps to 2 rows → grouped menu;
  rebuild bias detection on fixed answer codes instead of text matching; overall visual refresh.
- Later: Supabase redirect URLs for preview logins (`https://*-abrahams-projects-2cf14794.vercel.app/**`),
  University progress to Supabase, PayFast + monetisation, then merge `revamp` → `main`.
