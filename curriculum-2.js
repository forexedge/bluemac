// ══════════════════════════════════════════════════════
// BLUE MAC UNIVERSITY — Curriculum part 2
// Level 3 Technical Toolkit · Level 4 Risk Management
// ══════════════════════════════════════════════════════
(window.BMU_LEVELS = window.BMU_LEVELS || []).push(

// ═════════════ LEVEL 3 — TECHNICAL TOOLKIT ═════════════
{ id:'L3', num:3, title:'Technical Toolkit', icon:'🟣', color:'#96D0FF', badge:'Technical Analyst Certificate',
  sub:'Moving averages, Fibonacci, the indicators that matter, and the classic chart patterns.',
  modules:[
  { id:'m3-1', icon:'〰️', title:'Moving Averages — the Blue Mac Core',
    desc:'The 50 and 200 MA system that powers every Blue Mac trade idea, plus the fast EMAs used for scalping.',
    why:'Blue Mac\'s entire idea engine is built on the 50/200 MA relationship. Understanding it means understanding the app.',
    lessons:[
      { id:'l3-1-1', icon:'📍', tag:'MA', ref:'ex-price-position-vs-mas',
        points:['Price above both MAs = bullish bias. Below both = bearish.','Between the 50 and 200 = transition zone, reduce size or wait.','Always check price position on the higher timeframe first.'] },
      { id:'l3-1-2', icon:'📚', tag:'MA', ref:'ex-ma-stack-50-vs-200',
        points:['50 above 200 = bullish stack; 50 below 200 = bearish stack.','The stack gives you direction, not entries.','The same stack across several timeframes = strong confluence (Blue Mac Key).'] },
      { id:'l3-1-3', icon:'↔️', tag:'MA', ref:'ex-mas-spreading-vs-tangled',
        points:['Spreading MAs = momentum. Tangled MAs = chop.','Avoid trading when the 50 and 200 are tangled.','A compressing gap warns that the trend is weakening.'] },
      { id:'l3-1-4', icon:'🎯', tag:'ENTRY', ref:'ex-the-50-ma-pullback-entry',
        points:['In a trend, the 50 MA acts as dynamic support/resistance.','The pullback to the 50 MA is the Blue Mac "Entry Zone".','Confirm with a rejection candle before entering.'] },
      { id:'l3-1-5', icon:'✂️', tag:'SCALP', ref:'ind-ema',
        points:['EMA 9/21 crosses show short-term momentum shifts.','Buy the pullback after the cross — don\'t chase.','Ignore crosses that go against the higher-timeframe trend.'] }
    ],
    quiz:[
      { q:'Price is above the 50 MA and the 50 MA is above the 200 MA. What is the bias?', o:['Bullish — look for buys','Bearish — look for sells','Neutral — no bias','Trade both directions'], a:0, why:'Price above a bullish 50/200 stack is the clearest bullish bias in the MA system.' },
      { q:'Price is trading BETWEEN the 50 and 200 MA. What should you do?', o:['Treat it as a transition zone — reduce size or wait','Go all-in, it is the best zone','Ignore the MAs completely','Only trade with maximum leverage'], a:0, why:'Between the MAs the trend is not confirmed. Conviction should drop.' },
      { q:'The 50 and 200 MA are tangled and crossing each other repeatedly. This means…', o:['Choppy market — avoid trend trades','Strong trend','A guaranteed breakout','Buy every cross'], a:0, why:'Tangled MAs show no clear trend — the conditions where trend systems lose money.' },
      { q:'In the Blue Mac system, the pullback to the 50 MA in a trend is called the…', o:['Entry Zone','War Zone','Kill Zone','Dead Zone'], a:0, why:'Blue Mac calls the 50 MA pullback the Entry Zone (the 200 MA is the War Zone).' },
      { q:'The 9 EMA crosses above the 21 EMA. What is the professional way to use this?', o:['Wait for a pullback to the EMAs and buy the bounce','Buy immediately at any price','Sell, because crosses always fail','Close all trades'], a:0, why:'The cross shows momentum has turned; the better entry is the pullback after it.' }
    ] },

  { id:'m3-2', icon:'🌀', title:'Fibonacci',
    desc:'How to draw Fibonacci retracements, the levels that matter, and how to use extensions for profit targets.',
    why:'Fibonacci turns "price will pull back somewhere" into precise zones — and it is the backbone of premium/discount in Level 6.',
    lessons:[
      { id:'l3-2-1', icon:'🌀', tag:'FIB', ref:'fib-what', points:['Key levels: 38.2%, 50%, 61.8%, 78.6%.','Fib shows WHERE to look — confirmation shows WHEN.','61.8% is the most watched level.'] },
      { id:'l3-2-2', icon:'✏️', tag:'FIB', ref:'fib-draw-up', points:['Uptrend: swing low → swing high. Downtrend: high → low.','Use the swing that broke structure.','0% must sit at the end of the move.'] },
      { id:'l3-2-3', icon:'🟢', tag:'FIB', ref:'fib-buy618', points:['Buy the bullish close at 61.8% in an uptrend.','SL below 78.6% or the swing low.','TP1 = swing high, TP2 = 127.2%.'] },
      { id:'l3-2-4', icon:'🏆', tag:'FIB', ref:'fib-golden', points:['61.8–65% is the golden pocket — the highest-probability Fib zone.','Add the 0.65 level to your Fib tool.','Combine it with structure or an order block for A+ entries.'] },
      { id:'l3-2-5', icon:'🧱', tag:'CONFLUENCE', ref:'fib-sr', points:['Fib + flipped S/R = two reasons in one place.','2–3 confluences is the sweet spot.','More confluence = higher probability, not certainty.'] },
      { id:'l3-2-6', icon:'💰', tag:'TARGETS', ref:'fib-ext', points:['Extensions (127.2%, 161.8%) project targets beyond the old high.','Move SL to break-even when TP1 is hit.','Let a runner aim for 161.8%.'] }
    ],
    quiz:[
      { q:'In an uptrend, how do you draw the Fibonacci retracement?', o:['From the swing low to the swing high','From the swing high to the swing low','From any two candles','From the first candle of the day'], a:0, why:'In an uptrend you measure the up-move: click the low, drag to the high.' },
      { q:'Which level is known as the "golden ratio"?', o:['61.8%','23.6%','100%','161.8% only'], a:0, why:'61.8% is derived from the golden ratio and is the most watched retracement level.' },
      { q:'Where is the "golden pocket"?', o:['Between 61.8% and 65%','Between 0% and 23.6%','Above 100%','Exactly at 50%'], a:0, why:'The golden pocket is the tight 61.8–65% zone.' },
      { q:'Price closes below the 100% level of your bullish Fib. What does that mean?', o:['The pullback idea is invalid — the structure broke','Buy more, it is cheaper','Redraw the Fib until it works','Nothing'], a:0, why:'A close beyond 100% means the swing low broke. The setup is invalid.' },
      { q:'Which Fibonacci levels are commonly used as profit targets beyond the swing high?', o:['127.2% and 161.8% extensions','38.2% and 50%','0% only','78.6% and 100%'], a:0, why:'Extensions project beyond the old high/low and are used as targets.' }
    ] },

  { id:'m3-3', icon:'📊', title:'Indicators That Matter',
    desc:'RSI, divergence, MACD, Bollinger Bands and ATR — what each one really measures and how professionals use them.',
    why:'Indicators confirm what price is telling you. Used properly they filter bad trades; used badly they create them.',
    lessons:[
      { id:'l3-3-1', icon:'🌡️', tag:'OSCILLATOR', ref:'ind-rsi', points:['RSI above 70 = overbought, below 30 = oversold.','Use OB/OS in ranges only — trends can stay overbought for weeks.','Wait for RSI to hook back and a candle to confirm.'] },
      { id:'l3-3-2', icon:'↗️', tag:'OSCILLATOR', ref:'ind-rsi-bull-div', points:['Divergence = price and momentum disagree.','Bullish: price lower low, RSI higher low.','Divergence is a warning; wait for structure to confirm.'] },
      { id:'l3-3-3', icon:'〰️', tag:'MOMENTUM', ref:'ind-macd', points:['MACD = 12 EMA − 26 EMA; signal = 9 EMA of MACD.','Best buy crosses happen below the zero line.','A shrinking histogram warns momentum is fading.'] },
      { id:'l3-3-4', icon:'🗜️', tag:'VOLATILITY', ref:'ind-bb-squeeze', points:['Tight bands = low volatility = breakout coming.','Don\'t guess direction — trade the close outside the band.','Longer squeezes usually lead to bigger moves.'] },
      { id:'l3-3-5', icon:'📏', tag:'RISK TOOL', ref:'ind-atr', points:['ATR measures normal movement per candle.','SL ≈ 1.5 × ATR keeps you outside normal noise.','High ATR = wider stop = smaller lot size.'] }
    ],
    quiz:[
      { q:'RSI reads 78. What does that tell you?', o:['Price is overbought — but in a strong trend it can stay there','You must sell immediately','The trend has ended','RSI is broken'], a:0, why:'Above 70 is overbought. In ranges it can signal a turn; in trends it often just shows strength.' },
      { q:'Price makes a LOWER low while RSI makes a HIGHER low. This is…', o:['Bullish divergence','Bearish divergence','Hidden bearish divergence','A MACD crossover'], a:0, why:'Weaker momentum on the second low = sellers losing strength = bullish divergence.' },
      { q:'What is the MACD line?', o:['The 12 EMA minus the 26 EMA','The 50 SMA','The RSI multiplied by 2','The average spread'], a:0, why:'MACD = fast EMA (12) − slow EMA (26). The signal line is a 9-period EMA of MACD.' },
      { q:'Bollinger Bands are at their narrowest in weeks. What should you expect?', o:['A volatility expansion (breakout) soon','The market to close','Guaranteed upward move','Nothing — bands are random'], a:0, why:'Squeezes (low volatility) tend to be followed by expansions (big moves).' },
      { q:'ATR is 20 pips. Using the 1.5 × ATR rule, where does your stop go?', o:['About 30 pips from entry','About 20 pips','About 2 pips','About 150 pips'], a:0, why:'1.5 × 20 = 30 pips — outside the normal noise of the market.' }
    ] },

  { id:'m3-4', icon:'🔺', title:'Classic Chart Patterns',
    desc:'The reversal and continuation patterns that have worked for over a century — and exactly how to trade them.',
    why:'Patterns are visual summaries of supply and demand. They give you entries, stops and measured targets in one picture.',
    lessons:[
      { id:'l3-4-1', icon:'👤', tag:'REVERSAL', ref:'pat-hs', points:['Three peaks with the middle highest.','Only confirmed on a close below the neckline.','Target = head-to-neckline height projected down.'] },
      { id:'l3-4-2', icon:'⛰️', tag:'REVERSAL', ref:'pat-dt', points:['Two equal highs that fail = sellers defending.','Confirmed on a close below the neckline.','The second top often sweeps the first (liquidity grab).'] },
      { id:'l3-4-3', icon:'〽️', tag:'REVERSAL', ref:'pat-db', points:['Two equal lows that hold = buyers defending.','Confirmed on a close above the neckline.','Target = pattern height projected up.'] },
      { id:'l3-4-4', icon:'📐', tag:'CONTINUATION', ref:'pat-at', points:['Flat resistance + rising lows = buyers getting more aggressive.','Usually breaks up in an uptrend.','Buy the close above resistance or its retest.'] },
      { id:'l3-4-5', icon:'🚩', tag:'CONTINUATION', ref:'pat-flag', points:['Strong pole + small counter-trend flag = pause before continuation.','Enter on the break of the flag.','Target = pole height projected from the breakout.'] },
      { id:'l3-4-6', icon:'📉', tag:'REVERSAL', ref:'pat-fw', points:['Falling wedge = downside momentum fading.','Usually breaks to the upside.','Wait for the break and close above the upper line.'] }
    ],
    quiz:[
      { q:'When is a Head & Shoulders pattern confirmed?', o:['When a candle closes below the neckline','When the head forms','When the right shoulder starts','Immediately after the left shoulder'], a:0, why:'Until the neckline breaks, it is only a potential pattern.' },
      { q:'How do you calculate the target of a Double Top?', o:['Height from the tops to the neckline, projected down from the break','Always 50 pips','The 200 MA','The previous day high'], a:0, why:'Measured move: the pattern height projected from the breakout point.' },
      { q:'An ascending triangle has…', o:['Flat resistance and rising lows','Falling highs and flat support','Two equal lows','No trendlines'], a:0, why:'Rising lows pressing into flat resistance shows buyers getting more aggressive.' },
      { q:'A bull flag is a…', o:['Continuation pattern after a strong move up','Reversal pattern at the top','Volatility indicator','Type of order'], a:0, why:'The flag is a pause in an uptrend before continuation.' },
      { q:'A falling wedge most often breaks…', o:['Upwards','Downwards','Sideways forever','It never breaks'], a:0, why:'Falling wedges show fading downside momentum and usually resolve upwards.' }
    ] }
  ] },

// ═════════════ LEVEL 4 — RISK MANAGEMENT ═════════════
{ id:'L4', num:4, title:'Risk Management', icon:'🔴', color:'#FF5C5C', badge:'Risk Manager Certificate',
  sub:'The level that decides whether you survive. Position sizing, R:R, stop placement and managing open trades.',
  modules:[
  { id:'m4-1', icon:'🛡️', title:'Protecting Your Capital',
    desc:'The maths of losses, the 1% rule, position sizing, risk-to-reward and where stops belong.',
    why:'You can have the best strategy in the world and still blow your account with bad risk. This module is non-negotiable.',
    lessons:[
      { id:'l4-1-1', icon:'📉', title:'The Maths of Losing', tag:'CRITICAL',
        desc:`Losses hurt more than gains help. Lose 10% and you need +11% to get back. Lose 50% and you need <strong>+100%</strong> just to break even. That is why professionals obsess over <strong>not losing big</strong> rather than winning big.`,
        svg:() => BMUD.drawdown(), label:'✕ DEEP DRAWDOWNS ARE ALMOST IMPOSSIBLE TO RECOVER',
        how:`Risk a small, fixed percentage per trade (0.5–1%, never more than 2%). Set a maximum daily loss (e.g. 2–3%) and a maximum weekly loss, and stop trading when you hit them.`,
        tip:`Recovery needed = loss ÷ (1 − loss). At −20% you need +25%; at −75% you need +300%.`,
        points:['Big losses need impossible gains to recover.','Risk 0.5–1% per trade, max 2%.','Have daily and weekly loss limits — and obey them.'] },
      { id:'l4-1-2', icon:'🎲', title:'Losing Streaks & the 1% Rule', tag:'CRITICAL',
        desc:`Even great strategies have losing streaks of 6, 8, 10 trades. The question is not <em>if</em> it happens, but whether your account survives it. At 1% risk, 10 losses in a row leaves 90% of your account. At 10% risk it leaves 35%.`,
        svg:() => BMUD.streak(), label:'◆ SURVIVE THE STREAK, LET THE EDGE PLAY OUT',
        how:`Choose your risk per trade so that your worst realistic losing streak (10+ trades) would not stop you trading. For most traders that means 1% or less.`,
        tip:`With 1% risk you could lose 10 trades in a row and still have over 90% of your account — enough to keep executing your edge.`,
        points:['Losing streaks are normal, even for profitable traders.','Small, fixed risk is what lets you survive them.','10 losses at 1% = −9.6%. At 10% = −65%.'] },
      { id:'l4-1-3', icon:'🧮', tag:'SIZING', ref:'mgt-sizing', points:['Lots = risk $ ÷ (SL pips × pip value).','Wide stop → smaller lots. Tight stop → bigger lots. Same $ risk.','Always round lot size DOWN.'] },
      { id:'l4-1-4', icon:'⚖️', tag:'R:R', ref:'mgt-rr', points:['R:R = distance to TP ÷ distance to SL.','Blue Mac rule: TP1 ≥ 1:2 and TP2 ≥ 1:3.','At 1:3 you only need to win 25% of trades to break even.'] },
      { id:'l4-1-5', icon:'🛑', tag:'STOPS', ref:'fib-sl', points:['Stops go where your idea is proven wrong.','Add a buffer beyond levels for spread and stop hunts.','Size the lot to the stop — never move the stop to fit the lot.'] }
    ],
    quiz:[
      { q:'You lose 50% of your account. What gain do you need to get back to break-even?', o:['+100%','+50%','+25%','+75%'], a:0, why:'From 50% of the original, you must double it: 50 ÷ (1 − 0.5) = 100%.' },
      { q:'What is a sensible maximum risk per trade for most traders?', o:['0.5–1% (never above 2%)','10%','25%','Whatever feels right'], a:0, why:'Small fixed risk lets you survive normal losing streaks.' },
      { q:'Account $5,000, risk 1%, stop loss 25 pips on EURUSD ($10/pip per lot). What lot size?', o:['0.20 lots','2.00 lots','0.02 lots','0.50 lots'], a:0, why:'Risk = $50. $50 ÷ (25 × $10) = 0.20 lots.' },
      { q:'Your SL is 20 pips and your TP is 60 pips. What is the R:R?', o:['1:3','3:1 against you','1:2','1:1'], a:0, why:'60 ÷ 20 = 3, so you risk 1 to make 3.' },
      { q:'At 1:3 R:R, what win rate do you need just to break even?', o:['25%','50%','75%','10%'], a:0, why:'Break-even win rate = 1 ÷ (1 + 3) = 25%.' }
    ] },

  { id:'m4-2', icon:'⚙️', title:'Managing Open Trades',
    desc:'Taking partial profits, moving to break-even, trailing stops, handling news and avoiding hidden correlation risk.',
    why:'Entries get the attention, but exits decide your results. Good management turns average entries into a profitable system.',
    lessons:[
      { id:'l4-2-1', icon:'✂️', tag:'EXITS', ref:'mgt-partials', points:['Close part at TP1, move SL to break-even, let the rest run.','After TP1 the trade cannot become a big loser.','This is how Blue Mac trade ideas are structured.'] },
      { id:'l4-2-2', icon:'🛡️', tag:'EXITS', ref:'mgt-be', points:['Move to break-even at 1R (or after a new BOS) — not earlier.','Break-even turns a potential loss into a free trade.','Too early = stopped out of good trades by normal pullbacks.'] },
      { id:'l4-2-3', icon:'🪜', tag:'EXITS', ref:'mgt-trail', points:['Trail your stop behind each new higher low (or lower high).','Never move a stop backwards.','Trail on the timeframe you entered on.'] },
      { id:'l4-2-4', icon:'📰', tag:'RISK', ref:'mgt-news', points:['Check the calendar every morning.','No new trades 15–30 min around red-folder news.','Protect open trades before big releases.'] },
      { id:'l4-2-5', icon:'💵', tag:'RISK', ref:'mgt-dxy', points:['DXY up usually means EURUSD, GBPUSD and gold down.','Several USD trades in the same direction = one big bet.','Check DXY before every USD trade.'] }
    ],
    quiz:[
      { q:'Price hits TP1 at 2R. What is the standard management step?', o:['Close part (e.g. 50%) and move SL to break-even','Close nothing and widen the stop','Double the position','Remove the stop loss'], a:0, why:'Locking in part and moving to BE removes risk while keeping upside.' },
      { q:'When is it usually too early to move a stop to break-even?', o:['Before price has moved about 1R in your favour','After TP1','After a new BOS in your direction','After the trade closes'], a:0, why:'Moving to BE too early gets you stopped out by normal pullbacks.' },
      { q:'How do you trail a stop in an uptrend?', o:['Move it below each new higher low','Move it above each high','Move it further away when price drops','Never move it'], a:0, why:'Each new higher low is the new "structure is still intact" level.' },
      { q:'US CPI (red folder) is released in 10 minutes. What should you do?', o:['Avoid opening new trades until after the release settles','Open the biggest trade of the week','Remove all stop losses','Switch to maximum leverage'], a:0, why:'High-impact news causes spikes, slippage and wide spreads.' },
      { q:'You are long EURUSD, long GBPUSD and long gold. What hidden risk do you have?', o:['They are all bets against the US dollar — 3× the dollar risk','None, they are different markets','They cancel each other out','Only gold carries risk'], a:0, why:'All three tend to fall when the dollar rises, so the risk is concentrated.' }
    ] }
  ] }
);
