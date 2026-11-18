"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import {
  Sparkles,
  FileText,
  Sliders,
  Calendar,
  Check,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

interface NavbarProps {
  onOpenDailySafe?: () => void;
  onOpenBeforeIScan: () => void;
  onOpenSmsParser: () => void;
  onOpenMemoryViewer: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDailySafe,
  onOpenBeforeIScan,
  onOpenSmsParser,
  onOpenSettings,
}) => {
  const { profile, analysis, loadSyntheticDemo } = useFinancialMemory();
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
        {/* Brand */}
        <button
          onClick={onOpenDailySafe}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold shadow-sm">
            <span className="font-mono text-sm font-black">₹</span>
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900">
            PocketSense
          </span>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Salary Cycle Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">{analysis?.dateLabel || `Day ${analysis?.currentDayOfMonth || 1} of ${analysis?.daysInMonth || 30}`}</span>
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={handleLoadDemo}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            {loadedAlert ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reset</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reset Demo</span>
              </>
            )}
          </button>

          {/* Import SMS */}
          <button
            onClick={onOpenSmsParser}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Auto-Track</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Primary Action */}
          <button
            onClick={onOpenBeforeIScan}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>Check Spend</span>
            <kbd className="hidden md:inline-flex items-center px-1 rounded text-[10px] font-mono bg-emerald-700 text-emerald-100">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
