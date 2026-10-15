// ══════════════════════════════════════════════════════
// uTRADE IDEAS · BLUE MAC KEY — "Key MA System+"
// The flagship: 50 & 200 MA stack across 9 timeframes (weighted, higher
// timeframes lead) → pullback to the 50 MA (or the 200 "war zone") on the
// entry timeframe → a real zone at the MA → trigger candle.
// Built from: price vs MAs, MA stack, 50 MA pullback entry, MAs spreading
// vs tangled, order blocks, FVGs, fib golden pocket, S/R, CHoCH, candles.
// ══════════════════════════════════════════════════════
(function(){
  if(!window.UT) return;
  const D = UT.D, C = UT.C;
  const B = () => UT.bias() || 1;   // draw zone diagrams in the direction of the bias

  UT.register('key', {
    name: 'Key MA System+',
    short: 'Blue Mac Key',
    color: 'var(--gold)',
    tfs: '1m → Monthly · 9 timeframes',
    biasTF: 'higher-timeframe (MN/W1/D1/H4)',
    entryTF: 'entry-timeframe',
    minRR: [2, 3],
    desc: 'The Blue Mac Key reads the 50 and 200 moving averages on all 9 timeframes at once. When the big timeframes stack the same way, we wait for price to pull back to the 50 MA on your entry timeframe — at a real zone — and enter on the trigger candle. It says "no" most of the time. That is the point.',
    pills: ['9 timeframes', '62%+ weighted confluence', 'TP1 ≥ 1:2 · TP2 ≥ 1:3', 'Entry 2 at the 200 MA'],
    stages: [{ label:'Safety gates' }, { label:'9-TF MA stack' }, { label:'Entry timeframe' }, { label:'Trigger' }, { label:'Your levels' }],

    rules: {
      icon:'🔑', sub:'50 & 200 MA confluence · higher timeframes lead',
      preflight:[
        ['All 9 timeframes scanned.', 'Monthly, weekly, daily, H4, H1, 30m, 15m, 5m and 1m — each one is a bull stack, bear stack or mixed.'],
        ['Higher timeframes lead.', 'MN, W1, D1 and H4 set the bias and carry the most weight. The lower ones fine-tune the entry.'],
        ['62%+ weighted confluence.', 'Below that the stack is split and there is no edge — uTrade Ideas blocks the trade.'],
        ['Calendar checked.', 'No entries within 30 minutes of red news on the lower timeframes; avoid the 48 hours before a central-bank decision on the higher ones.'],
        ['Risk set.', 'Grade decides size: A+ 1%, A 0.75%, B 0.5%. 3 losses in a day = stop.']
      ],
      steps:[
        ['Read the stack', 'Mark each timeframe: price above both MAs with the 50 above the 200 = bull stack; the mirror = bear stack; anything else = mixed.'],
        ['Pick your entry timeframe', 'Scalp speed (1m–15m), intraday (H1–H4) or swing (D1+). Your stop and targets come from that chart.'],
        ['Wait for the 50 MA', 'Price must pull back to the 50 MA on the entry timeframe (or deeper to the 200 — the war zone). Extended price = wait.'],
        ['Find the zone at the MA', 'An order block, FVG, golden pocket or S/R flip sitting on the MA turns a line into a level.'],
        ['Trigger candle', 'A closed engulfing / pin bar or a CHoCH off the MA. Then type your levels — Entry 1 at the 50 MA, Entry 2 at the 200 MA when it sits above the stop.']
      ],
      stop:'Beyond the entry-timeframe swing (and beyond the 200 MA when Entry 2 sits there), plus a buffer.',
      targets:'The entry-timeframe swing, the target you mark, then the fib 127.2% extension. TP1 at least 1:2, TP2 at least 1:3.',
      manage:'Half off at TP1, stop to breakeven. Trail the rest behind the 50 MA of the entry timeframe — close when a candle closes through it.',
      never:[
        ['Never trade a split stack.', 'Below 62% weighted confluence there is no edge — the Key is telling you to wait.'],
        ['Never fight the Monthly and Weekly.', 'Lower-timeframe signals against the higher-timeframe stack are counter-trend gambles.'],
        ['Never chase price far from the 50 MA.', 'The edge is at the MA. Extended entries have bad stops.'],
        ['Never accept TP1 below 1:2 or TP2 below 1:3.', 'If the targets don\'t give that room, the trade does not qualify.'],
        ['Never place Entry 2 beyond your stop loss.', 'A scale-in past your SL is not an entry — it\'s a hope.']
      ],
      mindset:[
        ['On patience', 'Nine timeframes rarely agree. When they do, that is the trade worth waiting for.'],
        ['On the MA', 'The 50 MA is where the trend breathes in. Buying the breath, not the sprint, is the whole system.'],
        ['On discipline', 'The Key works because it is mechanical. Answer what you see, not what you hope.']
      ]
    },

    questions: [
      { id:'instrument', stage:0, type:'instrument', short:'Instrument',
        q:'What are you analysing with the Key?',
        help:'The Key works on every market and every timeframe. Pick the chart you have open.',
        groups: UT.INSTR },

      { id:'entry_tf', stage:0, type:'single', short:'Entry timeframe', compact:true,
        q:'Which timeframe will you enter on?',
        help:'This is the chart your <b>stop, entries and targets</b> come from. Faster timeframes need the London or New York session; slower ones need patience.',
        options:[
          { v:'ltf', l:'1m – 15m (scalp speed)', sub:'Minutes to an hour. London & NY kill zones only.', dir:0, pts:5, ai:'entry timeframe 1m–15m (scalp speed)',
            check: s => s.cur ? null : `Clock says ${s.nowTxt} SAST — fast Key entries belong in the kill zones (London ${s.fmt(s.lo)}, New York ${s.fmt(s.ny)}).` },
          { v:'mtf', l:'H1 – H4 (intraday)', sub:'Hours to a couple of days.', dir:0, pts:5, ai:'entry timeframe H1–H4 (intraday)' },
          { v:'htf', l:'Daily + (swing / position)', sub:'Days to weeks.', dir:0, pts:5, ai:'entry timeframe daily or higher (swing / position)' }
        ] },

      { id:'news', stage:0, type:'single', short:'News', compact:true,
        q:'Any red-folder news that could hit this trade?',
        help:'For 1m–H4 entries: anything within 30 minutes. For daily entries: a central-bank decision or CPI/NFP in the next 48 hours.',
        ref:'mgt-news',
        options:[
          { v:'clear', l:'No — clear', sub:'Nothing high-impact in the danger window.', dir:0, pts:5, ai:'no high-impact news in the danger window' },
          { v:'soon', l:'Yes — inside the danger window', sub:'News is too close for this entry timeframe.', dir:0, pts:0, gate:'block', why:'Let the news pass. Moving averages mean nothing during a news spike — re-run the Key afterwards.' }
        ] },

      { id:'stack', stage:1, type:'matrix', short:'9-TF MA stack', bias:true, pts:35, min:0.62,
        q:'Scan all 9 timeframes. How are the 50 and 200 MAs stacked on each?',
        help:'<b>▲ Bull stack</b> = price above both MAs and the 50 above the 200. <b>▼ Bear stack</b> = price below both, 50 below 200. <b>◆ Mixed</b> = anything else. The top four timeframes set the bias.',
        hero: () => `<div class="ut-hero-row">${[['maStack',1,'▲ BULL STACK','var(--bull)'],['maStack',-1,'▼ BEAR STACK','var(--bear)'],['maMixed',1,'◆ MIXED','var(--text2)']].map(([k,d,t,c]) =>
          `<div><div>${D.chart(UT.DG[k], d)}</div><b style="color:${c}">${t}</b></div>`).join('')}</div>`,
        heroCap:'Blue = 50 MA · Silver = 200 MA', ref:'ex-ma-stack-50-vs-200',
        rows:[['MN','Monthly',14,true],['W1','Weekly',13,true],['D1','Daily',12,true],['H4','4-hour',11,true],['H1','1-hour',10,false],['30m','30-minute',8,false],['15m','15-minute',8,false],['5m','5-minute',6,false],['1m','1-minute',4,false]],
        cols:[{ v:'bull', l:'▲ Bull', dir:1, ai:'bull stack' }, { v:'bear', l:'▼ Bear', dir:-1, ai:'bear stack' }, { v:'mix', l:'◆ Mixed', dir:0, ai:'mixed' }] },

      { id:'ma_pull', stage:2, type:'single', short:'Price vs 50 MA', tf:'entry TF', align:'critical',
        q:'On your entry timeframe, where is price compared to the moving averages?',
        help:'The Key buys the <b>pullback to the 50 MA</b> in a bull stack (sells the rally to it in a bear stack). A deeper dip to the <b>200 MA is the war zone</b> — still valid, but the fight is harder.',
        ref:'ex-the-50-ma-pullback-entry',
        options:[
          { v:'p50_bull', l:'Pulled back to the 50 MA', sub:'Bull stack, price touching the 50 from above.', dg:C('maPull50', 1), dir:1, pts:18, ref:'ex-the-50-ma-pullback-entry', ai:'price pulled back to the 50 MA in a bull stack' },
          { v:'p200_bull', l:'Dipped to the 200 MA (war zone)', sub:'Deeper pullback, testing the 200 from above.', dg:C('maPull200', 1), dir:1, pts:13, warn:'At the 200 MA war zone — expect a fight, smaller size', ai:'price dipped to the 200 MA war zone in an uptrend' },
          { v:'p50_bear', l:'Rallied to the 50 MA', sub:'Bear stack, price touching the 50 from below.', dg:C('maPull50', -1), dir:-1, pts:18, ref:'ex-the-50-ma-pullback-entry', ai:'price rallied to the 50 MA in a bear stack' },
          { v:'p200_bear', l:'Rallied to the 200 MA (war zone)', sub:'Deeper rally, testing the 200 from below.', dg:C('maPull200', -1), dir:-1, pts:13, warn:'At the 200 MA war zone — expect a fight, smaller size', ai:'price rallied to the 200 MA war zone in a downtrend' },
          { v:'extended', l:'Far away from the MAs', sub:'Price is stretched — no pullback yet.', dg:() => D.chart(UT.DG.maExtended, B()), dir:0, pts:0, gate:'wait', why:'The edge is AT the moving average. Set an alert at the 50 MA and wait for price to come back to it.', ai:'price extended far from the MAs' }
        ] },

      { id:'zone', stage:2, type:'single', short:'Zone at the MA', tf:'entry TF', compact:false,
        q:'What else is sitting on that moving average?',
        help:'An MA on its own is just a line. When an <b>order block, FVG, golden pocket or old S/R level</b> sits right on it, institutions are defending the same price from two angles.',
        ref:'smc-ob-fvg',
        options:[
          { v:'obfvg', l:'Order block or FVG', sub:'A zone from the last impulse sits on the MA.', dg:() => D.chart(UT.DG.ob, B()), dir:0, pts:12, ref:'smc-ob-fvg', ai:'an order block / FVG sits on the MA' },
          { v:'fib', l:'Fib golden pocket', sub:'61.8–65% of the last leg lines up with the MA.', dg:() => D.chart(UT.DG.fibGolden, B()), dir:0, pts:12, ref:'fib-ma', ai:'the 61.8–65% golden pocket lines up with the MA' },
          { v:'sr', l:'Old support / resistance', sub:'A flipped level sits on the MA.', dg:() => D.chart(UT.DG.flip, B()), dir:0, pts:10, ref:'ex-support-and-resistance', ai:'a flipped S/R level sits on the MA' },
          { v:'none', l:'Just the MA', sub:'No other structure at that price.', dg:() => D.chart(UT.DG.maPull50, B()), dir:0, pts:2, warn:'Only the MA — no zone behind it. Take TP1 quickly.', ai:'only the MA, no other zone' }
        ] },

      { id:'trigger', stage:3, type:'single', short:'Trigger', tf:'entry TF', align:'critical',
        q:'What has the last closed candle done at the MA?',
        help:'Wait for the MA to <b>hold</b>. Only count candles that have <b>closed</b> on your entry timeframe.',
        ref:'ex-bullish-candlestick-signals',
        options:[
          { v:'choch_bull', l:'Bullish CHoCH off the MA', sub:'Broke the last lower high with a strong candle.', dg:C('trigChoch', 1), dir:1, pts:20, ref:'smc-choch', ai:'bullish change of character off the MA' },
          { v:'eng_bull', l:'Bullish engulfing / pin bar', sub:'Rejection candle closed at the MA.', dg:C('trigEngulf', 1), dir:1, pts:16, ref:'ex-bullish-candlestick-signals', ai:'bullish engulfing / pin bar at the MA' },
          { v:'choch_bear', l:'Bearish CHoCH off the MA', sub:'Broke the last higher low with a strong candle.', dg:C('trigChoch', -1), dir:-1, pts:20, ref:'smc-choch', ai:'bearish change of character off the MA' },
          { v:'eng_bear', l:'Bearish engulfing / shooting star', sub:'Rejection candle closed at the MA.', dg:C('trigEngulf', -1), dir:-1, pts:16, ref:'ex-bearish-candlestick-signals', ai:'bearish engulfing / shooting star at the MA' },
          { v:'none', l:'No trigger yet', sub:'Price is sitting on the MA, undecided.', dg:C('trigNone', 1), dir:0, pts:0, gate:'wait', why:'The MA has not been defended yet. Wait for a closed trigger candle.', ai:'no trigger candle yet' }
        ] },

      { id:'confluence', stage:3, type:'multi', short:'Confluence', tf:'entry TF', max:12, compact:true,
        q:'Tick every extra confirmation you can see. (Skip if none.)',
        help:'Extras that strengthen the MA bounce.',
        options:[
          { v:'spread', l:'MAs spreading apart', sub:'50 and 200 widening in the trend direction.', dg:() => D.ref('ex-mas-spreading-vs-tangled'), pts:4, ref:'ex-mas-spreading-vs-tangled', ai:'50 and 200 MAs spreading apart in the trend direction' },
          { v:'div', l:'RSI divergence at the MA', sub:'Price dipped deeper, RSI did not.', dg:() => D.ref(UT.bias() < 0 ? 'ind-rsi-bear-div' : 'ind-rsi-bull-div'), pts:4, ref:'ind-rsi-bull-div', ai:'RSI divergence at the MA' },
          { v:'round', l:'Round number at the MA', sub:'e.g. 2350.00, 1.0800.', dg:() => D.ref('ind-round'), pts:3, ref:'ind-round', ai:'round number at the MA' },
          { v:'vwap', l:'VWAP on your side', sub:'Intraday entries only.', dg:() => D.ref('ind-vwap'), pts:3, ref:'ind-vwap', ai:'VWAP agrees' },
          { v:'dxy', l:'DXY agrees', sub:'USD pairs, gold and indices.', dg:() => D.ref('mgt-dxy'), pts:3, ref:'mgt-dxy', ai:'DXY confirms the direction' }
        ] },

      { id:'levels', stage:4, type:'levels', short:'Levels',
        q:'Type the prices from your entry-timeframe chart.',
        help:'Entry 1 goes at the <b>50 MA</b>. Entry 2 goes at the <b>200 MA</b> when it sits above your stop — otherwise halfway to the stop. The stop goes beyond the swing.',
        hero: C('maPull50', 1), heroCap:'Entry 1 = 50 MA · Entry 2 = 200 MA (if above the stop) · Stop beyond the swing', ref:'ex-the-50-ma-pullback-entry',
        fields:[
          { id:'price', label:'Current price', req:true, hint:'The live price.' },
          { id:'ma50', label:'50 MA value', req:true, hint:'Hover the 50 MA on your entry chart and read its price.' },
          { id:'ma200', label:'200 MA value', req:true, hint:'Same for the 200 MA.' },
          { id:'swing_hi', label:'Swing high', req:true, hint:'Last swing high on the entry chart. Shorts: stop above it. Longs: first target.' },
          { id:'swing_lo', label:'Swing low', req:true, hint:'Last swing low on the entry chart. Longs: stop below it. Shorts: first target.' },
          { id:'t_up', label:'Target above', hint:'Next higher-timeframe level above — long target.' },
          { id:'t_dn', label:'Target below', hint:'Next higher-timeframe level below — short target.' }
        ],
        shots:['Higher-timeframe chart', 'Entry-timeframe chart', 'Trigger chart'],
        check(L, num){ return UT.stdCheck(L, num, 'entry-timeframe'); } }
    ],

    // Entry 1 at the 50 MA, Entry 2 at the 200 MA (when it sits between Entry 1 and the stop)
    levelMap(dir, L, num){
      const p = num(L.price), hi = num(L.swing_hi), lo = num(L.swing_lo), m50 = num(L.ma50), m200 = num(L.ma200);
      if(![p, hi, lo].every(isFinite)) return null;
      const buf = (hi - lo) * 0.04;
      let sl = dir > 0 ? lo - buf : hi + buf, slwhy = dir > 0 ? 'below the swing low + buffer' : 'above the swing high + buffer';
      // 50 MA is a valid limit entry when it sits on the pullback side of price and above the stop
      let e1 = p, e1why = 'market price';
      if(isFinite(m50) && dir * (p - m50) >= 0 && dir * (m50 - sl) > 0){ e1 = m50; e1why = dir * (p - m50) > 0 ? 'limit order at the 50 MA' : 'price is at the 50 MA'; }
      let e2, e2why;
      if(isFinite(m200) && dir * (e1 - m200) > 0 && dir * (m200 - sl) > 0){ e2 = m200; e2why = '200 MA — the war zone'; }
      else { e2 = e1 - dir * (e1 - sl) * 0.5; e2why = 'halfway to the stop (better price)'; }
      const tg = (dir > 0 ? [[hi, 'entry-timeframe swing high'], [num(L.t_up), 'higher-timeframe level above'], [hi + (hi - lo) * 0.272, 'fib 127.2% extension']]
                          : [[lo, 'entry-timeframe swing low'], [num(L.t_dn), 'higher-timeframe level below'], [lo - (hi - lo) * 0.272, 'fib 127.2% extension']]);
      return { e1, e2, sl, e1why, e2why, slwhy, tg };
    },

    prompt(x){
      return `You are the head trader of the "Blue Mac Key" system for Blue Mac, a South African trading platform. Your reader may be a beginner — explain like a mentor, simply and precisely.

THE STRATEGY (Key MA System+):
1. Read the 50 and 200 moving averages on 9 timeframes (MN, W1, D1, H4, H1, 30m, 15m, 5m, 1m). Bull stack = price above both, 50 above 200. Bear stack = the mirror.
2. MN, W1, D1 and H4 set the bias and carry the most weight. Trade only with 62%+ weighted confluence.
3. On the entry timeframe, enter the pullback to the 50 MA (or the 200 MA "war zone"), ideally where an order block, FVG, golden pocket or flipped level sits on the MA.
4. Trigger: a closed engulfing / pin bar or a change of character off the MA.
5. Entry 1 at the 50 MA, Entry 2 at the 200 MA when it sits above the stop. Stop beyond the swing. TP1 at least 1:2, TP2 at least 1:3.
6. Half off at TP1, stop to breakeven, trail the rest behind the entry-timeframe 50 MA.

THE TRADER'S SETUP:
Instrument: ${x.instrument}
Higher-timeframe bias: ${x.bias}
Blue Mac score: ${x.score}/100 — ${x.grade}
Status: ${x.status}
${x.answers}

Trader's chart prices:
${x.levels}

Open gates / warnings: ${x.gates}; ${x.warns}

ENGINE PLAN — LONG: ${x.longPlan}
ENGINE PLAN — SHORT: ${x.shortPlan}

The ${x.bias === 'BULLISH' ? 'LONG' : 'SHORT'} idea is with the MA stack and is the main trade. The other one is counter-trend: explain honestly why it is weaker and what would have to change before it is valid.
If chart screenshots are attached, use them to sharpen the signal, wait condition and invalidation, but never change the engine's prices.`;
    }
  });
})();
