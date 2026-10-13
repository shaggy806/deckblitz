# Rooms on worker threads (room shards)

Status: **designed** (2026-10-13), not built — phase 2 of `scaling-rooms.md`. The design came
from reading the server at fa031303; file:line references are from then. Build it in the order
of "Rollout" below, each commit green on its own.

## Why

Every room's game, bots (v2, up to 300 ms a decision), views and stringify run on the one main
thread; the live box tops out near 4-5 bot moves a second for the whole server, around 12
all-bot rooms (`scaling-rooms.md`). A bigger box only helps once rooms run on more than one
core.

## Shape

- **Main thread, no engine**: `transport.ts` (sockets, `clientIp` from `CF-Connecting-IP`, the
  per-IP rate limit with its `ack` exemption, connection ids), a `RoomHost` that routes, room-code
  allocation, placement and admission, the `/status` server (aggregating), the `/import-deck`
  HTTP side, SIGTERM and crash handling.
- **Shard core** `room-service.ts`: today's `ws-server.ts` handler switch, `broadcast`,
  spectators, art manifests and the per-connection bound room, over a `RoomManager`, unchanged in
  logic (`send(ws, …)` becomes `connection.send(…)`).
- **Two hosts**: `InProcessRoomHost` (`--shards 0`: tests, scripts, dev-rooms — calls a
  `RoomService` synchronously) and `WorkerRoomHost` (N workers; `shard-worker.ts` wraps
  `createShard()` from `shard.ts`; keeps the code → shard map, placement, admission, crash
  restart, status aggregation). `ws-server.ts` stays as a compatibility module:
  `attachRoomServer(wss, manager, opts)` = `attachTransport(wss, new InProcessRoomHost(…))`, so
  every existing test keeps working.

## The boundary

- **Main replies itself**: malformed messages, rate limiting, `no such room` (keeps code
  brute-forcing off the shards; an `ack` for an unknown room is dropped).
- **Main allocates a code, places the room, then forwards**: `create-room`, `tutorial-create`,
  `builder-create` (main checks `--builder` itself). The route is registered *before* forwarding,
  so the client's immediate burst (join, claim, add-bot, start) routes in order over one port.
  A refused create (unknown lesson) sends `error` plus a `gone` event, and main drops the route.
- **Forwarded by `roomId`**: every other room message, acks included. `spectate-room` first
  posts `unspectate` to a different shard the connection was watching on (replacing the global
  `stopSpectating`).
- **Connections**: main gives each socket a `ConnId` (incrementing, never reused) and records
  the shards it touched; on close it posts `close` to each, which runs today's close logic there.
  In a shard, one stable proxy `Connection` per `ConnId` (rooms compare connections by
  identity); `boundRoom` becomes a `Map<ConnId, Room | PendingRoom>`.
- **Rematch, builder rebuilds, tutorial swaps** are a new `Room` under the same code in the same
  manager, so they stay on their shard by construction.
- **Behaviour differences**: a connection bound in rooms on two shards is disconnected from both
  on close (today only the last-bound); art manifests become per shard, which fixes today's
  process-wide `sentArtManifest` never sending a second room's manifest to a connection.

## Main ↔ shard protocol (`server/src/shard-protocol.ts`, types only)

```ts
export type ConnId = number; export type ShardIndex = number;
export type RoomKind = "lobby" | "tutorial" | "builder" | "adopted";
export type RoomStage = "waiting" | "playing" | "finished";
export interface RoomEvent { readonly id: string; readonly kind: RoomKind; readonly stage: RoomStage | "gone" }
export interface ShardConfig { index; builder; capture: { dir; keep } | null; reapIdleMs; reapIntervalMs;
  loadReportMs; importJobs /* shard 0 only */; setup? /* dev-rooms module URL */; testHooks? }
export type ToShard =
  | { t: "msg"; conn: ConnId; raw: string; roomId?: string }   // roomId: the code main allocated (creates)
  | { t: "close"; conn: ConnId } | { t: "unspectate"; conn: ConnId }
  | { t: "status"; req: number } | { t: "import"; job: number; text: string }
  | { t: "control"; req: number; cmd: unknown } | { t: "stop" };
export interface Delivery { readonly conns: readonly ConnId[]; readonly data: Uint8Array } // one ServerMessage, UTF-8
export type FromShard =
  | { t: "ready"; rooms: readonly RoomEvent[] }
  | { t: "out"; deliveries: readonly Delivery[]; rooms: readonly RoomEvent[] } // one per tick, in order
  | { t: "load"; report: ShardLoad }                                           // every second
  | { t: "status"; req: number; rooms: readonly RoomSummary[]; roomsCreated: number; load: ShardLoad }
  | { t: "import"; job: number; kind: "line" | "reject" | "end"; text?: string }
  | { t: "control"; req: number; ok: boolean; json: string; dropConnections?: boolean };
```

- Main forwards the **raw text** (it parses only to route; `capture-report` can carry a 10 MB
  image). The shard batches one `out` per tick, encodes each payload with `TextEncoder` and
  transfers the buffer (not `Buffer.from`, whose pooled buffers can't be transferred); main sends
  it `{ binary: false }` — still a text frame, permessage-deflate still applies, and main never
  re-encodes. Spectators share one payload. In-process mode keeps `ws.send(JSON.stringify(m))`:
  the service's outbox is `send(conn, ServerMessage)` plus `roomChanged(RoomEvent)`.
- **Event slicing** (frames carrying only new events): the per-connection "last sent" state moves
  with `broadcast` into `RoomService`, keyed per room *and* connection — a rematch, a builder
  rebuild, a tutorial swap or retry, or a move to another room puts a different log under the same
  connection, and each must restart from the whole log.

## Routing and codes

- Main allocates every code (`room-code.ts`, `randomRoomId` moved from `room-manager.ts`), looping
  until unused in `routes: Map<code, { shard, kind, stage, ip }>`. No shard prefix: codes are join
  credentials, and a prefix costs entropy and shows the layout.
- `RoomManager`: `createPending/createBuilder/createTutorial(…, id?)` taking the allocated code;
  `adopt(room)` (dev-rooms stops reaching into `manager.rooms`); `onRoomAdded`/`onRoomRemoved`
  hooks. Reaping runs per shard on its own timer and emits `gone`; a message forwarded just before
  main hears it gets `no such room` from the shard.
- Stage events come from the service comparing a room's stage in `broadcast`/`broadcastPending`.
- dev-rooms' fixed codes reach main in `ready.rooms`; main doesn't listen until every shard is
  ready.

## Tests

- Existing suites stay as they are (in-process).
- `WorkerRoomHost` takes `spawn: (cfg) => ShardChannel` (`post`, `onMessage`, `onExit`,
  `terminate`): production `workerChannel` is a real `Worker`; tests use `loopbackChannel`, which
  runs `createShard` in-thread and delivers through `queueMicrotask` + `structuredClone` (real
  serialization on TS sources — vitest can't load TS in a worker).
- `ws-server-shards.test.ts` (2-shard loopback, ephemeral port): creates spread across shards; a
  two-device game end to end with acks and text frames; unknown code answered by main; spectating
  across shards; rematch, tutorial next/retry and builder rebuilds keep code, shard, seq and game
  numbering; close hands the host role on; reconnect by token; `hostToken` binding; `/status`
  aggregation; `/import-deck` via shard 0; compression; admission refusals; a simulated crash.
- `worker-smoke.test.ts`: real Workers on `dist/shard-worker.js`, 2 shards, a blitz, status,
  `stop()`; skipped when dist is older than src (CI and verify build first).
- A static test: main-side modules (`index.ts`, `transport.ts`, `worker-host.ts`, `room-host.ts`,
  `shard-protocol.ts`, `admission.ts`, `room-code.ts`, `status-server.ts`, `import-route.ts`)
  import no value from `engine` or the shard-side modules.
- `stop()` the host in `afterEach`, or vitest hangs on live workers.

## Must not break

- **Rate limit, `CF-Connecting-IP`**: main only, unchanged.
- **Compression**: `COMPRESSION` moves to `transport.ts` (re-exported). Deflate runs on libuv's
  threadpool (4 threads by default, process-wide): set `UV_THREADPOOL_SIZE` to the core count on a
  bigger box.
- **The ack gate**: an ack is a small post; main's own event-loop delay becomes part of the gate's
  latency — measure it.
- **Reconnect and host binding**: shard-side, unchanged (a reconnect is a new `ConnId`; a late
  close from the old socket is harmless, `disconnect` compares the connection object).
- **`/import-deck`** goes to shard 0 (`importJobs`): keeping it on main would load the engine
  there, and the Scryfall throttle and caches (`import-deck.ts`), the 38 MB Oracle snapshot
  (`card-data.ts`) and the tag index (`oracle-tags.ts`) must stay single copies (one per shard
  would multiply the Scryfall request rate). Factor `index.ts`'s handler into
  `runImportJob(text, deps, sink)` plus `import-route.ts`; a dead shard 0 mid-job writes an error
  line and ends the response; cap the body (~1 MB; today it's unbounded).
- **Capture and builder flags**: in `ShardConfig`; a worker builds its own capture registry.
- **Status (4010)**: `status.ts` splits into `roomSummaries(manager)` (shard) and
  `status-server.ts` (main: `assembleStatus`, `renderStatus`, `startStatusServer`), adding main's
  memory and event-loop delay and a per-shard table (up/restarts, rooms by stage, ELU, delay
  p50/p99, heap, bot decision p99); a shard that doesn't answer in 1 s shows "unresponsive".
- **Shutdown**: there's none today. Add SIGTERM/SIGINT: close HTTP, `host.stop()` (post `stop`,
  terminate after 2 s), exit. Phase 4's drain or snapshot hooks into `stop` later.
- **A worker crashing** (OOM, a throw outside `settle`'s catch — today either kills every room):
  drop its routes, close its connections with 1011 (clients reconnect and get `no such room`, a
  deploy restart's experience for 1/N of the rooms), restart it with backoff (1, 2, 4 … 30 s),
  mark it down after 5 crashes in 5 minutes, skip it in placement. Set
  `resourceLimits.maxOldGenerationSizeMb` so an OOM ends one shard.
- **dev-rooms (4099)**: scenario building and ops move to `scripts/dev-rooms-shard.mjs`
  (`setup({ manager, registry, index, count }) → { control(cmd) }`); `list` fans out, other ops
  route by code; `reset` returns `dropConnections`; `eval` runs in the owning worker. With
  `--shards 0` the module runs in-process.

## Memory (measured on the dev PC)

- Importing `engine` and building the registry in a fresh isolate: ~4 s, ~295 MB rss, ~150 MB
  heap used. Two workers added ~600 MB rss. The cost is the engine module graph (`BUILTIN_CARDS`,
  code), not the registry Map (~0.44 MB). Isolates can't share heaps.
- Estimate: ~200-250 MB per shard at steady state + ~15 MB per room; main without the engine
  ~50 MB. **On the 2 GB box that's one shard plus main**; a bigger box needs ~300 MB per core.
- Measure on the box: `--shards 0, 1, 2` idle 60 s (rss slope = per-shard cost), worker startup
  to `ready` (likely 10-15 s there), and `module.enableCompileCache()` in `shard-worker.ts`.
- Main needs no registry. Places that pull the engine onto main today and must change:
  `index.ts:3,17`, `ws-server.ts:10,15`, `pending-room.ts:51` (`REGISTRY` at import time),
  `status.ts:24-25`, `import-deck.ts:29`; `index.ts` loads the in-process path by dynamic
  `import()` only for `--shards 0`.
- Optional: one shared registry into `Game.create` and the bots (`game.ts:1071`,
  `eval-bot.ts:648`, `controller.ts:1837`) saves ~2 MB of a room's ~15.

## Placement and admission (`admission.ts`, pure)

- Weights: lobby and playing 1.0 (a lobby is a future game, so `start-game` is never refused),
  tutorial 0.5, finished 0.1, builder and adopted 0. A shard's cost = its rooms' weights plus
  creates in flight. Place on the lowest-cost up shard (ties: lower ELU, then index); skip a shard
  whose delay p99 > 250 ms unless all are; shard 0 carries +0.5 for imports.
- `--max-rooms-per-shard M` (weighted): a create is refused only when every up shard is full —
  "The server is full right now — try again in a minute." Joins, starts, rematches and tutorial
  steps are never refused. Library default ∞; the CLI default comes from the load test's knee.
- `--max-rooms-per-ip N` (the BACKLOG line): CLI default 6, library ∞; counts waiting and playing
  rooms the IP created across all three create kinds — "You have too many rooms open — finish or
  leave one first." Loopback without a CF header is exempt (only the box itself reaches 4000
  without the tunnel). Optional `error.code` (`"server-full" | "too-many-rooms"`).

## Rollout

0. **Load harness** — done: `server/scripts/load-test.mjs`. Still to add for this work: status
   numbers it can poll (`monitorEventLoopDelay`, ELU, heap, a bot-decision-time histogram from
   `Room.botAction`) and wire bytes.
1. **`RoomService` refactor**: `room-service.ts`, `transport.ts`, `room-host.ts`,
   `in-process-host.ts`; `ws-server.ts` the compatibility wrapper; module singletons
   (`spectators`, `sentArtManifest`/`artManifests`, `boundRoom`, the `onUpdate` rebinding) become
   instance fields. A pure move: the server suite unchanged, e2e smoke.
2. **`RoomManager`**: caller-supplied codes, `adopt`, added/removed hooks, `room-code.ts`, reaping
   in the service, room events, dev-rooms on `adopt`.
3. **Status split** and the shard section.
4. **Import as a job** with the body cap.
5. **Worker shards behind `--shards N`, default 0**: `shard-protocol.ts`, `shard.ts`,
   `shard-worker.ts`, `worker-host.ts`; the loopback suite, the worker smoke test, the static
   import test, and a manual `node dist/index.js --shards 2` (blitz, spectate, rematch, tutorial,
   import, `/status`).
6. **Admission and placement** (and the BACKLOG per-IP line goes).
7. **Crash handling**: 1011, routes dropped, restart with backoff, crash-loop guard,
   `resourceLimits`; a simulated exit over loopback and a real-worker `__crash` op behind
   `testHooks`.
8. **dev-rooms `--shards N`**: `dev-rooms-shard.mjs`, control forwarding, `DEV_ROOMS_SHARDS` in
   the Playwright config, an e2e matrix over 0 and 1.
9. **Default `--shards = max(1, availableParallelism() − 1)`**: docs (`DEPLOYMENT.md`:
   `UV_THREADPOOL_SIZE`, memory sizing; `server.md`; a `server/CLAUDE.md` invariant — rooms live
   in shards, main imports no engine), deploy to the 2-vCPU box (1 shard + main), rerun the load
   test, set `--max-rooms-per-shard` from the knee (the stage where the frame-gap median passes
   +20% over one room); again on the bigger box.

## Risks, and what to measure first

1. Per-shard memory and startup time on the box (with and without the compile cache) — startup
   lengthens deploys and crash restarts.
2. Main becoming the bottleneck (socket writes, deflate dispatch, `JSON.parse`, `postMessage`):
   main's delay p99 and threadpool queueing at the top stage.
3. Oversubscription eating the bots' wall-clock budget: decision-time p99 per shard.
4. `postMessage` latency for big frames: timestamp `out`, record shard → main p99.
5. Uneven shards: the ELU spread; switch to ELU-led placement if room counts mislead.
6. Drift between modes: the loopback suite and the e2e matrix, especially event slicing's reset
   on swaps.
7. Crash UX: a crash loses 1/N of the rooms (phase 4 snapshots could restore them).
8. Debugging: prefix worker log lines with the shard index; `--cpu-prof` writes one profile per
   thread.
