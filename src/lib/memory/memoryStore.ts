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

const STORAGE_KEY_PROFILE = "pocketsense_prof_profile_v2";
const STORAGE_KEY_TRANSACTIONS = "pocketsense_prof_transactions_v2";

/**
 * Calculates daily discretionary budget analysis for young working professionals
 */
export function calculateDailyBudgetAnalysis(
  profile: FinancialMemoryProfile,
  transactions: Transaction[]
): DailyBudgetAnalysis {
  const { monthlySalary, fixedEssentials, daysInMonth, currentDayOfMonth } = profile;

  // Discretionary pool = Salary - Fixed Essentials (Rent, SIPs, Utilities)
  const discretionaryPool = Math.max(0, monthlySalary - fixedEssentials);

  // Discretionary transactions (exclude rent and SIP investments already accounted for in fixedEssentials)
  const discretionaryTxs = transactions.filter(
    (tx) => tx.category !== "Rent & Fixed Utilities" && tx.category !== "Investments & SIPs"
  );

  const discretionarySpentSoFar = discretionaryTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const totalSpentSoFar = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  const remainingMonthlyPool = Math.max(0, discretionaryPool - discretionarySpentSoFar);
  const daysRemaining = Math.max(1, daysInMonth - currentDayOfMonth + 1);

  // Safe daily discretionary spending headroom
  const safeDailySpend = Math.max(0, Math.floor(remainingMonthlyPool / daysRemaining));

  // Today's spending
  const todayStr = new Date().toISOString().split("T")[0];
  const spentToday = transactions
    .filter((tx) => (tx.date === todayStr || tx.date === "2026-11-14") && tx.category !== "Rent & Fixed Utilities" && tx.category !== "Investments & SIPs")
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

  // Clean status levels
  let statusLevel: "green" | "amber" | "red" = "green";
  let headline = "";
  let comfortMessage = "";

  if (projectedRunOutDay <= 20) {
    statusLevel = "red";
    headline = `Month-End Squeeze: Discretionary pool exhausts by Day ${projectedRunOutDay}`;
    comfortMessage = `Burning ₹${burnRatePerDay}/day against a sustainable limit of ₹${safeDailySpend}/day. Intercept impulse checkouts to maintain your savings rate.`;
  } else if (safeDailySpend < 400 || projectedRunOutDay < 26) {
    statusLevel = "amber";
    headline = `Caution: Runway tightening to Day ${projectedRunOutDay}`;
    comfortMessage = `Current safe rate is ₹${safeDailySpend}/day. Large weekend outings could compress your month-end flexibility.`;
  } else {
    statusLevel = "green";
    headline = `Optimal Velocity: Cash flow on track`;
    comfortMessage = `You have ₹${safeDailySpend}/day in flexible discretionary spending while fully funding your rent and SIP investments.`;
  }

  return {
    monthlySalary,
    fixedEssentials,
    totalSpentSoFar,
    remainingMonthlyPool,
    daysRemaining,
    dailySafeToSpend: safeDailySpend,
    spentToday,
    remainingToday,
    burnRatePerDay,
    projectedRunOutDay,
    statusLevel,
    headline,
    comfortMessage,
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
