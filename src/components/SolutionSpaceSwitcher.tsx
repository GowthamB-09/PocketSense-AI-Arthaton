"use client";

import React from "react";
import {
  Wallet,
  Zap,
  Target,
  Smartphone,
  Receipt,
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
      mobileLabel: "Daily Safe",
      subtitle: "Limit & Runway",
      icon: Wallet,
      badge: "Core",
    },
    {
      id: "before-i-scan" as SolutionSpace,
      label: "Before I Scan",
      mobileLabel: "Scan Guard",
      subtitle: "AI Pay Guard",
      icon: Zap,
      badge: "AI Guard",
      isPrimaryAction: true,
    },
    {
      id: "goal-jars" as SolutionSpace,
      label: "Goal Jars",
      mobileLabel: "Goal Jars",
      subtitle: "Milestone Wealth",
      icon: Target,
      badge: "Vaults",
    },
    {
      id: "passbook" as SolutionSpace,
      label: "Auto-Track Spends",
      mobileLabel: "Auto-Track",
      subtitle: "No manual tracking",
      icon: Smartphone,
      badge: "Autopilot",
    },
  ];

  return (
    <>
      {/* Desktop & Laptop Top Segmented Sticky Bar */}
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

      {/* Mobile Ergonomic Bottom Bar (CRED / PhonePe / iOS Style) */}
      {/* Positioned right in the natural thumb zone with safe-area support */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1.5 shadow-lg flex items-center justify-around">
        {spaces.map((space) => {
          const isActive = activeSpace === space.id;
          const Icon = space.icon;
          const isPrimary = space.isPrimaryAction;

          // Elevated primary thumb action button (Scan Guard) like PhonePe QR Scanner
          if (isPrimary) {
            return (
              <button
                key={space.id}
                onClick={() => onSelectSpace(space.id)}
                className="flex flex-col items-center justify-center -mt-4 active:scale-90 transition-transform focus:outline-none"
                aria-label={space.label}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-emerald-600/30"
                      : "bg-slate-900 text-white shadow-slate-900/20"
                  }`}
                >
                  <Icon className="w-5 h-5 fill-current" />
                </div>
                <span
                  className={`text-[10px] mt-1 tracking-tight font-semibold transition-colors ${
                    isActive ? "text-emerald-700 font-bold" : "text-slate-600"
                  }`}
                >
                  {space.mobileLabel}
                </span>
              </button>
            );
          }

          return (
            <button
              key={space.id}
              onClick={() => onSelectSpace(space.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] py-1 px-2 rounded-xl text-[10px] active:scale-95 transition-all focus:outline-none ${
                isActive
                  ? "text-emerald-700 font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl mb-0.5 transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-500"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="tracking-tight leading-none">
                {space.mobileLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
