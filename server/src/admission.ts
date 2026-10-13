/**
 * Where a new room goes, and whether it may open at all
 * (`docs/plans/room-shards.md`, "Placement and admission"). Pure: both hosts
 * (`worker-host.ts` over N shards, `in-process-host.ts` as one) hand it what
 * they know — the rooms they route, and each shard's state and last load —
 * and act on the answer. Main-side: no engine.
 *
 * Only a create is ever refused. A lobby already counts as the game it will
 * become, so joining, starting, a rematch and a tutorial's next step never
 * meet a limit.
 */

import type { RoomKind, RoomStage } from "./room-host.js";

export type RefusalCode = "server-full" | "too-many-rooms";

export interface Refusal {
  readonly code: RefusalCode;
  readonly message: string;
}

export const SERVER_FULL: Refusal = {
  code: "server-full",
  message: "The server is full right now — try again in a minute.",
};

export const TOO_MANY_ROOMS: Refusal = {
  code: "too-many-rooms",
  message: "You have too many rooms open — finish or leave one first.",
};

export interface AdmissionLimits {
  /** Weighted rooms (`roomWeight`) a shard holds before it takes no more;
   * a create is refused only when every up shard is this full. ∞ if absent. */
  readonly maxRoomsPerShard?: number;
  /** Waiting and playing rooms one address may have created at once,
   * across every kind of create. ∞ if absent. */
  readonly maxRoomsPerIp?: number;
}

/** A room as placement counts it. `ip`: the address that created it, `null`
 * for one no cap applies to (loopback, a room built by hand). */
export interface RoomRecord {
  readonly shard: number;
  readonly kind: RoomKind;
  readonly stage: RoomStage;
  readonly ip: string | null;
}

/** One shard as placement sees it. */
export interface ShardCandidate {
  readonly index: number;
  /** Ready for rooms: not starting, not down. */
  readonly up: boolean;
  /** Its last load report's event-loop utilisation and delay p99, if any. */
  readonly elu: number | null;
  readonly delayP99Ms: number | null;
}

/** The cost of a shard running the deck importer (shard 0). */
export const IMPORT_COST = 0.5;

/** A shard whose event loop lags past this is passed over while another
 * isn't. */
export const SLOW_DELAY_P99_MS = 250;

/**
 * What a room costs its shard: a lobby counts as the game it will become, so
 * a start is never refused; a tutorial is one human against scripted bots,
 * far cheaper than four v2 bots; a finished game is only a seat board left
 * up. A scenario builder (a developer's tool) and a room built by hand
 * (dev-rooms) cost nothing here.
 */
export function roomWeight(kind: RoomKind, stage: RoomStage): number {
  if (kind === "builder" || kind === "adopted") return 0;
  if (stage === "finished") return 0.1;
  return kind === "tutorial" ? 0.5 : 1;
}

/** The messages that open a room — what admission is asked about — and the
 * kind of room each opens. */
export const CREATES: Readonly<Record<string, RoomKind>> = {
  "create-room": "lobby",
  "tutorial-create": "tutorial",
  "builder-create": "builder",
};

/** The stage a create's route starts at, before its shard says. */
export function initialStage(kind: RoomKind): RoomStage {
  return kind === "lobby" ? "waiting" : "playing";
}

/** Each shard's rooms' weights. A create's route is recorded before it's
 * forwarded, so creates still in flight count too. */
export function shardLoads(rooms: Iterable<RoomRecord>): Map<number, number> {
  const loads = new Map<number, number>();
  for (const room of rooms) loads.set(room.shard, (loads.get(room.shard) ?? 0) + roomWeight(room.kind, room.stage));
  return loads;
}

/** The rooms `ip` created that are still waiting or playing. */
export function openRoomsOf(rooms: Iterable<RoomRecord>, ip: string): number {
  let n = 0;
  for (const room of rooms) if (room.ip === ip && room.stage !== "finished") n += 1;
  return n;
}

const isLoopback = (ip: string): boolean =>
  ip === "::1" || ip.startsWith("127.") || ip.startsWith("::ffff:127.");

/**
 * The address a create counts against, or `null` for none. Loopback without
 * a `CF-Connecting-IP` header is exempt: only the box itself reaches the game
 * port without the tunnel (scripts, the load test), while everything through
 * the tunnel carries the header — and arrives from 127.0.0.1, which is why
 * the header and not the address decides.
 */
export function capKey(ip: string, forwarded: boolean): string | null {
  return !forwarded && isLoopback(ip) ? null : ip;
}

export type Placement = { readonly shard: number } | { readonly refused: Refusal };

/**
 * Where a create from `ip` goes: refused if `ip` already holds its limit of
 * open rooms, or if no up shard has room; otherwise the up shard with the
 * lowest cost (its rooms' weights, plus `IMPORT_COST` on shard 0), passing
 * over any lagging past `SLOW_DELAY_P99_MS` unless all are, ties going to
 * the lower event-loop utilisation, then the lower index.
 */
export function placeRoom(
  shards: readonly ShardCandidate[],
  rooms: Iterable<RoomRecord>,
  limits: AdmissionLimits,
  ip: string | null,
): Placement {
  const all = [...rooms];
  const perIp = limits.maxRoomsPerIp ?? Infinity;
  if (ip !== null && openRoomsOf(all, ip) >= perIp) return { refused: TOO_MANY_ROOMS };

  const loads = shardLoads(all);
  const perShard = limits.maxRoomsPerShard ?? Infinity;
  const open = shards.filter((s) => s.up && (loads.get(s.index) ?? 0) < perShard);
  if (open.length === 0) return { refused: SERVER_FULL };
  const brisk = open.filter((s) => (s.delayP99Ms ?? 0) <= SLOW_DELAY_P99_MS);
  const pool = brisk.length > 0 ? brisk : open;

  const cost = (s: ShardCandidate): number => (loads.get(s.index) ?? 0) + (s.index === 0 ? IMPORT_COST : 0);
  // Weights are tenths and halves: a difference this small is a tie.
  const EPSILON = 1e-9;
  const better = (a: ShardCandidate, b: ShardCandidate): boolean => {
    const d = cost(a) - cost(b);
    if (Math.abs(d) > EPSILON) return d < 0;
    const e = (a.elu ?? 0) - (b.elu ?? 0);
    if (e !== 0) return e < 0;
    return a.index < b.index;
  };
  let best = pool[0];
  for (const s of pool.slice(1)) if (better(s, best)) best = s;
  return { shard: best.index };
}
