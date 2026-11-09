# Engine rules gaps

The detail behind `BACKLOG.md`'s "Engine rules gaps": where the engine departs from the
Comprehensive Rules (`docs/rules/`), or can't yet express something real cards need, with the
rule number, the code that does it today and the cards it blocks. `BACKLOG.md` keeps one line
per gap under the same bold title; when a gap closes, delete it here and move its
`BACKLOG.md` line to `COMPLETED.md`.

- **Mulligans are declared at once, and two opening-hand rules are loose** (found 2026-11-01, all older
  than the finding). Rule 103.5 has each player declare in turn order; `beginMulligans` (`game.ts`) asks in
  parallel, and changing it is a design call. Rule 103.5c gives the free mulligan to multiplayer and
  Brawl; `COMMANDER_RULES` gives it at two players too. Rule 103.6b keeps a revealed opening-hand card
  revealed until the first turn begins; the engine reveals it once.
- **An opponent-caused discard's replacement beats the graveyard ones without asking** (found
  2026-11-01). Rule 616.1 lets the affected object's controller choose among replacement effects. With
  Obstinate Baloth, Dodecapod or Quagnoth discarded under Leyline of the Void, `game.ts` (~43286)
  always takes the battlefield. Almost always the choice a player would make, but not asked.
- **Limited-duration control of a player** (found 2026-11-01). Rule 723.2: Word of Command and
  Opposition Agent control a player for less than a turn. `player-control.ts` holds a next turn or a
  next combat, not these; Word of Command is on the stale list and needs its own narrow key.
- **A target tax's offers are approximate in two corners** (found 2026-11-01). Each only
  mis-offers, never mis-charges: `target-count.ts`'s sum over-counts a `targeting` tax with several
  targets, so a driver may pass on a legal cast; and a taxed ability that also has a two-slot
  `targetCostReduction` can over-filter its targets.

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
- **Buyback always beats an "exile it instead" replacement.** Rule 616.1 lets the affected
  object's owner (or controller) choose which of two replacement effects applies first; a
  resolving spell whose buyback was paid (rule 702.27a, itself "put into its owner's hand
  instead") under Rest in Peace, Yawgmoth's Agenda or Yawgmoth's Will's "if a card would be put
  into your graveyard from anywhere this turn, exile that card instead" should let its owner pick
  (Yawgmoth's Will's ruling: "You get to choose if the Buyback returns the card to your hand or
  the card gets exiled"). `Game`'s spell-resolution finish moves a bought-back spell to the hand
  before any graveyard replacement is asked (beside Feather's 616.1 choice, which it could
  follow: `beginModesChoice` with the two outcomes). Blocks Yawgmoth's Will, together with its
  turn-long graveyard-to-exile replacement (a `player-effect` the engine doesn't have yet — the
  battlefield statics are scanned by `graveyardExileReplacements`).
- **Of several granted alternative costs, only the first is offered.** Rule 118.9 lets the
  caster choose any one alternative cost that applies (118.9a: only one). `Game.alternativeCostOf`
  returns the first `alternativeCostForSpells` static that matches the spell (skipping an energy
  one the caster can't pay), and the cast's `altCost: true` names no grant: with Jodah, Archmage
  Eternal and Nissa, Worldsoul Speaker both out, a permanent spell is offered only Jodah's
  {W}{U}{B}{R}{G}; Fist of Suns, Runeforge Champion and Primal Prayers pair the same way. A
  card's own alternative cost (Sephara) also hides every grant. Fix: list every applying grant,
  name the chosen one on the cast (an index, as `graveyardGrant` names a graveyard permission),
  and offer a variant each, its `altCostText` telling them apart.
- **A resolve-time either/or between two effects.** Vhati il-Dal's "target creature's base power
  or base toughness becomes 1" chooses between two effects as it resolves (608.2d); nothing can
  say that yet (`animate`'s lone power/toughness exists since 2026-10-31).
- **Simultaneous as-enters removals of every counter.** Two Thieves of Blood entering at once:
  the first applied takes every counter, where the player should choose which gets them
  (`removeAllCountersFrom`, 2026-10-31; 616.1).
- **Enlist leftovers.** Enlist ×N (702.154d) isn't built, and an attack tax paid by auto-tapping a
  mana creature is paid before enlist is asked, so it can tap the creature meant to be enlisted.
- **An optional non-mana cost paid as a permanent enters.** Ulamog's Despoiler's "As this
  creature enters, you may put two cards your opponents own from exile into their owners'
  graveyards. If you do, it enters with four +1/+1 counters" needs a choice and a cost inside an
  enters replacement (rule 614.12); the processors' `putFromExile` cost exists (2026-10-31) but
  only as an activation or additional cost.
- **A divided total beyond plain X isn't offered.** Meteor Shower ("X plus 1") and Shatterskull
  Smashing ("twice X") divide a total computed from X, but a cast offer's `divide` names only a
  number or `x`, so the client can't show the total to split. Fix: send the amount (or the total
  per X) on the offer and have the client compute it.
- **Face-down leftovers.** Built 2026-10-31: faces down by an effect, manifest from another's
  library, `cant-turn-face-up`. Still open: Illusionary Mask (cast face down for X); Ugin, the
  Ineffable and Gustha's Scepter (a face-down exile linked to a token or source); Kozilek, the
  Broken Reality (manifest from hands with a "manifested this way" count); Ixidron (as it enters,
  turn others face down); Vesuvan Shapeshifter; Thieving Amalgam (a trigger's "its owner"
  player); Death in Heaven (an exile linked to the Saga).
- **Assist isn't offered on a spell cast while something resolves.** Rule 702.132a lets the
  caster of any spell with assist choose a helper, however it's cast. `Game.castSpellActions`
  adds assist variants only for a cast from priority, and `judgeAssist` refuses `via: "effect"`:
  a `cast-now` cast happens inside the resolution that offered it, which would have to suspend
  on the helper's `choose-number` (`requestAssist` raises it and returns). The caster can still
  cast it paying everything. Only an assist card cast by an effect that makes its caster pay
  (not "without paying its mana cost", which leaves no generic) is affected; no such pairing is
  known in the pool. Fix: suspend the resolution as `cast-now` does around a discard, and
  resume it after `resumeAssistedCast`.
- **A delayed "whenever" over cards put into a graveyard fires once for the batch** (`effect:delayed-whenever-per-card-graveyard`, Duskmantle Guildmage). `fireWheneverWatchers` has none of a permanent's own per-card handling of `put-into-graveyard`. Its damage half landed 2026-11-09.

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

- **A source of damage: a waiting effect's object and the command zone.** Rule 609.7a also allows
  an object a waiting replacement or prevention effect or a delayed trigger refers to, and a
  face-up object in the command zone. `chooseDamageSource` (game.ts) offers permanents, spells,
  and the departed source of an ability on the stack (picked by its stack entry), not those.
  No pool card is known to need them.
- **Blitz, dash, sneak, web-slinging and More Than Meets the Eye are offered only from the hand and the command zone.** (More Than Meets the Eye since 2026-11-07, Slicer: 702.162a lets it be cast from any zone the card may be cast from.) The same
  limit holds for sneak's and web-slinging's offers (`legalActions`' sneak and web-slinging loops,
  rules 702.190a and 702.188a allow any zone a card may be cast from). `Game.blitzCostOf` gates on
  those two zones, so a blitz card another permission lets you cast (an impulse exile, a
  graveyard grant, the top of a library) isn't offered its blitz cost there, though rule
  702.152a allows it; `Game.dashCostOf` the same (702.109a). Henzie's discount also moves only a cost's generic number, never an `{X}`
  (no blitz cost in the pool has one yet).
- **An optional "instead create copies" token replacement can't be asked.** Moonlit Meditation,
  Mirrormind Crown and Esix, Fractal Bloom: "the first time you would create one or more tokens each
  turn, you may instead create that many tokens that are copies of …". The "you may" is a player
  choice made as the tokens would be created, but `Game.createTokens` and `createTokenCopy` return
  the new ids to callers that use them at once (`thenCounters`, end-step removal, entering
  attacking), across about a dozen creation paths (`effects.ts`' create-token branches, populate,
  amass, Incubator, the predefined tokens' switch in `game.ts`). It needs a pausable token-creation
  event, a per-player "would have created tokens this turn" flag (declining spends the turn's chance,
  per the rulings; `createdTokenThisTurn` doesn't say that), and a call on its order beside
  Chatterfang or Tippy-Toe (rule 616.1): `token-replacements.ts` takes whichever order makes the most
  tokens, which an optional replacement doesn't fit. Key `replacement:token-creation-replace-with-copies`
  (B274, 2026-11-07).
- **A mana restriction reads the spell before it's cast.** `ManaRestriction.spell` is matched
  against the card in its pre-cast zone, so an ability a static grants a spell as it's cast
  (Abaddon the Despoiler's cascade) is missed: Jasmine Boreal of the Seven's "only to cast
  creature spells with no abilities" (her ruling) would wrongly pay for it. She waits on it
  (`cost:mana-restriction-at-cast` in the gaps JSON).
- **Delve and convoke together on an {X} spell.** `xCost.maxX` is the better of the two alone
  (`xPlanFor`), so Chord of Calling under Teval, Arbiter of Virtue can't reach the X both would
  pay together, and its offer's convoke proof and delve ranges are each worked out without the
  other. Needs a joint plan: convoke the creatures, delve the rest of the generic.
- **Not modeled.** Banding, Companion, and text change that replaces words (612.2: Artificial Evolution, Mind Bend, Magical Hack, New Blood — a rework
  of the card format the user ruled not worth one cycle of cards, 2026-10-09; exchanging text
  boxes, 612.5, is built). Battles, dungeons and the Initiative, and snow sources paying {S}, are
  built. ROADMAP's Phase 10 deferred the rest as large or niche. None of them
  blocks ordinary Commander play. The alt-cast long tail left by Phase 6 (retrace, Warp,
  Bestow, Prototype, …) is in AUTHORING §15 and the limitation ledger.
- **Protection's prevention always comes after a creature's own damage replacements.** Rule 616.1
  lets the controller apply protection's prevention (rule 702.16e) before a "prevent that damage and
  remove a +1/+1 counter" replacement, so a black source's damage to Phantom Centaur (protection
  from black) costs no counter (its ruling); `Game`'s damage path runs `damageSteps`/`bestDamageOrder`
  before the protection check, so the counter would be removed. Blocks Phantom Centaur (B217).
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
- **Two opponents' Notion Thieves aren't ordered by the drawing player.** At a table of three
  or more, when Thieves controlled by different opponents could each take a draw, the drawing
  player chooses which applies first (the ruling), which decides who ends up drawing;
  `Game.drawRedirectFor` takes the opponent first in turn order. Asking needs a draw that can
  stop mid-effect for a decision (`drawCard` is synchronous at every call site).
- **Toxic's last two shapes.** "Gains toxic N until end of turn" (no modifier carries toxic —
  Skrelv, Defector Mite, which also needs hexproof from a colour) and a static scoped to
  "creatures with toxic" (Skrelv's Hive: toxic is folded in the layer such a scope would have
  to wait for).
- **"Each player may" with a choice inside it.** Rule 101.4: every player chooses, then it all
  happens at once. `each-player-may` holds discards and sacrifices until the last answer
  (`GameState.heldChoices`), and an effect that asks nothing more (draw, discard a hand, gain or
  lose life — `asksNothing`) is done for everyone who said yes after the last answer. One that
  asks something else, a search above all, is still done before the next player is asked: Tempt
  with Discovery and Tempt with Immortality stay blocked on it, and so does Innocent Traveler ("if no one does").
- **Static-effect dependency ordering** (rule 613.8) is implemented only for layer 4's additive
  type grants (Kudo beside Mishra's Factory, `characteristics.ts`). Every other layer applies
  its statics in timestamp order only.
- **The rest of leaving the game** (rule 800.4). 800.4a, 800.4c (a control effect ending with the
  default controller gone exiles the permanent — `recomputeControl`) and 800.4m are modeled, and
  a conceding player's own pending decision is answered by the server first. Not yet: a choice an
  effect would ask of a player who has already left (800.4g–h: the object's controller picks
  another player, or the next in turn order makes it) — the engine skips that player instead.
- **Proliferate over a token stack.** A stack is one proliferate entry and every member gets the
  counter; choosing some of them isn't built. See `docs/plans/token-stack-choices.md`.
- **Distinct targets in one token stack.** An "another target" relation (`distinctTargets`, an
  `any-number` group) names a stack once (`otherSlotConflict`, `slotOptions`), so "two target
  creatures", Terastodon's three, Curse of the Swine's X or Pest Infestation's up to X can't take
  two tokens of one stack (five Treasures in one stack are one target). Needs the relation checks
  to allow a repeat up to `stackCount` and a client control for picking a stack more than once.
  See `docs/plans/token-stack-choices.md`.
- **"Enters untapped" always beats "enters tapped".** When an enters-the-battlefield replacement
  that makes a permanent enter untapped meets one that makes it enter tapped, the engine applies
  the untapped one last, so the permanent enters untapped (`game.ts`, where the enters
  replacements fold — the comment there assumes the untapped effect is the entering permanent's
  own controller's). Rule 616.1 gives the entering permanent's controller the order. Archelos,
  Lagoon Mystic (batch 113) reaches every player's permanents, so on an opponent's permanent with
  its own "enters tapped" the engine makes that player's choice for them — the one they'd make
  almost always, which is why the card is authored. A choice asked of the controller would close
  it.
**`withMain` from a precombat main runs M C+ C M M.** `Game.endStep`'s queue puts the turn's own combat straight after an added combat
and its main phase after, where the rules give M C+ M C M. No pool ability has `additional-combat`'s `withMain` yet, so nothing reaches
it. Found 2026-11-04, with Moraug's rulings (an `afterThisPhase` combat from the precombat main runs before the turn's own).

**Panglacial Wurm under Opposition Agent.** The Agent's controller makes every decision while the player searches, but in `effects.ts`,
`case "search-library"` offers `cast-now` (`from: "while-searching"`) before `ctx.searchLibrary`, and `Game.beginSearchControl` only starts
in `beginLibrarySearch`, so the searcher answers. Fix: begin the control before the offer and end it when the search's `choose-from-zone`
is answered. Blocks no card; only this interaction is wrong. Found 2026-11-04.

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

## Latent

The engine departs from the rules here, but no pool card reaches it yet: fix each when a card
that needs it is authored.

- **A double-faced Aura put onto the battlefield transformed is asked what it enchants.** Rule
  712.14a puts it onto the battlefield back face up, so Skin Invasion returns as Skin Shedder, a
  creature with nothing to enchant. `Game.askEnterChoice` (and `nextEnterChoice`) read the card's
  current face, the front Aura's, before the move applies `transformed`: with no creature to
  enchant it stays in the graveyard (303.4g), and with one the player is asked a meaningless
  enchant choice and Skin Shedder enters unattached. The fix asks the enter choices of the face it
  will enter as. Blocks Skin Invasion (`bug:aura-enters-transformed-asks-enchant`). (The same
  front-face reading kept an instant or sorcery card from entering transformed — Startled Awake —
  until batch 151.)

- **A count of what's attached to a source that has left reads 0.** Rule 608.2h: `countOf` with
  `attachedTo: { isSource: true }` reads the board now, and the Equipment is already unattached.
  Tests for Wyleth, Valduk, Captain America, Shagrat and Whiplash each got 0. Kemba, Kha Regent's
  upkeep trigger, in the pool, has the same read and is unchecked. Six cards wait
  (`amount:attached-to-source-last-known`). Found by batch 257.
- **Overlapping damage redirections are ordered without asking.** Rule 616.1: the affected player
  chooses; `bestDamageOrder` chooses for them. Saving Grace, in the pool, has it. Gideon's
  Sacrifice's ruling asks for the choice (`decision:damage-redirect-order`). Found by batch 257.
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
- **A token with devour never devours.** Rule 702.82a: devour is a replacement as the permanent
  enters. It's asked through `askEnterChoice`, which a spell resolving, a reanimation and a blink
  call, but token creation (`createTokens`, `mintTokenBatch`) never does, so a `create-token` of
  a token definition with `devour` makes the token without the choice (AUTHORING §15 notes the
  same for a token copy's "as this enters" choices). No pool token has devour; blocks Dragon
  Broodmother (`mechanic:token-devour`). Found by an authoring agent, 2026-10-23 (B144).
- **Convoke with a target-dependent cost.** The offered `proof` is priced at the dearer end of
  the target-count range.

- **A ceased token's last-known information lasts only the turn.** `GameState.ceasedTokens`
  (a token that has ceased to exist, rule 704.5d, read by last-known information) is emptied as
  each turn begins. Since 2026-10-09 a delayed trigger whose trigger object was such a token keeps
  its snapshot (`DelayedTrigger.triggerObjectCeased` — Esoteric Duplicator copying a Clue
  sacrificed in an end step, at the next turn's end step), but anything else reading a ceased
  token on a later turn still loses it. Latent: no other pool card is known to.
- **Umbra armor's Aura is picked, and goes after the other shields.** With several Auras with
  umbra armor on one permanent (rule 702.89a), or a regeneration shield or a shield counter
  beside one, the permanent's controller chooses which replacement applies (616.1, the
  rulings); `Game.umbraArmorInstead` destroys the umbra of least mana value (the newest of
  equals), and `Game.destroyByEffect` tries it only after the regeneration shield and the
  shield counter — keeping the Aura's bonus, which usually matters more. Latent: no pool deck
  stacks umbras on purpose (found 2026-10-25, building umbra armor).
- **A regeneration shield goes before a shield counter.** Both replace "this permanent would
  be destroyed" (rules 701.15a, 122.1c), so with both on it the permanent's controller chooses
  which applies (616.1); `Game.destroyByEffect` always spends the regeneration shield first,
  which ends with the turn anyway, keeping the lasting counter — the better choice unless being
  tapped and removed from combat matters. Latent: no pool card regenerates a shielded permanent
  on purpose (found 2026-10-19, building shield counters).

**"Each player may" acts on each answer before asking the next.** Rule 101.4: players choosing
at the same time decide in APNAP order, then the actions happen together. `each-player-may`
(`effects.ts`, near line 9561) carries out each player's draw or token before the next decides,
so a choice raised by one player's draw (dredge, a draw replacement) comes before a later player
answers. The seven tempting offers (Tempt with Bunnies among them) and Kwain share the shape.
Found 2026-11-06, building Tempt with Bunnies.

**Only the first mandatory draw replacement is offered beside an optional one.** With Abundance
and two mandatory "instead of drawing" replacements (Underrealm Lich and another), rule 616.1
lets the player pick any of them; `Game.optionalDrawReplacementAsked` offers the first mandatory
one in battlefield order, as the draw did before. Found 2026-11-06, building Abundance.

**Adamant's colour word and a text change.** Rule 612.2 lets a text-changing effect change a colour word, and adamant's "if at least three white mana was spent" has one. `text-change.ts` doesn't read a `manaSpent` clause's `type` (it didn't read the old `manaSpentOfColors` either; theme 13's pool test named it). `{U}{B}` symbol clauses (the Mythos cycle) are mana symbols and must stay as they are (rule 612.2), so a clause needs to say which it is before the walker can change it. Cards: every adamant card, Ardenvale Paladin first.
