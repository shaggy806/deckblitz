import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

import { CARD_COPYRIGHT, useArtCreditArtist } from './artistCredit.ts'
import { textEmWidth, useFontEpoch } from './textWidth.ts'

/**
 * "Illus. {artist} · ™ & © Wizards of the Coast" — the credit a printed card
 * carries under its text box, for the art crop shown with it (Scryfall's
 * image guidelines; see `artistCredit.ts`). The copyright shows at once; the
 * artist once Scryfall has said who it is.
 *
 * `fit` sets it on two lines, the artist over the copyright, in the box it's
 * in: a card's foot, beside its P/T box or loyalty shield (the user,
 * 2026-11-21; it was one line across the foot of the art from 2026-10-17).
 * The box is a size container (`.art-credit-fit`) and the font is its width
 * over the wider line's own measured width in ems (`--credit-em`,
 * `textWidth.ts`), capped at `--credit-max` — so both lines fit whoever the
 * artist is, and squeeze where a stat box takes part of the row. An estimate
 * from the character count (`--credit-chars`, half an em each) is the
 * fallback where nothing can measure.
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
  const artist = useArtCreditArtist(art, name, backFace)
  const artistLine = artist !== null ? `Illus. ${artist}` : null
  const textRef = useRef<HTMLSpanElement>(null)
  const fonts = useFontEpoch()
  useLayoutEffect(() => {
    const el = textRef.current
    if (!el) return
    const copyright = textEmWidth(CARD_COPYRIGHT, 'art-credit', el)
    const illustrator = artistLine !== null ? textEmWidth(artistLine, 'art-credit', el) : 0
    if (copyright === null || illustrator === null) el.style.removeProperty('--credit-em')
    else el.style.setProperty('--credit-em', String(Math.max(copyright, illustrator)))
  }, [artistLine, fonts])
  if (!fit) {
    return <span className={className}>{artistLine !== null ? `${artistLine} · ${CARD_COPYRIGHT}` : CARD_COPYRIGHT}</span>
  }
  const chars = Math.max(CARD_COPYRIGHT.length, artistLine?.length ?? 0)
  return (
    <span className={`${className} art-credit-fit`}>
      <span className="art-credit-text" ref={textRef} style={{ '--credit-chars': chars } as CSSProperties}>
        {artistLine !== null ? <span className="art-credit-line">{artistLine}</span> : null}
        <span className="art-credit-line">{CARD_COPYRIGHT}</span>
      </span>
    </span>
  )
}
