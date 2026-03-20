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
const MAX_RADIUS = 0.049;

// Search offsets: center, then cardinal directions at increasing distances.
// Each search covers a 0.1° × 0.1° area (~11km × 11km).
const SEARCH_OFFSETS = [
  { dlat: 0, dlng: 0 },        // center
  { dlat: 0.1, dlng: 0 },      // north
  { dlat: -0.1, dlng: 0 },     // south
  { dlat: 0, dlng: 0.1 },      // east
  { dlat: 0, dlng: -0.1 },     // west
  { dlat: 0.2, dlng: 0.2 },    // NE far
  { dlat: -0.2, dlng: -0.2 },  // SW far
  { dlat: 0.3, dlng: 0 },      // north far
  { dlat: 0, dlng: 0.3 },      // east far
];

export async function fetchNearbyImage(
  lat: number,
  lng: number
): Promise<MapillaryImage | null> {
  for (const offset of SEARCH_OFFSETS) {
    const result = await searchWithRadius(
      lat + offset.dlat,
      lng + offset.dlng,
      MAX_RADIUS
    );
    if (result) return result;
  }
  return null;
}

async function searchWithRadius(
  lat: number,
  lng: number,
  r: number
): Promise<MapillaryImage | null> {
  const bbox = `${lng - r},${lat - r},${lng + r},${lat + r}`;

  const url = new URL("https://graph.mapillary.com/images");
  url.searchParams.set("access_token", config.mapillaryToken);
  url.searchParams.set("fields", "id,thumb_2048_url,geometry");
  url.searchParams.set("bbox", bbox);
  url.searchParams.set("limit", "10");

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    console.error(`Mapillary API request failed (radius ${r}):`, error);
    return null;
  }

  if (!response.ok) {
    console.error(`Mapillary API error (radius ${r}): ${response.status} ${response.statusText}`);
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
