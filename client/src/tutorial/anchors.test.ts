import { describe, expect, it } from 'vitest'
import type { ObjectId, PlayerId } from 'engine/client'
import { anchorPlayer, cardIdsNamed, lessonAnchor, objectSelectors, parseLessonAnchor } from './anchors.ts'
import type { AnchorView, QueryRoot } from './anchors.ts'

const ME = 'alice' as PlayerId
const BOB = 'bob' as PlayerId
const CARL = 'carl' as PlayerId

const obj = (id: string, cardName: string, owner: PlayerId, zone: string, controller = owner) => ({
  id,
  cardName,
  faceName: cardName,
  owner,
  controller,
  zone,
})

// alice holds a Forest and Llanowar Elves, with a Forest out and Marwyn in
// the command zone; bob has a Forest out and an Elvish Mystic; carl's
// Llanowar Elves is on the stack.
const VIEW = {
  turnOrder: [ME, BOB, CARL],
  objects: {
    h1: obj('h1', 'Forest', ME, 'hand'),
    h2: obj('h2', 'Llanowar Elves', ME, 'hand'),
    b1: obj('b1', 'Forest', BOB, 'battlefield'),
    b2: obj('b2', 'Forest', ME, 'battlefield'),
    b3: obj('b3', 'Elvish Mystic', BOB, 'battlefield'),
    c1: obj('c1', 'Marwyn, the Nurturer', ME, 'command'),
    s1: obj('s1', 'Llanowar Elves', CARL, 'stack'),
  },
  zones: {
    battlefield: ['b1', 'b2', 'b3'],
    stack: ['s1'],
    command: ['c1'],
    hands: { alice: ['h1', 'h2'], bob: ['x1'], carl: [] },
    graveyards: {},
    exile: [],
    exileOwners: {},
    phasedOut: [],
  },
} as unknown as AnchorView

/** A stand-in for `document`: the selectors it's asked, and an element for
 * the ones it holds. */
function fakeRoot(present: Record<string, string>): QueryRoot & { asked: string[] } {
  const asked: string[] = []
  return {
    asked,
    querySelector(selector: string) {
      asked.push(selector)
      if (selector === 'throw!') throw new Error('bad selector')
      const name = present[selector]
      return name === undefined ? null : ({ name } as unknown as Element)
    },
  }
}

const named = (el: Element | null | undefined): string | null =>
  el === null || el === undefined ? null : (el as unknown as { name: string }).name

describe('a lesson anchor', () => {
  it('reads each kind, and anything else as no anchor', () => {
    expect(parseLessonAnchor('tour:game-pass-turn')).toEqual({ kind: 'tour', name: 'game-pass-turn' })
    expect(parseLessonAnchor('card:Marwyn, the Nurturer')).toEqual({ kind: 'card', name: 'Marwyn, the Nurturer' })
    expect(parseLessonAnchor('player:opponent')).toEqual({ kind: 'player', who: 'opponent' })
    expect(parseLessonAnchor('step:declare-blockers')).toEqual({ kind: 'step', step: 'declare-blockers' })
    // Only the first colon splits: a selector keeps its own.
    expect(parseLessonAnchor('css:.board li:first-child')).toEqual({ kind: 'css', selector: '.board li:first-child' })
    expect(parseLessonAnchor(undefined)).toBeNull()
    expect(parseLessonAnchor('card:')).toBeNull()
    expect(parseLessonAnchor('Forest')).toBeNull()
    expect(parseLessonAnchor('zone:hand')).toBeNull()
    expect(lessonAnchor('zone:hand', () => VIEW, ME)).toBeUndefined()
    expect(lessonAnchor(undefined, () => VIEW, ME)).toBeUndefined()
  })

  it("finds a card's tiles with the viewer's own first: hand, battlefield, command zone, then anyone's", () => {
    expect(cardIdsNamed(VIEW, ME, 'Forest')).toEqual(['h1', 'b2', 'b1'])
    expect(cardIdsNamed(VIEW, ME, 'Llanowar Elves')).toEqual(['h2', 's1'])
    expect(cardIdsNamed(VIEW, ME, 'Marwyn, the Nurturer')).toEqual(['c1'])
    expect(cardIdsNamed(VIEW, BOB, 'Forest')).toEqual(['b1', 'b2'])
    expect(cardIdsNamed(VIEW, null, 'Forest')).toEqual(['b1', 'b2'])
    expect(cardIdsNamed(VIEW, ME, 'Grizzly Bears')).toEqual([])
  })

  it('points at the first tile the page draws, a stacked battlefield tile before a bare one', () => {
    expect(objectSelectors('b2' as ObjectId)).toEqual(['[data-obj-ids~="b2"]', '[data-obj-id="b2"]'])
    // The Forest in hand has left (not drawn): the one on the battlefield,
    // drawn as part of a stacked tile.
    const root = fakeRoot({ '[data-obj-ids~="b2"]': 'my lands' })
    const find = lessonAnchor('card:Forest', () => VIEW, ME, () => root)
    expect(named(find?.())).toBe('my lands')
    expect(root.asked.slice(0, 3)).toEqual(['[data-obj-ids~="h1"]', '[data-obj-id="h1"]', '[data-obj-ids~="b2"]'])
    // In hand: the hand card.
    const inHand = lessonAnchor('card:Forest', () => VIEW, ME, () => fakeRoot({ '[data-obj-id="h1"]': 'hand card' }))
    expect(named(inHand?.())).toBe('hand card')
    // Nothing on the page, or no board yet: nothing to point at.
    expect(lessonAnchor('card:Forest', () => VIEW, ME, () => fakeRoot({}))?.()).toBeNull()
    expect(lessonAnchor('card:Forest', () => null, ME, () => fakeRoot({ '[data-obj-id="h1"]': 'x' }))?.()).toBeNull()
  })

  it('reads the board it is given each time it looks', () => {
    let view: AnchorView | null = null
    const find = lessonAnchor('card:Forest', () => view, ME, () => fakeRoot({ '[data-obj-id="h1"]': 'hand card' }))
    expect(find?.()).toBeNull()
    view = VIEW
    expect(named(find?.())).toBe('hand card')
  })

  it('names players: me, the next opponent in turn order, or a seat', () => {
    expect(anchorPlayer(VIEW, ME, 'me')).toBe(ME)
    expect(anchorPlayer(VIEW, ME, 'opponent')).toBe(BOB)
    expect(anchorPlayer(VIEW, CARL, 'opponent')).toBe(ME)
    expect(anchorPlayer(VIEW, ME, 'carl')).toBe(CARL)
    expect(anchorPlayer(VIEW, ME, 'dave')).toBeNull()
    const root = fakeRoot({ '[data-player-id="bob"]': 'bob panel' })
    expect(named(lessonAnchor('player:opponent', () => VIEW, ME, () => root)?.())).toBe('bob panel')
  })

  it('reaches data-tour names, phase pips and raw selectors, a broken one finding nothing', () => {
    const root = fakeRoot({
      '[data-tour="game-pass-turn"]': 'pass turn',
      '[data-tour="game-phase-track"] [data-step="declare-blockers"]': 'blockers pip',
      '.priority-actions button': 'a button',
    })
    expect(named(lessonAnchor('tour:game-pass-turn', () => VIEW, ME, () => root)?.())).toBe('pass turn')
    expect(named(lessonAnchor('step:declare-blockers', () => VIEW, ME, () => root)?.())).toBe('blockers pip')
    expect(named(lessonAnchor('css:.priority-actions button', () => VIEW, ME, () => root)?.())).toBe('a button')
    expect(lessonAnchor('css:throw!', () => VIEW, ME, () => root)?.()).toBeNull()
  })
})
