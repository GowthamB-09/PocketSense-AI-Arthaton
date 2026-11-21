"use client";

import React, { useState } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { Transaction } from "@/types";
import { formatINR } from "@/lib/utils";
import { TransactionHistory } from "@/components/TransactionHistory";
import {
  Smartphone,
  Mail,
  Zap,
  Check,
  Copy,
  CreditCard,
  ShoppingBag,
  UtensilsCrossed,
  Car,
  Film,
  PieChart,
  Bell,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

interface PassbookSpaceProps {
  onOpenSmsDrawer?: () => void;
}

export type SpendCategory =
  | "Food & Dining"
  | "Shopping & Gear"
  | "Transport & Subscriptions"
  | "Entertainment & Outings";

export interface ActivityEvent {
  id: string;
  source: "Phone SMS Webhook" | "Gmail Auto-Forward" | "Bank / UPI SMS" | "Credit Card SMS";
  title: string;
  merchant: string;
  amount: number;
  time: string;
  type: "debit" | "credit" | "bill";
  category: SpendCategory | string;
  bankTag: string;
  roundUp?: number;
  rawText?: string;
}

export const PassbookSpace: React.FC<PassbookSpaceProps> = () => {
  const {
    profile,
    addBatchTransactions,
    updateCreditCardDues,
    isAutoPayPaused,
    claimSavings,
  } = useFinancialMemory();

  const [activeTab, setActiveTab] = useState<"autopilot-sync" | "insights" | "ledger">("autopilot-sync");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [liveToast, setLiveToast] = useState<string | null>(null);

  // Top Spend Categories initialized to sum exactly to spentThisMonth (₹17,708)
  // 6850 + 4920 + 3438 + 2500 = 17,708
  const [categoryBreakdown, setCategoryBreakdown] = useState<Record<SpendCategory, number>>({
    "Food & Dining": 6850,
    "Shopping & Gear": 4920,
    "Transport & Subscriptions": 3438,
    "Entertainment & Outings": 2500,
  });

  // Default Sample SMS with Avl Bal matching totalLinkedBankCash (INR 48,500.00)
  const currentBankCash = profile.totalLinkedBankCash ?? 48500;
  const DEFAULT_SAMPLE_SMS = `Debited INR 540.00 from HDFC Bank A/C **4412 via UPI to ZOMATO ONLINE. Avl Bal: INR ${currentBankCash.toLocaleString("en-IN")}.00.`;
  const [smsInput, setSmsInput] = useState<string>(DEFAULT_SAMPLE_SMS);

  // Clean Consumer Recent Activity Stream
  const [activityStream, setActivityStream] = useState<ActivityEvent[]>([
    {
      id: "ev_1",
      source: "Bank / UPI SMS",
      title: "UPI Debit",
      merchant: "Swiggy Gourmet Bowl",
      amount: 480,
      time: "12 mins ago",
      type: "debit",
      category: "Food & Dining",
      bankTag: "HDFC Bank",
      roundUp: 20,
    },
    {
      id: "ev_2",
      source: "Credit Card SMS",
      title: "Credit Card Bill",
      merchant: "ICICI Bank Coral Card",
      amount: 9800, // Matches app's live card dues (₹9,800 ICICI / ₹8,108 HDFC)
      time: "1 hour ago",
      type: "bill",
      category: "Credit Card Bill",
      bankTag: "ICICI Bank",
    },
    {
      id: "ev_3",
      source: "Bank / UPI SMS",
      title: "UPI Debit",
      merchant: "Blue Tokai Coffee Roasters",
      amount: 350,
      time: "3 hours ago",
      type: "debit",
      category: "Food & Dining",
      bankTag: "SBI UPI",
      roundUp: 50,
    },
    {
      id: "ev_4",
      source: "Gmail Auto-Forward",
      title: "Mutual Fund SIP",
      merchant: "Nifty 50 Index Mutual Fund",
      amount: 5000,
      time: "Yesterday @ 6:00 PM",
      type: "debit",
      category: "Investments & SIPs",
      bankTag: "HDFC Bank",
    },
    {
      id: "ev_5",
      source: "Bank / UPI SMS",
      title: "Quick Commerce Debit",
      merchant: "Zepto 10-Min Groceries",
      amount: 540,
      time: "Yesterday @ 2:15 PM",
      type: "debit",
      category: "Food & Dining",
      bankTag: "HDFC Bank",
      roundUp: 60,
    },
    {
      id: "ev_6",
      source: "Bank / UPI SMS",
      title: "Commute Debit",
      merchant: "Uber Ride Home",
      amount: 350,
      time: "2 days ago",
      type: "debit",
      category: "Transport & Subscriptions",
      bankTag: "HDFC Bank",
      roundUp: 50,
    },
  ]);

  // Consumer Tag Helper for Clean Badges (UPI, Card, SIP)
  const getConsumerTag = (ev: ActivityEvent) => {
    if (
      ev.category === "Investments & SIPs" ||
      /sip|invest/i.test(ev.title) ||
      /sip|fund/i.test(ev.merchant)
    ) {
      return {
        label: "SIP",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        iconBg: "bg-purple-100 text-purple-700",
        icon: <Layers className="w-4 h-4" />,
      };
    }
    if (
      ev.type === "bill" ||
      ev.source === "Credit Card SMS" ||
      ev.category === "Credit Card Bill" ||
      /card/i.test(ev.merchant) ||
      /card/i.test(ev.bankTag)
    ) {
      return {
        label: "Card",
        badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        iconBg: "bg-blue-100 text-blue-700",
        icon: <CreditCard className="w-4 h-4" />,
      };
    }
    return {
      label: "UPI",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-700",
      icon: <Smartphone className="w-4 h-4" />,
    };
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // REAL REGEX SMS PARSING ENGINE
  // ─────────────────────────────────────────────────────────────────────────────
  const parseSmsDetails = (text: string) => {
    const clean = text.trim();

    // Parse rupee amount using /INR\s*([\d,]+(?:\.\d+)?)|Rs\.?\s*([\d,]+(?:\.\d+)?)/i
    // Matches INR 540.00 accurately to 540 (not 5,400)
    const amountRegex = /INR\s*([\d,]+(?:\.\d+)?)|Rs\.?\s*([\d,]+(?:\.\d+)?)/i;
    const match = clean.match(amountRegex);
    let amount = 0;
    if (match) {
      const rawVal = match[1] || match[2];
      if (rawVal) {
        amount = parseFloat(rawVal.replace(/,/g, ""));
      }
    }
    if (amount === 0) {
      const symbolMatch = clean.match(/₹\s*([\d,]+(?:\.\d+)?)/i);
      if (symbolMatch && symbolMatch[1]) {
        amount = parseFloat(symbolMatch[1].replace(/,/g, ""));
      }
    }

    // Extract merchant name
    let rawMerchant = "";
    const toMatch = clean.match(
      /(?:to|at|paid to|spent at)\s+([A-Za-z0-9&'\-\.\s]+?)(?:\s*(?:via|\.|\bon\b|\bAvl\b|\bRef\b|\bA\/C\b|\bBal\b|\bLimit\b|$))/i
    );
    if (toMatch && toMatch[1]?.trim()) {
      rawMerchant = toMatch[1].trim();
    }

    let merchant = "Zomato";
    if (/zomato/i.test(clean) || /zomato/i.test(rawMerchant)) {
      merchant = "Zomato";
    } else if (/swiggy/i.test(clean) || /swiggy/i.test(rawMerchant)) {
      merchant = "Swiggy";
    } else if (/zepto/i.test(clean) || /zepto/i.test(rawMerchant)) {
      merchant = "Zepto";
    } else if (/blinkit/i.test(clean) || /blinkit/i.test(rawMerchant)) {
      merchant = "Blinkit";
    } else if (/blue\s*tokai/i.test(clean) || /blue\s*tokai/i.test(rawMerchant)) {
      merchant = "Blue Tokai Coffee";
    } else if (/starbucks/i.test(clean) || /starbucks/i.test(rawMerchant)) {
      merchant = "Starbucks";
    } else if (/uber/i.test(clean) || /uber/i.test(rawMerchant)) {
      merchant = "Uber";
    } else if (/ola/i.test(clean) || /ola/i.test(rawMerchant)) {
      merchant = "Ola";
    } else if (/rapido/i.test(clean) || /rapido/i.test(rawMerchant)) {
      merchant = "Rapido";
    } else if (/zara/i.test(clean) || /zara/i.test(rawMerchant)) {
      merchant = "Zara";
    } else if (/amazon/i.test(clean) || /amazon/i.test(rawMerchant)) {
      merchant = "Amazon";
    } else if (/myntra/i.test(clean) || /myntra/i.test(rawMerchant)) {
      merchant = "Myntra";
    } else if (/flipkart/i.test(clean) || /flipkart/i.test(rawMerchant)) {
      merchant = "Flipkart";
    } else if (/bookmyshow/i.test(clean) || /bookmyshow/i.test(rawMerchant)) {
      merchant = "BookMyShow";
    } else if (/pvr/i.test(clean) || /pvr/i.test(rawMerchant)) {
      merchant = "PVR Cinemas";
    } else if (rawMerchant) {
      merchant = rawMerchant
        .replace(/\s+(online|ltd|limited|pvt|private|india|commerce|pay|blr|delhi|mumbai)\b/gi, "")
        .trim();
      if (merchant.length > 0) {
        merchant = merchant
          .toLowerCase()
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }
    }

    // Auto-classify category
    let category: SpendCategory = "Food & Dining";
    const searchStr = (merchant + " " + clean).toLowerCase();
    if (
      /zomato|swiggy|blue tokai|starbucks|food|dining|restaurant|cafe|eat|burger|pizza|kitchen|bakery|chai|coffee|mcdonalds|kfc|zepto|blinkit|instamart|grocery|groceries/i.test(
        searchStr
      )
    ) {
      category = "Food & Dining";
    } else if (
      /zara|amazon|myntra|flipkart|shopping|gear|apparel|clothing|fashion|retail|store|h&m|uniqlo|electronics|croma|apple/i.test(
        searchStr
      )
    ) {
      category = "Shopping & Gear";
    } else if (
      /uber|ola|rapido|metro|commute|transport|ride|cab|auto|flight|indigo|irctc|netflix|spotify|prime|youtube|cloud|subscription|airtel|jio/i.test(
        searchStr
      )
    ) {
      category = "Transport & Subscriptions";
    } else if (
      /bookmyshow|pvr|inox|movie|cinema|theatre|concert|event|party|pub|bar|brewery|club|entertainment|outing/i.test(
        searchStr
      )
    ) {
      category = "Entertainment & Outings";
    }

    // Calculate spare-change round-up dynamically to next ₹100
    const roundUp = amount > 0 ? (amount % 100 === 0 ? 0 : 100 - (amount % 100)) : 0;

    // Credit Card vs Bank/UPI detection
    const isCreditCard = /card|credit|limit/i.test(clean) && !/debit card|debit/i.test(clean);

    let bankTag = isCreditCard ? "Credit Card" : "HDFC Bank (UPI)";
    if (/ICICI/i.test(clean)) bankTag = isCreditCard ? "ICICI Card" : "ICICI Bank UPI";
    else if (/SBI/i.test(clean)) bankTag = isCreditCard ? "SBI Card" : "SBI UPI";
    else if (/HDFC/i.test(clean)) bankTag = isCreditCard ? "HDFC Card" : "HDFC Bank UPI";
    else if (/Axis/i.test(clean)) bankTag = isCreditCard ? "Axis Card" : "Axis Bank UPI";

    return {
      amount,
      merchant,
      category,
      roundUp,
      isCreditCard,
      bankTag,
    };
  };

  const currentParsed = parseSmsDetails(smsInput);

  // ─────────────────────────────────────────────────────────────────────────────
  // PARSE & LOG SMS ACTION
  // ─────────────────────────────────────────────────────────────────────────────
  const handleParseAndLogSms = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentParsed.amount <= 0) return;

    const { amount, merchant, category, roundUp, isCreditCard, bankTag } = currentParsed;
    const bankCash = profile.totalLinkedBankCash ?? 48500;
    const cardDues = profile.creditCardDues ?? 17908;

    // 1. Prepend newly parsed transaction to Recent Activity
    const newFeedEvent: ActivityEvent = {
      id: "ev_sms_" + Date.now(),
      source: isCreditCard ? "Credit Card SMS" : "Bank / UPI SMS",
      title: isCreditCard ? "Card Spend" : "UPI Debit",
      merchant,
      amount,
      time: "Just now",
      type: "debit",
      category,
      bankTag,
      roundUp,
      rawText: smsInput,
    };
    setActivityStream((prev) => [newFeedEvent, ...prev]);

    // 2. Deduct debited amount from totalLinkedBankCash (if bank/UPI) or add to upcomingCardDues (if card)
    if (isCreditCard) {
      const updatedCardDues = cardDues + amount;
      updateCreditCardDues(updatedCardDues, bankCash);
    } else {
      const updatedBankCash = Math.max(0, bankCash - amount);
      updateCreditCardDues(cardDues, updatedBankCash);
    }

    // 3. Increment matching category in Top Spend Categories so totals stay synced with Spent This Month
    setCategoryBreakdown((prev) => ({
      ...prev,
      [category]: prev[category] + amount,
    }));

    // Respect Silent Risk Guard in SMS Round-Ups
    if (!isAutoPayPaused && roundUp > 0) {
      const targetGoal = profile.goals?.[0]?.id || "goal_iphone";
      claimSavings(
        targetGoal,
        roundUp,
        `Spare-Change Round-Up (+₹${roundUp}) from ${merchant} spend`
      );
    }

    // Append transaction to Ledger
    const newTx: Transaction = {
      id: "tx_sms_" + Date.now(),
      merchant,
      amount,
      date: new Date().toISOString().split("T")[0],
      category: category === "Food & Dining" ? "Dining & Social" : (category as any),
      spendingType: "Impulse Want",
      upiRef: "UPI" + Math.floor(1000000000 + Math.random() * 9000000000),
      bank: bankTag,
      triggerTag: "sms-autopilot",
      rawSms: smsInput,
    };
    addBatchTransactions([newTx]);

    const roundUpMessage = isAutoPayPaused
      ? "AutoPay paused by Risk Guard"
      : `+₹${roundUp} swept to Goal Jars`;
    setLiveToast(
      `✓ Logged: ₹${amount.toLocaleString("en-IN")} at ${merchant} (${category}). ${roundUpMessage}.`
    );

    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.35 },
      colors: ["#10B981", "#3B82F6", "#F59E0B"],
    });

    setTimeout(() => setLiveToast(null), 5000);
  };

  const handleCopyForwardingEmail = () => {
    navigator.clipboard.writeText("alex@pocketsense.ai");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  // Sample SMS presets for 1-click testing
  const SAMPLE_PRESETS = [
    {
      label: "🍕 Zomato UPI (₹540)",
      text: `Debited INR 540.00 from HDFC Bank A/C **4412 via UPI to ZOMATO ONLINE. Avl Bal: INR ${currentBankCash.toLocaleString("en-IN")}.00.`,
    },
    {
      label: "🥗 Swiggy UPI (₹480)",
      text: "SBI UPI: Rs.480.00 debited from A/C **9011 to Swiggy. Avl Bal: INR 48,020.00.",
    },
    {
      label: "👗 Zara Card (₹1,120)",
      text: "ICICI Card ending 8021 spent Rs.1120.00 at ZARA. Avl Limit Rs.1,45,000.",
    },
    {
      label: "🚗 Uber Ride (₹350)",
      text: "Debited Rs.350.00 from HDFC Bank via UPI to Uber India. Avl Bal: INR 47,670.00.",
    },
  ];

  const totalSpentThisMonth = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);

  const categoriesConfig: {
    key: SpendCategory;
    color: string;
    dotBg: string;
    badgeBg: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "Food & Dining",
      color: "#F59E0B",
      dotBg: "bg-amber-500",
      badgeBg: "bg-amber-50 text-amber-900 border-amber-200",
      icon: <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      key: "Shopping & Gear",
      color: "#8B5CF6",
      dotBg: "bg-purple-500",
      badgeBg: "bg-purple-50 text-purple-900 border-purple-200",
      icon: <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />,
    },
    {
      key: "Transport & Subscriptions",
      color: "#3B82F6",
      dotBg: "bg-blue-500",
      badgeBg: "bg-blue-50 text-blue-900 border-blue-200",
      icon: <Car className="w-3.5 h-3.5 text-blue-600" />,
    },
    {
      key: "Entertainment & Outings",
      color: "#EC4899",
      dotBg: "bg-pink-500",
      badgeBg: "bg-pink-50 text-pink-900 border-pink-200",
      icon: <Film className="w-3.5 h-3.5 text-pink-600" />,
    },
  ];

  // SVG Donut Chart Geometry
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPct = 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Hub */}
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
              Effortless, zero-touch tracking. PocketSense automatically syncs bank alerts, credit card dues, and UPI spends.
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
            <span className="hidden sm:inline">Spend History</span>
            <span className="sm:hidden">History</span>
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

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: ZERO-TOUCH AUTOPILOT
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "autopilot-sync" && (
        <div className="space-y-6 animate-fade-in">
          {/* COMPACT SINGLE-LINE STATUS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Bank & Card Email Sync */}
            <div className="p-3.5 px-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">Bank &amp; Card Email Sync:</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ON
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 truncate block">
                    alex@pocketsense.ai
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyForwardingEmail}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shrink-0 shadow-2xs active:scale-95"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedEmail ? "Copied" : "Copy"}</span>
              </button>
            </div>

            {/* Card 2: UPI & Bank SMS Sync */}
            <div className="p-3.5 px-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">UPI &amp; Bank SMS Sync:</span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ON
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 truncate block">
                    HDFC • SBI • ICICI • UPI
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
          </div>

          {/* PARSE & LOG SMS CARD */}
          <div className="fintech-card rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Parse &amp; Log SMS</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Parse any pasted bank or credit card SMS. Auto-extracts amount, merchant, category, and sweeps spare change.
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 self-start sm:self-auto">
                Live App Sync • Zero Manual Typing
              </span>
            </div>

            {/* Quick Sample Presets Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                Quick-Test Sample SMS Templates:
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSmsInput(preset.text)}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SMS Input Text Area */}
            <form onSubmit={handleParseAndLogSms} className="space-y-3 pt-1">
              <div className="relative">
                <textarea
                  rows={2}
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value)}
                  placeholder="Paste any Indian Bank/UPI or Credit Card SMS..."
                  className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Real-Time Extraction Preview Strip */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Parsed Amount</span>
                  <span className="text-sm font-bold text-slate-900 block">
                    {currentParsed.amount > 0 ? `₹${currentParsed.amount.toLocaleString("en-IN")}` : "₹0"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-sans">
                    {currentParsed.isCreditCard ? "Credit Card" : "Bank / UPI"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Merchant</span>
                  <strong className="text-slate-900 text-sm block truncate">{currentParsed.merchant}</strong>
                  <span className="text-[10px] text-slate-500 font-sans">{currentParsed.bankTag}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Category</span>
                  <span className="text-xs font-bold text-slate-800 block truncate">{currentParsed.category}</span>
                  <span className="text-[10px] text-emerald-600 font-sans font-medium">Auto-Classified</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Account Target</span>
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {currentParsed.isCreditCard ? "Adds to Card Dues" : "Deducts Bank Cash"}
                  </span>
                  <span className="text-[10px] text-blue-600 font-sans font-medium">Updates Net Safe Pool</span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Spare Change</span>
                  {isAutoPayPaused ? (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full inline-block">
                      +₹0 (AutoPay Paused)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-block">
                      +₹{currentParsed.roundUp} Round-Up
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 block font-sans">
                    {isAutoPayPaused ? "Buffer Protected" : "Swept to Vaults"}
                  </span>
                </div>
              </div>

              {/* Action Button: Parse & Log SMS */}
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={currentParsed.amount <= 0}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 min-h-[42px]"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Parse &amp; Log SMS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: SPENDING INSIGHTS (CLEAN CATEGORY BREAKDOWN + ONE CONCISE AI TAKEAWAY)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "insights" && (
        <div className="space-y-6 animate-fade-in">
          {/* Clean Category Breakdown */}
          <div className="fintech-card rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                  <PieChart className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Category Breakdown</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                      Synced with Spent This Month
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live distribution across your primary spending buckets. Totals sync automatically with simulated spends.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <span className="text-slate-500">Total Spent:</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold">
                  ₹{totalSpentThisMonth.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Donut Chart + Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* SVG Donut Chart */}
              <div className="md:col-span-5 flex flex-col items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                  >
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="#E2E8F0"
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                    {categoriesConfig.map((cat) => {
                      const amount = categoryBreakdown[cat.key] || 0;
                      const pct = totalSpentThisMonth > 0 ? amount / totalSpentThisMonth : 0;
                      const strokeDasharray = `${pct * circumference} ${circumference}`;
                      const strokeDashoffset = -accumulatedPct * circumference;
                      accumulatedPct += pct;

                      if (pct <= 0) return null;

                      return (
                        <circle
                          key={cat.key}
                          cx={size / 2}
                          cy={size / 2}
                          r={radius}
                          stroke={cat.color}
                          strokeWidth={strokeWidth}
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          fill="none"
                          className="transition-all duration-500 ease-out"
                        />
                      );
                    })}
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                      Spent
                    </span>
                    <span className="text-xl font-black font-mono text-slate-900 tracking-tight">
                      ₹{totalSpentThisMonth.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      This Month
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 mt-2">
                  100% Synced with Top Salary Bar
                </span>
              </div>

              {/* Category Breakdown Cards */}
              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {categoriesConfig.map((cat) => {
                  const amount = categoryBreakdown[cat.key] || 0;
                  const pct = totalSpentThisMonth > 0 ? Math.round((amount / totalSpentThisMonth) * 100) : 0;

                  return (
                    <div
                      key={cat.key}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full ${cat.dotBg} shrink-0`} />
                          <span className="font-bold text-slate-800 truncate">{cat.key}</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 shrink-0">
                          {pct}%
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-black text-slate-900">
                          ₹{amount.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Concise AI Takeaway Card */}
          <div className="fintech-card rounded-2xl p-5 bg-gradient-to-br from-emerald-50/70 via-white to-blue-50/50 border border-emerald-200/80 shadow-sm flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AI Spending Takeaway
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
                  Live Monthly Pace
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have spent <strong>₹{totalSpentThisMonth.toLocaleString("en-IN")}</strong> this month across your 4 primary categories. Discretionary spending remains within safe boundaries, keeping your bank cash protected for upcoming card dues (₹17,908) and month-end savings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 3: PASSBOOK LEDGER (CLEAN SCANNABLE LIST)
      ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === "ledger" && (
        <div className="space-y-4 animate-fade-in">
          <TransactionHistory />
        </div>
      )}
    </div>
  );
};
