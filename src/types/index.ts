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
  salaryCreditDay: number; // Day of month when salary is credited (default 1)
  daysInMonth: number;
  currentDayOfMonth: number;
  useRealCalendarDate?: boolean;
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
    isSafePoolBuffer?: boolean;
  }>;
  isAutoPayPaused?: boolean;
  creditCardDues?: number;
  totalLinkedBankCash?: number;
}

export interface DailyBudgetAnalysis {
  monthlySalary: number;
  fixedEssentials: number;
  discretionaryPool: number;
  discretionarySpentSoFar: number;
  totalSpentSoFar: number;
  remainingMonthlyPool: number;
  currentDayOfMonth: number;
  daysInMonth: number;
  daysRemaining: number;
  dailySafeToSpend: number;
  spentToday: number;
  remainingToday: number;
  burnRatePerDay: number;
  projectedRunOutDay: number;
  statusLevel: "green" | "amber" | "red";
  headline: string;
  comfortMessage: string;
  dateLabel: string;
  salaryCreditDay: number;
  isRealDate: boolean;
  nextPaydayLabel: string;
  isAutoPayPaused: boolean;
  creditCardDues: number;
  totalLinkedBankCash: number;
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
  isSalaryCredit?: boolean;
  isFixedCommitment?: boolean;
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

export interface BankAccountBadge {
  id: string;
  bankName: string;
  accountType: "Salary" | "Savings" | "UPI Stash";
  accountNumber: string;
  balance: number;
  color: string;
}

export interface CreditCardBadge {
  id: string;
  cardName: string;
  bank: string;
  last4: string;
  totalDue: number;
  minDue: number;
  dueDate: string;
  color: string;
  daysUntilDue: number;
}

export interface InvestmentBadge {
  id: string;
  name: string;
  type: "FD" | "Index Fund" | "SIP";
  institution: string;
  amount: number;
  rateOrCagr: string;
  status: string;
  color: string;
}

export interface MoneyBrainFeed {
  totalBankCash: number;
  totalCreditCardBills: number;
  trueSafeToSpendCash: number;
  totalInvestments: number;
  roundUpTotal: number;
  roundUpTransactionsCount: number;
  bankBadges: BankAccountBadge[];
  cardBadges: CreditCardBadge[];
  investmentBadges: InvestmentBadge[];
  rawSmsFeed: string[];
}

export type PortfolioRiskPresetKey = "inflation_trap" | "debt_danger" | "balanced_autopilot";

