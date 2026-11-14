import {
  ImpulseCheckRequest,
  ImpulseVerdict,
  FinancialMemoryProfile,
  SmsParseResult,
  SpendingType,
  TransactionCategory,
} from "@/types";

/**
 * Local heuristic parser for Indian UPI & Bank SMS alerts
 * Extremely robust fallback that handles HDFC, SBI, ICICI, Axis, Paytm, PhonePe, GPay
 */
export function parseSmsHeuristically(smsText: string): SmsParseResult {
  const clean = smsText.trim();

  // 1. Extract Amount
  // Matches: "Rs. 40.00", "INR 199", "₹ 280", "Rs 450", "40.00"
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

  // 2. Extract UPI Reference
  let upiRef = "";
  const upiMatch = clean.match(/(?:UPI(?:\s*Ref)?[:\s/]*|Ref(?:\s*No)?[:\s/]*|Txn(?:\s*Id)?[:\s/]*|rrn[:\s/]*)([0-9a-zA-Z]{6,16})/i);
  if (upiMatch) {
    upiRef = upiMatch[1];
  } else {
    upiRef = "UPI" + Math.floor(1000000000 + Math.random() * 9000000000);
  }

  // 3. Extract Bank / App
  let bank = "UPI Payment";
  if (/HDFC/i.test(clean)) bank = "HDFC Bank";
  else if (/SBI|State Bank/i.test(clean)) bank = "State Bank of India";
  else if (/ICICI/i.test(clean)) bank = "ICICI Bank";
  else if (/Axis/i.test(clean)) bank = "Axis Bank";
  else if (/Kotak/i.test(clean)) bank = "Kotak Mahindra Bank";
  else if (/Paytm/i.test(clean)) bank = "Paytm Payments Bank";
  else if (/PhonePe/i.test(clean)) bank = "PhonePe UPI";
  else if (/GPay|Google Pay/i.test(clean)) bank = "Google Pay";

  // 4. Extract Merchant Name
  let merchant = "Local Merchant";
  const toMatch = clean.match(/(?:(?:paid to|sent to|transferred to|to|for|at)\s+([A-Za-z0-9\s&'.-]{3,35}))(?:\s+(?:on|via|ref|using|avl|upi|from)|\.|$)/i);
  if (toMatch && toMatch[1]) {
    merchant = toMatch[1].trim();
  } else if (/swiggy/i.test(clean)) {
    merchant = "Swiggy";
  } else if (/zomato/i.test(clean)) {
    merchant = "Zomato";
  } else if (/blinkit/i.test(clean)) {
    merchant = "Blinkit";
  } else if (/zepto/i.test(clean)) {
    merchant = "Zepto";
  } else if (/spotify/i.test(clean)) {
    merchant = "Spotify India";
  } else if (/youtube/i.test(clean)) {
    merchant = "YouTube Premium";

  }

  // Clean merchant name from trailing noise
  merchant = merchant
    .replace(/(?:via|ref|on|upi|bank|a\/c|ending|avl|rs|inr).*/i, "")
    .trim();
  if (merchant.length < 2) merchant = "Campus Merchant";

  // 5. Categorize and Classify Spending Type
  let category: TransactionCategory = "Food & Dining";
  let spendingType: SpendingType = "Impulse Want";
  let triggerTag: string | undefined = undefined;

  const lower = clean.toLowerCase();

  // Check Subscriptions first
  if (
    lower.includes("auto-debit") ||
    lower.includes("standing instruction") ||
    lower.includes("mandate") ||
    lower.includes("spotify") ||
    lower.includes("netflix") ||
    lower.includes("youtube") ||
    lower.includes("prime") ||
    lower.includes("hotstar") ||
    lower.includes("apple.com/bill")
  ) {
    category = "Entertainment & Subscriptions";
    spendingType = "Silent Subscription Leak";
    triggerTag = "auto-debit";
  }
  // Check Academic / Essentials
  else if (
    lower.includes("mess") ||
    lower.includes("canteen") ||
    lower.includes("xerox") ||
    lower.includes("photostat") ||
    lower.includes("stationery") ||
    lower.includes("exam") ||
    lower.includes("lab manual") ||
    lower.includes("hostel fee")
  ) {
    category = "Academic & Utilities";
    spendingType = "Survival Need";
    triggerTag = "academic";
  }
  // Check Commute
  else if (
    lower.includes("metro") ||
    lower.includes("dmrc") ||
    lower.includes("bmrc") ||
    lower.includes("bus") ||
    lower.includes("rapido") ||
    lower.includes("uber") ||
    lower.includes("ola") ||
    lower.includes("auto")
  ) {
    category = "Transit & Commute";
    spendingType = amount <= 150 ? "Survival Need" : "Impulse Want";
    triggerTag = "commute";
  }
  // Check Pharmacy / Health
  else if (
    lower.includes("pharmacy") ||
    lower.includes("apollo") ||
    lower.includes("meds") ||
    lower.includes("doctor") ||
    lower.includes("chemist")
  ) {
    category = "Personal Care & Health";
    spendingType = "Survival Need";
  }
  // Check Chai / Tapri Micropayments
  else if (
    lower.includes("chai") ||
    lower.includes("tea") ||
    lower.includes("tapri") ||
    lower.includes("cutting") ||
    (amount <= 60 && lower.includes("ramesh"))
  ) {
    category = "Food & Dining";
    spendingType = "Impulse Want";
    triggerTag = "chai-tapri";
  }
  // Late night cravings
  else if (
    lower.includes("swiggy") ||
    lower.includes("zomato") ||
    lower.includes("blinkit") ||
    lower.includes("zepto") ||
    lower.includes("mcdonald") ||
    lower.includes("burger") ||
    lower.includes("pizza")
  ) {
    category = "Food & Dining";
    spendingType = "Impulse Want";
    if (
      lower.includes("23:") ||
      lower.includes("00:") ||
      lower.includes("01:") ||
      lower.includes("02:") ||
      lower.includes("night")
    ) {
      triggerTag = "late-night";
    }
  } else if (lower.includes("split") || lower.includes("roomie") || lower.includes("kabir") || lower.includes("rohit")) {
    category = "Peer Transfers & Splits";
    spendingType = "Impulse Want";
    triggerTag = "weekend-fomo";
  }

  // 6. Extract Date
  let date = new Date().toISOString().split("T")[0];
  const dateMatch = clean.match(/(\d{1,2})[-/]([A-Za-z]{3}|\d{1,2})[-/](\d{2,4})/);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, "0");
    const month = dateMatch[2];
    const year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3];
    // Map month names
    const monthMap: Record<string, string> = {
      jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
      jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const resolvedMonth = monthMap[month.toLowerCase()] || month.padStart(2, "0");
    date = `${year}-${resolvedMonth}-${day}`;
  }

  return {
    merchant,
    amount,
    date,
    category,
    spendingType,
    upiRef,
    bank,
    triggerTag,
    confidenceScore: 0.94,
    explanation: `Classified as ${spendingType} (${category}) based on merchant profile and transaction pattern.`,
    rawText: smsText,
  };
}

/**
 * Heuristic College Senior AI Impulse Interceptor
 * Witty, culturally resonant Indian college senior tone ("Senior Bhai/Didi")
 */
export function generateHeuristicSeniorAdvice(
  req: ImpulseCheckRequest,
  profile: FinancialMemoryProfile,
  dailySafe: number,
  daysLeft: number
): ImpulseVerdict {
  const amount = req.amount;
  const merchant = req.merchant.trim();
  const lowerMerchant = merchant.toLowerCase();

  // Primary active goal to compare against
  const primaryGoal = profile.goals[0] || {
    id: "goal_goa",
    title: "Goa Semester-End Trip",
    targetAmount: 8000,
    currentAmount: 3200,
  };

  const daysOfBudgetBurned = Math.round((amount / Math.max(dailySafe, 1)) * 10) / 10;
  const newDailySafe = Math.max(0, Math.round(((dailySafe * daysLeft) - amount) / daysLeft));
  const dailyReduction = Math.max(0, dailySafe - newDailySafe);

  // Verdict determination
  let verdict: "APPROVED" | "CAUTION" | "DENIED" = "CAUTION";
  let headline = "";
  let responseText = "";
  const smartHacks: string[] = [];
  const recalledMemories: string[] = [
    `Current Daily Safe-to-Spend: ₹${dailySafe}/day`,
    `Days left in month: ${daysLeft} days`,
    `Active Goal: ${primaryGoal.title} (₹${primaryGoal.currentAmount}/₹${primaryGoal.targetAmount})`,
  ];

  // Specific triggers
  const isFoodDelivery = /swiggy|zomato|burger|pizza|biryani|blinkit|zepto/i.test(lowerMerchant);
  const isChaiTapri = /chai|tea|tapri|cutting/i.test(lowerMerchant);
  const isWeekendSplits = /dinner|drinks|party|cafe|starbucks|ccd|club/i.test(lowerMerchant);
  const isShopping = /sneakers|shoes|hoodie|zara|myntra|amazon|keyboard/i.test(lowerMerchant);

  if (amount > dailySafe * 3) {
    verdict = "DENIED";
    headline = `🚨 Hold up, Bhai! Spending ₹${amount} will crush your next ${daysOfBudgetBurned} days.`;
    responseText = `Listen to your senior for 2 minutes. You have only ₹${Math.round(dailySafe * daysLeft)} left for the next ${daysLeft} days (that's just ₹${dailySafe}/day!).\n\nDropping ₹${amount} on ${merchant} right now will slice your daily allowance down to ₹${newDailySafe}/day. That means starting tomorrow, you can't even afford a hostel canteen thali and transit without borrowing from friends.\n\nPlus, that ₹${amount} is literally ${Math.round((amount / primaryGoal.targetAmount) * 100)}% of your **${primaryGoal.title}** jar! Skip this impulse, dump the ₹${amount} into your goal jar, and thank yourself on Day 25.`;

    smartHacks.push(`Go drink a glass of water and wait 15 minutes before scanning that QR.`);
    smartHacks.push(`If it's food: Raid your roommate's Maggi stash or eat hostel mess dinner.`);
    smartHacks.push(`If it's shopping: Add to cart, but enforce the 48-Hour Cool-Off rule.`);

    recalledMemories.push(`Trigger Matched: High-ticket impulse (>3x daily safe budget)`);
  } else if (amount > dailySafe) {
    verdict = "CAUTION";
    headline = `⚠️ Tread lightly: ₹${amount} eats up ${daysOfBudgetBurned} days of your buffer.`;
    responseText = `Bhai, this isn't an outright disaster, but it's dangerous territory. Your daily safe limit is ₹${dailySafe}. Spending ₹${amount} on ${merchant} eats more than a full day's runway.\n\nIf you really must do this, can you negotiate it down? E.g., don't order drinks, or split the bill three ways instead of paying for the whole table?`;

    smartHacks.push(`Cap your share strictly at ₹${Math.round(dailySafe * 0.8)}.`);
    smartHacks.push(`Skip tomorrow's evening snack run to balance the scale.`);
    
    recalledMemories.push(`Memory Alert: Frequent weekend splits drain your allowance before the 18th.`);
  } else {
    verdict = "APPROVED";
    headline = `✅ Safe to Scan! ₹${amount} is well within your ₹${dailySafe}/day boundary.`;
    responseText = `Green light, junior! ₹${amount} for ${merchant} is completely manageable. You'll still have ₹${newDailySafe} left for today without touching your ${primaryGoal.title} savings.\n\nEnjoy it guilt-free, just don't let it turn into a multi-round habit today!`;

    smartHacks.push(`Log the UPI SMS right after paying to keep your discipline streak alive.`);
  }

  // Add specific memory triggers
  if (isFoodDelivery) {
    recalledMemories.push(`Recalled Trap: "Midnight Delivery Syndrome" (avg ₹310 burn/order)`);
  }
  if (isChaiTapri) {
    recalledMemories.push(`Recalled Trap: "The 'Only ₹40' Tapri Blindspot" (24x/month = ₹1,080)`);
  }
  if (isWeekendSplits) {
    recalledMemories.push(`Vulnerability Zone: Friday & weekend hostel peer splits`);
  }

  return {
    verdict,
    headline,
    seniorBhaiResponse: responseText,
    budgetImpactDays: daysOfBudgetBurned,
    dailySafeReduction: dailyReduction,
    opportunityCostGoal: {
      goalId: primaryGoal.id,
      goalTitle: primaryGoal.title,
      delayDays: Math.ceil(amount / Math.max(dailySafe, 50)),
      equivalentMilestone: `${Math.round((amount / primaryGoal.targetAmount) * 100)}% of your ${primaryGoal.title} target`,
    },
    smartSeniorHacks: smartHacks,
    recalledMemories,
  };
}

