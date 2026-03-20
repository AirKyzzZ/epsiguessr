import { generateRandomLocation } from "./location";
import { fetchNearbyImage } from "./mapillary";
import { reverseGeocode } from "./geocoding";
import { getCountryByName } from "../game/matcher";

type ValidatedLocation = {
  imageUrl: string;
  lat: number;
  lng: number;
  country: string;
  countryFlag: string;
  countryCode: string;
};

const POOL_TARGET = 15;
const POOL_MIN = 3;
const REFILL_INTERVAL_MS = 30_000;
const PARALLEL_FETCH = 5;

const pool: ValidatedLocation[] = [];
let isRefilling = false;

export function getPoolSize(): number {
  return pool.length;
}

export function takeLocation(): ValidatedLocation | null {
  if (pool.length === 0) return null;
  const index = Math.floor(Math.random() * pool.length);
  return pool.splice(index, 1)[0];
}

async function refillPool(): Promise<void> {
  if (isRefilling) return;
  if (pool.length >= POOL_TARGET) return;

  isRefilling = true;
  const needed = POOL_TARGET - pool.length;

  console.log(`[Pool] Refilling... (${pool.length}/${POOL_TARGET})`);

  let added = 0;
  let rounds = 0;
  const maxRounds = needed * 10;

  while (added < needed && rounds < maxRounds) {
    rounds++;

    // Try multiple locations in parallel
    const locations = Array.from({ length: PARALLEL_FETCH }, () =>
      generateRandomLocation()
    );

    const results = await Promise.allSettled(
      locations.map((loc) => fetchNearbyImage(loc.lat, loc.lng, 5000))
    );

    const responded = results.filter(
      (r) => r.status === "fulfilled" && r.value
    ).length;
    if (responded > 0) {
      console.log(`[Pool] Round ${rounds}: ${responded}/${PARALLEL_FETCH} Mapillary hits`);
    }

    // Process successful results (geocode sequentially due to Nominatim rate limit)
    for (const result of results) {
      if (result.status !== "fulfilled" || !result.value) continue;

      const geocodedCountry = await reverseGeocode(
        result.value.lat,
        result.value.lng
      );
      if (!geocodedCountry) continue;

      const matched = getCountryByName(geocodedCountry);
      if (!matched) continue;

      pool.push({
        imageUrl: result.value.thumbUrl,
        lat: result.value.lat,
        lng: result.value.lng,
        country: matched.name,
        countryFlag: matched.flag,
        countryCode: matched.code,
      });
      added++;

      if (added >= needed) break;
    }

    // Brief pause between batches
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(
    `[Pool] Refilled: +${added} (${pool.length}/${POOL_TARGET}, ${rounds} rounds)`
  );
  isRefilling = false;
}

export function startPool(): void {
  console.log("[Pool] Starting location pool (delayed 10s)...");

  setTimeout(() => {
    refillPool();
  }, 10_000);

  setInterval(() => {
    if (pool.length < POOL_MIN) {
      refillPool();
    }
  }, REFILL_INTERVAL_MS);
}
