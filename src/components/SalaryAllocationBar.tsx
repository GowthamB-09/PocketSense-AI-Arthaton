"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { Wallet } from "lucide-react";

interface SalaryAllocationBarProps {
  onOpenSettings?: () => void;
}

export const SalaryAllocationBar: React.FC<SalaryAllocationBarProps> = ({ onOpenSettings }) => {
  const { profile } = useFinancialMemory();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const takeHomeSalary = Math.max(1, profile.monthlySalary || 75000);
  const fixedBills = profile.fixedEssentials || 32000;
  const totalLinkedBankCash = profile.totalLinkedBankCash ?? 48500;
  const upcomingCardDues = profile.creditCardDues ?? 17908;

  // Ring-Fenced Event Shield (Auto-Pre-Lock):
  const ringFencedEventsAmount = (profile.calendarEvents || [])
    .filter((e) => e.isPreLocked && !e.isPaid && e.category !== "autopay")
    .reduce((sum, e) => sum + (e.budget || 0), 0);

  // 3. Derive totalSafePool and spentThisMonth Automatically:
  // Guarantees: Fixed Bills (₹32,000) + Spent This Month + Total Safe Pool = Take-Home Salary (₹75,000)
  const totalSafePool = Math.max(0, totalLinkedBankCash - upcomingCardDues - ringFencedEventsAmount);
  const maxSpendableBudget = Math.max(0, takeHomeSalary - fixedBills);
  const spentThisMonth = Math.min(maxSpendableBudget, Math.max(0, maxSpendableBudget - totalSafePool));

  // Proportional segment widths (clamping safe pool at 0 if overspent)
  const fixedRatio = Math.min(1, Math.max(0, fixedBills / takeHomeSalary));
  const spentRatio = Math.min(1 - fixedRatio, Math.max(0, spentThisMonth / takeHomeSalary));
  const safeRatio = Math.max(0, Math.min(1 - fixedRatio - spentRatio, totalSafePool / takeHomeSalary));

  const fixedWidthPct = fixedRatio * 100;
  const spentWidthPct = spentRatio * 100;
  const safeWidthPct = safeRatio * 100;

  // Formatted percentages for tooltip
  const fixedPercent = Math.round((fixedBills / takeHomeSalary) * 100);
  const spentPercent = Math.round((spentThisMonth / takeHomeSalary) * 100);
  const safePercent = Math.max(0, Math.round((totalSafePool / takeHomeSalary) * 100));

  const isOverspent = totalSafePool <= 0;

  return (
    <div className="fintech-card rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm space-y-4 transition-all">
      {/* 1. Card Header (Total Salary) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Wallet className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Take-Home Salary
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                100% Allocated
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly Income Breakdown &amp; Safe Pool Allocation
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900">
            {formatINR(takeHomeSalary)}
          </div>
          <span className="text-[11px] font-mono text-slate-400 block">
            Net Monthly Paycheck
          </span>
        </div>
      </div>

      {/* 2. Category Labels Directly Above Each Segment of the Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold px-1 text-slate-700 flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenSettings}
            className={`flex items-center gap-1.5 transition-colors text-left ${
              onOpenSettings ? "cursor-pointer hover:text-indigo-600 focus:outline-hidden" : ""
            }`}
            title="Fixed Bills & SIPs (Rent, SIPs & Utilities) - Click to adjust"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5] shrink-0" />
            <span>Fixed Bills &amp; SIPs</span>
          </button>

          <div
            className="flex items-center gap-1.5 text-slate-700"
            title="Spent This Month (Discretionary Spends)"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
            <span>Spent This Month</span>
          </div>

          <div
            className="flex items-center gap-1.5"
            title="Total Safe Pool (Remaining Safe Cash)"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0 animate-pulse" />
            <span className="text-emerald-700 font-bold">Total Safe Pool</span>
          </div>
        </div>

        {/* Horizontal 3-Segment Stacked Progress Bar */}
        <div className="relative">
          <div
            className="w-full h-7 sm:h-8 rounded-full bg-slate-100 border border-slate-200/80 p-0.5 flex overflow-hidden shadow-inner select-none relative"
            role="progressbar"
            aria-label="Salary Allocation & Safe Pool Breakdown"
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            {/* Segment 1: Fixed Bills & SIPs (Cool Slate / Indigo #4F46E5) */}
            {fixedWidthPct > 0 && (
              <div
                style={{ width: `${fixedWidthPct}%` }}
                onMouseEnter={() => setActiveTooltip("fixed")}
                onMouseLeave={() => setActiveTooltip(null)}
                onClick={() => setActiveTooltip(activeTooltip === "fixed" ? null : "fixed")}
                className="h-full bg-[#4F46E5] hover:bg-[#4338CA] transition-all duration-500 ease-out flex items-center justify-center relative cursor-pointer group rounded-l-full overflow-hidden"
                title={`Fixed Bills & SIPs: ${formatINR(fixedBills)} (${fixedPercent}%)`}
              >
                {fixedWidthPct >= 12 && (
                  <span className="text-[11px] font-mono font-bold text-white px-2 truncate drop-shadow-xs">
                    {formatINR(fixedBills)}
                  </span>
                )}
              </div>
            )}

            {/* Segment 2: Spent This Month (Warm Amber / Coral #F59E0B) */}
            {spentWidthPct > 0 && (
              <div
                style={{ width: `${spentWidthPct}%` }}
                onMouseEnter={() => setActiveTooltip("spent")}
                onMouseLeave={() => setActiveTooltip(null)}
                onClick={() => setActiveTooltip(activeTooltip === "spent" ? null : "spent")}
                className="h-full bg-[#F59E0B] hover:bg-[#D97706] transition-all duration-500 ease-out flex items-center justify-center relative cursor-pointer group overflow-hidden"
                title={`Spent This Month: ${formatINR(spentThisMonth)} (${spentPercent}%)`}
              >
                {spentWidthPct >= 12 && (
                  <span className="text-[11px] font-mono font-bold text-white px-2 truncate drop-shadow-xs">
                    {formatINR(spentThisMonth)}
                  </span>
                )}
              </div>
            )}

            {/* Segment 3: Total Safe Pool (Vibrant Emerald Green #10B981) */}
            {safeWidthPct > 0 && (
              <div
                style={{ width: `${safeWidthPct}%` }}
                onMouseEnter={() => setActiveTooltip("safe")}
                onMouseLeave={() => setActiveTooltip(null)}
                onClick={() => setActiveTooltip(activeTooltip === "safe" ? null : "safe")}
                className="h-full bg-[#10B981] hover:bg-[#059669] transition-all duration-500 ease-out flex items-center justify-center relative cursor-pointer group rounded-r-full overflow-hidden"
                title={`Total Safe Pool: ${formatINR(totalSafePool)} (${safePercent}%)`}
              >
                {safeWidthPct >= 12 && (
                  <span className="text-[11px] font-mono font-bold text-white px-2 truncate drop-shadow-xs">
                    {formatINR(totalSafePool)}
                  </span>
                )}
              </div>
            )}

            {/* Overspent Zero Buffer Fallback indicator */}
            {isOverspent && (
              <div
                style={{ width: `${Math.max(0, 100 - fixedWidthPct - spentWidthPct)}%` }}
                className="h-full bg-rose-500/20 text-rose-700 font-mono text-[10px] font-bold flex items-center justify-center rounded-r-full"
                title="Safe Pool Depleted (₹0 Left)"
              >
                ₹0 Left
              </div>
            )}
          </div>

          {/* Interactive Tooltip Popover on Hover/Tap */}
          {activeTooltip && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-slate-900 text-white text-xs font-mono rounded-lg shadow-lg pointer-events-none animate-fade-in flex items-center gap-1.5 whitespace-nowrap">
              {activeTooltip === "fixed" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#4F46E5]" />
                  <span>Fixed Bills &amp; SIPs: {formatINR(fixedBills)} ({fixedPercent}%)</span>
                </>
              )}
              {activeTooltip === "spent" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span>Spent This Month: {formatINR(spentThisMonth)} ({spentPercent}%)</span>
                </>
              )}
              {activeTooltip === "safe" && (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span>Total Safe Pool: {formatINR(totalSafePool)} ({safePercent}%)</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
