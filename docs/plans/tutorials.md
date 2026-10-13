# Tutorials

Status: **planning** (2026-10-12; the user's answers 2026-10-13) — a technical plan, nothing
built. The user's decisions are recorded at the end and shape everything above them.

Two tutorials, asked for together (the user, 2026-10-12):

- **Learn Commander** — for someone who doesn't know how to play: one or two whole games on
  seeded decks built for the tutorial, against an opponent that plays a script, with the lessons
  as chapters inside them.
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
  ring and spotlight cut-out around the anchor. **Other clicks are blocked** (the user's call): a
  full-screen catcher under the card and over the page passes clicks through only inside the
  spotlight's hole, plus the card's own buttons and an always-present way out (Skip / Exit
  tutorial); keyboard shortcuts that would act (Space to pass) are swallowed the same way.
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
  *Learn Commander* and *Tour the site*, each with its progress. **On a first visit** (no
  `mtg.tutorials` key yet), a small, non-blocking callout rises beside the "?" button — "New
  here? Take the tour or learn to play" — with the two choices and a dismiss; dismissed or
  followed, it's recorded and never shown again. It doesn't cover the page's actions or delay
  blitzing.
- **Voice**: friendly — a short line of encouragement around each instruction, never more than
  two or three sentences on a card; the copy lives beside each step's data.

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

**One or two whole games, not a string of separate boards** (the user's call: as many lessons as
it takes, which could fit in one or two games). Each game starts from a board and runs to its
end; the "lessons" are chapters triggered by what happens in it.

- **Seeded decks built for the tutorial** (the user's call): a small, fixed list for each side,
  libraries set top first, so every draw is known and the chapters land on the turns written for
  them. Kept short (a few turns each game), with simple cards that show one idea each.
- **Chapters**: a chapter opens on a game moment (`turn-began` for turn N, `step-began`, a card
  drawn, the opponent casting a spell) and closes on a goal, the server checking both from the
  event log. The draft order, folded into the games:
  - **Game 1, the basics**: the table (life 40, command zone, library, hand, graveyard, the phase
    track) → play a land and tap it → cast a creature (summoning sickness) → the turn and
    priority (Pass) → attack, and the opponent's scripted block → cast your commander from the
    command zone → block their attack → finish them off.
  - **Game 2, Commander's own rules** (if one game can't hold it all): commander damage (21),
    the commander dying and going back to the command zone, recasting it with tax, instants and
    the stack (respond to their removal), a three-player table and choosing whom to attack.
- **Retry without a restart**: a snapshot (`game.snapshot()`) at each chapter's start, so a wrong
  turn ("you attacked into a bigger blocker") can rewind to the chapter rather than the game —
  `TutorialSession` swaps in a room built from the snapshot (`Game.fromSnapshot`).
- **Blocking clicks** means each chapter's goal must be reachable inside its spotlight: the
  scripted opponent and the seeded draws make the board known, so each step can name the tile
  or button to press.

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
   scripted bot moved into `server/src` with its script, chapter triggers and goals and the `Room`
   hook, chapter snapshots for retry, the spec additions; game 1's first chapters end to end as
   the proof, with a server test that plays the scripted right answers (as
   `manual-check-presets.test.ts` builds every preset).
3. **The in-game tour stops**, on a tutorial-room board.
4. **The tutorial games**: the seeded decks, game 1's chapters, then game 2's if needed, each
   with a server test that plays the scripted right answers to the end and an e2e smoke.
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

## The user's decisions (2026-10-13)

1. **Lesson count**: as many as it takes — it could fit in one or two games. → Learn Commander is
   one or two whole games with the lessons as chapters (section 3).
2. **Decks**: seeded custom decks made for the tutorial.
3. **Guidance**: block other clicks — the spotlight is the only thing that can be clicked, plus a
   way out.
4. **First visit**: a non-invasive indicator recommends it; the tutorial isn't forced.
5. **Voice**: friendlier.
