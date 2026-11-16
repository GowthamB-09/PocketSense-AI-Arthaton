"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  Sliders,
  X,
  Check,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, analysis, updateSalary, loadSyntheticDemo } = useFinancialMemory();

  // Calendar calculations
  const now = new Date();
  const realDay = now.getDate();
  const realDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonthName = monthNames[now.getMonth()];

  const [salary, setSalary] = useState(String(profile.monthlySalary || 75000));
  const [fixed, setFixed] = useState(String(profile.fixedEssentials || 32000));
  
  // Date configuration
  const [useRealDate, setUseRealDate] = useState<boolean>(profile.useRealCalendarDate ?? false);
  const [simulatedDay, setSimulatedDay] = useState<number>(profile.currentDayOfMonth || 14);

  // Transaction ledger handling
  const [resetLedger, setResetLedger] = useState<boolean>(false);
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  // Active calculations
  const numSalary = parseFloat(salary) || 0;
  const numFixed = parseFloat(fixed) || 0;
  const discretionaryPool = Math.max(0, numSalary - numFixed);

  const activeDay = useRealDate ? realDay : simulatedDay;
  const activeDaysInMonth = useRealDate ? realDaysInMonth : 30;
  const activeDaysRemaining = Math.max(1, activeDaysInMonth - activeDay + 1);

  const effectiveSpent = resetLedger ? 0 : analysis.discretionarySpentSoFar;
  const effectiveRemainingPool = Math.max(0, discretionaryPool - effectiveSpent);
  const calculatedSafeDaily = Math.floor(effectiveRemainingPool / activeDaysRemaining);
  const isPoolDeficit = !resetLedger && discretionaryPool < analysis.discretionarySpentSoFar && analysis.discretionarySpentSoFar > 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSalary > 0 && numFixed >= 0) {
      updateSalary(
        numSalary,
        numFixed,
        activeDay,
        useRealDate,
        resetLedger
      );
      setSavedAlert(true);
      setTimeout(() => {
        setSavedAlert(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg fintech-card rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Capital Allocation &amp; Cycle Calibration
              </h3>
              <p className="text-xs text-slate-400">
                Configure your monthly salary, non-negotiables, and calendar pacing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
          {/* Salary & Fixed Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Net Take-Home Salary (₹)
              </label>
              <input
                type="number"
                min="5000"
                step="500"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500 block mt-1">In-hand salary after TDS</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fixed Obligations (₹)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={fixed}
                onChange={(e) => setFixed(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Rent, SIPs, EMIs, Maid</span>
            </div>
          </div>

          {/* Date & Cycle Mode */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>How We Determine Today&apos;s Cycle Day</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {activeDaysRemaining} Days Remaining
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setUseRealDate(true)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  useRealDate
                    ? "bg-emerald-500/10 border-emerald-500/30 text-white shadow-sm"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Real Calendar Date</span>
                  {useRealDate && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-1">
                  Today: {currentMonthName} {realDay} (Day {realDay}/{realDaysInMonth})
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUseRealDate(false)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  !useRealDate
                    ? "bg-emerald-500/10 border-emerald-500/30 text-white shadow-sm"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Simulate Cycle Day</span>
                  {!useRealDate && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
                <div className="text-[11px] font-mono text-amber-400 mt-1">
                  Custom Day {simulatedDay} of 30
                </div>
              </button>
            </div>

            {!useRealDate && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Day 1 (Payday)</span>
                  <span className="text-white font-bold">Simulating Day {simulatedDay} of 30</span>
                  <span>Day 30 (Month End)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={simulatedDay}
                  onChange={(e) => setSimulatedDay(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Ledger Handling */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Handling Existing Recorded Expenses ({formatINR(analysis.discretionarySpentSoFar)} recorded)
            </span>

            <div className="flex flex-col sm:flex-row gap-2 text-xs">
              <label className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="radio"
                  name="ledgerOption"
                  checked={!resetLedger}
                  onChange={() => setResetLedger(false)}
                  className="accent-emerald-500"
                />
                <span className="text-slate-300 text-[11px]">Keep existing transactions</span>
              </label>

              <label className="flex-1 flex items-center gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="radio"
                  name="ledgerOption"
                  checked={resetLedger}
                  onChange={() => setResetLedger(true)}
                  className="accent-emerald-500"
                />
                <span className="text-emerald-400 text-[11px] font-semibold">Start fresh ledger (₹0 spent)</span>
              </label>
            </div>
          </div>

          {/* Deficit Alert if expenses exceed pool */}
          {isPoolDeficit && (
            <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Existing recorded spending ({formatINR(analysis.discretionarySpentSoFar)}) exceeds your new discretionary pool ({formatINR(discretionaryPool)}). Select <strong>&ldquo;Start fresh ledger&rdquo;</strong> above to start with a fresh {formatINR(discretionaryPool)} pool.
              </p>
            </div>
          )}

          {/* Live Transparent Formula Preview */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400 pb-1.5 border-b border-slate-850">
              <span className="text-[10px] uppercase tracking-wider font-semibold">Transparent Pacing Formula</span>
              <span className="text-emerald-400 text-[10px]">Live Calculation</span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-300">
                <span>1. Monthly Discretionary Pool (Salary - Fixed):</span>
                <span>{formatINR(discretionaryPool)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>2. Discretionary Spent So Far:</span>
                <span>-{formatINR(effectiveSpent)}</span>
              </div>
              <div className="flex justify-between text-white font-semibold pt-1 border-t border-slate-900">
                <span>3. Remaining Discretionary Pool:</span>
                <span className="text-emerald-400">{formatINR(effectiveRemainingPool)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>4. Days Remaining in Cycle:</span>
                <span>÷ {activeDaysRemaining} Days (Day {activeDay} of {activeDaysInMonth})</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
              <span className="text-xs font-sans text-slate-300 font-semibold">Resulting Safe Daily Limit:</span>
              <span className="text-lg font-black text-emerald-400">
                {formatINR(calculatedSafeDaily)} <span className="text-xs font-normal text-slate-400">/ day</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                loadSyntheticDemo();
                onClose();
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo Dataset</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all"
              >
                {savedAlert ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved &amp; Recalculated!</span>
                  </>
                ) : (
                  <span>Apply &amp; Recalculate</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
