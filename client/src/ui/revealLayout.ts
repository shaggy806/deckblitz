/**
 * How the cards someone revealed are laid out so that every one of them is on
 * screen (`AnimationLayer`'s reveal tray). They were one row at a fixed size
 * however many there were: ten cards ran 2172px across a 1920px screen, the
 * first and the last cut off at its edges (the user's report, 2026-11-17).
 */

/** A card's box is this many times as tall as it is wide. */
const CARD_RATIO = 1.4

/** Cards this near their full size stay in the fewest rows that allow it:
 * a row a little smaller covers less of the board than two rows at full
 * size, and reads as well. Below it, the layout with the biggest cards. */
const NEAR_FULL = 0.8

/** The space a tray of reveals has, in px as measured. */
export interface RevealRoom {
  /** Across, for a row of cards. */
  readonly width: number
  /** Down, for every reveal showing: captions, cards and the gaps. */
  readonly height: number
  /** A revealed card's width when nothing makes it smaller. */
  readonly full: number
  /** Between two cards, across and down. */
  readonly gap: number
  /** One reveal's caption, with the gap under it. */
  readonly caption: number
  /** Between one reveal and the next under it. */
  readonly between: number
}

/** The most cards in a row, and each card's width. */
export interface RevealGrid {
  readonly cols: number
  readonly cardW: number
}

/**
 * The grid for reveals of `counts` cards each (one entry per reveal showing,
 * stacked one under another, all at one card size): the fewest rows that keep
 * the cards within {@link NEAR_FULL} of full size, else whichever number of
 * rows gives the biggest cards that still fit `room` both ways. The biggest
 * reveal's rows are even — ten cards in two rows are five and five, never
 * nine and one.
 */
export function revealGrid(counts: readonly number[], room: RevealRoom): RevealGrid {
  const most = Math.max(1, ...counts)
  let best: RevealGrid | null = null
  for (let split = 1; split <= most; split += 1) {
    // The biggest reveal in `split` rows, as even as they come.
    const cols = Math.ceil(most / split)
    if (split > 1 && cols === Math.ceil(most / (split - 1))) continue
    const rows = counts.reduce((sum, n) => sum + Math.max(1, Math.ceil(n / cols)), 0)
    const across = (room.width - (cols - 1) * room.gap) / cols
    const cardsHeight =
      room.height -
      counts.length * room.caption -
      (counts.length - 1) * room.between -
      (rows - counts.length) * room.gap
    const down = cardsHeight / rows / CARD_RATIO
    const cardW = Math.max(0, Math.min(room.full, across, down))
    if (cardW >= room.full * NEAR_FULL) return { cols, cardW }
    if (best === null || cardW > best.cardW) best = { cols, cardW }
  }
  return best ?? { cols: most, cardW: room.full }
}
