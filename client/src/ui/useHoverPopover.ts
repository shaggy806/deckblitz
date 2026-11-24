import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { HTMLAttributes } from 'react'
import { pointerIsOver } from './hoverCarry.ts'
import { useTouch } from './touch.ts'

/** Breathing room between the anchor and its popover, and between the
 * popover and the viewport edge it gets clamped against. */
const POPOVER_GAP = 6

export interface HoverPopover<T extends HTMLElement = HTMLDivElement> {
  /** Put on the element the popover is positioned against. */
  readonly wrapRef: React.RefObject<T | null>
  /** Put on the portalled popover itself. */
  readonly popoverRef: React.RefObject<HTMLDivElement | null>
  readonly open: boolean
  /** Spread onto the wrapper — mouse *and* focus, so the keyboard reaches it
   * too (React's onFocus/onBlur bubble, so a button inside fires them). On a
   * touch device, a finger's instead: see the hook. */
  readonly handlers: HTMLAttributes<T>
}

/** How long a finger rests on an anchor before its popover opens. */
const LONG_PRESS_MS = 450
/** And how far it may drift meanwhile, in CSS pixels: further is a scroll. */
const LONG_PRESS_SLOP = 12

/** By touch, the anchor whose popover is open, as `touchKey` names it: kept
 * here because the board remounts each frame, and the tile's counterpart
 * takes its popover up (the pointer's place does that for a mouse:
 * `hoverCarry.ts`). */
let touchOpen: string | null = null

/** A name for an anchor that its counterpart after a remount shares: its
 * kind and its object. Null without an object id, and then nothing is
 * carried. */
function touchKey(el: HTMLElement): string | null {
  const id = el.dataset.objId
  if (id === undefined) return null
  return (el.classList[0] ?? '') + ':' + id
}

/**
 * Hover/focus state plus JS placement for a card popover that has to be
 * portalled to `document.body`.
 *
 * It has to be portalled: a tile inside `.quadrant-body` — which is
 * `overflow-y: auto` and therefore *clips* every descendant — had its
 * popover sliced off at the quadrant's edge, and no z-index fixes that. Nor
 * can a fixed-position child escape, now that `.quadrant-body` is a size
 * container: `contain: layout` makes it the containing block for fixed
 * descendants too. Leaving the DOM subtree entirely is the only way out, and
 * once placement is in JS it can also flip above the anchor instead of below
 * when the anchor is near the bottom of the screen, which a CSS `:hover`
 * rule couldn't do either.
 *
 * Placement is written straight to the node rather than held in state: the
 * popover's own size depends on how much rules text the card has, so where
 * it goes can only be decided *after* it has rendered, and feeding that
 * measurement back through state would just re-render to produce the same
 * markup with two numbers changed. It renders `visibility: hidden` for that
 * one layout pass (the `placed` class turns it on), which is also what gives
 * the opacity transition something to start from.
 *
 * **By touch** (`touch.ts`) nothing hovers, and a tap is the hover and the
 * click at once. There the popover opens on a tap, after whatever the tap
 * did, unless `tapOpens` is false — the anchor is what a decision is picking
 * from, where each tap is an answer and a card opening over the board at
 * every one would be in the way — and on a long press, which never clicks:
 * the way to read a card without using it. It closes on the next touch
 * anywhere but its anchor, the popover included.
 *
 * @param dep Anything that can change the popover's size while it's open (a
 *   pushed view changing the card's rules text, say) and so is a reason to
 *   re-place it.
 */
export function useHoverPopover<T extends HTMLElement = HTMLDivElement>(
  dep?: unknown,
  /** A panel the anchor sits in that the popover should open beside, to its
   * left and level with the anchor, rather than over: the History log's
   * names, whose card otherwise covered the lines under the one being read. */
  beside?: (anchor: T) => Element | null,
  /** By touch, whether a tap on the anchor opens the popover (a long press
   * always does). */
  tapOpens = true,
): HoverPopover<T> {
  const wrapRef = useRef<T>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const touch = useTouch()
  // The long press under way, and whether one has just opened the popover:
  // the click the finger's lifting sends is then not a click.
  const press = useRef<{ readonly timer: number; readonly x: number; readonly y: number } | null>(null)
  const swallowClick = useRef(false)
  // Opened as this mounted, under a pointer already resting on the anchor:
  // the board remounts each frame (`hoverCarry.ts`), and this is the popover
  // the old tile had open, so it shows without its fade.
  const carried = useRef(false)
  useLayoutEffect(() => {
    const anchor = wrapRef.current
    if (anchor === null) return
    if (touch) {
      // No pointer rests anywhere: the popover this anchor's counterpart had
      // open is the one to take up.
      if (touchOpen !== null && touchKey(anchor) === touchOpen) {
        carried.current = true
        setOpen(true)
      }
      return
    }
    if (!pointerIsOver(anchor)) return
    carried.current = true
    setOpen(true)
    // The browser may never count the pointer as having entered a tile that
    // mounted under it, and then sends no `mouseleave` either: a popover
    // opened this way closes on the first move that leaves its anchor
    // (bubbling, so `hoverCarry.ts`'s capturing listener has already
    // recorded where the pointer is).
    const follow = () => {
      if (!carried.current) {
        window.removeEventListener('pointermove', follow)
      } else if (!pointerIsOver(anchor)) {
        carried.current = false
        setOpen(false)
        window.removeEventListener('pointermove', follow)
      }
    }
    window.addEventListener('pointermove', follow, { passive: true })
    return () => window.removeEventListener('pointermove', follow)
    // `touch` is read once, as the anchor mounts: a device doesn't change
    // its pointer between one frame's board and the next.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // By touch: open until the next touch that isn't on the anchor. One on the
  // popover puts it away too, and does nothing else (App.css gives it the
  // pointer there, so the tap doesn't reach what the card covers).
  useEffect(() => {
    if (!touch || !open) return
    const down = (e: PointerEvent) => {
      const anchor = wrapRef.current
      if (anchor !== null && e.target instanceof Node && anchor.contains(e.target)) return
      if (anchor !== null && touchKey(anchor) === touchOpen) touchOpen = null
      carried.current = false
      setOpen(false)
    }
    document.addEventListener('pointerdown', down, true)
    return () => document.removeEventListener('pointerdown', down, true)
  }, [touch, open])
  useEffect(
    () => () => {
      if (press.current !== null) window.clearTimeout(press.current.timer)
    },
    [],
  )

  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const anchor = wrapRef.current
      const popover = popoverRef.current
      if (!anchor || !popover) return
      const a = anchor.getBoundingClientRect()
      const p = popover.getBoundingClientRect()
      const panel = beside?.(anchor)?.getBoundingClientRect()
      if (panel !== undefined && panel.left - p.width - POPOVER_GAP >= POPOVER_GAP) {
        // Clear of the panel, on its left, as near level with the anchor as
        // the screen allows.
        popover.classList.add('to-left')
        popover.style.left = `${panel.left - p.width - POPOVER_GAP}px`
        popover.style.top = `${Math.max(POPOVER_GAP, Math.min(a.top, window.innerHeight - p.height - POPOVER_GAP))}px`
        popover.classList.toggle('hover-carry', carried.current)
        popover.classList.add('placed')
        return
      }
      // Below the anchor by preference (the board area below a tile, or the
      // collapsed hand tray under your own board, usually has the most
      // slack); above it when that would run off the bottom of the screen,
      // which is every tile in a bottom-row quadrant once the popover is
      // tall enough to matter; and pinned inside the viewport if neither
      // side fits, since a clipped popover is the thing being fixed here.
      const below = a.bottom + POPOVER_GAP
      const above = a.top - POPOVER_GAP - p.height
      // By touch the bottom row is a finger's buttons (the hand's, Pass),
      // and the card takes the pointer: it stays off them.
      const row = touch ? document.querySelector('.hand-toggle')?.getBoundingClientRect().top : undefined
      const floor = row !== undefined && row - p.height > 0 ? row : window.innerHeight
      const top =
        below + p.height <= floor
          ? below
          : above >= 0
            ? above
            : Math.max(POPOVER_GAP, floor - p.height - POPOVER_GAP)
      // An anchor in the right half of the screen opens its popover leftward
      // — lined up with the anchor's right edge, and with any side panel
      // (`KeywordTips`, held cards) on the card's left, the `to-left` class
      // reversing the row — so what's beside the card faces the middle of
      // the screen rather than running into its edge.
      const toLeft = a.left + a.width / 2 > window.innerWidth / 2
      popover.classList.toggle('to-left', toLeft)
      const left = Math.min(
        Math.max(POPOVER_GAP, toLeft ? a.right - p.width : a.left),
        Math.max(POPOVER_GAP, window.innerWidth - p.width - POPOVER_GAP),
      )
      popover.style.left = `${left}px`
      popover.style.top = `${top}px`
      popover.classList.toggle('hover-carry', carried.current)
      popover.classList.add('placed')
    }
    place()
    // The anchor moves under a popover that's already open whenever a
    // quadrant scrolls or the window resizes — capture so a scroll on any
    // of the nested scroll boxes between the anchor and the page counts.
    window.addEventListener('scroll', place, { capture: true, passive: true })
    window.addEventListener('resize', place)
    // And the popover can grow after it's placed: a double-faced card's
    // other face (`OtherFace`) comes in once its definition's shard does,
    // which widens the row past where it was clamped.
    const grown = new ResizeObserver(place)
    if (popoverRef.current) grown.observe(popoverRef.current)
    return () => {
      window.removeEventListener('scroll', place, { capture: true })
      window.removeEventListener('resize', place)
      grown.disconnect()
    }
    // `beside` is a module-level function where it's passed (`EventLog`),
    // so it doesn't re-run this.
  }, [open, dep, beside, touch])

  if (touch) {
    const show = () => {
      const anchor = wrapRef.current
      touchOpen = anchor === null ? null : touchKey(anchor)
      setOpen(true)
    }
    const endPress = () => {
      if (press.current === null) return
      window.clearTimeout(press.current.timer)
      press.current = null
    }
    return {
      wrapRef,
      popoverRef,
      open,
      handlers: {
        onPointerDown: (e) => {
          swallowClick.current = false
          endPress()
          if (e.pointerType === 'mouse') return
          const timer = window.setTimeout(() => {
            press.current = null
            swallowClick.current = true
            show()
          }, LONG_PRESS_MS)
          press.current = { timer, x: e.clientX, y: e.clientY }
        },
        onPointerMove: (e) => {
          const p = press.current
          if (p !== null && Math.hypot(e.clientX - p.x, e.clientY - p.y) > LONG_PRESS_SLOP) endPress()
        },
        onPointerUp: endPress,
        onPointerCancel: endPress,
        onPointerLeave: endPress,
        // The finger lifting after a long press: not a click on the tile.
        onClickCapture: (e) => {
          if (!swallowClick.current) return
          swallowClick.current = false
          e.stopPropagation()
          e.preventDefault()
        },
        // After the tile's own click (this is its parent).
        onClick: () => {
          if (tapOpens) show()
        },
        // A long press is the browser's "save image" menu too.
        onContextMenu: (e) => e.preventDefault(),
      },
    }
  }
  return {
    wrapRef,
    popoverRef,
    open,
    handlers: {
      onMouseEnter: () => setOpen(true),
      onMouseLeave: () => {
        carried.current = false
        setOpen(false)
      },
      onFocus: () => setOpen(true),
      onBlur: () => setOpen(false),
    },
  }
}
