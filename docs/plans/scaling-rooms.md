# Scaling the rooms

Status: **planning** (2026-10-13) — nothing built; a first load measurement of the live box is recorded below. The user plans to move to a bigger box
eventually and wants the server able to use what a bigger box adds; this plan is how.

## Where it stands

One Node process (`server/dist/index.js`) on a Lightsail instance with **2 vCPUs and 2 GB**,
burstable CPU (`DEPLOYMENT.md`). Every room lives in that process's memory (`RoomManager`), and
everything a room does runs on Node's one main thread:

- **Bot decisions.** v2 searches for up to `BOT_DECISION_BUDGET_MS` = 300 ms per decision
  (`server/src/room.ts`), synchronously inside `Room.settle` (`botAction`), *before* the frame
  is published and the room waits on the clients — the "concurrently" in that constant's comment
  is wall-clock overlap with the pause, not a second thread. A settle that runs through several
  bots' priority passes can ask more than once.
- **Frames.** One `state` push per bot move, per *connected* seat (bots get none, so a blitz
  room builds one): `viewFor(seat)`, `legalActions(seat)`, then `JSON.stringify`
  (`ws-server.ts`'s `broadcast`); each spectator gets its own `viewFor(SPECTATOR)`. The view carries the **whole event log** (`events: state.eventLog`,
  `engine/src/view.ts`), so a frame grows with the game: 400–600 KB on a late four-player board.
  permessage-deflate cuts the bytes to a tenth; zlib runs on libuv's pool, but building and
  stringifying the view is main-thread work. In a blitz room the bot search should dominate (up to 300 ms a
  decision against one view per frame); in an all-human four-player room the frames do.
- **The game itself** — dispatch, state-based actions, triggers, layers.

While any of that runs, no other room moves, so the server's limit is one core's worth of all
rooms' work together. Past it everyone lags, and the bots also play worse: their 300 ms is a
wall-clock budget, so time spent waiting for the thread is time not spent searching. The second
vCPU sits mostly idle. Burstable CPU adds a cliff: under sustained load the credits run out and
the box throttles.

**First measurement (2026-10-13, the live box, idle beforehand).** A load script (kept in the
session scratchpad as `stress.mjs`; phase 0 turns it into `server/scripts/load-test.mjs`) ramped
four-seat rooms with every seat played by v2 (the human seat handed to a bot), each frame acked
600 ms after it arrived as a browser would after animating it, bot speed normal, 75 s per stage.
A probe timed a cheap request (spectating an unknown room) every 500 ms: its round trip is
network (~53 ms) plus however long the event loop was busy.

| rooms | frames/s (all rooms) | gap between a room's frames, median / p90 | probe p50 / p95 / max |
|---|---|---|---|
| 1 | 0.68 | 1.38 s / 2.0 s | 53 ms / 0.78 s / 1.7 s |
| 2 | 1.39 | 1.43 s / 1.9 s | 53 ms / 0.49 s / 1.1 s |
| 4 | 2.36 | 1.67 s / 2.4 s | 54 ms / 0.98 s / 2.3 s |
| 6 | 2.91 | 1.83 s / 3.0 s | 63 ms / 1.25 s / 4.7 s |
| 8 | 3.33 | 2.22 s / 3.3 s | 56 ms / 1.66 s / 3.3 s |
| 12 | 4.11 | 2.67 s / 4.2 s | 272 ms / 1.83 s / 3.2 s |
| 16 | 4.08 | 3.28 s / 7.2 s | 264 ms / 2.38 s / 4.7 s |

- **The ceiling is about 4 bot moves a second for the whole server**, reached at ~12 rooms; past
  it more rooms only slow every room down. Rooms start to feel slower from ~4 (frame gaps +20%)
  and are clearly slow by 8 (+60%). The paced floor is ~1.35 s a frame (ack 600 ms + the think
  floor + normal bot speed's linger).
- **Even one room blocks the loop for up to 1.7 s at a time** — far past the 300 ms search
  budget. **Found (2026-10-13)**: one `Room.settle` runs a whole stretch of priority passes
  synchronously. Passes don't get a frame (`settleNow`'s `pass-priority` branch dispatches and
  `continue`s), so from one real move to the next a settle walks every bot through every empty
  step — timed locally with a wrapper on `settleNow`/`botAction`, the longest settles held 25-45
  decisions (end of one turn through the next turn's main phase), most answered in 0-1 ms by a
  shortcut but every fourth or so searched (10-35 ms), then the real move searched to its
  budget (150-330 ms): ~400 ms in one go here, and the box runs v2 3-4x slower (the same seed's
  decisions: p50 37 ms here, 152 ms there; its slowest single decision 0.6 s, double the
  budget, as one simulation there is 100-250 ms). No single decision explains the stall; the
  chain does.
  **Built (2026-10-13)**: the settle slicing below, and the land search looks once per land
  name; measured locally, one room's worst event-loop stall went 234 → 65 ms and the longest
  settle is now the slice plus one real decision (≤ ~350 ms here). The land search's saving is
  small (≤ 20%, only with duplicate lands in hand): most of its outside-the-budget time is the
  look at each *different* land (`castableAfterPlay`'s board clones and one-spell simulation),
  which a cheaper `legalActionsAfter` would cut.
  **Rerun on the live box after deploying it** (38d0ee85, same script and stages):

  | rooms | frames/s | frame gap median / p90 | probe p50 / p95 / max |
  |---|---|---|---|
  | 1 | 0.76 | 1.37 s / 1.6 s | 53 ms / 120 ms / 315 ms |
  | 2 | 1.48 | 1.38 s / 1.7 s | 53 ms / 221 ms / 837 ms |
  | 4 | 2.72 | 1.48 s / 2.0 s | 55 ms / 357 ms / 523 ms |
  | 6 | 3.63 | 1.65 s / 2.4 s | 93 ms / 480 ms / 1.1 s |
  | 8 | 3.80 | 1.94 s / 3.0 s | 104 ms / 780 ms / 1.2 s |
  | 12 | 4.05 | 2.96 s / 4.3 s | 236 ms / 1.07 s / 1.5 s |
  | 16 | 5.24 | 3.01 s / 4.1 s | 273 ms / 1.17 s / 1.7 s |

  Stalls fell by half to five times at every load (one room's worst 1.7 s → 0.3 s; four rooms'
  2.3 s → 0.5 s), and rooms kept their pace further up (four rooms at 1.48 s a frame against
  1.67 s). The ceiling is still about 4-5 moves a second: what's left of a stall is one real
  decision overrunning its budget, and past the knee it's plain CPU, which only more cores fix.
  **Fix outline** (phase 1): in `"realtime"` pacing, let `settleNow` give the event loop back
  once it has run ~50 ms — continue on `setImmediate` instead of looping on, with a guard so a
  `settle()` arriving meanwhile doesn't start a second loop. It changes no frame and no
  decision, only lets other rooms' messages and acks in between, bounding a stall to about one
  decision. Second, the `"land search"` path spent ~380 ms *outside* the budget on the box
  (`eval-bot.ts`): bring it under the deadline.
- **Memory isn't the limit**: rss 206 MB idle → 438 MB at 16 rooms (~15 MB a room). CPU is:
  the process showed 110–130% (the main thread plus GC and zlib's threads), load average ~1.8
  on 2 cores.
- **Caveats**: all-bot rooms are somewhat heavier than blitz (three bots and a human who
  thinks); all clients came from one IP; the box's burst credits were full.

Translated: a handful of simultaneous blitz games before players notice, about ten before it's
bad. Tutorial rooms (v1, a scripted opponent) and all-human rooms cost a fraction of a blitz room.

## The key point for a bigger box

**A bigger box only helps once the server uses more than one core.** As it stands, 8 vCPUs
would run the same one thread a little faster (no throttling) and leave seven idle. So the order
is: measure → cheap single-thread wins → spread rooms across cores → then buy the box, sized
from the measured rooms-per-core.

## Phase 0: measure

- **Load harness** (`server/scripts/load-test.mjs`): opens N blitz rooms against a running
  server with headless clients that ack each frame after a realistic animation delay (the
  `ack` pacing is what makes bots wait, so a client that acks instantly would overstate
  capacity), and plays them to the end. Reports per N: event-loop delay p50/p99, frame latency
  (publish → ack), actual bot decision time against its budget, bytes per frame, heap.
- **`/status` additions** (`server/src/status.ts`, port 4010): event-loop delay
  (`perf_hooks.monitorEventLoopDelay`) p50/p99, process CPU, rooms by kind (blitz, lobby,
  tutorial, builder), heap. The live box then shows how close it is to the knee.
- **Profile one saturated run** (`node --cpu-prof`): the split between bot search, view
  building and stringify, and the engine. That split decides between phase 1's items.
- **Count searches per bot move**: whether a settle asks v2 to search for decisions that are
  only a priority pass, and how often.
- **Output**: rooms-per-core for blitz rooms (the expensive kind), memory per room, and the
  registry's memory (it's loaded once per process today — see phase 2).

## Phase 1: cheap wins on the one thread

They multiply with phase 2, so they come first; each is chosen by phase 0's profile.

- **Frames carry only new events.** The client already keeps what it has seen; a frame can send
  the events since that connection's last frame, with the whole log only on join and reconnect.
  Makes frame cost independent of game length. A protocol change (`protocol/src/room.ts`) and a
  client one (`net/`, `usePlayback`), but a small one beside full view diffs, which wait until
  measured as needed.
- **Don't search when there's nothing to choose**: a bot with only pass (or one forced move)
  answers without v2's search, if phase 0 finds it searching there.
- **Spectators share one frame**: today each spectator gets its own `viewFor(SPECTATOR)` and
  stringify (`spectatorFrame`); one per room per frame, sent to each, differing only in the
  art manifest on a first frame.

## Phase 2: rooms on worker threads (the step that lets a bigger box pay)

**Room shards.** N worker threads (`worker_threads`), each owning a share of the rooms whole:
their `Game`s, bots, settles, views and stringified frames. The main thread keeps only the
sockets, HTTP, the rate limiter and a room-id → shard map, and forwards messages both ways
(client messages in; per-connection payload strings out, sent as they are).

Why shards rather than a pool that only runs bot searches:

- A bot isn't stateless: v2 keeps its own memory between decisions (batch and pass holds — a
  snapshot holds only the game, `replay-seed`). A search pool would need the bot moved with
  every request or rebuilt each time.
- A search request would carry a snapshot of the game — tens of ms to clone a big board, per
  decision, on the main thread.
- Shards also take view building, stringify and the engine off the main thread, not just search.
- The room → shard map is the same seam phase 5 needs (room → process or box).

Shape:

- `--shards N` (default: cores − 1, at least 1; `0` runs rooms in-process as today, which is what
  vitest and the scripts use, so tests don't change).
- A new room goes to the least-loaded shard (by room count weighted by kind, or by the shard's
  own event-loop delay). A lobby promoted to a game stays on its shard, so `PendingRoom` lives
  there too.
- Each worker loads its own card registry: memory per shard = registry + its rooms. Phase 0's
  registry figure sets how many shards a box's memory allows.
- `/status` aggregates the shards' reports; capture writes from the worker that has the room.
- **Admission control** lands here: a cap on live rooms per shard, past which new rooms are
  refused with a friendly "the server is full, try again in a minute" rather than every game
  slowing down — plus the per-player cap on open rooms already in `BACKLOG.md`.

The risky part is the message boundary: everything `ws-server.ts` does to a room today
(`room.game.viewFor`, `room.ack`, the builder and tutorial sessions) becomes a message. Keeping
the room API the shard exposes small, and testing it with `--shards 1` in the e2e suite, is the
guard.

## Phase 3: the bigger box

- After phase 2, capacity ≈ (vCPUs − 1) × rooms-per-core, until memory runs out first; size the
  plan from phase 0's two numbers rather than from the price list.
- **Sustained load wants non-burstable CPU** (or a burstable plan whose baseline covers the
  normal load): a burstable box that runs out of credits throttles every shard at once, and the
  bots' wall-clock budgets turn that straight into weaker play.
- Re-run the load harness on the new box and set `--shards` and the admission cap from it.

## Phase 4: deploys that don't end games

With more rooms there is rarely an empty moment to deploy into.

- **Drain**: on SIGTERM, refuse new rooms, wait (bounded) for games to finish.
- **Or carry them over**: write each room's `game.snapshot()` (plus seats and tokens) to disk on
  shutdown and restore on start; clients reconnect with their tokens. Bots lose only their own
  memory, which is harmless (`replay-seed`'s note on snapshots).
- **Build off the box**: `deploy.sh` builds on the instance (peaks above 1 GB, two cores busy),
  competing with live rooms; building in CI and shipping `dist/` avoids it.

## Phase 5: more than one box (only if one isn't enough)

Rooms stay in one process's memory, so a connection must reach the box holding its room. Today
the room code travels inside a message (`join-room`), not the socket URL, so nothing in front can
route by it: put the room code in the URL, give each box a room-code range, and route in Caddy or
Cloudflare. Not worth designing further until a single big box is measured full.

## Order and checks

0 → 1 → 2 → 3 → 4; 5 only on need. Each phase re-runs the load harness and compares against the
last, and the existing suites, fuzzer and e2e run as usual (`--shards 0` keeps them unchanged;
the e2e suite adds a `--shards 1` run in phase 2).
