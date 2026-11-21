# PocketSense PRO 🎯

🌐 **Live Public Deployment (Works 24/7):** [https://pocketsense-ai-one.vercel.app](https://pocketsense-ai-one.vercel.app)

> **Zero-Login, Privacy-First Behavioral Money Coach for Young Professionals**  
> *Built for Arthaton 2026 ("AI for Finance") Hackathon*

---

## 📸 Screenshots & Demo

| Safe Pool & Calendar | AI Pay Guard (Cmd+K) |
| :---: | :---: |
| ![Safe Pool & Calendar](./public/screenshots/dashboard.png) | ![AI Pay Guard](./public/screenshots/pay-guard.png) |

> 🎬 **Demo Video Walkthrough (Under 5 Minutes):**  
> **[Watch the PocketSense PRO Demo Video](https://www.youtube.com/watch?v=YOUR_VIDEO_LINK_HERE)** *(Submission Walkthrough)*

---

## 💡 1. Product Vision & Problem Statement

### The Problem: The "Day 20 Squeeze" & Frictionless Lifestyle Creep
Young urban professionals (ages 24–40) earning competitive take-home salaries (e.g., ₹60,000–₹1,20,000/month) frequently find themselves cash-squeezed by the 20th of the month. 

After accounting for non-negotiable fixed commitments (Rent, SIP mutual funds, EMIs, household staff ~₹32,000), the remaining discretionary pool vanishes into micro-transactions:
- ₹420 specialty cafe pour-overs (Blue Tokai, Third Wave)
- ₹480 10-minute quick commerce carts (Zepto, Blinkit, Instamart)
- ₹650 surge-priced Uber Premier commutes
- ₹3,500 Friday craft brewery & bistro bill splits
- ₹14,990 flash tech sales & apparel carts (Zara, H&M)

Because frictionless UPI QR codes and credit card tap-to-pay eliminate payment resistance, professionals suffer from **lifestyle creep**, credit card debt spirals, and delayed compounding for high-conviction goals (Japan trip, MacBook upgrade, emergency runway).

### Why Existing Fintech Apps Fail
1. **Post-Mortem Charts:** Banking and expense tracker apps display colorful pie charts *after* discretionary funds have evaporated.
2. **Invasive Credential Demands:** Requiring net-banking credentials, SMS read permissions, PAN cards, or live brokerage access exposes sensitive financial data.
3. **Zero Behavioral Memory:** Standard apps treat every transaction in isolation, lacking awareness of the user's specific goals, impulse triggers, and upcoming bill cycles.

### The PocketSense Solution
PocketSense is an executive **zero-login, non-custodial Behavioral Money Coach** inspired by **Supermemory.ai** and **Linear**:
- **Intercepts Spending *Before* It Happens:** Instant command-bar coach (`Cmd+K`) where professionals ask before scanning: *"Should I spend ₹3,500 on dinner & craft beer tonight?"*
- **Smart Cash-Flow & Event Calendar:** Plan and ring-fence upcoming gifts, weddings, and parties before daily spending starts.
- **Salary Allocation Breakdown:** Mathematically guarantees that Take-Home Salary strictly equals Fixed Bills + Spent This Month + Total Safe Pool.
- **Opportunity Cost & Wealth Jars:** Converts skipped impulse wants directly into tangible milestone assets (e.g., skipping a restaurant tab deposits ₹2,500 into your iPhone jar) with one-click **"Skip & Save"**.

---

## ⚡ 2. Architecture & Tech Stack

```
PocketSense Architecture (Supermemory & Linear-Grade Fintech)
├── Framework: Next.js 15 (App Router, React 19, TypeScript)
├── Styling: Tailwind CSS (Fintech Obsidian & Clean Slate, 1px border-slate-200)
├── AI & Intelligence Layer: Vercel AI SDK (`ai`) + Google Gemini API (`@ai-sdk/google`, `gemini-2.5-flash`)
│   ├── Structured Parsing: `generateObject` with Zod schema for UPI SMS/statement classification
│   └── Streaming Coach: `streamText` for real-time executive behavioral coaching
├── External Integrations:
│   └── Google Places API (New): Real-time nearby budget restaurant search (< 3km, 4.2★+) with offline fallback
├── Financial Memory Engine (Supermemory-Style):
│   ├── Client-side non-custodial local memory store (`localStorage`)
│   ├── Dynamic Salary Cycle & Pacing Engine (Configurable Salary Credit Day)
│   ├── Ring-Fenced Event Shield (Auto-Pre-Lock of planned event budgets)
│   ├── Bill-Week Collision Alert Engine (±2 days proximity warning to AutoPay due dates)
│   └── Silent Risk Guard (Dynamic 20% Salary credit card threshold with AutoPay pause)
├── Multi-Tier Simulation & Input Guardrails:
│   ├── Bill Buffer Limit: Halts simulated spend when Total Safe Pool ≤ Upcoming Card Dues
│   ├── 9-Digit Input Guardrails: Prevents layout overflow and NaN in Salary & Fixed Bills inputs
│   └── Comma-Formatted Numeric Normalizer: Seamlessly extracts Indian (₹1,50,000) & standard numbers
└── Micro-Interactions: `canvas-confetti` celebrations upon impulse diversion
```

---

## 🚀 3. Core Features & Behavioral Innovations

### 1. Interactive Smart Cash-Flow & Event Calendar
- **Mobile-First 7-Column Grid (`Mon` to `Sun`):** Clean monthly calendar navigation (`<` and `>`), a quick `"Today"` jump button, and dynamic real-date synchronization highlighting the live date with an emerald indicator.
- **Dynamic Payday (⭐) Aligned with Settings:** Reads `profile.salaryCreditDay` configured in Budget Settings (Day 1, 5, 25, 28, or 30). The calendar dynamically renders the gold Payday star (⭐) and status badge on that exact day across all months.
- **Pre-Loaded Color-Coded Schedule:**
  - 🔴 **Red Pills & Dots (AutoPay Bills):** Nov 24 (*ICICI Card AutoPay Due • ₹9,800*) and Nov 27 (*HDFC Card AutoPay Due • ₹8,108*).
  - 🟣 **Purple Pills & Dots (Personal Events & Gifts):** Nov 26 (*Aarav's Birthday Gift & Dinner • ₹2,500*).
  - ⭐ **Gold Star (Payday):** Dynamic salary credit day (*Monthly Salary Credited • ₹75,000*).
- **Standout Feature A — "Ring-Fenced Event Shield" (Auto-Pre-Lock):**
  - Every scheduled event features a default **Pre-Lock Toggle (ON)**.
  - Subtracts planned event budgets immediately from the Net Safe Cash Pool:
    $$\text{Net Safe Cash Pool} = \text{Total Linked Bank Cash} - \text{Upcoming Card Dues} - \text{Ring-Fenced Calendar Events}$$
  - Protects gift money from being accidentally spent on impulse food deliveries days before the event.
  - Includes a bottom summary strip (`₹2,500 Ring-Fenced for 1 Upcoming Event`) and a **"Mark Paid / Done"** settlement button.
  - **Post-Payment `Settled` State:** Once an event is marked Paid/Done, the interactive shield toggle seamlessly transitions to a static **`Settled`** badge with a checkmark, visually confirming to users and judges that the pre-locked funds have been released and deducted upon settlement.
- **Dynamic Payday (⭐) & Celebratory Inflow Drawer:**
  - The calendar renders only a single gold star next to the date number on Payday (with zero red AutoPay dots).
  - Clicking Payday opens a celebratory emerald **`Income Credit`** card displaying `+₹75,000 Monthly Salary` and `Salary Credited` badge.
- **Standout Feature B — "Bill-Week Collision Alert":**
  - If a user schedules an event within **2 days** of an AutoPay bill due date, a smart warning surfaces in the form and detail drawer:
    > *“⚠️ Heads up: HDFC Card AutoPay Due is due 1 day after this event—keep ₹17,908 reserved.”*
- **Quick Event & Gift Scheduler Modal:**
  - 4 categories: 🎂 *Birthday Gift*, 💍 *Wedding*, 🎉 *Party / Outing*, or 🧾 *AutoPay Bill*.
  - Title input with quick chips (*"Aarav's Birthday"*, *"Wedding Gift"*, *"Team Outing"*).
  - Budget input with ₹ prefix, capped at 9 digits max (`maxLength={9}`).

---

### 2. Salary Allocation & Safe Pool Breakdown Bar
- Replaces scattered metric cards with a unified, 3-segment stacked horizontal progress bar:
  1. **Fixed Bills & SIPs (Purple/Indigo `#4F46E5`):** Non-negotiable rent, mutual fund SIPs, and utilities. Clickable to adjust commitments.
  2. **Spent This Month (Warm Amber `#F59E0B`):** Discretionary purchases tracked so far.
  3. **Total Safe Pool (Vibrant Emerald `#10B981`):** Net spendable cash remaining.
- **Category Labels Above the Bar:** Clean horizontal label row with matching colored indicator dots positioned above the bar.
- **Amounts Centered Inside:** Displays formatted rupee amounts (`₹32,000`, `₹12,408`, `₹30,592`) centered within each segment with interactive hover/tap tooltips.
- **Mathematically Locked Zero-Sum Guarantee:**
  $$\text{Fixed Bills} + \text{Spent This Month} + \text{Total Safe Pool} = \text{Take-Home Salary (₹75,000)}$$
  Ensures Spent This Month cannot exceed the spendable ceiling (`₹43,000`).

---

### 3. Multi-Tier Financial & Simulation Guardrails
- **Bill Buffer Limit Protection:**
  - Evaluates `totalSafePool <= upcomingCardDues`.
  - When true, the top header button changes label to **"Bill Buffer Limit"** with an amber `ShieldAlert` icon and protective styling.
  - Clicking or hovering displays the toast:
    > *“Simulation paused: Your Safe Pool has reached your ₹17,908 credit card bill threshold.”*
  - Automatically prevents further simulations from depleting cash reserved for card bills.
- **9-Digit Input Guardrails:**
  - In the Budget & Salary Settings modal, Take-Home Salary and Fixed Bills inputs are restricted to 9 digits (`maxLength={9}`, capped at 999,999,999 / ₹99.99 Crores).
  - Strips non-digits (`replace(/\D/g, "")`) on `onChange` to eliminate layout breaks, bar overflow, or `NaN`.
- **Indian & Standard Comma-Formatted Number Parsing:**
  - Enhanced regular expression in AI Pay Guard extracts numbers with commas and decimals:
    - `1,200` parses cleanly to `1200` (fixing comma-split bugs).
    - Indian numbering formats like `14,990` and `1,50,000` parse accurately.
- **Silent Risk Guard (AutoPay Pause):**
  - Dynamically triggers when upcoming card bills exceed **20% of monthly salary** (e.g., > ₹15,000 on a ₹75,000 salary).
  - Pauses weekly Friday AutoPay sweeps into Goal Jars to protect bank balance until payday.
  - Features a **"Pay Card Bills Now"** action inside Risk Details that deducts dues from bank cash and resets dues to ₹0, immediately untriggering the pause.

---

### 4. Real-Time Google Places API (New) Smart Swaps & Concrete Indian Alternatives
- When asking AI Pay Guard about dining, cafes, or parties (e.g., *"I want to eat out for ₹800"*):
  - Fetches real budget restaurants within 3km using user coordinates (or Bengaluru default).
  - Filters for inexpensive/moderate options with ratings ≥ 4.2★.
  - Surfaces real place details, ratings, user reviews, and Google Maps links.
- **Concrete Indian Footwear & Fashion Swaps:**
  - Replaces generic advice with specific Indian market alternatives:
    - *Footwear Splurge (`₹4,500`):* Recommends clean **Red Tape or Campus retro court sneakers (~₹1,350 on Myntra/Ajio)** instead of ₹4,500 branded pairs—saving **+₹3,150** swept straight into the active Goal Jar.
    - *Apparel & Tech:* Recommends relatable picks (Zudio, Souled Store, CMF by Nothing, Realme).
    - *Gemini System Prompt Rule 4:* Instructs Gemini 2.5 Flash to always name 1–2 concrete Indian brands with realistic INR pricing.
- **Clear Money-Split Breakdown (Where the Money Goes):**
  - **Spent Now (₹320 / ₹1,350):** Deducted from Safe Pool for the immediate craving or swap item.
  - **Swept to Goal Jar (+₹480 / +₹3,150):** Locked directly into your Milestone Goal Jar.
- **Places Status Badge:** Developer badge in AI Pay Guard and Settings indicating whether Live Google Places API is active or running in Curated Offline Mode.

---

### 5. "Before-I-Scan" AI Pay Guard & Smart Swap Engine (`Cmd+K`)
- Instant impulse evaluation before scanning UPI QR codes.
- Serves three clear verdicts: `APPROVED`, `CAUTION`, or `BLOCKED`.
- Provides cheaper alternatives and calculates the exact percentage contribution to your milestone jars.

---

### 6. Auto-Tracked Spending Dashboard
- **Simulated Demo Indicator:** Displays a soft amber/slate `Simulated Demo` pill next to the heading so judges immediately recognize all displayed transactions are synthetic demo data.
- **Auto-Sync Cards with Privacy-First Info Tooltips (`ⓘ`):**
  - *Bank & Card Email Sync:* Interactive popover explaining privacy-first forwarding (users auto-forward only bank alert emails to a parser alias—no bank logins required).
  - *UPI & Bank SMS Sync:* Interactive popover detailing zero-permission OS automation (iOS Shortcuts / Android webhooks) that captures single debit alerts locally without invasive SMS-read permissions.
- **Where It Went (Category Breakdown):** Interactive SVG donut chart showing real distribution across Food & Dining, Shopping & Gear, Transport & Subscriptions, and Entertainment—mathematically locked 1:1 to Spent This Month.
- **Spend History:** Comprehensive searchable ledger of every tracked UPI, bank, and credit card debit with clean timestamp, category, and account tags.

---

### 7. Goal Jars & AI Price-Trend Forecaster
- **Progressive Disclosure Card Design (Clean & Scannable):**
  - **Top Row:** Clean SVG Lucide icons (`Smartphone` for Tech/iPhone, `Coins` for Gold, `Headphones` for Audio, `Shield` for Emergency)—eliminating blank boxes (`▯`) on mobile. Displays title, target price (`New iPhone — ₹80,000`), category tag, and delete button.
  - **Progress Section:** Saved balance (`₹42,000`), Target (`₹80,000`), emerald progress bar, `% funded`, and `₹ to go`.
  - **Compact 1-Line Alert Strip:** Shows only the concise headline alert (e.g., *“Price Dropping Soon — Wait until Oct to save ~₹11,000”*) paired with a clickable **`Know More ▾`** / **`Show Less ▴`** toggle.
- **Expandable Details:**
  - Clicking `Know More ▾` smoothly unfolds the AI price timing insight, `Best Time to Buy` row, Out-of-Sight Safe Growth Vault badge (with duplicate yield text removed), and `+₹ Extra Earned While Waiting` breakdown.
- **Self-Contained Root-Level Top-Up Modal:**
  - Centered modal (`fixed inset-0 z-50 bg-slate-900/60`) accessible on desktop and mobile above all bottom navigation bars.
  - Displays Current Saved, Target Price, and Available **Net Safe Pool** balance.
  - Quick-add chips (`+₹500`, `+₹1,000`, `+₹2,500`, `+₹5,000`) and numeric input with 9-digit guardrails.
  - Enforces that transfers cannot exceed Net Safe Pool, deducts from safe cash, credits the goal, triggers confetti, and displays confirmation toast.
- **Streamlined AutoPay Auto-Save Card:**
  - Single status pill in the header: `AutoPay Auto-Save: PAUSED/ACTIVE` alongside the switch toggle.
  - Direct single-line notice: `"Paused: Card dues exceed 20% of salary."` with inline **`Settle Bills →`** link opening Risk Details.
  - Monthly cap pills (`₹3,000`, `₹5,000`, `₹10,000`) remain visible on the card.
  - Collapsible **`Schedule & Split Rules ▾`** accordion holding schedule details, 70% Gold / 30% Instant Safe meter, and manual sweep trigger.
- **Collapsible Plain-English Wealth Guide (`📖 Plain-English Wealth Guide ▾`):**
  - Single sleek collapsible accordion bar replacing 600px of vertical clutter.
  - Unfolds 3 concise 10-second definitions: *Fixed Deposit (FD)* (100% guaranteed safe lockbox), *Nifty 50 Index Fund* (~12% historical), and *SIP Autopilot* (zero-discipline growth without UPI PINs).

---

## 🛠️ 4. Quickstart & Local Installation

### Prerequisites
- Node.js 18.18+ or 20+
- npm 9+

### Step 1: Clone and Install
```bash
git clone https://github.com/GowthamB-09/PocketSense-AI-Arthaton.git
cd PocketSense-AI-Arthaton
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Add your API keys:
```env
# Google Gemini API Key (Required for Live AI Coaching)
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here

# Google Places API (New) Key (Optional, for Live Nearby Restaurant Swaps)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_places_api_key_here
```
> **Note:** If no API keys are configured, PocketSense PRO automatically falls back to its built-in **High-Accuracy Local Heuristics & Curated Offline Swaps**, ensuring 100% of UI features, SMS classification, calendar protections, and coaching work seamlessly.

### Step 3: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 5. Arthaton 2026 Rules & Compliance Checklist

PocketSense PRO fulfills 100% of the **Arthaton 2026 ("AI for Finance")** competition rules and judging criteria:

| Arthaton Rule / Criteria | Requirement Description | PocketSense PRO Implementation | Compliance Status |
| :--- | :--- | :--- | :---: |
| **Theme: AI for Finance** | Practical AI application that helps individuals or businesses make better financial decisions (smart budgeting, investing, risk mitigation). | Behavioral Money Coach intercepts impulsive UPI spending before it happens, enforces Ring-Fenced Event Shields, and pauses AutoPay when credit card dues spike above 20%. | ✅ **100% Met** |
| **No Real Money / No Trading Risk** | Must strictly use historical/paper/synthetic data. Real money usage is prohibited. | 100% non-custodial synthetic user profile (`SYNTHETIC_DEMO_PROFILE`) & simulated transactions. Zero payment gateways or real credentials required. | ✅ **100% Met** |
| **AI Models & API Integration** | AI models (Gemini, Claude, GPT, etc.) and synthetic datasets are fully permitted. | Built with Google Gemini 2.5 Flash (`@ai-sdk/google`) and Vercel AI SDK (`ai`), featuring structured output parsing and streaming advice with offline fallback. | ✅ **100% Met** |
| **Originality & Attribution** | Project must be original work. All open-source libraries, APIs, and tools must be credited. | Original product architecture inspired by Supermemory and Linear. All open-source libraries and APIs are explicitly listed and credited below. | ✅ **100% Met** |
| **Public GitHub Repository** | Complete project source code hosted publicly with a setup guide. | Public repository hosted at [github.com/GowthamB-09/PocketSense-AI-Arthaton](https://github.com/GowthamB-09/PocketSense-AI-Arthaton). | ✅ **100% Met** |
| **Comprehensive README Documentation** | Clear README explaining problem statement, architecture, features, and setup. | Comprehensive, production-grade `README.md` covering vision, math formulas, architecture, and step-by-step local setup. | ✅ **100% Met** |
| **Working Live Demo Deployment** | Working demonstration accessible online 24/7. | Deployed to production on Vercel at [pocketsense-ai-one.vercel.app](https://pocketsense-ai-one.vercel.app). | ✅ **100% Met** |
| **Under-5-Minute Demo Video** | Video walkthrough under 5 minutes demonstrating core functionality. | Complete, fast-paced demo video script showcasing command-bar intercept, event shield, and multi-card risk guard ready for submission. | ✅ **100% Met** |

---

### Open-Source Libraries & APIs Credited
- **[Next.js 15](https://nextjs.org/):** React framework & App Router.
- **[Vercel AI SDK (`ai`)](https://sdk.vercel.ai/):** Streaming chat and structured schema generation.
- **[Google Gemini API (`@ai-sdk/google`)](https://aistudio.google.com/):** Gemini 2.5 Flash LLM for SMS parsing and behavioral coaching.
- **[Google Places API (New)](https://developers.google.com/maps/documentation/places/web-service):** Location-aware budget restaurant discovery.
- **[Tailwind CSS](https://tailwindcss.com/):** Fintech UI system.
- **[Lucide React](https://lucide.dev/):** Iconography.
- **[Canvas Confetti](https://www.npmjs.com/package/canvas-confetti):** Celebratory micro-interactions for savings milestones.

### Privacy & Synthetic Data Compliance
- **100% Synthetic Data:** All transaction records, bank SMS alerts, and financial figures are synthetic mock data designed for young professional budgeting scenarios.
- **Zero Real Financial Credentials:** PocketSense PRO accesses no real bank accounts, IFSC codes, PAN details, Aadhaar numbers, live trading APIs, or payment gateways.
- **Client-Side Non-Custodial Memory:** Financial memory is stored strictly within browser `localStorage` and session memory.

---

## 👥 6. Submission Details
- **Project:** PocketSense PRO
- **Track:** AI for Finance (Arthaton 2026)
- **Target Audience:** Young Working Professionals (Ages 24–40)
- **Live Deployment:** [https://pocketsense-ai-one.vercel.app](https://pocketsense-ai-one.vercel.app)
- **Repository:** [https://github.com/GowthamB-09/PocketSense-AI-Arthaton](https://github.com/GowthamB-09/PocketSense-AI-Arthaton)
