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
  getStoredProfile,
  getStoredTransactions,
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
  updateAllowance: (monthlyAllowance: number, fixedEssentials: number) => void;
  addGoalJar: (goal: Omit<GoalJar, "id" | "totalSavedFromNudges">) => void;
  updateGoalJar: (goal: GoalJar) => void;
  deleteGoalJar: (id: string) => void;
  getAiPromptContext: () => string;
}

const FinancialMemoryContext = createContext<FinancialMemoryContextType | undefined>(undefined);

export function FinancialMemoryProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<FinancialMemoryProfile>(SYNTHETIC_DEMO_PROFILE);
  const [transactions, setTransactions] = useState<Transaction[]>(SYNTHETIC_TRANSACTIONS);
  const [demoMode, setDemoMode] = useState<boolean>(true); // Default to True for hackathon rate-limit safety!
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
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

  const toggleDemoMode = (val?: boolean) => {
    setDemoMode((prev) => {
      const nextVal = typeof val === "boolean" ? val : !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("pocketsense_demo_mode", String(nextVal));
      }
      return nextVal;
    });
  };

  // Compute live analysis
  const analysis = calculateDailyBudgetAnalysis(profile, transactions);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    saveProfile(profile);
  }, [profile, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    saveTransactions(transactions);
  }, [transactions, isLoaded]);

  // Load synthetic student dataset
  const loadSyntheticDemo = () => {
    const demo = resetStorageToDemo();
    setProfile({ ...demo.profile });
    setTransactions([...demo.transactions]);
  };

  // Clear all data
  const clearAllData = () => {
    const emptyProfile: FinancialMemoryProfile = {
      ...SYNTHETIC_DEMO_PROFILE,
      monthlyAllowance: 6000,
      fixedEssentials: 1400,
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

  // Add a single transaction
  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);

    // Update known merchants and memory
    setProfile((prev) => {
      const updatedKnown = {
        ...prev.knownMerchants,
        [tx.merchant]: { category: tx.category, type: tx.spendingType },
      };

      // If impulse want, decrease streak or track trap
      let streak = prev.disciplineStreak;
      if (tx.spendingType === "Impulse Want" && tx.amount > 200) {
        streak = Math.max(0, streak - 1);
      }

      return {
        ...prev,
        knownMerchants: updatedKnown,
        disciplineStreak: streak,
      };
    });
  };

  // Add multiple transactions (e.g. from SMS batch parse or CSV)
  const addBatchTransactions = (newTxs: Transaction[]) => {
    setTransactions((prev) => [...newTxs, ...prev]);
  };

  // Delete a transaction
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Intercept & Claim Savings into Goal Jar
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

      return {
        ...prev,
        goals: updatedGoals,
        totalSavedToJars: prev.totalSavedToJars + amount,
        disciplineStreak: prev.disciplineStreak + 1,
        pastImpulseDecisions: [newDecision, ...prev.pastImpulseDecisions],
      };
    });
  };

  // Update budget parameters
  const updateAllowance = (monthlyAllowance: number, fixedEssentials: number) => {
    setProfile((prev) => ({
      ...prev,
      monthlyAllowance,
      fixedEssentials,
    }));
  };

  // Goal jar management
  const addGoalJar = (goalData: Omit<GoalJar, "id" | "totalSavedFromNudges">) => {
    const newJar: GoalJar = {
      ...goalData,
      id: "goal_" + Date.now(),
      totalSavedFromNudges: 0,
      lastUpdated: new Date().toISOString(),
    };
    setProfile((prev) => ({
      ...prev,
      goals: [...prev.goals, newJar],
    }));
  };

  const updateGoalJar = (updatedGoal: GoalJar) => {
    setProfile((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g)),
    }));
  };

  const deleteGoalJar = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  // Format memory context for AI
  const getAiPromptContext = (): string => {
    const { dailySafeToSpend, remainingMonthlyAllowance, daysRemaining, projectedRunOutDay, statusLevel } = analysis;
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
=== STUDENT FINANCIAL MEMORY PROFILE ===
Student: ${profile.studentName} (${profile.collegeYear})
Monthly Allowance: ₹${profile.monthlyAllowance} (credited on 1st)
Fixed Essentials: ₹${profile.fixedEssentials} (Mess + Transit)
Current Day of Month: Day ${profile.currentDayOfMonth} / 30
Remaining Allowance: ₹${remainingMonthlyAllowance}
Days Left: ${daysRemaining} days
Current Safe-to-Spend: ₹${dailySafeToSpend} / day
Projected Run-Out Day: Day ${projectedRunOutDay} (Status: ${statusLevel.toUpperCase()})
Discipline Streak: ${profile.disciplineStreak} days
Total Diverted to Goal Jars: ₹${profile.totalSavedToJars}

ACTIVE GOAL JARS:
${goalsSummary}

DOCUMENTED SPENDING TRAPS & TRIGGERS:
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
        updateAllowance,
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

