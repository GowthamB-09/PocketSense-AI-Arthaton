"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { GoalJar } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Sparkles,
  Plane,
  Laptop,
  ShieldCheck,
  Target,
  ArrowUpRight,
  Vault,
} from "lucide-react";
import confetti from "canvas-confetti";

export const GoalJarsSection: React.FC = () => {
  const { profile, addGoalJar, deleteGoalJar, claimSavings } = useFinancialMemory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<GoalJar | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("2000");

  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newCategory, setNewCategory] = useState<GoalJar["category"]>("Travel");

  const getVaultIcon = (title: string, category: string) => {
    const t = title.toLowerCase();
    if (t.includes("trip") || t.includes("japan") || category === "Travel") return Plane;
    if (t.includes("macbook") || t.includes("tech") || category === "Tech") return Laptop;
    if (t.includes("emergency") || t.includes("buffer") || category === "Emergency") return ShieldCheck;
    return Target;
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (!newTitle.trim() || isNaN(target) || target <= 0) return;

    addGoalJar({
      title: newTitle.trim(),
      targetAmount: target,
      currentAmount: 0,
      emoji: "🎯",
      category: newCategory,
      color: "#059669",
      deadline: "2027-12-31",
    });

    setNewTitle("");
    setNewTarget("");
    setShowAddModal(false);
  };

  const handleQuickDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    claimSavings(depositModalGoal.id, amt, `Manual top-up to ${depositModalGoal.title}`);
    setDepositModalGoal(null);

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#059669", "#0284C7", "#D97706"],
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
            <Vault className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Savings Goals</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                {profile.goals.length} Goals
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Track your goals and fund them by skipping impulse expenses
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-600" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profile.goals.map((jar) => {
          const percent = Math.min(100, Math.round((jar.currentAmount / jar.targetAmount) * 100));
          const VaultIcon = getVaultIcon(jar.title, jar.category);

          return (
            <div
              key={jar.id}
              className="fintech-card rounded-2xl p-5 flex flex-col justify-between group bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-emerald-700 shadow-sm">
                      <VaultIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 tracking-tight">{jar.title}</h4>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-medium">
                        {jar.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoalJar(jar.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                    title="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between mt-3 mb-1.5 font-mono">
                  <span className="text-lg font-bold text-slate-900">{formatINR(jar.currentAmount)}</span>
                  <span className="text-xs text-slate-500">Target: {formatINR(jar.targetAmount)}</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden my-2">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-slate-500">
                  <span className="font-semibold text-slate-700">{percent}% funded</span>
                  {jar.totalSavedFromNudges > 0 && (
                    <span className="text-emerald-700 font-semibold">+{formatINR(jar.totalSavedFromNudges)} saved</span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setDepositModalGoal(jar)}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Add Money</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Create a Savings Goal</h3>
              <p className="text-xs text-slate-500 mt-0.5">Set a milestone to save towards.</p>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Goal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Japan Trip, MacBook, Emergency Fund"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="50000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                  >
                    <option value="Travel">Travel</option>
                    <option value="Tech">Tech</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Wealth">Wealth</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Vault className="w-4 h-4 text-emerald-600" />
                <span>Add Money to {depositModalGoal.title}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Deposit saved money into this goal.</p>
            </div>

            <form onSubmit={handleQuickDeposit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {["1000", "2500", "5000", "10000"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDepositAmount(preset)}
                    className="py-1 text-xs font-mono font-medium rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                  >
                    +₹{preset}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Confirm Deposit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
