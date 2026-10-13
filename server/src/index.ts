import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { createDefaultRegistry } from "engine";
import { RoomManager } from "./room-manager.js";
import { COMPRESSION, attachRoomServer } from "./ws-server.js";
import { importDeps } from "./import-deck.js";
import { handleImportRoute } from "./import-route.js";
import { startStatusServer } from "./status-server.js";
import { CAPTURE_KEEP, DEFAULT_CAPTURE_DIR } from "./capture.js";

const port = Number(process.env.PORT ?? 4000);
// "*" is fine for local/LAN dev; set CLIENT_ORIGIN to the real site once
// this is reachable from the open internet so a stranger's page can't drive
// this endpoint against a browser that happens to have it open.
const clientOrigin = process.env.CLIENT_ORIGIN ?? "*";
const registry = createDefaultRegistry();
// `--capture`: keep bots' recent decisions so a blunder can be saved as a
// training scenario (`capture.ts`). The local `dev` script passes it; the
// production service runs `node dist/index.js` without it, and must — a
// capture is the whole game, every hand included.
const capture = process.argv.includes("--capture");
// `--capture-keep N`: how many decisions each room keeps (`CAPTURE_KEEP`
// otherwise). Each is a whole game state, ~0.4 MB late in a four-player game.
const keepArg = process.argv.indexOf("--capture-keep");
const keep = keepArg >= 0 ? Number(process.argv[keepArg + 1]) : CAPTURE_KEEP;
if (!Number.isInteger(keep) || keep < 1) throw new Error("--capture-keep needs a whole number of decisions, at least 1");
const manager = new RoomManager(capture ? { capture: { dir: DEFAULT_CAPTURE_DIR, registry, keep } } : {});
if (capture) console.log(`capturing bot decisions to ${DEFAULT_CAPTURE_DIR}, the last ${keep} per room`);
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

const httpServer = createServer((req, res) => {
  // `POST /import-deck`: the job runs wherever the host keeps the card pool.
  if (handleImportRoute(req, res, (text, sink) => host.importDeck(text, sink), clientOrigin)) return;
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: httpServer, perMessageDeflate: COMPRESSION });
const host = attachRoomServer(wss, manager, {
  builder,
  reapIdleMs: IDLE_ROOM_MS,
  reapIntervalMs: REAP_INTERVAL_MS,
  importDeps: importDeps(registry),
});
startStatusServer(() => host.status(), statusPort, host.decisions);

httpServer.listen(port, () => {
  console.log(`MTG Deck Blitz room server listening on ws://localhost:${port}`);
  console.log(`status (loopback only): curl localhost:${statusPort}/status`);
});
