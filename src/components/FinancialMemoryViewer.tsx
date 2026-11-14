"use client";

import React from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR, formatDateTime } from "@/lib/utils";
import {
  Brain,
  X,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Clock,
  Target,
  Zap,
} from "lucide-react";

interface FinancialMemoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialMemoryViewer: React.FC<FinancialMemoryViewerProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, analysis, loadSyntheticDemo, clearAllData } = useFinancialMemory();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-[#121215] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Supermemory Financial Context</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  Zero-Login Semantic Engine
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Persistent financial memory of triggers, habits, goals, and coaching nudges across sessions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Profile Summary Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] text-zinc-400 mb-1">Student Profile</div>
              <div className="text-xs font-bold text-white truncate">
                {profile.studentName}
              </div>
              <div className="text-[10px] text-zinc-400">{profile.collegeYear}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Discipline Streak</span>
              </div>
              <div className="font-mono text-base font-black text-amber-400">
                {profile.disciplineStreak} Days
              </div>
              <div className="text-[10px] text-zinc-400">Impulse-free runway</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] text-zinc-400 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Saved into Jars</span>
              </div>
              <div className="font-mono text-base font-black text-emerald-400">
                {formatINR(profile.totalSavedToJars)}
              </div>
              <div className="text-[10px] text-zinc-400">Diverted from cravings</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-[11px] text-zinc-400 mb-1">Safe Daily Limit</div>
              <div className="font-mono text-base font-black text-cyan-400">
                {formatINR(analysis.dailySafeToSpend)}
              </div>
              <div className="text-[10px] text-zinc-400">Remaining per day</div>
            </div>
          </div>

          {/* Active Spending Traps Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                <span>Identified Behavioral Traps</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                  {profile.activeTraps.length} Detected
                </span>
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {profile.activeTraps.map((trap) => (
                <div
                  key={trap.id}
                  className="p-4 rounded-xl bg-zinc-900/60 border border-white/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{trap.emoji}</span>
                      <h5 className="text-xs font-bold text-white">{trap.title}</h5>
                    </div>
                    <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                      {trap.pattern}
                    </p>
                    <div className="font-mono text-xs text-rose-400 font-semibold mb-3">
                      ~{formatINR(trap.estimatedMonthlyBurn)}/mo burn ({trap.frequencyMonthly}x/mo)
                    </div>
                  </div>

                  <div className="text-[11px] text-emerald-300/90 bg-emerald-950/30 border border-emerald-500/20 p-2.5 rounded-lg leading-relaxed">
                    <strong>Senior Tip:</strong> {trap.seniorAdvice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vulnerability Zones */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Vulnerability Zones (Contextual Triggers)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profile.vulnerabilityZones.map((zone, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-zinc-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>{zone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Past Intercepted Impulses Log */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Recent Intercepted Impulses ({profile.pastImpulseDecisions.length})
            </h4>

            {profile.pastImpulseDecisions.length === 0 ? (
              <p className="text-xs text-zinc-400 italic">
                No past interventions yet. Ask the coach in &quot;Before I Scan&quot;!
              </p>
            ) : (
              <div className="space-y-2">
                {profile.pastImpulseDecisions.map((dec) => (
                  <div
                    key={dec.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{dec.prompt}</div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {formatDateTime(dec.timestamp)} • Action: {dec.actionTaken}
                      </div>
                    </div>
                    {dec.amountSaved && dec.amountSaved > 0 && (
                      <div className="font-mono text-xs font-bold text-emerald-400">
                        +{formatINR(dec.amountSaved)} Saved
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Supermemory Architecture & Privacy Note */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/30 to-black border border-violet-500/20 text-xs space-y-1.5">
            <div className="font-bold text-violet-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-Login Privacy-First Architecture</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Unlike traditional fintech apps that mandate invasive net-banking passwords, SMS access permissions, or PAN linkage, PocketSense AI operates on a pure client-side Supermemory vector model. All transactions, behavioral triggers, and goal jars remain in your local storage.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-xs">
          <button
            onClick={() => {
              loadSyntheticDemo();
              onClose();
            }}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition-colors font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Synthetic Student Demo</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

