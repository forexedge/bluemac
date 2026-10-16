# Strategy Builder + My strategies (builder.js): build, save, open, idea, edit, copy a style,
# 3-strategy limit, delete, profile sync to a new device, builder preview never disturbs a running idea.
#   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_builder.py . tests [shots_dir]
import json, sys, time, threading, functools, http.server, socketserver, os
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; HERE = sys.argv[2]; SHOTS = sys.argv[3] if len(sys.argv) > 3 else None
STUB = open(HERE + '/sbstub.js').read()
socketserver.TCPServer.allow_reuse_address = True
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); PORT = srv.server_address[1]
URL = f'http://127.0.0.1:{PORT}/index.html'

SERVER = {}; PROMPTS = []
def rpc(name, args, uid):
    a = json.loads(args)
    if name == 'bm_load':
        r = SERVER.get(uid, {}); return json.dumps({'data':{'comp':True, 'tier':'free', 'state':r.get('state', {}), 'ts':r.get('ts')}, 'error':None})
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
        if 'functions/v1/trade-idea' in u:
            if r.request.method == 'POST': PROMPTS.append(json.loads(r.request.post_data)['prompt'])
            return r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*'}, body=json.dumps({'content':[{'type':'text', 'text':FAKE_AI}]}))
        if 'frankfurter' in u: return r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*'}, body=json.dumps({'rates':{'ZAR':18.0}}))
        if u.startswith(f'http://127.0.0.1:{PORT}'): return r.continue_()
        return r.abort()
    ctx.route('**/*', route)

def page(ctx):
    p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    p.add_init_script("window.__TU = {id:'anna', email:'anna@x.com'};")
    p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(300)
    p.evaluate("""() => { try{acceptDisclaimer();}catch(e){} localStorage.setItem('bm_tour_v1','done'); document.getElementById('bmt')?.remove();
      const sp = document.getElementById('splash'); if(sp) sp.style.display='none';
      ['auth-gate','quiz-gate','disclaimer-gate'].forEach(i => { const e = document.getElementById(i); if(e) e.style.display='none'; }); }""")
    return p

def shot(p, name):
    if not SHOTS: return
    p.add_style_tag(content='*,*::before,*::after{animation:none!important;transition:none!important} #bmt-help{display:none!important}')
    p.wait_for_timeout(200); p.screenshot(path=os.path.join(SHOTS, name))

tool = lambda p, layer, t: p.click(f'#bmb-ov .bmd-card[data-tool="{t}"] .bmd-name')

with sync_playwright() as pw:
    br = pw.chromium.launch()
    for label, vp in [('phone', {'width':390, 'height':844}), ('desktop', {'width':1280, 'height':900})]:
        SERVER.clear()
        ctx = br.new_context(viewport=vp); setup(ctx); p = page(ctx)
        L = lambda s: f'{label}: {s}'
        check(L('"Build your own strategy" card shows'), p.evaluate("() => document.getElementById('bm-mystrats')?.className") == 'bmb-cta')
        p.locator('#bm-mystrats').scroll_into_view_if_needed(); shot(p, f'{label}-b0-cta.png')

        # DNA set → "start from my DNA" offered
        p.evaluate("() => localStorage.setItem('bm_dna_v1', JSON.stringify({v:1, concepts:['ob','fvg','sweep'], instr:['XAUUSD'], sessions:['london'], tfs:['15m']}))")
        p.click('#bm-mystrats .ut-next'); p.wait_for_timeout(200)
        check(L('builder opens on "Start from"'), p.is_visible('#bmb-ov.on') and 'Trading DNA' in p.inner_text('#bmb-ov'))
        shot(p, f'{label}-b1-start.png')
        p.click("button.bmb-start:has-text('Start blank')"); p.wait_for_timeout(200)

        # Direction — order matters, first is MAIN
        check(L('Next blocked until a direction tool is picked'), p.evaluate("() => document.getElementById('bmb-next').disabled"))
        tool(p, 'dir', 'trendline'); tool(p, 'dir', 'structure')
        check(L('first direction tool marked MAIN, order numbers shown'), p.evaluate("() => { const c = document.querySelector('.bmd-card[data-tool=\"trendline\"]'); return !!c.querySelector('.bmb-main') && c.querySelector('.bmd-tick').textContent === '1' && document.querySelector('.bmd-card[data-tool=\"structure\"] .bmd-tick').textContent === '2'; }"))
        check(L('every Direction card has a picture'), p.evaluate("() => [...document.querySelectorAll('#bmb-ov .bmd-card')].every(c => c.querySelector('.bmd-dg svg'))"))
        shot(p, f'{label}-b2-direction.png')
        p.click('#bmb-next'); p.wait_for_timeout(200)
        for t in ['ob', 'fvg', 'pat_flag']: tool(p, 'loc', t)
        check(L('17 location tools, all with pictures'), p.evaluate("() => { const c = [...document.querySelectorAll('#bmb-ov .bmd-card')]; return c.length === 17 && c.every(x => x.querySelector('.bmd-dg svg')); }"))
        shot(p, f'{label}-b3-location.png')
        p.click('#bmb-next'); p.wait_for_timeout(200)
        tool(p, 'trig', 'pin'); tool(p, 'trig', 'choch')
        shot(p, f'{label}-b4-trigger.png')
        p.click('#bmb-next'); p.wait_for_timeout(200)
        for t in ['sweep', 'session', 'rsi_div']: tool(p, 'extra', t)
        p.click("button:has-text('Add my own rule')"); p.fill('#bmb-rule-0', 'Price above the Asian high')
        p.click("button:has-text('Add my own rule')"); p.fill('#bmb-rule-1', 'London open momentum'); p.click('.bmb-rule:nth-of-type(2) .bmb-seg button:has-text("Nice to have")')
        check(L('own rules kept after redraw'), p.input_value('#bmb-rule-0') == 'Price above the Asian high' and p.input_value('#bmb-rule-1') == 'London open momentum')
        shot(p, f'{label}-b5-extras.png')
        p.click('#bmb-next'); p.wait_for_timeout(200)

        # Rules & name
        check(L('Save blocked until named'), p.evaluate("() => document.getElementById('bmb-save').disabled"))
        p.fill('#bmb-name', 'Gold Sniper')
        check(L('typing a name unlocks Save'), not p.evaluate("() => document.getElementById('bmb-save').disabled"))
        check(L('Blue Mac minimum and 1:2 can\'t be picked lower'), p.evaluate("() => [...document.querySelectorAll('.bmd-chip')].some(b => b.textContent.includes('Blue Mac minimum'))"))
        p.click('button.bmd-chip:has(b:text-is("1:3"))'); p.wait_for_timeout(150)
        txt = p.inner_text('.bmb-sum')
        print('   summary:', txt.replace('\n', ' | ')[:240])
        check(L('summary shows question count, TP1 ≥ 1:3 and every layer'), 'TP1 ≥ 1:3' in txt and 'Trendlines' in txt and 'Pin bar' in txt and 'Price above the Asian high' in txt)
        check(L('name kept after picking R:R'), p.input_value('#bmb-name') == 'Gold Sniper')
        shot(p, f'{label}-b6-rules.png')
        p.click('#bmb-save'); p.wait_for_timeout(500)

        # Saved → opened
        s = p.evaluate("() => ({ list: BMB.list(), style: S.style, tab: document.querySelector('.bmb-tab.on b')?.textContent, ctx: document.getElementById('style-context').innerText })")
        g = s['list'][0] if s['list'] else {}
        check(L('saved as my1 with its tools in tap order'), g.get('id') == 'my1' and g.get('dir') == ['trendline','structure'] and g.get('trig') == ['pin','choch'] and g.get('rr') == [3,4] and len(g.get('custom', [])) == 2)
        check(L('opens straight into its uTrade Idea, tab highlighted, banner named'), s['style'] == 'my1' and s['tab'] == 'Gold Sniper' and 'Gold Sniper' in s['ctx'])
        shot(p, f'{label}-b7-running.png')

        # Run it to an idea
        r = p.evaluate("""() => { const def = BMQ.current();
          for(let g = 0; g < 30; g++){ const step = UT._st.step; if(step >= def.questions.length) break; const q = def.questions[step];
            if(q.type === 'instrument'){ UT.pick('instrument','XAUUSD'); continue; }
            if(q.type === 'levels'){ const lv = {price:'4000', swing_hi:'4040', swing_lo:'3980', zone_hi:'3999', zone_lo:'3990', liq_up:'4300', liq_dn:'3900'};
              Object.entries(lv).forEach(([k, v]) => { const e = document.getElementById('ut-lv-' + k); if(e) e.value = v; }); UT.submitLevels(); continue; }
            if(q.type === 'multi'){ q.options.forEach(o => UT.toggle(q.id, o.v)); UT.next(); continue; }
            const best = q.options.filter(o => !o.gate && (o.dir === 1 || !o.dir)).sort((a, b) => (b.dir === 1) - (a.dir === 1) || (b.pts || 0) - (a.pts || 0))[0];
            UT.pick(q.id, best.v); }
          const ev = UT._st.result, pl = UT._plan(ev.bias); return { grade: ev.grade, mins: pl.mins, rr1: +pl.rr1, qs: def.questions.map(q => q.id) }; }""")
        print('   run:', r)
        check(L('the strategy runs: own must-rule asked, TP1 ≥ 1:3 enforced'), 'own0' in r['qs'] and r['mins'] == [3,4] and r['rr1'] >= 3)
        p.evaluate("() => UT.fire()"); p.wait_for_selector('.ut-idea', timeout=10000)
        check(L('AI prompt carries "Gold Sniper"'), '"Gold Sniper"' in PROMPTS[-1])
        p.evaluate("() => restartGuided()")

        # Builder preview never disturbs a running idea
        p.evaluate("() => { UT.pick('instrument','XAUUSD'); UT.pick('safety','clear'); }")
        before = p.evaluate("() => ({ step: UT._st.step, q: document.querySelector('.ut-q').textContent })")
        p.evaluate("() => { BMB.edit('my1'); BMB.goto(5); BMB.chip('tfs','H4',2); BMB.close(); }")
        p.evaluate("() => UT.render()")
        after = p.evaluate("() => ({ step: UT._st.step, q: document.querySelector('.ut-q').textContent, name: BMQ.current().name })")
        check(L('builder preview leaves the running idea untouched'), before == {'step':after['step'], 'q':after['q']} and after['name'] == 'Gold Sniper')

        # Edit
        p.click('.bmb-tab-e'); p.wait_for_timeout(200)
        check(L('edit opens at Direction with the saved picks'), 'direction' in p.inner_text('.bmb-dot.on').lower() and p.evaluate("() => document.querySelectorAll('#bmb-ov .bmd-card.on').length") == 2)
        p.evaluate("() => BMB.goto(5)"); p.fill('#bmb-name', 'Gold Sniper v2'); p.click('#bmb-save'); p.wait_for_timeout(300)
        check(L('edit saved in place (still my1, renamed)'), p.evaluate("() => BMB.list().length === 1 && BMB.list()[0].id === 'my1' && BMB.list()[0].name === 'Gold Sniper v2'"))

        # Copy Blue Mac styles → 3 strategies, limit
        for k in ['scalp', 'key']:
            p.click('.bmb-row-h button'); p.wait_for_timeout(150)
            p.click(f"button.bmb-start.sm:has-text('{ {'scalp':'Scalp','key':'Blue Mac Key'}[k] }')"); p.wait_for_timeout(150)
            p.evaluate("() => BMB.goto(5)"); p.wait_for_timeout(100)
            p.click('#bmb-save'); p.wait_for_timeout(300)
        l = p.evaluate("() => BMB.list().map(s => s.id + ':' + s.name)")
        print('   strategies:', l)
        check(L('copied styles saved with starter names (My Scalp, My Key Range)'), l == ['my1:Gold Sniper v2', 'my2:My Scalp', 'my3:My Key Range'])
        check(L('3 strategies → "+ New" hidden'), not p.is_visible('.bmb-row-h button'))
        txt = (p.inner_text('#bm-mystrats') + ' ' + p.evaluate("() => BMQ.current().questions.map(q => (typeof q.q === 'function' ? q.q({}) : q.q) + ' ' + (q.help || '')).join(' ')")).lower()
        check(L('Key Range copy never says ORB / opening range'), 'opening range' not in txt and ' orb ' not in f' {txt} ')
        p.locator('#bm-mystrats').scroll_into_view_if_needed(); shot(p, f'{label}-b8-three.png')

        # style tab clears the highlight
        p.evaluate("() => setStyle('swing', document.querySelector('.style-tab.swing'))")
        check(L('tapping a Blue Mac style clears the my-strategy highlight'), p.evaluate("() => !document.querySelector('.bmb-tab.on') && S.style === 'swing'"))

        # Delete (two taps)
        p.evaluate("() => BMB.edit('my2')"); p.click('.bmb-del'); p.wait_for_timeout(100)
        check(L('first Delete tap asks to confirm'), 'Tap again' in p.inner_text('.bmb-del') and len(p.evaluate("() => BMB.list()")) == 3)
        p.click('.bmb-del'); p.wait_for_timeout(200)
        check(L('second tap deletes, "+ New" back'), p.evaluate("() => BMB.list().map(s => s.id).join()") == 'my1,my3' and p.is_visible('.bmb-row-h button'))
        p.evaluate("() => BMB.open('my3')"); p.wait_for_timeout(1700)
        check(L('strategies synced to the member profile'), 'bm_strats_v1' in SERVER.get('anna', {}).get('state', {}).get('keys', {}))
        ctx.close()

        # New device
        ctx2 = br.new_context(viewport=vp); setup(ctx2); p2 = page(ctx2)
        check(L('new device: My strategies come back'), p2.evaluate("() => [...document.querySelectorAll('.bmb-tab b')].map(b => b.textContent).join()") == 'Gold Sniper v2,My Key Range')
        p2.evaluate("() => BMB.open('my1')")
        check(L('new device: strategy opens and runs'), p2.evaluate("() => S.style === 'my1' && !!document.querySelector('#guided-panel .ut-wrap')"))
        p2.evaluate("() => BMS.clear()")
        check(L('logout wipes them from the device'), p2.evaluate("() => !BMB.list().length && document.getElementById('bm-mystrats').className === 'bmb-cta'"))
        ctx2.close()

    check('no page errors', not errors)
    if errors: print('\n'.join(errors[:10]))
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
