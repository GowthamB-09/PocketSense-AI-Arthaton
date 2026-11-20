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
} from "lucide-react";

function DashboardContent() {
  const { profile, analysis } = useFinancialMemory();
  const [activeSpace, setActiveSpace] = useState<SolutionSpace>("daily-safe");
  const [isBeforeIScanOpen, setIsBeforeIScanOpen] = useState(false);
  const [isSmsParserOpen, setIsSmsParserOpen] = useState(false);
  const [isMemoryViewerOpen, setIsMemoryViewerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
                    Your credit card bills jumped to <strong>₹17,908 (24% of monthly salary)</strong>. Friday AutoPay sweep is paused so your bank balance stays safe until payday.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSpace("goal-jars")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shrink-0 transition-colors self-start sm:self-auto"
              >
                <span>View Risk Details</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            </div>

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
                    {formatINR(analysis.remainingMonthlyPool || 30592)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>{analysis.daysRemaining || 17}d to payday</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold">Good Speed</span>
                  </div>
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
