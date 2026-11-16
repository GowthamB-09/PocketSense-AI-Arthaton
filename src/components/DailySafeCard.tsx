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
  } = analysis;

  const percentTodaySpent = dailySafeToSpend > 0
    ? Math.min(100, Math.round((spentToday / dailySafeToSpend) * 100))
    : 100;

  const statusConfig = {
    green: {
      badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      accent: "text-emerald-400",
      progressBar: "bg-emerald-500",
      label: "Safe Discretionary Zone",
      icon: ShieldCheck,
    },
    amber: {
      badge: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      accent: "text-amber-400",
      progressBar: "bg-amber-500",
      label: "Runway Tightening",
      icon: AlertTriangle,
    },
    red: {
      badge: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      accent: "text-rose-400",
      progressBar: "bg-rose-500",
      label: "Month-End Squeeze",
      icon: ShieldAlert,
    },
  }[statusLevel];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="relative overflow-hidden rounded-xl bg-[#121215] border border-white/[0.08] p-5 sm:p-6 transition-all">
      {/* Top row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.badge}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            Day {profile.currentDayOfMonth} of 30
          </span>
        </div>

        <button
          onClick={onOpenBeforeIScan}
          className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Before-I-Scan</span>
          <ArrowRight className="w-3 h-3 text-zinc-400" />
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-end">
        <div className="sm:col-span-7">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
            Safe Daily Discretionary Limit
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-4xl sm:text-5xl font-black tracking-tight ${statusConfig.accent}`}>
              {formatINR(dailySafeToSpend)}
            </span>
            <span className="text-sm font-medium text-zinc-400">/ day</span>
          </div>

          <p className="mt-2 text-xs text-zinc-400 leading-relaxed max-w-md">
            {comfortMessage}
          </p>
        </div>

        {/* Right metrics column */}
        <div className="sm:col-span-5 flex flex-col gap-2.5 bg-black/40 border border-white/5 rounded-lg p-3.5">
          <div>
            <div className="flex justify-between items-center text-xs mb-1 font-mono">
              <span className="text-zinc-400">Today&apos;s Spend</span>
              <span className="text-zinc-200">{formatINR(spentToday)} / {formatINR(dailySafeToSpend)}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${statusConfig.progressBar}`}
                style={{ width: `${percentTodaySpent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono mt-1 text-zinc-500">
              <span>{percentTodaySpent}% spent</span>
              <span>{remainingToday > 0 ? `${formatINR(remainingToday)} left` : "Limit reached"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs font-mono">
            <div>
              <span className="text-[10px] text-zinc-500 block">Discretionary Pool</span>
              <span className="font-bold text-white text-sm">{formatINR(remainingMonthlyPool)}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 block">Runway Days</span>
              <span className="font-bold text-white text-sm">{daysRemaining} Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Footer Link */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
        <span className="font-mono">
          Take-Home: {formatINR(profile.monthlySalary)} • Fixed (Rent + SIPs): {formatINR(profile.fixedEssentials)}
        </span>
        <button
          onClick={onOpenSettings}
          className="text-zinc-400 hover:text-white transition-colors underline"
        >
          Edit Budget →
        </button>
      </div>
    </div>
  );
};
