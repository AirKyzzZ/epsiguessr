import { type GameSession } from "./session";

// One active game per channel
const activeSessions = new Map<string, GameSession>();

// Channels currently setting up a game (prevents race condition)
const pendingChannels = new Set<string>();

export function getSession(channelId: string): GameSession | undefined {
  return activeSessions.get(channelId);
}

export function setSession(channelId: string, session: GameSession): void {
  activeSessions.set(channelId, session);
  pendingChannels.delete(channelId);
}

export function endSession(channelId: string): GameSession | undefined {
  const session = activeSessions.get(channelId);
  if (session?.timeout) {
    clearTimeout(session.timeout);
  }
  activeSessions.delete(channelId);
  pendingChannels.delete(channelId);
  return session;
}

export function hasActiveSession(channelId: string): boolean {
  return activeSessions.has(channelId) || pendingChannels.has(channelId);
}

export function markPending(channelId: string): void {
  pendingChannels.add(channelId);
}

export function clearPending(channelId: string): void {
  pendingChannels.delete(channelId);
}
