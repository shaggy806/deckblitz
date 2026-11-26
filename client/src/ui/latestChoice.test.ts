import { describe, expect, it } from 'vitest'
import type { GameEvent, ObjectId, PlayerId } from 'engine/client'
import type { SeatStatus } from 'protocol'
import { latestChoices } from './latestChoice.ts'

const alice = 'p1' as PlayerId
const bob = 'p2' as PlayerId
const seats = [
  { player: alice, displayName: 'Alice' },
  { player: bob, displayName: 'Bob' },
] as unknown as SeatStatus[]
const names: Record<string, string> = { o1: 'Urza’s Incubator', o2: 'Cryptic Command', o3: 'Pithing Needle' }
const nameAt = (id: ObjectId): string => names[id] ?? id
const controllers: Record<string, PlayerId> = { o1: bob }
const controllerOf = (id: ObjectId): PlayerId | undefined => controllers[id]

let seq = 0
const ev = (e: Record<string, unknown>): GameEvent => ({ seq: (seq += 1), ...e }) as unknown as GameEvent
const turn = (): GameEvent => ev({ type: 'turn-began', player: alice, turn: 1 })

describe('latestChoices', () => {
  it("shows each player's newest choice, and its log line on hover", () => {
    const events = [
      turn(),
      ev({ type: 'number-chosen', player: alice, object: 'o2', number: 3 }),
      ev({ type: 'card-name-chosen', player: alice, object: 'o3', name: 'Sol Ring' }),
      ev({ type: 'creature-type-chosen', object: 'o1', creatureType: 'Goblin' }),
    ]
    const choices = latestChoices(events, nameAt, seats, controllerOf)
    expect(choices.get(alice)?.text).toBe('named Sol Ring')
    expect(choices.get(alice)?.line).toBe('Alice names Sol Ring for Pithing Needle')
    // The as-enters choice is its permanent's controller's.
    expect(choices.get(bob)?.text).toBe('chose Goblin')
  })

  it("reads a modal spell's modes by their text, a colour by its name, a player by theirs", () => {
    const modes = latestChoices(
      [ev({ type: 'modes-chosen', source: 'o2', player: alice, modes: [0, 3], texts: ['Counter target spell.', 'Draw a card.'], modal: true })],
      nameAt,
      seats,
      controllerOf,
    )
    expect(modes.get(alice)?.text).toBe('chose: Counter target spell; Draw a card')
    const colour = latestChoices([ev({ type: 'creature-type-chosen', object: 'o1', creatureType: 'R' })], nameAt, seats, controllerOf)
    expect(colour.get(bob)?.text).toBe('chose red')
    const player = latestChoices([ev({ type: 'creature-type-chosen', object: 'o1', creatureType: alice })], nameAt, seats, controllerOf)
    expect(player.get(bob)?.text).toBe('chose Alice')
  })

  it('leaves out a "you may" answer, a random pile and targets', () => {
    const choices = latestChoices(
      [
        ev({ type: 'modes-chosen', source: 'o2', player: alice, modes: [0], texts: ['Draw a card.'] }),
        ev({ type: 'pile-chosen', player: bob, source: 'o2', pile: 0, objects: [], atRandom: true }),
        ev({ type: 'targets-chosen', player: bob, object: 'o2' }),
      ],
      nameAt,
      seats,
      controllerOf,
    )
    expect(choices.size).toBe(0)
  })

  it('keeps a choice through the next turn, not the one after', () => {
    const made = ev({ type: 'number-chosen', player: alice, object: 'o2', number: 7 })
    expect(latestChoices([turn(), made, turn()], nameAt, seats, controllerOf).get(alice)?.text).toBe('chose 7')
    expect(latestChoices([turn(), made, turn(), turn()], nameAt, seats, controllerOf).size).toBe(0)
  })
})
