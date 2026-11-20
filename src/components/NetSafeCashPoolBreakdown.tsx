"use client";

import React, { useMemo } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  Landmark,
  CreditCard,
  ShieldCheck,
  Equal,
  Minus,
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
} from "lucide-react";

interface NetSafeCashPoolBreakdownProps {
  onOpenRiskDetails?: () => void;
  onOpenSettings?: () => void;
}

export const NetSafeCashPoolBreakdown: React.FC<NetSafeCashPoolBreakdownProps> = ({
  onOpenRiskDetails,
  onOpenSettings,
}) => {
  const { profile } = useFinancialMemory();

  const totalLinkedBankCash = profile.totalLinkedBankCash ?? 48500;
  const upcomingCardDues = profile.creditCardDues ?? 17908;

  // Ring-Fenced Calendar Events (Auto-Pre-Lock active, unpaid, excluding autopay)
  const ringFencedEvents = useMemo(() => {
    return (profile.calendarEvents || []).filter(
      (e) => e.isPreLocked && !e.isPaid && e.category !== "autopay"
    );
  }, [profile.calendarEvents]);

  const ringFencedTotal = useMemo(() => {
    return ringFencedEvents.reduce((sum, e) => sum + (e.budget || 0), 0);
  }, [ringFencedEvents]);

  // NET SAFE CASH POOL = Total Linked Bank Cash − Upcoming Card Dues − Ring-Fenced Calendar Events
  const netSafePool = Math.max(
    0,
    totalLinkedBankCash - upcomingCardDues - ringFencedTotal
  );

  return (
    <div className="fintech-card rounded-2xl p-4 sm:p-5 bg-white border border-slate-200 shadow-sm space-y-4 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
            <Shield className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Net Safe Cash Pool Breakdown</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold hidden sm:inline">
                Real-Time Formula
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Live math linking bank cash, credit card bills, and ring-fenced calendar budgets
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80 self-start sm:self-auto">
          <span className="text-emerald-700 font-bold">Bank Cash</span> − <span className="text-rose-600 font-bold">Card Dues</span> − <span className="text-purple-600 font-bold">Pre-Locked Events</span>
        </div>
      </div>

      {/* Compact 3-Card / 3-Row Formula Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 items-center">
        {/* Card 1: Total Linked Bank Cash */}
        <div
          onClick={onOpenSettings}
          className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors cursor-pointer group"
          title="Click to view bank and salary settings"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
              <Landmark className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-slate-700 font-semibold block truncate">
                Total Linked Bank Cash
              </span>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                HDFC + SBI Checking
              </span>
            </div>
          </div>
          <div className="font-mono text-right shrink-0">
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              ₹{totalLinkedBankCash.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Available</span>
          </div>
        </div>

        {/* Card 2: Upcoming Card Dues */}
        <div
          onClick={onOpenRiskDetails}
          className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/80 flex items-center justify-between gap-3 hover:bg-rose-50 transition-colors cursor-pointer group"
          title="Click to view credit card risk details"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-rose-950 font-semibold block truncate">
                Upcoming Card Dues
              </span>
              <span className="text-[10px] text-rose-600/80 font-mono block truncate">
                ICICI + HDFC Bills
              </span>
            </div>
          </div>
          <div className="font-mono text-right shrink-0">
            <span className="text-xs sm:text-sm font-bold text-rose-700 block">
              − ₹{upcomingCardDues.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-rose-600 font-semibold">Reserved</span>
          </div>
        </div>

        {/* Card 3: Ring-Fenced Calendar Events */}
        <div
          className="p-3 rounded-xl bg-purple-50/50 border border-purple-200/80 flex items-center justify-between gap-3"
          title={`${ringFencedEvents.length} upcoming events protected in Ring-Fenced Event Shield`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-purple-950 font-semibold block truncate">
                Ring-Fenced Events
              </span>
              <span className="text-[10px] text-purple-600/80 font-mono block truncate">
                {ringFencedEvents.length} Upcoming Gift{ringFencedEvents.length === 1 ? "" : "s"} &amp; Events
              </span>
            </div>
          </div>
          <div className="font-mono text-right shrink-0">
            <span className="text-xs sm:text-sm font-bold text-purple-700 block">
              − ₹{ringFencedTotal.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-purple-600 font-semibold">Pre-Locked</span>
          </div>
        </div>
      </div>

      {/* 2. Net Safe Cash Pool Result Row (Highlighted in Emerald Green) */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-emerald-100/40 border border-emerald-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-black text-emerald-950 tracking-tight uppercase">
                NET SAFE CASH POOL
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                Synced with Salary Bar
              </span>
            </div>
            <p className="text-[11px] font-mono text-emerald-800/90 mt-0.5">
              ₹{totalLinkedBankCash.toLocaleString("en-IN")} − ₹{upcomingCardDues.toLocaleString("en-IN")} − ₹{ringFencedTotal.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-left sm:text-right font-mono">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight block">
              ₹{netSafePool.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] text-emerald-800 font-semibold block">
              Free to Spend Without Risk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
