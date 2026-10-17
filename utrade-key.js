// ══════════════════════════════════════════════════════
// uTRADE IDEAS · BLUE MAC KEY — the flagship
// The Key Range: the high/low of the first 15 minutes after the Asia,
// London or New York open. Trade the 15m candle that CLOSES outside it,
// enter on the retest, stop on the other side, target 2–3× the range.
// One Key trade per session, closed by the end of the session.
// (Internal note: never name the public strategy in the UI — it is "the Key".)
// The previous 9-timeframe MA version lives in git history (commit bfd090b).
// ══════════════════════════════════════════════════════
(function(){
  if(!window.UT) return;
  const D = UT.D, C = UT.C;
  const SES = { asia:'Asia (Tokyo)', london:'London', ny:'New York' };
  const BEST = {
    asia:   ['USDJPY','GBPJPY','EURJPY','AUDUSD','XAUUSD','BTCUSD'],
    london: ['EURUSD','GBPUSD','GBPJPY','EURJPY','XAUUSD','XAGUSD','GER40','UK100','USDZAR','USOIL'],
    ny:     ['NAS100','US30','SPX500','XAUUSD','XAGUSD','EURUSD','GBPUSD','USDJPY','USDCAD','USDZAR','USOIL','BTCUSD']
  };
  const stateTxt = (v, s) => v.k === 'forming' ? `range forming — ${v.left} min left` : v.k === 'ready' ? `READY — ${s.dur(v.left)} left to trade` : v.k === 'late' ? `too late today (opened ${s.dur(v.ago)} ago)` : `opens in ${s.dur(v.inMin)}`;

  // 24-hour SAST bar with the three opens, their 15-minute ranges and 2-hour trade windows
  function keyBar(s){
    const W = 260, X = m => 6 + m / 1440 * (W - 12);
    const col = { asia:'#F5B841', london:'#2A8FE3', ny:'#22D67A' };
    const seg = (a, b, c, op) => a <= b ? `<rect x="${X(a).toFixed(1)}" y="20" width="${Math.max(X(b) - X(a), 1.5).toFixed(1)}" height="14" rx="2" fill="${c}" opacity="${op}"/>` : seg(a, 1440, c, op) + seg(0, b, c, op);
    let sv = `<rect x="6" y="20" width="${W - 12}" height="14" rx="3" fill="#8AA4BF" opacity="0.1"/>`;
    Object.entries(s.key).forEach(([k, v]) => {
      sv += seg(v.open, v.until, col[k], 0.35) + seg(v.open, v.rangeEnd, '#E4E8EE', 0.9);
      sv += `<text x="${X(v.open + 50).toFixed(1)}" y="14" text-anchor="middle" font-family="'DM Mono',monospace" font-size="6.5" font-weight="bold" fill="${col[k]}">${k === 'asia' ? 'ASIA' : k === 'london' ? 'LONDON' : 'NEW YORK'} ${s.hm(v.open)}</text>`;
    });
    [0, 360, 720, 1080].forEach(m => sv += `<text x="${X(m).toFixed(1)}" y="44" text-anchor="${m ? 'middle' : 'start'}" font-family="'DM Mono',monospace" font-size="6" fill="rgba(255,255,255,0.4)">${String(m / 60).padStart(2,'0')}:00</text>`);
    const x = X(s.now);
    sv += `<line x1="${x.toFixed(1)}" y1="17" x2="${x.toFixed(1)}" y2="37" stroke="#FF5C5C" stroke-width="1.6"/><text x="${x.toFixed(1)}" y="53" text-anchor="middle" font-family="'DM Mono',monospace" font-size="7" font-weight="bold" fill="#FF5C5C">NOW ${s.nowTxt}</text>`;
    return `<svg width="100%" viewBox="0 0 ${W} 58" style="max-width:520px;display:block;" xmlns="http://www.w3.org/2000/svg">${sv}</svg>`;
  }
  const chosen = () => UT._st.ans.session;

  UT.register('key', {
    name: 'Blue Mac Key',
    short: 'Blue Mac Key',
    color: 'var(--gold)',
    tfs: 'H4 → 15m · Asia, London & New York',
    biasTF: '15-minute',
    entryTF: '15-minute',
    minRR: [2, 3],
    desc: 'The flagship. The first 15 minutes after a big market opens set the Key Range — the level the whole session reacts to. We wait for a 15-minute candle to close outside it, enter on the retest, and let the session do the work. One Key trade per session, closed by the end of the day.',
    pills: ['Asia · London · New York', 'One trade per session', 'TP1 ≥ 1:2 · TP2 ≥ 1:3', 'Closed same session'],
    stages: [{ label:'Safety gates' }, { label:'Context' }, { label:'The Key Range' }, { label:'Entry' }, { label:'Your levels' }],
    noBias: { q:'Key Break', l:'No Key Break yet', why:'The Key Range has not broken, or the break failed — so there is no direction to trade. Wait for a 15-minute candle to CLOSE outside the range.' },

    knowIntro: 'The Key is simple, but every word matters. Make sure these are clear before your first Key trade.',
    know: [
      { t:'The Key Range', ref:'mgt-keyrange', why:'The high and low of the first 15 minutes after the open.' },
      { t:'Key Break & Retest', ref:'mgt-keybreak', why:'The entry: a close outside the range, then the retest.' },
      { t:'The Fake Break', ref:'mgt-fakebreak', why:'A wick outside that closes back in — the trap to avoid.' },
      { t:'Sessions in SAST', ref:'ex-trading-session-times-sast', why:'Asia 02:00, London 09:00/10:00, New York 15:30/16:30.' },
      { t:'Market structure (HH/HL, LH/LL)', ref:'ex-market-structure-hh-hl-vs-ll-lh', why:'Reading the H4 trend that should agree with the break.' },
      { t:'Previous day high & low', ref:'ind-pdhl', why:'Where today opened — and the targets.' },
      { t:'Volume on breakouts', ref:'ind-volume', why:'Real breaks come with a volume spike.' },
      { t:'Risk-to-reward', ref:'mgt-rr', why:'Why TP1 must pay at least 1:2 after the spread.' }
    ],

    rules: {
      icon:'🔑', sub:'15-minute Key Range · one trade per session',
      preflight:[
        ['Know today\'s opens in SAST.', 'Asia 02:00 · London 09:00 (summer) / 10:00 (winter) · New York 15:30 / 16:30 SAST. uTrade Ideas shows today\'s exact times on your chart clock (MT5 charts like XM run 1 hour ahead of SAST from mid-March to early November).'],
        ['Right market for the session.', 'Asia: JPY & AUD pairs, gold. London: EUR, GBP, gold, DAX, FTSE. New York: NAS100, US30, S&P, gold, USD pairs.'],
        ['Calendar checked.', 'No red news during the 15-minute range or within 30 minutes of your entry.'],
        ['Mark the Key Range.', 'High and low of the first 15-minute candle after the open — then do nothing until a candle closes outside.'],
        ['One Key trade per session.', 'Win or lose, that session is done. 3 losses in a day = stop.']
      ],
      steps:[
        ['Wait for the range', 'The first 15 minutes after the open form the Key Range. You can trade it for the next 2 hours — after that the edge fades.'],
        ['Read the context', 'H4 trend, where price opened against yesterday\'s high/low, and how big the range is compared with a normal day. Tight ranges break hardest.'],
        ['Key Break', 'A 15-minute candle must CLOSE outside the range with a solid body. A wick that closes back inside is a fake break — no trade.'],
        ['Enter on the retest', 'Best: price comes back to the broken edge and holds. Entry 2 sits at the middle of the range. If price runs away, don\'t chase.'],
        ['Type your levels', 'Range high, range low and yesterday\'s high/low. Blue Mac builds the plan: stop on the other side, targets 2–3× the range.']
      ],
      stop:'On the other side of the Key Range, plus a small buffer. If price closes back inside the range after the break, the idea is dead — exit early.',
      targets:'1× the range height is the first obstacle (take partials there), then 2× and 3× the range projected from the break, or yesterday\'s high/low.',
      manage:'Half off at TP1, stop to breakeven. Close whatever is left before the end of the session — the Key never holds overnight.',
      never:[
        ['Never trade inside the range.', 'Inside the Key Range there is no edge — only noise.'],
        ['Never enter on a wick.', 'Only a CLOSED 15-minute candle outside the range counts.'],
        ['Never take a second Key trade in the same session.', 'If the first one fails, the session has told you it is not trending.'],
        ['Never trade the Key after the 2-hour window.', 'Late breaks are often traps set for latecomers.'],
        ['Never hold a Key trade overnight.', 'It is a session trade. Close it before the session ends.']
      ],
      mindset:[
        ['On patience', 'For 15 minutes you do nothing. Then you wait for one candle. Most of the Key is waiting — that is the edge.'],
        ['On losses', 'Breakouts win less than half the time, but the winners are 2–3× the losers. Take the loss, keep the rule.'],
        ['On fake breaks', 'A fake break is information, not a failure. It often sets up the Scalp style\'s best trade of the day.']
      ]
    },

    questions: [
      { id:'instrument', stage:0, type:'instrument', short:'Instrument',
        q:'What are you trading with the Key?',
        help:'The Key works best on markets that move hard at the open: gold, the indices and the major pairs.',
        groups: UT.INSTR },

      { id:'session', stage:0, type:'single', short:'Session',
        q:'Which session\'s Key Range are you trading?',
        help:() => `Each of the three big opens sets its own Key Range. Times below are today's, already on your chart clock (<b>${UT.clock.name()}</b>) — daylight saving included.`,
        ref:'mgt-keyrange',
        live: s => `<div class="ut-live">${keyBar(s)}<div style="width:100%;display:flex;flex-direction:column;gap:3px;">
          ${Object.entries(s.key).map(([k, v]) => `<span>${SES[k]} · opens <b>${s.hm(v.open)}</b> · range set <b>${s.hm(v.rangeEnd)}</b> · <b class="${v.k === 'ready' ? 'now' : ''}">${stateTxt(v, s)}</b></span>`).join('')}
          ${s.weekend ? '<span style="color:var(--bear)">Weekend — FX, metals and indices are closed</span>' : ''}</div></div>`,
        options:[
          { v:'asia', l:'Asia (Tokyo)', sub:() => { const s = UT.sessions(); return `Opens ${s.hm(s.key.asia.open)} ${s.clk}. Thinnest session — JPY & AUD pairs and gold.`; }, dir:0, pts:6,
            ai:'Asia (Tokyo) session Key Range', check: () => BEST.asia.includes(UT._st.ans.instrument) ? null : `${UT._st.ans.instrument} rarely moves in the Asia session — London or New York is better for it` },
          { v:'london', l:'London', sub:() => { const s = UT.sessions(); return `Opens ${s.hm(s.key.london.open)} ${s.clk}. Best for EUR, GBP, gold, DAX & FTSE.`; }, dir:0, pts:8,
            ai:'London session Key Range', check: () => BEST.london.includes(UT._st.ans.instrument) ? null : `${UT._st.ans.instrument} usually moves more at the New York open` },
          { v:'ny', l:'New York', sub:() => { const s = UT.sessions(); return `Opens ${s.hm(s.key.ny.open)} ${s.clk}. Best for NAS100, US30, S&P, gold & USD pairs.`; }, dir:0, pts:8,
            ai:'New York session Key Range (cash open)', check: () => BEST.ny.includes(UT._st.ans.instrument) ? null : `${UT._st.ans.instrument} usually moves more at the London open` }
        ] },

      { id:'timing', stage:0, type:'single', short:'Timing', compact:true,
        q:A => `Where are you in the ${SES[A.session] || 'session'} right now?`,
        help:'The Key Range takes <b>15 minutes</b> to form. After that you have a <b>2-hour window</b> to trade the break. Later breaks are often traps.',
        live: s => { const k = chosen(), v = k && s.key[k]; return v ? `<div class="ut-live"><span>${SES[k]} right now: <b class="${v.k === 'ready' ? 'now' : ''}">${stateTxt(v, s)}</b></span></div>` : ''; },
        options:[
          { v:'forming', l:'Range still forming', sub:'Less than 15 minutes since the open.', dg:() => UT.keyTimeline('forming'), dir:0, pts:0, gate:'wait', why:'Let the first 15-minute candle close. Mark its high and low, then come back.', ai:'Key Range still forming',
            check: s => { const v = s.key[chosen()]; return v && v.k !== 'forming' ? `Clock check — ${SES[chosen()]}: ${stateTxt(v, s)}` : null; } },
          { v:'ready', l:'15 min – 2 h after the open', sub:'Range is set. Inside the trade window.', dg:() => UT.keyTimeline('ready'), dir:0, pts:8, ai:'inside the 2-hour Key window',
            check: s => { const v = s.key[chosen()]; return v && v.k !== 'ready' ? `Clock check — ${SES[chosen()]}: ${stateTxt(v, s)}. Only trade the Key inside its 2-hour window` : null; } },
          { v:'late', l:'More than 2 hours after the open', sub:'The window has closed.', dg:() => UT.keyTimeline('late'), dir:0, pts:0, gate:'block', why:'The Key edge lives in the first 2 hours after the open. Wait for the next session\'s Key Range.' }
        ] },

      { id:'news', stage:0, type:'single', short:'News', compact:true,
        q:'Any red-folder news for this instrument?',
        help:'News spikes can create a fake Key Break in seconds. Check <b>ForexFactory</b> or <b>Investing.com</b>.',
        hero: () => D.ref('mgt-news'), heroCap:'No Key trades around red-folder news', ref:'mgt-news',
        options:[
          { v:'clear', l:'Clear', sub:'Nothing high-impact during the range or the next 30 minutes.', dir:0, pts:5, ai:'no high-impact news' },
          { v:'soon', l:'Red news during the range or within 30 min', sub:'Or it was released in the last 30 minutes.', dir:0, pts:0, gate:'block', why:'A news spike makes the Key Range meaningless. Skip this session\'s Key.' }
        ] },

      { id:'discipline', stage:0, type:'single', short:'Discipline', compact:true,
        q:'How has today gone so far?',
        help:'<b>One Key trade per session.</b> Three losses in a day is a hard stop.',
        ref:'mgt-sizing',
        options:[
          { v:'fresh', l:'First Key trade this session', sub:'0–1 losses today.', dir:0, pts:5, ai:'first Key trade this session' },
          { v:'two', l:'2 losses today', sub:'Allowed — at half risk.', dir:0, pts:2, halfRisk:true, warn:'2 losses today — half risk on this one', ai:'2 losses today — half risk' },
          { v:'taken', l:'Already took a Key trade this session', sub:'Win or lose.', dir:0, pts:0, gate:'block', why:'One Key trade per session. If it failed, the session is not trending — wait for the next open.' },
          { v:'stop', l:'3 losses or daily limit hit', sub:'Done for today.', dir:0, pts:0, gate:'block', why:'Hard stop. Journal your trades and come back tomorrow.' }
        ] },

      { id:'h4', stage:1, type:'single', short:'H4 trend', tf:'H4', align:'soft',
        q:'Open the H4 chart. Which way is the trend?',
        help:'Key Breaks <b>with</b> the H4 trend work best. A break against it can still work, but it gets fewer points.',
        ref:'ex-market-structure-hh-hl-vs-ll-lh',
        options:[
          { v:'up', l:'Uptrend — HH & HL', sub:'Favours a break up.', dg:C('structTrend', 1), dir:1, pts:12, ai:'H4 uptrend' },
          { v:'down', l:'Downtrend — LH & LL', sub:'Favours a break down.', dg:C('structTrend', -1), dir:-1, pts:12, ai:'H4 downtrend' },
          { v:'range', l:'Ranging', sub:'No clear trend.', dg:C('range', 1), dir:0, pts:4, warn:'H4 is ranging — Key Breaks fail more often; take TP1 quickly', ai:'H4 ranging' }
        ] },

      { id:'open', stage:1, type:'single', short:'Open vs yesterday', tf:'D1', align:'soft',
        q:'Where did price open compared with yesterday\'s high and low?',
        help:'Opening <b>above yesterday\'s high</b> shows buyers in control before the bell; <b>below yesterday\'s low</b>, sellers. Opening inside yesterday\'s range is neutral.',
        ref:'ind-pdhl',
        options:[
          { v:'above', l:'Above yesterday\'s high (PDH)', sub:'Strength — favours a break up.', dg:C('openAbove', 1), dir:1, pts:8, ai:'opened above the previous day high' },
          { v:'below', l:'Below yesterday\'s low (PDL)', sub:'Weakness — favours a break down.', dg:C('openAbove', -1), dir:-1, pts:8, ai:'opened below the previous day low' },
          { v:'inside', l:'Inside yesterday\'s range', sub:'Neutral open.', dg:C('openInside', 1), dir:0, pts:4, ai:'opened inside the previous day range' }
        ] },

      { id:'size', stage:2, type:'single', short:'Range size', tf:'15m',
        q:'How big is the Key Range compared with a normal day?',
        help:'Compare the range height with the <b>average daily range</b> (ADR — most platforms show it, or use the 14-day ATR on the daily chart). A tight range stores energy; a huge one means the move already happened.',
        ref:'ind-atr',
        options:[
          { v:'tight', l:'Tight — under 25% of the ADR', sub:'Energy stored. Strongest breaks.', dg:() => UT.rangeSize(0.18, 'TIGHT · <25%', '#22D67A'), dir:0, pts:10, ai:'tight Key Range (under 25% of the average daily range)' },
          { v:'normal', l:'Normal — 25% to 50%', sub:'Standard Key Range.', dg:() => UT.rangeSize(0.38, 'NORMAL · 25–50%', '#2A8FE3'), dir:0, pts:7, ai:'normal Key Range (25–50% of the average daily range)' },
          { v:'huge', l:'Huge — over 50% of the ADR', sub:'Most of the day\'s move is done.', dg:() => UT.rangeSize(0.62, 'HUGE · >50%', '#FF5C5C'), dir:0, pts:0, gate:'wait', why:'The range already covers more than half a normal day — targets of 2–3× the range are unrealistic. Skip, or wait for the next session.', ai:'huge Key Range (over 50% of the average daily range)' }
        ] },

      { id:'break', stage:2, type:'single', short:'Key Break', tf:'15m', bias:true,
        q:'What has the last CLOSED 15-minute candle done?',
        help:'Only a <b>close</b> counts. A wick outside the range that closes back inside is a <b>fake break</b> — the trap the Key avoids.',
        ref:'mgt-keybreak',
        options:[
          { v:'up', l:'Closed ABOVE the range', sub:'Solid body outside the range high.', dg:C('krBreak', 1), dir:1, pts:22, ai:'15m candle closed above the Key Range high (Key Break up)' },
          { v:'down', l:'Closed BELOW the range', sub:'Solid body outside the range low.', dg:C('krBreak', -1), dir:-1, pts:22, ai:'15m candle closed below the Key Range low (Key Break down)' },
          { v:'fake_up', l:'Wicked above, closed back inside', sub:'Fake break up — buyers trapped.', dg:C('krFake', 1), dir:0, pts:0, gate:'wait', ref:'mgt-fakebreak', why:'That was a fake break — no Key trade. If you trade the Scalp style, this trap is often its best setup of the day.', ai:'fake break above (closed back inside)' },
          { v:'fake_dn', l:'Wicked below, closed back inside', sub:'Fake break down — sellers trapped.', dg:C('krFake', -1), dir:0, pts:0, gate:'wait', ref:'mgt-fakebreak', why:'That was a fake break — no Key trade. If you trade the Scalp style, this trap is often its best setup of the day.', ai:'fake break below (closed back inside)' },
          { v:'inside', l:'Still inside the range', sub:'No close outside yet.', dg:C('krInside', 1), dir:0, pts:0, gate:'wait', why:'Set alerts at the range high and low and wait for a 15-minute close outside.', ai:'still inside the Key Range' }
        ] },

      { id:'entry', stage:3, type:'single', short:'Entry', tf:'15m',
        q:'Since the break, what has price done?',
        help:'The best Key entries come on the <b>retest</b>: price returns to the edge it just broke and that edge holds. If price closes <b>back inside</b> the range, the break has failed.',
        ref:'mgt-keybreak',
        options:[
          { v:'retest', l:'Retested the edge and held', sub:'Came back to the broken level and bounced.', dg:() => D.chart(UT.DG.krBreak, UT.bias() || 1), dir:0, pts:14, ai:'price retested the broken edge and held' },
          { v:'run', l:'Ran away — no retest yet', sub:'Price is stretched away from the range.', dg:() => D.chart(UT.DG.krMomentum, UT.bias() || 1), dir:0, pts:6, warn:'No retest yet — don\'t chase. Use the limit at the range edge and Entry 2 at the middle', ai:'price ran away without a retest (use limit orders, do not chase)' },
          { v:'failed', l:'Closed back inside the range', sub:'The break has failed.', dg:() => D.chart(UT.DG.krFailed, UT.bias() || 1), dir:0, pts:0, gate:'block', why:'A Key Break that closes back inside the range is dead. No trade — and if you were in, get out.' }
        ] },

      { id:'confluence', stage:3, type:'multi', short:'Confluence', tf:'15m', max:15, compact:true,
        q:'Tick every extra confirmation you can see. (Skip if none.)',
        help:'Each one makes the Key Break more likely to be real.',
        options:[
          { v:'vol', l:'Volume spike on the break candle', sub:'Bigger than the candles inside the range.', dg:() => D.ref('ind-volume'), pts:5, ref:'ind-volume', ai:'volume spike on the break candle' },
          { v:'vwap', l:'Price on the right side of VWAP', sub:'Above for a break up, below for a break down.', dg:() => D.ref('ind-vwap'), pts:4, ref:'ind-vwap', ai:'price on the correct side of VWAP' },
          { v:'level', l:'Break also cleared PDH/PDL or the Asian high/low', sub:'Two levels broken at once.', dg:() => D.ref('ind-pdhl'), pts:4, ref:'ind-pdhl', ai:'the break also cleared the previous day high/low or the Asian range' },
          { v:'prior', l:'The previous session\'s Key Range broke the same way', sub:'e.g. Asia broke up, now London breaks up.', dg:C('krBreak', 1), pts:3, ai:'the previous session Key Range broke in the same direction' },
          { v:'dxy', l:'DXY agrees', sub:'USD pairs, gold and indices.', dg:() => D.ref('mgt-dxy'), pts:3, ref:'mgt-dxy', ai:'DXY confirms the direction' }
        ] },

      { id:'levels', stage:4, type:'levels', short:'Levels',
        q:'Type the prices from your 15-minute chart.',
        help:'Blue Mac builds the plan from these: <b>Entry 1</b> on the retest of the broken edge, <b>Entry 2</b> at the middle of the range, the <b>stop</b> on the other side, and targets at <b>2× and 3× the range</b> or yesterday\'s high/low.',
        hero: C('krBreak', 1), heroCap:'Range high and low = the first 15-minute candle after the open', ref:'mgt-keybreak',
        fields:[
          { id:'price', label:'Current price', req:true, hint:'The live price.' },
          { id:'kr_hi', label:'Key Range high', req:true, hint:'Highest price of the first 15 minutes after the open (wick included).' },
          { id:'kr_lo', label:'Key Range low', req:true, hint:'Lowest price of the first 15 minutes after the open (wick included).' },
          { id:'pdh', label:'Previous day high (PDH)', hint:'Yesterday\'s high — a long target.' },
          { id:'pdl', label:'Previous day low (PDL)', hint:'Yesterday\'s low — a short target.' }
        ],
        shots:['H4 chart', '15m chart', '15m chart (zoomed in)'],
        check(L, num){
          const hi = num(L.kr_hi), lo = num(L.kr_lo), p = num(L.price), H = hi - lo;
          if(!(H > 0)) return 'The Key Range high must be above the Key Range low.';
          if(p > hi + H * 8 || p < lo - H * 8) return 'Current price is very far from the Key Range — check you typed this session\'s range.';
          const b = UT._st.ans.break;
          if(b === 'up' && p < lo) return 'You said the range broke UP, but price is below the range low — check your levels.';
          if(b === 'down' && p > hi) return 'You said the range broke DOWN, but price is above the range high — check your levels.';
          return null;
        } }
    ],

    // Entry 1 = retest of the broken edge · Entry 2 = middle of the range · stop = other side + buffer
    // Targets: 1× (first obstacle), 2×, 3× the range projected from the break, and PDH/PDL
    levelMap(dir, L, num){
      const p = num(L.price), hi = num(L.kr_hi), lo = num(L.kr_lo);
      if(![p, hi, lo].every(isFinite) || !(hi > lo)) return null;
      const H = hi - lo, buf = H * 0.05, mid = (hi + lo) / 2;
      const edge = dir > 0 ? hi : lo;
      const sl = dir > 0 ? lo - buf : hi + buf;
      const out = dir * (p - edge) >= 0;                          // price is already through the edge
      const e1 = out ? edge : p;
      const e1why = out ? (dir * (p - edge) > H * 0.1 ? 'limit order on the retest of the broken edge' : 'price is on the broken edge') : 'market price (inside the range — wait for the close)';
      const tg = [1, 2, 3].map(m => [edge + dir * H * m, `${m}× Key Range target`]);
      tg.push(dir > 0 ? [num(L.pdh), 'previous day high (PDH)'] : [num(L.pdl), 'previous day low (PDL)']);
      return { e1, e2: mid, sl, e1why, e2why: 'middle of the Key Range', slwhy: dir > 0 ? 'below the Key Range low + buffer' : 'above the Key Range high + buffer', tg };
    },

    prompt(x){
      return `You are the head trader of "Blue Mac Key", the flagship strategy of Blue Mac, a South African trading platform. Your reader may be a beginner — explain like a mentor, simply and precisely.
IMPORTANT: always call it "the Key", "the Key Range" and "the Key Break". Never use any other name for this strategy and never say "opening range" or "ORB".

THE STRATEGY:
1. The Key Range is the high and low of the first 15 minutes after the Asia (Tokyo), London or New York open.
2. It can be traded for 2 hours after the open. One Key trade per session.
3. A 15-minute candle must CLOSE outside the range. A wick that closes back inside is a fake break — no trade.
4. Context: H4 trend, where price opened against yesterday's high/low, and range size against the average daily range.
5. Entry 1 on the retest of the broken edge, Entry 2 at the middle of the range, stop on the other side of the range. Targets at 2× and 3× the range height (1× is the first obstacle) or yesterday's high/low. TP1 at least 1:2, TP2 at least 1:3 after the spread.
6. If a 15-minute candle closes back inside the range after the break, the idea is dead — exit. Half off at TP1, stop to breakeven, everything closed before the session ends.

THE TRADER'S SETUP:
Instrument: ${x.instrument}
Time now: ${x.session.nowTxt} ${x.session.clk} (Asia opens ${x.session.hm(x.session.key.asia.open)}, London ${x.session.hm(x.session.key.london.open)}, New York ${x.session.hm(x.session.key.ny.open)})
Key Break direction: ${x.bias}
Blue Mac score: ${x.score}/100 — ${x.grade}
Status: ${x.status}
${x.answers}

Trader's chart prices:
${x.levels}

Open gates / warnings: ${x.gates}; ${x.warns}

ENGINE PLAN — LONG: ${x.longPlan}
ENGINE PLAN — SHORT: ${x.shortPlan}

The ${x.bias === 'BULLISH' ? 'LONG' : 'SHORT'} idea follows the Key Break and is the main trade. The other one goes against the break: explain honestly why it is weaker (it only becomes valid if price closes back through the whole range).
If chart screenshots are attached, use them to sharpen the signal, wait condition and invalidation, but never change the engine's prices.`;
    }
  });
})();
