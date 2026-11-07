# Engine rules gaps

The detail behind `BACKLOG.md`'s "Engine rules gaps": where the engine departs from the
Comprehensive Rules (`docs/rules/`), or can't yet express something real cards need, with the
rule number, the code that does it today and the cards it blocks. `BACKLOG.md` keeps one line
per gap under the same bold title; when a gap closes, delete it here and move its
`BACKLOG.md` line to `COMPLETED.md`.

- **A split card's target offer reads both halves for filter-based protection** (found 2026-11-06,
  batch 268's situation fuzzer: `node scripts/situation-fuzz.mjs --with "Curzon Dax, Bound by Blood"
  --seed 31 --scenarios 1`, Curzon Dax only on the board). Casting Malice (Spite // Malice), the
  target offer listed Guardian of the Guildpact (protection from monocolored), and `castSpell`
  then refused it, "illegal target for Malice". Rule 709.3: a split card cast as one half has only
  that half's characteristics, so Malice is mono-black and the refusal is right. `castSpell` sets
  `object.face` up front (game.ts ~19455) before `whyTargetsInvalid`, but the offer paths
  (`whyCannotCastSpell`'s `legalTargets` ~17706, `castingCostOf` ~15396, `costModificationFor`
  ~15984) pass `cardSource(def, cardId)` with the card still on its default face. `protectionBlocks`'
  filter clauses (`matchesFilter` on `source.object`, targeting.ts ~390) then read the card in hand,
  whose characteristics are both halves (709.4), multicolored. The colour clauses use `def.colors`
  and are right. Fix: judge the offer as the face being cast, e.g. a face-aware read in
  `TargetSource` that `matchesFilter` honours, rather than mutating `face` under the computed cache.
- **Two different "must be blocked by" filters on one attacker merge into one requirement** (found 2026-11-03). An attacker
  under two filtered requirements should have each counted toward the most requirements possible (rule 509.1c).
  `combat/blocking.ts`'s `mustBeBlockedByOneOf` holds one list per attacker, so a blocker matching either filter satisfies both.
  Not checked: which cards in the pool can reach it.

- **The auto-payer can find no plan for a payable cost** (found 2026-11-03, older than the finding: it fails
  with `lifeLast` switched off too). `coverSpecific` (`mana-payment.ts`) takes pips in WUBRG order, each from
  the free source first, and never takes one back: Fellwar Stone (making {W} and {R} off an opponent's lands)
  and Silent Clearing make {W}{R}, but the Stone goes on the {W} for free and nothing is left for the {R}, so
  `payMana` returns null and the spell isn't offered. The retries only reorder groups of sources, and without
  a converter they don't run. Outline: a last pass that takes the pips scarcest first (fewest sources making
  them), or a small matching over the coloured pips; it runs only where every other pass found nothing, so it
  can't change a payment that works. Risk: `payMana` is on the affordability path, so measure the cost of a
  further pass on a payment that truly can't be paid.
- **The auto-payer can pay away a player's last life** (found 2026-11-03). `affordableOptions`
  (`mana-payment.ts`) checks each option's toll against the life total alone, so at 2 life Silent Clearing and
  Caves of Koilos together pay {W}{W} for 2 and the player loses, though its comment says the auto-payer never
  kills its payer. Outline: count the tolls already taken as `openFunded` opens a source, and treat a toll that
  would reach 0 as unaffordable. A design call: rule 119.4 lets a player pay life down to 0 and a painland's
  damage (rule 120.3a) isn't a payment at all, so this makes such a spell uncastable by auto-pay; the
  alternative is to keep it castable and ask first, a new decision.
- **Mulligans are declared at once, and two opening-hand rules are loose** (found 2026-11-01, all older
  than the finding). Rule 103.5 has each player declare in turn order; `beginMulligans` (`game.ts`) asks in
  parallel, and changing it is a design call. Rule 103.5c gives the free mulligan to multiplayer and
  Brawl; `COMMANDER_RULES` gives it at two players too. Rule 103.6b keeps a revealed opening-hand card
  revealed until the first turn begins; the engine reveals it once.
- **An opponent-caused discard's replacement beats the graveyard ones without asking** (found
  2026-11-01). Rule 616.1 lets the affected object's controller choose among replacement effects. With
  Obstinate Baloth, Dodecapod or Quagnoth discarded under Leyline of the Void, `game.ts` (~43286)
  always takes the battlefield. Almost always the choice a player would make, but not asked.
- **Goad's defender narrowing ignores attack caps** (found 2026-11-01, unconfirmed by a test). Rule
  508.1d maximises requirements obeyed within restrictions. `decisions/attackers.ts` narrows a goaded
  creature's defenders without reading `combat/limits.ts`, so a second goaded creature facing a full
  Crawlspace isn't sent at its goader. Related: `withinBlockCompany` (`combat/blocking.ts`) can reach
  an empty set for two Lured menace attackers under Caverns of Despair, which may be refused. And a
  global block limit (`blockersLeft`, `combat/limits.ts`) goes to whichever defender is asked first.
- **A spell needing two target-keyed reductions at once is refused** (found 2026-11-01). Rule 601.2f
  totals the cost after targets are chosen, so two targets that each earn a reduction both count.
  `reducingTargetsNeeded` (`game.ts`) guarantees only one earning target in the offer, so a multi-target
  spell affordable only with both (two Spellwild Ouphes, say) is refused at the cast: a legal play
  missing, never an illegal one allowed. Narrow; no proving card reaches it.
- **Limited-duration control of a player** (found 2026-11-01). Rule 723.2: Word of Command and
  Opposition Agent control a player for less than a turn. `player-control.ts` holds a next turn or a
  next combat, not these; Word of Command is on the stale list and needs its own narrow key.
- **`exile-all` and `damage-all`'s `except` spare a whole token stack** (found 2026-11-01). They
  compare the stack's id, so a token stack as the source is spared whole, where `destroy-all`'s
  `exceptSource` spares one token and takes the rest. Representation must not change a result.
- **A must-block creature's only companion can't legally join it** (found 2026-11-01).
  `withinBlockCompany` (`combat/blocking.ts`) can answer with an illegal `[]` when a creature that
  must block needs a companion (Craven Hulk's restriction) and its only companion can't join it, as
  with an attacker that can't be blocked by more than one. A person would have no legal declaration
  (rule 509.1c). Untested.
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
- **"Creatures it blocked this turn" has no record.** `CardFilter.blockingRelation`
  (`filter.ts`, `inBlockingRelation`) reads the blocks as they stand — `blockedAttackersOf`, or a
  partner's `lastKnown.blockedAttackers` once it has left — which is exact for "creatures blocked
  by this creature" (a creature removed from combat is no longer blocked by it, rule 506.4). Defiant
  Vanguard's "destroy it and all creatures it blocked this turn" also counts an attacker it blocked
  that has since been removed from combat, so it needs a per-turn record on the blocker of the
  attackers it was declared blocking (509.1g), kept like `saddledThisTurn`. Blocks: Defiant Vanguard.
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
- **An activation count restarts on a control change.** The `activated-this-turn { atLeast }`
  condition (2026-11-01) counts in `GameState.abilityActivationsThisTurn` keyed by
  `abilityTurnKey`, the object's timestamp. The agent that built it reports the engine gives a
  permanent a new timestamp when it changes control — no rule asks for one (613.7d–e), and the
  permanent is still the same object (400.7 is about zone changes) — so Dragon Whelp's "if
  this ability has been activated four or more times this turn" counts from zero under its new
  controller. `timesEachTurn`'s own limit is per object and survives it (tested). Fix: key on the
  object id and its zone stint. Also: several existing comments cite "rule 602.5g", which the
  2026-09-25 rules don't have (602.5b is the activation-limit rule).
- **A text change misses a token's colours and a resolving spell's colour change.** The
  `change-text` effect (`text-change.ts`, 2026-10-31) changes every colour word and basic land type
  in an object's rules text, but a token created by the changed text ("create a white Soldier"
  made "blue") keeps its token definition's colours, where the changed words define the token
  (rules 612.1, and 612.4: a token's characteristics are defined by the ability that made it). Separately, `Game.becomeColor` on a permanent spell (Deathlace on a creature spell) is
  dropped as the spell resolves, where 400.7a carries a change to a spell onto the permanent; the
  text change already carries over as a `castRider`, the way to fix it. And no static changes
  the text of every object (Swirl the Mists), though `cards:needs -- --stale` lists it freed.
  Reported by the overnight agent that built text changes; not yet reproduced in a test.
- **A spell's copy keeps none of its cost references.** Rule 707.10: a copy copies "all
  decisions made for it, including … additional or alternative costs", so a copy of Fling deals
  the sacrificed creature's power, and a copy of Volrath the Fallen's or Induce Despair's effect
  reads the discarded or revealed card. `copySpellFrom` (`game.ts`) copies the spell's
  characteristics, targets and X but not its `LastKnownRefs` (`sacrificed`, `discarded`,
  `revealed`), so the copy reads 0. Reported by the overnight agent that built the revealed-card
  cost (2026-10-31); not yet reproduced in a test. Fix: carry the refs onto the copy.
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
- **Granted statics and cost changes, untested.** Since 2026-11-05 (Caduceus, Staff of Hermes)
  `Game.staticsOfSource` lists a permanent's granted statics after its own, so damage
  replacements and prevention, cost modifications, play permissions and prohibitions all read
  them. Only prevention is proved by a card. Acolyte of Bahamut
  (`static:granted-static-cost-modification`) likely runs through the same path; an untested draft
  is at `engine/.cache/acolyte-of-bahamut.ts.draft` on the PC. Arterial Alchemy and Dancer's
  Chakrams need checking the same way; Lymph Sliver needs absorb (rule 702.64).
- **A split card's two names aren't both compared.** `sameNameAsAny` (built 2026-10-31) compares
  one name, so a split card's second name (rule 201.2a) never matches "the same name as".
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
- **"Add one mana of the chosen color" with no colour chosen adds any colour.** `add-mana`'s
  `"chosen"` (`effects.ts`, around line 9232) falls back to `"any-color"` when its source has
  no `chosenOnEnter` colour; Shimmerwilds Growth's ruling says it adds no mana then. Only an
  object that never entered the way that asks can reach it (a copy of the Aura made some other
  way, an object becoming one), so it's rare. Heraldic Banner and Big Apple, 3 a.m. rely on the
  same fallback. Fix: add nothing for an unchosen colour, after checking no card means the
  fallback. Found by batch 249's group A.
- **A permanent spell's changed characteristics don't follow it onto the battlefield.** Rule
  400.7a: effects from spells and abilities that change the characteristics or controller of a
  permanent spell on the stack continue to apply to the permanent it becomes. `moveObject`
  (`game.ts`, `keptPrototype`, around line 37680) keeps only a stack object's `prototype` and
  `castRider` modifiers as it moves to the battlefield, so a `become-color` on a creature spell
  ("Target spell or permanent becomes white until end of turn") is gone on arrival. Blind Seer
  (in the pool) has the ruling and is wrong for a permanent spell; Crimson Wisps-style
  "spell or permanent" colour cards likely too. Keep a modifier set on the stack by a resolved
  effect (not a static's) across that one move. Found by batch 244's group A; blocks
  Eight-and-a-Half-Tails (`effect:spell-color-change-carries-to-permanent`).
- **A mana ability with a `discard` cost never pays it.** In `game.ts` the mana-ability branch of
  ability activation resolves the ability and returns (around line 15359) before the discard cost
  is paid (around line 15521), and legality doesn't refuse it the way it refuses an
  `exileFromGraveyard` cost on a mana ability ("mana ability can't exile cards from a graveyard
  yet", around line 14971). So "Discard a card: Add {B}" would add mana for free. Rule 602.2b
  has the whole cost paid; refuse it until it's paid. Found by batch 236; blocks Skirge Familiar
  (`cost:mana-ability-discard-cost`).
- **A delayed "whenever" on a batched damage event fires once per source.** A `DelayedWhenever`
  on `deals-damage-batch` goes through `fireWheneverWatchers`, which has none of the
  `damageBatch` grouping a permanent's own triggers get (rule 603.2c: one trigger per player dealt
  damage in the batch), nor their per-card handling of `put-into-graveyard`. Found by batch 237's
  group E: Aphelia, Viper Whisperer's delayed trigger halved a player's life twice when two Snakes
  connected (18 to 4, where 9 is right). Jace, Cunning Castaway (in the pool, same `whenever`)
  likely draws and discards once per connecting creature, not once per player; not yet checked by
  a test. Blocks Aphelia and Forth Eorlingas! (`effect:delayed-whenever-batched-damage`) and
  Duskmantle Guildmage (`effect:delayed-whenever-per-card-graveyard`).
- **A threshold-gated granted dies trigger doesn't look back.** A `grantsTriggered` static
  with a `condition` (threshold) is checked after the event when the granting permanent stays on
  the battlefield and another creature dies, so the creature whose death makes the seventh card
  in the graveyard still triggers it. Rule 603.10a says a leaves-the-battlefield trigger looks
  back to just before the event, and Decaying Soil's ruling says threshold must already be met.
  Reborn Hero is right, its own death being the event. Found by batch 225's group C; blocks
  Decaying Soil (`trigger:conditional-grant-look-back`).
- **An emblem's static applies only as a creatures-you-control anthem.** `characteristics.ts`
  (the emblem loop after the battlefield statics, "Only the `creatures-you-control` scope is
  supported") skips an emblem whose `affects.scope` is anything else. Nissa, Who Shakes the
  World is in the pool with a −8 emblem written `scope: "filter"` (lands you control, grant
  indestructible), so that emblem does nothing: a wrong card until the scope is read (or the card
  comes out). Found by batch 235's group E, whose Elspeth, Knight-Errant ("Artifacts, creatures,
  enchantments, and lands you control have indestructible") was tested and destroyed. Blocks
  Elspeth (`effect:emblem-static-abilities`); Nissa is the only pool card with such an emblem.
- **A look-and-choose's `then` loses `"that-player"`.** Inside a `for-each-player`, a
  `look-and-choose` with `player: "that-player"` applies its `then` as the player who chose, in a
  context without the enclosing loop's player binding (game.ts, where the choice's `then` is
  applied), so `who: "that-player"` in the `then` reaches nobody and does nothing, silently.
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

- **A spell filter's `targets` never matches a copy of a spell.** `spellTargetsMatch`
  (filter.ts) returns false for any stack object whose `kind` isn't `"card"`, so a copy of a
  spell (rule 707.10) that targets you, or a permanent, is never "a spell that targets you": Dawn
  Charm's "counter target spell that targets you" and Shell of the Last Kappa's "exile target
  instant or sorcery spell that targets you" can't be aimed at a copy, though a copy is a spell
  (rule 707.10) with the copied targets. Found 2026-10-26 authoring Shell of the Last Kappa (B212).
  The fix reads a copy's own `targets` the same way.

- **Splice's limits.** Splice (rule 702.47, `CardDefinition.splice`, `Game.spliceFits` and
  `castSpellActions` in game.ts) is offered only onto a spell with one plain `effect` — not a
  modal (`castModal`), fused, divided or `resolve` spell, where the spliced text has no place to
  go yet — and never on an overloaded cast; every set of splice cards in hand is its own
  variant, so at most `Game.MAX_SPLICE_OFFERED` (four) are offered at once. A non-mana splice
  cost (Horobi's Whisper's "exile four cards from your graveyard", Veil of Secrecy's "return a
  blue creature you control") isn't paid: `cost:splice-non-mana`. Found building splice
  (B202, 2026-10-26).

- **Flashback never offers a split card's halves.** A split instant or sorcery in a graveyard
  that has or gains flashback (Snapcaster Mage, Past in Flames — rule 702.34a) may be cast as
  either half for that half's flashback cost (709.3: only the half cast is evaluated; Past in
  Flames' "equal to its mana cost" is the half's). The flashback offer loop in
  `Game.legalActions` (game.ts, "Flashback (rule 702.34)") casts `cardName` — the whole card,
  face 0 — rather than each of `castableFaces`, so no half is offered, and the whole is
  refused. Found 2026-10-26 while testing fuse (B173): nothing is cast wrongly, the cast is just
  never offered. The fix offers each half with its own cost when the grant's cost is
  `"mana-cost"`.

- **A source of damage: a waiting effect's object and the command zone.** Rule 609.7a also allows
  an object a waiting replacement or prevention effect or a delayed trigger refers to, and a
  face-up object in the command zone. `chooseDamageSource` (game.ts) offers permanents, spells,
  and the departed source of an ability on the stack (picked by its stack entry), not those.
  No pool card is known to need them.
- **`each-player-may` with `choices` drops the controller's own choice.** The `choices` form
  hands each chooser a `choose-modes` decision with `modesController: controller`
  (game.ts, the `each-player-may` resolver), but `beginModesChoice` keeps `modesController`
  only when it differs from the chooser (`ability.modesController !== controller`). For the
  controller's own choice it is dropped, so the resolution context gets no `player` in
  `lastKnownRefs` and an option's `"that-player"` names no one: the controller's chosen option
  does nothing. Every pool card using `choices` today is `each-opponent` (Sycorax Commander),
  so none hits it; Truce (batch 160) is authored on the `effect` form around it. The likely fix
  is to keep `modesController` whenever it's set; it needs a test with an `each-player`
  `choices` spell.
- **A cast prohibition reads the card, not the face or half being cast.** `whyProhibitedFromCasting`
  (`game.ts`) tests the card object's characteristics, so a split card's half (rule 709.3: Fire //
  Ice's half has mana value 2), an Adventure (715.3), an MDFC's back face (712.11) or a bestowed
  Aura spell is judged as the whole card. Found authoring Gaddock Teeg (batch 189,
  `static:prohibit-cast-by-face`); unverified whether Archon of Valor's Reach and Nikya of the Old
  Ways misjudge such spells today.
- **A mana-value cast prohibition reads an X spell before X is chosen.** On the stack an X
  spell's mana value counts the X chosen (rule 202.3e), and Sanctum Prelate's ruling has X
  chosen before its mana value is checked. `whyProhibitedFromCasting` (game.ts) matches a
  `prohibits.spells` filter against the card in hand, X as 0, so a `manaValue` prohibition bars
  an X spell at every X or none. No pool card's prohibition reads mana value today; Sanctum
  Prelate (`static:cant-cast-chosen-mana-value-with-x`, `B142.json`) waits on it.
- **"Each player discards" isn't chosen in secret.** Rule 101.4: when every player makes a choice
  at once, the active player chooses first, then the others in turn order, and then the choices
  take effect together; the rulings of Miasmic Mummy, Neheb, the Worthy and Delirium Skeins add
  "no one sees what the other players are discarding before deciding". A scoped `discard`
  (`GameState.pendingDiscards`, drained by `promptNextDiscard`) asks one player at a time and
  discards each player's cards before the next chooses, so a later player sees the earlier
  discards, and each discard is its own event. **Fix (outline):** collect every scoped player's
  choice first (rule 101.4's choose-then-act machinery, built for the Forgotten Realms set — batch
  109), hidden from the others, then discard them all as one graveyard batch. Miasmic Mummy and
  Neheb are in the pool on today's behaviour; blocks Delirium Skeins, Stronghold Rats and
  Cunning Lethemancer (`effect:hidden-simultaneous-choices`). Found by an authoring agent, 2026-10-23 (B144).
- **Blitz, dash, sneak, web-slinging and More Than Meets the Eye are offered only from the hand and the command zone.** (More Than Meets the Eye since 2026-11-07, Slicer: 702.162a lets it be cast from any zone the card may be cast from.) The same
  limit holds for sneak's and web-slinging's offers (`legalActions`' sneak and web-slinging loops,
  rules 702.190a and 702.188a allow any zone a card may be cast from). `Game.blitzCostOf` gates on
  those two zones, so a blitz card another permission lets you cast (an impulse exile, a
  graveyard grant, the top of a library) isn't offered its blitz cost there, though rule
  702.152a allows it; `Game.dashCostOf` the same (702.109a). Henzie's discount also moves only a cost's generic number, never an `{X}`
  (no blitz cost in the pool has one yet).
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
- **A target cost reduction two slots can earn is offered unrestricted.** Rule 601.2f fixes the
  cost once targets are chosen. `Game.targetReductionOptions` offers only the earning targets when
  the full price isn't affordable, but only when exactly one slot can hold one; with two (This Town
  Ain't Big Enough's "up to two", both slots any nonland permanent) it offers every target in both,
  so a cast naming two the caster doesn't control is offered and then refused for mana. Seen in the
  fuzzer (`random-demo.mjs --players 4 --seed 19` with batch 151's second half forced): Thorn of
  Amethyst made it {5}{U} against Carol's five mana. One offer can't say "at least one slot
  earns"; the fix narrows the first earning slot to the earners (no legal cast lost while the
  slots are alike, as here), and a skipped optional first slot still needs the cast refused or the
  random controller kept from skipping it. Found 2026-10-23, batch 151's checks.

**A static's own-type condition may read printed types** (suspected, 2026-11-06). Batch 266's
agent authored Romulan Bird-of-Prey (Star Trek: a Spacecraft with station; "as long as this
isn't a creature, it has hexproof") as a static with `condition: { kind: "source", filter: {
notTypes: ["creature"] } }`, and its test found the hexproof still on at 8+ charge counters,
where the station band has made it an artifact creature (layer 4). Hexproof is granted in
layer 6, so the condition should see the layer-4 types (rules 613.1d, 613.1f). Unconfirmed: the
card was dropped and the failing test went with it, so the first step is to rebuild that test
and see whether the condition, the station band, or the agent's definition is at fault. Blocks
Romulan Bird-of-Prey (`bug:static-condition-reads-printed-types`).

**An all-your-life payment is only offered at even life, 2 to 20.** Rule 119.4 lets a player pay exactly their total. `Game.offersFor` adds
those offers (K'rrik's {B}, a Phyrexian pip) at even life from 2 to 20, to spare a second enumeration, so with life already reserved by the
cost (Liesa's commander tax) an odd total isn't offered. Above 20 no offer is added; that would take more than ten pips. Found 2026-11-04.

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

**A copy of a spell loses its sacrificed, discarded and revealed cost references.** Rule 707.10: a
copy of a spell copies the choices made for it, and an effect reading "the sacrificed creature" on
the copy reads the original's. `exiled-as-cost` now carries over to a copy
(`lastKnownRefs.exiledCost`, `cost:choose-cards-as-cost`, 2026-11-02); the `sacrificed`, `discarded`
and `revealed` refs of `AmountRef` don't, so a copy of such a spell reads nothing. Found building that
family; not reported from play.

**A player can't play another player's face-down exiled card blind.** Rule 406.3a lets the effect that exiled a
card face down allow it to be played; the engine offers a linked grant only to a player who may look at the card
(`linkedCastGrantFor`, `game.ts`). Blocks Urianger Augurelt and Lobelia. Found 2026-11-02; not reported from play.

**A keyword's other cost counts the graveyard as the cast starts.** `whyCannotPayAlso` (`game.ts`) doesn't offer a
splice set where one card's sacrifice would supply the cards another's exile needs, though rule 601.2h lets costs be
paid in any order. Found 2026-11-02; not reported from play.

**A shield's `then` runs once per damage event.** A simultaneous sweep split across Refraction Trap's 3 prevention
deals its damage as two instances rather than one; the total is right (rule 615.5, the loop over `outcome.shields`
in `game.ts`). Found 2026-11-02; not reported from play.

**A token with riot is never asked.** A token enters without the riot choice and takes haste
(`entersBattlefieldReplacement`, `game.ts`), though rule 702.136a gives it the choice as it enters. Blocks Spider-Punk's
Spider tokens; Spider-Punk isn't authored. Found 2026-11-02; not reported from play.

**A tap cost's choices leave out what the mana plan taps.** `tapCostOffer` (`game.ts`) offers only what the mana payment
doesn't use, so a Sol Ring can't be tapped for a tap cost while lands pay the mana, unless its mana is floated first. Rule
601.2h pays costs in any order. Existing behaviour, more visible since lands can pay these costs. Found 2026-11-02; not
reported from play.

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

**An optional additional life payment isn't offered on a spell cast by an effect.** Defiler of
Vigor's "you may pay 2 life" is a cast offer of its own on a normal cast, but `cast-now` (cascade,
"cast it without paying") never offers it; declining is always legal, so nothing illegal happens,
but a choice the player has is missing. Found 2026-11-06, building Defiler of Vigor.

**Only the first mandatory draw replacement is offered beside an optional one.** With Abundance
and two mandatory "instead of drawing" replacements (Underrealm Lich and another), rule 616.1
lets the player pick any of them; `Game.optionalDrawReplacementAsked` offers the first mandatory
one in battlefield order, as the draw did before. Found 2026-11-06, building Abundance.
