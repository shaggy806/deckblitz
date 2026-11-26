/**
 * Each player's latest choice, for the "chose …" chip on their panel's name
 * row (the user, 2026-11-25: "to keep track of recent choices by
 * bots/players"). Read back from the event log, newest first: a modal
 * spell's or ability's modes, a creature type, colour or player chosen as
 * something entered, a card named, a number, a permanent or player chosen on
 * resolution, a pile, a revealed secret choice, a vote. Not targets (the
 * arrows show them), not a "you may" answer, not a random pick.
 *
 * A choice stays shown through the turn after the one it was made in, then
 * goes: the chip is for what just happened, the log for the rest.
 */

import type { GameEvent, ObjectId, PlayerId, VoteChoice } from 'engine/client'
import type { SeatStatus } from 'protocol'
import { describeEvent, playerLabel } from '../format.ts'

export interface LatestChoice {
  /** The chip: "chose Goblin", "named Sol Ring", "chose: Draw two cards". */
  readonly text: string
  /** Its hover: the log's own line, which names what it was for. */
  readonly line: string
  /** The event's `seq`, so the chip can tell a new choice from the last. */
  readonly seq: number
}

/** A colour chosen from a menu, recorded as its letter. */
const COLOR_NAMES: Readonly<Record<string, string>> = { W: 'white', U: 'blue', B: 'black', R: 'red', G: 'green' }

/** How many turns a choice stays shown after the one it was made in. */
const TURNS_SHOWN = 1

/**
 * Who made `event`'s choice and the chip's words for it, or `null` when it
 * isn't one the chip shows.
 */
function choiceOf(
  event: GameEvent,
  name: (id: ObjectId) => string,
  seats: readonly SeatStatus[],
  controllerOf: (id: ObjectId) => PlayerId | undefined,
): { readonly player: PlayerId; readonly text: string } | null {
  const who = (id: PlayerId): string => playerLabel(id, seats)
  const isPlayer = (s: string): boolean => seats.some((seat) => seat.player === s)
  switch (event.type) {
    case 'modes-chosen': {
      // A modal spell or ability's modes (rule 700.2); a "you may" answer is
      // too common to be worth the chip.
      if (event.modal !== true || event.player === undefined || event.modes.length === 0) return null
      const texts = event.texts
      return {
        player: event.player,
        text:
          texts !== undefined && texts.length === event.modes.length
            ? `chose: ${texts.map((t) => t.replace(/\.$/, '')).join('; ')}`
            : `chose mode ${event.modes.map((m) => m + 1).join(', ')}`,
      }
    }
    case 'creature-type-chosen': {
      // A sector (rule 704.5u) isn't a choice anyone needs reminding of.
      if (/^(all )?(alpha|beta|gamma)$/.test(event.creatureType)) return null
      const player = controllerOf(event.object)
      if (player === undefined) return null
      const chosen = isPlayer(event.creatureType)
        ? who(event.creatureType as PlayerId)
        : (COLOR_NAMES[event.creatureType] ?? event.creatureType)
      return { player, text: `chose ${chosen}` }
    }
    case 'card-name-chosen':
      return { player: event.player, text: `named ${event.name}` }
    case 'number-chosen':
      return { player: event.player, text: `chose ${event.number}` }
    case 'permanent-or-player-chosen':
      return {
        player: event.player,
        text: `chose ${
          event.chosen.kind === 'player'
            ? who(event.chosen.player)
            : event.chosen.kind === 'object'
              ? name(event.chosen.object)
              : 'nothing'
        }`,
      }
    case 'pile-chosen':
      return event.atRandom === true ? null : { player: event.player, text: `chose pile ${event.pile + 1}` }
    case 'secret-choice-revealed':
      return {
        player: event.player,
        text: `chose ${isPlayer(event.choice) ? who(event.choice as PlayerId) : event.choice}`,
      }
    case 'vote-cast':
      return {
        player: event.vote.voter,
        text: `${event.choice === true ? 'chose' : 'voted for'} ${voteText(event.vote.choice, name, who)}`,
      }
    default:
      return null
  }
}

function voteText(choice: VoteChoice, name: (id: ObjectId) => string, who: (id: PlayerId) => string): string {
  if ('option' in choice) return choice.about !== undefined ? `${who(choice.about)} as ${choice.text}` : choice.text
  if ('player' in choice) return who(choice.player)
  if ('number' in choice) return String(choice.number)
  if ('name' in choice) return choice.name
  return name(choice.object)
}

/**
 * Each player's latest choice still shown, by player. `nameAt` names an
 * object as the log does at an event's `seq`; `controllerOf` says whose
 * permanent an as-enters choice was made for (the event doesn't say who).
 */
export function latestChoices(
  events: readonly GameEvent[],
  nameAt: (id: ObjectId, seq: number) => string,
  seats: readonly SeatStatus[],
  controllerOf: (id: ObjectId) => PlayerId | undefined,
): ReadonlyMap<PlayerId, LatestChoice> {
  const found = new Map<PlayerId, LatestChoice>()
  let turnsSince = 0
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const event = events[i]
    if (event.type === 'turn-began') {
      turnsSince += 1
      // Past the turn before this one: nothing older is shown.
      if (turnsSince > TURNS_SHOWN) break
      continue
    }
    const name = (id: ObjectId): string => nameAt(id, event.seq)
    const choice = choiceOf(event, name, seats, controllerOf)
    if (choice === null || found.has(choice.player)) continue
    found.set(choice.player, { text: choice.text, line: describeEvent(event, name, seats), seq: event.seq })
  }
  return found
}
