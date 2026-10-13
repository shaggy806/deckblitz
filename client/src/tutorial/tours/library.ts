import { tourAnchor } from '../anchors.ts'
import type { Step } from '../types.ts'

/** The site tour in the card library (`/library`). */
export const LIBRARY_STEPS: readonly Step[] = [
  {
    id: 'lib-search',
    page: 'library',
    anchor: tourAnchor('lib-search'),
    title: 'Search every card',
    body: 'Search by name, type or rules text. Go ahead and type something if you like.',
    advance: 'next',
    // Typing in the box is fine: nothing here leaves the tour behind.
    interactive: true,
  },
  {
    id: 'lib-types',
    page: 'library',
    anchor: tourAnchor('lib-types'),
    title: 'Card types',
    body: 'Narrow the list to creatures, instants, lands and more.',
    advance: 'next',
    interactive: true,
  },
  {
    id: 'lib-colors',
    page: 'library',
    anchor: tourAnchor('lib-colors'),
    title: 'Colours',
    body: 'Pick one colour or several to see only those cards.',
    advance: 'next',
    interactive: true,
  },
  {
    id: 'lib-set',
    page: 'library',
    anchor: tourAnchor('lib-set'),
    title: 'Sets',
    body: "Choose a set to see the cards from it you can play here, each shown in that set's printing.",
    advance: 'next',
  },
  {
    id: 'lib-card',
    page: 'library',
    anchor: tourAnchor('lib-card'),
    title: 'Open a card',
    body: 'Click a card to see it up close.',
    placement: 'right',
    advance: { click: tourAnchor('lib-card') },
  },
  {
    id: 'lib-printings',
    page: 'library',
    anchor: tourAnchor('lib-printings'),
    title: 'Printings',
    body:
      'Every printing of the card, newest first. Click one to see its art. ' +
      'In the deck builder, right-click a card to choose the printing your deck plays with.',
    placement: 'left',
    advance: 'next',
  },
]
