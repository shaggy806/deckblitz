import type { ObjectId, PlayerId, PlayerView, VisibleObject } from 'engine/client'
import { emblemToVisible } from './defToVisible.ts'

/** One of `PlayerView.delayedTriggers`: a delayed triggered ability waiting
 * to trigger (rule 603.7). */
export type DelayedTrigger = NonNullable<PlayerView['delayedTriggers']>[number]

/** What each step a delayed ability can wait for is called in its "at the
 * beginning of …" (the engine's `DelayedStep`). */
const STEP_WORDS: Readonly<Record<string, string>> = {
  upkeep: 'upkeep',
  draw: 'draw step',
  'precombat-main': 'precombat main phase',
  main: 'main phase',
  'begin-combat': 'combat',
  'declare-attackers': 'declare attackers step',
  'end-combat': 'end of combat',
  'postcombat-main': 'postcombat main phase',
  end: 'end step',
  cleanup: 'cleanup step',
}

/**
 * When a delayed ability waiting on a step triggers, in the words a card
 * would use: "At the beginning of the next end step", "At the beginning of
 * your next upkeep", "At the beginning of Bob's next end step this turn".
 * `whose` names a player as the viewer reads them ("your", "Bob's"). `null`
 * for one that waits on an event, whose own text says when.
 */
export function delayedWhen(at: DelayedTrigger['at'], whose: (player: PlayerId) => string): string | null {
  if (at === null) return null
  const step = STEP_WORDS[at.step] ?? at.step
  const thisTurn = at.which === 'this-turn' ? ' this turn' : ''
  if (at.step === 'end-combat') {
    return at.whose === 'any' ? `At the next end of combat${thisTurn}` : `At end of combat on ${whose(at.whose)} next turn`
  }
  const which = at.which === 'next-turn' ? 'next turn’s' : 'next'
  const owner = at.whose === 'any' ? 'the' : whose(at.whose)
  return `At the beginning of ${owner} ${which} ${step}${thisTurn}`
}

/** Whether a delayed ability's own text already says when it triggers
 * ("Return it to your hand at the beginning of the next end step"), so its
 * card doesn't say it twice. */
function saysWhen(text: string): boolean {
  return /\bat the beginning of\b|\bat end of combat\b|^(when|whenever|at)\b/i.test(text)
}

/**
 * A delayed ability as a card the zone viewer can draw beside the emblems:
 * titled "Delayed — <source>" with the source's art, its text led by when
 * it triggers, and the cards it acts on named after it. `index` only has to
 * be unique among the delayed abilities shown.
 */
export function delayedToVisible(
  delayed: DelayedTrigger,
  index: number,
  whose: (player: PlayerId) => string,
  objects: Readonly<Record<ObjectId, VisibleObject>>,
): VisibleObject {
  const when = delayedWhen(delayed.at, whose)
  const names = delayed.objects.flatMap((id) => {
    const o = objects[id]
    return o === undefined ? [] : [o.name ?? o.cardName]
  })
  const lines = [
    when !== null && !saysWhen(delayed.text) ? `${when}:` : null,
    delayed.text,
    names.length > 0 ? `(${names.join(', ')})` : null,
  ].filter((l): l is string => l !== null)
  const card = emblemToVisible({ owner: delayed.controller, text: lines.join('\n'), source: delayed.source }, index)
  return { ...card, id: `delayed-${index}` as ObjectId, name: `Delayed — ${delayed.source}` }
}
