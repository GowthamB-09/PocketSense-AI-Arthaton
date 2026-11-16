export type SpendingType = "Survival Need" | "Impulse Want" | "Silent Subscription Leak";

export type TransactionCategory =
  | "Dining & Social"
  | "Quick Commerce & Groceries"
  | "Commute & Rides"
  | "Subscriptions & Cloud"
  | "Shopping & Gear"
  | "Rent & Fixed Utilities"
  | "Health & Wellness"
  | "Investments & SIPs";

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
  triggerTag?: string; // e.g. "specialty-coffee", "weekend-hangout", "quick-commerce", "lifestyle-creep"
  opportunityCostEquivalent?: string;
}

export interface GoalJar {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  emoji: string;
  category: "Travel" | "Tech" | "Wealth" | "Emergency" | "Lifestyle";
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
  coachAdvice: string;
}

export interface FinancialMemoryProfile {
  userName: string;
  role: string;
  monthlySalary: number;
  fixedEssentials: number; // Rent, SIP, Utilities, Insurance
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
  monthlySalary: number;
  fixedEssentials: number;
  totalSpentSoFar: number;
  remainingMonthlyPool: number;
  daysRemaining: number;
  dailySafeToSpend: number;
  spentToday: number;
  remainingToday: number;
  burnRatePerDay: number;
  projectedRunOutDay: number;
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
  coachResponse: string;
  budgetImpactDays: number;
  dailySafeReduction: number;
  opportunityCostGoal?: {
    goalId: string;
    goalTitle: string;
    delayDays: number;
    equivalentMilestone: string;
  };
  smartHacks: string[];
  recalledMemories: string[];
}
