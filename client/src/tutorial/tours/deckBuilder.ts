import { firstAnchor, tourAnchor } from '../anchors.ts'
import type { Step } from '../types.ts'

/** The site tour in the deck builder (`/deck-builder`). */
export const DECK_BUILDER_STEPS: readonly Step[] = [
  {
    id: 'db-import',
    page: 'deck-builder',
    anchor: tourAnchor('db-import'),
    title: 'Import a list',
    body:
      'Paste a decklist from any deck site and it becomes a deck here. ' +
      "Cards the site can't play yet get a close stand-in, and you choose which.",
    placement: 'right',
    advance: 'next',
  },
  {
    id: 'db-my-decks',
    page: 'deck-builder',
    anchor: tourAnchor('db-my-decks'),
    title: 'My decks',
    body:
      'Decks you import or build are saved in this browser. ' +
      'The one marked active is the deck you bring to a table.',
    placement: 'right',
    advance: 'next',
  },
  {
    id: 'db-starters',
    page: 'deck-builder',
    anchor: tourAnchor('db-starters'),
    title: 'Starter decks',
    body: 'Ready-made Commander decks, playable just as they are. Click one to open it.',
    placement: 'right',
    advance: { click: `${tourAnchor('db-starters')} button` },
  },
  {
    id: 'db-editor',
    page: 'deck-builder',
    anchor: tourAnchor('db-editor'),
    title: 'The deck',
    body:
      "Here it is: its commander, its cards by type, and whether it's legal. " +
      'Starter decks are read-only; duplicate one to make it your own.',
    placement: 'bottom',
    advance: 'next',
  },
  {
    id: 'db-make-active',
    page: 'deck-builder',
    anchor: tourAnchor('db-make-active'),
    title: 'Make it active',
    body: "Make active picks the deck you'll bring to a table or a blitz. In a lobby you can still swap it, seat by seat.",
    placement: 'bottom',
    advance: 'next',
  },
  {
    id: 'db-stand-ins',
    page: 'deck-builder',
    // Not every starter deck has stand-ins: the deck's head stands in.
    anchor: firstAnchor('db-stand-ins', 'db-editor'),
    title: 'Stand-ins',
    body:
      "A few cards aren't playable here yet, so a close stand-in plays in their place. " +
      'Starter decks list theirs here, and an imported deck walks you through each one so you can choose.',
    placement: 'bottom',
    advance: 'next',
  },
]
