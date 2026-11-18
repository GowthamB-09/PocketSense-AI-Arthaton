"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { Transaction } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Sparkles,
  FileText,
  Sliders,
  Calendar,
  Check,
  Zap,
  CheckCircle2,
  Bell,
} from "lucide-react";
import confetti from "canvas-confetti";

interface NavbarProps {
  onOpenDailySafe?: () => void;
  onOpenBeforeIScan: () => void;
  onOpenSmsParser: () => void;
  onOpenMemoryViewer: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDailySafe,
  onOpenBeforeIScan,
  onOpenSmsParser,
  onOpenSettings,
}) => {
  const { analysis, loadSyntheticDemo, addBatchTransactions } = useFinancialMemory();
  const [loadedAlert, setLoadedAlert] = useState(false);
  const [syncAlert, setSyncAlert] = useState<string | null>(null);

  const handleLoadDemo = () => {
    loadSyntheticDemo();
    setLoadedAlert(true);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.15 },
    });
    setTimeout(() => setLoadedAlert(false), 2000);
  };

  // 1-Click "Simulate Live Background Sync"
  const handleSimulateBackgroundSync = () => {
    const sampleIncoming = [
      {
        merchant: "Blue Tokai Coffee Roasters",
        amount: 350,
        category: "Dining & Social" as const,
        spendingType: "Impulse Want" as const,
        bank: "HDFC Bank (SMS Webhook)",
      },
      {
        merchant: "Swiggy Gourmet Bowl",
        amount: 480,
        category: "Dining & Social" as const,
        spendingType: "Impulse Want" as const,
        bank: "PhonePe UPI Webhook",
      },
      {
        merchant: "Zepto Quick Delivery",
        amount: 320,
        category: "Quick Commerce & Groceries" as const,
        spendingType: "Survival Need" as const,
        bank: "SBI Account Webhook",
      },
    ];

    const pick = sampleIncoming[Math.floor(Math.random() * sampleIncoming.length)];
    const newTx: Transaction = {
      id: "tx_bg_sync_" + Date.now(),
      merchant: pick.merchant,
      amount: pick.amount,
      date: new Date().toISOString().split("T")[0],
      category: pick.category,
      spendingType: pick.spendingType,
      upiRef: "WH" + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: pick.bank,
      triggerTag: "zero-touch-webhook",
      rawSms: `[Silent Webhook Ingestion] Paid Rs. ${pick.amount} to ${pick.merchant}`,
    };

    addBatchTransactions([newTx]);
    setSyncAlert(
      `✓ Background Sync: Ingested ${formatINR(pick.amount)} UPI spend (${pick.merchant}) via Webhook • Safe to Spend Today & Remaining Cash updated live!`
    );

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.15 },
      colors: ["#059669", "#10B981", "#34D399"],
    });

    setTimeout(() => setSyncAlert(null), 5000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand */}
          <button
            onClick={onOpenDailySafe}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity text-left min-h-[44px] focus:outline-none"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold shadow-sm">
              <span className="font-mono text-sm font-black">₹</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                PocketSense
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:block leading-none mt-0.5">
                Autopilot Money Coach
              </span>
            </div>
          </button>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* 1-Click "Simulate Live Background Sync" Button */}
            <button
              onClick={handleSimulateBackgroundSync}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-sm transition-all active:scale-95"
              title="Simulate silent background sync from SMS Webhook / Gmail"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Simulate Live Background Sync</span>
              <span className="sm:hidden font-mono text-[11px]">Sync</span>
            </button>

            {/* Salary Cycle Indicator */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-xs">
                {analysis?.dateLabel ? analysis.dateLabel.split(" ")[0] : `Day ${analysis?.currentDayOfMonth || 1}`}
                <span> of {analysis?.daysInMonth || 30}</span>
              </span>
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleLoadDemo}
              className="hidden sm:flex items-center gap-1 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors active:scale-95"
              title="Reset to Realistic Synthetic Student Data"
            >
              {loadedAlert ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs">Reset</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Reset Demo</span>
                </>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors active:scale-95"
              title="Budget & Salary Settings"
              aria-label="Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Primary Action Button (Desktop only) */}
            <button
              onClick={onOpenBeforeIScan}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 min-h-[38px] rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-white text-white" />
              <span>Check Spend</span>
              <kbd className="inline-flex items-center px-1 rounded text-[10px] font-mono bg-emerald-700 text-emerald-100">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Live Background Sync Notification Toast */}
      {syncAlert && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-medium text-center animate-fade-in flex items-center justify-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncAlert}</span>
        </div>
      )}
    </>
  );
};
