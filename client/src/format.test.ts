import { describe, expect, it } from 'vitest'
import type { GameEvent, ObjectId, PlayerId } from 'engine/client'
import type { SeatStatus } from 'protocol'
import { HIDDEN_CARD, abilitySourcesOf, describeEvent, forYou, isDetailOnlyEvent, logName, logNameAt, possessive, withNames } from './format.ts'

const p1 = 'p1' as PlayerId
const p2 = 'p2' as PlayerId
const seats = [
  { player: p1, displayName: 'Toby' },
  { player: p2, displayName: null },
] as unknown as readonly SeatStatus[]

const event = (fields: Record<string, unknown>) => ({ seq: 1, ...fields }) as unknown as GameEvent
const nameOf = (id: ObjectId) => `card:${id}`

describe('describeEvent', () => {
  it('says who gained control of a spell', () => {
    expect(
      describeEvent(event({ type: 'spell-control-changed', object: 'o1', controller: p1, previousController: p2 }), nameOf, seats),
    ).toBe('Toby gains control of card:o1')
  })

  it("says a random act in words, in the detailed history only (not as the event's JSON)", () => {
    const acted = event({ type: 'acted-at-random', player: p1, act: 'dice' })
    expect(describeEvent(acted, nameOf, seats)).toBe('Toby rolls dice at random')
    expect(isDetailOnlyEvent(acted)).toBe(true)
  })

  it('says an Attraction opened, a roll to visit, a visit and a claimed prize in words', () => {
    const say = (fields: Record<string, unknown>) => describeEvent(event(fields), nameOf, seats)
    expect(say({ type: 'attraction-opened', player: p1, object: 'o1' })).toBe('Toby opens an Attraction: card:o1')
    expect(say({ type: 'rolled-to-visit', player: p2, result: 4 })).toBe('P2 rolls to visit their Attractions: 4')
    expect(say({ type: 'attraction-visited', player: p1, object: 'o1' })).toBe('card:o1 is visited')
    expect(say({ type: 'prize-claimed', player: p1, object: 'o1' })).toBe('Toby claims the prize of card:o1')
  })

  it('says who a creature-or-player choice went to', () => {
    const chose = (chosen: unknown) =>
      describeEvent(event({ type: 'permanent-or-player-chosen', player: p1, source: 'o1', chosen }), nameOf, seats)
    expect(chose({ kind: 'player', player: p2 })).toBe('Toby chooses P2 for card:o1')
    expect(chose({ kind: 'object', object: 'o2' })).toBe('Toby chooses card:o2 for card:o1')
  })

  it('says what a type change made it, "in addition" only when nothing was replaced', () => {
    const changed = (fields: Record<string, unknown>) =>
      describeEvent(event({ type: 'types-added', object: 'o1', types: [], duration: 'end-of-turn', ...fields }), nameOf, seats)
    expect(changed({ subtypes: ['Swamp'], replaces: true })).toBe('card:o1 becomes Swamp until EOT')
    expect(changed({ subtypes: ['Mutant'] })).toBe('card:o1 becomes Mutant in addition to its other types until EOT')
  })

  it('says what an Equipment or Aura became unattached from, not the raw event', () => {
    expect(describeEvent(event({ type: 'permanent-unattached', object: 'o1', from: 'o2' }), nameOf, seats)).toBe(
      'card:o1 becomes unattached from card:o2',
    )
  })

  it('names players by their display names, not their seat ids', () => {
    expect(describeEvent(event({ type: 'turn-began', turn: 3, activePlayer: p1 }), nameOf, seats)).toBe(
      'Turn 3 — Toby',
    )
    expect(describeEvent(event({ type: 'turn-began', turn: 37, round: 10, activePlayer: p1 }), nameOf, seats)).toBe(
      'Round 10, turn 37 — Toby',
    )
    // A face-down permanent's events never name the card (rule 708.5).
    expect(describeEvent(event({ type: 'card-manifested', player: p1, object: 'o1', kind: 'manifest' }), nameOf, seats)).toBe(
      'Toby manifests the top card of their library',
    )
    expect(describeEvent(event({ type: 'cards-revealed', player: p1, objects: ['o1'], from: 'battlefield' }), nameOf, seats)).toBe(
      'Toby reveals face-down card:o1',
    )
    expect(describeEvent(event({ type: 'life-changed', player: p1, delta: -3, life: 37 }), nameOf, seats)).toBe(
      'Toby -3 life (now 37)',
    )
    // No display name: the seat's own label.
    expect(
      describeEvent(event({ type: 'land-played', player: p2, object: 'o1', from: 'hand' }), nameOf, seats),
    ).toBe('P2 plays card:o1')
  })

  it('names a player defender and a player target as players, not cards', () => {
    expect(
      describeEvent(event({ type: 'attacker-declared', attacker: 'o1', defender: p1 }), nameOf, seats),
    ).toBe('card:o1 attacks Toby')
    expect(
      describeEvent(event({ type: 'attacker-declared', attacker: 'o1', defender: 'o2' }), nameOf, seats),
    ).toBe('card:o1 attacks card:o2')
    expect(
      describeEvent(
        event({ type: 'damage-dealt', source: 'o1', amount: 2, target: { kind: 'player', player: p1 } }),
        nameOf,
        seats,
      ),
    ).toBe('card:o1 deals 2 to Toby')
  })
})

describe('logNameAt', () => {
  const id = 'obj-84' as ObjectId
  const stints = { [id]: [{ from: 5, until: 9, name: 'Grizzly Bears' }] }

  it("names an ability by its source, on the stack and once it has left", () => {
    const ability = 'obj-90' as ObjectId
    const abilities = abilitySourcesOf([
      event({ type: 'ability-activated', seq: 6, source: id, player: p1, onStack: true, ability }),
      event({ type: 'ability-activated', seq: 7, source: id, player: p1, onStack: false }),
    ])
    expect(logNameAt(stints, (o) => o, ability, 7, false, abilities)).toBe("Grizzly Bears's ability")
    expect(logNameAt(stints, (o) => o, ability, 7)).toBe(HIDDEN_CARD)
    // A targeting line names it too.
    const line = describeEvent(
      event({ type: 'object-targeted', seq: 7, object: id, source: ability, by: 'activated' }),
      (o) => logNameAt(stints, (x) => x, o, 7, false, abilities),
      seats,
    )
    expect(line).toBe("Grizzly Bears becomes the target of Grizzly Bears's ability (activated)")
  })

  it('keeps the name a card was publicly known by when the event happened', () => {
    expect(logNameAt(stints, (o) => o, id, 6)).toBe('Grizzly Bears')
  })

  it('calls a card this seat no longer sees and never saw publicly "a card"', () => {
    expect(logNameAt(stints, (o) => o, id, 12)).toBe(HIDDEN_CARD)
    expect(logNameAt({}, (o) => o, id, 6)).toBe(HIDDEN_CARD)
  })

  it('uses what this seat knows it as otherwise', () => {
    expect(logNameAt({}, () => 'Hill Giant', id, 6)).toBe('Hill Giant')
  })

  it("doesn't name a card that was hidden then by what the seat knows it as now", () => {
    // Another player's draw, played since: "draws Swamp" would say what they drew.
    expect(logNameAt({ [id]: [{ from: 20, name: 'Swamp' }] }, () => 'Swamp', id, 6, true)).toBe(HIDDEN_CARD)
    expect(logNameAt(stints, () => 'Grizzly Bears', id, 6, true)).toBe('Grizzly Bears')
  })
})

describe('logName', () => {
  it('calls an object this seat was never shown "a card", not its id', () => {
    const id = 'obj-169' as ObjectId
    expect(logName(id, id)).toBe(HIDDEN_CARD)
    const line = describeEvent(event({ type: 'card-drawn', player: p1, object: id }), (o) => logName(o, o), seats)
    expect(line).toBe('Toby draws a card')
  })

  it('keeps a name it was given', () => {
    expect(logName('obj-169' as ObjectId, 'Sol Ring')).toBe('Sol Ring')
  })
})

describe('withNames', () => {
  it("names a refusal's players and objects as the table shows them", () => {
    expect(withNames('p2 is not being asked to block obj-12', seats, nameOf)).toBe(
      'P2 is not being asked to block card:obj-12',
    )
    expect(withNames('p1 cannot attack', seats, nameOf)).toBe('Toby cannot attack')
  })

  it("names the opponent a clash offers (a bug report, 2026-11-12: it said \"Bob\")", () => {
    expect(withNames('Clash with p1', seats, nameOf)).toBe('Clash with Toby')
  })

  it('leaves a seat id inside another word alone', () => {
    expect(withNames('p10 and xp1', seats, nameOf)).toBe('p10 and xp1')
  })
})

describe('a seat named "You", as a lesson names its player', () => {
  it('reads in the second person', () => {
    expect(forYou('You plays Swamp')).toBe('You play Swamp')
    expect(forYou('You casts Muck Rats')).toBe('You cast Muck Rats')
    expect(forYou('You passes')).toBe('You pass')
    expect(forYou('You has 3 life')).toBe('You have 3 life')
    expect(forYou('You pass')).toBe('You pass')
    expect(possessive('You')).toBe('Your')
  })

  it('leaves anyone else as they were', () => {
    expect(forYou('Rowan plays Mountain')).toBe('Rowan plays Mountain')
    expect(forYou('Younger plays Swamp')).toBe('Younger plays Swamp')
    expect(possessive('Rowan')).toBe("Rowan's")
  })
})

describe('log lines that name where a thing went or came from', () => {
  const o = 'obj-7' as ObjectId
  const src = 'obj-3' as ObjectId
  const names = (id: ObjectId): string => ({ [o]: 'Hill Giant', [src]: 'Tidebinder' })[id as string] ?? 'a card'
  const line = (e: Parameters<typeof event>[0]): string => describeEvent(event(e), names, seats)

  it('words a chosen card by its destination', () => {
    expect(line({ type: 'cards-chosen-from-zone', player: p1, objects: [o] })).toBe('Toby takes Hill Giant')
    expect(line({ type: 'cards-chosen-from-zone', player: p1, objects: [o], to: 'battlefield' })).toBe(
      'Toby puts Hill Giant onto the battlefield',
    )
    expect(line({ type: 'cards-chosen-from-zone', player: p1, objects: [o], to: 'graveyard' })).toBe(
      'Toby puts Hill Giant into a graveyard',
    )
    expect(line({ type: 'cards-chosen-from-zone', player: p1, objects: [o], to: 'exile' })).toBe('Toby exiles Hill Giant')
    // Another player's card bottomed (Memories Returning): nothing taken.
    expect(line({ type: 'cards-chosen-from-zone', player: p1, objects: [o], to: 'library-bottom' })).toBe(
      'Toby puts Hill Giant on the bottom of a library',
    )
    expect(line({ type: 'cards-chosen-from-zone', player: p1, objects: [o, o], to: 'library-top' })).toBe(
      'Toby puts Hill Giant, Hill Giant on top of a library',
    )
    // A split search: the first find one way, the other another (Cultivate).
    expect(line({ type: 'cards-chosen-from-zone', player: p1, objects: [o, o], to: 'battlefield', rest: 'hand' })).toBe(
      'Toby puts Hill Giant onto the battlefield and takes Hill Giant',
    )
    expect(line({ type: 'library-searched', player: p1, owner: p1 })).toBe('Toby searches their library')
    expect(line({ type: 'library-searched', player: p1, owner: p2 })).toBe("Toby searches P2's library")
  })

  it("names a countered or criminal ability by its source, the ability being gone", () => {
    const gone = 'obj-87' as ObjectId
    expect(line({ type: 'spell-countered', object: gone, controller: p1, by: p1, ability: true, source: src })).toBe(
      "Tidebinder's ability is countered",
    )
    expect(line({ type: 'crime-committed', player: p1, object: gone, source: src })).toBe(
      "Toby commits a crime with Tidebinder's ability",
    )
  })

  it('says a lands-only prohibition', () => {
    expect(line({ type: 'prohibition-imposed', players: [p1], spells: false, abilities: false, lands: true })).toBe(
      "Toby can't play lands this turn",
    )
  })

  it("passes a draw's holder to the namer", () => {
    const asked: unknown[] = []
    describeEvent(event({ type: 'card-drawn', player: p1, object: o }), (id, heldBy) => {
      asked.push(heldBy)
      return names(id)
    }, seats)
    expect(asked).toEqual([p1])
  })
})
