"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { GoalJar } from "@/types";
import { formatINR } from "@/lib/utils";
import { INITIAL_GOAL_JARS } from "@/lib/demo/syntheticStudentData";
import {
  Plus,
  Trash2,
  Sparkles,
  Plane,
  Laptop,
  Smartphone,
  Coins,
  Shield,
  ShieldCheck,
  Target,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Lock,
  Headphones,
  Sliders,
  DollarSign,
  Landmark,
  Clock,
  ShieldAlert,
} from "lucide-react";
import confetti from "canvas-confetti";

export const GoalJarsSection: React.FC = () => {
  const { profile, addGoalJar, deleteGoalJar, claimSavings, isAutoPayPaused } = useFinancialMemory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<GoalJar | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("2000");
  const [expandedGoalIds, setExpandedGoalIds] = useState<Record<string, boolean>>({});

  const toggleGoalExpanded = (goalId: string) => {
    setExpandedGoalIds((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }));
  };

  // New Goal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newTimeline, setNewTimeline] = useState<"short-term" | "long-term">("short-term");
  const [newCategory, setNewCategory] = useState<GoalJar["category"]>("Tech");

  // UPI AutoPay Auto-Save States
  const [isMandateActive, setIsMandateActive] = useState<boolean>(true);
  const [mandateCap, setMandateCap] = useState<number>(5000);
  const [sweepFeedback, setSweepFeedback] = useState<{
    total: number;
    sipAmount: number;
    goldAmount: number;
    timestamp: string;
    refNo: string;
  } | null>(null);
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active goal jars directly from user's live profile
  const displayGoals: GoalJar[] = Array.isArray(profile.goals) ? profile.goals : INITIAL_GOAL_JARS;

  // 1. AI Price-Trend & "Best Time to Buy" Forecaster Engine
  const getGoalAiTrendData = (title: string, category: string, deadline?: string) => {
    const t = title.toLowerCase();

    // Goal 1: Noise-Cancelling Headphones (Audio Flagships)
    // Placed before iPhone to prevent 'headphone' from matching 'phone'
    if (t.includes("headphone") || t.includes("audio") || t.includes("sony") || t.includes("bose") || t.includes("earphone") || t.includes("airpod")) {
      return {
        trendStatus: "Seasonal Sale Watch",
        trendBoxHeader: "Seasonal Sale Watch — Wait for the next electronics sale to save ~₹3,300 (15% off)",
        isDropping: true,
        isRising: false,
        boxBg: "bg-purple-50/90 border-purple-200 text-purple-950",
        pillBg: "bg-purple-100 text-purple-800 border-purple-300",
        bestTimeToBuy: "Next Electronics Sale (Save ~15%)",
        insight:
          "Audio flagships routinely discount during seasonal electronics promotions and bank credit card sales. Wait for the upcoming sale to save ~₹3,300 (15% off).",
        vaultName: "Instant Safe ~6.8% / yr",
        vaultTag: "Short-Term (<1Y) • Base Cash safe • Hidden from UPI temptation",
        vaultRate: "~6.8% / yr",
        vaultEarned: 1240,
        smartSwapsEarned: 6800,
        counterLabel: "+₹1,240 Extra Earned While Waiting",
      };
    }

    // Goal 2: New iPhone
    if (t.includes("iphone") || t.includes("apple") || (/\bphone\b/i.test(t) && !t.includes("headphone"))) {
      return {
        trendStatus: "Price Dropping Soon",
        trendBoxHeader: "Price Dropping Soon — Wait until October to save ~₹11,000",
        isDropping: true,
        isRising: false,
        boxBg: "bg-rose-50/90 border-rose-200 text-rose-950",
        pillBg: "bg-rose-100 text-rose-800 border-rose-300",
        bestTimeToBuy: "October (Diwali Festive Sale)",
        insight:
          "New model launches in September & Diwali festive sales drop prices by 12–18%. Best Time to Buy: October (Wait 6 weeks to save ~₹11,000).",
        vaultName: "Instant Safe ~6.8% / yr",
        vaultTag: "Short-Term (<1Y) • Base Cash safe • Hidden from daily UPI • Bonus interest",
        vaultRate: "~6.8% / yr",
        vaultEarned: 2450,
        smartSwapsEarned: 14000,
        counterLabel: "+₹2,450 Extra Earned While Waiting",
      };
    }

    // Goal 3: 24K Gold
    if (t.includes("gold") || t.includes("jewel") || category === "Wealth") {
      return {
        trendStatus: "Price Rising",
        trendBoxHeader: "Price Rising — Buy via monthly Digital Gold micro-buys",
        isDropping: false,
        isRising: true,
        boxBg: "bg-amber-50/90 border-amber-200 text-amber-950",
        pillBg: "bg-amber-100 text-amber-800 border-amber-300",
        bestTimeToBuy: "Lock in Gradually (Micro-Buys)",
        insight:
          "Central bank buying and wedding season demand push prices up. Best Time to Buy: Lock in monthly micro-buys rather than waiting.",
        vaultName: "Index Fund + Gold ~11.5% / yr",
        vaultTag: "Long-Term (1–3Y) • Beats Price Rise & multiplies savings",
        vaultRate: "~11.5% / yr",
        vaultEarned: 3820,
        smartSwapsEarned: 22000,
        counterLabel: "+₹3,820 Extra Earned While Waiting",
      };
    }

    // Dynamic AI Fallback for Custom User Goals
    const isTechOrGadget = category === "Tech" || /mac|laptop|camera|ps5|console/i.test(t);
    const isTravel = category === "Travel" || /trip|flight|hotel|vacation/i.test(t);

    if (isTechOrGadget) {
      return {
        trendStatus: "Price Dropping Soon",
        trendBoxHeader: "Price Dropping Soon — Wait for Q4 Holiday Clearance",
        isDropping: true,
        isRising: false,
        boxBg: "bg-rose-50/90 border-rose-200 text-rose-950",
        pillBg: "bg-rose-100 text-rose-800 border-rose-300",
        bestTimeToBuy: "Q4 Festive Sales (Save ~10–15%)",
        insight:
          "Electronics routinely discount during quarterly platform promotions. Wait for sales to unlock cashback and card bonuses.",
        vaultName: "Instant Safe ~6.8% / yr",
        vaultTag: "Short-Term (<1Y) • Base Cash safe • Locked away from UPI spending",
        vaultRate: "~6.8% / yr",
        vaultEarned: 950,
        smartSwapsEarned: 3500,
        counterLabel: "+₹950 Extra Earned While Waiting",
      };
    }

    if (isTravel) {
      return {
        trendStatus: "Price Rising",
        trendBoxHeader: "Price Rising — Book 7–9 weeks in advance",
        isDropping: false,
        isRising: true,
        boxBg: "bg-amber-50/90 border-amber-200 text-amber-950",
        pillBg: "bg-amber-100 text-amber-800 border-amber-300",
        bestTimeToBuy: "Midweek Booking Window",
        insight:
          "Aviation fuel surcharges and seasonal surges push travel costs higher closer to departure. Book flights early on Tuesdays/Wednesdays.",
        vaultName: "Instant Safe ~6.8% / yr",
        vaultTag: "Short-Term (<1Y) • Easy-to-withdraw cash for quick booking",
        vaultRate: "~6.8% / yr",
        vaultEarned: 1100,
        smartSwapsEarned: 4000,
        counterLabel: "+₹1,100 Extra Earned While Waiting",
      };
    }

    return {
      trendStatus: "Holding Steady",
      trendBoxHeader: "Holding Steady — Buy anytime once funded",
      isDropping: false,
      isRising: false,
      boxBg: "bg-slate-50 border-slate-200 text-slate-900",
      pillBg: "bg-slate-100 text-slate-800 border-slate-300",
      bestTimeToBuy: "When Target Reached",
      insight:
        "Stable pricing pattern. Keep funds accumulating in your Out-of-Sight Safe Growth Vault until 100% funded.",
      vaultName: "Instant Safe ~6.8% / yr",
      vaultTag: "Short-Term (<1Y) • Base Cash safe lockbox",
      vaultRate: "~6.8% / yr",
      vaultEarned: 750,
      smartSwapsEarned: 2200,
      counterLabel: "+₹750 Extra Earned While Waiting",
    };
  };

  const getVaultIcon = (title: string, category: string) => {
    const t = title.toLowerCase();
    const c = (category || "").toLowerCase();
    if (t.includes("iphone") || t.includes("apple") || t.includes("phone") || c.includes("tech")) return Smartphone;
    if (t.includes("gold") || t.includes("jewel") || c.includes("wealth")) return Coins;
    if (t.includes("headphone") || t.includes("audio") || c.includes("audio") || c.includes("lifestyle")) return Headphones;
    if (t.includes("emergency") || t.includes("shield") || c.includes("emergency")) return Shield;
    if (t.includes("trip") || t.includes("travel") || c.includes("travel")) return Plane;
    if (t.includes("macbook") || t.includes("laptop")) return Laptop;
    return Target;
  };

  // 1-Tap Trigger Friday Auto-Sweep
  const handleTriggerFridayAutoSweep = () => {
    if (!isMandateActive) return;
    if (isAutoPayPaused) {
      setToastMessage("Friday AutoPay sweep is paused by Silent Risk Guard until your credit card bills are settled.");
      setTimeout(() => setToastMessage(null), 4000);
      return;
    }

    setIsSweeping(true);
    const simulatedBuffer = 2400; // unspent weekly buffer
    const simulatedRoundUps = 600; // round-up spare change
    const totalSweep = simulatedBuffer + simulatedRoundUps; // ₹3,000

    const sipAmount = Math.round(totalSweep * 0.70); // ₹2,100 (70%)
    const goldAmount = totalSweep - sipAmount; // ₹900 (30%)

    const targetGoalA = displayGoals[1] || displayGoals[0];
    const targetGoalB = displayGoals[0] || displayGoals[2];

    if (targetGoalA) {
      claimSavings(targetGoalA.id, sipAmount, `Friday AutoPay Sweep to Out-of-Sight Vault`);
    }
    if (targetGoalB) {
      claimSavings(targetGoalB.id, goldAmount, `Friday AutoPay Sweep to Out-of-Sight Vault`);
    }

    const refNo = "NPCI-VAULT-" + Math.floor(10000000 + Math.random() * 90000000);
    setSweepFeedback({
      total: totalSweep,
      sipAmount,
      goldAmount,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      refNo,
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#10B981", "#0284C7", "#F59E0B"],
    });

    setTimeout(() => {
      setIsSweeping(false);
    }, 400);
  };

  const handleDeleteGoal = (id: string, title: string) => {
    deleteGoalJar(id);
    setToastMessage(`Removed "${title}" from your Goal Jars`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (!newTitle.trim() || isNaN(target) || target <= 0) return;

    const goalTitle = newTitle.trim();
    addGoalJar({
      title: goalTitle,
      targetAmount: target,
      currentAmount: 0,
      emoji: newCategory === "Tech" ? "📱" : newCategory === "Wealth" ? "🪙" : newCategory === "Travel" ? "✈️" : newCategory === "Lifestyle" ? "🎧" : "🎯",
      category: newCategory,
      color: "#059669",
      deadline: newTimeline === "short-term" ? "2027-10-15" : "2028-12-31",
    });

    setNewTitle("");
    setNewTarget("");
    setShowAddModal(false);
    setToastMessage(`Added "${goalTitle}" with AI Price-Trend Forecaster!`);
    setTimeout(() => setToastMessage(null), 3500);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.4 },
    });
  };

  const handleQuickDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    claimSavings(depositModalGoal.id, amt, `Manual top-up to ${depositModalGoal.title} Safe Vault`);
    setDepositModalGoal(null);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#059669", "#0284C7", "#D97706"],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. TOP HEADER & PROMINENT "+ ADD CUSTOM GOAL" BUTTON
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
            <Target className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Goal Jars &amp; AI Price-Trend Forecaster</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                {displayGoals.length} Goals
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live price trends, optimal purchase timing, and out-of-sight vaults that multiply your savings.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all shrink-0 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 fill-white" />
          <span>+ Add Custom Goal</span>
        </button>
      </div>

      {/* Live Toast Feedback for Goal Jars */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-950 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-mono"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. GOAL JAR CARDS / CLEAN EMPTY STATE
      ───────────────────────────────────────────────────────────────────────────── */}
      {displayGoals.length === 0 ? (
        <div className="fintech-card rounded-2xl p-8 sm:p-10 bg-white border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center shadow-xs">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Active Goal Jars</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You have no active goals. Add a custom goal to forecast optimal buying times and lock cash in high-yield vaults.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>+ Add Custom Goal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                INITIAL_GOAL_JARS.forEach((g) => addGoalJar(g));
                setToastMessage("Restored demo Goal Jars");
                setTimeout(() => setToastMessage(null), 3000);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            >
              Restore Demo Goals
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayGoals.map((jar) => {
            const percent = Math.min(100, Math.round((jar.currentAmount / jar.targetAmount) * 100));
            const VaultIcon = getVaultIcon(jar.title, jar.category);
            const trendData = getGoalAiTrendData(jar.title, jar.category, jar.deadline);
            const isExpanded = Boolean(expandedGoalIds[jar.id]);

            return (
              <div
                key={jar.id}
                className="fintech-card rounded-2xl p-5 flex flex-col justify-between group bg-white border-2 border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Top Row: Icon, Title & Delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-700 shadow-xs">
                        <VaultIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                          {jar.title} — {formatINR(jar.targetAmount)}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                          Category: {jar.category}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(jar.id, jar.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                      title={`Delete ${jar.title} goal`}
                      aria-label={`Delete ${jar.title} goal`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Balance & Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-xl font-black text-slate-900">{formatINR(jar.currentAmount)}</span>
                      <span className="text-xs text-slate-500">Target: {formatINR(jar.targetAmount)}</span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                      <span className="font-semibold text-slate-700">{percent}% funded</span>
                      <span className="text-emerald-700 font-bold">{formatINR(jar.targetAmount - jar.currentAmount)} to go</span>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────────────────
                      A. COMPACT 1-LINE ALERT STRIP WITH PROGRESSIVE DISCLOSURE
                  ───────────────────────────────────────────────────────── */}
                  <div className={`p-3 rounded-xl border ${trendData.boxBg} space-y-2.5 transition-all`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {trendData.isDropping ? (
                          <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        ) : trendData.isRising ? (
                          <TrendingUp className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        ) : (
                          <Target className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="text-xs font-bold leading-tight truncate">
                          {trendData.trendBoxHeader}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleGoalExpanded(jar.id)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-0.5 shrink-0 cursor-pointer focus:outline-none"
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? "Show Less" : "Know More"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Expandable Details Container */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-black/5 space-y-2.5 animate-fade-in">
                        <p className="text-[11px] leading-relaxed font-sans opacity-90">
                          {trendData.insight}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono font-semibold pt-1 border-t border-black/5">
                          <span>Best Time to Buy:</span>
                          <span className="font-bold underline">{trendData.bestTimeToBuy}</span>
                        </div>

                        {/* Out-of-Sight Safe Growth Vault Badge */}
                        <div className="p-2.5 rounded-lg bg-white/80 border border-slate-200/80 text-xs space-y-0.5">
                          <div className="flex items-center justify-between font-mono font-bold text-slate-900">
                            <span className="flex items-center gap-1.5 truncate">
                              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{trendData.vaultName}</span>
                            </span>
                          </div>
                          <span className="text-slate-500 block font-mono text-[10px] leading-tight">
                            {trendData.vaultTag}
                          </span>
                        </div>

                        {/* Extra Earned While Waiting Counter */}
                        <div className="p-2 rounded-lg bg-emerald-50/90 border border-emerald-300 text-xs font-mono text-emerald-950">
                          <div className="flex items-center gap-1 font-bold text-emerald-900 mb-0.5 text-[11px]">
                            <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{trendData.counterLabel}:</span>
                          </div>
                          <span className="text-[10px] block font-semibold text-emerald-800">
                            +{formatINR(trendData.vaultEarned)} vault growth + {formatINR(trendData.smartSwapsEarned)} from Smart Swaps
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              {/* Action Button: Top-Up Vault */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(jar)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-900 text-slate-700 border border-slate-200 transition-all flex items-center justify-center gap-1.5 active:scale-95 min-h-[38px]"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>+ Top-Up Safe Vault</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. ANTI-TEMPTATION & OUT-OF-SIGHT SAFE GROWTH VAULTS BANNER
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="fintech-card rounded-2xl p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-400 border border-white/20 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                <span>&quot;Out-of-Sight&quot; Safe Growth Vaults</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Anti-Temptation + Money Multiplier
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              <strong>Why Regular Bank Accounts Fail:</strong> Money visible in your daily UPI checking account gets spent on impulse. PocketSense AutoPay automatically sweeps goal funds out-of-sight into locked, high-yield vaults that multiply your savings while you wait for the best time to buy.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all shrink-0 self-start md:self-auto active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Custom Goal</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          4. UPI AUTOPAY AUTO-SAVE CARD (ZERO-CLICK MONTHLY INVESTING)
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={`text-sm sm:text-base font-bold tracking-tight px-2.5 py-1 rounded-lg border inline-flex items-center gap-2 transition-colors ${
                    isAutoPayPaused
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : isMandateActive
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                      : "bg-slate-100 text-slate-700 border-slate-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isAutoPayPaused
                        ? "bg-amber-500 animate-pulse"
                        : isMandateActive
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-slate-400"
                    }`}
                  />
                  <span>
                    AutoPay Auto-Save: {isAutoPayPaused ? "PAUSED" : isMandateActive ? "ACTIVE" : "PAUSED"}
                  </span>
                </h3>
                {isAutoPayPaused ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Silent Risk Guard Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    NPCI Certified
                  </span>
                )}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  Max {formatINR(mandateCap)}/mo
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Zero-click monthly investing. Automatically sweeps weekly unspent buffers + UPI spare change into your Out-of-Sight Safe Growth Vaults every Friday.
              </p>
            </div>
          </div>

          {/* Interactive Mandate Toggle */}
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <span className="text-xs font-semibold text-slate-600">
              {isAutoPayPaused ? "Paused by Risk Guard" : isMandateActive ? "Autopilot ON" : "Autopilot OFF"}
            </span>
            <button
              type="button"
              disabled={isAutoPayPaused}
              onClick={() => setIsMandateActive(!isMandateActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAutoPayPaused
                  ? "bg-amber-300 cursor-not-allowed opacity-80"
                  : isMandateActive
                  ? "bg-emerald-600 cursor-pointer"
                  : "bg-slate-300 cursor-pointer"
              }`}
              role="switch"
              aria-checked={isMandateActive && !isAutoPayPaused}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAutoPayPaused || isMandateActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 70% / 30% Split Visualizer & Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Schedule: <strong>Every Friday @ 6:00 PM</strong>
              </span>
              <span className="text-slate-500">
                Rule: <strong>70% Wealth / Gold Vault + 30% Instant Safe Vault</strong>
              </span>
            </div>

            {/* Split Progress Meter */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: "70%" }}
                  title="70% Digital Gold & Index Fund Vault (~11.5% / yr)"
                />
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: "30%" }}
                  title="30% Instant Safe Vault (~6.8% / yr)"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  70% Gold &amp; Index Vault (~11.5% / yr)
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  30% Instant Safe (~6.8% / yr)
                </span>
              </div>
            </div>

            {/* Mandate Preset Caps */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">Monthly Auto-Save Cap:</span>
              {[3000, 5000, 10000].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setMandateCap(cap)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    mandateCap === cap
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  ₹{cap.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Button & Status */}
          <div className="md:col-span-4 flex flex-col justify-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={handleTriggerFridayAutoSweep}
              disabled={!isMandateActive || isSweeping || isAutoPayPaused}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 min-h-[44px] ${
                isAutoPayPaused
                  ? "bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40"
              }`}
            >
              <Zap className={`w-4 h-4 ${isAutoPayPaused ? "text-amber-700" : "fill-white"}`} />
              <span>
                {isAutoPayPaused
                  ? "AutoPay Sweep Paused by Silent Risk Guard"
                  : "Trigger Friday Auto-Sweep Now"}
              </span>
            </button>
            <span className="text-[10px] text-center text-slate-500 font-mono">
              {isAutoPayPaused
                ? "Paused: Card dues exceed 20% of salary. Settle bills in Risk Details to resume."
                : "Sweeps ₹3,000 into Out-of-Sight Vaults"}
            </span>
          </div>
        </div>

        {/* Live Sweep Confirmation Toast/Card */}
        {sweepFeedback && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-fade-in shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Friday AutoPay Sweep Executed Successfully!
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Swept <strong>{formatINR(sweepFeedback.total)}</strong> out-of-sight without asking for a UPI PIN:{" "}
                    <strong className="text-amber-700">{formatINR(sweepFeedback.sipAmount)}</strong> into Digital Gold &amp; Wealth Vault +{" "}
                    <strong className="text-emerald-700">{formatINR(sweepFeedback.goldAmount)}</strong> into Safe FD Vault.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-800 shrink-0">
                {sweepFeedback.refNo}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. 3 ULTRA-SHORT PLAIN-ENGLISH INVESTING CARDS
      ───────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 uppercase tracking-wide">
            Plain-English Wealth Essentials (No Jargon)
          </span>
          <span className="text-slate-400 font-mono text-[11px]">10-Second Explainer</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Emergency FD */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Fixed Deposit (FD)</h4>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                100% Guaranteed
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A safe bank lockbox. Zero chance of losing money. Yields ~6.5–7% / yr without Price Swings.
            </p>
          </div>

          {/* Card 2: Nifty 50 Index Fund */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Nifty 50 Index Fund</h4>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                ~12% Historical
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              A single basket holding India&apos;s 50 biggest companies (TCS, Reliance, HDFC). Beats Price Rise over time.
            </p>
          </div>

          {/* Card 3: SIP Autopilot */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Coins className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">SIP Autopilot</h4>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Zero Discipline
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero-discipline Growth. Automatically sweeps idle Friday cash and UPI spare change into safe vaults without asking for a UPI PIN every month.
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          6. + ADD CUSTOM GOAL QUICK MODAL WITH AUTO AI FORECAST
      ───────────────────────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 flex sm:items-center sm:justify-center items-end p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl space-y-4 animate-slide-up-mobile sm:animate-fade-in relative"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Add Goal with AI Price Forecaster</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Type any item — AI generates a price trend forecast &amp; assigns an Out-of-Sight Safe Vault.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What are you saving for?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook M3, Sony Alpha Camera, PlayStation 5, Bali Trip..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 85000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 text-base sm:text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[44px]"
                  >
                    <option value="Tech">Tech / Gadgets</option>
                    <option value="Wealth">Wealth / Gold</option>
                    <option value="Emergency">Emergency Fund</option>
                    <option value="Travel">Travel &amp; Flights</option>
                    <option value="Lifestyle">Lifestyle &amp; Gear</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Live AI Forecast Preview in the Modal */}
              {newTitle.trim().length > 1 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 animate-fade-in text-xs font-sans">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-slate-900">AI Trend Forecast:</span>
                    <span className="text-[10px] font-bold text-emerald-700">Auto-Generated</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {getGoalAiTrendData(newTitle, newCategory).insight}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 text-slate-500">
                    <span>Vault: <strong>{getGoalAiTrendData(newTitle, newCategory).vaultName}</strong></span>
                    <span className="text-emerald-700 font-bold">{getGoalAiTrendData(newTitle, newCategory).bestTimeToBuy}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs min-h-[40px] active:scale-95"
                >
                  Create Goal &amp; Lock Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          8. QUICK TOP-UP VAULT MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center items-end p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm p-6 shadow-2xl space-y-4 animate-slide-up-mobile sm:animate-fade-in">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Top-Up Safe Vault: {depositModalGoal.title}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Locks cash out-of-sight from UPI into high-yield growth.
              </p>
            </div>

            <form onSubmit={handleQuickDeposit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {["1000", "2500", "5000", "10000"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDepositAmount(preset)}
                    className="py-2 text-xs font-mono font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors min-h-[38px] active:scale-95"
                  >
                    +₹{preset}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs min-h-[40px] active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lock in Safe Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
