/**
 * A replay played out as a game: its frames handed one at a time to the same
 * game screen a live game draws (`GameScreen`), through a `NetworkGame` with
 * nothing to send. The screen plays each frame's animations and acks it as
 * it would a room's; the ack is what moves the replay on, after the pause the
 * player picked. A jump (a History entry, a turn, the slider) shows its frame
 * as it stands, with nothing animated (`Frame.replaced`).
 *
 * Nothing is worked out here but which frame is next: every board is the one
 * the player was shown (`replayFile.ts`).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { seatingOf } from 'engine/client'
import type { ObjectId, PlayerView } from 'engine/client'
import type { Frame } from '../game/usePlayback.ts'
import type { NetworkGame } from '../net/useNetworkGame.ts'
import { nameInView } from '../net/useNetworkGame.ts'
import { notePrintings } from '../game/seenPrintings.ts'
import { prefetchArt } from '../ui/art.ts'
import { expandReplay, frameOfEvent, turnStarts, viewAt } from './replayFile.ts'
import type { ExpandedReplay, ReplayData } from './replayFile.ts'

/** How long the replay waits between moves, once a move's animations are
 * over. `instant` shows each board as it stands, nothing animated. */
export const REPLAY_PACES = [
  { pace: 'slow', label: 'Slow', gapMs: 1500 },
  { pace: 'normal', label: 'Normal', gapMs: 600 },
  { pace: 'fast', label: 'Fast', gapMs: 150 },
  { pace: 'instant', label: 'Skim', gapMs: 60 },
] as const satisfies readonly { readonly pace: string; readonly label: string; readonly gapMs: number }[]
export type ReplayPace = (typeof REPLAY_PACES)[number]['pace']

/** What the replay bar shows and does. */
export interface ReplayControls {
  readonly data: ReplayData
  readonly replay: ExpandedReplay
  /** The frame on screen, or on its way there. */
  readonly index: number
  readonly count: number
  readonly playing: boolean
  readonly pace: ReplayPace
  /** The whole game's log, as the frame on screen's has it, and the last
   * event that frame shows (-1 before any). */
  readonly log: PlayerView['events']
  readonly upTo: number
  readonly turn: number
  play: () => void
  pause: () => void
  setPace: (pace: ReplayPace) => void
  /** One move on, animated, or one back, shown as it stands. */
  stepForward: () => void
  stepBack: () => void
  /** To the start of the turn before (or of this one, when well into it),
   * or of the next. */
  turnBack: () => void
  turnForward: () => void
  /** To frame `i`, shown as it stands. */
  seek: (i: number) => void
  /** To where the log's event `seq` has just happened. */
  seekEvent: (seq: number) => void
}

const noop = (): void => {}

export function useReplayGame(data: ReplayData): { readonly game: NetworkGame; readonly controls: ReplayControls } {
  const replay = useMemo(() => expandReplay(data), [data])
  const starts = useMemo(() => turnStarts(replay), [replay])
  const last = replay.frames.length - 1

  // The game's cards: their art loaded ahead, and each one's printing noted
  // for the History's previews, as a live game's frames do.
  useEffect(() => {
    if (data.art) prefetchArt(data.art)
    const key = `replay:${data.roomId}:${data.game}:${data.recordedAt}`
    for (const frame of replay.frames) notePrintings(key, frame.board.objects)
  }, [data, replay])

  /** Every frame handed to the screen is numbered afresh, a jump back too:
   * playback takes a frame only after the last it was given. The first is 1. */
  const seqRef = useRef(1)
  const makeFrame = useCallback(
    (i: number, animate: boolean): Frame => ({
      seq: ++seqRef.current,
      view: viewAt(replay, i),
      actions: [],
      ...(animate ? {} : { replaced: true as const }),
    }),
    [replay],
  )
  const [index, setIndex] = useState(0)
  const [frame, setFrame] = useState<Frame>(() => ({ seq: 1, view: viewAt(replay, 0), actions: [], replaced: true }))
  const [playRequested, setPlaying] = useState(false)
  const [pace, setPace] = useState<ReplayPace>('normal')
  /** The newest frame the screen has finished showing. */
  const [shownSeq, setShownSeq] = useState(0)

  const goTo = useCallback(
    (i: number, animate: boolean) => {
      const to = Math.max(0, Math.min(last, i))
      setIndex(to)
      setFrame(makeFrame(to, animate))
    },
    [last, makeFrame],
  )

  // Playing: once the frame on screen is shown, the next after the pace's
  // pause. At the end it stops by itself.
  const playing = playRequested && !(index >= last && shownSeq === frame.seq)
  useEffect(() => {
    if (!playing || shownSeq !== frame.seq || index >= last) return
    const gap = REPLAY_PACES.find((p) => p.pace === pace)?.gapMs ?? 600
    const timer = window.setTimeout(() => goTo(index + 1, pace !== 'instant'), gap)
    return () => window.clearTimeout(timer)
  }, [playing, shownSeq, frame.seq, index, last, pace, goTo])

  const turnOf = (i: number): number => {
    let at = 0
    for (let k = 0; k < starts.length && starts[k]! <= i; k++) at = k
    return at
  }

  const view = frame.view
  const seat = data.seat
  const opponents = useMemo(() => {
    const order = seatingOf(view)
    const i = order.indexOf(seat)
    return i < 0 ? order.filter((p) => p !== seat) : [...order.slice(i + 1), ...order.slice(0, i)]
  }, [view, seat])
  const seats = replay.frames[index]!.seats
  const nameOf = useCallback((id: ObjectId) => nameInView(view, id), [view])
  const ackFrame = useCallback((seq: number) => setShownSeq((cur) => Math.max(cur, seq)), [])

  const game = useMemo<NetworkGame>(
    () => ({
      status: 'playing',
      everConnected: true,
      linkDown: false,
      error: null,
      errorSeq: 0,
      notice: null,
      roomId: data.roomId,
      seats,
      seat,
      opponents,
      frame,
      view,
      actions: [],
      autoPassing: false,
      autoPassPaused: false,
      isHost: false,
      botSpeed: 'normal',
      setBotSpeed: noop,
      roomSettings: null,
      setRoomSettings: noop,
      firstPlayerChosen: false,
      stopped: null,
      botsPaused: false,
      setBotsPaused: noop,
      stepBots: noop,
      revision: frame.seq,
      ackFrame,
      createRoom: noop,
      blitz: noop,
      blitzing: false,
      blitzReport: null,
      dismissBlitzReport: noop,
      blitzDeck: null,
      blitzDeckSaved: false,
      saveBlitzDeck: noop,
      blitzRoom: false,
      gameNumber: data.game,
      canRematch: false,
      rematch: noop,
      restarted: false,
      dismissRestarted: noop,
      joinRoom: noop,
      leaveRoom: noop,
      claimSeat: noop,
      takeSeat: noop,
      roomPending: false,
      // Watching: nothing of the seat's own to do — no passing, no concession,
      // no Game menu of a player's — though the board is that seat's.
      spectating: true,
      spectate: noop,
      concede: noop,
      takeBack: noop,
      setBotTakeover: noop,
      sendPassSettings: noop,
      addBot: noop,
      fillBots: noop,
      addSeat: noop,
      removeSeat: noop,
      setBotDeck: noop,
      setReady: noop,
      startGame: noop,
      lobbyBusy: null,
      dispatch: noop,
      passTurn: noop,
      autoPass: noop,
      resolveAll: noop,
      captureEnabled: false,
      capture: { entries: null, options: null, saved: null },
      captureList: noop,
      captureOptions: noop,
      captureSave: noop,
      captureReport: noop,
      clearCapture: noop,
      builder: null,
      createBuilder: noop,
      builderUpdate: noop,
      builderStart: noop,
      builderStop: noop,
      builderSeat: noop,
      tutorial: null,
      createTutorial: noop,
      tutorialStarting: false,
      tutorialNext: noop,
      tutorialRetry: noop,
      nameOf,
      clearError: noop,
      clearNotice: noop,
      reconnect: noop,
    }),
    [data, seats, seat, opponents, frame, view, ackFrame, nameOf],
  )

  const current = replay.frames[index]!
  const log = replay.logs[current.log]!
  const upTo = current.events > 0 ? log[current.events - 1]!.seq : -1
  // A jump keeps playing a replay that is playing, and leaves one that has
  // played to its end stopped.
  const jump = (i: number): void => {
    setPlaying(playing)
    goTo(i, false)
  }
  const controls: ReplayControls = {
    data,
    replay,
    index,
    count: replay.frames.length,
    playing,
    pace,
    log,
    upTo,
    turn: current.board.turn.number,
    play: () => {
      if (index >= last) goTo(0, false)
      setPlaying(true)
    },
    pause: () => setPlaying(false),
    setPace,
    stepForward: () => {
      setPlaying(false)
      if (index < last) goTo(index + 1, true)
    },
    stepBack: () => {
      setPlaying(false)
      goTo(index - 1, false)
    },
    turnBack: () => {
      const t = turnOf(index)
      // Well into a turn, back to its start; at its start, the one before.
      const to = index - starts[t]! > 1 || t === 0 ? starts[t]! : starts[t - 1]!
      jump(to)
    },
    turnForward: () => {
      const t = turnOf(index)
      jump(t + 1 < starts.length ? starts[t + 1]! : last)
    },
    seek: jump,
    seekEvent: (seq: number) => jump(frameOfEvent(replay, seq, current.log)),
  }
  return { game, controls }
}
