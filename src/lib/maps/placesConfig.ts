/**
 * Google Maps / Places API (New) Configuration Helper
 * Supports VITE_GOOGLE_MAPS_API_KEY and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 */

export interface GooglePlacesConfig {
  apiKey: string;
  isLive: boolean;
  statusLabel: string;
  shortLabel: string;
  description: string;
  setupHint: string;
  consoleUrl: string;
}

export function getGooglePlacesConfig(): GooglePlacesConfig {
  const rawKey =
    (typeof process !== "undefined" && process.env?.VITE_GOOGLE_MAPS_API_KEY) ||
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ||
    "";

  // Clean quotes or placeholders
  const cleanKey = String(rawKey).trim().replace(/^["']|["']$/g, "");
  const isLive = Boolean(
    cleanKey &&
    cleanKey.length > 5 &&
    !cleanKey.toLowerCase().includes("your_") &&
    cleanKey !== '""'
  );

  return {
    apiKey: isLive ? cleanKey : "",
    isLive,
    statusLabel: isLive ? "Live Google Maps Places (New) Active" : "Places: Offline Curated Mode",
    shortLabel: isLive ? "Live Places Active" : "Offline Curated Mode",
    description: isLive
      ? "Google Places API (New) is active. Smart Swaps can verify live merchant locations and suggest real nearby alternatives."
      : "Running in Offline Curated Mode. Pre-verified heuristics and local alternatives are active without consuming Google Cloud quotas.",
    setupHint:
      "To enable live merchant search and real-time alternative venues, add VITE_GOOGLE_MAPS_API_KEY in your .env and enable 'Places API (New)' in Google Cloud Console.",
    consoleUrl: "https://console.cloud.google.com/apis/library/places.googleapis.com",
  };
}
