# Blue Mac tests

Headless Chromium (Playwright for Python) against the static site, with a fake Supabase
(`sbstub.js`: session from `window.__TU`, `rpc()` answered by a Python "server").

```
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_profile.py . tests
PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/smoke_loggedout.py . tests
```

`test_profile.py` covers the member profile (profile.js): free-list badge, refresh keeps the spot,
new device restores from the server, newest change wins, logout wipes the device,
a second member on a shared device starts clean, the tour still runs for new members,
and the app still opens when Supabase is down. Ends with `RESULT: ALL PASS`.
