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
  ArrowRight,
  Brain,
  Lightbulb,
  CheckCircle2,
  Flame,
  Send,
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
  const { profile, analysis, claimSavings, getAiPromptContext, demoMode, toggleDemoMode } = useFinancialMemory();
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

  // Suggested prompt chips
  const promptSuggestions = [
    "Should I spend ₹650 on dinner with friends tonight?",
    "Can I order ₹280 midnight Biryani on Swiggy?",
    "Chai tapri with friends ₹40 — harmless or trap?",
    "Buying ₹2,100 sneakers on flash sale?",
  ];

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSavedSuccess(false);
    } else {
      setStreamedText("");
      setVerdictData(null);
    }
  }, [isOpen]);

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
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

      if (!response.ok) {
        throw new Error("Coach API response error");
      }

      // Read headers for metadata
      const verdict = (response.headers.get("x-pocketsense-verdict") || "CAUTION") as any;
      const amount = parseFloat(response.headers.get("x-pocketsense-amount") || "0");
      const merchant = response.headers.get("x-pocketsense-merchant") || "This purchase";
      const source = response.headers.get("x-pocketsense-source") || "AI Engine";

      setVerdictData({
        verdict,
        amount,
        merchant,
        source,
      });

      // Stream text from body
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          // Parse lines (AI SDK format '0:"text"\n')
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
    } catch (err) {
      console.error("Coach fetch error:", err);
      setStreamedText(
        "Bhai, network glitch ho gaya! But as your senior: if it's over ₹200 and unbudgeted, skip it for tonight and drink water!"
      );
      setVerdictData({
        verdict: "CAUTION",
        amount: 250,
        merchant: "Unbudgeted Spend",
        source: "Fallback Safeguard",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipAndSave = () => {
    if (!verdictData || verdictData.amount <= 0) return;
    const targetJar = profile.goals[0] || { id: "goal_goa_trip", title: "Goa Trip" };

    claimSavings(
      targetJar.id,
      verdictData.amount,
      `Skipped ${verdictData.merchant} (${formatINR(verdictData.amount)})`
    );

    setSavedSuccess(true);
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#10B981", "#8B5CF6", "#06B6D4", "#F59E0B"],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#121215] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>&quot;Before-I-Scan&quot; Impulse Interceptor</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                  Senior Bhai Coach
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Intercept impulse UPI scans before your wallet hits the Day 18 cliff.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Active Memory Context Pill */}
          <div className="flex flex-wrap items-center gap-2 text-xs bg-white/[0.02] border border-white/5 rounded-xl p-3 text-zinc-300">
            <Brain className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="font-semibold text-white">Active Financial Memory:</span>
            <span className="font-mono text-emerald-400">
              {formatINR(analysis.dailySafeToSpend)}/day safe
            </span>
            <span className="text-zinc-600">•</span>
            <span className="font-mono text-zinc-300">
              {analysis.daysRemaining} days left
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-violet-300">
              Goal: {profile.goals[0]?.title || "Goa Trip"} ({formatINR(profile.goals[0]?.currentAmount || 0)})
            </span>
          </div>

          {/* Demo Fallback Rate-Limit Safety Bar */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-amber-200 text-[11px] sm:text-xs">
                {demoMode
                  ? "Demo Mode Active: Pre-computed responses guarantee zero API rate-limit stalls."
                  : "Live Gemini 2.5 Flash API active."}
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleDemoMode()}
              className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors ml-2 shrink-0"
            >
              {demoMode ? "Switch to Live AI" : "Switch to Demo"}
            </button>
          </div>

          {/* Input Section */}
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
              placeholder="e.g., Should I spend ₹650 on dinner with friends tonight?"
              className="w-full pl-4 pr-24 py-3.5 text-sm bg-zinc-900/90 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="absolute right-2 top-2 bottom-2 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1.5"
            >
              {isLoading ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Ask Senior</span>
                  <CornerDownLeft className="w-3 h-3" />
                </>
              )}
            </button>
          </form>

          {/* Quick Prompt Chips */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-zinc-400">
              Frequent Indian Student Dilemmas:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {promptSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setPrompt(suggestion);
                    handleSubmit(suggestion);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-zinc-300 hover:text-white transition-all text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Verdict Banner (if available) */}
          {verdictData && (
            <div
              className={`rounded-xl border p-4 transition-all ${
                verdictData.verdict === "DENIED"
                  ? "bg-rose-950/20 border-rose-500/40 text-rose-300"
                  : verdictData.verdict === "CAUTION"
                  ? "bg-amber-950/20 border-amber-500/40 text-amber-300"
                  : "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  {verdictData.verdict === "DENIED" && <ShieldAlert className="w-5 h-5 text-rose-400" />}
                  {verdictData.verdict === "CAUTION" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                  {verdictData.verdict === "APPROVED" && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
                  <span className="font-bold text-sm">
                    VERDICT: {verdictData.verdict}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 border border-white/10 text-zinc-300">
                    {verdictData.source.includes("demo") ? "🛡️ Pre-Computed" : "⚡ Gemini AI"}
                  </span>
                  {verdictData.amount > 0 && (
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white font-bold">
                      {formatINR(verdictData.amount)} Check
                    </span>
                  )}
                </div>
              </div>

              {/* Streaming Senior Response */}
              <div className="text-xs sm:text-sm text-zinc-200 whitespace-pre-line leading-relaxed mt-2 bg-black/40 p-3.5 rounded-lg border border-white/5 font-sans">
                {streamedText || "Consulting your financial memory..."}
              </div>

              {/* Action Buttons: Skip & Save */}
              {verdictData.amount > 0 && verdictData.verdict !== "APPROVED" && (
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-zinc-400">
                    Divert this impulse into{" "}
                    <strong className="text-white">
                      {profile.goals[0]?.title || "Goa Trip"}
                    </strong>
                  </div>

                  <button
                    disabled={savedSuccess}
                    onClick={handleSkipAndSave}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      savedSuccess
                        ? "bg-emerald-500/20 border border-emerald-500 text-emerald-300"
                        : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    }`}
                  >
                    {savedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Saved {formatINR(verdictData.amount)} to Goal! (+1 Streak)</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Skip &amp; Save {formatINR(verdictData.amount)}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Memory Engine: LocalStorage + Semantic Tag Indexing</span>
          </div>
          <span className="font-mono">Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};

