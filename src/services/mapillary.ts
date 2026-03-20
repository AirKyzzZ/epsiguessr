import { config } from "../config";
import { generateRandomLocation } from "./location";

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
// 0.025° per side → 0.05° × 0.05° = 0.0025 sq deg (well under limit).
const SEARCH_RADIUS = 0.025;

// Mapillary API hangs indefinitely for many coordinate regions.
// Working responses arrive in 1-3s, so 4s is a safe cutoff.
const DEFAULT_TIMEOUT_MS = 4000;

// Fire multiple parallel requests and return the first with results.
// This works around Mapillary's region-specific hangs.
const PARALLEL_BATCH_SIZE = 5;

async function fetchSingleImage(
  lat: number,
  lng: number,
  timeoutMs: number
): Promise<MapillaryImage | null> {
  const r = SEARCH_RADIUS;
  const bbox = `${lng - r},${lat - r},${lng + r},${lat + r}`;

  const rawUrl = `https://graph.mapillary.com/images?access_token=${config.mapillaryToken}&fields=id,thumb_2048_url,geometry&bbox=${bbox}&limit=10`;

  let response: Response;
  try {
    response = await fetch(rawUrl, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent": "GeoBot-Discord/1.0",
        "Connection": "close",
      },
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  try {
    const data = (await response.json()) as MapillaryApiResponse;

    if (!data.data || data.data.length === 0) return null;

    const image = data.data[Math.floor(Math.random() * data.data.length)];

    if (!image.thumb_2048_url || !image.geometry?.coordinates) return null;

    return {
      id: image.id,
      thumbUrl: image.thumb_2048_url,
      lat: image.geometry.coordinates[1],
      lng: image.geometry.coordinates[0],
    };
  } catch {
    return null;
  }
}

export async function fetchNearbyImage(
  lat: number,
  lng: number,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<MapillaryImage | null> {
  return fetchSingleImage(lat, lng, timeoutMs);
}

// Try multiple random locations in parallel and return the first success.
export async function fetchRandomImageParallel(
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<{ image: MapillaryImage; countryCode: string } | null> {
  const locations = Array.from({ length: PARALLEL_BATCH_SIZE }, () =>
    generateRandomLocation()
  );

  const results = await Promise.allSettled(
    locations.map((loc) => fetchSingleImage(loc.lat, loc.lng, timeoutMs))
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      return { image: result.value, countryCode: "" };
    }
  }

  return null;
}
