# Daily AI idea limit: counter, lock after 2, friendly limit screen (fake Supabase + fake AI function)
import json, sys, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
ROOT, HERE = sys.argv[1], sys.argv[2]; STUB = open(HERE + '/sbstub.js').read()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); PORT = srv.server_address[1]
URL = f'http://127.0.0.1:{PORT}/index.html'
LIMIT = 2; USED = {}; AI_CALLS = []
def rpc(name, args, uid):
    if not uid: return json.dumps({'data':None, 'error':{'message':'not signed in'}})
    if name == 'bm_load': return json.dumps({'data':{'comp':True, 'tier':'free', 'state':{}, 'ts':None}, 'error':None})
    if name == 'bm_save_state': return json.dumps({'data':'now', 'error':None})
    if name == 'bm_ideas_left': return json.dumps({'data':{'used':USED.get(uid, 0), 'limit':LIMIT}, 'error':None})
    return json.dumps({'data':None, 'error':None})
AI = "[LONG_IDEA]\nSIGNAL_CANDLE: test\nWAIT_CONDITION: None\nINVALIDATION: x\nMANAGEMENT: y\nREASONING: z\n[/LONG_IDEA]\n[SHORT_IDEA]\nSIGNAL_CANDLE: t\nWAIT_CONDITION: w\nINVALIDATION: x\nMANAGEMENT: y\nREASONING: z\n[/SHORT_IDEA]"
def fn(route):
    uid = (route.request.headers.get('authorization') or '').replace('Bearer tok-', '')
    u = USED.get(uid, 0)
    if u >= LIMIT:
        return route.fulfill(status=429, content_type='application/json', headers={'Access-Control-Allow-Origin':'*'},
            body=json.dumps({'error':f"You've used your {LIMIT} AI trade ideas for today. New ideas unlock at midnight (SAST).", 'code':'daily_limit', 'bm_usage':{'used':u, 'limit':LIMIT}}))
    USED[uid] = u + 1; AI_CALLS.append(uid)
    route.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*'},
        body=json.dumps({'content':[{'text':AI}], 'bm_usage':{'used':u + 1, 'limit':LIMIT}}))
errors, fails = [], []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)
SEED = {'tv_disclaimer_accepted':'1','tv_quiz_done':'1','tv_welcome_seen':'1','tv_setup_seen':'1','bm_tour_v1':'done','bm_owner':'anna','bm_state_t':'1',
        'bm_know_v1':json.dumps({'day':1}), 'bm_cost_v1':json.dumps({'ccy':'ZAR','bal':'50000','inst':{}}), 'bm_fx_v1':json.dumps({'day':'2099-01-01','r':{'USDZAR':17.4}})}
def to_result(p):
    p.evaluate("()=>setStyle('day',document.querySelector('.style-tab.day'))"); p.wait_for_timeout(300)
    for _ in range(40):
        info = p.evaluate("""()=>{const s=__STR[S.style], st=UT._st; if(st.step>=s.questions.length) return {done:true};
          const q=s.questions[st.step]; return {id:q.id,type:q.type,max:q.max||0,opts:(q.options||[]).map(o=>({v:o.v,dir:o.dir||0,pts:o.pts||0,gate:o.gate||'',half:!!o.halfRisk})),fields:(q.fields||[]).map(f=>f.id)}}""")
        if info.get('done'): break
        if info['type'] == 'instrument': p.evaluate("()=>UT.pick('instrument','EURUSD')"); continue
        if info['type'] == 'multi':
            for o in sorted([o for o in info['opts'] if o['dir'] >= 0 and not o['gate']], key=lambda o: -o['pts'])[:max(1, info['max'] or 3)]:
                p.evaluate(f"()=>UT.toggle({json.dumps(info['id'])},{json.dumps(o['v'])})")
            p.evaluate("()=>UT.next()"); continue
        if info['type'] == 'levels':
            v = {'price':'1.16420','swing_hi':'1.17320','swing_lo':'1.16050','zone_hi':'1.16480','zone_lo':'1.16300','pdh':'1.17680','pdl':'1.15890'}
            for f in info['fields']:
                if f in v: p.fill(f'#ut-lv-{f}', v[f])
            p.evaluate("()=>UT.submitLevels()"); continue
        best = max([o for o in info['opts'] if o['dir'] >= 0 and not o['gate'] and not o['half']], key=lambda o: (o['pts'], o['dir']))
        p.evaluate(f"()=>UT.pick({json.dumps(info['id'])},{json.dumps(best['v'])})")
    p.wait_for_timeout(500)
quota = lambda p: p.evaluate("()=>[...document.querySelectorAll('.ut-quota')].map(e=>e.innerText).join(' | ')")
ai_btn = lambda p: p.evaluate("()=>{const b=document.querySelector('[data-ai]'); return b ? [b.disabled, b.innerText] : null}")

with sync_playwright() as pw:
    br = pw.chromium.launch(); c = br.new_context(viewport={'width':390, 'height':844}); c.expose_function('__rpc', rpc)
    def route(r):
        u = r.request.url
        if 'supabase-js' in u: return r.fulfill(status=200, content_type='application/javascript', body=STUB)
        if 'functions/v1/trade-idea' in u: return fn(r)
        if f':{PORT}/' in u: return r.continue_()
        return r.abort()
    c.route('**/*', route)
    c.add_init_script("window.__TU={id:'anna',email:'anna@x.com'};" + "".join(f"localStorage.setItem({json.dumps(k)},{json.dumps(v)});" for k, v in SEED.items()))
    c.add_init_script("""Object.defineProperty(window,'UT',{configurable:true,get(){return this.__ut},set(v){const r=v.register;v.register=(k,s)=>{(window.__STR=window.__STR||{})[k]=s;return r(k,s)};this.__ut=v;}});""")
    p = c.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(400)
    to_result(p)
    check('result screen shows "2 of 2 left"', '2 of 2' in quota(p))
    check('Generate button enabled', ai_btn(p) and ai_btn(p)[0] is False)
    p.evaluate("()=>UT.fire()"); p.wait_for_selector('#ut-out .ut-actions', timeout=10000); p.wait_for_timeout(300)
    check('idea 1 shown, counter "1 of 2"', '1 of 2' in quota(p) and len(AI_CALLS) == 1)
    p.evaluate("()=>UT.fire()"); p.wait_for_selector('#ut-out .ut-actions', timeout=10000); p.wait_for_timeout(300)
    q = quota(p); b = ai_btn(p)
    check('idea 2 shown, out-of-ideas message', "used today's" in q and len(AI_CALLS) == 2)
    check('Regenerate locked: "Daily limit reached"', b and b[0] is True and 'Daily limit' in b[1])
    p.screenshot(path='/tmp/ai_limit_after2.png', full_page=False)
    p.evaluate("()=>UT.fire()"); p.wait_for_timeout(300)
    check('3rd try → limit screen, no AI call', p.evaluate("()=>!!document.querySelector('.ut-limit')") and len(AI_CALLS) == 2)
    p.screenshot(path='/tmp/ai_limit_screen.png')
    p.evaluate("()=>UT.render()"); p.wait_for_timeout(500)
    check('"Back to my plan" → result screen, Generate locked', p.evaluate("()=>!!document.querySelector('.ut-fire[data-ai]')") and ai_btn(p)[0] is True)
    # server says no even though the app thought there was one left (e.g. used on the live site)
    p.evaluate("()=>{ UT._st; }"); USED['anna'] = 2
    p2 = c.new_page(); p2.on('pageerror', lambda e: errors.append(str(e)))
    LIMIT_BEFORE = LIMIT
    p2.goto(URL); p2.wait_for_function('window.BMS && BMS.ready', timeout=20000); p2.wait_for_timeout(400)
    to_result(p2)
    check('fresh load knows the limit is used (from the server)', ai_btn(p2)[0] is True and "used today's" in quota(p2))
    check('zero page errors', not errors)
    for e in errors[:5]: print('  ERR', e[:200])
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
