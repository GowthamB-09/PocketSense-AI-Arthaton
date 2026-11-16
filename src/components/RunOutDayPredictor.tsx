"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { Activity } from "lucide-react";

export const RunOutDayPredictor: React.FC = () => {
  const { analysis, profile } = useFinancialMemory();
  const { burnRatePerDay, dailySafeToSpend, projectedRunOutDay } = analysis;

  const currentDay = profile.currentDayOfMonth;
  const daysInMonth = profile.daysInMonth;
  const isSqueezeRisk = projectedRunOutDay <= 20;

  return (
    <div className="rounded-xl bg-[#121215] border border-white/[0.08] p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white tracking-tight">
                Burn Velocity vs. Month-End Runway
              </h3>
              <p className="text-[11px] text-zinc-500">
                Pacing discretionary spending against next payday
              </p>
            </div>
          </div>

          {isSqueezeRisk && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Pacing Fast
            </span>
          )}
        </div>

        {/* Burn rates comparison */}
        <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-lg bg-black/40 border border-white/5 text-xs font-mono">
          <div>
            <span className="text-[10px] text-zinc-500 block">Current Velocity</span>
            <span className="text-sm font-bold text-rose-400">
              {formatINR(burnRatePerDay)} / day
            </span>
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block">Sustainable Target</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatINR(dailySafeToSpend)} / day
            </span>
          </div>
        </div>

        {/* 30-Day Timeline Visual Bar */}
        <div className="my-3">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mb-1.5">
            <span>Day 1 (Payday)</span>
            <span>Day 20 Squeeze</span>
            <span>Day 30</span>
          </div>

          <div className="relative h-4 w-full rounded-md bg-zinc-900 border border-white/5 overflow-hidden flex">
            {/* Days passed */}
            <div
              className="h-full bg-zinc-700/80"
              style={{ width: `${(currentDay / daysInMonth) * 100}%` }}
              title={`Days 1-${currentDay} elapsed`}
            />

            {/* Projected runway */}
            {projectedRunOutDay > currentDay ? (
              <div
                className={`h-full ${
                  projectedRunOutDay <= 20 ? "bg-rose-500/50" : "bg-emerald-500/40"
                }`}
                style={{
                  width: `${((projectedRunOutDay - currentDay) / daysInMonth) * 100}%`,
                }}
              />
            ) : null}

            {/* Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: `${(20 / daysInMonth) * 100}%` }}
              title="Day 20 Squeeze Warning"
            />
          </div>
        </div>
      </div>

      {/* Concise Footnote */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span>Projected pool exhaustion:</span>
        <span className={projectedRunOutDay <= 20 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
          Day {projectedRunOutDay} of 30
        </span>
      </div>
    </div>
  );
};
