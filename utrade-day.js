// ══════════════════════════════════════════════════════
// uTRADE IDEAS · DAY TRADE — "Trend Pullback Day Trade"
// D1 bias → H4 break of structure → H1 pullback into a zone → 15m trigger
// Built from: market structure, BOS/CHoCH, premium/discount, fib golden
// pocket, order blocks, FVGs, S/R flips, PDH/PDL, pivots, VWAP, RSI, DXY.
// ══════════════════════════════════════════════════════
(function(){
  if(!window.UT) return;
  const D = UT.D, C = UT.C, sessionBar = UT.sessionBar, pdDg = UT.pdDg;

  UT.register('day', {
    name: 'Trend Pullback Day Trade',
    short: 'Day Trade',
    color: 'var(--blue)',
    tfs: 'D1 → H4 → H1 → 15m',
    biasTF: 'D1',
    entryTF: '15-minute',
    minRR: [2, 3],
    desc: 'The daily chart tells you which way the money is flowing. We wait for the H4 to break structure that way, then buy (or sell) the H1 pullback into a fresh zone — confirmed on the 15m — and we are flat before New York closes.',
    pills: ['Hold 1–8 hours', 'Flat by NY close', 'TP1 ≥ 1:2 · TP2 ≥ 1:3', 'Max 2 trades a day'],
    knowIntro: "Day trades combine a daily bias with a precise intraday entry. These are the building blocks.",
    know: [
      { t:"Market structure (HH/HL, LH/LL)", ref:'ex-market-structure-hh-hl-vs-ll-lh', why:"Reads the daily bias." },
      { t:"Top-down analysis", ref:'mgt-topdown', why:"How D1, H4, H1 and 15m fit together." },
      { t:"Break of structure (BOS)", ref:'smc-bos', why:"The H4 confirmation you need before the pullback." },
      { t:"Premium & discount", ref:'smc-pd', why:"Longs from discount, shorts from premium." },
      { t:"Fib golden pocket (61.8–65%)", ref:'fib-golden', why:"The A+ pullback zone on the H1." },
      { t:"Order blocks", ref:'smc-ob-what', why:"H1 entry zone." },
      { t:"Fair value gaps", ref:'smc-fvg-what', why:"H1 entry zone." },
      { t:"Change of character (CHoCH)", ref:'smc-choch', why:"Your 15m trigger out of the zone." },
      { t:"Previous day high & low", ref:'ind-pdhl', why:"Today's targets and liquidity pools." }
    ],
    stages: [{ label:'Safety gates' }, { label:'D1 bias' }, { label:'H4 structure' }, { label:'H1 zone' }, { label:'15m trigger' }, { label:'Your levels' }],

    rules: {
      icon:'📈', sub:'London & New York sessions · closed by the NY close',
      preflight:[
        ['Session open.', 'Enter in London (08:00–12:00 London time) or New York (08:30–12:00 New York time). uTrade Ideas shows both in SAST. No new day trades after the NY lunch.'],
        ['Calendar checked.', 'No red news within the next hour. If there is red news later today, plan to be at breakeven or out before it.'],
        ['PDH & PDL marked.', 'Yesterday\'s high and low are today\'s main targets and liquidity pools.'],
        ['D1 bias decided.', 'Trend structure on the daily — and where price sits in the daily range (premium or discount).'],
        ['Daily limits set.', 'Max 2 day trades a day. 3 losses or your daily loss limit = done.']
      ],
      steps:[
        ['D1 sets the bias', 'Daily structure (HH/HL or LH/LL, or a fresh CHoCH). Longs from discount, shorts from premium.'],
        ['H4 confirms', 'The H4 must have broken structure (BOS) in the D1 direction and now be pulling back. A ranging H4 = wait.'],
        ['H1 zone', 'The pullback should reach a real zone: fib golden pocket (61.8–65%), order block, FVG or flipped S/R.'],
        ['15m trigger', 'A 15m CHoCH out of the zone (best) or a closed engulfing / pin bar. No signal = Watchlist only.'],
        ['Type your levels', 'H1 swings, the zone and PDH/PDL. Blue Mac builds the entries, stop and targets and enforces the risk rules.']
      ],
      stop:'Beyond the H1 swing that the pullback is coming from, plus a buffer — outside the zone, never inside it.',
      targets:'First the H1 swing, then yesterday\'s high or low (PDH/PDL). If one is too close, TP1 moves to the next level or the 1:2 minimum.',
      manage:'Half off at TP1, stop to breakeven. Close whatever is left before the New York close — a day trade never becomes an overnight hold.',
      never:[
        ['Never trade against the D1.', 'The daily trend is the tide — 15m signals against it are just ripples.'],
        ['Never enter on the H4 break itself.', 'Wait for the pullback into the zone. Chasing the breakout candle puts your stop miles away.'],
        ['Never hold a day trade overnight.', 'Swap, gaps and Asia chop are not part of this plan.'],
        ['Never enter in the hour before red news.', 'Your stop is not built for a news spike.'],
        ['Never take a 3rd day trade.', 'Two good shots a day is plenty. More is boredom trading.']
      ],
      mindset:[
        ['On timing', 'The H1 pullback can take hours. Set alerts at the zone and walk away — the 15m trigger will tell you when.'],
        ['On targets', 'PDH and PDL get hit more often than people think. Let the trade reach them instead of grabbing tiny profits.'],
        ['On days off', 'If the D1 is ranging or the H4 has not broken, the best day trade is no day trade.']
      ]
    },

    questions: [
      { id:'instrument', stage:0, type:'instrument', short:'Instrument',
        q:'What are you day trading?',
        help:'Pick the chart you have open. Gold and the indices give the biggest intraday ranges; the majors give the cleanest structure.',
        groups: UT.INSTR },

      { id:'session', stage:0, type:'single', short:'Session', tf:'SAST', compact:true,
        q:'Which session are you planning the entry in?',
        help:'<b>Day trades need volume and time.</b> Enter in London or the New York morning so the trade has hours to reach its targets before the NY close. Times are converted to SAST for today, daylight saving included.',
        ref:'ex-trading-session-times-sast',
        live: s => `<div class="ut-live">${sessionBar(s, 'day')}<div style="width:100%;display:flex;flex-wrap:wrap;gap:6px 14px;">
            <span>London <b>${s.fmt(s.loD)}</b></span><span>New York <b>${s.fmt(s.nyD)}</b></span>
            <span>Now <b class="${s.curD ? 'now' : ''}">${s.nowTxt} SAST${s.curD ? ' · ' + (s.curD === 'london' ? 'London' : 'New York') + ' session' : ''}</b></span>
            ${s.weekend ? '<span style="color:var(--bear)">Weekend — FX & metals are closed</span>' : ''}</div></div>`,
        options:[
          { v:'london', l:'London session', sub:'The day\'s first big move. Best for EUR, GBP, gold and DAX.', dir:0, pts:10, ai:'London session',
            check: s => s.curD === 'london' ? null : `Clock says ${s.nowTxt} SAST — the London entry window is ${s.fmt(s.loD)}.` },
          { v:'ny', l:'New York morning', sub:'Highest volume. Best for USD pairs, gold and US indices.', dir:0, pts:10, ai:'New York morning session (London overlap)',
            check: s => s.curD === 'ny' ? null : `Clock says ${s.nowTxt} SAST — the New York entry window is ${s.fmt(s.nyD)}.` },
          { v:'late', l:'NY afternoon (after NY lunch)', sub:'Not enough time left for a new day trade.', dir:0, pts:0, gate:'block', why:'After the New York lunch there are only a few hours to the close — not enough room for a day trade to reach 1:2. Plan tomorrow\'s setup instead.' },
          { v:'asia', l:'Asian session', sub:'Thin, choppy and full of fake moves.', dir:0, pts:0, gate:'block', why:'Blue Mac day trades are entered in London or New York only. Use Asia to mark levels and plan.' }
        ] },

      { id:'news', stage:0, type:'single', short:'News', compact:true,
        q:'What does the economic calendar show for today?',
        help:'Check <b>ForexFactory</b> or <b>Investing.com</b> for red-folder events on your instrument\'s currencies (USD for gold and US indices).',
        hero: () => D.ref('mgt-news'), heroCap:'High-impact news blows through normal stops', ref:'mgt-news',
        options:[
          { v:'clear', l:'Clear — no red news today', sub:'Nothing high-impact for this instrument.', dir:0, pts:5, ai:'no high-impact news today' },
          { v:'later', l:'Red news later today', sub:'More than an hour away.', dir:0, pts:3, warn:'Red news later today — be at breakeven or out before it', ai:'red-folder news later today (more than 1 hour away) — trade must be protected before it' },
          { v:'soon', l:'Red news within the hour', sub:'Or released in the last 30 minutes.', dir:0, pts:0, gate:'block', why:'No new day trades in the hour before red news or the 30 minutes after it. Wait for the dust to settle, then re-run uTrade Ideas.' }
        ] },

      { id:'discipline', stage:0, type:'single', short:'Discipline', compact:true,
        q:'How has today gone so far?',
        help:'Two day trades a day is the Blue Mac maximum. <b>Three losses (or your daily loss limit) is a hard stop.</b>',
        ref:'mgt-sizing',
        options:[
          { v:'fresh', l:'First trade today', sub:'Clear head, normal risk.', dir:0, pts:5, ai:'first day trade today' },
          { v:'second', l:'Second trade today', sub:'Last one allowed today.', dir:0, pts:3, warn:'This is your last day trade today', ai:'second (final) day trade today' },
          { v:'stop', l:'2 trades taken, 3 losses, or loss limit hit', sub:'Done for today.', dir:0, pts:0, gate:'block', why:'Daily limit reached. Journal today\'s trades and come back tomorrow fresh.' }
        ] },

      { id:'d1_structure', stage:1, type:'single', short:'D1 structure', tf:'D1', bias:true,
        q:'Open the daily chart. What is the market structure?',
        help:'Look at the last 3–4 daily swings. <b>HH & HL</b> = only longs today. <b>LH & LL</b> = only shorts. A <b>CHoCH</b> is the first sign the daily trend is turning.',
        ref:'ex-market-structure-hh-hl-vs-ll-lh',
        options:[
          { v:'up', l:'Uptrend — HH & HL', sub:'Daily highs and lows keep rising.', dg:C('structTrend', 1), dir:1, pts:18, ref:'smc-bos', ai:'D1 uptrend: higher highs and higher lows' },
          { v:'down', l:'Downtrend — LH & LL', sub:'Daily highs and lows keep falling.', dg:C('structTrend', -1), dir:-1, pts:18, ref:'smc-bos', ai:'D1 downtrend: lower highs and lower lows' },
          { v:'choch_up', l:'Bullish CHoCH', sub:'Daily downtrend just broke its last lower high.', dg:C('choch', 1), dir:1, pts:12, ref:'smc-choch', warn:'Daily trend change is fresh — expect deeper pullbacks', ai:'D1 bullish change of character (fresh trend change)' },
          { v:'choch_dn', l:'Bearish CHoCH', sub:'Daily uptrend just broke its last higher low.', dg:C('choch', -1), dir:-1, pts:12, ref:'smc-choch', warn:'Daily trend change is fresh — expect deeper pullbacks', ai:'D1 bearish change of character (fresh trend change)' },
          { v:'range', l:'Ranging', sub:'Overlapping daily candles, no direction.', dg:C('range', 1), dir:0, pts:0, gate:'block', why:'No daily direction means no day-trade bias. Wait for the daily range to break.' }
        ] },

      { id:'d1_pd', stage:1, type:'single', short:'D1 premium / discount', tf:'D1', align:'soft',
        q:'Draw a fib on the last daily swing. Where is price?',
        help:'Same rule on every timeframe: <b>buy in discount</b> (below 50%), <b>sell in premium</b> (above 50%). A long from deep premium has little room left to run.',
        ref:'smc-pd',
        options:[
          { v:'discount', l:'In discount (below 50%)', sub:'Cheap — favours longs.', dg:() => pdDg('discount'), dir:1, pts:10, ai:'price in D1 discount — favours longs' },
          { v:'premium', l:'In premium (above 50%)', sub:'Expensive — favours shorts.', dg:() => pdDg('premium'), dir:-1, pts:10, ai:'price in D1 premium — favours shorts' },
          { v:'eq', l:'At 50% (equilibrium)', sub:'No edge from location.', dg:() => pdDg('eq'), dir:0, pts:4, warn:'Price is at daily equilibrium — expect a slower trade', ai:'price at D1 equilibrium' }
        ] },

      { id:'h4_structure', stage:2, type:'single', short:'H4 structure', tf:'H4', align:'critical',
        q:'Now the H4. Has it broken structure in the daily direction?',
        help:'We want the H4 to <b>break a swing high (or low) with the daily trend</b> — that is the BOS — and then start pulling back. The pullback is where we get in.',
        ref:'smc-bos',
        options:[
          { v:'bos_bull', l:'Bullish BOS, now pulling back', sub:'Broke the last H4 high, now dipping.', dg:C('bosPull', 1), dir:1, pts:16, ai:'H4 bullish break of structure, now pulling back' },
          { v:'bos_bear', l:'Bearish BOS, now pulling back', sub:'Broke the last H4 low, now bouncing.', dg:C('bosPull', -1), dir:-1, pts:16, ai:'H4 bearish break of structure, now pulling back' },
          { v:'running', l:'Broke and still running', sub:'No pullback yet — price is far from any zone.', dg:C('contin', 1), dir:0, pts:4, gate:'wait', why:'Chasing an extended H4 move puts your stop miles away. Wait for the pullback into an H1 zone.', ai:'H4 broke structure and is still running (no pullback yet)' },
          { v:'range', l:'H4 is ranging', sub:'No clean break in either direction.', dg:C('range', 1), dir:0, pts:0, gate:'wait', why:'The H4 has not confirmed the daily direction yet. Wait for a break of structure.', ai:'H4 ranging' }
        ] },

      { id:'h4_ema', stage:2, type:'single', short:'H4 50 EMA', tf:'H4', align:'soft',
        q:'Where is price compared to the H4 50 EMA?',
        help:'Add a 50 EMA to the H4. In a healthy trend, pullbacks hold <b>on the trend side of a sloping EMA</b>.',
        ref:'ind-ema',
        options:[
          { v:'above', l:'Above a rising 50 EMA', sub:'Uptrend intact on the H4.', dg:C('emaTrend', 1), dir:1, pts:8, ai:'price above a rising H4 50 EMA' },
          { v:'below', l:'Below a falling 50 EMA', sub:'Downtrend intact on the H4.', dg:C('emaTrend', -1), dir:-1, pts:8, ai:'price below a falling H4 50 EMA' },
          { v:'flat', l:'Flat — price crossing it', sub:'Momentum is weak.', dg:C('emaFlat', 1), dir:0, pts:2, warn:'H4 50 EMA is flat — momentum is weak', ai:'H4 50 EMA flat' }
        ] },

      { id:'zone', stage:3, type:'single', short:'H1 zone', tf:'H1', align:'critical',
        q:'Where has the H1 pullback reached?',
        help:'Drop to the H1 and find what the pullback is touching. The <b>golden pocket</b> (61.8–65% fib of the last H1 leg) lined up with an <b>order block or FVG</b> is the A+ zone.',
        ref:'fib-golden',
        options:[
          { v:'fib_bull', l:'Fib golden pocket (61.8–65%)', sub:'Pullback reached the sweet spot of the last up-leg.', dg:C('fibGolden', 1), dir:1, pts:20, ref:'fib-golden', ai:'H1 pullback into the 61.8–65% golden pocket of the last up-leg' },
          { v:'ob_bull', l:'Bullish order block', sub:'Last down candle before the H1 impulse up.', dg:C('ob', 1), dir:1, pts:20, ref:'smc-ob-bull', ai:'H1 bullish order block' },
          { v:'fvg_bull', l:'Bullish fair value gap', sub:'Gap left by the H1 impulse up.', dg:C('fvg', 1), dir:1, pts:18, ref:'smc-fvg-bull', ai:'H1 bullish fair value gap' },
          { v:'flip_bull', l:'Old resistance → support', sub:'Retesting the level the H4 broke.', dg:C('flip', 1), dir:1, pts:15, ref:'smc-snd', ai:'H1 resistance-turned-support retest' },
          { v:'fib_bear', l:'Fib golden pocket (61.8–65%)', sub:'Rally reached the sweet spot of the last down-leg.', dg:C('fibGolden', -1), dir:-1, pts:20, ref:'fib-golden', ai:'H1 rally into the 61.8–65% golden pocket of the last down-leg' },
          { v:'ob_bear', l:'Bearish order block', sub:'Last up candle before the H1 impulse down.', dg:C('ob', -1), dir:-1, pts:20, ref:'smc-ob-bear', ai:'H1 bearish order block' },
          { v:'fvg_bear', l:'Bearish fair value gap', sub:'Gap left by the H1 impulse down.', dg:C('fvg', -1), dir:-1, pts:18, ref:'smc-fvg-bear', ai:'H1 bearish fair value gap' },
          { v:'flip_bear', l:'Old support → resistance', sub:'Retesting the level the H4 broke.', dg:C('flip', -1), dir:-1, pts:15, ref:'smc-snd', ai:'H1 support-turned-resistance retest' },
          { v:'none', l:'Not at a zone yet', sub:'Pullback is still in open space.', dg:C('noZone', 1), dir:0, pts:0, gate:'wait', why:'Set alerts at the golden pocket and the nearest order block / FVG. Enter only when price gets there.', ai:'pullback has not reached a zone yet' }
        ] },

      { id:'trigger', stage:4, type:'single', short:'15m trigger', tf:'15m', align:'critical',
        q:'On the 15-minute chart, what has the last closed candle done at the zone?',
        help:'The H1 zone says <b>where</b>, the 15m says <b>when</b>. Best: a <b>15m CHoCH</b> out of the zone that leaves an FVG. Only count <b>closed</b> candles.',
        ref:'smc-choch',
        options:[
          { v:'choch_bull', l:'Bullish 15m CHoCH + FVG', sub:'Broke the last 15m lower high with displacement.', dg:C('trigChoch', 1), dir:1, pts:22, ref:'smc-ob-fvg', ai:'15m bullish change of character with displacement and FVG' },
          { v:'eng_bull', l:'Bullish engulfing / pin bar', sub:'Strong rejection candle closed at the zone.', dg:C('trigEngulf', 1), dir:1, pts:15, ref:'ex-bullish-candlestick-signals', ai:'15m bullish engulfing / pin bar at the zone' },
          { v:'choch_bear', l:'Bearish 15m CHoCH + FVG', sub:'Broke the last 15m higher low with displacement.', dg:C('trigChoch', -1), dir:-1, pts:22, ref:'smc-ob-fvg', ai:'15m bearish change of character with displacement and FVG' },
          { v:'eng_bear', l:'Bearish engulfing / shooting star', sub:'Strong rejection candle closed at the zone.', dg:C('trigEngulf', -1), dir:-1, pts:15, ref:'ex-bearish-candlestick-signals', ai:'15m bearish engulfing / shooting star at the zone' },
          { v:'none', l:'No signal yet', sub:'Still grinding into the zone.', dg:C('trigNone', 1), dir:0, pts:0, gate:'wait', why:'No 15m confirmation yet. Wait for a CHoCH or a strong rejection candle to close.', ai:'no 15m confirmation yet' }
        ] },

      { id:'confluence', stage:4, type:'multi', short:'Confluence', tf:'H1/15m', max:15, compact:true,
        q:'Tick every extra confirmation you can see. (Skip if none.)',
        help:'Each one adds evidence in your trade\'s direction. <b>Two or three</b> makes a strong day trade.',
        options:[
          { v:'pdhl', l:'Zone sits at PDH / PDL', sub:'Yesterday\'s high or low is in the zone.', dg:() => D.ref('ind-pdhl'), pts:5, ref:'ind-pdhl', ai:'zone lines up with the previous day high/low' },
          { v:'pivot', l:'Daily pivot level in the zone', sub:'P, S1 or R1 inside the zone.', dg:() => D.ref('ind-pivots'), pts:4, ref:'ind-pivots', ai:'daily pivot level inside the zone' },
          { v:'div', l:'RSI divergence into the zone', sub:'Price pushed deeper, RSI did not.', dg:() => D.ref(UT.bias() < 0 ? 'ind-rsi-bear-div' : 'ind-rsi-bull-div'), pts:5, ref:'ind-rsi-bull-div', ai:'RSI divergence into the zone' },
          { v:'vwap', l:'VWAP on your side', sub:'Price back above VWAP (longs) / below (shorts).', dg:() => D.ref('ind-vwap'), pts:4, ref:'ind-vwap', ai:'price on the correct side of VWAP' },
          { v:'cluster', l:'Fib cluster', sub:'Two fibs from different swings meet at the zone.', dg:() => D.ref('fib-cluster'), pts:4, ref:'fib-cluster', ai:'fibonacci cluster at the zone' },
          { v:'dxy', l:'DXY agrees', sub:'USD pairs, gold and indices.', dg:() => D.ref('mgt-dxy'), pts:4, ref:'mgt-dxy', ai:'DXY confirms the direction' }
        ] },

      { id:'levels', stage:5, type:'levels', short:'Levels',
        q:'Type the prices from your H1 chart.',
        help:'Blue Mac calculates the entries, stop and targets from these. Your <b>stop goes beyond the H1 swing</b> the pullback started from; <b>targets are the H1 swing and PDH/PDL</b>.',
        hero: C('levels', 1), heroCap:'Swing low = where the long stop hides · Swing high, PDH = long targets (reverse for shorts)', ref:'mgt-rr',
        fields:[
          { id:'price', label:'Current price', req:true, hint:'The live price on your chart.' },
          { id:'swing_hi', label:'H1 swing high', req:true, hint:'The most recent H1 swing high. Shorts: stop above it. Longs: first target.' },
          { id:'swing_lo', label:'H1 swing low', req:true, hint:'The most recent H1 swing low. Longs: stop below it. Shorts: first target.' },
          { id:'zone_hi', label:'Zone top', hint:'Top of the golden pocket / order block / FVG.' },
          { id:'zone_lo', label:'Zone bottom', hint:'Bottom of the same zone.' },
          { id:'pdh', label:'Previous day high (PDH)', hint:'Yesterday\'s high — long target.' },
          { id:'pdl', label:'Previous day low (PDL)', hint:'Yesterday\'s low — short target.' }
        ],
        shots:['D1 / H4 chart', 'H1 chart', '15m chart'],
        check(L, num){ return UT.stdCheck(L, num, 'H1'); } }
    ],

    levelMap(dir, L, num){
      return UT.stdLevels(dir, L, num, { tf:'H1', up:[['pdh','previous day high (PDH)']], dn:[['pdl','previous day low (PDL)']] });
    },

    prompt(x){
      return `You are a professional day trader who trades the "Trend Pullback Day Trade" for Blue Mac, a South African trading platform. Your reader may be a beginner — explain like a mentor, simply and precisely.

THE STRATEGY:
1. The daily chart sets the bias (structure + premium/discount). Only trade with it.
2. The H4 must break structure in the daily direction, then pull back.
3. Enter the H1 pullback at a real zone: fib golden pocket (61.8–65%), order block, FVG or flipped S/R.
4. Confirm on the 15m: a change of character with displacement (best) or a closed engulfing / pin bar.
5. Stop beyond the H1 swing. Targets: the H1 swing, then PDH/PDL. TP1 at least 1:2, TP2 at least 1:3, Entry 2 always between Entry 1 and the stop.
6. Half off at TP1, stop to breakeven, everything closed before the New York close. Never held overnight.

THE TRADER'S SETUP:
Instrument: ${x.instrument}
Time now: ${x.session.nowTxt} SAST (London window ${x.session.fmt(x.session.loD)}, New York window ${x.session.fmt(x.session.nyD)})
D1 bias: ${x.bias}
Blue Mac score: ${x.score}/100 — ${x.grade}
Status: ${x.status}
${x.answers}

Trader's chart prices:
${x.levels}

Open gates / warnings: ${x.gates}; ${x.warns}

ENGINE PLAN — LONG: ${x.longPlan}
ENGINE PLAN — SHORT: ${x.shortPlan}

The ${x.bias === 'BULLISH' ? 'LONG' : 'SHORT'} idea is with the daily bias and is the main trade. The other one is counter-trend: explain honestly why it is weaker and what would have to change before it is valid.
If chart screenshots are attached, use them to sharpen the signal, wait condition and invalidation, but never change the engine's prices.`;
    }
  });
})();
