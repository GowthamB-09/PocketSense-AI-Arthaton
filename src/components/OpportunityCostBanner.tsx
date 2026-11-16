"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Plane,
  Laptop,
  Coins,
} from "lucide-react";
import confetti from "canvas-confetti";

export const OpportunityCostBanner: React.FC = () => {
  const { profile, claimSavings } = useFinancialMemory();
  const [claimedMap, setClaimedMap] = useState<Record<string, boolean>>({});

  const primaryGoal = profile.goals[0] || {
    id: "goal_japan_trip",
    title: "Japan Spring Trip",
    targetAmount: 150000,
    currentAmount: 68000,
  };

  const secondaryGoal = profile.goals[1] || {
    id: "goal_macbook",
    title: "M3 Max MacBook Pro",
    targetAmount: 120000,
    currentAmount: 54000,
  };

  const opportunities = [
    {
      id: "opp_weekend_tab",
      goalId: primaryGoal.id,
      goalTitle: primaryGoal.title,
      icon: Plane,
      amount: 3500,
      title: "Divert Friday Social & Craft Beer Split",
      description: `Reallocating tonight's ₹3,500 unbudgeted dining tab directly into your ${primaryGoal.title} reserve.`,
      impact: `+${((3500 / primaryGoal.targetAmount) * 100).toFixed(1)}% to target`,
      buttonLabel: "Divert ₹3,500 to Reserve",
    },
    {
      id: "opp_coffee_habits",
      goalId: secondaryGoal.id,
      goalTitle: secondaryGoal.title,
      icon: Laptop,
      amount: 1680,
      title: "Replace 4 Weekday Cafe Pour-Overs",
      description: `Saving ₹1,680 across 4 weekday visits accelerates your ${secondaryGoal.title} milestone.`,
      impact: `+${((1680 / secondaryGoal.targetAmount) * 100).toFixed(1)}% to target`,
      buttonLabel: "Divert ₹1,680 to Reserve",
    },
  ];

  const handleClaim = (opp: typeof opportunities[0]) => {
    claimSavings(opp.goalId, opp.amount, `Diverted ${opp.title} into ${opp.goalTitle}`);
    setClaimedMap((prev) => ({ ...prev, [opp.id]: true }));

    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.65 },
      colors: ["#059669", "#0284C7", "#D97706"],
    });
  };

  return (
    <div className="fintech-card rounded-2xl p-6 space-y-4 bg-white border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Capital Preservation &amp; Impulse Conversion</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                Active Optimization
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Convert momentary lifestyle splurges directly into high-conviction wealth reserves
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-500">Total Capital Preserved:</span>
          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            {formatINR(profile.totalSavedToJars)}
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp) => {
          const isClaimed = claimedMap[opp.id];
          const OppIcon = opp.icon;

          return (
            <div
              key={opp.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                isClaimed
                  ? "bg-emerald-50/70 border-emerald-200"
                  : "bg-slate-50/80 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-sm">
                      <OppIcon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{opp.title}</h4>
                      <span className="text-[10px] font-mono text-slate-500">Target: {opp.goalTitle}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    {opp.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {opp.description}
                </p>
              </div>

              <button
                disabled={isClaimed}
                onClick={() => handleClaim(opp)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isClaimed
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isClaimed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Transferred to Reserve (+1 Streak)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-white fill-white" />
                    <span>{opp.buttonLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
