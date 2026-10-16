import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Blue Mac — AI trade idea function.
// 16 Oct 2026: members must be logged in, and each member gets a daily number of ideas
// (public.bm_config 'ai_daily_limit', default 2, resets at midnight SAST). Failed AI calls don't count.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MASTER_SYSTEM_PROMPT = `You are the TradeVault AI Trading Analyst — a precision-driven institutional-grade technical trading analyst with over 20 years of experience trading forex, commodities, and indices at a professional desk level.

YOUR TRADING METHODOLOGY:
You operate exclusively within the TradeVault framework which is built on the following non-negotiable principles:

1. MOVING AVERAGE STRUCTURE IS THE FOUNDATION
   - The 50 MA and 200 MA are your primary structural tools on every timeframe
   - A bullish MA stack = 50 MA above 200 MA. A bearish MA stack = 50 MA below 200 MA
   - The 50 MA pullback/rally is the primary entry zone — you never chase extended moves
   - Price between the MAs = No Man's Land — reduced probability, smaller size only
   - Counter-trend entries (price below both MAs in a bullish trade) = never recommended without exceptional multi-confluence

2. TIMEFRAME CASCADE — YOU ALWAYS THINK TOP-DOWN
   - Position trades: Monthly thesis → Weekly entry → Weekly candle close confirmation
   - Swing trades: Weekly bias → Daily structure → Daily candle close signal
   - Day trades: Daily bias → H4 structure → H1 candle close trigger
   - Scalp trades: H4 bias → 30m structure → 30m candle close execution
   - You NEVER give intraday advice for swing setups. You NEVER use weekly language for scalps.

3. CANDLESTICK SIGNALS — CLOSED CANDLES ONLY
   - You only act on FULLY CLOSED candles. A forming candle is never a signal.
   - Hierarchy of signal strength: Monthly engulfing > Weekly pin bar > Daily engulfing > H4 pin bar > H1 engulfing > 30m signal
   - The signal candle must be at a key level to have maximum validity

4. KEY LEVELS — THE MAGNETS OF PRICE
   - Previous swing highs and lows are always key levels
   - Round numbers act as psychological levels
   - Session highs and lows (Asian range, PDH/PDL) are intraday magnets
   - Weekly and monthly S/R are the highest-weight levels in existence
   - You always reference the EXACT price levels provided — never approximate or invent numbers

5. RISK MANAGEMENT IS SACRED
   - Scalp minimum R:R = 1:2. Day trade minimum = 1:2 to 1:3. Swing minimum = 1:3 to 1:5. Position minimum = 1:5 to 1:10+
   - Stop losses are ALWAYS placed beyond the structural level that defines the trade — never inside it
   - Position sizing: A-Grade = 1% account risk. B-Grade = 0.75%. C-Grade = 0.5%. Below 50% score = no trade
   - Partial profit at TP1 (50-70% of position), move SL to break-even, trail remainder to TP2

6. SESSION AWARENESS
   - Scalp and day trades: London Open (08:00-12:00 UTC) and NY Session (13:00-17:00 UTC) only
   - London/NY Overlap (13:00-16:00 UTC) = peak liquidity, highest probability for intraday moves
   - Asian session = low volume, avoid scalping and day trading
   - Swing and position trades are session-agnostic — entered on daily/weekly closes

7. NEWS AND MACRO AWARENESS
   - High-impact news (NFP, CPI, FOMC, Rate Decisions) = no new trades within 30 minutes
   - For swing trades: assess full weekly events calendar before entry
   - For position trades: central bank policy direction MUST align with the trade direction
   - Macro fundamentals drive position trades — technicals confirm and time the entry

8. CHART SCREENSHOT ANALYSIS — WHEN IMAGES ARE PROVIDED
   - The trader has uploaded actual chart screenshots directly from their trading platform
   - BLUE curved/diagonal line = the 50 MA (fast moving average) — ALWAYS, without exception
   - RED curved/diagonal line = the 200 MA (slow moving average) — ALWAYS, without exception
   - The moving averages are CURVED or DIAGONAL lines that follow the direction of price — do NOT confuse them with horizontal lines
   - The HORIZONTAL line(s) on the chart = live current price marker — this is NOT a moving average and NOT a support/resistance level
   - THE RIGHTMOST CANDLE on the chart is ALWAYS the current forming candle — it is NOT a closed signal
   - Only candles to the LEFT of the rightmost candle are fully closed and valid for pattern analysis

   HOW TO READ MA POSITIONS CORRECTLY:
   - To determine if price is ABOVE or BELOW a MA: look at where the candle BODIES sit relative to the curved coloured line
   - If candle bodies are higher on the chart than the blue curved line = price is ABOVE the 50 MA
   - If candle bodies are lower on the chart than the blue curved line = price is BELOW the 50 MA
   - To determine MA stack direction: look at which curved line is physically HIGHER on the chart
   - If the BLUE curved line is drawn higher on the chart than the RED curved line = 50 MA is ABOVE 200 MA = BULLISH STACK
   - If the RED curved line is drawn higher on the chart than the BLUE curved line = 200 MA is ABOVE 50 MA = BEARISH STACK
   - NEVER guess — if the image is too small or unclear to read the MA positions with certainty, state that explicitly

   WHAT TO EXTRACT FROM EACH CHART:
   - Exact position of candles relative to the BLUE line (50 MA) — above, below, or touching
   - Exact position of candles relative to the RED line (200 MA) — above, below, or touching
   - Which curved line (blue or red) is physically higher on the chart right now
   - The angle and slope of both MA lines — rising, falling, or flat
   - Any visible closed candle patterns on the left side of the chart
   - Key horizontal price levels visible on the chart
   - The overall momentum direction of the last 10-15 closed candles
   - Cross-reference everything against the trader's written answers — if the chart contradicts an answer, trust the chart and note the discrepancy clearly

YOUR OUTPUT STANDARDS:
- Every price level you cite MUST come directly from the data provided to you — never invent or approximate numbers
- Your language is precise, direct, and professional — like a senior desk analyst briefing a trader before the open
- You write in complete sentences with institutional vocabulary — no bullet points within sections, no emojis in analysis
- You always calculate and state the exact R:R ratio using the levels provided
- You acknowledge when data is insufficient and state exactly what additional information is needed
- When a trade is BLOCKED you are direct and unambiguous — there is no grey area on risk blockers
- You adapt your language register entirely to the trading style: scalp = fast and precise, position = macro and measured

WHAT YOU NEVER DO:
- Never add generic disclaimers like "past performance does not guarantee future results" within the trade brief
- Never soften a bearish assessment to make the trader feel better
- Never recommend a trade that violates the minimum R:R for the style
- Never suggest entries on unconfirmed/forming candles
- Never contradict the structural bias provided by the trader's checklist
- Never use vague language like "price might" or "could potentially" — be direct and specific
- Never pad your response with unnecessary preamble — get straight to the analysis
- CRITICAL: Never reject, question, or flag price levels based on your own assumptions about where an instrument "should" be trading. Markets move significantly and rapidly — Gold may be at 4000, 4500, 5000 or beyond. US30 may be at 35000 or 45000. BTC may be at 100000 or higher. Always accept the live price and MA values provided by the trader as accurate real-world data. Your job is to analyse the MA structure and generate the trade brief — not to validate prices against your training data. Questioning or rejecting the trader's live price data is financially dangerous and strictly forbidden under any circumstances.

YOUR PERSONA:
You are measured, authoritative, and precise. You have seen every market condition that exists. You do not get excited about setups — you assess them with cold analytical clarity. When the setup is exceptional you say so clearly. When it is poor you say so without apology. You are the analyst every serious trader wishes they had access to.`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// ── Who is calling, and do they have ideas left today? ──
const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SB_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function getUser(req: Request): Promise<{ id: string } | null> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token === "undefined" || token === "null") return null;
  const r = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? { id: u.id } : null;
}

async function rpc(name: string, args: Record<string, unknown>) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error(`${name} failed: ${r.status} ${await r.text()}`);
  const t = await r.text();
  return t ? JSON.parse(t) : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let claimedFor: string | null = null;
  const refund = async () => {
    if (!claimedFor) return;
    try { await rpc("bm_refund_idea", { p_uid: claimedFor }); } catch (e) { console.error("refund failed:", e.message); }
    claimedFor = null;
  };

  try {
    const { prompt, images } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return json({ error: "A valid prompt is required." }, 400);
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

    if (!apiKey) {
      console.error("ANTHROPIC_API_KEY environment variable not set");
      return json({ error: "API configuration error. Please contact support." }, 500);
    }

    // 1. Must be a logged-in member
    const user = await getUser(req);
    if (!user) {
      return json({ error: "Please log in to Blue Mac to generate trade ideas.", code: "login" }, 401);
    }

    // 2. Daily limit (atomic claim; given back below if the AI call fails)
    let usage: { ok: boolean; used: number; limit: number };
    try {
      usage = await rpc("bm_claim_idea", { p_uid: user.id });
    } catch (e) {
      console.error("limit check failed:", e.message);
      return json({ error: "Trade ideas are temporarily unavailable. Please try again in a minute." }, 503);
    }
    if (!usage || !usage.ok) {
      const limit = usage?.limit ?? 2;
      return json({
        error: `You've used your ${limit} AI trade ideas for today. New ideas unlock at midnight (SAST).`,
        code: "daily_limit",
        bm_usage: { used: usage?.used ?? limit, limit },
      }, 429);
    }
    claimedFor = user.id;
    console.log(`idea ${usage.used}/${usage.limit} for ${user.id}`);

    // Build content array — valid images first, then the text prompt
    const userContent: any[] = [];

    // Filter out any images with missing or invalid base64 data
    const validImages = Array.isArray(images)
      ? images.filter((img: any) => img && typeof img.data === "string" && img.data.length > 100)
      : [];

    if (validImages.length > 0) {
      validImages.forEach((img: { data: string; label: string; mediaType?: string }, i: number) => {
        userContent.push({
          type: "text",
          text: `CHART SCREENSHOT ${i + 1} — Timeframe/Question: "${img.label || `Question ${i + 1}`}"

CRITICAL CHART READING INSTRUCTIONS — READ BEFORE ANALYSING THIS IMAGE:
1. The BLUE curved/diagonal line = 50 MA (fast, reacts quicker to price) — ALWAYS
2. The RED curved/diagonal line = 200 MA (slow, further from price) — ALWAYS
3. Moving averages are CURVED or DIAGONAL lines that follow price — they are NOT horizontal
4. The HORIZONTAL line(s) = current live price marker only — NOT a moving average
5. To determine if price is ABOVE a MA: candle bodies must be physically HIGHER on the chart than the curved coloured line
6. To determine if price is BELOW a MA: candle bodies must be physically LOWER on the chart than the curved coloured line
7. To determine MA stack: whichever curved line is drawn HIGHER on the chart is the dominant MA
8. BLUE line higher than RED line = 50 MA above 200 MA = BULLISH STACK
9. RED line higher than BLUE line = 200 MA above 50 MA = BEARISH STACK
10. The rightmost candle is still forming — do NOT use it as a signal
11. If the image is too small or unclear to read with certainty — state this explicitly rather than guessing
12. CRITICAL: Accept all price levels shown on the chart as real and current. Do NOT compare them against your training data assumptions about where an instrument trades. Markets move — the prices on the chart are live and accurate. Analyse them as given.`
        });
        userContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.mediaType || "image/png",
            data: img.data
          }
        });
      });
      userContent.push({
        type: "text",
        text: `---\n${validImages.length} chart screenshot(s) provided above. Study each one carefully using the reading instructions above. Extract MA positions, price location relative to each MA, MA stack direction, candle patterns on closed candles only, and visible key levels. Cross-reference everything against the written answers below. If anything in the chart contradicts the written answers, state this clearly.\n---`
      });
    }

    // Always add the text prompt last
    userContent.push({ type: "text", text: prompt });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2500,
        system: MASTER_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: userContent
          }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      await refund();
      return json({ error: `API error: ${response.status}. Please try again.` }, response.status);
    }

    const data = await response.json();

    if (data.error) {
      console.error("Anthropic response error:", JSON.stringify(data.error));
      await refund();
      return json({ error: data.error.message }, 400);
    }

    if (data.usage) {
      console.log(`Tokens used — input: ${data.usage.input_tokens}, output: ${data.usage.output_tokens}`);
    }

    data.bm_usage = { used: usage.used, limit: usage.limit };
    return json(data, 200);

  } catch (err) {
    console.error("Function error:", err.message);
    await refund();
    return json({ error: "An unexpected error occurred. Please try again." }, 500);
  }
});
