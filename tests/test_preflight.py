"""Daily Pre-Flight (preflight.js): weekday + weekend flows on phone and desktop, news-time validation and the
no-trade window, fit verdicts, Daily Drill scoring, streak maths (weekends never break it, a missed weekday does,
today not done yet doesn't), review mode, profile sync, entry cards, no AI calls. Ends with RESULT: ALL PASS."""
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
D = lambda yes: {'done':'x', 'fit':{'a':[True]*4, 'yes':yes}, 'news':{'k':'none'}, 'drill':None}

with sync_playwright() as pw:
    br = pw.chromium.launch()
    def page(vp, when, hist, uid):
        errors = []; ai = []
        ctx = br.new_context(viewport=vp, is_mobile=vp['width'] < 500, has_touch=vp['width'] < 500); ctx.expose_function('__rpc', rpc)
        def route(r):
            u = r.request.url
            if 'supabase-js' in u: return r.fulfill(status=200, content_type='application/javascript', body=STUB)
            if 'functions/v1' in u: ai.append(u)
            if u.startswith(f'http://127.0.0.1:{PORT}'): return r.continue_()
            return r.abort()
        ctx.route('**/*', route)
        p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
        p.clock.install(time=when)
        p.add_init_script(f"window.__TU={{id:'{uid}',email:'{uid}@x.com'}};localStorage.setItem('tv_disclaimer_accepted','1');localStorage.setItem('tv_quiz_done','1');localStorage.setItem('bm_tour_v1','done');"
                          f"localStorage.setItem('bm_flight_v1', {json.dumps(json.dumps({'v':1,'days':hist,'best':0}))});")
        p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.clock.run_for(8000)
        return ctx, p, errors, ai

    # ── Streak maths (Tue 20 Oct 2026, 09:40 SAST) ──
    TUE = datetime.datetime(2026, 10, 20, 7, 40, tzinfo=UTC)
    ctx, p, errors, ai = page({'width':390, 'height':844}, TUE, {'2026-10-15':D(4), '2026-10-16':D(4), '2026-10-19':D(4)}, 's1')
    check('streak: Thu+Fri+Mon done, weekend skipped, today not done yet → 3', p.evaluate('() => BMF.streak().cur') == 3)
    ctx.close()
    ctx, p, errors, ai = page({'width':390, 'height':844}, TUE, {'2026-10-15':D(4), '2026-10-16':D(4)}, 's2')
    check('streak: Monday missed → 0', p.evaluate('() => BMF.streak().cur') == 0)
    ctx.close()
    ctx, p, errors, ai = page({'width':390, 'height':844}, TUE, {'2026-10-16':D(4), '2026-10-17':D(4), '2026-10-19':D(4)}, 's3')
    check('streak: a done Saturday counts → 3', p.evaluate('() => BMF.streak().cur') == 3)
    ctx.close()

    for mode, vp in [('phone', {'width':390, 'height':844}), ('desktop', {'width':1366, 'height':900})]:
        uid = 'pf_' + mode
        ctx, p, errors, ai = page(vp, TUE, {'2026-10-16':D(4), '2026-10-19':D(4)}, uid)
        check(f'{mode}: SAST date is Tuesday 2026-10-20', p.evaluate('() => BMF._date()') == '2026-10-20')
        order = p.evaluate("() => [...document.getElementById('guided-toggle-bar').parentNode.children].map(e => e.id)")
        check(f'{mode}: Pre-Flight card sits above the practice card and My strategies', order.index('bmf-ut') < order.index('bmpr-ut') < order.index('bm-mystrats'))
        check(f'{mode}: card offers Start + shows the streak', p.evaluate("() => document.getElementById('bmf-ut').textContent.includes('Start Pre-Flight') && document.getElementById('bmf-ut').textContent.includes('🔥 2')"))
        p.evaluate('() => BMF.open()')
        txt = p.evaluate("() => document.querySelector('#bmf-ov .bmd-body').innerText")
        check(f'{mode}: map shows London kill zone 09:00–12:00 SAST and NOW', '09:00–12:00 · NOW' in txt)
        check(f'{mode}: map shows the three Key Ranges', all(x in txt for x in ['Asia Key Range', 'London Key Range', 'New York Key Range']))
        p.evaluate('() => BMF.next()')
        p.evaluate('() => BMF.next()')
        check(f'{mode}: news needs an answer', p.evaluate("() => BMF._st().i === 1 && !!document.querySelector('#bmf-ov .bmpr-fb.no')"))
        p.evaluate("() => { BMF.setNews('later'); BMF.next(); }")
        check(f'{mode}: "Not checked yet" cannot continue', p.evaluate('() => BMF._st().i') == 1)
        p.evaluate("() => BMF.setNews('red')"); p.fill('#bmf-news-t', '2:30'); p.evaluate('() => BMF.next()')
        check(f'{mode}: bad time rejected and kept for fixing', p.evaluate("() => BMF._st().i === 1 && document.getElementById('bmf-news-t').value === '2:30'"))
        p.fill('#bmf-news-t', '14:30'); p.evaluate('() => BMF.next()')
        check(f'{mode}: valid time → Fit step', p.evaluate("() => BMF._st().i") == 2)
        p.evaluate('() => BMF.next()')
        check(f'{mode}: fit needs all four answers', p.evaluate('() => BMF._st().i') == 2)
        p.evaluate('() => { BMF.setFit(0,true); BMF.setFit(1,true); BMF.setFit(2,false); BMF.setFit(3,true); BMF.next(); }')
        d = p.evaluate('() => { const d = BMF._st().drill; return { lid:d.lid, n:d.qs.length, ok:d.qs.every(q => q.o.filter(o => o.ok).length === 1), html:d.html.length } }')
        check(f'{mode}: drill = a real lesson + 3 questions with one right answer each', d['n'] == 3 and d['ok'] and d['html'] > 100)
        check(f'{mode}: drill is the same all day', p.evaluate("() => BMF._drill('2026-10-20').lid") == d['lid'])
        check(f'{mode}: drill changes tomorrow', p.evaluate("() => BMF._drill('2026-10-21').lid") != d['lid'])
        p.evaluate('() => BMF.next()')
        p.evaluate('() => BMF.next()')
        check(f'{mode}: question waits for an answer', p.evaluate('() => BMF._st().i') == 4)
        for qi in range(3):
            right = p.evaluate(f'() => BMF._st().drill.qs[{qi}].o.findIndex(o => o.ok)')
            p.evaluate(f'() => BMF.answer({qi}, {right if qi != 1 else (right + 1) % 4})')
            if qi == 1:
                p.evaluate(f'() => BMF.answer(1, {right})')        # second tap ignored
                check(f'{mode}: an answer cannot be changed', p.evaluate('() => BMF._st().score') == 1)
            p.evaluate('() => BMF.next()')
        rec = p.evaluate('() => BMF.today()')
        check(f'{mode}: saved — red news 14:30 SAST (clock kept with it), fit 3/4, drill 2/3', rec and rec['news'] == {'k':'red', 't':'14:30', 'c':'SAST'} and rec['fit']['yes'] == 3 and rec['drill']['score'] == 2)
        dt = p.evaluate("() => document.querySelector('#bmf-ov .bmd-body').innerText")
        check(f'{mode}: summary: Fly carefully, no new trades 13:30–15:00, 3-day streak', 'Fly carefully' in dt and '13:30–15:00' in dt and '3-day streak' in dt)
        p.evaluate('() => BMF.close()')
        check(f'{mode}: card shows the day\'s plan', p.evaluate("() => { const t = document.getElementById('bmf-ut').textContent; return t.includes('Fly carefully') && t.includes('13:30–15:00') && t.includes('Drill 2/3'); }"))
        p.evaluate('() => BMF.open()')
        check(f'{mode}: reopening the same day shows the summary (no redo)', p.evaluate("() => BMF._st().review && document.querySelector('#bmf-ov .bmd-title').textContent === 'Pre-Flight complete'"))
        p.evaluate('() => BMF.close()')
        p.wait_for_timeout(100); p.clock.run_for(2500); p.wait_for_timeout(200)
        keys = SERVER.get(uid, {}).get('state', {}).get('keys', {})
        check(f'{mode}: Pre-Flight synced to the member profile', 'bm_flight_v1' in keys and '2026-10-20' in json.loads(keys['bm_flight_v1'])['days'])
        p.evaluate("() => goPage('education', document.querySelector(\".nav-item[onclick*=\\\"goPage('education'\\\"]\"))"); p.wait_for_timeout(200)
        kids = p.evaluate("() => [...document.getElementById('uni-root').children].slice(0, 2).map(e => e.id)")
        check(f'{mode}: Education home: START HERE then Pre-Flight', kids == ['bmpr-uni', 'bmf-uni'])
        check(f'{mode}: no sideways scroll', p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'))
        check(f'{mode}: no AI calls', not ai)
        check(f'{mode}: no page errors', not errors)
        if errors: print('\n'.join(errors[:5]))
        # next SAST day while the app stays open → fresh card
        p.clock.fast_forward(24 * 3600 * 1000); p.evaluate("() => document.dispatchEvent(new Event('visibilitychange'))"); p.wait_for_timeout(200)
        check(f'{mode}: next day → card asks for a new Pre-Flight', p.evaluate("() => document.getElementById('bmf-uni').textContent.includes('Start Pre-Flight')"))
        ctx.close()

    # ── Weekend (Sat 17 Oct, 12:00 SAST) ──
    SAT = datetime.datetime(2026, 10, 17, 10, 0, tzinfo=UTC)
    ctx, p, errors, ai = page({'width':390, 'height':844}, SAT, {'2026-10-15':D(4), '2026-10-16':D(4)}, 'pf_we')
    p.evaluate('() => BMF.open()')
    t = p.evaluate("() => document.querySelector('#bmf-ov .bmd-body').innerText")
    check('weekend: closed notice, no NOW markers', 'Weekend' in t and 'NOW' not in t)
    p.evaluate('() => BMF.next()')
    check('weekend: news step skipped', p.evaluate("() => BMF._st().i") == 2)
    check('weekend: 6 steps', 'Step 2 of 6' in p.evaluate("() => document.querySelector('#bmf-ov .bmd-kicker').textContent"))
    p.evaluate('() => { [0,1,2,3].forEach(i => BMF.setFit(i, true)); BMF.next(); BMF.next(); }')
    for qi in range(3):
        right = p.evaluate(f'() => BMF._st().drill.qs[{qi}].o.findIndex(o => o.ok)')
        p.evaluate(f'() => {{ BMF.answer({qi}, {right}); BMF.next(); }}')
    t = p.evaluate("() => document.querySelector('#bmf-ov .bmd-body').innerText")
    check('weekend: cleared, closed markets, perfect drill, streak 3', 'Cleared for take-off' in t and 'Closed (weekend)' in t and '3/3 · perfect' in t and '3-day streak' in t)
    p.evaluate('() => BMF.go(-1)')
    check('weekend: Back from the summary goes to the last question, not the news step', p.evaluate("() => BMF._st().i") == 6)
    check('weekend: no page errors', not errors)
    ctx.close()
    br.close()
print('RESULT: ' + ('ALL PASS' if not fails else f'{len(fails)} FAIL'))
