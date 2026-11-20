import type { Color } from 'engine/client'
import { Symbols } from '../ui/Symbols.tsx'
import './chosen-color-picker.css'

const COLOR_NAMES: Readonly<Record<Color, string>> = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green' }
const ORDER: readonly Color[] = ['W', 'U', 'B', 'R', 'G']

/**
 * The colour a commander chooses before the game begins (rule 903.4b — "If ~
 * is your commander, choose a color before the game begins. ~ is the chosen
 * color": Clara Oswald, The Prismatic Piper): five mana pips, the chosen one
 * lit. It's chosen as the deck is built, so it lives with the deck — the deck
 * editor's commander row and the blitz panel's ask both show this.
 */
export function ChosenColorPicker({
  commander,
  chosen,
  readOnly = false,
  onChoose,
}: {
  readonly commander: string
  readonly chosen: Color | null
  readonly readOnly?: boolean
  readonly onChoose: (color: Color) => void
}) {
  return (
    <span className="db-chosen-color" role="radiogroup" aria-label={`${commander}'s colour`}>
      {ORDER.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={chosen === c}
          aria-label={COLOR_NAMES[c]}
          title={`${commander} is ${COLOR_NAMES[c].toLowerCase()}`}
          className={chosen === c ? 'selected' : undefined}
          disabled={readOnly && chosen !== c}
          onClick={readOnly ? undefined : () => onChoose(c)}
        >
          <Symbols text={`{${c}}`} />
        </button>
      ))}
    </span>
  )
}
