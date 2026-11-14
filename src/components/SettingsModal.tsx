"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { Sliders, X, Sparkles, Check, RotateCcw } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, updateAllowance, loadSyntheticDemo, clearAllData } = useFinancialMemory();

  const [allowance, setAllowance] = useState(String(profile.monthlyAllowance));
  const [fixed, setFixed] = useState(String(profile.fixedEssentials));
  const [savedAlert, setSavedAlert] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(allowance);
    const f = parseFloat(fixed);
    if (!isNaN(a) && !isNaN(f) && a > 0) {
      updateAllowance(a, f);
      setSavedAlert(true);
      setTimeout(() => {
        setSavedAlert(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#121215] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Student Allowance &amp; Fixed Budget
              </h3>
              <p className="text-xs text-zinc-400">
                Calibrate your monthly parameters for exact Safe-to-Spend calculations.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Monthly Pocket Money / Allowance (₹)
            </label>
            <input
              type="number"
              min="500"
              required
              value={allowance}
              onChange={(e) => setAllowance(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Usually credited on the 1st of the month by parents.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Fixed Essentials &amp; Canteen Pass (₹)
            </label>
            <input
              type="number"
              min="0"
              required
              value={fixed}
              onChange={(e) => setFixed(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Mandatory expenses (Hostel mess card, monthly metro pass, Wi-Fi share).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-400">
            <div className="text-zinc-300 font-semibold mb-1">Discretionary Spending Pool:</div>
            <div className="font-mono text-sm font-bold text-emerald-400">
              {formatINR(Math.max(0, parseFloat(allowance || "0") - parseFloat(fixed || "0")))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                loadSyntheticDemo();
                onClose();
              }}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to ₹6,000 Demo</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                {savedAlert ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Update Budget</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

