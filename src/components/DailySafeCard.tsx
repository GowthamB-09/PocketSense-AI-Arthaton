"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Zap,
  TrendingUp,
  Wallet,
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
    dailySafeToSpend,
    remainingMonthlyPool,
    daysRemaining,
    spentToday,
    remainingToday,
    statusLevel,
    comfortMessage,
  } = analysis;

  const percentTodaySpent = dailySafeToSpend > 0
    ? Math.min(100, Math.round((spentToday / dailySafeToSpend) * 100))
    : 100;

  const statusConfig = {
    green: {
      badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      accent: "text-emerald-400",
      progressBar: "bg-emerald-400",
      label: "Safe Discretionary Zone",
      icon: ShieldCheck,
    },
    amber: {
      badge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      accent: "text-amber-400",
      progressBar: "bg-amber-400",
      label: "Runway Tightening",
      icon: AlertTriangle,
    },
    red: {
      badge: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      accent: "text-rose-400",
      progressBar: "bg-rose-400",
      label: "Day 20 Squeeze Detected",
      icon: ShieldAlert,
    },
  }[statusLevel];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="fintech-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.badge}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusConfig.label}</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Day {profile.currentDayOfMonth} of 30
            </span>
          </div>

          <button
            onClick={onOpenBeforeIScan}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/25 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Intercept Scan</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
          </button>
        </div>

        {/* Hero Figure */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-7 space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Safe Daily Discretionary Limit
            </span>

            <div className="flex items-baseline gap-2.5">
              <span className={`font-mono text-4xl sm:text-5xl font-black tracking-tight ${statusConfig.accent}`}>
                {formatINR(dailySafeToSpend)}
              </span>
              <span className="text-sm font-medium text-slate-400">/ day</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-sm pt-1">
              {comfortMessage}
            </p>
          </div>

          {/* Today's Consumption Meter */}
          <div className="md:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-slate-400">Today&apos;s Discretionary</span>
                <span className="text-slate-200 font-medium">
                  {formatINR(spentToday)} <span className="text-slate-500">/ {formatINR(dailySafeToSpend)}</span>
                </span>
              </div>
              
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${statusConfig.progressBar}`}
                  style={{ width: `${percentTodaySpent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono mt-1.5 text-slate-400">
                <span>{percentTodaySpent}% consumed</span>
                <span className={remainingToday > 0 ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                  {remainingToday > 0 ? `${formatINR(remainingToday)} remaining` : "Cap exhausted"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-800/80 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Runway Pool</span>
                <span className="font-bold text-white text-sm">{formatINR(remainingMonthlyPool)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Pacing Days</span>
                <span className="font-bold text-white text-sm">{daysRemaining} Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Ledger Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-400">
            Net Salary: <strong className="text-slate-200">{formatINR(profile.monthlySalary)}</strong>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            Fixed Obligations: <strong className="text-slate-200">{formatINR(profile.fixedEssentials)}</strong>
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Calibrate Allocation →
        </button>
      </div>
    </div>
  );
};
