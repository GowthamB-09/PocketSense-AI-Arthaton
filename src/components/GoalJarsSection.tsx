"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { GoalJar } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Sparkles,
  Plane,
  Laptop,
  Smartphone,
  Coins,
  ShieldCheck,
  Target,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Lock,
  Headphones,
  Sliders,
  DollarSign,
  Landmark,
  ChevronRight,
  HelpCircle,
  Clock,
  ShieldAlert,
  Percent,
  MoveRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { AiMoneyCoachCard } from "@/components/AiMoneyCoachCard";

export const GoalJarsSection: React.FC = () => {
  const { profile, addGoalJar, deleteGoalJar, claimSavings } = useFinancialMemory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<GoalJar | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("2000");

  // New Goal Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newTimeline, setNewTimeline] = useState<"short-term" | "long-term">("short-term");
  const [newCategory, setNewCategory] = useState<GoalJar["category"]>("Tech");

  // UPI AutoPay e-Mandate States
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

  // Silent Portfolio Risk Guard State
  const [riskScenario, setRiskScenario] = useState<"card-trap" | "fd-drag" | "safe">("card-trap");

  // AI Advisor Bar Preset Question Active Answer
  const [activeAdvisorAnswer, setActiveAdvisorAnswer] = useState<{
    question: string;
    answer: string;
  } | null>(null);

  // 1. AI Price-Trend & "Best Time to Buy" Forecaster Engine
  const getGoalAiTrendData = (title: string, category: string, deadline?: string) => {
    const t = title.toLowerCase();

    // Goal 1: New iPhone
    if (t.includes("iphone") || t.includes("apple") || t.includes("phone")) {
      return {
        trendStatus: "Price Dropping Soon 📉",
        trendBadgeColor: "bg-rose-50 text-rose-700 border-rose-200",
        bestTimeToBuy: "October (Festive Sale)",
        insight:
          "New model launches in September & Diwali festive sales historically drop prices by 12–18%. Best Time to Buy: October (Wait 6 weeks to save ~₹11,000).",
        vaultType: "short-term" as const,
        vaultName: "Safe Liquid / High-Yield FD Vault (~6.8% p.a.)",
        vaultTag: "Zero Market Risk • Hidden from UPI • Earns Interest",
        vaultRate: "~6.8% p.a.",
        vaultEarned: 2450,
        smartSwapsEarned: 3100,
      };
    }

    // Goal 2: 24K Gold / Jewellery
    if (t.includes("gold") || t.includes("jewel") || category === "Wealth") {
      return {
        trendStatus: "Price Rising 📈",
        trendBadgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        bestTimeToBuy: "Lock in Gradually (Micro-Buys)",
        insight:
          "Global central bank buying and wedding season demand point to a +6% upward trend. Best Time to Buy: Lock in prices gradually via monthly Digital Gold micro-buys rather than waiting.",
        vaultType: "long-term" as const,
        vaultName: "Nifty 50 Index Fund SIP + Digital Gold Vault (~11.5% p.a.)",
        vaultTag: "Beats Inflation • Multiplies Wealth Compounding",
        vaultRate: "~11.5% p.a.",
        vaultEarned: 3820,
        smartSwapsEarned: 4200,
      };
    }

    // Goal 3: Noise-Cancelling Headphones
    if (t.includes("headphone") || t.includes("audio") || t.includes("sony") || t.includes("bose")) {
      return {
        trendStatus: "Holding Steady ➡️",
        trendBadgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        bestTimeToBuy: "Buy Once 100% Funded",
        insight:
          "No major hardware refresh or import duty change expected. Buy anytime once your jar hits 100%.",
        vaultType: "short-term" as const,
        vaultName: "Safe Liquid / High-Yield FD Vault (~6.8% p.a.)",
        vaultTag: "Zero Market Risk • Hidden from UPI",
        vaultRate: "~6.8% p.a.",
        vaultEarned: 890,
        smartSwapsEarned: 1850,
      };
    }

    // Emergency Shield
    if (t.includes("emergency") || t.includes("shield") || category === "Emergency") {
      return {
        trendStatus: "Capital Protected 🛡️",
        trendBadgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        bestTimeToBuy: "Keep 100% Intact",
        insight:
          "Safety Rule: Never put emergency cash in volatile stocks. Recommended: Keep 100% in an instant-withdrawal Bank FD (~6.5%).",
        vaultType: "short-term" as const,
        vaultName: "Instant-Withdrawal Emergency FD Vault (~6.5% p.a.)",
        vaultTag: "100% RBI Insured • 24/7 Liquidity",
        vaultRate: "~6.5% p.a.",
        vaultEarned: 3100,
        smartSwapsEarned: 2400,
      };
    }

    // Dynamic AI Fallback for Custom User Goals
    const isTechOrGadget = category === "Tech" || /mac|laptop|camera|ps5|console/i.test(t);
    const isTravel = category === "Travel" || /trip|flight|hotel|vacation/i.test(t);

    if (isTechOrGadget) {
      return {
        trendStatus: "Price Dropping Soon 📉",
        trendBadgeColor: "bg-rose-50 text-rose-700 border-rose-200",
        bestTimeToBuy: "Diwali / Year-End Clearance",
        insight:
          "Tech products typically see 10–15% seasonal discounts during festive quarterly clearance cycles. Best Time to Buy: Q4 Sales.",
        vaultType: "short-term" as const,
        vaultName: "Safe Liquid / High-Yield FD Vault (~6.8% p.a.)",
        vaultTag: "Zero Stock Risk • Out of Sight",
        vaultRate: "~6.8% p.a.",
        vaultEarned: 1250,
        smartSwapsEarned: 1600,
      };
    }

    if (isTravel) {
      return {
        trendStatus: "Price Rising 📈",
        trendBadgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        bestTimeToBuy: "Book 7–9 Weeks Ahead",
        insight:
          "Airfares and hotel surge pricing increase steeply within 30 days of departure. Lock in tickets 7–9 weeks in advance on Tuesday/Wednesday.",
        vaultType: "short-term" as const,
        vaultName: "Safe Liquid / High-Yield FD Vault (~6.8% p.a.)",
        vaultTag: "Liquid Cash • No Lock-in Penalty",
        vaultRate: "~6.8% p.a.",
        vaultEarned: 1540,
        smartSwapsEarned: 2100,
      };
    }

    return {
      trendStatus: "Holding Steady ➡️",
      trendBadgeColor: "bg-slate-50 text-slate-700 border-slate-200",
      bestTimeToBuy: "Buy When Fully Funded",
      insight:
        "Stable pricing forecast with regular seasonal minor promotions. Auto-sweep spare change to hit 100% without manual stress.",
      vaultType: "short-term" as const,
      vaultName: "Safe Liquid / High-Yield FD Vault (~6.8% p.a.)",
      vaultTag: "Safe Growth Vault",
      vaultRate: "~6.8% p.a.",
      vaultEarned: 950,
      smartSwapsEarned: 1400,
    };
  };

  const getVaultIcon = (title: string, category: string) => {
    const t = title.toLowerCase();
    if (t.includes("iphone") || t.includes("phone")) return Smartphone;
    if (t.includes("gold") || t.includes("jewel") || t.includes("coin")) return Coins;
    if (t.includes("headphone") || t.includes("audio")) return Headphones;
    if (t.includes("trip") || t.includes("japan") || category === "Travel") return Plane;
    if (t.includes("macbook") || t.includes("tech") || category === "Tech") return Laptop;
    if (t.includes("emergency") || t.includes("shield") || category === "Emergency") return ShieldCheck;
    if (t.includes("nifty") || t.includes("wealth") || category === "Wealth") return TrendingUp;
    return Target;
  };

  // 1-Tap Trigger Friday Auto-Sweep
  const handleTriggerFridayAutoSweep = () => {
    if (!isMandateActive) return;
    if (riskScenario === "card-trap") {
      alert("⚠️ Silent Risk Guard Alert: AutoPay sweep is safely PAUSED because your ICICI + HDFC card bills hit 65% of your salary. Switch scenario or tap 'Override & Sweep' to proceed.");
      return;
    }

    setIsSweeping(true);
    const simulatedBuffer = 2400; // unspent weekly buffer
    const simulatedRoundUps = 600; // round-up spare change
    const totalSweep = simulatedBuffer + simulatedRoundUps; // ₹3,000

    // 70% into Wealth / Gold Goal + 30% into Emergency / iPhone Vault
    const sipAmount = Math.round(totalSweep * 0.70); // ₹2,100 (70%)
    const goldAmount = totalSweep - sipAmount; // ₹900 (30%)

    const targetGoalA = profile.goals[1] || profile.goals[0];
    const targetGoalB = profile.goals[0] || profile.goals[2];

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

  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (!newTitle.trim() || isNaN(target) || target <= 0) return;

    addGoalJar({
      title: newTitle.trim(),
      targetAmount: target,
      currentAmount: 0,
      emoji: newCategory === "Tech" ? "📱" : newCategory === "Wealth" ? "🪙" : "🎯",
      category: newCategory,
      color: "#059669",
      deadline: newTimeline === "short-term" ? "2027-10-15" : "2028-12-31",
    });

    setNewTitle("");
    setNewTarget("");
    setShowAddModal(false);

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
    <div className="space-y-6 animate-fade-in">
      {/* FEATURE 2: ANTI-TEMPTATION & OUT-OF-SIGHT SAFE GROWTH VAULT BANNER */}
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
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all shrink-0 self-start md:self-auto active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Add Custom Goal</span>
        </button>
      </div>

      {/* FEATURE 1: AI MARKET & NEWS FORECAST CARDS (IPHONE, GOLD, HEADPHONES) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wide">
              AI Price-Trend &amp; Best Time to Buy Engine
            </h3>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            Live Market Cycles &amp; Historical News Analysis
          </span>
        </div>

        {/* 3 Live AI Market & News Forecast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: New iPhone (Price Dropping Soon) */}
          <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">New iPhone</h4>
                    <span className="text-[10px] font-mono text-slate-400">Target: ₹80,000</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                  Price Dropping Soon 📉
                </span>
              </div>

              {/* AI News & History Insight */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                <strong className="text-slate-900 block font-semibold mb-1">
                  AI News &amp; History Insight:
                </strong>
                &ldquo;New model launches in September &amp; Diwali festive sales historically drop prices by 12–18%. Best Time to Buy: October (Wait 6 weeks to save ~₹11,000).&rdquo;
              </div>

              {/* Safe Vault Matching Badge */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] font-mono">
                <div className="flex items-center justify-between text-blue-900 font-bold">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-blue-700" />
                    Safe Liquid FD Vault (~6.8%)
                  </span>
                  <span>Short-Term (&lt;1Y)</span>
                </div>
                <span className="text-[10px] text-blue-700 block mt-0.5">
                  Zero market risk • Hidden from daily UPI • Bonus interest
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Wait &amp; Save ~₹11k</span>
              <span className="text-emerald-700 font-bold">Best: October Diwali</span>
            </div>
          </div>

          {/* Card 2: 24K Gold / Jewellery (Price Rising) */}
          <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">24K Gold / Jewellery</h4>
                    <span className="text-[10px] font-mono text-slate-400">Target: ₹1,20,000</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                  Price Rising 📈
                </span>
              </div>

              {/* AI News & History Insight */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                <strong className="text-slate-900 block font-semibold mb-1">
                  AI News &amp; History Insight:
                </strong>
                &ldquo;Global central bank buying and wedding season demand point to a +6% upward trend. Best Time to Buy: Lock in prices gradually via monthly Digital Gold micro-buys rather than waiting.&rdquo;
              </div>

              {/* Safe Vault Matching Badge */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] font-mono">
                <div className="flex items-center justify-between text-amber-900 font-bold">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-700" />
                    Digital Gold + Index SIP (~11.5%)
                  </span>
                  <span>Long-Term (1–3Y)</span>
                </div>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  Beats inflation • Multiplies wealth compounding
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Lock In Gradually</span>
              <span className="text-amber-700 font-bold">Friday Micro-Buys</span>
            </div>
          </div>

          {/* Card 3: Noise-Cancelling Headphones (Holding Steady) */}
          <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Noise-Cancelling Headphones</h4>
                    <span className="text-[10px] font-mono text-slate-400">Target: ₹22,000</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  Holding Steady ➡️
                </span>
              </div>

              {/* AI News & History Insight */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                <strong className="text-slate-900 block font-semibold mb-1">
                  AI News &amp; History Insight:
                </strong>
                &ldquo;No major hardware refresh or import duty change expected. Buy anytime once your jar hits 100%.&rdquo;
              </div>

              {/* Safe Vault Matching Badge */}
              <div className="p-2.5 rounded-xl bg-violet-50/70 border border-violet-200 text-[11px] font-mono">
                <div className="flex items-center justify-between text-violet-900 font-bold">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-violet-700" />
                    High-Yield Liquid FD (~6.8%)
                  </span>
                  <span>Short-Term (&lt;1Y)</span>
                </div>
                <span className="text-[10px] text-violet-700 block mt-0.5">
                  Locked from UPI impulse • Earns interest bonus
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500">Stable Market</span>
              <span className="text-blue-700 font-bold">Buy Once 100% Funded</span>
            </div>
          </div>
        </div>
      </div>

      {/* UPI AUTOPAY E-MANDATE CARD */}
      <div className="fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  UPI AutoPay e-Mandate: {isMandateActive ? "ACTIVE" : "PAUSED"}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  NPCI Certified
                </span>
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
              {isMandateActive ? "Autopilot ON" : "Autopilot OFF"}
            </span>
            <button
              type="button"
              onClick={() => setIsMandateActive(!isMandateActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isMandateActive ? "bg-emerald-600" : "bg-slate-300"
              }`}
              role="switch"
              aria-checked={isMandateActive}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isMandateActive ? "translate-x-5" : "translate-x-0"
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
                Rule: <strong>70% Wealth / Gold Vault + 30% Safe FD Vault</strong>
              </span>
            </div>

            {/* Split Progress Meter */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: "70%" }}
                  title="70% Digital Gold & Index Fund Vault (~11.5% p.a.)"
                />
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: "30%" }}
                  title="30% Safe Liquid FD Vault (~6.8% p.a.)"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  70% Digital Gold &amp; Index Vault (~11.5% p.a.)
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  30% Safe FD Vault (~6.8% p.a.)
                </span>
              </div>
            </div>

            {/* Mandate Preset Caps */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">Monthly Mandate Cap:</span>
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
              disabled={!isMandateActive || isSweeping}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-98 min-h-[44px] ${
                !isMandateActive
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : riskScenario === "card-trap"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                {riskScenario === "card-trap"
                  ? "Trigger Friday Sweep (Override Risk)"
                  : "Trigger Friday Auto-Sweep Now"}
              </span>
            </button>
            <span className="text-[10px] text-center text-slate-500 font-mono">
              Demo button: Sweeps ₹3,000 into Out-of-Sight Vaults
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

      {/* GOAL JARS WITH OUT-OF-SIGHT VAULT BADGES & EXTRA MONEY EARNED COUNTER */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Active Goal Jars &amp; Safe Growth Vaults</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                  {profile.goals.length} Goals Active
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Locked away from UPI impulse spending • Earning yield while waiting for the best time to buy
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            <span>New Goal</span>
          </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {profile.goals.map((jar) => {
            const percent = Math.min(100, Math.round((jar.currentAmount / jar.targetAmount) * 100));
            const VaultIcon = getVaultIcon(jar.title, jar.category);
            const trendData = getGoalAiTrendData(jar.title, jar.category, jar.deadline);

            // Compute dynamic Extra Money Earned While Waiting
            const vaultInterestEarned = Math.max(450, Math.round(jar.currentAmount * 0.058));
            const smartSwapsSwept = Math.max(950, jar.totalSavedFromNudges);

            return (
              <div
                key={jar.id}
                className="fintech-card rounded-2xl p-5 flex flex-col justify-between group bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-3"
              >
                <div className="space-y-2.5">
                  {/* Top Bar with Icon, Title, and Trend Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-700 shadow-xs">
                        <VaultIcon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-900 tracking-tight truncate max-w-[125px]">
                          {jar.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-medium">
                          {jar.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGoalJar(jar.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price Trend Status Badge */}
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={`px-2 py-0.5 rounded-full border font-bold ${trendData.trendBadgeColor}`}>
                      {trendData.trendStatus}
                    </span>
                    <span className="text-slate-500 font-semibold truncate max-w-[120px]">
                      {trendData.bestTimeToBuy}
                    </span>
                  </div>

                  {/* Target & Current Balance */}
                  <div className="flex items-baseline justify-between mt-2 font-mono">
                    <span className="text-lg font-bold text-slate-900">{formatINR(jar.currentAmount)}</span>
                    <span className="text-[11px] text-slate-500">Target: {formatINR(jar.targetAmount)}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span className="font-semibold text-slate-700">{percent}% funded</span>
                    <span className="text-emerald-700 font-bold">{formatINR(jar.targetAmount - jar.currentAmount)} to go</span>
                  </div>

                  {/* Out-of-Sight Auto-Sweep Vault Badge */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] space-y-1">
                    <div className="flex items-center justify-between font-mono font-bold text-slate-800">
                      <span className="flex items-center gap-1 truncate">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span className="truncate">{trendData.vaultName.split("(")[0]}</span>
                      </span>
                      <span className="text-emerald-700 shrink-0">{trendData.vaultRate}</span>
                    </div>
                    <span className="text-slate-400 block font-mono text-[9px] truncate">
                      {trendData.vaultTag}
                    </span>
                  </div>

                  {/* LIVE "EXTRA MONEY EARNED WHILE WAITING" COUNTER */}
                  <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[10px] font-mono text-emerald-950">
                    <div className="flex items-center gap-1 font-bold text-emerald-900 mb-0.5">
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Extra Earned While Waiting:</span>
                    </div>
                    <span className="text-[9.5px] block font-semibold text-emerald-800">
                      +{formatINR(vaultInterestEarned)} safe vault yield + {formatINR(smartSwapsSwept)} from Smart Swaps
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setDepositModalGoal(jar)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Top-Up Vault</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 ULTRA-SHORT PLAIN-ENGLISH INVESTING CARDS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 uppercase tracking-wide">
            Plain-English Wealth Essentials (No Jargon)
          </span>
          <span className="text-slate-400 font-mono text-[11px]">10-Second Explainer</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Emergency FD */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                  FD
                </div>
                <h4 className="text-xs font-bold text-slate-900">Emergency Shield</h4>
              </div>
              <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                ~6.5% Guaranteed
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your financial helmet. Keeps 3 months of emergency survival money in RBI-insured bank deposits so you never sell investments in a panic.
            </p>
          </div>

          {/* Card 2: Nifty 50 Index Fund */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200">
                  50
                </div>
                <h4 className="text-xs font-bold text-slate-900">Nifty 50 Index Fund</h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ~12% Historical
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              The lazy wealth builder. Owns a slice of India&apos;s top 50 corporate giants (Tata, Reliance, HDFC) so your cash beats inflation without picking single stocks.
            </p>
          </div>

          {/* Card 3: UPI AutoPay SIP */}
          <div className="fintech-card rounded-2xl p-4.5 bg-white border border-slate-200 shadow-sm space-y-2 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center font-bold text-xs border border-violet-200">
                  SIP
                </div>
                <h4 className="text-xs font-bold text-slate-900">Wealth Autopilot</h4>
              </div>
              <span className="text-[10px] font-mono text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                Zero Discipline
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zero-discipline savings autopilot. Automatically sweeps idle Friday cash and UPI spare change into safe vaults without asking for a UPI PIN every month.
            </p>
          </div>
        </div>

        {/* PocketSense AI Money Coach - 5-Second Beginner Insights */}
        <AiMoneyCoachCard
          title="Ask AI About My Goals &amp; Money"
          subtitle="Zero finance jargon • 5-second answers • Uses your real ₹ numbers"
        />
      </div>

      {/* + ADD CUSTOM GOAL QUICK MODAL WITH AUTO AI FORECAST */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center items-end p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md p-6 shadow-2xl space-y-4 animate-slide-up-mobile sm:animate-fade-in">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Add Goal with AI Price Forecaster</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Type any item — AI generates a price trend forecast &amp; assigns an Out-of-Sight Safe Vault.
              </p>
            </div>

            <form onSubmit={handleCreateCustomGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook M3, Sony Camera, PlayStation 5, Bali Trip"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="50000"
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
                    <span>Vault: <strong>{getGoalAiTrendData(newTitle, newCategory).vaultName.split("(")[0]}</strong></span>
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

      {/* QUICK TOP-UP VAULT MODAL */}
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
