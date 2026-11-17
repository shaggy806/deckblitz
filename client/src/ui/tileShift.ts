/**
 * A board's tiles gliding to their new places. `Table` remounts with every
 * frame shown, so when a permanent entered or left, or a stack of identical
 * ones split or closed up, every tile after it was simply somewhere else on
 * the next board: the row jumped (the user, 2026-11-17: when a board's tiles
 * shift it shouldn't be "so abrupt"). Each tile that was on the board before
 * now starts from where it stood there and eases into its place, as the hand
 * fan does (`handMotion.ts`'s `slideHand`). A tile that wasn't there has its
 * own arrival; one that changed boards has its own flight.
 */

/** Where a board entry stood: its box in viewport px, and whose board. */
export interface TileSpot {
  /** The board it was on (its class names: which seat's, ours or theirs). A
   * tile only glides within one. */
  readonly board: string
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

/** How long a tile takes to reach its new place (before `animScale`), the
 * hand fan's own time. Not a slot: the new board is already the outcome, and
 * this only eases into it. */
export const TILE_SLIDE_MS = 320

/** A board's entries: a permanent's tile with what's attached to it, or a
 * stack of identical ones (`data-obj-ids` lists every permanent it draws). */
const ENTRIES = '.board .board-entry[data-obj-ids]'

const boardOf = (entry: Element): string => entry.closest('.board')?.className ?? ''
const idsOf = (entry: HTMLElement): string[] => (entry.dataset.objIds ?? '').split(' ').filter((id) => id !== '')

/**
 * Where every permanent's tile stands on the board now on screen, by object
 * id. Taken as the next board's `Table` first renders (a `useState`
 * initializer), while the old board is still the one in the page.
 */
export function tileSpotsBefore(): ReadonlyMap<string, TileSpot> {
  const spots = new Map<string, TileSpot>()
  if (typeof document === 'undefined') return spots
  for (const entry of document.querySelectorAll<HTMLElement>(ENTRIES)) {
    const box = entry.getBoundingClientRect()
    if (box.width === 0) continue
    const spot: TileSpot = { board: boardOf(entry), left: box.left, top: box.top, width: box.width, height: box.height }
    for (const id of idsOf(entry)) spots.set(id, spot)
  }
  return spots
}

/** What takes a tile now at `at` back to where it `was`: an offset of its
 * top left corner (px) and a scale, or `null` when it hasn't moved enough to
 * see. From the corner, not the centre: an Aura arriving under a tile makes
 * its entry taller without moving it. */
export function shiftBetween(
  was: Pick<TileSpot, 'left' | 'top' | 'width'>,
  at: Pick<TileSpot, 'left' | 'top' | 'width'>,
): { readonly dx: number; readonly dy: number; readonly scale: number } | null {
  if (was.width <= 0 || at.width <= 0) return null
  const dx = was.left - at.left
  const dy = was.top - at.top
  const scale = was.width / at.width
  // A pixel's rounding either way is no move.
  if (Math.abs(dx) < 1.5 && Math.abs(dy) < 1.5 && Math.abs(scale - 1) < 0.01) return null
  return { dx, dy, scale }
}

/** The entries gliding now, each with the box it will rest in. */
const gliding = new WeakMap<Element, DOMRect>()

/**
 * The boards just mounted: every entry that was on its board before
 * (`before`, from {@link tileSpotsBefore}) and now stands somewhere else, or
 * at another size, glides there from where it stood. `scale` is the viewer's
 * `animScale`. A gliding entry takes no pointer till it's down: tiles sliding
 * under a resting pointer would each open their hover card on the way past.
 * Returns what cancels the glides.
 */
export function glideTiles(before: ReadonlyMap<string, TileSpot>, scale: number): () => void {
  if (before.size === 0 || scale <= 0) return () => {}
  // Every place read before any glide starts: a glide moves what the next
  // read would see.
  const moves: { entry: HTMLElement; rest: DOMRect; shift: NonNullable<ReturnType<typeof shiftBetween>> }[] = []
  for (const entry of document.querySelectorAll<HTMLElement>(ENTRIES)) {
    const board = boardOf(entry)
    let was: TileSpot | undefined
    for (const id of idsOf(entry)) {
      const spot = before.get(id)
      if (spot !== undefined && spot.board === board) {
        was = spot
        break
      }
    }
    if (was === undefined) continue
    const rest = entry.getBoundingClientRect()
    const shift = shiftBetween(was, rest)
    if (shift !== null) moves.push({ entry, rest, shift })
  }
  const running: Animation[] = []
  for (const { entry, rest, shift } of moves) {
    const glide = entry.animate(
      [
        {
          transformOrigin: '0 0',
          transform: `translate(${shift.dx}px, ${shift.dy}px) scale(${shift.scale})`,
          pointerEvents: 'none',
        },
        { transformOrigin: '0 0', transform: 'translate(0, 0) scale(1)', pointerEvents: 'none' },
      ],
      { duration: TILE_SLIDE_MS * scale, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    )
    gliding.set(entry, rest)
    const down = (): void => {
      if (gliding.get(entry) === rest) gliding.delete(entry)
    }
    glide.finished.then(down, down)
    running.push(glide)
  }
  return () => {
    for (const glide of running) glide.cancel()
  }
}

/**
 * `el`'s box where it will rest: `getBoundingClientRect()`, less the glide
 * its board entry is in the middle of. For what is drawn to a tile from
 * outside it (the arrows), which would otherwise aim at wherever the tile
 * happened to be on its way.
 */
export function restingRect(el: Element): DOMRect {
  const now = el.getBoundingClientRect()
  const entry = el.closest('.board-entry')
  const rest = entry === null ? undefined : gliding.get(entry)
  if (entry === null || rest === undefined) return now
  const shown = entry.getBoundingClientRect()
  if (shown.width === 0) return now
  const k = rest.width / shown.width
  return new DOMRect(
    rest.left + (now.left - shown.left) * k,
    rest.top + (now.top - shown.top) * k,
    now.width * k,
    now.height * k,
  )
}
