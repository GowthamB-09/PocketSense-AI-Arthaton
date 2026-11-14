"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { GoalJar } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Plus,
  Target,
  Sparkles,
  Trophy,
  Trash2,
  Calendar,
  CheckCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

export const GoalJarsSection: React.FC = () => {
  const { profile, addGoalJar, deleteGoalJar, claimSavings } = useFinancialMemory();
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<GoalJar | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("200");

  // Form state for adding goal
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
      color: "#8B5CF6",
      deadline: "2026-12-31",
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
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Student Goal Jars</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                {profile.goals.length} Active
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Where intercepted impulse money grows into real student milestones.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>New Goal Jar</span>
        </button>
      </div>

      {/* Jars Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profile.goals.map((jar) => {
          const percent = Math.min(100, Math.round((jar.currentAmount / jar.targetAmount) * 100));
          const isComplete = percent >= 100;

          return (
            <div
              key={jar.id}
              className="relative overflow-hidden rounded-2xl bg-[#121215] border border-white/10 p-5 flex flex-col justify-between transition-all hover:border-white/20 group"
            >
              <div>
                {/* Top Row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10">
                      {jar.emoji}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {jar.title}
                      </h4>
                      <span className="text-[10px] font-mono uppercase text-zinc-400">
                        {jar.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteGoalJar(jar.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 rounded transition-all"
                    title="Delete goal jar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Amount details */}
                <div className="flex items-baseline justify-between mt-3 mb-1">
                  <div className="font-mono text-xl font-black text-white">
                    {formatINR(jar.currentAmount)}
                  </div>
                  <div className="font-mono text-xs text-zinc-400">
                    of {formatINR(jar.targetAmount)}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 rounded-full bg-zinc-800/80 overflow-hidden relative my-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isComplete
                        ? "bg-emerald-400 shadow-[0_0_12px_#10b981]"
                        : "bg-gradient-to-r from-emerald-500 to-cyan-400"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400">
                  <span className={isComplete ? "text-emerald-400 font-bold" : ""}>
                    {percent}% Funded
                  </span>
                  {jar.totalSavedFromNudges > 0 && (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      +{formatINR(jar.totalSavedFromNudges)} from nudges
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => setDepositModalGoal(jar)}
                  className="w-full py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Deposit Impulse Savings</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#121215] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Create New Goal Jar</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Give your saved impulse pocket money a clear purpose.
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa Trip, Concert Ticket, PS5 Controller"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="4500"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-center bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Travel">Travel &amp; Trips</option>
                  <option value="Tech">Tech &amp; Gadgets</option>
                  <option value="Lifestyle">Lifestyle &amp; Fashion</option>
                  <option value="Course">Certifications &amp; Courses</option>
                  <option value="Emergency">Emergency Buffer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400"
                >
                  Create Goal Jar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Deposit Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#121215] border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <span>{depositModalGoal.emoji}</span>
              <span>Deposit into {depositModalGoal.title}</span>
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Add savings you saved from skipping a craving or impulse spend.
            </p>

            <form onSubmit={handleQuickDeposit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Deposit Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 text-base font-mono bg-zinc-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quick chips */}
              <div className="flex gap-2">
                {["50", "150", "280", "450"].map((preset) => (
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

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-500 text-black hover:bg-emerald-400 flex items-center gap-1.5"
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

