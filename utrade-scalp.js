// ══════════════════════════════════════════════════════
// uTRADE IDEAS · SCALP — "Session Liquidity Scalp"
// H1 bias → 15m liquidity sweep into a zone → 5m confirmation
// Built from the Examples library: market structure, BOS/CHoCH,
// premium/discount, liquidity sweeps (Judas swing), order blocks,
// FVGs, S/R flips, VWAP, EMA 9/21, RSI divergence, PDH/PDL, DXY.
// ══════════════════════════════════════════════════════
(function(){
  if(!window.UT) return;
  const D = UT.D;

  // ── Diagrams (bull versions — D.chart(spec, -1) mirrors to bear) ──
  const DG = {
    structTrend: {
      n:40, seed:11, noise:0.45, wick:0.6,
      pts:[[0,100],[7,106],[11,103],[19,110.5],[23,107],[31,115],[35,112],[39,114]],
      marks:[
        { t:'text', i:11, p:101.4, s:['HL','LH'], c:['bull','bear'] },
        { t:'text', i:7, p:107.7, s:['HH','LL'], c:'slate' },
        { t:'text', i:19, p:112.2, s:['HH','LL'], c:['bull','bear'] },
        { t:'text', i:23, p:105.4, s:['HL','LH'], c:['bull','bear'] },
        { t:'text', i:31, p:116.7, s:['HH','LL'], c:['bull','bear'] },
        { t:'arrow', pts:[[24,104.5],[36,110.5]], c:['bull','bear'] }
      ]
    },
    choch: {
      n:40, seed:5, noise:0.4, wick:0.6,
      pts:[[0,114],[6,108],[10,111],[17,104.5],[21,108.5],[27,102],[31,105],[36,111],[39,112.5]],
      marks:[
        { t:'hline', p:108.5, i1:21, i2:38, c:['bull','bear'], l:'CHoCH', lr:false },
        { t:'text', i:21, p:110.1, s:['LH','HL'], c:'slate' },
        { t:'text', i:27, p:100.4, s:['LL','HH'], c:'slate' },
        { t:'ring', i:34, p:108.5, c:['bull','bear'], r:5 }
      ]
    },
    range: {
      n:40, seed:3, noise:0.5, wick:0.7,
      pts:[[0,105],[5,109.5],[10,100.5],[15,109.3],[20,100.8],[25,109.6],[30,100.4],[35,109],[39,105]],
      boxes:[{ i1:1, i2:39, p1:100, p2:110, c:'silver', op:0.06, border:true, l:'CHOP' }]
    },
    emaTrend: {
      n:100, show:46, seed:21, noise:0.9, wick:0.6,
      pts:[[0,86],[30,94],[45,92],[60,101],[70,98.5],[82,106],[90,103.5],[99,109]],
      ov:[{ t:'ema', n:50, c:'blue', l:'50 EMA' }],
      marks:[{ t:'ring', i:90, p:103.3, c:['bull','bear'], r:5 }]
    },
    emaFlat: {
      n:100, show:46, seed:9, noise:1.1, wick:0.7,
      pts:[[0,100],[12,104],[25,97],[38,103.5],[52,96.5],[64,103],[76,97],[88,103],[99,100]],
      ov:[{ t:'ema', n:50, c:'blue', l:'50 EMA' }]
    },
    sweep: {
      n:40, seed:14, noise:0.35, wick:0.5,
      pts:[[0,102],[4,103.6],[8,100.8],[12,103.5],[16,100.9],[20,103.4],[24,101.1],[25,100.6],[26,101.6],[30,103.6],[34,106],[39,108]],
      fix:{ 25:{ o:101.2, c:100.6, h:101.4, l:100.3 }, 26:{ o:100.6, c:101.9, h:102.1, l:98.2 } },
      boxes:[{ i1:1, i2:24, p1:100.5, p2:104, c:'slate', op:0.08, l:'ASIAN RANGE', lt:'below' }],
      marks:[
        { t:'hline', p:100.5, i1:1, c:['bull','bear'], l:['SSL','BSL'] },
        { t:'ring', i:26, p:98.4, c:'amber', r:5 },
        { t:'text', i:26, p:96.6, s:'SWEEP', c:'amber' },
        { t:'arrow', pts:[[28,102.5],[37,107]], c:['bull','bear'] }
      ],
      fitExtra:[96]
    },
    contin: {
      n:40, seed:8, noise:0.4, wick:0.55,
      pts:[[0,100],[8,104],[13,102],[20,106.5],[25,104.2],[31,109],[39,112]],
      marks:[
        { t:'hline', p:106.5, i1:20, i2:33, c:'slate', l:'BOS', lr:false },
        { t:'arrow', pts:[[26,105],[36,111]], c:['bull','bear'] }
      ]
    },
    midRange: {
      n:40, seed:4, noise:0.5, wick:0.6,
      pts:[[0,104],[6,108.5],[12,100.8],[18,108.2],[24,101.2],[30,105.6],[34,104.4],[39,105.2]],
      boxes:[{ i1:1, i2:39, p1:100.5, p2:109, c:'slate', op:0.06, border:true }],
      marks:[{ t:'dot', i:39, p:105.2, c:'amber' }, { t:'text', i:33, p:111, s:'NO SWEEP · MID-RANGE', c:'amber' }],
      fitExtra:[112]
    },
    ob: {
      n:40, seed:31, noise:0.35, wick:0.5,
      pts:[[0,108],[7,104.5],[13,102.6],[14,101.4],[15,104],[16,107.6],[20,110],[24,111.5],[30,107],[35,103.6],[37,104.2],[39,106]],
      fix:{ 14:{ o:103.2, c:101.4, h:103.5, l:100.9 }, 15:{ o:101.4, c:104.6, h:104.9, l:101.2 }, 16:{ o:104.6, c:107.8, h:108.1, l:104.3 } },
      boxes:[{ i1:14, i2:39, p1:100.9, p2:103.5, c:['bull','bear'], op:0.16, border:true, l:'ORDER BLOCK', lt:'below' }],
      marks:[{ t:'ring', i:35, p:103.5, c:['bull','bear'], r:5 }]
    },
    fvg: {
      n:40, seed:12, noise:0.35, wick:0.5,
      pts:[[0,101],[10,102.5],[14,102.6],[15,105],[16,108.3],[22,110.5],[28,108],[34,105],[36,104.6],[39,106.5]],
      fix:{ 14:{ o:102.3, c:103.1, h:103.4, l:101.9 }, 15:{ o:103.1, c:107.6, h:107.9, l:102.9 }, 16:{ o:107.6, c:108.7, h:109.1, l:105.4 } },
      boxes:[{ i1:14, i2:39, p1:103.4, p2:105.4, c:['bull','bear'], op:0.18, border:true, l:'FVG', lt:'below' }],
      marks:[{ t:'ring', i:35, p:104.4, c:['bull','bear'], r:5 }]
    },
    flip: {
      n:40, seed:19, noise:0.35, wick:0.55,
      pts:[[0,101],[6,104.8],[10,102],[15,104.9],[19,102.3],[24,108],[27,109.4],[31,105.6],[33,105.4],[36,107.5],[39,109]],
      marks:[
        { t:'hline', p:105, c:['bull','bear'], l:['S/R FLIP','S/R FLIP'] },
        { t:'text', i:10, p:107, s:['RESISTANCE','SUPPORT'], c:'slate' },
        { t:'ring', i:32, p:105.2, c:['bull','bear'], r:5 }
      ]
    },
    noZone: {
      n:40, seed:23, noise:0.45, wick:0.6,
      pts:[[0,100],[10,104],[16,108],[22,109.5],[28,106.5],[34,107.2],[39,106.8]],
      boxes:[{ i1:4, i2:39, p1:100, p2:101.6, c:'slate', op:0.1, l:'ZONE' }, { i1:12, i2:39, p1:111, p2:112.6, c:'slate', op:0.1, l:'ZONE', lt:'below' }],
      marks:[{ t:'dot', i:39, p:106.8, c:'amber' }, { t:'text', i:30, p:103.8, s:'OPEN SPACE', c:'amber' }],
      fitExtra:[113.5, 99]
    },
    trigChoch: {
      n:40, seed:27, noise:0.3, wick:0.5,
      pts:[[0,108],[6,105],[9,106.6],[15,103],[18,104.8],[23,101.2],[25,100.4],[26,101.8],[27,105.6],[28,106.6],[32,105.6],[36,106.2],[39,107.6]],
      fix:{ 26:{ o:100.6, c:102, h:102.2, l:100.2 }, 27:{ o:102, c:105.9, h:106.1, l:101.8 }, 28:{ o:105.9, c:106.9, h:107.2, l:104.4 } },
      boxes:[{ i1:26, i2:39, p1:102.2, p2:104.4, c:['bull','bear'], op:0.18, border:true, l:'FVG', lt:'below' }],
      marks:[{ t:'hline', p:104.8, i1:18, i2:31, c:['bull','bear'], l:'CHoCH', lr:false }, { t:'ring', i:25, p:100.2, c:'amber', r:4.5 }]
    },
    trigEngulf: {
      n:40, seed:6, noise:0.3, wick:0.5,
      pts:[[0,109],[10,106],[18,104],[26,102.4],[33,101.6],[34,101.3],[35,102.6],[39,104]],
      fix:{ 34:{ o:102.2, c:101.2, h:102.4, l:100.8 }, 35:{ o:101.1, c:103.2, h:103.4, l:100.9 } },
      boxes:[{ i1:20, i2:39, p1:100.5, p2:102.4, c:['bull','bear'], op:0.14, l:'ZONE', lt:'below' }],
      marks:[{ t:'ring', i:35, p:102.2, c:['bull','bear'], r:6 }, { t:'text', i:35, p:105.6, s:'ENGULFING', c:['bull','bear'] }],
      fitExtra:[106.5]
    },
    trigNone: {
      n:40, seed:15, noise:0.25, wick:0.6,
      pts:[[0,108],[12,105],[22,102.4],[28,101.6],[33,102],[39,101.7]],
      boxes:[{ i1:20, i2:39, p1:100.5, p2:102.4, c:'slate', op:0.12, l:'ZONE', lt:'below' }],
      marks:[{ t:'text', i:33, p:104.6, s:'NO SIGNAL YET', c:'amber' }],
      fitExtra:[105.5]
    },
    levels: {
      n:44, seed:14, noise:0.3, wick:0.45,
      pts:[[0,104],[5,109.4],[9,104.5],[14,107],[19,102.2],[22,100.6],[23,101.8],[27,105],[28,106.2],[31,105],[35,103.8],[39,104.3],[43,104.8]],
      fix:{ 5:{ o:108.9, c:109.3, h:109.6, l:108.7 }, 22:{ o:101.6, c:100.9, h:101.8, l:99.2 }, 23:{ o:100.9, c:102.6, h:102.9, l:100.7 }, 28:{ o:105.8, c:106.1, h:106.6, l:105.6 } },
      boxes:[{ i1:23, i2:43, p1:101.8, p2:102.9, c:'bull', op:0.18, border:true, l:'ZONE TOP / BOTTOM', lt:'below' }],
      marks:[
        { t:'hline', p:109.6, i1:5, c:'bull', l:'LIQ ABOVE' },
        { t:'hline', p:106.6, i1:28, c:'silver', l:'SWING HIGH' },
        { t:'hline', p:99.2, i1:22, c:'bear', l:'SWING LOW' },
        { t:'ring', i:22, p:99.4, c:'amber', r:4.5 },
        { t:'dot', i:43, p:104.8, c:'blue' },
        { t:'text', i:42, p:103.2, s:'NOW', c:'blue', a:'end' }
      ],
      fitExtra:[110.2, 98.6]
    }
  };
  const C = (k, dir) => () => D.chart(DG[k], dir);

  // SAST day timeline for the session question
  function sessionBar(s){
    const W = 260, X = m => 6 + m / 1440 * (W - 12);
    const seg = (a, b, c, op) => a <= b
      ? `<rect x="${X(a).toFixed(1)}" y="18" width="${(X(b) - X(a)).toFixed(1)}" height="16" rx="3" fill="${c}" opacity="${op}"/>`
      : seg(a, 1440, c, op) + seg(0, b, c, op);
    const lab = (m, t, c) => `<text x="${X(m).toFixed(1)}" y="13" text-anchor="middle" font-family="'DM Mono',monospace" font-size="6.5" font-weight="bold" fill="${c}">${t}</text>`;
    const mid = w => (w[0] + w[1]) / 2;
    let sv = `<rect x="6" y="18" width="${W - 12}" height="16" rx="3" fill="#8AA4BF" opacity="0.12"/>`;
    sv += seg(0, s.lo[0] - 60, '#8AA4BF', 0.22);
    sv += seg(s.lo[0], s.lo[1], '#2A8FE3', 0.85) + seg(s.ny[0], s.ny[1], '#22D67A', 0.85);
    sv += lab(mid([0, s.lo[0] - 60]), 'ASIA · NO SCALPS', '#8AA4BF') + lab(mid(s.lo), 'LONDON KZ', '#96D0FF') + lab(mid(s.ny), 'NEW YORK KZ', '#22D67A');
    [0, 360, 720, 1080].forEach(m => sv += `<text x="${X(m).toFixed(1)}" y="44" text-anchor="${m ? 'middle' : 'start'}" font-family="'DM Mono',monospace" font-size="6" fill="rgba(255,255,255,0.4)">${String(m / 60).padStart(2,'0')}:00</text>`);
    const x = X(s.now);
    sv += `<line x1="${x.toFixed(1)}" y1="15" x2="${x.toFixed(1)}" y2="37" stroke="#F5B841" stroke-width="1.6"/><text x="${x.toFixed(1)}" y="53" text-anchor="middle" font-family="'DM Mono',monospace" font-size="7" font-weight="bold" fill="#F5B841">NOW ${s.nowTxt}</text>`;
    return `<svg width="100%" viewBox="0 0 ${W} 58" style="max-width:520px;display:block;" xmlns="http://www.w3.org/2000/svg">${sv}</svg>`;
  }

  UT.register('scalp', {
    name: 'Session Liquidity Scalp',
    short: 'Scalp',
    color: 'var(--gold)',
    tfs: 'H1 → 15m → 5m',
    biasTF: 'H1',
    entryTF: '5-minute',
    minRR: [2, 3],
    desc: 'Banks hunt the stops sitting above and below the Asian range and yesterday\'s high/low. We wait for that sweep, then scalp the snap-back from an order block or FVG — only with the H1 trend, only in the London or New York kill zone.',
    pills: ['Hold 5–90 min', 'London & NY kill zones', 'TP1 ≥ 1:2 · TP2 ≥ 1:3', 'Max 3 losses a day'],
    stages: [{ label:'Safety gates' }, { label:'H1 bias' }, { label:'15m setup' }, { label:'5m trigger' }, { label:'Your levels' }],

    questions: [
      { id:'instrument', stage:0, type:'instrument', short:'Instrument',
        q:'What are you scalping?',
        help:'Pick the chart you have open. Gold, NAS100 and US30 move the most in the kill zones; majors like EURUSD and GBPUSD give the cleanest sweeps.',
        groups:[
          ['Metals', [['XAUUSD','Gold'],['XAGUSD','Silver']]],
          ['Indices', [['NAS100','Nasdaq'],['US30','Dow Jones'],['SPX500','S&P 500'],['GER40','DAX'],['UK100','FTSE 100']]],
          ['Forex', [['EURUSD','Euro'],['GBPUSD','Cable'],['USDJPY','Yen'],['GBPJPY','Guppy'],['EURJPY','Euro/Yen'],['AUDUSD','Aussie'],['USDCAD','Loonie'],['USDZAR','Rand']]],
          ['Energy & Crypto', [['USOIL','WTI Oil'],['BTCUSD','Bitcoin']]]
        ] },

      { id:'session', stage:0, type:'single', short:'Session', tf:'SAST',
        q:'Which session window are you in right now?',
        help:'<b>Scalps only work when the big banks are active.</b> The kill zones are the first hours of London and New York — that is when the Asian range and yesterday\'s high/low get swept. Times below are already converted to SAST for today, daylight saving included.',
        ref:'ex-trading-session-times-sast',
        live: s => `<div class="ut-live">${sessionBar(s)}<div style="width:100%;display:flex;flex-wrap:wrap;gap:6px 14px;">
            <span>London KZ <b>${s.fmt(s.lo)}</b></span><span>New York KZ <b>${s.fmt(s.ny)}</b></span>
            <span>Now <b class="${s.cur ? 'now' : ''}">${s.nowTxt} SAST${s.cur ? ' · in the ' + (s.cur === 'london' ? 'London' : 'New York') + ' kill zone' : ''}</b></span>
            ${s.weekend ? '<span style="color:var(--bear)">Weekend — FX & metals are closed</span>' : ''}</div></div>`,
        options:[
          { v:'london', l:'London kill zone', sub:'First 3 hours of London. Sweeps of the Asian high/low happen here.', dir:0, pts:10, ai:'London kill zone (London open)',
            check: s => s.cur === 'london' ? null : `Clock says ${s.nowTxt} SAST — the London kill zone is ${s.fmt(s.lo)}. Only enter inside it.` },
          { v:'ny', l:'New York kill zone', sub:'NY open + overlap with London. Biggest volume of the day.', dir:0, pts:10, ai:'New York kill zone (NY open, London overlap)',
            check: s => s.cur === 'ny' ? null : `Clock says ${s.nowTxt} SAST — the New York kill zone is ${s.fmt(s.ny)}. Only enter inside it.` },
          { v:'between', l:'Between kill zones', sub:'London lunch or late NY. Moves are slow and fake.', dir:0, pts:0, gate:'wait', why:'Outside the kill zones the sweep-and-reverse rarely follows through. Prepare now, enter only when the next kill zone opens.', ai:'between kill zones (low-volume window)' },
          { v:'asia', l:'Asian session / after NY close', sub:'Thin volume. This is when the range BUILDS, not when we trade it.', dir:0, pts:0, gate:'block', why:'Blue Mac never scalps the Asian session or after the NY close — mark the Asian high and low instead and come back for London.' }
        ] },

      { id:'news', stage:0, type:'single', short:'News', compact:true,
        q:'Any red-folder (high-impact) news for this instrument within 30 minutes?',
        help:'Check <b>ForexFactory</b> or <b>Investing.com</b>. Gold, indices and USD pairs react to <b>USD</b> news (NFP, CPI, FOMC). A news spike can jump straight through your stop.',
        hero: () => D.ref('mgt-news'), heroCap:'Spreads widen and price spikes both ways around red-folder news', ref:'mgt-news',
        options:[
          { v:'clear', l:'No — calendar is clear', sub:'Nothing high-impact in the next 30 minutes and none in the last 30.', dir:0, pts:5, ai:'no high-impact news within 30 minutes' },
          { v:'soon', l:'Yes — news within 30 minutes', sub:'Or it was released less than 30 minutes ago.', dir:0, pts:0, gate:'block', why:'The 30-minute rule: no new scalps 30 minutes before or after high-impact news. Wait for the spike to settle, then re-run uTrade Ideas.' }
        ] },

      { id:'discipline', stage:0, type:'single', short:'Discipline', compact:true,
        q:'How has today gone so far?',
        help:'Your edge only works if you are calm. <b>Three losses in a day is a hard stop</b> — revenge trading is how accounts are lost.',
        ref:'mgt-sizing',
        options:[
          { v:'fresh', l:'First trade, or 0–1 losses', sub:'Clear head, normal risk.', dir:0, pts:5, ai:'fresh — 0 or 1 losses today' },
          { v:'two', l:'2 losses today', sub:'Allowed, but cut your risk in half on this one.', dir:0, pts:2, warn:'2 losses today — halve your risk on this trade', ai:'2 losses today — trading at half risk' },
          { v:'stop', l:'3 losses, or daily loss limit hit', sub:'Hard stop for today.', dir:0, pts:0, gate:'block', why:'Three losses (or your daily limit) = done for the day. Close the charts, journal the trades, come back next session.' }
        ] },

      { id:'h1_structure', stage:1, type:'single', short:'H1 structure', tf:'H1', bias:true,
        q:'Open the 1-hour chart. What is the market structure doing?',
        help:'Look at the last 3–4 swings. <b>Higher highs and higher lows</b> = uptrend, only look for longs. <b>Lower highs and lower lows</b> = downtrend, only shorts. A <b>CHoCH</b> is the first break of the opposite swing — an early trend change.',
        ref:'ex-market-structure-hh-hl-vs-ll-lh',
        options:[
          { v:'up', l:'Uptrend — HH & HL', sub:'Each high and low is higher than the last.', dg:C('structTrend', 1), dir:1, pts:20, ref:'smc-bos', ai:'H1 uptrend: higher highs and higher lows' },
          { v:'down', l:'Downtrend — LH & LL', sub:'Each high and low is lower than the last.', dg:C('structTrend', -1), dir:-1, pts:20, ref:'smc-bos', ai:'H1 downtrend: lower highs and lower lows' },
          { v:'choch_up', l:'Bullish CHoCH', sub:'Downtrend just broke above its last lower high.', dg:C('choch', 1), dir:1, pts:14, ref:'smc-choch', warn:'H1 trend change is fresh (CHoCH) — expect a retest before it runs', ai:'H1 bullish change of character — broke the last lower high' },
          { v:'choch_dn', l:'Bearish CHoCH', sub:'Uptrend just broke below its last higher low.', dg:C('choch', -1), dir:-1, pts:14, ref:'smc-choch', warn:'H1 trend change is fresh (CHoCH) — expect a retest before it runs', ai:'H1 bearish change of character — broke the last higher low' },
          { v:'range', l:'Ranging / choppy', sub:'Highs and lows overlap. No clear direction.', dg:C('range', 1), dir:0, pts:0, gate:'block', why:'No H1 direction = no scalp bias. Scalping chop is the fastest way to give money back. Wait for a break of the range.' }
        ] },

      { id:'h1_ema', stage:1, type:'single', short:'H1 50 EMA', tf:'H1', bias:true,
        q:'Where is price compared to the 50 EMA on the 1-hour chart?',
        help:'Add a <b>50-period EMA</b> to the H1. Price holding <b>above a rising EMA</b> confirms longs; <b>below a falling EMA</b> confirms shorts. A flat EMA that price keeps crossing means there is no trend.',
        ref:'ind-ema',
        options:[
          { v:'above', l:'Above a rising 50 EMA', sub:'EMA slopes up, pullbacks bounce off it.', dg:C('emaTrend', 1), dir:1, pts:10, ai:'price above a rising H1 50 EMA' },
          { v:'below', l:'Below a falling 50 EMA', sub:'EMA slopes down, rallies reject it.', dg:C('emaTrend', -1), dir:-1, pts:10, ai:'price below a falling H1 50 EMA' },
          { v:'flat', l:'Flat — price crossing it', sub:'EMA is sideways, candles cut through it.', dg:C('emaFlat', 1), dir:0, pts:2, warn:'H1 50 EMA is flat — trend strength is weak, take TP1 quickly', ai:'H1 50 EMA flat with price crossing it — weak trend' }
        ] },

      { id:'h1_pd', stage:1, type:'single', short:'Premium / discount', tf:'H1', align:'soft',
        q:'Draw a fib from the last H1 swing low to swing high. Where is price?',
        help:'Above the <b>50% line is premium</b> (expensive — where banks sell). Below <b>50% is discount</b> (cheap — where banks buy). Buy in discount, sell in premium.',
        ref:'smc-pd',
        options:[
          { v:'discount', l:'In discount (below 50%)', sub:'Cheap side of the range — good for longs.', dg:() => pdDg('discount'), dir:1, pts:10, ai:'price is in H1 discount (below the 50% level) — favours longs' },
          { v:'premium', l:'In premium (above 50%)', sub:'Expensive side of the range — good for shorts.', dg:() => pdDg('premium'), dir:-1, pts:10, ai:'price is in H1 premium (above the 50% level) — favours shorts' },
          { v:'eq', l:'Right at 50% (equilibrium)', sub:'Fair value — no edge either way.', dg:() => pdDg('eq'), dir:0, pts:4, warn:'Price is at equilibrium — the best scalps start from premium or discount', ai:'price at H1 equilibrium (50%)' }
        ] },

      { id:'sweep', stage:2, type:'single', short:'Liquidity sweep', tf:'15m', align:'critical',
        q:'On the 15-minute chart: has price just swept liquidity?',
        help:'Stops cluster just beyond the <b>Asian high/low</b>, <b>yesterday\'s high/low (PDH/PDL)</b> and <b>equal highs/lows</b>. A sweep is a wick through that level that <b>closes back inside</b>. That is the banks filling their orders — our signal to trade the other way.',
        ref:'smc-judas',
        options:[
          { v:'ssl', l:'Swept the lows, closed back inside', sub:'Wick below Asian low / PDL / equal lows → snap back up.', dg:C('sweep', 1), dir:1, pts:20, ref:'smc-sweep', ai:'15m swept sell-side liquidity (below the Asian low / PDL / equal lows) and closed back inside — Judas swing' },
          { v:'bsl', l:'Swept the highs, closed back inside', sub:'Wick above Asian high / PDH / equal highs → snap back down.', dg:C('sweep', -1), dir:-1, pts:20, ref:'smc-sweep', ai:'15m swept buy-side liquidity (above the Asian high / PDH / equal highs) and closed back inside — Judas swing' },
          { v:'bos', l:'No sweep — clean break with the trend', sub:'Price broke structure in the trend direction and kept going.', dg:C('contin', 1), dir:0, pts:10, ref:'smc-bos', warn:'No liquidity sweep — continuation entries need the pullback into the zone to hold', ai:'no sweep — clean 15m break of structure in the trend direction (continuation)' },
          { v:'none', l:'Nothing yet — price mid-range', sub:'No level has been taken. Price is drifting in the middle.', dg:C('midRange', 1), dir:0, pts:0, gate:'wait', why:'No liquidity has been taken yet. Mark the Asian high/low and PDH/PDL, set alerts, and wait for one to be swept.', ai:'no sweep yet — price is mid-range' }
        ] },

      { id:'poi', stage:2, type:'single', short:'15m zone', tf:'15m', align:'critical',
        q:'Where is price reacting from on the 15-minute chart?',
        help:'After the sweep, price needs a <b>zone</b> to enter from — the footprint the banks left. Pick the one price is sitting in (or about to tap). <b>No zone = no entry</b>, however good the rest looks.',
        ref:'smc-ob-what',
        options:[
          { v:'ob_bull', l:'Bullish order block', sub:'Last red candle before the strong move up.', dg:C('ob', 1), dir:1, pts:20, ref:'smc-ob-bull', ai:'15m bullish order block (last down candle before displacement up)' },
          { v:'fvg_bull', l:'Bullish fair value gap', sub:'Gap left by a fast candle up — price fills it, then goes.', dg:C('fvg', 1), dir:1, pts:18, ref:'smc-fvg-bull', ai:'15m bullish fair value gap' },
          { v:'flip_bull', l:'Old resistance → new support', sub:'Price broke a level and is retesting it from above.', dg:C('flip', 1), dir:1, pts:14, ref:'smc-snd', ai:'15m resistance-turned-support flip (break and retest)' },
          { v:'ob_bear', l:'Bearish order block', sub:'Last green candle before the strong move down.', dg:C('ob', -1), dir:-1, pts:20, ref:'smc-ob-bear', ai:'15m bearish order block (last up candle before displacement down)' },
          { v:'fvg_bear', l:'Bearish fair value gap', sub:'Gap left by a fast candle down — price fills it, then drops.', dg:C('fvg', -1), dir:-1, pts:18, ref:'smc-fvg-bear', ai:'15m bearish fair value gap' },
          { v:'flip_bear', l:'Old support → new resistance', sub:'Price broke a level and is retesting it from below.', dg:C('flip', -1), dir:-1, pts:14, ref:'smc-snd', ai:'15m support-turned-resistance flip (break and retest)' },
          { v:'none', l:'No zone — open space', sub:'Price is between levels with nothing underneath it.', dg:C('noZone', 1), dir:0, pts:0, gate:'wait', why:'Entering in open space means your stop has nothing protecting it. Wait for price to reach an order block, FVG or flipped level.', ai:'no clear 15m zone — price in open space' }
        ] },

      { id:'trigger', stage:3, type:'single', short:'5m trigger', tf:'5m', align:'critical',
        q:'Drop to the 5-minute chart. What has the last closed candle done in the zone?',
        help:'The zone tells you <b>where</b>. The 5m tells you <b>when</b>. The strongest trigger is a <b>5m CHoCH</b> — price breaks the last mini swing and leaves an FVG behind. Only count candles that have <b>closed</b>.',
        ref:'smc-choch',
        options:[
          { v:'choch_bull', l:'Bullish 5m CHoCH + FVG', sub:'Broke the last lower high with a strong candle that left a gap.', dg:C('trigChoch', 1), dir:1, pts:22, ref:'smc-ob-fvg', ai:'5m bullish change of character with displacement and a fresh FVG' },
          { v:'eng_bull', l:'Bullish engulfing / pin bar', sub:'Strong rejection candle closed inside the zone.', dg:C('trigEngulf', 1), dir:1, pts:15, ref:'ex-bullish-candlestick-signals', ai:'5m bullish engulfing / pin bar rejection inside the zone' },
          { v:'choch_bear', l:'Bearish 5m CHoCH + FVG', sub:'Broke the last higher low with a strong candle that left a gap.', dg:C('trigChoch', -1), dir:-1, pts:22, ref:'smc-ob-fvg', ai:'5m bearish change of character with displacement and a fresh FVG' },
          { v:'eng_bear', l:'Bearish engulfing / shooting star', sub:'Strong rejection candle closed inside the zone.', dg:C('trigEngulf', -1), dir:-1, pts:15, ref:'ex-bearish-candlestick-signals', ai:'5m bearish engulfing / shooting star rejection inside the zone' },
          { v:'none', l:'No signal yet', sub:'Small candles, still grinding in the zone.', dg:C('trigNone', 1), dir:0, pts:0, gate:'wait', why:'The zone has not confirmed. Set an alert and wait for a 5m CHoCH or a strong rejection candle to CLOSE.', ai:'no 5m confirmation yet' }
        ] },

      { id:'confluence', stage:3, type:'multi', short:'Confluence', tf:'5m', max:15, compact:true,
        q:'Tick every extra confirmation you can see. (Skip if none.)',
        help:'Each one adds evidence in the direction of your trade. You don\'t need all of them — <b>two or three is a strong scalp</b>.',
        options:[
          { v:'vwap', l:'Price on the right side of VWAP', sub:'Above VWAP for longs, below for shorts.', dg:() => D.ref('ind-vwap'), pts:6, ref:'ind-vwap', ai:'price on the correct side of session VWAP' },
          { v:'ema', l:'5m 9 EMA crossed the 21 EMA', sub:'In the direction of your trade.', dg:() => D.ref('ind-ema'), pts:5, ref:'ind-ema', ai:'5m 9 EMA crossed the 21 EMA in the trade direction' },
          { v:'div', l:'RSI divergence at the sweep', sub:'Price made a new extreme, RSI did not.', dg:() => D.ref(UT.bias() < 0 ? 'ind-rsi-bear-div' : 'ind-rsi-bull-div'), pts:5, ref:'ind-rsi-bull-div', ai:'RSI divergence at the sweep' },
          { v:'level', l:'Round number or PDH/PDL at the zone', sub:'e.g. 2350.00, 1.1000, yesterday\'s high/low.', dg:() => D.ref('ind-pdhl'), pts:4, ref:'ind-round', ai:'zone lines up with a round number or PDH/PDL' },
          { v:'dxy', l:'DXY agrees (USD pairs, gold, indices)', sub:'Dollar index moving the opposite way to your long.', dg:() => D.ref('mgt-dxy'), pts:4, ref:'mgt-dxy', ai:'DXY confirms the direction' },
          { v:'vol', l:'Volume spike on the sweep', sub:'Big volume bar on the sweep candle.', dg:() => D.ref('ind-volume'), pts:4, ref:'ind-volume', ai:'volume spike on the sweep candle' }
        ] },

      { id:'levels', stage:4, type:'levels', short:'Levels',
        q:'Type the prices from your 15-minute chart.',
        help:'Blue Mac calculates your entries, stop and targets from these — the AI does not guess numbers. Your <b>stop goes beyond the swing</b> that was swept; <b>targets are the liquidity</b> on the other side.',
        hero: C('levels', 1), heroCap:'Swing low = where the long stop hides · Swing high / liquidity above = long targets (and the reverse for shorts)', ref:'mgt-rr',
        fields:[
          { id:'price', label:'Current price', req:true, hint:'The live bid on your chart right now.' },
          { id:'swing_hi', label:'15m swing high', req:true, hint:'The most recent 15m high — or the high that was swept. Short stops go above it.' },
          { id:'swing_lo', label:'15m swing low', req:true, hint:'The most recent 15m low — or the low that was swept. Long stops go below it.' },
          { id:'zone_hi', label:'Zone top', hint:'Top edge of your order block / FVG / flip level.' },
          { id:'zone_lo', label:'Zone bottom', hint:'Bottom edge of the same zone.' },
          { id:'liq_up', label:'Liquidity above', hint:'Asian high, PDH or equal highs above price — long target.' },
          { id:'liq_dn', label:'Liquidity below', hint:'Asian low, PDL or equal lows below price — short target.' }
        ],
        shots:['H1 chart', '15m chart', '5m chart'],
        check(L, num){
          const hi = num(L.swing_hi), lo = num(L.swing_lo), p = num(L.price);
          if(hi <= lo) return 'Your swing high must be above your swing low.';
          if(p > hi * 1.02 || p < lo * 0.98) return 'Current price is far outside your swing high and low — use the swing points from the current 15m leg.';
          if(L.zone_hi && L.zone_lo && num(L.zone_hi) <= num(L.zone_lo)) return 'Zone top must be above zone bottom.';
          return null;
        } }
    ],

    // Entries, stop and structural targets for each direction
    levelMap(dir, L, num){
      const p = num(L.price), hi = num(L.swing_hi), lo = num(L.swing_lo);
      if(![p, hi, lo].every(isFinite)) return null;
      const zh = num(L.zone_hi), zl = num(L.zone_lo), hasZone = isFinite(zh) && isFinite(zl);
      const buf = (hi - lo) * 0.04;
      let e1 = p, e2, e1why = 'market price', e2why;
      const sl = dir > 0 ? lo - buf : hi + buf;
      const slwhy = dir > 0 ? 'below the 15m swing low + buffer' : 'above the 15m swing high + buffer';
      // the zone only counts if it is on the correct side of price for this direction
      const zoneOk = hasZone && (dir > 0 ? zl < p && zl > sl : zh > p && zh < sl);
      if(zoneOk){
        const prox = dir > 0 ? Math.min(zh, p) : Math.max(zl, p);
        e1 = prox; e1why = (dir > 0 ? zh >= p : zl <= p) ? 'price is inside the zone' : 'limit at the zone edge';
        e2 = (zh + zl) / 2; e2why = '50% of the zone (consequent encroachment)';
        if(dir * (e1 - e2) <= 0){ e2 = e1 - dir * (e1 - sl) * 0.4; e2why = 'deeper in the zone, above the stop'; }
      } else { e2 = e1 - dir * (e1 - sl) * 0.5; e2why = 'halfway to the stop (better price)'; }
      const tg = (dir > 0 ? [[hi, '15m swing high (buy-side liquidity)'], [num(L.liq_up), 'liquidity above you marked']]
                          : [[lo, '15m swing low (sell-side liquidity)'], [num(L.liq_dn), 'liquidity below you marked']])
        .filter(t => isFinite(t[0]) && dir * (t[0] - e1) > 0).sort((a, b) => dir * (a[0] - b[0]));
      return { e1, e2, sl, e1why, e2why, slwhy, t1: tg[0] ? tg[0][0] : NaN, t1why: tg[0] ? tg[0][1] : '', t2: tg[1] ? tg[1][0] : NaN, t2why: tg[1] ? tg[1][1] : '' };
    },

    prompt(x){
      return `You are a professional intraday scalper who trades the "Session Liquidity Scalp" for Blue Mac, a South African trading platform. Your reader may be a beginner — explain like a mentor, simply and precisely.

THE STRATEGY:
1. H1 sets the bias (structure + 50 EMA + premium/discount). Only trade with it.
2. In the London or New York kill zone, wait for the 15m chart to sweep liquidity (Asian high/low, PDH/PDL, equal highs/lows) and close back inside.
3. Enter from a 15m order block, FVG or flipped level after the sweep.
4. Confirm on the 5m: a change of character with displacement (best) or a strong engulfing / pin bar that has closed.
5. Stop beyond the swept swing. Targets are the liquidity on the other side. TP1 at least 1:2, TP2 at least 1:3, Entry 2 always between Entry 1 and the stop.
6. Take partials at TP1 and move the stop to breakeven. A scalp that has not moved within about 60 minutes is closed.

THE TRADER'S SETUP:
Instrument: ${x.instrument}
Time now: ${x.session.nowTxt} SAST (London kill zone ${x.session.fmt(x.session.lo)}, New York kill zone ${x.session.fmt(x.session.ny)})
H1 bias: ${x.bias}
Blue Mac score: ${x.score}/100 — ${x.grade}
Status: ${x.status}
${x.answers}

Trader's chart prices:
${x.levels}

Open gates / warnings: ${x.gates}; ${x.warns}

ENGINE PLAN — LONG: ${x.longPlan}
ENGINE PLAN — SHORT: ${x.shortPlan}

The ${x.bias === 'BULLISH' ? 'LONG' : 'SHORT'} idea is with the H1 bias and is the main trade. The other one is counter-trend: explain honestly why it is weaker and what would have to change before it is valid.
If chart screenshots are attached, use them to sharpen the signal, wait condition and invalidation, but never change the engine's prices.`;
    }
  });

  // premium / discount mini diagram (not mirrored — the price position changes)
  function pdDg(where){
    const end = { discount:102.8, premium:109.4, eq:106 }[where];
    return BMX.render({
      n:40, seed:41, noise:0.35, wick:0.55,
      pts:[[0,104],[5,100.2],[18,112],[24,110],[30,107],[36,end + (where === 'premium' ? -0.6 : where === 'discount' ? 0.6 : 0.4)],[39,end]],
      boxes:[{ i1:5, i2:39, p1:106, p2:112, c:'bear', op:0.09 }, { i1:5, i2:39, p1:100, p2:106, c:'bull', op:0.09 }],
      ov:[{ t:'level', p:106, c:'silver', l:'50% EQ', dash:'3,3' }, { t:'level', p:112, c:'bear', l:'PREMIUM', w:0.8 }, { t:'level', p:100.2, c:'bull', l:'DISCOUNT', w:0.8 }],
      marks:[{ t:'dot', i:39, p:end, c:'amber', r:3.6 }]
    });
  }
})();
