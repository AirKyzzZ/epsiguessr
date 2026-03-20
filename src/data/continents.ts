// Map country codes to continents
const continentMap: Record<string, string> = {
  // Africa
  DZ: "Africa", AO: "Africa", BJ: "Africa", BW: "Africa", BF: "Africa", BI: "Africa",
  CM: "Africa", CF: "Africa", TD: "Africa", CD: "Africa", CG: "Africa", CI: "Africa",
  EG: "Africa", ET: "Africa", GA: "Africa", GH: "Africa", GN: "Africa", KE: "Africa",
  LY: "Africa", MG: "Africa", MW: "Africa", ML: "Africa", MR: "Africa", MA: "Africa",
  MZ: "Africa", NA: "Africa", NE: "Africa", NG: "Africa", RW: "Africa", SN: "Africa",
  SL: "Africa", SO: "Africa", ZA: "Africa", SS: "Africa", SD: "Africa", TZ: "Africa",
  TG: "Africa", TN: "Africa", UG: "Africa", ZM: "Africa", ZW: "Africa",

  // Asia
  AF: "Asia", AM: "Asia", AZ: "Asia", BD: "Asia", BT: "Asia", BN: "Asia", KH: "Asia",
  CN: "Asia", GE: "Asia", IN: "Asia", ID: "Asia", IR: "Asia", IQ: "Asia", IL: "Asia",
  JP: "Asia", JO: "Asia", KZ: "Asia", KW: "Asia", KG: "Asia", LA: "Asia", LB: "Asia",
  MY: "Asia", MN: "Asia", MM: "Asia", NP: "Asia", KP: "Asia", OM: "Asia", PK: "Asia",
  PH: "Asia", QA: "Asia", SA: "Asia", SG: "Asia", KR: "Asia", LK: "Asia", SY: "Asia",
  TW: "Asia", TJ: "Asia", TH: "Asia", TM: "Asia", AE: "Asia", UZ: "Asia", VN: "Asia",
  YE: "Asia",

  // Europe
  AL: "Europe", AD: "Europe", AT: "Europe", BY: "Europe", BE: "Europe", BA: "Europe",
  BG: "Europe", HR: "Europe", CY: "Europe", CZ: "Europe", DK: "Europe", EE: "Europe",
  FI: "Europe", FR: "Europe", DE: "Europe", GR: "Europe", HU: "Europe", IS: "Europe",
  IE: "Europe", IT: "Europe", XK: "Europe", LV: "Europe", LT: "Europe", LU: "Europe",
  MK: "Europe", ME: "Europe", MD: "Europe", NL: "Europe", NO: "Europe", PL: "Europe",
  PT: "Europe", RO: "Europe", RU: "Europe", RS: "Europe", SK: "Europe", SI: "Europe",
  ES: "Europe", SE: "Europe", CH: "Europe", TR: "Europe", UA: "Europe", GB: "Europe",

  // North America
  CA: "North America", CR: "North America", CU: "North America", DO: "North America",
  SV: "North America", GT: "North America", HT: "North America", HN: "North America",
  JM: "North America", MX: "North America", NI: "North America", PA: "North America",
  TT: "North America", US: "North America",

  // South America
  AR: "South America", BO: "South America", BR: "South America", CL: "South America",
  CO: "South America", EC: "South America", PY: "South America", PE: "South America",
  UY: "South America", VE: "South America",

  // Oceania
  AU: "Oceania", NZ: "Oceania", PG: "Oceania",
};

export function getContinent(countryCode: string): string {
  return continentMap[countryCode] ?? "Unknown";
}
