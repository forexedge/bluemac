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
        check(f'{mode}: uTrade card now offers Run 2', p.evaluate("() => { const t = document.getElementById('bmpr-ut').textContent; return t.includes('uTrade Certified · 1/5') && t.includes('Start Run 2'); }"))
        p.evaluate("() => goPage('education', document.querySelector(\".nav-item[onclick*=\\\"goPage('education'\\\"]\"))"); p.wait_for_timeout(300)
        check(f'{mode}: START HERE card on the University home', p.evaluate("() => !!document.querySelector('#bmpr-uni .bmpr-start')"))
        p.evaluate("() => BMU.module(BMU.MODULES[0].id)"); p.wait_for_timeout(200)
        check(f'{mode}: card hides inside a module', p.evaluate("() => !document.getElementById('bmpr-uni')"))
        p.evaluate("() => BMU.home()"); p.wait_for_timeout(200)
        check(f'{mode}: card back on the home', p.evaluate("() => !!document.getElementById('bmpr-uni')"))
        # ── Run 2 · Spot the trap ──
        before2 = p.evaluate("() => JSON.stringify({s:S.style, a:UT._st.ans, step:UT._st.step})")
        p.evaluate("() => BMPR.open('r2')")
        check(f'{mode}: run 2 presets the safety gates', p.evaluate("() => { const a = BMPR._st().ans; return a.session === 'london' && a.news === 'clear' && a.discipline === 'fresh' && a.instrument === 'EURUSD'; }"))
        p.evaluate("() => BMPR.next()")
        steps2 = p.evaluate("() => BMPR.RUNS.r2.steps.map(s => [s.q || 'call', s.ans])")
        for q, a in steps2:
            if q == 'call':
                check(f'{mode}: "Your call" step shows 3 choices', p.evaluate("() => document.querySelectorAll('.bmpr-opts .ut-opt').length") == 3)
                p.evaluate("() => BMPR.pick('buy')")
                check(f'{mode}: BUY is called the trap', p.evaluate("() => !BMPR._st().solved && document.querySelector('.bmpr-fb.no').textContent.includes('trap')"))
                p.evaluate("() => BMPR.pick('sell')")
                check(f'{mode}: SELL = right direction, wrong time', p.evaluate("() => document.querySelector('.bmpr-fb.no').textContent.includes('wrong time')"))
                p.evaluate("() => BMPR.pick('wait')")
                check(f'{mode}: the call is not stored as a uTrade answer', p.evaluate("() => !('call' in BMPR._st().ans) && !('undefined' in BMPR._st().ans)"))
            else:
                p.evaluate(f"() => BMPR.pick('{a}')")
            check(f'{mode}: run 2 {q} solved', p.evaluate("() => BMPR._st().solved"))
            p.evaluate("() => BMPR.next()")
        t2 = p.evaluate("() => document.querySelector('#bmpr-ov .bmd-body').innerText")
        v = p.evaluate("() => { const s = BMPR._st(); const x = UT.simulate('day', s.ans, {}); return { b:x.ev.bias, w:x.ev.waiting, weak:x.ev.tooWeak, bl:x.ev.blocked, n:x.ev.gates.filter(g => g.type === 'wait').length }; }")
        check(f'{mode}: real engine → bearish bias, 3 wait gates, below standard, not a hard block', v == {'b':-1, 'w':True, 'weak':True, 'bl':False, 'n':3})
        check(f'{mode}: result screen matches the engine', 'BELOW BLUE MAC STANDARD' in t2.upper() and "WON'T BUILD THIS TRADE" in t2.upper() and t2.count('⏳') >= 3 and 'WHAT HAS TO HAPPEN BEFORE YOU SELL' in t2.upper())   # headings are upper-cased by CSS
        check(f'{mode}: no price plan shown for a no-trade', 'Entry 1' not in t2)
        p.evaluate("() => BMPR.finish()")
        check(f'{mode}: run 2 saved, certified 2/5', p.evaluate("() => { const s = BMPR.status(); return !!s.done.r2 && document.querySelector('#bmpr-ov').textContent.includes('uTrade Certified · 2/5'); }"))
        check(f'{mode}: done screen offers Run 3', p.evaluate("() => document.querySelector('#bmpr-ov .bmd-foot').textContent.includes('Next: Run 3')"))
        p.evaluate("() => BMPR.close()")
        check(f'{mode}: card shows 2/5 + Start Run 3', p.evaluate("() => { const t = document.getElementById('bmpr-ut').textContent; return t.includes('2/5') && t.includes('Start Run 3'); }"))
        check(f'{mode}: member\'s own idea still untouched after run 2', p.evaluate("() => JSON.stringify({s:S.style, a:UT._st.ans, step:UT._st.step})") == before2)
        check(f'{mode}: still no AI calls', not fetches)
        # ── Run 3 · News day ──
        p.evaluate("() => { BMPR.open('r3'); BMPR.next(); }")
        for q, a in p.evaluate("() => BMPR.RUNS.r3.steps.map(s => [s.q || 'call', s.ans])"):
            opts = p.evaluate("() => { const s = BMPR.RUNS.r3.steps[BMPR._st().i]; return (s.call || UT.def('day').questions.find(x => x.id === s.q).options).map(o => o.v); }")
            for w in [o for o in opts if o != a][:1]:
                p.evaluate(f"() => BMPR.pick('{w}')")
                check(f'{mode}: run 3 {q}: wrong answer gets ❌', p.evaluate("() => !BMPR._st().solved && !!document.querySelector('.bmpr-fb.no')"))
            p.evaluate(f"() => BMPR.pick('{a}')")
            check(f'{mode}: run 3 {q} solved', p.evaluate("() => BMPR._st().solved"))
            p.evaluate("() => BMPR.next()")
        v3 = p.evaluate("() => { const x = UT.simulate('day', BMPR._st().ans, {}); return { bl:x.ev.blocked, g:x.ev.gates.map(g => g.type + ':' + g.q), score:x.ev.score, grade:x.ev.grade }; }")
        check(f'{mode}: real engine → hard block on News only, setup would be A+', v3['bl'] and v3['g'] == ['block:News'] and v3['grade'] == 'A+')
        t3 = p.evaluate("() => document.querySelector('#bmpr-ov .bmd-body').innerText")
        check(f'{mode}: result: No Trade + would-score line + news-day checklist', 'No Trade' in t3 and 'would score' in t3 and 'WHAT TO DO ON A NEWS DAY' in t3.upper() and 'Entry 1' not in t3)
        p.evaluate("() => BMPR.finish()")
        check(f'{mode}: run 3 saved, certified 3/5, then "Next: Run 4"', p.evaluate("() => !!BMPR.status().done.r3 && document.querySelector('#bmpr-ov').textContent.includes('uTrade Certified · 3/5') && document.querySelector('#bmpr-ov .bmd-foot').textContent.includes('Next: Run 4')"))
        p.evaluate("() => BMPR.close()")
        check(f'{mode}: card shows 3/5 + Start Run 4', p.evaluate("() => { const t = document.getElementById('bmpr-ut').textContent; return t.includes('3/5') && t.includes('Start Run 4'); }"))
        check(f'{mode}: member\'s idea untouched after run 3', p.evaluate("() => JSON.stringify({s:S.style, a:UT._st.ans, step:UT._st.step})") == before2)
        check(f'{mode}: still no AI calls after run 3', not fetches)
        # ── Run 4 · Kill zone scalp (GBPUSD short) ──
        p.evaluate("() => { BMPR.open('r4'); BMPR.next(); }")
        check(f'{mode}: run 4 uses the Scalp questions', p.evaluate("() => BMPR._st().run.style === 'scalp' && document.querySelector('#bmpr-ov .ut-q').textContent.includes('session window')"))
        for q, a in p.evaluate("() => BMPR.RUNS.r4.steps.map(s => [s.q, s.ans])"):
            if q == 'levels':
                p.fill('#bmpr-lv-price', '1.3036'); p.fill('#bmpr-lv-swing_hi', '1.3049')
                p.evaluate("() => BMPR.checkLevels()")
                bad = p.evaluate("() => BMPR._st().bad")
                check(f'{mode}: FX prices checked to the pip (1.3049 ≠ 1.30480, 1.3036 = 1.30360)', 'swing_hi' in bad and 'price' not in bad)
                p.evaluate("() => BMPR.checkLevels(true)")
            else:
                opts = p.evaluate(f"() => UT.def('scalp').questions.find(x => x.id === '{q}').options.map(o => o.v)")
                p.evaluate(f"() => BMPR.pick('{[o for o in opts if o != a][0]}')")
                check(f'{mode}: run 4 {q}: wrong answer gets ❌', p.evaluate("() => !BMPR._st().solved && !!document.querySelector('.bmpr-fb.no')"))
                p.evaluate(f"() => BMPR.pick('{a}')")
            check(f'{mode}: run 4 {q} solved', p.evaluate("() => BMPR._st().solved"))
            p.evaluate("() => BMPR.next()")
        r4 = p.evaluate("""() => { const s = BMPR._st(), lv = {}; Object.keys(s.lv).forEach(k => { if(s.lv[k] !== '') lv[k] = s.lv[k]; });
                 const x = UT.simulate('scalp', s.ans, lv); return { g:x.ev.grade, b:x.ev.bias, bl:x.ev.blocked, w:x.ev.waiting, e1:x.p.e1, e2:x.p.e2, sl:x.p.sl, tp1:x.p.tp1, rr1:+x.p.rr1, rr2:+x.p.rr2 }; }""")
        check(f'{mode}: real engine → A+ SHORT, ready', r4['g'] == 'A+' and r4['b'] == -1 and not r4['bl'] and not r4['w'])
        check(f'{mode}: short risk rules hold (SL above E2 above/at E1, TP1 below, ≥ 1:2 / 1:3 net)', r4['sl'] > r4['e2'] >= r4['e1'] > r4['tp1'] and r4['rr1'] >= 2 and r4['rr2'] >= 3)
        t4 = p.evaluate("() => document.querySelector('#bmpr-ov .bmd-body').innerText")
        check(f'{mode}: result says SHORT GBPUSD with lot size', 'SHORT GBPUSD' in t4 and 'lots' in t4 and 'Clock says' not in t4)
        p.evaluate("() => BMPR.finish()")
        check(f'{mode}: run 4 saved, 4/5, then "Try a real Scalp idea"', p.evaluate("() => !!BMPR.status().done.r4 && document.querySelector('#bmpr-ov').textContent.includes('uTrade Certified · 4/5') && document.querySelector('#bmpr-ov .bmd-foot').textContent.includes('Try a real Scalp idea')"))
        p.evaluate("() => BMPR.goReal()")
        check(f'{mode}: "Try a real Scalp idea" opens uTrade on Scalp', p.evaluate("() => S.style === 'scalp' && document.querySelector('.page.on').id === 'pg-checklist'"))
        check(f'{mode}: card: 4/5, "Run 5 is coming soon"', p.evaluate("() => { const t = document.getElementById('bmpr-ut').textContent; return t.includes('4/5') && t.includes('Run 5 is coming soon'); }"))
        check(f'{mode}: still no AI calls after run 4', not fetches)
        check(f'{mode}: no page errors', not errors)
        if errors: print('\n'.join(errors[:5]))
        ctx.close()
    br.close()
print('RESULT: ' + ('ALL PASS' if not fails else f'{len(fails)} FAIL'))
