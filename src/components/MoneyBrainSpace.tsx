"use client";

import React, { useState, useMemo } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Coins,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send,
  HelpCircle,
  PiggyBank,
  Smartphone,
  CreditCard,
  Plus,
  Check,
  Percent,
} from "lucide-react";
import confetti from "canvas-confetti";

interface MoneyBrainSpaceProps {
  onSwitchToScan?: () => void;
  onSwitchToGoals?: () => void;
}

interface ParsedAccountState {
  bankBalances: {
    hdfcSalary: number;
    sbiStash: number;
  };
  creditCardDues: {
    iciciDue: number;
    hdfcDue: number;
  };
  upcomingEMIs: number;
  axisFD: number;
  niftySIP: number;
  roundUpJar: number;
  totalRoundUpCount: number;
}

export const MoneyBrainSpace: React.FC<MoneyBrainSpaceProps> = ({
  onSwitchToScan,
  onSwitchToGoals,
}) => {
  const { profile, claimSavings } = useFinancialMemory();

  // Days left in the monthly cycle (default 16 or from memory context)
  const daysLeft = 16;

  // Multi-Bank Live State parsed from SMS alerts
  const [accountState, setAccountState] = useState<ParsedAccountState>({
    bankBalances: {
      hdfcSalary: 28400,
      sbiStash: 14800,
    },
    creditCardDues: {
      iciciDue: 16200,
      hdfcDue: 12800,
    },
    upcomingEMIs: 7000, // Fixed SIP + Insurance EMI
    axisFD: 50000,
    niftySIP: 45200,
    roundUpJar: 2150,
    totalRoundUpCount: 28,
  });

  // Payday Autopilot Split Percentages (15% Index Fund SIP, 5% Emergency FD)
  const [sipPercent] = useState(15);
  const [fdPercent] = useState(5);
  const monthlySalary = profile.monthlySalary || 75000;
  const autopilotSIPAmount = Math.round((monthlySalary * sipPercent) / 100); // ₹11,250
  const autopilotFDAmount = Math.round((monthlySalary * fdPercent) / 100); // ₹3,750
  const totalAutopilotSplit = autopilotSIPAmount + autopilotFDAmount; // ₹15,000

  // Feature 1: Raw SMS Feed and Custom Paste Box
  const [customSmsText, setCustomSmsText] = useState("");
  const [showCustomSmsBox, setShowCustomSmsBox] = useState(false);
  const [liveSpendNotification, setLiveSpendNotification] = useState<string | null>(null);

  // Feature 3: "Should I Buy This?" Reality Check State
  const [purchasePriceInput, setPurchasePriceInput] = useState<string>("");

  // Feature 4: "Ask ClearRupee AI" State
  const [advisorQuery, setAdvisorQuery] = useState("");
  const [advisorAnswer, setAdvisorAnswer] = useState<string | null>(null);
  const [isAskingAdvisor, setIsAskingAdvisor] = useState(false);

  // 1-Tap Action State
  const [jarSweptSuccess, setJarSweptSuccess] = useState(false);
  const [splitAutoApplied, setSplitAutoApplied] = useState(true);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. DYNAMIC DAILY MATH (Zero Traffic Lights, Pure Math)
  // ─────────────────────────────────────────────────────────────────────────────
  const totalBankCash =
    accountState.bankBalances.hdfcSalary + accountState.bankBalances.sbiStash;

  const combinedCreditCardBills =
    accountState.creditCardDues.iciciDue + accountState.creditCardDues.hdfcDue;

  // One practical daily number:
  // (Total Bank Cash − Combined Credit Card Bills − Upcoming EMIs) / Days Left in Month
  const netSpendablePool = Math.max(
    0,
    totalBankCash - combinedCreditCardBills - accountState.upcomingEMIs
  );

  const safeToSpendToday = Math.max(0, Math.round(netSpendablePool / daysLeft));

  // ─────────────────────────────────────────────────────────────────────────────
  // FEATURE 1: Working Parser Function `parseSMSFeed(smsList)`
  // ─────────────────────────────────────────────────────────────────────────────
  const parseSMSFeed = (smsList: string[]) => {
    let newHdfc = accountState.bankBalances.hdfcSalary;
    let newSbi = accountState.bankBalances.sbiStash;
    let newIciciDue = accountState.creditCardDues.iciciDue;
    let newHdfcDue = accountState.creditCardDues.hdfcDue;
    let newRoundUp = accountState.roundUpJar;
    let newCount = accountState.totalRoundUpCount;

    smsList.forEach((sms) => {
      const clean = sms.trim();
      const amountMatch = clean.match(/(?:(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?))/i);
      const parsedAmt = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

      // Extract Balances
      const balMatch = clean.match(/(?:Avail Bal(?:ance)?|Bal)\s*(?:INR|Rs\.?|:)?\s*([\d,]+(?:\.\d{1,2})?)/i);
      if (balMatch) {
        const bal = parseFloat(balMatch[1].replace(/,/g, ""));
        if (/HDFC/i.test(clean)) newHdfc = bal;
        else if (/SBI/i.test(clean)) newSbi = bal;
      }

      // Extract Credit Card Bill Due
      if (/total (?:amt )?due/i.test(clean)) {
        if (/ICICI/i.test(clean)) newIciciDue = parsedAmt;
        else if (/HDFC/i.test(clean)) newHdfcDue = parsedAmt;
      }

      // Check UPI Debits and auto-roundup
      if (/(?:debited|paid|sent)/i.test(clean) && parsedAmt > 0 && parsedAmt < 5000) {
        if (/SBI/i.test(clean)) newSbi = Math.max(0, newSbi - parsedAmt);
        else newHdfc = Math.max(0, newHdfc - parsedAmt);

        // Auto Round-up to nearest ₹100
        const remainder = parsedAmt % 100;
        const roundUp = remainder > 0 ? 100 - remainder : 0;
        newRoundUp += roundUp;
        newCount += 1;
      }
    });

    setAccountState((prev) => ({
      ...prev,
      bankBalances: { hdfcSalary: newHdfc, sbiStash: newSbi },
      creditCardDues: { iciciDue: newIciciDue, hdfcDue: newHdfcDue },
      roundUpJar: newRoundUp,
      totalRoundUpCount: newCount,
    }));
  };

  // "Simulate Live UPI Spend" button
  const handleSimulateLiveUpiSpend = () => {
    const spends = [
      { merchant: "Swiggy Food Delivery", amount: 240, app: "PhonePe", fromBank: "sbi" as const },
      { merchant: "Blue Tokai Coffee", amount: 380, app: "Google Pay", fromBank: "hdfc" as const },
      { merchant: "Zepto 10-Min Groceries", amount: 520, app: "Paytm UPI", fromBank: "sbi" as const },
      { merchant: "Uber Ride Home", amount: 165, app: "PhonePe", fromBank: "hdfc" as const },
    ];

    const pick = spends[Math.floor(Math.random() * spends.length)];
    const remainder = pick.amount % 100;
    const roundUp = remainder > 0 ? 100 - remainder : 0;

    // Deduct spend from chosen bank
    setAccountState((prev) => ({
      ...prev,
      bankBalances: {
        ...prev.bankBalances,
        [pick.fromBank === "sbi" ? "sbiStash" : "hdfcSalary"]: Math.max(
          0,
          (pick.fromBank === "sbi" ? prev.bankBalances.sbiStash : prev.bankBalances.hdfcSalary) -
            pick.amount
        ),
      },
      roundUpJar: prev.roundUpJar + roundUp,
      totalRoundUpCount: prev.totalRoundUpCount + 1,
    }));

    // Trigger feedback notification
    setLiveSpendNotification(
      `Live UPI Spend Captured: Paid ${formatINR(pick.amount)} to ${pick.merchant} via ${pick.app}. +${formatINR(
        roundUp
      )} rounded up to Spare Change Jar. Safe to Spend Today recalculated live!`
    );

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.35 },
      colors: ["#059669", "#0284C7", "#D97706"],
    });

    setTimeout(() => setLiveSpendNotification(null), 5000);
  };

  // Handle Custom SMS Paste
  const handleParseCustomSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSmsText.trim()) return;
    parseSMSFeed(customSmsText.split("\n").filter((t) => t.trim()));
    setCustomSmsText("");
    setShowCustomSmsBox(false);
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.4 } });
  };

  // 1-Tap "Sweep into Index Fund SIP"
  const handleSweepJar = () => {
    if (accountState.roundUpJar <= 0) return;
    const sweptAmount = accountState.roundUpJar;

    claimSavings(
      profile.goals[0]?.id || "goal_japan_trip",
      sweptAmount,
      `Lazy Spare Change Sweep: ${formatINR(sweptAmount)} into Nifty 50 Index Fund SIP`
    );

    setAccountState((prev) => ({
      ...prev,
      roundUpJar: 0,
      niftySIP: prev.niftySIP + sweptAmount,
    }));

    setJarSweptSuccess(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#10B981", "#059669", "#34D399"],
    });
    setTimeout(() => setJarSweptSuccess(false), 4500);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FEATURE 3: "Should I Buy This?" Instant Trade-off Math
  // ─────────────────────────────────────────────────────────────────────────────
  const numericPrice = parseFloat(purchasePriceInput) || 0;

  const realityCheck = useMemo(() => {
    if (numericPrice <= 0) return null;

    // New Safe to Spend Today if this purchase occurs:
    const newNetPool = Math.max(0, netSpendablePool - numericPrice);
    const newDailySafe = Math.round(newNetPool / daysLeft);
    const dailyDrop = Math.max(0, safeToSpendToday - newDailySafe);

    // Goal delay in weeks:
    // Based on user's monthly index SIP of ₹11,250 (which is ~₹2,812 / week)
    const weeklySavingsRate = autopilotSIPAmount / 4;
    const weeksDelayed = (numericPrice / weeklySavingsRate).toFixed(1);

    const isAffordable = numericPrice <= netSpendablePool;

    return {
      numericPrice,
      newDailySafe,
      dailyDrop,
      weeksDelayed,
      isAffordable,
    };
  }, [numericPrice, netSpendablePool, daysLeft, safeToSpendToday, autopilotSIPAmount]);

  // Handle 1-Tap "Skip & Put into Index Fund"
  const handleSkipImpulseAndInvest = () => {
    if (!realityCheck || realityCheck.numericPrice <= 0) return;

    claimSavings(
      profile.goals[0]?.id || "goal_japan_trip",
      realityCheck.numericPrice,
      `Skipped ${formatINR(realityCheck.numericPrice)} impulse spend & invested in Nifty 50 Index Fund`
    );

    setAccountState((prev) => ({
      ...prev,
      niftySIP: prev.niftySIP + realityCheck.numericPrice,
    }));

    setPurchasePriceInput("");
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#059669", "#10B981", "#F59E0B"],
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FEATURE 4: 1-Tap "Ask ClearRupee AI" with User's Real Numbers
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAskAdvisor = (question: string) => {
    setAdvisorQuery(question);
    setIsAskingAdvisor(true);

    setTimeout(() => {
      setIsAskingAdvisor(false);

      if (question.includes("₹4,000") || question.includes("weekend dinner")) {
        setAdvisorAnswer(
          `**ClearRupee AI Advice:**\n\nYou currently have **${formatINR(
            netSpendablePool
          )}** in net spendable cash after credit cards. Spending ₹4,000 drops your "Safe to Spend Today" from **${formatINR(
            safeToSpendToday
          )}/day** down to **${formatINR(
            Math.max(0, Math.round((netSpendablePool - 4000) / daysLeft))
          )}/day** for the remaining ${daysLeft} days.\n\n👉 **Action:** Cap dining at **₹1,500** to keep a safe ₹350/day buffer until payday.`
        );
      } else if (question.includes("ICICI") || question.includes("credit card bill")) {
        setAdvisorAnswer(
          `**ClearRupee AI Advice:**\n\n**Clear your ${formatINR(
            accountState.creditCardDues.iciciDue
          )} ICICI credit card bill immediately.**\n\n- Credit card interest is ~**42% per year**, while Nifty 50 delivers ~**12%**. Paying your card bill gives you a guaranteed 42% risk-free return.\n- You have **${formatINR(
            accountState.bankBalances.hdfcSalary
          )}** in HDFC salary cash—clearing the bill leaves you with ${formatINR(
            accountState.bankBalances.hdfcSalary - accountState.creditCardDues.iciciDue
          )} clean cash with zero interest penalties.`
        );
      } else if (question.includes("invest ₹5,000") || question.includes("daily limit")) {
        setAdvisorAnswer(
          `**ClearRupee AI Advice:**\n\nIf you invest ₹5,000 from your **${formatINR(
            accountState.bankBalances.sbiStash
          )}** idle SBI stash into Nifty 50, it compounds to ~**₹15,500** in 10 years at ~12% CAGR.\n\nBecause this comes from your secondary stash rather than your daily living balance, your **"Safe to Spend Today" remains at ${formatINR(
            safeToSpendToday
          )}/day** completely untouched!`
        );
      } else {
        setAdvisorAnswer(
          `**ClearRupee AI Advice for "${question}":**\n\nAcross your HDFC (${formatINR(
            accountState.bankBalances.hdfcSalary
          )}) and SBI (${formatINR(accountState.bankBalances.sbiStash)}) accounts, you have **${formatINR(
            totalBankCash
          )}** total bank cash. After reserving ${formatINR(
            combinedCreditCardBills
          )} for credit card bills, your Safe to Spend Today is **${formatINR(
            safeToSpendToday
          )}/day**. Keep emergency FD locked and let your ${formatINR(
            autopilotSIPAmount
          )} Nifty 50 SIP compound automatically.`
        );
      }
    }, 350);
  };

  const handleCustomAdvisorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorQuery.trim()) return;
    handleAskAdvisor(advisorQuery);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ─────────────────────────────────────────────────────────────────────────────
          FEATURE 1: "SAFE TO SPEND TODAY" NUMBER & MULTI-BANK AUTO-PARSER
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="fintech-card rounded-2xl p-6 sm:p-7 bg-white border border-slate-200 shadow-sm space-y-5 relative overflow-hidden">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Multi-Bank Auto-Reconciliation
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Money Brain: One True Daily Number</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Auto-Math
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Simulate Live UPI Spend */}
            <button
              type="button"
              onClick={handleSimulateLiveUpiSpend}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-98 min-h-[40px]"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulate Live UPI Spend</span>
            </button>

            {/* Paste Custom SMS Dropdown */}
            <button
              type="button"
              onClick={() => setShowCustomSmsBox(!showCustomSmsBox)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 min-h-[40px]"
            >
              <span>Paste SMS</span>
              {showCustomSmsBox ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Custom SMS Paste Box */}
        {showCustomSmsBox && (
          <form onSubmit={handleParseCustomSms} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-fade-in">
            <span className="text-xs font-semibold text-slate-700 block">
              Paste Any Indian Bank or Credit Card SMS:
            </span>
            <textarea
              rows={2}
              value={customSmsText}
              onChange={(e) => setCustomSmsText(e.target.value)}
              placeholder="e.g. HDFC Bank: Salary of INR 75,000 credited to A/C **4412. Avail Bal: INR 28,400. Or ICICI CC Due INR 16,200..."
              className="w-full p-3 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomSmsBox(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
              >
                Parse SMS &amp; Update Live Math
              </button>
            </div>
          </form>
        )}

        {/* Live Spend Toast Notification */}
        {liveSpendNotification && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-950 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{liveSpendNotification}</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold shrink-0">
              Live Updated
            </span>
          </div>
        )}

        {/* HERO CARD: "SAFE TO SPEND TODAY: ₹450" */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
          <div className="space-y-1">
            <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-700">
              One Practical Number
            </span>

            <div className="flex items-baseline gap-2.5">
              <span className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-slate-900">
                {formatINR(safeToSpendToday)}
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-500 font-sans">
                Safe to Spend Today
              </span>
            </div>

            <p className="text-xs text-slate-500 max-w-lg leading-relaxed pt-1">
              Zero complicated category budgets. We take all your bank cash, deduct all upcoming credit card bills, and divide by the remaining {daysLeft} days until payday.
            </p>
          </div>

          {/* Under-The-Hood Formula Math */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1.5 shrink-0 self-start md:self-auto w-full md:w-auto">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Live Formula Breakdown
            </div>
            <div className="flex justify-between items-center gap-6 text-slate-600">
              <span>Total Bank Balances:</span>
              <strong className="text-slate-900">+{formatINR(totalBankCash)}</strong>
            </div>
            <div className="flex justify-between items-center gap-6 text-slate-600">
              <span>Combined Card Bills:</span>
              <strong className="text-rose-700">−{formatINR(combinedCreditCardBills)}</strong>
            </div>
            <div className="flex justify-between items-center gap-6 text-slate-600">
              <span>Upcoming Fixed EMIs:</span>
              <strong className="text-blue-700">−{formatINR(accountState.upcomingEMIs)}</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center gap-6 text-xs font-bold text-slate-900">
              <span>÷ {daysLeft} Days Left =</span>
              <span className="text-emerald-700 text-sm font-black">{formatINR(safeToSpendToday)} / day</span>
            </div>
          </div>
        </div>

        {/* Compact Row of Mini-Badges */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
            Unified Multi-Account SMS Balances:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">HDFC Salary A/C</span>
              <strong className="text-slate-900 text-sm block">{formatINR(accountState.bankBalances.hdfcSalary)}</strong>
              <span className="text-[10px] text-emerald-700 font-sans font-medium">**4412 Active</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">SBI UPI Stash</span>
              <strong className="text-slate-900 text-sm block">{formatINR(accountState.bankBalances.sbiStash)}</strong>
              <span className="text-[10px] text-blue-700 font-sans font-medium">**9012 Active</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">ICICI Card Bill</span>
              <strong className="text-slate-900 text-sm block">−{formatINR(accountState.creditCardDues.iciciDue)}</strong>
              <span className="text-[10px] text-slate-500 font-sans font-medium">Due in 4 days</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block">HDFC Card Bill</span>
              <strong className="text-slate-900 text-sm block">−{formatINR(accountState.creditCardDues.hdfcDue)}</strong>
              <span className="text-[10px] text-slate-500 font-sans font-medium">Due in 8 days</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 block">Axis Emergency FD</span>
              <strong className="text-slate-900 text-sm block">{formatINR(accountState.axisFD)}</strong>
              <span className="text-[10px] text-purple-700 font-sans font-medium">6.85% Helmet</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          FEATURE 2: AUTOMATIC "ROUND-UP & PAYDAY SPLIT" ENGINE
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Autopilot Wealth Split Card */}
        <div className="lg:col-span-7 fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-900 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Autopilot Payday Wealth Split</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Auto-Deducted
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              When your <strong>{formatINR(monthlySalary)}</strong> salary hits on the 1st, PocketSense automatically shields <strong>20% ({formatINR(totalAutopilotSplit)})</strong> before showing your spendable daily limit.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-semibold block">15% to Nifty 50 Index SIP</span>
                <span className="text-base font-bold text-emerald-950">{formatINR(autopilotSIPAmount)}</span>
                <span className="text-[10px] text-emerald-700 block font-sans">Compounding Wealth</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                <span className="text-[10px] text-purple-800 uppercase font-semibold block">5% to Emergency FD</span>
                <span className="text-base font-bold text-purple-950">{formatINR(autopilotFDAmount)}</span>
                <span className="text-[10px] text-purple-700 block font-sans">Liquid Financial Helmet</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Spendable remainder after wealth split: <strong>{formatINR(monthlySalary - totalAutopilotSplit)}</strong></span>
            <span className="text-emerald-700 font-semibold font-mono">✓ Shielded</span>
          </div>
        </div>

        {/* Live "Lazy Spare Change Jar" with 1-Tap Sweep */}
        <div className="lg:col-span-5 fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Lazy Spare Change Jar</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                Live Round-Up
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-amber-900">
                  {formatINR(accountState.roundUpJar)}
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  saved automatically
                </span>
              </div>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Rounded up to nearest ₹100 from <strong>{accountState.totalRoundUpCount} UPI transactions</strong> across Google Pay &amp; PhonePe.
              </p>
            </div>
          </div>

          <div>
            {jarSweptSuccess ? (
              <div className="w-full py-2.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Swept into Nifty 50 Index Fund SIP!</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSweepJar}
                disabled={accountState.roundUpJar === 0}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[42px]"
              >
                <PiggyBank className="w-4 h-4" />
                <span>Sweep {formatINR(accountState.roundUpJar)} into Index Fund SIP</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          FEATURE 3: "SHOULD I BUY THIS?" INSTANT REALITY CHECK
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="fintech-card rounded-2xl p-6 sm:p-7 bg-white border border-slate-200 shadow-sm space-y-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            Pre-Transaction Trade-off Engine
          </span>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>&ldquo;Should I Buy This?&rdquo; Instant Reality Check</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
              Zero Extra Forms
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Thinking of buying something right now? Enter the ₹ price to see the exact trade-off on your daily spend and wealth goals.
          </p>
        </div>

        {/* Super simple single-input box */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-mono font-bold text-base">
            ₹
          </div>
          <input
            type="number"
            min="50"
            step="50"
            value={purchasePriceInput}
            onChange={(e) => setPurchasePriceInput(e.target.value)}
            placeholder="Thinking of buying something? Enter ₹ price (e.g. 3500)"
            className="w-full pl-9 pr-36 py-3.5 text-base sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[48px]"
          />

          {numericPrice > 0 && (
            <button
              type="button"
              onClick={() => setPurchasePriceInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-500">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">Try:</span>
          {["850", "2990", "3500", "14990"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPurchasePriceInput(p)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono font-medium transition-colors shrink-0"
            >
              ₹{p}
            </button>
          ))}
        </div>

        {/* Instant Reality Check Result Panel */}
        {realityCheck && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 font-mono">
                Real-Life Trade-Off for {formatINR(realityCheck.numericPrice)}:
              </span>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded font-bold ${
                  realityCheck.isAffordable
                    ? "bg-slate-200 text-slate-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {realityCheck.isAffordable ? "Consumes Discretionary Headroom" : "Exceeds Safe Cash"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
              {/* Daily Safe Impact */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Impact on Today&apos;s Spend</span>
                <div className="text-sm font-bold text-rose-700">
                  {formatINR(safeToSpendToday)}/day → {formatINR(realityCheck.newDailySafe)}/day
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  Lowers your daily spending limit by <strong>{formatINR(realityCheck.dailyDrop)}/day</strong> for the remaining {daysLeft} days.
                </p>
              </div>

              {/* Goal Delay Impact */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Milestone Delay</span>
                <div className="text-sm font-bold text-amber-700">
                  +{realityCheck.weeksDelayed} Weeks Delay
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  Delays your Emergency FD &amp; Nifty 50 wealth goal by ~{realityCheck.weeksDelayed} weeks of savings.
                </p>
              </div>
            </div>

            {/* 1-Tap Action: Skip & Put in Index Fund */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleSkipImpulseAndInvest}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-98 min-h-[42px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Skip &amp; Put {formatINR(realityCheck.numericPrice)} into Nifty 50 Index Fund Instead</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          FEATURE 4: 10-SECOND PLAIN-ENGLISH ADVISOR (SIPs, Index Funds, FDs)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="fintech-card rounded-2xl p-6 sm:p-7 bg-white border border-slate-200 shadow-sm space-y-5">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
            Zero-Jargon Financial Education
          </span>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>10-Second Plain-English Wealth Advisor</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              Zero Jargon
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            No boring financial textbooks. Maximum 2 sentences per concept so you understand exactly where your money goes.
          </p>
        </div>

        {/* 3 Ultra-Short Cards (Max 2 sentences each) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          {/* Card 1: Fixed Deposit */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Fixed Deposit (FD)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                ~6.5% Emergency Shield
              </span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">
              A guaranteed safety net that protects your rent and medical cash from stock market crashes. You earn ~6.5% steady return without any risk of losing money.
            </p>
          </div>

          {/* Card 2: Index Fund */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Index Fund</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                ~12% Top 50 Growth
              </span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">
              Owns an equal slice of India&apos;s 50 biggest companies like Tata, Reliance, and Infosys. You grow ~12% long-term as India grows, without picking individual stocks.
            </p>
          </div>

          {/* Card 3: SIP */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">SIP (Auto-Invest)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                Monthly Autopilot
              </span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">
              Auto-invests a fixed slice of your salary on payday before you can impulsively spend it. Pure lazy wealth compounding on complete autopilot.
            </p>
          </div>
        </div>

        {/* 1-Tap "Ask ClearRupee AI" Bar */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Ask ClearRupee AI (Answers using your real ₹ numbers)</span>
            </span>
            <span className="text-[10px] text-slate-400">1-Tap Answers</span>
          </div>

          {/* 3 Preset Question Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              "Can I afford this ₹4,000 weekend dinner with my current ₹14,200 cash?",
              "Should I clear my ₹16,200 ICICI credit card bill or put it in Nifty 50?",
              "What happens to my daily limit if I invest ₹5,000 today?",
            ].map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskAdvisor(q)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-700 text-xs font-medium transition-all active:scale-98 text-left"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <form onSubmit={handleCustomAdvisorSubmit} className="relative flex items-center">
            <input
              type="text"
              value={advisorQuery}
              onChange={(e) => setAdvisorQuery(e.target.value)}
              placeholder="Ask ClearRupee AI anything about your accounts, card bills, or SIPs..."
              className="w-full px-4 py-3 pr-24 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[44px]"
            />
            <button
              type="submit"
              disabled={isAskingAdvisor || !advisorQuery.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              {isAskingAdvisor ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <span>Ask AI</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </form>

          {/* AI Response Panel */}
          {advisorAnswer && (
            <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans space-y-2 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-bold uppercase tracking-wider text-[10px] font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>ClearRupee AI Reasoning (Using Real ₹ Numbers):</span>
              </div>
              <div>{advisorAnswer}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
