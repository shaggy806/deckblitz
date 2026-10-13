/**
 * A shard: a share of the rooms, whole — their `Game`s, bots, settles, views
 * and frames — behind the main ↔ shard protocol (`shard-protocol.ts`,
 * `docs/plans/room-shards.md`). `shard-worker.ts` runs one in a worker
 * thread; tests run one in-thread over `loopback-channel.ts`.
 *
 * Inside, it's today's server: a `RoomManager` and a `RoomService`. What the
 * service sends is batched per tick into one `out`: each message encoded once
 * as UTF-8 (a message sent to several connections in a row — a spectator
 * frame — once for all of them) and its buffer transferred, not copied.
 */

import { createDefaultRegistry } from "engine";
import type { CardRegistry } from "engine";
import type { ClientMessage, ServerMessage } from "protocol";
import { DEFAULT_CAPTURE_DIR } from "./capture.js";
import { importDeps, runImportJob } from "./import-deck.js";
import type { ImportDeps } from "./import-deck.js";
import { LoadMonitor } from "./load-monitor.js";
import { PendingRoom } from "./pending-room.js";
import { BOT_DECISIONS, Room } from "./room.js";
import { RoomManager } from "./room-manager.js";
import { RoomService } from "./room-service.js";
import type { ConnId, RoomEvent } from "./room-host.js";
import type { Delivery, FromShard, ShardConfig, ShardLoad, ToShard } from "./shard-protocol.js";
import { roomSummaries } from "./status.js";

/** The rooms' side of a config: its own registry, and a manager over it. */
export function roomsFor(
  config: Pick<ShardConfig, "capture" | "pacing">,
  registry: CardRegistry = createDefaultRegistry(),
): { readonly registry: CardRegistry; readonly manager: RoomManager } {
  const manager = new RoomManager({
    ...(config.capture !== null
      ? {
          capture: {
            dir: config.capture.dir || DEFAULT_CAPTURE_DIR,
            registry,
            ...(config.capture.keep !== undefined ? { keep: config.capture.keep } : {}),
          },
        }
      : {}),
    ...(config.pacing !== undefined ? { pacing: config.pacing } : {}),
  });
  return { registry, manager };
}

export interface Shard {
  /** One message from main. */
  receive(message: ToShard): void;
  /** Stops its timers and disposes its rooms' games. */
  stop(): void;
  readonly manager: RoomManager;
}

/** Posts one message to main, transferring `transfer`'s buffers. */
export type PostToMain = (message: FromShard, transfer: readonly ArrayBuffer[]) => void;

export function createShard(
  config: ShardConfig,
  post: PostToMain,
  /** A registry to share (in-thread tests); a shard builds its own without. */
  sharedRegistry?: CardRegistry,
): Shard {
  const { registry, manager } = roomsFor(config, sharedRegistry);
  const encoder = new TextEncoder();

  // One tick's output, flushed in a microtask once the tick's work is done.
  let deliveries: Delivery[] = [];
  let lastMessage: ServerMessage | null = null;
  let rooms: RoomEvent[] = [];
  let transfer: ArrayBuffer[] = [];
  let flushing = false;
  let stopped = false;

  const flush = (): void => {
    flushing = false;
    if (stopped || (deliveries.length === 0 && rooms.length === 0)) return;
    const out: FromShard = { t: "out", deliveries, rooms };
    const buffers = transfer;
    deliveries = [];
    lastMessage = null;
    rooms = [];
    transfer = [];
    post(out, buffers);
  };
  const schedule = (): void => {
    if (flushing) return;
    flushing = true;
    queueMicrotask(flush);
  };

  const service = new RoomService(
    manager,
    {
      send: (conn: ConnId, message: ServerMessage) => {
        const last = deliveries.at(-1);
        if (last !== undefined && message === lastMessage) {
          (last.conns as ConnId[]).push(conn);
          return;
        }
        // `TextEncoder.encode` makes a buffer of its own (not one of
        // `Buffer`'s pooled slabs), so it can be transferred.
        const data = encoder.encode(JSON.stringify(message));
        deliveries.push({ conns: [conn], data });
        transfer.push(data.buffer as ArrayBuffer);
        lastMessage = message;
        schedule();
      },
      roomChanged: (event) => {
        rooms.push(event);
        schedule();
      },
    },
    {
      builder: config.builder,
      ...(config.reapIdleMs !== undefined ? { reapIdleMs: config.reapIdleMs } : {}),
      ...(config.reapIntervalMs !== undefined ? { reapIntervalMs: config.reapIntervalMs } : {}),
    },
  );

  const monitor = new LoadMonitor({ decisions: BOT_DECISIONS });
  const load = (): ShardLoad => ({ ...monitor.read(), rooms: manager.all().length });
  const loadTimer = setInterval(() => post({ t: "load", report: load() }, []), config.loadReportMs);
  loadTimer.unref();

  const deps: ImportDeps | null = config.importJobs ? importDeps(registry) : null;

  const receive = (message: ToShard): void => {
    if (stopped) return;
    switch (message.t) {
      case "msg": {
        let parsed: ClientMessage;
        try {
          parsed = JSON.parse(message.raw) as ClientMessage;
        } catch {
          // Main parsed it before forwarding; nothing else sends here.
          return;
        }
        service.handle(message.conn, parsed, message.roomId);
        return;
      }
      case "close":
        service.close(message.conn);
        return;
      case "unspectate":
        service.unspectate(message.conn);
        return;
      case "status":
        post(
          { t: "status", req: message.req, rooms: roomSummaries(manager), roomsCreated: manager.roomsCreated, load: load() },
          [],
        );
        return;
      case "import": {
        const job = message.job;
        const out = (kind: "line" | "reject" | "end", text?: string): void =>
          post({ t: "import", job, kind, ...(text !== undefined ? { text } : {}) }, []);
        if (deps === null) {
          out("reject", "this shard doesn't run imports");
          return;
        }
        void runImportJob(message.text, deps, {
          line: (value) => out("line", JSON.stringify(value)),
          reject: (text) => out("reject", text),
          end: () => out("end"),
        });
        return;
      }
      case "stop":
        stop();
        return;
    }
  };

  const stop = (): void => {
    if (stopped) return;
    stopped = true;
    clearInterval(loadTimer);
    monitor.stop();
    service.stop();
    for (const room of manager.all()) if (room instanceof Room) room.dispose();
  };

  post(
    {
      t: "ready",
      rooms: manager.all().map((room) => ({
        id: room.id,
        kind: manager.kindOf(room.id) ?? "adopted",
        stage: room instanceof PendingRoom ? "waiting" : room.game.state.result.over ? "finished" : "playing",
      })),
    },
    [],
  );

  return { receive, stop, manager };
}
