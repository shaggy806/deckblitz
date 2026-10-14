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
 * @param onLesson How the "?" menu opens a lesson (*Tour the board*, *Learn
 *   Commander* — `HelpMenu`): given on the landing page, which has no room
 *   to leave.
 */
export function CornerToolbar({
  intro = false,
  onLesson,
}: { readonly intro?: boolean; readonly onLesson?: (lesson: string) => void } = {}) {
  return (
    <div className="corner-toolbar" role="toolbar" aria-label="Site">
      <HelpMenu intro={intro} {...(onLesson !== undefined ? { onLesson } : {})} />
      <MotionControl place="corner" />
    </div>
  )
}
