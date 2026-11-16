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
  ShieldCheck,
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
      {/* Institutional Navigation Bar */}
      <Navbar
        onOpenBeforeIScan={() => setIsBeforeIScanOpen(true)}
        onOpenSmsParser={() => setIsSmsParserOpen(true)}
        onOpenMemoryViewer={() => setIsMemoryViewerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Corporate Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* Executive KPI Metric Strip (4-Col Pure White Style) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Metric 1 */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Daily Safe Limit</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-slate-900">{formatINR(analysis.dailySafeToSpend)}</span>
              <span className="text-[11px] text-emerald-700 font-semibold">Safe Cap</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Discretionary Pool</span>
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-slate-900">{formatINR(analysis.remainingMonthlyPool)}</span>
              <span className="text-[11px] text-slate-500 font-medium">{analysis.daysRemaining}d runway</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Burn Velocity</span>
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-rose-700">{formatINR(analysis.burnRatePerDay)}</span>
              <span className="text-[11px] text-slate-500 font-medium">Day {analysis.currentDayOfMonth}/{analysis.daysInMonth}</span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Capital In Vaults</span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Vault className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-emerald-700">{formatINR(profile.totalSavedToJars)}</span>
              <span className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                {profile.disciplineStreak}d
              </span>
            </div>
          </div>
        </div>

        {/* Hero Row: Daily Safe Pacing & Burn Velocity Runway */}
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

        {/* Opportunity Cost & Capital Preservation Banner */}
        <OpportunityCostBanner />

        {/* Capital Reserves & Milestone Vaults */}
        <GoalJarsSection />

        {/* Ledger & Cashflow Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <TransactionHistory />
          </div>
          <div className="lg:col-span-5">
            <SpendingTrendChart />
          </div>
        </div>
      </main>

      {/* Institutional Corporate Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold font-mono text-xs">
                ₹
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-sm">
                PocketSense <span className="text-emerald-700">Capital Intelligence</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-600 font-mono">
                Arthaton 2026
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono">
              <span className="text-slate-700 font-medium">Next.js 15</span>
              <span>•</span>
              <span className="text-slate-700 font-medium">Vercel AI SDK</span>
              <span>•</span>
              <span className="text-slate-700 font-medium">Google Gemini 2.5</span>
              <span>•</span>
              <span className="text-slate-700 font-medium">Tailwind CSS</span>
              <span>•</span>
              <span className="text-slate-700 font-medium">Supermemory Context</span>
            </div>
          </div>

          {/* Compliance & Privacy Statement */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 font-semibold">Non-Custodial Architecture &amp; Data Integrity: </strong>
              PocketSense operates exclusively with synthetic UPI &amp; discretionary spending records for young working professionals (ages 24–30). Zero real bank passwords, PAN numbers, OTPs, or brokerage credentials are required or accessed. All behavioral financial memory persists locally on the user&apos;s device.
            </div>
          </div>
        </div>
      </footer>

      {/* Corporate Modals and Drawers */}
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
