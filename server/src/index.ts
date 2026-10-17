/**
 * The room server: sockets on `PORT` (4000), the operator status page on
 * loopback `STATUS_PORT` (4010), `POST /import-deck`.
 *
 * `--shards N` (or `SHARDS`) runs the rooms on N worker threads
 * (`worker-host.ts`, `docs/plans/room-shards.md`); this thread then keeps
 * only the sockets, routes and HTTP, and imports no engine. `0`, the
 * default, runs them on this thread as the server always has — that path is
 * loaded only when asked for. A production box says how many explicitly
 * (`SHARDS=1` in the systemd unit on the 2-vCPU box: one per core, less one
 * for main — `DEPLOYMENT.md`), so a script, a test or a dev server never
 * starts workers it didn't ask for.
 */

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import type { AdmissionLimits } from "./admission.js";
import { handleImportRoute } from "./import-route.js";
import type { RoomHost } from "./room-host.js";
import type { ShardSettings } from "./worker-host.js";
import { WorkerRoomHost, workerChannel } from "./worker-host.js";
import { startStatusServer } from "./status-server.js";
import { COMPRESSION, attachTransport } from "./transport.js";

const port = Number(process.env.PORT ?? 4000);

/**
 * A shard's heap cap unless `--shard-heap-mb` says otherwise. Uncapped, V8
 * lets a shard's heap grow to ~600 MB with four rooms before collecting much
 * (dev PC, 2026-10-13). A 384 MB cap held eight rooms on one shard at ~220
 * MB used with no cost in frames, delay or busy-ness, and took the
 * two-shard run's rss from 1.5 GB to 0.85 GB; 256 MB doubled the shards'
 * busy share (GC). 512 leaves twice the eight-room heap for a one-shard box
 * that puts every room on its one shard.
 */
const DEFAULT_SHARD_HEAP_MB = 512;
// "*" is fine for local/LAN dev; set CLIENT_ORIGIN to the real site once
// this is reachable from the open internet so a stranger's page can't drive
// this endpoint against a browser that happens to have it open.
const clientOrigin = process.env.CLIENT_ORIGIN ?? "*";

const argAfter = (flag: string): string | undefined => {
  const at = process.argv.indexOf(flag);
  return at >= 0 ? process.argv[at + 1] : undefined;
};

// `--shards N`: how many worker threads run the rooms; 0 runs them here.
const shardsArg = argAfter("--shards") ?? process.env.SHARDS ?? "0";
const shards = Number(shardsArg);
if (!Number.isInteger(shards) || shards < 0) throw new Error(`--shards needs a whole number, 0 or more (got ${shardsArg})`);

// `--shard-heap-mb N` (or `SHARD_HEAP_MB`): each shard's old-generation heap
// cap (`resourceLimits.maxOldGenerationSizeMb`), so a shard that runs out of
// memory ends alone — and is restarted — rather than taking the process and
// every other shard's rooms with it. 0 leaves V8's own limit.
const heapArg = argAfter("--shard-heap-mb") ?? process.env.SHARD_HEAP_MB ?? String(DEFAULT_SHARD_HEAP_MB);
const heapMb = Number(heapArg);
if (!Number.isInteger(heapMb) || heapMb < 0) throw new Error(`--shard-heap-mb needs a whole number of MB, 0 for none (got ${heapArg})`);
const shardHeapMb = heapMb === 0 ? undefined : heapMb;

// `--capture`: keep bots' recent decisions so a blunder can be saved as a
// training scenario (`capture.ts`). The local `dev` script passes it; the
// production service runs `node dist/index.js` without it, and must — a
// capture is the whole game, every hand included.
const capture = process.argv.includes("--capture");
// `--capture-keep N`: how many decisions each room keeps (`CAPTURE_KEEP`
// otherwise). Each is a whole game state, ~0.4 MB late in a four-player game.
const keepArg = argAfter("--capture-keep");
const keep = keepArg === undefined ? undefined : Number(keepArg);
if (keep !== undefined && (!Number.isInteger(keep) || keep < 1)) {
  throw new Error("--capture-keep needs a whole number of decisions, at least 1");
}
// `captures/` at the repo root — `capture.ts`'s `DEFAULT_CAPTURE_DIR`, worked
// out here too so this thread needn't load the engine to say where.
const captureDir = fileURLToPath(new URL("../../captures/", import.meta.url));
if (capture) console.log(`capturing bot decisions to ${captureDir}, the last ${keep ?? "200"} per room`);
// `--builder`: the scenario builder (`builder.ts`), which lets a client put
// any card anywhere — a developer's server only, never the public site.
const builder = process.argv.includes("--builder");
if (builder) console.log("scenario builder on");
// `--long-bot-thinking`: a room's host may let its bots think for up to a
// second a decision (`set-bot-think-long`). A developer's server only: on a
// shared one a bot's thinking holds up every room on its thread.
const longBotThinking = process.argv.includes("--long-bot-thinking");
if (longBotThinking) console.log("long bot thinking allowed");

// An operator endpoint for `curl` over SSH, bound to loopback on a port the
// Cloudflare tunnel does not forward. It carries room codes, which are join
// credentials, so it must never share the public port — and a loopback *check*
// on that port would be worthless anyway, since `cloudflared` makes every
// public request arrive from 127.0.0.1. See `status-server.ts`.
const statusPort = Number(process.env.STATUS_PORT ?? 4010);

// A room with nobody connected goes once it's been idle this long, checked
// this often — by the room service, which owns the rooms.
const IDLE_ROOM_MS = 30 * 60 * 1000;
const REAP_INTERVAL_MS = 15 * 60 * 1000;

// The caps on opening rooms (`admission.ts`), in both modes. Only a create
// is ever refused. `--max-rooms-per-shard M` (or `MAX_ROOMS_PER_SHARD`):
// weighted rooms a shard holds — a lobby or a game 1, a tutorial 0.5, a
// finished game 0.1 — before it takes no more; a create is refused only
// when every shard is that full. Unlimited unless set (the load test's knee
// on the box decides it). `--max-rooms-per-ip N` (or `MAX_ROOMS_PER_IP`,
// default 6): waiting and playing rooms one address may have opened at once;
// the box itself (loopback, no `CF-Connecting-IP`) is exempt. `Infinity`
// turns either off.
const limitArg = (flag: string, env: string, fallback: number): number => {
  const raw = argAfter(flag) ?? process.env[env];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!(value > 0)) throw new Error(`${flag} needs a number above 0, or Infinity (got ${raw})`);
  return value;
};
const admission: AdmissionLimits = {
  maxRoomsPerShard: limitArg("--max-rooms-per-shard", "MAX_ROOMS_PER_SHARD", Infinity),
  maxRoomsPerIp: limitArg("--max-rooms-per-ip", "MAX_ROOMS_PER_IP", 6),
};

const settings: ShardSettings = {
  builder,
  ...(longBotThinking ? { longBotThinking: true } : {}),
  capture: capture ? { dir: captureDir, ...(keep !== undefined ? { keep } : {}) } : null,
  reapIdleMs: IDLE_ROOM_MS,
  reapIntervalMs: REAP_INTERVAL_MS,
  loadReportMs: 1_000,
};

let host: RoomHost;
if (shards === 0) {
  const { createInProcessHost } = await import("./in-process-host.js");
  host = createInProcessHost(settings, admission);
} else {
  const started = Date.now();
  const workers = new WorkerRoomHost({
    shards,
    config: settings,
    admission,
    spawn: (config) => workerChannel(config, undefined, shardHeapMb),
  });
  await workers.start();
  console.log(`${shards} room shard(s) ready in ${((Date.now() - started) / 1000).toFixed(1)} s`);
  host = workers;
}

const httpServer = createServer((req, res) => {
  // `POST /import-deck`: the job runs wherever the host keeps the card pool.
  if (handleImportRoute(req, res, (text, sink) => host.importDeck(text, sink), clientOrigin)) return;
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: httpServer, perMessageDeflate: COMPRESSION });
attachTransport(wss, host);
const statusServer = startStatusServer(() => host.status(), statusPort, host.decisions);

httpServer.listen(port, () => {
  console.log(`Deck Blitz room server listening on ws://localhost:${port}`);
  console.log(`status (loopback only): curl localhost:${statusPort}/status`);
});

// Stop taking connections, let the rooms' host stop (a shard is given two
// seconds, then terminated), and exit.
let stopping = false;
const shutdown = (signal: string): void => {
  if (stopping) return;
  stopping = true;
  console.log(`${signal}: shutting down`);
  httpServer.close();
  statusServer.close();
  for (const client of wss.clients) client.terminate();
  void host.stop().finally(() => process.exit(0));
};
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
