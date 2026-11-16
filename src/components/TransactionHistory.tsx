"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { SpendingType, Transaction } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";
import {
  Search,
  Filter,
  Trash2,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Info,
} from "lucide-react";

export const TransactionHistory: React.FC = () => {
  const { transactions, deleteTransaction } = useFinancialMemory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.upiRef && tx.upiRef.includes(searchTerm));

    if (!matchesSearch) return false;
    if (selectedFilter === "ALL") return true;
    return tx.spendingType === selectedFilter;
  });

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const impulseSpent = transactions
    .filter((t) => t.spendingType === "Impulse Want")
    .reduce((sum, t) => sum + t.amount, 0);
  const needSpent = transactions
    .filter((t) => t.spendingType === "Survival Need")
    .reduce((sum, t) => sum + t.amount, 0);
  const leakSpent = transactions
    .filter((t) => t.spendingType === "Silent Subscription Leak")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="rounded-2xl bg-[#121215] border border-white/10 p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <span>UPI Spending Ledger</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
              {transactions.length} Recorded
            </span>
          </h3>
          <p className="text-xs text-zinc-400">
            Categorized via AI structured classification into Needs, Wants, and Silent Leaks.
          </p>
        </div>

        {/* Micro ratios */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="text-emerald-400">
            Needs: {formatINR(needSpent)}
          </div>
          <span className="text-zinc-600">•</span>
          <div className="text-amber-400">
            Wants: {formatINR(impulseSpent)}
          </div>
          <span className="text-zinc-600">•</span>
          <div className="text-rose-400">
            Leaks: {formatINR(leakSpent)}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search merchants (e.g. Zepto, Blue Tokai, Toit, Uber, Cult.fit)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-900 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "ALL", label: "All Spends" },
            { id: "Survival Need", label: "Needs Only" },
            { id: "Impulse Want", label: "Impulses" },
            { id: "Silent Subscription Leak", label: "Silent Leaks" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-all ${
                selectedFilter === tab.id
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-zinc-400 hover:text-zinc-200 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-xs text-zinc-400">
            No transactions matching &quot;{searchTerm}&quot;.
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              {/* Left: Info */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-zinc-300 font-mono text-xs">
                  {tx.spendingType === "Survival Need" && "🟢"}
                  {tx.spendingType === "Impulse Want" && "🟡"}
                  {tx.spendingType === "Silent Subscription Leak" && "🔴"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white">{tx.merchant}</h4>
                    {tx.triggerTag && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300">
                        #{tx.triggerTag}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                    <span>{formatDate(tx.date)}</span>
                    {tx.time && <span>{tx.time}</span>}
                    <span>•</span>
                    <span>{tx.category}</span>
                    {tx.upiRef && (
                      <>
                        <span>•</span>
                        <span className="text-zinc-500">Ref: {tx.upiRef}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Amount & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                <div className="text-right">
                  <div className="font-mono text-sm font-black text-white">
                    -{formatINR(tx.amount)}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      tx.spendingType === "Survival Need"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : tx.spendingType === "Silent Subscription Leak"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}
                  >
                    {tx.spendingType}
                  </span>
                </div>

                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 rounded transition-all"
                  title="Delete transaction"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

