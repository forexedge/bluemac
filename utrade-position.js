// ══════════════════════════════════════════════════════
// uTRADE IDEAS · POSITION — "Macro Trend Position"
// Monthly trend + weekly 200 SMA + macro & COT → weekly major pattern /
// zone → daily entry. Staged entries, wide stops, big targets.
// Built from: market structure, MA stack, DXY & correlation, COT,
// push count / trend age, cup & handle, (inverse) H&S, Wyckoff spring &
// upthrust, supply & demand, fib, volume profile, Ichimoku.
// ══════════════════════════════════════════════════════
(function(){
  if(!window.UT) return;
  const D = UT.D, C = UT.C;

  UT.register('position', {
    name: 'Macro Trend Position',
    short: 'Position',
    color: 'var(--purple)',
    tfs: 'MN → W1 → D1',
    biasTF: 'Monthly',
    entryTF: 'daily',
    minRR: [3, 5],
    desc: 'Position trades ride the big money for weeks or months. The monthly trend, the weekly 200 SMA and the macro story must all point the same way. We enter where a major weekly pattern or zone completes, confirm on the daily, and build the position in two entries.',
    pills: ['Hold weeks–months', 'Check once a day', 'TP1 ≥ 1:3 · TP2 ≥ 1:5', 'Max 1% risk, 2 entries'],
    knowIntro: "Position trades ride the big money for weeks or months. These concepts drive every decision.",
    know: [
      { t:"Market structure (HH/HL, LH/LL)", ref:'ex-market-structure-hh-hl-vs-ll-lh', why:"Reads the monthly trend." },
      { t:"Moving average stack (50 / 200)", ref:'ex-ma-stack-50-vs-200', why:"The weekly 200 SMA filter." },
      { t:"The Key Range (first week)", ref:'mgt-keyframes', why:"The first week of the month — its break shows the monthly direction." },
      { t:"DXY & correlation", ref:'mgt-dxy', why:"The dollar drives gold, indices and USD pairs." },
      { t:"COT report", ref:'ind-cot', why:"What the big funds are positioned for." },
      { t:"Cup & handle", ref:'pat-cup', why:"A classic multi-month breakout pattern." },
      { t:"Head & shoulders", ref:'pat-hs', why:"The major reversal pattern (and its inverse)." },
      { t:"Wyckoff spring", ref:'pat-spring', why:"The fake-out before a big move." },
      { t:"Partial profits", ref:'mgt-partials', why:"How to bank gains on a long hold." }
    ],
    stages: [{ label:'Safety gates' }, { label:'Monthly bias' }, { label:'Macro' }, { label:'Weekly setup' }, { label:'Daily entry' }, { label:'Your levels' }],

    rules: {
      icon:'🏔', sub:'Weeks to months · staged entries',
      preflight:[
        ['Stop fits at 1% or less.', 'Position stops are wide. If the stop at your minimum lot size costs more than 1% of the account, the trade is too big for you — pass.'],
        ['Monthly trend decided.', 'Monthly structure plus the weekly 200 SMA. Position trades only go with both.'],
        ['Macro story agrees.', 'Interest rates, DXY and the commodity cycle should support the direction.'],
        ['Trend age known.', 'Early trends (1st–2nd leg) are the best risk/reward. Mature trends (5th leg, 18+ months) get smaller size.'],
        ['Swap checked.', 'Holding for months means overnight swap adds up. Know what your broker charges on this instrument.']
      ],
      steps:[
        ['Monthly sets the side', 'HH/HL (or a monthly CHoCH) with price above a rising weekly 200 SMA = longs. The mirror for shorts.'],
        ['Monthly Key Range', 'Mark the high and low of the first week of the month. A weekly close outside it in your direction confirms the position.'],
        ['Macro + COT check', 'Rates, DXY and positioning should support the direction. Against the macro = smaller size or no trade.'],
        ['Weekly setup', 'A major pattern completes (cup & handle, inverse H&S, Wyckoff spring — or their bearish twins) or price reaches a weekly demand/supply zone.'],
        ['Daily entry', 'A daily CHoCH out of the zone, or a weekly close back above the level. No trigger = Watchlist.'],
        ['Type your levels', 'Weekly swings, the zone and the major targets. Entry 1 and Entry 2 build the position in two pieces.']
      ],
      stop:'Beyond the weekly swing that defines the trade, plus a buffer. If that level breaks, the macro idea is wrong.',
      targets:'Weekly swing → major level you marked → fib 127.2% extension. Position trades must pay: TP1 at least 1:3, TP2 at least 1:5.',
      manage:'Take a third at TP1 and move the stop to breakeven. Trail the rest below each new weekly higher low (or above each lower high). Review once a day, not once an hour.',
      never:[
        ['Never risk more than 1% on a position.', 'Wide stops and long holds need small size.'],
        ['Never fight the monthly.', 'A daily signal against a monthly trend is noise to a position trader.'],
        ['Never add to a loser.', 'Entry 2 is a planned, better price above the stop — not averaging down below it.'],
        ['Never ignore the macro story.', 'If rates and the dollar are against you, the chart pattern alone will not save the trade.'],
        ['Never move the stop further away.', 'The stop marks where the idea is wrong. Respect it.']
      ],
      mindset:[
        ['On time', 'Position trades take weeks to start working. Boredom is part of the job.'],
        ['On drawdown', 'The trade will often go red before it goes green. That is what the wide stop is for.'],
        ['On conviction', 'Few setups qualify. When all layers line up, it can be the trade of the year.']
      ]
    },

    questions: [
      { id:'instrument', stage:0, type:'instrument', short:'Instrument',
        q:'What are you position trading?',
        help:'Position trading suits trending markets: gold, indices, the dollar pairs, oil and bitcoin.',
        groups: UT.INSTR },

      { id:'sizing', stage:0, type:'single', short:'Account sizing', compact:true,
        q:'Can you hold a wide weekly stop at 1% risk or less?',
        help:'Position stops sit beyond <b>weekly</b> swings — often hundreds of pips or points. Check with your broker\'s smallest lot size before going further.',
        ref:'mgt-sizing',
        options:[
          { v:'ok', l:'Yes — the stop fits at ≤ 1% risk', sub:'Lot size is small enough for a weekly stop.', dir:0, pts:5, ai:'account can hold the weekly stop at 1% risk or less' },
          { v:'no', l:'No — the stop is too big for my account', sub:'Even the minimum lot risks more than 1%.', dir:0, pts:0, gate:'block', why:'Never shrink the stop to fit the account. Trade a smaller instrument, use a Swing or Day setup instead, or wait until the account can carry it.' }
        ] },

      { id:'mn_structure', stage:1, type:'single', short:'Monthly structure', tf:'MN', bias:true,
        q:'Open the monthly chart. What is the structure?',
        help:'The monthly chart is the tide. <b>HH & HL</b> = position longs only. <b>LH & LL</b> = shorts only. A monthly <b>CHoCH</b> can start a multi-year move.',
        ref:'ex-market-structure-hh-hl-vs-ll-lh',
        options:[
          { v:'up', l:'Uptrend — HH & HL', sub:'Monthly highs and lows keep rising.', dg:C('structTrend', 1), dir:1, pts:16, ref:'smc-bos', ai:'monthly uptrend: higher highs and higher lows' },
          { v:'down', l:'Downtrend — LH & LL', sub:'Monthly highs and lows keep falling.', dg:C('structTrend', -1), dir:-1, pts:16, ref:'smc-bos', ai:'monthly downtrend: lower highs and lower lows' },
          { v:'choch_up', l:'Bullish CHoCH', sub:'Monthly downtrend broke its last lower high.', dg:C('choch', 1), dir:1, pts:14, ref:'smc-choch', ai:'monthly bullish change of character — possible new multi-year uptrend' },
          { v:'choch_dn', l:'Bearish CHoCH', sub:'Monthly uptrend broke its last higher low.', dg:C('choch', -1), dir:-1, pts:14, ref:'smc-choch', ai:'monthly bearish change of character — possible new multi-year downtrend' },
          { v:'range', l:'Ranging', sub:'Years of sideways candles.', dg:C('range', 1), dir:0, pts:0, gate:'block', why:'A monthly range gives no position bias. Trade the range edges with Swing setups instead.' }
        ] },

      { id:'w1_200', stage:1, type:'single', short:'Weekly 200 SMA', tf:'W1', bias:true,
        q:'Add the 50 and 200 SMA to the weekly chart. Where is price?',
        help:'The weekly <b>200 SMA</b> is the line institutions watch. Long positions live above a rising 200; short positions below a falling one.',
        ref:'ex-ma-stack-50-vs-200',
        options:[
          { v:'above', l:'Above a rising 200 (and 50)', sub:'Long-term uptrend confirmed.', dg:C('maStack', 1), dir:1, pts:10, ai:'price above a rising weekly 200 SMA, 50 above 200' },
          { v:'below', l:'Below a falling 200 (and 50)', sub:'Long-term downtrend confirmed.', dg:C('maStack', -1), dir:-1, pts:10, ai:'price below a falling weekly 200 SMA, 50 below 200' },
          { v:'flat', l:'Around a flat 200', sub:'MAs flat or tangled.', dg:C('maMixed', 1), dir:0, pts:2, warn:'Weekly 200 SMA is flat — the long-term trend is not confirmed', ai:'weekly 200 SMA flat / tangled' }
        ] },

      { id:'age', stage:1, type:'single', short:'Trend age', tf:'MN/W1', compact:true,
        q:'How old is this trend?',
        help:'Count the legs since the trend started. The <b>first two legs</b> give the best reward. After about <b>18 months and 4–5 legs</b>, pushes get smaller and reversals more likely.',
        ref:'ex-push-count-wave-exhaustion',
        options:[
          { v:'early', l:'Early — 1st or 2nd leg', sub:'Trend recently started (or just broke out).', dg:() => D.chart(UT.DG.trendEarly, UT.bias() || 1), dir:0, pts:10, ai:'early-stage trend (1st or 2nd leg)' },
          { v:'mature', l:'Mature — 4th leg or later', sub:'Long-running trend with smaller pushes.', dg:() => D.chart(UT.DG.trendMature, UT.bias() || 1), dir:0, pts:3, warn:'Mature trend — reduce size and take TP1 early', ai:'mature trend (4th leg or later, 18+ months)' }
        ] },

      { id:'krange', stage:1, type:'single', short:'Monthly Key Range', tf:'W1', align:'soft',
        q:'Mark the high and low of the first week of the month. Where has price closed since?',
        help:'<b>The first week sets the Monthly Key Range.</b> A weekly close outside it shows where the month — and often the next few months — is heading.',
        ref:'mgt-keyframes',
        options:[
          { v:'up', l:'Broke ABOVE and holding', sub:"Weekly close above the first week's high.", dg:C('krBreak', 1), dir:1, pts:10, ref:'mgt-keybreak', ai:'price broke above the monthly Key Range (first week) and is holding' },
          { v:'down', l:'Broke BELOW and holding', sub:"Weekly close below the first week's low.", dg:C('krBreak', -1), dir:-1, pts:10, ref:'mgt-keybreak', ai:'price broke below the monthly Key Range (first week) and is holding' },
          { v:'inside', l:'Still inside the range', sub:'No side chosen yet.', dg:C('krInside', 1), dir:0, pts:4, warn:'Price is still inside the monthly Key Range (first week) — expect chop until it breaks', ai:'price still inside the monthly Key Range (first week)' },
          { v:'early', l:'Still in the first week', sub:'The monthly range is still forming.', dg:C('krInside', 1), dir:0, pts:3, ai:'first week of the month — monthly Key Range still forming' }
        ] },

      { id:'macro', stage:2, type:'single', short:'Macro', align:'soft', compact:true,
        q:'What does the macro story say for this instrument?',
        help:'Think in one line: <b>rates, the dollar and growth</b>. Falling US rates and a weak dollar lift gold, indices and EURUSD. A strong dollar does the opposite. For USDZAR, SA risk and the SARB matter too.',
        ref:'mgt-dxy',
        options:[
          { v:'up', l:'Supports a move UP', sub:'Rates, dollar and growth favour higher prices.', dir:1, pts:12, ai:'macro backdrop supports higher prices' },
          { v:'down', l:'Supports a move DOWN', sub:'Rates, dollar and growth favour lower prices.', dir:-1, pts:12, ai:'macro backdrop supports lower prices' },
          { v:'mixed', l:'Mixed / unclear', sub:'No strong macro push either way.', dir:0, pts:4, warn:'Macro is mixed — the chart is doing the work alone', ai:'macro backdrop mixed' }
        ] },

      { id:'cot', stage:2, type:'single', short:'COT positioning', align:'soft', compact:true,
        q:'What does the COT report show for the big speculators?',
        help:'The weekly <b>Commitment of Traders</b> report shows what the large funds are doing. You want them building positions <b>in your direction</b> — not already at an extreme.',
        hero: () => D.ref('ind-cot'), ref:'ind-cot',
        options:[
          { v:'long', l:'Funds adding longs', sub:'Net long position growing, not at a record.', dir:1, pts:8, ai:'COT: large speculators adding longs' },
          { v:'short', l:'Funds adding shorts', sub:'Net short position growing, not at a record.', dir:-1, pts:8, ai:'COT: large speculators adding shorts' },
          { v:'flat', l:'Neutral or at an extreme', sub:'No clear build-up, or a record position (crowded).', dir:0, pts:2, ai:'COT neutral or at an extreme (crowded)' },
          { v:'skip', l:'I don\'t check COT', sub:'Skip this layer — it won\'t count for or against you.', dir:0, pts:0, noScore:true, ai:'COT not checked' }
        ] },

      { id:'setup', stage:3, type:'single', short:'Weekly setup', tf:'W1', align:'critical',
        q:'What major setup has the weekly chart completed?',
        help:'Position entries come from <b>big patterns and big zones</b> on the weekly — the places where a multi-month move starts.',
        ref:'pat-cup',
        options:[
          { v:'cup', l:'Cup & handle', sub:'Rounded base, small handle, breaking the rim.', dg:() => D.ref('pat-cup'), dir:1, pts:20, ref:'pat-cup', ai:'weekly cup and handle breakout' },
          { v:'ihs', l:'Inverse head & shoulders', sub:'Three lows, middle deepest, neckline breaking.', dg:() => D.ref('pat-ihs'), dir:1, pts:20, ref:'pat-ihs', ai:'weekly inverse head and shoulders' },
          { v:'spring', l:'Wyckoff spring', sub:'Fake break below a long range, then back inside.', dg:() => D.ref('pat-spring'), dir:1, pts:20, ref:'pat-spring', ai:'weekly Wyckoff spring' },
          { v:'demand', l:'Weekly demand zone', sub:'Price is back at a big weekly base.', dg:C('snd', 1), dir:1, pts:16, ref:'smc-snd', ai:'weekly demand zone' },
          { v:'icup', l:'Inverted cup & handle', sub:'Rounded top, small handle, breaking the rim.', dg:() => D.ref('pat-icup'), dir:-1, pts:20, ref:'pat-icup', ai:'weekly inverted cup and handle' },
          { v:'hs', l:'Head & shoulders', sub:'Three highs, middle highest, neckline breaking.', dg:() => D.ref('pat-hs'), dir:-1, pts:20, ref:'pat-hs', ai:'weekly head and shoulders' },
          { v:'upthrust', l:'Wyckoff upthrust', sub:'Fake break above a long range, then back inside.', dg:() => D.ref('pat-upthrust'), dir:-1, pts:20, ref:'pat-upthrust', ai:'weekly Wyckoff upthrust' },
          { v:'supply', l:'Weekly supply zone', sub:'Price is back at a big weekly top.', dg:C('snd', -1), dir:-1, pts:16, ref:'smc-snd', ai:'weekly supply zone' },
          { v:'none', l:'Nothing complete yet', sub:'Pattern still forming, or price between zones.', dg:C('noZone', 1), dir:0, pts:0, gate:'wait', why:'Position trades wait for the weekly setup to complete. Set an alert at the neckline or zone.', ai:'no completed weekly setup yet' }
        ] },

      { id:'trigger', stage:4, type:'single', short:'Daily entry', tf:'D1', align:'critical',
        q:'On the daily chart, what has confirmed the entry?',
        help:'Even a perfect weekly setup needs a <b>daily confirmation</b> — proof that buyers (or sellers) have stepped in at the level.',
        ref:'smc-choch',
        options:[
          { v:'choch_bull', l:'Bullish daily CHoCH', sub:'Daily broke its last lower high out of the zone.', dg:C('trigChoch', 1), dir:1, pts:20, ref:'smc-choch', ai:'daily bullish change of character out of the weekly setup' },
          { v:'close_bull', l:'Weekly close back above the level', sub:'Or a big daily engulfing at the zone.', dg:C('trigEngulf', 1), dir:1, pts:16, ref:'ex-bullish-candlestick-signals', ai:'weekly close back above the level / daily bullish engulfing' },
          { v:'choch_bear', l:'Bearish daily CHoCH', sub:'Daily broke its last higher low out of the zone.', dg:C('trigChoch', -1), dir:-1, pts:20, ref:'smc-choch', ai:'daily bearish change of character out of the weekly setup' },
          { v:'close_bear', l:'Weekly close back below the level', sub:'Or a big daily bearish engulfing at the zone.', dg:C('trigEngulf', -1), dir:-1, pts:16, ref:'ex-bearish-candlestick-signals', ai:'weekly close back below the level / daily bearish engulfing' },
          { v:'none', l:'No confirmation yet', sub:'Waiting for the daily to turn.', dg:C('trigNone', 1), dir:0, pts:0, gate:'wait', why:'Wait for the daily CHoCH or a weekly close through the level. Position traders lose nothing by waiting a few days.', ai:'no daily confirmation yet' }
        ] },

      { id:'confluence', stage:4, type:'multi', short:'Confluence', tf:'W1/D1', max:12, compact:true,
        q:'Tick every extra confirmation you can see. (Skip if none.)',
        help:'Big moves leave big footprints. <b>Two or three</b> of these makes it an A-grade position.',
        options:[
          { v:'fib', l:'Weekly golden pocket', sub:'Zone sits at 61.8–65% of the last monthly leg.', dg:() => D.ref('fib-golden'), pts:4, ref:'fib-golden', ai:'weekly golden pocket at the zone' },
          { v:'round', l:'Major round number', sub:'e.g. 2000.00, 1.1000, 20 000.', dg:() => D.ref('ind-round'), pts:3, ref:'ind-round', ai:'major round number at the zone' },
          { v:'div', l:'Weekly RSI divergence', sub:'At the low (longs) or high (shorts).', dg:() => D.ref(UT.bias() < 0 ? 'ind-rsi-bear-div' : 'ind-rsi-bull-div'), pts:4, ref:'ind-rsi-bull-div', ai:'weekly RSI divergence' },
          { v:'vp', l:'Volume profile support', sub:'Zone sits at a high-volume node / POC.', dg:() => D.ref('ind-vp'), pts:3, ref:'ind-vp', ai:'volume-profile high-volume node at the zone' },
          { v:'ichi', l:'Price on the right side of the weekly cloud', sub:'Ichimoku agrees with your direction.', dg:() => D.ref('ind-ichimoku'), pts:3, ref:'ind-ichimoku', ai:'price on the trend side of the weekly Ichimoku cloud' },
          { v:'dxy', l:'DXY trend agrees', sub:'For gold, indices and USD pairs.', dg:() => D.ref('mgt-dxy'), pts:3, ref:'mgt-dxy', ai:'DXY trend confirms the direction' }
        ] },

      { id:'levels', stage:5, type:'levels', short:'Levels',
        q:'Type the prices from your weekly chart.',
        help:'Your <b>stop goes beyond the weekly swing</b> that defines the trade. Targets: the weekly swing, the next <b>major level</b>, and Blue Mac adds the <b>fib 127.2% extension</b>. Entry 1 and Entry 2 build the position in two pieces.',
        hero: () => D.ref('fib-ext'), heroCap:'Position targets: swing high, then the 127.2% and 161.8% extensions', ref:'mgt-partials',
        fields:[
          { id:'price', label:'Current price', req:true, hint:'The live price.' },
          { id:'swing_hi', label:'Weekly swing high', req:true, hint:'The last major weekly high. Shorts: stop above it. Longs: first target.' },
          { id:'swing_lo', label:'Weekly swing low', req:true, hint:'The last major weekly low. Longs: stop below it. Shorts: first target.' },
          { id:'zone_hi', label:'Zone / neckline top', hint:'Top of the weekly zone, or the pattern neckline area.' },
          { id:'zone_lo', label:'Zone / neckline bottom', hint:'Bottom of the same area.' },
          { id:'m_up', label:'Major level above', hint:'All-time high, monthly resistance or pattern target — long target.' },
          { id:'m_dn', label:'Major level below', hint:'Monthly support or pattern target — short target.' },
          { id:'kr_hi', label:'First week of the month — high', hint:'The monthly Key Range high — a long target, and 2× the range beyond it.' },
          { id:'kr_lo', label:'First week of the month — low', hint:'The monthly Key Range low — a short target, and 2× the range beyond it.' }
        ],
        shots:['Monthly chart', 'Weekly chart', 'Daily chart'],
        check(L, num){ return UT.stdCheck(L, num, 'weekly'); } }
    ],

    levelMap(dir, L, num){
      return UT.stdLevels(dir, L, num, { tf:'weekly', up:[['m_up','major level above']], dn:[['m_dn','major level below']], buf:0.05, ext:true, range:['kr_hi', 'kr_lo', 'monthly Key Range'] });
    },

    prompt(x){
      return `You are a professional position trader and macro analyst who trades the "Macro Trend Position" for Blue Mac, a South African trading platform. Your reader may be a beginner — explain like a mentor, simply and precisely.

THE STRATEGY:
1. Monthly structure and the weekly 200 SMA set the side. Only trade with both.
2. The macro story (rates, dollar, growth) and COT positioning should agree. The first week of the month forms the monthly Key Range — a weekly close outside it in your direction confirms the position.
3. Enter where a major weekly setup completes: cup & handle, (inverse) head & shoulders, Wyckoff spring/upthrust, or a weekly demand/supply zone.
4. Confirm on the daily: a change of character, or a weekly close back through the level.
5. Stop beyond the weekly swing. Targets: weekly swing, the major level, fib 127.2% extension. TP1 at least 1:3, TP2 at least 1:5. Entry 1 and Entry 2 build the position in two pieces; Entry 2 is always between Entry 1 and the stop.
6. A third off at TP1, stop to breakeven, trail the rest behind weekly swings. Max 1% risk. Review once a day.

THE TRADER'S SETUP:
Instrument: ${x.instrument}
Monthly bias: ${x.bias}
Blue Mac score: ${x.score}/100 — ${x.grade}
Status: ${x.status}
${x.answers}

Trader's chart prices:
${x.levels}

Open gates / warnings: ${x.gates}; ${x.warns}

ENGINE PLAN — LONG: ${x.longPlan}
ENGINE PLAN — SHORT: ${x.shortPlan}

The ${x.bias === 'BULLISH' ? 'LONG' : 'SHORT'} idea is with the monthly bias and is the main trade. The other one is counter-trend: explain honestly why it is weaker and what would have to change before it is valid. Mention how many weeks the targets might realistically take.
If chart screenshots are attached, use them to sharpen the signal, wait condition and invalidation, but never change the engine's prices.`;
    }
  });
})();
