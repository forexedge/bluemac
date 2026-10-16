# "Your next step" guide (coach.js): a brand-new member's whole journey on uTrade Ideas
# (pick → read → answer → result → idea → save → journal), blocked / weak setups, the
# one-line guides on Journal / Rules / Examples / Education, hide / show, profile sync.
#   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_coach.py . tests [shots_dir]
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
    if name == 'bm_load': r = SERVER.get(uid, {}); return json.dumps({'data':{'comp':True, 'tier':'free', 'state':r.get('state', {}), 'ts':r.get('ts')}, 'error':None})
    if name == 'bm_save_state': SERVER[uid] = {'state':a['s'], 'ts':time.time()}; return json.dumps({'data':'now', 'error':None})
    if name == 'bm_ideas_left': return json.dumps({'data':{'used':0, 'limit':2}, 'error':None})
    return json.dumps({'data':'ok', 'error':None})
errors = []; fails = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)
FAKE_AI = '[LONG_IDEA]\nSIGNAL_CANDLE: x\nWAIT_CONDITION: None\nINVALIDATION: x\nMANAGEMENT: x\nREASONING: x\n[/LONG_IDEA]\n[SHORT_IDEA]\nSIGNAL_CANDLE: x\nWAIT_CONDITION: x\nINVALIDATION: x\nMANAGEMENT: x\nREASONING: x\n[/SHORT_IDEA]'
def setup(ctx):
    ctx.expose_function('__rpc', rpc)
    def route(r):
        u = r.request.url
        if 'supabase-js' in u: return r.fulfill(status=200, content_type='application/javascript', body=STUB)
        if 'functions/v1/trade-idea' in u: return r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*'}, body=json.dumps({'content':[{'type':'text', 'text':FAKE_AI}]}))
        if 'frankfurter' in u: return r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*'}, body=json.dumps({'rates':{'ZAR':18.0}}))
        if u.startswith(f'http://127.0.0.1:{PORT}'): return r.continue_()
        return r.abort()
    ctx.route('**/*', route)
def page(ctx, fresh=True):
    p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    p.add_init_script("window.__TU = {id:'anna', email:'anna@x.com'}; window.alert = () => {};")
    p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(300)
    p.evaluate("""fresh => { try{acceptDisclaimer();}catch(e){} localStorage.setItem('bm_tour_v1','done'); document.getElementById('bmt')?.remove();
      if(fresh) localStorage.setItem('bm_style_suggestion', 'day');
      const sp = document.getElementById('splash'); if(sp) sp.style.display='none';
      ['auth-gate','quiz-gate','disclaimer-gate'].forEach(i => { const e = document.getElementById(i); if(e) e.style.display='none'; }); BMC.paint(); }""", fresh)
    p.wait_for_timeout(200)
    return p
coach = lambda p: p.evaluate("() => { const c = document.querySelector('#bmc-checklist'); return { t: (c.querySelector('.bmc-tx b') || {}).textContent || '', s: (c.querySelector('.bmc-tx p') || {}).textContent || '', prog: (c.querySelector('.bmc-prog') || {}).textContent || '', now: (c.querySelector('.bmc-st.now span') || {}).textContent || '', btns: [...c.querySelectorAll('.bmc-bs button')].map(b => b.textContent) }; }")
def settle(p): p.wait_for_timeout(350)
def shot(p, name):
    if not SHOTS: return
    p.add_style_tag(content='*,*::before,*::after{animation:none!important;transition:none!important} #bmt-help{display:none!important}')
    p.evaluate("() => window.scrollTo(0, 0)"); p.wait_for_timeout(200); p.screenshot(path=os.path.join(SHOTS, name))
WALK = """over => { const s = UT._st; const def = UT._eval ? null : null;
  for(let g = 0; g < 30; g++){
    const panel = document.getElementById('guided-panel');
    if(panel.querySelector('.ut-res')) break;
    const lv = panel.querySelector('#ut-lv-err');
    if(lv){ const v = {price:'4000', swing_hi:'4040', swing_lo:'3980', zone_hi:'3999', zone_lo:'3990', liq_up:'4300', liq_dn:'3900', kr_hi:'4004', kr_lo:'3996', fib_hi:'4040', fib_lo:'3980', ma50:'3995', ma200:'3950', pdh:'4100', pdl:'3900'};
      panel.querySelectorAll('input[id^="ut-lv-"]').forEach(i => { const k = i.id.slice(6); i.value = v[k] || '3995'; });
      const b = document.getElementById('ut-c-bal'); if(b) b.value = '500000'; UT.submitLevels(); if(!panel.querySelector('.ut-res')) return 'levels: ' + lv.textContent; break; }
    if(panel.querySelector('.ut-inst')){ UT.pick('instrument', 'XAUUSD'); continue; }
    const multi = panel.querySelector('.ut-check');
    if(multi){ UT.next(); continue; }
    const opts = [...panel.querySelectorAll('.ut-opt')];
    if(!opts.length) return 'stuck: ' + panel.innerText.slice(0, 80);
    const id = (opts[0].getAttribute('onclick').match(/UT\\.pick\\('([^']+)'/) || [])[1];
    const vals = opts.map(o => (o.getAttribute('onclick').match(/'[^']+','([^']+)'\\)/) || [])[1]);
    const tones = opts.map(o => o.className);
    if(over[id] !== undefined){ UT.pick(id, over[id]); continue; }
    let i = tones.findIndex(c => / bull/.test(c)); if(i < 0) i = tones.findIndex(c => / neut/.test(c)); if(i < 0) i = 0;
    UT.pick(id, vals[i]);
  } return 'ok'; }"""

with sync_playwright() as pw:
    br = pw.chromium.launch()
    for label, vp in [('phone', {'width':390, 'height':844}), ('desktop', {'width':1280, 'height':900})]:
        SERVER.clear()
        ctx = br.new_context(viewport=vp); setup(ctx); p = page(ctx)
        L = lambda s: f'{label}: {s}'
        check(L('old "Guided Mode" welcome banner is gone'), not p.is_visible('#welcome-banner'))
        c = coach(p); print('  ', c)
        check(L('new member: Step 1 — pick how you trade, 0/4'), 'Step 1' in c['t'] and c['prog'] == '0/4 done' and c['now'] == 'Pick how you trade')
        check(L('one-tap button for the style the placement test picked (Day Trade) + build my own'), c['btns'][:1] == ['Use Day Trade — matched to you'] and 'Build my own strategy' in c['btns'])
        check(L('guide sits at the very top of uTrade Ideas'), p.evaluate("() => document.getElementById('pg-checklist').firstElementChild.id === 'bmc-checklist'"))
        shot(p, f'{label}-c1-start.png')

        p.click("#bmc-checklist .bmc-b1"); settle(p)
        c = coach(p); print('  ', c)
        check(L('tapped → Day Trade opens, step 1 ticked, guide explains the "what you need to know" card'), p.evaluate("() => S.style") == 'day' and c['prog'] == '1/4 done' and 'Quick read' in c['t'])
        shot(p, f'{label}-c2-know.png')
        p.evaluate("() => UT.knowReady()"); settle(p)
        c = coach(p); print('  ', c)
        check(L('Step 2 — question 1 with the question itself'), 'question 1' in c['t'] and len(c['s']) > 20)
        shot(p, f'{label}-c3-question.png')
        p.evaluate("() => UT.pick('instrument','XAUUSD')"); settle(p)
        c2 = coach(p)
        check(L('guide follows along (question 2, names the chart when there is one)'), 'question 2' in c2['t'])
        r = p.evaluate(WALK, {}); settle(p)
        c = coach(p); print('  ', r, c)
        check(L('result screen → Step 3: tap Generate, step 2 ticked'), r == 'ok' and 'Step 3' in c['t'] and c['prog'] == '2/4 done')
        shot(p, f'{label}-c4-result.png')
        p.click("#bmc-checklist .bmc-b1"); p.wait_for_timeout(300)
        check(L('"Show me the button" highlights Generate'), p.evaluate("() => document.querySelector('#guided-panel .ut-fire').classList.contains('bmc-flash')"))
        p.evaluate("() => UT.fire()"); p.wait_for_selector('.ut-idea', timeout=10000); settle(p)
        c = coach(p); print('  ', c)
        check(L('idea shown → Step 4: save it, 3/4'), 'Step 4' in c['t'] and c['prog'] == '3/4 done')
        shot(p, f'{label}-c5-idea.png')
        p.evaluate("() => takeThisTrade('monitoring')"); p.wait_for_timeout(800); settle(p)
        c = coach(p); print('  ', c)
        check(L('saved → 4/4 and "now manage it" with Journal button'), c['prog'] == '4/4 done' and 'manage' in c['t'].lower() and 'Open my Journal' in c['btns'])
        shot(p, f'{label}-c6-saved.png')

        # blocked + weak setups
        p.evaluate("() => restartGuided()"); p.evaluate(WALK, {'news':'soon'}); settle(p)
        check(L('blocked setup → "No trade — that\'s the system working"'), 'system working' in coach(p)['t'])

        # other tabs
        p.evaluate("() => { S.log = []; BMC.nav('journal'); }"); p.wait_for_timeout(500)
        t = p.inner_text('#bmc-journal')
        check(L('Journal guide (no trades yet → where trades come from)'), 'Take This Trade' in t or 'open trade' in t)
        p.evaluate("() => { S.log = [{style:'day', pair:'XAUUSD', outcome:'pending', score:80}, {style:'day', pair:'EURUSD', outcome:'win', score:80}]; renderJournal(); }"); p.wait_for_timeout(300)
        t = p.inner_text('#bmc-journal'); print('   journal:', t.replace('\n', ' '))
        check(L('Journal guide: 1 open trade → mark Win / Loss / BE, 1/20 closed'), '1 open trade' in t and '1/20' in t)
        shot(p, f'{label}-c7-journal.png')
        p.evaluate("() => BMC.nav('rules')"); p.wait_for_timeout(400)
        t = p.inner_text('#bmc-rules'); print('   rules:', t.replace('\n', ' '))
        check(L('Rules guide names the style they trade (Day Trade)'), 'Day Trade' in t)
        p.click('#bmc-rules .bmc-b1'); p.wait_for_timeout(300)
        check(L('"Show Day Trade rules" switches the Rules page'), 'Day' in p.inner_text('.srt.on'))
        p.evaluate("() => BMC.nav('examples')"); p.wait_for_timeout(400)
        check(L('Examples guide → search'), 'search' in p.inner_text('#bmc-examples').lower())
        p.click('#bmc-examples .bmc-b1'); p.wait_for_timeout(300)
        check(L('"Search now" puts the cursor in the search box'), p.evaluate("() => document.activeElement && document.activeElement.id === 'ex-search-input'"))
        p.evaluate("() => BMC.nav('education')"); p.wait_for_timeout(500)
        t = p.inner_text('#bmc-education'); print('   education:', t.replace('\n', ' '))
        check(L('Education guide → start / continue a named module'), 'module' in t.lower() or 'Continue' in t)
        p.click('#bmc-education .bmc-b1'); p.wait_for_timeout(400)
        p.evaluate("() => { const l = BMU.MODULES[0].lessons[1]; BMU.lesson(BMU.MODULES[0].id, l.id); }"); p.wait_for_timeout(200)
        p.evaluate("() => BMC.nav('journal')"); p.wait_for_timeout(200); p.evaluate("() => BMC.nav('education')"); p.wait_for_timeout(400)
        t = p.inner_text('#bmc-education')
        check(L('after opening a lesson, Education says "Continue: <that lesson>"'), 'Continue:' in t)
        shot(p, f'{label}-c8-education.png')

        # hide / show
        p.click('#bmc-education .bmc-x'); p.wait_for_timeout(200)
        check(L('guide hides and leaves a small "show" button'), p.is_visible('#bmc-education .bmc-show') and not p.is_visible('#bmc-education .bmc-line'))
        p.click('#bmc-education .bmc-show'); p.wait_for_timeout(200)
        check(L('and comes back'), p.is_visible('#bmc-education .bmc-line'))
        p.wait_for_timeout(1700)
        check(L('progress synced to the member profile'), 'bm_path_v1' in SERVER.get('anna', {}).get('state', {}).get('keys', {}))
        ctx.close()

        ctx2 = br.new_context(viewport=vp); setup(ctx2); p2 = page(ctx2, fresh=False)
        check(L('new device: progress comes back (4/4)'), coach(p2)['prog'] == '4/4 done')
        p2.evaluate("() => BMS.clear()"); p2.evaluate("() => BMC.paint()")
        check(L('logout wipes it (next member starts at 0/4)'), coach(p2)['prog'] == '0/4 done')
        ctx2.close()

    check('no page errors', not errors)
    if errors: print('\n'.join(errors[:10]))
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
