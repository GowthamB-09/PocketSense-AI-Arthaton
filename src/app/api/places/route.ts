import { NextResponse } from "next/server";
import { CURATED_BUDGET_RESTAURANTS, buildGoogleMapsUrl, PlaceSwapItem } from "@/lib/maps/placesService";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { query = "", lat, lng, originalPrice = 800 } = body;

    const rawKey =
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "";

    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");
    const origCost = Number(originalPrice) || 800;

    // If key is present and appears valid, query Google Places API (New)
    if (apiKey && apiKey.length > 5 && !apiKey.toLowerCase().includes("your_")) {
      try {
        const textQuery = query && query.trim() ? `${query} budget food cafe` : "budget restaurant cafe";
        const centerLat = Number(lat) || 12.9716;
        const centerLng = Number(lng) || 77.5946;

        const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.priceLevel,places.rating,places.userRatingCount,places.googleMapsUri",
          },
          body: JSON.stringify({
            textQuery,
            locationBias: {
              circle: {
                center: {
                  latitude: centerLat,
                  longitude: centerLng,
                },
                radius: 3000.0, // 3km radius
              },
            },
            priceLevels: ["PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"],
            minRating: 4.2,
            maxResultCount: 6,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.places) && data.places.length > 0) {
            const places: PlaceSwapItem[] = data.places
              .filter((p: any) => (p.rating || 0) >= 4.2)
              .map((p: any) => {
                const name = p.displayName?.text || "Popular Eatery";
                const isModerate = p.priceLevel === "PRICE_LEVEL_MODERATE";
                
                // Dynamic estimated cost for one (~₹250 - ₹400), strictly less than originalPrice
                let baseCost = isModerate ? 360 : 260;
                if (origCost <= 400) {
                  baseCost = Math.max(100, Math.round(origCost * 0.45));
                } else if (baseCost >= origCost) {
                  baseCost = Math.max(150, Math.round(origCost * 0.40));
                }

                const mapsUrl =
                  p.googleMapsUri || buildGoogleMapsUrl(name, p.id);

                return {
                  id: p.id || String(Math.random()),
                  displayName: name,
                  rating: Number(p.rating) || 4.3,
                  userRatingCount: p.userRatingCount || 100,
                  priceLevel: p.priceLevel || "PRICE_LEVEL_INEXPENSIVE",
                  estimatedCost: baseCost,
                  address: p.formattedAddress || "Nearby",
                  mapsUrl,
                  category: isModerate ? "Casual Dining" : "Budget Eatery",
                };
              });

            if (places.length > 0) {
              return NextResponse.json({
                places,
                isLive: true,
              });
            }
          }
        }
      } catch (apiErr) {
        console.warn("Error calling Google Places API (New):", apiErr);
      }
    }

    // Graceful Fallback Mode: return curated local budget places
    const fallbackPlaces: PlaceSwapItem[] = CURATED_BUDGET_RESTAURANTS.map((spot) => {
      let cost = spot.estimatedCost;
      if (origCost <= 400) {
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

    return NextResponse.json({
      places: fallbackPlaces,
      isLive: false,
    });
  } catch (err) {
    return NextResponse.json(
      {
        places: CURATED_BUDGET_RESTAURANTS,
        isLive: false,
      },
      { status: 200 }
    );
  }
}
