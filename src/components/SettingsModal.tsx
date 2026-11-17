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

  const now = new Date();
  const realDay = now.getDate();

  const [salary, setSalary] = useState(String(profile.monthlySalary || 75000));
  const [fixed, setFixed] = useState(String(profile.fixedEssentials || 32000));
  
  // Salary credit day (default 1)
  const [salaryCreditDay, setSalaryCreditDay] = useState<number>(profile.salaryCreditDay || 1);

  // Transaction ledger handling
  const [resetLedger, setResetLedger] = useState<boolean>(false);
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  const numSalary = parseFloat(salary) || 0;
  const numFixed = parseFloat(fixed) || 0;
  const discretionaryPool = Math.max(0, numSalary - numFixed);
  const isPoolDeficit = !resetLedger && discretionaryPool < analysis.discretionarySpentSoFar && analysis.discretionarySpentSoFar > 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSalary > 0 && numFixed >= 0) {
      updateSalary(
        numSalary,
        numFixed,
        salaryCreditDay,
        true, // Always use automatic real calendar clock
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Budget &amp; Salary Settings
              </h3>
              <p className="text-xs text-slate-500">
                Set your salary cycle once — runs on autopilot with zero daily effort
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
          {/* Salary & Fixed Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Take-Home Salary (₹)
              </label>
              <input
                type="number"
                min="5000"
                step="500"
                required
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Monthly in-hand credit</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fixed Bills &amp; EMIs (₹)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={fixed}
                onChange={(e) => setFixed(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Rent, SIPs, utilities</span>
            </div>
          </div>

          {/* Salary Payday Date Selector */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>When Does Your Salary Arrive?</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                Autopilot Pacing
              </span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSalaryCreditDay(1)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  salaryCreditDay === 1
                    ? "bg-white border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-500/20 font-bold"
                    : "bg-white/60 border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                1st of Month
              </button>

              <button
                type="button"
                onClick={() => setSalaryCreditDay(25)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  salaryCreditDay === 25
                    ? "bg-white border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-500/20 font-bold"
                    : "bg-white/60 border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                25th of Month
              </button>

              <button
                type="button"
                onClick={() => setSalaryCreditDay(realDay)}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  salaryCreditDay === realDay
                    ? "bg-white border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-500/20 font-bold"
                    : "bg-white/60 border-slate-200 text-slate-600 hover:text-slate-900"
                }`}
              >
                Today (Day 1)
              </button>
            </div>

            {/* Custom Day input */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-slate-600">Custom Salary Date:</span>
              <div className="flex items-center gap-1.5 font-mono">
                <span>Day</span>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={salaryCreditDay}
                  onChange={(e) => setSalaryCreditDay(Math.min(31, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                  className="w-14 px-2 py-1 text-xs text-center font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <span className="text-slate-500">of each month</span>
              </div>
            </div>
          </div>

          {/* Ledger Handling */}
          <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-800 block">
              Recorded Expenses ({formatINR(analysis.discretionarySpentSoFar)} logged)
            </span>

            <div className="flex flex-col sm:flex-row gap-2 text-xs">
              <label className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                <input
                  type="radio"
                  name="ledgerOption"
                  checked={!resetLedger}
                  onChange={() => setResetLedger(false)}
                  className="accent-emerald-600"
                />
                <span className="text-slate-700 text-xs font-medium">Keep existing transactions</span>
              </label>

              <label className="flex-1 flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                <input
                  type="radio"
                  name="ledgerOption"
                  checked={resetLedger}
                  onChange={() => setResetLedger(true)}
                  className="accent-emerald-600"
                />
                <span className="text-emerald-700 text-xs font-bold">Start fresh (₹0 spent)</span>
              </label>
            </div>
          </div>

          {/* Deficit Alert if expenses exceed pool */}
          {isPoolDeficit && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Recorded expenses ({formatINR(analysis.discretionarySpentSoFar)}) exceed your new discretionary pool ({formatINR(discretionaryPool)}). Select <strong>&ldquo;Start fresh&rdquo;</strong> to track clean from today.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                loadSyntheticDemo();
                onClose();
              }}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Demo Data</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
              >
                {savedAlert ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Apply Settings</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
