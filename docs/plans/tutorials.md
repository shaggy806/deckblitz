# Tutorials

Status: **planning** (2026-10-12) — a technical plan, nothing built; the open questions for the
user are at the end.

Two tutorials, asked for together (the user, 2026-10-12):

- **Learn Commander** — for someone who doesn't know how to play: short lessons, each a real game
  on a board set up for it, against an opponent that plays a script.
- **Site tour** — for someone who knows Magic but not this site: guided pointers over the real
  pages (landing, blitz, deck builder, library, lobby, the game board).

They share two foundations — a coach-mark overlay on the client, and a tutorial room on the
server — so they're planned as one piece. Where the facts below cite code, they're from the
2026-10-12 survey of the repo.

## What exists to build on

- **Boards from data.** The scenario builder's `ScenarioSpec` (`protocol/src/scenario.ts`: seats,
  cards by zone with tapped/sick/counters/attachments, active player, step, library fill) becomes a
  game through `buildScenario` (`server/src/builder.ts`): `seed: 1, shuffle: false`, libraries listed
  top first, object ids deterministic for a given spec. `BuilderSession.swap()` replaces the room
  under the same code while keeping the human's seat and the frame count — exactly a "next step".
  A **frozen** room (`RoomOptions.frozen`) publishes a board and refuses every action: a ready-made
  "look at this" step.
- **Scripted opponents.** `RoomOptions.botController` seats any `PlayerController`.
  `ScriptedController` (`engine/src/controller.ts`) queues fixed actions with `when` guards;
  dev-rooms' `ScriptedBot` (`server/scripts/dev-rooms.mjs`) casts, attacks and blocks *by card name*
  and leaves the rest to v1 — the right shape, but it lives in a dev script.
- **Seeing what the player did.** Every frame carries the whole `view.events` log (`land-played`,
  `spell-cast`, `attackers-declared`, `blocker-declared`, `step-began`, `life-changed`,
  `player-lost`…); the server has `game.events` and a precedent for scanning it from a recorded
  index (`Room.interruptSince`).
- **Pointing at things.** Stable attributes already exist on the board — `data-obj-id`,
  `data-obj-ids`, `data-player-id`, `data-stack-id`, `data-abbr` (phase pips) — and
  `ui/highlight.ts`'s pulse is the nearest thing to a coach mark. Popovers portal to `<body>` and
  share `ui/useHoverPopover.ts`'s placement (flip, clamp, open left on the right half).
- **Words.** `ui/keywordReminders.ts` and `ui/textKeywords.ts` (reminder text for keywords and
  terms), `format.ts`'s `describeEvent` and `STEP_LABEL`, `game/waitingLabel.ts`.
- **A place for the button.** The corner toolbar (`ui/CornerToolbar.tsx`) on the landing page and
  both lobby screens was made for more square buttons beside Settings.

## What's missing (from the survey)

1. **No production path to a scripted board.** The builder is dev-only twice over: its messages need
   `--builder` (`ws-server.ts`), its client half needs `import.meta.env.DEV`. That's on purpose: a
   client can send any spec, and `state.builder.spec` shows every hand and library to every seat,
   play mode included.
2. **No scripted opponent in `server/src`**; the builder seats v2, which is time-budgeted and so not
   deterministic.
3. **Spec limits**: every game starts on turn 1 (the starting player skips the draw); no damage,
   stack, control changes, face-down or transformed cards, turn-long effects, commander cast
   count (tax), or start inside combat. `Game.fromSnapshot` can say all of it but needs a whole
   `GameState`.
4. **No step-progress hook**: `Room.dispatch`/`settle` emit nothing but a publish; the client's
   decision `mode` is local to `Table`.
5. **No overlay or coach-mark primitive**, and no `data-tour`-style anchors on the top strip, the
   decision banner's buttons, the Settings panel, the landing cards, the lobby or the deck builder.
6. **The board remounts every frame** (`Table key={shown.revision}`), and nothing is clickable while
   playback is busy — anchors must be found again each frame.
7. **Pages aren't client-routed**: `/library` and `/deck-builder` are full page loads, so a tour that
   crosses pages carries its place in `localStorage` (or a URL parameter).
8. **No progress storage** or "seen" flag anywhere.

## The shape

### 1. The coach-mark overlay (client, shared)

A small module, `client/src/tutorial/`:

- **`CoachLayer`**, mounted once at the app root and in the two lazy pages, portalled to `<body>`
  above everything that can cover an anchor (above `.anim-layer`'s 10001 and the Settings panel's
  10003). It draws one **card** (title, a few sentences, Next / Back / Skip) beside its anchor, an
  optional ring or spotlight cut-out around the anchor, and nothing else: the page underneath stays
  usable unless a step says otherwise.
- **A step** is data:
  `{ id, anchor, title, body, placement?, advance, spotlight?, blockOthers? }`, where `anchor` is a
  CSS selector (or a small resolver for "the tile of the card named X") and `advance` is one of
  `'next'` (the Next button), `{ click: selector }`, `{ visible: selector }`, or — in a tutorial
  room — `{ goal: id }` (the server said the goal was met, below).
- **Re-anchoring**: resolved every animation frame while a step is open (cheap: one
  `querySelector`), so a remounting board, a scrolling page or a resized window can't strand it;
  hidden, not misplaced, while the anchor is missing or playback is busy.
- **Anchors**: add `data-tour="…"` attributes to the controls the tours point at — top-strip
  buttons (Settings, History, Game), the phase track, `.priority-actions` (Pass, Pass Turn,
  Auto-pass, Resolve stack), the decision banner and its confirm/cancel, the corner toolbar, the
  landing cards and blitz button, the lobby's add-bot / deck / ready / Start Game, the deck
  builder's import and deck list, the library's search and filters. Class names stay the styling
  hooks; `data-tour` is the contract the tours depend on, so restyling can't silently break them.
  An e2e spec walks each tour and fails when an anchor goes missing.
- **Progress**: one `localStorage` key, `mtg.tutorials`
  (`{ tour: { done, at }, lessons: { [id]: 'done' } }`), read through a tiny store like
  `passSettings.ts`'s. The site tour's place survives the full page loads to `/library` and
  `/deck-builder` through it.
- **Entry**: a **"?" square button** in the corner toolbar, beside Settings, opening a small menu:
  *Learn Commander* (the lessons, with ticks) and *Tour the site*. Whether it also offers itself to
  a first-time visitor is an open question.

### 2. The tutorial room (server, for the lessons and the in-game tour stops)

A production-safe sibling of the builder:

- **Lessons live on the server**, as data in `server/src/tutorials/` — a lesson table keyed by id.
  The client asks for a lesson **by id only** (`tutorial-create { lesson, hostToken }`); it never
  sends a spec, so nothing like the builder's "any card anywhere" reaches production.
- **`TutorialSession`**, modelled on `BuilderSession`: builds each step's board with `buildScenario`
  (or `Game.fromSnapshot` for a state a spec can't say), seats the scripted opponent, and moves
  between steps with the same `swap()` (keeps the human's seat and the frame count). Explanatory
  steps can be frozen rooms. Registered and reaped by `RoomManager` like builder sessions; the
  ordinary `create-room` rate limits apply.
- **No hidden-card leak**: the `state` push gets a `tutorial?: { lesson, step, goals }` field
  instead of `builder` — never the spec. Views stay the ordinary redacted `viewFor`.
- **A scripted opponent in `server/src`**: promote dev-rooms' `ScriptedBot` to
  `server/src/scripted-bot.ts` and give it a small name-based script —
  `{ on: { turn?, step }, do: 'cast' | 'attack' | 'block' | 'activate' | 'pass', card?, target?,
  at? }` — resolved against the live view by card name, with v1 answering anything the script
  doesn't (a fixed fallback, never v2's time-budgeted search). With `seed: 1`, `shuffle: false` and
  listed libraries, a lesson plays the same way every time.
- **Goals checked on the server**, where the truth is: a step's goals are predicates over the
  events since the step began (the `interruptSince` pattern) —
  `{ event: 'land-played' }`, `{ event: 'spell-cast', card: 'Llanowar Elves' }`,
  `{ event: 'attackers-declared', atLeast: 1 }`, `{ lifeAtMost: { player: 'bob', value: 30 } }`,
  `{ event: 'player-lost', player: 'bob' }`. `Room` gets one hook (after each `settle`) for the
  session to check them; a met goal marks the step done in the `tutorial` field and, when the step
  says so, swaps to the next board.
- **Spec additions** the lessons need (each a field on `ScenarioSpec` and a step in
  `buildScenario`/`snapshotScenario`, also closing builder gaps in `BACKLOG.md`): the **turn
  number**, a **commander's cast count** (tax), and **damage marked**. The stack and combat-step
  starts aren't needed if lessons begin before them.

### 3. Learn Commander (content on the room)

Each lesson is one board (or a few), a script for the opponent, and steps with goals. A draft
syllabus, shortest first — each 2–5 minutes, each ending with something won:

1. **The table** (frozen): life 40, the command zone and your commander, library, hand,
   battlefield, graveyard; whose turn; the phase track.
2. **Lands and mana**: play a land, tap it, cast a two-drop; summoning sickness.
3. **The turn**: untap, draw, main, combat, end; priority and Pass.
4. **Combat**: attack, the opponent's scripted block, damage; blocking their attack.
5. **Your commander**: cast it from the command zone; it dies — command zone or graveyard;
   recast for {2} more (tax).
6. **Commander damage and the table**: 21 from one commander; attacking a chosen opponent at a
   three-player table.
7. **Instants and the stack**: the opponent casts a removal spell; respond with a protection
   spell; the stack resolves last in, first out.
8. **Card types in play**: artifacts, enchantments, a planeswalker, removal — one board each, short.
9. **A real game**: a short game against one opponent on two small fixed decks, the tutorial's
   pointers switched off unless asked for, then an offer to blitz.

The lessons use a **teaching deck** — a fixed, simple list (a mono-colour or two-colour precon
from `SAMPLE_DECKS` cut down, or one built for it) — so the hand and draws are known.

### 4. The site tour (content on the overlay)

Client-only except for its in-game part:

- **Landing**: Blitz (and what it needs on the clipboard), Create a game, Join by code, Deck builder,
  Card library, the Settings cog.
- **Deck builder**: import a list, starter decks, the active deck, the stand-in review.
- **Library**: search, colour and type filters, the Set filter, a card's printings.
- **Lobby**: seats, Add bot, a seat's deck, room settings, Ready, Start Game, the invite link.
- **In a game** (a tutorial room with a fixed board, so every anchor exists): the four quadrants,
  hover cards and keyword tips, the phase track and stops, Pass / Pass Turn / Auto-pass / Resolve
  stack, the decision banner, the History, the Game menu, in-game Settings.

## Build order

1. **The overlay alone**: `CoachLayer`, steps as data, `data-tour` anchors, progress storage, the
   "?" button and menu; the site tour's landing, deck builder, library and lobby stops (no server
   work). An e2e spec walks the tour.
2. **The tutorial room**: protocol messages and the `tutorial` field, `TutorialSession`, the
   scripted bot moved into `server/src` with its script, goal predicates and the `Room` hook, the
   spec additions; one lesson end to end (lesson 2) as the proof, with a server test that plays its
   scripted right answers to the end (as `manual-check-presets.test.ts` builds every preset).
3. **The in-game tour stops**, on a tutorial-room board.
4. **The lessons**, one per batch, each with its server test and an e2e smoke.
5. **Polish**: skip and replay, a lesson picker with progress, the copy read aloud end to end.

Each phase is checked live at ~768px tall, 1920x1080 and 2560x1440 (the standing UI rule); lesson
boards are two-player unless the lesson is about the table.

## Risks

- **Anchors drifting** as the UI changes — `data-tour` plus the e2e walk make it a test failure, not
  a silent broken tour.
- **The engine changing under a lesson** (a card's definition, the bots' fallback) — each lesson's
  server test replays its right answers and fails if the board no longer reaches its goals.
- **Copy rot** — every lesson's text in one place per lesson, next to its board.
- **Cost on the live server**: a tutorial room is a normal room plus a script; the fixed fallback
  (v1) is cheaper than v2.

## Open questions for the user

1. **Scope of Learn Commander**: the nine-lesson syllabus above, or fewer and longer? Is lesson 9 (a
   short real game) wanted, or does the tutorial end by handing over to Blitz?
2. **The teaching deck**: a cut-down precon from `SAMPLE_DECKS`, or a deck built for it (and which
   commander)?
3. **How firm the guidance is**: pointers that can be ignored, or spotlight steps that block other
   clicks until the goal is met (more hand-holding, more chance of feeling stuck)?
4. **First visit**: should the site offer the tour (or Learn Commander) to someone arriving for the
   first time, or only from the "?" button?
5. **Voice**: terse instructions ("Play a land.") or a friendlier narrator?
