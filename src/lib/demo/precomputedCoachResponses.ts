import { ImpulseVerdict, FinancialMemoryProfile } from "@/types";
import { formatINR } from "../utils";

export interface PrecomputedResponse {
  queryKeywords: string[];
  verdict: "APPROVED" | "CAUTION" | "DENIED";
  headline: string;
  seniorBhaiResponse: string;
  budgetImpactDays: number;
  dailySafeReduction: number;
  extractedAmount: number;
  merchant: string;
  smartSeniorHacks: string[];
  recalledMemories: string[];
  opportunityCostGoalTitle: string;
}

export const PRECOMPUTED_PROMPT_CATALOG: PrecomputedResponse[] = [
  {
    queryKeywords: ["dinner", "650", "friends", "restaurant", "cafe split"],
    verdict: "DENIED",
    extractedAmount: 650,
    merchant: "Dinner with friends",
    budgetImpactDays: 3.9,
    dailySafeReduction: 41,
    headline: "🚨 Hold up, Bhai! Spending ₹650 will crush your next 3.9 days.",
    seniorBhaiResponse: `Listen to your senior for 2 minutes. You have only ₹2,640 left for the next 16 days (that's just ₹165/day!).

Dropping ₹650 on dinner with friends right now will slice your daily allowance down to ₹124/day. That means starting tomorrow, you can't even afford a hostel canteen thali and transit without borrowing from friends.

Plus, that ₹650 is literally 8% of your **Goa Semester-End Trip** jar! Skip this impulse, dump the ₹650 into your goal jar, and thank yourself on Day 25.`,
    smartSeniorHacks: [
      "Eat mess dinner or toast before heading out with friends.",
      "Order just a mocktail or starter; cap your table split at ₹200.",
      "Use the 'Skip & Save' button to credit ₹650 to your Goa Trip jar!"
    ],
    recalledMemories: [
      "Current Daily Safe-to-Spend: ₹165/day",
      "Days left in month: 16 days",
      "Active Goal: Goa Semester-End Trip (₹3,200/₹8,000)",
      "Trigger Matched: High-ticket impulse (>3x daily safe budget)",
      "Vulnerability Zone: Friday & weekend hostel peer splits"
    ],
    opportunityCostGoalTitle: "Goa Semester-End Trip",
  },
  {
    queryKeywords: ["biryani", "swiggy", "280", "midnight", "zomato", "late night"],
    verdict: "CAUTION",
    extractedAmount: 280,
    merchant: "Swiggy Midnight Biryani",
    budgetImpactDays: 1.7,
    dailySafeReduction: 18,
    headline: "⚠️ Tread lightly: ₹280 midnight delivery eats 1.7 days of your buffer.",
    seniorBhaiResponse: `Bhai, midnight delivery strikes again! Your Financial Memory shows you've already fallen into this trap 6 times this month (burning ₹1,960 in total).

Spending ₹280 on Biryani right now wipes out nearly two full days of your safe daily allowance (₹165/day). If you're genuinely starving, raid your hostel roomie's pantry or make ₹15 cup noodles.

Save that ₹280 and push it to your **Nike Air Max Sneakers** jar instead—you'll be 50% funded!`,
    smartSeniorHacks: [
      "Boil hostel electric kettle Maggi or peanut butter toast.",
      "Put your phone on 'Do Not Disturb' and wait 15 minutes.",
      "If you must order, split a single portion with your roommate to cap spend at ₹140."
    ],
    recalledMemories: [
      "Trigger Matched: 'Midnight Delivery Syndrome' (avg ₹310 burn/order)",
      "Daily Safe-to-Spend: ₹165/day",
      "Target Goal: Nike Air Max Sneakers (₹1,650/₹3,800)",
      "Vulnerability Zone: Post 11:30 PM room cravings"
    ],
    opportunityCostGoalTitle: "Nike Air Max Sneakers",
  },
  {
    queryKeywords: ["chai", "tapri", "40", "tea", "cutting", "canteen tea"],
    verdict: "APPROVED",
    extractedAmount: 40,
    merchant: "Ramesh Chai Tapri",
    budgetImpactDays: 0.2,
    dailySafeReduction: 3,
    headline: "✅ Green Light! ₹40 is well within your ₹165/day daily safe limit.",
    seniorBhaiResponse: `Bhai, cutting chai with batchmates is an essential college ritual—we're not financial robots here! ₹40 is completely within today's safe allowance of ₹165/day.

Just remember your Financial Memory warning: you've tapped ₹40 over 24 times this month totaling ₹1,080. Enjoy this tea, but don't let it turn into a 4-times-a-day habit today!`,
    smartSeniorHacks: [
      "Log the UPI transaction immediately to keep your 4-day discipline streak alive.",
      "Stick to 1 round of cutting chai; avoid adding extra cigarette or packaged snack tabs."
    ],
    recalledMemories: [
      "Daily Safe-to-Spend: ₹165/day",
      "Recalled Trap: The 'Only ₹40' Tapri Blindspot (24x/month = ₹1,080)",
      "Discipline Streak: 4 Days Active"
    ],
    opportunityCostGoalTitle: "Goa Semester-End Trip",
  },
  {
    queryKeywords: ["sneakers", "2100", "shoes", "hoodie", "sale", "myntra", "zara"],
    verdict: "DENIED",
    extractedAmount: 2100,
    merchant: "Sneakers Flash Sale",
    budgetImpactDays: 12.7,
    dailySafeReduction: 131,
    headline: "🛑 Critical Impulse Alert: ₹2,100 burns 12.7 DAYS of your allowance!",
    seniorBhaiResponse: `Junior, STOP your thumbs right there! You have only ₹2,640 left in your entire monthly runway. Spending ₹2,100 on an impulse flash sale leaves you with just ₹540 to survive the remaining 16 days—that's literally ₹33/day!

You already have a dedicated **Nike Air Max Sneakers Goal Jar** with ₹1,650 saved. Don't blow your food budget on a rushed purchase. Transfer ₹500 into your sneaker jar instead and buy the dream pair guilt-free on Day 30.`,
    smartSeniorHacks: [
      "Enforce the 48-Hour Cart Rule: Close the app and revisit in 2 days.",
      "Remember: A 50% discount on something you don't need is still 100% money wasted.",
      "Click 'Skip & Save' below to redirect this craving into your Goal Jar!"
    ],
    recalledMemories: [
      "Budget Runway: ₹2,640 remaining",
      "Daily Safe-to-Spend: ₹165/day",
      "Active Goal: Nike Air Max Sneakers (₹1,650/₹3,800)",
      "Critical Risk: Projected zero cash day drops from Day 18 to Day 15!"
    ],
    opportunityCostGoalTitle: "Nike Air Max Sneakers",
  },
  {
    queryKeywords: ["concert", "fest", "1200", "sunburn", "ticket", "pass"],
    verdict: "CAUTION",
    extractedAmount: 1200,
    merchant: "Campus Fest Concert Ticket",
    budgetImpactDays: 7.3,
    dailySafeReduction: 75,
    headline: "⚠️ Heavy Hit: ₹1,200 consumes 7.3 days of your safe runway.",
    seniorBhaiResponse: `Sunburn festival is a great college memory, but spending ₹1,200 outright cuts your daily safe allowance from ₹165/day to ₹90/day for the next 16 days.

If you really want to go, here is the Senior Bhai play: volunteer for the campus organizing crew to get free backstage access, or pool resources with batchmates and sacrifice weekend eating out to balance the equation.`,
    smartSeniorHacks: [
      "Check student volunteer ambassador passes for free entry.",
      "Divert partial savings from your Goa trip jar only if you commit to eating mess food all week."
    ],
    recalledMemories: [
      "Daily Safe-to-Spend: ₹165/day",
      "Days remaining: 16 days",
      "Budget Impact: Cuts daily headroom by 45%"
    ],
    opportunityCostGoalTitle: "Goa Semester-End Trip",
  },
];

/**
 * Finds the best precomputed response matching the prompt or generates one dynamically
 */
export function getPrecomputedCoachResponse(
  prompt: string,
  profile: FinancialMemoryProfile,
  dailySafe: number = 165,
  daysLeft: number = 16
): ImpulseVerdict {
  const lower = prompt.toLowerCase();

  // Check matching precomputed responses
  for (const item of PRECOMPUTED_PROMPT_CATALOG) {
    const matchCount = item.queryKeywords.filter((kw) => lower.includes(kw)).length;
    if (matchCount >= 2 || (matchCount >= 1 && (lower.includes("dinner") || lower.includes("swiggy") || lower.includes("chai") || lower.includes("sneaker")))) {
      return {
        verdict: item.verdict,
        headline: item.headline,
        seniorBhaiResponse: item.seniorBhaiResponse,
        budgetImpactDays: item.budgetImpactDays,
        dailySafeReduction: item.dailySafeReduction,
        opportunityCostGoal: {
          goalId: "goal_goa_trip",
          goalTitle: item.opportunityCostGoalTitle,
          delayDays: Math.ceil(item.extractedAmount / Math.max(dailySafe, 50)),
          equivalentMilestone: `${Math.round((item.extractedAmount / 8000) * 100)}% of your ${item.opportunityCostGoalTitle} target`,
        },
        smartSeniorHacks: item.smartSeniorHacks,
        recalledMemories: [
          ...item.recalledMemories,
          "⚡ Instant Pre-Computed Response (Zero API Quota Delay)"
        ],
      };
    }
  }

  // If prompt has an amount not in the list, extract and compute accurately
  let amount = 350;
  const numMatch = lower.match(/(?:(?:rs\.?|inr|₹)\s*([\d,]+))|(?:\b(\d{2,5})\b)/i);
  if (numMatch) {
    amount = parseFloat((numMatch[1] || numMatch[2]).replace(/,/g, ""));
  }

  const primaryGoal = profile?.goals?.[0] || {
    id: "goal_goa_trip",
    title: "Goa Semester-End Trip",
    targetAmount: 8000,
    currentAmount: 3200,
  };

  const daysImpact = Math.round((amount / Math.max(dailySafe, 1)) * 10) / 10;
  const newSafe = Math.max(0, Math.round(((dailySafe * daysLeft) - amount) / daysLeft));
  const diff = dailySafe - newSafe;

  const verdict: "APPROVED" | "CAUTION" | "DENIED" =
    amount > dailySafe * 2 ? "DENIED" : amount > dailySafe ? "CAUTION" : "APPROVED";

  return {
    verdict,
    headline:
      verdict === "DENIED"
        ? `🚨 Hold up, Bhai! Spending ₹${amount} will burn ${daysImpact} days of your runway.`
        : verdict === "CAUTION"
        ? `⚠️ Caution: ₹${amount} eats ${daysImpact} days of your safe headroom.`
        : `✅ Safe to Scan: ₹${amount} is within your ₹${dailySafe}/day safe limit.`,
    seniorBhaiResponse: `Listen junior, you have ₹${Math.round(dailySafe * daysLeft)} left for the next ${daysLeft} days (₹${dailySafe}/day).\n\nSpending ₹${amount} right now reduces your daily allowance down to ₹${newSafe}/day.\n\nThat ₹${amount} represents ${Math.round((amount / primaryGoal.targetAmount) * 100)}% of your **${primaryGoal.title}** jar. Don't let a momentary impulse delay your end-of-semester freedom!`,
    budgetImpactDays: daysImpact,
    dailySafeReduction: diff,
    opportunityCostGoal: {
      goalId: primaryGoal.id,
      goalTitle: primaryGoal.title,
      delayDays: Math.ceil(amount / Math.max(dailySafe, 50)),
      equivalentMilestone: `${Math.round((amount / primaryGoal.targetAmount) * 100)}% of your ${primaryGoal.title} target`,
    },
    smartSeniorHacks: [
      "Wait 15 minutes before scanning the merchant QR.",
      "Ask yourself: will you remember this purchase in 5 days?",
      "Click 'Skip & Save' to transfer this directly to your goal jar!"
    ],
    recalledMemories: [
      `Daily Safe Limit: ₹${dailySafe}/day`,
      `Days Remaining: ${daysLeft} days`,
      `Primary Goal: ${primaryGoal.title}`,
      "⚡ Instant Pre-Computed Response (Rate-Limit Proof)"
    ],
  };
}

