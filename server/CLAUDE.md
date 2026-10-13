# server/ — the authoritative room host

Node + `ws`, ESM + NodeNext (relative imports need `.js`). One process runs many rooms; each
owns exactly one real `Game` and pushes every connected seat its own `viewFor(seat)`.

**Full per-file detail: `docs/architecture/server.md`.** Read a file's entry before changing
that file.

## Rules that aren't obvious from any one file

- **Two lifecycle stages.** A `PendingRoom` (`pending-room.ts`: seat claims and decks, no
  `Game`) is promoted into a `Room` (`room.ts`) once every seat is claimed or bot-filled,
  because `Game.create` deals at once and a seat's deck arrives with its claim. The table is
  sized (2–4) in the pending stage only.
- **Bots live in `Room.settle()`**, not in `Game`'s controllers, so mixed bot/human tables
  compose. `settle()` stops at each bot action and publishes a numbered **frame**, then
  releases the move once every acking client reports finishing its animations (with timeouts
  as backstops). Tests and scripts use `RoomOptions.pacing: "immediate"` and fake timers.
- **`broadcast` is never called from a message handler.** A room publishes its own frames
  (`room.publish()` → `onUpdate`).
- **The host** (`host.ts`) is whoever created the room. Only they may add or remove seats and
  bots, set bot decks and speed, start the game, and deal a rematch once it's over
  (`requireHost` in `room-service.ts`). A rematch is a new `Room` under the same code
  (`RoomManager.rematch`), its frames carrying the next `game` number.
- **Rooms can run on worker threads** (`--shards N`, default 0 = on the main thread;
  `docs/plans/room-shards.md`; production sets `SHARDS` explicitly in its unit, `DEPLOYMENT.md`,
  and both modes must behave the same — the loopback suite and the e2e matrix check it). Then main keeps sockets, routes and HTTP and **imports no engine**:
  `index.ts`, `transport.ts`, `worker-host.ts`, `room-host.ts`, `shard-protocol.ts`,
  `room-code.ts`, `status-server.ts`, `import-route.ts`, `load-monitor.ts` and `admission.ts` import values only
  from Node, `ws` and each other (`test/main-imports.test.ts`); everything a room does is
  shard-side, behind `RoomService`. Keep per-connection state in the service, never a module.
- **Only a create is ever refused** for load (`admission.ts`: `--max-rooms-per-shard`,
  `--max-rooms-per-ip`), and both hosts ask it the same way, so `--shards 0` keeps the same caps.
  A lobby counts as the game it will become: joins, starts, rematches and tutorial steps never
  meet a limit.
- **The room code runs in a browser too** (solo games, `docs/plans/local-rooms.md`): the rooms, lobbies,
  bots, builder and lessons import values only from `engine/local` and each other — no Node built-in,
  no `ws`, no `engine` barrel, no Node-side module (`test/room-core-imports.test.ts`). The card registry
  (`cardRegistry()`), capture (`captureLogs`) and the decision histogram (`botDecisions()`) come in from
  the hosts.
- **The wire protocol lives in the `protocol/` workspace**, imported as types by both server
  and client. Change it there, never restate it here.
- **Security-relevant:** printings are accepted only as a bare Scryfall card id
  (`assertPrintingsAreSafe`, since they become `<img src>` in every seat's browser). The
  `/status` endpoint runs on a **separate loopback-only port** (4010) on purpose: the game port
  is public through the Cloudflare tunnel. Captures (`--capture`) hold whole hidden state, and the
  scenario builder (`--builder`, `builder.ts`) lets a client put any card anywhere, so both are
  dev-only: the production service starts with neither. A **tutorial room** (`tutorial-session.ts`)
  is on every server, so a client names a lesson by id only, never a board, and its `state`
  carries the lesson's progress (`TutorialInfo`), never the spec.

## Where things are

`room.ts`, `pending-room.ts`, `room-manager.ts`, `room-service.ts` (the message handlers and
`broadcast`, per connection by `ConnId`), `transport.ts` (sockets, rate limit, compression),
`room-host.ts` / `in-process-host.ts` / `ws-server.ts` (the seam between them), `worker-host.ts` /
`shard.ts` / `shard-worker.ts` / `shard-protocol.ts` (rooms on worker threads; tests drive them
in-thread through `loopback-channel.ts`), `room-code.ts`, `host.ts`, `decks.ts` (fallback
seat decks from the engine's `SAMPLE_DECKS`), `import-deck.ts` (`POST /import-deck`'s job,
`runImportJob`, whose HTTP side with a 1 MB body cap is `import-route.ts`; streamed NDJSON; an unimplemented card is read from the engine's Oracle snapshot via `card-data.ts`,
else looked up on Scryfall in batches), `oracle-tags.ts` (the card replacer's generated tag index),
`capture.ts`, `builder.ts` (the scenario builder: a board built from data, rebuilt into a new
frozen `Room` under the same code on every edit), `scripted-bot.ts` (an opponent that plays a
script by card name, v1 answering the rest; dev-rooms' bots too), `tutorial-session.ts` and
`tutorials/` (tutorial rooms: lessons as data, goals checked on every frame), `status.ts` (rooms' summaries) and `status-server.ts` (the
loopback status page, with `load-monitor.ts`'s event-loop numbers). Tests in
`src/test/`.

## Commands

(From the repo root with `-w server`.)

- `test`, `typecheck`, `build`, `start` (the real server on `ws://localhost:4000`; `-- --shards N`
  for rooms on N worker threads), `dev`. `test/worker-smoke.test.ts` runs real workers on
  `dist/` and skips itself when `dist/` is older than `src/`: build before trusting a pass.
- `dev-rooms`: a room server preloaded with the boards in `scripts/dev-scenarios.mjs`, plus a
  loopback command port on 4099 (`-- --shards N` or `DEV_ROOMS_SHARDS=N` runs its rooms on worker
  threads, the boards and ops from `scripts/dev-rooms-shard.mjs` in each). Use it to check a client change against a known position (the
  `dev-up` skill starts it). Room codes and command-port ops are in
  `docs/architecture/server.md`.
- `gen:oracle-tags`: regenerates the tag index (takes most of an hour; run it in the background).
