# Replicated rooms: a multiplayer game on every player's device

Status: **proposed** (2026-11-18), for the user to approve. Built so far, as the groundwork and
the evidence: the fuzzer's copy check (`MTG_REPLICA=1`), a state's exact form as text
(`engine/src/state-wire.ts`) and names ordered the same on every machine (`compareNames`). None
of the rooms themselves.

## Why

A solo game already plays in the player's browser (`local-rooms.md`). A game with other people in
it still runs on the server, and what it costs there is its bots (`scaling-rooms.md`, "Rooms on a
player's device": a table of people is 1-2% of the box's room thread, a bot's search up to a
second a decision). The user's direction (2026-11-18) is the whole room on the host's device, with
two things asked of it:

- **the host's role can pass on** when the host has to leave;
- **a player's own action takes effect at once**, cancelled only if the host disagrees, "somewhat
  similarly to my understanding of rollback netcode".

Both come from one change: every player's device holds a copy of the game, and only what each
player did travels. A player reading hidden cards on their own device is not an objection (the
user, the same day: "players cheating is not a concern in the grand scheme of things").

What a player's own click waits for, in each shape:

| | a person's own click | someone else's action |
|---|---|---|
| today: the room on the server | a trip to the server and back | the same |
| the room on the host's device, the others shown frames | two trips: to the server, on to the host, and back | two |
| a copy on every device | nothing: the device's own engine, a few ms | one trip, as today |

Without copies, a room moved to the host is slower for every guest than today's. With them it is
faster for everyone.

## Why this is lockstep, not rollback

Rollback netcode guesses what the other players are doing and corrects the guess. Here there is
nothing to guess: Magic asks one player at a time (`askedPlayer`: whoever a decision waits on, or
holds priority), so while it is a player's move nobody else's action can come between their click
and its place in the order. The device applies the action and is right.

What can come between is short and rare:

- **the opening hands**: `mulligan` is asked of everyone at once, and the shuffles draw from one
  random stream, so the order they land in matters. These wait for the order (one trip, as today);
- **out-of-turn inputs**: a concession, a seat handed to a bot or taken back, a setting the engine
  reads (`setOrdersOwnTriggers`), the host's own controls (pause the bots, a rematch).

For those the device undoes: it goes back to the last state everyone agreed on, takes the other
input first, and applies its own again if it is still legal. Measured, a state copy and a rebuilt
`Game` are about 5 ms.

## What was checked

- **A copy given only the actions stays identical.** Six four-player games played by v1 on the
  starter decks (1,424-1,833 actions each): a second game from the same seed fed each action was
  byte-identical at every check, and one restored mid-game from the state as JSON held the same
  content to the end.
- **The same over the whole pool, as a room plays it.** The fuzzer with `MTG_REPLICA=1`
  (`engine/scripts/replica-check.mjs`) plays each game the room's way (no controllers in the
  game: `advanceUntil(isSettled)`, the seat that owes the decision asked, `dispatch`) beside two
  copies given only the actions, one from the seed and one restored from a sent state every 150
  actions, comparing whole states every 25. Over 300 four-player games on decks drawn from the
  whole pool (seeds 1-300, about 1.23 million actions, 49,700 comparisons, 8,060 restores), 299
  came out identical and one found the bug below; with it fixed, all 300. 150 two-player games
  (171,000 actions, 1,064 restores): all identical.
- **What those runs found on the way**, each now dealt with:
  - *A real engine bug.* One game's restored copy drifted: a permanent's `tally` (what it has
    done, read by the bots) was written in place, and a token split off a stack shares its
    stack's, so two tokens attacking for 1 each were credited 2 apiece in the game and 1 in a
    copy restored from a sent state, which shares nothing between objects. The game was the one
    that was wrong. Fixed (`addToTally`, a new record each time; `tally-token-stack.test.ts`).
    It is the kind of fault only this check finds: something the live game holds that its own
    state doesn't say.
  - *Two ways of driving a game are not the same to the letter.* `Game`'s own controller loop
    hands priority to whoever a decision waits on before asking them, which a room never does: a
    `priority-received` event the room's game doesn't have, and every event after it numbered
    differently. Six games in 150 differed by exactly that when the check first watched a
    controller-driven game. It is why the check plays the room's way, and it means the fuzzer's
    default mode has never played a game quite as a room does.
  - *A blank target slot doesn't survive JSON* (`BACKLOG.md`): four games in 150 threw in a copy
    restored from plain JSON. A state now travels through `stateToJson` /
    `stateFromJson`, which keep a blank a blank. Plain `JSON.stringify` still loses it, wherever
    else a state is written that way (a bot capture).
  - *Five sorts read the machine's language* (`localeCompare`, ordering the names a card-name
    choice offers and the creature types suggested first). They use `compareNames` now, and
    `test/same-on-every-machine.test.ts` fails on a locale read anywhere in the engine.
- **The numbers** (dev PC): an action is 43 bytes on average against a 50-80 KB frame a seat;
  applying one takes 0.2-0.5 ms, so a whole game's log replays in about half a second; the whole
  state is 220-420 KB as JSON, 11-23 KB gzipped.

**Not checked**: other browsers (the e2e suite and Node are both V8; Firefox and Safari run other
engines), two different builds of the engine, and the test laptop.

## Shape

**Every player's device runs the room**, in the worker a solo game uses
(`client/src/local/room-worker.ts`): the same `Room` over the same `Game`, the page talking to it
as it talks to a local room today. The game screen, playback and frames are unchanged, because
the page still gets `state` messages from a room; they just come from its own worker.

**What travels is inputs.** An input is one thing done to the game: an engine `Action`, or one of
the out-of-turn inputs above. Each has exactly one device that makes it:

- a person's seat: that person's device. That includes what the room does *for* the seat, which
  today the server's room does: auto-pass, "pass the turn" and "resolve the stack" are flags on
  the seat that make the room pass for it, so the seat's own device runs them and sends the
  passes;
- a bot's seat: the host's device, which is the only one that runs the bots.

Every other device applies an input when it arrives and never makes one for a seat it doesn't
hold.

**The server puts the inputs in one order, and that is all it does.** A started game is a
*table* on the server: the recipe it was dealt from (seats, decks, seed, settings), the log of
inputs, who is connected, and who the host is. A device sends an input saying which place in the
log it follows; the server gives it the next place and sends it to everyone, or refuses it as
stale if something else took that place first. No engine, no card pool: the main thread can hold
it (`test/main-imports.test.ts` keeps main engine-free), at 65-250 KB of log a game.

**A person's own input is applied at once** on their device and sent. The server's answer almost
always confirms it. On a refusal the device undoes as above.

**The host is the device that runs the bots**, nothing more: whoever `HostRole` already names
(the room's creator while connected, else the first connected person in seating order,
`server/src/host.ts`), told to every device by the server. When the host goes, the next device
starts the bots from its own copy of the game; a bot keeps no memory worth carrying (the same
loss a reloaded solo game takes). A table of people has no host work at all. Until another device
takes over, the bots simply don't move, and the people still can.

**The copies check each other.** Every device sends a digest of its state now and then (each
turn). One that differs from the host's takes the host's state (`stateToJson`, 11-23 KB gzipped)
and carries on from it: the user's "unless the host disagrees". This is also what keeps a device
with a slightly different engine (a browser that computes something differently, a page loaded
after a deploy) in the game.

**Joining late, reconnecting, watching**: the device is sent the recipe and the log and replays
it (half a second), or is sent the host's state where a replay can't be trusted (another build).
A reloaded page restores its game from IndexedDB as a solo game does and asks for the inputs it
missed.

**When a device can't**: the table plays on the server exactly as today. A lobby starts as a
table only if every seated person's browser can run a copy (module workers, the pool loaded, the
same build of the page); otherwise it is promoted to a server `Room`, the path that exists.

## Saving a game to play on later

The user (2026-11-18): "We will eventually want the ability to let players save and load
gamestates so they can play one game across multiple sessions." Not built, and not part of the
rollout below until asked for, but it shapes three things now, so it is written down here.

**A save is a state, not a log.** Replaying a log only works on the build that made it: any
change to how a card or a rule behaves, to the order choices are offered in, or to the events
emitted makes a replay part from the original at that action (today's change to how names are
sorted would have). A game saved one week and loaded the next meets a newer engine, since the
site deploys most days. A state is plain data: the game goes on from it under the new build, with
that build's fixes. So a save is the game's state through `stateToJson` (11-23 KB gzipped) with
the room around it — seats, names, decks, settings, which seats are bots — which is what
`SavedLocalRoom` already holds for a solo game's reload.

**Loading is a table that starts from a state.** A table's recipe is one of two things: a seed
and decks, or a saved state and its seats. Every device builds its copy from it and the log
carries on. It is the path a device takes when it is sent the host's state (step 7), so it has
to stay a first-class way to open a table and not a repair used now and then. The fuzzer's copy
check already restores a state at arbitrary decisions and plays on: 9,124 restores over 450
games, every one identical, on one build.

**What it needs that nothing has today:**

- **A format number on a saved state.** A state's shape changes (the need-key themes of early
  November 2026 reshaped it: a turn journal in place of per-turn fields, one duration type), and
  today nothing says which shape a saved one has: a solo game's save
  that won't load is dropped without a word (`LocalRoomHost.restore`). A save carries the state
  format's number and the build that wrote it; a change that old states can't be read under bumps
  the number, with a migration or an honest "this save is from an older version". A few saved
  states kept in the repo as fixtures, loaded by a test, make breaking them a decision and not an
  accident. Saved decks already work this way (`deck-builder/decks.ts`).
- **A seat that outlives the tab.** A seat is reclaimed by a token the tab keeps in
  `sessionStorage`, gone when the tab closes. Across sessions, a returning player either has a
  token kept longer or simply picks their seat from the saved table (nobody is being kept out:
  the user's call on cheating covers it).
- **Somewhere to keep it.** On the device (IndexedDB, as a solo game's reload is, plus a file to
  download and load, which also moves a game between devices), or on the server under a code the
  players keep, as a room has. A multiplayer save wants the second: any of the players can open
  the table again. There are no accounts, and a save is small enough that a code and an expiry
  are all it needs.

Bots start fresh from a loaded state, as after a reload. A save holds every hand and library,
which is fine on the same grounds as the copies themselves.

## What has to change

### Engine

- **Done**: the copy check, `state-wire.ts`, `compareNames`, the locale guard.
- **A state digest**: one function over a state that gives the same answer however the state was
  built (a restored copy's objects have their keys in another order), cheap enough to run each
  turn in the worker.
- **The check in the other engines**: one recorded log replayed in Chromium, Firefox and WebKit
  (Playwright has all three) and on the test laptop, the digests compared with Node's. Whatever
  differs is fixed, and what can't be is the digest check's job.
- **The copy check in `verify`** once tables exist: a new card must keep copies identical, so
  the new-card fuzzers run with it on.

### The room (`server/src/room.ts`, which every device runs)

- **Seats this device answers for.** Today a room answers for every bot seat and automates every
  person's seat. A copy does that only for its own: its person's seat, and the bots' when it is
  the host. For the rest it waits for inputs.
- **Inputs out and in.** What a room does to its game for its own seats goes out as inputs; an
  input from the wire goes into the game the same way. This is a cut through `settle`, the most
  delicate code on the server, and the reason this step is built and fuzzed in Node before any
  network exists.
- **Replace the game.** One operation, used by an undo and by taking the host's state: put this
  state in place of the game and publish a frame from it.
- **Pacing.** Today a bot's move waits until every client has shown the last frame
  (`everyoneCaughtUp`). A copy can only see its own page. See the open decisions.

### Server

- **Tables**: the recipe, the log, the order, the host, reconnects from a place in the log, a
  rematch as a new recipe under the same code. On the main thread, with no engine.
- **A lobby starts as a table** when every seated client can run one: the waiting room stays the
  `PendingRoom` it is (deck checks need the pool), and at the start it hands its seats and decks
  to a table in place of promoting itself.
- **Admission**: a table weighs next to nothing, so the cap becomes a cap on waiting rooms and on
  games that fell back to the server.

### Client

- **The worker runs a table's copy** beside solo rooms, with a wire to the server for inputs;
  `HybridSocket` already sends a room's messages to the worker by its code.
- **The start**: `lobby/localStart.ts` moves a lobby into the browser when it is the host and
  bots; the same move for several people, each device building the same game from the recipe.
- **The build's id** in what a client says when it joins, so the server can tell whether a table
  may start and how a latecomer catches up.

## Rollout

Each step ends in a check that can fail.

0. **Done**: the groundwork above. *Check*: `MTG_REPLICA=1` on the fuzzer.
1. **The digest, and the other browsers.** *Check*: one log, the same digest in Node, Chromium,
   Firefox, WebKit and on the laptop.
2. **The room as a copy, in Node.** Seats a room answers for, inputs out and in, replace-the-game.
   *Check*: several rooms in one process, wired through an in-memory order, play whole games
   (random players, bots on one, auto-pass, pass-the-turn, resolve-the-stack, a concession with
   the stack full, a seat handed to a bot, the host changing) and end with one digest. Fuzzed.
3. **Tables on the server.** *Check*: the loopback suite with scripted clients; main still
   imports no engine.
4. **The client.** *Check*: an e2e test with two browser contexts playing two people and a bot;
   the server's `/status` shows a table and no room; the same lobby with one client unable falls
   back to a server room.
5. **Own inputs at once, and the undo.** *Check*: a unit test of a concession racing an action;
   an e2e measure of click to frame on a slowed network.
6. **The host changing.** *Check*: e2e, the host's tab closed mid-game and the bots moving again
   from the other device.
7. **The digest check and taking the host's state.** *Check*: a test hook that corrupts one copy;
   a client on an older build.
8. **Measured on the laptop, then on by default.** As `local-rooms.md` did: start-up time and
   memory with two tabs' worth of games, opt-in by a URL flag first.

Steps 1 and 2 decide whether the rest is worth building, and neither touches a live room.

**Saving and loading a game** ("Saving a game to play on later") comes after step 7, which
builds a table that starts from a state: then it is the save's envelope and format number, a
place to keep it, and the screens. A solo game could have it sooner, since its reload is already
a save in all but name.

## Open decisions (the user's)

- **Tables of people too?** They cost the server little, but the same path makes their actions
  instant and leaves one way to play a multiplayer game. Proposed: yes.
- **What bots wait for.** Only the host's own page (simplest: a guest on a slow machine sees the
  bots' moves queue up), or every device's "shown it" sent through the server (today's feel, one
  more small message a frame). Proposed: the host's page first, the other if it plays badly.
- **How long bots wait for a host who dropped** before the next device takes them: a reload takes
  a few seconds and shouldn't hand the role over. Proposed: 5 s.
- **Someone watching** needs the engine and the pool loaded as a player does (2.7 s on the
  laptop). Proposed: accept it.
- **A latecomer on a newer build** takes the host's state and is corrected by the digest check.
  The stricter choice is to refuse and ask the table to finish first.
- **Saved games, when they come**: kept on the device and as a file, or on the server under a
  code; and how old a save the site promises to load (every format change migrated, or "saves
  last until the next change to the state's shape", said plainly to the player). Proposed: the
  server under a code for a table, the device for a solo game, and migrations only where they
  are cheap.

## Risks

- **Copies that disagree across browsers or builds.** Untested, and the one thing that could make
  the whole shape wrong: if they disagree often, a guest's game keeps jumping to the host's.
  Step 1 answers it before anything else is built.
- **`Room.settle`.** Every pacing and auto-pass fix of the last two months lives in it. Step 2's
  fuzzed many-rooms test is the guard, and the server's own room must keep passing its suite
  unchanged at every commit.
- **Every device loads the engine and the pool**: 2.7 s and ~250 MB on the test laptop for a solo
  game (`local-rooms.md`). The page already does this for a blitz.
- **A browser freezing a hidden tab's worker**: a host who switches tabs for minutes may stop
  running the bots. With copies this costs a pause and a host change, not the game; unchecked.
- **Two ways to play a multiplayer game** (a table, a server room) until the fallback can go.
  The e2e suite has to run both, as it runs a blitz both ways.
- **Bugs that only happen on a device**: a report has to carry the log, which is small enough to
  send whole.
