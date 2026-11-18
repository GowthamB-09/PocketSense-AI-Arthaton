import {
  ImpulseCheckRequest,
  ImpulseVerdict,
  FinancialMemoryProfile,
  SmsParseResult,
  SpendingType,
  TransactionCategory,
} from "@/types";

/**
 * Heuristic parser for Indian UPI, NetBanking & Credit Card SMS alerts
 * Designed for young working professionals (HDFC, ICICI, Axis, SBI, Cred, GPay, PhonePe)
 */
export function parseSmsHeuristically(smsText: string): SmsParseResult {
  const clean = smsText.trim();

  // 1. Extract Amount
  let amount = 0;
  const amountMatch = clean.match(/(?:(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?))|(?:\bdebited by\s*([\d,]+(?:\.\d{1,2})?))/i);
  if (amountMatch) {
    const rawNum = (amountMatch[1] || amountMatch[2]).replace(/,/g, "");
    amount = parseFloat(rawNum);
  } else {
    const fallbackNumMatch = clean.match(/\b(\d{2,6}(?:\.\d{1,2})?)\b/);
    if (fallbackNumMatch) {
      amount = parseFloat(fallbackNumMatch[1]);
    }
  }

  // 2. Extract UPI Reference / Transaction ID
  let upiRef = "";
  const upiMatch = clean.match(/(?:UPI(?:\s*Ref)?[:\s/]*|Ref(?:\s*No)?[:\s/]*|Txn(?:\s*Id)?[:\s/]*|rrn[:\s/]*)([0-9a-zA-Z]{6,16})/i);
  if (upiMatch) {
    upiRef = upiMatch[1];
  } else {
    upiRef = "UPI" + Math.floor(1000000000 + Math.random() * 9000000000);
  }

  // 3. Extract Bank / App
  let bank = "Card / UPI";
  if (/HDFC/i.test(clean)) bank = "HDFC Bank";
  else if (/ICICI/i.test(clean)) bank = "ICICI Bank";
  else if (/Axis/i.test(clean)) bank = "Axis Bank";
  else if (/SBI|State Bank/i.test(clean)) bank = "SBI";
  else if (/Cred/i.test(clean)) bank = "Cred UPI";
  else if (/GPay|Google Pay/i.test(clean)) bank = "Google Pay";
  else if (/PhonePe/i.test(clean)) bank = "PhonePe";
  else if (/Paytm/i.test(clean)) bank = "Paytm";

  // 4. Extract Merchant Name
  let merchant = "Merchant Payment";
  const toMatch = clean.match(/(?:(?:paid to|sent to|transferred to|to|for|at)\s+([A-Za-z0-9\s&'.-]{3,35}))(?:\s+(?:on|via|ref|using|avl|upi|from)|\.|$)/i);
  if (toMatch && toMatch[1]) {
    merchant = toMatch[1].trim();
  } else if (/toit/i.test(clean)) {
    merchant = "Toit Brewery";
  } else if (/blue tokai/i.test(clean)) {
    merchant = "Blue Tokai Coffee";
  } else if (/third wave/i.test(clean)) {
    merchant = "Third Wave Coffee";
  } else if (/zepto/i.test(clean)) {
    merchant = "Zepto";
  } else if (/blinkit/i.test(clean)) {
    merchant = "Blinkit";
  } else if (/swiggy/i.test(clean)) {
    merchant = "Swiggy";
  } else if (/zomato/i.test(clean)) {
    merchant = "Zomato";
  } else if (/zara/i.test(clean)) {
    merchant = "Zara India";
  } else if (/cult\.fit/i.test(clean)) {
    merchant = "Cult.fit";
  }

  merchant = merchant
    .replace(/(?:via|ref|on|upi|bank|a\/c|ending|avl|rs|inr).*/i, "")
    .trim();
  if (merchant.length < 2) merchant = "Merchant Transaction";

  // 5. Categorize and Classify Spending Type
  let category: TransactionCategory = "Dining & Social";
  let spendingType: SpendingType = "Impulse Want";
  let triggerTag: string | undefined = undefined;

  const lower = clean.toLowerCase();

  const isSalaryCredit = /(?:salary|credited.*salary|salary.*credited)/i.test(clean) ||
    (/(?:credited|deposited)/i.test(clean) && !/(?:debited|paid|withdrawn)/i.test(clean) && amount >= 25000);

  if (isSalaryCredit) {
    category = "Investments & SIPs";
    spendingType = "Survival Need";
    merchant = "Monthly Take-Home Salary";
  }
  // Rent & Fixed Utilities
  else if (
    lower.includes("rent") ||
    lower.includes("landlord") ||
    lower.includes("maintenance") ||
    lower.includes("electricity") ||
    lower.includes("bescom") ||
    lower.includes("cook") ||
    lower.includes("maid")
  ) {
    category = "Rent & Fixed Utilities";
    spendingType = "Survival Need";
  }
  // Investments & SIPs & FDs
  else if (
    lower.includes("sip") ||
    lower.includes("zerodha") ||
    lower.includes("groww") ||
    lower.includes("mutual fund") ||
    lower.includes("coin") ||
    lower.includes("nps") ||
    lower.includes("ppf") ||
    lower.includes("nifty 50") ||
    lower.includes("bse star") ||
    lower.includes("index fund") ||
    lower.includes("fixed deposit") ||
    lower.includes("fd no.")
  ) {
    category = "Investments & SIPs";
    spendingType = "Survival Need";
    if (lower.includes("fixed deposit") || lower.includes("fd no.")) {
      merchant = "Axis Bank Fixed Deposit (FD)";
    } else if (lower.includes("nifty 50") || lower.includes("index fund")) {
      merchant = "UTI Nifty 50 Index Fund SIP";
    }
  }
  // Credit Card Bill Dues
  else if (
    (lower.includes("total amt due") || lower.includes("total due") || lower.includes("min amt due")) &&
    lower.includes("card")
  ) {
    category = "Rent & Fixed Utilities";
    spendingType = "Survival Need";
    merchant = lower.includes("icici")
      ? "ICICI Amazon Pay Credit Card Bill"
      : "HDFC Millennia Credit Card Bill";
  }
  // Subscriptions & Cloud
  else if (
    lower.includes("auto-debit") ||
    lower.includes("apple.com/bill") ||
    lower.includes("netflix") ||
    lower.includes("spotify") ||
    lower.includes("chatgpt") ||
    lower.includes("youtube") ||
    lower.includes("prime") ||
    lower.includes("hotstar")
  ) {
    category = "Subscriptions & Cloud";
    spendingType = "Silent Subscription Leak";
    triggerTag = "auto-debit";
  }
  // Commute
  else if (
    lower.includes("uber") ||
    lower.includes("ola") ||
    lower.includes("fuel") ||
    lower.includes("petrol") ||
    lower.includes("fastag") ||
    lower.includes("metro")
  ) {
    category = "Commute & Rides";
    spendingType = amount > 800 ? "Impulse Want" : "Survival Need";
    triggerTag = "commute";
  }
  // Health & Wellness
  else if (
    lower.includes("cult") ||
    lower.includes("gym") ||
    lower.includes("pharmacy") ||
    lower.includes("apollo") ||
    lower.includes("doctor")
  ) {
    category = "Health & Wellness";
    spendingType = "Survival Need";
  }
  // Quick Commerce
  else if (
    lower.includes("zepto") ||
    lower.includes("blinkit") ||
    lower.includes("instamart")
  ) {
    category = "Quick Commerce & Groceries";
    spendingType = "Impulse Want";
    triggerTag = "quick-commerce";
  }
  // Specialty Coffee
  else if (
    lower.includes("coffee") ||
    lower.includes("blue tokai") ||
    lower.includes("third wave") ||
    lower.includes("starbucks")
  ) {
    category = "Dining & Social";
    spendingType = "Impulse Want";
    triggerTag = "specialty-coffee";
  }
  // Shopping & Fashion
  else if (
    lower.includes("zara") ||
    lower.includes("h&m") ||
    lower.includes("myntra") ||
    lower.includes("uniqlo") ||
    lower.includes("amazon")
  ) {
    category = "Shopping & Gear";
    spendingType = "Impulse Want";
    triggerTag = "lifestyle-creep";
  }
  // Dining & Social
  else if (
    lower.includes("toit") ||
    lower.includes("brewery") ||
    lower.includes("swiggy") ||
    lower.includes("zomato") ||
    lower.includes("bistro") ||
    lower.includes("bar") ||
    lower.includes("pub")
  ) {
    category = "Dining & Social";
    spendingType = "Impulse Want";
    triggerTag = "weekend-hangout";
  }

  // 6. Extract Date
  let date = new Date().toISOString().split("T")[0];
  const dateMatch = clean.match(/(\d{1,2})[-/]([A-Za-z]{3}|\d{1,2})[-/](\d{2,4})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, "0");
    const month = dateMatch[2];
    const year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3];
    const monthMap: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const resolvedMonth = monthMap[month.toLowerCase()] || month.padStart(2, "0");
    date = `${year}-${resolvedMonth}-${day}`;
  }

  const isFixedCommitment = !isSalaryCredit && (category === "Rent & Fixed Utilities" || category === "Investments & SIPs");

  return {
    merchant,
    amount,
    date,
    category,
    spendingType,
    upiRef,
    bank,
    triggerTag,
    confidenceScore: 0.95,
    explanation: isSalaryCredit
      ? "Identified monthly salary credit — ready to set budget income."
      : `Classified as ${spendingType} (${category}) based on professional spending pattern.`,
    rawText: smsText,
    isSalaryCredit: !!isSalaryCredit,
    isFixedCommitment: !!isFixedCommitment,
  };
}

/**
 * Personal Finance Behavioral Coach Advice for Young Working Professionals (24–30)
 */
export function generateHeuristicCoachAdvice(
  req: ImpulseCheckRequest,
  profile: FinancialMemoryProfile,
  dailySafe: number,
  daysLeft: number
): ImpulseVerdict {
  const amount = req.amount;
  const merchant = req.merchant.trim();

  const primaryGoal = profile.goals[0] || {
    id: "goal_japan_trip",
    title: "Japan Spring Trip",
    targetAmount: 150000,
    currentAmount: 68000,
  };

  const daysBurned = Math.round((amount / Math.max(dailySafe, 1)) * 10) / 10;
  const newDailySafe = Math.max(0, Math.round(((dailySafe * daysLeft) - amount) / daysLeft));
  const dailyReduction = Math.max(0, dailySafe - newDailySafe);

  let verdict: "APPROVED" | "CAUTION" | "DENIED" = "CAUTION";
  let headline = "";
  let responseText = "";
  const smartHacks: string[] = [];
  const recalledMemories: string[] = [
    `Current Daily Safe-to-Spend: ₹${dailySafe}/day`,
    `Days left in month: ${daysLeft} days`,
    `Active Goal: ${primaryGoal.title} (₹${profile.goals[0]?.currentAmount || 68000} / ₹${primaryGoal.targetAmount})`,
  ];

  if (amount > dailySafe * 2.5) {
    verdict = "DENIED";
    headline = `🚨 Hold off: Spending ₹${amount} consumes ${daysBurned} days of your discretionary runway.`;
    responseText = `You currently have ₹${Math.round(dailySafe * daysLeft)} left in your discretionary pool for the next ${daysLeft} days (₹${dailySafe}/day).\n\nSpending ₹${amount} on ${merchant} right now forces your daily safe limit down to ₹${newDailySafe}/day.\n\nThat ₹${amount} is ${Math.round((amount / primaryGoal.targetAmount) * 100)}% of your **${primaryGoal.title}** goal jar. Skip this unbudgeted impulse, redirect it to your goal jar, and protect your month-end cash flow.`;

    smartHacks.push("Enforce a 48-hour cooling-off period before completing this purchase.");
    smartHacks.push("Ask yourself if this expenditure compounds your long-term wealth or is temporary lifestyle creep.");
    smartHacks.push("Use the 'Skip & Save' button to immediately fund your Goal Jar.");
    recalledMemories.push("Trigger Matched: High-ticket impulse (>2.5x daily discretionary headroom)");
  } else if (amount > dailySafe) {
    verdict = "CAUTION";
    headline = `⚠️ Caution: ₹${amount} absorbs ${daysBurned} days of your daily buffer.`;
    responseText = `This spend is manageable, but requires attention. At ₹${amount}, ${merchant} exceeds your single-day safe limit of ₹${dailySafe}/day.\n\nIf you proceed, your daily limit for the remaining ${daysLeft} days tightens to ₹${newDailySafe}/day.`;

    smartHacks.push(`Cap your share strictly at ₹${Math.round(dailySafe * 0.8)}.`);
    smartHacks.push("Offset by preparing meals at home for the next 2 days.");
    recalledMemories.push("Runway Notice: Tightens daily headroom");
  } else {
    verdict = "APPROVED";
    headline = `✅ Approved: ₹${amount} fits comfortably within your ₹${dailySafe}/day runway.`;
    responseText = `Green light. At ₹${amount}, ${merchant} is completely sustainable within today's ₹${dailySafe} budget. You retain ₹${newDailySafe} in safe buffer for the remainder of the day without touching your ${primaryGoal.title} savings.`;

    smartHacks.push("Log the transaction immediately to keep your discipline streak active.");
  }

  return {
    verdict,
    headline,
    coachResponse: responseText,
    budgetImpactDays: daysBurned,
    dailySafeReduction: dailyReduction,
    opportunityCostGoal: {
      goalId: primaryGoal.id,
      goalTitle: primaryGoal.title,
      delayDays: Math.ceil(amount / Math.max(dailySafe, 100)),
      equivalentMilestone: `${Math.round((amount / primaryGoal.targetAmount) * 100)}% of your ${primaryGoal.title} target`,
    },
    smartHacks,
    recalledMemories,
  };
}
