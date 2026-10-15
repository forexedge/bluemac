// ══════════════════════════════════════════════════════
// uTRADE IDEAS · SWING — "Weekly Zone Swing"
// W1 structure + 50/200 SMA stack → D1 pullback into a zone → H4 trigger
// Built from: market structure, MA stack, premium/discount, supply &
// demand, fib golden pocket, order blocks, push count, chart patterns
// (flags, wedges, double tops/bottoms, H&S), RSI divergence, fib extensions.
// ══════════════════════════════════════════════════════
(function(){
  if(!window.UT) return;
  const D = UT.D, C = UT.C, pdDg = UT.pdDg;

  UT.register('swing', {
    name: 'Weekly Zone Swing',
    short: 'Swing',
    color: 'var(--bull)',
    tfs: 'W1 → D1 → H4',
    biasTF: 'Weekly',
    entryTF: 'H4',
    minRR: [3, 4],
    desc: 'The weekly chart picks the side. We let the daily pull back into a demand or supply zone — ideally the fib golden pocket — and only pull the trigger when the H4 breaks out of its pullback pattern. Held for days, aimed at the next weekly level.',
    pills: ['Hold 2–15 days', 'Check twice a day', 'TP1 ≥ 1:3 · TP2 ≥ 1:4', 'Max 3 open swings'],
    stages: [{ label:'Safety gates' }, { label:'Weekly bias' }, { label:'Daily zone' }, { label:'H4 trigger' }, { label:'Your levels' }],

    rules: {
      icon:'🌊', sub:'Days to two weeks · Monday–Thursday entries',
      preflight:[
        ['Week ahead checked.', 'Central-bank decisions, CPI and NFP for your currencies. Avoid opening a new swing in the 48 hours before one.'],
        ['Weekly bias decided.', 'Weekly structure plus the 50/200 SMA stack. They must agree.'],
        ['Exposure checked.', 'Max 3 open swings, and never two in the same direction on the same currency (e.g. long EURUSD + long GBPUSD = double USD short).'],
        ['Zone marked on the daily.', 'Demand/supply, order block or the fib golden pocket of the last weekly leg.'],
        ['Friday rule.', 'No new swings after Thursday — weekend gaps can skip right over your stop.']
      ],
      steps:[
        ['Weekly sets the side', 'HH/HL with price above a rising 50 SMA (and 50 above 200) = longs. The mirror for shorts. Prefer discount for longs, premium for shorts.'],
        ['Daily pulls back into a zone', 'Demand/supply (drop-base-rally), daily order block, the 61.8–65% golden pocket or a flipped weekly level.'],
        ['Count the pushes', 'The 1st and 2nd pushes of a weekly trend pay best. A 3rd push is often exhaustion — smaller size, quicker profits.'],
        ['H4 trigger', 'A bullish flag / falling wedge / double bottom breaking out, an H4 CHoCH, or a daily engulfing at the zone. No trigger = Watchlist.'],
        ['Type your levels', 'Daily swings, the zone and the weekly targets. Blue Mac adds the fib 127.2% extension as a target and enforces the risk rules.']
      ],
      stop:'Beyond the daily swing the pullback came from, plus a buffer. Swing stops are wide — the position size gets smaller, never the stop.',
      targets:'Daily swing → weekly level you marked → fib 127.2% extension of the daily swing. Swing trades need room: TP1 at least 1:3.',
      manage:'Close a third to a half at TP1 and move the stop to breakeven. Trail the rest behind each new H4/daily higher low (or lower high).',
      never:[
        ['Never swing against the weekly.', 'A daily signal against the weekly trend is a pullback, not a reversal.'],
        ['Never chase the 3rd push.', 'Late-trend entries have the smallest reward and the biggest reversal risk.'],
        ['Never hold through a central-bank decision unprotected.', 'Move to breakeven or cut size before it.'],
        ['Never open two swings on the same currency in the same direction.', 'It doubles your risk without you noticing.'],
        ['Never tighten the stop to make the lot size bigger.', 'Wide stop, small size — that is how swings survive the noise.']
      ],
      mindset:[
        ['On noise', 'H1 wiggles mean nothing to a swing trade. Check the chart twice a day, not twice an hour.'],
        ['On patience', 'The best swing zones get tapped once. If you missed it, the next pullback is days away — that is fine.'],
        ['On winners', 'Let TP2 work. One good swing pays for several small losses.']
      ]
    },

    questions: [
      { id:'instrument', stage:0, type:'instrument', short:'Instrument',
        q:'What are you swing trading?',
        help:'Swing trading works on everything — pick the chart you have open.',
        groups: UT.INSTR },

      { id:'events', stage:0, type:'single', short:'Week ahead', compact:true,
        q:'Any major events for this instrument in the next 48 hours?',
        help:'Central-bank rate decisions (Fed, ECB, BoE, SARB), CPI and NFP move weekly charts. A new swing opened right before one is a coin flip.',
        ref:'mgt-news',
        options:[
          { v:'clear', l:'Clear for the next 48 hours', sub:'Nothing major on the calendar.', dir:0, pts:5, ai:'no major events in the next 48 hours' },
          { v:'later', l:'Major event later this week', sub:'More than 48 hours away.', dir:0, pts:3, warn:'Major event later this week — be at breakeven before it', ai:'major event later this week (more than 48h away)' },
          { v:'soon', l:'Major event within 48 hours', sub:'Rate decision, CPI or NFP is close.', dir:0, pts:0, gate:'wait', why:'Let the event pass. If the setup is still valid afterwards, it will be a cleaner entry.', ai:'major event within 48 hours' }
        ] },

      { id:'exposure', stage:0, type:'single', short:'Exposure', compact:true,
        q:'What swing trades do you already have open?',
        help:'Swings stay open for days, so risk adds up. <b>Max 3 open swings</b>, and watch for hidden doubles on the same currency.',
        ref:'mgt-sizing',
        options:[
          { v:'ok', l:'0–2 open, none on this currency', sub:'Room for another position.', dir:0, pts:5, ai:'exposure fine — 0 to 2 open swings, none correlated' },
          { v:'corr', l:'Already in a trade on the same currency', sub:'e.g. long EURUSD and now looking at GBPUSD.', dir:0, pts:2, halfRisk:true, warn:'Correlated with an open trade — half risk on this one', ai:'already has a correlated open trade — half risk' },
          { v:'full', l:'3 swings open, or weekly loss limit hit', sub:'No more risk this week.', dir:0, pts:0, gate:'block', why:'Max exposure reached. Manage what is open; new swings can wait for a free slot.' }
        ] },

      { id:'w1_structure', stage:1, type:'single', short:'W1 structure', tf:'W1', bias:true,
        q:'Open the weekly chart. What is the market structure?',
        help:'The weekly is the boss. <b>HH & HL</b> = only longs. <b>LH & LL</b> = only shorts. A weekly <b>CHoCH</b> is a big trend change — powerful, but expect deep retests.',
        ref:'ex-market-structure-hh-hl-vs-ll-lh',
        options:[
          { v:'up', l:'Uptrend — HH & HL', sub:'Weekly highs and lows keep rising.', dg:C('structTrend', 1), dir:1, pts:18, ref:'smc-bos', ai:'weekly uptrend: higher highs and higher lows' },
          { v:'down', l:'Downtrend — LH & LL', sub:'Weekly highs and lows keep falling.', dg:C('structTrend', -1), dir:-1, pts:18, ref:'smc-bos', ai:'weekly downtrend: lower highs and lower lows' },
          { v:'choch_up', l:'Bullish CHoCH', sub:'Weekly downtrend broke its last lower high.', dg:C('choch', 1), dir:1, pts:12, ref:'smc-choch', warn:'Weekly trend change is fresh — expect a deep retest', ai:'weekly bullish change of character' },
          { v:'choch_dn', l:'Bearish CHoCH', sub:'Weekly uptrend broke its last higher low.', dg:C('choch', -1), dir:-1, pts:12, ref:'smc-choch', warn:'Weekly trend change is fresh — expect a deep retest', ai:'weekly bearish change of character' },
          { v:'range', l:'Ranging', sub:'Weekly candles overlapping, no direction.', dg:C('range', 1), dir:0, pts:0, gate:'block', why:'No weekly trend = no swing bias. Wait for the weekly range to break, or trade a shorter style.' }
        ] },

      { id:'w1_ma', stage:1, type:'single', short:'W1 MA stack', tf:'W1', bias:true,
        q:'Add the 50 and 200 SMA to the weekly. How are they stacked?',
        help:'<b>Bull stack:</b> price above the 50, and the 50 above the 200, both rising. <b>Bear stack:</b> the mirror. If they are tangled, the trend is tired or turning.',
        ref:'ex-ma-stack-50-vs-200',
        options:[
          { v:'bull', l:'Bull stack — price > 50 > 200', sub:'Both MAs rising, price above them.', dg:C('maStack', 1), dir:1, pts:10, ai:'weekly bull stack: price above the 50 SMA, 50 above the 200' },
          { v:'bear', l:'Bear stack — price < 50 < 200', sub:'Both MAs falling, price below them.', dg:C('maStack', -1), dir:-1, pts:10, ai:'weekly bear stack: price below the 50 SMA, 50 below the 200' },
          { v:'mixed', l:'Tangled / crossing', sub:'MAs flat or crossing, price between them.', dg:C('maMixed', 1), dir:0, pts:2, warn:'Weekly MAs are tangled — the trend is weak', ai:'weekly MAs tangled' }
        ] },

      { id:'w1_pd', stage:1, type:'single', short:'W1 premium / discount', tf:'W1', align:'soft',
        q:'Fib the last weekly swing. Where is price?',
        help:'<b>Buy in discount</b> (below 50%), <b>sell in premium</b> (above 50%). The deeper the discount, the more room the swing has.',
        ref:'smc-pd',
        options:[
          { v:'discount', l:'In discount (below 50%)', sub:'Favours longs.', dg:() => pdDg('discount'), dir:1, pts:10, ai:'price in weekly discount' },
          { v:'premium', l:'In premium (above 50%)', sub:'Favours shorts.', dg:() => pdDg('premium'), dir:-1, pts:10, ai:'price in weekly premium' },
          { v:'eq', l:'At 50% (equilibrium)', sub:'No location edge.', dg:() => pdDg('eq'), dir:0, pts:4, warn:'Price at weekly equilibrium — less room to run', ai:'price at weekly equilibrium' }
        ] },

      { id:'zone', stage:2, type:'single', short:'D1 zone', tf:'D1', align:'critical',
        q:'On the daily chart, what zone has the pullback reached?',
        help:'The pullback must reach a zone where big orders sit. The best is a <b>demand/supply zone or order block inside the fib golden pocket</b>.',
        ref:'smc-snd',
        options:[
          { v:'snd_bull', l:'Daily demand zone', sub:'Drop–base–rally. Price is back at the base.', dg:C('snd', 1), dir:1, pts:20, ref:'smc-snd', ai:'daily demand zone (drop-base-rally)' },
          { v:'fib_bull', l:'Golden pocket (61.8–65%)', sub:'Of the last weekly up-leg.', dg:C('fibGolden', 1), dir:1, pts:20, ref:'fib-golden', ai:'61.8–65% golden pocket of the last weekly up-leg' },
          { v:'ob_bull', l:'Daily bullish order block', sub:'Last down candle before the weekly push.', dg:C('ob', 1), dir:1, pts:18, ref:'smc-ob-bull', ai:'daily bullish order block' },
          { v:'flip_bull', l:'Old weekly resistance → support', sub:'Retesting a level the weekly broke.', dg:C('flip', 1), dir:1, pts:15, ref:'ex-support-and-resistance', ai:'old weekly resistance retested as support' },
          { v:'snd_bear', l:'Daily supply zone', sub:'Rally–base–drop. Price is back at the base.', dg:C('snd', -1), dir:-1, pts:20, ref:'smc-snd', ai:'daily supply zone (rally-base-drop)' },
          { v:'fib_bear', l:'Golden pocket (61.8–65%)', sub:'Of the last weekly down-leg.', dg:C('fibGolden', -1), dir:-1, pts:20, ref:'fib-golden', ai:'61.8–65% golden pocket of the last weekly down-leg' },
          { v:'ob_bear', l:'Daily bearish order block', sub:'Last up candle before the weekly drop.', dg:C('ob', -1), dir:-1, pts:18, ref:'smc-ob-bear', ai:'daily bearish order block' },
          { v:'flip_bear', l:'Old weekly support → resistance', sub:'Retesting a level the weekly broke.', dg:C('flip', -1), dir:-1, pts:15, ref:'ex-support-and-resistance', ai:'old weekly support retested as resistance' },
          { v:'none', l:'Not at a zone yet', sub:'Still pulling back through open space.', dg:C('noZone', 1), dir:0, pts:0, gate:'wait', why:'Mark the zone, set an alert and wait. Swings are about entering at the right price.', ai:'pullback not at a zone yet' }
        ] },

      { id:'pushes', stage:2, type:'single', short:'Push count', tf:'W1', compact:true,
        q:'Count the weekly trend pushes. Which push would this trade be?',
        help:'Trends usually make <b>3 pushes</b>. The first two pay best; by the third, the big players are taking profit.',
        ref:'ex-push-count-wave-exhaustion',
        options:[
          { v:'early', l:'1st or 2nd push', sub:'Trend has room to run.', dg:() => D.chart(UT.DG.push12, UT.bias() || 1), dir:0, pts:8, ai:'1st or 2nd push of the weekly trend' },
          { v:'late', l:'3rd push or later', sub:'Trend is mature — exhaustion risk.', dg:() => D.chart(UT.DG.push3, UT.bias() || 1), dir:0, pts:1, warn:'3rd weekly push — take profit early, smaller size', ai:'3rd push or later — exhaustion risk' }
        ] },

      { id:'trigger', stage:3, type:'single', short:'H4 trigger', tf:'H4', align:'critical',
        q:'On the H4, has the pullback finished? What has closed?',
        help:'The zone is where. The H4 is when. The pullback usually forms a small pattern — a <b>flag, wedge or double bottom/top</b>. Its breakout is your trigger.',
        ref:'pat-flag',
        options:[
          { v:'pat_bull', l:'Bullish pattern broke out', sub:'Bull flag, falling wedge, double bottom or inverse H&S.', dg:() => D.ref('pat-flag'), dir:1, pts:22, ref:'pat-fw', ai:'H4 bullish pullback pattern breakout (flag / falling wedge / double bottom / inverse H&S)' },
          { v:'choch_bull', l:'Bullish H4 CHoCH', sub:'Broke the last H4 lower high with force.', dg:C('trigChoch', 1), dir:1, pts:20, ref:'smc-choch', ai:'H4 bullish change of character out of the zone' },
          { v:'eng_bull', l:'Daily bullish engulfing / pin', sub:'Strong daily rejection candle closed at the zone.', dg:C('trigEngulf', 1), dir:1, pts:16, ref:'ex-bullish-candlestick-signals', ai:'daily bullish engulfing / pin bar at the zone' },
          { v:'pat_bear', l:'Bearish pattern broke down', sub:'Bear flag, rising wedge, double top or H&S.', dg:() => D.ref('pat-bflag'), dir:-1, pts:22, ref:'pat-rw', ai:'H4 bearish pullback pattern breakdown (flag / rising wedge / double top / H&S)' },
          { v:'choch_bear', l:'Bearish H4 CHoCH', sub:'Broke the last H4 higher low with force.', dg:C('trigChoch', -1), dir:-1, pts:20, ref:'smc-choch', ai:'H4 bearish change of character out of the zone' },
          { v:'eng_bear', l:'Daily bearish engulfing / shooting star', sub:'Strong daily rejection candle closed at the zone.', dg:C('trigEngulf', -1), dir:-1, pts:16, ref:'ex-bearish-candlestick-signals', ai:'daily bearish engulfing / shooting star at the zone' },
          { v:'none', l:'No trigger yet', sub:'Pullback still going — no breakout.', dg:C('trigNone', 1), dir:0, pts:0, gate:'wait', why:'Wait for the H4 pattern to break or a daily rejection candle to close. Set an alert at the pattern line.', ai:'no H4 trigger yet' }
        ] },

      { id:'confluence', stage:3, type:'multi', short:'Confluence', tf:'D1/H4', max:15, compact:true,
        q:'Tick every extra confirmation you can see. (Skip if none.)',
        help:'Each one strengthens the swing. <b>Two or three</b> is an A-grade setup.',
        options:[
          { v:'div', l:'Daily RSI divergence', sub:'Price made a deeper pullback, RSI did not.', dg:() => D.ref(UT.bias() < 0 ? 'ind-rsi-bear-div' : 'ind-rsi-bull-div'), pts:5, ref:'ind-rsi-bull-div', ai:'daily RSI divergence into the zone' },
          { v:'round', l:'Big round number in the zone', sub:'e.g. 2300.00, 1.0800, 18.00.', dg:() => D.ref('ind-round'), pts:4, ref:'ind-round', ai:'major round number inside the zone' },
          { v:'cluster', l:'Fib cluster', sub:'Two fib levels from different swings meet.', dg:() => D.ref('fib-cluster'), pts:4, ref:'fib-cluster', ai:'fibonacci cluster at the zone' },
          { v:'bb', l:'Bollinger band tag', sub:'Daily candle tagged the outer band and closed back inside.', dg:() => D.ref('ind-bb-revert'), pts:3, ref:'ind-bb-revert', ai:'daily Bollinger band tag and close back inside' },
          { v:'cot', l:'COT positioning agrees', sub:'Large speculators adding in your direction.', dg:() => D.ref('ind-cot'), pts:4, ref:'ind-cot', ai:'COT positioning agrees' },
          { v:'dxy', l:'DXY agrees', sub:'USD pairs, gold and indices.', dg:() => D.ref('mgt-dxy'), pts:4, ref:'mgt-dxy', ai:'DXY confirms the direction' }
        ] },

      { id:'levels', stage:4, type:'levels', short:'Levels',
        q:'Type the prices from your daily chart.',
        help:'Your <b>stop goes beyond the daily swing</b> the pullback came from. Targets: the daily swing, the next <b>weekly level</b>, and Blue Mac adds the <b>fib 127.2% extension</b> automatically.',
        hero: () => D.ref('fib-ext'), heroCap:'Swing targets: the swing high, then the 127.2% and 161.8% extensions', ref:'fib-ext',
        fields:[
          { id:'price', label:'Current price', req:true, hint:'The live price on your chart.' },
          { id:'swing_hi', label:'Daily swing high', req:true, hint:'The high the pullback started from (longs) — or the last daily lower high (shorts: stop above it).' },
          { id:'swing_lo', label:'Daily swing low', req:true, hint:'The low the rally started from (shorts) — or the last daily higher low (longs: stop below it).' },
          { id:'zone_hi', label:'Zone top', hint:'Top of the demand/supply zone, order block or golden pocket.' },
          { id:'zone_lo', label:'Zone bottom', hint:'Bottom of the same zone.' },
          { id:'w_up', label:'Weekly level above', hint:'Next weekly resistance / swing high — long target.' },
          { id:'w_dn', label:'Weekly level below', hint:'Next weekly support / swing low — short target.' }
        ],
        shots:['Weekly chart', 'Daily chart', 'H4 chart'],
        check(L, num){ return UT.stdCheck(L, num, 'daily'); } }
    ],

    levelMap(dir, L, num){
      return UT.stdLevels(dir, L, num, { tf:'daily', up:[['w_up','weekly level above']], dn:[['w_dn','weekly level below']], buf:0.05, ext:true });
    },

    prompt(x){
      return `You are a professional swing trader who trades the "Weekly Zone Swing" for Blue Mac, a South African trading platform. Your reader may be a beginner — explain like a mentor, simply and precisely.

THE STRATEGY:
1. The weekly chart sets the bias: structure plus the 50/200 SMA stack, ideally from discount (longs) or premium (shorts).
2. Wait for the daily to pull back into a zone: demand/supply, daily order block, the 61.8–65% golden pocket or a flipped weekly level.
3. Prefer the 1st or 2nd weekly push; a 3rd push is exhaustion risk.
4. Trigger on the H4: a pullback-pattern breakout (flag, wedge, double bottom/top, H&S), an H4 change of character, or a daily engulfing at the zone.
5. Stop beyond the daily swing. Targets: daily swing, next weekly level, fib 127.2% extension. TP1 at least 1:3, TP2 at least 1:4, Entry 2 always between Entry 1 and the stop.
6. Take a third to a half at TP1, stop to breakeven, trail the rest behind new H4/daily swings. Held for days; checked twice a day.

THE TRADER'S SETUP:
Instrument: ${x.instrument}
Weekly bias: ${x.bias}
Blue Mac score: ${x.score}/100 — ${x.grade}
Status: ${x.status}
${x.answers}

Trader's chart prices:
${x.levels}

Open gates / warnings: ${x.gates}; ${x.warns}

ENGINE PLAN — LONG: ${x.longPlan}
ENGINE PLAN — SHORT: ${x.shortPlan}

The ${x.bias === 'BULLISH' ? 'LONG' : 'SHORT'} idea is with the weekly bias and is the main trade. The other one is counter-trend: explain honestly why it is weaker and what would have to change before it is valid.
If chart screenshots are attached, use them to sharpen the signal, wait condition and invalidation, but never change the engine's prices.`;
    }
  });
})();
