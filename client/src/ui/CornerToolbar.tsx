import { MotionControl } from './MotionControl.tsx'

/**
 * The corner toolbar out of a game: square buttons fixed to the bottom right
 * of the landing page and the lobby, out of their layout's flow. Settings
 * (the game's own panel, `MotionControl` as a cog) for now; the buttons
 * still to come go beside it, so every screen before a game gets them at
 * once.
 */
export function CornerToolbar() {
  return (
    <div className="corner-toolbar" role="toolbar" aria-label="Site">
      <MotionControl place="corner" />
    </div>
  )
}
