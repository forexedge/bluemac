"""Old live site → new site: the old Education tab's "Mark as Read" ticks (tv_edu_progress)
carry into Blue Mac University, sync to the member's profile, survive a server copy coming back,
and are gone after "Reset progress". Ends with RESULT: ALL PASS."""
import json, sys, time, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; HERE = sys.argv[2]
STUB = open(HERE + '/sbstub.js').read()
socketserver.TCPServer.allow_reuse_address = True
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
PORT = srv.server_address[1]; URL = f'http://127.0.0.1:{PORT}/index.html'

SERVER = {}
def rpc(name, args, uid):
    a = json.loads(args)
    if not uid: return json.dumps({'data':None, 'error':{'message':'not signed in'}})
    if name == 'bm_load':
        r = SERVER.get(uid, {})
        return json.dumps({'data':{'comp':True, 'tier':'free', 'state': r.get('state', {}), 'ts': r.get('ts')}, 'error':None})
    if name == 'bm_save_state':
        SERVER[uid] = {'state': a['s'], 'ts': time.time()}; return json.dumps({'data':'now', 'error':None})
    return json.dumps({'data':None, 'error':{'message':'?'}})

errors = []; fails = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)

# What a member's phone holds after using the OLD live site
OLD = {'lesson-01':1, 'lesson-02':1, 'lesson-08A':1, 'lesson-14':1, 'lesson-DAY':1, 'lesson-99':1}
WANT = ['l1-1-1', 'l1-2-1', 'l2-2-2', 'l1-1-4', 'l5-1-2']

with sync_playwright() as pw:
    br = pw.chromium.launch()
    ctx = br.new_context(viewport={'width':390, 'height':844})
    ctx.expose_function('__rpc', rpc)
    def route(r):
        u = r.request.url
        if 'supabase-js' in u: return r.fulfill(status=200, content_type='application/javascript', body=STUB)
        if u.startswith(f'http://127.0.0.1:{PORT}'): return r.continue_()
        return r.abort()
    ctx.route('**/*', route)
    p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    p.add_init_script(f"window.__TU = {json.dumps({'id':'old', 'email':'old@x.com'})};"
                      f"if(!sessionStorage.getItem('seeded')){{ localStorage.setItem('tv_edu_progress', {json.dumps(json.dumps(OLD))}); sessionStorage.setItem('seeded','1'); }}")
    p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(2500)

    done = p.evaluate('() => BMU._p().done')
    check('old ticks show as read in the University', all(k in done for k in WANT))
    check('only mapped lessons ticked (unknown old key ignored)', len(done) == len(WANT))
    check('no quizzes passed by the carry-over', p.evaluate('() => Object.keys(BMU._p().quiz).length') == 0)
    check('old key left on the device', p.evaluate("() => !!localStorage.getItem('tv_edu_progress')"))
    srv_uni = json.loads(SERVER.get('old', {}).get('state', {}).get('keys', {}).get('bm_uni_v1', '{"done":{}}'))
    check('ticks synced to the member profile', all(k in srv_uni['done'] for k in WANT))

    # Server copy without the ticks comes back (e.g. older cloud copy) → ticks re-added
    p.evaluate("() => { localStorage.setItem('bm_uni_v1', JSON.stringify({v:1, done:{}, quiz:{}, last:null, certs:{}, started:null})); BMU.reload(); }")
    check('ticks come back after a server copy replaces them', all(k in p.evaluate('() => BMU._p().done') for k in WANT))

    # Refresh: nothing duplicated / no errors
    p.reload(); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(500)
    check('refresh keeps the ticks', all(k in p.evaluate('() => BMU._p().done') for k in WANT))

    # Reset progress (two taps) wipes old ticks for good
    p.evaluate("() => { BMU.reset(); BMU.reset(); }"); p.wait_for_timeout(200)
    p.reload(); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(500)
    check('reset clears new AND old ticks', len(p.evaluate('() => BMU._p().done')) == 0 and not p.evaluate("() => localStorage.getItem('tv_edu_progress')"))

    check('no page errors', not errors)
    if errors: print('\n'.join(errors[:5]))
    br.close()
print('RESULT: ' + ('ALL PASS' if not fails else f'{len(fails)} FAIL'))
