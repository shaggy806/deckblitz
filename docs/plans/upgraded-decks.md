# Upgraded precons for the bots

Status: **shipped, second pass** (2026-11-11). `engine/src/sample-decks.ts`'s `UPGRADED_DECKS`:
all fourteen starter precons, each upgraded by hand. A room's host picks each bot's pool as they
add it: an open seat has three "Add bot" buttons, Precon, Upgraded and Strong (the real players'
decks of `strong-bot-decks.md`), in place of the room-wide "Bot decks" setting the first pass
added; **a blitz deals from the upgraded pool**; the deck builder and the deck pickers offer them
as starter decks (`STARTER_DECKS`). One of the fourteen, Jeskai Striker (Upgraded), is **kept from
the bots** (`SampleDeck.bots: false`, read through `botPool`): a player can pick it, no bot is
dealt it.

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

21-30 swaps a deck, spell for spell. Each add is strong in that deck; each cut is one of the
precon's weakest cards. Sources for candidates: EDHREC's page for the precon ("Cards to Add",
"Cards to Cut") and its commander's page (most-played by type, with synergy), fetched 2026-11-11
from `json.edhrec.com/pages/precon/<name>.json` and `pages/commanders/<name>.json`.

What goes in:

- **Ramp at one and two mana**: Nature's Lore, Three Visits, Farseek and Rampant Growth (which find
  the typed duals), Birds of Paradise and Llanowar Elves, Talismans, Fellwar Stone, Mind Stone.
- **Card draw**: Beast Whisperer, Tatyova, Consecrated Sphinx, Welcoming Vampire, Esper Sentinel,
  Rhystic Study, Phyrexian Arena, Guardian Project.
- **Cheap removal**: Swords to Plowshares, Path to Exile, Assassin's Trophy, Beast Within, Chaos
  Warp, Generous Gift, Infernal Grasp.
- **The threats and payoffs that win from the battlefield**: the best Dragons (Terror of the Peaks,
  Old Gnawbone, Goldspan Dragon), every "toughness is damage" lord for Abzan, the Zombie lords,
  token doublers, the landfall engines, Angels for First Flight.

Two calls of the user's, both 2026-11-11, after the first lists:

- **The blue decks carry counterspells.** These lists stand for the decks people play against,
  so a deck that would run them does: Jeskai Striker (Counterspell, Negate, Arcane Denial and its
  own Narset's Reversal), First Flight (its own Counterspell and Negate), Grave Danger
  (Counterspell, Arcane Denial and its own Undermine), Sultai Arisen and Family Matters
  (Counterspell). The first lists had cut every one, the precons' own included.
- **A card the bots misplay is a bot to fix, not a card to swap.** The first run (below) showed v2
  leaving passive enchantments in hand, and the lists swapped twenty of them for creatures with
  the same effect. Those swaps are reverted (Ghostly Prison, Propaganda, Rooftop Storm, Endless
  Ranks of the Dead, Divine Visitation, Cathars' Crusade, Guardian Project, Crucible of Worlds,
  Hedge Shredder, Insidious Roots and Goblin Bombardment are back) and the bot was fixed instead:
  `standingEffects`, `docs/plans/bot-effect-knowledge.md`.

What stays out, because the bots misuse it and no fix is in sight: **tutors, X spells, combo
pieces**, engines that ask for a choice every turn, and **graveyard engines in place of bodies**
(the first pass traded Sultai Arisen's big creatures for Tortured Existence, Dread Return and
Reanimate and lost ground; this pass keeps the bodies and adds lands-matter creatures).

Every list is checked by `sample-decks.test.ts`: 100 legal cards, every card implemented, the
commander's colour identity, singleton, each swap land for land or spell for spell, and one
upgrade per precon.

## What it measured

Three runs of `deck-winrates.mjs`, v2 in every seat at the live rooms' 1 s a decision
(`--budget 1000 --workers 8`), four-player tables. No game in any of them ended without a winner.

**1. Against the precons** (`--pool upgraded --rounds 6`: 28 decks, 168 games, 24 a deck, about
±20 points a deck): the first lists **won 108 games to the precons' 60** (the first pass's five:
66 to 51). Sultai Arisen 46% against its precon's 17%, Draconic Destruction 54% against 17%,
Tramplesaurus Rex 50% against 21%, Chaos Incarnate 37.5% against 12.5%; Abzan Armor level at
12.5%.

Its card-usage report (the cards a bot could cast in a game and never did) showed v2 leaving
passive permanents in hand: Guardian Project cast in 0 of 6 games, Ghostly Prison 0 of 8, Rite of
the Raging Storm 0 of 3, Hedge Shredder 1 of 6, Crucible of Worlds 1 of 6, Rooftop Storm 1 of 4,
Endless Ranks of the Dead 2 of 8, Divine Visitation 0 of 5 (`.scratch/usage-adds.mjs` prints it
per upgraded deck).

**2. The upgrades alone, creatures swapped in for those enchantments** (`--pool blitz --rounds
12`: 168 games, 48 a deck, about ±13 points): the "Run 2" column below.

**3. The upgrades alone, after the bot fix and the list revision**: enchantments back,
counterspells in, and the four weakest decks' fixes (next section). The "Run 3" column.

| Deck (Upgraded) | Run 2 | Run 3 | Run 3's 95% CI |
|---|---|---|---|
| Temur Roar | 64.6% | 54.2% | 40-67 |
| Sultai Arisen | 25.0% | 37.5% | 25-52 |
| Token Triumph | 27.1% | 35.4% | 23-50 |
| Draconic Destruction | 31.3% | 31.3% | 20-45 |
| First Flight | 31.3% | 31.3% | 20-45 |
| Tramplesaurus Rex | 25.0% | 29.2% | 18-43 |
| Family Matters | 16.7% | 22.9% | 13-37 |
| Mardu Surge | 25.0% | 20.8% | 12-34 |
| World Shaper | 22.9% | 20.8% | 12-34 |
| Grave Danger | 14.6% | 16.7% | 9-30 |
| Reign of Dragons | 39.6% | 16.7% | 9-30 |
| Abzan Armor | 4.2% | 14.6% | 7-27 |
| Chaos Incarnate | 14.6% | 14.6% | 7-27 |
| Jeskai Striker | 8.3% | 4.2% | 1-14 |

What run 3 shows:

- **The enchantments are cast now.** Smothering Tithe in 8 of 13 games it could have been (First
  Flight; 1 of 11 before), Divine Visitation 6 of 11 (0 of 5), Rooftop Storm 5 of 10 (1 of 4),
  Endless Ranks of the Dead 5 of 8 (2 of 8), Hedge Shredder 5 of 14 (1 of 6).
- **The field is flatter at the top**: Temur Roar down ten points, Sultai Arisen and Token Triumph
  up into the thirties.
- **Abzan Armor** is off the floor, 4% to 15%, on its list fix.
- **Jeskai Striker** is not: 2 wins in 48 after its list fix. Kept from the bots (below).
- **Reign of Dragons fell from 40% to 17% with its list unchanged**, and that isn't explained.
  One deck of fourteen moving that far is about a one-in-fifty chance on its own, so it may be
  noise; the other candidates are the bot change itself (the deck's rocks and cost reducers carry
  static text, so they are cast earlier now) and opponents' removal, which now counts an
  enchantment or artifact as worth destroying. Open, below.

## The four weakest decks, diagnosed

After run 2, ten losses of each of Abzan Armor, Jeskai Striker, Grave Danger and Chaos Incarnate
were replayed (`deck-autopsy.mjs`, 48 replays in `.scratch/autopsies/`) and read, one agent a
deck, for what was the bot, what was the list and what was the table. The replays are at count
budgets, so they are other games of the same pods, not the clocked games themselves.

- **Abzan Armor: the list and the matchup.** Felothar was on the battlefield at the start of 23%
  of its turns in losses (64% in wins); without her its thirteen defenders can't attack and 21 of
  its 37 creatures have no power; it was killed by fliers in four of nine and wiped in three. The
  upgrade had made it more all-in. The bots do play its plan: toughness damage works, about two
  thirds of available creatures attacked with Felothar out, her ability was used sensibly. *Fix:*
  Lightning Greaves, Wakestone Gargoyle and Rolling Stones (more ways for a defender to attack
  and to keep Felothar), Silklash Spider and Spidersilk Armor against fliers, Colfenor's Urn kept
  for the wipes, Guardian Project for cards. 4% to 15%.
- **Jeskai Striker: mostly the bots.** About 1.3 spells a turn; loot spells and rocks held from
  the opening hand while stuck on three lands; its sweepers cast into its own best board twice;
  with Shiko out, 12 two-spell turns produced 4 copies; Pongify once on its own token. *List
  fix:* bodies for the loot spells (Ledger Shredder, Clarion Spirit, Adeline, Sprite Dragon,
  Poppet Stitcher, Tolarian Terror), counterspells for the draw sorceries, one sweeper out. No
  better: 8% to 4%. **Kept from the bots** until those habits are fixed (`BACKLOG.md`).
- **Grave Danger: the table, then the list.** It can't block or race fliers and tramplers (eight
  of ten losses were to Dragon decks, First Flight or Tramplesaurus Rex; both wins were at tables
  with none), and several cards were never cast in twelve games (Distant Melody, Necrotic Hex,
  Zombie Apocalypse, which destroys its own Human commander, Open the Graves). *Fix:* Ravenous
  Chupacabra, Massacre Wurm, Noosegraf Mob, Gisa, Glorious Resurrector and Arcane Denial for
  those. 15% to 17%, inside the noise.
- **Chaos Incarnate: survives, then loses the endgame.** It reached the last two players in 36 of
  48 games and won 7: Kardur's forced attacks keep it alive (no creature attacked it in the round
  after any cast) while its board stays the smallest. Mana went to recasting Kardur (26 casts in
  12 replays) over castable five- to seven-drops. *Fix:* Damnation and Decree of Pain for a deck
  that is always behind on board, Thran Dynamo. 15% to 15%.

## Open

- **Reign of Dragons' drop** between runs 2 and 3. A `bot:ab` of the bot with `standingEffects`
  against the one before it, on the bench decks (Reign of Dragons is one), says whether the term
  costs strength; `deck-autopsy.mjs` on its run 3 losses says what changed in its games.
- **Three decks sit at 15-17%** (Grave Danger, Abzan Armor, Chaos Incarnate), above the roughly
  10% at which a deck comes out of the pool and inside the noise of 20%. What's left for them is
  in the bots (`BACKLOG.md`: a commander recast over a threat, graveyard casts the evaluation
  doesn't count, chip attacks with the only blockers).
- **Jeskai Striker** comes back into the pool when the bots stop holding loot spells, sweeping
  their own board and wasting Shiko's copy.
- **Temur Roar** still wins twice its share: a board of big fliers is what v2 plays best.
  Cutting it back would even the field from the list side; not done, since the ask was stronger
  decks.
- **The bench decks** are still precons, so every bot gate and bench stays comparable with its
  history.
