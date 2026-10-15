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

  const C = UT.C, sessionBar = UT.sessionBar, pdDg = UT.pdDg;

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

    rules: {
      icon:'⚡', sub:'London & New York kill zones only',
      preflight:[
        ['Kill zone open.', 'London 08:00–11:00 London time or New York 08:30–11:00 New York time — uTrade Ideas shows both in SAST. No scalps in Asia or after the NY close.'],
        ['Calendar checked.', 'No red-folder news for your instrument 30 minutes either side. USD news moves gold, indices and every USD pair.'],
        ['Asian range & PDH/PDL marked.', 'These are the liquidity pools the banks will raid. Mark them before London opens.'],
        ['H1 bias decided.', 'HH/HL = longs only. LH/LL = shorts only. A ranging H1 = no scalps today.'],
        ['Daily stop known.', '3 losses (or your daily loss limit) and you are done. After 2 losses, half risk.']
      ],
      steps:[
        ['H1 sets the direction', 'Structure first (HH/HL or LH/LL, or a fresh CHoCH), then the 50 EMA slope, then premium/discount. Buy in discount, sell in premium.'],
        ['15m sweep', 'Wait for price to wick through the Asian high/low, PDH/PDL or equal highs/lows and <strong>close back inside</strong>. That is the Judas swing — the fake move before the real one.'],
        ['15m zone', 'Price must react from an order block, FVG or flipped S/R level. No zone = no entry.'],
        ['5m trigger', 'Best: a 5m CHoCH that leaves an FVG. Also valid: a closed engulfing or pin bar inside the zone. No closed signal = Watchlist only.'],
        ['Type your levels', 'Blue Mac calculates Entry 1, Entry 2, stop and targets from your 15m swings, zone and liquidity — and enforces the risk rules.']
      ],
      stop:'Beyond the 15m swing that was swept, plus a small buffer. Never inside the sweep wick.',
      targets:'Targets are the liquidity on the other side (15m swing, Asian high/low, PDH/PDL). If the nearest one is too close, TP1 moves out to the next level or the minimum.',
      manage:'Close half at TP1 and move the stop to breakeven. If the trade has not moved within ~60 minutes, close it — a scalp that stalls is wrong.',
      never:[
        ['Never scalp the Asian session.', 'That is when the range is built, not when it is traded.'],
        ['Never scalp against the H1.', 'Counter-trend scalps are the lowest-probability trades in the system.'],
        ['Never enter before the sweep.', 'Buying in front of sell-side liquidity means you ARE the liquidity.'],
        ['Never trade the 30 minutes around red news.', 'Spreads widen and spikes run straight through stops.'],
        ['Never take a 4th trade after 3 losses.', 'Revenge trading turns a red day into a blown account.']
      ],
      mindset:[
        ['On patience', 'Most London opens give one good sweep. Taking that one trade properly beats taking five average ones.'],
        ['On being wrong', 'If the 5m closes back through the sweep low/high, the idea is dead. Cut it — the next kill zone is only hours away.'],
        ['On size', 'Scalps are fast and emotional. Keep risk fixed at the grade size, never bigger because "this one is obvious".']
      ]
    },

    questions: [
      { id:'instrument', stage:0, type:'instrument', short:'Instrument',
        q:'What are you scalping?',
        help:'Pick the chart you have open. Gold, NAS100 and US30 move the most in the kill zones; majors like EURUSD and GBPUSD give the cleanest sweeps.',
        groups: UT.INSTR },

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
        check(L, num){ return UT.stdCheck(L, num, '15m'); } }
    ],

    // Entries, stop and structural targets for each direction
    levelMap(dir, L, num){
      return UT.stdLevels(dir, L, num, { tf:'15m', up:[['liq_up','liquidity above you marked']], dn:[['liq_dn','liquidity below you marked']] });
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

})();
