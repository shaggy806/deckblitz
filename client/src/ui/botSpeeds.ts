import type { BotSpeed } from 'protocol'

/** Slowest first, as the Settings panel's animation speeds are. */
export const BOT_SPEEDS: readonly { readonly speed: BotSpeed; readonly label: string }[] = [
  { speed: 'slow', label: 'Slow' },
  { speed: 'normal', label: 'Normal' },
  { speed: 'fast', label: 'Fast' },
]

const STORAGE_KEY = 'mtg.botSpeed'

/**
 * The speed this device's host last picked for a room's bots, or `null` if
 * it never picked one. A room's speed is the room's, and a new room starts
 * at the server's Slow, so the client remembers the last pick and asks for
 * it as it makes a room (`useNetworkGame`): a lobby's and a blitz's alike
 * (the user, 2026-11-15).
 */
export function rememberedBotSpeed(): BotSpeed | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return BOT_SPEEDS.find((s) => s.speed === stored)?.speed ?? null
  } catch {
    return null
  }
}

/** Notes the host's pick for the rooms this device makes later. */
export function rememberBotSpeed(speed: BotSpeed): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, speed)
  } catch {
    // Not remembered: the next room opens at the server's speed.
  }
}
