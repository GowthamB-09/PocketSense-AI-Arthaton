"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { Transaction } from "@/types";
import { formatINR, extractQueryAmount } from "@/lib/utils";
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
  Lightbulb,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Star,
  Tv,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  PlaceSwapItem,
  fetchNearbyBudgetPlaces,
  getUserCoordinates,
  CURATED_BUDGET_RESTAURANTS,
  buildGoogleMapsUrl,
  FALLBACK_MAPS_NEARBY_URL,
} from "@/lib/maps/placesService";

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
  simplerText?: string;
  isFoodOrHangout?: boolean;
  isEntertainment?: boolean;
  primaryPlace?: PlaceSwapItem;
  runnerUpPlaces?: PlaceSwapItem[];
  isLivePlaces?: boolean;
}

export const BeforeIScanModal: React.FC<BeforeIScanModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, analysis, recordSmartSwap } = useFinancialMemory();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [smartSwapResult, setSmartSwapResult] = useState<SmartSwapData | null>(null);
  const [swapSuccessMessage, setSwapSuccessMessage] = useState<string | null>(null);
  const [showSimplerSwap, setShowSimplerSwap] = useState(false);
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
    const isFood = /food|dinner|eat out|dining|restaurant|cafe|coffee|drinks|beer|burger|swiggy|zomato|hangout|party|craving|biryani|pizza/i.test(text);
    const isSneakers = /sneaker|shoes|kicks|apparel|shirt|zara/i.test(text);
    const isEntertainment = /concert|movie|outing|show|theatre|theater|ticket|pvr|inox|film|watch movie/i.test(text);

    // 1. Ensure origCost is numeric and positive
    const origCost = parsedAmount > 0 ? parsedAmount : 1500;

    // 2. Proportional Goal Delay Reality Check based on user's daily savings rate (~₹140/day)
    const dailySavingsRate = 140;
    const delayDays = Math.max(1, Math.round(origCost / dailySavingsRate));
    const goalDelayText = `Buying this for ${formatINR(origCost)} delays your ${activeGoal.title} Goal Jar by ${delayDays} ${delayDays === 1 ? "day" : "days"}.`;

    // 3. Dynamic Swap Calculation: ensure swapCost is always strictly less than origCost
    let swapCost: number;
    let swapTitle: string;
    let swapDescription: string;
    let simplerText: string;
    let primaryPlace: PlaceSwapItem | undefined;
    let runnerUpPlaces: PlaceSwapItem[] | undefined;

    if (isFood) {
      const candidates = CURATED_BUDGET_RESTAURANTS.map((spot) => {
        let cost = spot.estimatedCost;
        if (origCost <= 400) {
          cost = Math.min(cost, Math.max(100, Math.round(origCost * 0.45)));
        } else if (cost >= origCost) {
          cost = Math.max(150, Math.round(origCost * 0.40));
        }
        return { ...spot, estimatedCost: cost };
      });
      primaryPlace = candidates[0];
      runnerUpPlaces = candidates.slice(1, 3);
      swapCost = primaryPlace.estimatedCost;
      swapTitle = primaryPlace.displayName;
      const savedDiff = Math.max(0, origCost - swapCost);
      swapDescription = `Skip the ${formatINR(origCost)} splurge—grab a meal at ${primaryPlace.displayName} (${primaryPlace.rating}★ on Google, ~${formatINR(primaryPlace.estimatedCost)} for one) instead. Same great food, +${formatINR(savedDiff)} swept straight into your ${activeGoal.title} jar.`;
      simplerText = `Dine at ${primaryPlace.displayName} (${primaryPlace.rating}★) for ~${formatINR(primaryPlace.estimatedCost)} instead of ${formatINR(origCost)}—have equal fun while saving ${formatINR(savedDiff)} for your ${activeGoal.title}.`;
    } else if (isEntertainment) {
      if (origCost > 250) {
        swapCost = 199;
      } else {
        swapCost = Math.min(199, Math.max(50, Math.round((origCost * 0.45) / 10) * 10));
      }
      swapTitle = "1-Month Netflix Mobile Plan";
      const savedDiff = Math.max(0, origCost - swapCost);
      swapDescription = `Skip the single ${formatINR(origCost)} ticket—grab a 1-month Netflix plan for ${formatINR(swapCost)}, watch 4 new releases this week + unlimited shows all month, and sweep +${formatINR(savedDiff)} to your ${activeGoal.title} jar.`;
      simplerText = `Spend ${formatINR(swapCost)} for a 1-month Netflix plan instead of one ${formatINR(origCost)} movie ticket, and save ${formatINR(savedDiff)} for your ${activeGoal.title}.`;
    } else if (isSneakers) {
      if (origCost === 4500) {
        swapCost = 650;
      } else {
        const raw = Math.round((origCost * 0.35) / 50) * 50;
        swapCost = Math.min(Math.max(50, raw), Math.max(50, origCost - 50));
      }
      swapTitle = "Sneaker Restoration & Deep-Clean Kit";
      const savedDiff = Math.max(0, origCost - swapCost);
      swapDescription = `Swap to a ${formatINR(swapCost)} premium sneaker restoration kit—same fresh look, ${formatINR(savedDiff)} cheaper.`;
      simplerText = `Spend ${formatINR(swapCost)} instead of ${formatINR(origCost)}—same fresh look and save ${formatINR(savedDiff)} for your ${activeGoal.title}.`;
    } else {
      const raw = Math.round((origCost * 0.40) / 50) * 50;
      swapCost = Math.min(Math.max(50, raw), Math.max(50, origCost - 50));
      swapTitle = "Curated Feel-Good Alternative";
      const savedDiff = Math.max(0, origCost - swapCost);
      swapDescription = `Swap to a quality curated alternative for ${formatINR(swapCost)}—enjoy the moment, ${formatINR(savedDiff)} cheaper.`;
      simplerText = `Spend ${formatINR(swapCost)} instead of ${formatINR(origCost)}—have fun while saving ${formatINR(savedDiff)} for your ${activeGoal.title}.`;
    }

    // 4. Dynamic Savings & Sweep Math: strictly bound to savedDifference
    const savedDifference = Math.max(0, origCost - swapCost);
    const swapButtonText = `Take the Swap & Sweep ${formatINR(savedDifference)} to Goal Jar`;

    return {
      originalItem: text || (isFood ? "Food Order" : isSneakers ? "Branded Sneakers" : isEntertainment ? "Entertainment" : "Extra Spend Item"),
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
      isFoodOrHangout: isFood,
      isEntertainment,
      primaryPlace,
      runnerUpPlaces,
      isLivePlaces: false,
    };
  };

  const handleSelectRunnerUp = (place: PlaceSwapItem) => {
    if (!smartSwapResult) return;
    const origCost = smartSwapResult.originalCost;
    const newCost = place.estimatedCost;
    const newSaved = Math.max(0, origCost - newCost);
    const newDesc = `Skip the ${formatINR(origCost)} splurge—grab a meal at ${place.displayName} (${place.rating}★ on Google, ~${formatINR(place.estimatedCost)} for one) instead. Same great food, +${formatINR(newSaved)} swept straight into your ${activeGoal.title} jar.`;
    const newSimpler = `Dine at ${place.displayName} (${place.rating}★) for ~${formatINR(place.estimatedCost)} instead of ${formatINR(origCost)}—have equal fun while saving ${formatINR(newSaved)} for your ${activeGoal.title}.`;

    setSmartSwapResult({
      ...smartSwapResult,
      swapTitle: place.displayName,
      swapCost: newCost,
      savedDifference: newSaved,
      swapDescription: newDesc,
      simplerText: newSimpler,
      swapButtonText: `Take the Swap & Sweep ${formatINR(newSaved)} to Goal Jar`,
      primaryPlace: place,
    });
  };

  const handleEvaluate = (textToSubmit?: string, overrideAmount?: number) => {
    const query = (textToSubmit || prompt).trim();
    if (!query && !overrideAmount) return;

    setIsLoading(true);
    setSwapSuccessMessage(null);

    let parsedAmount = overrideAmount || 0;
    if (!parsedAmount) {
      parsedAmount = extractQueryAmount(query);
    }
    if (!parsedAmount) parsedAmount = 1500;

    const isFood = /food|dinner|eat out|dining|restaurant|cafe|coffee|drinks|beer|burger|swiggy|zomato|hangout|party|craving|biryani|pizza/i.test(query);

    setTimeout(() => {
      const result = generateSmartSwap(query, parsedAmount);
      setSmartSwapResult(result);
      setIsLoading(false);

      if (isFood) {
        getUserCoordinates().then(async (coords) => {
          try {
            const { places, isLive } = await fetchNearbyBudgetPlaces({
              query,
              lat: coords.lat,
              lng: coords.lng,
              originalPrice: parsedAmount,
            });

            if (places && places.length > 0) {
              const topPlace = places[0];
              const runners = places.slice(1, 3);
              const cost = topPlace.estimatedCost;
              const saved = Math.max(0, parsedAmount - cost);

              setSmartSwapResult((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  swapTitle: topPlace.displayName,
                  swapCost: cost,
                  savedDifference: saved,
                  swapDescription: `Skip the ${formatINR(parsedAmount)} splurge—grab a meal at ${topPlace.displayName} (${topPlace.rating}★ on Google, ~${formatINR(topPlace.estimatedCost)} for one) instead. Same great food, +${formatINR(saved)} swept straight into your ${activeGoal.title} jar.`,
                  simplerText: `Dine at ${topPlace.displayName} (${topPlace.rating}★) for ~${formatINR(topPlace.estimatedCost)} instead of ${formatINR(parsedAmount)}—have equal fun while saving ${formatINR(saved)} for your ${activeGoal.title}.`,
                  swapButtonText: `Take the Swap & Sweep ${formatINR(saved)} to Goal Jar`,
                  primaryPlace: topPlace,
                  runnerUpPlaces: runners,
                  isLivePlaces: isLive,
                  isFoodOrHangout: true,
                };
              });
            }
          } catch (err) {
            console.warn("Async places fetch in modal failed:", err);
          }
        });
      }
    }, 200);
  };

  const handleAcceptSmartSwap = () => {
    if (!smartSwapResult) return;

    const { swapCost, savedDifference, swapTitle, originalItem, originalCost } = smartSwapResult;

    const { oldAmountSaved, netAdjustment } = recordSmartSwap({
      goalId: activeGoal.id,
      originalCost,
      swapCost,
      savedDifference,
      originalItem,
      swapTitle,
      query: prompt.trim() || originalItem,
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
                AI Pay Guard
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

                {/* Real Nearby Budget Restaurant Card (Google Maps & Reviews) */}
                {smartSwapResult.isFoodOrHangout && smartSwapResult.primaryPlace && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-slate-50 border border-emerald-200/90 space-y-2 text-xs shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                          <MapPin className="w-3.5 h-3.5 fill-white/20" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-900">
                              {smartSwapResult.primaryPlace.displayName}
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold font-mono">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              <span>{smartSwapResult.primaryPlace.rating}★</span>
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              ~{formatINR(smartSwapResult.primaryPlace.estimatedCost)} for one
                            </span>
                          </div>
                        </div>
                      </div>

                      <a
                        href={smartSwapResult.primaryPlace.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-emerald-800 border border-emerald-300 shadow-2xs transition-colors shrink-0 self-start sm:self-auto"
                      >
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>Open in Google Maps</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </a>
                    </div>

                    {smartSwapResult.runnerUpPlaces && smartSwapResult.runnerUpPlaces.length > 0 && (
                      <div className="pt-1.5 border-t border-emerald-200/60 space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                          More Nearby Budget Spots:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {smartSwapResult.runnerUpPlaces.map((runner) => (
                            <div
                              key={runner.id}
                              className="p-1.5 rounded-lg bg-white/95 border border-emerald-100 flex items-center justify-between gap-1 text-[11px]"
                            >
                              <div className="min-w-0">
                                <span className="font-medium text-slate-800 truncate block">
                                  {runner.displayName} ({runner.rating}★)
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ~{formatINR(runner.estimatedCost)} for one
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleSelectRunnerUp(runner)}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                >
                                  Use
                                </button>
                                <a
                                  href={runner.mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 text-slate-400 hover:text-slate-700 rounded"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* High-Value Digital Swap Card (Netflix 1-Month Plan) */}
                {smartSwapResult.isEntertainment && (
                  <div className="p-3 rounded-xl bg-gradient-to-r from-rose-50/70 via-red-50/40 to-slate-50 border border-red-200/80 space-y-1.5 text-xs shadow-2xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center shrink-0">
                          <Tv className="w-3.5 h-3.5 fill-white/20" />
                        </div>
                        <span className="font-bold text-slate-900">
                          1-Month Netflix Mobile Plan
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-red-700 bg-white px-2 py-0.5 rounded border border-red-200">
                        Only ₹199/month
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      Skip the single {formatINR(smartSwapResult.originalCost)} ticket—grab a 1-month Netflix plan for ₹199, watch 4 new releases this week + unlimited shows all month, and sweep +{formatINR(smartSwapResult.savedDifference)} straight to your {activeGoal.title} jar.
                    </p>
                  </div>
                )}

                <div className="flex justify-between font-mono text-[11px] pt-1 border-t border-slate-100">
                  <span>Spend: <strong>{formatINR(smartSwapResult.swapCost)}</strong></span>
                  <span className="text-emerald-700 font-bold">Sweep: +{formatINR(smartSwapResult.savedDifference)}</span>
                </div>
              </div>

              {/* 1. Clear Money-Split Breakdown (Where the Money Goes) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <ArrowRightLeft className="w-3 h-3 text-emerald-600" />
                  <span>Where the Money Goes:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/90 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-700">Spent Now</span>
                      <span className="text-[11px] font-mono font-bold text-slate-900">
                        {formatINR(smartSwapResult.swapCost)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug">
                      Deducted from your Safe Pool to satisfy the immediate craving right now.
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50/80 border border-emerald-200 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-emerald-800">Swept to Goal Jar</span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700">
                        +{formatINR(smartSwapResult.savedDifference)}
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-700/90 leading-snug">
                      Immediately locked into your {activeGoal.title} Goal Jar so you can&apos;t accidentally spend it later.
                    </p>
                  </div>
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
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-sans leading-relaxed animate-fade-in flex items-start gap-2 shadow-2xs">
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
          )}
        </div>
      </div>
    </div>
  );
};
