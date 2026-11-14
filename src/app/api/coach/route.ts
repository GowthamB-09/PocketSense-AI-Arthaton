import { NextResponse } from "next/server";
import { geminiModel, isGeminiConfigured } from "@/lib/ai/gemini";
import { generateHeuristicSeniorAdvice } from "@/lib/ai/heuristics";
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

    // Extract amount and merchant from prompt if possible
    let extractedAmount = 0;
    const amountMatch = prompt.match(/(?:(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?))|(?:\b(\d{2,5})\s*(?:rs|rupees|bucks|inr)?\b)/i);
    if (amountMatch) {
      const raw = (amountMatch[1] || amountMatch[2]).replace(/,/g, "");
      extractedAmount = parseFloat(raw);
    }

    let merchant = "This purchase";
    if (/swiggy/i.test(prompt)) merchant = "Swiggy";
    else if (/zomato/i.test(prompt)) merchant = "Zomato";
    else if (/dinner|food/i.test(prompt)) merchant = "Dinner with friends";
    else if (/sneakers|shoes/i.test(prompt)) merchant = "New Sneakers";
    else if (/keyboard/i.test(prompt)) merchant = "Mechanical Keyboard";
    else if (/chai|tea/i.test(prompt)) merchant = "Chai Tapri";
    else if (/drinks|beer|party/i.test(prompt)) merchant = "Weekend Party Split";
    else if (/uber|cab|auto/i.test(prompt)) merchant = "Cab ride";

    const profile: FinancialMemoryProfile = memoryProfile || SYNTHETIC_DEMO_PROFILE;
    if (!profile.goals || profile.goals.length === 0) {
      profile.goals = SYNTHETIC_DEMO_PROFILE.goals;
    }
    const safeAmount = dailySafe || 165;
    const remainingDays = daysLeft || 16;

    // Get precomputed response for Demo Mode or fallback
    const precomputedVerdict = getPrecomputedCoachResponse(prompt, profile, safeAmount, remainingDays);
    if (extractedAmount === 0 && precomputedVerdict.opportunityCostGoal) {
      extractedAmount = precomputedVerdict.dailySafeReduction > 0 ? precomputedVerdict.dailySafeReduction * remainingDays : 250;
    }

    // If Demo Mode is NOT forced and Gemini is configured, attempt live streaming
    if (!demoMode && isGeminiConfigured) {
      try {
        const primaryGoal = profile?.goals?.[0] || { title: "Goa Trip", targetAmount: 8000, currentAmount: 3200 };
        const systemPrompt = `You are "Senior Bhai/Didi", a witty, street-smart, caring final-year Indian college senior acting as the AI Behavioral Money Coach for "PocketSense AI".
You are intercepting an impulse UPI spend before the student scans the QR code.

Student Context & Financial Memory:
- Name: ${profile?.studentName || "Aarav"} (${profile?.collegeYear || "2nd Year B.Tech"})
- Remaining Allowance: ₹${Math.round(safeAmount * remainingDays)} for ${remainingDays} days left in the month.
- Current Safe-to-Spend limit: ₹${safeAmount} / day.
- Crucial Target Goal Jar: ${primaryGoal.title} (Target: ₹${primaryGoal.targetAmount}, Saved: ₹${primaryGoal.currentAmount}).
- Recurring Student Traps: Late-night Swiggy/Zomato, ₹40 chai tapri micropayments, Friday peer splits.

Instructions for your response:
1. Speak in authentic, witty, supportive Indian college senior tone ("Bhai sun...", "Listen junior...", "Real talk:"). Natural mix of English and familiar college terms (tapri, mess food, roomie, FOMO, thali, semester).
2. Clearly give your VERDICT: [APPROVED / CAUTION / DENIED].
3. Calculate the brutal trade-off: Show how many days of their daily safe budget (₹${safeAmount}/day) this single purchase burns, or how many days it sets back their "${primaryGoal.title}".
4. Offer a practical "Senior Bhai Hack" (e.g., eat before going out, negotiate share, wait 20 minutes, or buy the cheaper alternative).
5. If the verdict is CAUTION or DENIED, encourage them to click the "Skip & Save" button to divert this money straight into their "${primaryGoal.title}" Goal Jar!
Keep response under 160 words—punchy, memorable, and empathetic.`;

        const result = streamText({
          model: geminiModel,
          system: systemPrompt,
          prompt: `The student asks: "${prompt}". Extracted amount: ₹${extractedAmount}, Merchant/Item: ${merchant}. Intercept this spend!`,
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
        console.warn("Gemini stream failed or rate-limited; switching to Demo Mode pre-computed response:", geminiError);
      }
    }

    // Demo Mode & Fallback Engine:
    // If client requested JSON
    if (!stream) {
      return NextResponse.json({
        success: true,
        source: demoMode ? "demo-precomputed-engine" : "fallback-engine",
        verdict: precomputedVerdict,
        extractedAmount: precomputedVerdict.budgetImpactDays ? Math.round(precomputedVerdict.budgetImpactDays * safeAmount) : extractedAmount,
        merchant,
      });
    }

    // Fast simulated streaming of pre-computed text
    const textToStream = `${precomputedVerdict.headline}\n\n${precomputedVerdict.seniorBhaiResponse}\n\n💡 Senior Bhai Hack:\n${precomputedVerdict.smartSeniorHacks.map((h) => `• ${h}`).join("\n")}`;

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        const words = textToStream.split(" ");
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
          // Micro delay to simulate smooth natural streaming
          await new Promise((r) => setTimeout(r, 14));
        }
        controller.close();
      },
    });

    const finalAmount = precomputedVerdict.budgetImpactDays
      ? Math.round(precomputedVerdict.budgetImpactDays * safeAmount)
      : extractedAmount || 250;

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
