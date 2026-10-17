import { tourAnchor } from '../anchors.ts'
import type { Step } from '../types.ts'

/** The site tour's stops on the front page: the ways into a game, the two
 * pages a Moxfield and Scryfall user needs no tour of (but for this site's
 * stand-ins), and the corner's buttons. The board comes after, as a lesson. */
export const LANDING_STEPS: readonly Step[] = [
  {
    id: 'welcome',
    page: 'landing',
    title: 'Welcome to Deck Blitz!',
    body:
      "A minute on where things are, then a practice table to show how a game works here. " +
      'Escape leaves the tour whenever you like.',
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
    title: 'Play with friends',
    body:
      'Create a game opens a room to fill with friends, bots or both; share its code or invite link. ' +
      "Got a code from someone else? Paste it beside it to join their table.",
    advance: 'next',
  },
  {
    id: 'landing-deck-builder',
    page: 'landing',
    anchor: tourAnchor('landing-deck-builder'),
    title: 'Decks and cards',
    body:
      'The deck builder and the card library work much as you would expect. ' +
      "One thing that's ours: a card the site can't play yet gets a close stand-in, and importing a deck lets you choose each one.",
    advance: 'next',
  },
  {
    id: 'corner-settings',
    page: 'landing',
    anchor: tourAnchor('corner-settings'),
    title: 'Settings',
    body:
      'When the game stops to let you act, bot and animation speed, and sound. ' +
      "They're saved on this device, and they're in every game's top bar too.",
    placement: 'top',
    advance: 'next',
  },
  {
    id: 'corner-help',
    page: 'landing',
    anchor: tourAnchor('corner-help'),
    title: 'Help, any time',
    body: 'This tour, the board tour and Learn Commander are all here whenever you want them.',
    placement: 'top',
    advance: 'next',
  },
]
