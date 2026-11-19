# Replicated rooms: a multiplayer game on every player's device

Status: **in progress** (2026-11-18; the user: "Start step 1"). Built: the groundwork — the
fuzzer's copy check (`MTG_REPLICA=1`), a state's exact form as text (`engine/src/state-wire.ts`),
names ordered the same on every machine (`compareNames`) — and of step 1, the state digest
(`stateDigest`) and the check across browsers (`npm run play:browsers -w engine`). **Step 1 is
done**: recorded games came out identical in Node, in three builds of Chrome's engine, in
Firefox's and in Safari's, and in Chrome on the test laptop. **Step 2 is done** (2026-11-18): a
`Room` can be one copy of a game (`RoomOptions.copy`), and 480 fuzzed games played on several
copies at once came out the same on every one. **Step 3 is done** (2026-11-18): the server keeps
a table (the recipe, the order of inputs, the host) with no engine, a lobby whose every
connection can hold a copy starts as one, and scripted devices running real copies play through
it over sockets on both hosts. **Step 5 is done** (2026-11-18, built ahead of step 4 at the
user's word): a device's own move takes effect at once and is undone if another input took its
place, and tables fuzzed with every message racing end with one game on every copy. **Step 4 is
done** (2026-11-18; the user: "Start step 4"): a page can play a table, its worker holding the
copy, behind `?tables=1`; two browsers and a bot play one end to end, and a player's own move
reaches their screen in 13 ms however slow the connection, where a game on the server takes the
round trip (620 ms at 300 ms each way). **Off by default**: without the flag no page says it can
hold a copy, so every game on the site still starts on the server. Next is step 6, the host
changing, then 7 and 8.

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
input first, and carries on from there. Measured, a state copy and a rebuilt `Game` are about
5 ms. As built (step 5, "The undo" below): the out-of-turn inputs themselves are never guessed —
they wait for the order, as the opening hands do — so the only thing ever undone is a move made
in turn that one of them got in ahead of.

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
  applying one takes 0.2-0.5 ms, so a whole game's log replays in about half a second there
  (2-6 ms and tens of seconds on the test laptop: below); the whole
  state is 220-420 KB as JSON, 11-23 KB gzipped.

- **Step 1: one digest, in every browser tried.** `stateDigest` is 16 hex characters for a
  state, the same however the state was built. The copy check holds it to its own whole-state
  comparison: 45,076 states over 120 more four-player games, the digest agreeing wherever the
  states did, a restored copy's (its keys in another order) included; about 3 ms a state on the
  dev PC, 6-8 ms with the event log. `play:browsers` then records games in Node and replays them
  in a browser, the digests compared every 100 actions: six games (three at four players, three
  at two; 14,224 actions, 152 checkpoints) came out identical in Node 24, Playwright's Chromium
  141, and the Chrome 157 and Edge 157 installed on the dev PC — four builds of V8 sixteen
  versions apart. Then, with Playwright's Firefox 142 and WebKit 26 builds installed, those six
  and 24 more (seeds 4-15 at both table sizes; 30 games, 80,066 actions, 849 checkpoints in all)
  in all five browsers: **identical in every one**. SpiderMonkey and JavaScriptCore reach the
  same state as V8 to the last digest. An action costs 0.34 ms in Chrome, 0.59 in Firefox and
  0.63 in WebKit on the dev PC, and the pool loads in 0.4-1.2 s.

- **And on the test laptop** (Core i5-6300U, 4 threads, Chrome 157; `play:browsers -- --serve`
  leaves the page up on the LAN, and a browser that opens it posts its result back): twelve
  games (seeds 1-6 at both table sizes; 32,463 actions, 343 checkpoints) identical, twice over.
  It is slow there, and unevenly so: 5.7 ms an action on the first run and 2.0 on the second
  (0.34 on the dev PC), a four-player game's 4,000-odd actions taking 14-41 s to replay in the
  first. Playing along costs a device a dozen actions a real move, which that speed carries; but
  **catching up by replaying a whole log does not hold on a slow machine**, where it is the
  host's state a late device should be sent ("Shape").

**Not checked**: two different builds of the engine itself, and Safari on a Mac (Playwright's
WebKit is the same engine, built for Windows).

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

**Joining late, reconnecting, watching**: the device is sent the host's state and the inputs
since, or the recipe and the whole log to replay. The state is the rule, not the exception: a
replay is half a second on the dev PC but a quarter to most of a minute on the test laptop
(step 1's measure), and it can't be trusted across builds at all. A short gap (a dropped
connection, a reload) is the log's tail, which is quick anywhere.
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

- **Done**: the copy check, `state-wire.ts`, `compareNames`, the locale guard, and the state
  digest (`state-digest.ts`: one function over a state that gives the same answer however the
  state was built, cheap enough to run each turn in the worker).
- **The check in the other engines** (`play:browsers`, built): recorded games replayed in
  Chromium, Firefox and WebKit through Playwright (which supports all three; only Chromium's
  build comes with the e2e suite, the others are its `install`) and on the test laptop, the
  digests compared with Node's. Whatever differs is fixed, and what can't be is the digest
  check's job.
- **The copy check in `verify`** once tables exist: a new card must keep copies identical, so
  the new-card fuzzers run with it on.

### The room (`server/src/room.ts`, which every device runs)

**Built (step 2, 2026-11-18)**; `docs/architecture/server.md` has the detail.

- **Seats this device answers for.** A room answered for every bot seat and automated every
  person's seat. A copy (`RoomOptions.copy`, `RoomCopy.answersFor`) does that only for its own:
  its person's seat, and the bots' when it is the host. For the rest it waits for inputs.
- **Inputs out and in.** Every write a room makes to its game is now one `RoomInput` through
  `Room.act` (an engine action, a concession, the one setting the engine reads); a copy sends
  each (`RoomCopy.sent`) and takes the others' through `Room.receive`. The cut through `settle`
  turned out small: the loop is unchanged, and three places ask whether the copy answers for the
  seat. A room that is no copy behaves as it did.
- **Replace the game** (`Room.replaceGame`): a state put in place of the game, a frame
  published from it, the whole log sent again to whoever kept the old one. For taking the host's
  state now; for the undo in step 5.
- **Pacing.** A copy paces against its own page alone: the host's bots wait for the host's page
  and the think time, and every other copy shows inputs as they come. The fuzz runs copies paced
  this way as well as unpaced. Whether bots should wait for every device is still an open
  decision.

What the fuzz taught, each now a rule of the cut:

- **Every copy takes the game on to its next decision the moment an input is in**, its own or
  another's, whatever its own pacing has parked. A copy with a bot's move waiting behind a frame
  left its own concession unadvanced while the others moved on.
- **Something done out of turn is one input.** A concession used to be the answers to whatever
  the player owed and then the concession, as separate writes. Sent that way, the first answer
  handed the move to the next player, whose copy (the host's bots) moved before the concession
  arrived: two copies with the same inputs in different orders. It is one input now, worked out
  on a copy of the game first, and refused whole if any of it is. This is the smallest case of
  the race step 5 is about: an input made on a game that didn't yet have one already in flight.

### The undo (step 5)

**Built 2026-11-18** (`server/src/table-copy.ts`, `Room.act`, `Tables.input`).

Two kinds of input, told apart where they are made (`Room.act`):

- **Made in turn**: an action of the one player the game waits on. Only one device answers for
  that player, so nothing of the same kind can race it. The device applies it at once and sends
  it with where it takes the log to end (`after`) and how many entries just before that are its
  own, still unconfirmed (`mine`).
- **Made out of turn**: a concession, the setting the engine reads, an opening-hand decision.
  Another device's input may land first, so the device does **not** apply it: it sends it asking
  for no place (`after: null`), the server puts it wherever it arrives and never refuses it, and
  every device, the sender too, applies it when it comes back. Until its own has come back a
  device makes nothing else, since anything it made would be made on a game without it. A
  concession is now just `{ concede, player }`: each copy answers whatever the player owed for
  itself, with v1, which reads no clock, so the answers are the same wherever it lands.

The server takes an in-turn input only if the log is what the device took it to be: ending at
`after`, **and** its last `mine` entries from that device. The second half is there because a
host's bots make runs of moves faster than the server answers. Without it, when someone's
concession took the place of the second of a run of three, the third arrived saying "the log ends
at 2", which was true, and was taken — on top of a concession the device had not seen.

A device learns it lost a place when someone else's input arrives where it expected its own. It
then goes back to the game as it stood before its first unconfirmed input (a snapshot taken each
time it starts a run: `RoomCopy.making`), puts back its own inputs the server did confirm since,
applies the other input, and lets the room carry on. What the room made for a seat (a bot's move,
an auto-pass) it makes again by itself, on the game as it now is. A **person's** move is not put
back after a concession: what they answered is no longer what they would be asked (a pass with a
spell on the stack means something else once the spell's controller has left), so they see the
game as it stands and move again. After a setting, which changes nothing anyone was asked, their
move is made again for them. The server's refusals of the dropped inputs follow on the socket and
are counted off.

Also closed here: an input still on its way when a rematch is dealt carries the old game's number
and is dropped by the server, so a concession from the game before can't land in the new one.

What the fuzz showed (`npm run tables:fuzz -w server`, `server/src/table-fuzz.ts`): the real
`Tables` and a real `TableCopy` a person, joined by queues delivered one message at a time from
a queue picked at random, devices stalling, people moving the moment their own copy asks them and
doing things out of turn at any moment. Over 480 games (two to four seats, decks from the whole
pool and the server's own, 200 of them paced as a live room is, 160 with four times the racing):
293,638 inputs put in order, 8,971 refused, 964 undos, 474 concessions and 2,503 settings on the
way, and at every one of 4,347 moments of rest each copy held the same game, the whole of the
server's order and nothing unanswered; a copy dealt afterwards from the log alone held it too.
It passed the first time it ran, so it was shown to fail: with the undo not putting back the
confirmed inputs, and with the server's run check removed, the tests go red.

What a page shows of it was left to step 4, and built there ("The client"): an undo is one
frame, where it ends (`RoomCopy.quiet`); the person whose move was taken back is told why
(`TableCopyOptions.notice`); and a move made while a setting or concession of their own is
still on its way is kept and made when that has landed (`RoomCopy.hold`), not refused. The cost
of the snapshot before each run (one a person's move, one a bots' run) is part of step 8's
measure on the laptop.

### Server

**Built (step 3, 2026-11-18)**; `docs/architecture/server.md` has the detail.

- **Tables** (`server/src/tables.ts`): the recipe, the log, the order, the host, a device back in
  its seat by its token with the log from a place it names, a rematch as a new recipe under the
  same code. On the main thread, with no engine, the same for both hosts.
- **The order is compare-and-set.** A device sends an input with how much of the log it had seen
  (`after`); it takes the next place only if the log still ends there, and goes to everyone, the
  sender included, with its place. Otherwise the sender is told (`table-refused`) and nothing
  else happens. The server checks nothing against the game: there is none there. (Step 5 added
  the run check, `mine`, and inputs that ask for no place, `after: null`: "The undo".)
- **A lobby starts as a table** when every connection in it (the people, anyone watching) has
  said its page can hold a copy (`table-capable`, with the page's build) and they name one build:
  the waiting room stays the `PendingRoom` it is (deck checks need the pool), and at the start it
  hands its finished game config, seats and connections to a table in place of promoting itself.
  One device that can't, or a second build, and the game starts as a server room as ever.
- **The host** is the creator's seat while their device is connected, else the first person
  connected in seating order; a host that drops keeps the bots for five seconds before the next
  device has them, and the creator has them back the moment they return.
- **Admission**: a table weighs nothing, so the cap is now a cap on waiting rooms and on games
  that fell back to the server. A table still counts against the address that opened it.
- **The device's side** (`server/src/table-copy.ts`, room code): a `Room` copy dealt from the
  recipe, sending what it makes and taking the server's order. The tests' scripted clients are
  this over real sockets; the page's worker will run the same class in step 4.

What building it taught:

- **A table's devices talk far more than a room's clients.** A device sends every pass its room
  makes for its seat and, as host, every bot's move: dozens of inputs between two real plays. The
  transport's limit of 40 messages in five seconds an address stalled a table inside its first
  turn, so table inputs don't count against it (as acks don't); a cap on a table's log bounds
  them instead. Sending a run of a device's own inputs as one message is the obvious saving, and
  is not done.
- **A device applies its own input when it makes it**, so a refused one (or someone else's input
  taking its place) leaves that copy holding a game the table doesn't. As step 3 left it, the
  device's copy stopped and said so; step 5's undo puts it right, and step 7 (taking the host's
  state) is for a copy that still can't.

### The client (step 4)

**Built 2026-11-18**, behind `?tables=1` (`client/src/local/tablesMode.ts`, kept for the tab as
`?local=1` is); `docs/architecture/client.md` has the detail.

- **The worker holds the copy** (`room-worker.ts`, `LocalRoomHost.table`): a `TableCopy` whose
  room is adopted into the same `RoomManager` a solo game's is, so the page plays it through
  the messages it sends any room (`dispatch`, `ack`, `pass-turn`, the settings) and gets frames
  from it as from any room. The game screen, playback and the event log needed nothing.
- **The socket routes** (`HybridSocket`, `localSocket.ts`): `table-start` and the rest of a
  table's messages go from the server to the worker and are never shown to the page; what the
  copy makes goes from the worker to the server; the page's messages for that room go to the
  worker, except the three that are the table's own: a join (the server is asked for the table
  first), a rematch (`table-rematch`) and leaving (both are left).
- **The page says it can hold a copy when it can** (`table-capable`, with the build Vite
  stamped, `PAGE_BUILD`): the worker is started by the first waiting room the page is in and
  the word goes out when the card pool is loaded, again on each new connection, and is taken
  back if the worker fails. So a page that never sits down with anyone loads no pool for it,
  and a start before a guest's pool is in is a game on the server (the fallback, not an
  error).
- **The start** is the server's (`start-game` as ever): each page is sent `table-start`, its
  worker deals the copy and claims the page's seat with the token it held in the waiting
  room, and the first thing the page hears is its opening frame. A lobby of the host and bots
  alone still moves into the host's browser as a solo game (`lobby/localStart.ts`), unless
  someone is watching.
- **Coming to a table by its code** (a reload, a link, a dropped connection): the page joins
  as it joins any room; the server answers that the room is a table (`error`, `code: "table"`),
  the socket asks for it (`table-join`, with the seat's token if the tab has one), and the
  worker answers the page's join once the copy is dealt from the log. The page then takes its
  seat by its token or, at a full table, offers to watch, exactly as at a room. A page that
  can't hold a copy is told so in words.
- **A rematch** is a new `table-start` to every device: a new copy under the same code, the
  page still seated, frames counting on.
- **A copy that lost its place** (`TableCopy.outOfStep`) asks for the table again and is dealt
  afresh from the log, three times at most before the player is told to reload. The table's
  log is the game, so this is always right; step 7's digest check is what will notice a copy
  that is wrong without knowing it.
- **Who is there**: the server says which people are connected (`table-start`'s `online`,
  `table-seats`), for the dot beside each name; a copy shows the other people's seats as
  held, by their names from the recipe, and only the host's page is offered the host's
  controls.

**The measure** (`TABLE_LATENCY=1 npx playwright test table-latency`, the dev PC, Chromium, two
people and no bot, fourteen moves a game, the page's socket delayed each way): from a move
leaving the page to its frame arriving, median (worst):

| delay each way | game on the server | table |
|---|---|---|
| 0 ms | 23 ms (53) | 14 ms (43) |
| 75 ms | 173 ms (187) | 13 ms (39) |
| 150 ms | 327 ms (336) | 13 ms (39) |
| 300 ms | 620 ms (624) | 13 ms (39) |

A player's own move no longer waits on the network at all. Everyone else's still takes one
trip up and one down, as before; and an opening-hand choice, a concession and a setting wait
for the server by design ("The undo").

**Left as it is, and why**:

- **Off by default.** Step 8 turns it on, after the laptop.
- **A reload, or a connection that dropped, replays the whole log.** Half a second on the dev
  PC, a quarter to most of a minute on the test laptop late in a long game (step 1's
  measure). Step 7 builds a table that starts from a state; the restore from IndexedDB and
  "the inputs since" belong with it.
- **The host's controls act on the host's device only**: bot speed, pausing and stepping the
  bots are the host's room's, which is the one that runs them, and the other pages aren't
  told (no "Bots paused" badge there). A seat its player hands to a bot is played by that
  player's device and shows as a bot only on it.
- **The host changing mid-game** is built and tested on the server and in Node (steps 2 and
  3) and untried in a browser: step 6.
- **Bots wait for the host's page only**, as proposed under "Open decisions".

## Rollout

Each step ends in a check that can fail.

0. **Done**: the groundwork above. *Check*: `MTG_REPLICA=1` on the fuzzer.
1. **The digest, and the other browsers.** *Check*: one log, the same digest in Node, Chromium,
   Firefox, WebKit and on the laptop. **Done 2026-11-18**: 30 games identical in Node 24,
   Chromium 141, Chrome 157, Edge 157, Firefox 142 and WebKit 26, and twelve in Chrome on the
   laptop ("What was checked").
2. **The room as a copy, in Node.** Seats a room answers for, inputs out and in, replace-the-game.
   *Check*: several rooms in one process, wired through an in-memory order, play whole games
   (random players, bots on one, auto-pass, pass-the-turn, resolve-the-stack, a concession with
   the stack full, a seat handed to a bot, the host changing) and end with one digest. Fuzzed.
   **Done 2026-11-18** (`server/src/room-copies.ts`, `npm run copies:fuzz -w server`): 480 games
   on tables of two to four seats with decks from the whole pool, half of them paced as a live
   room is, 404,000 inputs and 2,232 checks that every copy held the same game, with 291
   concessions, 631 changes of host, 524 seats handed to a bot and 618 states taken from another
   copy on the way: every copy identical in every game, once the two faults under "The room"
   were fixed. Nothing in it races: inputs are made one at a time and the order is the order of
   making, so what an order does with two inputs made at once is still step 3's and step 5's.
3. **Tables on the server.** *Check*: the loopback suite with scripted clients; main still
   imports no engine. **Done 2026-11-18** (`test/tables.test.ts`, `test/tables-e2e.test.ts`):
   over real sockets, against rooms on this thread and on worker threads, three devices (two
   people, one watching, a bot on the host's) play a table through the server's order and end
   with one digest; the host's device goes and the next runs the bots; a device comes back to
   its seat with the whole log; the host deals a rematch; a lobby with a device that can't hold a
   copy, or two builds, starts on the server. `tables.ts` is in the main-side import guard.
4. **The client.** *Check*: an e2e test with two browser contexts playing two people and a bot;
   the server's `/status` shows a table and no room; the same lobby with one client unable falls
   back to a server room; and (moved here from step 5, which had no page to measure) click to
   frame on a slowed network. **Done 2026-11-18** (`client/e2e/tables.spec.ts`,
   `server/src/test/local-tables.test.ts`, `client/src/local/tableSocket.test.ts`): two pages and
   a bot play a table for turns, the server's status naming a table and no room and neither
   page sending a room's message; every connection dropped and both pages back in their seats;
   a third page watching by the room's code; one page reloaded mid-game; both conceding and the
   host's rematch dealt to all three; and the same lobby with one page that can't starting on
   the server. In Node, a `LocalRoomHost` a device over the real `Tables`: an undo reaches the
   page as one frame and a notice (shown to fail with the frames not held), a rejoin, a
   rematch, a copy dealt again after losing its place. The measure is under "The client".
5. **Own inputs at once, and the undo.** *Check*: a unit test of a concession racing an action;
   tables fuzzed with every message racing. **Done 2026-11-18**, ahead of step 4 (the user:
   "Step 5"), since the client is simpler to build on a copy that is already right when inputs
   race (`test/table-races.test.ts`, `npm run tables:fuzz -w server`): a move made as someone
   concedes is undone and left to the person; one made as a setting lands is made again; a host's
   run of bot moves cut by an input is dropped from there and made again; two opening hands kept
   at once land in the server's order; and 480 fuzzed games with every message racing (964
   undos, 8,971 refusals) ended with one game on every copy ("The undo").
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

- **Copies that disagree across browsers or builds.** The one thing that could make the whole
  shape wrong: if they disagreed often, a guest's game would keep jumping to the host's. Across
  browsers step 1 found no disagreement at all (30 games, three engines). Across two builds of
  our own engine it is still untested, and there a difference is expected whenever a deploy
  changes behaviour: the digest check and the host's state are the answer, and a table started
  on one build should stay on it where it can.
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
