"use client";

import React, { useState } from "react";
import { FinancialMemoryProvider, useFinancialMemory } from "@/lib/memory/memoryContext";
import { Navbar } from "@/components/Navbar";
import { SmartCashFlowCalendar } from "@/components/SmartCashFlowCalendar";
import { GoalJarsSection } from "@/components/GoalJarsSection";
import { BeforeIScanModal } from "@/components/BeforeIScanModal";
import { SmsParserDrawer } from "@/components/SmsParserDrawer";
import { FinancialMemoryViewer } from "@/components/FinancialMemoryViewer";
import { SettingsModal } from "@/components/SettingsModal";
import { RiskDetailsModal } from "@/components/RiskDetailsModal";
import { SalaryAllocationBar } from "@/components/SalaryAllocationBar";
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
  const { profile, analysis } = useFinancialMemory();
  const [activeSpace, setActiveSpace] = useState<SolutionSpace>("daily-safe");
  const [isBeforeIScanOpen, setIsBeforeIScanOpen] = useState(false);
  const [isSmsParserOpen, setIsSmsParserOpen] = useState(false);
  const [isMemoryViewerOpen, setIsMemoryViewerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);

  // Dynamic 20% Threshold Calculation
  const upcomingCardDues = profile.creditCardDues ?? 17908;
  const takeHomeSalary = profile.monthlySalary || 75000;
  const cardBillRatio = takeHomeSalary > 0 ? upcomingCardDues / takeHomeSalary : 0;
  const cardBillPercent = Math.round(cardBillRatio * 100);
  const isAutoPayPaused = cardBillRatio > 0.20;

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
                      Your credit card bills jumped to <strong>₹{upcomingCardDues.toLocaleString('en-IN')} ({cardBillPercent}% of monthly salary)</strong>. Friday AutoPay sweep is paused so your bank balance stays safe until payday.
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
                      Credit card dues (₹{upcomingCardDues.toLocaleString('en-IN')}) are safely at or below 20% of salary ({cardBillPercent}%). Weekly Friday Goal Jar sweeps &amp; spare-change round-ups are running smoothly.
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

            {/* Salary Allocation & Safe Pool Breakdown Bar Card */}
            <SalaryAllocationBar onOpenSettings={() => setIsSettingsOpen(true)} />

            {/* Interactive Smart Cash-Flow & Event Calendar (November 2026) */}
            <SmartCashFlowCalendar
              onOpenBeforeIScan={() => setActiveSpace("before-i-scan")}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenRiskDetails={() => setIsRiskModalOpen(true)}
            />

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
            <GoalJarsSection onOpenRiskDetails={() => setIsRiskModalOpen(true)} />
          </div>
        )}

        {/* SPACE 4: AUTO-TRACKED SPENDING */}
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
