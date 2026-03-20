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

const POOL_TARGET = 20;
const POOL_MIN = 5;
const MAX_FETCH_ATTEMPTS = 15;
const REFILL_INTERVAL_MS = 30_000; // check every 30s

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

async function validateOneLocation(): Promise<ValidatedLocation | null> {
  const location = generateRandomLocation();

  const result = await fetchNearbyImage(location.lat, location.lng, 10000);
  if (!result) return null;

  const geocodedCountry = await reverseGeocode(result.lat, result.lng);
  if (!geocodedCountry) return null;

  const matched = getCountryByName(geocodedCountry);
  if (!matched) return null;

  return {
    imageUrl: result.thumbUrl,
    lat: result.lat,
    lng: result.lng,
    country: matched.name,
    countryFlag: matched.flag,
    countryCode: matched.code,
  };
}

async function refillPool(): Promise<void> {
  if (isRefilling) return;
  if (pool.length >= POOL_TARGET) return;

  isRefilling = true;
  const needed = POOL_TARGET - pool.length;

  console.log(`[Pool] Refilling... (${pool.length}/${POOL_TARGET})`);

  let attempts = 0;
  let added = 0;

  while (added < needed && attempts < MAX_FETCH_ATTEMPTS * needed) {
    attempts++;
    try {
      const loc = await validateOneLocation();
      if (loc) {
        pool.push(loc);
        added++;
      }
      // Pace API calls to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error("[Pool] Error validating location:", error);
    }
  }

  console.log(`[Pool] Refilled: +${added} (${pool.length}/${POOL_TARGET}, ${attempts} attempts)`);
  isRefilling = false;
}

export function startPool(): void {
  console.log("[Pool] Starting location pool...");
  refillPool();

  setInterval(() => {
    if (pool.length < POOL_MIN) {
      refillPool();
    }
  }, REFILL_INTERVAL_MS);
}
