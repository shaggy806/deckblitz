# Local rooms: solo games in the player's browser

Status: **in progress** (planned 2026-10-13). Steps 1-5 are built, behind `?local=1`: blitz and
lessons play in a Web Worker in the tab while lobbies stay on the server, and a local game survives
a reload. Left: step 6, measuring on the user's low-end laptop (bot decision times, the worker's
memory, smooth animation), then step 7, turning it on by default. Bug-report uploads (step 5's
other half) wait: the capture panel only exists on a developer's `--capture` server.

## Why

A game with one human and bots — **blitz** (a pasted decklist against three bots) and the
**tutorials** — needs no authority: there's nobody to cheat and no hidden hand to protect from
another person. Yet it's the server's most expensive kind of room: three v2 bots, each searching
up to 300 ms a decision. The live box tops out near 4-5 bot moves a second for everyone, about a
dozen busy all-bot rooms (`scaling-rooms.md`). Run those games in the player's browser and the
server keeps its capacity for games between people; and most players' machines are faster than
the box (the dev PC runs v2 3-4x faster), so their bots answer sooner too.

What stays on the server: **any room with two or more humans** (the server is what keeps hands
hidden and moves legal), and the bots in those rooms (run on one player's machine, they'd show
that player the bots' hands).

## Shape

- **The room logic runs in a browser Web Worker**, unchanged. `room-shards.md` step 1 turns
  `ws-server.ts`'s handlers, `broadcast`, spectators and the per-connection state into a
  `RoomService` over a `RoomManager`, speaking `ClientMessage`s in and `ServerMessage`s out per
  connection. A shard thread on the server and a Web Worker in a browser are the same idea: the
  worker runs a `RoomService` with one connection (the player).
- **The client gets a second transport.** `useNetworkGame.ts` talks to a `WebSocket`; a
  `LocalTransport` with the same surface (`send`, `onmessage`, `onopen`, `onclose`) posts to the
  worker instead. Everything above it — the game screen, playback, acks, the event-only frames —
  is unchanged, because the messages are.
- **Which rooms go local**: a blitz, and a tutorial (`tutorial-create`). Everything made through
  the lobby (`create-room`, even if the host then fills every other seat with bots) stays on the
  server, since another person may join. A local room has no code anyone else can join, and no
  spectating or invite link.
- **Fallback to the server** when the browser can't (no module workers), the card shards fail to
  load, or a `?local=0` override is set. The site is desktop and laptop only (never phones), so
  there's no device sniffing: the weakest machine to plan for is a low-end laptop, and the user has
  one to test on (step 6). The server path stays exactly as it is.

## What has to change

### Engine: the game and bots without the whole pool

`Game.create` (`game.ts:1071`, `fromSnapshot` at `:1140`), `EvalBotController` (`eval-bot.ts:648`)
and `HeuristicBotController` (`controller.ts:1837`) default their registry to
`createDefaultRegistry()`, imported from `cards.ts`, which re-exports `BUILTIN_CARDS` from
`cards/generated.js` — the whole pool as one module. Bundled for the browser, that's every card
definition in the page's code. Make the registry a required argument on the paths the browser
uses (or move the default behind a factory the Node barrel installs), and add a browser entry,
`engine/local` beside `engine/client`, exporting `Game`, the bots and what a room needs, with a
build check that it pulls in no `generated.js` (the engine's `"sideEffects": false` rule, and
`client.ts`'s "never export `BUILTIN_CARDS`").

### Server code that must run in a browser

`RoomService`, `RoomManager`, `Room`, `PendingRoom`, `TutorialSession`, the lessons
(`tutorials/`), `scripted-bot.ts` and `buildScenario` (`builder.ts`, which the lessons build their
boards with) must import nothing Node-only:

- `pending-room.ts:51` builds a `REGISTRY` at import time (also a `room-shards.md` item) — inject it.
- `capture.ts` writes files (`fs`): not part of a local room; keep it out of the import graph
  (captures upload instead, below).
- Timers: `realTimers` calls `handle.unref?.()` — already optional-chained, fine in a browser.
  `performance.now()` exists in workers.
- The room server's deck checks (`validateCommanderDeck`, `formatCheck`) come from the engine and
  run on the worker's registry.

The cleanest cut is probably a small shared package (or a `server/src/rooms/` subtree with its own
"no Node imports" static test, as `room-shards.md` has for main) that both the server and the
client bundle import.

### Cards in the worker

A game needs every definition its four decks name, the tokens they make, and anything they refer
to by name. Shards are split by a hash of the name, so a hundred-card deck's cards are spread
over nearly all 32 shards anyway: load them all (`loadCardShard`, 6.3 MB of JS, 1.26 MB brotli,
~0.25 s to run on a fast desktop), build one `CardRegistry`, and hand it to the game and every
bot. The library and deck builder already load the same files, so a returning player usually
has them cached. Memory: the server measured ~150 MB of heap for the engine and the pool in a
fresh Node isolate; measure the browser worker's (`performance.measureUserAgentSpecificMemory`
where available) on the user's low-end laptop.

### Deck import stays a server call

Blitz reads the clipboard's decklist through `POST /import-deck` (Scryfall lookups, the Oracle
snapshot, the tag index — too big and too external to ship). Light: one request per blitz. The
returned deck goes to the local room instead of the server's.

### The bots on a player's device

v2's budget is wall clock (`BOT_DECISION_BUDGET_MS`, 300 ms): on a slow laptop it searches less and
plays weaker. Options: keep the wall clock but raise it on slower machines (the pause the room
takes for animations covers it), or count simulations instead. Measure a decision's simulations on
the user's low-end laptop (the decision-times script, run in its browser) before choosing. Run the
room in a worker so a search never freezes the page.

### What the server used to give for free

- **Surviving a closed tab or a reload**: save `game.snapshot()` plus the room's seats to
  IndexedDB after each publish (or each turn), and offer "Resume your game" on the landing page;
  bots lose only their own memory (`replay-seed`'s note on snapshots). Without it, a reload ends
  a local game — today it doesn't.
- **Bug reports and captures** (`capture-report`, `capture-save`): the state lives in the browser
  now, so upload it — a `POST` the server writes to `captures/` exactly as it does today.
- **Visibility**: `/status` stops seeing solo games. An optional anonymous "a local game started /
  ended" ping keeps a count.
- **Rematch** works as today, inside the worker.

### Security

A local game's whole state, the bots' hands included, is in the player's browser and visible in
the developer tools. That's harmless when the only opponents are bots. Nothing local ever talks
to another player, and a room with a second human never goes local.

## Rollout

1. **Built (2026-10-13)**: `engine/local` (`src/local.ts`) and `registryFrom(cards)`; `Game` and
   the bots fall back on `cards/default-registry.ts`, which `engineLocalPlugin()` (`engine/
   local-plugin`) swaps for a stub that throws in a browser bundle. `test/local-entry.test.ts`
   walks the sources with the swap; `test/local-bundle.test.ts` bundles `dist/local.js` with
   Rolldown, finds no card definition outside the 32 on-demand shard chunks, and plays a bot
   game from a registry built from the shards. No behaviour change.
2. **Built (2026-10-13)**: the room code (`room-service`, `room-manager`, `room`, `pending-room`,
   `tutorial-session`, `tutorials/`, `builder`, `scripted-bot`, `decks`, `bot-names`, `host`,
   `room-code`, `card-registry`) imports values only from `engine/local` and itself, in place —
   no package split. `card-registry.ts`'s `cardRegistry()` is each thread's one registry (a
   browser host calls `provideCardRegistry(registryFrom(shards))` first); capture is a factory
   (`captureLogs`); the decision histogram a recorder (`bot-decisions.ts`). Held by
   `room-core-imports.test.ts` (the sources) and `room-core-bundle.test.ts` (a Rolldown browser
   bundle, tree-shaking off). **For step 3**, a browser host needs: `provideCardRegistry(...)`, a
   `RoomManager` (no capture), and a `RoomService` over it with an outbox that posts each
   `ServerMessage` to the page — the same shape `InProcessRoomHost` gives the server, minus the
   import job and status.
3. **Built (2026-10-13)**: `client/src/local/` — `localMode()` (`?local=1`, kept per tab in
   `sessionStorage`), `LocalSocket` (a WebSocket's surface over a module worker, the same JSON
   both ways) and `room-worker.ts` (all 32 shards → `registryFrom` → `provideCardRegistry`, then the
   server's `LocalRoomHost`); `useNetworkGame` opens a `LocalSocket` in local mode, nothing above it
   changed. `vite.config.ts` adds `engineLocalPlugin` for the dev server and the worker build
   (`worker.format: 'es'`). The worker bundle is ~1 MB (engine and room code, no card definition up
   front; its 32 shards are its own chunks, a second copy of the library's — worth sharing later).
   `e2e/local-blitz.spec.ts` blitzes locally and watches the bots play, with no socket to the room
   server (red without local mode); the server-path blitz e2e is unchanged. Not yet: a reload ends
   a local game (step 5), and lessons still go to the server (step 4).
4. **Built (2026-10-13)**: per-room routing. `?local=1` no longer makes the whole tab local: a
   `HybridSocket` keeps the server connection and sends a blitz's and a lesson's creates to the
   tab's worker (`sendLocal`), then every message for a room the worker made goes there; a lobby,
   joining by code and spectating stay on the server. Lessons needed nothing else — their data and
   `buildScenario` were already in the browser-safe room code.
5. **Built (2026-10-13), resume**: the worker saves each running game to IndexedDB
   (`client/src/local/savedRooms.ts`, `LocalRoomHost.save()`, at most once a second when a frame
   goes out) and restores them on start (`restore`); the tab remembers its local codes in
   `sessionStorage`, so a reload's rejoin goes to the worker. Lessons restart. **Not built**: bug-report
   uploads (only a `--capture` dev server has the panel) and the optional ping.
6. **Bot budget on a slow machine**: measure bot decisions and the worker's memory on the user's low-end
   laptop, then choose wall clock or a simulation count. **Ready to run** (built 2026-10-13): the
   worker records every bot decision's time (`recordBotDecisionsTo`), its start-up time and, in
   Chrome, its heap; the page records its own long tasks. On the laptop, in Chrome:
   1. open `https://deckblitz.net/?local=1` and blitz a deck (or Learn Commander);
   2. play a few rounds — Auto-pass is fine;
   3. open the console (F12) and run `deckblitzLocal.stats()`: a table of `readyMs` (the pool and
      saved games loaded), decision p50/p90/p99/max, `workerHeapMb`, the page's freezes
      (`pageFreezes`, `pageFreezeMaxMs`) and the core count;
   4. Chrome's Task Manager (Shift+Esc) shows the worker's whole memory as a "Dedicated Worker" row.
   For comparison: the live box's decisions ran p50 ~150 ms, the dev PC's ~37 ms, against the
   300 ms budget.
7. **Default on** for blitz and tutorials, with the fallback rules; the load test confirms the
   server no longer sees them; deploy.

## Risks

- **Slow laptops**: memory for the pool plus the engine, and bot strength under a wall-clock
  budget — measured on the user's low-end laptop before default-on.
- **Two code paths for the same game**: the same `RoomService` on both sides keeps them one; the
  e2e suite runs blitz both ways.
- **Bundle size**: the engine and bots add to the client; load them only when a local game starts
  (a dynamic import inside the worker), never on the landing page.
- **Bugs that only reproduce locally**: bug reports must carry the state (step 5) or they're
  unanswerable.
