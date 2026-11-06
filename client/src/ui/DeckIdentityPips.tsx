import { useEffect } from 'react'
import { colorIdentityOf, identityString } from 'engine/client'
import type { CardDefinition, Color } from 'engine/client'
import { loadCard, requestCards, useCardData } from '../cards/cardData.ts'
import { Symbols } from './Symbols.tsx'
import './deck-identity-pips.css'

/**
 * A deck's colour identity as mana pips — its commanders' identities together
 * (rule 903.4), each face's counted — for the deck lists: the deck builder's
 * and the lobby's deck picker (the user, 2026-11-06). A colourless commander
 * shows {C}; a deck with no commander shows nothing, having no identity to
 * show. Reads the commanders' own shards, not the whole pool, so the lobby,
 * which never loads the pool, can draw it; nothing is drawn until they're in.
 */
export function DeckIdentityPips({ commanders }: { readonly commanders: readonly string[] }) {
  const card = useCardData()
  const key = commanders.join('\n')
  useEffect(() => {
    if (key === '') return
    const names = key.split('\n')
    // A double-faced commander's back face may sit in another shard.
    void Promise.all(names.map(loadCard)).then((defs) =>
      requestCards(defs.flatMap((d) => d?.faces ?? [])),
    )
  }, [key])
  const identity = deckIdentity(commanders, card)
  if (identity === null) return null
  const text = identity.size === 0 ? '{C}' : [...identityString(identity)].map((c) => `{${c}}`).join('')
  return (
    <span className="deck-identity-pips" aria-label={`Colour identity ${identityString(identity) || 'colourless'}`}>
      <Symbols text={text} />
    </span>
  )
}

/** The commanders' identity, or `null` with none or while a card (or a face
 * of one) isn't loaded yet. */
function deckIdentity(
  commanders: readonly string[],
  card: (name: string) => CardDefinition | null | undefined,
): ReadonlySet<Color> | null {
  if (commanders.length === 0) return null
  const identity = new Set<Color>()
  for (const name of commanders) {
    const def = card(name)
    if (def === undefined) return null
    if (def === null) continue
    if (def.faces?.some((f) => card(f) === undefined)) return null
    const faces = { has: (n: string) => card(n) != null, get: (n: string) => card(n) as CardDefinition }
    for (const c of colorIdentityOf(def, faces)) identity.add(c)
  }
  return identity
}
