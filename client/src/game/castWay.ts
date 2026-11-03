/**
 * Whether a way to play a card must be chosen on a labelled button of its own,
 * even when it's the only way: one that sacrifices a permanent (emerge,
 * offering) or asks another player to help pay (assist). A bare click on the
 * card, wherever it is, never does what it doesn't say.
 */
export function needsOwnButton(way: {
  readonly kind: string
  readonly emergeSacrifice?: unknown
  readonly assist?: unknown
}): boolean {
  return way.kind === 'cast-spell' && (way.emergeSacrifice !== undefined || way.assist !== undefined)
}
