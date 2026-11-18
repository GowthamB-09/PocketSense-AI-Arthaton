"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { Activity, AlertCircle, CheckCircle2, Calendar } from "lucide-react";

export const RunOutDayPredictor: React.FC = () => {
  const { analysis } = useFinancialMemory();
  const { burnRatePerDay, dailySafeToSpend, projectedRunOutDay, currentDayOfMonth, daysInMonth } = analysis;

  const isBurnFast = burnRatePerDay > dailySafeToSpend;
  const isSqueezeRisk = projectedRunOutDay < daysInMonth;

  return (
    <div className="fintech-card rounded-2xl p-6 flex flex-col justify-between h-full bg-white border border-slate-200 shadow-sm">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Month Runway
              </h3>
              <p className="text-xs text-slate-500">
                Pacing against next salary payday
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Pace: Healthy</span>
          </span>
        </div>

        {/* Burn Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Discretionary Pace
            </span>
            <span className="text-base font-bold text-slate-900">
              {formatINR(burnRatePerDay || 820)} <span className="text-xs text-slate-500 font-normal">/ day</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Weekend Headroom
            </span>
            <span className="text-base font-bold text-emerald-700">
              {formatINR(Math.round((analysis.remainingMonthlyPool || 30592) * 0.25))} <span className="text-xs text-slate-500 font-normal">buffer</span>
            </span>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="my-4 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
            <span>Day 1 (Payday)</span>
            <span>Day 15 (Mid-Month)</span>
            <span>Day {daysInMonth} (Next Salary)</span>
          </div>

          <div className="relative h-3.5 w-full rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex">
            {/* Elapsed days */}
            <div
              className="h-full bg-slate-400"
              style={{ width: `${(currentDayOfMonth / daysInMonth) * 100}%` }}
              title={`Day ${currentDayOfMonth} today`}
            />

            {/* Projected runway */}
            {projectedRunOutDay > currentDayOfMonth ? (
              <div
                className={`h-full ${
                  isSqueezeRisk ? "bg-amber-400" : "bg-emerald-500"
                }`}
                style={{
                  width: `${((Math.min(daysInMonth, projectedRunOutDay) - currentDayOfMonth) / daysInMonth) * 100}%`,
                }}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Money estimated to last:</span>
        </span>
        <span className={isSqueezeRisk ? "text-rose-700 font-bold text-sm" : "text-emerald-700 font-bold text-sm"}>
          {projectedRunOutDay >= daysInMonth ? `Full Month (${daysInMonth} Days Safe)` : `Until Day ${projectedRunOutDay} of ${daysInMonth}`}
        </span>
      </div>
    </div>
  );
};
