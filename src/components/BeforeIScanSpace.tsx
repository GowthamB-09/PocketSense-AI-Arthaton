"use client";

import React, { useState, useRef } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { Transaction } from "@/types";
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
  UtensilsCrossed,
  Film,
  Flame,
  ArrowRightLeft,
  Check,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import confetti from "canvas-confetti";
import { AiMoneyCoachCard } from "@/components/AiMoneyCoachCard";

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
  const { profile, analysis, claimSavings, addBatchTransactions } = useFinancialMemory();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [smartSwapResult, setSmartSwapResult] = useState<SmartSwapData | null>(null);
  const [swapSuccessMessage, setSwapSuccessMessage] = useState<string | null>(null);
  const [showSimplerSwap, setShowSimplerSwap] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const safePoolAmount = analysis.remainingMonthlyPool > 0 ? analysis.remainingMonthlyPool : 30592;
  const daysToPayday = analysis.daysRemaining || 17;

  // Active goal jar to protect (e.g. New iPhone or 24K Gold)
  const activeGoal = profile.goals && profile.goals.length > 0
    ? profile.goals[0]
    : { id: "goal_iphone", title: "New iPhone", targetAmount: 80000, currentAmount: 36000 };

  // 3 Exact Preset Scenario Buttons requested by User
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
    const isFood = /food|dinner|drinks|beer|burger|swiggy|zomato/i.test(text) || parsedAmount === 1500;
    const isSneakers = /sneaker|shoes|kicks|apparel|shirt|zara/i.test(text) || parsedAmount === 4500;
    const isEntertainment = /concert|movie|outing|show|theatre/i.test(text) || parsedAmount === 2200;

    if (isFood) {
      const origCost = parsedAmount || 1500;
      const swapCost = 550;
      const diff = Math.max(0, origCost - swapCost);
      return {
        originalItem: "Friday Night Food Order",
        originalCost: origCost,
        delayDays: 11,
        activeGoalTitle: activeGoal.title,
        goalDelayText: `Buying this for ${formatINR(origCost)} delays your ${activeGoal.title} Goal Jar by 11 days.`,
        swapTitle: "Local Spot or Cozy House Hangout",
        swapDescription: "Swap to a ₹550 local spot or house hangout—same great night, ₹950 cheaper.",
        swapCost,
        savedDifference: diff,
        swapButtonText: `Take the Swap & Sweep ${formatINR(diff)} to Goal Jar`,
        simplerText: "Spend ₹550 instead of ₹1,500 tonight—you have equal fun and save ₹950 for your iPhone.",
      };
    }

    if (isSneakers) {
      const origCost = parsedAmount || 4500;
      const swapCost = 650;
      const diff = Math.max(0, origCost - swapCost);
      return {
        originalItem: "Branded Sneakers",
        originalCost: origCost,
        delayDays: 27,
        activeGoalTitle: activeGoal.title,
        goalDelayText: `Buying this for ${formatINR(origCost)} delays your ${activeGoal.title} Goal Jar by 27 days.`,
        swapTitle: "Premium Sneaker Restoration & Deep-Clean Kit",
        swapDescription: "Swap to a ₹650 premium sneaker restoration & deep-clean kit to make your current favorite pair look brand new—same fresh kick feel, ₹3,850 cheaper.",
        swapCost,
        savedDifference: diff,
        swapButtonText: `Take the Swap & Sweep ${formatINR(diff)} to Goal Jar`,
        simplerText: "Clean your favorite kicks for ₹650 instead of spending ₹4,500—same fresh look, ₹3,850 saved.",
      };
    }

    if (isEntertainment) {
      const origCost = parsedAmount || 2200;
      const swapCost = 700;
      const diff = Math.max(0, origCost - swapCost);
      return {
        originalItem: "Concert / Movie Outing",
        originalCost: origCost,
        delayDays: 16,
        activeGoalTitle: activeGoal.title,
        goalDelayText: `Buying this for ${formatINR(origCost)} delays your ${activeGoal.title} Goal Jar by 16 days.`,
        swapTitle: "Twilight Matinee & BYO Gourmet Snacks",
        swapDescription: "Swap to a ₹700 twilight screening with friends + bring your own favorite snacks—same great vibe, ₹1,500 cheaper.",
        swapCost,
        savedDifference: diff,
        swapButtonText: `Take the Swap & Sweep ${formatINR(diff)} to Goal Jar`,
        simplerText: "Catch the matinee for ₹700 instead of ₹2,200—same movie fun, ₹1,500 saved for your goal.",
      };
    }

    // Custom fallback for any custom item or price
    const origCost = parsedAmount > 0 ? parsedAmount : 1800;
    const swapCost = Math.round(origCost * 0.35);
    const diff = Math.max(0, origCost - swapCost);
    const estimatedDays = Math.max(2, Math.round(origCost / 135));

    return {
      originalItem: text || "Extra Spend Item",
      originalCost: origCost,
      delayDays: estimatedDays,
      activeGoalTitle: activeGoal.title,
      goalDelayText: `Buying this for ${formatINR(origCost)} delays your ${activeGoal.title} Goal Jar by ${estimatedDays} days.`,
      swapTitle: "Curated Feel-Good Alternative",
      swapDescription: `Swap to a quality curated alternative for ${formatINR(swapCost)}—enjoy the moment while keeping ${formatINR(diff)} in your pocket.`,
      swapCost,
      savedDifference: diff,
      swapButtonText: `Take the Swap & Sweep ${formatINR(diff)} to Goal Jar`,
      simplerText: `Spend ${formatINR(swapCost)} instead of ${formatINR(origCost)}—have fun while saving ${formatINR(diff)} for your ${activeGoal.title}.`,
    };
  };

  const handleEvaluate = (textToSubmit?: string, overrideAmount?: number) => {
    const query = (textToSubmit || prompt).trim();
    if (!query && !overrideAmount) return;

    setIsLoading(true);
    setSwapSuccessMessage(null);

    // Extract numerical price
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
    if (!parsedAmount) parsedAmount = 1500;

    setTimeout(() => {
      const result = generateSmartSwap(query, parsedAmount);
      setSmartSwapResult(result);
      setIsLoading(false);
    }, 250);
  };

  // 1-Tap "Take the Swap & Sweep ₹X to Goal Jar" Button Action
  const handleAcceptSmartSwap = () => {
    if (!smartSwapResult) return;

    const { swapCost, savedDifference, swapTitle, originalItem } = smartSwapResult;

    // 1. Deduct ONLY swapCost (e.g. ₹550) from "Total Safe-to-Spend Pool" via a real ledger transaction
    const swapTx: Transaction = {
      id: "tx_swap_" + Date.now(),
      merchant: `Smart Swap: ${swapTitle}`,
      amount: swapCost,
      date: new Date().toISOString().split("T")[0],
      category: "Dining & Social",
      spendingType: "Impulse Want",
      upiRef: "SWAP" + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: "UPI Smart Swap",
      triggerTag: "smart-swap-accepted",
      rawSms: `[Smart Swap Accepted] Paid Rs. ${swapCost} instead of full Rs. ${smartSwapResult.originalCost}`,
    };
    addBatchTransactions([swapTx]);

    // 2. Add the savedDifference (e.g. ₹950) directly into the active Goal Jar progress bar
    claimSavings(activeGoal.id, savedDifference, `Smart Swap: Saved ${formatINR(savedDifference)} on ${originalItem}`);

    // 3. Show celebratory confirmation toast
    const newPool = Math.max(0, safePoolAmount - swapCost);
    setSwapSuccessMessage(
      `🎉 Smart Swap Accepted! Spent only ${formatINR(swapCost)} • ${formatINR(savedDifference)} swept directly into your ${activeGoal.title} Goal Jar! Total Safe Pool: ${formatINR(newPool)}.`
    );

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
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Before-I-Scan AI Pay Guard</span>
                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Smart Swap Engine
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Check any purchase before swiping — AI suggests a cheaper, feel-good alternative and sweeps the difference to your Goal Jar.
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

        {/* 1. SINGLE-INPUT IMPULSE CHECK BAR */}
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
              placeholder="What do you want to buy? (e.g. Weekend Dinner — ₹1,500 or New Sneakers — ₹4,500)..."
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
                  <span>Check &amp; Swap</span>
                  <CornerDownLeft className="w-3.5 h-3.5 hidden sm:inline" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* 3 ONE-TAP PRESET SCENARIO BUTTONS FOR EFFORTLESS TESTING */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2.5 uppercase tracking-wide flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Test 1-Tap Preset Scenarios:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        </div>

        {/* 2. GOAL-AWARE IMPACT & "SMART SWAP" AI SUGGESTION CARD */}
        {smartSwapResult && (
          <div className="mt-4 pt-6 border-t border-slate-200 space-y-4 animate-fade-in">
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

        {profile.pastImpulseDecisions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No impulse purchases intercepted yet. Tap any preset above to test the Smart Swap!
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
        )}
      </div>

      {/* PocketSense AI Money Coach - Exclusive to Before I Scan */}
      <AiMoneyCoachCard
        title="PocketSense AI Money Coach"
        subtitle="Zero textbook jargon • 5-second answers • Uses your real ₹ numbers"
      />
    </div>
  );
};
