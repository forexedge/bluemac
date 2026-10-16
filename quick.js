// ══════════════════════════════════════════════════════
// BLUE MAC — STRATEGY TOOLBOX + PERSONAL uTRADE IDEAS (window.BMQ)
// Personal trade ideas, steps 2–3 (16 Oct 2026).
//
// A member's strategy is a list of TOOLS in four layers:
//   dir   — Direction: how they find the bias (one question per tool, higher timeframe)
//   loc   — Location: where they enter (all location tools merge into ONE zone question)
//   trig  — Trigger: when they pull it (all triggers merge into ONE trigger question)
//   extra — Extras: conditions (own question each) and ticks (one confluence question)
// plus "My own rule" lines the member types (must-have = own question, nice-to-have = tick).
//
// BMQ.build(strategy, key) turns it into a uTrade strategy definition, so the SAME engine
// grades it, gates it, calculates the prices (net R:R, Entry 2 inside the stop), sizes it
// and writes the AI idea. Members can make the rules stricter, never looser.
//
//   strategy = { name, tfs:['15m'], dir:[…], loc:[…], trig:[…], extra:[…],
//                custom:[{ t:'price above the Asian high', must:true }], rr:[2,3]|null, sessions:[…] }
//   BMQ.TOOLS            the toolbox (id → { name, line, group, layer, kind, pic })
//   BMQ.fromDNA(dna)     a starter strategy from My Trading DNA (dna.js)
//   BMQ.build(s, key)    register the strategy with UT under `key` (default 'quick')
//   BMQ.plan(s)          { questions, entryTF, biasTF, minRR } — previews / tests
//   BMQ.pic(toolId)      the tool's diagram (for the builder)
// ══════════════════════════════════════════════════════
window.BMQ = (function(){
  if(!window.UT) return null;
  const D = UT.D, pdDg = UT.pdDg, DG = UT.DG;

  // ── New engine diagrams (bull versions — UT.C(key, -1) mirrors them) ──
  const tl = (a, b, c, l) => ({ t:'line', a, b, c: c || ['bull','bear'], w:1.4, l });
  Object.assign(DG, {
    tlTrend: {
      n:40, seed:121, noise:0.3, wick:0.5,
      pts:[[0,101],[4,100],[9,104.6],[16,102.4],[22,107],[28,104.9],[34,109.4],[39,108.6]],
      marks:[tl([1,99.4],[39,108.2]), { t:'ring', i:16, p:102.2, c:['bull','bear'], r:4 }, { t:'ring', i:28, p:104.7, c:['bull','bear'], r:4 },
             { t:'text', i:33, p:104.6, s:'TRENDLINE', c:['bull','bear'] }],
      fitExtra:[99]
    },
    tlTouch: {
      n:40, seed:123, noise:0.28, wick:0.5,
      pts:[[0,101],[5,100.2],[11,105],[19,102.4],[26,108],[33,106.8],[37,104.4],[39,105]],
      marks:[tl([2,99.6],[39,104.4]), { t:'ring', i:37, p:104.2, c:['bull','bear'], r:5 }, { t:'text', i:30, p:102.2, s:'TAP', c:'amber' }],
      fitExtra:[99.2]
    },
    tlBreak: {
      n:40, seed:125, noise:0.28, wick:0.5,
      pts:[[0,100],[8,110],[12,107.6],[16,108.6],[21,105.6],[25,106.6],[30,103.6],[33,104.2],[34,106.6],[39,108.4]],
      fix:{ 33:{ o:103.8, c:104.1, h:104.6, l:103.4 }, 34:{ o:104.1, c:106.9, h:107.2, l:103.9 } },
      marks:[tl([8,110.4],[37,103.2], 'slate'), { t:'ring', i:34, p:105.4, c:['bull','bear'], r:5 }, { t:'text', i:31, p:109.4, s:'BREAK & CLOSE', c:['bull','bear'] }],
      fitExtra:[112, 102]
    },
    chanTrend: {
      n:40, seed:127, noise:0.28, wick:0.45,
      pts:[[0,100.4],[6,105.6],[12,102.2],[18,107.4],[24,104],[30,109.2],[36,105.8],[39,107]],
      marks:[tl([0,100],[39,106.6]), tl([0,104.4],[39,111], 'slate'), { t:'text', i:20, p:111.6, s:'CHANNEL', c:'slate' }],
      fitExtra:[112.4, 99.4]
    },
    chanEdge: {
      n:40, seed:129, noise:0.28, wick:0.45,
      pts:[[0,100.4],[6,105.6],[12,102.2],[18,107.4],[24,104],[30,109.2],[37,105.9],[39,106.4]],
      marks:[tl([0,100],[39,106.6]), tl([0,104.4],[39,111], 'slate'), { t:'ring', i:37, p:105.9, c:['bull','bear'], r:5 }, { t:'text', i:31, p:103.2, s:['CHANNEL FLOOR','CHANNEL ROOF'], c:'amber' }],
      fitExtra:[112, 99.4]
    },
    ichiTrend: {
      n:130, show:60, seed:12, noise:1.1,
      pts:[[0,62],[30,48],[55,38],[72,36],[84,44],[95,53],[102,50],[110,54],[118,62],[129,70]],
      ov:[{ t:'ichi' }]
    },
    ichiFlat: {
      n:130, show:60, seed:13, noise:1.0,
      pts:[[0,52],[20,58],[40,48],[60,57],[80,49],[100,56],[115,50],[129,53]],
      ov:[{ t:'ichi' }]
    },
    pinBar: {
      n:40, seed:131, noise:0.3, wick:0.5,
      pts:[[0,109],[10,106],[18,104],[26,102.4],[33,101.8],[34,101.8],[35,102.4],[39,103.6]],
      fix:{ 34:{ o:101.7, c:102.3, h:102.5, l:99.7 } },
      boxes:[{ i1:20, i2:39, p1:100.5, p2:102.4, c:['bull','bear'], op:0.14, l:'ZONE', lt:'below' }],
      marks:[{ t:'ring', i:34, p:99.9, c:['bull','bear'], r:5 }, { t:'text', i:34, p:104.8, s:'PIN BAR', c:['bull','bear'] }],
      fitExtra:[105.6, 99]
    },
    starTrig: {
      n:40, seed:133, noise:0.3, wick:0.5,
      pts:[[0,109],[10,106],[20,104],[30,103.4],[32,103],[33,101.2],[34,101],[35,103.2],[39,104.4]],
      fix:{ 33:{ o:103.2, c:101.3, h:103.4, l:101.1 }, 34:{ o:101.2, c:101.0, h:101.5, l:100.6 }, 35:{ o:101.1, c:103.3, h:103.5, l:100.9 } },
      marks:[{ t:'ring', i:34, p:100.7, c:['bull','bear'], r:6 }, { t:'text', i:34, p:105.6, s:['MORNING STAR','EVENING STAR'], c:['bull','bear'] }],
      fitExtra:[106.4]
    },
    emaCross: {
      n:90, show:46, seed:135, noise:0.7, wick:0.5,
      pts:[[0,100],[30,104],[50,101],[62,97.5],[70,97],[78,100.5],[89,104]],
      ov:[{ t:'ema', n:9, c:'blue', l:'9' }, { t:'ema', n:21, c:'silver', l:'21' }],
      marks:[{ t:'text', i:82, p:96.4, s:'9 CROSSES 21', c:['bull','bear'] }],
      fitExtra:[95.6]
    },
    macdTrig: {
      n:80, show:58, seed:14, noise:1.0,
      pts:[[0,60],[20,53],[32,37],[37,34],[41,36.5],[49,49],[55,47],[63,57],[79,66]],
      pane:{ t:'macd', l:'MACD 12·26·9' },
      marks:[{ t:'ring', i:37, p:33.6, c:['bull','bear'], r:5 }]
    },
    stochTrig: {
      n:62, show:50, seed:17, noise:0.7,
      pts:[[0,30],[8,46],[16,33],[24,53],[32,39],[40,59],[48,45],[56,66],[61,70]],
      pane:{ t:'stoch', l:'STOCH 14·3·3' },
      marks:[{ t:'ring', i:48, p:44.6, c:['bull','bear'], r:5 }]
    },
    pivotTap: {
      n:40, seed:137, noise:0.3, wick:0.5,
      pts:[[0,106],[6,108.6],[12,105],[18,107.2],[25,102.4],[29,101.2],[31,102.6],[36,105],[39,106.2]],
      marks:[{ t:'hline', p:105.6, i1:0, c:'slate', l:'P' }, { t:'hline', p:101, i1:0, c:['bull','bear'], l:['S1','R1'] }, { t:'ring', i:29, p:101, c:['bull','bear'], r:5 }],
      fitExtra:[100]
    }
  });
  const C = UT.C;

  // ── Timeframes & minimum R:R (same table as the 5 Blue Mac styles) ──
  const LADDER = ['1m', '5m', '15m', 'H1', 'H4', 'D1', 'W1'];
  const BIAS_OF = { '1m':'15m', '5m':'H1', '15m':'H4', 'H1':'D1', 'H4':'D1', 'D1':'W1' };
  const NAME = { '1m':'1-minute', '5m':'5-minute', '15m':'15-minute', 'H1':'1-hour', 'H4':'4-hour', 'D1':'daily', 'W1':'weekly' };
  const RR_OF = tf => ({ '1m':[2,3], '5m':[2,3], '15m':[2,3], 'H1':[2,3], 'H4':[3,4], 'D1':[3,5] })[tf] || [2,3];

  let S = null, LAST = null;            // strategy being run + its definition
  const ans = () => (UT._st && UT._st.ans) || {};
  const byTF = (a, b) => LADDER.indexOf(a) - LADDER.indexOf(b);
  function etf(A){ const t = (S && S.tfs) || []; const a = (A || ans()).chart; return t.includes(a) ? a : (t.slice().sort(byTF)[0] || '15m'); }
  const btf = A => BIAS_OF[etf(A)] || 'H4';
  const fast = A => LADDER.indexOf(etf(A)) <= 2;
  // the member can only make the minimum stricter
  const minRR = A => { const b = RR_OF(etf(A)), r = (S && S.rr) || []; return [Math.max(b[0], +r[0] || 0), Math.max(b[1], +r[1] || 0)]; };

  // paired bull / bear options. o = { v, l:[bull, bear], sub:[…]|str, dg:key|[refBull, refBear], pts, ref:[…]|str, ai:[…] }
  const two = (x, i) => Array.isArray(x) ? x[i] : x;
  function pair(o){
    return [1, -1].map((dir, i) => ({
      v: o.v + (dir > 0 ? '_bull' : '_bear'), l: two(o.l, i), sub: two(o.sub, i), dir, pts: o.pts,
      dg: typeof o.dg === 'string' ? C(o.dg, dir) : Array.isArray(o.dg) ? (() => D.ref(o.dg[i])) : undefined,
      ref: two(o.ref, i), ai: two(o.ai, i), warn: o.warn
    }));
  }

  // ══════════════════════════════════════════════════════
  // THE TOOLBOX
  // layer: dir | loc | trig | extra · kind (extra only): cond | tick
  // pic: Examples card id (string) or { dg:'key' } — the picture the builder shows
  // ══════════════════════════════════════════════════════
  const T = {};

  // ── Direction (one question each, on the bias chart) ──
  T.structure = { name:'Market structure', line:'HH/HL = up, LH/LL = down', group:'Price action', layer:'dir', pic:{ dg:'structTrend' },
    q: () => ({ short:'Structure', ref:'ex-market-structure-hh-hl-vs-ll-lh',
      q: A => `Open the ${btf(A)} chart. Which way is the structure going?`,
      help:'Look at the last 3–4 swings. <b>Higher highs & higher lows</b> = longs only. <b>Lower highs & lower lows</b> = shorts only. A <b>CHoCH</b> is the first break the other way.',
      options:[
        { v:'up', l:'Uptrend — HH & HL', sub:'Each high and low is higher than the last.', dg:C('structTrend', 1), dir:1, pts:20, ref:'smc-bos', ai:'uptrend (HH/HL)' },
        { v:'down', l:'Downtrend — LH & LL', sub:'Each high and low is lower than the last.', dg:C('structTrend', -1), dir:-1, pts:20, ref:'smc-bos', ai:'downtrend (LH/LL)' },
        { v:'choch_up', l:'Just turned up (CHoCH)', sub:'Broke above the last lower high.', dg:C('choch', 1), dir:1, pts:14, ref:'smc-choch', warn:'The trend change is fresh — expect a retest before it runs', ai:'fresh bullish change of character' },
        { v:'choch_dn', l:'Just turned down (CHoCH)', sub:'Broke below the last higher low.', dg:C('choch', -1), dir:-1, pts:14, ref:'smc-choch', warn:'The trend change is fresh — expect a retest before it runs', ai:'fresh bearish change of character' },
        { v:'range', l:'Sideways / choppy', sub:'Highs and lows overlap.', dg:C('range', 1), dir:0, pts:0, gate:'block', why:'No direction = no bias = no trade. Wait for the range to break.' }
      ] }) };
  T.ma = { name:'50 / 200 SMA', line:'Trend from the moving-average stack', group:'Indicators', layer:'dir', pic:{ dg:'maStack' },
    q: () => ({ short:'50/200 SMA', ref:'ex-ma-stack-50-vs-200',
      q: A => `On the ${btf(A)} chart, where is price against the 50 and 200 SMA?`,
      help:'50 & 200 <b>Simple</b> moving averages on Close (same as the Setup Guide). 50 above 200 with price above both = bullish stack.',
      options:[
        { v:'bull', l:'Above both — 50 over 200', sub:'Bullish stack, both sloping up.', dg:C('maStack', 1), dir:1, pts:12, ai:'price above the 50 and 200 SMA, bullish stack' },
        { v:'bear', l:'Below both — 50 under 200', sub:'Bearish stack, both sloping down.', dg:C('maStack', -1), dir:-1, pts:12, ai:'price below the 50 and 200 SMA, bearish stack' },
        { v:'mixed', l:'Mixed / tangled', sub:'Price between them, or the MAs are crossing.', dg:C('maMixed', 1), dir:0, pts:3, warn:'MAs are mixed — trend support is weak, take TP1 quickly', ai:'50/200 SMA mixed' }
      ] }) };
  T.ema50 = { name:'50 EMA', line:'Price above a rising EMA = up', group:'Indicators', layer:'dir', pic:{ dg:'emaTrend' },
    q: () => ({ short:'50 EMA', ref:'ind-ema',
      q: A => `On the ${btf(A)} chart, where is price against the 50 EMA?`,
      help:'Price holding <b>above a rising EMA</b> = longs. <b>Below a falling EMA</b> = shorts. A flat EMA that price keeps crossing = no trend.',
      options:[
        { v:'above', l:'Above a rising 50 EMA', sub:'Pullbacks bounce off it.', dg:C('emaTrend', 1), dir:1, pts:10, ai:'price above a rising 50 EMA' },
        { v:'below', l:'Below a falling 50 EMA', sub:'Rallies reject it.', dg:C('emaTrend', -1), dir:-1, pts:10, ai:'price below a falling 50 EMA' },
        { v:'flat', l:'Flat — price crossing it', sub:'No trend on the EMA.', dg:C('emaFlat', 1), dir:0, pts:2, warn:'50 EMA is flat — weak trend, take TP1 quickly', ai:'flat 50 EMA' }
      ] }) };
  T.trendline = { name:'Trendlines', line:'Price respecting a rising or falling trendline', group:'Price action', layer:'dir', pic:{ dg:'tlTrend' },
    q: () => ({ short:'Trendline', ref:'fib-trend',
      q: A => `On the ${btf(A)} chart, is price respecting a trendline?`,
      help:'Join at least <b>two swing lows</b> (uptrend) or <b>two swing highs</b> (downtrend). Three touches = a strong line. A close through it = the line is broken.',
      options:[
        { v:'up', l:'Rising trendline holding', sub:'Higher lows bouncing off the line.', dg:C('tlTrend', 1), dir:1, pts:12, ai:'price respecting a rising trendline' },
        { v:'down', l:'Falling trendline holding', sub:'Lower highs rejecting the line.', dg:C('tlTrend', -1), dir:-1, pts:12, ai:'price respecting a falling trendline' },
        { v:'none', l:'Broken, or no clean trendline', sub:'Fewer than 2 touches, or price closed through it.', dg:C('range', 1), dir:0, pts:2, warn:'No clean trendline — direction is less certain', ai:'no clean trendline' }
      ] }) };
  T.channel = { name:'Channels', line:'Price inside a rising or falling channel', group:'Price action', layer:'dir', pic:{ dg:'chanTrend' },
    q: () => ({ short:'Channel', ref:'pat-ach',
      q: A => `On the ${btf(A)} chart, is price moving in a channel?`,
      help:'Two parallel lines: one through the lows, one through the highs. A <b>rising channel</b> = buy the floor. A <b>falling channel</b> = sell the roof.',
      options:[
        { v:'up', l:'Rising channel', sub:'Higher highs and higher lows between two parallel lines.', dg:C('chanTrend', 1), dir:1, pts:12, ref:'pat-ach', ai:'rising channel' },
        { v:'down', l:'Falling channel', sub:'Lower highs and lower lows between two parallel lines.', dg:C('chanTrend', -1), dir:-1, pts:12, ref:'pat-dch', ai:'falling channel' },
        { v:'none', l:'No channel', sub:'Swings don\'t line up.', dg:C('range', 1), dir:0, pts:2, warn:'No channel — direction is less certain', ai:'no channel' }
      ] }) };
  T.ichimoku = { name:'Ichimoku cloud', line:'Above the cloud = up, below = down', group:'Indicators', layer:'dir', pic:'ind-ichimoku',
    q: () => ({ short:'Ichimoku', ref:'ind-ichimoku',
      q: A => `On the ${btf(A)} chart, where is price against the Ichimoku cloud?`,
      help:'Above a green cloud = uptrend. Below a red cloud = downtrend. Inside the cloud = no trend.',
      options:[
        { v:'above', l:'Above the cloud', sub:'Cloud is support.', dg:C('ichiTrend', 1), dir:1, pts:12, ai:'price above the Ichimoku cloud' },
        { v:'below', l:'Below the cloud', sub:'Cloud is resistance.', dg:C('ichiTrend', -1), dir:-1, pts:12, ai:'price below the Ichimoku cloud' },
        { v:'inside', l:'Inside the cloud', sub:'No trend — wait for it to leave.', dg:C('ichiFlat', 1), dir:0, pts:0, warn:'Price is inside the cloud — no trend there', ai:'price inside the Ichimoku cloud' }
      ] }) };

  // ── Location (all merge into one zone question) ──
  T.ob = { name:'Order blocks', line:'Last opposite candle before a strong move', group:'Smart Money', layer:'loc', pic:'smc-ob-bull',
    opts: () => pair({ v:'ob', l:['Bullish order block','Bearish order block'], sub:['Last red candle before the strong move up.','Last green candle before the strong move down.'], dg:'ob', pts:20, ref:['smc-ob-bull','smc-ob-bear'], ai:['bullish order block','bearish order block'] }) };
  T.fvg = { name:'Fair value gaps', line:'Imbalance price comes back to fill', group:'Smart Money', layer:'loc', pic:'smc-fvg-bull',
    opts: () => pair({ v:'fvg', l:['Bullish fair value gap','Bearish fair value gap'], sub:['Gap left by a fast candle up.','Gap left by a fast candle down.'], dg:'fvg', pts:18, ref:['smc-fvg-bull','smc-fvg-bear'], ai:['bullish fair value gap','bearish fair value gap'] }) };
  T.snd = { name:'Supply & demand', line:'Base zones before big moves', group:'Smart Money', layer:'loc', pic:'smc-snd',
    opts: () => pair({ v:'snd', l:['Demand zone','Supply zone'], sub:['Drop-base-rally — buyers stepped in here before.','Rally-base-drop — sellers stepped in here before.'], dg:'snd', pts:18, ref:'smc-snd', ai:['demand zone','supply zone'] }) };
  T.sr = { name:'Support & resistance', line:'Levels price has respected before', group:'Price action', layer:'loc', pic:'ex-support-and-resistance',
    opts: () => pair({ v:'flip', l:['Old resistance → new support','Old support → new resistance'], sub:'Broke a level, now retesting it.', dg:'flip', pts:16, ref:'smc-snd', ai:['resistance-turned-support retest','support-turned-resistance retest'] }) };
  T.fib = { name:'Fib golden pocket', line:'Pullbacks into 0.618–0.65', group:'Fibonacci', layer:'loc', pic:'fib-golden',
    opts: () => pair({ v:'fib', l:'Golden pocket (0.618–0.65)', sub:['Pullback into the golden pocket of the last leg up.','Rally into the golden pocket of the last leg down.'], dg:'fibGolden', pts:17, ref:'fib-golden', ai:['pullback into the golden pocket (long)','rally into the golden pocket (short)'] }) };
  T.tltouch = { name:'Trendline tap', line:'Entering where price taps the trendline', group:'Price action', layer:'loc', pic:{ dg:'tlTouch' },
    opts: () => pair({ v:'tl', l:['Tapping the rising trendline','Tapping the falling trendline'], sub:'Third (or later) touch of the line.', dg:'tlTouch', pts:16, ref:'fib-trend', ai:['tap of the rising trendline','tap of the falling trendline'] }) };
  T.chanedge = { name:'Channel edge', line:'Buy the channel floor, sell the roof', group:'Price action', layer:'loc', pic:{ dg:'chanEdge' },
    opts: () => pair({ v:'chan', l:['At the channel floor','At the channel roof'], sub:['Bottom line of a rising channel.','Top line of a falling channel.'], dg:'chanEdge', pts:16, ref:['pat-ach','pat-dch'], ai:['at the floor of a rising channel','at the roof of a falling channel'] }) };
  T.ma50 = { name:'50 SMA pullback', line:'Trend pullback to the 50 SMA', group:'Indicators', layer:'loc', pic:{ dg:'maPull50' },
    opts: () => pair({ v:'ma50', l:'Pullback to the 50 SMA', sub:['Uptrend dipping into the 50.','Downtrend rallying into the 50.'], dg:'maPull50', pts:16, ref:'ex-the-50-ma-pullback-entry', ai:['pullback to the 50 SMA (long)','rally to the 50 SMA (short)'] }) };
  T.pivot = { name:'Pivot points', line:'Bounces off daily P, S1, R1', group:'Indicators', layer:'loc', pic:'ind-pivots',
    opts: () => pair({ v:'pivot', l:['Bounce at a pivot (S1 / P)','Rejection at a pivot (R1 / P)'], sub:'Daily pivot level holding.', dg:'pivotTap', pts:14, ref:'ind-pivots', ai:['bounce at a daily pivot (S1/P)','rejection at a daily pivot (R1/P)'] }) };
  // chart patterns — each one is its own tool, with its real bull and bear Examples pictures
  const PAT = [
    ['double', 'Double top / bottom', ['Double bottom — neckline retest','Double top — neckline retest'], ['pat-db','pat-dt']],
    ['hs', 'Head & shoulders', ['Inverse H&S — neckline retest','Head & shoulders — neckline retest'], ['pat-ihs','pat-hs']],
    ['flag', 'Flags', ['Bull flag — breakout retest','Bear flag — breakdown retest'], ['pat-flag','pat-bflag']],
    ['triangle', 'Triangles', ['Ascending triangle — breakout','Descending triangle — breakdown'], ['pat-at','pat-dtri']],
    ['wedge', 'Wedges', ['Falling wedge — breakout','Rising wedge — breakdown'], ['pat-fw','pat-rw']],
    ['qm', 'Quasimodo', ['Bullish Quasimodo — left shoulder','Bearish Quasimodo — left shoulder'], ['pat-qmb','pat-qm']],
    ['cup', 'Cup & handle', ['Cup & handle — breakout','Inverse cup & handle — breakdown'], ['pat-cup','pat-icup']],
    ['wyckoff', 'Wyckoff spring / upthrust', ['Wyckoff spring','Wyckoff upthrust'], ['pat-spring','pat-upthrust']]
  ];
  PAT.forEach(([id, name, l, refs]) => {
    T['pat_' + id] = { name, line:'Chart pattern', group:'Chart patterns', layer:'loc', pic:refs[0],
      opts: () => pair({ v:'pat_' + id, l, sub:'Pattern confirmed — entering on the retest.', dg:refs, pts:16, ref:refs, ai:l.map(x => x.toLowerCase()) }) };
  });

  // ── Trigger (all merge into one trigger question, in the member's order) ──
  T.choch = { name:'CHoCH + FVG', line:'Breaks the last mini swing, leaves a gap', group:'Smart Money', layer:'trig', pic:{ dg:'trigChoch' },
    opts: () => pair({ v:'choch', l:['Bullish CHoCH + FVG','Bearish CHoCH + FVG'], sub:'Broke the last mini swing with a strong candle that left a gap.', dg:'trigChoch', pts:22, ref:'smc-ob-fvg', ai:['bullish change of character with a fresh FVG','bearish change of character with a fresh FVG'] }) };
  T.engulf = { name:'Engulfing candle', line:'A candle that swallows the last one', group:'Candles', layer:'trig', pic:{ dg:'trigEngulf' },
    opts: () => pair({ v:'eng', l:['Bullish engulfing','Bearish engulfing'], sub:'Closed body swallows the previous candle.', dg:'trigEngulf', pts:15, ref:['ex-bullish-candlestick-signals','ex-bearish-candlestick-signals'], ai:['bullish engulfing candle','bearish engulfing candle'] }) };
  T.pin = { name:'Pin bar', line:'Long wick rejection', group:'Candles', layer:'trig', pic:{ dg:'pinBar' },
    opts: () => pair({ v:'pin', l:['Bullish pin bar (hammer)','Bearish pin bar (shooting star)'], sub:'Long wick, small body — price rejected.', dg:'pinBar', pts:15, ref:['ex-bullish-candlestick-signals','ex-bearish-candlestick-signals'], ai:['bullish pin bar rejection','bearish pin bar rejection'] }) };
  T.star = { name:'Morning / evening star', line:'Three-candle reversal', group:'Candles', layer:'trig', pic:{ dg:'starTrig' },
    opts: () => pair({ v:'star', l:['Morning star','Evening star'], sub:'Big candle, small pause, big candle the other way.', dg:'starTrig', pts:16, ref:'ex-morning-star-and-evening-star', ai:['morning star reversal','evening star reversal'] }) };
  T.tlbreak = { name:'Trendline break', line:'Close through the pullback trendline', group:'Price action', layer:'trig', pic:{ dg:'tlBreak' },
    opts: () => pair({ v:'tlb', l:['Closed above the pullback trendline','Closed below the pullback trendline'], sub:'The pullback\'s trendline broke with a full candle close.', dg:'tlBreak', pts:18, ai:['close above the pullback trendline','close below the pullback trendline'] }) };
  T.emacross = { name:'9 / 21 EMA cross', line:'Fast EMA crosses the slow one', group:'Indicators', layer:'trig', pic:'ind-ema',
    opts: () => pair({ v:'emax', l:['9 EMA crossed above the 21','9 EMA crossed below the 21'], sub:'On a closed candle.', dg:'emaCross', pts:14, ref:'ind-ema', ai:['9 EMA crossed above the 21 EMA','9 EMA crossed below the 21 EMA'] }) };
  T.macd = { name:'MACD cross', line:'MACD crosses its signal line', group:'Indicators', layer:'trig', pic:'ind-macd',
    opts: () => pair({ v:'macd', l:['MACD crossed above signal','MACD crossed below signal'], sub:'Momentum turning your way.', dg:'macdTrig', pts:14, ref:'ind-macd', ai:['MACD crossed above its signal line','MACD crossed below its signal line'] }) };
  T.stoch = { name:'Stochastic cross', line:'Cross out of oversold / overbought', group:'Indicators', layer:'trig', pic:'ind-stoch',
    opts: () => pair({ v:'stoch', l:['Stochastic crossed up from oversold','Stochastic crossed down from overbought'], sub:'%K crossed %D beyond 20 / 80.', dg:'stochTrig', pts:14, ref:'ind-stoch', ai:['stochastic crossed up from oversold','stochastic crossed down from overbought'] }) };

  // ── Extras: conditions (own question) ──
  T.sweep = { name:'Liquidity sweep', line:'Stops taken, then price reverses', group:'Smart Money', layer:'extra', kind:'cond', stage:2, pic:'smc-sweep',
    q: () => ({ short:'Liquidity sweep', align:'critical', ref:'smc-sweep', tf: A => etf(A),
      q: A => `On the ${etf(A)} chart: has price just swept liquidity?`,
      help:'Stops sit beyond the <b>Asian high/low</b>, <b>PDH/PDL</b> and <b>equal highs/lows</b>. A sweep wicks through and <b>closes back inside</b>.',
      options:[
        { v:'ssl', l:'Swept the lows, closed back inside', sub:'Stops below taken → snap back up.', dg:C('sweep', 1), dir:1, pts:18, ref:'smc-sweep', ai:'swept sell-side liquidity and closed back inside' },
        { v:'bsl', l:'Swept the highs, closed back inside', sub:'Stops above taken → snap back down.', dg:C('sweep', -1), dir:-1, pts:18, ref:'smc-sweep', ai:'swept buy-side liquidity and closed back inside' },
        { v:'bos', l:'No sweep — clean break with the trend', sub:'Continuation, no stop hunt.', dg:C('contin', 1), dir:0, pts:9, warn:'No sweep — a continuation entry needs the zone to hold', ai:'no sweep — continuation break' },
        { v:'none', l:'Nothing swept yet', sub:'Price drifting mid-range.', dg:C('midRange', 1), dir:0, pts:0, gate:'wait', why:'No liquidity taken yet. Mark the Asian high/low and PDH/PDL, set alerts, wait for a sweep.', ai:'no sweep yet' }
      ] }) };
  T.keyrange = { name:'Key Range', line:'Blue Mac’s session range: Key Break & Key Retest', group:'Sessions', layer:'extra', kind:'cond', stage:2, pic:'mgt-keyrange',
    q: () => ({ short:'Key Range', align:'critical', ref:'mgt-keyrange', tf:'15m',
      q:'What has price done with the Key Range?',
      help:'The <b>Key Range</b> is the high and low of the first 15 minutes after the Asia, London or New York open. It is tradeable for 2 hours. A <b>Key Break</b> closes outside it; the <b>Key Retest</b> comes back to the edge.',
      live: s => `<div class="ut-live">${['asia', 'london', 'ny'].map(k => { const x = s.key[k]; return `<span>${k === 'ny' ? 'New York' : k === 'asia' ? 'Asia' : 'London'} <b>${s.hm(x.open)}</b> SAST${x.k === 'ready' ? ` · <b class="now">live, ${s.dur(x.left)} left</b>` : x.k === 'forming' ? ` · forming (${x.left} min)` : ''}</span>`; }).join('')}</div>`,
      options:[
        { v:'break_up', l:'Key Break up — retest holding', sub:'15m closed above the range, came back to the top edge.', dg:C('krBreak', 1), dir:1, pts:14, ref:'mgt-keybreak', ai:'Key Break above the Key Range with a retest of the top edge', check: krLive },
        { v:'break_dn', l:'Key Break down — retest holding', sub:'15m closed below the range, came back to the bottom edge.', dg:C('krBreak', -1), dir:-1, pts:14, ref:'mgt-keybreak', ai:'Key Break below the Key Range with a retest of the bottom edge', check: krLive },
        { v:'fake_lo', l:'Fake break below — back inside', sub:'Sellers trapped. Supports longs.', dg:C('krFake', -1), dir:1, pts:11, ref:'mgt-fakebreak', ai:'fake break below the Key Range, closed back inside — supports longs' },
        { v:'fake_hi', l:'Fake break above — back inside', sub:'Buyers trapped. Supports shorts.', dg:C('krFake', 1), dir:-1, pts:11, ref:'mgt-fakebreak', ai:'fake break above the Key Range, closed back inside — supports shorts' },
        { v:'inside', l:'Still inside the range', sub:'No break yet.', dg:C('krInside', 1), dir:0, pts:0, gate:'wait', why:'Wait for a 15m candle to close outside the Key Range, then for the retest.', ai:'still inside the Key Range' }
      ] }) };
  function krLive(s){ return ['asia', 'london', 'ny'].some(k => s.key[k].k === 'ready') ? null : 'No Key Range is live right now — each one is tradeable for 2 hours after its open.'; }
  T.bos = { name:'Structure break (BOS / CHoCH)', line:'A break of structure on the entry chart', group:'Smart Money', layer:'extra', kind:'cond', stage:2, pic:'smc-choch',
    q: () => ({ short:'Structure break', align:'critical', ref:'smc-choch', tf: A => etf(A),
      q: A => `On the ${etf(A)} chart: has price broken structure your way?`,
      help:'<b>BOS</b> = breaks the last swing in the trend direction. <b>CHoCH</b> = the first break against the old move. Count closed candles only.',
      options:[
        { v:'bos_bull', l:'Bullish BOS — then pulled back', sub:'Broke the last high, now retracing.', dg:C('bosPull', 1), dir:1, pts:15, ref:'smc-bos', ai:'bullish break of structure, now pulling back' },
        { v:'choch_bull', l:'Bullish CHoCH', sub:'Broke the last lower high — turning up.', dg:C('choch', 1), dir:1, pts:15, ref:'smc-choch', ai:'bullish change of character on the entry chart' },
        { v:'bos_bear', l:'Bearish BOS — then pulled back', sub:'Broke the last low, now retracing.', dg:C('bosPull', -1), dir:-1, pts:15, ref:'smc-bos', ai:'bearish break of structure, now pulling back' },
        { v:'choch_bear', l:'Bearish CHoCH', sub:'Broke the last higher low — turning down.', dg:C('choch', -1), dir:-1, pts:15, ref:'smc-choch', ai:'bearish change of character on the entry chart' },
        { v:'none', l:'No break yet', sub:'Still inside the last swing.', dg:C('range', 1), dir:0, pts:0, gate:'wait', why:'Wait for a closed break of structure in your direction.', ai:'no structure break yet' }
      ] }) };
  T.pd = { name:'Premium & discount', line:'Buy cheap, sell expensive', group:'Smart Money', layer:'extra', kind:'cond', stage:1, pic:'smc-pd',
    q: () => ({ short:'Premium / discount', align:'soft', ref:'smc-pd', tf: A => btf(A),
      q: A => `Fib the last ${btf(A)} swing. Is price in premium or discount?`,
      help:'Below 50% = <b>discount</b> (buy side). Above 50% = <b>premium</b> (sell side).',
      options:[
        { v:'discount', l:'Discount (below 50%)', sub:'Cheap — favours longs.', dg:() => pdDg('discount'), dir:1, pts:8, ai:'price in discount — favours longs' },
        { v:'premium', l:'Premium (above 50%)', sub:'Expensive — favours shorts.', dg:() => pdDg('premium'), dir:-1, pts:8, ai:'price in premium — favours shorts' },
        { v:'eq', l:'Right at 50%', sub:'No edge either way.', dg:() => pdDg('eq'), dir:0, pts:3, warn:'Price is at equilibrium — the best entries start from premium or discount', ai:'price at equilibrium' }
      ] }) };
  T.session = { name:'My sessions only', line:'Only trade the sessions you picked', group:'Sessions', layer:'extra', kind:'cond', stage:0, pic:{ fn: () => UT.sessionBar(UT.sessions()) },
    q: () => { const mine = sessList();
      return { short:'Session', compact:true, ref:'ex-trading-session-times-sast',
        q:'Is one of your sessions open right now?',
        help:`Your sessions: <b>${mine.map(x => x[1]).join(', ')}</b>. Times are SAST today, daylight saving included.`,
        live: s => `<div class="ut-live">${mine.map(([k, n]) => `<span>${n} opens <b>${s.hm(s.opens[k])}</b> SAST</span>`).join('')}<span>Now <b>${s.nowTxt} SAST</b></span></div>`,
        options:[
          { v:'yes', l:'Yes — I\'m in my session', sub:'Volume is there.', dir:0, pts:6, ai:'inside the trader\'s chosen session',
            check: s => { const w = mine.some(([k]) => { const m = (s.now - s.opens[k] + 1440) % 1440; return m < 240; }); return w ? null : `Clock says ${s.nowTxt} SAST — none of your sessions opened in the last 4 hours.`; } },
          { v:'no', l:'No — outside my sessions', sub:'Prepare now, trade when it opens.', dir:0, pts:0, gate:'wait', why:'Your own rule: only trade your sessions. Set alerts and come back when it opens.', ai:'outside the trader\'s sessions' }
        ] }; } };
  function sessList(){ const all = [['asia','Asia'], ['london','London'], ['ny','New York']], s = (S && S.sessions) || []; const m = all.filter(x => s.includes(x[0])); return m.length ? m : all.slice(1); }

  // ── Extras: ticks (one confluence question) ──
  const tick = (name, line, group, pic, o) => ({ name, line, group, layer:'extra', kind:'tick', pic, opt: o });
  T.rsi_div = tick('RSI divergence', 'Momentum fading against the move', 'Indicators', 'ind-rsi-bull-div',
    { v:'rsi_div', l:'RSI divergence', sub:'Price made a new extreme, RSI did not.', dg:() => D.ref(UT.bias() < 0 ? 'ind-rsi-bear-div' : 'ind-rsi-bull-div'), pts:6, ref:'ind-rsi-bull-div', ai:'RSI divergence at the zone' });
  T.rsi_zone = tick('RSI oversold / overbought', 'RSI below 30 or above 70 at the zone', 'Indicators', 'ind-rsi',
    { v:'rsi_zone', l:'RSI oversold (longs) / overbought (shorts)', sub:'Below 30 for longs, above 70 for shorts.', dg:() => D.ref('ind-rsi'), pts:5, ref:'ind-rsi', ai:'RSI oversold/overbought in the trade direction' });
  T.vwap = tick('VWAP', 'Right side of the day’s fair price', 'Indicators', 'ind-vwap',
    { v:'vwap', l:'Right side of VWAP', sub:'Above for longs, below for shorts.', dg:() => D.ref('ind-vwap'), pts:6, ref:'ind-vwap', ai:'price on the correct side of VWAP' });
  T.bb = tick('Bollinger bands', 'Tagged the outer band at the zone', 'Indicators', 'ind-bb-revert',
    { v:'bb', l:'Tagged the outer Bollinger band', sub:'Lower band for longs, upper for shorts.', dg:() => D.ref('ind-bb-revert'), pts:5, ref:'ind-bb-revert', ai:'price tagged the outer Bollinger band at the zone' });
  T.volume = tick('Volume', 'Volume confirms the move', 'Indicators', 'ind-volume',
    { v:'volume', l:'Volume spike on the signal', sub:'Bigger than the recent average.', dg:() => D.ref('ind-volume'), pts:4, ref:'ind-volume', ai:'volume spike on the signal candle' });
  T.round = tick('Round numbers & PDH/PDL', 'Zone lines up with a key level', 'Price action', 'ind-round',
    { v:'round', l:'Round number or PDH/PDL at the zone', sub:'e.g. 2350.00, 1.1000 or yesterday\'s high/low.', dg:() => D.ref('ind-pdhl'), pts:4, ref:'ind-round', ai:'zone lines up with a round number or PDH/PDL' });
  T.dxy = tick('DXY', 'The dollar index agrees', 'Fundamentals', 'mgt-dxy',
    { v:'dxy', l:'DXY agrees', sub:'Dollar moving the other way to your USD-pair / gold trade.', dg:() => D.ref('mgt-dxy'), pts:4, ref:'mgt-dxy', ai:'DXY confirms the direction' });

  // ── Fixed questions every strategy gets ──
  function chartQ(){
    const t = S.tfs.slice().sort(byTF);
    return { id:'chart', stage:0, type:'single', short:'Entry chart', compact:true,
      q:'Which chart are you trading off right now?',
      help:'Your strategy uses two entry charts. Every question after this one names the chart you pick.',
      options: t.map(x => ({ v:x, l:`${x} entries`, sub:`Bias from the ${BIAS_OF[x]} chart`, dir:0, noScore:true, ai:`entries on the ${NAME[x]} chart` })) };
  }
  function instrumentQ(){
    const mine = S.instr || [], all = [].concat(...UT.INSTR.map(g => g[1]));
    const nick = s => (all.find(x => x[0] === s) || [s, ''])[1];
    const groups = mine.length ? [['Your markets', mine.map(s => [s, nick(s)])]] : [];
    UT.INSTR.forEach(([g, list]) => { const rest = list.filter(x => !mine.includes(x[0])); if(rest.length) groups.push([g, rest]); });
    return { id:'instrument', stage:0, type:'instrument', short:'Instrument', q:'What are you trading?', help: mine.length ? 'Your markets are at the top.' : 'Pick the chart you have open.', groups };
  }
  function safetyQ(){
    const sessTool = S.extra.includes('session');
    return { id:'safety', stage:0, type:'single', short:'Quick check', compact:true, ref:'mgt-news',
      q:'Quick safety check — which of these is true right now?',
      help:'<b>Red-folder news</b> (NFP, CPI, FOMC) within 30 minutes or <b>3 losses today</b> = no trade. Check ForexFactory if you are not sure.',
      live: s => fast() && !sessTool ? `<div class="ut-live"><span>London KZ <b>${s.fmt(s.lo)}</b></span><span>New York KZ <b>${s.fmt(s.ny)}</b></span><span>Now <b class="${s.cur ? 'now' : ''}">${s.nowTxt} SAST</b></span>${s.weekend ? '<span style="color:var(--bear)">Weekend — FX & metals are closed</span>' : ''}</div>` : '',
      options:[
        { v:'clear', l:'All clear', sub:'No red news within 30 min, and 0–1 losses today.', dir:0, pts:6, ai:'no high-impact news within 30 minutes, 0–1 losses today',
          check: s => fast() && !sessTool && !s.cur ? `It is ${s.nowTxt} SAST — outside the London (${s.fmt(s.lo)}) and New York (${s.fmt(s.ny)}) kill zones. Fast-chart setups follow through best inside them.` : null },
        { v:'two', l:'2 losses today', sub:'Allowed — but this one is at half risk.', dir:0, pts:3, halfRisk:true, warn:'2 losses today — half risk on this trade', ai:'2 losses today — half risk' },
        { v:'news', l:'Red news within 30 minutes', sub:'Or it came out less than 30 minutes ago.', dir:0, pts:0, gate:'block', why:'No new trades 30 minutes either side of high-impact news. Come back after it settles.' },
        { v:'stop', l:'3 losses today (or daily limit hit)', sub:'Hard stop for today.', dir:0, pts:0, gate:'block', why:'Three losses = done for the day. Journal the trades and come back next session.' }
      ] };
  }
  function zoneQ(){
    const L = S.loc.filter(id => T[id] && T[id].layer === 'loc'); if(!L.length) return null;
    const both = L.includes('ob') && L.includes('fvg');
    const bull = [], bear = [];
    if(both){ const p = pair({ v:'obfvg', l:['Bullish OB with an FVG inside','Bearish OB with an FVG inside'], sub:'The strongest zone — both footprints in one place.', dg:['smc-ob-fvg','smc-ob-fvg'], pts:22, ref:'smc-ob-fvg', ai:['bullish order block with a fair value gap inside','bearish order block with a fair value gap inside'] }); bull.push(p[0]); bear.push(p[1]); }
    L.forEach(id => { const p = T[id].opts(); bull.push(p[0]); bear.push(p[1]); });
    const first = T[L[0]];
    return { id:'zone', stage:2, type:'single', short:'Location', align:'critical', tf: A => etf(A),
      q: A => `On the ${etf(A)} chart: where is price right now?`,
      help:'Only your location tools are listed. Pick the one price is sitting in, or about to tap. <b>No location = no entry.</b>',
      ref: typeof first.pic === 'string' ? first.pic : undefined,
      options: bull.concat(bear, [{ v:'none', l:'None of my locations', sub:'Price is in open space.', dg:C('noZone', 1), dir:0, pts:0, gate:'wait', why:'Your strategy enters from a location. Wait for price to reach one.', ai:'not at any of the trader\'s locations' }]) };
  }
  function triggerQ(){
    const L = S.trig.filter(id => T[id] && T[id].layer === 'trig');
    const use = L.length ? L : ['choch', 'engulf'];
    const bull = [], bear = [];
    use.forEach(id => { const p = T[id].opts(); bull.push(p[0]); bear.push(p[1]); });
    return { id:'trigger', stage:3, type:'single', short:'Trigger', align:'critical', tf: A => etf(A),
      q: A => `Last closed ${etf(A)} candle — has your trigger fired?`,
      help:'The location tells you <b>where</b>. The trigger tells you <b>when</b>. Only count candles that have closed.',
      ref: typeof T[use[0]].pic === 'string' ? T[use[0]].pic : 'smc-choch',
      options: bull.concat(bear, [{ v:'none', l:'Not yet', sub:'Waiting for the candle to close.', dg:C('trigNone', 1), dir:0, pts:0, gate:'wait', why:'Set an alert and wait for your trigger candle to CLOSE.', ai:'no trigger yet' }]) };
  }
  function ticksQ(){
    const ticks = S.extra.filter(id => T[id] && T[id].kind === 'tick').map(id => T[id].opt);
    const nice = (S.custom || []).filter(c => c && c.t && !c.must).map((c, i) => ({ v:'own' + i, l:c.t, sub:'Your own rule', pts:5, ai:`trader's own rule met: ${c.t}` }));
    const o = ticks.concat(nice); if(!o.length) return null;
    return { id:'confluence', stage:3, type:'multi', short:'Extras', compact:true, max: Math.min(14, o.reduce((a, x) => a + x.pts, 0)), tf: A => etf(A),
      q:'Tick everything that is true right now. (Skip if none.)', help:'Your extra confirmations. Each one adds to the score — none of them is required.', options:o };
  }
  function ownRuleQs(){
    return (S.custom || []).map((c, i) => c && c.t && c.must ? { id:'own' + i, stage:3, type:'single', short:'Your rule', compact:true,
      q:`Your rule: ${esc(c.t)}`, help:'You marked this rule as a must. Be honest — is it true right now?',
      options:[
        { v:'yes', l:'Yes', sub:'The rule is met.', dir:0, pts:8, ai:`trader's must-have rule met: ${c.t}` },
        { v:'no', l:'Not yet', sub:'Wait for it.', dir:0, pts:0, gate:'wait', why:`Your own rule isn't met yet: "${c.t}". Wait for it.`, ai:`trader's must-have rule NOT met: ${c.t}` }
      ] } : null).filter(Boolean);
  }
  // levels: only the fields this strategy needs, hints in the member's own terms
  const TARGET_WORDS = { sweep:'Asian high/low or PDH/PDL', sr:'the next support / resistance', snd:'the next supply / demand zone', pivot:'R1 / S1', channel:'the other side of the channel',
    chanedge:'the other side of the channel', round:'the next round number', trendline:'the last swing', keyrange:'' };
  function levelsQ(){
    const loc = S.loc.filter(id => T[id]), lineOnly = loc.length && loc.every(id => ['tltouch', 'ma50', 'pivot', 'chanedge'].includes(id));
    const words = [...new Set(S.dir.concat(S.loc, S.extra).map(id => TARGET_WORDS[id]).filter(Boolean))];
    if(S.loc.some(id => id.startsWith('pat_'))) words.push('the pattern’s measured-move target');
    const tw = words.length ? words.join(', ') : 'the next level';
    const f = [
      { id:'price', label:'Current price', req:true, hint:'The live price on your chart.' },
      { id:'swing_hi', label: A => `${etf(A)} swing high`, req:true, hint:'The most recent high. Short stops go above it.' },
      { id:'swing_lo', label: A => `${etf(A)} swing low`, req:true, hint:'The most recent low. Long stops go below it.' }
    ];
    if(loc.length) f.push(
      { id:'zone_hi', label: lineOnly ? 'Top of the entry area' : 'Zone top', hint: lineOnly ? 'A little above your line (trendline / MA / pivot) right now.' : 'Top edge of your zone.' },
      { id:'zone_lo', label: lineOnly ? 'Bottom of the entry area' : 'Zone bottom', hint: lineOnly ? 'A little below your line right now.' : 'Bottom edge of your zone.' });
    f.push({ id:'liq_up', label:'Target level above', hint:`For longs — ${tw}.` }, { id:'liq_dn', label:'Target level below', hint:`For shorts — ${tw}.` });
    if(S.extra.includes('keyrange')) f.push({ id:'kr_hi', label:'Key Range high', hint:'High of the first 15 minutes after the open.' }, { id:'kr_lo', label:'Key Range low', hint:'Low of the first 15 minutes after the open.' });
    return { id:'levels', stage:4, type:'levels', short:'Levels',
      q: A => `Type the prices from your ${etf(A)} chart.`,
      help:'Blue Mac works out your entries, stop and targets from these — the AI never guesses numbers.',
      hero: C('levels', 1), heroCap:'Swing low = where the long stop hides · levels above = long targets (and the reverse for shorts)', ref:'mgt-rr',
      fields:f, shots:[`${btf()} chart`, `${etf()} chart`, 'Extra chart'],
      check(L, num){ return UT.stdCheck(L, num, etf()); } };
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  // ── Clean a strategy: known tools only, right layer, sensible limits ──
  const LIMITS = { dir:3, loc:6, trig:4, extra:8, custom:3 };
  function clean(s){
    s = Object.assign({ name:'', tfs:['15m'], instr:[], sessions:[], dir:[], loc:[], trig:[], extra:[], custom:[], rr:null }, s || {});
    const pick = (arr, layer) => [...new Set((arr || []).filter(id => T[id] && T[id].layer === layer))].slice(0, LIMITS[layer]);
    s.dir = pick(s.dir, 'dir'); s.loc = pick(s.loc, 'loc'); s.trig = pick(s.trig, 'trig'); s.extra = pick(s.extra, 'extra');
    if(!s.dir.length) s.dir = ['structure'];                        // every strategy needs a direction
    s.tfs = (s.tfs || []).filter(t => BIAS_OF[t]).slice(0, 2); if(!s.tfs.length) s.tfs = ['15m'];
    s.custom = (s.custom || []).filter(c => c && String(c.t || '').trim()).slice(0, LIMITS.custom).map(c => ({ t:String(c.t).trim().slice(0, 120), must:!!c.must }));
    return s;
  }

  // ── Build: strategy → uTrade definition ──
  function build(strategy, key){
    key = key || 'quick';
    S = clean(strategy || fromDNA());
    // the FIRST direction tool decides; extra ones confirm — they can warn, never hard-block on their own
    const dirQs = S.dir.map((id, i) => { const q = Object.assign({ id:'dir_' + id, stage:1, type:'single', bias:true, tf: A => btf(A) }, T[id].q());
      if(i > 0) q.options = q.options.map(o => o.gate === 'block' ? Object.assign({}, o, { gate:undefined, why:undefined, pts:0, warn:`${q.short}: ${o.l} — no direction from this tool` }) : o);
      return q; });
    const conds = S.extra.filter(id => T[id].kind === 'cond').map(id => Object.assign({ id:'x_' + id, stage:T[id].stage, type:'single' }, T[id].q()));
    const qs = [S.tfs.length > 1 ? chartQ() : null, instrumentQ(), safetyQ()]
      .concat(conds.filter(q => q.stage === 0), dirQs, conds.filter(q => q.stage === 1), conds.filter(q => q.stage === 2))
      .concat([zoneQ(), triggerQ()], ownRuleQs(), [ticksQ(), levelsQ()])
      .filter(Boolean);
    const nm = ids => ids.map(id => T[id].name).join(', ');
    const sName = S.name || 'Your Quick Idea';
    const usesKR = S.extra.includes('keyrange');
    const def = {
      name: sName,
      short: S.name || 'Quick Idea',
      color: 'var(--blue)',
      get tfs(){ return `${btf()} → ${etf()}`; },
      get biasTF(){ return btf(); },
      get entryTF(){ return NAME[etf()] || etf(); },
      get minRR(){ return minRR(); },
      desc: `Your strategy — direction from ${nm(S.dir)}${S.loc.length ? `, entries at ${nm(S.loc)}` : ''}, triggered by ${nm(S.trig.length ? S.trig : ['choch', 'engulf'])}. Blue Mac checks it, prices it and applies the risk rules.`,
      get pills(){ const m = minRR(); return [`${qs.length} questions`, `${btf()} bias · ${etf()} entry`, `TP1 ≥ 1:${m[0]} · TP2 ≥ 1:${m[1]}`]; },
      know: [],
      stages: [{ label:'Quick check' }, { label:'Direction' }, { label:'Location' }, { label:'Trigger' }, { label:'Levels' }],
      questions: qs,
      strategy: S,
      levelMap(dir, L, num){
        return UT.stdLevels(dir, L, num, { tf: etf(), up:[['liq_up', 'target level you marked']], dn:[['liq_dn', 'target level you marked']],
          range: usesKR ? ['kr_hi', 'kr_lo', 'Key Range'] : null, ext: S.loc.includes('fib') });
      },
      prompt(x){
        const m = minRR();
        const own = (S.custom || []).map(c => `${c.must ? 'MUST' : 'nice-to-have'}: ${c.t}`).join(' · ');
        return `You are a professional trading mentor for Blue Mac, a South African trading platform. Your reader may be a beginner — explain simply and precisely.

THIS IS THE TRADER'S OWN STRATEGY${S.name ? ` — "${S.name}"` : ''}. Explain the idea in THEIR terms, using only these tools:
Direction: ${nm(S.dir)} (on the ${btf()} chart)
Location: ${S.loc.length ? nm(S.loc) : 'none — enters on the trigger'}
Trigger: ${nm(S.trig.length ? S.trig : ['choch', 'engulf'])} (on the ${etf()} chart)
Extras: ${S.extra.length ? nm(S.extra) : 'none'}${own ? `\nTheir own rules: ${own}` : ''}${usesKR ? '\nWhen you mention the session range, call it only "Key Range", "Key Break" or "Key Retest" — never any other name for it.' : ''}

BLUE MAC RISK RULES (always apply):
Stop beyond the ${etf()} swing. TP1 at least 1:${m[0]}, TP2 at least 1:${m[1]} after the spread. Entry 2 always between Entry 1 and the stop. Partials at TP1, stop to breakeven.

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
    UT.register(key, def); LAST = def;
    try { STYLES[key] = { name: sName, icon:'🧬', color:'var(--blue)', ctxDesc: S.name ? 'Your own strategy' : 'Built from your Trading DNA',
      get pills(){ const m = minRR(); return [{ t:`${btf()} bias · ${etf()} entry`, c:'var(--blue)' }, { t:'Your tools only', c:'var(--text2)' }, { t:`TP1 ≥ 1:${m[0]} · TP2 ≥ 1:${m[1]}`, c:'var(--bull)' }]; } }; } catch(e){}
    return def;
  }

  // ── My Trading DNA → a starter strategy ──
  function fromDNA(d){
    d = Object.assign({ concepts:[], instr:[], sessions:[], tfs:[] }, d || (window.BMD && BMD.get()) || {});
    const has = c => d.concepts.includes(c);
    const loc = ['ob', 'fvg', 'sr', 'fib'].filter(has).concat(has('patterns') ? ['pat_double', 'pat_hs'] : []);
    const trig = has('candles') && !has('structure') ? ['engulf', 'pin', 'choch'] : has('candles') ? ['choch', 'engulf', 'pin'] : ['choch', 'engulf'];
    const extra = [].concat(has('keyrange') ? ['keyrange'] : [], has('sweep') ? ['sweep'] : [], has('structure') ? ['bos'] : [], has('pd') ? ['pd'] : [],
                            has('rsi') ? ['rsi_div'] : [], has('vwap') ? ['vwap'] : [], has('rsi') || has('vwap') ? ['round'] : []);
    return { name:'', tfs:d.tfs, instr:d.instr, sessions:d.sessions, dir:['structure'].concat(has('ma') ? ['ma'] : []), loc, trig, extra, custom:[] };
  }

  function plan(s){ const def = build(s); return { questions: def.questions.map(q => q.short), entryTF: etf(), biasTF: btf(), minRR: def.minRR }; }
  // the builder's picture for a tool
  function pic(id){ const t = T[id]; if(!t) return ''; try { return typeof t.pic === 'string' ? D.ref(t.pic) : t.pic && t.pic.dg ? D.chart(DG[t.pic.dg], 1) : t.pic && t.pic.fn ? t.pic.fn() : ''; } catch(e){ return ''; } }

  return { TOOLS: T, LAYERS: ['dir', 'loc', 'trig', 'extra'], LIMITS, build, fromDNA, plan, pic, clean, current: () => LAST, RR_OF, BIAS_OF };
})();
