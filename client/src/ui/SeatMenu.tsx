import { useEffect, useRef, useState } from 'react'
import type { PlayerView } from 'engine/client'
import { playerLabel } from '../format.ts'
import type { NetworkGame } from '../net/useNetworkGame.ts'

/**
 * The top strip's "Game" menu: what a player can do with this game, in one
 * button (the strip has no room for several) — hand their seat to a bot and
 * take it back, concede, and leave, and once the game is over, reopen its
 * result. It was "Seat", which said little about what was in it (the user,
 * 2026-10-07). The host can restart the game mid-way: the same seats and decks dealt afresh
 * for everyone (`NetworkGame.rematch(true)`), asked once more first, since
 * the game in progress is lost.
 * Conceding asks once more inside the panel rather than through a browser
 * dialog: rule 104.3a lets a player concede at any time, and it can't be
 * undone.
 */
export function SeatMenu({
  game,
  view,
  onShowResult,
}: {
  readonly game: NetworkGame
  readonly view: PlayerView
  /** Opens the end-of-game panel again once it's been put aside to look at
   * the board: the way back to its rematch. */
  readonly onShowResult?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmingRestart, setConfirmingRestart] = useState(false)
  const [confirmingLeave, setConfirmingLeave] = useState(false)
  const [confirmingTakeBack, setConfirmingTakeBack] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  // Closes on a click anywhere else, or Escape, as the animations panel does.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const seat = game.seat
  // A spectator's seat is only whose side is drawn nearest: nothing to play.
  const inGame = !game.spectating && seat !== null && !view.result.over && view.players[seat]?.hasLost === false
  const botPlaying = game.seats.find((s) => s.player === seat)?.isBot === true
  // The opening hands are answered in parallel before the game begins; the
  // server refuses a concession then (`Game.whyCannotConcede`).
  const begun = view.turn.number > 0
  const takeBacks = view.takeBacks
  const takeBacksLeft =
    takeBacks === undefined || seat === null
      ? ''
      : takeBacks.limit === 'unlimited'
        ? 'no limit'
        : `${Math.max(0, takeBacks.limit - (takeBacks.used[seat] ?? 0))} left`

  return (
    <div className="motion-control seat-menu" ref={boxRef}>
      <button
        type="button"
        data-tour="game-menu"
        // Amber while a bot has the seat, as the bots' pause button is when
        // paused; the strip has no room for a longer label.
        className={botPlaying ? 'ts-paused' : undefined}
        title={botPlaying ? 'A bot is playing your seat' : 'This game: a bot for your seat, concede, restart, leave'}
        aria-expanded={open}
        onClick={() => {
          // Opening it never starts on a half-finished concession.
          setConfirming(false)
          setConfirmingRestart(false)
          setConfirmingLeave(false)
          setConfirmingTakeBack(false)
          setOpen((o) => !o)
        }}
      >
        Game
      </button>
      {open ? (
        <div className="motion-panel seat-menu-panel" role="dialog" aria-label="Game">
          {inGame ? (
            <button type="button" onClick={() => game.setBotTakeover(!botPlaying)}>
              {botPlaying ? 'Take back control' : 'Let a bot play for me'}
            </button>
          ) : null}
          {/* The take-back house rule, in a game that allows it: back to the
              start of the turn in progress or one of the few before it, for
              everyone. The button opens the turns to pick from, under it, so
              a take-back is two clicks as a concession is: it can't be
              undone and uses one up. The newest turn first. */}
          {inGame && takeBacks !== undefined ? (
            <>
              <button
                type="button"
                aria-expanded={confirmingTakeBack}
                disabled={takeBacks.cannot !== null}
                title={
                  takeBacks.cannot !== null
                    ? `Can't take anything back: ${takeBacks.cannot}`
                    : 'Put the game back to the start of a turn, for everyone'
                }
                onClick={() => setConfirmingTakeBack((on) => !on)}
              >
                Take back… ({takeBacksLeft})
              </button>
              {confirmingTakeBack && takeBacks.cannot === null ? (
                <div className="seat-menu-takebacks" role="group" aria-label="Go back to the start of">
                  <span>Go back, for everyone, to the start of:</span>
                  {[...takeBacks.turns].reverse().map(({ turn, player }) => (
                    <button
                      key={turn}
                      type="button"
                      className="seat-menu-danger"
                      onClick={() => {
                        game.takeBack(turn)
                        setOpen(false)
                      }}
                    >
                      {turn === view.turn.number
                        ? 'This turn'
                        : player === seat
                          ? `My turn ${turn}`
                          : `${playerLabel(player, game.seats)}'s turn ${turn}`}
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
          {/* Each confirm shares a cell with the button that asks it (the
              hidden one keeping its room), so asking doesn't widen the
              right-anchored panel (the jitter sweep, 2026-10-10). */}
          {inGame && begun ? (
            <div className="seat-menu-slot">
              <div className={`seat-menu-confirm${confirming ? '' : ' slot-hidden'}`} aria-hidden={!confirming}>
                <span>Concede the game?</span>
                {/* Cancel first, the answer that does it last: the side every
                    other dialog's confirming button is on. */}
                <button type="button" onClick={() => setConfirming(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="seat-menu-danger"
                  onClick={() => {
                    game.concede()
                    setOpen(false)
                  }}
                >
                  Concede
                </button>
              </div>
              <button
                type="button"
                className={confirming ? 'slot-hidden' : undefined}
                aria-hidden={confirming}
                onClick={() => setConfirming(true)}
              >
                Concede…
              </button>
            </div>
          ) : null}
          {game.blitzDeck !== null ? (
            <button
              type="button"
              disabled={game.blitzDeckSaved}
              title="Keep this deck in your decks, to edit in the deck builder or play again"
              onClick={game.saveBlitzDeck}
            >
              {game.blitzDeckSaved ? 'Deck saved ✓' : 'Save deck'}
            </button>
          ) : null}
          {game.isHost && game.canRematch && !view.result.over ? (
            <div className="seat-menu-slot">
              <div className={`seat-menu-confirm${confirmingRestart ? '' : ' slot-hidden'}`} aria-hidden={!confirmingRestart}>
                <span>Restart for everyone?</span>
                <button type="button" onClick={() => setConfirmingRestart(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="seat-menu-danger"
                  onClick={() => {
                    game.rematch(true)
                    setOpen(false)
                  }}
                >
                  Restart
                </button>
              </div>
              <button
                type="button"
                className={confirmingRestart ? 'slot-hidden' : undefined}
                aria-hidden={confirmingRestart}
                onClick={() => setConfirmingRestart(true)}
              >
                Restart game…
              </button>
            </div>
          ) : null}
          {onShowResult !== undefined ? (
            <button
              type="button"
              onClick={() => {
                onShowResult()
                setOpen(false)
              }}
            >
              Game result
            </button>
          ) : null}
          {/* Leaving a game being played asks first, as conceding and
              restarting do: it was the one item here a stray click acted on
              (the site check, 2026-11-11). Watching, or once the game is
              over, there's nothing to lose and it just goes. */}
          {inGame ? (
            <div className="seat-menu-slot">
              <div className={`seat-menu-confirm${confirmingLeave ? '' : ' slot-hidden'}`} aria-hidden={!confirmingLeave}>
                <span>Leave this game?</span>
                <button type="button" onClick={() => setConfirmingLeave(false)}>
                  Cancel
                </button>
                <button type="button" className="seat-menu-danger" onClick={() => window.location.assign('/')}>
                  Leave
                </button>
              </div>
              <button
                type="button"
                className={confirmingLeave ? 'slot-hidden' : undefined}
                aria-hidden={confirmingLeave}
                onClick={() => setConfirmingLeave(true)}
              >
                Leave the room…
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => window.location.assign('/')}>
              Leave the room
            </button>
          )}
          {/* The Fan Content Policy notice and credits, in a tab of its own
              so the game isn't left. */}
          <a className="seat-menu-link" href="/about" target="_blank" rel="noreferrer">
            About &amp; legal
          </a>
        </div>
      ) : null}
    </div>
  )
}
