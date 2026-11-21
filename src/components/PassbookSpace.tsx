"use client";

import React, { useState, useMemo } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { TransactionHistory } from "@/components/TransactionHistory";
import {
  Smartphone,
  Mail,
  Check,
  Copy,
  ShoppingBag,
  UtensilsCrossed,
  Car,
  Film,
  PieChart,
  Sparkles,
} from "lucide-react";

interface PassbookSpaceProps {
  onOpenSmsDrawer?: () => void;
}

export type SpendCategory =
  | "Food & Dining"
  | "Shopping & Gear"
  | "Transport & Subscriptions"
  | "Entertainment & Outings";

export const PassbookSpace: React.FC<PassbookSpaceProps> = () => {
  const { profile } = useFinancialMemory();
  const [activeTab, setActiveTab] = useState<"autopilot-sync" | "insights" | "ledger">("autopilot-sync");
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Sync Spent This Month 1:1 with Top Salary Bar
  const takeHomeSalary = Math.max(1, profile.monthlySalary || 75000);
  const fixedBills = profile.fixedEssentials || 32000;
  const totalLinkedBankCash = profile.totalLinkedBankCash ?? 48500;
  const upcomingCardDues = profile.creditCardDues ?? 17908;

  const ringFencedEventsAmount = (profile.calendarEvents || [])
    .filter((e) => e.isPreLocked && !e.isPaid && e.category !== "autopay")
    .reduce((sum, e) => sum + (e.budget || 0), 0);

  const totalSafePool = Math.max(0, totalLinkedBankCash - upcomingCardDues - ringFencedEventsAmount);
  const maxSpendableBudget = Math.max(0, takeHomeSalary - fixedBills);
  const totalSpentThisMonth = Math.min(maxSpendableBudget, Math.max(0, maxSpendableBudget - totalSafePool));

  // Dynamically allocate category breakdown to sum 100% to totalSpentThisMonth
  const foodAmt = Math.round(totalSpentThisMonth * 0.38);
  const shoppingAmt = Math.round(totalSpentThisMonth * 0.28);
  const transportAmt = Math.round(totalSpentThisMonth * 0.20);
  const entertainmentAmt = Math.max(0, totalSpentThisMonth - foodAmt - shoppingAmt - transportAmt);

  const categoryBreakdown: Record<SpendCategory, number> = useMemo(() => ({
    "Food & Dining": foodAmt,
    "Shopping & Gear": shoppingAmt,
    "Transport & Subscriptions": transportAmt,
    "Entertainment & Outings": entertainmentAmt,
  }), [foodAmt, shoppingAmt, transportAmt, entertainmentAmt]);

  const handleCopyForwardingEmail = () => {
    navigator.clipboard.writeText("alex@pocketsense.ai");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const categoriesConfig: {
    key: SpendCategory;
    color: string;
    dotBg: string;
    badgeBg: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "Food & Dining",
      color: "#F59E0B",
      dotBg: "bg-amber-500",
      badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
      icon: <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      key: "Shopping & Gear",
      color: "#8B5CF6",
      dotBg: "bg-purple-500",
      badgeBg: "bg-purple-50 text-purple-900 border-purple-200",
      icon: <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />,
    },
    {
      key: "Transport & Subscriptions",
      color: "#3B82F6",
      dotBg: "bg-blue-500",
      badgeBg: "bg-blue-50 text-blue-900 border-blue-200",
      icon: <Car className="w-3.5 h-3.5 text-blue-600" />,
    },
    {
      key: "Entertainment & Outings",
      color: "#EC4899",
      dotBg: "bg-pink-500",
      badgeBg: "bg-pink-50 text-pink-900 border-pink-200",
      icon: <Film className="w-3.5 h-3.5 text-pink-600" />,
    },
  ];

  // SVG Donut Chart Geometry
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Hub */}
      <div className="fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Auto-Tracked Spending</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                Simulated Demo
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your UPI, bank, and card spends show up here automatically—no manual typing needed.
            </p>
          </div>
        </div>

        {/* View Segmented Switcher */}
        <div className="w-full sm:w-auto grid grid-cols-3 sm:flex rounded-xl bg-slate-100 border border-slate-200 p-1 text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setActiveTab("autopilot-sync")}
            className={`px-3 py-1.5 rounded-lg transition-all text-center ${
              activeTab === "autopilot-sync"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="hidden sm:inline">Auto-Sync</span>
            <span className="sm:hidden">Sync</span>
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-3 py-1.5 rounded-lg transition-all text-center ${
              activeTab === "insights"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="hidden sm:inline">Where It Went</span>
            <span className="sm:hidden">Insights</span>
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-3 py-1.5 rounded-lg transition-all text-center ${
              activeTab === "ledger"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="hidden sm:inline">Spend History</span>
            <span className="sm:hidden">History</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: ZERO-TOUCH AUTOPILOT
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "autopilot-sync" && (
        <div className="space-y-6 animate-fade-in">
          {/* COMPACT SINGLE-LINE STATUS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Bank & Card Email Sync */}
            <div className="p-3.5 px-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">Bank &amp; Card Email Sync:</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ON
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 truncate block">
                    alex@pocketsense.ai
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyForwardingEmail}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shrink-0 shadow-2xs active:scale-95"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedEmail ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Card 2: UPI & Bank SMS Sync */}
            <div className="p-3.5 px-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">UPI &amp; Bank SMS Sync:</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ON
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 truncate block">
                    HDFC • SBI • ICICI • UPI
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: SPENDING INSIGHTS (CLEAN CATEGORY BREAKDOWN + ONE CONCISE AI TAKEAWAY)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "insights" && (
        <div className="space-y-6 animate-fade-in">
          {/* Clean Category Breakdown */}
          <div className="fintech-card rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Category Breakdown</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                      Synced with Spent This Month
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live distribution across your primary spending buckets. Totals sync automatically with simulated spends.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <span className="text-slate-500">Total Spent:</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold">
                  ₹{totalSpentThisMonth.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Donut Chart + Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* SVG Donut Chart */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                  >
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="#E2E8F0"
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    {(() => {
                      let currentAccumulated = 0;
                      return categoriesConfig.map((cat) => {
                        const amount = categoryBreakdown[cat.key] || 0;
                        const pct = totalSpentThisMonth > 0 ? amount / totalSpentThisMonth : 0;
                        const strokeDasharray = `${pct * circumference} ${circumference}`;
                        const strokeDashoffset = -currentAccumulated * circumference;
                        currentAccumulated += pct;

                        if (pct <= 0) return null;

                        return (
                          <circle
                            key={cat.key}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={cat.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            fill="none"
                            className="transition-all duration-500 ease-out"
                          />
                        );
                      });
                    })()}
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                      Spent
                    </span>
                    <span className="text-xl font-black font-mono text-slate-900 tracking-tight">
                      ₹{totalSpentThisMonth.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      This Month
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 mt-2">
                  100% Synced with Top Salary Bar
                </span>
              </div>

              {/* Category Breakdown Cards */}
              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {categoriesConfig.map((cat) => {
                  const amount = categoryBreakdown[cat.key] || 0;
                  const pct = totalSpentThisMonth > 0 ? Math.round((amount / totalSpentThisMonth) * 100) : 0;

                  return (
                    <div
                      key={cat.key}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full ${cat.dotBg} shrink-0`} />
                          <span className="font-bold text-slate-800 truncate">{cat.key}</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 shrink-0">
                          {pct}%
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-black text-slate-900">
                          ₹{amount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Concise AI Takeaway Card */}
          <div className="fintech-card rounded-2xl p-5 bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/50 border border-emerald-200/80 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Spending Takeaway
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
                  Live Monthly Pace
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have spent <strong>₹{totalSpentThisMonth.toLocaleString("en-IN")}</strong> this month across your 4 primary categories. Discretionary spending remains within safe boundaries, keeping your bank cash protected for upcoming card dues (₹17,908) and month-end savings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 3: PASSBOOK LEDGER (CLEAN SCANNABLE LIST)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "ledger" && (
        <div className="space-y-4 animate-fade-in">
          <TransactionHistory />
        </div>
      )}
    </div>
  );
};
