import json, sys, time, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; HERE = sys.argv[2]
STUB = open(HERE + '/sbstub.js').read()
socketserver.TCPServer.allow_reuse_address = True
PORT = 8765
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); PORT = srv.server_address[1]
URL = f'http://127.0.0.1:{PORT}/index.html'

SERVER = {}            # uid -> {'state':..., 'ts':...}
COMP = {'anna'}        # on the free list
CALLS = []
def rpc(name, args, uid):
    CALLS.append(name); a = json.loads(args)
    if not uid: return json.dumps({'data':None, 'error':{'message':'not signed in'}})
    if name == 'bm_load':
        r = SERVER.get(uid, {})
        return json.dumps({'data':{'comp': uid in COMP, 'tier':'free', 'state': r.get('state', {}), 'ts': r.get('ts')}, 'error':None})
    if name == 'bm_save_state':
        SERVER[uid] = {'state': a['s'], 'ts': time.time()}; return json.dumps({'data':'now', 'error':None})
    return json.dumps({'data':None, 'error':{'message':'?'}})

errors = []; fails = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)

def page_for(ctx, user):
    p = ctx.new_page()
    p.on('pageerror', lambda e: errors.append(str(e)))
    p.add_init_script(f'window.__TU = {json.dumps(user)};')
    return p

def setup(ctx):
    ctx.expose_function('__rpc', rpc)
    def route(r):
        u = r.request.url
        if 'supabase-js' in u: return r.fulfill(status=200, content_type='application/javascript', body=STUB)
        if u.startswith(f'http://127.0.0.1:{PORT}'): return r.continue_()
        return r.abort()
    ctx.route('**/*', route)

def boot(p):
    p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(300)

state = lambda p: p.evaluate("""() => ({ page: document.querySelector('.page.on')?.id, style: S.style, step: UT._st.step, ans: UT._st.ans,
  ex: document.querySelector('.ex-filter.on')?.getAttribute('onclick'), badge: !!document.getElementById('bm-member-badge'),
  disc: getComputedStyle(document.getElementById('disclaimer-gate')).display, tour: localStorage.getItem('bm_tour_v1'),
  uni: localStorage.getItem('bm_uni_v1'), cost: JSON.stringify(UT.cost), owner: localStorage.getItem('bm_owner') })""")

with sync_playwright() as pw:
    br = pw.chromium.launch()
    ANNA = {'id':'anna', 'email':'anna@x.com'}; BEN = {'id':'ben', 'email':'ben@x.com'}

    # ── Device 1: Anna uses the app ──
    d1 = br.new_context(viewport={'width':390, 'height':844}); setup(d1); p = page_for(d1, ANNA); boot(p)
    s = state(p)
    check('A1 free-list member sees the badge', s['badge'])
    check('A1 first visit shows the disclaimer', s['disc'] != 'none')
    p.evaluate("""() => { acceptDisclaimer(); localStorage.setItem('bm_tour_v1','done'); document.getElementById('bmt-root')?.remove();
      setStyle('day', document.querySelector('.style-tab.day'));
      UT.pick('instrument','XAUUSD'); const q = UT._st; UT.pick('session', null);
      UT.cost.bal = '25000'; UT.cost.ccy = 'ZAR'; localStorage.setItem('bm_cost_v1', JSON.stringify(UT.cost));
      const P = BMU._p(); P.done['test-lesson'] = 1; localStorage.setItem('bm_uni_v1', JSON.stringify(P));
      goPage('examples', document.querySelector(".nav-item[onclick*=\\"goPage('examples'\\"]"));
      filterExamples('smc', document.querySelector(".ex-filter[onclick*=\\"'smc'\\"]")); }""")
    p.wait_for_timeout(2500)
    p.evaluate("() => window.scrollTo(0,0)"); p.screenshot(path='/tmp/phone_badge.png', clip={'x':0,'y':0,'width':390,'height':120})
    a1 = state(p)
    check('A1 saved to server', 'anna' in SERVER and 'bm_nav_v1' in SERVER['anna']['state'].get('keys', {}))
    nav = json.loads(SERVER['anna']['state']['keys']['bm_nav_v1'])
    check('A1 nav recorded (examples / day / smc / step 2)', nav.get('page') == 'examples' and nav.get('style') == 'day' and nav.get('ex') == 'smc' and nav['ut']['step'] == 2)

    # ── Same device, refresh: lands where she left off ──
    boot(p); s = state(p)
    check('A2 refresh keeps page', s['page'] == 'pg-examples')
    check('A2 refresh keeps Examples tab', s['ex'] and "'smc'" in s['ex'])
    check('A2 refresh keeps style + question', s['style'] == 'day' and s['step'] == 2 and s['ans'].get('instrument') == 'XAUUSD')
    check('A2 no disclaimer again', s['disc'] == 'none')

    # ── Device 2 (new phone): everything comes back from the server ──
    d2 = br.new_context(viewport={'width':390, 'height':844}); setup(d2); p2 = page_for(d2, ANNA); boot(p2); s = state(p2)
    check('B new device: page restored', s['page'] == 'pg-examples')
    check('B new device: style + step restored', s['style'] == 'day' and s['step'] == 2)
    check('B new device: no disclaimer', s['disc'] == 'none')
    check('B new device: tour marked done', s['tour'] == 'done')
    check('B new device: University progress back (live object)', p2.evaluate("() => !!BMU._p().done['test-lesson']"))
    check('B new device: balance back in UT.cost', '25000' in s['cost'])
    check('B new device: badge', s['badge'])
    p2.wait_for_timeout(1500)
    check('B tour did not auto-start', p2.evaluate("() => !document.getElementById('bmt')"))
    p2.screenshot(path='/tmp/phone_restored.png')

    # ── Device 2: change something, device 1 picks it up on next load ──
    p2.evaluate("""() => { goPage('education', document.querySelector(".nav-item[onclick*=\\"goPage('education'\\"]")); }""")
    p2.wait_for_timeout(2200)
    boot(p); s = state(p)
    check('C newer change on phone wins on laptop', s['page'] == 'pg-education')

    # ── Logout on device 2 clears the device, server keeps it ──
    p2.evaluate("() => handleLogout()"); p2.wait_for_timeout(500)
    left = p2.evaluate("() => BMS.SYNC.filter(k => localStorage.getItem(k) != null).concat(localStorage.getItem('bm_owner') ? ['bm_owner'] : [])")
    check('D logout wipes member data from device', left == [])
    check('D server still has her state', 'bm_nav_v1' in SERVER['anna']['state']['keys'])

    # ── Device 1, Ben logs in on Anna's laptop (she never logged out) ──
    pb = page_for(d1, BEN); boot(pb); s = state(pb)
    check('E other member: Anna\'s data gone', s['owner'] == 'ben' and s['style'] == 'scalp' and s['page'] == 'pg-checklist' and s['uni'] is None)
    check('E other member: no badge (not on list)', not s['badge'])
    check('E other member: disclaimer shows for him', s['disc'] != 'none')
    pb.evaluate("() => acceptDisclaimer()"); pb.wait_for_timeout(7000)
    check('E tour still auto-runs for a brand-new member', pb.evaluate("() => !!document.getElementById('bmt')"))

    # ── Server down: app still opens on local data ──
    def down(name, args, uid): raise Exception('down')
    CALLS.clear()
    d3 = br.new_context(); 
    d3.expose_function('__rpc', lambda *a: (_ for _ in ()).throw(Exception('down')))
    d3.route('**/*', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB) if 'supabase-js' in r.request.url else (r.continue_() if r.request.url.startswith(f'http://127.0.0.1:{PORT}') else r.abort()))
    p3 = page_for(d3, ANNA); boot(p3)
    check('F server unreachable: app still loads', p3.evaluate("() => !!document.querySelector('.page.on')"))

    check('zero page errors', not errors)
    for e in errors[:10]: print('  ERR', e[:200])
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
