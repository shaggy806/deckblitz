# Engine rules gaps

The detail behind `BACKLOG.md`'s "Engine rules gaps": where the engine departs from the
Comprehensive Rules (`docs/rules/`), or can't yet express something real cards need, with the
rule number, the code that does it today and the cards it blocks. `BACKLOG.md` keeps one line
per gap under the same bold title; when a gap closes, delete it here and move its
`BACKLOG.md` line to `COMPLETED.md`.

- **A departing player's permanents don't trigger "leaves the battlefield"** (2026-11-17, the rules audit,
  `docs/plans/rules-audit-2026-11.md`). Rule 603.6c: leaves-the-battlefield abilities trigger "when a phased-in
  permanent leaves the game because its owner leaves the game". `Game.leaveGame` leaves what the player owned on
  the board, inert (`inGame`), and announces nothing, so another player's "whenever another creature leaves the
  battlefield" (Extractor Demon; sixteen cards watch any permanent, twelve an enchanted one) never hears it.
  Reproduction: three players, alice's Extractor Demon, bob's Grizzly Bears, `game.concede(B)`: no
  `ability-triggered` for the Demon. Dies triggers are right not to fire (nothing went to a graveyard), and the
  departing player's own leave triggers are theirs and never go on the stack (800.4d). A design call, not a
  patch: the permanents stay on the battlefield as objects, so an event that says they left needs every reader
  of `permanent-left-battlefield` looked at (its `toZone` has no "left the game"; the client draws a tile going
  somewhere; the journal counts permanents that left), and an effect that then reaches for "that card" must not
  find it still there. Outline: an internal, unlogged event for each such permanent (as `permanents-left` is),
  matched only by `leaves-battlefield` triggers of players still in the game with no `to`, and the object
  marked gone for whatever the trigger does next.
- **A player who loses while they owe a decision** (2026-11-17, the rules audit, `docs/plans/rules-audit-2026-11.md`).
  Rules 800.4f-h: a cost a departed player would pay isn't paid, a choice an object asks of them goes to another
  player its controller picks, and a choice a rule asks of them goes to the next player in turn order. None is
  modeled. `Game.whyCannotConcede` refuses a concession from a player who owes a decision (the server answers it
  for them first), so conceding never reaches it. What can: a player losing to state-based actions while a
  resolution is waiting on a choice of theirs (a suspended resolution with their life at 0), or losing with a
  "may pay" of theirs still to come in the same resolution ("each opponent may pay"). Not reproduced; write the
  failing test first (`engine/src/test/player-left-audit.test.ts` has the setup).
- **B335's small gaps** (2026-11-18, what the overnight lane agents reported while building keys; none checked
  beyond the agent's own reading). **Trigger ordering:** a delayed step trigger is put on the stack directly, so
  its controller can't order it among the step's other triggers (603.3b: Noctis's return comes after the attack
  triggers); Zevlor's copies are made in turn order rather than in an order the player picks; a delayed
  trigger's 603.7b choice of which simultaneous event triggers it is made as it resolves (Lagrella) or not at all
  (a `once` watch takes the first), and a `once` delayed `dealt-damage` watch counts only the first source's
  damage when several hit at once. (A delayed `whenever` that watches a permanent now ends as the next turn
  begins once all it watches have left, `Game.watchOver` — fixed the same night.) **Look-back and visibility:** `lookBackSources` treats any
  library arrival not from a hand as one all players could see, so a face-down exiled card counts (603.10a).
  **Who shuffles:** the `shuffles-library` event names the library's owner, so "you shuffle target player's
  library" counts as that player shuffling (Psychic Surgery). **Timing:** a held draw that a replacement turns
  into a question (dredge) is asked after the held returns (`releaseHeldChoices`; only Decoy Gambit holds draws);
  Metamorphic Alteration's copy starts at the next state-based-action check, not as the Aura attaches; a pending
  "as this is turned face up" choice may have the early-SBA gap fixed for "as this becomes attached"; Wheel of Sun
  and Moon's "instead" is applied ahead of Rest in Peace or Leyline of the Void without its affected player
  choosing the order (616.1), as Gravebane Zombie's is. **Combat:**
  goad's "a player other than the goader" and encore narrow a creature's defenders before a Trove of
  Temptation-style "at least one creature attacks" requirement is counted, so in a 508.1d tie the engine forbids
  sending it at the Trove player; `groupPlanAtSize` stops at 20,000 steps and keeps its best plan (it may then
  ask less than the rules would, never more). **Costs:** a mana ability can't combine a sacrifice of several
  with a graveyard exile; a Tawnos-shaped cost counts the graveyard as it was before the sacrifice (a card whose
  only exile candidate is the permanent it sacrifices would be refused); which mana unit pays a cost Vazi or
  Protective Sphere reads is the auto-payer's pick unless the player floats mana first (as for spells).
  **Reads:** `thenTriggerValue` keeps a trigger's "that many" in a look-and-choose `then`, not a `search-library`
  `then`; Indominus Rex, Alpha's `keywordCounters` gives nothing for a card with only "hexproof from X" (no ruling
  says whether it should); a token rolling a die as it enters skips an `ignoreChosen` replacement and keeps the
  shield for the next roll; Tapestry Warden's last-known read handles only plain creature scopes; a last-known snapshot records no
  protection, so Auratouched Mage's "could enchant" over a Mage that has left ignores it; Drain Life caps
  a creature planeswalker at the greater of toughness and loyalty and leaves a battle uncapped (its text names
  neither). **String matches to replace:** `readsResolutionCount` finds `timesResolvedThisTurn` by matching the
  ability's JSON (a false positive only journals more); the journal's `destroyed` kind reads `permanent-destroyed`
  reasons through `DESTRUCTION_REASONS`, free text kept in step by hand with the reasons `game.ts` emits (rule
  701.8b: zero toughness, the legend rule and an unattached Aura aren't destruction). **Silent shapes:** a permanent's static `underYou` (Gather
  Specimens' replacement as a static) isn't read, only a resolved one. **Rulings left open:** a token Hallowed
  Moonlight exiles as it would enter isn't counted as created (701.7a; no ruling on "whenever you create");
  a may-answer on a resolved damage replacement's modify or prevent is never asked, only its redirect; Collision
  of Realms puts the other revealed cards on the bottom before the finds enter (its ruling says after), and an
  immediate `"shuffle"` move (omen, a `reveal-until`'s shuffled rest) doesn't emit `cards-shuffled-into-library`.
  **Tools:** the scenario builder's export loses a reversed
  turn order (server `builder.ts` takes seats from the old spec); the tutorial anchors read `turnOrder` (no
  tutorial reverses play).
- **B334's small gaps** (2026-11-17, what the overnight lane agents reported while building keys; none checked
  beyond the agent's own reading). `thisWay: "exiled"` also counts cards a spell cast *during* the resolution
  exiled as its cost, because `exileCause` sees `resolvingController` (game.ts ~70509): Invasion of Alara's hand
  and library-bottom steps, and Gix's and Herald of Amity's shapes, would take them (looked at 2026-11-17: the
  event carries no mark of a cost, and costs are paid from a dozen places with no shared one, so it wants a
  cost-payment marker first). A permission's filter
  now judges a bestow cast as cast (702.103d, B334); prototype and face-down casts probably still aren't. A
  `fromGraveyard` `grantsTriggered` isn't read from graveyards (Riftstone Portal's `grantsActivated` is). A
  static's `grantsActivated` with `onlyBy: "granter"` falls back to the permanent's controller (only a
  resolving grant binds the granter; no card needs it yet). A copy of Lodestone Bauble's
  ability that chooses new targets keeps the named player and isn't held to that player's graveyard
  (`ActivatedAbility.namesPlayer`). The scaffolder can't read
  "sacrifice any number of X", "look at the top N, put one into your hand and the rest …", Saga chapters, or
  Nightmare Shepherd's "you may exile it. If you do, create a token copy"; the scenario builder can't start a
  3-4 player board with `fill: 0` (the first player's turn-1 draw loses the table, rule 103.8a).
  Checked 2026-11-17 and closed: Bleeding Effect shares a graveyard card's "hexproof from" (`sharesKeywords`'
  `inGraveyard`); a Clone returned beside another card by a `simultaneous` `for-each-target` is offered only
  what was already on the battlefield, in either order (`simultaneous-return-clone.test.ts`; the report didn't
  reproduce); `counters-distributed` choosing no creatures is legal, "any number" being any positive
  number or zero (rule 107.1c); and the two bot reads are built (a reducer that reaches only a way of casting
  is no mana rock; v1's pick of a card that stays where it lies for another player's effect).

- **B294's small gaps** (2026-11-09, what the re-attempt's agents and reader reported while writing cards).
  Built since: `CardFilter.notThisWay`'s player scope (`thisWayBy: "you"`, 2026-11-12: Deadly Brew, Rise of the
  Witch-king), and Firion is authored. Left, reported and never checked (audited 2026-11-15: every card named
  here is in the pool, so each either works or was written round it; check one before building anything): an
  `amounts` condition isn't evaluated in a cost context (`selfCostReduction`; Hagra Mauling and Thryx are
  authored on `opponent-controls`; a dynamic `{ amount }` operand in a static's `affects.filter` works,
  Ensnaring Bridge, `attack-restriction-hand-size.test.ts`); `of-player "that-player"` in `whileCondition`
  never holds on a `cast-spell` trigger (The Council of Four uses a filter); `put-into-graveyard`'s `target`
  is one object by its type, not a set (Glimpse the Impossible and Mnemonic Betrayal use `for-each-target`).
  No pool card needs any of the three. Built 2026-11-17: a `would-draw` with `instruction: { atLeast }`
  honours `whileHandAtMost` and `whileLibraryEmpty` (`drawInstructionReplaced`; Phial of Galadriel is back on
  it).

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
- **Face-down leftovers: Illusionary Mask.** Built 2026-10-31: faces down by an effect, manifest
  from another's library, `cant-turn-face-up`. Still open: Illusionary Mask (cast face down for
  X). The others this listed are in the pool (audited 2026-11-15): Ugin, the Ineffable, Gustha's
  Scepter, Kozilek, the Broken Reality, Ixidron, Vesuvan Shapeshifter, Thieving Amalgam and Death
  in Heaven.
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

- **Henzie's blitz discount never moves an `{X}`.** Henzie "Toolbox" Torre's "blitz costs you pay cost {1} less"
  (`Game.blitzCostAnywhere`) moves only a cost's generic number, never an `{X}`. No blitz cost
  in the pool has one yet.
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
  Left by the 2026-11-20 fixes: a player leaving puts another player's open `choose-targets` right
  (`Game.settleTargetChoiceAfterLeave`) and prunes the lists of `choose-permanents`,
  `choose-permanent-or-player`, `sacrifice`, `proliferate`, `time-travel` and an optional
  `remove-counters` (`Game.pruneEligibleAfterLeave`). Not: a list left with nothing where something
  must be chosen (it stays as it was, the resolution waiting on it having nowhere else to go), a
  `remove-counters` that must remove some, `choose-from-zone` over a departed player's cards, piles,
  or combat declarations; a loss by an effect with a `choose-targets` open that would have to be
  dropped or reversed (only a concession does that); and options are only taken away (a target
  made legal by the leaving isn't added). State-based actions never run with a decision open, so a
  loss by one can't meet an open choice. And a creature kept alive only by a losing player's static
  dies in the check they lose in (704.3, `heldMoves`) unless that same check also asks a
  legend-rule choice, which resumes the check with the player already gone.
**A shuffled face-down pile keeps its object ids.** Become Anonymous and Expose the Culprit (`Game.cloakExiledPile`) exile cards face up,
shuffle them and cloak one, but an object keeps its id through the exile, so a client reading the wire or animating by id can tell which
face-down card is which, where rule 406.3 and the shuffle (rule 701.24) mean nobody should. Rules-wise the cards run; what's seen is the
leak. Needs a design call: a fresh id at the shuffle, or redaction in `view.ts`. Found 2026-11-04.

**Token events a `may` replacement doesn't reach (Moonlit Meditation).** `would-create-token`'s `becomes` with `may` is asked where the effect's controller makes tokens as a resolution step: `create-token`, `create-token-copy` (a batch's copies aside; myriad's copy is one of these, and what's made instead keeps "attacking that player" since 2026-11-17), amass, incubate, populate and encore. It isn't offered for tokens another player creates: a `create-token` or amass with `who`, and a gift's Fish, Food, Treasure or Octopus (`Game.createTokens` called for the recipient) — that player's Moonlit Meditation is never asked, since the question is the effect's controller's and the players of a scope aren't asked in turn. Moonlit Meditation's the only card with it so far. The direct callers (amass's Army, incubate's Incubator, a gift's tokens) pass `createTokens` no `followUp`, so a token of theirs that a static gives riot (rule 702.136a) isn't asked and takes haste; a `create-token` effect's token is asked since 2026-11-16. Amass would need the rest of its instruction (the counters on the Army) to wait on the answer.

**"Each player may" acts on each answer before asking the next.** Rule 101.4: players choosing
at the same time decide in APNAP order, then the actions happen together. `each-player-may`
(`effects.ts`, near line 9561) carries out each player's draw or token before the next decides,
so a choice raised by one player's draw (dredge, a draw replacement) comes before a later player
answers. The seven tempting offers (Tempt with Bunnies among them) and Kwain share the shape.
Found 2026-11-06, building Tempt with Bunnies.

**A door's unlock timestamp is read by some statics only.** `staticTimestamp` (`characteristics.ts`, Steaming Sauna's ruling, 2026-11-11) is read in `scanContributingStaticSources` and `Game.maxHandSizeOf`. A door static that grants a type (layer 4) or changes another rule would still take the Room's own timestamp; no Room in the pool has one. A Room whose text box was exchanged also falls back to the Room's timestamp.






**An object's own "instead" against an exile replacement isn't asked.** Found in the third lanes run (2026-11-14, Quintorius, Loremaster): Blightsteel Colossus (`shufflesItselfInstead`) and Gravebane Zombie (`ownDestinationInstead`) apply their own replacement first when Rest in Peace or Leyline of the Void would also apply. Neither is a self-replacement effect (rule 614.15: they're static abilities, not part of a resolving spell's instructions), so the owner chooses which applies first (616.1, 616.1e). Quintorius's `bottomAfter` now asks (`askBottomAfterOrder`), except when the spell is countered by another spell's resolution, where nothing can be asked mid-resolution; the same question for those two, raised from `moveObjectUncached`, would need the move deferred as the commander's 903.9b move is. The same for life: Strong's radiation replacement goes ahead of Enduring Angel's `toZeroOrLess` unasked (`Game.lifeToZeroInstead`).

**A created token records no entry source.** Created tokens record no `EntrySource` (only `moveObject` sets the entry's `by`), so "created with [this ability]" (rule 607.2c) can't be read for a token. From the third lanes run (2026-11-14, Havengul Laboratory's agent); the other half of its line, a transformed permanent's timestamp, is built (2026-11-17, `COMPLETED.md`).

**A Notion Thief redirect isn't keyed for rule 614.5.** Found 2026-11-16 (B333, Chains of Mephistopheles): a card that a would-draw effect replacement makes a player draw is a new draw event, which that replacement can't replace again but any other can (614.5, 616.2) — built for effect replacements (`ParkedSteps.replacing`). Notion Thief's redirect isn't keyed the same way, so with Chains and two Thieves of different controllers a redirect can apply again to the card Chains makes a player draw. Only 3+ players reach it. The fix: seed `drawCard`'s `applied` map from `applyingReplacements`, and carry it through the questions the draw asks later.
