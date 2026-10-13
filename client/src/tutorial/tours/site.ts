import type { Tour } from '../types.ts'
import { DECK_BUILDER_STEPS } from './deckBuilder.ts'
import { LANDING_STEPS, LANDING_TO_LOBBY } from './landing.ts'
import { LIBRARY_STEPS } from './library.ts'
import { LOBBY_STEPS } from './lobby.ts'

/**
 * The site tour, for someone who knows Magic but not this site: the front
 * page, the deck builder, the library, then back to the front page to open
 * a room and finish in its lobby — where the player can go straight on to a
 * game. Crossing to the deck builder is the player's own click on its link;
 * the deck builder's and the library's last Next load the next page; the
 * lobby is reached by clicking Create a game. Each page's copy is in its own
 * file beside its steps.
 */
export const SITE_TOUR: Tour = {
  id: 'site',
  title: 'Tour the site',
  startPath: '/',
  persist: true,
  pages: {
    landing: { path: '/' },
    'deck-builder': { path: '/deck-builder' },
    library: { path: '/library' },
    lobby: { via: LANDING_TO_LOBBY.id },
  },
  steps: [...LANDING_STEPS, ...DECK_BUILDER_STEPS, ...LIBRARY_STEPS, LANDING_TO_LOBBY, ...LOBBY_STEPS],
}
