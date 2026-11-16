"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

export const OpportunityCostBanner: React.FC = () => {
  const { profile, claimSavings } = useFinancialMemory();
  const [claimedMap, setClaimedMap] = useState<Record<string, boolean>>({});

  const primaryGoal = profile.goals[0] || {
    id: "goal_japan_trip",
    title: "Japan Spring Trip",
    targetAmount: 150000,
    currentAmount: 68000,
    emoji: "🇯🇵",
  };

  const secondaryGoal = profile.goals[1] || {
    id: "goal_macbook",
    title: "M3 Max MacBook Pro",
    targetAmount: 120000,
    currentAmount: 54000,
    emoji: "💻",
  };

  const opportunities = [
    {
      id: "opp_weekend_tab",
      goalId: primaryGoal.id,
      goalTitle: primaryGoal.title,
      goalEmoji: primaryGoal.emoji,
      amount: 3500,
      title: "Skip 1 Craft Beer / Bistro Outing",
      description: `Diverting tonight's ₹3,500 restaurant tab directly into your ${primaryGoal.title} Jar.`,
      impact: `+${Math.round((3500 / primaryGoal.targetAmount) * 100)}% to Japan milestone`,
      buttonLabel: "Claim ₹3,500 to Japan Trip",
    },
    {
      id: "opp_coffee_habits",
      goalId: secondaryGoal.id,
      goalTitle: secondaryGoal.title,
      goalEmoji: secondaryGoal.emoji,
      amount: 1680,
      title: "Switch 4 Cafe Pour-Overs to French Press",
      description: `Saving ₹1,680 across 4 weekday cafe visits advances your ${secondaryGoal.title}.`,
      impact: `+${Math.round((1680 / secondaryGoal.targetAmount) * 100)}% to MacBook milestone`,
      buttonLabel: "Claim ₹1,680 to MacBook",
    },
  ];

  const handleClaim = (opp: typeof opportunities[0]) => {
    claimSavings(opp.goalId, opp.amount, `Diverted ${opp.title} into ${opp.goalTitle}`);
    setClaimedMap((prev) => ({ ...prev, [opp.id]: true }));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#10B981", "#8B5CF6", "#06B6D4"],
    });
  };

  return (
    <div className="rounded-xl bg-[#121215] border border-white/[0.08] p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <div>
          <h3 className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Opportunity Cost Translator</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-400">
              Impulse → Asset
            </span>
          </h3>
          <p className="text-[11px] text-zinc-500">
            Convert momentary lifestyle splurges directly into high-conviction goals
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
          Total Saved: {formatINR(profile.totalSavedToJars)}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {opportunities.map((opp) => {
          const isClaimed = claimedMap[opp.id];

          return (
            <div
              key={opp.id}
              className={`rounded-lg border p-3.5 flex flex-col justify-between transition-all ${
                isClaimed
                  ? "bg-emerald-950/20 border-emerald-500/30"
                  : "bg-white/[0.02] border-white/5 hover:border-white/15"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{opp.goalEmoji}</span>
                    <h4 className="text-xs font-semibold text-white">{opp.title}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {opp.impact}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-3">
                  {opp.description}
                </p>
              </div>

              <button
                disabled={isClaimed}
                onClick={() => handleClaim(opp)}
                className={`w-full py-1.5 px-3 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isClaimed
                    ? "bg-emerald-500/20 text-emerald-300 cursor-default"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                {isClaimed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Diverted to Goal (+1 Streak)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{opp.buttonLabel}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
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
