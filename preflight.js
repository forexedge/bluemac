// ══════════════════════════════════════════════════════
// BLUE MAC — DAILY PRE-FLIGHT (window.BMF)             17 Oct 2026
// A 2-minute routine before trading, once a day:
//   1. Today's map   — kill zones + Key Range opens in SAST (UT.sessions)
//   2. News check    — the member checks the calendar and notes any red news
//                      (no live feed yet — Brahm: add once Blue Mac earns money)
//   3. Fit to trade  — 4 honest yes/no questions → cleared / careful / grounded
//   4. Daily Drill   — one University lesson + 3 questions from its module
// → 🔥 streak (weekdays; weekends never break it, but count if done).
//
//   BMF.open() / BMF.close() / BMF.paint()
//   BMF.today()      today's record or null
//   BMF.streak()     { cur, best }
//
// Stored in localStorage['bm_flight_v1'] = { v:1, days:{ 'YYYY-MM-DD':record }, best } — synced per member by profile.js.
// Uses the panel + card styles from builder.js (bmd-*) and practice.js (bmpr-*).
// ══════════════════════════════════════════════════════
window.BMF = (function(){
  if(!window.UT || !window.BMU || !BMU.card || !window.BMX) return null;
  const KEY = 'bm_flight_v1', KEEP_DAYS = 120;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  // ── SAST calendar ──
  const sastDate = d => new Intl.DateTimeFormat('en-CA', { timeZone:'Africa/Johannesburg', year:'numeric', month:'2-digit', day:'2-digit' }).format(d || new Date());
  const parts = k => k.split('-').map(Number);
  const dayNum = k => { const [y, m, d] = parts(k); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
  const keyOf = n => new Date(n * 864e5).toISOString().slice(0, 10);
  const weekday = k => new Date(dayNum(k) * 864e5).getUTCDay();          // 0 Sun … 6 Sat
  const isWeekend = k => { const w = weekday(k); return w === 0 || w === 6; };
  const niceDate = k => new Date(dayNum(k) * 864e5).toLocaleDateString('en-ZA', { weekday:'long', day:'numeric', month:'long', timeZone:'UTC' });

  // ── Storage ──
  function load(){ try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); if(p && p.v === 1 && p.days) return p; } catch(e){} return { v:1, days:{}, best:0 }; }
  function save(p){
    const cut = dayNum(sastDate()) - KEEP_DAYS;
    Object.keys(p.days).forEach(k => { if(dayNum(k) < cut) delete p.days[k]; });
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch(e){}
  }
  const today = () => load().days[sastDate()] || null;

  // streak: walk back from today. Done day → +1. Weekend not done → skip. Today not done yet → skip. Weekday missed → stop.
  function streak(p){
    p = p || load();
    const t = dayNum(sastDate()); let n = 0;
    for(let d = t; d > t - 400; d--){
      const k = keyOf(d);
      if(p.days[k] && p.days[k].done){ n++; continue; }
      if(d === t || isWeekend(k)) continue;
      break;
    }
    return { cur:n, best: Math.max(p.best || 0, n) };
  }

  // ── Daily Drill: one lesson a day, from the levels the member is in (plus one ahead) ──
  function drillFor(k){
    const P = BMU._p(), M = BMU.MODULES;
    let lvl = (P.placed && P.placed.level) || 1;
    M.forEach(m => { if(P.quiz[m.id] && P.quiz[m.id].passed) lvl = Math.max(lvl, m.level.num); });
    M.forEach(m => { if(m.lessons.some(l => P.done[l.id])) lvl = Math.max(lvl, m.level.num); });
    const cap = Math.min(7, Math.max(2, lvl + 1));
    const pool = [];
    M.forEach(m => { if(m.level.num <= cap) m.lessons.forEach(l => pool.push(l.id)); });
    // fixed shuffle so the order is stable for a member and does not walk module by module
    const r = BMX.rng(4242);
    for(let i = pool.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const n = dayNum(k), c = BMU.card(pool[n % pool.length]); if(!c) return null;
    const qs = c.quiz, pick = [];
    for(let i = 0; i < Math.min(3, qs.length); i++) pick.push(qs[(n * 2 + i) % qs.length]);
    // shuffle each question's options (same every time for that day)
    const qr = BMX.rng(n);
    c.qs = pick.map(q => {
      const o = q.o.map((t, i) => ({ t, ok: i === q.a }));
      for(let i = o.length - 1; i > 0; i--){ const j = Math.floor(qr() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; }
      return { q:q.q, o, why:q.why || '' };
    });
    return c;
  }

  // ── Fit to trade ──
  const FIT = [
    ['😴', 'Did you sleep at least 6 hours?', 'Tired eyes misread charts and chase trades.'],
    ['🧘', 'Are you calm — no urge to win back a loss?', 'Revenge trading turns one loss into five.'],
    ['📏', 'Do you know your limits today — max trades and when to stop?', 'Scalp, Day & Key: 3 losses (or your daily loss limit) = done for the day. Swing: max 3 open + your weekly loss limit. Position: the stop must fit at 1% risk or less.'],
    ['💰', 'Is the money in your account money you can afford to lose?', 'Rent and grocery money trade scared — and scared money loses.']
  ];
  function fitVerdict(yes){
    if(yes === FIT.length) return { k:'go', icon:'✈️', t:'Cleared for take-off', s:'Clear head, clear limits. Trade your plan.' };
    if(yes === FIT.length - 1) return { k:'care', icon:'⚠️', t:'Fly carefully', s:'One thing is off. Think about half risk today, or only A+ setups.' };
    return { k:'ground', icon:'🛑', t:'Grounded today', s:'Two or more things are off. Today is for journaling, practice and study — the market will be here tomorrow.' };
  }

  // ── State while the panel is open ──
  let st = null;
  const STEPS = ['map', 'news', 'fit', 'lesson', 'q0', 'q1', 'q2', 'done'];

  function open(){
    const k = sastDate(), have = load().days[k];
    const drill = drillFor(k);
    st = { k, i: have && have.done ? STEPS.length - 1 : 0, review: !!(have && have.done), drill,
           news: have && have.news ? Object.assign({}, have.news) : null, fit: have && have.fit ? have.fit.a.slice() : [null, null, null, null],
           ans: [null, null, null], score: have && have.drill ? have.drill.score : 0, err:'' };
    if(isWeekend(k) && !st.news) st.news = { k:'weekend' };
    let ov = document.getElementById('bmf-ov');
    if(!ov){ ov = document.createElement('div'); ov.id = 'bmf-ov'; ov.className = 'bmd-ov'; document.body.appendChild(ov); }
    ov.classList.add('on'); document.body.style.overflow = 'hidden'; document.body.classList.add('bmd-open');
    draw();
  }
  function close(){
    const ov = document.getElementById('bmf-ov'); if(ov){ ov.classList.remove('on'); ov.innerHTML = ''; }
    document.body.style.overflow = ''; document.body.classList.remove('bmd-open'); st = null; paint();
  }
  const step = () => STEPS[st.i];
  function go(d){
    st.i = Math.max(0, Math.min(STEPS.length - 1, st.i + d)); st.err = '';
    if(step() === 'news' && isWeekend(st.k)) st.i = Math.max(0, Math.min(STEPS.length - 1, st.i + d));   // nothing to check on a weekend
    if(st.drill === null && /^(lesson|q\d)$/.test(step())) st.i = d > 0 ? STEPS.length - 1 : STEPS.indexOf('fit');
    if(step() === 'done' && !st.review) finish();
    draw(); const b = document.querySelector('#bmf-ov .bmd-body'); if(b) b.scrollTop = 0;
  }
  function next(){
    const s = step();
    if(s === 'news'){
      if(!st.news){ st.err = 'Pick one — or tap "Not yet" and check the calendar first.'; return draw(); }
      if(st.news.k === 'red'){
        const v = ((document.getElementById('bmf-news-t') || {}).value || '').trim();
        st.news.t = v;                                        // keep what they typed, even if it needs fixing
        if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(v)){ st.err = 'Type the time of the red news in SAST as HH:MM, like 14:30 or 09:00.'; return draw(); }
      }
      if(st.news.k === 'later'){ st.err = 'Check the calendar first (link above), then come back and pick an answer.'; return draw(); }
    }
    if(s === 'fit' && st.fit.some(x => x === null)){ st.err = 'Answer all four — honestly. Nobody sees this but you.'; return draw(); }
    if(/^q\d$/.test(s) && st.ans[+s[1]] === null) return;
    go(1);
  }
  function setNews(k){ st.news = { k }; st.err = ''; draw(); if(k === 'red'){ const el = document.getElementById('bmf-news-t'); if(el) el.focus(); } }
  function setFit(i, v){ st.fit[i] = v; st.err = ''; draw(); }
  function answer(qi, oi){
    if(st.ans[qi] !== null || st.review) return;
    st.ans[qi] = oi; if(st.drill.qs[qi].o[oi].ok) st.score++;
    draw();
  }
  function finish(){
    const p = load();
    p.days[st.k] = { done: new Date().toISOString(), news: st.news, fit:{ a: st.fit.slice(), yes: st.fit.filter(Boolean).length },
                     drill: st.drill ? { lid: st.drill.lid, score: st.score, of: st.drill.qs.length } : null };
    p.best = Math.max(p.best || 0, streak(p).cur);
    save(p);
  }

  // ── Pieces ──
  function mapHTML(){
    const s = UT.sessions(), hm = s.hm, k = st.k, closed = isWeekend(k);
    const row = (lab, val, now) => { now = now && !closed; return `<div class="bmpr-scene-r"><span>${lab}</span><b class="${now ? 'ok' : ''}">${val}${now ? ' · NOW' : ''}</b></div>`; };
    const keyRow = (n, lab) => row(`${lab} Key Range`, `${hm(s.key[n].open)}–${hm(s.key[n].rangeEnd)} · trade until ${hm(s.key[n].until)}`, s.key[n].k === 'forming' || s.key[n].k === 'ready');
    return `${isWeekend(k) ? `<div class="bmpr-fb no"><b>🛌 Weekend — forex and gold are closed.</b> Today is for learning: finish your Pre-Flight to keep the habit (and your streak) going.</div>` : ''}
      <div class="bmpr-scene"><div class="bmpr-scene-h">⏰ Today in SAST · ${esc(niceDate(k))}</div>
        <div class="bmpr-clock"><b>${esc(s.nowTxt)}</b><span>SAST right now</span></div>
        ${row('London kill zone', s.fmt(s.lo), s.cur === 'london')}
        ${row('New York kill zone', s.fmt(s.ny), s.cur === 'ny')}
        ${row('Day trades: London window', s.fmt(s.loD), s.curD === 'london')}
        ${row('Day trades: New York window', s.fmt(s.nyD), s.curD === 'ny')}</div>
      <div class="bmpr-scene"><div class="bmpr-scene-h">🔑 Blue Mac Key · today's Key Ranges</div>
        ${keyRow('asia', 'Asia')}${keyRow('london', 'London')}${keyRow('ny', 'New York')}
        <small>Times follow daylight saving in London and New York automatically.</small></div>
      <div class="bmpr-note">Put your alarms on the windows you trade. Outside them, Blue Mac's answer is usually "wait".</div>`;
  }
  function newsHTML(){
    const n = st.news || {}, opt = (k, t, sub) => `<div class="ut-opt neut${n.k === k ? ' on' : ''}" role="button" tabindex="0" onclick="BMF.setNews('${k}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}"><div class="ut-opt-t">${t}</div><div class="ut-opt-s">${sub}</div></div>`;
    return `<div class="bmpr-scene"><div class="bmpr-scene-h">📅 Check today's calendar</div>
        <div class="bmf-txt">Open <a href="https://www.forexfactory.com/calendar" target="_blank" rel="noopener noreferrer">ForexFactory</a> (or Investing.com), set the time zone to <b>Johannesburg</b>, and look for <b>🔴 red-folder</b> events on the currencies you trade. For gold and US indices that's <b>USD</b>.</div>
        ${window.BMN ? `<button class="bmf-learn" onclick="BMF.close();BMN.open()">📰 Not sure what NFP, CPI or FOMC do? Take the News Ready track</button>` : ''}</div>
      <div class="ut-opts compact bmf-opts">
        ${opt('none', 'No red news for my markets today', 'Normal trading day.')}
        ${opt('red', 'There is red news today', 'I\'ll type the time below.')}
        ${opt('later', 'Not checked yet', 'Open the calendar first.')}
      </div>
      ${n.k === 'red' ? `<div class="ut-lv-f bmf-time"><label for="bmf-news-t">Time of the red news (SAST)</label>
        <input id="bmf-news-t" type="text" inputmode="numeric" autocomplete="off" placeholder="e.g. 14:30" maxlength="5" value="${esc(n.t || '')}">
        <small>Several? Type the first one. Blue Mac's rule: no new trades from 1 hour before until 30 minutes after.</small></div>` : ''}`;
  }
  function fitHTML(){
    return `<div class="bmf-txt">Four honest answers. Nobody sees them but you.</div>
      ${FIT.map(([ic, q, why], i) => `<div class="bmf-fit">
        <div class="bmf-fit-q"><span>${ic}</span><div><b>${esc(q)}</b><small>${esc(why)}</small></div></div>
        <div class="bmf-yn"><button class="${st.fit[i] === true ? 'on yes' : ''}" onclick="BMF.setFit(${i},true)">Yes</button><button class="${st.fit[i] === false ? 'on no' : ''}" onclick="BMF.setFit(${i},false)">No</button></div></div>`).join('')}`;
  }
  function lessonHTML(){
    const c = st.drill;
    return `<div class="bmf-txt">Today's drill comes from <b>Module ${esc(c.mcode)} · ${esc(c.mtitle)}</b>. Read it, then 3 quick questions.</div>
      <div class="ex-card uni-lesson-card bmf-lesson" style="display:block;">
        <div class="ex-card-header"><div class="ex-card-icon">${c.icon || '📘'}</div><div class="ex-card-title">${esc(c.title)}</div>
          ${c.tag ? `<span class="ex-card-tag" style="background:${c.color}1F;color:${c.color};border:1px solid ${c.color}55;">${esc(c.tag)}</span>` : ''}</div>
        <div class="ex-card-body">${c.html}</div></div>`;
  }
  function qHTML(qi){
    const q = st.drill.qs[qi], a = st.ans[qi], done = a !== null;
    return `<div class="bmf-qn">Question ${qi + 1} of ${st.drill.qs.length}</div>
      <div class="ut-q">${esc(q.q)}</div>
      <div class="bmf-qopts">${q.o.map((o, oi) => {
        const cls = done ? (o.ok ? 'right' : oi === a ? 'wrong' : 'dim') : '';
        return `<button class="bmf-qo ${cls}" onclick="BMF.answer(${qi},${oi})" ${done ? 'disabled' : ''}>${esc(o.t)}</button>`; }).join('')}</div>
      ${done ? `<div class="bmpr-fb ${q.o[a].ok ? 'ok' : 'no'}"><b>${q.o[a].ok ? '✅ Correct!' : '❌ Not quite.'}</b> ${esc(q.why)}</div>` : ''}`;
  }
  function doneHTML(){
    const rec = load().days[st.k], v = fitVerdict(rec ? rec.fit.yes : 0), sk = streak();
    const n = rec && rec.news, d = rec && rec.drill;
    const win = n && n.k === 'red' && n.t ? newsWindow(n.t) : null;
    return `<div class="bmf-verdict ${v.k}"><span>${v.icon}</span><div><b>${v.t}</b><small>${v.s}</small></div></div>
      <div class="bmf-streak"><div class="bmf-fire">🔥 ${sk.cur}</div><div><b>${sk.cur === 1 ? '1-day streak' : `${sk.cur}-day streak`}</b><small>Best: ${sk.best} · weekends never break it</small></div></div>
      ${weekHTML()}
      <div class="bmpr-scene"><div class="bmpr-scene-h">📋 Today's flight plan</div>
        ${n && n.k === 'red' ? `<div class="bmpr-scene-r"><span>🔴 Red news</span><b class="no">${esc(n.t)} SAST</b></div>
          <div class="bmpr-scene-r"><span>No new trades</span><b class="no">${win}</b></div>`
          : n && n.k === 'weekend' ? `<div class="bmpr-scene-r"><span>Markets</span><b>Closed (weekend)</b></div>`
          : `<div class="bmpr-scene-r"><span>News</span><b class="ok">No red news</b></div>`}
        ${d ? `<div class="bmpr-scene-r"><span>Daily Drill</span><b class="${d.score === d.of ? 'ok' : ''}">${d.score}/${d.of}${d.score === d.of ? ' · perfect' : ''}</b></div>` : ''}
      </div>
      <div class="bmpr-note">Come back tomorrow for a new drill and keep the 🔥 going.</div>`;
  }
  function weekHTML(){
    const p = load(), t = dayNum(sastDate());
    let h = '';
    for(let d = t - 6; d <= t; d++){
      const k = keyOf(d), done = p.days[k] && p.days[k].done, we = isWeekend(k);
      h += `<div class="bmf-day${done ? ' done' : we ? ' we' : ''}${d === t ? ' today' : ''}"><i>${done ? '✓' : we ? '·' : ''}</i><span>${'SMTWTFS'[weekday(k)]}</span></div>`;
    }
    return `<div class="bmf-week">${h}</div>`;
  }
  function newsWindow(t){
    const [h, m] = t.split(':').map(Number), x = h * 60 + m, f = v => { v = (v + 1440) % 1440; return String(Math.floor(v / 60)).padStart(2, '0') + ':' + String(v % 60).padStart(2, '0'); };
    return `${f(x - 60)}–${f(x + 30)}`;
  }

  // ── Drawing ──
  const TITLES = { map:'Today\'s map', news:'News check', fit:'Fit to trade?', lesson:'Daily Drill', q0:'Daily Drill', q1:'Daily Drill', q2:'Daily Drill', done:'Pre-Flight complete' };
  function draw(){
    const ov = document.getElementById('bmf-ov'); if(!ov || !st) return;
    const s = step(), real = STEPS.filter(x => x !== 'done' && !(x === 'news' && isWeekend(st.k)) && !(st.drill === null && /^(lesson|q\d)$/.test(x)));
    const pos = real.indexOf(s);
    let body = '', foot = '';
    if(s === 'map') body = mapHTML();
    else if(s === 'news') body = newsHTML();
    else if(s === 'fit') body = fitHTML();
    else if(s === 'lesson') body = lessonHTML();
    else if(s[0] === 'q') body = qHTML(+s[1]);
    else body = doneHTML();
    const err = st.err ? `<div class="bmpr-fb no">${esc(st.err)}</div>` : '';
    if(s === 'done') foot = `${st.review ? '<span></span>' : `<button class="ut-back" onclick="BMF.go(-1)">← Back</button>`}<button class="ut-next" onclick="BMF.close()">${st.review ? 'Close' : 'Let\'s trade →'}</button>`;
    else {
      const qWait = s[0] === 'q' && st.ans[+s[1]] === null;
      const label = s === 'lesson' ? 'I\'ve read it — questions →' : STEPS[st.i + 1] === 'done' ? 'Finish Pre-Flight ✓' : 'Next →';
      foot = `${st.i > 0 ? `<button class="ut-back" onclick="BMF.go(-1)">← Back</button>` : `<button class="ut-back" onclick="BMF.close()">Not now</button>`}
        ${qWait ? '<span class="bmpr-tap">Tap your answer</span>' : `<button class="ut-next" onclick="BMF.next()">${label}</button>`}`;
    }
    ov.innerHTML = `<div class="bmd-box bmpr-box bmf-box" role="dialog" aria-modal="true" aria-label="Daily Pre-Flight">
      <div class="bmd-head"><div><div class="bmd-kicker">✈️ Daily Pre-Flight${s !== 'done' ? ` · Step ${pos + 1} of ${real.length}` : ''}</div><div class="bmd-title">${TITLES[s]}</div></div>
        <button class="bmd-x" onclick="BMF.close()" aria-label="Close">✕</button></div>
      <div class="bmd-body">${s !== 'done' ? `<div class="bmpr-prog"><i style="width:${Math.round(pos / real.length * 100)}%"></i></div>` : ''}${body}${err}</div>
      <div class="bmd-foot">${foot}</div></div>`;
  }

  // ── Entry cards: uTrade Ideas (top of the cards) + Education home ──
  function cardHTML(){
    const rec = today(), sk = streak();
    if(!rec || !rec.done) return `<div class="bmpr-cta-i">✈️</div>
      <div class="bmpr-cta-t"><b>Daily Pre-Flight${sk.cur ? ` · 🔥 ${sk.cur}` : ''}</b><span>2 minutes before you trade: today's kill zones, a news check, "am I fit to trade?" and your Daily Drill.${sk.cur ? ' Keep your streak alive!' : ''}</span></div>
      <button class="ut-next" onclick="BMF.open()">Start Pre-Flight →</button>`;
    const v = fitVerdict(rec.fit.yes), n = rec.news, d = rec.drill;
    const bits = [`🔥 ${sk.cur}-day streak`];
    if(d) bits.push(`Drill ${d.score}/${d.of}`);
    if(n && n.k === 'red' && n.t) bits.push(`🔴 news ${n.t} · no new trades ${newsWindow(n.t)}`);
    return `<div class="bmpr-cta-i">${v.icon}</div>
      <div class="bmpr-cta-t"><b>${v.t}</b><span>${bits.map(esc).join(' · ')}</span></div>
      <button class="ut-back" onclick="BMF.open()">View</button>`;
  }
  function paint(){
    const rec = today(), cls = 'bmpr-cta bmf-cta' + (rec && rec.done ? ' done ' + fitVerdict(rec.fit.yes).k : '');
    const anchor = document.getElementById('guided-toggle-bar');
    if(anchor){
      let el = document.getElementById('bmf-ut');
      if(!el){ el = document.createElement('div'); el.id = 'bmf-ut'; anchor.parentNode.insertBefore(el, document.getElementById('bmpr-ut') || document.getElementById('bm-mystrats') || anchor); }
      el.className = cls; el.innerHTML = cardHTML();
    }
    paintUni();
  }
  function paintUni(){
    const root = document.getElementById('uni-root'); if(!root) return;
    let el = document.getElementById('bmf-uni');
    if(!root.querySelector('#uni-reset')){ if(el) el.remove(); return; }
    if(!el){ el = document.createElement('div'); el.id = 'bmf-uni'; const pr = document.getElementById('bmpr-uni'); root.insertBefore(el, pr ? pr.nextSibling : root.firstChild); }
    const rec = today();
    el.className = 'bmpr-cta bmf-cta' + (rec && rec.done ? ' done ' + fitVerdict(rec.fit.yes).k : '');
    el.innerHTML = cardHTML();
  }
  function watch(){
    const root = document.getElementById('uni-root');
    if(root && !root._bmf){ root._bmf = true; new MutationObserver(() => { if(!document.getElementById('bmf-uni') || !root.querySelector('#uni-reset')) paintUni(); }).observe(root, { childList:true }); }
    // a new SAST day while the app stays open → fresh card
    let shown = sastDate();
    const tick = () => { const k = sastDate(); if(k !== shown){ shown = k; paint(); } };
    document.addEventListener('visibilitychange', () => { if(!document.hidden) tick(); });
    setInterval(tick, 60000);
  }

  // ── Styles (on top of bmd-* and bmpr-*) ──
  const css = document.createElement('style');
  css.textContent = `
.bmf-cta{border-color:rgba(42,143,227,0.45);background:linear-gradient(135deg,rgba(42,143,227,0.13),rgba(150,208,255,0.04))}
.bmf-cta.done.go{border-color:rgba(34,214,122,0.35);background:linear-gradient(135deg,rgba(34,214,122,0.08),rgba(42,143,227,0.03));padding:12px 16px}
.bmf-cta.done.care{border-color:rgba(245,184,65,0.45);background:rgba(245,184,65,0.07);padding:12px 16px}
.bmf-cta.done.ground{border-color:rgba(255,92,92,0.45);background:rgba(255,92,92,0.06);padding:12px 16px}
#bmf-uni{margin:0 0 16px}
.bmf-txt{font-size:13.5px;color:var(--text2);line-height:1.6}
.bmf-txt a{color:var(--blue);font-weight:700}
.bmf-opts{grid-template-columns:1fr!important}
.bmf-time input{max-width:140px}
.bmf-learn{align-self:flex-start;margin-top:4px;padding:7px 12px;border-radius:10px;border:1px solid rgba(245,140,60,0.45);background:rgba(245,140,60,0.08);color:var(--text);font-size:12.5px;cursor:pointer;font-family:'DM Sans',sans-serif;text-align:left}
.bmf-fit{display:flex;justify-content:space-between;align-items:center;gap:12px;border-radius:12px;background:var(--bg4);border:1px solid var(--border2);padding:10px 12px}
.bmf-fit-q{display:flex;gap:10px;align-items:flex-start}
.bmf-fit-q>span{font-size:20px;line-height:1.2}
.bmf-fit-q b{display:block;font-size:13.5px;color:var(--text);line-height:1.4}
.bmf-fit-q small{font-size:11.5px;color:var(--text3);line-height:1.4}
.bmf-yn{display:flex;gap:6px;flex-shrink:0}
.bmf-yn button{min-width:52px;padding:8px 10px;border-radius:10px;border:1px solid var(--border2);background:transparent;color:var(--text2);font-weight:700;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif}
.bmf-yn button.on.yes{background:rgba(34,214,122,0.15);border-color:var(--bull,#22D67A);color:var(--bull,#22D67A)}
.bmf-yn button.on.no{background:rgba(255,92,92,0.12);border-color:var(--bear,#FF5C5C);color:var(--bear,#FF5C5C)}
.bmf-lesson{margin:0}
.bmf-lesson .ex-diagram svg{max-width:420px}
.bmf-qn{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3)}
.bmf-qopts{display:flex;flex-direction:column;gap:8px}
.bmf-qo{text-align:left;padding:12px 14px;border-radius:12px;border:1px solid var(--border2);background:var(--bg4);color:var(--text);font-size:14px;cursor:pointer;font-family:'DM Sans',sans-serif;line-height:1.4}
.bmf-qo:not([disabled]):hover{border-color:var(--blue)}
.bmf-qo.right{border-color:var(--bull,#22D67A);background:rgba(34,214,122,0.1)}
.bmf-qo.wrong{border-color:var(--bear,#FF5C5C);background:rgba(255,92,92,0.08)}
.bmf-qo.dim{opacity:.45}
.bmf-qo[disabled]{cursor:default}
.bmf-verdict{display:flex;gap:14px;align-items:center;border-radius:14px;padding:14px 16px;border:1px solid}
.bmf-verdict span{font-size:30px}.bmf-verdict b{display:block;font-family:'Outfit',sans-serif;font-size:18px;color:var(--text)}.bmf-verdict small{font-size:12.5px;color:var(--text2);line-height:1.5}
.bmf-verdict.go{border-color:rgba(34,214,122,0.45);background:rgba(34,214,122,0.09)}
.bmf-verdict.care{border-color:rgba(245,184,65,0.5);background:rgba(245,184,65,0.08)}
.bmf-verdict.ground{border-color:rgba(255,92,92,0.5);background:rgba(255,92,92,0.07)}
.bmf-streak{display:flex;gap:14px;align-items:center;padding:4px 2px}
.bmf-fire{font-family:'Outfit',sans-serif;font-size:28px;font-weight:800;color:#F5B841;min-width:70px}
.bmf-streak b{display:block;font-size:15px;color:var(--text)}.bmf-streak small{font-size:12px;color:var(--text3)}
.bmf-week{display:flex;gap:6px}
.bmf-day{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
.bmf-day i{width:100%;max-width:40px;height:30px;border-radius:9px;border:1px solid var(--border2);background:var(--bg4);display:flex;align-items:center;justify-content:center;font-style:normal;font-weight:800;color:#06121f;font-size:13px}
.bmf-day.done i{background:linear-gradient(135deg,#F5B841,#F59A3C);border-color:#F5B841}
.bmf-day.we i{color:var(--text3);opacity:.55}
.bmf-day.today i{box-shadow:0 0 0 2px var(--blue)}
.bmf-day span{font-family:'DM Mono',monospace;font-size:10px;color:var(--text3)}
@media (max-width:640px){
  .bmf-fit{flex-direction:column;align-items:stretch}
  .bmf-yn button{flex:1}
}`;
  document.head.appendChild(css);

  function boot(){ paint(); watch(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  return { open, close, go, next, setNews, setFit, answer, paint, today, streak, _st: () => st, _drill: drillFor, _date: sastDate };
})();
