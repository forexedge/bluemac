"""Chart clock (utrade.js UT.clock): every session time follows the clock the member's chart uses.
SAST (default) · MT5 / broker time (New York + 7 h → GMT+3 in US summer, GMT+2 in US winter) · the device's own zone.
Checks the maths on 4 dates (US+UK summer, US+UK winter, the March weeks when only the US has moved, the
autumn week when only the UK has moved back), the live boxes + chip on Key / Scalp / Day / toolbox session
questions, the picker, Pre-Flight, News Ready, the AI prompt, sync, phone + desktop, no page errors. Ends with RESULT: ALL PASS."""
import json, sys, time, threading, functools, http.server, socketserver, datetime
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; HERE = sys.argv[2]
STUB = open(HERE + '/sbstub.js').read()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
PORT = srv.server_address[1]; URL = f'http://127.0.0.1:{PORT}/index.html'
SERVER = {}
def rpc(name, args, uid):
    a = json.loads(args)
    if name == 'bm_load': r = SERVER.get(uid, {}); return json.dumps({'data':{'comp':True, 'tier':'free', 'state': r.get('state', {}), 'ts': r.get('ts')}, 'error':None})
    if name == 'bm_save_state': SERVER[uid] = {'state': a['s'], 'ts': time.time()}; return json.dumps({'data':'now', 'error':None})
    if name == 'bm_ideas_left': return json.dumps({'data':{'left':2, 'limit':2}, 'error':None})
    return json.dumps({'data':None, 'error':None})
fails = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)
UTC = datetime.timezone.utc

with sync_playwright() as pw:
    br = pw.chromium.launch()
    def page(vp, when, uid, clock=None, tz=None):
        errors = []
        kw = dict(viewport=vp, is_mobile=vp['width'] < 500, has_touch=vp['width'] < 500)
        if tz: kw['timezone_id'] = tz
        ctx = br.new_context(**kw); ctx.expose_function('__rpc', rpc)
        def route(r):
            u = r.request.url
            if 'supabase-js' in u: return r.fulfill(status=200, content_type='application/javascript', body=STUB)
            if u.startswith(f'http://127.0.0.1:{PORT}'): return r.continue_()
            return r.abort()
        ctx.route('**/*', route)
        p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
        p.clock.install(time=when)
        init = f"window.__TU={{id:'{uid}',email:'{uid}@x.com'}};localStorage.setItem('tv_disclaimer_accepted','1');localStorage.setItem('tv_quiz_done','1');localStorage.setItem('bm_tour_v1','done');"
        if clock: init += f"localStorage.setItem('bm_clock_v1', {json.dumps(json.dumps({'v':1,'m':clock}))});"
        p.add_init_script(init)
        p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.clock.run_for(8000)
        return ctx, p, errors
    S = '() => { const s = UT.sessions(); return { asia: s.hm(s.key.asia.open), lon: s.hm(s.key.london.open), ny: s.hm(s.key.ny.open), kz: s.fmt(s.lo), now: s.nowTxt, clk: s.clk }; }'

    # ── the maths: [label, UTC moment, {clock: (asia, london, ny, now)}] ──
    CASES = [
        ('Tue 20 Oct 2026 (US + UK summer)', datetime.datetime(2026, 10, 20, 7, 40, tzinfo=UTC),
         {'sast': ('02:00', '09:00', '15:30', '09:40'), 'broker': ('03:00', '10:00', '16:30', '10:40')}),
        ('Tue 8 Dec 2026 (US + UK winter)', datetime.datetime(2026, 12, 8, 7, 40, tzinfo=UTC),
         {'sast': ('02:00', '10:00', '16:30', '09:40'), 'broker': ('02:00', '10:00', '16:30', '09:40')}),
        ('Mon 22 Mar 2027 (US summer, UK still winter)', datetime.datetime(2027, 3, 22, 7, 40, tzinfo=UTC),
         {'sast': ('02:00', '10:00', '15:30', '09:40'), 'broker': ('03:00', '11:00', '16:30', '10:40')}),
        ('Mon 26 Oct 2026 (UK winter, US still summer)', datetime.datetime(2026, 10, 26, 7, 40, tzinfo=UTC),
         {'sast': ('02:00', '10:00', '15:30', '09:40'), 'broker': ('03:00', '11:00', '16:30', '10:40')}),
    ]
    for label, when, exp in CASES:
        for clock, (asia, lon, ny, now) in exp.items():
            ctx, p, errors = page({'width':390, 'height':844}, when, 'm_' + clock, clock)
            r = p.evaluate(S)
            check(f'{label} · {clock}: Asia {asia} London {lon} NY {ny} now {now}', (r['asia'], r['lon'], r['ny'], r['now']) == (asia, lon, ny, now))
            ctx.close()

    # ── own time zone: a member in London / Sydney ──
    ctx, p, errors = page({'width':390, 'height':844}, CASES[0][1], 'm_lon', 'local', 'Europe/London')
    r = p.evaluate(S)
    check('local (London device, 20 Oct): London Key Range at 08:00 your time, NY 14:30, now 08:40', (r['lon'], r['ny'], r['now'], r['clk']) == ('08:00', '14:30', '08:40', 'your time'))
    ctx.close()
    ctx, p, errors = page({'width':390, 'height':844}, CASES[1][1], 'm_syd', 'local', 'Australia/Sydney')
    r = p.evaluate(S)
    check('local (Sydney device, 8 Dec, AEDT): Asia 11:00, London 19:00, now 18:40', (r['asia'], r['lon'], r['now']) == ('11:00', '19:00', '18:40'))
    ctx.close()

    # ── the screens ──
    TUE = CASES[0][1]
    for mode, vp in [('phone', {'width':390, 'height':844}), ('desktop', {'width':1366, 'height':900})]:
        ctx, p, errors = page(vp, TUE, 'scr_' + mode)
        check(f'{mode}: default clock = SAST', p.evaluate('() => UT.clock.mode()') == 'sast')
        # Key → session question
        p.evaluate("() => { goPage('checklist', document.querySelector('.nav-item[onclick*=checklist]')); setStyle('key', document.querySelector('.style-tab.key')); if(UT.knowReady) UT.knowReady(); UT.pick('instrument','XAUUSD'); }")
        p.clock.run_for(500)
        live = p.evaluate("() => (document.querySelector('#guided-panel .ut-live') || {}).innerText || ''")
        check(f'{mode}: Key live box in SAST + the "chart on MT5?" ask chip', 'london · opens 09:00' in live.lower() and 'times in sast' in live.lower() and 'chart on mt5' in live.lower())
        subs = p.evaluate("() => [...document.querySelectorAll('#guided-panel .ut-opt-s')].map(e => e.textContent).join(' | ')")
        check(f'{mode}: Key option says "Opens 09:00 SAST"', 'Opens 09:00 SAST' in subs)
        p.click('#guided-panel .ut-clk')
        check(f'{mode}: picker opens with 3 clocks, SAST ticked', p.evaluate("() => document.querySelectorAll('#ut-learn.on .ut-clk-o').length === 3 && document.querySelector('#ut-learn .ut-clk-o.on').textContent.includes('SAST')"))
        nows = p.evaluate("() => [...document.querySelectorAll('#ut-learn .ut-clk-n b')].map(b => b.textContent)")
        check(f'{mode}: picker shows the time now on each clock (MT5 10:40 · SAST 09:40)', nows[:2] == ['10:40', '09:40'])
        p.click('#ut-learn .ut-clk-o >> nth=0')       # MT5 / broker time
        check(f'{mode}: MT5 saved', json.loads(p.evaluate("() => localStorage.getItem('bm_clock_v1')"))['m'] == 'broker')
        check(f'{mode}: picker example now "London open is 10:00 MT5 time (= 09:00 SAST)"', '10:00 MT5 time (= 09:00 SAST)' in p.evaluate("() => document.querySelector('#ut-learn .ut-clk-ex').textContent"))
        p.click('#ut-learn .ut-learn-btn')
        check(f'{mode}: picker closes', p.evaluate("() => !document.querySelector('#ut-learn.on')"))
        live = p.evaluate("() => document.querySelector('#guided-panel .ut-live').innerText").replace('\n', ' ')
        check(f'{mode}: Key live box redrawn in MT5 time (London 10:00) with a plain change chip', 'london · opens 10:00' in live.lower() and 'mt5 time · change' in live.lower())
        subs = p.evaluate("() => [...document.querySelectorAll('#guided-panel .ut-opt-s')].map(e => e.textContent).join(' | ')")
        check(f'{mode}: Key options now "Opens 03:00 / 10:00 / 16:30 MT5 time"', all(f'Opens {t} MT5 time' in subs for t in ['03:00', '10:00', '16:30']))
        check(f'{mode}: session help names the clock', 'MT5 time' in p.evaluate("() => document.querySelector('#guided-panel .ut-help').innerText"))
        # Scalp + Day session questions (tf label = the clock, kill zones shifted)
        for st, txt in [('scalp', 'London KZ'), ('day', 'London')]:
            p.evaluate(f"() => {{ setStyle('{st}', document.querySelector('.style-tab.{st}')); if(UT.knowReady) UT.knowReady(); if(document.querySelector('#guided-panel .ut-inst')) UT.pick('instrument','XAUUSD'); }}")
            p.clock.run_for(300)
            card = p.evaluate("() => document.querySelector('#guided-panel').innerText").replace('\n', ' ')
            check(f'{mode}: {st} session question on MT5 time (tf label + now 10:40 + chip)', 'MT5 time' in card and '10:40' in card and 'change' in card)
        kz = p.evaluate("() => UT.sessions().fmt(UT.sessions().lo)")
        check(f'{mode}: London kill zone in MT5 time = 10:00–13:00', kz == '10:00–13:00')
        # AI prompt carries the clock name
        prompt = p.evaluate("() => UT.def('key').prompt({ instrument:'XAUUSD', session:UT.sessions(), bias:'BULLISH', score:80, grade:'A', status:'x', answers:'', levels:'', gates:'', warns:'', longPlan:'', shortPlan:'' })")
        check(f'{mode}: Key AI prompt says "Time now: 10:40 MT5 time"', 'Time now: 10:40 MT5 time' in prompt)
        # Pre-Flight
        p.evaluate('() => BMF.open()')
        txt = p.evaluate("() => document.querySelector('#bmf-ov .bmd-body').innerText")
        check(f'{mode}: Pre-Flight map in MT5 time (kill zone 10:00–13:00 · NOW)', 'today in mt5 time' in txt.lower() and '10:00–13:00 · NOW' in txt and 'MT5 time right now' in txt)
        p.evaluate('() => BMF.next()')
        txt = p.evaluate("() => document.querySelector('#bmf-ov .bmd-body').innerText")
        check(f'{mode}: Pre-Flight news tells MT5 members to add 1 h', 'add 1 h to get MT5 time today' in txt)
        p.evaluate("() => BMF.setNews('red')")
        check(f'{mode}: news time label names the clock', 'time of the red news (mt5 time)' in p.evaluate("() => document.querySelector('#bmf-ov .bmd-body').innerText").lower())
        # change the clock while Pre-Flight is open → it redraws, page stays locked behind it
        p.evaluate("() => UT.clockPick()"); p.click('#ut-learn .ut-clk-o >> nth=1'); p.click('#ut-learn .ut-learn-btn')
        check(f'{mode}: back to SAST redraws the open Pre-Flight', 'time of the red news (sast)' in p.evaluate("() => document.querySelector('#bmf-ov .bmd-body').innerText").lower())
        check(f'{mode}: page still locked behind Pre-Flight after the picker closes', p.evaluate("() => document.body.style.overflow") == 'hidden')
        p.evaluate('() => BMF.close()')
        # News Ready lesson times
        p.evaluate("() => { UT.setClock('broker'); UT.closeLearn(); BMN.open(); BMN.lesson(1); }")
        txt = p.evaluate("() => document.querySelector('#bmn-ov, .bmd-ov.on').innerText")
        check(f'{mode}: News Ready NFP time = 15:30 MT5 time', '08:30 New York = 15:30 MT5 time' in txt)
        p.evaluate('() => BMN.close()')
        check(f'{mode}: clock is synced with the profile', p.evaluate("() => BMS.SYNC ? BMS.SYNC.includes('bm_clock_v1') : true"))
        check(f'{mode}: no page errors', not errors)
        if errors: print(errors[:3])
        ctx.close()

    # ── sync: the choice follows the member to a new device ──
    ctx, p, errors = page({'width':390, 'height':844}, TUE, 'sync1')
    p.evaluate("() => UT.setClock('broker')"); p.clock.run_for(3000)
    ctx.close()
    ctx, p, errors = page({'width':390, 'height':844}, TUE, 'sync1')
    check('new device: MT5 clock restored from the profile', p.evaluate('() => UT.clock.mode()') == 'broker' and p.evaluate(S)['lon'] == '10:00')
    ctx.close()
    br.close()
print('RESULT: ' + ('ALL PASS' if not fails else f'{len(fails)} FAIL'))
