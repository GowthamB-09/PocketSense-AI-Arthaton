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
  Zap,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Lock,
  RefreshCw,
  Sliders,
  DollarSign,
  Landmark,
  ChevronRight,
  HelpCircle,
  TrendingDown,
} from "lucide-react";
import confetti from "canvas-confetti";

export const GoalJarsSection: React.FC = () => {
  const { profile, addGoalJar, deleteGoalJar, claimSavings } = useFinancialMemory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<GoalJar | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("2000");

  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newCategory, setNewCategory] = useState<GoalJar["category"]>("Travel");

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

  // AI Goal Strategy & Price Trend Advisor Insights
  const getGoalAiAdvisorInsight = (title: string, category: string) => {
    const t = title.toLowerCase();
    if (t.includes("iphone") || t.includes("apple") || t.includes("phone")) {
      return {
        badge: "Tech Inflation: ~7% Annually",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        insight:
          "Price Trend: Flagship phone prices rise ~7% annually. Parking cash in a 3% bank account loses value. Recommended: Auto-sweep into a High-Yield FD / Arbitrage Fund (~7%) + target October festive sale discounts.",
        recommendation: "Target October Festive Sale (~₹12k discount)",
      };
    }
    if (t.includes("gold") || t.includes("wealth") || category === "Wealth") {
      return {
        badge: "Inflation Hedge: ~11–12% Long-Term",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        insight:
          "Price Trend: Gold & Indian equities beat inflation long-term (~11–12%). Recommended: Split Friday UPI AutoPay sweeps 70% into a Nifty 50 Index Fund SIP and 30% into Sovereign/Digital Gold.",
        recommendation: "Split Friday AutoPay: 70% Index SIP / 30% Gold",
      };
    }
    if (t.includes("emergency") || t.includes("shield") || category === "Emergency") {
      return {
        badge: "Safety Rule: 0% Equity Volatility",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        insight:
          "Safety Rule: Never put emergency cash in volatile stocks. Recommended: Keep 100% in an instant-withdrawal Bank FD (~6.5%).",
        recommendation: "100% Instant-Withdrawal Bank FD (~6.5%)",
      };
    }
    return {
      badge: "Goal Pacing: On Track",
      badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
      insight:
        "AutoPay sweeps and intercepted impulse round-ups will compound towards this milestone every Friday without manual intervention.",
      recommendation: "Continue Friday UPI AutoPay Sweeps",
    };
  };

  const getVaultIcon = (title: string, category: string) => {
    const t = title.toLowerCase();
    if (t.includes("iphone") || t.includes("phone")) return Smartphone;
    if (t.includes("gold") || t.includes("coin")) return Coins;
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

    // 70% into Wealth / Gold Goal + 30% into Emergency Shield
    const sipAmount = Math.round(totalSweep * 0.70); // ₹2,100 (70%)
    const goldAmount = totalSweep - sipAmount; // ₹900 (30%)

    // Find target goals
    const wealthGoal = profile.goals.find((g) => g.title.toLowerCase().includes("gold") || g.category === "Wealth") || profile.goals[1];
    const emergencyGoal = profile.goals.find((g) => g.title.toLowerCase().includes("emergency") || g.category === "Emergency") || profile.goals[2];

    if (wealthGoal) {
      claimSavings(wealthGoal.id, sipAmount, `Friday AutoPay Sweep (70% Nifty 50 + Gold)`);
    }
    if (emergencyGoal) {
      claimSavings(emergencyGoal.id, goldAmount, `Friday AutoPay Sweep (30% Emergency Shield FD)`);
    }

    const refNo = "NPCI-AUTOPAY-" + Math.floor(10000000 + Math.random() * 90000000);
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

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (!newTitle.trim() || isNaN(target) || target <= 0) return;

    addGoalJar({
      title: newTitle.trim(),
      targetAmount: target,
      currentAmount: 0,
      emoji: "🎯",
      category: newCategory,
      color: "#059669",
      deadline: "2027-12-31",
    });

    setNewTitle("");
    setNewTarget("");
    setShowAddModal(false);
  };

  const handleQuickDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    claimSavings(depositModalGoal.id, amt, `Manual top-up to ${depositModalGoal.title}`);
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
      {/* FEATURE 1: UPI AUTOPAY E-MANDATE CARD */}
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
                Zero-click monthly investing. Automatically sweeps weekly unspent buffers + UPI spare change every Friday without asking for a UPI PIN.
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
                Rule: <strong>70% Nifty 50 &amp; Gold / 30% Emergency Shield</strong>
              </span>
            </div>

            {/* Split Progress Meter */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: "70%" }}
                  title="70% Nifty 50 Index Fund & 24K Gold (~11-12% p.a.)"
                />
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: "30%" }}
                  title="30% Emergency Shield FD (~6.5% guaranteed)"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-amber-800 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  70% Nifty 50 &amp; 24K Gold (~11–12% p.a.)
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  30% Emergency Shield (~6.5% p.a.)
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
              Demo button: Sweeps ₹3,000 (₹2,100 Wealth + ₹900 Shield)
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
                    Swept <strong>{formatINR(sweepFeedback.total)}</strong> without asking for a UPI PIN:{" "}
                    <strong className="text-amber-700">{formatINR(sweepFeedback.sipAmount)}</strong> into 24K Gold &amp; Wealth +{" "}
                    <strong className="text-emerald-700">{formatINR(sweepFeedback.goldAmount)}</strong> into Emergency Shield.
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

      {/* FEATURE 2: AI GOAL STRATEGY & PRICE TREND ADVISOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 uppercase tracking-wide">
              AI Goal Strategy &amp; Price Trend Advisor
            </h3>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">Real-World Inflation &amp; Product Trends</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: New iPhone (₹80,000) */}
          <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-xs">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">New iPhone</h4>
                    <span className="text-[10px] font-mono text-slate-500">Target: ₹80,000</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  Tech Inflation ~7%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-700 leading-relaxed font-sans">
                <strong className="text-blue-900 block font-semibold mb-1">AI Price Trend Insight:</strong>
                Price Trend: Flagship phone prices rise ~7% annually. Parking cash in a 3% bank account loses value. Recommended: Auto-sweep into a High-Yield FD / Arbitrage Fund (~7%) + target October festive sale discounts.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Saved: ₹36,000 (45%)</span>
              <span className="text-blue-700 font-semibold">Festive Sale Target</span>
            </div>
          </div>

          {/* Card 2: 24K Digital Gold & Wealth (₹1,50,000) */}
          <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-xs">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">24K Digital Gold &amp; Wealth</h4>
                    <span className="text-[10px] font-mono text-slate-500">Target: ₹1,50,000</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                  Inflation Hedge ~12%
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-xs text-slate-700 leading-relaxed font-sans">
                <strong className="text-amber-900 block font-semibold mb-1">AI Price Trend Insight:</strong>
                Price Trend: Gold &amp; Indian equities beat inflation long-term (~11–12%). Recommended: Split Friday UPI AutoPay sweeps 70% into a Nifty 50 Index Fund SIP and 30% into Sovereign/Digital Gold.
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Saved: ₹68,000 (45%)</span>
              <span className="text-amber-700 font-semibold">70/30 AutoPay Split</span>
            </div>
          </div>

          {/* Card 3: 3-Month Emergency Shield (₹90,000) */}
          <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between hover:border-slate-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">3-Month Emergency Shield</h4>
                    <span className="text-[10px] font-mono text-slate-500">Target: ₹90,000</span>
                  </div>
                </div>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Zero Stock Volatility
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700 leading-relaxed font-sans">
                <strong className="text-emerald-900 block font-semibold mb-1">AI Safety Rule Insight:</strong>
                Safety Rule: Never put emergency cash in volatile stocks. Recommended: Keep 100% in an instant-withdrawal Bank FD (~6.5%).
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Saved: ₹55,000 (61%)</span>
              <span className="text-emerald-700 font-semibold">Instant Bank FD</span>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 3: 3 ULTRA-SHORT PLAIN-ENGLISH INVESTING CARDS */}
      <div className="space-y-3">
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
              Zero-discipline compounding. Automatically sweeps idle Friday cash and UPI spare change into index funds without asking for a UPI PIN every month.
            </p>
          </div>
        </div>

        {/* 1-Tap "Ask AI About My Goals" Bar with Preset Questions */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>1-Tap &quot;Ask AI About My Goals&quot; (Preset Questions):</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {[
              {
                q: "Why shouldn't I keep iPhone savings in a normal bank account?",
                a: "Normal savings accounts pay ~2.5–3%, which lags 7% annual tech price inflation. High-yield liquid FDs or arbitrage funds earn ~7% without stock market risk, preserving your purchasing power.",
              },
              {
                q: "How does 70% Nifty 50 + 30% Gold beat inflation?",
                a: "Indian equities (Nifty 50) have historically delivered ~12% long-term CAGR, while 24K Gold hedges against currency devaluation (~10–11%). Combined, they easily beat India's ~5–6% CPI inflation.",
              },
              {
                q: "Why must Emergency cash be in a 6.5% FD instead of mutual funds?",
                a: "Emergencies don't wait for market crashes to recover. Bank FDs backed by DICGC insurance offer instant 24/7 liquidity with 0% capital volatility, so you never sell equity at a bottom.",
              },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  setActiveAdvisorAnswer(
                    activeAdvisorAnswer?.question === item.q ? null : { question: item.q, answer: item.a }
                  )
                }
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeAdvisorAnswer?.question === item.q
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {item.q}
              </button>
            ))}
          </div>

          {activeAdvisorAnswer && (
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 mt-2 animate-fade-in leading-relaxed">
              <strong className="text-slate-900 block mb-1">Q: {activeAdvisorAnswer.question}</strong>
              {activeAdvisorAnswer.answer}
            </div>
          )}
        </div>
      </div>

      {/* SAVINGS GOALS GRID */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Active Goal Jars</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                  {profile.goals.length} Goals Active
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Funded automatically via Friday AutoPay sweeps and intercepted impulse buys.
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
            const aiInsight = getGoalAiAdvisorInsight(jar.title, jar.category);

            return (
              <div
                key={jar.id}
                className="fintech-card rounded-2xl p-5 flex flex-col justify-between group bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-700 shadow-xs">
                        <VaultIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 tracking-tight truncate max-w-[130px]">
                          {jar.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-medium">
                          {jar.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGoalJar(jar.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between mt-3 mb-1.5 font-mono">
                    <span className="text-lg font-bold text-slate-900">{formatINR(jar.currentAmount)}</span>
                    <span className="text-[11px] text-slate-500">Target: {formatINR(jar.targetAmount)}</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden my-2">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                    <span className="font-semibold text-slate-700">{percent}% funded</span>
                    {jar.totalSavedFromNudges > 0 && (
                      <span className="text-emerald-700 font-semibold">+{formatINR(jar.totalSavedFromNudges)} swept</span>
                    )}
                  </div>

                  {/* AI Strategy Mini-Tag */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded border block truncate font-medium ${aiInsight.badgeColor}`}>
                      {aiInsight.recommendation}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setDepositModalGoal(jar)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Quick Top-Up</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center items-end p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm p-6 shadow-2xl space-y-4 animate-slide-up-mobile sm:animate-fade-in">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Create a Savings Goal</h3>
              <p className="text-xs text-slate-500 mt-0.5">Set a milestone to save towards.</p>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New iPhone, 24K Gold, Emergency Shield"
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
                    placeholder="80000"
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
                    <option value="Tech">Tech (iPhone/Laptop)</option>
                    <option value="Wealth">Wealth (24K Gold/SIP)</option>
                    <option value="Emergency">Emergency (FD Shield)</option>
                    <option value="Travel">Travel</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>

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
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center items-end p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-sm p-6 shadow-2xl space-y-4 animate-slide-up-mobile sm:animate-fade-in">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto -mt-2 mb-2 sm:hidden" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Top-Up {depositModalGoal.title}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Deposit saved money into this goal.</p>
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
                  <span>Confirm Deposit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
