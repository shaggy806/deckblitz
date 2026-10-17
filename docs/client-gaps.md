# Client / UI gaps

The detail behind `BACKLOG.md`'s "Client / UI" items: what the client can't show or ask yet,
and the cleanups found along the way. `BACKLOG.md` keeps one line per item under the same bold
title; when one lands, delete it here and move its `BACKLOG.md` line to `COMPLETED.md`. The animation follow-ups are in
`docs/plans/legibility-of-play.md`, "Follow-ups".

- **A gift's opponent is asked one opponent at a time** (rule 702.174a): with two or more
  opponents the caster answers a yes-or-no `choose-modes` `about` each in turn, the last one
  left taking it. One prompt naming every opponent (picked on their panels) would read better;
  the engine side is `promptNextGift`.
- **What the scenario builder can't say yet** (`docs/plans/scenario-builder.md`). A
  `ScenarioSpec` has no controller apart from the owner (a stolen permanent), no transformed or
  face-down card, no effects lasting a turn, and nothing on the stack — so "Edit from here"
  leaves all of those behind (and drops damage a creature can no longer hold without them). The
  turn number, a commander's cast count and damage marked are fields since 2026-10-13. A commander placed in a library goes to its
  bottom, whatever its place in the list. Each is a field on `ScenarioCard`/`ScenarioSpec` and a
  step in `server/src/builder.ts`'s `buildScenario` and `snapshotScenario`.
- **One art-crop primitive (from the 2026-09-28 rendering audit).** The client draws a card
  eleven ways: `CardTile` in two layouts (title: stack, zone viewer, every hover card;
  art-first: hand, library top, cast spotlight, reveals), `MiniTile` (battlefield),
  `CommanderTile` (command zone), `CommanderDamageChip`, the card back, `CardImage` (library,
  replacement review), the lobby's `CommanderArt`, `PrintingPicker`'s thumbnails, the deck
  builder's text rows and the landing hero. Each shape answers a size the others can't, so
  merging them isn't worth it. What is duplicated is the art lookup:
  `queueArtLookup` / `isArtPending` / `resolveArtUrl` / `recordArtFailure` and the tint
  fallback, repeated in `CardTile`, `MiniTile`, `CommanderTile`, `CommanderDamageChip`,
  `CardImage` and `deck-builder/ReplacementReview.tsx` (`CommanderArt` only resolves a URL).
  Extract one `ArtCrop` component; and `PrintingPicker`'s raw `<img>` could be a `CardImage`.
- **Large live mana amounts by hand.** "X mana in any combination" offers every split as its
  own menu entry only while the list stays small (two colours up to X = 22). Past that it
  offers all of one type per type, and a count picker would let the player choose any split.
  And when the payer taps such a source for more than a payment needs, the player can't choose
  the colour of what floats. The rest of `effect:mana-ability-dynamic-amount` is built.
- **Quality-of-life room options (house rules).** Options the room creator can turn on before a
  game that are technically against the rules but make play smoother. The user's example: mana
  that, when tapped, doesn't have its colour decided until it's spent on a specific coloured
  cost. Each would be an opt-in room setting, off by default, since the engine otherwise follows
  the Comprehensive Rules exactly: a field in the lobby's `RoomSettingsPanel` and a key on
  `protocol`'s `RoomSettings`, checked in `PendingRoom.setSettings` and applied in
  `toGameConfig`, as starting life and the first player are.
- **Server-side deck save and share** is still unscoped. Decks live in `localStorage`.
- **The library and the deck builder load every card definition.** Both fetch all 32 card
  shards (`client/src/cards/cardData.ts`): about 3.1 MB, 610 kB gzipped, at 5,400 cards; 6.3 MB
  (1.26 MB brotli) at 12,089 definitions on 2026-10-13, and growing with the pool. Running the
  shards blocks the page in one go (~0.25 s on a fast desktop, then ~0.3 s assembling and
  drawing the library), so the bar can't repaint and seems to stall near the end — the user saw
  it on the live site (2026-10-13); the largest JS cost is the definition builder's defaults.
  **Their stall (postponed, 2026-10-13):** in their own Chrome, only on the first visit (a reload
  is instant), on this same PC. Not reproduced: cold loads in fresh Chrome and Edge profiles and
  Playwright's Chromium on the same PC and network all showed cards in 0.7–0.85 s with no long
  task. Suspects: an extension in their profile, or the CPU pegged by test runs at the time. Next:
  have them try an incognito window, and time the stall.
  **It's a request that never answers, not a freeze (2026-10-14):** the user's next stall sat at
  94% on the loading bar, which is 30 of the 32 card shards (`PoolLoading.tsx` counts shards), so
  two shard requests never came back. Not reproduced: the built-in browser on this PC loaded
  cleanly twice, and 15 rounds of all 32 shards fetched in parallel past Cloudflare's cache
  (480 requests, through the tunnel to Caddy) all answered 200 within 1.65 s. cloudflared logged
  QUIC tunnel connections dropping and reconnecting earlier that day (16:10, 17:56, 18:01 UTC),
  none near the stall; Caddy keeps no access log. Next time: the Network panel's pending rows
  (which shards, the protocol). Built the same day: a shard still out after 5 s with none
  arriving is asked for again under a `?retry=N` URL (`cards/cardData.ts`, `cards/shardFiles.ts`),
  so a hung request costs about 5 s rather than a reload. Why a request hangs is still unknown.
  The pages read only printed fields, each ability's text (colour identity)
  and the tokens a card makes. A generated catalog of just those, sharded the same way, would be
  a fraction of the size. The game page loads no definitions up front.
- **Copied triggers without targets aren't condensed on the stack** (the user, 2026-10-07).
  The user wants triggers that are copies of one another and have no targets shown as one stack
  entry, the way identical triggers already fold into one counted entry (`stackCount`). Scute
  Swarm is the example: each copy of it triggers on its own landfall, and the triggers stand as
  separate entries. Where the fold is decided hasn't been looked up yet.
- **"Same for all" covers only a trigger's yes-or-no "you may"**
  (`GameState.standingModeAnswers`). Not yet: a resolving trigger's choice among several modes, a
  "you may" asked after another decision in the same resolution (it parks, and loses
  `Game.resolvingTrigger`), the second player of an "each player may", and a trigger an effect
  granted (`grantedAbility` kind `modifier`, which has no signature).
- **The library's card viewer has no printings panel** (the user's ask, 2026-10-09). Add "just
  a scrollable list of all the sets/printings of a card"; clicking a printing changes the
  displayed one to it. Also keep the next/previous buttons still: today they move as the
  viewer box grows and shrinks with whether the card has associated tokens.
  `client/src/library/LibraryPage.tsx`, `library.css`.
- **The top strip still clips the phase track at 1024 wide** (2026-10-06 UI review). Moving bot
  speed into the Settings panel brought every step back at 1366x768, but at 1024 the track
  (`PhaseTrack`) still stops short: at EC on 2026-10-09, with the turn banner's round (added
  that day) already shortened to "R3" below 75rem. "Player 1 to act" and the text buttons
  (Settings, History, Capture, Seat) are what's left to shorten — icons, or the acting player
  folded into the turn banner.

**A forced look-and-choose still asks**

Yuriko, the Tiger's Shadow and Dark Confidant reveal the top card and put it into your hand: a
`look-and-choose` over the library with `count: 1, min: 1, max: 1`, so the zone picker opens on one
card that must be taken (seen live 2026-10-09). The engine could skip the `choose-from-zone` when
the eligible cards are exactly `min` = `max` and there's no order to pick (`Game`'s look-and-choose,
where the decision is raised); bots and the fuzzer answer it already.

- **A wordy card's rules text is illegible in the hand** (the user, 2026-10-15). Hovering The
  Dawning Archaic in the hand (Reach, a cost reduction, an attack trigger that casts from the
  graveyard) grows the card, but its rules text is shrunk to fit the frame and can't be read.
  The user isn't sure how to fix it; for discussion.
- **The game page's own rendering on a slow laptop** (2026-10-13/14). **Mostly fixed; one
  cost left, no Lite setting needed yet.** The user's i5-6300U laptop (2 cores / 4 threads,
  16 GB, Chrome 153, 1366x768) ran a local blitz on 2026-10-13 at ~42 fps with ~120 main-thread
  freezes a minute, the worst 762 ms (`docs/plans/local-rooms.md`, step 6). Fixed since: the
  board-fit search starts from the last width (`game/boardFit.ts`) and is skipped when a
  board's room and rows are unchanged, each seat's board ref is stable, and the stack glow and
  decision banner's pulse animate a pseudo-element's opacity on the compositor (d7f00bbf).

  **Measured on the laptop, 2026-10-14** (live site at e947bf60, driven through Claude in Chrome
  with an in-page probe: long tasks, long-animation-frame entries, rAF frame gaps; the
  "Tramplesaurus Rex" Ghalta precon with a bot playing the seat, so a real game; each run cut at
  game over):

  | run | bots think | opponents | minutes | fps | long tasks/min | worst | frame gaps >250 ms |
  |---|---|---|---|---|---|---|---|
  | 1 | in the page | Sidisi, Kykar, Zurgo (53 permanents) | ~6.5 | ~55 | ~15-20 | 340 ms | 10 |
  | 2 | on Lightsail | Muldrotha, Elsha, Karador (45) | 8.7 (not over) | 56.7 | 3.9 | 126 ms | 0 |
  | 3 | in the page | Yasova, Alesha, … (35) | 6.7 | 57.2 | 1.9 | 103 ms | 1 (at load) |

  (Run 1's probe kept counting a minute or two past game over, so its per-minute figure is a
  range.) **Not CPU contention**: run 3 had the bots in the page and was the quietest; the
  cost follows the board — what's on it and how much happens — not where the bots think. So the
  worker needs no yield or smaller budget. Bot decisions in the page: p90 84-88 ms, p99 302-498
  ms, the worst 417 ms and 1.56 s (the 300 ms budget overshoots between simulations, as on
  2026-10-13).

  **What's left** is run 1's ten 250-400 ms frames, all one thing: a frame's board landing.
  The long-animation-frame entries put them in `usePlayback`'s `show` (the timer that puts the
  next view on screen: the source position resolved against the live bundle), 290-340 ms of
  script of which 190-260 ms is forced style and layout, and React's scheduler right after with
  another 75-205 ms forced. That's the board mounting afresh (`Table` remounts per frame shown)
  and layout effects measuring it mid-render, on a 50-permanent board. The next step, when it's
  worth one: keep `Table` mounted across frames, then see which layout effect forces the
  layout (a dev-PC trace with the page throttled 4x is enough now that contention is ruled out).
  The smaller items: the active-seat `background-color` transition on `.app` (~2%), the tiles'
  hover `box-shadow` transitions, card flights the compositor refused (`ghost-flight`, reason
  4096). A Lite setting (Auto/Full/Lite, switched by measured freezes, not hardware hints) only if
  a busier board shows freezes again. To trace: the CDP `Tracing` domain with the
  devtools.timeline categories (plus `disabled-by-default-devtools.timeline.stack` for
  forced-layout call stacks) on a `vite preview` build, mapped through a `vite build
  --sourcemap` copy (trace call frames are 1-based). The laptop's own Chrome can be driven
  through Claude in Chrome (it's "Browser 2" there) with an in-page probe, no build needed.
- **Two tutorials: how to play Commander, and how to use the site** (the user, 2026-10-11/12).
  The plan is `docs/plans/tutorials.md`: a coach-mark overlay (`client/src/tutorial/`, `data-tour`
  anchors, progress in `localStorage`, a "?" button in the corner toolbar), and a production-safe
  tutorial room (games held on the server by id, a scripted name-based opponent promoted from
  dev-rooms' `ScriptedBot`, goals checked from the event log). The user's decisions (2026-10-13):
  one or two seeded games with lessons as chapters, custom decks, blocking clicks, a first-visit
  callout, a friendly voice. **Built 2026-10-13** (plan phases 1-2): the overlay and site tour,
  the tutorial room (`server/src/tutorial-session.ts`, `server/src/tutorials/`,
  `server/src/scripted-bot.ts`), and Learn Commander in the "?" menu playing `basics-proof`, a
  proof lesson (`LEARN_COMMANDER_LESSON` in `client/src/tutorial/lesson.ts` names it). Left: the
  seeded decks and the real chapters, the in-game tour stops, raising the hand tray while a hand
  card is spotlit, pausing the opponent under a Next card mid-game.
