# Client / UI gaps

The detail behind `BACKLOG.md`'s "Client / UI" items: what the client can't show or ask yet,
and the cleanups found along the way. `BACKLOG.md` keeps one line per item under the same bold
title; when one lands, delete it here and move its `BACKLOG.md` line to `COMPLETED.md`. The animation follow-ups are in
`docs/plans/legibility-of-play.md`, "Follow-ups".

- **B335's display gaps** (found 2026-11-18 by the overnight lane agents). A "hexproof from …" counter's chip
  shows the letter "H" rather than hexproof's glyph (`glyphFor`, one line; wants a live check). Callous
  Oppressor's log says "Callous Oppressor chooses Giant" without naming the opponent who chose. A keyed token is
  logged as "Vecna Token" while its tile says "Vecna" (how keyed tokens already behave). A decision popup can sit
  for a moment under the timed "Alice reveals" overlay (existing behaviour, seen with Manifold Insights). A card
  revealed on its way into a library (Wheel of Sun and Moon's `arrangesLibrary` order) shows as "a card" in the
  History, and Ertai's Meddling putting a card back onto the stack has no log line (it would want an event and a
  `format.ts` case).
- **B334's prompt and log wording** (found 2026-11-17 by the overnight lane agents). A `choose-modes` asked to
  pick an opponent or a life total logs as "Alice chose mode(s) 2" in the History (Verdant Mastery, Baleful
  Mastery, every `offerToAnOpponent`, Reverse the Sands): the log should name the choice. Gorex, the Tombshell's
  X prompt says "choose X" where it means "how many creature cards to exile" (an `xCost` flag and a label;
  Harvest Pyre's is the same). The graveyard blitz offer (Sabin, Tenacious Underdog) shows a generic "Cast
  (blitz)" without its discard or life part. The graveyard-card vote's popup (Custodi Squire) has no source
  name in its title. Boneyard Parley's pile fate reads "goes onto the battlefield" without "under your control".
  The Foretell button shows no cost now that Ranar and Cosmos Charger change it.

- **The Pass bar sits over the rightmost hand cards** (found 2026-11-11). At 1366x768 the fixed
  `.priority-actions` bar (Pass, Pass Turn, Auto-pass) covers the lower edges of the fan's last cards, and in the
  lowered tray their whole peek: the pointer moving onto that part of a card is over the bar, outside
  `.hand-strip`, so the raised tray drops (traced 2026-11-11 while fixing the hover bob). Options: keep the fan
  clear of the bar (narrower on short screens, or shifted left), or lift the bar above the raised tray's cards.

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

**The scenario builder can't hold the initiative or a dungeon position**

The scenario builder's
`ScenarioSpec` (`protocol/src/scenario.ts`) has no field for the initiative or a dungeon
position. "Edit from here" drops both, so a manual check has to reach them in play: cast an
initiative card.

**The scenario builder's damage cap ignores Zilortha.** Found 2026-11-16 (B333): under Zilortha,
Strength Incarnate lethal damage is judged by power (`lethalDamageOf`), but `BuilderPanel.tsx`'s
`selectedDamageMax` still caps a creature's marked damage below its toughness, so the panel offers
too little or too much; the server refuses an illegal board with the reason.

**A deck can't name its sticker sheets.** Found 2026-11-16 (B333, `docs/plans/stickers.md`): rule
123.2a has a deck that plays stickers bring its own sheets (at least ten). `DeckList.stickerSheets`
takes them, but the deck builder and the import set none, so a deck with a sticker card brings all
48 Unfinity sheets and three are dealt at random from those.

**A trigger asked again doesn't say which one it is.** Found 2026-11-16 (the check of prompts
beside other triggers): each trigger put on the stack asks for its own targets (rule 603.3d), so
Panharmonicon's second Ravenous Chupacabra trigger, or a Blood Artist's for each of five creatures
a Wrath took, asks "Choose targets for …" in the same words each time. The stack now draws the
"prompted by" card over the ones already placed (`game/decisionSource.ts`), which shows a new
question is being asked, but nothing says "2 of 5". The engine knows how many of the same ability
are still waiting (`GameState.pendingTriggers` beside `pendingTargetedTrigger`); the `choose-targets`
decision could carry the count for the banner.

**The image fallback's type line leaves out supertypes.** Found 2026-11-17 (the look at how long
type lines render), read in the code and not seen live: `CardImage.tsx`'s `CardImageFallback`, the
card-shaped stand-in the library and the deck builder draw when a card's image didn't load, builds
its type line from `def.types` and `def.subtypes` alone, so Boo reads "Creature — Hamster" and a
basic land "Land — Forest". `LibraryPage.tsx`'s `typeLineOf` and `CardTile.tsx`'s `typeLine` put
`def.supertypes` first (rule 205.4); 47 token definitions and every legendary, basic or snow card
have some. The fix is that one line, and a look at the fallback with an image blocked.

**A long keyword column runs behind the corner chip.** Found 2026-11-18 (fixing a bug report: a
stack of Pegasus tokens showed no flying, its disc behind the ×N pill), seen in the scenario
builder at 1366x768 with 30 permanents on one side: a summoning-sick Akroma, Angel of Wrath on a
~74px tile draws flying, first strike and vigilance down its left edge and haste in a second
column, and trample behind the "Z" chip. The keyword discs (`.mt-kw`, `App.css`) fill the art's
left edge from the top to 2px off its bottom and only then wrap; the chips (`.card-flags`) stack up
from the bottom-left corner and are drawn later, over them. It takes four keywords on the smallest
tiles, or more on larger ones, and any chip (summoning sick, goaded, suspected). A token stack's
discs already stop above one chip (`.mt-body:has(> .card-flags) > .mt-kw.below-stack`, the same
fix): the outline is that rule for every tile (`max-height: calc(100% - 17px)`), a check that two
or three chips stacked don't bring it back (the reserve is one chip's height), and a crowded dev
room for `e2e/stack-keywords.spec.ts` to measure, since its `KWSTK` tiles are too large to wrap.
