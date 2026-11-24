import { REPLAY_PACES } from './useReplayGame.ts'
import type { ReplayControls } from './useReplayGame.ts'
import { openReplay } from './recorder.ts'
import './replay.css'

/**
 * A replay's controls, in a dock over the top of the board: back and on a
 * turn or a move, play and pause, how long to wait between moves, where in
 * the game it is (a slider to drag through it), and the way out. The
 * History's entries jump to their moves too (`GameScreen`'s replay).
 */
export function ReplayBar({ controls }: { readonly controls: ReplayControls }) {
  const { index, count, playing } = controls
  const atStart = index === 0
  const atEnd = index >= count - 1
  return (
    <div className="replay-bar" role="toolbar" aria-label="Replay">
      <span className="replay-title">Replay</span>
      <button type="button" className="replay-icon" title="Back a turn" aria-label="Back a turn" disabled={atStart} onClick={controls.turnBack}>
        ⏮
      </button>
      <button type="button" className="replay-icon" title="Back a move" aria-label="Back a move" disabled={atStart} onClick={controls.stepBack}>
        ◀
      </button>
      <button
        type="button"
        className="replay-icon replay-play"
        title={playing ? 'Pause' : atEnd ? 'Play from the start' : 'Play'}
        aria-label={playing ? 'Pause' : 'Play'}
        onClick={playing ? controls.pause : controls.play}
      >
        {playing ? '⏸' : '▶'}
      </button>
      <button type="button" className="replay-icon" title="On a move" aria-label="On a move" disabled={atEnd} onClick={controls.stepForward}>
        ▶|
      </button>
      <button type="button" className="replay-icon" title="On a turn" aria-label="On a turn" disabled={atEnd} onClick={controls.turnForward}>
        ⏭
      </button>
      <input
        className="replay-scrub"
        type="range"
        min={0}
        max={count - 1}
        value={index}
        aria-label="Where in the game"
        onChange={(e) => {
          controls.pause()
          controls.seek(Number(e.target.value))
        }}
      />
      <span className="replay-where">
        {controls.turn === 0 ? 'Before turn 1' : `Turn ${controls.turn}`}
        <span className="replay-count">
          {' '}
          · {index + 1}/{count}
        </span>
      </span>
      <label className="replay-pace">
        <span>Pace</span>
        <select
          aria-label="Pace"
          value={controls.pace}
          onChange={(e) => {
            const picked = REPLAY_PACES.find((p) => p.pace === e.target.value)
            if (picked) controls.setPace(picked.pace)
          }}
        >
          {REPLAY_PACES.map((p) => (
            <option key={p.pace} value={p.pace}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="replay-exit" onClick={() => openReplay(null)}>
        Exit replay
      </button>
    </div>
  )
}
