"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  ShieldCheck,
  ArrowRight,
  Zap,
  Sparkles,
  Calendar,
  Landmark,
  CreditCard,
  Wallet,
  CheckCircle2,
} from "lucide-react";

interface DailySafeCardProps {
  onOpenBeforeIScan: () => void;
  onOpenSettings: () => void;
}

export const DailySafeCard: React.FC<DailySafeCardProps> = ({
  onOpenBeforeIScan,
  onOpenSettings,
}) => {
  const { analysis, profile } = useFinancialMemory();

  const {
    remainingMonthlyPool,
    daysRemaining,
    discretionarySpentSoFar,
    dateLabel,
    currentDayOfMonth,
    daysInMonth,
  } = analysis;

  // Total Safe-to-Spend Pool Until Payday
  // Default to computed remaining monthly pool (e.g. ₹30,592)
  const safePoolAmount = remainingMonthlyPool > 0 ? remainingMonthlyPool : 30592;

  // Breakdown across multi-bank and cards
  const estimatedBankCash = 48500;
  const estimatedCardBills = 17908;

  const daysToPayday = daysRemaining || 17;

  return (
    <div className="fintech-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full bg-white border border-slate-200 shadow-sm space-y-6">
      <div>
        {/* Top Bar with Spend Speed */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Spend Speed: Good</span>
            </div>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {dateLabel || `Day ${currentDayOfMonth || 14} of ${daysInMonth || 30}`}
            </span>
          </div>
        </div>

        {/* Hero Figure: Total Safe-to-Spend Pool Until Payday */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Safe-to-Spend Pool Until Payday
            </span>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Flexible Monthly Pool
            </span>
          </div>

          {/* Big Relaxed Hero Number */}
          <div className="flex items-baseline gap-3 pt-1">
            <span className="font-mono text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900">
              {formatINR(safePoolAmount)}
            </span>
          </div>

          {/* Simple Pacing Indicator */}
          <div className="flex items-center gap-2 pt-1">
            <div className="p-1 rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-semibold text-emerald-800 font-mono">
              {daysToPayday} Days Left • Spend Speed: Good
            </p>
          </div>

        </div>

        {/* 3-Pill Multi-Account Math Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <Landmark className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[10px] uppercase font-semibold">Total Linked Bank Cash</span>
            </div>
            <span className="text-base font-bold text-slate-900">
              {formatINR(estimatedBankCash)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">HDFC + SBI Checking</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] uppercase font-semibold">Upcoming Card Dues</span>
            </div>
            <span className="text-base font-bold text-blue-700">
              -{formatINR(estimatedCardBills)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">ICICI + HDFC Bills</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-1.5 text-emerald-800 mb-1">
              <Wallet className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[10px] uppercase font-bold">Net Safe Cash Pool</span>
            </div>
            <span className="text-base font-bold text-emerald-700">
              {formatINR(safePoolAmount)}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5 font-sans">
              100% Extra Spend
            </span>
          </div>
        </div>
      </div>

      {/* Footer Details */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="font-mono text-[11px] truncate">
          Salary: <strong className="text-slate-800">{formatINR(profile.monthlySalary)}</strong> • Fixed Bills &amp; SIPs: <strong className="text-slate-800">{formatINR(profile.fixedEssentials)}</strong>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors self-start sm:self-auto shrink-0 min-h-[32px] flex items-center"
        >
          Adjust Fixed Bills →
        </button>
      </div>
    </div>
  );
};
