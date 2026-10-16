# Quick Idea concept blocks (quick.js): the personal strategy built from a member's DNA.
# Checks question sets per DNA, scoring + gates, engine prices and Blue Mac risk rules,
# diagrams on every option, and the AI prompt (their concepts, never the banned words).
#   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_quick.py . tests [shots_dir]
import json, sys, time, threading, functools, http.server, socketserver, os
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

FAKE_AI = '[LONG_IDEA]\nSIGNAL_CANDLE: bullish close\nWAIT_CONDITION: None — setup is confirmed\nINVALIDATION: close below zone\nMANAGEMENT: partials at TP1\nREASONING: order block held.\n[/LONG_IDEA]\n[SHORT_IDEA]\nSIGNAL_CANDLE: x\nWAIT_CONDITION: x\nINVALIDATION: x\nMANAGEMENT: x\nREASONING: weaker.\n[/SHORT_IDEA]'

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

def start(p, dna):
    return p.evaluate("""d => { localStorage.setItem('bm_dna_v1', JSON.stringify(Object.assign({v:1, sessions:['london']}, d)));
      const plan = BMQ.plan(); setStyle('quick', null); return plan; }""", dna)

def answer(p, picks):
    for qid, v in picks:
        cur = p.evaluate("() => BMQ && UT._st.step < 99 ? (UT._st && document.querySelector('.ut-card') ? 1 : 0) : 0")
        if isinstance(v, list):
            for x in v: p.evaluate(f"() => UT.toggle('{qid}','{x}')")
            p.evaluate("() => UT.next()")
        else:
            p.evaluate(f"() => UT.pick('{qid}','{v}')")

def levels(p, lv, bal='20000'):
    p.evaluate("""([lv, bal]) => { Object.entries(lv).forEach(([k, v]) => { const el = document.getElementById('ut-lv-' + k); if(el) el.value = v; });
      const b = document.getElementById('ut-c-bal'); if(b) b.value = bal; UT.submitLevels(); }""", [lv, bal])

def result(p):
    return p.evaluate("""() => { const ev = UT._st.result; const s = UT._st;
      const pl = ev && !ev.blocked ? UT._plan(ev.bias) : null;
      return { done: s.step >= 99 || !!document.querySelector('.ut-res'), score: ev && ev.score, grade: ev && ev.grade, blocked: ev && ev.blocked, waiting: ev && ev.waiting,
        gates: ev ? ev.gates.map(g => g.q + ': ' + g.l) : [], warns: ev ? ev.warns : [], risk: ev && ev.risk, bias: ev && ev.bias,
        plan: pl && !pl.error ? { e1: pl.e1, e2: pl.e2, sl: pl.sl, tp1: pl.tp1, tp2: pl.tp2, rr1: +pl.rr1, rr2: +pl.rr2, dir: pl.dir, noRoom: pl.noRoom, mins: pl.mins } : (pl && pl.error),
        canFire: !!document.querySelector('.ut-fire[data-ai]:not([disabled])') }; }""")

def risk_rules(label, r, mins):
    pl = r['plan']
    check(f'{label}: engine built a plan', isinstance(pl, dict))
    if not isinstance(pl, dict): return
    d = pl['dir']
    check(f'{label}: TP1 ≥ 1:{mins[0]} and TP2 ≥ 1:{mins[1]} after spread', pl['rr1'] >= mins[0] and pl['rr2'] >= mins[1])
    check(f'{label}: Entry 2 between Entry 1 and the stop', d * (pl['e1'] - pl['e2']) >= 0 and d * (pl['e2'] - pl['sl']) > 0)

def shot(p, name):
    if not SHOTS: return
    p.add_style_tag(content='*,*::before,*::after{animation:none!important;transition:none!important} #bmt-help{display:none!important}')
    p.evaluate("() => document.getElementById('guided-panel').scrollIntoView({block:'start'})"); p.wait_for_timeout(250)
    p.screenshot(path=os.path.join(SHOTS, name))

with sync_playwright() as pw:
    br = pw.chromium.launch()
    ctx = br.new_context(viewport={'width':390, 'height':844}); setup(ctx)
    p = ctx.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    p.add_init_script("window.__TU = {id:'anna', email:'anna@x.com'};")
    boot(p)

    # ── 1. SMC scalper: OB + FVG + sweep, gold, 15m ──
    pl = start(p, {'concepts':['ob','fvg','sweep'], 'instr':['XAUUSD','NAS100'], 'tfs':['15m']})
    print('   questions:', pl['questions'])
    check('1 SMC: 6 questions + levels (instrument, check, bias, sweep, zone, trigger)', pl['questions'] == ['Instrument','Quick check','Bias','Liquidity sweep','Your zone','Trigger','Levels'])
    check('1 SMC: H4 bias → 15m entry, min 1:2 / 1:3', pl['biasTF'] == 'H4' and pl['entryTF'] == '15m' and pl['minRR'] == [2,3])
    check('1 SMC: style banner shows Quick Idea', 'Quick Idea' in p.inner_text('#style-context'))
    check('1 SMC: their markets listed first', p.evaluate("() => document.querySelector('.ut-inst-gl').textContent") == 'Your markets')
    shot(p, 'q1-instrument.png')
    answer(p, [('instrument','XAUUSD'), ('safety','clear'), ('bias','up'), ('sweep','ssl')])
    zone_opts = p.evaluate("() => [...document.querySelectorAll('.ut-opt .ut-opt-t')].map(e => e.textContent)")
    print('   zone options:', zone_opts)
    check('1 SMC: zone question has ONLY OB/FVG options (+ OB with FVG inside first)', zone_opts[0].startswith('Bullish OB with an FVG') and not any('pocket' in z or 'resistance' in z for z in zone_opts))
    check('1 SMC: every visible option has a diagram', p.evaluate("() => [...document.querySelectorAll('.ut-opt')].every(o => o.querySelector('.ut-opt-dg svg'))"))
    shot(p, 'q2-zone.png')
    answer(p, [('zone','obfvg_bull'), ('trigger','choch_bull')])
    check('1 SMC: levels ask for zone + liquidity, not Key Range', p.evaluate("() => !!document.getElementById('ut-lv-zone_hi') && !!document.getElementById('ut-lv-liq_up') && !document.getElementById('ut-lv-kr_hi')"))
    shot(p, 'q3-levels.png')
    levels(p, {'price':'4180.0', 'swing_hi':'4195.0', 'swing_lo':'4170.0', 'zone_hi':'4181.0', 'zone_lo':'4176.0', 'liq_up':'4230.0'})
    r = result(p); print('   result:', r['score'], r['grade'], r['gates'], r['plan'])
    check('1 SMC: perfect answers → A+', r['grade'] == 'A+' and not r['blocked'] and not r['waiting'])
    risk_rules('1 SMC', r, [2,3])
    check('1 SMC: Generate button live', r['canFire'])
    shot(p, 'q4-result.png')
    p.evaluate("() => UT.fire()"); p.wait_for_selector('.ut-idea', timeout=10000); p.wait_for_timeout(300)
    pr = PROMPTS[-1] if PROMPTS else ''
    check('1 SMC: AI gets their DNA concepts', 'Order Blocks, Fair Value Gaps, Liquidity Sweeps' in pr)
    check('1 SMC: idea cards render, journal plan saved as quick', p.evaluate("() => document.querySelectorAll('.ut-idea').length === 2 && window._lastTradePlan.style === 'quick'"))
    shot(p, 'q5-idea.png')

    # gates on the same DNA
    p.evaluate("() => restartGuided()")
    answer(p, [('instrument','XAUUSD'), ('safety','news')])
    r = result(p); check('1 gate: red news → blocked, AI never offered', r['blocked'] and not r['canFire'])
    p.evaluate("() => restartGuided()")
    answer(p, [('instrument','XAUUSD'), ('safety','clear'), ('bias','range')])
    r = result(p); check('1 gate: sideways bias → blocked', r['blocked'])
    p.evaluate("() => restartGuided()")
    answer(p, [('instrument','XAUUSD'), ('safety','clear'), ('bias','up'), ('sweep','ssl'), ('zone','none'), ('trigger','choch_bull')])
    levels(p, {'price':'4180.0', 'swing_hi':'4195.0', 'swing_lo':'4170.0', 'liq_up':'4230.0'})
    r = result(p); check('1 gate: no zone → Watchlist (wait)', r['waiting'] and not r['blocked'])
    p.evaluate("() => restartGuided()")
    answer(p, [('instrument','XAUUSD'), ('safety','clear'), ('bias','up'), ('sweep','bsl')])
    answer(p, [('zone','ob_bull'), ('trigger','eng_bull')])
    levels(p, {'price':'4180.0', 'swing_hi':'4195.0', 'swing_lo':'4170.0', 'liq_up':'4230.0'})
    r = result(p); check('1 align: sweep against the bias → wait (critical)', r['waiting'])
    p.evaluate("() => restartGuided()")
    answer(p, [('instrument','XAUUSD'), ('safety','two'), ('bias','up'), ('sweep','ssl'), ('zone','ob_bull'), ('trigger','choch_bull')])
    levels(p, {'price':'4180.0', 'swing_hi':'4195.0', 'swing_lo':'4170.0', 'zone_hi':'4181.0', 'zone_lo':'4176.0', 'liq_up':'4230.0'})
    r = result(p); check('1 risk: 2 losses today → risk halved', r['risk'] and r['risk'] <= 0.5)

    # ── 2. Key Range + structure, 5m ──
    pl = start(p, {'concepts':['keyrange','structure','candles'], 'instr':['NAS100'], 'tfs':['5m']})
    print('   questions:', pl['questions'])
    check('2 Key: H1 bias → 5m entry, Key Range + structure questions, no zone question', pl['biasTF'] == 'H1' and 'Key Range' in pl['questions'] and 'Structure break' in pl['questions'] and 'Your zone' not in pl['questions'])
    answer(p, [('instrument','NAS100'), ('safety','clear'), ('bias','up')])
    txt = p.inner_text('#guided-panel').lower()
    check('2 Key: never says the banned words', 'orb' not in txt.split() and 'opening range' not in txt)
    shot(p, 'q6-keyrange.png')
    answer(p, [('keyrange','break_up'), ('structure','bos_bull')])
    first = p.evaluate("() => document.querySelector('.ut-opt .ut-opt-t').textContent")
    check('2 Key: picked structure + candles → CHoCH trigger first', 'choch' in first.lower())
    answer(p, [('trigger','eng_bull')])
    levels(p, {'price':'21000', 'swing_hi':'21040', 'swing_lo':'20980', 'kr_hi':'21010', 'kr_lo':'20990'})
    r = result(p); print('   result:', r['score'], r['grade'], r['gates'], r['plan'])
    check('2 Key: qualifies (A or better)', r['grade'] in ('A+','A') and not r['blocked'])
    if isinstance(r['plan'], dict) and r['plan'].get('noRoom'): print('   (no room — would be Watchlist)')
    risk_rules('2 Key', r, [2,3])
    p.evaluate("() => UT.fire()"); p.wait_for_selector('.ut-idea', timeout=10000)
    pr = PROMPTS[-1]
    check('2 Key: prompt protects the Key Range name', '"Key Range"' in pr and 'opening range' not in pr.lower() and ' orb' not in pr.lower())

    # ── 3. Swing trader: fib + MAs + S&R, H4 ──
    pl = start(p, {'concepts':['fib','ma','sr','rsi'], 'instr':['EURUSD'], 'tfs':['H4']})
    print('   questions:', pl['questions'])
    check('3 Swing: D1 bias → H4 entry, min 1:3 / 1:4', pl['biasTF'] == 'D1' and pl['minRR'] == [3,4])
    check('3 Swing: MA question + confluence (RSI) included, no sweep', '50/200 MAs' in pl['questions'] and 'Confluence' in pl['questions'] and 'Liquidity sweep' not in pl['questions'])
    answer(p, [('instrument','EURUSD'), ('safety','clear'), ('bias','up'), ('ma','bull')])
    zone_opts = p.evaluate("() => [...document.querySelectorAll('.ut-opt .ut-opt-t')].map(e => e.textContent)")
    check('3 Swing: zone = golden pocket + S/R flip only', any('pocket' in z for z in zone_opts) and any('support' in z for z in zone_opts) and not any('order block' in z.lower() for z in zone_opts))
    answer(p, [('zone','fib_bull'), ('trigger','choch_bull'), ('confluence',['div','level'])])
    levels(p, {'price':'1.0850', 'swing_hi':'1.0950', 'swing_lo':'1.0800', 'zone_hi':'1.0860', 'zone_lo':'1.0840', 'liq_up':'1.1150'})
    r = result(p); print('   result:', r['score'], r['grade'], r['gates'], r['plan'])
    risk_rules('3 Swing', r, [3,4])
    p.evaluate("() => restartGuided()")
    answer(p, [('instrument','EURUSD'), ('safety','clear'), ('bias','up'), ('ma','bear'), ('zone','fib_bull'), ('trigger','choch_bull'), ('confluence',[])])
    levels(p, {'price':'1.0850', 'swing_hi':'1.0950', 'swing_lo':'1.0800', 'zone_hi':'1.0860', 'zone_lo':'1.0840', 'liq_up':'1.1150'})
    r = result(p); check('3 Swing: MAs disagreeing with the bias → warning, not a block', not r['blocked'] and any('disagrees' in w for w in r['warns']))

    # candles-only trader: engulfing trigger shown first
    start(p, {'concepts':['candles','sr'], 'instr':['USDJPY'], 'tfs':['H1']})
    answer(p, [('instrument','USDJPY'), ('safety','clear'), ('bias','down'), ('zone','flip_bear')])
    first = p.evaluate("() => document.querySelector('.ut-opt .ut-opt-t').textContent")
    check('3b candles-only trader sees the engulfing trigger first', 'engulfing' in first.lower())

    # ── 4. Two entry charts → chart question changes everything ──
    pl = start(p, {'concepts':['ob'], 'instr':['GBPUSD'], 'tfs':['5m','H4']})
    check('4 Two charts: first question asks which chart', pl['questions'][0] == 'Entry chart')
    answer(p, [('chart','H4')])
    check('4 Two charts: picking H4 → minimum becomes 1:3 / 1:4', p.evaluate("() => BMQ.current().minRR") == [3,4])
    answer(p, [('instrument','GBPUSD'), ('safety','clear')])
    check('4 Two charts: bias question names the D1 chart', 'D1' in p.inner_text('.ut-q'))

    # ── 5. Five styles still untouched ──
    for k in ['scalp','day','swing','position','key']:
        p.evaluate(f"() => setStyle('{k}', document.querySelector('.style-tab.{k}'))")
        check(f'5 {k}: still renders its own questions', p.evaluate("() => !!document.querySelector('#guided-panel .ut-wrap')"))

    check('no page errors', not errors)
    if errors: print('\n'.join(errors[:10]))
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
