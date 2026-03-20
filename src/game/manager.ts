import { type GameSession } from "./session";

// One active game per channel
const activeSessions = new Map<string, GameSession>();

export function getSession(channelId: string): GameSession | undefined {
  return activeSessions.get(channelId);
}

export function setSession(channelId: string, session: GameSession): void {
  activeSessions.set(channelId, session);
}

export function endSession(channelId: string): GameSession | undefined {
  const session = activeSessions.get(channelId);
  if (session?.timeout) {
    clearTimeout(session.timeout);
  }
  activeSessions.delete(channelId);
  return session;
}

export function hasActiveSession(channelId: string): boolean {
  return activeSessions.has(channelId);
}
