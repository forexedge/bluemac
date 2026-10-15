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
Static site, no build step. `index.html` (~315 KB since the 15 Oct cleanup) holds the app shell:
uTrade Ideas page shell, Journal, Rules page shell, auth, glossary, setup guide. New features live in separate JS files loaded at the end of
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
| `utrade.js` | `window.UT` — **uTrade Ideas engine** (replaces the old Checklist guided flow per style): code-based answers, gates, scoring/grades, engine-calculated price plan, AI prompt + output cards, Learn modal, SAST kill-zone clock |
| `utrade-diagrams.js` | Shared UT diagram library (`UT.DG`, `UT.C(key, dir)`, `UT.sessionBar`, `UT.pdDg`) + `UT.INSTR` instrument list |
| `utrade-scalp.js` | Scalp — "Session Liquidity Scalp": H1 bias → 15m sweep into OB/FVG/flip → 5m CHoCH/engulf |
| `utrade-day.js` | Day — "Trend Pullback Day Trade": D1 bias → H4 BOS → H1 zone (golden pocket/OB/FVG/flip) → 15m trigger |
| `utrade-swing.js` | Swing — "Weekly Zone Swing": W1 structure + 50/200 stack → D1 zone → push count → H4 pattern/CHoCH |
| `utrade-position.js` | Position — "Macro Trend Position": MN + W1 200 SMA + trend age + macro + COT → weekly major pattern → D1 entry |
| `utrade-key.js` | Blue Mac Key — "Key MA System+": 9-TF 50/200 matrix (62%+ weighted) → 50/200 MA pullback → zone at MA → trigger |
| | Each strategy file = questions + diagrams + `rules` (Rules page is generated from it) + `levelMap()` + `prompt()` |
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
- AI ideas: Supabase Edge Function `trade-idea`, called by `UT.fire()` for every style. The old
  `runStyleAI`/`runKeyAI`, `GUIDED_*` arrays, `RULES` HTML and manual tick-box mode were deleted on 15 Oct.
  Hard-blocked setups never call the AI. `takeThisTrade()` saves `window._lastTradePlan` (set by UT).
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

## uTrade Ideas rebuild (started 15 Oct 2026)
"Checklist" is renamed **uTrade Ideas** (page id stays `pg-checklist`). Every style is being rebuilt from
scratch on the UT engine, one at a time, with Brahm's OK between each:
1. ✅ Engine + rename + **Scalp** 2. ✅ Day 3. ✅ Swing 4. ✅ Position 5. ✅ Blue Mac Key 6. ✅ Rules page + old code deleted
Decisions (Brahm, 15 Oct): all 5 styles rebuilt incl. Key · Claude designs the strategies from the Examples library ·
risk rule applies to **every** style (Entry 2 between Entry 1 and SL). `minRR` [TP1, TP2]: Scalp/Day/Key 1:2 & 1:3,
Swing 1:3 & 1:4, Position 1:3 & 1:5 · old tick-box sections removed — guided only · every question shows example diagrams.

### UT conventions
- Option codes: `dir` (+1/-1/0), `pts`, `gate:'block'` (no trade, AI never called) / `'wait'` (Watchlist idea, Monitor only),
  `bias:true` on bias-layer questions, `align:'critical'` (against bias → wait) or soft (→ warning). No text matching.
- Grades: A+ ≥ 85 (1% risk) · A ≥ 72 (0.75%) · B ≥ 60 (0.5%) · below 60 = No Trade. `halfRisk:true` options halve it.
- Question types: `instrument`, `single`, `multi` (confluence, capped by `max`), `matrix` (Key 9-TF grid), `levels`.
  `noScore:true` = skipped layer (not counted). Critical questions hide against-bias options behind a "Show N…" button.
- TP selection (`plan()`): TP1 = first structural target paying the minimum, else the minimum; TP2 = next level beyond
  max(TP2 minimum, TP1 + 1R). `UT.stdLevels()` / `UT.stdCheck()` are the shared level maths.
- **Prices come from the engine** (`levelMap` + `plan()`), never the AI. The AI only writes signal / wait / invalidation /
  management / reasoning. Counter-trend idea score = 45% of the main score (max 45).
- Diagrams: write the bull version in `DG`; `UT.D.chart(spec, -1)` mirrors to bear. Reuse Examples diagrams with
  `UT.D.ref('<data-id>')`. Every `ref:` opens that Examples card in the Learn modal.
- Session times are computed live in SAST from London/New York local time (DST-safe): London KZ 08:00–11:00 London,
  NY KZ 08:30–11:00 New York.

## Next up
- Brahm to test all 5 uTrade styles on the `revamp` preview (phone first) and give feedback.
- Leftovers for the redesign pass: old `.guided-*` / tick-box CSS is now unused; the manual "log trade" modal
  (`#log-modal`, `confirmLog`) has no opener anymore — decide whether to bring back a manual journal entry button.
- **Redesign pass** (agreed): Examples filter bar now wraps to 2 rows → grouped menu;
  rebuild bias detection on fixed answer codes instead of text matching; overall visual refresh.
- Later: Supabase redirect URLs for preview logins (`https://*-abrahams-projects-2cf14794.vercel.app/**`),
  University progress to Supabase, PayFast + monetisation, then merge `revamp` → `main`.
