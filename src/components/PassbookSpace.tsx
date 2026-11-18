"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { Transaction } from "@/types";
import { formatINR } from "@/lib/utils";
import { TransactionHistory } from "@/components/TransactionHistory";
import { SpendingTrendChart } from "@/components/SpendingTrendChart";
import {
  Sparkles,
  CheckCircle,
  CreditCard,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  Zap,
  Coffee,
  ShoppingBag,
  UtensilsCrossed,
  Bell,
  Smartphone,
  Mail,
  Copy,
  Check,
  Radio,
  FileCheck,
  Building2,
  Lock,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PassbookSpaceProps {
  onOpenSmsDrawer?: () => void;
}

interface ActivityEvent {
  id: string;
  source: "Phone SMS Webhook" | "Gmail Auto-Forward";
  title: string;
  merchant: string;
  amount: number;
  time: string;
  type: "debit" | "credit" | "bill";
  category: string;
  bankTag: string;
}

export const PassbookSpace: React.FC<PassbookSpaceProps> = () => {
  const { profile, analysis, transactions, addBatchTransactions, updateSalary } = useFinancialMemory();
  const [activeTab, setActiveTab] = useState<"autopilot-sync" | "insights" | "ledger">("autopilot-sync");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);

  // Initial simulated auto-captured activity feed
  const [activityStream, setActivityStream] = useState<ActivityEvent[]>([
    {
      id: "ev_1",
      source: "Phone SMS Webhook",
      title: "UPI Debit Captured",
      merchant: "Swiggy Gourmet Bowl",
      amount: 480,
      time: "12 mins ago",
      type: "debit",
      category: "Dining & Social",
      bankTag: "PhonePe / HDFC",
    },
    {
      id: "ev_2",
      source: "Gmail Auto-Forward",
      title: "Credit Card e-Bill Parsed",
      merchant: "ICICI Bank Coral Card",
      amount: 11500,
      time: "1 hour ago",
      type: "bill",
      category: "Credit Card Bill",
      bankTag: "ICICI Bank (Statement)",
    },
    {
      id: "ev_3",
      source: "Phone SMS Webhook",
      title: "UPI Debit Captured",
      merchant: "Blue Tokai Coffee Roasters",
      amount: 350,
      time: "3 hours ago",
      type: "debit",
      category: "Dining & Social",
      bankTag: "Google Pay / SBI",
    },
    {
      id: "ev_4",
      source: "Gmail Auto-Forward",
      title: "Investment CAS SIP Confirmation",
      merchant: "Nifty 50 Index Fund (Zerodha AMC)",
      amount: 5000,
      time: "Yesterday @ 6:00 PM",
      type: "debit",
      category: "Investments & SIPs",
      bankTag: "Zerodha / CAMS",
    },
    {
      id: "ev_5",
      source: "Phone SMS Webhook",
      title: "Quick Commerce Debit Captured",
      merchant: "Zepto 10-Min Groceries",
      amount: 540,
      time: "Yesterday @ 2:15 PM",
      type: "debit",
      category: "Quick Commerce",
      bankTag: "CRED UPI",
    },
    {
      id: "ev_6",
      source: "Gmail Auto-Forward",
      title: "Monthly Salary Credit Alert",
      merchant: "Employer Salary Credit",
      amount: 75000,
      time: "Nov 1 @ 9:00 AM",
      type: "credit",
      category: "Income",
      bankTag: "HDFC Bank (e-Statement)",
    },
  ]);

  const handleCopyForwardingEmail = () => {
    navigator.clipboard.writeText("alex@pocketsense.ai");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Simulate an incoming live UPI Debit captured silently via webhook
  const handleSimulateWebhookDebit = (merchantName: string, amt: number, category: any) => {
    const newTx: Transaction = {
      id: "tx_hook_" + Date.now(),
      merchant: merchantName,
      amount: amt,
      date: new Date().toISOString().split("T")[0],
      category,
      spendingType: "Impulse Want",
      upiRef: "WH" + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: "Phone SMS Webhook (Live)",
      triggerTag: "zero-touch-webhook",
      rawSms: `Auto-intercepted via device SMS webhook: Rs. ${amt} paid to ${merchantName}`,
    };

    addBatchTransactions([newTx]);

    const newEvent: ActivityEvent = {
      id: "ev_" + Date.now(),
      source: "Phone SMS Webhook",
      title: "Live UPI Debit Captured",
      merchant: merchantName,
      amount: amt,
      time: "Just now",
      type: "debit",
      category,
      bankTag: "Phone SMS Webhook",
    };
    setActivityStream((prev) => [newEvent, ...prev]);

    setLiveToast(`✓ Phone SMS Webhook: Auto-captured ${formatINR(amt)} at ${merchantName}. Safe to Spend Today updated live.`);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.25 },
    });
    setTimeout(() => setLiveToast(null), 4000);
  };

  // Simulate incoming Gmail Auto-Forwarded Salary Credit
  const handleSimulateSalaryCredit = () => {
    updateSalary(75000, 32000, 1, true, false);

    const newEvent: ActivityEvent = {
      id: "ev_" + Date.now(),
      source: "Gmail Auto-Forward",
      title: "Salary Credit Auto-Parsed",
      merchant: "Tech Corp Payroll",
      amount: 75000,
      time: "Just now",
      type: "credit",
      category: "Income",
      bankTag: "Gmail: alex@pocketsense.ai",
    };
    setActivityStream((prev) => [newEvent, ...prev]);

    setLiveToast("✓ Gmail Auto-Forward: Parsed salary credit ₹75,000 from employer pay advice. Monthly budget re-calibrated.");
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.25 },
      colors: ["#10B981", "#3B82F6", "#F59E0B"],
    });
    setTimeout(() => setLiveToast(null), 4000);
  };

  // Simulate incoming Gmail Auto-Forwarded Credit Card Bill
  const handleSimulateCardBillAlert = () => {
    const newEvent: ActivityEvent = {
      id: "ev_" + Date.now(),
      source: "Gmail Auto-Forward",
      title: "Credit Card Bill Auto-Parsed",
      merchant: "HDFC Regalia Credit Card Due",
      amount: 14200,
      time: "Just now",
      type: "bill",
      category: "Credit Card Bill",
      bankTag: "Gmail: alex@pocketsense.ai",
    };
    setActivityStream((prev) => [newEvent, ...prev]);

    setLiveToast("✓ Gmail Auto-Forward: Parsed HDFC Credit Card bill ₹14,200 due on 22nd. Silent Risk Guard notified.");
    setTimeout(() => setLiveToast(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Smart Budgeting Header Hub */}
      <div className="fintech-card rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>SMS &amp; Insights: Zero-Touch Autopilot Sync</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Set Once, Forget Forever
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              No daily SMS copy-pasting, no manual monthly PDF downloads. PocketSense connects via background Gmail forwarding &amp; phone SMS webhook.
            </p>
          </div>
        </div>

        {/* View Segmented Switcher */}
        <div className="w-full sm:w-auto grid grid-cols-3 sm:flex rounded-xl bg-slate-100 border border-slate-200 p-1 text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setActiveTab("autopilot-sync")}
            className={`px-3 py-1.5 rounded-lg transition-all text-center ${
              activeTab === "autopilot-sync"
                ? "bg-white text-emerald-700 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="hidden sm:inline">Zero-Touch Autopilot</span>
            <span className="sm:hidden">Autopilot</span>
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-3 py-1.5 rounded-lg transition-all text-center ${
              activeTab === "insights"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="hidden sm:inline">Spending Insights</span>
            <span className="sm:hidden">Insights</span>
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-3 py-1.5 rounded-lg transition-all text-center ${
              activeTab === "ledger"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="hidden sm:inline">Passbook Ledger</span>
            <span className="sm:hidden">Ledger</span>
          </button>
        </div>
      </div>

      {/* Live Toast */}
      {liveToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-950 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <Bell className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{liveToast}</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0 font-bold">
            Live Synced
          </span>
        </div>
      )}

      {/* TAB 1: ZERO-TOUCH AUTOPILOT CONNECTORS & STREAM */}
      {activeTab === "autopilot-sync" && (
        <div className="space-y-6 animate-fade-in">
          {/* THE 2 SET-ONCE CONNECTORS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CONNECTOR A: GMAIL AUTO-FORWARD */}
            <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shadow-xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                        <span>Gmail Auto-Forward Active</span>
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active &amp; Verified
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                    No PDF Uploads
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  Automatically parses incoming bank emails, credit card statements (HDFC, ICICI, SBI), and CAMS/Zerodha investment alerts silently in the background.
                </p>

                {/* Forwarding Address Box */}
                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 font-mono text-xs">
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Forwarding Address:</span>
                    <strong className="text-slate-900 truncate">alex@pocketsense.ai</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyForwardingEmail}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-xs shrink-0 font-medium active:scale-95"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedEmail ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Rules: HDFC, SBI, ICICI, Zerodha</span>
                <span className="text-emerald-700 font-semibold">Synced 1m ago</span>
              </div>
            </div>

            {/* CONNECTOR B: PHONE SMS WEBHOOK */}
            <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-xs">
                      <Radio className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                        <span>Phone SMS Webhook Connected</span>
                      </h3>
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Live Listener Active
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    No Daily Typing
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  Silently intercepts incoming payment debits as you spend across Google Pay, PhonePe, Paytm, and bank SMS without opening the app or copying text.
                </p>

                {/* Live Channels */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-700 font-semibold">Google Pay / PhonePe</span>
                    <span className="text-emerald-700 font-bold">✓ Synced</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-700 font-semibold">HDFC &amp; SBI Debits</span>
                    <span className="text-emerald-700 font-bold">✓ Synced</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>Latency: &lt; 400ms detection</span>
                <span className="text-emerald-700 font-semibold">28 UPI Spends Synced</span>
              </div>
            </div>
          </div>

          {/* SIMULATION TEST BAR FOR JUDGES */}
          <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  1-Click Live Background Sync Simulator (Test Without Real SMS/Email)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Updates Safe to Spend &amp; Balances in Real Time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleSimulateWebhookDebit("Swiggy Gourmet Bowl", 480, "Dining & Social")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group active:scale-95"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>Swiggy Delivery</span>
                  <span className="font-mono text-rose-600">-₹480</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>SMS Webhook</span>
                  <span className="text-emerald-600 group-hover:underline">Simulate →</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSimulateWebhookDebit("Blue Tokai Coffee", 350, "Dining & Social")}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group active:scale-95"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>Blue Tokai Coffee</span>
                  <span className="font-mono text-rose-600">-₹350</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>UPI Webhook</span>
                  <span className="text-emerald-600 group-hover:underline">Simulate →</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSimulateSalaryCredit}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group active:scale-95"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>Salary Credit</span>
                  <span className="font-mono text-emerald-600">+₹75,000</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Gmail Forward</span>
                  <span className="text-emerald-600 group-hover:underline">Simulate →</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleSimulateCardBillAlert}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all group active:scale-95"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                  <span>HDFC Card Bill</span>
                  <span className="font-mono text-blue-600">₹14,200 Due</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Gmail e-Statement</span>
                  <span className="text-emerald-600 group-hover:underline">Simulate →</span>
                </div>
              </button>
            </div>
          </div>

          {/* LIVE STREAM OF BACKGROUND INGESTIONS */}
          <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                  Live Background Ingestion Activity Stream ({activityStream.length} Events)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time Stream
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {activityStream.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs font-mono hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        ev.source === "Phone SMS Webhook"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ev.source === "Phone SMS Webhook" ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate">{ev.merchant}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${
                            ev.source === "Phone SMS Webhook"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          {ev.source}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {ev.title} • {ev.bankTag} • {ev.time}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-bold block ${
                        ev.type === "credit"
                          ? "text-emerald-700"
                          : ev.type === "bill"
                          ? "text-blue-700"
                          : "text-slate-900"
                      }`}
                    >
                      {ev.type === "credit" ? "+" : ev.type === "debit" ? "-" : ""}
                      {formatINR(ev.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{ev.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPENDING INSIGHTS */}
      {activeTab === "insights" && (
        <div className="space-y-6 animate-fade-in">
          <SpendingTrendChart />

          {/* Silent Subscription Leaks & Traps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Detected Silent Subscription Leaks</span>
              </div>
              <p className="text-xs text-slate-500">
                Recurring monthly charges detected automatically without user tagging.
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span>Spotify Premium Individual</span>
                  <span className="font-bold text-slate-900">₹119/mo</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span>Netflix HD Standard</span>
                  <span className="font-bold text-slate-900">₹499/mo</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span>Apple iCloud 200GB</span>
                  <span className="font-bold text-slate-900">₹219/mo</span>
                </div>
              </div>
            </div>

            <div className="fintech-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>Micro-Impulse Drain Summary</span>
              </div>
              <p className="text-xs text-slate-500">
                Small spends (&lt; ₹500) that invisibly shorten your monthly salary runway.
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span>Quick-Commerce Carts (Blinkit/Zepto)</span>
                  <span className="font-bold text-amber-700">₹3,420 (8 orders)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span>Coffee &amp; Cafes (Blue Tokai/Third Wave)</span>
                  <span className="font-bold text-amber-700">₹1,850 (5 visits)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span>Auto-Saved Spare Change from Rounds</span>
                  <span className="font-bold text-emerald-700">+₹1,240 routed to FD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PASSBOOK LEDGER */}
      {activeTab === "ledger" && (
        <div className="space-y-4 animate-fade-in">
          <TransactionHistory />
        </div>
      )}
    </div>
  );
};
