"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Landmark,
  Wallet,
  ArrowRight,
  Sparkles,
  Info,
  Calendar,
} from "lucide-react";
import confetti from "canvas-confetti";

interface RiskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RiskDetailsModal: React.FC<RiskDetailsModalProps> = ({ isOpen, onClose }) => {
  const { profile, analysis, payCardBills, isAutoPayPaused } = useFinancialMemory();
  const [successToast, setSuccessToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const takeHomeSalary = profile.monthlySalary || 75000;
  const upcomingCardDues = profile.creditCardDues ?? 17908;
  const bankCash = profile.totalLinkedBankCash ?? 48500;
  const netSafePool = Math.max(0, bankCash - upcomingCardDues);
  const threshold = Math.round(takeHomeSalary * 0.20); // 20% safety trigger threshold (₹15,000)
  const cardBillRatio = takeHomeSalary > 0 ? upcomingCardDues / takeHomeSalary : 0;
  const cardBillPercent = Math.round(cardBillRatio * 100);
  const isTriggered = cardBillRatio > 0.20;

  // Split between primary cards
  const iciciDue = Math.round(upcomingCardDues * 0.56);
  const hdfcDue = upcomingCardDues - iciciDue;

  const handlePayCardBills = () => {
    payCardBills();

    confetti({
      particleCount: 65,
      spread: 75,
      origin: { y: 0.4 },
      colors: ["#10B981", "#059669", "#34D399", "#3B82F6"],
    });

    setSuccessToast("✓ Card bills cleared! Silent Risk Guard untriggered & Friday AutoPay sweeps resumed.");
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div
        className="fintech-card bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl overflow-hidden my-auto relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="risk-details-title"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                isTriggered
                  ? "bg-amber-100/80 text-amber-800 border-amber-300"
                  : "bg-emerald-100/80 text-emerald-800 border-emerald-300"
              }`}
            >
              {isTriggered ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="risk-details-title" className="text-base sm:text-lg font-bold text-slate-900">
                  Silent Risk Guard
                </h2>
                <span
                  className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                    isTriggered
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  {isTriggered ? "Paused autopay sweep" : "All Clear • Sweeps Active"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time cross-account exposure protecting your payday cash flow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Toast Feedback */}
        {successToast && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-6">
          {/* Status Message Banner */}
          {isTriggered ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Multi-Card Bill Trap Detected ({cardBillPercent}% of Salary)</span>
              </div>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                Your credit card bills jumped to <strong>₹{upcomingCardDues.toLocaleString('en-IN')} ({cardBillPercent}% of monthly salary)</strong>. Friday AutoPay sweep is paused so your bank balance stays safe until payday.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>All Clear • Safe Debt Pacing</span>
              </div>
              <p className="text-xs text-emerald-800/90 leading-relaxed">
                Credit card dues (₹{upcomingCardDues.toLocaleString('en-IN')}) are safely at or below the 20% limit ({formatINR(threshold)}). Automated Friday Goal Jar sweeps &amp; spare-change round-ups are fully active.
              </p>
            </div>
          )}

          {/* 20% Risk Threshold Gauge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>Card Dues vs Salary Exposure</span>
              </span>
              <span className="font-mono text-slate-600 font-bold">
                {formatINR(upcomingCardDues)} / {formatINR(takeHomeSalary)} ({cardBillPercent}%)
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-hidden flex items-center">
              <div
                className={`h-full transition-all duration-500 ${
                  isTriggered ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, (upcomingCardDues / takeHomeSalary) * 100))}%` }}
              />
              {/* 20% Threshold Marker Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10"
                style={{ left: "20%" }}
                title="20% Safety Trigger Threshold"
              />
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
              <span>0% (Safe)</span>
              <span className="font-bold text-slate-800">20% Guard Line ({formatINR(threshold)})</span>
              <span>40%+ (Critical)</span>
            </div>
          </div>

          {/* 3-Pill Multi-Account Math Breakdown */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 font-mono">
              Synchronized Multi-Bank Math
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Landmark className="w-3.5 h-3.5 text-slate-600" />
                  <span className="text-[10px] uppercase font-semibold">Total Linked Bank Cash</span>
                </div>
                <span className="text-base font-bold text-slate-900 block">
                  {formatINR(bankCash)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">HDFC + SBI Checking</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] uppercase font-semibold">Upcoming Card Dues</span>
                </div>
                <span className="text-base font-bold text-blue-700 block">
                  {upcomingCardDues > 0 ? `-${formatINR(upcomingCardDues)}` : formatINR(0)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {upcomingCardDues > 0 ? "ICICI + HDFC Bills" : "All Bills Cleared ✓"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-emerald-800 mb-1">
                  <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[10px] uppercase font-bold">Net Safe Cash Pool</span>
                </div>
                <span className="text-base font-bold text-emerald-700 block">
                  {formatINR(netSafePool)}
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5 font-sans">
                  Unchanged after payment
                </span>
              </div>
            </div>
          </div>

          {/* Connected Cards List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
              Linked Credit Cards &amp; Due Dates
            </span>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    ICICI
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Amazon Pay ICICI Card (**8810)</span>
                    <span className="text-[11px] text-slate-500">Due on 22nd (4 days left)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{formatINR(iciciDue)}</span>
                  <span className="text-[10px] text-slate-400">Total Due</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                    HDFC
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">Millennia Credit Card (**3321)</span>
                    <span className="text-[11px] text-slate-500">Due on 26th (8 days left)</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900 block">{formatINR(hdfcDue)}</span>
                  <span className="text-[10px] text-slate-400">Total Due</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Section: Pay Card Bills Now */}
          <div className="pt-2">
            {upcomingCardDues > 0 ? (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={handlePayCardBills}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Card Bills Now (Deduct {formatINR(upcomingCardDues)} from Bank Cash)</span>
                </button>
                <p className="text-[11px] text-slate-500 leading-relaxed text-center">
                  Deducts {formatINR(upcomingCardDues)} from your linked bank cash ({formatINR(bankCash)} → {formatINR(Math.max(0, bankCash - upcomingCardDues))}) and resets card dues to ₹0. Your Net Safe Cash Pool ({formatINR(netSafePool)}) remains unchanged. Silent Risk Guard immediately untrigs and Friday AutoPay sweeps resume.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">All Credit Card Bills Cleared!</p>
                <p className="text-xs text-emerald-700">
                  Card dues are ₹0. Silent Risk Guard is disengaged, and weekly Friday Goal Jar sweeps &amp; spare-change round-ups are running smoothly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Salary Cycle: Day {analysis.currentDayOfMonth || 14} of {analysis.daysInMonth || 30}</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 transition-colors font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
