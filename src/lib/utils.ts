import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amounts in standard Indian Rupee format (e.g. ₹6,000 or ₹140.50)
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats date into readable format
 */
export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Formats date with time
 */
export function formatDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Robust amount extraction supporting both standard (1,200, 14,990) and Indian comma formats (1,50,000)
 * Prevents split-at-comma parsing bugs where "1,200" was erroneously parsed as 200.
 */
export function extractQueryAmount(query: string): number {
  if (!query) return 0;

  // 1. Strip commas between digits first: e.g. "1,200" -> "1200", "14,990" -> "14990", "1,50,000" -> "150000"
  const normalized = query.replace(/(?<=\d),(?=\d)/g, "").replace(/(\d),(?=\d)/g, "$1");

  // 2. Check for explicit currency prefixes first: e.g. "₹14990", "Rs. 1200", "INR 150000"
  const currencyMatch = normalized.match(/(?:rs\.?|inr|₹)\s*(\d+(?:\.\d+)?)/i);
  if (currencyMatch && currencyMatch[1]) {
    const val = parseFloat(currencyMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  // 3. Check for currency suffixes: e.g. "1200 rs", "14990 rupees", "150000 bucks"
  const suffixMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:rs|rupees|bucks|inr)\b/i);
  if (suffixMatch && suffixMatch[1]) {
    const val = parseFloat(suffixMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  // 4. Preposition context: e.g. "for 1200", "worth 14990", "cost 500"
  const prepMatch = normalized.match(/(?:for|worth|costing|cost|at|around|approx)\s*(\d+(?:\.\d+)?)/i);
  if (prepMatch && prepMatch[1]) {
    const val = parseFloat(prepMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  // 5. Match comma-formatted or general number: /₹?\s*\d[\d,]*(?:\.\d+)?/
  const generalMatch = query.match(/₹?\s*(\d[\d,]*(?:\.\d+)?)/);
  if (generalMatch && generalMatch[1]) {
    const cleanStr = generalMatch[1].replace(/,/g, "");
    const val = parseFloat(cleanStr);
    if (!isNaN(val) && val > 0) return val;
  }

  // 6. Standalone multi-digit match
  const multiDigitMatch = normalized.match(/\b(\d{2,}(?:\.\d+)?)\b/);
  if (multiDigitMatch && multiDigitMatch[1]) {
    const val = parseFloat(multiDigitMatch[1]);
    if (!isNaN(val) && val > 0) return val;
  }

  // 7. Fallback pure numeric
  const pureNum = parseFloat(normalized.replace(/[^\d.]/g, ""));
  if (!isNaN(pureNum) && pureNum > 0) return pureNum;

  return 0;
}

