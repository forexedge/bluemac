# Strategy toolbox + personal uTrade Ideas (quick.js).
# Walks EVERY tool in EVERY layer: diagrams on every option, scoring, gates, engine prices
# and the Blue Mac risk rules; DNA starter strategies; own rules; stricter R:R; banned words.
#   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_quick.py . tests [shots_dir]
import json, sys, threading, functools, http.server, socketserver, os
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; HERE = sys.argv[2]; SHOTS = sys.argv[3] if len(sys.argv) > 3 else None
STUB = open(HERE + '/sbstub.js').read()
socketserver.TCPServer.allow_reuse_address = True
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); PORT = srv.server_address[1]
URL = f'http://127.0.0.1:{PORT}/index.html'

def rpc(name, args, uid):
    if name == 'bm_load': return json.dumps({'data':{'comp':True, 'tier':'free', 'state':{}, 'ts':None}, 'error':None})
    if name == 'bm_ideas_left': return json.dumps({'data':{'used':0, 'limit':2}, 'error':None})
    return json.dumps({'data':'ok', 'error':None})

errors = []; fails = []; PROMPTS = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)

FAKE_AI = '[LONG_IDEA]\nSIGNAL_CANDLE: bullish close\nWAIT_CONDITION: None — setup is confirmed\nINVALIDATION: close below zone\nMANAGEMENT: partials at TP1\nREASONING: held.\n[/LONG_IDEA]\n[SHORT_IDEA]\nSIGNAL_CANDLE: x\nWAIT_CONDITION: x\nINVALIDATION: x\nMANAGEMENT: x\nREASONING: weaker.\n[/SHORT_IDEA]'

def setup(ctx):
    ctx.expose_function('__rpc', rpc)
    def route(r):
        u = r.request.url
        if 'supabase-js' in u: return r.fulfill(status=200, content_type='application/javascript', body=STUB)
        if 'functions/v1/trade-idea' in u:
            if r.request.method == 'POST': PROMPTS.append(json.loads(r.request.post_data)['prompt'])
            return r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*'},
                             body=json.dumps({'content':[{'type':'text', 'text':FAKE_AI}], 'bm_usage':{'used':1, 'limit':2}}))
        if 'frankfurter' in u: return r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*'}, body=json.dumps({'rates':{'ZAR':18.0}}))
        if u.startswith(f'http://127.0.0.1:{PORT}'): return r.continue_()
        return r.abort()
    ctx.route('**/*', route)

def boot(p):
    p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(300)
    p.evaluate("""() => { try{acceptDisclaimer();}catch(e){} localStorage.setItem('bm_tour_v1','done');
      document.getElementById('bmt')?.remove(); const sp = document.getElementById('splash'); if(sp) sp.style.display='none';
      ['auth-gate','quiz-gate','disclaimer-gate'].forEach(i => { const e = document.getElementById(i); if(e) e.style.display='none'; }); }""")

# In-page walker: answers every question of the strategy (strongest bullish option unless overridden)
WALK = """([strategy, over, lv]) => {
  const def = BMQ.build(strategy); setStyle('quick', null);
  const out = { questions: def.questions.map(q => q.id), dgMissing: [], visited: [] };
  for(let guard = 0; guard < 40; guard++){
    const step = UT._st.step; if(step >= def.questions.length) break;
    const q = def.questions[step]; out.visited.push(q.id);
    if(q.options && !q.compact) document.querySelectorAll('#guided-panel .ut-opt').forEach(o => { if(!o.querySelector('.ut-opt-dg svg')) out.dgMissing.push(q.id + ':' + ((o.querySelector('.ut-opt-t') || {}).textContent || o.outerHTML.slice(0, 160))); });
    if(q.type === 'instrument'){ UT.pick('instrument', over.instrument || 'XAUUSD'); continue; }
    if(q.type === 'levels'){
      Object.entries(lv).forEach(([k, v]) => { const el = document.getElementById('ut-lv-' + k); if(el) el.value = v; });
      const b = document.getElementById('ut-c-bal'); if(b) b.value = '500000';
      if(!document.getElementById('ut-lv-err')){ out.levelErr = 'levels screen not shown: ' + document.getElementById('guided-panel').innerText.slice(0, 200); break; }
      UT.submitLevels(); if(UT._st.step === step){ out.levelErr = document.getElementById('ut-lv-err').textContent; break; } continue; }
    if(q.type === 'multi'){ (over[q.id] || q.options.map(o => o.v)).forEach(v => UT.toggle(q.id, v)); UT.next(); continue; }
    if(over[q.id] !== undefined){ UT.pick(q.id, over[q.id]); continue; }
    const ok = q.options.filter(o => !o.gate && (o.dir === 1 || !o.dir));
    const best = ok.sort((a, b) => (b.dir === 1) - (a.dir === 1) || (b.pts || 0) - (a.pts || 0))[0] || q.options[0];
    UT.pick(q.id, best.v);
  }
  const ev = UT._st.result, pl = ev && !ev.blocked ? UT._plan(ev.bias) : null;
  Object.assign(out, { score: ev && ev.score, grade: ev && ev.grade, blocked: ev && ev.blocked, waiting: ev && ev.waiting, risk: ev && ev.risk,
    gates: ev ? ev.gates.map(g => g.q + ': ' + g.l) : [], warns: ev ? ev.warns : [], minRR: def.minRR,
    plan: pl && !pl.error ? { e1: pl.e1, e2: pl.e2, sl: pl.sl, rr1: +pl.rr1, rr2: +pl.rr2, dir: pl.dir, noRoom: pl.noRoom } : (pl && pl.error) || null,
    canFire: !!document.querySelector('.ut-fire[data-ai]:not([disabled])') });
  return out;
}"""
LV = {'price':'4000', 'swing_hi':'4040', 'swing_lo':'3980', 'zone_hi':'3999', 'zone_lo':'3990', 'liq_up':'4200', 'liq_dn':'3900', 'kr_hi':'4004', 'kr_lo':'3996'}

def walk(p, strategy, over=None, lv=None):
    return p.evaluate(WALK, [strategy, over or {}, lv or LV])

def rules_ok(label, r):
    pl = r['plan']
    if not isinstance(pl, dict): check(f'{label}: engine built a plan ({pl})', False); return
    d, m = pl['dir'], r['minRR']
    check(f'{label}: TP1 ≥ 1:{m[0]} · TP2 ≥ 1:{m[1]} after spread · Entry 2 inside SL',
          pl['rr1'] >= m[0] and pl['rr2'] >= m[1] and d * (pl['e1'] - pl['e2']) >= 0 and d * (pl['e2'] - pl['sl']) > 0)

def shot(p, name, sel='#guided-panel'):
    if not SHOTS: return
    p.add_style_tag(content='*,*::before,*::after{animation:none!important;transition:none!important} #bmt-help{display:none!important}')
    p.evaluate(f"() => document.querySelector('{sel}').scrollIntoView({{block:'start'}})"); p.wait_for_timeout(250)
    p.screenshot(path=os.path.join(SHOTS, name))

with sync_playwright() as pw:
    br = pw.chromium.launch()
    ctx = br.new_context(viewport={'width':390, 'height':844}); setup(ctx)
    p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    p.add_init_script("window.__TU = {id:'anna', email:'anna@x.com'};")
    boot(p)
    tools = p.evaluate("() => Object.entries(BMQ.TOOLS).map(([id, t]) => ({ id, layer: t.layer, kind: t.kind || '', name: t.name }))")
    by = lambda L: [t['id'] for t in tools if t['layer'] == L]
    print(f"   toolbox: {len(tools)} tools · dir {len(by('dir'))} · loc {len(by('loc'))} · trig {len(by('trig'))} · extra {len(by('extra'))}")
    check('toolbox has 40+ tools', len(tools) >= 40)

    # ── A. Every tool has a builder picture ──
    nopic = p.evaluate("() => Object.keys(BMQ.TOOLS).filter(id => !/<svg/.test(BMQ.pic(id)))")
    check(f'A every tool has a picture for the builder {nopic or ""}', not nopic)

    # ── B. Every tool, run inside a minimal strategy ──
    base = {'tfs':['15m'], 'instr':['XAUUSD'], 'dir':['structure'], 'loc':['ob'], 'trig':['choch'], 'extra':[]}
    for t in tools:
        s = json.loads(json.dumps(base)); L = t['layer']
        if L == 'dir': s['dir'] = [t['id']]
        elif L == 'loc': s['loc'] = [t['id']]
        elif L == 'trig': s['trig'] = [t['id']]
        else: s['extra'] = [t['id']]
        r = walk(p, s)
        tag = f"B {L}:{t['id']}"
        ok_q = any(t['id'] in q or (L == 'loc' and q == 'zone') or (L == 'trig' and q == 'trigger') or (t['kind'] == 'tick' and q == 'confluence') for q in r['questions'])
        good = ok_q and not r['dgMissing'] and not r.get('levelErr') and not r['blocked'] and r['grade'] in ('A+', 'A', 'B')
        if not good: print('   ', tag, r['questions'], r['dgMissing'][:3], r.get('levelErr'), r['grade'], r['gates'])
        check(f'{tag}: asked, every option has a diagram, qualifies', good)
        pl = r['plan']; m = r['minRR']
        if not (isinstance(pl, dict) and pl['rr1'] >= m[0] and pl['rr2'] >= m[1] and pl['dir'] * (pl['e2'] - pl['sl']) > 0):
            check(f'{tag}: engine plan obeys the risk rules ({pl})', False)

    # ── C. A full named SMC strategy end to end + AI prompt ──
    smc = {'name':'Gold Sniper', 'tfs':['15m'], 'instr':['XAUUSD','NAS100'], 'dir':['structure','ma'], 'loc':['ob','fvg'], 'trig':['choch','engulf'],
           'extra':['sweep','pd','rsi_div','round'], 'custom':[{'t':'Price above the Asian high', 'must':True}, {'t':'London open momentum', 'must':False}]}
    r = walk(p, smc)
    print('   Gold Sniper:', r['questions'], r['score'], r['grade'])
    check('C named strategy: banner carries the name', 'Gold Sniper' in p.inner_text('#style-context'))
    check('C OB + FVG adds "OB with an FVG inside" first', p.evaluate("() => BMQ.current().questions.find(q => q.id === 'zone').options[0].l.includes('FVG inside')"))
    check('C must-have own rule = own question; nice-to-have = a tick', 'own0' in r['questions'] and p.evaluate("() => BMQ.current().questions.find(q => q.id === 'confluence').options.some(o => o.l === 'London open momentum')"))
    check('C perfect answers → A+', r['grade'] == 'A+' and not r['waiting'])
    rules_ok('C', r)
    shot(p, 't1-result.png')
    p.evaluate("() => UT.fire()"); p.wait_for_selector('.ut-idea', timeout=10000)
    pr = PROMPTS[-1]
    check('C AI gets the strategy name, its layers and own rules', '"Gold Sniper"' in pr and 'Order blocks, Fair value gaps' in pr and 'MUST: Price above the Asian high' in pr)
    check('C journal plan saved under the strategy', p.evaluate("() => window._lastTradePlan.style === 'quick'"))
    r = walk(p, smc, over={'own0':'no'}); check('C own must-rule not met → Watchlist', r['waiting'] and not r['blocked'])
    r = walk(p, smc, over={'safety':'news'}); check('C red news → blocked, no AI', r['blocked'] and not r['canFire'])
    r = walk(p, smc, over={'dir_structure':'range'}); check('C primary direction sideways → blocked', r['blocked'])
    r = walk(p, smc, over={'dir_ma':'bear'}); check('C second direction tool disagrees → warning, not a block', not r['blocked'] and any('disagrees' in w for w in r['warns']))
    r = walk(p, smc, over={'safety':'two'}); check('C 2 losses → half risk', r['risk'] and r['risk'] <= 0.5)
    r = walk(p, {'tfs':['H4'], 'dir':['trendline','structure'], 'loc':['fib'], 'trig':['pin']}, over={'dir_structure':'range'})
    check('C2 secondary "sideways" warns instead of blocking', not r['blocked'])

    # ── D. Stricter R:R is enforced; looser is ignored ──
    r = walk(p, {'tfs':['15m'], 'dir':['structure'], 'loc':['ob'], 'trig':['choch'], 'rr':[3,5]})
    check('D member R:R 1:3 / 1:5 on a 15m strategy is enforced', r['minRR'] == [3,5]); rules_ok('D', r)
    r = walk(p, {'tfs':['H4'], 'dir':['structure'], 'loc':['ob'], 'trig':['choch'], 'rr':[1,1]})
    check('D looser R:R than Blue Mac allows is ignored (H4 stays 1:3 / 1:4)', r['minRR'] == [3,4])

    # ── E. Two entry charts ──
    r = walk(p, {'tfs':['5m','H4'], 'dir':['structure'], 'loc':['ob'], 'trig':['choch']}, over={'chart':'H4'})
    check('E first question asks which chart; H4 → 1:3 / 1:4', r['questions'][0] == 'chart' and r['minRR'] == [3,4])

    # ── F. Key Range strategy never uses the banned words; no location = no zone question ──
    r = walk(p, {'tfs':['5m'], 'dir':['structure'], 'loc':[], 'trig':['engulf'], 'extra':['keyrange','session'], 'sessions':['london','ny']})
    p.evaluate("() => UT.fire()"); p.wait_for_selector('.ut-idea', timeout=10000)
    pr = PROMPTS[-1].lower()
    txt = ' '.join(p.evaluate("() => BMQ.current().questions.map(q => [typeof q.q === 'function' ? q.q({}) : q.q, q.help, ...(q.options || []).map(o => o.l + ' ' + (o.sub || ''))].join(' '))")).lower()
    words = (txt + ' ' + pr).replace('.', ' ').replace(',', ' ').split()
    check('F Key Range: no "ORB" / "opening range" in questions or AI prompt', 'opening range' not in txt + pr and 'orb' not in words)
    check('F no location tools → no zone question', 'zone' not in r['questions'])

    # ── G. DNA starter strategies ──
    p.evaluate("() => localStorage.setItem('bm_dna_v1', JSON.stringify({v:1, concepts:['ob','fvg','sweep','patterns','candles'], instr:['XAUUSD'], sessions:['london'], tfs:['15m']}))")
    st = p.evaluate("() => BMQ.fromDNA()")
    check('G DNA → starter strategy (OB, FVG, patterns, candles-first trigger, sweep)', st['loc'] == ['ob','fvg','pat_double','pat_hs'] and st['trig'][0] == 'engulf' and 'sweep' in st['extra'])
    r = walk(p, None); check('G build() with no strategy uses the DNA', 'x_sweep' in r['questions'] and r['grade'] == 'A+')

    # ── H. Bad input is cleaned, never crashes ──
    s = p.evaluate("() => BMQ.clean({ dir:['nope','ob'], loc:['structure','fvg','fvg'], trig:[], extra:['rsi_div'], tfs:['3m'], custom:[{t:''},{t:'x'.repeat(300), must:1}] })")
    check('H unknown / wrong-layer tools dropped, defaults filled, rule trimmed', s['dir'] == ['structure'] and s['loc'] == ['fvg'] and s['tfs'] == ['15m'] and len(s['custom']) == 1 and len(s['custom'][0]['t']) == 120)

    # ── I. The 5 Blue Mac styles are untouched ──
    for k in ['scalp','day','swing','position','key']:
        p.evaluate(f"() => setStyle('{k}', document.querySelector('.style-tab.{k}'))")
        check(f'I {k} still renders its own questions', p.evaluate("() => !!document.querySelector('#guided-panel .ut-wrap')"))

    # ── Contact sheet of every tool picture + the new bear mirrors ──
    if SHOTS:
        p.evaluate("""() => { const w = document.createElement('div'); w.id = 'sheet';
          w.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#050505;overflow:auto;padding:10px;display:grid;grid-template-columns:repeat(5,1fr);gap:8px;font:10px DM Mono,monospace;color:#B8B8BE';
          const add = (svg, label, b) => { const c = document.createElement('div'); c.style.cssText = `background:#121212;border:1px solid ${b};border-radius:8px;padding:4px`;
            c.innerHTML = `<div style="height:96px;overflow:hidden">${svg}</div><div>${label}</div>`; w.appendChild(c); };
          Object.entries(BMQ.TOOLS).forEach(([id, t]) => add(BMQ.pic(id), t.layer.toUpperCase() + ' · ' + t.name, '#222'));
          ['tlTrend','tlTouch','tlBreak','chanTrend','chanEdge','ichiTrend','pinBar','starTrig','emaCross','macdTrig','stochTrig','pivotTap'].forEach(k => add(UT.D.chart(UT.DG[k], -1), 'BEAR · ' + k, '#5a2a2a'));
          document.body.appendChild(w); }""")
        p.set_viewport_size({'width':1200, 'height':900}); p.wait_for_timeout(400)
        h = p.evaluate("() => document.getElementById('sheet').scrollHeight")
        p.set_viewport_size({'width':1200, 'height':min(h + 20, 4000)}); p.wait_for_timeout(300)
        p.screenshot(path=os.path.join(SHOTS, 'toolbox-sheet.png'))

    check('no page errors', not errors)
    if errors: print('\n'.join(errors[:10]))
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
