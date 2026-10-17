// ══════════════════════════════════════════════════════
// BLUE MAC — uTRADE PRACTICE (window.BMPR)            17 Oct 2026
// "Learn by doing": the member answers the REAL uTrade questions on a
// made-up chart, gets instant feedback on every answer, and finishes with
// the REAL engine result (grade, entries, stop, targets, lots).
// No AI is called → it never uses the 2 daily ideas.
//
//   BMPR.open(id)    start a practice run ('r1' …)
//   BMPR.close()
//   BMPR.paint()     redraw the entry cards (uTrade Ideas + Education home)
//   BMPR.status()    { done:{r1:iso}, slips:{r1:n} }
//
// Progress: localStorage['bm_prac_v1'] = { v:1, done:{}, slips:{} } — synced per member by profile.js.
// 5 runs planned; run 1 is live, 2–5 show as "coming soon".
// ══════════════════════════════════════════════════════
window.BMPR = (function(){
  if(!window.UT || !window.BMX || !UT.simulate) return null;
  const KEY = 'bm_prac_v1';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const V = (x, a) => typeof x === 'function' ? x(a || {}) : x;
  const f2 = v => (+v).toFixed(2);

  // ── Progress ──
  function load(){ try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); if(p && p.v === 1) return p; } catch(e){} return { v:1, done:{}, slips:{} }; }
  function save(p){ try { localStorage.setItem(KEY, JSON.stringify(p)); } catch(e){} }

  // ── Chart helpers ──
  // exact high/low of candles a..b of a generated chart (boxes need real numbers)
  function hl(spec, a, b){ const d = BMX.gen(spec); return { h: Math.max(...d.h.slice(a, b + 1)), l: Math.min(...d.l.slice(a, b + 1)) }; }
  const chart = sp => BMX.render(sp);
  const with_ = (base, extra) => Object.assign({}, base, extra, {
    ov: (base.ov || []).concat(extra.ov || []), marks: (base.marks || []).concat(extra.marks || []), boxes: (base.boxes || []).concat(extra.boxes || [])
  });

  // ════════════════════════════════════════════════════
  // RUN 1 — "Your first idea": Gold day trade, clean bullish pullback
  // ════════════════════════════════════════════════════
  const R1 = (function(){
    // the made-up market (prices are the same everywhere: charts, ladder, answers)
    const D1 = { n:64, seed:11, noise:9, wick:1.1,
      pts:[[0,3640],[7,3760],[12,3705],[21,3880],[27,3815],[37,4010],[43,4080],[52,4380,10],[56,4300],[60,4236],[63,4206.5]],
      fix:{ 61:{ l:4168.2 }, 62:{ o:4285, c:4232, h:4291, l:4202.6 }, 63:{ c:4206.5, l:4196.2, h:4236 } } };
    const H4 = { n:90, seed:5, noise:5, wick:1.0,
      pts:[[0,4020],[14,4210],[20,4170],[34,4380,6],[44,4300],[52,4245],[60,4168.2,4],[66,4232],[70,4214],[76,4262.4,4],[82,4222],[86,4208],[89,4206.5]],
      fix:{ 89:{ c:4206.5 } } };
    const H1 = { n:70, seed:9, noise:2.6, wick:1.0,
      pts:[[0,4245],[10,4215],[18,4168.2,1.5],[30,4232],[34,4220],[44,4262.4,1.5],[56,4216],[62,4202],[66,4207],[69,4206.5]],
      fix:{ 18:{ l:4168.2 }, 44:{ h:4262.4 }, 69:{ c:4206.5 } } };
    const M15 = { n:48, seed:3, noise:1.5, wick:0.9,
      pts:[[0,4224],[8,4212],[12,4216],[20,4203],[24,4208.6],[28,4199],[30,4196.2,0.8],[34,4201],[37,4199],[42,4209.5,1],[47,4206.5]],
      fix:{ 30:{ l:4196.2 }, 47:{ c:4206.5 } } };

    const SH = 4262.4, SL_ = 4168.2, LEG = SH - SL_;
    const GP_HI = +(SH - LEG * 0.618).toFixed(2), GP_LO = +(SH - LEG * 0.65).toFixed(2);   // golden pocket 61.8–65%
    const KR = hl(M15, 28, 31);                                                              // London first hour (4 × 15m)
    const L = { price:'4206.50', swing_hi:f2(SH), swing_lo:f2(SL_), zone_hi:f2(GP_HI), zone_lo:f2(GP_LO), pdh:'4291.00', pdl:'4202.60', kr_hi:f2(KR.h), kr_lo:f2(KR.l) };

    // pictures
    const d1Base = chart(D1);
    const d1Struct = chart(with_(D1, { marks:[
      { t:'text', i:21, p:3905, s:'HH', c:'bull' }, { t:'text', i:27, p:3792, s:'HL', c:'bull' },
      { t:'text', i:37, p:4035, s:'HH', c:'bull' }, { t:'text', i:43, p:4055, s:'HL', c:'bull' },
      { t:'text', i:52, p:4410, s:'HH', c:'bull' }] }));
    const pdLines = [{ t:'hline', i1:43, p:4380, l:'100%', c:'slate' }, { t:'hline', i1:43, p:4230, l:'50%', c:'silver', dash:'' }, { t:'hline', i1:43, p:4080, l:'0%', c:'slate' }];
    const d1Pd = chart(with_(D1, { marks: pdLines }));
    const d1PdR = chart(with_(D1, { marks: pdLines.concat([{ t:'dot', i:63, p:4206.5, c:'bull' }]),
      boxes:[{ i1:43, i2:63, p1:4080, p2:4230, c:'bull', op:0.13, l:'DISCOUNT', lt:'below' }, { i1:43, i2:63, p1:4230, p2:4380, c:'bear', op:0.08, l:'PREMIUM' }] }));
    const h4Base = chart(H4);
    const h4Bos = chart(with_(H4, { marks:[
      { t:'hline', i1:52, i2:80, p:4245, c:'bull', l:'BOS', lr:false },
      { t:'text', i:60, p:4152, s:'LOW', c:'slate' }, { t:'arrow', pts:[[77,4256],[84,4214]], c:'light' }] }));
    const h4Ema = chart(with_(H4, { ov:[{ t:'ema', n:50, c:'blue', l:'50 EMA' }] }));
    const h4EmaR = chart(with_(H4, { ov:[{ t:'ema', n:50, c:'blue', l:'50 EMA' }], marks:[{ t:'ring', i:89, p:4214, r:7, c:'amber' }, { t:'text', i:70, p:4290, s:'FLAT — PRICE ON IT', c:'amber' }] }));
    const krBox = { i1:28, i2:31, p1:KR.l, p2:KR.h, c:'blue', op:0.16, border:true, l:'FIRST HOUR' };
    const m15Kr = chart(with_(M15, { boxes:[krBox], marks:[{ t:'vline', i:28, l:'LONDON OPEN', c:'slate' }] }));
    const m15KrR = chart(with_(M15, { boxes:[krBox], marks:[{ t:'vline', i:28, l:'LONDON OPEN', c:'slate' }, { t:'hline', i1:28, p:KR.h, c:'bull', l:'BROKE ↑' }] }));
    const m15Trig = chart(with_(M15, { boxes:[{ i1:26, i2:47, p1:GP_LO, p2:GP_HI, c:'amber', op:0.16, l:'H1 ZONE', lt:'below' }] }));
    const m15TrigR = chart(with_(M15, { boxes:[{ i1:26, i2:47, p1:GP_LO, p2:GP_HI, c:'amber', op:0.16, l:'H1 ZONE', lt:'below' }],
      marks:[{ t:'hline', i1:24, i2:44, p:4209.2, c:'bull', l:'CHoCH', lr:false }, { t:'text', i:30, p:4193.6, s:'LOW', c:'slate' }] }));
    const fibLines = [{ t:'hline', i1:18, p:SH, l:'0%', c:'slate' }, { t:'hline', i1:18, p:SL_, l:'100%', c:'slate' }];
    const gpBox = { i1:44, i2:69, p1:GP_LO, p2:GP_HI, c:'amber', op:0.2, border:true, l:'61.8–65%', lt:'below' };
    const h1Zone = chart(with_(H1, { marks: fibLines.concat([{ t:'hline', i1:18, p:SH - LEG * 0.5, l:'50%', c:'slate', dash:'2,3' }]), boxes:[gpBox] }));
    const h1Pdl = chart(with_(H1, { boxes:[gpBox], marks:[{ t:'hline', p:4202.6, c:'bull', l:'PDL', dash:'6,3' }] }));
    const h1Levels = chart(with_(H1, { fitExtra:[4291],
      boxes:[gpBox],
      marks:[{ t:'hline', p:4291, c:'bear', l:'PDH' }, { t:'hline', i1:40, p:SH, c:'light', l:'SWING H' }, { t:'hline', i1:14, p:SL_, c:'light', l:'SWING L' },
             { t:'dot', i:69, p:4206.5, c:'white' }] }));

    // scene cards (things you'd look at that are not charts)
    const clock = `<div class="bmpr-scene"><div class="bmpr-scene-h">🕙 Practice clock</div>
      <div class="bmpr-clock"><b>Tuesday · 09:40</b><span>London time</span></div>
      <div class="bmpr-scene-r"><span>London session</span><b class="ok">OPEN since 08:00</b></div>
      <div class="bmpr-scene-r"><span>New York session</span><b>opens 13:30 London time</b></div>
      <small>On the real screen Blue Mac converts these to SAST for you, daylight saving included.</small></div>`;
    const cal = `<div class="bmpr-scene"><div class="bmpr-scene-h">📅 Practice economic calendar · today</div>
      ${[['10:00', 'EUR', 'ZEW Economic Sentiment', 'med'], ['15:00', 'USD', 'CB Consumer Confidence', 'med'], ['18:00', 'USD', '2-Year Note Auction', 'low']].map(([t, c, n, k]) =>
        `<div class="bmpr-cal"><span class="t">${t}</span><span class="c">${c}</span><span class="n">${n}</span><span class="i ${k}">${k === 'med' ? 'ORANGE' : 'YELLOW'}</span></div>`).join('')}
      <small>Times in London time. 🔴 Red = high impact · 🟠 Orange = medium · 🟡 Yellow = low.</small></div>`;
    const jnl = `<div class="bmpr-scene"><div class="bmpr-scene-h">📒 Your journal · today</div>
      <div class="bmpr-scene-r"><span>Trades taken today</span><b>0</b></div>
      <div class="bmpr-scene-r"><span>Losses today</span><b>0</b></div>
      <div class="bmpr-scene-r"><span>How you feel</span><b class="ok">Slept well, clear head</b></div></div>`;

    return {
      id:'r1', n:1, title:'Your first idea', style:'day', instrument:'XAUUSD',
      blurb:'Gold day trade · clean bullish pullback · ends in a real price plan',
      brief:`It's <b>Tuesday morning</b>. You trade <b>Gold (XAUUSD)</b> and you open uTrade Ideas → <b>Day Trade</b>.
        You'll answer the same questions as the real thing — but on a <b>practice chart</b>, and Blue Mac checks every answer straight away.`,
      steps:[
        { q:'session', scene:clock, ans:'london',
          ok:'London is open and New York is hours away — a day trade entered now has the whole day to reach its targets.',
          no:{ ny:'Not yet — New York only opens at 13:30 London time. Look at the clock: London is the session that is open now.',
               late:'It is still morning — 09:40. The NY afternoon is hours away.', asia:'Asia is finished — London opened at 08:00.' } },
        { q:'news', scene:cal, ans:'clear',
          ok:'Nothing red. Gold moves on <b>USD</b> news, and today\'s USD events are orange and yellow — normal trading.',
          no:{ later:'Check the colours again — nothing on today\'s list is red. Orange and yellow don\'t stop a trade.',
               soon:'Nothing red at all today. Only 🔴 red-folder events block a trade.' } },
        { q:'discipline', scene:jnl, ans:'fresh',
          ok:'First trade of the day, clear head — full risk allowed.',
          no:{ second:'Your journal shows 0 trades today — this is your first.', stop:'No trades and no losses today — you are good to go.' } },
        { q:'d1_structure', pic:d1Base, picR:d1Struct, cap:'Practice chart · Gold · Daily', ans:'up',
          ok:'Each swing high is higher than the last, and each swing low too. <b>HH + HL = uptrend</b> → today we only look for LONGS.',
          no:{ down:'Look again from left to right — the highs keep stepping <b>up</b>, not down.',
               choch_up:'A bullish CHoCH turns a <b>downtrend</b> up. This chart was already going up.', choch_dn:'The last higher low (around 4080) never broke — the uptrend is intact.',
               range:'The candles step up clearly — no sideways box.' },
          hint:'Follow the swing highs from left to right. Higher or lower each time?' },
        { q:'d1_pd', pic:d1Pd, picR:d1PdR, cap:'Fib drawn from the last daily swing low (4080) to high (4380)', ans:'discount',
          ok:'Price (4206.50) is <b>below the 50% line at 4230</b> — the cheap half. Buying in discount gives the trade room to run.',
          no:{ premium:'Premium is <b>above</b> 50%. Price is at 4206.50 and the 50% line is at 4230.', eq:'Close — but price is 24 points below the 50% line. That is discount.' },
          hint:'Is price above or below the 50% line?' },
        { q:'h4_structure', pic:h4Base, picR:h4Bos, cap:'Practice chart · Gold · H4', ans:'bos_bull',
          ok:'The H4 bounced from 4168, <b>broke the last lower high at ~4245 (BOS)</b>, made 4262 and is now pulling back. That pullback is where we get in.',
          no:{ bos_bear:'The last break was <b>up</b> through ~4245, not down.', running:'It did break up, but price has already pulled back over 50 points — it is not running any more.',
               range:'The H4 made a clean break up to 4262 — that is not a range.' },
          hint:'Find the last lower high on the way down (~4245). Did price break above it?' },
        { q:'h4_ema', pic:h4Ema, picR:h4EmaR, cap:'Same H4 chart with a 50 EMA added', ans:'flat',
          ok:'Honest answer 👌 The EMA has gone <b>flat</b> and price is sitting on it. It costs a few points — and that is exactly how Blue Mac keeps your grade honest.',
          no:{ above:'Look closely at the last candles — price is <b>on</b> the EMA, and the line has gone flat. Real charts are rarely perfect; answer what you see.',
               below:'The EMA isn\'t falling — it has flattened out, with price right on it.' },
          hint:'Is the blue line still climbing — and is price clearly above it?' },
        { q:'krange', pic:m15Kr, picR:m15KrR, cap:'Practice chart · Gold · 15m · London open', ans:'up',
          ok:`The first hour made a box from ${f2(KR.l)} to ${f2(KR.h)}, then price <b>closed above it and stayed there</b>. The day is choosing up — same way as the daily.`,
          no:{ inside:'Price has already closed <b>above</b> the box and is holding there.', down:'The break was <b>up</b>, above the box high.',
               fake:'It closed outside and stayed out — a fake break would have closed back inside.' },
          hint:'Where are the last candles — inside the blue box, or above it?' },
        { q:'zone', pic:h1Zone, picR:h1Zone, cap:'Practice chart · Gold · H1 · fib on the last up-leg', ans:'fib_bull',
          ok:`The pullback has reached the <b>golden pocket</b> (${f2(GP_LO)}–${f2(GP_HI)}) of the leg 4168 → 4262. That is the A+ zone for this strategy.`,
          no:{ none:'Price is right inside the shaded 61.8–65% box — it reached a zone.', other:'Maybe there is an OB or FVG nearby on your own chart — but this chart shows the <b>fib golden pocket</b>. Always answer from what you can see.' },
          hint:'What is the shaded box drawn on the chart?' },
        { q:'trigger', pic:m15Trig, picR:m15TrigR, cap:'15m · zoomed into the H1 zone', ans:'choch_bull',
          ok:'Price dipped into the zone, made a low at 4196, then <b>broke the last 15m lower high with a strong candle</b> — a bullish CHoCH. That is the "now" signal.',
          no:{ eng_bull:'There is a strong candle — but it did more than engulf: it broke the last <b>lower high</b>. That is a CHoCH, the stronger signal.',
               none:'Look at the last few candles — the lower high around 4209 was broken.', other:'Everything here points up: the break was through a lower high.' },
          hint:'Before the low at 4196, price made lower highs. Did one of them get broken?' },
        { q:'confluence', multi:true, pic:h1Pdl, cap:'H1 · yesterday\'s low (PDL) added', ans:['pdhl'],
          ok:'Yesterday\'s low (<b>PDL 4202.60</b>) sits right inside the golden pocket — two reasons to buy at the same price. Only tick what you can actually see.',
          extra:'Only tick what you can actually <b>see</b>. This chart shows the PDL in the zone — no RSI, VWAP, pivots, fib cluster or DXY.',
          miss:'Look at the dashed PDL line — it runs straight through the golden pocket.',
          hint:'Which extra line is drawn on this chart?' },
        { q:'levels', pic:h1Levels, cap:'Read these prices off your chart', ladder:true, lv:L,
          req:['price', 'swing_hi', 'swing_lo', 'zone_hi', 'zone_lo', 'pdh'],
          ok:'Spot on. These are the only numbers Blue Mac needs — it builds the entries, stop and targets from them.' }
      ],
      learnt:['Answer from what the chart shows — not what you hope', 'Daily trend decides LONG or SHORT', 'Wait for the pullback into a zone, then a 15m trigger', 'Blue Mac sets the prices — you just read the chart'],
      name:'Gold', pics:{ zone:h1Zone, trig:m15TrigR },
      coach: p => ({
        e1:`A <b>buy limit</b> at the top of the golden pocket. Price is at 4206.50, so you wait for it to come back down to you.`,
        e2:'Your second, cheaper buy — half the size. Blue Mac always keeps it <b>inside</b> the stop.',
        sl:'Below the swing low the whole move started from. If price gets there, the idea is simply wrong — out, no arguing.',
        tp1:`1:${p.rr1} after the spread. The swing high (4262) was too close to pay 1:2, so Blue Mac moved TP1 to the next real level.`,
        tp2:`1:${p.rr2}. Take half off at TP1, move the stop to breakeven, and let this part run — closed before the NY close.` })
    };
  })();

  // ════════════════════════════════════════════════════
  // RUN 2 — "Spot the trap": EURUSD daily downtrend, every lower timeframe says BUY
  // The right answers are all honest bullish readings → the engine says WAIT.
  // ════════════════════════════════════════════════════
  const R2 = (function(){
    const D1 = { n:60, seed:21, noise:0.0011, wick:1.0,
      pts:[[0,1.1180],[8,1.1060],[12,1.1125],[22,1.0960],[27,1.1022],[38,1.0860],[44,1.1000],[54,1.0700,0.0013],[59,1.0880]],
      fix:{ 44:{ h:1.1004 }, 54:{ l:1.0698 }, 59:{ c:1.0880 } } };
    const H4 = { n:80, seed:8, noise:0.0006, wick:1.0,
      pts:[[0,1.0990],[12,1.0880],[18,1.0925],[30,1.0700,0.0007],[40,1.0790],[46,1.0752],[58,1.0852],[64,1.0816],[72,1.0896],[79,1.0880]],
      fix:{ 30:{ l:1.0698 }, 79:{ c:1.0880 } } };
    const H1 = { n:56, seed:14, noise:0.00028, wick:0.9,
      pts:[[0,1.0816],[10,1.0850],[16,1.0838],[22,1.0869],[26,1.0862],[34,1.0896],[44,1.0874],[50,1.0865],[55,1.0880]],
      fix:{ 26:{ o:1.0870, c:1.0861, h:1.0871, l:1.0858 }, 27:{ o:1.0861, c:1.0874 }, 55:{ c:1.0880 } } };
    const M15 = { n:48, seed:6, noise:0.00014, wick:0.9,
      pts:[[0,1.0890],[10,1.0876],[14,1.0882],[22,1.0866],[27,1.0873],[31,1.0864,0.0001],[38,1.0884],[47,1.0880]],
      fix:{ 31:{ l:1.0862 }, 47:{ c:1.0880 } } };
    const OB = { l:1.0858, h:1.0871 };

    const d1Base = chart(D1);
    const d1Struct = chart(with_(D1, { marks:[
      { t:'text', i:12, p:1.1150, s:'LH', c:'bear' }, { t:'text', i:22, p:1.0935, s:'LL', c:'bear' },
      { t:'text', i:27, p:1.1047, s:'LH', c:'bear' }, { t:'text', i:38, p:1.0835, s:'LL', c:'bear' },
      { t:'text', i:44, p:1.1028, s:'LH', c:'bear' }, { t:'text', i:54, p:1.0674, s:'LL', c:'bear' }] }));
    const pdLines = [{ t:'hline', i1:44, p:1.1000, l:'100%', c:'slate' }, { t:'hline', i1:44, p:1.0850, l:'50%', c:'silver', dash:'' }, { t:'hline', i1:44, p:1.0700, l:'0%', c:'slate' }];
    const d1Pd = chart(with_(D1, { marks: pdLines }));
    const d1PdR = chart(with_(D1, { marks: pdLines.concat([{ t:'dot', i:59, p:1.0880, c:'bear' }]),
      boxes:[{ i1:44, i2:59, p1:1.0850, p2:1.1000, c:'bear', op:0.13, l:'PREMIUM' }, { i1:44, i2:59, p1:1.0700, p2:1.0850, c:'bull', op:0.07, l:'DISCOUNT', lt:'below' }] }));
    const h4Base = chart(H4);
    const h4R = chart(with_(H4, { marks:[{ t:'hline', i1:40, i2:60, p:1.0790, c:'bull', l:'BOS ↑', lr:false }, { t:'hline', i1:58, i2:76, p:1.0852, c:'bull', l:'BOS ↑', lr:false },
      { t:'text', i:30, p:1.0682, s:'LOW', c:'slate' }] }));
    const obBox = { i1:26, i2:55, p1:OB.l, p2:OB.h, c:'bull', op:0.16, border:true, l:'BULLISH OB', lt:'below' };
    const h1Zone = chart(with_(H1, { boxes:[obBox] }));
    const m15 = chart(with_(M15, { boxes:[{ i1:20, i2:47, p1:OB.l, p2:OB.h, c:'bull', op:0.13, l:'H1 OB', lt:'below' }] }));
    const m15R = chart(with_(M15, { boxes:[{ i1:20, i2:47, p1:OB.l, p2:OB.h, c:'bull', op:0.13, l:'H1 OB', lt:'below' }],
      marks:[{ t:'hline', i1:27, i2:42, p:1.0873, c:'bull', l:'CHoCH ↑', lr:false }] }));
    const bigPic = chart(with_(D1, { boxes:[{ i1:44, i2:59, p1:1.0850, p2:1.1000, c:'bear', op:0.12, l:'PREMIUM' }],
      marks:[{ t:'arrow', pts:[[2,1.1235],[53,1.0735]], c:'bear' }, { t:'text', i:30, p:1.1080, s:'THE TREND ↓', c:'bear' },
             { t:'arrow', pts:[[55,1.0700],[59,1.0868]], c:'bull' }, { t:'text', i:52, p:1.0905, s:'BOUNCE ↑', c:'bull' }] }));

    return {
      id:'r2', n:2, title:'Spot the trap', style:'day', instrument:'EURUSD', name:'EURUSD',
      blurb:'EURUSD · every lower timeframe says BUY · can you spot the trap?',
      brief:`It's <b>Wednesday, 10:15 London time</b>. You're looking at <b>EURUSD</b> for a Day Trade.
        The safety checks are already done for you: <b>London is open, no red news, first trade of the day</b>.
        The lower timeframes look <b>amazing</b>. Read each chart honestly — then make the call.`,
      pre:{ session:'london', news:'clear', discipline:'fresh' },
      resultTitle:'What Blue Mac says', endBtn:'See what Blue Mac says →',
      steps:[
        { q:'d1_structure', pic:d1Base, picR:d1Struct, cap:'Practice chart · EURUSD · Daily', ans:'down',
          ok:'Each swing high is <b>lower</b> than the last, and each low too. <b>LH + LL = downtrend</b> → today Blue Mac only looks for SHORTS. Remember that.',
          no:{ up:'Follow the highs from left to right — they keep stepping <b>down</b>. The last bounce is just that, a bounce.',
               choch_up:'A bullish CHoCH needs price to break the last <b>lower high</b> (1.1000). The bounce stalled well below it.',
               choch_dn:'A bearish CHoCH turns an <b>uptrend</b> down. This chart has been falling for months.', range:'The candles step down clearly — no sideways box.' },
          hint:'Follow the swing highs from left to right. Higher or lower each time?' },
        { q:'d1_pd', pic:d1Pd, picR:d1PdR, cap:'Fib from the last daily swing high (1.1000) to low (1.0700)', ans:'premium',
          ok:'Price (1.0880) is <b>above the 50% line at 1.0850</b> — the expensive half. In a downtrend, premium is where <b>sellers</b> step in.',
          no:{ discount:'Discount is <b>below</b> 50%. Price is at 1.0880, the 50% line is at 1.0850.', eq:'Close — but price is 30 pips above the 50% line. That is premium.' },
          hint:'Is price above or below the 50% line?' },
        { q:'h4_structure', pic:h4Base, picR:h4R, cap:'Practice chart · EURUSD · H4', ans:'bos_bull',
          ok:'Honest answer: the H4 bounced from 1.0700 and <b>broke two highs on the way up</b>. Now notice — that is <b>against</b> your daily bias. Keep that in mind.',
          no:{ bos_bear:'Look again — the H4 broke <b>up</b> (above 1.0790, then 1.0852). It hasn\'t broken down yet.',
               running:'It broke up, then dipped back — it is pulling back, not running.', range:'It made clear higher highs — not a range.' },
          hint:'Since the low at 1.0700, is the H4 making higher highs or lower lows?' },
        { q:'zone', pic:h1Zone, picR:h1Zone, cap:'Practice chart · EURUSD · H1', ans:'ob_bull',
          ok:'Yes — price is sitting in a textbook <b>bullish order block</b>. It looks great. That\'s what makes it a trap.',
          no:{ ob_bear:'The box marks the last <b>down</b> candle before a move <b>up</b> — that is a bullish OB.', none:'Price is inside the shaded order block right now.',
               other:'The chart shows a <b>bullish order block</b> — answer what you can see.' },
          hint:'What is the shaded box, and which way did price leave it?' },
        { q:'trigger', pic:m15, picR:m15R, cap:'15m · zoomed into the H1 order block', ans:'choch_bull',
          ok:'A clean <b>bullish 15m CHoCH</b> out of the OB. On its own, a perfect long trigger.',
          no:{ eng_bull:'It did more than engulf — it broke the last 15m lower high. That\'s a CHoCH.', none:'The lower high near 1.0873 has been broken — there is a signal.',
               other:'The break was <b>up</b>, through a lower high.' },
          hint:'Price made lower highs into the OB. Did one get broken?' },
        { call:[
            { v:'buy', l:'BUY now', sub:'H4 broke up, bullish OB, bullish CHoCH — 3 signals!' },
            { v:'sell', l:'SELL now', sub:'The daily is a downtrend, so sell.' },
            { v:'wait', l:'WAIT', sub:'Let the bounce finish, then look for a SHORT.' }],
          callQ:'Your call. What do you do?', pic:bigPic, cap:'Zoom out · EURUSD · Daily', ans:'wait',
          ok:'That\'s the pro move. Every bullish signal you saw lives <b>inside a bounce in a daily downtrend</b> — buying it means fighting the tide. Selling now is the right direction but the wrong time: the H4 is still going up. So you <b>wait</b>.',
          no:{ buy:'That\'s the trap 🪤 Three bullish signals — but all of them are <b>inside a bounce in a daily downtrend</b>. The daily decides the direction. Longs here fight the tide.',
               sell:'Right direction, wrong time. The H4 is still breaking <b>up</b> and you have no bearish zone or trigger yet. Selling into a rising H4 is guessing.' },
          hint:'Zoom out. Which way is the big arrow — and where is price now?' }
      ],
      after:{ t:'What has to happen before you SELL', list:[
        'The bounce reaches a <b>bearish</b> zone in daily premium — a bearish order block or the golden pocket of the down-leg',
        'The <b>H4 breaks structure down</b> (bearish BOS)',
        'A <b>bearish 15m CHoCH</b> out of that zone — then uTrade builds the SHORT' ] },
      moral:'🪤 <b>The trap:</b> a perfect-looking setup on the small charts, against the big chart. Blue Mac caught it by itself: every bullish answer worked <b>against your daily bias</b>, so each one scored 0 and raised a ⏳ wait flag. No trade — exactly what you decided. Answer honestly and the engine protects you.',
      learnt:['The daily chart decides the direction — always', 'Great-looking signals against the daily are traps', 'Right direction + wrong time = still no trade', 'Answer honestly — Blue Mac\'s gates protect you']
    };
  })();

  // ════════════════════════════════════════════════════
  // RUN 3 — "News day": the same A+ Gold setup as Run 1, but US CPI is 20 minutes away
  // Engine: red news within the hour = hard block. Plus the fundamentals behind it.
  // ════════════════════════════════════════════════════
  const R3 = (function(){
    // a CPI release on the 1-minute chart: quiet, then a spike down, a spike up, and chop
    const CPI = { n:46, seed:31, noise:0.35, wick:1.0,
      pts:[[0,4206],[19,4207],[20,4207],[21,4190,2],[22,4214,2],[24,4198,1.5],[28,4211,1.2],[34,4201,0.9],[45,4205,0.7]],
      fix:{ 20:{ o:4207, c:4206.6, h:4207.4, l:4205.9 }, 21:{ o:4206.6, c:4192.0, h:4207.2, l:4183.5 }, 22:{ o:4192.0, c:4213.8, h:4219.6, l:4190.8 }, 23:{ o:4213.8, c:4202.5, h:4215.0, l:4199.0 } } };
    const cpiBase = chart(with_(CPI, { marks:[{ t:'vline', i:21, l:'CPI 14:30', c:'bear' }] }));
    const cpiR = chart(with_(CPI, { marks:[{ t:'vline', i:21, l:'CPI 14:30', c:'bear' },
      { t:'hline', i1:6, i2:26, p:4199.0, c:'bear', l:'A TIGHT STOP', lr:false },
      { t:'text', i:21, p:4180.5, s:'−23 IN 1 MIN', c:'bear' }, { t:'text', i:22, p:4222.5, s:'+28', c:'bull' }] }));

    const clock = `<div class="bmpr-scene"><div class="bmpr-scene-h">🕑 Practice clock</div>
      <div class="bmpr-clock"><b>Wednesday · 14:10</b><span>SAST</span></div>
      <div class="bmpr-scene-r"><span>London day-trade window</span><b>closed at 13:00 SAST</b></div>
      <div class="bmpr-scene-r"><span>New York day-trade window</span><b class="ok">opens 14:30 SAST</b></div>
      <small>Your Gold setup from this morning is still there: daily uptrend, H1 golden pocket, 15m CHoCH. You want to enter when New York opens.</small></div>`;
    const cal = `<div class="bmpr-scene"><div class="bmpr-scene-h">📅 Practice economic calendar · today (SAST)</div>
      ${[['11:00', 'EUR', 'German ZEW Sentiment', 'med', ''], ['14:30', 'USD', 'CPI m/m (inflation)', 'high', ' hot'], ['14:30', 'USD', 'Core CPI m/m', 'high', ' hot'], ['16:30', 'USD', 'Crude Oil Inventories', 'low', '']].map(([t, c, n, k, h]) =>
        `<div class="bmpr-cal${h}"><span class="t">${t}</span><span class="c">${c}</span><span class="n">${n}</span><span class="i ${k}">${k === 'high' ? 'RED' : k === 'med' ? 'ORANGE' : 'YELLOW'}</span></div>`).join('')}
      <small>🔴 Red = high impact · 🟠 Orange = medium · 🟡 Yellow = low. Gold is priced in <b>US dollars</b>, so USD news moves it.</small></div>`;
    const print_ = `<div class="bmpr-scene"><div class="bmpr-scene-h">📰 14:30 SAST · the number is out</div>
      <div class="bmpr-scene-r"><span>US CPI m/m · Forecast</span><b>0.3%</b></div>
      <div class="bmpr-scene-r"><span>Actual</span><b class="no">0.5%</b></div>
      <div class="bmpr-scene-r"><span>Verdict</span><b class="no">HOTTER than expected</b></div>
      <small>CPI = how fast prices in the US are rising (inflation). The market only cares about the <b>surprise</b>: actual vs forecast.</small></div>`;

    return {
      id:'r3', n:3, title:'News day', style:'day', instrument:'XAUUSD', name:'Gold',
      blurb:'Gold · the same A+ setup · but US CPI is 20 minutes away',
      brief:`Remember your A+ Gold setup from Run 1? It's back — <b>daily uptrend, H1 golden pocket, 15m CHoCH</b>.
        But today is <b>Wednesday</b>, and something is on the calendar. Let's see if you spot it — and learn what news actually does to Gold.`,
      pre:{ discipline:'fresh', d1_structure:'up', d1_pd:'discount', h4_structure:'bos_bull', h4_ema:'flat', krange:'up', zone:'fib_bull', trigger:'choch_bull', confluence:['pdhl'] },
      resultTitle:'What Blue Mac says', endBtn:'See what Blue Mac says →',
      steps:[
        { q:'session', scene:clock, ans:'ny',
          ok:'Right — London\'s day-trade window has closed and New York opens at 14:30 SAST. That is the session you\'d enter in.',
          no:{ london:'London\'s day-trade window closed at 13:00 SAST — too late for a new London entry.',
               late:'The NY afternoon starts after the New York lunch — hours from now. You\'re planning for the New York open.',
               asia:'Asia finished hours ago. Look at the clock: New York is next.' },
          hint:'Which window opens next on the practice clock?' },
        { q:'news', scene:cal, ans:'soon',
          ok:'🔴 <b>US CPI at 14:30 SAST — 20 minutes from now</b>, and it\'s USD news, so it hits Gold. Blue Mac\'s rule: no new trades from <b>1 hour before</b> until <b>30 minutes after</b> red news. This is a hard stop 🛑.',
          no:{ clear:'Look again — two 🔴 <b>red</b> USD events at 14:30. Gold is priced in US dollars, so USD news moves it.',
               later:'"Later" means more than an hour away. 14:30 is only <b>20 minutes</b> from 14:10.' },
          hint:'What time is it now, and what time is the red event?' },
        { call:[
            { v:'take', l:'Take it — the setup is A+', sub:'Daily, H1 and 15m all line up.' },
            { v:'half', l:'Take it with half size', sub:'Less risk, still in the move.' },
            { v:'no', l:'No new trade until 30 min after CPI', sub:'Protect the account first.' }],
          callQ:'But the chart is A+. What do you do?', pic:R1.pics.trig, cap:'Your 15m trigger · Gold · 14:10 SAST', ans:'no',
          ok:'That\'s discipline 👊 A perfect chart doesn\'t matter when a red event is minutes away — the news decides the next move, not your setup.',
          no:{ take:'That\'s how accounts get hurt on news days. CPI can move Gold tens of dollars in a minute — it can jump straight through a stop, with slippage and a wide spread.',
               half:'Half size doesn\'t fix it: the spike ignores your stop, spreads widen and you can get filled far from your price. The rule is <b>no new trades</b>, not smaller trades.' },
          hint:'What does Blue Mac\'s news rule say — smaller trades, or no trades?' },
        { call:[
            { v:'down', l:'Gold usually DROPS first', sub:'' },
            { v:'up', l:'Gold usually RISES first', sub:'' },
            { v:'flat', l:'Nothing — it is only one number', sub:'' }],
          callQ:'CPI came in HOTTER than expected. What does Gold usually do first?', scene:print_, ans:'down',
          ok:'Hotter inflation → markets expect US interest rates to stay <b>higher for longer</b> → the US dollar and US yields rise → Gold (priced in USD, and it pays no interest) usually <b>drops first</b>. A <b>cooler</b> number usually does the opposite. Note the word <i>usually</i> — the first spike often reverses.',
          no:{ up:'Inflation can help Gold over years — but on the day, a hotter number usually means <b>higher US rates</b>, a stronger dollar and a <b>lower</b> Gold price first.',
               flat:'CPI is one of the biggest numbers of the month. A surprise of 0.2% can move Gold tens of dollars in seconds.' },
          hint:'Hot inflation → what do markets expect the US central bank to do with interest rates?' },
        { call:[
            { v:'now', l:'Straight after 14:30 — catch the move', sub:'' },
            { v:'thirty', l:'From 15:00 SAST — 30 minutes after', sub:'' },
            { v:'tomorrow', l:'Not until tomorrow', sub:'' }],
          callQ:'Here\'s what happened at 14:30. When can you look for a new trade again?', pic:cpiBase, picR:cpiR, cap:'Practice chart · Gold · 1-minute · around the CPI release', ans:'thirty',
          ok:'From <b>15:00 SAST</b>. Look at the chart: down 23 in one minute, up 28 the next. A tight stop would have been hit within seconds — on a long <b>or</b> a short — and spreads are at their widest right on the release. After 30 minutes the dust settles: re-run uTrade Ideas. Your setup may still be there — or the news made a new one.',
          no:{ now:'Look at the first two minutes: −23, then +28. That whipsaw is exactly what the 30-minute rule protects you from. Spreads are widest right after the release too.',
               tomorrow:'Too careful 🙂 The rule is 30 minutes. After that, re-run uTrade — the setup might still be valid.' },
          hint:'Blue Mac\'s rule: 1 hour before until how long after?' }
      ],
      after:{ t:'What to do on a news day', list:[
        'Check the calendar <b>before</b> you trade — your Daily Pre-Flight does this every morning',
        'Mark the red events. No new trades from <b>1 hour before</b> until <b>30 minutes after</b>',
        'Already in a trade? Be at <b>breakeven or out</b> before the release',
        'After the 30 minutes, <b>re-run uTrade Ideas</b> — the news may have made a better setup' ] },
      moral:'📰 <b>News beats charts.</b> Even an A+ setup gets a 🛑 when red news is close — you can\'t control the spike, so you step aside and come back when it has settled.',
      learnt:['Red news within the hour = no new trades, even A+', 'Gold moves on USD news: CPI, NFP, FOMC', 'Hotter inflation usually means a stronger dollar and weaker Gold first', 'Wait 30 minutes after the release, then re-run uTrade']
    };
  })();

  // runs still to come (shown so members see the path)
  const SOON = [
    { n:4, title:'Kill zone scalp', blurb:'London sweep → CHoCH → entry, fast' },
    { n:5, title:'Your own strategy', blurb:'Build one, then practise it' }
  ];
  const RUNS = { r1: R1, r2: R2, r3: R3 }, ORDER = ['r1', 'r2', 'r3'];
  const TOTAL = 5;
  const nextRun = () => { const P = load(); const id = ORDER.find(k => !P.done[k]); return id ? RUNS[id] : null; };

  // ── State ──
  let st = null;   // { run, i, ans, lv, tries, fb, solved, slips }
  const q = s => s.call ? { type:'single', q:s.callQ, options:s.call, stage:-1 } : UT.def(st.run.style).questions.find(x => x.id === s.q);

  function open(id){
    const run = RUNS[id || 'r1']; if(!run) return;
    st = { run, i:-1, ans:Object.assign({ instrument: run.instrument }, run.pre || {}), lv:{}, tries:0, fb:null, solved:false, slips:0, picks:[] };
    let ov = document.getElementById('bmpr-ov');
    if(!ov){ ov = document.createElement('div'); ov.id = 'bmpr-ov'; ov.className = 'bmd-ov'; document.body.appendChild(ov); }
    ov.classList.add('on'); document.body.style.overflow = 'hidden'; document.body.classList.add('bmd-open');
    draw();
  }
  function close(){
    const ov = document.getElementById('bmpr-ov'); if(ov){ ov.classList.remove('on'); ov.innerHTML = ''; }
    document.body.style.overflow = ''; document.body.classList.remove('bmd-open'); st = null; paint();
  }

  // ── Answering ──
  function pick(v){
    const s = st.run.steps[st.i]; if(st.solved) return;
    if(v === s.ans){ if(!s.call) st.ans[s.q] = v; st.solved = true; st.fb = { ok:true, t:s.ok }; }
    else {
      st.tries++; st.slips++;
      const o = q(s).options.find(x => x.v === v);
      const t = (s.no && (s.no[v] || s.no.other)) || (o && o.gate ? 'This option would stop or delay the trade — but nothing on this chart says that.' : 'Not quite — look at the chart again.');
      st.fb = { ok:false, t, v };
    }
    draw();
  }
  function reveal(){ const s = st.run.steps[st.i]; if(!s.call) st.ans[s.q] = s.ans; st.solved = true; st.fb = { ok:true, shown:true, t:s.ok }; draw(); }
  function toggle(v){
    if(st.solved) return;
    const i = st.picks.indexOf(v); if(i >= 0) st.picks.splice(i, 1); else st.picks.push(v);
    st.fb = null; draw();
  }
  function check(){
    const s = st.run.steps[st.i];
    const want = s.ans.slice().sort().join(), got = st.picks.slice().sort().join();
    if(want === got){ st.ans[s.q] = st.picks.slice(); st.solved = true; st.fb = { ok:true, t:s.ok }; }
    else { st.tries++; st.slips++; st.fb = { ok:false, t: s.ans.some(a => !st.picks.includes(a)) ? s.miss : s.extra }; }
    draw();
  }
  function checkLevels(fill){
    const s = st.run.steps[st.i], qq = q(s), bad = [];
    qq.fields.forEach(f => {
      const el = document.getElementById('bmpr-lv-' + f.id); if(!el) return;
      if(fill && s.req.includes(f.id)){ el.value = s.lv[f.id]; }
      const raw = String(el.value || '').replace(/[\s,]/g, ''), want = +s.lv[f.id];
      st.lv[f.id] = raw;
      const need = s.req.includes(f.id);
      if(!raw){ if(need) bad.push(f.id); return; }
      if(!(Math.abs(+raw - want) < 0.051)) bad.push(f.id);
    });
    st.bad = bad;
    if(bad.length){
      st.tries++; st.slips++;
      const names = bad.map(id => qq.fields.find(f => f.id === id).label);
      st.fb = { ok:false, t:`Check ${names.length > 1 ? 'these' : 'this'}: <b>${names.map(esc).join(', ')}</b>. Find ${names.length > 1 ? 'each one' : 'it'} in the price list — every number is already there.` };
    } else {
      // optional fields left empty stay empty — exactly like the real screen
      st.solved = true; st.fb = { ok:true, t:s.ok };
    }
    draw();
  }
  function next(){
    if(st.i >= 0 && !st.solved) return;
    st.i++; st.tries = 0; st.fb = null; st.solved = false; st.picks = []; st.bad = [];
    draw();
    const b = document.querySelector('#bmpr-ov .bmd-body'); if(b) b.scrollTop = 0;
  }
  function back(){
    if(st.i <= -1) return;
    st.i--; st.tries = 0; st.fb = null; st.solved = st.i >= 0; st.picks = [];
    draw();
  }

  // ── Result (the real engine on the practice answers) ──
  const PRACTICE_BAL = 100000, PRACTICE_FX = 18.20;
  function result(){
    const run = st.run, ans = Object.assign({}, st.ans), lv = {};
    Object.keys(st.lv).forEach(k => { if(st.lv[k] !== '') lv[k] = st.lv[k]; });
    const r = UT.simulate(run.style, ans, lv);
    // the live clock check is meaningless on a practice chart
    r.ev.warns = r.ev.warns.filter(w => !/^Clock says/.test(w));
    return r;
  }
  function lots(p, riskPct, bal){
    const sp = UT.spec(st.run.instrument), lossPerLot = p.Rn * sp.c * PRACTICE_FX;
    const raw = bal * riskPct / 100 / lossPerLot, l = Math.floor(raw * 100 + 1e-9) / 100;
    return { lots:l, lossPerLot, risk: l * lossPerLot, tp1: l * (p.dir * (p.tp1 - p.e1) - p.sp) * sp.c * PRACTICE_FX, tp2: l * (p.dir * (p.tp2 - p.e1) - p.sp) * sp.c * PRACTICE_FX };
  }
  const R = v => 'R' + Math.round(v).toLocaleString('en-ZA').replace(/,/g, ' ');

  function resultHTML(){
    const { ev, p } = result();
    if(ev.waiting || ev.blocked || ev.tooWeak) return waitHTML(ev);
    if(!p || p.error){
      return `<div class="bmpr-fb no"><b>Something went off-script.</b> ${esc(p && p.error ? p.error : 'Blue Mac could not build this practice idea.')} Tap back and check your answers.</div>`;
    }
    const z = lots(p, ev.risk, PRACTICE_BAL), small = lots(p, ev.risk, 20000);
    const gc = ev.grade === 'A+' || ev.grade === 'A' ? 'bull' : 'amber', cc = st.run.coach(p);
    const row = (k, lab, v, why, coach, cls) => `<div class="bmpr-pr ${cls || ''}"><span class="k">${k}</span><div><b>${lab} <em>${v}</em></b><small>${esc(why)}</small><p>${coach}</p></div></div>`;
    return `
      <div class="bmpr-grade ${gc}">
        <div class="g">${ev.grade || '—'}</div>
        <div><b>${esc(ev.gradeLong)} · ${p.dir > 0 ? 'LONG' : 'SHORT'} ${esc(st.run.name)}</b><span>Blue Mac score ${ev.score}/100 · risk ${+ev.risk.toFixed(2)}% of your account</span></div>
      </div>
      <div class="bmpr-note">This is the <b>real Blue Mac engine</b> working on your practice answers — the same maths as a real idea.</div>
      <div class="bmpr-plan">
        ${row('E1', 'Entry 1', p.fmt(p.e1), p.e1why, cc.e1)}
        ${row('E2', 'Entry 2', p.fmt(p.e2), p.e2why, cc.e2)}
        ${row('SL', 'Stop loss', p.fmt(p.sl), p.slwhy, cc.sl, 'sl')}
        ${row('TP1', 'Target 1', p.fmt(p.tp1), p.note1, cc.tp1, 'tp')}
        ${row('TP2', 'Target 2', p.fmt(p.tp2), p.note2, cc.tp2, 'tp')}
      </div>
      <div class="bmpr-size">
        <div class="bmpr-scene-h">🧮 Lot size · practice account ${R(PRACTICE_BAL)}</div>
        ${z.lots >= 0.01 ? `<div class="bmpr-scene-r"><span>Size</span><b>${z.lots.toFixed(2)} lots</b></div>
        <div class="bmpr-scene-r"><span>If the stop is hit</span><b class="no">−${R(z.risk)}</b></div>
        <div class="bmpr-scene-r"><span>At TP1 / TP2</span><b class="ok">+${R(z.tp1)} / +${R(z.tp2)}</b></div>` : ''}
        <small>${small.lots < 0.01 ? `💡 On a <b>R20 000</b> account even the smallest size (0.01 lot) would risk ${R(small.lossPerLot * 0.01)} — ${(small.lossPerLot * 0.01 / 200).toFixed(1)}% instead of ${+ev.risk.toFixed(2)}%. Blue Mac would tell you to skip it. <b>Stop size and account size decide what you can trade.</b>` : ''}
        Practice rate 1 USD = R${PRACTICE_FX.toFixed(2)}.</small>
      </div>
      ${ev.warns.length ? `<div class="bmpr-warns"><div class="bmpr-scene-h">⚠️ Blue Mac also warned you</div>${ev.warns.map(w => `<div>• ${esc(w)}</div>`).join('')}
        <small>Warnings don't stop the trade — they tell you what to watch. A level price has to get through before TP1 is a good place to think about taking partials.</small></div>` : ''}
      <div class="bmpr-real"><div class="bmpr-scene-h">🚀 On a real idea you'd also get</div>
        <div>✍️ The AI's <b>signal, wait condition, invalidation and management notes</b> — that's what your 2 daily AI ideas are for.</div>
        <div>📒 <b>Take This Trade</b> → saved to your Journal, so you can mark it Win / Loss / BE later.</div></div>`;
  }

  // a run that should end in Wait / No Trade: show the engine's gates and what has to happen first
  function waitHTML(ev){
    const run = st.run, head = ev.blocked ? 'No Trade' : ev.tooWeak ? 'Below Blue Mac standard' : 'Watchlist — not a trade yet';
    const sub = ev.blocked ? 'A hard rule is broken — Blue Mac never builds this idea, and the AI is never called.'
      : ev.tooWeak ? `Score ${ev.score}/100 — Blue Mac needs 60+ before it builds any idea.${ev.waiting ? ' And the setup isn\'t ready either:' : ''}`
      : 'The setup may come — but it is not confirmed. On the real screen you would get a Watchlist idea to MONITOR, not to enter.';
    return `
      <div class="bmpr-grade ${ev.blocked ? 'block' : 'amber'}"><div class="g">${ev.blocked ? '🛑' : ev.tooWeak ? '✕' : '⏳'}</div>
        <div><b>${head}</b><span>${sub}</span></div></div>
      ${ev.blocked && ev.grade ? `<div class="bmpr-would"><span>Without that rule this setup would score</span><b>${ev.score}/100 · ${esc(ev.grade)}</b></div>` : ''}
      <div class="bmpr-note">This is the <b>real Blue Mac engine</b> reading your practice answers.</div>
      <div class="bmpr-warns"><div class="bmpr-scene-h">Why Blue Mac won't build this trade</div>
        ${ev.gates.map(g => `<div class="bmpr-gate"><b>${g.type === 'block' ? '🛑' : '⏳'} ${esc(g.q)}: ${esc(g.l)}</b>${g.why ? `<span>${esc(g.why)}</span>` : ''}</div>`).join('')}</div>
      ${run.after ? `<div class="bmpr-real"><div class="bmpr-scene-h">✅ ${esc(run.after.t)}</div>${run.after.list.map(x => `<div>• ${x}</div>`).join('')}</div>` : ''}
      ${run.moral ? `<div class="bmpr-fb ok">${run.moral}</div>` : ''}`;
  }

  // ── Drawing ──
  function draw(){
    const ov = document.getElementById('bmpr-ov'); if(!ov || !st) return;
    const run = st.run, steps = run.steps, n = steps.length;
    const atResult = st.i === n, atDone = st.i === n + 1;
    let body = '', foot = '', kicker = `uTrade Practice · Run ${run.n} of ${TOTAL}`, title = run.title, sub = '';
    if(st.i === -1){
      sub = run.blurb;
      body = `<div class="bmpr-brief">${run.brief}</div>
        <div class="bmpr-how">
          <div><b>1</b><span>Look at the practice chart</span></div>
          <div><b>2</b><span>Answer the real uTrade question</span></div>
          <div><b>3</b><span>Blue Mac tells you right away if you read it right — and why</span></div>
        </div>
        <div class="bmpr-note">🆓 Practice never uses your 2 daily AI ideas. Nothing is saved to your journal.</div>`;
      foot = `<button class="ut-back" onclick="BMPR.close()">Not now</button><button class="ut-next" onclick="BMPR.next()">Start practice →</button>`;
    } else if(atResult){
      kicker += ' · Your practice idea'; title = run.resultTitle || 'Here\'s what Blue Mac built';
      body = resultHTML();
      foot = `<button class="ut-back" onclick="BMPR.back()">← Back</button><button class="ut-next" onclick="BMPR.finish()">Finish run ${run.n} ✓</button>`;
    } else if(atDone){
      const P = load(), doneN = Object.keys(P.done).filter(k => RUNS[k]).length, nx = nextRun();
      kicker = 'uTrade Practice'; title = `Run ${run.n} complete 🎉`;
      body = `<div class="bmpr-done">
          <div class="bmpr-badge"><span>✅</span><div><b>uTrade Certified · ${doneN}/${TOTAL}</b><small>${st.slips ? `${st.slips} slip${st.slips > 1 ? 's' : ''} along the way — that's how you learn.` : 'Not a single slip. Sharp! 🔥'}</small></div></div>
          <div class="bmpr-scene-h">What you just practised</div>
          ${run.learnt.map(t => `<div class="bmpr-l">✓ ${esc(t)}</div>`).join('')}
          <div class="bmpr-scene-h" style="margin-top:14px;">Next practice runs</div>
          ${ORDER.map(id => RUNS[id]).filter(r => !P.done[r.id]).map(r => `<div class="bmpr-soon ready"><b>Run ${r.n} · ${esc(r.title)}</b><span>${esc(r.blurb)}</span><i>Ready</i></div>`).join('')}
          ${SOON.map(s => `<div class="bmpr-soon"><b>Run ${s.n} · ${esc(s.title)}</b><span>${esc(s.blurb)}</span><i>Coming soon</i></div>`).join('')}
        </div>`;
      foot = nx ? `<button class="ut-back" onclick="BMPR.goReal()">Try it for real</button><button class="ut-next" onclick="BMPR.open('${nx.id}')">Next: Run ${nx.n} →</button>`
                : `<button class="ut-back" onclick="BMPR.close()">Close</button><button class="ut-next" onclick="BMPR.goReal()">Try a real ${esc(UT.def(run.style).short)} idea →</button>`;
    } else {
      const s = steps[st.i], qq = q(s), sg = s.call ? { label:'🧠 Your call' } : (UT.def(run.style).stages[qq.stage] || { label:'' });
      kicker += ` · Question ${st.i + 1} of ${n}`; title = run.title;
      const pic = st.solved && s.picR ? s.picR : s.pic;
      const visual = s.scene ? s.scene : `<div class="bmpr-pic">${pic}<div class="bmpr-cap">${esc(s.cap || '')}</div></div>`;
      let ansHTML = '';
      if(qq.type === 'single') ansHTML = optsHTML(s, qq);
      else if(qq.type === 'multi') ansHTML = multiHTML(s, qq);
      else if(qq.type === 'levels') ansHTML = levelsHTML(s, qq);
      const fb = st.fb ? `<div class="bmpr-fb ${st.fb.ok ? 'ok' : 'no'}"><b>${st.fb.ok ? (st.fb.shown ? '👉 Here it is.' : '✅ Correct!') : '❌ Not quite.'}</b> ${st.fb.t}</div>` : '';
      const help = !st.solved && st.tries >= 1 && s.hint ? `<div class="bmpr-hint">💡 ${s.hint}</div>` : '';
      body = `<div class="bmpr-prog"><i style="width:${Math.round(st.i / n * 100)}%"></i></div>
        <div class="ut-kicker">${esc(sg.label)}${qq.tf ? ` · <span class="ut-tf">${esc(V(qq.tf, st.ans))}</span>` : ''}</div>
        <div class="ut-q">${V(qq.q, st.ans)}</div>
        ${visual}
        ${fb}${help}
        ${ansHTML}`;
      const showMe = !st.solved && st.tries >= 2 && qq.type !== 'levels' ? `<button class="ut-back" onclick="BMPR.reveal()">Show me</button>` : '';
      let main;
      if(st.solved) main = `<button class="ut-next" onclick="BMPR.next()">${st.i === n - 1 ? (run.endBtn || 'Build my practice idea →') : 'Next →'}</button>`;
      else if(qq.type === 'multi') main = `<button class="ut-next" onclick="BMPR.check()">Check →</button>`;
      else if(qq.type === 'levels') main = `${st.tries ? `<button class="ut-back" onclick="BMPR.checkLevels(true)">Fill them in for me</button>` : ''}<button class="ut-next" onclick="BMPR.checkLevels()">Check my prices →</button>`;
      else main = '<span class="bmpr-tap">Tap your answer</span>';
      foot = `<button class="ut-back" onclick="BMPR.back()">← Back</button><div class="bmpr-foot-r">${showMe}${main}</div>`;
    }
    ov.innerHTML = `<div class="bmd-box bmpr-box" role="dialog" aria-modal="true" aria-label="uTrade Practice">
      <div class="bmd-head"><div><div class="bmd-kicker">${kicker}</div><div class="bmd-title">${title}</div>${sub ? `<div class="bmd-sub">${esc(sub)}</div>` : ''}</div>
        <button class="bmd-x" onclick="BMPR.close()" aria-label="Close">✕</button></div>
      <div class="bmd-body">${body}</div>
      <div class="bmd-foot">${foot}</div></div>`;
  }

  function optsHTML(s, qq){
    return `<div class="ut-opts compact bmpr-opts">${qq.options.map(o => {
      const tone = o.gate === 'block' ? 'block' : o.gate === 'wait' ? 'wait' : o.dir > 0 ? 'bull' : o.dir < 0 ? 'bear' : 'neut';
      const right = st.solved && o.v === s.ans, wrong = st.fb && !st.fb.ok && st.fb.v === o.v;
      return `<div class="ut-opt ${tone}${right ? ' on bmpr-right' : ''}${wrong ? ' bmpr-wrong' : ''}${st.solved && !right ? ' bmpr-dim' : ''}" role="button" tabindex="0"
          onclick="BMPR.pick('${o.v}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}">
        <div class="ut-opt-t">${V(o.l, st.ans)}</div>${o.sub ? `<div class="ut-opt-s">${V(o.sub, st.ans)}</div>` : ''}
        ${o.gate === 'block' ? `<div class="ut-tag block">🛑 No trade</div>` : o.gate === 'wait' ? `<div class="ut-tag wait">⏳ Wait</div>` : ''}
      </div>`; }).join('')}</div>`;
  }
  function multiHTML(s, qq){
    return `<div class="ut-opts compact bmpr-opts">${qq.options.map(o => {
      const on = st.solved ? s.ans.includes(o.v) : st.picks.includes(o.v);
      return `<div class="ut-opt neut${on ? ' on' : ''}${st.solved && on ? ' bmpr-right' : ''}" role="button" tabindex="0"
          onclick="BMPR.toggle('${o.v}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}">
        <span class="ut-check">${on ? '✓' : ''}</span><div class="ut-opt-t">${V(o.l, st.ans)}</div>${o.sub ? `<div class="ut-opt-s">${V(o.sub, st.ans)}</div>` : ''}</div>`; }).join('')}</div>`;
  }
  function levelsHTML(s, qq){
    const names = { price:'Current price (the dot)', swing_hi:'H1 swing high', swing_lo:'H1 swing low', zone_hi:'Golden pocket top (61.8%)', zone_lo:'Golden pocket bottom (65%)',
                    pdh:'Yesterday\'s high (PDH)', pdl:'Yesterday\'s low (PDL)', kr_hi:'First-hour range high', kr_lo:'First-hour range low' };
    const ladder = Object.keys(names).map(k => [k, names[k], s.lv[k]]).sort((a, b) => b[2] - a[2]);
    return `<div class="bmpr-ladder"><div class="bmpr-scene-h">📋 Price list from your chart (crosshair)</div>
        ${ladder.map(([k, lab, v]) => `<div class="bmpr-scene-r"><span>${esc(lab)}</span><b>${esc(v)}</b></div>`).join('')}</div>
      <div class="bmpr-note">Now type them into uTrade's boxes — exactly like you would from MT5 or TradingView. Boxes marked <i>optional</i> can stay empty.</div>
      <div class="ut-lv bmpr-lv">${qq.fields.map(f => {
        const need = s.req.includes(f.id);
        return `<div class="ut-lv-f${need ? ' req' : ''}${(st.bad || []).includes(f.id) ? ' bad' : ''}" data-f="${f.id}">
          <label for="bmpr-lv-${f.id}">${esc(V(f.label, st.ans))}${need ? ' <i>*</i>' : ' <em>optional</em>'}</label>
          <input id="bmpr-lv-${f.id}" type="text" inputmode="decimal" autocomplete="off" placeholder="e.g. 4200.00" value="${esc(st.lv[f.id] || '')}" ${st.solved ? 'readonly' : ''}>
          <small>${V(f.hint, st.ans)}</small></div>`; }).join('')}</div>`;
  }

  function finish(){
    const P = load(), id = st.run.id;
    P.done[id] = P.done[id] || new Date().toISOString();
    P.slips[id] = st.slips;
    save(P);
    st.i = st.run.steps.length + 1; draw();
    const b = document.querySelector('#bmpr-ov .bmd-body'); if(b) b.scrollTop = 0;
  }
  function goReal(){
    const style = st ? st.run.style : 'day';
    close();
    try {
      const nav = document.querySelector(`.nav-item[onclick*="goPage('checklist'"]`); goPage('checklist', nav);
      const tab = document.querySelector('.style-tab.' + style); if(tab) setStyle(style, tab);
      window.scrollTo(0, 0);
    } catch(e){}
  }

  // ── Entry points: uTrade Ideas (above My strategies) + Education home ──
  function cardHTML(where){
    const P = load(), d = Object.keys(P.done).filter(k => RUNS[k]).length, nx = nextRun();
    if(d && nx) return `<div class="bmpr-cta-i">🎯</div>
      <div class="bmpr-cta-t"><b>uTrade Certified · ${d}/${TOTAL} · next: Run ${nx.n}</b><span>${esc(nx.title)} — ${esc(nx.blurb)}.</span></div>
      <button class="ut-next" onclick="BMPR.open('${nx.id}')">Start Run ${nx.n} →</button>`;
    if(!d) return `<div class="bmpr-cta-i">🎯</div>
      <div class="bmpr-cta-t"><b>New to uTrade? Practise first</b><span>${where === 'uni' ? 'Start here: ' : ''}answer the real questions on a safe practice chart. Instant feedback, a real price plan at the end — and it doesn't use your 2 daily AI ideas.</span></div>
      <button class="ut-next" onclick="BMPR.open('r1')">Start practice →</button>`;
    return `<div class="bmpr-cta-i">✅</div>
      <div class="bmpr-cta-t"><b>uTrade Certified · ${d}/${TOTAL}</b><span>${d < TOTAL ? `Runs ${d + 1}–${TOTAL} are coming soon. ` : ''}Practise again any time.</span></div>
      <button class="ut-back" onclick="BMPR.open('${ORDER[0]}')">Practise again</button>`;
  }
  function paint(){
    const P = load(), d = Object.keys(P.done).filter(k => RUNS[k]).length, nx = nextRun();
    const anchor = document.getElementById('guided-toggle-bar');
    if(anchor){
      let el = document.getElementById('bmpr-ut');
      if(!el){ el = document.createElement('div'); el.id = 'bmpr-ut'; anchor.parentNode.insertBefore(el, document.getElementById('bm-mystrats') || anchor); }
      el.className = 'bmpr-cta' + (d && !nx ? ' done' : '');
      el.innerHTML = cardHTML('ut');
    }
    paintUni();
  }
  function paintUni(){
    const root = document.getElementById('uni-root'); if(!root) return;
    const home = root.querySelector('#uni-reset');        // only the University home has the reset button
    let el = document.getElementById('bmpr-uni');
    if(!home){ if(el) el.remove(); return; }
    if(!el){ el = document.createElement('div'); el.id = 'bmpr-uni'; root.insertBefore(el, root.firstChild); }
    const P = load(), d = Object.keys(P.done).filter(k => RUNS[k]).length;
    el.className = 'bmpr-cta' + (d && !nextRun() ? ' done' : '');
    el.innerHTML = `<div class="bmpr-start">START HERE</div>` + cardHTML('uni');
  }
  function watchUni(){
    const root = document.getElementById('uni-root'); if(!root || root._bmpr) return;
    root._bmpr = true;
    new MutationObserver(() => { if(!document.getElementById('bmpr-uni') || !root.querySelector('#uni-reset')) paintUni(); }).observe(root, { childList:true });
  }

  // ── Styles ──
  const css = document.createElement('style');
  css.textContent = `
.bmpr-cta{position:relative;display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 12px;padding:16px 18px;border-radius:16px;border:1px solid rgba(245,184,65,0.45);background:linear-gradient(135deg,rgba(245,184,65,0.12),rgba(42,143,227,0.05))}
.bmpr-cta.done{border-color:rgba(34,214,122,0.35);background:linear-gradient(135deg,rgba(34,214,122,0.08),rgba(42,143,227,0.03));padding:12px 16px}
.bmpr-cta-i{font-size:26px;line-height:1}
.bmpr-cta-t{flex:1;min-width:200px;display:flex;flex-direction:column;gap:3px}
.bmpr-cta-t b{font-family:'Outfit',sans-serif;font-size:16px;color:var(--text)}
.bmpr-cta-t span{font-size:12.5px;color:var(--text2);line-height:1.5}
.bmpr-start{position:absolute;top:-9px;left:16px;font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.14em;font-weight:700;color:#1a1204;background:#F5B841;padding:2px 8px;border-radius:6px}
#bmpr-uni{margin:6px 0 16px}
.bmpr-box .bmd-body{display:flex;flex-direction:column;gap:12px}
.bmpr-prog{height:4px;border-radius:4px;background:var(--bg4);overflow:hidden}
.bmpr-prog i{display:block;height:100%;background:linear-gradient(90deg,#2A8FE3,#22D67A);transition:width .3s}
.bmpr-pic{border-radius:14px;background:rgba(0,0,0,0.35);border:1px solid var(--border);padding:8px 8px 6px;display:flex;flex-direction:column;align-items:center}
.bmpr-pic svg{max-width:560px!important;width:100%;height:auto}
.bmpr-cap{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;color:var(--text3);text-transform:uppercase;margin-top:4px;text-align:center}
.bmpr-scene,.bmpr-ladder,.bmpr-size,.bmpr-warns,.bmpr-real{border-radius:14px;background:var(--bg4);border:1px solid var(--border2);padding:12px 14px;display:flex;flex-direction:column;gap:6px}
.bmpr-scene small,.bmpr-size small,.bmpr-warns small{font-size:11.5px;color:var(--text3);line-height:1.5}
.bmpr-scene-h{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);font-weight:700}
.bmpr-scene-r{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--text2);border-bottom:1px dashed var(--border);padding:3px 0}
.bmpr-scene-r:last-of-type{border-bottom:0}
.bmpr-scene-r b{color:var(--text);font-family:'DM Mono',monospace;font-size:12.5px;text-align:right}
.bmpr-scene-r b.ok,.bmpr-size b.ok{color:var(--bull,#22D67A)} .bmpr-scene-r b.no{color:var(--bear,#FF5C5C)}
.bmpr-clock{display:flex;align-items:baseline;gap:10px}.bmpr-clock b{font-family:'Outfit',sans-serif;font-size:24px;color:var(--text)}.bmpr-clock span{font-size:12px;color:var(--text3)}
.bmpr-cal{display:grid;grid-template-columns:44px 40px 1fr auto;gap:8px;align-items:center;font-size:12.5px;color:var(--text2);padding:3px 0}
.bmpr-cal .t,.bmpr-cal .c{font-family:'DM Mono',monospace;color:var(--text)}
.bmpr-cal .i{font-family:'DM Mono',monospace;font-size:9.5px;font-weight:700;padding:2px 7px;border-radius:6px}
.bmpr-cal .i.high{background:rgba(255,92,92,0.18);color:#FF6B6B}
.bmpr-cal.hot{background:rgba(255,92,92,0.06);border-radius:8px;padding:5px 6px;margin:0 -6px}
.bmpr-cal .i.med{background:rgba(245,140,40,0.18);color:#F59A3C}.bmpr-cal .i.low{background:rgba(245,215,65,0.15);color:#E8CC4A}
.bmpr-fb{border-radius:12px;padding:11px 14px;font-size:13.5px;line-height:1.55;color:var(--text);animation:rise .2s ease both}
.bmpr-fb.ok{background:rgba(34,214,122,0.1);border:1px solid rgba(34,214,122,0.4)}
.bmpr-fb.no{background:rgba(255,92,92,0.08);border:1px solid rgba(255,92,92,0.4)}
.bmpr-hint{font-size:12.5px;color:var(--text2);padding:0 4px}
.bmpr-opts .ut-opt.bmpr-right{border-color:var(--bull,#22D67A)!important;box-shadow:0 0 0 1px var(--bull,#22D67A)!important;background:rgba(34,214,122,0.1)!important}
.bmpr-opts .ut-opt.bmpr-wrong{border-color:rgba(255,92,92,0.6)!important;animation:bmprShake .3s}
.bmpr-opts .ut-opt.bmpr-dim{opacity:.45}
@keyframes bmprShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.bmpr-lv .ut-lv-f.bad input{border-color:var(--bear,#FF5C5C)!important;box-shadow:0 0 0 1px var(--bear,#FF5C5C)}
.bmpr-foot-r{display:flex;gap:8px;align-items:center;margin-left:auto}
.bmpr-box .bmd-foot button{white-space:nowrap}
.bmpr-tap{font-size:12px;color:var(--text3)}
.bmpr-brief{font-size:15px;line-height:1.6;color:var(--text)}
.bmpr-how{display:flex;flex-direction:column;gap:8px}
.bmpr-how div{display:flex;gap:12px;align-items:center;font-size:13.5px;color:var(--text2)}
.bmpr-how b{width:26px;height:26px;border-radius:8px;background:rgba(42,143,227,0.15);color:var(--blue);display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;flex-shrink:0}
.bmpr-note{font-size:12.5px;color:var(--text3);line-height:1.5}
.bmpr-grade{display:flex;align-items:center;gap:14px;border-radius:14px;padding:14px 16px;border:1px solid}
.bmpr-grade.bull{border-color:rgba(34,214,122,0.45);background:rgba(34,214,122,0.08)}.bmpr-grade.amber{border-color:rgba(245,184,65,0.45);background:rgba(245,184,65,0.08)}
.bmpr-grade .g{font-family:'Outfit',sans-serif;font-size:34px;font-weight:800;color:var(--bull,#22D67A);min-width:54px;text-align:center}
.bmpr-grade.amber .g{color:#F5B841}
.bmpr-grade b{display:block;font-size:15px;color:var(--text)}.bmpr-grade span{font-size:12px;color:var(--text2)}
.bmpr-plan{display:flex;flex-direction:column;gap:8px}
.bmpr-pr{display:flex;gap:12px;border-radius:12px;background:var(--bg4);border:1px solid var(--border2);padding:10px 12px}
.bmpr-pr .k{width:38px;flex-shrink:0;font-family:'DM Mono',monospace;font-size:11px;font-weight:700;color:var(--blue);padding-top:2px}
.bmpr-pr.sl .k{color:var(--bear,#FF5C5C)}.bmpr-pr.tp .k{color:var(--bull,#22D67A)}
.bmpr-pr b{font-size:13.5px;color:var(--text)}.bmpr-pr em{font-style:normal;font-family:'DM Mono',monospace;margin-left:6px}
.bmpr-pr small{display:block;font-size:11px;color:var(--text3);margin-top:1px}
.bmpr-pr p{margin:4px 0 0;font-size:12.5px;color:var(--text2);line-height:1.5}
.bmpr-warns div,.bmpr-real div{font-size:12.5px;color:var(--text2);line-height:1.5}
.bmpr-done{display:flex;flex-direction:column;gap:8px}
.bmpr-would{display:flex;justify-content:space-between;align-items:center;gap:10px;border-radius:12px;border:1px dashed var(--border2);padding:10px 14px;font-size:13px;color:var(--text2)}
.bmpr-would b{font-family:'DM Mono',monospace;color:var(--text3);text-decoration:line-through;white-space:nowrap}
.bmpr-gate{display:flex;flex-direction:column;gap:2px;padding:6px 0;border-bottom:1px dashed var(--border)}
.bmpr-gate:last-child{border-bottom:0}
.bmpr-gate b{font-size:13px;color:var(--text)}.bmpr-gate span{font-size:12.5px;color:var(--text2);line-height:1.5}
.bmpr-grade.block{border-color:rgba(255,92,92,0.45);background:rgba(255,92,92,0.07)}
.bmpr-grade.amber .g,.bmpr-grade.block .g{font-size:28px}
.bmpr-soon.ready{opacity:1;border-style:solid;border-color:rgba(42,143,227,0.45)}
.bmpr-soon.ready i{color:var(--blue)}
.bmpr-badge{display:flex;gap:14px;align-items:center;border-radius:14px;padding:14px 16px;background:linear-gradient(135deg,rgba(34,214,122,0.14),rgba(42,143,227,0.06));border:1px solid rgba(34,214,122,0.45);margin-bottom:6px}
.bmpr-badge span{font-size:30px}.bmpr-badge b{display:block;font-family:'Outfit',sans-serif;font-size:17px;color:var(--text)}.bmpr-badge small{font-size:12px;color:var(--text2)}
.bmpr-l{font-size:13px;color:var(--text2)}
.bmpr-soon{display:grid;grid-template-columns:1fr auto;gap:2px 10px;border-radius:12px;border:1px dashed var(--border2);padding:9px 12px;opacity:.75}
.bmpr-soon b{font-size:13px;color:var(--text)}.bmpr-soon span{grid-column:1;font-size:12px;color:var(--text3)}
.bmpr-soon i{grid-row:1/3;grid-column:2;align-self:center;font-style:normal;font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.08em;color:var(--text3);text-transform:uppercase}
@media (max-width:640px){
  .bmpr-cta{padding:14px}
  .bmpr-cta .ut-next,.bmpr-cta .ut-back{width:100%}
  .bmpr-cal{grid-template-columns:40px 34px 1fr;font-size:12px}.bmpr-cal .i{grid-column:3;justify-self:start}
  .bmpr-pic{padding:6px 4px 4px}
  .bmd-foot .ut-next{padding-left:14px;padding-right:14px}
}`;
  document.head.appendChild(css);

  function boot(){ paint(); watchUni(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  return { open, close, pick, reveal, toggle, check, checkLevels, next, back, finish, goReal, paint,
           status: () => load(), RUNS, _st: () => st };
})();
