# Rooms on worker threads (room shards)

Status: **live** (2026-10-13): built, deployed at 77b43d95 and turned on with `SHARDS=1` in the
box's service unit (`DEPLOYMENT.md`; the code's default stays 0). The box's knee is measured
below; `MAX_ROOMS_PER_SHARD=6` on the box since 2026-10-18 (8 from that knee under a 300 ms bot
budget until "The one-second budget" below; the user's choice both times). Left: the
same measurement on a bigger box. "As built" below records the departures and the measurements. Phase 2 of `scaling-rooms.md`. The design came
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

## As built (steps 1-5, 2026-10-13)

- **Departures**: the shared types (`ConnId`, `RoomKind`, `RoomStage`, `RoomEvent`) live in
  `room-host.ts` (step 2 needed them first); `shard-protocol.ts` re-exports them. No `control`
  message or `setup`/`testHooks` yet (steps 7-8). `RoomHost` also carries `status()`,
  `importDeck()` and a decisions histogram; `StatusSnapshot` gains `main` and `shards`;
  `load-monitor.ts` is a main-side module. Placement is simply the up shard with fewest rooms
  (weights and admission are step 6). Spectators share one view per broadcast, and identical
  frames one message, encoded once — in-process too. A shard that exits is marked down, its
  routes dropped and its connections closed with 1011; no restart yet (step 7). An over-size
  import (413) drains the body rather than closing (closing showed the client a reset).
  Spectating a room on another shard un-spectates the old one before the new one confirms.
- **Also fixed on the way**: a message of bare JSON (`null`, a number) threw out of the socket
  listener and would have taken the process down; it's "malformed message" now.
- **Measured on the dev PC** (much faster than the box; the comparison between modes is what
  counts). Idle 60 s: `--shards 0` 194 MB rss (main heap 120 MB); `--shards 1` 213 MB (main
  heap 9 MB); `--shards 2` 370 MB — ~157 MB rss a shard, ~56 MB for main alone; startup ~4.1-4.3
  s either way. `NODE_COMPILE_CACHE` made startup *slower* here (5.4-5.6 s) — don't enable it
  without measuring on the box. Load test, stages 1/2/4/8 at 30 s, acks at 600 ms:

  | rooms | mode | frames/s | gap median / p90 | main delay p99 / max | main busy | rss |
  |---|---|---|---|---|---|---|
  | 4 | 0 | 3.47 | 1326 / 1431 ms | 64 / 175 ms | 17% | 522 MB |
  | 8 | 0 | 6.50 | 1332 / 1594 ms | 171 / 304 ms | 43% | 991 MB |
  | 4 | 2 shards | 3.53 | 1321 / 1391 ms | 9.8 / 14 ms | <1% | 860 MB |
  | 8 | 2 shards | 6.76 | 1321 / 1423 ms | 11.3 / 15 ms | <1% | 1531 MB |

  At 8 rooms the two shards' own delay p99 was 46 and 80 ms, busy 13% and 17%, bot decision p99
  41 and 73 ms. Main stays flat (risk 2 answered). **Memory is the risk to watch** (risk 1): each
  shard's heap grew to ~600 MB with 4 rooms — V8 letting an isolate's heap grow before
  collecting — so step 7's `resourceLimits` cap must be measured on the 2 GB box.
- **The load test's probe** (an unknown-room spectate) is answered by main, so with shards it
  measures only main's loop; shard stalls show in `/status`'s per-shard numbers — step 9 adds them
  to `load-test.mjs`.
- **Notes for steps 6-9**: placement is `WorkerRoomHost.place()`; routes hold shard, kind and
  stage but not the creator's IP (add it from the link's ip for the per-IP cap); `shard.load`
  arrives every second from a 10 s window (admission may want a shorter one); the refused-create
  path is in and tested. `exited()` does the drop and 1011 close; restart needs `start()`'s spawn
  and wiring pulled into a per-index method; `loopbackChannel(...).crash(code)` exists.
  `worker-smoke.test.ts` compares only top-level `src/*.ts` mtimes against `dist`.

## As built (steps 6-9, 2026-10-13)

- **Admission** (`admission.ts`, main-side, pure): the design's weights and placement (shard 0
  +0.5 for imports, a shard over 250 ms delay p99 skipped unless all are, ties by ELU then index —
  so the first room now goes to shard 1). `--max-rooms-per-shard` / `MAX_ROOMS_PER_SHARD`
  (unlimited by default) and `--max-rooms-per-ip` / `MAX_ROOMS_PER_IP` (6 on the CLI, unlimited
  in the library); refusals carry `error.code` (`server-full`, `too-many-rooms`). Loopback without a
  CF header is exempt. The in-process host allocates codes too and tracks each room's stage and
  creator from room events, so `--shards 0` enforces the same caps. Creates in flight count through
  their route, registered before forwarding. Placement reads the 10 s load window. A refused blitz
  drops back to the landing page with its host token forgotten (checked in Playwright).
- **Crashes**: a per-shard `launch()` (messages from a replaced incarnation ignored), `ShardPhase`
  (`starting`/`up`/`restarting`/`failed`/`stopped`; only `up` shards are placed on, posted to and
  reported as up), backoff 1, 2, 4 … 30 s by exits in the last 5 minutes, more than 5 → `failed`
  ("crash-looped" on `/status`). A shard that exits before `start()` finishes fails the start.
  `--shard-heap-mb` / `SHARD_HEAP_MB` (default 512) sets `resourceLimits.maxOldGenerationSizeMb`.
  `__crash` (behind `ShardConfig.testHooks`) throws from a timer — an uncaught exception.
- **dev-rooms**: `ShardConfig.setup`/`shardCount` and `control` both ways;
  `scripts/dev-rooms-shard.mjs`; `list` fans out (shard order now, not `dev-scenarios.mjs`
  order), other ops route by code, `eval` runs in the owning worker; `DEV_ROOMS_SHARDS` in the
  Playwright config and an e2e matrix over 0 and 1 in CI (jobs "smoke (shards 0/1)").
- **Step 9's code half**: the default stays 0; `DEPLOYMENT.md`'s unit sets `SHARDS=1` for the
  2-vCPU box (removing the line is the rollback); `load-test.mjs --status <url>` polls
  `/status.json` and reports main's and each shard's delay p99, busy and heap per stage.
- **The heap cap, measured** (dev PC, `--shards 2`, stages 4 → 8 rooms): uncapped, rss 971 → 1490
  MB and shard heaps to ~560 MB; capped at 512, 807 → 911 MB, heaps ~210-310 MB, frames/s and gaps
  unchanged; 384 similar; 256 doubles the shards' busy share (GC). 512 chosen: one shard holding
  8 rooms peaked ~220 MB, so it's twice that in headroom before an out-of-memory restart.

## Live on the 2-vCPU box (2026-10-13)

`SHARDS=1` (one room shard plus a main thread without the engine), same load test as
`scaling-rooms.md`'s first measurement, with `--status` through an SSH tunnel; the per-address
cap lifted for the run by a systemd drop-in, removed after (the cap of 6 is live):

| rooms | frames/s | gap median / p90 | probe (main) p95 / max | shard busy | shard delay p99 | rss |
|---|---|---|---|---|---|---|
| 1 | 0.80 | 1.37 / 1.54 s | 56 / 73 ms | 10% | 41 ms | 315 MB |
| 2 | 1.57 | 1.37 / 1.65 s | 58 / 89 ms | 20% | 92 ms | 331 MB |
| 4 | 3.03 | 1.39 / 1.74 s | 58 / 80 ms | 39% | 343 ms | 357 MB |
| 6 | 3.92 | 1.50 / 2.07 s | 64 / 82 ms | 69% | 517 ms | 373 MB |
| 8 | 3.68 | 1.99 / 3.01 s | 59 / 64 ms | 93% | 1.05 s | 387 MB |
| 12 | 3.84 | 2.75 / 4.64 s | 59 / 100 ms | 100% | 2.68 s | 410 MB |
| 16 | 4.55 | 3.12 / 4.92 s | 65 / 89 ms | 100% | 2.25 s | 429 MB |

- **The main thread stays at network speed at every load** (probe max ≤ 100 ms, against 1.7-4.7 s
  in the first run): connecting, joining and clicking never wait on a game.
- **The shard's knee is 6-8 all-bot rooms**: the frame-gap median passes +20% over one room
  (1.64 s) between 6 (1.50 s) and 8 (1.99 s), and the shard is saturated by 8 (93% busy). Up to
  6, rooms keep a faster pace than either earlier run (4 rooms: 1.39 s against 1.67 and 1.48).
  The whole box still tops out near 4-5 bot moves a second — one core's worth, as expected
  until a bigger box adds shards.
- **Memory** with the 512 MB heap cap: 315 → 429 MB rss at 16 rooms (the first run, no shards,
  was 438 MB) — comfortable on 2 GB.
- Bot decision p99 280-420 ms in the shard.
- The load test's byte rate doesn't show event-only frames: it doesn't send `event-deltas`, so it
  gets whole logs (a browser opts in).

## The one-second budget (2026-10-18, dev PC)

The bots' decision budget went from 300 ms to a second (`room.ts` `BOT_DECISION_BUDGET_MS`), after
the knee above was measured. Same load test on the dev PC, `--shards 1`, stages at 75 s, acks at
600 ms, `--status`; the 300 ms run is the same build with the constant patched back in `dist/`, so
the two differ only in the budget. Single runs over different games, so ±10% is noise:

| rooms | budget | frames/s | gap median / p90 | shard busy | shard delay p99 | bot p99 |
|---|---|---|---|---|---|---|
| 1 | 300 ms | 0.89 | 1.32 / 1.40 s | 5% | 22 ms | 126 ms |
| 1 | 1 s | 0.87 | 1.32 / 1.42 s | 4% | 14 ms | 142 ms |
| 2 | 300 ms | 1.83 | 1.32 / 1.47 s | 10% | 55 ms | 188 ms |
| 2 | 1 s | 1.64 | 1.32 / 1.61 s | 20% | 355 ms | 752 ms |
| 4 | 300 ms | 3.32 | 1.33 / 1.55 s | 33% | 327 ms | 317 ms |
| 4 | 1 s | 3.24 | 1.32 / 1.74 s | 30% | 263 ms | 261 ms |
| 6 | 300 ms | 4.51 | 1.35 / 1.91 s | 57% | 571 ms | 349 ms |
| 6 | 1 s | 4.27 | 1.36 / 2.15 s | 48% | 564 ms | 862 ms |
| 8 | 300 ms | 5.72 | 1.40 / 1.94 s | 66% | 588 ms | 326 ms |
| 8 | 1 s | 4.44 | 1.50 / 2.47 s | 70% | 1.71 s | 1.05 s |
| 12 | 300 ms | 6.73 | 1.48 / 2.09 s | 72% | 670 ms | 324 ms |
| 12 | 1 s | 6.73 | 1.48 / 2.58 s | 72% | 1.21 s | 330 ms |
| 16 | 300 ms | 6.57 | 1.80 / 2.68 s | 89% | 1.25 s | 349 ms |
| 16 | 1 s | 7.65 | 1.83 / 3.18 s | 86% | 2.33 s | 1.01 s |

- **The median doesn't move; the tail does.** Most decisions finish well inside 300 ms, so the
  frame-gap median and the shard's busy share are the same at either budget. The knee by the
  rule that set the cap (median +20% over one room) is in the same place, between 12 and 16 rooms
  on this PC, which is faster than the box. What the second changes is how long one wide board can
  hold its shard: the gap p90 is 10-25% longer from 2 rooms up, and from 8 rooms the shard's
  event-loop delay p99 roughly doubles (8 rooms: 0.59 → 1.71 s; 16: 1.25 → 2.33 s). That delay is
  how long every other room on the shard waits for its next frame.
- **A decision can overrun the second.** In 16 four-player self-play games at a 1 s budget
  (37,457 decisions), 437 ran out of clock and the slowest took 3.2 s: the search stops before a
  simulation that the running mean says won't fit, but one wide-board simulation can run far
  past it. **Mostly bounded the same day**: the clock had started only after v1's own pick (up to
  1.9 s for a land with Ramunap Excavator's 26 graveyard lands), the mean was dragged down by
  cheap crackback checks, and the turn plan checked the clock only after the deadline. Fixed,
  the same games ran 29 of 36,466 decisions past the second, the slowest 1.6 s (the load test
  above predates the fix); `BACKLOG.md` has what's left ("A decision overruns its second").
- **200 simulations is never the limit.** In the same games no decision came near it: the most
  was 61 (a priority window), 58 for an attack, 33 for a block, 12 for a decision (which caps at
  12). The clock always stops a search first, so raising `maxSimulations` would change nothing;
  it stays at 200.
- **On the box.** At 300 ms its one shard was already at 1.05 s delay p99 and 93% busy with 8
  all-bot rooms; doubling the tail there puts a stalled frame at 2-3 s, while at 6 rooms (517 ms,
  69% busy then) it would land near where 8 rooms were. **Lowered
  `MAX_ROOMS_PER_SHARD` from 8 to 6** (the user, 2026-10-18; the box's unit, restarted with no
  rooms open). Left: confirm it with this load test on the box with nobody playing (the
  per-address cap lifted by a drop-in, as before). A real blitz room — three bots and a person
  thinking — is lighter than an all-bot one, so 6 keeps some margin rather than cutting into
  ordinary use.

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
