"use client";

import React, { useEffect, useRef, useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
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
} from "lucide-react";
import confetti from "canvas-confetti";

interface BeforeIScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BeforeIScanModal: React.FC<BeforeIScanModalProps> = ({
  isOpen,
  onClose,
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
  } | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const promptSuggestions = [
    "Should I spend ₹3,500 on dinner & craft beer with colleagues tonight?",
    "Can I buy the ₹14,990 noise-cancelling headphones on sale?",
    "Is ₹420 Blue Tokai specialty coffee every weekday hurting my wealth?",
    "Buying a ₹2,990 Zara linen shirt on impulse?",
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setSavedSuccess(false);
    } else {
      setStreamedText("");
      setVerdictData(null);
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

  const handleSubmit = async (textToSubmit?: string) => {
    const query = (textToSubmit || prompt).trim();
    if (!query || isLoading) return;

    setIsLoading(true);
    setStreamedText("");
    setVerdictData(null);
    setSavedSuccess(false);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: query,
          memoryProfile: profile,
          dailySafe: analysis.dailySafeToSpend,
          daysLeft: analysis.daysRemaining,
          stream: true,
          demoMode,
        }),
      });

      if (!response.ok) throw new Error("Coach API error");

      const verdict = (response.headers.get("x-pocketsense-verdict") || "CAUTION") as any;
      const amount = parseFloat(response.headers.get("x-pocketsense-amount") || "0");
      const merchant = response.headers.get("x-pocketsense-merchant") || "This purchase";
      const source = response.headers.get("x-pocketsense-source") || "AI Engine";

      setVerdictData({ verdict, amount, merchant, source });

      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let accumulated = "";

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("0:")) {
                try {
                  const textChunk = JSON.parse(line.slice(2));
                  accumulated += textChunk;
                  setStreamedText(accumulated);
                } catch {
                  accumulated += line.slice(2);
                  setStreamedText(accumulated);
                }
              } else if (line.trim() && !line.startsWith("d:") && !line.startsWith("e:")) {
                accumulated += line;
                setStreamedText(accumulated);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Coach fetch error:", err);
      setStreamedText(
        "Safeguard Guideline: If this spend exceeds ₹1,500 and is unbudgeted discretionary consumption, enforce a 24-hour cooling window before scanning."
      );
      setVerdictData({
        verdict: "CAUTION",
        amount: 1500,
        merchant: "Unbudgeted Purchase",
        source: "Fallback Safeguard",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAndSave = () => {
    if (!verdictData || verdictData.amount <= 0) return;
    const targetJar = profile.goals[0] || { id: "goal_japan_trip", title: "Japan Trip" };

    claimSavings(
      targetJar.id,
      verdictData.amount,
      `Skipped ${verdictData.merchant} (${formatINR(verdictData.amount)})`
    );

    setSavedSuccess(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#059669", "#0284C7", "#D97706"],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center items-end p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full sm:max-w-xl bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-slide-up-mobile sm:animate-fade-in">
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Zap className="w-4 h-4 fill-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Pre-Transaction Interceptor</h3>
              <p className="text-[11px] text-slate-500">Ask before scanning UPI to protect your payday runway</p>
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

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Status strip */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
            <span>Safe: <strong className="text-emerald-700">{formatINR(analysis.dailySafeToSpend)}/day</strong></span>
            <span>Runway: {analysis.daysRemaining}d</span>
            <span className="hidden sm:inline">Target Vault: <strong className="text-slate-900">{profile.goals[0]?.title}</strong></span>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="relative"
          >
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Can I spend ₹3,500 on dinner tonight?"
              className="w-full pl-4 pr-24 py-3 sm:py-2.5 text-base sm:text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[46px]"
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

          {/* Preset Prompts (Thumb-scrollable horizontally on mobile, 2-col on desktop) */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
              Or tap a common impulse spend:
            </span>
            <div className="flex sm:grid sm:grid-cols-2 gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
              {promptSuggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(item);
                    handleSubmit(item);
                  }}
                  className="shrink-0 sm:shrink text-left p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs text-slate-600 leading-snug w-64 sm:w-auto active:scale-98"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Verdict Box */}
          {verdictData && (
            <div
              className={`p-4 rounded-xl border transition-all ${
                verdictData.verdict === "APPROVED"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                  : verdictData.verdict === "DENIED"
                  ? "bg-rose-50 border-rose-200 text-rose-950"
                  : "bg-amber-50 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {verdictData.verdict === "APPROVED" && (
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  )}
                  {verdictData.verdict === "CAUTION" && (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                  {verdictData.verdict === "DENIED" && (
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                  )}
                  <span className="font-bold text-sm">
                    {verdictData.verdict === "APPROVED"
                      ? "Safe to Spend"
                      : verdictData.verdict === "CAUTION"
                      ? "High Runway Impact"
                      : "Runway Crash Warning"}
                  </span>
                </div>

                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/70 font-semibold border border-current/20">
                  {verdictData.source}
                </span>
              </div>

              {verdictData.amount > 0 && (
                <div className="text-xs font-mono mb-2 text-slate-700">
                  Evaluated Amount: <strong>{formatINR(verdictData.amount)}</strong> at{" "}
                  <strong>{verdictData.merchant}</strong>
                </div>
              )}

              {/* Streamed or static response */}
              <div className="text-xs space-y-2 leading-relaxed whitespace-pre-wrap font-sans text-slate-800">
                {streamedText || "Analyzing financial runway impact..."}
              </div>

              {/* Action buttons */}
              {verdictData.amount > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2">
                  {savedSuccess ? (
                    <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Saved {formatINR(verdictData.amount)} to {profile.goals[0]?.title}!</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleSkipAndSave}
                      className="w-full py-3 sm:py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-98 min-h-[44px]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Skip &amp; Save {formatINR(verdictData.amount)} to {profile.goals[0]?.title}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50/70 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>Non-judgmental money guard</span>
          <span className="hidden sm:inline">Press Esc to close</span>
        </div>
      </div>
    </div>
  );
};