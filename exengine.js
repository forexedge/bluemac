// ══════════════════════════════════════════════════════
// BLUE MAC — EXAMPLES CHART ENGINE
// Generates realistic candles from anchor points and computes REAL
// indicator values (SMA, EMA, RSI, MACD, Bollinger, Stochastic, ATR,
// VWAP, Ichimoku, Volume Profile) so every diagram is mathematically true.
// Used by indicators.js and management.js
// ══════════════════════════════════════════════════════
window.BMX = (function(){
  const W = 260, H = 150, XR = 212;
  const C = { bull:'#22D67A', bear:'#FF5C5C', blue:'#2A8FE3', light:'#96D0FF', silver:'#E4E8EE',
              slate:'#8AA4BF', amber:'#F5B841', white:'rgba(255,255,255,0.82)', dim:'rgba(255,255,255,0.35)' };
  const col = c => C[c] || c;
  const f1 = v => (+v).toFixed(1);
  const T = (x,y,t,o={}) => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${o.a||'middle'}" font-family="'DM Mono',monospace" font-size="${o.s||7}" font-weight="bold" fill="${o.c||C.white}" opacity="${o.o||1}">${t}</text>`;

  // ── Deterministic random ──
  function rng(seed){
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  // ── Candle generator ──
  // sp.pts = [[index, price, noise?], ...]  sp.n = candle count
  function gen(sp){
    const r = rng(sp.seed || 7), n = sp.n, P = sp.pts, dn = sp.noise || 1.2;
    const at = (i, k) => {
      for(let j = 0; j < P.length - 1; j++){
        const a = P[j], b = P[j+1];
        if(i >= a[0] && i <= b[0]){
          const t = (i - a[0]) / ((b[0] - a[0]) || 1);
          const av = a[k] !== undefined ? a[k] : dn, bv = b[k] !== undefined ? b[k] : dn;
          return av + (bv - av) * t;
        }
      }
      const last = P[P.length-1]; return last[k] !== undefined ? last[k] : dn;
    };
    const o = [], c = [], h = [], l = [], v = [];
    for(let i = 0; i < n; i++){
      const nz = at(i, 2);
      c[i] = at(i, 1) + (r() - 0.5) * 2 * nz;
      o[i] = i === 0 ? c[i] + (r() - 0.5) * nz : c[i-1];
      h[i] = Math.max(o[i], c[i]) + r() * nz * (sp.wick || 0.9);
      l[i] = Math.min(o[i], c[i]) - r() * nz * (sp.wick || 0.9);
      const sp_ = (sp.vspike && sp.vspike[i]) || 1;
      v[i] = (sp.vbase || 100) * (0.55 + r() * 0.7) * (1 + Math.abs(c[i] - o[i]) / (nz || 1) * 0.25) * sp_;
    }
    Object.entries(sp.fix || {}).forEach(([i, ov]) => {
      i = +i;
      ['o','c','h','l','v'].forEach(k => { if(ov[k] !== undefined) ({o,c,h,l,v})[k][i] = ov[k]; });
      if(ov.o !== undefined && i > 0 && ov.keepPrev === undefined) c[i-1] = ov.o;
      h[i] = Math.max(h[i], o[i], c[i]); l[i] = Math.min(l[i], o[i], c[i]);
      if(i > 0){ h[i-1] = Math.max(h[i-1], o[i-1], c[i-1]); l[i-1] = Math.min(l[i-1], o[i-1], c[i-1]); }
    });
    return { o, c, h, l, v, n };
  }

  // ── Indicator maths ──
  const sma = (a, n) => a.map((_, i) => i < n - 1 ? null : a.slice(i - n + 1, i + 1).reduce((s, x) => s + x, 0) / n);
  function ema(a, n){
    const k = 2 / (n + 1), out = []; let prev = null, start = a.findIndex(x => x !== null && x !== undefined);
    for(let i = 0; i < a.length; i++){
      if(i < start + n - 1){ out.push(null); continue; }
      if(prev === null){ prev = a.slice(i - n + 1, i + 1).reduce((s, x) => s + x, 0) / n; out.push(prev); continue; }
      prev = a[i] * k + prev * (1 - k); out.push(prev);
    }
    return out;
  }
  function rsi(c, n = 14){
    const out = Array(c.length).fill(null); let ag = 0, al = 0;
    for(let i = 1; i < c.length; i++){
      const d = c[i] - c[i-1], g = Math.max(d, 0), lo = Math.max(-d, 0);
      if(i <= n){ ag += g / n; al += lo / n; if(i === n) out[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al); continue; }
      ag = (ag * (n - 1) + g) / n; al = (al * (n - 1) + lo) / n;
      out[i] = al === 0 ? 100 : 100 - 100 / (1 + ag / al);
    }
    return out;
  }
  function macd(c, f = 12, s = 26, g = 9){
    const ef = ema(c, f), es = ema(c, s);
    const m = c.map((_, i) => ef[i] === null || es[i] === null ? null : ef[i] - es[i]);
    const sig = ema(m, g);
    return { m, sig, hist: m.map((x, i) => x === null || sig[i] === null ? null : x - sig[i]) };
  }
  function bb(c, n = 20, k = 2){
    const mid = sma(c, n);
    const sd = c.map((_, i) => { if(i < n - 1) return null; const sl = c.slice(i - n + 1, i + 1), mu = mid[i];
      return Math.sqrt(sl.reduce((s, x) => s + (x - mu) ** 2, 0) / n); });
    return { mid, up: mid.map((m, i) => m === null ? null : m + k * sd[i]), lo: mid.map((m, i) => m === null ? null : m - k * sd[i]) };
  }
  function stoch(d, n = 14, sm = 3){
    const raw = d.c.map((_, i) => { if(i < n - 1) return null;
      const hh = Math.max(...d.h.slice(i - n + 1, i + 1)), ll = Math.min(...d.l.slice(i - n + 1, i + 1));
      return hh === ll ? 50 : (d.c[i] - ll) / (hh - ll) * 100; });
    const sma2 = (a, m) => a.map((_, i) => { const sl = a.slice(Math.max(0, i - m + 1), i + 1); return sl.length < m || sl.includes(null) ? null : sl.reduce((s, x) => s + x, 0) / m; });
    const k = sma2(raw, sm); return { k, d: sma2(k, sm) };
  }
  function atr(d, n = 14){
    const tr = d.c.map((_, i) => i === 0 ? d.h[0] - d.l[0] : Math.max(d.h[i] - d.l[i], Math.abs(d.h[i] - d.c[i-1]), Math.abs(d.l[i] - d.c[i-1])));
    const out = Array(tr.length).fill(null); let a = 0;
    for(let i = 0; i < tr.length; i++){ if(i < n){ a += tr[i] / n; if(i === n - 1) out[i] = a; continue; } a = (a * (n - 1) + tr[i]) / n; out[i] = a; }
    return out;
  }
  function vwap(d, from = 0){
    let pv = 0, vv = 0;
    return d.c.map((_, i) => { if(i < from) return null; const tp = (d.h[i] + d.l[i] + d.c[i]) / 3; pv += tp * d.v[i]; vv += d.v[i]; return pv / vv; });
  }
  function ichi(d){
    const mid = (i, n) => i < n - 1 ? null : (Math.max(...d.h.slice(i - n + 1, i + 1)) + Math.min(...d.l.slice(i - n + 1, i + 1))) / 2;
    const ten = d.c.map((_, i) => mid(i, 9)), kij = d.c.map((_, i) => mid(i, 26));
    const sa = Array(d.n).fill(null), sb = Array(d.n).fill(null);
    for(let i = 0; i < d.n; i++){ if(i + 26 < d.n){ if(ten[i] !== null && kij[i] !== null) sa[i + 26] = (ten[i] + kij[i]) / 2; const m = mid(i, 52); if(m !== null) sb[i + 26] = m; } }
    return { ten, kij, sa, sb };
  }
  function vprofile(d, a, b, bins = 24){
    const lo = Math.min(...d.l.slice(a, b + 1)), hi = Math.max(...d.h.slice(a, b + 1)), st = (hi - lo) / bins;
    const vol = Array(bins).fill(0);
    for(let i = a; i <= b; i++){
      const b0 = Math.max(0, Math.floor((d.l[i] - lo) / st)), b1 = Math.min(bins - 1, Math.floor((d.h[i] - lo) / st));
      for(let k = b0; k <= b1; k++) vol[k] += d.v[i] / (b1 - b0 + 1);
    }
    const poc = vol.indexOf(Math.max(...vol)), total = vol.reduce((s, x) => s + x, 0);
    let lo_i = poc, hi_i = poc, acc = vol[poc];
    while(acc < total * 0.7){
      const up = hi_i + 1 < bins ? vol[hi_i + 1] : -1, dn = lo_i - 1 >= 0 ? vol[lo_i - 1] : -1;
      if(up >= dn){ hi_i++; acc += up; } else { lo_i--; acc += dn; }
    }
    const P = k => lo + (k + 0.5) * st;
    return { vol, lo, hi, st, poc: P(poc), vah: lo + (hi_i + 1) * st, val: lo + lo_i * st };
  }

  // ── Renderer ──
  function render(sp){
    const d = gen(sp), n = d.n, show = sp.show || n, s0 = n - show;
    const pane = sp.pane || null;
    const mT = 12, mB = pane ? 92 : 136, pT = 104, pB = 142;
    const x0 = 10, xe = sp.xEnd || 204, dx = (xe - x0) / Math.max(show - 1, 1);
    const X = i => x0 + (i - s0) * dx;
    const bw = Math.max(1.5, Math.min(7, dx * 0.62));

    // compute indicators
    const ind = {};
    (sp.ov || []).forEach(o => {
      if(o.t === 'sma') ind['sma' + o.n] = sma(d.c, o.n);
      if(o.t === 'ema') ind['ema' + o.n] = ema(d.c, o.n);
      if(o.t === 'bb')  ind.bb = bb(d.c, o.n || 20, o.k || 2);
      if(o.t === 'vwap') ind.vwap = vwap(d, o.from || 0);
      if(o.t === 'ichi') ind.ichi = ichi(d);
      if(o.t === 'vp')  ind.vp = vprofile(d, o.from || s0, o.to || n - 1, o.bins || 24);
      if(o.t === 'pivots' || o.t === 'pdhl'){
        const Hh = Math.max(...d.h.slice(o.a, o.b + 1)), Ll = Math.min(...d.l.slice(o.a, o.b + 1)), Cc = d.c[o.b];
        const Pp = (Hh + Ll + Cc) / 3;
        ind[o.t] = { H:Hh, L:Ll, P:Pp, R1:2*Pp - Ll, S1:2*Pp - Hh, R2:Pp + (Hh - Ll), S2:Pp - (Hh - Ll) };
      }
    });
    if(pane){
      if(pane.t === 'rsi')  ind.rsi = rsi(d.c, pane.n || 14);
      if(pane.t === 'macd') ind.macd = macd(d.c);
      if(pane.t === 'stoch')ind.stoch = stoch(d);
      if(pane.t === 'atr')  ind.atr = atr(d, pane.n || 14);
    }

    // price range (visible window)
    const vis = [];
    for(let i = s0; i < n; i++){ vis.push(d.h[i], d.l[i]); }
    const addVis = arr => { for(let i = s0; i < n; i++) if(arr[i] !== null && arr[i] !== undefined) vis.push(arr[i]); };
    (sp.ov || []).forEach(o => {
      if((o.t === 'sma' || o.t === 'ema') && o.fit !== false) addVis(ind[o.t + o.n]);
      if(o.t === 'bb') { addVis(ind.bb.up); addVis(ind.bb.lo); }
      if(o.t === 'vwap') addVis(ind.vwap);
      if(o.t === 'ichi') { addVis(ind.ichi.sa); addVis(ind.ichi.sb); }
      if(o.t === 'level') vis.push(o.p);
      if(o.t === 'pivots'){ const pv = ind.pivots; (o.show || ['P','R1','S1']).forEach(k => vis.push(pv[k])); }
      if(o.t === 'pdhl'){ vis.push(ind.pdhl.H, ind.pdhl.L); }
    });
    (sp.fitExtra || []).forEach(p => vis.push(p));
    let pmin = Math.min(...vis), pmax = Math.max(...vis); const pad = (pmax - pmin) * 0.05; pmin -= pad; pmax += pad;
    const Y = p => mB - (p - pmin) / (pmax - pmin) * (mB - mT);

    // pane range
    let PY = () => 0, pmn = 0, pmx = 100;
    if(pane){
      let vals = [];
      if(pane.t === 'rsi' || pane.t === 'stoch'){ pmn = 0; pmx = 100; }
      else {
        if(pane.t === 'macd') for(let i = s0; i < n; i++) [ind.macd.m[i], ind.macd.sig[i], ind.macd.hist[i]].forEach(x => x !== null && vals.push(x));
        if(pane.t === 'atr')  for(let i = s0; i < n; i++) ind.atr[i] !== null && vals.push(ind.atr[i]);
        if(pane.t === 'vol')  for(let i = s0; i < n; i++) vals.push(d.v[i]);
        if(pane.t === 'bars') vals = pane.data.slice();
        if(pane.t === 'macd' || (pane.t === 'bars' && Math.min(...vals) < 0)){ const m = Math.max(...vals.map(Math.abs)) * 1.1; pmn = -m; pmx = m; }
        else if(pane.t === 'atr'){ pmn = Math.min(...vals) * 0.9; pmx = Math.max(...vals) * 1.1; }
        else { pmn = 0; pmx = Math.max(...vals) * 1.1; }
      }
      PY = v => pB - (v - pmn) / (pmx - pmn) * (pB - pT);
    }

    const ctx = { d, ind, X, Y, PY, s0, n, H:i => d.h[i], L:i => d.l[i], C:i => d.c[i] };
    const rightLabels = [];
    const rl = (y, t, c) => rightLabels.push({ y, t, c });
    let s = '';
    const poly = (arr, c, w = 1.4, dash = '', op = 0.95, yf = Y) => {
      const pts = []; for(let i = s0; i < n; i++) if(arr[i] !== null && arr[i] !== undefined) pts.push(`${f1(X(i))},${f1(yf(arr[i]))}`);
      return pts.length > 1 ? `<polyline points="${pts.join(' ')}" fill="none" stroke="${c}" stroke-width="${w}" ${dash ? `stroke-dasharray="${dash}"` : ''} opacity="${op}" stroke-linejoin="round"/>` : '';
    };
    const lastVal = arr => { for(let i = n - 1; i >= s0; i--) if(arr[i] !== null) return arr[i]; return null; };

    // pane frame
    if(pane){
      s += `<line x1="${x0 - 4}" y1="${pT - 5}" x2="${XR}" y2="${pT - 5}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
      s += T(x0 - 2, pT + 2, pane.l || pane.t.toUpperCase(), { a:'start', c:C.dim, s:6.5 });
    }

    // boxes (sessions / ranges) behind everything
    (sp.boxes || []).forEach(b => {
      const xa = X(b.i1) - dx / 2, xb = X(b.i2) + dx / 2, ya = Y(b.p2), yb = Y(b.p1);
      s += `<rect x="${f1(xa)}" y="${f1(Math.min(ya,yb))}" width="${f1(xb - xa)}" height="${f1(Math.abs(yb - ya))}" fill="${col(b.c)}" opacity="${b.op || 0.12}"/>`;
      if(b.border) s += `<rect x="${f1(xa)}" y="${f1(Math.min(ya,yb))}" width="${f1(xb - xa)}" height="${f1(Math.abs(yb - ya))}" fill="none" stroke="${col(b.c)}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.6"/>`;
      if(b.l) s += T((xa + xb) / 2, b.lt === 'below' ? Y(b.p1) + 9 : Math.min(ya,yb) - 3, b.l, { c:col(b.c), s:6.5 });
    });

    // overlays (behind candles)
    (sp.ov || []).forEach(o => {
      if(o.t === 'ichi'){
        const ic = ind.ichi; let up = [], dn = [];
        for(let i = s0; i < n - 1; i++){
          if(ic.sa[i] === null || ic.sb[i] === null || ic.sa[i+1] === null || ic.sb[i+1] === null) continue;
          const bull = ic.sa[i] >= ic.sb[i];
          s += `<polygon points="${f1(X(i))},${f1(Y(ic.sa[i]))} ${f1(X(i+1))},${f1(Y(ic.sa[i+1]))} ${f1(X(i+1))},${f1(Y(ic.sb[i+1]))} ${f1(X(i))},${f1(Y(ic.sb[i]))}" fill="${bull ? C.bull : C.bear}" opacity="0.16"/>`;
        }
        s += poly(ic.sa, C.bull, 0.8, '', 0.5) + poly(ic.sb, C.bear, 0.8, '', 0.5);
      }
      if(o.t === 'bb'){
        const b_ = ind.bb, pts = [];
        for(let i = s0; i < n; i++) if(b_.up[i] !== null) pts.push(`${f1(X(i))},${f1(Y(b_.up[i]))}`);
        for(let i = n - 1; i >= s0; i--) if(b_.lo[i] !== null) pts.push(`${f1(X(i))},${f1(Y(b_.lo[i]))}`);
        s += `<polygon points="${pts.join(' ')}" fill="${C.blue}" opacity="0.07"/>`;
      }
      if(o.t === 'vp'){
        const vp = ind.vp, mx = Math.max(...vp.vol), wmax = o.w || 46, xr = XR;
        vp.vol.forEach((vv, k) => {
          const pa = vp.lo + k * vp.st, pb = pa + vp.st, inVA = pa + vp.st / 2 >= vp.val && pa + vp.st / 2 <= vp.vah;
          const w = vv / mx * wmax;
          s += `<rect x="${f1(xr - w)}" y="${f1(Y(pb) + 0.3)}" width="${f1(w)}" height="${f1(Math.max(Y(pa) - Y(pb) - 0.6, 0.6))}" fill="${inVA ? C.blue : C.slate}" opacity="${inVA ? 0.32 : 0.18}"/>`;
        });
      }
      if(o.t === 'level'){
        const xa = o.i1 !== undefined ? X(o.i1) : x0 - 4;
        s += `<line x1="${f1(xa)}" y1="${f1(Y(o.p))}" x2="${XR}" y2="${f1(Y(o.p))}" stroke="${col(o.c)}" stroke-width="${o.w || 1.1}" stroke-dasharray="${o.dash || '5,3'}" opacity="0.85"/>`;
        if(o.l) rl(Y(o.p), o.l, col(o.c));
      }
      if(o.t === 'pivots' || o.t === 'pdhl'){
        const pv = ind[o.t], xa = X(o.from) - dx / 2;
        const keys = o.t === 'pivots' ? (o.show || ['R2','R1','P','S1','S2']) : ['H','L'];
        const cl = { R2:C.bear, R1:C.bear, P:C.silver, S1:C.bull, S2:C.bull, H:C.bear, L:C.bull };
        const nm = { H:'PDH', L:'PDL' };
        keys.forEach(k => {
          s += `<line x1="${f1(xa)}" y1="${f1(Y(pv[k]))}" x2="${XR}" y2="${f1(Y(pv[k]))}" stroke="${cl[k]}" stroke-width="1.1" stroke-dasharray="${k === 'P' ? '' : '5,3'}" opacity="0.8"/>`;
          rl(Y(pv[k]), nm[k] || k, cl[k]);
        });
        s += `<line x1="${f1(xa)}" y1="${mT - 4}" x2="${f1(xa)}" y2="${mB + 2}" stroke="rgba(255,255,255,0.18)" stroke-width="1" stroke-dasharray="2,3"/>`;
        s += T(xa - 3, mT + 3, o.prev || 'YESTERDAY', { a:'end', c:C.dim, s:6.5 }) + T(xa + 3, mT + 3, o.cur || 'TODAY', { a:'start', c:C.dim, s:6.5 });
      }
    });

    // candles
    for(let i = s0; i < n; i++){
      const up = d.c[i] >= d.o[i], cc = up ? C.bull : C.bear, x = X(i);
      const dim = sp.dimBefore !== undefined && i < sp.dimBefore ? 0.45 : 0.9;
      s += `<line x1="${f1(x)}" y1="${f1(Y(d.h[i]))}" x2="${f1(x)}" y2="${f1(Y(d.l[i]))}" stroke="${cc}" stroke-width="${bw > 3 ? 1.1 : 0.8}" opacity="${dim}"/>`;
      s += `<rect x="${f1(x - bw / 2)}" y="${f1(Y(Math.max(d.o[i], d.c[i])))}" width="${f1(bw)}" height="${f1(Math.max(Math.abs(Y(d.o[i]) - Y(d.c[i])), 0.9))}" fill="${cc}" opacity="${dim}"/>`;
    }

    // overlays (lines on top of candles)
    (sp.ov || []).forEach(o => {
      if(o.t === 'sma' || o.t === 'ema'){ const a = ind[o.t + o.n]; s += poly(a, col(o.c), o.w || 1.5); if(o.l) rl(Y(lastVal(a)), o.l, col(o.c)); }
      if(o.t === 'bb'){
        const b_ = ind.bb;
        s += poly(b_.up, C.blue, 1.1) + poly(b_.lo, C.blue, 1.1) + poly(b_.mid, C.slate, 1, '4,3');
        if(o.l !== false){ rl(Y(lastVal(b_.up)), 'UPPER', C.blue); rl(Y(lastVal(b_.mid)), 'MID 20', C.slate); rl(Y(lastVal(b_.lo)), 'LOWER', C.blue); }
      }
      if(o.t === 'vwap'){ s += poly(ind.vwap, col(o.c || 'amber'), 1.8); rl(Y(lastVal(ind.vwap)), o.l || 'VWAP', col(o.c || 'amber')); }
      if(o.t === 'ichi'){
        const ic = ind.ichi; s += poly(ic.ten, C.blue, 1.2) + poly(ic.kij, C.amber, 1.2);
        rl(Y(lastVal(ic.ten)), 'TENKAN', C.blue); rl(Y(lastVal(ic.kij)), 'KIJUN', C.amber);
      }
      if(o.t === 'vp'){
        const vp = ind.vp;
        [['poc','POC',C.amber,''],['vah','VAH',C.light,'4,3'],['val','VAL',C.light,'4,3']].forEach(([k,lab,cc,da]) => {
          s += `<line x1="${x0 - 4}" y1="${f1(Y(vp[k]))}" x2="${XR}" y2="${f1(Y(vp[k]))}" stroke="${cc}" stroke-width="${k === 'poc' ? 1.5 : 1}" ${da ? `stroke-dasharray="${da}"` : ''} opacity="0.9"/>`;
          rl(Y(vp[k]), lab, cc);
        });
      }
    });

    // sub-pane
    if(pane){
      if(pane.t === 'rsi' || pane.t === 'stoch'){
        const hi = pane.t === 'rsi' ? 70 : 80, lo = pane.t === 'rsi' ? 30 : 20;
        s += `<rect x="${x0 - 4}" y="${f1(PY(100))}" width="${XR - x0 + 4}" height="${f1(PY(hi) - PY(100))}" fill="${C.bear}" opacity="0.06"/>`;
        s += `<rect x="${x0 - 4}" y="${f1(PY(lo))}" width="${XR - x0 + 4}" height="${f1(PY(0) - PY(lo))}" fill="${C.bull}" opacity="0.06"/>`;
        [[hi, C.bear], [50, C.dim], [lo, C.bull]].forEach(([lv, cc]) => {
          s += `<line x1="${x0 - 4}" y1="${f1(PY(lv))}" x2="${XR}" y2="${f1(PY(lv))}" stroke="${cc}" stroke-width="0.8" stroke-dasharray="3,3" opacity="0.7"/>`;
          if(lv !== 50) s += T(XR + 3, PY(lv) + 2.5, lv, { a:'start', c:cc, s:6.5 });
        });
        if(pane.t === 'rsi') s += poly(ind.rsi, C.light, 1.4, '', 1, PY);
        else s += poly(ind.stoch.k, C.light, 1.3, '', 1, PY) + poly(ind.stoch.d, C.amber, 1.1, '', 1, PY);
      }
      if(pane.t === 'macd'){
        const mc = ind.macd, zw = Math.max(1, bw * 0.8);
        for(let i = s0; i < n; i++) if(mc.hist[i] !== null){
          const y0 = PY(0), y1 = PY(mc.hist[i]);
          s += `<rect x="${f1(X(i) - zw / 2)}" y="${f1(Math.min(y0, y1))}" width="${f1(zw)}" height="${f1(Math.max(Math.abs(y1 - y0), 0.5))}" fill="${mc.hist[i] >= 0 ? C.bull : C.bear}" opacity="0.5"/>`;
        }
        s += `<line x1="${x0 - 4}" y1="${f1(PY(0))}" x2="${XR}" y2="${f1(PY(0))}" stroke="${C.dim}" stroke-width="0.7"/>`;
        s += poly(mc.m, C.light, 1.4, '', 1, PY) + poly(mc.sig, C.amber, 1.2, '', 1, PY);
        s += T(XR + 3, PY(0) + 2.5, '0', { a:'start', c:C.dim, s:6.5 });
      }
      if(pane.t === 'atr'){ s += poly(ind.atr, C.light, 1.4, '', 1, PY); }
      if(pane.t === 'vol' || pane.t === 'bars'){
        const zw = Math.max(1, bw * 0.85);
        for(let i = s0; i < n; i++){
          const val = pane.t === 'vol' ? d.v[i] : pane.data[i - s0];
          const cc = pane.t === 'vol' ? (d.c[i] >= d.o[i] ? C.bull : C.bear) : (val >= 0 ? (pane.cPos || C.blue) : (pane.cNeg || C.bear));
          const y0 = PY(Math.max(pmn, 0) === pmn ? pmn : 0), y1 = PY(val);
          const base = pmn < 0 ? PY(0) : pB;
          s += `<rect x="${f1(X(i) - zw / 2)}" y="${f1(Math.min(base, y1))}" width="${f1(zw)}" height="${f1(Math.max(Math.abs(base - y1), 0.5))}" fill="${cc}" opacity="${(pane.hl || []).includes(i) ? 0.95 : 0.45}"/>`;
        }
        if(pmn < 0) s += `<line x1="${x0 - 4}" y1="${f1(PY(0))}" x2="${XR}" y2="${f1(PY(0))}" stroke="${C.dim}" stroke-width="0.7"/>`;
        if(pane.avg){ const av = d.v.slice(s0).reduce((a, b) => a + b, 0) / show;
          s += `<line x1="${x0 - 4}" y1="${f1(PY(av))}" x2="${XR}" y2="${f1(PY(av))}" stroke="${C.amber}" stroke-width="0.9" stroke-dasharray="3,3"/>` + T(XR + 3, PY(av) + 2.5, 'AVG', { a:'start', c:C.amber, s:6.5 }); }
      }
    }

    // annotations
    const marks = typeof sp.marks === 'function' ? sp.marks(ctx) : (sp.marks || []);
    marks.forEach(m => {
      const yf = m.pane ? PY : Y, cc = col(m.c || 'white');
      if(m.t === 'dot') s += `<circle cx="${f1(X(m.i))}" cy="${f1(yf(m.p))}" r="${m.r || 3.2}" fill="${cc}" stroke="#080808" stroke-width="1.2"/>`;
      if(m.t === 'ring') s += `<circle cx="${f1(X(m.i))}" cy="${f1(yf(m.p))}" r="${m.r || 5}" fill="none" stroke="${cc}" stroke-width="1.3"/>`;
      if(m.t === 'line') s += `<line x1="${f1(X(m.a[0]))}" y1="${f1(yf(m.a[1]))}" x2="${f1(X(m.b[0]))}" y2="${f1(yf(m.b[1]))}" stroke="${cc}" stroke-width="${m.w || 1.5}" ${m.dash ? `stroke-dasharray="${m.dash}"` : ''}/>`;
      if(m.t === 'hline'){
        const xa = m.i1 !== undefined ? X(m.i1) : x0 - 4, xb = m.i2 !== undefined ? X(m.i2) : XR;
        s += `<line x1="${f1(xa)}" y1="${f1(yf(m.p))}" x2="${f1(xb)}" y2="${f1(yf(m.p))}" stroke="${cc}" stroke-width="${m.w || 1.2}" stroke-dasharray="${m.dash || '5,3'}"/>`;
        if(m.l){ if(m.lr === false) s += T((xa + xb) / 2, yf(m.p) - 3, m.l, { c:cc }); else rl(yf(m.p), m.l, cc); }
      }
      if(m.t === 'vline') { s += `<line x1="${f1(X(m.i))}" y1="${mT - 4}" x2="${f1(X(m.i))}" y2="${pane ? pB : mB + 2}" stroke="${cc}" stroke-width="1" stroke-dasharray="2,3" opacity="0.7"/>`; if(m.l) s += T(X(m.i) + (m.a === 'end' ? -3 : 3), mT + 3, m.l, { a:m.a || 'start', c:cc, s:6.5 }); }
      if(m.t === 'text') s += T(m.x !== undefined ? m.x : X(m.i), m.y !== undefined ? m.y : yf(m.p), m.s, { a:m.a || 'middle', c:cc, s:m.size || 7 });
      if(m.t === 'arrow'){
        const pts = m.pts.map(([i, p]) => [X(i), yf(p)]);
        s += `<polyline points="${pts.map(q => q.map(f1).join(',')).join(' ')}" fill="none" stroke="${cc}" stroke-width="1.8" stroke-dasharray="${m.dash || '4,3'}"/>`;
        const a = pts[pts.length - 2], b = pts[pts.length - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]), L = 7, w = 4, co = Math.cos(ang), si = Math.sin(ang);
        s += `<polygon points="${f1(b[0])},${f1(b[1])} ${f1(b[0] - L * co + w * si)},${f1(b[1] - L * si - w * co)} ${f1(b[0] - L * co - w * si)},${f1(b[1] - L * si + w * co)}" fill="${cc}"/>`;
      }
      if(m.t === 'x'){ const x = X(m.i), y = yf(m.p); s += `<line x1="${f1(x-4)}" y1="${f1(y-4)}" x2="${f1(x+4)}" y2="${f1(y+4)}" stroke="${cc}" stroke-width="2"/><line x1="${f1(x-4)}" y1="${f1(y+4)}" x2="${f1(x+4)}" y2="${f1(y-4)}" stroke="${cc}" stroke-width="2"/>`; }
    });

    // right-hand labels with collision avoidance
    rightLabels.sort((a, b) => a.y - b.y);
    for(let k = 1; k < rightLabels.length; k++) if(rightLabels[k].y - rightLabels[k-1].y < 8) rightLabels[k].y = rightLabels[k-1].y + 8;
    const over = rightLabels.length ? rightLabels[rightLabels.length - 1].y - (pane ? 98 : 144) : 0;
    if(over > 0) rightLabels.forEach(r => r.y -= over);
    rightLabels.forEach(r => { s += T(XR + 3, r.y + 2.5, r.t, { a:'start', c:r.c, s:6.5 }); });

    return `<svg width="100%" viewBox="0 0 ${W} ${H}" style="max-width:320px;display:block;" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
  }

  // ── Card + tab helpers ──
  function card(p, cat, groups){
    const g = groups.find(x => x[0] === p.g) || groups[0];
    const bc = p.bias === 'bull' ? 'var(--bull)' : p.bias === 'bear' ? 'var(--bear)' : 'var(--blue)';
    return `
      <div class="ex-card" data-id="${cat}-${p.id}" data-cat="${cat} ${cat}-${p.g}" style="display:none;">
        <div class="ex-card-header">
          <div class="ex-card-icon">${p.icon}</div>
          <div class="ex-card-title">${p.name}</div>
          <span class="ex-card-tag" style="background:${g[2]}1F;color:${g[2]};border:1px solid ${g[2]}55;">${g[1]}</span>
        </div>
        <div class="ex-card-body">
          <div class="ex-card-desc">${p.desc}</div>
          <div class="ex-diagram">
            <div class="ex-diagram-item" style="width:100%;">
              ${p.svg || render(p.chart)}
              <div class="ex-diagram-label" style="color:${bc};">${p.tag}</div>
            </div>
          </div>
          <div class="ex-rule"><div class="ex-rule-icon">🎯</div><div class="ex-rule-text"><strong>How to trade it:</strong> ${p.how}</div></div>
          ${p.tip ? `<div class="ex-rule"><div class="ex-rule-icon">💡</div><div class="ex-rule-text">${p.tip}</div></div>` : ''}
        </div>
      </div>`;
  }

  // Mount a library: cards into the grid + its sub-filter buttons
  function mount(cat, label, groups, items){
    const grid = document.getElementById('examples-grid');
    if(grid) grid.insertAdjacentHTML('beforeend', items.map(p => card(p, cat, groups)).join(''));
    const sub = document.getElementById(cat + '-subfilter');
    if(sub){
      sub.innerHTML = `<span class="pattern-subfilter-label">${items.length} ${label}</span>` +
        groups.map(([k, lab], i) => {
          const n = k === 'all' ? items.length : items.filter(p => p.g === k).length;
          return `<button class="pat-filter ${cat}-filter${i === 0 ? ' on' : ''}" onclick="BMX.filter('${cat}','${k}',this)">${lab}<span>${n}</span></button>`;
        }).join('');
    }
  }
  function filter(cat, group, btn){
    document.querySelectorAll('.' + cat + '-filter').forEach(b => b.classList.remove('on'));
    if(btn) btn.classList.add('on');
    document.querySelectorAll('.ex-card').forEach(card => {
      const cats = (card.dataset.cat || '').split(' ');
      card.style.display = cats.includes(cat) && (group === 'all' || cats.includes(cat + '-' + group)) ? 'block' : 'none';
    });
  }

  return { W, H, XR, C, col, T, rng, gen, sma, ema, rsi, macd, bb, stoch, atr, vwap, ichi, vprofile, render, card, mount, filter };
})();
