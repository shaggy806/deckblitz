/**
 * Real worker threads: two shards running the built `dist/shard-worker.js`,
 * a game played on one over a WebSocket, `/status` from both, and `stop()`.
 * Vitest can't load TypeScript in a worker, so this runs what `tsc` built
 * last — and is skipped when that's older than the sources (CI and `npm run
 * verify` build first).
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { WebSocket, WebSocketServer } from "ws";
import type { ServerMessage } from "protocol";
import { ALICE, BOB } from "../decks.js";
import { COMPRESSION, attachTransport } from "../transport.js";
import { WorkerRoomHost, workerChannel } from "../worker-host.js";

const SRC = new URL("../", import.meta.url);
const WORKER = new URL("../../dist/shard-worker.js", import.meta.url);

/** Whether `dist/` was built from the sources as they are now. */
function distIsFresh(): boolean {
  if (!existsSync(WORKER)) return false;
  const built = statSync(WORKER).mtimeMs;
  return readdirSync(SRC).every((f) => !f.endsWith(".ts") || statSync(new URL(f, SRC)).mtimeMs <= built);
}

describe.skipIf(!distIsFresh())("rooms on real worker threads (dist)", () => {
  let host: WorkerRoomHost | null = null;
  let wss: WebSocketServer | null = null;

  afterEach(async () => {
    const server = wss;
    wss = null;
    if (server !== null) await new Promise<void>((resolve) => server.close(() => resolve()));
    await host?.stop();
    host = null;
  });

  it("plays a game on a shard, reports both, and stops", async () => {
    host = new WorkerRoomHost({
      shards: 2,
      config: { builder: false, capture: null, loadReportMs: 200 },
      spawn: (config) => workerChannel(config, WORKER),
    });
    await host.start();
    const server = new WebSocketServer({ port: 0, perMessageDeflate: COMPRESSION });
    wss = server;
    attachTransport(server, host);
    await new Promise<void>((resolve) => server.once("listening", resolve));

    const ws = new WebSocket(`ws://127.0.0.1:${(server.address() as AddressInfo).port}`);
    await new Promise<void>((resolve, reject) => {
      ws.once("open", () => resolve());
      ws.once("error", reject);
    });
    const states: Extract<ServerMessage, { type: "state" }>[] = [];
    let roomId = "";
    let binary = false;
    const enough = new Promise<void>((resolve) => {
      ws.on("message", (raw: Buffer, isBinary: boolean) => {
        binary ||= isBinary;
        const m = JSON.parse(raw.toString()) as ServerMessage;
        if (m.type === "room-created") {
          roomId = m.roomId;
          const send = (x: object) => ws.send(JSON.stringify({ ...x, roomId }));
          send({ type: "join-room", hostToken: "h" });
          send({ type: "claim-seat", seat: ALICE, clientToken: "a", ready: true });
          send({ type: "add-bot", seat: BOB });
          send({ type: "set-bot-speed", speed: "fast" });
          send({ type: "start-game" });
          send({ type: "bot-takeover", on: true });
        }
        if (m.type !== "state") return;
        states.push(m);
        ws.send(JSON.stringify({ type: "ack", roomId, seq: m.seq }));
        if (states.length >= 5) resolve();
      });
    });
    ws.send(JSON.stringify({ type: "create-room", hostToken: "h" }));
    await enough;
    expect(binary).toBe(false);
    // Shard 0 runs the deck importer, so the first room goes to shard 1.
    expect(host.shardOf(roomId)).toBe(1);

    const parts = await host.status();
    expect(parts.rooms.map((r) => r.id)).toEqual([roomId]);
    expect(parts.shards?.map((s) => [s.up, s.responsive])).toEqual([
      [true, true],
      [true, true],
    ]);
    // Each worker's own heap, holding its own engine.
    expect(parts.shards?.[1].load?.heapUsedMb).toBeGreaterThan(20);
    ws.close();
  }, 120_000);

  it("a worker that crashes ends alone, its sockets closed 1011, and is restarted", async () => {
    host = new WorkerRoomHost({
      shards: 2,
      config: { builder: false, capture: null, loadReportMs: 200, testHooks: true },
      spawn: (config) => workerChannel(config, WORKER, 1024),
      restart: { baseMs: 100 },
    });
    await host.start();
    const server = new WebSocketServer({ port: 0 });
    wss = server;
    attachTransport(server, host);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const url = `ws://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const open = async (): Promise<{ ws: WebSocket; created: Promise<string>; closed: Promise<number> }> => {
      const ws = new WebSocket(url);
      await new Promise<void>((resolve, reject) => {
        ws.once("open", () => resolve());
        ws.once("error", reject);
      });
      const created = new Promise<string>((resolve) =>
        ws.on("message", (raw: Buffer) => {
          const m = JSON.parse(raw.toString()) as ServerMessage;
          if (m.type === "room-created") resolve(m.roomId);
        }),
      );
      return { ws, created, closed: new Promise((resolve) => ws.once("close", (code) => resolve(code))) };
    };
    const doomed = await open();
    doomed.ws.send(JSON.stringify({ type: "create-room" }));
    const lost = await doomed.created;
    const other = await open();
    other.ws.send(JSON.stringify({ type: "create-room" }));
    const kept = await other.created;
    expect([host.shardOf(lost), host.shardOf(kept)]).toEqual([1, 0]);

    doomed.ws.send(JSON.stringify({ type: "__crash", roomId: lost }));
    expect(await doomed.closed).toBe(1011);
    expect(host.shardOf(lost)).toBeUndefined();
    expect(host.shardOf(kept)).toBe(0);
    // Back after its backoff and a fresh start-up.
    const deadline = Date.now() + 60_000;
    while (host.phases()[1] !== "up" && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 100));
    const parts = await host.status();
    expect(parts.shards?.map((s) => [s.state, s.restarts])).toEqual([
      ["up", 0],
      ["up", 1],
    ]);
    expect(parts.rooms.map((r) => r.id)).toEqual([kept]);
    other.ws.close();
  }, 120_000);
});
