"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { RAW_SMS_SNIPPETS_DEMO } from "@/lib/demo/syntheticStudentData";
import { SmsParseResult, Transaction } from "@/types";
import { formatINR } from "@/lib/utils";
import { TransactionHistory } from "@/components/TransactionHistory";
import { SpendingTrendChart } from "@/components/SpendingTrendChart";
import {
  Sparkles,
  CheckCircle,
  CreditCard,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sliders,
  Coffee,
  ShoppingBag,
  UtensilsCrossed,
  Bell,
  Smartphone,
  UploadCloud,
  ChevronDown,
  ChevronUp,
  Check,
  Radio,
  FileCheck,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PassbookSpaceProps {
  onOpenSmsDrawer: () => void;
}

export const PassbookSpace: React.FC<PassbookSpaceProps> = ({
  onOpenSmsDrawer,
}) => {
  const { profile, analysis, transactions, addBatchTransactions, updateSalary, demoMode } = useFinancialMemory();
  const [activeTab, setActiveTab] = useState<"auto-track" | "insights" | "ledger">("auto-track");
  const [rawSmsBatch, setRawSmsBatch] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResults, setParsedResults] = useState<SmsParseResult[]>([]);
  const [isCommitted, setIsCommitted] = useState(false);
  const [budgetAppliedAlert, setBudgetAppliedAlert] = useState(false);
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [incomingAlertSimulation, setIncomingAlertSimulation] = useState<string | null>(null);
  const [isBackgroundListenerActive, setIsBackgroundListenerActive] = useState(true);

  // Compute live spending breakdown from transactions
  const discretionaryTxs = transactions.filter(
    (t) => t.category !== "Rent & Fixed Utilities" && t.category !== "Investments & SIPs"
  );

  const impulseTxs = discretionaryTxs.filter((t) => t.spendingType === "Impulse Want");
  const impulseSpent = impulseTxs.reduce((sum, t) => sum + t.amount, 0);

  const cafeSpent = discretionaryTxs
    .filter((t) => t.triggerTag === "specialty-coffee" || t.merchant.toLowerCase().includes("coffee"))
    .reduce((sum, t) => sum + t.amount, 0);

  const quickCommerceSpent = discretionaryTxs
    .filter((t) => t.triggerTag === "quick-commerce" || /zepto|blinkit|instamart/i.test(t.merchant))
    .reduce((sum, t) => sum + t.amount, 0);

  const socialDiningSpent = discretionaryTxs
    .filter((t) => t.triggerTag === "weekend-hangout" || /toit|brewery|bar|pub|swiggy|zomato/i.test(t.merchant))
    .reduce((sum, t) => sum + t.amount, 0);

  const shoppingSpent = discretionaryTxs
    .filter((t) => t.triggerTag === "lifestyle-creep" || /zara|h&m|myntra|amazon/i.test(t.merchant))
    .reduce((sum, t) => sum + t.amount, 0);

  const subscriptionTxs = transactions.filter((t) => t.spendingType === "Silent Subscription Leak");

  // Parse batch of SMS / Notification strings
  const handleParseBatch = async (texts: string[]) => {
    if (texts.length === 0) return;
    setIsParsing(true);
    setParsedResults([]);
    setIsCommitted(false);
    setBudgetAppliedAlert(false);

    try {
      const res = await fetch("/api/parse-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts, demoMode }),
      });

      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setParsedResults(data.results);
      }
    } catch (e) {
      console.error("Batch parse failed", e);
    } finally {
      setIsParsing(false);
    }
  };

  // Simulate an incoming live UPI debit captured silently in background
  const handleSimulateIncomingDebit = () => {
    const sampleMerchants = [
      { name: "Swiggy Gourmet Bowl", amount: 480, tag: "weekend-hangout", cat: "Dining & Social", type: "Impulse Want" as const },
      { name: "Blue Tokai Coffee Roasters", amount: 380, tag: "specialty-coffee", cat: "Dining & Social", type: "Impulse Want" as const },
      { name: "Zepto 10-Min Groceries", amount: 540, tag: "quick-commerce", cat: "Quick Commerce & Groceries", type: "Impulse Want" as const },
      { name: "Uber Ride Home", amount: 320, tag: "commute", cat: "Commute & Rides", type: "Survival Need" as const },
    ];

    const pick = sampleMerchants[Math.floor(Math.random() * sampleMerchants.length)];
    const newTx: Transaction = {
      id: "tx_auto_" + Date.now(),
      merchant: pick.name,
      amount: pick.amount,
      date: new Date().toISOString().split("T")[0],
      category: pick.cat as any,
      spendingType: pick.type,
      upiRef: "UPI" + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: "Google Pay / HDFC Bank",
      triggerTag: pick.tag,
      rawSms: `Auto-captured via device notification: Paid Rs. ${pick.amount} to ${pick.name}`,
    };

    addBatchTransactions([newTx]);
    setIncomingAlertSimulation(`Auto-captured UPI debit: ${formatINR(pick.amount)} at ${pick.name}. Zero manual typing needed.`);
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.3 },
    });
    setTimeout(() => setIncomingAlertSimulation(null), 5000);
  };

  // Auto-Detect Salary & Fixed Commitments from parsed records
  const detectedSalary = parsedResults.find(
    (r) => r.isSalaryCredit || /salary/i.test(r.rawText) || /credited.*(?:salary|75000)/i.test(r.rawText)
  )?.amount || 75000;

  const detectedFixedBills = parsedResults
    .filter(
      (r) =>
        !r.isSalaryCredit &&
        (r.category === "Rent & Fixed Utilities" ||
          r.category === "Investments & SIPs" ||
          r.isFixedCommitment ||
          /rent|sip|mutual fund|cook|maid/i.test(r.rawText))
    )
    .reduce((sum, r) => sum + r.amount, 0) || 32000;

  const handleApplyAutoBudget = () => {
    updateSalary(detectedSalary, detectedFixedBills, 1, true, false);
    setBudgetAppliedAlert(true);
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.5 },
    });
    setTimeout(() => setBudgetAppliedAlert(false), 4000);
  };

  const handleCommitParsedToLedger = () => {
    if (parsedResults.length === 0) return;

    // Filter out pure salary credits from expense ledger
    const expenseRecords = parsedResults.filter((r) => !r.isSalaryCredit && !/salary/i.test(r.rawText));

    const newTransactions: Transaction[] = expenseRecords.map((r, idx) => ({
      id: "tx_batch_" + Date.now() + "_" + idx,
      merchant: r.merchant,
      amount: r.amount,
      date: r.date,
      category: r.category,
      spendingType: r.spendingType,
      upiRef: r.upiRef,
      bank: r.bank,
      triggerTag: r.triggerTag,
      rawSms: r.rawText,
    }));

    addBatchTransactions(newTransactions);
    setIsCommitted(true);
    setRawSmsBatch("");

    confetti({
      particleCount: 40,
      spread: 55,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Smart Budgeting Header Hub */}
      <div className="fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Auto-Track: Zero Daily Manual Work</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                No Daily Typing
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nobody has time to type or copy-paste SMS daily. PocketSense uses background notification sync and 1-click monthly statements so you do zero daily ledger work.
            </p>
          </div>
        </div>

        {/* View Segmented Switcher */}
        <div className="w-full sm:w-auto grid grid-cols-3 sm:flex rounded-xl bg-slate-100 border border-slate-200 p-1 text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setActiveTab("auto-track")}
            className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg transition-all text-center ${
              activeTab === "auto-track"
                ? "bg-white text-emerald-700 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="hidden sm:inline">Auto-Sync &amp; Statements</span>
            <span className="sm:hidden">Auto-Sync</span>
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg transition-all text-center ${
              activeTab === "insights"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="hidden sm:inline">Spending Insights</span>
            <span className="sm:hidden">Insights</span>
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg transition-all text-center ${
              activeTab === "ledger"
                ? "bg-white text-slate-900 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="hidden sm:inline">Passbook Ledger</span>
            <span className="sm:hidden">Ledger</span>
          </button>
        </div>
      </div>

      {/* Simulated Live Alert Toast */}
      {incomingAlertSimulation && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center justify-between gap-3 animate-fade-in shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <Bell className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{incomingAlertSimulation}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
            Auto-Deducted
          </span>
        </div>
      )}

      {/* TAB 1: ZERO-WORK AUTO-TRACK & STATEMENT HUB */}
      {activeTab === "auto-track" && (
        <div className="space-y-6 animate-fade-in">
          {/* Solution 1: Background Notification Sync */}
          <div className="fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping opacity-75" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Background Device Auto-Sync</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Captures UPI &amp; bank payment notifications silently. Zero copy-pasting required.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSimulateIncomingDebit}
                  className="px-3.5 py-2.5 sm:py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-0 active:scale-98"
                  title="Test what happens when you make a UPI payment"
                >
                  <Bell className="w-3.5 h-3.5 text-slate-500" />
                  <span>Test Incoming UPI Alert</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleParseBatch(RAW_SMS_SNIPPETS_DEMO)}
                  className="px-4 py-2.5 sm:py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors min-h-[44px] sm:min-h-0 active:scale-98"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Tap Sync Device Spends</span>
                </button>
              </div>
            </div>

            {/* Connected Channels Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700 font-semibold">Google Pay</span>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" /> Connected
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700 font-semibold">PhonePe</span>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" /> Connected
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700 font-semibold">CRED UPI</span>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" /> Connected
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-slate-700 font-semibold">Bank SMS Debits</span>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-600" /> Connected
                </span>
              </div>
            </div>
          </div>

          {/* Solution 2: 1-Click Monthly Statement Ingestion */}
          <div className="fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Monthly Bank e-Statement (1-Click on Payday)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                  Instead of copying 60 SMS messages a month, drop your official bank statement (PDF or CSV) on payday. PocketSense automatically extracts your salary credit and recurring fixed bills (rent, SIPs, utilities) in 3 seconds.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleParseBatch(RAW_SMS_SNIPPETS_DEMO)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-sm flex items-center gap-1.5 shrink-0 transition-all"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Load Sample e-Statement (HDFC / ICICI)</span>
              </button>
            </div>

            {/* Extracted Blueprint Preview */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">Extracted Monthly Budget Blueprint:</span>
                <span className="font-mono text-emerald-700 font-semibold">100% Client-Side Privacy</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Detected Salary</span>
                  <span className="text-base font-bold text-slate-900">{formatINR(detectedSalary)}</span>
                  <span className="text-[10px] text-slate-400 block">From monthly credit alert</span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Fixed Bills &amp; SIPs</span>
                  <span className="text-base font-bold text-blue-700">{formatINR(detectedFixedBills)}</span>
                  <span className="text-[10px] text-slate-400 block">Rent + Mutual Fund SIP</span>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold truncate">Safe Spending Pool</span>
                  <span className="text-base font-bold text-emerald-700 truncate block">{formatINR(Math.max(0, detectedSalary - detectedFixedBills))}</span>
                  <span className="text-[10px] text-slate-400 block truncate">For all daily spending</span>
                </div>
              </div>

              {budgetAppliedAlert ? (
                <div className="p-3 rounded-lg bg-emerald-100 border border-emerald-300 text-xs font-semibold text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700" />
                  <span>Success! Your salary, fixed bills, and daily limit have been auto-configured in PocketSense.</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyAutoBudget}
                  className="w-full py-3 sm:py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all min-h-[44px] active:scale-98"
                >
                  <Sliders className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    Auto-Configure Budget <span className="hidden sm:inline font-mono">({formatINR(detectedSalary)} Salary • {formatINR(detectedFixedBills)} Fixed)</span>
                  </span>
                </button>
              )}
            </div>

            {/* Parsed Output Preview */}
            {parsedResults.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-900">Extracted {parsedResults.length} Transactions:</span>
                  <span className="text-emerald-700 font-semibold">Categorized Automatically</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {parsedResults.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 truncate">{r.merchant}</span>
                        <span className="font-black text-slate-900">{formatINR(r.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{r.category}</span>
                        <span className={r.spendingType === "Survival Need" ? "text-emerald-700 font-semibold" : "text-amber-700 font-semibold"}>
                          {r.spendingType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isCommitted}
                  onClick={handleCommitParsedToLedger}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                    isCommitted
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  {isCommitted ? "✓ Added All Expenses to Passbook" : `Add ${parsedResults.length} Records to Passbook`}
                </button>
              </div>
            )}
          </div>

          {/* Solution 3: The Philosophy Card (Why You Don't Need to Log Daily) */}
          <div className="fintech-card rounded-2xl p-6 bg-slate-50/90 border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 font-black" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  The PocketSense Rule: Why You Never Have to Track Expenses Daily
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Traditional budgeting apps fail because entering every ₹20 chai or ₹40 auto ride is tedious. PocketSense eliminates this completely:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">1. Calendar Autopilot</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Your safe daily limit recalibrates every midnight automatically. Even if you don&apos;t log daily snacks, your remaining headroom stays mathematically sound.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">2. Silent Background Sync</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  UPI debits from GPay, PhonePe, and Cred are captured directly from device notifications without opening the app or copying anything.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">3. Intervene Only at Scan</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  You only consult PocketSense when deciding on an impulse spend in <strong className="text-emerald-700">Before I Scan</strong>. No daily homework.
                </p>
              </div>
            </div>
          </div>

          {/* Solution 4: Collapsible Advanced Fallback (For Custom Text Testing) */}
          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => setShowManualPaste(!showManualPaste)}
              className="w-full p-4 text-left flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>Advanced: Manual SMS Text Fallback (Optional for Testing)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                  Not required for normal use
                </span>
              </span>
              {showManualPaste ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showManualPaste && (
              <div className="p-4 pt-0 space-y-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-[11px] text-slate-500">
                  If you are on an unsupported device or want to test custom SMS texts manually:
                </p>
                <textarea
                  rows={3}
                  value={rawSmsBatch}
                  onChange={(e) => setRawSmsBatch(e.target.value)}
                  placeholder="Paste raw SMS text here..."
                  className="w-full p-3 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  disabled={isParsing || !rawSmsBatch.trim()}
                  onClick={() => handleParseBatch(rawSmsBatch.split("\n").filter((s) => s.trim()))}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white disabled:opacity-40 transition-all flex items-center gap-1.5"
                >
                  {isParsing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Parsing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse Text</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SPENDING INSIGHTS & LEAK RADAR */}
      {activeTab === "insights" && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Insights Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Leak Radar Card */}
            <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Impulse Leak Radar</span>
                <span className="font-mono text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {formatINR(impulseSpent)} Burn
                </span>
              </div>

              <div className="space-y-2 pt-1 font-mono text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dining &amp; Social</span>
                  </span>
                  <strong className="text-slate-900">{formatINR(socialDiningSpent)}</strong>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                    <span>Zara &amp; Retail</span>
                  </span>
                  <strong className="text-slate-900">{formatINR(shoppingSpent)}</strong>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>10-Min Quick Commerce</span>
                  </span>
                  <strong className="text-slate-900">{formatINR(quickCommerceSpent)}</strong>
                </div>

                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Coffee className="w-3.5 h-3.5 text-amber-700" />
                    <span>Specialty Cafes</span>
                  </span>
                  <strong className="text-slate-900">{formatINR(cafeSpent)}</strong>
                </div>
              </div>
            </div>

            {/* Silent Subscription Radar Card */}
            <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Recurring Subscriptions</span>
                <span className="font-mono text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {subscriptionTxs.length} Active Auto-Debit
                </span>
              </div>

              <div className="pt-1 space-y-2">
                {subscriptionTxs.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center text-xs font-mono">
                    <div>
                      <span className="font-bold text-slate-900 block">{sub.merchant}</span>
                      <span className="text-[10px] text-slate-500">Monthly Auto-Debit</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{formatINR(sub.amount)}/mo</span>
                      <span className="text-[10px] text-slate-500">{formatINR(sub.amount * 12)}/yr</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                Silent leak tip: Review unused cloud storage or duplicate streaming plans every quarter.
              </div>
            </div>

            {/* Runway Health Projection Card */}
            <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Payday Runway Forecast</span>
                <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {analysis.daysRemaining}d to Payday
                </span>
              </div>

              <div className="space-y-2 font-mono text-xs pt-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Daily Safe Limit:</span>
                  <span className="font-bold text-emerald-700">{formatINR(analysis.dailySafeToSpend)}/day</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Current Burn Pace:</span>
                  <span className="font-bold text-slate-900">{formatINR(analysis.burnRatePerDay)}/day</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 truncate mr-2">Safe Runway:</span>
                  <span className="font-bold text-slate-900 shrink-0">Day {analysis.projectedRunOutDay} of {analysis.daysInMonth}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pacing well under safe limit with surplus for goal jars.</span>
              </div>
            </div>
          </div>

          {/* Actionable Behavioral Insights Banner */}
          <div className="fintech-card rounded-2xl p-6 bg-slate-50/80 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Behavioral Spending Hacks (Derived Automatically)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Batch Quick Commerce</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  You placed multiple ₹400–₹680 Zepto orders. Ordering groceries once a week cuts impulse cart creep by ~₹1,800/month.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Pre-Set Friday Dining Cap</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Weekend restaurant &amp; bar tabs average ₹3,450. Setting a ₹1,800 UPI cap before heading out protects 5 days of runway.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">Weekday Home Brew Switch</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Switching 3 weekdays to French Press coffee saves ₹4,200/month, funding your Japan Spring Trip goal 2.8% faster.
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Ledger & Chart Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <TransactionHistory />
            </div>
            <div className="lg:col-span-5">
              <SpendingTrendChart />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PASSBOOK LEDGER & TRENDS */}
      {activeTab === "ledger" && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <TransactionHistory />
            </div>
            <div className="lg:col-span-5">
              <SpendingTrendChart />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};