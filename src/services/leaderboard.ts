import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(path.dirname(__dirname), "..", "geoguessr.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    discord_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    wins INTEGER NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    best_streak INTEGER NOT NULL DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    lang TEXT NOT NULL DEFAULT 'en'
  )
`);

const upsertStmt = db.prepare(`
  INSERT INTO players (discord_id, username, wins, games_played, current_streak, best_streak)
  VALUES (?, ?, 0, 0, 0, 0)
  ON CONFLICT(discord_id) DO UPDATE SET username = excluded.username
`);

const recordWinStmt = db.prepare(`
  UPDATE players SET
    wins = wins + 1,
    games_played = games_played + 1,
    current_streak = current_streak + 1,
    best_streak = MAX(best_streak, current_streak + 1)
  WHERE discord_id = ?
`);

const recordLossStmt = db.prepare(`
  UPDATE players SET
    games_played = games_played + 1,
    current_streak = 0
  WHERE discord_id = ?
`);

const topPlayersStmt = db.prepare(`
  SELECT discord_id, username, wins, games_played, current_streak, best_streak
  FROM players
  ORDER BY wins DESC
  LIMIT 10
`);

const playerStatsStmt = db.prepare(`
  SELECT discord_id, username, wins, games_played, current_streak, best_streak
  FROM players
  WHERE discord_id = ?
`);

const getGuildLangStmt = db.prepare(`
  SELECT lang FROM guild_settings WHERE guild_id = ?
`);

const setGuildLangStmt = db.prepare(`
  INSERT INTO guild_settings (guild_id, lang) VALUES (?, ?)
  ON CONFLICT(guild_id) DO UPDATE SET lang = excluded.lang
`);

export type PlayerStats = {
  discord_id: string;
  username: string;
  wins: number;
  games_played: number;
  current_streak: number;
  best_streak: number;
};

export function ensurePlayer(discordId: string, username: string): void {
  upsertStmt.run(discordId, username);
}

export function recordWin(discordId: string, username: string): void {
  ensurePlayer(discordId, username);
  recordWinStmt.run(discordId);
}

export function recordLoss(discordId: string, username: string): void {
  ensurePlayer(discordId, username);
  recordLossStmt.run(discordId);
}

export function getTopPlayers(): PlayerStats[] {
  return topPlayersStmt.all() as PlayerStats[];
}

export function getPlayerStats(discordId: string): PlayerStats | undefined {
  return playerStatsStmt.get(discordId) as PlayerStats | undefined;
}

export function getGuildLang(guildId: string): string | undefined {
  const row = getGuildLangStmt.get(guildId) as { lang: string } | undefined;
  return row?.lang;
}

export function setGuildLangDb(guildId: string, lang: string): void {
  setGuildLangStmt.run(guildId, lang);
}
