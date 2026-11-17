"use client";

import React, { useState, useRef } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  Zap,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  CornerDownLeft,
  ArrowRight,
  TrendingUp,
  History,
  Target,
  Clock,
  RotateCcw,
} from "lucide-react";
import confetti from "canvas-confetti";

interface BeforeIScanSpaceProps {
  onSwitchToGoals?: () => void;
}

export const BeforeIScanSpace: React.FC<BeforeIScanSpaceProps> = ({
  onSwitchToGoals,
}) => {
  const { profile, analysis, claimSavings, demoMode } = useFinancialMemory();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [verdictData, setVerdictData] = useState<{
    verdict: "APPROVED" | "CAUTION" | "DENIED";
    amount: number;
    merchant: string;
    source: string;
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const promptSuggestions = [
    {
      title: "Friday Brewery Tab",
      query: "Should I spend ₹3,500 on dinner & craft beer with colleagues tonight?",
      amount: "₹3,500",
      tag: "Social",
    },
    {
      title: "Flash Sale Tech",
      query: "Can I buy the ₹14,990 noise-cancelling headphones on sale?",
      amount: "₹14,990",
      tag: "Tech",
    },
    {
      title: "Specialty Cafe Pour-Over",
      query: "Is ₹420 Blue Tokai specialty coffee every weekday hurting my wealth?",
      amount: "₹420",
      tag: "Habit",
    },
    {
      title: "Zara Weekend Cart",
      query: "Buying a ₹2,990 Zara linen shirt on impulse?",
      amount: "₹2,990",
      tag: "Shopping",
    },
  ];

  const handleSubmit = async (textToSubmit?: string) => {
    const query = (textToSubmit || prompt).trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setStreamedText("");
    setVerdictData(null);
    setSavedSuccess(false);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          memoryProfile: profile,
          dailySafe: analysis.dailySafeToSpend,
          daysLeft: analysis.daysRemaining,
          stream: true,
          demoMode,
        }),
      });

      if (!response.ok) throw new Error("Coach API error");

      const verdict = (response.headers.get("x-pocketsense-verdict") || "CAUTION") as any;
      const amount = parseFloat(response.headers.get("x-pocketsense-amount") || "0");
      const merchant = response.headers.get("x-pocketsense-merchant") || "This purchase";
      const source = response.headers.get("x-pocketsense-source") || "AI Engine";

      setVerdictData({ verdict, amount, merchant, source });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let accumulated = "";

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            accumulated += decoder.decode(value, { stream: true });
            setStreamedText(accumulated);
          }
        }
      }
    } catch (e) {
      console.error("AI Coach query failed", e);
      setVerdictData({
        verdict: "CAUTION",
        amount: 2500,
        merchant: "Purchase",
        source: "Fallback Protocol",
      });
      setStreamedText(
        `### Pre-Scan Assessment\n\nYour safe rate is **${formatINR(analysis.dailySafeToSpend)}/day** with **${analysis.daysRemaining} days** remaining until next payday.\n\n- **Impact:** This purchase consumes significant headroom from your discretionary pool.\n- **Recommendation:** If non-essential, consider sleeping on it for 24 hours or split the cost with a friend.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDivertSavings = () => {
    if (!verdictData || verdictData.amount <= 0) return;

    const primaryGoal = profile.goals[0] || { id: "default_goal", title: "Savings Reserve" };
    claimSavings(primaryGoal.id, verdictData.amount, prompt || "Intercepted impulse expense");
    setSavedSuccess(true);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#059669", "#10B981", "#34D399"],
    });
  };

  const verdictConfig = {
    APPROVED: {
      badgeBg: "bg-emerald-50 border-emerald-200 text-emerald-800",
      accent: "text-emerald-700",
      border: "border-emerald-200",
      icon: ShieldCheck,
      headline: "Approved — Safe to spend within today's limit",
    },
    CAUTION: {
      badgeBg: "bg-amber-50 border-amber-200 text-amber-800",
      accent: "text-amber-700",
      border: "border-amber-200",
      icon: AlertTriangle,
      headline: "Caution — Tightens your safe daily runway",
    },
    DENIED: {
      badgeBg: "bg-rose-50 border-rose-200 text-rose-800",
      accent: "text-rose-700",
      border: "border-rose-200",
      icon: ShieldAlert,
      headline: "Not Recommended — High Day 20 Squeeze risk",
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Interceptor Card */}
      <div className="fintech-card rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-5 h-5 fill-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Before-I-Scan AI Guard</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live AI Evaluator
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ask before scanning UPI QR codes — prevent impulse regret and safeguard your payday runway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-mono self-start md:self-auto">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Today&apos;s Safe Cap</span>
              <span className="font-bold text-emerald-700 text-sm">{formatINR(analysis.dailySafeToSpend)}</span>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Days Left</span>
              <span className="font-bold text-slate-900 text-sm">{analysis.daysRemaining}d</span>
            </div>
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="mt-6 space-y-4"
        >
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Can I spend ₹3,500 on dinner & craft beer tonight with friends?"
              className="w-full px-4 py-3.5 pr-28 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-inner font-sans transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Evaluate</span>
                  <CornerDownLeft className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Quick Scenario Chips */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-2 uppercase tracking-wider">
              Test Common Impulse Scenarios:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(item.query);
                    handleSubmit(item.query);
                  }}
                  className="text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-xs text-slate-700 transition-all flex flex-col justify-between group shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1 w-full mb-1">
                    <span className="font-semibold text-slate-900 group-hover:text-emerald-900">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">
                      {item.amount}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.query}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Live Analysis Verdict Section */}
        {(isLoading || streamedText || verdictData) && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
            {/* Verdict Header Banner */}
            {verdictData && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                  verdictConfig[verdictData.verdict].badgeBg
                }`}
              >
                <div className="flex items-center gap-3">
                  {React.createElement(verdictConfig[verdictData.verdict].icon, {
                    className: `w-5 h-5 shrink-0 ${verdictConfig[verdictData.verdict].accent}`,
                  })}
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block font-mono">
                      Verdict: {verdictData.verdict}
                    </span>
                    <span className="text-xs font-medium">
                      {verdictConfig[verdictData.verdict].headline}
                    </span>
                  </div>
                </div>

                {verdictData.amount > 0 && (
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/80 border border-current shadow-2xs">
                    {formatINR(verdictData.amount)}
                  </span>
                )}
              </div>
            )}

            {/* AI Reasoning Body */}
            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
              {isLoading && !streamedText && (
                <div className="flex items-center gap-2 text-slate-500 py-4 justify-center">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span>Consulting your financial memory profile &amp; month runway...</span>
                </div>
              )}
              {streamedText}
            </div>

            {/* Opportunity Cost Diversion Action */}
            {verdictData && verdictData.amount > 0 && (
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Skip this purchase &amp; invest in your goals
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Redirecting {formatINR(verdictData.amount)} directly funds your &ldquo;{profile.goals[0]?.title || "Savings"}&rdquo; milestone.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDivertSavings}
                    disabled={savedSuccess}
                    className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                      savedSuccess
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {savedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Saved to {profile.goals[0]?.title || "Goal"}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                        <span>Skip &amp; Save {formatINR(verdictData.amount)}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Intercepted Impulses Ledger */}
      <div className="fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Intercepted Impulse Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Purchases evaluated &amp; diverted into milestone goal jars
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {formatINR(profile.totalSavedToJars)} Total Diverted
          </span>
        </div>

        {profile.pastImpulseDecisions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No impulse purchases intercepted yet. Ask the AI coach above before scanning!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {profile.pastImpulseDecisions.map((dec) => (
              <div
                key={dec.id}
                className="py-3.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      {dec.prompt}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {dec.merchant} • Diverted to {profile.goals.find((g) => g.id === dec.targetGoalJarId)?.title || "Goal"}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono shrink-0">
                  <span className="font-bold text-emerald-700 text-sm block">
                    +{formatINR(dec.amountSaved || dec.amount)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Saved
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
