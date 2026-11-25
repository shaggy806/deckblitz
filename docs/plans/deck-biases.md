# Deck biases: a deck's own reading of its cards

Status: **shipped** (2026-10-02), with two entries: Teval, the Balanced Scale, and from
2026-11-24 The First Sliver (which added `cardWorth` and `mulligan`), from its builder's guide.
Two more built that day, Giada, Font of Hope (`lifeGoals`) and Edgar Markov, from the guides of
two decks then in the pool, were **removed on 2026-11-25** with those decks, their gate scenarios
and the `lifeGoals` field (`strong-bot-decks.md`): the sections on them below are the record of
what was built and measured, not of anything in the code. The vocabulary grows when a live game shows a deck's bot playing against its
own plan, or its builder says what the plan is.

## The problem

The bots' card knowledge is generic, and has to be: `target-polarity.ts` reads which side of
the table each targeted effect belongs on from the effect tree, `effect-worth.ts` prices an
optional clause, and the evaluation (`bot/evaluate.ts`) prices every player's board with one
weight vector. That's right for nearly every deck and backwards for a few. The user's first
example: Teval, the Balanced Scale's deck (Sultai Arisen, one of the five `SAMPLE_DECKS` every
bot seat falls back to) mills itself to return lands and make Zombies, yet Hedron Crab's
"target player mills three cards" went at an opponent, because `mill` harms its target. The
gate even pins that generic answer ("mills an opponent, not itself").

## What was considered

- **A plan per deck, scripted** ("cast Hedron Crab before turn 3, always target yourself").
  A script is easy to write and impossible to keep right: it can't see the board, and v2 already searches
  the board. What v2 lacks is the deck's *values*, not its moves.
- **Per-card overrides** (Hedron Crab targets its controller), the shape of the AI hints in
  Forge's card scripts (`AIPreference`, `AI:RemoveDeck`). Wrong axis: Hedron Crab in a
  Mill-the-table deck wants the opponent. The deck decides, not the card.
- **A different weight vector per deck.** Close, but the evaluation is symmetric — it scores
  "mine minus theirs" with the same weights — so raising `graveyard` for Teval also made every
  opponent's graveyard a thing Teval wants to empty, and the gate's mill scenario shows why a
  shared `graveyard` raise is wrong for everyone else.
- **Learned per-deck evaluation.** Nothing to learn from: the bench resolves ~4 points in 400
  games, and a bias moves one deck's few decisions.

## The design

`engine/src/deck-bias.ts` holds `COMMANDER_BIASES`, keyed by commander name. An entry says:

- **`why`** — what the deck wants, in a line.
- **`polarity`** — effect kinds whose target slots this deck aims the other way (`mill:
  "help"`). Every `target-polarity.ts` query takes it as an optional `PolarityBias`, applied
  inside the rule walk (each rule's touches take the bias's side for that kind), so the
  strongest-effect-decides logic is unchanged: a bias on `mill` doesn't flip a slot whose
  deciding effect is removal. It reaches v1's targeting, the wrong-side screen, v2's target
  ranking (so the right side is among the eight combinations simulated) and `effect-worth.ts`.
- **`ownWeights`** — evaluation weights for the deck's *own* features only. `outcomeOf`
  attaches them; `scoreOutcome` scores `mine` with them laid over the shared vector and every
  opponent with the shared one. So `bot:fit-scenarios`' replays score exactly what the bot did.
- **`cardWorth`** (2026-11-24) — what a named card of the deck is worth to it by the zone it is
  in, in evaluation points beside what the shared evaluation counts: `ownCardWorth` adds them
  over the cards the player owns in hand, library and graveyard, and on the battlefield those
  it also controls; `outcomeOf` carries the sum (`EvalOutcome.ownCards`) and `scoreOutcome` adds
  it to `mine` alone. Still values, not moves: the search finds the cast, the fetch or the
  activation that moves the card up its ladder. A library is read as a set, which a player
  knows of their own deck.
- **`mulligan`** (2026-11-24) — `minLands`: the opening hands the deck keeps, in place of the
  shared score (`bot/mulligan.ts`), for a deck whose hands that score reads wrong. The floor
  under every mulligan (four cards) still holds, and a kept hand bottoms a spell before one of
  those lands. A second word, `needsAny` (cards one of which the opener should hold, looked for
  while a mulligan is free), was built for Edgar Markov and taken out with the rest of that
  deck's hand rule: see its bench.
- **`lifeGoals`** (2026-11-24) — a life total that wins the deck the game while a card of its own
  is out (Test of Endurance's 50): `worth` points at that life or more, falling in a line to
  nothing fifteen below it (`LIFE_GOAL_SPAN`), added where `cardWorth` is. The shared evaluation
  prices life as a buffer against dying, which at 40 and above is next to nothing; to such a
  deck the last few points are the game, and the card that reads them is worth casting for the
  life it already has.

### Why keyed by commander, read from the state

A bot doesn't know its deck's name; the `GameState` only knows cards. A commander is public,
fixed from setup, and the card that says what a Commander deck is for. Reading the bias off the
state (`deckBias(state, player)`: the commanders the player *owns*) means nothing is threaded
through options: v1, v2, the v1s that play every seat in v2's rollouts (so an opponent's Teval
is modelled milling itself too), and a person's own Teval deck seated with a bot all get it. A
partner pair merges both entries. The answer is cached per `state.objects` table — once a game
and once per search clone; commanders never change after setup.

A non-Commander game has no commander and so no bias, which is right: the precons are what
bots bring.

### Teval

`polarity: { mill: "help" }`, `ownWeights: { graveyard: 0.25, libraryDanger: 1 }`. The graveyard
is the deck's second hand, so its own graveyard cards are worth five times the shared 0.05
(milling itself three is +0.6, not 0). `libraryDanger` (0 for everyone else) keeps v2 from
milling itself out: below 15 cards each card off the top costs a point. Two gate scenarios pin
it — "Teval mills itself, not an opponent" and "Teval stops milling itself near an empty
library" — and each fails with its half of the entry removed (checked: no entry fails the first;
polarity alone fails the second). The weights alone happen to pass both, since v2 scores every
player target; the polarity is what v1 (v2's fallback and the rollouts' policy) reads.

Known limit: v1 has no library guard, so where v1 decides (a rollout, or v2's fallback at a
time-out) it mills itself whatever is left.

### The First Sliver (2026-11-24)

pbToast's "Prince Rupert's Packed Penthouse" (`STRONG_DECKS`), from its builder's own guide to
it. Every spell in the deck but one is a creature of power 5 or more at mana value 5 or less; the
one is Monstrous Vortex, the only card the commander's cascade can hit. With the Vortex out,
each creature spell discovers the next and casts it: one spell is the library's creatures. The
guide, and what each point became:

| The guide | The entry | Gate scenario |
| --- | --- | --- |
| Mulligan to four or more lands | `mulligan: { minLands: 4 }` | "keeps four lands and three five-drops", "throws back three lands at six cards" |
| Cast the commander first | The Vortex's ladder: 4 in the library, 20 on the battlefield, so the cast that cascades into it is worth 16 more than its body | "is recast for a Vortex back in its library" |
| Don't recast it | `ownWeights.commanderTax: 12`, more than a 7/7 is worth: a cast that finds no Vortex loses to any other spell | "isn't recast with its Vortex out" |
| Recast it once Mistveil Plains has put the Vortex back | Graveyard 1.5 against library 4, then the first row again | "Mistveil Plains puts its Vortex back" |
| Fetch Mistveil Plains | `Mistveil Plains: { battlefield: 1.5 }`: a land search is searched by v2, and it wins unless entering tapped costs a spell that turn | "fetches Mistveil Plains" |
| Keep Astelli Reclaimer and Colossal Skyturtle for a Vortex in the graveyard | `hand: 3` each, and the Vortex's hand 10 and battlefield 20 against graveyard 1.5 | "holds Astelli Reclaimer while another creature will do", "channels Colossal Skyturtle for its Vortex" |
| Point mill at yourself | `polarity: { mill: "help" }` for v1, `ownWeights.graveyard: 0.2` for v2 | "Necron Deathmark mills itself" |

Each fails with its part of the entry taken out (checked part by part: the mulligan rule, the
tax, the graveyard weight, and each card's worth), but for the third row's partner, "is recast for
a Vortex back in its library", which the shared evaluation also passes: it is there to hold the
tax to what it is for. As with Teval, the polarity alone fails nothing in the gate, since v2
scores every player a mill could hit; it is v1's aim, in rollouts and at a time-out.

The hold is small on purpose. With the Vortex out, a creature spell is worth the whole chain, so
the Reclaimer is still cast when it is the last creature in hand; three points only puts another
creature ahead of it. The commander too: recast with the Vortex out it is a creature spell of
power 7 and starts the chain, so when nothing else can, the search still casts it over the tax.

**Not built**, of the guide's smaller points:

- *Removal at opposing combat disruption first.* The bots have no reading of "this permanent
  stops my attacks": the evaluation counts an attack tax for the player it protects
  (`attackTaxAt`), nothing for the deck it stops. It would be a per-permanent reading over
  `attackTax`, `attackLimit`, "can't attack" restrictions and damage prevention, and then a
  deck's word for how much it fears them; `BACKLOG.md` has the line.
- *Flicker at the best enters-the-battlefield creature.* The polarity already aims a flicker at
  the deck's own side and v2 simulates which creature; the list as it stands has no flicker
  (the earlier one's Wistfulness and Q are cut).

Found on the way, and fixed the same day: **Gemstone Mine**. The payer leaves a mana ability
that takes counters off its source to be spent by hand (`paysWithStoredCounters`), and
`handManaLine` spends them for a spell in the bot's own window, but the look aheads counted the
payer's casts alone. So with the Mine among five lands a shock land's two life wasn't paid for
the five-drop the Mine would have finished (seed 1, turn 17 of the first game watched: five
lands, two five-drops and the Vortex out, and nothing cast). The land look and the shock-land
answer count such a cast now, and the Mine is tapped for the colour the spell needs (it only
ever made white by hand). What that left is in `BACKLOG.md`.

### How a guide is built (2026-11-24, Giada and Edgar Markov)

The First Sliver's guide was built point by point. The next two were first **tried**: each point
of the guide set up as a board and played by the bot as it was (a scratch script, a dozen boards
a deck, a minute to run), because most of a guide is ordinary good play that a search already
finds. Only what the bot got wrong became part of the entry. That keeps an entry to levers a
scenario can hold, and it says where the bots stand: of Giada's guide they missed one card, of
Edgar Markov's the opening hand and an order of plays.

### Giada, Font of Hope (2026-11-24)

SmokyCashew01's "Miku Angelic Life Gain": "the life you possess is your wincon".

| The guide | On the boards | The entry |
| --- | --- | --- |
| Test of Endurance wins at 50 life | At 52 life, cast a Baneslayer Angel instead | `lifeGoals`: the Test is worth 40 from 50 life (a third of it at 40). "casts Test of Endurance at 52 life, not an Angel" |
| Life is a resource to be used | With the Test and Aetherflux Reservoir out at 95, paid 50 to kill one player of three and sat at 45 | The same goal: the 40 points are lost under 50. "keeps the life Test of Endurance wins with" |
| Hall of Heliod's Generosity brings the Test back | Left it in the graveyard | `cardWorth`: 3 in the library, nothing in the graveyard. "Hall of Heliod's Generosity puts Test of Endurance back" |
| Aetherflux Reservoir's 50 at a player | Fires it at a player it kills, and not for one of three at 60 life | Nothing |
| Angel of Destiny at 55 life | Attacks the player who then loses; holds it back from blockers that kill it | Nothing |
| Wipes and Armageddon behind its own protection | Casts Wrath of God and Armageddon with Avacyn out, and Armageddon with a board of Angels | Nothing |
| Worldslayer on Avacyn | Casts it, equips Avacyn, attacks: every other permanent gone | Nothing |

### Edgar Markov (2026-11-24)

Ozymandias-'s "High Power Aristocrats": an aristocrats deck that wins slowly, not an aggro one.

| The guide | On the boards | The entry |
| --- | --- | --- |
| Keep two lands and a piece of card draw | Threw back two lands, Skullclamp and four cheap Vampires (the shared policy wants three or four sources); kept three lands and no draw | Built both ways and taken out: it cost the deck games (the bench below) |
| Bloodchief Ascension on turn one to three; Impact Tremors early | Cast a one-drop before the Ascension, Legion Lieutenant before the Tremors | `cardWorth` on the battlefield: 6, 6 (Authority of the Consuls) and 5. Three scenarios |
| Hold the board with Grave Pact, Dictate of Erebos, Authority of the Consuls | Cast Sanctum Seeker before Grave Pact | 6 and 5. Two scenarios |
| Don't swing the tokens away | Five tokens stay home from 2/2 blockers, and attack an open board | Nothing |
| Sacrifice creatures for cards | Feeds Skullclamp, Priest of Forgotten Gods and Yawgmoth; digs with Necropotence and Bolas's Citadel | Nothing |
| Bloodthirsty Conqueror with Vito | Casts the Conqueror beside Vito, and the loop wins the game at the first life gained | Nothing |
| Malakir Bloodwitch on a wide board | Casts it | Nothing |

Each worth is set to put its card about two points ahead of the creature it was losing to, and no
further: the guide says which comes first, not that an enchantment is worth a Bloodthirsty
Conqueror.

**Not built:** the Phyrexian Altar loop with Oathsworn Vampire (many activations a turn, which
the bots cap), Ayara's sacrifice for a card (it attacked with her instead), Contamination (not
tried: the deck's own white and red spells go with it), and "expect to be the archenemy", which
is the table's doing.

### The bench (2026-11-24)

One pod, Giada, Edgar Markov, The Ur-Dragon and Ureni, v2 in every seat on the rooms' 1000 ms,
seeds 1-24 in each of two seatings (Giada first and Edgar second; then the order reversed), so
48 games a row. A clocked seed doesn't replay, so these are counts; a deck's count moves by
about three either way on nothing. Wins of 48:

| Entries on | Giada | Edgar Markov | Ureni | The Ur-Dragon |
| --- | --- | --- | --- | --- |
| Neither | 5 | 12 | 24 | 7 |
| Giada's alone | 9 | 10 | 25 | 4 |
| Giada's, Edgar's card worth | 9 | 10 | 25 | 4 |
| Giada's, Edgar's card worth and a free mulligan for card draw | 10 | 8 | 26 | 4 |
| Giada's, Edgar's two-land keep and free mulligan (no card worth) | 17 | 4 | 22 | 5 |
| Giada's, Edgar's card worth, two-land keep and free mulligan | 9 | 6 | 27 | 6 |

**Giada's entry is worth about four games in 48**: 5 without it, and 9 to 17 in the five rows
with. One card's worth of plan, in a deck that wins one game in ten against these three.

**Edgar Markov's guide didn't make its bot better.** Its card worth is neutral (10 against 10
and 12). Its opening-hand rule costs games however it was built: two lands kept, 4 and 6; a
free mulligan spent looking for card draw over the shared policy, 8. So the hand rule is out,
and the card worth stays as the builder's order of plays, which costs nothing. Why a guide
written by the deck's builder should lose its bot games: he keeps two lands because he will dig
out of them (Skullclamp on a token, the Priest, Necropotence at the right life), and reads which
seven is a keep; the bot digs less well than he does, and a 28-land deck on two lands with a bot
at the wheel is often a deck that stays on two lands. A guide is advice to its writer's level of
play. Each point has to be measured, not only pinned.

Both remain well behind Ureni here, which wins half the games in every row: the pod's balance,
not either entry's.

## Adding a bias

When a live game shows a deck's bot playing against its plan, capture the position, add the
entry, and add a gate scenario that fails without it. Prefer the smallest lever: a polarity flip
if the bot aims an effect the wrong way, an own weight if it values its own resources wrong.
Expect the vocabulary to grow; likely next kinds, none built:

- **What the deck fears on the other side of the table** (a combat deck and an attack tax):
  see The First Sliver's "not built".
- **Attack eagerness** for decks whose commander has an attack trigger (Teval's own mill is on
  attack).
- **Opponents' biases**: our evaluation still scores an opponent's Teval graveyard at the shared
  weight, so milling Teval's player reads as neutral to us when it helps them.
