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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold shadow-sm">
            <span className="font-mono text-sm font-black">₹</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-slate-900">
                PocketSense
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:block">
              {profile.userName} • Personal Capital
            </span>
          </div>
        </div>

        {/* Center: System Status & Pacing */}
        <div className="hidden lg:flex items-center gap-2.5">
          <button
            onClick={() => toggleDemoMode()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              demoMode
                ? "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Toggle between instant pre-computed demo mode and live Gemini AI"
          >
            <span className={`w-2 h-2 rounded-full ${demoMode ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
            <span>{demoMode ? "Demo Mode (Quota Safe)" : "Live AI Model Connected"}</span>
            <span className="text-[10px] font-mono text-slate-400 border-l border-slate-300 pl-1.5">
              {demoMode ? "Offline" : "Gemini 2.5"}
            </span>
          </button>

          <button
            onClick={handleLoadDemo}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              loadedAlert
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
            title="Reload 30-day corporate dataset (Rohan Mehta, ₹75,000 Take-Home)"
          >
            {loadedAlert ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Dataset Reset</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-all shadow-sm"
            title="Discipline Streak & Behavioral Memory"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="font-semibold">{profile.disciplineStreak}d Streak</span>
          </button>

          {/* Before I Scan (Primary Action) */}
          <button
            onClick={onOpenBeforeIScan}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>Intercept Scan</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-700 text-emerald-100 font-bold">
              ⌘K
            </kbd>
          </button>

          {/* Statement Parser Drawer */}
          <button
            onClick={onOpenSmsParser}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Import Alerts</span>
          </button>

          {/* Behavioral Memory Audit */}
          <button
            onClick={onOpenMemoryViewer}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
            title="Behavioral Memory & Risk Profile"
          >
            <Brain className="w-4 h-4 text-violet-600" />
          </button>

          {/* Budget & Account Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors"
            title="Capital Allocation & Salary Settings"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
