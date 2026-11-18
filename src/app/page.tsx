"use client";

import React, { useState } from "react";
import { FinancialMemoryProvider, useFinancialMemory } from "@/lib/memory/memoryContext";
import { Navbar } from "@/components/Navbar";
import { DailySafeCard } from "@/components/DailySafeCard";
import { RunOutDayPredictor } from "@/components/RunOutDayPredictor";
import { OpportunityCostBanner } from "@/components/OpportunityCostBanner";
import { GoalJarsSection } from "@/components/GoalJarsSection";
import { TransactionHistory } from "@/components/TransactionHistory";
import { SpendingTrendChart } from "@/components/SpendingTrendChart";
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
        {/* SPACE 1: DAILY SAFE & SALARY RUNWAY */}
        {activeSpace === "daily-safe" && (
          <div className="space-y-6 animate-fade-in">
            {/* Transparent 4-Card Monthly Balance Sheet */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: Monthly Salary */}
              <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold text-slate-500">Take-Home Salary</span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-xl font-bold text-slate-900">{formatINR(profile.monthlySalary)}</span>
                  <span className="text-xs text-slate-500 font-normal">Income</span>
                </div>
              </div>

              {/* Card 2: Fixed Essentials */}
              <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold text-slate-500">Fixed Bills &amp; SIPs</span>
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-xl font-bold text-slate-900">{formatINR(profile.fixedEssentials)}</span>
                  <span className="text-xs text-slate-500 font-normal">Committed</span>
                </div>
              </div>

              {/* Card 3: Spent This Month */}
              <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold text-slate-500">Spent This Month</span>
                  <div className="p-1.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-xl font-bold text-slate-900">{formatINR(analysis.discretionarySpentSoFar)}</span>
                  <span className="text-xs text-slate-500 font-normal">Discretionary</span>
                </div>
              </div>

              {/* Card 4: Remaining to Spend */}
              <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold text-slate-500">Remaining to Spend</span>
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex items-baseline justify-between font-mono">
                  <span className="text-xl font-bold text-emerald-700">{formatINR(analysis.remainingMonthlyPool)}</span>
                  <span className="text-xs text-slate-500 font-normal">{analysis.daysRemaining}d to salary</span>
                </div>
              </div>
            </div>

            {/* Hero Row: Daily Budget & Month Runway */}
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
          </div>
        )}

        {/* SPACE 2: BEFORE-I-SCAN AI GUARD */}
        {activeSpace === "before-i-scan" && (
          <BeforeIScanSpace onSwitchToGoals={() => setActiveSpace("goal-jars")} />
        )}

        {/* SPACE 3: GOAL JARS & OPPORTUNITY COST */}
        {activeSpace === "goal-jars" && (
          <div className="space-y-6 animate-fade-in">
            <OpportunityCostBanner />
            <GoalJarsSection />
          </div>
        )}

        {/* SPACE 4: PASSBOOK & SMS STATEMENT INGESTION */}
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
