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
  CheckCircle,
  Plus,
  RefreshCw,
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
  const { addBatchTransactions, demoMode } = useFinancialMemory();
  const [activeTab, setActiveTab] = useState<"samples" | "paste">("samples");
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
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg h-full bg-[#121215] border-l border-white/[0.08] shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              UPI &amp; Card Statement Parser
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex rounded-lg bg-zinc-900 border border-white/10 p-0.5 text-xs">
            <button
              onClick={() => setActiveTab("samples")}
              className={`flex-1 py-1 rounded-md font-medium transition-all ${
                activeTab === "samples"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-1 rounded-md font-medium transition-all ${
                activeTab === "paste"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Paste Alert
            </button>
          </div>

          {activeTab === "samples" && (
            <div className="space-y-2">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">
                Click to test instant structured parsing:
              </span>
              {RAW_SMS_SNIPPETS_DEMO.map((snippet, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all text-xs flex flex-col gap-1.5"
                >
                  <p className="font-mono text-zinc-300 text-[11px] leading-relaxed">
                    {snippet}
                  </p>
                  <button
                    onClick={() => handleParseSms([snippet])}
                    className="self-start text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Parse This Alert</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "paste" && (
            <div className="space-y-3">
              <textarea
                rows={5}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste your bank or credit card SMS alert here..."
                className="w-full p-3 text-xs font-mono bg-zinc-900 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                disabled={isParsing || !rawText.trim()}
                onClick={() => handleParseSms([rawText])}
                className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isParsing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Classify with AI</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Parsed Output */}
          {parsedResults.length > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-white/10">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>Extracted Record ({parsedResults.length})</span>
                <span className="text-emerald-400">Classified</span>
              </div>

              {parsedResults.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white">{item.merchant}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {item.date} • {item.bank} • Ref: {item.upiRef}
                      </div>
                    </div>
                    <div className="font-mono text-sm font-bold text-white">
                      {formatINR(item.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span
                      className={`px-1.5 py-0.2 rounded border ${
                        item.spendingType === "Survival Need"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : item.spendingType === "Silent Subscription Leak"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      }`}
                    >
                      {item.spendingType}
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/5 text-zinc-400">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}

              <button
                disabled={isCommitted}
                onClick={handleCommitParsedToLedger}
                className={`w-full py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  isCommitted
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500"
                    : "bg-emerald-500 text-black hover:bg-emerald-400"
                }`}
              >
                {isCommitted ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Added to Ledger!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Ledger</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.08] bg-white/[0.02] text-[11px] text-zinc-500 flex items-center justify-between font-mono">
          <span>Zero cloud credential storage</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
