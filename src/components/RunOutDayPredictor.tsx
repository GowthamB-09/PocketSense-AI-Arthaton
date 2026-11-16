"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { Activity, AlertCircle, Calendar } from "lucide-react";

export const RunOutDayPredictor: React.FC = () => {
  const { analysis } = useFinancialMemory();
  const { burnRatePerDay, dailySafeToSpend, projectedRunOutDay, currentDayOfMonth, daysInMonth } = analysis;

  const isSqueezeRisk = projectedRunOutDay <= 20;

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

          {isSqueezeRisk && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <AlertCircle className="w-3 h-3" />
              <span>Spending Fast</span>
            </span>
          )}
        </div>

        {/* Burn Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Current Daily Spend
            </span>
            <span className="text-base font-bold text-rose-700">
              {formatINR(burnRatePerDay)} <span className="text-xs text-slate-500 font-normal">/ day</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
              Target Daily Spend
            </span>
            <span className="text-base font-bold text-emerald-700">
              {formatINR(dailySafeToSpend)} <span className="text-xs text-slate-500 font-normal">/ day</span>
            </span>
          </div>
        </div>

        {/* Timeline Bar */}
        <div className="my-4 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
            <span>Day 1 (Payday)</span>
            <span className="text-amber-700 font-semibold">Day 20 Alert</span>
            <span>Day 30 (Next Salary)</span>
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
                  projectedRunOutDay <= 20 ? "bg-rose-400/80" : "bg-emerald-400"
                }`}
                style={{
                  width: `${((projectedRunOutDay - currentDayOfMonth) / daysInMonth) * 100}%`,
                }}
              />
            ) : null}

            {/* Day 20 Marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
              style={{ left: `${(20 / daysInMonth) * 100}%` }}
              title="Day 20 Warning Marker"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Money estimated to last until:</span>
        </span>
        <span className={projectedRunOutDay <= 20 ? "text-rose-700 font-bold text-sm" : "text-emerald-700 font-bold text-sm"}>
          Day {projectedRunOutDay} of {daysInMonth}
        </span>
      </div>
    </div>
  );
};
