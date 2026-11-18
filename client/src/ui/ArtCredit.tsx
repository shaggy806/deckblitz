import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'

import { useArtCreditText } from './artistCredit.ts'
import { textEmWidth, useFontEpoch } from './textWidth.ts'

/**
 * "Illus. {artist} · ™ & © Wizards of the Coast" — the credit a printed card
 * carries under its text box, for the art crop shown with it (Scryfall's
 * image guidelines; see `artistCredit.ts`). The copyright shows at once; the
 * artist once Scryfall has said who it is.
 *
 * `fit` sets it on one line across the box it's in, its font grown or shrunk
 * to the text's length (the user, 2026-10-17: it wrapped onto two lines): the
 * box is a size container (`.art-credit-fit`) and the text's font is its width
 * over the text's own measured width in ems (`--credit-em`, `textWidth.ts`),
 * capped at the box's own size — so the line ends at the art's right edge
 * whoever the artist is. An estimate from the character count
 * (`--credit-chars`, half an em each) stood in for the measure until
 * 2026-11-17 and left the line 10-20% short of the edge (the user); it is
 * still the fallback where nothing can measure.
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
  const textRef = useRef<HTMLSpanElement>(null)
  const fonts = useFontEpoch()
  useLayoutEffect(() => {
    const el = textRef.current
    if (!el) return
    const em = textEmWidth(text, 'art-credit', el)
    if (em === null) el.style.removeProperty('--credit-em')
    else el.style.setProperty('--credit-em', String(em))
  }, [text, fonts])
  if (!fit) return <span className={className}>{text}</span>
  return (
    <span className={`${className} art-credit-fit`}>
      <span className="art-credit-text" ref={textRef} style={{ '--credit-chars': text.length } as CSSProperties}>
        {text}
      </span>
    </span>
  )
}
