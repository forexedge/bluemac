// ══════════════════════════════════════════════════════
// BLUE MAC — STRATEGY BUILDER + MY STRATEGIES (window.BMB)
// Personal trade ideas, step 3 (16 Oct 2026).
//
// Members build up to 3 strategies of their own from the toolbox (quick.js):
//   Start from (blank / my DNA / a Blue Mac style) → Direction → Location → Trigger
//   → Extras + my own rules → Name & rules (entry chart, markets, sessions, stricter R:R)
// Each saved strategy shows on uTrade Ideas as a "My strategies" tab and runs on
// the same uTrade engine (BMQ.build(strategy, id)) — grades, prices, risk rules, AI.
//
//   BMB.list()          saved strategies
//   BMB.open(id)        run one in uTrade Ideas
//   BMB.edit(id?)       open the builder (no id = new strategy)
//   BMB.paint()         redraw the "My strategies" row (profile.js calls it after a sync)
//
// Stored in localStorage['bm_strats_v1'] = { v:1, list:[…] } — synced per member by profile.js.
// ══════════════════════════════════════════════════════
window.BMB = (function(){
  if(!window.UT || !window.BMQ) return null;
  const KEY = 'bm_strats_v1', MAX = 3, IDS = ['my1', 'my2', 'my3'];
  const T = BMQ.TOOLS;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  // ── Storage ──
  function list(){ try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); return d && Array.isArray(d.list) ? d.list.filter(s => s && IDS.includes(s.id)) : []; } catch(e){ return []; } }
  function saveList(l){ try { localStorage.setItem(KEY, JSON.stringify({ v:1, list:l })); } catch(e){} }
  const get = id => list().find(s => s.id === id) || null;
  // the page's current style (S is a top-level const in index.html, not on window)
  const curStyle = () => { try { return S.style; } catch(e){ return null; } };

  // ── Blue Mac styles as starting points (their tools, close to each style's logic) ──
  const STARTERS = {
    scalp:    { label:'Scalp', name:'My Scalp', tfs:['5m'], sessions:['london','ny'], dir:['structure','ema50'], loc:['ob','fvg','sr'], trig:['choch','engulf'], extra:['sweep','pd','session','vwap','rsi_div','round'] },
    day:      { label:'Day Trade', name:'My Day Trade', tfs:['15m'], sessions:['london','ny'], dir:['structure'], loc:['fib','ob','fvg','sr'], trig:['choch','engulf'], extra:['bos','pd','round'] },
    swing:    { label:'Swing', name:'My Swing', tfs:['H4'], sessions:[], dir:['structure','ma'], loc:['snd','ob','fib','sr'], trig:['choch','engulf','pin'], extra:['round','rsi_div'] },
    position: { label:'Position', name:'My Position', tfs:['D1'], sessions:[], dir:['ma','structure'], loc:['pat_hs','pat_double','ma50','sr'], trig:['engulf','pin'], extra:['dxy'] },
    key:      { label:'Blue Mac Key', name:'My Key Range', tfs:['15m'], sessions:['asia','london','ny'], dir:['structure'], loc:[], trig:['engulf','choch'], extra:['keyrange','session'] }
  };

  const LAYER = {
    dir:   { t:'Direction', q:'How do you find the direction?', s:'The first one you tap is your main tool — it decides the bias. Up to 3. Tap again to remove.', min:1, max:3, order:true },
    loc:   { t:'Location', q:'Where do you enter?', s:'Your zones and levels. They become ONE question. Up to 6 — or none if you enter on the trigger alone.', min:0, max:6 },
    trig:  { t:'Trigger', q:'What tells you to pull the trigger?', s:'Your confirmation candle or signal. The order you tap is the order they show. Up to 4.', min:1, max:4, order:true },
    extra: { t:'Extras', q:'Anything else you check?', s:'Conditions get their own question. Confirmations are quick ticks. Up to 8.', min:0, max:8 }
  };
  const STEPS = ['start', 'dir', 'loc', 'trig', 'extra', 'rules'];
  const TFS = [['1m','Scalps in seconds'],['5m','Quick scalps'],['15m','Session trades'],['H1','Intraday'],['H4','Multi-day swings'],['D1','Weeks to months']];
  const SESS = [['asia','Asia (Tokyo)'], ['london','London'], ['ny','New York']];

  let st = null;          // builder state while open
  const PICS = {};
  const pic = id => PICS[id] || (PICS[id] = BMQ.pic(id));

  // ── Open / close ──
  function edit(id){
    const cur = id ? get(id) : null;
    if(!cur && list().length >= MAX){ alert(`You can keep ${MAX} strategies. Edit or delete one to make room.`); return; }
    st = { id: cur ? cur.id : IDS.find(x => !list().some(s => s.id === x)), editing: !!cur, step: cur ? 1 : 0, del: false,
           s: cur ? JSON.parse(JSON.stringify(cur)) : blank() };
    let ov = document.getElementById('bmb-ov');
    if(!ov){ ov = document.createElement('div'); ov.id = 'bmb-ov'; ov.className = 'bmd-ov'; ov.onclick = e => { if(e.target === ov) close(); }; document.body.appendChild(ov); }
    ov.classList.add('on'); document.body.style.overflow = 'hidden'; document.body.classList.add('bmd-open');
    draw();
  }
  function close(){
    const ov = document.getElementById('bmb-ov'); if(ov) ov.classList.remove('on');
    document.body.style.overflow = ''; document.body.classList.remove('bmd-open'); st = null;
  }
  function blank(){
    const d = window.BMD && BMD.get();
    return { name:'', tfs: d && d.tfs && d.tfs.length ? d.tfs.slice() : ['15m'], instr: d ? (d.instr || []).slice() : [], sessions: d ? (d.sessions || []).slice() : [],
             dir:[], loc:[], trig:[], extra:[], custom:[], rr:null, from:'blank' };
  }

  // ── Start from ──
  function start(kind, style){
    const keep = { tfs: st.s.tfs, instr: st.s.instr, sessions: st.s.sessions };
    if(kind === 'dna'){ const f = BMQ.fromDNA(); st.s = Object.assign(blank(), f, { name:'', from:'dna' }); }
    else if(kind === 'style'){ const x = STARTERS[style]; st.s = Object.assign(blank(), JSON.parse(JSON.stringify(x)), { instr: keep.instr, from:'style:' + style }); delete st.s.label; }
    else st.s = Object.assign(blank(), { from:'blank' });
    st.step = 1; draw();
  }

  // ── Picking tools ──
  function toggle(layer, id){
    const a = st.s[layer], i = a.indexOf(id);
    if(i >= 0) a.splice(i, 1); else if(a.length < LAYER[layer].max) a.push(id);
    draw(true);
  }
  function chip(field, v, max){
    const a = st.s[field], i = a.indexOf(v);
    if(i >= 0) a.splice(i, 1); else if(!max || a.length < max) a.push(v);
    draw(true);
  }
  function setRR(v){ st.s.rr = v === 'bm' ? null : [+v, +v + 1]; draw(true); }
  function addRule(){ if(st.s.custom.length < 3){ st.s.custom.push({ t:'', must:true }); draw(true); setTimeout(() => { const el = document.getElementById('bmb-rule-' + (st.s.custom.length - 1)); if(el) el.focus(); }, 30); } }
  function ruleText(i, v){ if(st.s.custom[i]) st.s.custom[i].t = v.slice(0, 120); }
  function ruleMust(i, v){ if(st.s.custom[i]){ st.s.custom[i].must = !!v; draw(true); } }
  function dropRule(i){ st.s.custom.splice(i, 1); draw(true); }
  function setName(v){ st.s.name = v.slice(0, 24); const b = document.getElementById('bmb-save'); if(b){ b.disabled = !v.trim(); b.textContent = v.trim() ? (st.editing ? 'Save changes ✓' : 'Save strategy ✓') : 'Name it to save'; } }

  // ── Navigation ──
  function canNext(){
    const k = STEPS[st.step];
    if(LAYER[k]) return st.s[k].length >= LAYER[k].min;
    if(k === 'rules') return !!st.s.name.trim() && st.s.tfs.length > 0;
    return true;
  }
  function next(){ if(!canNext()) return; if(st.step < STEPS.length - 1){ st.step++; draw(); } else save(); }
  function back(){ if(st.step > (st.editing ? 1 : 0)){ st.step--; draw(); } }
  // a step can be opened once every layer before it is valid (copied styles can jump straight to Rules)
  const okUpTo = i => STEPS.slice(1, i).every(k => !LAYER[k] || st.s[k].length >= LAYER[k].min);
  function goto(i){ if(i >= 1 && i < STEPS.length && (st.editing || i <= st.step || okUpTo(i))){ st.step = i; draw(); } }

  function save(){
    const s = BMQ.clean(st.s);
    const out = Object.assign({}, st.s, { dir:s.dir, loc:s.loc, trig:s.trig, extra:s.extra, custom:s.custom, tfs:s.tfs,
      name: st.s.name.trim(), id: st.id, updated: new Date().toISOString(), created: st.s.created || new Date().toISOString() });
    const l = list().filter(x => x.id !== st.id); l.push(out); l.sort((a, b) => IDS.indexOf(a.id) - IDS.indexOf(b.id));
    saveList(l);
    const id = st.id; close(); paint(); open(id);
  }
  function del(){
    if(!st.del){ st.del = true; draw(true); return; }
    saveList(list().filter(x => x.id !== st.id));
    const id = st.id; close();
    if(curStyle() === id) goStyle('scalp');
    paint();
  }

  // ── Running a strategy ──
  function open(id){
    const s = get(id); if(!s) return;
    BMQ.build(s, id);
    try {
      const pg = document.getElementById('pg-checklist');
      if(pg && !pg.classList.contains('on')){ const b = document.querySelector(`.nav-item[onclick*="goPage('checklist'"]`); if(typeof goPage === 'function') goPage('checklist', b); }
      setStyle(id, null);
      paint();
      const p = document.getElementById('guided-panel'); if(p) p.scrollIntoView({ behavior:'smooth', block:'start' });
    } catch(e){ console.warn('Blue Mac: could not open strategy', e); }
  }
  function goStyle(k){ const t = document.querySelector('.style-tab.' + k); if(t && typeof setStyle === 'function') setStyle(k, t); }
  // a style tab tapped → my-strategy chips lose their highlight
  function hookStyle(){
    const fn = window.setStyle; if(typeof fn !== 'function' || fn._bmb) return;
    const w = function(){ const r = fn.apply(this, arguments); try { paint(); } catch(e){} return r; };
    w._bmb = true; Object.keys(fn).forEach(k => w[k] = fn[k]); window.setStyle = w;
  }
  // register every saved strategy so a restored session / journal can find it
  function reload(){ const l = list(); const cur = curStyle(); l.forEach(s => { if(s.id !== cur) BMQ.build(s, s.id); }); const c = l.find(s => s.id === cur); if(c) BMQ.build(c, c.id); paint(); }

  // ══════════════════════════════════════════════════════
  // Drawing the builder
  // ══════════════════════════════════════════════════════
  function draw(same){
    const ov = document.getElementById('bmb-ov'); if(!ov || !st) return;
    const b = ov.querySelector('.bmd-body'), keep = same && b ? b.scrollTop : 0;
    // keep typed text when redrawing
    const nm = document.getElementById('bmb-name'); if(nm) st.s.name = nm.value.slice(0, 24);
    st.s.custom.forEach((c, i) => { const el = document.getElementById('bmb-rule-' + i); if(el) c.t = el.value.slice(0, 120); });
    const k = STEPS[st.step];
    ov.innerHTML = `<div class="bmd-box bmb-box" role="dialog" aria-modal="true" aria-label="Strategy builder">${head()}<div class="bmd-body">${
      k === 'start' ? startHTML() : LAYER[k] ? layerHTML(k) : rulesHTML()}</div>${foot()}</div>`;
    if(same){ const nb = ov.querySelector('.bmd-body'); if(nb) nb.scrollTop = keep; }
  }
  function head(){
    const k = STEPS[st.step], L = LAYER[k];
    const title = k === 'start' ? 'Build your strategy' : L ? L.q : 'Name it & set your rules';
    const sub = k === 'start' ? 'Pick your own tools in four layers. Blue Mac turns them into your personal uTrade Idea — same engine, same risk rules.' : L ? L.s : 'This is what shows on your uTrade Ideas page.';
    const dots = STEPS.slice(1).map((x, i) => `<button class="bmb-dot${i + 1 < st.step ? ' done' : i + 1 === st.step ? ' on' : ''}" onclick="BMB.goto(${i + 1})" ${st.editing || i + 1 <= st.step || okUpTo(i + 1) ? '' : 'disabled'}>${LAYER[x] ? LAYER[x].t : 'Rules'}</button>`).join('');
    return `<div class="bmd-head"><div><div class="bmd-kicker">🛠 ${st.editing ? 'Edit strategy' : 'Strategy builder'}${st.step ? ` · ${st.step} of ${STEPS.length - 1}` : ''}</div>
        <div class="bmd-title">${title}</div><div class="bmd-sub">${sub}</div></div>
        <button class="bmd-x" onclick="BMB.close()" aria-label="Close">✕</button></div>
      ${st.step ? `<div class="bmb-dots">${dots}</div>` : ''}`;
  }
  function foot(){
    const k = STEPS[st.step];
    if(k === 'start') return '';
    let pv = null; try { pv = BMQ.preview(st.s); } catch(e){}
    const n = pv ? pv.questions.length : 0;
    const info = LAYER[k] ? `${st.s[k].length}/${LAYER[k].max} picked` : '';
    const last = k === 'rules';
    const need = LAYER[k] && st.s[k].length < LAYER[k].min ? `Pick at least ${LAYER[k].min}` : last && !st.s.name.trim() ? 'Name it to save' : '';
    return `<div class="bmd-foot bmb-foot">
        ${st.step > (st.editing ? 1 : 0) ? `<button class="ut-back" onclick="BMB.back()">← Back</button>` : st.editing ? `<button class="ut-back bmb-del${st.del ? ' sure' : ''}" onclick="BMB.del()">${st.del ? 'Tap again to delete' : '🗑 Delete'}</button>` : '<span></span>'}
        <span class="bmb-meter"><b>${n}</b> questions${info ? ` · ${info}` : ''}</span>
        <button class="ut-next" id="${last ? 'bmb-save' : 'bmb-next'}" onclick="BMB.next()" ${canNext() ? '' : 'disabled'}>${need || (last ? (st.editing ? 'Save changes ✓' : 'Save strategy ✓') : 'Next →')}</button>
      </div>`;
  }

  function startHTML(){
    const d = window.BMD && BMD.get();
    const styleBtn = k => `<button class="bmb-start sm" onclick="BMB.start('style','${k}')"><b>${STARTERS[k].label}</b><span>${STARTERS[k].tfs[0]} entries · ${STARTERS[k].dir.concat(STARTERS[k].loc).slice(0, 3).map(i => T[i].name).join(', ')}${STARTERS[k].loc.length + STARTERS[k].dir.length > 3 ? '…' : ''}</span></button>`;
    return `<div class="bmb-starts">
        ${d ? `<button class="bmb-start hero" onclick="BMB.start('dna')"><i>🧬</i><b>Start from my Trading DNA</b><span>${esc((d.concepts || []).length)} concepts you picked · ${esc((d.tfs || []).join(' / '))} entries — tweak from there</span></button>` : ''}
        <button class="bmb-start${d ? '' : ' hero'}" onclick="BMB.start('blank')"><i>✏️</i><b>Start blank</b><span>Pick every tool yourself</span></button>
      </div>
      <div class="bmd-group">Or copy a Blue Mac style and make it yours</div>
      <div class="bmb-starts grid">${Object.keys(STARTERS).map(styleBtn).join('')}</div>
      <div class="bmd-note">Whatever you build, Blue Mac's risk rules always apply: engine-calculated prices, minimum R:R after the spread, Entry 2 inside the stop, and no trades around red news or after 3 losses.</div>`;
  }

  function layerHTML(layer){
    const L = LAYER[layer], picked = st.s[layer], full = picked.length >= L.max;
    const ids = Object.keys(T).filter(id => T[id].layer === layer);
    const groups = [...new Set(ids.map(id => layer === 'extra' ? (T[id].kind === 'cond' ? 'Conditions — their own question' : 'Confirmations — quick ticks') : T[id].group))];
    const card = id => {
      const t = T[id], i = picked.indexOf(id), on = i >= 0, ref = typeof t.pic === 'string' ? t.pic : null;
      return `<div class="bmd-card${on ? ' on' : ''}${!on && full ? ' off' : ''}" role="button" tabindex="0" aria-pressed="${on}" data-tool="${id}"
          onclick="BMB.toggle('${layer}','${id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();BMB.toggle('${layer}','${id}')}">
        <span class="bmd-tick">${on ? (L.order ? i + 1 : '✓') : ''}</span>
        ${on && L.order && i === 0 && layer === 'dir' ? '<span class="bmb-main">MAIN</span>' : ''}
        <div class="bmd-dg"${ref ? ` onclick="event.stopPropagation();UT.learn('${ref}')" title="Learn this in Examples"` : ''}>${pic(id)}</div>
        <div class="bmd-name">${esc(t.name)}</div><div class="bmd-line">${esc(t.line)}</div>
      </div>`;
    };
    let html = groups.map(g => `<div class="bmd-group">${esc(g)}</div><div class="bmd-grid">${ids.filter(id => (layer === 'extra' ? (T[id].kind === 'cond' ? 'Conditions — their own question' : 'Confirmations — quick ticks') : T[id].group) === g).map(card).join('')}</div>`).join('');
    if(layer === 'loc' && !picked.length) html = `<div class="bmd-note bmb-tip">No location = you enter at market as soon as the trigger fires. Most traders pick at least one zone.</div>` + html;
    if(layer === 'extra') html += ownRulesHTML();
    return html;
  }
  function ownRulesHTML(){
    const R = st.s.custom;
    return `<div class="bmd-group">My own rules — in your words</div>
      <div class="bmb-rules">${R.map((c, i) => `<div class="bmb-rule">
          <input id="bmb-rule-${i}" type="text" maxlength="120" placeholder="e.g. Price above the Asian high" value="${esc(c.t)}" oninput="BMB.ruleText(${i}, this.value)">
          <div class="bmb-seg"><button class="${c.must ? 'on' : ''}" onclick="BMB.ruleMust(${i}, 1)">Must have</button><button class="${!c.must ? 'on' : ''}" onclick="BMB.ruleMust(${i}, 0)">Nice to have</button></div>
          <button class="bmb-x" onclick="BMB.dropRule(${i})" aria-label="Remove rule">✕</button>
        </div>`).join('')}
        ${R.length < 3 ? `<button class="ut-more" onclick="BMB.addRule()">＋ Add my own rule</button>` : ''}
        <div class="bmd-note">A <b>must have</b> rule gets its own question — if it isn't true, the idea waits on your Watchlist. <b>Nice to have</b> adds to the score.</div>
      </div>`;
  }

  function rulesHTML(){
    const s = st.s, base = BMQ.RR_OF((s.tfs.slice().sort((a, b) => TFS.findIndex(x => x[0] === a) - TFS.findIndex(x => x[0] === b))[0]) || '15m');
    let pv = null; try { pv = BMQ.preview(s); } catch(e){}
    const rrNow = s.rr ? s.rr[0] : 'bm';
    const chips = (field, items, max) => `<div class="bmd-chips">${items.map(([v, label, small]) => { const on = s[field].includes(v), full = max && s[field].length >= max;
      return `<button class="bmd-chip${on ? ' on' : ''}${!on && full ? ' off' : ''}" aria-pressed="${on}" onclick="BMB.chip('${field}','${v}',${max || 0})"><b>${esc(label)}</b>${small ? `<span>${esc(small)}</span>` : ''}</button>`; }).join('')}</div>`;
    const all = [].concat(...UT.INSTR.map(g => g[1]));
    const nm = id => T[id] ? T[id].name : id;
    return `<label class="bmb-lbl" for="bmb-name">Strategy name</label>
      <input id="bmb-name" class="bmb-input" type="text" maxlength="24" placeholder="e.g. Gold Sniper" value="${esc(s.name)}" oninput="BMB.setName(this.value)" autocomplete="off">
      <div class="bmd-group">Entry chart <small>(up to 2 — the bias chart is picked for you)</small></div>
      ${chips('tfs', TFS.map(([v, x]) => [v, v, `${x} · bias ${BMQ.BIAS_OF[v]}`]), 2)}
      <div class="bmd-group">Your markets <small>(listed first — up to 5)</small></div>
      ${chips('instr', all.map(([sym, nick]) => [sym, sym, nick]), 5)}
      <div class="bmd-group">Sessions you trade</div>
      ${chips('sessions', SESS)}
      <div class="bmd-group">Minimum risk-to-reward for TP1</div>
      <div class="bmd-chips">${['bm', 3, 4, 5].map(v => { const on = String(rrNow) === String(v), lower = v !== 'bm' && v <= base[0];
        return `<button class="bmd-chip${on ? ' on' : ''}${lower ? ' off' : ''}" onclick="BMB.setRR('${v}')" ${lower ? 'disabled' : ''}><b>${v === 'bm' ? `Blue Mac minimum` : `1:${v}`}</b><span>${v === 'bm' ? `1:${base[0]} / 1:${base[1]} for ${esc(s.tfs[0] || '15m')}` : `TP2 1:${v + 1}+`}</span></button>`; }).join('')}</div>
      <div class="bmd-note">You can make it stricter, never looser than Blue Mac's minimum.</div>
      <div class="bmb-sum">
        <div class="bmb-sum-h">Your uTrade Idea will ask <b>${pv ? pv.questions.length : '—'} questions</b>${pv ? ` · ${esc(pv.biasTF)} bias → ${esc(pv.entryTF)} entry · TP1 ≥ 1:${pv.minRR[0]}` : ''}</div>
        ${[['Direction', s.dir], ['Location', s.loc], ['Trigger', s.trig], ['Extras', s.extra]].map(([l, a], i) => `<div class="bmd-sum-r"><span>${l}</span><div>${a.length ? a.map(id => `<i>${esc(nm(id))}</i>`).join('') : '<em>none</em>'}<button class="bmb-edit" onclick="BMB.goto(${i + 1})">edit</button></div></div>`).join('')}
        ${s.custom.filter(c => c.t.trim()).length ? `<div class="bmd-sum-r"><span>Own rules</span><div>${s.custom.filter(c => c.t.trim()).map(c => `<i>${c.must ? '★ ' : ''}${esc(c.t)}</i>`).join('')}</div></div>` : ''}
        ${pv ? `<div class="bmb-qs">${pv.questions.map((q, i) => `<span>${i + 1}. ${esc(q)}</span>`).join('')}</div>` : ''}
      </div>`;
  }

  // ══════════════════════════════════════════════════════
  // "My strategies" row on uTrade Ideas
  // ══════════════════════════════════════════════════════
  function paint(){
    const anchor = document.getElementById('bm-dna') || document.getElementById('guided-toggle-bar'); if(!anchor) return;
    let el = document.getElementById('bm-mystrats');
    if(!el){ el = document.createElement('div'); el.id = 'bm-mystrats'; anchor.parentNode.insertBefore(el, anchor); }
    const l = list(), cur = curStyle();
    if(!l.length){
      el.className = 'bmb-cta';
      el.innerHTML = `<div class="bmb-cta-i">🛠</div>
        <div class="bmb-cta-t"><b>Build your own strategy</b><span>Trendlines, order blocks, patterns, MACD… pick the tools YOU trade. Blue Mac turns them into your own uTrade Idea.</span></div>
        <button class="ut-next" onclick="BMB.edit()">Build my strategy →</button>`;
      return;
    }
    el.className = 'bmb-row';
    el.innerHTML = `<div class="bmb-row-h"><span>🛠 My strategies</span>${l.length < MAX ? `<button onclick="BMB.edit()">＋ New</button>` : ''}</div>
      <div class="bmb-tabs">${l.map(s => { let n = 0; try { n = BMQ.preview(s).questions.length; } catch(e){}
        return `<div class="bmb-tab${cur === s.id ? ' on' : ''}" role="button" tabindex="0" onclick="BMB.open('${s.id}')" onkeydown="if(event.key==='Enter'){BMB.open('${s.id}')}">
          <b>${esc(s.name)}</b><span>${esc((s.tfs || []).join(' / '))} · ${n} questions</span>
          <button class="bmb-tab-e" onclick="event.stopPropagation();BMB.edit('${s.id}')" aria-label="Edit ${esc(s.name)}">✎</button></div>`; }).join('')}</div>`;
  }

  // ── Styles ──
  const css = document.createElement('style');
  css.textContent = `
.bmb-cta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 12px;padding:16px 18px;border-radius:16px;border:1px solid rgba(34,214,122,0.35);background:linear-gradient(135deg,rgba(34,214,122,0.1),rgba(42,143,227,0.06))}
.bmb-cta-i{font-size:28px}
.bmb-cta-t{flex:1;min-width:200px;display:flex;flex-direction:column;gap:3px}
.bmb-cta-t b{font-family:'Outfit',sans-serif;font-size:17px;color:var(--text)}
.bmb-cta-t span{font-size:13px;color:var(--text2);line-height:1.5}
.bmb-row{margin:0 0 12px;padding:12px;border-radius:16px;border:1px solid var(--border2);background:var(--bg3)}
.bmb-row-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.bmb-row-h span{font-family:'DM Mono',monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--bull);font-weight:700}
.bmb-row-h button{padding:5px 12px;border-radius:8px;border:1px solid rgba(34,214,122,0.4);background:transparent;color:var(--bull);font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif}
.bmb-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.bmb-tab{position:relative;text-align:left;padding:10px 34px 10px 12px;border-radius:12px;border:1px solid var(--border2);background:var(--bg4);cursor:pointer;display:flex;flex-direction:column;gap:2px;outline:none}
.bmb-tab:focus-visible{box-shadow:0 0 0 2px var(--bull)}
.bmb-tab b{font-family:'Outfit',sans-serif;font-size:14.5px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bmb-tab span{font-family:'DM Mono',monospace;font-size:10px;color:var(--text3)}
.bmb-tab.on{border-color:var(--bull);background:rgba(34,214,122,0.08);box-shadow:0 0 0 1px var(--bull)}
.bmb-tab-e{position:absolute;top:8px;right:8px;width:24px;height:24px;border-radius:7px;border:1px solid var(--border2);background:transparent;color:var(--text2);cursor:pointer;font-size:12px}
.bmb-box{max-width:820px}
.bmb-dots{display:flex;gap:4px;padding:0 20px 10px;overflow-x:auto;scrollbar-width:none}
.bmb-dots::-webkit-scrollbar{display:none}
.bmb-dot{flex:1;min-width:64px;padding:6px 4px 5px;border:none;border-bottom:3px solid var(--bg5);background:transparent;color:var(--text3);font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
.bmb-dot.done{border-bottom-color:rgba(42,143,227,0.5);color:var(--text2)}.bmb-dot.on{border-bottom-color:var(--blue);color:var(--text)}
.bmb-dot[disabled]{cursor:default}
.bmb-main{position:absolute;top:8px;left:8px;z-index:1;font-family:'DM Mono',monospace;font-size:9px;font-weight:800;letter-spacing:.08em;padding:2px 6px;border-radius:5px;background:var(--blue);color:#fff}
.bmb-starts{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.bmb-starts.grid{grid-template-columns:repeat(3,1fr)}
.bmb-start{text-align:left;display:flex;flex-direction:column;gap:4px;padding:16px;border-radius:14px;border:1px solid var(--border2);background:var(--bg4);color:var(--text);cursor:pointer;font-family:'DM Sans',sans-serif}
.bmb-start i{font-style:normal;font-size:22px}
.bmb-start b{font-family:'Outfit',sans-serif;font-size:16px}
.bmb-start span{font-size:12px;color:var(--text2);line-height:1.45}
.bmb-start.hero{border-color:rgba(42,143,227,0.5);background:linear-gradient(135deg,rgba(42,143,227,0.14),rgba(42,143,227,0.03))}
.bmb-start.sm{padding:12px}.bmb-start.sm b{font-size:14px}
.bmb-start:hover{border-color:rgba(255,255,255,0.3)}
.bmb-tip{margin:4px 0 0}
.bmb-rules{display:flex;flex-direction:column;gap:8px}
.bmb-rule{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.bmb-rule input,.bmb-input{flex:1;min-width:180px;padding:11px 12px;border-radius:10px;border:1px solid var(--border2);background:var(--bg4);color:var(--text);font-size:14px;font-family:'DM Sans',sans-serif;outline:none}
.bmb-rule input:focus,.bmb-input:focus{border-color:var(--blue)}
.bmb-input{width:100%;font-size:16px;font-family:'Outfit',sans-serif;font-weight:700}
.bmb-lbl{display:block;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);margin:8px 0 6px}
.bmb-seg{display:flex;border:1px solid var(--border2);border-radius:10px;overflow:hidden}
.bmb-seg button{padding:9px 10px;border:none;background:transparent;color:var(--text3);font-size:12px;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif}
.bmb-seg button.on{background:rgba(42,143,227,0.18);color:var(--text)}
.bmb-x{width:34px;height:34px;border-radius:9px;border:1px solid var(--border2);background:transparent;color:var(--text3);cursor:pointer}
.bmd-group small{text-transform:none;letter-spacing:0;font-size:11px;color:var(--text3)}
.bmb-sum{margin-top:16px;padding:14px;border-radius:14px;background:var(--bg3);border:1px solid var(--border);display:flex;flex-direction:column;gap:9px}
.bmb-sum-h{font-size:13.5px;color:var(--text2)}.bmb-sum-h b{color:var(--text)}
.bmb-sum .bmd-sum-r>div{align-items:center}
.bmb-sum em{font-size:12px;color:var(--text3)}
.bmb-edit{border:none;background:transparent;color:var(--blue);font-size:11.5px;font-weight:700;cursor:pointer;padding:3px 4px}
.bmb-qs{display:flex;flex-wrap:wrap;gap:4px 12px;padding-top:8px;border-top:1px solid var(--border);font-family:'DM Mono',monospace;font-size:10.5px;color:var(--text3)}
.bmb-meter{font-family:'DM Mono',monospace;font-size:11px;color:var(--text3);text-align:center}
.bmb-meter b{color:var(--text);font-size:13px}
.bmb-del{color:var(--bear);border-color:rgba(255,92,92,0.35)}.bmb-del.sure{background:rgba(255,92,92,0.15)}
.bmb-foot .ut-next,.bmb-foot .ut-back{white-space:nowrap}
/* the builder replaces the DNA invitation; members who already have a DNA keep their slim bar */
#bm-dna.bmd-cta{display:none}
.bmb-foot .ut-next[disabled]{background:var(--bg4);color:var(--text3);border-color:var(--border);box-shadow:none;cursor:not-allowed}
@media (max-width:640px){
  .bmb-tabs{grid-template-columns:1fr}
  .bmb-tab{flex-direction:row;align-items:baseline;gap:8px}
  .bmb-starts,.bmb-starts.grid{grid-template-columns:1fr}
  .bmb-starts.grid{grid-template-columns:1fr 1fr}
  .bmb-dots{padding:0 16px 8px}
  .bmb-cta .ut-next{flex:1 1 100%;width:100%}
  .bmb-meter{flex:1}
}`;
  document.head.appendChild(css);

  document.addEventListener('keydown', e => { if(e.key === 'Escape' && st) close(); });
  function init(){ hookStyle(); reload(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  return { list, get, edit, close, start, toggle, chip, setRR, addRule, ruleText, ruleMust, dropRule, setName, next, back, goto, del, open, paint, reload, STARTERS, MAX };
})();
