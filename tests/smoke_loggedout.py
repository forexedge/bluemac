import sys, functools, http.server, socketserver, threading
from playwright.sync_api import sync_playwright
ROOT, HERE = sys.argv[1], sys.argv[2]; STUB = open(HERE + '/sbstub.js').read()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
srv = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start(); PORT = srv.server_address[1]
errs = []
with sync_playwright() as pw:
    b = pw.chromium.launch(); c = b.new_context()
    c.route('**/*', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB) if 'supabase-js' in r.request.url else (r.continue_() if f':{PORT}/' in r.request.url else r.abort()))
    p = c.new_page(); p.on('pageerror', lambda e: errs.append(str(e)))
    p.goto(f'http://127.0.0.1:{PORT}/index.html'); p.wait_for_timeout(4000)
    print('auth gate shown:', p.evaluate("() => getComputedStyle(document.getElementById('auth-gate')).display !== 'none'"))
    print('nothing saved while logged out:', p.evaluate("() => !localStorage.getItem('bm_nav_v1') && !localStorage.getItem('bm_owner')"))
    print('page errors:', errs or 'none'); b.close()
