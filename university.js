// ══════════════════════════════════════════════════════
// BLUE MAC UNIVERSITY — Self-Mastery Degree engine
// Levels → Modules → Lessons → Quiz. Strict unlocking (80% pass),
// progress saved on this device, "continue where you left off".
// Curriculum lives in curriculum-*.js (window.BMU_LEVELS).
// ══════════════════════════════════════════════════════
window.BMU = (function(){
  const KEY = 'bm_uni_v1', PASS = 0.8;
  const LEVELS = (window.BMU_LEVELS || []).slice().sort((a, b) => a.num - b.num);
  const MODULES = [];
  LEVELS.forEach(L => L.modules.forEach(m => { m.level = L; MODULES.push(m); }));
  MODULES.forEach((m, i) => { m.idx = i; m.code = `${m.level.num}.${m.level.modules.indexOf(m) + 1}`; });
  const TOTAL = MODULES.reduce((s, m) => s + m.lessons.length, 0);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]);

  // ── Progress ──
  function load(){
    try { const p = JSON.parse(localStorage.getItem(KEY) || 'null'); if(p && p.v === 1) return p; } catch(e){}
    return { v:1, done:{}, quiz:{}, last:null, certs:{}, started:null };
  }
  let P = load();
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(P)); } catch(e){} }

  const modDone   = m => m.lessons.filter(l => P.done[l.id]).length;
  const earned    = m => !!(P.quiz[m.id] && P.quiz[m.id].passed);              // passed the quiz
  const exempt    = m => !earned(m) && !!P.placed && m.level.num < P.placed.level; // placed out by the placement test
  const passed    = m => earned(m) || exempt(m);                                // counts for unlocking
  const unlocked  = m => m.idx === 0 || passed(MODULES[m.idx - 1]);
  const quizReady = m => exempt(m) || modDone(m) === m.lessons.length;
  const levelDone = L => L.modules.every(earned);                               // certificates need real passes
  const doneCount = () => MODULES.reduce((s, m) => s + modDone(m), 0);
  const currentModule = () => MODULES.find(m => !passed(m)) || null;

  function nextStep(){
    // Resume: last opened lesson if still relevant, otherwise first unfinished step
    if(P.last && P.last.lid){
      const m = MODULES.find(x => x.id === P.last.mid);
      if(m && unlocked(m) && !passed(m)){
        if(!P.done[P.last.lid]) return { m, l:m.lessons.find(l => l.id === P.last.lid) };
      }
    }
    const m = currentModule();
    if(!m) return null;
    const l = m.lessons.find(x => !P.done[x.id]);
    return l ? { m, l } : { m, quiz:true };
  }

  // ── Lesson content (own content or borrowed from an Examples card) ──
  function exCard(ref){
    if(!ref) return null;
    let el = document.querySelector(`.ex-card[data-id="${ref}"]`);
    if(!el){
      // original Examples cards: match by slug of their title
      document.querySelectorAll('.ex-card').forEach(c => {
        if(el || c.dataset.id) return;
        const t = (c.querySelector('.ex-card-title') || {}).textContent || '';
        const slug = 'ex-' + t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if(slug === ref) el = c;
      });
    }
    return el;
  }
  function lessonBody(l){
    let desc = l.desc || '', diagram = '', rules = '';
    const card = exCard(l.ref);
    if(card){
      const d = card.querySelector('.ex-card-desc'), g = card.querySelector('.ex-diagram'), r = card.querySelectorAll('.ex-rule');
      if(!l.desc && d) desc = d.innerHTML;
      if(g) diagram = `<div class="ex-diagram">${g.innerHTML}</div>`;
      if(!l.how) r.forEach(x => rules += x.outerHTML);
    }
    if(l.svg){
      const svg = typeof l.svg === 'function' ? l.svg() : l.svg;
      diagram = `<div class="ex-diagram"><div class="ex-diagram-item" style="width:100%;">${svg}${l.label ? `<div class="ex-diagram-label" style="color:${l.labelColor || 'var(--blue)'};">${l.label}</div>` : ''}</div></div>`;
    }
    if(l.how) rules += `<div class="ex-rule"><div class="ex-rule-icon">🎯</div><div class="ex-rule-text"><strong>${l.howTitle || 'How to use it'}:</strong> ${l.how}</div></div>`;
    if(l.tip) rules += `<div class="ex-rule"><div class="ex-rule-icon">💡</div><div class="ex-rule-text">${l.tip}</div></div>`;
    const pts = (l.points || []).length ? `<div class="uni-takeaways"><div class="uni-takeaways-title">🔑 Key takeaways</div><ul>${l.points.map(p => `<li>${p}</li>`).join('')}</ul></div>` : '';
    return `<div class="ex-card-desc">${desc}</div>${diagram}${l.extra || ''}${rules}${pts}`;
  }
  const lessonTitle = l => l.title || ((exCard(l.ref) || {}).querySelector ? exCard(l.ref).querySelector('.ex-card-title').textContent : 'Lesson');

  // ── Rendering helpers ──
  const root = () => document.getElementById('uni-root');
  function show(html){
    const r = root(); if(!r) return;
    r.innerHTML = html;
    const pg = document.getElementById('pg-education');
    if(pg && pg.classList.contains('on')) window.scrollTo({ top: Math.max(0, pg.getBoundingClientRect().top + window.scrollY - 70), behavior:'auto' });
  }
  const bar = (pct, col) => `<div class="uni-bar"><div class="uni-bar-fill" style="width:${pct}%;${col ? `background:${col};` : ''}"></div></div>`;
  const crumbs = parts => `<div class="uni-crumbs">${parts.map(([t, fn]) => fn ? `<button onclick="${fn}">${t}</button>` : `<span>${t}</span>`).join('<i>›</i>')}</div>`;

  function statusOf(m){
    if(earned(m)) return { k:'passed', t:`✅ Passed · ${Math.round(P.quiz[m.id].best * 100)}%` };
    if(exempt(m)) return { k:'exempt', t:'⏭ Placed out' };
    if(!unlocked(m)) return { k:'locked', t:'🔒 Locked' };
    if(quizReady(m)) return { k:'quiz', t:'📝 Quiz ready' };
    const d = modDone(m);
    return d ? { k:'progress', t:`▶ ${d}/${m.lessons.length} lessons` } : { k:'open', t:'▶ Start' };
  }

  // ── VIEW: Degree home ──
  function home(){
    const done = doneCount(), pct = Math.round(done / TOTAL * 100);
    const passedN = MODULES.filter(passed).length;
    const cur = currentModule(), ns = nextStep();
    const lvl = cur ? cur.level : LEVELS[LEVELS.length - 1];
    let cta;
    if(!ns){
      const ex = MODULES.find(exempt);
      cta = ex ? `<button class="uni-cta" onclick="BMU.module('${ex.id}')"><span>Almost there — earn your remaining certificates</span><b>📝 Test out of Module ${ex.code} · ${esc(ex.title)}</b></button>`
               : `<button class="uni-cta" onclick="BMU.cert('degree')">🎓 View your Self-Mastery Degree</button>`;
    }
    else if(ns.quiz) cta = `<button class="uni-cta" onclick="BMU.quiz('${ns.m.id}')"><span>Continue where you left off</span><b>📝 Module ${ns.m.code} quiz — ${esc(ns.m.title)}</b></button>`;
    else cta = `<button class="uni-cta" onclick="BMU.lesson('${ns.m.id}','${ns.l.id}')"><span>${done ? 'Continue where you left off' : (P.placed && P.placed.level > 1 ? `Start at your placement — Level ${P.placed.level}` : 'Start your degree')}</span><b>▶ Module ${ns.m.code} · ${esc(lessonTitle(ns.l))}</b></button>`;

    let h = `
      <div class="uni-hero">
        <div class="uni-hero-left">
          <div class="uni-kicker">BLUE MAC UNIVERSITY</div>
          <h1 class="uni-title">🎓 The Self-Mastery Degree</h1>
          <p class="uni-sub">From your very first pip to trading like an institution. ${LEVELS.length} levels · ${MODULES.length} modules · ${TOTAL} lessons. Each module unlocks only when you pass the one before it, so every lesson builds on what you already know.</p>
          ${cta}
        </div>
        <div class="uni-ring" style="--p:${pct};"><div><b>${pct}%</b><span>complete</span></div></div>
      </div>
      <div class="uni-stats">
        <div><b>${done}<i>/${TOTAL}</i></b><span>Lessons</span></div>
        <div><b>${passedN}<i>/${MODULES.length}</i></b><span>Modules passed</span></div>
        <div><b>${LEVELS.filter(levelDone).length}<i>/${LEVELS.length}</i></b><span>Certificates</span></div>
        <div><b style="color:${lvl.color};">L${lvl.num}</b><span>${esc(lvl.title)}</span></div>
      </div>
      ${!P.placed && !doneCount() && !Object.keys(P.quiz).length && window.BMP ? `<div class="uni-placement"><div><b>🧭 Already know some trading?</b><span>Take the 2-minute placement test and skip straight to the level that matches your experience.</span></div><button class="uni-btn primary" onclick="BMP.open(true)">Take the placement test</button></div>` : ''}
      ${P.placed && P.placed.level > 1 ? `<div class="uni-placed-note">🧭 Placement test: you started at <b>Level ${P.placed.level}</b>. Levels below it are placed out — review them or take their quizzes any time to earn full credit.</div>` : ''}
      <details class="uni-how"><summary>How the degree works</summary>
        <ol><li><b>Read each lesson</b> in order and tap <em>Complete &amp; continue</em>.</li>
        <li>When every lesson in a module is done, the <b>module quiz</b> opens.</li>
        <li>Score <b>80% or more</b> to pass and unlock the next module. You can retry as often as you like.</li>
        <li>Pass every module in a level to earn that level's <b>certificate</b>. Finish all ${LEVELS.length} for the <b>Self-Mastery Degree</b>.</li>
        <li>Your progress is saved on this device. Come back any time and tap <em>Continue</em>.</li></ol></details>
      <div class="uni-path">`;
    LEVELS.forEach(L => {
      const ld = L.modules.reduce((s, m) => s + modDone(m), 0), lt = L.modules.reduce((s, m) => s + m.lessons.length, 0);
      const lp = Math.round(ld / lt * 100), lockedL = !unlocked(L.modules[0]);
      h += `<div class="uni-level${lockedL ? ' locked' : ''}" style="--lc:${L.color};">
        <div class="uni-level-head">
          <div class="uni-level-num">${L.num}</div>
          <div class="uni-level-info"><div class="uni-level-title">${L.icon} Level ${L.num} — ${esc(L.title)}</div><div class="uni-level-sub">${esc(L.sub)}</div></div>
          ${levelDone(L) ? `<button class="uni-cert-chip" onclick="BMU.cert('${L.id}')">🏅 ${esc(L.badge)}</button>` : `<div class="uni-level-pct">${lp}%</div>`}
        </div>
        ${bar(lp, L.color)}
        <div class="uni-mods">`;
      L.modules.forEach(m => {
        const st = statusOf(m), can = st.k !== 'locked';
        const prev = MODULES[m.idx - 1];
        h += `<button class="uni-mod ${st.k}" ${can ? `onclick="BMU.module('${m.id}')"` : `onclick="BMU.locked('${m.id}')"`}>
            <span class="uni-mod-code">${m.code}</span><span class="uni-mod-icon">${m.icon}</span>
            <span class="uni-mod-main"><b>${esc(m.title)}</b><small>${m.lessons.length} lessons${!can && prev ? ` · unlocks after Module ${prev.code}` : ''}</small></span>
            <span class="uni-mod-status">${st.t}</span></button>`;
      });
      h += `</div></div>`;
    });
    h += `</div><div id="uni-locked-msg"></div>
      <div class="uni-foot">${window.BMP ? `<button class="uni-reset" onclick="BMP.open(true)">Retake placement test</button> ` : ''}<button class="uni-reset" id="uni-reset" onclick="BMU.reset()">Reset progress</button></div>`;
    show(h);
  }

  function locked(mid){
    const m = MODULES.find(x => x.id === mid), prev = MODULES[m.idx - 1];
    const el = document.getElementById('uni-locked-msg');
    if(el){ el.innerHTML = `<div class="uni-toast">🔒 <b>Module ${m.code} is locked.</b> Pass the Module ${prev.code} quiz (${esc(prev.title)}) with 80% or more to unlock it.</div>`;
      el.scrollIntoView({ behavior:'smooth', block:'center' }); setTimeout(() => { if(el) el.innerHTML = ''; }, 5000); }
  }

  // ── VIEW: Module ──
  function module(mid){
    const m = MODULES.find(x => x.id === mid); if(!m || !unlocked(m)) return home();
    const L = m.level, prev = MODULES[m.idx - 1], next = MODULES[m.idx + 1];
    const d = modDone(m), q = P.quiz[m.id];
    let h = crumbs([['Degree', 'BMU.home()'], [`Level ${L.num}`], [`Module ${m.code}`]]) + `
      <div class="uni-mod-hero" style="--lc:${L.color};">
        <div class="uni-mod-hero-icon">${m.icon}</div>
        <div><div class="uni-kicker" style="color:${L.color};">LEVEL ${L.num} · MODULE ${m.code}</div><h2>${esc(m.title)}</h2><p>${m.desc}</p></div>
      </div>
      <div class="uni-prereq">
        <div><span>Builds on</span><b>${prev ? `Module ${prev.code} · ${esc(prev.title)}` : 'Nothing — this is where everyone starts'}</b></div>
        <div><span>Unlocks</span><b>${next ? `Module ${next.code} · ${esc(next.title)}` : '🎓 Your Self-Mastery Degree'}</b></div>
      </div>
      ${exempt(m) ? `<div class="uni-placed-note">⏭ <b>You placed out of this module.</b> Review any lesson you like, or take the quiz now to earn full credit towards your Level ${L.num} certificate.</div>` : ''}
      ${m.why ? `<div class="uni-why">🧭 <b>Why this matters:</b> ${m.why}</div>` : ''}
      <div class="uni-lesson-list">`;
    m.lessons.forEach((l, i) => {
      const ok = P.done[l.id];
      h += `<button class="uni-lesson-row${ok ? ' done' : ''}" onclick="BMU.lesson('${m.id}','${l.id}')">
        <span class="uni-lr-num">${ok ? '✓' : String(i + 1).padStart(2, '0')}</span>
        <span class="uni-lr-title">${l.icon || ''} ${esc(lessonTitle(l))}</span>
        <span class="uni-lr-go">${ok ? 'Review' : 'Open'} ›</span></button>`;
    });
    h += `</div>
      <div class="uni-quiz-box ${quizReady(m) ? 'ready' : ''}">
        <div><b>📝 Module ${m.code} quiz</b><small>${m.quiz.length} questions · pass mark 80%${q ? ` · best score ${Math.round(q.best * 100)}%` : ''}</small></div>
        ${quizReady(m) ? `<button class="uni-btn primary" onclick="BMU.quiz('${m.id}')">${earned(m) ? 'Retake quiz' : exempt(m) ? 'Test out — take the quiz' : 'Start quiz'}</button>` : `<span class="uni-quiz-lock">Complete all ${m.lessons.length} lessons first (${d}/${m.lessons.length})</span>`}
      </div>`;
    show(h);
  }

  // ── VIEW: Lesson ──
  function lesson(mid, lid){
    const m = MODULES.find(x => x.id === mid); if(!m || !unlocked(m)) return home();
    const i = m.lessons.findIndex(x => x.id === lid), l = m.lessons[i]; if(!l) return module(mid);
    P.last = { mid, lid }; if(!P.started) P.started = new Date().toISOString(); save();
    const L = m.level, isLast = i === m.lessons.length - 1;
    const dots = m.lessons.map((x, k) => `<i class="${P.done[x.id] ? 'd' : ''}${k === i ? ' c' : ''}"></i>`).join('');
    const tag = l.tag ? `<span class="ex-card-tag" style="background:${L.color}1F;color:${L.color};border:1px solid ${L.color}55;">${esc(l.tag)}</span>` : '';
    show(crumbs([['Degree', 'BMU.home()'], [`Module ${m.code}`, `BMU.module('${m.id}')`], [`Lesson ${i + 1} of ${m.lessons.length}`]]) + `
      <div class="uni-lesson-top"><div class="uni-dots">${dots}</div><span>${doneCount()}/${TOTAL} lessons in your degree</span></div>
      <div class="ex-card uni-lesson-card" style="display:block;">
        <div class="ex-card-header">
          <div class="ex-card-icon">${l.icon || m.icon}</div>
          <div class="ex-card-title">${esc(lessonTitle(l))}</div>${tag}
        </div>
        <div class="ex-card-body">${lessonBody(l)}</div>
      </div>
      <div class="uni-nav">
        ${i > 0 ? `<button class="uni-btn" onclick="BMU.lesson('${m.id}','${m.lessons[i - 1].id}')">‹ Previous</button>` : `<button class="uni-btn" onclick="BMU.module('${m.id}')">‹ Module</button>`}
        <button class="uni-btn primary" onclick="BMU.complete('${m.id}','${l.id}')">${P.done[l.id] ? (isLast ? 'Go to the quiz ›' : 'Next lesson ›') : (isLast ? '✓ Complete &amp; take the quiz' : '✓ Complete &amp; continue')}</button>
      </div>`);
  }
  function complete(mid, lid){
    const m = MODULES.find(x => x.id === mid), i = m.lessons.findIndex(x => x.id === lid);
    P.done[lid] = Date.now(); save();
    const next = m.lessons.slice(i + 1).find(x => !P.done[x.id]) || m.lessons[i + 1];
    if(next) return lesson(mid, next.id);
    if(quizReady(m)) return quiz(mid);
    const first = m.lessons.find(x => !P.done[x.id]);
    return first ? lesson(mid, first.id) : module(mid);
  }

  // ── VIEW: Quiz ──
  let Q = null;
  function shuffle(a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function quiz(mid){
    const m = MODULES.find(x => x.id === mid); if(!m || !unlocked(m)) return home();
    if(!quizReady(m)) return module(mid);
    P.last = { mid, quiz:true }; save();
    Q = { m, i:0, score:0, qs: shuffle(m.quiz).map(q => { const o = shuffle(q.o.map((t, k) => ({ t, ok:k === q.a }))); return { q:q.q, o, why:q.why }; }), answered:false };
    renderQ();
  }
  function renderQ(){
    const { m, i, qs } = Q, q = qs[i];
    show(crumbs([['Degree', 'BMU.home()'], [`Module ${m.code}`, `BMU.module('${m.id}')`], ['Quiz']]) + `
      <div class="uni-quiz">
        <div class="uni-quiz-head"><span>Module ${m.code} quiz · ${esc(m.title)}</span><span>Question ${i + 1} of ${qs.length}</span></div>
        ${bar(Math.round(i / qs.length * 100))}
        <div class="uni-q">${q.q}</div>
        <div class="uni-opts">${q.o.map((o, k) => `<button class="uni-opt" onclick="BMU.answer(${k})"><span>${String.fromCharCode(65 + k)}</span>${o.t}</button>`).join('')}</div>
        <div id="uni-feedback"></div>
      </div>`);
  }
  function answer(k){
    if(!Q || Q.answered) return;
    Q.answered = true;
    const q = Q.qs[Q.i], ok = q.o[k].ok;
    if(ok) Q.score++;
    document.querySelectorAll('.uni-opt').forEach((b, j) => { b.disabled = true; if(q.o[j].ok) b.classList.add('right'); else if(j === k) b.classList.add('wrong'); });
    document.getElementById('uni-feedback').innerHTML = `<div class="uni-fb ${ok ? 'ok' : 'no'}"><b>${ok ? '✓ Correct.' : '✗ Not quite.'}</b> ${q.why || ''}</div>
      <div class="uni-nav"><span></span><button class="uni-btn primary" onclick="BMU.nextQ()">${Q.i < Q.qs.length - 1 ? 'Next question ›' : 'See my result ›'}</button></div>`;
  }
  function nextQ(){
    if(!Q) return home();
    if(Q.i < Q.qs.length - 1){ Q.i++; Q.answered = false; return renderQ(); }
    const { m, score, qs } = Q, pct = score / qs.length, ok = pct >= PASS;
    const prev = P.quiz[m.id] || { best:0, passed:false, tries:0 };
    const wasLevelDone = levelDone(m.level);
    P.quiz[m.id] = { best:Math.max(prev.best, pct), passed:prev.passed || ok, tries:prev.tries + 1, at:Date.now() };
    const newCert = !wasLevelDone && levelDone(m.level);
    if(newCert) P.certs[m.level.id] = new Date().toISOString();
    if(ok) P.last = null;
    save(); Q = null;
    const next = MODULES[m.idx + 1];
    show(crumbs([['Degree', 'BMU.home()'], [`Module ${m.code}`, `BMU.module('${m.id}')`], ['Result']]) + `
      <div class="uni-result ${ok ? 'pass' : 'fail'}">
        <div class="uni-result-score">${Math.round(pct * 100)}%</div>
        <div class="uni-result-title">${ok ? '🎉 Module passed!' : 'Not yet — you need 80% to pass'}</div>
        ${!ok && exempt(m) ? `<p style="margin-bottom:0;">You're still placed out of this module, so nothing gets locked. Review the lessons and try again whenever you like.</p>` : ''}
        <p>${score} of ${qs.length} correct. ${ok ? (next ? `<b>Module ${next.code} · ${esc(next.title)}</b> is now unlocked.` : 'You have completed every module.') : 'Go back over the lessons — especially the ones these questions came from — then try again. There is no limit on retries.'}</p>
        <div class="uni-result-btns">
          ${ok ? (newCert ? `<button class="uni-btn primary" onclick="BMU.cert('${m.level.id}')">🏅 Claim your ${esc(m.level.badge)}</button>` : next ? `<button class="uni-btn primary" onclick="BMU.module('${next.id}')">Start Module ${next.code} ›</button>` : '')
               : `<button class="uni-btn primary" onclick="BMU.quiz('${m.id}')">Retry quiz</button><button class="uni-btn" onclick="BMU.module('${m.id}')">Review lessons</button>`}
          <button class="uni-btn" onclick="BMU.home()">Back to degree</button>
        </div>
      </div>`);
  }

  // ── VIEW: Certificate ──
  function cert(id){
    const all = id === 'degree', L = all ? null : LEVELS.find(x => x.id === id);
    if(all ? !LEVELS.every(levelDone) : !(L && levelDone(L))) return home();
    const date = new Date(all ? Math.max(...Object.values(P.certs).map(d => +new Date(d))) : P.certs[L.id] || Date.now());
    const name = (window.BMU_NAME || '').trim();
    const nextL = L ? LEVELS[LEVELS.indexOf(L) + 1] : null;
    show(crumbs([['Degree', 'BMU.home()'], ['Certificate']]) + `
      <div class="uni-cert" style="--lc:${all ? '#E4E8EE' : L.color};">
        <div class="uni-cert-inner">
          <div class="uni-kicker">BLUE MAC UNIVERSITY</div>
          <div class="uni-cert-icon">${all ? '🎓' : '🏅'}</div>
          <div class="uni-cert-title">${all ? 'Self-Mastery Degree' : esc(L.badge)}</div>
          <div class="uni-cert-sub">This certifies that</div>
          <div class="uni-cert-name">${name ? esc(name) : 'You'}</div>
          <div class="uni-cert-sub">${all ? `has completed all ${LEVELS.length} levels and ${MODULES.length} modules of the Blue Mac Self-Mastery Degree` : `has passed every module of Level ${L.num} — ${esc(L.title)}`}</div>
          <div class="uni-cert-date">${date.toLocaleDateString('en-ZA', { day:'numeric', month:'long', year:'numeric' })}</div>
        </div>
      </div>
      <div class="uni-nav" style="justify-content:center;gap:10px;">
        ${nextL ? `<button class="uni-btn primary" onclick="BMU.module('${nextL.modules[0].id}')">Start Level ${nextL.num} ›</button>` : ''}
        ${!all && LEVELS.every(levelDone) ? `<button class="uni-btn primary" onclick="BMU.cert('degree')">🎓 View your degree</button>` : ''}
        <button class="uni-btn" onclick="BMU.home()">Back to degree</button>
      </div>`);
  }

  // ── Reset (two taps, no browser dialog) ──
  let resetArmed = false;
  function reset(){
    const b = document.getElementById('uni-reset');
    if(!resetArmed){ resetArmed = true; if(b){ b.textContent = 'Tap again to erase all progress'; b.classList.add('armed'); } setTimeout(() => { resetArmed = false; if(b){ b.textContent = 'Reset progress'; b.classList.remove('armed'); } }, 4000); return; }
    resetArmed = false; P = { v:1, done:{}, quiz:{}, last:null, certs:{}, started:null }; save(); home();
  }

  function applyPlacement(level){
    level = Math.max(1, Math.min(6, +level || 1));
    P.placed = { level, at:new Date().toISOString() };
    P.last = null; save();
  }

  function onShow(){
    // try to personalise certificates with the logged-in user's name
    try {
      if(typeof _supabase !== 'undefined') _supabase.auth.getSession().then(r => {
        const u = r && r.data && r.data.session && r.data.session.user;
        if(u) window.BMU_NAME = (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || (u.email || '').split('@')[0];
        // new device: restore the placement level saved on the account
        const pl = u && u.user_metadata && u.user_metadata.tv_placement_level;
        if(pl && !P.placed){ applyPlacement(pl); home(); }
      }).catch(() => {});
    } catch(e){}
    home();
  }

  // ── Styles ──
  const css = `
  .uni-page{max-width:1080px;margin:0 auto;padding:28px 24px 80px;}
  .uni-kicker{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.18em;color:var(--blue);font-weight:600;margin-bottom:8px;}
  .uni-hero{display:flex;gap:28px;align-items:center;justify-content:space-between;padding:28px;border-radius:20px;background:linear-gradient(135deg,rgba(42,143,227,.12),rgba(150,208,255,.03));border:1px solid rgba(42,143,227,.25);margin-bottom:16px;}
  .uni-title{font-family:'Outfit',sans-serif;font-size:30px;font-weight:800;color:#fff;margin:0 0 8px;}
  .uni-sub{color:var(--text2,#A2A2A8);font-size:14px;line-height:1.65;max-width:620px;margin:0 0 18px;}
  .uni-cta{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:13px 20px;border-radius:12px;border:0;cursor:pointer;background:linear-gradient(135deg,#2A8FE3,#96D0FF);color:#06121f;text-align:left;font-family:'DM Sans',sans-serif;box-shadow:0 8px 30px rgba(42,143,227,.3);}
  .uni-cta span{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;opacity:.75;}
  .uni-cta b{font-size:15px;font-weight:800;}
  .uni-ring{--p:0;width:130px;height:130px;flex-shrink:0;border-radius:50%;background:conic-gradient(#2A8FE3 calc(var(--p)*1%),rgba(255,255,255,.07) 0);display:grid;place-items:center;}
  .uni-ring>div{width:104px;height:104px;border-radius:50%;background:#0b0b0d;display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .uni-ring b{font-family:'Outfit',sans-serif;font-size:26px;color:#fff;}.uni-ring span{font-size:10px;color:var(--text3,#777);font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:.1em;}
  .uni-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
  .uni-stats>div{padding:14px 16px;border-radius:14px;background:var(--bg3,#111);border:1px solid var(--border,rgba(255,255,255,.08));}
  .uni-stats b{display:block;font-family:'Outfit',sans-serif;font-size:22px;color:#fff;}.uni-stats b i{font-style:normal;font-size:13px;color:var(--text3,#777);}
  .uni-stats span{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--text3,#777);}
  .uni-how{margin-bottom:22px;padding:12px 16px;border-radius:12px;background:var(--bg3,#111);border:1px solid var(--border,rgba(255,255,255,.08));color:var(--text2,#A2A2A8);font-size:13px;}
  .uni-how summary{cursor:pointer;color:#fff;font-weight:600;}.uni-how ol{margin:10px 0 2px 18px;line-height:1.8;}
  .uni-bar{height:6px;border-radius:6px;background:rgba(255,255,255,.07);overflow:hidden;}
  .uni-bar-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,#2A8FE3,#96D0FF);transition:width .5s;}
  .uni-path{display:flex;flex-direction:column;gap:14px;}
  .uni-level{--lc:#2A8FE3;padding:18px;border-radius:18px;background:var(--bg3,#111);border:1px solid var(--border,rgba(255,255,255,.08));border-left:3px solid var(--lc);}
  .uni-level.locked{opacity:.62;}
  .uni-level-head{display:flex;align-items:center;gap:14px;margin-bottom:10px;}
  .uni-level-num{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;font-family:'Outfit',sans-serif;font-weight:800;color:#06121f;background:var(--lc);flex-shrink:0;}
  .uni-level-info{flex:1;min-width:0;}.uni-level-title{font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;color:#fff;}
  .uni-level-sub{font-size:12.5px;color:var(--text2,#A2A2A8);margin-top:2px;}
  .uni-level-pct{font-family:'DM Mono',monospace;font-size:13px;color:var(--lc);font-weight:700;}
  .uni-cert-chip{font-family:'DM Mono',monospace;font-size:10px;padding:6px 10px;border-radius:999px;border:1px solid var(--lc);color:var(--lc);background:transparent;cursor:pointer;}
  .uni-mods{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:8px;margin-top:12px;}
  .uni-mod{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);color:#fff;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif;transition:all .2s;}
  .uni-mod:hover{border-color:var(--lc);background:rgba(255,255,255,.04);}
  .uni-mod.locked{cursor:not-allowed;opacity:.55;}.uni-mod.locked:hover{border-color:rgba(255,255,255,.07);}
  .uni-mod-code{font-family:'DM Mono',monospace;font-size:10px;color:var(--lc);width:26px;flex-shrink:0;}
  .uni-mod-icon{font-size:18px;}.uni-mod-main{flex:1;min-width:0;display:flex;flex-direction:column;}
  .uni-mod-main b{font-size:13.5px;font-weight:700;}.uni-mod-main small{font-size:11px;color:var(--text3,#777);}
  .uni-mod-status{font-family:'DM Mono',monospace;font-size:10px;white-space:nowrap;color:var(--text3,#888);}
  .uni-mod.passed .uni-mod-status{color:#22D67A;}.uni-mod.quiz .uni-mod-status{color:#F5B841;}.uni-mod.progress .uni-mod-status,.uni-mod.open .uni-mod-status{color:#96D0FF;}
  .uni-placement{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:16px 18px;border-radius:14px;background:rgba(245,184,65,.07);border:1px solid rgba(245,184,65,.35);margin-bottom:14px;}
  .uni-placement b{display:block;color:#fff;font-size:15px;margin-bottom:3px;}.uni-placement span{font-size:13px;color:var(--text2,#A2A2A8);}
  .uni-placed-note{padding:12px 14px;border-radius:12px;background:rgba(138,164,191,.08);border:1px solid rgba(138,164,191,.3);color:#C8D2DC;font-size:13px;line-height:1.6;margin-bottom:14px;}
  .uni-mod.exempt .uni-mod-status{color:#8AA4BF;}
  .uni-toast{margin-top:14px;padding:12px 16px;border-radius:12px;background:rgba(245,184,65,.1);border:1px solid rgba(245,184,65,.35);color:#F5D9A0;font-size:13px;}
  .uni-foot{margin-top:26px;text-align:center;}
  .uni-reset{font-family:'DM Mono',monospace;font-size:10px;color:var(--text3,#777);padding:6px 12px;border-radius:8px;border:1px solid var(--border,rgba(255,255,255,.1));background:transparent;cursor:pointer;}
  .uni-reset.armed,.uni-reset:hover{color:#FF5C5C;border-color:rgba(255,92,92,.5);}
  .uni-crumbs{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:16px;font-family:'DM Mono',monospace;font-size:11px;color:var(--text3,#777);}
  .uni-crumbs button{background:none;border:0;color:var(--blue);cursor:pointer;font:inherit;padding:0;}.uni-crumbs i{font-style:normal;opacity:.5;}
  .uni-mod-hero{display:flex;gap:16px;align-items:flex-start;padding:22px;border-radius:18px;background:var(--bg3,#111);border:1px solid var(--border,rgba(255,255,255,.08));border-left:3px solid var(--lc);margin-bottom:12px;}
  .uni-mod-hero-icon{font-size:34px;}.uni-mod-hero h2{font-family:'Outfit',sans-serif;font-size:24px;color:#fff;margin:0 0 6px;}.uni-mod-hero p{color:var(--text2,#A2A2A8);font-size:14px;line-height:1.65;margin:0;}
  .uni-prereq{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}
  .uni-prereq>div{padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);}
  .uni-prereq span{display:block;font-family:'DM Mono',monospace;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3,#777);margin-bottom:4px;}
  .uni-prereq b{font-size:13px;color:#fff;}
  .uni-why{padding:12px 14px;border-radius:12px;background:rgba(42,143,227,.07);border:1px solid rgba(42,143,227,.2);color:var(--text2,#B8C4D0);font-size:13px;line-height:1.6;margin-bottom:14px;}
  .uni-lesson-list{display:flex;flex-direction:column;gap:6px;margin-bottom:14px;}
  .uni-lesson-row{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.07);background:var(--bg3,#111);color:#fff;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif;}
  .uni-lesson-row:hover{border-color:rgba(42,143,227,.5);}
  .uni-lr-num{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font-family:'DM Mono',monospace;font-size:11px;background:rgba(255,255,255,.05);color:var(--text3,#888);flex-shrink:0;}
  .uni-lesson-row.done .uni-lr-num{background:rgba(34,214,122,.15);color:#22D67A;}
  .uni-lr-title{flex:1;font-size:14px;font-weight:600;}.uni-lr-go{font-family:'DM Mono',monospace;font-size:10px;color:var(--blue);}
  .uni-quiz-box{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:16px 18px;border-radius:14px;border:1px dashed rgba(255,255,255,.15);background:rgba(255,255,255,.02);}
  .uni-quiz-box.ready{border:1px solid rgba(245,184,65,.45);background:rgba(245,184,65,.06);}
  .uni-quiz-box b{display:block;color:#fff;font-size:15px;}.uni-quiz-box small{font-size:12px;color:var(--text3,#888);}
  .uni-quiz-lock{font-family:'DM Mono',monospace;font-size:11px;color:var(--text3,#888);}
  .uni-btn{padding:11px 18px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:700;font-size:13.5px;}
  .uni-btn:hover{border-color:rgba(42,143,227,.6);}
  .uni-btn.primary{background:linear-gradient(135deg,#2A8FE3,#96D0FF);color:#06121f;border:0;}
  .uni-lesson-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;font-family:'DM Mono',monospace;font-size:10.5px;color:var(--text3,#777);}
  .uni-dots{display:flex;gap:5px;flex-wrap:wrap;}.uni-dots i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.1);}
  .uni-dots i.d{background:#22D67A;}.uni-dots i.c{outline:2px solid #2A8FE3;outline-offset:2px;}
  .uni-lesson-card{max-width:820px;margin:0 auto;}
  .uni-lesson-card .ex-diagram svg{max-width:560px !important;margin:0 auto;}
  .uni-takeaways{margin-top:12px;padding:14px 16px;border-radius:12px;background:rgba(34,214,122,.06);border:1px solid rgba(34,214,122,.22);}
  .uni-takeaways-title{font-weight:800;color:#fff;font-size:13.5px;margin-bottom:6px;}
  .uni-takeaways ul{margin:0 0 0 18px;padding:0;color:var(--text2,#B8C0C8);font-size:13.5px;line-height:1.75;}
  .uni-nav{display:flex;justify-content:space-between;align-items:center;gap:10px;max-width:820px;margin:16px auto 0;}
  .uni-quiz{max-width:760px;margin:0 auto;padding:24px;border-radius:18px;background:var(--bg3,#111);border:1px solid var(--border,rgba(255,255,255,.08));}
  .uni-quiz-head{display:flex;justify-content:space-between;gap:10px;font-family:'DM Mono',monospace;font-size:10.5px;color:var(--text3,#888);margin-bottom:8px;}
  .uni-q{font-family:'Outfit',sans-serif;font-size:19px;font-weight:700;color:#fff;margin:18px 0 14px;line-height:1.45;}
  .uni-opts{display:flex;flex-direction:column;gap:8px;}
  .uni-opt{display:flex;align-items:flex-start;gap:12px;padding:13px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.02);color:#E8EAED;cursor:pointer;text-align:left;font-family:'DM Sans',sans-serif;font-size:14px;line-height:1.5;}
  .uni-opt span{width:22px;height:22px;flex-shrink:0;border-radius:6px;display:grid;place-items:center;font-family:'DM Mono',monospace;font-size:11px;background:rgba(255,255,255,.06);}
  .uni-opt:hover:not(:disabled){border-color:rgba(42,143,227,.6);}
  .uni-opt.right{border-color:#22D67A;background:rgba(34,214,122,.1);}.uni-opt.wrong{border-color:#FF5C5C;background:rgba(255,92,92,.1);}
  .uni-fb{margin-top:14px;padding:12px 14px;border-radius:12px;font-size:13.5px;line-height:1.6;color:var(--text2,#C0C6CC);}
  .uni-fb.ok{background:rgba(34,214,122,.08);border:1px solid rgba(34,214,122,.3);}.uni-fb.no{background:rgba(255,92,92,.08);border:1px solid rgba(255,92,92,.3);}
  .uni-result{max-width:620px;margin:0 auto;text-align:center;padding:34px 26px;border-radius:20px;background:var(--bg3,#111);border:1px solid var(--border,rgba(255,255,255,.08));}
  .uni-result.pass{border-color:rgba(34,214,122,.4);}.uni-result.fail{border-color:rgba(255,92,92,.35);}
  .uni-result-score{font-family:'Outfit',sans-serif;font-size:54px;font-weight:800;color:#fff;}
  .uni-result.pass .uni-result-score{color:#22D67A;}.uni-result.fail .uni-result-score{color:#FF5C5C;}
  .uni-result-title{font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;}
  .uni-result p{color:var(--text2,#A2A2A8);font-size:14px;line-height:1.65;}
  .uni-result-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px;}
  .uni-cert{--lc:#E4E8EE;max-width:680px;margin:0 auto;padding:10px;border-radius:22px;background:linear-gradient(135deg,var(--lc),rgba(255,255,255,.1));}
  .uni-cert-inner{padding:42px 28px;border-radius:16px;background:#0a0a0c;text-align:center;border:1px solid rgba(255,255,255,.08);}
  .uni-cert-icon{font-size:52px;margin:8px 0;}
  .uni-cert-title{font-family:'Outfit',sans-serif;font-size:30px;font-weight:800;color:var(--lc);margin-bottom:16px;}
  .uni-cert-sub{color:var(--text2,#A2A2A8);font-size:14px;line-height:1.6;max-width:460px;margin:0 auto;}
  .uni-cert-name{font-family:'Outfit',sans-serif;font-size:28px;font-weight:800;color:#fff;margin:8px 0;}
  .uni-cert-date{margin-top:18px;font-family:'DM Mono',monospace;font-size:12px;color:var(--text3,#888);letter-spacing:.1em;}
  @media(max-width:760px){
    .uni-page{padding:18px 14px 60px;}
    .uni-hero{flex-direction:column-reverse;align-items:flex-start;padding:20px;}
    .uni-title{font-size:24px;}
    .uni-stats{grid-template-columns:repeat(2,1fr);}
    .uni-prereq{grid-template-columns:1fr;}
    .uni-mods{grid-template-columns:1fr;}
    .uni-q{font-size:17px;}
  }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  return { reload: () => { P = load(); }, home, module, lesson, complete, quiz, answer, nextQ, cert, reset, locked, onShow, applyPlacement, _p:() => P, isUnlocked: mid => { const m = MODULES.find(x => x.id === mid); return !!m && unlocked(m); }, MODULES, LEVELS, TOTAL };
})();

// Render the degree as soon as the page exists
if(document.getElementById('uni-root')) BMU.home();
