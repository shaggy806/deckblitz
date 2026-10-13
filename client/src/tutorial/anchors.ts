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
 *
 * A tutorial room's coach cards name their anchors in a small grammar of
 * their own ({@link lessonAnchor}, below), which reaches these names
 * (`tour:`), cards' tiles (`data-obj-id` / `data-obj-ids`), players' panels
 * (`data-player-id`) and the phase track's pips (`data-step`).
 */

import type { ObjectId, PlayerId, PlayerView } from 'engine/client'

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

// --- a tutorial room's anchors ---------------------------------------------

/**
 * Where a tutorial room's coach card points (`protocol`'s `TutorialAnchor`),
 * read: `tour:<name>` (a `data-tour` name above), `card:<Card Name>`,
 * `player:<seat | me | opponent>`, `step:<Step>` (a phase-track pip) or
 * `css:<selector>`. Anything else reads as no anchor at all — a centred
 * card, rather than one waiting forever on a ring it can't place.
 */
export type LessonAnchor =
  | { readonly kind: 'tour'; readonly name: string }
  | { readonly kind: 'card'; readonly name: string }
  | { readonly kind: 'player'; readonly who: string }
  | { readonly kind: 'step'; readonly step: string }
  | { readonly kind: 'css'; readonly selector: string }

export function parseLessonAnchor(anchor: string | undefined): LessonAnchor | null {
  if (anchor === undefined) return null
  const colon = anchor.indexOf(':')
  if (colon <= 0) return null
  const head = anchor.slice(0, colon)
  const rest = anchor.slice(colon + 1).trim()
  if (rest === '') return null
  switch (head) {
    case 'tour':
      return { kind: 'tour', name: rest }
    case 'card':
      return { kind: 'card', name: rest }
    case 'player':
      return { kind: 'player', who: rest }
    case 'step':
      return { kind: 'step', step: rest }
    case 'css':
      return { kind: 'css', selector: rest }
    default:
      return null
  }
}

/** What of a view the anchors read: a test's fake carries just this. */
export type AnchorView = Pick<PlayerView, 'objects' | 'zones' | 'turnOrder'>

/**
 * The cards named `name` this viewer can see, in the order a coach card
 * should point at them: the viewer's own first — hand, battlefield, command
 * zone — then anyone's, on the battlefield, on the stack, in a command zone.
 * A name matches the card's own or the face it shows.
 */
export function cardIdsNamed(view: AnchorView, seat: PlayerId | null, name: string): ObjectId[] {
  const named = (id: ObjectId): boolean => {
    const o = view.objects[id]
    return o !== undefined && (o.cardName === name || o.faceName === name || o.name === name)
  }
  const mine = (id: ObjectId, by: 'controller' | 'owner'): boolean => seat !== null && view.objects[id]?.[by] === seat
  const { zones } = view
  const order: ObjectId[] = [
    ...(seat !== null ? (zones.hands[seat] ?? []) : []),
    ...zones.battlefield.filter((id) => mine(id, 'controller')),
    ...zones.command.filter((id) => mine(id, 'owner')),
    ...zones.battlefield,
    ...zones.stack,
    ...zones.command,
  ]
  return [...new Set(order)].filter(named)
}

/** A value inside a `[attr="…"]` selector. */
const attrValue = (v: string): string => v.replace(/["\\]/g, '\\$&')

/** The selectors that find object `id`'s tile, best first: a battlefield
 * tile (which may stand for several identical permanents, `data-obj-ids`),
 * then any element carrying the id itself (a hand card, a command-zone
 * tile). */
export const objectSelectors = (id: ObjectId): readonly string[] => [
  `[data-obj-ids~="${attrValue(id)}"]`,
  `[data-obj-id="${attrValue(id)}"]`,
]

/** The player a `player:` anchor names: `me`, `opponent` (the next seat
 * after mine in turn order), or a seat by id. */
export function anchorPlayer(view: AnchorView, seat: PlayerId | null, who: string): PlayerId | null {
  if (who === 'me') return seat
  if (who === 'opponent') {
    const order = view.turnOrder
    const i = seat === null ? -1 : order.indexOf(seat)
    const after = [...order.slice(i + 1), ...order.slice(0, Math.max(i, 0))]
    return after.find((p) => p !== seat) ?? null
  }
  return view.turnOrder.includes(who as PlayerId) ? (who as PlayerId) : null
}

/** The part of `document` a resolver reads. */
export interface QueryRoot {
  querySelector(selector: string): Element | null
}

/**
 * A tutorial room's anchor as the coach layer's resolver, found again every
 * frame against the board on screen (`view()`, the frame being shown, never
 * a newer one), or `undefined` for none. A malformed CSS selector finds
 * nothing rather than throwing out of the layer's frame loop.
 */
export function lessonAnchor(
  anchor: string | undefined,
  view: () => AnchorView | null,
  seat: PlayerId | null,
  root: () => QueryRoot = () => document,
): (() => Element | null) | undefined {
  const parsed = parseLessonAnchor(anchor)
  if (parsed === null) return undefined
  const find = (selector: string): Element | null => {
    try {
      return root().querySelector(selector)
    } catch {
      return null
    }
  }
  switch (parsed.kind) {
    case 'tour':
      return () => find(tourAnchor(parsed.name))
    case 'css':
      return () => find(parsed.selector)
    case 'step':
      return () => find(`${tourAnchor('game-phase-track')} [data-step="${attrValue(parsed.step)}"]`)
    case 'player':
      return () => {
        const v = view()
        const player = v === null ? null : anchorPlayer(v, seat, parsed.who)
        return player === null ? null : find(`[data-player-id="${attrValue(player)}"]`)
      }
    case 'card':
      return () => {
        const v = view()
        if (v === null) return null
        for (const id of cardIdsNamed(v, seat, parsed.name)) {
          for (const selector of objectSelectors(id)) {
            const el = find(selector)
            if (el !== null) return el
          }
        }
        return null
      }
  }
}
