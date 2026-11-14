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
 * Formats date into Indian student-friendly readable format
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

