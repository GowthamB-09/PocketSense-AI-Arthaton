"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
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
      label: "Safe to Spend",
      icon: ShieldCheck,
      message: "You are comfortably within your monthly budget.",
    },
    amber: {
      badge: "bg-amber-50 border-amber-200 text-amber-800",
      accent: "text-amber-700",
      progressBar: "bg-amber-500",
      label: "Caution",
      icon: AlertTriangle,
      message: "Spending is slightly high. Try keeping daily spends low.",
    },
    red: {
      badge: "bg-rose-50 border-rose-200 text-rose-800",
      accent: "text-rose-700",
      progressBar: "bg-rose-500",
      label: "Over Budget",
      icon: ShieldAlert,
      message: "Daily budget is low. Avoid extra expenses until next payday.",
    },
  }[statusLevel];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="fintech-card rounded-2xl p-6 flex flex-col justify-between h-full bg-white border border-slate-200 shadow-sm">
      <div>
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.badge}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{statusConfig.label}</span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {dateLabel || `Day ${currentDayOfMonth} of ${daysInMonth}`}
            </span>
          </div>

          <button
            onClick={onOpenBeforeIScan}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-700 fill-emerald-700" />
            <span>Check a Purchase</span>
            <ArrowRight className="w-3 h-3 text-emerald-700" />
          </button>
        </div>

        {/* Hero Figure */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-7 space-y-1">
            <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wide">
              Safe to Spend Today
            </span>

            <div className="flex items-baseline gap-2">
              <span className={`font-mono text-4xl sm:text-5xl font-black tracking-tight ${statusConfig.accent}`}>
                {formatINR(dailySafeToSpend)}
              </span>
              <span className="text-sm font-semibold text-slate-500">/ day</span>
            </div>

            <p className="text-xs text-slate-600 pt-1">
              {statusConfig.message}
            </p>
          </div>

          {/* Today's Spend */}
          <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-1.5">
                <span className="text-slate-600 font-medium">Spent Today</span>
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

              <div className="flex justify-between items-center text-[11px] font-mono mt-1.5 text-slate-500">
                <span>{percentTodaySpent}% spent</span>
                <span className={remainingToday > 0 ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
                  {remainingToday > 0 ? `${formatINR(remainingToday)} left today` : "No daily budget left"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-200 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Left to Spend</span>
                <span className="font-bold text-slate-900 text-sm">{formatINR(remainingMonthlyPool)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Days Left</span>
                <span className="font-bold text-slate-900 text-sm">{daysRemaining} Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="font-mono text-[11px]">
          Salary: <strong className="text-slate-800">{formatINR(profile.monthlySalary)}</strong> • Fixed Bills: <strong className="text-slate-800">{formatINR(profile.fixedEssentials)}</strong>
        </div>

        <button
          onClick={onOpenSettings}
          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold transition-colors"
        >
          Change Budget →
        </button>
      </div>
    </div>
  );
};
