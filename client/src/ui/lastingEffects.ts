import type { ObjectId, PlayerId, PlayerView, VisibleObject } from 'engine/client'
import { emblemToVisible } from './defToVisible.ts'

/** One of `PlayerView.lastingEffects`: what a resolved spell or ability left
 * on a player or the game for a while. */
export type LastingEffect = NonNullable<PlayerView['lastingEffects']>[number]

/**
 * When a lasting effect ends, as a heading: "Until end of turn", "Until your
 * next turn", "Until the end of Bob's next turn", "For the rest of the game".
 * `null` where it ends some other way (its text says how) or is still to come
 * (an extra turn). `whose` names a player as the viewer reads them.
 */
export function lastingEndsLabel(ends: LastingEffect['ends'], whose: (player: PlayerId) => string): string | null {
  if (ends === 'end-of-turn') return 'Until end of turn'
  if (ends === 'end-of-combat') return 'Until end of combat'
  if (ends === 'permanent') return 'For the rest of the game'
  if (ends === 'later') return null
  if ('untilTurnOf' in ends) return `Until ${whose(ends.untilTurnOf)} next turn`
  return `Until the end of ${whose(ends.untilEndOfTurnOf)} next turn`
}

/**
 * A lasting effect as a card the zone viewer can draw beside the emblems:
 * titled "Effect — <source>" (or "Effect" where the state doesn't say what
 * made it), led by when it ends unless its words already say. `index` only
 * has to be unique among the effects shown.
 */
export function lastingToVisible(effect: LastingEffect, index: number, whose: (player: PlayerId) => string): VisibleObject {
  const ends = lastingEndsLabel(effect.ends, whose)
  const words = effect.text.toLowerCase()
  const saysWhen =
    ends !== null && (words.includes(ends.toLowerCase()) || (effect.ends === 'end-of-turn' && words.includes('this turn')))
  const text = ends === null || saysWhen ? effect.text : `${ends}:\n${effect.text}`
  const card = emblemToVisible({ owner: effect.player, text, source: effect.source }, index)
  return {
    ...card,
    id: `lasting-${index}` as ObjectId,
    name: effect.source === null ? 'Effect' : `Effect — ${effect.source}`,
  }
}
