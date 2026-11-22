import { useEffect, useState } from 'react'
import type { PlayerId } from 'engine/client'
import type { RoomSettings, SeatStatus } from 'protocol'
import type { NetworkGame } from '../net/useNetworkGame.ts'
import { BOT_SPEEDS } from '../ui/botSpeeds.ts'
import { BOT_DECK_POOLS, randomBotDecks } from './randomBotDeck.ts'

/** The range the server accepts (`PendingRoom.setSettings`). */
const LIFE_MIN = 1
const LIFE_MAX = 999
/** One click to the totals people actually play: Commander's 40 (rule
 * 903.7), 30 for a shorter game, and the 20 of a duel. */
const LIFE_PRESETS = [20, 30, 40] as const

/**
 * The waiting room's game settings — starting life, who goes first, how fast
 * the bots play — under the seats. The host's to change; everyone else sees
 * what the game will be, as plain text, since the server would refuse their
 * change anyway.
 *
 * The host's last row is not a setting but a shortcut: "Fill with bots", one
 * button per strength of deck, which makes the table a full four with a bot
 * of that strength in every seat nobody holds (the user's ask, 2026-11-17:
 * a seat's own "+ Bot" buttons took an "Add player" and a bot's click for
 * each of three opponents). `botSeats` is how many bots that would seat — the
 * buttons are there but off at none, so the box keeps its height.
 */
export function RoomSettingsPanel({
  game,
  seatLabel,
  botSeats,
}: {
  readonly game: NetworkGame
  readonly seatLabel: (seat: SeatStatus) => string
  readonly botSeats: number
}) {
  const settings = game.roomSettings
  if (settings === null) return null
  const host = game.isHost
  const firstLabel =
    settings.firstPlayer === 'random'
      ? 'Random (highroll)'
      : (() => {
          const seat = game.seats.find((s) => s.player === settings.firstPlayer)
          return seat === undefined ? 'Random (highroll)' : seatLabel(seat)
        })()
  const speedLabel = BOT_SPEEDS.find((s) => s.speed === game.botSpeed)?.label ?? game.botSpeed

  return (
    <section
      className={`room-settings${game.lobbyBusy === 'settings' ? ' pending' : ''}`}
      aria-label="Room settings"
      data-tour="lobby-settings"
    >
      <h3 className="room-settings-title">Room settings</h3>
      <div className="room-settings-fields">
        <div className="rs-field">
          <span className="rs-label" id="rs-life">
            Starting life
          </span>
          {host ? (
            <LifeControl life={settings.startingLife} onChange={(startingLife) => game.setRoomSettings({ startingLife })} />
          ) : (
            <span className="rs-value mono">{settings.startingLife}</span>
          )}
        </div>

        <div className="rs-field">
          <label className="rs-label" htmlFor="rs-first">
            First player
          </label>
          {host ? (
            <select
              id="rs-first"
              className="rs-select"
              value={settings.firstPlayer}
              onChange={(e) =>
                game.setRoomSettings({ firstPlayer: e.target.value as RoomSettings['firstPlayer'] })
              }
            >
              <option value="random">Random (highroll)</option>
              {game.seats.map((s) => (
                <option key={s.player} value={s.player as PlayerId}>
                  {seatLabel(s)}
                </option>
              ))}
            </select>
          ) : (
            <span className="rs-value">{firstLabel}</span>
          )}
        </div>

        {/* Commander's deck rules (rule 903.5 — 100 cards, singleton, the
            commanders' colour identity), or any deck at all. */}
        <div className="rs-field">
          <span className="rs-label">Decks</span>
          {host ? (
            <div className="rs-options" role="group" aria-label="Decks">
              {([
                [false, 'Any deck'],
                [true, 'Commander-legal'],
              ] as const).map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  className={`seg-option${settings.commanderLegalOnly === value ? ' active' : ''}`}
                  aria-pressed={settings.commanderLegalOnly === value}
                  onClick={() => game.setRoomSettings({ commanderLegalOnly: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <span className="rs-value">{settings.commanderLegalOnly ? 'Commander-legal only' : 'Any deck'}</span>
          )}
        </div>

        <div className="rs-field">
          <label className="rs-label" htmlFor="rs-bot-speed">
            Bot speed
          </label>
          {host ? (
            <select
              id="rs-bot-speed"
              className="rs-select"
              value={game.botSpeed}
              onChange={(e) => {
                const picked = BOT_SPEEDS.find((s) => s.speed === e.target.value)
                if (picked) game.setBotSpeed(picked.speed)
              }}
            >
              {BOT_SPEEDS.map((s) => (
                <option key={s.speed} value={s.speed}>
                  {s.label}
                </option>
              ))}
            </select>
          ) : (
            <span className="rs-value">{speedLabel}</span>
          )}
        </div>

        {host ? (
          <div className="rs-field">
            <span className="rs-label">Fill with bots</span>
            <div className="rs-options" role="group" aria-label="Fill with bots">
              {BOT_DECK_POOLS.map(({ pool, label, fillHint }) => (
                <button
                  key={pool}
                  type="button"
                  className={`seg-option${game.lobbyBusy === `fill-bots:${pool}` ? ' pending' : ''}`}
                  title={botSeats === 0 ? 'Every seat is taken' : fillHint}
                  aria-label={`Fill with ${label.toLowerCase()} bots`}
                  disabled={botSeats === 0}
                  onClick={() => {
                    // A different deck for each, and none already at the table.
                    const taken = game.seats.flatMap((s) => (s.deck === null ? [] : [s.deck.name]))
                    game.fillBots(randomBotDecks(botSeats, taken, Math.random, pool), pool)
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** What the host may set take-backs to: off, a few counts, or no limit. */
const TAKE_BACK_OPTIONS: readonly (readonly [RoomSettings['takeBacks'], string])[] = [
  [0, 'Off'],
  [1, '1'],
  [2, '2'],
  [3, '3'],
  [5, '5'],
  // The side column has no room for the words beside five counts.
  ['unlimited', '∞'],
]

/**
 * The waiting room's house rules: ways this table plays that aren't the
 * game's own rules, off unless the host turns them on. Under the room
 * settings, and shown to everyone the same way those are. The first is
 * take-backs (the user, 2026-11-21): how many times a game each player may
 * put it back to the start of the turn in progress.
 */
export function HouseRulesPanel({ game }: { readonly game: NetworkGame }) {
  const settings = game.roomSettings
  if (settings === null) return null
  const takeBacks = settings.takeBacks ?? 0
  const label =
    takeBacks === 0 ? 'Off' : takeBacks === 'unlimited' ? 'No limit' : `${takeBacks} per player`
  return (
    <section
      className={`room-settings house-rules${game.lobbyBusy === 'settings' ? ' pending' : ''}`}
      aria-label="House rules"
    >
      <h3 className="room-settings-title">House rules</h3>
      <div className="room-settings-fields">
        <div className="rs-field">
          <span
            className="rs-label"
            title="Each player may put the game back to the start of the turn in progress this many times a game. Everything since is undone for everyone, and the same cards are drawn again."
          >
            Take-backs
          </span>
          {game.isHost ? (
            <div className="rs-options" role="group" aria-label="Take-backs per player">
              {TAKE_BACK_OPTIONS.map(([value, text]) => (
                <button
                  key={text}
                  type="button"
                  className={`seg-option${takeBacks === value ? ' active' : ''}`}
                  aria-pressed={takeBacks === value}
                  aria-label={value === 'unlimited' ? 'No limit' : value === 0 ? 'Off' : `${value} per player`}
                  title={value === 'unlimited' ? 'No limit' : undefined}
                  onClick={() => game.setRoomSettings({ takeBacks: value })}
                >
                  {text}
                </button>
              ))}
            </div>
          ) : (
            <span className="rs-value">{label}</span>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * The starting life, as presets and a box for any other total. The box keeps
 * its own draft while it's being typed in and sends on Enter or leaving it,
 * so "40" isn't sent as a "4" first; anything out of range or not a whole
 * number goes back to the room's value rather than to the server.
 */
function LifeControl({ life, onChange }: { readonly life: number; readonly onChange: (life: number) => void }) {
  // The box is for a total no preset has: beside a lit preset it stays empty
  // ("other"), so the same number isn't shown twice, as two controls.
  const shown = (LIFE_PRESETS as readonly number[]).includes(life) ? '' : String(life)
  const [draft, setDraft] = useState(shown)
  // Follow the room's value when it changes from elsewhere (a preset, or a
  // stand-in host).
  useEffect(() => setDraft(shown), [shown])

  const commit = () => {
    const value = Number(draft)
    if (draft.trim() !== '' && Number.isInteger(value) && value >= LIFE_MIN && value <= LIFE_MAX) {
      if (value !== life) onChange(value)
      else setDraft(shown)
    } else {
      setDraft(shown)
    }
  }

  return (
    <div className="rs-options" role="group" aria-labelledby="rs-life">
      {LIFE_PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          className={`seg-option${preset === life ? ' active' : ''}`}
          aria-pressed={preset === life}
          onClick={() => onChange(preset)}
        >
          {preset}
        </button>
      ))}
      <input
        type="number"
        className="rs-life-input mono"
        aria-label="Another starting life total"
        placeholder="other"
        min={LIFE_MIN}
        max={LIFE_MAX}
        step={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setDraft(shown)
        }}
      />
    </div>
  )
}
