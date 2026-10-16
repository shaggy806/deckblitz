import type { LegalAction } from 'engine/client'

const NONE: readonly LegalAction[] = []

/**
 * What the table may show and act on (`GameScreen` hands it to `Table`).
 * Nothing while a bot plays this seat, whose answers the server makes. While a
 * frame plays out (`busy`), nothing either — those actions belong to a board
 * the player can't see yet, and the server holds its bots to the same rule —
 * except the mulligan, which stays up (its buttons locked) so an opponent's
 * shuffle, or your own hand going back and the new one dealt into it, doesn't
 * take the whole popup away and bring it back. Only while the newest frame
 * (`latest`) still asks it: a mulligan already answered isn't held up.
 */
export function tableActions(
  shown: readonly LegalAction[],
  latest: readonly LegalAction[],
  busy: boolean,
  botPlaying: boolean,
): readonly LegalAction[] {
  if (botPlaying) return NONE
  if (!busy) return shown
  if (!latest.some((a) => a.kind === 'mulligan')) return NONE
  const mulligan = shown.filter((a) => a.kind === 'mulligan')
  return mulligan.length > 0 ? mulligan : NONE
}

/**
 * Whether the mulligan popup's buttons can be used while a frame plays out
 * (`busy`) — they're locked otherwise, as everything is. Mulligans are
 * decided in parallel, so another player's mulligan (a bot's shuffle) leaves
 * the viewer's own decision as it was: the frame on screen and the newest
 * one ask the same mulligan (`count`, the mulligans taken), and answering it
 * now races nothing. Locked only while the viewer's own hand is changing —
 * their own mulligan going back and the new hand being dealt — when the
 * counts differ. (A bug report, 2026-10-15: a table of mulliganing bots kept
 * the player's buttons locked shuffle after shuffle.)
 */
export function mulliganLive(
  shown: readonly LegalAction[],
  latest: readonly LegalAction[],
  busy: boolean,
): boolean {
  if (!busy) return false
  const asked = (actions: readonly LegalAction[]) => {
    const m = actions.find((a) => a.kind === 'mulligan')
    return m?.kind === 'mulligan' ? m.count : null
  }
  const now = asked(shown)
  return now !== null && now === asked(latest)
}
