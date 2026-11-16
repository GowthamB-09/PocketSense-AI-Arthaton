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
    dateLabel,
    currentDayOfMonth,
    daysInMonth,
  } = analysis;

  const percentTodaySpent = dailySafeToSpend > 0
    ? Math.min(100, Math.round((spentToday / dailySafeToSpend) * 100))
    : 100;

  const statusConfig = {
    green: {
      badge: "bg-emerald-50 border-emerald-200 text-emerald-800",
      accent: "text-emerald-700",
      progressBar: "bg-emerald-500",
      label: "Safe Discretionary Zone",
      icon: ShieldCheck,
    },
    amber: {
      badge: "bg-amber-50 border-amber-200 text-amber-800",
      accent: "text-amber-700",
      progressBar: "bg-amber-500",
      label: "Runway Tightening",
      icon: AlertTriangle,
    },
    red: {
      badge: "bg-rose-50 border-rose-200 text-rose-800",
      accent: "text-rose-700",
      progressBar: "bg-rose-500",
      label: "Day 20 Squeeze Alert",
      icon: ShieldAlert,
    },
  }[statusLevel];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="fintech-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full bg-white border border-slate-200 shadow-sm">
      {/* Top Meta Bar */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.badge}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusConfig.label}</span>
            </div>
            <span className="text-xs text-slate-500 font-mono font-medium">
              {dateLabel || `Day ${currentDayOfMonth} of ${daysInMonth}`}
            </span>
          </div>

          <button
            onClick={onOpenBeforeIScan}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" />
            <span>Intercept Scan</span>
            <ArrowRight className="w-3 h-3 text-emerald-700" />
          </button>
        </div>

        {/* Hero Figure */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-7 space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              Safe Daily Discretionary Limit
            </span>

            <div className="flex items-baseline gap-2.5">
              <span className={`font-mono text-4xl sm:text-5xl font-black tracking-tight ${statusConfig.accent}`}>
                {formatINR(dailySafeToSpend)}
              </span>
              <span className="text-sm font-semibold text-slate-500">/ day</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm pt-1">
              {comfortMessage}
            </p>
          </div>

          {/* Today's Consumption Meter */}
          <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-slate-600 font-medium">Today&apos;s Spend</span>
                <span className="text-slate-900 font-bold">
                  {formatINR(spentToday)} <span className="text-slate-400 font-normal">/ {formatINR(dailySafeToSpend)}</span>
                </span>
              </div>
              
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${statusConfig.progressBar}`}
                  style={{ width: `${percentTodaySpent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono mt-1.5 text-slate-500">
                <span>{percentTodaySpent}% consumed</span>
                <span className={remainingToday > 0 ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                  {remainingToday > 0 ? `${formatINR(remainingToday)} left` : "Cap exhausted"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Runway Pool</span>
                <span className="font-bold text-slate-900 text-sm">{formatINR(remainingMonthlyPool)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Pacing Days</span>
                <span className="font-bold text-slate-900 text-sm">{daysRemaining} Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Ledger Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span>
            Net Salary: <strong className="text-slate-800">{formatINR(profile.monthlySalary)}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Fixed Obligations: <strong className="text-slate-800">{formatINR(profile.fixedEssentials)}</strong>
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
        >
          Calibrate Allocation →
        </button>
      </div>
    </div>
  );
};
