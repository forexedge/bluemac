# Save to Journal (takeThisTrade): one tap = one trade, both buttons lock while saving,
# a failed save says "Not saved" (never a fake "Saved") and can be retried.
#   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_save.py . tests
import json, sys, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; HERE = sys.argv[2]
STUB = open(HERE + '/sbstub.js').read()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); PORT = srv.server_address[1]
errors = []; fails = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)
def rpc(name, args, uid):
    if name == 'bm_load': return json.dumps({'data':{'comp':True, 'tier':'free', 'state':{}, 'ts':None}, 'error':None})
    return json.dumps({'data':None, 'error':None})
with sync_playwright() as pw:
    br = pw.chromium.launch(); c = br.new_context(viewport={'width':390, 'height':844})
    c.expose_function('__rpc', rpc)
    c.route('**/*', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB) if 'supabase-js' in r.request.url else (r.continue_() if f':{PORT}/' in r.request.url else r.abort()))
    p = c.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    p.add_init_script("window.__TU = {id:'anna', email:'a@x.com'}; window.alert = () => {};")
    p.goto(f'http://127.0.0.1:{PORT}/index.html'); p.wait_for_function('window.BMS && BMS.ready'); p.wait_for_timeout(300)
    # a slow / controllable journal insert: window.__save = 'ok' | 'error', __delay ms; count real inserts
    SETUP = """mode => { window.__inserts = 0; window.__mode = mode;
      _supabase.from = () => ({ insert(){ window.__inserts++; return { select(){ return { single(){ return new Promise(ok => setTimeout(() =>
        ok(window.__mode === 'error' ? { data:null, error:{ message:'permission denied' } } : { data:{ id: 'db' + window.__inserts }, error:null }), 400)); } }; } }; } });
      S.log = []; window._lastTradePlan = { instrument:'XAUUSD', style:'day', bias:'bull', score:88, grade:'A+', entry:'1/2', sl:'0', tp:'3/4', rr:'2', aiPlan:'x', blocked:false };
      const panel = document.getElementById('guided-panel');
      panel.innerHTML = `<div class="ut-take" id="style-take-bar"><button class="ut-take-b bull" id="style-take-btn" onclick="takeThisTrade('active')">Take</button><button class="ut-take-b mon" onclick="takeThisTrade('monitoring')">👁 Monitor Setup</button></div>`; }"""
    p.evaluate(SETUP, 'ok')
    p.evaluate("() => { takeThisTrade('monitoring'); takeThisTrade('monitoring'); takeThisTrade('active'); }")
    p.wait_for_timeout(100)
    st = p.evaluate("() => [...document.querySelectorAll('#style-take-bar button')].map(b => b.disabled)")
    check('while saving, BOTH Take and Monitor are locked', st == [True, True])
    p.wait_for_timeout(700)
    r = p.evaluate("() => ({ inserts: window.__inserts, log: S.log.length, saved: document.getElementById('style-take-bar').innerText })")
    print('  ', r)
    check('three fast taps = ONE trade saved (no duplicates)', r['inserts'] == 1 and r['log'] == 1 and 'Saved to Journal' in r['saved'])
    check('it saved as the button that was tapped first (Monitor)', p.evaluate("() => S.log[0].notes.startsWith('👁 MONITORING')"))

    p.evaluate(SETUP, 'error')
    p.evaluate("() => takeThisTrade('active')"); p.wait_for_timeout(700)
    r = p.evaluate("() => ({ log: S.log.length, bar: document.getElementById('style-take-bar').innerText, dis: [...document.querySelectorAll('#style-take-bar button')].map(b => b.disabled), take: document.getElementById('style-take-btn').textContent })")
    print('  ', r)
    check('server refuses → "Not saved", nothing fake-added to the Journal', r['log'] == 0 and 'Not saved' in r['bar'] and 'Saved to Journal' not in r['bar'])
    check('buttons come back with their labels so they can try again', r['dis'] == [False, False] and r['take'] == 'Take')
    p.evaluate("() => { window.__mode = 'ok'; takeThisTrade('active'); }"); p.wait_for_timeout(700)
    check('retry works → saved once', p.evaluate("() => S.log.length === 1 && document.getElementById('style-take-bar').innerText.includes('Saved to Journal')"))
    check('no page errors', not errors)
    if errors: print('\n'.join(errors))
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
