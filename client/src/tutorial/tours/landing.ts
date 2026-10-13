import { tourAnchor } from '../anchors.ts'
import type { Step } from '../types.ts'

/** The site tour on the front page: what each way in does, then on to the
 * deck builder (the player clicks its link, which loads the page). */
export const LANDING_STEPS: readonly Step[] = [
  {
    id: 'welcome',
    page: 'landing',
    title: 'Welcome to MTG Deck Blitz!',
    body:
      "Here's a quick look around: blitzing a deck, playing with friends, building decks and browsing cards. " +
      'It takes a couple of minutes, and Escape leaves the tour whenever you like.',
    advance: 'next',
  },
  {
    id: 'landing-blitz',
    page: 'landing',
    anchor: tourAnchor('landing-blitz'),
    title: 'Blitz a deck',
    body:
      "The quickest way to play. Copy a Commander decklist from wherever you keep it, click here, and you're in a game against three bots. " +
      "If the page can't read your clipboard, a box opens to paste the list into.",
    placement: 'top',
    advance: 'next',
  },
  {
    id: 'landing-create',
    page: 'landing',
    anchor: tourAnchor('landing-create'),
    title: 'Start a table',
    body: "Create a game opens a room you can fill with friends, bots or both. We'll pop into one at the end of the tour.",
    advance: 'next',
  },
  {
    id: 'landing-join',
    page: 'landing',
    anchor: tourAnchor('landing-join'),
    title: 'Join a friend',
    body: "Got a room code or an invite link from someone? Type or paste it here and you'll sit down at their table.",
    advance: 'next',
  },
  {
    id: 'corner-settings',
    page: 'landing',
    anchor: tourAnchor('corner-settings'),
    title: 'Settings',
    body:
      'Animation speed, sound, and when the game stops to let you act all live here. ' +
      "They're saved on this device, so you only set them once.",
    placement: 'top',
    advance: 'next',
  },
  {
    id: 'corner-help',
    page: 'landing',
    anchor: tourAnchor('corner-help'),
    title: 'Help, any time',
    body: "This button brings the tour back whenever you want it. It's also where Learn Commander will live once it's ready.",
    placement: 'top',
    advance: 'next',
  },
  {
    id: 'landing-library',
    page: 'landing',
    anchor: tourAnchor('landing-library'),
    title: 'Card library',
    body: "Every card the site can play, with search and filters. We'll have a look inside shortly.",
    advance: 'next',
  },
  {
    id: 'landing-deck-builder',
    page: 'landing',
    anchor: tourAnchor('landing-deck-builder'),
    title: 'Deck builder',
    body: 'Your decks live here. Click Deck builder and we\'ll go take a look.',
    advance: { click: tourAnchor('landing-deck-builder') },
  },
]

/** Back on the front page after the library: into a room's lobby. */
export const LANDING_TO_LOBBY: Step = {
  id: 'landing-create-go',
  page: 'landing',
  anchor: tourAnchor('landing-create'),
  title: 'Last stop: a table',
  body: 'Click Create a game to open a room of your own. Only people you share its code with can join.',
  advance: { click: tourAnchor('landing-create') },
}
