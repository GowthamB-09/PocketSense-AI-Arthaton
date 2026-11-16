"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import {
  Sparkles,
  Command,
  FileText,
  Brain,
  Sliders,
  ShieldCheck,
  Flame,
  Check,
  Zap,
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
      particleCount: 40,
      spread: 60,
      origin: { y: 0.15 },
    });
    setTimeout(() => setLoadedAlert(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#09090B]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
            <span className="font-mono text-sm font-black">₹</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-white">
              PocketSense
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-400">
              PRO
            </span>
          </div>
        </div>

        {/* Center: Demo Data & Rate-Limit Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleDemoMode()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
              demoMode
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400"
            }`}
            title="Toggle between instant pre-computed demo mode and live Gemini AI"
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${demoMode ? "text-amber-400" : "text-zinc-500"}`} />
            <span className="hidden sm:inline">Mode:</span>
            <span className="font-mono text-[11px]">
              {demoMode ? "Pre-Computed" : "Live AI"}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${demoMode ? "bg-amber-400" : "bg-emerald-400"}`} />
          </button>

          <button
            onClick={handleLoadDemo}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all border ${
              loadedAlert
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white"
            }`}
            title="Load 30 days of realistic ₹75,000 professional salary data"
          >
            {loadedAlert ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Loaded</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Load Demo Data</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Streak */}
          <button
            onClick={onOpenMemoryViewer}
            className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20"
          >
            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{profile.disciplineStreak}d</span>
          </button>

          {/* Before I Scan */}
          <button
            onClick={onOpenBeforeIScan}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500 hover:bg-emerald-400 text-black transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Before I Scan</span>
            <kbd className="hidden lg:inline-flex items-center px-1 rounded text-[10px] font-mono bg-black/20 text-black">
              ⌘K
            </kbd>
          </button>

          {/* Parse SMS */}
          <button
            onClick={onOpenSmsParser}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Parse SMS</span>
          </button>

          {/* Memory */}
          <button
            onClick={onOpenMemoryViewer}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Financial Memory"
          >
            <Brain className="w-4 h-4 text-violet-400" />
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            title="Adjust Salary & Fixed Expenses"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
