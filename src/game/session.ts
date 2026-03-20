import { config } from "../config";

export type PlayerEntry = {
  tries: number;
  username: string;
};

export type GameSession = {
  answer: string;
  answerFlag: string;
  answerCode: string;
  imageUrl: string;
  lat: number;
  lng: number;
  playerTries: Map<string, PlayerEntry>; // discordUserId → { tries, username }
  hintsUsed: number;
  startedAt: number;
  startedBy: string;
  winnerId: string | null;
  timeout: ReturnType<typeof setTimeout> | null;
};

export function createSession(
  answer: string,
  answerFlag: string,
  answerCode: string,
  imageUrl: string,
  lat: number,
  lng: number,
  startedBy: string
): GameSession {
  return {
    answer,
    answerFlag,
    answerCode,
    imageUrl,
    lat,
    lng,
    playerTries: new Map(),
    hintsUsed: 0,
    startedAt: Date.now(),
    startedBy,
    winnerId: null,
    timeout: null,
  };
}

export function getPlayerTriesLeft(session: GameSession, userId: string): number {
  const entry = session.playerTries.get(userId);
  return config.game.maxTries - (entry?.tries ?? 0);
}

export function recordTry(session: GameSession, userId: string, username: string): number {
  const existing = session.playerTries.get(userId);
  const tries = (existing?.tries ?? 0) + 1;
  session.playerTries.set(userId, { tries, username });
  return config.game.maxTries - tries;
}

export function allPlayersExhausted(session: GameSession): boolean {
  if (session.playerTries.size === 0) return false;
  for (const [, entry] of session.playerTries) {
    if (entry.tries < config.game.maxTries) return false;
  }
  return true;
}
