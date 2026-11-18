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
  const { analysis, loadSyntheticDemo } = useFinancialMemory();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          onClick={onOpenDailySafe}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity text-left active:scale-95"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold shadow-xs">
            <span className="font-mono text-sm font-black">₹</span>
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900">
            PocketSense
          </span>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Salary Cycle Indicator (Compact on Mobile) */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-700 bg-slate-50 border border-slate-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">
              {analysis?.dateLabel ? analysis.dateLabel.split("(")[0].trim() : `Day ${analysis?.currentDayOfMonth || 1} of ${analysis?.daysInMonth || 30}`}
            </span>
          </div>

          {/* Reset Demo Data (Hidden on mobile) */}
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

          {/* Import / Auto-Track Spends (Desktop only, mobile has bottom bar) */}
          <button
            onClick={onOpenSmsParser}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Auto-Track</span>
          </button>

          {/* Settings Button (Touch Friendly) */}
          <button
            onClick={onOpenSettings}
            className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Budget Settings"
            aria-label="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Primary Action (Desktop only; on mobile, it is elevated in the center of the bottom dock) */}
          <button
            onClick={onOpenBeforeIScan}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
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