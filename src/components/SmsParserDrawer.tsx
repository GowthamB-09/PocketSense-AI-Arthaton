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
  Zap,
  Smartphone,
  Radio,
  UploadCloud,
  Bell,
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
  const [activeTab, setActiveTab] = useState<"auto-sync" | "statement" | "paste">("auto-sync");
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResults, setParsedResults] = useState<SmsParseResult[]>([]);
  const [isCommitted, setIsCommitted] = useState(false);
  const [incomingAlert, setIncomingAlert] = useState<string | null>(null);

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

  const handleSimulateIncomingAlert = () => {
    const merchants = [
      { name: "Swiggy Gourmet Bowl", amount: 480, tag: "weekend-hangout", cat: "Dining & Social", type: "Impulse Want" as const },
      { name: "Blue Tokai Coffee", amount: 380, tag: "specialty-coffee", cat: "Dining & Social", type: "Impulse Want" as const },
      { name: "Zepto 10-Min Munchies", amount: 520, tag: "quick-commerce", cat: "Quick Commerce & Groceries", type: "Impulse Want" as const },
    ];
    const pick = merchants[Math.floor(Math.random() * merchants.length)];
    const tx: Transaction = {
      id: "tx_sim_" + Date.now(),
      merchant: pick.name,
      amount: pick.amount,
      date: new Date().toISOString().split("T")[0],
      category: pick.cat as any,
      spendingType: pick.type,
      upiRef: "UPI" + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: "Google Pay / HDFC Bank",
      triggerTag: pick.tag,
      rawSms: `Auto-captured debit: Paid Rs. ${pick.amount} to ${pick.name}`,
    };

    addBatchTransactions([tx]);
    setIncomingAlert(`Auto-captured debit: ${formatINR(pick.amount)} to ${pick.name}. Zero manual typing!`);
    confetti({ particleCount: 25, spread: 40, origin: { y: 0.2 } });
    setTimeout(() => setIncomingAlert(null), 4000);
  };

  const handleCommitParsedToLedger = () => {
    if (parsedResults.length === 0) return;

    // Filter out pure salary credits from expense ledger
    const expenseRecords = parsedResults.filter((r) => !r.isSalaryCredit && !/salary/i.test(r.rawText));

    const newTransactions: Transaction[] = expenseRecords.map((r, idx) => ({
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
      colors: ["#059669", "#0284C7", "#D97706"],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-end items-end bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-lg h-[92vh] sm:h-full bg-white border-t sm:border-t-0 sm:border-l border-slate-200 rounded-t-3xl sm:rounded-none shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-up-mobile sm:animate-fade-in">
        {/* Mobile Drag Indicator Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Auto-Track Spends
              </h3>
              <p className="text-xs text-slate-500">Zero daily manual logging • Device sync &amp; monthly statements</p>
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

        {/* Live alert toast */}
        {incomingAlert && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{incomingAlert}</span>
          </div>
        )}

        {/* Content body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex rounded-xl bg-slate-100 border border-slate-200 p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("auto-sync")}
              className={`flex-1 py-2 sm:py-1.5 rounded-lg transition-all min-h-[38px] ${
                activeTab === "auto-sync"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              1-Tap Auto-Sync
            </button>
            <button
              onClick={() => setActiveTab("statement")}
              className={`flex-1 py-2 sm:py-1.5 rounded-lg transition-all min-h-[38px] ${
                activeTab === "statement"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Monthly e-Statement
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-2 sm:py-1.5 rounded-lg transition-all min-h-[38px] ${
                activeTab === "paste"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Advanced Fallback
            </button>
          </div>

          {/* TAB 1: 1-Tap Auto-Sync */}
          {activeTab === "auto-sync" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                    Background Notification Listener
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                    ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  PocketSense monitors incoming UPI debits from Google Pay, PhonePe, and Cred silently in background. You never have to copy-paste SMS.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleSimulateIncomingAlert}
                    className="flex-1 py-2.5 sm:py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 transition-colors flex items-center justify-center gap-1.5 min-h-[44px] active:scale-98"
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-500" />
                    <span>Test Incoming Alert</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleParseSms(RAW_SMS_SNIPPETS_DEMO)}
                    className="flex-1 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-colors min-h-[44px] active:scale-98"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>1-Tap Sync Spends</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Recent Device Alerts Ready to Ingest:
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {RAW_SMS_SNIPPETS_DEMO.slice(0, 5).map((snippet, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-1.5"
                    >
                      <p className="font-mono text-slate-700 text-[11px] leading-relaxed">
                        {snippet}
                      </p>
                      <button
                        onClick={() => handleParseSms([snippet])}
                        className="self-start text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 min-h-[36px]"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Classify Alert</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Monthly Statement */}
          {activeTab === "statement" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-xs text-slate-900">Once-A-Month Statement Drop</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Drop your HDFC, ICICI, SBI or Axis e-statement (PDF or CSV) on payday. PocketSense configures your whole monthly budget in one shot with zero daily logging.
                </p>
                <button
                  type="button"
                  onClick={() => handleParseSms(RAW_SMS_SNIPPETS_DEMO)}
                  className="w-full py-3 sm:py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[44px] active:scale-98"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Load Sample Monthly Statement</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Advanced Paste Fallback */}
          {activeTab === "paste" && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500">
                Optional fallback for custom text testing or non-Android devices:
              </p>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste raw SMS text here..."
                className="w-full p-3.5 text-base sm:text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
              />
              <button
                disabled={isParsing || !rawText.trim()}
                onClick={() => handleParseSms([rawText])}
                className="w-full py-3 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold disabled:opacity-40 flex items-center justify-center gap-2 shadow-sm transition-all min-h-[44px] active:scale-98"
              >
                {isParsing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Parse Text</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Parsed Output */}
          {parsedResults.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs font-mono text-slate-600">
                <span>Extracted Records ({parsedResults.length})</span>
                <span className="text-emerald-700 font-semibold">Categorized</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {parsedResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{item.merchant}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.date} • {item.bank}
                        </div>
                      </div>
                      <div className="font-mono text-sm font-black text-slate-900">
                        {formatINR(item.amount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full border font-semibold ${
                          item.spendingType === "Survival Need"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : item.spendingType === "Silent Subscription Leak"
                            ? "bg-rose-50 border-rose-200 text-rose-800"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                        }`}
                      >
                        {item.spendingType}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                disabled={isCommitted}
                onClick={handleCommitParsedToLedger}
                className={`w-full py-3 sm:py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-98 ${
                  isCommitted
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                }`}
              >
                {isCommitted ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-700" />
                    <span>Added to Spending Ledger</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Save {parsedResults.length} Records to Ledger</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Client-side non-custodial</span>
          </span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 transition-colors p-1">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
