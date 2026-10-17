# Stylesheet sanity: every <style> block's braces balance (a missing "{" silently kills the NEXT rule too),
# and key rules really load in the browser.
#   PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers python3 tests/test_css.py . tests
import re, sys, functools, threading, http.server, socketserver
from playwright.sync_api import sync_playwright
ROOT = sys.argv[1]
fails = []
def check(label, cond):
    print(('PASS ' if cond else 'FAIL ') + label)
    if not cond: fails.append(label)
html = open(ROOT + '/index.html').read()
for i, css in enumerate(re.findall(r'<style[^>]*>(.*?)</style>', html, re.S)):
    d, bad = 0, None
    for k, ch in enumerate(css):
        d += ch == '{'; d -= ch == '}'
        if d < 0: bad = html[:html.index(css) + k].count('\n') + 1; break
    check(f'<style> block {i + 1}: braces balance' + (f' (stray "}}" at index.html line {bad})' if bad else ''), d == 0 and not bad)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as pw:
    br = pw.chromium.launch(); p = br.new_page(); p.route('**/*', lambda r: r.continue_() if '127.0.0.1' in r.request.url else r.abort())
    p.goto(f'http://127.0.0.1:{srv.server_address[1]}/index.html', wait_until='domcontentloaded')
    r = p.evaluate("""() => { const rules = []; for(const sh of document.styleSheets){ try { for(const r of sh.cssRules) if(r.selectorText) rules.push(r); } catch(e){} }
      return { lift: rules.some(r => r.selectorText.includes('.j-save-btn:hover') && r.style.transform.includes('translateY(-2px)')),
               quiz: rules.some(r => r.selectorText.trim() === '.quiz-option.sel' && r.style.boxShadow.includes('228')),
               // every rule the browser kept has a real selector (a swallowed rule shows up as a selector full of declarations)
               junk: rules.filter(r => /[a-z-]+\\s*:\\s*[^:]+;/.test(r.selectorText)).map(r => r.selectorText.slice(0, 80)) }; }""")
    check('Save / confirm buttons lift on hover (rule loads)', r['lift'])
    check('Style-quiz selected answer is highlighted (rule loads)', r['quiz'])
    check(f'no rule swallowed into a selector {r["junk"] or ""}', not r['junk'])
    br.close()
print('\nRESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL')
