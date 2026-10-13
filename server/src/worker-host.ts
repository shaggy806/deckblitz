/**
 * Rooms on worker threads: a `RoomHost` over N shards (`shard.ts`, one per
 * worker), per the shard design (`docs/plans/room-shards.md`). Main-side —
 * it imports no engine, so the main thread keeps only sockets, routes and
 * HTTP while every game runs on another core.
 *
 * Main allocates every room code and places the room on a shard before
 * forwarding its create, so the client's immediate burst (join, claim, add
 * bots, start) follows it there over one port, in order. Every other room
 * message goes, as the text it came as, to the shard its `roomId` routes to;
 * main answers a code it has no route for itself (`no such room`), which
 * keeps code-guessing off the shards. A connection's id travels with each
 * message, and its close goes to every shard it touched.
 */

import { Worker } from "node:worker_threads";
import type { ClientMessage } from "protocol";
// Creates (`CREATES`): main allocates the code and places the room.
import { CREATES, capKey, initialStage, placeRoom } from "./admission.js";
import type { AdmissionLimits, Placement } from "./admission.js";
import type { ImportSink } from "./import-route.js";
import { allocateRoomCode } from "./room-code.js";
import type { ClientLink, ConnId, RoomEvent, RoomHost, RoomKind, RoomStage } from "./room-host.js";
import type { FromShard, ShardConfig, ShardIndex, ShardLoad, ToShard } from "./shard-protocol.js";
import { countRooms } from "./status-server.js";
import type { RoomSummary, ShardStatus, StatusParts } from "./status-server.js";
import { sendMessage } from "./transport.js";

/** One shard as main drives it: a worker in production, the same shard
 * in-thread in tests (`loopback-channel.ts`). */
export interface ShardChannel {
  post(message: ToShard): void;
  onMessage(listener: (message: FromShard) => void): void;
  /** The shard ended — on purpose (`terminate`, `stop`) or not. */
  onExit(listener: (code: number) => void): void;
  terminate(): Promise<void>;
}

export type SpawnShard = (config: ShardConfig) => ShardChannel;

/** A real worker thread running `shard-worker.js` (built: `dist/`).
 * `heapMb` caps its old generation (`resourceLimits.maxOldGenerationSizeMb`),
 * so running out of memory ends that one shard rather than the process. */
export function workerChannel(
  config: ShardConfig,
  script: URL = new URL("./shard-worker.js", import.meta.url),
  heapMb?: number,
): ShardChannel {
  const worker = new Worker(script, {
    workerData: config,
    ...(heapMb !== undefined ? { resourceLimits: { maxOldGenerationSizeMb: heapMb } } : {}),
  });
  return {
    post: (message) => worker.postMessage(message),
    onMessage: (listener) => worker.on("message", listener),
    onExit: (listener) => {
      worker.on("error", (err) => console.error(`[shard ${config.index}] crashed:`, err));
      worker.on("exit", listener);
    },
    terminate: async () => {
      await worker.terminate();
    },
  };
}

/** The shards' settings, but for what's per shard. */
export type ShardSettings = Omit<ShardConfig, "index" | "importJobs" | "shardCount">;

/** A `control` command's answer (`ShardControl`, dev-rooms' ops). */
export type ControlReply = Omit<Extract<FromShard, { t: "control" }>, "t" | "req">;

export interface WorkerHostOptions {
  readonly shards: number;
  readonly config: ShardSettings;
  readonly spawn: SpawnShard;
  /** How long `/status` waits for a shard before calling it unresponsive. */
  readonly statusTimeoutMs?: number;
  /** How long `stop` lets a shard end on its own before terminating it. */
  readonly stopGraceMs?: number;
  /** The caps on creates (`admission.ts`); none if absent. */
  readonly admission?: AdmissionLimits;
  /** Restarting a shard that ended unasked: after `baseMs` (1 s), doubling
   * with each recent exit up to `maxMs` (30 s); one that has ended more than
   * `loopLimit` (5) times within `loopWindowMs` (5 minutes) is left down. */
  readonly restart?: {
    readonly baseMs?: number;
    readonly maxMs?: number;
    readonly loopLimit?: number;
    readonly loopWindowMs?: number;
  };
}

/** Where a shard is: spawned and not yet `ready`, taking rooms, waiting to
 * be restarted after ending unasked, left down after ending too often
 * (`failed`), or ended by `stop`. */
export type ShardPhase = "starting" | "up" | "restarting" | "failed" | "stopped";

interface ShardState {
  readonly index: ShardIndex;
  /** The running incarnation's channel. */
  channel: ShardChannel | null;
  phase: ShardPhase;
  restarts: number;
  /** When it ended unasked, within the crash-loop window. */
  crashes: number[];
  restartTimer: ReturnType<typeof setTimeout> | null;
  load: ShardLoad | null;
  /** The running incarnation's end. */
  exited: Promise<number>;
}

interface Route {
  readonly shard: ShardIndex;
  readonly kind: RoomKind;
  stage: RoomStage;
  /** The address that created it, for the per-address cap; `null` if none
   * applies (loopback, a room the shard started with). */
  readonly ip: string | null;
}

/** Room messages a code with no route is answered for exactly as a shard's
 * service would answer it (`requireRoom` and friends). */
const BUILDER_MESSAGES = new Set(["builder-update", "builder-start", "builder-stop", "builder-snapshot", "builder-seat"]);
const TUTORIAL_MESSAGES = new Set(["tutorial-next", "tutorial-retry"]);
/** Silent for an unknown room: pacing signals with nothing to report. */
const SILENT_MESSAGES = new Set(["ack", "resync"]);
const ROOM_MESSAGES = new Set([
  "join-room",
  "spectate-room",
  "set-pass-settings",
  "concede",
  "bot-takeover",
  "take-seat",
  "claim-seat",
  "add-bot",
  "set-bot-deck",
  "add-seat",
  "remove-seat",
  "set-ready",
  "leave-room",
  "start-game",
  "rematch",
  "set-bot-speed",
  "set-room-settings",
  "set-bots-paused",
  "step-bots",
  "dispatch",
  "pass-turn",
  "auto-pass",
  "resolve-all",
  "capture-list",
  "capture-options",
  "capture-save",
  "capture-report",
]);

const EVENT_DELTAS = JSON.stringify({ type: "event-deltas" });
const DEFAULT_STATUS_TIMEOUT_MS = 1_000;
const DEFAULT_STOP_GRACE_MS = 2_000;
const DEFAULT_RESTART_BASE_MS = 1_000;
const DEFAULT_RESTART_MAX_MS = 30_000;
const DEFAULT_CRASH_LOOP_LIMIT = 5;
const DEFAULT_CRASH_LOOP_WINDOW_MS = 5 * 60_000;

export class WorkerRoomHost implements RoomHost {
  private readonly options: WorkerHostOptions;
  private readonly shards: ShardState[] = [];
  /** Every live room, by code: which shard holds it, and what it is. */
  private readonly routes = new Map<string, Route>();
  private readonly links = new Map<ConnId, ClientLink>();
  /** The shards each connection has sent anything to. */
  private readonly touched = new Map<ConnId, Set<ShardIndex>>();
  /** Connections that asked for event slices (`event-deltas`): each shard
   * they reach is told before anything else. */
  private readonly deltas = new Set<ConnId>();
  /** The shard each connection last spectated on. */
  private readonly watching = new Map<ConnId, ShardIndex>();
  private nextRequest = 1;
  private readonly statusRequests = new Map<number, (index: ShardIndex, reply: Extract<FromShard, { t: "status" }>) => void>();
  private readonly imports = new Map<number, ImportSink>();
  /** `control` commands awaiting their shard's answer. */
  private readonly controls = new Map<number, { readonly index: ShardIndex; readonly resolve: (reply: ControlReply) => void }>();
  private stopping = false;
  /** `start` has finished: from here a shard that ends is restarted. */
  private started = false;

  constructor(options: WorkerHostOptions) {
    if (!Number.isInteger(options.shards) || options.shards < 1) throw new Error("a worker host needs at least one shard");
    this.options = options;
    for (let index = 0; index < options.shards; index += 1) {
      this.shards.push({
        index,
        channel: null,
        phase: "starting",
        restarts: 0,
        crashes: [],
        restartTimer: null,
        load: null,
        exited: Promise.resolve(0),
      });
    }
  }

  /** Spawns every shard; resolves once each is ready, its rooms routed, and
   * rejects if one ends before it is. */
  async start(): Promise<void> {
    await Promise.all(this.shards.map((shard) => this.launch(shard)));
    this.started = true;
  }

  /** Where each shard is (`ShardPhase`), by index. */
  phases(): ShardPhase[] {
    return this.shards.map((shard) => shard.phase);
  }

  /** Spawns one incarnation of `shard` and wires it up; resolves on its
   * `ready`, rejects if it ends first. Messages from an incarnation that
   * has since been replaced are ignored. */
  private launch(shard: ShardState): Promise<void> {
    const index = shard.index;
    const channel = this.options.spawn({
      ...this.options.config,
      index,
      importJobs: index === 0,
      shardCount: this.options.shards,
    });
    let resolveExit: (code: number) => void = () => {};
    shard.channel = channel;
    shard.phase = "starting";
    shard.load = null;
    shard.exited = new Promise<number>((resolve) => (resolveExit = resolve));
    return new Promise<void>((resolve, reject) => {
      channel.onMessage((message) => {
        if (shard.channel !== channel) return;
        if (message.t === "ready") {
          shard.phase = "up";
          for (const event of message.rooms) this.roomChanged(index, event);
          resolve();
          return;
        }
        this.fromShard(shard, message);
      });
      channel.onExit((code) => {
        resolveExit(code);
        if (shard.channel !== channel) return;
        const wasUp = shard.phase === "up";
        if (!wasUp) reject(new Error(`shard ${index} exited (${code}) before it was ready`));
        this.exited(shard, code, wasUp);
      });
    });
  }

  /** Which shard holds `roomId`, if any — for tests and the status page. */
  shardOf(roomId: string): ShardIndex | undefined {
    return this.routes.get(roomId)?.shard;
  }

  open(link: ClientLink): void {
    this.links.set(link.id, link);
  }

  message(link: ClientLink, message: ClientMessage, raw: string): void {
    const conn = link.id;
    const kind = CREATES[message.type];
    if (kind !== undefined) {
      if (kind === "builder" && !this.options.config.builder) {
        sendMessage(link, { type: "error", message: "this server wasn't started with --builder" });
        return;
      }
      const ip = capKey(link.ip, link.forwarded === true);
      const placed = this.place(ip);
      if ("refused" in placed) {
        sendMessage(link, { type: "error", message: placed.refused.message, code: placed.refused.code });
        return;
      }
      const shard = placed.shard;
      const code = allocateRoomCode((c) => this.routes.has(c));
      // Routed before it's forwarded, so whatever the client sends next
      // follows the create to the same shard — and placement counts it
      // while it's in flight.
      this.routes.set(code, { shard, kind, stage: initialStage(kind), ip });
      this.forward(shard, conn, raw, code);
      return;
    }
    if (message.type === "event-deltas") {
      this.deltas.add(conn);
      for (const shard of this.touched.get(conn) ?? []) this.post(shard, { t: "msg", conn, raw });
      return;
    }
    const roomId: unknown = (message as { roomId?: unknown }).roomId;
    const route = typeof roomId === "string" ? this.routes.get(roomId) : undefined;
    if (route === undefined) {
      this.noRoute(link, message.type, roomId);
      return;
    }
    if (message.type === "spectate-room") {
      // Spectating is one room at a time, across shards too.
      const was = this.watching.get(conn);
      if (was !== undefined && was !== route.shard) this.post(was, { t: "unspectate", conn });
      this.watching.set(conn, route.shard);
    }
    this.forward(route.shard, conn, raw);
  }

  close(link: ClientLink): void {
    const conn = link.id;
    for (const shard of this.touched.get(conn) ?? []) this.post(shard, { t: "close", conn });
    this.links.delete(conn);
    this.touched.delete(conn);
    this.deltas.delete(conn);
    this.watching.delete(conn);
  }

  async status(): Promise<StatusParts> {
    const req = this.nextRequest++;
    const replies = new Map<ShardIndex, Extract<FromShard, { t: "status" }>>();
    const asked = this.shards.filter((s) => s.phase === "up");
    await new Promise<void>((resolve) => {
      const timer = setTimeout(resolve, this.options.statusTimeoutMs ?? DEFAULT_STATUS_TIMEOUT_MS);
      this.statusRequests.set(req, (index, reply) => {
        replies.set(index, reply);
        if (replies.size === asked.length) {
          clearTimeout(timer);
          resolve();
        }
      });
      if (asked.length === 0) {
        clearTimeout(timer);
        resolve();
      }
      for (const shard of asked) this.post(shard.index, { t: "status", req });
    });
    this.statusRequests.delete(req);

    const rooms: RoomSummary[] = [];
    let roomsCreated = 0;
    const shards: ShardStatus[] = this.shards.map((shard) => {
      const reply = replies.get(shard.index);
      if (reply !== undefined) {
        rooms.push(...reply.rooms);
        roomsCreated += reply.roomsCreated;
      }
      return {
        index: shard.index,
        up: shard.phase === "up",
        state: shard.phase,
        responsive: reply !== undefined,
        restarts: shard.restarts,
        roomsCreated: reply?.roomsCreated ?? 0,
        // What main's routes say, for a shard that didn't answer.
        counts: reply !== undefined ? countRooms(reply.rooms) : this.routeCounts(shard.index),
        load: reply?.load ?? shard.load,
      };
    });
    return { rooms, roomsCreated, shards };
  }

  /** Runs one command in shard `index`'s `setup` module (dev-rooms' ops);
   * refused at once for a shard that isn't up. */
  control(index: ShardIndex, cmd: unknown): Promise<ControlReply> {
    if (this.shards[index]?.phase !== "up") {
      return Promise.resolve({ ok: false, json: JSON.stringify({ error: `shard ${index} isn't up` }) });
    }
    const req = this.nextRequest++;
    return new Promise((resolve) => {
      this.controls.set(req, { index, resolve });
      this.post(index, { t: "control", req, cmd });
    });
  }

  importDeck(text: string, sink: ImportSink): void {
    const shard = this.shards[0];
    if (shard === undefined || shard.phase !== "up") {
      sink.reject("the deck importer isn't running right now — try again in a minute");
      return;
    }
    const job = this.nextRequest++;
    this.imports.set(job, sink);
    this.post(0, { t: "import", job, text });
  }

  async stop(): Promise<void> {
    this.stopping = true;
    const grace = this.options.stopGraceMs ?? DEFAULT_STOP_GRACE_MS;
    await Promise.all(
      this.shards.map(async (shard) => {
        if (shard.restartTimer !== null) clearTimeout(shard.restartTimer);
        shard.restartTimer = null;
        const phase = shard.phase;
        shard.phase = "stopped";
        const channel = shard.channel;
        if (channel === null) return;
        if (phase === "up") {
          channel.post({ t: "stop" });
          let timer: ReturnType<typeof setTimeout> | undefined;
          const ended = await Promise.race([
            shard.exited.then(() => true),
            new Promise<boolean>((resolve) => (timer = setTimeout(() => resolve(false), grace))),
          ]);
          clearTimeout(timer);
          if (!ended) await channel.terminate();
        } else if (phase === "starting") {
          await channel.terminate();
        }
      }),
    );
  }

  /** Where a create from `ip` goes, or why it can't open (`placeRoom`). */
  private place(ip: string | null): Placement {
    const candidates = this.shards.map((shard) => ({
      index: shard.index,
      // Starting, restarting or left down: no rooms go there.
      up: shard.phase === "up",
      elu: shard.load?.elu ?? null,
      delayP99Ms: shard.load?.delayP99Ms ?? null,
    }));
    return placeRoom(candidates, this.routes.values(), this.options.admission ?? {}, ip);
  }

  private routeCounts(index: ShardIndex): ShardStatus["counts"] {
    const stages = [...this.routes.values()].filter((r) => r.shard === index).map((r) => r.stage);
    return {
      total: stages.length,
      waiting: stages.filter((s) => s === "waiting").length,
      playing: stages.filter((s) => s === "playing").length,
      finished: stages.filter((s) => s === "finished").length,
    };
  }

  /** Sends `raw` from `conn` to `shard`, telling the shard first that the
   * connection takes event slices if this is the first it hears of it. */
  private forward(shard: ShardIndex, conn: ConnId, raw: string, roomId?: string): void {
    let touched = this.touched.get(conn);
    if (touched === undefined) this.touched.set(conn, (touched = new Set()));
    if (!touched.has(shard)) {
      touched.add(shard);
      if (this.deltas.has(conn)) this.post(shard, { t: "msg", conn, raw: EVENT_DELTAS });
    }
    this.post(shard, { t: "msg", conn, raw, ...(roomId !== undefined ? { roomId } : {}) });
  }

  private post(index: ShardIndex, message: ToShard): void {
    const shard = this.shards[index];
    if (shard?.phase === "up") shard.channel?.post(message);
  }

  /** A message for a code main has no room under, answered as the room
   * service would have. */
  private noRoute(link: ClientLink, type: string, roomId: unknown): void {
    if (SILENT_MESSAGES.has(type)) return;
    let message: string;
    if (BUILDER_MESSAGES.has(type)) {
      message = this.options.config.builder
        ? `room ${String(roomId)} isn't a scenario builder`
        : "this server wasn't started with --builder";
    } else if (TUTORIAL_MESSAGES.has(type)) {
      message = `room ${String(roomId)} isn't a tutorial`;
    } else if (ROOM_MESSAGES.has(type)) {
      message = `no such room: ${String(roomId)}`;
    } else {
      return;
    }
    sendMessage(link, { type: "error", message });
  }

  private fromShard(shard: ShardState, message: FromShard): void {
    switch (message.t) {
      case "out":
        for (const delivery of message.deliveries) {
          for (const conn of delivery.conns) this.links.get(conn)?.send(delivery.data);
        }
        for (const event of message.rooms) this.roomChanged(shard.index, event);
        return;
      case "load":
        shard.load = message.report;
        return;
      case "status":
        this.statusRequests.get(message.req)?.(shard.index, message);
        return;
      case "import": {
        const sink = this.imports.get(message.job);
        if (sink === undefined) return;
        if (message.kind === "line") sink.line(JSON.parse(message.text ?? "null"));
        else if (message.kind === "reject") {
          this.imports.delete(message.job);
          sink.reject(message.text ?? "the import failed");
        } else {
          this.imports.delete(message.job);
          sink.end();
        }
        return;
      }
      case "control": {
        const pending = this.controls.get(message.req);
        this.controls.delete(message.req);
        pending?.resolve({
          ok: message.ok,
          json: message.json,
          ...(message.dropConnections === true ? { dropConnections: true } : {}),
        });
        return;
      }
      case "ready":
        return;
    }
  }

  private roomChanged(index: ShardIndex, event: RoomEvent): void {
    const route = this.routes.get(event.id);
    if (event.stage === "gone") {
      if (route?.shard === index) this.routes.delete(event.id);
      return;
    }
    if (route === undefined) this.routes.set(event.id, { shard: index, kind: event.kind, stage: event.stage, ip: null });
    else if (route.shard === index) route.stage = event.stage;
  }

  /** A shard ended. Its rooms are gone with it: their routes go, and every
   * connection that reached it is closed (1011) so its client reconnects
   * and finds out. Then it's restarted after a backoff — 1, 2, 4 … 30 s by
   * how often it has ended lately — unless it has ended more than
   * `loopLimit` times in `loopWindowMs`, when it's left down (`failed`, on
   * `/status`) rather than restarted in a loop. */
  private exited(shard: ShardState, code: number, wasUp: boolean): void {
    if (this.stopping) {
      shard.phase = "stopped";
      return;
    }
    if (wasUp) {
      console.error(`shard ${shard.index} exited (${code}); its rooms are lost`);
      for (const [id, route] of this.routes) if (route.shard === shard.index) this.routes.delete(id);
      for (const [conn, touched] of this.touched) {
        if (touched.has(shard.index)) this.links.get(conn)?.close(1011, "the server lost this room");
      }
      for (const [req, pending] of this.controls) {
        if (pending.index !== shard.index) continue;
        this.controls.delete(req);
        pending.resolve({ ok: false, json: JSON.stringify({ error: `shard ${shard.index} ended` }) });
      }
      if (shard.index === 0) {
        for (const [job, sink] of this.imports) {
          this.imports.delete(job);
          sink.line({ type: "error", error: "the deck importer stopped — try again" });
          sink.end();
        }
      }
    }
    // Before `start` has finished, an exit fails the start instead.
    if (!this.started) {
      shard.phase = "failed";
      return;
    }
    const restart = this.options.restart ?? {};
    const now = Date.now();
    const window = restart.loopWindowMs ?? DEFAULT_CRASH_LOOP_WINDOW_MS;
    shard.crashes = shard.crashes.filter((t) => now - t < window);
    shard.crashes.push(now);
    if (shard.crashes.length > (restart.loopLimit ?? DEFAULT_CRASH_LOOP_LIMIT)) {
      shard.phase = "failed";
      console.error(
        `shard ${shard.index} has ended ${shard.crashes.length} times in ${Math.round(window / 1000)} s; leaving it down`,
      );
      return;
    }
    const delay = Math.min(
      restart.maxMs ?? DEFAULT_RESTART_MAX_MS,
      (restart.baseMs ?? DEFAULT_RESTART_BASE_MS) * 2 ** (shard.crashes.length - 1),
    );
    shard.phase = "restarting";
    console.error(`shard ${shard.index}: restarting in ${(delay / 1000).toFixed(1)} s`);
    shard.restartTimer = setTimeout(() => {
      shard.restartTimer = null;
      if (this.stopping) return;
      shard.restarts += 1;
      const began = Date.now();
      // An incarnation that ends before it's ready comes back through here.
      this.launch(shard).then(
        () => console.log(`shard ${shard.index} back up in ${((Date.now() - began) / 1000).toFixed(1)} s`),
        () => {},
      );
    }, delay);
    shard.restartTimer.unref();
  }
}
