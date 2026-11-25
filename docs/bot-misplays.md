# Bot misplays from live games

Misplays the user saw on the live site that couldn't be captured, each rebuilt as a scenario in
`engine/src/bot/scenarios.ts` (the `bot-misplay` skill). Newest first. An entry stays until its
scenario passes and moves to the gate; then mark it `fixed` with the commit, or delete it.

## 2026-11-24 — Logic Knot cast at X = 46, exiling the whole graveyard

Status: fixed 2026-11-24. No scenario: the choice is made where candidates are built, not by the
search, so `engine/src/test/bot-enough-x.test.ts` holds it (both bots).

Reported by the user from an exported log (game S7AH5, seed 1576104530): "How did half the deck
get exiled this game?" The bot in alice's seat, 43 cards in its graveyard and five mana up, cast
Logic Knot at X = 46 against a Swan Song and exiled all 43 cards to delve. Earlier in the same game
two other seats cast it at X = 9 and X = 3, each the most they could pay.

**Why:** both bots cast every {X} spell at the largest X the offer allows (`bot/candidates.ts`'s
`xValueOf`, v1's cast in `controller.ts`) and delve as many cards as that X takes (`delvePicks`,
"most"). Delve pays X too (rule 702.66a), so the largest X counts the whole graveyard. That is
right for Empty the Pits; for "counter target spell unless its controller pays {X}", X past what
that player can pay buys nothing.

**Fixed:** `bot/enough-x.ts` caps the X of a delve spell whose X a target's controller pays to
stop it at one more than that player could pay now (pool, and the most each untapped land or mana
permanent makes), and never below the largest X mana alone pays. `aimOffer` lowers the offer's
`maxX` for v2's candidates and v1 takes the same cap. Only a delve offer is capped: Syncopate and
the other eleven pay-{X} spells are cast as before.

## 2026-11-24 — Basalt Monolith left tapped for the rest of the game

Status: open. Scenario (training): "untaps Basalt Monolith before its own turn, with lands that
untap there anyway".

Reported by the user: "not untapping basalt monolith on opponent's endstep in game B8NWK". In the
kept game (`games/2026-11-25/B8NWK-1-2163417874.json.gz`, which replays to the last event on
today's build) the bot in alice's seat (Dack Fayden, Helping Hand) tapped the Monolith on its
fifth turn (turn 20) and never untapped it again. The clearest window is input 1257, Zurgo's end
step on turn 27, the last before its own turn 28: Ancient Den, Arcane Signet and Exotic Orchard
untapped, the Monolith tapped, "{3}: Untap this artifact" on offer, and a seven-mana Boonweaver
Giant in hand. It passed, cast and activated nothing on turn 28, did the same at the end of turn
31 and on turn 32, and died the turn after with the Giant still in hand: after turn 20 it never
cast another spell.

**Why:** v2 searched it (23 simulations, `via: "search"`, not out of time) and every answer came
out the same to the last digit, -83.92: passing, the Monolith's own untap, and either Key at any
artifact. The evaluation counts a permanent's mana from its definition, tapped or not
(`bot/features.ts`'s `nonlandMana`), and `untappedMana` is weighted 0 on purpose (`evaluate.ts`:
"that mana untaps"; any weight makes every cast read as a cost). That is right for a land and
wrong for a permanent that `doesntUntap`: the Monolith's mana stays gone until something untaps
it. The rollout ends with the turn, so it never sees the next turn's six mana either. A tie
passes.

A second thing on the same board, not the report: on turn 28 the bot could have cast the Giant
with no end-step untap at all, through its two Keys (three mana; Voltaic Key at the Monolith, tap
it, Manifold Key at the Monolith, tap it: seven). `bot/untap-plans.ts` finds "tap a land, untap
it, cast what that pays for" in our own main phase; it only tries our untapped lands, so a rock
that is already tapped, and a line two untaps long, are outside it.

**Likely fix:** two parts, the first enough for the report.
- A term for mana that won't come back: our tapped permanents that make mana and don't untap in
  our untap step (`doesntUntap`: Basalt Monolith, Grim Monolith, Mana Vault) count their mana as
  lost while tapped. Then the untap scores above the pass wherever the mana paying for it untaps
  anyway, and the search takes it by itself. Might break: tapping such a rock for a spell now
  reads as a small cost (it is one), so the weight has to stay well under what a spell is worth;
  and Mana Vault's untap costs {4} on our upkeep for three mana, where the same term would pay
  it every turn (right when the mana is spare, wrong when it eats the turn's spell).
- Or narrower, as `holdsTopTutor` did for tutors: in the last window before our untap step (the
  end step of the turn before ours, stack empty), activate an untap of our own tapped mana
  permanent when what pays for it untaps in that untap step. Touches no weights; misses the same
  untap on our own turn when a land drop leaves three spare.
- For the Keys: let `findUntapPlans` aim an untap at a tapped mana rock of ours as well as a land
  it taps first, and chain a second untap. Each plan is a copy and a rollout, so it needs the
  same caps (`MAX_LANDS`, `MAX_PLANS`).

## 2026-11-24 — Force of Will at a spell that can't be countered

Status: fixed 2026-11-24. Scenario: "holds Force of Will rather than aim it at a spell that can't be
countered" (now gates); test: `bot-counters-nothing.test.ts`.

Reported by the user: the strong Y'shtola deck "used a force of will on an uncounterable spell".
Found in the kept games (`games/2026-11-24/TCZDM-1-1437207098.json.gz`, input 1520, turn 28): the
Y'shtola bot (dave) exiled a blue card to cast Force of Will at alice's Dragonlord Dromoka, whose
own text says it can't be countered (rule 701.5f: a spell that can't be countered is still a legal
target, and the counter does nothing to it). It resolved anyway, and the bot was down Force of
Will, the blue card and a life.

**Why:** the record's `via` is "v1's cast": on that board the clock ran out before v2's search
scored anything, so v1's cast went out unscored (`unscoredCast`). v1's counterspell rules
(`controller.ts`'s `tooLittle`, with `COUNTER_FLOOR`) weigh the spell's mana value, whether it's
aimed at the bot or its things, whether it's a commander and whether any opponent still holds
cards, never whether it can be countered, and a 6-mana Dromoka is well over the floor. Searched in
full, v2 holds it: its rollouts see the Dromoka resolve anyway. So the scenario asks out of time
(`outOfTime`), as the live clock did.

**Fixed:** `HeuristicBotController.countersNothing` finds the `counter` effects in the spell (or its chosen
modes) and the target slot each acts on, and says whether that target is a spell or ability this
spell can't counter. v1 won't cast it (`wouldCast`), v2 drops it from its candidates, and v2's cast out
of time (`unscoredCast`) is held instead of made. Copying or redirecting such a spell is still cast.
The plan was:

**Likely fix:** in v1, never aim a counter at a spell that can't be countered by it, through the
engine's own read (`spellCantBeCountered`, which takes the counterer for a "can't be countered by
blue spells" grant, and `GameObject.uncounterable` for Cavern of Souls). Most simply in
`tooLittle` (a target that can't be countered is too little), or wider: in what v1 offers itself
as a counter's targets, which would cover every counterspell and ability v1 casts. Might break:
a counterspell with a rider that still does something to an uncounterable spell (Disallow-style
"counter target spell, activated or triggered ability" doesn't; Dovin's Veto's text is its own
uncounterability; a "counter unless its controller pays" against an uncounterable spell does
nothing either) — riders that act regardless (draw a card, Mystic Confluence's other modes) would
want the counter mode skipped, not the whole spell.

## 2026-11-23 — Chrome Mox cast and nothing imprinted

Status: fixed 2026-11-23. Scenario: "imprints a card on Chrome Mox" (now gates); test:
`bot-linked-mana.test.ts`.

Reported by the user: a bot "played a chrome mox without imprinting anything". No board was given;
the scenario is the Ur-Dragon deck (the strong deck that runs one) on its second turn, two lands
out and a hand of spells. Chrome Mox's imprint is a `look-and-choose` of 0 or 1 nonartifact,
nonland cards from the hand, answered as a `choose-from-zone`.

**Why:** v1 takes a card (`controller.ts`'s `chooseFromZone`, its last branch: `mostUsefulTo`,
the hand's *best* card, itself wrong for an imprint). v2 searches the answer
(`decisions/choose-from-zone.ts`'s `candidates`: the empty set first, then one card at a time from
the least valuable) and plays each out. The evaluation reads a permanent's mana from its
definition (`bot/features.ts`'s `manaPerTurn`, into `nonlandMana` and `earlyMana`): Chrome Mox's
`{T}: Add one mana of any of the exiled card's colors` counts as one mana a turn whatever is under
it. So on the board an empty Mox and an imprinted one score the same, and the empty one has a card
more in hand: `[]` wins every time there's a card to imprint.

**Fixed:** `bot/linked-mana.ts` says which sources make only the colours of the cards exiled with
them, and whether a coloured one is under a permanent in its current stint; `features.ts` counts
such a source's mana (`manaPerTurnOf`) only then. v2 now prices the imprint as a card for a mana
rock, as it does Sol Ring and Signets, and imprints. v1 gives such a source the hand's least useful
coloured card, and nothing when only colourless cards are on offer, where before it gave the hand's
best; Isochron Scepter, Panoptic Mirror and the other imprints that use the card still take the
best. On the scenario's board both now imprint Ancient Copper Dragon, the hand's 8-drop.

## 2026-11-23 — Creatures the end step takes kept home as blockers; Demonic Consultation aimed at an opponent

Status: both fixed 2026-11-23 (two gate scenarios and a test).

Reported by the same player (room 7LSU2 game 1, 41 turns, one person and three bots on the Breena
list, two Rite of the Raging Storm out): "bots seem to treat temporary creatures that get
sacrificed at the end of turn as worth keeping home as blockers", and "I'm willing to bet they
could know how to use Demonic Consultation, unless they don't have the information of what's in
their decklists".

**1. Lightning Ragers kept home.** Each upkeep a seat got two 5/1 trample, haste Lightning Ragers
that are sacrificed at its end step. Over the game's 16 attack declarations by a seat holding one,
the Ragers went in 3; at turn 25 one stayed home in front of a player with no untapped creature.
**Why:** the evaluation left out a permanent only when it carried the per-object end-step flag a
token is made with (Kiki-Jiki, mobilize, blitz). A creature whose own text sacrifices it, or one
under a delayed sacrifice (Sneak Attack), counted as a body on the board and as a blocker in the
swing back, and the simulated combat stops before the end step that takes it: attacking risked
"losing" a 5/1 and holding it "kept" a blocker. **Fixed:** `bot/gone-at-end-step.ts` reads all
three, and the evaluation, the swing back's blockers and attackers and the attack search's count
of creatures lost use it. On the game's 16 boards today's bot sends the Ragers in 14 (the other
two are Edgar Markov's, who could attack only one player). Scenarios: "attacks with a Lightning
Rager the end step takes anyway", "attacks with the creature Sneak Attack put in for the turn".

**2. Demonic Consultation.** The bots do know their own library (a player knows their list). But
the card's name choice had no aim, so it suggested opponents' spells, and a bot names the first
suggestion: an opponent's commander, which its library doesn't hold, so the whole library would be
exiled. **Fixed:** aimed at the caster's own library (`aim: "own-library"`), most copies first, so
a bot names the card it has most of — the name least likely to sit wholly in the six exiled — and
a player's suggestions are their own cards. The same for Spoils of the Vault, Divining Witch, Petra
Sphinx and Vexing Arcanix; Cursed Scroll, Magus of the Scroll and Liar's Pendulum suggest the
chooser's hand. Test: `choose-card-name.test.ts`. **Since then** (the same day): both dig for a
card as a tutor picks one (`bot/dig.ts`). Consultation names the card the hand most wants while
the library is big enough that one copy is rarely in the six exiled (sixty cards for a singleton
deck), and the search casts it; Tainted Pact turns cards down until one near the best in the
library, and takes anything once thirty are left. `bot-dig.test.ts` and the gate scenario "casts
Demonic Consultation for the best card in its library".

## 2026-11-23 — A friend's Breena deck: Tainted Pact decks itself, Fountainport Fish in the upkeep, Sunforger unused

Status: the first two fixed 2026-11-23 (a test and a gate scenario); Sunforger open (BACKLOG
"Bots").

Reported by a player watching four bots play their Brash Taunter / Breena deck (room HVXBA game 1,
2026-11-23, all four seats bots on copies of the same list, 65 turns; the same list was in C2483-1,
C2483-2 and YGDD4-1). Replayed exactly with `game:replay`.

**1. Tainted Pact exiled the whole library (turn 63).** Player 1's bot cast it on Alesha's turn
with 26 cards in its library and declined every one; the deck is singleton, so nothing stopped the
process, and it lost to a draw the next turn. **Why:** v1 answers the "you may put that card into your hand" (`via: v1's
answer` in the record), and `effectWorth` had no case for `move-exiled-this-way`: worth 0, so
declined. **Fixed:** a card exiled this way put into our hand is worth a card. Test:
`bot-optional-choices.test.ts`, "takes the card Tainted Pact offers".

**2. Fountainport Fish made in the bot's own upkeep, turn after turn.** 27 Fountainport
activations in the game, nearly all `{3}, {T}, Pay 1 life` for a 1/1 Fish, most in the activating
bot's own upkeep or draw step, with that turn's mana. **Why:** `holdsManaForMain` keeps upkeep mana
for the main phase only while the stack is empty or holds only the bot's own abilities, and carol's
Rite of the Raging Storm triggered in every opponent's upkeep. On the replayed turn 40 today's bot
still made the Fish there. **Fixed:** another player's triggered ability with no targets counts as
ours for that rule (in the main phase too: held in the upkeep, it then made the Fish over bob's
Spectrum Sentinel trigger from its land drop). Turn 40 now makes the Fish in the main phase beside
Boros Signet and an equip. Scenario: "makes no Fountainport Fish in its own upkeep over another
player's trigger". Making it at an opponent's end step instead isn't planned: the search passes at
those windows.

**3. Sunforger equipped often, its ability used once, for nothing.** Three bots found it and
equipped it six times; one unattached it once (Edgar Markov, turn 64), in response to bob's Wing
Shards aimed at Player 1, fetching Comeuppance, which prevents damage and so did nothing there (a
searched choice, not a fallback). **Why, so far:** the +4/+0 is priced on the board; the free
instant it fetches is worth something only in a rollout that reaches the right window (Boros Charm
at an opponent's end step, Deflecting Palm or Angel's Grace as an answer), and nothing tells the
search to look there. Open.

## 2026-11-22 — The kept games read for what lost them: a winning wipe held, the kill on the wrong player, stored mana never spent

Status: the three below fixed 2026-11-22, four scenarios gate; the rest of the read is open (the
list at the end).

All 35 kept games of the day (`games/2026-11-22/`, each replayed exactly on the commit it was
played on) were read for the plays that lost a game or passed up a win. Each fix was checked on the
live game's own board, not only on its scenario.

**1. A Deadly Tempest that won on the spot, held for after combat and never cast (DV2N6-3, turn
35).** Kardur's bot, 25 life and six creatures, against the last opponent on 14 life with fifteen
creatures and no untapped land: Deadly Tempest ("destroy all creatures; each player loses life
equal to the creatures they lost") ends the game. It passed, attacked, and lost the next turn with
the Tempest in hand. **Why:** a wipe that takes our own would-be attackers waits for the second
main phase (`holdsWipeForCombat`); cast and pass both scored 999965, a won game, so nothing told
them apart. Then, with Kardur's three "dies" triggers on the stack in the combat damage step, it
activated Stensia Bloodhall for five of its nine mana: `spendsHeldMana` asks whether the held play
is still castable, and a sorcery isn't over a stack, so it answered "not on offer anyway".
**Fixed:** a wipe that ends the game as it resolves isn't held (`winsAsItResolves`), and the held
play is read on the board the stack leaves. Scenarios: "casts the Deadly Tempest that wins now,
not after combat" and "keeps a held Wrath of God's mana with its own trigger on the stack".

**2. Ghalta's commander-damage kill taken on the seat with nothing (8ZY28-1, turn 35).** Ghalta,
24/24 trample, could kill any of three opponents; its own Whiptongue Hydra had just destroyed the
leader's creatures (64 life, seven cards, tapped out). It killed the seat with no board and three
lands in hand; the leader untapped, destroyed Ghalta and won on turn 50. **Why:** `alphaStrike`
tries the killable players in turn order and takes the first kill that leaves it alive. **Fixed:**
among plans with as many kills that take other players, each is played out and the board it
leaves scored. Scenario: "kills the leader, not the seat with nothing, when one attacker can kill
either".

**3. Insurrection never offered: Jeweled Amulet's stored mana (D75RS-1, turn 29).** Slicer's bot
had six lands, Ruby Medallion and a charged Amulet, and Insurrection at seven against an opponent
on 15, tapped out, with 17 power of creatures to take. The payer leaves a cost that removes
counters to the player (AUTHORING §15), so the cast wasn't legal until the Amulet was tapped by
hand, and no bot taps mana by hand. It lost the next turn. **Fixed:** `handManaLine` (Simian Spirit
Guide's) also spends a mana ability whose cost is a fixed number of counters off its own source
(`paysWithStoredCounters`). On the live board it now casts Insurrection and wins that turn.
Scenario: "spends Jeweled Amulet's stored mana on the spell it makes castable".

**Open from the same read** (today's v2 at count budgets makes the same choice in every one
re-run; positions are rebuilt by replaying the game to the turn):

- **No blocker kept for an attack already countable** — fourteen eliminations, the most common
  cause. A seat on a commander-damage clock (mostly a Slicer handed round the table) taps its only
  blockers for damage that changes nothing: D75RS-1 Domri t14 (9 + 6 + 6 = 21), D75RS-3 Lazav t21,
  D75RS-5 Domri t16, D75RS-8 Domri t22 (three Dragons out at 18 Slicer damage) and Zurgo t17,
  8WNCA-1 Sidisi t19, 8WNCA-2 Surrak t21, NX4BN-1 Yasova t19 and t22, RCSBH-3 Korvold t13, TPGJ6-1
  Chandra t12; and by life, YA57F-2 Kykar t50, YA57F-1 Kykar t24, 8G96K-3 Jaya t36, FU89K-1
  Muldrotha t33 (died by 1).
  **Partly fixed 2026-11-22** (`combat-math.ts`'s `swingBack`; scenario "keeps its Dragon home at
  9 commander damage from a Slicer that comes round three times"): the crackback counted Slicer
  once, on the side it stood, and as the borrower's own blocker while the borrower held it. On
  D75RS-1 t14 it read 0 commander damage to come where 12 was; now a creature handed round the
  table (Slicer, Alexios, Karona) is in every opponent's swing, and a creature held until end of
  turn is no blocker. On the live boards D75RS-1 t14 and NX4BN-1 t22 now keep their creatures
  home, and RCSBH-3 t13 keeps one. **Later the same day**: a permanent that is a creature only on
  its controller's turn (living metal: the converted Slicer) is among that controller's attackers,
  and a hasty commander in the command zone its owner can pay for, tax and a land drop counted
  (`commandersToCome`), is in its owner's swing and, handed round, in the swing of whoever acts
  after. D75RS-8 t22 now keeps a Dragon home; 8WNCA-2 t21 and TPGJ6-1 t12 keep their creature
  home. **The attackers a kill doesn't need, and the race for nothing** (the same day; scenarios
  "sends the kill what it needs, not every creature it has, at a player one attacker kills" and
  "keeps its blockers home when one opponent's whole board kills it and the attack kills
  nobody"). Traced on the five turns left, the attack search did three different things.
  *Piled on*: `alphaStrike` put every attacker left over onto the player being killed, as a
  margin against a trick. The margin is now measured (the user: "an excess swing without sending
  a ridiculous amount"; scenario "takes a margin on a kill, one attacker more than it needs, not
  everything it has"): where that player could answer the kill (a creature able to block, or mana
  open with a card in hand), the fewest more attackers that leave it lethal with its biggest one
  taken out; where no number of them does, or the player can't answer, none; and everything only
  when the attack ends the game. Capture WAMFR t48 (a full swing of six at a player on 9, judged
  right on 2026-10-10) is now three Dragons at that player, two to kill and one over, a 1/4 at
  the other opponent and the rest home; its gate takes either. Each attacker left over is added
  only where the simulated result is better for it: D75RS-3 t21's two Zombies now hit another player for 6 where they hit a dead
  one for nothing (they are still tapped under Smoke, which nothing here reads), and 8G96K-3 t36
  is now a four-Dragon kill on the player who went on to win that game. *Raced*: FU89K-1 t33 was
  dead on paper to the Zombies' whole swing whatever stayed home, so every attack was free; an
  attack that kills nobody and lets more of that one opponent's swing through is now unsafe
  (`racesForNothing`), and it keeps Uro and Jarad home, the two blockers it died without.
  *Judged safe, and wasn't*: YA57F-2 t50 and YA57F-1 t24 kept blockers that covered the board as
  it stood, and died to a Thunderfoot Baloth from hand, and to Swords to Plowshares on a blocker
  with a stolen Collective Blessing. Nothing on the board said so; left as they are. Also open: a
  Slicer that came back with Equipment the board didn't show (D75RS-8 Zurgo t17).
- **Dictate of the Twin Gods cast by the seat it then kills** — RCSBH-3 t17, RCSBH-2 t26 (at 6
  Slicer damage; 12 doubled, then first strike), YA57F-2 t35 (15 became 30 at 30 life).
  **Fixed 2026-11-22** (`features.ts`'s `damageTimes`; three scenarios, "holds Dictate of the Twin
  Gods at 6 commander damage from a double striker", "… with the weakest board at the table",
  "casts … with the only creatures at the table"). A noncreature permanent that keeps working was
  worth a creature of its cost whoever it worked for, and damage was read at its printed size: on
  RCSBH-3 t17 Dictate scored 20 against 5 for passing. Now the damage that could come at us
  (`threat`) and what is left of a commander's 21 on us are read through the multipliers on the
  battlefield, and one that doubles everyone's damage is worth its cost only as far as our power
  outweighs what comes at us. All three live boards now leave it in hand (2.8 against 5 on
  RCSBH-3 t17). The commander clock is read for our own seat alone: counted for the opponents
  too, one doubled hit of Kardur's paid for the Dictate by itself.
- **Pillow fort held to the grave** — YA57F-1 t27-t32: Inniaz's bot died tapped out with Ghostly
  Prison, Windborn Muse and Aetherize in hand, 7 mana for the first two, after the same board had
  hit it for 25. **Fixed 2026-11-22** (`combat-math.ts`'s `attackTaxAt`; scenario "casts Ghostly
  Prison, not one more blocker, in front of a board it can't block"): `threat` and the crackback
  counted every creature that could attack, tax or no tax, and a standing permanent's worth goes
  to nothing in front of a lethal board, so the Prison scored 1.4 over passing. Both now count
  only the attackers their controller can pay for, the hardest hitters first. On the live board
  (t30) it casts Windborn Muse and Ghostly Prison. Aetherize held with attackers declared is
  still open.
- **Removal held or aimed elsewhere** — D75RS-7 Zurgo t23 (Stroke of Midnight held while Alexios
  could only attack it), D75RS-9 Domri t15 (Clan Defiance at a commander, not the Slicer about to
  deal its last 3), FU89K-1 Muldrotha t29 (tapped out with Counterspell and Army of the Damned's
  flashback in view), 8WNCA-1 Surrak t27 (Rapid Hybridization on Slicer's back face at upkeep, so
  it came back as the double-strike face for exactly 21).
  **The first two fixed 2026-11-22** (scenarios "destroys the Alexios it holds for the turn" and
  "aims Clan Defiance at the Slicer it holds for the turn, at 18 commander damage from it"). In
  both the bot held the creature itself that turn, and a target was sorted by who controls it:
  last among a harmful spell's targets, and an 11/11 of its own to the evaluation. Three changes.
  A creature on loan (`handed-round.ts`'s `onLoan`: held until end of turn, or handed round) is
  a right target for a harmful slot. The evaluation counts a handed-round creature as its
  owner's, and as a threat to every other seat by its share of the attacks it makes under each
  holder. And a target is ranked with the commander damage it has dealt us on top, since a modal
  spell's slots are tried at their first target alone. Behind them, a rule for any board that has
  us dead to one opponent's swing back on our own turn: a move whose turn ends with us no longer
  dead comes before every move that leaves us dead (`ESCAPES`). On the live boards Zurgo attacks
  with Alexios and then Strokes it, and Atarka's bot casts a blocker (the Clan Defiance at
  Slicer scores just under it). The Counterspell and the Rapid Hybridization timing are open.
- **Overkill instead of splitting** — D75RS-7 Domri t25: everything at a player one attacker
  killed; the spare 4 at the other would have made its next attack lethal, and it lost by 1.
  Today it sends the one attacker the kill needs and keeps the spare home (the crackback reads
  the board it leaves as unsafe with it tapped); whether it should go at the open player is the
  attack search's ordinary call.
- **Slicer handed to the last opponent** — RCSBH-3 t21, D75RS-3's last upkeep: goad then points it
  at its owner. Looked at 2026-11-22 and left: on a bare two-player board the bot declines. On
  those boards Slicer carried Equipment, and declining converts it, which unattaches all of it
  (a Vehicle is no creature off its owner's turn, rule 301.5c): 6 life against re-equipping
  Mithril Coat and Infiltration Lens is the evaluation's call, and not clearly the wrong one.
- DV2N6-3 Teferi t31-t32: 4 named for Wheel of Misfortune under a damage doubler, then a
  Generous Gift on its own Darksteel-Mutated commander would have been lethal commander damage
  (the reader's line, not engine-checked).

## 2026-11-22 — Slicer's bot: Kusari-Gama left off the commander, Welding Jar held (TPGJ6-2)

Status: fixed 2026-11-22. All four scenarios gate.

**What was done.** (1)-(2) The real cause was v1's chump block, which every rollout's defenders
play: it summed power against life, so commander damage and double strike never made an attack
lethal, and it chumped a menace attacker with one creature, which the menace rule then dropped.
Beamtown Beatstick gives menace, so Elsha's rollouts never blocked Slicer at all. It now chumps
while `isLethal` holds over `damageThrough` of the unblocked attackers (rule 903.10a, double strike
twice), an attacker lethal alone first, and sends two at a menace attacker (702.111b). With the
block predicted, Kusari-Gama on Slicer scores 62.2 against 43.3 for passing. `bot:diff` (six games):
3 of 10,470 decisions changed, Lathliss's controller casting Leyline Tyrant before combat instead
of pumping Dragons into blocks it had expected not to come. (3) A new evaluation feature, `guards`
(`features.ts`'s `guardsAnother`, weight 0.5): a noncreature permanent that can regenerate another
of ours worth keeping (nonland, nontoken, mana value 1+). Welding Jar is cast once there's an
Equipment out and held with nothing to protect.

From a kept live game (`games/2026-11-22/TPGJ6-2-4141081779.json.gz`, four bots, played on
772fd79d2; it replays exactly there). Alice's bot on Slicer, Hired Muscle lost to Elsha on turn 42.

**1. Kusari-Gama not equipped to Slicer (turn 39).** Elsha was at 16 life with 16 commander damage
from Slicer, so Slicer unblocked killed her: she had to block. Alice put Beamtown Beatstick on
Slicer (two of six mana) and attacked; Elsha chump-blocked with two Monk tokens and kept her board.
Kusari-Gama ("whenever equipped creature deals damage to a blocking creature, this deals that much
to each other creature defending player controls"), equip {3}, stayed unattached. **Why:** after the
Beatstick equip, every candidate scored 999961, a won game: the rollouts let Slicer through, so
pass, Kusari-Gama on Slicer and every other equip tied, and ties go to passing. An equip whose value
is only in a block can't show where the rollouts never block. Scenario: "equips Kusari-Gama to a
commander the opponent must block". **Likely fix:** when the best candidates all score a win (or
tie at the top), score them again against the defenders' best blocks (`combat-math.ts`'s
worst-case blocks, the attack search's) so a line that wins only if the opponent declines a
forced block stops looking like the others. Might change: how often v2 commits to an all-in swing.

**2. Kusari-Gama on Goblin Welder (turn 41).** Slicer, untapped and still lethal by commander
damage, stayed home; The Sound of Drums and Kusari-Gama went on Goblin Welder, which Elsha let
through for 8 and kept all nine creatures, which killed Alice next turn. **Why:** the search scored
The Sound of Drums on Welder (74.4) far above everything; Sound of Drums on Slicer was never scored
in that search (out of its 92 simulations, or left out of the candidates: not yet found), and
Kusari-Gama followed on Welder from the turn plan's replay, unsearched. Scenario: "equips
Kusari-Gama to the commander, not the creature they'll let through". **Likely fix:** the same
re-scoring as 1, and finding why the commander's target was missing from the search.

**3. Welding Jar held three turns (turns 30-35).** "Sacrifice this artifact: Regenerate target
artifact", {0}. Cast scored exactly equal to pass at every main-phase decision (1.792 = 1.792 on
turn 30, 33.137 = 33.137 and 75.657 = 75.657 on turn 33): a noncreature permanent on the
battlefield is `otherPermanents` (2) + `permanentManaValue` × mana value, the card in hand `hand`
(2) + `handManaValue` × mana value, the same at mana value 0, and the tie goes to passing outside
the `"acting"` rollout. The user's call: cast it when there's something to protect, not earlier,
where it only waits for an artifact wipe — so not a flat weight change. Scenarios: "casts Welding
Jar once there are artifacts worth protecting" (training) and "holds Welding Jar with no artifact
to protect" (gate). **Likely fix:** value a permanent whose ability protects our permanents
(sacrifice-to-regenerate, -to-give-indestructible) by the best permanent it can save, in
`features.ts`, so it's worth more on the battlefield only when there is one.

## 2026-11-21 — One game's log, seven misplays (seed 230659861), and Slicer on turn one

Status: fixed 2026-11-22. All seven scenarios gate.

**What was done.** (1) `unscoredCast` no longer plays a cast only a rollout could vouch for: a
spell with targets to choose and none chosen, an X too small (`xTooSmall`, which no longer lets an X
paid in life through at low life or from a full hand), or one that would run the library out
(`runsLibraryOut`: the spell's own forced draws and mills, a permanent's "when this enters", and
for a whole-graveyard return every returning creature's, asked at fifteen cards or fewer). v1
holds a guard on its own life for a turn nothing threatens (`onlyGuardsPlayerThisTurn`,
`guardCanMatter`, through `wastedNow`, so v2's candidates leave it out too). (2) The share of
our power that has no one to hit because an opponent has protection from us counts as idle
(`idlePower`, `playerProtectedFrom`), which prices Noble Heritage's offer; v1's attack and v2's
attack search leave a protected player out of the defenders. (3) `effect-worth.ts` prices
`add-counter-all`, so v1 takes Avenger's counters and a tie no longer declines them. (4)
`handManaLine`: in our own main phase, where everything else has been passed over, a look plays
the free rocks in hand and then the hand's mana abilities one more at a time, and takes the first
step of the first line that makes castable a spell of mana value 3 or more that v1 would cast;
v2 plays the line's steps and then the spell without a search.

From the log of a live four-bot game a friend of the user's sent (bots on his Queen Marchesa
deck and on Teval, Kangee and Eshki decks; Queen Marchesa won when Teval's bot drew from an
empty library), and one report from another game. Four causes between them.

**1. Out of time, v2 plays v1's cast unscored — and v1 casts anything.** Three misplays, one
path: on a board too big for one rollout to fit the 1 s clock (some forty permanents), a
priority search with nothing scored plays v1's cast (`unscoredCast`, `eval-bot.ts`), and the
rest of the turn is answered the same way (`tooSlow`). Searched in full, v2 gets all three
right; each scenario runs v2 on a clock that has always run out (`outOfTime`).

- *Living Death onto a three-card library.* Teval's bot, on 27 life with thirty creatures and
  one opponent left, cast it; Stitcher's Supplier milled the three and Uro's draw lost the game.
  It had milled itself there with Syr Konrad's ability, eight activations that turn, the last
  four after the only player they could hurt was dead. Scenario: "doesn't cast Living Death when
  what it returns runs its library out". Beside BACKLOG's "A draw the bot can't decline can
  still deck it".
- *Fire Covenant for X=1 at no target.* Queen Marchesa's bot, on 10 life. The log has no target
  and no damage for it (the friend remembered it killing a 1/1 Insect; the Insect died in combat
  after). The scenario's v1 cast is exactly that: `xValue: 1, targets: []`. Scenario: "keeps Fire
  Covenant for a creature worth its life, not X=1". *Found later the same day:* no target was
  all the engine offered. A life-paid X was missing from the cast offer, so the "up to X"
  group was offered at X = 0 for bots and players alike; fixed in the engine, with v1's
  `lifeX` and v2's shares by what kills (`COMPLETED.md`, "Fire Covenant could be cast at no
  target only").
- *Angel's Grace in its own main phase*, on 25 life, among five other spells. Scenario: "keeps
  Angel's Grace in hand on its own turn with nothing threatening it".
- **Likely fix:** `unscoredCast` takes v1's cast only where a cheap test says it does something
  (a spell with targets has one; an X spell isn't cast at its least; nothing whose effect ends
  this turn on our own turn; no cast while the library is inside the reserve), or v1 learns
  those. Risk: the bot audit's S1 (2026-11-10) was the opposite failure, 180 of 180 expired
  windows passing; a filter must not bring that back for ordinary creatures and rocks.

**2. Protection from a player is invisible to the bot.** Nothing in `engine/src/bot` reads
`protectionFromPlayers`.

- *Noble Heritage's counters taken twice.* Teval's bot took two +1/+1 counters each time, which
  gave Queen Marchesa's bot (on 11) protection from it until her next turn: every Syr Konrad
  ping and any attack prevented. v1 declines; v2 searches (two simulations) and takes them,
  because the rollout ends before its own next attack, where the protection would cost it.
  Scenario: "declines Noble Heritage's counters when they give the player it is about to kill
  protection from it".
- *An attack at the protected player.* Kangee's bot, having taken the counters too, sent 12
  power at her on its next turn; all prevented. The all-in looked lethal to the combat
  arithmetic, which doesn't read the protection, so v1's swing stood after one simulation.
  Scenario: "doesn't attack a player who has protection from it".
- **Likely fix:** the lethal read (`combat-math.ts`) and the attack's candidates drop a defender
  with protection from us; an offer whose `ifDid` hands an opponent protection from us is priced
  as a turn of our damage at them lost (`effect-worth.ts`). Small risk: both are rare.

**3. A free "may" that changes nothing this turn is declined.** Teval's bot took Avenger of
Zendikar's landfall counters the turn it landed and declined them ten times the turn after. By
then its twelve Plants killed a player as they stood, so the rollout ended the same with the
counters or without; a tie keeps v1's answer, and v1 declines. (Rebuilt: twelve Plants at one
counter against 20 life, taken; at two counters or more, declined; two Plants at four, taken.)
The game went on two more turns. Scenario: "takes Avenger of Zendikar's landfall counters on
twelve Plants". **Likely fix:** v1 takes a costless "may" whose effect is good by polarity
(`chooseModes`, `effect-worth.ts`), so a tie falls on taking it.

**4. Mana a card in hand makes isn't counted.** Another game: a bot on a Slicer deck held a
land, Lotus Petal and Simian Spirit Guide on turn one and didn't cast Slicer converted for
{2}{R}. The auto-payer never reaches into a hand (`Game.manaSources`; the Guide is activated by
hand before the cast), and the bot's reads of what it can pay follow it: rebuilt, it plays the
Mountain and nothing else, not even the Petal. Scenario: "casts Slicer on turn one off a land,
Lotus Petal and Simian Spirit Guide". **Likely fix:** the candidates include a cast that hand
mana abilities would complete, played as the activation first. Costs a card, so only where the
cast is worth it.

Also in the log, not rebuilt: Path to Exile aimed at a commander (BACKLOG, the threat marks);
three lone attacks into a wide board, one of them trading a Shadowspear carrier for Wonder;
Disenchant on Gleaming Splendor with Smothering Tithe beside it.

**Brass Squire "tapped for its ability and still attacked"** (the same friend, another game):
not reproduced. The engine refuses both orders — tapped by its ability it isn't offered as an
attacker and a declaration naming it is refused ("is tapped and cannot attack"); once attacking
it is tapped and the ability is refused ("already tapped"). Needs that game's log.

## 2026-11-17 — Scourge of Valkas, then Atarka: Terror of the Peaks left in hand

Status: half fixed 2026-11-17. The library's order no longer reaches a decision (its scenario
gates); an engine's turns to come are still unpriced (its scenario is training).

- **Seen:** the same live game and seat as the entry below, round seven (the user played the
  seat until about the Wrath, then let a bot take over). Fifteen mana in the first main phase:
  eight lands, Arcane Signet, Frontier Siege's {G}{G}, Bloom Tender. Out: Garruk's Uprising,
  Dragonhawk, Ureni of the Unwritten and Ureni, the Song Unending. In hand: Terror of the Peaks
  (since the opening hand), Atarka, World Render, Scourge of Valkas, Sakura-Tribe Elder, Fanatic
  of Rhonas, Carnelian Orb of Dragonkind, Heroic Intervention. It cast Scourge (its 4 killed
  Giada), Atarka (Scourge's 5 killed Krenko) and Fanatic of Rhonas, attacked joedf, on 18, with
  three fliers Atarka had given double strike, and cast the Elder after combat. Terror was never
  cast in the game. The user: "why did it play Scourge of Valkas before Terror of the Peaks?"
- **Right:** Terror, Scourge, Fanatic and the Elder, 14 of the 15 mana: 11 damage from the
  triggers (5 from Scourge, 4 + 1 + 1 from Terror) against the 9 it got, the same lethal attack
  (22 in the air at a player on 18: the double strike was overkill), and Atarka the turn after
  under both.
- **Why, part one: Scourge before Terror is not itself the loss.** Scourge then Terror is 4 and
  5 from Scourge's trigger; Terror then Scourge is 5 from Scourge and 4 from Terror. The plan
  scores the two lines the same to the last digit. What left Terror in hand was the second
  spell: Scourge then Atarka scores 1.7 over Scourge then Terror. Atarka is a 6/4 that doubles
  this turn's attack; Terror is a 5/4, and its trigger is worth only what enters under it inside
  the same line. Nothing in the evaluation prices what it does on the turns to come, as
  `drawEngines` and `tokenEngines` price theirs.
- **Why, part two: the turn depends on the library's hidden order.** Each rollout of a line
  draws for Garruk's Uprising, exiles and plays for Dragonhawk's attack and looks at the top
  eight for Ureni, off the library in its real order, which the seat can't know. On the rebuilt
  board, changing only that order changes the turn. Forty Forests: Scourge, Atarka, Fanatic and
  the Elder after combat, the live turn cast for cast. The log's cards on top (Hellkite Courser,
  Mountain, then Dragonhawk's five): the same three, then Hellkite Courser and Terror after
  combat. The same cards under two draws and eight lands (Ureni's look found no Dragon in the
  game): Fanatic, the Elder, Heroic Intervention at the beginning of combat, and Blasphemous Act
  off Dragonhawk's exile. A line's value moves by tens of points on what its rollout turned up
  (144 against 118 for Scourge then Atarka, over two of those libraries); on one order, casting
  Terror alone scored *below passing*, the pass being credited with a Hellkite Courser cast from
  Dragonhawk's exile. A plan may not *use* an unseen library card (`unknownCards`), but every
  line's value still counts them.
- **Scenarios:** "casts Terror of the Peaks beside Scourge of Valkas, not Atarka: the engine
  before the bigger body" (training; reads "cast Scourge of Valkas, then Atarka, World Render,
  then Fanatic of Rhonas") and "casts the same first spell whatever order its library lies in"
  (training; "cast Scourge of Valkas over a library of Forests, Fanatic of Rhonas over the
  game's"). Both on `urenisSeventhTurn`, the board rebuilt from the log. The exact hidden cards
  of that turn aren't in the log (eight of them went to the bottom unseen), so the reproduction
  is of the casts, not of every number the live bot weighed.
- **Fix, two separate pieces; the first built.**
  1. *The library's order (built, the user's yes, 2026-11-17).* Every decision of v2 now reads
     and copies a state in which each library's unseen cards lie in an order made up for the
     turn (`bot/determinize.ts`'s `withHiddenCards`, as it's now named, through `EvalBotController.fairView`).
     The order is made from the cards themselves, each keyed by a hash of the turn, the seat and
     its id, so the real order has no say at all: the same cards lying two ways give the same
     answer, which is what the scenario asks ("casts the same first spell whatever order its
     library lies in", now gate: Fanatic of Rhonas one way up and Scourge of Valkas the other
     for a bot that reads the real order, Scourge both ways now). A top card the seat can see
     stays on top (Future Sight, Oracle of Mul Daya, an opponent's revealed top); the
     opponents' libraries are hidden the same way; and a simulation's random numbers are no
     longer the real game's, so a shuffle or a coin flip in a rollout isn't the one that will
     happen. One order a turn rather than a decision: a plan made in one window reads the same
     in the next, and the pass memo still knows a board it has searched. Left as it was where
     an order can't be made up safely: while a resolution waits to go on, or the decision asked
     names a library card (a scry, a search). Not done: the opponents' hands, which a rollout
     still reads; what a player knows of a library beyond its top (a card they put there),
     which the bot now forgets; several orders averaged, where one sample is still one sample.
     `libraryOrder: "real"` keeps the old reading, for measuring what the knowledge was worth.
     Measured (`bot:ab`, one seat new against three old): 27 wins in 111 four-player games,
     24.3% where even is 25% (95% interval 17.3 to 33.1). Level: the knowledge was worth
     nothing that shows in who wins.
  2. *An engine's turns to come.* A feature beside `drawEngines` and `tokenEngines` for a
     permanent whose trigger pays for every creature (or spell) that comes after it (Terror of
     the Peaks, Scourge of Valkas, Dragon Tempest, Garruk's Uprising, Warstorm Surge), worth
     something on the board before anything has entered under it. `entersPayoffFilters` already
     finds them. Risk: priced too high, they go down ahead of what should be cast; fit it with
     `bot:fit-scenarios` against the scenario and bench.

## 2026-11-17 — Garruk's Uprising cast after Dragonhawk, on an empty board

Status: fixed 2026-11-17 (its two scenarios gate).

- **Seen:** a live game, read from its exported log (seed 4022047087, four players, the seat
  named Player 1). Round five. A Wrath of God two turns before had emptied the board, Ureni and
  Miirym with it. The seat had Stomping Ground, Bountiful Landscape, Shivan Reef, Forest and the
  turn's Mossfire Valley, Arcane Signet, and Frontier Siege on Khans: eight mana in its first
  main phase, the eighth from Mossfire Valley's filter. In hand were Garruk's Uprising,
  Dragonhawk, Fate's Tempest, Terror of the Peaks, Scourge of Valkas and Atarka, World Render.
  It cast Dragonhawk (which exiled Bloom Tender), then the Uprising (which drew an Island), and
  Bloom Tender from exile in its second main phase. The user: "played Garruk's Uprising after
  Dragonhawk instead of before it."
- **Not held too long:** the Uprising was drawn on turn 7 and no earlier turn could cast it
  beside what the seat cast instead: Arcane Signet on two lands, Frontier Siege on four mana
  (the Uprising alone was the other choice, and the Siege is the better one), Ureni on exactly
  seven with {G}{G} left for the second main phase.
- **Right:** the Uprising first, then Dragonhawk. **On this board both orders draw one card**:
  cast second, the Uprising's own enters-draw sees the Dragon, so the turn lost nothing. What
  the order changes is what that card depends on. The enters-draw has an intervening "if" (rule
  603.4): a removal spell on the Dragon in response and there is no card, where "whenever a
  creature … enters" has triggered by then whatever becomes of the creature. And with a
  power-4 creature already out it is two cards against one; there v2 already cast the Uprising
  first, since its enters-draw makes it a good first move by itself.
- **Why:** two things in the turn plan (`planLines`, `bot/turn-plan.ts`), found by tracing the
  rebuilt board.
  1. Its lines begin from the three best single moves (`PLAN_BEAM`), each scored with the turn
     passed after it. The Uprising alone is an enchantment that does nothing: 5.9 over passing,
     beside Dragonhawk's 14.2, Atarka's 11.6, Terror's 9.5 and Scourge's 9.2, the worst of
     five. So no line beginning with it was played at all; the plan had Dragonhawk-then-Uprising
     at 22.5 over passing and no other order to set beside it.
  2. With only the two cards in hand both orders are tried, and they score the same to the last
     digit (48.665 each). Lines are sorted by value, a tie keeps the order they were found in,
     and the better first move's lines are found first: the Dragon's.
  `payoffFirst` named the Uprising throughout (v1 alone casts it first here, then Terror of the
  Peaks), but since the bot audit's Q7 (2026-11-10) it only puts the payoff first among the
  one-move search's candidates, where it wins ties. The plan had no such rule.
- **Scenario:** "casts Garruk's Uprising before the Dragon it would see enter, with three more
  creatures castable" (gate): the live board. Read "chose alice's Dragonhawk, Fate's Tempest"
  with the fix switched off.
- **Fix (built):** once the plan has its line, a payoff (`payoffFirst`'s) that the line casts
  after its first move is moved to the front and the line played again (`replayLine`: each
  move resolved, the turn passed out, scored as any line). That order replaces the line when it
  scores no worse and passes the same crackback check (`lineSafe`). It reorders the moves of the
  line already chosen, so it can't change which cards are cast, and costs one more line's
  simulations, only when the chosen line holds the payoff further back. The strictly better
  case comes with it: Dragon Tempest or Beast Whisperer behind three stronger first moves was
  never tried first either. `scenario-fit.ts`' replay is told (`lastPayoffAhead`), since it
  otherwise plays the first of the best.
- **"No worse" had to mean more than the score.** The first version compared the two lines'
  values, and passed on the scenario's library of forty Forests. On the live game's own library
  (Bloom Tender on top, the Island under it) it still cast the Dragon first: the Dragon first
  exiles Bloom Tender and draws the Island, the Uprising first draws one and exiles the other,
  and the evaluation prices a land in hand 0.4 over a spell. The rollouts turn the library up
  in its real order and the seat doesn't know it, so that difference is nothing it could act
  on; three of four library tops tried went the wrong way by it. So an end that differs only in
  which cards of the library went where also counts as no worse (`sameKnownEnd`: every
  player's life and counters, every permanent, the size of every hand, library, graveyard and
  of exile). The scenario now stacks the live library's top two. The planner's other
  comparisons still read the library's order that way; noted in BACKLOG ("Bots").
- **What the decision diff found: the reordered plan was not kept.** With the reorder alone,
  `bot:diff` against `origin/main` disagreed once in 12,114 decisions on the bench decks (none
  in 8,584 on four decks that run these payoffs): seed 2, turn 30, Aligned Heart ahead of
  Caldera Pyremaw, so the Dragon is the second spell and the Heart's Flurry sees it. Read on
  its board, that turn came out worse. The Heart went on the stack under a cast trigger of the
  bot's own; `holdPass` passes on a searched cast when it is the one new object on the stack,
  and two made the window a searched one. The search there can't see the plan: it cast Abrade
  in response and cracked five Lander tokens, and the Dragon the plan still held had no mana.
  The old order had hidden this, the dear spell being paid for before any window opened. It is
  older than the reorder: on a small board (Monastery Mentor out; Aligned Heart, Caldera
  Pyremaw and Abrade in hand; eight lands) `origin/main` casts the Heart first by itself, then
  Abrade in answer to its own Mentor trigger, and keeps the Dragon in hand.
- **Second fix (built):** a step of the turn plan resolving, with more of the plan to come, is
  passed on rather than searched (`planResolving`): our own main phase, nothing asked, a stack
  of nothing but our own spells and abilities. The line was scored with each step resolved
  before the next. An opponent's spell or ability on the stack is searched as ever, so is our
  own wipe (`holdPass`'s exception), and so is the plan's last step. Scenario: "casts the
  Dragon its plan holds after Aligned Heart, not Abrade in answer to its own cast trigger"
  (gate; `origin/main` ends that turn with the Pyremaw in hand).
- **Checked:** the gate, 277 of 277, with both boards. `bot:diff` against `origin/main`, v2,
  every row read on its board (the game replayed on the working build): six turns differ on the
  bench decks (12 rows in 11,840 decisions over six games), and one turn (2 rows) in 8,808
  decisions on four decks that run these payoffs (`--decks`, new for this: Ureni,
  and the upgraded Draconic Destruction, Tramplesaurus Rex and Temur Roar). One is the reorder:
  Aligned Heart, the Pyremaw from the plan as the second spell, then Abrade. The others are the
  bot passing where it used to answer its own spell: Idol of Oblivion's draw and a Nullmage
  Shepherd activation, both then made as the plan's last step (the Shepherd after the convoke
  spell it would have taken creatures from); Frantic Search cast once Prismari Command has
  resolved, not over it; a Rhonas pump skipped for four more creatures from the plan; and
  Thrill of Possibility, twice left uncast for the plan's Dragon and its Signet. Those two are
  a judgment call, the plan's against the one-move search's. Not benched: the seed 2 game went
  on from its turn 30 to another winner, which is one game and says nothing either way. v1 is
  untouched.

## 2026-11-16 — Terror of the Peaks' triggers at the creatures, when all of them at the player is lethal

Status: fixed 2026-11-16 (its scenarios gate).

- **Seen:** live games, more than once. Several creatures enter together under a bot's Terror of
  the Peaks, their triggers add up to an opponent's life, and the bot kills that opponent's
  creatures with them. The user: "I keep seeing the bots kill an opponent's board before they
  point any damage at face even when the cumulative total of the stack would be lethal."
- **Right:** all of it at the player: they lose, and their creatures go with them.
- **Why:** the triggers go on the stack one at a time, each asking for its target with the ones
  after it still waiting (rule 603.3d). v1 plans them together (`planDamage`,
  `target-polarity.ts`, 2026-10-07), but the plan counted only what the damage kills among
  *permanents*: a player was never one of its kills (`damageToKill` is null for one), and damage
  already on the stack at a player wasn't counted (`damageOnStack` maps objects). v2 searches
  each target, but inside a rollout the triggers still to come are aimed by v1 (`choose-targets`
  is not in `NESTED_DECISION_KINDS`), so by that same plan: at the first trigger, no line it
  played had the rest at the player, and 3 at a player on 9 lost to killing a 3/3. On the
  scenario's board (three triggers of 3, bob on 9 behind Serra Angel, Hill Giant and Grizzly
  Bears, a Hill Giant each for carol and dave) v1 alone aimed Angel, Angel, bob; v2 aimed a Hill
  Giant of each opponent's. With the first trigger put at bob by hand v2 sent the other two
  there: the second one's rollout had a single trigger left, which v1 aimed at bob there whatever
  was on the stack (it did in its own run too), so that line did end with bob dead. One trigger
  that kills alone already went at the player (the 2026-10-14 entry).
- **Scenarios:** "sends three Terror of the Peaks triggers at a player they kill between them"
  (gate; read "aimed at bob's Hill Giant, dave's Hill Giant, carol's Hill Giant" without the
  fix), "sends at a player only the Terror of the Peaks triggers that kill them, the third
  elsewhere" (bob on 6: two at him, the third past him and his creatures) and "kills creatures
  with three Terror of the Peaks triggers that leave a player on 1" (bob on 10: none at him).
- **Fix (built):** a player is a kill in `planDamage`, ahead of every permanent: an opponent
  needs their life less the damage already on the stack at them (`damageOnStackAtPlayers`,
  beside `damageOnStack`), the one who needs the least first, and takes the cheapest set of the
  chunks that covers it, as a permanent does; if the trigger being aimed is in that set it goes
  at the player. Asked for a single chunk too (the last trigger). v1's answer is then the player,
  every rollout aims the later triggers there, and v2 keeps it. `rankTargets`' "damage that ends
  a player" counts the stack's damage at them the same way, for a spell cast over such triggers,
  and passes over a player the stack already kills, and over that player's permanents, which
  leave with them (`bot:diff` on the first cut: a Dragon Tempest trigger behind the ones that
  ended a player went at that player's commander). It reads the life total only (and "can't
  lose life" or "the game"): prevention and life gained in response aren't seen, so a plan can
  come up short against those, as a lethal attack can.

## 2026-11-15 — Dragonlord Atarka's 5 all on one creature

Status: fixed 2026-11-15 (its scenarios gate).

- **Seen:** a live game, round 4. A bot cast Dragonlord Atarka and its trigger dealt all 5 to
  Gisa and Geralf, a 4/4. The user: "bots still don't understand splitting damage".
- **Right:** divide it to kill: 4 on the 4/4 and 1 on something 1 kills.
- **Why:** dividing is two choices, the targets and the shares (rules 601.2d, 603.3d), and the
  bots made only the first. An answer with no `division` is split as evenly as it goes
  (`divisionOf`): over a 4/4 and a 1/1 that is 3 and 2, the 4/4 lives, and the search rightly
  scored all 5 on the 4/4 above it. 4 and 1 was never a candidate. The same for a cast (Forked
  Lightning, Arc Lightning) and an activation.
- **Scenarios:** "divides Dragonlord Atarka's 5 to kill the 4/4 and the 1/1" and "casts Forked
  Lightning for 3 and 1 to kill the 3/3 and the 1/1" (gate; each read all of it on the bigger
  creature without the fix).
- **Fix (built):** `bot/divisions.ts`. Each candidate naming two targets or more carries its
  shares: every target what is lethal to it, the cheapest kills first, and the dearest first
  where that differs; the search plays both out. What it leaves is in BACKLOG ("three tokens of
  one stack as three targets"): the engine's refusal of one stack in two slots, v1's own answer,
  and splits that skip the best creature.

## 2026-11-14 — Reanimate on a one-drop, instead of waiting for something stronger

Status: fixed 2026-11-14 (its scenarios gate), for reanimation and then removal, steal effects, Clones, X spells and tutors to the top of the library.

- **Seen:** room K6DYC, turn 15 (the bot's fourth turn). Jodah's bot cast Reanimate at the user's
  Walking Bulwark, a one-mana 0/3 and the only creature card in any graveyard, with a table of
  Dragons and commanders still to die. The user: bots "struggle to know when they should hold off
  on using a spell to get more value". A watched game had the same: Reanimate on a Wood Elves.
- **Right:** hold it. The same card brings back a seven-drop a few turns on.
- **Why:** a card in hand is worth `hand` (2), a targeted spell an average card (`hand-worth.ts`),
  and a creature on the battlefield more than that, so any target beats holding. The search can't
  see the better target either: nothing in its rollouts dies and is brought back.
- **Scenarios:** "holds Reanimate when the graveyards hold only a one-drop" and "casts Reanimate
  at the six-drop in a graveyard" (gate). The first read "cast at the Bulwark" without the fix.
- **Fix (built):** a spell that takes a card from a graveyard for us (a `take` slot aimed at a
  graveyard) waits for a card of mana value four, or three quarters of what the battlefield's
  creatures cost on average, whichever is more (`takeSlot` in `controller.ts`). v1 doesn't cast
  it below that; v2's search leaves out the targets below it and chooses among the rest. At ten
  life or less it takes what there is. `test/v1-self-harm.test.ts`.
- **The same habit with other one-for-one spells** (the user asked for these too). In the same
  game Abrupt Decay went at a 1/1 Army token and Collective Resistance at the Walking Bulwark; a
  watched game had Progenitor Exarch cast for X = 0. Each waits now, all in `controller.ts`, with
  v2's candidates leaving out what v1 wouldn't cast:
  - *Removal* at an opponent's creature worth less than a Grizzly Bears (6 on `targetValue`'s
    scale; v2 prices it with `rankValue`, so an engine counts) is held (`removesTooLittle`). Not
    from a commander or an attacking creature; a noncreature target is the search's.
  - *A steal* (`gain-control`, or an Aura's "you control enchanted creature") is the same at 9, a
    vanilla 3/3 for three.
  - *A Clone* (`copyOnEnter`) waits for something on the battlefield worth 9
    (`holdsCloneForMore`).
  - *An X spell* isn't cast below X = 3 for an instant or sorcery, or at X = 0 for a permanent,
    unless it kills a player it's aimed at (`xTooSmall`).
  - *An instant tutor to the top of the library* waits for the end of the turn before ours
    (`holdsTopTutor`): the card is drawn in the same draw step, and until then the tutor is still
    in hand. Other tutors are priced by what they find (`hand-worth.ts`) and are cast as before.
  - All of them are off at ten life or less and (but the tutor) with seven cards in hand.
  - Scenarios (gate): "holds Abrupt Decay from a 1/1 token", "spends Abrupt Decay on a creature
    worth the card", "holds Clone with only a mana Elf to copy", "does not cast Progenitor Exarch
    for X = 0", "casts Progenitor Exarch for X = 1"; the rest in `test/v1-self-harm.test.ts`.

## 2026-11-14 — Crux of Fate at its own Dragons, with no opposing creature

Status: fixed 2026-11-14 (its scenario now gates).

- **Seen:** room K6DYC, turn 24, the game's log in hand. Player 1 and Atraxa were out; Meren had
  lands only. Jodah's bot cast Crux of Fate choosing "destroy all Dragon creatures" and destroyed
  nine of its own (The Ur-Dragon, Old Gnawbone, Two-Headed Hellkite, Scion, Morophon, and more).
- **Right:** not to cast it. Neither mode reaches an opponent's creature.
- **Why:** two things together.
  - Jodah's board was 30-odd permanents and a 30-card hand, so one rollout outlasted the 1 s
    budget. The search was cut before it scored anything, and played v1's cast unscored
    (`unscoredCast`), as it does for the rest of such a turn (`tooSlow`).
  - v1 casts what it can. A modal spell's modes are chosen by their targets alone
    (`aimableModes`), so with no targets both of Crux's modes pass and the first is taken, and v1's
    wipe checks read no modal spell (`offerEffect` returns nothing for one).
  - Searched in full, v2 passes on the same board.
- **Scenario:** "does not cast Crux of Fate at its own Dragons when the clock runs out" (gate),
  with a clock that runs out in the first rollout. Before the fix it read `modes: [0]`.
- **Fix (built):** `effectWorth` prices a sweep (`sweepWorth`): what it takes from the opponents,
  shared across them, less what it takes from us. v1 leaves out an untargeted modal mode worth less
  than nothing (`modeHarmsUs`) and doesn't cast an untargeted instant or sorcery that is
  (`harmsOnlyUs`: Wrath of God with only its own creatures). With an opponent's creatures to take,
  it casts the mode that takes them. `test/v1-self-harm.test.ts`.
  - The same game's turn 26, from the log: Teferi's Protection cast in its own upkeep with Meren on
    2 life, phasing out every attacker. v1 now holds "all permanents you control phase out" for an
    opponent's spell or attack to answer (`holdsOwnPhaseOut`), and keeps its mana in its upkeep and
    draw step while only its own abilities are on the stack (`holdsManaForMain`).

## 2026-11-14 — Scion of the Ur-Dragon activated 19 times at once

Status: fixed 2026-11-14 (its scenario now gates).

- **Seen:** room K6DYC, turn 22, Jodah's upkeep. With ~45 Treasures from Old Gnawbone, the bot
  activated Scion 19 times in response to Mana Vault's trigger, all on the stack together: 16
  Dragons went to the graveyard, three activations found none, and only the last copy stood.
- **Right:** one activation. Each copy lasts until end of turn and the last to resolve wins, so
  every one past the first spends {2} to put a Dragon in the graveyard.
- **Why:** the priority search's batches (`simulateRepeated`, `eval-bot.ts`) try an ability as
  many times in a row as the mana allows (up to `MAX_BATCH`, 20), as one candidate. They're meant
  for pumps whose activations add up ("Lathliss on a pile of Treasures"). Scion's don't, but
  only the batch of 20 is compared with the single activation; every activation after the first
  is then "batch replay", unsearched.
  - Measured on the scenario's board: 1, 2, 5 and 20 activations all score 64.30. The evaluation
    counts the 31 Treasures spent for nothing (`extraTokens` and `untappedMana` each fall by 31,
    the score doesn't move), so the batch ties with one activation and whichever Dragon the
    rollout happens to leave copied decides it.
- **Scenario:** "activates Scion of the Ur-Dragon once, not a batch of twenty" (gate). Before the
  fix it read "activated Scion 20 time(s) in a row".
- **Fix (built):** an ability whose effect makes a copy isn't batched (`replacesItself`), and each
  activation past a batch's first costs its score a tenth of a card (`BATCH_STEP_COST`), so a
  batch that only ties with one activation loses to it. The upkeep hold above also keeps mana
  out of an answer to the bot's own upkeep trigger, which is where this batch was played.
  - Still open (`BACKLOG.md`): spare Treasures and untapped mana scoring nothing.

## 2026-11-14 — Lathril (menace) swung into a 7/7 and a 5/5 and died

Status: fixed 2026-11-14 (its scenario now gates).

- **Seen:** room K6DYC, round five, four players, no capture. Meren's bot had its commander,
  Lathril, Blade of the Elves (2/3 menace), and only lands besides. It attacked Jodah, who had
  Old Gnawbone (7/7), Two-Headed Hellkite (5/5), Scion of the Ur-Dragon, Wood Elves and Walking
  Bulwark untapped. Gnawbone and the Hellkite blocked together and Lathril died.
- **Right:** keep Lathril home, or send it at Atraxa, whose Orcish Bowmasters and Rona (1/1 and
  1/3) can't kill a 2/3 together. The user: it killed its commander "for no reason".
- **Why:** v2's attack search predicts every defender's blocks with v1's `declareBlockers`
  (`simulateCombat`). v1 never double-blocks a menace attacker that one of its creatures kills
  alone (`controller.ts`):
  - Gnawbone takes Lathril as a "favorable" single block (it kills it and survives).
  - The gang-block step skips any attacker a lone blocker already kills.
  - The final menace filter drops Gnawbone's lone block (rule 702.111b needs two or more).
  - So v1 answers **no blocks at all**, checked directly on this board. The search saw Lathril
    unblocked, 2 damage and two Elf tokens, while the real defender (a v2 seat) blocked with two.
- **Scenario:** "keeps a menace commander out of a board with two blockers that kill it"
  (gate). Before the fix it read "attacked carol" (Jodah's seat); it now attacks bob (Atraxa's).
- **Fix (built):** v1's blocks keep a menace attacker out of the lone favorable block, and the
  gang-block step pairs it up even when one blocker kills it alone: the pair that kills it for the
  least `gangLoss`, still only when the attacker is worth more than that loss. A blocker that a
  menace attacker used to waste (a lone block, dropped as illegal) now blocks another attacker.
  `test/v1-blocks.test.ts`.

## 2026-10-14 — Terror of the Peaks' 7 at a creature of a player on 4

Status: fixed 2026-10-14 (its scenario now gates).

- **Seen:** room NBMGP, round eight, four players, no capture. Tasigur was on 4 life. The bot cast
  Ureni of the Unwritten, whose trigger put Drakuseth, Maw of Flames onto the battlefield.
  - Terror of the Peaks' trigger for Ureni went at Ghave's Felothar the Steadfast.
  - Its trigger for Drakuseth dealt 7 to Tasigur's own Avenger of Zendikar.
  - Terror then attacked Tasigur for the last 5.
- **Right:** the 7 at Tasigur. It ends them before combat, Avenger and all, and Terror is free to
  stay home as a blocker (the user: it "could have just killed the player before to save a
  blocker").
- **Why:** the answer is v1's aim, the first one v2 scores and what it keeps when its search is
  cut short. On that board, with the live clock, the search most likely was. `rankTargets`
  (`target-polarity.ts`) puts every opponent's target the damage "lands" on first: a player, or a
  creature it kills. Among those it sorts by `targetValue`, so the most valuable creature it kills
  beats the player, even when the damage is lethal to that player.
  - Searched in full, Avenger never wins; it ties with the Plant tokens. The rollout attacks
    Tasigur for lethal whatever the trigger hits, so Tasigur dies in every line. The search then
    sends the 7 at Ghave's Faeburrow Elder.
  - That is defensible, but the user's blocker isn't in it: the rollouts end at the next player's
    untap, so an untapped Terror is worth nothing to them.
- **Scenario:** "aims Terror of the Peaks' 7 at a player on 4, not at that player's creature"
  (gate). It replays the stack as it went, with one simulation so v1's aim stands. Before the fix
  it read "aimed at bob's Avenger of Zendikar".
- **Fix (built):** `rankTargets` now ranks first an opponent whose life a harmful damage slot's
  damage meets (rule 704.5a), ahead of every creature it kills. Their whole board leaves with them
  (800.4a), so no creature of theirs is worth more.
  - Not a player who can't lose life or can't lose the game (`playerCantLoseLife`,
    `playerCantLoseGame`: Platinum Angel), pinned in `target-polarity.test.ts`.
  - The full search is unchanged: there the rollout's attack kills the player anyway. With them
    dead before combat, whether Terror attacks someone else or stays home is the attack planner's
    crackback call.

## 2026-10-14 — Garruk's Uprising before Carnelian Orb of Dragonkind

Status: fixed by 7ab7dcdd (its scenario gates from the start).

- **Seen:** the live site, which was still running e947bf60. Round four, four players. The bot had
  five untapped lands: Forest, two Mountains, Frontier Bivouac and Sheltered Thicket. In hand were
  Garruk's Uprising ({2}{G}), Carnelian Orb of Dragonkind ({2}{R}, taps for {R}), Balefire Dragon
  and Utvara Hellkite. It cast the Uprising, which left two mana and no Orb.
- **Right:** the Orb first, paid with the Mountains and the Forest. Bivouac, Thicket and the Orb
  then pay {2}{G} for the Uprising, so the bot casts both rather than one.
- **Why:** the one-move search scored each move with our own seat passing for the rest of the
  turn. That way the Orb was worth only a rock on the board, while the Uprising was an enchantment
  worth something by itself, so the Uprising won. 7ab7dcdd's `followUps` also rolls out each move
  played to resolution, followed by every move it opens up. Measured that way, the Orb is worth
  the Uprising cast after it.
- **Scenario:** "casts Carnelian Orb of Dragonkind before Garruk's Uprising, then has mana for
  both" (gate). It reproduces at e947bf60 ("chose alice's Garruk's Uprising") and passes at
  a363d84e.

## 2026-10-12 — Roiling Dragonstorm on turn two over Rampant Growth

Status: fixed 2026-10-12 (its scenario now gates).

- **Fix (built):** `earlyMana` (`features.ts`) counts each land past one per land drop the player has
  had (`landDropsHad`: one a turn begun, less the active player's own while it hasn't played one) on
  top of `nonlandMana`, so Rampant Growth's land is a turn-two Arcane Signet: it now scores +8.39 over
  passing against Dragonstorm's +2.44. The leftover enchantment (`otherPermanents` 2 +
  `permanentManaValue` 1) is the other half of the margin, but that's how every noncreature permanent
  is priced, and a mana rock below a card in hand made casting one a loss; the missing term was the
  ramp, not the enchantment.
  - Counting "turns begun" alone read the next player as behind at a rollout's end (the turn has
    begun, its land drop not yet made), so a ramped opponent whose Llanowar Elves was killed fell below
    the two who weren't, and the bot held its Swords to Plowshares in "kills an early Llanowar Elves"
    and "kills a Craw Wurm ramped out on turn two"; counting land drops had keeps both right (margins
    1.8 and 1.0, as before).
  - `bot:diff` against c0568051 (six four-player games): 5 of 12,567 decisions, all in rounds 3–5 —
    two attacks moved to another opponent, Myriad Landscape and Harvest Season fetching lands over a
    spell or a token, and Sakura-Tribe Elder cracked in its own main phase. The last is wrong (its land
    enters tapped either way, and the 0/2 loses a round of blocking; the rollouts end with the turn, so
    they never see the crack at the end of the turn before ours). Held in its own turn, it cracked in
    the next player's upkeep instead, so a creature fetch is now held whenever it isn't due and the
    stack is empty, outside the declare-blockers and damage steps (`holdsCreatureFetch`,
    `controller.ts`; in its own turn, unless a landfall permanent of ours is out), gated by "keeps
    Sakura-Tribe Elder in its own main phase early on" and "… in another player's upkeep early on".
    The rest stand: the two attacks are judgment calls (the same attacker at another opponent, the
    table's strength read differently once ramp counts), and Myriad Landscape and Harvest Season
    ramping in rounds 4–5 is what the term is for.

- **Seen:** room LCKCN, round 2 (four players, the user's seat bot-played): a Temur Dragons deck
  with Temple of Mystery and Shivan Reef out and its land drop made cast Roiling Dragonstorm ({1}{U}:
  draw two, then discard one) with Rampant Growth and Farseek in hand, beside Defense of the Heart,
  Maelstrom Colossus and Scourge of Valkas.
- **Right:** Rampant Growth (or Farseek). On turn two a land ahead of the curve is mana every turn
  after, and the hand is four- and five-drops under a six-mana commander; looting only sorts the hand.
- **Scenario:** "casts Rampant Growth on turn two, not Roiling Dragonstorm" (a gate since the fix; it
  read wrong before it, casting Dragonstorm by 0.05).
- **Why:** v2's search scores the two against passing (18.43): Dragonstorm **+2.45**, Rampant Growth
  **+2.40**.
  - Dragonstorm leaves the hand at seven (cast one, draw two, discard one) and puts an enchantment on
    the battlefield worth `otherPermanents` 2 + `permanentManaValue` 1. That enchantment does nothing
    more until a Dragon bounces it, but it scores like a Sol Ring.
  - Rampant Growth is a land (`lands` 4.5) for a card (`hand` 2).
  - `earlyMana` (+6 a mana through round 2, fading by round 6) prices exactly this acceleration, but
    it reads `nonlandMana`, mana from rocks and creatures only. So a turn-two Arcane Signet counts
    the early bonus and a turn-two Rampant Growth doesn't.
  - `bot:fit-scenarios`: `permanentManaValue` 0.5 → 0.38 or `handManaValue` 0.05 → 0.08 flips it
    and breaks nothing, but only by 0.19 — tuning to one board, not a cause.
- **Likely fix:** count a land beyond the curve (lands on the battlefield past one per round played)
  toward `earlyMana`, the same as a mana rock. That would put Rampant Growth about +6 ahead on turn
  two, and Explore and Sakura-Tribe Elder ahead with it.
  - Risk: an opponent who ramped reads as a bigger threat early, and removal aimed by `earlyMana`
    could go at a ramped player's creatures. The removal scenarios (`kills an early Llanowar Elves`,
    `kills a Craw Wurm ramped out on turn two`) would show it.
  - Lands from the bot's own natural drops never count, so a land-pass turn gains nothing.

## 2026-10-10 — Attackers sent in to die, or to trade, at four players

Status: fixed 2026-10-10 (its scenario now gates).

- **Seen:** "bots keep sending attackers in when they will die, which most of the time is not a good
  idea" — in a four-player game a trade leaves you and the player you traded with behind the other
  two (the user's words; no board saved).
- **Reproduced:** two Hill Giants, a Craw Wurm, and Giant + Grizzly Bears across three opponents against
  a Centaur Courser: v2 sends the Courser at the Giant + Bears player, at the room's 300 ms and unbudgeted
  alike. Bigger boards do the same (a Craw Wurm at a Craw Wurm + Hill Giant). With every opponent level
  (a Giant each) it keeps home, so it's the leading or the double-blocking player it goes at.
- **Right:** keep the creatures home — every attack there dies to a block or a trade.
- **Scenario:** "keeps a creature home when every attack dies to a block" (a gate since the fix; it read
  wrong before it, the Courser at dave).
- **Why (two causes, measured):**
  1. *The block isn't foreseen.* The attack planner (`eval-bot.ts`, `declareAttackersSearched`) scores
     each attack by `simulateCombat` (`bot/simulate.ts`), whose defenders are v1
     (`CombatRolloutController`). v1's `declareBlockers` (`controller.ts`) takes a trade only for an
     attacker worth 2 more than the blocker, and a gang block only where no single blocker kills the
     attacker — so it blocks none of these, and the planner reads the Courser as 3 unblocked damage
     (+1.0, the Wurm +0.5). Live defenders are v2, whose own block search double-blocks both
     (−3.55 and −7.96 against keeping home).
  2. *A trade with the leader scores as a gain.* Foreseen, a Courser-for-Hill-Giant 1-for-1 with the
     leading opponent scores **+1.5**; the same trade with a trailing one, −4.46. `scoreOutcome`
     (`evaluate.ts`) subtracts the strongest opponent at `opponent` 1.0 and the rest at
     `otherOpponents` 0.5 over their average, so the leader's lost creature pays for ours in full,
     and the two who sat out barely count.
- **Fix (built):**
  1. The combat stand-in takes any trade (`CombatRolloutController` sets v1's new `tradeMargin` from 2
     to −∞; v1's own blocks are unchanged). Even trades weren't enough: a live v2 defender traded a
     Colossal Dreadmaw (worth 17) for a Craw Wurm (15), counting the damage the block stopped. The
     planner now assumes the worst a defender will do with a blocker that kills the attacker.
  2. At three or more live players, an attack pays `bystanderShare` (`(n − 2)/(n − 1)`: half at three,
     two-thirds at four) of the creature value it costs us, measured as our creatures' value before
     less after (`eval-bot.ts`, `lessBystanders`; by id it misread a token stack the attack split as
     tokens lost). Kept out of `scoreOutcome`, where removal needs the leader counted in full.
  Every four-player board above now keeps home; head to head the Courser still trades into a Hill
  Giant, which the user's reason doesn't cover. Risk: fewer attacks into a leader about to win who
  could trade; lethal swings are unaffected (the win term dwarfs it).

## 2026-10-10 — A Mountain played where the Forest would cast Sakura-Tribe Elder too

Status: fixed 2026-10-12 (its scenario now gates).

- **Fix (built):** a land drop is ranked first by whether the spell the bot casts first after it —
  the dearest it would cast, as v1's `act` picks — leaves another castable once it has resolved
  (`castTogether` in `controller.ts`), then by the one-at-a-time count as before (the two a
  `LandReach`, compared by `compareReach`); v1's `bestLand` and v2's land search (`eval-bot.ts`,
  which searches only the lands that reach furthest) both use it. The Forest now reads 2 together
  against the Mountain's 1.
  - Not "the best pair", as the outline had it: with the Mountain, Sakura-Tribe Elder and Frostcliff
    Siege fit together too, so every pair tied; but the bot casts Battlecrier first (the dearest,
    level with the Siege and listed first) and then neither. Following its own first pick measures
    the turn it will actually play, at one simulation a land.
  - `bot:diff` against the earlyMana fix (six four-player games): 4 of 12,579 decisions, all land
    drops from round 5 on — Smoldering Marsh over a tapped Dakmor Salvage, Command Tower over
    Evolving Wilds and Sulfur Falls over a Mountain, each an untapped land or a colour that lets the
    turn's first spell be followed (right), and Cabaretti Courtyard over Fabled Passage (a judgment
    call, not checked by hand: the replay's board drifted from the diff's).

- **Seen:** room FU6RP, turn 11 (four players, the user's seat bot-played): the bot played a Mountain
  and cast Temur Battlecrier, with a Forest in hand that would also have cast Sakura-Tribe Elder.
- **Board:** Island, Hinterland Harbor, Mountain and Sol Ring out; in hand a Mountain, a Forest,
  Temur Battlecrier ({G}{U}{R}), Sakura-Tribe Elder ({1}{G}, {G} once Battlecrier's out), Frostcliff
  Siege and An Offer You Can't Refuse. The Harbor was the only green source.
- **Right:** the Forest — Forest, Island and Mountain cast Battlecrier, the Harbor the Elder. With the
  Mountain, Battlecrier takes the Harbor's {G} and the Elder has none.
- **Scenario:** "plays the Forest that casts Temur Battlecrier and Sakura-Tribe Elder, not a Mountain"
  (a gate since the fix; it read wrong before it, choosing the Mountain).
- **Why:** v1's `bestLand` (`controller.ts`) ranks lands by `castableAfterPlay` — how many spells are
  castable *one at a time* after the land — and every spell here is, after either land, so they tie.
  The colour tie-break ties too (green and red are both on the board already: 2 wanted pips each), and
  a tie keeps enumeration order: the Mountain, listed first. v2's search scores each land, but its
  rollouts pass our own seat, so neither land's rollout casts a second spell; v1's pick, scored first,
  wins the tie.
- **Fix (outline):** in `castableAfterPlay`, look one spell deeper: for each castable spell after the
  land, cast it (and let it resolve) and count what's still castable, keeping the best pair — "how
  many spells this land casts together this turn" — as the first key, the single count after it.
  Risk: cost (a simulation per spell per land, on top of today's one per land; capped to the few
  spells the bot would cast), and a pair that isn't what the bot then plays (it may cast the bigger
  spell alone); the land drop is cheap to get right here, as the mana is all known.

## 2026-10-10 — Sarkhan, Soul Aflame copies a Dragon and loses the discount the next one needs

Status: open, fix not wanted for now (the user, 2026-10-10); the scenarios stay as recorded.

- **Seen:** "the bot doesn't know when to let Sarkhan, Soul Aflame transform into a Dragon" (no
  board saved) — the user's case: it didn't copy **Summon: Bahamut** as it entered.
- **Not reproduced (Bahamut):** precombat with Sarkhan unsick, at two and four players, with and
  without the room's 300 ms clock, v2 casts Bahamut before combat, copies it and attacks as the
  9/9 every time; the engine's copy is right too (no lore counters, so rule 714.4 leaves him). The
  one way it declines is when chapter I's "destroy up to one target nonland permanent" is aimed at
  Sarkhan himself — rightly, as he's about to be destroyed — which the bot's own aim doesn't do.
  Held as a gate: "has Sarkhan, Soul Aflame become Summon: Bahamut". The live board differed in
  something not yet known (whether Sarkhan came down that same turn, whether Bahamut came after
  combat or some other way than cast).
- **Reproduced instead:** over the other spots that matter, v2 copies precombat with Sarkhan unsick
  and declines postcombat or with Sarkhan summoning sick, and gets this one wrong.
- **Wrong spot:** precombat, ten Mountains, two Shivan Dragons in hand. The first is cast at the
  discount ({3}{R}{R}); Sarkhan's trigger asks, and the bot copies it. As a copy, Sarkhan has Shivan
  Dragon's abilities, not "Dragon spells you cast cost {1} less", so the second Shivan ({4}{R}{R},
  five Mountains left) can't be cast this turn.
- **Right:** decline, cast the second Shivan at the discount, and copy *that* one when its own
  enters trigger asks: two Dragons on the board and Sarkhan still attacking as one.
- **Scenario:** "keeps Sarkhan, Soul Aflame himself while his discount casts another Dragon"
  (training; reads wrong today, choosing the copy). Its gate twin, "has Sarkhan, Soul Aflame become
  the Dragon it can attack as", holds the spot it gets right.
- **Why:** v1's `chooseModes` prices the "you may" with `effect-worth.ts`, which has no worth for
  `become-copy`, so it's a tie and declining wins. v2's decision search (`bestDecision`,
  `eval-bot.ts`) overrules it: it plays each answer out, but the rollouts pass our own seat, so
  neither answer's rollout ever casts the second Dragon. What's left is the copy's 5 in the air
  this combat against Sarkhan's 2/4, and accepting wins.
- **Fix (outline):** before accepting a "you may" whose effect changes the source's own text (a
  `become-copy` of the source, until end of turn), ask what it costs this turn — as
  `reducerFirst` does: compare the spells castable once each answer resolves
  (`legalActionsAfter` on `[accept, passes…]` and `[decline, passes…]`), and if declining keeps a
  cast that accepting loses, decline (the next Dragon's trigger offers the copy again). Contained
  to `chooseModes` / the decision search for this effect kind. Risk: declining a copy when the
  spell kept is one the bot then doesn't cast (a sorcery-speed one after combat), losing the
  attack for nothing — so only where the lost spell is a Dragon that would re-offer the copy, or
  check that the bot's own priority answer casts it.

## 2026-10-08 — Klauth's mana: all white, asked one unit at a time

- **Seen:** the bot "has no clue how to add mana in any combination of colors", and the choice is
  asked as modes — 50+ decisions when a lot of creatures attack (Klauth, Unrivaled Ancient: "add X
  mana in any combination of colors, where X is the total power of attacking creatures").
- **Right:** the colours the hand's spells need — Klauth's deck is red and green, the mana only casts
  spells — asked as one decision, not one per unit.
- **Scenario:** "splits Klauth's mana into the colours its hand casts" (training) — Klauth and two
  Craw Wurms attack (16 power), Lightning Bolt and a Craw Wurm in hand: the pool comes out
  sixteen {W}, after sixteen `choose-modes` decisions.
- **Why, the decision:** `addManaChoice` (`effects.ts`) offers "N mana in any combination of …" as
  one choice of split only while there are at most `MAX_MANA_SPLIT_MODES` (35) splits; over five
  colours that's three units. Past it, each unit's colour is its own `modal` choice of five, up to
  1,000 — for a human seat too, one prompt per point of power.
- **Why, the colour:** v1's `chooseModes` scores each mode by `effectWorth`, which prices {W} and
  {R} alike, so the tie goes to mode 0, white, every unit. v2 searches each of the sixteen (a
  rollout per colour per unit) and the evaluation doesn't read the pool's colours either, so v1's
  pick stands.
- **Fix (outline):** two parts.
  1. *The bot's colours* (contained): in v1's `chooseModes`, when every mode is a single-colour
     `add-mana`, pick the colour the hand needs most that the pool (already holding the earlier
     units) and the untapped lands don't cover — the coloured pips of the spells in hand, honouring
     a spend restriction (Klauth's is spells only), then the commander's colours. v2 takes v1's
     answer for these without a search: the evaluation can't see the difference, and sixteen
     searched units are most of a big attack's time.
  2. *The decision's shape* (a design call): one decision for the whole split — a new decision kind
     ("share N mana among these colours", counts per colour summing to N) through the decision
     registry, with a client prompt of per-colour steppers and a bot answer from part 1. Cheaper
     middle ground: give each per-unit choice "the rest as {X}" modes, ending the run in one pick.
  Might break: a deck whose hand needs nothing still gets some colour, which is harmless; the new
  decision kind touches engine, protocol, server and client together.
- **Status:** fixed, both parts (the user chose the one split prompt, 2026-10-08). Past 35 splits
  `addManaChoice` raises one `split-mana` decision (`decisions/split-mana.ts`, `Game.applyManaSplit`):
  how many of each colour, summing to N. v1's `chooseManaSplit` fills the hand's coloured pips
  less the pool first, then shares the rest among the commander's colours (or the hand's); v2 has
  no candidates for it and takes v1's. The client's prompt is a `CountStepper` per colour. The
  scenario gates: sixteen mana as eight {R} and eight {G}, in one decision.

## 2026-10-08 — a basic played over a fetch land with a landfall payoff out

- **Seen (the user's rule):** with landfall triggers on the board and the mana not needed, the bot
  plays a regular land where any fetch land would do more: a fetch is two lands entering, itself and
  the land it finds, so two landfall triggers to a basic's one.
- **Right:** the fetch, whenever every land in hand casts the same this turn.
- **Scenarios:** "plays Evolving Wilds over a Forest for two landfall triggers", "plays Wooded
  Foothills over a Forest …" and "plays Evolving Wilds over a tapped Jungle Hollow …" (training) —
  five Forests out, Rampaging Baloths, and a Grizzly Bears in hand that casts either way: all three
  play the other land.
- **Why:** every land casts the same (`castableAfterPlay` looks past a fetch's crack already), so
  v2 searches them all with v1's pick first, and the search can't tell them apart: its rollouts
  never crack the fetch, so the second landfall trigger never appears, and the lands tie. On a tie
  v1's `bestLand` decides: first the tapped land (Jungle Hollow), then the land making the colours
  the hand wants — the Forest's green for the Bears, where a fetch makes no mana itself. With an
  empty hand the fetch scored 0 like the Forest and won only by being listed first, so a board with
  nothing to cast hid the miss.
- **Fix (outline):** in `bestLand`, ahead of the tapped and colour tie-breaks, prefer a land with a
  free fetch (`isFreeFetch`, or any fetch the bot would crack) when a landfall permanent of ours is
  on the battlefield (`isLandfallPermanent`) — the castable count already tied, which is the user's
  "doesn't need the mana". Separately, a fetch could count the colours of what it can find in the
  colour score, which would help without a landfall payoff too. Might break: a fetch whose life
  payment the bot won't make (`FETCH_LIFE_FLOOR`) or with nothing left to find shouldn't win —
  gate it on the crack being one the bot would make; and v2's search still ties, so v1's order has
  to carry it, as it does today.
- **Status:** fixed (the user asked, 2026-10-08), in both bots. v1's `bestLand` puts a fetch it would
  crack at once (`crackedOnPlay`: `isFreeFetch` asked of a copy with it played, and a land left in
  the library) ahead of the tapped and colour tie-breaks while a landfall permanent of ours is out.
  v2 alone still lost to Jungle Hollow's life, its rollouts never cracking the fetch, so its land
  search now scores such a fetch as the drop and the crack together (`scoreLandDrop`, any fetch,
  landfall or not). All three scenarios gate, with a guard: no landfall payoff, the Forest over a
  Wooded Foothills that only costs life. bot:diff v1 (40 games): 39 of 82,803 decisions, every one
  a fetch over another land with a landfall payoff out (Bojuka Bog six times — its graveyard exile
  held for later).

## 2026-10-08 — Young Pyromancer cast before Shiko and Narset, so Swords to Plowshares wasn't copied

- **Seen:** Kykar cast Young Pyromancer, then Shiko and Narset, Unified from the command zone,
  then Swords to Plowshares at Adeline with Shiko still on the stack. Swords was the turn's third
  spell, so Flurry ("whenever you cast your second spell each turn") had nothing to copy, even had
  Shiko resolved first.
- **Right:** Shiko first, Swords second — Flurry copies it and a second creature is exiled — then
  Pyromancer.
- **Scenario:** "casts Shiko before Young Pyromancer so Swords to Plowshares is copied" (training)
  — Shiko in the command zone, Young Pyromancer and Swords in hand, eight lands, Adeline and a Serra
  Angel across: casts Young Pyromancer first. Beside the gate's "casts Shiko first so the Lightning
  Bolt after her is copied", which passes: there's no second payoff in that hand.
- **Why:** no search at all (`via: "payoff first"`, 0 simulations). `payoffFirst`
  (`controller.ts`, both bots) returns the first cast payoff in the offer list that leaves another
  spell castable after it, and Young Pyromancer and Shiko are both cast payoffs (`isCastPayoff`).
  Pyromancer came first. Then Shiko went second through the same return, which doesn't record
  `actedOn` — the Guttersnipe entry's miss — so Swords was searched afresh and cast in response.
- **Fix (outline):** in `payoffFirst`, with several cast payoffs on offer, put one whose trigger
  counts the turn's spells (`nthEachTurn`, Flurry) first, since its window is the turn's first
  spells; and while such a payoff is ours with its spell still to come (spells cast this turn one
  short of its `nthEachTurn`), don't hand that spell to another payoff through `payoffFirst` when
  a spell it would copy (one that targets) is castable — leave the choice to the search, whose
  `"acting"` rollout sees the copy. Plus the Guttersnipe fix, so Swords waits for Shiko to
  resolve. Might break: a hand where the plain payoff first is better (Pyromancer before a pile
  of instants, with Flurry worth only a card) — the search would still weigh that once the
  shortcut stops deciding.
- **Status:** fixed as outlined (the user asked, 2026-10-08): `payoffFirst` tries a spell-count payoff
  (`spellCountPayoff`, read off the trigger's `nthEachTurn`) before the others, and while one of ours
  waits for its spell (`spellCountPayoffWaiting`) doesn't hand that spell to a payoff that targets
  nothing when a spell Flurry would copy is castable. With the Guttersnipe fix below, the scenario —
  now the whole turn: Shiko, Swords (copied, both creatures exiled), Pyromancer — gates. v1 shares
  `payoffFirst` but has no search for the held slot, so it falls to v1's usual order (bot:diff, 40
  games: seed 25 cast Lier there, not Monastery Mentor; Flurry draws either way).

## 2026-10-08 — a kill through Towering Titan's trample passed up

- **Seen:** found while chasing the Titan report below, not in a live game. Twice the bot could
  sacrifice one wall to Towering Titan for trample and kill an opponent, and passed both times.
- **Right:** one wall for a player eliminated, every time.
- **Scenarios:** "gives Bob's attack on Carol trample with Towering Titan to finish her"
  (training) — a bystander: Bob's Craw Wurms and Colossal Dreadmaw into Carol's chump blocks,
  Carol on 12, trample takes her to −2; and "tramples a chump-blocked Towering Titan over for
  lethal" (training) — Alice's 17/17 Titan chumped by a Bear, every opponent on 15. Both pass
  when the Titan is activated once (checked by forcing it).
- **Why:** the search sees both kills and scores them below passing: −19.2 against −7.1, and
  24.5 against 33.1. `scoreOutcome` (`evaluate.ts`) is our position minus the strongest
  opponent's and a share of the *average* of the rest, and nothing counts how many opponents are
  left. Killing the weakest opponent (Carol, low on life and cards) takes her out of that average,
  which goes *up* — the kill reads as a loss. With opponents alike, the player removed leaves the
  strongest and the average where they were, so the kill scores about nothing and the wall
  sacrificed decides it. The same blind spot prices every elimination, not just this card's:
  a burn spell at a player's face, an attack that finishes someone off.
- **Fix (outline):** reward each opponent eliminated. Either a fixed bonus per opponent who has
  lost (a new weight, well above a creature and well below `WIN`), or let an eliminated opponent
  stay in the average at a floor score, so removing the weakest lowers it rather than raising it.
  Might break: kill-chasing over the real threat (finishing a harmless player while the leader
  runs away), and the four-player benches' balance — it needs the scenario gate, `bot:diff` and
  an A/B run, not just these two scenarios.
- **Status:** fixed with the first part, valued as the user suggested — more as the game goes
  on: a new weight, `eliminations` (20), adds each opponent eliminated scaled by the round
  (`eliminationShare`: a quarter in round 1, all of it from round 10). Both scenarios gate (the
  bystander one flips between 8 and 12). The second part was tried and dropped: averaging over
  the starting seats closed only 3–4 points of each gap, and a decision-diff showed it also
  halved the second opponent's weight in every three-player endgame (Jaws of Defeat moving off
  the trailing player). Champions keep `eliminations` 0.

## 2026-10-08 — Towering Titan's sacrifice activated several times

- **Seen:** while one opponent attacked the user with everything, a third seat's bot (Abzan
  Armor, Felothar's deck) activated Towering Titan's "Sacrifice a creature with defender: All
  creatures gain trample until end of turn" several times, throwing away walls. The first
  activation can be a real play (the attacker's blocked creatures trample over the user's
  blockers), but every one after it gains nothing: trample doesn't stack.
- **Right:** at most one activation a turn, and only when the trample changes a combat.
- **Scenario:** none kept — **not reproduced.** Every board tried had v2 activate the Titan zero
  times: the bot's own turn with the Titan chump-blocked (Felothar out or not); an opponent
  attacking the bot, lethal or not; and the reported shape, Bob attacking Carol with Craw Wurms and
  a Colossal Dreadmaw into chump blocks while Alice holds the Titan and four walls. Likewise v1,
  and v2 under a live-room clock (`timeBudgetMs` 300 and 40).
- **What's known:** the default `"turn"` horizon rolls out past cleanup, so trample itself never
  scores (`evasivePower` in `features.ts` counts it only while it lasts); only the damage it
  lets through does. A second activation lets no more through, and a sacrificed wall costs
  `creatures`/`toughness`, so the repeat should score below passing. Something on the live board
  made a sacrificed wall read as a gain, or a repeat look like a fresh choice. Leads: a wall with
  value when it leaves (a token, a death trigger), the batch path (`simulateRepeated`, which
  re-offers `previous` with a fixed `sacrifice`), or the repeats spread over separate windows.
  The Capture button on the next sighting would settle it.
- **Seen on the way (not the report):** the opposite miss is reproducible — the entry above.
- **Status:** not reproduced.

## 2026-10-08 — an instant cast in response to the bot's own Guttersnipe

- **Seen:** the bot cast Guttersnipe, then an instant with Guttersnipe still on the stack. The
  instant resolved first, and Guttersnipe's 2 damage to each opponent was lost.
- **Right:** let Guttersnipe resolve, then cast the instant, which triggers it.
- **Scenario:** "lets Guttersnipe resolve before casting Lightning Bolt" (training) — four
  Mountains, Guttersnipe and Lightning Bolt in hand, Grizzly Bears across: casts Guttersnipe,
  then Bolts the Bears in response.
- **Why:** the same miss as the Archmage Emeritus entry below (2026-10-06), and a second gap
  behind it. Guttersnipe goes out through `payoffFirst`'s early return in `EvalBotController.act`,
  which doesn't record `actedOn`, so the next window isn't a held pass (`holdPass`) but a
  fresh search. In that search `castPayoff` — which turns on the `"acting"` rollout, the one
  where our own seat casts its spells later in the turn — reads the battlefield, hand and
  command zone but not the stack, so with Guttersnipe on the stack it's false and the rollout is
  the default `"combat"`, where our seat casts nothing. Passing is scored as Guttersnipe
  resolving with the Bolt never cast; Bolting the Bears now scores higher.
- **Fix (outline):** both parts. Record `actedOn` on the early returns that cast our own spell
  (`payoffFirst`, landfall-first, reducer-first), so the window after passes while it resolves —
  the Archmage entry's fix. And let `castPayoff` count our own payoff on the stack, so a window
  that is searched with it there (an opponent responded, a trigger landed, so `holdPass`
  doesn't apply) rolls our seat out acting, where the Bolt cast after it resolves scores the
  2 damage to each opponent. Might break: the first, nothing deliberate (a response to our own
  spell was never a searched choice). The second turns on `"acting"` in more windows — those
  rollouts cost more, and the tie in `act` goes to acting, so a window with a payoff on the
  stack could still cast in response on a tie; the scenario would show it.
- **Status:** fixed, both parts: `payoffFirst`, `reducerFirst` and landfall-first record `actedOn`
  (`EvalBotController.acted`), so the window after passes while the spell resolves; and `castPayoff`
  counts a payoff of ours on the stack. The scenario gates.

## 2026-10-07 — a fetch land not counted as this turn's mana

- **Seen:** the bots don't see a fetch land that can get an untapped land as mana for this turn,
  so they don't favour it even when cracking it would let them cast a spell that turn.
- **Right:** a fetch that finds an untapped land (Wooded Foothills for a Forest) is as good as
  that land this turn. Played and cracked, it casts what the land would.
- **Scenario:** "plays Wooded Foothills over a tapped Jungle Hollow to cast Birds of Paradise"
  (training) — turn one, Wooded Foothills, Jungle Hollow and Birds of Paradise in hand, a library
  of Forests: plays Jungle Hollow.
- **Why:** both bots rank land drops by what each casts right after it's played: v1's
  `bestLand` by `castableAfter` (`controller.ts`, `castableAfterPlay`), and v2 only searches the
  lands that cast the most. That look stops at the land drop, before the crack, and a fetch
  makes no mana itself, so the fetch reads as casting nothing: a tie with Jungle Hollow, and on
  a tie `bestLand` takes the tapped land. (Cracking itself is fine: once the fetch is down,
  `isFreeFetch` cracks it at once.)
- **Fix (outline):** in `castableAfterPlay`, look past a fetch as it does past a shock land's
  "pay 2 life?": when the land just played has a free fetch ability (`isFreeFetch`), carry the
  look on through activating it, every player passing so it resolves (as `reducerFirst`
  resolves a reducer), and answering its search as the bot would (the land its
  `choose-from-zone` answer picks), then count what's castable. A fetched land that enters
  tapped (Evolving Wilds, Terramorphic Expanse) then rightly counts as nothing, and a fetch
  whose life payment the bot wouldn't make (`FETCH_LIFE_FLOOR`) isn't looked past. Might break:
  the extra simulated steps cost time on every land drop holding a fetch (a few
  `legalActionsAfter` calls, each a cloned game), and the search's answer has to be the same
  one the bot gives later, or the land drop counts a land the crack won't find.
- **Status:** fixed: `castableAfterPlay` looks past a free fetch's crack (`fetchCrack`, `settledAfter`, on
  `ControllerView.viewAfter`, a new whole view of the throwaway copy): the activation, every player
  passing so it resolves, and its search answered through `answerAwaited`, the bot's own answer.
  The scenario gates, beside "plays a Forest for Birds of Paradise, not Evolving Wilds" (a fetch
  whose land enters tapped still counts as nothing)). Settling the stack fixed an older miscount on the way: a land with
  an enters trigger (a scry land, a gain land, Bojuka Bog) read as casting nothing while the trigger
  waited, so an untapped basic always beat it; now a tie plays the tapped land, as `bestLand` intends
  (bot:diff: 16 of 14,295 v2 decisions and 61 of 82,489 v1, all land drops of that kind).

## 2026-10-07 — a second destroy trigger aimed at what the first was already destroying

- **Seen:** with two Summon: Bahamuts, one's "destroy up to one target nonland permanent" chapter
  trigger was on the stack, and the other's was aimed at the same permanent.
- **Right:** the permanent the first trigger destroys is gone either way; the second goes at the
  next-best target.
- **Scenario:** "aims a second Summon: Bahamut trigger away from the first one's target"
  (training) — two Bahamuts enter, Serra Angel and Grizzly Bears across: both triggers take the
  Angel. The bot there gets one simulation, standing in for the live clock.
- **Why:** both bots aim a trigger with v1's `chooseTargets` (`controller.ts`: `aimedTargets`,
  `rankTargets`), which ranks the legal targets by value and never reads the stack, so the Angel
  is still the best target. v2 searches the choice with v1's pick scored first, and with its
  full budget it finds the Bears on this small board. Live, rooms give the bot a clock
  (`timeBudgetMs`, `Room.addBot`), and on a big board it runs out early, so v1's pick stands.
- **Fix (outline):** in `chooseTargets` (and the cast path through `aimedTargets`), drop from a
  harmful slot any permanent already doomed by our own destroy/exile effect on the stack (a
  stack object we control whose effect is destroy or exile and whose target is that permanent),
  unless no other worthwhile target is left. Might break: a permanent with indestructible or a
  regeneration shield, where a second destroy doesn't help either, and a target the first
  effect might lose (a hexproof grant in response) — rare, and still better aimed elsewhere.
- **Status:** fixed: v1's `aimedTargets` (which v2 scores first, and falls back on when its clock
  runs out) passes over, in a harmful slot, a permanent our own destroy or exile on the stack is
  already taking (`doomedByOurStack`: the stack object's card effect, a `destroy`/`exile` of a slot
  at its top level or in a `sequence`) while something else on the opponents' side is left. The
  scenario gates, still at one simulation.

## 2026-10-07 — Miirym cast instead of Urza's Incubator, which would have paid for both

- **Seen:** the bot cast Miirym, Sentinel Wyrm with Urza's Incubator also in hand. Incubator
  first, naming Dragon, would have made Miirym cost {2} less, and both fit in the turn's mana.
- **Right:** Incubator (3) naming Dragon, then Miirym for {1}{G}{U}{R} (4): two spells for
  seven mana instead of one.
- **Scenario:** "casts Urza's Incubator first so Miirym fits in the same turn" (training) — seven
  lands, both in hand: casts Miirym.
- **Why:** no bot knows a cost reducer makes the next spell cheaper. v1 casts the castable spell
  with the highest mana value (`controller.ts`'s `act`, the `spells.reduce` on `manaValueOf`), so
  Miirym (6) beats Incubator (3); v1 gets this scenario wrong too. v2's search scores each cast
  with rollouts that pass our own seat (the `"acting"` rollout is only for cast payoffs,
  `castPayoff`), so Incubator first reads as a three-mana artifact that does nothing this turn,
  and Miirym's later cast is never seen.
- **Fix (outline):** a sequencing rule beside "payoff first" (`payoffFirst`, `eval-bot.ts`): when
  a castable cost reducer (`costModification.reduceGeneric`, Incubator's chosen type included)
  lets the mana left after it still cast a spell in hand it reduces — one that the mana couldn't
  cast with the reducer's cost spent unreduced — cast the reducer first. Then the "choose a creature
  type" answer must name the type that spell has (check `answerAwaited`'s `choose-creature-type`
  picks Dragon here). Might break: a reducer cast first when the bigger spell alone was the
  better play (a wipe, a must-answer threat); keep it to turns where both fit.
- **Status:** fixed, in two parts. `reducerFirst` (`controller.ts`, both bots, beside
  `payoffFirst`): a castable reducer goes first when, resolved with its creature type named as the
  bot would (`chooseCreatureType`: Dragon), a spell castable now still is and that spell first
  would leave the reducer uncastable. And the auto-payer had paid Incubator's {3} with all three
  Forests, so even then Miirym had no green: generic mana now weighs each colour against the
  sources the payment leaves, and a reducer being paid for counts the cards it reduces at their
  reduced cost (`mana-keep-colors.test.ts`). The scenario gates; played out, the bot casts
  Incubator, names Dragon and casts Miirym.

## 2026-10-07 — fetch lands cracked before a landfall payoff was cast

- **Seen:** Kresh cracked five fetch lands (Rocky Tar Pit, Terramorphic Expanse, Escape Tunnel,
  Evolving Wilds, Fabled Passage), then cast Omnath, Locus of Rage and played Cinder Glade — one
  landfall trigger where Omnath first would have made six.
- **Right:** cast the landfall payoff first, then crack the fetches: every land that enters after
  it is another trigger.
- **Scenario:** "casts Omnath, Locus of Rage before cracking its fetch lands" (training) — six
  basics, Evolving Wilds, Fabled Passage and Terramorphic Expanse out, Omnath in hand: cracks a
  fetch.
- **Why:** not the search — a fixed rule ahead of it. Both bots crack a free fetch
  (`isFreeFetch`: a land that sacrifices itself for a land and costs no mana) the moment they
  can, before any spell: v2 in `eval-bot.ts`'s priority choice ("fetch"), v1 in `controller.ts`'s
  `act`. The rule that puts a landfall permanent first ("landfall first", `isLandfallPermanent`)
  only runs when a land drop is available, so it never weighs a fetch.
- **Fix (outline):** in both places, let a castable landfall permanent go before a free fetch, as
  it already goes before a land drop. Care where the fetch's land pays for the payoff (Fabled
  Passage's land enters untapped at four lands): crack only what the cast needs, or compare
  `castableAfter` with and without the fetch. Might break: the gate's fetch scenarios and a turn
  where the payoff costs more than the mana on hand.
- **Status:** fixed as outlined, both bots: a castable landfall permanent goes before a free fetch
  as it did before a land drop. The scenario's board was given a seventh basic: Omnath costs seven,
  so with six it wasn't castable before a fetch at all, and the right line there — crack only
  Fabled Passage, whose land enters untapped, cast Omnath, then the rest — is still not one either
  bot plays. The scenario gates.

## 2026-10-07 — Dragon Tempest cast after a Dragon instead of before it

- **Seen:** with Dragon Tempest and a Dragon in hand and mana for both, the bot cast the Dragon
  first and Tempest after, so neither of Tempest's triggers saw the Dragon enter.
- **Right:** Tempest first, then the Dragon: it enters with haste and deals X damage (X = Dragons
  you control) to any target.
- **Scenario:** "casts Dragon Tempest before the Dragon it pays off" (training) — eight Mountains,
  Furnace Whelp out, Tempest and Shivan Dragon in hand, Grizzly Bears across: casts Shivan Dragon.
- **Why:** the priority search (`bot/eval-bot.ts`) scores each cast with rollouts that pass our
  own seat for the rest of the turn, so Tempest first reads as an inert two-mana enchantment and
  the Dragon first as a 5/5 flier. The `"acting"` rollout, which plays out the rest of our turn,
  is switched on by `castPayoff` only for "whenever you cast" payoffs (Shiko and Narset, prowess),
  not for "whenever a creature you control enters" ones.
- **Fix (outline):** widen `castPayoff` to an enters payoff (an `enters-battlefield` trigger with
  `who: "you-control"`) on the battlefield or in hand while a creature it would see is also in
  hand, so the search scores Tempest with the Dragon cast after it. Then check v1's own cast order
  (`controller.ts`) under that rollout puts the payoff first — if v1 casts the Dragon first in
  the rollout, the line still isn't seen — and it does: v1 casts the highest mana value first
  and gets this scenario wrong too (checked 2026-10-07), so it needs a "payoff first" rule for
  enters payoffs as well. Might break: turns where the wider `"acting"` rollout
  costs time (Soul Warden-style lifegain triggers are common enters payoffs); check with the gate
  and `bot:diff`.
- **Status:** fixed through `payoffFirst` rather than the `"acting"` rollout: an enters payoff
  (`entersPayoffFilters`) goes first when a creature it would see enter is castable now and still
  castable once the payoff has resolved (every player passing once, asked of `legalActionsAfter`),
  both bots. The scenario gates.

## 2026-10-07 — a Spacecraft stationed past its last threshold

- **Seen:** bots station Spacecraft that already have every station band lit, tapping a creature
  for charge counters that do nothing.
- **Right:** past a Spacecraft's highest station threshold (rule 721.2; Hearthhull's 8+), more
  charge counters add nothing, so stationing only costs the tapped creature — a blocker or an
  attacker lost. Almost never worth it.
- **Scenario:** "does not station a Spacecraft past its last threshold" (training) — Hearthhull,
  the Worldseed at 10 charge counters, Craw Wurm untapped, a Centaur Courser across the table,
  postcombat main: the bot stations with the Wurm.
- **Why:** nothing in the bots knows about station. The evaluation's `counters` term
  (`bot/features.ts`) counts every counter not in `UNSCORED_COUNTERS` — charge counters included,
  uncapped — at weight 0.5 each (`bot/evaluate.ts`), so tapping a 6-power Wurm reads as +3.0
  against about 0.5 for keeping it untapped (`untappedCreatures`).
- **Fix (outline):** in `features.ts`, cap a station card's charge counters at its highest
  `stationBand` threshold (the largest `gte n` among its statics' charge-counter conditions), so
  counters past it score nothing and stationing reads as just the tapped creature. Might break: a
  Spacecraft whose own ability spends or counts charge counters (check the pool's Spacecraft for
  one before capping), and the gate's station scenarios.
- **Status:** fixed as outlined (`chargeCap`; no Spacecraft in the pool spends charge counters, and
  The Eternity Elevator, which counts them for mana, stays uncapped). A partner gate scenario
  checks the bot still stations Hearthhull from 4 counters to 10. This was most of World Shaper's
  trouble (the user: Hearthhull stationed with practically every creature); the wider point — any
  tapped creature is a blocker gone — landed the same day: a cast or activation that leaves the
  crackback lethal ranks below every safe move (`tapsIntoCrackback`; gate: "does not station its
  only blocker into a lethal crackback").

## 2026-10-07 — a Mountain played over Stomping Ground with Birds of Paradise in hand

- **Seen:** on turn one, alice played a Mountain with Stomping Ground and Birds of Paradise in
  hand (and no Forest), so nothing was cast.
- **Right:** Stomping Ground, paying 2 life so it enters untapped, then Birds of Paradise: three
  mana on turn two.
- **Scenario:** "plays Stomping Ground over a Mountain to cast Birds of Paradise" (training) —
  plays the Mountain.
- **Why:** two halves. v1's `bestLand` ranks lands by `castableAfter`, the spells it could cast
  after playing each; for Stomping Ground the engine's next question is "pay 2 life?"
  (`pay-life-for-untapped`), so the look-ahead stops there and counts 0, a tie with the Mountain
  (Valgavoth's Lair's colour choice is answered and looked past; this isn't). And v2's land search
  (`eval-bot.ts`, `lands.length > 1`) scores each land with rollouts that pass our own seat for the
  rest of the turn, so Birds is never cast in them: the shock reads as 2 life for nothing and the
  Mountain wins outright, not just on a tie.
- **Fix (outline):** in `castableAfter`, answer a shock land's pay-or-not as we would (pay when it
  casts something) and look past it, as for the Lair, so v1 counts Birds. Then in v2's land
  search, don't let a land that casts fewer spells this turn (`castableAfter`) beat one that casts
  more, since its rollouts can't see the cast — or score each land together with v1's first cast
  after it. Might break: the land search's other uses of its score (a fetch, a land that draws);
  check with the gate's land scenarios and `bot:diff`.
- **Status:** fixed (2026-10-07, the user asked): `castableAfter` looks past the shock as paid,
  and v2's land search keeps to the lands that cast the most this turn; the scenario gates.

## 2026-10-06 — Felothar sacrificed Seedborn Muse over Tree of Redemption

- **Seen:** a bot activated Felothar the Steadfast ("{3}, {T}, Sacrifice another creature: draw
  cards equal to its toughness, then discard cards equal to its power") sacrificing Seedborn Muse
  (draw 4, discard 2) with Tree of Redemption (draw 13, discard 0) on the board.
- **Right:** sacrifice the Tree.
- **Scenario:** "sacrifices Tree of Redemption to Felothar, not Seedborn Muse" (training) — the
  activation it chooses doesn't name the Tree (no sacrifice named, left to the engine's default).
- **Why:** an ability's sacrifice cost is never searched. v2's candidate fixes it to the last
  eligible permanent (`bot/candidates.ts`'s `abilityCandidates`, "settled deterministically"),
  and v1's activation picks the cheapest (`cheapestPermanents`); neither reads what the effect
  does with the sacrificed creature (`toughnessOf`/`powerOf: "sacrificed"`).
- **Fix (outline):** when an ability's effect reads the sacrificed creature, offer one candidate
  per sacrifice choice (capped, cheapest and highest-reading first) and let the search score
  them; the same for a spell's additional sacrifice cost (`castExtras`). Might cost a few more
  simulations on boards with many creatures.
- **Status:** fixed as outlined (the user asked, 2026-10-08): v2's `withSacrificeChoices` offers
  each candidate once per sacrifice (up to five, identical tokens as one, largest power plus
  toughness first) when the offer's effect reads `"sacrificed"` — 44 pool cards' effects do — for
  spells as for abilities. The scenario moved to the end of the turn before alice's, where the
  ability belongs: in her precombat main the search rightly passes (tapping Felothar costs his
  attack, and her cleanup discards thirteen to seven). It gates, and reads wrong with the
  expansion switched off.

## 2026-10-06 — Abrade cast over its own Archmage Emeritus

- **Seen:** Narset cast Archmage Emeritus, then Abrade at Weathered Sentinels with the Archmage
  still on the stack; Abrade resolved first, and magecraft's draw was missed.
- **Right:** let the Archmage resolve, then cast Abrade, drawing a card off it.
- **Scenario:** "lets Archmage Emeritus resolve before casting Abrade" (training) — casts Abrade in
  response.
- **Why:** v2 casts a cast payoff first (`payoffFirst`), but that early return doesn't record
  `actedOn`, which is what makes the next window a held pass while our own spell resolves
  (`holdPass`). So the window with the Archmage on the stack is searched afresh, and Abrade now
  scores as well as Abrade later — under the "acting" rollout a payoff turns on, the tie goes to
  acting.
- **Fix:** record `actedOn` on the payoff-first return (and the other early returns that cast our
  own spell — the landfall-first one), so the next window passes while it resolves. Might break:
  nothing that was deliberate — a response to our own spell was never a searched choice; an
  opponent's response still gets searched.
- **Status:** fixed with the Guttersnipe entry (2026-10-08): the shortcuts record `actedOn`. The
  scenario gates.

## 2026-10-05 — an untapped land over Glacial Fortress on turn one

- **Seen:** on turn one a bot played its untapped land over a Glacial Fortress (tapped, with no
  Plains or Island out). The untapped land made Sticky Fingers castable, but it had nothing of
  its own to enchant.
- **Right:** the Fortress, tapped, now. The user: "A land letting you cast a spell is of no value
  if you wouldn't cast the spell if you had the mana."
- **Scenario:** "plays Glacial Fortress tapped on turn one over a Mountain for nothing it would
  cast" (gate).
- **Why:** `bestLand`'s `castableAfter` counted every spell the engine called castable, Sticky
  Fingers at an opponent's creature included; and its tapped-land tie-break skipped check lands,
  whose tapped-ness is a condition.
- **Fix:** `castableAfter` (and the shock land's `payLifeForUntapped`) count only what v1 would
  cast (`wouldCast`, the filter `act` casts from), and `entersTapped` reads a check land's
  condition on the board as it is (`staticConditionMet`).
- **Status:** fixed.

## 2026-10-05 — a land sacrificed untapped (the user's rule)

- **Rule:** "spells that sacrifice lands should always prioritize tapped lands."
- **Scenario:** "sacrifices a tapped land to Harrow" (gate).
- **Why:** `cheapestPermanents` ranked by value alone, so a tapped and an untapped Forest tied
  to the first listed. And the engine paid a cast's mana before its sacrifice (rule 601.2g–h)
  without knowing which land was going, so it could tap the others and sacrifice one untapped.
- **Fix:** among the lands it may give up, a tapped one goes first (the lands keep the places
  the value ranking gave them, so a mixed choice still gives up the cheapest); and a single
  sacrificed permanent pays the spell's mana first where it can (`ManaSourceArrangement.first`,
  `additional-costs.test.ts`).
- **Status:** fixed.

## 2026-10-05 — Explore held on turn two

- **Seen:** on its second turn, with a Forest and a Mountain out and two Swamps in hand, a bot
  passed with Explore in hand — nothing else in hand cost two.
- **Right:** cast Explore, play the second Swamp: three lands on turn two and a card back.
- **Scenario:** "casts Explore on turn two with a land to play off it" (gate since the fix).
- **Why:** Explore isn't a cantrip to `controller.ts`'s `isCardFlow` (an `additional-land-drop`
  is neither a draw nor a filter), so `isCantripDue` never plays it and v2's search decides. Its
  rollouts pass our seat for the rest of the turn, so the extra land is never played: two mana
  for a card back scores no better than passing, and passing is scored first.
- **Fix:** an extra land drop with a land in hand to use it is due like a cantrip — in
  `isCantripDue` (or beside it), count `additional-land-drop` as worth a card when the hand
  holds a land and this turn's drop is used or about to be, so the search's pass turns into the
  cast. Explore, Growth Spiral, Urban Evolution and the like. Might break: casting one with no
  land to follow (the hand check guards it), or ahead of a better two-drop the search did want
  (it only applies when the search would pass).
- **Status:** fixed, more simply: `isCardFlow` reads an `additional-land-drop` as neutral, so
  Explore and Urban Evolution are cantrips (`isCantripDue`), cast in our main phase when the
  search would pass, and the land drop that follows is the bot's usual land-first play.

## 2026-10-05 — thirteen tokens at a five-loyalty planeswalker

- **Seen:** a bot attacked a planeswalker with 5 loyalty with all thirteen of its creature
  tokens.
- **Right:** five kill it; the other eight stay home as blockers.
- **Scenario:** "sends only enough of a token stack to kill a planeswalker" (training) — sends
  all 13 at Garruk, keeps none home.
- **Why:** neither bot can send part of a token stack. v2's attack climb (`bot/eval-bot.ts`,
  `declareAttackers`) adds one `{ attacker, defender }` at a time with no `count`, so a stack
  goes whole or not at all; v1's swing (`controller.ts`) declares whole stacks too. Only the
  kill planner (`alphaStrike`) splits stacks, and it plans kills on players, not planeswalkers.
  So the choice was 13 or 0, and 13 scored better.
- **Fix:** give the climb a move that sends `count` tokens of a stack — the fewest that kill a
  planeswalker or player through its blockers, and one more token at a time after that — as the
  blockers' climb already moves one token of a stack per step. Might break: more simulations per
  attack on wide token boards (the climb's budget is per simulation), and the crackback check
  then decides how many stay home, so it inherits that check's gaps (BACKLOG).
- **Status:** fixed. v2's attack climb sends a stack in parts — one token more, the fewest that
  finish a planeswalker, or all it has left, smallest first so a tie keeps the leaner attack.
  That alone sent the other eight at the walker's controller, since `untappedCreatures` counted
  only blockers that hold an attacker off alone. The user: "in most cases you want to keep at
  least a few blockers back if there are creatures on opponents' boards". `deterringBlockers`
  now counts small blockers in gangs that kill an attacker together, as many as the opponent
  with the most attackers would take; the scenario (gate) sends 5 at Garruk, 2 at bob and keeps
  6 home against two opponents' three 2/2s each.

## 2026-10-05 — Valgavoth's Lair named white in a Temur deck

- **Seen:** a Temur bot played Valgavoth's Lair and chose white.
- **Right:** a colour of its own deck — red here, for the dragons' {R}{R}{R}.
- **Scenario:** "names a colour its deck plays for Valgavoth's Lair" (training) — chooses W.
- **Why:** an "as this enters, choose a colour" (`chooseOnEnter`) is asked as a
  `choose-creature-type` over the five colours. Its `suggested` list is only computed for the
  creature-type catalog (`decisions/choose-creature-type.ts`), so it's empty, and every
  controller answers `suggested[0] ?? options[0]` — white, every time. Neither bot overrides
  it. The Thriving lands (`helpers.ts`, `chooseOnEnter: others`) take the first option too.
- **Fix:** when every option is a colour, v1's `chooseCreatureType` names the colour the hand's
  pips want most that the lands on the battlefield don't already make (`bestLand`'s tallies),
  within the commander's colour identity, falling back to the identity's first colour. v2
  inherits it. Low risk: today's answer is never deliberate.
- **Status:** fixed (`colorToName` in `land-colors.ts`, v1's `chooseCreatureType` override);
  the scenario gates.

## 2026-10-05 — untapped Forest played over a tapped Valgavoth's Lair

- **Seen:** a Temur dragons bot on four lands played a Forest while holding Valgavoth's Lair,
  with nothing in hand a fifth untapped mana could cast.
- **Right:** play the Lair now, while entering tapped costs nothing; the Forest comes down untapped
  on a turn it's needed (and Rorix Bladewing's {R}{R}{R} isn't a turn later).
- **Scenario:** "plays its tapped land when the untapped one casts nothing more" (training) —
  chooses the Forest.
- **Why:** v1's `bestLand` ranks by `castableAfter` (equal: Heroic Intervention either way),
  then by pips no land on board pays — the Lair's `"chosen"` mana counts for no colour in
  `colorsProducedBy`, so the Forest's green wins. Nothing weighs "enters tapped". v2's land search
  tries v1's pick first, and its rollouts pass our seat, so every land ties and v1's stands.
- **Fix:** in `bestLand`, among lands with the same `castableAfter`, prefer one that enters
  tapped (ahead of the pip score), and count a chosen-colour land as making any colour the
  identity allows. Might break: a tapped land played when the untapped one would have held up
  an instant — `castableAfter` already counts instants castable now, so that tie shouldn't
  arise; worth a `bot:diff`.
- **Found on the way:** `castableAfter` stopped at the Lair's colour choice and saw nothing
  castable behind it, so the Lair lost even to a land that cast no more. It now answers the
  choice (`legalActionsAfter` takes a sequence) and looks past it.
- **Status:** fixed (`bestLand`'s `entersTapped` tie-break); the scenario gates.

## 2026-10-04 — Jaddi Offshoot after the land drop

- **Seen:** on turn 2 a bot played a Swamp, then cast Jaddi Offshoot.
- **Right:** cast the Offshoot off its Forest first; the Swamp's landfall then gains a life.
- **Scenario:** "casts Jaddi Offshoot before its land drop" (gate since the fix).
- **Why:** both bots play a land before anything else whenever one can be played. v2 returns
  the only land outright (`bot/eval-bot.ts`, `lands.length === 1`) and scores several only
  against each other; v1's `act` plays `bestLand` first. Nothing ever weighs "a spell, then the
  land".
- **Fix:** a permanent with its own landfall trigger that's castable now goes before the land
  drop, in both bots (`controller.ts`'s `isLandfallPermanent`; v2 only from its own candidates,
  so its holds still apply). Mana is the same in either order, so it costs nothing.
- **Status:** fixed (`bot:diff` over 12 four-player games: 4 of 28,314 decisions, each a landfall
  permanent before the land — Avenger of Zendikar, Floral Evoker, Jaddi Offshoot).

## 2026-10-04 — Stomping Ground played tapped over a Forest for Birds of Paradise

- **Seen:** with Forest, Mountain, Stomping Ground and Birds of Paradise in hand, a bot played
  Stomping Ground, let it enter tapped, and couldn't cast the Birds.
- **Right:** play the Forest and cast the Birds (no life spent).
- **Scenario:** "plays a Forest for Birds of Paradise, not a tapped Stomping Ground" — **passes on
  the current build**, so it went straight to the gate. The land ranking learned "the land that
  lets you cast a spell this turn" on 2026-10-01 (95fe54c5); the site was most likely running an
  older build.
- **Found on the way:** neither bot paid a shock land's 2 life
  (`AutomaticController.payLifeForUntapped` returns false and nothing overrides it), and v1's
  `castableAfter` can't see a spell behind a shock land, since playing one stops at the pay
  decision. Scenario "pays 2 life for an untapped Stomping Ground to cast Birds of Paradise".
  **Fixed:** v1's `payLifeForUntapped` pays when the untapped land casts more spells this turn
  than the tapped one (`legalActionsAfter` both ways) and life stays above 15 after paying; v2
  takes v1's answer, since its rollouts pass our seat for the rest of the turn and never see the
  spell. "Lets Stomping Ground enter tapped with nothing to cast" holds the other side.
- **Status:** the report: not reproduced (fixed before it was seen). The shock-land payment: fixed.
