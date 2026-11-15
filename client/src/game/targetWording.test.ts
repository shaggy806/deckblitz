import { describe, expect, it } from 'vitest'
import { describeTargetSpec } from 'engine/client'
import { targetLabelFor } from './targetWording.ts'

describe('targetLabelFor', () => {
  it("names the controller's graveyard to the opponent choosing (Mausoleum Turnkey)", () => {
    const label = describeTargetSpec({ kind: 'card-in-graveyard', whose: 'you', filter: { type: 'creature' } })
    expect(label).toContain('your graveyard')
    expect(targetLabelFor(label, 'Alice')).toBe(label.replace('your graveyard', "Alice's graveyard"))
  })

  it('retells what the controller controls, owns and opposes', () => {
    expect(targetLabelFor('creature you control', 'Alice')).toBe('creature Alice controls')
    expect(targetLabelFor("creature you don't control", 'Alice')).toBe("creature Alice doesn't control")
    expect(targetLabelFor('permanent you own', 'Alice')).toBe('permanent Alice owns')
    expect(targetLabelFor('creature an opponent controls', 'Alice')).toBe("creature Alice's opponent controls")
    expect(targetLabelFor("card in an opponent's graveyard", 'Alice')).toBe("card in Alice's opponent's graveyard")
    expect(targetLabelFor('opponent', 'Alice')).toBe('opponent of Alice')
    expect(targetLabelFor('player or opponent', 'Alice')).toBe('player or opponent of Alice')
    expect(targetLabelFor('opponent with more life than you', 'Alice')).toBe('opponent of Alice with more life than Alice')
  })

  it('leaves a label that names nobody alone', () => {
    expect(targetLabelFor('any target', 'Alice')).toBe('any target')
    expect(targetLabelFor('opponent of the active player with more life than them', 'Alice')).toBe(
      'opponent of the active player with more life than them',
    )
  })
})
