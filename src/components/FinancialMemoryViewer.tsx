"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  Brain,
  X,
  Flame,
  ShieldCheck,
  RotateCcw,
  Target,
  AlertTriangle,
  UserCheck,
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
      <div className="w-full max-w-2xl fintech-card rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Behavioral Financial Memory (Client-Side)
              </h3>
              <p className="text-xs text-slate-400">Supermemory-style contextual profile of spending habits and impulse vectors</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Bento stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Professional</span>
              <span className="font-bold text-white text-xs">{profile.userName}</span>
              <span className="text-[10px] text-slate-400 block truncate">{profile.role}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Discipline Streak</span>
              <span className="font-bold text-amber-400 text-sm flex items-center gap-1.5 mt-0.5">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                {profile.disciplineStreak} Days
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Diverted to Vaults</span>
              <span className="font-bold text-emerald-400 text-sm mt-0.5 block">
                {formatINR(profile.totalSavedToJars)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-semibold">Daily Safe Cap</span>
              <span className="font-bold text-white text-sm mt-0.5 block">
                {formatINR(analysis.dailySafeToSpend)}/day
              </span>
            </div>
          </div>

          {/* Active Spending Patterns */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Tracked Spending Patterns &amp; Behavioral Traps
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {profile.activeTraps.map((trap) => (
                <div
                  key={trap.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">{trap.emoji}</span>
                      <span className="font-bold text-white">{trap.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {trap.pattern}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-bold text-rose-400 border-t border-slate-900 pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase">Monthly Burn:</span>
                    <span>~{formatINR(trap.estimatedMonthlyBurn)}/mo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contextual Vulnerabilities */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Contextual Vulnerability Zones
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profile.vulnerabilityZones.map((zone, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>{zone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-slate-300 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs leading-relaxed">
              <strong>Non-Custodial Privacy:</strong> 100% of financial habits, goals, and transactions reside strictly on your local device. Zero cloud databases or bank logins.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs font-mono">
          <button
            onClick={() => {
              loadSyntheticDemo();
              onClose();
            }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Profile</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
