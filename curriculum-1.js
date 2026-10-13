// ══════════════════════════════════════════════════════
// BLUE MAC UNIVERSITY — Curriculum part 1
// Level 1 Foundations · Level 2 Reading Charts
// ══════════════════════════════════════════════════════
(window.BMU_LEVELS = window.BMU_LEVELS || []).push(

// ═════════════ LEVEL 1 — FOUNDATIONS ═════════════
{ id:'L1', num:1, title:'Foundations', icon:'🟢', color:'#22D67A', badge:'Foundations Certificate',
  sub:'How the forex market works, the maths behind every trade, and how to place your first order safely.',
  modules:[
  { id:'m1-1', icon:'🌍', title:'How the Forex Market Works',
    desc:'What you are actually trading, which markets to start with, who moves price, and when the market is open.',
    why:'Everything else in this degree assumes you know what a currency pair is and who is on the other side of your trade.',
    lessons:[
      { id:'l1-1-1', icon:'💱', title:'What Is Forex Trading?', tag:'BASICS',
        desc:`<strong>Forex</strong> (foreign exchange) is the buying of one currency while selling another. It is the biggest financial market on earth — trillions of dollars change hands every day. Currencies are always quoted in <strong>pairs</strong>, like EUR/USD.`,
        svg:() => BMUD.pair(), label:'◆ THE FIRST CURRENCY IS WHAT YOU TRADE',
        how:`Read a quote as "1 unit of the first currency costs X of the second". If you think the euro will strengthen against the dollar, you <strong>buy</strong> EUR/USD. If you think it will weaken, you <strong>sell</strong>.`,
        tip:`The first currency is the <strong>base</strong>, the second is the <strong>quote</strong>. When EUR/USD goes up, the euro is getting stronger (or the dollar weaker).`,
        points:['Forex is always traded in pairs — you buy one currency and sell the other at the same time.','Price going up means the base (first) currency is strengthening.','You can make money whether price rises (buy) or falls (sell).'] },
      { id:'l1-1-2', icon:'🗂️', title:'Currency Pairs: Majors, Crosses & Exotics', tag:'BASICS',
        desc:`Pairs are grouped by how much they trade. <strong>Majors</strong> all include the US dollar and are the most traded. <strong>Crosses</strong> pair two non-USD currencies. <strong>Exotics</strong> include an emerging-market currency like the rand (ZAR). Most brokers also offer <strong>gold (XAUUSD)</strong> and <strong>stock indices</strong>.`,
        svg:() => BMUD.pairs(), label:'◆ MORE VOLUME = TIGHTER SPREADS + CLEANER CHARTS',
        how:`Start with 1–3 majors (EURUSD, GBPUSD, USDJPY) and learn how they move. Exotics like USDZAR have wide spreads and sudden spikes — leave them until you are consistent.`,
        tip:`Gold and indices move much faster than currency pairs. Same analysis works, but the lot size and pip value are different — always check before trading them.`,
        points:['Majors = USD paired with another major currency. Highest volume, lowest cost.','Exotics like USDZAR are expensive to trade and very jumpy.','Master a few pairs deeply rather than trading everything.'] },
      { id:'l1-1-3', icon:'🏛️', title:'Who Moves the Market?', tag:'BASICS',
        desc:`Price is driven by the biggest players: <strong>central banks</strong> set interest rates, <strong>commercial banks</strong> trade huge volumes between each other, and <strong>funds and institutions</strong> move billions. Retail traders like us are a small part of the volume.`,
        svg:() => BMUD.pyramid(), label:'◆ RETAIL FOLLOWS — INSTITUTIONS LEAD',
        how:`Your edge is not being bigger — it is <strong>reading where the big players are likely to act</strong> (key levels, liquidity, order blocks) and trading in the same direction. That is what Levels 2–6 teach you.`,
        tip:`Interest rate decisions by central banks (Fed, ECB, SARB…) are the single biggest long-term driver of currencies. Higher rates usually attract money into a currency.`,
        points:['Central banks, banks and funds create the big moves.','Retail traders win by following institutional footprints, not fighting them.','Interest rates drive long-term currency direction.'] },
      { id:'l1-1-4', icon:'🕐', title:'Trading Sessions & the Best Times to Trade', tag:'TIMING', ref:'ex-trading-session-times-sast',
        points:['Forex runs 24 hours, 5 days a week — but not every hour is worth trading.','London and New York sessions bring the volume and the clean moves.','The Asian session is slow and choppy for most pairs — avoid it for short-term trading.'] }
    ],
    quiz:[
      { q:'In the pair EUR/USD, which currency is the base currency?', o:['EUR','USD','Both equally','Neither — it is a commodity'], a:0, why:'The first currency in the pair is the base. The quote tells you how much of the second currency one unit of the base costs.' },
      { q:'You think the euro will get stronger against the US dollar. What do you do on EUR/USD?', o:['Buy (go long)','Sell (go short)','Do nothing — you can only trade falling prices','Buy USD/EUR instead of EUR/USD'], a:0, why:'If the base currency strengthens, the pair rises, so you buy.' },
      { q:'Which of these is a MAJOR pair?', o:['GBPUSD','USDZAR','EURGBP','GBPJPY'], a:0, why:'Majors always include the US dollar and another major currency. USDZAR is an exotic; EURGBP and GBPJPY are crosses.' },
      { q:'Who has the most influence on long-term currency direction?', o:['Central banks setting interest rates','Retail traders on social media','Brokers','Chart patterns'], a:0, why:'Central bank interest rate policy is the biggest long-term driver of currency value.' },
      { q:'Why do most short-term traders avoid the Asian session on pairs like EURUSD?', o:['Low volume — choppy price and false signals','The market is closed','Spreads are always zero','It is illegal to trade at night in SA'], a:0, why:'The Asian session has much lower volume on European pairs, which creates slow, choppy price action.' }
    ] },

  { id:'m1-2', icon:'🧮', title:'The Maths of Every Trade',
    desc:'Pips, lot sizes, leverage and trading costs — the numbers behind every profit and loss you will ever make.',
    why:'You cannot manage risk (Level 4) or size a position correctly if you don\'t know what a pip is worth.',
    lessons:[
      { id:'l1-2-1', icon:'📏', title:'Pips & Pipettes', tag:'CRITICAL',
        desc:`A <strong>pip</strong> is the standard unit of price movement. On most pairs it is the <strong>4th decimal place</strong> (0.0001). Brokers quote a 5th decimal — the <strong>pipette</strong>, one tenth of a pip. Every profit, loss, stop and target is measured in pips.`,
        svg:() => BMUD.pips(), label:'◆ PIPS = THE RULER OF THE MARKET',
        how:`Count pips as the difference between two prices. EURUSD 1.0850 → 1.0900 is 50 pips. On JPY pairs the pip is the 2nd decimal: USDJPY 157.42 → 157.52 is 10 pips.`,
        tip:`Gold and indices are quoted differently from broker to broker. Before trading them, open a 0.01 lot on demo and watch how much $1 of movement is worth.`,
        points:['1 pip = 0.0001 on most pairs, 0.01 on JPY pairs.','The 5th decimal is a pipette (0.1 pip).','Always measure your stop loss and target in pips before entering.'] },
      { id:'l1-2-2', icon:'⚖️', title:'Lot Sizes & Pip Value', tag:'CRITICAL',
        desc:`A <strong>lot</strong> is your trade size. A <strong>standard lot</strong> is 100,000 units of the base currency, a <strong>mini lot</strong> 10,000 and a <strong>micro lot</strong> 1,000. The bigger the lot, the more each pip is worth.`,
        svg:() => BMUD.lots(), label:'◆ LOT SIZE DECIDES WHAT EACH PIP IS WORTH',
        how:`For pairs quoted in USD (EURUSD, GBPUSD): 1.00 lot ≈ $10 per pip, 0.10 ≈ $1, 0.01 ≈ $0.10. A 20-pip stop on 0.10 lots therefore risks about $20.`,
        tip:`Pip value changes for pairs where USD is not the quote currency (USDJPY, EURGBP). Your broker's platform or a position-size calculator does the conversion for you.`,
        points:['Standard 1.00 = 100k units · Mini 0.10 = 10k · Micro 0.01 = 1k.','EURUSD: 1.00 lot ≈ $10 per pip.','Risk in money = stop loss in pips × pip value.'] },
      { id:'l1-2-3', icon:'🎚️', title:'Leverage & Margin', tag:'CRITICAL',
        desc:`<strong>Leverage</strong> lets you control a big position with a small deposit. At 1:100, $1,000 can control $100,000. The money your broker sets aside to hold the trade is called <strong>margin</strong>. Leverage multiplies wins <em>and</em> losses.`,
        svg:() => BMUD.leverage(), label:'✕ LEVERAGE IS A LOAN, NOT FREE MONEY',
        how:`Use leverage only as a convenience — your <strong>real</strong> risk is controlled by your stop loss and lot size, not by how much leverage your broker offers. If your margin level falls too low, the broker will close your trades automatically (a <strong>stop-out</strong>).`,
        tip:`High leverage is the #1 reason beginners blow accounts: they use it to open positions far too big for their balance. Level 4 shows you how to size every trade correctly.`,
        points:['Leverage = control a large position with a small deposit.','Margin = the deposit the broker locks up while the trade is open.','Big leverage + big lots = account blown in one move.'] },
      { id:'l1-2-4', icon:'💸', title:'Spread, Commission & Swap', tag:'COSTS',
        desc:`Every trade has a cost. The <strong>spread</strong> is the gap between the buy price (ask) and sell price (bid). Some accounts also charge a <strong>commission</strong> per lot. Holding a trade past the daily rollover adds a <strong>swap</strong> (interest), which can be a cost or a credit.`,
        svg:() => BMUD.spread(), label:'◆ YOU BUY AT THE ASK · YOU SELL AT THE BID',
        how:`Compare total cost (spread + commission) between account types. For short-term trading, costs matter a lot — a 2-pip spread on a 10-pip target eats 20% of your profit.`,
        tip:`Spreads widen around news, at the daily rollover (around midnight SAST) and on Monday opens. Avoid placing tight trades at those times.`,
        points:['Spread = ask − bid. You start every trade slightly negative.','Commission is charged on raw/ECN accounts.','Swap is charged (or paid) for holding trades overnight.'] }
    ],
    quiz:[
      { q:'EURUSD moves from 1.0820 to 1.0865. How many pips is that?', o:['45 pips','4.5 pips','450 pips','0.45 pips'], a:0, why:'1.0865 − 1.0820 = 0.0045 = 45 pips (1 pip = 0.0001).' },
      { q:'On USDJPY, which decimal place is the pip?', o:['The 2nd decimal (0.01)','The 4th decimal','The 5th decimal','The whole number'], a:0, why:'JPY pairs are quoted with fewer decimals, so a pip is 0.01.' },
      { q:'Roughly what is 1 pip worth on 0.10 lots of EURUSD?', o:['$1','$10','$0.10','$100'], a:0, why:'A mini lot (0.10) on a USD-quoted pair is about $1 per pip.' },
      { q:'What does leverage of 1:100 mean?', o:['$1 of your money controls $100 of position','You must risk 100% of your account','You can only open 100 trades','Your profit is guaranteed to be 100×'], a:0, why:'Leverage is a ratio of position size to your margin. It magnifies both profits and losses.' },
      { q:'You buy EURUSD at the ask price of 1.08512 while the bid is 1.08500. What is the spread?', o:['1.2 pips','12 pips','0.12 pips','120 pips'], a:0, why:'1.08512 − 1.08500 = 0.00012 = 1.2 pips.' }
    ] },

  { id:'m1-3', icon:'🏦', title:'Brokers, Platforms & Orders',
    desc:'How to choose a safe broker in South Africa, which platforms you need, and every order type you will use.',
    why:'A bad broker can freeze your withdrawals, and the wrong order type can open a trade you never meant to take.',
    lessons:[
      { id:'l1-3-1', icon:'🛡️', title:'Choosing a Safe Broker (FSCA)', tag:'CRITICAL',
        desc:`Your broker holds your money. In South Africa, brokers must be authorised by the <strong>FSCA</strong> (Financial Sector Conduct Authority) and have an <strong>FSP number</strong>. Regulation is non-negotiable — then compare costs, execution, ZAR funding and support.`,
        svg:() => BMUD.broker(), label:'◆ REGULATION FIRST — EVERYTHING ELSE SECOND',
        how:`Search the broker's FSP number on the FSCA website before depositing. Check withdrawal times and fees, whether they support ZAR deposits, and test their support on a small deposit first.`,
        tip:`Be very careful of "account managers", signal sellers or anyone offering guaranteed returns. Legitimate brokers never promise profits.`,
        points:['Only use a broker with a verifiable FSCA FSP number (or a top-tier regulator).','Test withdrawals with a small amount before depositing more.','Guaranteed returns = scam. Always.'] },
      { id:'l1-3-2', icon:'💻', title:'Your Trading Platforms', tag:'SETUP',
        desc:`Most traders use three tools: a <strong>charting platform</strong> to analyse (TradingView), the <strong>broker platform</strong> to place trades (MT4/MT5), and a <strong>journal</strong> to plan and review (Blue Mac). Practise everything on a <strong>demo account</strong> first.`,
        svg:() => BMUD.platforms(), label:'◆ ANALYSE → EXECUTE → REVIEW',
        how:`Open a free demo account with your broker and place at least 20 practice trades: market orders, pending orders, moving stops, closing partials. You want the buttons to be automatic before real money is involved.`,
        tip:`Make sure your chart's price feed matches your broker's. Small differences between feeds can matter for tight stops.`,
        points:['TradingView for charts, MT4/MT5 to trade, Blue Mac to plan and journal.','Demo first — learn the platform without paying for mistakes.','Know how to set SL/TP and close a trade before you go live.'] },
      { id:'l1-3-3', icon:'↕️', title:'Going Long vs Going Short', tag:'BASICS',
        desc:`Unlike buying shares, in forex you can profit in <strong>both directions</strong>. <strong>Long</strong> = buy now, sell higher later. <strong>Short</strong> = sell now, buy back lower later. Your analysis decides the direction — never your hope.`,
        svg:() => BMUD.longshort(), label:'◆ TRADE THE DIRECTION THE CHART GIVES YOU',
        how:`Always check the higher-timeframe trend first. In an uptrend look for longs, in a downtrend look for shorts. Trading against the trend is how most beginners lose.`,
        tip:`In Blue Mac, choosing LONG means you expect price to rise. Make sure your direction matches the higher-timeframe bias before generating an idea.`,
        points:['Long = profit when price rises. Short = profit when price falls.','Direction comes from the chart, not from your opinion.','Trade with the higher-timeframe trend.'] },
      { id:'l1-3-4', icon:'📋', title:'Order Types: Market, Limit & Stop', tag:'EXECUTION',
        desc:`A <strong>market order</strong> fills right now. <strong>Pending orders</strong> wait for price: a <strong>limit</strong> order buys cheaper or sells higher (pullback entries), a <strong>stop</strong> order buys higher or sells lower (breakout entries).`,
        svg:() => BMUD.orders(), label:'◆ LIMIT = BETTER PRICE · STOP = BREAKOUT',
        how:`Use a <strong>buy limit</strong> below price to buy a pullback into support, and a <strong>sell limit</strong> above price to sell into resistance. Use <strong>buy/sell stop</strong> orders to catch a breakout without staring at the screen.`,
        tip:`A "stop loss" is just a stop order that closes your trade. Every trade you open should have one attached from the start.`,
        points:['Market = now. Limit = better price. Stop = breakout.','Buy limit below price, sell limit above price.','Pending orders let you trade your plan without watching the screen.'] },
      { id:'l1-3-5', icon:'🎯', title:'Stop Loss & Take Profit', tag:'CRITICAL',
        desc:`A <strong>stop loss (SL)</strong> closes your trade at a planned loss if you are wrong. A <strong>take profit (TP)</strong> closes it at your target. Professionals decide both <strong>before</strong> entering — never in the middle of a trade.`,
        svg:() => BMUD.sltp(), label:'✓ NO STOP LOSS = NO TRADE',
        how:`Place the SL where your trade idea is proven wrong (beyond a swing high/low or level), not at a random number of pips. Place the TP at the next logical level. Level 4 teaches the exact maths.`,
        tip:`Never remove or widen a stop loss because a trade is going against you. That one habit separates traders who last from traders who don't.`,
        points:['Every trade gets a stop loss and a take profit before entry.','The SL goes where your idea is wrong — not where it "feels" safe.','Never widen a stop once the trade is live.'] }
    ],
    quiz:[
      { q:'What is the FIRST thing to check when choosing a broker in South Africa?', o:['That it has a valid FSCA FSP number','That it has the highest leverage','That it offers bonuses','That influencers use it'], a:0, why:'Regulation protects your money. Check the FSP number on the FSCA website before anything else.' },
      { q:'Price is at 1.0900. You want to BUY only if price pulls back to support at 1.0860. Which order?', o:['Buy limit at 1.0860','Buy stop at 1.0860','Sell limit at 1.0860','Market buy now'], a:0, why:'A buy limit is placed below the current price to buy at a cheaper price.' },
      { q:'You want to buy only if price breaks ABOVE resistance at 1.0950 (price is at 1.0900). Which order?', o:['Buy stop at 1.0950','Buy limit at 1.0950','Sell stop at 1.0950','Sell limit at 1.0950'], a:0, why:'A buy stop is placed above the current price to enter on a breakout.' },
      { q:'Going SHORT means you profit when…', o:['Price falls','Price rises','Price stays flat','The spread widens'], a:0, why:'Short = sell first, buy back lower.' },
      { q:'Where should a stop loss be placed?', o:['Where your trade idea is proven wrong (beyond structure)','Always exactly 10 pips away','Wherever the loss feels comfortable','Stops are optional for experienced traders'], a:0, why:'The stop belongs at the price that invalidates your setup — usually beyond a swing point or level.' }
    ] }
  ] },

// ═════════════ LEVEL 2 — READING CHARTS ═════════════
{ id:'L2', num:2, title:'Reading Charts', icon:'🔵', color:'#2A8FE3', badge:'Chart Reader Certificate',
  sub:'Candlesticks, timeframes, market structure and the key levels where price reacts.',
  modules:[
  { id:'m2-1', icon:'🕯️', title:'Candlesticks',
    desc:'How to read a single candle, how timeframes fit together, and the candle signals that show who is in control.',
    why:'Candles are the alphabet of the chart. Every pattern, indicator and Smart Money concept later is built from them.',
    lessons:[
      { id:'l2-1-1', icon:'🕯️', title:'Anatomy of a Candlestick', tag:'BASICS',
        desc:`Each candle shows four prices for its time period: <strong>open, high, low and close</strong>. The thick <strong>body</strong> runs from open to close. The thin <strong>wicks</strong> show how far price travelled before being pushed back. Green = closed higher, red = closed lower.`,
        svg:() => BMUD.anatomy(), label:'◆ EVERY CANDLE TELLS A BATTLE STORY',
        how:`Read the body for <strong>who won</strong> (big body = strong control) and the wicks for <strong>who got rejected</strong> (long upper wick = sellers pushed price back down; long lower wick = buyers pushed it back up).`,
        tip:`The close is the most important price of a candle. Never act on a candle until it has closed — its shape can completely change in the last minutes.`,
        points:['Open, high, low, close — four prices in one candle.','Body = who won. Wicks = where price was rejected.','Wait for the candle to close before acting on it.'] },
      { id:'l2-1-2', icon:'⏱️', title:'Timeframes Explained', tag:'BASICS',
        desc:`Every candle covers a fixed time: 1 minute (M1), 15 minutes (M15), 1 hour (H1), 4 hours (H4), 1 day (D1), 1 week (W1). <strong>Higher timeframes</strong> combine many lower-timeframe candles — they show the bigger, more reliable picture.`,
        svg:() => BMUD.timeframes(), label:'◆ 4 × H1 CANDLES = 1 × H4 CANDLE',
        how:`Use a higher timeframe for direction and a lower one for entries. A signal on the D1 matters far more than the same signal on the M5.`,
        tip:`The lower the timeframe, the more noise and false signals. Beginners do better on H1 and above.`,
        points:['Higher timeframe = bigger picture, more reliable.','Lower timeframe = more detail, more noise.','Use the higher TF for direction, the lower TF for timing.'] },
      { id:'l2-1-3', icon:'🟢', tag:'SIGNALS', ref:'ex-bullish-candlestick-signals',
        points:['Bullish signals matter most at support or in an uptrend.','A long lower wick shows buyers stepping in.','Wait for the next candle to confirm.'] },
      { id:'l2-1-4', icon:'🔴', tag:'SIGNALS', ref:'ex-bearish-candlestick-signals',
        points:['Bearish signals matter most at resistance or in a downtrend.','A long upper wick shows sellers stepping in.','A signal in the middle of nowhere means very little.'] },
      { id:'l2-1-5', icon:'✳️', tag:'SIGNALS', ref:'ex-gravestone-doji-and-dragonfly-doji',
        points:['Doji = indecision. Neither side won the candle.','At a key level, a doji can warn that the trend is pausing or turning.','Always wait for confirmation after a doji.'] },
      { id:'l2-1-6', icon:'⭐', tag:'SIGNALS', ref:'ex-morning-star-and-evening-star',
        points:['Three-candle patterns show a shift in control over time.','Morning star = bullish reversal; evening star = bearish reversal.','The third candle must close strongly to confirm.'] }
    ],
    quiz:[
      { q:'A candle opens at 1.0850 and closes at 1.0880. What colour is it usually shown in?', o:['Green (bullish)','Red (bearish)','Grey (doji)','It depends on the wick'], a:0, why:'Close above open = bullish candle.' },
      { q:'A long upper wick at resistance shows…', o:['Sellers rejected higher prices','Buyers are in full control','The market is closed','Nothing — wicks are noise'], a:0, why:'Price went up but was pushed back down before the close: sellers rejected those prices.' },
      { q:'How many H1 candles make up one H4 candle?', o:['4','1','24','60'], a:0, why:'4 one-hour candles = one four-hour candle.' },
      { q:'When should you act on a candlestick signal?', o:['After the candle has closed','As soon as the candle opens','Halfway through the candle','Whenever it looks right'], a:0, why:'The candle can completely change shape before it closes. Only the closed candle counts.' },
      { q:'A doji candle on its own means…', o:['Indecision — wait for confirmation','A guaranteed reversal','A guaranteed continuation','The broker has a price error'], a:0, why:'A doji shows balance between buyers and sellers. It is a warning, not an entry.' }
    ] },

  { id:'m2-2', icon:'🧭', title:'Market Structure',
    desc:'Swing highs and lows, trends, breaks of structure and changes of character — how to tell exactly what the trend is doing.',
    why:'Structure tells you the direction to trade. Without it, every tool in Levels 3–6 is just guessing.',
    lessons:[
      { id:'l2-2-1', icon:'⛰️', tag:'STRUCTURE', ref:'ex-swing-high-and-swing-low',
        points:['A swing high is a peak with lower highs on both sides; a swing low is the opposite.','Swing points are where stops sit and where structure is measured.','Mark them on the higher timeframe first.'] },
      { id:'l2-2-2', icon:'📈', tag:'STRUCTURE', ref:'ex-market-structure-hh-hl-vs-ll-lh',
        points:['Uptrend = higher highs + higher lows. Downtrend = lower lows + lower highs.','No clear sequence = range. Trade the edges or stay out.','Structure is the first thing you check on every chart.'] },
      { id:'l2-2-3', icon:'📶', tag:'STRUCTURE', ref:'smc-bos',
        points:['A BOS needs a candle BODY close beyond the last swing.','Each BOS confirms the trend is continuing.','Buy the higher low after a bullish BOS (sell the lower high after a bearish one).'] },
      { id:'l2-2-4', icon:'🔀', tag:'STRUCTURE', ref:'smc-choch',
        points:['CHoCH = the first break against the trend.','After a CHoCH, stop trading the old direction.','A lower-timeframe CHoCH inside a higher-timeframe zone is a powerful entry trigger.'] },
      { id:'l2-2-5', icon:'🔢', tag:'STRUCTURE', ref:'ex-push-count-wave-exhaustion',
        points:['Trends usually move in a limited number of pushes before a deeper pullback.','The 3rd push is often where the trend is most extended.','Late-trend entries deserve smaller size and tighter targets.'] }
    ],
    quiz:[
      { q:'An uptrend is defined by…', o:['Higher highs and higher lows','Lower highs and lower lows','Equal highs and equal lows','A green candle'], a:0, why:'Structure defines trend: HH + HL = uptrend.' },
      { q:'What confirms a Break of Structure (BOS)?', o:['A candle body closing beyond the last swing high/low','A wick touching the swing high','Price getting close to the high','An indicator crossover'], a:0, why:'Wicks beyond a high are often liquidity grabs. Only a body close counts as a break.' },
      { q:'In an uptrend, price makes a lower high and then closes below the last higher low. This is called…', o:['A Change of Character (CHoCH)','A Break of Structure in the trend direction','A golden cross','A doji'], a:0, why:'The first break against the trend is a CHoCH — a sign the trend may be reversing.' },
      { q:'After a bullish BOS, where is the best place to look for a buy?', o:['On the pullback that forms the next higher low','At the very top of the breakout candle','Anywhere — the trend is up','After a bearish CHoCH'], a:0, why:'Professionals buy the pullback (higher low), not the breakout high.' },
      { q:'What is a swing low?', o:['A low with higher lows on both sides of it','Any red candle','The lowest price of the year','A candle with a long upper wick'], a:0, why:'A swing low is a local bottom: the candles on either side have higher lows.' }
    ] },

  { id:'m2-3', icon:'📐', title:'Key Levels & Lines',
    desc:'Support and resistance, round numbers, previous day highs and lows, trendlines and supply & demand zones.',
    why:'Levels tell you WHERE to trade. Structure gives direction, levels give location — you need both.',
    lessons:[
      { id:'l2-3-1', icon:'🧱', tag:'LEVELS', ref:'ex-support-and-resistance',
        points:['Support = where buyers stepped in before. Resistance = where sellers did.','Broken resistance often becomes support (and vice versa).','Zones, not exact lines — give levels a few pips of room.'] },
      { id:'l2-3-2', icon:'🔵', tag:'LEVELS', ref:'ind-round',
        points:['00 and 50 levels attract big orders.','Use them as targets and reaction zones.','Never put your stop exactly on a round number.'] },
      { id:'l2-3-3', icon:'📅', tag:'LEVELS', ref:'ind-pdhl',
        points:['Yesterday\'s high and low are liquidity magnets.','A sweep and close back inside often reverses.','A strong close beyond them can start a trend day.'] },
      { id:'l2-3-4', icon:'📐', tag:'LINES', ref:'pat-ach',
        points:['A trendline needs at least 2 touches; the 3rd touch is the trade.','Channels give you both entries (lower line) and targets (upper line).','A clean break of the channel warns the trend is changing.'] },
      { id:'l2-3-5', icon:'🏗️', tag:'ZONES', ref:'smc-snd',
        points:['Demand = base before an explosive rally. Supply = base before an explosive drop.','The first return to a fresh zone is the strongest.','Every retest weakens a zone.'] }
    ],
    quiz:[
      { q:'A resistance level is broken with a strong close above it. What does that level often become?', o:['Support','Stronger resistance','Irrelevant','A round number'], a:0, why:'Role reversal: broken resistance often turns into support on the retest.' },
      { q:'Why should you avoid placing your stop loss exactly on a round number like 1.1000?', o:['Lots of orders sit there, so price often wicks through it','Round numbers are illegal for stops','Brokers reject those orders','Round numbers never get touched'], a:0, why:'Round numbers attract orders and stop hunts. Give your stop a buffer beyond them.' },
      { q:'Price wicks above yesterday\'s high, then closes back below it. This often signals…', o:['A liquidity sweep and possible reversal down','A guaranteed breakout','Nothing important','The start of the Asian session'], a:0, why:'A sweep of PDH that closes back inside is a classic reversal signal.' },
      { q:'How many touches does a trendline need to be considered valid?', o:['At least 2 (the 3rd touch is the tradeable one)','1','5','10'], a:0, why:'Two points draw the line; the third touch confirms and offers the trade.' },
      { q:'A demand zone is…', o:['A tight base of candles right before an explosive rally','Any green candle','The highest point of the chart','A moving average'], a:0, why:'Demand zones are bases where unfilled buy orders were left before a strong move up.' }
    ] }
  ] }
);
