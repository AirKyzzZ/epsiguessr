import { countries, type Country } from "../data/countries";

// Countries weighted by Mapillary coverage density (coverage / bbox area).
// Small, densely-covered countries are favored for reliable image finding.
// Large countries (US, BR, AU) have lots of coverage but huge bboxes,
// so random points rarely hit covered roads.
const coverageWeights: Record<string, number> = {
  DE: 8, NL: 8, BE: 8, CH: 7, AT: 7, DK: 7, CZ: 7,
  FR: 6, GB: 6, SE: 6, IT: 5, ES: 5, PL: 5, NO: 5,
  PT: 4, IE: 4, SK: 4, SI: 4, HR: 4, HU: 4,
  JP: 3, KR: 3, TW: 3, US: 3, CA: 2, RO: 3, BG: 3, GR: 3,
  FI: 2, BR: 2, AU: 2, NZ: 2, MX: 2, IN: 2, ID: 2,
  TH: 2, PH: 2, CO: 2, AR: 2, ZA: 2,
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
