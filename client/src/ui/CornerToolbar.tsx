import { useLayoutEffect, useRef } from 'react'
import { MotionControl } from './MotionControl.tsx'
import { SiteLinks } from '../legal/SiteLinks.tsx'
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
 *   settings and Start game. The landing page also gets `SiteLinks` first in
 *   the row: "Built with Claude Code" and "Send feedback", and Settings'
 *   "Watch a replay…" (`MotionControl`'s `replays`), which takes the page.
 * @param onLesson How the "?" menu opens a lesson (*Tour the board*, *Learn
 *   Commander* — `HelpMenu`): given on the landing page, which has no room
 *   to leave.
 */
export function CornerToolbar({
  intro = false,
  onLesson,
  lessonStarting,
}: {
  readonly intro?: boolean
  readonly onLesson?: (lesson: string) => void
  /** With `onLesson`: whether its lesson is still on its way (`HelpMenu`'s `starting`). */
  readonly lessonStarting?: boolean
} = {}) {
  // How tall the toolbar stands, as `--corner-toolbar-h` on the page: on a
  // phone its links wrap onto rows above (App.css), and the landing page
  // leaves that much room at its foot so its last lines can scroll clear of
  // it (landing.css, a touch device only).
  const boxRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const box = boxRef.current
    if (box === null) return
    const root = document.documentElement
    const note = () => root.style.setProperty('--corner-toolbar-h', `${Math.ceil(box.getBoundingClientRect().height)}px`)
    note()
    const watch = new ResizeObserver(note)
    watch.observe(box)
    return () => {
      watch.disconnect()
      root.style.removeProperty('--corner-toolbar-h')
    }
  }, [])
  return (
    <div className="corner-toolbar" role="toolbar" aria-label="Site" ref={boxRef}>
      {intro ? <SiteLinks /> : null}
      <HelpMenu
        intro={intro}
        {...(onLesson !== undefined ? { onLesson } : {})}
        {...(lessonStarting !== undefined ? { starting: lessonStarting } : {})}
      />
      <MotionControl place="corner" replays={intro} />
    </div>
  )
}
