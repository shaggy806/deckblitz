import type { VisibleObject } from 'engine/client'

/**
 * Whether a line of rules text is an activated ability with {T} in its cost
 * (rule 602.1: "[Cost]: [Effect]"). The cost is everything before the first
 * colon; a quote or a parenthesis there means the colon belongs to an
 * ability the card grants or explains (`Equipped creature has "{T}: …"`,
 * crew's reminder text), not one of its own.
 */
export function isTapAbilityLine(line: string): boolean {
  const colon = line.indexOf(':')
  if (colon < 0) return false
  const cost = line.slice(0, colon)
  if (/["“(]/.test(cost)) return false
  return cost.includes('{T}')
}

/**
 * A non-land permanent with a {T} ability of its own, as its rules text now
 * reads (abilities it was given, and none it lost): its board tile wears a
 * tap symbol while untapped (the user, 2026-11-24). A land is left out, as
 * every land taps for mana; a face-down permanent shows no text.
 */
export function hasTapAbility(obj: Pick<VisibleObject, 'types' | 'text'>): boolean {
  if (obj.types.includes('land')) return false
  return obj.text.split('\n').some(isTapAbilityLine)
}
