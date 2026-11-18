"use client";

import React from "react";
import {
  Wallet,
  Zap,
  Target,
  Smartphone,
} from "lucide-react";

export type SolutionSpace = "daily-safe" | "before-i-scan" | "goal-jars" | "passbook";

interface SolutionSpaceSwitcherProps {
  activeSpace: SolutionSpace;
  onSelectSpace: (space: SolutionSpace) => void;
  dailySafeAmount?: number;
  unspentGoalsCount?: number;
}

export const SolutionSpaceSwitcher: React.FC<SolutionSpaceSwitcherProps> = ({
  activeSpace,
  onSelectSpace,
}) => {
  const spaces = [
    {
      id: "daily-safe" as SolutionSpace,
      label: "Daily Safe",
      subtitle: "Limit & Runway",
      icon: Wallet,
      badge: "Core",
    },
    {
      id: "before-i-scan" as SolutionSpace,
      label: "Before I Scan",
      subtitle: "AI Pay Guard",
      icon: Zap,
      badge: "AI Guard",
    },
    {
      id: "goal-jars" as SolutionSpace,
      label: "Goal Jars",
      subtitle: "Milestone Wealth",
      icon: Target,
      badge: "Vaults",
    },
    {
      id: "passbook" as SolutionSpace,
      label: "Auto-Track Spends",
      subtitle: "No manual tracking",
      icon: Smartphone,
      badge: "Autopilot",
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Segmented Bar (Hidden on Mobile Phones) */}
      <div className="hidden sm:block bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-16 z-30 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="grid grid-cols-4 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
            {spaces.map((space) => {
              const isActive = activeSpace === space.id;
              const Icon = space.icon;

              return (
                <button
                  key={space.id}
                  onClick={() => onSelectSpace(space.id)}
                  className={`flex items-center justify-start gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all relative ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/90 font-bold ring-1 ring-black/5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-transparent text-slate-500"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="text-left">
                    <span className="block leading-tight tracking-tight">
                      {space.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal block leading-tight">
                      {space.subtitle}
                    </span>
                  </div>

                  {isActive && (
                    <span className="hidden md:inline-block ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      {space.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phone Hand-Friendly Bottom Navigation Bar (CRED & PhonePe Thumb Zone) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pb-safe pt-1 flex items-center justify-around h-16">
        {/* Tab 1: Daily Safe */}
        <button
          onClick={() => onSelectSpace("daily-safe")}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all min-h-[48px] active:scale-95 ${
            activeSpace === "daily-safe"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-colors ${
              activeSpace === "daily-safe" ? "bg-emerald-50 text-emerald-700" : "text-slate-500"
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Daily Safe</span>
        </button>

        {/* Tab 2: Elevated Center Thumb Button for "Before I Scan" (PhonePe / CRED style) */}
        <button
          onClick={() => onSelectSpace("before-i-scan")}
          className="flex-1 flex flex-col items-center justify-center -mt-5 group active:scale-90 transition-transform"
          aria-label="Before I Scan AI Guard"
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ring-4 ring-white ${
              activeSpace === "before-i-scan"
                ? "bg-emerald-600 text-white shadow-emerald-600/30 ring-emerald-50"
                : "bg-slate-900 text-white shadow-slate-900/20"
            }`}
          >
            <Zap className={`w-5 h-5 ${activeSpace === "before-i-scan" ? "fill-white" : ""}`} />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-1 font-bold ${
              activeSpace === "before-i-scan" ? "text-emerald-700" : "text-slate-700"
            }`}
          >
            Before I Scan
          </span>
        </button>

        {/* Tab 3: Goal Jars */}
        <button
          onClick={() => onSelectSpace("goal-jars")}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all min-h-[48px] active:scale-95 ${
            activeSpace === "goal-jars"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-colors ${
              activeSpace === "goal-jars" ? "bg-emerald-50 text-emerald-700" : "text-slate-500"
            }`}
          >
            <Target className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Goal Jars</span>
        </button>

        {/* Tab 4: Auto-Track */}
        <button
          onClick={() => onSelectSpace("passbook")}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all min-h-[48px] active:scale-95 ${
            activeSpace === "passbook"
              ? "text-emerald-700 font-bold"
              : "text-slate-500 hover:text-slate-800 font-medium"
          }`}
        >
          <div
            className={`p-1 rounded-lg transition-colors ${
              activeSpace === "passbook" ? "bg-emerald-50 text-emerald-700" : "text-slate-500"
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Auto-Track</span>
        </button>
      </nav>
    </>
  );
};