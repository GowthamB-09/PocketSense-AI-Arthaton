# PocketSense PRO 🎯

🌐 **Live Public Deployment (Works 24/7):** [https://pocketsense-ai-one.vercel.app](https://pocketsense-ai-one.vercel.app)

> **Zero-Login, Privacy-First Behavioral Money Coach for Young Professionals** 
> *Built for Arthaton 2026 ("AI for Finance") Hackathon*

---

## 💡 1. Product Vision & Problem Statement

### The Problem: The "Day 20 Squeeze" & Frictionless Lifestyle Creep
Young urban professionals (ages 24–30) earning competitive take-home salaries (e.g., ₹60,000–₹1,20,000/month) frequently find themselves cash-squeezed by the 20th of the month. 

After accounting for non-negotiable fixed commitments (Rent, SIP mutual funds, EMIs, household staff ~₹32,000), the remaining discretionary pool vanishes into micro-transactions:
- ₹420 specialty cafe pour-overs (Blue Tokai, Third Wave)
- ₹450 10-minute quick commerce carts (Zepto, Blinkit, Instamart)
- ₹650 surge-priced Uber Premier commutes
- ₹3,500 Friday craft brewery & bistro bill splits
- ₹14,990 flash tech sales & apparel carts (Zara, H&M)

Because frictionless UPI QR codes and tap-to-pay eliminate payment resistance, professionals suffer from **lifestyle creep** and delayed compounding for high-conviction goals (Japan trip, MacBook upgrade, emergency runway).

### Why Existing Fintech Apps Fail
1. **Post-Mortem Charts:** Banking and expense tracker apps display colorful pie charts *after* discretionary funds have evaporated.
2. **Invasive Credential Demands:** Requiring net-banking credentials, SMS read permissions, PAN cards, or live brokerage access exposes sensitive financial data.
3. **Zero Behavioral Memory:** Standard apps treat every transaction in isolation, lacking awareness of the user's specific goals, impulse triggers, and habitual spending traps.

### The PocketSense Solution
PocketSense is an executive **zero-login, non-custodial Behavioral Money Coach** inspired by **Supermemory.ai** and **Linear**:
- **Intercepts Spending *Before* It Happens:** Instant command-bar coach (`Cmd+K`) where professionals ask before scanning: *"Should I spend ₹3,500 on dinner & craft beer tonight?"*
- **Discretionary Safe-to-Spend Limit:** Isolate fixed commitments (Rent + SIPs) to compute a single actionable daily limit (e.g., **₹550 / day**).
- **Opportunity Cost & Wealth Jars:** Converts skipped impulse wants directly into tangible milestone assets (e.g., skipping a restaurant tab deposits ₹3,500 into your Japan Trip jar) with one-click **"Skip & Save"**.

---

## ⚡ 2. Architecture & Tech Stack

```
PocketSense Architecture (Supermemory & Linear-Grade Fintech)
├── Framework: Next.js 15 (App Router, React 19, TypeScript)
├── Styling: Tailwind CSS (Obsidian #09090B Dark-Mode First, 1px border-white/10)
├── AI & Intelligence Layer: Vercel AI SDK (`ai`) + Google Gemini API (`@ai-sdk/google`, `gemini-2.5-flash`)
│   ├── Structured Parsing: `generateObject` with Zod schema for UPI SMS/statement classification
│   └── Streaming Coach: `streamText` for real-time executive behavioral coaching
├── Financial Memory Engine (Supermemory-Style):
│   ├── Client-side non-custodial local memory store (`localStorage`)
│   ├── Habit vector indexing for behavioral traps (#specialty-coffee, #quick-commerce, #weekend-social)
│   └── Milestone Goal Jars with interactive savings diversion and discipline streak tracking
├── Data Visualization: 14-day spending velocity and category burn progress
└── Micro-Interactions: `canvas-confetti` celebrations upon impulse diversion
```

---

## 🚀 3. Core Features

### 1. One-Click Realistic Professional Dataset
- Prominent **"Load Demo Data"** action in the navigation bar.
- Pre-loads 30 days of synthetic transactions for **Rohan Mehta** (26, Senior Product Designer, ₹75,000 take-home, ₹32,000 fixed essentials).
- Includes realistic transactions from Blue Tokai, Zepto, Toit Brewery, Uber, Zara, and Cult.fit with zero real bank, PAN, or personal data.

### 2. Hackathon Rate-Limit Fallback ("Demo Mode" Toggle)
- Prominent **"Mode: Pre-Computed / Live AI"** toggle in the navbar.
- Protects against Gemini API 429 rate limits when multiple evaluators test simultaneously.
- Demo Mode instantly serves pre-computed executive coaching responses with sub-millisecond response times.
- If live Gemini API calls ever encounter a quota exhaustion error, the app **automatically and silently fails over** to Demo Mode without interruption.

### 3. Zero-Login UPI SMS & Statement Parser
- Interactive drawer to parse raw bank SMS alerts or pasted notifications.
- Structured classification categorizes expenses into:
  - **Survival Need:** Groceries, utilities, fixed commute.
  - **Impulse Want:** Craft brewery splits, impulse shopping, quick-commerce snacks.
  - **Silent Subscription Leak:** Unused cloud storage, duplicate streaming services.

### 4. "Daily Safe-to-Spend" Hero Card
- Computes:
  $$\text{Daily Safe-to-Spend} = \frac{\text{Monthly Salary} - \text{Fixed Commitments} - \text{Spent So Far}}{\text{Days Remaining in Month}}$$
- Provides a clear daily discretionary limit (**₹550 / day**) with live status indicators (🟢 Safe / 🟡 Tightening / 🔴 Squeeze).

### 5. Burn Velocity vs. Month-End Runway
- Analyzes current daily burn rate (e.g., ₹2,440/day) against sustainable velocity (₹550/day).
- Highlights the **Day 20 Squeeze** marker to prevent month-end cash flow crunches before next payday.

### 6. Opportunity Cost & Wealth Milestone Jars
- Translates daily impulses into tangible milestones:
  - *"Skipping tonight's ₹3,500 craft beer tab funds 2.3% of your Japan Spring Trip jar!"*
- One-click **"Skip & Save"** increments your discipline streak (🔥 5d) and deposits savings into target jars.

### 7. "Before-I-Scan" AI Impulse Interceptor (`Cmd+K`)
- Rapid command-bar accessible anytime via `Cmd+K` or `Ctrl+K`.
- Evaluates purchases with immediate verdicts: `APPROVED`, `CAUTION`, or `DENIED` with actionable trade-offs and spending hacks.

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

Add your Google Gemini API key:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```
> **Note:** If no API key is configured, PocketSense PRO automatically runs on its built-in **High-Accuracy Local Heuristic Engine**, ensuring 100% of all UI features, SMS classification, and coaching work without network dependencies.

### Step 3: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 5. Arthaton 2026 Compliance & Open Source Credits

PocketSense PRO complies with all **Arthaton 2026** competition guidelines:

### Open-Source Libraries & APIs Credited
- **[Next.js 15](https://nextjs.org/):** React application framework & App Router.
- **[Vercel AI SDK (`ai`)](https://sdk.vercel.ai/):** Streaming chat and structured schema generation.
- **[Google Gemini API (`@ai-sdk/google`)](https://aistudio.google.com/):** Gemini 2.5 Flash LLM for SMS parsing and behavioral coaching.
- **[Tailwind CSS](https://tailwindcss.com/):** Executive dark-mode fintech interface.
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
- **Target Audience:** Young Working Professionals (Ages 24–30)
