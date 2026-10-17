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
| `quick.js` | `window.BMQ` — **Strategy toolbox** (16 Oct): 43 tools in 4 layers — **dir** (structure, 50/200 SMA, 50 EMA, trendlines, channels, Ichimoku; one question each on the bias TF; only the FIRST can hard-block) · **loc** (OB, FVG, S&D, S/R flip, golden pocket, trendline tap, channel edge, 50 SMA pullback, pivots + 8 chart patterns; merged into ONE `zone` q, OB+FVG adds "OB with FVG inside") · **trig** (CHoCH+FVG, engulfing, pin bar, star, trendline break, 9/21 EMA, MACD, Stoch; one `trigger` q in the member's order) · **extra** cond (sweep, Key Range, BOS/CHoCH, P/D, my-sessions) + ticks (RSI div/zone, VWAP, BB, volume, round/PDH, DXY) + up to 3 typed own rules (must = own q → wait if no; nice = tick). Strategy = `{name, tfs, instr, sessions, dir[], loc[], trig[], extra[], custom[], rr}` → `BMQ.build(s, key)` registers a UT style (+ `STYLES[key]` banner): same engine/grades/prices/net R:R/E2/lots/AI. `rr` can only be stricter. `BMQ.pic(id)` = builder picture. 13 new DG diagrams (tl*, chan*, ichi*, pinBar, starTrig, emaCross, macdTrig, stochTrig, pivotTap). UI = builder.js |
| `builder.js` | `window.BMB` — **Strategy Builder + My strategies** (16 Oct). Full-screen builder: Start from (blank / copy a Blue Mac style via `STARTERS`) → Direction (1–3, first = MAIN) → Location (0–6) → Trigger (1–4) → Extras (0–8) + up to 3 own rules (must / nice) → Name & rules (name ≤24, entry chart ≤2, markets ≤5, sessions, TP1 stricter only). Live question count via `BMQ.preview()` (never touches a running idea). Steps can be jumped to once earlier layers are valid. Saves up to 3 strategies (`my1`–`my3`) in `localStorage['bm_strats_v1']` (synced via BMS); "My strategies" row above the uTrade toggle on uTrade Ideas → `BMB.open(id)` = `BMQ.build(s, id)` + `setStyle(id)`. Edit (✎), delete (two taps). Owns the shared `bmd-*` panel/card/chip styles (moved from the retired DNA picker). Journal shows "🛠 <name>" for `my*` trades |
| `coach.js` | `window.BMC` — **"Your next step" guide** (16 Oct, after a member asked "so what do I do?" post-tour). Top of uTrade Ideas: 4-step path (pick → answer → idea → save) that ticks itself off + ONE next action with a button, worked out from the live panel (MutationObserver on `#guided-panel`, hooks on goPage / setStyle / takeThisTrade / renderJournal / showRules — no engine changes). Step 1 (pick) always comes before the default style's know-card; one-tap button for the placement-test style. Journal / Rules / Examples / Education get one line + one button (open trades → mark W/L/BE, rules for the style they trade, search, Continue: <lesson>). **Pointer** (17 Oct, replaced the bouncing floating arrow that covered text): a still in-page label `#bmc-here` ("↓ Pick your market") inserted right ABOVE the target's row (`ROWS` = .bmc-bs/.ut-know-f/.ut-lv/.ut-actions/.ut-take/.style-rules-tabs/#ex-search, else the target itself) so it never overlaps anything, + a steady outline (`.bmc-target`, no animation). Targets: Build-my-own button, I'm-ready, market buttons, options, price box, Generate, Take This Trade, open journal card, the member's Rules tab, Examples search, Education Go (outline only). Off-screen → "↓/↑ … tap to scroll" chip (`#bmc-chip`). Hidden under builder/DNA/lesson/tour/gates AND the app's pop-ups (`.open` on setup guide, style quiz, log/update modals). `paint()` ignores the label when diffing (no flicker). Scroll listener in capture phase + 300 ms check. Step 1's headline button is **🛠 Build my own strategy** (green `.go`), matched style second. **Back navigation:** finished/current path steps are buttons (`BMC.go(i)`); "← Back to step 1" link; going back sets `review` (Step 1 shown again with "← Keep <style>", nothing wiped; cleared by `setStyle`). Hideable per page. Progress in `localStorage['bm_path_v1']` (synced; only marked while logged in; `paint(true)` redraws hidden pages after profile load / logout). The old "Guided Mode" welcome banner (markup, CSS, `dismissWelcome`) was removed; `showWelcomeBanner()` now only shows the chart-setup nudge |
| `practice.js` | `window.BMPR` — **uTrade Practice** (17 Oct, branch `academy`). "Learn by doing": full-screen run (reuses `bmd-*` panel) where the member answers the REAL uTrade questions (`UT.def(style).questions`) on BMX-drawn practice charts / scene cards (clock, calendar, journal), with instant ✅/❌ feedback per option, a hint after 1 slip, "Show me" after 2. Levels step = price list + the real level boxes ("Fill them in for me" fills required only). Result = the real engine via `UT.simulate(style, ans, lv)` (runs evaluate/plan/roomCheck on a throw-away answer set and restores the member's `st` + `S.style`; live-clock warnings filtered) + practice lot size (R100 000, 1 USD = R18.20, R20 000 "too big" lesson). Never calls the AI, never saves to the journal. Run 1 = "Your first idea" (Gold day trade, A+ long). Run 2 = "Spot the trap" (EURUSD: daily downtrend in premium, but H4 BOS up + H1 bullish OB + 15m bullish CHoCH; safety gates preset via `run.pre`; ends with a "Your call" step (`call:[…]`, not a uTrade answer) → engine verdict 3 wait gates + score 40 = below standard → `waitHTML` + `run.after` + `run.moral`). Run 3 = "News day" (Gold, Run 1's A+ setup preset in `pre`; US CPI at 14:30 SAST, clock 14:10 → news `soon` = engine hard block, `waitHTML` also shows the would-be score (85 · A+); 3 "Your call" steps: take/half/no-trade, hotter CPI → Gold usually drops first, wait 30 min (1-min CPI spike chart −23/+28)). Run 4 = "Kill zone scalp" (`style:'scalp'`, GBPUSD SHORT in the London kill zone 09:25 SAST: H1 LH/LL below a falling 50 EMA in premium → Asian high swept at the open (`bsl`) + 5-min Key Range swept above (`sweep_hi`) → 15m bearish FVG → 5m bearish CHoCH → levels → engine A+ short 1:2.3/1:4.0; FOMC minutes red at 20:00 teaches the Scalp 30-minute news rule). All its numbers are read off the generated charts with `hl()` so pictures and answers always agree. Levels steps take `names`, `ph` and `tol` (FX 0.00006 ≈ 0.6 pip; default 0.051 for Gold). Run 5 coming soon. `ORDER`/`nextRun()` drive the entry card ("Start Run N") and the done screen ("Next: Run N"). Run-specific result text lives in the run (`coach(p)`, `name`, `resultTitle`, `endBtn`). Progress `localStorage['bm_prac_v1']` = {v:1, done:{r1:iso}, slips:{r1:n}} (in `BMS.SYNC`). Entry cards: above My strategies on uTrade Ideas (`#bmpr-ut`) and START HERE on the University home (`#bmpr-uni`, MutationObserver, only while `#uni-reset` is on screen). Test: `tests/test_practice.py` |
| `preflight.js` | `window.BMF` — **Daily Pre-Flight** (17 Oct, branch `academy`). 2-minute routine once a SAST day: Today's map (kill zones, day-trade windows, 3 Key Ranges via `UT.sessions()`; no NOW markers at the weekend) → News check (member checks ForexFactory: none / red at HH:MM → no new trades from 1 h before to 30 min after / "not checked" can't continue; skipped at the weekend; **no live news feed — Brahm: add once Blue Mac earns money**) → Fit to trade (4 yes/no → ✈️ cleared / ⚠️ careful / 🛑 grounded, advice only) → Daily Drill (one University lesson via `BMU.card(lid)` from levels ≤ member level + 1, fixed shuffle by SAST day, + 3 questions from its module quiz, options shuffled per day). 🔥 streak: walk back from today — done day +1, weekend not done skipped, today not done skipped, missed weekday stops. Reopen same day = summary (review). Stored `localStorage['bm_flight_v1']` = {v:1, days:{'YYYY-MM-DD':{done, news, fit:{a,yes}, drill:{lid,score,of}}}, best} (120 days kept, in `BMS.SYNC`). Cards: `#bmf-ut` above the practice card on uTrade Ideas, `#bmf-uni` after START HERE on the University home; new SAST day repaints (visibilitychange + 60 s check). Reuses `bmd-*` + `bmpr-*` styles (load after practice.js). Test: `tests/test_preflight.py` (uses Playwright clock) |
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
- **Members use the `revamp` preview link** (bluemac-git-revamp-…vercel.app) until the official launch (Brahm, 17 Oct) — so anything pushed to `revamp` is live for members. Build new features on a feature branch (e.g. `academy`), test on its own preview link, merge into `revamp` only with Brahm's OK. `main` = bluemac.vercel.app (merged 17 Oct at 51035c2).
- **Old Education ticks (17 Oct, for the merge to main):** `university.js` `carryOldEdu()` maps the old live site's `tv_edu_progress`
  ("Mark as Read", keys `lesson-<old card number>`) onto new lesson ids via `OLD_EDU` → `P.done` (never quizzes). Runs at start-up and
  on `BMU.reload()` (so it survives a server copy); Reset progress also removes `tv_edu_progress`. Test: `tests/test_old_edu.py`.
  Live site before the merge is saved as branch `backup-live-17oct`.
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
**Deep inspection (17 Oct):** `tests/crawl_all.py` taps EVERY answer of every question in all 5 styles (218 answers), a personal
strategy using every tool family, every builder tool on/off, all 83 Learn refs, all pages/Rules tabs/Examples filters+search,
all 20 modules · 97 lessons · 20 quizzes, setup guide, style quiz, the 21-step tour — phone + desktop → 0 problems.
`tests/test_css.py` guards stylesheet brace balance (a lost `{` silently kills the NEXT rule — happened on 16 Oct).
`tests/test_save.py` guards Save to Journal (one tap = one trade; failed save says "Not saved").
Lint: ESLint 10 is installed globally at /opt/node22/lib/node_modules/eslint (npm registry unreachable from the workspace).

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
Plan agreed with Brahm: 1. ✅ DNA picker (`dna.js`, later removed 17 Oct — superseded by the builder) 2. ✅ Concept blocks → **expanded into the Strategy Toolbox** (43 tools, 4 layers) (OB, FVG, sweep, Key Range first) — split the strategy
files into blocks with their own questions/levels/score weight 3. Quick Idea flow (4–6 questions from the member's DNA, same engine
prices + R:R rules) 4. "Upgrade to A+ — full analysis" bridge 5. Later: price feed / chart screenshots. Old 5 styles stay as full analysis.
**Brahm's vision (16 Oct): members BUILD their own strategy** ("My strategies", up to 3 each, shown by name on uTrade Ideas next to the 5 Blue Mac styles,
can copy a Blue Mac style to tweak). Order: 1 ✅ toolbox → 2 ✅ builder UI (4 layers + rules + name, synced) → 3 ✅ "My strategies" tabs + copy-a-style →
4 personal Rules page + Journal stats per strategy. Hard rules members can never loosen: engine prices, min R:R, E2 inside SL, news / 3-loss blocks.
Why: 16 Oct usage check — 9 members, 0 AI ideas, uTrade drop-off before Generate. Personalised ideas = flag for the FSCA/FAIS check.

## Next up
- Brahm to test the new Blue Mac Key + Key Range layers on the `revamp` preview (phone first) and give feedback.
- Agreed later list (15 Oct review): let members use it 4–6 weeks and log everything → FSCA/FAIS compliance check
  before charging (specific entries/SL/TP may count as advice) → PayFast → password reset (✅ done early) → University progress to
  Supabase (✅ done early via profiles) → manual journal entry button → merge to main. Idea: let the AI check answers against chart screenshots.
- **DNA picker removed (17 Oct, Brahm's call):** `dna.js`, `tests/test_dna.py`, `BMQ.fromDNA` and the builder's "start from my DNA" are gone; profile.js tidies old `bm_dna_v1` copies off devices.
- **17 Oct clean-up done:** all JS + index.html inline script lint clean, no dead globals, all 109 button handlers exist; removed 142 dead CSS rules
  (old Checklist `guided-*`, `take-trade-*`, `qref-*`… — only classes never in code AND never on screen in the full crawl; pixel-compared 16 screens);
  removed `tick_clock` (ran every second on a missing element) + dead `style-accent`/old take-button lookups; `takeThisTrade` now locks Take+Monitor
  while saving (3 fast taps used to save 3 duplicates) and shows "Not saved" on a server error instead of a fake "Saved"; restored the CSS brace lost
  on 16 Oct (Save-button hover lift + style-quiz selected highlight). Supabase: indexes on trade_journal/trades user_id, RLS policies use
  `(select auth.uid())`, `bm_guard_signup` no longer callable via the API (invite-only verified both ways, rolled back).
  Still on Brahm: turn on Leaked Password Protection (Supabase → Auth → Providers/Password security).
- Leftovers for the redesign pass: the manual "log trade" modal
  (`#log-modal`, `confirmLog`) has no opener anymore — decide whether to bring back a manual journal entry button.
- **Redesign pass** (agreed): Examples filter bar now wraps to 2 rows → grouped menu;
  rebuild bias detection on fixed answer codes instead of text matching; overall visual refresh.
- Later: Supabase redirect URLs for preview logins (`https://*-abrahams-projects-2cf14794.vercel.app/**`),
  University progress to Supabase, PayFast + monetisation, then merge `revamp` → `main`.
