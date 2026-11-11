# Client / UI gaps

The detail behind `BACKLOG.md`'s "Client / UI" items: what the client can't show or ask yet,
and the cleanups found along the way. `BACKLOG.md` keeps one line per item under the same bold
title; when one lands, delete it here and move its `BACKLOG.md` line to `COMPLETED.md`. The animation follow-ups are in
`docs/plans/legibility-of-play.md`, "Follow-ups".

- **Which seat you see while controlling another player** (open 2026-11-02, the user will decide after
  playing it; the Mindslaver checks in `docs/manual-checks.md` show it). Rule 723.4 only says what the
  controller may see, so this is a UI call.
  - **Option A, the flip (built):** `GameScreen` in `App.tsx` draws `Table` as `view.perspective`, so the
    controlled player's seat sits at the bottom, and flips back only for your own decisions that aren't
    just mana. Everything on the table is the seat you're acting for, but the view moves under you.
  - **Option B, your own seat with a clear marker (not built):** the table stays put, and a marker says
    whose decision it is, with their hand shown from across the table. You keep your bearings, but you
    act on cards and permanents away from where you usually do. It would need those seats' hand and
    prompts to work from the other side of the board.
- **Too many priority stops with a land like Bountiful Landscape** (found 2026-11-02, a UX pass; a design
  call). With one on the battlefield the game stopped at nearly every step of every player's turn, about 40
  stops in one four-player round. "Skip mana stops" doesn't cover a non-mana ability, and a fetch land or a
  utility land is in most Commander decks. That the ability is the cause is inferred from when the stops
  began, not tested alone. Auto-pass is the way out, but it paused on both opposing spells seen, each needing
  a "Resolve stack" click.
- **Blitz is the last thing on the landing page** (found 2026-11-02). The site's main feature comes after
  the navigation, in the same yellow as "Create a game", worded "Have a deck copied? Click here to blitz!".
  When the clipboard is refused, the paste form opens with its Blitz button just below the fold at 768px
  (top at 770, the page scrolls).
- **The lobby's starting life shows two controls** (found 2026-11-02). Starting life shows both the 20/30/40
  buttons and a field, and the small "Add bot" sits close under an open seat's "Pick a deck". (Ready is drawn as
  the primary button since 2026-11-11.)
- **The history log's layout** (found 2026-11-02). It's a full-screen popup, so it can't be read beside the
  board; each line carries its event number; and the phase banner ("MAIN PHASE") draws over it.
- **The hand's rules text is tiny at rest** (found 2026-11-02). At 1366×768 a hand card's rules are 9.5px and
  its type line 8.5px, on a tilted card; hovering makes one readable. The mulligan's fan looks the same.
- **The stack's card hides a seat's board** (found 2026-11-02). At 1366×768 it sits over the fourth player's
  board, just when you're deciding whether to respond to what's on it.
- **A hand card's Cycle, Foretell and Plot buttons are small** (found 2026-11-02). Plain buttons under the card,
  easy to miss. They aren't a popup, so there is nothing for Escape to close (the first report said otherwise).
- **The deck builder's hover preview can cover the search box and filters** (found 2026-11-02). The last of
  its rough edges; the rest landed 2026-11-11.
- **The game's top bar and labels stay small at 2560×1440** (found 2026-11-02). Judged by eye from a
  screenshot, on the user's own monitor size; measure before changing.
- **A spell's shown cost leaves out a target's tax** (found 2026-11-01). The cost drawn on the card and the X
  prompt's line don't add a `targetedBySpellsCost` tax (Boreal Elemental, Kopala). Targets the tax prices out of
  reach are no longer offered (`payableOptions`, 2026-11-11), so this is display only.
- **A hand card's types show as printed under a static outside the battlefield** (found
  2026-11-01). `view.ts` shows printed types for a card in hand under `typesOutsideBattlefield`
  (Conspiracy, Arcane Adaptation), though the filters read the new types.
- **Cultivate's split prompt doesn't say which find goes where** (found 2026-10-31). The older
  `restDestination` split (Cultivate, Kodama's Reach) asks "Choose up to 2 cards" without saying
  that the one picked goes onto the battlefield and the other to the hand. Fix: move those cards
  to `search-library.instead` with `pick: "one"` (built 2026-10-31), which asks its own prompt.
  Final Parting waits on the same thing (its split search just says "Choose 2 cards").

- **What the scenario builder can't say yet** (`docs/plans/scenario-builder.md`). A
  `ScenarioSpec` has no controller apart from the owner (a stolen permanent), no transformed or
  face-down card, no effects lasting a turn, and nothing on the stack — so "Edit from here"
  leaves all of those behind (and drops damage a creature can no longer hold without them). The
  turn number, a commander's cast count and damage marked are fields since 2026-10-13. A commander placed in a library goes to its
  bottom, whatever its place in the list. Each is a field on `ScenarioCard`/`ScenarioSpec` and a
  step in `server/src/builder.ts`'s `buildScenario` and `snapshotScenario`.
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

**A cast copy logs as "a card"**

The game log prints "a card resolves" for a cast copy and "commits a crime with a card", from
`format.ts`'s `spell-resolved` case and the crime line. A name lookup that fails falls through to
`logName`'s "a card" (it was the raw id until 2026-11-02), and the copy, gone by then, should be
named. Seen 2026-11-02 playing Collected Conjuring's copies; not caused by that family.

**The initiative and the venture marker have no animation**

The plan (`docs/plans/initiative-dungeons.md`, section 6) asks for two small cues through
`animationSchedule.ts`. One is the designation flying from panel to panel, which the monarch's
crown could share. The other is the marker stepping room to room while a map is open. Today the
chip just moves and the panel's "Undercity 2/5" ticks over. Separately, the scenario builder's
`ScenarioSpec` (`protocol/src/scenario.ts`) has no field for the initiative or a dungeon
position. "Edit from here" drops both, so a manual check has to reach them in play: cast an
initiative card.

**A soulbond pairing isn't drawn on the board**

Soulbond (rule 702.95, batch 185) pairs two creatures; the engine's view gives each a
`pairedWith` naming the other, absent when unpaired. The board shows only what the pairing
grants (Silverblade Paladin's double strike on both), not which two are paired, which matters
when two soulbond creatures are out or a partner is about to leave. A small link marker on both
cards (hovering one highlights the other, as an Aura's host is) would do.
