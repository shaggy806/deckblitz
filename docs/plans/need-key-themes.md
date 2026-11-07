# Need-key themes: general engine changes under the open keys

Status: plan of record (2026-11-07), step 1 next — see *The plan* just below. The survey under it is a proposal.

The 1,831 open need keys (2,324 waiting cards) mostly fall into about sixteen engine mechanisms that cut across
their `family` prefixes. Each theme below is one general change that would turn many narrow keys into authoring work.

## The plan (2026-11-07)

Stop building keys one at a time; build the shared changes below, each ending a stream of keys. The first night run
against flagged cards bears the survey out: of 36 cards (B274), about a third needed no engine code at all.

**How every step runs.** One step a session, not four parallel agents: these steps change types every agent would
touch. Each step:

1. Adds a short design note under its theme here (the shape, where it lives, which old shapes it replaces).
2. Migrates every user of the old parallel shapes to the new one, and **deletes the old shapes**, or the next key adds
   a field to them again.
3. Teaches the bots' effect knowledge the new shape in the same step (`docs/plans/bot-effect-knowledge.md`).
4. Proves it with two or three cards, flagged Build ASAP cards first (`cards:needs -- --asap`), marks the keys it
   covers built, and leaves the rest to `author-freed`.
5. Verifies (`npm run verify`; `--full` for any step that moves a widely used type) and lands on `main`, with a line
   in `COMPLETED.md` and the step ticked here.

**The steps** (flagged cards each would prove, from the 2026-11-07 list):

1. **Key clean-up (no engine design).** Merge the duplicate keys listed under *Already built or duplicated* in
   `engine/data/needs-vocabulary.json` (one key, the other an alias; re-point the records). Try authoring the keys
   listed there as probably expressible (`keyword:devoid` already proved so with Ulalek; the
   cast-not-from-hand cost reduction would free Bilbo, Thief in the Night and Advanced Reconstruction). Run
   `author-freed` over `--stale` (Benthic Anomaly, Corrupted Crossroads, Prowling Geistcatcher, Promise of Tomorrow,
   Cold Storage, and the nine cards B274's partly covered keys left: Cass, Hand of Vengeance; Last Night Together,
   Intimidation Bolt, Boros Battleshaper, Forgestoker Dragon; Flameskull, March of Reckless Joy; Yare). Then re-count
   the themes (the counts here are ±15%) and correct this doc.
2. **One shared duration type, and timed statics** (themes 3a, 3b): the foundation for steps 3, 4 and 6. Proving
   cards: Teferi's Reproach, Willie Lumpkin, Zagorka, Emrakul, the Exigent Doom, Hall of Echoes, Frozen in Ice,
   Jace's Machinations, Yavimaya Bloomsage.
3. **A turn journal in game state** (theme 6): one read for "this turn / last turn / this game". Kid Loki, Kiora of
   Salt and Sand, Kíli the Resourceful, Captain America, Living Legend.
4. **Declarative event triggers with "first time / nth each turn" modifiers** (theme 2). The connive cards (Glorious
   Purpose, Ultron, Unlimited, Iron Monger, Leader, Super-Genius), Elrond, Moon-Reader, Avatar Aang, Way of the Mind
   Sculptor, Tamiyo, Upriser Crowned.
5. **Object sets and one aggregate** (theme 1, with theme 15's captured context). Synthetic Destiny, Thorin,
   Mountain-king, Brass Infiniscope, Captain Marvel, Apex Avenger.
6. **The cost pipeline (theme 4), then one `chooser` field (theme 5).** The power-up cards (Hulk, Gamma Goliath; Kang
   the Conqueror; Wonder Man; Advancing the Spirit), Baron Helmut Zemo, Dawnhand Dissident, The Dominion Bracelet,
   World War Hulk, Eumidian Wastewaker.
7. Then the survey's build order below from step 8 on (refs and relational filters, play permissions, "instead"
   replacements, combat records, the smaller themes).

## How this was measured

- **Open keys and cards:** each unimplemented card's newest record (`latestByCard` in
  `engine/scripts/needs-vocabulary.mjs`), with its needs resolved through the aliases, minus meta and `built` keys.
  That leaves **2,324 cards and 1,831 open keys**. **1,415 keys block one card each.** Only 121 cards have two or more
  open needs (2,203 have exactly one). So a theme's card count is close to what building it frees on its own, and
  the counts nearly add up.
- **Themes** come from the key names (prefix ignored), checked against descriptions and a sample of Oracle text. Each
  key goes to the first theme that matches, so the counts are **approximate (±15%)**. "Cards" means cards with a key
  in the theme. It does not mean the general change frees all of them: each theme gives a confidence and a realistic
  share.
- **Records overstate what's missing.** On past evidence, about one key in five needs no engine code, and several
  keys below look that way (see *Already built or duplicated*). Before building, try writing two or three of a
  theme's cards against today's vocabulary (`card:find`, `card:vocab`).
- The vocabulary's 617 `groups` (Phase 1 step 1.3) merge keys *within* a family. The themes here run *across*
  families, so the two don't compete. Tagging each key with a `theme` would let `--greedy --groups` score them.

## The pattern behind most themes

The engine grew by **adding one optional field per card**, in several parallel vocabularies that each say part of the
same thing:

| What | Separate shapes today |
|---|---|
| Durations | `PtDuration` (effects.ts:370), `CopyUntil` (:427), `UntilPointDuration` (:435), `ImpulseDuration` (:2235), `PlayerEffect.expires` (state.ts:5728), `CopyEnds` (state.ts:1893), `AttackRequirementRule.duration` (state.ts:5982), `DelayedWheneverWatch`'s flags (state.ts:5148), and ad-hoc unions at effects.ts:611, 1901, 6837, 6898, 10024 and 12332. effects.ts has 42 `duration`/`until` fields. |
| Amounts | `EffectAmount` (effects.ts:683, ~120 fields), `CostReductionAmount` (abilities.ts:909, a smaller copy of it), `AggregateSpec` (filter.ts:3234), and `thisWay`'s own `sumOf`/`greatestOf` (effects.ts:1303). |
| Object references | `EffectTargetRef` (effects.ts:84), `AttachHostRef` (:105), `AttachRef` (:126), `AmountRef` (:357), `DamageFrom` (:1855), `PlayerScope` (:2037), `EffectPlayerRef` (:2143), and `LastKnownRefs`' per-set fields (state.ts:2496). |
| Rule-changing effects | `StaticAbility` (define.ts:2031, **149 optional fields**), `PlayerEffect` (state.ts:5726, ~45 fields), `GameState.turnProhibitions`/`turnRestrictions`/`hexproofPlayers`/`hexproofFromPlayers` (state.ts:6686-6822). |
| Turn history | `TurnHistory` (state.ts:4972, ~35 hand-added lists and counters), ~15 `*ThisTurn` fields on `PlayerState`, and 20 `TurnStat`s (define.ts:730). |
| Play permissions | `GameObject.impulse` (state.ts:701, 17 fields), `PlayerEffect.castFromGraveyard`/`playFromHandsOf`/`playLandsFromGraveyard`, `StaticAbility.castFromGraveyard`/`playFromGraveyard`/`playFromLibraryTop`/`castFromLibraryTop`/`playFromExile`/`grantsToGraveyard` (define.ts:2898-3782), and the cast-now asks. |

So most keys don't need a new mechanism. They need one feature that exists in vocabulary A to be available in
vocabulary B: a duration that `PlayerEffect` lacks but `PtDuration` has, an amount that `EffectAmount` has but
`CostReductionAmount` lacks, a static that exists only as a static and not as a one-shot effect. Each general change
below **replaces a parallel shape with one shared type**. Doing that once ends a whole stream of keys.

## Themes, ranked by cards

| # | Theme | Keys | Cards | Realistic reach | Confidence |
|---|---|---|---|---|---|
| 1 | Object sets ("this way", linked, cost-paid, batch) + one aggregate | 215 | 280 | ~150 | medium |
| 2 | Declarative event triggers + generic trigger modifiers | 170 | 237 | ~140 | high |
| 3 | One rule-effect vocabulary: shared durations, timed statics, prohibitions | 168 | 235 | ~130 | high |
| 4 | Cost pipeline: modifiers take `EffectAmount`, effects as costs | 117 | 163 | ~80 | medium |
| 5 | Who chooses: a uniform `chooser`, per-player rounds | 123 | 148 | ~60 | medium |
| 6 | Turn/game event journal with a query read | 112 | 143 | ~100 | high |
| 7 | References and relational filter clauses | 108 | 143 | ~70 | medium |
| 8 | One characteristics patch for copy exceptions, "becomes" and animate | 117 | 148 | ~60 | low-medium |
| 9 | Replacement effects with an arbitrary "instead" | 102 | 123 | ~60 | medium |
| 10 | One play-permission record | 80 | 112 | ~60 | medium |
| 11 | Combat requirements and restrictions as data | 64 | 93 | ~45 | medium |
| 12 | Random results as recorded, triggerable events | 59 | 80 | ~45 | medium |
| 13 | Mana: spent-mana queries and mana-ability hooks | 57 | 80 | ~35 | low-medium |
| 14 | Attachments: any host, any attachee reference | 35 | 54 | ~30 | medium |
| 15 | Delayed triggers: any step, any player, captured context | 32 (+~20 counted under 1 and 2) | 41 | ~30 | high |
| 16 | Grants: any keyword with parameters; trigger multipliers by cause | 36 | 38 | ~25 | medium |
| — | Counters (folds into 1, 2 and 6), face-down/phasing/meld mechanics, singletons | ~236 | ~300 | — | — |

"Realistic reach" is a judgement: the cards whose key is fully covered by the change as described, from the
descriptions sampled. Overall, a general change frees about half of its theme's cards. The rest each need a small
extra option, but one sitting on the new type instead of a new parallel shape.

---

### 1. Object sets and one aggregate (215 keys, ~280 cards)

**Change.** Introduce one `ObjectSetRef`: a named set of objects with how each one was then (an LKI snapshot or a
zone-change-count stint). Its sources:
- `{ thisWay: ThisWayKind }`: what the resolution under way did;
- `{ paid: "sacrificed" | "exiled" | "discarded" | "tapped" | "revealed" | "returned" }`: the cost's objects;
- `"exiled-with-source"`: rule 607 linked exile;
- `"trigger-batch"`: "one or more … them";
- `"attached-to-source"`;
- a target group;
- `"created"`;
- `{ remembered: name }`: a set or value stored on the permanent or carried into a delayed or reflexive trigger.

Every consumer takes it:
- `AggregateSpec` gets `in: ObjectSetRef` beside its zones, plus `min` (it has only sum, max, distinct and count —
  filter.ts:3234);
- a CardFilter clause `inSet` and "shares X with a member of";
- an effect's object (`create-token-copy.of`, `return`, `exile`, `put-counters`);
- `delayed-trigger` / `reflexive` capture (copy the set into the trigger as plain ids and stints).

Add a `PlayerAggregate` over players for "highest/lowest life total", "the fewest", and "each opponent who …".

**Keys (top):** amount:attached-to-source-last-known 6, bug:cda-cards-exiled-with 4, bug:cda-sum-of-counts 4,
cost:exiled-card-ref 4, effect:cost-exiled-cards-this-way 4, amount:highest-life-total 4,
amount:revealed-card-mana-value-keep-targets 4, filter:shares-creature-type-with-this-way 3,
condition:filter-total-power-toughness 3, cost:cost-move-linked-exiled-card 3, effect:keep-count-equal-to-fewest 3,
effect:delayed-count-done-this-way 3, effect:damage-batch-those-creatures 3, decision:choose-from-batch 3,
amount:total-power-sacrificed-as-cost 3, effect:return-linked-under-your-control 3; then 170 one-card keys
(`amount:greatest-power-this-way`, `amount:exiled-with-source-power`, `effect:token-copy-of-sacrificed`,
`static:keywords-of-linked-exile`, `amount:min-of-amounts`, `effect:max-of-amounts`, …).

**Existing machinery.**
- this-way.ts reads the resolution's events since `GameState.resolutionSince` (`eventsSince`, this-way.ts:40;
  `ThisWayEntry`, :17), behind the `thisWay` amount, which has its own `sumOf`/`greatestOf` (effects.ts:1279-1309).
- `AggregateSpec` folds over zones only (`AggregateZone` = battlefield, graveyards, exile, attackers).
- Linked exile is `GameObject.exiledWith`/`linkedExile` (state.ts:1470, 1479).
- Cost objects reach effects through `AmountRef`'s single-object `"sacrificed" | "discarded" | "exiled-as-cost"`
  (effects.ts:357) and `LastKnownRefs.sacrificed/discarded/exiledCost/revealed/tapped/attackedTogether/enteredTogether`
  (state.ts:2496), one field per set.

**Missing:** this-way sets don't outlive the resolution (so a delayed trigger can't count them), cost-paid sets are
single objects, and the aggregate can't take a non-zone set.

**Risks.**
- Each member must be read as it was: rule 608.2h for information from the game, 603.10a for look-back triggers,
  400.7 for a moved object being a new one.
- Linked abilities are only those printed on the same object (607.1, 607.2a, and 406.6 for "exiled with").
- Token stacks must count every token in a set (engine/CLAUDE.md).
- The set goes into state as plain arrays of `{object, stint}`.

**Confidence: medium.** The amounts and filters reduce cleanly. The effects that act on a set ("return the other",
"an opponent chooses one of the exiled cards") still each need their verb.

### 2. Declarative event triggers and generic modifiers (170 keys, ~237 cards)

**Change.** Add one `TriggerSpec` member,
`{ on: "event", event: GameEvent["type"], player?: PlayerRelation, object?: CardFilter, cause?: PlayerRelation, value?: field }`.
It matches any logged event, with the relation to the ability's controller ("you", "an opponent", "enchanted player",
"that player"), and reads its amount into `triggerValue`. Lift the per-kind flags into one wrapper on every
`TriggerSpec`: `firstTimeEachTurn`, `nthEachTurn`, `oncePerTurn` / "do this only once each turn" (rule 603.2h), and
an intervening-if (603.4). That wrapper reads the event journal (theme 6).

**Keys (top):** trigger:activates-mana-ability 6, trigger:counters-put-first-time-each-turn 5,
trigger:player-loses-game-trigger 5, trigger:proliferate-trigger 4, trigger:becomes-crewed-trigger 4,
trigger:becomes-monarch 4, trigger:energy-gained 4, trigger:phases-in 4, trigger:you-tap-opponent-creature 3,
trigger:combat-damage-to-you-trigger 3, stat:once-per-turn-trigger 3, trigger:trigger-from-exile 3,
trigger:loses-life-first-time-each-turn 3, trigger:phases-out 3, trigger:opponent-shuffles-library 3,
trigger:player-puts-onto-battlefield 3; then 130 one-card keys (connives, investigates, solves-case, gives-gift,
destroyed, pays-life, untap, activates-boast, …).

**Existing machinery.**
- `TriggerSpec` (abilities.ts:1076) has 88 hand-written `on:` kinds, each matched in `Game.triggerMatches`
  (game.ts:30150-30972, ~820 lines) from `detectTriggers` (game.ts:28818).
- **The events these keys want are already emitted**: `proliferated`, `energy-changed`, `monarch-changed`,
  `library-shuffled`, `permanents-phased-in`/`-out`, `player-lost`, `case-solved`, `gift-promised`, `permanent-tapped`,
  `permanent-destroyed`, `coin-flipped`, `dice-rolled`, `explored`, `foraged`, `evidence-collected` (events.ts).
- There is even an escape hatch, `{ on: "predicate", match }` (abilities.ts:2697). It is used by **no** pool card,
  because it has no `self`, controller or trigger value, and the bots and text tools can't read it.
- `firstTimeEachTurn` is re-implemented per kind (abilities.ts:1291, 1477, 1613, 1795, 2119, 2248, 2436), and
  `nthEachTurn` exists once (:1439).

**Risks.**
- Batched events: "one or more" means one trigger per event, and `withLeaveBatch`/`withCounterBatch` already exist.
- Look-back triggers (603.10a).
- The bot's effect knowledge (`effect-worth.ts`, `docs/plans/bot-effect-knowledge.md`) values triggers by kind and
  would need a generic arm.
- Keep `triggerMatches` hot-path cheap: index specs by event type.

**Confidence: high.** Most of these keys name an event the engine already logs.

### 3. One rule-effect vocabulary: shared durations, timed statics, prohibitions (168 keys, ~235 cards)

**Change, in three parts.**

**(a) One `Duration` type.** Every effect that lasts should take the same union, anchored to any player reference:
- `end-of-turn`, `end-of-combat`;
- `{ untilTurnOf: PlayerRef, edge: "start" | "end" }`: your next turn, "that player's next turn", "during their next
  turn";
- `{ untilStep, of }`;
- `rest-of-game`;
- `{ while: Condition }`: while you control the source, while it's tapped, while the monarch, "since activation";
- `{ untilEvent }`: rule 610.3's "until".

It would replace the ten-plus unions listed above, and let `PtModifier`, `PlayerEffect`, `ControlEffect`,
`AttackRequirementRule`, impulse permissions and delayed "whenever" watches share one expiry check.

**(b) A timed static.** An effect that creates a continuous effect equal to any `StaticAbility`, sourced from the
resolution, with a `Duration`. Model it as a duration-bounded emblem: `create-emblem` (effects.ts:9011) already lays
a static from a player-owned object, but only forever, and `grant-static` (effects.ts:7229) only onto permanents.
"Until your next turn, your opponents can't gain life", "players can't gain life this turn", "creature spells can't be
countered this turn", "permanents you control gain hexproof this turn", "the legend rule doesn't apply this turn" and
"until end of turn, spells your opponents cast cost {1} more" all become the existing static with a duration.

**(c) One prohibition/permission predicate.**
`{ who: PlayerRef/filter, action: cast | activate | attack | block | gainLife | loseLife | payLife | sacrificeForCost | causeDiscard | causeSacrifice | target | untap | enter | phaseIn | transform | copy | counter, object?: CardFilter, by?: PlayerRelation }`.
It is checked at the existing gates. It would replace `StaticAbility.prohibits` (define.ts:2464),
`PlayerEffect.cantCast` (state.ts:5751), `turnProhibitions` (state.ts:6686), `cantCastSpellsForGame` and the
narrower "can't" fields.

**Keys (top):**
- static:dont-lose-for-zero-life 6, effect:player-cant-attack-you-next-turn 4, keyword:hexproof-from-monocolored 4,
  static:ignore-hexproof 4, static:spell-cant-be-copied 4;
- replacement:damage-multiplier-this-turn 3, effect:player-effect-until-target-next-turn 3,
  static:graveyard-enter-prohibition 3, static:player-shroud-static 3, static:opponent-cant-cause-sacrifice 3,
  static:cant-become-untapped 3, static:prohibit-cast-from-graveyard-or-library 3, static:counter-cap 3;
- effect:opponents-cant-gain-life-this-turn 2, effect:players-cant-gain-life-this-turn 2,
  effect:player-cant-gain-life-for-game 2, effect:temporary-opponent-spell-tax 2, effect:grant-replacement-until-eot 2,
  effect:duration-this-combat 2, effect:restrict-this-combat 2, effect:pt-until-end-of-combat 2,
  duration:while-source-tapped-since-activation 2, static:prohibit-outside-own-turn 2;
- about 120 one-card keys.

Sample: Teferi's Reproach needs exactly `PlayerEffect`'s `protectionFromEverything` + `lifeCantChange`, lasting
"until **that player's** next turn". `expires` knows only the effect owner's (`your-next-turn`).

**Existing machinery.** `PlayerEffect` (state.ts:5726: five expiries, ~45 optional rule fields), `StaticAbility`
(define.ts:2031), `grant-static`, `create-emblem`. The layer fold already handles static timestamps (613.7a).

**Risks.**
- **Rule 611.2c:** a resolution's effect that changes characteristics or control locks its set of objects when it
  begins, while a rule-modifying one ("players can't gain life") applies to whatever comes later. A timed static
  must lock its `affects` for characteristic changes only.
- 611.2b: a "for as long as" that never starts does nothing.
- 514.2 ends "this turn" effects in cleanup.
- 119.7/119.8: can't gain or lose life also stops exchanges.

**Confidence: high.** Most of these keys exist today in one form (static, or for one player) and are missing in
another.

### 4. Cost pipeline (117 keys, ~163 cards)

**Change.**
- **(a)** `costModification` / `abilityCostModification` / `alternativeCostForSpells` take an `EffectAmount`,
  evaluated with the spell or ability as context, instead of `CostReductionAmount` (abilities.ts:909: ~25 members that
  re-implement `EffectAmount`'s). Add a spell-context filter (cast from zone or not, kicked, first each turn, targets
  X), and a count limit ("the first … each turn") read from the journal.
- **(b)** **Effects as costs:** an `AbilityCost` part `{ do: EffectSpec }` for any action the effect vocabulary
  already has: forage, put a card from hand on top, put this on the bottom, pay X energy, roll a die, return to hand,
  exile from graveyard with a total. Its paid objects go into theme 1's `{ paid }` set. This replaces the 31 bespoke
  `AbilityCost` parts (abilities.ts:308) growing one by one, and the spell side's `AdditionalCostOption`
  (define.ts:243).
- **(c)** **Keyword costs with parameters** (kicker X, replicate granted with a cost, multikicker modes).

**Keys (top):** static:grant-replicate 5, keyword:kicker-x 4, cost:alternative-cost-for-spells-limits 4,
cost:cost-reduction-cast-not-from-hand 4, cost:choose-creature-type-as-cast 4, keyword:kicker-any-number-of-modes 3,
cost:pay-x-energy 3, cost:forage 3, effect:pay-any-amount-of-mana 3, keyword:scavenge 3,
cost:put-card-from-hand-on-library-top 3, cost:escalate-nonmana 2, cost:put-self-on-library-bottom 2,
cost:alternative-cost-for-all-spells 2; 87 one-card keys (`cost:cost-reduction-per-*`, `cost:x-fixed-by-*`,
`cost:exile-from-graveyard-*`).

**Existing machinery:** `costModification` (define.ts:3965, already a `CardFilter` with `castFrom`),
`abilityCostModification` (:4082), `AbilityCost` (abilities.ts:308), the mana-payment planner (pure, mana-payment.ts).

**Risks.**
- Rule 601.2f fixes the total cost, and reductions apply after increases.
- An effect used as a cost must be payable in full before it's paid (118.1 ff.): the payability check is the hard
  part.
- An action cost decided mid-cast has to be a dispatched decision (decision registry).

**Confidence: medium.** (a) is mechanical; (b) is a real refactor.

### 5. Who chooses (123 keys, ~148 cards)

**Change.** A uniform `chooser: PlayerRef` on every effect that makes a choice (choose permanents, choose from a zone,
look-and-choose, piles, modes, damage division, creature type or colour, the order of the library bottom). Add one
**per-player round** combinator, "each player [in APNAP order] does X, then …", with a bound "that player" for the
body and "repeat until a round in which nobody acts".

Today `chooser` exists on about 14 effect kinds with six different types: `EffectPlayerRef | "an-opponent"`,
`PlayerId`, a slot number, `"that-player" | "an-opponent"`, `"their-controller"`, `chosenBy: "you"`
(effects.ts:242, 251, 2585, 3869, 5501, 9422, 9738, 9792, 9838, 9873, 10474). COMPLETED.md shows these were added
family by family.

**Keys (top):** effect:each-player-returns-own-permanent 4, decision:choose-creature-type-on-resolution 3,
decision:mixed-zone-targets 3, decision:damage-redirect-order 3, effect:separate-exiled-cards-into-piles 3,
decision:pay-per-chosen-untap 3, effect:player-chooses-permanents-to-exile 2, effect:target-per-opponent-mandatory 2,
mechanic:piles 2, mechanic:secret-choice 2, decision:opponent-guesses-mana-value 2,
mechanic:coin-flip-by-other-player 3, effect:keep-count-equal-to-fewest 3; 104 one-card keys.

**Existing machinery:** every decision already names its player (`player-control.ts`, engine/CLAUDE.md), so the
decision layer supports any chooser. The limit is that each effect kind hard-codes its own.

**Risks.** Hidden information: a chooser who sees a hidden zone (`view.ts` redaction). Rule 608.2c's order of
instructions. Secret and simultaneous choices are a separate decision kind.

**Confidence: medium.** The chooser field is mechanical. The per-player round is the general combinator that most of
the "each player chooses … then" keys need.

### 6. Turn and game event journal (112 keys, ~143 cards)

**Change.** Replace the hand-grown `TurnHistory` lists and the `*ThisTurn` counters with a **compact journal kept in
state**. Each entry is a normalised record `{ kind, player, controller?, object?, stint?, was?: LKI-lite, from?, to?,
amount?, source? }`, appended where the events are emitted. Keep this turn's, last turn's (or "since your last turn"),
and a small whole-game summary.

One read, `{ history: kind, window: "this-turn" | "last-turn" | "since-your-last-turn" | "this-game", who, filter,
count | exists | sum }`, then serves conditions, amounts, filter clauses ("put into a graveyard this turn", "dealt
damage by this this turn", "you put a counter on this turn"), cost-reduction limits and trigger modifiers (theme 2).

**Keys (top):** condition:counters-put-by-you-this-turn 4, condition:played-land-this-turn 3,
condition:put-into-graveyard-this-turn-filter 3, condition:lost-life-last-turn 3, cost:first-equip-each-turn-free 2,
stat:loyalty-activation-tracking 2, condition:single-source-dealt-n-damage-this-turn 2,
condition:filter-fought-this-turn 2, condition:was-nth-spell-cast-this-turn 2, condition:first-spell-cast-this-game 2,
condition:came-under-control-this-turn 2, condition:source-attacked-during-your-last-turn 2,
filter:dealt-damage-to-source-this-turn 2; 86 one-card keys. The counter-placement keys under the counters heading
fold in here too.

**Existing machinery and why it's not enough.**
- `TurnHistory` (state.ts:4972) adds a field per question.
- `GameState.eventLog` (state.ts:6938) holds everything but **is emptied in every bot simulation** (`{ ...state,
  eventLog: [] }` at bot/simulate.ts:190, bot/turn-plan.ts:123, bot/determinize.ts:71, game.ts:4142). Rules can't
  read it outside a resolution, which is why the history was copied into bespoke fields.

**Risks.**
- Clone cost: bots `structuredClone` the state constantly. Keep entries small, prune at turn start, keep only last
  turn's.
- `computeCharacteristics` caching: journal reads are pure, but invalidation must follow appends.
- The LKI rules (603.10a, 608.2h) say to store "as it was", not ids.
- A partial migration: build the read beside `TurnHistory`, move readers one at a time, and delete fields only once
  their readers are gone.

**Confidence: high.** The keys are almost all "count events of kind K matching F in window W".

### 7. References and relational filter clauses (108 keys, ~143 cards)

**Change, in two parts.**

**(a) One `ObjectRef`/`PlayerRef` algebra** usable in every slot where a ref goes. Base refs are source, slot N,
trigger object, trigger player, chosen, granter, attached, set member. Composable accessors are `.controller`,
`.owner`, `.host` (what it's attached to), `.attachments`, `.defendingPlayer`, `.pairedWith`, `.formerController`.
Today there are seven ref unions (see the table at the top), each extended on its own: `effect:host-of-destroyed-target`,
`effect:defending-player-of-trigger-attacker`, `effect:draw-former-controller-of-target`,
`target:permanent-controlled-by-target-slot`, `amount:domain-of-target-player`.

**(b) Relational CardFilter clauses with a ref.**
- `sameNameAs`, `sharesColorWith`, `sharesCardTypeWith`, `sharesCreatureTypeWith` and `attachedTo` take any
  `ObjectRef`.
- `least`/`greatest` among a set.
- `hasKeyword: K` reads any keyword ability, including non-evergreen ones (`filter:has-morph`, `has-madness`,
  `has-fading`, `has-unearth`, `has-freerunning`, …: about 15 one-card keys).
- Spell-context clauses: cast from zone or not, cast with an alternative cost, entered without being cast.

**Keys (top):** condition:creature-cards-above-in-graveyard 4, filter:has-morph 4, filter:attached-to-trigger-object 3,
effect:tap-all-trigger-player-scope 3, condition:filter-has-nonmana-activated-ability 3,
effect:search-same-name-as-chosen-permanents 3, filter:aura-enchant-restriction 3, filter:origin-other-than-hand 2,
filter:same-name-as-source-last-known 2, filter:same-name-as-trigger-spell 2, filter:attached-to-source 2,
effect:look-at-trigger-player-hand 2; 81 one-card keys.

**Existing:** `CardFilter` (filter.ts:319, 139 fields) already has some relational clauses. The vocabulary's groups
list a "same name as a reference" group (six keys) inside one family, but nothing spans the families.

**Risks.** A ref that left must read LKI (608.2h). "Controller" outside the battlefield or stack is the owner (rule
109.4/109.5).

**Confidence: medium.**

### 8. One characteristics patch for copy exceptions, "becomes" and animate (117 keys, ~148 cards)

**Change.** One `CharacteristicsPatch` (set or add types, subtypes and supertypes; set colours; add or remove abilities,
keyword instances with parameters; base P/T from an amount; conditional on "if it's a creature"). It is used by:
- copy exceptions: they become part of the copiable values (rule 707.9a), which `CopyValues.modifiers: PtModifier[]`
  (state.ts:1880) carries;
- "becomes a …" / animate effects;
- `grant-static`'s layer-4 part, which "isn't applied" (effects.ts:7227).

Copying gets an `of: ObjectSetRef` (theme 1) and "a copy for each object it could target" (707.10c-style).

**Keys:**
- replacement:token-creation-replace-with-copies 3, effect:copy-next-loyalty-ability 3,
  effect:copy-spell-for-other-player 3, effect:gain-lose-all-creature-types 4, static:animate-pt-equal-mana-value 4;
- effect:copy-ability-for-each-it-could-target 2, effect:copy-spell-for-each-permanent-or-player-it-could-target 2,
  static:lose-supertype 2, effect:lose-specific-ability 2;
- the eight `effect:copy-exception-*` one-card keys, and ~90 more one-card keys.

**Confidence: low-medium.** The patch is general, but many keys here are separate mechanics.

### 9. Replacement effects with an arbitrary "instead" (102 keys, ~123 cards)

**Change.** One replacement shape: `{ event: draw | damage | die | leave | enter | gain-life | lose-life | lose-game |
counters | tokens | scry | explore | untap-step | mill | discard, match, instead: EffectSpec | { modify: amount-op }, may?,
next?/shield, duration }`. The replaced event's fields are bound as refs ("that much", "that card").

`ReplacementSpec` today is 16 event-specific interfaces (replacements.ts:39). Only the draw has a "replaced by any
effect" form (`DrawReplacedByEffect`, :665), and damage has its own `PreventionShield` (state.ts:5580) and
`PlayerEffect.damageReplacement`/`damageTo`/`nextDrawInstead`.

**Keys (top):** replacement:die-exile-with-counter 3, replacement:damage-reflection 3,
replacement:draw-replacement-reveal 3, effect:prevent-next-damage-each-creature 3,
cost:pay-any-amount-of-life-as-enters 3, replacement:energy-doubling-replacement 2, replacement:explore-replacement 2,
replacement:untap-step-remove-counter-instead 2, replacement:as-enters-mill 2, replacement:lose-game-replacement 2,
replacement:would-lose-game 2; 84 one-card keys.

**Risks.**
- 614.6: a replaced event never happens.
- 616: the affected player orders the replacements.
- 615.7: "the next N" prevention.
- Replacement loops must nest in `prepareForPriority`'s fixpoint (ROADMAP *Architecture constraints*).
- An `instead` effect that asks a decision suspends the event. That is the hard part, already solved for draws.

**Confidence: medium.**

### 10. One play-permission record (80 keys, ~112 cards)

**Change.** One record, `{ who, cards: ObjectSetRef | { zone, filter, top? }, duration: Duration, limit: once-each-turn
| one-of | count, cost: normal | free | alt | tax | pay-life, spendAs?, riders: entersTapped | entersWithCounter |
exileIfWouldLeave | grants }`, used the same way whether it comes from a static, a resolution, a cast-now or an
impulse. Today it is split across `GameObject.impulse` (state.ts:701, 17 fields), `PlayerEffect.castFromGraveyard`
(state.ts:5786), six `StaticAbility` fields (define.ts:2898-3782) and `CastNowAsk` (state.ts:3205). Each gained its own
riders.

**Keys (top):** effect:conjure 9 (outside-the-game; see Singletons), static:grant-miracle-in-hand 3,
zone:exile-hand-with-play-permission 3, zone:impulse-play-only-one 3, zone:choose-one-of-exiled 2,
zone:graveyard-play-once-shared-land-or-permanent 2, zone:exile-player-hand-play-exiled 2 (also filed as
`effect:exile-player-hand-play-exiled`), zone:cast-from-library-top-extra-cost 2, effect:allow-play-from-exile 2,
zone:play-from-graveyard-your-turn 2, static:play-from-library-top-once-each-turn 2,
static:play-from-exile-once-each-turn 2; 58 one-card keys.

**Risks.** Rule 305.1 for lands (playing a land is a special action, one per turn). 609.4 "as though". A card that
changes zones is a new object (400.7). The permission must die with it.

**Confidence: medium.**

### 11. Combat requirements and restrictions (64 keys, ~93 cards)

**Change.** One requirement/restriction record per side (rules 508.1d, 509.1c): `{ creatures: filter/ref, must |
cant, attack | block, target?: PlayerRef | "you-or-your-planeswalkers", unless?: Condition, duration: Duration }`. The
existing maximisation in `combat/` reads it. Today it is `AttackRequirementRule` (state.ts:5953, its own duration),
`StaticAbility.restrictions: CombatRestriction[]` (define.ts:531, 3720), `turnRestrictions` (state.ts:6709),
`PlayerEffect.cantAttack`, and about 20 more `StaticAbility` combat fields.

**Keys:** decision:attacker-chooses-blocks 4, static:must-attack-specific-player 4, static:block-as-though-shadow 4,
keyword:snow-landwalk 4, effect:token-enters-blocking 3, filter:creature-source-is-blocking 3,
static:must-target-flagbearer 3, static:attack-direction-restriction 2, effect:extra-combat-attack-restriction 2; 46
one-card keys.

**Confidence: medium.** The requirement solver exists. The keys are mostly new shapes of input to it.

### 12. Random results as recorded, triggerable events (59 keys, ~80 cards)

**Change.** Coin flips and dice rolls produce a result record (who, natural result, modified result, won or lost,
chosen side). It goes into the resolution's this-way set (theme 1) and the journal (theme 6). They become event
triggers (theme 2) and replaceable events (theme 9: "roll an extra die and ignore the lowest", "flip result
replacement"). Today only the last roll is kept (`GameState.lastRoll`, state.ts:6929).

**Keys:** mechanic:coin-flip-heads-tails 4, effect:random-choice-among-chosen 4, replacement:roll-extra-ignore-lowest 3,
mechanic:coin-flip-by-other-player 3, amount:coin-flips-won-this-way 2, condition:roll-result-compare 2,
mechanic:coin-flip-result-replacement 2, mechanic:planar-die 2, mechanic:coin-flip-choose-to-stop 2,
effect:flip-coins-count-until-lose 2; 42 one-card keys.

**Risks.** The fuzzer and replays depend on `RandomSource` draw order: don't draw more random numbers than the rules
call for (engine/CLAUDE.md, *Determinism*). Rules 705 and 706.

**Confidence: medium.**

### 13. Mana: spent-mana queries and mana-ability hooks (57 keys, ~80 cards)

**Change.**
- Mana provenance is built (memory, 2026-09). Expose one read over a spell's or ability's paid mana: count by colour
  or type, by source filter, "{C} was spent", "mana from a Treasure".
- Make mana production a replaceable and triggerable event: tap-for-mana multipliers and "produces colorless
  instead" (theme 9), and "whenever you activate a mana ability" (theme 2).

**Keys:** cost:depletion-counter-lands 4, static:mana-pool-reads 3, cost:spend-mana-as-any-color 3,
filter:land-could-produce-mana-type 3, effect:empty-mana-pool 3, replacement:tap-for-mana-produces-colorless-instead 3,
stat:colorless-mana-spent-condition 2, stat:mana-color-spent-count 2, effect:player-mana-ability-until-eot 2; 39
one-card keys.

**Risks.** Mana abilities don't use the stack (rule 117.1d, 605). A trigger from one is still a normal trigger.

**Confidence: low-medium.** The keys are heterogeneous.

### 14. Attachments (35 keys, ~54 cards)

**Change.** `attach` takes any `AttachHostRef` including a player (Curses: rule 303.4 lets an Aura enchant a player)
and any attachee from an `ObjectSetRef` ("each created token", "the Equipment that was attached", "auras attached to
it").

**Keys:** effect:curse-attach-player 4, effect:attach-equipment-that-was-attached 3,
effect:return-as-aura-with-granted-ability 3, effect:attach-to-chosen-creature 3, static:attach-as-granted-equipment 3,
keyword:fortify 2, effect:create-token-attached-each 2, effect:attach-equipment-to-each-created-token 2,
effect:return-aura-after-host-died 2. Existing: `AttachRef`/`AttachHostRef` (effects.ts:105, 126).

**Confidence: medium.**

### 15. Delayed triggers: any step, any player, captured context (32 keys + ~20 elsewhere, ~41 cards)

**Change.**
- `DelayedTrigger.at` becomes `{ step | phase, whose: PlayerRef | "any", which: "next" | "this-turn" }` instead of the
  10-member `DelayedTriggerTiming` (state.ts:4816): next combat phase, next main phase, next untap step, owner's next
  upkeep, chosen players' end step.
- `DelayedWheneverWatch` (state.ts:5148) already takes any `TriggerSpec`. Give it theme 3's `Duration` in place of
  its `untilYourNextTurn` / `untilEndOfCombat` / `forGame` / `whileAnyExiled` flags.
- Add an intervening-if (603.4), and a **captured context**: the creator's X, its chosen player, its this-way and
  cost sets (theme 1), as `DelayedTrigger.madeIn` already does for prevention.

**Keys:** effect:flicker-untargeted-group-delayed-return 4, effect:pay-before-delayed-deadline 4,
effect:delayed-combat-damage-that-much 3, effect:delayed-trigger-intervening-if 2,
effect:delayed-trigger-next-combat-phase 2, effect:delayed-count-done-this-way 3 (under theme 1),
`effect:delayed-trigger-reads-creator-x`, `-remembers-that-player`, `-owners-next-upkeep`, `-next-untap-step`, ….

**Risks.** 603.7b: once, unless it has a duration. 603.7c: it follows its object only while that object stays where
expected.

**Confidence: high.**

### 16. Grants: any keyword with parameters; trigger multipliers by cause (36 keys, ~38 cards)

**Change, in two parts.**
- **(a)** Keywords with parameters (replicate {cost}, madness {cost}, emerge, saddle N, miracle) become `KeywordInstance`
  values in computed characteristics that the cast pipeline reads, not definition fields. Then `grantsToSpells` /
  `grantKeywords` can grant any of them. Today there is one grant field per keyword: `grantsWarpInHand`,
  `grantsNinjutsuInHand`, `grantsCyclingInHand` (define.ts:3086), `grantsForetellInHand`, `grantsBlitzInHand`,
  `grantsOffspringToSpells`, `grantsEvokeToSpells`.
- **(b)** `doubleTriggers.cause` (define.ts:4212, a 7-member union) takes any theme-2 event class plus a source filter.
  "Additional time" then covers leaves, life-gain, attached-only, Rooms and face-up doublers.

**Keys:** static:grant-replicate 5 (also under costs), static:room-abilities-trigger-twice 2,
effect:trigger-spell-gains-keyword 2; about 30 one-card keys.

**Risk.** Rule 702 per keyword. Granted cost keywords must read the *granted* cost (Djinn Illuminatus: the replicate
cost equals the spell's mana cost).

**Confidence: medium.**

---

## Already built or duplicated: check before building

- **Probably expressible today** (try authoring first):
  - `keyword:snow-landwalk` (4) and `keyword:legendary-landwalk` (2): `StaticAbility.landwalk` is a `CardFilter`
    (define.ts:3634).
  - `keyword:hexproof-from-monocolored` (4): `hexproofFrom.filter` (define.ts:3925) plus CardFilter's
    `multicolored`/`colorless` (filter.ts:347, 351).
  - `cost:cost-reduction-cast-not-from-hand` (4): `costModification.castFrom` takes a zone list (define.ts:3965).
  - `trigger:energy-gained` (4): `counters-put` with `orPlayer` already fires on energy (abilities.ts:1386). It needs
    a players-only switch at most.
  - `trigger:counter-removed-trigger` (2): a counters-removed trigger exists (abilities.ts:1406).
  - `keyword:devoid` (3): the pool already writes Devoid as empty colours (cards/pool/drowner-of-hope.ts). Recheck
    what its three cards really lack.
  - `effect:duration-this-combat`, `effect:pt-until-end-of-combat`: `PtDuration` has `"until-end-of-combat"`; the gap
    is that only some effect kinds take it (theme 3a).
- **The same feature under two keys** (merge with aliases):
  - static:dont-lose-for-zero-life (6) = static:no-loss-for-zero-life (2);
  - replacement:lose-game-replacement (2) = replacement:would-lose-game (2);
  - trigger:you-tap-opponent-creature (3) = trigger:you-tap-opponents-creature (1);
  - cost:cost-reduction-cast-not-from-hand (4) = cost:cost-reduction-cast-not-from-your-hand (1);
  - cost:mana-ability-discard = cost:mana-ability-discard-cost;
  - effect:swap-blockers = effect:switch-blockers;
  - effect:delayed-exiled-unplayed-to-graveyard = effect:delayed-move-unplayed-exiled-to-graveyard;
  - zone:exile-player-hand-play-exiled (2) = effect:exile-player-hand-play-exiled (1);
  - the four "can't gain life" one-shots (effect:opponents-cant-gain-life-this-turn,
    effect:players-cant-gain-life-this-turn, effect:target-player-gains-no-life-this-turn,
    effect:player-cant-gain-life-for-game) are one static with four durations;
  - static:cast-from-library-top-once-per-turn ≈ zone:cast-from-library-top-once-each-turn ≈
    static:play-from-library-top-once-each-turn.
- **An unused escape hatch:** `TriggerSpec { on: "predicate" }` (abilities.ts:2697) is in no pool card. Theme 2 is its
  declarative, bot-readable replacement.

## Suggested build order

The order follows dependencies first, then cards:

1. **Shared `Duration` + timed statics (3a, 3b).** These are the foundation for 3c, 10, 11 and 15, and the single
   largest high-confidence block. Migrate `PlayerEffect.expires` first, then the rest by use.
2. **Event journal (6).** This is needed by the trigger modifiers and the cost limits. Build the read beside
   `TurnHistory` and migrate the readers.
3. **Declarative event triggers + generic modifiers (2).** Most events already exist. The bot's effect knowledge needs
   one generic arm.
4. **Object sets + one aggregate (1)**, including cost-paid sets and delayed-trigger capture (15).
5. **Prohibition/permission predicate (3c)**, now with durations.
6. **Cost pipeline (4a then 4b).**
7. **Uniform `chooser` + per-player rounds (5).**
8. **Refs algebra + relational filters (7).**
9. **Play-permission record (10), replacement "instead" (9), combat records (11).**
10. The smaller themes (12, 13, 14, 16, 8) as `--by-rank` reaches their cards.

Each step should follow the project's habit: prove it with the two or three best-ranked cards, mark their keys
`built`, and let `author-freed` take the rest. And each step should **delete** the parallel shape it replaces, or the
next key adds a field to the old one.

## Singletons and odd mechanics (not worth a general change yet)

- **Deck and format:** mechanic:rulebreaker 8 (deck copy-limit exceptions), deck:circle-colors-at-deck-construction,
  mechanic:commander-chosen-color-pregame 3.
- **Outside the game:** effect:conjure 9, effect:perpetually 1, effect:cast-from-outside-the-game,
  effect:play-from-outside-the-game. These are digital-style "outside the game" cards: a zone question and a
  product-scope question.
- **Whole mechanics:** mechanic:more-than-meets-the-eye 3, mechanic:hone-counters 3, meld-enters-attacking 2,
  mechanic:planechase, mechanic:assemble-contraptions, mechanic:stickers, mechanic:day-night, mechanic:dungeon keys,
  mechanic:restart-the-game, effect:reverse-turn-order, effect:redistribute-life-totals, mechanic:transfigure,
  mechanic:token-devour.
- **Face-down and phasing** (54 keys, ~66 cards): manifest from hands or exile, face-down piles, "can't phase in/out",
  extra beginning phases. These are per-mechanic, though phase in/out triggers fold into theme 2.
- **Library manipulation one-offs:** effect:mill-from-bottom 2, effect:fateseal 2, effect:reveal-top-any-library 3,
  exchange-hand-and-library, exchange-graveyard-and-library.
- **Small effects:** effect:double-life-total 3, effect:counter-targeting-spell-or-ability 5 (a target-spec union
  across spells and abilities: small but general), effect:search-then-act-on-found 3,
  effect:change-target-new-target-restricted 3, keyword:bloodthirst 2 (likely reducible to theme 6 plus
  enters-with-counters), keyword:scavenge 3.
