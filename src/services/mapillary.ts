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

export async function fetchNearbyImage(
  lat: number,
  lng: number
): Promise<MapillaryImage | null> {
  const r = config.game.mapillarySearchRadius;
  const bbox = `${lng - r},${lat - r},${lng + r},${lat + r}`;

  const url = new URL("https://graph.mapillary.com/images");
  url.searchParams.set("access_token", config.mapillaryToken);
  url.searchParams.set("fields", "id,thumb_2048_url,geometry");
  url.searchParams.set("bbox", bbox);
  url.searchParams.set("limit", "10");

  const response = await fetch(url.toString());

  if (!response.ok) {
    console.error(`Mapillary API error: ${response.status} ${response.statusText}`);
    return null;
  }

  const data = (await response.json()) as MapillaryApiResponse;

  if (!data.data || data.data.length === 0) {
    return null;
  }

  // Pick a random image from results for variety
  const image = data.data[Math.floor(Math.random() * data.data.length)];

  return {
    id: image.id,
    thumbUrl: image.thumb_2048_url,
    lat: image.geometry.coordinates[1],
    lng: image.geometry.coordinates[0],
  };
}
