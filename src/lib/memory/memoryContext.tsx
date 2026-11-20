"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  DailyBudgetAnalysis,
  FinancialMemoryProfile,
  GoalJar,
  Transaction,
} from "@/types";
import {
  calculateDailyBudgetAnalysis,
  deduplicateImpulseDecisions,
  getStoredProfile,
  getStoredTransactions,
  isMatchingImpulseDecision,
  resetStorageToDemo,
  saveProfile,
  saveTransactions,
} from "./memoryStore";
import { SYNTHETIC_DEMO_PROFILE, SYNTHETIC_TRANSACTIONS } from "../demo/syntheticStudentData";

interface FinancialMemoryContextType {
  profile: FinancialMemoryProfile;
  transactions: Transaction[];
  analysis: DailyBudgetAnalysis;
  isLoaded: boolean;
  demoMode: boolean;
  toggleDemoMode: (val?: boolean) => void;
  loadSyntheticDemo: () => void;
  clearAllData: () => void;
  addTransaction: (tx: Transaction) => void;
  addBatchTransactions: (txs: Transaction[]) => void;
  deleteTransaction: (id: string) => void;
  claimSavings: (goalId: string, amount: number, promptText?: string) => void;
  isAutoPayPaused: boolean;
  toggleAutoPayPause: (val?: boolean) => void;
  recordSmartSwap: (params: {
    goalId: string;
    originalCost: number;
    swapCost: number;
    savedDifference: number;
    originalItem: string;
    swapTitle: string;
    query?: string;
    isPaused?: boolean;
  }) => { oldAmountSaved: number; netAdjustment: number; newTotalSwept: number };
  updateSalary: (
    monthlySalary: number,
    fixedEssentials: number,
    salaryCreditDay?: number,
    useRealDate?: boolean,
    resetLedger?: boolean
  ) => void;
  addGoalJar: (goal: Omit<GoalJar, "id" | "totalSavedFromNudges">) => void;
  updateGoalJar: (goal: GoalJar) => void;
  deleteGoalJar: (id: string) => void;
  getAiPromptContext: () => string;
}

const FinancialMemoryContext = createContext<FinancialMemoryContextType | undefined>(undefined);

export function FinancialMemoryProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<FinancialMemoryProfile>(SYNTHETIC_DEMO_PROFILE);
  const [transactions, setTransactions] = useState<Transaction[]>(SYNTHETIC_TRANSACTIONS);
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedProf = getStoredProfile();
    const storedTxs = getStoredTransactions();
    const savedDemoMode = localStorage.getItem("pocketsense_demo_mode");
    if (savedDemoMode !== null) {
      setDemoMode(savedDemoMode === "true");
    }
    setProfile(storedProf);
    setTransactions(storedTxs);
    setIsLoaded(true);
  }, []);

  const analysis = calculateDailyBudgetAnalysis(profile, transactions);

  useEffect(() => {
    if (!isLoaded) return;
    saveProfile(profile);
  }, [profile, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveTransactions(transactions);
  }, [transactions, isLoaded]);

  const toggleDemoMode = (val?: boolean) => {
    setDemoMode((prev) => {
      const nextVal = typeof val === "boolean" ? val : !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("pocketsense_demo_mode", String(nextVal));
      }
      return nextVal;
    });
  };

  const loadSyntheticDemo = () => {
    const demo = resetStorageToDemo();
    setProfile({ ...demo.profile });
    setTransactions([...demo.transactions]);
  };

  const clearAllData = () => {
    const emptyProfile: FinancialMemoryProfile = {
      ...SYNTHETIC_DEMO_PROFILE,
      monthlySalary: 75000,
      fixedEssentials: 32000,
      disciplineStreak: 0,
      totalSavedToJars: 0,
      pastImpulseDecisions: [],
      goals: SYNTHETIC_DEMO_PROFILE.goals.map((g) => ({
        ...g,
        currentAmount: 0,
        totalSavedFromNudges: 0,
      })),
    };
    setProfile(emptyProfile);
    setTransactions([]);
    saveProfile(emptyProfile);
    saveTransactions([]);
  };

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);

    setProfile((prev) => {
      const updatedKnown = {
        ...prev.knownMerchants,
        [tx.merchant]: { category: tx.category, type: tx.spendingType },
      };

      let streak = prev.disciplineStreak;
      if (tx.spendingType === "Impulse Want" && tx.amount > 1000) {
        streak = Math.max(0, streak - 1);
      }

      return {
        ...prev,
        knownMerchants: updatedKnown,
        disciplineStreak: streak,
      };
    });
  };

  const addBatchTransactions = (newTxs: Transaction[]) => {
    setTransactions((prev) => [...newTxs, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const claimSavings = (goalId: string, amount: number, promptText?: string) => {
    if (amount <= 0) return;

    setProfile((prev) => {
      const updatedGoals = prev.goals.map((goal) => {
        if (goal.id === goalId) {
          return {
            ...goal,
            currentAmount: goal.currentAmount + amount,
            totalSavedFromNudges: goal.totalSavedFromNudges + amount,
            lastUpdated: new Date().toISOString(),
          };
        }
        return goal;
      });

      const newDecision = {
        id: "dec_" + Date.now(),
        timestamp: new Date().toISOString(),
        prompt: promptText || `Saved ₹${amount} from impulse spend`,
        amount,
        merchant: "Intercepted Impulse",
        verdict: "BLOCKED" as const,
        actionTaken: "skipped_and_saved" as const,
        amountSaved: amount,
        targetGoalJarId: goalId,
      };

      const updatedDecisions = deduplicateImpulseDecisions([newDecision, ...prev.pastImpulseDecisions]);

      return {
        ...prev,
        goals: updatedGoals,
        totalSavedToJars: prev.totalSavedToJars + amount,
        disciplineStreak: prev.disciplineStreak + 1,
        pastImpulseDecisions: updatedDecisions,
      };
    });
  };

  const isAutoPayPaused = analysis.isAutoPayPaused;

  const toggleAutoPayPause = (val?: boolean) => {
    setProfile((prev) => ({
      ...prev,
      isAutoPayPaused: typeof val === "boolean" ? val : !prev.isAutoPayPaused,
    }));
  };

  const recordSmartSwap = ({
    goalId,
    originalCost,
    swapCost,
    savedDifference,
    originalItem,
    swapTitle,
    query,
    isPaused,
  }: {
    goalId: string;
    originalCost: number;
    swapCost: number;
    savedDifference: number;
    originalItem: string;
    swapTitle: string;
    query?: string;
    isPaused?: boolean;
  }) => {
    const paused = typeof isPaused === "boolean" ? isPaused : isAutoPayPaused;
    let oldAmountSaved = 0;
    let netAdjustment = paused ? 0 : savedDifference;
    let newTotal = 0;

    // 1. Deduct swapCost from Safe Pool & add to Spent This Month via real transaction
    const swapTx: Transaction = {
      id: "tx_swap_" + Date.now(),
      merchant: `Smart Swap: ${swapTitle}`,
      amount: swapCost,
      date: new Date().toISOString().split("T")[0],
      category: "Shopping & Gear",
      spendingType: "Impulse Want",
      upiRef: "SWAP" + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: "UPI Smart Swap",
      triggerTag: "smart-swap-accepted",
      rawSms: `[Smart Swap Accepted] Paid Rs. ${swapCost} instead of full Rs. ${originalCost}`,
    };

    setTransactions((prev) => {
      const filtered = prev.filter((t) => {
        if (t.triggerTag === "smart-swap-accepted" || t.triggerTag === "full-spend-proceeded") {
          return !isMatchingImpulseDecision(
            { prompt: t.merchant, amount: t.amount },
            query || originalItem,
            originalItem,
            originalCost
          );
        }
        return true;
      });
      return [swapTx, ...filtered];
    });

    // 2. Recompute Goal Jar & Total Swept:
    // If paused, do not sweep money out of Safe Pool into Goal Jar; keep savedDifference inside Safe Pool as buffer.
    setProfile((prev) => {
      const existingDecisions = prev.pastImpulseDecisions || [];
      const matchingIdx = existingDecisions.findIndex((dec) =>
        isMatchingImpulseDecision(dec, query || originalItem, originalItem, originalCost)
      );

      let remainingDecisions = [...existingDecisions];
      if (matchingIdx !== -1) {
        const prevDec = existingDecisions[matchingIdx];
        oldAmountSaved = prevDec.amountSaved || prevDec.amount;
        // If previous decision was swept to goals, reverse it
        netAdjustment = paused ? -oldAmountSaved : savedDifference - oldAmountSaved;
        remainingDecisions.splice(matchingIdx, 1);
      } else {
        oldAmountSaved = 0;
        netAdjustment = paused ? 0 : savedDifference;
      }

      const newDecision = {
        id: "dec_swap_" + Date.now(),
        timestamp: new Date().toISOString(),
        prompt: query || `Smart Swap: ${originalItem} (₹${originalCost.toLocaleString("en-IN")})`,
        amount: originalCost,
        merchant: `Smart Swap: ${swapTitle}`,
        verdict: "BLOCKED" as const,
        actionTaken: "skipped_and_saved" as const,
        amountSaved: savedDifference,
        targetGoalJarId: paused ? undefined : goalId,
        isSafePoolBuffer: paused,
      };

      const updatedDecisions = deduplicateImpulseDecisions([newDecision, ...remainingDecisions]);

      const updatedGoals = prev.goals.map((goal) => {
        if (goal.id === goalId || (goal.title.toLowerCase().includes("iphone") && goalId.includes("iphone"))) {
          return {
            ...goal,
            currentAmount: Math.max(0, goal.currentAmount + netAdjustment),
            totalSavedFromNudges: Math.max(0, goal.totalSavedFromNudges + netAdjustment),
            lastUpdated: new Date().toISOString(),
          };
        }
        return goal;
      });

      newTotal = Math.max(0, prev.totalSavedToJars + netAdjustment);

      const updatedProfile = {
        ...prev,
        goals: updatedGoals,
        totalSavedToJars: newTotal,
        pastImpulseDecisions: updatedDecisions,
      };

      saveProfile(updatedProfile);
      return updatedProfile;
    });

    return { oldAmountSaved, netAdjustment, newTotalSwept: newTotal };
  };

  const updateSalary = (
    monthlySalary: number,
    fixedEssentials: number,
    salaryCreditDay?: number,
    useRealDate?: boolean,
    resetLedger?: boolean
  ) => {
    if (resetLedger) {
      setTransactions([]);
      saveTransactions([]);
    }

    setProfile((prev) => {
      const nextUseRealDate = typeof useRealDate === "boolean" ? useRealDate : true;
      const nextSalaryCreditDay = typeof salaryCreditDay === "number" ? salaryCreditDay : (prev.salaryCreditDay || 1);

      return {
        ...prev,
        monthlySalary,
        fixedEssentials,
        salaryCreditDay: nextSalaryCreditDay,
        useRealCalendarDate: nextUseRealDate,
      };
    });
  };

  const addGoalJar = (goalData: Omit<GoalJar, "id" | "totalSavedFromNudges">) => {
    const newJar: GoalJar = {
      ...goalData,
      id: "goal_" + Date.now(),
      totalSavedFromNudges: 0,
      lastUpdated: new Date().toISOString(),
    };
    setProfile((prev) => {
      const existing = Array.isArray(prev.goals) ? prev.goals : [];
      const updatedGoals = [...existing, newJar];
      const updatedProfile = { ...prev, goals: updatedGoals };
      saveProfile(updatedProfile);
      return updatedProfile;
    });
  };

  const updateGoalJar = (updatedGoal: GoalJar) => {
    setProfile((prev) => {
      const existing = Array.isArray(prev.goals) ? prev.goals : [];
      const updatedGoals = existing.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
      const updatedProfile = { ...prev, goals: updatedGoals };
      saveProfile(updatedProfile);
      return updatedProfile;
    });
  };

  const deleteGoalJar = (id: string) => {
    setProfile((prev) => {
      const existing = Array.isArray(prev.goals) ? prev.goals : [];
      const updatedGoals = existing.filter((g) => g.id !== id);
      const updatedProfile = { ...prev, goals: updatedGoals };
      saveProfile(updatedProfile);
      return updatedProfile;
    });
  };

  const getAiPromptContext = (): string => {
    const { dailySafeToSpend, remainingMonthlyPool, daysRemaining, projectedRunOutDay, statusLevel } = analysis;
    const goalsSummary = profile.goals
      .map(
        (g) =>
          `- ${g.title}: ₹${g.currentAmount} / ₹${g.targetAmount} (${Math.round((g.currentAmount / g.targetAmount) * 100)}%)`
      )
      .join("\n");

    const trapsSummary = profile.activeTraps
      .map((t) => `- ${t.title}: ${t.pattern} (~₹${t.estimatedMonthlyBurn}/mo)`)
      .join("\n");

    return `
=== USER FINANCIAL MEMORY PROFILE ===
Professional: ${profile.userName} (${profile.role})
Monthly Take-Home: ₹${profile.monthlySalary}
Fixed Bills: ₹${profile.fixedEssentials} (Rent, SIPs, Utilities)
Day of Month: Day ${profile.currentDayOfMonth} / 30
Remaining Extra Spend: ₹${remainingMonthlyPool}
Days Left: ${daysRemaining} days
Current Safe Extra Spend: ₹${dailySafeToSpend} / day
Projected Cash Left End: Day ${projectedRunOutDay} (Status: ${statusLevel.toUpperCase()})
Discipline Streak: ${profile.disciplineStreak} days
Total Diverted to Wealth Jars: ₹${profile.totalSavedToJars}

ACTIVE GOAL JARS:
${goalsSummary}

SPENDING PATTERNS & HABITS:
${trapsSummary}

VULNERABILITY ZONES:
${profile.vulnerabilityZones.map((z) => `- ${z}`).join("\n")}
`;
  };

  return (
    <FinancialMemoryContext.Provider
      value={{
        profile,
        transactions,
        analysis,
        isLoaded,
        demoMode,
        toggleDemoMode,
        loadSyntheticDemo,
        clearAllData,
        addTransaction,
        addBatchTransactions,
        deleteTransaction,
        claimSavings,
        recordSmartSwap,
        isAutoPayPaused,
        toggleAutoPayPause,
        updateSalary,
        addGoalJar,
        updateGoalJar,
        deleteGoalJar,
        getAiPromptContext,
      }}
    >
      {children}
    </FinancialMemoryContext.Provider>
  );
}

export function useFinancialMemory() {
  const context = useContext(FinancialMemoryContext);
  if (!context) {
    throw new Error("useFinancialMemory must be used within a FinancialMemoryProvider");
  }
  return context;
}
