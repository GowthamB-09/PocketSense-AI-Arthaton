import { NextResponse } from "next/server";
import { geminiModel, isGeminiConfigured } from "@/lib/ai/gemini";
import { parseSmsHeuristically } from "@/lib/ai/heuristics";
import { SmsParseResult } from "@/types";
import { generateObject } from "ai";
import { z } from "zod";

const smsSchema = z.object({
  transactions: z.array(
    z.object({
      merchant: z.string().describe("Clean merchant name, e.g. 'Ramesh Chai', 'Swiggy', 'Spotify'"),
      amount: z.number().describe("Amount in Indian Rupees (INR)"),
      date: z.string().describe("ISO format YYYY-MM-DD"),
      category: z.enum([
        "Food & Dining",
        "Groceries & Essentials",
        "Transit & Commute",
        "Entertainment & Subscriptions",
        "Shopping & Gear",
        "Academic & Utilities",
        "Personal Care & Health",
        "Peer Transfers & Splits",
      ]),
      spendingType: z.enum([
        "Survival Need",
        "Impulse Want",
        "Silent Subscription Leak",
      ]).describe("Classification for student budget management"),
      upiRef: z.string().describe("UPI Reference number or transaction ID if present"),
      bank: z.string().describe("Bank or UPI app name, e.g. HDFC, SBI, PhonePe"),
      triggerTag: z.string().optional().describe("e.g. 'late-night', 'chai-tapri', 'weekend-fomo', 'auto-debit'"),
      confidenceScore: z.number().min(0).max(1),
      explanation: z.string().describe("One sentence explaining why this is Need vs Want vs Leak"),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { smsText, texts, demoMode = false } = body;

    const rawList: string[] = texts && Array.isArray(texts)
      ? texts
      : smsText
      ? [smsText]
      : [];

    if (rawList.length === 0) {
      return NextResponse.json({ error: "No SMS text provided" }, { status: 400 });
    }

    // If Demo Mode is NOT forced and Gemini is configured, attempt structured AI parsing
    if (!demoMode && isGeminiConfigured) {
      try {
        const prompt = `You are the PocketSense AI Indian UPI SMS Parser. Parse the following Indian bank SMS notifications into structured transaction records.
Rules:
1. Indian College Student context: ₹40 tea/chai or snacks is 'Impulse Want' (chai-tapri). Canteen thali, metro card, printouts/xerox, hostel mess, medicine are 'Survival Need'. Swiggy/Zomato/Blinkit after 11 PM are 'Impulse Want' with trigger 'late-night'. Recurring Spotify, Netflix, YouTube Premium auto-debits are 'Silent Subscription Leak'.
2. Return amounts strictly in INR (numeric).
3. Do not invent bank account numbers or sensitive data.

SMS Texts:
${rawList.map((t, idx) => `[SMS #${idx + 1}]: ${t}`).join("\n")}
`;

        const { object } = await generateObject({
          model: geminiModel,
          schema: smsSchema,
          prompt,
        });

        const results: SmsParseResult[] = object.transactions.map((t, idx) => ({
          ...t,
          rawText: rawList[idx] || rawList[0],
        }));

        return NextResponse.json({
          success: true,
          source: "gemini-2.5-flash",
          results,
        });
      } catch (geminiError) {
        console.warn("Gemini parsing failed or rate-limited; falling back to heuristic parser:", geminiError);
        // Fall through to heuristic parser below
      }
    }

    // Heuristic Fallback Engine
    const results: SmsParseResult[] = rawList.map((text) => parseSmsHeuristically(text));

    return NextResponse.json({
      success: true,
      source: demoMode ? "demo-precomputed" : "heuristic-local-engine",
      results,
    });
  } catch (error: any) {
    console.error("SMS Parsing Error:", error);
    return NextResponse.json(
      { error: "Failed to parse SMS", details: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

