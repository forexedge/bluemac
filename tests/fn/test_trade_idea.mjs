import fs from 'fs'; import { createRequire } from 'module';
const ts = createRequire(import.meta.url)('/opt/npm-tools/node_modules/typescript');
let src = fs.readFileSync(process.argv[2], 'utf8').replace(/^import \{ serve \}.*$/m, 'const serve = (h) => { globalThis.__H = h; };');
fs.writeFileSync('./fn.mjs', ts.transpileModule(src, { compilerOptions: { target: 99, module: 99 } }).outputText);
// ── fakes ──
const env = { SUPABASE_URL:'https://sb', SUPABASE_SERVICE_ROLE_KEY:'srk', ANTHROPIC_API_KEY:'ak' };
globalThis.Deno = { env:{ get:k=>env[k] } };
const USERS = { 'tok-anna':'anna', 'tok-ben':'ben' }; const USED = {}; let LIMIT = 2; let aiFail = false; let dbDown = false; const calls = [];
globalThis.fetch = async (url, o={}) => {
  const ok = (b, s=200) => ({ ok:s<300, status:s, json:async()=>b, text:async()=>JSON.stringify(b) });
  if (url === 'https://sb/auth/v1/user') { const t=o.headers.Authorization.replace('Bearer ',''); return USERS[t] ? ok({id:USERS[t]}) : ok({msg:'bad'},403); }
  if (url.startsWith('https://sb/rest/v1/rpc/')) {
    if (dbDown) return ok({m:'down'},500);
    if (o.headers.Authorization !== 'Bearer srk') return ok({}, 401);
    const n = url.split('/').pop(), a = JSON.parse(o.body); calls.push(n);
    if (n==='bm_claim_idea') { const u=USED[a.p_uid]||0; if(u>=LIMIT) return ok({ok:false,used:u,limit:LIMIT}); USED[a.p_uid]=u+1; return ok({ok:true,used:u+1,limit:LIMIT}); }
    if (n==='bm_refund_idea') { USED[a.p_uid]=Math.max(0,(USED[a.p_uid]||0)-1); return { ok:true, status:204, text:async()=>'' }; }
  }
  if (url === 'https://api.anthropic.com/v1/messages') { calls.push('AI'); return aiFail ? ok({error:{message:'overloaded'}},529) : ok({content:[{text:'[LONG_IDEA]x[/LONG_IDEA]'}],usage:{input_tokens:1,output_tokens:1}}); }
  throw new Error('unexpected fetch ' + url);
};
await import('./fn.mjs');
const call = async (tok, body={prompt:'hi'}) => { const r = await __H(new Request('https://x', { method:'POST', headers: tok?{Authorization:'Bearer '+tok}:{}, body: JSON.stringify(body) })); return [r.status, await r.json()]; };
const fails = []; const check = (l, c) => { console.log((c?'PASS ':'FAIL ')+l); if(!c) fails.push(l); };
let r;
r = await call(null);            check('no login → 401, AI not called', r[0]===401 && !calls.includes('AI'));
r = await call('anon-key-jwt');  check('anon key (not a member) → 401', r[0]===401);
r = await call('tok-anna', {});  check('bad prompt → 400, nothing used', r[0]===400 && !USED.anna);
r = await call('tok-anna');      check('idea 1 → 200 with usage 1/2', r[0]===200 && r[1].bm_usage.used===1 && r[1].content[0].text.includes('LONG'));
aiFail = true; r = await call('tok-anna'); aiFail = false;
check('AI fails → error and the idea is given back', r[0]===529 && USED.anna===1);
r = await call('tok-anna');      check('idea 2 → 200 with usage 2/2', r[0]===200 && r[1].bm_usage.used===2);
const before = calls.filter(c=>c==='AI').length;
r = await call('tok-anna');      check('idea 3 → 429 daily_limit, AI NOT called', r[0]===429 && r[1].code==='daily_limit' && calls.filter(c=>c==='AI').length===before);
check('limit message is clear', /2 AI trade ideas for today.*midnight \(SAST\)/.test(r[1].error));
r = await call('tok-ben');       check('other member has their own 2', r[0]===200 && r[1].bm_usage.used===1);
dbDown = true; r = await call('tok-ben'); dbDown = false;
check('database down → 503, AI not called (protects the bill)', r[0]===503 && USED.ben===1);
r = await (await __H(new Request('https://x', { method:'OPTIONS' }))).text(); check('CORS preflight still ok', r==='ok');
console.log('\nRESULT:', fails.length ? fails.length+' FAIL' : 'ALL PASS');
