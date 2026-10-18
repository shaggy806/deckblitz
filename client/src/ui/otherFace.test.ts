import { describe, expect, it } from 'vitest'
import type { CardDefinition, VisibleObject } from 'engine/client'
import { defToVisible } from './defToVisible.ts'
import { facesToLoad, otherFaceOf, previewLeft } from './otherFace.ts'
import type { FaceLookup } from './otherFace.ts'

const card = (name: string, extra: Partial<Record<keyof CardDefinition, unknown>> = {}): CardDefinition =>
  ({
    name,
    faces: null,
    art: null,
    manaCost: null,
    text: '',
    types: ['creature'],
    supertypes: [],
    subtypes: [],
    power: 2,
    toughness: 2,
    loyalty: null,
    keywords: [],
    toxic: 0,
    colors: [],
    adventure: false,
    omen: false,
    split: false,
    ...extra,
  }) as unknown as CardDefinition

const lookupOf =
  (...defs: CardDefinition[]): FaceLookup =>
  (name) =>
    defs.find((d) => d.name === name) ?? null

// A transforming card and a modal double-faced one, each face its own definition.
const delver = card('Delver of Secrets', { faces: ['Delver of Secrets', 'Insectile Aberration'], transform: true })
const aberration = card('Insectile Aberration', { faces: ['Delver of Secrets', 'Insectile Aberration'], transform: true })
const birgi = card('Birgi, God of Storytelling', {
  faces: ['Birgi, God of Storytelling', 'Harnfel, Horn of Bounty'],
  art: 'https://cards.scryfall.io/normal/front/1/2/12345678-front.jpg',
})
const harnfel = card('Harnfel, Horn of Bounty', {
  faces: ['Birgi, God of Storytelling', 'Harnfel, Horn of Bounty'],
  art: 'https://cards.scryfall.io/normal/back/1/2/12345678-back.jpg',
})
const lookup = lookupOf(delver, aberration, birgi, harnfel)

/** A card in a game showing face `up` of `def`'s faces. */
const showing = (def: CardDefinition, up: number, extra: Partial<VisibleObject> = {}): VisibleObject => {
  const faces = def.faces ?? [def.name]
  const upDef = lookup(faces[up])
  return {
    ...defToVisible(def),
    faceName: faces[up],
    art: upDef?.art ?? null,
    faceIsBack: up > 0,
    ...extra,
  }
}

describe('otherFaceOf', () => {
  it("is the back of a front face that's up, and the front of a back face", () => {
    const back = otherFaceOf(showing(delver, 0), lookup)
    expect(back?.faceName).toBe('Insectile Aberration')
    expect(back?.faceIsBack).toBe(true)
    const front = otherFaceOf(showing(delver, 1), lookup)
    expect(front?.faceName).toBe('Delver of Secrets')
    expect(front?.faceIsBack).toBe(false)
  })

  it("takes the other face's own pinned art, not the up face's", () => {
    // Harnfel's pin is a direct file of the back image: the front shown
    // with it would be the back again.
    expect(otherFaceOf(showing(birgi, 1), lookup)?.art).toBe(birgi.art)
    expect(otherFaceOf(showing(birgi, 0), lookup)?.art).toBe(harnfel.art)
  })

  it("keeps a printing the owner chose, as that card id's other image", () => {
    const id = '0a1b2c3d-0000-4000-8000-000000000000'
    const other = otherFaceOf(showing(birgi, 0, { art: id }), lookup)
    expect(other?.art).toBe(id)
    expect(other?.faceIsBack).toBe(true)
  })

  it('is null for a card whose faces share one printed image', () => {
    const giant = card('Bonecrusher Giant', { faces: ['Bonecrusher Giant', 'Stomp'], adventure: true })
    const stomp = card('Stomp', { faces: ['Bonecrusher Giant', 'Stomp'], adventure: true })
    // The whole card first, then its halves (rule 709.4).
    const faces = ['Fire // Ice', 'Fire', 'Ice']
    const fireIce = card('Fire // Ice', { faces, split: true })
    const more = lookupOf(giant, stomp, fireIce, card('Fire', { faces, split: true }), card('Ice', { faces, split: true }))
    expect(otherFaceOf(defToVisible(giant), more)).toBeNull()
    expect(otherFaceOf(defToVisible(fireIce), more)).toBeNull()
  })

  it('is null for a one-faced card, a copy, and before the faces have loaded', () => {
    expect(otherFaceOf(defToVisible(card('Grizzly Bears')), lookup)).toBeNull()
    expect(otherFaceOf(showing(delver, 0, { copyOf: 'Grizzly Bears' }), lookup)).toBeNull()
    expect(otherFaceOf(showing(delver, 0), () => undefined)).toBeNull()
  })
})

describe('facesToLoad', () => {
  it("asks for a double-faced card's faces, and nothing for anything else", () => {
    expect(facesToLoad(showing(delver, 1))).toEqual(['Delver of Secrets', 'Insectile Aberration'])
    expect(facesToLoad(defToVisible(card('Grizzly Bears')))).toEqual([])
    expect(facesToLoad(null)).toEqual([])
  })
})

describe('previewLeft', () => {
  it('goes right of the pointer when the preview fits there', () => {
    expect(previewLeft(100, 454, 1366, 14)).toBe(114)
  })

  it('flips left of the pointer when it would run past the right edge', () => {
    // A single card fits at x=1100 on a 1366px screen; the pair doesn't.
    expect(previewLeft(1100, 220, 1366, 14)).toBe(1114)
    expect(previewLeft(1100, 454, 1366, 14)).toBe(1100 - 14 - 454)
  })

  it('is pinned at the left edge when neither side has room', () => {
    expect(previewLeft(300, 454, 600, 14)).toBe(14)
  })
})
