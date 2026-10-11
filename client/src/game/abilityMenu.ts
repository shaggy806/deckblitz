import type { LegalAction, ObjectId } from 'engine/client'

export type AbilityAction = Extract<LegalAction, { kind: 'activate-ability' }>

/**
 * Each permanent's activated abilities to offer, in the server's order. Two
 * plain "{T}: Add {W}"s of one permanent (`plainMana`) tap it for the same
 * mana — a City of Brass that's every basic land type (Dryad of the Ilysian
 * Grove) has its "any color" and the intrinsic one (rule 305.6) — so only the
 * first is offered. One that differs (Mana Confluence's life, Plaza of
 * Heroes' restriction) isn't plain, and stays.
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
  return m
}
