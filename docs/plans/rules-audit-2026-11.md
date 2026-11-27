# Rules audit, November 2026

Status: **eight slices done** (2026-11-17, 2026-11-26). The first (players who leave the game,
combat, the turn's skip rules) found three violations, fixed, and a fourth recorded for a design
call. The second (casting, resolving, how a multiplayer game goes on) found none in the engine and
one in the client's log wording. The third (keywords two at a time), the fourth (blink, tokens
and cards leaving the battlefield) and the fifth (two replacement effects on one event) found
none. The sixth (merged and melded commanders) found three, fixed. The seventh replayed every kept
game and checked it at every decision (`scripts/game-rules-scan.mjs`), and the eighth probed copies,
keyword actions and a merged permanent leaving: none. A hundred and thirty-five probes stay as tests. The
slices to take next are at the end.

## Why

On 2026-11-17 the user read a live four-player game's log and found three double-striking
attackers dealing their second strike to a player their first strike had already killed. Rule
800.4e forbids it, and the engine had never implemented it. The user asked whether it is worth
reading through the rules for more like it. It is, but not cover to cover: the engine is 70,000
lines against a 9,000-line rulebook, and most of it is tested rule by rule. The places worth
looking are the ones the tests don't reach by themselves: what happens once a player is gone
(nearly every test is two-player), and turn structure nobody writes a test for because nothing
seems to happen in it.

## Method

1. **Uncited rules are the leads.** `npm run rules:uncited -w engine -- 506 508 800` lists the
   rules of those sections whose number appears nowhere in `engine/src` outside the card pool
   and the tests; `-- --all` gives cited over total for every section. Uncited is a lead, not a
   verdict: 508.8 was uncited and missing, 506.4b was uncited and right.
2. **Triage** each lead: a variant the engine doesn't play, implemented without the citation,
   or a suspected gap.
3. **Probe** a suspected gap with a small test on `engine/src/test/harness.ts` before reading
   much code. A probe that passes stays as a test; one that fails is the bug's test.
4. **Read the user's logs.** 508.8 was in the same exported log, on a turn with no attack: the
   log is every event, so a step that shouldn't exist is a line in it.

## What was found

| Rule | What was wrong | Fix |
| --- | --- | --- |
| 800.4e | Combat damage was assigned to a player who had left the game: a double striker's second strike, a creature without first strike beside it, trample over a blocker. Lifelink and damage triggers fired a second time. | `Game.combatDamageAssignments` drops it. `combat-damage-player-left.test.ts`. |
| 508.8 | A combat with no attacker still played its declare blockers and combat damage steps, a round of priority each. | The step after declare attackers is end of combat when nothing attacked (`nothingAttackedThisCombat`: none declared this combat phase, by the journal, and none attacking now). `combat-no-attackers.test.ts`. |
| 506.8f | Follows from 508.8: "cast only during combat after blockers are declared" is authored as the declare blockers step and the two after it, so it would have been castable in the end of combat step of a combat with no blockers declared. | The `turn-structure` condition refuses it there. Same test file (Chaotic Strike). |

Three older tests encoded the old step flow and were brought to the rule (`game.test.ts`,
`cmdr-ruric-thar.test.ts`, `additional-upkeep-steps.test.ts`).

**Found and recorded, built 2026-11-24: 603.6c.** Leaves-the-battlefield abilities trigger "when a
phased-in permanent leaves the game because its owner leaves the game", and another player's
"whenever another creature leaves the battlefield" (Extractor Demon) doesn't trigger for what a
departing player owned. `Game.leaveGame` leaves those permanents on the board, inert, and
announces nothing. Built as the outline had it: an internal `permanent-left-game` event for each, heard only by
another player's `leaves-battlefield` trigger with no destination, reading the permanent as it last
existed (`Game.leftGameMatches`), and "it" gone for whatever the trigger does next.

## What was probed and is sound

Kept as tests in `player-left-audit.test.ts` and `combat-rules-audit.test.ts`.

A player who has left the game (104.5, 800.4): is no opponent for "each opponent" damage or
life loss; draws nothing when each player draws; can't be targeted or attacked; a spell aimed at
them before they left does nothing; an attack already declared at them deals nothing; an attack
trigger aimed at the player attacked (Hellrider) does nothing; a trampler blocked by their
creature deals them nothing; their Aura leaves another player's creature and a creature they
had taken with Control Magic goes home; another player's Aura on their creature goes to its
owner's graveyard; "until this leaves the battlefield" ends and the exiled card returns;
"whenever a player loses the game" triggers for a concession and for life running out (603.9).

Combat: a blocker tapped after it blocks still deals and takes damage, and an attacker untapped
after it attacks is still attacking (506.4b); a blocked attacker whose blocker is gone deals
nothing to the player (509.1h, 510.1c); an attacker that changes controller leaves combat (506.4); a
creature put onto the battlefield attacking doesn't trigger "whenever a creature attacks"
(508.2a, Hero of Bladehold beside Hellrider); one put there "attacking that opponent" after
that opponent has left enters and attacks nobody (506.3c, Kaalia of the Vast), while one with no
player named goes at an opponent still in the game (508.4, Hero of Bladehold's Soldiers).

Settled by reading: a band can't be declared at different defenders (802.3b,
`combat/banding.ts`); a battle whose protector has left the game is covered by
`battles.test.ts` (704.5x-y).

Already cited and implemented, read but not probed again: 800.4a-d, 800.4i-m, 725.4, 726.4,
103.5c and 103.8 (the multiplayer mulligan and first draw, which 800.6 and 800.7 restate).

## Second slice: casting, resolving, and how a game goes on (same day)

No new violation. The uncited rules of 601, 602, 605, 608 and 614-616 are nearly all definitions
or restate a sibling the source does cite (602.5a is 302.6; 903.5d is implemented through 305.6
in `identity.ts`; 119.8 and 614.7a are cited or written out). So the slice probed behaviour
instead, where a two-player test suite looks least. All of it holds, and the probes stay:

- `multiplayer-flow-audit.test.ts`: a player lost during their own turn (the turn finishes
  without them, the next player gets theirs: 800.4j); the attacking player lost in their own
  combat; two players lost together leaving a winner; every player lost at once, a draw (104.4a).
- `combat-rules-audit.test.ts`, three more: a double-striking trampler whose blocker died to its
  first strike sends the second strike all at the player (702.19e); a blocked double striker
  without trample deals nothing more (510.1c); a creature given first strike after the first
  damage step still deals its damage in the second (510.4).
- `stack-and-sba-audit.test.ts`: a spell whose only target is gone does nothing, its card draw
  included (608.2b); a creature taken this turn can't attack (302.6); an empty library loses
  nothing until a draw from it (104.3c, 704.5b); the legend rule's choice (704.5j); +1/+1 and
  -1/-1 counters going together (704.5q); triggers of two players stacked active player first
  (603.3b).

**The exported log, read by script.** Life totals follow from one line to the next throughout;
nothing happens to a player after they lose but the second strikes 800.4e fixed; no player is
given priority in an untap or cleanup step; every turn's steps are in order, with the two extra
combat steps on each of the eighteen turns nobody attacked (508.8). What the scan did find is the
client's: 27 of the engine's 207 event types had no sentence and printed as their JSON, fixed in
`client/src/format.ts` with a switch the build now checks is exhaustive.

## Known and not modeled

- **800.4f-h**: a player who has left being asked to pay or choose. `Game.whyCannotConcede`
  refuses a concession from a player who owes a decision, and the server answers it for them
  first, so the case doesn't arise by conceding. A player *losing* while they owe a decision
  (state-based, with a choice of theirs still open) is the path left; `BACKLOG.md`, "Engine
  rules gaps".
- **Variants the engine doesn't play**: limited range of influence (801), attack left and right
  (803), deploy creatures (804), shared team turns (805), Two-Headed Giant (810), Emperor (809),
  Grand Melee (807), Planechase (901), Archenemy (904), ante (407, 800.4n), Brawl and Commander
  Draft (903.12-13). Their rules are uncited by design.

## Leads followed after the slices (2026-11-24)

The four uncited leads left at the end of the second slice, each probed against the engine:

- **506.3d** holds: every creature put onto the battlefield attacking goes through one path
  (`Game.putIntoAttack`), which has it enter unblocked once blockers are declared; ninjutsu's and
  sneak's tests exercise it. Now cited there.
- **104.3f** can't arise: a win is an effect's instruction carried out at once (`winGame`) or the
  last player left (104.2a), and neither can meet a loss in the same event.
- **704.5t** was built as rule 309.6 (`completeFinishedDungeons`), now cited. **704.5r**'s one
  card, Rasputin Dreamweaver, waits on its own need key (`static:counter-cap`, B132).
- **603.2g** holds by construction: a replaced event never happens (614.6), so nothing emits it,
  and a prevented one emits only its prevention.

## Third slice: keywords two at a time (2026-11-26)

No violation. Rule 702's uncited subrules are nearly all "is a static ability", "multiple instances
are redundant" or "each triggers separately" (the triggered keywords are authored as one ability
per instance, so a granted second instance triggers on its own: exalted, prowess, annihilator), and
every keyword has its own test file. So the slice probed where two meet, or where one meets
prevention, regeneration or a counter — `keyword-interactions-audit.test.ts`, fourteen tests, two of
them controls showing the setup bites:

- Protection's prevented damage gains no lifelink life and destroys nothing by deathtouch
  (702.15b, 702.2b); a trampler still assigns a protected blocker lethal and tramples only the rest
  (702.19c); deathtouch's destruction can be regenerated (701.19a) and doesn't touch an
  indestructible creature (702.12b); a 0-power deathtouch source destroys nothing (702.2b).
- A first-striking deathtouch blocker kills a double-striking trampler in the first step, so
  there's no second (702.7b, 702.4b); double strike with lifelink gains in both steps.
- A persist creature killed by wither damage keeps its -1/-1 counters and stays dead (702.80a,
  702.79a); without wither it persists (the control).
- An overloaded spell targets nothing, so ward doesn't trigger (702.96b, 702.21a); cast at a
  warded creature unoverloaded, it does (the control).
- Four players: myriad's copies enter attacking, not declared, so the one declared attacker still
  gets exalted (702.83b), and the copies are exiled at end of combat (702.116a); annihilator makes
  only the defending player sacrifice (702.86a); two creatures attacking two different players
  aren't attacking alone.

## Fourth slice: blink, tokens, and cards leaving the battlefield (2026-11-26)

The user's ask: blink, tokens and particular cards leaving, and the abilities that follow them
(rules 400.7, 111.7-8, 603.6-603.10, 607, 610.3). No violation. `blink-and-leave-audit.test.ts`,
twenty-nine tests, five of them controls:

- **"Until ~ leaves" and its timing**: Banisher Priest gone before its enters trigger resolves
  exiles nothing (610.3c); two-trigger Oblivion Ring gone the same way exiles for good; a blinked
  Priest lets its card go and the new one exiles anew; a Priest exiled by another Priest frees its
  card, and returns, a new object, to exile again when the second leaves; a commander exiled this
  way goes to the command zone and stays there (903.9a).
- **Tokens**: one token of a stack blinked or exiled "until" is gone and the rest stay; an
  Oblivion Ring's token, Flickerwisp's and Ghostly Flicker's don't come back (111.8); a Kiki-Jiki
  copy of Banisher Priest exiles until it's sacrificed at the end step; a token with undying
  doesn't return; Blood Artist sees every token of a destroyed stack die; a phased-out token keeps
  existing and phases back in (702.26b).
- **Delayed and linked abilities aimed at one object**: a Sneak Attacked or unearthed creature
  blinked is a new object, not sacrificed or exiled later; Flickerwisp's card that left exile
  before the end step stays where it went; a stolen creature blinked returns under its owner's
  control; Skyclave Apparition blinked pays its leave trigger for the card it exiled, which stays
  exiled, while the new one exiles anew (607.2a); an enters trigger still resolves after its source
  was blinked, beside the new object's (113.7a).
- **What's attached**: Rancor on a blinked creature goes to the graveyard and back to hand; Angelic
  Destiny there stays in the graveyard, its creature having not died; Equipment stays,
  unattached; counters, damage and an until-end-of-turn pump are gone.

The situation fuzzer then ran ten blink and exile-until cards (Banisher Priest, Flickerwisp,
Oblivion Ring, Skyclave Apparition, Kiki-Jiki, Ghostly Flicker, Cloudshift, Ephemerate,
Restoration Angel, Fiend Hunter) through 600 random boards: none failed.

## Fifth slice: two replacement effects on one event (2026-11-26)

No violation. The orders of doublers, shields and "that many plus one" counters, and of draw
replacements (Notion Thief beside Laboratory Maniac, a draw that can't happen), were already tested
(`replacement-order*.test.ts`, `draw-replacement-order.test.ts`, `draw-limit.test.ts`).
`replacement-interactions-audit.test.ts` takes the pairs they don't: Gather Specimens' control
change applied first, so the new controller's Hardened Scales adds its counter (616.1b); damage
Pariah redirects meeting a shield on its creature (616.2); Rest in Peace beside madness and Notion
Thief beside dredge, the affected player taking the one that lets them play the card (616.1e, with
a control); a kicked Burst Lightning's own "instead" before Furnace of Rath (616.1a).

## Sixth slice: merged and melded commanders (2026-11-26)

Three violations, all fixed (`merged-commanders-audit.test.ts`, nine tests, five red before):

| Rule | What was wrong | Fix |
| --- | --- | --- |
| 903.3c | A commander cast for its mutate cost onto another creature (Brokkos onto Grizzly Bears) made a merged permanent that wasn't a commander. Coming apart, the commander card was a new object that wasn't one either: it went to the graveyard and stayed, the player's commander gone for good. | `MergedComponent.commander` marks the commander card; the merged permanent `isCommander` while one is a component, back to its own card's as it leaves; the scattered card is a commander again and offered the command zone (903.9a). |
| 903.9c | A melded or merged commander its owner sent to the command zone instead of a hand or library took every card with it: the other card of a melded Chittering Host went to the command zone. | Only the commander card goes there; the permanent and the rest go where it was headed (`applyCommanderChoice`, `commanderScatter`), a library's in the place that move put it. |
| 903.10a | Combat damage a merged commander dealt was counted to the merged permanent's object, which wasn't the commander card's, and what the commander had dealt before merging stayed with the card it had been. | The count moves onto the merged permanent as the commander merges, and back onto the card as it comes apart (`moveCommanderDamage`). |

## Seventh slice: every kept game, replayed and checked (2026-11-26)

The 204 kept games of 2026-11-22 to 26 (`games/`), replayed on this build (`scripts/game-rules-scan.mjs`),
about 250,000 decision points. A record plays exactly only on its own build, so most went their own way
partway; what this build then did is still this build's play, and is checked as far as it goes. At every
input, once the engine has settled and nothing is awaited, it checks what state-based actions (704) and
priority (117) promise: no creature at 0 toughness or with lethal damage, no planeswalker at 0 loyalty, no
Aura on nothing, nothing attached to something gone, no +1/+1 and -1/-1 counters together, no token off
the battlefield, no player at 0 life, 10 poison or 21 commander damage still in, no player who has left
asked anything, no priority in an untap step. In combat: no declared attacker summoning sick without haste
or a permission (302.6), no flyer blocked by a creature without flying or reach, no menace creature blocked
by one, no unblockable one blocked. In the log: each life change adds up, nothing is done to a player
after they lose, no sorcery-speed spell cast outside its controller's main phase or onto a stack, no more
land plays than allowed.

No violation. Every lead was the scan's, each followed into the game: a departed player's permanents left
on the battlefield inert (800.4a, by design); a resolution paused on a choice, where state-based actions
wait (704.3: Culling Ritual asking for its mana); the player answering an untap step's choice (Smoke-style
untap limits) shown as holding priority while they answer, with nothing else legal and no window after it;
tokens put onto the battlefield attacking, never declared; creatures with defender under Felothar the
Steadfast; a whole board cast that turn attacking under Frenzied Saddlebrute's permission; a blocker dead
in combat damage leaving a menace attacker one blocker; land plays under Oracle of Mul Daya.

## Eighth slice: copies, keyword actions, a merged permanent leaving (2026-11-26)

No violation. `copy-rules-audit.test.ts`: a Clone takes the copiable values and not counters or a pump
(707.2); of a face-down creature it's a nameless 2/2, face up; of a Kiki-Jiki token it has the token's
"except it has haste" (707.9b); of a transformed permanent, its back face (707.8); of a mutated creature,
the top card with every card's abilities, as a single card (730.2a); a Clone of Banisher Priest keeps its
own exile (707.7); a Clone of Voice of All makes its own choice (707.6). `keyword-actions-audit.test.ts`:
a fight with one creature gone deals nothing (701.14b); a fight's damage gains lifelink life; an
indestructible or regenerating creature can be sacrificed (701.21a). `merged-leaves-audit.test.ts`: a
merged creature exiled until a Priest leaves, or blinked, comes back as each of its cards (730.3c); dying
under Rest in Peace, each is exiled (730.3d); a merged commander exiled that way goes home and the other
card alone returns. `commander-damage-audit.test.ts`: a commander's damage counts whoever controls it, and a
Clone of a commander isn't one, so its damage doesn't (903.10a, 903.3). `departed-delayed-audit.test.ts`:
Flickerwisp's return at the next end step doesn't happen once its controller has left the game, and the
card stays exiled (800.4d). `split-second-audit.test.ts`: under split second the opponent may cast
nothing and activate only mana abilities, while a prowess trigger still goes on the stack and resolves
(702.61b). `trigger-timing-audit.test.ts`: Emperor Crocodile's state trigger sacrifices it though a creature
arrived before it resolved (603.8), and Blood Artist dying in a wrath sees every creature that died with it
(603.10a). `life-rules-audit.test.ts`: under Platinum Emperion the hit costs no life and the lifelinker
still gains; under Sulfuric Vortex it gains nothing (119.3, 119.7). `loyalty-audit.test.ts`: a second
loyalty ability in a turn is refused, and a blinked planeswalker, a new object, may activate one (606.3).

More of the same, later that afternoon, all holding: keeping a Clone of your commander under the legend
rule sends the commander home (704.5j, 903.9a), and a merged commander's next cast from the command zone
pays the tax (903.8) — `commander-damage-audit`, `merged-commanders-audit`; Kaya's Ghostform on a blinked
creature returns nothing more, and on a token nothing (603.6e, 111.8) — `aura-leave-trigger-audit`; Kitchen
Finks with persist and Mikaeus's undying comes back once a death, with one counter, the other trigger
finding a new object (400.7) — `persist-undying-audit`; an Aura and an Equipment phase out with their
creature and back in attached, a pump that ended while it was away is gone, and an attacker that phases out leaves combat
(702.26f-g, 506.4) —
`phasing-audit`; protection gained knocks off an Aura and unattaches an Equipment (702.16c-d) —
`protection-attach-audit`; a copied creature spell's token isn't "created", so Parallel Lives doesn't
double it (111.13, now cited) — `spell-copy-token-audit`; cascade passes over a split card whose halves
together reach its mana value (702.85a, 709.4a) — `cascade-split-audit`. The scan gained two checks that afternoon: every
Aura and Equipment still legally attached, asked of the engine's own `canEnchant` and `canEquip`, and no
player over their maximum hand size as the next turn begins (514.1).

## Next slices

By how far the citations fall short and how much play runs through them (`rules:uncited --
--all`):

1. **More games, as they come**: `node scripts/game-rules-scan.mjs games/<day>/*.json.gz` after a
   `games:pull` (the seventh slice). A check it lacks is a few lines in it. Every lead it prints is
   followed into its game before anything is called a violation: the seventh slice's were all the
   scan's own.
2. ~~**702**, keywords~~: the third slice, above. Left in it, if wanted: the keywords of a
   copied or face-down permanent, and keywords on spells (cascade into a split card).
3. ~~**903**, merged and melded commanders~~: the sixth slice, above. Left in it: a merged
   permanent with two commanders in it (partners both mutate), whose commander damage is kept as
   the merged permanent's alone.
4. ~~**614-616** by interaction~~: the fifth slice, above.
5. **601-608** has little left: its uncited rules were read in the second slice.
