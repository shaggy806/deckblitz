import { useMemo, useState } from 'react'
import type { ScenarioSpec } from 'protocol'
import { MANUAL_CHECK_PRESETS } from './manualChecks.ts'
import { MANUAL_CHECK_ENTRIES } from './manualChecksDoc.ts'

/**
 * The scenario builder's "Manual checks": one quick test of
 * docs/manual-checks.md at a time — what to do, what to expect — with its
 * board (`manualChecks.ts`). "Play this test" loads the board and starts
 * play from wherever the builder is; "Passed — next" ticks it off and plays
 * the next one not yet ticked. Where you are and what you've ticked are kept
 * in this browser only.
 */

// v2: the quick tests (2026-10-22) — the older entries' places and ticks
// name tests that no longer exist.
const AT_KEY = 'mtg.builder.checkAt.v2'
const DONE_KEY = 'mtg.builder.checksDone.v2'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage blocked: the place and ticks just don't stick.
  }
}

/** A paragraph's label, shown bold: the quick tests' three, and the older
 * entries' four. */
const LABEL = /^(Do|Expect|Not a bug|Setup|Check|Known limits):\s*/

export function ManualChecksSection({
  building,
  onLoad,
  onPlay,
}: {
  readonly building: boolean
  /** Put the board in the builder to look at or change, without playing. */
  readonly onLoad: (spec: ScenarioSpec) => void
  /** Load the board and start play, from building or playing. */
  readonly onPlay: (spec: ScenarioSpec) => void
}) {
  const entries = MANUAL_CHECK_ENTRIES
  const [at, setAtState] = useState(() => Math.min(Math.max(0, read(AT_KEY, 0)), entries.length - 1))
  const [done, setDoneState] = useState<readonly string[]>(() => read<string[]>(DONE_KEY, []))
  const sections = useMemo(() => {
    const out: { name: string; items: { index: number; title: string }[] }[] = []
    entries.forEach((e, index) => {
      const last = out.at(-1)
      if (last === undefined || last.name !== e.section) out.push({ name: e.section, items: [{ index, title: e.title }] })
      else last.items.push({ index, title: e.title })
    })
    return out
  }, [entries])

  if (entries.length === 0) return null
  const setAt = (i: number) => {
    const next = (i + entries.length) % entries.length
    setAtState(next)
    write(AT_KEY, next)
  }
  const boardOf = (i: number): ScenarioSpec | undefined => MANUAL_CHECK_PRESETS.find((p) => p.title === entries[i].title)?.spec
  const entry = entries[at]
  const board = boardOf(at)
  const isDone = done.includes(entry.title)
  const saveDone = (next: readonly string[]) => {
    setDoneState(next)
    write(DONE_KEY, next)
  }
  const passAndNext = () => {
    const nextDone = isDone ? done : [...done, entry.title]
    saveDone(nextDone)
    // The next test not yet ticked, after this one (wrapping round).
    for (let step = 1; step <= entries.length; step += 1) {
      const i = (at + step) % entries.length
      if (nextDone.includes(entries[i].title)) continue
      setAt(i)
      const spec = boardOf(i)
      if (spec !== undefined) onPlay(spec)
      return
    }
  }
  const passed = entries.filter((e) => done.includes(e.title)).length
  const short = (title: string) => (title.length > 70 ? `${title.slice(0, 67)}…` : title)

  return (
    <details className="bp-checks" open>
      <summary>
        Manual checks <span className="bp-dim">{passed} of {entries.length} passed</span>
      </summary>
      <div className="bp-row">
        <button type="button" className="bp-small" onClick={() => setAt(at - 1)} title="Previous test">
          ◀
        </button>
        <select className="bp-grow" value={at} onChange={(e) => setAt(Number(e.target.value))} aria-label="Manual check">
          {sections.map((s) => (
            <optgroup key={s.name} label={s.name}>
              {s.items.map((item) => (
                <option key={item.index} value={item.index}>
                  {done.includes(item.title) ? '✓ ' : ''}
                  {short(item.title)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button type="button" className="bp-small" onClick={() => setAt(at + 1)} title="Next test">
          ▶
        </button>
      </div>
      <p className="bp-check-title">
        {isDone ? '✓ ' : ''}
        {entry.title}
      </p>
      <div className="bp-check-text">
        {entry.paragraphs.map((para, i) => {
          const m = LABEL.exec(para)
          return (
            <p key={i} className={m?.[1] === 'Not a bug' ? 'bp-check-note' : undefined}>
              {m ? <b>{m[1]}: </b> : null}
              {m ? para.slice(m[0].length) : <i>{para}</i>}
            </p>
          )
        })}
      </div>
      {board !== undefined ? (
        <div className="bp-check-boards">
          <button type="button" className="bp-primary" onClick={() => onPlay(board)} title="Load this test's board and start play">
            Play this test ▶
          </button>
          <button
            type="button"
            onClick={passAndNext}
            title="Tick this test off and play the next one not yet passed"
          >
            Passed — next ✓
          </button>
          <button
            type="button"
            className="bp-small"
            disabled={!building}
            onClick={() => onLoad(board)}
            title={building ? 'Put the board in the builder without playing' : 'Go back to building first'}
          >
            Load to edit
          </button>
        </div>
      ) : null}
      {isDone ? (
        <button type="button" className="bp-small" onClick={() => saveDone(done.filter((t) => t !== entry.title))}>
          Untick
        </button>
      ) : null}
    </details>
  )
}
