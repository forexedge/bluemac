// ══════════════════════════════════════════════════════
// EXAMPLES → PATTERNS LIBRARY
// Data-driven chart pattern cards (same style as Examples)
// ══════════════════════════════════════════════════════
(function(){
  const W = 260, H = 150;
  const COL = { bull:'#22D67A', bear:'#FF5C5C', both:'#2A8FE3', neck:'#E4E8EE', res:'#FF5C5C', sup:'#22D67A', trend:'#2A8FE3', tgt:'#E4E8EE' };
  const SWAP = { bull:'bear', bear:'bull', both:'both', res:'sup', sup:'res', neck:'neck', trend:'trend', tgt:'tgt' };
  const GROUPS = [
    ['all','All Patterns','#2A8FE3'],
    ['reversal','Reversal','#FF5C5C'],
    ['continuation','Continuation','#22D67A'],
    ['bilateral','Bilateral','#2A8FE3'],
    ['harmonic','Harmonic','#8AA4BF'],
    ['advanced','Advanced','#E4E8EE']
  ];

  // Mirror a bullish pattern into its bearish twin (or vice versa)
  function mir(base, o){
    const rl = o.relabel || {};
    const r  = t => (rl[t] !== undefined ? rl[t] : t);
    const m  = Object.assign({}, base, {
      path:   base.path.map(([x,y]) => [x, H - y]),
      alt:    base.alt ? base.alt.map(([x,y]) => [x, H - y]) : null,
      lines:  (base.lines || []).map(l => Object.assign({}, l, {
                p:  [l.p[0], H - l.p[1], l.p[2], H - l.p[3]],
                c:  SWAP[l.c],
                l:  l.l ? r(l.l) : l.l,
                at: l.at ? [l.at[0], H - l.at[1] + 7, l.at[2]] : null
              })),
      labels: (base.labels || []).map(([x,y,t]) => [x, H - y + 7, r(t)]),
      auto:   base.auto ? base.auto.map(r) : null,
      bias:   SWAP[base.bias],
      brkColor: base.brkColor ? SWAP[base.brkColor] : null
    });
    delete o.relabel;
    return Object.assign(m, o);
  }

  // Harmonic helper — returns bullish + bearish versions
  function harm(id, name, rel, ratio, desc, pts, auto, tri, slNote){
    const bull = {
      id:id+'-bull', name:'Bullish '+name, icon:'🦋', g:'harmonic', bias:'bull', rel:rel,
      desc: desc + ` <strong>Fib rules:</strong> ${ratio}.`,
      trade:`Buy inside the PRZ at D once a bullish candle closes. ${slNote} TP1 = 0.382 of AD, TP2 = 0.618 of AD.`,
      tip:`Fib ratios must sit inside the stated ranges — "close enough" is not a harmonic. Use the Fibonacci tool on every leg.`,
      path: pts, b: pts.length - 2, auto: auto,
      lines: tri ? [
        {p:[pts[0][0],pts[0][1],pts[2][0],pts[2][1]],c:'trend'},
        {p:[pts[2][0],pts[2][1],pts[4][0],pts[4][1]],c:'trend'},
        {p:[pts[1][0],pts[1][1],pts[3][0],pts[3][1]],c:'trend'}
      ] : []
    };
    const bear = mir(bull, {
      id:id+'-bear', name:'Bearish '+name,
      trade:`Sell inside the PRZ at D once a bearish candle closes. ${slNote} TP1 = 0.382 of AD, TP2 = 0.618 of AD.`
    });
    return [bull, bear];
  }

  function arrow(a, b, col){
    const ang = Math.atan2(b[1]-a[1], b[0]-a[0]), L = 8, w = 4.5;
    const c = Math.cos(ang), s = Math.sin(ang);
    const p2 = [b[0] - L*c + w*s, b[1] - L*s - w*c];
    const p3 = [b[0] - L*c - w*s, b[1] - L*s + w*c];
    return `<polygon points="${b[0]},${b[1]} ${p2[0].toFixed(1)},${p2[1].toFixed(1)} ${p3[0].toFixed(1)},${p3[1].toFixed(1)}" fill="${col}"/>`;
  }
  const pts = arr => arr.map(p => p.join(',')).join(' ');

  function svg(p){
    const col = COL[p.brkColor || p.bias] || COL.both;
    let s = `<svg width="100%" viewBox="0 0 ${W} ${H}" style="max-width:320px;display:block;" xmlns="http://www.w3.org/2000/svg">`;
    // Reference lines
    (p.lines || []).forEach(l => {
      const lc = COL[l.c] || COL.trend;
      s += `<line x1="${l.p[0]}" y1="${l.p[1]}" x2="${l.p[2]}" y2="${l.p[3]}" stroke="${lc}" stroke-width="1.2" stroke-dasharray="${l.c==='tgt'?'2,3':'5,3'}" opacity="0.7"/>`;
      if(l.l){
        const at = l.at || [l.p[0]+2, l.p[1]-4, 'start'];
        s += `<text x="${at[0]}" y="${at[1]}" text-anchor="${at[2]||'start'}" font-family="monospace" font-size="7" font-weight="bold" fill="${lc}" opacity="0.9">${l.l}</text>`;
      }
    });
    // Price path — structure in white, breakout / trade leg in bias colour
    const b = (p.b === undefined || p.b === null) ? -1 : p.b;
    const pre  = b >= 0 ? p.path.slice(0, b + 1) : p.path;
    const post = b >= 0 ? p.path.slice(b) : null;
    s += `<polyline points="${pts(pre)}" fill="none" stroke="${b>=0?'rgba(255,255,255,0.62)':col}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    if(p.alt){
      s += `<polyline points="${pts(p.alt)}" fill="none" stroke="${COL.bear}" stroke-width="1.6" stroke-dasharray="4,3" opacity="0.7"/>`;
      s += arrow(p.alt[p.alt.length-2], p.alt[p.alt.length-1], COL.bear);
    }
    if(post){
      s += `<polyline points="${pts(post)}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += arrow(post[post.length-2], post[post.length-1], col);
      s += `<circle cx="${p.path[b][0]}" cy="${p.path[b][1]}" r="3.5" fill="${col}" stroke="#080808" stroke-width="1.2"/>`;
    }
    // Manual labels
    (p.labels || []).forEach(([x,y,t]) => {
      s += `<text x="${x}" y="${y}" text-anchor="middle" font-family="monospace" font-size="8" font-weight="bold" fill="rgba(255,255,255,0.82)">${t}</text>`;
    });
    // Auto labels (harmonics / waves) — above highs, below lows
    (p.auto || []).forEach((t, i) => {
      if(!t || !p.path[i]) return;
      const [x,y] = p.path[i];
      const nb = [p.path[i-1], p.path[i+1]].filter(Boolean).map(q => q[1]);
      const high = nb.every(v => y <= v);
      s += `<text x="${x}" y="${high ? y-7 : y+14}" text-anchor="middle" font-family="monospace" font-size="8.5" font-weight="bold" fill="#E4E8EE">${t}</text>`;
    });
    return s + `</svg>`;
  }

  function card(p){
    const g = GROUPS.find(x => x[0] === p.g) || GROUPS[0];
    const bc = p.bias==='bull' ? 'var(--bull)' : p.bias==='bear' ? 'var(--bear)' : 'var(--blue)';
    const bt = p.bias==='bull' ? '▲ BULLISH' : p.bias==='bear' ? '▼ BEARISH' : '◆ EITHER WAY';
    return `
      <div class="ex-card" data-cat="patterns pat-${p.g}">
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
              <div class="ex-diagram-label" style="color:${bc};">${bt} · ${p.rel} reliability</div>
            </div>
          </div>
          <div class="ex-rule"><div class="ex-rule-icon">🎯</div><div class="ex-rule-text"><strong>How to trade it:</strong> ${p.trade}</div></div>
          ${p.tip ? `<div class="ex-rule"><div class="ex-rule-icon">💡</div><div class="ex-rule-text">${p.tip}</div></div>` : ''}
        </div>
      </div>`;
  }

  // ─── REVERSAL ───────────────────────────────────────
  const hs = { id:'hs', name:'Head & Shoulders', icon:'👤', g:'reversal', bias:'bear', rel:'High',
    desc:`Three peaks after an uptrend — a <strong>left shoulder</strong>, a higher <strong>head</strong> and a lower <strong>right shoulder</strong> — sitting on one <strong>neckline</strong>. The weak right shoulder shows buyers are exhausted. Only confirmed when a candle <em class="r">closes below the neckline</em>.`,
    trade:`Sell the candle close below the neckline, or the retest of it from below. SL above the right shoulder. Target = head-to-neckline height projected down from the break.`,
    tip:`A sloping neckline still counts. If price closes back above the right shoulder, the pattern has failed — exit.`,
    path:[[10,120],[45,62],[75,85],[115,40],[150,85],[185,62],[212,85],[245,128]], b:6,
    lines:[{p:[55,85,235,85],c:'neck',l:'NECKLINE',at:[112,97,'middle']},{p:[150,130,250,130],c:'tgt',l:'TARGET',at:[150,141,'start']}],
    labels:[[45,54,'LS'],[115,32,'HEAD'],[185,54,'RS']] };
  const ihs = mir(hs, { id:'ihs', name:'Inverse Head & Shoulders', icon:'🙃', rel:'High',
    desc:`The bullish mirror of Head & Shoulders — three troughs after a downtrend with the <strong>head</strong> as the lowest low. Sellers fail to make a new low on the right shoulder. Confirmed when a candle <em class="b">closes above the neckline</em>.`,
    trade:`Buy the candle close above the neckline, or the retest of it from above. SL below the right shoulder. Target = head-to-neckline height projected up.`,
    tip:`Volume (or momentum candles) on the neckline break adds a lot of conviction. A weak, wicky break is often a fake-out.` });

  const dt = { id:'dt', name:'Double Top', icon:'⛰️', g:'reversal', bias:'bear', rel:'High',
    desc:`Price hits the same resistance twice and fails both times, forming an <strong>"M"</strong>. The low between the two tops is the <strong>neckline</strong>. Confirmed when price <em class="r">closes below the neckline</em>.`,
    trade:`Sell the close below the neckline or its retest. SL above the second top. Target = top-to-neckline height projected down.`,
    tip:`The second top often wicks slightly above the first — a liquidity grab. That makes the pattern stronger, not weaker.`,
    path:[[10,125],[60,42],[100,85],[145,42],[185,85],[240,128]], b:4,
    lines:[{p:[70,85,235,85],c:'neck',l:'NECKLINE',at:[100,97,'middle']},{p:[140,128,250,128],c:'tgt',l:'TARGET',at:[140,140,'start']}],
    labels:[[60,34,'TOP 1'],[145,34,'TOP 2']] };
  const db = mir(dt, { id:'db', name:'Double Bottom', icon:'🏞️', rel:'High', relabel:{'TOP 1':'LOW 1','TOP 2':'LOW 2'},
    desc:`Price tests the same support twice and holds, forming a <strong>"W"</strong>. The high between the two lows is the <strong>neckline</strong>. Confirmed when price <em class="b">closes above the neckline</em>.`,
    trade:`Buy the close above the neckline or its retest. SL below the second low. Target = low-to-neckline height projected up.`,
    tip:`Best when the second low forms at a higher-timeframe level or the 200 MA.` });

  const tt = { id:'tt', name:'Triple Top', icon:'🏔️', g:'reversal', bias:'bear', rel:'High',
    desc:`Three failed attempts at the same resistance. Each rejection drains buyers further. Confirmed when price <em class="r">closes below the support line</em> joining the two lows.`,
    trade:`Sell the close below the neckline. SL above the highest top. Target = pattern height projected down.`,
    tip:`Rarer than a double top but more reliable — three rejections is a very clear message from sellers.`,
    path:[[10,125],[45,45],[75,85],[110,45],[140,85],[175,45],[205,85],[245,128]], b:6,
    lines:[{p:[30,85,240,85],c:'neck',l:'NECKLINE',at:[92,97,'middle']},{p:[150,128,250,128],c:'tgt',l:'TARGET',at:[150,140,'start']}],
    labels:[[45,37,'1'],[110,37,'2'],[175,37,'3']] };
  const tb = mir(tt, { id:'tb', name:'Triple Bottom', icon:'🪨', rel:'High',
    desc:`Three failed attempts to break the same support. Sellers are clearly exhausted. Confirmed when price <em class="b">closes above the resistance line</em> joining the two highs.`,
    trade:`Buy the close above the neckline. SL below the lowest bottom. Target = pattern height projected up.`,
    tip:`Do not buy the third bottom itself — wait for the neckline break. Plenty of "triple bottoms" become a breakdown on the fourth test.` });

  const rb = { id:'rb', name:'Rounding Bottom (Saucer)', icon:'🥣', g:'reversal', bias:'bull', rel:'Medium',
    desc:`A slow, curved shift from selling to buying. No sharp lows — just a gradual <strong>"U"</strong> as sellers fade and buyers take over. Confirmed on a <em class="b">close above the rim</em>.`,
    trade:`Buy the close above the rim. SL below the most recent swing low on the right side. Target = depth of the saucer projected up.`,
    tip:`Most common on Daily and Weekly charts. On low timeframes it is usually just noise.`,
    path:[[10,40],[30,62],[55,88],[90,108],[125,114],[160,108],[190,88],[210,64],[222,40],[250,14]], b:8,
    lines:[{p:[10,40,235,40],c:'neck',l:'RIM',at:[12,36,'start']}],
    labels:[[125,132,'SAUCER']] };
  const rt = mir(rb, { id:'rt', name:'Rounding Top (Dome)', icon:'🌙', rel:'Medium', relabel:{SAUCER:'DOME'},
    desc:`A slow, curved shift from buying to selling — an upside-down <strong>"U"</strong>. Momentum fades gradually rather than reversing in one candle. Confirmed on a <em class="r">close below the base</em>.`,
    trade:`Sell the close below the base. SL above the most recent swing high on the right side. Target = height of the dome projected down.`,
    tip:`Often appears at the end of long, tired trends on the Weekly chart.` });

  const rw = { id:'rw', name:'Rising Wedge', icon:'📐', g:'reversal', bias:'bear', rel:'High',
    desc:`Price climbs inside two <strong>rising, converging</strong> trendlines. Each new high is weaker than the last — buyers are running out of steam. Confirmed on a <em class="r">close below the lower line</em>.`,
    trade:`Sell the close below the lower trendline or its retest. SL above the last swing high inside the wedge. Target = start of the wedge.`,
    tip:`In an uptrend it is a reversal. Inside a downtrend (as a pullback) it is a bearish continuation — same trade either way.`,
    path:[[20,123],[50,77],[75,102],[110,60],[135,77],[165,45],[190,54],[235,115]], b:6,
    lines:[{p:[20,85,200,35],c:'res'},{p:[20,125,200,50],c:'sup'}] };
  const fw = mir(rw, { id:'fw', name:'Falling Wedge', icon:'📐', rel:'High',
    desc:`Price falls inside two <strong>falling, converging</strong> trendlines. Each new low is shallower — sellers are losing control. Confirmed on a <em class="b">close above the upper line</em>.`,
    trade:`Buy the close above the upper trendline or its retest. SL below the last swing low inside the wedge. Target = start of the wedge.`,
    tip:`One of the most reliable bullish patterns. As a pullback inside an uptrend it is a bullish continuation.` });

  const diat = { id:'diat', name:'Diamond Top', icon:'💎', g:'reversal', bias:'bear', rel:'Medium',
    desc:`Price first <strong>broadens</strong> (higher highs, lower lows) then <strong>contracts</strong>, drawing a diamond. Shows volatile indecision at the top of a trend. Confirmed on a <em class="r">close below the lower-right edge</em>.`,
    trade:`Sell the close below the lower-right boundary. SL above the last swing high inside the diamond. Target = diamond height projected down.`,
    tip:`Rare and easy to over-spot. If you have to squint to see the diamond, it is not one.`,
    path:[[10,110],[40,80],[60,95],[90,45],[115,105],[145,40],[170,95],[190,62],[205,82],[245,130]], b:8,
    lines:[{p:[25,85,120,30],c:'neck'},{p:[120,30,215,80],c:'neck'},{p:[215,80,120,118],c:'neck'},{p:[120,118,25,85],c:'neck'}] };
  const diab = mir(diat, { id:'diab', name:'Diamond Bottom', icon:'💎', rel:'Medium',
    desc:`A broadening-then-contracting pattern at the bottom of a downtrend. Confirmed on a <em class="b">close above the upper-right edge</em>.`,
    trade:`Buy the close above the upper-right boundary. SL below the last swing low inside the diamond. Target = diamond height projected up.`,
    tip:`Often forms after a panic sell-off as the market searches for a floor.` });

  const vb = { id:'vb', name:'V-Bottom (Spike Reversal)', icon:'✔️', g:'reversal', bias:'bull', rel:'Medium',
    desc:`A sharp sell-off that reverses just as sharply — no base, no warning. Usually driven by news or a liquidity flush. The <strong>capitulation candle</strong> is the turning point.`,
    trade:`Do not try to catch the low. Buy the first pullback that holds above the 50 MA or a broken resistance after the reversal. SL below the pullback low.`,
    tip:`V-reversals are hard to trade in real time. Recognising one helps you avoid shorting into it.`,
    path:[[10,20],[50,50],[80,70],[100,92],[125,132],[150,90],[180,62],[210,40],[245,18]], b:4,
    labels:[[125,146,'CAPITULATION']] };
  const vt = mir(vb, { id:'vt', name:'V-Top (Spike Reversal)', icon:'❗', rel:'Medium', relabel:{CAPITULATION:'BLOW-OFF'},
    desc:`A sharp rally that collapses just as sharply. The <strong>blow-off candle</strong> traps late buyers at the top.`,
    trade:`Sell the first pullback that fails below the 50 MA or a broken support. SL above the pullback high.`,
    tip:`Common on Gold and indices around news spikes.` });

  const bump = { id:'bump', name:'Bump & Run Reversal', icon:'🎢', g:'reversal', bias:'bear', rel:'Medium',
    desc:`A gentle <strong>lead-in</strong> trend, then a steep speculative <strong>bump</strong> far above the trendline, then a collapse back through it — the <strong>run</strong>. Confirmed on a <em class="r">close below the trendline</em>.`,
    trade:`Sell the close below the lead-in trendline. SL above the last lower high. Target = start of the bump, often lower.`,
    tip:`The steeper and more parabolic the bump, the harder the run usually is.`,
    path:[[10,128],[50,118],[80,110],[110,70],[135,40],[160,70],[186,99],[240,140]], b:6,
    lines:[{p:[10,130,240,92],c:'trend',l:'TRENDLINE',at:[238,86,'end']}],
    labels:[[50,107,'LEAD-IN'],[135,32,'BUMP']] };

  // ─── CONTINUATION ───────────────────────────────────
  const at = { id:'at', name:'Ascending Triangle', icon:'🔺', g:'continuation', bias:'bull', rel:'High',
    desc:`A <strong>flat resistance</strong> on top and <strong>rising lows</strong> underneath. Buyers keep stepping in higher while sellers defend one price — eventually sellers run out. Confirmed on a <em class="b">close above resistance</em>.`,
    trade:`Buy the close above the flat resistance or its retest as support. SL below the last higher low. Target = triangle height projected up.`,
    tip:`The more times resistance is tested, the weaker it gets.`,
    path:[[20,122],[55,40],[80,102],[115,40],[140,76],[170,40],[188,58],[205,40],[245,12]], b:7,
    lines:[{p:[30,40,215,40],c:'res',l:'FLAT RESISTANCE',at:[60,32,'start']},{p:[30,125,200,48],c:'sup',l:'HIGHER LOWS',at:[150,92,'start']}] };
  const dtri = mir(at, { id:'dtri', name:'Descending Triangle', icon:'🔻', rel:'High', relabel:{'FLAT RESISTANCE':'FLAT SUPPORT','HIGHER LOWS':'LOWER HIGHS'},
    desc:`A <strong>flat support</strong> underneath and <strong>falling highs</strong> on top. Sellers keep pushing lower highs into a floor until it breaks. Confirmed on a <em class="r">close below support</em>.`,
    trade:`Sell the close below the flat support or its retest as resistance. SL above the last lower high. Target = triangle height projected down.`,
    tip:`Strongest when it forms in an existing downtrend.` });

  const flag = { id:'flag', name:'Bull Flag', icon:'🚩', g:'continuation', bias:'bull', rel:'High',
    desc:`A strong impulse up — the <strong>pole</strong> — followed by a tight, slightly downward-sloping channel — the <strong>flag</strong>. The market pauses to catch its breath. Confirmed on a <em class="b">close above the flag</em>.`,
    trade:`Buy the close above the upper flag line. SL below the flag low. Target = pole height projected from the breakout.`,
    tip:`A good flag retraces less than 50% of the pole. A deep flag is a warning sign.`,
    path:[[15,135],[60,35],[75,60],[90,42],[105,67],[120,50],[170,8]], b:5,
    lines:[{p:[60,33,130,53],c:'res'},{p:[65,58,130,74],c:'sup'}],
    labels:[[26,92,'POLE'],[100,88,'FLAG']] };
  const bflag = mir(flag, { id:'bflag', name:'Bear Flag', icon:'🏴', rel:'High',
    desc:`A strong impulse down followed by a tight, slightly upward-sloping channel. Sellers are reloading. Confirmed on a <em class="r">close below the flag</em>.`,
    trade:`Sell the close below the lower flag line. SL above the flag high. Target = pole height projected down from the breakout.`,
    tip:`Very common on Gold during the NY session after a red-folder news drop.` });

  const pen = { id:'pen', name:'Bull Pennant', icon:'🎌', g:'continuation', bias:'bull', rel:'Medium',
    desc:`Like a flag, but the pause forms a small <strong>symmetrical triangle</strong> instead of a channel. A sharp pole, a short squeeze, then continuation. Confirmed on a <em class="b">close above the pennant</em>.`,
    trade:`Buy the close above the upper pennant line. SL below the pennant low. Target = pole height projected up.`,
    tip:`Pennants should be short — if the squeeze drags on longer than the pole took to form, it is becoming a triangle.`,
    path:[[15,135],[70,38],[86,70],[100,45],[113,63],[124,53],[170,12]], b:5,
    lines:[{p:[70,38,135,56],c:'res'},{p:[70,72,135,60],c:'sup'}],
    labels:[[30,92,'POLE']] };
  const bpen = mir(pen, { id:'bpen', name:'Bear Pennant', icon:'🎌', rel:'Medium',
    desc:`A sharp drop followed by a small symmetrical squeeze, then continuation lower. Confirmed on a <em class="r">close below the pennant</em>.`,
    trade:`Sell the close below the lower pennant line. SL above the pennant high. Target = pole height projected down.`,
    tip:`Treat it exactly like a bear flag — same logic, slightly different shape.` });

  const rect = { id:'rect', name:'Bullish Rectangle', icon:'▭', g:'continuation', bias:'bull', rel:'Medium',
    desc:`In an uptrend, price pauses inside a horizontal <strong>range</strong> between clear support and resistance. Institutions accumulate before the next leg. Confirmed on a <em class="b">close above the range</em>.`,
    trade:`Buy the close above resistance or its retest. SL back inside the range, below the middle. Target = range height projected up.`,
    tip:`Advanced traders also buy support and sell resistance inside the range — but only with the trend direction in mind.`,
    path:[[10,135],[50,85],[75,45],[105,85],[135,45],[165,85],[195,45],[240,12]], b:6,
    lines:[{p:[45,45,215,45],c:'res',l:'RESISTANCE',at:[90,38,'start']},{p:[45,85,215,85],c:'sup',l:'SUPPORT',at:[120,97,'start']}] };
  const brect = mir(rect, { id:'brect', name:'Bearish Rectangle', icon:'▭', rel:'Medium',
    relabel:{RESISTANCE:'SUPPORT',SUPPORT:'RESISTANCE'},
    desc:`In a downtrend, price pauses inside a horizontal range before the next leg down. Confirmed on a <em class="r">close below the range</em>.`,
    trade:`Sell the close below support or its retest. SL back inside the range. Target = range height projected down.`,
    tip:`Fake breakouts are common — wait for a full candle close outside the range.` });

  const cup = { id:'cup', name:'Cup & Handle', icon:'☕', g:'continuation', bias:'bull', rel:'High',
    desc:`A rounded <strong>cup</strong> followed by a small pullback — the <strong>handle</strong> — just below the rim. The handle shakes out weak buyers before the breakout. Confirmed on a <em class="b">close above the rim</em>.`,
    trade:`Buy the close above the rim. SL below the handle low. Target = cup depth projected up from the rim.`,
    tip:`The handle should form in the upper third of the cup and never drop below its midpoint.`,
    path:[[15,40],[30,70],[55,100],[90,112],[125,100],[150,70],[165,42],[180,58],[195,50],[207,40],[245,10]], b:9,
    lines:[{p:[10,40,215,40],c:'neck',l:'RIM',at:[12,36,'start']}],
    labels:[[90,129,'CUP'],[182,75,'HANDLE']] };
  const icup = mir(cup, { id:'icup', name:'Inverse Cup & Handle', icon:'☕', rel:'Medium',
    desc:`An upside-down cup with a small bounce — the handle — just above the base. Confirmed on a <em class="r">close below the base</em>.`,
    trade:`Sell the close below the base. SL above the handle high. Target = cup depth projected down.`,
    tip:`Less common than the bullish version, but works the same way.` });

  const ach = { id:'ach', name:'Ascending Channel', icon:'↗️', g:'continuation', bias:'bull', rel:'High',
    desc:`Price trends up between two <strong>parallel</strong> rising lines. Every touch of the lower line is a dip-buying opportunity while the channel holds.`,
    trade:`Buy at the lower channel line with a bullish signal candle. SL below the channel. TP at the upper channel line.`,
    tip:`A close below the lower line ends the channel — stop buying dips once it breaks.`,
    path:[[20,128],[55,78],[85,109],[125,57],[160,86],[200,34],[235,63]],
    lines:[{p:[15,130,245,60],c:'sup'},{p:[15,90,245,20],c:'res'}],
    labels:[[85,125,'BUY'],[160,102,'BUY'],[235,79,'BUY']] };
  const dch = mir(ach, { id:'dch', name:'Descending Channel', icon:'↘️', rel:'High', relabel:{BUY:'SELL'},
    desc:`Price trends down between two parallel falling lines. Every touch of the upper line is a rally to sell while the channel holds.`,
    trade:`Sell at the upper channel line with a bearish signal candle. SL above the channel. TP at the lower channel line.`,
    tip:`A close above the upper line ends the channel — and is often the start of a falling-wedge-style reversal.` });

  const dcat = { id:'dcat', name:'Dead Cat Bounce', icon:'🐈‍⬛', g:'continuation', bias:'bear', rel:'Medium',
    desc:`After a heavy drop, price makes a weak, short-lived <strong>bounce</strong> that traps bottom-pickers — then the sell-off resumes.`,
    trade:`Sell when the bounce stalls at a resistance level or the 50 MA with a bearish signal candle. SL above the bounce high. Target = the prior low and beyond.`,
    tip:`The bounce usually retraces only 30–50% of the drop. A deeper bounce may be a real reversal.`,
    path:[[10,20],[60,110],[95,72],[115,80],[175,112],[245,140]], b:2,
    labels:[[95,64,'BOUNCE']] };

  // ─── BILATERAL ──────────────────────────────────────
  const sym = { id:'sym', name:'Symmetrical Triangle', icon:'🔷', g:'bilateral', bias:'both', rel:'Medium',
    desc:`<strong>Lower highs and higher lows</strong> squeeze price into a point. Neither side is winning — the breakout decides the direction. It breaks with the prior trend more often than against it.`,
    trade:`Trade the candle close outside the triangle in whichever direction it breaks. SL back inside the triangle. Target = widest part of the triangle projected from the break.`,
    tip:`The best breakouts happen two-thirds of the way to the apex. A break right at the tip is usually weak.`,
    path:[[25,125],[55,33],[90,111],[125,51],[160,94],[190,68],[245,20]], b:5,
    alt:[[193,84],[243,132]],
    lines:[{p:[25,25,205,72],c:'res'},{p:[25,128,205,82],c:'sup'}] };

  const meg = { id:'meg', name:'Broadening Formation (Megaphone)', icon:'📣', g:'bilateral', bias:'bear', rel:'Medium',
    desc:`<strong>Higher highs and lower lows</strong> inside two <strong>diverging</strong> lines. Volatility is expanding and the market is out of control — usually near a major top.`,
    trade:`Sell the 5th touch at the upper line with a bearish signal candle. SL above that swing. Target = the lower line. Breakouts are unreliable, so fade the edges instead.`,
    tip:`Reduce your position size — swings get wider every time, so stops are larger than normal.`,
    path:[[20,72],[55,54],[90,101],[130,37],[170,120],[210,20],[245,128]], b:5,
    lines:[{p:[20,62,230,15],c:'res'},{p:[20,85,230,135],c:'sup'}],
    auto:['','1','2','3','4','5'] };

  // ─── HARMONIC ───────────────────────────────────────
  const H_DESC = `A five-point XABCD structure built on Fibonacci ratios. Point D is the <strong>Potential Reversal Zone (PRZ)</strong> where price should turn.`;
  const harmonics = [].concat(
    harm('gartley','Gartley','High','B = 0.618 XA · C = 0.382–0.886 AB · D = 0.786 XA',
      H_DESC+` The Gartley is the original harmonic and the most conservative.`,
      [[15,130],[60,35],[100,94],[140,58],[200,110],[245,60]], ['X','A','B','C','D'], true, 'SL just beyond X.'),
    harm('bat','Bat','High','B = 0.382–0.50 XA · C = 0.382–0.886 AB · D = 0.886 XA',
      H_DESC+` The Bat has a shallow B and a deep D, close to X.`,
      [[15,130],[60,35],[100,78],[140,55],[200,119],[245,65]], ['X','A','B','C','D'], true, 'SL just beyond X.'),
    harm('butterfly','Butterfly','Medium','B = 0.786 XA · C = 0.382–0.886 AB · D = 1.27–1.618 XA (beyond X)',
      H_DESC+` In a Butterfly, D extends past X — it reverses from a new extreme.`,
      [[15,110],[60,35],[100,94],[140,58],[205,130],[245,80]], ['X','A','B','C','D'], true, 'SL beyond the 1.618 extension.'),
    harm('crab','Crab','Medium','B = 0.382–0.618 XA · C = 0.382–0.886 AB · D = 1.618 XA',
      H_DESC+` The Crab has the deepest D of all — a sharp 1.618 extension past X.`,
      [[15,95],[55,30],[95,62],[135,40],[205,135],[245,90]], ['X','A','B','C','D'], true, 'SL just beyond the 1.618 extension.'),
    harm('cypher','Cypher','Medium','B = 0.382–0.618 XA · C = 1.272–1.414 XA (beyond A) · D = 0.786 XC',
      H_DESC+` In a Cypher, C overshoots A, then D completes at 0.786 of the whole XC leg.`,
      [[15,125],[55,55],[90,85],[135,30],[200,104],[245,55]], ['X','A','B','C','D'], true, 'SL just beyond X.'),
    harm('shark','Shark','Medium','B = 1.13–1.618 of XA · C = 0.886–1.13 of 0X',
      `A five-point 0XABC structure. Unlike the others, B makes a new extreme beyond X and the reversal happens at <strong>C</strong>.`,
      [[15,120],[60,35],[100,85],[140,22],[200,128],[245,75]], ['0','X','A','B','C'], false, 'SL just beyond the 1.13 extension of 0X.'),
    harm('abcd','AB=CD','High','C = 0.618–0.786 AB · CD = AB in size · D = 1.272–1.618 BC',
      `The simplest harmonic — a measured move. The CD leg equals the AB leg in length (and often in time). The building block of every other harmonic.`,
      [[20,25],[80,95],[125,58],[200,130],[245,85]], ['A','B','C','D'], false, 'SL just beyond D.'),
    harm('drives','Three Drives','Medium','Drives 2 & 3 = 1.272–1.618 extensions · Corrections = 0.618–0.786',
      `Three symmetrical pushes in the same direction, each a Fibonacci extension of the last correction. Drive 3 marks exhaustion.`,
      [[10,20],[50,70],[70,52],[120,98],[140,80],[195,125],[245,70]], ['','1','','2','','3'], false, 'SL just beyond drive 3.')
  );

  // ─── ADVANCED ───────────────────────────────────────
  const qm = { id:'qm', name:'Quasimodo (QM) — Bearish', icon:'🎯', g:'advanced', bias:'bear', rel:'High',
    desc:`Price makes a <strong>higher high (HH)</strong> then breaks structure with a <strong>lower low (LL)</strong>. The old high before the HH — the <strong>QML</strong> — becomes the sell zone where trapped buyers exit.`,
    trade:`Sell limit at the QM level (the left-shoulder high). SL above the HH. Target = the LL, then beyond.`,
    tip:`A favourite smart-money entry. It combines a liquidity grab (the HH) with a break of structure (the LL).`,
    path:[[10,110],[45,55],[75,90],[110,30],[145,105],[180,58],[240,130]], b:5,
    lines:[{p:[40,55,205,55],c:'neck',l:'QML',at:[205,51,'end']}],
    labels:[[45,47,'H'],[75,103,'L'],[110,22,'HH'],[145,118,'LL']] };
  const qmb = mir(qm, { id:'qmb', name:'Quasimodo (QM) — Bullish', rel:'High', relabel:{H:'L',L:'H',HH:'LL',LL:'HH'},
    desc:`Price makes a <strong>lower low (LL)</strong> then breaks structure with a <strong>higher high (HH)</strong>. The old low before the LL — the <strong>QML</strong> — becomes the buy zone.`,
    trade:`Buy limit at the QM level (the left-shoulder low). SL below the LL. Target = the HH, then beyond.`,
    tip:`Works best when the QM level lines up with a higher-timeframe 50 or 200 MA.` });

  const wolfe = { id:'wolfe', name:'Wolfe Wave — Bullish', icon:'🐺', g:'advanced', bias:'bull', rel:'Medium',
    desc:`A five-wave structure. Wave 5 overshoots the <strong>1–3 line</strong> into the "sweet zone", then price reverses toward the <strong>1–4 line</strong>, which is the target.`,
    trade:`Buy at point 5 as price breaks back inside the 1–3 line. SL below the wave 5 low. Target = the 1–4 line.`,
    tip:`Waves 3–4 must stay inside the channel created by waves 1–2. Symmetry in time between waves adds confidence.`,
    path:[[15,85],[45,30],[80,105],[115,55],[160,128],[235,24]], b:4,
    lines:[{p:[15,85,175,134],c:'trend',l:'1–3',at:[100,123,'middle']},{p:[45,30,175,77],c:'trend',l:'2–4',at:[175,72,'end']},{p:[15,85,245,16],c:'tgt',l:'TARGET 1–4',at:[205,22,'end']}],
    auto:['1','2','3','4','5'] };
  const wolfeb = mir(wolfe, { id:'wolfeb', name:'Wolfe Wave — Bearish',
    desc:`The bearish version — wave 5 overshoots the 1–3 line to the upside, traps buyers, then reverses toward the <strong>1–4 line</strong>.`,
    trade:`Sell at point 5 as price breaks back inside the 1–3 line. SL above the wave 5 high. Target = the 1–4 line.`,
    tip:`Same rules as the bullish version, mirrored.` });

  const elliott = { id:'elliott', name:'Elliott Wave (5-3 Cycle)', icon:'🌊', g:'advanced', bias:'bull', rel:'Medium', brkColor:'bear',
    desc:`Markets trend in <strong>5 impulse waves</strong> (1–5) and correct in <strong>3 waves</strong> (A–B–C). Wave 3 is usually the longest and strongest.`,
    trade:`The highest-probability trade is joining <strong>wave 3</strong>: buy the end of wave 2 (often a 0.618 pullback of wave 1). SL below the start of wave 1. Target = 1.618 extension of wave 1.`,
    tip:`3 hard rules: wave 2 never goes below the start of wave 1 · wave 3 is never the shortest · wave 4 never overlaps wave 1's territory.`,
    path:[[10,135],[40,95],[60,112],[115,40],[140,65],[175,22],[200,62],[215,47],[245,88]], b:5,
    auto:['','1','2','3','4','5','A','B','C'] };

  const spring = { id:'spring', name:'Wyckoff Spring', icon:'🌱', g:'advanced', bias:'bull', rel:'High',
    desc:`At the end of an accumulation range, price <strong>dips below range support</strong> to trigger stop losses, then snaps straight back inside. That fake breakdown is the <strong>spring</strong> — institutions buying from panicking sellers.`,
    trade:`Buy when price closes back inside the range after the spring. SL below the spring low. Target = the range high, then a breakout beyond it.`,
    tip:`Same idea as the liquidity grab in Forex University Lesson 19 — this is its classic Wyckoff name.`,
    path:[[10,30],[40,95],[65,50],[95,93],[125,48],[150,95],[165,118],[185,92],[215,50],[245,18]], b:6,
    lines:[{p:[30,45,230,45],c:'res',l:'RANGE HIGH',at:[32,40,'start']},{p:[30,95,200,95],c:'sup',l:'RANGE LOW',at:[60,108,'start']}],
    labels:[[165,133,'SPRING']] };
  const upthrust = mir(spring, { id:'upthrust', name:'Wyckoff Upthrust (UTAD)', icon:'🪤', rel:'High',
    relabel:{SPRING:'UPTHRUST','RANGE HIGH':'RANGE LOW','RANGE LOW':'RANGE HIGH'},
    desc:`At the end of a distribution range, price <strong>spikes above range resistance</strong> to trap breakout buyers, then falls straight back inside — institutions selling into them.`,
    trade:`Sell when price closes back inside the range after the upthrust. SL above the upthrust high. Target = the range low, then a breakdown beyond it.`,
    tip:`If you have ever bought a "breakout" that instantly reversed, you were caught in an upthrust.` });

  // ─── ASSEMBLE & RENDER ──────────────────────────────
  const PATTERNS = [
    hs, ihs, dt, db, tt, tb, rb, rt, rw, fw, diat, diab, vb, vt, bump,
    at, dtri, flag, bflag, pen, bpen, rect, brect, cup, icup, ach, dch, dcat,
    sym, meg
  ].concat(harmonics, [qm, qmb, wolfe, wolfeb, elliott, spring, upthrust]);

  const grid = document.getElementById('examples-grid');
  if(grid) grid.insertAdjacentHTML('beforeend', PATTERNS.map(card).join(''));
  document.querySelectorAll('.ex-card[data-cat~="patterns"]').forEach(c => c.style.display = 'none');

  const sub = document.getElementById('pattern-subfilter');
  if(sub){
    sub.innerHTML = `<span class="pattern-subfilter-label">${PATTERNS.length} Patterns</span>` +
      GROUPS.map(([k,label],i) => {
        const n = k==='all' ? PATTERNS.length : PATTERNS.filter(p => p.g===k).length;
        return `<button class="pat-filter${i===0?' on':''}" onclick="filterPatterns('${k}',this)">${label}<span>${n}</span></button>`;
      }).join('');
  }
})();

function filterPatterns(group, btn){
  document.querySelectorAll('.pat-filter').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  document.querySelectorAll('.ex-card').forEach(card => {
    const cats = (card.dataset.cat || '').split(' ');
    card.style.display = cats.includes('patterns') && (group==='all' || cats.includes('pat-'+group)) ? 'block' : 'none';
  });
}
