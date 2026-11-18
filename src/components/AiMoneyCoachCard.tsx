"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { formatINR } from "@/lib/utils";
import {
  PRESET_COACH_QUESTIONS,
  CoachAnswer,
  generateBeginnerCoachAdvice,
  translateFinanceJargon,
} from "@/lib/ai/coachResponses";
import {
  Sparkles,
  HelpCircle,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";

interface AiMoneyCoachCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export const AiMoneyCoachCard: React.FC<AiMoneyCoachCardProps> = ({
  title = "PocketSense AI Money Coach",
  subtitle = "Zero finance jargon • 5-second answers • Uses your real ₹ numbers",
  className = "",
  compact = false,
}) => {
  const { profile, analysis } = useFinancialMemory();
  
  // Active answer state (default to the first preset question: "Can I afford a ₹3,000 dinner?")
  const [activeAnswer, setActiveAnswer] = useState<CoachAnswer | null>(PRESET_COACH_QUESTIONS[0]);
  const [customQuery, setCustomQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showSimpler, setShowSimpler] = useState(false);

  const safePool = analysis.remainingMonthlyPool > 0 ? analysis.remainingMonthlyPool : 30592;
  const daysLeft = analysis.daysRemaining || 17;
  const primaryGoal = profile.goals && profile.goals.length > 0
    ? profile.goals[0]
    : { title: "New iPhone", currentAmount: 42000, targetAmount: 80000 };

  const handleSelectPreset = (preset: CoachAnswer) => {
    setActiveAnswer(preset);
    setShowSimpler(false);
  };

  const handleAskCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    setIsThinking(true);
    setTimeout(() => {
      const generated = generateBeginnerCoachAdvice(customQuery, {
        salary: profile.monthlySalary || 75000,
        safePool,
        daysLeft,
        cardDues: 17908,
        primaryGoalTitle: primaryGoal.title,
        primaryGoalSaved: primaryGoal.currentAmount,
        primaryGoalTarget: primaryGoal.targetAmount,
      });

      setActiveAnswer(generated);
      setIsThinking(false);
      setShowSimpler(false);
      setCustomQuery("");
    }, 280);
  };

  // Helper to highlight ₹ amounts in text
  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(₹[\d,]+(?:\.\d+)?|\b\d+%\b)/g);
    return parts.map((part, index) => {
      if (part.startsWith("₹") || part.endsWith("%")) {
        return (
          <strong key={index} className="text-slate-900 font-bold font-mono">
            {part}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`fintech-card rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-emerald-50/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Friend-Texting Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2 self-start sm:self-auto">
            <span>Pool: <strong className="text-emerald-700">{formatINR(safePool)}</strong></span>
            <span>•</span>
            <span>{daysLeft}d to Payday</span>
          </div>
        </div>

        {/* 1-Tap Preset Question Chips */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Tap any question for an instant 5-second answer:</span>
            <span className="text-[10px] text-emerald-700 font-semibold hidden sm:inline">Zero Finance Jargon</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {PRESET_COACH_QUESTIONS.map((item) => {
              const isSelected = activeAnswer?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPreset(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left flex items-center gap-1.5 active:scale-98 ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-xs font-semibold ring-1 ring-black/10"
                      : "bg-slate-50 hover:bg-emerald-50/60 text-slate-700 border border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  <span>{item.question}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Question Input */}
        <form onSubmit={handleAskCustom} className="mt-3 relative flex items-center">
          <input
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Ask Money Coach anything (e.g. Can I afford ₹4,500 sneakers?)..."
            className="w-full px-4 py-2.5 pr-24 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={isThinking || !customQuery.trim()}
            className="absolute right-1 top-1 bottom-1 px-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
          >
            {isThinking ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="text-[11px]">Thinking...</span>
              </>
            ) : (
              <>
                <span className="text-[11px]">Ask</span>
                <Send className="w-3 h-3" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Scannable AI Answer Card */}
      {activeAnswer && (
        <div className="p-4 sm:p-5 space-y-3.5 animate-fade-in bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Question: &ldquo;{activeAnswer.question}&rdquo;</span>
            </div>

            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                activeAnswer.directAnswer.startsWith("Yes")
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : activeAnswer.directAnswer.startsWith("Wait")
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {activeAnswer.directAnswer.startsWith("Yes")
                ? "Safe to Do"
                : activeAnswer.directAnswer.startsWith("Wait")
                ? "Smart Swap Advised"
                : "Hold Off"}
            </span>
          </div>

          {/* 1. 1-Line Direct Answer (Bold) */}
          <div
            className={`p-3.5 rounded-xl border text-sm font-bold flex items-start gap-2.5 ${
              activeAnswer.directAnswer.startsWith("Yes")
                ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                : activeAnswer.directAnswer.startsWith("Wait")
                ? "bg-amber-50/80 border-amber-200 text-amber-950"
                : "bg-rose-50/80 border-rose-200 text-rose-950"
            }`}
          >
            {activeAnswer.directAnswer.startsWith("Yes") ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : activeAnswer.directAnswer.startsWith("Wait") ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{activeAnswer.directAnswer}</span>
          </div>

          {/* 2. 2–3 Ultra-Short Bullet Points (Max 12 words each, simple metaphors) */}
          <div className="space-y-2 py-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Why (In Plain English):
            </span>
            <ul className="space-y-1.5">
              {activeAnswer.bulletPoints.map((bullet, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>{renderHighlightedText(bullet)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. 1 Concrete Next Step (with ₹ numbers) & Callout Pill */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3 text-emerald-600" />
                <span>Concrete Action (Your Real ₹ Numbers):</span>
              </span>

              {/* Green / Amber Action Callout Pill */}
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border self-start sm:self-auto shadow-2xs ${
                  activeAnswer.actionTone === "green"
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : activeAnswer.actionTone === "amber"
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : activeAnswer.actionTone === "rose"
                    ? "bg-rose-100 text-rose-900 border-rose-300"
                    : "bg-blue-100 text-blue-900 border-blue-300"
                }`}
              >
                {activeAnswer.actionPill}
              </span>
            </div>

            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              {renderHighlightedText(activeAnswer.concreteAction)}
            </p>
          </div>

          {/* "Explain Even Simpler (1 Sentence)" Quick-Toggle Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowSimpler(!showSimpler)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors focus:outline-none"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>
                {showSimpler ? "Hide Ultra-Simple Explanation" : "Explain Even Simpler (1 Sentence)"}
              </span>
              {showSimpler ? (
                <ChevronUp className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              )}
            </button>

            {/* Revealed 1-Sentence Friendly Bubble */}
            {showSimpler && (
              <div className="mt-2 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-sans leading-relaxed animate-fade-in flex items-start gap-2 shadow-2xs">
                <span className="font-bold shrink-0">💡 Super Simple:</span>
                <span>{renderHighlightedText(activeAnswer.simplerOneLiner)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

