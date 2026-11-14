# Attractions

Status: phase 1 done — engine and cards (2026-11-14, batch 327); phase 2 the client.

Unfinity's Attractions (rules 717, 701.51, 701.52, 702.159): a second deck of artifact cards in the
command zone, opened onto the battlefield by other cards and visited by a d6 rolled at the start of
each precombat main phase. The user approved the subsystem as a major feature of batch 327.

## The shape, and why

**The Attraction deck and the junkyard are lists beside the zones, not zones.** Rule 717.2 puts the
deck in the command zone, and 717.6a says the junkyard "is not its own zone". So the cards have
`zone: "command"` — what any rule that asks "is it in the command zone" should see — but sit in
`PlayerState.attractionDeck` (top first) and `PlayerState.junkyard` (oldest first), not in
`zones.shared.command`. A dozen readers of the command zone's list assume it holds commanders and
emblems (castable commanders, statics that work from there, the bots' "held" cards); keeping the
Attractions out of it means none of them had to learn to skip one. The dungeon object is the
precedent: a command-zone object in no zone list. `moveObject` takes a card out of either pile as it
leaves the command zone (`leaveAttractionPiles`).

**The junkyard is a replacement inside `moveObject`, decided by the card's back.** Rule 717.6 is
about "a card with an Astrotorium card back", a physical fact: `isAttractionCard` asks for a card
(not a token, not a copy of a spell) whose own definition — `cardName`, not what it's a copy of —
has `attractionLights`. A Clone copying an Attraction goes to the graveyard (Draconian Gate-Bot's
ruling); an Attraction that became a copy of something else would still go to the junkyard. A
graveyard, hand or library destination becomes the command zone, and the arrival joins the
junkyard. It is applied first, ahead of the other redirects (Rest in Peace, Whip of Erebos), the
way the engine already orders a card's own replacement (Blightsteel Colossus) — its owner's pick
under 616.1; once headed for the command zone no other replacement applies, which is all "may apply
more than once" asks here. "From anywhere" includes a hand or library from outside the battlefield:
an Attraction a test puts into a hand lands in the junkyard, as it should.

**Lit numbers belong to the card object** (`GameObject.lights`). Two printings of one name light
different numbers (717.1), so the number isn't a property of the definition. The definition lists
its printings (`attractionLights`, by collector number, from Scryfall's `attraction_lights`); a
deck's entry picks one (`DeckList.attractions`: a name, or `{ name, collector }`), the first by
default, and every card object made of an Attraction definition starts with the first's lights
(so a spawned test card has some). A copy of an Attraction has none: the lit numbers aren't among
the characteristics rule 707.2 copies (109.3's list), so a copy is never visited. That is a
judgment call — no rule or ruling says either way — and the place to change it is the
`lights?.includes(result)` read in `Game.rollToVisit`.

**A roll to visit is an ordinary die roll.** `Game.rollToVisit` calls `rollDice` (one d6), so the
`would-roll-dice` replacements and every "whenever you roll" trigger see it (Complaints Clerk's "a
1"), then announces `rolled-to-visit` with the result, then, for each Attraction the roller
controls with that number lit, journals a `visited` entry and announces `attraction-visited`. The
turn-based action (505.5, 703.4g, 717.4) is `attractionVisitStep`, right after the Saga lore step;
the effect is `roll-to-visit` (Line Cutter). The roll for the turn-based action has no source;
`rollDice` is passed a placeholder id (`"roll-to-visit"`), which it only uses to name a source in
its event when the object exists.

**Visit is a trigger event, not a new trigger kind.** 702.159a reads "whenever you roll to visit
your Attractions, if the result is lit up on this Attraction"; the engine announces the visit per
Attraction (701.52a: "each of those Attractions has been visited and its visit ability triggers"),
so a visit ability is `{ on: "event", event: "visited", who: "self" }` — `cards/helpers.ts`'s
`visit()` — and Myra's "whenever you visit it" would be the same row. "Claim the prize" is an effect
(`claim-the-prize { prize }`) that performs the prize, then announces `prize-claimed`.

**History is the journal's.** "Attractions you've visited this turn" is the `visited` view: each
Attraction once a stint however often it was visited, and ones gone since still count (Black Hole's
ruling). Opening is `attraction-opened`, announced only when the card reached the battlefield
(701.51c), so a replaced entry triggers nothing.

**No new decision.** Opening, visiting and claiming ask nothing of their own, so the bots needed
nothing: they never get an Attraction deck, but one may control an Attraction (a control change)
and its visit abilities ask the usual target and mode questions.

**Deck rules** are `deck-validation.ts`'s `attractionDeckProblems` (717.2a: ten or more, each a
different name, only Attractions; 717.2b's limited rules behind `limited`). An Attraction listed in
the deck or as a commander is a violation (`notACardReason`): it belongs in the Attraction deck.

## Cards

Authored (34): every Attraction the engine runs exactly — Balloon Stand, Bounce Chamber, Bumper
Cars, Clown Extruder, Concession Stand, Foam Weapons Kiosk, Fortune Teller, Hall of Mirrors,
Haunted House, Information Booth, Kiddie Coaster, Merry-Go-Round, Pick-a-Beeble, Roller Coaster,
Spinny Ride, Storybook Ride, Trash Bin — and the cards that open, roll to visit or read them:
Draconian Gate-Bot, Soul Swindler, Line Cutter, Coming Attraction, Black Hole, Squirrel Squatters,
The Most Dangerous Gamer, Petting Zookeeper, Complaints Clerk, Rad Rascal, Spinnerette, Arachnobat,
Seasoned Buttoneer, "Lifetime" Pass Holder, Deadbeat Attendant, Discourtesy Clerk, Step Right Up,
Quick Fixer.

Left blocked: Costume Shop and Command Performance (stickers; Command Performance tickets too),
Drop Tower ("until any player rolls a 1" as a duration), Ferris Wheel (phased out until a roll to
visit of 3 or less, and a memory of what it phased out), Swinging Ship ("after the first combat
phase this turn" from the precombat main phase), Tunnel of Love (an opponent's choice, then yours,
then an optional exile-and-return of the pair or a fight), Myra the Magnificent (a delayed
"whenever you visit it" bound to an Attraction chosen as the ability resolves, lasting past Myra),
Monitor Monitor (rerolls).

## Phase 2: the server and the client

- **Fill `DeckList.attractions`.** A decklist's Attraction section (Moxfield and Archidekt export
  Attractions in their own section; MTGA-style text has no convention) becomes the field: a name per
  card, or `{ name, collector }` where the import names the printing ("200a"). Check it with
  `attractionDeckProblems` beside `validateCommanderDeck`, and keep Attractions out of the 99. The
  room's deck import and the deck builder (a section of its own) both need it; the bots' decks have
  none.
- **Draw it.** `PublicPlayerInfo.attractionDeckSize` (a face-down pile with a count — the cards are
  never in `objects`, the owner's view included) and `PublicPlayerInfo.junkyard` (face-up cards, each
  in `objects`, beside the graveyard). An Attraction on the battlefield, in the junkyard or anywhere
  else visible carries `VisibleObject.lights`: the numbers 1-6 down the right of the frame, lit ones
  highlighted.
- **Show the roll.** `rolled-to-visit` (after its `dice-rolled`) and one `attraction-visited` per
  Attraction visited, for the log and an animation; `attraction-opened` and `prize-claimed` for the
  log.
