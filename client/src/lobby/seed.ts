/** A game's seed is 32 bits (the server's `SEED_MAX`, `RoomSettings.seed`). */
const SEED_MAX = 0xffffffff

/**
 * What a seed pasted into the waiting room's Seed box reads as: its digits,
 * with or without the "seed" a game log's first line puts before them; blank
 * is random (`null`). `undefined` for anything else, or a number past 32 bits.
 */
export function parseSeed(text: string): number | null | undefined {
  const trimmed = text.trim()
  if (trimmed === '') return null
  const match = /^(?:seed\s*)?(\d{1,10})$/i.exec(trimmed)
  if (match === null) return undefined
  const value = Number(match[1])
  return value <= SEED_MAX ? value : undefined
}
