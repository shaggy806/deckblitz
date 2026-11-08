# Need-key themes: general engine changes under the open keys

Status: plan of record (2026-11-07), steps 1 (B275) and 2 (B276) done, step 3 next — see *The plan* just below. The survey under
it is a proposal.

The 1,783 open need keys (2,265 waiting cards, re-counted after step 1; the survey's own count was 1,831 and 2,324)
mostly fall into about sixteen engine mechanisms that cut across
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

1. **Done 2026-11-07 (B275).** Thirteen duplicate keys merged; of the nine "probably expressible" keys, six needed
   no engine code and three one small switch each (see *Already built or duplicated*); 33 cards authored, Bilbo and
   Advanced Reconstruction among them; the 16 still blocked each have a narrow key; `--stale` is empty. The theme
   counts moved by at most 6 keys and 6 cards each, inside the survey's ±15%, so the build order stands.
   **Key clean-up (no engine design).** Merge the duplicate keys listed under *Already built or duplicated* in
   `engine/data/needs-vocabulary.json` (one key, the other an alias; re-point the records). Try authoring the keys
   listed there as probably expressible (`keyword:devoid` already proved so with Ulalek; the
   cast-not-from-hand cost reduction would free Bilbo, Thief in the Night and Advanced Reconstruction). Run
   `author-freed` over `--stale` (Benthic Anomaly, Corrupted Crossroads, Prowling Geistcatcher, Promise of Tomorrow,
   Cold Storage, and the nine cards B274's partly covered keys left: Cass, Hand of Vengeance; Last Night Together,
   Intimidation Bolt, Boros Battleshaper, Forgestoker Dragon; Flameskull, March of Reckless Joy; Yare). Then re-count
   the themes (the counts here are ±15%) and correct this doc.
2. **Done 2026-11-07 (B276).** One shared duration type, and timed statics (themes 3a, 3b): `engine/src/duration.ts`
   (see theme 3's design note). 12 cards: Teferi's Reproach, Willie Lumpkin, Zagorka, Emrakul, the Exigent Doom, Hall
   of Echoes, Jace's Machinations, Skullcrack, Call In a Professional, Roiling Vortex, Sphinx's Decree, Azor and Master
   of Cruelties; seven keys marked built, their six other cards left in `--stale` for `author-freed`. Frozen in Ice
   (can't become untapped: theme 3c's prohibition) and Yavimaya Bloomsage (a player's own mana ability) stay flagged.
3. **Done 2026-11-07 (B277).** A turn journal in game state (theme 6): `engine/src/journal.ts` (see theme 6's design
   note). `TurnHistory` and ten `*ThisTurn` counters deleted; 13 cards: Kid Loki, Kiora of Salt and Sand, Kíli the
   Resourceful, Captain America, Living Legend, Beast, Erudite Aerialist, Fractal Tender, Sigardian Paladin, Mercadian
   Atlas, Garna, the Bloodflame, Myojin of Grim Betrayal, Feast on the Fallen, First Response, Paladin of Atonement;
   seven keys marked built, their five other cards (Bruenor Battlehammer, Reenact the Crime, River of Tears, Rock
   Jockey, The Chain Veil) left in `--stale` for `author-freed`.
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
  That leaves **2,314 cards and 1,831 open keys**. **1,415 keys block one card each.** Only 121 cards have two or more
  open needs (2,203 have exactly one). So a theme's card count is close to what building it frees on its own, and
  the counts nearly add up.
- **Re-counted after step 1 (2026-11-07, B275)** the same way: **2,265 cards and 1,783 open keys** (1,388 keys
  block one card each). At this doc's first commit the same count gave 2,274 and 1,790 (the figures above predate
  B274). The 7 keys fewer are 13 merged and 9 built (3 with a small switch, 6 with no code) against 15 new narrow
  keys for cards the built keys left; the theme table carries each theme's share of that, by hand.
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
| 1 | Object sets ("this way", linked, cost-paid, batch) + one aggregate | 215 | 278 | ~150 | medium |
| 2 | Declarative event triggers + generic trigger modifiers | 171 | 236 | ~140 | high |
| 3 | One rule-effect vocabulary: shared durations, timed statics, prohibitions | 162 | 229 | ~130 | high |
| 4 | Cost pipeline: modifiers take `EffectAmount`, effects as costs | 116 | 159 | ~80 | medium |
| 5 | Who chooses: a uniform `chooser`, per-player rounds | 125 | 150 | ~60 | medium |
| 6 | Turn/game event journal with a query read | 112 | 143 | ~100 | high |
| 7 | References and relational filter clauses | 109 | 144 | ~70 | medium |
| 8 | One characteristics patch for copy exceptions, "becomes" and animate | 118 | 149 | ~60 | low-medium |
| 9 | Replacement effects with an arbitrary "instead" | 101 | 123 | ~60 | medium |
| 10 | One play-permission record | 78 | 113 | ~60 | medium |
| 11 | Combat requirements and restrictions as data | 62 | 88 | ~45 | medium |
| 12 | Random results as recorded, triggerable events | 59 | 80 | ~45 | medium |
| 13 | Mana: spent-mana queries and mana-ability hooks | 56 | 80 | ~35 | low-medium |
| 14 | Attachments: any host, any attachee reference | 36 | 55 | ~30 | medium |
| 15 | Delayed triggers: any step, any player, captured context | 31 (+~20 counted under 1 and 2) | 41 | ~30 | high |
| 16 | Grants: any keyword with parameters; trigger multipliers by cause | 37 | 39 | ~25 | medium |
| — | Counters (folds into 1, 2 and 6), face-down/phasing/meld mechanics, singletons | ~236 | ~300 | — | — |

"Realistic reach" is a judgement: the cards whose key is fully covered by the change as described, from the
descriptions sampled. Overall, a general change frees about half of its theme's cards. The rest each need a small
extra option, but one sitting on the new type instead of a new parallel shape.

---

### 1. Object sets and one aggregate (215 keys, ~278 cards)

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

### 2. Declarative event triggers and generic modifiers (171 keys, ~236 cards)

**Change.** Add one `TriggerSpec` member,
`{ on: "event", event: GameEvent["type"], player?: PlayerRelation, object?: CardFilter, cause?: PlayerRelation, value?: field }`.
It matches any logged event, with the relation to the ability's controller ("you", "an opponent", "enchanted player",
"that player"), and reads its amount into `triggerValue`. Lift the per-kind flags into one wrapper on every
`TriggerSpec`: `firstTimeEachTurn`, `nthEachTurn`, `oncePerTurn` / "do this only once each turn" (rule 603.2h), and
an intervening-if (603.4). That wrapper reads the event journal (theme 6).

**Keys (top):** trigger:activates-mana-ability 6, trigger:counters-put-first-time-each-turn 5,
trigger:player-loses-game-trigger 5, trigger:proliferate-trigger 4, trigger:becomes-crewed-trigger 4,
trigger:becomes-monarch 4, trigger:phases-in 4, trigger:you-tap-opponent-creature 4 (energy-gained built 2026-11-07),
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

### 3. One rule-effect vocabulary: shared durations, timed statics, prohibitions (162 keys, ~229 cards)

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
- static:dont-lose-for-zero-life 8 (with no-loss-for-zero-life, merged), effect:players-cant-gain-life-this-turn 7
  (the four "can't gain life" one-shots, merged 2026-11-07), effect:player-cant-attack-you-next-turn 4,
  static:ignore-hexproof 4, static:spell-cant-be-copied 4;
- replacement:damage-multiplier-this-turn 3, effect:player-effect-until-target-next-turn 3,
  static:graveyard-enter-prohibition 3, static:player-shroud-static 3, static:opponent-cant-cause-sacrifice 3,
  static:cant-become-untapped 3, static:prohibit-cast-from-graveyard-or-library 3, static:counter-cap 3;
- effect:temporary-opponent-spell-tax 2, effect:grant-replacement-until-eot 2,
  effect:duration-this-combat 2, effect:restrict-this-combat 2 (hexproof-from-monocolored and pt-until-end-of-combat
  were already expressible: built 2026-11-07),
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

**Design note (step 2, 2026-11-07): one `Duration`, one `Expiry`, a timed static.**

*Where it lives.* `engine/src/duration.ts`, beside nothing else: types and the pure helpers that read them. Two
types, because a card and the game state say a duration differently:

- **`Duration`**, what a card says ("until your next turn"): string members for the effect controller's own forms,
  and object members anchored to any other player, `{ untilTurnOf | throughTurnOf | duringTurnOf: DurationPlayer }`
  (`DurationPlayer` is `EffectPlayerRef` without `"you"`, whose forms are the strings, so each meaning has one
  spelling). Every member names one meaning everywhere: `"until-your-next-turn"` ends as that turn begins,
  `"until-end-of-your-next-turn"` at its cleanup, `"during-your-next-turn"` only within it, `"permanent"` has no end
  of its own (the object's stint, rule 400.7; a player effect's rest of the game). It replaces `PtDuration`,
  `UntilPointDuration`, `CopyUntil`, `ImpulseDuration`, the `player-effect` spec's own union, `DelayedWhenever.until`,
  the damage rule's, `prohibit`'s, `restrict`'s and `attack-requirement`'s, whose clashing words are renamed: the
  impulse permission's `"your-next-turn"` (it ran to the end of that turn) is `"until-end-of-your-next-turn"`, the
  copy's and the delayed watch's `"your-next-turn"` (it ended as the turn began) `"until-your-next-turn"`,
  `"this-turn"` `"end-of-turn"`, `"this-combat"`/`"end-of-combat"` `"until-end-of-combat"`,
  `"rest-of-game"`/`"game"` `"permanent"`, `"while-you-control"` `"while-you-control-source"`.
- **`Expiry`**, what the state keeps once the effect began (the old `EffectDuration`, moved from `events.ts` with
  `UntilPoint`, `WhileSource` and `UntilCast`): players resolved to ids, sources to a stint. `PlayerEffect.expires`
  takes it (its five private kinds deleted), and so does the new timed static; `PtModifier`'s fields and
  `ControlEffect`'s stay the flattened image of an `Expiry` (`durationFields`), as 267 card files write
  `untilEndOfTurn` directly.

Each store takes the subset of `Duration` its expiry pass can end, declared in `duration.ts` as an `Extract` of it
(`PermanentDuration`, `PlayerDuration`, `CopyDuration`, `PermissionDuration`, …), never a field-local union: a store
that learns a member widens its subset and its resolver, and a new key adds no new word. `resolvePlayerDuration`
turns a `PlayerDuration` into an `Expiry` for every player-side store, so "until **that player's** next turn"
(Teferi's Reproach) is one anchor, not a new kind.

*The one expiry check.* Player effects and timed statics end in one pass, `expirePlayerEffects(moment)` over
`mapPlayerExpiries`, called at the turn's beginning, combat's end and cleanup; their `UntilPoint`s (an upkeep, the
end of a later turn) pass in `passUntilPoints` beside the modifiers' and control effects'. A `duringTurnOf` effect waits in `GameState.laterPlayerEffects` until that player's
next turn begins (800.4m: never, if they've left), then holds for that turn (Willie Lumpkin, Zagorka).

*Not moved here*, each owned by a later theme: the impulse permission's stored `expiry` (theme 10's one
play-permission record), `AttackRequirementRule.duration` (theme 11), `TemporaryCopy.ends` (`CopyEnds`, theme 8's
characteristics patch), prevention shields and the turn-wide lists (`hexproofPlayers`, `turnProhibitions`; theme
3c's predicate). Their *authored* words are `Duration`'s already: each resolver reads a `Duration` subset into its
own store.

*The timed static.* A new effect, `{ kind: "timed-static", static: StaticAbility[], duration: PlayerDuration }`,
makes an emblem-like object owned by the effect's controller with `EmblemState.expires`: every reader of emblem
statics (`emblemStatics`, `staticSourceIds`) sees it, and it goes when its `Expiry` ends. It is no emblem at the table
(rule 114): the view leaves it out of the emblems (as it shows no other player effect), no "emblem" log line is
written, and the bots don't count it as an emblem they own. Rule 611.2c: a timed static changes rules, not characteristics, so it reaches
whatever comes later; one that changes characteristics would lock its `affects` as it begins, and is refused until a
card needs it. Readers learn the fields their proving cards use (`legendRuleOff`; the life-gain, life-loss and mill
replacements through `playerEventReplacements`; `loyaltyAtInstantSpeed` with a filter `affects`), each pinned by
`emblem-statics.test.ts`, which now walks timed statics too. "Damage can't be prevented this turn" already had its
one-shot (`damage-cant-be-prevented`).

*Bots.* `features.ts` counts only lasting emblems (a timed static isn't an asset, and "players can't gain life"
binds its maker too); `target-polarity` gives `timed-static` its entry (no targets of its own; a `player-effect`'s
are read as before, and the `during` anchor is read after targets lock). `onlyUntilEndOfTurn` deliberately leaves both
out: a rule for the rest of the turn still matters after combat, where a pump no longer does. v2 simulates the
resolution, so it sees the effect itself.

*As built (B276).* Every spec-level duration union is gone (`PtDuration`, `UntilPointDuration`, `CopyUntil`,
`ImpulseDuration`, the player effect's, the watch's, the damage rule's, `prohibit`'s, `restrict`'s and
`attack-requirement`'s), 140 card files and the scaffolder renamed onto `Duration`'s words; `EffectDuration` is
`Expiry`. Two small additions the proving cards needed: `assigns-no-combat-damage`'s `duration:
"until-end-of-combat"` (Master of Cruelties) and the filter clause `attackingPlayer`, and `cantAttack:
"you-and-permanents"` (Willie Lumpkin's "you or permanents you control", a battle too).

### 4. Cost pipeline (116 keys, ~159 cards)

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
cost:choose-creature-type-as-cast 4, keyword:kicker-any-number-of-modes 3 (cost-reduction-cast-not-from-hand built
2026-11-07),
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

### 5. Who chooses (125 keys, ~150 cards)

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

**Design note (step 3, 2026-11-07): one journal in game state, one read.**

*Where it lives.* `engine/src/journal.ts`: the types, the append and prune helpers, the windows and the read, all pure
(as `duration.ts` is for step 2). The state is one field, `GameState.journal: Journal`, `{ entries, turns, game }`.

*The entry.* One normalised shape for every kind, each field meaning one thing everywhere:
`{ kind, turn, player, object?, stint?, was?, count?, amount?, from?, to?, target?, targetStint?, targetWas?, combat?,
counter?, ability? }`. `player` is whose record it is, fixed per kind (the controller as it entered or left, the
sacrificer, the discarder, the caster, the activator, the source's controller as it dealt damage, the owner of the
graveyard a card went to). `object` + `stint` name the object *after* the event (rule 400.7: the card now in the
graveyard is the one "put there this turn"); `was` is the object **as it was** (603.10a, 608.2h), the
`LastKnownInfo` the event already took, never a bare id to be looked up later; `was.zoneChangeCount` names the
stint it was in. `was` is kept only for kinds a filter reads as it was (entered, left, attacked, blocked, damage's
source, counters put); the rest are matched as the object is now, which is what their cards say ("discarded",
"put into a graveyard"). `count` is a token stack's size (default 1), `amount` a quantity (damage, life, counters,
mana, energy). The kinds are events, not questions: "died" is a `left` entry with `to: "graveyard"` whose `was` is
a creature, "exiled" one with `to: "exile"`, "descended" a `to-graveyard` entry of a permanent card, so one death
writes one `left` entry and one `to-graveyard` entry where `TurnHistory` wrote four. The card-facing words ("died",
"descended", "attackers", "combat-damaged-by") stay, each defined once in `JOURNAL_VIEWS` as a kind and a match.

*Windows.* `"this-turn"` (the default), `"last-turn"` (the turn before this one, whoever's it was: First Response),
`"their-last-turn"` (the given player's most recent turn before this one: avenge, Goblin Rock Sled), `"since-their-
last-turn"` (after that turn ended: "since your last turn") and `"this-game"`. `Journal.turns` lists each kept turn
and whose it was (extra turns make the number no guide), appended as a turn begins. `this-combat` stays a filter on
`combat` (the combat phase number), not a window.

*Pruning.* As each turn begins, entries and turns older than the earliest turn any window can still name are dropped:
the last turn, and each player's own last turn, so at most one round (four turns at four players). `game` is the
whole-game summary, `player → kind → count`, for "this game" reads, which take no filter (no key needs one yet).

*The read.* `journalRead(state, registry, read, ctx)` over `JournalRead = { what, window?, who?, filter?, from?,
notFrom?, combat?, counter?, by?, selfOnly?, excludeSelf?, measure? }` (`measure`: `count`, the default; `sum` of
`amount`; `distinct` objects; `players` with one), serving all four uses through one evaluator: the `turn-history`
condition, the `turnHistory` amount (spells and abilities) and cost reduction, and a new `CardFilter` clause
`journaled` ("this object, in the stint it's in now, appears in an entry": "creature you've put a +1/+1 counter on
this turn", "card put into a graveyard from anywhere this turn"). Those three card-facing spellings were already one
shape with `what`; they gain `window` and the new fields. `TurnStat` (cards/define.ts) keeps its words, because 357
card sites spell them, but each is now a row of `TURN_STAT_READS`, a `JournalRead`: no state behind any of them, and a
new stat is a row, not a field.

*Why not `eventLog`.* It holds every event but is emptied by every bot simulation (`{ ...state, eventLog: [] }` in
`bot/simulate.ts`, `bot/turn-plan.ts`, `bot/determinize.ts`, `game.ts`), so a rule reading it would answer
differently in a simulation than at the table. The journal is state: it rides every clone, and so it must stay
small (entries share the `LastKnownInfo` objects the events already took; `structuredClone` keeps one copy of each).

*What it replaces.* `TurnHistory` (state.ts) and its hand-added lists and counters, all deleted with
`TurnHistoryEntry`, `CountersPutRecord` and the per-list recording in `Game.recordTurnHistory` (now
`recordJournal`); `turnStatOf`, `turnHistoryCount`, `countersPutThisTurn` and `damageDealtThisTurn`
(characteristics.ts) become reads; and the event-history `*ThisTurn` fields on `PlayerState`, `GameObject` and
`GameState`, field by field, each deleted with its last reader (listed under *As built*). Not replaced, because
they are rule state rather than history: permissions and their use limits (`extraLandsThisTurn`,
`graveyardCastUsedThisTurn`, `spellGrantsThisTurn`: theme 10), combat requirements (`mustAttackPlayerThisCombat`,
`boundThisCombat`: theme 11), rule flags and turn structure (`damageUnpreventableThisTurn`, `skipsThisTurn`,
`phasesAfterThisCombat`), and `wouldDrawThisTurn`, which counts draws a replacement may have stopped, so no draw
event exists to journal. The per-object `*OnTurn` stamps (`enteredBattlefieldOnTurn`, `tappedOnTurn`, …) are one
number each and read by object, not counted; they stay.

*Bots.* No bot reads `eventLog` for rules, and v2 simulates resolutions, so it sees journal reads as the table does.
What changes is what they read directly: `features.ts`'s land-drop and life-lost terms read the journal (the
life-lost read once per evaluation, not per creature), and the scenarios that set `landsPlayedThisTurn` append an
entry instead.

*As built (B277).*
- `journal.ts` as above. Kinds recorded where the events are emitted (`Game.recordJournal`, from `emit`) or, where
  the count must be right before any trigger looks, at the act itself: a land played (305.2's limit), a draw (its
  `nthThisTurn`), a loyalty or equip activation, a land tapped for mana, an own-library search, and a whole attack
  declaration before its first `attacker-declared` (pack tactics' total power, 508.1k). Every append from `Game`
  goes through `Game.journal`, which invalidates the computed cache: statics now read the journal.
- One new card-facing clause, `CardFilter.journaled` (`{ what, window?, by?, counter?, atLeast?, atMost? }`): this
  object, in the stint it's in now (`arrived` after a move), appears in the journal. Kid Loki, Beast and Fractal
  Tender read `counters-put`; Captain America's resolution-time "if" reads `tapped` with `atMost: 1`. The words
  `life-lost`, `life-gained`, `lands-played`, `loyalty-activated`, `equip-activated`, `counters-put` and `tapped`
  joined `JournalWhat`; `turn-history` and the `{ turnHistory }` amount and cost reduction took `window`.
- Token folding: `counters-put` and `tapped` entries don't hold a token apart (they did in a first cut, and four
  refold tests failed); instead `exactTokenShape` compares each token's own records of them, so two tokens fold only
  when the journal says the same of each. Damage stays count-only, as before.
- Deleted, with every reader moved: `TurnHistory` (all 30 lists and counters), `PlayerState.landsPlayedThisTurn`,
  `lifeLostThisTurn`, `lifeGainedThisTurn`, `cardsDrawnThisTurn`, `equipsActivatedThisTurn`, `creaturesDiedThisTurn`
  (and `GameState`'s), `createdTokenThisTurn`, `crimesThisTurn`, `cardsCycledThisTurn`, and
  `GameObject.loyaltyActivatedThisTurn` / `loyaltyActivationsThisTurn`. Tests read and set them through the harness's
  `turnTotal`, `setTurnTotal` and `diedThisTurn`.
- **Not moved this session**, each still its own field, with its readers:
  - The spells cast (`PlayerState.spellsCastThisTurn`, `spellsCastThisTurnAs`, `spellsCastLastTurn`,
    `spellNamesCastThisGame`, `GameState.spellsCastThisTurn`): ~30 readers in the cast pipeline, cost reductions and
    `controller.ts`, and `spellsCastThisTurnAs` holds the spell snapshots the 105 `cast-this-turn` card sites read.
    Its own change: `spell-cast` entries whose `was` is the spell as cast.
  - The attack records on objects and players (`attackedThisTurn`, `attacksThisTurn`, `attackedPlayersThisTurn`,
    `attackedBattleThisTurn`, `attackedThisCombat`, `attackedWithCommanderOnTurn`, `attackedByOnTurn`): ~60 sites in
    the declaration and `combat/eligibility.ts`. The journal's `attacked` entries already hold the same facts;
    moving the readers is combat code, theme 11's (combat requirements and records).
  - The damage records (`GameObject.damageThisTurn`, `combatDamagedPlayersThisTurn`,
    `PlayerState.combatDamageCreatureTypesThisTurn`): the journal's `damage` entries hold them, but `damageThisTurn`
    is also part of the token-fold shape and the bots' twin fingerprint; move them with
    `filter:dealt-damage-to-source-this-turn`.
  - `targetedThisTurn`, `revealedThisTurn` (the view's visibility), `drewInDrawStepThisTurn`, `saddledThisTurn` and
    `crewedThisTurn` (relations, which creature crewed which vehicle).
  - Usage limits keyed by ability (`abilitiesUsedThisTurn`, `grantedUsedThisTurn`, `abilitiesDoneThisTurn`,
    `abilityActivationsThisTurn`, `abilityResolutionsThisTurn`, `modesChosenThisTurn`): "activate only once each
    turn", "this ability has resolved N times" — theme 2's "nth time each turn" modifiers (step 4) are their home.
- Measured (four-player fuzz games, `structuredClone` of the state at turns 4-16): 1.08-1.22 ms a clone against
  1.14-1.21 before, the state 227-235 KB against 236-243 (the per-object loyalty flags are gone), the journal 4-5 KB
  as JSON. A timed `bot:bench` (16 games, four players, 8 workers): the same games (12-4, 38.9 turns on average),
  70.6 s a game against 74.3, 118.8 ms a decision against 125.2.

### 7. References and relational filter clauses (109 keys, ~144 cards)

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

### 8. One characteristics patch for copy exceptions, "becomes" and animate (118 keys, ~149 cards)

**Change.** One `CharacteristicsPatch` (set or add types, subtypes and supertypes; set colours; add or remove abilities,
keyword instances with parameters; base P/T from an amount; conditional on "if it's a creature"). It is used by:
- copy exceptions: they become part of the copiable values (rule 707.9a), which `CopyValues.modifiers: PtModifier[]`
  (state.ts:1878) carries;
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

### 9. Replacement effects with an arbitrary "instead" (101 keys, ~123 cards)

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

### 10. One play-permission record (78 keys, ~113 cards)

**Change.** One record, `{ who, cards: ObjectSetRef | { zone, filter, top? }, duration: Duration, limit: once-each-turn
| one-of | count, cost: normal | free | alt | tax | pay-life, spendAs?, riders: entersTapped | entersWithCounter |
exileIfWouldLeave | grants }`, used the same way whether it comes from a static, a resolution, a cast-now or an
impulse. Today it is split across `GameObject.impulse` (state.ts:701, 17 fields), `PlayerEffect.castFromGraveyard`
(state.ts:5786), six `StaticAbility` fields (define.ts:2898-3782) and `CastNowAsk` (state.ts:3205). Each gained its own
riders.

**Keys (top):** effect:conjure 9 (outside-the-game; see Singletons), static:grant-miracle-in-hand 3,
zone:exile-hand-with-play-permission 3, zone:cast-from-library-top-once-each-turn 5 (three keys, merged 2026-11-07),
zone:exile-player-hand-play-exiled 3 (two keys, merged), zone:choose-one-of-exiled 2,
zone:graveyard-play-once-shared-land-or-permanent 2, zone:cast-from-library-top-extra-cost 2,
effect:allow-play-from-exile 2, zone:play-from-graveyard-your-turn 2, static:play-from-exile-once-each-turn 2; 58
one-card keys (zone:impulse-play-only-one was built 2026-11-07; Flameskull needs
zone:impulse-play-one-including-exiled-self).

**Risks.** Rule 305.1 for lands (playing a land is a special action, one per turn). 609.4 "as though". A card that
changes zones is a new object (400.7). The permission must die with it.

**Confidence: medium.**

### 11. Combat requirements and restrictions (62 keys, ~88 cards)

**Change.** One requirement/restriction record per side (rules 508.1d, 509.1c): `{ creatures: filter/ref, must |
cant, attack | block, target?: PlayerRef | "you-or-your-planeswalkers", unless?: Condition, duration: Duration }`. The
existing maximisation in `combat/` reads it. Today it is `AttackRequirementRule` (state.ts:5953, its own duration),
`StaticAbility.restrictions: CombatRestriction[]` (define.ts:531, 3720), `turnRestrictions` (state.ts:6709),
`PlayerEffect.cantAttack`, and about 20 more `StaticAbility` combat fields.

**Keys:** decision:attacker-chooses-blocks 4, static:must-attack-specific-player 4, static:block-as-though-shadow 4,
effect:token-enters-blocking 3, filter:creature-source-is-blocking 3 (snow and legendary landwalk built 2026-11-07),
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

### 13. Mana: spent-mana queries and mana-ability hooks (56 keys, ~80 cards)

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

### 14. Attachments (36 keys, ~55 cards)

**Change.** `attach` takes any `AttachHostRef` including a player (Curses: rule 303.4 lets an Aura enchant a player)
and any attachee from an `ObjectSetRef` ("each created token", "the Equipment that was attached", "auras attached to
it").

**Keys:** effect:curse-attach-player 4, effect:attach-equipment-that-was-attached 3,
effect:return-as-aura-with-granted-ability 3, effect:attach-to-chosen-creature 3, static:attach-as-granted-equipment 3,
keyword:fortify 2, effect:create-token-attached-each 2, effect:attach-equipment-to-each-created-token 2,
effect:return-aura-after-host-died 2. Existing: `AttachRef`/`AttachHostRef` (effects.ts:105, 126).

**Confidence: medium.**

### 15. Delayed triggers: any step, any player, captured context (31 keys + ~20 elsewhere, ~41 cards)

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

### 16. Grants: any keyword with parameters; trigger multipliers by cause (37 keys, ~39 cards)

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

- **Probably expressible today — tried 2026-11-07 (B275).** What each one turned out to be:
  - `keyword:snow-landwalk`, `keyword:legendary-landwalk`: no code — a `landwalk` filter with `supertype`. Built;
    all six cards authored.
  - `keyword:hexproof-from-monocolored`: no code — `hexproofFrom.filter: { multicolored: false, colorless: false }`.
    Built; General Ferrous Rokiric authored. Elenda's record was wrong (hexproof from instants; authored). Niv-Mizzet,
    Supreme still needs `static:grant-jump-start-to-graveyard-cards`; Dragonfire Blade `cost:equip-cost-per-color`.
  - `cost:cost-reduction-cast-not-from-hand`: a zone list can't say it (it reads hands as the static controller's),
    so `costModification.notFromCastersHand`. Built; Bilbo, Advanced Reconstruction, Sage of the Beyond, Savvy
    Trader, Fortune Teller's Talent.
  - `trigger:energy-gained`: the `orPlayer` branch ignored `who`, so it fired on any player's energy; now `who` reads
    the player. Built; Territorial Gorger, Aether Revolt, Brotherhood Scribe, Fabrication Module.
  - `trigger:counter-removed-trigger`: `perCounter` added (Protean Hydra's ruling: once per counter). Built. Watcher of
    Hours still needs `trigger:time-counter-removed-in-exile-by-you-per-counter` (the time-counter event has no
    amount or remover).
  - `keyword:devoid` (built in B274): its two cards needed other things — `filter:has-devoid` (Corrupted
    Crossroads: devoid as empty colours can't be told from colorless) and
    `effect:token-copy-of-one-chosen-with-total-pt` (Benthic Anomaly).
  - `effect:pt-until-end-of-combat`: no code (`modify-pt`'s `"until-end-of-combat"`). Built; Glyph of Destruction,
    Murk Dwellers. `effect:duration-this-combat` stays open for theme 3a: Ria Ivor's prevention and Master of
    Cruelties' "assigns no combat damage this combat" take no combat duration.
  - Two more keys the batch found already expressible: `static:look-at-top-card-any-time` (`visibility:
    { looksAtOwnLibraryTop }`) and `effect:return-linked-under-your-control` (Sothera's linked exile; Prowling
    Geistcatcher, Promise of Tomorrow, Cold Storage).
- **The same feature under two keys — merged 2026-11-07** (the second key of each is now an alias, `mergedInto` the
  first, and its records re-pointed):
  - static:dont-lose-for-zero-life (6) = static:no-loss-for-zero-life (2);
  - replacement:lose-game-replacement (2) = replacement:would-lose-game (2);
  - trigger:you-tap-opponent-creature (3) = trigger:you-tap-opponents-creature (1);
  - cost:cost-reduction-cast-not-from-hand (4) = cost:cost-reduction-cast-not-from-your-hand (1);
  - cost:mana-ability-discard = cost:mana-ability-discard-cost;
  - effect:swap-blockers = effect:switch-blockers;
  - effect:delayed-exiled-unplayed-to-graveyard = effect:delayed-move-unplayed-exiled-to-graveyard;
  - zone:exile-player-hand-play-exiled (2) = effect:exile-player-hand-play-exiled (1);
  - the four "can't gain life" one-shots are one key, effect:players-cant-gain-life-this-turn (who and how long vary:
    a timed static, theme 3), with effect:opponents-cant-gain-life-this-turn,
    effect:target-player-gains-no-life-this-turn and effect:player-cant-gain-life-for-game its aliases;
  - zone:cast-from-library-top-once-each-turn, with static:cast-from-library-top-once-per-turn and
    static:play-from-library-top-once-each-turn its aliases.
- **New leads from B275's engine notes:** `cards-milled` is emitted once per player, so "whenever one or more cards
  are milled" fires once per player on a simultaneous multi-player mill (The Wise Mothman, in the pool, against its
  ruling; `trigger:mills-batched-across-players`); and a `for-each-player` with `simultaneous: true` around a
  `look-and-choose` moves nothing, silently (`effect:each-player-look-and-choose-together`).
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
