// ══════════════════════════════════════════════════════
// EXAMPLES → TRADE MANAGEMENT LIBRARY
// Planning, risk and managing open trades (uses exengine.js)
// ══════════════════════════════════════════════════════
(function(){
  if(!window.BMX) return;
  const { C, T, gen } = BMX;
  const GROUPS = [
    ['all','All Management','#2A8FE3'],
    ['plan','Planning','#2A8FE3'],
    ['risk','Risk','#FF5C5C'],
    ['manage','Managing Trades','#22D67A'],
    ['range','Key Range','#E4E8EE']
  ];
  const f1 = v => (+v).toFixed(1);
  const wrap = s => `<svg width="100%" viewBox="0 0 260 150" style="max-width:320px;display:block;" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
  const argMin = (arr, a, b) => { let k = a; for(let i = a; i <= b; i++) if(arr[i] < arr[k]) k = i; return k; };

  // Mini candle chart inside a frame
  function mini(sp, fx, fy, fw, fh){
    const d = gen(sp), n = d.n;
    const lo = Math.min(...d.l, ...(sp.fit || [])), hi = Math.max(...d.h, ...(sp.fit || [])), pad = (hi - lo) * 0.06;
    const X = i => fx + 4 + i * (fw - 8) / (n - 1);
    const Y = p => fy + fh - 4 - (p - lo + pad) / (hi - lo + 2 * pad) * (fh - 8);
    const bw = Math.max(1.4, (fw - 8) / n * 0.6);
    let s = `<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="4" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/>`;
    (sp.zones || []).forEach(z => {
      s += `<rect x="${f1(X(z.i1))}" y="${f1(Y(z.p2))}" width="${f1(X(z.i2) - X(z.i1))}" height="${f1(Y(z.p1) - Y(z.p2))}" fill="${C[z.c] || z.c}" opacity="0.18" stroke="${C[z.c] || z.c}" stroke-width="0.7" stroke-dasharray="2,2"/>`;
      if(z.l) s += T((X(z.i1) + X(z.i2)) / 2, Y(z.p1) + 8, z.l, { c:C[z.c] || z.c, s:6 });
    });
    for(let i = 0; i < n; i++){
      const up = d.c[i] >= d.o[i], cc = up ? C.bull : C.bear;
      s += `<line x1="${f1(X(i))}" y1="${f1(Y(d.h[i]))}" x2="${f1(X(i))}" y2="${f1(Y(d.l[i]))}" stroke="${cc}" stroke-width="0.7"/>`;
      s += `<rect x="${f1(X(i) - bw / 2)}" y="${f1(Y(Math.max(d.o[i], d.c[i])))}" width="${f1(bw)}" height="${f1(Math.max(Math.abs(Y(d.o[i]) - Y(d.c[i])), 0.8))}" fill="${cc}"/>`;
    }
    (sp.lines || []).forEach(l => {
      s += `<line x1="${f1(X(l.i1))}" y1="${f1(Y(l.p))}" x2="${f1(X(l.i2))}" y2="${f1(Y(l.p))}" stroke="${C[l.c] || l.c}" stroke-width="1" stroke-dasharray="3,2"/>`;
      if(l.l) s += T((X(l.i1) + X(l.i2)) / 2, Y(l.p) + (l.below ? 8 : -3), l.l, { c:C[l.c] || l.c, s:6 });
    });
    (sp.dots || []).forEach(([i, p, c]) => { s += `<circle cx="${f1(X(i))}" cy="${f1(Y(p))}" r="2.8" fill="${C[c] || c}" stroke="#080808" stroke-width="1"/>`; });
    return { s, X, Y, d };
  }

  // ── Custom diagrams ──
  function topDown(){
    let s = '';
    const fr = [[4,'D1 · BIAS'], [90,'H4 · ZONE'], [176,'M15 · ENTRY']];
    const a = mini({ n:30, seed:31, noise:1.4, pts:[[0,20],[9,44],[13,37],[21,62],[25,54],[29,57]], zones:[{ i1:23, i2:29, p1:50, p2:60, c:'blue' }] }, 4, 22, 80, 100);
    const b = mini({ n:30, seed:32, noise:1.1, pts:[[0,68],[6,72],[16,52],[23,42],[26,40],[29,45]], zones:[{ i1:20, i2:29, p1:37, p2:46, c:'bull', l:'DEMAND' }] }, 90, 22, 80, 100);
    const c = mini({ n:30, seed:33, noise:0.9, pts:[[0,62],[8,48],[12,53],[17,40],[21,46],[24,44],[29,64]], lines:[{ i1:12, i2:24, p:54.5, c:'bull', l:'CHoCH' }], dots:[[24,44,'bull']] }, 176, 22, 80, 100);
    s += a.s + b.s + c.s;
    fr.forEach(([x, t], k) => { s += T(x + 40, 15, t, { c:[C.blue, C.bull, C.light][k], s:7 }); });
    s += T(44, 134, '▲ UPTREND', { c:C.bull, s:6.5 }) + T(130, 134, 'PULLBACK INTO ZONE', { c:C.silver, s:6.5 }) + T(216, 134, 'CHoCH UP → BUY', { c:C.bull, s:6.5 });
    s += T(87, 74, '›', { c:C.dim, s:14 }) + T(173, 74, '›', { c:C.dim, s:14 });
    return wrap(s);
  }

  function sizing(){
    let s = '';
    const panel = (x, sl, lots, col) => {
      let o = `<rect x="${x}" y="22" width="118" height="84" rx="5" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" stroke-width="0.8"/>`;
      const e = 46, slY = e + sl * 1.0;
      o += `<rect x="${x + 14}" y="${e}" width="40" height="${slY - e}" fill="${C.bear}" opacity="0.22"/>`;
      o += `<line x1="${x + 10}" y1="${e}" x2="${x + 58}" y2="${e}" stroke="${C.blue}" stroke-width="1.4"/>`;
      o += `<line x1="${x + 10}" y1="${slY}" x2="${x + 58}" y2="${slY}" stroke="${C.bear}" stroke-width="1.4" stroke-dasharray="3,2"/>`;
      o += T(x + 34, e - 4, 'ENTRY', { c:C.blue, s:6.5 }) + T(x + 34, slY + 9, `SL ${sl} PIPS`, { c:C.bear, s:6.5 });
      o += T(x + 88, 44, 'RISK', { c:C.dim, s:6.5 }) + T(x + 88, 54, '$100', { c:C.silver, s:9 });
      o += T(x + 88, 72, 'LOT SIZE', { c:C.dim, s:6.5 }) + T(x + 88, 84, lots, { c:col, s:10 });
      return o;
    };
    s += panel(6, 20, '0.50', C.bull) + panel(136, 50, '0.20', C.amber);
    s += T(130, 13, '$10,000 ACCOUNT · 1% RISK = $100 PER TRADE', { c:C.silver, s:7 });
    s += `<rect x="18" y="114" width="224" height="26" rx="5" fill="rgba(42,143,227,0.1)" stroke="rgba(42,143,227,0.4)" stroke-width="0.8"/>`;
    s += T(130, 125, 'LOTS = RISK $ ÷ (SL PIPS × PIP VALUE)', { c:C.light, s:7.5 });
    s += T(130, 135, 'EURUSD: 1.00 lot = $10 per pip', { c:C.dim, s:6.5 });
    return wrap(s);
  }

  function dxy(){
    let s = '';
    const base = [[0,40],[10,48],[16,44],[26,58],[32,54],[44,70],[49,72]];
    const a = gen({ n:50, seed:41, noise:1.2, pts:base.map(p => [p[0], 100 - p[1]]) });
    const b = gen({ n:50, seed:42, noise:1.2, pts:base });
    const line = (d, y0, h, c) => {
      const lo = Math.min(...d.c), hi = Math.max(...d.c);
      const pts = d.c.map((v, i) => `${f1(12 + i * 196 / 49)},${f1(y0 + h - (v - lo) / (hi - lo) * h)}`).join(' ');
      return `<polyline points="${pts}" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`;
    };
    s += `<line x1="8" y1="76" x2="212" y2="76" stroke="rgba(255,255,255,0.08)"/>`;
    s += line(a, 14, 54, C.bear) + line(b, 86, 54, C.bull);
    s += T(10, 12, 'EURUSD', { a:'start', c:C.bear, s:7 }) + T(10, 84, 'DXY (US DOLLAR INDEX)', { a:'start', c:C.bull, s:7 });
    s += T(216, 64, '▼ FALLS', { a:'start', c:C.bear, s:7 }) + T(216, 92, '▲ RISES', { a:'start', c:C.bull, s:7 });
    s += T(236, 79, '⇅', { c:C.silver, s:11 });
    return wrap(s);
  }

  const MGT = [
    // ───────── PLANNING ─────────
    { id:'topdown', name:'Top-Down Analysis (Multi-Timeframe)', icon:'🔭', g:'plan', bias:'bull',
      desc:`Professionals start big and zoom in. The <strong>higher timeframe</strong> gives the <strong>bias</strong> (direction), the <strong>middle timeframe</strong> gives the <strong>zone</strong> (where), and the <strong>lower timeframe</strong> gives the <strong>entry trigger</strong> (when).`,
      how:`1) D1: is it making HH/HL or LH/LL? That's your only direction. 2) H4: wait for a pullback into an OB, FVG, Fib or S/R zone. 3) M15: wait for a CHoCH in your direction inside the zone, then enter. SL below the M15 swing.`,
      tip:`Never trade a lower-timeframe signal against the higher-timeframe trend. Typical combos: W1→D1→H4 (swing), D1→H4→M15 (day), H4→M15→M1/M5 (scalp).`,
      tag:'▲ D1 BIAS → H4 ZONE → M15 ENTRY',
      svg:topDown() },

    { id:'dxy', name:'DXY & Correlation', icon:'💵', g:'plan', bias:'both',
      desc:`The <strong>DXY</strong> (US Dollar Index) measures the dollar against a basket of currencies. Because most pairs are quoted against the dollar, it drives them: <strong>DXY up = EURUSD, GBPUSD, XAUUSD down</strong> and <strong>USDJPY, USDCAD up</strong>.`,
      how:`Before buying EURUSD or gold, check DXY: you want it bearish (at resistance or breaking down). Before selling them, you want DXY bullish. If DXY disagrees with your trade, skip it or reduce size.`,
      tip:`Don't open buys on EURUSD and GBPUSD and AUDUSD at the same time — that's really one big bet against the dollar, with 3× the risk.`,
      tag:'◆ DXY ▲ = EURUSD ▼ · INVERSE CORRELATION',
      svg:dxy() },

    // ───────── RISK ─────────
    { id:'rr', name:'Risk-to-Reward Ratio (R:R)', icon:'⚖️', g:'risk', bias:'bull',
      desc:`<strong>R:R</strong> compares what you risk (entry to SL) with what you can make (entry to TP). At <strong>1:3</strong> you only need to win <strong>1 trade in 4</strong> to break even — that's how professionals stay profitable while losing often.`,
      how:`Before entering, measure: distance to TP ÷ distance to SL. If it's less than 1:2, skip the trade. Blue Mac rule: <strong>TP1 ≥ 1:2</strong> and <strong>TP2 ≥ 1:3</strong>.`,
      tip:`Break-even win rate = 1 ÷ (1 + R). At 1:1 you must win 50%. At 1:2 → 33%. At 1:3 → 25%.`,
      tag:'▲ RISK 1 TO MAKE 3',
      chart:{ n:44, seed:51, noise:0.8,
        pts:[[0,40],[12,52],[18,48],[22,50],[30,56],[36,62],[43,69]],
        boxes:[{ i1:22, i2:43, p1:44, p2:50, c:'bear', op:0.2 }, { i1:22, i2:43, p1:50, p2:68, c:'bull', op:0.14 }],
        fitExtra:[42, 70],
        marks:[{ t:'hline', p:50, i1:22, c:'blue', l:'ENTRY', dash:'' }, { t:'hline', p:44, i1:22, c:'bear', l:'SL · 1R' }, { t:'hline', p:68, i1:22, c:'bull', l:'TP · 3R' },
               { t:'dot', i:22, p:50, c:'blue' }, { t:'text', i:33, p:46.2, s:'RISK 1R', c:'bear' }, { t:'text', i:30, p:64, s:'REWARD 3R', c:'bull' }] } },

    { id:'sizing', name:'Position Sizing — Risk the Same Every Trade', icon:'🧮', g:'risk', bias:'both',
      desc:`Your <strong>lot size</strong> should change with every trade so that you always lose the <strong>same amount</strong> if you're wrong. A tight stop gets a bigger lot, a wide stop gets a smaller lot — same dollar risk either way.`,
      how:`Pick a fixed risk (1% of your account is standard, max 2%). Measure your SL in pips. Lots = risk $ ÷ (SL pips × pip value). Round <strong>down</strong>, never up.`,
      tip:`For ZAR accounts: work out 1% in rand, then convert the pip value to rand at the current USDZAR rate. Most brokers have a free position-size calculator.`,
      tag:'◆ SAME $ RISK · DIFFERENT LOT SIZE',
      svg:sizing() },

    { id:'news', name:'High-Impact News Spikes', icon:'📰', g:'risk', bias:'bear',
      desc:`Red-folder news (NFP, CPI, interest rate decisions) can move price <strong>50–100+ pips in seconds</strong>. Spreads widen, stops get skipped (slippage), and both directions get hit before the real move starts.`,
      how:`Check the economic calendar every morning. <strong>Don't open trades 15–30 min before and after</strong> high-impact news on the affected currency. Close or protect open trades before the release (move SL to break-even or take profit).`,
      tip:`US NFP is usually the first Friday of the month at 14:30 SAST (15:30 SAST from November to March, when the US is on standard time). FOMC decisions land at 20:00 or 21:00 SAST.`,
      tag:'✕ STAY OUT AROUND RED-FOLDER NEWS',
      chart:{ n:44, seed:52, noise:0.45, wick:0.8,
        pts:[[0,50],[25,51],[26,50],[27,47,2.5],[32,44,2],[43,40,1.6]],
        fix:{ 26:{ o:51, c:44.5, h:59, l:41 } },
        boxes:[{ i1:23, i2:30, p1:38, p2:61, c:'bear', op:0.08, l:'NO-TRADE ZONE', lt:'below' }],
        fitExtra:[34],
        marks:[{ t:'vline', i:26, c:'amber', l:'NFP 14:30', a:'end' }] } },

    // ───────── MANAGING ─────────
    { id:'partials', name:'Partial Take Profit (TP1 & TP2)', icon:'✂️', g:'manage', bias:'bull',
      desc:`Instead of all-or-nothing, close <strong>part of the trade at TP1</strong> (e.g. 50% at 2R) and let the rest run to <strong>TP2</strong>. You lock in profit, and the trade can no longer become a big loser.`,
      how:`At TP1: close 50% and move SL to break-even on the rest. At TP2: close the remainder (or trail it). Worst case after TP1 = a small win. Best case = a big runner.`,
      tip:`This is exactly how Blue Mac trade ideas are built — TP1 ≥ 1:2 and TP2 ≥ 1:3.`,
      tag:'▲ TP1 CLOSE 50% · SL TO BE · TP2 RUNS',
      chart:{ n:50, seed:53, noise:0.8,
        pts:[[0,40],[10,52],[16,48.5],[20,50],[26,56],[31,62.5],[36,58],[42,64],[47,68.6],[49,67]],
        fitExtra:[43, 70],
        marks:[{ t:'dot', i:20, p:50, c:'blue' }, { t:'hline', p:50, i1:20, i2:31, c:'blue', dash:'' },
               { t:'hline', p:44, i1:20, i2:31, c:'bear', l:'SL' }, { t:'hline', p:50, i1:31, c:'silver', l:'SL → BE' },
               { t:'hline', p:62, i1:20, c:'bull', l:'TP1 50%', dash:'2,3' }, { t:'hline', p:68, i1:20, c:'bull', l:'TP2 3R', dash:'2,3' },
               { t:'dot', i:31, p:62, c:'bull' }, { t:'dot', i:47, p:68, c:'bull' }] } },

    { id:'be', name:'Moving Your Stop to Break-Even', icon:'🛡️', g:'manage', bias:'bull',
      desc:`Once price has moved <strong>1R in your favour</strong>, moving your stop loss to your entry price makes the trade <strong>risk-free</strong>. If price turns around, you're out at zero instead of taking a full loss.`,
      how:`When the trade reaches 1:1 (or TP1), move SL to entry + spread. Don't do it too early — give the trade room until it has clearly moved away from your entry.`,
      tip:`Moving to BE too fast is a common mistake: normal pullbacks will stop you out of good trades. A rule like "BE at 1R or after a new BOS" keeps it objective.`,
      tag:'◆ STOPPED AT BE = $0 LOST INSTEAD OF −1R',
      chart:{ n:50, seed:54, noise:0.7,
        pts:[[0,42],[12,48],[18,50],[24,54],[28,56.5],[32,54],[38,49.6],[44,45.5],[49,43]],
        fitExtra:[42, 58],
        marks:[{ t:'dot', i:18, p:50, c:'blue' }, { t:'hline', p:44, i1:18, i2:28, c:'bear', l:'SL' },
               { t:'hline', p:56, i1:18, c:'bull', l:'1R', dash:'2,3' }, { t:'hline', p:50, i1:28, c:'silver', l:'BE' },
               { t:'ring', i:28, p:56.5, c:'bull' }, { t:'ring', i:38, p:50, c:'silver' }, { t:'text', i:44, p:52, s:'OUT AT $0', c:'silver' }] } },

    { id:'trail', name:'Trailing Stop Loss', icon:'🪜', g:'manage', bias:'bull',
      desc:`In a strong trend, move your stop up <strong>behind each new higher low</strong> as it forms. You stay in the trend as long as it lasts, and you're only stopped out when structure finally breaks.`,
      how:`After each BOS, move SL to just below the higher low that caused it. Never move a stop backwards (further away). When price closes below your trailed SL, the trend is likely over — you exit with most of the move.`,
      tip:`Trail on the timeframe you entered on. Trailing on a lower timeframe gets you stopped out on normal noise.`,
      tag:'▲ STOP FOLLOWS EACH HIGHER LOW',
      chart:{ n:52, seed:55, noise:0.8,
        pts:[[0,30],[8,42],[12,37],[20,52],[24,46.5],[32,62],[36,56.5],[44,72],[48,68],[51,70]],
        marks: x => {
          const lows = [[0,4],[10,14],[22,26],[34,38]].map(([a, b]) => argMin(x.d.l, a, b));
          const out = [], steps = lows.map(i => [i, x.L(i) - 1.2]);
          steps.forEach(([i, p], k) => {
            const start = k === 0 ? i : i + 3, end = k < steps.length - 1 ? steps[k + 1][0] + 3 : x.n - 1;
            out.push({ t:'line', a:[start, p], b:[end, p], c:'bear', w:1.4 });
            if(k < steps.length - 1) out.push({ t:'line', a:[end, p], b:[end, steps[k + 1][1]], c:'bear', w:1.4, dash:'2,2' });
            out.push({ t:'dot', i, p:x.L(i), c:'bull', r:2.4 });
          });
          out.push({ t:'text', x:214, y:x.Y(steps[3][1]) + 2.5, s:'TRAIL SL', c:'bear', a:'start' });
          return out;
        } } }
  ];

  // ── Key Range lessons (the range set by the first candles after an open) ──
  const RB = { 0:{o:101,c:103.4,h:103.8,l:100.6}, 1:{o:103.4,c:101.2,h:103.9,l:100.4}, 2:{o:101.2,c:102.8,h:103.2,l:100.9}, 3:{o:102.8,c:101.5,h:103.6,l:101.2},
               4:{o:101.5,c:103.1,h:103.5,l:100.2}, 5:{o:103.1,c:101.9,h:104,l:101.6}, 6:{o:101.9,c:102.9,h:103.3,l:101.4}, 7:{o:102.9,c:101.6,h:103.2,l:100.3},
               8:{o:101.6,c:102.6,h:103,l:101.1}, 9:{o:102.6,c:103.2,h:103.6,l:102.2} };
  const KBOX = [{ i1:0, i2:9, p1:100, p2:104, c:'silver', op:0.1, border:true, l:'KEY RANGE', lt:'below' }];
  function frames(){
    let s = '';
    const P = [['5M','SCALP'], ['15M','KEY'], ['1ST HOUR','DAY'], ['MONDAY','SWING'], ['1ST WEEK','POSITION']];
    P.forEach(([a, b], k) => {
      const x = 4 + k * 51;
      const m = mini({ n:16, seed:70 + k, noise:0.5, pts:[[0,50],[5,52],[6,56],[10,59],[15,63]], zones:[{ i1:0, i2:5, p1:47.5, p2:53.5, c:'silver' }],
        fit:[44, 66] }, x, 26, 48, 92);
      s += m.s + T(x + 24, 15, a, { c:C.silver, s:6.5 }) + T(x + 24, 132, b, { c:[C.bull, C.amber, C.blue, C.bull, C.light][k], s:6.5 });
    });
    return wrap(s);
  }
  MGT.push(
    { id:'keyrange', name:'The Key Range', icon:'🔑', g:'range', bias:'neut',
      desc:`When a big market opens, the first candles set a <strong>high and a low</strong> that the rest of the session reacts to. The banks place their opening orders here — so this range shows where buyers and sellers stand before the real move. Blue Mac calls it the <strong>Key Range</strong>.`,
      how:`Mark the high and low of the <strong>first 15 minutes</strong> after the open — Asia 02:00, London 09:00/10:00 and New York 15:30/16:30 SAST (uTrade Ideas shows today's exact times). Don't trade while price is inside it. Wait for a candle to <strong>close</strong> outside.`,
      tip:`A tight Key Range (small compared with the average daily range) is energy being stored — the break is usually stronger. A huge range means most of the day's move has already happened.`,
      tag:'◆ MARK THE FIRST 15 MINUTES',
      chart:{ n:36, seed:109, noise:0.35, wick:0.5, pts:[[0,102],[9,103.2],[14,101.4],[20,103.3],[26,101.2],[31,102.8],[35,102.2]], fix:RB,
        boxes:[{ i1:0, i2:9, p1:100, p2:104, c:'silver', op:0.14, border:true, l:'FIRST 15 MIN', lt:'below' }],
        ov:[{ t:'level', p:104, c:'bull', l:'RANGE HIGH' }, { t:'level', p:100, c:'bear', l:'RANGE LOW' }], fitExtra:[99, 105.5] } },
    { id:'keybreak', name:'Key Break & Retest', icon:'🚀', g:'range', bias:'bull',
      desc:`The trade comes when a candle <strong>closes outside</strong> the Key Range with a strong body. The best entries come on the <strong>retest</strong> — price comes back to the edge it just broke, and that edge now holds.`,
      how:`Entry 1 on the retest of the broken edge, Entry 2 at the middle of the range. Stop on the <strong>other side</strong> of the range. Targets: 2× and 3× the range height projected from the break, or yesterday's high/low. One trade per session — close it by the end of the session.`,
      tip:`If price runs away without a retest, don't chase it. Use the middle of the range as your entry, or skip the trade.`,
      tag:'▲ CLOSE OUTSIDE → BUY THE RETEST',
      chart:{ n:36, seed:101, noise:0.35, wick:0.5, pts:[[0,102],[9,103.2],[10,104.8],[11,106],[14,107.2],[17,104.6],[18,105],[22,107.5],[28,109.5],[35,111]],
        fix:Object.assign({}, RB, { 10:{ o:103.2, c:105.6, h:105.9, l:103 }, 16:{ o:105.2, c:104.5, h:105.4, l:104.1 }, 17:{ o:104.5, c:105.3, h:105.5, l:104.05 } }), boxes:KBOX,
        marks:[{ t:'hline', p:104, i1:0, c:'bull', l:'RANGE HIGH' }, { t:'text', i:10, p:107.4, s:'BREAK', c:'bull' }, { t:'ring', i:17, p:104.1, c:'amber', r:4.5 }, { t:'text', i:20, p:102.6, s:'RETEST', c:'amber' }],
        fitExtra:[99.4, 112] } },
    { id:'fakebreak', name:'The Fake Break', icon:'🪤', g:'range', bias:'bear',
      desc:`Not every break is real. When price <strong>wicks outside</strong> the Key Range but the candle <strong>closes back inside</strong>, the breakout traders are trapped — and price often runs hard the other way. This is the liquidity sweep you trade in the Scalp style.`,
      how:`Never enter on a wick — wait for the close. If the candle closes back inside, the break has failed: no breakout trade. If you trade the Scalp style, this snap-back is your setup.`,
      tip:`If you are already in a breakout trade and a candle closes back inside the range, the idea is dead — get out.`,
      tag:'▼ WICK OUT, CLOSE BACK IN = TRAP',
      chart:{ n:36, seed:107, noise:0.35, wick:0.5, pts:[[0,102],[9,103.2],[10,103.6],[13,102],[18,100.6],[22,98.6],[28,97.2],[35,96.5]],
        fix:Object.assign({}, RB, { 10:{ o:103.2, c:103.5, h:105.8, l:103 } }), boxes:KBOX,
        marks:[{ t:'hline', p:104, i1:0, c:'slate' }, { t:'ring', i:10, p:105.6, c:'amber', r:4.5 }, { t:'text', i:10, p:107.3, s:'FAKE BREAK', c:'amber' }, { t:'arrow', pts:[[13,101.5],[24,98]], c:'bear' }],
        fitExtra:[108] } },
    { id:'keyframes', name:'The Key Range on Every Timeframe', icon:'🧭', g:'range', bias:'neut',
      desc:`The same idea works at every speed: the first part of a period sets a range, and the break of it shows who is in control. Every Blue Mac style uses its own Key Range.`,
      how:`<strong>Scalp</strong> — first 5 minutes of London / New York. <strong>Blue Mac Key</strong> — first 15 minutes of Asia, London or New York. <strong>Day</strong> — first hour of London / New York. <strong>Swing</strong> — Monday's high and low. <strong>Position</strong> — the first week of the month.`,
      tip:`The bigger the period, the more important its range: a break of the first week of the month can set the direction for weeks.`,
      tag:'◆ ONE IDEA · FIVE TIMEFRAMES', svg: frames() }
  );

  BMX.mount('mgt', 'Management Lessons', GROUPS, MGT);
})();
