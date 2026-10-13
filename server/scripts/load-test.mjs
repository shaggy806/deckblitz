// Load test for a running room server: ramps up four-seat games with every seat
// played by the server's bot (the human seat handed over with `bot-takeover`),
// acks each frame after an animation-like delay as a browser would, and times a
// cheap request (spectating an unknown room) every 500 ms — its round trip is
// the network plus however long the server's event loop was busy.
//
//   node server/scripts/load-test.mjs [url] [stages] [stageSeconds] [ackDelayMs]
//   node server/scripts/load-test.mjs ws://localhost:4000 1,2,4 60 600
//   node server/scripts/load-test.mjs wss://ws.deckblitz.net 1,2,4,6,8,12,16 75 600
//
// Against the live site only when nobody is playing (check `/status` first): it
// spends the box's CPU and burst credits. Stops ramping once the probe's p95
// passes 3 s; at the end pauses every room's bots (`set-bots-paused`) so nothing
// plays on after it leaves, and the idle reaper drops the rooms 30 minutes later.
// Everything comes from one IP, so the per-IP rate limit (40 messages per 5 s,
// acks exempt) sets how fast rooms are opened. Results: docs/plans/scaling-rooms.md.

import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import WebSocket from "ws";

const url = process.argv[2] ?? "ws://localhost:4000";
const stages = (process.argv[3] ?? "1,2,4").split(",").map(Number);
const stageSeconds = Number(process.argv[4] ?? 60);
const ackDelay = Number(process.argv[5] ?? 600);
// The live server only takes sockets from the site's own origin.
const origin = url.includes("deckblitz.net") ? "https://deckblitz.net" : undefined;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const now = () => performance.now();
const t0 = now();
const log = (...a) => console.log(`[${((now() - t0) / 1000).toFixed(0).padStart(4)}s]`, ...a);

const rooms = [];
let errors = [];

/** Opens one room, starts its game and hands the human seat to a bot;
 * resolves on the game's first frame. */
function openRoom(index) {
  return new Promise((resolve) => {
    const ws = new WebSocket(url, { perMessageDeflate: true, ...(origin ? { origin } : {}) });
    const hostToken = randomUUID();
    const room = { index, ws, id: null, frames: [], bytes: 0, started: false, ended: false };
    rooms.push(room);
    const send = (m) => ws.send(JSON.stringify(m));
    ws.on("open", () => send({ type: "create-room", players: 4, hostToken }));
    ws.on("error", (e) => errors.push(`room ${index}: ${e.message}`));
    ws.on("message", async (data) => {
      const raw = data.toString();
      const m = JSON.parse(raw);
      if (m.type === "error") {
        errors.push(`room ${index}: ${m.message}`);
        return;
      }
      if (m.type === "room-created") {
        room.id = m.roomId;
        send({ type: "join-room", roomId: room.id, hostToken });
        send({ type: "claim-seat", roomId: room.id, seat: "alice", clientToken: randomUUID(), displayName: `load${index}`, ready: true });
        for (const seat of ["bob", "carol", "dave"]) send({ type: "add-bot", roomId: room.id, seat });
        await sleep(300);
        send({ type: "start-game", roomId: room.id });
        return;
      }
      if (m.type !== "state") return;
      room.bytes += raw.length;
      room.frames.push(now());
      const alive = Object.values(m.view?.players ?? {}).filter((p) => p && !p.hasLost);
      if (m.view && alive.length === 1 && !room.ended) {
        room.ended = true;
        log(`room ${index} game over`);
      }
      if (!room.started) {
        room.started = true;
        send({ type: "bot-takeover", roomId: room.id, on: true });
        resolve(room);
      }
      const seq = m.seq;
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) send({ type: "ack", roomId: room.id, seq });
      }, ackDelay);
    });
  });
}

const probe = new WebSocket(url, origin ? { origin } : {});
probe.on("error", (e) => {
  console.error("probe connection failed:", e.message);
  process.exit(1);
});
const probes = [];
let probeSent = null;
probe.on("message", () => {
  if (probeSent === null) return;
  probes.push([now(), now() - probeSent]);
  probeSent = null;
});
await new Promise((resolve) => probe.on("open", resolve));
const probeTimer = setInterval(() => {
  if (probeSent !== null && now() - probeSent < 5000) return;
  probeSent = now();
  probe.send(JSON.stringify({ type: "spectate-room", roomId: "ZZZZZ" }));
}, 500);

const pct = (xs, p) => {
  if (xs.length === 0) return NaN;
  const sorted = [...xs].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
};
const results = [];
for (const target of stages) {
  while (rooms.length < target) {
    await Promise.race([openRoom(rooms.length), sleep(15_000)]);
    await sleep(2500);
  }
  log(`stage: ${target} rooms running`);
  const from = now();
  const bytesBefore = rooms.reduce((a, r) => a + r.bytes, 0);
  await sleep(stageSeconds * 1000);
  const to = now();
  const rtt = probes.filter(([t]) => t >= from && t < to).map(([, d]) => d);
  const gaps = [];
  let frames = 0;
  for (const r of rooms) {
    const inStage = r.frames.filter((t) => t >= from && t < to);
    frames += inStage.length;
    for (let i = 1; i < inStage.length; i += 1) gaps.push(inStage[i] - inStage[i - 1]);
  }
  const row = {
    rooms: target,
    activeGames: rooms.filter((r) => !r.ended).length,
    framesPerSec: +(frames / ((to - from) / 1000)).toFixed(2),
    gapMedianMs: Math.round(pct(gaps, 50)),
    gapP90Ms: Math.round(pct(gaps, 90)),
    probeP50Ms: Math.round(pct(rtt, 50)),
    probeP95Ms: Math.round(pct(rtt, 95)),
    probeMaxMs: Math.round(Math.max(...rtt)),
    probes: rtt.length,
    kbPerSec: Math.round((rooms.reduce((a, r) => a + r.bytes, 0) - bytesBefore) / 1024 / ((to - from) / 1000)),
    errors: errors.length,
  };
  results.push(row);
  log(JSON.stringify(row));
  if (errors.length > 0) {
    log("errors:", [...new Set(errors)].slice(0, 5).join(" | "));
    errors = [];
  }
  if (row.probeP95Ms > 3000 || row.gapMedianMs > 6000) {
    log("saturated — stopping the ramp");
    break;
  }
}

clearInterval(probeTimer);
for (const r of rooms) {
  if (r.id !== null && r.ws.readyState === WebSocket.OPEN) {
    r.ws.send(JSON.stringify({ type: "set-bots-paused", roomId: r.id, paused: true }));
  }
}
await sleep(1500);
for (const r of rooms) r.ws.close();
probe.close();
console.log(`RESULTS ${JSON.stringify(results)}`);
console.log(`ROOMS ${rooms.map((r) => r.id).join(",")}`);
