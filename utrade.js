// ══════════════════════════════════════════════════════
// BLUE MAC — uTRADE IDEAS ENGINE
// Data-driven guided strategies. Every answer carries fixed codes
// (direction, points, gate) — no text matching anywhere.
//
//   UT.register(key, strategy)   add a strategy (see utrade-scalp.js)
//   UT.has(key)                  is this style handled by uTrade?
//   UT.render()                  draw the current step into #guided-panel
//   UT.reset()                   clear answers (style change / start over)
//
// Option codes:
//   dir   +1 bullish · -1 bearish · 0 neutral
//   pts   points earned when chosen (and aligned with the bias)
//   gate  'block' = no trade, AI never called
//         'wait'  = valid idea but not ready → Watchlist (monitor)
//   bias  true on questions that SET the bias (higher-timeframe layer)
//   align 'critical' → an answer pointing against the bias = wait gate
//         'soft'     → against the bias = 0 pts + warning
// ══════════════════════════════════════════════════════
window.UT = (function(){
  const STRATS = {};
  const st = { style:null, step:0, ans:{}, lv:{}, shots:[], result:null, showAll:{} };
  // ── Instrument specs (typical broker values — the user can override spread & contract size) ──
  // q = quote currency (what P/L is paid in) · c = units per 1.00 lot · sp = typical spread in price
  const SPEC = {
    XAUUSD:{ q:'USD', c:100,    sp:0.30,    u:'oz' },     XAGUSD:{ q:'USD', c:5000,   sp:0.03,    u:'oz' },
    NAS100:{ q:'USD', c:1,      sp:1.5,     u:'index' },  US30:{ q:'USD', c:1,        sp:3,       u:'index' },
    SPX500:{ q:'USD', c:1,      sp:0.6,     u:'index' },  GER40:{ q:'EUR', c:1,       sp:1.5,     u:'index' },
    UK100:{ q:'GBP', c:1,       sp:1.2,     u:'index' },
    EURUSD:{ q:'USD', c:100000, sp:0.00012 }, GBPUSD:{ q:'USD', c:100000, sp:0.00015 }, AUDUSD:{ q:'USD', c:100000, sp:0.00014 },
    USDJPY:{ q:'JPY', c:100000, sp:0.015 },   GBPJPY:{ q:'JPY', c:100000, sp:0.03 },    EURJPY:{ q:'JPY', c:100000, sp:0.025 },
    USDCAD:{ q:'CAD', c:100000, sp:0.00018 }, USDZAR:{ q:'ZAR', c:100000, sp:0.012 },
    USOIL:{ q:'USD', c:1000,    sp:0.04,    u:'barrels' }, BTCUSD:{ q:'USD', c:1,     sp:25,      u:'coin' }
  };
  const CCYS = [['ZAR','R','South African Rand'], ['USD','$','US Dollar'], ['EUR','€','Euro'], ['GBP','£','British Pound'], ['AUD','A$','Australian Dollar']];
  const CKEY = 'bm_cost_v1';
  // account currency + balance (per viewer) and per-instrument spread / contract overrides
  const cost = (() => { try { return Object.assign({ ccy:'ZAR', bal:'', inst:{} }, JSON.parse(localStorage.getItem(CKEY) || '{}')); } catch(e){ return { ccy:'ZAR', bal:'', inst:{} }; } })();
  const saveCost = () => { try { localStorage.setItem(CKEY, JSON.stringify(cost)); } catch(e){} };
  const specOf = sym => {
    const d = SPEC[sym] || { q:'USD', c:1, sp:0 }, o = cost.inst[sym] || {};
    const spv = parseFloat(o.sp), cv = parseFloat(o.c);
    return { q:d.q, u:d.u || 'units', c: isFinite(cv) && cv > 0 ? cv : d.c, sp: isFinite(spv) && spv >= 0 ? spv : d.sp, dc:d.c, dsp:d.sp };
  };
  // ── Exchange rates (ECB via Frankfurter), cached for the day; manual entry as fallback ──
  const FX = {};   // 'USDZAR' -> rate
  try { const c = JSON.parse(localStorage.getItem('bm_fx_v1') || '{}'); if(c.day === new Date().toISOString().slice(0,10)) Object.assign(FX, c.r || {}); } catch(e){}
  const saveFx = () => { try { localStorage.setItem('bm_fx_v1', JSON.stringify({ day:new Date().toISOString().slice(0,10), r:FX })); } catch(e){} };
  const fxPending = {};
  function rate(from, to){ return from === to ? 1 : FX[from + to]; }
  async function loadRate(from, to){
    if(from === to || FX[from + to] || fxPending[from + to]) return;
    fxPending[from + to] = true;
    const urls = [`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`, `https://api.frankfurter.app/latest?from=${from}&to=${to}`];
    for(const u of urls){
      try{
        const r = await fetch(u); if(!r.ok) continue;
        const j = await r.json(); const v = j && j.rates && j.rates[to];
        if(v > 0){ FX[from + to] = v; saveFx(); break; }
      }catch(e){}
    }
    fxPending[from + to] = false;
    refreshSizing();
  }
  function setManualRate(from, to, v){ const n = parseFloat(String(v).replace(',', '.')); if(n > 0){ FX[from + to] = n; saveFx(); refreshSizing(); } }

  // [min score, grade, label, % of account to risk]
  const GRADES = [[85,'A+','A+ Setup',1],[72,'A','A-Grade Setup',0.75],[60,'B','B-Grade Setup',0.5]];
  const V = x => typeof x === 'function' ? x(st.ans) : x;   // text may depend on earlier answers
  const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  function register(key, def){ def.key = key; STRATS[key] = def; }
  function has(key){ return !!STRATS[key]; }
  function cur(){ return STRATS[S.style]; }
  function reset(){ st.knowOpen = false; st._drawn = -1; st.style = S.style; st.step = 0; st.ans = {}; st.lv = {}; st.shots = []; st.result = null; st.showAll = {}; }

  // ── Diagram helpers (shared by every strategy) ──────────
  // dir-aware candle charts on top of BMX.render. Write the BULL version;
  // dir = -1 mirrors every price around 100 and swaps highs/lows.
  const D = {
    chart(sp, dir){
      if(!window.BMX) return '';
      dir = dir || 1;
      const P = v => dir > 0 ? v : 200 - v;
      const out = Object.assign({}, sp);
      out.pts = sp.pts.map(p => [p[0], P(p[1]), p[2]]);
      if(sp.fix){
        out.fix = {};
        Object.entries(sp.fix).forEach(([i, f]) => {
          const g = {};
          if(f.o !== undefined) g.o = P(f.o);
          if(f.c !== undefined) g.c = P(f.c);
          if(dir > 0){ if(f.h !== undefined) g.h = f.h; if(f.l !== undefined) g.l = f.l; }
          else { if(f.l !== undefined) g.h = P(f.l); if(f.h !== undefined) g.l = P(f.h); }
          if(f.keepPrev !== undefined) g.keepPrev = f.keepPrev;
          out.fix[i] = g;
        });
      }
      const flip = m => {
        const n = Object.assign({}, m);
        if(m.p !== undefined) n.p = P(m.p);
        if(m.a) n.a = Array.isArray(m.a) ? [m.a[0], P(m.a[1])] : m.a;
        if(m.b) n.b = [m.b[0], P(m.b[1])];
        if(m.pts) n.pts = m.pts.map(q => [q[0], P(q[1])]);
        if(typeof m.l === 'object' && m.l) n.l = dir > 0 ? m.l[0] : m.l[1];
        if(typeof m.s === 'object' && m.s) n.s = dir > 0 ? m.s[0] : m.s[1];
        if(typeof m.c === 'object' && m.c) n.c = dir > 0 ? m.c[0] : m.c[1];
        return n;
      };
      if(sp.marks) out.marks = sp.marks.map(flip);
      if(sp.boxes) out.boxes = sp.boxes.map(b => {
        const n = flip(b);
        if(b.p1 !== undefined){ n.p1 = P(b.p1); n.p2 = P(b.p2); }
        if(dir < 0 && b.lt) n.lt = b.lt === 'below' ? 'above' : 'below';
        return n;
      });
      if(sp.ov) out.ov = sp.ov.map(o => o.p !== undefined ? Object.assign({}, o, { p:P(o.p), l: typeof o.l === 'object' ? (dir > 0 ? o.l[0] : o.l[1]) : o.l, c: typeof o.c === 'object' ? (dir > 0 ? o.c[0] : o.c[1]) : o.c }) : o);
      if(sp.fitExtra) out.fitExtra = sp.fitExtra.map(P);
      return BMX.render(out);
    },
    // diagram borrowed from an Examples card (keeps one source of truth)
    ref(ref, item){
      const c = exCard(ref); if(!c) return '';
      const svgs = c.querySelectorAll('.ex-diagram svg');
      const sv = svgs[item || 0];
      return sv ? sv.outerHTML : '';
    }
  };

  // ── Examples cards (University uses the same lookup) ────
  function exCard(ref){
    if(!ref) return null;
    let el = document.querySelector(`.ex-card[data-id="${ref}"]`);
    if(!el){
      document.querySelectorAll('.ex-card').forEach(c => {
        if(el || c.dataset.id) return;
        const t = (c.querySelector('.ex-card-title') || {}).textContent || '';
        if('ex-' + t.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') === ref) el = c;
      });
    }
    return el;
  }
  function learn(ref){
    const c = exCard(ref); if(!c) return;
    let ov = document.getElementById('ut-learn');
    if(!ov){
      ov = document.createElement('div'); ov.id = 'ut-learn'; ov.className = 'ut-learn';
      ov.onclick = e => { if(e.target === ov) closeLearn(); };
      document.body.appendChild(ov);
    }
    const t = c.querySelector('.ex-card-title'), d = c.querySelector('.ex-card-desc'), g = c.querySelector('.ex-diagram');
    const rules = [...c.querySelectorAll('.ex-rule')].map(r => r.outerHTML).join('');
    ov.innerHTML = `<div class="ut-learn-box" role="dialog" aria-modal="true">
      <div class="ut-learn-head"><div><div class="ut-learn-kicker">📖 From the Examples library</div><div class="ut-learn-title">${t ? t.innerHTML : ''}</div></div>
        <button class="ut-learn-x" onclick="UT.closeLearn()" aria-label="Close">✕</button></div>
      <div class="ut-learn-body">${g ? `<div class="ex-diagram">${g.innerHTML}</div>` : ''}${d ? `<div class="ex-card-desc">${d.innerHTML}</div>` : ''}${rules}</div></div>`;
    ov.classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function closeLearn(){
    const ov = document.getElementById('ut-learn');
    if(ov) ov.classList.remove('on');
    document.body.style.overflow = '';
  }

  // ── SAST session clock (handles UK + US daylight saving) ──
  function tzOffsetMin(tz, d){
    const p = new Intl.DateTimeFormat('en-US', { timeZone:tz, hourCycle:'h23', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }).formatToParts(d);
    const g = k => +p.find(x => x.type === k).value;
    return (Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute')) - Math.floor(d.getTime() / 60000) * 60000) / 60000;
  }
  // local-time window in a city → minutes after SAST midnight
  function toSAST(tz, h, m, d){ return ((h * 60 + m) - tzOffsetMin(tz, d) + 120 + 1440) % 1440; }
  const hm = x => String(Math.floor(x / 60) % 24).padStart(2,'0') + ':' + String(x % 60).padStart(2,'0');
  function sessions(d){
    d = d || new Date();
    const lo = [toSAST('Europe/London', 8, 0, d), toSAST('Europe/London', 11, 0, d)];
    const ny = [toSAST('America/New_York', 8, 30, d), toSAST('America/New_York', 11, 0, d)];
    const loD = [toSAST('Europe/London', 8, 0, d), toSAST('Europe/London', 12, 0, d)];      // day-trade windows
    const nyD = [toSAST('America/New_York', 8, 30, d), toSAST('America/New_York', 12, 0, d)];
    const nowS = (d.getUTCHours() * 60 + d.getUTCMinutes() + 120) % 1440;
    const inW = w => nowS >= w[0] && nowS < w[1];
    const day = new Date(d.getTime() + 2 * 3600e3).getUTCDay();
    // ── Key Range: the market opens (local time in each city → SAST) ──
    //   Asia = Tokyo 09:00 (no daylight saving) · London 08:00 · New York cash open 09:30
    const opens = { asia: toSAST('Asia/Tokyo', 9, 0, d), london: toSAST('Europe/London', 8, 0, d), ny: toSAST('America/New_York', 9, 30, d) };
    const since = o => (nowS - o + 1440) % 1440;            // minutes since that open (0–1439)
    // state of a Key Range that takes `len` minutes to form and is tradeable for `win` minutes after the open
    const keyState = (o, len, win) => {
      const m = since(o);
      if(m < len) return { k:'forming', left: len - m };
      if(m < win) return { k:'ready', left: win - m };
      if(m < 16 * 60) return { k:'late', ago: m };
      return { k:'soon', inMin: 1440 - m };                  // opens later today / tonight
    };
    const key = {}; Object.entries(opens).forEach(([k, o]) => key[k] = Object.assign({ open:o, rangeEnd:(o + 15) % 1440, until:(o + 120) % 1440 }, keyState(o, 15, 120)));
    // first-hour (Day) and 5-minute (Scalp) ranges for London and New York
    const hour = { london: [opens.london, (opens.london + 60) % 1440], ny: [opens.ny, (opens.ny + 60) % 1440] };
    const five = { london: [opens.london, (opens.london + 5) % 1440], ny: [opens.ny, (opens.ny + 5) % 1440] };
    const dur = m => m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m} min`;
    return { lo, ny, loD, nyD, opens, key, hour, five, dur, now:nowS, nowTxt:hm(nowS), weekend: day === 0 || day === 6,
             cur: inW(lo) ? 'london' : inW(ny) ? 'ny' : null, curD: inW(loD) ? 'london' : inW(nyD) ? 'ny' : null,
             fmt: w => hm(w[0]) + '–' + hm(w[1]), hm };
  }

  // ── Scoring ─────────────────────────────────────────────
  function evaluate(){
    const s = cur(), A = st.ans;
    let earned = 0, max = 0, bias = 0, halfRisk = false, conf = null;
    const gates = [], warns = [], ticks = [];
    // 1) bias from the bias layer (first bias question decides, others must agree)
    s.questions.filter(q => q.bias).forEach(q => {
      if(q.type === 'matrix'){ const d = matrixBias(q); if(d && !bias) bias = d; else if(d && d !== bias) warns.push(`${q.short} disagrees with your bias`); return; }
      const o = opt(q, A[q.id]); if(!o || !o.dir) return;
      if(!bias) bias = o.dir;
      else if(o.dir !== bias) warns.push(`${q.short}: ${o.l} disagrees with your bias`);
    });
    // 2) every answer
    s.questions.forEach(q => {
      if(q.type === 'levels' || q.type === 'instrument') return;
      if(q.type === 'matrix'){
        const m = matrixScore(q, bias);
        max += q.pts; earned += q.pts * m.f; conf = m;
        ticks.push({ ok: m.f >= q.min ? true : false, q:q.short, l:`${m.aligned}/${q.rows.length} timeframes aligned · ${Math.round(m.f * 100)}% weighted confluence` });
        if(bias && m.f < q.min) gates.push({ type:'block', q:q.short, l:`Only ${Math.round(m.f * 100)}% weighted confluence`, why:`The stack is split. Blue Mac Key needs ${Math.round(q.min * 100)}%+ weighted agreement across the timeframes — below that there is no edge.` });
        m.against.forEach(r => warns.push(`${r} stack points against your bias`));
        return;
      }
      if(q.type === 'multi'){
        const picks = (A[q.id] || []).map(v => opt(q, v)).filter(Boolean);
        max += q.max;
        let got = 0;
        picks.forEach(o => { got += o.pts || 0; ticks.push({ ok:true, q:q.short, l:o.l }); });
        earned += Math.min(got, q.max);
        if(!picks.length) ticks.push({ ok:null, q:q.short, l:'No extra confluence' });
        return;
      }
      const o = opt(q, A[q.id]); if(!o) return;
      const best = Math.max(...q.options.map(x => x.pts || 0));
      if(o.noScore){ ticks.push({ ok:null, q:q.short, l:o.l }); return; }   // skipped layer — not counted
      max += best;
      if(o.gate === 'block'){ gates.push({ type:'block', q:q.short, l:o.l, why:o.why }); ticks.push({ ok:false, q:q.short, l:o.l }); return; }
      if(o.gate === 'wait'){ gates.push({ type:'wait', q:q.short, l:o.l, why:o.why, biasQ:!!q.bias }); ticks.push({ ok:null, q:q.short, l:o.l }); earned += o.pts || 0; return; }
      if(o.dir && bias && o.dir !== bias && !q.bias){
        if(q.align === 'critical'){ gates.push({ type:'wait', q:q.short, l:o.l, why:`This points ${o.dir > 0 ? 'bullish' : 'bearish'} but your ${s.biasTF} bias is ${bias > 0 ? 'bullish' : 'bearish'}. Wait for the ${q.short.toLowerCase()} to line up with the bias.` }); }
        else warns.push(`${q.short}: ${o.l} works against your bias`);
        ticks.push({ ok:null, q:q.short, l:o.l + ' (against bias)' });
        return;
      }
      if(o.dir && !bias && !q.bias){ ticks.push({ ok:null, q:q.short, l:o.l }); return; }
      earned += o.pts || 0;
      ticks.push({ ok:(o.pts || 0) >= best * 0.6 ? true : null, q:q.short, l:o.l });
      if(o.warn) warns.push(o.warn);
      if(o.halfRisk) halfRisk = true;
      if(typeof o.check === 'function'){ const w = o.check(sessions()); if(w) warns.push(w); }
    });
    if(!bias && !gates.some(g => g.type === 'block')){
      const bq = gates.find(g => g.biasQ);
      if(bq) bq.type = 'block';                                  // e.g. "fake break" — say exactly why
      else gates.push(Object.assign({ type:'block', q:'Bias', l:'No directional bias', why:`${s.biasTF} gives no clear direction. No bias = no trade.` }, s.noBias || {}));
    }
    const score = max ? Math.round(earned / max * 100) : 0;
    const blocked = gates.some(g => g.type === 'block');
    const waiting = !blocked && gates.some(g => g.type === 'wait');
    let grade = null, gradeLong = 'No Trade', risk = 0;
    for(const [min, g, gl, r] of GRADES) if(score >= min){ grade = g; gradeLong = gl; risk = r; break; }
    if(halfRisk) risk = risk / 2;   // e.g. 2 losses today → half risk
    const tooWeak = !blocked && !grade;
    return { bias, score, grade, gradeLong, risk, gates, warns, ticks, blocked, waiting, tooWeak, conf };
  }
  const opt = (q, v) => v == null ? null : q.options.find(o => o.v === v);
  // ── 9-timeframe matrix (question type 'matrix' — not used by any strategy right now) ──
  // rows: [code, label, weight, setsBias]
  function matrixBias(q){
    const A = st.ans[q.id] || {}; let s = 0, W = 0;
    q.rows.forEach(([k,, w, b]) => { if(!b) return; W += w; const c = q.cols.find(x => x.v === A[k]); if(c) s += w * c.dir; });
    return W && Math.abs(s) >= W * 0.34 ? Math.sign(s) : 0;
  }
  function matrixScore(q, bias){
    const A = st.ans[q.id] || {}; let got = 0, W = 0, aligned = 0; const against = [];
    q.rows.forEach(([k, lab, w]) => {
      W += w; const c = q.cols.find(x => x.v === A[k]); if(!c) return;
      if(bias && c.dir === bias){ got += w; aligned++; }
      else if(!c.dir) got += w * 0.35;
      else if(bias) against.push(lab);
    });
    return { f: W ? got / W : 0, aligned, against };
  }
  // bias from the answers given so far (first bias question that has a direction)
  function currentBias(){
    const s = cur(); if(!s) return 0;
    for(const q of s.questions){
      if(!q.bias) continue;
      if(q.type === 'matrix'){ const d = matrixBias(q); if(d) return d; continue; }
      const o = opt(q, st.ans[q.id]); if(o && o.dir) return o.dir;
    }
    return 0;
  }

  // ── Price plan (engine-calculated, never left to the AI) ──
  function num(v){ const n = parseFloat(String(v == null ? '' : v).replace(/,/g,'').replace(/\s/g,'')); return isFinite(n) ? n : NaN; }
  function decimals(){
    let d = 0;
    Object.values(st.lv).forEach(v => { const m = String(v || '').replace(/,/g,'').match(/\.(\d+)/); if(m) d = Math.max(d, m[1].length); });
    return Math.min(Math.max(d, 2), 5);
  }
  // dir +1 long · -1 short. Uses the strategy's level map.
  function plan(dir){
    const s = cur(), L = st.lv, mins = s.minRR || [2,3];
    const k = s.levelMap(dir, L, num);
    if(!k) return null;
    let { e1, e2, sl } = k;
    const dp = decimals(), fmt = v => v.toFixed(dp);
    const R = dir * (e1 - sl);
    if(!(R > 0)) return { error:'Stop loss is on the wrong side of the entry — check your swing high / low.' };
    if(!(dir * (e1 - e2) >= 0 && dir * (e2 - sl) > 0)) e2 = e1 - dir * R * 0.5;     // Entry 2 always inside the stop
    const fixes = [];
    // costs: the spread is paid on every trade → risk grows by it, reward shrinks by it
    const sp = specOf(st.ans.instrument).sp || 0, Rn = R + sp;
    const need = m => e1 + dir * (m * Rn + sp);                 // price that pays m:1 AFTER the spread
    const tp1Min = need(mins[0]), tp2Min = need(mins[1]);
    const rrTo = v => (dir * (v - e1) - sp) / Rn;              // net R:R
    const rrGross = v => dir * (v - e1) / R;
    // structural targets beyond Entry 1, nearest first
    const tg = (k.tg || [[k.t1, k.t1why], [k.t2, k.t2why]]).filter(t => isFinite(t[0]) && dir * (t[0] - e1) > 0).sort((a, b) => dir * (a[0] - b[0]));
    const nearRR = tg.length ? rrTo(tg[0][0]) : null;
    // TP1 = first REAL level that pays the minimum after costs. If none does, there is not enough room:
    // we still show the minimum so the trader can see it, but the setup becomes Watchlist (see roomCheck).
    let i1 = tg.findIndex(t => dir * (t[0] - tp1Min) >= 0), tp1, note1, tp2, note2, noRoom = false, through = null;
    if(i1 >= 0){
      tp1 = tg[i1][0]; note1 = tg[i1][1];
      if(i1 > 0) through = { name: tg[0][1], price: tg[0][0], rr: nearRR };   // reported as a warning by roomCheck
    } else {
      noRoom = true; tp1 = tp1Min; note1 = `1:${mins[0]} minimum — no real level here`;
    }
    // TP2 = next real level beyond TP1 that pays the TP2 minimum; otherwise the minimum (or TP1 + 1R)
    const floor2 = dir > 0 ? Math.max(tp2Min, tp1 + Rn) : Math.min(tp2Min, tp1 - Rn);
    const t2 = tg.find(t => dir * (t[0] - floor2) >= 0);
    if(t2){ tp2 = t2[0]; note2 = t2[1]; } else { tp2 = floor2; note2 = `1:${mins[1]}+ minimum`; }
    const round = (v, away) => { const f = Math.pow(10, dp); return (away ? (dir > 0 ? Math.ceil(v * f - 1e-9) : Math.floor(v * f + 1e-9)) : Math.round(v * f)) / f; };
    tp1 = round(tp1, true); tp2 = round(tp2, true);
    const rr = v => (Math.floor(rrTo(v) * 10 + 1e-6) / 10).toFixed(1);
    const rrg = v => (Math.floor(rrGross(v) * 10 + 1e-6) / 10).toFixed(1);
    return { dir, e1, e2, sl, tp1, tp2, R, Rn, sp, dp, fmt, rr1:rr(tp1), rr2:rr(tp2), rr1g:rrg(tp1), rr2g:rrg(tp2), note1, note2, fixes,
             e1why:k.e1why || '', e2why:k.e2why || '', slwhy:k.slwhy || '', noRoom, through, nearRR, nearName: tg[0] ? tg[0][1] : '', mins };
  }

  // room for the trade: no real target paying the minimum → Watchlist (wait for a better entry)
  function roomCheck(ev, p){
    if(!p || p.error || ev.blocked) return;
    const r1 = v => (Math.floor(v * 10) / 10).toFixed(1);
    if(p.noRoom){
      ev.gates.push({ type:'wait', q:'Room to target', l: p.nearRR !== null ? `${p.nearName} only gives 1:${r1(p.nearRR)} after the spread` : 'No target on your chart',
        why:`Blue Mac needs a real level paying at least 1:${p.mins[0]} after costs. Either wait for a deeper pullback (better entry, smaller stop) or mark a further target on a higher timeframe. A TP placed beyond the liquidity in empty space usually never gets hit.` });
      ev.waiting = true;
    } else if(p.through){
      ev.warns.push(`Price has to get through the ${p.through.name} (1:${r1(p.through.rr)}) before TP1 — consider taking partials there`);
    }
  }

  // ── Practice runs (practice.js): run the real engine on a made-up answer set without touching the member's idea ──
  function simulate(key, ans, lv){
    const keep = { style: S.style, ans: st.ans, lv: st.lv };
    try {
      S.style = key; st.ans = ans || {}; st.lv = lv || {};
      const ev = evaluate(), p = ev.bias ? plan(ev.bias) : null;
      roomCheck(ev, p);
      return { ev, p, spec: specOf(st.ans.instrument) };
    } finally { S.style = keep.style; st.ans = keep.ans; st.lv = keep.lv; }
  }

  // ── Position size (lots) in the trader's account currency ──
  const fmtMoney = (v, ccy) => { const c = CCYS.find(x => x[0] === ccy) || ['', '']; return c[1] + Math.round(v).toLocaleString('en-ZA').replace(/,/g, ' '); };
  function sizing(p, ev){
    if(!p || p.error) return null;
    const sym = st.ans.instrument, sp = specOf(sym), bal = parseFloat(String(cost.bal).replace(/[\s,]/g, ''));
    const riskPct = ev && ev.risk ? ev.risk : 0;
    if(!(bal > 0) || !riskPct) return { need: !(bal > 0) ? 'balance' : 'grade', sp, riskPct };
    const fx = rate(sp.q, cost.ccy);
    if(!fx) return { need:'rate', sp, riskPct };
    const riskAmt = bal * riskPct / 100;
    const lossPerLot = p.Rn * sp.c * fx;                         // money lost per 1.00 lot if the stop is hit (spread included)
    const raw = riskAmt / lossPerLot, lots = Math.floor(raw * 100 + 1e-9) / 100;
    if(lots < 0.01){
      const minRisk = 0.01 * lossPerLot;
      return { tooSmall:true, minRisk, minPct: minRisk / bal * 100, riskAmt, riskPct, sp, fx };
    }
    const l1 = lots >= 0.02 ? Math.ceil(lots * 100 / 2) / 100 : lots, l2 = +(lots - l1).toFixed(2);
    const gain = tp => lots * (p.dir * (tp - p.e1) - p.sp) * sp.c * fx;
    return { lots, l1, l2, riskAmt, realRisk: lots * lossPerLot, riskPct, tp1: gain(p.tp1), tp2: gain(p.tp2), sp, fx };
  }
  function sizingHTML(p, ev){
    const z = sizing(p, ev); if(!z) return '';
    const ccy = cost.ccy, M = v => fmtMoney(v, ccy), sym = esc(st.ans.instrument || '');
    let body = '';
    if(z.need === 'balance') body = `<span>Add your <b>account balance</b> on the levels step and Blue Mac will work out your lot size.</span>`;
    else if(z.need === 'grade') body = `<span>Lot size appears once the setup qualifies for a trade.</span>`;
    else if(z.need === 'rate') body = `<span>Fetching the ${z.sp.q}→${ccy} exchange rate… If it does not load, type it: 1 ${z.sp.q} = <input class="ut-fx" inputmode="decimal" placeholder="rate" onchange="UT.setRate('${z.sp.q}','${ccy}',this.value)"> ${ccy}</span>`;
    else if(z.tooSmall) body = `<b class="no">Too big for this account.</b> <span>Even the minimum 0.01 lot risks <b>${M(z.minRisk)}</b> (${z.minPct.toFixed(1)}% of your account) — more than the ${+z.riskPct.toFixed(2)}% this grade allows. Skip it, or trade a smaller instrument.</span>`;
    else body = `<div class="ut-size-g">
        <div><span>Total size</span><b>${z.lots.toFixed(2)} lots</b></div>
        <div><span>Split</span><b>${z.l2 > 0 ? `${z.l1.toFixed(2)} @ E1 + ${z.l2.toFixed(2)} @ E2` : `${z.l1.toFixed(2)} @ E1`}</b></div>
        <div class="sl"><span>Max loss</span><b>−${M(z.realRisk)}</b></div>
        <div class="tp"><span>At TP1</span><b>+${M(z.tp1)}</b></div>
        <div class="tp"><span>At TP2</span><b>+${M(z.tp2)}</b></div>
      </div>
      <small>${+z.riskPct.toFixed(2)}% of ${M(parseFloat(String(cost.bal).replace(/[\s,]/g, '')))} · spread ${z.sp.sp} included · ${z.sp.c.toLocaleString('en-ZA')} ${z.sp.u} per lot${z.sp.q !== ccy ? ` · 1 ${z.sp.q} = ${(+z.fx).toFixed(z.fx < 10 ? 4 : 2)} ${ccy}` : ''}. Max loss assumes both entries fill at Entry 1's distance — the real loss is a little smaller.</small>`;
    return `<div class="ut-size" data-size>${'<div class="ut-size-h">🧮 POSITION SIZE · ' + sym + ' · ' + ccy + '</div>'}${body}</div>`;
  }
  // re-draw only the sizing blocks (after an exchange rate arrives)
  function refreshSizing(){
    const ev = st.result; if(!ev) return;
    document.querySelectorAll('[data-size]').forEach(el => {
      const dir = +(el.dataset.dir || ev.bias);
      const p = plan(dir);
      const tmp = document.createElement('div'); tmp.innerHTML = sizingHTML(p, dir === ev.bias ? ev : null);
      const n = tmp.firstElementChild; if(n){ n.dataset.dir = dir; el.replaceWith(n); }
    });
  }

  // ── Standard level maths (shared by the strategies) ─────
  // o = { tf:'15m', up:[[field,label]], dn:[[field,label]], buf:0.04, ext:true }
  // Entry from the zone (if it sits on the right side of price), stop beyond the
  // opposite swing + buffer, targets = swing + marked liquidity (+ fib 127.2%).
  function stdLevels(dir, L, num, o){
    const p = num(L.price), hi = num(L.swing_hi), lo = num(L.swing_lo);
    if(![p, hi, lo].every(isFinite)) return null;
    const tf = o.tf, zh = num(L.zone_hi), zl = num(L.zone_lo), hasZone = isFinite(zh) && isFinite(zl);
    const buf = (hi - lo) * (o.buf || 0.04);
    let e1 = p, e2, e1why = 'market price', e2why;
    const sl = dir > 0 ? lo - buf : hi + buf;
    const slwhy = dir > 0 ? `below the ${tf} swing low + buffer` : `above the ${tf} swing high + buffer`;
    const zoneOk = hasZone && (dir > 0 ? zl < p && zl > sl : zh > p && zh < sl);
    if(zoneOk){
      e1 = dir > 0 ? Math.min(zh, p) : Math.max(zl, p);
      e1why = (dir > 0 ? zh >= p : zl <= p) ? 'price is inside the zone' : 'limit order at the zone edge';
      e2 = (zh + zl) / 2; e2why = '50% of the zone';
      if(dir * (e1 - e2) <= 0){ e2 = e1 - dir * (e1 - sl) * 0.4; e2why = 'deeper in the zone, above the stop'; }
    } else { e2 = e1 - dir * (e1 - sl) * 0.5; e2why = 'halfway to the stop (better price)'; }
    const cands = dir > 0 ? [[hi, `${tf} swing high (buy-side liquidity)`]] : [[lo, `${tf} swing low (sell-side liquidity)`]];
    (dir > 0 ? o.up : o.dn).forEach(([f, lab]) => cands.push([num(L[f]), lab]));
    if(o.ext) cands.push([dir > 0 ? hi + (hi - lo) * 0.272 : lo - (hi - lo) * 0.272, `fib 127.2% extension of the ${tf} swing`]);
    // Key Range of this style's timeframe: the far edge and a 2× projection are targets
    if(o.range){
      const [hk, lk, name] = o.range, rh = num(L[hk]), rl = num(L[lk]);
      if(isFinite(rh) && isFinite(rl) && rh > rl){
        const H = rh - rl;
        if(dir > 0) cands.push([rh, `${name} high`], [rh + 2 * H, `2× ${name} target`]);
        else cands.push([rl, `${name} low`], [rl - 2 * H, `2× ${name} target`]);
      }
    }
    const tg = cands.filter(t => isFinite(t[0]) && dir * (t[0] - e1) > 0).sort((a, b) => dir * (a[0] - b[0]));
    return { e1, e2, sl, e1why, e2why, slwhy, tg };
  }
  // shared level-field validation
  function stdCheck(L, num, tf){
    const hi = num(L.swing_hi), lo = num(L.swing_lo), p = num(L.price);
    if(hi <= lo) return `Your ${tf} swing high must be above your ${tf} swing low.`;
    const span = hi - lo;
    if(p > hi + span * 1.5 || p < lo - span * 1.5) return `Current price is far outside your ${tf} swing high and low — use the swing points from the current ${tf} leg.`;
    if(L.zone_hi && L.zone_lo && num(L.zone_hi) <= num(L.zone_lo)) return 'Zone top must be above zone bottom.';
    return null;
  }

  // ── Rules page (generated from the same strategy definition) ──
  function rulesHTML(key){
    const s = STRATS[key]; if(!s || !s.rules) return '';
    const R = s.rules, c = s.color;
    const block = (icon, title, body, danger) => `<div class="rules-block">
      <div class="rules-block-header" style="${danger ? 'border-bottom-color:rgba(217,82,82,0.2);background:rgba(217,82,82,0.03);' : 'border-bottom-color:rgba(30,136,220,0.15);'}">
        <div class="rules-block-header-icon">${icon}</div><div class="rules-block-title" style="color:${danger ? 'var(--bear)' : c};">${title}</div></div>
      <div class="rules-block-body">${body}</div></div>`;
    const pre = `<div class="preflight-list">${R.preflight.map(([t, x], i) => `<div class="preflight-item"><div class="preflight-num" style="color:${c};">${String(i + 1).padStart(2,'0')}</div><div class="preflight-text"><strong>${t}</strong> ${x}</div></div>`).join('')}</div>`;
    const steps = `<div class="protocol-steps" style="display:flex;flex-direction:column;gap:10px;">${R.steps.map(([t, x], i) => `<div class="protocol-step"><div class="protocol-step-num" style="background:rgba(30,136,220,0.15);color:${c};">${i + 1}</div><div class="protocol-step-content"><div class="protocol-step-title">${t}</div><div class="protocol-step-desc">${x}</div></div></div>`).join('')}</div>`;
    const mins = s.minRR || [2,3];
    const grades = `<div style="display:flex;flex-direction:column;gap:8px;">${GRADES.map(([min, g, , r]) => `<div class="grade-row"><div class="grade-tag" style="color:${g === 'B' ? 'var(--gold)' : 'var(--bull)'}">${g === 'A+' ? 'A+ Setup' : g + '-Grade'}</div><div class="grade-detail"><strong>Score ${min}+</strong> — ${g === 'A+' ? 'every layer lines up, including the trigger and extra confluence.' : g === 'A' ? 'bias, zone and trigger agree; a little confluence missing.' : 'tradeable but thinner — smaller size, take TP1 quickly.'}</div><div class="grade-size" style="color:var(--bull);border-color:rgba(45,184,122,0.3);background:rgba(45,184,122,0.08);">${r}% risk</div></div>`).join('')}
      <div class="grade-row"><div class="grade-tag" style="color:var(--bear)">No Trade</div><div class="grade-detail"><strong>Below 60, or any hard stop</strong> — uTrade Ideas will not build an idea. <strong>Watchlist</strong> = valid but not confirmed yet: monitor only.</div><div class="grade-size" style="color:var(--bear);border-color:rgba(217,82,82,0.3);background:rgba(217,82,82,0.08);">0%</div></div></div>`;
    const risk = `<div class="preflight-list">${[
      ['Entry 1 / Entry 2.', 'Entry 1 at the zone edge (or market). Entry 2 is a better price deeper in the zone — <strong>always between Entry 1 and the stop</strong>.'],
      ['Stop loss.', R.stop],
      [`TP1 ≥ 1:${mins[0]} · TP2 ≥ 1:${mins[1]} after the spread.`, R.targets + ' If no real level pays the minimum, the setup becomes <strong>Watchlist</strong> — Blue Mac never stretches a target into empty space.'],
      ['Management.', R.manage],
      ['Lot size.', 'Type your account balance and currency on the levels step — uTrade Ideas works out the lots, split across Entry 1 and Entry 2, so the stop costs exactly your grade\'s risk %.']
    ].map(([t, x], i) => `<div class="preflight-item"><div class="preflight-num" style="color:${c};">${['E','SL','TP','M','LOT'][i]}</div><div class="preflight-text"><strong>${t}</strong> ${x}</div></div>`).join('')}</div>`;
    const never = R.never.map(([t, x]) => `<div class="never-item"><div class="never-icon">✗</div><div class="never-text"><strong>${t}</strong> ${x}</div></div>`).join('');
    const mind = `<div class="mindset-principles">${R.mindset.map(([t, x]) => `<div class="mindset-principle" style="border-color:rgba(30,136,220,0.15);"><div class="mindset-principle-label" style="color:${c};">${t}</div><div class="mindset-principle-text">${x}</div></div>`).join('')}</div>`;
    return `<div class="rules-hero" style="border-color:rgba(228,232,238,0.3);color:${c};">
        <div class="rules-hero-left"><div class="rules-hero-icon">${R.icon}</div><div>
          <div class="rules-hero-name" style="color:${c};">${s.name}</div>
          <div class="rules-hero-sub" style="color:${c};">${s.short} · ${s.tfs} · ${R.sub}</div></div></div>
        <div class="rules-hero-pills" style="color:${c};">${s.pills.map(p => `<span class="rules-hero-pill">${p}</span>`).join('')}</div></div>
      <div class="rules-layout"><div class="rules-col">
        ${block('✈️', 'Pre-Flight Checklist', pre)}
        ${block('🎯', 'The Setup — Step by Step', steps)}
        ${block('📊', 'Grades & Position Size', grades)}
      </div><div class="rules-col">
        ${block('🛡', 'Entries, Stops & Targets', risk)}
        ${block('🚫', 'Never Do This', never, true)}
        ${block('🧠', 'Mindset', mind)}
      </div></div>
      <div style="margin-top:16px;"><button class="ut-learn-btn" onclick="UT.goTo('${key}')">Open ${s.short} in uTrade Ideas →</button></div>`;
  }
  function goTo(key){
    const b = [...document.querySelectorAll('.nav-item')].find(x => (x.getAttribute('onclick') || '').includes("'checklist'"));
    if(b) goPage('checklist', b);
    setStyle(key, document.querySelector('.style-tab.' + key));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── Rendering ───────────────────────────────────────────
  function stageOf(q){ return cur().stages[q.stage] || { label:'', color:'var(--blue)' }; }
  function render(){
    const panel = document.getElementById('guided-panel'); if(!panel) return;
    const s = cur(); if(!s) return;
    if(st.style !== S.style) reset();
    if(window.BMS) BMS.utChanged();   // profile.js remembers the question + answers
    panel.classList.add('active', 'ut-panel');
    if(st.step >= s.questions.length) return renderResult();
    const q = s.questions[st.step], sg = stageOf(q), total = s.questions.length;
    const pct = Math.round(st.step / total * 100);
    let body = '';
    if(q.type === 'instrument') body = instrumentHTML(q);
    else if(q.type === 'single') body = optionsHTML(q, false);
    else if(q.type === 'multi') body = optionsHTML(q, true);
    else if(q.type === 'levels') body = levelsHTML(q);
    else if(q.type === 'matrix') body = matrixHTML(q);
    const live = typeof q.live === 'function' ? q.live(sessions()) : '';
    const same = st._drawn === st.step; st._drawn = st.step;   // re-render of the same question → no entrance animation
    const firstTime = st.step === 0 && (s.know || []).length && !knowSeen()[S.style];
    const knowOpen = firstTime || st.knowOpen;
    if(st.step === 0 && knowOpen){
      panel.innerHTML = `<div class="ut-wrap" style="--ut:${s.color};">${introHTML(s)}${knowHTML(s, true)}</div>`;
      return;
    }
    panel.innerHTML = `
      <div class="ut-wrap" style="--ut:${s.color};">
        ${st.step === 0 ? introHTML(s) + knowHTML(s, false) : ''}
        <div class="ut-prog">
          <div class="ut-stages">${s.stages.map((g, i) => `<span class="ut-stage${i === q.stage ? ' on' : i < q.stage ? ' done' : ''}">${i < q.stage ? '✓ ' : ''}${g.label}</span>`).join('')}</div>
          <div class="ut-bar"><i style="width:${pct}%"></i></div>
          <div class="ut-count">Question ${st.step + 1} of ${total}</div>
        </div>
        <div class="ut-card${same ? ' still' : ''}">
          <div class="ut-kicker">${sg.label}${q.tf ? ` · <span class="ut-tf">${V(q.tf)}</span>` : ''}</div>
          <div class="ut-q">${V(q.q)}</div>
          ${q.help ? `<div class="ut-help">${V(q.help)}</div>` : ''}
          ${live}
          ${q.hero ? `<div class="ut-hero">${typeof q.hero === 'function' ? q.hero() : q.hero}${q.heroCap ? `<div class="ut-hero-cap">${V(q.heroCap)}</div>` : ''}${q.ref ? `<button class="ut-learn-btn" onclick="UT.learn('${q.ref}')">📖 Learn this in Examples</button>` : ''}</div>`
                   : q.ref ? `<div><button class="ut-learn-btn" onclick="UT.learn('${q.ref}')">📖 New to this? Learn it in Examples</button></div>` : ''}
          ${body}
          <div class="ut-nav">
            ${st.step > 0 ? `<button class="ut-back" onclick="UT.back()">← Back</button>` : '<span></span>'}
            ${q.type === 'multi' ? `<button class="ut-next" onclick="UT.next()">${(st.ans[q.id] || []).length ? 'Next →' : 'None of these — Next →'}</button>` : ''}
            ${q.type === 'levels' ? `<button class="ut-next" onclick="UT.submitLevels()">Build My Trade Idea →</button>` : ''}
            ${q.type === 'matrix' ? (() => { const n = q.rows.filter(r => (st.ans[q.id] || {})[r[0]]).length;
                return `<button class="ut-next" onclick="UT.next()" ${n < q.rows.length ? 'disabled' : ''}>${n < q.rows.length ? `${n}/${q.rows.length} answered` : 'Next →'}</button>`; })() : ''}
          </div>
        </div>
      </div>`;
  }
  // ── "What you need to know" — concepts this style relies on, linked to Examples + University ──
  const KNOW_KEY = 'bm_know_v1';
  const knowSeen = () => { try { return JSON.parse(localStorage.getItem(KNOW_KEY) || '{}'); } catch(e){ return {}; } };
  function uniFor(ref){
    if(!window.BMU || !BMU.MODULES) return null;
    for(const m of BMU.MODULES){ const l = m.lessons.find(x => x.ref === ref); if(l) return { m, l }; }
    return null;
  }
  function uniState(ref){
    const u = uniFor(ref); if(!u) return null;
    const P = BMU._p ? BMU._p() : { done:{} };
    if(P.done && P.done[u.l.id]) return { u, k:'done' };
    return { u, k: BMU.isUnlocked && BMU.isUnlocked(u.m.id) ? 'open' : 'locked' };
  }
  function openUni(ref){
    const x = uniState(ref); if(!x) return learn(ref);
    const b = [...document.querySelectorAll('.nav-item')].find(n => (n.getAttribute('onclick') || '').includes("'education'"));
    if(b) goPage('education', b);
    if(x.k === 'locked'){ BMU.home(); setTimeout(() => BMU.locked(x.u.m.id), 60); }
    else BMU.lesson(x.u.m.id, x.u.l.id);
    window.scrollTo({ top:0, behavior:'smooth' });
  }
  function knowHTML(s, open){
    const K = s.know || []; if(!K.length) return '';
    const states = K.map(k => uniState(k.ref));
    const done = states.filter(x => x && x.k === 'done').length, withUni = states.filter(Boolean).length;
    if(!open) return `<button class="ut-know-bar" id="ut-know" onclick="UT.knowToggle(true)">📚 <b>What you need to know</b> for ${esc(s.short)} · ${K.length} concepts${withUni ? ` · ${done}/${withUni} done in University` : ''} <span>Show ›</span></button>`;
    return `<div class="ut-know" id="ut-know">
      <div class="ut-know-h"><div><div class="ut-kicker">📚 Before you start</div><div class="ut-know-t">What you need to know for ${esc(s.short)}</div></div>
        ${withUni ? `<div class="ut-know-p"><b>${done}/${withUni}</b><span>done in University</span></div>` : ''}</div>
      <div class="ut-know-d">${esc(s.knowIntro || 'This style uses the concepts below. If any of them are new to you, open the example first — every question will make sense afterwards.')}</div>
      <div class="ut-know-l">${K.map((k, i) => { const x = states[i];
        const uni = !x ? '' : x.k === 'done' ? `<button class="ut-k-uni done" onclick="UT.uni('${k.ref}')">🎓 Done ✓</button>`
          : x.k === 'open' ? `<button class="ut-k-uni" onclick="UT.uni('${k.ref}')">🎓 Module ${x.u.m.code}</button>`
          : `<button class="ut-k-uni locked" onclick="UT.uni('${k.ref}')" title="Unlocks as you progress through the degree">🔒 Module ${x.u.m.code}</button>`;
        return `<div class="ut-k${x && x.k === 'done' ? ' done' : ''}"><div class="ut-k-txt"><b>${esc(k.t)}</b><span>${esc(k.why)}</span></div>
          <div class="ut-k-btns"><button class="ut-k-ex" onclick="UT.learn('${k.ref}')">📖 Example</button>${uni}</div></div>`; }).join('')}</div>
      <div class="ut-know-f"><span>New to some of these? Open the examples now — it takes 2 minutes and the questions will be easy.</span>
        <button class="ut-next" onclick="UT.knowReady()">I'm ready — let's go →</button></div>
    </div>`;
  }
  function knowReady(){
    const k = knowSeen(); k[S.style] = 1; try { localStorage.setItem(KNOW_KEY, JSON.stringify(k)); } catch(e){}
    st.knowOpen = false; render();
  }
  function knowToggle(v){ st.knowOpen = v; render(); const el = document.getElementById('ut-know'); if(el && v) el.scrollIntoView({ behavior:'smooth', block:'start' }); }

  function introHTML(s){
    return `<div class="ut-intro">
      <div class="ut-intro-top"><span class="ut-intro-badge">uTrade Ideas · ${s.short}</span><span class="ut-intro-tf">${s.tfs}</span></div>
      <div class="ut-intro-name">${s.name}</div>
      <div class="ut-intro-desc">${s.desc}</div>
      <div class="ut-intro-pills">${s.pills.map(p => `<span>${p}</span>`).join('')}</div>
    </div>`;
  }
  function instrumentHTML(q){
    const v = st.ans[q.id] || '';
    return `<div class="ut-inst">${q.groups.map(([g, list]) => `<div class="ut-inst-g"><div class="ut-inst-gl">${g}</div><div class="ut-inst-row">${list.map(([code, name]) =>
      `<button class="ut-inst-b${v === code ? ' on' : ''}" onclick="UT.pick('${q.id}','${code}')"><b>${code}</b><span>${name}</span></button>`).join('')}</div></div>`).join('')}</div>`;
  }
  function optionsHTML(q, multi){
    const cur_ = st.ans[q.id];
    const sel = o => multi ? (cur_ || []).includes(o.v) : cur_ === o.v;
    // once the bias is known, show the options that agree with it first
    let list = q.options, hidden = 0;
    const b = q.bias ? 0 : currentBias();
    if(b) list = q.options.map((o, i) => [o, i]).sort((x, y) => rank(x[0]) - rank(y[0]) || x[1] - y[1]).map(x => x[0]);
    function rank(o){ return o.gate ? 3 : !o.dir ? 1 : o.dir === b ? 0 : 2; }
    // critical questions: tuck the against-the-bias options behind a button (unless one is already picked)
    if(b && q.align === 'critical' && !st.showAll[q.id]){
      const keep = list.filter(o => !o.dir || o.dir === b || sel(o));
      hidden = list.length - keep.length; list = keep;
    }
    const hasDg = q.options.some(o => o.dg) && !q.compact;
    return `<div class="ut-opts${q.compact ? ' compact' : ''}${hasDg ? ' dg' : ''}">${list.map(o => {
      const tone = o.gate === 'block' ? 'block' : o.gate === 'wait' ? 'wait' : o.dir > 0 ? 'bull' : o.dir < 0 ? 'bear' : 'neut';
      const dg = typeof o.dg === 'function' ? o.dg() : (o.dg || '');
      return `<div class="ut-opt ${tone}${sel(o) ? ' on' : ''}" role="button" tabindex="0" onclick="UT.${multi ? 'toggle' : 'pick'}('${q.id}','${o.v}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}">
        ${multi ? `<span class="ut-check">${sel(o) ? '✓' : ''}</span>` : ''}
        ${dg ? `<div class="ut-opt-dg">${dg}</div>` : ''}
        <div class="ut-opt-t">${V(o.l)}</div>
        ${o.sub ? `<div class="ut-opt-s">${V(o.sub)}</div>` : ''}
        ${o.gate === 'block' ? `<div class="ut-tag block">🛑 No trade</div>` : o.gate === 'wait' ? `<div class="ut-tag wait">⏳ Wait</div>` : ''}
        ${o.ref ? `<button class="ut-opt-learn" onclick="event.stopPropagation();UT.learn('${o.ref}')">📖 Learn</button>` : ''}
      </div>`;
    }).join('')}</div>${hidden ? `<button class="ut-more" onclick="UT.showAll('${q.id}')">Show ${hidden} ${b > 0 ? 'bearish' : 'bullish'} option${hidden > 1 ? 's' : ''} (against your bias)</button>` : ''}`;
  }
  function matrixHTML(q){
    const A = st.ans[q.id] || {};
    const live = (() => {
      const b = matrixBias(q), m = matrixScore(q, b), n = Object.keys(A).length;
      if(!n) return '';
      return `<div class="ut-mx-sum ${b > 0 ? 'bull' : b < 0 ? 'bear' : ''}">${b > 0 ? '▲ Bullish' : b < 0 ? '▼ Bearish' : '◆ No'} higher-timeframe bias · ${Math.round(m.f * 100)}% weighted confluence <i style="width:${Math.round(m.f * 100)}%"></i></div>`;
    })();
    return `<div class="ut-mx">${q.rows.map(([k, lab, w, b]) => `
      <div class="ut-mx-r"><div class="ut-mx-l"><b>${k}</b><span>${lab}${b ? ' · sets bias' : ''}</span><em>weight ${w}</em></div>
        <div class="ut-mx-b">${q.cols.map(c => `<button class="${c.dir > 0 ? 'bull' : c.dir < 0 ? 'bear' : 'neut'}${A[k] === c.v ? ' on' : ''}" onclick="UT.cell('${q.id}','${k}','${c.v}')">${c.l}</button>`).join('')}</div></div>`).join('')}
    </div>${live}`;
  }
  function showAll(id){ st.showAll[id] = true; render(); }
  function cell(id, row, v){ (st.ans[id] = st.ans[id] || {})[row] = v; render(); }
  function costHTML(){
    const sym = st.ans.instrument, sp = specOf(sym), o = cost.inst[sym] || {};
    return `<div class="ut-cost">
      <div class="ut-cost-h">💰 Account & costs <em>saved on this device</em></div>
      <div class="ut-lv">
        <div class="ut-lv-f"><label for="ut-c-ccy">Account currency</label>
          <select id="ut-c-ccy">${CCYS.map(([c,, n]) => `<option value="${c}"${c === cost.ccy ? ' selected' : ''}>${c} — ${n}</option>`).join('')}</select>
          <small>The currency your broker account is in.</small></div>
        <div class="ut-lv-f"><label for="ut-c-bal">Account balance <em>optional</em></label>
          <input id="ut-c-bal" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 20000" value="${esc(cost.bal)}">
          <small>Used to work out your lot size. Never leaves this device.</small></div>
        <div class="ut-lv-f"><label for="ut-c-sp">Spread on ${esc(sym)}</label>
          <input id="ut-c-sp" type="text" inputmode="decimal" autocomplete="off" placeholder="${sp.dsp}" value="${esc(o.sp != null ? o.sp : sp.dsp)}">
          <small>In price, e.g. ${sp.dsp} is typical. Check your broker — add commission here too.</small></div>
        <div class="ut-lv-f"><label for="ut-c-c">Contract size per 1.00 lot</label>
          <input id="ut-c-c" type="text" inputmode="decimal" autocomplete="off" placeholder="${sp.dc}" value="${esc(o.c != null ? o.c : sp.dc)}">
          <small>${sp.dc.toLocaleString('en-ZA')} ${sp.u} is standard. Some brokers differ — check the contract specs in MT5 (right-click the symbol → Specification).</small></div>
      </div></div>`;
  }
  function readCost(){
    const sym = st.ans.instrument, g = id => { const el = document.getElementById(id); return el ? el.value.trim() : null; };
    const ccy = g('ut-c-ccy'); if(ccy) cost.ccy = ccy;
    const bal = g('ut-c-bal'); if(bal !== null) cost.bal = bal;
    const sp = g('ut-c-sp'), c = g('ut-c-c');
    if(sym && (sp !== null || c !== null)){
      const o = cost.inst[sym] = cost.inst[sym] || {};
      if(sp !== null) o.sp = sp === '' ? undefined : sp;
      if(c !== null) o.c = c === '' ? undefined : c;
    }
    saveCost();
  }
  function levelsHTML(q){
    const shots = [0,1,2].map(i => {
      const sh = st.shots[i], lab = q.shots[i];
      return sh ? `<div class="ut-shot has"><img src="${sh.preview}" alt=""><span>${lab}</span><button onclick="UT.dropShot(${i})" aria-label="Remove">✕</button></div>`
                : `<label class="ut-shot"><input type="file" accept="image/*" onchange="UT.addShot(this,${i})"><b>＋</b><span>${lab}</span></label>`;
    }).join('');
    return `<div class="ut-lv">${q.fields.map(f => `
      <div class="ut-lv-f${f.req ? ' req' : ''}">
        <label for="ut-lv-${f.id}">${V(f.label)}${f.req ? ' <i>*</i>' : ' <em>optional</em>'}</label>
        <input id="ut-lv-${f.id}" type="text" inputmode="decimal" autocomplete="off" placeholder="${f.ph || 'e.g. 2345.60'}" value="${esc(st.lv[f.id] || '')}">
        <small>${V(f.hint)}</small>
      </div>`).join('')}</div>
      ${costHTML()}
      <div class="ut-lv-err" id="ut-lv-err"></div>
      <div class="ut-shots-l">📷 Chart screenshots <em>optional · helps the AI read your exact chart</em></div>
      <div class="ut-shots">${shots}</div>`;
  }

  // ── Navigation ──────────────────────────────────────────
  function pick(id, v){
    st.ans[id] = v;
    const s = cur(), q = s.questions[st.step];
    // a hard block ends the questions early — nothing after it matters
    const o = q && q.options ? opt(q, v) : null;
    if(o && o.gate === 'block'){ st.step = s.questions.length; }
    else st.step++;
    render(); scrollTop();
  }
  function toggle(id, v){
    const a = st.ans[id] = st.ans[id] || [];
    const i = a.indexOf(v); if(i >= 0) a.splice(i, 1); else a.push(v);
    render();
  }
  function next(){ st.step++; render(); scrollTop(); }
  function back(){
    const s = cur();
    if(st.step >= s.questions.length){
      // came from an early block → go back to the blocking question
      let i = s.questions.length - 1;
      while(i > 0 && st.ans[s.questions[i].id] === undefined && !(s.questions[i].type === 'levels' && Object.keys(st.lv).length)) i--;
      st.step = i;
    } else st.step = Math.max(0, st.step - 1);
    st.result = null; render(); scrollTop();
  }
  function scrollTop(){ const p = document.getElementById('guided-panel'); if(p && p.getBoundingClientRect().top < 0) p.scrollIntoView({ behavior:'smooth', block:'start' }); }
  function submitLevels(){
    const q = cur().questions[st.step];
    const err = document.getElementById('ut-lv-err');
    const bad = [];
    q.fields.forEach(f => {
      const el = document.getElementById('ut-lv-' + f.id);
      const raw = (el.value || '').trim();
      el.classList.remove('bad');
      if(!raw){ delete st.lv[f.id]; if(f.req){ bad.push(V(f.label)); el.classList.add('bad'); } return; }
      if(isNaN(num(raw)) || num(raw) <= 0){ bad.push(V(f.label)); el.classList.add('bad'); return; }
      st.lv[f.id] = raw;
    });
    readCost();
    const cs = document.getElementById('ut-c-sp'), cc = document.getElementById('ut-c-c'), cb = document.getElementById('ut-c-bal');
    if(cs && cs.value.trim() && !(parseFloat(cs.value) >= 0)) bad.push('Spread');
    if(cc && cc.value.trim() && !(parseFloat(cc.value) > 0)) bad.push('Contract size');
    if(cb && cb.value.trim() && !(parseFloat(cb.value.replace(/[\s,]/g, '')) > 0)) bad.push('Account balance');
    if(bad.length){ err.textContent = 'Check: ' + bad.join(', '); return; }
    const chk = q.check ? q.check(st.lv, num) : null;
    if(chk){ err.textContent = chk; return; }
    st.step++; render(); scrollTop();
  }
  function readShot(file, i){
    if(!file) return;
    const r = new FileReader();
    r.onload = e => {
      const full = e.target.result;
      st.shots[i] = { data: full.split(',')[1], mediaType: file.type || 'image/png', preview: full, label: cur().questions[st.step].shots[i] };
      // keep typed numbers while re-rendering
      cur().questions[st.step].fields.forEach(f => { const el = document.getElementById('ut-lv-' + f.id); if(el && el.value.trim()) st.lv[f.id] = el.value.trim(); });
      readCost();
      render();
    };
    r.readAsDataURL(file);
  }
  function addShot(input, i){ readShot(input.files[0], i); }
  function dropShot(i){
    cur().questions[st.step].fields.forEach(f => { const el = document.getElementById('ut-lv-' + f.id); if(el && el.value.trim()) st.lv[f.id] = el.value.trim(); });
    readCost();
    st.shots[i] = null; render();
  }

  // ── Result screen ───────────────────────────────────────
  function renderResult(){
    st._drawn = -1;
    const s = cur(), ev = evaluate(), panel = document.getElementById('guided-panel');
    st.result = ev;
    const isBull = ev.bias > 0, isBear = ev.bias < 0;
    S.bias = isBull ? 'bull' : isBear ? 'bear' : 'neut';
    GM.blocked = ev.blocked;
    const p = !ev.blocked && Object.keys(st.lv).length ? plan(ev.bias) : null;
    roomCheck(ev, p);
    if(p && !p.error){ const sp = specOf(st.ans.instrument); loadRate(sp.q, cost.ccy); }
    const tone = ev.blocked || ev.tooWeak ? 'block' : ev.waiting ? 'wait' : ev.grade === 'B' ? 'neut' : 'go';
    const head = ev.blocked ? '🛑 No Trade' : ev.tooWeak ? '✕ Below Blue Mac Standard' : ev.waiting ? '⏳ Watchlist — Not Ready Yet' : `✓ ${ev.gradeLong}`;
    const sub = ev.blocked ? 'A hard rule is broken. The AI is not called for blocked setups.'
      : ev.tooWeak ? `Score ${ev.score}/100. Blue Mac needs 60+ before a trade idea is built.`
      : ev.waiting ? 'The setup is forming but not confirmed. You will get a trade idea to MONITOR, not to enter.'
      : `Score ${ev.score}/100 — every layer checked. Your trade idea is ready to build.`;
    const gateHTML = ev.gates.map(g => `<div class="ut-gate ${g.type}"><b>${g.type === 'block' ? '🛑' : '⏳'} ${g.q}: ${g.l}</b>${g.why ? `<span>${g.why}</span>` : ''}</div>`).join('');
    const warnHTML = ev.warns.map(w => `<div class="ut-gate warn"><b>⚠ ${w}</b></div>`).join('');
    const tickHTML = ev.ticks.map(t => `<div class="ut-tick ${t.ok === true ? 'ok' : t.ok === false ? 'no' : 'mid'}"><i>${t.ok === true ? '✓' : t.ok === false ? '✕' : '•'}</i><span><b>${t.q}</b> ${t.l}</span></div>`).join('');
    const canFire = !ev.blocked && !ev.tooWeak && p && !p.error;
    panel.innerHTML = `
      <div class="ut-wrap" style="--ut:${s.color};">
        <div class="ut-res ${tone}">
          <div class="ut-res-top">
            <div><div class="ut-kicker">${s.short} · ${esc(st.ans.instrument || '')}</div><div class="ut-res-h">${head}</div><div class="ut-res-sub">${sub}</div></div>
            <div class="ut-score"><b>${ev.blocked ? '—' : ev.score}</b><span>${ev.blocked ? 'BLOCKED' : ev.grade ? 'GRADE ' + ev.grade : 'SCORE'}</span></div>
          </div>
          <div class="ut-res-bias ${isBull ? 'bull' : isBear ? 'bear' : ''}">${isBull ? '▲ BULLISH BIAS — look for longs' : isBear ? '▼ BEARISH BIAS — look for shorts' : '◆ NO BIAS'}</div>
          ${gateHTML}${warnHTML}
          ${p && p.error ? `<div class="ut-gate block"><b>🛑 ${p.error}</b></div>` : ''}
          ${p && !p.error ? planPreview(p, ev) : ''}
          <details class="ut-ticks"><summary>Your answers (${ev.ticks.length})</summary>${tickHTML}</details>
          <div class="ut-actions">
            <button class="ut-back" onclick="UT.back()">← Change answers</button>
            <button class="ut-back" onclick="restartGuided()">↺ Start over</button>
            ${canFire ? `<button class="ut-fire" data-ai onclick="UT.fire()">${ev.waiting ? '👁 Build Watchlist Idea →' : 'Generate Trade Idea →'}</button>`
                      : `<button class="ut-fire" disabled>${ev.blocked ? '🛑 No Trade' : ev.tooWeak ? '✕ No Trade' : 'Add price levels'}</button>`}
          </div>
          ${canFire ? '<div class="ut-quota"></div>' : ''}
        </div>
      </div>`;
    scrollTop();
    if(canFire) loadQuota();
  }
  function riskLine(ev){
    if(!ev || !ev.risk) return '';
    return `<div class="ut-risk">Risk on this trade: <b>${+ev.risk.toFixed(2)}% of your account</b> (${ev.grade} grade${ev.risk < 0.5 ? ', halved' : ''}).</div>`;
  }
  function planPreview(p, ev){
    const L = p.dir > 0 ? 'LONG' : 'SHORT';
    return `<div class="ut-plan">
      <div class="ut-plan-h">${p.dir > 0 ? '▲' : '▼'} ${L} PLAN — calculated from your levels</div>
      <div class="ut-plan-g">
        <div><span>Entry 1</span><b>${p.fmt(p.e1)}</b></div><div><span>Entry 2</span><b>${p.fmt(p.e2)}</b></div>
        <div class="sl"><span>Stop loss</span><b>${p.fmt(p.sl)}</b></div>
        <div class="tp"><span>TP1 · 1:${p.rr1}</span><b>${p.fmt(p.tp1)}</b></div><div class="tp"><span>TP2 · 1:${p.rr2}</span><b>${p.fmt(p.tp2)}</b></div>
      </div>
      <div class="ut-plan-net">R:R shown <b>after the spread</b> (${p.sp} on ${esc(st.ans.instrument || '')}). Before costs: TP1 1:${p.rr1g} · TP2 1:${p.rr2g}.</div>
      ${p.fixes.length ? `<div class="ut-plan-fix">⚠ ${p.fixes.join(' · ')}</div>` : ''}
      ${ev && !ev.waiting ? riskLine(ev) : ''}
    </div>
    ${ev && !ev.waiting && !ev.tooWeak ? sizingHTML(p, ev) : ''}`;
  }

  // ── AI ──────────────────────────────────────────────────
  function answersText(){
    const s = cur(), A = st.ans, out = [];
    s.questions.forEach(q => {
      if(q.type === 'levels') return;
      if(q.type === 'instrument') return;   // already in the prompt header
      if(q.type === 'matrix'){ const A2 = A[q.id] || {}; out.push(`${q.short}: ` + q.rows.map(([k]) => `${k} ${(q.cols.find(c => c.v === A2[k]) || {}).ai || '—'}`).join(', ')); return; }
      if(q.type === 'multi'){ const ls = (A[q.id] || []).map(v => opt(q, v)).filter(Boolean).map(o => o.ai || o.l); out.push(`${q.short}: ${ls.length ? ls.join('; ') : 'none'}`); return; }
      const o = opt(q, A[q.id]); if(o) out.push(`${q.short}${q.tf ? ' (' + V(q.tf) + ')' : ''}: ${o.ai || o.l}`);
    });
    return out.join('\n');
  }
  function levelsText(){
    const q = cur().questions.find(x => x.type === 'levels');
    return q.fields.filter(f => st.lv[f.id]).map(f => `${V(f.label)}: ${st.lv[f.id]}`).join('\n');
  }
  function planText(p){
    if(!p || p.error) return 'not available';
    return `ENTRY_1 ${p.fmt(p.e1)} (${p.e1why}) · ENTRY_2 ${p.fmt(p.e2)} (${p.e2why}) · STOP_LOSS ${p.fmt(p.sl)} (${p.slwhy}) · TAKE_PROFIT_1 ${p.fmt(p.tp1)} = 1:${p.rr1} after spread (${p.note1}) · TAKE_PROFIT_2 ${p.fmt(p.tp2)} = 1:${p.rr2} after spread (${p.note2})${p.through ? ` · NOTE: price must first break through the ${p.through.name} at ${p.fmt(p.through.price)}` : ''}`;
  }
  // ── Daily AI idea limit (enforced on the server; this only shows it) ──
  let quota = null;   // { used, limit }
  const quotaLeft = () => quota ? Math.max(0, quota.limit - quota.used) : null;
  function quotaText(){
    const left = quotaLeft(); if(left == null) return '';
    return left > 0 ? `⚡ <b>${left} of ${quota.limit}</b> AI trade ideas left today · resets at midnight SAST`
                    : `⏳ You've used today's <b>${quota.limit} AI trade ideas</b>. Your plan above is still yours — new ideas unlock at midnight SAST.`;
  }
  function paintQuota(){
    const left = quotaLeft();
    document.querySelectorAll('.ut-quota').forEach(el => { el.innerHTML = quotaText(); el.classList.toggle('out', left === 0); });
    document.querySelectorAll('[data-ai]').forEach(b => {
      if(left === 0){ b.disabled = true; if(!b.dataset.txt) b.dataset.txt = b.innerHTML; b.innerHTML = '⏳ Daily limit reached'; }
      else if(b.dataset.txt){ b.disabled = false; b.innerHTML = b.dataset.txt; delete b.dataset.txt; }
    });
  }
  function setQuota(q){ if(q && q.limit != null){ quota = { used: +q.used || 0, limit: +q.limit }; paintQuota(); } }
  async function loadQuota(){
    try { const { data } = await _supabase.rpc('bm_ideas_left'); if(data) setQuota(data); else paintQuota(); } catch(e){ paintQuota(); }
  }
  function showLimit(status, data){
    const panel = document.getElementById('guided-panel'), s = cur();
    const msg = status === 401 ? 'Your login has expired. Log out and back in, then try again.'
              : esc((data && data.error) || "You've used today's AI trade ideas.");
    panel.innerHTML = `<div class="ut-wrap" style="--ut:${s.color};"><div class="ut-limit">
        <div class="ut-limit-i">${status === 401 ? '🔒' : '⏳'}</div>
        <b>${status === 401 ? 'Please log in again' : 'Daily limit reached'}</b>
        <p>${msg}</p>
        ${status === 401 ? '' : '<p class="ut-limit-s">Your engine-calculated plan — entries, stop, targets and lot size — is still on the previous screen.</p>'}
        <div class="ut-actions" style="justify-content:center"><button class="ut-back" onclick="UT.render()">← Back to my plan</button><button class="ut-back" onclick="restartGuided()">↺ New analysis</button></div>
      </div></div>`;
    scrollTop();
  }

  async function fire(){
    if(quotaLeft() === 0) return showLimit(429, { error: `You've used your ${quota.limit} AI trade ideas for today. New ideas unlock at midnight (SAST).` });
    const s = cur(), ev = st.result || evaluate();
    if(ev.blocked || ev.tooWeak) return;
    const main = plan(ev.bias), counter = plan(-ev.bias);
    if(!main || main.error) return;
    const panel = document.getElementById('guided-panel');
    const instr = st.ans.instrument;
    const prompt = s.prompt({
      instrument: instr, bias: ev.bias > 0 ? 'BULLISH' : 'BEARISH', score: ev.score, grade: ev.gradeLong,
      status: ev.waiting ? 'WATCHLIST — the setup is NOT confirmed yet; the trader will monitor, not enter' : 'CONFIRMED — the trader may enter on the signal',
      answers: answersText(), levels: levelsText(),
      gates: ev.gates.map(g => `${g.q}: ${g.l}`).join('; ') || 'none', warns: ev.warns.join('; ') || 'none',
      longPlan: planText(ev.bias > 0 ? main : counter), shortPlan: planText(ev.bias > 0 ? counter : main),
      session: sessions()
    }) + '\n\n' + OUTPUT_RULES(s);
    panel.innerHTML = `<div class="ut-wrap" style="--ut:${s.color};"><div class="ut-think"><i></i><div><b>Building your ${s.short} trade idea…</b><span>${esc(instr)} · ${ev.bias > 0 ? '▲ Bullish' : '▼ Bearish'} · ${ev.gradeLong}</span></div></div><div id="ut-out"></div></div>`;
    scrollTop();
    let raw = '';
    try{
      const { data:{ session } } = await _supabase.auth.getSession();
      const r = await fetch('https://tcnyjxfcexjswatkeeot.supabase.co/functions/v1/trade-idea', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', ...(session && session.access_token ? { Authorization:`Bearer ${session.access_token}` } : {}) },
        body: JSON.stringify({ prompt, images: st.shots.filter(x => x && x.data) })
      });
      const data = await r.json();
      if(data && data.bm_usage) setQuota(data.bm_usage);
      if(r.status === 429 || r.status === 401) return showLimit(r.status, data);
      raw = (data.content && data.content[0] && data.content[0].text) || '';
      if(!raw) throw new Error(data.error || 'empty');
    }catch(e){
      console.error('uTrade AI error:', e);
      raw = '';
    }
    showOutput(raw, main, counter, ev);
  }
  function OUTPUT_RULES(s){
    return `OUTPUT FORMAT — follow exactly. Plain text, no markdown, no asterisks.
Write one [LONG_IDEA] block and one [SHORT_IDEA] block. The ${'bias-aligned'} idea is the main trade; the other is the counter-trend alternative — say clearly why it is weaker.
The price levels are already calculated by the Blue Mac engine from the trader's chart. Do NOT invent or change any price. Explain them.

[LONG_IDEA]
SIGNAL_CANDLE: the exact ${s.entryTF} confirmation to wait for before entering — max 14 words
WAIT_CONDITION: what must happen before this trade is valid — one sentence, or "None — setup is confirmed"
INVALIDATION: the price action that kills this idea — one sentence
MANAGEMENT: how to manage it after entry (partials at TP1, stop to breakeven, time limit) — one sentence
REASONING: 2–3 sentences in simple English a beginner understands, naming the exact concepts from the answers
[/LONG_IDEA]

[SHORT_IDEA]
SIGNAL_CANDLE: …
WAIT_CONDITION: …
INVALIDATION: …
MANAGEMENT: …
REASONING: …
[/SHORT_IDEA]`;
  }
  function parseBlock(raw, tag){
    const m = raw.match(new RegExp('\\[' + tag + '\\]([\\s\\S]*?)\\[\\/' + tag + '\\]'));
    const b = m ? m[1] : '';
    const get = k => { const r = b.match(new RegExp(k + ':\\s*([\\s\\S]*?)(?=\\n[A-Z_]{4,}:|$)')); return r ? r[1].replace(/\*+/g,'').trim() : ''; };
    return { signal:get('SIGNAL_CANDLE'), wait:get('WAIT_CONDITION'), inval:get('INVALIDATION'), manage:get('MANAGEMENT'), why:get('REASONING') };
  }
  function showOutput(raw, main, counter, ev){
    const s = cur(), out = document.getElementById('ut-out'), th = document.querySelector('.ut-think');
    if(th) th.remove();
    const L = parseBlock(raw, 'LONG_IDEA'), Sh = parseBlock(raw, 'SHORT_IDEA');
    const mainTxt = ev.bias > 0 ? L : Sh, ctrTxt = ev.bias > 0 ? Sh : L;
    const cScore = Math.max(10, Math.min(45, Math.round(ev.score * 0.45)));
    out.innerHTML = `
      ${!raw ? `<div class="ut-gate warn"><b>⚠ The AI could not be reached — your engine-calculated plan is below. Check your connection and tap Regenerate for the full write-up.</b></div>` : ''}
      ${ideaCard(main, mainTxt, true, ev.score, ev)}
      ${counter && !counter.error ? ideaCard(counter, ctrTxt, false, cScore, ev) : ''}
      <div class="ut-take" id="style-take-bar">
        ${ev.waiting ? '' : `<button class="ut-take-b ${main.dir > 0 ? 'bull' : 'bear'}" id="style-take-btn" onclick="takeThisTrade('active')">${main.dir > 0 ? '▲ Take This Long' : '▼ Take This Short'} — Save to Journal</button>`}
        <button class="ut-take-b mon" onclick="takeThisTrade('monitoring')">👁 Monitor Setup</button>
        <div class="ut-take-n">${ev.waiting ? 'Watchlist idea — save it and enter only once the signal prints.' : 'Take = entering now · Monitor = waiting for the signal'}</div>
      </div>
      <div class="ut-actions"><button class="ut-back" data-ai onclick="UT.fire()">↻ Regenerate</button><button class="ut-back" onclick="restartGuided()">↺ New analysis</button></div>
      <div class="ut-quota"></div>`;
    paintQuota();
    const f = main.fmt;
    window._lastTradePlan = {
      instrument: st.ans.instrument, style: S.style, bias: S.bias, score: ev.score,
      grade: ev.waiting ? 'Watchlist' : ev.gradeLong,
      entry: f(main.e1) + ' / ' + f(main.e2), sl: f(main.sl), tp: f(main.tp1) + ' / ' + f(main.tp2), rr: main.rr1,
      aiPlan: `uTRADE ${s.short.toUpperCase()} · ${main.dir > 0 ? 'LONG' : 'SHORT'} · ${ev.gradeLong} (${ev.score}/100)\n` +
              `Entry 1 ${f(main.e1)} · Entry 2 ${f(main.e2)} · SL ${f(main.sl)} · TP1 ${f(main.tp1)} (1:${main.rr1}) · TP2 ${f(main.tp2)} (1:${main.rr2})` + (ev.risk && !ev.waiting ? ` · Risk ${+ev.risk.toFixed(2)}%` : '') + `\n` +
              (mainTxt.signal ? `Signal: ${mainTxt.signal}\n` : '') + (mainTxt.wait ? `Wait: ${mainTxt.wait}\n` : '') +
              (mainTxt.inval ? `Invalidation: ${mainTxt.inval}\n` : '') + (mainTxt.manage ? `Management: ${mainTxt.manage}\n` : '') +
              (mainTxt.why ? `Why: ${mainTxt.why}\n` : '') + sizeText(main, ev) + `\nSetup:\n${answersText()}`,
      blocked: false
    };
  }
  function sizeText(p, ev){
    const z = ev.waiting ? null : sizing(p, ev);
    if(!z || z.need || z.tooSmall) return '';
    const M = v => fmtMoney(v, cost.ccy);
    return `Size: ${z.lots.toFixed(2)} lots (${z.l1.toFixed(2)} @ E1${z.l2 > 0 ? ` + ${z.l2.toFixed(2)} @ E2` : ''}) · max loss −${M(z.realRisk)} · TP1 +${M(z.tp1)} · TP2 +${M(z.tp2)} (${cost.ccy}, spread ${p.sp})\n`;
  }
  function ideaCard(p, t, aligned, score, ev){
    const long = p.dir > 0, c = long ? 'bull' : 'bear', f = p.fmt;
    return `<div class="ut-idea ${c}${aligned ? ' main' : ''}">
      <div class="ut-idea-h">
        <div><div class="ut-idea-dir">${long ? '▲ LONG' : '▼ SHORT'}</div>
          <div class="ut-idea-tag">${aligned ? (ev.waiting ? '👁 WATCHLIST · WITH THE BIAS' : '✓ WITH THE BIAS') : '⚠ COUNTER-TREND · NOT RECOMMENDED'}</div></div>
        <div class="ut-score sm"><b>${score}</b><span>SETUP SCORE</span></div>
      </div>
      ${t.wait && !/^none/i.test(t.wait) ? `<div class="ut-idea-wait">⏳ ${esc(t.wait)}</div>` : ''}
      <div class="ut-idea-b">
        <div class="ut-idea-lv">
          <div class="e"><span>① Entry 1</span><b>${f(p.e1)}</b><small>${esc(p.e1why)}</small></div>
          <div class="e2"><span>② Entry 2</span><b>${f(p.e2)}</b><small>${esc(p.e2why)}</small></div>
          <div class="sl"><span>Stop loss</span><b>${f(p.sl)}</b><small>${esc(p.slwhy)}</small></div>
          <div class="tp"><span>TP1 · 1:${p.rr1}</span><b>${f(p.tp1)}</b><small>${esc(p.note1)}</small></div>
          <div class="tp"><span>TP2 · 1:${p.rr2}</span><b>${f(p.tp2)}</b><small>${esc(p.note2)}</small></div>
        </div>
        ${ladder(p)}
      </div>
      ${aligned && !ev.waiting ? sizingHTML(p, ev).replace('data-size', `data-size data-dir="${p.dir}"`) : ''}
      <div class="ut-rules">✓ BLUE MAC RISK RULES · TP1 1:${p.rr1} · TP2 1:${p.rr2} after spread · Entry 2 inside SL${aligned && ev.risk && !ev.waiting ? ` · RISK ${+ev.risk.toFixed(2)}%` : ''}${p.fixes.length ? `<div>Adjusted: ${esc(p.fixes.join(' · '))}</div>` : ''}</div>
      ${t.signal ? `<div class="ut-idea-row sig"><span>🕯 Signal to wait for</span>${esc(t.signal)}</div>` : ''}
      ${t.why ? `<div class="ut-idea-row"><span>Why this trade</span>${esc(t.why)}</div>` : ''}
      ${t.manage ? `<div class="ut-idea-row"><span>Managing it</span>${esc(t.manage)}</div>` : ''}
      ${t.inval ? `<div class="ut-idea-row inv"><span>Idea is dead if</span>${esc(t.inval)}</div>` : ''}
    </div>`;
  }
  // vertical price ladder: SL · E2 · E1 · TP1 · TP2 to scale
  function ladder(p){
    const lv = [['TP2', p.tp2, '#22D67A'], ['TP1', p.tp1, '#22D67A'], ['E1', p.e1, '#2A8FE3'], ['E2', p.e2, '#96D0FF'], ['SL', p.sl, '#FF5C5C']];
    const vals = lv.map(x => x[1]), hi = Math.max(...vals), lo = Math.min(...vals);
    const Y = v => 12 + (hi - v) / ((hi - lo) || 1) * 156;
    const yE = Y(p.e1), ySL = Y(p.sl), yT = Y(p.tp2);
    let sv = `<rect x="34" y="${Math.min(yE, ySL)}" width="26" height="${Math.abs(ySL - yE)}" fill="#FF5C5C" opacity="0.18"/>`;
    sv += `<rect x="34" y="${Math.min(yE, yT)}" width="26" height="${Math.abs(yT - yE)}" fill="#22D67A" opacity="0.14"/>`;
    const ys = [];
    lv.forEach(([n, v, c]) => {
      const y = Y(v);
      let ty = y; ys.forEach(o => { if(Math.abs(o - ty) < 11) ty = o + (p.dir > 0 ? 11 : -11); }); ys.push(ty);
      sv += `<line x1="28" y1="${y.toFixed(1)}" x2="66" y2="${y.toFixed(1)}" stroke="${c}" stroke-width="1.6" ${n === 'E2' ? 'stroke-dasharray="3,2"' : ''}/>`;
      sv += `<text x="72" y="${(ty + 3).toFixed(1)}" font-family="'DM Mono',monospace" font-size="9" font-weight="bold" fill="${c}">${n}</text>`;
    });
    return `<svg class="ut-ladder" viewBox="0 0 100 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${sv}</svg>`;
  }

  return { register, has, reset, render, pick, toggle, cell, showAll, knowReady, knowToggle, uni: openUni, uniState, setRate: setManualRate, spec: specOf, cost, next, back, submitLevels, addShot, dropShot, fire,
           learn, closeLearn, sessions, bias: currentBias, stdLevels, stdCheck, rulesHTML, goTo, D, exCard, _st: st, _eval: evaluate, _plan: plan, simulate, def: k => STRATS[k] };
})();

// ── Styles ──────────────────────────────────────────────
(function(){
  const css = `
.ut-panel{display:block!important}
.ut-wrap{max-width:860px;margin:0 auto;padding:4px 0 32px;display:flex;flex-direction:column;gap:14px}
.ut-intro{padding:18px 22px;border-radius:16px;border:1px solid var(--border2);background:linear-gradient(135deg,rgba(42,143,227,0.08),rgba(42,143,227,0.01))}
.ut-intro-top{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center}
.ut-intro-badge{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--blue);font-weight:700}
.ut-intro-tf{font-family:'DM Mono',monospace;font-size:11px;color:var(--text2);padding:3px 10px;border:1px solid var(--border2);border-radius:20px}
.ut-intro-name{font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;margin-top:6px;color:var(--text)}
.ut-intro-desc{font-size:13.5px;color:var(--text2);line-height:1.65;margin-top:4px}
.ut-intro-pills{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.ut-intro-pills span{font-family:'DM Mono',monospace;font-size:10.5px;padding:3px 10px;border-radius:20px;background:var(--bg4);border:1px solid var(--border);color:var(--text2)}
.ut-know{border:1px solid rgba(42,143,227,0.35);border-radius:16px;background:linear-gradient(160deg,rgba(42,143,227,0.07),rgba(42,143,227,0.01));padding:18px 20px;display:flex;flex-direction:column;gap:12px;animation:rise .3s ease both}
.ut-know-h{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.ut-know-t{font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;color:var(--text);margin-top:3px}
.ut-know-p{flex-shrink:0;text-align:center;padding:6px 12px;border-radius:12px;background:var(--bg4);border:1px solid var(--border)}
.ut-know-p b{display:block;font-family:'Outfit',sans-serif;font-size:20px;color:var(--text)}
.ut-know-p span{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.06em;color:var(--text3);text-transform:uppercase}
.ut-know-d{font-size:13.5px;color:var(--text2);line-height:1.65}
.ut-know-l{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ut-k{display:flex;flex-direction:column;gap:8px;justify-content:space-between;padding:11px 12px;border-radius:12px;background:var(--bg3);border:1px solid var(--border)}
.ut-k.done{border-color:rgba(34,214,122,0.3)}
.ut-k-txt{display:flex;flex-direction:column;gap:2px}
.ut-k-txt b{font-size:13.5px;color:var(--text)}
.ut-k-txt span{font-size:12px;color:var(--text2);line-height:1.5}
.ut-k-btns{display:flex;gap:6px;flex-wrap:wrap}
.ut-k-btns button{font-family:'DM Sans',sans-serif;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:20px;cursor:pointer;border:1px solid rgba(42,143,227,0.3);background:rgba(42,143,227,0.08);color:var(--blue)}
.ut-k-uni.done{color:var(--bull);border-color:rgba(34,214,122,0.3);background:rgba(34,214,122,0.08)}
.ut-k-uni.locked{color:var(--text3);border-color:var(--border2);background:transparent}
.ut-know-f{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.ut-know-f span{font-size:12.5px;color:var(--text3);flex:1;min-width:200px}
.ut-know-bar{display:flex;align-items:center;gap:6px;flex-wrap:wrap;width:100%;text-align:left;padding:10px 14px;border-radius:12px;border:1px dashed rgba(42,143,227,0.35);background:rgba(42,143,227,0.04);color:var(--text2);font-size:12.5px;cursor:pointer;font-family:'DM Sans',sans-serif}
.ut-know-bar b{color:var(--text)} .ut-know-bar span{margin-left:auto;color:var(--blue);font-weight:700}
.ut-prog{display:flex;flex-direction:column;gap:8px}
.ut-stages{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.ut-stages::-webkit-scrollbar{display:none}
.ut-stage{flex-shrink:0;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;padding:4px 10px;border-radius:20px;border:1px solid var(--border);color:var(--text3)}
.ut-stage.on{color:var(--blue);border-color:rgba(42,143,227,0.5);background:rgba(42,143,227,0.1)}
.ut-stage.done{color:var(--bull);border-color:rgba(34,214,122,0.25)}
.ut-bar{height:4px;border-radius:4px;background:var(--bg4);overflow:hidden}
.ut-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--blue),#96D0FF);border-radius:4px;transition:width .35s}
.ut-count{font-family:'DM Mono',monospace;font-size:10.5px;color:var(--text3);text-align:right}
.ut-card{background:var(--bg3);border:1px solid var(--border2);border-radius:18px;padding:24px 26px;display:flex;flex-direction:column;gap:14px;box-shadow:0 8px 40px rgba(0,0,0,0.35);animation:rise .3s ease both}
.ut-card.still{animation:none}
.ut-kicker{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);font-weight:700}
.ut-tf{color:var(--text);background:var(--bg5);padding:1px 7px;border-radius:5px}
.ut-q{font-family:'Outfit',sans-serif;font-size:21px;font-weight:700;line-height:1.35;color:var(--text)}
.ut-help{font-size:13.5px;color:var(--text2);line-height:1.7;padding:12px 14px;border-radius:10px;background:var(--bg4);border-left:3px solid var(--blue)}
.ut-help b,.ut-help strong{color:var(--text)}
.ut-live{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-family:'DM Mono',monospace;font-size:11.5px;color:var(--text2);padding:10px 12px;border-radius:10px;border:1px dashed var(--border2)}
.ut-live b{color:var(--text)}
.ut-live .now{color:var(--bull)}
.ut-hero{border-radius:12px;background:rgba(255,255,255,0.02);border:1px solid var(--border);padding:12px;display:flex;flex-direction:column;align-items:center;gap:8px}
.ut-hero svg{max-width:420px!important;width:100%}
.ut-hero-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%}
.ut-hero-row>div{display:flex;flex-direction:column;align-items:center;gap:4px}
.ut-hero-row b{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.06em}
.ut-hero-cap{font-family:'DM Mono',monospace;font-size:10.5px;color:var(--text2);text-align:center;letter-spacing:.04em;line-height:1.6}
.ut-learn-btn,.ut-opt-learn{font-family:'DM Sans',sans-serif;font-size:11.5px;font-weight:600;color:var(--blue);background:rgba(42,143,227,0.08);border:1px solid rgba(42,143,227,0.25);border-radius:20px;padding:4px 12px;cursor:pointer}
.ut-learn-btn:hover,.ut-opt-learn:hover{background:rgba(42,143,227,0.16)}
.ut-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px}
.ut-opts.compact{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.ut-opts.dg{grid-template-columns:repeat(2,1fr)}
.ut-opts.dg .ut-opt-dg svg{max-width:340px!important}
.ut-opts.compact .ut-opt-dg{max-height:120px;overflow:hidden}
.ut-opts.compact .ut-opt-dg svg{max-height:112px}
.ut-opt{position:relative;text-align:left;border:1px solid var(--border2);background:var(--bg4);border-radius:14px;padding:12px;cursor:pointer;display:flex;flex-direction:column;gap:6px;transition:border-color .15s,background .15s,transform .15s;outline:none}
.ut-opt:hover{border-color:rgba(255,255,255,0.3);transform:translateY(-1px)}
.ut-opt:focus-visible{box-shadow:0 0 0 2px var(--blue)}
.ut-opt-dg{border-radius:9px;background:rgba(0,0,0,0.35);padding:4px;display:flex;justify-content:center}
.ut-opt-dg svg{max-width:100%!important}
.ut-opt-t{font-weight:700;font-size:13.5px;color:var(--text);line-height:1.35}
.ut-opt-s{font-size:12px;color:var(--text2);line-height:1.5}
.ut-opt .ut-opt-learn{align-self:flex-start;margin-top:auto;padding:3px 10px;font-size:11px}
.ut-opt.bull .ut-opt-t{color:#7CEDB0}.ut-opt.bear .ut-opt-t{color:#FF9A9A}
.ut-opt.on{border-color:var(--blue);background:rgba(42,143,227,0.1);box-shadow:0 0 0 1px var(--blue)}
.ut-opt.bull.on{border-color:var(--bull);background:rgba(34,214,122,0.08);box-shadow:0 0 0 1px var(--bull)}
.ut-opt.bear.on{border-color:var(--bear);background:rgba(255,92,92,0.08);box-shadow:0 0 0 1px var(--bear)}
.ut-opt.block.on,.ut-opt.wait.on{border-color:#F5B841;background:rgba(245,184,65,0.07)}
.ut-tag{align-self:flex-start;font-family:'DM Mono',monospace;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:.05em}
.ut-tag.block{color:var(--bear);background:rgba(255,92,92,0.1);border:1px solid rgba(255,92,92,0.3)}
.ut-tag.wait{color:#F5B841;background:rgba(245,184,65,0.1);border:1px solid rgba(245,184,65,0.3)}
.ut-check{position:absolute;top:10px;right:10px;width:22px;height:22px;border-radius:6px;border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#050505;background:var(--bg3);z-index:1}
.ut-opt.on .ut-check{background:var(--blue);border-color:var(--blue)}
.ut-nav,.ut-actions{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center}
.ut-actions{justify-content:flex-end}
.ut-quota{font-size:12.5px;color:var(--text2);text-align:right;line-height:1.5}
.ut-quota:empty{display:none}
.ut-quota.out{text-align:left;padding:10px 12px;border-radius:10px;border:1px dashed rgba(245,184,65,0.3);background:rgba(245,184,65,0.05);color:#E9C77A}
.ut-limit{text-align:center;padding:28px 22px;border-radius:16px;border:1px solid rgba(245,184,65,0.3);background:linear-gradient(135deg,rgba(245,184,65,0.07),rgba(245,184,65,0.01));display:flex;flex-direction:column;gap:10px;align-items:center}
.ut-limit-i{font-size:34px}
.ut-limit b{font-family:'Outfit',sans-serif;font-size:20px}
.ut-limit p{font-size:14px;color:var(--text2);max-width:440px;line-height:1.6}
.ut-limit .ut-limit-s{font-size:12.5px;color:var(--text3, #8AA4BF)}
.ut-back{padding:10px 16px;border-radius:10px;border:1px solid var(--border2);background:transparent;color:var(--text2);font-size:13px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif}
.ut-back:hover{color:var(--text);border-color:rgba(255,255,255,0.3)}
.ut-next,.ut-fire{padding:12px 20px;border-radius:12px;border:1px solid rgba(42,143,227,0.5);background:linear-gradient(135deg,#2A8FE3,#1272BC);color:#fff;font-size:14px;font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif;box-shadow:0 6px 20px rgba(42,143,227,0.25)}
.ut-fire[disabled]{background:var(--bg4);color:var(--text3);border-color:var(--border);box-shadow:none;cursor:not-allowed}
.ut-more{align-self:flex-start;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;color:var(--text3);background:transparent;border:1px dashed var(--border2);border-radius:20px;padding:6px 14px;cursor:pointer}
.ut-more:hover{color:var(--text2);border-color:rgba(255,255,255,0.3)}
.ut-mx{display:flex;flex-direction:column;gap:6px}
.ut-mx-r{display:grid;grid-template-columns:150px 1fr;gap:10px;align-items:center;padding:8px 10px;border-radius:12px;background:var(--bg4);border:1px solid var(--border)}
.ut-mx-l{display:flex;flex-direction:column;line-height:1.25}
.ut-mx-l b{font-family:'DM Mono',monospace;font-size:14px;color:var(--text)}
.ut-mx-l span{font-size:11px;color:var(--text2)}
.ut-mx-l em{font-style:normal;font-family:'DM Mono',monospace;font-size:9.5px;color:var(--text3)}
.ut-mx-b{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.ut-mx-b button{padding:9px 6px;border-radius:9px;border:1px solid var(--border2);background:var(--bg3);color:var(--text2);font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif}
.ut-mx-b button.bull.on{background:rgba(34,214,122,0.14);border-color:var(--bull);color:var(--bull)}
.ut-mx-b button.bear.on{background:rgba(255,92,92,0.14);border-color:var(--bear);color:var(--bear)}
.ut-mx-b button.neut.on{background:rgba(228,232,238,0.1);border-color:var(--gold);color:var(--text)}
.ut-mx-sum{position:relative;overflow:hidden;font-family:'DM Mono',monospace;font-size:12px;font-weight:700;padding:10px 12px;border-radius:10px;background:var(--bg4);border:1px solid var(--border2);color:var(--text2)}
.ut-mx-sum.bull{color:var(--bull)}.ut-mx-sum.bear{color:var(--bear)}
.ut-mx-sum i{position:absolute;left:0;bottom:0;height:3px;background:currentColor;opacity:.8}
.ut-next[disabled]{background:var(--bg4);color:var(--text3);border-color:var(--border);box-shadow:none;cursor:not-allowed}
.ut-risk{font-family:'DM Mono',monospace;font-size:11.5px;color:var(--text2);margin-top:8px}
.ut-risk b{color:var(--text)}
.ut-inst{display:flex;flex-direction:column;gap:12px}
.ut-inst-gl{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:6px}
.ut-inst-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.ut-inst-b{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:10px 12px;border-radius:10px;border:1px solid var(--border2);background:var(--bg4);color:var(--text);cursor:pointer;text-align:left}
.ut-inst-b b{font-family:'DM Mono',monospace;font-size:13px}
.ut-inst-b span{font-size:11px;color:var(--text3)}
.ut-inst-b:hover{border-color:rgba(255,255,255,0.3)}
.ut-inst-b.on{border-color:var(--blue);background:rgba(42,143,227,0.12)}
.ut-lv{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
.ut-lv-f{display:flex;flex-direction:column;gap:5px}
.ut-lv-f label{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--text2);font-weight:700}
.ut-lv-f label i{color:var(--bear);font-style:normal}
.ut-lv-f label em{color:var(--text3);font-style:normal;font-weight:400;text-transform:none;letter-spacing:0}
.ut-lv-f input{padding:12px 14px;border-radius:10px;border:1px solid var(--border2);background:var(--bg4);color:var(--text);font-size:16px;font-family:'DM Mono',monospace;outline:none;width:100%}
.ut-lv-f input:focus{border-color:var(--blue)}
.ut-lv-f input.bad{border-color:var(--bear)}
.ut-lv-f small{font-size:11.5px;color:var(--text3);line-height:1.45}
.ut-lv-err{color:var(--bear);font-size:13px;font-weight:600;min-height:0}
.ut-lv-err:empty{display:none}
.ut-shots-l{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.06em;color:var(--text2);text-transform:uppercase;font-weight:700}
.ut-shots-l em{text-transform:none;letter-spacing:0;color:var(--text3);font-style:normal;font-weight:400}
.ut-shots{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ut-shot{position:relative;height:74px;border-radius:10px;border:1px dashed var(--border2);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;cursor:pointer;color:var(--text3);font-size:11px;overflow:hidden;background:var(--bg4)}
.ut-shot input{display:none}
.ut-shot b{font-size:18px;color:var(--blue)}
.ut-shot.has img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55}
.ut-shot.has span{position:relative;color:var(--text);font-weight:700}
.ut-shot.has button{position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(0,0,0,0.7);color:#fff;cursor:pointer}
.ut-res{background:var(--bg3);border:1px solid var(--border2);border-radius:18px;padding:22px 24px;display:flex;flex-direction:column;gap:12px;animation:rise .3s ease both}
.ut-res.go{border-color:rgba(34,214,122,0.35)}.ut-res.block{border-color:rgba(255,92,92,0.35)}.ut-res.wait{border-color:rgba(245,184,65,0.35)}
.ut-res-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.ut-res-h{font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;margin-top:4px}
.ut-res.go .ut-res-h{color:var(--bull)}.ut-res.block .ut-res-h{color:var(--bear)}.ut-res.wait .ut-res-h{color:#F5B841}
.ut-res-sub{font-size:13.5px;color:var(--text2);margin-top:2px;line-height:1.6}
.ut-score{flex-shrink:0;text-align:center;min-width:76px;padding:8px 10px;border-radius:12px;background:var(--bg4);border:1px solid var(--border)}
.ut-score b{display:block;font-family:'Outfit',sans-serif;font-size:30px;font-weight:900;line-height:1;color:var(--text)}
.ut-score span{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.1em;color:var(--text3)}
.ut-score.sm b{font-size:24px}
.ut-res-bias{font-family:'DM Mono',monospace;font-size:12px;font-weight:700;letter-spacing:.06em;padding:8px 12px;border-radius:10px;background:var(--bg4);color:var(--text2)}
.ut-res-bias.bull{color:var(--bull);background:rgba(34,214,122,0.07)}.ut-res-bias.bear{color:var(--bear);background:rgba(255,92,92,0.07)}
.ut-gate{display:flex;flex-direction:column;gap:3px;padding:10px 12px;border-radius:10px;font-size:13px;line-height:1.55}
.ut-gate b{font-weight:700}
.ut-gate span{color:var(--text2);font-size:12.5px}
.ut-gate.block{background:rgba(255,92,92,0.07);border:1px solid rgba(255,92,92,0.28);color:var(--bear)}
.ut-gate.wait{background:rgba(245,184,65,0.07);border:1px solid rgba(245,184,65,0.28);color:#F5B841}
.ut-gate.warn{background:rgba(245,184,65,0.04);border:1px dashed rgba(245,184,65,0.25);color:#E9C77A}
.ut-plan{border:1px solid var(--border2);border-radius:12px;padding:12px 14px;background:var(--bg4)}
.ut-plan-h{font-family:'DM Mono',monospace;font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--text2);margin-bottom:8px}
.ut-plan-g{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.ut-plan-g div{display:flex;flex-direction:column;gap:2px}
.ut-plan-g span{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text3)}
.ut-plan-g b{font-family:'DM Mono',monospace;font-size:14px;color:var(--blue)}
.ut-plan-g .sl b{color:var(--bear)}.ut-plan-g .tp b{color:var(--bull)}
.ut-plan-net{margin-top:8px;font-size:11.5px;color:var(--text3);font-family:'DM Mono',monospace;line-height:1.5}
.ut-plan-net b{color:var(--text2)}
.ut-cost{border:1px dashed var(--border2);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:10px}
.ut-cost-h{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.06em;text-transform:uppercase;font-weight:700;color:var(--text2)}
.ut-cost-h em{text-transform:none;letter-spacing:0;color:var(--text3);font-style:normal;font-weight:400}
.ut-cost select{padding:12px 14px;border-radius:10px;border:1px solid var(--border2);background:var(--bg4);color:var(--text);font-size:15px;font-family:'DM Sans',sans-serif;width:100%}
.ut-size{border:1px solid rgba(42,143,227,0.3);border-radius:12px;padding:12px 14px;background:rgba(42,143,227,0.05);display:flex;flex-direction:column;gap:8px;font-size:13px;color:var(--text2);line-height:1.55}
.ut-idea .ut-size{margin:8px 20px 0}
.ut-size-h{font-family:'DM Mono',monospace;font-size:10.5px;font-weight:700;letter-spacing:.08em;color:var(--blue)}
.ut-size b{color:var(--text)} .ut-size b.no{color:var(--bear)}
.ut-size small{font-size:11px;color:var(--text3);line-height:1.5}
.ut-size-g{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.ut-size-g div{display:flex;flex-direction:column;gap:1px;min-width:0}
.ut-size-g span{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--text3)}
.ut-size-g b{font-family:'DM Mono',monospace;font-size:13.5px;color:var(--text)}
.ut-size-g .sl b{color:var(--bear)} .ut-size-g .tp b{color:var(--bull)}
.ut-fx{width:90px;padding:6px 8px;border-radius:8px;border:1px solid var(--border2);background:var(--bg4);color:var(--text);font-family:'DM Mono',monospace}
.ut-plan-fix{margin-top:8px;font-size:12px;color:#F5B841;line-height:1.5}
.ut-ticks{border-top:1px solid var(--border);padding-top:10px}
.ut-ticks summary{cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.06em;color:var(--text2);text-transform:uppercase;font-weight:700;margin-bottom:6px}
.ut-tick{display:flex;gap:8px;align-items:flex-start;font-size:13px;color:var(--text2);padding:4px 0;line-height:1.45}
.ut-tick i{font-style:normal;font-weight:800;width:16px;flex-shrink:0;text-align:center}
.ut-tick.ok i{color:var(--bull)}.ut-tick.no i{color:var(--bear)}.ut-tick.mid i{color:#F5B841}
.ut-tick b{color:var(--text);font-weight:600}
.ut-think{display:flex;align-items:center;gap:12px;padding:16px 18px;border-radius:12px;background:rgba(42,143,227,0.06);border:1px solid rgba(42,143,227,0.2)}
.ut-think i{width:18px;height:18px;border:2px solid rgba(42,143,227,0.3);border-top-color:var(--blue);border-radius:50%;animation:utspin .8s linear infinite;flex-shrink:0}
.ut-think b{display:block;font-size:13.5px;color:var(--blue)}
.ut-think span{font-family:'DM Mono',monospace;font-size:11px;color:var(--text3)}
@keyframes utspin{to{transform:rotate(360deg)}}
#ut-out{display:flex;flex-direction:column;gap:14px}
.ut-idea{background:var(--bg3);border:1px solid var(--border);border-radius:18px;overflow:hidden;opacity:.92}
.ut-idea.main{opacity:1}
.ut-idea.main.bull{border-color:rgba(34,214,122,0.4);box-shadow:0 0 30px rgba(34,214,122,0.08)}
.ut-idea.main.bear{border-color:rgba(255,92,92,0.4);box-shadow:0 0 30px rgba(255,92,92,0.08)}
.ut-idea-h{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:16px 20px;border-bottom:1px solid var(--border)}
.ut-idea.bull .ut-idea-h{background:linear-gradient(135deg,rgba(34,214,122,0.09),transparent)}
.ut-idea.bear .ut-idea-h{background:linear-gradient(135deg,rgba(255,92,92,0.09),transparent)}
.ut-idea-dir{font-family:'Outfit',sans-serif;font-size:26px;font-weight:900;line-height:1}
.ut-idea.bull .ut-idea-dir{color:var(--bull)}.ut-idea.bear .ut-idea-dir{color:var(--bear)}
.ut-idea-tag{font-family:'DM Mono',monospace;font-size:10px;font-weight:700;letter-spacing:.06em;color:var(--text2);margin-top:5px}
.ut-idea:not(.main) .ut-idea-tag{color:#F5B841}
.ut-idea-wait{padding:10px 20px;font-size:13px;color:#F5B841;background:rgba(245,184,65,0.05);border-bottom:1px solid var(--border);line-height:1.55}
.ut-idea-b{display:flex;gap:12px;padding:16px 20px 6px}
.ut-idea-lv{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.ut-idea-lv div{padding:9px 11px;border-radius:10px;background:var(--bg4);border:1px solid var(--border);display:flex;flex-direction:column;gap:1px;min-width:0}
.ut-idea-lv .sl{grid-column:1/-1}
.ut-idea-lv span{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--text3)}
.ut-idea-lv b{font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;color:var(--blue)}
.ut-idea-lv .e2 b{color:#96D0FF}.ut-idea-lv .sl b{color:var(--bear)}.ut-idea-lv .tp b{color:var(--bull)}
.ut-idea-lv small{font-size:11px;color:var(--text3);line-height:1.35}
.ut-ladder{width:96px;flex-shrink:0;align-self:center}
.ut-rules{margin:8px 20px 4px;padding:8px 12px;border-radius:10px;background:rgba(42,143,227,0.06);border:1px solid rgba(42,143,227,0.22);font-family:'DM Mono',monospace;font-size:10.5px;color:var(--blue);font-weight:700;letter-spacing:.04em;line-height:1.6}
.ut-rules div{color:#F5B841;font-weight:400}
.ut-idea-row{margin:8px 20px 0;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.02);border:1px solid var(--border);font-size:13.5px;color:var(--text2);line-height:1.65}
.ut-idea-row:last-child{margin-bottom:18px}
.ut-idea-row span{display:block;font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);font-weight:700;margin-bottom:3px}
.ut-idea-row.sig{border-left:3px solid var(--blue)}.ut-idea-row.inv{border-left:3px solid var(--bear)}
.ut-take{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:14px;border-radius:14px;border:1px solid var(--border);background:var(--bg3)}
.ut-take-err{grid-column:1/-1;padding:9px 12px;border-radius:10px;border:1px solid rgba(255,92,92,0.4);background:rgba(255,92,92,0.08);color:#FF9A9A;font-size:12.5px;line-height:1.5}
.ut-take-err b{color:#FF5C5C}
.ut-take-b{padding:13px 10px;border-radius:12px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif;border:1px solid var(--border2);background:var(--bg4);color:var(--text)}
.ut-take-b.bull{background:rgba(34,214,122,0.12);border-color:rgba(34,214,122,0.45);color:var(--bull)}
.ut-take-b.bear{background:rgba(255,92,92,0.12);border-color:rgba(255,92,92,0.45);color:var(--bear)}
.ut-take-b.mon:only-of-type{grid-column:1/-1}
.ut-take-n{grid-column:1/-1;text-align:center;font-family:'DM Mono',monospace;font-size:10.5px;color:var(--text3)}
.ut-learn{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:16px}
.ut-learn.on{display:flex}
.ut-learn-box{width:100%;max-width:620px;max-height:88vh;overflow:auto;background:var(--bg3);border:1px solid var(--border2);border-radius:18px;box-shadow:0 20px 60px rgba(0,0,0,0.6)}
.ut-learn-head{position:sticky;top:0;display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:16px 18px;background:var(--bg3);border-bottom:1px solid var(--border);z-index:1}
.ut-learn-kicker{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--blue)}
.ut-learn-title{font-family:'Outfit',sans-serif;font-size:19px;font-weight:800;margin-top:2px}
.ut-learn-x{width:34px;height:34px;flex-shrink:0;border-radius:50%;border:1px solid var(--border2);background:var(--bg4);color:var(--text);cursor:pointer;font-size:14px}
.ut-learn-body{padding:16px 18px 20px;display:flex;flex-direction:column;gap:12px}
@media (max-width:700px){
  .ut-card{padding:18px 14px;border-radius:16px}
  .ut-q{font-size:18px}
  .ut-opts,.ut-opts.compact{grid-template-columns:1fr 1fr;gap:8px}
  .ut-opts.dg{grid-template-columns:1fr}
  .ut-opts.dg .ut-opt{display:grid;grid-template-columns:1fr;gap:6px}
  .ut-opt{padding:9px;border-radius:12px}
  .ut-opt-t{font-size:12.5px}.ut-opt-s{font-size:11.5px}
  .ut-intro{padding:14px 16px}.ut-intro-name{font-size:19px}
  .ut-res{padding:16px 14px}.ut-res-h{font-size:20px}
  .ut-plan-g{grid-template-columns:repeat(2,1fr)}
  .ut-size-g{grid-template-columns:repeat(2,1fr)}
  .ut-idea .ut-size{margin-left:14px;margin-right:14px}
  .ut-idea-b{padding:14px 14px 4px}.ut-idea-h{padding:14px}
  .ut-rules,.ut-idea-row{margin-left:14px;margin-right:14px}
  .ut-ladder{width:70px}
  .ut-inst-row{grid-template-columns:repeat(3,1fr)}
  .ut-mx-r{grid-template-columns:1fr;gap:6px}
  .ut-know{padding:14px}.ut-know-l{grid-template-columns:1fr}.ut-know-t{font-size:17px}
  .ut-know-f .ut-next{width:100%}
  .ut-hero-row{grid-template-columns:1fr}
  .ut-mx-l{flex-direction:row;gap:8px;align-items:baseline}
  .ut-take{grid-template-columns:1fr}
  .ut-next,.ut-fire{flex:1}
}
@media (max-width:380px){ .ut-opts,.ut-opts.compact{grid-template-columns:1fr} .ut-idea-lv{grid-template-columns:1fr} }
`;
  const el = document.createElement('style'); el.id = 'ut-css'; el.textContent = css; document.head.appendChild(el);
})();
