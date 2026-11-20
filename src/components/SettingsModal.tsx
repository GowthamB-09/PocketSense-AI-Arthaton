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
import { GooglePlacesStatusBadge } from "@/components/GooglePlacesStatusBadge";

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

  const [salary, setSalary] = useState(String(profile.monthlySalary || 75000).slice(0, 9));
  const [fixed, setFixed] = useState(String(profile.fixedEssentials || 32000).slice(0, 9));
  
  // Salary credit day (default 1)
  const [salaryCreditDay, setSalaryCreditDay] = useState<number>(profile.salaryCreditDay || 1);

  // Transaction ledger handling
  const [resetLedger, setResetLedger] = useState<boolean>(false);
  const [savedAlert, setSavedAlert] = useState(false);

  // Sync state whenever modal is opened
  React.useEffect(() => {
    if (isOpen) {
      setSalary(String(Math.min(999999999, profile.monthlySalary || 75000)).slice(0, 9));
      setFixed(String(Math.min(999999999, profile.fixedEssentials || 32000)).slice(0, 9));
      setSalaryCreditDay(profile.salaryCreditDay || 1);
    }
  }, [isOpen, profile.monthlySalary, profile.fixedEssentials, profile.salaryCreditDay]);

  if (!isOpen) return null;

  // Cap Salary & Fixed Bills Inputs at Maximum 9 Digits (<= 999,999,999)
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 9);
    setSalary(rawDigits);
  };

  const handleFixedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, "").slice(0, 9);
    setFixed(rawDigits);
  };

  const numSalary = Math.min(999999999, parseInt(salary, 10) || 0);
  const numFixed = Math.min(999999999, parseInt(fixed, 10) || 0);
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
          {/* Salary & Fixed Inputs - Capped at Maximum 9 Digits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Take-Home Salary (₹)
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {salary.length}/9 digits
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={9}
                required
                value={salary}
                onChange={handleSalaryChange}
                placeholder="75000"
                className="w-full px-3.5 py-2.5 sm:py-2 text-base sm:text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[44px]"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Monthly in-hand credit (max ₹99,99,99,999)</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Fixed Bills &amp; EMIs (₹)
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {fixed.length}/9 digits
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={9}
                required
                value={fixed}
                onChange={handleFixedChange}
                placeholder="32000"
                className="w-full px-3.5 py-2.5 sm:py-2 text-base sm:text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[44px]"
              />
              <span className="text-[10px] text-slate-500 block mt-1">Rent, SIPs, utilities (max ₹99,99,99,999)</span>
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
              <span className="truncate mr-2">Safe Spending Pool:</span>
              <strong className="text-slate-900 shrink-0">{formatINR(discretionaryPool)}</strong>
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

          {/* Google Places API (New) Developer Status */}
          <GooglePlacesStatusBadge variant="settings" />

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
                Your spent amount ({formatINR(analysis.discretionarySpentSoFar)}) exceeds this Extra Spend pool. Check &ldquo;Start Fresh&rdquo; above to reset spends.
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
