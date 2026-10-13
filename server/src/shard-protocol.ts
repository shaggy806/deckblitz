/**
 * What the main thread and a shard — a worker thread that owns a share of the
 * rooms whole (`shard.ts`) — say to each other (`docs/plans/room-shards.md`).
 * Types only, every one of them structured-cloneable.
 *
 * Main forwards a client's message as the raw text it came as (it parses only
 * to route), and a shard answers with one `out` per tick: each message for a
 * connection encoded once as UTF-8 and transferred, never re-encoded on main.
 */

import type { LoadReport } from "./load-monitor.js";
import type { ConnId, RoomEvent } from "./room-host.js";
import type { RoomSummary } from "./status-server.js";

export type { ConnId, RoomEvent, RoomKind, RoomStage } from "./room-host.js";

export type ShardIndex = number;

export interface ShardConfig {
  readonly index: ShardIndex;
  /** The scenario builder's messages (`--builder`). */
  readonly builder: boolean;
  /** Keep bots' decisions for saving (`--capture`): where, and how many per
   * room (`CAPTURE_KEEP` if absent). Each shard builds its own registry. */
  readonly capture: { readonly dir: string; readonly keep?: number } | null;
  /** The idle reaper (`RoomServerOptions`), off when either is absent. */
  readonly reapIdleMs?: number;
  readonly reapIntervalMs?: number;
  /** How often the shard sends its `load`. */
  readonly loadReportMs: number;
  /** Runs `/import-deck` jobs: shard 0 only, so the Scryfall throttle and
   * caches stay single copies. */
  readonly importJobs: boolean;
  /** `RoomOptions.pacing` for every room (tests drive games `"immediate"`). */
  readonly pacing?: "realtime" | "immediate";
}

/** Shard-side load: its own thread's `LoadReport`, and its rooms. */
export interface ShardLoad extends LoadReport {
  readonly rooms: number;
}

export type ToShard =
  /** A client's message, as it came. `roomId`: the code main allocated, on
   * a create (`create-room`, `tutorial-create`, `builder-create`). */
  | { readonly t: "msg"; readonly conn: ConnId; readonly raw: string; readonly roomId?: string }
  /** The socket closed: today's close logic, for whatever it held here. */
  | { readonly t: "close"; readonly conn: ConnId }
  /** The connection is spectating a room on another shard now. */
  | { readonly t: "unspectate"; readonly conn: ConnId }
  | { readonly t: "status"; readonly req: number }
  | { readonly t: "import"; readonly job: number; readonly text: string }
  | { readonly t: "stop" };

/** One `ServerMessage`, UTF-8, for every connection in `conns`. */
export interface Delivery {
  readonly conns: readonly ConnId[];
  readonly data: Uint8Array;
}

export type FromShard =
  /** Built and listening; `rooms` are any it started with. */
  | { readonly t: "ready"; readonly rooms: readonly RoomEvent[] }
  /** Everything one tick sent, in order, and any rooms that changed. */
  | { readonly t: "out"; readonly deliveries: readonly Delivery[]; readonly rooms: readonly RoomEvent[] }
  | { readonly t: "load"; readonly report: ShardLoad }
  | {
      readonly t: "status";
      readonly req: number;
      readonly rooms: readonly RoomSummary[];
      readonly roomsCreated: number;
      readonly load: ShardLoad;
    }
  /** One import job's output: a `line` (JSON text), a `reject`ion (its
   * message), or the `end`. */
  | { readonly t: "import"; readonly job: number; readonly kind: "line" | "reject" | "end"; readonly text?: string };
