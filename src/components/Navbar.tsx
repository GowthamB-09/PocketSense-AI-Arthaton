"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import {
  Sparkles,
  Command,
  FileText,
  Brain,
  Sliders,
  RotateCcw,
  ShieldCheck,
  Flame,
  Check,
  TrendingDown,
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
      particleCount: 50,
      spread: 60,
      origin: { y: 0.2 },
    });
    setTimeout(() => setLoadedAlert(false), 2400);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090B]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Hackathon Tag */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="font-mono text-lg font-black tracking-tight">₹</span>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-white">
                PocketSense <span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-zinc-400">
                Arthaton &apos;26
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Behavioral Money Coach for Indian Students
            </p>
          </div>
        </div>

        {/* Center: Quick Student Demo Dataset & Rate-Limit Fallback CTA */}
        <div className="flex items-center gap-2">
          {/* Demo Fallback Rate-Limit Switch */}
          <button
            onClick={() => toggleDemoMode()}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              demoMode
                ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400 hover:text-white"
            }`}
            title={
              demoMode
                ? "Demo Mode Active: Pre-computed responses ensure judges never get blocked if free API quota rate limits. Click to toggle Live Gemini AI."
                : "Live Gemini AI Active: Click to switch to Demo Mode if you hit free API rate limits."
            }
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${demoMode ? "text-amber-400" : "text-zinc-500"}`} />
            <span className="hidden sm:inline">Demo Mode:</span>
            <span className={`font-mono text-[11px] ${demoMode ? "text-amber-300 font-bold" : "text-zinc-400"}`}>
              {demoMode ? "Pre-Computed" : "Live AI"}
            </span>
            <span className={`w-2 h-2 rounded-full ${demoMode ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
          </button>

          {/* Load Dataset Button */}
          <button
            onClick={handleLoadDemo}
            className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
              loadedAlert
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            }`}
            title="Load 30 days of realistic Indian student UPI SMS records and ₹6,000 allowance"
          >
            {loadedAlert ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Demo Loaded!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden md:inline">Load Student Dataset</span>
                <span className="md:hidden">Load Data</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Streak indicator */}
          <button
            onClick={onOpenMemoryViewer}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
            title="Current Discipline Streak"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-bounce" />
            <span>{profile.disciplineStreak}d Streak</span>
          </button>

          {/* Before I Scan (Command Bar) */}
          <button
            onClick={onOpenBeforeIScan}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all hover:border-white/20"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">Before I Scan</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-zinc-300 border border-white/10">
              <Command className="w-2.5 h-2.5 inline" /> K
            </kbd>
          </button>

          {/* Paste SMS */}
          <button
            onClick={onOpenSmsParser}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-colors"
            title="Paste UPI SMS alerts or upload statement"
          >
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Parse SMS</span>
          </button>

          {/* Financial Memory Drawer Toggle */}
          <button
            onClick={onOpenMemoryViewer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 transition-colors"
            title="View Supermemory Financial Context"
          >
            <Brain className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Memory</span>
          </button>

          {/* Settings / Budget Modal */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            title="Adjust Monthly Allowance & Fixed Expenses"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

