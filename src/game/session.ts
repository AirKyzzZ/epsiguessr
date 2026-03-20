import { config } from "../config";

export type GameSession = {
  answer: string;
  answerFlag: string;
  imageUrl: string;
  lat: number;
  lng: number;
  playerTries: Map<string, number>; // discordUserId → tries used
  startedAt: number;
  startedBy: string;
  winnerId: string | null;
  timeout: ReturnType<typeof setTimeout> | null;
};

export function createSession(
  answer: string,
  answerFlag: string,
  imageUrl: string,
  lat: number,
  lng: number,
  startedBy: string
): GameSession {
  return {
    answer,
    answerFlag,
    imageUrl,
    lat,
    lng,
    playerTries: new Map(),
    startedAt: Date.now(),
    startedBy,
    winnerId: null,
    timeout: null,
  };
}

export function getPlayerTriesLeft(session: GameSession, userId: string): number {
  const used = session.playerTries.get(userId) ?? 0;
  return config.game.maxTries - used;
}

export function recordTry(session: GameSession, userId: string): number {
  const used = (session.playerTries.get(userId) ?? 0) + 1;
  session.playerTries.set(userId, used);
  return config.game.maxTries - used;
}

export function isSessionExpired(session: GameSession): boolean {
  return Date.now() - session.startedAt > config.game.roundTimeoutMs;
}
