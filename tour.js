// ══════════════════════════════════════════════════════
// BLUE MAC — APP TOUR (window.BMT)
// A spotlight walkthrough of every tab. Runs once automatically on the
// first visit (after login, placement test and disclaimer), and any time
// from the "?" button: "Tour this page" or "Full app tour".
// ══════════════════════════════════════════════════════
window.BMT = (function(){
  const KEY = 'bm_tour_v1';
  const done = () => { try { return localStorage.getItem(KEY) === 'done'; } catch(e){ return true; } };
  const markDone = () => { try { localStorage.setItem(KEY, 'done'); } catch(e){} };
  const $ = s => { try { return document.querySelector(s); } catch(e){ return null; } };
  const visible = el => { if(!el) return false; const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(el).visibility !== 'hidden'; };

  function go(page){
    const pg = document.getElementById('pg-' + page);
    if(!pg || pg.classList.contains('on')) return;
    const b = [...document.querySelectorAll('.nav-item')].find(x => (x.getAttribute('onclick') || '').includes(`'${page}'`));
    if(b && typeof goPage === 'function') goPage(page, b);
  }
  const curPage = () => { const p = document.querySelector('.page.on'); return p ? p.id.replace('pg-', '') : 'checklist'; };

  // ── small mock-ups used to explain screens that only exist after a full analysis ──
  const DEMO = {
    stages: `<div class="bmt-demo"><div class="bmt-d-chips"><span class="on">✓ Safety gates</span><span class="on">✓ H1 bias</span><span class="cur">15m setup</span><span>5m trigger</span><span>Your levels</span></div></div>`,
    question: () => `<div class="bmt-demo"><div class="bmt-d-q">On the 15-minute chart: has price just swept liquidity?</div>
      <div class="bmt-d-opts"><div class="on">${window.UT && UT.C ? UT.C('sweep', 1)() : ''}<b>Swept the lows ✓</b></div><div>${window.UT && UT.C ? UT.C('midRange', 1)() : ''}<b>Nothing yet ⏳</b></div></div></div>`,
    result: `<div class="bmt-demo">
      <div class="bmt-d-row"><span class="bmt-d-badge go">✓ A+ Setup</span><b>91</b><small>score · 1% risk</small></div>
      <div class="bmt-d-row"><span class="bmt-d-badge wait">⏳ Watchlist</span><small>valid, not confirmed yet — monitor only</small></div>
      <div class="bmt-d-row"><span class="bmt-d-badge no">🛑 No Trade</span><small>a hard rule is broken — no idea is built</small></div></div>`,
    plan: `<div class="bmt-demo">
      <div class="bmt-d-grid"><div><span>Entry 1</span><b class="b">2343.50</b></div><div><span>Entry 2</span><b class="b">2342.25</b></div><div><span>Stop</span><b class="r">2337.63</b></div><div><span>TP1 · 1:2.3</span><b class="g">2358.00</b></div><div><span>TP2 · 1:3.3</span><b class="g">2364.17</b></div></div>
      <div class="bmt-d-size">🧮 <b>0.22 lots</b> · 0.11 @ E1 + 0.11 @ E2 · max loss <b class="r">−R2 443</b> · TP1 <b class="g">+R5 623</b></div></div>`,
    take: `<div class="bmt-demo"><div class="bmt-d-btns"><span class="g">▲ Take This Long — Save to Journal</span><span>👁 Monitor Setup</span></div>
      <div class="bmt-d-rows"><small>🕯 <b>Signal to wait for</b> · 5m CHoCH closing above the last lower high</small><small>🔴 <b>Idea is dead if</b> · a 5m candle closes below the sweep low</small></div></div>`
  };

  // ── Tour content per page ──
  const PAGES = {
    checklist: [
      { el:['.hdr-nav'], title:'Your five tabs', text:'<b>uTrade Ideas</b> builds trade ideas · <b>Journal</b> tracks every trade · <b>Rules</b> is the rulebook · <b>Examples</b> shows every concept on a chart · <b>Education</b> is your trading degree.' },
      { el:['.style-bar'], title:'Pick a trading style', text:'Five complete strategies: <b>Blue Mac Key</b> (our flagship moving-average system), <b>Scalp</b>, <b>Day Trade</b>, <b>Swing</b> and <b>Position</b>. Each has its own questions, rules and risk-reward minimums.' },
      { el:['.quiz-trigger'], title:'Not sure which style?', text:'The 60-second quiz matches you to the style that fits your schedule and personality.' },
      { el:['#ut-know', '.ut-know-bar'], title:'What you need to know', text:'Every style lists the concepts it is built on — order blocks, moving averages, liquidity and more. <b>📖 Example</b> opens the lesson, <b>🎓</b> shows where it sits in your University degree. Tap <b>I\'m ready</b> to start.' },
      { el:['#guided-panel .ut-prog'], ifMissing:'stages', title:'Five stages, one question at a time', text:'<b>Safety gates</b> (session, news, your day) → <b>bias</b> on the higher timeframe → the <b>zone</b> → the <b>trigger</b> → <b>your price levels</b>.' },
      { el:['#guided-panel .ut-card'], ifMissing:'question', title:'Answer with pictures', text:'Every answer has a diagram — pick the one that looks like your chart. <b>📖 Learn</b> opens the lesson without losing your place. If a hard rule is broken (news, wrong session, 3 losses) the trade stops right there.' },
      { title:'Your result', demo:'result', text:'Blue Mac scores every layer. <b>A+ = 1% risk · A = 0.75% · B = 0.5%</b>. Below 60 there is no trade. <b>Watchlist</b> means the setup is valid but not confirmed — you save it and wait.' },
      { title:'Exact prices and lot size', demo:'plan', text:'Type a few prices from your chart and Blue Mac calculates <b>both entries, the stop and the targets — after the spread</b>. TP1 always pays at least 1:2. Add your balance and currency once, and it works out your <b>lot size</b>.' },
      { title:'Take it or monitor it', demo:'take', text:'The AI explains the signal to wait for, when the idea is dead and how to manage it. <b>Take This Trade</b> saves it to your journal; <b>Monitor</b> saves it to watch.' }
    ],
    journal: [
      { el:['#pg-journal .stats-grid'], title:'Your numbers at a glance', text:'Total trades, win rate, average score and R:R — updated every time you log an outcome.' },
      { el:['#pg-journal .analytics-toggle'], title:'The Edge Report', text:'Open <b>Performance Analytics</b> to see if the system is really making you money: win rate, average win and <b>expectancy</b> per grade and per style. After <b>20 closed trades</b> each row gets a verdict.' },
      { el:['#pg-journal .journal-filters'], title:'Filter your trades', text:'Wins, losses, or one style at a time.' },
      { el:['#tbl-wrap', '#j-empty'], title:'Every trade, with its plan', text:'Tap a trade to see its full plan. Mark it <b>Win, Loss or Break even</b> and answer "did you follow the plan?" — that feeds the Edge Report and your discipline insight.' }
    ],
    rules: [
      { el:['#pg-rules .style-rules-tabs'], title:'One rulebook per style', text:'Switch between the five styles.' },
      { el:['#rules-content .rules-layout', '#rules-content'], title:'Know them. Live them.', text:'Pre-flight checklist, the setup step by step, grades and position size, entries/stops/targets and the <b>never-do-this</b> list. They are generated from the same logic as uTrade Ideas, so they always match.' }
    ],
    examples: [
      { el:['#pg-examples .examples-filter-bar'], title:'134 visual lessons', text:'Candles, patterns, Fibonacci, Smart Money, indicators and trade management — pick a category.' },
      { el:['#examples-grid .ex-card'], title:'Every concept on a real chart', text:'Each card shows the idea on a chart with the rules to trade it. These are the same lessons the 📖 buttons in uTrade Ideas open.' }
    ],
    education: [
      { el:['#uni-root .uni-hero', '#uni-root'], title:'Blue Mac University', text:'Your Self-Mastery Degree — 7 levels, 20 modules, 97 lessons. It picks up where you left off.' },
      { el:['#uni-root .uni-level', '#uni-root'], title:'Levels and modules', text:'Pass each module quiz with <b>80%</b> to unlock the next. Your placement test may already have unlocked some. Every level ends with a certificate.' }
    ]
  };
  const ORDER = ['checklist', 'journal', 'rules', 'examples', 'education'];
  const NAMES = { checklist:'uTrade Ideas', journal:'Journal', rules:'Rules', examples:'Examples', education:'Education' };

  let steps = [], i = 0, root = null, raf = 0, auto = false;

  function build(mode){
    const list = [];
    const pages = mode === 'full' ? ORDER : [mode];
    if(mode === 'full') list.push({ page:'checklist', title:'Welcome to Blue Mac 👋', text:'A quick tour of the whole app — about 2 minutes. Skip any time, and replay it later from the <b>?</b> button.' });
    pages.forEach(p => (PAGES[p] || []).forEach(s => list.push(Object.assign({ page:p }, s))));
    list.push(mode === 'full'
      ? { page:'checklist', title:'You\'re all set 🚀', text:'Start with the <b>What you need to know</b> card for your style, then run your first analysis. Replay this tour any time from the <b>?</b> button.' }
      : { page:mode, title:'That\'s the ' + NAMES[mode] + ' tab', text:'Want the whole app? Tap <b>?</b> → <b>Full app tour</b>.' });
    return list;
  }

  function start(mode){
    stop(true);
    steps = build(mode || 'full'); i = 0;
    root = document.createElement('div'); root.id = 'bmt';
    root.innerHTML = `<div class="bmt-block"></div><div class="bmt-hole"></div><div class="bmt-card" role="dialog" aria-modal="true" aria-live="polite"></div>`;
    document.body.appendChild(root);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place); window.addEventListener('scroll', place, true);
    show();
  }
  function stop(silent){
    if(root){ root.remove(); root = null; }
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true);
    if(!silent) markDone();
  }
  function onKey(e){
    if(!root) return;
    if(e.key === 'Escape') stop();
    else if(e.key === 'ArrowRight') next();
    else if(e.key === 'ArrowLeft') back();
  }
  function next(){ if(i < steps.length - 1){ i++; show(); } else stop(); }
  function back(){ if(i > 0){ i--; show(); } }

  function target(s){
    for(const sel of (s.el || [])){ const el = $(sel); if(visible(el)) return el; }
    return null;
  }
  function demoFor(s){
    const k = s.demo || (s.ifMissing && !target(s) ? s.ifMissing : null);
    if(!k) return '';
    const d = DEMO[k]; return typeof d === 'function' ? d() : d;
  }
  function show(){
    const s = steps[i]; if(!s || !root) return;
    go(s.page);
    const card = root.querySelector('.bmt-card');
    card.innerHTML = `
      <div class="bmt-top"><span class="bmt-kicker">${NAMES[s.page] || ''}</span><span class="bmt-count">${i + 1} / ${steps.length}</span></div>
      <div class="bmt-title">${s.title}</div>
      ${demoFor(s)}
      <div class="bmt-text">${s.text}</div>
      <div class="bmt-dots">${steps.map((_, k) => `<i class="${k === i ? 'on' : k < i ? 'd' : ''}"></i>`).join('')}</div>
      <div class="bmt-btns">
        <button class="bmt-skip" onclick="BMT.stop()">${i === steps.length - 1 ? 'Close' : 'Skip tour'}</button>
        <span>${i > 0 ? '<button class="bmt-back" onclick="BMT.back()">← Back</button>' : ''}
        <button class="bmt-next" onclick="BMT.next()">${i === steps.length - 1 ? 'Done ✓' : 'Next →'}</button></span>
      </div>`;
    // let the page render, bring the target into view, then measure
    setTimeout(() => {
      const el = target(s);
      if(el){ const r = el.getBoundingClientRect(); if(r.top < 70 || r.bottom > innerHeight - 90) el.scrollIntoView({ block: r.height > innerHeight * 0.6 ? 'start' : 'center' }); }
      else window.scrollTo({ top:0 });
      setTimeout(place, 60);
    }, 120);
    const nb = card.querySelector('.bmt-next'); if(nb) nb.focus({ preventScroll:true });
  }
  function place(){
    if(!root) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const s = steps[i], el = target(s), hole = root.querySelector('.bmt-hole'), card = root.querySelector('.bmt-card');
      const vw = innerWidth, vh = innerHeight, mobile = vw < 700, pad = 6;
      card.style.cssText = ''; hole.style.cssText = '';
      if(!el){
        root.classList.add('center');
        hole.style.display = 'none';
        if(mobile){ card.style.left = '12px'; card.style.right = '12px'; card.style.top = Math.max(12, (vh - card.offsetHeight) / 2) + 'px'; }
        else { card.style.left = (vw - card.offsetWidth) / 2 + 'px'; card.style.top = Math.max(16, (vh - card.offsetHeight) / 2) + 'px'; }
        return;
      }
      root.classList.remove('center');
      const r = el.getBoundingClientRect();
      const ch0 = card.offsetHeight, reserve = ch0 + (mobile ? 96 : 28);
      const top = Math.max(r.top - pad, 4);
      let bottom = Math.min(r.bottom + pad, vh - 4);
      // tall target: show its top part and keep the card underneath it
      if(bottom - top > vh - reserve - top && vh - reserve - top > 80) bottom = vh - reserve;
      hole.style.cssText = `display:block;left:${Math.max(r.left - pad, 4)}px;top:${top}px;width:${Math.min(r.width + pad * 2, vw - 8)}px;height:${Math.max(bottom - top, 20)}px;`;
      const ch = ch0, cw = card.offsetWidth;
      if(mobile){
        card.style.left = '12px'; card.style.right = '12px';
        const roomBelow = vh - bottom - 84, roomAbove = top - 12;
        if(roomBelow >= ch + 10) card.style.top = (bottom + 10) + 'px';
        else if(roomAbove >= ch + 10) card.style.top = (top - ch - 10) + 'px';
        else card.style.top = ((r.top + r.bottom) / 2 > vh / 2 ? 12 : Math.max(12, vh - ch - 90)) + 'px';
      } else {
        let y = bottom + 12; if(y + ch > vh - 12) y = top - ch - 12; if(y < 12) y = Math.max(12, vh - ch - 16);
        let x = Math.min(Math.max(r.left, 16), vw - cw - 16);
        card.style.left = x + 'px'; card.style.top = y + 'px';
      }
    });
  }

  // ── "?" help button ──
  function helpButton(){
    if(document.getElementById('bmt-help')) return;
    const b = document.createElement('div'); b.id = 'bmt-help';
    b.innerHTML = `<button class="bmt-q" aria-label="Help and app tour" onclick="BMT.menu()">?</button>
      <div class="bmt-menu" role="menu">
        <button role="menuitem" onclick="BMT.menu(false);BMT.start(BMT.page())">🧭 Tour this page</button>
        <button role="menuitem" onclick="BMT.menu(false);BMT.start('full')">🗺 Full app tour</button>
      </div>`;
    document.body.appendChild(b);
    document.addEventListener('click', e => { if(!b.contains(e.target)) b.classList.remove('open'); });
  }
  function menu(v){ const b = document.getElementById('bmt-help'); if(b) b.classList.toggle('open', v === undefined ? !b.classList.contains('open') : v); }

  // ── first visit: wait until login, placement test and disclaimer are out of the way ──
  function appReady(){
    const shown = id => { const e = document.getElementById(id); return e && getComputedStyle(e).display !== 'none' && getComputedStyle(e).visibility !== 'hidden'; };
    if(['auth-gate', 'quiz-gate', 'disclaimer-gate', 'splash'].some(shown)) return false;
    if(document.querySelector('.quiz-overlay.open, .modal-overlay.open, .ut-learn.on')) return false;
    return !!document.querySelector('.page.on');
  }
  function watch(){
    helpButton();
    if(done()) return;
    let n = 0;
    const t = setInterval(() => {
      if(done() || ++n > 600){ clearInterval(t); return; }
      if(appReady()){ clearInterval(t); setTimeout(() => { if(!done() && appReady() && !root){ auto = true; start('full'); } }, 900); }
    }, 1000);
  }

  // ── styles ──
  const css = `
#bmt{position:fixed;inset:0;z-index:9500;pointer-events:none}
#bmt .bmt-block{position:fixed;inset:0;pointer-events:auto;background:transparent}
#bmt.center .bmt-block{background:rgba(0,0,0,0.72)}
#bmt .bmt-hole{position:fixed;display:none;border-radius:14px;box-shadow:0 0 0 200vmax rgba(0,0,0,0.72);border:2px solid var(--blue,#2A8FE3);transition:all .25s ease;pointer-events:none}
#bmt .bmt-card{position:fixed;pointer-events:auto;width:360px;max-width:calc(100vw - 24px);background:#121212;border:1px solid rgba(42,143,227,0.45);border-radius:16px;padding:16px 18px;box-shadow:0 20px 60px rgba(0,0,0,0.6);display:flex;flex-direction:column;gap:10px;font-family:'DM Sans',sans-serif;color:#F2F2F2;transition:top .25s ease,left .25s ease}
@media (max-width:700px){ #bmt .bmt-card{width:auto} }
.bmt-top{display:flex;justify-content:space-between;align-items:center}
.bmt-kicker{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#2A8FE3;font-weight:700}
.bmt-count{font-family:'DM Mono',monospace;font-size:10.5px;color:#7C7C82}
.bmt-title{font-family:'Outfit',sans-serif;font-size:19px;font-weight:800;line-height:1.25}
.bmt-text{font-size:13.5px;color:#B8B8BE;line-height:1.65}
.bmt-text b{color:#F2F2F2}
.bmt-dots{display:flex;gap:4px;flex-wrap:wrap}
.bmt-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.15)}
.bmt-dots i.d{background:rgba(42,143,227,0.5)} .bmt-dots i.on{background:#2A8FE3;width:16px;border-radius:4px}
.bmt-btns{display:flex;justify-content:space-between;align-items:center;gap:8px}
.bmt-btns>span{display:flex;gap:8px}
.bmt-btns button{font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;border-radius:10px;cursor:pointer;padding:9px 14px}
.bmt-skip{background:transparent;border:none;color:#7C7C82;padding-left:0!important}
.bmt-back{background:transparent;border:1px solid rgba(255,255,255,0.15);color:#B8B8BE}
.bmt-next{background:linear-gradient(135deg,#2A8FE3,#1272BC);border:1px solid rgba(42,143,227,0.5);color:#fff}
.bmt-demo{border:1px solid rgba(255,255,255,0.09);border-radius:12px;background:#1A1A1A;padding:10px;display:flex;flex-direction:column;gap:6px}
.bmt-d-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bmt-d-row b{font-family:'Outfit',sans-serif;font-size:18px}
.bmt-d-row small,.bmt-d-rows small{font-size:11.5px;color:#7C7C82;line-height:1.5}
.bmt-d-rows{display:flex;flex-direction:column;gap:4px}
.bmt-d-rows b{color:#B8B8BE}
.bmt-d-badge{font-size:11.5px;font-weight:800;padding:3px 9px;border-radius:20px;white-space:nowrap}
.bmt-d-badge.go{color:#22D67A;background:rgba(34,214,122,0.1)} .bmt-d-badge.wait{color:#F5B841;background:rgba(245,184,65,0.1)} .bmt-d-badge.no{color:#FF5C5C;background:rgba(255,92,92,0.1)}
.bmt-d-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}
.bmt-d-grid div{display:flex;flex-direction:column}
.bmt-d-grid span{font-family:'DM Mono',monospace;font-size:8px;letter-spacing:.04em;text-transform:uppercase;color:#7C7C82}
.bmt-d-grid b{font-family:'DM Mono',monospace;font-size:11px}
.bmt-demo .b{color:#2A8FE3} .bmt-demo .r{color:#FF5C5C} .bmt-demo .g{color:#22D67A}
.bmt-d-chips{display:flex;flex-wrap:wrap;gap:4px}
.bmt-d-chips span{font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;padding:3px 8px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);color:#7C7C82}
.bmt-d-chips span.on{color:#22D67A;border-color:rgba(34,214,122,0.3)} .bmt-d-chips span.cur{color:#2A8FE3;border-color:rgba(42,143,227,0.5);background:rgba(42,143,227,0.1)}
.bmt-d-q{font-family:'Outfit',sans-serif;font-size:13.5px;font-weight:700}
.bmt-d-opts{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.bmt-d-opts div{border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:4px;display:flex;flex-direction:column;gap:2px;background:#121212}
.bmt-d-opts div.on{border-color:#22D67A;box-shadow:0 0 0 1px #22D67A}
.bmt-d-opts svg{max-width:100%!important;height:auto}
.bmt-d-opts b{font-size:11px;padding:0 4px 2px}
.bmt-d-size{font-size:11.5px;color:#B8B8BE;font-family:'DM Mono',monospace;line-height:1.5}
.bmt-d-btns{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.bmt-d-btns span{font-size:11px;font-weight:800;text-align:center;padding:7px 4px;border-radius:9px;border:1px solid rgba(255,255,255,0.15);color:#F2F2F2}
.bmt-d-btns span.g{color:#22D67A;border-color:rgba(34,214,122,0.45);background:rgba(34,214,122,0.1)}
#bmt-help{position:fixed;right:20px;bottom:20px;z-index:9400;display:flex;flex-direction:column;align-items:flex-end;gap:8px}
#bmt-help .bmt-q{width:44px;height:44px;border-radius:50%;border:1px solid rgba(42,143,227,0.5);background:#121212;color:#2A8FE3;font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,0.5);order:2}
#bmt-help .bmt-menu{display:none;flex-direction:column;background:#121212;border:1px solid rgba(255,255,255,0.15);border-radius:12px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.6);order:1}
#bmt-help.open .bmt-menu{display:flex}
#bmt-help .bmt-menu button{background:transparent;border:none;color:#F2F2F2;text-align:left;padding:12px 16px;font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;white-space:nowrap}
#bmt-help .bmt-menu button+button{border-top:1px solid rgba(255,255,255,0.08)}
#bmt-help .bmt-menu button:hover{background:rgba(42,143,227,0.1)}
@media (max-width:700px){ #bmt-help{right:12px;bottom:calc(84px + env(safe-area-inset-bottom))} #bmt-help .bmt-q{width:40px;height:40px;font-size:18px} }
`;
  const st = document.createElement('style'); st.id = 'bmt-css'; st.textContent = css; document.head.appendChild(st);

  if(document.readyState === 'complete') watch(); else window.addEventListener('load', watch);

  return { start, stop:() => stop(), next, back, menu, page: curPage, _steps:() => steps, _i:() => i, _ready: appReady, PAGES };
})();
