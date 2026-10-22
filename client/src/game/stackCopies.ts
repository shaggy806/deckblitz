import { stackCopyKey } from 'engine/client'
import type { ObjectId, PlayerView } from 'engine/client'

/**
 * Abilities on the stack that are copies of one another (`stackCopyKey`:
 * the same ability of a card of the same name, one controller, nothing
 * chosen) — Mesmeric Orb's trigger for each permanent that untapped. The
 * stack draws a run of them as one entry, and a frame resolving several of
 * them plays one exit (`animationSchedule`'s `stackCopies`).
 */

/** Each ability on the stack, by its copy key. */
export function stackCopiesOf(view: PlayerView): Map<ObjectId, string> {
  const out = new Map<ObjectId, string>()
  for (const id of view.zones.stack) {
    const object = view.objects[id]
    const key = object === undefined ? null : stackCopyKey(object)
    if (key !== null) out.set(id, key)
  }
  return out
}

/** `ids` (top first) cut into runs: each a lone object, or consecutive
 * copies of one ability, top first. */
export function stackRuns(view: PlayerView, ids: readonly ObjectId[]): ObjectId[][] {
  const runs: ObjectId[][] = []
  let runKey: string | null = null
  for (const id of ids) {
    const object = view.objects[id]
    const key = object === undefined ? null : stackCopyKey(object)
    const last = runs.at(-1)
    if (key !== null && key === runKey && last !== undefined) last.push(id)
    else runs.push([id])
    runKey = key
  }
  return runs
}
