import Fuse from "fuse.js";
import { countries, type Country } from "../data/countries";

const allEntries: { name: string; country: Country }[] = [];

for (const country of countries) {
  allEntries.push({ name: country.name.toLowerCase(), country });
  allEntries.push({ name: country.code.toLowerCase(), country });
  for (const alias of country.aliases) {
    allEntries.push({ name: alias.toLowerCase(), country });
  }
}

const fuse = new Fuse(allEntries, {
  keys: ["name"],
  threshold: 0.3,
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

  // Check if guess matches any alias/code of the answer country
  const answerCountry = countries.find(
    (c) => normalize(c.name) === normalizedAnswer
  );

  if (answerCountry) {
    if (normalize(answerCountry.code) === normalizedGuess) return true;
    if (answerCountry.aliases.some((a) => normalize(a) === normalizedGuess)) {
      return true;
    }
  }

  // Fuzzy match — only accept if the best match points to the same country as the answer
  const results = fuse.search(normalizedGuess);
  if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.2) {
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
      normalize(c.code) === normalized ||
      c.aliases.some((a) => normalize(a) === normalized)
  );
}
