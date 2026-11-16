import { NextResponse } from "next/server";
import { geminiModel, isGeminiConfigured } from "@/lib/ai/gemini";
import { parseSmsHeuristically } from "@/lib/ai/heuristics";
import { SmsParseResult } from "@/types";
import { generateObject } from "ai";
import { z } from "zod";

const smsSchema = z.object({
  transactions: z.array(
    z.object({
      merchant: z.string().describe("Clean merchant or payee name, e.g. 'Blue Tokai', 'Toit Brewery', 'Zerodha', 'Apartment Rent'"),
      amount: z.number().describe("Amount in Indian Rupees (INR)"),
      date: z.string().describe("ISO format YYYY-MM-DD"),
      category: z.enum([
        "Dining & Social",
        "Quick Commerce & Groceries",
        "Commute & Rides",
        "Subscriptions & Cloud",
        "Shopping & Gear",
        "Rent & Fixed Utilities",
        "Health & Wellness",
        "Investments & SIPs",
      ]),
      spendingType: z.enum([
        "Survival Need",
        "Impulse Want",
        "Silent Subscription Leak",
      ]).describe("Classification for cash-flow runway management"),
      upiRef: z.string().describe("UPI Reference number or transaction ID if present"),
      bank: z.string().describe("Bank, card, or UPI app name"),
      triggerTag: z.string().optional().describe("e.g. 'specialty-coffee', 'weekend-hangout', 'quick-commerce', 'lifestyle-creep'"),
      confidenceScore: z.number().min(0).max(1),
      explanation: z.string().describe("One concise sentence explaining classification"),
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

    if (!demoMode && isGeminiConfigured) {
      try {
        const prompt = `You are the PocketSense AI Financial Parser for young working professionals (24-30 age group).
Parse the following Indian bank SMS notifications into structured transaction records.
Rules:
1. Context: Rent, Mutual Fund SIPs, Cook/Maid, Gym, Groceries are 'Survival Need'. Speciality coffee, weekend brewery/dining splits, apparel sales, gourmet quick commerce are 'Impulse Want'. Recurring streaming/SaaS auto-debits (Apple, Netflix, Spotify) are 'Silent Subscription Leak'.
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
        console.warn("Gemini parsing failed; falling back to heuristic parser:", geminiError);
      }
    }

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
