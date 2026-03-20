type NominatimResponse = {
  address?: {
    country?: string;
    country_code?: string;
  };
};

let lastRequestTime = 0;

async function respectRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
  }
  lastRequestTime = Date.now();
}

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  await respectRateLimit();

  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lng.toString());
  url.searchParams.set("format", "json");
  url.searchParams.set("zoom", "3"); // country level

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "GeoBot-Discord/1.0",
    },
  });

  if (!response.ok) {
    console.error(`Nominatim error: ${response.status} ${response.statusText}`);
    return null;
  }

  const data = (await response.json()) as NominatimResponse;
  return data.address?.country ?? null;
}
