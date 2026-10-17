# Deep tap-through of the whole app (phone + desktop). Not a pass/fail spec of behaviour —
# it hunts for anything broken: page errors, console errors, dead "Learn" links, options without
# pictures, levels that can't be submitted, pages / tabs / lessons that fail to open.
# Also records every CSS class that ever appears on screen (used to prune dead styles safely).
#   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/crawl_all.py . tests [classes_out.json]
import json, sys, threading, functools, http.server, socketserver, time
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]; HERE = sys.argv[2]; CLS_OUT = sys.argv[3] if len(sys.argv) > 3 else None
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
    if name == 'bm_ideas_left': return json.dumps({'data':{'used':0, 'limit':99}, 'error':None})
    return json.dumps({'data':'ok', 'error':None})
FAKE_AI = '[LONG_IDEA]\nSIGNAL_CANDLE: x\nWAIT_CONDITION: None\nINVALIDATION: x\nMANAGEMENT: x\nREASONING: x\n[/LONG_IDEA]\n[SHORT_IDEA]\nSIGNAL_CANDLE: x\nWAIT_CONDITION: x\nINVALIDATION: x\nMANAGEMENT: x\nREASONING: x\n[/SHORT_IDEA]'
problems = []
def problem(where, what):
    problems.append(f'{where}: {what}'); print('  ✗', where, '—', what)

with sync_playwright() as pw:
    br = pw.chromium.launch()
    CLASSES = set()
    for label, vp in [('phone', {'width':390, 'height':844}), ('desktop', {'width':1280, 'height':900})]:
        SERVER.clear()
        ctx = br.new_context(viewport=vp); ctx.expose_function('__rpc', rpc)
        def route(r):
            u = r.request.url
            if 'supabase-js' in u: return r.fulfill(status=200, content_type='application/javascript', body=STUB)
            if 'functions/v1/trade-idea' in u: return r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Headers':'*'}, body=json.dumps({'content':[{'type':'text', 'text':FAKE_AI}]}))
            if 'frankfurter' in u: return r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin':'*'}, body=json.dumps({'rates':{'ZAR':18.0}}))
            if u.startswith(f'http://127.0.0.1:{PORT}'): return r.continue_()
            return r.abort()
        ctx.route('**/*', route)
        p = ctx.new_page()
        perr, cerr = [], []
        p.on('pageerror', lambda e: perr.append(str(e)))
        p.on('console', lambda m: cerr.append(m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
        p.add_init_script("window.__TU = {id:'anna', email:'anna@x.com'}; window.alert = m => (window.__alerts = (window.__alerts || [])).push(m); window.confirm = () => true;")
        p.goto(URL); p.wait_for_function('window.BMS && BMS.ready', timeout=20000); p.wait_for_timeout(400)
        p.evaluate("""() => { try{acceptDisclaimer();}catch(e){} localStorage.setItem('bm_tour_v1','done'); document.getElementById('bmt')?.remove();
          const sp = document.getElementById('splash'); if(sp) sp.style.display='none';
          ['auth-gate','quiz-gate','disclaimer-gate'].forEach(i => { const e = document.getElementById(i); if(e) e.style.display='none'; });
          window.__cls = new Set(); const grab = () => document.querySelectorAll('[class]').forEach(e => e.classList.forEach(c => __cls.add(c)));
          window.__grab = grab; new MutationObserver(() => { clearTimeout(window.__gt); window.__gt = setTimeout(grab, 30); }).observe(document.body, { subtree:true, childList:true, attributes:true, attributeFilter:['class'] }); grab();
          // fake journal insert
          _supabase.from = () => ({ insert(){ return { select(){ return { single: async () => ({ data:{ id:'db1' }, error:null }) }; } }; },
            select(){ return this; }, eq(){ return this; }, order(){ return Promise.resolve({ data:[], error:null }); }, update(){ return { eq: async () => ({ error:null }) }; }, delete(){ return { eq: async () => ({ error:null }) }; } }); }""")
        def errs(where):
            nonlocal_errs = perr[:] + cerr[:]
            for e in nonlocal_errs: problem(f'{label} {where}', 'ERROR ' + e[:200])
            perr.clear(); cerr.clear()

        # ── 1. Every Learn ref in the code resolves to an Examples card ──
        refs = p.evaluate("""() => { const src = [...document.scripts].map(s => s.src).filter(Boolean);
          return src; }""")
        import re, glob
        allsrc = open(ROOT + '/index.html').read() + ''.join(open(f).read() for f in glob.glob(ROOT + '/*.js'))
        ids = sorted(set(re.findall(r"""(?:ref\s*:\s*|UT\.learn\(\s*|D\.ref\(\s*|learn\(\s*)['"]((?:ex|pat|fib|smc|ind|mgt)-[a-z0-9-]+)['"]""", allsrc)))
        bad = p.evaluate("ids => ids.filter(r => !UT.exCard(r))", ids)
        print(f'[{label}] Learn refs checked: {len(ids)} · broken: {bad or "none"}')
        for b in bad: problem(label, f'Learn link points at a missing Examples card: {b}')

        # ── 2. Every style · every question · every answer ──
        styles = ['scalp', 'day', 'swing', 'position', 'key']
        for k in styles:
            r = p.evaluate("""k => {
              setStyle(k, document.querySelector('.style-tab.' + k)); if(UT.knowReady) UT.knowReady();
              const out = { tried: 0, questions: 0, noDg: [], deadLearn: [], stuck: [], levelErr: null, result: null };
              const panel = document.getElementById('guided-panel');
              const LV = { price:'4000', swing_hi:'4040', swing_lo:'3980', zone_hi:'3999', zone_lo:'3990', liq_up:'4200', liq_dn:'3900', kr_hi:'4004', kr_lo:'3996', pdh:'4150', pdl:'3850', w_up:'4300', w_dn:'3700', m_up:'4500', m_dn:'3500' };
              for(let guard = 0; guard < 40; guard++){
                const st = UT._st;
                if(panel.querySelector('.ut-res')) break;
                const lvErr = panel.querySelector('#ut-lv-err');
                if(lvErr){
                  panel.querySelectorAll('input[id^="ut-lv-"]').forEach(i => { const f = i.id.slice(6); i.value = LV[f] || '4000'; });
                  const b = document.getElementById('ut-c-bal'); if(b) b.value = '250000';
                  UT.submitLevels(); if(!panel.querySelector('.ut-res')){ out.levelErr = lvErr.textContent; break; } continue;
                }
                if(panel.querySelector('.ut-inst')){ out.questions++; UT.pick('instrument', 'XAUUSD'); continue; }
                const opts = [...panel.querySelectorAll('.ut-opt')];
                if(!opts.length){ out.stuck.push('no options at step ' + st.step + ': ' + panel.innerText.slice(0, 60)); break; }
                out.questions++;
                const multi = !!panel.querySelector('.ut-check');
                const compact = !!panel.querySelector('.ut-opts.compact');
                // reveal hidden (against-bias) options too
                const more = panel.querySelector('.ut-more'); if(more) more.click();
                const all = [...panel.querySelectorAll('.ut-opt')];
                // session questions show the live SAST clock above the options instead of a picture per option — that's by design
                const live = !!panel.querySelector('.ut-card .ut-live');
                all.forEach(o => { if(!compact && !live && !o.querySelector('.ut-opt-dg svg')) out.noDg.push(st.step + ':' + o.querySelector('.ut-opt-t').textContent); });
                panel.querySelectorAll('[onclick*="UT.learn("]').forEach(b => { const ref = (b.getAttribute('onclick').match(/UT\\.learn\\('([^']+)'/) || [])[1]; if(ref && !UT.exCard(ref)) out.deadLearn.push(ref); });
                const parse = o => o.getAttribute('onclick').match(/UT\\.(pick|toggle)\\('([^']+)','([^']+)'\\)/);
                const vals = all.map(parse).filter(Boolean);
                const id = vals[0][2];
                const snap = JSON.stringify({ step: st.step, ans: st.ans, lv: st.lv });
                // try EVERY answer, then restore
                for(const m of vals){
                  out.tried++;
                  const s0 = JSON.parse(snap);
                  if(multi){ UT.toggle(id, m[3]); UT.toggle(id, m[3]); }
                  else { UT.pick(id, m[3]); if(!panel.querySelector('.ut-card, .ut-res')) out.stuck.push('after ' + id + '=' + m[3]); }
                  Object.assign(UT._st, { step: s0.step, ans: s0.ans, lv: s0.lv, result: null, _drawn: -1 }); UT.render();
                }
                if(multi){ UT.next(); continue; }
                // continue the walk with the strongest bullish answer
                const ok = all.filter(o => !/ (block|wait)( |$)/.test(o.className));
                const pick = ok.find(o => / bull( |$)/.test(o.className)) || ok.find(o => / neut( |$)/.test(o.className)) || ok[0] || all[0];
                const pm = parse(pick); UT.pick(pm[2], pm[3]);
              }
              const ev = UT._st.result;
              out.result = ev ? { grade: ev.grade, blocked: ev.blocked, waiting: ev.waiting, gates: ev.gates.map(g => g.q + ': ' + g.l) } : null;
              out.canFire = !!panel.querySelector('.ut-fire[data-ai]:not([disabled])');
              return out; }""", k)
            print(f'[{label}] {k}: {r["questions"]} questions · {r["tried"]} answers tried · result {r["result"]}')
            for x in r['noDg']: problem(f'{label} {k}', f'option without a picture: {x}')
            for x in sorted(set(r['deadLearn'])): problem(f'{label} {k}', f'dead Learn link: {x}')
            for x in r['stuck']: problem(f'{label} {k}', f'stuck: {x}')
            if r['levelErr']: problem(f'{label} {k}', f'levels rejected sensible prices: {r["levelErr"]}')
            if r['canFire']:
                p.evaluate("() => UT.fire()")
                try: p.wait_for_selector('.ut-idea', timeout=8000)
                except Exception: problem(f'{label} {k}', 'idea cards did not render')
                p.evaluate("() => takeThisTrade('active')"); p.wait_for_timeout(300)
                if 'Saved to Journal' not in p.inner_text('#guided-panel'): problem(f'{label} {k}', 'Save to Journal did not confirm')
            elif not (r['result'] or {}).get('waiting'):
                problem(f'{label} {k}', f'could not reach a trade idea on the strongest answers: {r["result"]}')
            # learn modal opens & closes for one ref
            p.evaluate("() => { const b = document.querySelector('#guided-panel [onclick*=\"UT.learn(\"]'); if(b) b.click(); }"); p.wait_for_timeout(100)
            p.evaluate("() => UT.closeLearn && UT.closeLearn()")
            p.evaluate("() => restartGuided()")
            errs(k)

        # ── 3. Pages, tabs, filters ──
        for page in ['journal', 'rules', 'examples', 'education', 'checklist']:
            p.evaluate("pg => goPage(pg, document.querySelector(`.nav-item[onclick*=\"goPage('${pg}'\"]`))", page); p.wait_for_timeout(250)
            if not p.evaluate("pg => document.getElementById('pg-' + pg).classList.contains('on')", page): problem(label, f'page {page} did not open')
            errs('page ' + page)
        p.evaluate("() => goPage('rules', document.querySelector(`.nav-item[onclick*=\"goPage('rules'\"]`))")
        n = p.evaluate("() => { const b = [...document.querySelectorAll('.srt')]; b.forEach(x => x.click()); return b.length; }"); p.wait_for_timeout(150)
        empty = p.evaluate("() => [...document.querySelectorAll('.srt')].filter(b => { b.click(); return document.getElementById('rules-content').innerText.length < 200; }).map(b => b.textContent)")
        for e in empty: problem(label, f'Rules tab empty: {e}')
        print(f'[{label}] Rules tabs: {n}'); errs('rules')
        p.evaluate("() => goPage('examples', document.querySelector(`.nav-item[onclick*=\"goPage('examples'\"]`))")
        f = p.evaluate("""() => { let n = 0, bad = [];
          document.querySelectorAll('.ex-filter').forEach(b => { b.click(); n++;
            const vis = [...document.querySelectorAll('.ex-card')].filter(c => c.offsetParent !== null).length; if(!vis) bad.push(b.textContent.trim());
            document.querySelectorAll('.ex-sub button, [class*="subtab"] button, .ex-subtab').forEach(s => { if(s.offsetParent){ s.click(); n++; } }); });
          return { n, bad, cards: document.querySelectorAll('.ex-card').length }; }""")
        print(f'[{label}] Examples: {f["cards"]} cards · {f["n"]} filters/sub-tabs clicked')
        for b in f['bad']: problem(label, f'Examples filter shows no cards: {b}')
        for q in ['order block', 'FVG', 'fib', 'H&S', 'rsi divergence', 'key range', 'zzzz']:
            p.fill('#ex-search-input', q); p.wait_for_timeout(120)
        p.evaluate("() => exSearchClear && exSearchClear()")
        # the Sessions card is a SAST time table by design (no chart)
        noDg = p.evaluate("() => [...document.querySelectorAll('.ex-card')].filter(c => !c.querySelector('svg') && c.dataset.cat !== 'sessions').map(c => (c.dataset.id || c.querySelector('.ex-card-title').textContent))")
        for x in noDg: problem(label, f'Examples card without a diagram: {x}')
        errs('examples')

        # ── 4. Education: every module, every lesson, every quiz ──
        u = p.evaluate("""() => { goPage('education', document.querySelector(`.nav-item[onclick*="goPage('education'"]`)); let m = 0, l = 0, q = 0, bad = [];
          BMU.MODULES.forEach(mod => { try { BMU.module(mod.id); m++; } catch(e){ bad.push('module ' + mod.id + ': ' + e.message); }
            mod.lessons.forEach(les => { try { BMU.lesson(mod.id, les.id); l++; if(document.querySelector('#pg-education').innerText.length < 150) bad.push('empty lesson ' + les.id); } catch(e){ bad.push('lesson ' + les.id + ': ' + e.message); } });
            try { BMU.quiz(mod.id); q++; } catch(e){ bad.push('quiz ' + mod.id + ': ' + e.message); } });
          BMU.home(); return { m, l, q, bad }; }""")
        print(f'[{label}] University: {u["m"]} modules · {u["l"]} lessons · {u["q"]} quizzes opened')
        for b in u['bad']: problem(label, b)
        errs('education')

        # ── 5. Journal: filters, a card open, outcome buttons ──
        p.evaluate("""() => { S.log = [{style:'day', pair:'XAUUSD', outcome:'pending', score:80, grade:'A', entry:'1', sl:'1', tp:'1', rr:'2', date:'17 Oct', time:'07:00', bias:'bull', notes:'x'},
          {style:'my1', pair:'EURUSD', outcome:'win', score:90, grade:'A+', entry:'1', sl:'1', tp:'1', rr:'3', date:'16 Oct', time:'09:00', bias:'bear', notes:'y'}];
          goPage('journal', document.querySelector(`.nav-item[onclick*="goPage('journal'"]`)); renderJournal();
          document.querySelectorAll('[onclick^="filterJournal"]').forEach(b => b.click());
          const h = document.querySelector('.j-card-header'); if(h) h.click(); if(typeof toggleAnalytics === 'function') { try { toggleAnalytics(); toggleAnalytics(); } catch(e){} } }""")
        p.wait_for_timeout(200); errs('journal')

        # ── 6. Setup guide, style quiz, tour ──
        p.evaluate("() => goPage('checklist', document.querySelector(`.nav-item[onclick*=\"goPage('checklist'\"]`))")
        p.evaluate("""() => { openSetupGuide(); document.querySelectorAll('.setup-guide-tab').forEach(t => t.click()); closeSetupGuide();
          openQuiz(); for(let i = 0; i < 8; i++){ const o = document.querySelector('#quiz-body .quiz-option'); if(!o) break; o.click(); const go = document.querySelector('#quiz-body .quiz-go-btn'); if(go) go.click(); }
          const ap = document.querySelector('#quiz-body [onclick*="applyQuizResult"]'); if(ap) ap.click(); else closeQuiz(); }""")
        p.wait_for_timeout(200); errs('setup guide / style quiz')
        t = p.evaluate("""async () => { localStorage.removeItem('bm_tour_v1'); BMT.start('full'); let n = 0;
          for(let i = 0; i < 80 && document.getElementById('bmt'); i++){ await new Promise(r => setTimeout(r, 120)); BMT.next(); n++; }
          const left = !!document.getElementById('bmt'); if(left) BMT.stop(); return { n, left }; }""")
        print(f'[{label}] Tour: {t["n"]} steps');
        if t['left']: problem(label, 'tour did not reach its end')
        errs('tour')

        # ── 7. Builder: every tool toggles, copy every style, save ──
        b = p.evaluate("""() => { const out = { toggled: 0, copied: 0, bad: [] };
          ['scalp','day','swing','position','key'].forEach(k => { BMB.edit(); BMB.start('style', k); out.copied++;
            for(let i = 1; i <= 5; i++){ BMB.goto(i); }
            const save = document.getElementById('bmb-save'); if(!save) out.bad.push('no save on ' + k); BMB.close(); });
          // a blank strategy can only move past Direction / Trigger once one is picked — pick one first, then toggle every card on/off
          BMB.edit(); BMB.start('blank'); BMB.toggle('dir', 'structure'); BMB.goto(2); BMB.goto(3); BMB.toggle('trig', 'choch');
          out.layers = {};
          ['dir','loc','trig','extra'].forEach((layer, i) => { BMB.goto(i + 1); const ids = [...document.querySelectorAll('#bmb-ov .bmd-card')].map(c => c.dataset.tool); out.layers[layer] = ids.length;
            ids.forEach(id => { const c = document.querySelector(`#bmb-ov .bmd-card[data-tool="${id}"]`); if(!c || !c.querySelector('svg')) out.bad.push('tool without picture ' + id);
              const was = BMB.list && document.querySelector(`#bmb-ov .bmd-card[data-tool="${id}"].on`); BMB.toggle(layer, id); BMB.toggle(layer, id);
              if(!!document.querySelector(`#bmb-ov .bmd-card[data-tool="${id}"].on`) !== !!was) out.bad.push('toggle did not restore ' + id); out.toggled++; }); });
          BMB.close(); return out; }""")
        print(f'[{label}] Builder: {b["toggled"]} tool cards toggled {b.get("layers")} · {b["copied"]} styles copied')
        for x in b['bad']: problem(label, x)
        errs('builder')

        # ── 8. A personal strategy end to end ──
        p.evaluate("""() => { localStorage.setItem('bm_strats_v1', JSON.stringify({ v:1, list:[{ id:'my1', name:'Crawler', tfs:['15m','H4'], instr:['XAUUSD'], sessions:['london'],
          dir:['structure','trendline'], loc:['ob','fvg','pat_flag','tltouch'], trig:['choch','pin','macd'], extra:['sweep','keyrange','pd','session','rsi_div','vwap','dxy'],
          custom:[{ t:'Asian high taken', must:true }, { t:'momentum', must:false }], rr:[3,4] }] })); BMB.reload(); BMB.open('my1'); }""")
        p.wait_for_timeout(200)
        r = p.evaluate("""() => { const panel = document.getElementById('guided-panel'); const def = BMQ.current(); let tried = 0;
          for(let g = 0; g < 40; g++){
            if(panel.querySelector('.ut-res')) break;
            if(panel.querySelector('#ut-lv-err')){ panel.querySelectorAll('input[id^="ut-lv-"]').forEach(i => { const f = i.id.slice(6); i.value = ({ price:'4000', swing_hi:'4040', swing_lo:'3980', zone_hi:'3999', zone_lo:'3990', liq_up:'4300', liq_dn:'3700', kr_hi:'4004', kr_lo:'3996' })[f] || '4000'; }); UT.submitLevels(); if(!panel.querySelector('.ut-res')) return { err: panel.querySelector('#ut-lv-err').textContent }; continue; }
            if(panel.querySelector('.ut-inst')){ UT.pick('instrument','XAUUSD'); continue; }
            const more = panel.querySelector('.ut-more'); if(more) more.click();
            const all = [...panel.querySelectorAll('.ut-opt')]; if(!all.length) return { err: 'stuck: ' + panel.innerText.slice(0, 80) };
            const m = o => o.getAttribute('onclick').match(/UT\\.(pick|toggle)\\('([^']+)','([^']+)'\\)/);
            const st = UT._st, snap = JSON.stringify({ step: st.step, ans: st.ans, lv: st.lv });
            if(panel.querySelector('.ut-check')){ all.forEach(o => { const x = m(o); UT.toggle(x[2], x[3]); tried++; }); UT.next(); continue; }
            all.forEach(o => { const x = m(o); UT.pick(x[2], x[3]); tried++; const s0 = JSON.parse(snap); Object.assign(UT._st, { step: s0.step, ans: s0.ans, lv: s0.lv, result: null, _drawn: -1 }); UT.render(); });
            const ok = [...panel.querySelectorAll('.ut-opt')].filter(o => !/ (block|wait)( |$)/.test(o.className));
            const pk = ok.find(o => / bull( |$)/.test(o.className)) || ok.find(o => / neut( |$)/.test(o.className)) || ok[0]; const x = m(pk); UT.pick(x[2], x[3]);
          }
          const ev = UT._st.result; return { tried, grade: ev && ev.grade, gates: ev ? ev.gates.map(g => g.q + ': ' + g.l) : [] }; }""")
        print(f'[{label}] personal strategy (every tool family): {r}')
        if r.get('err'): problem(label, 'personal strategy: ' + r['err'])
        errs('personal strategy')
        p.evaluate("() => window.__grab()")
        CLASSES |= set(p.evaluate("() => [...window.__cls]"))
        alerts = p.evaluate("() => window.__alerts || []")
        if alerts: print(f'[{label}] alerts shown:', alerts[:5])
        ctx.close()

    if CLS_OUT: json.dump(sorted(CLASSES), open(CLS_OUT, 'w'))
    br.close()
print('\nPROBLEMS:', len(problems))
for x in problems: print(' -', x)
