// ══════════════════════════════════════════════════════
// BLUE MAC UNIVERSITY — EXTRA QUIZ QUESTIONS            17 Oct 2026
// Brings every module quiz to 10 questions (101 new — Module 2.3 had 4). Each one is built
// from that module's own lessons and key takeaways. Loaded after curriculum-*.js
// and before university.js; it only APPENDS to window.BMU_LEVELS[*].modules[*].quiz,
// so module ids, lessons and everyone's saved progress stay exactly the same.
// Format: { q, o:[4 options], a:index of the right one, why }
// ══════════════════════════════════════════════════════
(function(){
  const X = {
    'm1-1': [
      { q:'EURUSD rises from 1.0800 to 1.0900. What happened?', o:['The euro strengthened against the dollar', 'The dollar strengthened against the euro', 'Both currencies weakened', 'Nothing — only the spread changed'], a:0, why:'Price going up means the base (first) currency is getting stronger.' },
      { q:'You expect GBPUSD to fall. What do you do?', o:['Buy (go long)', 'Sell (go short)', 'Nothing — you can only profit when price rises', 'Buy GBP and wait'], a:1, why:'Forex lets you profit in both directions: selling (going short) profits when price falls.' },
      { q:'Why are the major pairs usually the cheapest to trade?', o:['They move the least', 'They have the most volume, so spreads are tightest', 'Brokers do not charge on them', 'They are only open during London'], a:1, why:'Majors (USD with another major) have the highest volume and the lowest trading costs.' },
      { q:'USDZAR is an example of…', o:['A major pair', 'A cross pair', 'An exotic pair', 'A commodity'], a:2, why:'Exotics pair a major currency with an emerging-market one like the rand — wider spreads and jumpier moves.' },
      { q:'Which sessions bring most of the volume and clean moves?', o:['Asia and Sydney', 'London and New York', 'Only the weekend', 'All hours are the same'], a:1, why:'London and New York bring the volume. Asia is usually slow and choppy for short-term trading.' }
    ],
    'm1-2': [
      { q:'GBPUSD moves from 1.2650 to 1.2610. How many pips is that?', o:['4 pips', '40 pips', '400 pips', '0.4 pips'], a:1, why:'1 pip = 0.0001. 1.2650 − 1.2610 = 0.0040 = 40 pips.' },
      { q:'One standard lot (1.00) equals…', o:['1,000 units', '10,000 units', '100,000 units', '1,000,000 units'], a:2, why:'Standard 1.00 = 100k units · mini 0.10 = 10k · micro 0.01 = 1k.' },
      { q:'Roughly what is 1 pip worth on 0.01 lots of EURUSD?', o:['$10', '$1', '$0.10', '$0.01'], a:2, why:'1.00 lot ≈ $10 per pip, so 0.01 lots ≈ $0.10 per pip.' },
      { q:'Your stop loss is 30 pips on 0.10 lots of EURUSD. Roughly how much do you risk?', o:['$3', '$30', '$300', '$3,000'], a:1, why:'Risk = stop in pips × pip value: 30 pips × about $1 per pip on 0.10 lots = about $30.' },
      { q:'What is swap?', o:['The broker\'s fee for opening an account', 'A fee paid (or received) for holding a trade overnight', 'The difference between bid and ask', 'Switching from long to short'], a:1, why:'Swap is charged or paid for holding a position overnight. The spread is ask − bid.' }
    ],
    'm1-3': [
      { q:'Price is at 1.0900. You want to SELL only if price rallies to resistance at 1.0950. Which order?', o:['Sell limit at 1.0950', 'Sell stop at 1.0950', 'Buy limit at 1.0950', 'Market sell now'], a:0, why:'A sell limit sits ABOVE price — you sell at a better (higher) price.' },
      { q:'Price is at 1.0900. You want to SELL only if price breaks BELOW support at 1.0850. Which order?', o:['Sell limit at 1.0850', 'Sell stop at 1.0850', 'Buy stop at 1.0850', 'Buy limit at 1.0850'], a:1, why:'A sell stop sits below price and triggers on the breakdown.' },
      { q:'A "broker" promises guaranteed 20% returns every month. What is it?', o:['A great opportunity', 'A scam — walk away', 'Normal for forex', 'Safe if they are on Instagram'], a:1, why:'Guaranteed returns = scam. Always. Check for a verifiable FSCA FSP number.' },
      { q:'Your trade is moving towards your stop loss. What do you do?', o:['Move the stop further away to give it room', 'Leave the stop where it is', 'Remove the stop', 'Add more lots to average down'], a:1, why:'Never widen a stop once the trade is live. The stop marks where your idea is wrong.' },
      { q:'Before trading live on a new platform, you should…', o:['Deposit as much as possible', 'Practise on a demo account first', 'Copy a signal group', 'Trade the news to learn fast'], a:1, why:'Demo first — learn to set SL/TP and close trades without paying for mistakes.' }
    ],
    'm2-1': [
      { q:'Which part of a candle shows where price was rejected?', o:['The body', 'The wicks', 'The colour', 'The volume'], a:1, why:'The body shows who won; the wicks show where price was pushed back.' },
      { q:'What is the higher timeframe mainly used for?', o:['Exact entry timing', 'Direction and the bigger picture', 'Measuring the spread', 'Nothing — only the 1-minute matters'], a:1, why:'Higher timeframe = direction. Lower timeframe = timing.' },
      { q:'A morning star is…', o:['A one-candle bearish signal', 'A three-candle bullish reversal pattern', 'A gap at the market open', 'A type of indicator'], a:1, why:'Morning star = three-candle bullish reversal; the third candle must close strongly to confirm.' },
      { q:'A perfect bullish engulfing appears in the middle of nowhere — no level, no trend. It means…', o:['A guaranteed reversal', 'Very little — signals matter at key levels', 'Sell immediately', 'Double your lot size'], a:1, why:'Candlestick signals matter most at support/resistance or in the trend direction.' },
      { q:'How many 15-minute candles make one 1-hour candle?', o:['2', '4', '15', '60'], a:1, why:'60 minutes ÷ 15 = 4 candles.' }
    ],
    'm2-2': [
      { q:'A downtrend is defined by…', o:['Higher highs and higher lows', 'Lower highs and lower lows', 'Equal highs', 'A rising 50 MA'], a:1, why:'Downtrend = lower highs + lower lows.' },
      { q:'A wick pokes above the last swing high, but the candle body closes back below. Is that a BOS?', o:['Yes — any break counts', 'No — a BOS needs a body close beyond the swing', 'Only on the 1-minute chart', 'Yes, if the wick is long'], a:1, why:'A BOS needs a candle BODY close beyond the last swing. A wick-only poke is often a liquidity sweep.' },
      { q:'After a bearish CHoCH in an uptrend, you should…', o:['Keep buying every dip', 'Stop trading the old (bullish) direction', 'Double your buy size', 'Ignore it — CHoCH never matters'], a:1, why:'CHoCH = the first break against the trend. After it, stop trading the old direction.' },
      { q:'A trend is on its 3rd big push. What does that suggest?', o:['The trend is just starting', 'It may be extended — smaller size, tighter targets', 'Always enter with maximum size', 'Push counts mean nothing'], a:1, why:'Late-trend entries deserve smaller size and tighter targets.' },
      { q:'Highs and lows show no clear sequence. The market is…', o:['In a strong uptrend', 'In a range — trade the edges or stay out', 'In a strong downtrend', 'Closed'], a:1, why:'No clear sequence = range. Trade the edges or stay out.' }
    ],
    'm2-3': [
      { q:'Why treat support and resistance as zones, not exact lines?', o:['To use bigger lots', 'Price rarely respects one exact price — give it a few pips of room', 'Zones are only for indices', 'Lines never work'], a:1, why:'Zones, not lines — give levels a few pips of room.' },
      { q:'Price closes strongly ABOVE yesterday\'s high and holds. This can…', o:['Start a trend day', 'Mean nothing, ever', 'Only happen on Fridays', 'Close the market'], a:0, why:'A strong close beyond the previous day\'s high or low can start a trend day.' },
      { q:'A demand zone is…', o:['The base before an explosive rally', 'The top of a range', 'A round number', 'Where the spread is widest'], a:0, why:'Demand = the base before an explosive rally. Supply = the base before an explosive drop.' },
      { q:'Each time price retests the same supply or demand zone, the zone usually…', o:['Gets stronger', 'Gets weaker', 'Stays exactly the same', 'Disappears forever'], a:1, why:'The first return to a fresh zone is the strongest. Every retest weakens it.' },
      { q:'In a rising channel, where do you usually look for entries and targets?', o:['Entries at the upper line, targets at the lower line', 'Entries near the lower line, targets near the upper line', 'Only in the middle', 'Channels give no trades'], a:1, why:'Channels give entries at the lower line and targets at the upper line (in a rising channel).' },
      { q:'Which round-number levels attract the most orders?', o:['Levels ending in 00 and 50', 'Levels ending in 13 and 77', 'Only the daily open', 'Round numbers never matter'], a:0, why:'00 and 50 levels attract big orders — use them as targets and reaction zones.' }
    ],
    'm3-1': [
      { q:'The 50 MA is BELOW the 200 MA and price is below both. What is the bias?', o:['Bullish — look for buys', 'Bearish — look for sells', 'No bias ever', 'Only for crypto'], a:1, why:'50 below 200 = bearish stack. The stack gives direction, not entries.' },
      { q:'The 50 and 200 MA are spreading further apart. This shows…', o:['Momentum', 'A range', 'Low volatility', 'A broken chart'], a:0, why:'Spreading MAs = momentum. Tangled MAs = chop.' },
      { q:'The gap between the 50 and 200 MA keeps shrinking. This warns that…', o:['The trend is speeding up', 'The trend may be weakening', 'A gap will open at the market open', 'Spreads will fall'], a:1, why:'A compressing gap warns the trend is weakening.' },
      { q:'Price pulls back to the 50 MA in an uptrend. What do you wait for before buying?', o:['Nothing — buy the touch', 'A rejection (bullish) candle to confirm', 'The 200 MA to cross the 50', 'A red news event'], a:1, why:'The 50 MA pullback is the Entry Zone — confirm with a rejection candle first.' },
      { q:'The 9 EMA crosses the 21 EMA AGAINST the higher-timeframe trend. What do you do?', o:['Trade it with double size', 'Ignore it', 'Close all trades', 'Reverse every trade'], a:1, why:'Ignore EMA crosses that go against the higher-timeframe trend.' }
    ],
    'm3-2': [
      { q:'In a DOWNtrend, how do you draw the Fibonacci retracement?', o:['From the swing low to the swing high', 'From the swing high to the swing low', 'From any two candles', 'Only on the weekly chart'], a:1, why:'Uptrend: low → high. Downtrend: high → low.' },
      { q:'Which swing should you draw the Fib on?', o:['The smallest one', 'The swing that broke structure', 'Any swing from last year', 'The one that fits your bias'], a:1, why:'Use the swing that broke structure.' },
      { q:'You buy at the 61.8% in an uptrend. Where does the stop go?', o:['At the 50% level', 'Below the 78.6% level or the swing low', 'Above the swing high', 'No stop needed at 61.8%'], a:1, why:'SL below 78.6% or the swing low — where the pullback idea is wrong.' },
      { q:'TP1 is hit on your Fib trade. What is a common next step?', o:['Close everything at a loss', 'Move the stop to break-even and let a runner aim for 161.8%', 'Widen the stop', 'Add a new position at market'], a:1, why:'Move SL to break-even at TP1 and let a runner aim for the 161.8% extension.' },
      { q:'The 61.8% lines up with a flipped support/resistance level. That means…', o:['A certain win', 'Two reasons in one place — higher probability, not certainty', 'The Fib is wrong', 'Avoid the trade'], a:1, why:'Confluence raises probability — it never gives certainty.' }
    ],
    'm3-3': [
      { q:'RSI overbought/oversold signals work best…', o:['In strong trends', 'In ranges', 'On news releases', 'Only on the monthly chart'], a:1, why:'Use overbought/oversold in ranges — trends can stay overbought for weeks.' },
      { q:'Price makes a HIGHER high while RSI makes a LOWER high. This is…', o:['Bullish divergence', 'Bearish divergence', 'A golden cross', 'Nothing'], a:1, why:'Bearish divergence: price higher high, RSI lower high — momentum fading.' },
      { q:'The MACD histogram keeps shrinking. This warns that…', o:['Momentum is fading', 'Volume is rising', 'A gap is coming', 'The trend is speeding up'], a:0, why:'A shrinking histogram warns momentum is fading.' },
      { q:'In a Bollinger squeeze, how do you pick the direction?', o:['Guess before the breakout', 'Trade the close outside the band', 'Always buy', 'Always sell'], a:1, why:'Don\'t guess direction — trade the close outside the band.' },
      { q:'ATR doubles. What happens to your lot size (same % risk)?', o:['It doubles', 'It gets smaller — the stop is wider', 'It stays the same', 'You stop trading'], a:1, why:'High ATR = wider stop = smaller lot size, so the money at risk stays the same.' }
    ],
    'm3-4': [
      { q:'When is a Double Bottom confirmed?', o:['When the second low forms', 'On a close above the neckline', 'When RSI hits 30', 'Immediately at the first low'], a:1, why:'Confirmed on a close above the neckline.' },
      { q:'How do you set the target of a bull flag?', o:['The flag height', 'The pole height projected from the breakout', 'The nearest round number only', 'There is no target'], a:1, why:'Target = pole height projected from the breakout.' },
      { q:'What is the target of a Head & Shoulders?', o:['Head-to-neckline height projected down from the neckline break', 'The left shoulder\'s high', 'Double the head height', 'The 200 MA'], a:0, why:'Target = head-to-neckline height projected down.' },
      { q:'In a Double Top, the second top pokes just above the first. That is often…', o:['A liquidity grab (sweep)', 'Proof the pattern failed', 'A buy signal', 'A spread spike'], a:0, why:'The second top often sweeps the first — a liquidity grab before the drop.' },
      { q:'In an uptrend, an ascending triangle usually breaks…', o:['Down', 'Up', 'Sideways forever', 'Never'], a:1, why:'Flat resistance + rising lows = buyers getting more aggressive — usually breaks up in an uptrend.' }
    ],
    'm4-1': [
      { q:'You lose 20% of your account. What gain do you need to get back to break-even?', o:['+20%', '+25%', '+40%', '+100%'], a:1, why:'From 80 back to 100 is +20 on 80 = +25%. Losses need bigger gains to recover.' },
      { q:'You lose 10 trades in a row at 1% risk each. Roughly where is your account?', o:['−1%', 'About −9.6%', '−50%', '−100%'], a:1, why:'Small fixed risk survives streaks: 10 losses at 1% ≈ −9.6%. At 10% risk it would be about −65%.' },
      { q:'Your stop has to be wider than usual. To keep the same money at risk you…', o:['Use bigger lots', 'Use smaller lots', 'Remove the stop', 'Skip the stop calculation'], a:1, why:'Wide stop → smaller lots. Tight stop → bigger lots. Same money at risk.' },
      { q:'Your lot-size calculation gives 0.237 lots. What do you trade?', o:['0.24', '0.23', '0.30', '1.00'], a:1, why:'Always round lot size DOWN so you never risk more than planned.' },
      { q:'What is Blue Mac\'s minimum risk-reward for TP1?', o:['1:1', '1:2', '1:5', 'There is no minimum'], a:1, why:'Blue Mac rule: TP1 at least 1:2 and TP2 at least 1:3 (Swing and Position ask for more).' }
    ],
    'm4-2': [
      { q:'After taking partials at TP1 and moving the stop to break-even, the trade…', o:['Can still become a big loser', 'Can no longer become a big loser', 'Must be closed', 'Needs a wider stop'], a:1, why:'After TP1 + break-even the trade cannot become a big loser.' },
      { q:'You should never move a stop…', o:['In the direction of your profit', 'Backwards (further from price)', 'To break-even', 'Behind a new higher low'], a:1, why:'Trail forward only. Never move a stop backwards.' },
      { q:'Which timeframe should you trail your stop on?', o:['The monthly chart', 'The timeframe you entered on', 'The 1-minute chart, always', 'Any timeframe that looks good'], a:1, why:'Trail on the timeframe you entered on.' },
      { q:'You are long EURUSD and the dollar index (DXY) is rallying hard. This is…', o:['Good for your trade', 'Working against your trade', 'Unrelated to EURUSD', 'Only important for gold'], a:1, why:'DXY up usually means EURUSD, GBPUSD and gold down.' },
      { q:'When should you check the economic calendar?', o:['Once a month', 'Every morning before trading', 'Only after a loss', 'Never — charts are enough'], a:1, why:'Check the calendar every morning, and protect open trades before big releases.' }
    ],
    'm5-1': [
      { q:'In top-down analysis, what does the LOWER timeframe give you?', o:['The bias', 'The entry timing', 'The trend direction', 'The weekly target'], a:1, why:'Higher TF = bias, middle TF = zone, lower TF = entry.' },
      { q:'Which timeframes does the Blue Mac Day style use?', o:['W1 / D1', 'H1 / H4', '1m / 5m', 'MN / W1'], a:1, why:'Scalp 15m/30m · Day H1/H4 · Swing D1/H4 · Position W1/D1.' },
      { q:'The 5-minute chart gives a buy signal, but the daily is in a downtrend. What do you do?', o:['Buy with double size', 'Skip it', 'Buy and remove the stop', 'Sell and buy at the same time'], a:1, why:'Never take a lower-timeframe signal against the higher-timeframe trend.' },
      { q:'You are new to trading. How many styles should you trade at first?', o:['All five', 'One — master it before adding another', 'Three', 'Whatever the group chat trades'], a:1, why:'Master one style before adding another.' },
      { q:'Price reaches the 61.8% Fib exactly at the 50 MA in an uptrend. What do you wait for?', o:['Nothing — enter immediately', 'A bullish close at the confluence', 'A break below the swing low', 'Red news'], a:1, why:'Wait for the bullish close at the confluence before entering.' }
    ],
    'm5-2': [
      { q:'A good trading plan is written in…', o:['Feelings and hopes', 'Specific rules — numbers, not feelings', 'One sentence', 'Code only'], a:1, why:'Specific beats vague — numbers, not feelings.' },
      { q:'What is the expectancy formula?', o:['Wins − losses', '(Win% × avg win) − (Loss% × avg loss)', 'Profit ÷ trades', 'Win% × 100'], a:1, why:'Expectancy = (W% × avg win) − (L% × avg loss).' },
      { q:'Win rate 50%, average win 1R, average loss 1R. What is the expectancy?', o:['+0.5R', '0R — and costs make it negative', '+1R', '−1R'], a:1, why:'(0.5 × 1) − (0.5 × 1) = 0R. After spreads and commission it is slightly negative.' },
      { q:'Your backtest looks good. What comes next?', o:['Go live with full size', 'Demo, then small live size', 'Stop journaling', 'Change the rules'], a:1, why:'Backtest → demo → small live size, then scale.' },
      { q:'Besides the result, what should every journal entry record?', o:['Only the profit in rand', 'Why you took it and how you felt', 'Nothing else', 'What other traders did'], a:1, why:'Record the why, the result and the emotion — measured in R.' }
    ],
    'm6-1': [
      { q:'Where does sell-side liquidity (SSL) sit?', o:['Above equal highs', 'Below equal lows (sell stops)', 'At the 200 MA', 'In the middle of the range'], a:1, why:'BSL = stops above equal highs. SSL = stops below equal lows.' },
      { q:'You buy after a sweep of the lows. Where does your stop go?', o:['Above the high', 'Beyond (below) the sweep wick', 'Exactly at the old low', 'No stop on sweeps'], a:1, why:'The SL goes beyond the sweep wick.' },
      { q:'What does the Asian range usually build?', o:['The day\'s trend', 'Liquidity on both sides', 'Nothing useful', 'The weekly high'], a:1, why:'The Asian range builds liquidity on both sides — London often fakes one way first.' },
      { q:'Price fakes below range support (a spring). Where is the entry?', o:['Sell the breakdown', 'Buy the close back inside the range', 'Wait for a new low', 'There is no entry'], a:1, why:'A spring is a sell-side liquidity grab — buy the close back inside the range.' },
      { q:'Which is a complete institutional sequence?', o:['Sweep → BOS → return to the order block', 'News → gap → close', 'RSI 70 → sell', 'Doji → buy'], a:0, why:'Sweep → BOS → return to the OB is the complete sequence.' }
    ],
    'm6-2': [
      { q:'What is the 50% level of a fair value gap called?', o:['The neckline', 'Consequent encroachment', 'The golden pocket', 'The pivot'], a:1, why:'Consequent encroachment = the 50% of the gap.' },
      { q:'Which order block is usually stronger?', o:['One with a slow, weak move away', 'One with a fast, impulsive move away', 'Any old one', 'One that has been retested many times'], a:1, why:'Faster impulse = stronger order block.' },
      { q:'A perfect bullish order block sits in the PREMIUM half of the range. What do you do?', o:['Buy with double size', 'Skip it', 'Sell it', 'Move it to discount'], a:1, why:'A great OB in the wrong half of the range = skip. Buy in discount, sell in premium.' },
      { q:'Trading a bullish OB with an FVG: where are the entry and the stop?', o:['Entry at the OB top, stop below the OB', 'Entry below the OB, stop above it', 'Entry at market, no stop', 'Entry at the FVG high, stop at break-even'], a:0, why:'Entry at the OB top, SL below the OB.' },
      { q:'When is a breaker block strongest?', o:['When the break also broke structure', 'When it forms on a Sunday', 'When RSI is 50', 'When there is no volume'], a:0, why:'A breaker is strongest when the break also broke structure.' }
    ],
    'm6-3': [
      { q:'Price is trading above VWAP. Who is in control?', o:['Sellers', 'Buyers', 'Nobody', 'The broker'], a:1, why:'Above VWAP = buyers in control; below = sellers.' },
      { q:'How often does VWAP reset?', o:['Never', 'Every session', 'Every month', 'Every year'], a:1, why:'VWAP resets every session.' },
      { q:'Roughly how much of the volume sits inside the value area?', o:['10%', 'About 70%', '100%', '50%'], a:1, why:'Value area = about 70% of the volume.' },
      { q:'On a volume profile, price reaches a low-volume area. It usually…', o:['Stops for days', 'Moves through it fast', 'Reverses every time', 'Gaps closed'], a:1, why:'Low-volume areas get crossed fast.' },
      { q:'Where is the entry in a Quasimodo (QM) pattern?', o:['At the first high', 'On the return to the QML level', 'Randomly', 'At the weekly open'], a:1, why:'The return to the QML is the entry.' }
    ],
    'm7-1': [
      { q:'What is a "bad win"?', o:['A small win', 'A winning trade that broke your rules', 'A win on Friday', 'A win under 1R'], a:1, why:'A good loss follows the plan; a bad win breaks it — and teaches bad habits.' },
      { q:'FOMO means…', o:['Chasing a move after it has already gone', 'Waiting for your setup', 'Cutting a loss early', 'Taking partials'], a:1, why:'FOMO = chasing. Revenge = escalating.' },
      { q:'When should you decide your stop rules (when to stop trading for the day)?', o:['In the middle of a losing streak', 'Before you need them — in your plan', 'After you blow the account', 'Never'], a:1, why:'Decide your stop rules before you need them. Walking away is a professional decision.' },
      { q:'You feel maximum confidence after a big winning run. That is often…', o:['The safest time to double size', 'The moment of maximum risk', 'A guarantee of more wins', 'Irrelevant'], a:1, why:'Maximum confidence is often maximum risk.' },
      { q:'How should you judge your trading?', o:['On today\'s single result', 'On the process over many trades', 'On what others made', 'On how you feel'], a:1, why:'Judge the process, not the single outcome — your edge only shows over many trades.' }
    ],
    'm7-2': [
      { q:'When should you read your trading rules?', o:['Once a year', 'Before every session', 'Only after a loss', 'Never — you know them'], a:1, why:'Read them before every session.' },
      { q:'What do you do after each session?', o:['Nothing', 'Journal it', 'Open more trades', 'Delete the losers'], a:1, why:'Prepare before the session, journal after it.' },
      { q:'In the weekly review, what should you find?', o:['Someone to blame', 'Your best setup and your biggest mistake', 'A new strategy every week', 'Only your profit'], a:1, why:'Find your best setup and your biggest mistake — then set ONE focus.' },
      { q:'How should good execution feel?', o:['Exciting and fast', 'Boring — the thinking was done earlier', 'Stressful', 'Random'], a:1, why:'Execution should be boring — the thinking was done in preparation.' },
      { q:'A professional\'s rule list should be…', o:['Hundreds of rules', 'A short list of non-negotiable rules', 'Different every day', 'In their head only'], a:1, why:'A short list of non-negotiable rules — read before every session.' }
    ],
    'm7-3': [
      { q:'What are the typical prop firm challenge rules?', o:['No rules at all', 'A profit target, a daily loss limit and a max drawdown', 'Only a profit target', 'Only a time limit'], a:1, why:'Typical rules: profit target, daily loss limit, max drawdown.' },
      { q:'What should you do before paying a prop firm fee?', o:['Pay quickly before the promo ends', 'Research the firm', 'Ask for guaranteed payouts', 'Nothing'], a:1, why:'Research the firm before paying any fee.' },
      { q:'You are on a winning streak. What do you do with your risk?', o:['Increase it — you are hot', 'Keep it the same fixed %', 'Go all in on the next trade', 'Stop using stops'], a:1, why:'Never increase risk because of a winning streak.' },
      { q:'For tax, what should a South African trader do?', o:['Nothing — trading is tax-free', 'Keep complete records and get advice from a registered tax practitioner', 'Only report losses', 'Hide profits offshore'], a:1, why:'Trading profits are taxable. Keep full records and use a registered tax practitioner.' },
      { q:'What does mastery in trading look like?', o:['A new strategy every month', 'The same good process, repeated for years', 'One huge winning trade', 'Never having a loss'], a:1, why:'Mastery = the same good process, repeated for years.' }
    ]
  };
  (window.BMU_LEVELS || []).forEach(L => L.modules.forEach(m => {
    const add = X[m.id]; if(!add) return;
    m.quiz = (m.quiz || []).concat(add.filter(q => !(m.quiz || []).some(o => o.q === q.q)));
  }));
  window.BMU_EXTRA_QUIZ = X;
})();
