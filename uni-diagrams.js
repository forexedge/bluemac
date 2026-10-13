// ══════════════════════════════════════════════════════
// BLUE MAC UNIVERSITY — custom lesson diagrams
// Same visual language as the Examples tab (260×150, DM Mono labels)
// ══════════════════════════════════════════════════════
window.BMUD = (function(){
  const C = { bull:'#22D67A', bear:'#FF5C5C', blue:'#2A8FE3', light:'#96D0FF', silver:'#E4E8EE', slate:'#8AA4BF', amber:'#F5B841', dim:'rgba(255,255,255,0.4)', txt:'rgba(255,255,255,0.85)' };
  const S = s => `<svg width="100%" viewBox="0 0 260 150" style="max-width:320px;display:block;" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
  const t = (x, y, s, c = C.txt, z = 7, a = 'middle', w = 'bold') => `<text x="${x}" y="${y}" text-anchor="${a}" font-family="'DM Mono',monospace" font-size="${z}" font-weight="${w}" fill="${c}">${String(s).replace(/&(?![a-z#0-9]+;)/g, '&amp;')}</text>`;
  const r = (x, y, w, h, f, o = 0.15, st = null, rx = 4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" fill-opacity="${o}" ${st ? `stroke="${st}" stroke-width="0.9" stroke-opacity="0.7"` : ''}/>`;
  const l = (x1, y1, x2, y2, c = C.dim, w = 1, d = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${d ? `stroke-dasharray="${d}"` : ''}/>`;
  const pl = (pts, c, w = 1.8, d = '') => `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${d ? `stroke-dasharray="${d}"` : ''}/>`;
  const arrowHead = (x, y, ang, c) => { const L = 7, w = 4, co = Math.cos(ang), si = Math.sin(ang);
    return `<polygon points="${x},${y} ${(x - L * co + w * si).toFixed(1)},${(y - L * si - w * co).toFixed(1)} ${(x - L * co - w * si).toFixed(1)},${(y - L * si + w * co).toFixed(1)}" fill="${c}"/>`; };
  const arr = (x1, y1, x2, y2, c, w = 1.6, d = '') => l(x1, y1, x2, y2, c, w, d) + arrowHead(x2, y2, Math.atan2(y2 - y1, x2 - x1), c);
  const candle = (x, o, c, h, lo, w = 10, col) => { const cc = col || (c < o ? C.bull : C.bear);
    return l(x, h, x, lo, cc, 1.4) + `<rect x="${x - w / 2}" y="${Math.min(o, c)}" width="${w}" height="${Math.max(Math.abs(o - c), 1.5)}" fill="${cc}" rx="1"/>`; };

  return {
    // ── LEVEL 1 ──
    pair: () => S(
      t(130, 26, 'EUR / USD = 1.0850', '#fff', 15) +
      r(22, 44, 100, 58, C.blue, 0.12, C.blue) + r(138, 44, 100, 58, C.amber, 0.1, C.amber) +
      t(72, 64, 'EUR', C.blue, 14) + t(72, 80, 'BASE CURRENCY', C.blue, 6.5) + t(72, 92, 'what you buy or sell', C.dim, 6.5, 'middle', 'normal') +
      t(188, 64, 'USD', C.amber, 14) + t(188, 80, 'QUOTE CURRENCY', C.amber, 6.5) + t(188, 92, 'what you pay with', C.dim, 6.5, 'middle', 'normal') +
      t(130, 122, '1 EURO COSTS 1.0850 US DOLLARS', C.silver, 7.5) +
      t(70, 140, '▲ BUY = EUR UP', C.bull, 7) + t(190, 140, '▼ SELL = EUR DOWN', C.bear, 7)),

    pairs: () => {
      const cols = [['MAJORS', C.bull, ['EURUSD','GBPUSD','USDJPY','USDCHF','AUDUSD','USDCAD','NZDUSD']],
                    ['CROSSES', C.blue, ['EURGBP','EURJPY','GBPJPY','AUDJPY','EURAUD']],
                    ['EXOTICS', C.amber, ['USDZAR','USDTRY','USDMXN','EURZAR']],
                    ['METALS/INDICES', C.light, ['XAUUSD','XAGUSD','US30','NAS100','GER40']]];
      let s = '';
      cols.forEach(([h, c, list], k) => { const x = 6 + k * 63;
        s += r(x, 10, 59, 116, c, 0.08, c) + t(x + 29.5, 24, h, c, 6.5);
        list.forEach((p, i) => { s += t(x + 29.5, 40 + i * 12, p, C.txt, 7, 'middle', 'normal'); }); });
      return S(s + t(130, 142, 'START WITH MAJORS · TIGHTEST SPREADS · MOST PREDICTABLE', C.dim, 6.3));
    },

    pyramid: () => {
      const tiers = [['CENTRAL BANKS', 'SARB · FED · ECB', C.amber], ['COMMERCIAL BANKS', 'the interbank market', C.blue], ['FUNDS & INSTITUTIONS', 'hedge funds · asset managers', C.light], ['CORPORATIONS', 'importers · exporters', C.slate], ['RETAIL TRADERS', 'you and me', C.silver]];
      let s = '';
      tiers.forEach(([a, b, c], i) => { const y = 10 + i * 25, half = 44 + i * 16;
        s += `<polygon points="${110 - half + 10},${y} ${110 + half - 10},${y} ${110 + half},${y + 22} ${110 - half},${y + 22}" fill="${c}" fill-opacity="0.16" stroke="${c}" stroke-opacity="0.6" stroke-width="0.8"/>`;
        s += t(110, y + 10, a, c, 6.5) + t(110, y + 19, b, C.dim, 5.8, 'middle', 'normal'); });
      s += arr(232, 128, 232, 14, C.amber) + t(244, 70, 'SIZE', C.amber, 6.5) + t(244, 79, 'POWER', C.amber, 6.5);
      return S(s);
    },

    pips: () => S(
      t(28, 30, '1.08', '#fff', 22, 'start') + t(84, 30, '5', '#fff', 22, 'start') + t(100, 30, '2', C.amber, 22, 'start') + t(116, 30, '7', C.light, 22, 'start') +
      l(107, 36, 107, 50, C.amber) + t(107, 60, '4TH DECIMAL = 1 PIP', C.amber, 6.5) +
      l(123, 36, 140, 72, C.light) + t(170, 80, '5TH = PIPETTE (0.1 PIP)', C.light, 6.5) +
      r(14, 92, 232, 46, C.blue, 0.06, C.blue) +
      t(130, 106, 'EURUSD 1.0850 → 1.0900 = +50 PIPS', C.bull, 7.5) +
      t(130, 119, 'USDJPY: pip = 2nd decimal (157.42 → 157.52 = 10 pips)', C.dim, 6.2, 'middle', 'normal') +
      t(130, 131, 'GOLD: most brokers count $0.10 as 1 pip — check yours', C.dim, 6.2, 'middle', 'normal')),

    lots: () => {
      const b = [['MICRO', '0.01 LOT', '1,000 units', '≈ $0.10 / pip', C.bull], ['MINI', '0.10 LOT', '10,000 units', '≈ $1 / pip', C.amber], ['STANDARD', '1.00 LOT', '100,000 units', '≈ $10 / pip', C.bear]];
      let s = '';
      b.forEach(([a, b2, c2, d, col], i) => { const x = 8 + i * 84, h = 40 + i * 22, y = 112 - h;
        s += r(x, y, 76, h, col, 0.14, col) + t(x + 38, y - 16, a, col, 7.5) + t(x + 38, y - 6, b2, '#fff', 7.5);
        s += t(x + 38, y + 14, c2, C.dim, 6.2, 'middle', 'normal') + t(x + 38, y + 26, d, col, 7); });
      return S(s + t(130, 128, 'PIP VALUES FOR PAIRS QUOTED IN USD (EURUSD, GBPUSD…)', C.dim, 6.2) + t(130, 142, 'BEGINNERS: START WITH MICRO LOTS', C.bull, 7));
    },

    leverage: () => S(
      r(14, 70, 52, 40, C.blue, 0.2, C.blue) + t(40, 86, 'YOUR', C.light, 6.5) + t(40, 98, '$1,000', '#fff', 8) +
      arr(72, 90, 104, 90, C.amber) + t(88, 82, '1:100', C.amber, 7) +
      r(110, 18, 140, 92, C.amber, 0.1, C.amber) + t(180, 56, 'CONTROLS', C.dim, 6.5) + t(180, 70, '$100,000', '#fff', 12) + t(180, 84, '(1 STANDARD LOT)', C.dim, 6.3) +
      r(14, 120, 232, 22, C.bear, 0.1, C.bear) + t(130, 134, 'A 1% MOVE AGAINST YOU = −$1,000 = YOUR WHOLE ACCOUNT', C.bear, 6.4)),

    spread: () => S(
      l(20, 40, 150, 40, C.bear, 1.6) + t(24, 34, 'ASK 1.08512', C.bear, 7.5, 'start') + t(148, 34, 'you BUY here', C.dim, 6.3, 'end', 'normal') +
      l(20, 70, 150, 70, C.bull, 1.6) + t(24, 82, 'BID 1.08500', C.bull, 7.5, 'start') + t(148, 82, 'you SELL here', C.dim, 6.3, 'end', 'normal') +
      r(20, 41, 130, 28, C.amber, 0.1) + t(85, 58, 'SPREAD = 1.2 PIPS', C.amber, 7.5) +
      r(162, 14, 88, 30, C.amber, 0.08, C.amber) + t(206, 27, 'SPREAD', C.amber, 7) + t(206, 38, 'paid on every trade', C.dim, 5.8, 'middle', 'normal') +
      r(162, 50, 88, 30, C.blue, 0.08, C.blue) + t(206, 63, 'COMMISSION', C.blue, 7) + t(206, 74, 'raw/ECN accounts', C.dim, 5.8, 'middle', 'normal') +
      r(162, 86, 88, 30, C.slate, 0.1, C.slate) + t(206, 99, 'SWAP', C.slate, 7) + t(206, 110, 'held past rollover', C.dim, 5.8, 'middle', 'normal') +
      t(130, 138, 'EVERY TRADE STARTS SLIGHTLY NEGATIVE — THE SPREAD', C.silver, 6.5)),

    broker: () => {
      const p = [['🛡️', 'REGULATED', 'FSCA FSP no.', C.bull], ['💸', 'LOW COST', 'tight spreads', C.amber], ['⚡', 'EXECUTION', 'no requotes', C.blue], ['🏦', 'ZAR FUNDING', 'fast withdrawals', C.light], ['💬', 'SUPPORT', 'real people', C.slate]];
      let s = r(8, 112, 244, 12, C.silver, 0.12, C.silver, 2) + r(8, 14, 244, 10, C.silver, 0.12, C.silver, 2);
      p.forEach(([ic, a, b, c], i) => { const x = 14 + i * 48;
        s += r(x, 28, 40, 80, c, 0.1, c, 3) + t(x + 20, 50, ic, '#fff', 13, 'middle', 'normal') + t(x + 20, 72, a, c, 5.4) + t(x + 20, 84, b, C.dim, 5.2, 'middle', 'normal'); });
      return S(s + t(130, 140, 'VERIFY THE FSP NUMBER ON FSCA.CO.ZA BEFORE YOU DEPOSIT', C.bull, 6.3));
    },

    platforms: () => S(
      r(8, 30, 74, 74, C.blue, 0.1, C.blue) + t(45, 52, '📈', '#fff', 16, 'middle', 'normal') + t(45, 74, 'TRADINGVIEW', C.blue, 6.5) + t(45, 86, 'charts & analysis', C.dim, 5.8, 'middle', 'normal') +
      arr(84, 67, 98, 67, C.dim) +
      r(100, 30, 74, 74, C.amber, 0.1, C.amber) + t(137, 52, '⚡', '#fff', 16, 'middle', 'normal') + t(137, 74, 'MT4 / MT5', C.amber, 6.5) + t(137, 86, 'place the trade', C.dim, 5.8, 'middle', 'normal') +
      arr(176, 67, 190, 67, C.dim) +
      r(192, 30, 60, 74, C.bull, 0.1, C.bull) + t(222, 52, '📓', '#fff', 16, 'middle', 'normal') + t(222, 74, 'BLUE MAC', C.bull, 6.5) + t(222, 86, 'plan & journal', C.dim, 5.8, 'middle', 'normal') +
      t(45, 20, '1 · ANALYSE', C.dim, 6.5) + t(137, 20, '2 · EXECUTE', C.dim, 6.5) + t(222, 20, '3 · REVIEW', C.dim, 6.5) +
      t(130, 128, 'PRACTISE ON A DEMO ACCOUNT FIRST — SAME PLATFORM, FAKE MONEY', C.silver, 6.2)),

    longshort: () => S(
      r(6, 8, 120, 120, C.bull, 0.05, C.bull) + t(66, 22, '▲ LONG (BUY)', C.bull, 7.5) +
      pl([[18, 108], [40, 96], [52, 102], [78, 70], [90, 76], [114, 40]], C.bull) +
      `<circle cx="18" cy="108" r="3.5" fill="${C.blue}"/>` + t(30, 122, 'BUY LOW', C.blue, 6.5, 'start') +
      `<circle cx="114" cy="40" r="3.5" fill="${C.bull}"/>` + t(112, 32, 'SELL HIGHER ✓', C.bull, 6.5, 'end') +
      r(134, 8, 120, 120, C.bear, 0.05, C.bear) + t(194, 22, '▼ SHORT (SELL)', C.bear, 7.5) +
      pl([[146, 40], [168, 52], [180, 46], [206, 78], [218, 72], [242, 108]], C.bear) +
      `<circle cx="146" cy="40" r="3.5" fill="${C.blue}"/>` + t(150, 34, 'SELL HIGH', C.blue, 6.5, 'start') +
      `<circle cx="242" cy="108" r="3.5" fill="${C.bear}"/>` + t(240, 122, 'BUY BACK LOWER ✓', C.bear, 6.5, 'end') +
      t(130, 143, 'YOU CAN PROFIT IN BOTH DIRECTIONS', C.silver, 6.8)),

    orders: () => S(
      l(10, 75, 250, 75, '#fff', 1.6) + t(14, 71, 'CURRENT PRICE', '#fff', 6.5, 'start') +
      l(130, 32, 250, 32, C.bear, 1.2, '4,3') + t(246, 27, 'SELL LIMIT', C.bear, 7, 'end') + t(246, 42, 'sell HIGHER (into resistance)', C.dim, 5.8, 'end', 'normal') +
      l(10, 50, 128, 50, C.bull, 1.2, '4,3') + t(14, 45, 'BUY STOP', C.bull, 7, 'start') + t(14, 60, 'buy a breakout ABOVE', C.dim, 5.8, 'start', 'normal') +
      l(130, 118, 250, 118, C.bull, 1.2, '4,3') + t(246, 113, 'BUY LIMIT', C.bull, 7, 'end') + t(246, 128, 'buy CHEAPER (into support)', C.dim, 5.8, 'end', 'normal') +
      l(10, 100, 128, 100, C.bear, 1.2, '4,3') + t(14, 95, 'SELL STOP', C.bear, 7, 'start') + t(14, 110, 'sell a breakdown BELOW', C.dim, 5.8, 'start', 'normal') +
      t(130, 145, 'MARKET ORDER = BUY/SELL RIGHT NOW AT THE CURRENT PRICE', C.silver, 6)),

    sltp: () => S(
      pl([[12, 110], [40, 92], [56, 100], [80, 80]], 'rgba(255,255,255,0.6)') + pl([[80, 80], [104, 66], [116, 72], [150, 40], [162, 46], [190, 24]], C.bull, 2.4) +
      r(80, 24, 130, 56, C.bull, 0.1) + r(80, 80, 130, 26, C.bear, 0.14) +
      l(80, 80, 210, 80, C.blue, 1.4) + l(80, 106, 210, 106, C.bear, 1.2, '4,3') + l(80, 24, 210, 24, C.bull, 1.2, '4,3') +
      `<circle cx="80" cy="80" r="3.5" fill="${C.blue}"/>` +
      t(214, 83, 'ENTRY', C.blue, 6.8, 'start') + t(214, 109, 'SL', C.bear, 6.8, 'start') + t(214, 27, 'TP', C.bull, 6.8, 'start') +
      t(145, 98, 'STOP LOSS: "I WAS WRONG" EXIT', C.bear, 6) + t(145, 56, 'TAKE PROFIT: WHERE YOU GET PAID', C.bull, 6) +
      t(130, 136, 'SET BOTH BEFORE YOU ENTER — EVERY SINGLE TRADE', C.silver, 6.5)),

    // ── LEVEL 2 ──
    anatomy: () => S(
      candle(62, 100, 50, 30, 120, 22) + candle(198, 50, 100, 30, 120, 22) +
      t(62, 18, 'BULLISH', C.bull, 7.5) + t(198, 18, 'BEARISH', C.bear, 7.5) +
      l(74, 50, 96, 50, C.dim, 0.8, '2,2') + t(98, 52, 'CLOSE', C.txt, 6.3, 'start') + l(74, 100, 96, 100, C.dim, 0.8, '2,2') + t(98, 102, 'OPEN', C.txt, 6.3, 'start') +
      l(186, 50, 164, 50, C.dim, 0.8, '2,2') + t(162, 52, 'OPEN', C.txt, 6.3, 'end') + l(186, 100, 164, 100, C.dim, 0.8, '2,2') + t(162, 102, 'CLOSE', C.txt, 6.3, 'end') +
      t(62, 27, 'HIGH', C.dim, 6, 'middle', 'normal') + t(62, 131, 'LOW', C.dim, 6, 'middle', 'normal') + t(198, 27, 'HIGH', C.dim, 6, 'middle', 'normal') + t(198, 131, 'LOW', C.dim, 6, 'middle', 'normal') +
      t(46, 78, 'BODY', C.bull, 6.3, 'end') + t(56, 42, 'WICK', C.dim, 6.3, 'end') + t(214, 78, 'BODY', C.bear, 6.3, 'start') + t(204, 112, 'WICK', C.dim, 6.3, 'start') +
      t(130, 146, 'BODY = OPEN→CLOSE · WICKS = HOW FAR PRICE TRAVELLED', C.silver, 6)),

    timeframes: () => S(
      candle(28, 100, 88, 84, 104, 10) + candle(50, 88, 95, 82, 98, 10) + candle(72, 95, 70, 66, 97, 10) + candle(94, 70, 76, 62, 80, 10) +
      t(61, 22, '4 × H1 CANDLES', C.light, 7) + t(61, 122, '09:00 · 10:00 · 11:00 · 12:00', C.dim, 5.8, 'middle', 'normal') +
      t(130, 86, '=', '#fff', 16) +
      candle(190, 100, 76, 62, 104, 22) + t(190, 22, '1 × H4 CANDLE', C.amber, 7) + t(190, 122, '09:00 → 13:00', C.dim, 5.8, 'middle', 'normal') +
      l(100, 100, 178, 100, C.dim, 0.6, '2,3') + l(100, 62, 178, 62, C.dim, 0.6, '2,3') +
      t(130, 142, 'SAME PRICE ACTION — HIGHER TIMEFRAME = THE BIGGER PICTURE', C.silver, 6)),

    // ── LEVEL 4 ──
    drawdown: () => {
      const rows = [[10, 11.1], [20, 25], [30, 42.9], [50, 100], [75, 300]];
      let s = t(60, 16, 'YOU LOSE', C.bear, 7) + t(176, 16, 'YOU NEED TO GAIN', C.bull, 7);
      rows.forEach(([lo, g], i) => { const y = 26 + i * 22;
        s += r(100 - lo * 0.8, y, lo * 0.8, 14, C.bear, 0.45, null, 2) + t(96 - lo * 0.8, y + 10, `−${lo}%`, C.bear, 7, 'end');
        const w = Math.min(g, 300) * 0.38;
        s += r(116, y, w, 14, C.bull, 0.4, null, 2) + t(120 + w, y + 10, `+${g}%`, C.bull, 7, 'start'); });
      return S(s + l(108, 22, 108, 136, C.dim, 0.8) + t(130, 146, 'PROTECTING CAPITAL IS EASIER THAN WINNING IT BACK', C.silver, 6));
    },

    streak: () => {
      const rows = [['1% RISK', 90.4, C.bull], ['2% RISK', 81.7, C.light], ['5% RISK', 59.9, C.amber], ['10% RISK', 34.9, C.bear]];
      let s = t(130, 16, 'ACCOUNT LEFT AFTER 10 LOSSES IN A ROW', C.silver, 7);
      rows.forEach(([a, v, c], i) => { const y = 30 + i * 26;
        s += t(56, y + 11, a, c, 7, 'end') + r(62, y, 160, 16, '#fff', 0.04, null, 3) + r(62, y, v * 1.6, 16, c, 0.45, null, 3) + t(66 + v * 1.6, y + 11, `${v}%`, c, 7, 'start'); });
      return S(s + t(130, 142, 'LOSING STREAKS ARE NORMAL — SMALL RISK SURVIVES THEM', C.dim, 6.2));
    },

    // ── LEVEL 5 ──
    styles: () => {
      const rows = [['🔑 KEY', '1m → Monthly', 'AI-selected', 'flexible', C.amber], ['⚡ SCALP', '15m / 30m', 'minutes', 'high', C.bear], ['☀️ DAY', 'H1 / H4', 'hours', 'medium', C.blue], ['🌊 SWING', 'D1 / H4', '2–5 days', 'low', C.light], ['🏔️ POSITION', 'W1 / D1', 'weeks', 'very low', C.slate]];
      let s = t(56, 16, 'STYLE', C.dim, 6.3) + t(124, 16, 'CHARTS', C.dim, 6.3) + t(178, 16, 'HOLD', C.dim, 6.3) + t(226, 16, 'SCREEN TIME', C.dim, 6.3);
      rows.forEach(([a, b, c2, d, col], i) => { const y = 22 + i * 23;
        s += r(6, y, 248, 19, col, 0.08, col, 3) + t(14, y + 13, a, col, 7, 'start') + t(124, y + 13, b, C.txt, 6.8, 'middle', 'normal') + t(178, y + 13, c2, C.txt, 6.8, 'middle', 'normal') + t(226, y + 13, d, C.txt, 6.8, 'middle', 'normal'); });
      return S(s + t(130, 146, 'PICK THE STYLE THAT FITS YOUR LIFE — NOT YOUR EGO', C.silver, 6.2));
    },

    confluence: () => {
      const items = [['TREND', 'higher TF agrees'], ['LEVEL', 'S/R · OB · Fib · MA'], ['SIGNAL', 'candle or CHoCH'], ['R:R ≥ 1:2', 'room to target'], ['SESSION', 'London / New York'], ['NEWS', 'no red folder']];
      let s = '';
      items.forEach(([a, b], i) => { const x = i < 3 ? 10 : 132, y = 14 + (i % 3) * 34;
        s += r(x, y, 118, 28, C.bull, 0.08, C.bull, 4) + t(x + 13, y + 18, '✓', C.bull, 10) + t(x + 26, y + 13, a, '#fff', 7, 'start') + t(x + 26, y + 23, b, C.dim, 5.8, 'start', 'normal'); });
      s += r(10, 118, 240, 24, C.amber, 0.12, C.amber, 5) + t(130, 133, '6/6 = A+ SETUP · 4–5 = OK · UNDER 4 = NO TRADE', C.amber, 6.8);
      return S(s);
    },

    plan: () => {
      const b = [['🌍', 'MARKETS', 'which pairs you trade'], ['⏱️', 'STYLE & TFs', 'scalp / day / swing'], ['🎯', 'ENTRY RULES', 'exact checklist'], ['🚪', 'EXIT RULES', 'SL · TP · BE · trail'], ['🛡️', 'RISK RULES', '1% · max daily loss'], ['📓', 'ROUTINE', 'prep · journal · review']];
      let s = '';
      b.forEach(([ic, a, d], i) => { const x = 8 + (i % 3) * 83, y = 12 + Math.floor(i / 3) * 62;
        s += r(x, y, 78, 56, C.blue, 0.08, C.blue, 5) + t(x + 39, y + 20, ic, '#fff', 13, 'middle', 'normal') + t(x + 39, y + 36, a, C.light, 6.5) + t(x + 39, y + 47, d, C.dim, 5.6, 'middle', 'normal'); });
      return S(s + t(130, 144, 'IF IT IS NOT WRITTEN DOWN, IT IS NOT A PLAN', C.silver, 6.5));
    },

    journal: () => {
      const f = [['DATE', 'Tue 14 Oct · 10:20'], ['PAIR', 'EURUSD · LONG'], ['SETUP', '61.8% + 50 MA'], ['ENTRY / SL / TP', '1.0850 / 1.0830 / 1.0910'], ['R:R', '1 : 3'], ['RESULT', '+3R ✓'], ['FOLLOWED PLAN?', 'YES'], ['EMOTION', 'calm, patient'], ['LESSON', 'waited for the close — paid off']];
      let s = r(10, 8, 240, 134, C.blue, 0.05, C.blue, 6) + t(130, 22, '📓 TRADE JOURNAL ENTRY', C.light, 7.5);
      f.forEach(([a, b], i) => { const y = 38 + i * 11.5;
        s += t(20, y, a, C.dim, 6, 'start') + t(240, y, b, i === 5 ? C.bull : C.txt, 6.3, 'end', 'normal') + l(20, y + 3.5, 240, y + 3.5, 'rgba(255,255,255,0.05)'); });
      return S(s);
    },

    expectancy: () => S(
      t(130, 18, '100 TRADES · 40% WIN RATE · WINS = 2R · LOSSES = 1R', C.silver, 6.6) +
      r(20, 30, 80, 60, C.bull, 0.3, C.bull) + t(60, 56, '40 WINS', C.bull, 7.5) + t(60, 70, '+80R', '#fff', 10) +
      r(110, 30, 60, 60, C.bear, 0.3, C.bear) + t(140, 56, '60 LOSSES', C.bear, 7) + t(140, 70, '−60R', '#fff', 10) +
      t(186, 66, '=', '#fff', 14) + r(198, 30, 52, 60, C.amber, 0.2, C.amber) + t(224, 56, 'NET', C.amber, 7) + t(224, 70, '+20R', '#fff', 10) +
      r(14, 102, 232, 38, C.blue, 0.07, C.blue) + t(130, 116, 'EXPECTANCY = (WIN% × AVG WIN) − (LOSS% × AVG LOSS)', C.light, 6.4) +
      t(130, 130, '(0.4 × 2R) − (0.6 × 1R) = +0.2R PER TRADE', C.bull, 7)),

    backtest: () => {
      const st = [['1', 'WRITE THE RULES', 'exact entry/exit'], ['2', 'SCROLL BACK', 'hide the future'], ['3', 'LOG 100+ TRADES', 'no cherry-picking'], ['4', 'MEASURE', 'win% · avg R · DD'], ['5', 'DEMO, THEN LIVE', 'small size first']];
      let s = '';
      st.forEach(([n, a, b], i) => { const y = 10 + i * 26;
        s += `<circle cx="22" cy="${y + 11}" r="9" fill="${C.blue}" fill-opacity="0.25" stroke="${C.blue}"/>` + t(22, y + 14, n, '#fff', 8) +
             r(38, y, 214, 22, C.blue, 0.06, null, 4) + t(46, y + 14, a, '#fff', 7, 'start') + t(246, y + 14, b, C.dim, 6.3, 'end', 'normal');
        if(i < st.length - 1) s += l(22, y + 20, 22, y + 28, C.blue, 1); });
      return S(s + t(130, 146, 'PROVE THE EDGE ON HISTORY BEFORE YOU RISK REAL MONEY', C.silver, 6));
    },

    equity: () => {
      const a = [], b = []; let va = 100, vb = 100;
      const seqA = [1,-0.5,1,1,-0.5,1,-0.5,1,1,-0.5,1,1,-0.5,1,-0.5,1,1,1,-0.5,1];
      const seqB = [4,-3,5,-4,6,-6,3,7,-8,4,-5,6,-7,5,4,-6,3,-4,5,-1];
      seqA.forEach((d, i) => { va += d * 1.6; a.push([14 + i * 11.5, 110 - (va - 100) * 4]); });
      seqB.forEach((d, i) => { vb += d * 1.6; b.push([14 + i * 11.5, 110 - (vb - 100) * 4]); });
      return S(l(12, 110, 236, 110, C.dim, 0.6, '2,3') + pl(b, C.bear, 1.6) + pl(a, C.bull, 2.2) +
        t(236, a[a.length - 1][1] - 6, 'CONSISTENT', C.bull, 6.5, 'end') + t(150, 124, 'GAMBLING', C.bear, 6.5) +
        t(130, 144, 'A SMOOTH CURVE = A REAL EDGE · WILD SWINGS = OVER-RISKING', C.silver, 6));
    },

    // ── LEVEL 6 ──
    killzones: () => {
      const X = h => 14 + h * 9.7;
      const z = [[2, 6, 'ASIA', C.slate], [8, 11, 'LONDON KZ', C.blue], [13, 16, 'NEW YORK KZ', C.bull], [16, 18, 'LDN CLOSE', C.amber]];
      let s = r(X(0), 56, X(24) - X(0), 22, '#fff', 0.03, 'rgba(255,255,255,0.15)', 3);
      for(let h = 0; h <= 24; h += 3) s += l(X(h), 80, X(h), 84, C.dim) + t(X(h), 94, String(h).padStart(2, '0') + ':00', C.dim, 5.6, 'middle', 'normal');
      z.forEach(([a, b, n, c], i) => { s += r(X(a), 56, X(b) - X(a), 22, c, 0.35, c, 2) + t((X(a) + X(b)) / 2, i % 2 ? 108 : 46, n, c, 6.3); });
      s += t(130, 20, 'ICT KILLZONES IN SAST (US SUMMER TIME)', C.silver, 7.2);
      s += t(130, 128, 'NOV–MAR (US WINTER TIME): ADD 1 HOUR', C.amber, 6.5) + t(130, 142, 'THE BIG MOVES OF THE DAY START INSIDE THESE WINDOWS', C.dim, 6.2);
      return S(s);
    },

    // ── LEVEL 7 ──
    cycle: () => {
      const pts = [[10, 110], [30, 92], [50, 64], [70, 34], [86, 22], [100, 30], [116, 48], [134, 72], [152, 96], [168, 116], [182, 126], [198, 118], [214, 104], [232, 94], [250, 86]];
      const lab = [[30, 92, 'OPTIMISM', 'start'], [50, 64, 'EXCITEMENT', 'end'], [86, 22, 'EUPHORIA', 'middle'], [116, 48, 'ANXIETY', 'start'], [134, 72, 'DENIAL', 'start'], [152, 96, 'FEAR', 'start'], [182, 126, 'CAPITULATION', 'middle'], [214, 104, 'HOPE', 'end'], [250, 86, 'RELIEF', 'end']];
      let s = pl(pts, C.light, 2);
      lab.forEach(([x, y, n, a]) => { const dy = n === 'EUPHORIA' ? -8 : n === 'CAPITULATION' ? 14 : n === 'OPTIMISM' ? 12 : -6; const dx = a === 'end' ? -4 : a === 'start' ? 5 : 0;
        s += `<circle cx="${x}" cy="${y}" r="2.5" fill="${C.light}"/>` + t(x + dx, y + dy, n, n === 'EUPHORIA' ? C.bear : n === 'CAPITULATION' ? C.bull : C.txt, 6.2, a); });
      s += t(86, 8, 'MAX RISK', C.bear, 6) + t(182, 146, 'MAX OPPORTUNITY', C.bull, 6);
      return S(s);
    },

    revenge: () => {
      let s = r(6, 8, 120, 120, C.amber, 0.05, C.amber) + t(66, 22, 'FOMO', C.amber, 8);
      s += pl([[16, 104], [36, 98], [52, 88], [64, 60], [74, 40]], 'rgba(255,255,255,0.6)') + pl([[74, 40], [84, 58], [96, 76], [114, 98]], C.bear, 2.2);
      s += `<circle cx="74" cy="40" r="3.5" fill="${C.amber}"/>` + t(80, 36, 'BUYS THE TOP', C.amber, 6, 'start');
      s += t(66, 120, 'chasing a move you missed', C.dim, 6, 'middle', 'normal');
      s += r(134, 8, 120, 120, C.bear, 0.05, C.bear) + t(194, 22, 'REVENGE', C.bear, 8);
      const steps = [[1, 'LOSS', 1], [2, 'DOUBLE LOT', 2], [3, 'DOUBLE AGAIN', 4]];
      let y = 36; steps.forEach(([n, a, sz]) => { s += r(144, y, 100, 18, C.bear, 0.1 + sz * 0.08, C.bear, 3) + t(150, y + 12, `${a}`, '#fff', 6.3, 'start') + t(238, y + 12, `${sz}% RISK`, C.bear, 6.3, 'end'); y += 24; });
      s += t(194, 120, 'trying to win it back fast', C.dim, 6, 'middle', 'normal');
      return S(s + t(130, 143, 'BOTH ARE EMOTIONS, NOT SETUPS', C.silver, 6.8));
    },

    probability: () => {
      const seq = 'LLWLLLWWLLLLWLWLWLWW'.split('');
      let s = t(130, 14, '20 REAL-WORLD TRADES · 40% WIN RATE · 1:3 R:R', C.silver, 6.8), eq = 0; const pts = [[14, 86]];
      seq.forEach((c, i) => { const x = 14 + i * 12; s += r(x - 4, 22, 9, 12, c === 'W' ? C.bull : C.bear, 0.55, null, 2) + t(x + 0.5, 31, c, '#fff', 6);
        eq += c === 'W' ? 3 : -1; pts.push([x + 12, 86 - eq * 4]); });
      s += l(12, 86, 252, 86, C.dim, 0.6, '2,3') + pl(pts, C.light, 1.8);
      s += t(246, pts[pts.length - 1][1] + 14, '+12R', C.bull, 7.5, 'end') + t(40, 104, '−2R ON THE WAY', C.bear, 6.2);
      return S(s + t(130, 132, '12 LOSSES · 8 WINS · STILL +12R', C.bull, 7.2) + t(130, 145, 'NO SINGLE TRADE MATTERS — THE SERIES DOES', C.dim, 6.2));
    },

    tilt: () => {
      const rules = [['🟢', 'FOLLOWED THE PLAN, WIN OR LOSS', 'keep trading normally', C.bull], ['🟡', '2 LOSSES IN A ROW', 'step away for 1 hour', C.amber], ['🟠', 'DAILY LOSS HITS −2%', 'done for the day', '#FF9A4D'], ['🔴', 'WEEKLY LOSS HITS −5%', 'halve size · review journal', C.bear]];
      let s = '';
      rules.forEach(([ic, a, b, c], i) => { const y = 10 + i * 31;
        s += r(8, y, 244, 26, c, 0.08, c, 4) + t(22, y + 17, ic, '#fff', 10, 'middle', 'normal') + t(36, y + 12, a, '#fff', 6.6, 'start') + t(36, y + 22, b, c, 6.2, 'start', 'normal'); });
      return S(s + t(130, 143, 'DECIDE YOUR STOP RULES BEFORE EMOTIONS SHOW UP', C.silver, 6.2));
    },

    routine: () => {
      const st = [['07:30', 'NEWS', 'calendar · red folders', C.amber], ['08:00', 'PREP', 'top-down · mark levels', C.blue], ['09:00', 'LONDON', 'execute A+ setups only', C.bull], ['12:00', 'PAUSE', 'no forcing trades', C.slate], ['15:00', 'NEW YORK', 'second window', C.bull], ['18:00', 'REVIEW', 'journal every trade', C.light]];
      let s = l(30, 16, 30, 134, C.dim, 1);
      st.forEach(([tm, a, b, c], i) => { const y = 18 + i * 21;
        s += `<circle cx="30" cy="${y + 4}" r="4" fill="${c}"/>` + t(24, y + 7, tm, c, 6.3, 'end') + t(40, y + 7, a, '#fff', 7, 'start') + t(250, y + 7, b, C.dim, 6.2, 'end', 'normal'); });
      return S(s + t(130, 146, 'SAST · LONDON OPENS 09:00 (SA WINTER) OR 10:00 (SA SUMMER)', C.dim, 5.6));
    },

    rules: () => {
      const r10 = ['Risk 1% or less per trade', 'Always use a stop loss', 'Only trade A+ setups', 'Minimum 1:2 risk-to-reward', 'Never widen your stop', 'No trades on red news', 'Respect daily loss limit', 'Journal every trade', 'Review every weekend', 'Protect your mind'];
      let s = t(130, 13, 'THE PROFESSIONAL\'S 10 RULES', C.amber, 7.5);
      r10.forEach((x, i) => { const col = i < 5 ? 8 : 132, y = 22 + (i % 5) * 24;
        s += r(col, y, 120, 20, C.blue, 0.07, null, 3) + t(col + 10, y + 13, String(i + 1), C.amber, 7.5) + t(col + 20, y + 13, x, C.txt, 5.8, 'start', 'normal'); });
      return S(s + t(130, 146, 'WRITE THEM DOWN · READ THEM BEFORE EVERY SESSION', C.dim, 6));
    },

    review: () => {
      const k = [['TRADES', '14'], ['WIN RATE', '43%'], ['AVG WIN', '2.6R'], ['EXPECTANCY', '+0.5R'], ['PLAN FOLLOWED', '86%'], ['BEST SETUP', 'OB + FVG']];
      let s = t(130, 14, 'WEEKLY REVIEW', C.light, 7.5);
      k.forEach(([a, b], i) => { const x = 8 + (i % 3) * 83, y = 22 + Math.floor(i / 3) * 40;
        s += r(x, y, 78, 34, C.blue, 0.07, C.blue, 4) + t(x + 39, y + 13, a, C.dim, 5.8) + t(x + 39, y + 27, b, i === 3 ? C.bull : '#fff', 9); });
      s += r(8, 106, 244, 30, C.amber, 0.08, C.amber, 4) + t(130, 118, 'BIGGEST MISTAKE: entered 2 trades before the candle closed', C.amber, 5.9, 'middle', 'normal') + t(130, 130, 'NEXT WEEK: wait for the close — no exceptions', C.bull, 6.2);
      return S(s + t(130, 147, 'WHAT GETS MEASURED GETS IMPROVED', C.dim, 6));
    },

    prop: () => {
      const st = [['PHASE 1', 'target ≈ 8–10%', C.blue], ['PHASE 2', 'target ≈ 5%', C.light], ['FUNDED', 'profit split ≈ 80%', C.bull]];
      let s = '';
      st.forEach(([a, b, c], i) => { const x = 10 + i * 84;
        s += r(x, 20, 72, 50, c, 0.12, c, 5) + t(x + 36, 40, a, c, 7.5) + t(x + 36, 55, b, C.txt, 6, 'middle', 'normal');
        if(i < 2) s += arr(x + 73, 45, x + 83, 45, C.dim); });
      s += r(10, 82, 240, 40, C.bear, 0.08, C.bear, 5) + t(130, 96, 'BREAK A RULE = ACCOUNT LOST', C.bear, 7) + t(130, 110, 'max daily loss ≈ 5% · max total drawdown ≈ 10%', C.txt, 6.2, 'middle', 'normal');
      return S(s + t(130, 140, 'TYPICAL RULES — EVERY FIRM IS DIFFERENT, READ THEIRS', C.dim, 6));
    },

    compound: () => {
      const pts = []; for(let m = 0; m <= 36; m++) pts.push([16 + m * 6.4, 130 - (10000 * Math.pow(1.03, m) - 10000) / 19000 * 100]);
      let s = l(14, 130, 250, 130, C.dim, 0.6) + pl(pts, C.bull, 2.2);
      [[12, '$14,258'], [24, '$20,328'], [36, '$28,983']].forEach(([m, v]) => { const p = pts[m]; s += `<circle cx="${p[0]}" cy="${p[1].toFixed(1)}" r="3" fill="${C.bull}"/>` + t(p[0] - 5, p[1] + (m === 36 ? 3 : -7), v, '#fff', 6.8, 'end') + t(p[0], 141, `${m} MO`, C.dim, 6); });
      return S(s + t(16, 124, '$10,000', C.dim, 6.3, 'start') + t(130, 16, '3% A MONTH, COMPOUNDED — NO HERO TRADES NEEDED', C.silver, 6.8));
    },

    sa: () => S(
      r(8, 12, 118, 100, C.bull, 0.08, C.bull, 5) + t(67, 30, '🛡️ FSCA', C.bull, 8) +
      t(67, 48, 'regulates SA brokers', C.txt, 6, 'middle', 'normal') + t(67, 60, 'check the FSP number', C.txt, 6, 'middle', 'normal') + t(67, 72, 'on fsca.co.za', C.txt, 6, 'middle', 'normal') + t(67, 92, 'NO FSP = NO DEPOSIT', C.bull, 6.5) +
      r(134, 12, 118, 100, C.amber, 0.08, C.amber, 5) + t(193, 30, '🧾 SARS', C.amber, 8) +
      t(193, 48, 'trading profits are', C.txt, 6, 'middle', 'normal') + t(193, 60, 'taxable — usually as', C.txt, 6, 'middle', 'normal') + t(193, 72, 'income if you trade often', C.txt, 6, 'middle', 'normal') + t(193, 92, 'KEEP EVERY RECORD', C.amber, 6.5) +
      t(130, 130, 'GENERAL INFO ONLY — SPEAK TO A REGISTERED TAX PRACTITIONER', C.dim, 6)),

    graduate: () => {
      const L = [['1', C.bull], ['2', C.blue], ['3', C.light], ['4', C.bear], ['5', C.amber], ['6', C.slate], ['7', C.silver]];
      let s = '';
      L.forEach(([n, c], i) => { const x = 20 + i * 32, y = 100 - i * 11;
        if(i) s += l(x - 32, y + 11, x, y, C.dim, 1, '2,2');
        s += `<circle cx="${x}" cy="${y}" r="11" fill="${c}" fill-opacity="0.25" stroke="${c}"/>` + t(x, y + 3, n, '#fff', 8); });
      s += t(232, 18, '🎓', '#fff', 16);
      return S(s + t(130, 132, 'FOUNDATIONS → CHARTS → TOOLS → RISK → STRATEGY → INSTITUTIONS → MASTERY', C.dim, 5.3) + t(130, 146, 'THE MARKET REWARDS PATIENCE, PROCESS AND DISCIPLINE', C.silver, 6.2));
    }
  };
})();
