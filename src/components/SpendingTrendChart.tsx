"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { BarChart3, PieChart, TrendingUp, Layers } from "lucide-react";

export const SpendingTrendChart: React.FC = () => {
  const { transactions, profile, analysis } = useFinancialMemory();
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

  const maxDaily = Math.max(...Object.values(dailySpendMap), 600);

  return (
    <div className="rounded-2xl bg-[#121215] border border-white/10 p-5 sm:p-6 space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Spending Patterns &amp; Velocity
            </h3>
            <p className="text-xs text-zinc-400">
              Visualizing the small-ticket leaks draining your monthly runway.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex rounded-lg bg-zinc-900 border border-white/10 p-0.5 text-xs">
          <button
            onClick={() => setViewMode("categories")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              viewMode === "categories"
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setViewMode("days")}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              viewMode === "days"
                ? "bg-white/10 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            14-Day Velocity
          </button>
        </div>
      </div>

      {/* Categories View */}
      {viewMode === "categories" && (
        <div className="space-y-3 pt-2">
          {sortedCategories.map((cat, idx) => {
            const barColors = [
              "bg-emerald-500",
              "bg-violet-500",
              "bg-cyan-500",
              "bg-amber-500",
              "bg-rose-500",
              "bg-blue-500",
            ];
            const color = barColors[idx % barColors.length];

            return (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">{cat.name}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-white font-bold">{formatINR(cat.amount)}</span>
                    <span className="text-zinc-500 text-[11px]">({cat.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
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
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-[11px] text-zinc-400 font-mono">
            <span>Day 1 (Nov 1)</span>
            <span className="text-emerald-400">Safe Target: {formatINR(analysis.dailySafeToSpend)}/day</span>
            <span>Day 14 (Nov 14)</span>
          </div>

          {/* Bar Chart Grid */}
          <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1 border-b border-white/10">
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
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/20 text-white font-mono text-[10px] px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20">
                    Day {day}: {formatINR(amt)}
                  </div>

                  <div
                    className={`w-full rounded-t transition-all ${
                      isOverSafe
                        ? "bg-rose-500 hover:bg-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                        : "bg-emerald-500 hover:bg-emerald-400"
                    }`}
                    style={{ height: `${Math.max(6, heightPct)}%` }}
                  />
                  <span className="text-[10px] font-mono text-zinc-400">
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span>Above Safe Limit</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 ml-2" />
              <span>Within Safe Limit</span>
            </div>
            <span className="text-zinc-400">Hover bars to view daily spend</span>
          </div>
        </div>
      )}
    </div>
  );
};

