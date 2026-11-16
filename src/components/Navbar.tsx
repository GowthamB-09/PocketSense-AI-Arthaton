"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import {
  Sparkles,
  FileText,
  Brain,
  Sliders,
  ShieldCheck,
  Flame,
  Check,
  Zap,
  Building2,
  ChevronDown,
} from "lucide-react";
import confetti from "canvas-confetti";

interface NavbarProps {
  onOpenBeforeIScan: () => void;
  onOpenSmsParser: () => void;
  onOpenMemoryViewer: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBeforeIScan,
  onOpenSmsParser,
  onOpenMemoryViewer,
  onOpenSettings,
}) => {
  const { profile, loadSyntheticDemo, demoMode, toggleDemoMode } = useFinancialMemory();
  const [loadedAlert, setLoadedAlert] = useState(false);

  const handleLoadDemo = () => {
    loadSyntheticDemo();
    setLoadedAlert(true);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.15 },
    });
    setTimeout(() => setLoadedAlert(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080B11]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Organization */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <span className="font-mono text-sm font-black">₹</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">
                PocketSense
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                Capital
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:block">
              {profile.userName} • Personal Discretionary Account
            </span>
          </div>
        </div>

        {/* Center: System Status & Pacing */}
        <div className="hidden lg:flex items-center gap-2.5">
          <button
            onClick={() => toggleDemoMode()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              demoMode
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/15"
                : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
            title="Toggle between instant pre-computed demo mode and live Gemini AI"
          >
            <span className={`w-2 h-2 rounded-full ${demoMode ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
            <span>{demoMode ? "Demo Mode (Rate-Limit Safe)" : "Live AI Model Connected"}</span>
            <span className="text-[10px] font-mono text-slate-400 border-l border-slate-700/60 pl-1.5">
              {demoMode ? "Offline" : "Gemini 2.5"}
            </span>
          </button>

          <button
            onClick={handleLoadDemo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              loadedAlert
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Reload 30-day corporate dataset (Rohan Mehta, ₹75,000 Take-Home)"
          >
            {loadedAlert ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Dataset Reset</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reset Demo Data</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Primary Corporate Actions */}
        <div className="flex items-center gap-2">
          {/* Discipline Streak Pill */}
          <button
            onClick={onOpenMemoryViewer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 transition-all"
            title="Discipline Streak & Behavioral Memory"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{profile.disciplineStreak}d Streak</span>
          </button>

          {/* Before I Scan (Primary Action) */}
          <button
            onClick={onOpenBeforeIScan}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-[0_0_16px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            <span>Intercept Scan</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-950/20 text-slate-950 font-bold">
              ⌘K
            </kbd>
          </button>

          {/* Statement Parser Drawer */}
          <button
            onClick={onOpenSmsParser}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Import Alerts</span>
          </button>

          {/* Behavioral Memory Audit */}
          <button
            onClick={onOpenMemoryViewer}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-colors"
            title="Behavioral Memory & Risk Profile"
          >
            <Brain className="w-4 h-4 text-violet-400" />
          </button>

          {/* Budget & Account Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-800 transition-colors"
            title="Capital Allocation & Salary Settings"
          >
            <Sliders className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
