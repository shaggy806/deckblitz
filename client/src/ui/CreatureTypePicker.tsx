import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

export interface CreatureTypePickerProps {
  /** What is asking — "Crippling Fear", "Urza's Incubator". */
  readonly sourceName: string
  /** Every creature type the rules allow (rule 205.3m), alphabetical. */
  readonly options: readonly string[]
  /** The chooser's most common types across their own cards and the board,
   * most common first — the engine computes these, since only it can see
   * the chooser's library. */
  readonly suggested: readonly string[]
  readonly onPick: (creatureType: string) => void
  /** Hidden so the board can be seen ("View board"); stays mounted, so the
   * search survives. The owner renders the way back. */
  readonly collapsed: boolean
  readonly onCollapse: () => void
  /** What's being named, for a choice that isn't a creature type — a card
   * name (rule 201.4): "a nonland card name", with its plural for the
   * search's placeholder. */
  readonly noun?: { readonly one: string; readonly many: string }
  /** The heading over `suggested`. */
  readonly suggestedLabel?: string
  /** Cards the chooser was shown for this choice (Sorcerous Spyglass's look
   * at a hand), as their own row of chips above the suggestions. */
  readonly seen?: { readonly label: string; readonly names: readonly string[] }
  /** At most this many results drawn at once: thousands of card names are
   * too many buttons for a low-end laptop, and a search narrows them. */
  readonly maxShown?: number
}

/**
 * Types matching `query`, best first: names that *start* with it ahead of
 * names that merely contain it, each group kept alphabetical. An empty query
 * is the whole list.
 */
function rank(options: readonly string[], query: string): readonly string[] {
  const q = query.trim().toLowerCase()
  if (q === '') return options
  const starts: string[] = []
  const contains: string[] = []
  for (const t of options) {
    const lower = t.toLowerCase()
    if (lower.startsWith(q)) starts.push(t)
    else if (lower.includes(q)) contains.push(t)
  }
  return [...starts, ...contains]
}

/**
 * "Choose a creature type" over all ~350 of them: suggested types as one-click
 * chips, then a search box over the whole catalog.
 *
 * A mandatory decision, so there's no close button — but it can be collapsed
 * to look at the board first, since which type to name (Crippling
 * Fear sparing it, Distant Melody drawing off it) usually depends on what's in
 * play.
 */
export function CreatureTypePicker({
  sourceName,
  options,
  suggested,
  onPick,
  collapsed,
  onCollapse,
  noun = { one: 'a creature type', many: 'creature types' },
  suggestedLabel = 'In your deck and on the board',
  seen,
  maxShown,
}: CreatureTypePickerProps) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => rank(options, query), [options, query])
  const shown = maxShown !== undefined && results.length > maxShown ? results.slice(0, maxShown) : results
  // What `seen` already shows isn't suggested twice.
  const suggestions = seen === undefined ? suggested : suggested.filter((t) => !seen.names.includes(t))
  // Card names are longer than creature types: wider columns.
  const wide = noun.one !== 'a creature type'

  useEffect(() => {
    if (!collapsed) inputRef.current?.focus()
  }, [collapsed])

  // Keep the keyboard highlight in view as it moves.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (collapsed) return null

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, shown.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const pick = shown[active]
      if (pick !== undefined) onPick(pick)
    }
  }

  return (
    <div className="zone-viewer-overlay ctype-overlay">
      <div className="zone-viewer-box ctype-box" role="dialog" aria-label={`Choose ${noun.one}`}>
        <div className="zone-viewer-head">
          <h2>
            {sourceName} — choose {noun.one}
          </h2>
          <button type="button" onClick={onCollapse}>
            View board
          </button>
        </div>

        {seen !== undefined && seen.names.length > 0 ? (
          <div className="ctype-section">
            <span className="ctype-label">{seen.label}</span>
            <div className="ctype-chips">
              {seen.names.map((t, i) => (
                <button key={`${t}-${i}`} type="button" className="ctype-chip" onClick={() => onPick(t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {suggestions.length > 0 ? (
          <div className="ctype-section">
            <span className="ctype-label">{suggestedLabel}</span>
            <div className="ctype-chips">
              {suggestions.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="ctype-chip"
                  onClick={() => onPick(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="ctype-section">
          <input
            ref={inputRef}
            className="ctype-search"
            type="search"
            placeholder={`Search all ${options.length} ${noun.many}`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              // Typing resets the highlight to the best match.
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            aria-label={`Search ${noun.many}`}
            aria-controls="ctype-results"
          />
          <span className="ctype-label">
            {query.trim() === ''
              ? shown.length < results.length
                ? `${options.length} ${noun.many} — type to search`
                : `${options.length} ${noun.many}`
              : results.length === 0
                ? 'Nothing matches'
                : `${results.length} match${results.length === 1 ? '' : 'es'}${
                    shown.length < results.length ? `, the first ${shown.length} shown` : ''
                  } — Enter picks the highlighted one`}
          </span>
        </div>

        <div
          id="ctype-results"
          className={`ctype-results${wide ? ' ctype-results--wide' : ''}`}
          ref={listRef}
          role="listbox"
        >
          {shown.map((t, i) => (
            <button
              key={t}
              type="button"
              role="option"
              aria-selected={i === active}
              data-index={i}
              className={`ctype-result${i === active ? ' ctype-result--active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => onPick(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
