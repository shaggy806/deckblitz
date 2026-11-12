import { useCallback } from 'react'
import './landing.css'

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
    const hold = () => {
      for (const animation of el.getAnimations()) {
        if (document.hidden) animation.pause()
        else animation.play()
      }
    }
    hold()
    document.addEventListener('visibilitychange', hold)
    // React 19 runs the ref's returned cleanup as the element goes.
    return () => document.removeEventListener('visibilitychange', hold)
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
