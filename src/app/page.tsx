"use client";

import React, { useState } from "react";
import { FinancialMemoryProvider } from "@/lib/memory/memoryContext";
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

export default function Home() {
  const [isBeforeIScanOpen, setIsBeforeIScanOpen] = useState(false);
  const [isSmsParserOpen, setIsSmsParserOpen] = useState(false);
  const [isMemoryViewerOpen, setIsMemoryViewerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <FinancialMemoryProvider>
      <div className="min-h-screen bg-[#09090B] bg-grid-pattern text-foreground flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
        {/* Navigation Bar */}
        <Navbar
          onOpenBeforeIScan={() => setIsBeforeIScanOpen(true)}
          onOpenSmsParser={() => setIsSmsParserOpen(true)}
          onOpenMemoryViewer={() => setIsMemoryViewerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Hero Row: Daily Safe-to-Spend & Day 20 Squeeze Predictor */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

          {/* Opportunity Cost & Goal Jar Translator */}
          <OpportunityCostBanner />

          {/* Wealth & Milestone Jars Section */}
          <GoalJarsSection />

          {/* Bento Grid: Spending Trends & Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <TransactionHistory />
            </div>
            <div className="lg:col-span-5">
              <SpendingTrendChart />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#09090B] py-8 text-xs text-zinc-400 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-white tracking-tight">
                  PocketSense <span className="text-emerald-400">PRO</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-white/5 text-zinc-400 font-mono">
                  Arthaton 2026 Submission
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400">
                <span className="text-zinc-500">Built with:</span>
                <span className="text-zinc-300">Next.js 15</span>
                <span>•</span>
                <span className="text-zinc-300">Vercel AI SDK</span>
                <span>•</span>
                <span className="text-zinc-300">Google Gemini API</span>
                <span>•</span>
                <span className="text-zinc-300">Tailwind CSS</span>
                <span>•</span>
                <span className="text-zinc-300">Supermemory Context</span>
              </div>
            </div>

            {/* Compliance & Privacy Disclaimer */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 leading-relaxed">
              <strong className="text-zinc-300">Privacy &amp; Compliance: </strong>
              PocketSense AI operates strictly on synthetic UPI &amp; discretionary spending data for young working professionals (24–30). Zero real bank credentials, PAN cards, OTPs, or brokerage access. 100% of financial memory resides in client-side storage for non-custodial privacy.
            </div>
          </div>
        </footer>

        {/* Floating Modals and Drawers */}
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
    </FinancialMemoryProvider>
  );
}

