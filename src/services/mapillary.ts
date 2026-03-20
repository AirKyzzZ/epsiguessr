import { config } from "../config";

type MapillaryImage = {
  id: string;
  thumbUrl: string;
  lat: number;
  lng: number;
};

type MapillaryApiResponse = {
  data: Array<{
    id: string;
    thumb_2048_url: string;
    geometry: {
      type: string;
      coordinates: [number, number]; // [lng, lat]
    };
  }>;
};

// Mapillary limits bbox area to strictly < 0.01 sq degrees.
// 0.049° per side → 0.098° × 0.098° = 0.0096 sq deg (under limit).
// This is ~100x more area than the previous 0.005° radius.
const SEARCH_RADIUS = 0.049;

export async function fetchNearbyImage(
  lat: number,
  lng: number,
  timeoutMs = 5000
): Promise<MapillaryImage | null> {
  const r = SEARCH_RADIUS;
  const bbox = `${lng - r},${lat - r},${lng + r},${lat + r}`;

  const url = new URL("https://graph.mapillary.com/images");
  url.searchParams.set("access_token", config.mapillaryToken);
  url.searchParams.set("fields", "id,thumb_2048_url,geometry");
  url.searchParams.set("bbox", bbox);
  url.searchParams.set("limit", "10");

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "GeoBot-Discord/1.0" },
    });
  } catch (error) {
    console.error("Mapillary API request failed:", error);
    return null;
  }

  if (!response.ok) {
    console.error(`Mapillary API error: ${response.status} ${response.statusText}`);
    return null;
  }

  try {
    const data = (await response.json()) as MapillaryApiResponse;

    if (!data.data || data.data.length === 0) {
      return null;
    }

    const image = data.data[Math.floor(Math.random() * data.data.length)];

    if (!image.thumb_2048_url || !image.geometry?.coordinates) {
      return null;
    }

    return {
      id: image.id,
      thumbUrl: image.thumb_2048_url,
      lat: image.geometry.coordinates[1],
      lng: image.geometry.coordinates[0],
    };
  } catch (error) {
    console.error("Mapillary response parse error:", error);
    return null;
  }
}
