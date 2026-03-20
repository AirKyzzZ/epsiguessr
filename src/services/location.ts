import { countries, type Country } from "../data/countries";

// Countries weighted by Mapillary coverage (more images = higher weight)
// This increases the chance of finding an image on first try
const coverageWeights: Record<string, number> = {
  US: 5, DE: 5, FR: 5, GB: 4, SE: 4, NL: 4, IT: 3, ES: 3,
  BR: 3, JP: 3, AU: 3, CA: 3, PL: 3, NO: 3, DK: 3, BE: 3,
  AT: 3, CH: 3, CZ: 3, PT: 2, IN: 2, ID: 2, MX: 2, TH: 2,
  PH: 2, CO: 2, AR: 2, ZA: 2, KR: 2, TW: 2, NZ: 2, IE: 2,
  FI: 2, RO: 2, HU: 2, GR: 2, HR: 2, BG: 2, SK: 2, SI: 2,
};

function buildWeightedList(): Country[] {
  const weighted: Country[] = [];
  for (const country of countries) {
    const weight = coverageWeights[country.code] ?? 1;
    for (let i = 0; i < weight; i++) {
      weighted.push(country);
    }
  }
  return weighted;
}

const weightedCountries = buildWeightedList();

export type RandomLocation = {
  lat: number;
  lng: number;
  country: Country;
};

export function generateRandomLocation(): RandomLocation {
  const country = weightedCountries[Math.floor(Math.random() * weightedCountries.length)];
  const { bbox } = country;

  const lat = bbox.minLat + Math.random() * (bbox.maxLat - bbox.minLat);
  const lng = bbox.minLng + Math.random() * (bbox.maxLng - bbox.minLng);

  return { lat, lng, country };
}
