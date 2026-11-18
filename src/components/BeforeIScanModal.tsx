"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { Transaction } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Zap,
  X,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  CornerDownLeft,
  ArrowRightLeft,
  UtensilsCrossed,
  ShoppingBag,
  Film,
  Target,
} from "lucide-react";
import confetti from "canvas-confetti";

interface BeforeIScanModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export const BeforeIScanModal: React.FC<BeforeIScanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, analysis, claimSavings, addBatchTransactions } = useFinancialMemory();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [smartSwapResult, setSmartSwapResult] = useState<SmartSwapData | null>(null);
  const [swapSuccessMessage, setSwapSuccessMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const safePoolAmount = analysis.remainingMonthlyPool > 0 ? analysis.remainingMonthlyPool : 30592;
  const daysToPayday = analysis.daysRemaining || 17;

  const activeGoal = profile.goals && profile.goals.length > 0
    ? profile.goals[0]
    : { id: "goal_iphone", title: "New iPhone", targetAmount: 80000, currentAmount: 36000 };

  const presetScenarios = [
    {
      id: "preset_food",
      query: "Weekend Dinner & Drinks — ₹1,500",
      label: "₹1,500 Friday Night Food Order",
      amount: 1500,
      icon: UtensilsCrossed,
    },
    {
      id: "preset_sneakers",
      query: "New Sneakers — ₹4,500",
      label: "₹4,500 Branded Sneakers",
      amount: 4500,
      icon: ShoppingBag,
    },
    {
      id: "preset_concert",
      query: "Concert / Movie Outing — ₹2,200",
      label: "₹2,200 Concert / Movie Outing",
      amount: 2200,
      icon: Film,
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setSwapSuccessMessage(null);
    } else {
      setSmartSwapResult(null);
      setSwapSuccessMessage(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
        swapTitle: "Local Spot & House Hangout",
        swapDescription: "Swap to a ₹550 local spot or house hangout—same great night, ₹950 cheaper.",
        swapCost,
        savedDifference: diff,
        swapButtonText: `Take the Swap & Sweep ${formatINR(diff)} to Goal Jar`,
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
        swapTitle: "Sneaker Restoration & Deep-Clean Kit",
        swapDescription: "Swap to a ₹650 premium sneaker restoration kit to make your current favorite pair look brand new—same fresh kick feel, ₹3,850 cheaper.",
        swapCost,
        savedDifference: diff,
        swapButtonText: `Take the Swap & Sweep ${formatINR(diff)} to Goal Jar`,
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
        swapTitle: "Twilight Matinee & BYO Snacks",
        swapDescription: "Swap to a ₹700 twilight screening with friends + bring your own favorite snacks—same great vibe, ₹1,500 cheaper.",
        swapCost,
        savedDifference: diff,
        swapButtonText: `Take the Swap & Sweep ${formatINR(diff)} to Goal Jar`,
      };
    }

    const origCost = parsedAmount > 0 ? parsedAmount : 1800;
    const swapCost = Math.round(origCost * 0.35);
    const diff = Math.max(0, origCost - swapCost);
    const estimatedDays = Math.max(2, Math.round(origCost / 135));

    return {
      originalItem: text || "Item",
      originalCost: origCost,
      delayDays: estimatedDays,
      activeGoalTitle: activeGoal.title,
      goalDelayText: `Buying this for ${formatINR(origCost)} delays your ${activeGoal.title} Goal Jar by ${estimatedDays} days.`,
      swapTitle: "Curated Feel-Good Alternative",
      swapDescription: `Swap to a quality curated alternative for ${formatINR(swapCost)}—enjoy the moment while keeping ${formatINR(diff)} in your pocket.`,
      swapCost,
      savedDifference: diff,
      swapButtonText: `Take the Swap & Sweep ${formatINR(diff)} to Goal Jar`,
    };
  };

  const handleEvaluate = (textToSubmit?: string, overrideAmount?: number) => {
    const query = (textToSubmit || prompt).trim();
    if (!query && !overrideAmount) return;

    setIsLoading(true);
    setSwapSuccessMessage(null);

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
    }, 200);
  };

  const handleAcceptSmartSwap = () => {
    if (!smartSwapResult) return;

    const { swapCost, savedDifference, swapTitle, originalItem } = smartSwapResult;

    // Deduct ONLY swapCost from Total Safe-to-Spend Pool
    const swapTx: Transaction = {
      id: "tx_modal_swap_" + Date.now(),
      merchant: `Smart Swap: ${swapTitle}`,
      amount: swapCost,
      date: new Date().toISOString().split("T")[0],
      category: "Dining & Social",
      spendingType: "Impulse Want",
      upiRef: "SWAP" + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: "UPI Pay Guard",
      triggerTag: "smart-swap-accepted",
      rawSms: `[Smart Swap Accepted] Paid Rs. ${swapCost} instead of full Rs. ${smartSwapResult.originalCost}`,
    };
    addBatchTransactions([swapTx]);

    // Add savedDifference directly into active Goal Jar
    claimSavings(activeGoal.id, savedDifference, `Smart Swap: Saved ${formatINR(savedDifference)} on ${originalItem}`);

    const newPool = Math.max(0, safePoolAmount - swapCost);
    setSwapSuccessMessage(
      `🎉 Smart Swap Accepted! Spent only ${formatINR(swapCost)} • ${formatINR(savedDifference)} swept directly into your ${activeGoal.title} Goal Jar!`
    );

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.4 },
      colors: ["#10B981", "#059669", "#34D399", "#F59E0B"],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center items-end p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up-mobile sm:animate-fade-in">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-2 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Before-I-Scan AI Pay Guard
              </h3>
              <p className="text-[11px] text-slate-500">
                AI evaluates your spend and suggests a feel-good Smart Swap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Status strip */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
            <span>Safe Pool: <strong className="text-slate-900">{formatINR(safePoolAmount)}</strong></span>
            <span>Payday: {daysToPayday}d</span>
            <span className="hidden sm:inline">Target: <strong className="text-emerald-700">{activeGoal.title}</strong></span>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEvaluate();
            }}
            className="relative"
          >
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want to buy? (e.g. Weekend Dinner — ₹1,500)..."
              className="w-full pl-4 pr-24 py-3 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[46px]"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Evaluating...</span>
                </>
              ) : (
                <>
                  <span>Evaluate</span>
                  <CornerDownLeft className="w-3 h-3 hidden sm:inline" />
                </>
              )}
            </button>
          </form>

          {/* 3 Preset Scenarios */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
              Or tap a preset scenario:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {presetScenarios.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPrompt(item.query);
                      handleEvaluate(item.query, item.amount);
                    }}
                    className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all text-xs text-slate-700 leading-snug active:scale-98 flex items-center gap-2"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success Banner */}
          {swapSuccessMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{swapSuccessMessage}</span>
            </div>
          )}

          {/* Smart Swap Card */}
          {smartSwapResult && (
            <div className="fintech-card rounded-2xl p-4 bg-gradient-to-br from-white to-emerald-50/30 border border-emerald-300 shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100 text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Smart Swap Recommendation</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Save +{formatINR(smartSwapResult.savedDifference)}
                </span>
              </div>

              {/* Goal Delay Reality Check */}
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span>{smartSwapResult.goalDelayText}</span>
              </div>

              {/* Swap Description */}
              <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs text-slate-700 space-y-2">
                <span className="font-bold text-slate-900 block">The Smart Swap:</span>
                <p className="font-medium text-slate-600">&ldquo;{smartSwapResult.swapDescription}&rdquo;</p>
                <div className="flex justify-between font-mono text-[11px] pt-1 border-t border-slate-100">
                  <span>Spend: <strong>{formatINR(smartSwapResult.swapCost)}</strong></span>
                  <span className="text-emerald-700 font-bold">Sweep: +{formatINR(smartSwapResult.savedDifference)}</span>
                </div>
              </div>

              {/* 1-Tap Action Button */}
              <button
                type="button"
                onClick={handleAcceptSmartSwap}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-white text-white" />
                <span>{smartSwapResult.swapButtonText}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
