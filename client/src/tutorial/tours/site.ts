import { apply } from '../coach.ts'
import { BOARD_TOUR_LESSON, lessonUrl } from '../lesson.ts'
import type { Step, Tour } from '../types.ts'
import { LANDING_STEPS } from './landing.ts'

/** The site tour's last stop: on to the board tour, a lesson on a practice
 * table of its own, or not now. Either way the site tour is done. */
const TO_THE_BOARD: Step = {
  id: 'to-the-board',
  page: 'landing',
  title: 'Now, the board',
  body:
    'A game here works a little differently from a paper table: commander damage, looking through zones, the priority buttons, casting from a graveyard. ' +
    'A practice table shows you each in a few minutes.',
  advance: 'next',
  buttons: [
    { label: 'Not now', link: true, onClick: () => apply(SITE_TOUR, { kind: 'finish' }) },
    {
      label: 'Tour the board',
      primary: true,
      onClick: () => {
        apply(SITE_TOUR, { kind: 'finish' })
        window.location.assign(lessonUrl(BOARD_TOUR_LESSON))
      },
    },
  ],
}

/**
 * The site tour, for someone who knows Magic — and Moxfield and Scryfall —
 * but not this site: a few stops on the front page, then the offer of the
 * board tour, where the real differences are. Short on purpose: the deck
 * builder and the library get one stop between them, from the front page.
 */
export const SITE_TOUR: Tour = {
  id: 'site',
  title: 'Tour the site',
  startPath: '/',
  persist: true,
  pages: { landing: { path: '/' } },
  steps: [...LANDING_STEPS, TO_THE_BOARD],
}
