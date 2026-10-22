import { useEffect, useRef, useState } from 'react'
import type { PlayerId } from 'engine/client'
import type { ScenarioSpec } from 'protocol'
import type { NetworkGame } from '../net/useNetworkGame.ts'
import { seatClassOf } from '../format.ts'
import { waitingOn } from './useFollowAction.ts'

/**
 * Acting for more than one seat in the scenario builder (the user,
 * 2026-10-22: tests where the opponent has to act were hard to follow).
 *
 * - **The seat strip**, at the top of the builder: who you're playing as, in
 *   that seat's colour, and a button per seat you can take — the seat the
 *   game is waiting on lit up ("Bob must act").
 * - **Follow the action** (on by default, kept in this browser): while
 *   playing, whenever another seat that isn't a bot must act, you're moved to
 *   it — so a test never stalls on a seat nobody is sitting at.
 * - **The switch flash**: every change of seat shows "You are now Bob" over
 *   the table in the seat's colour. (The table was framed in that colour too
 *   while you were away from your own seat; too much, the user, 2026-10-22 —
 *   the board says whose turn to act it is on the player's name instead.)
 */

const FLASH_MS = 1400

const label = (player: string): string => player.charAt(0).toUpperCase() + player.slice(1)

/** The seats you may act for: not a bot. */
function humanSeats(spec: ScenarioSpec): readonly PlayerId[] {
  return spec.seats.filter((s) => !s.bot).map((s) => s.player)
}

/** The follow mode and the flash; mounted whether the drawer is open or not. */
export function SeatFollow({
  game,
  spec,
  building,
  follow,
  holdFor,
  onRelease,
}: {
  readonly game: NetworkGame
  readonly spec: ScenarioSpec
  readonly building: boolean
  readonly follow: boolean
  /** A seat switched to by hand while this seat was due: following waits
   * until the game is waiting on someone else. */
  readonly holdFor: PlayerId | null
  readonly onRelease: () => void
}) {
  const seat = game.seat
  const due = waitingOn(game.view)
  const asked = useRef<PlayerId | null>(null)
  useEffect(() => {
    if (holdFor !== null && due !== holdFor) onRelease()
  }, [holdFor, due, onRelease])
  useEffect(() => {
    if (holdFor !== null && due === holdFor) return
    if (building || !follow || due === null || seat === null || due === seat) {
      asked.current = null
      return
    }
    if (!humanSeats(spec).includes(due) || asked.current === due) return
    asked.current = due
    game.builderSeat(due)
  }, [building, follow, due, seat, spec, game, holdFor])

  // The flash: on every change of seat after the first.
  const [flash, setFlash] = useState<{ readonly player: PlayerId; readonly n: number } | null>(null)
  const [lastSeat, setLastSeat] = useState(seat)
  if (seat !== lastSeat) {
    setLastSeat(seat)
    if (seat !== null && lastSeat !== null) setFlash((f) => ({ player: seat, n: (f?.n ?? 0) + 1 }))
  }
  useEffect(() => {
    if (flash === null) return
    const t = window.setTimeout(() => setFlash(null), FLASH_MS)
    return () => window.clearTimeout(t)
  }, [flash])

  const turnOrder = game.view?.turnOrder ?? spec.seats.map((s) => s.player)
  return (
    <>
      {flash !== null ? (
        <div key={flash.n} className={`seat-switch-flash ${seatClassOf(turnOrder, flash.player)}`} role="status">
          You are now <b>{label(flash.player)}</b>
        </div>
      ) : null}
    </>
  )
}

/** The strip at the top of the builder drawer. */
export function SeatStrip({
  game,
  spec,
  building,
  follow,
  onFollow,
  onSwitch,
}: {
  readonly game: NetworkGame
  readonly spec: ScenarioSpec
  readonly building: boolean
  readonly follow: boolean
  readonly onFollow: (on: boolean) => void
  /** A switch by hand, with the seat then due — so following doesn't undo it. */
  readonly onSwitch: (due: PlayerId | null) => void
}) {
  const seat = game.seat
  const due = building ? null : waitingOn(game.view)
  const turnOrder = game.view?.turnOrder ?? spec.seats.map((s) => s.player)
  const seats = humanSeats(spec)
  return (
    <div className="bp-seatstrip">
      <span className={`bp-seat-now ${seat !== null ? seatClassOf(turnOrder, seat) : ''}`}>
        Playing as <b>{seat !== null ? label(seat) : '—'}</b>
      </span>
      {seats.length > 1 ? (
        <span className="bp-seat-buttons">
          {seats
            .filter((p) => p !== seat)
            .map((p) => (
              <button
                key={p}
                type="button"
                className={`bp-seat-go ${seatClassOf(turnOrder, p)}${p === due ? ' due' : ''}`}
                title={p === due ? `${label(p)} must act` : `Act for ${label(p)}`}
                onClick={() => {
                  onSwitch(due)
                  game.builderSeat(p)
                }}
              >
                {p === due ? `${label(p)} must act — switch` : `Switch to ${label(p)}`}
              </button>
            ))}
        </span>
      ) : null}
      {seats.length > 1 ? (
        <label className="bp-seat-follow" title="While playing, move to whichever of your seats must act">
          <input type="checkbox" checked={follow} onChange={(e) => onFollow(e.target.checked)} /> Follow the action
        </label>
      ) : null}
    </div>
  )
}
