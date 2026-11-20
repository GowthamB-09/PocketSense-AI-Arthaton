"use client";

import React, { useState, useRef } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { Transaction } from "@/types";
import { formatINR, extractQueryAmount } from "@/lib/utils";
import {
  PRESET_COACH_QUESTIONS,
  CoachAnswer,
  generateBeginnerCoachAdvice,
} from "@/lib/ai/coachResponses";
import { deduplicateImpulseDecisions } from "@/lib/memory/memoryStore";
import {
  Zap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  CornerDownLeft,
  ArrowRight,
  History,
  ShoppingBag,
  UtensilsCrossed,
  Film,
  Flame,
  ArrowRightLeft,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import confetti from "canvas-confetti";
import { GooglePlacesStatusBadge } from "@/components/GooglePlacesStatusBadge";

interface BeforeIScanSpaceProps {
  onSwitchToGoals?: () => void;
}

interface SmartSwapData {
  originalItem: string;
  originalCost: number;
  delayDays: number;
  activeGoalTitle: string;
  goalDelayText: string;
  swapTitle: string;
  swapDescription: string;
  swapCost: number;
  savedDifference: number;
  swapButtonText: string;
  simplerText?: string;
}

export const BeforeIScanSpace: React.FC<BeforeIScanSpaceProps> = ({
  onSwitchToGoals,
}) => {
  const { profile, analysis, claimSavings, recordSmartSwap, addBatchTransactions } = useFinancialMemory();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"swaps" | "coach">("swaps");
  const [smartSwapResult, setSmartSwapResult] = useState<SmartSwapData | null>(null);
  const [coachAnswerResult, setCoachAnswerResult] = useState<CoachAnswer | null>(null);
  const [swapSuccessMessage, setSwapSuccessMessage] = useState<string | null>(null);
  const [showSimplerSwap, setShowSimplerSwap] = useState(false);
  const [showSimplerCoach, setShowSimplerCoach] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const safePoolAmount = analysis.remainingMonthlyPool > 0 ? analysis.remainingMonthlyPool : 30592;
  const daysToPayday = analysis.daysRemaining || 17;

  // Active goal jar to protect (e.g. New iPhone or 24K Gold)
  const activeGoal = profile.goals && profile.goals.length > 0
    ? profile.goals[0]
    : { id: "goal_iphone", title: "New iPhone", targetAmount: 80000, currentAmount: 36000 };

  // 3 Preset Spend Swap Scenario Buttons
  const presetScenarios = [
    {
      id: "preset_food",
      query: "Weekend Dinner & Drinks — ₹1,500",
      label: "₹1,500 Friday Night Food Order",
      amount: 1500,
      icon: UtensilsCrossed,
      tag: "Food & Dining",
    },
    {
      id: "preset_sneakers",
      query: "New Sneakers — ₹4,500",
      label: "₹4,500 Branded Sneakers",
      amount: 4500,
      icon: ShoppingBag,
      tag: "Apparel & Gear",
    },
    {
      id: "preset_concert",
      query: "Concert / Movie Outing — ₹2,200",
      label: "₹2,200 Concert / Movie Outing",
      amount: 2200,
      icon: Film,
      tag: "Entertainment",
    },
  ];

  // Helper to generate goal-aware Smart Swap advice
  const generateSmartSwap = (text: string, parsedAmount: number): SmartSwapData => {
    // 1. Ensure origCost is numeric and positive
    const origCost = parsedAmount > 0 ? parsedAmount : 1500;

    const isFood = /food|dinner|drinks|beer|burger|swiggy|zomato/i.test(text);
    const isSneakers = /sneaker|shoes|kicks|apparel|shirt|zara/i.test(text);
    const isEntertainment = /concert|movie|outing|show|theatre|ticket/i.test(text);
    const isWatch = /watch|mechanical|tissot|timepiece|horology/i.test(text) || origCost === 14990;

    // 2. Proportional Goal Delay Reality Check based on user's daily savings rate (~₹140/day)
    const dailySavingsRate = 140;
    const delayDays = Math.max(1, Math.round(origCost / dailySavingsRate));
    const goalDelayText = `Buying this for ${formatINR(origCost)} delays your ${activeGoal.title} Goal Jar by ${delayDays} ${delayDays === 1 ? "day" : "days"}.`;

    // 3. Dynamic Swap Calculation: ensure swapCost is always strictly less than origCost
    let swapCost: number;
    let swapTitle: string;
    let baseSwapDesc: string;
    let baseSimplerDesc: string;

    if (isWatch) {
      swapCost = origCost === 14990 ? 5247 : Math.round(origCost * 0.35);
      swapTitle = "Seiko/Citizen Automatic Alternative";
      baseSwapDesc = `Swap to a ${formatINR(swapCost)} curated automatic mechanical alternative—same timeless horology, `;
      baseSimplerDesc = `Spend ${formatINR(swapCost)} instead of ${formatINR(origCost)}—same classic mechanical look and save `;
    } else if (isFood) {
      if (origCost === 1500) {
        swapCost = 550;
      } else {
        const raw = Math.round((origCost * 0.40) / 50) * 50;
        swapCost = Math.min(Math.max(50, raw), Math.max(50, origCost - 50));
      }
      swapTitle = "Local Spot or Cozy House Hangout";
      baseSwapDesc = `Swap to a ${formatINR(swapCost)} local spot or house hangout—same great night, `;
      baseSimplerDesc = `Spend ${formatINR(swapCost)} instead of ${formatINR(origCost)} tonight—you have equal fun and save `;
    } else if (isSneakers) {
      if (origCost === 4500) {
        swapCost = 650;
      } else {
        const raw = Math.round((origCost * 0.35) / 50) * 50;
        swapCost = Math.min(Math.max(50, raw), Math.max(50, origCost - 50));
      }
      swapTitle = "Premium Restoration & Deep-Clean Kit";
      baseSwapDesc = `Swap to a ${formatINR(swapCost)} restoration kit or curated alternative—same fresh look, `;
      baseSimplerDesc = `Spend ${formatINR(swapCost)} instead of ${formatINR(origCost)}—same fresh style and save `;
    } else if (isEntertainment) {
      if (origCost === 2200) {
        swapCost = 700;
      } else {
        const raw = Math.round((origCost * 0.40) / 50) * 50;
        swapCost = Math.min(Math.max(50, raw), Math.max(50, origCost - 50));
      }
      swapTitle = "Twilight Matinee & BYO Snacks";
      baseSwapDesc = `Swap to a ${formatINR(swapCost)} twilight screening with friends + bring your own snacks—same great vibe, `;
      baseSimplerDesc = `Catch the alternative for ${formatINR(swapCost)} instead of ${formatINR(origCost)}—same movie fun and save `;
    } else {
      const raw = Math.round((origCost * 0.40) / 50) * 50;
      swapCost = Math.min(Math.max(50, raw), Math.max(50, origCost - 50));
      swapTitle = "Curated Feel-Good Alternative";
      baseSwapDesc = `Swap to a quality curated alternative for ${formatINR(swapCost)}—enjoy the moment, `;
      baseSimplerDesc = `Spend ${formatINR(swapCost)} instead of ${formatINR(origCost)}—have fun while saving `;
    }

    // 4. Dynamic Savings & Sweep Math: strictly bound to savedDifference
    const savedDifference = Math.max(0, origCost - swapCost);
    const swapDescription = `${baseSwapDesc}${formatINR(savedDifference)} cheaper.`;
    const swapButtonText = `Take the Swap & Sweep ${formatINR(savedDifference)} to Goal Jar`;
    const simplerText = `${baseSimplerDesc}${formatINR(savedDifference)} for your ${activeGoal.title}.`;

    return {
      originalItem: text || (isWatch ? "Mechanical Watch" : isFood ? "Food Order" : isSneakers ? "Branded Sneakers" : isEntertainment ? "Entertainment" : "Extra Spend Item"),
      originalCost: origCost,
      delayDays,
      activeGoalTitle: activeGoal.title,
      goalDelayText,
      swapTitle,
      swapDescription,
      swapCost,
      savedDifference,
      swapButtonText,
      simplerText,
    };
  };

  // Evaluate query
  const handleEvaluate = (textToSubmit?: string, overrideAmount?: number) => {
    const query = (textToSubmit || prompt).trim();
    if (!query && !overrideAmount) return;

    setIsLoading(true);
    setSwapSuccessMessage(null);

    // Check if query is a coach/conversational question without a direct spend
    const isGeneralCoachQuestion =
      !overrideAmount &&
      /^(can i afford|sip vs|why|how|should i|what is|tell me|explain)/i.test(query) &&
      !/(buy|order|spend|purchase|shopping|sneaker|ticket)/i.test(query);

    // Extract numerical price if any (supports standard 1,200 and Indian 1,50,000 comma formatting)
    let parsedAmount = overrideAmount || 0;
    if (!parsedAmount && !isGeneralCoachQuestion) {
      parsedAmount = extractQueryAmount(query);
    }

    setTimeout(() => {
      if (isGeneralCoachQuestion || (!parsedAmount && query.length > 5)) {
        // Evaluate as Beginner Coach response
        const advice = generateBeginnerCoachAdvice(query, {
          salary: profile.monthlySalary || 75000,
          safePool: safePoolAmount,
          daysLeft: daysToPayday,
          cardDues: 17908,
          primaryGoalTitle: activeGoal.title,
          primaryGoalSaved: activeGoal.currentAmount || 36000,
          primaryGoalTarget: activeGoal.targetAmount || 80000,
        });
        setCoachAnswerResult(advice);
        setSmartSwapResult(null);
        setActiveTab("coach");
      } else {
        // Evaluate as Smart Swap purchase check
        const effectiveAmount = parsedAmount || 1500;
        const result = generateSmartSwap(query, effectiveAmount);
        setSmartSwapResult(result);
        setCoachAnswerResult(null);
        setActiveTab("swaps");
      }
      setIsLoading(false);
    }, 250);
  };

  // 1-Tap "Take the Swap & Sweep ₹X to Goal Jar" Button Action
  const handleAcceptSmartSwap = () => {
    if (!smartSwapResult) return;

    const { swapCost, savedDifference, swapTitle, originalItem, originalCost } = smartSwapResult;
    const queryText = prompt.trim() || originalItem;

    // Use recordSmartSwap to replace superseded entry, adjust goal jar & safe pool, and deduplicate
    const { oldAmountSaved, netAdjustment } = recordSmartSwap({
      goalId: activeGoal.id,
      originalCost,
      swapCost,
      savedDifference,
      originalItem,
      swapTitle,
      query: queryText,
    });

    const newPool = Math.max(0, safePoolAmount - swapCost);

    if (oldAmountSaved > 0) {
      setSwapSuccessMessage(
        `🎉 Smart Swap Accepted! Spent only ${formatINR(swapCost)} • Replaced previous full-skip (${formatINR(oldAmountSaved)}) with +${formatINR(savedDifference)} swept into your ${activeGoal.title} Goal Jar (Net adjustment: ${netAdjustment >= 0 ? "+" : ""}${formatINR(netAdjustment)}) • Safe Pool: ${formatINR(newPool)}.`
      );
    } else {
      setSwapSuccessMessage(
        `🎉 Smart Swap Accepted! Spent only ${formatINR(swapCost)} • ${formatINR(savedDifference)} swept directly into your ${activeGoal.title} Goal Jar! Total Safe Pool: ${formatINR(newPool)}.`
      );
    }

    confetti({
      particleCount: 55,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#10B981", "#059669", "#34D399", "#F59E0B"],
    });
  };

  // Handle Full Purchase without Swap
  const handleProceedFullPurchase = () => {
    if (!smartSwapResult) return;

    const fullTx: Transaction = {
      id: "tx_full_" + Date.now(),
      merchant: smartSwapResult.originalItem,
      amount: smartSwapResult.originalCost,
      date: new Date().toISOString().split("T")[0],
      category: "Dining & Social",
      spendingType: "Impulse Want",
      upiRef: "FULL" + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: "UPI Direct Debit",
      triggerTag: "full-spend-proceeded",
      rawSms: `Paid Rs. ${smartSwapResult.originalCost} for ${smartSwapResult.originalItem}`,
    };
    addBatchTransactions([fullTx]);

    const newPool = Math.max(0, safePoolAmount - smartSwapResult.originalCost);
    setSwapSuccessMessage(
      `Deducted full ${formatINR(smartSwapResult.originalCost)} from your Safe Pool. Remaining Pool: ${formatINR(newPool)}.`
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Interceptor Card */}
      <div className="fintech-card rounded-2xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm relative overflow-hidden space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-6 h-6 fill-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  AI Pay Guard
                </h2>
                <GooglePlacesStatusBadge />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Check any spend or ask questions before you pay.
              </p>
            </div>
          </div>

          {/* Active Goal & Flexible Monthly Safe Pool Badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-mono self-start md:self-auto">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Protecting Goal</span>
              <span className="font-bold text-emerald-700 text-sm truncate max-w-[130px] block">
                {activeGoal.title}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200 mx-1" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Safe Pool</span>
              <span className="font-bold text-slate-900 text-sm">{formatINR(safePoolAmount)}</span>
            </div>
          </div>
        </div>

        {/* 1. SINGLE UNIFIED IMPULSE CHECK & QUESTION BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEvaluate();
          }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to buy or ask? (e.g. Weekend Dinner — ₹1,500, New Sneakers, or SIP vs FD)..."
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
                  <span className="hidden sm:inline">Evaluating...</span>
                </>
              ) : (
                <>
                  <span>Ask Guard</span>
                  <CornerDownLeft className="w-3.5 h-3.5 hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* 2. TABBED PRESET SELECTOR (SPEND SWAPS vs MONEY COACH Q&A) */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("swaps")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "swaps"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Smart Spend Swaps</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("coach")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "coach"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Money Coach Q&amp;A</span>
            </button>
          </div>

          {/* TAB 1: 3 ONE-TAP PRESET SPEND SCENARIOS */}
          {activeTab === "swaps" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
              {presetScenarios.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPrompt(item.query);
                      handleEvaluate(item.query, item.amount);
                    }}
                    className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 text-left transition-all group active:scale-98 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 group-hover:text-emerald-700 shadow-2xs">
                        <Icon className="w-4 h-4" />
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
          )}

          {/* TAB 2: BEGINNER MONEY COACH PRESET CHIPS */}
          {activeTab === "coach" && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {PRESET_COACH_QUESTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPrompt(item.question);
                    setCoachAnswerResult(item);
                    setSmartSwapResult(null);
                    setShowSimplerCoach(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-left flex items-center gap-1.5 active:scale-98 ${
                    coachAnswerResult?.id === item.id
                      ? "bg-emerald-600 text-white shadow-xs font-semibold"
                      : "bg-slate-50 hover:bg-emerald-50/60 text-slate-700 border border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 opacity-60" />
                  <span>{item.question}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. ACTIVE AI CARD (EITHER SMART SWAP OR MONEY COACH) */}
        {/* Success Banner if Swap accepted */}
        {swapSuccessMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold">{swapSuccessMessage}</span>
            </div>
            {onSwitchToGoals && (
              <button
                type="button"
                onClick={onSwitchToGoals}
                className="text-xs text-emerald-800 underline font-bold shrink-0 hover:text-emerald-950"
              >
                View Goal Jar →
              </button>
            )}
          </div>
        )}

        {/* VIEW A: SMART SWAP RECOMMENDATION CARD */}
        {smartSwapResult && (
          <div className="pt-2 animate-fade-in">
            <div className="fintech-card rounded-2xl p-5 bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-500/40 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Smart Swap Recommendation</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
                        Goal-Protected
                      </span>
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      Cheaper, feel-good alternative to enjoy your day
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                  Save +{formatINR(smartSwapResult.savedDifference)}
                </span>
              </div>

              {/* 3 Clear Parts: a) Goal Delay, b) Smart Swap, c) 1-Tap Button */}
              <div className="space-y-3">
                {/* a) Goal Delay Reality Check */}
                <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 flex items-start gap-3 text-xs text-rose-950">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-900 font-bold mb-0.5">
                      Goal Delay Reality Check:
                    </strong>
                    <span className="leading-relaxed">
                      {smartSwapResult.goalDelayText}
                    </span>
                  </div>
                </div>

                {/* b) The Smart Swap Alternative */}
                <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>The Smart Swap (Same Fun, Fraction of the Price):</span>
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Recommended
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                    &ldquo;{smartSwapResult.swapDescription}&rdquo;
                  </p>

                  {/* Math Breakdown Comparison */}
                  <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-[9px] text-slate-400 block uppercase">Original Price</span>
                      <span className="font-bold text-slate-700">{formatINR(smartSwapResult.originalCost)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-200">
                      <span className="text-[9px] text-emerald-600 block uppercase">Swap Spend</span>
                      <span className="font-bold text-emerald-800">{formatINR(smartSwapResult.swapCost)}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-100 border border-emerald-300">
                      <span className="text-[9px] text-emerald-700 block uppercase font-bold">You Sweep</span>
                      <span className="font-black text-emerald-900">+{formatINR(smartSwapResult.savedDifference)}</span>
                    </div>
                  </div>
                </div>

                {/* c) 1-Tap "Take the Swap & Sweep ₹X to Goal Jar" Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleAcceptSmartSwap}
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[44px]"
                  >
                    <Zap className="w-4 h-4 fill-white text-white" />
                    <span>{smartSwapResult.swapButtonText}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProceedFullPurchase}
                    className="py-3 px-4 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors active:scale-98 min-h-[44px]"
                  >
                    <span>Proceed with full {formatINR(smartSwapResult.originalCost)}</span>
                  </button>
                </div>

                {/* "Explain Even Simpler (1 Sentence)" Quick-Toggle Button */}
                <div className="pt-2 border-t border-emerald-100">
                  <button
                    type="button"
                    onClick={() => setShowSimplerSwap(!showSimplerSwap)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>
                      {showSimplerSwap ? "Hide Simple Explanation" : "Explain Even Simpler (1 Sentence)"}
                    </span>
                    {showSimplerSwap ? (
                      <ChevronUp className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  {showSimplerSwap && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-sans leading-relaxed animate-fade-in flex items-start gap-2 shadow-2xs">
                      <span className="font-bold shrink-0">💡 Super Simple:</span>
                      <span>
                        {smartSwapResult.simplerText ||
                          `Spend ${formatINR(smartSwapResult.swapCost)} instead of ${formatINR(
                            smartSwapResult.originalCost
                          )}—have fun while saving ${formatINR(
                            smartSwapResult.savedDifference
                          )} for your ${activeGoal.title}.`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW B: BEGINNER MONEY COACH ANSWER CARD */}
        {coachAnswerResult && (
          <div className="pt-2 animate-fade-in">
            <div className="fintech-card rounded-2xl p-5 bg-gradient-to-br from-white to-slate-50/60 border-2 border-slate-300/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 fill-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>PocketSense Money Coach</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        Friend-Texting
                      </span>
                    </h3>
                    <span className="text-[11px] text-slate-500">
                      5-second direct advice • Zero finance textbook jargon
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                  Pool: {formatINR(safePoolAmount)}
                </span>
              </div>

              {/* 3-Part Friend-Texting Structure */}
              <div className="space-y-3">
                {/* 1. 1-Line Direct Answer */}
                <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-start gap-3 shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                      Direct Answer:
                    </span>
                    <p className="text-sm font-bold text-white leading-snug mt-0.5">
                      {coachAnswerResult.directAnswer}
                    </p>
                  </div>
                </div>

                {/* 2. 2-3 Ultra-Short Bullet Points */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wide">
                    Why this makes sense:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {coachAnswerResult.bulletPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. 1 Concrete Next Step */}
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold block">
                      Concrete Next Step:
                    </span>
                    <p className="text-xs font-semibold text-emerald-950">
                      {coachAnswerResult.concreteAction}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs shrink-0 self-start sm:self-auto">
                    <span>{coachAnswerResult.actionPill}</span>
                  </div>
                </div>

                {/* Explain Even Simpler Toggle */}
                <div className="pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowSimplerCoach(!showSimplerCoach)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>
                      {showSimplerCoach ? "Hide Simple Explanation" : "Explain Even Simpler (1 Sentence)"}
                    </span>
                    {showSimplerCoach ? (
                      <ChevronUp className="w-3 h-3 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  {showSimplerCoach && (
                    <div className="mt-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-sans leading-relaxed animate-fade-in flex items-start gap-2 shadow-2xs">
                      <span className="font-bold shrink-0">💡 Super Simple:</span>
                      <span>{coachAnswerResult.simplerOneLiner}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Intercepted Impulse & Smart Swap Ledger */}
      <div className="fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Smart Swaps &amp; Intercepted Impulse Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Purchases swapped or diverted into milestone goal jars
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {formatINR(profile.totalSavedToJars)} Total Swept to Goals
          </span>
        </div>

        {(() => {
          const displayedDecisions = deduplicateImpulseDecisions(profile.pastImpulseDecisions);
          if (displayedDecisions.length === 0) {
            return (
              <div className="text-center py-8 text-xs text-slate-500">
                No impulse purchases intercepted yet. Tap any preset above to test the Smart Swap!
              </div>
            );
          }
          return (
            <div className="divide-y divide-slate-100">
              {displayedDecisions.map((dec) => (
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
                        {dec.merchant} • Swept into {profile.goals.find((g) => g.id === dec.targetGoalJarId)?.title || activeGoal.title}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className="font-bold text-emerald-700 text-sm block">
                      +{formatINR(dec.amountSaved || dec.amount)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Swept
                    </span>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
