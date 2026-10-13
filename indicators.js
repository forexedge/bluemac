// ══════════════════════════════════════════════════════
// EXAMPLES → INDICATORS LIBRARY
// Institutional tools + classic indicators. All values computed live
// from the generated candles (see exengine.js).
// ══════════════════════════════════════════════════════
(function(){
  if(!window.BMX) return;
  const GROUPS = [
    ['all','All Indicators','#2A8FE3'],
    ['inst','Institutional','#F5B841'],
    ['trend','Trend','#2A8FE3'],
    ['osc','Oscillators','#96D0FF'],
    ['volat','Volatility','#8AA4BF']
  ];

  // helpers
  const crossUp = (a, b, from, to) => { for(let i = from; i <= to; i++) if(a[i-1] !== null && b[i-1] !== null && a[i] !== null && b[i] !== null && a[i-1] <= b[i-1] && a[i] > b[i]) return i; return -1; };
  const argMin = (arr, a, b) => { let k = a; for(let i = a; i <= b; i++) if(arr[i] < arr[k]) k = i; return k; };
  const argMax = (arr, a, b) => { let k = a; for(let i = a; i <= b; i++) if(arr[i] > arr[k]) k = i; return k; };
  const mirror = pts => pts.map(p => [p[0], 100 - p[1], p[2]]);

  const IND = [
    // ───────── INSTITUTIONAL ─────────
    { id:'vwap', name:'VWAP — The Institutional Benchmark', icon:'🏛️', g:'inst', bias:'bull',
      desc:`<strong>VWAP (Volume-Weighted Average Price)</strong> is the average price of the day, weighted by volume. Bank and fund execution desks are judged against it — they try to <strong>buy below VWAP and sell above it</strong>. That's why price reacts to it so often.`,
      how:`Above VWAP = buyers in control, only look for buys. Wait for price to pull back to VWAP and show a bullish rejection, then buy. SL below the pullback low. Below VWAP = the opposite.`,
      tip:`VWAP resets every session. It's most powerful on intraday charts (M5–H1) during London and New York.`,
      tag:'▲ ABOVE VWAP · BUY THE PULLBACK TO IT',
      chart:{ n:60, seed:3, noise:1.0, vspike:{0:2.2,1:1.8,2:1.6},
        pts:[[0,40],[10,36],[20,50],[28,58],[35,53],[41,47],[43,47.5],[50,57],[59,65]],
        ov:[{ t:'vwap', from:0 }],
        marks: x => { const v = x.ind.vwap, i = argMin(x.d.l.map((l, k) => k < 34 || k > 46 ? 1e9 : l - v[k]), 34, 46);
          return [{ t:'dot', i, p:v[i], c:'bull' }, { t:'text', i, p:v[i] - 6, s:'BUY AT VWAP', c:'bull' }]; } } },

    { id:'vp', name:'Volume Profile — POC & Value Area', icon:'📊', g:'inst', bias:'bull',
      desc:`Volume profile shows <strong>how much volume traded at each price</strong> (sideways bars). The <strong>POC</strong> (point of control) is the busiest price. The <strong>value area</strong> (VAH–VAL) holds ~70% of all volume — that's where institutions agreed on "fair value".`,
      how:`Inside the value area, expect price to rotate between VAH and VAL. When price breaks out and retests the VAH from above, buy — the old value area is now support. Targets: next high-volume node or measured move.`,
      tip:`Thin areas on the profile (low-volume nodes) get crossed fast. Thick areas (high-volume nodes) slow price down and act as support/resistance.`,
      tag:'▲ BREAK OUT OF VALUE · BUY THE VAH RETEST',
      chart:{ n:70, seed:11, noise:1.3,
        pts:[[0,50],[8,56],[16,46],[24,54],[32,47],[40,53],[46,50],[52,63],[56,60],[60,57.5],[65,66],[69,70]],
        ov:[{ t:'vp', from:0, to:49, w:52 }],
        marks: x => { const vah = x.ind.vp.vah, i = argMin(x.d.l, 55, 63);
          return [{ t:'dot', i, p:vah, c:'bull' }, { t:'text', i, p:vah - 5, s:'RETEST', c:'bull' }]; } } },

    { id:'pivots', name:'Pivot Points (Daily)', icon:'🎚️', g:'inst', bias:'bull',
      desc:`Pivot points are calculated from <strong>yesterday's high, low and close</strong>. Bank dealing desks still print them every morning, so <strong>P, R1, R2, S1 and S2</strong> become self-fulfilling levels for the new day.`,
      how:`Price above P = bullish day, look to buy dips into P or S1. Price below P = bearish day, sell rallies into P or R1. Use R1/R2 and S1/S2 as targets.`,
      tip:`P = (H + L + C) ÷ 3 · R1 = 2P − L · S1 = 2P − H · R2 = P + (H − L) · S2 = P − (H − L). Most platforms draw them for you.`,
      tag:'▲ BOUNCE OFF S1 → TARGET P, THEN R1',
      chart:{ n:70, seed:5, noise:1.1,
        pts:[[0,50],[8,60],[14,56],[20,43],[29,54],[34,50],[41,45],[44,45.5],[52,53],[60,58],[69,63]],
        ov:[{ t:'pivots', a:0, b:29, from:30, show:['R1','P','S1','S2'] }], dimBefore:30,
        marks: x => { const s1 = x.ind.pivots.S1, i = argMin(x.d.l, 36, 48);
          return [{ t:'dot', i, p:s1, c:'bull' }, { t:'text', i, p:s1 - 5.5, s:'BUY S1', c:'bull' }]; } } },

    { id:'pdhl', name:'Previous Day High & Low (PDH / PDL)', icon:'📅', g:'inst', bias:'bear',
      desc:`Yesterday's high and low are where <strong>stop losses and breakout orders pile up</strong>. Institutions often push price just beyond them to grab that liquidity, then reverse — or break through them for a trend day.`,
      how:`Watch for a wick above PDH that closes back below it (a sweep). Sell the close back inside, SL above the sweep wick, target PDL. A strong close <strong>above</strong> PDH instead = breakout, look for buys.`,
      tip:`Same logic works for the previous week's and month's high/low on bigger timeframes — and for the Asian session range.`,
      tag:'▼ SWEEP OF PDH → SELL BACK TO PDL',
      chart:{ n:70, seed:9, noise:1.0,
        pts:[[0,48],[10,58],[20,44],[29,52],[37,55],[42,58],[44,63],[46,57],[56,48],[64,45],[69,43]],
        ov:[{ t:'pdhl', a:0, b:29, from:30 }], dimBefore:30,
        marks: x => { const i = argMax(x.d.h, 40, 48);
          return [{ t:'ring', i, p:x.H(i), c:'bear' }, { t:'text', i, p:x.H(i) + 4, s:'SWEEP', c:'bear' },
                  { t:'arrow', pts:[[i + 2, x.H(i) - 3], [62, x.ind.pdhl.L + 2]], c:'bear' }]; } } },

    { id:'round', name:'Round Numbers (Psychological Levels)', icon:'🔵', g:'inst', bias:'bear',
      desc:`Prices like <strong>1.1000, 1.0950, 150.00 or 2000.00</strong> attract huge orders — take-profits, limit orders and options all cluster there. Price often stalls or reverses at them, especially the "00" and "50" levels.`,
      how:`Don't put your entry or stop exactly on a round number — that's where everyone else's is. Use them as targets, and look for rejection candles at them for entries. SL a few pips beyond the level.`,
      tip:`On gold, every $10 and $50 level (2350, 2400) matters. On JPY pairs, every 0.50 (150.00, 150.50).`,
      tag:'▼ DOUBLE REJECTION AT 1.1000',
      chart:{ n:60, seed:21, noise:0.9, fitExtra:[56],
        pts:[[0,22],[14,38],[24,49],[28,43],[36,49.4],[41,42],[52,32],[59,28]],
        ov:[{ t:'level', p:50, c:'silver', l:'1.1000', dash:'', w:1.4 }, { t:'level', p:25, c:'slate', l:'1.0950' }],
        marks: x => { const a = argMax(x.d.h, 20, 28), b = argMax(x.d.h, 32, 40);
          return [{ t:'ring', i:a, p:x.H(a), c:'bear' }, { t:'ring', i:b, p:x.H(b), c:'bear' }, { t:'text', i:(a + b) / 2, p:55, s:'REJECTED ×2', c:'bear' }]; } } },

    { id:'volume', name:'Volume — Real vs Fake Breakouts', icon:'🔊', g:'inst', bias:'bull',
      desc:`Volume shows <strong>how much participation</strong> is behind a move. A breakout on <strong>low volume</strong> is usually a trap — institutions aren't involved. A breakout on a <strong>volume spike</strong> means big money is pushing it.`,
      how:`Only trust breakouts where volume is well above average. Buy the close above resistance (or its retest) on high volume. Ignore or fade breakouts on below-average volume.`,
      tip:`In forex, volume is tick volume (number of price changes), not real contracts — but it still tracks real activity very well.`,
      tag:'▲ HIGH-VOLUME BREAKOUT = REAL',
      chart:{ n:50, seed:4, noise:1.0, vspike:{ 20:0.45, 21:0.4, 22:0.45, 44:3.4, 45:2.8, 46:2.0 },
        pts:[[0,45],[6,52],[12,44],[18,53],[21,57],[24,50],[30,45],[36,52],[40,48],[43,53],[46,62],[49,66]],
        ov:[{ t:'level', p:55, c:'bear', l:'RES' }],
        pane:{ t:'vol', avg:true, l:'VOLUME', hl:[21, 44, 45] },
        marks: x => [{ t:'text', i:21, p:x.H(21) + 4, s:'FAKE', c:'bear' }, { t:'text', i:44, p:x.H(46) + 4, s:'REAL', c:'bull' }] } },

    { id:'cot', name:'COT Report — What the Big Players Hold', icon:'📑', g:'inst', bias:'bear',
      desc:`Every Friday the CFTC publishes the <strong>Commitments of Traders (COT)</strong> report — how many long and short futures contracts the big speculators (hedge funds) hold. It shows <strong>where the smart money is positioned</strong> on each currency.`,
      how:`Use it on the weekly chart for bias, not entries. When large specs are at an <strong>extreme net long</strong> and start reducing, a top is often near — look for sells on your normal setups. Extreme net short and covering = look for buys.`,
      tip:`Free on the CFTC website, or use a COT chart site. Data is from Tuesday, released Friday — it's a slow, big-picture tool.`,
      tag:'▼ EXTREME LONG POSITIONING → TOP FORMS',
      chart:{ n:40, seed:8, noise:1.5,
        pts:[[0,30],[10,42],[20,55],[27,66],[30,69],[33,63],[39,48]],
        pane:{ t:'bars', l:'COT NET LONG', cPos:'#2A8FE3', hl:[27,28,29],
          data:Array.from({ length:40 }, (_, i) => i <= 28 ? 8 + i * 2.6 + Math.sin(i * 1.3) * 3 : 81 - (i - 28) * 6.5) },
        marks: x => { const t = argMax(x.d.h, 25, 33);
          return [{ t:'hline', p:75, pane:true, c:'bear', l:'EXTREME' }, { t:'ring', i:t, p:x.H(t), c:'bear' }, { t:'text', i:t, p:x.H(t) + 5, s:'TOP', c:'bear' }]; } } },

    // ───────── TREND ─────────
    { id:'ema', name:'EMA 9 / 21 Crossover', icon:'✂️', g:'trend', bias:'bull',
      desc:`The <strong>9 EMA</strong> (fast) and <strong>21 EMA</strong> (slow) show short-term momentum. When the 9 crosses above the 21, momentum has flipped bullish. It's the classic scalping trend filter.`,
      how:`After the 9 crosses above the 21, don't chase — wait for price to pull back to the EMAs and buy the bounce. SL below the 21 EMA / swing low. Exit when the 9 crosses back below the 21.`,
      tip:`In a range the EMAs cross back and forth constantly (whipsaw). Only trade crosses that agree with your higher-timeframe bias.`,
      tag:'▲ 9 CROSSES ABOVE 21 → BUY PULLBACKS',
      chart:{ n:70, show:56, seed:6, noise:1.0,
        pts:[[0,70],[25,44],[31,40],[37,42],[46,53],[51,50],[57,57],[69,68]],
        ov:[{ t:'ema', n:9, c:'blue', l:'EMA 9' }, { t:'ema', n:21, c:'amber', l:'EMA 21' }],
        marks: x => { const a = x.ind.ema9, b = x.ind.ema21, i = crossUp(a, b, 30, 55), p = argMin(x.d.l, 48, 54);
          return [{ t:'dot', i, p:a[i], c:'blue' }, { t:'text', i, p:a[i] - 7, s:'CROSS', c:'blue' },
                  { t:'dot', i:p, p:x.L(p), c:'bull' }, { t:'text', i:p, p:x.L(p) - 5.5, s:'BUY', c:'bull' }]; } } },

    { id:'ichimoku', name:'Ichimoku Cloud', icon:'☁️', g:'trend', bias:'bull',
      desc:`An all-in-one Japanese trend system. The <strong>cloud (kumo)</strong> is support/resistance: price above a green cloud = uptrend, below a red cloud = downtrend. <strong>Tenkan</strong> (fast) and <strong>Kijun</strong> (slow) work like moving averages.`,
      how:`Buy when price closes above the cloud and Tenkan is above Kijun. Add on pullbacks to the Kijun. SL below the Kijun or the cloud. Stay out while price is inside the cloud — that's no-man's land.`,
      tip:`Popular with Japanese banks and very reliable on JPY pairs and higher timeframes (H4, D1). The cloud is plotted 26 candles ahead, so you can see future support.`,
      tag:'▲ BREAK ABOVE THE CLOUD · TENKAN > KIJUN',
      chart:{ n:130, show:60, seed:12, noise:1.1,
        pts:[[0,62],[30,48],[55,38],[72,36],[84,44],[95,53],[102,50],[110,54],[118,62],[129,70]],
        ov:[{ t:'ichi' }],
        marks: x => { const ic = x.ind.ichi; let k = -1;
          for(let i = x.s0 + 5; i < x.n; i++){ const top = Math.max(ic.sa[i], ic.sb[i]); if(x.d.c[i] > top && x.d.c[i-1] <= Math.max(ic.sa[i-1], ic.sb[i-1])){ k = i; } }
          return k < 0 ? [] : [{ t:'dot', i:k, p:x.d.c[k], c:'bull' }, { t:'text', i:k + 2, p:x.H(k) + 3, s:'BREAKOUT', c:'bull', a:'end' }]; } } },

    { id:'macd', name:'MACD Crossover', icon:'〰️', g:'trend', bias:'bull',
      desc:`<strong>MACD</strong> = the 12 EMA minus the 26 EMA, with a 9-period <strong>signal line</strong>. The histogram shows the gap between them. When MACD crosses above the signal line, momentum is turning up.`,
      how:`Best buy signal: MACD crosses above the signal line <strong>below the zero line</strong> (early in the new move), while price is at support. Confirm with structure. Exit or tighten when it crosses back down.`,
      tip:`Histogram shrinking = momentum fading, even before the lines cross. Use that as an early warning.`,
      tag:'▲ BULLISH CROSS BELOW ZERO',
      chart:{ n:80, show:58, seed:14, noise:1.0,
        pts:[[0,60],[20,53],[32,37],[37,34],[41,36.5],[49,49],[55,47],[63,57],[79,66]],
        ov:[], pane:{ t:'macd', l:'MACD 12·26·9' },
        marks: x => { const m = x.ind.macd, i = (() => { for(let k = x.s0 + 2; k < x.n - 4; k++) if(m.m[k-1] <= m.sig[k-1] && m.m[k] > m.sig[k] && m.m[k] < 0) return k; return -1; })();
          return i < 0 ? [] : [{ t:'dot', i, p:m.m[i], pane:true, c:'bull' }, { t:'vline', i, c:'bull' }, { t:'text', i:i + 1, p:x.L(i) - 5, s:'BUY', c:'bull', a:'start' }]; } } },

    // ───────── OSCILLATORS ─────────
    { id:'rsi', name:'RSI — Overbought & Oversold', icon:'🌡️', g:'osc', bias:'both',
      desc:`The <strong>Relative Strength Index</strong> measures the speed of price moves from 0 to 100. Above <strong>70 = overbought</strong> (buyers stretched), below <strong>30 = oversold</strong> (sellers stretched).`,
      how:`In a <strong>range</strong>: sell when RSI turns down from above 70 at resistance, buy when it turns up from below 30 at support. In a strong <strong>trend</strong>, ignore it — RSI can stay overbought for weeks.`,
      tip:`"Overbought" doesn't mean "sell now". Always wait for RSI to hook back inside the zone and a candle to confirm.`,
      tag:'◆ SELL > 70 · BUY < 30 (RANGES ONLY)',
      chart:{ n:80, show:60, seed:15, noise:0.8,
        pts:[[0,50],[10,52],[20,38],[30,62],[40,37],[50,63],[60,38],[70,61],[79,50]],
        pane:{ t:'rsi', l:'RSI 14' },
        marks: x => { const r = x.ind.rsi, out = [];
          [[26,36,'max'],[36,46,'min'],[46,56,'max'],[56,66,'min'],[66,76,'max']].forEach(([a,b,t]) => {
            const i = t === 'max' ? argMax(r, a, b) : argMin(r, a, b);
            if((t === 'max' && r[i] > 68) || (t === 'min' && r[i] < 32)) out.push({ t:'dot', i, p:r[i], pane:true, c:t === 'max' ? 'bear' : 'bull', r:2.6 });
          });
          return out; } } },

    { id:'rsi-bull-div', name:'RSI Bullish Divergence', icon:'↗️', g:'osc', bias:'bull',
      desc:`<strong>Divergence</strong> = price and momentum disagree. Price makes a <strong>lower low</strong>, but RSI makes a <strong>higher low</strong>. Sellers pushed price lower with less force — the downtrend is running out of steam.`,
      how:`Spot the two lows. When RSI makes the higher low, wait for a bullish candle or a break of the last lower high, then buy. SL below the second low. Target the start of the last leg down.`,
      tip:`Divergence is a warning, not an entry by itself. It's strongest at a key level (support, Fib, OB) and on H1 or higher.`,
      tag:'▲ PRICE LOWER LOW · RSI HIGHER LOW',
      chart:{ n:70, show:54, seed:16, noise:0.8,
        pts:[[0,66],[18,62],[25,40,0.5],[29,49],[33,47],[37,44],[41,38,1.0],[44,36.5,0.6],[48,42],[56,50],[69,58]],
        pane:{ t:'rsi', l:'RSI 14' },
        marks: x => { const a = argMin(x.d.l, 22, 30), b = argMin(x.d.l, 38, 48), r = x.ind.rsi;
          return [{ t:'line', a:[a, x.L(a)], b:[b, x.L(b)], c:'bear', w:1.6 }, { t:'line', a:[a, r[a]], b:[b, r[b]], c:'bull', pane:true, w:1.6 },
                  { t:'dot', i:a, p:x.L(a), c:'silver', r:2.4 }, { t:'dot', i:b, p:x.L(b), c:'bull' },
                  { t:'dot', i:a, p:r[a], c:'silver', pane:true, r:2.4 }, { t:'dot', i:b, p:r[b], c:'bull', pane:true, r:2.4 },
                  { t:'text', i:b, p:x.L(b) - 5.5, s:'LOWER LOW', c:'bear' }]; } } },

    { id:'rsi-bear-div', name:'RSI Bearish Divergence', icon:'↘️', g:'osc', bias:'bear',
      desc:`Price makes a <strong>higher high</strong>, but RSI makes a <strong>lower high</strong>. Buyers pushed to a new high with less momentum — the uptrend is tiring and a pullback or reversal is likely.`,
      how:`When RSI makes the lower high, wait for a bearish candle or a break of the last higher low, then sell. SL above the second high. Target the start of the last leg up.`,
      tip:`Hidden divergence is the opposite: price higher low + RSI lower low = trend continuation (buy). Very useful for pullback entries.`,
      tag:'▼ PRICE HIGHER HIGH · RSI LOWER HIGH',
      chart:{ n:70, show:54, seed:16, noise:0.8,
        pts:mirror([[0,66],[18,62],[25,40,0.5],[29,49],[33,47],[37,44],[41,38,1.0],[44,36.5,0.6],[48,42],[56,50],[69,58]]),
        pane:{ t:'rsi', l:'RSI 14' },
        marks: x => { const a = argMax(x.d.h, 22, 30), b = argMax(x.d.h, 38, 48), r = x.ind.rsi;
          return [{ t:'line', a:[a, x.H(a)], b:[b, x.H(b)], c:'bull', w:1.6 }, { t:'line', a:[a, r[a]], b:[b, r[b]], c:'bear', pane:true, w:1.6 },
                  { t:'dot', i:a, p:x.H(a), c:'silver', r:2.4 }, { t:'dot', i:b, p:x.H(b), c:'bear' },
                  { t:'dot', i:a, p:r[a], c:'silver', pane:true, r:2.4 }, { t:'dot', i:b, p:r[b], c:'bear', pane:true, r:2.4 },
                  { t:'text', i:b, p:x.H(b) + 3.5, s:'HIGHER HIGH', c:'bull' }]; } } },

    { id:'stoch', name:'Stochastic — Pullback Entries', icon:'🎢', g:'osc', bias:'bull',
      desc:`The <strong>Stochastic</strong> shows where price closed within its recent range (0–100). <strong>%K</strong> is the fast line, <strong>%D</strong> the slow one. It's best used to time <strong>pullback entries</strong> inside a trend.`,
      how:`In an uptrend, wait for Stochastic to drop below 20 (pullback oversold), then buy when %K crosses back above %D. SL below the pullback low. In a downtrend, sell crosses down from above 80.`,
      tip:`Only take signals in the trend direction. In an uptrend, ignore every "overbought" sell signal — that's how traders get run over.`,
      tag:'▲ UPTREND · BUY %K CROSS UP BELOW 20',
      chart:{ n:62, show:50, seed:17, noise:0.7,
        pts:[[0,30],[8,46],[16,33],[24,53],[32,39],[40,59],[48,45],[56,66],[61,70]],
        pane:{ t:'stoch', l:'STOCH 14·3·3' },
        marks: x => { const k = x.ind.stoch.k, d = x.ind.stoch.d, out = [];
          for(let i = x.s0 + 2; i < x.n; i++) if(k[i-1] <= d[i-1] && k[i] > d[i] && Math.min(k[i-1], k[i-2], k[i-3]) < 30){ out.push({ t:'dot', i, p:k[i], pane:true, c:'bull', r:2.6 }, { t:'dot', i, p:x.L(i), c:'bull', r:2.6 }); }
          return out; } } },

    // ───────── VOLATILITY ─────────
    { id:'bb-squeeze', name:'Bollinger Band Squeeze', icon:'🗜️', g:'volat', bias:'bull',
      desc:`<strong>Bollinger Bands</strong> are a 20-period average with bands 2 standard deviations above and below. When volatility dies, the bands <strong>squeeze</strong> tight — and quiet markets always lead to explosive moves.`,
      how:`Spot the squeeze (bands at their narrowest in a while). Don't guess the direction — wait for a candle to close outside a band, then trade in that direction. SL on the other side of the squeeze range.`,
      tip:`The longer and tighter the squeeze, the bigger the breakout usually is. Often happens in the Asian session before London opens.`,
      tag:'▲ SQUEEZE → BREAKOUT CANDLE CLOSES OUTSIDE',
      chart:{ n:70, show:54, seed:18,
        pts:[[0,50,1.8],[12,57,1.8],[20,51,0.5],[44,51.5,0.4],[49,58,1.6],[55,66,1.6],[69,74,1.5]],
        ov:[{ t:'bb', n:20, k:2 }],
        marks: x => { const up = x.ind.bb.up; let k = -1; for(let i = 44; i < x.n; i++) if(x.d.c[i] > up[i]){ k = i; break; }
          return [{ t:'text', i:34, p:x.ind.bb.up[34] + 3, s:'SQUEEZE', c:'light' }].concat(k < 0 ? [] : [{ t:'dot', i:k, p:x.d.c[k], c:'bull' }]); } } },

    { id:'bb-revert', name:'Bollinger Mean Reversion', icon:'🪃', g:'volat', bias:'bull',
      desc:`In a <strong>ranging market</strong>, price tends to snap back to the middle band (the average) after touching the outer bands. The bands act like elastic — stretch too far and price returns to the mean.`,
      how:`Only in a sideways market (flat middle band): buy a bullish rejection candle at the lower band, target the middle band, then the upper band. SL just below the rejection wick.`,
      tip:`If the bands are expanding and the middle band is sloping, it's a trend, not a range — price will "walk the band" and mean reversion fails.`,
      tag:'▲ TOUCH LOWER BAND → BACK TO THE MIDDLE',
      chart:{ n:75, show:56, seed:19, noise:0.9,
        pts:[[0,50],[12,57],[22,43],[32,57],[42,43],[52,57],[61,43],[66,48],[74,55]],
        ov:[{ t:'bb', n:20, k:2 }],
        marks: x => { const i = argMin(x.d.l, 57, 64), mid = x.ind.bb.mid;
          return [{ t:'dot', i, p:x.L(i), c:'bull' }, { t:'arrow', pts:[[i + 1, x.L(i) + 2], [Math.min(i + 9, x.n - 1), mid[Math.min(i + 9, x.n - 1)]]], c:'bull' }]; } } },

    { id:'atr', name:'ATR — Setting Your Stop Loss', icon:'📏', g:'volat', bias:'bull',
      desc:`<strong>ATR (Average True Range)</strong> measures how far price normally moves per candle. It doesn't give signals — it tells you <strong>how much room</strong> a trade needs. Pros size their stops to volatility, not to a fixed number of pips.`,
      how:`At entry, read the ATR value. Place SL = <strong>1.5 × ATR</strong> beyond your entry (outside normal noise). Set TP at 2–3 × ATR. Then size your lot so that SL distance = your fixed % risk.`,
      tip:`When ATR is very high (news, big trends) your stop must be wider — so trade smaller. When ATR is low, tighter stops are fine.`,
      tag:'▲ SL = 1.5 × ATR · TP = 3 × ATR',
      chart:{ n:60, show:48, seed:20, noise:1.0,
        pts:[[0,38],[15,52],[22,47],[30,58],[37,53.5],[46,64],[59,72]],
        pane:{ t:'atr', l:'ATR 14' },
        marks: x => { const i = argMin(x.d.l, 35, 40), e = x.d.c[i], a = x.ind.atr[i];
          return [{ t:'dot', i, p:e, c:'bull' }, { t:'dot', i, p:a, pane:true, c:'light', r:2.6 },
                  { t:'hline', p:e - 1.5 * a, i1:i, c:'bear', l:'SL 1.5×ATR' }, { t:'hline', p:e + 3 * a, i1:i, c:'bull', l:'TP 3×ATR', dash:'2,3' }]; } } }
  ];

  BMX.mount('ind', 'Indicator Lessons', GROUPS, IND);
})();
