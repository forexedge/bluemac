// ══════════════════════════════════════════════════════
// BLUE MAC — QUICK IDEA · CONCEPT BLOCKS (window.BMQ)
// Step 2 of the personal trade idea generator (16 Oct 2026).
//
// Every concept a member can pick in My Trading DNA (dna.js) is a BLOCK:
// its own question(s), example diagrams, score weight and price fields.
// BMQ.build(dna) assembles the member's blocks into ONE personal strategy
// and registers it with the uTrade engine as style 'quick' — so grading,
// gates, engine-calculated prices, spread-adjusted R:R, Entry 2 inside the
// stop, lot sizing and the AI write-up all work exactly like the 5 styles.
//
//   BMQ.build(dna?)  → the strategy definition (registered as UT 'quick')
//   BMQ.plan(dna?)   → { questions:[short…], entryTF, biasTF, minRR } (for previews/tests)
//   BMQ.BLOCKS       → which concepts have blocks
//
// Zone concepts (OB, FVG, S&R, fib, patterns) merge into ONE zone question
// with only the member's options — OB + FVG adds "order block with an FVG inside".
// ══════════════════════════════════════════════════════
window.BMQ = (function(){
  if(!window.UT) return null;
  const D = UT.D, C = UT.C, pdDg = UT.pdDg;

  // ── Timeframes ──
  const LADDER = ['1m', '5m', '15m', 'H1', 'H4', 'D1', 'W1'];
  const BIAS_OF = { '1m':'15m', '5m':'H1', '15m':'H4', 'H1':'D1', 'H4':'D1', 'D1':'W1' };
  const NAME = { '1m':'1-minute', '5m':'5-minute', '15m':'15-minute', 'H1':'1-hour', 'H4':'4-hour', 'D1':'daily', 'W1':'weekly' };
  // Blue Mac minimum R:R by holding time — the same table as the 5 styles
  const RR_OF = tf => ({ '1m':[2,3], '5m':[2,3], '15m':[2,3], 'H1':[2,3], 'H4':[3,4], 'D1':[3,5] })[tf] || [2,3];
  const ZONES = ['ob', 'fvg', 'sr', 'fib', 'patterns'];

  let DNA = null, LAST = null;          // the DNA the current strategy was built from + that strategy
  const ans = () => (UT._st && UT._st.ans) || {};
  // entry chart: the member's only one, or the one they picked on the first question
  function etf(A){ const t = DNA && DNA.tfs || []; const a = (A || ans()).chart; return t.includes(a) ? a : (t.slice().sort((x, y) => LADDER.indexOf(x) - LADDER.indexOf(y))[0] || '15m'); }
  const btf = A => BIAS_OF[etf(A)] || 'H4';
  const fast = A => LADDER.indexOf(etf(A)) <= 2;          // 15m and below: sessions matter

  // ── Blocks ──────────────────────────────────────────────
  // Each returns a question (or null). Text can be a function of the answers (A => …).
  const B = {};

  B.chart = d => d.tfs.length < 2 ? null : {
    id:'chart', stage:0, type:'single', short:'Entry chart', compact:true,
    q:'Which chart are you trading off right now?',
    help:'You told Blue Mac you enter on two charts. Every question after this one names the chart you pick.',
    options: d.tfs.slice().sort((a, b) => LADDER.indexOf(a) - LADDER.indexOf(b)).map(t => ({ v:t, l:`${t} entries`, sub:`Bias from the ${BIAS_OF[t]} chart · TP1 ≥ 1:${RR_OF(t)[0]}`, dir:0, noScore:true, ai:`entries on the ${NAME[t]} chart` }))
  };

  B.instrument = d => {
    const mine = d.instr || [], all = [].concat(...UT.INSTR.map(g => g[1]));
    const nick = s => (all.find(x => x[0] === s) || [s, ''])[1];
    const groups = mine.length ? [['Your markets', mine.map(s => [s, nick(s)])]] : [];
    UT.INSTR.forEach(([g, list]) => { const rest = list.filter(x => !mine.includes(x[0])); if(rest.length) groups.push([g, rest]); });
    return { id:'instrument', stage:0, type:'instrument', short:'Instrument', q:'What are you trading?', help:'Your markets are at the top.', groups };
  };

  // one question instead of three: news + discipline (+ session for fast charts)
  B.safety = () => ({
    id:'safety', stage:0, type:'single', short:'Quick check', compact:true,
    q:'Quick safety check — which of these is true right now?',
    help:'<b>Red-folder news</b> (NFP, CPI, FOMC) within 30 minutes or <b>3 losses today</b> = no trade. Check ForexFactory if you are not sure.',
    live: s => fast() ? `<div class="ut-live"><span>London KZ <b>${s.fmt(s.lo)}</b></span><span>New York KZ <b>${s.fmt(s.ny)}</b></span><span>Now <b class="${s.cur ? 'now' : ''}">${s.nowTxt} SAST</b></span>${s.weekend ? '<span style="color:var(--bear)">Weekend — FX & metals are closed</span>' : ''}</div>` : '',
    ref:'mgt-news',
    options:[
      { v:'clear', l:'All clear', sub:'No red news within 30 min, and 0–1 losses today.', dir:0, pts:6, ai:'no high-impact news within 30 minutes, 0–1 losses today',
        check: s => fast() && !s.cur ? `It is ${s.nowTxt} SAST — outside the London (${s.fmt(s.lo)}) and New York (${s.fmt(s.ny)}) kill zones. Fast-chart setups follow through best inside them.` : null },
      { v:'two', l:'2 losses today', sub:'Allowed — but this one is at half risk.', dir:0, pts:3, halfRisk:true, warn:'2 losses today — half risk on this trade', ai:'2 losses today — half risk' },
      { v:'news', l:'Red news within 30 minutes', sub:'Or it came out less than 30 minutes ago.', dir:0, pts:0, gate:'block', why:'No new trades 30 minutes either side of high-impact news. Spreads widen and spikes run through stops. Come back after it settles.' },
      { v:'stop', l:'3 losses today (or daily limit hit)', sub:'Hard stop for today.', dir:0, pts:0, gate:'block', why:'Three losses = done for the day. Journal the trades and come back next session.' }
    ]
  });

  B.bias = () => ({
    id:'bias', stage:1, type:'single', short:'Bias', bias:true, tf: A => btf(A),
    q: A => `Open the ${btf(A)} chart. Which way is it going?`,
    help:'Look at the last 3–4 swings. <b>Higher highs & higher lows</b> = longs only. <b>Lower highs & lower lows</b> = shorts only. A <b>CHoCH</b> is the first break the other way.',
    ref:'ex-market-structure-hh-hl-vs-ll-lh',
    options:[
      { v:'up', l:'Uptrend — HH & HL', sub:'Each high and low is higher than the last.', dg:C('structTrend', 1), dir:1, pts:20, ref:'smc-bos', ai:'higher-timeframe uptrend (HH/HL)' },
      { v:'down', l:'Downtrend — LH & LL', sub:'Each high and low is lower than the last.', dg:C('structTrend', -1), dir:-1, pts:20, ref:'smc-bos', ai:'higher-timeframe downtrend (LH/LL)' },
      { v:'choch_up', l:'Just turned up (CHoCH)', sub:'Broke above the last lower high.', dg:C('choch', 1), dir:1, pts:14, ref:'smc-choch', warn:'The trend change is fresh — expect a retest before it runs', ai:'fresh bullish change of character on the higher timeframe' },
      { v:'choch_dn', l:'Just turned down (CHoCH)', sub:'Broke below the last higher low.', dg:C('choch', -1), dir:-1, pts:14, ref:'smc-choch', warn:'The trend change is fresh — expect a retest before it runs', ai:'fresh bearish change of character on the higher timeframe' },
      { v:'range', l:'Sideways / choppy', sub:'Highs and lows overlap.', dg:C('range', 1), dir:0, pts:0, gate:'block', why:'No direction on the higher timeframe = no bias = no trade. Wait for the range to break.' }
    ]
  });

  B.ma = () => ({
    id:'ma', stage:1, type:'single', short:'50/200 MAs', bias:true, tf: A => btf(A),
    q: A => `On the ${btf(A)} chart, where is price against the 50 and 200 SMA?`,
    help:'50 & 200 <b>Simple</b> moving averages on Close (same as the Setup Guide). 50 above 200 with price above both = bullish stack.',
    ref:'ex-ma-stack-50-vs-200',
    options:[
      { v:'bull', l:'Above both — 50 over 200', sub:'Bullish stack, both sloping up.', dg:C('maStack', 1), dir:1, pts:12, ai:'price above the 50 and 200 SMA, 50 above 200 (bullish stack)' },
      { v:'bear', l:'Below both — 50 under 200', sub:'Bearish stack, both sloping down.', dg:C('maStack', -1), dir:-1, pts:12, ai:'price below the 50 and 200 SMA, 50 below 200 (bearish stack)' },
      { v:'mixed', l:'Mixed / tangled', sub:'Price between them or the MAs are crossing.', dg:C('maMixed', 1), dir:0, pts:3, warn:'MAs are mixed — trend support is weak, take TP1 quickly', ai:'50/200 SMA mixed — no clean stack' }
    ]
  });

  B.pd = () => ({
    id:'pd', stage:1, type:'single', short:'Premium / discount', align:'soft', tf: A => btf(A),
    q: A => `Fib the last ${btf(A)} swing. Is price in premium or discount?`,
    help:'Below 50% = <b>discount</b> (buy side). Above 50% = <b>premium</b> (sell side).',
    ref:'smc-pd',
    options:[
      { v:'discount', l:'Discount (below 50%)', sub:'Cheap — favours longs.', dg:() => pdDg('discount'), dir:1, pts:8, ai:'price in discount — favours longs' },
      { v:'premium', l:'Premium (above 50%)', sub:'Expensive — favours shorts.', dg:() => pdDg('premium'), dir:-1, pts:8, ai:'price in premium — favours shorts' },
      { v:'eq', l:'Right at 50%', sub:'No edge either way.', dg:() => pdDg('eq'), dir:0, pts:3, warn:'Price is at equilibrium — the best entries start from premium or discount', ai:'price at equilibrium' }
    ]
  });

  B.sweep = () => ({
    id:'sweep', stage:2, type:'single', short:'Liquidity sweep', align:'critical', tf: A => etf(A),
    q: A => `On the ${etf(A)} chart: has price just swept liquidity?`,
    help:'Stops sit beyond the <b>Asian high/low</b>, <b>PDH/PDL</b> and <b>equal highs/lows</b>. A sweep wicks through and <b>closes back inside</b>.',
    ref:'smc-sweep',
    options:[
      { v:'ssl', l:'Swept the lows, closed back inside', sub:'Stops below taken → snap back up.', dg:C('sweep', 1), dir:1, pts:18, ref:'smc-sweep', ai:'swept sell-side liquidity and closed back inside' },
      { v:'bsl', l:'Swept the highs, closed back inside', sub:'Stops above taken → snap back down.', dg:C('sweep', -1), dir:-1, pts:18, ref:'smc-sweep', ai:'swept buy-side liquidity and closed back inside' },
      { v:'bos', l:'No sweep — clean break with the trend', sub:'Continuation, no stop hunt.', dg:C('contin', 1), dir:0, pts:9, warn:'No sweep — a continuation entry needs the zone to hold', ai:'no sweep — continuation break' },
      { v:'none', l:'Nothing swept yet', sub:'Price drifting mid-range.', dg:C('midRange', 1), dir:0, pts:0, gate:'wait', why:'No liquidity taken yet. Mark the Asian high/low and PDH/PDL, set alerts, wait for a sweep.', ai:'no sweep yet' }
    ]
  });

  B.structure = () => ({
    id:'structure', stage:2, type:'single', short:'Structure break', align:'critical', tf: A => etf(A),
    q: A => `On the ${etf(A)} chart: has price broken structure your way?`,
    help:'<b>BOS</b> = breaks the last swing in the trend direction. <b>CHoCH</b> = the first break against the old move. Count closed candles only.',
    ref:'smc-choch',
    options:[
      { v:'bos_bull', l:'Bullish BOS — then pulled back', sub:'Broke the last high, now retracing.', dg:C('bosPull', 1), dir:1, pts:15, ref:'smc-bos', ai:'bullish break of structure, now pulling back' },
      { v:'choch_bull', l:'Bullish CHoCH', sub:'Broke the last lower high — turning up.', dg:C('choch', 1), dir:1, pts:15, ref:'smc-choch', ai:'bullish change of character on the entry chart' },
      { v:'bos_bear', l:'Bearish BOS — then pulled back', sub:'Broke the last low, now retracing.', dg:C('bosPull', -1), dir:-1, pts:15, ref:'smc-bos', ai:'bearish break of structure, now pulling back' },
      { v:'choch_bear', l:'Bearish CHoCH', sub:'Broke the last higher low — turning down.', dg:C('choch', -1), dir:-1, pts:15, ref:'smc-choch', ai:'bearish change of character on the entry chart' },
      { v:'none', l:'No break yet', sub:'Still inside the last swing.', dg:C('range', 1), dir:0, pts:0, gate:'wait', why:'Wait for a closed break of structure in your direction — that is the footprint of the move starting.', ai:'no structure break yet' }
    ]
  });

  B.keyrange = () => ({
    id:'keyrange', stage:2, type:'single', short:'Key Range', align:'critical', tf:'15m',
    q:'What has price done with the Key Range?',
    help:'The <b>Key Range</b> is the high and low of the first 15 minutes after the Asia, London or New York open. It is tradeable for 2 hours. A <b>Key Break</b> closes outside it; the <b>Key Retest</b> comes back to the edge.',
    ref:'mgt-keyrange',
    live: s => `<div class="ut-live">${['asia', 'london', 'ny'].map(k => { const x = s.key[k]; return `<span>${k === 'ny' ? 'New York' : k === 'asia' ? 'Asia' : 'London'} <b>${s.hm(x.open)}</b> SAST${x.k === 'ready' ? ` · <b class="now">live, ${s.dur(x.left)} left</b>` : x.k === 'forming' ? ` · forming (${x.left} min)` : ''}</span>`; }).join('')}</div>`,
    options:[
      { v:'break_up', l:'Key Break up — retest holding', sub:'15m closed above the range, came back to the top edge.', dg:C('krBreak', 1), dir:1, pts:14, ref:'mgt-keybreak', ai:'Key Break above the Key Range with a retest of the top edge',
        check: s => ['asia', 'london', 'ny'].some(k => s.key[k].k === 'ready') ? null : 'No Key Range is live right now — each one is tradeable for 2 hours after its open.' },
      { v:'break_dn', l:'Key Break down — retest holding', sub:'15m closed below the range, came back to the bottom edge.', dg:C('krBreak', -1), dir:-1, pts:14, ref:'mgt-keybreak', ai:'Key Break below the Key Range with a retest of the bottom edge',
        check: s => ['asia', 'london', 'ny'].some(k => s.key[k].k === 'ready') ? null : 'No Key Range is live right now — each one is tradeable for 2 hours after its open.' },
      { v:'fake_lo', l:'Fake break below — back inside', sub:'Sellers trapped. Supports longs.', dg:C('krFake', -1), dir:1, pts:11, ref:'mgt-fakebreak', ai:'fake break below the Key Range, closed back inside — supports longs' },
      { v:'fake_hi', l:'Fake break above — back inside', sub:'Buyers trapped. Supports shorts.', dg:C('krFake', 1), dir:-1, pts:11, ref:'mgt-fakebreak', ai:'fake break above the Key Range, closed back inside — supports shorts' },
      { v:'inside', l:'Still inside the range', sub:'No break yet.', dg:C('krInside', 1), dir:0, pts:0, gate:'wait', why:'Wait for a 15m candle to close outside the Key Range, then for the retest.', ai:'still inside the Key Range' }
    ]
  });

  // the member's zone concepts merged into one question
  B.zone = d => {
    const z = ZONES.filter(c => d.concepts.includes(c)); if(!z.length) return null;
    const o = [], both = z.includes('ob') && z.includes('fvg');
    [1, -1].forEach(dir => {
      const s = dir > 0 ? 'bull' : 'bear', up = dir > 0;
      if(both) o.push({ v:'obfvg_' + s, l:`${up ? 'Bullish' : 'Bearish'} OB with an FVG inside`, sub:'The strongest zone — both footprints in one place.', dg:() => D.ref('smc-ob-fvg'), dir, pts:22, ref:'smc-ob-fvg', ai:`${up ? 'bullish' : 'bearish'} order block with a fair value gap inside it` });
      if(z.includes('ob')) o.push({ v:'ob_' + s, l:`${up ? 'Bullish' : 'Bearish'} order block`, sub:`Last ${up ? 'red' : 'green'} candle before the strong move ${up ? 'up' : 'down'}.`, dg:C('ob', dir), dir, pts:20, ref:up ? 'smc-ob-bull' : 'smc-ob-bear', ai:`${up ? 'bullish' : 'bearish'} order block` });
      if(z.includes('fvg')) o.push({ v:'fvg_' + s, l:`${up ? 'Bullish' : 'Bearish'} fair value gap`, sub:`Gap left by a fast candle ${up ? 'up' : 'down'}.`, dg:C('fvg', dir), dir, pts:18, ref:up ? 'smc-fvg-bull' : 'smc-fvg-bear', ai:`${up ? 'bullish' : 'bearish'} fair value gap` });
      if(z.includes('fib')) o.push({ v:'fib_' + s, l:'Golden pocket (0.618–0.65)', sub:`Pullback into the golden pocket of the last leg ${up ? 'up' : 'down'}.`, dg:C('fibGolden', dir), dir, pts:17, ref:'fib-golden', ai:`pullback into the 0.618–0.65 golden pocket (${up ? 'long' : 'short'})` });
      if(z.includes('sr')) o.push({ v:'flip_' + s, l:up ? 'Old resistance → new support' : 'Old support → new resistance', sub:'Broke a level, now retesting it.', dg:C('flip', dir), dir, pts:16, ref:'smc-snd', ai:`${up ? 'resistance-turned-support' : 'support-turned-resistance'} retest` });
      if(z.includes('patterns')) o.push({ v:'pat_' + s, l:up ? 'Double bottom / inverse H&S retest' : 'Double top / H&S retest', sub:'Neckline broke, price retesting it.', dg:() => D.ref(up ? 'pat-db' : 'pat-dt'), dir, pts:16, ref:up ? 'pat-db' : 'pat-dt', ai:`${up ? 'bullish reversal pattern' : 'bearish reversal pattern'} neckline retest` });
    });
    o.push({ v:'none', l:'No zone — open space', sub:'Nothing under price to lean on.', dg:C('noZone', 1), dir:0, pts:0, gate:'wait', why:'No zone = no protected stop. Wait for price to reach one of your zones.', ai:'no zone — open space' });
    return { id:'zone', stage:2, type:'single', short:'Your zone', align:'critical', tf: A => etf(A),
      q: A => `On the ${etf(A)} chart: which of your zones is price in?`,
      help:'Only your concepts are listed. Pick the one price is sitting in, or about to tap. <b>No zone = no entry.</b>',
      ref: z.includes('ob') ? 'smc-ob-what' : z.includes('fvg') ? 'smc-fvg-what' : z.includes('fib') ? 'fib-golden' : z.includes('sr') ? 'ex-support-and-resistance' : 'pat-hs',
      options:o };
  };

  B.trigger = d => {
    const choch = { v:'choch', l:'CHoCH + FVG', sub:'Broke the last mini swing with a strong candle that left a gap.', dir:'b', pts:22, ref:'smc-ob-fvg' };
    const eng = { v:'eng', l:'Engulfing / pin bar', sub:'Strong rejection candle closed in the zone.', dir:'b', pts:15 };
    // the member's favourite trigger goes first
    const order = d.concepts.includes('candles') && !d.concepts.includes('structure') ? [eng, choch] : [choch, eng];
    const o = [];
    [1, -1].forEach(dir => order.forEach(t => {
      const up = dir > 0, isC = t === choch;
      o.push({ v:t.v + (up ? '_bull' : '_bear'), l:`${up ? 'Bullish' : 'Bearish'} ${isC ? t.l : (up ? 'engulfing / pin bar' : 'engulfing / shooting star')}`, sub:t.sub,
        dg:C(isC ? 'trigChoch' : 'trigEngulf', dir), dir, pts:t.pts, ref:isC ? t.ref : (up ? 'ex-bullish-candlestick-signals' : 'ex-bearish-candlestick-signals'),
        ai:`${up ? 'bullish' : 'bearish'} ${isC ? 'change of character with displacement and a fresh FVG' : 'engulfing / rejection candle'} on the entry chart` });
    }));
    o.push({ v:'none', l:'No signal yet', sub:'Small candles, still grinding.', dg:C('trigNone', 1), dir:0, pts:0, gate:'wait', why:'Set an alert and wait for the confirmation candle to CLOSE.', ai:'no confirmation yet' });
    return { id:'trigger', stage:3, type:'single', short:'Trigger', align:'critical', tf: A => etf(A),
      q: A => `Last closed ${etf(A)} candle — what did it do?`,
      help:'The zone tells you <b>where</b>. The trigger tells you <b>when</b>. Only count candles that have closed.',
      ref:'smc-choch', options:o };
  };

  B.confluence = d => {
    const o = [];
    if(d.concepts.includes('rsi')) o.push({ v:'div', l:'RSI divergence', sub:'Price made a new extreme, RSI did not.', dg:() => D.ref(UT.bias() < 0 ? 'ind-rsi-bear-div' : 'ind-rsi-bull-div'), pts:6, ref:'ind-rsi-bull-div', ai:'RSI divergence at the zone' });
    if(d.concepts.includes('vwap')) o.push({ v:'vwap', l:'Right side of VWAP', sub:'Above for longs, below for shorts.', dg:() => D.ref('ind-vwap'), pts:6, ref:'ind-vwap', ai:'price on the correct side of VWAP' });
    if(!o.length) return null;
    o.push({ v:'level', l:'Round number or PDH/PDL at the zone', sub:'e.g. 2350.00 or yesterday\'s high.', dg:() => D.ref('ind-pdhl'), pts:4, ref:'ind-round', ai:'zone lines up with a round number or PDH/PDL' });
    return { id:'confluence', stage:3, type:'multi', short:'Confluence', max:12, compact:true, tf: A => etf(A),
      q:'Tick anything extra you can see. (Skip if none.)', help:'Extra evidence your way. Not required.', options:o };
  };

  B.levels = d => {
    const zone = ZONES.some(c => d.concepts.includes(c)), liq = d.concepts.includes('sweep') || d.concepts.includes('sr'), kr = d.concepts.includes('keyrange');
    const f = [
      { id:'price', label:'Current price', req:true, hint:'The live price on your chart.' },
      { id:'swing_hi', label: A => `${etf(A)} swing high`, req:true, hint:'The most recent high (or the one that was swept). Short stops go above it.' },
      { id:'swing_lo', label: A => `${etf(A)} swing low`, req:true, hint:'The most recent low (or the one that was swept). Long stops go below it.' }
    ];
    if(zone) f.push({ id:'zone_hi', label:'Zone top', hint:'Top edge of your zone.' }, { id:'zone_lo', label:'Zone bottom', hint:'Bottom edge of your zone.' });
    if(liq) f.push({ id:'liq_up', label:'Liquidity / level above', hint:'Asian high, PDH, equal highs or resistance — a long target.' }, { id:'liq_dn', label:'Liquidity / level below', hint:'Asian low, PDL, equal lows or support — a short target.' });
    if(kr) f.push({ id:'kr_hi', label:'Key Range high', hint:'High of the first 15 minutes after the open.' }, { id:'kr_lo', label:'Key Range low', hint:'Low of the first 15 minutes after the open.' });
    return { id:'levels', stage:4, type:'levels', short:'Levels',
      q: A => `Type the prices from your ${etf(A)} chart.`,
      help:'Blue Mac works out your entries, stop and targets from these — the AI never guesses numbers.',
      hero: C('levels', 1), heroCap:'Swing low = where the long stop hides · liquidity above = long targets (and the reverse for shorts)', ref:'mgt-rr',
      fields:f, shots:[`${btf()} chart`, `${etf()} chart`, 'Extra chart'],
      check(L, num){ return UT.stdCheck(L, num, etf()); } };
  };

  // order of the setup blocks (zone concepts merged into B.zone)
  const SETUP = ['keyrange', 'sweep', 'structure', 'zone'];
  const BIAS_EXTRA = ['ma', 'pd'];

  function build(dna){
    const d = DNA = Object.assign({ concepts:[], instr:[], sessions:[], tfs:[] }, dna || (window.BMD && BMD.get()) || {});
    if(!d.tfs.length) d.tfs = ['15m'];
    const qs = [B.chart(d), B.instrument(d), B.safety(d), B.bias(d)]
      .concat(BIAS_EXTRA.filter(c => d.concepts.includes(c)).map(c => B[c](d)))
      .concat(SETUP.filter(c => c === 'zone' || d.concepts.includes(c)).map(c => B[c](d)))
      .concat([B.trigger(d), B.confluence(d), B.levels(d)])
      .filter(Boolean);
    const names = d.concepts.map(c => ((window.BMD && BMD.CONCEPTS) || []).find(x => x[0] === c)).filter(Boolean).map(x => x[1]);
    const zone = ZONES.some(c => d.concepts.includes(c)), liq = d.concepts.includes('sweep') || d.concepts.includes('sr');
    const def = {
      name: 'Your Quick Idea',
      short: 'Quick Idea',
      color: 'var(--blue)',
      get tfs(){ return `${btf()} → ${etf()}`; },
      get biasTF(){ return btf(); },
      get entryTF(){ return NAME[etf()] || etf(); },
      get minRR(){ return RR_OF(etf()); },
      desc: `Built from your Trading DNA: ${names.join(', ') || 'your setup'}. Only the questions that matter to how you trade — then the same Blue Mac engine prices and risk rules.`,
      get pills(){ const m = RR_OF(etf()); return [`${qs.length} questions`, `${btf()} bias · ${etf()} entry`, `TP1 ≥ 1:${m[0]} · TP2 ≥ 1:${m[1]}`]; },
      know: [],
      stages: [{ label:'Quick check' }, { label:'Bias' }, { label:'Your setup' }, { label:'Trigger' }, { label:'Levels' }],
      questions: qs,
      levelMap(dir, L, num){
        return UT.stdLevels(dir, L, num, { tf: etf(),
          up: liq ? [['liq_up', 'level above you marked']] : [], dn: liq ? [['liq_dn', 'level below you marked']] : [],
          range: d.concepts.includes('keyrange') ? ['kr_hi', 'kr_lo', 'Key Range'] : null, ext: d.concepts.includes('fib') });
      },
      prompt(x){
        const m = RR_OF(etf());
        return `You are a professional trading mentor for Blue Mac, a South African trading platform. Your reader may be a beginner — explain simply and precisely.

THIS IS THE TRADER'S OWN STYLE (their "Trading DNA"):
Concepts they trade: ${names.join(', ') || 'not set'}.
Bias chart: ${btf()} · Entry chart: ${etf()}.
Write the idea in THEIR language — use the concepts above, not concepts they did not choose.${d.concepts.includes('keyrange') ? '\nWhen you mention the session range, call it only "Key Range", "Key Break" or "Key Retest" — never any other name for it.' : ''}

THE RULES:
1. Only trade with the ${btf()} bias.
2. ${zone ? 'Enter from the trader\'s zone' : 'Enter on the setup'} after a closed ${etf()} confirmation candle.
3. Stop beyond the ${etf()} swing. TP1 at least 1:${m[0]}, TP2 at least 1:${m[1]} after the spread. Entry 2 always between Entry 1 and the stop.
4. Partials at TP1, stop to breakeven.

THE TRADER'S SETUP:
Instrument: ${x.instrument}
Time now: ${x.session.nowTxt} SAST
Bias: ${x.bias}
Blue Mac score: ${x.score}/100 — ${x.grade}
Status: ${x.status}
${x.answers}

Trader's chart prices:
${x.levels}

Open gates / warnings: ${x.gates}; ${x.warns}

ENGINE PLAN — LONG: ${x.longPlan}
ENGINE PLAN — SHORT: ${x.shortPlan}

The ${x.bias === 'BULLISH' ? 'LONG' : 'SHORT'} idea is with the bias and is the main trade. The other one is counter-trend: explain honestly why it is weaker.
If chart screenshots are attached, use them to sharpen the signal, wait condition and invalidation, but never change the engine's prices.`;
      }
    };
    UT.register('quick', def); LAST = def;
    return def;
  }

  // context banner used by setStyle() in index.html
  try {
    STYLES.quick = { name:'Quick Idea', icon:'🧬', color:'var(--blue)', ctxDesc:'Built from your Trading DNA',
      get pills(){ const m = RR_OF(etf()); return [{ t:`${btf()} bias · ${etf()} entry`, c:'var(--blue)' }, { t:'Your concepts only', c:'var(--text2)' }, { t:`TP1 ≥ 1:${m[0]} · TP2 ≥ 1:${m[1]}`, c:'var(--bull)' }]; } };
  } catch(e){}

  // summary for previews / tests
  function plan(dna){ const s = build(dna); return { questions: s.questions.map(q => q.short), entryTF: etf(), biasTF: btf(), minRR: s.minRR }; }

  return { build, plan, current: () => LAST, BLOCKS: ['bias', 'ma', 'pd'].concat(SETUP, ZONES, ['trigger', 'confluence']) };
})();
