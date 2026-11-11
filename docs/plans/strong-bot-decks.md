# Strong Commander decks for the bots

Status: **shipped as an optional pool, and closed there** (2026-11-11, the user's decision after the
pilot failed its gate twice, below). The eight pilot decks are `STRONG_DECKS`: what the lobby's
"Strong" button deals a bot (an open seat has three "Add bot" buttons: Precon, Upgraded, Strong),
for bots only, published with the user's go-ahead and with no stand-ins
left (all ten missing cards were built by 2026-11-10). **A blitz doesn't deal them**: it deals the
upgraded precons, which were rebuilt by hand for all fourteen precons instead
(`upgraded-decks.md`), so this plan's steps 4 and 5 (widen to 30 decks, make them the blitz
default) are dropped, and "Left out on purpose"'s line about the other nine precons is reversed.
What shipped differs from "Credit" below in one way: the credit is the deck's name and the About
page's list of links, with no `WireDeck.credit` and no link in the lobby seat. **Open:** the About
page doesn't yet say how a creator can ask for a deck's removal (the site has no contact route).

The user's terms: **bracket 4 (optimized) decks that real people built, never averages** (an
average deck is nobody's deck), and **each one credited to its creator.**

## Why now, and what's different

`upgraded-decks.md` (2026-10-07) built five upgrades by hand from EDHREC's precon pages. Tuned lists
were set aside then partly because they needed 7-15 stand-ins each. That reason has gone:

| Measured 2026-11-09 | |
|---|---|
| Missing from the top 2,000 Commander cards | 1 |
| Missing from the top 5,000 | 115 |
| Missing from the top 500 commanders | 12 |
| Non-basic cards of 4 real bracket 4 decks in the pool | 279 of 281 |

The four are among the most-viewed bracket 4 decks of Krenko, Edgar Markov, The Ur-Dragon and
Y'shtola. Krenko's and The Ur-Dragon's were read nearly whole; Edgar's and Y'shtola's only in part.
The two misses are both The Ur-Dragon's (Scalelord Reckoner, Scion of the Ur-Dragon). A small
sample of popular decks: step 1 prints the real figure.

## The source: Archidekt

`archidekt.com/api/decks/v3/?commanderName=…&deckFormat=3&edhBracket=4&orderBy=-viewCount` lists
real decks, up to 1,000 per commander, each with its name, views, last update, size, and `owner`
(`username`). `archidekt.com/api/decks/<id>/` gives the deck itself: `cards[].card.oracleCard.name`,
`quantity`, and `categories`, whose `includedInDeck` separates the deck from its Maybeboard.

- Moxfield's API refuses scripts (`upgraded-decks.md`). EDHREC lists real bracket 4 decks too
  (`pages/decks/<slug>/optimized.json`) but has no creator or deck name, and its deck pages answered
  403.
- **Only decks that are public, listed and built**: `private`, `unlisted` and `theorycrafted` all
  false, updated in the last 18 months, exactly 100 cards, legal by `deck-validation.ts`.
- Trust `includedInDeck`, not the entry count: the decks hold token entries (Dragon, Treasure, Copy)
  as well as Maybeboards.
- `edhBracket` is the creator's own label. Titles such as "cEDHish" and "Turbo Doomstorm" turn up at
  4. Step 4's games decide; a title naming combo or cEDH is skipped outright.
- **No script or agent touches Archidekt.** Its terms (`archidekt.com/terms`, read 2026-11-09)
  prohibit using software "to generate automated searches, requests, or queries to the Site", so
  the API above is a description of the site's data, not something to call. The user's call,
  2026-11-09: Claude names the decks, the user opens each page and copies the list by hand.

## No altered lists

A list under someone's name must be the list they built. So **a deck with any card the pool lacks
isn't used**: there's no substitution table for these, unlike the precons. With up to 1,000 decks a
commander there's room to be strict. If step 1 finds a commander with none fully playable, that
commander waits.

## Credit

- **`SampleDeck.credit`**: `{ author, archidektId, fetched }`. The link is always built as
  `https://archidekt.com/decks/<id>` from the number, so no stored URL reaches a browser.
- **In the name too**: `Edgar Markov by Ozymandias-`, so the credit travels everywhere
  `WireDeck.name` already goes (seats, game log) with no new plumbing. The commander's name is used
  rather than the deck's own title, which may be crude or long ("Stinky Piss Boys", "High Power
  Aristocrats Edgar Markov; Guide at the bottom").
- **The link** in the lobby seat (`SeatBoard.tsx`) and the deck builder's starter intro, labelled
  with Archidekt and the date taken, since the page shows the creator's latest version and ours is
  a snapshot. `WireDeck` gains the optional `credit`; the server checks a number and a short string.
- A copy made in the deck builder keeps the link, as "based on".
- The About page says where these decks come from and how a creator can have theirs removed.
  Removing one is deleting its entry. Each kept deck's name is read by hand before shipping.

## The risk is the pilot, not the list

The last round's result is the main thing this plan has to answer. Of five upgrades, **one**
measured stronger (Temur Roar, 35% to 69%). The other four were within noise, and two came out a
shade under: Jeskai, which added counterspells and cut its sweepers, and Sultai, which traded big
bodies for graveyard engines. So a better list isn't automatically a stronger bot, and real bracket
4 decks lean harder on what the bots do worst: Vampiric Tutor, Necropotence, Mox Diamond, Force of
Will. What's known about v2:

- It seems to do best with big threats on the board: its strongest result is a Dragon deck.
- **Tutors are weak by construction.** `bot/eval-bot.ts`'s `byManaValue` tries the choices highest
  mana value first under a cap of 32 (`MAX_DECISION_CANDIDATES`), and the evaluation prices a card
  in hand at a flat rate, so a rollout probably can't tell the right tutor target from a large one.
  To be confirmed in step 3.
- It has no idea of a two-card combo, and only one deck has a bias (`deck-bias.ts`: Teval).

Hence the order below: a small pilot before any wide build, with a gate that can stop it.

## The steps

1. **Fetch and generate.** One session.
   - The user's copied lists, each with its link and creator, checked in under
     `engine/data/archidekt-decks/` (names, quantities, creator, id, date taken). Step 4's decks
     arrive the same way, so that step's 30 may shrink to what's worth copying.
   - A check over them reports the count, legality and any card the pool lacks. A deck that fails
     goes to its backup.
   - A generator writes `STRONG_DECKS` beside `UPGRADED_DECKS`, with `credit`.
   - `sample-decks.test.ts` extends to the new pool (and every one has a credit, no substitutions);
     `deck-pool.mjs` gains `--pool strong`.

2. **Pilot and gate.** Eight real decks: the most-viewed fully playable one of the four commanders
   above and four more, deliberately including a control deck, to learn what v2 can't pilot. Field
   them against the five upgraded decks with `bot:decks` (no new mode: 12 rounds, about 150 games,
   48 per deck, about 15 minutes on 18 workers).
   Add a **card-usage report** to the run: per card, how often it was drawn, cast, and held with the
   mana to cast it. A dead-card rate says far more per game than a card's win rate, which 48 games
   can't resolve.
   **Gate: the eight pooled win at least 30% of their seats** (384 deck-games, about ±4.5 points, so
   clear of the 25% fair share) **and no more than two fall under 15%.** If it fails, step 3 comes
   first and the pilot reruns; if it fails again, stop and report.

3. **Pilot fixes from what step 2 shows.** One timeboxed round, led by the usage report and
   `bot:autopsy` on the losses, under `bot-effect-knowledge`'s method: gate scenarios, `bot:diff`,
   with one `bot:ab` at most. Tutors first if confirmed, then whatever tops the dead-card list.
   `deck-bias.ts` entries where a deck plays against its own plan. The fix is always to the bot: a
   list can't be edited to suit it.

4. **Widen and select.** About 30 real decks from the top 500 commanders: single commanders first,
   spread over the colours and archetypes, and more than one deck for a commander only where it
   adds something. Screen all 30 with the five upgraded decks as anchors (8 rounds, about 256 games,
   32 per deck), then rerun the best 15 with the anchors (15 rounds, about 300 games, 60 per deck).
   About an hour of machine time in all. Keep about 16.
   A deck is out on any of: under 20% in the final, more timeouts than the field, or a worst
   decision well past the field's (token and doubling boards are the ones to watch).

5. **Ship.**
   - `BotDeckPool` gains `"strong"`: `protocol/src/room.ts`, `server/src/pending-room.ts`'s
     validation, `client/src/lobby/randomBotDeck.ts`, `RoomSettingsPanel.tsx`, the name lookup in
     `localStart.ts`, and `STARTER_DECKS` so the deck builder offers them. The credit as above.
   - **`BENCH_DECKS` stays as it is**, so every bot gate and bench stays comparable with its
     history. Whether a strong deck joins it is a later call, as with the upgrades.
   - Live check in the lobby at 2 and 4 players, and a solo game with the heaviest kept deck on the
     test laptop, since solo games run the bots in the browser.
   - Docs: this record's results, `docs/architecture/`, `BACKLOG.md` to `COMPLETED.md`.

## Pilot results (2026-11-09)

Eight real decks (`STRONG_DECKS`), 10 cards stood in by the card replacer, against the five upgraded
precons: `deck-winrates.mjs --pool strong --rounds 12 --workers 8 --timeout 1800`, 156 games, 48 a
deck, v2 in every seat.

| Deck | Win% | 95% CI |
|---|---|---|
| Temur Roar (Upgraded) | 66.7 | 53-78 |
| Giada | 37.5 | 25-52 |
| Pantlaza | 29.2 | 18-43 |
| Edgar Markov | 25.0 | 15-39 |
| The Ur-Dragon | 25.0 | 15-39 |
| Mardu Surge (Upgraded) | 20.8 | 12-34 |
| Atraxa | 20.8 | 12-34 |
| Abzan Armor (Upgraded) | 18.8 | 10-32 |
| Krenko | 18.8 | 10-32 |
| Sultai Arisen (Upgraded) | 16.7 | 9-30 |
| Y'shtola | 12.5 | 6-25 |
| Jeskai Striker (Upgraded) | 8.3 | 3-20 |
| Lathril | 4.2 | 1-14 |

**Gate failed**: the eight pooled won 83 of 384 seats, 21.6% (30% needed); two under 15% (allowed).
So real bracket 4 lists alone don't make stronger bots, as the October upgrades found. Temur Roar
(Upgraded) still beats them all: a board of big Dragons is what v2 plays best.

What the run found on the way:

- **A hang, fixed:** v2 moved Lightning Greaves' equip {0} back and forth for ever
  (`bot/activation-cap.ts`, pushed as c46a078c3). Found by the first attempt, at 18 workers.
- **18 workers is slower than 8 per game by about 2.3x**, so no faster overall, and it pushed games
  past the time limit. Not the workers' heap cap (272 s against 256 s uncapped). Use 8.
- **Seven games hit the 30-minute limit** and one crashed: v2's Marvin, Murderous Mimic ability
  was refused for an illegal target (seed 84). Both in `BACKLOG.md`.
- **Two draws are right:** Pantlaza's Polyraptor with Marauding Raptor is a mandatory loop (104.4b).
- **The card-usage report** (faces folded into their cards, after a fix to the tracker): Toxic
  Deluge cast in 0 of 10 games it could have been, Inkshield 0 of 10, Imperial Seal 1 of 16, Dig Up
  2 of 11, Smothering Tithe 3 of 13, Stroke of Midnight 6 of 29. Tutors and slow value cards, as
  expected.

## Step 3 and the rerun (2026-11-09)

Fixed on main from what the pilot showed:

- **c46a078c3**: the Greaves loop (`bot/activation-cap.ts`).
- **587c225f6**: a turn plan's step replayed with a target the real game had put elsewhere (the
  Marvin crash: Goblin Engineer's search found one card in the rollout, another in the game), and
  v1 taking library order from its own tutors, which v2 kept (Demonic Tutor found the next card).
  `bot:diff` against main: 6 of 11,199 decisions changed over 6 bench games; gate 202/202.

**The seven long games weren't loops.** Replayed on the pilot's own build, single decisions ran 40-80
simulations of 3-9 s each on 50-270 permanent boards (Pantlaza's discover chains, The Ur-Dragon's
1,097 legal actions): 240-475 s a decision. In live rooms the 1 s budget stops the search between
simulations, but not inside one, and the two baselines always run (`BACKLOG.md`).

The rerun gave every v2 decision the live rooms' 1 s (`deck-winrates.mjs --budget 1000`, new), so
a decision on a huge board can't run for minutes and the decks are measured as players meet them:

| Deck | Win% | 95% CI | First run |
|---|---|---|---|
| Temur Roar (Upgraded) | 47.9 | 34-62 | 66.7 |
| Edgar Markov | 41.7 | 29-56 | 25.0 |
| Giada | 33.3 | 22-47 | 37.5 |
| Atraxa | 31.3 | 20-45 | 20.8 |
| Pantlaza | 29.2 | 18-43 | 29.2 |
| Sultai Arisen (Upgraded) | 27.1 | 17-41 | 16.7 |
| The Ur-Dragon | 20.8 | 12-34 | 25.0 |
| Abzan Armor (Upgraded) | 18.8 | 10-32 | 18.8 |
| Mardu Surge (Upgraded) | 16.7 | 9-30 | 20.8 |
| Krenko | 16.7 | 9-30 | 18.8 |
| Y'shtola | 16.7 | 9-30 | 12.5 |
| Lathril | 10.4 | 5-22 | 4.2 |
| Jeskai Striker (Upgraded) | 8.3 | 3-20 | 8.3 |

**Gate failed again**: 96 of 384 seats, 25.0% (30% needed; about ±4.4 points, so up from 21.6% by
no more than noise); one deck under 15%. Two games still ran past 30 minutes, the long simulations
above. Tutors are cast more (Vampiric 26 of 43 games castable, Enlightened 14 of 17); Toxic Deluge
still 0 of 10, Dig Up 1 of 11.

What it says: the bots don't play real bracket 4 lists better than upgraded precons as a group, but
some decks hold up on their own. Edgar, Giada and Atraxa sit at or above every upgraded deck but
Temur Roar, the board-heavy, creature-first decks v2 plays best; the slow, interactive and
graveyard ones (Y'shtola, Lathril, Krenko's combo pieces) trail.

## Left out on purpose

- **Average lists, and substituted ones.** Above.
- **cEDH and bracket 5.** Those decks win by combos the bots don't know, and would lose to their own
  plan. A combo-aware bot is a project of its own.
- **Upgrading the other nine precons.** It repeats the method that moved one deck in five, on
  commanders chosen for being precons rather than for being strong.
- **Bracket labels in the lobby.** All of these are bracket 4 by their creators' own label, so a
  label adds little.

## Calls for the user

- **Power level:** decided, optimized (bracket 4).
- **What a blitz deals**, at step 5. Recommended: the strong pool, once it has passed step 4, since
  blitz is where a player goes to test a deck against real opposition. Rooms keep the current
  default of precons.
