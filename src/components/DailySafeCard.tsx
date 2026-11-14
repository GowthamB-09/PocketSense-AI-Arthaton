"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Calendar,
  Wallet,
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
    remainingMonthlyAllowance,
    daysRemaining,
    spentToday,
    remainingToday,
    statusLevel,
    comfortMessage,
    burnRatePerDay,
    projectedRunOutDay,
  } = analysis;

  // Percentage of today's safe allowance used
  const percentTodaySpent = dailySafeToSpend > 0
    ? Math.min(100, Math.round((spentToday / dailySafeToSpend) * 100))
    : 100;

  // Status colors & icons
  const statusConfig = {
    green: {
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      glow: "shadow-[0_0_35px_rgba(16,185,129,0.12)]",
      borderColor: "border-emerald-500/30",
      accent: "text-emerald-400",
      progressBar: "bg-emerald-500",
      label: "Safe-to-Spend Zone",
      icon: ShieldCheck,
    },
    amber: {
      badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      glow: "shadow-[0_0_35px_rgba(245,158,11,0.12)]",
      borderColor: "border-amber-500/30",
      accent: "text-amber-400",
      progressBar: "bg-amber-500",
      label: "Runway Tightening",
      icon: AlertTriangle,
    },
    red: {
      badgeBg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      glow: "shadow-[0_0_35px_rgba(239,68,68,0.15)]",
      borderColor: "border-rose-500/40",
      accent: "text-rose-400",
      progressBar: "bg-rose-500",
      label: `Day 18 Cliff Alert`,
      icon: ShieldAlert,
    },
  }[statusLevel];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#121215] border ${statusConfig.borderColor} ${statusConfig.glow} p-6 sm:p-7 transition-all duration-300`}
    >
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/5 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

      {/* Top row: Status & Quick action */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeBg}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </div>
          <span className="text-xs text-zinc-400 hidden sm:inline">
            Day {profile.currentDayOfMonth} of 30
          </span>
        </div>

        <button
          onClick={onOpenBeforeIScan}
          className="group flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Before-I-Scan Interceptor</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Center Hero: The Big Number */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
        <div className="lg:col-span-7">
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-2">
            <span>Daily Safe-to-Spend Limit</span>
            <span className="text-[10px] lowercase px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
              stress-free budget
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span
              className={`font-mono text-4xl sm:text-6xl font-black tracking-tight ${statusConfig.accent}`}
            >
              {formatINR(dailySafeToSpend)}
            </span>
            <span className="text-base sm:text-lg font-medium text-zinc-400">
              / day
            </span>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
            {comfortMessage}
          </p>
        </div>

        {/* Right Gauge / Metrics Bento */}
        <div className="lg:col-span-5 flex flex-col gap-3.5 bg-black/40 border border-white/5 rounded-xl p-4">
          {/* Today's Spend Progress */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-zinc-400 font-medium">Today&apos;s Burn:</span>
              <span className="font-mono text-zinc-200">
                {formatINR(spentToday)} / {formatINR(dailySafeToSpend)}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${statusConfig.progressBar}`}
                style={{ width: `${percentTodaySpent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] mt-1 text-zinc-400">
              <span>{percentTodaySpent}% consumed</span>
              <span>
                {remainingToday > 0 ? `${formatINR(remainingToday)} left today` : "Limit reached today"}
              </span>
            </div>
          </div>

          {/* Micro Stats Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
            <div className="bg-white/[0.02] p-2 rounded-lg">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-0.5">
                <Wallet className="w-3 h-3 text-emerald-400" />
                <span>Runway Pool</span>
              </div>
              <div className="font-mono text-sm font-bold text-white">
                {formatINR(remainingMonthlyAllowance)}
              </div>
            </div>

            <div className="bg-white/[0.02] p-2 rounded-lg">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-0.5">
                <Calendar className="w-3 h-3 text-cyan-400" />
                <span>Days Remaining</span>
              </div>
              <div className="font-mono text-sm font-bold text-white">
                {daysRemaining} Days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom footer: Formula transparency */}
      <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-zinc-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-zinc-400">
            Formula: ({formatINR(profile.monthlyAllowance)} Allowance - {formatINR(profile.fixedEssentials)} Fixed) ÷ {daysRemaining} days left
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors font-medium"
        >
          Edit Budget & Fixed Essentials →
        </button>
      </div>
    </div>
  );
};

