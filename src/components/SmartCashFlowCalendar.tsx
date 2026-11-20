"use client";

import React, { useState, useMemo } from "react";
import { useFinancialMemory } from "@/lib/memory/memoryContext";
import { CalendarEvent, CalendarEventCategory } from "@/types";
import { formatINR } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Check,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Gift,
  PartyPopper,
  HeartHandshake,
  Receipt,
  X,
  CreditCard,
  Trash2,
  Lock,
  Unlock,
  Info,
} from "lucide-react";

interface SmartCashFlowCalendarProps {
  onOpenBeforeIScan?: () => void;
  onOpenSettings?: () => void;
  onOpenRiskDetails?: () => void;
}

const CATEGORY_CONFIG: Record<
  CalendarEventCategory,
  { label: string; emoji: string; color: string; badgeBg: string; badgeBorder: string; badgeText: string; dotColor: string }
> = {
  birthday: {
    label: "Birthday Gift",
    emoji: "🎂",
    color: "#8B5CF6", // Purple
    badgeBg: "bg-purple-50",
    badgeBorder: "border-purple-200",
    badgeText: "text-purple-800",
    dotColor: "bg-purple-500",
  },
  wedding: {
    label: "Wedding",
    emoji: "💍",
    color: "#EC4899", // Pink / Fuchsia
    badgeBg: "bg-pink-50",
    badgeBorder: "border-pink-200",
    badgeText: "text-pink-800",
    dotColor: "bg-pink-500",
  },
  party: {
    label: "Party / Outing",
    emoji: "🎉",
    color: "#6366F1", // Indigo
    badgeBg: "bg-indigo-50",
    badgeBorder: "border-indigo-200",
    badgeText: "text-indigo-800",
    dotColor: "bg-indigo-500",
  },
  autopay: {
    label: "AutoPay Bill",
    emoji: "🧾",
    color: "#EF4444", // Red
    badgeBg: "bg-rose-50",
    badgeBorder: "border-rose-200",
    badgeText: "text-rose-800",
    dotColor: "bg-rose-500",
  },
};

export const SmartCashFlowCalendar: React.FC<SmartCashFlowCalendarProps> = ({
  onOpenBeforeIScan,
  onOpenSettings,
  onOpenRiskDetails,
}) => {
  const {
    profile,
    addCalendarEvent,
    deleteCalendarEvent,
    togglePreLock,
    markEventPaid,
  } = useFinancialMemory();

  // Primary demo cycle is set to November 2026 (Month index 10)
  // Current today simulation date: Nov 20, 2026
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(10); // 0-indexed: 10 = November
  const [selectedDateStr, setSelectedDateStr] = useState<string>("2026-11-20");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Event Form State
  const [formCategory, setFormCategory] = useState<CalendarEventCategory>("birthday");
  const [formTitle, setFormTitle] = useState<string>("Aarav's Birthday Gift");
  const [formDate, setFormDate] = useState<string>("2026-11-26");
  const [formBudget, setFormBudget] = useState<string>("2500");
  const [formPreLock, setFormPreLock] = useState<boolean>(true);

  const events: CalendarEvent[] = useMemo(() => {
    return Array.isArray(profile.calendarEvents) ? profile.calendarEvents : [];
  }, [profile.calendarEvents]);

  const totalLinkedBankCash = profile.totalLinkedBankCash ?? 48500;
  const upcomingCardDues = profile.creditCardDues ?? 17908;

  // Standout Feature A: Ring-Fenced Event Shield calculations
  const ringFencedEvents = useMemo(() => {
    return events.filter((e) => e.isPreLocked && !e.isPaid && e.category !== "autopay");
  }, [events]);

  const totalRingFencedAmount = useMemo(() => {
    return ringFencedEvents.reduce((sum, e) => sum + (e.budget || 0), 0);
  }, [ringFencedEvents]);

  // NET SAFE CASH POOL (Total Linked Bank Cash − Upcoming Card Dues − Ring-Fenced Calendar Events)
  const netSafeCashPool = Math.max(0, totalLinkedBankCash - upcomingCardDues - totalRingFencedAmount);

  // AutoPay Bill Due Dates in current month for collision detection
  const autoPayBills = useMemo(() => {
    return events.filter((e) => e.category === "autopay" || e.id.includes("autopay"));
  }, [events]);

  // Calendar Geometry & Dynamic Payday Alignment with Settings
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const prefixEmptyDays = (firstDayOfWeek + 6) % 7; // Monday-first offset (0 for Mon, 6 for Sun)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentMonthName = monthNames[viewMonth];

  // Dynamic Payday derived from Settings (profile.salaryCreditDay)
  const salaryCreditDay = profile.salaryCreditDay || 1;
  const paydayNum = Math.min(salaryCreditDay, daysInMonth);
  const paydayDateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(paydayNum).padStart(2, "0")}`;

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setViewYear(2026);
    setViewMonth(10);
    setSelectedDateStr("2026-11-20");
  };

  const openAddModalForDate = (dateStr: string) => {
    setFormDate(dateStr);
    setIsAddModalOpen(true);
  };

  // Helper to detect Bill-Week Collision within 2 days
  const checkCollisionForDate = (targetDateStr: string) => {
    const targetDate = new Date(targetDateStr);
    if (isNaN(targetDate.getTime())) return null;

    for (const bill of autoPayBills) {
      const billDate = new Date(bill.date);
      if (isNaN(billDate.getTime())) continue;

      const diffMs = billDate.getTime() - targetDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (Math.abs(diffDays) <= 2) {
        let timingLabel = "";
        if (diffDays === 0) timingLabel = "due on the same day";
        else if (diffDays === 1) timingLabel = "due 1 day after this event";
        else if (diffDays === 2) timingLabel = "due 2 days after this event";
        else if (diffDays === -1) timingLabel = "due 1 day before this event";
        else if (diffDays === -2) timingLabel = "due 2 days before this event";

        return {
          billTitle: bill.title,
          billAmount: bill.budget,
          timingLabel,
          dueCardDues: upcomingCardDues,
        };
      }
    }
    return null;
  };

  // Real-time collision check for the form
  const activeFormCollision = useMemo(() => {
    if (formCategory === "autopay") return null;
    return checkCollisionForDate(formDate);
  }, [formDate, formCategory, autoPayBills, upcomingCardDues]);

  // Handle Event Creation
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = Math.min(999999999, parseInt(formBudget.replace(/\D/g, ""), 10) || 0);

    if (!formTitle.trim() || !formDate) return;

    addCalendarEvent({
      title: formTitle.trim(),
      date: formDate,
      budget: budgetNum,
      category: formCategory,
      isPreLocked: formCategory === "autopay" ? false : formPreLock,
      isPaid: false,
      notes: formPreLock ? "Pre-locked in Ring-Fenced Event Shield" : undefined,
    });

    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.4 },
      colors: ["#8B5CF6", "#10B981", "#EC4899", "#3B82F6"],
    });

    setToastMessage(`✓ Scheduled "${formTitle.trim()}"! ${formPreLock ? `₹${budgetNum.toLocaleString('en-IN')} ring-fenced from Safe Pool.` : ""}`);
    setTimeout(() => setToastMessage(null), 4500);

    setIsAddModalOpen(false);
    setSelectedDateStr(formDate);
  };

  // Events on the currently selected date
  const selectedDateEvents = useMemo(() => {
    // Filter user/pre-loaded events (ignoring any static evt_payday)
    const list = events.filter((e) => e.date === selectedDateStr && e.id !== "evt_payday");

    // Dynamic Payday Event aligned to Settings
    if (selectedDateStr === paydayDateStr) {
      list.push({
        id: "evt_payday",
        title: "Monthly Salary Credited (Payday 🎉)",
        date: paydayDateStr,
        budget: profile.monthlySalary || 75000,
        category: "autopay",
        isPreLocked: false,
        isPaid: false,
        notes: `Salary credited on Day ${salaryCreditDay} (configured in Settings).`,
      });
    }
    return list;
  }, [events, selectedDateStr, paydayDateStr, profile.monthlySalary, salaryCreditDay]);

  // Formatted date label for selected date
  const selectedDateLabel = useMemo(() => {
    try {
      const d = new Date(selectedDateStr + "T00:00:00");
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  return (
    <div className="fintech-card rounded-2xl p-5 sm:p-6 bg-white border border-slate-200 shadow-sm space-y-5 transition-all">
      {/* 1. Card Header with Month Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 shadow-2xs">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Smart Cash-Flow &amp; Event Calendar
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Shield Active
              </span>
            </div>
          </div>
        </div>

        {/* Month Navigator & Add Event Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs font-bold font-mono text-slate-800 min-w-[105px] text-center select-none">
              {currentMonthName} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next Month"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-mono font-semibold text-slate-700 transition-colors shadow-2xs"
            title="Jump to Today (Nov 20, 2026)"
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => openAddModalForDate(selectedDateStr)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Status Legend Row */}
      <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 px-1 py-1 bg-slate-50/80 rounded-xl border border-slate-200/70 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span className="font-semibold text-slate-700">AutoPay Bills</span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">(Nov 24, Nov 27)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
          <span className="font-semibold text-slate-700">Events &amp; Gifts</span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">(Nov 26: Aarav)</span>
        </div>

        <div
          onClick={() => setSelectedDateStr(paydayDateStr)}
          className="flex items-center gap-1.5 cursor-pointer hover:opacity-85 transition-opacity"
          title={`Payday set to Day ${paydayNum} in Budget Settings. Click to view.`}
        >
          <span className="text-amber-500 text-xs shrink-0">⭐</span>
          <span className="font-semibold text-emerald-800">Payday</span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            ({currentMonthName.slice(0, 3)} {paydayNum} • {formatINR(profile.monthlySalary || 75000)})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full ring-2 ring-emerald-500 bg-emerald-100 shrink-0" />
          <span className="font-semibold text-emerald-900">Today</span>
          <span className="text-[10px] font-mono text-emerald-700 font-bold">(Nov 20)</span>
        </div>
      </div>

      {/* 3. 7-Column Calendar Grid (M T W T F S S) */}
      <div className="space-y-1">
        {/* Day-of-Week Column Headers */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider pb-1">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Prefix Empty Cells */}
          {Array.from({ length: prefixEmptyDays }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="h-16 sm:h-20 rounded-xl bg-slate-50/40 border border-transparent opacity-40 select-none"
            />
          ))}

          {/* Day Cells of the Month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
            const isToday = viewYear === 2026 && viewMonth === 10 && dayNum === 20;
            const isSelected = selectedDateStr === dateStr;
            const isPayday = dayNum === paydayNum;

            // Events on this date (excluding static evt_payday)
            const dayEvents = events.filter((e) => e.date === dateStr && e.id !== "evt_payday");
            const hasAutoPay = dayEvents.some((e) => e.category === "autopay") || isPayday;
            const hasPersonal = dayEvents.some((e) => e.category !== "autopay");
            const hasPreLocked = dayEvents.some((e) => e.isPreLocked && !e.isPaid);

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-16 sm:h-20 p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all select-none relative group ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/40 shadow-xs ring-2 ring-emerald-500/20"
                    : isToday
                    ? "border-emerald-500 bg-white shadow-2xs"
                    : "border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300"
                }`}
              >
                {/* Top Number Row */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold leading-none ${
                      isToday
                        ? "w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow-xs"
                        : isSelected
                        ? "text-emerald-950 font-black"
                        : "text-slate-800"
                    }`}
                  >
                    {dayNum}
                  </span>

                  {isToday && (
                    <span className="hidden sm:inline text-[9px] font-mono uppercase font-black text-emerald-700 bg-emerald-100/80 px-1 rounded">
                      Today
                    </span>
                  )}

                  {isPayday && (
                    <span
                      className="text-amber-500 text-xs shrink-0 drop-shadow-xs"
                      title={`Payday: Salary Credited (${formatINR(profile.monthlySalary || 75000)})`}
                    >
                      ⭐
                    </span>
                  )}
                </div>

                {/* Event Indicators Row Inside Cell */}
                <div className="space-y-0.5 mt-auto">
                  {/* Dynamic Payday Badge if this is the Payday */}
                  {isPayday && (
                    <div
                      className="hidden sm:flex items-center gap-1 px-1 py-0.5 rounded text-[9px] font-mono font-semibold truncate border bg-emerald-50 border-emerald-300 text-emerald-900"
                      title={`Monthly Salary Credited (${formatINR(profile.monthlySalary || 75000)})`}
                    >
                      <span className="shrink-0">⭐</span>
                      <span className="truncate">Payday</span>
                      <span className="ml-auto font-bold shrink-0">
                        ₹{Math.round((profile.monthlySalary || 75000) / 1000)}k
                      </span>
                    </div>
                  )}
                  {dayEvents.map((evt) => {
                    const cfg = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.birthday;
                    return (
                      <div
                        key={evt.id}
                        className={`hidden sm:flex items-center gap-1 px-1 py-0.5 rounded text-[9px] font-mono font-semibold truncate border ${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText}`}
                        title={`${evt.title} (${formatINR(evt.budget)})`}
                      >
                        <span className="shrink-0">{cfg.emoji}</span>
                        <span className="truncate">{evt.title.split(" ")[0]}</span>
                        <span className="ml-auto font-bold shrink-0">₹{(evt.budget / 1000).toFixed(evt.budget % 1000 === 0 ? 0 : 1)}k</span>
                      </div>
                    );
                  })}

                  {/* Mobile Dot Indicators */}
                  <div className="flex sm:hidden items-center gap-1 justify-center pt-0.5">
                    {hasAutoPay && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    {hasPersonal && <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                    {hasPreLocked && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    {isPayday && <span className="text-[9px] text-amber-500 leading-none">⭐</span>}
                  </div>
                </div>

                {/* Pre-Lock Shield Icon Indicator */}
                {hasPreLocked && (
                  <div
                    className="absolute top-1 right-1 sm:top-1 sm:right-1 hidden sm:block text-emerald-600"
                    title="Ring-Fenced Event Shield Active"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Selected Date Detail Drawer / Events List */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {selectedDateLabel}
            </span>
            <span className="text-xs text-slate-500">
              {selectedDateEvents.length} scheduled item{selectedDateEvents.length === 1 ? "" : "s"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => openAddModalForDate(selectedDateStr)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule on this date</span>
          </button>
        </div>

        {selectedDateEvents.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-1">
            No bills or life events scheduled for this day. Free flow cash day!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {selectedDateEvents.map((evt) => {
              const cfg = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.birthday;
              const isAutoPay = evt.category === "autopay";
              const collision = checkCollisionForDate(evt.date);

              return (
                <div
                  key={evt.id}
                  className={`p-3 rounded-xl bg-white border shadow-2xs flex flex-col justify-between gap-2.5 transition-all ${
                    evt.isPaid
                      ? "border-slate-200 opacity-60 bg-slate-50/50"
                      : evt.isPreLocked
                      ? "border-emerald-300 ring-1 ring-emerald-400/20"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-sm ${cfg.badgeBg} ${cfg.badgeBorder}`}>
                        {cfg.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {evt.title}
                          </h4>
                          {evt.isPaid && (
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              Paid / Settled
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 block">
                          {cfg.label} {evt.notes ? `• ${evt.notes}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 block">
                        {formatINR(evt.budget)}
                      </span>
                      {evt.isPreLocked && !evt.isPaid && (
                        <span className="text-[10px] font-mono text-emerald-700 font-bold">
                          Pre-Locked
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Standout Feature B: Bill-Week Collision Alert on the event card */}
                  {!isAutoPay && collision && !evt.isPaid && (
                    <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5 leading-snug animate-fade-in">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Heads up:</strong> {collision.billTitle} is {collision.timingLabel}—keep ₹{collision.dueCardDues.toLocaleString('en-IN')} reserved.
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                    {!isAutoPay ? (
                      <>
                        <button
                          type="button"
                          onClick={() => togglePreLock(evt.id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                            evt.isPreLocked
                              ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                          title="Ring-Fenced Event Shield toggle"
                        >
                          {evt.isPreLocked ? <Lock className="w-3 h-3 text-emerald-600" /> : <Unlock className="w-3 h-3 text-slate-400" />}
                          <span>{evt.isPreLocked ? "Shield: Pre-Locked" : "Pre-Lock Off"}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {!evt.isPaid && (
                            <button
                              type="button"
                              onClick={() => {
                                markEventPaid(evt.id);
                                setToastMessage(`✓ Marked "${evt.title}" as Paid & settled!`);
                                setTimeout(() => setToastMessage(null), 3500);
                              }}
                              className="px-2 py-1 rounded-md text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 transition-colors shadow-2xs"
                            >
                              Mark Paid / Done
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteCalendarEvent(evt.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Remove event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 w-full justify-between">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          Auto-Debited on Due Date
                        </span>
                        <span className="text-emerald-700 font-bold">AutoPay Synced</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Standout Feature A — "Ring-Fenced Event Shield" Summary Strip at Bottom */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-50/90 via-emerald-50/50 to-slate-50 border border-emerald-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-900 tracking-tight">
                {formatINR(totalRingFencedAmount)} Ring-Fenced for {ringFencedEvents.length} Upcoming Event{ringFencedEvents.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Deducted from Safe Pool so gift &amp; party money isn&apos;t accidentally spent on food delivery days earlier.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="font-mono text-left sm:text-right pr-2 border-r border-slate-200 hidden md:block">
            <span className="text-[10px] text-slate-400 block uppercase">Net Safe Pool</span>
            <span className="text-xs font-bold text-emerald-700">
              {formatINR(netSafeCashPool)}
            </span>
          </div>

          {ringFencedEvents.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const target = ringFencedEvents[0];
                if (target) {
                  markEventPaid(target.id);
                  setToastMessage(`✓ Marked "${target.title}" as Paid & settled!`);
                  setTimeout(() => setToastMessage(null), 3500);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs transition-colors"
              title="Mark closest upcoming event as settled"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark Paid / Done</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-mono shadow-2xl animate-slide-up-mobile flex items-center gap-2 border border-slate-700">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 6. + Add Event Modal / Drawer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex sm:items-center sm:justify-center items-end p-0 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:max-w-md bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh] animate-slide-up-mobile sm:animate-fade-in">
            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    Schedule Upcoming Life Event
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ring-fence budget before daily impulse spending starts
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEvent} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              {/* Field 1: Category Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Event Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["birthday", "wedding", "party", "autopay"] as CalendarEventCategory[]).map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const isSelected = formCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setFormCategory(cat);
                          if (cat === "autopay") setFormPreLock(false);
                          else setFormPreLock(true);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? `${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText} shadow-2xs ring-1 ring-purple-400/30`
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/70"
                        }`}
                      >
                        <span className="text-base">{cfg.emoji}</span>
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 2: Event Title & Date */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Aarav's Birthday Gift & Dinner"
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[42px]"
                  />

                  {/* Suggestion Chips */}
                  <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                    {["Aarav's Birthday", "Wedding Gift", "Weekend Team Outing", "Concert Pass"].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setFormTitle(chip)}
                        className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 font-mono transition-colors"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[42px]"
                  />
                </div>
              </div>

              {/* Field 3: Planned Budget (₹) with 9-digit restriction */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Planned Budget (₹)
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formBudget.length}/9 digits
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs font-bold">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={9}
                    required
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="2500"
                    className="w-full pl-8 pr-3.5 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-emerald-500 transition-colors min-h-[42px]"
                  />
                </div>

                {/* Quick Budget Chips */}
                <div className="flex items-center gap-1.5 pt-1.5">
                  {["1000", "2500", "5000", "10000"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setFormBudget(b)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 font-mono transition-colors"
                    >
                      ₹{parseInt(b).toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Standout Feature B: Bill-Week Collision Alert Banner */}
              {activeFormCollision && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-fade-in shadow-2xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 leading-snug">
                    <strong className="block font-bold">Bill-Week Collision Warning</strong>
                    <span>
                      Heads up: {activeFormCollision.billTitle} is {activeFormCollision.timingLabel}—keep ₹{activeFormCollision.dueCardDues.toLocaleString('en-IN')} reserved.
                    </span>
                  </div>
                </div>
              )}

              {/* Standout Feature A: Pre-Lock from Safe Pool Toggle */}
              {formCategory !== "autopay" && (
                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start justify-between gap-3 shadow-2xs">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <strong className="text-xs font-bold text-emerald-950">
                        Pre-Lock from Safe Pool (Ring-Fenced Shield)
                      </strong>
                    </div>
                    <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                      Immediately reserves ₹{parseInt(formBudget || "0", 10).toLocaleString('en-IN')} out of your Safe Pool so you don&apos;t accidentally spend it on daily cravings.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormPreLock(!formPreLock)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formPreLock ? "bg-emerald-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formPreLock ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  className="w-full py-3 sm:py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition-all min-h-[46px] active:scale-98"
                >
                  <Shield className="w-4 h-4" />
                  <span>Protect &amp; Schedule Event</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
