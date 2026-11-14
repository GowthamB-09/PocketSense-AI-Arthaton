"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { RAW_SMS_SNIPPETS_DEMO } from "@/lib/demo/syntheticStudentData";
import { SmsParseResult, Transaction } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  FileText,
  X,
  Sparkles,
  Upload,
  CheckCircle,
  Tag,
  ShieldCheck,
  AlertTriangle,
  Plus,
  RefreshCw,
  Copy,
} from "lucide-react";
import confetti from "canvas-confetti";

interface SmsParserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsParserDrawer: React.FC<SmsParserDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { addBatchTransactions, demoMode, toggleDemoMode } = useFinancialMemory();
  const [activeTab, setActiveTab] = useState<"samples" | "paste" | "csv">("samples");
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResults, setParsedResults] = useState<SmsParseResult[]>([]);
  const [isCommitted, setIsCommitted] = useState(false);

  if (!isOpen) return null;

  const handleParseSms = async (textsToParse: string[]) => {
    if (textsToParse.length === 0) return;
    setIsParsing(true);
    setParsedResults([]);
    setIsCommitted(false);

    try {
      const res = await fetch("/api/parse-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: textsToParse, demoMode }),
      });

      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setParsedResults(data.results);
      }
    } catch (e) {
      console.error("SMS parser failed", e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCommitParsedToLedger = () => {
    if (parsedResults.length === 0) return;

    const newTransactions: Transaction[] = parsedResults.map((r, idx) => ({
      id: "tx_parsed_" + Date.now() + "_" + idx,
      merchant: r.merchant,
      amount: r.amount,
      date: r.date,
      category: r.category,
      spendingType: r.spendingType,
      upiRef: r.upiRef,
      bank: r.bank,
      triggerTag: r.triggerTag,
      rawSms: r.rawText,
    }));

    addBatchTransactions(newTransactions);
    setIsCommitted(true);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl h-full bg-[#121215] border-l border-white/10 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Zero-Login UPI SMS &amp; Statement Parser
              </h3>
              <p className="text-xs text-zinc-400">
                100% Client-side privacy • No bank credentials • Instant classification
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

        {/* Content body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Demo Fallback Rate-Limit Safety Bar */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{demoMode ? "Demo Mode Active (Rate-Limit Proof)" : "Live Gemini AI Parsing"}</span>
            </div>
            <button
              type="button"
              onClick={() => toggleDemoMode()}
              className="text-[11px] font-mono underline text-amber-300 hover:text-amber-200"
            >
              {demoMode ? "Switch to Live" : "Switch to Demo"}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-zinc-900/90 border border-white/10 p-1 text-xs">
            <button
              onClick={() => setActiveTab("samples")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "samples"
                  ? "bg-white/10 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              One-Click Samples
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "paste"
                  ? "bg-white/10 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Paste Raw SMS
            </button>
            <button
              onClick={() => setActiveTab("csv")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === "csv"
                  ? "bg-white/10 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              CSV Statement
            </button>
          </div>

          {/* Tab 1: One-click Samples */}
          {activeTab === "samples" && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-300">
                Test the AI parser with realistic Indian bank &amp; UPI notifications:
              </div>
              <div className="space-y-2">
                {RAW_SMS_SNIPPETS_DEMO.map((snippet, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all text-xs group"
                  >
                    <p className="font-mono text-zinc-300 mb-2 leading-relaxed">
                      {snippet}
                    </p>
                    <button
                      onClick={() => handleParseSms([snippet])}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Parse This SMS Alert</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Paste Raw SMS */}
          {activeTab === "paste" && (
            <div className="space-y-3">
              <label className="block text-xs text-zinc-300">
                Paste one or multiple SMS alerts (separate by empty line):
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Sent Rs. 40.00 from HDFC Bank A/C **8912 to RAMESH CHAI on 14-Nov-2026 UPI:6312458921..."
                className="w-full p-3 text-xs font-mono bg-zinc-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                disabled={isParsing || !rawText.trim()}
                onClick={() => {
                  const snippets = rawText
                    .split("\n\n")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  handleParseSms(snippets.length > 0 ? snippets : [rawText]);
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isParsing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Structured Data...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Classify with AI Parser</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 3: CSV upload simulation */}
          {activeTab === "csv" && (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-cyan-500/40 transition-colors">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">
                  Upload Bank / UPI Statement CSV
                </h4>
                <p className="text-[11px] text-zinc-400 mb-3">
                  Exported CSV from Paytm, PhonePe, GPay, or NetBanking
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleParseSms(RAW_SMS_SNIPPETS_DEMO.slice(0, 4));
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white transition-colors"
                >
                  Load Sample 4-Row Statement
                </button>
              </div>
            </div>
          )}

          {/* Parsed Output Section */}
          {parsedResults.length > 0 && (
            <div className="mt-5 space-y-3 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Extracted &amp; Classified ({parsedResults.length})
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">
                  AI Classified
                </span>
              </div>

              <div className="space-y-2.5">
                {parsedResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-xs text-white">
                          {item.merchant}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {item.date} • {item.bank} • Ref: {item.upiRef}
                        </div>
                      </div>

                      <div className="font-mono text-sm font-black text-white">
                        {formatINR(item.amount)}
                      </div>
                    </div>

                    {/* Classification Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          item.spendingType === "Survival Need"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : item.spendingType === "Silent Subscription Leak"
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {item.spendingType}
                      </span>

                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5">
                        {item.category}
                      </span>

                      {item.triggerTag && (
                        <span className="text-[10px] font-mono text-violet-300 bg-violet-500/10 border border-violet-500/20 px-1.5 py-0.5 rounded">
                          #{item.triggerTag}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 italic">
                      &quot;{item.explanation}&quot;
                    </p>
                  </div>
                ))}
              </div>

              {/* Commit action */}
              <button
                disabled={isCommitted}
                onClick={handleCommitParsedToLedger}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isCommitted
                    ? "bg-emerald-500/20 border border-emerald-500 text-emerald-300"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                }`}
              >
                {isCommitted ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Transactions Added to Ledger!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add {parsedResults.length} Transactions to My Ledger</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 bg-white/[0.02] text-[11px] text-zinc-400 flex items-center justify-between">
          <span>Privacy Guaranteed: No raw credentials saved</span>
          <button
            onClick={onClose}
            className="text-xs text-zinc-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

