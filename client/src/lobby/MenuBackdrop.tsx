import { useCallback } from 'react'
import './landing.css'

/**
 * How far into its drift (ms) the last backdrop to leave the page had got.
 * Each menu screen mounts a backdrop of its own — the landing page, the seat
 * picker, the waiting room — so going from one to the next started the loop
 * again from its first frame, and the art behind the page jumped (the user,
 * 2026-11-17: its position should persist between the main menu and the
 * lobby). The next one starts here instead: the same picture, still moving.
 * Kept across a game too, so the menu comes back where it was left.
 */
let driftAt: number | null = null

/**
 * A callback ref for the drifting backdrop: holds its animation still while
 * the page is hidden. A compositor animation keeps time in a hidden tab
 * without drawing, so alt-tabbing back showed the frame from when it was
 * left, then snapped to where the clock had got to (the user, 2026-10-10).
 * Paused instead, it carries on from where it was seen last.
 *
 * Paused through the animation itself (`Animation.pause()`), not the
 * `animation-play-state` style: a hidden tab recalculates no styles, so a
 * style set as it hid took effect only once it was shown again — together
 * with the `running` set then, which cancelled it — and the drift never
 * paused at all (the user, 2026-10-14, "still jumps"). `pause()` holds the
 * time at once, and a hidden document's timeline stands at its last frame.
 */
function useHeldWhileHidden(): (el: HTMLElement | null) => void {
  return useCallback((el: HTMLElement | null) => {
    if (el === null) return
    // Carries on from where the last backdrop had got to (`driftAt`), before
    // its first paint.
    if (driftAt !== null) for (const animation of el.getAnimations()) animation.currentTime = driftAt
    const hold = () => {
      for (const animation of el.getAnimations()) {
        if (document.hidden) animation.pause()
        else animation.play()
      }
    }
    hold()
    document.addEventListener('visibilitychange', hold)
    // React 19 runs the ref's returned cleanup as the element goes, while it
    // is still in the page and its animation still has its time.
    return () => {
      const at = el.getAnimations()[0]?.currentTime
      if (typeof at === 'number') driftAt = at
      document.removeEventListener('visibilitychange', hold)
    }
  }, [])
}

/**
 * The menus' backdrop: a zoomed-in crop of the top-100-commanders tile,
 * drifting diagonally behind everything — the landing page's, and the
 * waiting room's since 2026-11-11 (it was a bare black page, which read as a
 * different, unfinished site after the front door). Two elements, not one: the
 * outer holds the angle and clips, the inner does the moving — see
 * landing.css for why the loop can't just translate the outer. Its parent
 * needs `isolation: isolate` and a background colour of its own, so the
 * backdrop's negative z-index paints above that and below everything else.
 */
export function MenuBackdrop() {
  const layerRef = useHeldWhileHidden()
  return (
    <div className="landing-backdrop" aria-hidden="true">
      <div className="landing-backdrop-layer" ref={layerRef} />
    </div>
  )
}
