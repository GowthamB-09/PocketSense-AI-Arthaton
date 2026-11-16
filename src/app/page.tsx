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
import { formatINR } from "@/lib/utils";
import {
  TrendingUp,
  Wallet,
  Activity,
  Flame,
  Vault,
} from "lucide-react";

function DashboardContent() {
  const { profile, analysis } = useFinancialMemory();
  const [isBeforeIScanOpen, setIsBeforeIScanOpen] = useState(false);
  const [isSmsParserOpen, setIsSmsParserOpen] = useState(false);
  const [isMemoryViewerOpen, setIsMemoryViewerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen fintech-mesh-bg text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Bar */}
      <Navbar
        onOpenBeforeIScan={() => setIsBeforeIScanOpen(true)}
        onOpenSmsParser={() => setIsSmsParserOpen(true)}
        onOpenMemoryViewer={() => setIsMemoryViewerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Simple 4-Card Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Daily Limit */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-500">Daily Limit</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-slate-900">{formatINR(analysis.dailySafeToSpend)}</span>
              <span className="text-xs text-emerald-700 font-semibold">Safe Cap</span>
            </div>
          </div>

          {/* Left This Month */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-500">Left This Month</span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-slate-900">{formatINR(analysis.remainingMonthlyPool)}</span>
              <span className="text-xs text-slate-500">{analysis.daysRemaining} days left</span>
            </div>
          </div>

          {/* Daily Average */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-500">Daily Average</span>
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-rose-700">{formatINR(analysis.burnRatePerDay)}</span>
              <span className="text-xs text-slate-500">Day {analysis.currentDayOfMonth}/{analysis.daysInMonth}</span>
            </div>
          </div>

          {/* Total Saved */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold text-slate-500">Total Saved</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Vault className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-emerald-700">{formatINR(profile.totalSavedToJars)}</span>
              <span className="text-xs text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                {profile.disciplineStreak}d
              </span>
            </div>
          </div>
        </div>

        {/* Hero Row: Daily Budget & Month Runway */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7">
            <DailySafeCard
              onOpenBeforeIScan={() => setIsBeforeIScanOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
          <div className="lg:col-span-5">
            <RunOutDayPredictor />
          </div>
        </div>

        {/* Savings Opportunities */}
        <OpportunityCostBanner />

        {/* Savings Goals */}
        <GoalJarsSection />

        {/* Expenses & Spending Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <TransactionHistory />
          </div>
          <div className="lg:col-span-5">
            <SpendingTrendChart />
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500 mt-12">
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
