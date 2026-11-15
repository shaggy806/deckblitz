import type { LegalAction, ManaType, ObjectId } from 'engine/client'

export type AbilityAction = Extract<LegalAction, { kind: 'activate-ability' }>

/**
 * Each permanent's activated abilities to offer, in the server's order. Two
 * plain "{T}: Add {W}"s of one permanent (`plainMana`) tap it for the same
 * mana — a City of Brass that's every basic land type (Dryad of the Ilysian
 * Grove) has its "any color" and the intrinsic one (rule 305.6) — so only the
 * first is offered. One that differs (Mana Confluence's life, Plaza of
 * Heroes' restriction) isn't plain, and stays.
 *
 * "N mana in any combination of …" listed once per combination is one offer
 * here, whose split the player picks (`foldManaCombinations`).
 */
export function abilitiesBySource(actions: readonly LegalAction[]): Map<ObjectId, AbilityAction[]> {
  const m = new Map<ObjectId, AbilityAction[]>()
  for (const a of actions) {
    if (a.kind !== 'activate-ability') continue
    const list = m.get(a.source) ?? []
    if (a.plainMana !== undefined && list.some((b) => b.plainMana === a.plainMana)) continue
    list.push(a)
    m.set(a.source, list)
  }
  for (const [source, list] of m) m.set(source, foldManaCombinations(list))
  return m
}

/** The most rows one mana ability's choices take in a menu: a colour each,
 * as "one mana of any color" has. Past it they're asked as a split. */
const MAX_LISTED_COMBINATIONS = 5

/** How many multisets of `amount` there are over `kinds` types. */
function combinationCount(kinds: number, amount: number): number {
  let n = 1
  for (let i = 1; i < kinds; i += 1) n = (n * (amount + i)) / i
  return Math.round(n)
}

/**
 * One permanent's offers, with an "N mana in any combination of …" ability's
 * many rows made one. The engine lists such an ability once per combination
 * while there are few enough for it (Baxter Building's four mana of five
 * colours is 70 offers — a menu taller than the screen, a live report,
 * 2026-11-14) and past that sends one offer with a `manaSplit` for the player
 * to pick. This gives the long lists the same shape: the first offer, with a
 * `manaSplit` over the colours and the amount the list covers, which the
 * split strip asks and answers with its picks as `manaColors`.
 *
 * Only a list that is every combination of its colours is folded — then any
 * split the player picks is one the engine listed. A list with other picks
 * in it (a triggered mana ability's after the split's) isn't that, and stays.
 */
export function foldManaCombinations(list: readonly AbilityAction[]): AbilityAction[] {
  const groups = new Map<string, AbilityAction[]>()
  for (const a of list) {
    if (a.manaColors === undefined || a.manaColors.length < 2 || a.manaSplit !== undefined) continue
    const key = [a.abilityIndex, a.modes?.join(',') ?? '', a.otherChooser ?? '', a.manaFor ?? '', a.manaColors.length].join('|')
    groups.set(key, [...(groups.get(key) ?? []), a])
  }
  const folded = new Map<AbilityAction, AbilityAction | null>()
  for (const group of groups.values()) {
    if (group.length <= MAX_LISTED_COMBINATIONS) continue
    const first = group[0]
    const amount = first.manaColors?.length ?? 0
    const colors: ManaType[] = []
    const seen = new Set<string>()
    for (const a of group) {
      for (const c of a.manaColors ?? []) if (!colors.includes(c)) colors.push(c)
      seen.add([...(a.manaColors ?? [])].sort().join(''))
    }
    if (seen.size !== group.length || group.length !== combinationCount(colors.length, amount)) continue
    group.forEach((a, i) =>
      folded.set(
        a,
        i > 0
          ? null
          : {
              ...first,
              // "… (add {W}{W}{W}{U})" is one combination's label.
              text: `${first.text.replace(/ \(add (\{[^}]+\})+\)$/, '')} (choose how much of each)`,
              manaSplit: { colors, amount },
            },
      ),
    )
  }
  if (folded.size === 0) return [...list]
  return list.flatMap((a) => {
    const to = folded.get(a)
    return to === undefined ? [a] : to === null ? [] : [to]
  })
}
