"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { AlertCircle, Flame, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

export const RunOutDayPredictor: React.FC = () => {
  const { analysis, profile } = useFinancialMemory();
  const { burnRatePerDay, dailySafeToSpend, projectedRunOutDay, statusLevel } = analysis;

  const currentDay = profile.currentDayOfMonth; // e.g. 14
  const daysInMonth = profile.daysInMonth; // 30
  const isCliffDanger = projectedRunOutDay <= 18;

  return (
    <div className="rounded-2xl bg-[#121215] border border-white/10 p-5 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>The &quot;Day 18 Cliff&quot; Run-Out Predictor</span>
              {isCliffDanger && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 animate-pulse">
                  CRITICAL CLIFF
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400">
              87% of Indian students go broke by the 18th due to unmonitored ₹40-₹60 UPI scans.
            </p>
          </div>
        </div>

        {/* Burn rate compare */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <div className="text-zinc-400 text-[11px]">Actual Burn Rate</div>
            <div className="font-mono font-bold text-rose-400">
              {formatINR(burnRatePerDay)} / day
            </div>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div className="text-right">
            <div className="text-zinc-400 text-[11px]">Safe Budget Rate</div>
            <div className="font-mono font-bold text-emerald-400">
              {formatINR(dailySafeToSpend)} / day
            </div>
          </div>
        </div>
      </div>

      {/* 30-Day Timeline Visual Bar */}
      <div className="my-5">
        <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 mb-2">
          <span>Day 1 (Allowance Credited)</span>
          <span className="text-amber-400 font-bold">⚠️ Day 18 (The Student Cliff)</span>
          <span>Day 30 (Month End)</span>
        </div>

        {/* Timeline segments */}
        <div className="relative h-6 w-full rounded-xl bg-zinc-900 border border-white/5 overflow-hidden flex">
          {/* Days passed */}
          <div
            className="h-full bg-zinc-700/60 relative flex items-center justify-end pr-1 text-[10px] font-mono text-zinc-300"
            style={{ width: `${(currentDay / daysInMonth) * 100}%` }}
          >
            <span className="hidden sm:inline">Today (Day {currentDay})</span>
          </div>

          {/* Runway to projected exhaustion */}
          {projectedRunOutDay > currentDay ? (
            <div
              className={`h-full relative flex items-center justify-center text-[10px] font-mono font-semibold ${
                projectedRunOutDay <= 18
                  ? "bg-rose-500/50 text-white"
                  : "bg-emerald-500/30 text-emerald-300"
              }`}
              style={{
                width: `${((projectedRunOutDay - currentDay) / daysInMonth) * 100}%`,
              }}
            >
              <span>Exhaustion</span>
            </div>
          ) : null}

          {/* Red Day 18 Cliff Marker Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-amber-500 z-10 shadow-[0_0_8px_#f59e0b]"
            style={{ left: `${(18 / daysInMonth) * 100}%` }}
            title="The infamous Day 18 Student Cliff"
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span>Days 1-{currentDay} Spent</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 ml-2" />
            <span>Day 18 Cliff</span>
          </div>
          <div className="font-mono text-zinc-300">
            {projectedRunOutDay <= currentDay ? (
              <span className="text-rose-400 font-bold">⚠️ Budget already exhausted!</span>
            ) : (
              <span>
                Projected to hit ₹0 on{" "}
                <span className={projectedRunOutDay <= 18 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                  Day {projectedRunOutDay} of 30
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Founder Coaching Insight */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex items-start gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-zinc-300 leading-relaxed">
          <strong className="text-white">Senior Bhai Intervention: </strong>
          At your current burn of {formatINR(burnRatePerDay)}/day, you will hit dry rock by{" "}
          <span className="text-amber-400 font-semibold font-mono">Day {projectedRunOutDay}</span>.
          Cutting just <span className="text-emerald-400 font-semibold font-mono">₹110/day</span> in late-night snacks &amp; extra tapri runs extends your cash through Day 30 and leaves enough to fund your Goa Trip jar!
        </div>
      </div>
    </div>
  );
};

