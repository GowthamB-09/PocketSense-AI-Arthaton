/**
 * PocketSense AI - Beginner-Friendly Money Coach Engine
 * 
 * Strict Behavioral Rules:
 * 1. "Friend-Texting-You" Structure:
 *    - 1-Line Direct Answer (Bold): Starts with "Yes", "No", or "Wait—do this instead"
 *    - 2–3 Ultra-Short Bullet Points: Max 12 words each, simple analogies (FD = "safe bank lockbox", Index Fund = "top 50 companies")
 *    - 1 Concrete Next Step: Exact ₹ numbers (₹75k salary, ₹30,592 pool, active jars)
 * 2. Ban All Finance Jargon (Auto-Translator)
 * 3. "Explain Even Simpler (1 Sentence)" quick-toggle support
 */

export interface CoachAnswer {
  id: string;
  question: string;
  category: "dinner" | "investing" | "banking" | "cards" | "goals" | "shopping" | "general";
  directAnswer: string;
  bulletPoints: string[];
  actionPill: string;
  actionTone: "green" | "amber" | "rose" | "blue";
  concreteAction: string;
  simplerOneLiner: string;
}

/**
 * Auto-Translator: Replaces heavy finance jargon with ultra-short 1-to-2 word everyday synonyms
 */
export function translateFinanceJargon(text: string): string {
  if (!text) return "";
  return text
    .replace(/\bdiscretionary\b/gi, "Extra Spend")
    .replace(/\bcommitted obligations\b|\bfixed obligations\b|\bcommitted\b/gi, "Fixed Bills")
    .replace(/\brunway\b/gi, "Cash Left")
    .replace(/\bpacing\b/gi, "Spend Speed")
    .replace(/\bliquid \/ arbitrage fund\b|\barbitrage fund\b|\bliquid fund\b/gi, "Instant Safe")
    .replace(/\binflation hedge\b|\binflation\b/gi, "Price Rise")
    .replace(/\basset allocation\b|\bdiversification\b|\bdiversify\b/gi, "Money Mix")
    .replace(/\bvolatility\b|\bvolatile\b/gi, "Price Swings")
    .replace(/\bcompounding\b|\bcompound\b/gi, "Growth")
    .replace(/\be-mandate\b/gi, "Auto-Save")
    .replace(/\bcorpus\b/gi, "Total Saved")
    .replace(/\bprincipal\b/gi, "Base Cash")
    .replace(/\bliquidity\b/gi, "Quick Cash")
    .replace(/\bp\.a\.\b|\byield\b/gi, "/ yr")
    .replace(/\bexpense ratio\b/gi, "fund fee")
    .replace(/\bdepreciation\b/gi, "falling rupee value");
}

/**
 * Pre-computed catalog of high-impact beginner questions
 * Uses actual PocketSense student/young professional numbers:
 * - Monthly Take-Home Salary: ₹75,000
 * - Total Safe Pool Remaining: ₹30,592 (17 days to payday)
 * - Credit Card Dues: ₹17,908 (ICICI + HDFC)
 * - Active Goal Jars: New iPhone (₹42k/₹80k), 24K Gold (₹68k/₹120k), Headphones (₹14.5k/₹22k)
 */
export const PRESET_COACH_QUESTIONS: CoachAnswer[] = [
  {
    id: "afford_dinner",
    question: "Can I afford a ₹3,000 dinner?",
    category: "dinner",
    directAnswer: "Wait—do this instead: cap tonight at ₹1,200.",
    bulletPoints: [
      "You have ₹30,592 left in your safe pool for 17 days.",
      "Spending ₹3,000 burns 2 full days of safe spending.",
      "A ₹1,200 dinner keeps your weekend fun without guilt."
    ],
    concreteAction: "Spend ₹1,200 tonight and sweep the ₹1,800 you saved straight into your New iPhone jar!",
    actionPill: "Cap dinner at ₹1,200 & sweep ₹1,800 to iPhone",
    actionTone: "amber",
    simplerOneLiner: "You have the cash, but spending ₹3,000 delays your iPhone goal by 6 days—spend ₹1,200 instead and pocket ₹1,800."
  },
  {
    id: "sip_vs_fd_iphone",
    question: "SIP vs FD—which is better for my iPhone goal?",
    category: "goals",
    directAnswer: "Use an FD for your iPhone—never a stock market SIP.",
    bulletPoints: [
      "An FD is a safe bank lockbox with zero risk of dropping.",
      "Stock SIPs have market ups and downs; they need 3+ years.",
      "Your iPhone purchase is in October—keep that cash 100% safe."
    ],
    concreteAction: "Keep your ₹42,000 iPhone savings in Instant Safe (~6.8% / yr) so every rupee is safe.",
    actionPill: "Lock ₹42,000 in Instant Safe",
    actionTone: "green",
    simplerOneLiner: "Because you're buying the iPhone in a few months, use a safe bank lockbox (FD) so market drops can't touch your money."
  },
  {
    id: "cash_in_bank",
    question: "Why shouldn't I keep cash in my bank?",
    category: "banking",
    directAnswer: "No—money sitting in your primary UPI account gets spent fast.",
    bulletPoints: [
      "When cash sits in your bank, you see it and tap-to-pay.",
      "Normal accounts pay only ~2.8%, losing value as grocery prices rise.",
      "Out-of-sight vaults keep your money hidden from impulse QR scans."
    ],
    concreteAction: "Keep ₹10,000 for daily UPI and sweep your idle ₹38,500 into your Safe Growth Vaults.",
    actionPill: "Move idle ₹38,500 into Out-of-Sight Vaults",
    actionTone: "amber",
    simplerOneLiner: "If you can see the money in your UPI app, you will spend it—hide it in safe vaults where it grows silently."
  },
  {
    id: "card_dues_vs_invest",
    question: "Should I clear my ₹17,908 card dues or invest?",
    category: "cards",
    directAnswer: "Pay off your ₹17,908 credit card bill immediately—zero debate.",
    bulletPoints: [
      "Credit cards charge a brutal 42% yearly interest penalty.",
      "India's top 50 stock funds average only ~12% a year.",
      "Paying your card bill gives an instant, guaranteed 42% win."
    ],
    concreteAction: "Use your ₹75,000 salary balance to pay the ₹17,908 card dues today to avoid any penalties.",
    actionPill: "Pay ₹17,908 Card Dues Today",
    actionTone: "green",
    simplerOneLiner: "Credit cards charge 42% interest, so clearing your ₹17,908 bill beats every investment on earth."
  },
  {
    id: "iphone_october_wait",
    question: "Why wait until October to buy the iPhone?",
    category: "goals",
    directAnswer: "Wait 6 weeks until October—you'll pocket ₹11,000 in discounts.",
    bulletPoints: [
      "Apple announces new phones in September every single year.",
      "October Diwali festive sales discount older flagships by 12% to 18%.",
      "You have saved ₹42,000 of ₹80,000; waiting lets you finish funding."
    ],
    concreteAction: "Keep auto-saving ₹4,500/month until October and buy it during festive sales for ~₹69,000.",
    actionPill: "Wait for October Festive Sale & Save ₹11,000",
    actionTone: "green",
    simplerOneLiner: "Waiting until October's Diwali sales saves you ₹11,000 cash on the exact same ₹80,000 iPhone."
  },
  {
    id: "gold_vs_inflation",
    question: "How does 24K Gold beat price rises?",
    category: "investing",
    directAnswer: "Yes—24K Gold protects your money as prices get more expensive.",
    bulletPoints: [
      "Gold acts like an armor shield when rupee buying power weakens.",
      "It has grown ~10% yearly over decades without complicated paperwork.",
      "Buying small micro-amounts monthly keeps you from timing the market."
    ],
    concreteAction: "Split your ₹5,000 Friday AutoPay so ₹2,000 buys digital gold while your ₹68,000 gold jar grows.",
    actionPill: "Auto-Buy ₹2,000 Digital Gold on Friday",
    actionTone: "green",
    simplerOneLiner: "Gold keeps your hard-earned money from losing its buying power as everyday living costs go up."
  }
];

/**
 * Intelligent Dynamic Coach Advisor:
 * Answers ANY custom user query while strictly enforcing the 3-part friend-texting format and 0-jargon rule.
 */
export function generateBeginnerCoachAdvice(
  userQuery: string,
  context: {
    salary?: number;
    safePool?: number;
    daysLeft?: number;
    cardDues?: number;
    primaryGoalTitle?: string;
    primaryGoalSaved?: number;
    primaryGoalTarget?: number;
  } = {}
): CoachAnswer {
  const q = userQuery.trim().toLowerCase();
  const salary = context.salary || 75000;
  const pool = context.safePool || 30592;
  const days = context.daysLeft || 17;
  const cardDues = context.cardDues || 17908;
  const goalTitle = context.primaryGoalTitle || "New iPhone";
  const goalSaved = context.primaryGoalSaved || 42000;
  const goalTarget = context.primaryGoalTarget || 80000;

  // Check direct preset matches first
  for (const preset of PRESET_COACH_QUESTIONS) {
    if (q.includes(preset.id) || q.includes(preset.question.toLowerCase())) {
      return preset;
    }
  }

  // Check specific query themes:
  // 1. Dinner / Food / Drinks / Swiggy / Weekend spend
  if (/dinner|food|drinks|beer|party|swiggy|zomato|burger|eat out/i.test(q)) {
    let amount = 3000;
    const numMatch = q.match(/(?:(?:rs\.?|inr|₹)\s*([\d,]+))|(?:\b(\d{3,6})\b)/i);
    if (numMatch) {
      amount = parseFloat((numMatch[1] || numMatch[2]).replace(/,/g, ""));
    }
    const cap = Math.min(amount, Math.round(pool / days));
    const saved = Math.max(0, amount - cap);

    if (amount <= 800) {
      return {
        id: "custom_food_ok",
        question: userQuery,
        category: "dinner",
        directAnswer: `Yes—₹${amount} fits comfortably within your safe pool.`,
        bulletPoints: [
          `You have ₹${pool.toLocaleString("en-IN")} safe cash for the next ${days} days.`,
          `This spend uses just a fraction of your safe spending cushion.`,
          `Enjoy your meal—your ${goalTitle} goal remains fully protected.`
        ],
        concreteAction: `Pay ₹${amount} and keep the rest of your ₹${pool.toLocaleString("en-IN")} pool intact until payday!`,
        actionPill: `Enjoy ₹${amount} Meal • Safe Pool Protected`,
        actionTone: "green",
        simplerOneLiner: `Go ahead—₹${amount} is small enough that it won't hurt your wallet or delay your goals.`
      };
    }

    return {
      id: "custom_food_cap",
      question: userQuery,
      category: "dinner",
      directAnswer: `Wait—do this instead: cap tonight at ₹${cap.toLocaleString("en-IN")}.`,
      bulletPoints: [
        `You have ₹${pool.toLocaleString("en-IN")} left in your safe pool for ${days} days.`,
        `Spending ₹${amount.toLocaleString("en-IN")} burns ${Math.ceil(amount / Math.max(1, pool / days))} days of safe spending headroom.`,
        `A ₹${cap.toLocaleString("en-IN")} meal keeps your weekend fun without breaking the bank.`
      ],
      concreteAction: `Spend ₹${cap.toLocaleString("en-IN")} tonight and sweep ₹${saved.toLocaleString("en-IN")} straight into your ${goalTitle} jar!`,
      actionPill: `Cap at ₹${cap.toLocaleString("en-IN")} & save ₹${saved.toLocaleString("en-IN")}`,
      actionTone: "amber",
      simplerOneLiner: `You have the cash, but ₹${amount.toLocaleString("en-IN")} delays your ${goalTitle} by ${Math.ceil(amount / 500)} days—spend ₹${cap.toLocaleString("en-IN")} instead.`
    };
  }

  // 1b. Sneakers / Footwear / Fashion / Apparel (Indian Market Alternatives)
  if (/sneaker|shoes|footwear|kicks|apparel|zara|h&m|shirt/i.test(q)) {
    let amount = 4500;
    const numMatch = q.match(/(?:(?:rs\.?|inr|₹)\s*([\d,]+))|(?:\b(\d{3,6})\b)/i);
    if (numMatch) {
      amount = parseFloat((numMatch[1] || numMatch[2]).replace(/,/g, ""));
    }
    const swapCost = amount === 4500 ? 1350 : Math.round(amount * 0.30);
    const saved = Math.max(0, amount - swapCost);

    return {
      id: "custom_sneakers_swap",
      question: userQuery,
      category: "shopping",
      directAnswer: `Wait—do this instead: grab Red Tape or Campus retro sneakers for ₹${swapCost.toLocaleString("en-IN")}.`,
      bulletPoints: [
        `You have ₹${pool.toLocaleString("en-IN")} safe cash left before next payday.`,
        `Spending ₹${amount.toLocaleString("en-IN")} on branded sneakers delays your ${goalTitle} by ${Math.ceil(amount / 140)} days.`,
        `Campus or Red Tape retro court pairs (~₹${swapCost.toLocaleString("en-IN")} on Myntra/Ajio) give the exact same street look.`
      ],
      concreteAction: `Grab the ₹${swapCost.toLocaleString("en-IN")} retro sneakers and sweep ₹${saved.toLocaleString("en-IN")} straight into your ${goalTitle} jar!`,
      actionPill: `Swap to ₹${swapCost.toLocaleString("en-IN")} Sneakers • Sweep +₹${saved.toLocaleString("en-IN")}`,
      actionTone: "amber",
      simplerOneLiner: `Grab a clean pair of Red Tape or Campus retro court sneakers (~₹1,350 on Myntra/Ajio) instead of ₹4,500 branded pairs—same crisp street look, ₹3,150 saved.`
    };
  }

  // 2. Credit Cards / Dues / Debt
  if (/credit card|bill|due|debt|emi|card payment/i.test(q)) {
    return {
      id: "custom_card_bill",
      question: userQuery,
      category: "cards",
      directAnswer: `Pay off your ₹${cardDues.toLocaleString("en-IN")} credit card bill immediately—zero debate.`,
      bulletPoints: [
        "Credit cards charge a brutal 42% yearly interest penalty.",
        "India's top 50 stock funds average only ~12% a year.",
        "Clearing your card gives an instant, guaranteed 42% win."
      ],
      concreteAction: `Use your ₹${salary.toLocaleString("en-IN")} salary balance to pay the ₹${cardDues.toLocaleString("en-IN")} dues today.`,
      actionPill: `Pay ₹${cardDues.toLocaleString("en-IN")} Card Dues Today`,
      actionTone: "green",
      simplerOneLiner: `Credit cards charge 42% interest, so clearing your ₹${cardDues.toLocaleString("en-IN")} bill beats every investment on earth.`
    };
  }

  // 3. SIP vs FD or Where to invest / savings account
  if (/sip|fd|fixed deposit|invest|mutual fund|nifty|index fund/i.test(q)) {
    const isShortTerm = /iphone|gadget|phone|shoes|trip|holiday|laptop|short/i.test(q);

    if (isShortTerm) {
      return {
        id: "custom_short_invest",
        question: userQuery,
        category: "investing",
        directAnswer: "Use an FD for short-term goals—never a stock market SIP.",
        bulletPoints: [
          "An FD is a safe bank lockbox with zero risk of dropping.",
          "Stock SIPs have market ups and downs; they need 3+ years.",
          `Your ${goalTitle} goal is coming soon—keep that cash 100% safe.`
        ],
        concreteAction: `Keep your ₹${goalSaved.toLocaleString("en-IN")} savings in Instant Safe (~6.8% / yr) so every rupee is safe.`,
        actionPill: `Lock in Instant Safe (~6.8% / yr)`,
        actionTone: "green",
        simplerOneLiner: `Because you want to buy ${goalTitle} soon, keep it in a safe bank lockbox (FD) so market drops cannot touch it.`
      };
    }

    return {
      id: "custom_long_invest",
      question: userQuery,
      category: "investing",
      directAnswer: "Yes—put money you won't touch for 3+ years into an Index Fund SIP.",
      bulletPoints: [
        "An Index Fund buys a basket of India's top 50 companies.",
        "It historically grows at ~12% a year, beating everyday price rises.",
        "Automating it on payday means you build wealth with zero effort."
      ],
      concreteAction: `Keep your ₹5,000 monthly Friday AutoPay Auto-Save active to build wealth automatically!`,
      actionPill: `Auto-Invest in Top 50 Index Fund`,
      actionTone: "green",
      simplerOneLiner: `Index Funds put your money into India's 50 biggest companies so it grows faster than prices rise.`
    };
  }

  // 4. Bank account cash / keeping money idle
  if (/bank|savings account|cash|idle|savings/i.test(q)) {
    return {
      id: "custom_bank_cash",
      question: userQuery,
      category: "banking",
      directAnswer: "No—money sitting in your primary UPI account gets spent fast.",
      bulletPoints: [
        "When cash sits in your bank, you see it and tap-to-pay.",
        "Normal accounts pay only ~2.8%, losing value as grocery prices rise.",
        "Out-of-sight vaults keep your money hidden from impulse QR scans."
      ],
      concreteAction: `Keep ₹10,000 for daily UPI and sweep your idle ₹38,500 into your Safe Growth Vaults.`,
      actionPill: "Move idle cash into Safe Vaults",
      actionTone: "amber",
      simplerOneLiner: "If you can see the money in your UPI app, you will spend it—hide it in safe vaults where it grows silently."
    };
  }

  // 5. Default General Question / Affordability Fallback
  return {
    id: "custom_general",
    question: userQuery,
    category: "general",
    directAnswer: `Yes—you have ₹${pool.toLocaleString("en-IN")} safe to spend until payday.`,
    bulletPoints: [
      `Your take-home salary is ₹${salary.toLocaleString("en-IN")} with fixed bills taken care of.`,
      `You have ${days} days until payday with a good Spend Speed.`,
      `Your ${goalTitle} jar currently has ₹${goalSaved.toLocaleString("en-IN")} safely growing.`
    ],
    concreteAction: `Check any purchase with Before-I-Scan to protect your ₹${pool.toLocaleString("en-IN")} safe pool!`,
    actionPill: `Safe Pool: ₹${pool.toLocaleString("en-IN")} Ready`,
    actionTone: "blue",
    simplerOneLiner: `Your essentials and card bills are covered; you have ₹${pool.toLocaleString("en-IN")} left to enjoy guilt-free.`
  };
}

