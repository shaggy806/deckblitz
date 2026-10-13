/**
 * The tutorials' data shapes: a tour is a list of steps, and a step is data —
 * what to point at, what to say, and what moves it on. `CoachLayer` draws
 * whichever step `coach.ts` says is open.
 */

/** Which screen a step belongs on. The landing page and a room's lobby are
 * both `/` (App picks the screen off the connection), so a page here is a
 * screen rather than a path. */
export type PageId = 'landing' | 'lobby' | 'game' | 'deck-builder' | 'library'

/** Something the step points at: a CSS selector (a `[data-tour="…"]` one,
 * almost always — see `anchors.ts`), or a resolver for what a selector can't
 * say ("the banner's Confirm button"). Resolved again every animation frame. */
export type Anchor = string | (() => Element | null)

/**
 * What moves a step on:
 *
 * - `'next'` — the card's Next button.
 * - `{ click }` — a click on that element, inside the spotlight (it goes
 *   through to the page as well). The card's Next button clicks it too.
 * - `{ visible }` — that element appearing on the page.
 * - `{ when }` — a predicate, polled every frame while the step is open: the
 *   hook for anything else, such as a tutorial room's server-checked goals.
 */
export type Advance =
  | 'next'
  | { readonly click: string }
  | { readonly visible: string }
  | { readonly when: () => boolean }

/** Which side of its anchor the card goes on by preference. `auto` tries
 * below, above, right and left, in that order. Whatever is asked, the card
 * moves to another side when it wouldn't fit, and is always clamped
 * on-screen. */
export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'auto'

export interface Step {
  /** Unique within its tour; what the progress store records. */
  readonly id: string
  /** The screen the step is on. Left out, it's shown wherever the tour is. */
  readonly page?: PageId
  /** Left out, the card sits in the middle of a dimmed page. */
  readonly anchor?: Anchor
  readonly title: string
  /** Two or three friendly sentences at most. */
  readonly body: string
  readonly placement?: Placement
  readonly advance: Advance
  /**
   * Whether a click inside the spotlight reaches the page. On by default for
   * a step that waits on the player (`click`, `visible`, `when`), off for a
   * `next` step, where pressing the thing pointed at could leave the tour
   * behind (Start Game, a link to another page).
   */
  readonly interactive?: boolean
}

export interface Tour {
  readonly id: string
  readonly title: string
  readonly steps: readonly Step[]
  /** Where the tour begins. */
  readonly startPath?: string
  /**
   * How to reach each page a step is on: its `path` (a full page load — the
   * library and the deck builder aren't client-routed), or `via`, the id of
   * a step on another page that leads into it (a room's lobby is reached by
   * creating one). Used to carry the tour across a page load and to pick it
   * up again later.
   */
  readonly pages?: Partial<Record<PageId, { readonly path?: string; readonly via?: string }>>
  /** Saved to the progress store as the player goes (`tour.at`), so it
   * survives page loads. The site tour is; a lesson inside a room isn't. */
  readonly persist?: boolean
}
