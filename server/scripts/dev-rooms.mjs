// A room server preloaded with known board states, for checking client
// changes in a browser without playing a game up to the position under test.
//
//   npm run build -w engine && npm run dev-rooms -w server
//   npm run dev -w client        # then open http://localhost:5173/?room=FOURP
//
// Serves every scenario in scripts/dev-scenarios.mjs as a room on
// ws://localhost:4000 (or $PORT), in place of the real server, and takes
// commands on a loopback-only HTTP port, 4099 (or $CONTROL_PORT):
//
//   curl -s localhost:4099 -d '{"op":"list"}'
//   curl -s localhost:4099 -d '{"op":"state","room":"FOURP"}'
//   curl -s localhost:4099 -d '{"op":"reset","room":"FOURP"}'
//   curl -s localhost:4099 -d '{"op":"spawn","room":"FOURP","player":"alice","cards":["Serra Angel"]}'
//   curl -s localhost:4099 -d '{"op":"move","room":"FOURP","names":["Serra Angel"],"to":"graveyard"}'
//   curl -s localhost:4099 -d '{"op":"life","room":"FOURP","player":"dave","value":5}'
//   curl -s localhost:4099 -d '{"op":"objects","room":"TREES","names":["Warrior Token"]}'
//   curl -s localhost:4099 -d '{"op":"eval","room":"FOURP","js":"return game.state.turn"}'
//
// Every command that changes a room pushes the result to its browsers at
// once. Changes go straight into the game the way `Game.debugSpawn` does, so
// anything they trigger (a creature leaving under Vela, say) waits for the
// next priority window like any other trigger. `reset` is the clean way
// back: it rebuilds the room from its scenario and drops every connection,
// and each tab reconnects and reclaims its seat by itself.
//
// Rooms pace their bots the way the real server does (realtime, one move per
// frame shown), so animations and the ack gate behave as they do in play.
//
// `--shards N` (or $DEV_ROOMS_SHARDS) runs the rooms on N worker threads as
// the real server's `--shards` does (`docs/plans/room-shards.md`): the boards
// and the ops are `dev-rooms-shard.mjs`, run in each shard (the scenarios
// dealt out among them); this thread keeps the sockets and the command port,
// fans `list` out to every shard and sends every other op to the shard that
// holds its room — `eval` runs there. 0, the default, runs everything here.

import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { COMPRESSION, attachTransport } from "../dist/transport.js";

const PORT = Number(process.env.PORT ?? 4000);
const CONTROL_PORT = Number(process.env.CONTROL_PORT ?? 4099);
const shardsAt = process.argv.indexOf("--shards");
const SHARDS = Number((shardsAt >= 0 ? process.argv[shardsAt + 1] : undefined) ?? process.env.DEV_ROOMS_SHARDS ?? 0);
if (!Number.isInteger(SHARDS) || SHARDS < 0) throw new Error(`--shards needs a whole number, 0 or more (got ${SHARDS})`);
const SETUP = new URL("./dev-rooms-shard.mjs", import.meta.url);

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer, perMessageDeflate: COMPRESSION });

/**
 * One command, wherever its room is: `{ ok, result | error, dropConnections }`.
 * `list` asks every shard and merges the answers.
 */
let command;

if (SHARDS === 0) {
  // Everything on this thread, as dev-rooms always ran.
  const { createDefaultRegistry } = await import("engine");
  const { RoomManager } = await import("../dist/room-manager.js");
  const { DEFAULT_CAPTURE_DIR } = await import("../dist/capture.js");
  const { InProcessRoomHost } = await import("../dist/in-process-host.js");
  const { setup } = await import(SETUP.href);
  const registry = createDefaultRegistry();
  // A developer's server: bot decisions are always kept for saving as
  // training scenarios (`src/capture.ts`), in any room created here too.
  const manager = new RoomManager({ capture: { dir: DEFAULT_CAPTURE_DIR, registry } });
  const rooms = setup({ manager, registry, index: 0, count: 1 });
  // A developer's server: the scenario builder is on too.
  attachTransport(wss, new InProcessRoomHost(manager, { builder: true }));
  command = async (cmd) => {
    try {
      const out = rooms.control(cmd);
      return { ok: true, result: out.result, dropConnections: out.dropConnections === true };
    } catch (err) {
      return { ok: false, error: String(err?.message ?? err) };
    }
  };
} else {
  const { WorkerRoomHost, workerChannel } = await import("../dist/worker-host.js");
  const started = Date.now();
  const host = new WorkerRoomHost({
    shards: SHARDS,
    // `capture.dir` empty: `capture.ts`'s `DEFAULT_CAPTURE_DIR`.
    config: { builder: true, capture: { dir: "" }, loadReportMs: 1_000, setup: SETUP.href },
    spawn: (config) => workerChannel(config),
  });
  await host.start();
  console.log(`${SHARDS} room shard(s) ready in ${((Date.now() - started) / 1000).toFixed(1)} s`);
  attachTransport(wss, host);
  const unpack = (reply) =>
    reply.ok
      ? { ok: true, result: JSON.parse(reply.json), dropConnections: reply.dropConnections === true }
      : { ok: false, error: JSON.parse(reply.json).error };
  command = async (cmd) => {
    if (cmd.op === "list") {
      const up = host.phases().flatMap((phase, index) => (phase === "up" ? [index] : []));
      const replies = await Promise.all(up.map((index) => host.control(index, cmd)));
      const failed = replies.find((r) => !r.ok);
      if (failed !== undefined) return unpack(failed);
      return { ok: true, result: Object.assign({}, ...replies.map((r) => JSON.parse(r.json))) };
    }
    const shard = host.shardOf(cmd.room);
    if (shard === undefined) return { ok: false, error: `no room "${cmd.room}"` };
    return unpack(await host.control(shard, cmd));
  };
}

// ---- the control port --------------------------------------------------

createServer((req, res) => {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    res.setHeader("Content-Type", "application/json");
    let cmd;
    try {
      cmd = body ? JSON.parse(body) : { op: "list" };
    } catch (err) {
      res.statusCode = 400;
      res.end(`${JSON.stringify({ error: String(err?.message ?? err) })}\n`);
      return;
    }
    const out = await command(cmd);
    if (!out.ok) {
      res.statusCode = 400;
      res.end(`${JSON.stringify({ error: out.error })}\n`);
      return;
    }
    if (out.dropConnections) for (const client of wss.clients) client.close();
    res.end(`${JSON.stringify(out.result ?? null, null, 2)}\n`);
  });
}).listen(CONTROL_PORT, "127.0.0.1");

httpServer.listen(PORT, async () => {
  console.log(`dev rooms on ws://localhost:${PORT}, commands on http://127.0.0.1:${CONTROL_PORT}`);
  const listed = await command({ op: "list" });
  for (const [code, info] of Object.entries(listed.result ?? {})) {
    console.log(`  ${code}  ${info.url}\n         ${info.about}`);
  }
});
