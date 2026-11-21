"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { Transaction } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Search,
  Trash2,
  UtensilsCrossed,
  ShoppingBag,
  Car,
  CreditCard,
  Building2,
  Activity,
  TrendingUp,
  Receipt,
} from "lucide-react";

export const TransactionHistory: React.FC = () => {
  const { transactions, deleteTransaction } = useFinancialMemory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"ALL" | "UPI" | "CARDS">("ALL");

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

  // Helper to extract clean Account (HDFC / SBI / ICICI)
  const getAccountLabel = (tx: Transaction): string => {
    const text = `${tx.bank || ""} ${tx.rawSms || ""}`.toLowerCase();
    if (text.includes("icici")) return "ICICI";
    if (text.includes("sbi")) return "SBI";
    if (text.includes("hdfc")) return "HDFC";
    if (text.includes("axis")) return "Axis";
    return "HDFC";
  };

  // Helper to detect Card vs UPI
  const isCardTx = (tx: Transaction): boolean => {
    const text = `${tx.bank || ""} ${tx.rawSms || ""} ${tx.category || ""}`.toLowerCase();
    return text.includes("card");
  };

  const filteredTransactions = transactions.filter((tx) => {
    const account = getAccountLabel(tx);
    const matchesSearch =
      tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedFilter === "ALL") return true;
    if (selectedFilter === "CARDS") return isCardTx(tx);
    if (selectedFilter === "UPI") return !isCardTx(tx) || Boolean(tx.upiRef);
    return true;
  });

  return (
    <div className="fintech-card rounded-2xl p-5 sm:p-6 space-y-4 bg-white border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Spend History</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {filteredTransactions.length} Spends
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Every UPI, bank, and card spend tracked in one place.
            </p>
          </div>
        </div>

        {/* Filter Pills (All / UPI / Cards) */}
        <div className="flex rounded-xl bg-slate-100 border border-slate-200 p-1 text-xs font-semibold self-start sm:self-auto">
          {[
            { id: "ALL" as const, label: "All" },
            { id: "UPI" as const, label: "UPI" },
            { id: "CARDS" as const, label: "Cards" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedFilter === tab.id
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by merchant, category, or account (HDFC, SBI, ICICI)..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Clean Scannable Transaction List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
            No expenses found matching your filter.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const CatIcon = getCategoryIcon(tx.category);
            const account = getAccountLabel(tx);
            const isCard = isCardTx(tx);

            return (
              <div
                key={tx.id}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-between gap-3 group"
              >
                {/* Left: Icon + Merchant Name + Clean Subtitle (Account • Date • Category) */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                      isCard
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}
                  >
                    <CatIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 truncate">
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight truncate">
                      {tx.merchant}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="text-slate-500 truncate">{tx.category}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Delete */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-mono text-xs sm:text-sm font-bold text-slate-900">
                      -₹{tx.amount.toLocaleString("en-IN")}
                    </div>
                    <span
                      className={`text-[9px] font-mono font-semibold px-2 py-0.2 rounded-full border ${
                        isCard
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {account} {isCard ? "Card" : "UPI"}
                    </span>
                  </div>

                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded transition-all"
                    title="Delete"
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
