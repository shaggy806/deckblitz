/**
 * Whether a way to play a card must be chosen on a labelled button of its own,
 * even when it's the only way: one that sacrifices a permanent (emerge,
 * offering), returns one to its owner's hand (sneak, web-slinging), taps one
 * (harmonize) or asks another player to help pay (assist). A bare click on the
 * card, wherever it is, never does what it doesn't say: in combat, sneak was a
 * card's only way, and a click cast it and sent the attacker home unasked
 * (2026-11-24).
 */
export function needsOwnButton(way: {
  readonly kind: string
  readonly emergeSacrifice?: unknown
  readonly assist?: unknown
  readonly sneakReturn?: unknown
  readonly webSlingingReturn?: unknown
  readonly harmonizeTap?: unknown
}): boolean {
  return (
    way.kind === 'cast-spell' &&
    (way.emergeSacrifice !== undefined ||
      way.assist !== undefined ||
      way.sneakReturn !== undefined ||
      way.webSlingingReturn !== undefined ||
      way.harmonizeTap !== undefined)
  )
}
