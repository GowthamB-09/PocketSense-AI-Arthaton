"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { Activity, AlertCircle, Calendar, Gauge } from "lucide-react";

export const RunOutDayPredictor: React.FC = () => {
  const { analysis } = useFinancialMemory();
  const { burnRatePerDay, dailySafeToSpend, projectedRunOutDay, currentDayOfMonth, daysInMonth } = analysis;

  const isSqueezeRisk = projectedRunOutDay <= 20;

  return (
    <div className="fintech-card rounded-2xl p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                Burn Velocity vs. Payday Runway
              </h3>
              <p className="text-xs text-slate-400">
                Pacing discretionary capital against next salary credit
              </p>
            </div>
          </div>

          {isSqueezeRisk && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-3 h-3" />
              <span>Velocity High</span>
            </span>
          )}
        </div>

        {/* Burn Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Current Daily Burn
            </span>
            <span className="text-base font-bold text-rose-400">
              {formatINR(burnRatePerDay)} <span className="text-xs text-slate-400 font-normal">/ day</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Target Sustainable Pacing
            </span>
            <span className="text-base font-bold text-emerald-400">
              {formatINR(dailySafeToSpend)} <span className="text-xs text-slate-400 font-normal">/ day</span>
            </span>
          </div>
        </div>

        {/* 30-Day Payday Runway Bar */}
        <div className="my-4 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
            <span>Day 1 (Salary In)</span>
            <span className="text-amber-400 font-medium">Day 20 Squeeze Marker</span>
            <span>Day 30 (Next Payday)</span>
          </div>

          <div className="relative h-3.5 w-full rounded-md bg-slate-950 border border-slate-800 overflow-hidden flex">
            {/* Elapsed days */}
            <div
              className="h-full bg-slate-600/90"
              style={{ width: `${(currentDayOfMonth / daysInMonth) * 100}%` }}
              title={`Days 1-${currentDayOfMonth} elapsed`}
            />

            {/* Projected runway */}
            {projectedRunOutDay > currentDayOfMonth ? (
              <div
                className={`h-full ${
                  projectedRunOutDay <= 20 ? "bg-rose-500/60" : "bg-emerald-500/50"
                }`}
                style={{
                  width: `${((projectedRunOutDay - currentDayOfMonth) / daysInMonth) * 100}%`,
                }}
              />
            ) : null}

            {/* Day 20 Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10 shadow-[0_0_6px_rgba(245,158,11,0.8)]"
              style={{ left: `${(20 / daysInMonth) * 100}%` }}
              title="Day 20 Squeeze Critical Threshold"
            />
          </div>
        </div>
      </div>

      {/* Footer Diagnostic */}
      <div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Projected Discretionary Exhaustion:</span>
        </span>
        <span className={projectedRunOutDay <= 20 ? "text-rose-400 font-bold text-sm" : "text-emerald-400 font-bold text-sm"}>
          Day {projectedRunOutDay} of 30
        </span>
      </div>
    </div>
  );
};
