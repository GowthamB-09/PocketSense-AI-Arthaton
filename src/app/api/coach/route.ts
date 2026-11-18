import { NextResponse } from "next/server";
import { geminiModel, isGeminiConfigured } from "@/lib/ai/gemini";
import { generateHeuristicCoachAdvice } from "@/lib/ai/heuristics";
import { getPrecomputedCoachResponse } from "@/lib/demo/precomputedCoachResponses";
import { SYNTHETIC_DEMO_PROFILE } from "@/lib/demo/syntheticStudentData";
import { FinancialMemoryProfile } from "@/types";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, memoryProfile, dailySafe, daysLeft, stream = true, demoMode = false } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Extract amount and merchant
    let extractedAmount = 0;
    const amountMatch = prompt.match(/(?:(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?))|(?:\b(\d{2,6})\s*(?:rs|rupees|bucks|inr)?\b)/i);
    if (amountMatch) {
      const raw = (amountMatch[1] || amountMatch[2]).replace(/,/g, "");
      extractedAmount = parseFloat(raw);
    }

    let merchant = "This purchase";
    if (/dinner|drinks|brewery|beer|pub|bar/i.test(prompt)) merchant = "Weekend Dinner & Drinks";
    else if (/coffee|tokai|starbucks/i.test(prompt)) merchant = "Specialty Coffee";
    else if (/iphone|apple|phone|headphones|watch|gadget|macbook/i.test(prompt)) merchant = "Flagship Tech / iPhone";
    else if (/zara|h&m|shirt|jacket/i.test(prompt)) merchant = "Apparel & Shopping";
    else if (/staycation|resort|hotel/i.test(prompt)) merchant = "Weekend Staycation";
    else if (/zepto|blinkit|swiggy|zomato/i.test(prompt)) merchant = "Quick Food & Commerce";

    const profile: FinancialMemoryProfile = memoryProfile || SYNTHETIC_DEMO_PROFILE;
    if (!profile.goals || profile.goals.length === 0) {
      profile.goals = SYNTHETIC_DEMO_PROFILE.goals;
    }
    const safeAmount = dailySafe || 550;
    const remainingDays = daysLeft || 16;

    const precomputedVerdict = getPrecomputedCoachResponse(prompt, profile, safeAmount, remainingDays);
    if (extractedAmount === 0 && precomputedVerdict.opportunityCostGoal) {
      extractedAmount = precomputedVerdict.dailySafeReduction > 0 ? precomputedVerdict.dailySafeReduction * remainingDays : 1500;
    }

    // If Gemini is configured and Demo Mode is disabled
    if (!demoMode && isGeminiConfigured) {
      try {
        const primaryGoal = profile?.goals?.[0] || { title: "Japan Spring Trip", targetAmount: 150000, currentAmount: 68000 };
        const systemPrompt = `You are an elite, sharp, empathetic Behavioral Money Coach for PocketSense AI, assisting a young working professional (age 24–30).
You are intercepting an impulse purchase before they swipe their card or scan a QR code.

User Financial Context:
- Professional: ${profile?.userName || "Rohan"} (${profile?.role || "Product Designer, 26"})
- Remaining Discretionary Runway: ₹${Math.round(safeAmount * remainingDays)} across ${remainingDays} days.
- Daily Safe-to-Spend limit: ₹${safeAmount} / day.
- Crucial Target Wealth Jar: ${primaryGoal.title} (Target: ₹${primaryGoal.targetAmount}, Saved: ₹${primaryGoal.currentAmount}).
- Common Patterns: Craft beer & weekend dining tabs, daily specialty coffee, quick-commerce carts.

Response Guidelines:
1. Deliver a crisp, executive, actionable response (under 120 words).
2. Clearly state your VERDICT: [APPROVED / CAUTION / DENIED].
3. State the exact numeric trade-off: Show how many days of their daily safe headroom (₹${safeAmount}/day) this purchase burns, or how it delays their "${primaryGoal.title}".
4. Provide a direct financial hack (e.g., cap spend, enforce 48-hr cooling period, offset by home dining).
5. If CAUTION or DENIED, encourage clicking 'Skip & Save' to transfer this amount into their "${primaryGoal.title}" Goal Jar.`;

        const result = streamText({
          model: geminiModel,
          system: systemPrompt,
          prompt: `User query: "${prompt}". Extracted amount: ₹${extractedAmount}, Item/Merchant: ${merchant}. Intercept this spend!`,
        });

        return result.toDataStreamResponse({
          headers: {
            "x-pocketsense-verdict": precomputedVerdict.verdict,
            "x-pocketsense-amount": String(extractedAmount),
            "x-pocketsense-merchant": merchant,
            "x-pocketsense-source": "gemini-2.5-flash",
          },
        });
      } catch (geminiError) {
        console.warn("Gemini stream error, falling back to pre-computed response:", geminiError);
      }
    }

    // Demo Mode & Fallback
    if (!stream) {
      return NextResponse.json({
        success: true,
        source: demoMode ? "demo-precomputed-engine" : "fallback-engine",
        verdict: precomputedVerdict,
        extractedAmount: precomputedVerdict.budgetImpactDays ? Math.round(precomputedVerdict.budgetImpactDays * safeAmount) : extractedAmount,
        merchant,
      });
    }

    const textToStream = `${precomputedVerdict.headline}\n\n${precomputedVerdict.coachResponse}\n\n💡 Smart Action:\n${precomputedVerdict.smartHacks.map((h) => `• ${h}`).join("\n")}`;

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        const words = textToStream.split(" ");
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
          await new Promise((r) => setTimeout(r, 12));
        }
        controller.close();
      },
    });

    const finalAmount = precomputedVerdict.budgetImpactDays
      ? Math.round(precomputedVerdict.budgetImpactDays * safeAmount)
      : extractedAmount || 1500;

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "x-pocketsense-verdict": precomputedVerdict.verdict,
        "x-pocketsense-amount": String(finalAmount),
        "x-pocketsense-merchant": merchant,
        "x-pocketsense-source": demoMode ? "demo-precomputed" : "heuristic-engine",
      },
    });
  } catch (error: any) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { error: "Failed to process coaching prompt", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
