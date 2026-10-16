# Founding 100 launch panel + invite-only registration (logged-out visitor, fake Supabase)
import json, sys, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
ROOT, HERE = sys.argv[1], sys.argv[2]; STUB = open(HERE + '/sbstub.js').read()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); PORT = srv.server_address[1]
URL = f'http://127.0.0.1:{PORT}/index.html'
INVITED = {'robbiepxm@gmail.com', 'ernes.smit@gmail.com'}
INFO = {'launch_date':'2026-11-04', 'spots_total':100, 'spots_taken':22, 'contact_email':'brahmdp@gmail.com', 'contact_whatsapp':'', 'registration_open':False}
def rpc(name, args, uid):
    a = json.loads(args)
    if name == 'bm_launch_info': return json.dumps({'data':INFO, 'error':None})
    if name == 'bm_signup_allowed': return json.dumps({'data':a['p_email'].strip().lower() in INVITED, 'error':None})
    return json.dumps({'data':None, 'error':{'message':'not signed in'}})
errors, fails = [], []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)
def run(info_override=None, w=390, h=844):
    if info_override: INFO.update(info_override)
    c = br.new_context(viewport={'width':w, 'height':h}); c.expose_function('__rpc', rpc)
    c.route('**/*', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB) if 'supabase-js' in r.request.url else (r.continue_() if f':{PORT}/' in r.request.url else r.abort()))
    c.add_init_script("document.addEventListener('DOMContentLoaded',()=>{const s=document.getElementById('splash'); if(s) s.style.display='none';});")
    p = c.new_page(); p.on('pageerror', lambda e: errors.append(str(e) + ' @ ' + (e.stack or '')[:300])); p.goto(URL); p.wait_for_timeout(1500)
    return p
with sync_playwright() as pw:
    br = pw.chromium.launch()
    p = run()
    t = lambda id: p.inner_text('#' + id)
    check('panel shows launch date', t('bml-date').upper() == '4 NOV 2026')
    check('live counter: 78 of 100 spots left', t('bml-left') == '78' and t('bml-total2') == '100')
    check('days to launch shown', 'days to launch' in t('bml-days'))
    check('USD pricing removed', '$49' not in p.inner_text('#auth-gate'))
    href = p.get_attribute('#bml-cta', 'href')
    check('no WhatsApp set: main button emails "Lock in my spot"', href.startswith('mailto:brahmdp@gmail.com?subject=Lock%20in%20my%20spot') and 'brahmdp@gmail.com' in t('bml-cta-sub'))
    check('styled on phone (gold button, round seal)', p.evaluate("()=>{const c=getComputedStyle(document.getElementById('bml-cta')), s=getComputedStyle(document.querySelector('.bml-seal')); return c.backgroundImage.includes('gradient') && s.borderRadius==='50%'}"))
    p.screenshot(path='/tmp/launch_login.png', full_page=True)
    p.click('#tab-signup')
    check('tab says "I\'m invited" + invite note shows', "invited" in t('tab-signup') and p.is_visible('#auth-invite-note'))
    p.fill('#auth-email', 'random.stranger@gmail.com'); p.fill('#auth-password', 'secret123'); p.click('#auth-btn'); p.wait_for_timeout(400)
    check('stranger: "not on the invite list" + no account created', 'invite list' in t('auth-error') and not any(a[0] == 'signUp' for a in p.evaluate('()=>window.__auth')))
    p.screenshot(path='/tmp/launch_blocked.png')
    p.fill('#auth-email', ' Robbiepxm@gmail.com '); p.click('#auth-btn'); p.wait_for_timeout(400)
    su = [a for a in p.evaluate('()=>window.__auth') if a[0] == 'signUp']
    check('invited mate can register (caps/spaces ok)', len(su) == 1 and 'Account created' in t('auth-success'))
    p.click('#tab-login')
    check('back on Login: note hidden, forgot link back', p.is_hidden('#auth-invite-note') and p.is_visible('#auth-forgot-row'))
    p2 = run({'contact_whatsapp':'27840674851', 'spots_taken':22}, 1366, 900)
    check('WhatsApp set: main button opens wa.me/27840674851', p2.get_attribute('#bml-cta', 'href').startswith('https://wa.me/27840674851?text=Hi%20Blue%20Mac'))
    check('shows local number 084 067 4851', '084 067 4851' in p2.inner_text('#bml-cta-sub'))
    check('email offered as the alternative', p2.is_visible('#bml-mail') and p2.get_attribute('#bml-mail', 'href').startswith('mailto:'))
    check('LAPTOP: styles apply (gold button, seal, note hidden on Login)', p2.evaluate("()=>{const c=getComputedStyle(document.getElementById('bml-cta')), s=getComputedStyle(document.querySelector('.bml-seal')); return c.backgroundImage.includes('gradient') && s.borderRadius==='50%' && getComputedStyle(document.getElementById('auth-invite-note')).display==='none'}"))
    p2.screenshot(path='/tmp/launch_laptop.png')
    p3 = run({'spots_taken':97}, 390, 844)
    check('counter updates (3 left)', p3.inner_text('#bml-left') == '3')
    p3.screenshot(path='/tmp/launch_phone_wa.png')
    check('zero page errors', not errors)
    for e in errors[:5]: print('  ERR', e[:200])
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
