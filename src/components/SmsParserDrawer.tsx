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
  ShieldCheck,
  CreditCard,
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
      colors: ["#10B981", "#3B82F6", "#F59E0B"],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg h-full bg-[#0E131F] border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Payment Alert &amp; Statement Ingestion
              </h3>
              <p className="text-xs text-slate-400">Structured AI classification for bank &amp; UPI notifications</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex rounded-xl bg-slate-950 border border-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("samples")}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === "samples"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Preset Notifications
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activeTab === "paste"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Paste Raw SMS / Alert
            </button>
          </div>

          {activeTab === "samples" && (
            <div className="space-y-2.5">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                Click to test automated classification:
              </span>
              {RAW_SMS_SNIPPETS_DEMO.map((snippet, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all text-xs flex flex-col gap-2"
                >
                  <p className="font-mono text-slate-300 text-[11px] leading-relaxed">
                    {snippet}
                  </p>
                  <button
                    onClick={() => handleParseSms([snippet])}
                    className="self-start text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Classify &amp; Ingest Record</span>
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
                placeholder="Paste your HDFC, ICICI, SBI, Axis or Credit Card SMS alert here..."
                className="w-full p-3.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                disabled={isParsing || !rawText.trim()}
                onClick={() => handleParseSms([rawText])}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.25)] transition-all"
              >
                {isParsing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Extracting Structured Fields...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parse with Financial AI</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Parsed Output */}
          {parsedResults.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Extracted Records ({parsedResults.length})</span>
                <span className="text-emerald-400 font-semibold">Structured &amp; Verified</span>
              </div>

              {parsedResults.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">{item.merchant}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {item.date} • {item.bank} • Ref: {item.upiRef}
                      </div>
                    </div>
                    <div className="font-mono text-sm font-black text-white">
                      {formatINR(item.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span
                      className={`px-2 py-0.5 rounded-full border font-semibold ${
                        item.spendingType === "Survival Need"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : item.spendingType === "Silent Subscription Leak"
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                      }`}
                    >
                      {item.spendingType}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))}

              <button
                disabled={isCommitted}
                onClick={handleCommitParsedToLedger}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isCommitted
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500"
                    : "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                }`}
              >
                {isCommitted ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Added to Spending Ledger</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Commit to Ledger</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Client-side non-custodial extraction</span>
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
