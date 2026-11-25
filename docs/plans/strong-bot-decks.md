# Strong Commander decks for the bots

Status: **the Archidekt decks are out, averages in** (2026-11-25, the last section): the user
decided no one's deck is used without their permission, so the eight decks this plan copied from
Archidekt left `STRONG_DECKS` for EDHREC's average Bracket 4 lists of seven of the same commanders;
Ureni and The First Sliver, whose builders gave their word, stay. Everything below that section's
heading is the record of the plan as it ran, the Archidekt decks included.

Before that: **shipped as an optional pool, and closed there** (2026-11-11, the user's decision after the
pilot failed its gate twice, below). The eight pilot decks, and since 2026-11-15 a ninth from
Moxfield (the last section), are `STRONG_DECKS`: what the lobby's
"Strong" button deals a bot (an open seat has three "Add bot" buttons: Precon, Upgraded, Strong),
for bots only until 2026-11-24 and a player's to bring since (the last section), published with the user's go-ahead and with no stand-ins
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

## A ninth deck, from Moxfield, and changed (2026-11-15)

The site owner's own Ureni of the Unwritten deck, "Here Be Dragons" by Shaggy5405 on Moxfield
(https://moxfield.com/decks/WIiaiQJlOEuEkYAPH9jmvQ), joined the pool the day Ureni left the
Temur Roar precon's command zone for being too strong there (`upgraded-decks.md`). It breaks
two of this plan's rules, on its creator's own word, and is the only deck that may:

- **It isn't from Archidekt.** `DeckCredit` takes a `url` in place of an Archidekt id, the
  About page links it, and its text says Archidekt or Moxfield. The list is hand-written in
  `sample-decks.ts` (`houseStrongDecks`), not generated: the generator still reads only the
  Archidekt lists.
- **It isn't played exactly as listed** (`credit.changed`, which the About page prints). For
  the bots' sake: Mirror Room // Fractured Realm, Virtue of Knowledge and Dracogenesis became
  Ancient Copper Dragon, Ancient Silver Dragon and Klauth, Unrivaled Ancient; and the eight
  lands that enter tapped and six basics became the upgraded decks' mana base (the three
  original duals, the other two shocks, the Triome, three fetches, the three bond lands, Cavern
  of Souls and Reflecting Pool). "No altered lists" stands for every list under another
  person's name.

**Does it hold its own?** The nine strong decks among themselves (`deck-winrates.mjs --pool
strong-only`, new), v2 in every seat at the live clock, 52 four-player games:

| deck | games | wins | win % |
|---|---|---|---|
| Ureni by Shaggy5405 | 20 | 9 | 45% |
| Edgar Markov by Ozymandias- | 24 | 9 | 38% |
| Pantlaza by DeltaCubes20 | 24 | 7 | 29% |
| The Ur-Dragon by Lat-er-alus | 24 | 6 | 25% |
| Giada by SmokyCashew01 | 24 | 5 | 21% |
| Atraxa by pmaddox | 24 | 5 | 21% |
| Krenko by MagicApple | 20 | 4 | 20% |
| Y'shtola by Scorge | 24 | 4 | 17% |
| Lathril by joedf | 24 | 1 | 4% |

It does, and more: top of the pool, winning on turn 27 on average, though twenty games put
its rate anywhere from 26% to 66%. A board of big fliers is what v2 plays best
(`upgraded-decks.md` says the same of Temur Roar). A first run of 39 games at 14 workers, too
many for clocked games, had it at 45% as well.

## A tenth deck, a player's own (2026-11-24)

pbToast's "Prince Rupert's Packed Penthouse" (The First Sliver: five colours of big creatures on
a deep mana base) joined the pool on the user's word, as pbToast played it on this site against
the Ur-Dragon, Giada and Ureni decks (room 7MU75, taken from the game's record in `games/`). It is
on no deck site, so its credit has neither an Archidekt id nor a `url`, and the About page shows
its title unlinked; it is played exactly as listed. Hand-written in `houseStrongDecks` with Ureni.

**Does it hold its own?** The user's condition was a decent win rate. Against those three decks,
v2 in every seat at count budgets (`bot:losses --seeds 1-24`, the deck read from a file:
`findDeck` takes a `.json` deck), it won 5 of 19 decided games (26%, a quarter being an even
share), Ureni 8, The Ur-Dragon 5, Giada 1. Every win came in a long game: 11 games ran past 15
minutes, and of the 6 of those that finished inside 45 minutes it won 5; 5 still hadn't finished
then, so 26% likely undercounts it. Its games are slow for the bots (17-21 turns taking 18 to 44
minutes at count budgets), which the live clock bounds but is worth watching.

### Its builder's second list, and his guide (2026-11-24, the same day)

pbToast sent an updated list "which will fit the bot better" and a guide to playing it. The list
(26 cards changed: the Triomes, the cycling and slow fetch lands and five spells out; the ten
original dual lands, the five-colour lands and six creatures in) leaves Monstrous Vortex the only
card the commander's cascade can hit, and every other spell a creature of power 5 or more that the
Vortex discovers into the next. The guide (four lands or more in hand, the commander first and
once, the Vortex brought back when it dies, mill at yourself) is the deck's bias in
`engine/src/deck-bias.ts`; `deck-biases.md` has it point by point, with what wasn't built.

**Benched on a clock.** The count-budget bench above lost five games to its 45 minutes, so
`bot:losses` takes `--budget MS|live` now: each decision on the rooms' own 1000 ms, as the deck
is played on the site. All 24 games then finish, in four minutes for the batch (22 to 147 seconds
a game). The price is that a seed no longer replays move for move, so these are counts, not
paired comparisons. Against the Ur-Dragon, Giada and Ureni decks, v2 in every seat, seeds 1-24:

| The First Sliver's seat | With its bias | Without (the list alone) |
| --- | --- | --- |
| First to play | 18 of 24 | 11 of 24 |
| Last to play | 12 of 24 | 10 of 24 |
| Both | 30 of 48 (62%) | 21 of 48 (44%) |

A quarter is an even share. Its wins seated first came on turns 17 to 29 (its fifth to eighth
turn), all but one: five lands, the commander, and a creature the turn after. So the list alone
is already well above the old one's 26%, and the guide is worth about nine games in 48 on top —
a small sample on an unrepeatable clock, read as a direction. Going first matters to it more
than to most (a deck that wins on its sixth turn). **Against these three it is now well ahead**
(they are three of the pool's stronger decks); whether a blitz should deal it as often as the
others is the user's call.

The first watched game also showed the bots can't pay with Gemstone Mine's counters inside a
rollout (`BACKLOG.md`, "Bots"), which cost that game a turn; the deck has one Mine.

### His third list (2026-11-24, the same day again)

Fifteen cards changed: eight of the ten original dual lands, Ilharg, Ivorytusk Fortress, Maelstrom
Archangel, Maha, Nylea's Forerunner, Rakish Revelers and Sliver Legion out; the eight Turbulent
lands (untapped once the opponents have eight lands between them, which at four players is about
the third turn), Gemstone Caverns, Boseiju, Sliver Queen, Overlord of the Floodpits, Overlord of the
Mistmoors, Summon: Titan and Magma Opus in. 55 lands. Monstrous Vortex is still the only card the
commander's cascade can hit (nothing else is under mana value 5), so the bias stands as written.

The same bench (the Ur-Dragon, Giada and Ureni decks, v2 in every seat on the rooms' clock, seeds
1-24, with its bias): 17 of 24 seated first and 13 of 24 seated last, 30 of 48, the second list's
figure exactly (18 and 12). Counts on an unrepeatable clock: read as "no worse".

## A player's to bring (2026-11-24)

The user: "make the bracket 4 decks available in the deck builder as starter decks and in the
lobby as decks that people can choose". Until then these were dealt to bots alone (the 2026-11-11
decision above). Now the deck builder lists them after the starters, each under its creator's
title and "by" its creator, to make active, blitz or duplicate; and the lobby's deck picker has a
Bracket 4 tab for your own seat as it has for a bot's. They stay out of `STARTER_DECKS`, whose
indexes the client saves as the active deck: `STRONG_DECKS` is generated and grows, so the client
names one by its `name` (`decks.ts`'s `BuiltInRef`). A player bringing one keeps their own name;
only a bot takes the creator's. The About page's credit says "You or a bot".

## The Archidekt decks out, averages in (2026-11-25)

The user, after a friend raised it: "we shouldn't use people's decks without permission". The
eight Archidekt decks were public, listed and credited, but nobody had asked their builders, and
the About page never did say how one could ask for a deck's removal. So they are out, lists and
all (`engine/data/archidekt-decks/` is deleted), and this plan's first term, "decks that real
people built, never averages", is reversed for every deck but two: Ureni is the user's own, and
The First Sliver is pbToast's, given by him. **A player's deck is in the pool only with that
player's word** (`sample-decks.test.ts` holds the credited authors to a list of those who gave
it).

**What replaced them.** EDHREC's average deck for a commander at Bracket 4
(`json.edhrec.com/pages/average-decks/<slug>/optimized.json`, the page
`edhrec.com/average-decks/<slug>/optimized`): one commander and 99 cards, built by EDHREC from
every Bracket 4 deck it lists for the commander (1,120 for Giada to 4,605 for Y'shtola). No one
player's list. `gen-strong-decks.mjs --fetch` writes the snapshot
(`engine/data/edhrec-average-decks.json`), and without the flag generates `strong-decks.ts` from
it; a list with a card the pool lacks stops the run, and all eight were whole. They share 31 to
55 of their distinct cards with the decks they replace, and carry more tutors than those did
(Demonic, Vampiric, Worldly, Enlightened), which the 2026-11-11 guidance left out of the upgraded
precons for the bots' sake.

**Do they hold up?** The user's test: against the Bracket 3 decks, not against Ureni and The
First Sliver, which had done best among the strong decks. One Bracket 4 deck and three of the
thirteen Bracket 3 decks a table, v2 in every seat on the rooms' 1000 ms clock
(`bot:losses --budget live --seeds 1-6`), each deck in each of the four seats against a different
trio, and the Archidekt deck of the same commander in the same seats against the same trios: 24
games a deck, 384 in all, an even share 25%.

| Commander | EDHREC average | Archidekt deck |
|---|---|---|
| Krenko | 6/24 | 6/24 |
| Edgar Markov | 13/24 | 10/24 |
| The Ur-Dragon | 13/24 | 10/24 |
| Y'shtola | 11/24 | 6/24 |
| Lathril | 6/24 | 1/24 |
| Giada | 9/24 | 11/24 |
| Pantlaza | 10/24 | 10/23 |
| Atraxa | 4/24 | 9/24 |
| All | 72/192 (38%) | 63/191 (33%) |

24 games a deck is about 20 points either way, so the rows don't rank the decks; the pooled
figures say the averages are no weaker than what they replace, and both are well over an even
share against Bracket 3. One Archidekt Pantlaza game was stopped at 15 minutes. By seat the
averages won 22, 21, 15 and 14 of 48: the first two seats do better, as they did for the
Archidekt decks (18, 20, 14, 11).

**Atraxa is left out** (the user: "add all except atraxa"): its average won 4 of 24, the one list
under an even share, in the longest games of the eight (37 turns on average). Why is unread
(`BACKLOG.md`).

**What went with the decks.** Giada's and Edgar Markov's entries in `deck-bias.ts` were written
on 2026-11-24 from the guides the builders of those two decks wrote for them
(`deck-biases.md`), and priced cards the averages don't hold (Test of Endurance; Bloodchief
Ascension, Authority of the Consuls, Impact Tremors, Grave Pact, Dictate of Erebos). They are
removed with their eight gate scenarios, the `lifeGoals` field only Giada's used, and
`deck-guides.md`, which held the notes on the two guides.

**How it shows.** A deck is "Edgar Markov (Average)"; `SampleDeck.average` says whose average,
of how many decks, when taken, and its page. The deck lists say "EDHREC average" where a
player's deck says "by" its creator; a bot on one has a character's name, as on a precon; and the
About page's section, now "Bracket 4 decks", links each average's page and credits the two
players. A player whose active deck was one of the eight has none until they pick another (a
reference by name to a deck that isn't there names nothing).
