import { tourAnchor } from '../anchors.ts'
import type { Step } from '../types.ts'

/**
 * The site tour in a room's lobby — the seat board — reached by creating a
 * room. Every step only points: Add bot, Ready and Start Game do things the
 * tour shouldn't do for the player, and the last card leaves them here to
 * play.
 */
export const LOBBY_STEPS: readonly Step[] = [
  {
    id: 'lobby-seats',
    page: 'lobby',
    anchor: tourAnchor('lobby-seats'),
    title: 'The seats',
    body:
      "Welcome to your room! Each panel is a seat at the table, with the deck it's bringing. " +
      "You're in the first one, and Add player makes room for up to four.",
    advance: 'next',
  },
  {
    id: 'lobby-add-bot',
    page: 'lobby',
    anchor: tourAnchor('lobby-add-bot'),
    title: 'Add a bot',
    body: 'No friends free right now? An open seat can take a bot with a random deck, and you can change its deck after.',
    advance: 'next',
  },
  {
    id: 'lobby-my-deck',
    page: 'lobby',
    anchor: tourAnchor('lobby-my-deck'),
    title: 'Your deck',
    body: "This is the deck you're bringing: your active deck, to start with. Click it to pick another.",
    advance: 'next',
  },
  {
    id: 'lobby-settings',
    page: 'lobby',
    anchor: tourAnchor('lobby-settings'),
    title: 'Room settings',
    body:
      'Starting life, who goes first, whether decks must be Commander-legal, and how the bots play. ' +
      'The host sets these, and everyone else sees them.',
    placement: 'left',
    advance: 'next',
  },
  {
    id: 'lobby-invite',
    page: 'lobby',
    anchor: tourAnchor('lobby-invite'),
    title: 'Invite friends',
    body: 'Copy the invite link and send it to a friend: it opens this room for them. The room code works too.',
    advance: 'next',
  },
  {
    id: 'lobby-ready',
    page: 'lobby',
    anchor: tourAnchor('lobby-ready'),
    title: 'Ready up',
    body: 'Type a name in your seat if you like, then press Ready. Your deck stays locked in until you un-ready.',
    advance: 'next',
  },
  {
    id: 'lobby-start',
    page: 'lobby',
    anchor: tourAnchor('lobby-start'),
    title: 'Start the game',
    body: 'Once every seat is ready (bots always are), Start Game deals everyone in.',
    placement: 'left',
    advance: 'next',
  },
  {
    id: 'done',
    page: 'lobby',
    title: "That's the tour!",
    body:
      "You're all set: add a bot or two, press Ready, then Start Game. " +
      'Have fun, and the help button in the corner brings this tour back any time.',
    advance: 'next',
  },
]
