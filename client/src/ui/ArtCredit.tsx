import { useSyncExternalStore } from 'react'

import { artistFor, CARD_COPYRIGHT, getArtistsVersion, subscribeArtists } from './artistCredit.ts'

/**
 * "Illus. {artist} · ™ & © Wizards of the Coast" — the credit a printed card
 * carries under its text box, for the art crop shown with it (Scryfall's
 * image guidelines; see `artistCredit.ts`). The copyright shows at once; the
 * artist once Scryfall has said who it is.
 */
export function ArtCredit({
  art,
  name,
  backFace = false,
  className,
}: {
  readonly art: string | null | undefined
  readonly name: string
  readonly backFace?: boolean
  readonly className: string
}) {
  useSyncExternalStore(subscribeArtists, getArtistsVersion, getArtistsVersion)
  const artist = artistFor(art, name, backFace)
  return (
    <span className={className}>
      {artist ? `Illus. ${artist} · ` : ''}
      {CARD_COPYRIGHT}
    </span>
  )
}
