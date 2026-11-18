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
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center items-end p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-lg bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-slide-up-mobile sm:animate-fade-in">
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Budget &amp; Salary Settings
              </h3>
              <p className="text-xs text-slate-500">
                Runs on calendar autopilot with zero daily effort
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4">
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
                className="w-full px-3.5 py-2.5 sm:py-2 text-base sm:text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[44px]"
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
                className="w-full px-3.5 py-2.5 sm:py-2 text-base sm:text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[44px]"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Rent, SIPs, utilities</span>
            </div>
          </div>

          {/* Salary Credit Day Selector */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Salary Credit Day of Month</span>
              </span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Day {salaryCreditDay}
              </span>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When does your salary hit your account? PocketSense automatically aligns your monthly pay cycle to this day.
            </p>

            <div className="flex items-center gap-2 pt-1">
              {[1, 5, 25, 28, 30].map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSalaryCreditDay(day)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                    salaryCreditDay === day
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Math Blueprint */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs space-y-1.5">
            <div className="flex justify-between items-center text-slate-600">
              <span>Discretionary Pool:</span>
              <strong className="text-slate-900">{formatINR(discretionaryPool)}</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Current Real Day:</span>
              <strong className="text-slate-900">Day {realDay} of month</strong>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Calculated Safe Spend:</span>
              <strong className="text-emerald-700">
                {formatINR(Math.round(discretionaryPool / 30))}/day
              </strong>
            </div>
          </div>

          {/* Reset ledger checkbox */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white">
            <input
              id="resetLedger"
              type="checkbox"
              checked={resetLedger}
              onChange={(e) => setResetLedger(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <label htmlFor="resetLedger" className="text-xs text-slate-700 leading-tight cursor-pointer">
              <strong className="block font-semibold">Start Fresh (Clear current month spent transactions)</strong>
              <span className="text-slate-500 text-[11px]">
                Check this if you are starting a new salary cycle today.
              </span>
            </label>
          </div>

          {isPoolDeficit && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Your spent amount ({formatINR(analysis.discretionarySpentSoFar)}) exceeds this discretionary pool. Check &ldquo;Start Fresh&rdquo; above to reset spends.
              </span>
            </div>
          )}

          {/* Submit Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              className="w-full py-3.5 sm:py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[48px] active:scale-98"
            >
              {savedAlert ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved! Autopilot Active</span>
                </>
              ) : (
                <span>Save Salary Cycle Settings</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => {
              loadSyntheticDemo();
              setSalary(String(75000));
              setFixed(String(32000));
              setSalaryCreditDay(1);
            }}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Demo Profile</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
