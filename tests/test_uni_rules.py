"""Tougher University (17 Oct): every module quiz has 10 questions, new lessons need reading time before
"Complete" works, already-read lessons don't, a failed quiz waits 10 minutes before a retry (a module passed
before never waits), and existing progress (passed quizzes, certificates, read lessons) is untouched.
Phone + desktop. Ends with RESULT: ALL PASS."""
import json, sys, threading, functools, http.server, socketserver, datetime
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; HERE = sys.argv[2]
STUB = open(HERE + '/sbstub.js').read()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
PORT = srv.server_address[1]; URL = f'http://127.0.0.1:{PORT}/index.html'
fails = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)
# an existing member: module 1.1 passed, its 4 lessons read, Level 1 certificate missing nothing else
OLD = {'v':1, 'done':{'l1-1-1':1, 'l1-1-2':1, 'l1-1-3':1, 'l1-1-4':1}, 'quiz':{'m1-1':{'best':0.8, 'passed':True, 'tries':1, 'at':1}}, 'last':None, 'certs':{}, 'started':None}

with sync_playwright() as pw:
    br = pw.chromium.launch()
    for mode, vp in [('phone', {'width':390, 'height':844}), ('desktop', {'width':1366, 'height':900})]:
        errors = []
        ctx = br.new_context(viewport=vp, is_mobile=mode == 'phone', has_touch=mode == 'phone')
        ctx.expose_function('__rpc', lambda n, a, u: json.dumps({'data':{'comp':True, 'tier':'free', 'state':{}, 'ts':None} if n == 'bm_load' else 'ok', 'error':None}))
        ctx.route('**/*', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB) if 'supabase-js' in r.request.url else (r.continue_() if r.request.url.startswith(f'http://127.0.0.1:{PORT}') else r.abort()))
        p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
        p.clock.install(time=datetime.datetime(2026, 10, 20, 8, 0, tzinfo=datetime.timezone.utc))
        p.add_init_script(f"window.__TU={{id:'u_{mode}',email:'u@x.com'}};localStorage.setItem('tv_disclaimer_accepted','1');localStorage.setItem('tv_quiz_done','1');localStorage.setItem('bm_tour_v1','done');localStorage.setItem('bm_uni_v1', {json.dumps(json.dumps(OLD))});")
        p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.clock.run_for(8000)
        p.evaluate("() => goPage('education', document.querySelector(\".nav-item[onclick*=\\\"goPage('education'\\\"]\"))")
        check(f'{mode}: every module quiz has 10 questions', p.evaluate("() => BMU.MODULES.every(m => m.quiz.length === 10)"))
        check(f'{mode}: existing progress untouched (1.1 passed, 4 lessons read)', p.evaluate("() => { const P = BMU._p(); return P.quiz['m1-1'].passed && ['l1-1-1','l1-1-2','l1-1-3','l1-1-4'].every(l => P.done[l]); }"))
        # ── an already-read lesson: no waiting ──
        p.evaluate("() => BMU.lesson('m1-1','l1-1-2')")
        check(f'{mode}: an already-read lesson has no reading timer', p.evaluate("() => !document.getElementById('uni-complete').disabled"))
        # ── a NEW lesson: button locked with a countdown; early taps ignored ──
        p.evaluate("() => BMU.lesson('m1-2','l1-2-1')")
        b = p.evaluate("() => { const b = document.getElementById('uni-complete'); return { dis:b.disabled, txt:b.textContent }; }")
        check(f'{mode}: new lesson: Complete is locked with a countdown', b['dis'] and 'Keep reading' in b['txt'])
        p.evaluate("() => BMU.complete('m1-2','l1-2-1')")
        check(f'{mode}: tapping Complete early does nothing', p.evaluate("() => !BMU._p().done['l1-2-1']"))
        secs = int(''.join(ch for ch in b['txt'] if ch.isdigit()))
        check(f'{mode}: reading time is between 10 and 40 seconds ({secs}s)', 10 <= secs <= 40)
        p.clock.run_for((secs + 1) * 1000)
        check(f'{mode}: after the reading time Complete unlocks', p.evaluate("() => { const b = document.getElementById('uni-complete'); return !b.disabled && !b.textContent.includes('Keep reading'); }"))
        p.evaluate("() => BMU.complete('m1-2','l1-2-1')")
        check(f'{mode}: the lesson now counts as read', p.evaluate("() => !!BMU._p().done['l1-2-1']"))
        # read the rest of module 1.2 properly
        for lid in ['l1-2-2', 'l1-2-3', 'l1-2-4']:
            p.evaluate(f"() => BMU.lesson('m1-2','{lid}')"); p.clock.run_for(41000); p.evaluate(f"() => BMU.complete('m1-2','{lid}')")
        check(f'{mode}: module 1.2 lessons all read → quiz ready', p.evaluate("() => ['l1-2-1','l1-2-2','l1-2-3','l1-2-4'].every(l => BMU._p().done[l])"))
        # ── fail the quiz → 10-minute break ──
        p.evaluate("() => BMU.quiz('m1-2')")
        check(f'{mode}: the quiz asks 10 questions', p.evaluate("() => /of 10/.test(document.querySelector('.uni-quiz-head').textContent)"))
        for i in range(10):
            p.evaluate("() => { BMU.answer(0); BMU.nextQ(); }")
        st = p.evaluate("() => BMU._p().quiz['m1-2']")
        check(f'{mode}: a fail is recorded with the time ({round(st["best"]*100)}%)', st and not st['passed'] and st.get('failAt'))
        if st and st['best'] >= 0.8:
            print('INFO answering A every time happened to pass — skipping the cooldown check for this run')
        else:
            check(f'{mode}: the result says the retry unlocks in 10 minutes', p.evaluate("() => document.querySelector('.uni-result').textContent.includes('10 minutes')"))
            p.evaluate("() => BMU.quiz('m1-2')")
            check(f'{mode}: retry straight away → break screen, not the quiz', p.evaluate("() => !document.querySelector('.uni-quiz') && document.querySelector('.uni-result').textContent.includes('Quick break')"))
            t = p.evaluate("() => document.querySelector('.uni-result').textContent")
            check(f'{mode}: break time reads "10 min" (never "60 s")', '10 min' in t and '60 s' not in t)
            p.clock.run_for(30 * 1000); p.evaluate("() => BMU.quiz('m1-2')")
            t = p.evaluate("() => document.querySelector('.uni-result').textContent")
            check(f'{mode}: 30 s later it reads "9 min 30 s"', '9 min 30 s' in t)
            p.clock.run_for(5 * 60 * 1000); p.evaluate("() => BMU.quiz('m1-2')")
            check(f'{mode}: still waiting after 5½ minutes', p.evaluate("() => !document.querySelector('.uni-quiz')"))
            p.clock.run_for(4 * 60 * 1000 + 31 * 1000); p.evaluate("() => BMU.quiz('m1-2')")
            check(f'{mode}: after 10 minutes the quiz opens again', p.evaluate("() => !!document.querySelector('.uni-quiz')"))
            # pass it properly now (answer the right option every time)
            for i in range(10):
                p.evaluate("""() => { /* the right answer, looked up in the curriculum by the question text */
                  const qText = document.querySelector('.uni-q').textContent.trim();
                  const m = BMU.MODULES.find(x => x.id === 'm1-2'); const q = m.quiz.find(x => x.q === qText);
                  const btns = [...document.querySelectorAll('.uni-opt')]; const k = btns.findIndex(b => b.textContent.slice(1).trim() === q.o[q.a]);
                  BMU.answer(k); BMU.nextQ(); }""")
            st2 = p.evaluate("() => BMU._p().quiz['m1-2']")
            check(f'{mode}: passing works after the break', st2['passed'] and st2['best'] == 1)
        # ── a module passed before never waits ──
        p.evaluate("() => BMU.quiz('m1-1')")
        for i in range(10): p.evaluate("() => { BMU.answer(0); BMU.nextQ(); }")
        p.evaluate("() => BMU.quiz('m1-1')")
        check(f'{mode}: a module passed before can be retried straight away, and stays passed', p.evaluate("() => !!document.querySelector('.uni-quiz') && BMU._p().quiz['m1-1'].passed"))
        p.evaluate("() => BMU.home()")
        check(f'{mode}: no sideways scroll', p.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1'))
        check(f'{mode}: no page errors', not errors)
        if errors: print('\n'.join(errors[:5]))
        ctx.close()
    br.close()
print('RESULT: ' + ('ALL PASS' if not fails else f'{len(fails)} FAIL'))
