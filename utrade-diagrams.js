// ══════════════════════════════════════════════════════
// uTRADE IDEAS · SHARED DIAGRAM LIBRARY
// Candle diagrams drawn with BMX (exengine.js). Every spec is the BULL
// version; UT.C(key, -1) returns the mirrored bearish picture.
// ══════════════════════════════════════════════════════
(function(){
  if(!window.UT) return;
  const D = UT.D;
  const DG = {
    structTrend: {
      n:40, seed:11, noise:0.45, wick:0.6,
      pts:[[0,100],[7,106],[11,103],[19,110.5],[23,107],[31,115],[35,112],[39,114]],
      marks:[
        { t:'text', i:11, p:101.4, s:['HL','LH'], c:['bull','bear'] },
        { t:'text', i:7, p:107.7, s:['HH','LL'], c:'slate' },
        { t:'text', i:19, p:112.2, s:['HH','LL'], c:['bull','bear'] },
        { t:'text', i:23, p:105.4, s:['HL','LH'], c:['bull','bear'] },
        { t:'text', i:31, p:116.7, s:['HH','LL'], c:['bull','bear'] },
        { t:'arrow', pts:[[24,104.5],[36,110.5]], c:['bull','bear'] }
      ]
    },
    choch: {
      n:40, seed:5, noise:0.4, wick:0.6,
      pts:[[0,114],[6,108],[10,111],[17,104.5],[21,108.5],[27,102],[31,105],[36,111],[39,112.5]],
      marks:[
        { t:'hline', p:108.5, i1:21, i2:38, c:['bull','bear'], l:'CHoCH', lr:false },
        { t:'text', i:21, p:110.1, s:['LH','HL'], c:'slate' },
        { t:'text', i:27, p:100.4, s:['LL','HH'], c:'slate' },
        { t:'ring', i:34, p:108.5, c:['bull','bear'], r:5 }
      ]
    },
    range: {
      n:40, seed:3, noise:0.5, wick:0.7,
      pts:[[0,105],[5,109.5],[10,100.5],[15,109.3],[20,100.8],[25,109.6],[30,100.4],[35,109],[39,105]],
      boxes:[{ i1:1, i2:39, p1:100, p2:110, c:'silver', op:0.06, border:true, l:'CHOP' }]
    },
    emaTrend: {
      n:100, show:46, seed:21, noise:0.9, wick:0.6,
      pts:[[0,86],[30,94],[45,92],[60,101],[70,98.5],[82,106],[90,103.5],[99,109]],
      ov:[{ t:'ema', n:50, c:'blue', l:'50 EMA' }],
      marks:[{ t:'ring', i:90, p:103.3, c:['bull','bear'], r:5 }]
    },
    emaFlat: {
      n:100, show:46, seed:9, noise:1.1, wick:0.7,
      pts:[[0,100],[12,104],[25,97],[38,103.5],[52,96.5],[64,103],[76,97],[88,103],[99,100]],
      ov:[{ t:'ema', n:50, c:'blue', l:'50 EMA' }]
    },
    sweep: {
      n:40, seed:14, noise:0.35, wick:0.5,
      pts:[[0,102],[4,103.6],[8,100.8],[12,103.5],[16,100.9],[20,103.4],[24,101.1],[25,100.6],[26,101.6],[30,103.6],[34,106],[39,108]],
      fix:{ 25:{ o:101.2, c:100.6, h:101.4, l:100.3 }, 26:{ o:100.6, c:101.9, h:102.1, l:98.2 } },
      boxes:[{ i1:1, i2:24, p1:100.5, p2:104, c:'slate', op:0.08, l:'ASIAN RANGE', lt:'below' }],
      marks:[
        { t:'hline', p:100.5, i1:1, c:['bull','bear'], l:['SSL','BSL'] },
        { t:'ring', i:26, p:98.4, c:'amber', r:5 },
        { t:'text', i:26, p:96.6, s:'SWEEP', c:'amber' },
        { t:'arrow', pts:[[28,102.5],[37,107]], c:['bull','bear'] }
      ],
      fitExtra:[96]
    },
    contin: {
      n:40, seed:8, noise:0.4, wick:0.55,
      pts:[[0,100],[8,104],[13,102],[20,106.5],[25,104.2],[31,109],[39,112]],
      marks:[
        { t:'hline', p:106.5, i1:20, i2:33, c:'slate', l:'BOS', lr:false },
        { t:'arrow', pts:[[26,105],[36,111]], c:['bull','bear'] }
      ]
    },
    midRange: {
      n:40, seed:4, noise:0.5, wick:0.6,
      pts:[[0,104],[6,108.5],[12,100.8],[18,108.2],[24,101.2],[30,105.6],[34,104.4],[39,105.2]],
      boxes:[{ i1:1, i2:39, p1:100.5, p2:109, c:'slate', op:0.06, border:true }],
      marks:[{ t:'dot', i:39, p:105.2, c:'amber' }, { t:'text', i:33, p:111, s:'NO SWEEP · MID-RANGE', c:'amber' }],
      fitExtra:[112]
    },
    ob: {
      n:40, seed:31, noise:0.35, wick:0.5,
      pts:[[0,108],[7,104.5],[13,102.6],[14,101.4],[15,104],[16,107.6],[20,110],[24,111.5],[30,107],[35,103.6],[37,104.2],[39,106]],
      fix:{ 14:{ o:103.2, c:101.4, h:103.5, l:100.9 }, 15:{ o:101.4, c:104.6, h:104.9, l:101.2 }, 16:{ o:104.6, c:107.8, h:108.1, l:104.3 } },
      boxes:[{ i1:14, i2:39, p1:100.9, p2:103.5, c:['bull','bear'], op:0.16, border:true, l:'ORDER BLOCK', lt:'below' }],
      marks:[{ t:'ring', i:35, p:103.5, c:['bull','bear'], r:5 }]
    },
    fvg: {
      n:40, seed:12, noise:0.35, wick:0.5,
      pts:[[0,101],[10,102.5],[14,102.6],[15,105],[16,108.3],[22,110.5],[28,108],[34,105],[36,104.6],[39,106.5]],
      fix:{ 14:{ o:102.3, c:103.1, h:103.4, l:101.9 }, 15:{ o:103.1, c:107.6, h:107.9, l:102.9 }, 16:{ o:107.6, c:108.7, h:109.1, l:105.4 } },
      boxes:[{ i1:14, i2:39, p1:103.4, p2:105.4, c:['bull','bear'], op:0.18, border:true, l:'FVG', lt:'below' }],
      marks:[{ t:'ring', i:35, p:104.4, c:['bull','bear'], r:5 }]
    },
    flip: {
      n:40, seed:19, noise:0.35, wick:0.55,
      pts:[[0,101],[6,104.8],[10,102],[15,104.9],[19,102.3],[24,108],[27,109.4],[31,105.6],[33,105.4],[36,107.5],[39,109]],
      marks:[
        { t:'hline', p:105, c:['bull','bear'], l:['S/R FLIP','S/R FLIP'] },
        { t:'text', i:10, p:107, s:['RESISTANCE','SUPPORT'], c:'slate' },
        { t:'ring', i:32, p:105.2, c:['bull','bear'], r:5 }
      ]
    },
    noZone: {
      n:40, seed:23, noise:0.45, wick:0.6,
      pts:[[0,100],[10,104],[16,108],[22,109.5],[28,106.5],[34,107.2],[39,106.8]],
      boxes:[{ i1:4, i2:39, p1:100, p2:101.6, c:'slate', op:0.1, l:'ZONE' }, { i1:12, i2:39, p1:111, p2:112.6, c:'slate', op:0.1, l:'ZONE', lt:'below' }],
      marks:[{ t:'dot', i:39, p:106.8, c:'amber' }, { t:'text', i:30, p:103.8, s:'OPEN SPACE', c:'amber' }],
      fitExtra:[113.5, 99]
    },
    trigChoch: {
      n:40, seed:27, noise:0.3, wick:0.5,
      pts:[[0,108],[6,105],[9,106.6],[15,103],[18,104.8],[23,101.2],[25,100.4],[26,101.8],[27,105.6],[28,106.6],[32,105.6],[36,106.2],[39,107.6]],
      fix:{ 26:{ o:100.6, c:102, h:102.2, l:100.2 }, 27:{ o:102, c:105.9, h:106.1, l:101.8 }, 28:{ o:105.9, c:106.9, h:107.2, l:104.4 } },
      boxes:[{ i1:26, i2:39, p1:102.2, p2:104.4, c:['bull','bear'], op:0.18, border:true, l:'FVG', lt:'below' }],
      marks:[{ t:'hline', p:104.8, i1:18, i2:31, c:['bull','bear'], l:'CHoCH', lr:false }, { t:'ring', i:25, p:100.2, c:'amber', r:4.5 }]
    },
    trigEngulf: {
      n:40, seed:6, noise:0.3, wick:0.5,
      pts:[[0,109],[10,106],[18,104],[26,102.4],[33,101.6],[34,101.3],[35,102.6],[39,104]],
      fix:{ 34:{ o:102.2, c:101.2, h:102.4, l:100.8 }, 35:{ o:101.1, c:103.2, h:103.4, l:100.9 } },
      boxes:[{ i1:20, i2:39, p1:100.5, p2:102.4, c:['bull','bear'], op:0.14, l:'ZONE', lt:'below' }],
      marks:[{ t:'ring', i:35, p:102.2, c:['bull','bear'], r:6 }, { t:'text', i:35, p:105.6, s:'ENGULFING', c:['bull','bear'] }],
      fitExtra:[106.5]
    },
    trigNone: {
      n:40, seed:15, noise:0.25, wick:0.6,
      pts:[[0,108],[12,105],[22,102.4],[28,101.6],[33,102],[39,101.7]],
      boxes:[{ i1:20, i2:39, p1:100.5, p2:102.4, c:'slate', op:0.12, l:'ZONE', lt:'below' }],
      marks:[{ t:'text', i:33, p:104.6, s:'NO SIGNAL YET', c:'amber' }],
      fitExtra:[105.5]
    },
    levels: {
      n:44, seed:14, noise:0.3, wick:0.45,
      pts:[[0,104],[5,109.4],[9,104.5],[14,107],[19,102.2],[22,100.6],[23,101.8],[27,105],[28,106.2],[31,105],[35,103.8],[39,104.3],[43,104.8]],
      fix:{ 5:{ o:108.9, c:109.3, h:109.6, l:108.7 }, 22:{ o:101.6, c:100.9, h:101.8, l:99.2 }, 23:{ o:100.9, c:102.6, h:102.9, l:100.7 }, 28:{ o:105.8, c:106.1, h:106.6, l:105.6 } },
      boxes:[{ i1:23, i2:43, p1:101.8, p2:102.9, c:'bull', op:0.18, border:true, l:'ZONE TOP / BOTTOM', lt:'below' }],
      marks:[
        { t:'hline', p:109.6, i1:5, c:'bull', l:'LIQ ABOVE' },
        { t:'hline', p:106.6, i1:28, c:'silver', l:'SWING HIGH' },
        { t:'hline', p:99.2, i1:22, c:'bear', l:'SWING LOW' },
        { t:'ring', i:22, p:99.4, c:'amber', r:4.5 },
        { t:'dot', i:43, p:104.8, c:'blue' },
        { t:'text', i:42, p:103.2, s:'NOW', c:'blue', a:'end' }
      ],
      fitExtra:[110.2, 98.6]
    },

    // ── added for Day / Swing / Position / Key ──
    fibGolden: {
      n:40, seed:33, noise:0.3, wick:0.5,
      pts:[[0,101],[4,100],[16,112],[19,111.4],[24,108.4],[29,104.8],[31,104.2],[33,105.4],[37,108],[39,109.4]],
      boxes:[{ i1:16, i2:39, p1:104.2, p2:104.6, c:'amber', op:0.35, l:'GOLDEN POCKET', lt:'below' }],
      ov:[{ t:'level', p:112, i1:16, c:'slate', l:'0%' }, { t:'level', p:106, i1:16, c:'slate', l:'50%', dash:'2,3' },
          { t:'level', p:104.58, i1:16, c:'amber', l:'61.8%' }, { t:'level', p:102.57, i1:16, c:'slate', l:'78.6%', dash:'2,3' }, { t:'level', p:100, i1:4, c:'slate', l:'100%' }],
      marks:[{ t:'line', a:[4,100], b:[16,112], c:'slate', w:0.8, dash:'2,2' }, { t:'ring', i:31, p:104.3, c:['bull','bear'], r:5 }]
    },
    snd: {
      n:40, seed:44, noise:0.3, wick:0.5,
      pts:[[0,110],[6,104],[8,102.4],[13,102.8],[15,106],[19,111.5],[24,112.5],[30,108],[35,103.6],[37,104],[39,106]],
      fix:{ 9:{ o:102.6, c:102.9, h:103.4, l:102.1 }, 10:{ o:102.9, c:102.5, h:103.3, l:102 }, 11:{ o:102.5, c:102.8, h:103.2, l:102.2 }, 12:{ o:102.8, c:102.6, h:103.4, l:102.1 } },
      boxes:[{ i1:9, i2:39, p1:102, p2:103.4, c:['bull','bear'], op:0.18, border:true, l:['DEMAND · DROP-BASE-RALLY','SUPPLY · RALLY-BASE-DROP'], lt:'below' }],
      marks:[{ t:'ring', i:35, p:103.4, c:['bull','bear'], r:5 }]
    },
    bosPull: {
      n:40, seed:52, noise:0.35, wick:0.55,
      pts:[[0,100],[6,104],[11,101.6],[18,106.2],[22,104],[29,109.2],[33,107.4],[36,106.4],[39,106.8]],
      marks:[{ t:'hline', p:106.2, i1:18, i2:31, c:['bull','bear'], l:'BOS', lr:false }, { t:'text', i:35, p:104.6, s:['PULLBACK','PULLBACK'], c:'amber' },
             { t:'arrow', pts:[[30,109.6],[37,106.2]], c:'amber', dash:'2,2' }]
    },
    maStack: {
      n:320, show:70, seed:61, noise:1.1, wick:0.6,
      pts:[[0,70],[120,82],[200,92],[250,98],[275,96],[300,104],[319,108]],
      ov:[{ t:'sma', n:50, c:'blue', l:'50' }, { t:'sma', n:200, c:'silver', l:'200' }]
    },
    maMixed: {
      n:320, show:70, seed:17, noise:0.55, wick:0.45,
      pts:[[0,96],[90,104],[170,96],[220,102],[250,95],[280,101],[300,97],[319,99]],
      ov:[{ t:'sma', n:50, c:'blue', l:'50' }, { t:'sma', n:200, c:'silver', l:'200' }]
    },
    maPull50: {
      n:300, show:60, seed:71, noise:0.8, wick:0.55,
      pts:[[0,72],[150,86],[220,94],[262,104],[284,98.8],[289,98.2],[299,101.5]],
      ov:[{ t:'sma', n:50, c:'blue', l:'50 MA' }, { t:'sma', n:200, c:'silver', l:'200 MA' }],
      marks:[{ t:'ring', i:288, p:98, c:['bull','bear'], r:5 }]
    },
    maPull200: {
      n:300, show:60, seed:73, noise:0.8, wick:0.55,
      pts:[[0,80],[150,88],[230,94],[262,99.5],[286,91.6],[290,91.4],[299,94]],
      ov:[{ t:'sma', n:50, c:'blue', l:'50 MA' }, { t:'sma', n:200, c:'silver', l:'200 MA' }],
      marks:[{ t:'ring', i:289, p:91.3, c:'amber', r:5 }]
    },
    maExtended: {
      n:300, show:60, seed:75, noise:0.8, wick:0.55,
      pts:[[0,72],[150,84],[230,92],[262,98],[285,108],[299,113]],
      ov:[{ t:'sma', n:50, c:'blue', l:'50 MA' }, { t:'sma', n:200, c:'silver', l:'200 MA' }],
      marks:[{ t:'text', i:280, p:116, s:'TOO FAR FROM THE MA', c:'amber' }],
      fitExtra:[117.5]
    },
    push12: {
      n:40, seed:81, noise:0.35, wick:0.55,
      pts:[[0,100],[9,106],[14,103],[24,110],[29,107],[33,106.2],[39,106.6]],
      marks:[{ t:'text', i:9, p:107.6, s:'1', c:['bull','bear'], size:9 }, { t:'text', i:24, p:111.6, s:'2', c:['bull','bear'], size:9 },
             { t:'text', i:34, p:104.4, s:'ROOM FOR PUSH 3', c:'slate' }],
      fitExtra:[112.6]
    },
    push3: {
      n:40, seed:83, noise:0.35, wick:0.55,
      pts:[[0,100],[7,106],[11,103.4],[19,109.5],[23,107.4],[32,112],[36,110.6],[39,111]],
      marks:[{ t:'text', i:7, p:107.6, s:'1', c:'slate', size:9 }, { t:'text', i:19, p:111.1, s:'2', c:'slate', size:9 }, { t:'text', i:32, p:113.6, s:'3', c:'amber', size:9 },
             { t:'text', i:22, p:114.6, s:'3RD PUSH = EXHAUSTION', c:'amber' }],
      fitExtra:[115.5]
    },
    trendEarly: {
      n:40, seed:91, noise:0.4, wick:0.55,
      pts:[[0,112],[8,104],[12,106.6],[18,101],[22,104.8],[26,103],[33,108.6],[36,107.2],[39,108.4]],
      marks:[{ t:'hline', p:106.6, i1:12, i2:30, c:['bull','bear'], l:'CHoCH', lr:false }, { t:'text', i:34, p:111, s:'NEW TREND · LEG 1', c:['bull','bear'] }],
      fitExtra:[112.5]
    },
    trendMature: {
      n:40, seed:93, noise:0.35, wick:0.5,
      pts:[[0,92],[5,97],[8,95],[13,101],[16,99],[21,105],[24,103.4],[29,108],[32,106.8],[36,110],[39,109.4]],
      marks:[{ t:'text', i:29, p:111.6, s:'5TH LEG · SMALLER PUSHES', c:'amber' }],
      fitExtra:[112.6]
    }
  };
  const C = (k, dir) => () => D.chart(DG[k], dir);

  // SAST day timeline for the session question
  function sessionBar(s, mode){
    const LW = mode === 'day' ? s.loD : s.lo, NW = mode === 'day' ? s.nyD : s.ny;
    const tag = mode === 'day' ? ['LONDON', 'NEW YORK'] : ['LONDON KZ', 'NEW YORK KZ'];
    const W = 260, X = m => 6 + m / 1440 * (W - 12);
    const seg = (a, b, c, op) => a <= b
      ? `<rect x="${X(a).toFixed(1)}" y="18" width="${(X(b) - X(a)).toFixed(1)}" height="16" rx="3" fill="${c}" opacity="${op}"/>`
      : seg(a, 1440, c, op) + seg(0, b, c, op);
    const lab = (m, t, c) => `<text x="${X(m).toFixed(1)}" y="13" text-anchor="middle" font-family="'DM Mono',monospace" font-size="6.5" font-weight="bold" fill="${c}">${t}</text>`;
    const mid = w => (w[0] + w[1]) / 2;
    let sv = `<rect x="6" y="18" width="${W - 12}" height="16" rx="3" fill="#8AA4BF" opacity="0.12"/>`;
    sv += seg(0, LW[0] - 60, '#8AA4BF', 0.22);
    sv += seg(LW[0], LW[1], '#2A8FE3', 0.85) + seg(NW[0], NW[1], '#22D67A', 0.85);
    sv += lab(mid([0, LW[0] - 60]), mode === 'day' ? 'ASIA · NO ENTRIES' : 'ASIA · NO SCALPS', '#8AA4BF') + lab(mid(LW), tag[0], '#96D0FF') + lab(mid(NW), tag[1], '#22D67A');
    [0, 360, 720, 1080].forEach(m => sv += `<text x="${X(m).toFixed(1)}" y="44" text-anchor="${m ? 'middle' : 'start'}" font-family="'DM Mono',monospace" font-size="6" fill="rgba(255,255,255,0.4)">${String(m / 60).padStart(2,'0')}:00</text>`);
    const x = X(s.now);
    sv += `<line x1="${x.toFixed(1)}" y1="15" x2="${x.toFixed(1)}" y2="37" stroke="#F5B841" stroke-width="1.6"/><text x="${x.toFixed(1)}" y="53" text-anchor="middle" font-family="'DM Mono',monospace" font-size="7" font-weight="bold" fill="#F5B841">NOW ${s.nowTxt}</text>`;
    return `<svg width="100%" viewBox="0 0 ${W} 58" style="max-width:520px;display:block;" xmlns="http://www.w3.org/2000/svg">${sv}</svg>`;
  }


  // premium / discount mini diagram (not mirrored — the price position changes)
  function pdDg(where){
    const end = { discount:102.8, premium:109.4, eq:106 }[where];
    return BMX.render({
      n:40, seed:41, noise:0.35, wick:0.55,
      pts:[[0,104],[5,100.2],[18,112],[24,110],[30,107],[36,end + (where === 'premium' ? -0.6 : where === 'discount' ? 0.6 : 0.4)],[39,end]],
      boxes:[{ i1:5, i2:39, p1:106, p2:112, c:'bear', op:0.09 }, { i1:5, i2:39, p1:100, p2:106, c:'bull', op:0.09 }],
      ov:[{ t:'level', p:106, c:'silver', l:'50% EQ', dash:'3,3' }, { t:'level', p:112, c:'bear', l:'PREMIUM', w:0.8 }, { t:'level', p:100.2, c:'bull', l:'DISCOUNT', w:0.8 }],
      marks:[{ t:'dot', i:39, p:end, c:'amber', r:3.6 }]
    });
  }

  UT.DG = DG; UT.C = C; UT.sessionBar = sessionBar; UT.pdDg = pdDg;
  // instrument picker shared by every strategy
  UT.INSTR = [
          ['Metals', [['XAUUSD','Gold'],['XAGUSD','Silver']]],
          ['Indices', [['NAS100','Nasdaq'],['US30','Dow Jones'],['SPX500','S&P 500'],['GER40','DAX'],['UK100','FTSE 100']]],
          ['Forex', [['EURUSD','Euro'],['GBPUSD','Cable'],['USDJPY','Yen'],['GBPJPY','Guppy'],['EURJPY','Euro/Yen'],['AUDUSD','Aussie'],['USDCAD','Loonie'],['USDZAR','Rand']]],
          ['Energy & Crypto', [['USOIL','WTI Oil'],['BTCUSD','Bitcoin']]]
        ];
})();
