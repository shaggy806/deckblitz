# Upgraded precons for the bots

Status: **shipped, second pass** (2026-11-11). `engine/src/sample-decks.ts`'s `UPGRADED_DECKS`:
all fourteen starter precons, each upgraded by hand. A room's host picks each bot's pool as they
add it: an open seat has three "Add bot" buttons, Precon, Upgraded and Strong (the real players'
decks of `strong-bot-decks.md`), in place of the room-wide "Bot decks" setting the first pass
added; **a blitz deals from the upgraded pool**; the deck
builder and the deck pickers offer them as starter decks (`STARTER_DECKS`).

The first pass (2026-10-07) upgraded the five Tarkir: Dragonstorm precons by taking EDHREC's
most-played adds in order, 18 spells and 13 lands each. One of the five measured stronger (Temur
Roar, 35% to 69%); Sultai and Jeskai came out a shade under their precons. The second pass replaced
all five and added the other nine (the user's call, 2026-11-11, with the strong decks kept as an
option rather than made the blitz default): **an average deck isn't necessarily a good one, so
EDHREC suggests candidates and nothing more, and lands are where the plain upgrades are.**

## Lands

A strong mana base hardly changes from one deck to the next, so every deck gets the same one, for
its colours:

- the original dual lands, the shock lands and the triome (all fetchable), and the fetch lands that
  find them: three in a three-colour deck, one in a two-colour deck, a full set in World Shaper,
  which wants lands in its graveyard;
- the lands that are untapped with two or more opponents (Spire Garden), the Verges, pain lands,
  check lands, fast lands and filter lands, with Reflecting Pool, Exotic Orchard and now and then
  Mana Confluence in three colours;
- out: every land that enters tapped (Temples, gain lands, tri-lands, Thriving lands, Evolving
  Wilds, Path of Ancestry), most colourless utility lands, and some basics. A three-colour deck
  keeps 8-10 basics for Cultivate, Farseek and its fetches; a two-colour starter deck keeps most of
  its own.
- the mono-coloured decks change two or three lands (Gaea's Cradle and Castle Garenbrig; Maelstrom
  of the Spirit Dragon, Castle Embereth and Arena of Glory).

The engine's payment tracks which sources cost life, so pain lands and Mana Confluence are tapped
for colour only when nothing free will do.

Left out: modal double-faced lands and channel lands (the bots play them as plain lands), lands
that name a creature type (Cavern of Souls, Unclaimed Territory: a wrong name makes a colourless
land), Ancient Tomb, and Nykthos (unchecked whether the payment uses its second ability).

## Spells

21-28 swaps a deck, spell for spell. Each add is strong in that deck **and something the bots play
well**; each cut is one of the precon's weakest cards. Sources for candidates: EDHREC's page for
the precon ("Cards to Add", "Cards to Cut") and its commander's page (most-played by type, with
synergy), fetched 2026-11-11 from `json.edhrec.com/pages/precon/<name>.json` and
`pages/commanders/<name>.json`.

What goes in:

- **Ramp at one and two mana**: Nature's Lore, Three Visits, Farseek and Rampant Growth (which find
  the typed duals), Birds of Paradise and Llanowar Elves, Talismans, Fellwar Stone, Mind Stone.
- **Card draw on a body, or that needs no decisions**: Beast Whisperer, Tatyova, Consecrated
  Sphinx, Welcoming Vampire, Esper Sentinel, Rhystic Study, Phyrexian Arena.
- **Cheap removal**: Swords to Plowshares, Path to Exile, Assassin's Trophy, Beast Within, Chaos
  Warp, Generous Gift, Infernal Grasp.
- **The threats and payoffs that win from the battlefield**: the best Dragons (Terror of the Peaks,
  Old Gnawbone, Goldspan Dragon), every "toughness is damage" lord for Abzan, the Zombie lords,
  token doublers, the landfall engines, Angels for First Flight.

What stays out, because the bots misuse it (v2 has no idea of a combo, picks a tutor's card
poorly, and holds a counterspell for nothing):

- **Counterspells**, including the precons' own (Jeskai Striker's, First Flight's and Grave
  Danger's are cut). The first pass added three to Jeskai Striker and it got weaker.
- **Tutors, X spells, combo pieces**, and engines that ask for a choice every turn.
- **Passive enchantments and artifacts, mostly** (found by the first run, below): v2 casts a
  creature far more readily than an enchantment whose worth comes later, so an effect is taken on
  a body where one exists (Archangel of Tithes for Ghostly Prison, Ancient Lumberknot for another
  Assault Formation).
- **Graveyard engines in place of bodies.** The first pass traded Sultai Arisen's big creatures for
  Tortured Existence, Dread Return and Reanimate and lost ground; this pass keeps the bodies and
  adds lands-matter creatures.

Every list is checked by `sample-decks.test.ts`: 100 legal cards, every card implemented, the
commander's colour identity, singleton, each swap land for land or spell for spell, and one
upgrade per precon.

## What it measured

`node engine/scripts/deck-winrates.mjs --pool upgraded --rounds 6 --budget 1000 --workers 8`: all
fourteen precons and their upgrades, v2 in every seat at the live rooms' 1 s a decision, 4-player
tables, 168 games, 24 a deck (95% intervals about ±20 points a deck, so only the pooled figure and
the large gaps mean anything).

**The upgrades won 108 games to the precons' 60** (the first pass's five: 66 to 51).

| Deck | Upgraded | Precon |
|---|---|---|
| Temur Roar | 75.0% | 54.2% |
| Draconic Destruction | 54.2% | 16.7% |
| Tramplesaurus Rex | 50.0% | 20.8% |
| Sultai Arisen | 45.8% | 16.7% |
| Chaos Incarnate | 37.5% | 12.5% |
| Reign of Dragons | 33.3% | 29.2% |
| World Shaper | 29.2% | 29.2% |
| First Flight | 25.0% | 25.0% |
| Token Triumph | 20.8% | 4.2% |
| Grave Danger | 20.8% | 4.2% |
| Family Matters | 20.8% | 12.5% |
| Jeskai Striker | 16.7% | 8.3% |
| Abzan Armor | 12.5% | 12.5% |
| Mardu Surge | 8.3% | 4.2% |

No game ended without a winner, and none ran long.

**The run's card-usage report** (the cards a bot could cast in a game and never did) showed v2
leaving passive permanents in hand: Guardian Project cast in 0 of 6 games, Ghostly Prison 0 of 8,
Rite of the Raging Storm 0 of 3, Hedge Shredder 1 of 6, Six 1 of 5, Crucible of Worlds 1 of 6,
Rooftop Storm 1 of 4, Endless Ranks of the Dead 2 of 8, Divine Visitation 0 of 5. Twenty such
cards were then swapped for creatures (`.scratch/usage-adds.mjs` prints the report per upgraded
deck); the lists in the file are the ones after that change.

### The blitz field

`--pool blitz --rounds 12 --budget 1000 --workers 8`: the fourteen upgrades alone, as a blitz deals
them, after that change. 168 games, 48 a deck (about ±13 points), none without a winner, median 34
turns.

| Deck (Upgraded) | Win% | 95% CI |
|---|---|---|
| Temur Roar | 64.6 | 50-77 |
| Reign of Dragons | 39.6 | 27-54 |
| Draconic Destruction | 31.3 | 20-45 |
| First Flight | 31.3 | 20-45 |
| Token Triumph | 27.1 | 17-41 |
| Sultai Arisen | 25.0 | 15-39 |
| Mardu Surge | 25.0 | 15-39 |
| Tramplesaurus Rex | 25.0 | 15-39 |
| World Shaper | 22.9 | 13-37 |
| Family Matters | 16.7 | 9-30 |
| Grave Danger | 14.6 | 7-27 |
| Chaos Incarnate | 14.6 | 7-27 |
| Jeskai Striker | 8.3 | 3-20 |
| Abzan Armor | 4.2 | 1-14 |

Nine of the fourteen sit within noise of the fair 25%. Mardu Surge moved from 8% to 25% and First
Flight from 25% to 31% between the two runs, on the creatures-for-enchantments change and a
different field.

## Open

- **The field isn't even.** Temur Roar (Upgraded) wins about two games in three, and Abzan Armor
  and Jeskai Striker almost none.
  - **Abzan Armor and Jeskai Striker aren't diagnosed.** (This record first blamed the bots for
    not reading "assigns combat damage equal to its toughness" and not planning Shiko's second
    spell. Both were wrong: `combatDamageOf` is read by `bot/combat-math.ts`, `bot/features.ts`
    and `controller.ts`, and `b17096d2e` taught v2 Shiko's sequencing.) One Abzan loss replayed
    (seed 2 of the blitz run, `deck-autopsy.mjs`): Felothar was removed four times (Fleshbag
    Marauder's sacrifice, Infernal Grasp, Elesh Norn's -2/-2) and recast at 4, 6, 8, 10 and 12
    mana, and without her the deck's defenders can't attack, so it attacked with one creature a
    turn. If that holds over more losses it's the list: the "toughness is damage" lords it adds
    don't let a defender attack, so it wants non-defender bodies with high toughness. Next: ten
    losses of each, then a list change or a `COMMANDER_BIASES` entry (`deck-bias.ts`, one entry
    today: Teval), whichever they call for.
  - **Temur Roar** is the deck v2 plays best, a board of big fliers. Cutting it back would be the
    way to even the field from the list side; not done, since the ask was stronger decks.
  `BACKLOG.md`, Bots.
- **v2 holds passive enchantments and mana rocks** it could cast (above; Fellwar Stone cast in 4
  of 10 games, Mind Stone 2 of 6). A bot fix would let the lists take the stronger card instead of
  the creature version.
- **The bench decks** are still precons, so every bot gate and bench stays comparable with its
  history.
