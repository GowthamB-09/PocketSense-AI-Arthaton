"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { Transaction } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Sparkles,
  Sliders,
  Calendar,
  Check,
  Zap,
  CheckCircle2,
  Mail,
  Radio,
  Coins,
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
  const { analysis, profile, loadSyntheticDemo, addBatchTransactions, claimSavings, isAutoPayPaused } = useFinancialMemory();
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

  // 1-Click "Simulate Incoming Multi-Bank Spend" (across HDFC, SBI, and ICICI Card)
  const handleSimulateMultiBankSpend = () => {
    const sampleIncoming = [
      {
        merchant: "Blue Tokai Coffee Roasters",
        amount: 350,
        category: "Dining & Social" as const,
        spendingType: "Impulse Want" as const,
        bank: "HDFC Bank UPI",
        rawSms: "Debited Rs.350.00 from HDFC Bank A/C **4412 via UPI to Blue Tokai. Avl Bal Rs.32,400.",
      },
      {
        merchant: "Swiggy Gourmet Bowl",
        amount: 480,
        category: "Dining & Social" as const,
        spendingType: "Impulse Want" as const,
        bank: "SBI UPI Webhook",
        rawSms: "SBI UPI: Rs.480.00 debited from A/C **9011 to Swiggy. Ref 63199201.",
      },
      {
        merchant: "Zara Lifestyle Store",
        amount: 1120,
        category: "Shopping & Gear" as const,
        spendingType: "Impulse Want" as const,
        bank: "ICICI Credit Card Swipe",
        rawSms: "ICICI Card ending 8021 spent Rs.1120.00 at ZARA. Avl Limit Rs.1,45,000.",
      },
      {
        merchant: "Zepto 10-Min Groceries",
        amount: 320,
        category: "Quick Commerce & Groceries" as const,
        spendingType: "Survival Need" as const,
        bank: "HDFC Bank Webhook",
        rawSms: "Debited Rs.320.00 from HDFC Bank to Zepto. Avl Bal Rs.32,080.",
      },
    ];

    const pick = sampleIncoming[Math.floor(Math.random() * sampleIncoming.length)];

    // Calculate spare change round-up (to nearest ₹100)
    const remainder = pick.amount % 100;
    const spareChange = remainder > 0 ? 100 - remainder : 50;

    const newTx: Transaction = {
      id: "tx_mb_sync_" + Date.now(),
      merchant: pick.merchant,
      amount: pick.amount,
      date: new Date().toISOString().split("T")[0],
      category: pick.category,
      spendingType: pick.spendingType,
      upiRef: "MB" + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: pick.bank,
      triggerTag: "multi-bank-webhook",
      rawSms: pick.rawSms,
    };

    addBatchTransactions([newTx]);

    const estimatedRemaining = Math.max(0, analysis.remainingMonthlyPool - pick.amount);

    if (isAutoPayPaused) {
      // 1. Block Automatic Round-Up Sweeps When Paused (+₹0 swept to Goal Jar)
      // 2. Show a Clear Risk Guard Message
      setSyncAlert(
        `Spend tracked, but spare-change round-up (${formatINR(spareChange)}) was skipped because Silent Risk Guard paused Goal Jar sweeps until your card/EMI bills are cleared.`
      );
    } else {
      // Automatically deposit spare change into primary goal jar
      if (profile.goals && profile.goals.length > 0) {
        claimSavings(profile.goals[0].id, spareChange, `Spare change round-up from ${pick.merchant}`);
      }

      setSyncAlert(
        `✓ Ingested ${formatINR(pick.amount)} (${pick.bank} • ${pick.merchant}) • Total Safe Pool: ${formatINR(estimatedRemaining)} • +₹${spareChange} spare change rounded up into Goal Jar!`
      );
    }

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.15 },
      colors: ["#059669", "#10B981", "#34D399", "#F59E0B"],
    });

    setTimeout(() => setSyncAlert(null), 5500);
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

          {/* Set-Once Background Connectors Status (Top Bar) */}
          <div className="hidden xl:flex items-center gap-2 font-mono text-[11px]">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700">
              <Mail className="w-3 h-3 text-blue-600" />
              <span>Gmail Bank/Card Auto-Forward:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ON
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700">
              <Radio className="w-3 h-3 text-emerald-600" />
              <span>Phone UPI Webhook:</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ON
              </span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* 1-Click "Simulate Incoming Multi-Bank Spend" Button */}
            <button
              onClick={handleSimulateMultiBankSpend}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-sm transition-all active:scale-95"
              title="Simulate incoming multi-bank spend (HDFC, SBI, ICICI Card) with spare change round-up"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Simulate Incoming Multi-Bank Spend</span>
              <span className="sm:hidden font-mono text-[11px]">Simulate Spend</span>
            </button>

            {/* Salary Cycle Indicator */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-xs">
                {analysis?.daysRemaining || 17}d to Payday
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
          </div>
        </div>
      </header>

      {/* Live Background Sync Notification Toast */}
      {syncAlert && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-medium text-center animate-fade-in flex items-center justify-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{syncAlert}</span>
        </div>
      )}
    </>
  );
};
