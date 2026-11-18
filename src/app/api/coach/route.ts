import { NextResponse } from "next/server";
import { geminiModel, isGeminiConfigured } from "@/lib/ai/gemini";
import { generateBeginnerCoachAdvice, translateFinanceJargon } from "@/lib/ai/coachResponses";
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
    const safePool = (profile.monthlySalary || 75000) - (profile.fixedEssentials || 31500);
    const remainingDays = daysLeft || 17;
    const safeAmount = dailySafe || Math.round(safePool / remainingDays);
    const primaryGoal = profile?.goals?.[0] || { title: "New iPhone", targetAmount: 80000, currentAmount: 42000 };

    // Get clean, zero-jargon beginner advice
    const coachAdvice = generateBeginnerCoachAdvice(prompt, {
      salary: profile.monthlySalary || 75000,
      safePool: safePool > 0 ? safePool : 30592,
      daysLeft: remainingDays,
      cardDues: 17908,
      primaryGoalTitle: primaryGoal.title,
      primaryGoalSaved: primaryGoal.currentAmount,
      primaryGoalTarget: primaryGoal.targetAmount,
    });

    // If Gemini is configured, streaming is requested, and Demo Mode is disabled
    if (stream && !demoMode && isGeminiConfigured) {
      try {
        const systemPrompt = `You are an elite, super-friendly AI Money Coach for PocketSense AI, texting a young working professional (age 24–30).
STRICT "FRIEND-TEXTING-YOU" RULES:
1. NO WALLS OF TEXT. Never output long paragraphs or textbook definitions.
2. EXACT 3-PART SCANNABLE FORMAT:
   - Line 1 (Bold): Start with a clear "Yes,", "No,", or "Wait—do this instead:" in simple everyday words.
   - 2-3 Bullet Points: MAX 12 WORDS EACH. Use simple analogies (FD = "safe bank lockbox", Index Fund = "basket of India's top 50 companies").
   - Concrete Next Step: Exactly 1 action with ₹ numbers using their PocketSense numbers:
     • Monthly salary: ₹${profile.monthlySalary || 75000}
     • Remaining safe pool: ₹${safePool > 0 ? safePool : 30592} (${remainingDays} days left)
     • Credit card dues: ₹17,908
     • Active Goal: ${primaryGoal.title} (₹${primaryGoal.currentAmount}/₹${primaryGoal.targetAmount})
3. COMPLETELY BAN ALL FINANCE JARGON (USE 1-TO-2 WORD SYNONYMS):
   - Never say "asset allocation" or "diversification" -> say "Money Mix"
   - Never say "inflation" -> say "Price Rise"
   - Never say "liquidity" -> say "Quick Cash"
   - Never say "volatility" -> say "Price Swings"
   - Never say "compounding" -> say "Growth"
   - Never say "discretionary" -> say "Extra Spend"
   - Never say "runway" -> say "Cash Left"
   - Never say "pacing" -> say "Spend Speed"
   - Never say "p.a." or "yield" -> say "/ yr"
   - Never say "principal" -> say "Base Cash"
   - Never say "corpus" -> say "Total Saved"
4. Add a final line: "💡 Explain Even Simpler: <1 simple sentence>"`;

        const result = streamText({
          model: geminiModel,
          system: systemPrompt,
          prompt: `User query: "${prompt}". Extracted amount: ₹${extractedAmount}, Item/Merchant: ${merchant}. Keep it super short, conversational, and jargon-free!`,
        });

        return result.toDataStreamResponse({
          headers: {
            "x-pocketsense-verdict": coachAdvice.directAnswer.startsWith("Yes") ? "APPROVED" : coachAdvice.directAnswer.startsWith("Wait") ? "CAUTION" : "DENIED",
            "x-pocketsense-amount": String(extractedAmount),
            "x-pocketsense-merchant": merchant,
            "x-pocketsense-source": "gemini-2.5-flash",
          },
        });
      } catch (geminiError) {
        console.warn("Gemini stream error, falling back to beginner response:", geminiError);
      }
    }

    // Format text stream following the exact 3-part structure
    const formattedStreamText = `**${coachAdvice.directAnswer}**\n\n${coachAdvice.bulletPoints.map(b => `• ${translateFinanceJargon(b)}`).join("\n")}\n\n👉 **Next Step:** ${translateFinanceJargon(coachAdvice.concreteAction)}\n\n💡 **Explain Even Simpler:** ${translateFinanceJargon(coachAdvice.simplerOneLiner)}`;

    // Demo Mode & Fallback
    if (!stream) {
      return NextResponse.json({
        success: true,
        source: "beginner-money-brain-engine",
        advice: coachAdvice,
        merchant,
        formattedText: formattedStreamText,
      });
    }

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        const words = formattedStreamText.split(" ");
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
          await new Promise((r) => setTimeout(r, 10));
        }
        controller.close();
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "x-pocketsense-verdict": coachAdvice.directAnswer.startsWith("Yes") ? "APPROVED" : coachAdvice.directAnswer.startsWith("Wait") ? "CAUTION" : "DENIED",
        "x-pocketsense-amount": String(extractedAmount),
        "x-pocketsense-merchant": merchant,
        "x-pocketsense-source": "beginner-coach-engine",
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
