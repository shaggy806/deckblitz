import type { CSSProperties } from 'react'

import { useArtCreditText } from './artistCredit.ts'

/**
 * "Illus. {artist} · ™ & © Wizards of the Coast" — the credit a printed card
 * carries under its text box, for the art crop shown with it (Scryfall's
 * image guidelines; see `artistCredit.ts`). The copyright shows at once; the
 * artist once Scryfall has said who it is.
 *
 * `fit` sets it on one line across the box it's in, its font grown or shrunk
 * to the text's length (the user, 2026-10-17: it wrapped onto two lines): the
 * box is a size container (`.art-credit-fit`) and the text's font is its width
 * over the character count (`--credit-chars`), capped at the box's own size.
 */
export function ArtCredit({
  art,
  name,
  backFace = false,
  className,
  fit = false,
}: {
  readonly art: string | null | undefined
  readonly name: string
  readonly backFace?: boolean
  readonly className: string
  readonly fit?: boolean
}) {
  const text = useArtCreditText(art, name, backFace)
  if (!fit) return <span className={className}>{text}</span>
  return (
    <span className={`${className} art-credit-fit`}>
      <span className="art-credit-text" style={{ '--credit-chars': text.length } as CSSProperties}>
        {text}
      </span>
    </span>
  )
}
