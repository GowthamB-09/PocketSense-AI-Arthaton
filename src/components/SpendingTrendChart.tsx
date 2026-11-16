"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";

export const SpendingTrendChart: React.FC = () => {
  const { transactions, analysis } = useFinancialMemory();
  const [viewMode, setViewMode] = useState<"categories" | "days">("categories");

  // Aggregate by Category
  const categoryTotals: Record<string, number> = {};
  transactions.forEach((tx) => {
    categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
  });

  const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0) || 1;

  const sortedCategories = Object.entries(categoryTotals)
    .map(([cat, amount]) => ({
      name: cat,
      amount,
      percentage: Math.round((amount / totalSpent) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Group by Day (Day 1 to 14)
  const dailySpendMap: Record<number, number> = {};
  for (let d = 1; d <= 14; d++) dailySpendMap[d] = 0;

  transactions.forEach((tx) => {
    const day = parseInt(tx.date.split("-")[2], 10);
    if (!isNaN(day) && day >= 1 && day <= 14) {
      dailySpendMap[day] = (dailySpendMap[day] || 0) + tx.amount;
    }
  });

  const maxDaily = Math.max(...Object.values(dailySpendMap), 800);

  return (
    <div className="fintech-card rounded-2xl p-6 space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Cashflow Distribution &amp; Velocity
            </h3>
            <p className="text-xs text-slate-400">
              Discretionary capital allocation across categories and days
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-0.5 text-xs">
          <button
            onClick={() => setViewMode("categories")}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              viewMode === "categories"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setViewMode("days")}
            className={`px-3 py-1 rounded-md font-semibold transition-all ${
              viewMode === "days"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            14-Day Velocity
          </button>
        </div>
      </div>

      {/* Categories View */}
      {viewMode === "categories" && (
        <div className="space-y-3 pt-1">
          {sortedCategories.map((cat, idx) => {
            const barColors = [
              "bg-emerald-400",
              "bg-blue-400",
              "bg-indigo-400",
              "bg-amber-400",
              "bg-rose-400",
              "bg-teal-400",
            ];
            const color = barColors[idx % barColors.length];

            return (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white font-bold">{formatINR(cat.amount)}</span>
                    <span className="text-slate-500 text-[11px]">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 14-Day Velocity View */}
      {viewMode === "days" && (
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
            <span>Day 1 (Payday)</span>
            <span className="text-emerald-400 font-semibold">Sustainable Target: {formatINR(analysis.dailySafeToSpend)}/day</span>
            <span>Day 14 (Mid-Month)</span>
          </div>

          {/* Bar Chart Grid */}
          <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1 border-b border-slate-800/80">
            {Object.entries(dailySpendMap).map(([dayStr, amt]) => {
              const day = parseInt(dayStr, 10);
              const heightPct = Math.min(100, Math.round((amt / maxDaily) * 100));
              const isOverSafe = amt > analysis.dailySafeToSpend;

              return (
                <div
                  key={day}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                    Day {day}: {formatINR(amt)}
                  </div>

                  <div
                    className={`w-full rounded-t transition-all ${
                      isOverSafe
                        ? "bg-rose-500 hover:bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]"
                        : "bg-emerald-400 hover:bg-emerald-300"
                    }`}
                    style={{ height: `${Math.max(6, heightPct)}%` }}
                  />
                  <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-rose-500" />
              <span>Above Safe Pacing</span>
              <span className="w-2 h-2 rounded-sm bg-emerald-400 ml-2" />
              <span>Within Safe Cap</span>
            </div>
            <span className="text-slate-500">Hover daily bars for breakdown</span>
          </div>
        </div>
      )}
    </div>
  );
};
