import './attraction-lights.css'

/** The six numbers a roll to visit can come up (rule 701.52a). */
const NUMBERS = [1, 2, 3, 4, 5, 6] as const

/**
 * An Attraction's numbers, 1 to 6, with the ones it lights up highlighted
 * (rule 717.1: a roll to visit that matches one visits it, 701.52a). Down the
 * right of the card as the printed card has them (`.attraction-lights`, on a
 * board tile and the hover card), or in a row (`inline`, beside a name in the
 * deck builder). Sized from the card it's on (`--card-w`), never in px.
 */
export function AttractionLights({
  lights,
  inline = false,
}: {
  readonly lights: readonly number[]
  readonly inline?: boolean
}) {
  const lit = new Set(lights)
  return (
    <span
      className={`attraction-lights${inline ? ' inline' : ''}`}
      role="img"
      aria-label={`Lights up ${lights.join(', ')}`}
      title={`Visited on a roll of ${lights.join(' or ')}`}
      data-attraction-lights={lights.join(' ')}
    >
      {NUMBERS.map((n) => (
        <span key={n} className={lit.has(n) ? 'lit' : undefined}>
          {n}
        </span>
      ))}
    </span>
  )
}
