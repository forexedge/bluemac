"""uTrade Practice (practice.js): Run 1 end to end on phone + desktop — wrong answers get feedback,
'Show me' reveals, levels check + 'Fill them in for me', the REAL engine builds an A+ long with the
risk rules (E2 inside SL, TP1 ≥ 1:2 net), no AI call, progress saved + synced, member's own idea untouched,
entry cards on uTrade Ideas + Education home. Ends with RESULT: ALL PASS."""
import json, sys, time, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; HERE = sys.argv[2]
STUB = open(HERE + '/sbstub.js').read()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
PORT = srv.server_address[1]; URL = f'http://127.0.0.1:{PORT}/index.html'
SERVER = {}; CALLS = []
def rpc(name, args, uid):
    CALLS.append(name); a = json.loads(args)
    if name == 'bm_load': r = SERVER.get(uid, {}); return json.dumps({'data':{'comp':True, 'tier':'free', 'state': r.get('state', {}), 'ts': r.get('ts')}, 'error':None})
    if name == 'bm_save_state': SERVER[uid] = {'state': a['s'], 'ts': time.time()}; return json.dumps({'data':'now', 'error':None})
    return json.dumps({'data':None, 'error':{'message':'?'}})
fails = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)

with sync_playwright() as pw:
    br = pw.chromium.launch()
    for mode, vp in [('phone', {'width':390, 'height':844}), ('desktop', {'width':1366, 'height':900})]:
        errors = []; fetches = []
        ctx = br.new_context(viewport=vp, is_mobile=mode == 'phone', has_touch=mode == 'phone'); ctx.expose_function('__rpc', rpc)
        def route(r):
            u = r.request.url
            if 'supabase-js' in u: return r.fulfill(status=200, content_type='application/javascript', body=STUB)
            if 'functions/v1' in u: fetches.append(u)
            if u.startswith(f'http://127.0.0.1:{PORT}'): return r.continue_()
            return r.abort()
        ctx.route('**/*', route)
        p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
        uid = 'prac_' + mode
        p.add_init_script(f"window.__TU={{id:'{uid}',email:'{uid}@x.com'}};localStorage.setItem('tv_disclaimer_accepted','1');localStorage.setItem('tv_quiz_done','1');localStorage.setItem('bm_tour_v1','done')")
        p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(800)
        p.evaluate("() => { setStyle('scalp', document.querySelector('.style-tab.scalp')); UT.pick('instrument','EURUSD'); }")
        before = p.evaluate("() => JSON.stringify({s:S.style, a:UT._st.ans, step:UT._st.step})")
        check(f'{mode}: practice card on uTrade Ideas', p.evaluate("() => !!document.querySelector('#bmpr-ut .ut-next')"))
        p.evaluate("() => BMPR.open('r1')"); p.evaluate("() => BMPR.next()")
        steps = p.evaluate("() => BMPR.RUNS.r1.steps.map(s => [s.q, s.ans])")
        # wrong answer → feedback, no progress; 2 wrongs → Show me
        q0, a0 = steps[3]
        wrong = p.evaluate(f"() => UT.def('day').questions.find(x => x.id === '{q0}').options.map(o => o.v).filter(v => v !== '{a0}')")
        for q, a in steps[:3]: p.evaluate(f"() => {{ BMPR.pick('{a}'); BMPR.next(); }}")
        p.evaluate(f"() => BMPR.pick('{wrong[0]}')")
        check(f'{mode}: wrong answer shows ❌ feedback and blocks Next', p.evaluate("() => !!document.querySelector('.bmpr-fb.no') && !BMPR._st().solved"))
        check(f'{mode}: hint appears after a slip', p.evaluate("() => !!document.querySelector('.bmpr-hint')"))
        p.evaluate(f"() => BMPR.pick('{wrong[1]}')")
        check(f'{mode}: "Show me" after 2 slips', p.evaluate("() => [...document.querySelectorAll('.bmd-foot button')].some(b => b.textContent.includes('Show me'))"))
        p.evaluate("() => BMPR.reveal()")
        check(f'{mode}: reveal marks the right answer', p.evaluate("() => BMPR._st().solved && !!document.querySelector('.bmpr-right')"))
        p.evaluate("() => BMPR.next()")
        for q, a in steps[4:]:
            if q == 'levels':
                p.evaluate("() => BMPR.checkLevels()")
                check(f'{mode}: empty levels flagged', p.evaluate("() => document.querySelectorAll('.bmpr-lv .ut-lv-f.bad').length === 6"))
                p.evaluate("() => BMPR.checkLevels(true)")
                check(f'{mode}: "Fill them in for me" fills only required boxes', p.evaluate("() => BMPR._st().solved && !document.getElementById('bmpr-lv-kr_hi').value"))
            elif isinstance(a, list):
                p.evaluate("() => { BMPR.toggle('dxy'); BMPR.check(); }")
                check(f'{mode}: ticking what is not on the chart is caught', p.evaluate("() => !BMPR._st().solved"))
                p.evaluate("() => { BMPR.toggle('dxy'); BMPR.toggle('pdhl'); BMPR.check(); }")
            else:
                p.evaluate(f"() => BMPR.pick('{a}')")
            check(f'{mode}: {q} solved', p.evaluate("() => BMPR._st().solved"))
            p.evaluate("() => BMPR.next()")
        txt = p.evaluate("() => document.querySelector('#bmpr-ov .bmd-body').innerText")
        r = p.evaluate("""() => { const s = BMPR._st(), lv = {}; Object.keys(s.lv).forEach(k => { if(s.lv[k] !== '') lv[k] = s.lv[k]; });
                 const x = UT.simulate('day', s.ans, lv); return { g:x.ev.grade, b:x.ev.bias, blocked:x.ev.blocked, waiting:x.ev.waiting, e1:x.p.e1, e2:x.p.e2, sl:x.p.sl, rr1:+x.p.rr1, rr2:+x.p.rr2 }; }""")
        check(f'{mode}: real engine → A+ LONG, not blocked or waiting', r['g'] == 'A+' and r['b'] == 1 and not r['blocked'] and not r['waiting'] and 'A+ Setup' in txt)
        check(f'{mode}: risk rules hold (E2 between E1 and SL, TP1 ≥ 1:2, TP2 ≥ 1:3)', r['sl'] < r['e2'] <= r['e1'] and r['rr1'] >= 2 and r['rr2'] >= 3)
        check(f'{mode}: no AI call during practice', not fetches)
        check(f'{mode}: member\'s own uTrade idea untouched', p.evaluate("() => JSON.stringify({s:S.style, a:UT._st.ans, step:UT._st.step})") == before)
        p.evaluate("() => BMPR.finish()")
        check(f'{mode}: progress saved', p.evaluate("() => !!BMPR.status().done.r1"))
        p.wait_for_timeout(2200)
        keys = SERVER.get(uid, {}).get('state', {}).get('keys', {})
        check(f'{mode}: progress synced to the member profile', 'bm_prac_v1' in keys and 'r1' in json.loads(keys['bm_prac_v1'])['done'])
        check(f'{mode}: no sideways scroll in the panel', p.evaluate("() => { const b = document.querySelector('#bmpr-ov .bmd-box'); return b.scrollWidth <= b.clientWidth + 1; }"))
        p.evaluate("() => BMPR.goReal()")
        check(f'{mode}: "Try a real idea" lands on uTrade Day Trade', p.evaluate("() => S.style === 'day' && document.querySelector('.page.on').id === 'pg-checklist'"))
        check(f'{mode}: uTrade card now shows certified', p.evaluate("() => document.getElementById('bmpr-ut').textContent.includes('uTrade Certified · 1/5')"))
        p.evaluate("() => goPage('education', document.querySelector(\".nav-item[onclick*=\\\"goPage('education'\\\"]\"))"); p.wait_for_timeout(300)
        check(f'{mode}: START HERE card on the University home', p.evaluate("() => !!document.querySelector('#bmpr-uni .bmpr-start')"))
        p.evaluate("() => BMU.module(BMU.MODULES[0].id)"); p.wait_for_timeout(200)
        check(f'{mode}: card hides inside a module', p.evaluate("() => !document.getElementById('bmpr-uni')"))
        p.evaluate("() => BMU.home()"); p.wait_for_timeout(200)
        check(f'{mode}: card back on the home', p.evaluate("() => !!document.getElementById('bmpr-uni')"))
        check(f'{mode}: no page errors', not errors)
        if errors: print('\n'.join(errors[:5]))
        ctx.close()
    br.close()
print('RESULT: ' + ('ALL PASS' if not fails else f'{len(fails)} FAIL'))
