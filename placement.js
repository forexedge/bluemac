// ══════════════════════════════════════════════════════
// BLUE MAC — PLACEMENT TEST (shown once after registration)
// Part 1: experience (sets the maximum level + style suggestion)
// Part 2: adaptive knowledge check (2 questions per level)
// Result: places the student at the right University level.
// ══════════════════════════════════════════════════════
window.BMP = (function(){
  const MAX_START = 6;               // Level 7 (Self-Mastery) can never be skipped
  const EXP = [
    { q:'Have you ever placed a real forex trade?', o:[
      ['🌱','Never','I have never opened a trade of any kind',0], ['🧪','Demo only','I have practised with demo money',1], ['💵','Yes, with real money','I have live trading experience',2] ] },
    { q:'How long have you been learning or trading?', o:[
      ['📅','Just starting','Less than 1 month',0], ['📆','A few months','1 to 6 months',1], ['🗓️','A while','6 months to 2 years',2], ['🏆','Years','More than 2 years',3] ] },
    { q:'How do you decide when to enter a trade?', o:[
      ['❓','I don\'t know yet','I haven\'t got that far',0], ['🎲','Gut feel or signals','Tips, groups or instinct',0], ['📐','Basic rules','Support/resistance, indicators, patterns',1], ['📋','A tested strategy','Written rules I have backtested',2] ] },
    { q:'How do you manage risk on each trade?', o:[
      ['❓','Not sure yet','I don\'t know what that means',0], ['⚠️','Sometimes a stop loss','Depends on the trade',1], ['🛡️','Always','Stop loss + fixed % risk on every trade',2] ] },
    { q:'How much time can you spend on the charts?', style:true, o:[
      ['☕','A few minutes a day','Check in once or twice','position'], ['🌙','1–2 hours a day','Evenings or mornings','swing'], ['☀️','A full session','London or New York','day'], ['⚡','Hours at a time','I can react fast all day','scalp'] ] }
  ];
  const STYLES = { position:['🏔️ Position','W1 / D1 · weeks per trade'], swing:['🌊 Swing','D1 / H4 · 2–5 days per trade'], day:['☀️ Day Trade','H1 / H4 · closed the same day'], scalp:['⚡ Scalp','15m / 30m · minutes per trade'] };
  // Knowledge check: passing both questions of level N means Level N is already known
  const KNOW = {
    1:[ { q:'EURUSD rises from 1.1000 to 1.1030. How many pips is that?', o:['30 pips','3 pips','300 pips','0.3 pips'], a:0 },
        { q:'Price is at 1.0900. You want to buy cheaper, at support on 1.0860. Which order do you use?', o:['Buy limit','Buy stop','Sell limit','Sell stop'], a:0 } ],
    2:[ { q:'Which sequence defines an uptrend?', o:['Higher highs and higher lows','Lower highs and lower lows','Equal highs and equal lows','Three green candles in a row'], a:0 },
        { q:'A candle at resistance has a long upper wick and closes near its low. What does it show?', o:['Sellers rejected the higher prices','Buyers are firmly in control','Nothing — wicks are noise','The market is closed'], a:0 } ],
    3:[ { q:'Which Fibonacci retracement level is known as the golden ratio?', o:['61.8%','23.6%','100%','127.2%'], a:0 },
        { q:'Price makes a lower low while RSI makes a higher low. This is…', o:['Bullish divergence','Bearish divergence','An overbought signal','A moving average cross'], a:0 } ],
    4:[ { q:'$10,000 account, 1% risk, 20-pip stop on EURUSD ($10 per pip per lot). What lot size?', o:['0.50 lots','5.00 lots','0.05 lots','1.00 lot'], a:0 },
        { q:'At a 1:3 risk-to-reward, what win rate do you need just to break even?', o:['25%','50%','33%','75%'], a:0 } ],
    5:[ { q:'Win rate 50%, average win 2R, average loss 1R. What is the expectancy per trade?', o:['+0.5R','+1R','−0.5R','0R'], a:0 },
        { q:'In top-down analysis, which timeframe gives you the entry trigger?', o:['The lowest timeframe','The highest timeframe','The middle timeframe','Any — it doesn\'t matter'], a:0 } ]
  };
  const LEVEL_NAMES = { 1:'Foundations', 2:'Reading Charts', 3:'Technical Toolkit', 4:'Risk Management', 5:'Strategy & Execution', 6:'Institutional Trading' };
  const LEVEL_COL = { 1:'#22D67A', 2:'#2A8FE3', 3:'#96D0FF', 4:'#FF5C5C', 5:'#F5B841', 6:'#8AA4BF' };

  let S = null, isOpen = false;
  const gate = () => document.getElementById('quiz-gate');
  const root = () => document.getElementById('placement-root');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);
  const shuffle = a => { a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function open(fromUni){
    if(isOpen) return;
    isOpen = true;
    S = { fromUni:!!fromUni, step:'intro', exp:[], qi:0, level:1, kq:0, kDone:0, cap:1, style:null, knowLog:[] };
    const g = gate(); if(g){ g.style.display = 'flex'; g.scrollTop = 0; }
    render();
  }
  function close(){ isOpen = false; const g = gate(); if(g) g.style.display = 'none'; }

  function frame(inner, progress){
    return `<div class="pl-wrap">
      <div class="pl-head"><div class="pl-kicker">BLUE MAC UNIVERSITY · PLACEMENT</div>${progress !== undefined ? `<div class="pl-bar"><i style="width:${progress}%"></i></div>` : ''}</div>
      ${inner}</div>`;
  }
  function render(){
    const r = root(); if(!r) return;
    if(S.step === 'intro'){
      r.innerHTML = frame(`
        <div class="pl-card pl-center">
          <div class="pl-emoji">👋</div>
          <h2>Welcome to Blue Mac</h2>
          <p>Let's find the right place for you to start learning. Answer 5 quick questions about your experience, then a short knowledge check. It takes about <b>2 minutes</b>.</p>
          <div class="pl-steps"><div><b>1</b>Your experience</div><div><b>2</b>Knowledge check</div><div><b>3</b>Your starting level</div></div>
          <button class="pl-btn primary" onclick="BMP.go('exp')">Find my starting point →</button>
          <button class="pl-link" onclick="BMP.newbie()">I'm completely new — start me at the very beginning</button>
          ${S.fromUni ? `<button class="pl-link" onclick="BMP.cancel()">Cancel</button>` : ''}
        </div>`);
      return;
    }
    if(S.step === 'exp'){
      const q = EXP[S.qi];
      r.innerHTML = frame(`
        <div class="pl-card">
          <div class="pl-qnum">PART 1 · QUESTION ${S.qi + 1} OF ${EXP.length}</div>
          <div class="pl-q">${q.q}</div>
          <div class="pl-opts">${q.o.map((o, k) => `<button class="pl-opt" onclick="BMP.exp(${k})"><span class="pl-oi">${o[0]}</span><span><b>${o[1]}</b><small>${o[2]}</small></span></button>`).join('')}</div>
          ${S.qi > 0 ? `<button class="pl-link" onclick="BMP.back()">‹ Back</button>` : ''}
        </div>`, Math.round(S.qi / (EXP.length + 4) * 100));
      return;
    }
    if(S.step === 'know'){
      const q = S.cur;
      r.innerHTML = frame(`
        <div class="pl-card">
          <div class="pl-qnum">PART 2 · KNOWLEDGE CHECK · LEVEL ${S.level} — ${LEVEL_NAMES[S.level].toUpperCase()}</div>
          <div class="pl-q">${q.q}</div>
          <div class="pl-opts">${q.o.map((o, k) => `<button class="pl-opt" onclick="BMP.know(${k})"><span class="pl-letter">${String.fromCharCode(65 + k)}</span><span><b>${esc(o.t)}</b></span></button>`).join('')}</div>
          <button class="pl-link" onclick="BMP.know(-1)">I don't know</button>
        </div>`, Math.min(95, Math.round((EXP.length + S.kDone) / (EXP.length + 2 * (S.cap - 1)) * 100)));
      return;
    }
    if(S.step === 'result'){
      const L = S.result, col = LEVEL_COL[L], st = STYLES[S.style || 'swing'];
      const placedOut = L > 1 ? `${L > 2 ? `Levels 1–${L - 1} are` : 'Level 1 is'} marked <b>placed out</b>. They stay open for review, and you can take their quizzes any time to earn full credit.` : 'You start at the very beginning, so every lesson builds on the one before it.';
      r.innerHTML = frame(`
        <div class="pl-card pl-center">
          <div class="pl-kicker" style="color:${col};">YOUR STARTING POINT</div>
          <div class="pl-level" style="--c:${col};"><span>LEVEL ${L}</span>${LEVEL_NAMES[L]}</div>
          <p>${resultLine(L)}</p>
          <div class="pl-info">${placedOut}</div>
          <div class="pl-style"><span>Suggested trading style</span><b>${st[0]}</b><small>${st[1]}</small></div>
          ${S.knowLog.length ? `<div class="pl-log">Knowledge check: ${S.knowLog.map(k => `<i class="${k.ok ? 'ok' : 'no'}">L${k.level}</i>`).join('')}</div>` : ''}
          <button class="pl-btn primary" onclick="BMP.finish(${L})">Start learning at Level ${L} →</button>
          ${L > 1 ? `<button class="pl-link" onclick="BMP.finish(1)">I'd rather start from the very beginning</button>` : ''}
        </div>`, 100);
    }
  }
  function resultLine(L){
    return ({
      1:'Every great trader starts here. You\'ll build a rock-solid foundation: how the market works, pips, lots, leverage and placing your first trade safely.',
      2:'You know the basics. Next you\'ll learn to read charts properly: candlesticks, timeframes, market structure and key levels.',
      3:'You can read a chart. Now you\'ll master the tools: the Blue Mac moving average system, Fibonacci, indicators and chart patterns.',
      4:'You know the tools. This is the level that decides whether traders survive: position sizing, risk-to-reward and managing open trades.',
      5:'Your foundations and risk are solid. Now you\'ll turn it all into a tested strategy: top-down analysis, a written plan, journaling and backtesting.',
      6:'You\'re an experienced trader. You\'ll go deep into institutional trading: liquidity, order blocks, fair value gaps and the tools banks use.'
    })[L];
  }

  // ── Actions ──
  function go(step){ S.step = step; S.qi = 0; render(); }
  function back(){ if(S.qi > 0){ S.qi--; S.exp.pop(); render(); } }
  function exp(k){
    const q = EXP[S.qi], o = q.o[k];
    if(q.style) S.style = o[3]; else S.exp.push(o[3]);
    if(S.qi < EXP.length - 1){ S.qi++; return render(); }
    // experience score → maximum level the knowledge check can place you at
    const [live, time, method, risk] = S.exp;
    const score = live * 2 + time + method * 2 + risk * 2;            // 0–15
    S.cap = score <= 3 ? 1 : score <= 7 ? 3 : score <= 11 ? 5 : MAX_START;
    if(S.cap === 1) return showResult(1);
    S.level = 1; S.kq = 0; nextKnow();
  }
  function nextKnow(){
    const q = KNOW[S.level][S.kq];
    S.cur = { q:q.q, o:shuffle(q.o.map((t, i) => ({ t, ok:i === q.a }))) };
    S.step = 'know'; render();
  }
  function know(k){
    const ok = k >= 0 && S.cur.o[k].ok;
    S.kDone++;
    if(!ok){ S.knowLog.push({ level:S.level, ok:false }); return showResult(S.level); }   // first miss → start at this level
    if(S.kq === 0){ S.kq = 1; return nextKnow(); }
    S.knowLog.push({ level:S.level, ok:true });
    if(S.level + 1 >= S.cap) return showResult(S.cap);                  // passed everything up to the cap
    S.level++; S.kq = 0; nextKnow();
  }
  function showResult(L){ S.result = Math.max(1, Math.min(L, MAX_START)); S.step = 'result'; render(); }
  function newbie(){ S.style = 'swing'; showResult(1); }
  function cancel(){ close(); if(window.BMU) BMU.home(); }

  async function finish(L){
    const label = L <= 1 ? 'beginner' : L <= 3 ? 'intermediate' : L <= 5 ? 'advanced' : 'institutional';
    if(window.BMU) BMU.applyPlacement(L);
    try { localStorage.setItem('tv_quiz_done', '1'); localStorage.setItem('bm_style_suggestion', S.style || 'swing'); } catch(e){}
    try {
      if(typeof _supabase !== 'undefined'){
        const { data:{ session } } = await _supabase.auth.getSession();
        if(session) await _supabase.auth.updateUser({ data:{ tv_experience_level:label, tv_placement_level:L, tv_style_suggestion:S.style || 'swing' } });
      }
    } catch(e){ console.log('Placement save error:', e); }
    const fromUni = S.fromUni;
    close();
    const nav = document.querySelector('.nav-item[onclick*="education"]');
    if(typeof goPage === 'function') goPage('education', nav || document.createElement('b'));
    if(!fromUni && typeof showDisclaimerIfNeeded === 'function') showDisclaimerIfNeeded();
  }

  // ── Styles ──
  const css = `
  #quiz-gate #placement-root{width:100%;max-width:620px;margin:auto;}
  .pl-wrap{width:100%;}
  .pl-head{margin-bottom:16px;}
  .pl-kicker{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.18em;color:#2A8FE3;font-weight:600;margin-bottom:10px;}
  .pl-bar{height:5px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden;}
  .pl-bar i{display:block;height:100%;background:linear-gradient(90deg,#2A8FE3,#96D0FF);transition:width .4s;}
  .pl-card{padding:28px;border-radius:20px;background:#0f0f11;border:1px solid rgba(255,255,255,.09);}
  .pl-center{text-align:center;}
  .pl-emoji{font-size:44px;margin-bottom:6px;}
  .pl-card h2{font-family:'Outfit',sans-serif;font-size:26px;font-weight:800;color:#fff;margin:0 0 10px;}
  .pl-card p{color:#A2A2A8;font-size:14.5px;line-height:1.65;margin:0 auto 18px;max-width:480px;}
  .pl-steps{display:flex;gap:8px;justify-content:center;margin:0 0 22px;flex-wrap:wrap;}
  .pl-steps div{font-size:12px;color:#C8CDD3;padding:8px 12px;border-radius:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);}
  .pl-steps b{display:inline-grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#2A8FE3;color:#06121f;font-size:10px;margin-right:6px;}
  .pl-btn{width:100%;padding:15px 18px;border-radius:12px;border:0;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:800;font-size:15px;}
  .pl-btn.primary{background:linear-gradient(135deg,#2A8FE3,#96D0FF);color:#06121f;box-shadow:0 8px 30px rgba(42,143,227,.3);}
  .pl-link{display:block;margin:14px auto 0;background:none;border:0;color:#8AA4BF;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;text-decoration:underline;text-underline-offset:3px;}
  .pl-qnum{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;color:#2A8FE3;margin-bottom:10px;}
  .pl-q{font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;color:#fff;line-height:1.4;margin-bottom:16px;}
  .pl-opts{display:flex;flex-direction:column;gap:8px;}
  .pl-opt{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:13px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.02);cursor:pointer;text-align:left;color:#fff;font-family:'DM Sans',sans-serif;transition:all .15s;min-height:56px;}
  .pl-opt:hover{border-color:rgba(42,143,227,.7);background:rgba(42,143,227,.07);}
  .pl-opt b{display:block;font-size:14.5px;}.pl-opt small{display:block;font-size:12px;color:#8A8F96;margin-top:2px;}
  .pl-oi{font-size:22px;width:28px;text-align:center;flex-shrink:0;}
  .pl-letter{width:26px;height:26px;flex-shrink:0;border-radius:7px;display:grid;place-items:center;font-family:'DM Mono',monospace;font-size:11px;background:rgba(255,255,255,.07);}
  .pl-level{--c:#2A8FE3;display:inline-flex;flex-direction:column;align-items:center;gap:2px;padding:14px 26px;border-radius:16px;border:1px solid var(--c);background:rgba(255,255,255,.03);font-family:'Outfit',sans-serif;font-size:24px;font-weight:800;color:#fff;margin:4px 0 14px;}
  .pl-level span{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.15em;color:var(--c);}
  .pl-info{font-size:13px;color:#B8C4D0;line-height:1.6;padding:12px 14px;border-radius:12px;background:rgba(42,143,227,.07);border:1px solid rgba(42,143,227,.2);margin-bottom:12px;text-align:left;}
  .pl-style{display:flex;flex-direction:column;gap:2px;padding:12px;border-radius:12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.08);margin-bottom:12px;}
  .pl-style span{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:#777;}
  .pl-style b{font-size:16px;color:#fff;}.pl-style small{font-size:12px;color:#8A8F96;}
  .pl-log{font-family:'DM Mono',monospace;font-size:10.5px;color:#777;margin-bottom:16px;}
  .pl-log i{font-style:normal;display:inline-block;margin-left:6px;padding:2px 7px;border-radius:6px;}
  .pl-log i.ok{background:rgba(34,214,122,.15);color:#22D67A;}.pl-log i.no{background:rgba(255,92,92,.15);color:#FF5C5C;}
  @media(max-width:600px){.pl-card{padding:20px 16px;}.pl-q{font-size:17px;}.pl-card h2{font-size:22px;}}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  return { open, close, go, back, exp, know, newbie, cancel, finish, _s:() => S };
})();
