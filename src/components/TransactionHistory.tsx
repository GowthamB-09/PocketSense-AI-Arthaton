"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { SpendingType, Transaction } from "@/types";
import { formatINR, formatDate } from "@/lib/utils";
import {
  Search,
  Trash2,
  CheckCircle2,
  Compass,
  Clock,
  UtensilsCrossed,
  ShoppingBag,
  Car,
  CreditCard,
  Building2,
  Activity,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";

export const TransactionHistory: React.FC = () => {
  const { transactions, deleteTransaction } = useFinancialMemory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Dining & Social":
        return UtensilsCrossed;
      case "Quick Commerce & Groceries":
      case "Shopping & Gear":
        return ShoppingBag;
      case "Commute & Rides":
        return Car;
      case "Subscriptions & Cloud":
        return CreditCard;
      case "Rent & Fixed Utilities":
        return Building2;
      case "Health & Wellness":
        return Activity;
      case "Investments & SIPs":
        return TrendingUp;
      default:
        return Receipt;
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.upiRef && tx.upiRef.includes(searchTerm));

    if (!matchesSearch) return false;
    if (selectedFilter === "ALL") return true;
    return tx.spendingType === selectedFilter;
  });

  const needSpent = transactions
    .filter((t) => t.spendingType === "Survival Need")
    .reduce((sum, t) => sum + t.amount, 0);
  const impulseSpent = transactions
    .filter((t) => t.spendingType === "Impulse Want")
    .reduce((sum, t) => sum + t.amount, 0);
  const leakSpent = transactions
    .filter((t) => t.spendingType === "Silent Subscription Leak")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="fintech-card rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
              <span>Payment &amp; Spending Ledger</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                {transactions.length} Records
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Institutional breakdown classified into Essential, Discretionary, and Subscriptions
            </p>
          </div>
        </div>

        {/* Micro totals */}
        <div className="flex items-center gap-3 text-xs font-mono bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Essential:</span>
            <span className="text-emerald-400 font-bold">{formatINR(needSpent)}</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">Discretionary:</span>
            <span className="text-amber-400 font-bold">{formatINR(impulseSpent)}</span>
          </div>
          <span className="text-slate-700">•</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-400">Subscriptions:</span>
            <span className="text-rose-400 font-bold">{formatINR(leakSpent)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by merchant, category, or UPI reference (e.g. Zepto, Blue Tokai, Toit)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "ALL", label: "All Spends" },
            { id: "Survival Need", label: "Essential Needs" },
            { id: "Impulse Want", label: "Discretionary Impulses" },
            { id: "Silent Subscription Leak", label: "Subscriptions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold transition-all ${
                selectedFilter === tab.id
                  ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 border border-transparent hover:bg-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-xs text-slate-400">
            No transaction records matching &quot;{searchTerm}&quot;.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const CatIcon = getCategoryIcon(tx.category);

            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Merchant & Categorization */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-slate-300">
                    <CatIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white tracking-tight">{tx.merchant}</h4>
                      {tx.triggerTag && (
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                          #{tx.triggerTag}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>{formatDate(tx.date)}</span>
                      {tx.time && <span>{tx.time}</span>}
                      <span>•</span>
                      <span>{tx.category}</span>
                      {tx.upiRef && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500">Ref: {tx.upiRef}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Classification */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="font-mono text-sm font-black text-white">
                      -{formatINR(tx.amount)}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        tx.spendingType === "Survival Need"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : tx.spendingType === "Silent Subscription Leak"
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}
                    >
                      {tx.spendingType === "Survival Need" && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {tx.spendingType === "Impulse Want" && <Compass className="w-2.5 h-2.5" />}
                      {tx.spendingType === "Silent Subscription Leak" && <Clock className="w-2.5 h-2.5" />}
                      <span>{tx.spendingType}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 rounded transition-all"
                    title="Remove transaction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
