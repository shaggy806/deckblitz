/**
 * A game as this tab was shown it, kept so it can be watched again: every
 * frame's board and the log, written into the History's "Export log" file
 * after the log's own lines, and read back from that file by the replay
 * viewer (`ReplayScreen`). Nothing is worked out again on the way back — no
 * engine runs — so a replay shows exactly what the player saw, hidden cards
 * hidden, from their seat.
 *
 * A frame is kept as what changed since the one before it (`diffValue`, a
 * patch over the board's JSON), not as a whole board: a four-player board is
 * tens of kilobytes and a game is hundreds of frames, where its changes are
 * a few hundred bytes each. The log is kept once, each frame saying how much
 * of it there was. Read back, the patches are applied in turn
 * (`expandReplay`), each board sharing every part the frame didn't change
 * with the one before it, so a whole game's boards take little more memory
 * than one.
 *
 * Pure but for `encodeReplay`/`decodeReplay`, which use the browser's gzip
 * (`CompressionStream`, in Node too).
 */

import type { GameEvent, PlayerId, PlayerView } from 'engine/client'
import type { SeatStatus } from 'protocol'

/** What the file says it is, and which version of the format. */
export const REPLAY_FORMAT = 'deckblitz-replay'
export const REPLAY_VERSION = 1

/** The line in an exported log after which the replay's data starts. */
export const REPLAY_MARKER = '=== Deck Blitz replay: open this file from Settings, "Watch a replay" ==='

/** A change to one value: `[v]` sets it to `v`, `[]` removes it (an
 * object's key), and an object is a patch of the value's own keys (an
 * array's indices, and `length` when it changed). */
export type PatchEntry = readonly unknown[] | Patch
export interface Patch {
  readonly [key: string]: PatchEntry
}

/** What changes from frame to frame: the board, without its log, and the
 * seats (a concession, a bot taking a seat over). */
export interface Snapshot {
  readonly v: Omit<PlayerView, 'events'>
  readonly s: readonly SeatStatus[]
}

/** One frame as kept: its board as a patch over the one before (the first
 * frame's is over nothing, so it sets the whole board), the log it had, and
 * when it came, in ms after the first. */
export interface FrameRecord {
  readonly d: PatchEntry | null
  /** Events added to the log since the frame before. */
  readonly a?: readonly GameEvent[]
  /** The log, whole, where it isn't the last one grown (the first frame, a
   * take-back's game put in place of the last one, a log sent again). */
  readonly r?: readonly GameEvent[]
  readonly t: number
}

export interface ReplayData {
  readonly format: typeof REPLAY_FORMAT
  readonly version: number
  readonly roomId: string
  /** Which of the room's games (`state.game`). */
  readonly game: number
  /** The seat the game was watched from, and whether as a spectator. */
  readonly seat: PlayerId
  readonly spectating: boolean
  /** When the first frame kept was shown (ISO). */
  readonly recordedAt: string
  /** The page build that kept it: a board from a much older build may draw
   * oddly on a newer one. */
  readonly build: string
  /** The game's art, to load ahead as a live game does. */
  readonly art?: readonly { readonly name: string; readonly art?: string }[]
  readonly frames: readonly FrameRecord[]
}

function isContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === 'object' && value !== null
}

/**
 * What turns `a` into `b`, or `undefined` when they're the same. Objects and
 * arrays are compared key by key, so only what changed is kept; anything
 * else is set whole. A key whose value is `undefined` counts as absent, as
 * JSON has it.
 */
export function diffValue(a: unknown, b: unknown): PatchEntry | undefined {
  if (a === b) return undefined
  if (!isContainer(a) || !isContainer(b) || Array.isArray(a) !== Array.isArray(b)) {
    return b === undefined ? [] : [b]
  }
  const patch: Record<string, PatchEntry> = {}
  let changed = false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      patch.length = [b.length]
      changed = true
    }
    for (let i = 0; i < b.length; i++) {
      const entry = i < a.length ? diffValue(a[i], b[i]) : [b[i]]
      if (entry !== undefined) {
        patch[i] = entry
        changed = true
      }
    }
    return changed ? patch : undefined
  }
  const from = a as Record<string, unknown>
  const to = b as Record<string, unknown>
  for (const key in to) {
    const value = to[key]
    if (value === undefined) continue
    const entry = from[key] === undefined ? [value] : diffValue(from[key], value)
    if (entry !== undefined) {
      patch[key] = entry
      changed = true
    }
  }
  for (const key in from) {
    if (from[key] !== undefined && to[key] === undefined) {
      patch[key] = []
      changed = true
    }
  }
  return changed ? patch : undefined
}

/** `base` with `entry` applied: a new value wherever something changed, and
 * `base`'s own parts, untouched and shared, everywhere else. */
export function applyPatch(base: unknown, entry: PatchEntry | null | undefined): unknown {
  if (entry === undefined || entry === null) return base
  if (Array.isArray(entry)) return entry.length === 0 ? undefined : entry[0]
  const patch = entry as Patch
  if (Array.isArray(base)) {
    const out = base.slice()
    const length = patch.length
    if (Array.isArray(length) && typeof length[0] === 'number') out.length = length[0]
    for (const key in patch) {
      if (key === 'length') continue
      out[Number(key)] = applyPatch(out[Number(key)], patch[key])
    }
    return out
  }
  const out: Record<string, unknown> = isContainer(base) ? { ...(base as Record<string, unknown>) } : {}
  for (const key in patch) {
    const value = applyPatch(out[key], patch[key])
    if (value === undefined) delete out[key]
    else out[key] = value
  }
  return out
}

/** One frame as the room sent it, as much of it as a replay keeps. */
export interface RecordedFrame {
  readonly roomId: string
  readonly game: number
  readonly seat: PlayerId
  readonly spectating: boolean
  readonly view: PlayerView
  readonly seats: readonly SeatStatus[]
  /** A take-back's game put in place of the last one (`Frame.replaced`). */
  readonly replaced: boolean
  readonly art?: readonly { readonly name: string; readonly art?: string }[]
}

/**
 * Keeps the frames of the game this tab is in, one at a time as they come.
 * Another game (a rematch, another room) starts it afresh. Holds the last
 * board to tell the next one's changes by; everything else it keeps is the
 * patches and the log.
 */
export class ReplayRecorder {
  private header: Omit<ReplayData, 'frames'> | null = null
  private frames: FrameRecord[] = []
  private last: Snapshot | null = null
  private logLength = 0
  private lastSeq: number | null = null
  private started = 0
  private readonly build: string
  private readonly now: () => number

  constructor(build: string, now: () => number = () => Date.now()) {
    this.build = build
    this.now = now
  }

  record(frame: RecordedFrame): void {
    const header = this.header
    if (header === null || header.roomId !== frame.roomId || header.game !== frame.game || header.seat !== frame.seat) {
      this.started = this.now()
      this.header = {
        format: REPLAY_FORMAT,
        version: REPLAY_VERSION,
        roomId: frame.roomId,
        game: frame.game,
        seat: frame.seat,
        spectating: frame.spectating,
        recordedAt: new Date(this.started).toISOString(),
        build: this.build,
        ...(frame.art !== undefined ? { art: frame.art } : {}),
      }
      this.frames = []
      this.last = null
      this.logLength = 0
      this.lastSeq = null
    } else if (header.art === undefined && frame.art !== undefined) {
      this.header = { ...header, art: frame.art }
    }
    const { events, ...board } = frame.view
    const snapshot: Snapshot = { v: board, s: frame.seats }
    const d = this.last === null ? [snapshot] : (diffValue(this.last, snapshot) ?? null)
    // The log as the last frame had it, by its length and its last event:
    // never the array itself, which a game in this process (the converter,
    // `scripts/record-to-replay.mjs`) goes on growing in place.
    const had = this.logLength
    const grown =
      !frame.replaced &&
      this.frames.length > 0 &&
      events.length >= had &&
      (had === 0 || events[had - 1]?.seq === this.lastSeq)
    this.frames.push({
      d,
      ...(grown ? (events.length > had ? { a: events.slice(had) } : {}) : { r: events.slice() }),
      t: this.now() - this.started,
    })
    this.last = snapshot
    this.logLength = events.length
    this.lastSeq = events[events.length - 1]?.seq ?? null
  }

  /** The game kept so far, or `null` before its first frame — or when it is
   * another room's than `roomId`. */
  data(roomId?: string | null): ReplayData | null {
    if (this.header === null || this.frames.length === 0) return null
    if (roomId !== undefined && roomId !== null && roomId !== this.header.roomId) return null
    return { ...this.header, frames: this.frames }
  }
}

async function gzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

function toBase64(bytes: Uint8Array): string {
  let out = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    out += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(out)
}

function fromBase64(text: string): Uint8Array {
  const raw = atob(text)
  const bytes = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
  return bytes
}

/** The replay as the text an exported log ends with: the marker line, then
 * the data, gzipped and in base64 in lines of 100. */
export async function encodeReplay(data: ReplayData): Promise<string> {
  const packed = toBase64(await gzip(new TextEncoder().encode(JSON.stringify(data))))
  const lines: string[] = []
  for (let i = 0; i < packed.length; i += 100) lines.push(packed.slice(i, i + 100))
  return `\n${REPLAY_MARKER}\n${lines.join('\n')}\n`
}

/** Why a file isn't a replay that can be watched, in words for the player. */
export class ReplayFileError extends Error {}

/** The replay in an exported log's text. Throws a `ReplayFileError` when
 * there's none, or it can't be read. */
export async function decodeReplay(text: string): Promise<ReplayData> {
  const at = text.indexOf(REPLAY_MARKER)
  if (at < 0) {
    throw new ReplayFileError(
      "That file has no replay in it. A replay is the log a game's History saves with Export log, from a game played since replays were added.",
    )
  }
  const packed = text.slice(at + REPLAY_MARKER.length).replace(/\s+/g, '')
  let data: unknown
  try {
    data = JSON.parse(new TextDecoder().decode(await gunzip(fromBase64(packed))))
  } catch {
    throw new ReplayFileError("That file's replay couldn't be read: it may have been cut short or changed.")
  }
  const replay = data as Partial<ReplayData> | null
  if (replay === null || typeof replay !== 'object' || replay.format !== REPLAY_FORMAT || !Array.isArray(replay.frames)) {
    throw new ReplayFileError("That file's replay couldn't be read.")
  }
  if ((replay.version ?? 0) > REPLAY_VERSION) {
    throw new ReplayFileError('That replay was saved by a newer version of the site. Reload the page and try again.')
  }
  if (replay.frames.length === 0) throw new ReplayFileError('That replay has no moves in it.')
  return replay as ReplayData
}

/** One frame of a replay, ready to show: its board and seats, and where its
 * log is (`logs[log]`, its first `events` events). */
export interface ReplayFrame {
  readonly board: Omit<PlayerView, 'events'>
  readonly seats: readonly SeatStatus[]
  readonly log: number
  readonly events: number
  /** ms after the first frame. */
  readonly t: number
}

export interface ExpandedReplay {
  readonly frames: readonly ReplayFrame[]
  /** Each log the game had: one, unless a take-back or a resend replaced it. */
  readonly logs: readonly (readonly GameEvent[])[]
}

/** Every frame of `data` as a board, each built on the one before. */
export function expandReplay(data: ReplayData): ExpandedReplay {
  const frames: ReplayFrame[] = []
  const logs: GameEvent[][] = []
  let current: Snapshot | null = null
  for (const record of data.frames) {
    current = applyPatch(current, record.d) as Snapshot
    if (record.r !== undefined) logs.push([...record.r])
    else if (logs.length === 0) logs.push([])
    const log = logs[logs.length - 1]!
    if (record.a !== undefined) log.push(...record.a)
    frames.push({ board: current.v, seats: current.s, log: logs.length - 1, events: log.length, t: record.t })
  }
  return { frames, logs }
}

/** Frame `i`'s board with its log, as `PlayerView`. */
export function viewAt(replay: ExpandedReplay, i: number): PlayerView {
  const frame = replay.frames[i]!
  return { ...frame.board, events: replay.logs[frame.log]!.slice(0, frame.events) } as PlayerView
}

/** The first frame whose log has event `seq` in it — where the board shows
 * that event done — or the last frame when none has. */
export function frameOfEvent(replay: ExpandedReplay, seq: number, log: number): number {
  const events = replay.logs[log]
  const at = events === undefined ? -1 : events.findIndex((e) => e.seq === seq)
  if (at >= 0) {
    for (let i = 0; i < replay.frames.length; i++) {
      const frame = replay.frames[i]!
      if (frame.log === log && frame.events > at) return i
    }
  }
  return replay.frames.length - 1
}

/** The events that only move the game along: priority given and passed, a
 * step beginning. A frame that adds nothing else has nothing to show. */
const QUIET_EVENTS: ReadonlySet<GameEvent['type']> = new Set(['priority-received', 'priority-passed', 'step-began'])

/** Per frame, whether it adds nothing but {@link QUIET_EVENTS} to the one
 * before (or nothing at all): the frames a move steps over, so playing on
 * gives no pause to a pass. The first frame, and one whose log was replaced,
 * never are. */
export function quietFrames(replay: ExpandedReplay): readonly boolean[] {
  return replay.frames.map((frame, i) => {
    const prev = replay.frames[i - 1]
    if (prev === undefined || prev.log !== frame.log) return false
    const added = replay.logs[frame.log]!.slice(prev.events, frame.events)
    return added.every((event) => QUIET_EVENTS.has(event.type))
  })
}

/** The first frame of each turn: where "turn back" and "turn on" step to. */
export function turnStarts(replay: ExpandedReplay): readonly number[] {
  const starts: number[] = []
  let turn = -1
  replay.frames.forEach((frame, i) => {
    if (frame.board.turn.number !== turn) {
      turn = frame.board.turn.number
      starts.push(i)
    }
  })
  return starts
}
