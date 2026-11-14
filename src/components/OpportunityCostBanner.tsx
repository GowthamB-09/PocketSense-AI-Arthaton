"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { Sparkles, ArrowRight, CheckCircle2, Flame, Gift, Compass } from "lucide-react";
import confetti from "canvas-confetti";

export const OpportunityCostBanner: React.FC = () => {
  const { profile, claimSavings } = useFinancialMemory();
  const [claimedMap, setClaimedMap] = useState<Record<string, boolean>>({});

  const primaryGoal = profile.goals[0] || {
    id: "goal_goa_trip",
    title: "Goa Semester-End Trip",
    targetAmount: 8000,
    currentAmount: 3200,
    emoji: "🏝️",
  };

  const secondaryGoal = profile.goals[1] || {
    id: "goal_sneakers",
    title: "Nike Air Max Sneakers",
    targetAmount: 3800,
    currentAmount: 1650,
    emoji: "👟",
  };

  const opportunities = [
    {
      id: "opp_cold_coffee",
      goalId: primaryGoal.id,
      goalTitle: primaryGoal.title,
      goalEmoji: primaryGoal.emoji,
      amount: 450,
      title: "Skip 3 Cold Coffees / Cafe splits",
      description: `Skipping 3 cold coffees this week moves ₹450 directly into your '${primaryGoal.title}' Jar.`,
      impact: `+${Math.round((450 / primaryGoal.targetAmount) * 100)}% to Goa milestone`,
      buttonLabel: "Claim ₹450 to Goa Trip",
    },
    {
      id: "opp_swiggy_midnight",
      goalId: secondaryGoal.id,
      goalTitle: secondaryGoal.title,
      goalEmoji: secondaryGoal.emoji,
      amount: 280,
      title: "Raid Roomie's Maggi instead of Late Swiggy",
      description: `Dodge 1 late-night Swiggy order (+₹280) and move closer to your '${secondaryGoal.title}'.`,
      impact: `+${Math.round((280 / secondaryGoal.targetAmount) * 100)}% to Sneakers milestone`,
      buttonLabel: "Claim ₹280 to Sneakers",
    },
  ];

  const handleClaim = (opp: typeof opportunities[0]) => {
    claimSavings(opp.goalId, opp.amount, `Diverted ${opp.title} into ${opp.goalTitle}`);
    setClaimedMap((prev) => ({ ...prev, [opp.id]: true }));

    // Confetti celebration
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#10B981", "#8B5CF6", "#06B6D4", "#F59E0B"],
    });
  };

  return (
    <div className="rounded-2xl bg-gradient-to-r from-violet-950/30 via-[#121215] to-emerald-950/20 border border-violet-500/20 p-5 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Opportunity Cost &amp; Goal Jar Translator</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Memory Active
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Transform fleeting student impulses into long-term personal trophies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <Gift className="w-3.5 h-3.5" />
          <span>Total Diverted: {formatINR(profile.totalSavedToJars)}</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {opportunities.map((opp) => {
          const isClaimed = claimedMap[opp.id];

          return (
            <div
              key={opp.id}
              className={`rounded-xl border p-4 transition-all ${
                isClaimed
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : "bg-white/[0.02] border-white/10 hover:border-violet-500/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{opp.goalEmoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{opp.title}</h4>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                      {formatINR(opp.amount)} Savings
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                  {opp.impact}
                </span>
              </div>

              <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
                {opp.description}
              </p>

              <button
                disabled={isClaimed}
                onClick={() => handleClaim(opp)}
                className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isClaimed
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 cursor-default"
                    : "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.25)] hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                }`}
              >
                {isClaimed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Transferred to Goal Jar! (+1 Streak)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{opp.buttonLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

