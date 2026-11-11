# Need-key themes: general engine changes under the open keys

Status: plan of record (2026-11-07), steps 1-6 (B275-B280) and all eleven pieces of step 7 (theme 7, B281; theme 10, B282; theme 9, B283; theme 11, B284; theme 13, B285; theme 12, B286; theme 8, B287; theme 14, B288; theme 16, B289; theme 3c, B290; theme 15, B292) done; the themes are finished
the smaller themes — see *The plan* just below. The survey under it is a proposal.

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
4. **Done 2026-11-07 (B278).** Declarative event triggers and one timing wrapper (theme 2): `engine/src/trigger-events.ts`
   (see theme 2's design note and *As built*). 24 cards: the eight flagged (Glorious Purpose; Ultron, Unlimited; Iron
   Monger, Sadistic Tycoon; Leader, Super-Genius; Elrond, Moon-Reader; Avatar Aang; Way of the Mind Sculptor; Tamiyo,
   Upriser Crowned) and 16 of the theme's top keys; 17 keys marked built, their 22 other cards left in `--stale` for
   `author-freed`.
5. **Done 2026-11-08 (B279).** Object sets and one aggregate (theme 1, with theme 15's captured context):
   `engine/src/object-sets.ts` (see theme 1's design note and *As built*). 19 cards: the four flagged (Synthetic
   Destiny; Thorin, Mountain-king; Brass Infiniscope; Captain Marvel, Apex Avenger) and 15 of the theme's top keys;
   13 keys marked built, their 18 other cards (Balancing Act, Restore Balance, Soulless One, Shagrat, The Eagles Are
   Coming!, …) left in `--stale` for `author-freed` (51 in all).
6. **Done 2026-11-08 (B280).** The cost pipeline (theme 4: `engine/src/cost-acts.ts`, see its design note and *As built*) and
   one chooser type (theme 5). 23 cards: seven of the flagged (Hulk, Gamma Goliath; Kang the Conqueror; Wonder Man; Advancing the
   Spirit; The Dominion Bracelet; World War Hulk; Eumidian Wastewaker) and 16 of the themes' top keys; 20 keys marked built, their
   other cards left in `--stale` for `author-freed`. Baron Helmut Zemo and Dawnhand Dissident stay flagged (see theme 4's *Left unbuilt*).
7. Then the survey's build order below from step 8 on, one piece a session:
   - **Done 2026-11-08 (B281).** References and relational filter clauses (theme 7: `engine/src/refs.ts`, see its design note and *As built*).
     18 cards: Oft-Nabbed Goat, Storm, Windrider, Archnemesis (flagged) and 15 of the theme's top keys; 18 keys marked built, their other
     cards left in `--stale` for `author-freed`. Squandered Resources stays flagged (see *Left unbuilt*).
   - **Done 2026-11-08 (B282).** One play-permission record (theme 10: `engine/src/play-permission.ts`, see its design note and *As built*). 10 cards: Hex Magic,
     Dawnhand Dissident, Lorehold, the Historian, Molecule Man (flagged) and 6 of the theme's top keys; 7 keys marked built, their other cards left in `--stale` for `author-freed`.
   - **Done 2026-11-08 (B283).** One `instead` and one resolved-replacement record (theme 9: `engine/src/replacements.ts`, see its design note and *As built*). 18 cards: Doc Samson, Moonlit Meditation, Quantum Riddler and Wolverine, Fierce Fighter (flagged) and 14 of the theme's top keys; 18 keys marked built, their other cards left in `--stale` for `author-freed`.
   - **Done 2026-11-08 (B284).** One combat rule, requirements and restrictions (theme 11: `engine/src/combat/rules.ts`, see its design note and *As built*). 14 cards: Galactus, Devourer of Worlds and Silver Surfer, Galactus's Herald (flagged) and 12 of the theme's top keys; 6 keys marked built, their other cards left in `--stale` for `author-freed`.
   - **Done 2026-11-08 (B285).** Three reads of mana (theme 13: `engine/src/mana.ts`, see its design note and *As built*). 20 cards: Squandered Resources, Omnath, Locus of the Void (flagged) and 18 of the theme's top keys; 11 keys marked built, their other cards left in `--stale` for `author-freed`. Yavimaya Bloomsage stays flagged (see *Left unbuilt*).
   - **Done 2026-11-08 (B286).** Flips and rolls as records (theme 12: `engine/src/random-results.ts`, see its design note and *As built*). 14 cards: Ral Zarek, Guest Lecturer (flagged) and 13 of the theme's top keys; 15 keys marked built, their other cards left in `--stale` for `author-freed`.
   - **Done 2026-11-08 (B287).** One characteristics patch and one `become` effect (theme 8: `engine/src/characteristics-patch.ts`, see its design note and *As built*). 18 cards, none of the twelve flagged (no flagged card's key is under this theme): Mycosynth Lattice and 17 of the theme's top keys; 13 keys marked built, their other cards left in `--stale` for `author-freed`.
   - **Done 2026-11-08 (B288).** One `attach`, what and where (theme 14: `engine/src/attachments.ts`, see its design note and *As built*). 16 cards, none of the twelve flagged (no flagged card's key is under this theme): Akiri and 15 of the theme's top keys; 16 keys marked built, their other cards left in `--stale` for `author-freed`.
   - **Done 2026-11-08 (B289).** Keyword values and a doubler by any event (theme 16: `engine/src/keyword-values.ts`, see its design note and *As built*). 18 cards, none of the twelve flagged (no flagged card's key is under this theme): Djinn Illuminatus and 17 of the theme's top keys; 13 keys marked built, their other cards left in `--stale` for `author-freed`.
   - **Done 2026-11-09 (B290).** One prohibition record (theme 3c: `engine/src/prohibitions.ts`, see its design note and *As built*). 33 cards: Frozen in Ice (flagged), Grafdigger's Cage, Angel of Jubilation, Sigarda, Lich's Tomb and 28 of the theme's top keys; 24 keys marked built, their other cards left in `--stale` for `author-freed`.
   - **Done 2026-11-09 (B292).** One step timing, one watch duration, one intervening "if" (theme 15: `engine/src/delayed-at.ts`, see its design note and *As built*). 12 cards: Fight for the Throne and Loki Laufeyson (flagged) and 10 of the theme's top keys; 11 keys marked built, their other cards left in `--stale` for `author-freed`.
   - Next: the themes are done. `author-freed` for `--stale`, then the order in `docs/plans/after-the-themes.md`.

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

**Design note (step 5, 2026-11-07): one `ObjectSetRef`, one member, one resolver.**

*Where it lives.* `engine/src/object-sets.ts`, pure, as `duration.ts`, `journal.ts` and `trigger-events.ts` are:
the types, the record helpers, and the source-relative sets a static can read without a resolution. The sets a
resolution knows (a cost's, this way's, the trigger's batch, remembered ones) are resolved by one context method,
`ctx.objectSet(ref)`, and handed to the aggregate, the filter binding and the amount reads as members.

*The member.* `SetMember = { object, stint, count?, was? }`, the journal entry's spelling (step 3), plain data:
- `stint` is the object's `zoneChangeCount` **after the act**, where the set found it — the journal's convention:
  on the battlefield for what was tapped, attacking, entering or dealing damage; in the graveyard for a permanent
  sacrificed or a card discarded or put there; in the hand for one revealed; in exile for one exiled. An effect acts
  on a member only while it is still in that stint (400.7, 603.7c). `was` is how it was **in the act** (608.2h): a
  sacrificed or died permanent's last-known information from the battlefield, a revealed card's snapshot in the
  hand (a hand keeps no last-known information of its own). A read ("its power") takes `was` when the member has
  one, else the member as it is while it's in its stint, else its last-known information for that stint, else
  nothing — a member with no information left still counts in a plain count ("that many"), and matches only an
  empty filter.
- `count` is how many permanents it stood for (a token stack that went whole, engine/CLAUDE.md): every count and sum
  over a set weighs a member by it, as the aggregate already weighs a stack on the battlefield.

*The reference.* `ObjectSetRef`, one union, each member one meaning everywhere:
- `{ thisWay: ThisWayKind, who?, byOwner? }`: what the resolution under way did (this-way.ts), whose as the
  `thisWay` amount already says. `"created"` is `{ thisWay: "created" }`, not a member of its own.
- `{ paid: "sacrificed" | "discarded" | "exiled" | "revealed" | "tapped" }`: the objects the spell's or ability's
  cost took (601.2h, 602.2b), recorded as each is paid — and, for `"sacrificed"`, by a `sacrifice-source` step
  earlier in the same resolution, as the old ref was. (A `"returned"` member waits for a card: the one cost that
  returns a creature, ninjutsu's, keeps `LastKnownRefs.returnedAttacking`, which records what it attacked.)
- `"exiled-with-source"`: rule 607.2a / 406.6 linked exile — the cards exiled with the source in the stint the
  ability refers to (`GameObject.exiledWith`, `exiledUntil`), only the source's own printed pairs being linked
  (607.1, as `exile`'s `linked` already is).
- `"trigger-batch"`: "those creatures", "them", "one of them" — the objects of the batch a "one or more" trigger
  fired on, whichever kind it is (attacking, entering, arriving in a graveyard, dealing damage), each in the stint
  it was in then; one that left since is no longer one of them to act on, though it's read as it was (603.10a for
  the look-back kinds).
- `"attached-to-source"`: the Auras and Equipment attached to the source — as it last existed once it has left
  (608.2h: Wyleth's "for each Aura and Equipment attached to it" with Wyleth gone).
- `{ targets: number[] }`: a target group, the objects in those slots (empty and illegal slots name nothing).
- `{ remembered: name }`: a set captured into a delayed or reflexive trigger (below).

*Where the state keeps sets.* One field, `LastKnownRefs.sets: ObjectSets` — `{ paid?: { [kind]: SetMember[] },
batch?: SetMember[], remembered?: { [name]: SetMember[] } }` — plain arrays (ROADMAP's constraint), on the stack
object as the cost is paid or the trigger fires. `addToSet` is its one writer, so a cost paid in two parts (a
chosen discard answered after a sacrifice) appends rather than overwrites.

*Every consumer takes it.*
- `AggregateSpec.in` (and `plus`' `in`) takes `ObjectSetRef` beside its zones; the zone `"attackers"` goes, its
  four cards on `"trigger-batch"`. The aggregate gains `"min"` (0 over nothing, as `max`). A static aggregate (a
  CDA, a condition) reads the source-relative sets itself (`staticSetMembers`), so "the number of cards exiled with
  it" works in every zone a CDA does (604.3); the resolution-only sets read nothing there.
- `CardFilter.inSet: ObjectSetRef` in place of `triggerBatch: true`, bound by `bindDynamicCompares` to the
  `amongObjects` clause it already had (unbound, it matches nothing). `ShareReference` takes any `ObjectSetRef`
  ("shares a creature type with **a member of**" — the union of their types, as `"exiled-with-source"` already
  read), in place of its own `"sacrificed"` and `"exiled-with-source"`.
- An amount that reads one object (`powerOf`, `toughnessOf`, `manaValueOf`, `countersOn`, `manaSymbolsOf`, …)
  takes an `ObjectSetRef` for "**the** sacrificed creature", "**the** exiled card": its one member, 0 with none or
  several. `AmountRef`'s own `"sacrificed"`, `"discarded"`, `"revealed"`, `"exiled-as-cost"` and `"tapped"` go
  (`"tapped"` stays an `EffectTargetRef`, for acting on that permanent, 400.7). `create-token-copy.of` takes `{ paid:
  "exiled" }` in place of `"exiled-as-cost"`.
- The `thisWay` amount keeps its counting modes (`filter`, `cardTypes`, `perPlayer`, `sharingManaValue`) and loses
  its own `sumOf` / `greatestOf`: "the total power of the creatures sacrificed this way" is an aggregate `sum` `in:
  { thisWay: "sacrificed" }`, one fold for every set.
- `delayed-trigger` and `reflexive-trigger` take `remember: { [name]: ObjectSetRef }` (with an optional `filter`,
  read as it's captured: Song of Blood's "creature card put into your graveyard this way"), resolved as the effect
  applies into plain member arrays — `DelayedTrigger.remembered`, and the reflexive trigger's refs — and handed to
  the ability as it fires (`LastKnownRefs.sets.remembered`), read as `{ remembered: name }`.

*Theme 15's captured context.* A delayed trigger already keeps the resolution that made it (`madeIn`), its targets
and their stints, its trigger object and its recipient. It now keeps the rest of what its creator knew: its **X**
(`DelayedTrigger.x`, the fired ability's X — "where X is the creator's X" no longer reads 0), its **chosen
player** (`LastKnownRefs.player`, "that player"), and its **sets** (`remember`). So "the number of creatures exiled
this way" outlives the resolution (Synthetic Destiny, The Eagles Are Coming!). Rule 603.7b is unchanged: once,
unless it has a duration; 603.7c: a remembered member is acted on only while in its stint.

*The player aggregate.* `{ amongPlayers: "greatest" | "least", of: EffectAmount, who?: PlayerScope,
includingLeft? }`: `of` read once per player in `who` (every player still in the game by default) as that
player's `"each"`, then the largest or smallest — "the highest life total among all players" is `{ amongPlayers:
"greatest", of: { lifeTotal: "each" } }`, "the number of lands controlled by the player who controls the fewest"
`{ amongPlayers: "least", of: { countOf: <land>, forEachPlayer: true } }`. It replaces `greatestAmongPlayers` and
`lowestLifeTotal`. "Each opponent who …" is already `countPlayers`' `where` and a scope's `whoIf`, so no third
shape. A CDA reads it through `CountSpec` (the same member), over the `of` forms a static can answer (life totals
and battlefield counts), which a pool-wide test holds cards to, as `trigger-timing.test.ts` does.

*What it replaces.* The per-set `LastKnownRefs` fields `sacrificed`, `discarded`, `exiledCost`, `revealed`,
`tapped`, `attackedTogether`, `enteredTogether`, `arrivedTogether` and `dealtTogether` (into `sets`; `attackers`,
which keeps what each attacker attacked, stays: it is Mangara's record, not a set); the `ResolutionContext` fields
that mirrored them (`sacrificed`, `discarded`, `exiledAsCost`, `revealed`, `enteredTogether`, `triggerBatch`); the
`AmountRef`s above; the `thisWay` amount's `sumOf` / `greatestOf`; the filter's `triggerBatch`; the aggregate zone
`"attackers"` and `AggregateReads.attackers`; `ShareReference`'s `"sacrificed"`; `greatestAmongPlayers` and
`lowestLifeTotal`.

*Rules.* 608.2h (a member read as it was, once it has moved), 603.10a (the look-back batches), 400.7 and 603.7c
(acted on only in its stint), 607.1 / 607.2a / 406.6 (linked exile is the source's own), 603.7b (delayed once
unless it has a duration), 603.12 (a reflexive trigger is a delayed one, so it remembers the same way). Token stacks:
a member's `count`.

*Bots.* `effect-worth.ts` names `create-token-copy`'s `of` (now `{ paid: "exiled" }`); `features.ts` and
`target-polarity.ts` read no set refs or amounts (checked), and v2 simulates resolutions, so it sees every set as
the table does.

*As built (B279).*
- `object-sets.ts` as above: `SetMember` (with `shown`, for a card revealed in a hidden zone), `ObjectSetRef`,
  `PaidKind` (with `"unattached"`: Captain America's "unattach an Equipment" cost, which had borrowed
  `"sacrificed"`), `ObjectSets`, `RememberSpec`, `addToSet` (its one writer), `storedSetMembers`, `setMembersAll`,
  `onlyMember`, `isCardSet` and `staticSetMembers`. The game resolves the rest in `makeResolutionContext`
  (`objectSet`, and `setMatches` for the aggregate, which leaves out a member in a library or hand that wasn't
  shown, and a face-down exiled card unless the filter asks only whose it is, 406.3a); the cost writers are one
  `Game.recordPaid` (`paidMembers`), every paid kind kept whole on a copy of a spell (`SpellSnapshot.paidCost`, rule
  707.10 — it kept only the exiled and tapped ones).
- Deleted, every user moved: the nine `LastKnownRefs` set fields; `ResolutionContext.sacrificed`, `discarded`,
  `exiledAsCost`, `revealed`, `enteredTogether`, `triggerBatch`; `AmountRef`'s five strings (about 140 card sites, by
  tsc's reported positions, and the `as const` ones tsc doesn't excess-check, found by a pool-wide walk); the
  `thisWay` amount's `sumOf` / `greatestOf` (65 sites onto aggregates); the filter's `triggerBatch` (`inSet`) and
  `sameNameAsThisWay` (`sameNameWith: { thisWay }`); `create-token-copy.of`'s `"entered-together"`,
  `"exiled-as-cost"` and `"exiled-this-way"`; the zone `"attackers"` and `AggregateReads.attackers`;
  `ShareReference`'s `"sacrificed"`; the amounts `exiledWithSourceManaValue` / `exiledWithSourcePower`, `CountSpec`'s
  `exiledWithThis` and `grantPtPerCount.exiledWithSourceManaValue` (all aggregates `in: "exiled-with-source"`); and
  `greatestAmongPlayers` / `lowestLifeTotal` (`amongPlayers`). The scaffolder (`oracle-parse.mjs`) emits the new
  words. `test/object-sets.test.ts` walks every definition for the removed words and keeps counted statics on the
  source's own sets.
- Additions the proving cards needed: the aggregate's `"min"`; `CountSpec`'s `StaticPlayerAggregate` (with `half`
  and `from`: Malignus, Scourge of the Skyclaves) and `sum` (Dauntless Dourbark's "Forests plus Treefolk", where a
  Treefolk Forest is in both); the filter clause `totalPowerToughness` (Cut Down); the this-way kind `"attached"`
  (Thorin); `LastKnownRefs.counter` and `add-counter`'s `counterOfTrigger` (Captain Marvel's "the same kind"); a
  next-spell delayed trigger's X is that spell's (Brass Infiniscope), as a cast trigger's is.
- Theme 15: `DelayedTrigger.x`, `.player` and `.remembered`, handed to the fired ability by `carryDelayedIdentity`
  (the creator's X only where the ability has none of its own); `remember` on `delayed-trigger` and
  `reflexive-trigger`.
- **Not moved this session**, each with its reason:
  - The `this-way` condition, the filter clauses `thisWay` / `notThisWay` and the `thisWay` amount's counting modes
    read this way directly (live, unbound, no binding step), so they stay; they are the same set as `{ thisWay }`.
  - The condition kinds `sacrificed` and `discarded` ("if the sacrificed creature was …") read `{ paid }`'s one
    member now; folding them into a general "member matches" condition is theme 7's (relational clauses).
  - `LastKnownRefs.attackers` keeps what each attacker attacked (Mangara's re-check), which a set doesn't.
  - Other `"exiled-this-way"` words in other vocabularies (`cast-now`'s `from`, `choose-from-zone`'s `zone`,
    `become-foretold`'s target) are verbs on this way's cards, theme 1's "each still need their verb".
  - "Sacrifice any number of creatures" as a cost (Corpse Cobble, Soulblast, Sword of the Ages,
    `amount:total-power-sacrificed-as-cost`): the aggregate `in: { paid: "sacrificed" }` reads it once there is
    such a cost — step 6's cost pipeline.
  - "Shares a creature type with **each** creature tapped this way" (Cryptic Gateway): the share reference is the
    union of the members' types, which is "a member of"; "each" is a different relation (theme 7).
  - Counters of two kinds put at once are two `counter-added` events, so a counters-put trigger fires once per
    kind (rule 603.2c would have one event); Captain Marvel copies the same counters either way. Recorded as an
    engine rules gap.
- Measured: a timed `bot:bench` (16 games, four players, 8 workers, nothing else running) played the same games
  (12-4, 38.9 turns on average) at 71.1 s a game and 119.5 ms a decision, against 70.0 s and 117.5 ms just before.
  A first run read 79.1 s with seed 8 timing out; seed 8 replayed alone played the same game on both builds (77 s
  against 75 s), and the old build's bench re-run beside it read 94.2 s: this machine's spread, not the change.

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

**Design note (step 4, 2026-11-07): one table of trigger events, one timing wrapper.**

*Where it lives.* `engine/src/trigger-events.ts`, pure, as `journal.ts` is for step 3: the table, its types and the
lookups by event type. `Game.triggerMatches` gains one arm for it and one wrapper check in `detectTriggers`.

*The generic member.* `{ on: "event", event: TriggerEventName, who?, filter?, by? }`. The shape the survey proposed
(`player?, object?, cause?, value?`) is the same thing spelled apart from the other 87 kinds; the code argues for
their words, because `who` and `filter` are what `matchesWho` / `matchesWhoPlayer`, the bots' trigger knowledge
(`features.ts` reads `trigger.who`) and the text tools already read:
- `event` is a **word of the table**, not a raw `GameEvent["type"]`: `"surveilled"` is a `scried` event of mode
  surveil, `"became-monarch"` a `monarch-changed` read from the new monarch's side, `"won-coin-flip"` a
  `coin-flipped` that was won. Each row of `TRIGGER_EVENTS` (`as const satisfies`, so a new word is one row) names
  its `GameEvent` type, an optional `when` over the event, and how the event names its parts: `player` (whose act or
  whose state it is), `object` or `objects` (what it happened to), `by` (who did it, where that differs from both:
  the player who tapped a creature, 701.26), and `amount` (what `triggerValue` reads: "that much", "that many").
- `who` relates the event's **subject** to the ability's controller exactly as every other kind's does: the object
  where the row has one (`"self"`, `"you-control"`, `"opponent"` — an opponent controls it, `"attached"`), otherwise
  the player (`"you"`, `"opponent"`, `"attached"` — the enchanted player). `filter` asks about the object.
  `by` relates the row's `by` player the same way. (As built, the one card-facing "by" so far — "whenever **you**
  tap an untapped creature an opponent controls" — went on the existing `becomes-tapped` kind as its `by`, since that
  kind's batching and attack narrowing were the substance: `who: "opponent", by: "you"`.)
- A row with `objects` (one event, several objects: `permanents-phased-in`) triggers **once per matching object**
  (603.2c: one event, several occurrences), each the trigger object; `batched: true` asks for "one or more" instead,
  once off the event with `triggerValue` the count, as the batched kinds already do.
- "That player" (`trigger-player` scope, `LastKnownRefs.player`) and "that creature" (`trigger-object`) come from the
  row, through `eventTriggerObject` and `refsAtTrigger`, which fall back to the table by event type.
- **Index by event type.** The table is inverted once into `TRIGGER_EVENTS_BY_TYPE`, so the arm's first test is the
  event's type against its row's (one string compare), and `refsAtTrigger` finds a row in one lookup. The per-object
  scan in `detectTriggersUncached` is unchanged: no other arm got slower.

*Look-back (603.10a).* A subject that has left (a creature that connived as it last existed, 701.50b) is matched
as it last existed: the arm passes the last-known flag to `matchesWho` / `triggerFilterOk` for an object off the
battlefield with a snapshot. A phased-out permanent is another matter: it isn't in the trigger scan at all, so
"whenever this phases out" waits (see *As built*). Leave-the-battlefield and sacrifice kinds keep their own arms
(below), where the look-back sources are the substance.

*The timing wrapper, on every trigger.* Lifted off the kinds onto one place, `TriggerTiming`, intersected into
`TriggerSpec` (`TriggerSpec = TriggerKind & TriggerTiming`), so every kind, the generic one included, takes it, and
the card files that already spell `firstTimeEachTurn` / `nthEachTurn` inside their trigger don't change:
- `firstTimeEachTurn: true` ≡ `nthEachTurn: 1`; `nthEachTurn: N`: **this is the Nth time this turn that this
  trigger's event, as this trigger reads it, has happened** — counting events before the source existed (the
  rulings for every such card), and whether or not this ability triggered then. "As this trigger reads it" is the
  spec without the wrapper, for the same subject: the same player for a player's act ("your second spell", "you lose
  life for the first time"), the same object in the same stint for an object's ("this creature attacks for the first
  time", "counters are put on that creature for the first time"), with the spec's own narrowing — valiant's "a spell
  or ability you control" counts only yours, Angelic Cub's counts anyone's, which is why
  `firstTimeEachTurnByAnyone` goes; a `counter` kind or a `filter` narrows what counts (U.S.S. Enterprise-D: charge
  counters; "your first enchantment spell").
- Answered **from the journal**: `Game.timingCount(spec, event, self)` maps each kind that supports it to its journal
  kind, subject and narrowing, and counts the entries this turn that aren't the event's own. Triggers are detected
  synchronously in `emit`, right after `recordJournal`, so the journal holds exactly the events up to this one; the
  event's own entries are the ones naming its objects (a batch) or the last one (a single act). Where the journal
  is written ahead of the event (B277's whole attack declaration), the subject's own unit still counts right: one
  `attacked` entry per creature per combat, and an attack "with one or more creatures" is counted by distinct combat.
- `oncePerTurn` (603.2: "this ability triggers only once each turn") stays on `TriggeredAbility` (it is the
  ability's, not the event's) but is answered from a `triggered` journal entry keyed by the ability, not
  `GameObject.triggeredOnce`.
- "Do this only once each turn" (603.2h: the ability **triggers only if** its controller hasn't yet taken that action
  that turn). Today it is `may`'s `oncePerTurn`, asked as the ability resolves: the ability triggers, goes on the
  stack and is merely not offered again, which 603.2h says it must not do (a Strionic Resonator could copy it; a
  "whenever an ability triggers" card would see it). The wrapper asks it as the ability triggers too, from the
  ability's `did` journal entry, and the `may` keeps asking on resolution (two copies on the stack at once).
- The intervening if (603.4) is `TriggeredAbility.condition`, unchanged, and `whileCondition` (603.1) beside it: both
  already read the journal through `turn-history` conditions since B277.

*Usage limits, onto the journal.* Each is "count entries of kind K for this ability this turn", keyed by the
existing ability key (`abilityTurnKey`: source, its timestamp, which ability), held in a new entry field
`ability`: `activated` entries (now every activation the limits or a reader ask about, not only loyalty and equip)
replace `GameObject.abilitiesUsedThisTurn` and `grantedUsedThisTurn` (602.5b, "activate only once / twice each
turn") and `GameState.abilityActivationsThisTurn` (Dragon Whelp); `resolved` entries replace
`abilityResolutionsThisTurn` ("the Nth time this ability has resolved this turn"); `did` entries (a mode chosen,
`mode` its index) replace `modesChosenThisTurn` ("choose one that hasn't been chosen this turn", `may`'s
`oncePerTurn`); `done` entries replace `abilitiesDoneThisTurn` (Carpet of Flowers). `modesChosenEver` is whole-game
state (Silent Hallcreeper, "hasn't been chosen" ever) and stays.

*What it replaces.*
- The per-kind first/nth flags: `gains-life`, `becomes-target` (and `firstTimeEachTurnByAnyone`), `attacks`,
  `becomes-saddled`, `put-into-graveyard`, `discards`, `becomes-tapped`'s `firstTimeEachTurn`;
  `attack-with`'s `totalPower.firstTimeEachTurn`; `draws`' and `cast-spell`'s `nthEachTurn` and `cast-spell`'s
  `firstEachTurn`; `loses-life`'s `firstDuringTheirTurn` (a first time each turn with a their-turn trigger
  condition). With them the event-carried flags that answered them (`card-drawn.nthThisTurn`,
  `object-targeted.firstByPlayerThisTurn` / `firstThisTurn`, `permanent-tapped.firstThisTurn`,
  `attacker-declared.firstThisTurn`, `became-saddled.first`) and the helpers behind them
  (`reachedGraveyardEarlier`, `firstMatchingDiscardThisTurn`).
- `{ on: "predicate", match }`: no card, no `self`, no controller, nothing a bot or a text tool can read. Deleted.
- The hand-written kinds that are an event, a subject and nothing else become rows, their card sites rewritten:
  `forages`, `rolls-dice`, `takes-initiative`, `ventures`, `completes-dungeon`, `player-loses-game`, `surveils`,
  `searches-library`, `evidence-collected`, `discovers`, `foretells`, `crime-committed`, `becomes-renowned`,
  `becomes-monstrous`, `fights`, `wins-coin-flip`, `becomes-untapped`, `players-finish-voting`. Kinds with a
  narrowing of their own (`scries`' `orSurveil`, `exerted`'s `asItAttacks`, `class-level-gained`'s level,
  `door-unlocked`, `ring-tempts`' `chosen`, `day-night-changes`' `becomes`, `mills`' and `cycles`' filters over a
  batch) could be rows with a `when` each, but are left for now: each is its own small field, and no key waits on
  them. The zone-change, combat, damage, cast and activation kinds keep their arms: their look-back, batching and
  LKI rules are the substance, not the event.
- The usage-limit fields above, each deleted with its last reader.

*Bots.* `effect-worth.ts` and `features.ts` read `trigger.on` for a handful of kinds and `trigger.who` for the rest;
the generic member keeps `who`, so the "who fires it" terms (once per opponent, once for anyone) read it unchanged.
`isOneShot` gains the generic rows that can only happen once to their subject, and `features.ts`' per-opponent
discount reads the wrapper's `nthEachTurn` for every kind, not only `cast-spell`.

*As built (B278).*
- `trigger-events.ts` as above: 25 rows (the 19 absorbed kinds, renamed where a card's word reads better —
  `loses-game`, `collects-evidence`, `commits-crime`, `voting-finishes` — and `proliferates`, `becomes-monarch`,
  `phases-in`, `connives`, `becomes-crewed`, `bends`). `who` absent is `"any"`; a departed object (a creature that
  connived as it last existed) is matched as it last existed. Two new events: `connived` (after the connive's
  counters) and `became-crewed` (as a crew ability resolves, 702.122e: the stack object keeps its crew,
  `GameObject.crewedWith`); and `bent` (Avatar Aang), announced at each bending's own moment (701.65b, 701.66b,
  701.67c, 702.189b — a firebending ability is marked `TriggeredAbility.firebending` by its helper).
- The wrapper is `TriggerTiming`, `TriggerSpec = TriggerKind & TriggerTiming`. `Game.triggerMatches` is now the
  kind's match (`triggerKindMatches`) and then `timingOk`; `timingCountable` (trigger-events.ts) is the one list of
  kinds it can count for, and `test/trigger-timing.test.ts` walks every definition (granted triggers included) to
  keep cards off the rest. Counted from the journal: `life-gained`/`life-lost`, `card-drawn`, `attacked` (per creature
  per combat; per declaration for `attack-with`), `tapped`, `counters-put`, `discarded`, `to-graveyard`, and two new
  kinds, `targeted` (valiant; `GameObject.targetedThisTurn` deleted) and `saddled`. `cast-spell` still counts from
  `PlayerState.spellsCastThisTurnAs`, the cast record B277 left (its own change).
- Deleted: the per-kind flags (`gains-life`, `becomes-target`, `attacks`, `becomes-saddled`, `put-into-graveyard`,
  `discards`, `becomes-tapped` `firstTimeEachTurn`; `firstTimeEachTurnByAnyone`; `attack-with`'s
  `totalPower.firstTimeEachTurn`; `draws`' and `cast-spell`'s `nthEachTurn`; `cast-spell`'s `firstEachTurn`;
  `loses-life`'s `firstDuringTheirTurn`, now `duringTheirTurn` with the wrapper), the event flags behind them
  (`card-drawn.nthThisTurn`, `object-targeted.firstByPlayerThisTurn` / `firstThisTurn`,
  `permanent-tapped.firstThisTurn` with `GameObject.tappedOnTurn`, `attacker-declared.firstThisTurn` with
  `DeclaredAttacker.first`, `became-saddled.first`), `reachedGraveyardEarlier`, `firstMatchingDiscardThisTurn`, the
  `predicate` member, and 19 kinds with their arms. Card sites rewritten (152 files spelled the flags; the renamed
  ones by tsc's own error positions, so `firstEachTurn` on cost grants was left alone).
- Usage limits on the journal, the entry's new `ability` (an opaque key) and `mode` fields: `activated` entries
  (602.5b's limits by object, stint and ability — not the timestamp, which a change of control renews — and Dragon
  Whelp's count), `triggered` (603.2, `GameObject.triggeredOnce` deleted), `resolved` (journaled only for an ability
  whose text reads `resolved-this-turn`), `did` (modes chosen this turn), `done` (Carpet of Flowers). Deleted:
  `GameObject.abilitiesUsedThisTurn`, `grantedUsedThisTurn`, `triggeredOnce`; `GameState.abilityResolutionsThisTurn`,
  `abilityActivationsThisTurn`, `modesChosenThisTurn`, `abilitiesDoneThisTurn`. `modesChosenEver` stays: whole-game
  state, which the journal prunes. Token folding compares the new per-object kinds as it does `counters-put`.
- 603.2h, a rules change: a `may` with `oncePerTurn` that is the whole effect now keeps its ability from triggering
  once done that turn (`Game.didOnceThisTurn`); `test/ability-turn-choices.test.ts`'s invented "if you don't" card
  expected the old shortcut and was corrected.
- Smaller pieces the flagged cards needed: `activates-ability`'s `orMana` (a mana ability counts, one activated to pay
  a cost announced only while a printed `orMana` watcher is on the battlefield, `Game.manaActivationWatched`) and
  `removedAtLeast` (a loyalty cost's size); `StaticAbility.conniveDrawsFirst` (Leader's replacement, once per ability,
  614.5); the batched damage trigger's sources as `LastKnownRefs.dealtTogether` for a filter's `triggerBatch`
  (Tamiyo's "those creatures"); `transform`'s `then` ("if you do").
- **Not moved this session**, each with its reason:
  - Kinds with a narrowing of their own stay kinds (listed above: `scries`, `exerted`, `class-level-gained`,
    `door-unlocked`, `ring-tempts`, `day-night-changes`, `mills`, `cycles`), as do the zone-change, combat, damage,
    cast and activation kinds.
  - `enters-battlefield`'s `firstCreationEachTurn` ("whenever you create one or more tokens for the first time each
    turn"): a different event (the creation, not the entry), read from the journal already as the creation happens;
    it becomes a row when token creation is one (`token-created`).
  - `phases-out` has no row: a phased-out permanent isn't in the trigger scan (`detectTriggersUncached`), so "whenever
    this phases out" (Teferi's Imp) needs the scan to look back at it first — key `trigger:phases-out`.
  - A granted `orMana` trigger isn't seen by `manaActivationWatched` (printed only; no card grants one).
- Two costs found by the bench, both fixed: the usage limits are asked on every legal-action query and every trigger
  scan, so counting them by scanning the journal each time made the first cut 53% slower a game (101.8 s); they now
  read an incremental index kept beside the state per entries array (`abilityIndex` in journal.ts: it reads only what
  was appended since, and starts again after a prune, a clone or a new turn). And `markTriggeredOnce` runs inside
  `detectTriggers`' cache region, so appending through `Game.journal` there cleared the computed cache for the rest of
  every scan; it appends directly (nothing cached reads `triggered` entries).
- Measured: a timed `bot:bench` (16 games, four players, 8 workers, the machine otherwise idle) played the same games
  (12-4, 38.9 turns on average) at 65.9 s a game and 111.2 ms a decision, against 66.5 s and 112.05 ms just before and
  65.4 s and 110.1 ms for the old build re-run beside it: no change. (A run with a typecheck beside it read 86 s.)
  Single-process replays of seeds 8 and 14, v1 and v2, took the same time on both builds.

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

**Design note (step 7, 2026-11-09): theme 3c, one prohibition record.** Frozen in Ice is the flagged card.

*What's wrong today.* "Can't" has about a dozen homes. `StaticAbility.prohibits` is a bag of optional fields (`spells`, `castLimit`, `abilitiesOf`, five `except`/`only` flags, `drawsPerTurn`, `lands`, `from`, `notFrom`, `castOnlyAsSorcery`), so a new act means another optional field. An effect that says the same thing goes somewhere else again: `turnProhibitions` for "this turn", `PlayerEffect.cantCast` / `castOnlyFromHand` / `castCaps` for a longer one, `PlayerState.cantCastSpellsForGame` for epic. Losing, winning, life and searching each have a static field or two and a `PlayerEffect` field, read by their own function. Nothing at all says "can't become untapped", "can't transform", "can't phase", "can't enter the battlefield", "can't pay life to cast", "can't cause you to sacrifice", or "can't be the target of what your opponents control".

*Measured first.* `prohibits:` 107 card files in 49 distinct shapes, every one a mechanical rewrite. `kind: "prohibit"` 39 files in 18 shapes, of which 16 are regeneration, which stays. `cantCast` 10, `cantLoseGame`/`cantWinGame` and the opponents' pair 20 uses, `cantSearchLibraries` 5, life 6. The filters in an effect need no new binding: `applyEffectSpec` already walks a spec and binds `sameNameWith` and `CHOSEN_CARD_NAME`. `prohibitionsOn` walks the whole board on each call, so the new read's memo is cheaper than today's even with more gates.

*Where it lives.* `engine/src/prohibitions.ts`, the types and every read.

- **`Prohibition`**, one union on `act`. Acts by a player take `who`: `cast` (`filter`, `from`, `notFrom`, `limit`, `unless: "sorcery-timing" | "own-turn"`), `play-land`, `activate` (`of`, `except`, `only`, `anyZone`, `unless`), `draw` (`perTurn`), `search` (`causedByThemselves`, `ignoreCost`), `lose-game` (`only: "zero-life"`), `win-game`, `lose-life`, `change-life`, `become-monarch`, `pay-life` and `sacrifice-for-cost` (`except`, `filter`), `be-caused` (`what: "discard" | "sacrifice"`, `by`). Acts that happen to an object take `object` (a `CardFilter`, so `hostOfSource` and a zone work): `untap`, `transform`, `phase-in`, `phase-out`, `enter`, `be-attached`, `become-suspected`. `be-targeted` and `get-counters` take either.
- **`who`** is the static's words (`"you"`, `"opponents"`, `"each-player"`, `"enchanted-player"`, plus `"enchanted-controller"` and `"defending-player"`), an effect's `PlayerScope`, or, once stored, `{ players }`. An effect's object is `target: ObjectRef`, stored as `objects: [{ object, stint }]`.
- **One store.** `StaticAbility.prohibits` is `readonly Prohibition[]`. The `prohibit` effect is `{ prohibits, duration? }` and lowers to a timed static (theme 3b) whose `who` and objects are bound as it resolves (rule 611.2c: it changes rules, so a filter still reaches whatever comes later). Epic is a `permanent` one.
- **One read.** `liveProhibitions(state, registry, act)`, memoized per cache region, then a `player` or `object` test per gate. `Game.whyProhibitedFromCasting`, `whyLandPlayProhibited`, `abilitiesProhibited` and `cantDrawMore` read it, and `playerCantLoseGame` and its siblings move here.
- **`targetsIgnoringHexproof`** is the one permission here, beside the gate it opens (rule 702.11; `static:ignore-hexproof`). **`playerKeywords: ["hexproof" | "shroud"]`** takes `playerHexproof`'s place, because a player's shroud is a keyword: Kaya's "as though they didn't have hexproof" has to tell hexproof from "can't be targeted by your opponents" (702.18, 702.11).

*Rules.* 101.2 "can't" beats "can"; 119.4b, 119.7, 119.8 life; 104.2a, 104.3a winning and losing; 305.2 land plays; 601.2a, 601.3 casting; 602.5 activating; 611.2c rule-changing effects; 702.11, 702.18 hexproof, shroud; 702.50b epic; 704.5a the zero-life loss; 701.21a sacrificing; 122.1c stun. Rulings: Grafdigger's Cage leaves the card where it is; Angel of Jubilation and Yasharn stop life paid to cast or activate, not a shock land's life; Sigarda stops an edict from an opponent's spell, not a cost you pay yourself.

*Moved or not, decided before building.* **Moved and deleted:** the bag of `prohibits` fields; `prohibit`'s `who`/`spells`/`abilities`/`lands`/`monarch`; `turnProhibitions`; `cantCastSpellsForGame`; `PlayerEffect.cantCast`, `castOnlyFromHand`, `castCaps`, `cantLoseGame`, `cantWinGame`, `cantLoseLife`, `lifeCantChange`, `cantSearchLibraries`; the statics `cantLoseGame`, `cantWinGame`, `opponentsCantWinGame`, `opponentsCantLoseGame`, `cantSearchLibraries`, `cantBecomeSuspected`, `preventsCounters`, `graveyardCardsUntargetable`, `playerHexproof`. Deliberately not moved:
- *`cantBeSacrificed`*: folded through the layers and granted by modifiers (25 reads), an ability that goes when the permanent loses its abilities. A `prohibit` could say it but the fold would stay for the modifier form.
- *Regeneration on `prohibit`* (16 files): it marks the object for one shield's rule, no `who` to bind and nothing it shares with the gates.
- *`abilitiesCantBeActivated`*: detain's, one modifier beside its combat rules (theme 11). Dovin Baan's "until your next turn" moves to the record.
- *`cantBeCountered` (101 files) and `cantBeCopied`*: mostly a card's own definition, read on the stack.
- *"Players can't gain life"*: a replacement with `prevent` since theme 9, and it reads as one in the journal.
- *`hexproofPlayers`, `hexproofFromPlayers`, `protectionFromEverything`*: keyword grants to a player with their own damage and enchant readers; left for whichever key needs them, and the timed static says the new forms.

*Bots.* `target-polarity` already calls any `prohibits` harm; the `prohibit` effect's entry reads the new `who`. v2 simulates the resolution, so it sees the effect. No new decision kind: every new act is a gate that takes options away.

*As built (step 7, B290).*
- `prohibitions.ts`: `Prohibition<W>`, `EffectProhibition`, `StaticWho`, `BoundPlayers`, `BoundObject`, `ObjectSide`, `liveProhibitions` (memoized), `prohibitionsOnPlayer`, `whoBinds`, `reachesObject`, `objectProhibited`, `targetProhibited`, `targetsIgnoreHexproof`, `causeProhibited`, `costExempt`, and the five player reads moved out of `characteristics.ts`. `Game.prohibit` makes the timed static; `Game.emitProhibitions` keeps the log line.
- **Moved and deleted, every user migrated:** the `prohibits` bag (107 card files), the `prohibit` effect's `who`/`spells`/`abilities`/`lands`/`monarch`, `turnProhibitions`, `PlayerState.cantCastSpellsForGame`, `cantBecomeMonarchTurn`, `PlayerEffect.cantCast`/`castCaps`/`castOnlyFromHand`/`cantLoseGame`/`cantWinGame`/`cantLoseLife`/`cantSearchLibraries`/`lifeCantChange`, and the statics `cantLoseGame`, `cantWinGame`, `opponentsCantWinGame`, `opponentsCantLoseGame`, `cantSearchLibraries`, `cantBecomeSuspected`, `preventsCounters`, `graveyardCardsUntargetable`, `playerHexproof`. 205 card and test files by a script, run once, and the scaffolder's output; `test/prohibitions.test.ts` refuses the removed spellings.
- **Differences from the note:** regeneration moved to its own effect kind, `cant-regenerate`, rather than staying on `prohibit`, so `prohibit` is one shape. `{ act: "be-targeted", only }` has only `"spells"`, since no proving card needs the activated-only form. A `during`-a-turn prohibition waits in `laterPlayerEffects` as a `LaterTimedStatic` (Azor, Sphinx's Decree). The log line's "certain spells" replaces the per-card `label`s, which a filter doesn't say.
- **Behaviour changes:** A resolved "this turn" prohibition outlasts the player who made it (rule 800.4a); an emblem still doesn't. "Enchanted creature can't be the target of what your opponents control" reads the Aura controller's opponents, where the scaffolder used to write `hexproofFrom`, read from the creature's controller. `canPayLife` takes `"cost" | "mana-ability" | "not-a-cost"` and the shock-land, ward, attack-tax, block-tax and may-pay sites pass the last.
- **A bug the proving test found:** a player at 0 life under `only: "zero-life"` also skipped the poison check, because the state-based check was an `else if` chain. The life branch now asks first.
- **Not benched:** the memo replaces a board walk per call. `prohibitionTable` is per cache region; the condition is read fresh.
- Scaffolder: every output moved, and "Enchanted creature can't be the target of … your opponents control" now writes the record. It doesn't read the new acts otherwise.
- Cards (33): Frozen in Ice (flagged); Blossombind; Ivory Mask; True Believer; Gilded Light; Glaring Spotlight; Kaya, Bane of the Dead; Detection Tower; Canopy Cover; Shielding Plax; Vines of Vastwood; Veilstone Amulet; Sigarda, Host of Herons; Tajuru Preserver; Grafdigger's Cage; Kunoros, Hound of Athreos; Soulless Jailer; Weathered Runestone; Angel of Jubilation; Karn's Sylex; City of Solitude; Dosan the Falling Leaf; Melira's Keepers; Tatterkite; Goblin Brawler; Spatial Binding; Platinum Emperion; Wardscale Dragon; Brand of Ill Omen; Lich's Tomb; Immerwolf; Gaea's Revenge; Anti-Magic Aura. Each has a test in `test/prohibitions.test.ts` except those whose gate another card there proves (Tajuru Preserver, Weathered Runestone, Soulless Jailer, Ivory Mask, Detection Tower, Tatterkite, Canopy Cover, Dosan the Falling Leaf, Brand of Ill Omen).
- Keys marked built (24): `static:cant-become-untapped`, `static:ignore-hexproof`, `static:player-shroud-static`, `effect:player-shroud-until-end-of-turn`, `static:untargetable-by-casters-opponents`, `static:cant-be-targeted-by-source-controllers-opponents`, `static:opponent-cant-cause-sacrifice`, `static:graveyard-enter-prohibition`, `static:zone-entry-prohibition`, `static:prohibit-cast-from-graveyard-or-library`, `static:cant-pay-life-or-sacrifice-creatures-for-costs`, `static:cant-pay-life-for-spells-and-abilities`, `static:prohibit-outside-own-turn`, `static:cant-have-counters-self`, `static:cant-be-equipped`, `effect:cant-phase-out`, `static:your-life-total-cant-change`, `static:defending-player-cant-cast`, `static:prohibit-enchanted-controller`, `static:dont-lose-for-zero-life`, `static:cant-transform`, `static:cant-be-enchanted-by-other-auras`, `static:untargetable-by-nongreen`, `static:graveyard-cards-untargetable`. Their other cards are in `--stale` for `author-freed`.
- **Left unbuilt, not marked:** `effect:cant-become-untapped-while-you-control-source` (Spider-Woman: a timed static has no `while-you-control-source` end), `static:opponent-cant-cause-discard` (the gate is in, and it fires after the discard's choice is asked; Tamiyo wasn't tried), `static:cant-pay-life-or-sacrifice-nonland-for-costs` (Yasharn's search for two named basics at once wasn't tried), `static:counter-cap`, `static:must-target-flagbearer`, `static:cant-gain-control`, Peace Talks' "spells or activated abilities", per-player `who` tests (Ward of Bones, Angelic Arbiter). No new player decision, so no manual check.

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

**Design note (step 6, 2026-11-08): one amount, one spell clause, and effects as costs.**

*(a) Modifiers take `EffectAmount`.* `CostReductionAmount` goes. `costModification`'s `reduceGeneric` /
`increaseGeneric` / `reduceColoredTimes`, `abilityCostModification`'s, a card's `costReduction` / `selfCostReduction`,
an ability's `costReduction` and `timesEachTurn`, and `maxX` all take an `EffectAmount`, read by one
`Game.costAmount(amount, player, source, priced?)` through `amountValue` in a resolution context of the static's
source and controller. A number never builds a context, so the common case stays what it was on every legal-action
query. The object being priced is the `AmountRef` `"priced"` (the spell, or the source of the ability, whose cost
is worked out), so "where X is that spell's mana value" needs no field. `CostReductionAmount`'s members become the
amount of the same meaning: `scaled` a `product`, `opponents` and `playersInGame` a `countPlayers`, `countersOnSource`
a `countersOn`, `cardsInGraveyard` a `countInGraveyard`, `greatestOpponentCount` an `amongPlayers`; the two with no
equal (`allCounters`, `commanderManaValue`) become `EffectAmount` members.

*The spell clause.* One `SpellCastClause` (`when` on `costModification` and `alternativeCostForSpells`) says which
casts it reaches: `caster`, `castFrom` (with `castFromAnyones`), `notFromCastersHand`, `exceptOnCastersTurn`, `yourTurnOnly`,
`kicked`, `firstEachTurn` (the caster's casts this turn matching the static's filter, read from
`PlayerState.spellsCastThisTurnAs`, the one cast record step 3's journal left where it was). It replaces those flat fields there and `alternativeCostForSpells`' own
`fromHand` / `fromZones` / `oncePerTurn` / `yourTurnOnly`. The target-keyed fields (`perTarget`, `targeting`,
`targetingSource`) stay beside it: they are what the offer's "assume the best target" path is keyed on.

*(b) Effects as costs.* `AbilityCost.do` and `KickerAlsoCost.do` (so a kicker's, an additional cost's, an escalate's
and an option's) take an `EffectSpec` whose every step has a row in `COST_ACTS` (`engine/src/cost-acts.ts`, one table
plus one check, as `trigger-events.ts`): for each kind, whether it can be paid in full now (118.3; built on
`mayBeDone`, a `sequence` needing every step and a `modal` some mode), the most an X could be, whether it may ask a
player something, and whether it moves a card from a library or is random. Payment:
- **Announced** like any other part: the X it allows caps the offer (601.2b); nothing is paid unless every part is
  payable (601.2h: "partial payments are not allowed"), the payability check being read before anything moves.
- **Paid** once the object is on the stack: first among the parts asked for then, except what a row marks random or moving
  a card from a library, which 601.2h pays after the rest (`pendingAlsoCosts`; Sinister Concoction's mill waits for its discard). `Game.payCostAct` applies the effect in a context of the ability's source and
  controller, X and targets, as a resolution would; a decision it raises is an ordinary dispatched one, and what's
  left waits in `suspendedResolutions`, which already holds state-based actions and priority off (117.5).
- **Mana abilities** (605.3b) don't use the stack: the `do` and the mana run as one sequence, so the mana waits on the
  answer. One whose act can't be planned is never used by the auto-payer, and one moving a card to or from a library
  isn't a mana ability at all (605.1a reads `COST_ACTS`).
- **Paid objects** go into `{ paid }` by an internal last step of the sequence, which reads the events since the act
  began and calls `Game.recordPaid`, so a cost paid over several decisions is one set.

The old automatic parts move onto it and go; what moved and what stayed is listed in *As built* below, with the reason for
each one left. "Sacrifice any number" as a cost is `sacrificeCount: "x"` (Corpse Cobble), "sacrifice all" a `do`
(Soulblast).

*(c) Keyword costs with parameters.* `kicker.cost` may be `{X}` (702.33: an X announced with the cost, `timesKicked`
as usual, read as the spell's X); a granted replicate is one `grantsReplicate` static (cost `"mana-cost"` or a string);
a modal spell's `maxModes` reads `ifKicked`.

*Rules.* 601.2b (announced), 601.2f (total locked in: increases, then reductions, in `Game`'s existing order), 601.2h
(paid in full, random and library parts last), 602.2b (the same for abilities), 605.1a and 605.3b (mana abilities),
118.3 (payable in full), 118.8 and 118.9d (additional costs apply to alternative ones). `do` decisions are ordinary
registered ones (`decision-registry.md`).

*Bots.* `features.ts` and `target-polarity.ts` read `costLosesSource` (a `do` that exiles or moves the source counts as a
sacrifice of it) where they asked `cost.sacrifice === "self"`. `effect-worth.ts` prices the choices a resolving effect offers,
not an activation's cost, so it has nothing to learn; v2 simulates activations, so it pays a `do` as the table does.

*As built (step 6, theme 4).*
- `CostReductionAmount` deleted, every field an `EffectAmount` through `Game.costAmount`; `SpellCastClause` (`when`) on both
  statics; `alternativeAbilityCost` (`kind` `"cycling"`, `"equip"`, `"power-up"`) replaced `alternativeCyclingCost` and
  `alternativeEquipCost`; `abilityKind` gained `"power-up"`. The flat fields are gone from the pool, the scaffolder and the tests;
  `test/cost-pipeline.test.ts` walks every definition for them.
- `AbilityCost.do` and `KickerAlsoCost.do`, with `cost-acts.ts`'s `COST_ACTS`, `costActPayable`, `payableCostAct`, `costActMaxX`,
  `costActReadsX`, `costActMovesLibrary` (605.1a, read by `isManaAbility`), `costActPaidLast` and `costActLosesSource`.
  `Game.payCostAct` adds a last internal `cost-paid` step that records the act's objects in `{ paid }`. `GameState.costPriorityTo`
  hands priority back to the payer after a decision, since a decision's answer otherwise gives it to the active player (117.3c).
- Deleted, every user moved: `AbilityCost`'s `mill`, `exileTop`, `exileSelf`, `returnSelfToHand`, `exertSelf`, `discardHand`, and
  `AdditionalCostOption`'s `discard` and `blight` (onto `also.do`). `pay-energy` takes an amount; a blight paid as a cost still
  takes only a creature a counter can go on (`makeResolutionContext`'s `payingCost`).
- **Not moved**, each with its reason:
  - `sacrifice`, `tapOthers`, `unattach`, `waterbend`: named on the wire `cast-spell` / `activate-ability` action and offered as
    variants, so moving them changes `LegalAction` and the client. `removeCounter` has an offer of its own for chosen counters.
  - `payLife` and `payEnergy`: paying isn't an instruction any effect gives (119.4, 107.14), and the auto-payer reads them.
  - `discard`, `exileFromGraveyard`, `exileFromHand`, `exileSpell`, `putFromExile`, `reveal`, `returnToHand`, `untapOthers`,
    `blight`, `collectEvidence`, `craft` on `AbilityCost`: each has X caps, source exclusions and a continuation of its own
    (mana abilities' `thenManaAbility`), and none of this step's cards needed them moved. New costs now use `do`, so the type no
    longer grows; the moves are mechanical, card by card, when one of these is next touched.
  - `AdditionalCostOption`'s `behold`: its `BeholdSpec` has `fromHand` and `exile`-and-link, which the `behold` effect lacks.
- `do` is paid first among the parts asked for after the object is on the stack, so craft's exile comes before its materials. Only
  one decision can wait at a time, so a `do` that may ask beside another part that asks is refused by a pool-wide test.
- A chosen sacrifice of several (`sacrificeCount`, `SacrificeCost.parts`) now records `{ paid: "sacrificed" }`, which it never did.
- Cards (18): Hulk, Gamma Goliath; Kang the Conqueror; Wonder Man, Hollywood Hero; Advancing the Spirit; The Dominion Bracelet;
  World War Hulk; Sphinx of the Revelation; Thornvault Forager; Feed the Cycle; Leashling; Timestream Navigator; Darksteel Monolith;
  Leyline of Mutation; Corpse Cobble; Soulblast; Verdeloth the Ancient; Inscription of Ruin; Varolz, the Scar-Striped.
- Keys marked built: the four power-up keys, `keyword:kicker-x`, `keyword:kicker-any-number-of-modes`,
  `cost:alternative-cost-for-spells-limits`, `cost:alternative-cost-for-all-spells`, `cost:pay-x-energy`, `cost:forage`,
  `cost:put-card-from-hand-on-library-top`, `cost:put-self-on-library-bottom`, `amount:total-power-sacrificed-as-cost`,
  `cost:granted-ability-exile-granter`, `effect:next-spell-free-this-turn`, `keyword:scavenge`.
- Measured: a timed `bot:bench` (16 games, four players, 8 workers, nothing else running) at 66.5 s a game and 115.3 ms a decision,
  38.1 turns on average, 11-5, against 70.1 s, 117.7 ms and 38.9 turns just before (12-4, the two benches within each other's
  intervals). A cost modifier with a non-numeric amount builds a resolution context as it's read; no slowdown shows.
- **Left unbuilt, not marked:** `static:grant-replicate` (a card's `kicker` is read off its definition in about 40 places; a grant needs a
  caster-aware effective kicker first), `cost:choose-creature-type-as-cast` (a choice before targets), `effect:pay-any-amount-of-mana`
  (Power Leak's "prevent X of that damage"), Baron Helmut Zemo (copying exiled cards and casting up to three) and Dawnhand Dissident
  (a cast permission with an additional cost: theme 10), and an alternative cost that's an action (Conspiracy Unraveler, Dream Halls:
  `alternativeCostForSpells` has only `mana`).

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

**Design note (step 6, 2026-11-08): one chooser type; the round already exists.**

*One `ChooserRef`* (`effects.ts`), resolved by `chooserPlayer(chooser, ctx)`: an `EffectPlayerRef`, a target slot (that player, or
the controller of that object), `"an-opponent"`, and three members only one effect kind reads (`"any-player"`, `{ anyOf }` and `{
player }`, for `unless`; `"their-controller"`, for `choose-among-targets`). It replaces the six spellings the effects had:
`choose-permanents`, `choose-card-name` (a bare slot number), `discard-chosen`, `unless`, `separate-into-piles`, `exile-into-piles`,
`choose-among-targets`, `look-and-choose`, `SearchInstead`, and `choose-one-of-each`'s `chosenBy`. A kind that lets another player
choose takes this field; `ChooserRef` is the answer to "who", so a new effect doesn't grow a seventh spelling.

*The round was already there.* The per-player combinator the survey asked for is `for-each-player` (a bound "that player",
`aboutPlayer`, APNAP order, `choicesHeld` for "each chooses, then together", rule 101.4) and `each-player-may`
(`startingWithYou`), and "repeat until a round in which nobody acts" is a `repeat` with `again: { kind: "this-way", … }`, which reads the
pass just done (`repeatSince`). Eureka and Curfew are written from them with no new effect kind, so none was added.

*Hidden information.* A chooser looking at another player's hidden zone is already what `look-and-choose`'s `show`/`faceDownLooks` and
`view.ts` redact by; no chooser this step adds crosses a hidden zone. Secret and simultaneous choices stay their own decision kind
(the survey's risk): `choose-creature-type`'s `secret` is unchanged.

*608.2c and 101.4.* A `sequence` asks each step before the next, and `for-each-player` parks the remaining players behind a decision,
so instructions are followed in order and APNAP choices are made in order.

*Bots.* `target-polarity.ts` already read a chooser in a slot as "either"; `ChooserRef` is a superset of what it reads. No new decision
kind, so no candidates to teach.

*As built (step 6, theme 5).*
- `ChooserRef`, `chooserPlayer`; `chosenBy` on `choose-one-of-each` is `chooser`.
- **Not moved:** `CastModalSpec.chosenBy` (`"you"` / `"opponent"`): a choice made as a spell is cast (700.2e) from the wire action, with no
  resolution context to resolve a ref in. `separate-into-piles`'s `separator` is the same type minus the rest, and stays until a card needs it.
- Cards (5): Curfew; Bane of Bala Ged; Eumidian Wastewaker; Eureka; For the Ancestors.
- Keys marked built: `effect:each-player-returns-own-permanent`, `effect:player-chooses-permanents-to-exile`,
  `effect:discard-or-sacrifice-choice`, `decision:choose-creature-type-on-resolution`.
- **Left unbuilt, not marked:** `decision:mixed-zone-targets` (one target slot over two zones), `decision:damage-redirect-order`,
  `effect:separate-exiled-cards-into-piles` (`PileObjects` has no exiled-this-way form), `decision:pay-per-chosen-untap`,
  `effect:target-per-opponent-mandatory`, `mechanic:piles`, `decision:opponent-guesses-mana-value`,
  `mechanic:coin-flip-by-other-player` (each a mechanic of its own beyond who chooses).

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
  - `revealedThisTurn` (the view's visibility), `drewInDrawStepThisTurn`, `saddledThisTurn` and `crewedThisTurn`
    (relations, which creature crewed which vehicle). (`targetedThisTurn` moved in step 4, B278.)
  - (Moved in step 4, B278: the usage limits keyed by ability — `abilitiesUsedThisTurn`, `grantedUsedThisTurn`,
    `abilitiesDoneThisTurn`, `abilityActivationsThisTurn`, `abilityResolutionsThisTurn`, `modesChosenThisTurn` — see
    theme 2's *As built*.)
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

**Design note (step 7, 2026-11-08): one `ObjectRef`, one `PlayerRef`, and filter clauses that take them.**

*Where it lives.* `engine/src/refs.ts`, types only, as `object-sets.ts` is for sets. Both refs are resolved in one place in
`effects.ts`: `objectRefAct` / `objectRefRead` and `playerRef`, over the resolution context. Filter clauses are bound by the
existing `bindDynamicCompares` as an effect applies, and read live by `filter.ts` for the few refs a static has.

*(a) The algebra.*

`ObjectRef` is one object:
- base refs, each one meaning everywhere: a slot number, `"source"`, `"trigger-object"`, `"attached"` (the source's host),
  `"chosen"`, `"granter"`, `"trigger-recipient"`, `"created"`, `"put-this-way"`, `"amassed"`, `"priced"`;
- any `ObjectSetRef`, meaning its one member (0 or several name nothing, as `onlyMember` already reads): `"tapped"` goes for
  `{ paid: "tapped" }`;
- composed: `{ hostOf: ObjectRef }` (what it's attached to) and `{ pairedWith: ObjectRef }` (702.95b).

`PlayerRef` is one player:
- base refs: `"you"`, `"active-player"`, `"trigger-controller"`, `"trigger-player"`, `"that-player"`, `"chosen-player"`,
  `"player-to-your-left"` / `"-right"`, `{ target: n }`;
- composed: `{ controllerOf: ObjectRef }`, `{ ownerOf: ObjectRef }`, `{ defendingPlayerOf: ObjectRef }`.

The set-valued accessor is an `ObjectSetRef`: `{ attachedTo: ObjectRef }` ("all Auras attached to that creature"), replacing
`"attached-to-source"`, and `{ targetsOf: ObjectRef }` ("those creatures" of a cast trigger's spell, Storm, Windrider).

`PlayerScope` becomes its plural words (`"each-player"`, `"each-opponent"`, the vote scopes, …) **or any `PlayerRef`**, plus `{
otherThan: PlayerRef }` ("each other player", Oft-Nabbed Goat), so every `who` slot takes every ref. No slot has a subset of its own:
`EffectTargetRef`, `AttachRef`, `AmountRef`, `DamageFrom`, `EffectPlayerRef` and `ChosenPlayerRef` are deleted, `AttachHostRef` is
`ObjectRef` plus its `{ among }` and a `{ player: PlayerRef }` (a Curse, Archnemesis), `ChooserRef` and `ShareReference` extend the refs
with the few words only they have. `"source-owner"`, `"source-controller"`, `"attached-controller"`, `"trigger-owner"`, `{
controllerOfTarget }` and `{ ownerOfTarget }` are spelled with the accessors and go.

*Reading and acting: what happens when the object has moved.* Two modes, because the rules have two:
- **Reading** information (an accessor's inner object, an amount, a share reference): the object's current information if it's in the
  public zone it was expected to be in; otherwise, or if the effect itself moved it to a hidden zone, its last known information
  (608.2h; for the source, 113.7a). `objectRefRead` returns the object; the context's reads (`controllerOf`, `ownerOf`, `colorsOf`, …)
  already pick the snapshot for the stint the reference recorded (`LastKnownRefs`, `targetZones`).
- **Acting** on the object needs it to be the same object still (400.7): `objectRefAct` returns nothing when it has moved, and an
  illegal slot names nothing (608.2b). So `{ hostOf: 0 }` as a damage target (Unforge) reads the host through the destroyed Equipment's
  last known information (`attachedTo` with `attachedToStint`, which it already keeps), then acts only if the host is still in that
  stint.
- `{ controllerOf }`: a permanent's or spell's controller, as last known once it has moved (a countered spell keeps its controller
  there, Counterbore's ruling, as `controllerOfTarget` did). A card with no controller is read as its owner (108.4a, 109.4). A player
  who has left names nobody, as every ref does today.
- `{ ownerOf }`: never changes (108.3), so it's known wherever the object is, a library or hand included.
- `{ defendingPlayerOf }`: the player it's attacking, or the controller of the planeswalker, or the protector of the battle (508.5,
  310.9d); no longer attacking, as it was before it was removed from combat (508.5), read from the journal's `attacked` entry rather
  than a new field. In a target's filter it's the same object's read, so "target creature defending player controls" on a spell is
  unchanged (`controlledByDefendingPlayer`, 508.5a).

*Public and hidden information.* A ref never reveals anything by being read: the accessors give only what is public (owner, controller
of a permanent or spell, what's attached), and a read of a set member in a hand or library that wasn't shown still reads nothing, as
`ctx.memberMatches` already does (`SetMember.shown`). A filter clause bound to a hidden reference (a name read from a card nobody has
been shown) binds to nothing, so a search for "the same name" as a card not revealed finds nothing; no card asks that without a
reveal, and Infernal Tutor's is `{ paid: "revealed" }`, which is shown. A face-down reference has no name (201.2a), colour or type.

*(b) Relational clauses.* Every clause that compares against an object takes an `ObjectRef` (or the `ShareReference` superset):
- `sameNameWith` replaces `sameNameAsTarget` and `sameNameAsTriggerObject`. Bound, a slot or trigger-object reference matches itself as
  the old clauses did ("target permanent and all other permanents with the same name", where a face-down target has no name, 201.2a).
- `sharesColorWith` (authored, any reference) replaces `sharesColorWithTarget` and `sharesColorWithHost`; its bound form is renamed.
  `sharesCreatureTypeWith: "attached"` replaces `sharesCreatureTypeWithHost`.
- `attachedToObject: ObjectRef` replaces `attachedToTarget`; "with an Aura attached" stays `attachments`, a filter on the attachment.
- `controlledByRef: PlayerRef`, bound to the existing `controllerIn`: "all lands that player controls" (`effect:tap-all-trigger-player-scope`,
  `condition:filter-controlled-by-trigger-player`), "the number of Swamps target player controls".
- `greatestInZone` and `greatestAmongItsController` take `least: true` (Witch-king, Porphyry Nodes). The per-object comparison is
  the same; the tie and fail-closed behaviours don't change.
- `hasKeyword: CardKeyword` reads a keyword ability off the card's definition, from one table (`CARD_KEYWORD_READS`), through `rulesTextName`
  as every text read must: `morph`, `madness`, `fading`, `unearth`, `freerunning`, `awaken`, `disturb`, `warp`, `modular`, and the old
  `hasKicker`, `hasCycling`, `hasFlashback`, `hasConvoke`, `hasDisguise`, `hasSuspend`, `hasMutate` (each with its existing care, as a row). `keyword`
  stays for the abilities the layers compute. `hasAdventure` isn't a keyword (715), and stays.
- `hasActivatedAbility: { mana?: boolean }`: `condition:filter-has-nonmana-activated-ability`.
- Spell-context: `castFrom` takes `{ not: ZoneType }`; `cast: false` already says "wasn't cast" and an others-enter replacement can read it.
- One condition, `{ kind: "object-matches", object: ObjectRef, filter }`, reading the object as `objectRefRead` does, replaces the
  `sacrificed` and `discarded` conditions (step 5's leftover). Its read is `ctx.memberMatches`-like, so a member keeps its `was`.
- "Target creature that player controls" needs nothing new: an `other` slot with `than: { slot }` and `sameController: true` already holds it (Keeper
  of the Dead; 601.2c, chosen in order).

*Deliberately not moved*, decided before building:
- `"trigger-controller"` (233 card lines) stays a base ref: it's the player behind the event, including events with no object (a draw,
  `triggerSpellController` for a spell since countered), so `{ controllerOf: "trigger-object" }` wouldn't say the same.
- `"attached"` stays a base ref, not `{ hostOf: "source" }`: it's what `attachedWas` reads (the resolution's recorded stint), and it's
  about 300 sites. A pool test forbids spelling it the long way.
- `CardFilter.controlledBy` (`"you"`, `"opponent"`, …): thousands of sites, a perspective word answered inside the layer fold, where a
  resolution's ref can't be. `controlledByRef` is the bound form beside it.
- `TargetSpec.whose`'s words (`"trigger-player"`, `"defending-player"`, `{ seat }`): chosen with no resolution context, and an earlier slot's
  relation is `other` with `sameController`.
- `controlledByTarget` on effects (118 card sites, about 20 effect kinds): it isn't only "controlled by that player", it reads the whole filter from
  that player's side (a filter's other `"you"`s included, the `scopeTo` argument). Moving each kind needs its own check; `controlledByRef` is
  the general form and new cards use it. Same for `controlledByPlayer` (nine sites).
- A static's ref reading stays what `filter.ts` can answer without a resolution: `"source"`, `"attached"`, and `{ attachedTo: "source" }`.
  Anything else in a static matches nothing, and a pool test keeps cards off that.

*Bots.* `effect-worth.ts`, `features.ts` and `target-polarity.ts` each read some of the old words; they're moved to the accessors, and
`target-polarity.ts` learns that `{ controllerOf: n }` as `who` of a harmful effect means slot `n`'s controller is the one hurt. No new
decision kind is planned, so no candidates.

*As built (step 7, B281).*
- `refs.ts` as above: `ObjectRef`, `PlayerRef`; `objectRefAct` / `objectRefRead` / `resolvePlayerRef` in `effects.ts`; on the context, `attachedRead`,
  `hostOf`, `pairedWith`, `defendingPlayerOf` (the journal's `attacked` entry past 508.5), `stintNow`. `ctx.playersInScope` takes any scope, so a
  ref in a `who` resolves in the context that asked.
- **Deleted, every user moved:** `EffectTargetRef`, `AttachRef`, `AmountRef`, `DamageFrom`, `EffectPlayerRef`, `ChosenPlayerRef`; the player words
  `"source-owner"`, `"source-controller"`, `"attached-controller"`, `"trigger-owner"`, `"attached-owner"`; `{ controllerOfTarget }` and `{ ownerOfTarget }`
  (218 card lines); the object word `"tapped"` and `ctx.tapped` / `tappedLost`; `DamageFrom`'s `{ target: n }` (93 lines, now the slot); the filter clauses
  `sameNameAsTarget`, `sameNameAsTriggerObject`, `sharesColorWithTarget`, `sharesColorWithHost`, `sharesCreatureTypeWithHost`, `attachedToTarget`, and the seven
  `has<Keyword>` booleans; the `"attached-to-source"` set; the conditions `sacrificed` and `discarded` (`object-matches`, 30 sites). `test/refs.test.ts` walks every definition for the removed words.
- **How much moved, plainly:** every reference *type* and every card that spelled an old accessor is on the new types (about 430 files, mechanically). The `who`
  of a resolved scope is now one union. But three parallel shapes stay, each with a reason above: `controlledByTarget` (118 sites), `CardFilter.controlledBy`
  (thousands), `TargetSpec.whose`.
- **Also not moved:** `sameNameAsSource` (three cards: a live clause with a negative form, read inside a static's fold, Mirror Box and Marvin); `blockingRelation.of`,
  `blockedThisTurn.of` and `wasAttachedTo` keep their own short words; `look-and-choose`'s `from: { target: n }`, an effect-specific player field, stays;
  and per-effect player words on single effects (`who: "target"`, `who: "target-controller"` on `sacrifice` and `create-token`) stay, since each reads an implicit slot.
- **A behaviour change:** a share reference read through `"attached"` now reads the host as it last existed (608.2h), where the Crown of Ascension test had it read
  nothing: with the enchanted creature gone, kin are still read off it. Test edited to say so.
- **Additions the proving cards needed:** `opponent-compared`'s `fewer` (Keeper of the Dead), `attach`'s `{ player }` target, `look-at-hand`'s `PlayerRef` target, `damage`'s
  `target: ObjectRef` (was a narrower union), `FilterContext.triggerObject` for a target's filter, the `aboveSourceInGraveyard` clause, the `cards-in-graveyard` condition
  passing its source to the filter.
- Scaffolder: `tap`/`untap all X that player controls` (`controlledByRef`), `with morph/madness/fading/unearth/awaken/modular` (`hasKeyword`) in its restriction filters.
- Cards (18): Oft-Nabbed Goat, Storm, Windrider and Archnemesis (flagged); Keeper of the Dead; Unforge; Corrosive Ooze; Nature's Will (and War's Toll moved onto the
  new clause); Joint Assault; Mark of Eviction; Walker of Secret Ways; Spreading Plague; Bloodbond March; Witch-king, Bringer of Ruin; Backslide; Anje Falkenrath; Parallax
  Inhibitor; Nether Shadow; Tsabo's Web.
- Keys marked built: `effect:each-player-other-than-source-owner`, `effect:cast-spell-trigger-spell-targets`, `effect:curse-attach-player`,
  `target:permanent-controlled-by-target-slot`, `effect:host-of-destroyed-target`, `filter:attached-to-trigger-object`, `effect:tap-all-trigger-player-scope`,
  `effect:paired-creature-of-target`, `effect:return-enchanted-and-its-auras`, `effect:look-at-trigger-player-hand`, `filter:shares-color-with-trigger-object`,
  `filter:same-name-as-trigger-spell`, `filter:least-among-its-controller`, `filter:has-morph`, `filter:has-madness`, `filter:has-fading`,
  `condition:creature-cards-above-in-graveyard`, `condition:filter-has-nonmana-activated-ability`. Their other cards are left in `--stale` for `author-freed`.
- Measured: a timed `bot:bench` (16 games, four players, 8 workers, nothing else running) played the same games (11-5, 38.1 turns on average) at 66.7 s a game and 115.6 ms a
  decision, against 72.4 s and 125.6 ms just before (227.7 s wall against 245.4 s). Bench noise is wide; the refs add no cost that shows.
- **Left unbuilt, not marked:** `mana:any-type-sacrificed-land-could-produce` (Squandered Resources, flagged: a mana ability's colours are worked out before the cost is
  paid, with no sacrificed land to read: stays flagged); `filter:same-name-as-source-last-known` (the read is built, no card authored: Evil Twin's copy exception wasn't
  tried); `filter:has-unearth`, `-awaken`, `-modular` (rows in the table, no card proved); `amount:domain-of-target-player`.

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

**Design note (step 7, 2026-11-08): one patch, one `become`.** Picked by `--by-rank`, flagged cards first: none of the twelve flagged cards' keys fall under themes 14, 16 or 8, and Mycosynth Lattice (2058) comes before Akiri (2078, theme 14).

*What's wrong today.* "This permanent is now these things" is said seven ways: the effects `animate`, `add-types`, `animate-all`, `lose-abilities`, `lose-abilities-all`, `become-color` and `lose-keywords`, each with its own subset of the same fields, its own `EffectContext` method and its own rules for timestamps and token stacks. So "creatures target player controls lose all abilities and have base P/T 0/2" (Sudden Spoiling) has no spelling: `animate-all` can't lose abilities, `lose-abilities-all` can't set P/T. Copy exceptions are an eighth list of the same words with its own spellings (`basePt`, `notLegendary`), plus a boolean that travels beside them through a dozen copy paths and onto the object. A static can set base P/T three ways (`setBasePt`, `setBasePtFromAffectedCounters`, `setBasePtFromSourceCount`), and none reads the permanent's own mana value. Off the battlefield only types are reachable, and only for your own cards. Supertypes can be added and never removed, and a one-shot can't take creature types away.

*Where it lives.* `engine/src/characteristics-patch.ts`, the types and the one pure function from a patch to a modifier:

- **`CharacteristicsPatch<Pt>`**, one declaration of what can change: `name`; layer 4 (`TypePatch`: `setTypes`, `addTypes`, `removeTypes`, `setSubtypes`, `addSubtypes`, `removeSubtypes`, `loseLandTypes`, `loseCreatureTypes`, `addSupertypes`, `removeSupertypes`); layer 5 (`ColorPatch`: `setColors`, `addColors`); layer 6 (`loseAbilities`, `keywords`, `loseKeywords`, `cantHaveKeywords`, `activated`, `triggered`, `static`, `toxic`); layer 7b (`power`, `toughness`, each alone or both). `Pt` is what a P/T can be: an `EffectAmount` on a one-shot (read once as it applies, 608.2h), a number on a copy exception.
- **One effect.** `{ kind: "become", target | filter, …patch, duration }`, flat so a card reads as it always has; `exceptSource` and `controlledByTarget` belong to the `filter` form. One `ctx.become` and one `ctx.becomeAll`, the second giving every match one timestamp and leaving a token stack whole (613.7b, 611.2c). A patch changing only colours also reaches a spell on the stack, as `become-color` did. Every piece of a one-shot gets a fresh timestamp.
- **One modifier path.** `patchModifier(patch)` builds the `PtModifier` fields for a one-shot and for a copy exception. `PtModifier` keeps its layer fields, which the fold already reads, and gains `removeSupertypes` and `loseCreatureTypes`.
- **Copy exceptions are the patch** (`CopyExceptions extends CharacteristicsPatch<number>`) plus what only a copy can say: `noManaCost`, `thisAbility`, `legendRuleOff`, and **`ifCopied: [{ filter, patch }]`**, a piece that applies only if the copied values match ("if it's a creature", Moritte). `basePt` becomes `power` and `toughness`; `notLegendary` becomes `removeSupertypes: ["legendary"]`.
- **Statics share the declarations.** `StaticAbility extends TypePatch, ColorPatch`, so the spellings are one list, and `setBasePt` takes one value form: `{ power?, toughness? }`, each a number, `"its-mana-value"`, `{ countersOnIt }` or `{ sourceCount }`.
- **Off the battlefield.** `typesOutsideBattlefield` becomes `outsideBattlefield: { filter?, whose?, zones?, …TypePatch, …ColorPatch }`: colours as well as types, every player's cards as well as your own (Mycosynth Lattice).

*Rules.*
- **105.2c, 105.3**: "colorless" is having no colours, so `setColors: []`.
- **205.1a, 205.3d, 205.4**: a "becomes" without "in addition" replaces; a lost card type takes its own subtypes; supertypes are independent of card types and come off alone (Melting).
- **305.7**: setting a land's type takes its rules-text mana abilities, already done by the fold.
- **604.3, 702.73a**: changeling is a CDA, so a copy exception giving it adds every creature type in layer 4 and a later loss of abilities doesn't undo that (the printed changeling's ruling).
- **608.2h, 611.2c**: amounts are read once and the set of objects fixed once, as the effect starts.
- **613.1, 613.4b, 613.6, 613.7**: layers as before. A static whose layer-4 part reached a permanent keeps that set for its later layers, so "each noncreature artifact is an artifact creature with P/T equal to its mana value" doesn't switch itself off in layer 7b.
- **613.8a**: a scope depending on its own result needs a check (March of the Machines' "noncreature").
- **707.9, 707.9b**: an exception is part of the copiable values, so "loses soulbond" and "has haste" are copied onward.
- **707.9a**: a piece conditional on what's copied reads the copied values.

*Moved or not, decided before building.* **Moved and deleted:** the seven effect kinds and their seven `EffectContext` methods; `CopyExceptions.basePt` and `notLegendary`; `create-token-copy`'s `notLegendary`, `GameObject.notLegendary`, `PtModifier.notLegendary`; `setBasePtFromAffectedCounters`, `setBasePtFromSourceCount`; `typesOutsideBattlefield`. Card files and the scaffolder's output by a script, run once, with a pool test refusing every removed spelling. Deliberately not moved:
- *`grant-keyword`, `grant-triggered`, `grant-activated`, `grant-static` and their mass forms*: they're theme 16's, and a `sequence` of one with a `become` is still right.
- *`grant-static`'s layer-4 part*: no card grants one, so a reader would have nothing to prove it.
- *`setBasePtFromCount`*: a CDA in layer 7a, not a 7b set.
- *`selfOutsideBattlefield`*: one card's own printed characteristic off the battlefield (113.6c).
- *`modify-pt`*: layer 7c, not a change of what the permanent is.
- *Which object a copy copies, and "a copy for each object it could target"*: separate mechanics; their keys stay open.
- *Keywords with a number* (vanishing N, Flesh Duplicate): they're definition pieces, not keyword values, which is theme 16's first half.

*Bots.* `target-polarity`'s one `become` row reads the patch: losing abilities is harm, a small body is harm, a keyword or creature type is help, as `animate`'s did, and `loseKeywords` keeps its harm reading. `effect-worth`'s `animate` row becomes `become`. No new decision kind is expected.

*As built (step 7, B287).*
- `characteristics-patch.ts`: `TypePatch`, `ColorPatch`, `CharacteristicsPatch<Pt>`, `ResolvedPatch`, `CopyExceptions<Pt>`, `StaticPt`, `patchModifier`, `changesOnlyColors`, `changesTypes`. `Game.become`, `ctx.become`, `ctx.becomeAll`, `copyExceptionModifiers`, `copiableTypesOf`, `outsideReaches`, `staticBasePt`.
- **Moved and deleted, every user migrated:** the seven effect kinds (`animate`, `add-types`, `animate-all`, `lose-abilities`, `lose-abilities-all`, `become-color`, `lose-keywords`) and their seven `EffectContext` methods; `Game.animate`, `addTypes`, `loseKeywords`; `CopyExceptions.basePt` and `notLegendary`; `create-token-copy`'s `basePt` and `notLegendary`, folded into its `exceptions`; `GameObject.notLegendary`, `PtModifier.notLegendary`, `CopyValues.notLegendary`, `LastKnown.notLegendary`, and the boolean that travelled through `mintTokenBatch` and `mintFreshTokenObject`; `setBasePtFromAffectedCounters`, `setBasePtFromSourceCount`; `typesOutsideBattlefield`, now `outsideBattlefield`. 893 card, test and scaffolder files by a script, run once; `test/characteristics-patch.test.ts` refuses every removed spelling.
- **One more than the note listed:** `EnterTypes` and the separate fields it was copied into on `EnterOptions` are the patch too (`EnterTypes extends ResolvedPatch`, `EnterOptions.asEntered`), since a permanent put onto the battlefield "as a 5/5 Elemental" says the same words.
- **Differences from the note:** `ifCopied` takes `{ ofType, patch }`, not a filter, because the copy's values have to be read without going through the layer fold (`copiableTypesOf`). A copy exception with `changeling` among its keywords adds every creature type itself, so a copied changeling is authored as the keyword alone.
- **Behaviour changes:** every one-shot gets a fresh timestamp, where `add-types` used to reuse the latest for a purely additive change; an `animate` that changed types but not both P/T values now logs "types-added" where it logged nothing. `power` and `toughness` are read signed (rule 107.1b), as a create-token-copy's always were, where `animate` floored them. Supertypes now fold in timestamp order with every other layer-4 change, so a later "becomes snow" beats an earlier "no longer snow" (Thermal Flux over Melting).
- **Additions the proving cards needed:** `spendManaAs.everyone` (Mycosynth Lattice), `removeSubtypes` on a static.
- Not benched: the layer fold now tracks supertypes as it goes, and an off-battlefield colour read walks the `outsideBattlefield` statics, usually none. Full verify and the bot gate (202/202) passed. Played live in the builder: Mycosynth Lattice (Serra Angel cast with Swamps alone) and Moritte of the Frost (the copy prompt, then a legendary Sol Ring with no counters).
- Bots: as the note. `target-polarity`'s `become` row is built from the patch, and a mass form aims at a target player only for a small body or a loss. No new decision kind, so no bot prompt to check.
- Scaffolder: every output moved. It doesn't read "gains all creature types", "is no longer snow" or a static P/T of "its mana value".
- Cards (18): Mycosynth Lattice; Encroaching Mycosynth; Sudden Spoiling; Karn, the Great Creator; Starfield of Nyx; Opalescence; March of the Machines; Amoeboid Changeling; Nameless Inversion; Shields of Velis Vel; Ego Erasure; Omni-Changeling; Moritte of the Frost; Thermal Flux; Melting; Arcum's Weathervane; Day of Black Sun; Jade Statue. `test/characteristics-patch.test.ts` covers each, with a pool walk for the removed spellings.
- Keys marked built: `static:all-permanents-artifacts-colorless`, `static:type-change-all-zones`, `static:set-base-pt-all`, `effect:loyalty-animate-until-your-next-turn`, `static:static-base-pt-own-mana-value`, `static:animate-pt-equal-mana-value`, `effect:gain-lose-all-creature-types`, `effect:copy-exception-changeling`, `effect:copy-exception-if-creature`, `static:lose-supertype`, `effect:animate-remove-supertype`, `effect:mass-lose-all-abilities`, `effect:animate-until-end-of-combat`.
- **Left unbuilt, not marked:** the copy mechanics (`copy-spell-for-each-*`, `copy-next-loyalty-ability`, `token-copy-of-*`, `replacement:*-enter-as-copy`, the "of: ObjectSetRef" the theme proposed), which are separate from what a copy is. `effect:copy-exception-if-copied-lacks-ability` (Flesh Duplicate) and `effect:copy-exception-loses-ability` (Mirage Phalanx): vanishing N and soulbond are definition pieces, not keyword values, which is theme 16's first half. `effect:copy-exception-toxic` (Kinzu needs "pay 2 life and exile it" as an `each-player-may`, not tried; `toxic` on the patch is built). `static:set-base-pt-others-from-count` (Porcelain Gallery: its `{ sourceCount }` is built, the Room's other door wasn't tried). `static:lose-all-abilities-except-mana` (Blood Sun), `static:graveyard-cards-lose-abilities` (Yixlid Jailer), `effect:lose-specific-ability` (Glittering Lynx): losing part of a text, a separate reader. `effect:animated-this-way`. Titania's Song and Animate Artifact wait on their own conditions. The rest of the ~90 one-card keys.

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

**Design note (step 7, 2026-11-08): one `instead`, one resolved record.**

*What's wrong today.* `ReplacementSpec` is 16 interfaces, and what a replacement *does* is spelled nine ways for one idea (`multiplier`, `plus`, `plusOf`, `atLeast`, `halve`, `halved`, `draws`, `times`, `additional`), so "that much plus X" exists for damage and not for scry. Only the draw takes "any effect instead". And what a *resolved* spell's replacement is kept as is split four ways: `PreventionShield` on its own state list, `PlayerEffect.damageReplacement` / `damageTo` / `nextDrawInstead` / `tokenMultiplier` / `graveyardExile`, each read by its own loop, so "the next time" exists for damage and draws and nothing else, and "prevent half" for a static and not a shield.

*Where it lives.* `engine/src/replacements.ts`, one vocabulary:

- **`event`** says what's replaced, and the event's own flat fields say what it matches (`who`, `source`, `to`, `filter`, …) exactly as today. A wrapping `match: {}` would rewrite every card and say nothing new: the fields differ because the events do.
- **`instead`** says what happens, one union wherever the event can take it:
  - `{ effect, text? }`: the event becomes this effect and never happens (614.1a, 614.6, 615.6).
  - `{ modify: AmountChange, also? }`: the event happens, changed. `AmountChange` is `{ times?, plus?, half?, atLeast?, atMost?, set? }`, amounts being `EffectAmount`s read as the event would happen. `also` is done beside it, first ("that damage is dealt, but all other damage already dealt to him is healed").
  - damage's own `{ prevent, then?, … }` (615) and `{ redirect }` (614.9); the leave event's destinations; the draw's `"you-draw"` and `"win-game"`.
- **`may`** and **`text`**: "you may … instead", asked of the affected player (616.1).
- **The replaced event's facts** are bound the way `then` already binds them, one convention in every event: amount `"x"` is "that much", `"trigger-object"` "that card" or the damage's source, `"trigger-recipient"` / `"trigger-player"` who it would have happened to. No new ref words.

**One record for a resolved replacement.** A new effect, `{ kind: "replacement-effect", replacement, duration, next? }`, keeps an `ActiveReplacement` on one list, `GameState.activeReplacements`: the `ReplacementSpec`, `owner`, `source`, what its references fixed as it resolved (`bound`: the object or player named, in its stint, 400.7; `targets`, `x`), an `Expiry`, and `next` (`true`: the next one, 615.8; a number left: the next N, 615.7). Damage's shields are these records: `shieldCovers` and `damageReplacementReaches` become one check. The authoring words stay (`prevent-damage`, `damage-rule`, `prevent-damage-from-chosen-source`, `prevent-all-combat-damage`), because they read like the printed sentence and 450 files would say the same thing longer; what they *make* is the one record.

**One read, kept cheap.** Replacement lookups run on every event, so `Game.replacementsOf(event)` keeps a per-computed-cache-region index by event of the statics that have any replacement, as `playStaticsOf` does, plus the active records of that event. Today's per-event battlefield-times-statics scans become a table read; an event nothing replaces costs one lookup. Timed-static replacements read the same index.

*Rules.*
- **614.1a, 614.1b, 614.1c**: "instead" and "skip" are replacements; "enters with / as enters" are too, which is why enters stays its own shape (below).
- **614.5**: one opportunity. `damageSteps`' `applied`, the redirect chain's map and a new transient `applying` set (keyed by source and ability, or record) keep a replacement off events inside its own effect. It's synchronous only, so an `effect` mustn't repeat its own event after a decision; that's stated in AUTHORING and is what `also` is for.
- **614.6, 615.6**: a replaced event never happens, so no event, journal entry or trigger for it; only what happened instead. Prevented isn't replaced: `instead: { effect }` on damage works on unpreventable damage (615.12 stops prevention, not replacement) and emits no `damage-prevented`.
- **614.7**: a replacement for an event that doesn't happen does nothing, and a `next` isn't spent. **614.9**: redirection with nowhere legal does nothing.
- **614.10**: a skipped event waits for the next occurrence. **614.11, 614.11a**: draw replacements apply with an empty library, and all of one is done before the next draw of a sequence.
- **615.3, 615.7, 615.8, 615.10**: a shield lasts until used or expired; "the next N" counts down, and with two sources at once its player chooses (worked out, the order best for them, as today); "the next time" is one instance from one source, covering the rest of one simultaneous event; a static's "prevent N" applies per event. **615.5**: `then` happens right after, reading the amount.
- **616.1, 616.1f, 616.2**: the affected player chooses among applicable effects, again after each, and one can become applicable by another. As today it's worked out where only amounts differ (the user's call, 2026-10-14: least damage, most counters); a choice between *different* outcomes is asked with the `choose-modes` question draws use. **Worked out**, the order is one the player could have picked.
- **Loops (`prepareForPriority`)**: replacements wrap their mutators and never enter the fixpoint themselves (ROADMAP *Architecture constraints*). A would-lose-game replacement runs inside the SBA step (704.5a); what it changes is seen by the next pass. Each replacement gets one chance per event (614.5), and "that player loses" is rechecked only if they still meet the condition.
- **An `instead` that asks a decision suspends the event** the way draws already do: nothing's been done yet, the effect runs through `ctx.resumeAfterDecisions` (or, with a decision already outstanding in a sweep, parks behind it), and the event's remainder is that resumption's. A sequence of draws waits for it (614.11a). Combat damage is one event: each replaced recipient's effect runs once the sweep's dealing is done, as `then` does now. `may` needs its event to be able to wait, so it's accepted only on events that can (draw, tokens, lose-game); a pool-wide test refuses it elsewhere.

*Moved or not, decided before building.* **Moved and deleted:** the nine amount spellings (about 280 card files, mechanically, by an AST script), `DrawReplacedByEffect`, `PreventionShield` and `GameState.preventionShields`, `PlayerEffect.damageReplacement`, `damageTo`, `nextDrawInstead`, `tokenMultiplier`, `graveyardExile`. **Plainly: this unifies what a replacement does, what keeps a resolved one, and the lookup; it doesn't make 16 event interfaces one.** Deliberately not moved, each for a reason:
- *`enters-battlefield` and `others-enter-battlefield` (about 1,210 cards):* 614.1c "as it enters" modifies how a thing enters, asked before it moves (614.12), and its words (`tapped`, `counters`, `asEnters`, `sunburst`) aren't an amount or an effect. Moving them would be a rename of 1,200 files.
- *The leave event's `instead`:* a zone change has to go somewhere, so it's a destination (widened to hand and library bottom) with `withCounters` / `then` / `linked`, not "any effect". Finality counters and `exileIfItWouldLeave` belong to the moving object.
- *The token plan's kinds* (`plusTokens`, `tokensInstead`, `oneOfEach`, …): a plan over a list of kinds of token, `planTokenEvent`'s (only `multiplier` moves).
- *Life gain's `prevent`, `gainsNoLifeInstead`, `becomesLoss`*: "can't gain life" is close to a prohibition, and each differs in rules (119.7); only its amounts move.
- *`would-begin-turn`, `would-discard`, `would-counter-spell`* (7 cards): no amount and no general effect; each keeps its own small shape, with `may` where it has one.
- *Keyword rules:* regeneration (701.19), dredge (702.52), madness, the commander's zone replacement (903.9). They're a keyword's or format's, with their own decisions.
- *`tokensComeToOwner`, `entersTapped`, `keepsUnspentMana`, the land-mana `PlayerEffect` fields* (1 to 3 cards each): resolved, but about who or what mana rather than an event's amount or an effect; left and listed.

*New events* only where a card proves it, tried first against today's vocabulary: `would-lose-game` (The Golden Throne, Stunning Reversal), `would-be-destroyed` (Harmonious Emergence), `would-untap`, `would-scry`, others if a proving card needs them.

*Bots.* `effect-worth` and `target-polarity` read a `replacement-effect` by its `instead`; `features.ts` reads no replacement of any kind (they show up in simulated futures), so it has nothing to learn. `may` asks through `choose-modes`, so no new decision kind and no client change.

*As built (step 7, B283).*
- `replacements.ts`: `AmountChange`, `Instead` (`ReplacedByEffect`, `ModifiedEvent`), `DamagePrevention`, `DamageRedirection`, `LoseGameReplacement`, `ScryReplacement`. `state.ts`: `ActiveReplacement`, on one list, `GameState.activeReplacements`. `effects.ts`: `replacement-effect`, and the small `heal` effect Wolverine needs (701.69a). `Game.runReplacedBy` is the one place an event becomes its effect, binding `"x"`, `"trigger-object"`, `"trigger-recipient"` and `"trigger-player"`; it parks behind an outstanding decision only inside a damage sweep (a draw's own resume is what comes next).
- **Moved and deleted, every user migrated:** the amount spellings (`multiplier`, `plus`, `plusOf`, `atLeast`, `halve`, `halved`, `draws`, `times`, `additional`), `preventAmount` / `preventAllBut` / `preventHalf`, `redirect` and the prevention `then` as flat fields, `DrawReplacedByEffect`, `PreventionShield`, `GameState.preventionShields` (`state.activeReplacements`), the `preventAllCombatDamage` flag and `combatDamagePreventedBy` (Fog is a record now), `PlayerEffect.damageReplacement`, `damageTo`, `nextDrawInstead`, `tokenMultiplier`, `graveyardExile`, and `Game.topsItselfInstead`. 246 card files, by a script that ran once (idempotent; a second pass finds nothing). The scaffolder's outputs moved with them, and it now reads "if you would scry a number of cards …" and "if you would lose the game, instead …".
- **How much was replaced, plainly:** what a replacement *does* is one vocabulary, and a resolved one is one record read by one covers check, so `next`, durations and `modify` amounts work on damage and draws alike, and damage prevention gained `ifAtLeast`, `set` and `atMost`. **The 16 event interfaces are still 16** (plus 2 new), by the plan's call above: the match fields differ because the events do. **Not done as the design note said:** the per-region index. Replacement lookups still scan `staticSourceIds` per event, as they did, because a computed-cache region lasts one event here and an index would be rebuilt each time. Each event's cost is unchanged; a resolved record adds one check of an array that's almost always empty.
- **614.5 in practice.** `Game.applyingReplacements` keeps a replacement off events inside its own effect while that effect runs synchronously; Plagiarize aimed at its own controller (found by the situation fuzzer) is the case it exists for.
- **Behaviour changes, all rules fixes:** a static or record that changes damage now orders with shields (Fog beside a multiplier: 616.1 instead of Fog first). `would-mill`, `would-gain-life` and `would-lose-life` amounts read an `EffectAmount`.
- **Not moved** is the design note's list, unchanged. Also still their own: `would-draw`'s `"you-draw"` and `"win-game"` outcomes, and `would-create-token`'s `becomes` beside the token-plan kinds, because a token event is a list of kinds whose plan `planTokenEvent` owns.
- Cards (18): Moonlit Meditation, Wolverine, Fierce Fighter, Doc Samson, Super Psychiatrist, Quantum Riddler (flagged); The Golden Throne, Stunning Reversal, Isengard Unleashed, Forethought Amulet, Soul-Scar Mage, Hullbreacher, Blood Scrivener, Alms Collector, Eligeth, Crossroads Augur, Plagiarize, Nissa's Chosen, Necromancer's Magemark, Eruth, Tormented Prophet, Quest for Pure Flame. `test/instead-replacements.test.ts` covers each, with the rules above and pool-wide checks for the removed words.
- Keys marked built: `replacement:lose-game-replacement`, `counter-replacement-you-put`, `counter-multiplier-on-costs`, `draw-instruction-plus-one`, `token-creation-replace-with-copies`, `damage-heals-prior-damage`, `damage-capped`, `temporary-prevent-damage-to-counters`, `draw-replacement-create-token`, `draw-replacement-life-loss`, `draw-two-or-more-shared`, `would-scry-draw-instead`, `temporary-draw-replacement-target-player`, `dies-to-library-bottom`, `dies-return-to-hand-instead`, `draw-replacement-exile-play`, `double-damage-from-your-sources-this-turn`, `damage-multiplier-this-turn` (18 keys; 16 were new to `built`).
- **Left unbuilt, not marked:** every other key of the theme, by its card or a limit found building: `replacement:die-exile-with-counter` (Ravenloft Adventurer's other abilities, Rayami's keyword reads, Darigaaz: not tried), `damage-reflection` (Eye for an Eye, Harsh Judgment: `{ effect }` plus a reference to the source's controller), `would-scry-plus` (the event is built; Kenessos's look-at-top ability wasn't authored), `untap-step-remove-counter-instead`, `would-be-destroyed` keys, `explore`, dice, mana-pool and the `*as-enters*` and copy-as-enters keys. **A limit to know:** Moonlit Meditation's `may` is asked on `create-token` and `create-token-copy` effects only; a token made by amass, incubate, encore, myriad or populate isn't offered it (`docs/engine-gaps.md`).
- Measured: a timed `bot:bench` (16 games, four players, 8 workers, nothing else running) played the same games (11-5, 38.1 turns on average) at 66.6 s a game and 115.8 ms a decision (226.1 s wall), against 66.9 s and 116.2 ms before (230.5 s wall). Inside the noise: lookups cost what they did. Both figures are in `engine/data/bench-log.jsonl`.

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

**Design note (step 7, 2026-11-08): one permission record, one reader.**

*What's wrong today.* "May play this card from there" lives in eight places, each with its own riders: `GameObject.impulse` (exile), `GameObject.graveyardCastPermission`,
`GameObject.linkedCastGrants`, five `PlayerEffect` fields, five `StaticAbility` fields, three `CardDefinition` fields, `ExilePermission` and `impulse-exile`'s own options, and `CastNowAsk`'s
term-by-term copy of the `cast-now` effect. Each is read by its own function (`impulsePlayable`, `linkedCastGrantFor`, `exilePermissionsFor`, `graveyardGrantsFor`, `mayPlayFromGraveyard`,
`mayPlayFromLibraryTop`, `libraryTopCastPermissions`, `handsOpenTo`), so a rider added to one (a tax, a spending rule, once each turn) isn't available from another zone, which is why 78 keys exist.

*Where it lives.* `engine/src/play-permission.ts`: types and the pure reads. One vocabulary of terms, and the three places a permission can be kept:

- **`PlayTerms`, what a permission says, the same wherever it comes from** (spelled as `cast-now` already spells them, its 300 card lines being the largest user):
  - *what:* `play` ("play": a land too, 305.1; absent, "cast"), `filter` (which cards), `spell` (which spells, as the face being cast, 601.3e);
  - *cost:* `free` (`true`: only without paying; `{ filter? }`: may), `byPaying` / `byPayingLife` (alternative costs, 118.9), and the additional costs `alsoPaying`, `payLife`, `sacrifice`, `exileOthers` + `exileFilter`,
    `discard`, `costIncreasePerOther`, `removeCounters`; `tax`, `reduce`, `undaunted`; `spendAs` (118.14, 609.4b);
  - *how often:* `oncePerTurn`, `perType`, `upTo` (that many plays in all under this permission);
  - *when:* `yourTurnOnly`, `gate`, `sourceDid`;
  - *afterwards:* `exileAfter`, `gainsHaste`, `landsEnterTapped`, `entersWith`.
- **`PlayGrant`** is `PlayTerms` plus a `duration` (`PermissionDuration`, a subset of the shared `Duration`) and `byOwner`: what an effect gives. It replaces `ExilePermission`, and `impulse-exile` takes it directly.
- **Where a permission is kept:**
  - `StaticAbility.mayPlay` (`{ from: "graveyard" | "exile" | "library-top", exiledByYou?, linked?, …PlayTerms }`): while the permanent has the ability. Replaces `castFromGraveyard`, `playFromGraveyard`, `playFromLibraryTop`, `castFromLibraryTop`, `playFromExile`.
  - `PlayerEffect.mayPlay` (the same with `from: "hand"` too, and the players whose zones it reaches): a resolved rule for a while (611.2c: it reaches cards that arrive later). Replaces the five `PlayerEffect` fields and `linkedCastGrants`.
  - `GameObject.playPermission`: on the one card, with `player` and an `Expiry`. Replaces `impulse` and `graveyardCastPermission`, the private expiry kinds becoming `Expiry`'s (three new members: an end step, the next combat, "until you exile another card").
  - `CardDefinition.mayPlaySelf`: the card's own ("you may cast this card from your graveyard"; 113.6f, it functions there). Replaces `castSelfFromGraveyard`, `castFromGraveyardIf`, `castSelfFromExile`.
- **One effect for a permission over named cards**, `grant-play` (`cards: ObjectRef | ObjectSetRef | { filter }`, plus `PlayGrant`), replacing `allow-cast-from-exile` and `grant-graveyard-cast`. `allow-cast-linked-exile` becomes a `player-effect`'s `mayPlay` with `linked` (it's read live).
- **`cast-now`** is a decision during a resolution (608.2g), not something kept: no duration, no limit, nothing to expire. Its spec takes `PlayTerms` as its cost and rider vocabulary, and `CastNowAsk` carries them as one object in place of the field-by-field copies. Its card-picking (`from`, `repeat`, …) is its own.

*The reader.* `Game.playOptions(player, card, face)` answers every question: the options reaching this card for this player now, whichever carrier each comes from, each with its terms. Every other question is a read of that list: may it be played, is it free, what does it cost more, what does it spend. The zone-specific remains are the offers' shapes (`GraveyardGrant` naming which permission to spend, library-top's search for an X).

*O(1) offers.* A permission on the card is a field read. The statics are collected once per computed-cache region, per player (`playStaticsOf`), where today `exilePermissionsFor` and `libraryTopCastPermissions` walk the battlefield **per card, per face, per offer**, so a read costs the number of permissions that player actually has (usually none). The one-word gate before each zone's loop (`reachesZone`) keeps zones nothing reaches at no cost.

*Rules.*
- **601.3**: a player can begin to cast a spell only if a rule or effect allows it and none prohibits it, so a permission answers only "from there"; every other check (timing, targets, costs, prohibitions) stays the cast's own. **601.3e**: `filter` and `spell` are judged as the spell it would be (the face, X at the value announced from the library top, 202.3e); a permission on the one card still reads its `filter` as the card, as Narset's "noncreature, nonland cards" does.
- **601.2f / 601.2h**: additional costs and taxes are part of the total cost, paid in full or not offered; **118.9a**: one alternative cost, so `byPaying`/`byPayingLife`/`free` exclude each other; **118.9d** additional costs still apply; **107.3b**: X is 0 unless the alternative cost includes X. Where two permissions reach a card, the player picks which they cast it under (601.3), so `free: true` from one doesn't stop another's paid cast.
- **305.1, 305.2, 305.3, 305.9**: `play` only widens *from where*. A land is still played as a special action in a main phase of the player's own turn, with the stack empty, using a land drop; a land is never cast, so `spell` and every cost term are ignored for it. Only `landsEnterTapped` and `entersWith` apply to a land. An effect that puts a land onto the battlefield is 305.4, not this.
- **400.7**: a permission on the card goes with any move (`moveObject` deletes it). A `linked` one holds only for cards linked to that stint of the source (607.2a). Use limits (`GameObject.playUses`) are cleared by the move too, so a new object has a fresh "once each turn". They stay rule state, not the journal (theme 6's note).
- **611.2b**: "for as long as you control it" that has ended doesn't come back, the pass deletes it. **611.2c** a resolved `mayPlay` is a rule change and reaches later arrivals; `grant-play` is about the named cards.
- **Public and hidden (400.2, 401.2, 402.3, 406.3, 601.3f).** A permission never shows anything by itself. Face-up exile and graveyards are public. A card exiled face down is reachable only by a player in `exiledFaceDown.lookers` (406.3, 601.3f), now checked once in `playOptions` rather than in two of three readers. Another player's hand needs a `handsRevealed` (a pool test holds this), and a library top needs the look: `looksAtOwnLibraryTop` or a reveal (401.2), which `view.ts` already answers. `view.ts` shows no permission at all, only `exileHoldings`' links, and is otherwise unchanged. The viewer's legal actions name the cards they may play, as they do today. That's the only place a hidden card's name reaches a seat through a permission, and only one the seat may look at.

*Moved or not, decided before building.* **Moved and deleted:** everything listed under *Where it's kept*, `ExilePermission`, `GraveyardCastCosts` (its fields are `PlayTerms`'), `graveyardCastUsedThisTurn`, `graveyardCastTypesUsedThisTurn`, `impulseCastOnTurn` (one `playUses`), the private expiry kinds, the per-zone gates. About 400 card files, mechanically. **Deliberately not moved**, each for a reason:
- *Keyword casts* (flashback, escape, foretell, adventure, plot, suspend, disturb, mayhem, retrace, jump-start, aftermath, sneak, airbend, warp's own cast, a prepared copy): each is a keyword's rule (702.x, 701.65), with its own cost and its own "what happens to it", and nothing varies per card. They'd only become a second spelling.
- *`grantsToGraveyard` and `grant-graveyard-keyword`*: they give a card a keyword, and the keyword is the permission. Same for the miracle grant this theme adds.
- *`via` (`"impulse"`, `"graveyard-permission"`, `"library-top"`, `"other-hand"`) and `GraveyardGrant`*: the wire contract and the `castVia` words filters and the journal read. They say how a spell was cast, which stays true.
- *`alternativeCostForSpells`, `castsAsThoughFlash`, Omniscience-style free casts from the hand*: they change how a spell already castable is paid for or timed, not whether it can be played from somewhere (118.9, 609.4).
- *`spellGrantsThisTurn`*: abilities for spells, not permissions.
- *`cast-now`'s card selection*, as above.
- *One record per card*: a second grant overwrites the first, as it does today. Two effects naming the same exiled card in one game is rare, and an array would add a choice to every cast. Noted, not fixed.

*Bots.* `candidates` read the legal actions, so an offered card is already seen. `effect-worth` and `target-polarity` learn `grant-play`; `features.ts` counts `mayPlaySelf` and a static `mayPlay` where it counted `castFromGraveyardIf`. No new decision kind.

*As built (step 7, B282).*
- `play-permission.ts` as above: `PlayTerms`, `PlayGrant`, `StaticPlay`, `EffectPlaySpec` / `EffectPlay`, `SelfPlay`, `CardPlayPermission`. `Game.playOptions` is the one reader; `playStaticsOf` the per-region index; `chosenPlayOption` picks what a cast nothing names is under (it spends nothing first, asks no extra cost first); `spendPlay` spends it.
- **Deleted, every user moved (about 430 files, mechanically):** `GameObject.impulse`, `graveyardCastPermission`, `linkedCastGrants`, `impulseCastOnTurn`, `graveyardCastUsedThisTurn`, `graveyardCastTypesUsedThisTurn` (one `playUses`); `StaticAbility.castFromGraveyard`, `playFromGraveyard`, `playFromLibraryTop`, `castFromLibraryTop`, `playFromExile`; `PlayerEffect.castFromGraveyard`, `playFromHandsOf`, `playLandsFromGraveyard`, `playFromLibraryTop`, `castFromLibraryTop`; `CardDefinition.castFromGraveyardIf`, `castSelfFromGraveyard`, `castSelfFromExile`; `ExilePermission`, `GraveyardCastCosts`; the effects `allow-cast-from-exile`, `allow-cast-linked-exile`, `grant-graveyard-cast`; `mayCast` and `playable` (one `mayPlay`); `castOnly` (absent `play`); the private expiry kinds (now `Expiry`, with `untilNextExile`, the `end-step-begins` and `next-combat-ends` points); `impulsePlayable`, `linkedCastGrantFor`, `exilePermissionsFor`, `handsOpenTo`'s own field, `mayPlayFromLibraryTop`, `hasPlayFromExileStatic`, `hasLibraryTopCastStatic`, `graveyardCastAbilities`. `CastNowAsk` is carried whole as `awaiting.ask`, its 15 field-by-field copies gone, and the `cast-now` spec takes its cost words from `PlayTerms`. `test/play-permission.test.ts` walks every definition for the removed words and for terms no store reads.
- **How much moved, plainly:** every kept permission is one record now, read in one place, so a rider added once works in every zone: once each turn and an additional cost now work from the library top and exile as they did from a graveyard (Assemble the Players, Into the Pit, Falco Spara, Dawnhand Dissident). What stayed separate is listed above with its reason, and none of it was a surprise: the keyword casts, `grantsToGraveyard`, `via` and `GraveyardGrant`, cost statics and `cast-now`'s card picking. One record per card remains.
- **Behaviour changes, all rules fixes:** `free: true` from one permission no longer stops a paid cast under another (601.3), nor does a "pay life rather than" one; a resolved `mayPlay` in a graveyard reaches a land too, as a static's always did.
- **Additions the proving cards needed:** `PlayTerms.do` (an action as an additional cost, through `cost-acts.ts`, which gained `remove-counters`), `entersWith` (a finality counter), `StaticAbility.grantsToHand` (miracle in hand: it's a keyword grant, as `grantsToGraveyard` is).
- Scaffolder: every old output moved, and it now reads "each instant and sorcery card in your hand has miracle {2}", "by sacrificing a nonland permanent in addition…" from the top, "once each turn, you may cast a … spell from the top of your library".
- Cards (10): Hex Magic, Dawnhand Dissident, Lorehold, the Historian and Molecule Man (flagged); Assemble the Players, Into the Pit, Falco Spara, Pactweaver, Evelyn, the Covetous, Fiend of the Shadows, Overflow Submatrix.
- Keys marked built: `zone:exile-hand-with-play-permission`, `static:grant-miracle-in-hand`, `cost:linked-exile-cast-additional-remove-counters`, `zone:cast-from-library-top-once-each-turn`, `zone:cast-from-library-top-extra-cost`, `static:play-from-exile-once-each-turn`, `zone:exile-player-hand-play-exiled`. Their other cards are left in `--stale` for `author-freed`.
- **Left unbuilt, not marked:** `zone:graveyard-play-once-shared-land-or-permanent` (Serra Paragon and The Eighth Doctor need "it gains [an ability]" as a rider, Kagha a filter for cards put there from the library this turn); `zone:cast-from-graveyard-enters-finality-vampire` (`entersWith` is the finality half, Overflow Submatrix authored, Tarrian's Journal still needs "is a Vampire in addition"); `zone:impulse-exile-instead` (Radiant Scrollwielder, Nita: `exileAfter` is built, but random exile and the rest of each card weren't tried); `zone:choose-one-of-exiled`; `effect:allow-play-from-exile`; `effect:conjure`.
- Measured: a timed `bot:bench` (16 games, four players, 8 workers, nothing else running) played the same games (11-5, 38.1 turns on average) at 66.9 s a game and 116.2 ms a decision, against 67.4 s and 116.9 ms just before (230.5 s wall against 230.4 s). The offers are cheaper to read, but they were never the cost that shows; bench noise is wider than this. Both figures are in `engine/data/bench-log.jsonl`.

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

**Design note (step 7, 2026-11-08): one combat rule, three places to keep it.**

*What's wrong today.* "Can't attack" is spelled eleven ways: the words `cant-attack`, `cant-attack-owner`, `cant-attack-owner-planeswalkers`, `cant-attack-player-attacked-this-turn`; the static fields `cantAttackController`, `cantAttackUnlessDefender`, `cantAttackIfDefender`; the effect's `cantAttackYou`; `PlayerEffect.cantAttack` and `onlyAttackers`; `boundThisCombat.avoid`. "Attacks if able" four more: the word, `AttackRequirementRule`, `GameObject.mustAttackPlayer`, `attacksIfAttacks`. The block side is the same: `cantBlockUnlessAttacker`, `canBlockOnly`, `cantBlockCreaturesOf`, `PtModifier.cantBlock`, `cantBeBlockedBy` (static, effect and turn-rule forms), `blockedByAtMostOne` (a field and a word), `blockedByAtLeast`, `blockedOnlyByAll`, `mustBeBlockedBy`, `GameState.blockRequirements`, `turnRestrictions.blocks`. Each has its own reader and its own lifetime, so "attacks that player each combat if able until the end of your next turn" (Silver Surfer) has a requirement that can aim and a store that can last, but not on the same field.

*Where it lives.* `engine/src/combat/rules.ts`: the types and the one reader. One vocabulary, `CombatRule`, and the three places a rule can be kept:

- **`CombatRule`, what a rule says, the same wherever it comes from.** A bare `CombatWord` where the rule has no parameters, exactly today's strings (`"cant-attack"`, `"cant-block"`, `"must-attack"`, `"must-block"`, `"cant-be-blocked"`, `"cant-be-attacked"`, `"must-be-blocked"` for Lure, `"must-be-blocked-if-able"`, the company words of 508.1c and 509.1b, and the three that aren't about combat, `doesnt-untap`, `cant-turn-face-up`, `cant-crew`); and a record where it has any:
  - `{ kind: "cant-attack", at?, unlessDefender?, ifDefender? }`
  - `{ kind: "must-attack", at?, otherThan?, ifAttacks? }`
  - `{ kind: "cant-block", attacker?, attackers?, unlessAttacking? }`
  - `{ kind: "must-block", attacker? }`
  - `{ kind: "cant-be-blocked", by?, byMoreThan?, byFewerThan?, unlessAllBlock? }`
  - `{ kind: "must-be-blocked", by }` (every matching creature able to) and `{ kind: "must-be-blocked-if-able", by?, exactlyOne? }` (at least one)
  - `at` is who's attacked: `"you"`, `"you-and-planeswalkers"`, `"you-and-permanents"`, `"owner"`, `"owner-planeswalkers"`, `"attacked-this-turn"`, `"source"`, any `PlayerRef`, `{ defender: PlayerTest }` ("an opponent with the most life"), `{ planeswalkers: CardFilter }`. As a restriction, it's the defenders refused; as a requirement, the ones that obey it.
  - A word is the record with nothing in it, and has only the one spelling: a pool test refuses `{ kind: "cant-attack" }` alone.
- **Where a rule is kept**, the same split as theme 10's and 611.2c's:
  - `StaticAbility.restrictions`: while the permanent has the ability, over whatever its `affects` reaches. Absorbs the eleven static fields.
  - `PtModifier.restrictions`: on the one object, the set fixed as it resolved. Absorbs `cantBeBlockedBy`, `cantBlock`, `cantAttackYou`, `cantAttackYouCovers`, `cantBlockCreaturesOf`, and `GameObject.mustAttackPlayer`, `mustAttackPlayerThisCombat`, `boundThisCombat`, `GameState.blockRequirements`, and the one-object form of `attackRequirements`. It lasts as modifiers do (`durationFields`), so every `PermanentDuration` works on every rule, and a token with a rule on it already won't fold into one without. `PtModifier.restrictionsLater` (`restrictionsDuringTurnOf`, generalised) holds one that starts at that player's next turn or next combat.
  - `PlayerEffect.combat` (`{ rules, filter, side, except?, controlledBy? }`): a rule over the game (611.2c: it reaches creatures that arrive later), lasting any `PlayerDuration` by the one pass `expirePlayerEffects`. Replaces `GameState.turnRestrictions`, the filter form of `attackRequirements`, and `PlayerEffect.cantAttack`, `cantAttackBy`, `onlyAttackers`.
- **One effect**, `restrict`: `target` or `filter`, `restrictions: CombatRule[]`, `controlledByTarget`, `exceptTarget`, `asItResolves`, `duration`. `block-if-able` and `attack-requirement` are deleted into it, and with them `restrict`'s own `cantBeBlockedBy`, `cantBlockAttacker`, `cantAttackYou`, `cantBlockYours`, because each of those is a record. References in a resolved record (`"source"`, a target slot, `"that-player"`) are bound as it resolves to ids with stints (400.7), and `you` to the effect's controller.

*The reader.* `recordsOn(state, registry, id)` is every record binding this object now, each with whose side it reads from and its source: statics through one per-computed-cache-region index, its own modifiers, and `PlayerEffect.combat`. It replaces `blockFilterSources`, the battlefield walk in `whyCannotAttack` (which scanned every permanent per creature, per defender) and `ownStatics`. The questions (`whyCannotAttack`, `whyThisCannotBlock`, `aimedRequirements`, the blockers offer) become filters of that list. Words stay in `characteristics.restrictions` and `restrictionsOf`, as cheap as today: a board with no records costs one empty list.

*Rules.*
- **506.2, 508.1b**: a creature attacks a player, a planeswalker or a battle. `at: "you"` is the player only; `"you-and-planeswalkers"` doesn't name a battle (310.5).
- **508.1c, 509.1b**: restrictions apply to the declaration; an evasion ability is one (509.1b), so a change after blocks undoes nothing. Who may be blocked by what is read as blocks are declared, as today.
- **508.1d, 509.1c**: requirements count, and the most that can be obeyed without breaking a restriction must be. A requirement aimed at a set is **one** requirement however many players are in it: Galactus with two tied opponents has one to obey, by attacking either, and none if neither can be attacked. A requirement nobody can obey asks nothing. A creature "can't attack unless a player pays" isn't required to pay (508.1d).
- **508.4c, 509.4b**: a creature put onto the battlefield attacking or blocking isn't affected by any of this (the readers are the declaration's only).
- **611.2b, 611.2c**: the target form fixes its set as it resolves and an "as long as" that never starts does nothing; the filter form changes the rules and reaches later arrivals, except where the sentence also changes characteristics (`asItResolves`, as today).
- **400.7**: a named creature, planeswalker or attacker is held by its stint. A rule aimed at something that's gone no longer binds.
- **701.15** goad, **702.39a** provoke and **702.141a** encore: goad stays a designation with its own rules (701.15d), read beside the records; provoke and encore make the same record any effect does.
- **800.4m**: a rule's `you` having left ends it as `PlayerDuration`s do; a requirement aimed at a player who's left has nothing to obey.

*Moved or not, decided before building.* **Moved and deleted:** everything listed above, and the words `blocked-by-at-most-one`, `must-be-blocked-by-exactly-one`, `cant-attack-owner`, `cant-attack-owner-planeswalkers`, `cant-attack-player-attacked-this-turn` (records now). About 1,100 cards' `restrictions` arrays need no change, because a word is already the spelling; a script rewrites the roughly 370 files that use a field or effect that's gone. **Plainly:** the field keeps its name, `restrictions`, though it holds requirements too; renaming it would touch 1,100 files to say the same thing, and it already held `must-attack`. Deliberately not moved, each for a reason:
- *Goad* (701.15): a designation with its own rules, which filters and triggers ask about ("goaded creature"), not a rule. Read beside.
- *`detain`*: a keyword action that also stops activated abilities; it stays one modifier, using the same words.
- *`attackLimit`, `blockLimit`*: a cap on a whole declaration (`combat/limits.ts`), not about any one creature; "no more than two" can't be read per object.
- *`attackOnlyNearestOpponent`* (Pramikon): combines every source's direction, and two that disagree leave nobody to attack (its ruling). It's a whole-table read of its own; one card.
- *`attackTax`, `combatTax`, the costs to block*: 508.1d and 509.1c say a cost isn't required, so they're costs (`combat/tax.ts`), not rules.
- *`canAttackAsThoughNoDefender`, `blockAdditional`, `blockableDespiteLandwalk`, `blocksDespiteLandwalk`, `assignAsThoughUnblocked`*: permissions ("can", "as though"), which widen what's allowed rather than restrict or require.
- *The company words* stay words: `combat/company.ts` weighs them across the declaration.
- *"Must attack with at least one creature"* (Seeker of Slaanesh, Trove of Temptation): a requirement on a player, not on a creature; tried last, against `combat/attacking.ts`'s per-creature solver, and left unbuilt if it doesn't fit honestly.

*Bots.* `target-polarity` and `effect-worth` read `restrict` by its rules' kinds (a must-be-blocked or a can't-be-blocked helps its creature, the rest hurt); `features.ts` and `combat-math.ts` read words as today, and a scoped record ("can't attack you") isn't a blanket "can't attack". The candidates read the offers, so a new aim needs nothing there. No new decision kind.

*As built (step 7, B284).*
- `combat/rules.ts` as above: `CombatWord`, `CombatRecord`, `CombatRule`, `AttackAim`, `AttackerAim`; `bindCombatRule` (with `CombatRuleRefs`), `recordsOn`, `recordsOfKind`, `aimNames`, `playerTestHolds`. `Game.restrict`, `restrictLater` and `beginLaterRestrictions`, and `ctx.restrictOverGame`, which keeps a `PlayerEffect.combat`.
- **Moved and deleted, every user migrated:** the static fields `cantAttackController`, `cantAttackUnlessDefender`, `cantAttackIfDefender`, `cantBlockUnlessAttacker`, `cantBeBlockedBy`, `canBlockOnly`, `blockedByAtMostOne`, `blockedByAtLeast`, `blockedOnlyByAll`, `mustBeBlockedBy`, `attacksIfAttacks`; the words `cant-attack-owner`, `cant-attack-owner-planeswalkers`, `cant-attack-player-attacked-this-turn`, `must-be-blocked-by-exactly-one`, `blocked-by-at-most-one`; the effects `block-if-able` and `attack-requirement`, and `restrict`'s `cantBeBlockedBy`, `cantBlockAttacker`, `cantAttackYou`, `cantBlockYours`; `PlayerEffect.cantAttack`, `cantAttackBy`, `onlyAttackers`; `PtModifier.cantBeBlockedBy`, `cantBlock`, `cantAttackYou`, `cantAttackYouCovers`, `cantBlockCreaturesOf`, `restrictionsDuringTurnOf` (now `restrictionsLater`); `GameState.turnRestrictions`, `blockRequirements`, `attackRequirements`; `GameObject.mustAttackPlayer`, `mustAttackPlayerThisCombat`, `boundThisCombat`; `AttackRequirementRule`, `attackRequirementActive`, `AttackRequirementDuration`, `CombatRestriction`, `turnRuleCovers`, `blockFilterSources`, `blockFilters`, `ownStatics`. 413 card files and 19 test files, by a script that ran once; a second pass finds nothing.
- **How much moved, plainly:** one vocabulary and one reader, so a rule aimed at a player or lasting past this turn works on any creature, whatever made it. **The word arrays didn't move, and the field keeps its name `restrictions`**, as the note decided: a word is already the spelling, and about 1,100 cards say the same thing they did. The 508.1c and 509.1b company words stay words. `additional-combat`'s authored `forcedAttackers` and `onlyAttackers` keep their words; what they make when the phase comes is the record.
- **Behaviour changes, all rules fixes:** provoke's requirement lasts this combat, as 702.39a says, where it lasted the turn (the helper and Deftblade Elite's hand-written one). A modifier's requirement no longer needs a stack pin: a token with one has a different modifier list, so it can't fold. The bots read a `cant-be-blocked` as a help, where the word alone was a harm.
- **Additions the proving cards needed:** `PlayerTest.mostLifeAmongYourOpponents` (Galactus), `StaticAbility.blocksAsThoughShadow` (a permission, beside the landwalk ones), `restrict.sideOf`, and the `enter-blocking` effect (rule 509.4: Brimaz, Flash Foliage): a permanent just put onto the battlefield blocks, never "blocked" for triggers, and an unblocked attacker becomes blocked. Only for one made by the effect before it (`"created"`, or a slot).
- Scaffolder: every old output moved; it now reads the shadow permissions, Silver Surfer's "until the end of your next turn, target creature attacks that player each combat if able", and "can't be blocked this turn except by [subtype]s".
- Cards (14): Galactus, Devourer of Worlds; Silver Surfer, Galactus's Herald (flagged); Public Enemy; Wall of Diffusion; Heartwood Dryad; Aether Web; Aetherflame Wall; Forgestoker Dragon; Boros Battleshaper; Varchild's Crusader; Departed Deckhand; Brimaz, King of Oreskos; Flash Foliage; Wall of Vapor. `test/combat-rules.test.ts` covers each, with the rules above and a pool walk for the removed words, unknown or bare records, a static's aims and a filter form's duration.
- Keys marked built: `static:must-attack-specific-player`, `static:block-as-though-shadow`, `effect:grant-cant-be-blocked-except`, `effect:restrict-this-combat`, `effect:token-enters-blocking`, `filter:creature-source-is-blocking`.
- **Left unbuilt, not marked:** `static:player-must-attack-with-a-creature` (Seeker of Slaanesh, Trove of Temptation): a requirement on a player, where `combat/attacking.ts`'s solver counts one per creature, so it needs a whole-declaration requirement in the offer and the validator; a real change, not done here. `decision:attacker-chooses-blocks` (a new decision kind, Melee, Invasion Plans). `static:attack-direction-restriction` (Mystic Barrier's re-choosing, beside Pramikon's whole-table read). `static:must-target-flagbearer` (targeting, not combat). `effect:swap-blockers`, `effect:put-into-combat-attacking`, `effect:delayed-combat-damage-that-much`, the trigger keys and the rest of the 46 one-card keys. `effect:forced-block-this-combat` and `effect:attacks-if-able-during-target-player-next-turn` are expressible now, but each waits on something else in its cards (Tolsimir, Vortex Elemental, Rowan Kenrith's emblem, Oracle en-Vec) and wasn't authored.
- Measured: a timed `bot:bench` (16 games, four players, 8 workers, nothing else running) played the same games (11-5), 38.1 turns on average, at 63.8 s a game and 110.2 ms a decision (216.0 s wall), against 66.6 s and 115.8 ms before (226.1 s wall). Both figures are in `engine/data/bench-log.jsonl`.

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

**Design note (step 7, 2026-11-08): a flip and a roll are records.** Picked by `--by-rank`, flagged cards first: Ral Zarek, Guest Lecturer (the first flagged card under any of the four themes) needs "flip five coins" and how many came up heads.

*What's wrong today.* A flip is a boolean handed back to the effect and forgotten: nothing can ask how many were won or came up heads, a flip with no winner exists only inside Molten Sentry's enters path, and `flip-coin` has no count. A roll is one `GameState.lastRoll` slot, overwritten by the next, which a trigger can't read (it gets the sum of the naturals, ignoring modifiers, 706.2). Neither is a replaceable event, so "flip two and ignore one" and "roll one more and ignore the lowest" have no reader. "Until you lose a flip" is a private loop inside `flip-coin` beside the general `repeat`.

*Where it lives.* `engine/src/random-results.ts`, the types and pure reads:

- **One record each.** `FlipLanding { came, won? }` (`won` absent on a flip that cares only about the side, 705.2; a flip with a call lands "heads" when won, the call being immaterial) and `RollRecord { player, sides, results, modifier, total, ignored? }` (`results` are the natural results kept, 706.2, 706.6). The events `coin-flipped` and `dice-rolled` carry them.
- **Kept in the journal.** New kinds `flipped` and `rolled` (theme 6), with their event's `seq`. `GameState.lastRoll` goes: the last roll is read from the journal (`lastRollIn`), and a clone keeps it as it kept the slot. A trigger on a roll carries that roll in `lastKnownRefs.roll`, so "those results" are its own roll even if another happened before it resolved.
- **One effect each, wider.** `flip-coin` gains `count` ("one or more coins" is one instruction), `sides: true` (705.2), `heads` / `tails` branches and `then` (what's done with the results, reading them this way). `untilLose` is deleted: "until you lose a flip" is `repeat` with `again` asking that pass's flips, so it composes with `times` ("that many times or until…", Squee's Revenge) and `mayAgain` ("or choose to stop", Fiery Gambit), and a decision in a won branch suspends properly. `roll-dice` gains `keepHighest` (706.6). "That player flips" and "each player flips" are the `as-player` and `for-each-player` wrappers that already exist.
- **Read through what's already there.** `thisWay` and the `this-way` condition take four more words: `flips-won`, `flips-lost`, `coins-heads`, `coins-tails`, read from the journal entries since the scope began (so a `repeat`'s pass sees its own, and the sentence after it sees them all). `{ roll }` takes `"highest"`, `"distinct"` and `{ atLeast: n }` beside its five. Comparing them is the existing `amounts` condition.
- **Replaceable.** Two `ReplacementSpec`s, read at the one place each happens: `would-flip-coin` (`instead: { modify: { plus: 1 } }` with `ignore: true`, Krark's Thumb; `comesUp`, `wins` and `firstEachTurn`, Edgar) and `would-roll-dice` (`instead: { modify: { plus: 1 } }` with `ignoreLowest: true`).
- **Triggerable.** `loses-coin-flip` beside `wins-coin-flip`; `rolls-dice`'s value becomes the result with its modifier; a new `rolls-die` row is one occurrence per die, `{ on: "event", event: "rolls-die", die?: { atLeast?, natural? } }` (`natural: "highest"` is that die's top face), its value that die's result.

*Rules.*
- **705.2**: a flip with a call is won or lost by its flipper alone; a flip caring only about the side has no winner, so `wins-coin-flip` doesn't fire on it.
- **705.3**: an effect naming a result ignores the actual one and can make a flip won that otherwise couldn't be. Edgar's coins come up heads and are won, even on a sides-only flip, and draw nothing from the random stream.
- **706.2**: the natural result is the die's face; the result adds the modifiers. `results` stay natural, `total` adds the modifier, and a trigger's "the result" reads the total.
- **706.3a-c**: tables as today; "roll again" re-rolls the same number of dice.
- **706.5**: doubles is every result equal: `{ roll: "distinct" }` of 1 over two dice.
- **706.6**: an ignored roll never happened: no event for it, no trigger, nothing reads it. Ties for lowest are the same number, so no one chooses. Krark's Thumb's ignored flip is the same; which to ignore is the flipper's choice, asked only when the flips differ (a `may` built by the engine, with no new decision kind).
- **614.5, 614.6**: each replacement applies to what the event has become, so Krark's Thumbs double (two flip four, ignore three), and each die source adds one. Rolling N keeping K under a source rolls N+1 and ignores the lowest first, then keeps K.
- **603.2, 603.3**: a trigger on a roll sees the one event for the kept dice; a per-die trigger fires once per die that qualifies (Mr. House's ruling shape).
- **`RandomSource`**: one draw per coin or die actually flipped or rolled; none when a result is named. Without a replacement the draw order is the same as before.

*Moved or not, decided before building.* **Moved and deleted:** `GameState.lastRoll`, `flip-coin`'s `untilLose` and `MAX_FLIPS`, the `came`-means-sides-only reading of `coin-flipped` (`came` is always set; `won` is what's optional), and a dead `dice-rolled` branch in the trigger value. Deliberately not moved:
- *`choose-value` `"roll-result"`, `{ roll: "other" }`*: these read the record already and stay.
- *Yusri's chain*: its per-flip branches work; `count` applies a branch after each coin as it lands, and rewriting a correct card proves nothing.
- *Random picks* ("chosen at random", `effect:random-choice-among-chosen`, Chira's `trigger:random-action`): no flip or die, a different record over the existing random choosers. Left for a separate piece.
- *The planar die* (706.7, Planechase isn't in the engine) and *stored results* (706.8, Centaur of Attention).

*Bots.* `target-polarity` walks `heads`, `tails` and `then` as it walks `won` and `lost`. `effect-worth` reads a flip as the average of its branches, as a roll already is, and a landed one as its own branch, so the Thumb's `may` is weighed correctly. Nothing else is a new shape to them.

*As built (step 7, B286).*
- `random-results.ts`: `FlipLanding`, `RollRecord`, `RollQuery`, `rollRead`, `DieTest`, `matchingDice`, `keepHighest`, `FlipThisWay`, `flipsSince`, `lastRollIn`, `lastRollEntry`, `hasFlippedThisTurn`, `rollOfEvent`. `Game.flipCoinOutcomes` and `staticReplacementsFor`; `flipUntilLose` in `cards/helpers.ts`.
- **Moved and deleted, every user migrated:** `GameState.lastRoll` (15 test files read `lastRollIn` now), `flip-coin`'s `untilLose` (Okaun, Zndrsplt), `MAX_FLIPS`, and the trigger value's dead `dice-rolled` branch. `came` is always set on `coin-flipped`, and `won` is what's absent on a sides-only flip.
- **Differences from the note:** `would-flip-coin` has no `instead: { modify }`: flipping two and ignoring one is `ignore: true`, since each such effect doubles the coins (614.5) and a `plus` would have said something it couldn't do. A flip's `count` applies each coin's `won` / `lost` branch after that coin, not after all of them, so a printed "flip N coins, for each flip you win" should read `then` (Yusri, unchanged, keeps its chain). Nothing but Edgar has `firstEachTurn`.
- **Behaviour changes:** `rolls-dice`'s `{ triggerValue }` is the result with its modifier (706.2), where it was the naturals alone. A `{ roll }` amount reads only what the journal still keeps, about a round, where the slot lasted the game; no card reads further back than its own resolution. Molten Sentry's flip now goes through the replacements, and under Krark's Thumb with the coins differing it asks as Primal Clay's forms do. **That one flip isn't journaled**, so Edgar would still name a later flip that turn: three cards in one corner, and it stays a known gap.
- **Additions the proving cards needed:** none beyond the note.
- Bots: as the note. `effect-worth` had no row for `flip-coin` at all, so a flip's worth was 0; it's now the average of its branches, which moves what the bots do with flip cards.
- Scaffolder: reads "Flip a coin until you lose a flip.", and the two replacement lines. It doesn't read counts, sides, or "that player flips".
- Cards (14): Ral Zarek, Guest Lecturer (flagged); Krark's Thumb; Edgar, King of Figaro; Wyll, Blade of Frontiers; Barbarian Class; Mirror March; Luck Bobblehead; Sword of Hours; Netherese Puzzle-Ward; Planar Chaos; Squee's Revenge; Fiery Gambit; Iron Mastiff; Farideh, Devil's Chosen. `test/random-results.test.ts` covers each but Luck Bobblehead's win and Barbarian Class's levels, with the rules above.
- Not benched: nothing here runs on a hot path, since the new reads run only when a coin is flipped or a die rolled. The bot gate passed 202/202. Krark's Thumb's prompt was played live in the builder (a won flip kept, then stopping: 3 damage, one flip in the log).
- Keys marked built: `effect:flip-coins-count-until-lose`, `mechanic:coin-flip-heads-tails`, `amount:coin-flips-won-this-way`, `replacement:roll-extra-ignore-lowest`, `trigger:rolls-dice-modified-result`, `condition:roll-result-compare`, `mechanic:coin-flip-result-replacement`, `mechanic:coin-flip-choose-to-stop`, `mechanic:coin-flip-by-other-player`, `trigger:rolls-natural-result`, `effect:roll-keep-highest`, `effect:roll-two-keep-higher`, `condition:trigger-roll-results`, `trigger:rolls-at-least`, `condition:dice-rolled-doubles`.
- **Left unbuilt, not marked:** Vexing Puzzlebox has its trigger, but "{T}: Add one mana of any color. Roll a d20." is a mana ability with a rider, which `addsManaOnly` refuses, so it would wrongly use the stack (605.1a): `author-freed` should give it a narrow key. `effect:random-choice-among-chosen`, `trigger:random-action` (random picks, above). `effect:for-each-permanent-coin-flip` (Rakdos: the tails have to die together). `effect:each-player-rolls` (Chaos Dragon compares across players). `replacement:roll-as-enters`, `cost:roll-die-as-cost` (not tried), `effect:reflexive-with-roll-amount`, `effect:search-then-roll-destination`, `replacement:die-exile-with-counter`, `mechanic:planar-die`, `mechanic:d20`, `mechanic:dice-rolls`, and the rest of the one-card keys.

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

**Design note (step 7, 2026-11-08): three reads of mana, one each.** Picked by `--by-rank`, flagged cards first: Squandered Resources, Omnath, Locus of the Void and Yavimaya Bloomsage are the theme's, and lead the list.

*What's wrong today.* What paid for a spell is spread over six fields kept in step by hand: `GameObject.manaSpent` (a total), `manaSpentFrom`, `manaSpentColors`, `manaSpentByColor`, `lastStackManaSpent`, `lastStackManaSpentColors`, and four copies on `LastKnown`. Cards read them through four filter clauses (`manaSpent`, `manaFrom`, `manaSpentOfColors`, `manaSpentOfOneColor`) and two amounts (`manaSpentOf`, `colorsSpentOf`). Each new question is a new field: "{C} was spent" has nowhere to go, and nothing at all records what paid for an activated ability. A land's mana being changed is two shapes with two readers: `landManaInstead` (static and player effect) and the `tap-for-mana` replacement. Losing mana is written once, inside the step-end loop, so an effect can't do it.

*Where it lives.* `engine/src/mana.ts`, beside `ManaUnit`:

- **One record of what was spent.** `SpentMana`, one `{ type, from? }` per unit (a unit's type and `ManaOrigin`, not its restrictions or riders, which are done with once it's paid). `GameObject.manaSpent?: SpentMana[]` on a spell **or an activated ability on the stack**, `lastStackManaSpent`, `LastKnown.manaSpent`. The total is its length.
- **One read of it.** `spentManaCount(units, query)` over `ManaSpentQuery { type?, from?, sameColor?, count?: "colors" }`, and on the card side one clause and one amount:
  - `CardFilter.manaSpent: ManaSpentClause[]`, each a query and an `amount` (default "at least one"): `[{ type: "W", amount: { op: "gte", n: 3 } }]` for adamant, `[{ from: { subtype: "Treasure" } }]`, `[{ amount: { op: "gte", n: 4 } }]`, `[{ type: "C", amount: { op: "eq", n: 0 } }]` for "if {C} wasn't spent".
  - `{ manaSpentOf: ref, type?, from?, count?, per? }`. `count: "colors"` is converge; `per: 2` counts pairs, "for each {G}{G} spent" (two and two more is two, a third alone adds nothing).
  - An activated ability's mana is read by `manaSpentOf: "this-ability"` and the `ability-mana-spent` condition ("if mana from a Treasure was spent to activate this ability"). A spell's `"source"` still reads the spell.
- **One record of what a tapped permanent makes instead.** `ManaProductionRule { filter?, tapper, produces?, colorsOnly?, one?, atLeast?, times? }`, kept in `StaticAbility.manaProduction` and on a `PlayerEffect`; read by one `Game.manaProductionFor`. Absent `filter` is any permanent; a land rule says `{ type: "land" }`. `times` is Mana Reflection's and Nyxbloom's. `atLeast: 2` is Damping Sphere's. It replaces `landManaInstead` (both homes), `LandManaInstead`, and `TapManaMultiplierReplacement`.
- **One way to lose mana.** `Game.loseUnspentMana(player, keeps?)`, the step-end loop and the new `lose-unspent-mana` effect both. Kruphix's "becomes colorless instead" and Yurlok's life loss apply to either; "you don't lose … as steps and phases end" applies only to the step's.
- **One read of the pool.** `grantPtPerCount.unspentMana`, the `unspent-mana` condition and the `unspentMana` amount, each `{ type? }`.

*Rules.*
- **106.1, 106.1b**: {C} is a type and not a colour, so `count: "colors"` skips it and `type: "C"` finds it.
- **106.3**: mana's source is the source of the ability or the spell, already `ManaOrigin`.
- **106.4**: a pool empties at the end of each step and phase, and that's "losing" it. An instruction to lose unspent mana is the same loss, so a "would lose" replacement sees it and a "you don't lose … as steps and phases end" doesn't apply.
- **106.5**: Squandered Resources on a land that could produce nothing makes nothing (its ruling).
- **106.6, 106.6a**: replacement keeps restrictions and riders; Omnath's "becomes colorless" keeps them (its ruling).
- **106.7**: "could produce" takes replacement effects into account and ignores costs. So a filter or a sacrificed land reads through `couldProduce`.
- **106.12, 106.12a, 106.12b**: only a mana ability with {T} is "tapped for mana", and a replacement of it modifies the production as the ability resolves.
- **601.2g-h, 602.2b**: an ability is paid as a spell is, so what paid it is recorded the same way.
- **605.1a**: a mana ability needs no target and could add mana, so Squandered's and the depletion lands' are.
- **605.3b**: a mana ability doesn't use the stack, so what paid for one isn't recorded; nothing asks.
- **608.2h**: a spell gone from the stack is read as it last was.
- **616.1** with Damping Sphere's ruling: of several replacements the tapper picks an order, and one that no longer applies doesn't. The engine takes the order that leaves the tapper the most mana: type changes read the unmultiplied amount, then the multipliers (a land making {C}{C} under Sphere and Reflection: {C}{C}, not {C}).
- **702.44a** sunburst and converge (207.2c) read `count: "colors"`, so a copy (not cast) and a free cast read 0.

*Moved or not, decided before building.* **Moved and deleted:** every field and clause above, 150-odd card files by a script over their very regular spellings. Deliberately not moved:
- *`ManaUnit`'s own tags* (`restriction`, `spellGains`, `onSpend`): they ride on unspent mana, and a spent record is what's left.
- *`phyrexianPaidWithLife`, convoke and delve counts, the journal's `mana-spent`*: not mana spent on an object ("life paid" and "tapped"), or a player's running total for a turn.
- *What paid for X alone* (`amount:colored-mana-spent-on-x`, Soul Burn): knowing which units paid for X needs the payment to tag the X pips. Not built here.
- *`spendAs` and the spend-only restrictions*: what mana may pay, a different question from what did.
- *Mana Flare-style extras* (`tapped-for-mana` triggers): triggered mana abilities, not replacements (605.1b), and already one path.
- *A second round of `false dawn`-style "spells and abilities would add"*: only tapped permanents are replaced here; False Dawn stays open unless the reader takes it honestly.

*Bots.* `lose-unspent-mana` gets a target-polarity row (harm to the player losing it). Omnath's size reads through characteristics, so the eval sees it. `manaProduction` needs nothing: the options already carry what a land makes, and `couldProduce` reads the rule. No new decision kind expected.

*As built (step 7, B285).*
- `mana.ts`: `SpentMana`, `ManaSpentQuery`, `spentManaCount`, `ManaProductionRule`. `filter.ts`: `ManaSpentClause`. `Game.manaProductionRules`, `manaRuleApplies`, `landManaInsteadFor(…, wouldMake)`, `tapManaMultiplier(player, source)`, `tapWouldMake`, `loseUnspentMana`, `manaLossCostsLife`, `sacrificedManaChoices`.
- **Moved and deleted, every user migrated:** `GameObject.manaSpentFrom`, `manaSpentColors`, `manaSpentByColor`, `lastStackManaSpentColors` and their `LastKnown` copies (`manaSpent` and `lastStackManaSpent` are now the unit lists); `CardFilter.manaFrom`, `manaSpentOfColors`, `manaSpentOfOneColor`; the amount `colorsSpentOf`; `ctx.manaSpentFromOf`, `ctx.colorsSpentOf`; `StaticAbility.landManaInstead` and the player effect's, bare type and all; `LandManaInstead`; `TapManaMultiplierReplacement`; `unspentManaBecomesColorless` (now `unspentManaBecomes: "C"`). 142 card and test files by a script, run once; a pool test refuses every removed spelling.
- **How much moved, plainly:** the state and the card vocabulary are both one shape now, for spells and activated abilities. **Not** a generic "mana production event": only tapped permanents are replaced (106.12b), so False Dawn's "spells and abilities that would add colored mana" has no reader. And no `"this-ability"` `ObjectRef`, as the note first said: an activated ability's mana is on `lastKnownRefs.manaSpent`, read by `{ manaSpentOf: "this-ability" }` and the `ability-mana-spent` condition, so a resolution parked on a decision keeps it for free.
- **Behaviour changes:** the mana spent on a cast is counted from the units the pool paid rather than the resolved cost's mana value, which comes to the same in every test and fuzzer game. `manaSpent`'s `from` reads a spell countered in response as it last was on the stack, where `manaSpentFrom` didn't.
- **Damping Sphere and multipliers:** the rule reads "two or more" before any multiplier, the order leaving the tapper the most mana. Rule 616.1 lets the tapper take the other order, which only someone who wanted one {C} instead of two of the land's own mana would. The note's alternative auto-payer option wasn't built; the same fixed order was already Contamination's.
- **Additions the proving cards needed:** `add-mana`'s `{ sacrificedCouldProduce }` (read before the cost moves it; each offer names only the lands that make its colour), the `increasePerOtherSpellByCaster` cost modifier (Damping Sphere), and `count: "most-of-one-color"`, `per` on the query.
- Bots: `target-polarity` reads `lose-unspent-mana` as a harm to a targeted player. `effect-worth` has no row for it (0, the default, since a pool is nearly always empty when a bot weighs it). No new decision kind, so nothing to browser-check for one.
- Scaffolder: every old output moved; it now reads the pool size lines and the two land rules. It doesn't read "if mana from a Treasure was spent to activate this ability".
- Cards (20): Squandered Resources, Omnath, Locus of the Void (flagged); Omnath, Locus of Mana; Ozai, the Phoenix King; Damping Sphere; Ritual of Subdual; Jetmir's Fixer; Forsworn Paladin; Paragon of Modernity; Mana Short; Power Sink; Remote Farm, Saprazzan Skerry, Peat Bog, Hickory Woodlot; Doubling Cube; Glissa Sunseeker; Bladecoil Serpent; Wumpus Aberration; Clay Champion. `test/mana-reads.test.ts` covers each but Clay Champion's second ability and two of Bladecoil's three, with a pool walk for the removed spellings.
- Keys marked built: `static:mana-pool-reads`, `mana:any-type-sacrificed-land-could-produce`, `effect:empty-mana-pool`, `replacement:tap-for-mana-produces-colorless-instead`, `cost:depletion-counter-lands`, `stat:mana-spent-to-activate-from`, `amount:colors-spent-to-activate`, `stat:mana-color-spent-count`, `amount:unspent-mana`, `effect:double-mana-pool`, `stat:colorless-mana-spent-condition`.
- **Left unbuilt, not marked:** `effect:player-mana-ability-until-eot` (**Yavimaya Bloomsage // Channel stays flagged**): "any time you could activate a mana ability" has no object to activate, so it needs a new priority action, a source in the payment planner that isn't an object, and a client control; a real change. `filter:land-could-produce-mana-type` (Break the Ice, Obsidian Charmaw, Mana Web): `couldProduce` lives on `Game`, and `filter.ts` can't call it. `replacement:mana-production-replacement` (False Dawn, above; Damping Sphere is done). `amount:colored-mana-spent-on-x` (which units paid for X isn't recorded). `trigger:activates-ability-mana-from` (Vazi). `condition:snow-mana-of-spell-colors` (Boreal Outrider). Depletion lands go through hand activation (AUTHORING §15), as every counter-cost mana ability does. The rest of the 39 one-card keys.
- Measured: a timed `bot:bench` (16 games, four players, 8 workers, nothing else running) played the same games (11-5), 38.1 turns on average, at 64.0 s a game and 110.9 ms a decision (220.6 s wall), against 63.8 s and 110.2 ms before (216.0 s wall), inside the run-to-run noise. Both figures are in `engine/data/bench-log.jsonl`.

### 14. Attachments (36 keys, ~55 cards)

**Change.** `attach` takes any `AttachHostRef` including a player (Curses: rule 303.4 lets an Aura enchant a player)
and any attachee from an `ObjectSetRef` ("each created token", "the Equipment that was attached", "auras attached to
it").

**Keys:** effect:curse-attach-player 4, effect:attach-equipment-that-was-attached 3,
effect:return-as-aura-with-granted-ability 3, effect:attach-to-chosen-creature 3, static:attach-as-granted-equipment 3,
keyword:fortify 2, effect:create-token-attached-each 2, effect:attach-equipment-to-each-created-token 2,
effect:return-aura-after-host-died 2. Existing: `AttachRef`/`AttachHostRef` (effects.ts:105, 126).

**Confidence: medium.**

**Design note (step 7, 2026-11-08): one `attach`, what and where.** Picked by `--by-rank`, flagged cards first: none of the twelve flagged cards' keys fall under themes 14 or 16, and Akiri (2078) comes before any theme-16 card.

*What's wrong today.* `attach` says "what goes on" four ways (`attachment`, `attachments`, `choose`, nothing) and "where" two ways (`target`, `ontoChosen`), and two more fields carry a half-done choice past the rebinding of slot 0 (`onto`, `attaching`). The combinations the fields can't hold are the blocked cards: a chosen attachment going on a chosen host (Gilgamesh), a whole group going on one chosen host (Fumble, Glamer Spinners), a host another player chooses (Steam Vines, Kudzu). Legality reads the *printed* subtypes (`def.subtypes.includes("Equipment")`), so "Clues you control are Equipment" can't be attached, and Fortification exists only as a word in `subtypes.ts`. `unattach` takes one fixed object and forgets what it was on (Akiri). A trigger on "becomes attached" sees only the source becoming attached, never another Aura arriving on the source (Brood Keeper, Siona).

*Where it lives.* `engine/src/attachments.ts`, the types and the pure reads:

- **`attachment` names what.** `AttachmentsRef`: an `ObjectRef` (the one object; absent, this permanent), `{ all: CardFilter }` (every match, a group that moves together), `{ choose: CardFilter, prompt, upTo?, min? }` (chosen as this resolves). Sets come through the filter's `inSet` clause, so "the Equipment that were attached to it" is `{ all: { inSet: { attachmentsOf: 0 }, subtype: "Equipment" } }`, and no second set field exists.
- **`target` names where.** `AttachTarget`: an `ObjectRef`, a `{ player }`, or `{ among: CardFilter, prompt, optional?, another?, chooser? }` (a host chosen as this resolves, not targeted, 608.2c). `chooser` is theme 5's `ChooserRef` ("that player attaches this Aura to a land of their choice").
- **One engine-built form,** `{ resolved }` on either side, replaces `onto` and `attaching`.
- **What's attached is settled first, then the host,** as printed ("attach one of them to a Samurai you control"). A group's host must take every member (Fumble's and Glamer Spinners' rulings: if no single host can, nothing moves).
- **Legality is one question.** `Game.attachmentKind` reads the permanent as it is (layer 4, keeping bestow, Licid and the enchant swap), `canEquip` also answers Fortifications (land, not creature), and the state-based check uses the same kind.
- **`fortify(cost)`** beside `equip(cost)` in `cards/helpers.ts`.
- **`unattach`** takes an `AttachmentsRef`, and what it took them from is the this-way set `{ thisWay: "unattached-from" }` ("tap that creature").
- **`becomes-attached`** takes `onto: "self"` and `attachment: CardFilter` beside `who: "self"`, with `filter` still the host.

*Rules.*
- **301.5, 301.5c, 301.6**: an Equipment attaches only to a creature and a Fortification only to a land; neither while it's a creature (reconfigure aside); a permanent that stops being Equipment can't equip and falls off (Armed with Proof's ruling).
- **303.4f, 303.4j**: an Aura attached by an effect goes only where it can enchant, or doesn't move.
- **608.2c**: "another creature" chosen as it resolves isn't targeted, so hexproof doesn't stop it (Fumble's ruling).
- **701.3a-c**: attaching to what it's already on does nothing, and an attachment that moves gets a new timestamp.
- **701.3d**: unattaching leaves it on the battlefield.
- **702.16d-e**: protection stops being enchanted, equipped or fortified.
- **702.67a**: fortify. **704.5m, 704.5n**: an illegal Aura goes to the graveyard, an illegal Equipment or Fortification falls off.

*Moved or not, decided before building.* **Moved and deleted:** `attach`'s `attachments`, `choose`, `ontoChosen`, `onto` and `attaching`, by a script over the card files and the scaffolder's output, with a pool test refusing the old spellings; `Game.attachableHosts`' filter parameter (it takes candidates, so `thisWay` and `inSet` work); every printed-subtype read of attachment legality. Deliberately not moved:
- *`AttachHostRef` on the entering effects* (`create-token`, `put-onto-battlefield`, `return-from-graveyard`, `look-and-choose`): entering has its own rules (303.4f, 301.5e), and the shape already takes any host.
- *`swap-enchant`, `become-licid-aura`, bestow*: an object becoming an Aura is a different question from attaching one.
- *`choosePermanentOnEnter.attach`*, *living weapon*, *the cost `unattach`*: each is one fixed shape with nothing blocked behind it.
- *Theme 16's grants*: "have equip {2}" uses the `grantActivated` a static already has.

*Bots.* `target-polarity`'s `attach` row reads the object forms of `target` and `attachment`; `controller.ts`'s choose-permanents cap reads the new shape; a chosen host is a `help` pick, as a chosen attachment already is, unless the chooser isn't the Aura's controller. `isPointlessReattach` needs no change.

*As built (step 7, B288).*
- `attachments.ts`: `AttachAll`, `AttachChoice`, `AttachResolved`, `AttachmentsRef`, `AttachHostChoice`, `AttachHostResolved`, `AttachTarget`. `applyAttach` and `applyUnattach` in `effects.ts`; `Game.attachmentKind`, `canAttachTo`; `fortify` in `cards/helpers.ts`.
- **Moved and deleted, every user migrated:** `attach`'s `attachments`, `choose`, `ontoChosen`, `onto` and `attaching`; `ctx.attachAll`, `Game`'s `attachAll`; the printed-subtype reads in `attachPermanent` and the state-based check. 27 card and test files by a script, run once; `test/attach-what-and-where.test.ts` refuses `attachments:` and `ontoChosen` in the pool.
- **Differences from the note:** `{ all }` wakes a token stack as it's settled (`eachPermanentMatching`), so `attachAll` had no reason to stay. `attachableHosts` takes candidates, read through `ctx.permanentsMatching`, so a `{ thisWay }` or `controlledByRef` host filter works.
- **Behaviour changes:** a permanent that stops being Equipment falls off (704.5p), where the check read printed subtypes. The bots rank a chosen host as a target and decline a `may` with nothing on the right side; before this, an `ontoChosen` host went through the "don't move what's working against an opponent" filter meant for attachments.
- **Additions the proving cards needed:** `targetCostReduction.reduceGeneric: "target-colors"` (Dragonfire Blade: read as targets are chosen, offered for the targets it's affordable with); `choose-opponent`'s `exceptEnchanted` (Maddening Hex).
- Not benched: the new reads run only on attachments, and `attachmentKind` only for permanents that are attached.
- Bots: as the note. No new decision kind.
- Scaffolder: every output moved; reads "Fortify {N}" and "Whenever an Aura becomes attached to ~". It doesn't read a chosen host or `{ all }`.
- Cards (16): Akiri, Fearless Voyager; Dragonfire Blade; Retether; Maddening Hex; Cori-Steel Cutter; Gilgamesh, Master-at-Arms; Field-Tested Frying Pan; Fractal Harness; Bramble Elemental; Siona, Captain of the Pyleas; Goldwardens' Gambit; Fumble; Armed with Proof; Darksteel Garrison; Glamer Spinners; Steam Vines. `test/attach-what-and-where.test.ts` covers each.
- Played live in the builder at 1366x768: Darksteel Garrison (only the land offered, the Garrison under it), Armed with Proof (a Clue equipped, Bears 4/2, one Clue left), Cori-Steel Cutter (the Monk prompt, Confirm at 0 chosen).
- Keys marked built: `effect:unattached-from-creature-ref`, `cost:equip-cost-per-color`, `effect:return-auras-attached-to-chosen-creatures`, `effect:reattach-curse-random-opponent`, `effect:choose-which-created-token-to-attach`, `effect:reflexive-attach-one-of-put-this-way`, `effect:create-token-attach-equipment`, `effect:attach-to-created-token-by-filter`, `effect:attach-equipment-to-each-created-token`, `effect:gain-control-attachments`, `static:attach-as-granted-equipment`, `keyword:fortify`, `trigger:aura-becomes-attached-to-permanent`, `effect:move-auras-to-chosen-permanent`, `effect:attach-aura-to-land-chosen-by-player`, `effect:attach-chosen-by-other-player`.
- **Left unbuilt, not marked:** `effect:attach-to-chosen-creature` (Crown of the Ages, Enchantment Alteration: likely `target: 1, attachment: 0`, not tried), `effect:create-token-attached-each` (Asinine Antics, Twisted Sewer-Witch: likely a `for-each-permanent` over `create-token`'s `attachedTo`, not tried), the Aura-after-host-died family (`effect:return-aura-after-host-died`, `effect:return-as-aura-with-granted-ability`), `effect:aura-onto-each-created-token`, `effect:create-aura-token-attached-to-player`, `effect:attach-granting-aura`, `effect:flicker-host-and-auras-return-attached`, and the rest of the one-card keys. C.A.M.P. has fortify but also needs "shares a color with the mana that land produced".

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

**Design note (step 7, 2026-11-09): one step timing, one duration, one intervening "if".** Picked by the plan's order, the last theme; Fight for the Throne and Loki Laufeyson are the flagged cards under it. Theme 1 already built the captured context (`DelayedTrigger.x`, `.player`, `remember`), so this piece is the timing, the durations and the "if".

*What's wrong today.* `DelayedTriggerTiming` is ten strings, each a fixed product of step, player and "which one", and the missing products are the blocked cards: the next combat, the next main phase this turn, a chosen player's end step, an owner's upkeep, the first main phase. `turnOf` and `turnBegan` sit beside it to patch two of the ten. `DelayedWheneverWatch` keeps its duration in four flags (`untilYourNextTurn`, `untilEndOfCombat`, `forGame`, `whileAnyExiled`), though the effect already says it as a `WatchDuration`. Only `losesControl` has an intervening "if" (`onlyIf`), so "when that creature dies this turn, **if** you control your commander" has nowhere to go. Read counts: `at` is written about 430 times across 510 pool files and about 25 test files, and read in 17 places in `game.ts`, 10 of them `typeof at === "object"` guards that would silently take a step timing for a watch once it's an object.

*Where it lives.* `engine/src/delayed-at.ts`, the types and the pure question of whether a step fires one:

- **`DelayedAt`** is what a card says: `{ step, whose?, which? }`. `step` is a `Step` that gives priority, or `"main"` for either main phase. `whose` is a `PlayerRef` or `"any"` (the default); `"you"` is the delayed ability's controller, since "you" in its text means that player (603.7d-e). `which` is `"next"` (the default, the next to begin), `"this-turn"` (lapses with the turn) or `"next-turn"` (in a turn of `whose` not begun yet; lapses unfired if that turn's step never comes).
- **`DelayedStepWatch`** is what the state keeps: `whose` a `PlayerId` or `"any"`, `which` filled in, and `turnBegan` moved inside it. `delayedStep(...)` builds one for the engine's own calls.
- **`delayedStepFires`** is the one switch, with the two guards that exist today (a step begun before the ability was made; an additional upkeep or end step) kept by step.
- **`until: WatchDuration`** on the watch, in place of the four flags. `WatchDuration` gains `"end-of-turn"`, `"until-end-of-your-next-turn"` (Season of the Bold) and `"while-exiled"` (Dimensional Breach's flag).
- **`if?: StaticCondition`** on the `delayed-trigger` effect, whatever it waits for, asked as it would trigger and again as it resolves (603.4).
- **`flicker`'s `target`** takes `{ all: CardFilter }`: "exile each creature you control. Return those cards … at the beginning of the next end step" is the linked return (610.3) `returnAt` already builds.

*Rules.*
- **603.4**: an intervening "if" is checked as the event occurs and again on resolution.
- **603.7b**: once, unless a duration is stated. **603.7c**: it affects its object only while that object stays where it's expected.
- **603.7d-e**: its source and controller are those of what created it.
- **502.4**: no player gets priority in the untap step, so `DelayedAt` doesn't offer it, and Undiscovered Paradise's "during your next untap step" stays blocked: it isn't a trigger.

*Moved or not, decided before building.* **Moved and deleted:** `DelayedTriggerTiming`, `delayed-trigger`'s `turnOf`, `DelayedTrigger.turnOf` and `.turnBegan`, the watch's four flags, `DelayedLosesControl.onlyIf`, by a script over cards, tests and the scaffolder's output, with a pool test refusing the old spellings. **Not moved:**
- *`returnOnOwnersTurn`*: one delayed ability per owner among the cards exiled, which no single `whose` can say.
- *The other watches* (`leaves`, `nextSpell`, `attacksUnblocked`, `losesControl`, `thatCombat`): each waits on an event, not a step, and has no duration field to unify beyond what it has.
- *`next-end-step` as a copy's `ends`* (a `CopyDuration` point) and `exile-at`-style durations: those are when an effect ends, not when an ability fires.

*Bots.* `target-polarity`'s `delayed-trigger` row and `effect-worth` read `leaves`, `watching` and the inner effect, none of which move, and a step timing doesn't carry those keys. A flicker with `{ all }` names no slot, so nothing rates it, the same as `exile-all`. `if` needs nothing: a delayed trigger's worth is already its effect's, and a bot can't aim it.

*As built (step 7, B292).*
- `delayed-at.ts`: `DelayedAt`, `DelayedStepWatch`, `DelayedStep`, `DelayedWhich`, `delayedStep`, `readDelayedAt`, `isStepWatch`, `delayedStepFires`, `watchOutlastsItsTurn`. `Game.delayedIfHolds` is the one reader of `if`, at all six places a delayed ability can trigger and on resolution.
- **Moved and deleted, every user migrated:** `DelayedTriggerTiming`, `delayed-trigger`'s `turnOf`, `DelayedTrigger.turnOf` and `.turnBegan`, the watch's `untilYourNextTurn`, `untilEndOfCombat`, `forGame` and `whileAnyExiled`, `DelayedLosesControl.onlyIf`. 468 spellings in 438 files by a script, run once; `test/delayed-at.test.ts` refuses them.
- **Differences from the note:** `which: "this-turn"` skips the end-step guard, because an extra turn's "that turn's end step" is set up as the turn begins, while the step is still the last turn's. The `typeof at === "object"` guards went with the strings, each replaced by the key it was reaching for, so a step timing can't be read as a watch.
- **Behaviour changes:** a delayed ability's X is now its creator's over the X of a spell that fired it, when the creator had one (Storm King's Thunder copying an X spell); a creator with none still reads the spell's (Brass Infiniscope). A `nextSpell` filter's `{ amount }` is read as the spell is cast rather than as the ability is set up (Loki's power, counters added since included). No pool card read it before.
- **Cards, 12:** Fight for the Throne and Loki Laufeyson (flagged), Ghostway, Planar Guide, Legion's Initiative, Plasm Capture, Season of the Bold, Storm King's Thunder, Phytotitan, Vigorous Charge, Fire Giant's Fury, Vivien's Stampede. **Keys built, 11:** the delayed-trigger timing, intervening-if, live-amount, creator-X, next-turn watch and untargeted-group flicker keys, and `effect:delayed-combat-damage-that-much`, which needed no engine code. The other cards they free are in `--stale` for `author-freed`.
- **Left unbuilt:** Nahiri's Resolve (`effect:flicker-chosen-group`: an untargeted choice, where `{ all }` takes every match), Lae'zel's Acrobatics (`effect:flicker-exile-then-roll-and-return`), Feral Encounter (`effect:delayed-step-chooses-targets`: a step-timed delayed ability choosing targets as it triggers), Faramir (`condition:player-attacked-you-this-turn`: `attackedYouThisTurn` misses an attacker that has left). `returnOnOwnersTurn` stays, one ability per owner. The pay-before-a-deadline family (Glass Asp) needs a window of its own.

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

**Design note (step 7, 2026-11-08): keyword values, and a doubler by any event.** No flagged card's key falls under this theme (the twelve are all blocked elsewhere), so the proving cards are the theme's own top keys.

*What's wrong today.* A keyword with a cost can be granted only if somebody added a field for that keyword: `grantsWarpInHand`, `grantsNinjutsuInHand`, `grantsCyclingInHand`, `grantsForetellInHand`, `grantsBlitzInHand`, `grantsOffspringToSpells`, `grantsEvokeToSpells`, plus `grantsToHand.miracle` and `grantsToSpells.freerunning`, `.webSlinging`, `.prowl`. Each has its own reader and each says "its mana cost" its own way, or can't. So replicate, emerge and madness have no spelling. Vanishing and soulbond are spread abilities with no name, so a copy can't ask "does it have vanishing" or "lose soulbond". And `doubleTriggers.cause` is a closed list of seven events.

*Measured first.* `kicker` is read off the definition about 56 times in `game.ts` (9 more in `actions.ts`, 8 in `filter.ts`), as theme 4 warned. A caster-aware "effective kicker" would rewrite all of them and still couldn't hold a spell with a printed kicker and a granted replicate, which are separate additional costs (702.56b; Zinnia's offspring already sits apart for the same reason, 702.175b). So replicate **stops being a kicker**: it takes the channel offspring already has, and no `kicker` read changes.

*Where it lives.* `engine/src/keyword-values.ts`, the types and the pure cost read:

- **`KeywordCost`**: a mana string, `"mana-cost"` ("equal to its mana cost"), or `{ manaCostLess: N }` (Dream Devourer's foretell, 118.7a). `keywordCostString(cost, def)` reads it against the face being cast, null for a card with no mana cost.
- **`KeywordValue`**: `{ keyword, cost, …what that keyword also takes }` for warp, ninjutsu, cycling (`search`), foretell, miracle, madness, blitz, evoke, offspring, replicate, emerge, freerunning, web-slinging, prowl.
- **Two grant fields, both already there.** `grantsToHand: { filter, keywordValues, eachPlayer? }` for "each [card] in your hand has…" and `grantsToSpells.keywordValues` for "[spells] you cast have…", which brings `castFrom`, `firstEachTurn`, `allSpells` and `castGrantReaches` with it.
- **One read each way.** `Game.handKeywordValues(card, keyword)` and `Game.castKeywordCosts(player, card, def, keyword)`, printed field first and then every grant, so a printed keyword and a granted one are both there as the rules have them. `grantedCastCost` goes.
- **`KeywordCostsPaid`** (`offspring?`, `replicate?: number[]`, one count per instance) is one cast-action field in place of `offspring`, threaded where `offspring` was. Replicate is `def.replicate` (`cost`, `also?`), read through the same cast read. Each instance makes its own copy trigger (702.56b).
- **Keyword abilities that are printed pieces get a name.** `vanishing()` and `soulbond()` stamp their abilities `keywordOf`. `ifCopied` takes `{ lacksKeyword, patch }` beside `{ ofType, patch }`. `loseKeywordAbilities` on the patch marks stamped abilities lost, so a copy "loses soulbond" and the indices don't move.
- **Emerge** becomes a list: printed and granted are each an offer, as evoke's are.
- **Madness** is read in the hand, where a discard happens, and the cost travels with the cast offer. "Each Vampire card you own that isn't on the battlefield" reaches further, but the keyword does nothing anywhere else (702.35a), so `grantsToHand` says it.

*Part (b).* `doubleTriggers` takes `{ cause: TriggerCause | readonly TriggerCause[], filter?, source? }`: `TriggerCause` is the seven names, `"leaves"`, `"turned-face-up"`, and any `TriggerEventName` from theme 2's table, whose subject the filter reads. `source` filters whose ability it is, beside the doubler's own side. The room abilities are `{ cause: "room" }`.

*Rules.* 702.56a-b replicate; 702.119a emerge; 702.35a madness; 702.94a miracle; 702.143a foretell; 702.74a evoke; 702.175a-b offspring; 702.185a warp; 702.152a blitz; 702.49a ninjutsu; 702.29a cycling; 702.63a vanishing; 702.95a soulbond; 707.9a-b copy exceptions; 118.7a generic reductions; 118.9a one alternative cost; 603.2 causes; 113.6 grants reaching other zones.

*Moved or not, decided before building.* **Moved and deleted:** the seven `grants*` fields, `grantsToHand.miracle`, `grantsToSpells.freerunning`/`webSlinging`/`prowl`, `kicker.keyword: "replicate"`, the `offspring` action field and offer fields. A script over the card files and the scaffolder's output, with a pool test refusing the removed spellings. Deliberately not moved:
- *The printed fields* (`def.madness`, `def.evoke`, …): each has its own extras (`evoke.exileFromHand`, `cycling.search`) and one read now folds it with the grants, so storing it differently buys nothing and churns 450 card files.
- *`grantsToSpells.casualty`, `.conspire`, `.convoke`, `.improvise`*: read on the stack or with no parameter; no key waits on them.
- *`grantsToGraveyard`*: its own shape already takes `keywords`, and it needs no new reader here.
- *Kicker*: see above.

*Bots.* A cast offer's `keywordCosts` and `emergeCost` are echoed like `kicked` (`candidates.ts`, `random-cast.ts`, `controller.ts`). The bots already judge a multikicker by playing it out, so no `effect-worth` row was added: each replicate payment is one more copy in the simulation. The capture label names the payments. No new decision kind.

*As built (step 7, B289).* Both parts fit one session.
- `keyword-values.ts`: `KeywordCost`, `KeywordValue`, `KeywordValueName`, `KeywordCostsPaid`, `keywordCostString`. `Game.handKeywordValues`, `handKeywordCost`, `spellKeywordCosts`, `replicateInstancesOf`, `replicateCounts`, `keywordCostsString`, `keywordCostsText`, `withCastPicks`, `emergeOptionsOf`, `emergeOptionPicked`, `madnessCostOf`, `roomTriggerDoublers`. `reduceGenericInCost` moved to `mana.ts`.
- **Moved and deleted, every user migrated:** the seven `grants*` fields, `grantsToHand.miracle`, `grantsToSpells.freerunning`, `.webSlinging`, `.prowl`, `Game.grantedCastCost`, `grantedOffspringCost`, `kicker.keyword: "replicate"` (14 printed cards to `def.replicate`), the `offspring` action field and `offspringCost` offer field, and the positional `offspring` parameter through the cast pipeline, about 30 call sites, now the `keywordCostsPick` pick. 29 card and test files by a script, run once; `test/keyword-values.test.ts` refuses the removed spellings.
- **Differences from the note:** the fold is called `spellKeywordCosts`, because `castKeywordCosts` was taken by harmonize's and sneak's. Keyword costs join the additional-cost string `castCostString` already builds, so an alternative cost and a free cast take them too; overload's early return doesn't, so a replicate isn't offered beside overload. Saddle needed no value: `grantsActivated: [saddle(2)]` says it (Jandor).
- **Behaviour changes:** a permanent spell keeps `alternativeCostPaid` as it enters, so "if its madness cost was paid" is asked of the permanent (Grave Scrabbler). A static a copy exception adds now applies as the copy enters (rule 707.9b). A whole-declaration attack event tests a doubler's filter against every attacker, where a filter used to make it not double.
- **Additions the proving cards needed:** `CardFilter.colorCount` (Threefold Signal); a `do: pay-energy` also-cost scales and caps with the number of payments (Reiterating Bolt).
- Not benched: every new read runs only for cards with a grant in play or a printed replicate. `Game.replicateCounts` bounds the offers at `MAX_REPLICATE_OFFERED`.
- Scaffolder: every output moved. It doesn't read a granted replicate, emerge or madness, or the new doubler causes.
- Cards (18): Djinn Illuminatus; Hatchery Sliver; Ian Chesterton; Hugh, First of Many; Threefold Signal; Herigast, Erupting Nullkite; Falkenrath Gorger; Grave Scrabbler; Flesh Duplicate; Mirage Phalanx; Exterminate!; Reiterating Bolt; Hama Pashar, Ruin Seeker; Dungeon Delver; Wulfgar of Icewind Dale; Gandalf the White; Jandor, Fortuned Traveler; Panoptic Projektor. `test/keyword-values.test.ts` covers each but Dungeon Delver, whose grant is Hama Pashar's static with one more read through `staticsOfSource`.
- Keys marked built: `static:grant-replicate`, `static:grant-emerge`, `static:grant-madness`, `condition:self-madness-paid`, `cost:replicate-tap-permanent`, `cost:replicate-energy`, `effect:copy-exception-if-copied-lacks-ability`, `effect:copy-exception-loses-ability`, `static:room-abilities-trigger-twice`, `static:double-triggers-on-leaves`, `static:double-attack-triggers-your-attackers`, `static:trigger-doubler-turned-face-up`, `static:grant-saddle`.
- Expressible without new engine code when tried: `static:grant-saddle` (Jandor), and `condition:self-madness-paid` needed only the flag to survive entering; `static:double-attack-triggers-your-attackers` only the filter fix above.
- **Left unbuilt, not marked:** `static:granted-dies-trigger-doubling` (The Masamune: "or an emblem you own", and doublers don't reach emblems), `static:grant-jump-start-to-graveyard-cards` and `effect:grant-jump-start` (jump-start is a printed flashback's `keyword`, with no grant reader), `static:grant-enter-choice-keyword` (Tesak), `effect:trigger-spell-gains-keyword`, `effect:spell-on-stack-gains-keyword`, `amount:emerge-sacrificed-creature`, `trigger:sacrificed-for-emerge`. Psionic Ritual's replicate is built, the card wasn't tried, and it's in `--stale`.

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
