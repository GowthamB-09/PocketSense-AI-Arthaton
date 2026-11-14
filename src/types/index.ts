export type SpendingType = "Survival Need" | "Impulse Want" | "Silent Subscription Leak";

export type TransactionCategory =
  | "Food & Dining"
  | "Groceries & Essentials"
  | "Transit & Commute"
  | "Entertainment & Subscriptions"
  | "Shopping & Gear"
  | "Academic & Utilities"
  | "Personal Care & Health"
  | "Peer Transfers & Splits";

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string;
  amount: number; // in INR
  merchant: string;
  rawSms?: string;
  category: TransactionCategory;
  spendingType: SpendingType;
  upiRef?: string;
  bank?: string;
  notes?: string;
  triggerTag?: string; // e.g. "late-night", "chai-tapri", "weekend-fomo", "auto-debit"
  opportunityCostEquivalent?: string;
}

export interface GoalJar {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  emoji: string;
  category: "Travel" | "Tech" | "Lifestyle" | "Emergency" | "Course";
  color: string;
  totalSavedFromNudges: number;
  lastUpdated?: string;
}

export interface SpendingTrap {
  id: string;
  title: string;
  pattern: string;
  frequencyMonthly: number;
  estimatedMonthlyBurn: number;
  emoji: string;
  severity: "high" | "medium" | "low";
  seniorAdvice: string;
}

export interface FinancialMemoryProfile {
  studentName: string;
  collegeYear: string;
  monthlyAllowance: number;
  fixedEssentials: number;
  daysInMonth: number;
  currentDayOfMonth: number;
  disciplineStreak: number;
  totalSavedToJars: number;
  vulnerabilityZones: string[];
  activeTraps: SpendingTrap[];
  goals: GoalJar[];
  knownMerchants: Record<string, { category: TransactionCategory; type: SpendingType }>;
  pastImpulseDecisions: Array<{
    id: string;
    timestamp: string;
    prompt: string;
    amount: number;
    merchant: string;
    verdict: "APPROVED" | "WARNING" | "BLOCKED";
    actionTaken: "skipped_and_saved" | "spent_anyway" | "negotiated_down";
    amountSaved?: number;
    targetGoalJarId?: string;
  }>;
}

export interface DailyBudgetAnalysis {
  monthlyAllowance: number;
  fixedEssentials: number;
  totalSpentSoFar: number;
  remainingMonthlyAllowance: number;
  daysRemaining: number;
  dailySafeToSpend: number;
  spentToday: number;
  remainingToday: number;
  burnRatePerDay: number;
  projectedRunOutDay: number; // Day of month when student hits ₹0
  statusLevel: "green" | "amber" | "red";
  headline: string;
  comfortMessage: string;
}

export interface SmsParseResult {
  merchant: string;
  amount: number;
  date: string;
  category: TransactionCategory;
  spendingType: SpendingType;
  upiRef: string;
  bank: string;
  triggerTag?: string;
  confidenceScore: number;
  explanation: string;
  rawText: string;
}

export interface ImpulseCheckRequest {
  merchant: string;
  amount: number;
  contextNote?: string;
  timeOfDay?: string;
}

export interface ImpulseVerdict {
  verdict: "APPROVED" | "CAUTION" | "DENIED";
  headline: string;
  seniorBhaiResponse: string;
  budgetImpactDays: number;
  dailySafeReduction: number;
  opportunityCostGoal?: {
    goalId: string;
    goalTitle: string;
    delayDays: number;
    equivalentMilestone: string;
  };
  smartSeniorHacks: string[];
  recalledMemories: string[];
}

