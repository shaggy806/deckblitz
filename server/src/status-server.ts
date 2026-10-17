/**
 * An operator's view of the running server: what rooms exist, who is in them,
 * and whether the process is healthy. Meant to be read over SSH with `curl`.
 * The rooms' side of it — one summary per room — is `status.ts`'s
 * `roomSummaries`, worked out wherever the rooms live; this puts the pieces
 * together and serves them. Main-side: no engine.
 *
 * ## Why this listens on its own port, on loopback only
 *
 * The game server's port is published to the open internet — `ws.deckblitz.net`
 * forwards straight to it through the Cloudflare tunnel (see `DEPLOYMENT.md`).
 * And **a room code is a join credential**: anyone who knows one can walk into
 * that game. A status page listing room codes on the public port would be an
 * open invitation to every game in progress.
 *
 * Checking the caller's address on the main port would not help either, because
 * `cloudflared` connects to `http://localhost:4000` — every public request
 * *arrives* from 127.0.0.1, so a loopback check there would pass for the whole
 * internet. Binding a second listener to 127.0.0.1 on a port the tunnel does
 * not forward is what actually makes it private, and it is why this is a
 * separate server rather than another route.
 */

import { createServer } from "node:http";
import type { Server } from "node:http";
import type { RecordableHistogram } from "node:perf_hooks";
import { LoadMonitor } from "./load-monitor.js";
import type { LoadReport } from "./load-monitor.js";

export interface SeatSummary {
  readonly player: string;
  readonly claimed: boolean;
  readonly online: boolean;
  readonly isBot: boolean;
  readonly displayName: string | null;
}

export interface RoomSummary {
  readonly id: string;
  /** `waiting` is a `PendingRoom` with seats still to fill; `playing` and
   * `finished` are promoted rooms either side of the game ending. */
  readonly stage: "waiting" | "playing" | "finished";
  readonly seats: readonly SeatSummary[];
  readonly humansOnline: number;
  readonly bots: number;
  /** Only for a promoted room. */
  readonly turn: number | null;
  readonly step: string | null;
  readonly activePlayer: string | null;
  readonly winner: string | null;
  readonly idleMs: number;
}

export interface RoomCounts {
  readonly total: number;
  readonly waiting: number;
  readonly playing: number;
  readonly finished: number;
}

/** One worker thread that runs rooms (a shard), as main sees it. */
export interface ShardStatus {
  readonly index: number;
  /** Running, as far as main knows. */
  readonly up: boolean;
  /** Where it is: `starting` (spawned, not ready), `up`, `restarting` (ended
   * unasked, back after a backoff), `failed` (ended too often lately, left
   * down), `stopped`. */
  readonly state: "starting" | "up" | "restarting" | "failed" | "stopped";
  /** Answered this status request in time (a second). */
  readonly responsive: boolean;
  readonly restarts: number;
  readonly roomsCreated: number;
  readonly counts: RoomCounts;
  /** Its own last report, or `null` before the first. */
  readonly load: LoadReport | null;
}

/** What wherever the rooms live reports: every room, and — with rooms on
 * worker threads — each shard. */
export interface StatusParts {
  readonly rooms: readonly RoomSummary[];
  readonly roomsCreated: number;
  readonly shards?: readonly ShardStatus[];
}

export type StatusSource = () => StatusParts | Promise<StatusParts>;

export interface StatusSnapshot {
  readonly startedAt: string;
  readonly uptimeSeconds: number;
  readonly pid: number;
  readonly node: string;
  readonly rssMb: number;
  readonly heapUsedMb: number;
  /** The main thread's own load (its event loop is every socket's), when
   * measured. */
  readonly main: LoadReport | null;
  readonly roomsCreated: number;
  readonly rooms: readonly RoomSummary[];
  readonly counts: RoomCounts;
  readonly humansOnline: number;
  readonly bots: number;
  /** Only with rooms on worker threads. */
  readonly shards?: readonly ShardStatus[];
}

const startedAt = Date.now();
const mb = (bytes: number): number => Math.round(bytes / 1024 / 1024);

export function countRooms(rooms: readonly RoomSummary[]): RoomCounts {
  return {
    total: rooms.length,
    waiting: rooms.filter((r) => r.stage === "waiting").length,
    playing: rooms.filter((r) => r.stage === "playing").length,
    finished: rooms.filter((r) => r.stage === "finished").length,
  };
}

/** The whole snapshot: this process's numbers around the rooms' parts. */
export function assembleStatus(parts: StatusParts, main: LoadReport | null = null): StatusSnapshot {
  const memory = process.memoryUsage();
  const rooms = parts.rooms;
  return {
    startedAt: new Date(startedAt).toISOString(),
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    pid: process.pid,
    node: process.version,
    rssMb: mb(memory.rss),
    heapUsedMb: mb(memory.heapUsed),
    main,
    roomsCreated: parts.roomsCreated,
    rooms,
    counts: countRooms(rooms),
    humansOnline: rooms.reduce((n, r) => n + r.humansOnline, 0),
    bots: rooms.reduce((n, r) => n + r.bots, 0),
    ...(parts.shards !== undefined ? { shards: parts.shards } : {}),
  };
}

const duration = (ms: number): string => {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

const loadLine = (load: LoadReport): string =>
  `delay p50 ${load.delayP50Ms} ms, p99 ${load.delayP99Ms} ms, max ${load.delayMaxMs} ms; ` +
  `busy ${Math.round(load.elu * 100)}%`;

/** The same snapshot as an aligned table, because this is read by a person on
 * a terminal far more often than it is parsed. */
export function renderStatus(snapshot: StatusSnapshot): string {
  const lines: string[] = [];
  lines.push("Deck Blitz server");
  lines.push(
    `  uptime   ${duration(snapshot.uptimeSeconds * 1000).padEnd(10)}` +
      `pid ${String(snapshot.pid).padEnd(8)}node ${snapshot.node}`,
  );
  lines.push(`  memory   rss ${snapshot.rssMb} MB, heap ${snapshot.heapUsedMb} MB`);
  if (snapshot.main !== null) lines.push(`  loop     ${loadLine(snapshot.main)}`);
  lines.push(
    `  rooms    ${snapshot.counts.total} live — ${snapshot.counts.waiting} waiting, ` +
      `${snapshot.counts.playing} playing, ${snapshot.counts.finished} finished` +
      `   (${snapshot.roomsCreated} created since start)`,
  );
  lines.push(`  seats    ${snapshot.humansOnline} human online, ${snapshot.bots} bot`);

  if (snapshot.shards !== undefined) {
    lines.push("");
    lines.push(
      `  ${"SHARD".padEnd(7)}${"STATE".padEnd(14)}${"ROOMS w/p/f".padEnd(13)}${"BUSY".padEnd(6)}` +
        `${"DELAY p50/p99".padEnd(16)}${"HEAP".padEnd(8)}BOT p99`,
    );
    for (const shard of snapshot.shards) {
      const state =
        shard.state === "failed"
          ? "crash-looped"
          : shard.state !== "up"
            ? shard.state
            : !shard.responsive
              ? "unresponsive"
              : "up";
      const restarts = shard.restarts > 0 ? ` (${shard.restarts}x)` : "";
      const c = shard.counts;
      const load = shard.load;
      lines.push(
        `  ${String(shard.index).padEnd(7)}${`${state}${restarts}`.padEnd(14)}` +
          `${`${c.waiting}/${c.playing}/${c.finished}`.padEnd(13)}` +
          `${(load === null ? "—" : `${Math.round(load.elu * 100)}%`).padEnd(6)}` +
          `${(load === null ? "—" : `${load.delayP50Ms}/${load.delayP99Ms} ms`).padEnd(16)}` +
          `${(load === null ? "—" : `${load.heapUsedMb} MB`).padEnd(8)}` +
          `${load?.botDecisionP99Ms === null || load === null ? "—" : `${load.botDecisionP99Ms} ms`}`,
      );
    }
  }

  if (snapshot.rooms.length === 0) {
    lines.push("");
    lines.push("  no rooms");
    return `${lines.join("\n")}\n`;
  }

  lines.push("");
  lines.push(
    `  ${"ROOM".padEnd(7)}${"STAGE".padEnd(10)}${"SEATS".padEnd(26)}` +
      `${"TURN".padEnd(7)}${"STEP".padEnd(18)}IDLE`,
  );
  for (const room of snapshot.rooms) {
    const seats = room.seats
      .map((s) => {
        if (s.isBot) return "bot";
        if (!s.claimed) return "open";
        return `${s.displayName ?? s.player}${s.online ? "" : "*"}`;
      })
      .join(",");
    const turn = room.turn === null ? "—" : `T${room.turn}`;
    const step = room.winner !== null ? `won by ${room.winner}` : (room.step ?? "—");
    lines.push(
      `  ${room.id.padEnd(7)}${room.stage.padEnd(10)}${seats.slice(0, 25).padEnd(26)}` +
        `${turn.padEnd(7)}${step.padEnd(18)}${duration(room.idleMs)}`,
    );
  }
  lines.push("");
  lines.push("  a * after a name means that seat is claimed but currently disconnected");
  return `${lines.join("\n")}\n`;
}

/**
 * Start the operator endpoint. Always bound to loopback — see the note at the
 * top of this file for why that is load-bearing rather than cautious. Measures
 * this thread's own load from now on, for the snapshot's `main`.
 *
 * - `GET /`        the table above, as text
 * - `GET /status`  the same
 * - `GET /status.json`  the snapshot, for scripting
 * - `GET /healthz` `ok`, for a monitor that only wants a 200
 */
export function startStatusServer(
  source: StatusSource,
  port: number,
  /** This thread's bot decision times, when it runs the rooms itself. */
  decisions?: RecordableHistogram,
): Server {
  const monitor = new LoadMonitor(decisions !== undefined ? { decisions } : {});
  const snapshot = async (): Promise<StatusSnapshot> => assembleStatus(await source(), monitor.read());
  const server = createServer((req, res) => {
    const url = (req.url ?? "/").split("?")[0];
    if (url === "/healthz") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("ok\n");
      return;
    }
    if (url === "/status.json" || url === "/" || url === "/status") {
      snapshot().then(
        (snap) => {
          if (url === "/status.json") {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(`${JSON.stringify(snap, null, 2)}\n`);
          } else {
            res.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
            res.end(renderStatus(snap));
          }
        },
        (err: unknown) => {
          res.writeHead(500, { "content-type": "text/plain" });
          res.end(`status failed: ${err instanceof Error ? err.message : String(err)}\n`);
        },
      );
      return;
    }
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not found\n");
  });
  server.once("close", () => monitor.stop());
  server.listen(port, "127.0.0.1");
  return server;
}
