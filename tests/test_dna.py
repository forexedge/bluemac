# My Trading DNA (dna.js): card on uTrade Ideas, 4-step picker, limits, save,
# closest-style jump, sync to the member profile and back on a new device.
#   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_dna.py . tests [shots_dir]
import json, sys, time, threading, functools, http.server, socketserver, os
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; HERE = sys.argv[2]; SHOTS = sys.argv[3] if len(sys.argv) > 3 else None
STUB = open(HERE + '/sbstub.js').read()
socketserver.TCPServer.allow_reuse_address = True
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); PORT = srv.server_address[1]
URL = f'http://127.0.0.1:{PORT}/index.html'

SERVER = {}
def rpc(name, args, uid):
    a = json.loads(args)
    if not uid: return json.dumps({'data':None, 'error':{'message':'not signed in'}})
    if name == 'bm_load':
        r = SERVER.get(uid, {})
        return json.dumps({'data':{'comp': True, 'tier':'free', 'state': r.get('state', {}), 'ts': r.get('ts')}, 'error':None})
    if name == 'bm_save_state':
        SERVER[uid] = {'state': a['s'], 'ts': time.time()}; return json.dumps({'data':'now', 'error':None})
    return json.dumps({'data':None, 'error':{'message':'?'}})

errors = []; fails = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)

def setup(ctx):
    ctx.expose_function('__rpc', rpc)
    def route(r):
        u = r.request.url
        if 'supabase-js' in u: return r.fulfill(status=200, content_type='application/javascript', body=STUB)
        if u.startswith(f'http://127.0.0.1:{PORT}'): return r.continue_()
        return r.abort()
    ctx.route('**/*', route)

def page_for(ctx, user):
    p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    p.add_init_script(f'window.__TU = {json.dumps(user)};'); return p

def boot(p):
    p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(300)
    p.evaluate("""() => { try{acceptDisclaimer();}catch(e){} localStorage.setItem('bm_tour_v1','done');
      document.getElementById('bmt-root')?.remove(); document.getElementById('bmt')?.remove();
      ['auth-gate','quiz-gate','disclaimer-gate'].forEach(i => { const e = document.getElementById(i); if(e) e.style.display='none'; }); }""")

def shot(p, name):
    if not SHOTS: return
    p.evaluate("() => { const sp = document.getElementById('splash'); if(sp) sp.style.display='none'; document.querySelectorAll('.bmt-fab,#bmt-fab').forEach(e => e.remove()); }")
    p.add_style_tag(content='*,*::before,*::after{animation:none!important;transition:none!important}')
    p.wait_for_timeout(250); p.screenshot(path=os.path.join(SHOTS, name), full_page=False)

with sync_playwright() as pw:
    br = pw.chromium.launch()
    ANNA = {'id':'anna', 'email':'anna@x.com'}
    for label, vp in [('phone', {'width':390, 'height':844}), ('desktop', {'width':1280, 'height':900})]:
        SERVER.clear()
        ctx = br.new_context(viewport=vp); setup(ctx); p = page_for(ctx, ANNA); boot(p)
        check(f'{label}: CTA card shows when no DNA', p.evaluate("() => document.getElementById('bm-dna')?.className") == 'bmd-cta')
        check(f'{label}: DNA invitation card hidden (the Strategy Builder replaces it)', not p.is_visible('#bm-dna'))

        p.evaluate("() => BMD.open()"); p.wait_for_timeout(300)
        check(f'{label}: picker opens', p.is_visible('#bmd-ov.on'))
        check(f'{label}: concept cards have diagrams', p.evaluate("() => document.querySelectorAll('.bmd-card .bmd-dg svg').length") >= 12)
        check(f'{label}: Next disabled with nothing picked', p.evaluate("() => document.querySelector('.bmd-foot .ut-next').disabled"))
        shot(p, f'{label}-1-concepts.png')
        for cid in ['ob', 'fvg', 'sweep', 'structure', 'pd', 'fib']:
            p.evaluate(f"() => BMD.toggle('concepts','{cid}')")
        check(f'{label}: max 5 concepts', p.evaluate("() => document.querySelectorAll('.bmd-card.on').length") == 5)
        p.evaluate("() => BMD.toggle('concepts','pd')")
        p.evaluate("() => BMD.toggle('concepts','keyrange')")
        shot(p, f'{label}-1b-concepts-picked.png')
        p.click('.bmd-foot .ut-next'); p.wait_for_timeout(200)
        for s in ['XAUUSD', 'NAS100', 'GBPUSD']: p.click(f".bmd-chip[onclick*=\"'{s}'\"]")
        shot(p, f'{label}-2-markets.png')
        p.click('.bmd-foot .ut-next'); p.wait_for_timeout(200)
        check(f'{label}: session chips show SAST times', 'SAST' in p.inner_text('.bmd-body'))
        for s in ['london', 'ny']: p.click(f".bmd-chip[onclick*=\"'{s}'\"]")
        shot(p, f'{label}-3-sessions.png')
        p.click('.bmd-foot .ut-next'); p.wait_for_timeout(200)
        p.click(".bmd-chip[onclick*=\"'15m'\"]"); p.click(".bmd-chip[onclick*=\"'5m'\"]"); p.click(".bmd-chip[onclick*=\"'H1'\"]")
        check(f'{label}: max 2 entry charts', p.evaluate("() => document.querySelectorAll('.bmd-chip.on').length") == 2)
        shot(p, f'{label}-4-tfs.png')
        p.click('.bmd-foot .ut-next'); p.wait_for_timeout(300)
        d = p.evaluate("() => BMD.get()")
        check(f'{label}: DNA saved', d and d['concepts'] == ['ob','fvg','sweep','structure','keyrange'] and d['instr'] == ['XAUUSD','NAS100','GBPUSD'] and d['tfs'] == ['15m','5m'])
        check(f'{label}: Key Range + 5m entry → closest style Blue Mac Key', p.evaluate("() => BMD.closestStyle()") == 'key')
        shot(p, f'{label}-5-done.png')
        p.click('.bmd-foot .ut-next'); p.wait_for_timeout(400)
        check(f'{label}: "Open" jumps to that style', p.evaluate("() => S.style") == 'key' and not p.is_visible('#bmd-ov.on'))
        check(f'{label}: card becomes the DNA bar', p.evaluate("() => document.getElementById('bm-dna')?.className") == 'bmd-bar')
        p.locator('#bm-dna').scroll_into_view_if_needed(); shot(p, f'{label}-6-bar.png')
        p.wait_for_timeout(2000)
        check(f'{label}: DNA synced to the member profile', 'bm_dna_v1' in SERVER.get('anna', {}).get('state', {}).get('keys', {}))

        # Learn modal from a diagram, then Escape closes the picker
        p.click('#bm-dna .bmd-bar-e'); p.wait_for_timeout(200)
        p.click('.bmd-card .bmd-dg'); p.wait_for_timeout(300)
        check(f'{label}: tapping a diagram opens the lesson on top', p.is_visible('#ut-learn.on'))
        p.evaluate("() => UT.closeLearn()"); p.keyboard.press('Escape'); p.wait_for_timeout(200)
        check(f'{label}: Escape closes the picker', not p.is_visible('#bmd-ov.on'))
        ctx.close()

        # new device: DNA comes back from the profile
        ctx2 = br.new_context(viewport=vp); setup(ctx2); p2 = page_for(ctx2, ANNA); boot(p2)
        check(f'{label}: new device restores the DNA', (p2.evaluate("() => BMD.get()") or {}).get('instr') == ['XAUUSD','NAS100','GBPUSD'])
        check(f'{label}: new device shows the DNA bar', p2.evaluate("() => document.getElementById('bm-dna')?.className") == 'bmd-bar')
        # logout wipes it
        p2.evaluate("() => BMS.clear()")
        check(f'{label}: logout wipes the DNA + card resets', p2.evaluate("() => !BMD.get() && document.getElementById('bm-dna').className === 'bmd-cta'"))
        ctx2.close()

    check('no page errors', not errors)
    if errors: print('\n'.join(errors[:10]))
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
