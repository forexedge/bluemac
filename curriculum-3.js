// ══════════════════════════════════════════════════════
// BLUE MAC UNIVERSITY — Curriculum part 3
// Level 5 Strategy & Execution · Level 6 Institutional Trading · Level 7 Self-Mastery
// ══════════════════════════════════════════════════════
(window.BMU_LEVELS = window.BMU_LEVELS || []).push(

// ═════════════ LEVEL 5 — STRATEGY & EXECUTION ═════════════
{ id:'L5', num:5, title:'Strategy & Execution', icon:'🟡', color:'#F5B841', badge:'Strategist Certificate',
  sub:'Combine everything into a repeatable strategy, write your trading plan, then prove it with data.',
  modules:[
  { id:'m5-1', icon:'🧩', title:'Building Your Edge',
    desc:'Top-down analysis, choosing your trading style, and scoring setups with a confluence checklist.',
    why:'An "edge" is a set of conditions that repeats and wins over many trades. This module turns your knowledge into one.',
    lessons:[
      { id:'l5-1-1', icon:'🔭', tag:'PROCESS', ref:'mgt-topdown', points:['Higher TF = bias, middle TF = zone, lower TF = entry.','Never take a lower-TF signal against the higher-TF trend.','Pick one timeframe combo and stick to it.'] },
      { id:'l5-1-2', icon:'🎛️', title:'The Blue Mac Trading Styles', tag:'STYLE',
        desc:`Blue Mac supports five styles. They use the same principles but different timeframes, holding times and screen time. The best style is the one that <strong>fits your life</strong> — your job, your schedule and your temperament.`,
        svg:() => BMUD.styles(), label:'◆ SAME RULES · DIFFERENT TIMEFRAMES',
        how:`Working full-time? <strong>Swing</strong> or <strong>Position</strong> — check charts once or twice a day. Free during London or New York? <strong>Day trading</strong>. Can sit at the screen and react fast? <strong>Scalp</strong>. Want one clean setup at the session open with clear rules? <strong>Blue Mac Key</strong>.`,
        tip:`Not sure? Take the 60-second style quiz on the Checklist page. Most beginners do best starting with Swing — fewer decisions, less noise, more time to think.`,
        points:['Scalp 15m/30m · Day H1/H4 · Swing D1/H4 · Position W1/D1 · Key all timeframes.','Choose the style that matches your available screen time.','Master one style before adding another.'] },
      { id:'l5-1-3', icon:'✅', title:'The Confluence Checklist', tag:'PROCESS',
        desc:`<strong>Confluence</strong> means several independent reasons point to the same trade. Instead of trading on a feeling, score every setup against the same checklist. Only the highest-scoring setups get your money.`,
        svg:() => BMUD.confluence(), label:'◆ SCORE EVERY SETUP THE SAME WAY',
        how:`Before any trade, tick: higher-TF trend ✓, key level (S/R, OB, Fib, MA) ✓, entry signal (candle or CHoCH) ✓, R:R ≥ 1:2 ✓, active session ✓, no red-folder news ✓. Under 4/6 = no trade.`,
        tip:`This is exactly what the Blue Mac checklist does before it generates a trade idea. The discipline is the edge.`,
        points:['Several independent reasons beat one strong feeling.','Use the same checklist on every single trade.','Fewer, better trades beat more, average trades.'] },
      { id:'l5-1-4', icon:'📈', tag:'CONFLUENCE', ref:'fib-ma', points:['61.8% + 50 MA = Fib structure and the Blue Mac Entry Zone together.','Wait for the bullish close at the confluence.','Strongly sloping MAs = expect shallower pullbacks.'] }
    ],
    quiz:[
      { q:'In top-down analysis, what does the HIGHER timeframe give you?', o:['The bias (direction)','The exact entry candle','The spread','The news calendar'], a:0, why:'Higher TF = direction. Middle TF = zone. Lower TF = entry trigger.' },
      { q:'You work 08:00–17:00 and can only check charts in the evening. Which style fits best?', o:['Swing or Position','Scalp','Day trading during London','Whichever has the most trades'], a:0, why:'Swing/Position use D1/W1 charts and need little screen time.' },
      { q:'Which timeframes does the Blue Mac Swing style use?', o:['D1 / H4','15m / 30m','W1 / D1','H1 / H4'], a:0, why:'Swing = D1 and H4, holding 2–5 days.' },
      { q:'A setup scores 3 out of 6 on your confluence checklist. What do you do?', o:['Skip it','Take it with double size','Take it without a stop','Take it if you feel good'], a:0, why:'Under 4/6 is a no-trade. Waiting for A+ setups is the edge.' },
      { q:'What does "confluence" mean?', o:['Several independent reasons pointing to the same trade','Trading many pairs at once','Using maximum leverage','Following a signal group'], a:0, why:'Confluence = multiple, independent factors lining up at one price.' }
    ] },

  { id:'m5-2', icon:'📓', title:'Plan, Journal & Backtest',
    desc:'Write a real trading plan, keep a journal that improves you, and prove your edge with backtesting and expectancy.',
    why:'Without a plan you gamble. Without a journal you repeat mistakes. Without data you never know if your edge is real.',
    lessons:[
      { id:'l5-2-1', icon:'🗺️', title:'Writing Your Trading Plan', tag:'PLAN',
        desc:`A trading plan is your business rulebook. It answers every question <strong>before</strong> the market asks it: what you trade, when, how you enter, how you exit, how much you risk, and how you review.`,
        svg:() => BMUD.plan(), label:'◆ DECIDE BEFORE THE MARKET MAKES YOU DECIDE',
        how:`Write one page covering the 6 boxes. Be specific: "I trade EURUSD and GBPUSD, Swing style, D1 bias + H4 entries, only at OB/Fib confluence, 1% risk, TP1 at 2R, max 3 trades per week."`,
        tip:`If a situation happens that your plan does not cover, the answer is "no trade" — then update the plan at the weekend.`,
        points:['Markets, style, entry rules, exit rules, risk rules, routine.','Specific beats vague — numbers, not feelings.','Not in the plan = not a trade.'] },
      { id:'l5-2-2', icon:'📓', title:'Journaling Like a Professional', tag:'JOURNAL',
        desc:`A journal records not just the numbers but <strong>why</strong> you took the trade, whether you <strong>followed your plan</strong>, and how you <strong>felt</strong>. It is the fastest way to find your strengths and kill your bad habits.`,
        svg:() => BMUD.journal(), label:'◆ EVERY TRADE · EVERY TIME',
        how:`Log every trade in the Blue Mac Journal: setup, entry/SL/TP, result in R, screenshot, emotion and "followed plan? yes/no". Review the "no" trades first — that is where your money leaks.`,
        tip:`Measure results in R (multiples of your risk), not rand or dollars. It keeps you focused on the process instead of the money.`,
        points:['Record the why, the result and the emotion.','Track "followed plan?" — it predicts your results.','Measure in R, not in money.'] },
      { id:'l5-2-3', icon:'🧪', title:'Expectancy — Is Your Edge Real?', tag:'DATA',
        desc:`<strong>Expectancy</strong> is the average amount you make (or lose) per trade, measured in R. A positive expectancy means your strategy makes money over time — even with a win rate below 50%.`,
        svg:() => BMUD.expectancy(), label:'◆ POSITIVE EXPECTANCY = A REAL EDGE',
        how:`Expectancy = (win% × average win) − (loss% × average loss). With a 40% win rate, 2R average wins and 1R losses: (0.4 × 2) − (0.6 × 1) = <strong>+0.2R per trade</strong>, or +20R every 100 trades.`,
        tip:`Win rate on its own means nothing. A 70% win rate with tiny wins and big losses can still lose money.`,
        points:['Expectancy = (W% × avg win) − (L% × avg loss).','You can be profitable winning only 40% of the time.','Judge a strategy on 50–100+ trades, never on a few.'] },
      { id:'l5-2-4', icon:'⏪', title:'Backtesting Your Strategy', tag:'DATA',
        desc:`<strong>Backtesting</strong> means applying your exact rules to historical charts to see how they would have performed. It builds confidence, exposes weaknesses and gives you real numbers before risking real money.`,
        svg:() => BMUD.backtest(), label:'◆ PROVE IT ON HISTORY → DEMO → SMALL LIVE',
        how:`Use TradingView's replay mode. Hide the future, apply your rules candle by candle, and log 100+ trades. Calculate win rate, average R, expectancy and the biggest losing streak. Then forward-test on demo.`,
        tip:`Be brutally honest — no skipping the losing trades "because you wouldn't have taken that one". Your backtest is only as good as your honesty.`,
        points:['Exact rules → historical replay → 100+ trades → measure.','Know your biggest losing streak before going live.','Then demo, then small live size.'] },
      { id:'l5-2-5', icon:'📈', title:'Reading Your Equity Curve', tag:'DATA',
        desc:`Your <strong>equity curve</strong> (account balance over time) tells the truth about your trading. A steady, upward staircase means a real edge with controlled risk. Wild spikes and crashes mean over-risking — even if it is up today.`,
        svg:() => BMUD.equity(), label:'◆ SMOOTH AND RISING BEATS FAST AND WILD',
        how:`Review your curve every month. Big drops usually trace back to one of three things: oversized trades, broken rules, or revenge trading. Find which one in your journal and fix it.`,
        tip:`Prop firms and investors care more about a smooth curve with small drawdowns than about the biggest return.`,
        points:['Smooth curve = edge + risk control.','Sharp drops = over-risking or broken rules.','Review the curve monthly against your journal.'] }
    ],
    quiz:[
      { q:'A situation comes up that your trading plan does not cover. What do you do?', o:['No trade — update the plan later','Trade it on instinct','Double your normal size','Ask a signal group'], a:0, why:'If the plan does not cover it, it is not part of your edge.' },
      { q:'Win rate 40%, average win 2R, average loss 1R. What is the expectancy?', o:['+0.2R per trade','−0.2R per trade','+0.8R per trade','0R'], a:0, why:'(0.4 × 2) − (0.6 × 1) = 0.8 − 0.6 = +0.2R.' },
      { q:'Why measure journal results in R instead of rand?', o:['It keeps the focus on process and lets you compare trades fairly','Rand is not allowed','It makes losses disappear','R stands for "random"'], a:0, why:'R = multiples of your risk, so every trade is comparable regardless of size.' },
      { q:'How many trades should a backtest include before you trust the results?', o:['100 or more','5','10','1 good one'], a:0, why:'Small samples are dominated by luck. 100+ trades gives meaningful statistics.' },
      { q:'Your equity curve has big spikes up and big crashes down. What does that usually mean?', o:['You are over-risking or breaking rules','You have found the perfect strategy','Your broker is broken','Nothing — all curves look like that'], a:0, why:'Wild swings come from oversized risk or inconsistent execution.' }
    ] }
  ] },

// ═════════════ LEVEL 6 — INSTITUTIONAL TRADING ═════════════
{ id:'L6', num:6, title:'Institutional Trading', icon:'⚫', color:'#8AA4BF', badge:'Institutional Trader Certificate',
  sub:'Liquidity, order blocks, fair value gaps and the tools institutions actually use — Smart Money in depth.',
  modules:[
  { id:'m6-1', icon:'💧', title:'Liquidity',
    desc:'Where the stops are, why price hunts them, and when the big moves of the day happen.',
    why:'Institutions need liquidity to fill their huge orders. Once you see the liquidity, you see where price is likely to go next.',
    lessons:[
      { id:'l6-1-1', icon:'💧', tag:'LIQUIDITY', ref:'smc-liquidity', points:['BSL = stops above equal highs. SSL = stops below equal lows.','Price is drawn to obvious liquidity pools.','A sweep of one side often targets the other side.'] },
      { id:'l6-1-2', icon:'🌊', tag:'LIQUIDITY', ref:'smc-sweep', points:['Sweep → BOS → return to the OB is a complete institutional sequence.','SL goes beyond the sweep wick.','The cleaner the equal lows/highs, the more stops behind them.'] },
      { id:'l6-1-3', icon:'🌏', tag:'TIMING', ref:'smc-judas', points:['The Asian range builds liquidity on both sides.','London often fakes one way first (Judas swing).','Trade the close back inside the range.'] },
      { id:'l6-1-4', icon:'⏰', title:'ICT Killzones (SAST)', tag:'TIMING',
        desc:`<strong>Killzones</strong> are the windows where institutional volume arrives and the day's real moves usually start. Outside them, price often drifts or chops. Times below are in <strong>South African time</strong>.`,
        svg:() => BMUD.killzones(), label:'◆ TRADE WHEN THE BIG MONEY IS ACTIVE',
        how:`Mark the Asian range (≈ 02:00–06:00 SAST), then focus your entries on the <strong>London killzone (≈ 08:00–11:00)</strong> and the <strong>New York killzone (≈ 13:00–16:00)</strong>. From November to March, when the US is on standard time, add one hour.`,
        tip:`You don't need to trade every killzone. Pick the one that fits your schedule and become an expert in how your pair behaves in it.`,
        points:['Asia builds the range; London and New York move it.','London KZ ≈ 08:00–11:00 SAST, NY KZ ≈ 13:00–16:00 SAST (US summer time).','Add 1 hour from November to March.'] },
      { id:'l6-1-5', icon:'🌱', tag:'WYCKOFF', ref:'pat-spring', points:['A spring is a fake breakdown below range support.','It is the classic name for a sell-side liquidity grab.','Buy the close back inside the range.'] }
    ],
    quiz:[
      { q:'Where does buy-side liquidity (BSL) sit?', o:['Above equal highs (buy stops)','Below equal lows','At the 50% of the range','Inside order blocks only'], a:0, why:'Shorts\' stop losses and breakout buy orders sit above highs — that is buy-side liquidity.' },
      { q:'Price sweeps above equal highs and closes back below them. What is often the next target?', o:['The sell-side liquidity below','Even higher highs','Nothing — price stops','The Asian session open'], a:0, why:'After grabbing BSL, price often runs to the opposite pool (SSL).' },
      { q:'What is a "Judas swing"?', o:['A fake move at the session open that sweeps one side before the real move','A type of moving average','A candle with no wicks','A broker fee'], a:0, why:'The Judas swing fakes one direction (often at London open) before the real move.' },
      { q:'Roughly when is the London killzone in SAST during US summer time?', o:['08:00–11:00','20:00–23:00','02:00–04:00','16:00–20:00'], a:0, why:'London killzone ≈ 02:00–05:00 New York time = 08:00–11:00 SAST in US summer time.' },
      { q:'In Wyckoff terms, a "spring" is…', o:['A fake breakdown below range support that snaps back','A breakout above resistance','A type of indicator','A trend continuation pattern'], a:0, why:'The spring sweeps stops below support, then price returns inside the range.' }
    ] },

  { id:'m6-2', icon:'🏦', title:'Institutional Footprints',
    desc:'Order blocks, fair value gaps, breakers and premium/discount — the marks big money leaves on the chart.',
    why:'These zones show you where institutions placed orders. Combined with liquidity (6.1), they give precise, low-risk entries.',
    lessons:[
      { id:'l6-2-1', icon:'🏦', tag:'ORDER BLOCK', ref:'smc-ob-what', points:['OB = last opposite candle before an impulsive, structure-breaking move.','Mark its full range.','Wait for price to return — don\'t chase the impulse.'] },
      { id:'l6-2-2', icon:'🔍', tag:'ORDER BLOCK', ref:'smc-ob-find', points:['Valid OB = last opposite candle + BOS + FVG.','Missing one of the three = skip it.','Faster impulse = stronger OB.'] },
      { id:'l6-2-3', icon:'🕳️', tag:'FVG', ref:'smc-fvg-what', points:['FVG = gap between candle ① high and candle ③ low.','Price often returns to rebalance the gap.','Consequent encroachment = the 50% of the gap.'] },
      { id:'l6-2-4', icon:'🔨', tag:'BREAKER', ref:'smc-breaker', points:['A failed OB flips sides and becomes a breaker.','Trapped traders exit there, pushing price away.','Strongest when the break also broke structure.'] },
      { id:'l6-2-5', icon:'⚖️', tag:'FILTER', ref:'smc-pd', points:['Buy in discount (below 50%), sell in premium (above 50%).','It\'s the 50% Fib level used as a filter.','A great OB in the wrong half of the range = skip.'] },
      { id:'l6-2-6', icon:'⭐', tag:'A+ SETUP', ref:'smc-ob-fvg', points:['OB + FVG stacked = the classic A+ zone.','Entry at OB top, SL below OB.','Best in discount, in the direction of the higher-TF trend.'] }
    ],
    quiz:[
      { q:'What is a bullish order block?', o:['The last bearish candle before a strong move up that breaks structure','Any green candle','The highest candle of the day','A gap between two candles'], a:0, why:'The last opposite candle before the impulse marks where institutions loaded orders.' },
      { q:'Which three things make an order block valid?', o:['Last opposite candle, break of structure, and an FVG in the impulse','A doji, an RSI reading and a round number','Three green candles','A 200 MA touch, news and a Fib level'], a:0, why:'No impulse + BOS + FVG = just a normal candle, not an OB.' },
      { q:'How is a bullish fair value gap measured?', o:['From candle ① high to candle ③ low','From candle ① low to candle ③ high','From open to close of candle ②','From the 50 MA to the 200 MA'], a:0, why:'The gap is the price range where candle 1 and candle 3 wicks do not overlap.' },
      { q:'Where should you look for bullish order blocks according to premium/discount?', o:['In the discount half (below 50% of the range)','In the premium half','Exactly at the swing high','Anywhere'], a:0, why:'Smart money buys cheap (discount) and sells expensive (premium).' },
      { q:'A bullish OB is broken by a strong close below it, and price later rallies back into it. What has it become?', o:['A breaker block — look for sells','A stronger bullish OB','A fair value gap','Irrelevant'], a:0, why:'A failed OB flips into a breaker, and the retest is often a sell.' }
    ] },

  { id:'m6-3', icon:'🏛️', title:'Institutional Tools',
    desc:'VWAP, volume profile, the COT report, pivot points and the Quasimodo — the tools banks and funds actually watch.',
    why:'These are the benchmarks institutions are measured against. When you watch the same levels they do, you react with them, not against them.',
    lessons:[
      { id:'l6-3-1', icon:'🏛️', tag:'BENCHMARK', ref:'ind-vwap', points:['Above VWAP = buyers in control; below = sellers.','Buy pullbacks to VWAP in an up-day.','VWAP resets every session.'] },
      { id:'l6-3-2', icon:'📊', tag:'VOLUME', ref:'ind-vp', points:['POC = most traded price. Value area = ~70% of volume.','Breakout + VAH retest = buy.','Low-volume areas get crossed fast.'] },
      { id:'l6-3-3', icon:'📑', tag:'POSITIONING', ref:'ind-cot', points:['COT shows how big speculators are positioned.','Extreme positioning + turning = big-picture warning.','Use it for weekly bias, not entries.'] },
      { id:'l6-3-4', icon:'🎚️', tag:'LEVELS', ref:'ind-pivots', points:['Pivots come from yesterday\'s H, L, C.','Above P = bullish day; below P = bearish day.','S1/S2 and R1/R2 make natural targets.'] },
      { id:'l6-3-5', icon:'🔁', tag:'REVERSAL', ref:'pat-qm', points:['QM = a failed high/low that leaves a level (the QML) behind.','The return to the QML is the entry.','It combines liquidity, structure and a level in one pattern.'] }
    ],
    quiz:[
      { q:'Why do institutions watch VWAP?', o:['Their execution is judged against it — they aim to buy below and sell above it','It predicts the news','It is the only indicator brokers allow','It shows the spread'], a:0, why:'VWAP is the institutional execution benchmark.' },
      { q:'On a volume profile, what is the POC?', o:['The price with the most traded volume','The highest price of the day','The opening price','The average spread'], a:0, why:'Point of Control = the busiest price level.' },
      { q:'The COT report is best used for…', o:['Big-picture weekly bias','Exact M5 entries','Calculating lot size','Setting stop losses'], a:0, why:'COT data is weekly and lagging, so it is a bias tool, not an entry tool.' },
      { q:'Today price is trading above the daily pivot (P). What is the bias?', o:['Bullish — buy dips into P or S1','Bearish — sell all rallies','Neutral — no trades','Close all positions'], a:0, why:'Above P = bullish day; dips into P/S1 are buying opportunities.' },
      { q:'Which day\'s data are daily pivot points calculated from?', o:['Yesterday\'s high, low and close','Today\'s open only','Last month\'s close','The weekly candle'], a:0, why:'P = (H + L + C) ÷ 3 using the previous day.' }
    ] }
  ] },

// ═════════════ LEVEL 7 — SELF-MASTERY ═════════════
{ id:'L7', num:7, title:'Self-Mastery', icon:'👑', color:'#E4E8EE', badge:'Self-Mastery Degree',
  sub:'The final level: psychology, discipline and running your trading like a professional business.',
  modules:[
  { id:'m7-1', icon:'🧠', title:'Trading Psychology',
    desc:'The emotional cycle, FOMO and revenge trading, thinking in probabilities and protecting yourself from tilt.',
    why:'At this level, most traders already know enough. What separates the profitable ones is how they handle their own mind.',
    lessons:[
      { id:'l7-1-1', icon:'🎢', title:'The Emotional Cycle of Trading', tag:'PSYCHOLOGY',
        desc:`Every market move takes traders through the same emotions: optimism, excitement, <strong>euphoria</strong> (when risk is highest), then anxiety, denial, fear and <strong>capitulation</strong> (when opportunity is highest). Most people buy near euphoria and sell near capitulation.`,
        svg:() => BMUD.cycle(), label:'◆ FEEL EUPHORIA? BE CAREFUL. FEEL FEAR? LOOK CLOSER.',
        how:`Write down how you feel before every trade. If you feel euphoric or certain, reduce size. If everyone around you is panicking, check your plan — that is often where the best setups appear.`,
        tip:`Your feelings are data about the crowd, because you are part of it. Learn to notice them instead of obeying them.`,
        points:['The crowd buys euphoria and sells capitulation.','Maximum confidence is often maximum risk.','Notice your emotions — don\'t follow them.'] },
      { id:'l7-1-2', icon:'😤', title:'FOMO & Revenge Trading', tag:'PSYCHOLOGY',
        desc:`<strong>FOMO</strong> (fear of missing out) makes you chase a move that already happened, usually buying the top. <strong>Revenge trading</strong> is trying to win back a loss immediately, usually with bigger size. Both are emotions disguised as trades.`,
        svg:() => BMUD.revenge(), label:'✕ IF IT ISN\'T IN YOUR PLAN, IT\'S AN EMOTION',
        how:`Missed a move? Let it go — another setup always comes. Just lost? Your next trade must be the same size and meet the same checklist. If you feel the urge to "win it back", close the platform.`,
        tip:`Most blown accounts don't come from one bad trade. They come from the 3–4 revenge trades that followed it.`,
        points:['FOMO = chasing. Revenge = escalating.','After a loss, keep size the same — never increase it.','No setup = no trade, no matter how you feel.'] },
      { id:'l7-1-3', icon:'🎲', title:'Thinking in Probabilities', tag:'MINDSET',
        desc:`Professionals see each trade as one of the next hundred. With a positive edge, the <strong>series</strong> makes money even if any single trade loses. You can lose 12 of 20 trades and still be well up.`,
        svg:() => BMUD.probability(), label:'◆ NO SINGLE TRADE MATTERS — THE SERIES DOES',
        how:`Stop judging trades by their outcome. Judge them by "did I follow my plan?". A rule-following loss is a good trade. A rule-breaking win is a bad trade that teaches you the wrong lesson.`,
        tip:`Losing streaks are part of every edge. If your backtest shows 8 losses in a row are possible, then 8 losses in a row is not a reason to change your strategy.`,
        points:['Judge the process, not the single outcome.','A good loss follows the plan; a bad win breaks it.','Your edge only shows up over many trades.'] },
      { id:'l7-1-4', icon:'🚦', title:'Tilt & Your Stop Rules', tag:'DISCIPLINE',
        desc:`<strong>Tilt</strong> is when emotion takes over and you start breaking rules. Nobody can trade well on tilt — so professionals decide in advance exactly when they will stop.`,
        svg:() => BMUD.tilt(), label:'◆ PRE-DECIDED STOP RULES PROTECT YOU FROM YOURSELF',
        how:`Write your personal stop rules into your trading plan: e.g. 2 losses in a row = 1-hour break; −2% day = done for the day; −5% week = half size and review. Follow them without negotiating.`,
        tip:`Signs of tilt: increasing lot size, skipping the checklist, staring at P/L, trading outside your session, "just one more trade".`,
        points:['Tilt = emotion overriding rules.','Decide your stop rules before you need them.','Walking away is a professional decision.'] }
    ],
    quiz:[
      { q:'At which point in the emotional cycle is risk usually highest?', o:['Euphoria','Capitulation','Hope','Despondency'], a:0, why:'Euphoria is when the crowd is all-in and over-confident — the top is often near.' },
      { q:'You just took a loss and feel the urge to win it back with a bigger trade. What do you do?', o:['Keep the same size and only take setups on your checklist — or walk away','Double the lot size','Trade the next candle no matter what','Remove your stop loss'], a:0, why:'Escalating size after a loss is revenge trading — the fastest way to blow an account.' },
      { q:'Which trade is a "good" trade?', o:['A loss that followed every rule of your plan','A win that broke your rules','Any winning trade','A trade on a hot tip'], a:0, why:'Good trades are defined by process. Over many trades, process creates the results.' },
      { q:'Win rate 40% at 1:3 R:R over 20 trades: 8 wins, 12 losses. What is the result?', o:['+12R','−4R','0R','+24R'], a:0, why:'8 × 3R = +24R, 12 × 1R = −12R, net +12R.' },
      { q:'Which of these is a sign of tilt?', o:['Increasing lot size after losses','Following your checklist','Taking a planned break','Journalling your trade'], a:0, why:'Escalating size and skipping rules are classic tilt behaviours.' }
    ] },

  { id:'m7-2', icon:'⏰', title:'Discipline & Routine',
    desc:'A professional daily routine, the rules that keep you in the game, and the weekly review that makes you better.',
    why:'Consistency comes from routine, not motivation. The best traders are boringly consistent.',
    lessons:[
      { id:'l7-2-1', icon:'☀️', title:'The Professional Daily Routine', tag:'ROUTINE',
        desc:`Profitable traders run the same routine every day: check the news, do the top-down analysis, mark levels, execute only planned setups in their session, then journal. The routine removes impulse decisions.`,
        svg:() => BMUD.routine(), label:'◆ PREPARE · EXECUTE · REVIEW',
        how:`Build your own timetable around your trading style and your life. Swing traders might only need 30 minutes in the evening. Day traders need focused blocks around London or New York.`,
        tip:`The preparation is where the money is made. Execution should feel almost boring because the decisions were made beforehand.`,
        points:['Same routine every day removes impulsive trades.','Prepare before the session, journal after it.','Execution should be boring — the thinking was done earlier.'] },
      { id:'l7-2-2', icon:'📜', title:'The Professional\'s Rules', tag:'DISCIPLINE',
        desc:`Every professional trader has a short list of rules they never break. These are the ten that protect almost every account. Make them yours, then add your own from your journal.`,
        svg:() => BMUD.rules(), label:'◆ RULES YOU NEVER NEGOTIATE WITH',
        how:`Print or save your rules and read them before every session. When you break one, write it in your journal with the reason — patterns will show you exactly what to work on.`,
        tip:`Your most important rules usually come from your most expensive mistakes. Your journal will tell you what they are.`,
        points:['A short list of non-negotiable rules.','Read them before every session.','Every broken rule goes in the journal.'] },
      { id:'l7-2-3', icon:'🔎', title:'The Weekly Review', tag:'REVIEW',
        desc:`Once a week, step back and review your numbers and your behaviour. What worked? What didn't? Which setup is your best? What was your biggest mistake? Then set <strong>one</strong> focus for next week.`,
        svg:() => BMUD.review(), label:'◆ WHAT GETS MEASURED GETS IMPROVED',
        how:`Every weekend: count trades, win rate, average R, expectancy and "plan followed %". Find your best setup and your biggest mistake. Write one clear improvement goal for the coming week.`,
        tip:`Fix one thing at a time. Trying to fix everything at once usually fixes nothing.`,
        points:['Review numbers and behaviour every week.','Find your best setup and your biggest mistake.','Set ONE focus for next week.'] }
    ],
    quiz:[
      { q:'What is the main purpose of a fixed daily routine?', o:['To remove impulsive decisions','To trade as often as possible','To watch every candle','To follow social media signals'], a:0, why:'Routine moves decisions to calm preparation time instead of the heat of the market.' },
      { q:'You broke one of your rules today. What should you do?', o:['Record it in your journal with the reason','Ignore it if the trade won','Delete the trade from your records','Break more rules to compensate'], a:0, why:'Broken rules are your most valuable data — they show you what to fix.' },
      { q:'How many improvement goals should you set after a weekly review?', o:['One clear focus','Ten at once','None','Whatever your mentor says'], a:0, why:'One focus at a time actually gets fixed.' },
      { q:'Which statistic best shows your discipline?', o:['Plan followed %','Number of trades taken','Largest single win','Hours spent watching charts'], a:0, why:'Plan adherence measures discipline directly — and predicts long-term results.' },
      { q:'Where is most of a professional trader\'s "money made"?', o:['In the preparation before the session','In watching every tick','In trading the news','In changing strategy often'], a:0, why:'Good preparation makes execution simple and mechanical.' }
    ] },

  { id:'m7-3', icon:'👑', title:'Going Professional',
    desc:'Prop firm challenges, compounding and scaling up, South African regulation and tax, and your graduation plan.',
    why:'This is where trading becomes a business. Protect your capital, grow it patiently and stay compliant.',
    lessons:[
      { id:'l7-3-1', icon:'🏢', title:'Prop Firm Challenges', tag:'CAREER',
        desc:`<strong>Prop firms</strong> let you trade their capital if you pass an evaluation. You pay a fee, hit a profit target without breaking strict loss limits, and then share the profits. It is a way to scale without risking large personal savings.`,
        svg:() => BMUD.prop(), label:'◆ PASS WITH DISCIPLINE, NOT WITH SPEED',
        how:`Read every rule before you start: profit target, daily loss limit, maximum drawdown, minimum trading days, news restrictions. Trade your normal plan at <strong>small risk</strong> (0.5% or less) — most challenges are failed by over-risking to hit the target fast.`,
        tip:`Check the firm's reputation, payout history and terms carefully. Rules and quality vary enormously between firms.`,
        points:['Typical rules: profit target, daily loss limit, max drawdown.','Most failures come from over-risking, not bad analysis.','Research the firm before paying any fee.'] },
      { id:'l7-3-2', icon:'📈', title:'Compounding & Scaling Up', tag:'GROWTH',
        desc:`Wealth in trading is built by <strong>small, consistent returns compounding</strong> over years — not by hero trades. 3% a month turns $10,000 into about $29,000 in three years without ever taking big risks.`,
        svg:() => BMUD.compound(), label:'◆ CONSISTENCY × TIME = WEALTH',
        how:`Keep risk fixed as a percentage, so position sizes grow automatically as your account grows. Only increase your risk % after a long track record — and never after a big win.`,
        tip:`Withdraw a portion of profits regularly. It turns screen numbers into real money and reduces the temptation to over-trade a big balance.`,
        points:['Small consistent returns compound into big results.','Fixed % risk scales your size automatically.','Never increase risk because of a winning streak.'] },
      { id:'l7-3-3', icon:'🇿🇦', title:'Regulation & Tax in South Africa', tag:'COMPLIANCE',
        desc:`Trade through properly regulated brokers (check their <strong>FSCA</strong> FSP number) and remember that trading profits are taxable. <strong>SARS</strong> usually treats profits from frequent, active trading as <strong>income</strong> rather than capital gains.`,
        svg:() => BMUD.sa(), label:'◆ STAY REGULATED · KEEP RECORDS',
        how:`Keep a full record of every deposit, withdrawal and trade — your Blue Mac journal and broker statements help. Speak to a registered tax practitioner about how your trading should be declared.`,
        tip:`This is general information, not tax or legal advice. Rules change and every situation is different.`,
        points:['Only use FSCA-authorised (or top-tier regulated) brokers.','Trading profits are taxable — keep complete records.','Get advice from a registered tax practitioner.'] },
      { id:'l7-3-4', icon:'🎓', title:'Graduation — Your Path From Here', tag:'GRADUATION',
        desc:`You've covered everything from your first pip to institutional order flow and the psychology of mastery. From here, the work is <strong>repetition</strong>: one plan, one style, a journal on every trade, and a weekly review — for months and years.`,
        svg:() => BMUD.graduate(), label:'◆ KNOWLEDGE IS DONE — NOW IT\'S EXECUTION',
        how:`1) Finalise your written plan. 2) Backtest it (100+ trades). 3) Demo for a month. 4) Go live small. 5) Journal everything. 6) Review weekly. 7) Scale only after consistent results. Use the Examples tab as your daily reference library.`,
        tip:`Come back to any module whenever something stops working. Most problems in trading are solved by going back to the basics you already learned.`,
        points:['Mastery = the same good process, repeated for years.','Plan → backtest → demo → small live → review → scale.','The Examples tab is your reference library for life.'] }
    ],
    quiz:[
      { q:'What causes most traders to fail prop firm challenges?', o:['Over-risking to hit the profit target quickly','Using a stop loss','Trading only A+ setups','Reading the rules'], a:0, why:'Breaking the daily or total loss limit — usually from over-sized trades — fails most challenges.' },
      { q:'Roughly what does $10,000 become after 36 months at 3% per month, compounded?', o:['About $29,000','About $13,600','About $108,000','About $10,300'], a:0, why:'10,000 × 1.03³⁶ ≈ $28,983.' },
      { q:'How should your position size grow as your account grows?', o:['Automatically, by keeping risk a fixed % of the balance','By doubling risk after every win','It should never change','By copying other traders\' sizes'], a:0, why:'Fixed-percentage risk scales size up with the account and down in drawdowns.' },
      { q:'How does SARS usually treat profits from frequent, active trading?', o:['As income','As tax-free','As a donation','Only as capital gains, always'], a:0, why:'Frequent trading profits are generally treated as revenue (income). Get advice from a registered tax practitioner.' },
      { q:'What is the correct order to take a new strategy live?', o:['Plan → backtest → demo → small live → scale','Live big → backtest later','Demo → skip the plan → live','Copy a signal group → scale'], a:0, why:'Each step proves the strategy before more money is at risk.' }
    ] }
  ] }
);
