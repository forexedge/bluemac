# Blue Mac tests

Headless Chromium (Playwright for Python) against the static site, with a fake Supabase
(`sbstub.js`: session from `window.__TU`, `rpc()` answered by a Python "server").

```
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_profile.py . tests
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/smoke_loggedout.py . tests
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_auth.py . tests
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_ai_limit.py . tests
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_launch.py . tests
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_search.py . tests
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_quick.py . tests [shots_dir]
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_builder.py . tests [shots_dir]
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_coach.py . tests [shots_dir]
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_save.py . tests
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_css.py . tests
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_old_edu.py . tests   # old Education ticks carry over
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_practice.py . tests   # uTrade Practice run 1, phone + desktop
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/crawl_all.py . tests   # deep tap-through, prints PROBLEMS: 0
```

`test_ai_limit.py` covers the daily AI idea counter, the locked buttons and the limit screen.

`test_auth.py` covers the login form on a new device (profile loads before the disclaimer),
"Forgot password?", sign-up/reset emails coming back to the current site, and the "Set a new password" screen.

`test_profile.py` covers the member profile (profile.js): free-list badge, refresh keeps the spot,
new device restores from the server, newest change wins, logout wipes the device,
a second member on a shared device starts clean, the tour still runs for new members,
and the app still opens when Supabase is down. Ends with `RESULT: ALL PASS`.
\n# Edge function (fake Supabase + fake AI, needs TypeScript):\n#   cd tests/fn && node test_trade_idea.mjs ../../supabase/functions/trade-idea/index.ts
