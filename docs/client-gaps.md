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

- **A touch view for phones and tablets** (the user, 2026-11-23: a friend plays on a phone and
  finds the hand hard to open; surveyed that day, and step 1 of the order below built). **Where
  it is headed** (the user, the same day, of the friend's screenshot): a phone shows the board
  as that screenshot does — the whole desktop board, every seat at once, drawn small — and
  never scrolls; what a finger has to hit or read is drawn large over it. So not a phone layout
  of its own. The rule: a touch device gets
  its own view and a mouse-and-keyboard player sees no change, so every change is gated on the
  device (`(hover: none) and (pointer: coarse)`, read once into a `data-touch` attribute on the
  root as `data-reduce-motion` is), never on window width alone. Surveyed in Playwright's
  Chromium with touch emulated (iPhone SE, 13 and 14 Pro Max, Pixel 7, iPad Mini and Pro 11, each
  upright and on its side), the landing page, library, deck builder and a 2- and a 4-player dev
  room; not on a real phone, and not in Safari. What it found, worst first:
  - *A tap is a hover and a click at once.* The lowered tray shows 22-32px of each hand card. A
    tap there raises the tray and, in the same tap, plays the card under the finger (a Plains was
    played by the tap meant to open the hand, iPhone 13 on its side and iPad Mini). With a phone
    upright the fan is as wide as the screen, so every lowered card is under the Pass bar: the
    tap meant for the hand pressed Pass and moved the game to declare attackers.
  - *The raised tray doesn't drop.* Nothing sends `mouseleave` until the next tap lands
    elsewhere, and that tap acts on whatever it hits. Raised on a phone on its side, the hand
    covers the player's whole battlefield.
  - *Your own permanents can't be read without using them.* A tap on a tile opens its card and
    clicks it: fine for an opponent's, but your own land is tapped for mana and your own
    creature is declared as an attacker. The card it opens is 96px wide on a phone, its rules
    text 7px.
  - *The top bar runs off a phone held upright.* At 390px wide History is cut, and Capture and
    the Game menu (leave, concede) are off the screen with no way to scroll to them; the phase
    track is gone too, so stops can't be set.
  - *A phone on its side has no room for the board.* At 750x342 each player's panel is ~110px
    tall and its head takes 60px of that: one row of 40px tiles shows, the rest scrolls inside
    the panel (fifteen of an opponent's creatures were below the fold in `SWARM`). Four players
    there, or upright, show one or two tiles a seat.
  - *Small targets and text.* About half the controls on the board are under 32px on a side
    (zone buttons 18px tall, phase steps 28x19, the top bar's buttons 19px tall); text on tiles
    is 7.3px on every phone.
  - *How the friend's phone showed it* (his screenshot, 2026-11-23: Chrome on a Samsung phone,
    upright). Not the 390-412px layout above: the page laid out ~980px wide and shrunk to the
    screen, which is Chrome's "Desktop site" setting (it ignores the page's viewport tag).
    Reproduced at 980x1668 with touch, the same picture: the whole desktop board and top bar,
    at 0.42 of their size. On the phone that makes Pass 45x13, Settings 27x9, a zone button 32x8,
    the lowered hand 12 tall and tile text 3. The device still reports `(hover: none)` and
    `(pointer: coarse)` there, though its user agent says desktop, so the flag above holds and
    a user-agent test would not. A touch device whose window is far wider than its screen
    (`innerWidth` against `screen.width`) is in this mode, and the page can't turn it off: a
    line telling the player to untick "Desktop site" is what it can do, once the upright phone
    view is worth switching to (today it loses the Game menu).
  - *What already works.* No page scrolls sideways at any size. Tablets get the desktop layout
    whole (iPad Mini on its side is 1024x768, close to the 1366x768 the suite runs at): there
    only the taps are wrong. The landing page, library and deck builder reflow to one column
    and are usable; the landing's "New here?" card covers the room-code field at 390px.
  **Built (step 1, 2026-11-23):** `ui/touch.ts` (the flag, and `--touch-k`: how many CSS
  pixels the page spends on one of the screen's, 2.38 for the friend's 980px page on a 412px
  screen); the lowered tray takes no taps and a **Hand** button, bottom left, raises and lowers
  it; a tap on a raised card picks it (grown, as a hovered one) and a second plays it, the tray
  going down after; the Hand button, the Pass bar, the decision banner and the hand's cards
  are sized by `--touch-k`, so they are a finger's size in either mode (44 of the screen's
  pixels tall; the hand's cards 96 wide, 158 picked); the page is `100dvh` tall by touch, so
  the address bar no longer makes it scroll. `e2e/touch-hand.spec.ts`. Desktop compared before
  and after at 1366x768, 1920x1080 and 2560x1440, tray lowered and hovered, 2 and 4 players:
  the same pixels, to the handful that differ between two runs of one build. **Not checked on a
  real phone or in Safari**: whether `screen.width` is the screen's own width in Chrome's
  Desktop site mode (if it reports the page's, `--touch-k` is 1 and the buttons are as small
  as before, no worse), and whether `100dvh` ends the scroll there.
  **Left, in order:** (2) reading — a tap on a permanent opens its card at a size to read, with
  what it can do as buttons, never acting in the same tap; (3) the rest of what a finger
  answers, sized by `--touch-k`: the mulligan, zone viewers, menus (ways to play, abilities),
  the X and number boxes, the top bar's buttons and menus; (4) a phone whose page is as wide
  as its screen laid out 980px wide too (the viewport tag set by script, on the game page
  only), so both modes are the one the user asked for, and the upright layout that loses the
  Game menu is gone; (5) what the tray should do after a card with a menu of ways to play is
  cast (it stays up now). Not measured: a room on a phone's own worker (local
  and replicated rooms load the engine and ~32,000 card definitions there), the mulligan,
  targeting arrows, zone viewers and decisions at phone sizes.

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

**B337's display gaps.** Found 2026-11-21 (batch 337's agents): Archangel of Strife's "each player
chooses war or peace" (`chooseOnEnterBy: "each-player"`, answers kept as `GameObject.chosenOnEnterBy`)
logs "Archangel of Strife chooses war" without naming the player, and `view.ts`'s `chosenOf` shows no
per-player answers on the card. Cloak and Dagger, Entwined's optional second target reads "choose
creature other than target 1 (optional)", the `other` slot's generic wording, where "that player
controls" would say what the slot is.

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

**The cohesion audit's changes.** Found 2026-11-21 (the user: "examine all the elements on each page
and in each stage of the game … list any changes that you think should be made to make the website
more cohesive"). A walk of the landing page, About, the card library, the deck builder, the lobby
and a game from the mulligan to the result, at 1920x1080 with a 1366x768 spot check, in Playwright
Chromium: a screenshot of each state, and every kind of control hovered and focused once with its
computed style read before and after. Each item is a place where one page or stage breaks a pattern
the rest of the site follows. The numbers are the audit's own and stay as items land, so "item 7"
means the same thing in every session. Not looked at: the scenario builder, the Capture panel and
the test-rooms menu (dev only), the tutorials past their first step, spectating, 2560x1440, and
most of the rarer decision prompts.

Site-wide:

1-3. Landed 2026-11-21 (`COMPLETED.md`): the focus ring, gold checkboxes, and `button.primary` on
   the confirming buttons. Two things left from item 3. **Pass (space) is still plain**, on
   purpose: it is the do-nothing answer, and lit for the whole game it would be the loudest thing
   on the board — the user's call. **The same gold comes from six classes**: `button.primary`,
   `.result-primary`, `.seat-panel-ready-btn.next`, `.coach-next`, `.bp-primary`, `.rr-primary`
   (and `.landing-cta`); fold them into `primary` when one is next touched. The decision banner's
   prompts were given `primary` by reading `App.tsx`'s buttons, and only the attack and damage
   ones were seen live: a prompt whose confirming button is still grey is a miss, not a choice.
4-12. Landed 2026-11-21 (`COMPLETED.md`): the primary button last in its row, Cancel and "Exit
   tour" as buttons, one link hover, "← Main menu" on every page, "Close" as a word, sentence-case
   labels, gold on a viewer that is a choice, the settings popover's headings, the smallest buttons
   at `--text-sm`. Item 10 was partly a misreading: the decision banner was never dark, its gold
   ring pulses (`.decision-banner::after`) and the screenshots caught it at both ends. Left from
   these: the help callout's "×" is the site's one bare × (a callout, not a dialog); the deck
   builder's row buttons (☆ − + ×) are still about 26x20; `.db-list-head` and a few other section
   labels are `--text-sm` where most are `--text-xs`.

Page by page:

13-15, 17, 18, 21, 22. Landed 2026-11-21 (`COMPLETED.md`): one page-title size (`--text-2xl`), the
   deck builder's chips capitalised, the library's printings rows drawn as rows, the deck builder's
   legal notice at the foot of its column, the lobby's "other" life box themed and "✓ Ready" under
   another seat, a targetable player panel tinting under the pointer, and a finished game's top bar
   and bottom strip.

Three are left, each a call for the user rather than a miss:

16. **The deck builder's hover preview** is the app's own text card where the library shows the
    card's image, and it opens over the rows beside the one hovered. The text card is instant and
    the image is a network load on every hover; which the builder should show is a product choice.
    Moving it off the list (to the side of the pane) is the smaller half.
19. **Card faces in a game.** Hand cards put the art above the name (`.card-tile.art-first`);
    board tiles, the zone viewer's cards and hover previews put the name above the art. The hand's
    layout reads as deliberate (the fan shows each card's top edge), so it was left.
20. **Corner radii in a game.** Board tiles 5px (`.mini-tile`), hand cards and commander tiles
    8px; the stack's "PROMPTED BY" label and targets (`.stack-entry-label`, `.stack-targets`), the
    dice caption and the zone viewer's gold pill (`--pill`) are 999px pills on an otherwise square
    interface. The pills are a family of their own (labels floating over cards), so squaring them
    is a look to choose, not a stray rule.
