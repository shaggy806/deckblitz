# Engine rules gaps

The detail behind `BACKLOG.md`'s "Engine rules gaps": where the engine departs from the
Comprehensive Rules (`docs/rules/`), or can't yet express something real cards need, with the
rule number, the code that does it today and the cards it blocks. `BACKLOG.md` keeps one line
per gap under the same bold title; when a gap closes, delete it here and move its
`BACKLOG.md` line to `COMPLETED.md`.

- **B294's small gaps** (2026-11-09, what the re-attempt's agents and reader reported while writing cards).
  Checked against the code: `CardFilter.notThisWay` (`filter.ts`) has no player scope, so Deadly Brew's and
  Rise of the Witch-king's "another" also bars a card you own that an opponent sacrificed, where the ruling
  bars only the one you sacrificed (Rise blocked, `filter:not-this-way-by-you`). A `create-token-copy`
  exception's static can't say "this object": `bindDynamicCompares` binds `isSource` to the resolving ability's
  source, and `abilityCostModifiers` reads printed statics only (Firion, `bug:copy-exception-static-self-reference`).
  Reported, not checked: an `amounts` condition or a dynamic `{ amount }` filter operand isn't evaluated in
  static or cost contexts (`selfCostReduction`, `affects.filter`; Hagra Mauling, Thryx, Ensnaring Bridge,
  Lavinia); `would-draw` with `instruction: { atLeast }` doesn't honour `whileHandAtMost` (Phial of Galadriel
  uses the static's `condition`); `of-player "that-player"` in `whileCondition` never holds on a `cast-spell`
  trigger (The Council of Four uses a filter); `put-into-graveyard` on a set ref moves only one object
  (Glimpse the Impossible and Mnemonic Betrayal use `for-each-target`).

- **Mulligans are declared at once, and two opening-hand rules are loose** (found 2026-11-01, all older
  than the finding). Rule 103.5 has each player declare in turn order; `beginMulligans` (`game.ts`) asks in
  parallel, and changing it is a design call. Rule 103.5c gives the free mulligan to multiplayer and
  Brawl; `COMMANDER_RULES` gives it at two players too. Rule 103.6b keeps a revealed opening-hand card
  revealed until the first turn begins; the engine reveals it once.
- **Limited-duration control of a player** (found 2026-11-01). Rule 723.2: Word of Command and
  Opposition Agent control a player for less than a turn. `player-control.ts` holds a next turn or a
  next combat, not these; Word of Command is on the stale list and needs its own narrow key.
- **A static can't require attacking one player.** `AttackRequirementRule` (`state.ts`, read by
  `combat/eligibility.ts`'s `attackRequirementRulesOf` and `aimedRequirements`) is created only by a
  resolving `attack-requirement` effect. Public Enemy's "all creatures attack enchanted creature's
  controller each combat if able" is a static (an Aura's, for as long as it's attached), so it needs
  the same aimed requirement read off the battlefield's statics; Galactus, Devourer of Worlds' "an
  opponent with the most life among your opponents … unless you control a creature named Silver
  Surfer" a defender chosen by life total and a condition; Silver Surfer, Galactus's Herald's
  "until the end of your next turn, target creature attacks that player each combat if able" a
  duration ending with your next turn's end and the damaged player as `attacks`. Key:
  static:must-attack-specific-player (The Brothers' War, under it too, is two `attack-requirement`
  effects already).
- **A targeting restriction can't last a turn, or require a target.** A printed "can't be the
  target of …" is a static (`hexproofFrom`'s qualifiers, `graveyardCardsUntargetable` —
  `targeting.ts`'s `hexproofFromBlocks`, `graveyardCardShielded`). Display of Dominance's mode
  "permanents you control can't be the targets of blue or black spells your opponents control this
  turn" is a one-shot rule for the turn over whatever you control then (rule 611.2c — it changes no
  characteristic), so it needs a turn-long restriction like `restrict`'s `filter` form read by
  `hexproofFromBlocks`. Lurker's "unless it attacked or blocked this turn" needs a per-turn
  attacked-or-blocked condition. The Flagbearers (Standard Bearer, Coalition Honor Guard,
  Coalition Flag) are the reverse: "while an opponent is choosing targets … must choose at least
  one Flagbearer on the battlefield if able" is a requirement on the choice (601.2c), checked over
  a whole target set, which `invalidTargetReason` has no hook for.
- **A merged or melded permanent's cards go into a library or graveyard in an order nobody chose.**
  Rules 730.3a and the meld ruling ("if the cards are put on the top or bottom of your library,
  you choose their relative order") let the owner arrange the cards a merged or melded permanent
  becomes. `Game.scatterMergedComponents` / `scatterMeldedCards` put the other cards after the
  object's own card, and `placeInLibrary` moves them (`GameObject.leftWith`) to the same place
  first, so on top of a library the permanent's own card is on top. Only a library's top matters
  in practice (a later draw). Effects that move the permanent and then act on "that card" find
  every card (730.3c) only where they go through `leftWith`: a blink (`flickerByEffect`), an
  O-Ring's `exiledBy`, an "until it leaves" `exiledUntil` and a "with this" `exiledWith`; any
  other "that card" reference (an impulse permission on an exiled permanent, Hostage Taker's) sees
  the object's own card alone. Fix: a `choose-pile`-style order decision for the first, and read
  `leftWith` wherever an effect follows a permanent into its new zone for the second.
- **Simultaneous as-enters removals of every counter.** Two Thieves of Blood entering at once:
  the first applied takes every counter, where the player should choose which gets them
  (`removeAllCountersFrom`, 2026-10-31; 616.1).
- **Face-down leftovers.** Built 2026-10-31: faces down by an effect, manifest from another's
  library, `cant-turn-face-up`. Still open: Illusionary Mask (cast face down for X); Ugin, the
  Ineffable and Gustha's Scepter (a face-down exile linked to a token or source); Kozilek, the
  Broken Reality (manifest from hands with a "manifested this way" count); Ixidron (as it enters,
  turn others face down); Vesuvan Shapeshifter; Thieving Amalgam (a trigger's "its owner"
  player); Death in Heaven (an exile linked to the Saga).
- **`put-onto-battlefield` follows a target that changed zones during the resolution.** A
  target is checked once, as the spell or ability begins to resolve (`illegalSlot` reads the
  `illegalTargets` found then, rule 608.2b); a step of the same resolution that moves it first
  leaves the next step pointing at the new object, which rule 400.7 says it isn't. Found authoring
  Celestial Gatekeeper (batch 219, a test of group A's): "When this creature dies, exile it, then
  return up to two target Bird and/or Cleric permanent cards from your graveyard to the
  battlefield" — targeting itself, it was exiled and then returned from exile, where its ruling
  says it stays exiled. Not yet checked against other `put-onto-battlefield` /
  `return-to-hand` sequences. Blocks Celestial Gatekeeper (`bug:moved-target-card-still-acted-on`; batch 235 found it again).
  Found 2026-10-26 authoring Duskmantle Seer (B176), written with `who: "you"` instead — right
  only because the step runs as the choosing player. The fix carries the binding into the
  `then`'s context.

- **Splice's limits.** Splice (rule 702.47, `CardDefinition.splice`, `Game.spliceFits` and
  `castSpellActions` in game.ts) is offered only onto a spell with one plain `effect` — not a
  modal (`castModal`), fused, divided or `resolve` spell, where the spliced text has no place to
  go yet — and never on an overloaded cast; every set of splice cards in hand is its own
  variant, so at most `Game.MAX_SPLICE_OFFERED` (four) are offered at once. A non-mana splice
  cost (Horobi's Whisper's "exile four cards from your graveyard", Veil of Secrecy's "return a
  blue creature you control") isn't paid: `cost:splice-non-mana`. Found building splice
  (B202, 2026-10-26).

- **Blitz, dash, sneak, web-slinging and More Than Meets the Eye are offered only from the hand and the command zone.** (More Than Meets the Eye since 2026-11-07, Slicer: 702.162a lets it be cast from any zone the card may be cast from.) The same
  limit holds for sneak's and web-slinging's offers (`legalActions`' sneak and web-slinging loops,
  rules 702.190a and 702.188a allow any zone a card may be cast from). `Game.blitzCostOf` gates on
  those two zones, so a blitz card another permission lets you cast (an impulse exile, a
  graveyard grant, the top of a library) isn't offered its blitz cost there, though rule
  702.152a allows it; `Game.dashCostOf` the same (702.109a). Henzie's discount also moves only a cost's generic number, never an `{X}`
  (no blitz cost in the pool has one yet).
- **Not modeled.** Banding, Companion, and text change that replaces words (612.2: Artificial Evolution, Mind Bend, Magical Hack, New Blood — a rework
  of the card format the user ruled not worth one cycle of cards, 2026-10-09; exchanging text
  boxes, 612.5, is built). Battles, dungeons and the Initiative, and snow sources paying {S}, are
  built. ROADMAP's Phase 10 deferred the rest as large or niche. None of them
  blocks ordinary Commander play. The alt-cast long tail left by Phase 6 (retrace, Warp,
  Bestow, Prototype, …) is in AUTHORING §15 and the limitation ledger.
- **Replacement order is chosen for the affected player, never asked.** Rule 616.1 has the
  affected player (or the controller of the affected object) order the replacement and
  prevention effects that apply to one event. The engine picks the order best for them, as
  Arena does, instead of asking: damage the least dealt (then the fewest shield points spent,
  `Game.bestDamageOrder` over every order of the doublers, pluses, at-least raises, prevent-alls
  and prevention shields), counters the most +1/+1 and the fewest -1/-1 (`Game.counterTotal`:
  a "that many plus one" before a doubler, or after it for -1/-1), and a life gain turned to
  loss (Tainted Remedy) before anything grows it, a prevented one before both. A player who
  wants the worse result — more damage to their own creature for a "dealt damage" trigger, more
  -1/-1 counters for a persist loop — doesn't get it. Asking needs a decision in the middle of
  `dealDamage`/`addCounter`, which are synchronous at every call site. Only Feather's exile
  beside another exiling replacement asks today. One-shot redirection shields exist
  (`prevent-damage`'s `redirectTo`, rule 614.9), but a redirection's order is chosen the same
  way — a plain prevention shield first, never asked.
- **"Each player may" with a choice inside it.** Rule 101.4: every player chooses, then it all
  happens at once. `each-player-may` holds discards and sacrifices until the last answer
  (`GameState.heldChoices`), and an effect that asks nothing more (draw, discard a hand, gain or
  lose life — `asksNothing`) is done for everyone who said yes after the last answer. One that
  asks something else, a search above all, is still done before the next player is asked: Tempt
  with Discovery and Tempt with Immortality stay blocked on it, and so does Innocent Traveler ("if no one does").
- **The rest of leaving the game** (rule 800.4). 800.4a, 800.4c (a control effect ending with the
  default controller gone exiles the permanent — `recomputeControl`) and 800.4m are modeled, and
  a conceding player's own pending decision is answered by the server first. Not yet: a choice an
  effect would ask of a player who has already left (800.4g–h: the object's controller picks
  another player, or the next in turn order makes it) — the engine skips that player instead.
**A shuffled face-down pile keeps its object ids.** Become Anonymous and Expose the Culprit (`Game.cloakExiledPile`) exile cards face up,
shuffle them and cloak one, but an object keeps its id through the exile, so a client reading the wire or animating by id can tell which
face-down card is which, where rule 406.3 and the shuffle (rule 701.24) mean nobody should. Rules-wise the cards run; what's seen is the
leak. Needs a design call: a fresh id at the shuffle, or redaction in `view.ts`. Found 2026-11-04.

**A self-replacement beside an exile: no 616.1 choice.** Rule 616.1: the affected object's controller picks which replacement
applies, and these aren't self-replacement effects under 614.15. `moveObjectUncached` applies `shufflesItselfInstead` and
`topsItselfInstead` first, assuming the owner prefers the library. Cards: Gravebane Zombie, the Blightsteel shuffle family. Needs a
choice on a move that can't wait yet, as Pulmonic Sliver's key does. Found 2026-11-04.

**A player can't play another player's face-down exiled card blind.** Rule 406.3a lets the effect that exiled a
card face down allow it to be played; the engine offers a linked grant only to a player who may look at the card
(`linkedCastGrantFor`, `game.ts`). Blocks Urianger Augurelt and Lobelia. Found 2026-11-02; not reported from play.

**A token with riot is never asked.** A token enters without the riot choice and takes haste
(`entersBattlefieldReplacement`, `game.ts`), though rule 702.136a gives it the choice as it enters. Blocks Spider-Punk's
Spider tokens; Spider-Punk isn't authored. Found 2026-11-02; not reported from play.

**Token events a `may` replacement doesn't reach (Moonlit Meditation).** `would-create-token`'s `becomes` with `may` is asked at the two effects that make tokens as a resolution step, `create-token` and `create-token-copy` (a batch's copies aside). Tokens made inside another operation, amass (701.47), incubate, encore, myriad, populate and the like, go straight through `Game.createTokens`, which can't stop to ask: the replacement isn't offered for them, and only the tokens of a token doubler apply there (rule 614.1a). Moonlit Meditation's the only card with it so far.

**A bot's cast the engine refuses takes the shard down.** Seen on deckblitz.net, 2026-11-10 (build `9a0290c21`), in a
four-bot lobby room (Token Triumph ×2, World Shaper, Draconic Destruction; seat alice a Token Triumph seat handed to a
bot), turn 24, precombat main, ~54 permanents: `[shard 0] crashed: Error: alice cannot pay the cost of Conclave Tribunal`,
thrown by `Game.castSpell` under `Game.dispatch` from `Room.openGate` (the bot's held move, which is only dispatched on the
board it was decided on, or decided afresh). Two faults. (1) The bot offered a cast-spell of a convoke spell with a payment
`castSpell` then refused: either the legal-action list and `castSpell` disagree about a convoke payment on that board, or
the bot built the payment itself. Not reproduced: no capture, and 12 `bot:timings` games with the same decks the same
day threw nothing; first try is bot games seating Token Triumph with a throw from `dispatch` caught and the state
saved. The decision wasn't one the clock cut (no slow-decision line for alice at that turn). (2) `Room` dispatches a
bot's move with nothing around it (`dispatchForBot`, and the `this.game.dispatch(move)` sites in `settle`), so
one refused move exits the shard and loses every room on it; in a local blitz the same throw would end the player's
worker. A refused bot move should be logged with the state and replaced by a legal fallback (pass priority, or v1's
answer), not thrown.

## Latent

The engine departs from the rules here, but no pool card reaches it yet: fix each when a card
that needs it is authored.

- **Smaller leads from batch 258, none traced further than the report.** A `look-and-choose` filter's
  `manaValue: { op: "eq", n: "x" }` matched nothing on Ashiok's −X, where `{ n: { amount: "x" } }` works.
  `reveal: "chosen"` does nothing for `zone: "hand"` (`game.ts` ~37677, library only), though the type
  allows it. `sameNameAsSource` reads a source that has left live (rules 113.7a, 608.2h): Callidus
  Assassin and Evil Twin wait on `filter:same-name-as-source-last-known`, and four pool cards use the
  read. AUTHORING §15's "no damage redirection to a third object" looks stale beside `redirectTo`.
  `card:find`'s shapes also drop `text` on `castModal` modes, `alternativeCost`'s `discard` and
  `exileFromHand`, `kicker.also` and `nextDrawInstead`.
- **Smaller leads from batch 257, none traced further than the agent's report.** `applyChoosePermanents`
  builds a fresh context, so `{ manaValueOf: "trigger-object" }` in its `then` reads 0. `keepTargets`
  moves a target to slot 1 without shifting `targetZones`. An impulse `gate` is evaluated from the
  exiled card's side (`game.ts` ~39618), so "you" is its owner on another player's card. `isSource`
  in an `exile-all` filter's `anyOf` left Ajani on the battlefield. `{ amounts, left: { countersOn: 0 } }`
  on a destroyed target never ran its branch where plain `{ countersOn: 0 }` read 3. `while-source-tapped`
  reads only the current state. `choose-value`'s `among: {}` offers an opponent's counter kinds, against
  its doc. `card:find`'s printed shapes drop a required `text` on `unless` options and `reveal` costs.
- **A mana ability's discard cost is never paid.** Rule 605.3b: a mana ability's costs are paid
  as it's activated, like any other's. `Game.activateAbility` checks a `cost.discard` can be paid
  but takes the discard only on the stack path (where `discardByEffect` asks); the
  `isManaAbility` branch resolves the mana and returns first, so the mana comes free. It refuses
  a mana ability's graveyard-exile or multi-sacrifice cost outright, but not a discard. Overeager
  Apprentice is in the pool and has one: checked 2026-11-04, it makes {B}{B}{B} and the hand stays
  as it was. Blocks Bog Witch (`cost:mana-ability-discard`). Found by an authoring agent,
  2026-10-23 (B144).
**"Each player may" acts on each answer before asking the next.** Rule 101.4: players choosing
at the same time decide in APNAP order, then the actions happen together. `each-player-may`
(`effects.ts`, near line 9561) carries out each player's draw or token before the next decides,
so a choice raised by one player's draw (dredge, a draw replacement) comes before a later player
answers. The seven tempting offers (Tempt with Bunnies among them) and Kwain share the shape.
Found 2026-11-06, building Tempt with Bunnies.

**A creature type outlives being a creature.** Rule 205.1b: a creature subtype is lost when the permanent stops being a creature. A Forest animated by Life, then given Angel by a permanent `become { addSubtypes }`, still shows `["Forest", "Angel"]` after the animation ends (B297, tested). Blocks Archangel Elspeth; Valkyrie's Call and Guide of Souls are in the pool with it (a Vehicle or animated land that returns keeps "Angel" while not a creature).

**`sameAbilityAs` counts one way only.** Set on two abilities pointing at each other, "the second time this ability has resolved" never counted across them; only the second entry naming the first works, and nothing warns (B297, South Pole Voyager).

**A back face spawned by name isn't a working permanent.** `debugSpawn("The Myriad Pools")` could not tap for mana; spawning the front and transforming it worked. Seen only in a test (B297); not chased.

