"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { RAW_SMS_SNIPPETS_DEMO } from "@/lib/demo/syntheticStudentData";
import { SmsParseResult, Transaction } from "@/types";
import { formatINR } from "@/lib/utils";
import { TransactionHistory } from "@/components/TransactionHistory";
import { SpendingTrendChart } from "@/components/SpendingTrendChart";
import {
  FileText,
  Sparkles,
  CheckCircle,
  CreditCard,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PassbookSpaceProps {
  onOpenSmsDrawer: () => void;
}

export const PassbookSpace: React.FC<PassbookSpaceProps> = ({
  onOpenSmsDrawer,
}) => {
  const { addBatchTransactions, demoMode } = useFinancialMemory();
  const [quickSmsText, setQuickSmsText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [parsedResults, setParsedResults] = useState<SmsParseResult[]>([]);
  const [isCommitted, setIsCommitted] = useState(false);
  const [showQuickParser, setShowQuickParser] = useState(false);

  const handleParseQuickSms = async (text: string) => {
    if (!text.trim()) return;
    setIsParsing(true);
    setParsedResults([]);
    setIsCommitted(false);

    try {
      const res = await fetch("/api/parse-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: [text], demoMode }),
      });

      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setParsedResults(data.results);
      }
    } catch (e) {
      console.error("Quick SMS parse failed", e);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCommit = () => {
    if (parsedResults.length === 0) return;

    const newTransactions: Transaction[] = parsedResults.map((r, idx) => ({
      id: "tx_quick_" + Date.now() + "_" + idx,
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
    setQuickSmsText("");

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Ingestion Bar */}
      <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Zero-Login SMS &amp; Statement Ingestion</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                AI Powered
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Paste raw bank UPI debits or import bank SMS statements with zero net-banking credentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowQuickParser(!showQuickParser)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
          >
            {showQuickParser ? "Hide Quick Parser" : "Quick Paste SMS"}
          </button>
          <button
            onClick={onOpenSmsDrawer}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open SMS Drawer</span>
          </button>
        </div>
      </div>

      {/* Inline Quick Parser Accordion */}
      {showQuickParser && (
        <div className="fintech-card rounded-2xl p-5 bg-slate-50/70 border border-slate-200 space-y-4 animate-fade-in">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paste Any Bank UPI SMS Snippet:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickSmsText}
                onChange={(e) => setQuickSmsText(e.target.value)}
                placeholder="e.g. Paid Rs. 420.00 to BLUE TOKAI via GPay on 17-Nov-2026. Ref: 6312458921"
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                disabled={isParsing || !quickSmsText.trim()}
                onClick={() => handleParseQuickSms(quickSmsText)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white transition-all shadow-sm flex items-center gap-1.5 shrink-0"
              >
                {isParsing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Extract</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sample Snippets */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block mb-1.5">
              Or Try A Sample UPI SMS:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {RAW_SMS_SNIPPETS_DEMO.slice(0, 3).map((snippet, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuickSmsText(snippet);
                    handleParseQuickSms(snippet);
                  }}
                  className="text-left text-[11px] font-mono p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {snippet.slice(0, 50)}...
                </button>
              ))}
            </div>
          </div>

          {/* Parsed Result Box */}
          {parsedResults.length > 0 && (
            <div className="p-4 rounded-xl bg-white border border-emerald-200 space-y-3">
              <span className="text-xs font-bold text-slate-900 block">Extracted Transaction:</span>
              {parsedResults.map((res, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-slate-900 block">{res.merchant}</span>
                    <span className="text-slate-500 text-[11px]">{res.category} • {res.spendingType}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{formatINR(res.amount)}</span>
                </div>
              ))}

              <button
                disabled={isCommitted}
                onClick={handleCommit}
                className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  isCommitted
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                {isCommitted ? "✓ Added to Passbook Ledger" : "Commit to Ledger"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Ledger & Spending Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <TransactionHistory />
        </div>
        <div className="lg:col-span-5">
          <SpendingTrendChart />
        </div>
      </div>
    </div>
  );
};
