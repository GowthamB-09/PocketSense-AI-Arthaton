"use client";

import React, { useState } from "react";
import { FinancialMemoryProvider, useFinancialMemory } from "@/lib/memory/memoryContext";
import { Navbar } from "@/components/Navbar";
import { DailySafeCard } from "@/components/DailySafeCard";
import { RunOutDayPredictor } from "@/components/RunOutDayPredictor";
import { GoalJarsSection } from "@/components/GoalJarsSection";
import { BeforeIScanModal } from "@/components/BeforeIScanModal";
import { SmsParserDrawer } from "@/components/SmsParserDrawer";
import { FinancialMemoryViewer } from "@/components/FinancialMemoryViewer";
import { SettingsModal } from "@/components/SettingsModal";
import { RiskDetailsModal } from "@/components/RiskDetailsModal";
import { SolutionSpaceSwitcher, SolutionSpace } from "@/components/SolutionSpaceSwitcher";
import { BeforeIScanSpace } from "@/components/BeforeIScanSpace";
import { PassbookSpace } from "@/components/PassbookSpace";
import { formatINR } from "@/lib/utils";
import {
  TrendingUp,
  Wallet,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Zap,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

function DashboardContent() {
  const { profile, analysis, isAutoPayPaused } = useFinancialMemory();
  const [activeSpace, setActiveSpace] = useState<SolutionSpace>("daily-safe");
  const [isBeforeIScanOpen, setIsBeforeIScanOpen] = useState(false);
  const [isSmsParserOpen, setIsSmsParserOpen] = useState(false);
  const [isMemoryViewerOpen, setIsMemoryViewerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  const cardDues = profile.creditCardDues ?? 17908;
  const salary = profile.monthlySalary || 75000;
  const pctOfSalary = Math.round((cardDues / salary) * 100);

  // Dynamic Monthly Salary Allocation Metrics
  const takeHomeSalary = profile.monthlySalary || 75000;
  const fixedBills = profile.fixedEssentials || 32000;
  const spentThisMonth = analysis.discretionarySpentSoFar || 0;
  const rawSafePool = typeof analysis.remainingMonthlyPool === "number"
    ? analysis.remainingMonthlyPool
    : Math.max(0, takeHomeSalary - fixedBills - spentThisMonth);
  const totalSafePool = Math.max(0, rawSafePool);

  const isOverspent = rawSafePool <= 0 && spentThisMonth > 0;
  const overspentAmount = Math.max(0, (fixedBills + spentThisMonth) - takeHomeSalary);

  const fixedPercent = Math.round((fixedBills / takeHomeSalary) * 100);
  const spentPercent = Math.round((spentThisMonth / takeHomeSalary) * 100);
  const safePercent = isOverspent ? 0 : Math.max(0, 100 - fixedPercent - spentPercent);

  // Segment widths clamped so total width always fits 100% and totalSafePool clamps at 0%
  let clampedFixedPercent = (fixedBills / takeHomeSalary) * 100;
  let clampedSpentPercent = (spentThisMonth / takeHomeSalary) * 100;
  let clampedSafePercent = Math.max(0, 100 - clampedFixedPercent - clampedSpentPercent);

  if (clampedFixedPercent + clampedSpentPercent > 100) {
    const scale = 100 / (clampedFixedPercent + clampedSpentPercent);
    clampedFixedPercent = clampedFixedPercent * scale;
    clampedSpentPercent = clampedSpentPercent * scale;
    clampedSafePercent = 0; // Clamped at 0% if overspent
  }

  return (
    <div className="min-h-screen fintech-mesh-bg text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Bar */}
      <Navbar
        onOpenDailySafe={() => setActiveSpace("daily-safe")}
        onOpenBeforeIScan={() => setActiveSpace("before-i-scan")}
        onOpenSmsParser={() => setActiveSpace("passbook")}
        onOpenMemoryViewer={() => setIsMemoryViewerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* CRED / PhonePe Style Solution Space Switcher */}
      <SolutionSpaceSwitcher
        activeSpace={activeSpace}
        onSelectSpace={(space) => setActiveSpace(space)}
      />

      {/* Main Solution Space Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-8">
        {/* SPACE 1: DAILY SAFE CORE (LIMIT & CASH LEFT) */}
        {activeSpace === "daily-safe" && (
          <div className="space-y-6 animate-fade-in">
            {/* Silent Portfolio Risk Guard Quick Status Banner */}
            {isAutoPayPaused ? (
              <div className="fintech-card rounded-2xl p-4 sm:p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        Silent Risk Guard: Multi-Card Bill Trap Detected
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        Paused autopay sweep
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your credit card bills jumped to <strong>{formatINR(cardDues)} ({pctOfSalary}% of monthly salary)</strong>. Friday AutoPay sweep is paused so your bank balance stays safe until payday.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRiskModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-colors self-start sm:self-auto"
                >
                  <span>View Risk Details</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            ) : (
              <div className="fintech-card rounded-2xl p-3.5 sm:p-4 bg-emerald-50/50 border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-950">
                        All Clear • AutoPay Sweeps Active
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                        Sweeps Active
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800/80 mt-0.5">
                      Credit card dues ({formatINR(cardDues)}) are safely under 20% of salary. Weekly Friday Goal Jar sweeps &amp; spare-change round-ups are running smoothly.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRiskModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 transition-colors self-start sm:self-auto"
                >
                  <span>View Risk Details</span>
                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                </button>
              </div>
            )}

            {/* Transparent 4-Card Monthly Balance Sheet */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
              {/* Card 1: Monthly Salary */}
              <div className="fintech-card rounded-2xl p-4 sm:p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold text-slate-600 truncate mr-1">Take-Home Salary</span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-0.5">
                  <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 truncate">
                    {formatINR(profile.monthlySalary)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>Monthly Income</span>
                    <span className="text-[10px] font-mono text-slate-400">Total</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Fixed Essentials */}
              <div className="fintech-card rounded-2xl p-4 sm:p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold text-slate-600 truncate mr-1">Fixed Bills &amp; SIPs</span>
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-0.5">
                  <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 truncate">
                    {formatINR(profile.fixedEssentials)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>Rent &amp; Essentials</span>
                    <span className="text-[10px] font-mono text-blue-600 font-semibold">Fixed</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Spent This Month */}
              <div className="fintech-card rounded-2xl p-4 sm:p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold text-slate-600 truncate mr-1">Spent This Month</span>
                  <div className="p-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 shrink-0">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-0.5">
                  <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 truncate">
                    {formatINR(analysis.discretionarySpentSoFar)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>Extra Spend</span>
                    <span className="text-[10px] font-mono text-slate-400">Month</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Total Safe-to-Spend Pool */}
              <div className="fintech-card rounded-2xl p-4 sm:p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold text-slate-600 truncate mr-1">Total Safe Pool</span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="mt-0.5">
                  <div className="text-lg sm:text-xl font-bold font-mono text-emerald-700 truncate">
                    {formatINR(totalSafePool)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>{analysis.daysRemaining || 17}d to payday</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold">
                      {safePercent}% Left
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Reactive Salary Allocation Progress Bar */}
            <div className="fintech-card rounded-2xl p-4 sm:p-4.5 bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 tracking-tight font-mono uppercase">
                    Monthly Salary Allocation Pacing
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                    100% Salary
                  </span>
                </div>
                <div className="text-xs font-mono">
                  {isOverspent ? (
                    <span className="text-rose-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Overspent by {formatINR(overspentAmount)}
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      {safePercent}% Available for Extra Spend
                    </span>
                  )}
                </div>
              </div>

              {/* Segmented Bar with smooth transitions */}
              <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 shadow-inner">
                {/* Fixed Bills Segment */}
                <div
                  className="h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${clampedFixedPercent}%` }}
                  title={`Fixed Bills & SIPs: ₹${fixedBills.toLocaleString("en-IN")} (${fixedPercent}%)`}
                />

                {/* Spent This Month Segment */}
                <div
                  className={`h-full ${
                    isOverspent ? "bg-rose-500" : "bg-slate-700"
                  } transition-all duration-500 ease-out`}
                  style={{ width: `${clampedSpentPercent}%` }}
                  title={`Spent This Month: ₹${spentThisMonth.toLocaleString("en-IN")} (${spentPercent}%)`}
                />

                {/* Total Safe Pool Segment (Highlighted in emerald green as remaining spendable balance) */}
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                  style={{ width: `${clampedSafePercent}%` }}
                  title={`Total Safe Pool: ₹${totalSafePool.toLocaleString("en-IN")} (${safePercent}%)`}
                />
              </div>

              {/* Legend with exact wording from prompt */}
              <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3 text-xs font-mono pt-0.5">
                {/* Fixed Bills Legend */}
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span>
                    Fixed Bills &amp; SIPs — <strong>₹{fixedBills.toLocaleString("en-IN")}</strong> ({fixedPercent}%)
                  </span>
                </div>

                {/* Spent This Month Legend */}
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOverspent ? "bg-rose-500" : "bg-slate-700"
                    } shrink-0`}
                  />
                  <span>
                    Spent This Month — <strong>₹{spentThisMonth.toLocaleString("en-IN")}</strong> ({spentPercent}%)
                  </span>
                </div>

                {/* Total Safe Pool Legend (Highlighted in emerald green as remaining spendable balance) */}
                <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>
                    Total Safe Pool — <strong>₹{totalSafePool.toLocaleString("en-IN")}</strong> ({safePercent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Row: Daily Budget & Days Left */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7">
                <DailySafeCard
                  onOpenBeforeIScan={() => setActiveSpace("before-i-scan")}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
              <div className="lg:col-span-5">
                <RunOutDayPredictor />
              </div>
            </div>

            {/* Quick-Link CTA: Need a second opinion on a purchase? */}
            <div className="fintech-card rounded-2xl p-4 bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Zap className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                    Need a second opinion on a purchase?
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Get instant impulse protection, Smart Swaps, and AI coaching before you spend
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSpace("before-i-scan")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 shrink-0 self-start sm:self-auto min-h-[38px]"
              >
                <span>Ask AI Pay Guard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* SPACE 2: BEFORE-I-SCAN (AI PAY GUARD) */}
        {activeSpace === "before-i-scan" && (
          <BeforeIScanSpace onSwitchToGoals={() => setActiveSpace("goal-jars")} />
        )}

        {/* SPACE 3: GOAL JARS (UPI AUTOPAY & WEALTH) */}
        {activeSpace === "goal-jars" && (
          <div className="space-y-6 animate-fade-in">
            <GoalJarsSection />
          </div>
        )}

        {/* SPACE 4: SMS & INSIGHTS (ZERO-TOUCH AUTOPILOT) */}
        {activeSpace === "passbook" && (
          <PassbookSpace onOpenSmsDrawer={() => setIsSmsParserOpen(true)} />
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 mt-12 mb-20 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded bg-emerald-600 text-white font-bold font-mono text-[11px]">
              ₹
            </div>
            <span className="font-bold text-slate-900">PocketSense AI</span>
            <span className="text-slate-400">• Personal Money Coach</span>
          </div>

          <div className="text-slate-400 text-[11px] font-mono">
            Zero-login • Safe &amp; Private • All data stored locally on your device
          </div>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <BeforeIScanModal
        isOpen={isBeforeIScanOpen}
        onClose={() => setIsBeforeIScanOpen(false)}
      />
      <SmsParserDrawer
        isOpen={isSmsParserOpen}
        onClose={() => setIsSmsParserOpen(false)}
      />
      <FinancialMemoryViewer
        isOpen={isMemoryViewerOpen}
        onClose={() => setIsMemoryViewerOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <RiskDetailsModal
        isOpen={isRiskModalOpen}
        onClose={() => setIsRiskModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <FinancialMemoryProvider>
      <DashboardContent />
    </FinancialMemoryProvider>
  );
}
