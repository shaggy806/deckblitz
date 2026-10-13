import { MotionControl } from './MotionControl.tsx'
import { HelpMenu } from '../tutorial/HelpMenu.tsx'

/**
 * The corner toolbar out of a game: square buttons fixed to the bottom right
 * of the landing page and the lobby, out of their layout's flow. Help (the
 * tutorials' "?" menu, `tutorial/HelpMenu`) and Settings (the game's own
 * panel, `MotionControl` as a cog); a button added here appears on every
 * screen before a game at once.
 *
 * @param intro The landing page: a first visit gets the tutorials' callout
 *   over the "?" button. Not in the lobby, where it would sit over the room
 *   settings and Start Game.
 */
export function CornerToolbar({ intro = false }: { readonly intro?: boolean } = {}) {
  return (
    <div className="corner-toolbar" role="toolbar" aria-label="Site">
      <HelpMenu intro={intro} />
      <MotionControl place="corner" />
    </div>
  )
}
