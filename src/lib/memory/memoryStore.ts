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

const STORAGE_KEY_PROFILE = "pocketsense_prof_profile_v3";
const STORAGE_KEY_TRANSACTIONS = "pocketsense_prof_transactions_v3";

/**
 * Calculates daily discretionary budget analysis for young working professionals
 * Dynamically factors in real calendar dates or simulated cycle day
 */
export function calculateDailyBudgetAnalysis(
  profile: FinancialMemoryProfile,
  transactions: Transaction[]
): DailyBudgetAnalysis {
  const now = new Date();
  const realDay = now.getDate();
  const realDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // If useRealCalendarDate is enabled, use real calendar day; otherwise use profile setting (default 14 in demo)
  const isRealDate = profile.useRealCalendarDate ?? false;
  const currentDayOfMonth = isRealDate ? realDay : (profile.currentDayOfMonth || 14);
  const daysInMonth = isRealDate ? realDaysInMonth : (profile.daysInMonth || 30);

  // Remaining days in month until next payday (inclusive of today)
  // e.g. Day 16 of 30 => (30 - 16 + 1) = 15 days remaining
  const daysRemaining = Math.max(1, daysInMonth - currentDayOfMonth + 1);

  // Discretionary pool = Salary - Fixed Essentials (Rent, SIPs, Utilities)
  const discretionaryPool = Math.max(0, profile.monthlySalary - profile.fixedEssentials);

  // Discretionary transactions (exclude rent and SIP investments already accounted for in fixedEssentials)
  const discretionaryTxs = transactions.filter(
    (tx) => tx.category !== "Rent & Fixed Utilities" && tx.category !== "Investments & SIPs"
  );

  const discretionarySpentSoFar = discretionaryTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpentSoFar = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Remaining discretionary pool = pool - spent so far
  const remainingMonthlyPool = Math.max(0, discretionaryPool - discretionarySpentSoFar);

  // Safe daily discretionary spending headroom = remaining pool / days remaining
  const safeDailySpend = Math.max(0, Math.floor(remainingMonthlyPool / daysRemaining));

  // Today's spending:
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

  // Date label formatted nicely
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthName = isRealDate ? monthNames[now.getMonth()] : "Nov";
  const dateLabel = `${currentMonthName} ${currentDayOfMonth} (Day ${currentDayOfMonth} of ${daysInMonth})`;

  // Clean status levels
  let statusLevel: "green" | "amber" | "red" = "green";
  let headline = "";
  let comfortMessage = "";

  if (remainingMonthlyPool <= 0 && discretionarySpentSoFar > 0) {
    statusLevel = "red";
    headline = "Discretionary Capital Exhausted";
    comfortMessage = `Discretionary spend (₹${discretionarySpentSoFar.toLocaleString("en-IN")}) has consumed the full ₹${discretionaryPool.toLocaleString("en-IN")} pool. Clear transactions or increase salary allocation in Settings.`;
  } else if (projectedRunOutDay <= 20) {
    statusLevel = "red";
    headline = `Month-End Squeeze: Discretionary pool exhausts by Day ${projectedRunOutDay}`;
    comfortMessage = `Burning ₹${burnRatePerDay}/day against a sustainable limit of ₹${safeDailySpend}/day. Intercept impulse checkouts to maintain your savings rate.`;
  } else if (safeDailySpend < 400 || projectedRunOutDay < 26) {
    statusLevel = "amber";
    headline = `Caution: Runway tightening to Day ${projectedRunOutDay}`;
    comfortMessage = `Current safe rate is ₹${safeDailySpend}/day with ${daysRemaining} days left. Large weekend outings could compress your month-end flexibility.`;
  } else {
    statusLevel = "green";
    headline = `Optimal Velocity: Cash flow on track`;
    comfortMessage = `You have ₹${safeDailySpend}/day across the remaining ${daysRemaining} days in the cycle while fully protecting rent and SIP investments.`;
  }

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
    dateLabel,
    isRealDate,
  };
}

export function getStoredProfile(): FinancialMemoryProfile {
  if (typeof window === "undefined") return SYNTHETIC_DEMO_PROFILE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) return JSON.parse(saved);
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
