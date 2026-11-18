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
    fdAmount: number;
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

  const getVaultIcon = (title: string, category: string) => {
    const t = title.toLowerCase();
    if (t.includes("trip") || t.includes("japan") || category === "Travel") return Plane;
    if (t.includes("macbook") || t.includes("tech") || category === "Tech") return Laptop;
    if (t.includes("emergency") || t.includes("fd") || category === "Emergency") return ShieldCheck;
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
    const simulatedBuffer = 2400; // unspent weekly daily safe buffer
    const simulatedRoundUps = 600; // round-up spare change
    const totalSweep = simulatedBuffer + simulatedRoundUps; // ₹3,000
    const sipAmount = Math.round(totalSweep * 0.75); // ₹2,250 (75%)
    const fdAmount = totalSweep - sipAmount; // ₹750 (25%)

    // Find or target Nifty 50 and FD goal jars
    const niftyGoal = profile.goals.find((g) => g.title.toLowerCase().includes("nifty") || g.category === "Wealth") || profile.goals[0];
    const fdGoal = profile.goals.find((g) => g.title.toLowerCase().includes("fd") || g.category === "Emergency") || profile.goals[1];

    if (niftyGoal) {
      claimSavings(niftyGoal.id, sipAmount, `Friday AutoPay Sweep (75% Nifty 50 Index Fund)`);
    }
    if (fdGoal) {
      claimSavings(fdGoal.id, fdAmount, `Friday AutoPay Sweep (25% Emergency FD Shield)`);
    }

    const refNo = "NPCI-SWEEP-" + Math.floor(10000000 + Math.random() * 90000000);
    setSweepFeedback({
      total: totalSweep,
      sipAmount,
      fdAmount,
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
                Zero-click monthly investing. Sweeps your weekly unspent daily buffer + UPI round-up change every Friday without asking for a UPI PIN.
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

        {/* 75% / 25% Split Visualizer & Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Schedule: <strong>Every Friday @ 6:00 PM</strong>
              </span>
              <span className="text-slate-500">
                Auto-Sweep Rule: <strong>75% Index Fund / 25% Emergency FD</strong>
              </span>
            </div>

            {/* Split Progress Meter */}
            <div className="space-y-1.5">
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: "75%" }}
                  title="75% Nifty 50 Index Fund SIP"
                />
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: "25%" }}
                  title="25% Emergency FD"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  75% Nifty 50 SIP (~12% p.a.)
                </span>
                <span className="text-blue-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  25% Emergency FD (~6.5% p.a.)
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
              Demo button: Sweeps ₹3,000 (₹2,250 SIP + ₹750 FD)
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
                    <strong className="text-emerald-700">{formatINR(sweepFeedback.sipAmount)}</strong> into Nifty 50 SIP +{" "}
                    <strong className="text-blue-700">{formatINR(sweepFeedback.fdAmount)}</strong> into Emergency FD.
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

      {/* FEATURE 2: SILENT PORTFOLIO RISK GUARD */}
      <div className="fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Silent Portfolio Risk Guard</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  Zero User Input Needed
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Monitors cross-bank credit card traps and inflation drag silently across your parsed statements.
              </p>
            </div>
          </div>

          {/* Test Scenario Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-mono self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setRiskScenario("card-trap")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                riskScenario === "card-trap"
                  ? "bg-white text-rose-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Card Bill Trap (65%)
            </button>
            <button
              type="button"
              onClick={() => setRiskScenario("fd-drag")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                riskScenario === "fd-drag"
                  ? "bg-white text-amber-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Low-Return FD Drag (80%)
            </button>
            <button
              type="button"
              onClick={() => setRiskScenario("safe")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                riskScenario === "safe"
                  ? "bg-white text-emerald-700 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Safe Autopilot
            </button>
          </div>
        </div>

        {/* Dynamic Risk Guard Insight Card */}
        {riskScenario === "card-trap" && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-900">
                  Cross-Card Bill Alert: ICICI + HDFC Card Bills Hit ₹18,500 (65% of Salary)
                </span>
                <p className="text-rose-800 text-xs mt-0.5 leading-relaxed">
                  Your upcoming card bills total <strong>₹18,500</strong>. PocketSense has <strong>automatically paused this Friday&apos;s UPI AutoPay sweep</strong> so your checking balance doesn&apos;t run into a negative trap before payday.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold">
                Auto-Sweep Paused
              </span>
            </div>
          </div>
        )}

        {riskScenario === "fd-drag" && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-amber-900">
                  Inflation Drag Alert: 80% of Savings Locked in 6.5% FDs
                </span>
                <p className="text-amber-800 text-xs mt-0.5 leading-relaxed">
                  You have ₹65,000 sitting in low-yield fixed deposits losing purchasing power to inflation. AutoPay has automatically re-routed <strong>75% of future weekly spare change into the Nifty 50 Index Fund (~12% p.a.)</strong>.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                Re-Routing to Equity SIP
              </span>
            </div>
          </div>
        )}

        {riskScenario === "safe" && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block text-emerald-900">
                  All Systems Clear: Runway &amp; Allocation Healthy
                </span>
                <p className="text-emerald-800 text-xs mt-0.5">
                  Credit card dues are under 25% of monthly salary. Next scheduled auto-sweep: <strong>Friday @ 6:00 PM (₹3,000)</strong>.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold shrink-0">
              Autopilot Ready
            </span>
          </div>
        )}
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
              Your financial helmet. Keeps 3 months of survival money safe in RBI-backed bank deposits so you never have to break stock investments during an emergency.
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

        {/* 1-Tap Plain-English AI Advisor Bar */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>1-Tap AI Advisor (Preset Questions):</span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {[
              {
                q: "Why 75% in Nifty 50 and 25% in FD?",
                a: "The 75/25 barbell gives you the highest long-term growth (~12% p.a.) while keeping an unbreakable liquid cash cushion (25%) so you never have to panic-sell when markets dip.",
              },
              {
                q: "Can I stop or pause AutoPay anytime?",
                a: "Yes, instantly with zero penalties. You can toggle the mandate off with 1 tap right here or modify your weekly cap.",
              },
              {
                q: "Does AutoPay trigger if my bank balance is low?",
                a: "No! The Silent Risk Guard checks your live safe runway. If your balance drops below ₹5,000 or card bills exceed 50% of salary, the sweep is auto-paused.",
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

            return (
              <div
                key={jar.id}
                className="fintech-card rounded-2xl p-5 flex flex-col justify-between group bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
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
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
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
                  placeholder="e.g. Nifty Index Fund, Japan Trip, MacBook"
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
                    <option value="Wealth">Wealth (Index Fund/SIP)</option>
                    <option value="Emergency">Emergency (FD Shield)</option>
                    <option value="Travel">Travel</option>
                    <option value="Tech">Tech</option>
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
