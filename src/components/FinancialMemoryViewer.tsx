"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR, formatDateTime } from "@/lib/utils";
import {
  Brain,
  X,
  Flame,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

interface FinancialMemoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialMemoryViewer: React.FC<FinancialMemoryViewerProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, analysis, loadSyntheticDemo } = useFinancialMemory();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#121215] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-semibold text-white tracking-tight">
              Persistent Financial Memory (Client-Side)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Bento stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-500 block">Professional</span>
              <span className="font-bold text-white text-xs">{profile.userName}</span>
              <span className="text-[10px] text-zinc-500 block truncate">{profile.role}</span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-500 block">Discipline Streak</span>
              <span className="font-bold text-amber-400 text-sm flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                {profile.disciplineStreak} Days
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-500 block">Diverted to Goals</span>
              <span className="font-bold text-emerald-400 text-sm">
                {formatINR(profile.totalSavedToJars)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-zinc-500 block">Discretionary Safe</span>
              <span className="font-bold text-white text-sm">
                {formatINR(analysis.dailySafeToSpend)}/day
              </span>
            </div>
          </div>

          {/* Active Spending Patterns */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Tracked Spending Patterns
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {profile.activeTraps.map((trap) => (
                <div
                  key={trap.id}
                  className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span>{trap.emoji}</span>
                      <span className="font-semibold text-white">{trap.title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
                      {trap.pattern}
                    </p>
                  </div>
                  <div className="font-mono text-[11px] text-rose-400">
                    ~{formatINR(trap.estimatedMonthlyBurn)}/mo
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contextual Vulnerabilities */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Vulnerability Zones
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {profile.vulnerabilityZones.map((zone, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded bg-white/[0.02] border border-white/5 text-[11px] text-zinc-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>{zone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">
              Zero-login non-custodial memory. All habit patterns and transactions remain on your local device.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => {
              loadSyntheticDemo();
              onClose();
            }}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Profile</span>
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
