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
  ArrowRight,
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
      setTimeout(() => inputRef.current?.focus(), 50);
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

      setVerdictData({
        verdict,
        amount,
        merchant,
        source,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

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
      colors: ["#10B981", "#3B82F6", "#F59E0B"],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl fintech-card rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Pre-Transaction Interceptor</h3>
              <p className="text-[11px] text-slate-400">Evaluate impulse purchases against your real-time discretionary runway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Status strip */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
            <span>Safe Pacing: <strong className="text-emerald-400">{formatINR(analysis.dailySafeToSpend)}/day</strong></span>
            <span>Runway: {analysis.daysRemaining}d</span>
            <span>Target Vault: <strong className="text-slate-200">{profile.goals[0]?.title}</strong></span>
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
              placeholder="e.g. Should I spend ₹3,500 on dinner tonight?"
              className="w-full pl-4 pr-24 py-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all"
            >
              {isLoading ? (
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Evaluate</span>
                  <CornerDownLeft className="w-3 h-3" />
                </>
              )}
            </button>
          </form>

          {/* Prompt chips */}
          <div className="flex flex-wrap gap-1.5">
            {promptSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setPrompt(suggestion);
                  handleSubmit(suggestion);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Verdict Banner */}
          {verdictData && (
            <div
              className={`rounded-xl border p-4 space-y-3 ${
                verdictData.verdict === "DENIED"
                  ? "bg-rose-950/20 border-rose-500/40 text-rose-300"
                  : verdictData.verdict === "CAUTION"
                  ? "bg-amber-950/20 border-amber-500/40 text-amber-300"
                  : "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  {verdictData.verdict === "DENIED" && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                  {verdictData.verdict === "CAUTION" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {verdictData.verdict === "APPROVED" && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                  <span>VERDICT: {verdictData.verdict}</span>
                </div>
                {verdictData.amount > 0 && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white">
                    {formatINR(verdictData.amount)}
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed bg-slate-950/70 p-3.5 rounded-lg border border-slate-800/80">
                {streamedText || "Calculating opportunity cost & behavioral impact..."}
              </div>

              {verdictData.amount > 0 && verdictData.verdict !== "APPROVED" && (
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800/60">
                  <span className="text-[11px] text-slate-400">
                    Reallocate to {profile.goals[0]?.title || "Reserve"}
                  </span>
                  <button
                    disabled={savedSuccess}
                    onClick={handleSkipAndSave}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      savedSuccess
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500"
                        : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                    }`}
                  >
                    {savedSuccess ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Transferred to Reserve (+1 Streak)
                      </span>
                    ) : (
                      <span>Divert &amp; Save {formatINR(verdictData.amount)}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
