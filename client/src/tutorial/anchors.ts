/**
 * The tours point at the page through `data-tour="…"` attributes: the
 * contract between a tour and the controls it names, so restyling (class
 * names are styling hooks) can't silently strand a step, and the e2e walk
 * (`e2e/site-tour.spec.ts`) fails when one goes missing. Names are
 * `<page>-<thing>`:
 *
 * - corner toolbar: `corner-help`, `corner-settings`, and `help-callout`
 *   (the first-visit callout)
 * - landing: `landing-blitz`, `landing-create`, `landing-join`,
 *   `landing-deck-builder`, `landing-library`
 * - lobby: `lobby-room` (the room box: code, invite, seats), `lobby-seats`,
 *   `lobby-add-bot`, `lobby-my-deck`, `lobby-settings`, `lobby-ready`,
 *   `lobby-start`, `lobby-invite`
 * - deck builder: `db-import`, `db-my-decks`, `db-starters`, `db-editor`,
 *   `db-make-active`, `db-stand-ins` (a starter deck's stand-in list)
 * - library: `lib-search`, `lib-types`, `lib-colors`, `lib-set`, `lib-grid`,
 *   `lib-card` (every grid card; the first is the one meant),
 *   `lib-printings` (an open card's printings)
 * - game (for the in-game stops to come): `game-settings`, `game-history`,
 *   `game-menu` (the top strip's buttons), `game-phase-track`,
 *   `game-priority` (the Pass row) with `game-pass`, `game-pass-turn`,
 *   `game-auto-pass`, `game-resolve-stack`, and `game-decision-banner`
 *   (whose buttons {@link bannerButton} finds by label)
 */

/** The selector for one `data-tour` name. */
export const tourAnchor = (name: string): string => `[data-tour="${name}"]`

/** The first element with that `data-tour` name, or null. */
export const findAnchor = (name: string): Element | null => document.querySelector(tourAnchor(name))

/** The first of several anchors that's on the page — for a step whose thing
 * may or may not be there (a starter deck with no stand-ins). */
export const firstAnchor =
  (...names: readonly string[]) =>
  (): Element | null => {
    for (const n of names) {
      const el = findAnchor(n)
      if (el !== null) return el
    }
    return null
  }

/**
 * A button of the decision banner by its label ("Confirm", "Cancel",
 * "Done"…). Every decision draws its own row of buttons there, around twenty
 * kinds of them, so the banner carries the `data-tour` and its buttons are
 * found by what they say — which is also what a lesson's copy tells the
 * player to press.
 */
export const bannerButton =
  (label: string) =>
  (): Element | null => {
    const banner = findAnchor('game-decision-banner')
    if (banner === null) return null
    for (const b of banner.querySelectorAll('button')) {
      if (b.textContent?.trim().startsWith(label) === true) return b
    }
    return null
  }
