/**
 * The room server: sockets on `PORT` (4000), the operator status page on
 * loopback `STATUS_PORT` (4010), `POST /import-deck`.
 *
 * `--shards N` (or `SHARDS`) runs the rooms on N worker threads
 * (`worker-host.ts`, `docs/plans/room-shards.md`); this thread then keeps
 * only the sockets, routes and HTTP, and imports no engine. `0`, the
 * default for now, runs them on this thread as the server always has — that
 * path is loaded only when asked for.
 */

import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { WebSocketServer } from "ws";
import { handleImportRoute } from "./import-route.js";
import type { RoomHost } from "./room-host.js";
import type { ShardSettings } from "./worker-host.js";
import { WorkerRoomHost, workerChannel } from "./worker-host.js";
import { startStatusServer } from "./status-server.js";
import { COMPRESSION, attachTransport } from "./transport.js";

const port = Number(process.env.PORT ?? 4000);
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

const settings: ShardSettings = {
  builder,
  capture: capture ? { dir: captureDir, ...(keep !== undefined ? { keep } : {}) } : null,
  reapIdleMs: IDLE_ROOM_MS,
  reapIntervalMs: REAP_INTERVAL_MS,
  loadReportMs: 1_000,
};

let host: RoomHost;
if (shards === 0) {
  const { createInProcessHost } = await import("./in-process-host.js");
  host = createInProcessHost(settings);
} else {
  const started = Date.now();
  const workers = new WorkerRoomHost({ shards, config: settings, spawn: (config) => workerChannel(config) });
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
  console.log(`MTG Deck Blitz room server listening on ws://localhost:${port}`);
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
