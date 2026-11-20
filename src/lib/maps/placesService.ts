/**
 * Google Maps & Places Service for Smart Swaps
 * Fetches real nearby budget restaurants using Google Places API (New)
 * or provides top-rated curated local spots with working Google Maps links.
 */

export interface PlaceSwapItem {
  id: string;
  displayName: string;
  rating: number;
  userRatingCount?: number;
  priceLevel?: string;
  estimatedCost: number;
  address?: string;
  mapsUrl: string;
  category?: string;
  highlight?: string;
}

export const FALLBACK_MAPS_NEARBY_URL = "https://www.google.com/maps/search/?api=1&query=budget+restaurants+near+me";

export const CURATED_BUDGET_RESTAURANTS: PlaceSwapItem[] = [
  {
    id: "meghana_foods_blr",
    displayName: "Meghana Foods",
    rating: 4.4,
    userRatingCount: 41200,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    estimatedCost: 320,
    address: "Koramangala 5th Block, Bengaluru",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Meghana+Foods+Koramangala+Bengaluru&query_place_id=ChIJ-e8t-h4UrjsR0P0uVl_j-QE",
    category: "Signature Andhra Biryani",
    highlight: "Legendary boneless biryani & spicy starters under ₹350",
  },
  {
    id: "ctr_shri_sagar_blr",
    displayName: "CTR (Shri Sagar)",
    rating: 4.6,
    userRatingCount: 28400,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    estimatedCost: 220,
    address: "7th Cross Rd, Malleshwaram, Bengaluru",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=CTR+Shri+Sagar+Malleshwaram+Bengaluru&query_place_id=ChIJm2pP44kWrjsR808F09gQj74",
    category: "Crispy Dose & Filter Coffee",
    highlight: "Famous crispy butter benne dose & heritage filter kaapi",
  },
  {
    id: "truffles_cafe_blr",
    displayName: "Truffles",
    rating: 4.5,
    userRatingCount: 36700,
    priceLevel: "PRICE_LEVEL_MODERATE",
    estimatedCost: 340,
    address: "St Marks Rd, Bengaluru",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Truffles+St+Marks+Road+Bengaluru&query_place_id=ChIJQ3M_0zAUrjsR2vLz33aJ-rU",
    category: "Gourmet Burgers & Pastas",
    highlight: "Juicy gourmet burgers, cheesy wedges, and rich shakes",
  },
  {
    id: "third_wave_coffee_blr",
    displayName: "Third Wave Coffee",
    rating: 4.3,
    userRatingCount: 9500,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    estimatedCost: 260,
    address: "12th Main Rd, Indiranagar, Bengaluru",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Third+Wave+Coffee+Indiranagar+Bengaluru&query_place_id=ChIJXb_m8iAUrjsRq8kEuhE5r_E",
    category: "Artisanal Coffee & Bakes",
    highlight: "Cozy specialty pour-over coffee & flaky croissants",
  },
  {
    id: "corner_house_blr",
    displayName: "Corner House Ice Cream",
    rating: 4.7,
    userRatingCount: 22300,
    priceLevel: "PRICE_LEVEL_INEXPENSIVE",
    estimatedCost: 210,
    address: "Residency Rd, Bengaluru",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Corner+House+Ice+Cream+Residency+Road+Bengaluru&query_place_id=ChIJg2x1000UrjsR2JtG-k6v52E",
    category: "Iconic Sundaes & Desserts",
    highlight: "Classic Death By Chocolate & hot fudge sundaes",
  },
];

/**
 * Builds a direct Google Maps Search / Place URL
 */
export function buildGoogleMapsUrl(name: string, placeId?: string): string {
  const encodedName = encodeURIComponent(name);
  if (placeId) {
    return `https://www.google.com/maps/search/?api=1&query=${encodedName}&query_place_id=${placeId}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodedName}`;
}

/**
 * Request user's current coordinates with timeout and Bengaluru fallback
 */
export async function getUserCoordinates(): Promise<{ lat: number; lng: number }> {
  if (typeof window === "undefined" || !navigator?.geolocation) {
    return { lat: 12.9716, lng: 77.5946 }; // Default: Bengaluru
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ lat: 12.9716, lng: 77.5946 });
    }, 2000);

    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          clearTimeout(timer);
          resolve({ lat: 12.9716, lng: 77.5946 });
        },
        { timeout: 2000, maximumAge: 60000 }
      );
    } catch {
      clearTimeout(timer);
      resolve({ lat: 12.9716, lng: 77.5946 });
    }
  });
}

/**
 * Fetch nearby budget places from /api/places or return curated spots
 */
export async function fetchNearbyBudgetPlaces(params: {
  query?: string;
  lat?: number;
  lng?: number;
  originalPrice?: number;
}): Promise<{
  places: PlaceSwapItem[];
  isLive: boolean;
}> {
  const origCost = params.originalPrice || 800;

  try {
    const res = await fetch("/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: params.query || "budget restaurant cafe",
        lat: params.lat,
        lng: params.lng,
        originalPrice: origCost,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.places) && data.places.length > 0) {
        return {
          places: data.places,
          isLive: Boolean(data.isLive),
        };
      }
    }
  } catch (err) {
    console.warn("Places API request failed, using curated fallback:", err);
  }

  // Curated Fallback
  const adjustedCurated = CURATED_BUDGET_RESTAURANTS.map((spot) => {
    // Ensure average cost for one is strictly lower than originalPrice (₹250 - ₹400 range)
    let cost = spot.estimatedCost;
    if (origCost < 500) {
      cost = Math.min(cost, Math.max(100, Math.round(origCost * 0.45)));
    } else if (cost >= origCost) {
      cost = Math.max(150, Math.round(origCost * 0.40));
    }
    return {
      ...spot,
      estimatedCost: cost,
      mapsUrl: spot.mapsUrl || buildGoogleMapsUrl(spot.displayName, spot.id),
    };
  });

  return {
    places: adjustedCurated,
    isLive: false,
  };
}
