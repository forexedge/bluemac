// ══════════════════════════════════════════════════════
// BLUE MAC — "YOUR NEXT STEP" GUIDE (window.BMC)
// Member feedback (16 Oct 2026): after the tour a member still asked
// "okay, so what do I do? where do I start?". The tour shows WHERE things are;
// this guide always shows the ONE next thing to do, from where the member is.
//
//   uTrade Ideas — a 4-step path that ticks itself off:
//     1 Pick how you trade · 2 Answer the questions with your chart open
//     3 Generate your trade idea · 4 Save it to your Journal
//   + one big "next step" with a button, worked out from the live screen.
//   Journal / Rules / Examples / Education — one line + one button.
//
// Progress: localStorage['bm_path_v1'] = { done:{pick,answer,idea,save}, hide:{page:1} }
// (synced per member by profile.js). Watches the uTrade panel, so no changes are
// needed in the engine. (The old "Guided Mode" welcome banner was removed from index.html.)
// ══════════════════════════════════════════════════════
window.BMC = (function(){
  const KEY = 'bm_path_v1';
  const STEPS = [
    ['pick',   'Pick how you trade'],
    ['answer', 'Answer the questions with your chart open'],
    ['idea',   'Generate your trade idea'],
    ['save',   'Save it to your Journal']
  ];
  const STYLE_NAME = { scalp:'Scalp', day:'Day Trade', swing:'Swing', position:'Position', key:'Blue Mac Key' };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  function load(){ try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); return d && d.done ? d : { done:{}, hide:{} }; } catch(e){ return { done:{}, hide:{} }; } }
  function save(d){ try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e){} }
  const member = () => !window.BMS || !!BMS.uid;   // only track progress for a logged-in member
  function mark(step){ if(!member()) return; const d = load(); if(d.done[step]) return; d.done[step] = Date.now(); save(d); }
  function hide(page, v){ const d = load(); d.hide = d.hide || {}; if(v) d.hide[page] = 1; else delete d.hide[page]; save(d); paint(); }

  // ── Small helpers (the page's S is a top-level const, not on window) ──
  const curStyle = () => { try { return S.style; } catch(e){ return 'scalp'; } };
  const log = () => { try { return Array.isArray(S.log) ? S.log : []; } catch(e){ return []; } };
  const styleLabel = k => (window.BMB && BMB.get(k)) ? BMB.get(k).name : (STYLE_NAME[k] || k);
  function nav(page){
    const b = document.querySelector(`.nav-item[onclick*="goPage('${page}'"]`);
    if(b && typeof goPage === 'function') goPage(page, b);
    window.scrollTo({ top:0, behavior:'smooth' });
  }
  function useStyle(k){
    const t = document.querySelector('.style-tab.' + k);
    if(t && typeof setStyle === 'function') setStyle(k, t);
    mark('pick'); toPanel();
  }
  function top(){ window.scrollTo({ top:0, behavior:'smooth' }); }
  function toPanel(){ const p = document.getElementById('guided-panel'); if(p) p.scrollIntoView({ behavior:'smooth', block:'start' }); }
  function tour(){ try { if(window.BMT && BMT.start) BMT.start(BMT.page ? BMT.page() : undefined); } catch(e){} }

  // ── What is on the uTrade screen right now ──
  function screen(){
    const st = (window.UT && UT._st) || {}, panel = document.getElementById('guided-panel');
    const card = panel && panel.querySelector('.ut-card');
    const total = (() => { const c = panel && panel.querySelector('.ut-count'); const m = c && c.textContent.match(/of (\d+)/); return m ? +m[1] : null; })();
    return {
      know: !!(panel && panel.querySelector('.ut-know') && !card),
      step: st.step | 0, total,
      q: card ? (card.querySelector('.ut-q') || {}).textContent : '',
      tf: card ? ((card.querySelector('.ut-tf') || {}).textContent || '') : '',
      result: !!(panel && panel.querySelector('.ut-res')),
      blocked: !!(st.result && st.result.blocked), waiting: !!(st.result && st.result.waiting), weak: !!(st.result && st.result.tooWeak),
      canFire: !!(panel && panel.querySelector('.ut-fire[data-ai]:not([disabled])')),
      thinking: !!(panel && panel.querySelector('.ut-think')),
      idea: !!(panel && panel.querySelector('.ut-idea')),
      limit: !!(panel && panel.querySelector('.ut-limit')),
      instrument: (st.ans || {}).instrument || ''
    };
  }

  // ── The one next step on uTrade Ideas ──
  // the member tapped back to Step 1 (nothing is wiped — they can keep what they had)
  let review = false;
  function nextStep(sc, d){
    const name = esc(styleLabel(curStyle()));
    const sug = (() => { try { return localStorage.getItem('bm_style_suggestion') || ''; } catch(e){ return ''; } })();
    const hasOwn = window.BMB && BMB.list().length;
    if(sc.limit) return { i:'⏳', t:'You’ve used today’s AI ideas', s:'Your engine-calculated plan is still yours. Save it, or practise with the questions — new ideas unlock at midnight SAST.', b:[['Go to my Journal', "BMC.nav('journal')"]] };
    if(sc.idea) return d.done.save
      ? { i:'✅', t:'Trade saved — now manage it', s:'Follow the plan: partials at TP1, stop to breakeven. When it closes, mark Win / Loss / BE in your Journal. That is how your Edge Report learns what works for you.', b:[['Open my Journal', "BMC.nav('journal')"], ['Run another idea', 'restartGuided();BMC.toPanel()']] }
      : { i:'💾', t:'Step 4 — save this idea', s:'Scroll to the bottom of your idea. <b>Take This Trade</b> = you’re entering now. <b>Monitor</b> = you’re waiting for the signal candle. Both go to your Journal.', b:[['Show me', "BMC.toTake()"]] };
    if(sc.thinking) return { i:'🧠', t:'Building your trade idea…', s:'Give it a few seconds. Your prices are already calculated by the Blue Mac engine — the AI explains them.', b:[] };
    if(sc.result){
      if(sc.blocked) return { i:'🛑', t:'No trade — and that’s the system working', s:'One of the hard rules is broken (news, losses, no direction…). The reason is in red below. Try another instrument, or come back in the next session — not trading IS a good trade.', b:[['Start a new analysis', 'restartGuided();BMC.toPanel()']] };
      if(sc.weak) return { i:'✕', t:'Below the Blue Mac standard', s:'The setup scored under 60, so there’s no trade idea. Check the answers marked • below — usually the zone or trigger isn’t there yet. Wait for it, or try another instrument.', b:[['Start a new analysis', 'restartGuided();BMC.toPanel()']] };
      if(sc.canFire) return { i:'⚡', t:`Step 3 — tap ${sc.waiting ? '“Build Watchlist Idea”' : '“Generate Trade Idea”'}`, s: sc.waiting ? 'The setup is forming but not confirmed. You’ll get an idea to WATCH, not to enter yet.' : 'Your setup is graded and your prices are calculated. One tap builds the full trade idea.', b:[['Show me the button', "BMC.toFire()"]] };
      return { i:'🔢', t:'Add your price levels', s:'Go back one step and type the prices from your chart — Blue Mac needs them to calculate entries, stop and targets.', b:[['Back to the levels', 'UT.back();BMC.toPanel()']] };
    }
    const started = sc.step > 0 || sc.instrument;
    // choosing comes first — a new member lands on Scalp by default without having picked it
    if(review || (!d.done.pick && !started)){
      // building their own strategy is the headline option; a Blue Mac style is the quick alternative
      const b = [[hasOwn ? '🛠 Use my own strategy' : '🛠 Build my own strategy', hasOwn ? `BMB.open('${BMB.list()[0].id}');BMC.mark('pick')` : 'BMB.edit()', 'go']];
      const alt = sug && STYLE_NAME[sug] ? sug : 'key';
      // already on that style after tapping back? "Keep" says the same thing — don't show both
      if(!(review && curStyle() === alt)) b.push([sug && STYLE_NAME[sug] ? `Or use ${STYLE_NAME[sug]} — matched to you` : 'Or start with Blue Mac Key', `BMC.useStyle('${alt}')`]);
      if(review) b.push([`← Keep ${name}`, 'BMC.go(1)']);
      return { i:'👋', t:'Step 1 — pick how you want to trade', s:`<b>Build your own strategy</b> from the tools you already trade with — trendlines, order blocks, patterns, MACD… Blue Mac turns it into your own uTrade Idea. ${sug && STYLE_NAME[sug] ? `Or start with <b>${STYLE_NAME[sug]}</b>, the style your placement test matched you to.` : 'Or start with the <b>Blue Mac Key</b> — one clean session setup.'}`, b };
    }
    if(sc.know) return { i:'📚', t:`Quick read before ${name}`, s:'These are the concepts this style uses. Tap any you don’t know (2 minutes), then tap <b>I’m ready — let’s go</b> at the bottom of the card.', b:[['Show me', 'BMC.toPanel()']] };
    if(!started) return { i:'📈', t:`Step 2 — open your chart, then answer question 1`, s:`You’re on <b>${name}</b>. Open MT5 or TradingView next to Blue Mac, then answer each question by looking at your chart. Every question has example pictures — tap <b>📖 Learn</b> if a word is new.`, b:[['Start the questions', 'BMC.toPanel()']] };
    const isClock = sc.tf && /^(SAST|MT5 time|your time)$/.test(sc.tf.trim());          // session questions show the clock, not a chart timeframe
    const tf = sc.tf && !isClock ? ` Have your <b>${esc(sc.tf)}</b> chart open.` : '';
    return { i:'🧭', t:`Step 2 — question ${sc.step + 1}${sc.total ? ` of ${sc.total}` : ''}`, s:`${esc(sc.q || 'Answer the question below.')}${tf} Pick the picture that looks most like your chart. Not sure? Tap <b>📖 Learn</b>.`, b:[['Continue', 'BMC.toPanel()']] };
  }
  function go(i){
    if(i === 0){ review = true; paint(); const c = document.getElementById('bmc-checklist'); if(c) c.scrollIntoView({ behavior:'smooth', block:'start' }); return; }
    review = false; paint();
    if(i === 2 && document.querySelector('#guided-panel .ut-fire')) return toFire();
    if(i === 3 && document.querySelector('#guided-panel .ut-take')) return toTake();
    toPanel();
  }
  function toFire(){ const b = document.querySelector('#guided-panel .ut-fire'); if(b){ b.scrollIntoView({ behavior:'smooth', block:'center' }); flash(b); } }
  function toTake(){ const b = document.querySelector('#guided-panel .ut-take'); if(b){ b.scrollIntoView({ behavior:'smooth', block:'center' }); flash(b); } }
  function flash(el){ el.classList.remove('bmc-flash'); void el.offsetWidth; el.classList.add('bmc-flash'); }

  // ── uTrade card ──
  function utradeHTML(){
    const d = load(), sc = screen();
    if(sc.instrument || sc.step > 0) mark('pick');
    if(sc.result || sc.idea) mark('answer');
    if(sc.idea) mark('idea');
    const dd = load().done, n = nextStep(sc, load());
    const doneN = STEPS.filter(([k]) => dd[k]).length;
    const nowIdx = review ? 0 : STEPS.findIndex(([k]) => !dd[k]);
    if(d.hide && d.hide.checklist) return `<button class="bmc-show" onclick="BMC.hide('checklist',0)">🧭 Show my next step</button>`;
    return `<div class="bmc-card">
      <div class="bmc-top"><span class="bmc-k">🧭 Your next step</span>
        <span class="bmc-prog">${doneN}/4 done</span>
        <button class="bmc-x" onclick="BMC.hide('checklist',1)" aria-label="Hide the guide">Hide</button></div>
      <div class="bmc-path">${STEPS.map(([k, l], i) => { const on = i === nowIdx, can = dd[k] || on;
        return `<${can ? 'button type="button"' : 'div'} class="bmc-st${dd[k] && !on ? ' done' : on ? ' now' : ''}"${can ? ` onclick="BMC.go(${i})" title="${i === 0 ? 'Back to step 1' : 'Go to this step'}"` : ''}><i>${dd[k] && !on ? '✓' : i + 1}</i><span>${l}</span>${can && i === 0 && !on ? '<em>← back</em>' : ''}</${can ? 'button' : 'div'}>`; }).join('')}</div>
      <div class="bmc-next"><div class="bmc-ic">${n.i}</div><div class="bmc-tx"><b>${n.t}</b><p>${n.s}</p>
        ${n.b.length ? `<div class="bmc-bs">${n.b.map(([t, a, cls], i) => `<button class="${i ? 'bmc-b2' : 'bmc-b1'}${cls ? ' ' + cls : ''}" onclick="${a}">${t}</button>`).join('')}</div>` : ''}</div></div>
      <div class="bmc-help">${dd.pick && !review ? '<button onclick="BMC.go(0)">← Back to step 1</button> · ' : ''}Lost? <button onclick="BMC.tour()">Show me around this page</button></div>
    </div>`;
  }

  // ── One-line guides on the other tabs ──
  function lineHTML(page){
    const d = load();
    if(d.hide && d.hide[page]) return `<button class="bmc-show" onclick="BMC.hide('${page}',0)">🧭 Show the guide for this page</button>`;
    let i = '', t = '', b = [];
    if(page === 'journal'){
      const L = log(), open = L.filter(e => e.outcome === 'pending').length, closed = L.filter(e => ['win', 'loss', 'be'].includes(e.outcome)).length;
      if(!L.length){ i = '📒'; t = 'Your trades land here when you tap <b>Take This Trade</b> or <b>Monitor</b> on a uTrade Idea.'; b = [['Get my first idea', "BMC.nav('checklist')"]]; }
      else if(open){ i = '⏳'; t = `You have <b>${open} open trade${open > 1 ? 's' : ''}</b>. When ${open > 1 ? 'they close' : 'it closes'}, tap the card and mark <b>Win / Loss / BE</b> — that builds your Edge Report${closed < 20 ? ` (${closed}/20 closed so far)` : ''}.`; b = [['Show my open trades', 'BMC.toPending()']]; }
      else { i = '📊'; t = closed >= 20 ? 'You have 20+ closed trades — your Edge Report below shows what actually works for you.' : `${closed} closed trade${closed === 1 ? '' : 's'}. At 20, your Edge Report gives a verdict on your strategy. Keep going.`; b = [['Get another idea', "BMC.nav('checklist')"]]; }
    }
    if(page === 'rules'){
      const k = curStyle(), mine = window.BMB && BMB.get(k);
      i = '📜';
      t = mine ? `Your strategy <b>${esc(mine.name)}</b> uses Blue Mac’s risk rules — read <b>Entries, Stops & Targets</b> and <b>Never Do This</b> in any style below.`
               : `Before your first real trade, read the rules for <b>${esc(STYLE_NAME[k] || 'your style')}</b> — the Pre-Flight Checklist takes 2 minutes and saves accounts.`;
      b = mine ? [['Back to my strategy', `BMB.open('${k}')`]] : [[`Show ${esc(STYLE_NAME[k] || 'Scalp')} rules`, `BMC.rulesFor('${STYLE_NAME[k] ? k : 'scalp'}')`], ['Start an idea with these rules', "BMC.nav('checklist')"]];
    }
    if(page === 'examples'){
      i = '🔎'; t = 'Look anything up: type in the search (try <b>order block</b>, <b>FVG</b> or <b>fib</b>) or tap a filter. Every uTrade question links here with <b>📖 Learn</b>.';
      b = [['Search now', 'BMC.focusSearch()']];
    }
    if(page === 'education'){
      const U = window.BMU, P = U && U._p ? U._p() : null;
      let label = '', go = '';
      try {
        if(P && P.last && P.last.mid){
          const m = U.MODULES.find(x => x.id === P.last.mid), l = m && P.last.lid ? m.lessons.find(x => x.id === P.last.lid) : null;
          if(m){ label = l ? `Continue: <b>${esc(l.title)}</b>` : `Continue module ${esc(m.code)}: <b>${esc(m.title)}</b>`; go = l ? `BMU.lesson('${m.id}','${l.id}')` : `BMU.module('${m.id}')`; }
        }
        if(!label && U){
          const m = U.MODULES.find(x => U.isUnlocked(x.id) && !(P.quiz[x.id] && P.quiz[x.id].passed) && !(P.placed && x.level.num < P.placed.level)) || U.MODULES[0];
          label = `Start module ${esc(m.code)}: <b>${esc(m.title)}</b>`; go = `BMU.module('${m.id}')`;
        }
      } catch(e){}
      i = '🎓'; t = `${label || 'Start at your level'} — short lessons with pictures, then an 80% quiz to unlock the next module.`;
      b = go ? [['Go', go + ';BMC.top()']] : [];
    }
    return `<div class="bmc-line"><span class="bmc-li">${i}</span><span class="bmc-lt">${t}</span>
      ${b.map(([x, a], k) => `<button class="${k ? 'bmc-b2' : 'bmc-b1'}" onclick="${a}">${x}</button>`).join('')}
      <button class="bmc-x" onclick="BMC.hide('${page}',1)" aria-label="Hide the guide">✕</button></div>`;
  }
  function rulesFor(k){ const b = [...document.querySelectorAll('.srt')].find(x => (x.getAttribute('onclick') || '').includes(`'${k}'`)); if(b && typeof showRules === 'function') showRules(k, b); }
  function focusSearch(){ const el = document.getElementById('ex-search-input'); if(el){ el.scrollIntoView({ behavior:'smooth', block:'center' }); el.focus(); } }
  function toPending(){ const c = document.querySelector('.j-card.is-pending'); if(c){ c.scrollIntoView({ behavior:'smooth', block:'center' }); flash(c); } }

  // ══════════════════════════════════════════════════════
  // The pointer — a calm label that sits IN the page right above the thing to tap next
  // (it takes its own line, so it can never cover text), plus a steady outline on the target.
  // Off-screen targets get a small "↓ … tap to scroll" chip instead. No bouncing.
  // ══════════════════════════════════════════════════════
  const vis = el => !!el && el.offsetParent !== null && el.getClientRects().length > 0;
  const q1 = sel => [...document.querySelectorAll(sel)].find(vis) || null;
  function curPage(){ const pg = document.querySelector('.page.on'); return pg ? pg.id.replace('pg-', '') : ''; }
  // [element, label] for the member's next step on the current page — or null
  function target(){
    const page = curPage(), d = load();
    if(!page || (d.hide && d.hide[page])) return null;
    if(page === 'checklist'){
      const sc = screen(), P = '#guided-panel ';
      if(sc.limit || sc.thinking) return null;
      if(sc.idea) return d.done.save ? null : [q1(P + '#style-take-btn') || q1(P + '.ut-take-b.mon'), 'Save it here'];
      if(sc.result){
        if(sc.canFire) return [q1(P + '.ut-fire[data-ai]'), sc.waiting ? 'Tap to build your Watchlist idea' : 'Tap to generate your idea'];
        if(sc.blocked || sc.weak) return [q1(P + '.ut-gate.block') || q1(P + '.ut-res-sub'), 'Why there’s no trade'];
        return null;
      }
      const started = sc.step > 0 || sc.instrument;
      if(review || (!d.done.pick && !started)) return [q1('#bmc-checklist .bmc-b1'), 'Start here'];
      if(sc.know) return [q1(P + '.ut-know .ut-next'), 'Tap when you’re ready'];
      if(q1(P + '#ut-lv-price')) return [q1(P + '#ut-lv-price'), 'Type your prices here'];
      if(q1(P + '.ut-inst')) return [q1(P + '.ut-inst'), 'Pick your market'];
      if(q1(P + '.ut-check')) return [q1(P + '.ut-opts'), 'Tick any that apply, then Next'];
      if(q1(P + '.ut-opts')) return [q1(P + '.ut-opts'), 'Pick the one that matches your chart'];
      return null;
    }
    if(page === 'journal'){ const c = [...document.querySelectorAll('.j-card.is-pending')].find(vis); return c ? [c, 'Mark the result when it closes'] : null; }
    if(page === 'rules'){
      const k = curStyle(); if(!STYLE_NAME[k]) return null;
      const b = [...document.querySelectorAll('.srt')].find(x => (x.getAttribute('onclick') || '').includes(`'${k}'`));
      return b && !b.classList.contains('on') ? [b, 'Your style’s rules'] : null;
    }
    if(page === 'examples'){ const el = document.getElementById('ex-search-input'); return el && !el.value && !searched ? [el, 'Search any concept here'] : null; }
    if(page === 'education') return [q1('#bmc-education .bmc-b1'), ''];
    return null;
  }
  let searched = false, lastT = null, raf = 0;
  document.addEventListener('input', e => { if(e.target && e.target.id === 'ex-search-input'){ searched = true; point(); } }, true);
  // something else is on top: a builder / picker / lesson modal, the tour, or the login screen
  function covered(){
    if(document.body.classList.contains('bmd-open') || document.querySelector('.ut-learn.on') || document.getElementById('bmt')) return true;
    // the app's own pop-ups (Setup Guide, Style Quiz, journal modals) all open with the 'open' class
    if(document.querySelector('#setup-guide-overlay.open, #quiz-overlay.open, #log-modal.open, #update-modal.open')) return true;
    return ['auth-gate', 'quiz-gate', 'disclaimer-gate', 'reset-gate'].some(id => { const g = document.getElementById(id); return g && getComputedStyle(g).display !== 'none' && vis(g); });
  }
  // the label goes above the whole row / block the target lives in — never inside a row of buttons
  const ROWS = '.bmc-bs, .ut-know-f, .ut-lv, .ut-actions, .ut-take, .style-rules-tabs, #ex-search';
  function here(){
    let h = document.getElementById('bmc-here');
    if(!h){ h = document.createElement('div'); h.id = 'bmc-here'; h.className = 'bmc-here'; h.setAttribute('role', 'note'); }
    return h;
  }
  function point(){
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      let chip = document.getElementById('bmc-chip');
      if(!chip){
        chip = document.createElement('button'); chip.id = 'bmc-chip'; chip.type = 'button';
        chip.onclick = () => { if(lastT) lastT.scrollIntoView({ behavior:'smooth', block:'center' }); }; document.body.appendChild(chip);
      }
      const t = covered() ? null : target(), el = t && t[0], h = here();
      if(lastT && lastT !== el) lastT.classList.remove('bmc-target');
      lastT = el || null;
      if(!el){ if(h.parentNode) h.remove(); chip.className = ''; return; }
      el.classList.add('bmc-target');
      // in-page label (only when there is something to say)
      if(t[1]){
        const row = el.closest(ROWS) || el, txt = '↓ ' + t[1];
        if(h.textContent !== txt) h.textContent = txt;
        if(h.parentNode !== row.parentNode || h.nextSibling !== row) row.parentNode.insertBefore(h, row);
      } else if(h.parentNode) h.remove();
      // off-screen → chip above the phone's bottom nav
      const r = el.getBoundingClientRect(), H = window.innerHeight;
      const nav = [...document.querySelectorAll('.nav-item')].map(n => n.getBoundingClientRect().top).filter(y => y > H * 0.7);
      const bottom = nav.length ? Math.min(...nav) : H;
      if(t[1] && (r.bottom < 40 || r.top > bottom - 30)){
        const down = r.top > bottom - 30;
        const txt = `${down ? '↓' : '↑'} ${t[1]} — tap to scroll`;
        if(chip.textContent !== txt) chip.textContent = txt;
        chip.className = 'on ' + (down ? 'down' : 'up');
        chip.style.bottom = (H - bottom + 12) + 'px';
      } else chip.className = '';
    });
  }
  // the app scrolls inside its own containers, not only the window — listen to every scroll (capture phase)
  document.addEventListener('scroll', point, { passive:true, capture:true });
  window.addEventListener('resize', point);

  // ── Paint every page ──
  const PAGES = ['checklist', 'journal', 'rules', 'examples', 'education'];
  let busy = false;
  // force = redraw hidden pages too (after a profile loads or a member logs out)
  function paint(force){
    if(busy) return; busy = true;
    try {
      PAGES.forEach(page => {
        const pg = document.getElementById('pg-' + page); if(!pg) return;
        let el = document.getElementById('bmc-' + page);
        if(!el){ el = document.createElement('div'); el.id = 'bmc-' + page; el.className = 'bmc'; pg.insertBefore(el, pg.firstChild); }
        if(!force && !pg.classList.contains('on') && el.innerHTML) return;      // hidden pages refresh when opened
        const html = page === 'checklist' ? utradeHTML() : lineHTML(page);
        const h = document.getElementById('bmc-here'), cur = h && el.contains(h) ? el.innerHTML.replace(h.outerHTML, '') : el.innerHTML;
        if(cur !== html) el.innerHTML = html;
      });
    } catch(e){ console.warn('Blue Mac guide:', e); }
    busy = false;
    point();
  }
  let timer = null;
  const soon = () => { clearTimeout(timer); timer = setTimeout(paint, 120); };

  // ── Watch the app (no engine changes needed) ──
  function hook(name, after){
    const fn = window[name]; if(typeof fn !== 'function' || fn['_bmc']) return;
    const w = function(){ const r = fn.apply(this, arguments); try { after.apply(null, arguments); } catch(e){} return r; };
    w._bmc = true; Object.keys(fn).forEach(k => w[k] = fn[k]); window[name] = w;
  }
  function init(){
    const panel = document.getElementById('guided-panel');
    if(panel && window.MutationObserver) new MutationObserver(soon).observe(panel, { childList:true, subtree:true });
    hook('goPage', () => setTimeout(paint, 60));
    hook('setStyle', () => { review = false; soon(); });
    hook('takeThisTrade', () => { mark('save'); soon(); });
    hook('renderJournal', soon);
    hook('showRules', soon);
    paint();
    setInterval(point, 300);    // modals, the tour and lessons open on top without telling us — keep the arrow honest
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  // ── Styles ──
  const css = document.createElement('style');
  css.textContent = `
.bmc{margin:0}
.bmc-card{margin:12px 0 14px;padding:14px 16px;border-radius:16px;border:1px solid rgba(42,143,227,0.45);background:linear-gradient(160deg,rgba(42,143,227,0.12),rgba(42,143,227,0.02));display:flex;flex-direction:column;gap:12px}
.bmc-top{display:flex;align-items:center;gap:10px}
.bmc-k{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--blue);font-weight:800}
.bmc-prog{font-family:'DM Mono',monospace;font-size:10.5px;color:var(--text3)}
.bmc-x{margin-left:auto;border:1px solid var(--border2);background:transparent;color:var(--text3);font-size:11.5px;border-radius:8px;padding:4px 10px;cursor:pointer;font-family:'DM Sans',sans-serif}
.bmc-path{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.bmc-st{display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;padding:8px 4px;border-radius:10px;background:var(--bg4);border:1px solid var(--border)}
.bmc-st i{font-style:normal;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:11.5px;font-weight:800;background:var(--bg5);color:var(--text3)}
.bmc-st span{font-size:11px;line-height:1.3;color:var(--text3)}
.bmc-st.done i{background:var(--bull);color:#050505}.bmc-st.done span{color:var(--text2)}
.bmc-st.now{border-color:var(--blue);background:rgba(42,143,227,0.1)}.bmc-st.now i{background:var(--blue);color:#fff}.bmc-st.now span{color:var(--text)}
.bmc-next{display:flex;gap:12px;align-items:flex-start;padding:12px;border-radius:12px;background:var(--bg3);border:1px solid var(--border2)}
.bmc-ic{font-size:26px;line-height:1}
.bmc-tx{flex:1;min-width:0}
.bmc-tx b{display:block;font-family:'Outfit',sans-serif;font-size:17px;color:var(--text);line-height:1.3}
.bmc-tx p{font-size:13.5px;color:var(--text2);line-height:1.6;margin-top:4px}
.bmc-tx p b{display:inline;font-family:'DM Sans',sans-serif;font-size:inherit}
.bmc-bs{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
.bmc-b1,.bmc-b2{padding:10px 16px;border-radius:10px;font-size:13.5px;font-weight:800;cursor:pointer;font-family:'DM Sans',sans-serif}
.bmc-b1{border:1px solid rgba(42,143,227,0.5);background:linear-gradient(135deg,#2A8FE3,#1272BC);color:#fff;box-shadow:0 4px 14px rgba(42,143,227,0.25)}
.bmc-b2{border:1px solid var(--border2);background:transparent;color:var(--text)}
.bmc-help{font-size:12px;color:var(--text3)}
.bmc-help button{border:none;background:transparent;color:var(--blue);font-weight:700;cursor:pointer;font-size:12px;padding:0 2px;font-family:'DM Sans',sans-serif}
.bmc-show{margin:10px 0;border:1px dashed rgba(42,143,227,0.4);background:rgba(42,143,227,0.05);color:var(--blue);font-size:12.5px;font-weight:700;border-radius:10px;padding:8px 14px;cursor:pointer;font-family:'DM Sans',sans-serif}
.bmc-line{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:12px 0;padding:12px 14px;border-radius:14px;border:1px solid rgba(42,143,227,0.35);background:rgba(42,143,227,0.06)}
.bmc-li{font-size:20px}
.bmc-lt{flex:1;min-width:200px;font-size:13.5px;color:var(--text2);line-height:1.55}
.bmc-lt b{color:var(--text)}
.bmc-line .bmc-x{margin-left:0}
.bmc-flash{animation:bmcFlash 1.4s ease 2}
@keyframes bmcFlash{0%,100%{box-shadow:0 0 0 0 rgba(42,143,227,0)}50%{box-shadow:0 0 0 4px rgba(42,143,227,0.55)}}
/* arrows between the 4 steps */
.bmc-st{position:relative;font-family:'DM Sans',sans-serif;color:inherit}
button.bmc-st{cursor:pointer}
button.bmc-st:hover{border-color:rgba(255,255,255,0.3)}
.bmc-st em{font-style:normal;font-size:10px;font-weight:700;color:var(--blue);margin-top:-2px}
.bmc-st:not(:last-child)::after{content:'›';position:absolute;right:-7px;top:50%;transform:translateY(-50%);z-index:1;font-size:18px;font-weight:800;line-height:1;color:var(--text3)}
.bmc-st.done:not(:last-child)::after{color:var(--bull)}
/* "build my own strategy" is the headline option */
.bmc-b1.go{border-color:rgba(34,214,122,0.6);background:linear-gradient(135deg,#22D67A,#16a85c);color:#04140b;box-shadow:0 6px 20px rgba(34,214,122,0.3)}
#bm-mystrats.bmb-cta{box-shadow:0 0 0 1px rgba(34,214,122,0.35)}
/* the pointer: a still label in the page + a steady outline */
.bmc-here{display:flex;align-items:center;gap:6px;margin:6px 0 4px;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:800;letter-spacing:.01em;color:#96D0FF}
.bmc-target{outline:2px solid rgba(42,143,227,0.8)!important;outline-offset:3px}
#bmc-chip{position:fixed;left:50%;transform:translateX(-50%);z-index:8000;display:none;border:1px solid rgba(42,143,227,0.6);background:var(--blue);color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:800;padding:9px 16px;border-radius:22px;box-shadow:0 8px 24px rgba(0,0,0,0.5);cursor:pointer;white-space:nowrap;max-width:calc(100vw - 24px);overflow:hidden;text-overflow:ellipsis}
#bmc-chip.on{display:block}
#bmc-chip.up{bottom:auto!important;top:12px}
@media (max-width:640px){
  .bmc-card{padding:12px}
  .bmc-path{gap:4px}.bmc-st{padding:6px 2px}.bmc-st span{font-size:10px}
  .bmc-tx b{font-size:16px}
  .bmc-b1,.bmc-b2{flex:1 1 100%}
  .bmc-line .bmc-b1,.bmc-line .bmc-b2{flex:1 1 auto}
}`;
  document.head.appendChild(css);

  return { paint, hide, mark, nav, top, go, useStyle, toPanel, toFire, toTake, toPending, rulesFor, focusSearch, tour };
})();
