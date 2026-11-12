import type { ObjectId, VisibleObject } from 'engine/client'

// A library search's finds, laid out for picking (`ZoneViewer`'s `unordered`):
// identical cards as one tile with a count, and the tiles sorted, because a
// fetch land's dozen finds were six Forests scattered among six others (the
// site check, 2026-11-11). Only for a search — the library is shuffled after
// it, so the order the finds came in means nothing. A look at the top of a
// library keeps its order, which is information.

/** Card types in the order a search's finds are listed: what's cast first,
 * lands last (a tutor's finds are read for the spell; a land search has
 * nothing but lands). */
const TYPE_ORDER = ['creature', 'planeswalker', 'battle', 'instant', 'sorcery', 'artifact', 'enchantment', 'land']

function typeRank(obj: VisibleObject): number {
  const ranks = obj.types.map((t) => TYPE_ORDER.indexOf(t)).filter((r) => r >= 0)
  // An artifact creature sits with the creatures, a land creature too.
  return ranks.length > 0 ? Math.min(...ranks) : TYPE_ORDER.length
}

/** Everything a viewer can see of a card but which object it is: two cards
 * fold into one tile only when this is the same for both, so nothing shown
 * differs between them. */
function signature(obj: VisibleObject): string {
  const { id: _id, ...rest } = obj
  return JSON.stringify(rest)
}

/** The ids as groups of identical cards, sorted: the cards that can be picked
 * first, then by card type, basic lands after the other lands, then by name.
 * A card hidden from the viewer (`resolve` gives nothing) is a group of its
 * own, last. */
export function foldSearch(
  ids: readonly ObjectId[],
  resolve: (id: ObjectId) => VisibleObject | undefined,
  eligible: readonly ObjectId[],
): readonly (readonly ObjectId[])[] {
  const groups = new Map<string, { ids: ObjectId[]; sort: readonly [number, number, number, string] }>()
  ids.forEach((id, index) => {
    const obj = resolve(id)
    const pickable = eligible.includes(id)
    const key = obj ? `${pickable ? 1 : 0}:${signature(obj)}` : `hidden:${index}`
    const group = groups.get(key)
    if (group) {
      group.ids.push(id)
      return
    }
    groups.set(key, {
      ids: [id],
      sort: obj
        ? [pickable ? 0 : 1, typeRank(obj), obj.supertypes.includes('basic') ? 1 : 0, obj.cardName]
        : [2, 0, 0, ''],
    })
  })
  return [...groups.values()]
    .sort((a, b) => {
      for (let i = 0; i < 3; i++) {
        const diff = (a.sort[i] as number) - (b.sort[i] as number)
        if (diff !== 0) return diff
      }
      return a.sort[3].localeCompare(b.sort[3])
    })
    .map((group) => group.ids)
}

/**
 * A click on a tile standing for `members`: one more of them is picked while
 * `add` allows it, and once no more can be, the click takes them all back —
 * so a tile of six Forests under "up to two" goes 1, 2, none. A tile of one
 * card is the plain toggle. `add` is the viewer's own rule for adding a pick
 * (its maximum, its "share a land type"), returning the picks unchanged when
 * it refuses.
 */
export function clickFolded(
  picked: readonly ObjectId[],
  members: readonly ObjectId[],
  add: (picked: readonly ObjectId[], id: ObjectId) => readonly ObjectId[],
): readonly ObjectId[] {
  const count = (picks: readonly ObjectId[]) => members.filter((m) => picks.includes(m)).length
  const before = count(picked)
  const next = members.find((m) => !picked.includes(m))
  const added = next === undefined ? picked : add(picked, next)
  if (count(added) > before) return added
  // Nothing of this tile was picked and none can be: whatever `add` did
  // stands (a refusal leaves the picks as they were).
  if (before === 0) return added
  return picked.filter((id) => !members.includes(id))
}
