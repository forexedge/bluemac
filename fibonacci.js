// ══════════════════════════════════════════════════════
// EXAMPLES → FIBONACCI LIBRARY
// Fib retracement lessons + trade diagrams (same style as Patterns)
// ══════════════════════════════════════════════════════
(function(){
  const W = 260, H = 150, X2 = 212;
  const C = { bull:'#22D67A', bear:'#FF5C5C', blue:'#2A8FE3', light:'#96D0FF', silver:'#E4E8EE', slate:'#8AA4BF', white:'rgba(255,255,255,0.45)' };
  const LVL_COL = { 0:C.white, 1:C.white, 0.236:C.slate, 0.382:C.slate, 0.5:C.silver, 0.618:C.blue, 0.65:C.blue, 0.786:C.light };
  const GROUPS = [
    ['all','All Fibonacci','#2A8FE3'],
    ['basics','Basics','#2A8FE3'],
    ['entries','Entry Levels','#22D67A'],
    ['confluence','Confluence','#8AA4BF'],
    ['targets','Targets & Risk','#E4E8EE']
  ];

  // Level y-position: s = swing start (100%), e = swing end (0%)
  const fy = (f, r) => +(f.e[1] + r * (f.s[1] - f.e[1])).toFixed(1);
  const pct = r => (r < 0 ? (1 - r) * 100 : r * 100).toFixed(1).replace('.0','') + '%';
  const pts = a => a.map(p => p.join(',')).join(' ');
  const T = (x,y,t,o={}) => `<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" font-family="'DM Mono',monospace" font-size="${o.s||7}" font-weight="bold" fill="${o.c||'rgba(255,255,255,0.82)'}" opacity="${o.o||1}">${t}</text>`;

  function arrow(a, b, col){
    const ang = Math.atan2(b[1]-a[1], b[0]-a[0]), L = 8, w = 4.5;
    const c = Math.cos(ang), s = Math.sin(ang);
    return `<polygon points="${b[0]},${b[1]} ${(b[0]-L*c+w*s).toFixed(1)},${(b[1]-L*s-w*c).toFixed(1)} ${(b[0]-L*c-w*s).toFixed(1)},${(b[1]-L*s+w*c).toFixed(1)}" fill="${col}"/>`;
  }

  function svg(p){
    const col = C[p.bias] || C.blue;
    let s = `<svg width="100%" viewBox="0 0 ${W} ${H}" style="max-width:320px;display:block;" xmlns="http://www.w3.org/2000/svg">`;

    (p.fibs || []).forEach(f => {
      const x1 = f.x1 !== undefined ? f.x1 : f.s[0];
      // Shaded zone
      if(f.zone){
        const a = fy(f, f.zone[0]), b = fy(f, f.zone[1]);
        s += `<rect x="${x1}" y="${Math.min(a,b)}" width="${X2-x1}" height="${Math.max(Math.abs(b-a),3)}" fill="${f.zc||C.blue}" opacity="0.22"/>`;
        if(f.zl) s += T(258, (a+b)/2 + 2.5, f.zl, {a:'end', c:f.zc||C.blue});
      }
      // Levels
      f.levels.forEach(r => {
        const y = fy(f, r);
        const hl = (f.hl || []).includes(r);
        const lc = f.col || (r < 0 ? C.bull : (LVL_COL[r] || C.slate));
        s += `<line x1="${x1}" y1="${y}" x2="${X2}" y2="${y}" stroke="${lc}" stroke-width="${hl?1.5:1}" stroke-dasharray="${r<0?'2,3':'4,3'}" opacity="${hl?0.95:0.5}"/>`;
        const lab = (f.lab && f.lab[r] !== undefined) ? f.lab[r] : pct(r);
        if(lab) s += T(f.side==='l' ? x1-3 : 258, y + 2.5, lab, {a: f.side==='l' ? 'end' : 'end', c: lc, o: hl ? 1 : 0.8});
      });
    });

    // Extra lines (SL, S/R, trendlines, MA)
    (p.lines || []).forEach(l => {
      const lc = C[l.c] || l.c;
      if(l.curve){
        s += `<polyline points="${pts(l.curve)}" fill="none" stroke="${lc}" stroke-width="1.6" opacity="0.85"/>`;
      } else {
        s += `<line x1="${l.p[0]}" y1="${l.p[1]}" x2="${l.p[2]}" y2="${l.p[3]}" stroke="${lc}" stroke-width="${l.w||1.3}" stroke-dasharray="${l.solid?'':'5,3'}" opacity="0.85"/>`;
      }
      if(l.l) s += T(l.at[0], l.at[1], l.l, {a:l.at[2]||'middle', c:lc});
    });

    // "Draw the tool" guide arrow
    if(p.guide){
      const [a,b] = p.guide;
      s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${C.blue}" stroke-width="1.4" stroke-dasharray="3,3"/>` + arrow(a, b, C.blue);
      s += `<circle cx="${a[0]}" cy="${a[1]}" r="3.5" fill="none" stroke="${C.blue}" stroke-width="1.5"/>`;
    }

    // Price
    s += `<polyline points="${pts(p.path)}" fill="none" stroke="rgba(255,255,255,0.62)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    if(p.trade){
      s += `<polyline points="${pts(p.trade)}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += arrow(p.trade[p.trade.length-2], p.trade[p.trade.length-1], col);
    }

    // Candles: [x, open, close, high, low]
    (p.candles || []).forEach(([x,o,c,h,l]) => {
      const cc = c < o ? C.bull : C.bear;
      s += `<line x1="${x}" y1="${h}" x2="${x}" y2="${l}" stroke="${cc}" stroke-width="2"/>`;
      s += `<rect x="${x-5}" y="${Math.min(o,c)}" width="10" height="${Math.max(Math.abs(o-c),2)}" fill="${cc}" rx="1"/>`;
    });

    if(p.trade){
      const e = p.trade[0];
      s += `<circle cx="${e[0]}" cy="${e[1]}" r="3.5" fill="${col}" stroke="#080808" stroke-width="1.2"/>`;
    }
    (p.marks || []).forEach(([x,y]) => {
      s += `<line x1="${x-4}" y1="${y-4}" x2="${x+4}" y2="${y+4}" stroke="${C.bear}" stroke-width="2"/><line x1="${x-4}" y1="${y+4}" x2="${x+4}" y2="${y-4}" stroke="${C.bear}" stroke-width="2"/>`;
    });
    (p.labels || []).forEach(([x,y,t,a,c]) => { s += T(x, y, t, {a:a||'middle', s:7.5, c:c ? (C[c]||c) : undefined}); });

    return s + `</svg>`;
  }

  function card(p){
    const g = GROUPS.find(x => x[0] === p.g) || GROUPS[0];
    const bc = p.bias==='bull' ? 'var(--bull)' : p.bias==='bear' ? 'var(--bear)' : 'var(--blue)';
    return `
      <div class="ex-card" data-id="fib-${p.id}" data-cat="fib fib-${p.g}" style="display:none;">
        <div class="ex-card-header">
          <div class="ex-card-icon">${p.icon}</div>
          <div class="ex-card-title">${p.name}</div>
          <span class="ex-card-tag" style="background:${g[2]}1F;color:${g[2]};border:1px solid ${g[2]}55;">${g[1]}</span>
        </div>
        <div class="ex-card-body">
          <div class="ex-card-desc">${p.desc}</div>
          <div class="ex-diagram">
            <div class="ex-diagram-item" style="width:100%;">
              ${svg(p)}
              <div class="ex-diagram-label" style="color:${bc};">${p.tag}</div>
            </div>
          </div>
          <div class="ex-rule"><div class="ex-rule-icon">🎯</div><div class="ex-rule-text"><strong>How to trade it:</strong> ${p.how}</div></div>
          ${p.tip ? `<div class="ex-rule"><div class="ex-rule-icon">💡</div><div class="ex-rule-text">${p.tip}</div></div>` : ''}
        </div>
      </div>`;
  }

  // ── Swing templates ──
  const UP   = { s:[18,128], e:[92,28] };   // L(r) = 28 + 100r
  const DOWN = { s:[18,22],  e:[92,122] };  // L(r) = 122 - 100r
  const ALL  = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
  const KEY  = [0, 0.382, 0.5, 0.618, 1];
  const upPath   = (y) => [[18,128],[45,98],[55,106],[92,28],[110,60],[120,52],[140,y]];
  const downPath = (y) => [[18,22],[45,52],[55,44],[92,122],[110,90],[120,98],[140,y]];

  const FIBS = [
    // ───────── BASICS ─────────
    { id:'what', name:'What Is Fibonacci Retracement?', icon:'🌀', g:'basics', bias:'bull',
      desc:`Markets never move in a straight line — after every push, price <strong>pulls back</strong> before continuing. Fibonacci retracement measures <em>how far</em> that pullback goes. The key levels are <strong>23.6%, 38.2%, 50%, 61.8% and 78.6%</strong> of the previous swing.`,
      how:`Never trade a Fib level on its own. Use it to find <strong>where</strong> to look for an entry, then wait for your confirmation (rejection candle, structure, MA) at that level.`,
      tip:`61.8% is the "golden ratio" and the most watched level by institutions. 50% isn't a true Fibonacci number, but every trader watches it, so it works.`,
      tag:'◆ PULLBACK INTO THE LEVELS · THEN TREND RESUMES',
      fibs:[Object.assign({ levels:ALL }, UP)],
      path:upPath(89.8),
      trade:[[140,89.8],[165,52],[175,60],[205,14]],
      labels:[[18,141,'SWING LOW','start'],[92,20,'SWING HIGH']] },

    { id:'draw-up', name:'How to Draw It — Uptrend', icon:'✏️', g:'basics', bias:'bull',
      desc:`In an uptrend, click the <strong>swing low</strong> first and drag to the <strong>swing high</strong>. 0% sits at the high, 100% at the low — the levels in between are where you expect the pullback to stop.`,
      how:`Use the <strong>wick</strong> extremes of the most recent clear swing (the one that broke structure). Wait for price to pull back into 50%–61.8% before looking for buys.`,
      tip:`Most charting platforms flip the numbers depending on draw direction. If 0% isn't at the swing high in an uptrend, you drew it backwards.`,
      tag:'▲ CLICK LOW → DRAG TO HIGH',
      fibs:[Object.assign({ levels:KEY }, UP)],
      guide:[[24,122],[88,33]],
      path:[[18,128],[40,100],[50,108],[92,28],[112,58],[122,50],[136,74]],
      labels:[[18,141,'① CLICK LOW','start','blue'],[92,20,'② DRAG TO HIGH','middle','blue']] },

    { id:'draw-down', name:'How to Draw It — Downtrend', icon:'✏️', g:'basics', bias:'bear',
      desc:`In a downtrend, click the <strong>swing high</strong> first and drag to the <strong>swing low</strong>. 0% sits at the low, 100% at the high — you're now measuring how far price rallies back up.`,
      how:`Use the most recent swing that made a <strong>lower low</strong>. Wait for the rally into 50%–61.8% and look for sells there.`,
      tip:`Same tool, same levels — only the direction changes. Always draw in the direction of the trend you want to trade.`,
      tag:'▼ CLICK HIGH → DRAG TO LOW',
      fibs:[Object.assign({ levels:KEY }, DOWN)],
      guide:[[24,28],[88,117]],
      path:[[18,22],[40,50],[50,42],[92,122],[112,92],[122,100],[136,76]],
      labels:[[18,14,'① CLICK HIGH','start','blue'],[92,137,'② DRAG TO LOW','middle','blue']] },

    // ───────── ENTRY LEVELS ─────────
    { id:'buy618', name:'Buying the 61.8% Pullback', icon:'🟢', g:'entries', bias:'bull',
      desc:`The classic Fib trade. In an uptrend, price pulls back to the <strong>61.8% level</strong>, buyers step back in, and the trend continues to a new high.`,
      how:`Buy when a bullish candle closes at 61.8%. SL below 78.6% (or below the swing low for safety). TP1 = the swing high (0%), TP2 = the 127.2% extension.`,
      tip:`If price slices through 61.8% with big bearish candles, don't catch the knife — wait for it to show rejection first.`,
      tag:'▲ BUY AT 61.8% · SL BELOW 78.6%',
      fibs:[Object.assign({ levels:[0,0.382,0.5,0.618,0.786,1], hl:[0.618] }, UP)],
      lines:[{ p:[132,116,X2,116], c:'bear', l:'SL', at:[X2+4,119,'start'] }],
      path:upPath(89.8),
      trade:[[140,89.8],[168,50],[178,58],[205,14]],
      labels:[[134,100,'BUY','end','bull']] },

    { id:'sell618', name:'Selling the 61.8% Rally', icon:'🔴', g:'entries', bias:'bear',
      desc:`The mirror image. In a downtrend, price rallies back up to the <strong>61.8% level</strong>, sellers step back in, and the trend continues to a new low.`,
      how:`Sell when a bearish candle closes at 61.8%. SL above 78.6% (or above the swing high). TP1 = the swing low (0%), TP2 = the 127.2% extension.`,
      tip:`The best sells come when the 61.8% level also lines up with old support that has flipped into resistance.`,
      tag:'▼ SELL AT 61.8% · SL ABOVE 78.6%',
      fibs:[Object.assign({ levels:[0,0.382,0.5,0.618,0.786,1], hl:[0.618] }, DOWN)],
      lines:[{ p:[132,34,X2,34], c:'bear', l:'SL', at:[X2+4,37,'start'] }],
      path:downPath(60.2),
      trade:[[140,60.2],[168,100],[178,92],[205,136]],
      labels:[[134,55,'SELL','end','bear']] },

    { id:'golden', name:'The Golden Pocket (61.8–65%)', icon:'🏆', g:'entries', bias:'bull',
      desc:`The tight zone between <strong>61.8% and 65%</strong> is called the <strong>golden pocket</strong>. It's where the most stop hunts end and big orders sit — the highest-probability Fib zone.`,
      how:`Set a limit buy inside the golden pocket, or wait for a rejection candle there. SL below 78.6%. Targets: the swing high, then the 127.2% extension.`,
      tip:`Add the 0.65 level to your Fib tool settings — most platforms don't show it by default.`,
      tag:'▲ BUY THE GOLDEN POCKET',
      fibs:[{ s:[18,138], e:[92,14], levels:[0,0.5,0.786,1], zone:[0.618,0.65], zl:'61.8–65%', zc:C.blue }],
      path:[[18,138],[45,105],[55,113],[92,14],[110,50],[120,42],[140,92.5]],
      trade:[[140,92.5],[168,45],[178,53],[205,8]],
      labels:[[180,106,'GOLDEN POCKET','middle','blue']] },

    { id:'382', name:'The 38.2% Shallow Pullback', icon:'⚡', g:'entries', bias:'bull',
      desc:`In a <strong>strong trend</strong>, buyers are too impatient to wait for a deep pullback — price only retraces to <strong>38.2%</strong> before exploding higher.`,
      how:`Only use 38.2% when the trend is strong (big impulsive candles, clean higher highs). Buy the rejection at 38.2%, SL below 61.8%.`,
      tip:`If price blows through 38.2% easily, the next stop is usually 50%–61.8%. Don't force the entry.`,
      tag:'▲ STRONG TREND · SHALLOW PULLBACK',
      fibs:[Object.assign({ levels:[0,0.236,0.382,0.5,0.618,1], hl:[0.382] }, UP)],
      path:[[18,128],[45,98],[55,106],[92,28],[108,52],[116,46],[130,66.2]],
      trade:[[130,66.2],[160,30],[170,38],[200,6]],
      labels:[[124,75,'BUY','end','bull']] },

    { id:'50', name:'The 50% Level', icon:'⚖️', g:'entries', bias:'bull',
      desc:`Not a true Fibonacci ratio, but it's the halfway point of the move — and price respects it constantly because <strong>every trader watches it</strong>.`,
      how:`Buy a bullish rejection candle at 50%. SL below 61.8%. Works best when 50% lines up with a previous support or resistance level.`,
      tip:`Treat 50%–61.8% as one zone. Price often tags 50%, wicks to 61.8%, and then takes off.`,
      tag:'▲ BUY THE HALFWAY POINT',
      fibs:[Object.assign({ levels:[0,0.382,0.5,0.618,1], hl:[0.5] }, UP)],
      path:upPath(78),
      trade:[[140,78],[166,40],[176,48],[205,10]],
      labels:[[134,87,'BUY','end','bull']] },

    { id:'786', name:'The 78.6% Deep Retracement', icon:'🛡️', g:'entries', bias:'bull',
      desc:`The <strong>last line of defence</strong>. A pullback to 78.6% is deep — but if buyers hold it, the trend is still alive and the risk-to-reward is massive because your stop is so tight.`,
      how:`Buy a strong rejection at 78.6%. SL just below the swing low (100%). Target the swing high — often a 1:3+ trade.`,
      tip:`Below 78.6% there's no more Fib support. If 100% breaks, the trend is over (see "When Fib Fails").`,
      tag:'▲ DEEP PULLBACK · TIGHT STOP · BIG R:R',
      fibs:[Object.assign({ levels:[0,0.382,0.618,0.786,1], hl:[0.786] }, UP)],
      lines:[{ p:[132,134,X2,134], c:'bear', l:'SL', at:[X2+4,137,'start'] }],
      path:upPath(106.6),
      trade:[[140,106.6],[170,58],[180,66],[205,18]],
      labels:[[134,119,'BUY','end','bull']] },

    // ───────── CONFLUENCE ─────────
    { id:'sr', name:'Fib + Support/Resistance Flip', icon:'🧱', g:'confluence', bias:'bull',
      desc:`The most powerful Fib setup. Old <strong>resistance</strong> breaks, then price pulls back and the <strong>61.8% level lands exactly on it</strong>. Old resistance becomes new support — two reasons to buy in one spot.`,
      how:`Buy the rejection at the 61.8% + flipped level. SL below 78.6%. TP1 = swing high, TP2 = 127.2% extension.`,
      tip:`The more things that line up at one price (Fib, S/R, MA, trendline), the higher the probability. 2–3 confluences is ideal.`,
      tag:'▲ 61.8% + OLD RESISTANCE = NEW SUPPORT',
      fibs:[Object.assign({ levels:[0,0.382,0.618,0.786,1], hl:[0.618], x1:60 }, UP)],
      lines:[{ p:[18,89.8,150,89.8], c:'bull', w:2.2, solid:true }],
      path:[[18,128],[34,90],[46,112],[58,90],[92,28],[110,58],[120,50],[140,89.8]],
      trade:[[140,89.8],[168,50],[178,58],[205,14]],
      labels:[[34,82,'RES','middle','bear'],[160,101,'→ SUPPORT','start','bull']] },

    { id:'ma', name:'Fib + 50 MA (Entry Zone)', icon:'📈', g:'confluence', bias:'bull',
      desc:`When the <strong>61.8% level</strong> lines up with the <strong>50 MA</strong>, you have Fib structure and dynamic support at the same price. In Blue Mac terms, this is the <strong>Entry Zone</strong> with Fib confirmation.`,
      how:`Wait for price to touch both the 50 MA and 61.8%, then buy the bullish close. SL below 78.6% or below the MA by a few pips. TP = swing high.`,
      tip:`If the 50 MA is sloping up strongly, expect a shallower pullback (38.2%–50%) to tag it instead.`,
      tag:'▲ 61.8% + 50 MA = ENTRY ZONE',
      fibs:[Object.assign({ levels:[0,0.382,0.5,0.618,1], hl:[0.618] }, UP)],
      lines:[{ curve:[[18,140],[60,120],[100,103],[140,89.8],[180,75],[212,64]], c:C.slate, l:'50 MA', at:[190,100,'middle'] }],
      path:upPath(89.8),
      trade:[[140,89.8],[168,50],[178,58],[205,14]] },

    { id:'trend', name:'Fib + Trendline', icon:'📐', g:'confluence', bias:'bull',
      desc:`Draw your trendline along the higher lows. When the pullback brings price back to the <strong>trendline at the same spot as 61.8%</strong>, both tools are telling you the same thing.`,
      how:`Buy the bounce off the trendline + 61.8% confluence. SL below the trendline and 78.6%. TP = swing high, then extension.`,
      tip:`A trendline needs at least 2 touches to be valid — the Fib bounce becomes the 3rd touch, which is the strongest.`,
      tag:'▲ TRENDLINE + 61.8% CONFLUENCE',
      fibs:[Object.assign({ levels:[0,0.382,0.5,0.618,1], hl:[0.618] }, UP)],
      lines:[{ p:[18,128,X2,67.3], c:'blue', w:1.6, l:'TRENDLINE', at:[78,118,'middle'] }],
      path:upPath(89.8),
      trade:[[140,89.8],[168,50],[178,58],[205,14]] },

    { id:'candle', name:'Fib + Rejection Candle', icon:'🕯️', g:'confluence', bias:'bull',
      desc:`The level tells you <strong>where</strong>, the candle tells you <strong>when</strong>. A pin bar or bullish engulfing candle at 61.8% shows buyers are actively defending the level.`,
      how:`Buy on the close of the rejection candle (or on a break of its high). SL below the candle's wick. TP = swing high.`,
      tip:`The longer the wick through the level and the stronger the close back above it, the better the signal.`,
      tag:'▲ PIN BAR AT 61.8% = ENTRY TRIGGER',
      fibs:[Object.assign({ levels:[0,0.382,0.5,0.618,0.786,1], hl:[0.618] }, UP)],
      path:[[18,128],[45,98],[55,106],[92,28],[110,60],[120,52],[136,88]],
      candles:[[147,91,83,80,110]],
      trade:[[160,83],[180,48],[190,56],[208,16]],
      labels:[[147,121,'PIN BAR','middle','bull']] },

    { id:'cluster', name:'Fib Clusters', icon:'🎯', g:'confluence', bias:'bull',
      desc:`Draw Fib on <strong>two different swings</strong>. When a level from one (e.g. 38.2% of the big swing A) lands on a level from the other (61.8% of the smaller swing B), you get a <strong>cluster</strong> — a very strong zone.`,
      how:`Buy the rejection inside the cluster zone. SL below the next Fib level. TP = swing high.`,
      tip:`Clusters also work across timeframes — e.g. the H4 61.8% lining up with the D1 38.2%.`,
      tag:'▲ TWO FIBS · ONE ZONE',
      fibs:[
        { s:[18,138], e:[120,14], levels:[0,0.382,0.618,1], hl:[0.382], lab:{0.382:'A38 + B62'} },
        { s:[66,90.7], e:[120,14], levels:[0.618], col:C.light, lab:{0.618:''} }
      ],
      path:[[18,138],[48,78],[66,90.7],[120,14],[138,45],[146,38],[162,61.4]],
      trade:[[162,61.4],[184,25],[192,31],[208,6]],
      labels:[[18,148,'A','middle','silver'],[66,104,'B','middle','light'],[164,76,'CLUSTER','middle','blue']] },

    // ───────── TARGETS & RISK ─────────
    { id:'ext', name:'Fib Extensions — Taking Profit', icon:'💰', g:'targets', bias:'bull',
      desc:`Fibonacci also tells you <strong>where to take profit</strong>. Extend the tool beyond 0% and the <strong>127.2%</strong> and <strong>161.8%</strong> levels become your targets after the pullback entry.`,
      how:`Enter at the 61.8% pullback. TP1 at the old swing high (0%), TP2 at 127.2%, TP3 at 161.8%. Move your SL to breakeven once TP1 hits.`,
      tip:`Add -0.272 and -0.618 to your Fib tool settings — they show as 127.2% and 161.8% above the swing high.`,
      tag:'▲ TP1 0% · TP2 127.2% · TP3 161.8%',
      fibs:[{ s:[18,140], e:[80,72], levels:[0,0.618,1,-0.272,-0.618], hl:[0.618,-0.272,-0.618], lab:{'-0.272':'TP2 127.2%','-0.618':'TP3 161.8%','0':'TP1 0%'} }],
      path:[[18,140],[40,112],[50,120],[80,72],[95,96],[103,89],[118,114]],
      trade:[[118,114],[148,64],[158,72],[188,30]] },

    { id:'sl', name:'Where to Put Your Stop Loss', icon:'🛑', g:'targets', bias:'bull',
      desc:`Your stop goes where the trade idea is <strong>proven wrong</strong>. For a 61.8% entry that's either below <strong>78.6%</strong> (tight) or below the <strong>swing low</strong> (safe).`,
      how:`SL 1 below 78.6% = smaller risk, bigger R:R, more likely to get stopped. SL 2 below the swing low = wider stop, but the trend has to actually break to hit it. Size your lot to the stop, never the other way round.`,
      tip:`Always add a few pips of buffer beyond the level for spread and stop hunts — round numbers attract wicks.`,
      tag:'▲ SL 1 = BELOW 78.6% · SL 2 = BELOW SWING LOW',
      fibs:[Object.assign({ levels:[0,0.5,0.618,0.786,1], hl:[0.618] }, UP)],
      lines:[{ p:[130,113,X2,113], c:'bear', l:'SL 1', at:[178,121,'middle'] },
             { p:[130,134,X2,134], c:'bear', l:'SL 2', at:[178,145,'middle'] }],
      path:upPath(89.8),
      trade:[[140,89.8],[168,50],[178,58],[205,14]] },

    { id:'fail', name:'When Fib Fails (Invalidation)', icon:'❌', g:'targets', bias:'bear',
      desc:`If price closes <strong>below the 100% level</strong> (the swing low), the pullback is no longer a pullback — the uptrend structure is broken and every Fib buy idea is <strong>invalid</strong>.`,
      how:`Exit immediately (your SL should already be there). Don't redraw the Fib to "make it work". Wait for a new structure — a break below 100% often starts a new downtrend you can sell.`,
      tip:`One of the biggest beginner mistakes is redrawing Fibs after they fail. The level failing IS the information.`,
      tag:'✕ CLOSE BELOW 100% = SETUP INVALID',
      fibs:[{ s:[18,118], e:[90,28], levels:[0,0.382,0.618,0.786,1], hl:[1] }],
      path:[[18,118],[45,90],[55,98],[90,28],[105,55],[115,48],[135,83.6]],
      trade:[[135,83.6],[148,72],[162,106],[172,98],[198,142]],
      marks:[[185,118]],
      labels:[[100,138,'SETUP INVALID','middle','bear']] }
  ];

  const grid = document.getElementById('examples-grid');
  if(grid) grid.insertAdjacentHTML('beforeend', FIBS.map(card).join(''));

  const sub = document.getElementById('fib-subfilter');
  if(sub){
    sub.innerHTML = `<span class="pattern-subfilter-label">${FIBS.length} Fib Lessons</span>` +
      GROUPS.map(([k,label],i) => {
        const n = k==='all' ? FIBS.length : FIBS.filter(p => p.g===k).length;
        return `<button class="pat-filter fib-filter${i===0?' on':''}" onclick="filterFib('${k}',this)">${label}<span>${n}</span></button>`;
      }).join('');
  }
})();

function filterFib(group, btn){
  document.querySelectorAll('.fib-filter').forEach(b => b.classList.remove('on'));
  if(btn) btn.classList.add('on');
  document.querySelectorAll('.ex-card').forEach(card => {
    const cats = (card.dataset.cat || '').split(' ');
    card.style.display = cats.includes('fib') && (group==='all' || cats.includes('fib-'+group)) ? 'block' : 'none';
  });
}
