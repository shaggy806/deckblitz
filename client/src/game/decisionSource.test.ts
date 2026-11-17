import { describe, expect, it } from 'vitest'
import type { ObjectId, PlayerView } from 'engine/client'
import { decisionGhostOf, stackShowsSomething } from './decisionSource.ts'

const ob = 'obj-80' as ObjectId
const gladehart = 'obj-91' as ObjectId
// Ob Nixilis's landfall "you may" is being asked: its trigger has left the
// stack, and a Grazing Gladehart trigger waits under it.
const view = {
  decisionSource: { object: ob, cardName: 'Ob Nixilis, the Fallen' },
  zones: { stack: [gladehart] },
  objects: { [ob]: { cardName: 'Ob Nixilis, the Fallen' }, [gladehart]: { kind: 'ability' } },
} as unknown as PlayerView

describe('decisionGhostOf', () => {
  it('draws the card behind the decision being asked', () => {
    expect(decisionGhostOf(view)).toBe(ob)
  })

  it("draws nothing over the card's own ability resolving on top of the stack", () => {
    // Killer's Mask's trigger asks as it resolves: the trigger is still on
    // top, drawn as Killer's Mask, so the permanent isn't drawn above it again.
    const mask = 'obj-29' as ObjectId
    const trigger = 'obj-300' as ObjectId
    const resolving = {
      decisionSource: { object: mask, cardName: "Killer's Mask" },
      zones: { stack: [gladehart, trigger] },
      objects: {
        [mask]: { cardName: "Killer's Mask" },
        [trigger]: { kind: 'ability', sourceObjectId: mask },
        [gladehart]: { kind: 'ability', sourceObjectId: null },
      },
    } as unknown as PlayerView
    expect(decisionGhostOf(resolving)).toBeNull()
    // The same card's ability further down doesn't hide it: that one isn't
    // what's asking.
    const under = { ...resolving, zones: { stack: [trigger, gladehart] } } as unknown as PlayerView
    expect(decisionGhostOf(under)).toBe(mask)
  })

  it("draws the card over an earlier one of its own triggers while another is put on the stack", () => {
    // Panharmonicon's second Ravenous Chupacabra trigger asks for its target
    // with the first already on the stack and aimed: that entry isn't what's
    // asking, so the card is drawn above it (the check of 2026-11-16).
    const chupacabra = 'obj-12' as ObjectId
    const first = 'obj-301' as ObjectId
    const placing = {
      decisionSource: { object: chupacabra, cardName: 'Ravenous Chupacabra' },
      awaiting: { kind: 'choose-targets', source: chupacabra },
      zones: { stack: [first] },
      objects: {
        [chupacabra]: { cardName: 'Ravenous Chupacabra' },
        [first]: { kind: 'ability', sourceObjectId: chupacabra },
      },
    } as unknown as PlayerView
    expect(decisionGhostOf(placing)).toBe(chupacabra)
    // Its modes announced as it goes on the stack, likewise; modes chosen as
    // an ability resolves are that ability's on top asking.
    const modes = { ...placing, awaiting: { kind: 'choose-modes', source: chupacabra, announcing: true } } as unknown as PlayerView
    expect(decisionGhostOf(modes)).toBe(chupacabra)
    const resolving = { ...placing, awaiting: { kind: 'choose-modes', source: chupacabra } } as unknown as PlayerView
    expect(decisionGhostOf(resolving)).toBeNull()
  })

  it('draws nothing once a later frame is playing over the board', () => {
    // A bug report (2026-10-05): the "prompted by" card stayed on top while
    // the next frame's abilities resolved and left the stack under it.
    expect(decisionGhostOf(view, true)).toBeNull()
    expect(stackShowsSomething(view, true)).toBe(true)
    expect(stackShowsSomething({ ...view, zones: { stack: [] } } as unknown as PlayerView, true)).toBe(false)
  })
})
