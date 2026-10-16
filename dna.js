// ══════════════════════════════════════════════════════
// BLUE MAC — MY TRADING DNA (window.BMD)
// Step 1 of the personal trade idea generator (16 Oct 2026):
// the member tells Blue Mac what THEY trade — concepts, markets, sessions,
// entry chart. Later steps build Quick Ideas from these picks.
//
//   BMD.get()      → { v, concepts[], instr[], sessions[], tfs[], at } or null
//   BMD.open()     opens the picker (also from the card on uTrade Ideas)
//   BMD.paint()    redraws the card (profile.js calls it after a sync)
//   BMD.CONCEPTS   the concept list (ids are used by the Quick Idea blocks later)
//
// Stored in localStorage['bm_dna_v1'] — synced per member by profile.js (BMS.SYNC).
// ══════════════════════════════════════════════════════
window.BMD = (function(){
  const KEY = 'bm_dna_v1';
  const MAX = { concepts:5, instr:5, tfs:2 };

  // id · name · one-liner · Examples card for the diagram · group
  const CONCEPTS = [
    ['ob',       'Order Blocks',          'The last opposite candle before a strong move',        'smc-ob-bull',                    'Smart Money'],
    ['fvg',      'Fair Value Gaps',       'Imbalance price tends to come back and fill',          'smc-fvg-bull',                   'Smart Money'],
    ['sweep',    'Liquidity Sweeps',      'Stops get taken, then price reverses',                 'smc-sweep',                      'Smart Money'],
    ['structure','BOS / CHoCH',           'Breaks of structure and changes of character',         'smc-choch',                      'Smart Money'],
    ['pd',       'Premium & Discount',    'Buy cheap, sell expensive inside the range',           'smc-pd',                         'Smart Money'],
    ['sr',       'Support & Resistance',  'Levels price has respected before',                    'ex-support-and-resistance',      'Classic'],
    ['ma',       '50 / 200 MAs',          'Trend direction and pullbacks to the moving averages', 'ex-ma-stack-50-vs-200',          'Classic'],
    ['fib',      'Fib Golden Pocket',     'Pullbacks into the 0.618–0.65 zone',                   'fib-golden',                     'Classic'],
    ['patterns', 'Chart Patterns',        'Head & shoulders, double tops, flags, wedges',         'pat-hs',                         'Classic'],
    ['candles',  'Candlestick Signals',   'Engulfing, pin bars, stars at key levels',             'ex-bullish-candlestick-signals', 'Classic'],
    ['rsi',      'RSI & Divergence',      'Momentum fading against the move',                     'ind-rsi-bull-div',               'Indicators'],
    ['vwap',     'VWAP',                  'Where the day’s volume says fair price is',       'ind-vwap',                       'Indicators'],
    ['keyrange', 'Key Range',             'Blue Mac’s session range: Key Break and Key Retest', 'mgt-keyrange',                'Sessions']
  ];
  const TFS = [['1m','Seconds to minutes'],['5m','Quick scalps'],['15m','Session trades'],['H1','Intraday'],['H4','Multi-day'],['D1','Swing & position']];
  const STEPS = [
    { id:'concepts', t:'What do you trade?',           s:'Pick the concepts you actually use. Up to 5. Tap the picture to learn one.' },
    { id:'instr',    t:'What markets?',                s:'The instruments you watch most. Up to 5.' },
    { id:'sessions', t:'When do you trade?',           s:'The sessions you can actually be at your screen for. Times are SAST, today.' },
    { id:'tfs',      t:'Which chart do you enter on?', s:'The chart you pull the trigger on. Up to 2.' }
  ];
  const STYLE_NAME = { scalp:'Scalp', day:'Day Trade', swing:'Swing', position:'Position', key:'Blue Mac Key' };

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  function get(){ try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); return d && d.concepts ? d : null; } catch(e){ return null; } }
  function put(d){ try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e){} }

  let st = null;   // picker state while open

  // ── Picker ──
  function open(){
    const d = get();
    st = { step:0, concepts:(d && d.concepts || []).slice(), instr:(d && d.instr || []).slice(),
           sessions:(d && d.sessions || []).slice(), tfs:(d && d.tfs || []).slice(), done:false };
    let ov = document.getElementById('bmd-ov');
    if(!ov){
      ov = document.createElement('div'); ov.id = 'bmd-ov'; ov.className = 'bmd-ov';
      ov.onclick = e => { if(e.target === ov) close(); };
      document.body.appendChild(ov);
    }
    ov.classList.add('on'); document.body.style.overflow = 'hidden'; document.body.classList.add('bmd-open');
    draw();
  }
  function close(){
    const ov = document.getElementById('bmd-ov'); if(ov) ov.classList.remove('on');
    document.body.style.overflow = ''; document.body.classList.remove('bmd-open'); st = null;
  }

  function toggle(list, v){
    const a = st[list], i = a.indexOf(v);
    if(i >= 0) a.splice(i, 1);
    else if(!MAX[list] || a.length < MAX[list]) a.push(v);
    draw(true);
  }
  function next(){
    if(!st[STEPS[st.step].id].length) return;
    if(st.step < STEPS.length - 1){ st.step++; draw(); return; }
    put({ v:1, concepts:st.concepts, instr:st.instr, sessions:st.sessions, tfs:st.tfs, at:new Date().toISOString() });
    st.done = true; draw(); paint();
  }
  function back(){ if(st.step > 0){ st.step--; draw(); } }

  function draw(same){
    const ov = document.getElementById('bmd-ov'); if(!ov || !st) return;
    const body = ov.querySelector('.bmd-body'), keep = same && body ? body.scrollTop : 0;
    ov.innerHTML = `<div class="bmd-box" role="dialog" aria-modal="true" aria-label="My Trading DNA">${st.done ? doneHTML() : stepHTML()}</div>`;
    if(same){ const b = ov.querySelector('.bmd-body'); if(b) b.scrollTop = keep; }
  }

  function head(kicker, title, sub){
    return `<div class="bmd-head"><div><div class="bmd-kicker">${kicker}</div><div class="bmd-title">${title}</div>${sub ? `<div class="bmd-sub">${sub}</div>` : ''}</div>
      <button class="bmd-x" onclick="BMD.close()" aria-label="Close">✕</button></div>`;
  }

  function stepHTML(){
    const S = STEPS[st.step], picked = st[S.id];
    const dots = STEPS.map((x, i) => `<i class="${i < st.step ? 'done' : i === st.step ? 'on' : ''}"></i>`).join('');
    let inner = '';
    if(S.id === 'concepts') inner = conceptsHTML();
    else if(S.id === 'instr') inner = instrHTML();
    else if(S.id === 'sessions') inner = sessionsHTML();
    else inner = tfsHTML();
    const max = MAX[S.id];
    const count = max ? `${picked.length}/${max} picked` : `${picked.length} picked`;
    const last = st.step === STEPS.length - 1;
    return `${head(`🧬 My Trading DNA · ${st.step + 1} of ${STEPS.length}`, S.t, S.s)}
      <div class="bmd-dots">${dots}</div>
      <div class="bmd-body">${inner}</div>
      <div class="bmd-foot">
        ${st.step > 0 ? `<button class="ut-back" onclick="BMD.back()">← Back</button>` : '<span></span>'}
        <span class="bmd-count">${count}</span>
        <button class="ut-next" onclick="BMD.next()" ${picked.length ? '' : 'disabled'}>${picked.length ? (last ? 'Save my DNA ✓' : 'Next →') : 'Pick at least 1'}</button>
      </div>`;
  }

  function diagram(ref){
    try { return window.UT && UT.D && UT.D.ref ? UT.D.ref(ref) : ''; } catch(e){ return ''; }
  }
  function conceptsHTML(){
    const groups = [...new Set(CONCEPTS.map(c => c[4]))];
    const full = st.concepts.length >= MAX.concepts;
    return groups.map(g => `<div class="bmd-group">${g}</div><div class="bmd-grid">` +
      CONCEPTS.filter(c => c[4] === g).map(([id, name, sub, ref]) => {
        const on = st.concepts.includes(id), dg = diagram(ref);
        return `<div class="bmd-card${on ? ' on' : ''}${!on && full ? ' off' : ''}" role="button" tabindex="0" aria-pressed="${on}"
            onclick="BMD.toggle('concepts','${id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();BMD.toggle('concepts','${id}')}">
          <span class="bmd-tick">${on ? '✓' : ''}</span>
          ${dg ? `<div class="bmd-dg" onclick="event.stopPropagation();UT.learn('${ref}')" title="Learn this in Examples">${dg}</div>` : ''}
          <div class="bmd-name">${esc(name)}</div><div class="bmd-line">${esc(sub)}</div>
        </div>`; }).join('') + `</div>`).join('');
  }
  function chips(list, items){
    const full = MAX[list] && st[list].length >= MAX[list];
    return `<div class="bmd-chips">${items.map(([v, label, small]) => { const on = st[list].includes(v);
      return `<button class="bmd-chip${on ? ' on' : ''}${!on && full ? ' off' : ''}" aria-pressed="${on}" onclick="BMD.toggle('${list}','${v}')">
        <b>${esc(label)}</b>${small ? `<span>${esc(small)}</span>` : ''}</button>`; }).join('')}</div>`;
  }
  function instrHTML(){
    const groups = (window.UT && UT.INSTR) || [];
    return groups.map(([g, list]) => `<div class="bmd-group">${esc(g)}</div>` + chips('instr', list.map(([sym, nick]) => [sym, sym, nick]))).join('');
  }
  function sessionsHTML(){
    let o = null; try { o = UT.sessions(); } catch(e){}
    const t = k => o ? `Opens ${o.hm(o.opens[k])} SAST` : '';
    return chips('sessions', [['asia','Asia (Tokyo)', t('asia')], ['london','London', t('london')], ['ny','New York', t('ny')]]) +
      `<div class="bmd-note">London and New York times move when Europe and the US change their clocks. Blue Mac adjusts them for you.</div>`;
  }
  function tfsHTML(){ return chips('tfs', TFS.map(([v, s]) => [v, v, s])); }

  // closest existing full-analysis style, so the member has somewhere to go today
  function closestStyle(d){
    d = d || get(); if(!d) return null;
    const order = TFS.map(x => x[0]);
    const lo = Math.min(...(d.tfs.length ? d.tfs : ['15m']).map(t => order.indexOf(t)));
    if(d.concepts.includes('keyrange') && lo <= 2) return 'key';
    if(lo <= 1) return 'scalp';
    if(lo <= 3) return 'day';
    if(lo === 4) return 'swing';
    return 'position';
  }
  const conceptName = id => (CONCEPTS.find(c => c[0] === id) || [, id])[1];

  function doneHTML(){
    const d = get(), sty = closestStyle(d);
    return `${head('🧬 Saved', 'Your Trading DNA', '')}
      <div class="bmd-body">
        ${summaryHTML(d)}
        <div class="bmd-next">
          <b>What happens next</b>
          <p>Quick Ideas built only from your concepts are coming. A handful of questions about <em>your</em> setup, then a trade plan.</p>
          <p>Until then, the full analysis closest to how you trade is <b>${STYLE_NAME[sty]}</b>.</p>
        </div>
      </div>
      <div class="bmd-foot">
        <button class="ut-back" onclick="BMD.open()">✎ Change</button>
        <span></span>
        <button class="ut-next" onclick="BMD.go('${sty}')">Open ${STYLE_NAME[sty]} →</button>
      </div>`;
  }
  function summaryHTML(d){
    const row = (label, arr, fmt) => `<div class="bmd-sum-r"><span>${label}</span><div>${arr.map(x => `<i>${esc(fmt ? fmt(x) : x)}</i>`).join('')}</div></div>`;
    const sess = { asia:'Asia', london:'London', ny:'New York' };
    return `<div class="bmd-sum">${row('Concepts', d.concepts, conceptName)}${row('Markets', d.instr)}${row('Sessions', d.sessions, x => sess[x] || x)}${row('Entry chart', d.tfs)}</div>`;
  }

  function go(sty){
    close();
    try {
      if(typeof goPage === 'function' && !document.getElementById('pg-checklist').classList.contains('on')){
        const b = document.querySelector(`.nav-item[onclick*="goPage('checklist'"]`); goPage('checklist', b);
      }
      const tab = document.querySelector('.style-tab.' + sty);
      if(tab && typeof setStyle === 'function') setStyle(sty, tab);
      const p = document.getElementById('guided-panel'); if(p) p.scrollIntoView({ behavior:'smooth', block:'start' });
    } catch(e){}
  }

  // ── Card on the uTrade Ideas page ──
  function paint(){
    const anchor = document.getElementById('guided-toggle-bar'); if(!anchor) return;
    let el = document.getElementById('bm-dna');
    if(!el){ el = document.createElement('div'); el.id = 'bm-dna'; anchor.parentNode.insertBefore(el, anchor); }
    const d = get();
    if(!d){
      el.className = 'bmd-cta';
      el.innerHTML = `<div class="bmd-cta-i">🧬</div>
        <div class="bmd-cta-t"><b>Build your Trading DNA</b><span>Tell Blue Mac what you trade: order blocks, FVGs, fibs, Key Range… Takes 60 seconds.</span></div>
        <button class="ut-next" onclick="BMD.open()">Build my DNA →</button>`;
      return;
    }
    const tags = d.concepts.map(conceptName).concat(d.instr, d.tfs);
    el.className = 'bmd-bar';
    el.innerHTML = `<span class="bmd-bar-i">🧬</span><span class="bmd-bar-l">My DNA</span>
      <span class="bmd-bar-tags">${tags.map(t => `<i>${esc(t)}</i>`).join('')}</span>
      <button class="bmd-bar-e" onclick="BMD.open()">Edit</button>`;
  }

  document.addEventListener('keydown', e => { if(e.key === 'Escape' && st) close(); });
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint); else paint();

  // ── Styles ──
  const css = document.createElement('style');
  css.textContent = `
.bmd-cta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 12px;padding:16px 18px;border-radius:16px;border:1px solid rgba(42,143,227,0.4);background:linear-gradient(135deg,rgba(42,143,227,0.12),rgba(34,214,122,0.04))}
.bmd-cta-i{font-size:28px}
.bmd-cta-t{flex:1;min-width:200px;display:flex;flex-direction:column;gap:3px}
.bmd-cta-t b{font-family:'Outfit',sans-serif;font-size:17px;color:var(--text)}
.bmd-cta-t span{font-size:13px;color:var(--text2);line-height:1.5}
.bmd-bar{display:flex;align-items:center;gap:8px;margin:0 0 12px;padding:9px 12px;border-radius:12px;border:1px solid var(--border2);background:var(--bg3)}
.bmd-bar-l{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);font-weight:700;flex-shrink:0}
.bmd-bar-tags{display:flex;gap:5px;overflow-x:auto;flex:1;scrollbar-width:none}
.bmd-bar-tags::-webkit-scrollbar{display:none}
.bmd-bar-tags i,.bmd-sum-r i{font-style:normal;white-space:nowrap;font-size:11.5px;padding:3px 9px;border-radius:20px;background:var(--bg4);border:1px solid var(--border);color:var(--text2)}
.bmd-bar-e{flex-shrink:0;padding:5px 12px;border-radius:8px;border:1px solid rgba(42,143,227,0.4);background:transparent;color:var(--blue);font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif}
.bmd-ov{position:fixed;inset:0;z-index:8990;background:rgba(0,0,0,0.75);backdrop-filter:blur(4px);display:none;align-items:center;justify-content:center;padding:20px}
.bmd-ov.on{display:flex}
body.bmd-open #bmt-help{display:none!important}
.bmd-box{width:100%;max-width:760px;max-height:92vh;display:flex;flex-direction:column;background:var(--bg2);border:1px solid var(--border2);border-radius:18px;overflow:hidden;animation:rise .25s ease both}
.bmd-head{display:flex;justify-content:space-between;gap:12px;padding:18px 20px 10px}
.bmd-kicker{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--blue);font-weight:700}
.bmd-title{font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;color:var(--text);margin-top:3px}
.bmd-sub{font-size:13px;color:var(--text2);margin-top:4px;line-height:1.5}
.bmd-x{flex-shrink:0;width:34px;height:34px;border-radius:10px;border:1px solid var(--border2);background:transparent;color:var(--text2);font-size:15px;cursor:pointer}
.bmd-dots{display:flex;gap:6px;padding:0 20px 10px}
.bmd-dots i{flex:1;height:4px;border-radius:4px;background:var(--bg5)}
.bmd-dots i.done{background:rgba(42,143,227,0.5)}.bmd-dots i.on{background:var(--blue)}
.bmd-body{overflow-y:auto;padding:4px 20px 16px;flex:1;-webkit-overflow-scrolling:touch}
.bmd-group{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);margin:12px 0 8px}
.bmd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.bmd-card{position:relative;text-align:left;border:1px solid var(--border2);background:var(--bg4);border-radius:14px;padding:10px;cursor:pointer;display:flex;flex-direction:column;gap:5px;transition:border-color .15s,background .15s;outline:none}
.bmd-card:focus-visible,.bmd-chip:focus-visible{box-shadow:0 0 0 2px var(--blue)}
.bmd-card.on{border-color:var(--blue);background:rgba(42,143,227,0.1);box-shadow:0 0 0 1px var(--blue)}
.bmd-card.off,.bmd-chip.off{opacity:.45}
.bmd-tick{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:6px;border:1.5px solid var(--border2);background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#050505;z-index:1}
.bmd-card.on .bmd-tick{background:var(--blue);border-color:var(--blue)}
.bmd-dg{border-radius:9px;background:rgba(0,0,0,0.35);padding:3px;display:flex;justify-content:center;max-height:96px;overflow:hidden;cursor:zoom-in}
.bmd-dg svg{max-width:100%!important;max-height:90px;height:auto}
.bmd-name{font-weight:700;font-size:13.5px;color:var(--text);line-height:1.3;padding-right:24px}
.bmd-line{font-size:11.5px;color:var(--text2);line-height:1.45}
.bmd-chips{display:flex;flex-wrap:wrap;gap:8px}
.bmd-chip{display:flex;flex-direction:column;align-items:flex-start;gap:1px;padding:9px 14px;border-radius:12px;border:1px solid var(--border2);background:var(--bg4);color:var(--text);cursor:pointer;font-family:'DM Sans',sans-serif;min-width:96px}
.bmd-chip b{font-size:13.5px}.bmd-chip span{font-size:11px;color:var(--text3)}
.bmd-chip.on{border-color:var(--blue);background:rgba(42,143,227,0.12);box-shadow:0 0 0 1px var(--blue)}
.bmd-chip.on span{color:var(--text2)}
.bmd-note{margin-top:12px;font-size:12px;color:var(--text3);line-height:1.5}
.bmd-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 20px;border-top:1px solid var(--border);background:var(--bg3)}
.bmd-foot .ut-next[disabled]{background:var(--bg4);color:var(--text3);border-color:var(--border);box-shadow:none;cursor:not-allowed}
.bmd-count{font-family:'DM Mono',monospace;font-size:11px;color:var(--text3)}
.bmd-sum{display:flex;flex-direction:column;gap:10px;padding:14px;border-radius:14px;background:var(--bg3);border:1px solid var(--border)}
.bmd-sum-r{display:flex;gap:10px;align-items:flex-start}
.bmd-sum-r>span{width:86px;flex-shrink:0;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);padding-top:5px}
.bmd-sum-r>div{display:flex;flex-wrap:wrap;gap:5px}
.bmd-next{margin-top:14px;padding:14px;border-radius:14px;border:1px dashed rgba(42,143,227,0.35);background:rgba(42,143,227,0.04);font-size:13.5px;color:var(--text2);line-height:1.6}
.bmd-next b{color:var(--text)}.bmd-next p{margin-top:6px}
@media (max-width:640px){
  .bmd-ov{padding:0;align-items:stretch}
  .bmd-box{max-width:none;max-height:none;height:100%;border-radius:0;border:none}
  .bmd-head{padding:14px 16px 8px}.bmd-title{font-size:19px}
  .bmd-dots,.bmd-body{padding-left:16px;padding-right:16px}
  .bmd-grid{grid-template-columns:1fr 1fr}
  .bmd-dg{max-height:78px}.bmd-dg svg{max-height:72px}
  .bmd-foot{padding:10px 16px calc(10px + env(safe-area-inset-bottom))}
  .bmd-cta .ut-next{flex:1 1 100%;width:100%}
}`;
  document.head.appendChild(css);

  return { get, open, close, toggle, next, back, go, paint, closestStyle, CONCEPTS };
})();
