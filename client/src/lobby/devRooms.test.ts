import { describe, expect, it } from 'vitest'
import { filterDevRooms } from './devRooms.ts'
import type { DevRoom } from './devRooms.ts'

const room = (code: string, about: string): DevRoom => ({ code, about, players: [], bots: [], step: 'turn 1, upkeep' })

describe('filterDevRooms', () => {
  const rooms = [
    room('LURES', '2p. Bob attacks into a Lure.'),
    room('FOURP', '4p. Four players, everyone with a board.'),
    room('HORDE4', '4p. The horde at four players.'),
  ]

  it('keeps every room for an empty filter', () => {
    expect(filterDevRooms(rooms, '  ')).toEqual(rooms)
  })

  it('matches the code or the description, case aside', () => {
    expect(filterDevRooms(rooms, 'lure').map((r) => r.code)).toEqual(['LURES'])
    expect(filterDevRooms(rooms, 'horde').map((r) => r.code)).toEqual(['HORDE4'])
  })

  it('needs every word to match', () => {
    expect(filterDevRooms(rooms, '4p horde').map((r) => r.code)).toEqual(['HORDE4'])
    expect(filterDevRooms(rooms, '2p horde')).toEqual([])
  })
})
