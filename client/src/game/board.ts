/**
 * Groups a player's battlefield into the shapes the board renders:
 *  - permanents split into type buckets (lands / creatures / artifacts /
 *    enchantments), using the single most-expansive type for anything that's
 *    more than one (e.g. an artifact creature renders with the creatures);
 *  - Auras/Equipment pulled out of their own bucket and nested under whatever
 *    they're attached to, wherever that host ends up;
 *  - otherwise-identical lands, or identical *token* copies of a nonland
 *    permanent (the same in everything the view shows — see `tileKey` — with
 *    no counters and nothing attached) collapsed into one stack with a count.
 *    Nonland stacking is token-only — a same-named nontoken permanent (rare,
 *    but real, e.g. two cast copies of a card that allows it) stays its own
 *    tile rather than folding into a stack that implies "these are
 *    interchangeable".
 */

import type { ObjectId, PlayerId, PlayerView, VisibleObject } from 'engine/client'

export type Bucket = 'land' | 'creature' | 'planeswalker' | 'artifact' | 'enchantment'

export interface BoardEntry {
  /** All object ids this tile represents — more than one when identical
   * lands or tokens fold together. */
  readonly ids: readonly ObjectId[]
  /** How many permanents the tile stands for: one per id, except that an id
   * may itself be one of the engine's compacted token stacks, which counts as
   * every token in it (`VisibleObject.stackCount`). Both happen on one tile:
   * a token split off a stack (a pump, a sacrifice choice) goes back to being
   * identical to the rest once whatever singled it out wears off. */
  readonly count: number
  /** Representative object to render (a land stack's members are identical). */
  readonly sample: VisibleObject
  readonly bucket: Bucket
  /** Auras/Equipment attached to this entry, rendered nested underneath it. */
  readonly attachments: readonly VisibleObject[]
}

/** The single bucket a permanent belongs in, most-expansive type wins. Only
 * `land` vs. everything else actually splits the board into rows — the
 * finer-grained bucket exists for `bucketOf`'s stacking rule (only lands
 * stack) and stays around for whatever wants it later. */
export function bucketOf(obj: VisibleObject): Bucket {
  if (obj.types.includes('land')) return 'land'
  if (obj.types.includes('creature')) return 'creature'
  if (obj.types.includes('planeswalker')) return 'planeswalker'
  if (obj.types.includes('artifact')) return 'artifact'
  return 'enchantment'
}

/**
 * Everything a tile could show about `obj`, as one string — every field of
 * the view except its `id` and its `stackCount`, the two that differ between
 * interchangeable copies. Permanents fold into one tile only when this
 * matches, because the tile draws just one of them: folding on a few fields
 * (it used to be name, tapped, P/T and summoning sickness) put a Cat that
 * Jump had given flying under the tile of the Cats that hadn't, drawn without
 * its flying.
 *
 * `blocked` is left out too: some of a stack of attacking tokens being
 * blocked doesn't make them different creatures, and the stack's tile counts
 * how many are (`MiniTile`'s `blockedCount`) rather than splitting in two.
 *
 * `summoningSick` counts only on a creature. The engine sets it on every
 * permanent that enters and clears it as its controller's turn begins, but
 * only a creature is held back by it (rule 302.6) and only a creature's tile
 * shows it (`CardFlags`), so on anything else it kept a Forest played this
 * turn, or a Treasure just made, off the tile of its identical fellows until
 * the next turn (the user, 2026-10-12).
 */
function tileKey(obj: VisibleObject): string {
  const { id: _id, stackCount: _stackCount, blocked: _blocked, summoningSick, ...shown } = obj
  return JSON.stringify({ ...shown, sick: summoningSick && obj.types.includes('creature') })
}

/** All battlefield entries for `pid`'s board, bucketed and stacked. */
export function computeBoardEntries(
  view: PlayerView,
  pid: PlayerId,
): BoardEntry[] {
  // A phased-out permanent (rule 702.26) is still on its controller's side
  // of the table, drawn dimmed (`VisibleObject.phasedOut`, which `tileKey`
  // compares, so it never folds into a phased-in one's tile) — after the
  // rest, so the board doesn't shuffle as things phase out and in.
  // (A hand-built view — a test's, the scenario builder's — may leave the
  // phased-out list out.)
  // A plotted card (rule 702.170) sits in exile, face up, waiting to be cast:
  // it's drawn on its owner's side too — last, marked as plotted
  // (`VisibleObject.plotted`), so the table shows what each player has
  // waiting (the user's ask, 2026-10-16). An exiled card's controller is its
  // owner. (A hand-built view may leave the exile list out, as above.)
  const plotted = (view.zones.exile ?? []).filter((id) => view.objects[id]?.plotted === true)
  const all = [...view.zones.battlefield, ...(view.zones.phasedOut ?? []), ...plotted]
    .map((id) => view.objects[id])
    .filter((o): o is VisibleObject => Boolean(o))
  const byId = new Map(all.map((o) => [o.id, o]))

  const attachmentsByHost = new Map<ObjectId, VisibleObject[]>()
  const topLevel: VisibleObject[] = []
  for (const obj of all) {
    if (obj.attachedTo !== null && byId.has(obj.attachedTo)) {
      const list = attachmentsByHost.get(obj.attachedTo) ?? []
      list.push(obj)
      attachmentsByHost.set(obj.attachedTo, list)
    } else {
      topLevel.push(obj)
    }
  }

  interface Building {
    ids: ObjectId[]
    count: number
    sample: VisibleObject
    bucket: Bucket
    attachments: readonly VisibleObject[]
  }
  const entries: Building[] = []
  const stackIndex = new Map<string, number>()
  for (const obj of topLevel) {
    if (obj.controller !== pid) continue
    const attachments = attachmentsByHost.get(obj.id) ?? []
    const bucket = bucketOf(obj)
    // Counters don't keep a tile apart: `tileKey` compares them, so only
    // permanents with the same counters share a tile. Requiring none split
    // seven Plants (fewer than the engine stacks, so seven objects on one
    // tile) into seven tiles once Avenger of Zendikar's landfall gave each
    // a counter (the user, 2026-10-10).
    const stackable =
      attachments.length === 0 &&
      (bucket === 'land'
        ? obj.power === null // a man-land animated to a creature stands alone
        : obj.isToken) // real (nontoken) permanents never fold into a stack
    const count = obj.stackCount ?? 1
    if (stackable) {
      const key = tileKey(obj)
      const idx = stackIndex.get(key)
      if (idx !== undefined) {
        entries[idx].ids.push(obj.id)
        entries[idx].count += count
        continue
      }
      stackIndex.set(key, entries.length)
    }
    entries.push({ ids: [obj.id], count, sample: obj, bucket, attachments })
  }
  return entries
}

/**
 * Which tile each permanent on `view`'s battlefield is drawn in, by the id
 * the tile is drawn as (its first member's, the one whose `data-obj-id` a
 * strike or a flight can find): itself, unless the board folds it into a
 * fellow token's tile. What `animationSchedule` reads to give a stack's
 * tokens hitting one by one a single strike's beat.
 */
export function tilesOf(view: PlayerView): ReadonlyMap<ObjectId, ObjectId> {
  const tiles = new Map<ObjectId, ObjectId>()
  for (const pid of view.turnOrder) {
    for (const entry of computeBoardEntries(view, pid)) {
      for (const id of entry.ids) tiles.set(id, entry.ids[0])
    }
  }
  return tiles
}
