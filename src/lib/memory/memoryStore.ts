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

const STORAGE_KEY_PROFILE = "pocketsense_financial_memory_profile_v1";
const STORAGE_KEY_TRANSACTIONS = "pocketsense_transactions_v1";

/**
 * Calculates current daily budget analysis based on transactions and profile
 */
export function calculateDailyBudgetAnalysis(
  profile: FinancialMemoryProfile,
  transactions: Transaction[]
): DailyBudgetAnalysis {
  const { monthlyAllowance, fixedEssentials, daysInMonth, currentDayOfMonth } = profile;

  // Total spent across all transactions so far
  const totalSpentSoFar = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Discretionary pool available
  const remainingMonthlyAllowance = Math.max(0, monthlyAllowance - totalSpentSoFar);

  // Days remaining in month (including today)
  const daysRemaining = Math.max(1, daysInMonth - currentDayOfMonth + 1);

  // Safe daily spend for the rest of the month
  // Formula: (Remaining Allowance - any unspent fixed essentials) / daysRemaining
  // In our model, fixed essentials are paid at beginning or tracked
  const safeDailySpend = Math.max(0, Math.floor(remainingMonthlyAllowance / daysRemaining));

  // Today's spending
  const todayStr = new Date().toISOString().split("T")[0];
  const spentToday = transactions
    .filter((tx) => tx.date === todayStr || tx.date === "2026-11-14")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remainingToday = Math.max(0, safeDailySpend - spentToday);

  // Burn rate per day so far
  const daysElapsed = Math.max(1, currentDayOfMonth);
  const burnRatePerDay = Math.round(totalSpentSoFar / daysElapsed);

  // Projected run-out day
  // If burnRatePerDay continues, on what day does money reach 0?
  let projectedRunOutDay = daysInMonth;
  if (burnRatePerDay > 0) {
    const daysOfRunway = Math.floor(monthlyAllowance / burnRatePerDay);
    projectedRunOutDay = Math.min(daysInMonth, daysOfRunway);
  }

  // Status level determination
  let statusLevel: "green" | "amber" | "red" = "green";
  let headline = "";
  let comfortMessage = "";

  if (projectedRunOutDay <= 18) {
    statusLevel = "red";
    headline = `Day 18 Cliff Ahead: Running dry by Day ${projectedRunOutDay}!`;
    comfortMessage = `You're burning ₹${burnRatePerDay}/day against a safe rate of ₹${safeDailySpend}/day. The dreaded college 18th-of-the-month dry spell is 4 days away. Intercept impulses now!`;
  } else if (safeDailySpend < 120 || projectedRunOutDay < 25) {
    statusLevel = "amber";
    headline = `Caution: Runway tightening to Day ${projectedRunOutDay}`;
    comfortMessage = `Safe budget is ₹${safeDailySpend}/day. A single late-night Swiggy order could push you into the red zone.`;
  } else {
    statusLevel = "green";
    headline = `Safe-to-Spend Zone: Runway looks healthy`;
    comfortMessage = `You have ₹${safeDailySpend} safe spending headroom per day. Keep stacking your discipline streak!`;
  }

  return {
    monthlyAllowance,
    fixedEssentials,
    totalSpentSoFar,
    remainingMonthlyAllowance,
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

/**
 * Loads profile from localStorage, falling back to synthetic demo
 */
export function getStoredProfile(): FinancialMemoryProfile {
  if (typeof window === "undefined") return SYNTHETIC_DEMO_PROFILE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load profile from storage", e);
  }
  return SYNTHETIC_DEMO_PROFILE;
}

/**
 * Saves profile to localStorage
 */
export function saveProfile(profile: FinancialMemoryProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile to storage", e);
  }
}

/**
 * Loads transactions from localStorage, falling back to synthetic transactions
 */
export function getStoredTransactions(): Transaction[] {
  if (typeof window === "undefined") return SYNTHETIC_TRANSACTIONS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load transactions from storage", e);
  }
  return SYNTHETIC_TRANSACTIONS;
}

/**
 * Saves transactions to localStorage
 */
export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error("Failed to save transactions to storage", e);
  }
}

/**
 * Resets both profile and transactions to the default synthetic Indian student demo
 */
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

