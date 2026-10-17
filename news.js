// ══════════════════════════════════════════════════════
// BLUE MAC — NEWS READY TRACK (window.BMN)            17 Oct 2026
// Fundamentals for SA traders: the big news events, what they usually do to
// Gold / USD / ZAR, and Blue Mac's news rules. 8 short lessons, 2 check
// questions each, a 10-question final exam (80% to pass) → "News Ready" certificate.
// Separate from the 7-level degree, so nobody's degree progress changes.
//
// Release times are computed LIVE in SAST from each city's local time (daylight
// saving in New York / London / Frankfurt handled by Intl) — never hard-coded.
//
//   BMN.open() · BMN.lesson(i) · BMN.exam() · BMN.cert() · BMN.close() · BMN.paint()
//   BMN.status()    { read:{id:iso}, checks:{id:[bool,bool]}, exam:{best, passed, at, tries} }
//
// Stored in localStorage['bm_news_v1'] — synced per member by profile.js.
// Uses the panel + card styles from builder.js (bmd-*) and practice.js (bmpr-*).
// ══════════════════════════════════════════════════════
window.BMN = (function(){
  if(!window.BMX) return null;
  const KEY = 'bm_news_v1', PASS = 0.8, EXAM_N = 10;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  // ── Live SAST times ──
  function tzOffsetMin(tz, d){
    const p = new Intl.DateTimeFormat('en-US', { timeZone:tz, hourCycle:'h23', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }).formatToParts(d);
    const g = k => +p.find(x => x.type === k).value;
    return (Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute')) - Math.floor(d.getTime() / 60000) * 60000) / 60000;
  }
  // a local clock time in a city → "HH:MM" in SAST (UTC+2, no daylight saving), for today's date
  function sast(tz, h, m){
    const d = new Date(), x = ((h * 60 + m) - tzOffsetMin(tz, d) + 120 + 1440) % 1440;
    return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
  }
  const NY = (h, m) => `<b>${sast('America/New_York', h, m)} SAST</b>`;
  const T = () => ({   // computed when a lesson is drawn, so it is always today's time
    us830: NY(8, 30), us1000: NY(10, 0), fomc: NY(14, 0), fomcPc: NY(14, 30),
    ecb: `<b>${sast('Europe/Berlin', 14, 15)} SAST</b>`, ecbPc: `<b>${sast('Europe/Berlin', 14, 45)} SAST</b>`, boe: `<b>${sast('Europe/London', 12, 0)} SAST</b>`,
    tokyoNoon: `<b>${sast('Asia/Tokyo', 12, 0)} SAST</b>`
  });
  const DST_NOTE = '<small class="bmn-dst">⏰ Times shown for <b>today</b>, worked out live. They move by an hour when New York, London or Europe change their clocks — South Africa never does.</small>';
  const row = (k, v) => `<div class="bmpr-scene-r"><span>${k}</span><b>${v}</b></div>`;
  const box = (h, rows) => `<div class="bmpr-scene"><div class="bmpr-scene-h">${h}</div>${rows}</div>`;
  const react = (rows) => `<div class="bmn-react">${rows.map(([w, gold, usd, extra]) => `<div class="bmn-rx"><span>${w}</span><i class="${gold}">Gold ${gold === 'up' ? '↑' : '↓'}</i><i class="${usd}">USD ${usd === 'up' ? '↑' : '↓'}</i>${extra ? `<em>${extra}</em>` : ''}</div>`).join('')}
    <small>"Usually" — the first reaction. The first spike often reverses.</small></div>`;

  // ── The lessons ──
  const LESSONS = [
    { id:'n1', icon:'📰', title:'How news moves price', tag:'Start here',
      body: t => `<p>Every big number has three parts on the calendar: <b>Previous</b> (last time), <b>Forecast</b> (what the market expects) and <b>Actual</b> (the real number).</p>
        <p>Price already "knows" the forecast. It moves on the <b>surprise</b> — the gap between actual and forecast. A strong number that matches the forecast can do almost nothing; a small miss can move price hard.</p>
        ${box('📅 Calendar colours', row('🔴 Red', 'high impact — can move price tens of dollars on Gold') + row('🟠 Orange', 'medium — can move it, rarely violently') + row('🟡 Yellow', 'low — usually ignored'))}
        <p>Right on a red release: <b>spreads widen</b>, orders can <b>slip</b> (filled far from your price) and the first spike often <b>reverses</b>. That is why Blue Mac has news rules:</p>
        ${box('🛡 Blue Mac news rules', row('Day Trade', '1 hour before → 30 min after') + row('Scalp · Blue Mac Key · your own', '30 min before → 30 min after') + row('Swing', 'wait if a major event is within 48 h') + row('Position', 'built on the big macro picture'))}
        <p>Set your calendar (ForexFactory or Investing.com) to <b>Johannesburg</b> time and check it every day — your Daily Pre-Flight does this.</p>`,
      q:[{ q:'CPI forecast 0.3%, actual 0.3%. What usually happens?', o:['A big move — CPI is red news', 'Often not much — there was no surprise', 'Gold always rises', 'The market closes'], a:1, why:'Price moves on the surprise. A number that matches the forecast is already priced in.' },
         { q:'Which Blue Mac style waits 1 hour before red news?', o:['Day Trade', 'Scalp', 'Blue Mac Key', 'All of them'], a:0, why:'Day trades: 1 hour before to 30 minutes after. Scalp, Key and your own strategies use 30 minutes either side.' }] },

    { id:'n2', icon:'👷', title:'NFP — the US jobs report', tag:'USD · Gold',
      body: t => `<p><b>Non-Farm Payrolls</b> = how many jobs the US added last month. It comes with the <b>unemployment rate</b> and <b>average hourly earnings</b> (wage growth).</p>
        ${box('🗓 When', row('Day', 'usually the first Friday of the month') + row('Time', `08:30 New York = ${t.us830}`))}
        <p>Why it matters: a strong job market means the US economy can handle <b>higher interest rates</b> — and higher US rates make the dollar more attractive.</p>
        ${react([['Jobs stronger than forecast', 'down', 'up'], ['Jobs weaker than forecast', 'up', 'down']])}
        <p>NFP Friday is one of the wildest hours of the month. Many pros simply don't trade it. If you're in a trade, be at breakeven or out before ${t.us830}.</p>${DST_NOTE}`,
      q:[{ q:'NFP comes in much STRONGER than expected. What does Gold usually do first?', o:['Rises', 'Drops', 'Nothing', 'The market halts'], a:1, why:'Strong jobs → higher US rates expected → stronger dollar → Gold usually drops first.' },
         { q:'When is NFP usually released?', o:['Every Monday', 'The first Friday of the month', 'The last day of the month', 'Every quarter'], a:1, why:'The US jobs report usually lands on the first Friday of the month, at 08:30 New York time.' }] },

    { id:'n3', icon:'🛒', title:'CPI — inflation', tag:'USD · Gold',
      body: t => `<p><b>CPI</b> (Consumer Price Index) = how fast prices in the US are rising. Watch <b>headline</b> CPI and <b>core</b> CPI (without food and energy — the one central banks care about most).</p>
        ${box('🗓 When', row('Day', 'around the middle of the month') + row('Time', `08:30 New York = ${t.us830}`))}
        <p>Hot inflation pushes the US central bank (the Fed) to keep interest rates <b>higher for longer</b>. Higher rates → stronger dollar, and Gold (which pays no interest) becomes less attractive.</p>
        ${react([['Inflation HOTTER than forecast', 'down', 'up'], ['Inflation COOLER than forecast', 'up', 'down']])}
        <p>Its cousin <b>PCE</b> (the Fed's favourite inflation measure) comes out near the end of the month, also at 08:30 New York.</p>${DST_NOTE}`,
      q:[{ q:'Which CPI number do central banks watch most closely?', o:['Headline CPI', 'Core CPI (no food & energy)', 'Petrol prices', 'House prices'], a:1, why:'Core CPI strips out jumpy food and energy prices, so it shows the underlying trend.' },
         { q:'CPI comes in COOLER than expected. Gold usually…', o:['drops', 'rises', 'stays flat', 'closes for the day'], a:1, why:'Cooler inflation → rate cuts more likely → weaker dollar → Gold usually rises first.' }] },

    { id:'n4', icon:'🏛', title:'FOMC — the Fed\'s rate decision', tag:'USD · Gold',
      body: t => `<p>The <b>Federal Reserve</b> sets US interest rates at <b>8 scheduled meetings a year</b>. It is the most important event on the calendar.</p>
        ${box('🗓 When', row('Statement', `14:00 New York = ${t.fomc}`) + row('Press conference', `14:30 New York = ${t.fomcPc}`) + row('Dot plot', 'March, June, September and December meetings'))}
        <p><b>Hawkish</b> = worried about inflation, rates stay high or go up → dollar up, Gold usually down. <b>Dovish</b> = ready to cut → dollar down, Gold usually up.</p>
        ${react([['Hawkish surprise', 'down', 'up'], ['Dovish surprise', 'up', 'down']])}
        <p>The statement makes the first move; the <b>press conference</b> often reverses it. In South Africa this is our <b>evening</b> — day traders should already be flat.</p>${DST_NOTE}`,
      q:[{ q:'The Fed sounds HAWKISH. The dollar usually…', o:['falls', 'rises', 'is unaffected', 'freezes'], a:1, why:'Hawkish = rates stay high or rise → the dollar usually strengthens and Gold usually falls.' },
         { q:'Why do traders wait for the FOMC press conference?', o:['It is when the market opens', 'It often reverses the first move', 'Spreads are lowest then', 'It is the only time you can trade'], a:1, why:'The statement moves price first; what the Fed chair says 30 minutes later can flip that move.' }] },

    { id:'n5', icon:'🏭', title:'Growth: PMIs, GDP, retail sales & claims', tag:'USD',
      body: t => `<p>These show whether the US economy is speeding up or slowing down.</p>
        ${box('🗓 The usual schedule', row('ISM Manufacturing PMI', `first business day · 10:00 New York = ${t.us1000}`) + row('GDP (advance)', `quarterly · 08:30 New York = ${t.us830}`)
          + row('Retail sales', `mid-month · 08:30 New York`) + row('Jobless claims', `every Thursday · 08:30 New York`))}
        <p><b>PMI above 50</b> = the sector is growing; <b>below 50</b> = shrinking. A strong economy usually supports the dollar; a weak one usually hurts it.</p>
        ${react([['Growth stronger than forecast', 'down', 'up'], ['Growth weaker than forecast', 'up', 'down']])}
        <p>These are usually orange or red. Jobless claims every Thursday is a regular small mover — know it's there.</p>${DST_NOTE}`,
      q:[{ q:'A PMI reading of 47 means…', o:['the sector is growing fast', 'the sector is shrinking', 'it matched the forecast', 'nothing — PMIs don\'t matter'], a:1, why:'50 is the line: above = growing, below = shrinking.' },
         { q:'Which comes out every Thursday?', o:['NFP', 'US jobless claims', 'FOMC', 'GDP'], a:1, why:'US initial jobless claims are released every Thursday at 08:30 New York time.' }] },

    { id:'n6', icon:'🌍', title:'The other big banks: ECB, BoE, BoJ', tag:'EUR · GBP · JPY',
      body: t => `<p>Trade EUR, GBP or JPY? Their central banks move those pairs the way the Fed moves the dollar.</p>
        ${box('🗓 When', row('ECB (euro)', `decision 14:15 Frankfurt = ${t.ecb} · press conference ${t.ecbPc}`) + row('BoE (pound)', `decision 12:00 London = ${t.boe}`) + row('BoJ (yen)', `no fixed time — usually during the Tokyo morning (Tokyo noon = ${t.tokyoNoon})`))}
        <p>Same idea everywhere: a <b>hawkish</b> surprise usually strengthens that currency; a <b>dovish</b> one usually weakens it.</p>
        <p>Example: the BoE surprises with a rate cut → the pound usually falls → GBPUSD drops. So on GBPUSD you check the calendar for <b>GBP and USD</b> news — both sides of the pair.</p>${DST_NOTE}`,
      q:[{ q:'You trade EURUSD. Which two central banks matter most?', o:['ECB and the Fed', 'BoE and BoJ', 'SARB and BoJ', 'Only the Fed'], a:0, why:'EURUSD = euro vs dollar, so the ECB and the Fed.' },
         { q:'The BoE surprises with a rate CUT. GBPUSD usually…', o:['rises', 'falls', 'doesn\'t move', 'is suspended'], a:1, why:'A dovish surprise usually weakens that currency — the pound falls, so GBPUSD drops.' }] },

    { id:'n7', icon:'🇿🇦', title:'South Africa: SARB, SA CPI & the rand', tag:'ZAR',
      body: t => `<p>Trading <b>USDZAR</b> — or just thinking in rands? These matter.</p>
        ${box('🗓 When', row('SARB rate decision', '6 meetings a year · decision usually around <b>15:00 SAST</b>') + row('SA CPI (Stats SA)', 'mid-to-late month, on a weekday morning — check the calendar'))}
        <p>A <b>hawkish</b> SARB (rates up or held high) usually supports the rand. <b>USDZAR going up = the rand getting weaker.</b></p>
        <p>The rand is an <b>emerging-market</b> currency: when global markets get scared (wars, crashes, big US surprises), money runs to safety and the rand usually <b>weakens</b> — even with no SA news at all. US data moves USDZAR too.</p>
        <p>Your account is probably in rands: a weaker rand means a USD profit is worth <b>more</b> rands — and a USD loss costs more too.</p>`,
      q:[{ q:'USDZAR rises from 18.20 to 18.60. The rand has…', o:['strengthened', 'weakened', 'stayed the same', 'been suspended'], a:1, why:'It now takes more rands to buy one dollar — the rand weakened.' },
         { q:'Global markets panic. The rand usually…', o:['strengthens', 'weakens', 'is unaffected', 'doubles'], a:1, why:'The rand is a risk (emerging-market) currency — it usually weakens when markets get scared.' }] },

    { id:'n8', icon:'🥇', title:'Gold, the dollar & fear — and your plan', tag:'Gold',
      body: t => `<p>Gold is priced in <b>US dollars</b> and pays no interest. So it usually moves <b>against the dollar</b> and <b>against US interest rates / yields</b>.</p>
        <p>It is also the classic <b>safe haven</b>: wars, banking scares and big shocks usually send money <b>into</b> Gold — sometimes even when the dollar rises too.</p>
        ${box('✅ Your news-day plan', row('1 · Every morning', 'Pre-Flight: check the calendar, note the red events') + row('2 · Before red news', 'no new trades (your style\'s rule) · open trades at breakeven or out')
          + row('3 · On the release', 'hands off — wide spreads, slippage, whipsaw') + row('4 · After', 'wait the 30 minutes, then re-run uTrade Ideas'))}
        <p>News isn't something to gamble on — it's something to <b>plan around</b>. Know it's coming, step aside, and come back when it has settled.</p>`,
      q:[{ q:'The dollar index (DXY) is falling hard. Gold usually…', o:['falls too', 'rises', 'doesn\'t care', 'stops trading'], a:1, why:'Gold is priced in dollars — a weaker dollar usually means a higher Gold price.' },
         { q:'You\'re in a trade and red news is 20 minutes away. Best move?', o:['Add to the position', 'Move to breakeven or close', 'Remove the stop loss', 'Double the lot size'], a:1, why:'Protect the trade before the release: breakeven or out. Never widen or remove the stop.' }] }
  ];
  const ALLQ = [].concat(...LESSONS.map(l => l.q.map(q => Object.assign({ from:l.id }, q))));

  // ── Progress ──
  function load(){ try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); if(p && p.v === 1) return p; } catch(e){} return { v:1, read:{}, checks:{}, exam:null }; }
  function save(p){ try { localStorage.setItem(KEY, JSON.stringify(p)); } catch(e){} }
  const readCount = P => LESSONS.filter(l => P.read[l.id]).length;
  const passed = P => !!(P.exam && P.exam.passed);

  // ── Panel ──
  let st = null;   // { view:'home'|'lesson'|'exam'|'result'|'cert', i, ans:[], exam:{ qs, i, ans, score } }
  function shuffle(a, r){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function mixOpts(q, r){ const o = q.o.map((t, i) => ({ t, ok: i === q.a })); return { q:q.q, why:q.why, o: shuffle(o, r) }; }

  function openPanel(){
    let ov = document.getElementById('bmn-ov');
    if(!ov){ ov = document.createElement('div'); ov.id = 'bmn-ov'; ov.className = 'bmd-ov'; document.body.appendChild(ov); }
    ov.classList.add('on'); document.body.style.overflow = 'hidden'; document.body.classList.add('bmd-open');
  }
  function open(){ st = { view:'home' }; openPanel(); draw(); }
  function close(){
    const ov = document.getElementById('bmn-ov'); if(ov){ ov.classList.remove('on'); ov.innerHTML = ''; }
    document.body.style.overflow = ''; document.body.classList.remove('bmd-open'); st = null; paint();
  }
  function lesson(i){
    if(!st) openPanel();
    const l = LESSONS[i], r = BMX.rng(i * 97 + 13);
    st = { view:'lesson', i, ans:[null, null], qs: l.q.map(q => mixOpts(q, r)) };
    draw(); top();
  }
  function answer(k, oi){
    if(!st || st.view !== 'lesson' || st.ans[k] !== null) return;
    st.ans[k] = oi;
    if(st.ans.every(a => a !== null)){
      const P = load(), l = LESSONS[st.i];
      P.read[l.id] = P.read[l.id] || new Date().toISOString();
      P.checks[l.id] = st.qs.map((q, j) => q.o[st.ans[j]].ok);
      save(P);
    }
    draw();
  }
  function exam(){
    const P = load(); if(readCount(P) < LESSONS.length) return;
    const tries = (P.exam && P.exam.tries || 0) + 1, r = BMX.rng(Date.now() % 100000 + tries);
    st = { view:'exam', ex:{ qs: shuffle(ALLQ, r).slice(0, EXAM_N).map(q => mixOpts(q, r)), i:0, ans:[], score:0 } };
    draw(); top();
  }
  function exAnswer(oi){
    const ex = st && st.ex; if(!ex || ex.ans[ex.i] !== undefined) return;
    ex.ans[ex.i] = oi; if(ex.qs[ex.i].o[oi].ok) ex.score++;
    draw();
  }
  function exNext(){
    const ex = st.ex; if(ex.ans[ex.i] === undefined) return;
    if(ex.i < ex.qs.length - 1){ ex.i++; draw(); top(); return; }
    const P = load(), pct = ex.score / ex.qs.length, ok = pct >= PASS;
    const prev = P.exam || { best:0, passed:false, tries:0 };
    P.exam = { best: Math.max(prev.best || 0, pct), passed: prev.passed || ok, at: ok && !prev.passed ? new Date().toISOString() : prev.at || null, tries:(prev.tries || 0) + 1, last:pct };
    save(P);
    st = { view:'result', pct, ok }; draw(); top();
  }
  function cert(){ if(!st) openPanel(); st = { view:'cert' }; draw(); top(); }
  function home(){ st = { view:'home' }; draw(); top(); }
  function top(){ const b = document.querySelector('#bmn-ov .bmd-body'); if(b) b.scrollTop = 0; }

  // the name the app already shows in the user bar (first part of the email)
  function memberName(){
    try { const t = (document.getElementById('user-email-display') || {}).textContent; if(t && t.trim()) return t.trim(); } catch(e){}
    return 'Blue Mac member';
  }

  function draw(){
    const ov = document.getElementById('bmn-ov'); if(!ov || !st) return;
    const P = load(), n = readCount(P);
    let kicker = '📰 News Ready track', title = '', body = '', foot = '';
    if(st.view === 'home'){
      title = 'The big news events';
      body = `<div class="bmf-txt">8 short lessons on the numbers that move Gold, the dollar and the rand — and how Blue Mac traders plan around them. Pass the final exam (80%) to earn your <b>News Ready</b> certificate.</div>
        <div class="bmpr-prog"><i style="width:${Math.round(n / LESSONS.length * 100)}%"></i></div>
        <div class="bmn-list">${LESSONS.map((l, i) => { const c = P.checks[l.id];
          return `<button class="bmn-row${P.read[l.id] ? ' done' : ''}" onclick="BMN.lesson(${i})"><span class="ic">${P.read[l.id] ? '✓' : l.icon}</span>
            <span class="t"><b>${i + 1}. ${esc(l.title)}</b><small>${esc(l.tag)}${c ? ` · checks ${c.filter(Boolean).length}/2` : ''}</small></span><span class="go">›</span></button>`; }).join('')}</div>
        <div class="bmn-exam${n < LESSONS.length ? ' locked' : ''}">${passed(P)
          ? `<b>🏅 News Ready — passed</b><span>Best score ${Math.round(P.exam.best * 100)}%</span><button class="ut-next" onclick="BMN.cert()">View certificate</button>`
          : n < LESSONS.length ? `<b>🔒 Final exam</b><span>Read all 8 lessons to unlock it (${n}/8 done).</span>`
          : `<b>📝 Final exam</b><span>${EXAM_N} questions · 80% to pass${P.exam ? ` · best so far ${Math.round(P.exam.best * 100)}%` : ''}</span><button class="ut-next" onclick="BMN.exam()">Start the exam →</button>`}</div>`;
      foot = `<span></span><button class="ut-back" onclick="BMN.close()">Close</button>`;
    } else if(st.view === 'lesson'){
      const l = LESSONS[st.i], t = T();
      kicker += ` · Lesson ${st.i + 1} of ${LESSONS.length}`; title = `${l.icon} ${l.title}`;
      body = `<div class="bmn-body">${l.body(t)}</div>
        <div class="bmpr-scene-h" style="margin-top:6px;">✔️ Quick check</div>
        ${st.qs.map((q, k) => { const a = st.ans[k];
          return `<div class="bmn-q"><div class="ut-q" style="font-size:15px;">${esc(q.q)}</div><div class="bmf-qopts">${q.o.map((o, oi) => {
            const cls = a === null ? '' : o.ok ? 'right' : oi === a ? 'wrong' : 'dim';
            return `<button class="bmf-qo ${cls}" onclick="BMN.answer(${k},${oi})" ${a !== null ? 'disabled' : ''}>${esc(o.t)}</button>`; }).join('')}</div>
            ${a !== null ? `<div class="bmpr-fb ${q.o[a].ok ? 'ok' : 'no'}"><b>${q.o[a].ok ? '✅ Correct!' : '❌ Not quite.'}</b> ${esc(q.why)}</div>` : ''}</div>`; }).join('')}`;
      const done = st.ans.every(a => a !== null), last = st.i === LESSONS.length - 1;
      foot = `<button class="ut-back" onclick="BMN.home()">← All lessons</button>${done ? (last ? `<button class="ut-next" onclick="BMN.home()">Back to the track →</button>` : `<button class="ut-next" onclick="BMN.lesson(${st.i + 1})">Next lesson →</button>`) : '<span class="bmpr-tap">Answer both checks</span>'}`;
    } else if(st.view === 'exam'){
      const ex = st.ex, q = ex.qs[ex.i], a = ex.ans[ex.i];
      kicker += ` · Final exam · ${ex.i + 1} of ${ex.qs.length}`; title = 'News Ready exam';
      body = `<div class="bmpr-prog"><i style="width:${Math.round(ex.i / ex.qs.length * 100)}%"></i></div>
        <div class="ut-q">${esc(q.q)}</div><div class="bmf-qopts">${q.o.map((o, oi) => {
          const cls = a === undefined ? '' : o.ok ? 'right' : oi === a ? 'wrong' : 'dim';
          return `<button class="bmf-qo ${cls}" onclick="BMN.exAnswer(${oi})" ${a !== undefined ? 'disabled' : ''}>${esc(o.t)}</button>`; }).join('')}</div>
        ${a !== undefined ? `<div class="bmpr-fb ${q.o[a].ok ? 'ok' : 'no'}"><b>${q.o[a].ok ? '✅ Correct!' : '❌ Not quite.'}</b> ${esc(q.why)}</div>` : ''}`;
      foot = `<button class="ut-back" onclick="BMN.home()">Quit exam</button>${a === undefined ? '<span class="bmpr-tap">Tap your answer</span>' : `<button class="ut-next" onclick="BMN.exNext()">${ex.i < ex.qs.length - 1 ? 'Next →' : 'See my result →'}</button>`}`;
    } else if(st.view === 'result'){
      title = st.ok ? 'You passed! 🎉' : 'Not yet — so close';
      body = `<div class="bmf-verdict ${st.ok ? 'go' : 'care'}"><span>${st.ok ? '🏅' : '📚'}</span><div><b>${Math.round(st.pct * 100)}%</b><small>${st.ok ? 'You\'re News Ready. You know what moves the market — and when to step aside.' : `You need 80%. Have another look at the lessons, then try again — the questions change every time.`}</small></div></div>`;
      foot = st.ok ? `<button class="ut-back" onclick="BMN.home()">Back to the track</button><button class="ut-next" onclick="BMN.cert()">View certificate →</button>`
                   : `<button class="ut-back" onclick="BMN.home()">Review the lessons</button><button class="ut-next" onclick="BMN.exam()">Try again →</button>`;
    } else if(st.view === 'cert'){
      title = 'News Ready certificate';
      const at = P.exam && P.exam.at ? new Date(P.exam.at) : new Date();
      body = passed(P) ? `<div class="bmn-cert"><div class="bmn-cert-k">BLUE MAC UNIVERSITY</div><div class="bmn-cert-t">📰 News Ready</div>
          <div class="bmn-cert-s">This certifies that</div><div class="bmn-cert-n">${esc(memberName())}</div>
          <div class="bmn-cert-s">knows the big economic events — NFP, CPI, FOMC, growth data, the ECB, BoE, BoJ and SARB — what they usually do to Gold, the dollar and the rand, and how to trade safely around them.</div>
          <div class="bmn-cert-f"><span>Score ${Math.round(P.exam.best * 100)}%</span><span>${at.toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })}</span></div></div>`
        : `<div class="bmf-txt">Pass the final exam to earn this certificate.</div>`;
      foot = `<span></span><button class="ut-back" onclick="BMN.home()">Back to the track</button>`;
    }
    ov.innerHTML = `<div class="bmd-box bmpr-box bmn-box" role="dialog" aria-modal="true" aria-label="News Ready track">
      <div class="bmd-head"><div><div class="bmd-kicker">${kicker}</div><div class="bmd-title">${title}</div></div>
        <button class="bmd-x" onclick="BMN.close()" aria-label="Close">✕</button></div>
      <div class="bmd-body">${body}</div><div class="bmd-foot">${foot}</div></div>`;
  }

  // ── Entry card on the University home (after START HERE + Pre-Flight) ──
  function cardHTML(){
    const P = load(), n = readCount(P);
    if(passed(P)) return `<div class="bmpr-cta-i">🏅</div><div class="bmpr-cta-t"><b>News Ready · certified</b><span>Best exam score ${Math.round(P.exam.best * 100)}%. Revisit the lessons any time.</span></div>
      <button class="ut-back" onclick="BMN.open()">Open</button>`;
    return `<div class="bmpr-cta-i">📰</div><div class="bmpr-cta-t"><b>News Ready track${n ? ` · ${n}/8` : ''}</b><span>NFP, CPI, FOMC, SARB… what the big events do to Gold, the dollar and the rand — 8 short lessons and an exam for your certificate.</span></div>
      <button class="${n ? 'ut-back' : 'ut-next'}" onclick="BMN.open()">${n ? 'Continue →' : 'Start →'}</button>`;
  }
  function paint(){
    const root = document.getElementById('uni-root'); if(!root) return;
    let el = document.getElementById('bmn-uni');
    if(!root.querySelector('#uni-reset')){ if(el) el.remove(); return; }
    if(!el){
      el = document.createElement('div'); el.id = 'bmn-uni';
      const after = document.getElementById('bmf-uni') || document.getElementById('bmpr-uni');
      root.insertBefore(el, after ? after.nextSibling : root.firstChild);
    }
    el.className = 'bmpr-cta bmn-cta' + (passed(load()) ? ' done' : '');
    el.innerHTML = cardHTML();
  }
  function watch(){
    const root = document.getElementById('uni-root'); if(!root || root._bmn) return;
    root._bmn = true;
    new MutationObserver(() => { if(!document.getElementById('bmn-uni') || !root.querySelector('#uni-reset')) paint(); }).observe(root, { childList:true });
  }

  const css = document.createElement('style');
  css.textContent = `
.bmn-cta{border-color:rgba(245,140,60,0.45);background:linear-gradient(135deg,rgba(245,140,60,0.10),rgba(42,143,227,0.03))}
.bmn-cta.done{border-color:rgba(34,214,122,0.35);background:linear-gradient(135deg,rgba(34,214,122,0.08),rgba(42,143,227,0.03));padding:12px 16px}
#bmn-uni{margin:0 0 16px}
.bmn-list{display:flex;flex-direction:column;gap:6px}
.bmn-row{display:flex;align-items:center;gap:12px;text-align:left;padding:10px 12px;border-radius:12px;border:1px solid var(--border2);background:var(--bg4);color:var(--text);cursor:pointer;font-family:'DM Sans',sans-serif}
.bmn-row:hover{border-color:var(--blue)}
.bmn-row .ic{width:30px;height:30px;border-radius:9px;background:rgba(42,143,227,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px}
.bmn-row.done .ic{background:rgba(34,214,122,0.18);color:var(--bull,#22D67A);font-weight:800}
.bmn-row .t{flex:1;display:flex;flex-direction:column;gap:1px}.bmn-row .t b{font-size:13.5px}.bmn-row .t small{font-size:11.5px;color:var(--text3)}
.bmn-row .go{color:var(--text3);font-size:18px}
.bmn-exam{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;border-radius:14px;padding:12px 14px;border:1px solid rgba(42,143,227,0.45);background:rgba(42,143,227,0.07)}
.bmn-exam b{font-size:14px;color:var(--text)}.bmn-exam span{flex:1;min-width:160px;font-size:12.5px;color:var(--text2)}
.bmn-exam.locked{border-style:dashed;border-color:var(--border2);background:transparent}
.bmn-body p{font-size:14px;line-height:1.65;color:var(--text2);margin:0 0 10px}
.bmn-body p b{color:var(--text)}
.bmn-body .bmpr-scene{margin:0 0 10px}
.bmn-body .bmpr-scene-r b{white-space:normal;max-width:62%}
.bmn-dst{display:block;font-size:11.5px;color:var(--text3);line-height:1.5}
.bmn-react{display:flex;flex-direction:column;gap:6px;margin:0 0 10px;border-radius:14px;background:var(--bg4);border:1px solid var(--border2);padding:10px 12px}
.bmn-rx{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;font-size:13px;color:var(--text2)}
.bmn-rx span{flex:1;min-width:170px}
.bmn-rx i{font-style:normal;font-family:'DM Mono',monospace;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px}
.bmn-rx i.up{background:rgba(34,214,122,0.15);color:var(--bull,#22D67A)}.bmn-rx i.down{background:rgba(255,92,92,0.13);color:var(--bear,#FF5C5C)}
.bmn-react small{font-size:11px;color:var(--text3)}
.bmn-q{display:flex;flex-direction:column;gap:8px;margin-bottom:6px}
.bmn-cert{text-align:center;border-radius:18px;padding:26px 20px;border:2px solid rgba(245,184,65,0.55);background:radial-gradient(circle at top,rgba(245,184,65,0.12),transparent 70%),var(--bg4);display:flex;flex-direction:column;gap:8px}
.bmn-cert-k{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.18em;color:#F5B841;font-weight:700}
.bmn-cert-t{font-family:'Outfit',sans-serif;font-size:30px;font-weight:800;color:var(--text)}
.bmn-cert-s{font-size:13px;color:var(--text2);line-height:1.55}
.bmn-cert-n{font-family:'Outfit',sans-serif;font-size:22px;font-weight:700;color:var(--blue)}
.bmn-cert-f{display:flex;justify-content:space-between;font-family:'DM Mono',monospace;font-size:11px;color:var(--text3);margin-top:8px;border-top:1px dashed var(--border2);padding-top:10px}`;
  document.head.appendChild(css);

  function boot(){ paint(); watch(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  return { open, close, home, lesson, answer, exam, exAnswer, exNext, cert, paint, status: () => load(), LESSONS, _st: () => st, _sast: sast };
})();
