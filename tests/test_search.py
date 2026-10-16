# Examples search (fake Supabase, logged-in member)
import json, sys, threading, functools, http.server, socketserver
from playwright.sync_api import sync_playwright
ROOT, HERE = sys.argv[1], sys.argv[2]; STUB = open(HERE + '/sbstub.js').read()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); PORT = srv.server_address[1]
def rpc(name, args, uid):
    if name == 'bm_load': return json.dumps({'data':{'comp':True,'tier':'free','state':{},'ts':None},'error':None})
    return json.dumps({'data':None,'error':None})
errors, fails = [], []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)
SEED = {'tv_disclaimer_accepted':'1','tv_quiz_done':'1','bm_tour_v1':'done','bm_owner':'anna','bm_state_t':'1'}
with sync_playwright() as pw:
    br = pw.chromium.launch(); c = br.new_context(viewport={'width':390,'height':844}); c.expose_function('__rpc', rpc)
    c.route('**/*', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB) if 'supabase-js' in r.request.url else (r.continue_() if f':{PORT}/' in r.request.url else r.abort()))
    c.add_init_script("window.__TU={id:'anna',email:'anna@x.com'};" + "".join(f"localStorage.setItem({json.dumps(k)},{json.dumps(v)});" for k, v in SEED.items()))
    p = c.new_page(); p.on('pageerror', lambda e: errors.append(str(e)))
    p.goto(f'http://127.0.0.1:{PORT}/index.html'); p.wait_for_function('window.BMS && BMS.ready', timeout=20000)
    p.evaluate("()=>{const s=document.getElementById('splash'); if(s) s.style.display='none';}")
    p.evaluate("""()=>goPage('examples',document.querySelector(".nav-item[onclick*=\\"goPage('examples'\\"]"))"""); p.wait_for_timeout(500)
    total = p.evaluate("()=>exIndex().length"); print('cards indexed:', total)
    check('every lesson is searchable (138)', total == 138)
    def q(text, jump=False):
        p.fill('#ex-search-input', text)
        if jump: p.press('#ex-search-input', 'Enter')
        p.wait_for_timeout(350)
        return p.evaluate("""()=>{const v=[...document.querySelectorAll('#examples-grid .ex-card')].filter(c=>c.style.display!=='none');
          v.sort((a,b)=>(+a.style.order||0)-(+b.style.order||0)); return v.map(c=>c.querySelector('.ex-card-title').textContent.trim())}""")
    r = q('order blocks'); print('  order blocks →', r[:4])
    check('"order blocks" → order block lessons first', len(r) >= 3 and 'order block' in r[0].lower())
    check('"OB" finds the same', 'order block' in (q('OB') or [''])[0].lower())
    check('"FVG" → fair value gap', 'fair value gap' in (q('fvg') or [''])[0].lower())
    r = q('rsi'); check('"RSI" → RSI lesson first', r and 'rsi' in r[0].lower())
    r = q('h&s'); check('"H&S" → head and shoulders', r and 'head' in r[0].lower())
    r = q('fib'); check('"fib" → Fibonacci lessons', len(r) >= 10)
    r = q('key levels'); print('  key levels →', r[:3]); check('"key levels" works (not hijacked by Key Range)', len(r) >= 1)
    r = q('double top'); check('"double top" → double top first', r and 'double top' in r[0].lower())
    check('filter bar hidden while searching', p.is_hidden('.examples-filter-bar'))
    r = q('zzqqx'); check('no results → helpful message', r == [] and 'No lessons' in p.inner_text('#ex-search-info'))
    p.screenshot(path='/tmp/search_none.png')
    q('order block', jump=True)
    check('Enter jumps to the best match (scrolled + highlighted)', p.evaluate("()=>{const el=document.querySelector('.ex-card.ex-hit'); if(!el) return false; const r=el.getBoundingClientRect(); return r.top < 300 && r.top > -50}"))
    p.wait_for_timeout(200); p.screenshot(path='/tmp/search_jump.png')
    p.evaluate("()=>window.scrollTo(0,0)"); q('fvg'); p.screenshot(path='/tmp/search_fvg.png')
    p.click('.ex-search-x'); p.wait_for_timeout(300)
    vis = p.evaluate("()=>[...document.querySelectorAll('#examples-grid .ex-card')].filter(c=>c.style.display!=='none').length")
    check('clear → back to the "All" tab, filter bar back', p.is_visible('.examples-filter-bar') and vis == 20)
    q('rsi'); p.evaluate("""()=>filterExamples('smc',document.querySelector(".ex-filter[onclick*=\\"'smc'\\"]"))"""); p.wait_for_timeout(500)
    check('tapping a tab ends the search', p.input_value('#ex-search-input') == '' and p.is_visible('.examples-filter-bar'))
    check('zero page errors', not errors)
    for e in errors[:5]: print('  ERR', e[:200])
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
