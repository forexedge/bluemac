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
| `management.js` | Examples → Trade Management tab (12 lessons incl. 4 "Key Range" lessons, uses BMX) |
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
| `utrade-key.js` | Blue Mac Key — "Key Range" session system: 15m range after the Asia/London/NY open → 15m close outside (Key Break) → retest entry. Old 9-TF MA version is in git (bfd090b) |
| | Each strategy file = questions + diagrams + `rules` (Rules page is generated from it) + `levelMap()` + `prompt()` |
| `dna.js` | `window.BMD` — **My Trading DNA** (16 Oct): member picks concepts (up to 5, cards with Examples diagrams), markets (5), sessions, entry chart (2) → `localStorage['bm_dna_v1']`, synced via BMS. Card/bar sits above the uTrade toggle on uTrade Ideas (no forced gate). `BMD.closestStyle()` maps DNA → nearest full-analysis style. Step 1 of the personal Quick Idea generator |
| `quick.js` | `window.BMQ` — **Quick Idea concept blocks** (16 Oct). Each DNA concept = a block (question + diagrams + pts + level fields). `BMQ.build(dna)` assembles them into one strategy registered as UT style **`quick`** (+ `STYLES.quick` banner) → same engine: grades, gates, prices, net R:R, E2 inside SL, lots, AI. Order: [chart if 2 TFs] → instrument (their markets first) → one safety q (news/losses/kill zone) → bias on the higher TF → MA / P-D → Key Range / sweep / structure → ONE merged zone q (only their zone concepts; OB+FVG adds "OB with FVG inside") → trigger (CHoCH or engulfing first by DNA) → confluence (RSI/VWAP only) → levels. Bias TF: 1m→15m, 5m→H1, 15m→H4, H1/H4→D1, D1→W1. minRR by entry TF: ≤H1 1:2/1:3, H4 1:3/1:4, D1 1:3/1:5. Prompt carries their concepts + Key Range naming rule. No UI entry yet (step 3) |
| `tour.js` | `window.BMT` — spotlight app tour of every tab. Auto-runs once (after auth, placement and disclaimer) via `localStorage['bm_tour_v1']`; floating "?" button → "Tour this page" / "Full app tour". Steps live in `PAGES`; `ifMissing`/`demo` show mock-ups when the real screen isn't there. Last step is personalised from the placement test (level + suggested style buttons) |
| `profile.js` | `window.BMS` — **member profile** (loaded last). Free-list check + "Free member" badge, and each member's saved spot synced to Supabase (see below) |
| `logo.png` | Single logo file (used to be embedded 4× as base64) |

### Key conventions
- Every Examples card has `data-id` (`pat-hs`, `fib-golden`, `smc-ob-what`, `ind-rsi`, `mgt-rr`…).
  The 20 original cards are matched by title slug (`ex-support-and-resistance`).
  University lessons reuse Examples diagrams via `ref:'<data-id>'` — never duplicate a diagram.
- Library tabs with sub-filters are registered in `filterExamples()` → `SUBTABS` in `index.html`.
- **Examples search (16 Oct):** `#ex-search-input` above the filter bar → `exSearch()` searches all 138 `.ex-card`s (title > tag > body text),
  `EX_ALIASES` maps trader shorthand (OB, FVG, BOS, CHoCH, H&S, fib, S&R…), plurals stemmed, results ordered with CSS `order`; Enter = jump +
  `.ex-hit` highlight; tapping a filter ends the search. New cards are picked up automatically (index built on first search).
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

### Member profiles & free access (15 Oct 2026)
- Supabase project **TradeVault** (`tcnyjxfcexjswatkeeot`). `public.free_access(email)` = members who never pay (Brahm edits it in
  the dashboard, lowercase emails; no API access). Counts only once the account's email is confirmed.
- `public.profiles` gained `state jsonb` + `state_updated_at`. Members can only **read** their row; writes go through
  security-definer RPCs: `bm_load()` → `{comp, tier, state, ts}` and `bm_save_state(s)`. `tier` is server-only (PayFast later).
- `profile.js` syncs the per-member localStorage keys (`BMS.SYNC`: University, costs/balance, know-cards, tour, placement,
  disclaimer, welcome/setup flags, `bm_nav_v1`) by watching `localStorage` writes → saved 1.5 s later / on tab hide.
  `bm_nav_v1` = last page, style, uTrade question + answers (no screenshots), Examples tab. Newest copy wins (client `t`).
- Login: `onSignedIn()` awaits `BMS.load()` before placement/disclaimer. Another member's data on the device (`bm_owner`) is wiped
  first. Logout flushes then wipes. The disclaimer is now accepted once per member (saved), not every login.
- PayFast later: check `BMS.isFree()` (and `BMS.access.tier`) before asking anyone to pay.
- **Password reset (15 Oct):** "Forgot password?" on the Login tab → `resetPasswordForEmail(email, {redirectTo: bmHere()})`.
  Coming back from the email (`PASSWORD_RECOVERY` event or `_bmRecovery` = `type=recovery` in the URL) shows `#reset-gate`
  ("Set a new password", min 8 chars) → `updateUser({password})`. Sign-up confirmation also uses `emailRedirectTo: bmHere()`.
  Both need the site in Supabase → Authentication → URL Configuration → Redirect URLs, or Supabase falls back to the Site URL.
- **Daily AI limit (16 Oct):** the `trade-idea` Edge Function (source now in `supabase/functions/trade-idea/`, deploy with
  `import_map_path: deno.json`, `verify_jwt: false` — it checks the login itself) rejects callers without a member login (401),
  then atomically claims an idea via `bm_claim_idea(uid)` (service role only) → 429 `daily_limit` when used up; failed AI calls
  are refunded (`bm_refund_idea`). Limit = `public.bm_config` key `ai_daily_limit` (default 2, editable in the dashboard), counted
  per SAST day in `public.ai_usage`. App: `bm_ideas_left()` RPC → "X of 2 AI trade ideas left today" under Generate/Regenerate,
  buttons lock at 0, `showLimit()` screen. Applies to the live site too (same function, same counter).
- **Founding 100 / invite-only (16 Oct):** login screen shows `#bm-launch` (replaced the old USD pricing pills) filled from the public
  RPC `bm_launch_info()` → launch date, "X of 100 spots left" (= distinct emails in free_access ∪ early_access ∪ accounts), contact
  email + WhatsApp (mailto / wa.me with "Lock in my spot"). Settings in `bm_config`: `registration_open` (false = invite-only),
  `launch_date`, `spots_total`, `contact_email`, `contact_whatsapp` (digits, empty hides the button). Sign Up tab = "I'm invited":
  `bm_signup_allowed(email)` must be true (email in `free_access` = free forever, or `early_access` = locked-in spot, pays later);
  backstop trigger `bm_guard_signup` BEFORE INSERT on auth.users raises "invite-only". At launch: set `registration_open` = true.
- Form login and sign-up call `onSignedIn()` (never `checkQuizNeeded()` directly) so the profile loads before the disclaimer.

### Testing approach used so far
Headless Chromium via Playwright (`/opt/pw-browsers`). Stub the Supabase CDN, hide the gates
(`auth-gate`, `quiz-gate`, `disclaimer-gate`), then check every page, style, filter and flow for
zero page errors. Render diagrams to PNG contact sheets and look at them before shipping.
Dead-code checks were done with acorn (reachability from HTML/onclick/other JS files).
Harness is now in `tests/` (see tests/README.md) — fake Supabase + Python Playwright.

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
- **Costs & sizing (15 Oct):** `SPEC` in utrade.js = per-instrument quote currency, contract size and typical spread
  (user can override spread/contract per instrument; account currency ZAR/USD/EUR/GBP/AUD + balance) — stored in
  `localStorage['bm_cost_v1']`. All R:R is **net of spread**; TP minimums must be met after the spread.
  FX rates from Frankfurter (ECB), cached daily in `bm_fx_v1`, manual-entry fallback. Lots = risk% × balance ÷
  ((stop distance + spread) × contract × FX), rounded down to 0.01, split across E1/E2; "too big for account" if < 0.01.
- **Room check:** if no structural target pays the TP1 minimum after costs → wait gate ("Room to target") → Watchlist.
  If a nearer level sits in the way, a warning suggests partials there. Targets are never stretched into empty space.
- **Journal Edge Report** (`buildEdgeReport` in index.html): win rate, avg planned R on wins, break-even win rate and
  expectancy (R per trade) by uTrade grade and by style; verdict needs 20+ closed trades.
- **"What you need to know" card:** each strategy has `know: [{t, ref, why}]` + `knowIntro`. Shown before question 1
  the first time a style is opened (questions wait for "I'm ready"), then as a collapsible bar (`bm_know_v1`).
  Each concept links to its Examples card and to the University lesson with the same `ref` (status via
  `BMU._p().done` and `BMU.isUnlocked(mid)`; locked modules show 🔒 and open the University home with the lock note).
- **Prices come from the engine** (`levelMap` + `plan()`), never the AI. The AI only writes signal / wait / invalidation /
  management / reasoning. Counter-trend idea score = 45% of the main score (max 45).
- Diagrams: write the bull version in `DG`; `UT.D.chart(spec, -1)` mirrors to bear. Reuse Examples diagrams with
  `UT.D.ref('<data-id>')`. Every `ref:` opens that Examples card in the Learn modal.
- Text fields (`q`, `help`, `tf`, `heroCap`, field `label`/`hint`) may be functions of the answers (`A => …`).
  The Key uses this: the trader picks ONE entry chart (5m/15m/H1/H4/D1) and every later question and price box names it
  ("H4 50 SMA value"). MAs everywhere are 50 & 200 **Simple (SMA) on Close** — matches the Setup Guide.
- Session times are computed live in SAST from London/New York local time (DST-safe): London KZ 08:00–11:00 London,
  NY KZ 08:30–11:00 New York.

## Blue Mac Key → Key Range rebuild (15 Oct 2026)
- Brahm replaced the Key's MA system with an opening-range-breakout strategy. **Name stays "Blue Mac Key"** and the strategy
  must never be named: no "ORB" / "opening range" anywhere in UI, rules or AI output (the prompt forbids it). Words: Key Range, Key Break, Key Retest.
- Key: 15-min range after Tokyo 09:00 / London 08:00 / New York 09:30 (local, converted to SAST live — `UT.sessions().key`),
  tradeable for 2 h. E1 = broken edge (limit), E2 = range mid, SL = far side ± 5% of range, targets 1×/2×/3× range + PDH/PDL.
- **Hybrid (Brahm's choice):** every other style keeps its logic and gets a `krange` question + optional `kr_hi`/`kr_lo` level fields,
  fed to `stdLevels(..., { range:['kr_hi','kr_lo',name] })` (adds the edge + 2× range target):
  Scalp = first 5 min (critical; a fake break supports the opposite side; a real break is allowed at `halfRisk`) · Day = first hour (critical, fake = wait) ·
  Swing = Monday's range (soft) · Position = first week of the month (soft).
- Examples now 138 lessons. Know-cards, rules and prompts mention the Key Range per style.

## Personal trade ideas (started 16 Oct 2026)
Plan agreed with Brahm: 1. ✅ DNA picker (`dna.js`) 2. ✅ Concept blocks (`quick.js`, all 13 concepts, not just 4) (OB, FVG, sweep, Key Range first) — split the strategy
files into blocks with their own questions/levels/score weight 3. Quick Idea flow (4–6 questions from the member's DNA, same engine
prices + R:R rules) 4. "Upgrade to A+ — full analysis" bridge 5. Later: price feed / chart screenshots. Old 5 styles stay as full analysis.
Why: 16 Oct usage check — 9 members, 0 AI ideas, uTrade drop-off before Generate. Personalised ideas = flag for the FSCA/FAIS check.

## Next up
- Brahm to test the new Blue Mac Key + Key Range layers on the `revamp` preview (phone first) and give feedback.
- Agreed later list (15 Oct review): let members use it 4–6 weeks and log everything → FSCA/FAIS compliance check
  before charging (specific entries/SL/TP may count as advice) → PayFast → password reset (✅ done early) → University progress to
  Supabase (✅ done early via profiles) → manual journal entry button → merge to main. Idea: let the AI check answers against chart screenshots.
- Leftovers for the redesign pass: old `.guided-*` / tick-box CSS is now unused; the manual "log trade" modal
  (`#log-modal`, `confirmLog`) has no opener anymore — decide whether to bring back a manual journal entry button.
- **Redesign pass** (agreed): Examples filter bar now wraps to 2 rows → grouped menu;
  rebuild bias detection on fixed answer codes instead of text matching; overall visual refresh.
- Later: Supabase redirect URLs for preview logins (`https://*-abrahams-projects-2cf14794.vercel.app/**`),
  University progress to Supabase, PayFast + monetisation, then merge `revamp` → `main`.
