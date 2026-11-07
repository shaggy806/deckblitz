# Client / UI gaps

The detail behind `BACKLOG.md`'s "Client / UI" items: what the client can't show or ask yet,
and the cleanups found along the way. `BACKLOG.md` keeps one line per item under the same bold
title; when one lands, delete it here and move its `BACKLOG.md` line to `COMPLETED.md`. The animation follow-ups are in
`docs/plans/legibility-of-play.md`, "Follow-ups".

- **A resolved copy's and a crime's log lines name an object id** (found 2026-11-04): after a cast copy resolves the log prints its
  id ("obj-168", seen on paradigm's copy), and `client/src/format.ts:399` prints "commits a crime with obj-88" once an ability has
  resolved. `format.ts:303` says "takes nothing" on a look the player closes, where nothing was offered to take.
- **A target group's prompt doesn't pluralise its noun** (found 2026-11-04): "choose 3 creature" (Strength of the Tajuru), "any number
  of creature you control" (Eerie Interlude). `describeTargetSpec` in `engine/src/target.ts` pluralises only "target"; this needs a
  pluraliser over every spec label, the structured ones included.
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
- **Blitz starts an incomplete deck without a word** (found 2026-11-02). A 4-card list started a game with
  an empty library, and the notice only spoke of the one card left out. The lobby's default is "Any deck"
  too, so this may want a warning rather than a refusal.
- **The lobby doesn't show that Ready is the next step** (found 2026-11-02). Start Game is disabled with
  "Waiting for everyone to ready up…", and Ready is drawn as a plain button. An open seat's "Pick a deck"
  and the small "Add bot" compete with it, and starting life shows both the 20/30/40 buttons and a field.
- **Library search only matches exact phrases** (found 2026-11-02). "dragon" finds 519 and "flying" 3902,
  but "flying dragon" and "dragon flying" find 0, as does "atraxa praetors", and the box advertises name, type
  or rules text. Matching every word would fit. The deck builder's search wasn't checked.
- **The library can't sort by release date** (asked 2026-11-07). The user wants release date as a sort option.
  `client/src/library/LibraryPage.tsx`'s `SORTS` has edhrec, name, mana, color and type; the set list
  already carries each set's `releasedAt`.
- **The history log names a hidden draw once the card is public** (found 2026-11-02). "Silumgar draws Swamp"
  shows after the Swamp is played, which says what they drew. `publicNameAt` rightly finds nothing public at
  that moment, then `App.tsx`'s `nameAt` falls back to `game.nameOf`, today's name. Your own draws need that
  fallback, so it wants to apply only to what this seat could see then.
- **The history log's layout** (found 2026-11-02). It's a full-screen popup, so it can't be read beside the
  board; each line carries its event number; and the phase banner ("MAIN PHASE") draws over it.
- **The hand's rules text is tiny at rest** (found 2026-11-02). At 1366×768 a hand card's rules are 9.5px and
  its type line 8.5px, on a tilted card; hovering makes one readable. The mulligan's fan looks the same.
- **The stack's card hides a seat's board** (found 2026-11-02). At 1366×768 it sits over the fourth player's
  board, just when you're deciding whether to respond to what's on it.
- **The Cycle popup is easy to miss and ignores Escape** (found 2026-11-02). It's a small button under the
  hover card, and Escape leaves it open, though Escape closes Settings.
- **The pass buttons don't explain themselves** (found 2026-11-02). Auto-pass has a tooltip; "Pass (space)"
  and "Pass Turn" have none.
- **A hover card's reminder can name a keyword the card lacks** (found 2026-11-02). Dragonmaster Outcast
  shows a Flying reminder panel, read from "create a 5/5 red Dragon creature token with flying".
- **Deck builder rough edges** (found 2026-11-02). A long deck title is cut off ("IMPORTED: ATRAXA, PRAETOR");
  the hover preview can cover the search box and filters; the search box says 26980 while the colour-filtered
  count says 20874; re-importing makes a second deck of the same name; "1 issue(s)".
- **The game's top bar and labels stay small at 2560×1440** (found 2026-11-02). Judged by eye from a
  screenshot, on the user's own monitor size; measure before changing.
- **Two log lines read wrong** (found 2026-11-01). A card that begins on the battlefield from an opening
  hand logs as "takes Leyline Axe", and `delayed-trigger-created` prints as raw JSON (`format.ts` ~591).
- **Clear can't undo an attacker that already has a target** (found 2026-11-01). In `App.tsx`'s attack bar,
  Clear only empties `attackPicks`, so once a creature is in `attackAssignments` it stays disabled and each
  attacker has to be clicked off. All attack does that at two players, by giving a creature with one legal
  defender its target outright; at four players (2026-11-02) sending one attacker at a seat does too. Older
  than the night's work; seen playing Silent Arbiter's check.
- **The discard prompt says "any number" under a cap** (found 2026-11-01). `client/src/App.tsx`
  (~6015) words a discard with `atMost` (Jaya Ballard's +1) as "any number of cards". The engine
  enforces the cap, so only the wording is wrong.
- **The combat prompts' cost lines miss the per-creature taxes** (found 2026-11-01). The attack cost
  line ignores `attackTax.perAttacker` and the block prompt shows no cost, though `combat/tax.ts`
  works both out and the engine refuses a declaration that can't be paid.
- **The tap-cost prompt doesn't check a shared creature type** (found 2026-11-01). `App.tsx` (~4740)
  enables Confirm on the count alone, so a pair that shares no type (Weight of Conscience's
  `shareCreatureType` cost) is refused only by the engine; `creatureTypes` is on the offer.
- **The attack and block Confirm doesn't check company restrictions** (found 2026-11-01). An illegal
  declaration (a lone Mogg Flunkies, Craven Hulk) is refused with a toast rather than Confirm being
  disabled; `combat/company.ts` exports `attackCompanyViolations` and `blockCompanyViolations` for
  the client to read.
- **The X prompt and shown cost ignore a target's tax** (found 2026-11-01). `client/src/App.tsx`
  starts the X prompt at `maxX` and doesn't read `xCost.targetTaxes` or `maxXUnreduced`, so a taxed
  target at too high an X is refused rather than never offered (no wrong cast), and the spell's
  shown cost leaves out a `targetedBySpellsCost` tax (Boreal Elemental, Kopala).
- **A hand card's types show as printed under a static outside the battlefield** (found
  2026-11-01). `view.ts` shows printed types for a card in hand under `typesOutsideBattlefield`
  (Conspiracy, Arcane Adaptation), though the filters read the new types.
- **A lands-only prohibition writes no log line** (found 2026-11-01). `prohibit`'s `lands: true`
  (Turf Wound, Pardic Miner) emits no `prohibition-imposed` event, since `client/src/format.ts`'s
  text for it names only spells and abilities and would read "can't  this turn" (the comment is at
  `prohibitLandPlays` in `game.ts`). Fix: a `lands` field on the event and the client's text.
- **A human's target picks aren't narrowed by the new target relations** (found 2026-10-31).
  `viewTargetFacts` (`client/src/App.tsx`, ~line 640) doesn't supply the optional facts the
  target relations built that night read — `shareTypes`, `toughnessOf`, `nameOf`, `attachedTo` —
  so the client offers every legal-alone target (Legerdemain's second pick, V.A.T.S.'s equal
  toughness, Fiery Annihilation's Equipment) and the engine refuses a broken choice with an error
  when it's sent. The bots get the full facts. Fix: fill them in from the view.
- **Cultivate's split prompt doesn't say which find goes where** (found 2026-10-31). The older
  `restDestination` split (Cultivate, Kodama's Reach) asks "Choose up to 2 cards" without saying
  that the one picked goes onto the battlefield and the other to the hand. Fix: move those cards
  to `search-library.instead` with `pick: "one"` (built 2026-10-31), which asks its own prompt.
  Final Parting waits on the same thing (its split search just says "Choose 2 cards").

- **A processor's move from exile reads as "takes"** (found 2026-10-31). When a processor puts an
  opponent's exiled card into its owner's graveyard (Wasteland Strangler, `look-and-choose` with
  `zone: "exile"`), the log says "Alice takes Hill Giant", the wording of a card taken into a
  hand. Fix: word the `look-and-choose` result by its destination (a graveyard, the battlefield).

- **Playback stalls when your cast triggers your own targeted ability** (found 2026-10-30).
  Casting a spell that triggers one of your own abilities with a target — Glacial Ray with
  Briarknit Kami on the board, Lightning Bolt with Ichormoon Gauntlet — leaves the "ALICE CASTS"
  showcase on screen and the top strip at "Resolving…" for good: `usePlayback`'s `shown.busy`
  never clears, so the trigger's `choose-targets` banner never appears, though the engine is
  waiting on it (its `awaiting` is the `choose-targets`, the stack holds the spell). No page
  error. Reproduce with `node client/e2e/run-check.mjs "Ichormoon Gauntlet: choose a counter"
  "cast:Lightning Bolt" "player:Bob" wait`. Not yet checked whether a real browser outside the
  Playwright harness stalls too. Suspects: the cast frame's flight to the stack waiting in
  `endWhenDrawn` on a landing that never comes, the stack column not drawn on that frame.
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
- **A countered ability's log line names its object id** (2026-11-02). Seen live with Tishana's Tidebinder: the
  `spell-countered` event names an ability that has already left the stack, so `describeEvent` (`format.ts`) prints
  "obj-87 is countered". `Game` calls `rememberDepartingAbility` before it goes, so the name may only need reading there.
  A live Tranquil Frillback run logged the same kind of line, "Alice commits a crime with obj-171"; not traced.
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

**Split cards look like double-faced cards in the library**

The user, 2026-10-28: "the display for split cards in the library is odd. Presents them as mdfcs." A split card (rule 709) is one card with two halves side by side, not two faces; the library page (`client/src/library/LibraryPage.tsx`) shows it the way it shows a modal double-faced card.

**X is picked before targets, blind to a target's cost reduction**

A cast offer's `maxXUnreduced` says the largest X only a cost-reducing target (Spellwild Ouphe's
"spells that target it cost {2} less") pays for; the client asks for X before targets and doesn't
read it, so a player can pick an X the targets they then choose can't pay, and the engine refuses
the cast. Found 2026-11-06, re-landing Shatterskull Smashing.
