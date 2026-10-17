// ══════════════════════════════════════════════════════
// BLUE MAC — MEMBER PROFILE (window.BMS)
// Makes the app feel like YOUR app on any device:
//   • access  — free-list check (Supabase rpc bm_load → comp / tier) + "Free member" badge
//   • state   — the member's localStorage keys + where they were (page, style,
//               uTrade question + answers, Examples tab) synced to profiles.state
//
//   BMS.load(session)   called once per login by onSignedIn() (index.html), before
//                       placement / disclaimer, so their flags come back first
//   BMS.flush()         push pending changes now (logout)
//   BMS.clear()         wipe this member's data from the device (logout)
//   BMS.access          { comp, tier } — PayFast checks BMS.isFree() later
//   BMS.ready           true once state is restored (tour.js waits for it)
//
// Sync: every write to a key in SYNC marks the device dirty → saved 1.5 s later
// (and when the tab is hidden). Newest wins: server state replaces the device
// copy only when it was saved after the device's last change.
// ══════════════════════════════════════════════════════
window.BMS = (function(){
  // per-member keys (bm_fx_v1 = shared exchange-rate cache, stays on the device)
  const SYNC = ['bm_uni_v1', 'bm_cost_v1', 'bm_know_v1', 'bm_tour_v1', 'bm_style_suggestion',
                'tv_quiz_done', 'tv_disclaimer_accepted', 'tv_setup_seen', 'bm_nav_v1', 'bm_strats_v1', 'bm_path_v1', 'bm_prac_v1', 'bm_flight_v1'];
  const SYNCSET = new Set(SYNC);
  const OWNER = 'bm_owner', STAMP = 'bm_state_t', NAV = 'bm_nav_v1';
  try { localStorage.removeItem('bm_dna_v1'); } catch(e){}   // retired DNA picker (17 Oct) — tidy old copies off the device
  const B = { ready:false, loading:false, access:{ comp:false, tier:'free' }, uid:null };

  let applying = false, timer = null, saving = null, dirty = false;
  const ls = {
    get: k => { try { return localStorage.getItem(k); } catch(e){ return null; } },
    set: k => v => { try { localStorage.setItem(k, v); } catch(e){} },
    del: k => { try { localStorage.removeItem(k); } catch(e){} }
  };
  const getJSON = k => { try { return JSON.parse(ls.get(k) || 'null'); } catch(e){ return null; } };
  const sb = () => (typeof _supabase !== 'undefined' ? _supabase : null);

  // ── Watch every write to a member key (no edits needed in the other modules) ──
  try {
    const P = Storage.prototype, _set = P.setItem, _del = P.removeItem;
    P.setItem = function(k, v){ _set.call(this, k, v); if(this === window.localStorage && SYNCSET.has(k)) changed(); };
    P.removeItem = function(k){ _del.call(this, k); if(this === window.localStorage && SYNCSET.has(k)) changed(); };
  } catch(e){}

  function changed(){
    if(applying || !B.uid) return;
    dirty = true;
    ls.set(STAMP)(String(Date.now()));
    clearTimeout(timer); timer = setTimeout(save, 1500);
  }

  function snapshot(){
    const keys = {};
    SYNC.forEach(k => { const v = ls.get(k); if(v != null) keys[k] = v; });
    return { v:1, t: +(ls.get(STAMP) || 0), keys };
  }

  async function save(){
    clearTimeout(timer); timer = null;
    if(!dirty || !B.uid || !sb()) return;
    if(saving) return saving.then(save);       // one save at a time
    dirty = false;
    saving = (async () => {
      try {
        const { error } = await sb().rpc('bm_save_state', { s: snapshot() });
        if(error) dirty = true;                 // try again on the next change / flush
      } catch(e){ dirty = true; }
    })();
    await saving; saving = null;
  }

  // ── Write a server copy onto the device ──
  function apply(state){
    applying = true;
    SYNC.forEach(k => ls.del(k));
    Object.keys(state.keys || {}).forEach(k => { if(SYNCSET.has(k)) ls.set(k)(state.keys[k]); });
    ls.set(STAMP)(String(state.t || Date.now()));
    applying = false;
    // modules that read their storage once at start-up
    try { if(window.BMU && BMU.reload) BMU.reload(); } catch(e){}
    try {
      if(window.UT && UT.cost){
        const c = getJSON('bm_cost_v1') || {};
        Object.keys(UT.cost).forEach(k => delete UT.cost[k]);
        Object.assign(UT.cost, { ccy:'ZAR', bal:'', inst:{} }, c);
      }
    } catch(e){}
    try { if(window.BMB) BMB.reload(); } catch(e){}
    try { if(window.BMC) BMC.paint(true); } catch(e){}
    try { if(window.BMPR) BMPR.paint(); } catch(e){}
    try { if(window.BMF) BMF.paint(); } catch(e){}
  }

  function wipeDevice(){
    applying = true;
    SYNC.forEach(k => ls.del(k)); ls.del(STAMP); ls.del(OWNER);
    applying = false;
    try { if(window.BMB) BMB.reload(); } catch(e){}
    try { if(window.BMC) BMC.paint(true); } catch(e){}
    try { if(window.BMPR) BMPR.paint(); } catch(e){}
    try { if(window.BMF) BMF.paint(); } catch(e){}
  }

  // ── Where they were ──
  function nav(){ return getJSON(NAV) || {}; }
  function setNav(patch){ if(!B.ready) return; ls.set(NAV)(JSON.stringify(Object.assign(nav(), patch))); }

  function wrap(name, after){
    const fn = window[name]; if(typeof fn !== 'function' || fn._bms) return;
    const w = function(){ const r = fn.apply(this, arguments); try { after.apply(null, arguments); } catch(e){} return r; };
    w._bms = true; window[name] = w;
  }
  function hookNav(){
    wrap('goPage', id => setNav({ page:id }));
    wrap('setStyle', key => setNav({ style:key, ut:null }));
    wrap('filterExamples', cat => setNav({ ex:cat }));
  }
  // called by UT.render() on every redraw (one line in utrade.js)
  function utChanged(){
    if(!B.ready || !window.UT || !UT._st) return;
    const s = UT._st;
    setNav({ ut:{ style:s.style, step:s.step, ans:s.ans, lv:s.lv } });
  }

  function restoreNav(){
    const n = nav();
    try {
      if(n.style && n.style !== S.style){
        const tab = document.querySelector('.style-tab.' + n.style);
        if(tab) setStyle(n.style, tab);
      }
      if(n.ut && n.ut.style === S.style && window.UT && UT.has(S.style) && (n.ut.step > 0 || Object.keys(n.ut.ans || {}).length)){
        const s = UT._st;
        s.step = Math.max(0, n.ut.step | 0); s.ans = n.ut.ans || {}; s.lv = n.ut.lv || {};
        s.result = null; s._drawn = -1;
        try { UT.render(); } catch(e){ UT.reset(); UT.render(); }
      }
      if(n.page && n.page !== 'checklist' && document.getElementById('pg-' + n.page)){
        const btn = document.querySelector(`.nav-item[onclick*="goPage('${n.page}'"]`);
        if(btn) goPage(n.page, btn);
      }
      if(n.page === 'examples' && n.ex && n.ex !== 'all'){
        const b = document.querySelector(`.ex-filter[onclick*="'${n.ex}'"]`);
        if(b) filterExamples(n.ex, b);
      }
    } catch(e){ console.warn('Blue Mac: could not restore your last spot', e); }
  }

  // ── Free member badge ──
  function badge(){
    const name = document.getElementById('user-email-display');
    let el = document.getElementById('bm-member-badge');
    if(!B.access.comp){ if(el) el.remove(); return; }
    if(!name) return;
    if(!el){
      el = document.createElement('div'); el.id = 'bm-member-badge';
      el.textContent = 'Free member';
      el.title = 'You have full Blue Mac access, free.';
      el.style.cssText = "font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#22D67A;border:1px solid rgba(34,214,122,.4);background:rgba(34,214,122,.1);border-radius:20px;padding:2px 8px;";
      name.insertAdjacentElement('afterend', el);
    }
  }

  // ── Login ──
  async function load(session){
    const uid = session && session.user && session.user.id;
    if(!uid){ B.ready = true; return; }
    B.uid = null; B.ready = false; B.loading = true;

    // someone else's data on this device → clear it before anything reads it
    const owner = ls.get(OWNER);
    if(owner && owner !== uid) wipeDevice();
    ls.set(OWNER)(uid);
    if(!ls.get(STAMP) && SYNC.some(k => ls.get(k) != null)) ls.set(STAMP)('1');   // device data from before profiles existed

    let res = null;
    try {
      const call = sb() ? sb().rpc('bm_load') : Promise.resolve({ error:'offline' });
      const r = await Promise.race([call, new Promise(ok => setTimeout(() => ok({ error:'timeout' }), 5000))]);
      if(!r.error) res = r.data;
    } catch(e){}

    B.uid = uid;
    if(res){
      B.access = { comp: !!res.comp, tier: res.tier || 'free' };
      const server = res.state || {}, localT = +(ls.get(STAMP) || 0), serverT = +(server.t || 0);
      if(serverT > localT && server.keys) apply(server);       // newer on another device
      else if(localT > serverT){ dirty = true; save(); }       // this device is newer (or first sync)
    }
    badge();
    hookNav();
    restoreNav();
    B.ready = true; B.loading = false;
  }

  async function flush(){ if(dirty) await save(); else if(saving) await saving; }
  function clear(){ clearTimeout(timer); dirty = false; B.uid = null; B.ready = false; B.access = { comp:false, tier:'free' }; wipeDevice(); badge(); }

  document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', () => { flush(); });

  return Object.assign(B, { load, flush, clear, utChanged, isFree: () => !!B.access.comp, _snapshot: snapshot, SYNC });
})();
