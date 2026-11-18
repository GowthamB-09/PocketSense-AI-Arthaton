import { ImpulseVerdict, FinancialMemoryProfile } from "@/types";
import { formatINR } from "../utils";
import { translateFinanceJargon } from "../ai/coachResponses";

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
  simplerOneLiner?: string;
}

export const PRECOMPUTED_PROMPT_CATALOG: PrecomputedResponse[] = [
  {
    queryKeywords: ["dinner", "3500", "beer", "craft", "brewery", "friends", "colleagues", "drinks", "party", "1500"],
    verdict: "CAUTION",
    extractedAmount: 1500,
    merchant: "Weekend Bistro & Dinner",
    budgetImpactDays: 2.1,
    dailySafeReduction: 88,
    headline: "Wait—do this instead: cap tonight at ₹550 and pocket ₹950.",
    coachResponse: `**Wait—do this instead: cap tonight at ₹550.**

• You have **₹30,592** left in your safe pool for 17 days.
• Spending ₹1,500 delays your New iPhone jar by 11 days.
• A ₹550 local hangout gives you the exact same fun.

👉 **Next Step:** Spend **₹550** tonight and sweep the **₹950** difference directly into your **New iPhone** jar!`,
    smartHacks: [
      "Order local favorites or share bites to stay under ₹550.",
      "Sweep the ₹950 difference into your Safe Growth Vault."
    ],
    recalledMemories: [
      "Remaining Safe Pool: ₹30,592 (17 days to payday)",
      "Active Goal: New iPhone (₹42,000 / ₹80,000)",
      "Spend Speed: Good"
    ],
    opportunityCostGoalTitle: "New iPhone",
    simplerOneLiner: "Spend ₹550 instead of ₹1,500 tonight—you have equal fun and save ₹950 for your iPhone.",
  },
  {
    queryKeywords: ["headphones", "14990", "15000", "gadget", "sony", "bose", "apple", "tech", "sneakers", "4500"],
    verdict: "CAUTION",
    extractedAmount: 4500,
    merchant: "Branded Sneakers & Gear",
    budgetImpactDays: 4.8,
    dailySafeReduction: 264,
    headline: "Wait—do this instead: wait 48 hours and check festival discounts.",
    coachResponse: `**Wait—do this instead: hold off for 48 hours.**

• You have **₹30,592** safe cash remaining before next payday.
• A ₹4,500 impulse spend wipes out 2.5 days of safe headroom.
• Your New iPhone jar is 53% funded—keep the momentum going.

👉 **Next Step:** Put ₹2,000 into **Instant Safe (~6.8% / yr)** today to keep your money safe from impulse buys!`,
    smartHacks: [
      "Bookmark the shoes and revisit on payday.",
      "Check upcoming festive sale coupons before paying full retail."
    ],
    recalledMemories: [
      "Remaining Safe Pool: ₹30,592",
      "Active Goal: New iPhone (₹42,000 / ₹80,000)",
      "Safe Growth Vault: Instant Safe (~6.8% / yr)"
    ],
    opportunityCostGoalTitle: "New iPhone",
    simplerOneLiner: "Hold off on the ₹4,500 shoes for 48 hours so you don't slow down your ₹80,000 iPhone goal.",
  },
  {
    queryKeywords: ["coffee", "420", "blue tokai", "third wave", "starbucks", "cafe", "350"],
    verdict: "APPROVED",
    extractedAmount: 350,
    merchant: "Blue Tokai Coffee Roasters",
    budgetImpactDays: 0.4,
    dailySafeReduction: 20,
    headline: "Yes—₹350 fits comfortably within your safe pool.",
    coachResponse: `**Yes—enjoy your coffee with zero guilt.**

• Your safe pool has **₹30,592** remaining for 17 days.
• A ₹350 coffee takes less than 1% of your spendable cash.
• Your essential bills and card dues are already 100% covered.

👉 **Next Step:** Pay with UPI and let your automatic **₹50 spare change round-up** flow into your goal jar!`,
    smartHacks: [
      "Enjoy guilt-free treats that stay well inside your daily cushion.",
      "Round-up spare change automatically saves ₹50 for your goal."
    ],
    recalledMemories: [
      "Safe Pool: ₹30,592 remaining",
      "Days to Payday: 17 days",
      "Spare Change Round-Up: Active"
    ],
    opportunityCostGoalTitle: "New iPhone",
    simplerOneLiner: "Go ahead and enjoy your coffee—it's small enough that your savings won't even notice.",
  },
  {
    queryKeywords: ["zara", "2990", "clothes", "jacket", "shirt", "shopping", "myntra", "h&m"],
    verdict: "CAUTION",
    extractedAmount: 2990,
    merchant: "Zara Apparel",
    budgetImpactDays: 3.2,
    dailySafeReduction: 175,
    headline: "Wait—do this instead: leave it in your cart for 24 hours.",
    coachResponse: `**Wait—do this instead: leave it in your cart for 24 hours.**

• You have **₹30,592** safe cash left for 17 days.
• Spending ₹2,990 burns almost 2 full days of safe spending.
• Most clothes carted on impulse are forgotten within a day.

👉 **Next Step:** Sleep on it tonight. If you still want it tomorrow, take ₹1,500 from your Extra Spend pool!`,
    smartHacks: [
      "The 24-hour test stops 80% of regretful fashion buys.",
      "Check if you already own a similar staple piece."
    ],
    recalledMemories: [
      "Safe Pool: ₹30,592",
      "Days to Payday: 17 days",
      "Goal Jar: New iPhone (₹42,000 / ₹80,000)"
    ],
    opportunityCostGoalTitle: "New iPhone",
    simplerOneLiner: "Wait 24 hours before buying clothes—if you still want it tomorrow, buy it guilt-free.",
  },
  {
    queryKeywords: ["staycation", "resort", "8500", "weekend trip", "getaway", "hotel"],
    verdict: "DENIED",
    extractedAmount: 8500,
    merchant: "Weekend Luxury Resort Staycation",
    budgetImpactDays: 9.4,
    dailySafeReduction: 500,
    headline: "No—₹8,500 burns over 28% of your entire safe pool.",
    coachResponse: `**No—hold off until after your next payday.**

• You have **₹30,592** left for the next 17 days.
• Dropping ₹8,500 now squeezes your final week before salary.
• An unbudgeted ₹8,500 trip delays your **New iPhone** by 4 weeks.

👉 **Next Step:** Plan the staycation for the first weekend of next month right after your **₹75,000 salary** arrives!`,
    smartHacks: [
      "Book trips right after payday when your safe pool is fresh.",
      "Keep your emergency cushion locked away from weekend splurges."
    ],
    recalledMemories: [
      "Safe Pool: ₹30,592",
      "Monthly Salary: ₹75,000",
      "Goal: New iPhone (₹42,000 / ₹80,000)"
    ],
    opportunityCostGoalTitle: "New iPhone",
    simplerOneLiner: "Wait until next month's salary to book the staycation so you don't run short on cash this month.",
  },
];

export function getPrecomputedCoachResponse(
  prompt: string,
  profile: FinancialMemoryProfile,
  dailySafe: number = 1799,
  daysLeft: number = 17
): ImpulseVerdict {
  const lower = prompt.toLowerCase();
  const pool = (profile.monthlySalary || 75000) - (profile.fixedEssentials || 31500);
  const safePool = pool > 0 ? pool : 30592;

  for (const item of PRECOMPUTED_PROMPT_CATALOG) {
    const matchCount = item.queryKeywords.filter((kw) => lower.includes(kw)).length;
    if (
      matchCount >= 2 ||
      (matchCount >= 1 && (lower.includes("dinner") || lower.includes("beer") || lower.includes("coffee") || lower.includes("zara") || lower.includes("headphones") || lower.includes("staycation") || lower.includes("sneakers")))
    ) {
      return {
        verdict: item.verdict,
        headline: item.headline,
        coachResponse: translateFinanceJargon(item.coachResponse),
        budgetImpactDays: item.budgetImpactDays,
        dailySafeReduction: item.dailySafeReduction,
        opportunityCostGoal: {
          goalId: "goal_iphone",
          goalTitle: item.opportunityCostGoalTitle,
          delayDays: Math.ceil(item.extractedAmount / Math.max(Math.round(safePool / daysLeft), 100)),
          equivalentMilestone: `${Math.round((item.extractedAmount / 80000) * 100)}% of your ${item.opportunityCostGoalTitle} target`,
        },
        smartHacks: item.smartHacks.map(h => translateFinanceJargon(h)),
        recalledMemories: item.recalledMemories.map(m => translateFinanceJargon(m)),
      };
    }
  }

  // Fallback for custom queries
  let amount = 1500;
  const numMatch = lower.match(/(?:(?:rs\.?|inr|₹)\s*([\d,]+))|(?:\b(\d{3,6})\b)/i);
  if (numMatch) {
    amount = parseFloat((numMatch[1] || numMatch[2]).replace(/,/g, ""));
  }

  const primaryGoal = profile?.goals?.[0] || {
    id: "goal_iphone",
    title: "New iPhone",
    targetAmount: 80000,
    currentAmount: 42000,
  };

  const dailyCushion = Math.round(safePool / daysLeft);
  const daysImpact = Math.round((amount / Math.max(dailyCushion, 1)) * 10) / 10;
  const newSafe = Math.max(0, Math.round((safePool - amount) / daysLeft));
  const diff = dailyCushion - newSafe;

  const verdict: "APPROVED" | "CAUTION" | "DENIED" =
    amount > safePool * 0.4 ? "DENIED" : amount > dailyCushion * 1.5 ? "CAUTION" : "APPROVED";

  const directAnswer = verdict === "APPROVED"
    ? `Yes—₹${amount} fits comfortably within your safe pool.`
    : verdict === "CAUTION"
    ? `Wait—do this instead: cap spend at ₹${Math.round(amount * 0.4)}.`
    : `No—₹${amount} burns too much of your safe pool.`;

  return {
    verdict,
    headline: directAnswer,
    coachResponse: `**${directAnswer}**

• You have **${formatINR(safePool)}** safe cash left for the next ${daysLeft} days.
• Spending ₹${amount} absorbs ${daysImpact} days of your safe headroom.
• Your **${primaryGoal.title}** goal jar has ${formatINR(primaryGoal.currentAmount)} safely saved.

👉 **Next Step:** ${verdict === "APPROVED" ? `Proceed with your purchase—your safe pool remains healthy!` : `Cap spend or pause for 24 hours to keep your ${primaryGoal.title} on track!`}`,
    budgetImpactDays: daysImpact,
    dailySafeReduction: diff,
    opportunityCostGoal: {
      goalId: primaryGoal.id,
      goalTitle: primaryGoal.title,
      delayDays: Math.ceil(amount / Math.max(dailyCushion, 100)),
      equivalentMilestone: `${Math.round((amount / primaryGoal.targetAmount) * 100)}% of your ${primaryGoal.title} target`,
    },
    smartHacks: [
      "Keep non-essential spends under your daily safe cushion.",
      "Check your goal jar progress before making high-ticket purchases."
    ],
    recalledMemories: [
      `Safe Pool: ${formatINR(safePool)}`,
      `Days to Payday: ${daysLeft} days`,
      `Active Goal: ${primaryGoal.title}`
    ],
  };
}
