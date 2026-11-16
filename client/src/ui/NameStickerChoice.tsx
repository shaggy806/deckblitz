import { useState } from 'react'
import type { LegalAction } from 'engine/client'

type Offer = Extract<LegalAction, { kind: 'put-name-sticker' }>
type StickerRef = { readonly sheet: string; readonly index: number }

/**
 * The banner's controls for a `put-name-sticker` decision (rule 123.6b —
 * _____ Goblin's "you may put a name sticker on it"): a button per name
 * sticker the player has left, with what the card counts on it, and "No
 * sticker" when the card says "may"; then, when the name has more than one
 * place for its words, a button per place showing the name it makes. Asked
 * only where it goes (someone else's sticker on a permanent you control), it
 * starts at the places. Holds the sticker picked until a place is, so the
 * parent keys it by the decision to start each one afresh.
 */
export function NameStickerChoice({
  title,
  offer,
  onPut,
}: {
  /** What's asking, in words: "_____ Goblin — put a name sticker on it". */
  readonly title: string
  readonly offer: Offer
  readonly onPut: (sticker: StickerRef | null, position: number) => void
}) {
  const [picked, setPicked] = useState<number | null>(offer.stage === 'place' ? 0 : null)
  const refOf = (i: number): StickerRef => ({ sheet: offer.stickers[i].sheet, index: offer.stickers[i].index })
  const choose = (i: number) => {
    const places = offer.names[i]?.length ?? 1
    if (places <= 1) onPut(refOf(i), 0)
    else setPicked(i)
  }
  if (picked !== null) {
    const sticker = offer.stickers[picked]
    return (
      <div className="controls" data-testid="name-sticker-places">
        <span>
          {title}: where does “{sticker.text}” go?
        </span>
        {offer.names[picked].map((name, position) => (
          <button key={position} type="button" onClick={() => onPut(refOf(picked), position)}>
            {name}
          </button>
        ))}
        {offer.stage === 'choose' ? (
          <button type="button" className="muted" onClick={() => setPicked(null)}>
            Back
          </button>
        ) : null}
      </div>
    )
  }
  return (
    <div className="controls" data-testid="name-sticker-choice">
      <span>{title}: which name sticker?</span>
      {offer.stickers.map((s, i) => (
        <button
          key={`${s.sheet}|${s.index}`}
          type="button"
          title={`From the sticker sheet ${s.sheet}`}
          onClick={() => choose(i)}
        >
          {s.text}
          {offer.count === 'unique-vowels' ? ` (${s.uniqueVowels} vowel${s.uniqueVowels === 1 ? '' : 's'})` : ''}
        </button>
      ))}
      {offer.optional ? (
        <button type="button" onClick={() => onPut(null, 0)}>
          No sticker
        </button>
      ) : null}
    </div>
  )
}
