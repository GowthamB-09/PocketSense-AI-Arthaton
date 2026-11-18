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

const STORAGE_KEY_PROFILE = "pocketsense_prof_profile_v5";
const STORAGE_KEY_TRANSACTIONS = "pocketsense_prof_transactions_v5";

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

  // Clean status levels
  let statusLevel: "green" | "amber" | "red" = "green";
  let headline = "";
  let comfortMessage = "";

  if (remainingMonthlyPool <= 0 && discretionarySpentSoFar > 0) {
    statusLevel = "red";
    headline = "Discretionary Budget Exhausted";
    comfortMessage = `Discretionary spend (₹${discretionarySpentSoFar.toLocaleString("en-IN")}) has consumed the full ₹${discretionaryPool.toLocaleString("en-IN")} pool. Reduce extra spending until next salary.`;
  } else if (projectedRunOutDay <= 20) {
    statusLevel = "red";
    headline = `Pacing Fast: Budget runs out by Day ${projectedRunOutDay}`;
    comfortMessage = `Spending ₹${burnRatePerDay}/day against a safe pace of ₹${safeDailySpend}/day. Cut back non-essentials to reach next payday comfortably.`;
  } else if (safeDailySpend < 400 || projectedRunOutDay < 26) {
    statusLevel = "amber";
    headline = `Caution: Runway tightening`;
    comfortMessage = `Current safe rate is ₹${safeDailySpend}/day with ${daysRemaining} days left. Keep daily expenses low.`;
  } else {
    statusLevel = "green";
    headline = `On Track: Budget healthy`;
    comfortMessage = `You have ₹${safeDailySpend}/day safe to spend across the remaining ${daysRemaining} days until your next salary.`;
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
    dateLabel: cycle.dateLabel,
    salaryCreditDay: salaryDay,
    isRealDate,
    nextPaydayLabel: cycle.nextPaydayLabel,
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
