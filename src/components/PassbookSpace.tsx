"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { TransactionHistory } from "@/components/TransactionHistory";
import {
  Smartphone,
  Mail,
  Check,
  Copy,
  CreditCard,
  ShoppingBag,
  UtensilsCrossed,
  Car,
  Film,
  PieChart,
  Clock,
  Layers,
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

export interface ActivityEvent {
  id: string;
  source: "Phone SMS Webhook" | "Gmail Auto-Forward" | "Bank / UPI SMS" | "Credit Card SMS";
  title: string;
  merchant: string;
  amount: number;
  time: string;
  type: "debit" | "credit" | "bill";
  category: SpendCategory | string;
  bankTag: string;
  roundUp?: number;
  rawText?: string;
}

export const PassbookSpace: React.FC<PassbookSpaceProps> = () => {
  const { isAutoPayPaused } = useFinancialMemory();

  const [activeTab, setActiveTab] = useState<"autopilot-sync" | "insights" | "ledger">("autopilot-sync");
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Top Spend Categories initialized to sum exactly to spentThisMonth (₹17,708)
  // 6850 + 4920 + 3438 + 2500 = 17,708
  const [categoryBreakdown] = useState<Record<SpendCategory, number>>({
    "Food & Dining": 6850,
    "Shopping & Gear": 4920,
    "Transport & Subscriptions": 3438,
    "Entertainment & Outings": 2500,
  });

  // Clean Consumer Recent Activity Stream
  const [activityStream] = useState<ActivityEvent[]>([
    {
      id: "ev_1",
      source: "Bank / UPI SMS",
      title: "UPI Debit",
      merchant: "Swiggy Gourmet Bowl",
      amount: 480,
      time: "12 mins ago",
      type: "debit",
      category: "Food & Dining",
      bankTag: "HDFC Bank",
      roundUp: 20,
    },
    {
      id: "ev_2",
      source: "Credit Card SMS",
      title: "Credit Card Bill",
      merchant: "ICICI Bank Coral Card",
      amount: 9800, // Matches app's live card dues (₹9,800 ICICI / ₹8,108 HDFC)
      time: "1 hour ago",
      type: "bill",
      category: "Credit Card Bill",
      bankTag: "ICICI Bank",
    },
    {
      id: "ev_3",
      source: "Bank / UPI SMS",
      title: "UPI Debit",
      merchant: "Blue Tokai Coffee Roasters",
      amount: 350,
      time: "3 hours ago",
      type: "debit",
      category: "Food & Dining",
      bankTag: "SBI UPI",
      roundUp: 50,
    },
    {
      id: "ev_4",
      source: "Gmail Auto-Forward",
      title: "Mutual Fund SIP",
      merchant: "Nifty 50 Index Mutual Fund",
      amount: 5000,
      time: "Yesterday @ 6:00 PM",
      type: "debit",
      category: "Investments & SIPs",
      bankTag: "HDFC Bank",
    },
    {
      id: "ev_5",
      source: "Bank / UPI SMS",
      title: "Quick Commerce Debit",
      merchant: "Zepto 10-Min Groceries",
      amount: 540,
      time: "Yesterday @ 2:15 PM",
      type: "debit",
      category: "Food & Dining",
      bankTag: "HDFC Bank",
      roundUp: 60,
    },
    {
      id: "ev_6",
      source: "Bank / UPI SMS",
      title: "Commute Debit",
      merchant: "Uber Ride Home",
      amount: 350,
      time: "2 days ago",
      type: "debit",
      category: "Transport & Subscriptions",
      bankTag: "HDFC Bank",
      roundUp: 50,
    },
  ]);

  // Consumer Tag Helper for Clean Badges (UPI, Card, SIP)
  const getConsumerTag = (ev: ActivityEvent) => {
    if (
      ev.category === "Investments & SIPs" ||
      /sip|invest/i.test(ev.title) ||
      /sip|fund/i.test(ev.merchant)
    ) {
      return {
        label: "SIP",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        iconBg: "bg-purple-100 text-purple-700",
        icon: <Layers className="w-4 h-4" />,
      };
    }
    if (
      ev.type === "bill" ||
      ev.source === "Credit Card SMS" ||
      ev.category === "Credit Card Bill" ||
      /card/i.test(ev.merchant) ||
      /card/i.test(ev.bankTag)
    ) {
      return {
        label: "Card",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        iconBg: "bg-blue-100 text-blue-700",
        icon: <CreditCard className="w-4 h-4" />,
      };
    }
    return {
      label: "UPI",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-700",
      icon: <Smartphone className="w-4 h-4" />,
    };
  };

  const handleCopyForwardingEmail = () => {
    navigator.clipboard.writeText("alex@pocketsense.ai");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const totalSpentThisMonth = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);

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
  let accumulatedPct = 0;

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
              <span>SMS &amp; Insights: Zero-Touch Autopilot Sync</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Set Once, Forget Forever
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Effortless, zero-touch tracking. PocketSense automatically syncs bank alerts, credit card dues, and UPI spends.
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
            <span className="hidden sm:inline">Zero-Touch Autopilot</span>
            <span className="sm:hidden">Autopilot</span>
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-3 py-1.5 rounded-lg transition-all text-center ${
              activeTab === "insights"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="hidden sm:inline">Spending Insights</span>
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

          {/* RECENT ACTIVITY FEED */}
          <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  Recent Activity ({activityStream.length} Events)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Auto-Synced
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {activityStream.map((ev) => {
                const roundUpAmt =
                  ev.roundUp ?? (ev.amount % 100 === 0 ? 0 : 100 - (ev.amount % 100));
                const consumerTag = getConsumerTag(ev);

                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs font-mono hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          consumerTag.iconBg
                        }`}
                      >
                        {consumerTag.icon}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate">{ev.merchant}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${consumerTag.badgeClass}`}
                          >
                            {consumerTag.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {ev.bankTag} • {ev.time}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-bold block ${
                          ev.type === "credit"
                            ? "text-emerald-700"
                            : ev.type === "bill" || consumerTag.label === "Card"
                            ? "text-blue-700"
                            : "text-slate-900"
                        }`}
                      >
                        {ev.type === "credit" ? "+" : ev.type === "debit" ? "-" : ""}
                        {formatINR(ev.amount)}
                      </span>

                      {/* Spare-change round-up badge: HIDDEN whenever Silent Risk Guard (isAutoPayPaused) is active */}
                      {!isAutoPayPaused && ev.type === "debit" && ev.amount > 0 && roundUpAmt > 0 && (
                        <div className="mt-0.5">
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                            +₹{roundUpAmt} Round-Up
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                    {categoriesConfig.map((cat) => {
                      const amount = categoryBreakdown[cat.key] || 0;
                      const pct = totalSpentThisMonth > 0 ? amount / totalSpentThisMonth : 0;
                      const strokeDasharray = `${pct * circumference} ${circumference}`;
                      const strokeDashoffset = -accumulatedPct * circumference;
                      accumulatedPct += pct;

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
                    })}
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
