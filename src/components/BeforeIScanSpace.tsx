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
  Smartphone,
  Beer,
  Headphones,
  ShoppingBag,
  Wallet,
  Calendar,
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
    goalImpact: string;
    remainingPoolAfter: number;
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const safePoolAmount = analysis.remainingMonthlyPool > 0 ? analysis.remainingMonthlyPool : 30592;
  const daysToPayday = analysis.daysRemaining || 17;

  // Preset quick examples requested by user
  const quickExamples = [
    {
      title: "New iPhone",
      query: "Should I buy the ₹79,900 iPhone 16 today?",
      amount: 79900,
      label: "₹79,900 iPhone",
      icon: Smartphone,
      tag: "Tech",
    },
    {
      title: "Weekend Dinner",
      query: "Can I spend ₹3,200 on dinner & drinks tonight with friends?",
      amount: 3200,
      label: "₹3,200 Weekend Dinner",
      icon: Beer,
      tag: "Social",
    },
    {
      title: "ANC Headphones",
      query: "Buying ₹14,990 noise-cancelling headphones on flash sale?",
      amount: 14990,
      label: "₹14,990 Headphones",
      icon: Headphones,
      tag: "Tech",
    },
    {
      title: "Zara Sale Cart",
      query: "Buying ₹2,990 Zara linen shirt on weekend impulse?",
      amount: 2990,
      label: "₹2,990 Zara Sale",
      icon: ShoppingBag,
      tag: "Apparel",
    },
  ];

  // Helper to compute instant goal jar impact
  const computeGoalImpact = (amount: number, text: string) => {
    const isIPhone = /iphone|apple|phone/i.test(text) || amount >= 50000;
    const isDinner = /dinner|beer|drinks|brewery/i.test(text) || (amount >= 2000 && amount <= 5000);

    if (isIPhone) {
      return {
        verdict: "DENIED" as const,
        merchant: "Flagship Tech / iPhone 16",
        goalImpact:
          "Buying full price now exceeds your flexible monthly pool by ₹" +
          Math.max(0, amount - safePoolAmount).toLocaleString("en-IN") +
          " (or locks ~₹7,500/mo EMI), pushing back your 3-Month Emergency Shield by 4.2 months. Waiting for October festive sales saves ~₹12,000 without disrupting your Friday AutoPay SIP.",
      };
    }
    if (isDinner) {
      const pctOfPool = Math.round((amount / safePoolAmount) * 100);
      return {
        verdict: "APPROVED" as const,
        merchant: "Weekend Social Dinner",
        goalImpact: `Consumes ${pctOfPool}% of your Safe Pool (leaves ₹${Math.max(
          0,
          safePoolAmount - amount
        ).toLocaleString(
          "en-IN"
        )} safe to spend). It is weekend-safe, but skipping or splitting the tab routes ₹${Math.round(
          amount / 2
        )} towards your New iPhone goal jar (hitting it 1.5 weeks earlier).`,
      };
    }
    if (amount > safePoolAmount * 0.4) {
      return {
        verdict: "CAUTION" as const,
        merchant: "Discretionary Purchase",
        goalImpact: `Consumes ${Math.round(
          (amount / safePoolAmount) * 100
        )}% of your remaining safe pool. Buying now delays your milestone goal by ~2.5 weeks. Consider sleeping on it for 24 hours.`,
      };
    }
    return {
      verdict: "APPROVED" as const,
      merchant: "Flexible Purchase",
      goalImpact: `Well within your flexible weekend headroom. Leaves ₹${Math.max(
        0,
        safePoolAmount - amount
      ).toLocaleString("en-IN")} safe until payday.`,
    };
  };

  const handleSubmit = async (textToSubmit?: string, overrideAmount?: number) => {
    const query = (textToSubmit || prompt).trim();
    if (!query && !overrideAmount) return;

    setIsLoading(true);
    setStreamedText("");
    setVerdictData(null);
    setSavedSuccess(false);

    // Extract numerical price from query or override
    let parsedAmount = overrideAmount || 0;
    if (!parsedAmount) {
      const match = query.match(/(?:(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?))|(?:\b(\d{2,6})\s*(?:rs|rupees|bucks|inr)?\b)/i);
      if (match) {
        parsedAmount = parseFloat((match[1] || match[2]).replace(/,/g, ""));
      } else {
        const pureNum = parseFloat(query.replace(/[^\d.]/g, ""));
        if (!isNaN(pureNum) && pureNum > 0) parsedAmount = pureNum;
      }
    }
    if (!parsedAmount) parsedAmount = 3200;

    const remainingAfter = safePoolAmount - parsedAmount;
    const computed = computeGoalImpact(parsedAmount, query);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query || `Evaluating ₹${parsedAmount} spend`,
          memoryProfile: profile,
          dailySafe: Math.round(safePoolAmount / daysToPayday),
          daysLeft: daysToPayday,
          stream: true,
          demoMode,
        }),
      });

      if (response.ok && response.body) {
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
      } else {
        setStreamedText(
          `### Impact Assessment\n\n- **Before Purchase:** Total Safe-to-Spend Pool is **${formatINR(
            safePoolAmount
          )}**.\n- **After Purchase:** Total Safe Pool adjusts to **${formatINR(
            remainingAfter
          )}**.\n- **Goal Jar Impact:** ${computed.goalImpact}`
        );
      }

      setVerdictData({
        verdict: computed.verdict,
        amount: parsedAmount,
        merchant: computed.merchant,
        source: "AI Pay Guard",
        goalImpact: computed.goalImpact,
        remainingPoolAfter: remainingAfter,
      });
    } catch (e) {
      console.error("AI Coach query failed", e);
      setVerdictData({
        verdict: computed.verdict,
        amount: parsedAmount,
        merchant: computed.merchant,
        source: "Local Engine",
        goalImpact: computed.goalImpact,
        remainingPoolAfter: remainingAfter,
      });
      setStreamedText(
        `### Instant Safe Pool Impact\n\n- **Price:** ${formatINR(
          parsedAmount
        )}\n- **Remaining Safe Pool:** ${formatINR(
          remainingAfter
        )}\n- **Goal Jar Impact:** ${computed.goalImpact}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDivertSavings = () => {
    if (!verdictData || verdictData.amount <= 0) return;

    const targetGoal = profile.goals[0] || { id: "goal_iphone", title: "New iPhone" };
    claimSavings(targetGoal.id, verdictData.amount, prompt || `Saved ₹${verdictData.amount} from impulse spend`);
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
      headline: "Approved — Weekend-ready and comfortably within your Flexible Safe Pool",
    },
    CAUTION: {
      badgeBg: "bg-amber-50 border-amber-200 text-amber-800",
      accent: "text-amber-700",
      border: "border-amber-200",
      icon: AlertTriangle,
      headline: "Caution — Tightens your safe monthly pool & delays Goal Jars",
    },
    DENIED: {
      badgeBg: "bg-rose-50 border-rose-200 text-rose-800",
      accent: "text-rose-700",
      border: "border-rose-200",
      icon: ShieldAlert,
      headline: "Not Recommended — High overdraft risk & severely hurts Goal Jars",
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Interceptor Card */}
      <div className="fintech-card rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-6 h-6 fill-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Before-I-Scan AI Pay Guard</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live AI Evaluator
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter any price or tap an example to see its impact on your Total Safe-to-Spend Pool and Goal Jars
              </p>
            </div>
          </div>

          {/* Flexible Monthly Safe Pool Badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-mono self-start md:self-auto">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Total Safe Pool</span>
              <span className="font-bold text-slate-900 text-base">{formatINR(safePoolAmount)}</span>
            </div>
            <div className="h-7 w-px bg-slate-200 mx-1" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Payday Pace</span>
              <span className="font-bold text-emerald-700 text-xs">{daysToPayday}d to Payday</span>
            </div>
          </div>
        </div>

        {/* Quick Example Buttons Requested by User */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2.5 uppercase tracking-wide">
            1-Tap Quick Examples:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {quickExamples.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(item.query);
                    handleSubmit(item.query, item.amount);
                  }}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200 text-left transition-all group active:scale-95 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 group-hover:text-emerald-700">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-slate-900 text-xs block truncate group-hover:text-emerald-900">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.tag}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Form for Custom Price */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter price or item (e.g. ₹79,900 iPhone, ₹3,200 Dinner, ₹1,499 Shirt)..."
              className="w-full px-4 py-3.5 pr-28 text-base sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-inner font-sans transition-all min-h-[48px]"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Evaluate</span>
                  <CornerDownLeft className="w-3.5 h-3.5 hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Analysis & Safe Pool Impact Display */}
        {(isLoading || verdictData) && (
          <div className="mt-4 pt-5 border-t border-slate-100 space-y-4 animate-fade-in">
            {verdictData && (
              <>
                {/* Verdict Headline Banner */}
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

                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white/80 border border-current shadow-2xs shrink-0">
                    {formatINR(verdictData.amount)}
                  </span>
                </div>

                {/* Instant Safe Pool Impact Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Current Safe Pool
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      {formatINR(safePoolAmount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Before purchase
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                      Purchase Cost
                    </span>
                    <span className="text-base font-bold text-rose-600">
                      -{formatINR(verdictData.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {verdictData.merchant}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 border rounded-xl ${
                      verdictData.remainingPoolAfter >= 0
                        ? "bg-emerald-50/70 border-emerald-200"
                        : "bg-rose-50/70 border-rose-200"
                    }`}
                  >
                    <span className="text-[10px] uppercase block font-bold text-slate-600">
                      Pool After Purchase
                    </span>
                    <span
                      className={`text-base font-bold ${
                        verdictData.remainingPoolAfter >= 0
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {formatINR(verdictData.remainingPoolAfter)}
                    </span>
                    <span className="text-[10px] block mt-0.5 font-sans text-slate-500">
                      {verdictData.remainingPoolAfter >= 0
                        ? "Safe & healthy"
                        : "Overdraft Deficit!"}
                    </span>
                  </div>
                </div>

                {/* Goal Jar Impact Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Target className="w-4 h-4 text-emerald-600" />
                    <span>Goal Jar &amp; Buy Now vs. Wait Reality Check:</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {verdictData.goalImpact}
                  </p>
                </div>

                {/* Opportunity Cost Diversion Action */}
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

                  <button
                    onClick={handleDivertSavings}
                    disabled={savedSuccess}
                    className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 min-h-[44px] active:scale-98 ${
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
              </>
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
