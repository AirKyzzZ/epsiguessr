import Fuse from "fuse.js";
import { countries, type Country } from "../data/countries";

const allEntries: { name: string; country: Country }[] = [];

for (const country of countries) {
  allEntries.push({ name: country.name.toLowerCase(), country });
  allEntries.push({ name: country.frenchName.toLowerCase(), country });
  allEntries.push({ name: country.code.toLowerCase(), country });
  for (const alias of country.aliases) {
    allEntries.push({ name: alias.toLowerCase(), country });
  }
}

const fuse = new Fuse(allEntries, {
  keys: ["name"],
  threshold: 0.4,
  includeScore: true,
});

function normalize(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .replace(/[^a-z0-9\s]/g, ""); // remove special chars
}

export function matchCountry(guess: string, answer: string): boolean {
  const normalizedGuess = normalize(guess);
  const normalizedAnswer = normalize(answer);

  // Direct match against the answer
  if (normalizedGuess === normalizedAnswer) return true;

  // Check if guess matches any alias/code/frenchName of the answer country
  const answerCountry = countries.find(
    (c) =>
      normalize(c.name) === normalizedAnswer ||
      normalize(c.frenchName) === normalizedAnswer ||
      normalize(c.code) === normalizedAnswer ||
      c.aliases.some((a) => normalize(a) === normalizedAnswer)
  );

  if (answerCountry) {
    if (normalize(answerCountry.code) === normalizedGuess) return true;
    if (normalize(answerCountry.name) === normalizedGuess) return true;
    if (normalize(answerCountry.frenchName) === normalizedGuess) return true;
    if (answerCountry.aliases.some((a) => normalize(a) === normalizedGuess)) {
      return true;
    }
  }

  // Fuzzy match — only accept if the best match points to the same country as the answer
  const results = fuse.search(normalizedGuess);
  if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.35) {
    const matchedCountry = results[0].item.country;
    if (answerCountry && matchedCountry.code === answerCountry.code) {
      return true;
    }
  }

  return false;
}

export function getCountryByName(name: string): Country | undefined {
  const normalized = normalize(name);
  return countries.find(
    (c) =>
      normalize(c.name) === normalized ||
      normalize(c.frenchName) === normalized ||
      normalize(c.code) === normalized ||
      c.aliases.some((a) => normalize(a) === normalized)
  );
}

/** Check if the text resembles any country name (used to filter out non-guess chat) */
export function couldBeCountryGuess(text: string): boolean {
  const normalized = normalize(text);
  if (normalized.length < 2) return false;

  // Exact match against any entry
  if (allEntries.some((e) => e.name === normalized)) return true;

  // Fuzzy match with a looser threshold than actual answer matching
  const results = fuse.search(normalized);
  if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.45) {
    return true;
  }

  return false;
}
