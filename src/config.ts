import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  discordToken: requireEnv("DISCORD_TOKEN"),
  discordClientId: requireEnv("DISCORD_CLIENT_ID"),
  mapillaryToken: requireEnv("MAPILLARY_TOKEN"),

  game: {
    maxTries: 3,
    roundTimeoutMs: 2 * 60 * 1000, // 2 minutes
    maxRetries: 10,
  },
} as const;
