import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useMotionPrefs } from '../game/motionPrefs.ts'
import {
  advance,
  autoAdvanced,
  back,
  backFrom,
  continueTour,
  getCoach,
  isInteractive,
  offerTour,
  resumeAt,
  setCoachPage,
  startTour,
  stopTour,
  useCoach,
} from './coach.ts'
import { blockerRects, centerCard, holeRect, placeCard, tiltedRing, unionRect } from './placement.ts'
import type { Rect } from './placement.ts'
import { progressStore, setTourAt } from './progress.ts'
import { SITE_TOUR } from './tours/site.ts'
import type { Anchor, PageId, Step, Tour } from './types.ts'
import './coach.css'

/** How long a step's anchor may be missing before the card says it's
 * waiting, rather than showing nothing. Long enough for a room to be created
 * or a page's cards to load, short enough that nobody wonders if it broke. */
const WAIT_NOTICE_MS = 1500

const resolveAnchor = (anchor: Anchor): Element | null =>
  typeof anchor === 'string' ? document.querySelector(anchor) : anchor()

/** The click-catchers for a step open to the whole page: one over each of
 * the first four elements its `guard` finds, the other strips empty. */
function guardRects(selector: string | undefined, none: Rect): Rect[] {
  const found = selector === undefined ? [] : [...document.querySelectorAll(selector)].slice(0, 4)
  const rects: Rect[] = found.map((el) => {
    const r = el.getBoundingClientRect()
    return { left: r.left, top: r.top, width: r.width, height: r.height }
  })
  while (rects.length < 4) rects.push(none)
  return rects
}

/** A hand card's anchor is its stable hit box (`.hand-card`, App.css), but
 * what the player sees is its tile, which the fan turns and a hover lifts and
 * grows: the ring follows the tile, `null` for any other anchor. */
const turnedTile = (el: Element): HTMLElement | null => {
  if (!el.matches('.hand-card')) return null
  const tile = el.querySelector(':scope > .card-tile')
  return tile instanceof HTMLElement ? tile : null
}

const rectOf = (r: DOMRect): Rect => ({ left: r.left, top: r.top, width: r.width, height: r.height })

/** The viewport without its scrollbar, which the blockers mustn't cover. */
const viewport = () => ({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight })

/**
 * The tutorials' coach marks: one card (title, a few friendly sentences,
 * Back / Next / Exit and a step counter) beside the thing it's about, with a
 * ring and a spotlight cut out around it. Mounted once per page — at the
 * app's root, and in the library and the deck builder — and portalled to
 * `<body>`, above the animation layer and the Settings panel, so nothing can
 * cover an anchor or the card.
 *
 * **Other clicks are blocked** (the user's call): four strips around the
 * spotlight's hole catch every click but those in the hole — and a step that
 * only explains (`advance: 'next'`) covers the hole too, so pressing what's
 * pointed at can't run off and leave the tour behind. Keys are swallowed the
 * same way (Space would pass priority in a game), except in the card itself,
 * in an interactive spotlight, Tab, and Escape, which leaves the tour.
 *
 * **Re-anchored every animation frame** while a step is open: one
 * `querySelector` (or resolver call) and a rect, the DOM rewritten only when
 * something moved, so a board remounting, a page scrolling or a window
 * resizing can't strand it. While its anchor is missing the step shows
 * nothing (a click-catcher only), and after {@link WAIT_NOTICE_MS} a card in
 * the middle saying it's waiting — never a ring in the wrong place.
 *
 * On a page load it picks up the site tour where the progress store left it
 * (`tour.at`): on the step's own page it carries straight on; anywhere else
 * it asks first.
 */
export function CoachLayer({ page, resumable = SITE_TOUR }: { readonly page: PageId; readonly resumable?: Tour }) {
  const coach = useCoach()
  // Keeps the animation switch (`:root[data-reduce-motion]`) applied on the
  // pages that load no game code.
  useMotionPrefs()

  useLayoutEffect(() => {
    setCoachPage(page)
    // A saved tour, picked up as the page loads or as App's screen changes
    // (after a game, say) — only while no tour is open.
    if (getCoach().tour !== null || resumable.persist !== true) return
    const at = progressStore.get().tour.at
    if (at === null) return
    const resume = resumeAt(resumable, at, page)
    if (resume.kind === 'show') startTour(resumable, resume.index)
    else if (resume.kind === 'offer') offerTour(resumable, resume.index)
    else if (resume.kind === 'gone') setTourAt(null)
  }, [page, resumable])

  const { tour, index, offer } = coach
  const step = tour?.steps[index]

  // While a tour is open, Escape leaves it from anywhere — unless it's one
  // whose way out does more than close a card (a lesson's leaves its room).
  useEffect(() => {
    if (tour === null || tour.keepOnEscape === true) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopImmediatePropagation()
      stopTour()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [tour])

  if (tour === null || step === undefined) return null
  if (offer) {
    return createPortal(
      <div className="coach-layer">
        <div className="coach-dim" />
        <CenteredCard
          title="Pick up the tour?"
          body="You were partway through the site tour. Carry on from where you left off?"
          actions={
            <>
              <button type="button" className="link-button coach-exit" onClick={stopTour}>
                Exit tour
              </button>
              <button type="button" className="coach-next" onClick={continueTour} autoFocus>
                Continue
              </button>
            </>
          }
        />
      </div>,
      document.body,
    )
  }
  const onPage = step.page === undefined || step.page === page
  // A game in progress never shows another page's step, not even a notice.
  if (!onPage && page === 'game') return null
  return createPortal(
    <StepView key={`${tour.id}:${step.id}`} tour={tour} index={index} step={step} page={page} onPage={onPage} />,
    document.body,
  )
}

type Phase = 'pending' | 'anchored' | 'center' | 'missing' | 'waiting'

function StepView({
  tour,
  index,
  step,
  page,
  onPage,
}: {
  readonly tour: Tour
  readonly index: number
  readonly step: Step
  readonly page: PageId
  readonly onPage: boolean
}) {
  const [phase, setPhase] = useState<Phase>(onPage && step.anchor === undefined ? 'center' : 'pending')
  const phaseRef = useRef<Phase>(phase)
  const ringRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])
  const anchorEl = useRef<Element | null>(null)
  const interactive = isInteractive(step)
  // A step whose goal takes clicks across the page: nothing blocked but what
  // it guards, and nothing held up while its anchor is away.
  const open = step.reach === 'page'

  // The frame loop: advance by itself when the step says so, find the
  // anchor, and write the ring, the click-catchers and the card.
  useLayoutEffect(() => {
    let raf = 0
    // What the ring was last drawn as — its rect and any turn — so the DOM is
    // rewritten only when something moved.
    let lastRing: string | null = null
    let missingSince = performance.now()
    let scrolled = false
    let done = false
    const show = (next: Phase) => {
      if (phaseRef.current === next) return
      phaseRef.current = next
      setPhase(next)
    }
    const placeCardAt = (place: { left: number; top: number }) => {
      const card = cardRef.current
      if (card === null) return
      card.style.left = `${Math.round(place.left)}px`
      card.style.top = `${Math.round(place.top)}px`
      card.classList.add('placed')
    }
    const tick = () => {
      if (done) return
      if (onPage && autoAdvanced(step.advance, (s) => document.querySelector(s) !== null)) {
        done = true
        advance(index, 'auto')
        return
      }
      const view = viewport()
      const card = cardRef.current
      const cardSize = { width: card?.offsetWidth ?? 0, height: card?.offsetHeight ?? 0 }
      const el = onPage && step.anchor !== undefined ? resolveAnchor(step.anchor) : null
      const r = el?.getBoundingClientRect()
      const tile = el === null ? null : turnedTile(el)
      // The hole spans the card as drawn, grown on hover, so it can be clicked.
      const shown = r === undefined ? undefined : tile === null ? rectOf(r) : unionRect(rectOf(r), rectOf(tile.getBoundingClientRect()))
      const hole = shown !== undefined && shown.width > 0 && shown.height > 0 ? holeRect(shown, view) : null
      anchorEl.current = hole !== null ? el : null

      if (onPage && step.anchor === undefined) {
        show('center')
        placeCardAt(centerCard(cardSize, view))
      } else if (hole !== null && el !== null) {
        // Not in a game, whose page never scrolls: a hand card tucked half
        // below the screen would scroll its tray instead.
        if (!scrolled && page !== 'game') {
          scrolled = true
          el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
        }
        missingSince = performance.now()
        show('anchored')
        // A turned tile's ring is its own box, turned the same way around the
        // same origin; anything else's is the hole.
        const turned =
          tile !== null && r !== undefined
            ? (() => {
                const cs = getComputedStyle(tile)
                const box = {
                  left: r.left + tile.offsetLeft,
                  top: r.top + tile.offsetTop,
                  width: tile.offsetWidth,
                  height: tile.offsetHeight,
                }
                return { ...tiltedRing(box, cs.transformOrigin), rotate: cs.rotate, translate: cs.translate, scale: cs.scale }
              })()
            : null
        const ringRect = turned?.rect ?? hole
        const key = JSON.stringify([
          Math.round(ringRect.left),
          Math.round(ringRect.top),
          Math.round(ringRect.width),
          Math.round(ringRect.height),
          turned?.origin,
          turned?.rotate,
          turned?.translate,
          turned?.scale,
        ])
        if (key !== lastRing) {
          lastRing = key
          const ring = ringRef.current
          if (ring !== null) {
            ring.style.left = `${ringRect.left}px`
            ring.style.top = `${ringRect.top}px`
            ring.style.width = `${ringRect.width}px`
            ring.style.height = `${ringRect.height}px`
            ring.style.transformOrigin = turned?.origin ?? ''
            ring.style.rotate = turned !== null && turned.rotate !== 'none' ? turned.rotate : ''
            ring.style.translate = turned !== null && turned.translate !== 'none' ? turned.translate : ''
            ring.style.scale = turned !== null && turned.scale !== 'none' ? turned.scale : ''
          }
        }
        // Rewritten every frame, not only when the hole moved: a resize
        // moves the strips' far edges, and the card's own size changes as
        // it mounts.
        const full = { left: 0, top: 0, width: view.width, height: view.height }
        const none = { left: 0, top: 0, width: 0, height: 0 }
        const strips = open
          ? guardRects(step.guard, none)
          : interactive
            ? blockerRects(hole, view)
            : [full, none, none, none]
        strips.forEach((s, i) => {
          const b = blockRefs.current[i]
          if (!b) return
          b.style.left = `${s.left}px`
          b.style.top = `${s.top}px`
          b.style.width = `${s.width}px`
          b.style.height = `${s.height}px`
        })
        placeCardAt(placeCard(hole, cardSize, view, step.placement))
      } else {
        lastRing = null
        if (performance.now() - missingSince > WAIT_NOTICE_MS) {
          show('waiting')
          placeCardAt(centerCard(cardSize, view))
        } else {
          show('missing')
        }
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => {
      done = true
      cancelAnimationFrame(raf)
    }
  }, [index, interactive, onPage, open, page, step])

  // A click inside the spotlight on what the step waits for moves it on —
  // in the capture phase, so the place is saved before a link's page load.
  useEffect(() => {
    const adv = step.advance
    if (adv === 'next' || !('click' in adv)) return
    const onClick = (e: MouseEvent) => {
      const t = e.target
      if (t instanceof Element && t.closest(adv.click) !== null) advance(index, 'click')
    }
    window.addEventListener('click', onClick, true)
    return () => window.removeEventListener('click', onClick, true)
  }, [index, step])

  // Keys that would act on the page are swallowed: only the card, an
  // interactive spotlight, and Tab get them (Escape is the layer's) — except
  // on a step open to the whole page, where they all go through.
  useEffect(() => {
    if (open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Tab') return
      const t = e.target
      if (t instanceof Node) {
        if (cardRef.current?.contains(t) === true) return
        if (interactive && anchorEl.current?.contains(t) === true) return
      }
      e.preventDefault()
      e.stopImmediatePropagation()
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('keyup', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('keyup', onKey, true)
    }
  }, [interactive, open])

  const backTo = backFrom(tour, index, page)
  const last = index === tour.steps.length - 1
  const waits = step.advance !== 'next'

  const card = (
    <div
      ref={cardRef}
      className={`coach-card${phase === 'center' || phase === 'waiting' ? ' centered' : ''}${
        phase === 'pending' || phase === 'missing' ? ' coach-card-hidden' : ''
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="coach-title"
      data-step={step.id}
    >
      <div className="coach-count mono">
        {tour.counter ?? `${tour.title} · ${index + 1} of ${tour.steps.length}`}
      </div>
      <h2 className="coach-title" id="coach-title">
        {step.title}
      </h2>
      {phase === 'waiting' && !open ? (
        <p className="coach-body">Hang on: this part of the page hasn't shown up yet.</p>
      ) : (
        // A blank line starts a paragraph (a lesson's copy uses them).
        step.body.split(/\n\s*\n/).map((para, i) => (
          <p key={i} className="coach-body">
            {para}
          </p>
        ))
      )}
      {step.goals !== undefined && step.goals.length > 0 ? (
        <ul className="coach-goals" aria-label="To do">
          {step.goals.map((g) => (
            <li key={g.id} className={g.done ? 'done' : undefined} data-goal={g.id} data-done={g.done}>
              <span className="coach-goal-box" aria-hidden="true">
                {g.done ? '✓' : ''}
              </span>
              <span>{g.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {step.buttons !== undefined ? (
        // The quiet links on the left, the buttons pushed right.
        <div className="coach-actions">
          {step.buttons
            .filter((b) => b.link === true)
            .map((b) => (
              <button key={b.label} type="button" className="link-button coach-exit" onClick={b.onClick}>
                {b.label}
              </button>
            ))}
          <span className="coach-spacer" />
          {step.buttons
            .filter((b) => b.link !== true)
            .map((b) =>
              b.primary === true ? (
                <NextButton
                  key={b.label}
                  label={b.label}
                  shown={phase !== 'pending' && phase !== 'missing'}
                  onClick={b.onClick}
                />
              ) : (
                <button key={b.label} type="button" className="coach-back" onClick={b.onClick}>
                  {b.label}
                </button>
              ),
            )}
        </div>
      ) : (
        <div className="coach-actions">
          <button type="button" className="link-button coach-exit" onClick={stopTour}>
            Exit tour
          </button>
          <span className="coach-spacer" />
          {backTo !== null ? (
            <button type="button" className="coach-back" onClick={back}>
              Back
            </button>
          ) : null}
          {waits ? null : (
            <NextButton
              label={last ? 'Done' : 'Next'}
              shown={phase !== 'pending' && phase !== 'missing'}
              onClick={() => advance(index, 'next')}
            />
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="coach-layer" data-phase={phase} data-reach={open ? 'page' : 'spotlight'}>
      {/* The ring and the strips are always there, shown only while
          anchored (coach.css), so the frame that finds the anchor can
          place them before the render that shows them. */}
      <div ref={ringRef} className="coach-ring" />
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="coach-block coach-strip"
          ref={(el) => {
            blockRefs.current[i] = el
          }}
        />
      ))}
      {open ? null : phase === 'center' || phase === 'waiting' ? (
        <div className="coach-dim" />
      ) : phase === 'anchored' ? null : (
        // Pending or briefly missing: nothing to see, but nothing to click
        // either, so a second click can't land while a room is being made.
        <div className="coach-block coach-block-full" />
      )}
      {card}
    </div>
  )
}

/** The card's main button, focused as the step opens so Enter takes it. */
function NextButton({
  label,
  shown,
  onClick,
}: {
  readonly label: string
  /** The card is visible: a hidden button can't take focus. */
  readonly shown: boolean
  readonly onClick: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (shown) ref.current?.focus({ preventScroll: true })
  }, [shown])
  return (
    <button ref={ref} type="button" className="coach-next" onClick={onClick}>
      {label}
    </button>
  )
}

/** A card in the middle of a dimmed page, outside any step. */
function CenteredCard({
  title,
  body,
  actions,
}: {
  readonly title: string
  readonly body: string
  readonly actions: React.ReactNode
}) {
  return (
    <div className="coach-card centered placed coach-card-fixed" role="dialog" aria-modal="true" aria-labelledby="coach-title">
      <h2 className="coach-title" id="coach-title">
        {title}
      </h2>
      <p className="coach-body">{body}</p>
      <div className="coach-actions">{actions}</div>
    </div>
  )
}
