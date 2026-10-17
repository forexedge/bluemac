"""News Ready track (news.js): live SAST release times across every daylight-saving combination, the 8 lessons
with 2 checks each, the exam lock, pass (80%) / fail / retake, certificate, profile sync, the University card and
the Daily Pre-Flight link, phone + desktop, no page errors. Ends with RESULT: ALL PASS."""
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
    return json.dumps({'data':None, 'error':{'message':'?'}})
fails = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)
UTC = datetime.timezone.utc

with sync_playwright() as pw:
    br = pw.chromium.launch()
    def page(vp, uid, when=None):
        errors = []
        ctx = br.new_context(viewport=vp, is_mobile=vp['width'] < 500, has_touch=vp['width'] < 500); ctx.expose_function('__rpc', rpc)
        ctx.route('**/*', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB) if 'supabase-js' in r.request.url else (r.continue_() if r.request.url.startswith(f'http://127.0.0.1:{PORT}') else r.abort()))
        p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
        if when: p.clock.install(time=when)
        p.add_init_script(f"window.__TU={{id:'{uid}',email:'{uid}@x.com'}};localStorage.setItem('tv_disclaimer_accepted','1');localStorage.setItem('tv_quiz_done','1');localStorage.setItem('bm_tour_v1','done');")
        p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000)
        if when: p.clock.run_for(8000)
        else: p.wait_for_timeout(1200)
        return ctx, p, errors

    # ── Release times in SAST: NY 08:30 · NY 10:00 · NY 14:00 · Frankfurt 14:15 · London 12:00 · Tokyo 12:00 ──
    CASES = { '2026-10-20':['14:30','16:00','20:00','14:15','13:00','05:00'],   # everyone on summer time
              '2026-10-28':['14:30','16:00','20:00','15:15','14:00','05:00'],   # Europe back on winter time, US still summer
              '2026-12-01':['15:30','17:00','21:00','15:15','14:00','05:00'],   # everyone on winter time
              '2026-03-10':['14:30','16:00','20:00','15:15','14:00','05:00'],   # US summer time already, Europe not yet
              '2026-04-15':['14:30','16:00','20:00','14:15','13:00','05:00'] }
    for day, exp in CASES.items():
        y, m, d = map(int, day.split('-'))
        ctx, p, errors = page({'width':390, 'height':844}, 'tz', datetime.datetime(y, m, d, 9, 0, tzinfo=UTC))
        got = p.evaluate("() => [BMN._sast('America/New_York',8,30), BMN._sast('America/New_York',10,0), BMN._sast('America/New_York',14,0), BMN._sast('Europe/Berlin',14,15), BMN._sast('Europe/London',12,0), BMN._sast('Asia/Tokyo',12,0)]")
        check(f'times {day}: {got}', got == exp)
        if day == '2026-12-01':
            p.evaluate("() => BMN.lesson(3)")
            t = p.evaluate("() => document.querySelector('#bmn-ov .bmd-body').innerText")
            check('FOMC lesson shows 21:00 / 21:30 SAST in December', '21:00 SAST' in t and '21:30 SAST' in t)
        ctx.close()

    for mode, vp in [('phone', {'width':390, 'height':844}), ('desktop', {'width':1366, 'height':900})]:
        uid = 'news_' + mode
        ctx, p, errors = page(vp, uid)
        p.evaluate("() => goPage('education', document.querySelector(\".nav-item[onclick*=\\\"goPage('education'\\\"]\"))"); p.wait_for_timeout(300)
        kids = p.evaluate("() => [...document.getElementById('uni-root').children].slice(0, 3).map(e => e.id)")
        check(f'{mode}: University home order: START HERE, Pre-Flight, News Ready', kids == ['bmpr-uni', 'bmf-uni', 'bmn-uni'])
        p.evaluate("() => BMN.open()")
        check(f'{mode}: 8 lessons listed, exam locked', p.evaluate("() => document.querySelectorAll('.bmn-row').length === 8 && !!document.querySelector('.bmn-exam.locked')"))
        p.evaluate("() => BMN.exam()")
        check(f'{mode}: exam cannot start before all lessons are read', p.evaluate("() => BMN._st().view === 'home'"))
        for i in range(8):
            p.evaluate(f"() => BMN.lesson({i})")
            check(f'{mode}: lesson {i+1} has a body and 2 checks with one right answer each', p.evaluate("() => document.querySelector('.bmn-body').textContent.length > 300 && BMN._st().qs.length === 2 && BMN._st().qs.every(q => q.o.filter(o => o.ok).length === 1)"))
            for k in range(2):
                r = p.evaluate(f"() => BMN._st().qs[{k}].o.findIndex(o => o.ok)")
                p.evaluate(f"() => BMN.answer({k}, {r if k == 0 else (r + 1) % 4})")
            p.evaluate(f"() => BMN.answer(1, 0)")   # changing an answer is ignored
            check(f'{mode}: lesson {i+1} saved as read, checks 1/2', p.evaluate(f"() => {{ const s = BMN.status(); return !!s.read['n{i+1}'] && JSON.stringify(s.checks['n{i+1}']) === '[true,false]'; }}"))
        p.evaluate("() => BMN.home()")
        check(f'{mode}: exam unlocked after 8 lessons', p.evaluate("() => !document.querySelector('.bmn-exam.locked') && !!document.querySelector('.bmn-exam .ut-next')"))
        # fail first (6/10)
        p.evaluate("() => BMN.exam()")
        qs1 = p.evaluate("() => BMN._st().ex.qs.map(q => q.q)")
        check(f'{mode}: exam has 10 different questions', len(qs1) == 10 and len(set(qs1)) == 10)
        for q in range(10):
            r = p.evaluate("() => BMN._st().ex.qs[BMN._st().ex.i].o.findIndex(o => o.ok)")
            p.evaluate(f"() => {{ BMN.exAnswer({r if q < 6 else (r + 1) % 4}); BMN.exNext(); }}")
        check(f'{mode}: 60% = not passed, retake offered', p.evaluate("() => BMN._st().view === 'result' && !BMN._st().ok && !BMN.status().exam.passed && document.querySelector('#bmn-ov').textContent.includes('Try again')"))
        # pass (8/10 exactly — the pass mark)
        p.evaluate("() => BMN.exam()")
        for q in range(10):
            r = p.evaluate("() => BMN._st().ex.qs[BMN._st().ex.i].o.findIndex(o => o.ok)")
            p.evaluate(f"() => {{ BMN.exAnswer({r if q < 8 else (r + 1) % 4}); BMN.exNext(); }}")
        s = p.evaluate("() => BMN.status().exam")
        check(f'{mode}: 80% = passed, best 80%, 2 tries', s['passed'] and abs(s['best'] - 0.8) < 1e-9 and s['tries'] == 2)
        p.evaluate("() => BMN.cert()")
        ct = p.evaluate("() => document.querySelector('#bmn-ov .bmd-body').innerText")
        check(f'{mode}: certificate shows the member name and score', 'News Ready' in ct and f'{uid}' in ct and '80%' in ct)
        # a later lower score never takes the certificate away
        p.evaluate("() => BMN.exam()")
        for q in range(10):
            p.evaluate("() => { const ex = BMN._st().ex, q = ex.qs[ex.i]; BMN.exAnswer(q.o.findIndex(o => !o.ok)); BMN.exNext(); }")
        check(f'{mode}: a later 0% keeps the pass and the best score', p.evaluate("() => { const e = BMN.status().exam; return e.passed && Math.abs(e.best - 0.8) < 1e-9 && e.last === 0; }"))
        p.evaluate("() => BMN.close()"); p.wait_for_timeout(2200)
        check(f'{mode}: University card shows certified', p.evaluate("() => document.getElementById('bmn-uni').textContent.includes('News Ready · certified')"))
        keys = SERVER.get(uid, {}).get('state', {}).get('keys', {})
        check(f'{mode}: News Ready progress synced to the profile', 'bm_news_v1' in keys and json.loads(keys['bm_news_v1'])['exam']['passed'])
        # Daily Pre-Flight → news step → link opens the track
        p.evaluate("() => { BMF.open(); BMF.next(); }")
        if p.evaluate("() => BMF._st().i") == 1:
            check(f'{mode}: Pre-Flight news step links to the track', p.evaluate("() => !!document.querySelector('.bmf-learn')"))
            p.evaluate("() => document.querySelector('.bmf-learn').click()")
            check(f'{mode}: the link closes Pre-Flight and opens News Ready', p.evaluate("() => !document.querySelector('#bmf-ov.on') && !!document.querySelector('#bmn-ov.on')"))
            p.evaluate("() => BMN.close()")
        else:
            print('INFO weekend today — Pre-Flight skips the news step, link check skipped')
            p.evaluate("() => BMF.close()")
        check(f'{mode}: no sideways scroll', p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'))
        check(f'{mode}: no page errors', not errors)
        if errors: print('\n'.join(errors[:5]))
        ctx.close()

    # the Pre-Flight link on a weekday (fixed clock)
    ctx, p, errors = page({'width':390, 'height':844}, 'pfl', datetime.datetime(2026, 10, 20, 7, 40, tzinfo=UTC))
    p.evaluate("() => { BMF.open(); BMF.next(); }"); p.clock.run_for(1000)
    check('weekday: Pre-Flight news step has the News Ready link', p.evaluate("() => BMF._st().i === 1 && !!document.querySelector('.bmf-learn')"))
    p.evaluate("() => document.querySelector('.bmf-learn').click()")
    check('weekday: link opens the track', p.evaluate("() => !!document.querySelector('#bmn-ov.on') && !document.querySelector('#bmf-ov.on')"))
    check('weekday: no page errors', not errors)
    ctx.close()
    br.close()
print('RESULT: ' + ('ALL PASS' if not fails else f'{len(fails)} FAIL'))
