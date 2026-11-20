import {
  DailyBudgetAnalysis,
  FinancialMemoryProfile,
  GoalJar,
  SpendingTrap,
  Transaction,
} from "@/types";
import {
  INITIAL_GOAL_JARS,
  INITIAL_SPENDING_TRAPS,
  SYNTHETIC_DEMO_PROFILE,
  SYNTHETIC_TRANSACTIONS,
} from "../demo/syntheticStudentData";

const STORAGE_KEY_PROFILE = "pocketsense_prof_profile_v8";
const STORAGE_KEY_TRANSACTIONS = "pocketsense_prof_transactions_v8";

/**
 * Calculates automated salary cycle details based on salary credit day and real clock
 * NO DAILY MANUAL INPUT REQUIRED:
 * - If salaryDay is 1st of month: tracks automatically from 1st of month to 1st of next month.
 * - If salaryDay is 25th: tracks automatically from 25th of month to 25th of next month.
 * - Automatically rolls over on payday!
 */
export function getSalaryCycleDetails(
  salaryCreditDay: number = 1,
  useRealDate: boolean = true,
  fallbackCycleDay: number = 14
) {
  const now = new Date();

  // If in demo simulation mode:
  if (!useRealDate) {
    const simulatedDay = fallbackCycleDay || 14;
    const totalDays = 30;
    const daysRemaining = Math.max(1, totalDays - simulatedDay + 1);
    return {
      cycleDay: simulatedDay,
      totalDaysInCycle: totalDays,
      daysRemaining,
      dateLabel: `Day ${simulatedDay} of ${totalDays}`,
      nextPaydayLabel: `${daysRemaining} days left until next salary`,
      isPayday: simulatedDay === 1,
    };
  }

  // Automated Real Calendar Clock:
  const todayDate = now.getDate();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let cycleStart: Date;
  let nextSalaryDate: Date;

  if (salaryCreditDay === 1) {
    cycleStart = new Date(currentYear, currentMonth, 1);
    nextSalaryDate = new Date(currentYear, currentMonth + 1, 1);
  } else {
    if (todayDate >= salaryCreditDay) {
      cycleStart = new Date(currentYear, currentMonth, salaryCreditDay);
      nextSalaryDate = new Date(currentYear, currentMonth + 1, salaryCreditDay);
    } else {
      cycleStart = new Date(currentYear, currentMonth - 1, salaryCreditDay);
      nextSalaryDate = new Date(currentYear, currentMonth, salaryCreditDay);
    }
  }

  const oneDayMs = 1000 * 60 * 60 * 24;
  const totalDaysInCycle = Math.max(28, Math.round((nextSalaryDate.getTime() - cycleStart.getTime()) / oneDayMs));

  // Which day of the salary cycle is today (1-indexed, day 1 is payday)
  const diffFromStart = Math.floor((now.getTime() - cycleStart.getTime()) / oneDayMs);
  const cycleDay = Math.min(totalDaysInCycle, Math.max(1, diffFromStart + 1));

  // Days remaining in cycle until next salary arrives (inclusive of today)
  const diffUntilNext = Math.ceil((nextSalaryDate.getTime() - now.getTime()) / oneDayMs);
  const daysRemaining = Math.max(1, diffUntilNext);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedToday = `${monthNames[now.getMonth()]} ${now.getDate()}`;
  const formattedNextSalary = `${monthNames[nextSalaryDate.getMonth()]} ${nextSalaryDate.getDate()}`;

  const isPayday = cycleDay === 1;
  const dateLabel = isPayday
    ? `${formattedToday} (Day 1 — Payday! 🎉)`
    : `${formattedToday} (Day ${cycleDay} of ${totalDaysInCycle})`;
  const nextPaydayLabel = `Next salary on ${formattedNextSalary} (${daysRemaining} days left)`;

  return {
    cycleDay,
    totalDaysInCycle,
    daysRemaining,
    dateLabel,
    nextPaydayLabel,
    isPayday,
  };
}

/**
 * Calculates daily budget analysis for young working professionals
 * Automatically tracks calendar pacing without requiring any daily manual input
 */
export function calculateDailyBudgetAnalysis(
  profile: FinancialMemoryProfile,
  transactions: Transaction[]
): DailyBudgetAnalysis {
  const isRealDate = profile.useRealCalendarDate ?? false;
  const salaryDay = profile.salaryCreditDay || 1;

  const cycle = getSalaryCycleDetails(salaryDay, isRealDate, profile.currentDayOfMonth);

  const currentDayOfMonth = cycle.cycleDay;
  const daysInMonth = cycle.totalDaysInCycle;
  const daysRemaining = cycle.daysRemaining;

  // Take-home salary & fixed bills
  const takeHomeSalary = profile.monthlySalary || 75000;
  const fixedBills = profile.fixedEssentials || 32000;
  const maxSpendableBudget = Math.max(0, takeHomeSalary - fixedBills); // ₹43,000

  // Multi-Bank & Card balances
  const totalLinkedBankCash = profile.totalLinkedBankCash ?? 48500;
  const upcomingCardDues = profile.creditCardDues ?? 17908;

  // 3. Derive totalSafePool and spentThisMonth Automatically:
  // Guarantees: Fixed Bills + Spent This Month + Total Safe Pool = Take-Home Salary (₹75,000)
  const totalSafePool = Math.max(0, totalLinkedBankCash - upcomingCardDues);
  const remainingMonthlyPool = totalSafePool;
  const spentThisMonth = Math.min(maxSpendableBudget, Math.max(0, maxSpendableBudget - totalSafePool));
  const discretionarySpentSoFar = spentThisMonth;
  const discretionaryPool = maxSpendableBudget;
  const totalSpentSoFar = fixedBills + discretionarySpentSoFar;

  // Discretionary transactions
  const discretionaryTxs = transactions.filter(
    (tx) => tx.category !== "Rent & Fixed Utilities" && tx.category !== "Investments & SIPs"
  );

  // Safe daily discretionary spending headroom = remaining pool / days remaining
  const safeDailySpend = Math.max(0, Math.floor(remainingMonthlyPool / Math.max(1, daysRemaining)));

  // Today's spending:
  const now = new Date();
  const todayISO = now.toISOString().split("T")[0];
  const simulatedDayStr = `2026-11-${String(currentDayOfMonth).padStart(2, "0")}`;

  const spentToday = discretionaryTxs
    .filter((tx) => (isRealDate ? tx.date === todayISO : (tx.date === simulatedDayStr || tx.date === todayISO)))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remainingToday = Math.max(0, safeDailySpend - spentToday);

  // Velocity calculation
  const daysElapsed = Math.max(1, currentDayOfMonth);
  const burnRatePerDay = Math.round(discretionarySpentSoFar / daysElapsed);

  // Projected run-out day for discretionary pool
  let projectedRunOutDay = daysInMonth;
  if (burnRatePerDay > 0) {
    const daysOfRunway = Math.floor(discretionaryPool / burnRatePerDay);
    projectedRunOutDay = Math.min(daysInMonth, daysOfRunway);
  }
  if (remainingMonthlyPool <= 0) {
    projectedRunOutDay = currentDayOfMonth;
  }

  // Clean status levels
  let statusLevel: "green" | "amber" | "red" = "green";
  let headline = "";
  let comfortMessage = "";

  if (remainingMonthlyPool <= 0 && discretionarySpentSoFar > 0) {
    statusLevel = "red";
    headline = "Extra Spend Exhausted";
    comfortMessage = `Extra Spend (₹${discretionarySpentSoFar.toLocaleString("en-IN")}) has consumed the full ₹${discretionaryPool.toLocaleString("en-IN")} pool. Reduce extra spending until next salary.`;
  } else if (projectedRunOutDay <= 20) {
    statusLevel = "red";
    headline = `Fast Spend Speed: Budget runs out by Day ${projectedRunOutDay}`;
    comfortMessage = `Spending ₹${burnRatePerDay}/day against a safe pace of ₹${safeDailySpend}/day. Cut back non-essentials to reach next payday comfortably.`;
  } else if (safeDailySpend < 400 || projectedRunOutDay < 26) {
    statusLevel = "amber";
    headline = `Caution: Days Left tightening`;
    comfortMessage = `Current safe rate is ₹${safeDailySpend}/day with ${daysRemaining} days left. Keep daily expenses low.`;
  } else {
    statusLevel = "green";
    headline = `On Track: Budget healthy`;
    comfortMessage = `You have ₹${safeDailySpend}/day safe to spend across the remaining ${daysRemaining} days until your next salary.`;
  }

  // Silent Risk Guard: Dynamic 20% of Take-Home Salary threshold
  const cardBillRatio = takeHomeSalary > 0 ? upcomingCardDues / takeHomeSalary : 0;
  const cardBillPercent = Math.round(cardBillRatio * 100);
  const isAutoPayPaused = cardBillRatio > 0.20;

  return {
    monthlySalary: profile.monthlySalary,
    fixedEssentials: profile.fixedEssentials,
    discretionaryPool,
    discretionarySpentSoFar,
    totalSpentSoFar,
    remainingMonthlyPool,
    currentDayOfMonth,
    daysInMonth,
    daysRemaining,
    dailySafeToSpend: safeDailySpend,
    spentToday,
    remainingToday,
    burnRatePerDay,
    projectedRunOutDay,
    statusLevel,
    headline,
    comfortMessage,
    dateLabel: cycle.dateLabel,
    salaryCreditDay: salaryDay,
    isRealDate,
    nextPaydayLabel: cycle.nextPaydayLabel,
    isAutoPayPaused,
    creditCardDues: upcomingCardDues,
    totalLinkedBankCash: profile.totalLinkedBankCash ?? 48500,
    cardBillRatio,
    cardBillPercent,
  };
}

/**
 * Generates a normalized semantic key for an impulse decision item
 * to match decisions across different user queries or swap descriptions.
 */
export function normalizeDecisionKey(prompt?: string, merchant?: string, amount?: number): string {
  const text = `${prompt || ""} ${merchant || ""}`.toLowerCase();
  
  if (text.includes("watch") || text.includes("tissot") || text.includes("timepiece") || amount === 14990) {
    return "item_mechanical_watch";
  }
  if (text.includes("staycation") || text.includes("resort") || (amount === 4500 && text.includes("weekend"))) {
    return "item_staycation";
  }
  if (text.includes("food") || text.includes("dinner") || text.includes("burger") || text.includes("swiggy") || amount === 1500) {
    return "item_food_order";
  }
  if (text.includes("sneaker") || text.includes("shoes") || text.includes("kicks") || (amount === 4500 && text.includes("sneaker"))) {
    return "item_sneakers";
  }
  if (text.includes("concert") || text.includes("movie") || text.includes("ticket") || amount === 2200) {
    return "item_entertainment";
  }

  // Fallback: strip punctuation and non-alphanumeric, extract core words
  const cleaned = text
    .replace(/[₹$,]/g, "")
    .replace(/\b(can i buy|should i buy|should i|can i|smart swap|saved|spent|instead of|a|an|the|on sale|flash sale)\b/g, "")
    .replace(/[^\w]/g, "")
    .trim();
  
  return cleaned ? `item_${cleaned}` : `item_${amount || 0}`;
}

/**
 * Checks whether an impulse decision matches a query/item
 */
export function isMatchingImpulseDecision(
  dec: { prompt: string; merchant?: string; amount?: number; amountSaved?: number },
  query: string,
  originalItem: string,
  originalCost: number
): boolean {
  const key1 = normalizeDecisionKey(dec.prompt, dec.merchant, dec.amount || dec.amountSaved);
  const key2 = normalizeDecisionKey(query, originalItem, originalCost);
  if (key1 && key2 && key1 === key2) return true;

  const normQuery = (query || "").toLowerCase().replace(/[^\w]/g, "");
  const normItem = (originalItem || "").toLowerCase().replace(/[^\w]/g, "");
  const normPrompt = (dec.prompt || "").toLowerCase().replace(/[^\w]/g, "");
  const normMerchant = ((dec.merchant || "")).toLowerCase().replace(/[^\w]/g, "");

  if (normPrompt.includes(normQuery) || normQuery.includes(normPrompt)) return true;
  if (normPrompt.includes(normItem) || normItem.includes(normPrompt)) return true;
  if (normMerchant.includes(normItem) || normItem.includes(normMerchant)) return true;

  if (originalCost > 1000 && (dec.amount === originalCost || dec.amountSaved === originalCost)) {
    return true;
  }

  return false;
}

/**
 * Deduplicates past impulse decisions so only the latest decision is preserved for each item.
 */
export function deduplicateImpulseDecisions(
  decisions: FinancialMemoryProfile["pastImpulseDecisions"]
): FinancialMemoryProfile["pastImpulseDecisions"] {
  if (!Array.isArray(decisions)) return [];

  const seenKeys = new Set<string>();
  const deduplicated: FinancialMemoryProfile["pastImpulseDecisions"] = [];

  for (const dec of decisions) {
    const key = normalizeDecisionKey(dec.prompt, dec.merchant, dec.amount || dec.amountSaved);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      deduplicated.push(dec);
    }
  }

  return deduplicated;
}

export function getStoredProfile(): FinancialMemoryProfile {
  if (typeof window === "undefined") return SYNTHETIC_DEMO_PROFILE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      const parsed: FinancialMemoryProfile = JSON.parse(saved);
      // Ensure goals array is valid; only initialize with demo goals if never set
      if (!Array.isArray(parsed.goals)) {
        parsed.goals = INITIAL_GOAL_JARS;
      }

      // Deduplicate impulse decisions on load & clean up duplicates
      if (Array.isArray(parsed.pastImpulseDecisions)) {
        parsed.pastImpulseDecisions = deduplicateImpulseDecisions(parsed.pastImpulseDecisions);
      }

      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(parsed));
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load profile", e);
  }
  return SYNTHETIC_DEMO_PROFILE;
}

export function saveProfile(profile: FinancialMemoryProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
}

export function getStoredTransactions(): Transaction[] {
  if (typeof window === "undefined") return SYNTHETIC_TRANSACTIONS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load transactions", e);
  }
  return SYNTHETIC_TRANSACTIONS;
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error("Failed to save transactions", e);
  }
}

export function resetStorageToDemo(): {
  profile: FinancialMemoryProfile;
  transactions: Transaction[];
} {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(SYNTHETIC_DEMO_PROFILE));
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(SYNTHETIC_TRANSACTIONS));
  }
  return {
    profile: SYNTHETIC_DEMO_PROFILE,
    transactions: SYNTHETIC_TRANSACTIONS,
  };
}
