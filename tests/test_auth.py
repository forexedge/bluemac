# Login form, forgot password and the reset screen (fake Supabase, see sbstub.js)
import json, sys, time, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
ROOT, HERE = sys.argv[1], sys.argv[2]; STUB = open(HERE + '/sbstub.js').read()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); PORT = srv.server_address[1]
URL = f'http://127.0.0.1:{PORT}/index.html'
SERVER = {}
def rpc(name, args, uid):
    a = json.loads(args)
    if not uid: return json.dumps({'data':None, 'error':{'message':'not signed in'}})
    if name == 'bm_load': r = SERVER.get(uid, {}); return json.dumps({'data':{'comp':True, 'tier':'free', 'state':r.get('state', {}), 'ts':None}, 'error':None})
    if name == 'bm_save_state': SERVER[uid] = {'state':a['s']}; return json.dumps({'data':'now', 'error':None})
errors, fails = [], []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)
def ctx(br):
    c = br.new_context(viewport={'width':390, 'height':844}); c.expose_function('__rpc', rpc)
    c.route('**/*', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB) if 'supabase-js' in r.request.url else (r.continue_() if f':{PORT}/' in r.request.url else r.abort()))
    return c
def page(c, init):
    p = c.new_page(); p.on('pageerror', lambda e: errors.append(str(e))); p.add_init_script(init); return p
shown = lambda p, id: p.evaluate(f"() => {{ const e = document.getElementById('{id}'); return !!e && getComputedStyle(e).display !== 'none'; }}")
auth = lambda p: p.evaluate("() => window.__auth")

with sync_playwright() as pw:
    br = pw.chromium.launch(); ANNA = {'id':'anna', 'email':'anna@x.com'}
    # her profile already on the server: disclaimer accepted, tour done, on the Examples page
    SERVER['anna'] = {'state':{'v':1, 't':int(time.time()*1000), 'keys':{'tv_disclaimer_accepted':'1', 'bm_tour_v1':'done', 'tv_quiz_done':'1',
                      'bm_nav_v1':json.dumps({'page':'examples', 'style':'swing'})}}}

    # ── G. New phone, logs in with the form ──
    c = ctx(br); p = page(c, f"window.__TU_LOGIN = {json.dumps(ANNA)};"); p.goto(URL); p.wait_for_timeout(1500)
    check('G login screen shows', shown(p, 'auth-gate'))
    p.fill('#auth-email', 'anna@x.com'); p.fill('#auth-password', 'secret123'); p.click('#auth-btn')
    p.wait_for_function('window.BMS && BMS.ready', timeout=15000); p.wait_for_timeout(800)
    check('G form login: no disclaimer again (profile loaded first)', not shown(p, 'disclaimer-gate'))
    check('G form login: lands on her last page + style', p.evaluate("() => document.querySelector('.page.on').id === 'pg-examples' && S.style === 'swing'"))
    check('G form login: auth gate gone', not shown(p, 'auth-gate'))

    # ── H. Forgot password ──
    c2 = ctx(br); p = page(c2, ""); p.goto(URL); p.wait_for_timeout(1200)
    check('H "Forgot password?" visible on Login tab', shown(p, 'auth-forgot-row'))
    p.click('#auth-forgot-row a')
    check('H no email typed → asks for it', 'Type your email' in p.inner_text('#auth-error') and not any(a[0] == 'reset' for a in auth(p)))
    p.fill('#auth-email', 'anna@x.com'); p.click('#auth-forgot-row a'); p.wait_for_timeout(200)
    r = [a for a in auth(p) if a[0] == 'reset']
    check('H reset email requested for that address', r and r[0][1] == 'anna@x.com')
    check('H reset link brings them back to this exact site', r and r[0][2] == URL)
    check('H success message shown', 'reset link' in p.inner_text('#auth-success'))
    p.evaluate("() => switchTab('signup')")
    check('I link hidden on Sign Up tab', not shown(p, 'auth-forgot-row'))
    p.fill('#auth-email', 'new@x.com'); p.fill('#auth-password', 'secret123'); p.click('#auth-btn'); p.wait_for_timeout(200)
    s = [a for a in auth(p) if a[0] == 'signUp']
    check('I sign-up confirmation email also comes back to this site', s and s[0][2] == URL)

    # ── J. Back from the reset email ──
    c3 = ctx(br); p = page(c3, f"window.__TU = {json.dumps(ANNA)};"); p.goto(URL + '#access_token=x&type=recovery'); p.wait_for_timeout(1500)
    check('J "Set a new password" screen shows', shown(p, 'reset-gate'))
    p.fill('#reset-pw1', 'short'); p.fill('#reset-pw2', 'short'); p.click('#reset-btn')
    check('J too short → error, not saved', '8 characters' in p.inner_text('#reset-error') and not any(a[0] == 'update' for a in auth(p)))
    p.fill('#reset-pw1', 'longpassword1'); p.fill('#reset-pw2', 'longpassword2'); p.click('#reset-btn')
    check('J mismatch → error, not saved', "don't match" in p.inner_text('#reset-error') and not any(a[0] == 'update' for a in auth(p)))
    p.fill('#reset-pw2', 'longpassword1'); p.click('#reset-btn'); p.wait_for_timeout(300)
    check('J new password saved', ['update', 'pw:13'] in auth(p))
    p.screenshot(path='/tmp/reset_done.png')
    p.wait_for_timeout(2200)
    check('J screen closes, app underneath', not shown(p, 'reset-gate') and p.evaluate("() => !!document.querySelector('.page.on')"))
    check('J URL tidied (no token left in the address bar)', 'access_token' not in p.url)
    p2 = page(c3, f"window.__TU = {json.dumps(ANNA)};"); p2.goto(URL + '#access_token=x&type=recovery'); p2.wait_for_timeout(1200)
    p2.screenshot(path='/tmp/reset_gate.png')

    check('zero page errors', not errors)
    for e in errors[:10]: print('  ERR', e[:200])
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
