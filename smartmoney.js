// ══════════════════════════════════════════════════════
// EXAMPLES → SMART MONEY (Order Blocks & Fair Value Gaps)
// Candle-based diagrams (same card style as Patterns / Fibonacci)
// ══════════════════════════════════════════════════════
(function(){
  const W = 260, H = 150, X2 = 212;
  const C = { bull:'#22D67A', bear:'#FF5C5C', blue:'#2A8FE3', light:'#96D0FF', silver:'#E4E8EE', slate:'#8AA4BF' };
  const GROUPS = [
    ['all','All Smart Money','#2A8FE3'],
    ['ob','Order Blocks','#22D67A'],
    ['fvg','Fair Value Gaps','#96D0FF'],
    ['liq','Structure & Liquidity','#F5B841'],
    ['combo','Pro Setups','#E4E8EE']
  ];
  const col = c => C[c] || c;
  const T = (x,y,t,o={}) => `<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" font-family="'DM Mono',monospace" font-size="${o.s||7}" font-weight="bold" fill="${o.c||'rgba(255,255,255,0.82)'}" opacity="${o.o||1}">${t}</text>`;

  // Build candles from a sequence of body moves (negative = up)
  function build(p){
    let cur = p.y0;
    const cs = p.seq.map((it, i) => {
      const d  = typeof it === 'number' ? it : it.d;
      const wt = (it.wt !== undefined) ? it.wt : 1.5 + (i % 3) * 0.8;
      const wb = (it.wb !== undefined) ? it.wb : 1.5 + ((i + 2) % 3) * 0.8;
      const o = cur, c = cur + d;
      cur = c;
      return { o, c, h: Math.min(o,c) - wt, l: Math.max(o,c) + wb };
    });
    return p.flip ? cs.map(k => ({ o:H-k.o, c:H-k.c, h:H-k.l, l:H-k.h })) : cs;
  }

  function arrow(a, b, c){
    const ang = Math.atan2(b[1]-a[1], b[0]-a[0]), L = 8, w = 4.5;
    const co = Math.cos(ang), s = Math.sin(ang);
    return `<polygon points="${b[0]},${b[1]} ${(b[0]-L*co+w*s).toFixed(1)},${(b[1]-L*s-w*co).toFixed(1)} ${(b[0]-L*co-w*s).toFixed(1)},${(b[1]-L*s+w*co).toFixed(1)}" fill="${c}"/>`;
  }

  function svg(p){
    const raw = build(p);
    const mn = Math.min(...raw.map(k => k.h)), mx = Math.max(...raw.map(k => k.l));
    const top = p.fitTop || 22, bot = p.fitBot || 126, kf = (bot - top) / (mx - mn);
    const tf = v => +(top + (v - mn) * kf).toFixed(1);
    const cs = raw.map(k => ({ o:tf(k.o), c:tf(k.c), h:tf(k.h), l:tf(k.l) }));
    const n = cs.length, x0 = p.x0 || 14;
    const dx = ((p.xEnd || 200) - x0) / (n - 1);
    const bw = Math.min(10, dx * 0.58);
    const X = i => +(x0 + i * dx).toFixed(1);
    const Y = v => Array.isArray(v) ? +(cs[v[0]][v[1]]).toFixed(1) : tf(v);
    const isBull = k => k.c < k.o;

    let s = `<svg width="100%" viewBox="0 0 ${W} ${H}" style="max-width:320px;display:block;" xmlns="http://www.w3.org/2000/svg">`;

    // Premium / discount bands
    (p.bands || []).forEach(b => {
      if(b.i2 !== undefined){
        // session / time box spanning candles i..i2
        const seg = cs.slice(b.i, b.i2 + 1);
        const ya = Math.min(...seg.map(k => k.h)), yb = Math.max(...seg.map(k => k.l));
        const xa = X(b.i) - dx / 2, xb = X(b.i2) + dx / 2;
        s += `<rect x="${xa.toFixed(1)}" y="${ya.toFixed(1)}" width="${(xb - xa).toFixed(1)}" height="${(yb - ya).toFixed(1)}" fill="${col(b.c)}" opacity="0.12"/>`;
        s += `<rect x="${xa.toFixed(1)}" y="${ya.toFixed(1)}" width="${(xb - xa).toFixed(1)}" height="${(yb - ya).toFixed(1)}" fill="none" stroke="${col(b.c)}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.7"/>`;
        if(b.ext){
          [ya, yb].forEach(y => { s += `<line x1="${xb.toFixed(1)}" y1="${y.toFixed(1)}" x2="${X2}" y2="${y.toFixed(1)}" stroke="${col(b.c)}" stroke-width="0.8" stroke-dasharray="2,3" opacity="0.6"/>`; });
          s += T(X2 + 3, ya + 2.5, b.ext[0], {a:'start', c:col(b.c)}) + T(X2 + 3, yb + 2.5, b.ext[1], {a:'start', c:col(b.c)});
        }
        if(b.l) s += T((xa + xb) / 2, ya - 4, b.l, {c:col(b.c)});
        return;
      }
      const y1 = tf(b.y1), y2 = tf(b.y2);
      s += `<rect x="${X(b.i)}" y="${Math.min(y1,y2)}" width="${X2 - X(b.i)}" height="${Math.abs(y2-y1)}" fill="${col(b.c)}" opacity="0.08"/>`;
      if(b.l) s += T(X2 + 3, Math.min(y1,y2) + (b.top ? 9 : Math.abs(y2-y1) - 4), b.l, {a:'start', c:col(b.c), o:0.8});
    });

    // Zones: order blocks (whole candle range) and FVGs (gap between candle 1 & 3)
    (p.zones || []).forEach(z => {
      let y1, y2, xs;
      if(z.t === 'range'){
        const seg = cs.slice(z.i, z.i2 + 1);
        y1 = Math.min(...seg.map(k => k.h)); y2 = Math.max(...seg.map(k => k.l)); xs = X(z.i) - bw/2 - 1;
      } else if(z.t === 'fvg'){
        const a = cs[z.i-1], b = cs[z.i+1];
        if(isBull(cs[z.i])){ y1 = b.l; y2 = a.h; } else { y1 = a.l; y2 = b.h; }
        xs = X(z.i-1) - bw/2;
      } else {
        y1 = cs[z.i].h; y2 = cs[z.i].l; xs = X(z.i) - bw/2 - 1;
      }
      const top = Math.min(y1,y2), ht = Math.abs(y2-y1), xe = z.to !== undefined ? X(z.to) : X2;
      const zc = col(z.c);
      s += `<rect x="${xs}" y="${top}" width="${xe - xs}" height="${ht}" fill="${zc}" opacity="0.16"/>`;
      s += `<rect x="${xs}" y="${top}" width="${xe - xs}" height="${ht}" fill="none" stroke="${zc}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.65"/>`;
      if(z.ce){
        const m = +(top + ht/2).toFixed(1);
        s += `<line x1="${xs}" y1="${m}" x2="${xe}" y2="${m}" stroke="${zc}" stroke-width="1.2" stroke-dasharray="2,2"/>`;
        s += T(xe + 3, m + 2.5, 'CE 50%', {a:'start', c:zc});
      }
      if(z.l) s += T(xe - 3, top + ht/2 + 2.5, z.l, {a:'end', c:zc});
    });

    // Lines (BOS, SL, TP, entry, liquidity)
    (p.lines || []).forEach(l => {
      const y  = Y(l.y);
      const xa = l.i1 !== undefined ? X(l.i1) : (l.x1 || x0);
      const xb = l.i2 !== undefined ? X(l.i2) : (l.x2 || X2);
      const lc = col(l.c);
      s += `<line x1="${xa}" y1="${y}" x2="${xb}" y2="${y}" stroke="${lc}" stroke-width="${l.w||1.2}" stroke-dasharray="${l.dash||'5,3'}" opacity="0.9"/>`;
      if(l.l){
        if(l.la === 'm') s += T((xa+xb)/2, y + (p.flip ? 9 : -3), l.l, {c:lc});
        else if(l.la === 'b') s += T((xa+xb)/2, y + (p.flip ? -3 : 9), l.l, {c:lc});
        else s += T(xb + 3, y + 2.5, l.l, {a:'start', c:lc});
      }
    });

    // Candles
    cs.forEach((k, i) => {
      const cc = isBull(k) ? C.bull : C.bear;
      const hl = (p.hl || []).includes(i);
      s += `<line x1="${X(i)}" y1="${k.h.toFixed(1)}" x2="${X(i)}" y2="${k.l.toFixed(1)}" stroke="${cc}" stroke-width="1.2" opacity="${hl?1:0.85}"/>`;
      s += `<rect x="${(X(i)-bw/2).toFixed(1)}" y="${Math.min(k.o,k.c).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(Math.abs(k.o-k.c),1.5).toFixed(1)}" fill="${cc}" opacity="${hl?1:0.85}" rx="0.8" ${hl?'stroke="#fff" stroke-width="1"':''}/>`;
    });

    // Projected move
    if(p.arrow){
      const pts = p.arrow.map(a => [typeof a[0]==='string' ? X(+a[0].slice(1)) : a[0], tf(a[1])]);
      const ac = col(p.bias);
      s += `<polyline points="${pts.map(q=>q.join(',')).join(' ')}" fill="none" stroke="${ac}" stroke-width="2" stroke-dasharray="4,3"/>`;
      s += arrow(pts[pts.length-2], pts[pts.length-1], ac);
    }
    if(p.dot){
      const dc = col(p.bias);
      s += `<circle cx="${X(p.dot[0])}" cy="${Y(p.dot[1])}" r="3.5" fill="${dc}" stroke="#080808" stroke-width="1.2"/>`;
    }
    (p.marks || []).forEach(([i, yv]) => {
      const x = X(i), y = Y(yv);
      s += `<line x1="${x-4}" y1="${y-4}" x2="${x+4}" y2="${y+4}" stroke="${C.bear}" stroke-width="2"/><line x1="${x-4}" y1="${y+4}" x2="${x+4}" y2="${y-4}" stroke="${C.bear}" stroke-width="2"/>`;
    });

    // Labels: ['@', candleIndex, 'above'|'below', text, colour]  or  [x, y, text, anchor, colour]
    (p.labels || []).forEach(l => {
      if(l[0] === '@'){
        const k = cs[l[1]];
        let pos = l[2];
        if(p.flip) pos = pos === 'above' ? 'below' : 'above';
        const y = pos === 'above' ? k.h - 5 : k.l + 10;
        s += T(X(l[1]), y.toFixed(1), l[3], {c: l[4] ? col(l[4]) : undefined, s:7.5});
      } else {
        s += T(l[0], tf(l[1]), l[2], {a:l[3]||'middle', c: l[4] ? col(l[4]) : undefined, s:7.5});
      }
    });
    return s + `</svg>`;
  }

  // Mirror a bullish setup into its bearish twin
  function mir(base, o){
    const fy = v => Array.isArray(v) ? [v[0], v[1]==='h' ? 'l' : 'h'] : H - v;
    const m = Object.assign({}, base, {
      flip: !base.flip,
      bias: base.bias === 'bull' ? 'bear' : 'bull',
      lines:  (base.lines || []).map(l => Object.assign({}, l, { y: fy(l.y) })),
      zones:  (base.zones || []).map(z => Object.assign({}, z, { c: z.c==='bull' ? 'bear' : z.c==='bear' ? 'bull' : z.c })),
      bands:  (base.bands || []).map(b => Object.assign({}, b, { y1:H-b.y1, y2:H-b.y2, top:!b.top })),
      dot:    base.dot ? [base.dot[0], fy(base.dot[1])] : null,
      arrow:  base.arrow ? base.arrow.map(a => [a[0], H - a[1]]) : null,
      labels: (base.labels || []).map(l => l[0]==='@' ? l : [l[0], H - l[1] + 5, l[2], l[3], l[4]])
    });
    return Object.assign(m, o);
  }

  function card(p){
    const g = GROUPS.find(x => x[0] === p.g) || GROUPS[0];
    const bc = p.bias==='bull' ? 'var(--bull)' : p.bias==='bear' ? 'var(--bear)' : 'var(--blue)';
    return `
      <div class="ex-card" data-id="smc-${p.id}" data-cat="smc smc-${p.g}" style="display:none;">
        <div class="ex-card-header">
          <div class="ex-card-icon">${p.icon}</div>
          <div class="ex-card-title">${p.name}</div>
          <span class="ex-card-tag" style="background:${g[2]}1F;color:${g[2]};border:1px solid ${g[2]}55;">${g[1]}</span>
        </div>
        <div class="ex-card-body">
          <div class="ex-card-desc">${p.desc}</div>
          <div class="ex-diagram">
            <div class="ex-diagram-item" style="width:100%;">
              ${svg(p)}
              <div class="ex-diagram-label" style="color:${bc};">${p.tag}</div>
            </div>
          </div>
          <div class="ex-rule"><div class="ex-rule-icon">🎯</div><div class="ex-rule-text"><strong>How to trade it:</strong> ${p.how}</div></div>
          ${p.tip ? `<div class="ex-rule"><div class="ex-rule-icon">💡</div><div class="ex-rule-text">${p.tip}</div></div>` : ''}
        </div>
      </div>`;
  }

  // ── Candle sequences ──
  const SEQ_A = { y0:50, seq:[8,6,-5,9,8,7,-12,-16,-14,4,10,12,{d:6,wb:4},-14,-16,-14,-10] };       // OB at 5, FVG at 7, retest 12
  const SEQ_B = { y0:40, seq:[10,7,-6,10,9,{d:8,wb:3},-15,-17,-13,3,9,11,{d:8,wb:3},-12,-15,-12] };  // OB at 5, retest 12
  const SEQ_F = { y0:120, seq:[-4,-5,{d:-34},-7,-6,3,6,{d:8,wb:3},-6,-12,-10,-8] };                  // FVG at 2, retest 7

  const OB_BULL = Object.assign({}, SEQ_B, {
    id:'ob-bull', name:'Bullish Order Block — How to Trade', icon:'🟩', g:'ob', bias:'bull',
    desc:`A <strong>bullish order block</strong> is the <strong>last bearish candle before a strong move up</strong> that breaks structure. Institutions placed buy orders there — when price comes back, those orders get filled again and price bounces.`,
    how:`Wait for price to return into the OB. Buy at the top of the OB (or on a bullish reaction candle inside it). SL a few pips below the OB low. TP1 = the high that was just made, TP2 = next liquidity above.`,
    tip:`The first return to an OB is the strongest. Every extra touch uses up more of the orders sitting there.`,
    tag:'▲ BUY THE RETURN TO THE OB',
    hl:[5], zones:[{ t:'ob', i:5, c:'bull', l:'BULLISH OB' }],
    lines:[{ y:[2,'h'], i1:2, i2:7, c:'silver', l:'BOS', la:'m' },
           { y:[8,'h'], i1:8, c:'bull', l:'TP1', dash:'2,3' },
           { y:87, i1:12, c:'bear', l:'SL' }],
    dot:[12, [5,'h']]
  });

  const SMC = [
    // ───────── ORDER BLOCKS ─────────
    Object.assign({}, SEQ_A, {
      id:'ob-what', name:'What Is an Order Block?', icon:'🏦', g:'ob', bias:'bull',
      desc:`Banks and institutions trade size that's too big to fill in one go. The <strong>order block (OB)</strong> is the <strong>last opposite candle before a big impulsive move</strong> — it marks where they loaded their orders. Price often returns to that zone later to "fill the rest".`,
      how:`Mark the OB candle's full range (high to low). Don't chase the impulse — wait for price to come back to the OB, then look for your entry.`,
      tip:`Think of it as smart money's footprint. No impulse and no break of structure = no order block, just a normal candle.`,
      tag:'▲ LAST DOWN CANDLE BEFORE THE IMPULSE',
      hl:[5], zones:[{ t:'ob', i:5, c:'bull', l:'ORDER BLOCK' }],
      lines:[{ y:[2,'h'], i1:2, i2:8, c:'silver', l:'BOS', la:'m' }],
      dot:[12, [5,'h']],
      labels:[['@',8,'above','IMPULSE','bull']]
    }),

    Object.assign({}, SEQ_A, {
      id:'ob-find', name:'How to Find a Valid Order Block', icon:'🔍', g:'ob', bias:'bull',
      desc:`A real OB needs <strong>3 things</strong>: ① it's the <strong>last opposite candle</strong> before the move, ② the move <strong>breaks structure</strong> (closes past the last swing high/low), and ③ the move is so fast it leaves a <strong>fair value gap</strong> behind it.`,
      how:`Scan for a strong impulse that broke structure → go back to the last opposite candle before it → check there's an FVG in the impulse. All 3 = valid OB. Missing one = skip it.`,
      tip:`The bigger and faster the impulse away from the OB, the stronger the OB. Slow, grinding moves don't create good OBs.`,
      tag:'▲ ① LAST CANDLE · ② BOS · ③ FVG',
      hl:[5], zones:[{ t:'ob', i:5, c:'bull', l:'OB' }, { t:'fvg', i:7, c:'light', l:'③ FVG', to:11 }],
      lines:[{ y:[2,'h'], i1:2, i2:8, c:'silver', l:'② BOS', la:'m' }],
      labels:[['@',5,'below','① LAST DOWN','bull']]
    }),

    OB_BULL,

    mir(OB_BULL, {
      id:'ob-bear', name:'Bearish Order Block — How to Trade', icon:'🟥', g:'ob',
      desc:`A <strong>bearish order block</strong> is the <strong>last bullish candle before a strong move down</strong> that breaks structure. That's where institutions sold — when price rallies back into it, they sell again.`,
      how:`Wait for price to rally back into the OB. Sell at the bottom of the OB (or on a bearish reaction candle inside it). SL a few pips above the OB high. TP1 = the low that was just made, TP2 = next liquidity below.`,
      tip:`Bearish OBs in a downtrend (on the higher timeframe) are far more reliable than ones fighting the trend.`,
      tag:'▼ SELL THE RETURN TO THE OB',
      zones:[{ t:'ob', i:5, c:'bear', l:'BEARISH OB' }]
    }),

    { id:'ob-invalid', name:'When an Order Block Fails', icon:'❌', g:'ob', bias:'bear',
      y0:45, seq:[8,7,-5,9,8,7,-14,-16,-12,5,10,12,10,12,8,6,10],
      desc:`An OB is only valid until a candle <strong>closes through it</strong>. Once price closes below a bullish OB (or above a bearish OB), the orders are gone — the zone is <strong>invalid</strong> and the buy idea is dead.`,
      how:`If a candle body closes beyond the OB, exit or don't enter. Don't move your stop "just a bit lower". A broken OB often turns into a <strong>breaker block</strong> (next card).`,
      tip:`Wicks through the OB are fine (often a liquidity grab). It's the candle <strong>close</strong> that matters.`,
      tag:'✕ CANDLE CLOSES THROUGH THE OB = INVALID',
      hl:[5], zones:[{ t:'ob', i:5, c:'bull', l:'OB' }],
      lines:[{ y:[2,'h'], i1:2, i2:7, c:'silver', l:'BOS', la:'m' }],
      marks:[[13, 86]] },

    { id:'breaker', name:'Breaker Block', icon:'🔨', g:'ob', bias:'bear',
      y0:70, seq:[6,6,-14,-14,-8,6,12,14,14,12,-6,-10,{d:-10,wt:3},12,14,14,10],
      desc:`A <strong>breaker</strong> is a <strong>failed order block that flips sides</strong>. A bullish OB gets smashed through — now the traders who bought there are trapped. When price rallies back up into it, they exit at breakeven, and that selling pushes price back down.`,
      how:`After a bullish OB breaks, wait for price to retrace back up into it. Sell the rejection inside the zone. SL above the breaker. Target the next low.`,
      tip:`Breakers work best when the break of the OB also broke market structure (a lower low was made).`,
      tag:'▼ FAILED BULLISH OB → SELL THE RETEST',
      hl:[1], zones:[{ t:'ob', i:1, c:'bear', l:'BREAKER' }],
      lines:[{ y:69.7, i1:12, c:'bear', l:'SL' }],
      dot:[13, 79],
      labels:[['@',1,'below','BULL OB','bull']] },

    // ───────── FAIR VALUE GAPS ─────────
    { id:'fvg-what', name:'What Is a Fair Value Gap?', icon:'🕳️', g:'fvg', bias:'bull',
      y0:118, seq:[-5,{d:-5,wt:3},{d:-40,wt:2,wb:2},{d:-8,wb:3},4,-6,3,-5],
      desc:`A <strong>fair value gap (FVG)</strong> is a 3-candle pattern where price moved so fast that the wicks of <strong>candle ① and candle ③ don't overlap</strong>. That empty space is an imbalance — only one side traded there, so price often comes back to "fill" it.`,
      how:`Find a big impulsive candle ②. Mark from candle ①'s high to candle ③'s low (bullish FVG). That box is your zone — expect price to return into it before continuing.`,
      tip:`Also called an <strong>imbalance</strong> or <strong>inefficiency</strong>. It's the same thing — the gap left when buyers or sellers completely overpowered the other side.`,
      tag:'▲ GAP BETWEEN CANDLE ① HIGH & CANDLE ③ LOW',
      hl:[1,2,3], zones:[{ t:'fvg', i:2, c:'light', l:'FAIR VALUE GAP' }],
      labels:[['@',1,'below','①','silver'],['@',2,'below','②','silver'],['@',3,'above','③','silver']] },

    Object.assign({}, SEQ_F, {
      id:'fvg-bull', name:'Bullish FVG — How to Trade', icon:'📗', g:'fvg', bias:'bull',
      desc:`After a strong bullish move leaves an FVG, price usually <strong>pulls back into the gap</strong> to rebalance, then continues higher. The gap acts like support.`,
      how:`Set a buy limit at the top of the FVG, or wait for price to enter it and show a bullish reaction. SL below candle ①'s low. TP = the recent high.`,
      tip:`Only trade FVGs in the direction of the higher-timeframe trend. A bullish FVG in a downtrend usually gets run straight through.`,
      tag:'▲ BUY THE PULLBACK INTO THE GAP',
      zones:[{ t:'fvg', i:2, c:'bull', l:'BULLISH FVG' }],
      lines:[{ y:121, i1:1, c:'bear', l:'SL' },{ y:[4,'h'], i1:4, c:'bull', l:'TP', dash:'2,3' }],
      dot:[7, [3,'l']]
    }),

    mir(Object.assign({}, SEQ_F, {
      zones:[{ t:'fvg', i:2, c:'bull', l:'BEARISH FVG' }],
      lines:[{ y:121, i1:1, c:'bear', l:'SL' },{ y:[4,'h'], i1:4, c:'bull', l:'TP', dash:'2,3' }],
      dot:[7, [3,'l']], bias:'bull'
    }), {
      id:'fvg-bear', name:'Bearish FVG — How to Trade', icon:'📕', g:'fvg',
      desc:`The mirror image. A strong bearish move leaves a gap above price. When price <strong>rallies back into the gap</strong>, sellers step in again and push it lower. The gap acts like resistance.`,
      how:`Set a sell limit at the bottom of the FVG, or wait for a bearish reaction inside it. SL above candle ①'s high. TP = the recent low.`,
      tip:`If price closes fully through the gap instead of rejecting it, the FVG has failed — see "Inversion FVG".`,
      tag:'▼ SELL THE RALLY INTO THE GAP',
      lines:[{ y:H-121, i1:1, c:'bear', l:'SL' },{ y:[4,'l'], i1:4, c:'bull', l:'TP', dash:'2,3' }]
    }),

    { id:'fvg-ce', name:'Consequent Encroachment (CE)', icon:'🎯', g:'fvg', bias:'bull',
      y0:120, seq:[-4,-5,{d:-34},-7,-6,3,6,{d:12,wb:12},-7,-12,-10,-8],
      desc:`<strong>Consequent encroachment</strong> is just the <strong>50% midpoint of the FVG</strong>. Price often doesn't fill the whole gap — it taps the middle and reacts. Many traders use CE as their precise entry.`,
      how:`Draw the FVG, add a line at 50%. Buy limit at the CE line. SL below candle ①'s low. If price closes below CE, expect a full fill of the gap first.`,
      tip:`Same idea as the 50% Fib level — a halfway point everyone is watching.`,
      tag:'▲ BUY AT THE 50% OF THE GAP',
      zones:[{ t:'fvg', i:2, c:'bull', ce:true }],
      lines:[{ y:121, i1:1, c:'bear', l:'SL' }],
      dot:[7, 94.4] },

    { id:'ifvg', name:'Inversion FVG (IFVG)', icon:'🔄', g:'fvg', bias:'bull',
      y0:40, seq:[5,6,{d:30},6,5,-4,-10,{d:-22},-8,{d:4,wb:3},-8,-10,-9],
      desc:`When price <strong>closes straight through an FVG</strong> instead of respecting it, the gap <strong>flips roles</strong>. A broken bearish FVG becomes <strong>support</strong>; a broken bullish FVG becomes <strong>resistance</strong>.`,
      how:`Wait for a candle to close fully through the FVG. Then wait for price to come back to it from the other side and buy (or sell) the retest. SL on the far side of the gap.`,
      tip:`IFVGs are powerful after a change of character (CHoCH) — they show the old side has completely lost control.`,
      tag:'▲ BEARISH FVG BROKEN → NOW SUPPORT',
      zones:[{ t:'fvg', i:2, c:'bull', l:'IFVG' }],
      dot:[9, 52.5],
      labels:[['@',2,'above','BEAR FVG','bear']] },

    // ───────── STRUCTURE & LIQUIDITY ─────────
    { id:'bos', name:'Break of Structure (BOS)', icon:'📶', g:'liq', bias:'bull',
      y0:120, seq:[-10,-8,6,5,-12,-10,-6,7,6,-12,-11,-8,6,5,-14,-10],
      desc:`In an uptrend, price makes <strong>higher highs (HH)</strong> and <strong>higher lows (HL)</strong>. Every time a candle <strong>closes above the last high</strong>, that's a <strong>break of structure (BOS)</strong> — confirmation the trend is continuing.`,
      how:`After each BOS, wait for the pullback to form a new higher low (ideally into an OB, FVG or the 50% of the leg), then buy. SL below that higher low. As long as BOS keeps happening, keep trading with the trend.`,
      tip:`A wick above the high is NOT a BOS — it needs a candle <strong>body close</strong> beyond it. Wicks above highs are usually liquidity grabs.`,
      tag:'▲ HH · HL · BOS = TREND CONTINUES',
      lines:[{ y:[1,'h'], i1:1, i2:5, c:'silver', l:'BOS', la:'m' },
             { y:[6,'h'], i1:6, i2:10, c:'silver', l:'BOS', la:'m' },
             { y:[11,'h'], i1:11, i2:14, c:'silver', l:'BOS', la:'m' }],
      labels:[['@',3,'below','HL','bull'],['@',8,'below','HL','bull'],['@',13,'below','HL','bull'],['@',6,'above','HH','bull'],['@',11,'above','HH','bull']] },

    { id:'choch', name:'Change of Character (CHoCH)', icon:'🔀', g:'liq', bias:'bear',
      y0:110, seq:[-10,-8,6,5,-12,-10,6,7,8,-5,-4,9,10,12,-5,-3,8,10,9],
      desc:`A <strong>CHoCH</strong> is the <strong>first sign a trend is reversing</strong>. In an uptrend, price fails to make a new high (a <strong>lower high</strong>), then closes <strong>below the last higher low</strong>. The character of the market has changed from bullish to bearish.`,
      how:`Stop buying after a CHoCH. Wait for price to pull back into the zone that caused the break (an OB or FVG near the lower high), then sell. SL above the lower high. Target the next low / liquidity below.`,
      tip:`BOS = trend continuing. CHoCH = trend changing. A CHoCH on a lower timeframe inside a higher-timeframe pullback is often the perfect entry trigger.`,
      tag:'▼ FAILS TO MAKE HH · BREAKS LAST HL',
      lines:[{ y:[1,'h'], i1:1, i2:5, c:'silver', l:'BOS', la:'m' },
             { y:[8,'l'], i1:8, i2:12, c:'bear', l:'CHoCH', la:'b', w:1.5 }],
      labels:[['@',5,'above','HH','bull'],['@',3,'below','HL','bull'],['@',10,'above','LH','bear'],['@',15,'above','LH','bear']],
      dot:[15, [15,'h']] },

    { id:'liquidity', name:'Buy-Side & Sell-Side Liquidity', icon:'💧', g:'liq', bias:'bear',
      y0:80, seq:[-8,-8,10,12,-10,-11.5,10.5,11.5,-12.5,-10,6,{d:-4,wt:9},12,12,10,10],
      desc:`<strong>Buy-side liquidity (BSL)</strong> = buy stops sitting above equal highs (shorts' stop losses + breakout buyers). <strong>Sell-side liquidity (SSL)</strong> = sell stops below equal lows. Price is drawn to these pools like a magnet — big players need that liquidity to fill their orders.`,
      how:`Mark obvious equal highs and lows. Expect price to run one side first. When price sweeps BSL and closes back below the highs, sell — targeting the SSL on the other side. (And the reverse for buys.)`,
      tip:`The cleaner and more obvious the equal highs/lows look, the more stops are behind them — and the more likely they get taken.`,
      tag:'▼ SWEEP BSL → TARGET SSL',
      lines:[{ y:62, i1:1, i2:10, c:'bull', l:'BSL · STOPS ABOVE', la:'m' },
             { y:88.5, i1:3, i2:12, c:'bear', l:'SSL · STOPS BELOW', la:'b' }],
      labels:[['@',11,'above','SWEEP','bear']],
      dot:[12, [12,'o']] },

    { id:'judas', name:'Asian Range Sweep (Judas Swing)', icon:'🌏', g:'liq', bias:'bull',
      y0:80, seq:[-2,2,-3,2,-1,3,-2,1,2,-2,{d:6,wb:6},{d:-1,wb:3},-8,-10,-9,-7,-8,-6],
      desc:`During the <strong>Asian session</strong> price ranges quietly, building stops above and below. At the <strong>London open</strong>, price often fakes one way to sweep the Asian high or low (the <strong>Judas swing</strong>), then makes the real move of the day in the opposite direction.`,
      how:`Mark the Asian session high and low (roughly 02:00–08:00 SAST). At London open, if price sweeps the Asian low and closes back inside, buy. SL below the sweep wick. Target the Asian high, then beyond.`,
      tip:`In SA time London opens at 09:00 SAST (northern summer) or 10:00 SAST (northern winter). Same idea at the New York open using the London range.`,
      tag:'▲ SWEEP ASIAN LOW AT LONDON OPEN → BUY',
      bands:[{ i:0, i2:9, c:'slate', l:'ASIAN RANGE', ext:['A-HIGH','A-LOW'] }],
      labels:[['@',10,'below','LONDON SWEEP','bear']],
      dot:[12, [12,'o']] },

    { id:'snd', name:'Supply & Demand Zones', icon:'🏗️', g:'liq', bias:'bull',
      y0:50, seq:[8,9,8,{d:2,wt:1.5,wb:1.5},{d:-2,wt:1.5,wb:1.5},{d:1,wt:1.5,wb:1.5},-14,-16,-12,3,8,10,12,{d:3,wb:3},-12,-14,-12],
      desc:`A <strong>demand zone</strong> is a tight <strong>base</strong> of small candles right before an explosive rally (drop-base-rally or rally-base-rally). Unfilled buy orders were left there. A <strong>supply zone</strong> is the opposite — a base before an explosive drop.`,
      how:`Draw the zone around the base candles (highest body/wick to lowest wick). When price returns for the first time, buy at the top of the zone. SL below the zone. Target the high made by the rally.`,
      tip:`Strong zones: few base candles (1–3), a fast exit move, and price hasn't been back yet. Each retest weakens the zone.`,
      tag:'▲ DROP · BASE · RALLY → BUY THE RETURN',
      zones:[{ t:'range', i:3, i2:5, c:'bull', l:'DEMAND ZONE' }],
      labels:[['@',4,'below','BASE','silver'],['@',7,'above','RALLY','bull']],
      dot:[13, [13,'l']] },

    // ───────── PRO SETUPS ─────────
    Object.assign({}, SEQ_A, {
      id:'ob-fvg', name:'OB + FVG Combo (A+ Setup)', icon:'⭐', g:'combo', bias:'bull',
      desc:`The highest-probability Smart Money entry: an <strong>order block with an FVG right above it</strong>. Price returns through the FVG and into the OB — two institutional zones stacked on top of each other.`,
      how:`Mark both zones. Entry at the top of the OB (or first reaction in the FVG for a smaller position). SL below the OB low. TP1 = the high that broke structure.`,
      tip:`Check the higher timeframe first: the setup works best when the H4/D1 is also bullish and price is in a discount (see next cards).`,
      tag:'▲ FVG + OB STACKED = A+ ZONE',
      hl:[5], zones:[{ t:'ob', i:5, c:'bull', l:'OB' }, { t:'fvg', i:7, c:'light', l:'FVG' }],
      lines:[{ y:[2,'h'], i1:2, i2:8, c:'silver', l:'BOS', la:'m' },
             { y:[8,'h'], i1:8, c:'bull', l:'TP1', dash:'2,3' },
             { y:91, i1:12, c:'bear', l:'SL' }],
      dot:[12, [5,'h']]
    }),

    { id:'sweep', name:'Liquidity Sweep into Order Block', icon:'🌊', g:'combo', bias:'bull',
      y0:60, seq:[8,7,-6,-5,7,{d:6,wb:1.5},-5,-6,8,{d:6,wb:9},-14,-16,-12,6,12,{d:12,wb:5},-12,-14,-10],
      desc:`Retail traders put stops below <strong>equal lows</strong> — that's <strong>liquidity</strong>. Smart money pushes price below them to trigger those stops (the <strong>sweep</strong>), fills their buys, then drives price up. The candle that swept becomes the OB.`,
      how:`Spot equal lows → wait for a wick below them → wait for a strong move up that breaks structure → buy the return to the OB. SL below the sweep wick.`,
      tip:`Equal highs and equal lows are magnets. The more obvious the level, the more stops sit behind it.`,
      tag:'▲ SWEEP → BOS → BUY THE OB',
      hl:[9], zones:[{ t:'ob', i:9, c:'bull', l:'OB' }],
      lines:[{ y:77.5, i1:1, i2:8, c:'slate', l:'EQUAL LOWS $$$', la:'b' },
             { y:[7,'h'], i1:7, i2:11, c:'silver', l:'BOS', la:'m' }],
      dot:[15, [9,'h']],
      labels:[['@',9,'below','SWEEP','bear']] },

    Object.assign({}, SEQ_B, {
      id:'pd', name:'Premium vs Discount', icon:'⚖️', g:'combo', bias:'bull',
      desc:`Split the swing range in half at the <strong>50% (equilibrium)</strong>. Above it is <strong>premium</strong> (expensive), below it is <strong>discount</strong> (cheap). Smart money buys in discount and sells in premium.`,
      how:`Only take bullish OBs/FVGs that sit in the <strong>discount</strong> half of the range. Only take bearish OBs/FVGs in the <strong>premium</strong> half. Anything else, skip.`,
      tip:`This is just the 50% Fib level used as a filter — draw your Fib from swing low to swing high to find it fast.`,
      tag:'▲ BUY IN DISCOUNT · SELL IN PREMIUM',
      hl:[5],
      bands:[{ i:5, y1:31, y2:56, c:'bear', l:'PREMIUM', top:true }, { i:5, y1:56, y2:81, c:'bull', l:'DISCOUNT' }],
      zones:[{ t:'ob', i:5, c:'bull' }],
      lines:[{ y:56, i1:5, c:'silver', l:'50% EQ' }],
      dot:[12, [5,'h']],
      labels:[['@',5,'below','OB IN DISCOUNT','bull']]
    })
  ];

  const grid = document.getElementById('examples-grid');
  if(grid) grid.insertAdjacentHTML('beforeend', SMC.map(card).join(''));

  const sub = document.getElementById('smc-subfilter');
  if(sub){
    sub.innerHTML = `<span class="pattern-subfilter-label">${SMC.length} Smart Money Lessons</span>` +
      GROUPS.map(([k,label],i) => {
        const n = k==='all' ? SMC.length : SMC.filter(p => p.g===k).length;
        return `<button class="pat-filter smc-filter${i===0?' on':''}" onclick="filterSMC('${k}',this)">${label}<span>${n}</span></button>`;
      }).join('');
  }
})();

function filterSMC(group, btn){
  document.querySelectorAll('.smc-filter').forEach(b => b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  document.querySelectorAll('.ex-card').forEach(card => {
    const cats = (card.dataset.cat || '').split(' ');
    card.style.display = cats.includes('smc') && (group==='all' || cats.includes('smc-'+group)) ? 'block' : 'none';
  });
}
