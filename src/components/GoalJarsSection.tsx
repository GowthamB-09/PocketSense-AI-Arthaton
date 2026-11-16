"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { GoalJar } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

export const GoalJarsSection: React.FC = () => {
  const { profile, addGoalJar, deleteGoalJar, claimSavings } = useFinancialMemory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<GoalJar | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("1000");

  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newEmoji, setNewEmoji] = useState("🎯");
  const [newCategory, setNewCategory] = useState<GoalJar["category"]>("Travel");

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newTarget);
    if (!newTitle.trim() || isNaN(target) || target <= 0) return;

    addGoalJar({
      title: newTitle.trim(),
      targetAmount: target,
      currentAmount: 0,
      emoji: newEmoji || "🎯",
      category: newCategory,
      color: "#10B981",
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
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Wealth &amp; Milestone Jars</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-400">
              {profile.goals.length} Active
            </span>
          </h3>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>New Jar</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {profile.goals.map((jar) => {
          const percent = Math.min(100, Math.round((jar.currentAmount / jar.targetAmount) * 100));

          return (
            <div
              key={jar.id}
              className="rounded-xl bg-[#121215] border border-white/[0.08] p-4 flex flex-col justify-between group hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{jar.emoji}</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{jar.title}</h4>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">{jar.category}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoalJar(jar.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-rose-400 transition-opacity"
                    title="Delete jar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between mt-2 mb-1 font-mono">
                  <span className="text-base font-bold text-white">{formatINR(jar.currentAmount)}</span>
                  <span className="text-xs text-zinc-500">of {formatINR(jar.targetAmount)}</span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden my-2">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
                  <span>{percent}% funded</span>
                  {jar.totalSavedFromNudges > 0 && (
                    <span className="text-emerald-400">+{formatINR(jar.totalSavedFromNudges)} from nudges</span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5">
                <button
                  onClick={() => setDepositModalGoal(jar)}
                  className="w-full py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
                >
                  + Deposit Impulse Savings
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-white/10 rounded-xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1">Create Wealth Jar</h3>
            <p className="text-xs text-zinc-400 mb-3">Define a specific milestone for your savings.</p>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Jar Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Japan Trip, MacBook Pro, Emergency Buffer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-white/10 rounded-md text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Target (₹)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="100000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono bg-zinc-900 border border-white/10 rounded-md text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-300 mb-1">Emoji</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs text-center bg-zinc-900 border border-white/10 rounded-md text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-white/10 rounded-xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <span>{depositModalGoal.emoji}</span>
              <span>Deposit into {depositModalGoal.title}</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-3">Add redirected savings into this jar.</p>

            <form onSubmit={handleQuickDeposit} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="100"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm font-mono bg-zinc-900 border border-white/10 rounded-md text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2">
                {["500", "1500", "3000", "5000"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDepositAmount(preset)}
                    className="flex-1 py-1 text-xs font-mono rounded bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
                  >
                    +₹{preset}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-3 py-1 text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-md text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 flex items-center gap-1"
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
