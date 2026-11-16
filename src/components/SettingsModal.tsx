"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { Sliders, X, Check, RotateCcw, Wallet, Building2 } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, updateSalary, loadSyntheticDemo } = useFinancialMemory();

  const [salary, setSalary] = useState(String(profile.monthlySalary || 75000));
  const [fixed, setFixed] = useState(String(profile.fixedEssentials || 32000));
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseFloat(salary);
    const f = parseFloat(fixed);
    if (!isNaN(s) && !isNaN(f) && s > 0) {
      updateSalary(s, f);
      setSavedAlert(true);
      setTimeout(() => {
        setSavedAlert(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md fintech-card rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Capital Allocation &amp; Fixed Commitments
              </h3>
              <p className="text-xs text-slate-400">
                Calibrate salary and non-negotiables for accurate safe daily pacing
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
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Monthly In-Hand Take-Home Salary (₹)</span>
              <span className="text-[10px] text-slate-500 font-mono">Net of TDS</span>
            </label>
            <input
              type="number"
              min="5000"
              required
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Net salary credited to your bank account on the 1st of each month.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Fixed Obligations &amp; Investments (₹)</span>
              <span className="text-[10px] text-slate-500 font-mono">Rent + SIPs + Utilities</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={fixed}
              onChange={(e) => setFixed(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Non-negotiable monthly expenses (Rent, SIP mutual funds, electricity, maid).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-400 font-medium">Discretionary Capital Pool:</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {formatINR(Math.max(0, parseFloat(salary || "0") - parseFloat(fixed || "0")))}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              This pool is divided across remaining days in the month to compute your Safe Daily Limit.
            </p>
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
              <span>Reset to ₹75,000 Demo</span>
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
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Allocation</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
