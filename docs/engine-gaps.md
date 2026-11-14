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
  way — a plain prevention shield first, never asked. Two "enter as a copy of" effects that
  differ (Essence of the Wild beside a Mystic Reflection) are asked for a card or a token copy
  that waits to enter (`Game.enterAsCopyAsked`), but a token minted straight onto the battlefield
  (`Game.mintFreshTokenObject`) takes the resolved one last, unasked.
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

**"Each player may" acts on each answer before asking the next.** Rule 101.4: players choosing
at the same time decide in APNAP order, then the actions happen together. `each-player-may`
(`effects.ts`, near line 9561) carries out each player's draw or token before the next decides,
so a choice raised by one player's draw (dredge, a draw replacement) comes before a later player
answers. The seven tempting offers (Tempt with Bunnies among them) and Kwain share the shape.
Found 2026-11-06, building Tempt with Bunnies.

**`thenCounters` reaches tokens a replacement adds.** `finishTokenCopies` (`game.ts`) puts a token copy's `thenCounters` on every token in `made`, which holds the copies and the tokens a would-create-token replacement added (Chatterfang's Squirrels) in one flat list. Tokens made *instead* should keep them (Divine Visitation's ruling: what the creating effect specifies still applies); tokens made *in addition* should not. `withCounters` already tells them apart through `PlannedTokens.inPlace` (2026-11-11, Littjara Mirrorlake); `thenCounters` needs `made` split the same way.

**An exile cost asks the sacrifice prohibition.** A cost written as `sacrifice` + `exilesSacrifice` (Food Chain, Primordial Mist) still asks `sacrificeCostProhibited` beside `canBeSacrificed` in `game.ts`'s `payable` line, so "creatures can't be sacrificed to activate abilities" would wrongly stop it. Found 2026-11-11, not yet shown by a pool card in play.

**Several cards at random move one at a time.** `choose-random-card` picks one card, so "return two cards at random from your graveyard" (Make a Wish) is two picks and two moves, and a "whenever one or more cards leave your graveyard" trigger fires twice where the cards leave together (rules 603.2c, 603.10). A `count` on `choose-random-card`, picking that many without replacement and moving them as one batch (`withGraveyardLeaveBatch`), fixes Make a Wish and frees Capricious Hellraiser's "exile three cards at random from your graveyard" (`effect:random-cards-exiled-together`, B314, 2026-11-12).

**Combat damage replaced one attacker at a time.** `dealDamage` runs a `would-deal-damage` `instead: { effect }` once per source, so two Zombies hitting one player under Undead Alchemist make two mill events in sequence. Combat damage is dealt at once (rule 510.2); if the mills count as one event, a "whenever one or more cards are put into a graveyard from a library" trigger (Sidisi, The Wise Mothman) should fire once. Untested either way (2026-11-11).

**A door's unlock timestamp is read by some statics only.** `staticTimestamp` (`characteristics.ts`, Steaming Sauna's ruling, 2026-11-11) is read in `scanContributingStaticSources` and `Game.maxHandSizeOf`. A door static that grants a type (layer 4) or changes another rule would still take the Room's own timestamp; no Room in the pool has one. A Room whose text box was exchanged also falls back to the Room's timestamp.

**`sameAbilityAs` counts one way only.** Set on two abilities pointing at each other, "the second time this ability has resolved" never counted across them; only the second entry naming the first works, and nothing warns (B297, South Pole Voyager).

**A back face spawned by name isn't a working permanent.** `debugSpawn("The Myriad Pools")` could not tap for mana; spawning the front and transforming it worked. Seen only in a test (B297); not chased.

**Opposition Agent and a search of every library.** Jace, Architect of Thought's −8 searches each player's library through one `choose-from-zone` (`search-library`'s `eachLibrary`, `Game.beginEachLibrarySearch`, 2026-11-13). If an opponent controls Opposition Agent, its search control begins when the searcher's own library is searched, but the Agent's "you may play those cards for as long as they remain exiled" isn't granted for a find from that library: the find is cast through `cast-now` as Jace says, never offered to the Agent's controller.

**A token copy skips "exile first" and "pay any amount of life" as it enters.** `CopyOnEnter.exileFirst` (The Mimeoplasm) and `AsEntersAction.payLife: "any"` (Phyrexian Processor), both 2026-11-13, are asked when a card enters; a token copy of either enters without the question, as a token copy of Vizier of Many Faces already does. Rule 614.1c applies to a token entering as it does to a card.

**Definition traps that fail silently.** From B298's agents, none debugged: with `targetsChosenBy: "trigger-object-controller"` a target's `whose: "opponent"` is read from the ability's controller, not the player choosing (Confusion in the Ranks is written around it with `controlledByRef`); a spell's any-number group bound that isn't a literal `"x"` (`{ product: ["x", 2] }`) becomes 0 in `specsAtX` instead of being refused (Erebos's Intervention); `exile` on a card in a hand does nothing without `fromHand: true`; `look-and-choose` over `exiled-this-way` with `max: 0` never applies `leftover`; `choose-random-card`'s `then` replaces target 0 unless `slot` is given; an `of-player` condition's `player: "trigger-player"` throws.


**A `turn-history` condition with `who: "opponent"` sums over every opponent.** B327's agent, Whiplash Trap ("if an opponent had two or more creatures enter the battlefield under their control this turn"): with `who: "opponent"` and `atLeast: 2`, one creature entering for each of two opponents passes, where the rule asks about one opponent. Whiplash Trap was written with `of-player` and `player: "an-opponent"` instead; any pool card using `who: "opponent"` with `atLeast` above 1 may be wrong in a multiplayer game — grep them and test one. In the same batch: a `trigger-value` condition reads false outside resolution, so it can't serve as an intervening "if" (rule 603.4) — what kept Atomwheel Acrobats' "whenever you roll a 1 or 2" off a filtered effect (it waits on `trigger:rolls-at-most`).

**An object's own "instead" against an exile replacement isn't asked.** Found in the third lanes run (2026-11-14, Quintorius, Loremaster): Blightsteel Colossus (`shufflesItselfInstead`) and Gravebane Zombie (`ownDestinationInstead`) apply their own replacement first when Rest in Peace or Leyline of the Void would also apply. Neither is a self-replacement effect (rule 614.15: they're static abilities, not part of a resolving spell's instructions), so the owner chooses which applies first (616.1, 616.1e). Quintorius's `bottomAfter` now asks (`askBottomAfterOrder`), except when the spell is countered by another spell's resolution, where nothing can be asked mid-resolution; the same question for those two, raised from `moveObjectUncached`, would need the move deferred as the commander's 903.9b move is.

**Transforming keeps a permanent's timestamp.** From the third lanes run (2026-11-14, Havengul Laboratory's agent): rule 613.7g gives a double-faced permanent a new timestamp each time it transforms or converts, but `game.ts` keeps the old one (the transform doc near `permanent-transformed`, "Same object, same timestamp"), so a transformed permanent's own continuous effects order wrongly against later ones in the same layer. And created tokens record no `EntrySource` (only `moveObject` sets the entry's `by`), so "created with [this ability]" (rule 607.2c) can't be read for a token.
