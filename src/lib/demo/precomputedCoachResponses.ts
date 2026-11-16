import { ImpulseVerdict, FinancialMemoryProfile } from "@/types";
import { formatINR } from "../utils";

export interface PrecomputedResponse {
  queryKeywords: string[];
  verdict: "APPROVED" | "CAUTION" | "DENIED";
  headline: string;
  coachResponse: string;
  budgetImpactDays: number;
  dailySafeReduction: number;
  extractedAmount: number;
  merchant: string;
  smartHacks: string[];
  recalledMemories: string[];
  opportunityCostGoalTitle: string;
}

export const PRECOMPUTED_PROMPT_CATALOG: PrecomputedResponse[] = [
  {
    queryKeywords: ["dinner", "3500", "beer", "craft", "brewery", "friends", "colleagues", "drinks", "party"],
    verdict: "DENIED",
    extractedAmount: 3500,
    merchant: "Weekend Bistro & Craft Beer Split",
    budgetImpactDays: 6.4,
    dailySafeReduction: 218,
    headline: "🚨 Hold off: ₹3,500 burns over 6 days of your discretionary runway.",
    coachResponse: `You have ₹8,800 remaining in your discretionary pool for the next 16 days (that is ₹550/day).

Dropping ₹3,500 on dinner and drinks tonight immediately slashes your daily safe headroom from ₹550/day down to ₹331/day.

Furthermore, that ₹3,500 is 2.3% of your **Japan Spring Trip** goal jar! Cap your spend tonight at ₹1,500, redirect the ₹2,000 difference into your Japan Jar, and protect your month-end cash flow.`,
    smartHacks: [
      "Have a quick bite at home before heading out to avoid ordering oversized mains.",
      "Settle your own round rather than participating in an open group card split.",
      "Click 'Skip & Save' below to redirect this amount into your Japan Trip Jar."
    ],
    recalledMemories: [
      "Current Daily Safe-to-Spend: ₹550/day",
      "Days remaining in month: 16 days",
      "Active Goal: Japan Spring Trip (₹68,000 / ₹1,50,000)",
      "Identified Trap: 'Weekend Social Splurge' (burns ~₹14,000/mo)",
      "Discretionary Runway: ₹8,800 remaining"
    ],
    opportunityCostGoalTitle: "Japan Spring Trip",
  },
  {
    queryKeywords: ["headphones", "14990", "15000", "gadget", "sony", "bose", "apple", "tech"],
    verdict: "DENIED",
    extractedAmount: 14990,
    merchant: "Premium ANC Headphones",
    budgetImpactDays: 27.2,
    dailySafeReduction: 550,
    headline: "🛑 Critical Squeeze: ₹14,990 completely drains your remaining monthly pool!",
    coachResponse: `This single purchase completely wipes out your entire remaining discretionary runway (₹8,800) and forces you to dip ₹6,190 into your emergency reserves before next payday.

You already have an active **M3 Max MacBook Pro Goal Jar** with ₹54,000 accumulated. Instead of an unbudgeted impulse, move this to your wishlist, enforce a 72-hour cooling period, and fund your planned setup first.`,
    smartHacks: [
      "Enforce the 72-Hour Rule: Bookmark the product and review on payday.",
      "Check if your company provides an annual learning or remote-work equipment stipend.",
      "Divert ₹3,000 into your MacBook jar instead to feel immediate progress."
    ],
    recalledMemories: [
      "Discretionary Runway: ₹8,800 remaining",
      "Daily Safe-to-Spend: ₹550/day",
      "Active Goal: M3 Max MacBook Pro (₹54,000 / ₹1,20,000)",
      "High-Ticket Alert: Exceeds 100% of remaining runway"
    ],
    opportunityCostGoalTitle: "M3 Max MacBook Pro",
  },
  {
    queryKeywords: ["coffee", "420", "blue tokai", "third wave", "starbucks", "cafe"],
    verdict: "APPROVED",
    extractedAmount: 420,
    merchant: "Blue Tokai Coffee Roasters",
    budgetImpactDays: 0.8,
    dailySafeReduction: 26,
    headline: "✅ Approved: ₹420 fits comfortably within your ₹550/day runway.",
    coachResponse: `Enjoy your coffee. At ₹420, this single order fits within today's safe spending limit of ₹550 without derailing your fixed savings or rent commitments.

Just keep your monthly pattern in mind: you've logged 16 cafe visits this month totaling ₹6,400. As long as you maintain today's remaining ₹130 headroom, you remain in the green zone.`,
    smartHacks: [
      "Log the transaction immediately to keep your 5-day discipline streak active.",
      "Keep weekday morning pour-overs at home so cafe visits remain high-value treats."
    ],
    recalledMemories: [
      "Daily Safe-to-Spend: ₹550/day",
      "Identified Pattern: Specialty Coffee Habit (16x/mo = ₹6,400)",
      "Discipline Streak: 5 Days Active"
    ],
    opportunityCostGoalTitle: "Japan Spring Trip",
  },
  {
    queryKeywords: ["zara", "2990", "clothes", "jacket", "shirt", "shopping", "myntra", "h&m"],
    verdict: "CAUTION",
    extractedAmount: 2990,
    merchant: "Zara Weekend Apparel",
    budgetImpactDays: 5.4,
    dailySafeReduction: 186,
    headline: "⚠️ Caution: ₹2,990 consumes over 5 days of your daily buffer.",
    coachResponse: `While not an outright crisis, spending ₹2,990 takes a noticeable bite out of your remaining ₹8,800 cushion. It reduces your daily headroom for the next 16 days from ₹550/day down to ₹363/day.

Ask yourself if this piece fills an immediate wardrobe need or if it is casual lifestyle creep. Can you sleep on it for 48 hours?`,
    smartHacks: [
      "Leave items in your cart for 48 hours to evaluate genuine utility.",
      "If you buy it, offset the cost by dining at home for the next 4 days."
    ],
    recalledMemories: [
      "Daily Safe-to-Spend: ₹550/day",
      "Discretionary Runway: ₹8,800 remaining",
      "Opportunity Cost: Equal to 2.5% of your MacBook Pro goal"
    ],
    opportunityCostGoalTitle: "M3 Max MacBook Pro",
  },
  {
    queryKeywords: ["staycation", "resort", "8500", "weekend trip", "getaway", "hotel"],
    verdict: "DENIED",
    extractedAmount: 8500,
    merchant: "Weekend Luxury Resort Staycation",
    budgetImpactDays: 15.4,
    dailySafeReduction: 531,
    headline: "🚨 Hold off: ₹8,500 consumes 96% of your remaining monthly buffer.",
    coachResponse: `Spending ₹8,500 on an impromptu weekend trip leaves you with virtually ₹300 for the entire rest of the month.

If you are burnt out from work, plan a low-cost day retreat or schedule a staycation right after salary day when your discretionary pool is replenished. Don't sacrifice your Japan Spring Trip for a 2-day getaway.`,
    smartHacks: [
      "Schedule staycations for the first weekend of next month after salary credit.",
      "Divert ₹4,000 toward your Japan Trip Jar right now to keep your long-term travel vision intact."
    ],
    recalledMemories: [
      "Daily Safe-to-Spend: ₹550/day",
      "Discretionary Pool: ₹8,800 remaining",
      "Target Goal: Japan Spring Trip (₹68,000 / ₹1,50,000)"
    ],
    opportunityCostGoalTitle: "Japan Spring Trip",
  },
];

export function getPrecomputedCoachResponse(
  prompt: string,
  profile: FinancialMemoryProfile,
  dailySafe: number = 550,
  daysLeft: number = 16
): ImpulseVerdict {
  const lower = prompt.toLowerCase();

  for (const item of PRECOMPUTED_PROMPT_CATALOG) {
    const matchCount = item.queryKeywords.filter((kw) => lower.includes(kw)).length;
    if (
      matchCount >= 2 ||
      (matchCount >= 1 && (lower.includes("dinner") || lower.includes("beer") || lower.includes("coffee") || lower.includes("zara") || lower.includes("headphones") || lower.includes("staycation")))
    ) {
      return {
        verdict: item.verdict,
        headline: item.headline,
        coachResponse: item.coachResponse,
        budgetImpactDays: item.budgetImpactDays,
        dailySafeReduction: item.dailySafeReduction,
        opportunityCostGoal: {
          goalId: "goal_japan_trip",
          goalTitle: item.opportunityCostGoalTitle,
          delayDays: Math.ceil(item.extractedAmount / Math.max(dailySafe, 100)),
          equivalentMilestone: `${Math.round((item.extractedAmount / 150000) * 100)}% of your ${item.opportunityCostGoalTitle} target`,
        },
        smartHacks: item.smartHacks,
        recalledMemories: [
          ...item.recalledMemories,
          "⚡ Instant Pre-Computed Response (Zero Latency)"
        ],
      };
    }
  }

  // Fallback for custom amounts
  let amount = 1500;
  const numMatch = lower.match(/(?:(?:rs\.?|inr|₹)\s*([\d,]+))|(?:\b(\d{3,6})\b)/i);
  if (numMatch) {
    amount = parseFloat((numMatch[1] || numMatch[2]).replace(/,/g, ""));
  }

  const primaryGoal = profile?.goals?.[0] || {
    id: "goal_japan_trip",
    title: "Japan Spring Trip",
    targetAmount: 150000,
    currentAmount: 68000,
  };

  const daysImpact = Math.round((amount / Math.max(dailySafe, 1)) * 10) / 10;
  const newSafe = Math.max(0, Math.round(((dailySafe * daysLeft) - amount) / daysLeft));
  const diff = dailySafe - newSafe;

  const verdict: "APPROVED" | "CAUTION" | "DENIED" =
    amount > dailySafe * 2.5 ? "DENIED" : amount > dailySafe ? "CAUTION" : "APPROVED";

  return {
    verdict,
    headline:
      verdict === "DENIED"
        ? `🚨 Hold off: Spending ₹${amount} consumes ${daysImpact} days of your runway.`
        : verdict === "CAUTION"
        ? `⚠️ Caution: ₹${amount} absorbs ${daysImpact} days of your daily safe limit.`
        : `✅ Approved: ₹${amount} is well within your ₹${dailySafe}/day safe limit.`,
    coachResponse: `You have ₹${Math.round(dailySafe * daysLeft)} left in your discretionary runway for the next ${daysLeft} days (₹${dailySafe}/day).\n\nSpending ₹${amount} right now adjusts your daily limit to ₹${newSafe}/day.\n\nThat ₹${amount} equals ${Math.round((amount / primaryGoal.targetAmount) * 100)}% of your **${primaryGoal.title}** jar. Keep your long-term wealth goals front and center.`,
    budgetImpactDays: daysImpact,
    dailySafeReduction: diff,
    opportunityCostGoal: {
      goalId: primaryGoal.id,
      goalTitle: primaryGoal.title,
      delayDays: Math.ceil(amount / Math.max(dailySafe, 100)),
      equivalentMilestone: `${Math.round((amount / primaryGoal.targetAmount) * 100)}% of your ${primaryGoal.title} target`,
    },
    smartHacks: [
      "Pause for 15 minutes before scanning that QR.",
      "Check whether this purchase directly compounds your personal or financial goals.",
      "Click 'Skip & Save' to transfer this directly to your goal jar."
    ],
    recalledMemories: [
      `Daily Safe Limit: ₹${dailySafe}/day`,
      `Days Remaining: ${daysLeft} days`,
      `Primary Goal: ${primaryGoal.title}`,
      "⚡ Instant Pre-Computed Response"
    ],
  };
}
