# COMPLETED.md

What `BACKLOG.md` listed as to do and has since landed: one line each, newest first, under the
same sections as the backlog, with the date and the commit (`git show <hash>` for the detail).
When a backlog item lands, its line moves here; when part of one lands, that part moves and the
rest stays there.

**Check here before building something.** A feature, card family or fix may already exist,
perhaps under another name. Search this file and `top-commanders-gaps.json`'s `built` array,
then `git log --grep`, before starting. This file starts on 2026-10-14; anything older is in
`git log` and `ROADMAP.md` (the engine's phases and the P0–P20 passes).

## Commander gap

- **Need-key themes step 7, fourth piece: one combat rule** (2026-11-08, B284): `CombatRule` (`combat/rules.ts`) replaces the eleven static combat fields, `block-if-able`, `attack-requirement`, `turnRestrictions`, `blockRequirements`, `attackRequirements` and the per-creature combat fields, kept in `StaticAbility.restrictions`, `PtModifier.restrictions` or `PlayerEffect.combat` and read through `recordsOn`; 14 cards (Galactus and Silver Surfer flagged, Brimaz, the shadow blockers), 6 keys.
- **Need-key themes step 7, third piece: one `instead` and one resolved record** (2026-11-08, B283): `AmountChange` / `Instead` (`replacements.ts`) and `ActiveReplacement` replace the nine amount spellings, `DrawReplacedByEffect`, `PreventionShield`, the Fog flags and the `PlayerEffect` replacement fields; `would-lose-game`, `would-scry`, `heal`, and an effect `instead` on damage, draws and life gain. Moonlit Meditation, Wolverine, Doc Samson, Quantum Riddler (flagged) and 14 proving cards; 18 keys marked built.
- **Need-key themes step 7, second piece: one play-permission record** (2026-11-08, B282): `PlayTerms` / `Game.playOptions` (`play-permission.ts`) replace `GameObject.impulse`, the graveyard and linked permissions, the five `PlayerEffect` and five `StaticAbility` fields and the three card fields, about 430 files moved; every rider now works from every zone; 10 cards, four flagged; `docs/plans/need-key-themes.md`, theme 10.
- **Need-key themes step 7, first piece: refs and relational filters** (2026-11-08, B281, commit 68c6eff02): one `ObjectRef` / `PlayerRef` algebra (`refs.ts`, read vs act: 608.2h, 400.7) in every ref slot, six parallel unions deleted; relational clauses (`sameNameWith`, `sharesColorWith`, `attachedToObject`, `controlledByRef`, `least`, `hasKeyword`, `hasActivatedAbility`) and one `object-matches` condition; 18 cards, 18 keys. `controlledByTarget`, `CardFilter.controlledBy` and `TargetSpec.whose` stay (the plan's *As built*).
- **Need-key themes step 6: the cost pipeline and one chooser type** (2026-11-08, B280): cost modifiers read an `EffectAmount` and one spell clause, effects can be costs (`cost-acts.ts`), and one `ChooserRef` replaces the six spellings; 23 cards, 20 keys.
- **Need-key themes step 5: object sets and one aggregate** (2026-11-08, B279): one
  `ObjectSetRef` (`engine/src/object-sets.ts`) for every set of objects a card names — what was
  done this way, what the cost took, the cards exiled with the source, the trigger's batch, what's
  attached to the source, a target group, what a delayed or reflexive ability remembered — each
  member read as it was (608.2h) and acted on only in its stint (400.7), taken by the aggregate
  (`in`, and `"min"`), the filter (`inSet`), the share clauses, the one-object amounts and
  `create-token-copy`. Nine `LastKnownRefs` fields, five `AmountRef`s, the `thisWay` amount's
  `sumOf` / `greatestOf`, `triggerBatch`, `sameNameAsThisWay`, the aggregate zone `"attackers"`,
  the exiled-with-source amounts and `CountSpec`'s `exiledWithThis` deleted, ~200 card sites moved.
  The player aggregate `amongPlayers` (replacing `greatestAmongPlayers` / `lowestLifeTotal`, and
  in a CDA); theme 15's captured context (a delayed ability keeps its creator's X, "that player"
  and `remember`ed sets). 19 cards (Synthetic Destiny, Thorin, Mountain-king, Brass Infiniscope,
  Captain Marvel, Apex Avenger, Balance, Malignus, Unlicensed Hearse and 10 more), 13 keys built,
  four flagged cards unflagged.

- **Need-key themes step 4: declarative event triggers and one timing wrapper** (2026-11-07,
  B278): the generic `{ on: "event", event, who?, filter?, by? }` trigger over a table of event
  words (`engine/src/trigger-events.ts`), which absorbed 19 hand-written kinds and the unused
  `predicate` hatch; one `TriggerTiming` (`firstTimeEachTurn` / `nthEachTurn`) on every trigger,
  counted from the journal, in place of ten per-kind flags and five event-carried ones; 603.2h's
  "do this only once each turn" now stops the trigger itself; the per-ability usage limits
  (602.5b, 603.2, "resolved N times", modes chosen, "did its thing") moved onto journal entries,
  six fields and `targetedThisTurn` / `tappedOnTurn` deleted. Also `activates-ability`'s
  `orMana`, the `connived`, `became-crewed` and `bent` events, Leader's connive replacement,
  the batched damage trigger's "those creatures", transform's "if you do". 24 cards (Glorious
  Purpose, Ultron, Unlimited, Iron Monger, Leader, Super-Genius, Elrond, Moon-Reader, Avatar
  Aang, Way of the Mind Sculptor, Tamiyo, Upriser Crowned and 16 of the theme's), 17 keys built,
  eight flagged cards unflagged.

- **Need-key themes step 3: one turn journal in game state** (2026-11-07, B277):
  `engine/src/journal.ts` and `GameState.journal`, one normalised entry per event kept as it was
  (603.10a), read through windows (this turn, last turn, their last turn, since your last turn,
  this game) and pruned to one round; `TurnHistory` and ten `*ThisTurn` counters deleted with
  their readers, the new `journaled` filter clause, token folding by each token's own record.
  13 cards (Kid Loki, Kiora of Salt and Sand, Kíli the Resourceful, Captain America, Living
  Legend and nine of the theme's), seven keys built, four flagged cards unflagged. Clone cost
  unchanged, the bench 5% faster. The fields not moved yet are listed in the plan's theme 6.

- **Need-key themes step 2: one `Duration`, one `Expiry`, the timed static** (2026-11-07, B276):
  `engine/src/duration.ts` replaces `PtDuration`, `UntilPointDuration`, `CopyUntil`,
  `ImpulseDuration`, `EffectDuration`, `PlayerEffect.expires`' private kinds and six field-local
  unions (140 card files and the scaffolder renamed); any player's next turn as an anchor
  (`untilTurnOf`/`throughTurnOf`/`duringTurnOf`, `GameState.laterPlayerEffects`); the `timed-static`
  effect on emblem machinery (`EmblemState.expires`, one expiry pass with player effects); bots count
  only lasting emblems. 12 cards: Teferi's Reproach, Willie Lumpkin, Zagorka, Emrakul, the Exigent
  Doom, Hall of Echoes, Jace's Machinations (flagged), Skullcrack, Call In a Professional, Roiling
  Vortex, Sphinx's Decree, Azor, the Lawbringer, Master of Cruelties; seven keys built.
- **Need-key themes step 1: key clean-up, and the freed cards** (2026-11-07, B275, `author-freed`):
  13 duplicate need keys merged (aliases, records re-pointed); nine keys built, six of them with no
  engine code and three with one switch each (`costModification.notFromCastersHand`, an `orPlayer`
  counters trigger's `who` reading the player, `counters-removed`'s `perCounter`); 33 cards
  authored, Bilbo, Thief in the Night and Advanced Reconstruction (flagged ASAP) among them, and 16
  given narrow keys; `--stale` emptied. Theme counts re-measured: 2,265 cards on 1,783 open keys,
  no theme moved more than 6 keys. Commits 301fc828e, 6d8a35214, ca60466bc and the record after.
- **Build ASAP overnight, round 5 and the run's end** (2026-11-07, B274, `/author-flagged
  overnight`, stopped at the user's call after twelve agents: 36 flagged cards and six proving cards
  authored, Moonlit Meditation blocked): Zenos yae Galvus (`choose-permanents`' `remember`, `who:
  "chosen"`, `choosePlayerOnTransform`, rule 712.20, a `player-loses-game` trigger, 104.3a), Captain
  America's Shield with Elite Scaleguard and Esper Origins, Terra and Sothera (no engine code),
  Everlasting Torment (`damageAsThoughSourceHad`), Xu-Ifit (`EnterTypes.loseAbilities`), Ulalek
  (`{C/W}` hybrid pips and `copy-all`; devoid needed no code), Waterbending Lesson ("unless you
  waterbend", rule 701.67a), Call the Spirit Dragons (`choose-for-each-slot`, 608.2f) and Ancient
  Adamantoise (`keepsDamageInCleanup`).
- **Build ASAP overnight, round 4** (2026-11-07, B274, `/author-flagged overnight`): Collective
  Effort with Collective Brutality (escalate's non-mana costs, `castModal.alsoPerExtraMode`, the tap
  offer's `perExtraMode`; escalate's mode cap fixed to judge only the cost; `cost:escalate-nonmana`),
  Planetarium of Wan Shi Tong (`cast-now`'s `marksAbilityDone`;
  `effect:cast-now-once-each-turn-if-cast`), Gogo, Master of Mimicry with See Double (`copy-ability`'s
  `count`, `cantBeCopied` on abilities and spells, rule 707.10; `effect:copy-ability-count`,
  `static:spell-cant-be-copied`), Empowered Autogenerator (`add-mana`'s `first`, an effect before the
  mana that the auto-payer sizes, rules 605.1a, 605.3b; `effect:mana-ability-effect-before-mana`),
  and Ultron, Artificial Malevolence and Dance with Calamity with no engine code.
- **Build ASAP overnight, round 3** (2026-11-07, B274, `/author-flagged overnight`): Locke,
  Treasure Hunter with Unlucky Witness (`GameState.permissionGroups`: one play shared across
  graveyard and exile permissions, `upTo` on `grant-graveyard-cast` and `impulse-exile`;
  `zone:cast-one-from-milled-until-end-of-turn`, `zone:impulse-play-only-one`), The Ur-Sphinx and
  Ark of Hunger (no engine code), Slicer (More Than Meets the Eye, living metal and convert, rule
  702.162a; a transforming card's back face can't be cast without a permission, 712.11),
  Bumi, Unleashed (`additional-combat`'s `onlyAttackers`, 508.1c; the key's other four cards need
  narrower keys) and Kefka, Dancing Mad (`thisWay`'s `byOwner`).
- **Build ASAP overnight, round 2** (2026-11-07, B274, `/author-flagged overnight`): The Warring
  Triad and Radiant Lotus (`add-mana`'s player `target`, not a mana ability, rule 605.5a;
  `effect:add-mana-target-player`), Wizard's Staff (`doubleTriggersOf`'s `host`, the equipped
  creature's triggers; `static:double-triggers-of-attached`), Gwenom, Remorseless with The
  Belligerent (`player-effect`'s library-top permissions until end of turn, paying life too;
  `effect:play-from-library-top-this-turn`, `cost:pay-life-equal-mv-instead-of-mana`), Plargg and
  Nassari (`cast-now`'s `exceptChosen`; `effect:opponent-chooses-exiled-this-way-excluded`), Y'shtola
  Rhul (`additional-end-step`, rule 500.9, the `endStep` turn-structure clause and
  `DelayedTrigger.createdInEndStep`; `effect:additional-end-step`), and Heroic Sacrifice and
  Currency Converter with no engine code (`effect:linked-exile-from-discard`).
- **Build ASAP overnight, round 1** (2026-11-07, B274, `/author-flagged overnight`): Gluntch, the
  Bestower, Mana Sculpt, Doc Aurlock, Grizzled Genius, Zack Fair (with Rhuk, Hexgold Nabber) and
  Unbound Flourishing. `choose-opponent`'s `thenAnother` (a further choice among the players not
  yet chosen in the chain) and `purpose` (`decision:choose-different-players`); mana spent on a
  countered spell read as it last was on the stack, rule 608.2h (`stat:countered-spell-mana-spent`);
  a static's `plotCostReduction` (`cost:plot-cost-reduction`); a leaving permanent's
  `LastKnownInfo.attachments` and the filter's `wasAttachedTo` (`effect:attach-equipment-that-was-attached`;
  Cass, Hand of Vengeance's Aura cards from the graveyard still need their own key); `double-x` and
  the `activates-ability` trigger's `xInCost` (`effect:double-x-on-cast`).
- **Three more Build ASAP cards** (2026-11-07, B273, `/author-flagged`): Loading Zone, Tablet of
  Discovery and Nahiri's Lithoforming. `grant-graveyard-cast`'s `cards: "milled-this-way"` and
  `play`: "mill a card. You may play that card this turn", a land card played with the land drop
  (`graveyardCastPermission.play`), and a milled card a replacement exiled instead (Rest in Peace)
  still that card (rule 701.17c), given the same permission from exile. `additional-land-drop`
  takes any amount ("you may play X additional lands this turn"). `player-effect`'s
  `entersTapped`: "lands you control enter tapped this turn" (rule 614.1d). Loading Zone needed
  nothing new (a `would-add-counter` multiplier with an `anyOf` filter). The scaffolder reads the
  land-drop, enters-tapped-this-turn and play-the-milled-card lines. Keys:
  `replacement:counter-multiplier-on-costs`, `zone:play-milled-card-this-turn`,
  `amount:additional-land-drop-amount`, `effect:temporary-permanents-enter-tapped`; they free Due
  Respect and Pir, Imaginative Rascal for `author-freed`. Locke, Treasure Hunter and Squandered
  Resources were looked at and stay blocked (B273's record says why); 12 flagged cards still wait.
- **The next four Build ASAP cards** (2026-11-06, B272, `/author-flagged`): Dragonhawk, Fate's
  Tempest, Improvisation Capstone, Gonti, Night Minister and Animist's Awakening, with Tasha's
  Hideous Laughter. An `objectTargets` amount: how many of the resolving ability's object targets
  are still the objects they were (rule 400.7) — a delayed trigger `about: "exiled"` counts "those
  cards that are still exiled". `reveal-until-count`'s `measure: "mana-value"`: until the cards
  found total mana value N (rule 202.3). A `notOwnedByController` card filter ("a spell they don't
  own", rule 108.4). Gonti's other key and Animist's Awakening's needed nothing new (`as-player`
  around a face-down `impulse-exile`; a take-all `look-and-choose`, then `untap-all` of the lands
  put there this way). Keys: `effect:delayed-count-still-exiled`,
  `effect:reveal-until-total-mana-value`, `zone:cast-spell-not-owned-by-caster`,
  `effect:impulse-exile-for-creature-controller`, `effect:reveal-x-put-all-matching`; they free
  Dream Harvest and Over the Top for `author-freed`. 15 flagged cards still wait.
- **The Build ASAP mill cards** (2026-11-06, B271, `/author-flagged`): Mirelurk Queen, The Wise
  Mothman and Tato Farmer. A `mills` trigger off the existing `cards-milled` event (rule 701.17):
  once per mill when a card matches its filter, its trigger value the matching count ("where X is
  the number of nonland cards milled this way"). Milled cards are marked `milledOnTurn` where the
  mill put them, cleared on a zone change (400.7), read by the `milledThisTurn` filter — narrower
  than put-there-from-a-library, as Tato Farmer's ruling says a surveilled land isn't a target.
  The scaffolder reads the trigger line. Keys: `trigger:mills-trigger`,
  `trigger:trigger-mills-nonland-card`, `stat:milled-this-turn-mill-only`; they free five more for
  `author-freed` (Glowing One, Infesting Radroach, Screeching Scorchbeast, The Master,
  Transcendent, Zellix). 19 flagged cards still wait.
- **The first Build ASAP cards** (2026-11-06, B270, `/author-flagged`): four of the 26 cards the
  user flagged in the library. Liliana of the Dark Realms (her −3's "+X/+X or −X/−X" is a
  resolution-time `modal`, as the ruling says) and Dracogenesis (an `alternativeCostForSpells`
  filtered to Dragons; beside Jodah the caster already picks which) needed no engine code. Planar
  Nexus: `alsoSubtypes` on a land, its twelve nonbasic land types as a CDA in every zone (rules
  205.3i, 604.3). Aettir and Priwen: a static's `setBasePtFromSourceCount`, a live layer-7b base
  P/T read from the source's side (rule 613.4b). The scaffolder reads both lines. Keys:
  `decision:choose-plus-or-minus`, `cost:multiple-alternative-costs`,
  `static:every-nonbasic-land-type`, `static:set-base-pt-to-life-total`. Squandered Resources was
  checked and stays blocked (the payment planner can't read a sacrificed land's last-known mana).
- **Twelve need keys by EDHREC rank, from five agents** (2026-11-06, `/build-family overnight`):
  Shatterskull Smashing and Meteor Shower (a divided total read from X, re-landed with the fix that
  reverted it: the X-group cast offer now carries `maxXUnreduced`, so X past what's payable is offered
  only with the cost-reducing target); Defiler of Vigor and Defiler of Dreams (an optional life
  payment as an additional cost, each way to pay its own cast offer, rules 118.3 and 119.4); Norn's
  Annex (an attack tax in {W/P}, `declare-attackers`' `phyrexianLife`, rule 107.4f); Winds of Abandon
  (`for-each-player`'s `whoseAmount`; a search's amount read for its searcher); The Last Agni Kai
  (`player-effect`'s `keepsUnspentMana`, emptying as cleanup ends, rule 500.5); Abundance, Pavel
  Chekov, First Posting and Obstinate Familiar (an optional `would-draw` replacement, asked draw by
  draw, rule 616.1); Skrelv's Hive (a filter scoped by toxic, granted toxic included, rule 613.8);
  and, needing no engine code, Inti, Seneschal of the Sun, Aven Interrupter, Thirst for Knowledge,
  Temur Sabertooth, Summon: Fenrir, Mutational Advantage, Tempt with Bunnies, Wild Magic Surge and
  Reweave. A fix with them: the "discard two unless one of a kind" prompt names its kind, and the bots
  see the one-card answer. Keys: `effect:divided-total-reading-x`,
  `cost:optional-life-additional-cost-for-spells`, `cost:attack-tax-phyrexian-mana`,
  `keyword:overload-per-controller-search`, `replacement:keep-unspent-mana-until-end-of-turn`,
  `trigger:discards-batch-trigger`, `replacement:draw-replacement-optional-skip`,
  `static:static-scoped-by-has-toxic`, `effect:exile-target-spell-plotted`,
  `effect:discard-unless-land`, `effect:may-return-if-you-do`,
  `effect:next-creature-enters-with-counter`, `effect:prevent-damage-each-matching-at-resolution`,
  `effect:tempting-offer`, `effect:reveal-until-shares-type`. Freed for `author-freed`: Defiler of
  Faith, Flesh and Instinct, and Chaotic Transformation.

- **Four more need keys by EDHREC rank** (2026-11-05), each card's own: Ugin, Eye of the Storms and
  Chandra, Heart of Fire (`search-library`'s `playable` takes any exile permission, so a search's
  exiled finds are castable later this turn, free only for Ugin, rule 118.9); The Eternal Wanderer
  (`flicker`'s `returnOnOwnersTurn`: one delayed return per owner, each at that owner's next end
  step, rule 603.7e; a new Samurai token); Malcolm, Alluring Scoundrel (`cast-now`'s `from:
  "discarded-this-way"`, offering the discarded card in its public zone, madness's exile included,
  rules 400.7j and 702.35a); Caduceus, Staff of Hermes (`Game.staticsOfSource` lists granted statics
  after a permanent's own, so prevention and replacements read them, rule 613.7 for one granted after
  the abilities were lost). Keys: `effect:search-finds-castable-this-turn`,
  `effect:flicker-return-at-owners-next-end-step`, `effect:cast-discarded-card-exiled-by-madness`,
  `static:granted-static-replacement`; no other cards freed.

- **Seven need keys by EDHREC rank, from three agents** (2026-11-05), each card's own keys:
  Bolas's Citadel (`castFromLibraryTop.payLifeManaValue`, the only way to cast from the top unless
  another permission reaches the card, X 0 by rule 107.3b); Archway of Innovation (`improvise` on
  `grant-spells-this-turn`); Plumb the Forbidden (`additionalCost.copyForEachSacrificed`, one
  reflexive trigger copying the spell X times through replicate's `queuePaidCostCopy`, no new
  targets by 707.10c); Carpet of Flowers (the `this-ability-did-this-turn` condition over
  `GameState.abilitiesDoneThisTurn`, which `add-mana`'s `marksAbilityDone` sets only when at least one
  mana was added — rule 107.1b); The Darkness Crystal and Gisa, Glorious Resurrector (a graveyard-exile
  replacement's `linked`, setting `exiledWith` from the permanent's last stint, rules 607.2b and 616.1);
  Valgavoth, Terror Eater (`playFromExile.payLifeManaValue`, `Game.exileStaticLifeCast`; "a card you
  didn't control" is `controlledBy: "opponent"`, rule 108.4a). Also a fix: an impulse's pay-life-only
  cast of a card with its own alternative cost (Gush under Inside Information) paid the card's cost, not
  the life. Keys: `zone:cast-from-library-top-pay-life-mana-value`, `effect:next-spell-has-improvise`,
  `cost:sacrifice-any-number-copy-for-each`, `condition:this-ability-did-this-turn`,
  `replacement:exile-instead-linked`, `zone:linked-exile-play-pay-life-alternative`,
  `replacement:exile-instead-cards-you-didnt-control`; no other cards freed.

- **An Aura on a graveyard card, and an enchant ability an effect gives** (2026-11-05), by EDHREC rank: "enchant creature card in a graveyard" (`enchantsGraveyardCard` — entered attached to the card, cast or chosen as it's put onto the battlefield, the client's `choose-enchant` popup for graveyard cards), `swap-enchant` (`GameObject.enchantSwap`: "enchant creature put onto the battlefield with this" or any spec, `becomeAura`): Animate Dead, Dance of the Dead, Necromancy, Cloudform, Lightform, Rageform.
- **Card definitions share a hidden class again** (2026-11-04), a regression from that morning: `defineCard`'s literal reached 128 entries, so the pool's import went from 1.2 s to 5.5 s and a fuzzer game cost 40-45% more per event. Its rare fields moved to `rareCardFields` (import 0.85 s), pinned by `card-definition-shape.test.ts`.
- **Stealing a spell** (2026-11-04), `gain-control-spell`, `putOnStackBy` and `spellCaster` read by what asks who cast it, seat targets rebound to the new controller (a bug for another player's copy too): Commandeer, Aethersnatch.
- **Exile, then return it transformed** (2026-11-04), no engine code: Urabrask, Sheoldred. **The greatest among discarded cards**, no engine code: Jace's Archivist, Scythe Specter, Ill-Timed Explosion.
- **A cost of untapping others** (2026-11-04), `untapOthers`: Halo Fountain, Crackleburr. **A cost increase except on the caster's turn**, `exceptOnCastersTurn`: Defense Grid. No engine code: Mutavault, Anticausal Vestige.
- **A token copy handed to another player** (2026-11-04), `create-token-copy`'s `who` and `goadedForGame`, `whileCondition` reading "that player": Wedding Ring, Fractured Identity, Life of the Party.
- **A doubled trigger by a player drawing** (2026-11-04), `doubleTriggers`' `"draws"`: Krang, the All-Powerful. No engine code: Traveling Chocobo, Contagion Engine, Lazotep Quarry.
- **An any-number group "other" than an earlier slot offers nothing that slot took** (2026-11-04), a bug since the card landed: Graceful Takedown could be offered, or silently cast with, an illegal target.
- **Two players searching, each in turn** (2026-11-04), `for-each-target` over `search-library`, the bots' polarity reading every member: Scheming Symmetry.
- **Repeated searches with one shuffle** (2026-11-04), no engine code: Claim Jumper.
- **A permanent that can't be attacked** (2026-11-04), `cant-be-attacked`, not binding a creature put onto the battlefield attacking (rule 508.4c): The Aetherspark.
- **A comparison with each other player** (2026-11-04), no engine code: Battle Angels of Tyr.
- **All colors, and P/T per card of the same name** (2026-11-04), no engine code: Leyline of the Guildpact, Mirror Box.
- **A spell copied an additional time, placed among the copies** (2026-11-04), `would-copy-spell`, `choose-number`'s `placeCopy`: Twinning Staff.
- **Copies of tokens that entered this turn** (2026-11-04), no engine code: Renewed Solidarity.
- **A one-use graveyard cast permission, and mana from this source** (2026-11-04), no engine code: Chainer, Nightmare Adept; Brass's Tunnel-Grinder.
- **Cards from hand taking {2} off a spell** (2026-11-04), `additionalCost.exileFromHandReduces`, the popup allowing only a legal mix with delve: March of Swirling Mist, March of Wretched Sorrow, March of Otherworldly Light.
- **What a source exiled into the graveyard as one event** (2026-11-04), `return-exiled-by-source`'s `linked: "graveyard"`: Valakut Exploration, Pinnacle Starcage, Gravegouger.
- **A die row that may roll again** (2026-11-04), `mayRollAgain` (rule 706.3c), the bots reading a roll's average: Delina, Wild Mage.
- **Devotion in a defining ability, fame or fortune, is-chosen-type** (2026-11-04), no engine code: Daxos, Seize the Spotlight, Adaptive Automaton.
- **A spell's own ceiling on X** (2026-11-04), `maxX` and `{ playersInGame: true }`: Open the Way.
- **"Do this only once each turn"** (2026-11-04), no engine code: Ondu Spiritdancer.
- **The total power of the creatures that died together** (2026-11-04), a batched `dies`'s `batchValue`, and a token's base P/T unclamped (rule 107.1b): The Skullspore Nexus.
- **A board condition read against its source** (2026-11-04), so `controls` reads `blockingRelation`: Sting, the Glinting Dagger.
- **What a flicker's delayed return does once the card's back** (2026-11-04), `flicker.returnThen`: Phelia, Obzedat, Hallowed Respite.
- **A spell's copy as a trigger, and mana kept by colour** (2026-11-04), no engine code: Ashling, Flame Dancer.
- **Annihilator X, and a card entering from exile seeing itself there** (2026-11-04), `annihilator(amount, text)`, `stillInExile`: Ulamog, the Defiler.
- **A discard cost of mana value X** (2026-11-04), `cost.discard.manaValueX`: Kozilek, the Great Distortion; Knollspine Invocation.
- **A spell's own triggers doubled** (2026-11-04), `doubleTriggersOf`'s `spells`: Echoes of Eternity.
- **One or more leaving, once per event** (2026-11-04), `leaves-battlefield`'s `batched`, a commander's 903.9b move part of it: Dour Port-Mage, Nefarious Imp.
- **Counters put on one permanent at once fire `counters-put` once** (2026-11-04), a bug: proliferating two kinds, or two wither sources, fired it per kind or source.
- **Counters put on players as a trigger** (2026-11-04), `counters-put`'s `orPlayer`: All Will Be One.
- **A spell being countered as a trigger** (2026-11-04), `counters-spell` and `spell-countered`: Baral, Lullmage Mentor, Multani's Presence.
- **Tokens made this way stay out of older stacks while the effect reads them** (2026-11-04), a bug in `thisWay: "created"` and `about: "created"` with an identical token made earlier the same turn: Retrieve the Esper, Gilt-Leaf Ambush and Force of Rage among those it hit (`readsCreatedTokens`).
- **A spell's target count read from an amount as it's cast** (2026-11-04): Comet Storm, Strength of the Tajuru, Aether Burst.
- **`look-and-choose`'s `exiled-this-way`** (2026-11-04), a commander asked 903.9b before anything moves: Scroll Rack.
- **The tokens an effect just created, referred to again** (2026-11-04), no engine code: Feldon of the Third Path, Case of the Stashed Skeleton.
- **A conditional look at the top card** (2026-11-04), no engine code: Case of the Locked Hothouse, Ranger Class.
- **A target filter read against its object's controller** (2026-11-04), `forItsController`: Drown in the Loch.
- **A cost reduced by the most any one opponent controls** (2026-11-04): Cavern-Hoard Dragon.
- **A commander declining 903.9b lands in the random order** (2026-11-04), a bug in cascade, discover and `reveal-until`'s exile: it always landed last.
- **A whole graveyard onto the bottom of a library in a random order** (2026-11-04), `put-on-libraries`' `graveyardOf` and `bottom-random`: Endurance.
- **An extra turn's end-step loss from another player's turn** (2026-11-04), no engine code: Final Fortune.
- **A delayed ability on each combat this turn** (2026-11-04), no engine code: Full Throttle.
- **A static prevention's follow-up on its recipient** (2026-11-04): Vigor.
- **One or more creatures attack you and aren't blocked** (2026-11-04): Coveted Jewel.
- **An intervening-if comparing two amounts** (2026-11-04): Liberator, Urza's Battlethopter; ED-E, Lonesome Eyebot.
- **As this transforms, applied while it transforms** (2026-11-04): Sephiroth, Fabled SOLDIER // Sephiroth, One-Winged Angel.
- **A target player's counters as an amount** (2026-11-04, `0c49db356`): Vraska, Betrayal's Sting.
- **"Put them onto the battlefield", every card a batched trigger fired on** (2026-11-04, `ff3b74496`): Hedge Shredder.
- **Token and counter doublers for every player** (2026-11-04, `96233e142`): Primal Vigor.
- **Equip at instant speed, and its other costs** (2026-11-04, `ca91e8836`): Forge Anew, Leonin Shikari, Bloodthorn Flail, Gavel of the
  Righteous.
- **Tokens that each fight a different creature** (2026-11-04, `46ed6653f`, `50d606799`): Ezuri's Predation.
- **A token multiplier of only some tokens** (2026-11-04, `16eb49d52`): Ojer Taq, Deepest Foundation // Temple of Civilization.
- **Proliferating several times for one** (2026-11-04, `f8262fe1a`): Tekuthal, Inquiry Dominus.
- **A target per opponent, on the seat slots already there** (2026-11-04, `f01524617`): Grasp of Fate.
- **Life for a coloured pip in every mana cost, and life that takes a player to exactly 0 (rule 119.4)** (2026-11-04, `a8f857b7b`,
  `558d93be9`): K'rrik, Son of Yawgmoth; Phyrexian pips share it.
- **A "may" a player can't do isn't offered, tapping and untapping included** (2026-11-04, `e86886e41`): Charismatic Conqueror.
- **Mana spendable only by the chosen color, and a mana trigger on any ability** (2026-11-04, `b6a1d586c`): Throne of Eldraine, Caged Sun.
- **A repeat's conditions read across its passes** (2026-11-04, `2dad94d7d`): Tainted Pact, Helm of Obedience.
- **Library searches by several players together, finds held until all enter** (2026-11-04, `ca9a88a27`): Tempt with Discovery, Field of
  Ruin, Veteran Explorer; every card of that shape (Hired Giant, New Frontiers) changed with them.
- **Harness and the infinity abilities it switches on** (2026-11-04, `a406e7323`): The Soul Stone, The Mind Stone.
- **A win on eight artifacts with one name** (2026-11-04, `311574dd6`): Mechanized Production; the machinery was already there.
- **A creature's own count of attacks this turn, additional combats with "at the beginning of that combat", and an added combat from the
  precombat main running before the turn's own** (2026-11-04, `24c92ed26`): Moraug, Fury of Akoum, World at War. One stand-in gone
  (`6902c560e`).
- **A kept creature with a counter, bound for as long as it has one** (2026-11-04, `278e18781`): Promise of Loyalty.
- **A live maximum as an intervening if** (2026-11-04, `dc0b8d7eb`): Padeem, Consul of Innovation.
- **A copied spell's delayed whenever outlives the copy** (2026-11-04, `0c10d9529`): Twincast on Glimpse of Nature draws twice.
- **A loss of life replaced, whatever caused it** (2026-11-04, `3bf2c4744`): Bloodletter of Aclazotz.
- **A delayed triggered mana ability** (2026-11-04, `e140cfb14`): High Tide, Bubbling Muck, Pyre Rhymer // Molten Tide.
- **A permanent of each permanent type, and the caster choosing for each player** (2026-11-04, `6a548a4d1`): Liliana, Dreadhorde General,
  Cataclysmic Gearhulk, Mythos of Snapdax.
- **A player's own count of turns taken** (2026-11-04, `886aea625`): Starting Town, Serra Avenger.
- **Other players' free casts, a spell named as it was on the stack** (2026-11-04, `4bc2ffd73`): Tibalt's Trickery.
- **Controlling a player while they search, exiling their finds, top-N searches; exile permissions end when the card's owner leaves (rule
  800.4a)** (2026-11-04, `81068ca34`, `87c7a666a`): Opposition Agent, Aven Mindcensor, Yavimaya Dryad.
- **Addendum** (2026-11-04, `90a671190`): Unbreakable Formation; the scaffolder now reads it.
- **Hexproof from a quality for a while; spells can't be countered this turn** (2026-11-04, `6fcb511a5`): Veil of Summer, Mondo Gecko.
- **A player searching a library as a trigger** (2026-11-04, `1eda5bee4`): Archivist of Oghma, Wan Shi Tong, Ob Nixilis, Unshackled.
- **Counter replacements by who puts them, on permanents or players** (2026-11-04, `78d94c642`): Innkeeper's Talent, Vorinclex, Monstrous
  Raider, Lae'zel, Vlaakith's Champion.
- **Mana that adds counters to the spell it casts** (2026-11-04, `cb00544c3`): Opal Palace, Guildmages' Forum, Animal Attendant,
  Commander's Insight.
- **An anthem per counter on its source** (2026-11-04, `9616bd428`): Banner of Kinship; the machinery was already there.
- **A name an effect gives a permanent, statically or for good** (2026-11-04, `45640bafc`): Witness Protection, Honest Work, Awakening of
  Vitu-Ghazi.
- **Time counters reaching suspended cards, exiling with time counters as a spell resolves** (2026-11-04, `f1f19a5eb`): Shivan Sand-Mage,
  Jhoira's Timebug, Pardic Dragon, Curse of the Cabal, Dust of Moments, Charnel Serenade, Gandalf of the Secret Fire, Alaundo the Seer.
- **Manifest or cloak from a chosen source, piles in exile, a return face down** (2026-11-04, `aab39bd9b`): Scroll of Fate, Vannifar, Hide
  in Plain Sight, Become Anonymous, Expose the Culprit, Hostile Negotiations, Abstract Performance, Shorecrasher Elemental, Deathmist
  Raptor, Yarus.
- **Boast twice** (2026-11-04, `c74a5af69`): Birgi // Harnfel. Rule numbers for boast corrected to 702.142.
- **Different names as an intervening if** (2026-11-04, `727e7a2ad`): Field of the Dead, Liliana's Contract.
- **Every graveyard onto the battlefield** (2026-11-04, `3a5a8e748`): Rise of the Dark Realms, Roar of Reclamation, Myr Servitor.
- **Mana in any combination, the player's split however it's made** (2026-11-04, `942ac6630`): Selvala, Heart of the Wilds, Cascading
  Cataracts, Market Festival.
- **The next spell of any kind can't be countered, from a land** (2026-11-04, `ab9553d7d`): Mistrise Village.
- **Mana that gives what it's spent on something** (2026-11-04, `f9f4a5f7e`): Arena of Glory, Jade Orb of Dragonkind.
- **Cards drawn this turn, and a question per card that names it** (2026-11-04, `dd02d97dd`): Sylvan Library.
- **Beginning the game on the battlefield with a counter and an exile from hand, if you're not the starting player** (2026-11-04,
  `1e29a9504`, `b2a548ce6`): Gemstone Caverns.
- **A modifier granting activated abilities: until a card is cast from exile, all those of a target** (2026-11-04, `e23004bd5`): Glamorous
  Outlaw, Masked Bandits, Shattered Seraph, Quicksilver Elemental, Jiang Yanggu, Leyline Immersion.
- **Escape as a grant, escape's riders, a free cast from a graveyard** (2026-11-04, `d9a16c8ff`): Desdemona, The Grim Captain's Locker,
  Confession Dial, Tizerus Charger, Skyway Robber, Sins of the Past, Case of the Uneaten Feast, Jace's Mindseeker.
- **A cast as something resolves on its own terms: cost terms, zones, "if able"** (2026-11-04, `340e6c33e`, `7ad140ae1`): Blue Mage's Cane,
  Bismuth Mindrender, Anrakyr the Traveller, Ogre Battlecaster, Tinybones the Pickpocket, Quistis Trepe, Sorcerous Squall, Zethi, Omen
  Machine, Spelltwine.
- **For each object, pay or else, asked per object** (2026-11-04, `d2715957f`, `ebc788950`): Killing Wave, Fade Away, Cut the Tethers,
  Sirocco, Sword-Point Diplomacy, Moonlight Bargain.
- **Discard-chosen with an exact count and one card per filter** (2026-11-04, `183dfbcd1`): Mind Warp, Abandon Hope, Gruesome Discovery,
  Last Rites, Distended Mindbender.
- **Return X permanents as an additional cost** (2026-11-04, `53b4ed4df`): Infernal Harvest.
- **Combat triggers: defender clauses, attacker sets, blocker counts, a batched become-blocked; a delayed ability's player fixed as it's
  set up** (2026-11-04, `25ed5c499`, `7f6ea994e`): Genestealer Locus, Gahiji, M'Baku, The Spear of Bashenga, Yuriko, Jiang Yanggu,
  Fearless Swashbuckler, Everett K. Ross, Firemane Commando, Aurelia, Seifer, Serra Inquisitors, Hezrou // Demonic Stench.
- **Turn tallies: attackers as declared, turned face up, regenerated, surveilled, library searched, cards exiled** (2026-11-04,
  `920406aed`): Deepway Navigator, Avengers Assemble!, Thaumaton Torpedo, Minas Tirith, Neyali, Hobgoblin Bandit Lord, Oblivious
  Bookworm, Kaust, Suspicious Detonation, Darkblade Agent, Archive Trap, Ennis, Ellyn Harbreeze, Spiny Starfish.
- **Facts fixed as a spell is cast (`asCast`, rule 601.2i)** (2026-11-04, `c7ca2a2e4`): Steer Clear, Faerie Fencing, Flame Discharge,
  Lethal Exploit, Siren's Call, Gnarlid Colony, Voidpouncer.
- **Exile with its own way back: any number until this leaves, one group per opponent, one back each upkeep** (2026-11-04, `3f22cf961`):
  Dimensional Breach, Glorious Protector, Bronzebeak Foragers.
- **Graveyard destinations and a discard put back: a creature's death to the top of its library, `notCycled`, a `would-discard`
  replacement** (2026-11-04, `da8519bd1`): Gravebane Zombie, Library of Leng, Nephalia Academy, Abandoned Sarcophagus.
- **A countered spell's destination and a counter replaced: library top or bottom, exile with time counters, `ifCountered`** (2026-11-04,
  `89b9e6f1e`, `e62f34e89`): Memory Lapse, Spell Crumple, Hinder, Delay, Guile; Transcendent Dragon's cast now reads it.
- **Become-copy for a duration read as a condition, of what's sacrificed or chosen on resolution; a becomes-attached trigger**
  (2026-11-04, `9401b2f06`): Zygon Infiltrator, Secret Invasion, Blade of Shared Souls, Taskmaster, The Animus, Cytoshape, Polymorphous
  Rush, The Ever-Changing 'Dane.
- **A goad whose end is a condition, goads ended, a goad as a copy exception** (2026-11-04, `b47e93db5`): The War Games, Hot Pursuit,
  Vislor Turlough, Immortal Obligation, Kros, Serene Sleuth, Mocking Doppelganger, Bloodthirsty Blade, Airtight Alibi.
- **Restrictions for a duration: until your next turn on a set fixed as it resolves, this combat, its controller's next turn**
  (2026-11-04, `de935da7d`): Linvala, Edifice of Authority, Dovin Baan, Taunt from the Rampart, Wall of Dust, Ma Chao, Yuan Shao's
  Infantry, Flummoxed Cyclops, Battering Ram.
- **One untargeted permanent or card per player, a `vote` naming whose** (2026-11-04, `4e0110eeb`): Fell Beast's Shriek, Ultimate
  Magic: Meteor, Krenko's Buzzcrusher, Winnowing, Ghouls' Night Out.
- **Untargeted picks from graveyards and exile, one spell from each opponent's graveyard** (2026-11-04, `bdb2d30d2`): Cemetery
  Gatekeeper, Cemetery Desecrator, Dreams of Steel and Oil, Breach the Multiverse, Flotsam // Jetsam, The Deck of Many Things, Binding
  Negotiation, Sengir Nosferatu, Split the Party, Vona's Hunger.
- **Removing from combat with a forced recombat, unblocking and reblocking by effect** (2026-11-04, `e284a643f`): Illusionist's Gambit,
  False Orders.
- **Damage dealt this turn read by what dealt it and what took it** (2026-11-04, `62c5c130a`): both Zuberas, Blazing Effigy, Reverse
  Polarity, Backdraft.
- **One instruction's zone moves as one event, and what a permanent does as it enters on any entry** (2026-11-04, `5de0deaa6`): Exhume,
  Crypt Champion, Tempting Wurm, Sword of Hearth and Home, Call Damage Control, Rescuer Sphinx, Living Lore, Sutured Ghoul, Dermotaxi,
  Mimeoplasm, Frankenstein's Monster.
- **Reads of cards still exiled with a source: card types, same name** (2026-11-04, `5f3a888c5`): Keen-Eyed Curator, Veteran Survivor,
  Smirking Spelljacker, Ugin's Labyrinth, Circle of Confinement, Circu, Mindreaver.
- **Exiled face down from a hand, foretold with a given cost, one-time looks at face-down creatures** (2026-11-04, `1d7d64e5f`):
  Gustha's Scepter, Bane Alley Broker, Summoner's Egg, The Foretold Soldier, Ethereal Valkyrie, Smoke Teller, Revealing Wind, Spy Network.
- **Emblems granting activated and triggered abilities and to spells** (2026-11-04, `4306beb9d`): Koth of the Hammer, Mu Yanling, Ral.
- **Spells countered all at once with a filter, spells returning to hand, and a choice between that and an exile (rule 616.1)**
  (2026-11-04, `655f2268a`, `6d14676ba`): Swift Silence, Glen Elendra's Answer, Counterflux, Reverse the Polarity, Hanabi Blast, View from
  Above, Molten Birth, Soulfire Grand Master.
- **One target slot over several kinds of object, and exiled targets** (2026-11-04, `f7234cd2f`): Unsubstantiate, Voidslime, Siren
  Stormtamer, Tale's End, Not of This World, Sorceress's Schemes, Riftsweeper, Time Reaper, Espers to Magicite.
- **Lands with an Adventure, played from exile with a land drop** (2026-11-04, `374c0283d`): Midgar // Reactor Raid, Lindblum // Mage Siege.
- **Paradigm (rule 702.192a)** (2026-11-04, `c6bbb7d54`): Decorum Dissertation, Germination Practicum, Restoration Seminar.
- **Friend or foe, a question per player read by two scopes** (2026-11-04, `2e70555bd`): Pir's Whim, Virtus's Maneuver, Khorvath's Fury.
- **Pawprint modes (rule 700.2i)** (2026-11-04, `4777c5117`): Season of the Burrow, Season of Loss.
- **Activating an exhaust or a power-up ability as a trigger** (2026-11-03, `26da7aaec`): Rangers' Refueler, Adrenaline Jockey, Marvel Boy.
- **Counters-put firing per counter, and once for a batch, with `sequence.together` for one instruction** (2026-11-03, `1b58e989c`,
  `c6b7f4020`): Fathom Mage, Flourishing Defenses, Bloodcrazed Hoplite, Invisible Woman, Bioessence Hydra.
- **Damage triggers that read the amount, and excess damage** (2026-11-03, `2841036cb`): Fall of Cair Andros, Magmatic Galleon, Aegar,
  Deus of Calamity, Pain Magnification, Innocent Bystander, Spinneret and Spiderling.
- **Limits on drawing, and the next draw replaced** (2026-11-03, `6e823f83f`): Narset, Spirit of the Labyrinth, Maralen, Mornsong Aria,
  Words of Worship, Wilding, War, Waste.
- **Graveyard replacements for the turn, an exile with something besides it, who creates a token** (2026-11-03, `1784aeef1`): Malicious
  Eclipse, Malicious Malfunction, Gaea's Will, Magus of the Will, Cosmic Intervention, Wildwood Escort, Kumano's Blessing, Head of the
  Hunt, Kalitas, Crafty Cutpurse, Mirkwood Bats, Akim.
- **A card with two typecycling abilities, flashback's creature-tapping and X-discard costs** (2026-11-03, `80868355c`): Valley Rannet,
  Igneous Pouncer, Battle Screech, Group Project, Twinned Vision, Conflagrate.
- **Costs to attack paid in permanents, sacrificed or returned, and a trigger narrowed to what its own cost sacrificed** (2026-11-03,
  `e50baddf3`): Exalted Dragon, Leviathan, Reclamation, Floodtide Serpent, Ashnod the Uncaring, Toggo.
- **Protection that doesn't remove every Aura, protection from colors among your permanents** (2026-11-03, `d6134c861`): White Ward,
  Spectra Ward, Pledge of Loyalty, Cho-Manno's Blessing; Black, Blue, Green and Red Ward now honor their exception.
- **Libraries that can't be searched, paying to ignore that (rule 116.2d), a static damage life floor** (2026-11-03, `5749a740a`):
  Mindlock Orb, Stranglehold, Ashiok Dream Render, Shadow of Doubt, Leonin Arbiter, Ali from Cairo, Worship, Elderscale Wurm.
- **Choosing one result of a roll, the other as `{ roll: "other" }`** (2026-11-03, `41b967da4`): Reckless, Valiant and Wild Endeavor.
- **Odd and even, `manaValueParity` and `powerParity`, printed or chosen as it resolves or enters** (2026-11-03, `aed66eec7`): Extinction
  Event, Zimone's Hypothesis, Ashling's Prerogative, Gollum, Void Winnower, Kianne.
- **A mode picked at random as an ability goes on the stack, and the amassed Army** (2026-11-03, `48c86de9b`, `7cd56960a`): Umaro, Cult
  of Skaro, Typhoid Mary, Summon: Magus Sisters, Foray of Orcs, Grishnákh, Goblin Plate Mail, Surrounded by Orcs, Widespread Brutality.
- **Two mana of different colors, and a land's mana replaced by amount, tapper's color, color only, or for every player** (2026-11-03,
  `4d17c0456`): Firemind Vessel, Interplanar Beacon, Open the Omenpaths, Contamination, Pulse of Llanowar, Pale Moon, Hall of Gemstone,
  Harvest Mage.
- **Reselecting what an attacker attacks, through `enter-attacking`; any-player abilities clickable on another's board** (2026-11-03,
  `63eca4722`): Misleading Signpost, Windshaper Planetar, Capricopian.
- **A creature's own record of combat as filters, `afterCombat`, "a creature is attacking you"** (2026-11-03, `8276659b5`):
  Kjeldoran Home Guard, Daredevil Dragster, Clockwork Beast, Halls of Mist, Tangle Kelp, Jabari's Influence, Heroic Return, Watchdog.
- **Effect-made blocks, and a block's other creature** (2026-11-03, `2304078ce`): Fog Patch, Choking Vines, Trap Runner, High-Rise
  Sawjack, Barrow-Blade, Mirror Shield.
- **Combat-damage history, last-turn attacks, distinct thresholds, prime counts, shared names** (2026-11-03, `e625fe1ee`): 16 proving
  cards, among them Lost Monarch, Wave of Rats, Avatar of Woe, Maze's End, Central Elevator // Promising Stairs.
- **Player comparisons composed from `of-player` and `player-compare`, and an entry's "that player"** (2026-11-03, `30b52f74e`): Guild
  Artisan, Agent of the Shadow Thieves, Sword Coast Sailor, Archaeomancer's Map, Unified Will, Peer Pressure, Predator's Gambit,
  Skulking Killer.
- **A choice beside a spell's targets, `keepTargets`** (2026-11-03, `c2cb533ad`): Aerith Rescue Mission, Wicked Slumber, Trial of Agony,
  Crush Underfoot.
- **Keeping some of yours by count, by total power or under what you chose** (2026-11-03, `bd156398b`): Phyrexian Dreadnought, Moorland
  Rescuer, Sculpted Sunburst, Thunderwave, Watchers of the Dead, Covetous Elegy.
- **The active player's target against their own count, and a targeted player's choice from hand** (2026-11-03, `2810bf1a2`):
  Magus of the Abyss, the five Oaths, Stunted Growth, Prying Questions.
- **Control changes with a computed recipient, and entering or returning under an opponent** (2026-11-03, `0450d30d4`): Hithlain
  Rope, Bucknard's Everfull Purse, Thoughtbound Primoc, Charisma, Turf War, Dack Fayden, Helping Hand, Xantcha, Captive Audience,
  Pendant of Prosperity, Sol'Kanar, Zuko.
- **More spend-only purposes, and restricted, optional triggered mana** (2026-11-03, `6f2a6eb9f`): foretelling, cumulative upkeep,
  a cost with {C}, `orSpell`, `mayAdd`. Kolvori, Karfell Harbinger, Cultivator Drone, Adarkar Unicorn, Snowfall, Throne of Makindi.
- **Triggered mana abilities that do more** (2026-11-03, `176a42fa1`): riders off the stack (rule 605.4a), a condition, a chosen
  color. Overabundance, Barbflare Gremlin, Winter's Night, Regal Behemoth, Gauntlet of Power, Desolation, Crime Novelist, Hall of
  the Bandit Lord.
- **Chroma, what a permanent devoured, a commander's mana value on the battlefield or in the command zone, the greatest shared
  creature type** (2026-11-03, `a19799c64`): 18 proving cards, among them Fiery Bombardment, Light from Within, Umbra Stalker,
  Skullmulcher, Voracious Dragon, Cloudkill, Stinging Study, Basalt Ravager, Shared Animosity.
- **The greatest of an amount among players, and a revealed hand counted through a filter** (2026-11-03, `8d2cf44d4`): Inquisition,
  Baleful Stare, Withering Gaze, Darigaaz, Isperia, Adamaro, Investigator's Journal, Thought Sponge, Tales of the Ancestors,
  Scholarship Sponsor, Sokenzan Renegade.
- **One of each of several categories** (2026-11-03, `5512cfcd7`): `choose-one-of-each` on `choose-permanents` and
  `choose-from-zone`, a card standing for several. Cataclysm, Global Ruin, Planar Overlay, Sundering Titan, Noxious Vapors.
- **Suspend X, and a suspend cost paid to cast** (2026-11-03, `f02d6c0cf`): Benalish Commander, Aeon Chronicler, Detritivore,
  The Face of Boe.
- **Mana restrictions read at the cast** (2026-11-03, `efc86c38a`): `castFrom`, `notCastFrom`, `spendOnlyManaFrom`. Interdimensional
  Web Watch, Altar of the Lost, Mm'menon, Heartwood Crafter, Elfhame Druid, Volshe Tideturner, Jasmine, Myr Superion, Imperiosaur,
  Eclipsed Realms.
- **A permanent with the abilities of exiled cards** (2026-11-03, `931b1d611`): `grantsActivatedOf`'s `exile`, `exiled-with` and
  `chosen-exiled`. Rex, Mairsil, Hazel's Brewmaster, Agatha's Soul Cauldron, Idris, Koh.
- **One target slot over players and permanents** (2026-11-03, `eb56fa171`): `orPlayer` with each part's own filter. Wrathful Red
  Dragon, Wrathful Raptors, Lozhan, Coalborn Entity, Cautery Sliver, Captain's Maneuver.
- **Tokens created with this** (2026-11-03, `9342f74fc`): `linkedToSource`, `createdWithSource`, `countersOnMaker`. Saproling
  Burst, Gutter Grime, Faerie Artisans, Arcane Artisan, Mysterio.
- **Protection outside your commander's color identity** (2026-11-03, `603daad3e`): Commander's Plate, Mother of Runes, Eldritch
  Immunity.
- **A hand looked at as a permanent enters, and the top N of a target's library** (2026-11-03, `0477dbe90`): `chooseOnEnterLook`.
  Arachne, Orcish Spy, Dimir Charm.
- **Batched, first-time and not-attacking tapping** (2026-11-03, `76a947c8c`): `becomes-tapped`'s fields. Deeproot Pilgrimage, Tale
  of Katara and Toph, Verity Circle.
- **Combat requirements by filter, exactly one and at most one** (2026-11-03, `617801bf5`, fixed by `c89b61301`): Nacatl War-Pride,
  Slayer's Cleaver, Talruum Piper, Marble Priest, Magnetic Web, Viashino Bey, Ekundu Cyclops, Predatory Rampage, Boldwyr
  Intimidator.
- **Aura-host statics** (2026-11-03, `7d42e0dfc`): `controlledBy: "monarch"`, `blocksDespiteLandwalk`. Fall from Favor, Street
  Savvy, Power Artifact, Demonic Torment, Desert's Hold, Detainment Spell.
- **The greatest of a zone** (2026-11-03, `b63fdee8e`): the `greatestInZone` filter clause, and `outsideFold` so a trigger's or a
  resolving effect's condition sees its source's own statics. Topple, Favor of the Mighty, Getaway Glamer, Historian's Wisdom,
  Might Makes Right, Strength-Testing Hammer, Desecrator Hag.
- **Landwalk of any kind** (2026-11-03, `7b9ea10b7`): rule 702.14, a static's land filter or a chosen land type, with Staff of
  the Ages, Hammerheim and the bots' block check reading it. Dryad Sophisticate, Trailblazer's Boots, Vectis Gloves, Traveler's
  Cloak, Illusionary Presence.
- **Hexproof from abilities, and "can't be the target" that isn't hexproof** (2026-11-03, `88f6dd490`): `hexproofFrom`'s
  `notHexproof`, kept through a loss of hexproof; the prose forms marked. Volatile Stormdrake, Shanna, Sisay's Legacy.
- **A player becoming a target, and the first time by anyone** (2026-11-03, `711f1e44c`): `player-targeted`, and
  `becomes-target`'s `player`, `playerOnly`, `abilityOnly`, `firstTimeEachTurnByAnyone`. Amulet of Safekeeping, Unsettled
  Mariner, Dormant Gomazoa, Loki, God of Mischief, Angelic Cub.
- **A land tapped for mana producing another type** (2026-11-03, `71edd1918`): `landManaInstead`, a static (by land kind,
  anyone's taps) or a turn-long player effect. Deep Water, Reality Twist, Infernal Darkness.
- **What a manifest or a create step put onto the battlefield** (2026-11-03, `3b79b62a8`): `manifest-dread`'s `count` an
  amount, counters on the manifested cards through `thisWay: "put-onto-battlefield"`, `put-counters-of` onto `"created"`.
  Valgavoth's Onslaught, Wildcall, Formless Nurturing, Ambitious Augmenter, Moldering Gym // Weight Room.
- **A card in exile as a target** (2026-11-03, `0ad1f5631`): `card-in-exile` (`whose`, `faceUp`, `linked`), the filter
  `hasFlashback`, `allow-cast-linked-exile`'s `spendAs`. Pull from Eternity, Gelatinous Cube, Runic Repetition, Clone
  Shell, Cemetery Protector, King Narfi's Betrayal.
- **Unspent mana: another type, kept by every player, life lost** (2026-11-03, `679a2a9e9`): `unspentManaBecomes`,
  `keepsUnspentManaEachPlayer`, `manaLossCausesLifeLoss` in the rule 500.4 emptying. Horizon Stone, Upwelling, Yurlok of
  Scorch Thrash.
- **A draw replaced by an effect, and draw-N exemptions** (2026-11-03, `6a50b3af9`): `would-draw`'s `instead: { effect }`
  (rule 614.11) and `exceptFirstInDrawStep` / `firstEachTurn` on its replacements. Underrealm Lich, Tomorrow, Azami's
  Familiar, Sages of the Anima, Teferi's Ageless Insight, Reed Richards, Smartest Man, Bard, King of Dale.
- **Mana abilities from a hand or a graveyard** (2026-11-03, `ac127ad2b`, `fe36dd7f0`): `isManaAbility` no longer asks the zone,
  and a mana ability's cost may exile from a graveyard or collect evidence; any-colour ones from another zone are offered per
  colour. Both Spirit Guides, Molt Tender, Rubble Rouser, Cryptex, Jack-o'-Lantern, Titans' Nest.
- **An Aura tapping its host as a cost** (2026-11-03, `6f047d8c7`): `tapOthers` of `{ hostOfSource: true }`, and a spell's text
  naming the creature tapped for its cost (`"tapped"`). Earthlore, Krovikan Plague, Nature's Chosen, Swallow Whole.
- **"Up to" in a searched public zone** (2026-11-03, `664e5fe63`): `search-library`'s `upTo`, and the hand-and/or-library key
  marked built. The Five Doctors, Gate to the Afterlife, Last Light of Durin's Day, Ancient Vendetta.
- **Tokens linked to an exiled card or their maker** (2026-11-03, `088e27f6a`): `DelayedLeaves.leaves: "created"` and
  `link-exiled-to-created`. Ugin the Ineffable, Hofri Ghostforge, Timothar, Stangg, Tatsumasa.
- **"Whenever one or more die"** (2026-11-03, `102409af3`): `dies`'s `batched`, once per simultaneous event. Vengeful Townsfolk,
  Seer of Stolen Sight, Rinoa Heartilly, Angel Wing.
- **A may another player answers** (2026-11-03, `6d8f94e0b`): any opponent's first yes or one named player's, with `mayBeDone`
  (rule 608.2d). Sin Prodder, Distant Memories, Arcum Dagsson, Farrel's Mantle.
- **Attacking one of your opponents, and not attacking you** (2026-11-03, `d1cb9309c`): `attack-with`'s `notAttackingYou`
  (an intervening if); the scaffolder reads "attacks one of your opponents". Skyboon Evangelist, Soulblade Corrupter,
  Mirkwood Trapper.
- **Attacked a battle this turn** (2026-11-03, `0c76c397f`): `GameObject.attackedBattleThisTurn` and its filter clause.
  War Historian.
- **Permanents controlled since the turn began** (2026-11-03, `a597195ef`): `CardFilter.controlledContinuously`, rule 302.6's
  test of any permanent, as a source condition, target or sacrifice. Rocket Launcher, Nettling Imp, Norritt, Keldon Twilight.
- **A count of different mana costs** (2026-11-03, `257ed2665`): the `distinct` aggregate's `of: "mana-cost"`, and the mana
  value threshold scaffolded on flash, triggers and unless. Embodiment of Agonies, Graveyard Shift, Sanguine Spy, Tainted
  Indulgence.
- **Mass type changes that leave P/T alone** (2026-11-03, `0151735b6`): `add-types` under `for-each-permanent`, and a second
  type choice nested in the first (`choose-creature-type.sentinel`). Start Your Engines, The Thanos-Copter, Volatile Claws,
  Energybending, Terraformer, Vision Charm.
- **A static making a planeswalker a creature** (2026-11-03, `01ace43e5`): keeping its types only when it says "still" (rule
  205.1a/b); also `attackingNothing` (506.4c) and equip planeswalker (702.6e). Gideon Blackblade, Grand Master of Flowers,
  Kaito, Spark Rupture, Luxior.
- **Secret choices** (2026-11-03, `5b1a2ff17`): `GameObject.secretChoice`, made as a permanent enters or on resolution and
  hidden per seat until a `revealChosen` cost; also player protection from a player and a plain `onlyOnce`. Stalking Leonin,
  Guardian Archon, Emissary of Grudges, A Killer Among Us, Goblin Game.
- **Offering** (2026-11-03, `aed151729`, `8b609d1d1`): rule 702.48 as `kicker.offering`, one offer per permanent; a cast that
  sacrifices a permanent always has a labelled button. Patron of the Akki, Patron of the Kitsune, Blast-Furnace Hellkite.
- **A spell's cost raised by coloured pips** (2026-11-03, `3aaf4bd6c`): `costModification.increaseColored`, the shown cost
  too. Derelor, Sapphire Leech, Andradite Leech.
- **Counting the creatures blocking a named object** (2026-11-03, `c531a96cc`): `{ blockersOf }` for the source or trigger
  object, and `CardFilter.blockerCount`. Spined Sliver, General Marhault Elsdragon, She-Hulk, Guardian of the Gateless,
  Rampaging Cyclops, Grizzled Wolverine.
- **The creatures blocking a trigger's object** (2026-11-03, `726989193`): `blockingRelation`'s `of: "trigger-object"`.
  Trailblazer's Torch, Ib Halfheart, Labyrinth Raptor, Plague Wight.
- **Skipping a combat phase** (2026-11-02, `6bff2b9d2`): `skip-step`'s `step: "combat"`, `thisTurn` and `allOfNextTurn`;
  Stonehorn Dignitary, Blinding Angel, Revenant Patriarch, Moment of Silence, False Peace, Empty City Ruse.
- **A target chosen at random** (2026-11-02, `26319a038`): `targetsAtRandom`, real targets picked by the seeded RNG; Witch
  Hunt, Knight Rampager, Scab-Clan Giant, Goblin Test Pilot, Power Pack; Capricious Efreet needed no code.
- **Looking at another player's top card** (2026-11-02, `abdb13efa`): `put-into-graveyard` takes a library card, and the look's
  own prompt; Rootwater Mystic, Lurking Informant, Coral Fighters, Precognition, Wand of Denial.
- **Remove all of a kind of counter as a cost** (2026-11-02, `3db7e4ab9`): needed no code; Molten Hydra, Essence Bottle,
  Geometric Nexus.
- **A cost paid a chosen number of times** (2026-11-02, `3b4a4c919`): `may.costTimes`, one question and one payment, no new
  decision kind; Intrepid Adversary, Primal Adversary, Tranquil Frillback.
- **An ability's life cost read as it's paid** (2026-11-02, `aada9c187`): `AbilityLifeCost` half rounded up, X and per-count;
  Lurking Evil, Murderous Betrayal, Krumar Initiate, Tornado.
- **A spell's additional cost in a keyword cost's shape** (2026-11-02, `10f0ee639`): `additionalCost.also` as a
  `KickerAlsoCost`, `tapAnyNumber`, `discardFilter`; closes the seam the recheck named; 8 proving cards, among them Warlord's
  Elite, Shared Discovery, Burn at the Stake and Disruption Protocol.
- **A delayed trigger that watches named permanents** (2026-11-02, `f269dce4c`): `DelayedWhenever`'s `watching`,
  `until: "game"`, `once`, `orLosesControl`, with `dealsCombatDamage` deleted; Paladin of Prahv, Arcbond, Tamiyo Field
  Researcher, Coffin Queen, Plague Reaver.
- **"Those creatures"** (2026-11-02, `b944f5908`): one `CardFilter.triggerBatch` over the batch a trigger fired on, and a
  delayed trigger lasting this combat; Sabotage Strategist, Lightmine Field, Love on the Battlefield, Creepy Puppeteer, Garruk,
  Curse Breaker.
- **Attack counts** (2026-11-02, `05e346369`): `attack-with`'s `exactly` and `totalPower`, `attacks-player`'s `atLeast`;
  Alluring Suitor, Desert Were-Worm, Horn of the Mark, Landroval, Grand Warlord Radha, The Earth King.
- **A copy for each permanent a spell could target, by whoever makes it** (2026-11-02, `80ef4666f`): `forEachItCouldTarget`
  with `controller`, `chooseAndPayEach`; gravestorm as a helper and a template; Mirrorwing Dragon, Precursor Golem, Ink-Treader
  Nephilim, Feather, Ominous Harvest, Follow the Bodies, Bitter Ordeal.
- **One unless clause, whoever answers and whatever they do** (2026-11-02, `700d705c2`): `unless.chooser` takes any
  `EffectPlayerRef` or `{anyOf}`, with `doing` and `payManaCostOf`; 10 keys, 13 proving cards, among them Grip of Amnesia,
  Perplex, Tainted Specter, Ice Cave and Tariff.
- **A spell gaining an ability carried onto its permanent** (2026-11-02, `43d273048`): `castRider`s, `rebound` as a
  keyword, gained bloodthirst, riot from statics and mana per instance (rule 702.136b); Taigam, Cast Through Time, Bloodlord
  of Vaasgoth, Rhythm of the Wild, Uncivil Unrest, Domri Chaos Bringer, Rivaz of the Claw, Thief of Existence.
- **An alternative cost's non-mana parts** (2026-11-02, `220c48f6d`): `alternativeCost.also` as a `KickerAlsoCost`,
  `self-alternative-cost-paid`, a keywordless optional additional cost; 8 proving cards, among them Stalwart Valkyrie,
  Blasphemous Edict, Asmoranomardicadaistinaculdacar, Ingenious Mastery and Undergrowth.
- **An animate that grants a whole ability** (2026-11-02, `9bd4a9cd3`): mostly composition; granted statics now bind in
  `ownStatics`, and `add-types`' `removeSubtypes`; Raging Ravine, Restless Spire, Veiled Serpent, Veiled Apparition, Opal
  Guardian, Monument to Perfection, Dancing Sword.
- **A combat restriction's condition read as another player** (2026-11-02, `dafea0768`): one `PlayerTest.holds` replacing
  the `monarch` and `poisoned` clauses; two of the three keys needed no code; Vantress Gargoyle, Monstrous Hound, Branded
  Brawlers, Lurking Green Dragon, Crown-Hunter Hireling.
- **Countering abilities** (2026-11-02, `10039292c`): `counter.thenSource`, the `for-each-on-stack` combinator, narrowed
  stack slots, and Skip on an optional slot over the stack; Disallow needed no code; Green Slime, Ouphe Vandals, Nimble
  Obstructionist, Tishana's Tidebinder, Teferi's Response, Kadena's Silencer, Summary Dismissal.
- **Any number with different names or powers** (2026-11-02, `f01c0cb9f`): `together` on `choose-permanents`,
  `distinctPowers`, a search's chosen shuffled in; Eerie Ultimatum, Battle for Bretagard, Sigarda's Vanguard, Rip Spawn
  Hunter, Threats Undetected.
- **An animate that sets creature characteristics** (2026-11-02, `108e72eee`): live P/T beside a `grant-static`,
  `add-types`' `removeTypes`, `StaticAbility.selfOutsideBattlefield`; 11 proving cards, among them Myth Realized,
  Chimeric Mass, Svogthos, Druid Class and Oko.
- **Durations to a point in a later turn** (2026-11-02, `53f8117aa`): `UntilPointDuration`, four new `PtDuration` values
  with one expiry, and two more `ImpulseDuration`s; 9 proving cards, among them Xenic Poltergeist, Elkin Bottle and Nivix.
- **A turn skipped as it would begin** (2026-11-02, `2345527e5`): the `would-begin-turn` replacement, asked through the
  upcoming turns; Chronatog and Magosi needed no code; Time Vault, Gerrard's Hourglass Pendant.
- **Token copies make their "as this enters" choices** (2026-11-02, `5ae491a7e`, rule 614.12a): each token for itself,
  entering together; Rebuild the City, Kindred Charge, Ember Island Production. Closes the engine-gaps line.
- **Return from every graveyard at once** (2026-11-02, `765a87d29`): almost no new code; Open the Vaults, Planar Birth,
  Pyrrhic Revival, Bringer of the Last Gift, Infernal Caretaker, Saprazzan Bailiff.
- **Whole hands exiled face down and returned later** (2026-11-02, `aa372e7d7`), and the end step of a player's next turn;
  Memory Jar, Magus of the Jar, Ignorant Bliss, Suppress, Induced Amnesia, Bottled Cloister, Moonring Mirror, Kav Landseeker.
- **A static that adds a supertype** (2026-11-02, `85ebc8c39`): `addSupertypes` in layer 4, `effectiveSupertypes` as
  the read everywhere, the 613.8a dependency on "nonbasic"; `static:static-add-chosen-type` needed no code; On Serra's
  Wings, In Bolas's Clutches, Leyline of Singularity, Glittering Frost, Rimefeather Owl, Rootpath Purifier, Lifecraft Engine.
- **Can't have or gain a keyword** (2026-11-02, `f059ac8f0`): over every timestamp, and a loss of hexproof takes
  "hexproof from" (rule 702.11e); Archetype of Imagination, Archetype of Endurance, Arcane Lighthouse, Colossus Hammer.
- **A keyword's cost that isn't mana** (2026-11-02, `8cd3310b2`): `KickerAlsoCost` on splice and squad, with
  exiling from a graveyard and an opponent gaining life; Horobi's Whisper, Hundred-Talon Strike, Roar of Jukai,
  Torrent of Stone, Veil of Secrecy, Ruthless Radrat, Thrill-Kill Disciple.
- **An unattach as a cost** (2026-11-02, `8da768d55`): `AbilityCost.unattach`, this Equipment or a chosen one;
  Leonin Bola, Razor Boomerang, Sunforger, Captain America, First Avenger.
- **Exile face down, linked to the source** (2026-11-02, `fc6246430`): `exile-from-library.faceDown`,
  `exiledFaceDown.lookersOnly`, `turn-exiled-face-up`; Bomat Courier, Knowledge Vault, Pyxis of Pandemonium,
  Wall of Mourning, Kayla's Music Box, The Creation of Avacyn.
- **Permissions over exiled cards** (2026-11-02, `4d6891f58`): one `ExilePermission` (its owner's, taxed, free,
  lands entering tapped), static and timed over linked cards; 14 proving cards, among them Nightveil Specter,
  Elite Spellbinder and Court of Locthwain.
- **What an earlier step did** (2026-11-02, `de55e22f0`): `gained-control`, `control-effect`, `keptOnTopThisWay`,
  a revealed card's mana value; 3 of the 5 keys needed no code; 12 proving cards.
- **Damage prevented this way** (2026-11-02, `151429fe6`): `damagePreventedThisWay`, read in a delayed ability
  too, and a chosen source's `then` reading the spell's own targets; Sacred Boon, Scars of the Veteran, Bone Mask,
  Brace for Impact, Refraction Trap, Chant of Vitu-Ghazi.
- **An effect done to each matching permanent** (`for-each-permanent`, 2026-11-02): one combinator instead
  of a new `-all` twin per effect; 19 keys and 10 proving cards (`neededCards-features.md`). The pilot behind
  it also marked 5 keys the vocabulary already covered, with 7 cards (`test/need-key-recheck.test.ts`).
- **An effect done by another player** (`as-player`, 2026-11-02): one wrapper instead of a `who` per effect, with
  `"source-owner"`; 6 keys, Excise the Imperfect, Wheel and Deal, Gandalf, Wandering Wizard.
- **A filter clause for double-faced cards** (`condition:filter-double-faced`, 2026-11-02):
  `CardFilter`'s `doubleFaced`, all three kinds of rule 712.1, with `meldCard` on a meld pair's
  fronts — Overgrown Pest, Nick Fury, Agent of S.H.I.E.L.D. (whose key,
  `effect:look-and-choose-may-enter-transformed`, misread the card: it's put, then turned over).
- **Six families, third overnight round** (2026-11-02): changes of control as trigger events, on a
  permanent and delayed (`trigger:lose-control-trigger`); references to attachments and the source's
  host (`condition:filter-attachments`); searches of hand and graveyard with and/or zones, Doomsday's
  exile-the-rest (`effect:search-hand-graveyard-library`); target namesakes off the battlefield,
  tokens-only namesakes, exile from a revealed hand (`condition:filter-card-property-clauses`); a cost
  exiling a count of graveyard cards, X, optional or per opponent (`cost:choose-cards-as-cost`); morph
  and disguise costs that reveal, take X or change with a count (`mechanic:face-down`).
  `git log --grep "Engine.*Cards" --since 2026-11-02`.
- **Six more families, same round** (2026-11-02): a loop over each kind of counter
  (`effect:double-counters-each-kind`); free casts under a count or a mana-value total
  (`decision:free-cast-choices`); casting from another hand, its own exile, a linked exile, the
  library while searching (`effect:cast-from-linked-exile-free-this-turn`); damage dealt by the host,
  a token just made, a card just exiled or put (`effect:damage-from-attached`); restricted mana by
  purpose, one type spent as a colour (`cost:mana-spending-rules`); damage replacements from another
  source, by a live amount, for the turn (`replacement:damage-modification`).
- **"Those tokens plus that many" and the missing tokens' commanders**
  (`replacement:token-creation-additive`, `effect:missing-tokens`): `would-create-token`'s
  `plusTokens` — Chatterfang, Squirrel General (#32) — and Shilgengar, Sire of Famine (#273), whose
  Blood tokens, "sacrifice six" and finality-counter return were all built (2026-10-16).
- **Cast during resolution: by discarding a card, and each player's exile** (`effect:cast-during-resolution`):
  `cast-now`'s `byDiscarding` — "you may cast that card by discarding a card rather than paying its
  mana cost", an alternative cost paid with the ordinary discard decision — and each player
  exiling until a nonland card (a `for-each-player` of `reveal-until`) before casting any number of
  them free. The Infamous Cruelclaw (#305) and Etali, Primal Conqueror (#114) (2026-10-16).
- **Sacrifice any number as a cost that lowers it** (`cost:sacrifice-multiple`): "you may
  sacrifice any number of … This spell costs {2} less to cast for each" — the count announced as
  the spell is cast (`additionalCost.sacrificeReduces`, rule 601.2b), the offer's range the fewest
  to the most that pay, the client asking "how many to sacrifice" and the bots taking the fewest;
  and a cost reduction per entry in a this-turn list (`{ turnHistory, times }`). Dargo, the
  Shipwrecker (#405) and Extus, Oriq Overlord // Awaken the Blood Avatar (#374) (2026-10-16).
- **Attach extensions, part one** (`effect:attach-extensions`): attaching any number of chosen
  Auras and Equipment (`attach`'s `choose`, `upTo`) to a target permanent or player (the
  `permanent-or-player` slot; a Curse moves between players), and cards put onto the battlefield
  attached to something — `put-onto-battlefield`'s and `return-from-graveyard`'s `attachedTo`,
  `search-library`'s `attachedToSource` (an Aura that can't go there stays put, rule 303.4i; an
  Equipment enters unattached, 301.5e). The bots leave an Aura at work on an opponent's side where
  it is. Ardenn, Intrepid Archaeologist (#190) and Light-Paws, Emperor's Voice (#197), with
  Beatrix, Loyal General, Danitha, Benalia's Hope, Magnetic Snuffler, Smoke Shroud, Eagle's Rescue,
  Unfinished Business, Battlefield Improvisation and Vow to Erebor (2026-10-16).
- **Choice extensions, part one** (`decision:choose-from-zone-extensions`): a search's finds that
  "each have different names" (`together: { distinctNames: true }` — the zone choice's `distinct`
  rule), "with four or more card types among them" (its `variety` rule, not yet on a card), and a
  `return-from-graveyard` over the hand and graveyard together (`from: "hand-or-graveyard"`):
  Tiamat (#160) and Kastral, the Windcrested (#248) (2026-10-16).
- **Eight top-500 commanders whose blockers had been built since triage**: Sauron, the Dark Lord
  (#9), Hakbal of the Surging Soul (#40), The Necrobloom (#48), Auntie Ool, Cursewretch (#88),
  Norman Osborn (#96), Ezio Auditore da Firenze (#102), Sméagol, Helpful Guide (#369) and Peter
  Parker, with what the last few still lacked: `grantsToSpells` freerunning and web-slinging,
  `grantsToGraveyard` mayhem and dredge, a cost reduction for spells cast from a zone, "lands with
  different names", "if that player has 10 or less life", reveal-until "under your control", and
  "each Merfolk you control explores" (rule 701.44d, one at a time in the order chosen); a craft
  return now waits for an "as this enters" choice (2026-10-16).
- **Explore, Map tokens, discover and craft** (`keyword:explore` rule 701.44, `effect:map-token`
  111.10s, `keyword:discover` 701.57, `keyword:craft` 702.167): explore as an effect (once, twice
  or X times, the explorer read as it last was if it left) with "whenever a creature you control
  explores" and "explores a land / nonland card"; the Map token; discover beside cascade, with
  "whenever you discover" (five pool cards that had discover hand-built now use it); craft as
  an activated ability whose materials are chosen from the battlefield and the graveyard together
  and stay linked to the crafted permanent. The commanders Pantlaza, Sun-Favored and Francisco,
  Fowl Marauder among 70 cards (2026-10-16).
- **Rad counters, squad, collect evidence and Cases** (`mechanic:rad-counters` rule 728,
  `keyword:squad` 702.157, `keyword:collect-evidence` 701.59, `mechanic:case` 719.3): rad as a
  player counter with its inherent precombat-main trigger and the ☢ panel count, `remove-player-
  counters`; squad as a multikicker with `squadTrigger()`; collect evidence as an effect, an
  activated cost and a spell's additional cost, with "whenever you collect evidence"; Cases' "To
  solve" (`caseToSolve`) and the solved designation with its chip (2026-10-16).
- **Plot and committing a crime** (`keyword:plot`, rule 702.170; `trigger:commit-crime`, rule
  700.13): the plot special action, a plotted card's free sorcery-speed cast from exile on a later
  turn, "when this card becomes plotted", effects that plot a card (`become-plotted`,
  `exile-spell-as-it-resolves`' `plotted`), plotted cards drawn on their owner's board with a
  Plotted badge (the user's ask); crimes as a spell is cast, an ability activated or a trigger put
  on the stack, "whenever you / an opponent commit(s) a crime" and "if you've committed a crime
  this turn". Marchesa, Dealer of Death among 57 cards (2026-10-16).
- **Decayed** (`keyword:decayed`, rule 702.147): Wilhelt, the Rotcleaver, with Crowded Crypt,
  Ghoulish Procession, Curse of the Restless Dead and Jadar, Ghoulcaller of Nephalia
  (2026-10-14).
- **"Whenever a player activates an ability"** (`trigger:activates-ability`): Satoru Umezawa
  (and ninjutsu granted to cards in hand) and Magus Lucea Kane (copying the next {X} spell or
  ability), with Harsh Mentor, Runic Armasaur, Ajani Unrelenting, Way of the Paradox, Gideon
  the Oathless and Rings of Brighthearth, which closes the engine gap "Whenever you activate
  an ability" (2026-10-14).
- **Speed** (`mechanic:speed`, rule 702.179) with the player panel showing it and its inherent
  trigger drawn on the stack: Mendicant Core, Vnwxt, the four Raceways, Howlsquad Heavy
  (2026-10-12, a7789807).
- **Casting a spell during another's resolution, in part**: the `cast-now` effect (2026-09-30,
  50e39aae); what's left is in `effect:cast-during-resolution`'s gaps description.

## Card backlog

- **Marvel: Darkhold Destiny's previews (MDD 7, MDC 1) and Mystery Booster Commander Edition (MBC
  69) whole: 42 of 77 new cards authored** (2026-11-06, batch 269; `engine/data/sweep-3/B269.json`)
  — one card-author agent of 70 and the lead's seven the scaffolder finished. 35 blocked: nine on
  conjure (`effect:conjure`, digital-only and not in the Comprehensive Rules, so not built), eight
  rulebreaker commanders (`mechanic:rulebreaker`), the rest on narrow new keys.
- **Star Trek Commander (TRC) whole, from its previews: 158 of 172 new cards authored** (2026-11-06,
  batch 268; `engine/data/sweep-3/B268.json`) — three card-author agents of 55, 55 and 56 and the
  lead, who built assimilate alongside them (`EnterTypes.setSubtypes`, `ASSIMILATE`, a scaffolder
  template; The Borg Queen, Borg Queen, Perfection Manifest, Assimilation Assessor, Assimilate the
  Wounded, and TRK's Death Is Irrelevant) and regenerated the creature-type catalog (27 Star Trek
  types were missing, so Federation undercounted). 13 blocked; Worf, Chief Tactical Officer and
  Jean-Luc Picard, Luminary wait for the post-release snapshot.
- **Star Trek (TRK) whole, from its previews: 263 of 294 new cards authored** (2026-11-06, batches 266-267; `engine/data/sweep-3/B266.json`, `B267.json`) — batch 266 the top 120 by rank and the cards Beam me up and face a dilemma unlocked (114 authored, the two mechanics built), batch 267 the other 162 (149 authored, with a fix to Federation's creature-type count: a creature with any creature type counted as a changeling). 31 blocked, `mechanic:assimilate` the most (two cards here, most of TRC's Borg). The walk goes on with Star Trek Commander (TRC).
- **The freed-cards queue emptied in one parallel round, B262–B265: 393 of 532 authored** (2026-11-05, `6e9b85d01` froze the lists) — the 532 cards `cards:needs -- --stale` listed, frozen in its order into `engine/data/freed/F1.txt` … `F4.txt` and worked by four cloud sessions under `author-freed`, coordinated with `author-walks-parallel`'s recheck-round shape and the landing lock (on for the round, off again after): F1 → B262 (94 of 131), F2 → B263 (108 of 133), F3 → B264 (111 of 135), F4 → B265 (80 of 133); 139 still blocked on narrow keys. Started 19:51 UTC, all four on `main` by 23:30. `--stale` lists nothing afterwards.
- **Batch 264, the freed cards of frozen list F3: 111 of 135 authored** (2026-11-05, `4701cc60e` and the batch's card commits) — the cards freed by the families built 2026-11-02 and 2026-11-03 (random permanents, no maximum hand size, searches to exile, set types, secret choices, odd or even, emblems granting abilities, face-down looks), among them Ancient Silver Dragon, The Nipton Lottery, Thanos, the Mad Titan, Arlinn Kord, Teferi, Temporal Pilgrim and Urza, Lord High Artificer. `tap-all` and `return-to-hand-all` now read their filter with the effect's source, so `isSource: false` spares it; the random answer to a choice of permanents names a token stack once per token (the situation fuzzer stopped on Tidal Terror's "tap two" over a stack). 24 go back on 22 narrow keys and one open one.
- **Batch 263, the freed cards' frozen list F2: 108 of 133 authored** (2026-11-05, `9b9c7cb98`, `4ac55fcb5`, `ca99402e8`, `593e0371f`) — the P/T-per-amount, grant-outside-the-battlefield, enchanted-player, target-player, damaged-by-source, impulse, token-copy, attack-batch, additional-cost, mana-spending and animate-all families, among them Necropotence, Huntmaster of the Fells, Narset Transcendent, Sliver Gravemother, Tamiyo, Inquisitive Student and Gwen Stacy. Three engine fixes: a delayed "this turn, whenever … causes you to discard" watch with `perCard` now fires once per card with that card as its trigger object (Pure Intentions); a `nextSpell` delayed trigger reads its filter with its source, so `chosenName` matches; `choose-permanents` reads its filter with its source and X, so `hostOfSource` matches (Hand of Vecna). 25 go back on narrow keys (22 new).
- **Batch 265, list F4 of the freed cards' parallel round: 80 of 133 authored** (2026-11-05) — the cards the built need-key families freed, among them Gideon Jura, Nicol Bolas, God-Pharaoh, Leovold, Emissary of Trest, Jace, Vryn's Prodigy, Jace Reawakened, Kianne // Imbraham, Valentin // Lisette and two Rooms. A look-and-choose's filter now reads a bare `n: "x"` as the resolution's X (`filterAtX`; it read 0: Evershrike), and what triggers for a player who left the game in the same event never goes on the stack (rule 800.4a: Valentin's "when you do" as its controller lost). 53 go back on 40 new narrow keys and 9 existing ones.
- **Batch 262, frozen freed list F1: 94 of 131 authored** (2026-11-05, `46f589c1c`, `38a47234a`) — the parallel round's first list (`engine/data/freed/F1.txt`): companions, any-number-of-copies decks, opponents-may-activate, revealed-hand discards, reveal-until counts, skipped turns, blocked-this-turn filters, pack tactics and the rest. Ral, Monsoon Mage, Yorion, Gyruda, Memory Vessel, Mind Funeral, Saheeli, the Gifted. 37 still blocked on 36 new narrow keys (`B262.json`); Lurrus pulled (`zone:graveyard-cast-mana-value-on-stack`).
- **Batch 261, the next of the freed cards: 102 of 150 authored** (2026-11-05, `200483848`, `335a0daf6`, `7aa19c9f1`, `0fa7a0deb`) — the static-grant, graveyard-cast, cost-modification, emblem, look-and-choose, life-total and exile-until families, among them Korvold, Gleeful Glutton, Wrenn and Seven, Kindred Discovery, Elspeth Resplendent and Urza's Sylex. A card returned transformed and attached is now judged as its back face (rule 712.14: Vengeful Strangler returns as the Aura Strangling Grasp). 48 go back on 43 narrow keys.
- **Batch 260, the next of the freed cards: 125 of 150 authored** (2026-11-05, `f4fb7ab23`, `f13d7efee`, `c6fc81e75`, `2c3b28559`, `bd10ab3bd`) — the random-pick, counter-removal, restriction, search-destination, flash-condition, base-P/T, graveyard-shuffle, blocking-relation, shared-type, face-down, enlist, assist, meld and turn-stat families, among them Liliana, Death's Majesty, Glissa Sunslayer, Heartless Act, Niv-Mizzet, Guildpact and Whisperwood Elemental. A return from graveyards now puts its cards face down when its `enterAs` says so (rule 708.3; both battlefield paths read only the types). 25 go back on narrow keys.
- **Batch 259, the next of the freed cards: 111 of 150 authored** (2026-11-05, `282b14057`, `eefa1107d`) — the loyalty-X, energy, naming, aggregate and each-permanent-deals-damage families' cards, among them Ugin, the Spirit Dragon, Demonic Consultation, Kraven's Last Hunt and Sorin, Vengeful Bloodlord. A source's lifelink and deathtouch now work on any source, not only a creature (rules 702.15b, 702.2b). 39 go back on narrow keys.
- **Batch 258, the next of the freed cards: 135 of 150 authored** (2026-11-04, `a4c154886`, `cd2c3a27e`, `26dec2625`) — the outside-the-game, repeat-modes, skip-draw, shuffle-hand-and-graveyard and
  look-and-choose-target families, among them Jace, the Mind Sculptor, Vendilion Clique, Price of Progress and Time Spiral. By agents of 50 and 100 cards: the 100 went a third
  untested, measured in `agent-batches.md`. Fixed with it: a cast copy no longer counts as a card played (12 pool cards), a foretold card no longer counts in an exile aggregate, and
  "each player mills" reads every number first.
- **Batch 257, the next of the freed cards: 125 of 150 authored** (2026-11-04, `7044d47f1`, `a5cffa774`) — the attack-restriction, chosen-by-other-player, dealt-damage-dies,
  per-player condition, on-resolution choice, choose-permanent and per-player count families, among them The Abyss, Oona, Queen of the Fae, Vampiric Sliver
  and Ajani, Strength of the Pride. By agents of 20, 30, 40 and 60 cards: the largest cost least per card, and a blind review found no more wrong in its share.
- **Batch 256, the scaffolder over the whole snapshot: 373 of 383 authored** (2026-11-04, `6e68c6096`, `b056d7d6a`) — every Commander-legal
  card the parser reads whole, each reviewed against its Oracle text and rulings, among them Yawgmoth's Will, Gisela and Bruna, Terminus and
  Time Reversal. Fixed with it: the scaffolder's emitter dropped 14 fields the parser had read (`exileOnResolve`, `castOnlyIf`, `moreCycling`, …).
  19 need keys the review showed already run marked built. Detail in `docs/card-blockers.md`.
- **Batch 255, the first of the freed cards: 134 of 150 authored** (2026-11-04, `7e508b2fc`, `77fcd18d7`) — the oldest of
  `cards:needs -- --stale`: switch-pt, piles, hand-exile, its-controller draws and discards, chosen-player and per-player counts,
  among them Wishclaw Talisman, Palantír of Orthanc, Stuffy Doll, The Black Gate and Tataru Taru. 43 as the scaffolder finished
  them, 91 by six `card-author` agents. Fixed with it: `separate-into-piles`' `"an-opponent"`, naming the opponent after the reveal
  and, for a chooser, after the piles (rule 608.2c), which every "an opponent" pile card had asked first at three players or more;
  and a `cast-spell` trigger's `who: "chosen-player"`, which never fired.
- **The need-key recheck: 44 keys, 49 cards** (2026-11-02, `da62c56c7`, `34c4a2709`) — re-reading the open keys whose notes
  claim the vocabulary lacks something. No engine change, each run on a real card in `need-key-recheck.test.ts`:
  effect:search-to-linked-exile, effect:exile-all-hands, effect:token-copy-each-of-target-players,
  condition:blocked-creature-filter, effect:return-linked-filter, effect:move-counters-from-all,
  effect:return-commanders-to-command-zone, effect:populate-x-times, effect:restrict-dealt-damage-this-way,
  effect:become-copy-filter-except-source, static:trigger-doubler-exclude-self, trigger:counters-put-other,
  trigger:turned-face-up-other, condition:you-have-most-life-trigger-condition, trigger:battalion,
  effect:damage-all-controller-of-target, effect:add-counter-equipped-creature, amount:cards-in-target-player-hand,
  amount:cards-in-hand-of-target-controller, effect:exile-graveyard-of-trigger-object-controller,
  trigger:attack-trigger-defender-controls-count, effect:search-to-exile-then-cast, effect:prohibit-cast-chosen-color,
  condition:attacking-alone-condition, condition:trigger-condition-casters-turn,
  effect:scope-opponents-who-lost-life-this-turn, effect:prevent-combat-damage-by-chosen-creature,
  effect:prevent-combat-damage-by-target-players-creatures, effect:prohibit-controller-of-target,
  effect:chosen-hand-card-shuffle-into-library, effect:search-different-names, filter:graveyard-choice-other-than-source,
  static:cant-attack-lacking-either-keyword. On seven small general reads: effect:energy-count-amount,
  condition:no-abilities-filter, filter:static-affects-by-power, static:pt-filtered-static,
  condition:filter-shares-creature-type-with-source, effect:player-no-max-hand-size-for-game,
  static:players-no-max-hand-size, effect:no-max-hand-size-until-your-next-turn, static:granted-no-max-hand-size,
  effect:random-permanent, condition:opponent-hand-size.
- **Need-keys Phase 2: attack triggers narrowed by attackers and the player attacked** (2026-11-02,
  `fe5078a6c`; `trigger:attacks-player-filter`, `trigger:creature-attacks-enchanted-player`) — `attacks-player`'s
  `filter`, still once per player, and `attacks`' `attackedPlayer`, once per creature and never a
  creature attacking that player's planeswalker (rule 508.3a). Attuma, Atlantean Warlord, Curse of
  Predation, Curse of the Forsaken; 5 more cards freed.
- **Need-keys Phase 2: a reflexive ability naming what its parent made or targeted** (2026-11-02,
  `2effb9a13`; `effect:reflexive-refers-to-creating-objects`, `effect:reflexive-refers-to-parent-target`,
  `effect:reflexive-trigger-outer-target`) — `reflexive-trigger`'s `about`, read as it triggers and
  followed as its trigger object (rules 603.12, 400.7); a bot reads an `about` slot by what the ability
  does to it. Dáin Ironfoot, Back for More, Curse of the Werefox, Forum Filibuster, Behemoth of Vault 0;
  4 more cards freed.
- **Need-keys Phase 2: acting from the hand while you could mulligan** (2026-11-01, `3554c77d6`;
  `mechanic:leyline-opening-hand`, `mechanic:mulligan-hand-ability`) — rule 103.5b's `mulliganHandAbility`, a
  third action on the `mulligan` decision; rule 103.5's zero-hand floor (`mustKeep`), closing a soft-lock past
  seven mulligans; the builder's `ScenarioSpec.openingHands`. Serum Powder, Providence, Leyline Axe, Devourer
  of Destiny.
- **Need-keys Phase 2: a discard an opponent's spell or ability caused** (2026-11-01, `58eb5998f`;
  `replacement:discarded-by-opponent-to-battlefield`, `trigger:discarded-by-opponent-effect`). Obstinate
  Baloth, Dodecapod, Quagnoth, Spiritual Focus.
- **Need-keys Phase 2: join forces and life bidding** (2026-11-01, `fb86c138e`; `effect:life-bidding`,
  `mechanic:join-forces`) — `players-pay-any-amount`, `bid-life`, no new decision kind. Minds Aglow, Alliance
  of Arms, Mana-Charged Dragon, Liege of the Hollows, Plague of Vermin, Illicit Auction, Pain's Reward, Mages'
  Contest.
- **Need-keys Phase 2: what a permanent has dealt damage to** (2026-11-01, `6faf982be`;
  `stat:filter-dealt-damage-this-turn`, `stat:filter-dealt-damage-to-you-this-turn` and three more) —
  `GameObject.dealtDamage`, the `dealtDamageThisTurn` filter, the `self-hasnt-dealt-damage` condition.
  Reciprocate, Retaliate, Spear of Heliod, Restore the Peace, Red Guardian, Karakyk Guardian, Ruric Thar, Soul
  Collector, Witch-king.
- **Need-keys Phase 2: token creation's replacements planned as one event** (2026-11-01, `ab972f7cb`;
  `replacement:token-creation-add-extra`, `replacement:artifact-tokens-instead`,
  `replacement:token-creation-substitute-replacement` and one-of-each) — `token-replacements.ts`,
  `plusOneToken`, `tokensInstead`, `oneOfEach`, `ofTokens`; `tokenCreationMultiplier` counts a stack's copies,
  capped at 1000. Xorn, Stridehangar Automaton, Tippy-Toe, Queen Allenal, Draconic Visitor, Fisher's Talent,
  Academy Manufactor.
- **Need-keys Phase 2: exchanges with a life total** (2026-11-01, `ad7ae3cdf`; `effect:exchange-life-power`,
  `effect:exchange-life-totals`) — `exchange-life-totals`, `exchange-life-stat` (was `exchange-life-toughness`),
  the `{ lifeDifference }` amount, `player-compare`'s `within` (119.7, 119.8). Evra, Mirror Universe, Soul
  Conduit, Mister Negative, Psychic Transfer, Profane Transfusion.
- **Need-keys Phase 2: choices kept and the rest destroyed** (2026-11-01, `e66a1bd9e`;
  `effect:destroy-all-except-chosen`, `effect:each-player-chooses-destroy-rest`) — `vote` for a permanent
  takes `count`, `upTo` (replacing `upToOne`) and `keep`; `startingWith`'s `"you-then-active-player"`; `thisWay:
  "chosen"` reads votes too. Divine Reckoning, Duneblast, Mount Doom, Fall of the First Civilization, Fortunate
  Few, Druid of Purification.
- **Need-keys Phase 2: limits on how many creatures attack or block** (2026-11-01, `b5fb71223`;
  `static:attack-limit`, `static:max-attackers-blockers`) — `attackLimit`, `blockLimit`, the `limit-blockers`
  effect, `combat/limits.ts`. Crawlspace, Silent Arbiter, Caverns of Despair, Dueling Grounds, Tomik, Mirri.
- **Need-keys Phase 2: ending the turn and the combat phase** (2026-11-01, `fead394c2`;
  `effect:end-the-turn`, `effect:end-the-combat-phase`) — rule 724: the stack exiled uncountered, on to
  cleanup, or to the next phase. Time Stop, Ultima, Glorious End, Obeka Brute Chronologist, Mandate of Peace.
- **Need-keys Phase 2: free casts with a limit** (2026-11-01, `822249c08`, fix `cef9dee3c`, checks
  `506beb17c`; `cost:free-cast-from-hand-static`, `cost:free-cast-once-each-turn`) —
  `alternativeCostForSpells`' `fromZones` and `anyPlayer`, reaching `via: "library-top"` and any paid
  `cast-now`; its filter judged as the face cast. Omniscience, Omnipresence, Aluren, As Foretold, Vision,
  Zaffai, One with the Multiverse, Tlincalli Hunter.
- **Need-keys Phase 2: cycling's cost as a variant** (2026-11-01, `d42cb2264`; `cost:cycling-alt-cost`,
  `cost:cycling-x`) — `CyclingAbility.also` and `costText`, `{X}` in the cost, `alternativeCyclingCost`
  (`firstEachTurn`, `cardsCycledThisTurn`), `card-cycled.x` read as `triggerValue`. Street Wraith, Edge of
  Autumn, Gavi, New Perspectives, Shark Typhoon, Webstrike Elite, Rampaging War Mammoth.
- **Need-keys Phase 2: a number a player chooses** (2026-11-01, `c9c7b3300`; `decision:choose-number`,
  `cost:choose-number-additional`) — no new decision kind: `additionalCost.chooseNumber`, `vote`'s
  `for: { number }` open or secret with `{ votedNumber }`, `choose-value`'s `who`, `max` as an amount
  (`{ leastOf }`) and `remember`, the `"chosen-number"` CDA count, `sacrifice-all-but`'s amount and `who`.
  Liquid Fire, Wheel of Misfortune, Menacing Ogre, Choice of Damnations, Diminishing Returns, Shapeshifter,
  Volcano Hellion.
- **Need-keys Phase 2: an activated ability's own reduction, under a condition** (2026-11-01, `36ad5772b`;
  `cost:ability-cost-reduction-conditional`, `-conditional-colored`, `cost:ability-cost-modification-all-zones`,
  `static:ability-cost-increase-attached`). Flying Drone, Kami of Jealous Thirst, Esquire, Crown of Gondor,
  Razorlash, Hylda's Crown, Suppression Field, Oppressive Rays.
- **Need-keys Phase 2: more players an effect can name** (2026-11-01, `81ab84c1e`;
  `effect:player-scope-extensions`' top group, 11 keys) — a second target on the same player's permanent,
  `PlayerScope`'s `"attached-controller"`, the trigger controller's opponents. Fall of Kroog, Searing Blaze,
  Yosei, Mass Diminish, Gremlin Infestation, Observed Stasis, Standstill, Heartwood Storyteller, Bounty Board,
  Lavalanche, Ember Gale, Cruel Grimnarch, Plaguecrafter, Super Intelligence, Citadel Siege, Azog, Silumgar.
- **Need-keys Phase 2: when a spell may be cast or an ability activated** (2026-11-01, `18faa95cc`;
  `effect:cast-and-activate-restrictions`' top group, 13 keys) — flash for an extra cost (`kicker`'s
  `keyword: "flash"`), opponents may activate, bans on non-mana and loyalty abilities, as-though haste,
  loyalty twice, until-your-next-turn bans, sorcery timing for opponents, legendary sorcery,
  uncounterable-if, can't cast creature spells. Rout, Saproling Symbiosis, Harbinger of the Tides,
  Detention Vortex, The Immortal Sun, Overwhelming Splendor, Thousand-Year Elixir, Oath of Teferi, Reflector
  Mage, Single Combat, Teferi Time Raveler, Urza's Ruinous Blast, Exquisite Firecraft, Steel Golem.
- **Need-keys Phase 2: cost reductions read more and take more** (2026-11-01, `bd0b0c094`;
  `cost:cost-modification-extensions`' top group, 20 keys) — `CostReductionAmount`'s every counter, colours
  among, same name, source's or equipped power; self-coloured, domain and several conditions; target-keyed
  costs; died, sacrificed and energy this turn (`turnStat`'s `"energy-paid-or-lost"`); flashback reduced;
  by cast zone. Lumbering Megasloth, Wildvine Pummeler, Tamiyo's Logbook, Locket of Yesterdays, Gargantuan
  Leech, Khalni Hydra, Ertai's Scorn, Stormwing Entity, Assassin's Ink, Diregraf Rebirth, The Balrog, The
  Scarlet Witch, Visions of Glory, Gravebreaker Lamia, Brush Off, Dragon's Prey, Vanish into Eternity,
  Killian, Spellwild Ouphe, Battlefield Thaumaturge, Monastery Siege, Icefall Regent.
- **Need-keys Phase 2: pack tactics** (2026-11-01, `9107d724b`; `keyword:pack-tactics`) — `TurnStat`'s
  `"power-attacked-with-this-combat"`, recorded at declaration. Gnoll Hunter, Targ Nar, Battle Cry Goblin.
- **Need-keys Phase 2: skipping a turn, and scoped extra turns** (2026-11-01, `767fc5e70`;
  `effect:skip-next-turn`, `effect:extra-turn-scoped-effects`, `condition:extra-turn`) — `skip-turn`
  (`PlayerState.turnsToSkip`, extra turns too, 614.10a), `take-extra-turn`'s `thatTurn`, the
  `"this-turn-end-step"` delayed timing. Meditate, Eater of Days, Wormfang Manta, Warrior's Oath, Chance for
  Glory, Alchemist's Gambit, Medomai the Ageless.
- **Need-keys Phase 2: untargeted damage to the ability's own source** (2026-11-01, `9b205b0bd`;
  `effect:damage-to-source`) — `damage`'s `target: "source"`; the scaffolder reads coin flips too. Psionic
  Entity, Psionic Sliver, Goblin Bangchuckers, Goblin Tinkerer.
- **Need-keys Phase 2: a filter matching an object named like another** (2026-11-01, `5a5373d16`;
  `filter:same-name-as-card-in-graveyard`, `filter:same-name-as-trigger-object`,
  `filter:same-name-as-another-permanent`, `filter:same-name-as-card-in-casters-graveyard`,
  `keyword:imprint-same-name`, partly) — `ShareReference`'s `{ graveyard, itsController? }`,
  `sameNameAsAnother`, `destroy-all`'s `exceptTriggerObject`; `nameForMatching` uses last-known names;
  bound names match either split half. Pyromancer Ascension, Bazaar of Wonders, Dragonlord Kolaghan,
  Remembrance, Verdant Succession, Eye of Singularity, Invader Parasite, Strata Scythe, Extraplanar Lens.
- **Need-keys Phase 2: reveal until a condition or a count** (2026-11-01, `cda9080f7`;
  `effect:reveal-until-count-exile`, `effect:reveal-until-rest-bottom-any-order`,
  `effect:reveal-until-rest-to-hand`, `effect:reveal-until-count-to-hand`,
  `effect:reveal-until-count-tapped`, `effect:reveal-until-rest-exile`, `effect:reveal-until-count`,
  partly) — a shared `RevealedCardsGo`, `thenKeepsTargets`; the any-order rest reuses `choose-from-zone`.
  Treasure Hunt, Erratic Explosion, Explosive Revelation, Erratic Mutation, Goblin Machinist, Fathom
  Trawl, Auspicious Starrix, Proteus Staff.
- **Need-keys Phase 2: a static ability on an emblem, read off the emblem** (2026-11-01, `e087f7f28`,
  `f72793849`, `30eb04604`; `effect:emblem-static-abilities`, `effect:emblem-no-max-hand-size`,
  `effect:emblem-instant-speed-loyalty`, `effect:emblem-play-from-graveyard`,
  `effect:emblem-free-cast-from-hand`) — `emblemStatics`, the emblem's object as source (114.2, 114.4);
  `discard`'s `atMost`. Elspeth Knight-Errant, Ajani Steadfast, Teferi Temporal Archmage, Tamiyo the Moon
  Sage, Gideon of the Trials, Jaya Ballard, Saheeli Filigree Master.
- **Need-keys Phase 2: amounts read from this turn's events** (2026-11-01, `d4da8b9e5`;
  `effect:counters-put-this-turn-stat`, `effect:total-mana-value-cast-this-turn`,
  `effect:turn-stat-cards-discarded`, `effect:turn-stat-counters-put`, `effect:turn-stat-lands-entered`,
  `effect:count-players-with-turn-history`, `effect:turn-stat-per-player-amount`,
  `amount:opponents-attacked-this-turn`) — `TurnHistory.countersPut`, the `countersPutThisTurn` amount
  and `counters-put-this-turn` condition, `castThisTurn`'s `total`/`other`, `turnStat`'s `who: "each"`,
  the `"opponents-attacked"` stat. Iridescent Hornbeetle, Fairgrounds Trumpeter, Lord Jyscal Guado, Call
  Forth the Tempest, The Raven Man, Dream Salvage, Hollow One, Bioengineered Future, Wound Reflection,
  Smuggler's Share, Militant Angel, Rose.
- **Need-keys Phase 2: a player's number against yours as a spell's sentence** (2026-11-01, `854249e10`;
  `condition:opponent-more-life`, `condition:you-more-life-than-an-opponent`,
  `condition:target-player-more-cards-in-hand-than-you`, `condition:target-player-more-life-than-you`,
  `amount:opponents-with-more-cards-in-hand`) — no engine code: `player-compare` and
  `countPlayers.where` already said it, so the scaffolder and pins. Linvala the Preserver, Glorious
  Enforcer, Pulse of the Forge, Pulse of the Dross, Wojek Investigator.
- **Need-keys Phase 2: costs that exile a chosen object** (2026-11-01, `d933185e3`;
  `cost:exile-card-from-hand`, `cost:exile-creature-cost`, `cost:exile-from-single-graveyard`,
  `cost:exile-spell-you-control`) — `exilesSacrifice`, `exileFromHand` (a mana ability waits for it,
  `thenManaAbility`), `singleGraveyard`, `exileSpell`. Food Chain, City of Shadows, Necrotic Fumes,
  Cadaverous Bloom, Night Soil, Nivmagus Elemental.
- **Need-keys Phase 2: alternative costs in life or a life change** (2026-11-01, `072a408ab`, checks
  `cbbb328e3`; `cost:alt-cost-opponent-gains-life`, `cost:alt-cost-pay-life-equal-mana-value`,
  `cost:alternative-cost-pay-life`) — `alternativeCost.othersGainLife`, `payLifeManaValue` on
  `alternativeCostForSpells`, `grant-spells-this-turn` and `impulse-exile`, `Game.alternativeCostsOf`
  with `altCostIndex` (a choice among them), kicker on alternative costs. Snuff Out, Invigorate, Reverent
  Silence, Demon of Fate's Design, Marshland Bloodcaster, Inside Information.
- **Need-keys Phase 2: an exile's end as a parameter** (2026-11-01, `e927fd648`;
  `effect:exile-from-hand-until-source-leaves`, partly, `effect:exile-until-opponent-becomes-monarch`,
  `effect:exile-until-other-target-leaves`) — `discard-chosen`'s `untilSourceLeaves`, `exile`'s `until`
  (610.3). Kitesail Freebooter, Brain Maggot, Deep-Cavern Bat, Palace Jailer, Calix.
- **Need-keys Phase 2: held down through a chosen player's next N untap steps** (2026-11-01,
  `91a108a40`; `effect:doesnt-untap-next-two-untap-steps`, `effect:doesnt-untap-next-untap-step`,
  `effect:doesnt-untap-your-next-untap-step`) — `tap`'s `doesntUntapSteps` and `untapStepOf`, also on
  `tap-all`; `skipsUntapOf` is now per player. Telekinesis, Reveka, Samite Alchemist, Spectral Bears,
  Vorinclex, Dreamshackle Geist.
- **Need-keys Phase 2: controlling a player (rule 723), and choosing another's attackers and blocks**
  (2026-11-01, `227da0fb0`; `mechanic:control-player`, partly, `mechanic:control-attack-block-choices`)
  — the `control-player` and `choose-combat` effects, `player-control.ts` (who answers; nothing in the
  rules reads it), `viewFor` with what the controlled player sees (723.4), the server's seat check, the
  table drawn from `view.perspective`. No new decision kind. Mindslaver, Worst Fears, Cruel Entertainment,
  Secret of Bloodbending, Emrakul the Promised End, Master Warcraft, Brutal Hordechief.
- **Need-keys Phase 2: tap a counted or shared-type set as a cost** (2026-11-01, `a679a5df5`;
  `cost:tap-cost-transform-trigger`, `cost:tap-creatures-sharing-creature-type`,
  `cost:tap-x-untapped-cost`, `effect:tap-x-then`) — `tapOthers.count: "x"`, `shareCreatureType`,
  `manaFrom.fromSource`. Secluded Starforge, Necron Overlord, Aryel, Weight of Conscience, Thousand
  Moons Smithy // Barracks of the Thousand.
- **Need-keys Phase 2: sacrifice costs in parts** (2026-11-01, `8c77dfb92`; `cost:sacrifice-multiple`,
  `cost:sacrifice-x-mana-ability`, `cost:tap-creatures-total-power`, `cost:flashback-sacrifice-x`,
  `replacement:regenerate-instead-of-destroy`) — `SacrificeCost.parts`, `differentNames`, a mana
  ability sacrificing X, flashback's X, `regeneratesInstead` (701.19b). Springjack Pasture, Emrakul's
  Evangel, Glass-Cast Heart, Transmutation Font, Firecat Blitz, Mossbridge Troll.
- **Need-keys Phase 2: can't-attack scoped to the defender** (2026-11-01, `1150995af`;
  `static:cant-attack-you-player-only`, `effect:creatures-cant-attack-you-until-next-turn`,
  `static:cant-attack-same-player`) — `cantAttackController: "player"`, the `cantAttack` player effect,
  `cant-attack-player-attacked-this-turn`. Reverence, Blazing Archon, Teferi's Moat, Queen Mother
  Ramonda, Elephant Grass, Heat Wave, Chronomantic Escape, Port Razer, Bloodthirster.
- **Need-keys Phase 2: a cost on a particular creature to attack, block or be blocked** (2026-11-01,
  `9910bf7e2`; `cost:attack-tax-per-counters`, `static:attack-cost-for-creature`, `static:block-tax`,
  `cost:attack-block-cost-self`) — the `combatTax` static, the `blockTax` player effect, `combat/tax.ts`
  (508.1h, 509.1d). Brainwash, Phyrexian Marauder, Nils, Cowed by Wisdom, Qal Sisma Behemoth, Hipparion,
  Awesome Presence, War Cadence, Archangel of Tithes.
- **Need-keys Phase 2: who may look at what** (2026-11-01, `fa44d4209`;
  `zone:visibility-extensions`, partly) — `StaticAbility.visibility` read by `viewFor` (hands revealed,
  library tops revealed, face-down creatures, a look at your own top card) and the
  `look-at-library-top` effect; 5 freed. Telepathy, Wandering Eye, Wizened Snitches, Keeper of the
  Lens, Found Footage, Lumbering Laundry, Glowcap Lantern, Mishra's Bauble, Merfolk Observer, Peek.
- **Need-keys Phase 2: a trigger's recipient as a reference** (2026-11-01, `1e88631ab`;
  `trigger:trigger-recipient-ref`, `trigger:becomes-blocked-attacked-recipient`) — the
  `"trigger-recipient"` `EffectTargetRef`, `DelayedTrigger.recipient` (603.7c); 2 freed. Ohran Viper,
  Lowland Basilisk, Sosuke, Son of Seshiro, Permeating Mass, Obelisk Spider, Neko-Te, Rakdos Roustabout.
- **Need-keys Phase 2: statics acting on a player** (2026-11-01, `4c637137c`; two keys and
  `trigger:enchanted-player-dealt-damage`) — `"enchanted-player"` on `controlledBy`, replacements and
  triggers, `loseCreatureTypes`, `cantWinGame`, `opponentsCantLoseGame`; 3 freed. Curse of Death's
  Hold, Curse of the Nightly Hunt, Curse of Conformity, Curse of Bloodletting, Grievous Wound, Abyssal
  Persecutor.
- **Need-keys Phase 2: a graveyard's order** (2026-11-01, `e51eefe32`; `effect:top-card-of-graveyard`,
  `effect:top-creature-card-of-graveyard`, `effect:reorder-graveyard`) — rules 404.1-404.3: the
  `top-of-graveyard` effect, `fromTop` costs, `reorder-graveyard`, cards arriving together arranged by
  their owner while a card reads the order; 10 freed. Soldevi Digger, Guiding Spirit, Phyrexian
  Furnace, Alms, Necratog, Corpse Dance, Fossil Find.
- **Need-keys Phase 2: the most common color among permanents** (2026-11-01, `4e42c49d1`) — the
  `most-common-color` condition at layer 5; 4 freed. Ruham Djinn, Heroic Defiance, Tsabo's Assassin,
  Barrin's Unmaking, Call to Arms.
- **Need-keys Phase 2: a tapped-for-mana trigger on the stack** (2026-11-01, `e62e290e6`) — the
  `permanent-tapped-for-mana` event (106.12a), also from the auto-payer; 3 freed. Manabarbs, Burning
  Earth, Zhur-Taa Druid, Forbidden Orchard, Storm Cauldron, Sanctimony.
- **Need-keys Phase 2: a card chosen from a set as an effect resolves** (2026-11-01, `1b016488a`) —
  `look-and-choose`'s `destination: "stay"` and `under: "owners"`, `choose-exiled-to-play`'s `linked`,
  `discard-chosen`'s `mayCast`; 3 freed. Memory Leak, Psychic Intrusion, Muse Vessel, Purgatory, Bag
  of Devouring, Lazav.
- **Need-keys Phase 2: revealing from a hand** (2026-11-01, `f3b9c434b`) — mostly existing machinery,
  with `thisWay`'s `sharingManaValue` and templates; 4 freed. Thoughtcutter Agent, Search Warrant,
  Merfolk Spy, Planeswalker's Fury, Armored Kincaller, Vault 21: House Gambit.
- **Need-keys Phase 2: companion** (2026-11-01, `9125a1ba9`; `mechanic:companion`) — rule 702.139:
  `companion.ts`'s ten conditions as data, the reveal as a `choose-from-zone` flagged `companion`
  (103.2b), `take-companion` the {3} special action (116.2g), Commander decks keeping only companions
  from their sideboard; the client's panel offer, deck-builder mark, "Companion" import section and
  seven manual checks; 7 freed. Kaheera, Keruga.
- **Need-keys Phase 2: a card's own copy limit** (2026-11-01, `c1c4a285c`;
  `mechanic:deck-any-number-copies`) — `CardDefinition.deckCopies` and `copiesAllowed`; a commander
  counts as one of its own copies (903.5b); 6 freed. Rat Colony, Relentless Rats, Seven Dwarves.
- **Need-keys Phase 2: sacrifice or discard instead of entering** (2026-11-01, `65817ea28`;
  `replacement:enter-replacement-discard`, `replacement:enter-replacement-sacrifice`) — `EnterInstead`
  on `enters-battlefield`, asked by `askEnterChoice`; 5 freed. Mox Diamond, Scorched Ruins, Kjeldoran
  Outpost, Sheltered Valley, Overlaid Terrain.
- **Need-keys Phase 2: a copy on the way in, from a graveyard or exile** (2026-11-01, `309e6ac38`; six
  keys of `replacement:copy-on-enter-options`) — `CopyOnEnter.from`, `condition`, `whenYouDo`, `ownPt`,
  `ifYouControlCopied`, and `BecomesOnEnter` as copiable values; a flip no one wins logged as what it
  came (705.2); 4 freed. Body Double, Echoing Deeps, Superior Spider-Man, Activated Sleeper, The
  Master Formed Anew, Protean Raider, Wall of Stolen Identity, Undercover Operative, Imposter Mech,
  Copy Land, Hulking Metamorph, Primal Clay, Corrupted Shapeshifter, Molten Sentry.
- **Need-keys Phase 2: a cost reduction on the next matching spell** (2026-11-01, `a7136f10d`;
  `effect:next-spell-cost-reduction`, `effect:until-next-turn-spell-cost-reduction`) — a `next` grant's
  `reduceGeneric` and `affinityFor`; 5 freed. Hardened Berserker, Kaza, Maelstrom Muse, Don & Raph.
- **Need-keys Phase 2: a limit on the spells a player casts each turn** (2026-11-01, `7a8701b06`;
  `effect:cast-limit`, `effect:per-player-cast-limit`) — `prohibits.castLimit`, counting the whole
  turn, `who: "enchanted-player"`, `player-effect`'s `castsLeft`; 5 freed. Rule of Law, Deafening
  Silence, Ethersworn Canonist, Irencrag Feat, Curse of Exhaustion.
- **Need-keys Phase 2: creatures that blocked or were blocked this turn** (2026-11-01, `726451744`;
  `filter:blocked-or-blocked-by-filter-this-turn` and three riding along) — `TurnHistory.blocks`,
  `CardFilter.blockedThisTurn`, the `end-of-combat-this-turn` timing; 13 freed. You Cannot Pass!, Sea
  Troll, Venomous Breath, Ride Down, Triton Tactics, Sizzling Barrage, Joven's Ferrets.
- **Need-keys Phase 2: a face-down permanent turned face up by an effect** (2026-11-01, `207f5b0e3`;
  `effect:turn-face-up`) — the `turn-face-up` effect through `Game.becomeFaceUp`, honouring
  `cantTurnFaceUp`; 5 freed. Ixidor, Break Open, Skirk Alarmist, Showstopping Surprise, Karlov Watchdog.
- **Need-keys Phase 2: return what was put into a graveyard this turn** (2026-11-01, `e9a589196`) —
  tests and a scaffolder template over existing machinery; 6 freed. Faith's Reward, Second Sunrise,
  Gleancrawler.
- **Need-keys Phase 2: an unless's payments as one `UnlessOption` each** (2026-11-01, `c8d9d5b4b`;
  nine keys of `cost:unless-pay-colored-per-amount`) — `andLife`, `ifPaid`, `payLifeAmount`,
  `payEnergy`, `putCounter`, `returnToHand`, `tapPermanent`, `sacrificeThat`, and a `pay-energy`
  effect; Coral Atoll, Dormant Volcano, Everglades, Koskun Falls, Public Thoroughfare and Waterspout
  Djinn moved onto them; 2 freed. Mundungu, Essence Vortex, Rush of Inspiration // Crackling Falls,
  Cyclone, Karoo, Command Bridge, Enchanter's Bane, Curse Artifact.
- **Need-keys Phase 2: attack taxes** (2026-11-01, `6d04fe4fd`; `cost:attack-tax` and its `-amount`,
  `-life`, `-planeswalkers`) — `attackTax`'s `generic` a number or a live count, `life`, `covers`,
  also as a `player-effect` for a duration, with the client's "costs 2 life to attack"; 5 freed.
  Baird, Sphere of Safety, Collective Restraint, Onakke Oathkeeper, Sivitri, Forbidding Spirit, War
  Tax.
- **Need-keys Phase 2: a sweep that leaves out its source** (2026-11-01, `22d1e3141`;
  `effect:destroy-all-except-source`) — `destroy-all`'s `exceptSource`; 3 freed. Novablast Wurm,
  Tranquil Grove, Mageta the Lion, Worldslayer, Elspeth Tirel, Desolation Giant.
- **Need-keys Phase 2: a life total set** (2026-11-01, `cf3b8584c`; `effect:life-total-becomes`,
  `amount:starting-life-total`) — `set-life-total` (rule 119.5: a real gain or loss of the
  difference), the `startingLifeTotal` and `lowestLifeTotal` amounts, six cards that emulated it moved
  over; 5 freed. Magister Sphinx, Biorhythm, Repay in Kind, Oketra's Last Mercy, The Endstone,
  Resolute Archangel.
- **Need-keys Phase 2: choosing among cards revealed from a hand** (2026-11-01, `79919384a`;
  `effect:reveal-n-from-hand-you-choose-discard`) — `discard-chosen`'s `reveals` and `picks`; 6 freed.
  Blackmail, Mire's Toll, Noggin Whack, Cabal Interrogator.
- **Need-keys Phase 2: protection whose quality is any source quality** (2026-11-01, `4365a0501`;
  nine keys of `keyword:protection-from-spells-and-cast-permanents`) — `qualityMatches` read by all
  four parts of rule 702.16, `fromPlayers` (702.16k), everything (702.16j), `CardFilter.isSpell` with
  `Game.enteringSource`, `exiledCardTypes`, `doesntRemoveSource` by card type (702.16n),
  `protectionLabel`; 3 freed. Cliffside Rescuer, Figure of Fable, Absolute Virtue, True-Name Nemesis,
  Vexilus Praetor, Emrakul the Aeons Torn, Emrakul the World Anew, Devoted Caretaker, Baneslayer
  Angel, Riders of Gavony, Mirror Golem, Tattoo Ward.
- **Need-keys Phase 2: a source of your choice over any recipient** (2026-11-01, `258359f30`; four
  keys of `replacement:prevent-damage-from-chosen-source`) — `to: "your-side-creatures"`,
  `gainLifeFrom`, tests and templates over what existed; 6 freed. Burrenton Forge-Tender, Prahv,
  Pilgrim of Virtue, Opal-Eye, Samite Ministration, Shadowbane.
- **Need-keys Phase 2: impulse permissions whose window is a predicate** (2026-11-01, `620d12027`;
  nine keys of `zone:impulse-permission-options`) — one `ImpulseDuration` vocabulary for
  `impulse-exile` and `exile`'s `mayCast`, which also gains `play` (during your next turn, until end
  of combat next turn, until the source exiles another, while you control it); `sourceDid`, a live
  gate off `TurnHistory.attackedWith` and `loreCountersOn`; losing control ends it for good (rule
  611.2b); 10 freed. Galvanic Relay, Goblin Researcher, Brazen Cannonade, Furious Rise, Lightning,
  Security Sergeant, Victor Mancha, Runaway, Scholar of Combustion, Containment Construct.
- **Need-keys Phase 2: token copies of a linked source** (2026-11-01, `c4de1ae07`; five keys of
  `effect:token-copy-options`) — `create-token-copy`'s `of` reaches `"enchanted"`,
  `"exiled-with-source"` (with `chooseOne`), `"exiled-as-cost"`, `"exiled-this-way"` and
  `{ eachExiled }`; `count` an amount; `sacrificeAtEndOfCombat`, `atYourNextEndStep`,
  `exceptions.static`; no token of an instant or sorcery card (rule 111.5); Helm of the Host's
  token now goes to its controller; 16 freed. Mimic Vat, The Cloning of Shredder, Followed
  Footsteps, Mardu Siegebreaker, Altaïr Ibn-La'Ahad, Dollhouse of Horrors, Foggy Swamp Visions,
  Rionya.
- **Need-keys Phase 2: restrictions keyed to the other creatures in combat** (2026-11-01, `0329b0fd9`;
  `static:can-only-attack-alone`, `static:cant-attack-alone`, `static:cant-attack-or-block-alone`,
  `static:cant-attack-or-block-unless-two-others`, `static:cant-block-alone`) — five
  `CombatRestriction`s and `combat/company.ts` (rules 508.1c-d, 509.1b-c): the offers leave out a
  creature with no legal group, the validators refuse an illegal declaration and count the most
  requirements obeyed, bots and the fuzzer declare within them; 11 freed. Mogg Flunkies, Craven
  Hulk, Orcish Conscripts, Errantry, Bonded Construct.
- **Need-keys Phase 2: limits on the untap step** (2026-11-01, `5319f50ca`;
  `static:untap-step-limit`) — `untapLimit` (who, count, filter) and `untapOnlyChosenType`, rule
  502.3, through `choose-permanents` and `choose-modes`; 4 freed. Winter Orb, Static Orb, Winter
  Moon, Smoke, Mungha Wurm, Storage Matrix.
- **Need-keys Phase 2: another player choosing** (2026-11-01; 7 keys of
  `effect:choices-by-other-players`) — `SearchInstead.chooser` and `pick: { exactly }`, a
  look-and-choose's `chooser: "an-opponent"` with the opponent picked after the reveal, `under:
  "you"`, `for-each-player.choicesHeld` (picks enter together, none chosen twice) and
  `discard-chosen.chooser`, through `choose-from-zone` and `choose-modes`; 18 freed. Intuition,
  Gifts Ungiven, Realms Uncharted, Guided Passage, Dubious Challenge, Drana, Scrounge, Dredge the
  Mire, Rejoin the Fight, Skullwinder, Rakdos Augermage.
- **Need-keys Phase 2: one choice per card type or mana value** (2026-11-01; 6 keys of
  `effect:look-and-choose-second-pick`) — `together.oneEachTypeAmong`, `together.totalManaValueAtMost`,
  `look-and-choose.split` (a destination by card kind), `from` another player's graveyard,
  `thisWay: "discarded"` finding cards a replacement exiled; 13 freed. Zimone's Experiment, Grime
  Gorger, Hurkyl Master Wizard, Queen Kayla bin-Kroog, Smelting Vat, Michelangelo Improviser.
- **Need-keys Phase 2: a static P/T bonus by each affected permanent's own count** (2026-11-01,
  `6c6f62277`; 15 keys of `static:pt-per-amount`, among them `static:count-attached-to-affected`,
  `static:shares-creature-type-count`, `static:pt-per-opponent` and `static:grant-pt-per-domain`) —
  all on `grantPtPerCount`, its `relativeToAffected` and other amounts; 17 freed. Thran Power Suit,
  Auramancer's Guise, Champion of the Flame, Sliver Legion, Coat of Arms, Alpha Status, Hedron
  Matrix, Civic Saber, Knight of New Alara, Mycosynth Fiend, Gleam of Authority, Knowledge Is Power,
  Kyler, Manaforce Mace, Dark Matter Manipulator, Disturbing Conversion.
- **Need-keys Phase 2: keyword abilities and types for cards outside the battlefield** (2026-11-01,
  `2c9e54fae`; 11 keys of `static:grant-to-cards-outside-battlefield`) — `grantsToGraveyard.keywords`
  with the one-shot `grant-graveyard-keyword` (unearth, encore, embalm, harmonize, sneak, retrace),
  `typesOutsideBattlefield` with `setsChosenCreatureType`, `grantsCyclingInHand`,
  `grantsForetellInHand` and the `foretells` trigger; about 11 freed. Sedris, Solemn Doomguide, Wire
  Surgeons, Graywater's Fixer, Cursecloth Wrappings, Songcrafter Mage, Ninja Teen, Deeproot
  Historian, Six, Wrenn and Six, Rhet-Tomb Mystic, Tectonic Reformation, Homing Sliver, Dream
  Devourer, Ashes of the Fallen, Arcane Adaptation, Conspiracy, Maskwood Nexus.
- **Need-keys Phase 2: a player named as the owner of a target or trigger object** (2026-11-01,
  `8b1cfce79`; `effect:owner-of-target-player-ref`, `effect:exile-graveyard-of-target-card-owner`,
  `effect:trigger-object-owner-player-ref`) — `{ ownerOfTarget }` on `gain-life`, `lose-life`,
  `damage`, `mill` and `exile-graveyard`, the `"trigger-owner"` scope, and `damage`'s
  `who: "attached-owner"` with `from: "attached"`, as last known when both left at once (608.2h,
  `c324ef374`); 3 freed. Path of Peace, Recoil, Geth, Nurgle's Conscription, Enslave, Warped
  Devotion, Liability.
- **Need-keys Phase 2: a cost keyed to a spell's target, in mana** (2026-11-01, `df2ba7a13`;
  `cost:targeted-by-spells-mana-tax`, `cost:target-controller-graveyard-reduction`) —
  `targetedBySpellsCost`'s `payGeneric` and `targeting`, also granted; `abilityCostModification`'s
  `byOpponents` and `targeting`; offers leaving out too-dear targets (`targetTaxOffer`,
  `xCost.targetTaxes`, `targetsWithinTaxes`); the filter `controllerGraveyardAtLeast`, priced at each
  X's own targets; 6 freed. Boreal Elemental, Jubilant Skybonder, Kopala, Lullmage's Domination.
- **Need-keys Phase 2: no land plays this turn, and casts barred by zone** (2026-11-01,
  `ccd573c28`; `effect:prohibit-land-plays`, `effect:prohibit-cast-by-zone`) — `prohibit`'s
  `lands: true` (305.2), a static `prohibits`' `from`/`notFrom` and a `player-effect`'s `cantCast`
  `from`, judged where the card is as the cast begins (601.2a, `prohibitionReachesZone`); 5 freed.
  Turf Wound, Pardic Miner, Territorial Dispute, Drannith Magistrate, Experimental Frenzy.
- **Need-keys Phase 2: activations counted this turn** (2026-11-01, `9ca6fbe26`;
  `condition:ability-activated-count-this-turn`, `cost:activate-no-more-than-n-times-each-turn`,
  `cost:activation-limit-by-count`) — `ActivatedAbility.timesEachTurn` as a number or a count
  (602.5b; a limited mana ability left out of the auto-payer), the `activated-this-turn
  { atLeast }` condition on `GameState.abilityActivationsThisTurn`; 6 freed. Pit Imp, Sewer Rats,
  Withering Wisps, Dragon Whelp.
- **Need-keys Phase 2: text-changing effects** (2026-10-31, `5931f8328`;
  `effect:text-change-color-or-land-words`) — the `change-text` effect (rule 612, layer 3): one
  colour word or basic land type for another, chosen on resolution through `choose-value`'s
  `"text-word"` on the creature-type menu; `PtModifier.textChange` read by `rulesTextName` and
  `textNameOf` as a changed definition (`text-change.ts`), in every colour field, land type,
  landwalk and the type line, a spell's targets re-checked by it, a permanent spell keeping it
  (400.7a); a pool audit pins where colour words live; 7 freed. Sleight of Mind, Magical Hack, Mind
  Bend, Crystal Spray.
- **Need-keys Phase 2: colours in addition** (2026-10-31, `1c534a783`; `effect:add-color-until-eot`,
  `effect:animate-add-colors`, `static:add-color-to-attached`) — `become-color`'s `inAddition`,
  `add-types`' and `animate`'s `addColors` (105.3, a fresh timestamp); the static already existed
  (Deep Freeze); 6 freed. Indigo Faerie, Unctus, Grand Metatect, Phantasmal Form, Ghoulflesh.
- **Need-keys Phase 2: a graveyard card put there this turn, by where it came from** (2026-10-31,
  `ed1d5f9ef`; `filter:put-into-graveyard-from-battlefield-this-turn`,
  `condition:land-put-into-graveyard-from-battlefield-this-turn`,
  `condition:put-into-graveyard-this-turn-any-zone`) — `GameObject.putIntoGraveyardOn` (turn and
  origin zone, on every move into a graveyard, replacing the library-only marker) and
  `CardFilter.putIntoGraveyardThisTurn { from? }`; the Lady of Otaria's condition was already
  `turn-history`; 8 freed. Grim Return, Wreck Hunter, Thrilling Encore, Night Nurse, Healer of
  Heroes, The Lady of Otaria.
- **Need-keys Phase 2: a discard's cause, and "when you discard this card"** (2026-10-31,
  `20fbf25cd`; `trigger:discard-this-card`, `trigger:discards-extensions` (partly — Toluz's linked
  exile left), `trigger:discards-first-time-each-turn`) — `cards-discarded`'s `cause` (from
  `DecisionSource.controller`, kept on queued and held discards, stripped from the seat view), the
  `this-discarded { byOpponent? }` trigger from the card's new zone (113.6k), `discards`'
  `firstTimeEachTurn`; 6 freed. Psychic Purge, Guerrilla Tactics, Metrognome, Bartered Cow,
  Titanbones, Towering Heart, Rielle, the Everwise.
- **Need-keys Phase 2: relations among the chosen targets** (2026-10-31, `b43bb96da`;
  `effect:targets-share-type`, `effect:targets-equal-toughness`,
  `effect:targets-with-different-names`) — an `other` slot's `shares` (a card type, a creature
  type, or no creature type, `among` limiting the types) and a group's `equalToughness` and
  `differentNames`, narrowed while choosing, refused at cast (601.2c) and checked again on
  resolution (608.2b), a target gone read as it last existed; 7 freed. Legerdemain, Rivals' Duel,
  Secret Tunnel, V.A.T.S., Behold the Sinister Six!. Mind Extraction and Dead Ringers were
  mis-keyed.
- **Need-keys Phase 2: what's attached to a target or a player** (2026-11-01, `97a750503`;
  `condition:attached-to-target`, `filter:attached-to-player`, `filter:attached-to-target`) —
  `CardFilter.attachedToTarget`, `attachedToPlayer` (303.4) and `attachedToThan` ("up to one
  target Equipment attached to that creature", illegal on resolution once unattached); 13 freed.
  Hubris, Blastfire Bolt, Witchbane Orb, Fiery Annihilation.
- **Need-keys Phase 2: one choice across zones, or one card a slot** (2026-10-31, `7bac8a12a`;
  `decision:choose-from-zone-extensions`, `decision:choose-from-hand-and-graveyard`,
  `decision:choose-from-hand-and-library-top`, `effect:look-and-choose-one-each`) —
  look-and-choose's `together` (a search's set rule, one pick a slot, a slot's prompt `text`),
  `discard-chosen`'s `alsoFrom` (the target's graveyard, or the library's revealed top card) and
  `destination: "library-bottom"`, `return-from-graveyard`'s `count` as an amount; on the existing
  `choose-from-zone` prompt, two manual checks; 7 freed. Atraxa, Grand Unifier, Harper Recruiter,
  Agonizing Remorse, Psychotic Episode, Worldsoul's Rage (the bots' World Shaper deck drops its
  stand-in for it).
- **Need-keys Phase 2: a card name chosen with a player, that player's draws revealed**
  (2026-10-31, `c4888f515`; `decision:name-a-card`, `trigger:chosen-player-draws-named-card`) —
  on `choose-card-name`: the `revealsDraws: "chosen-player"` static, a `draws` trigger's filter
  reading the permanent (`chosenName`); the scaffolder reads Booby Trap, Cabal Therapy, Predict and
  sacrifice-only flashback; 8 freed. Booby Trap, Cabal Therapy, Predict.
- **Need-keys Phase 2: cards put into a hand this way** (2026-10-31, `cb777132b`;
  `effect:put-into-hand-this-way`, `effect:exiled-this-way-to-hand`, `effect:return-milled-this-way`)
  — the `"put-into-hand"` this-way kind (never a draw), read off `GameObject.handArrivalSeq`, and
  the `move-exiled-this-way` effect's `to: "hand"`; a milled card taken back was already a
  graveyard look-and-choose; 6 freed. Adventure Awaits, Courier of Comestibles, Cache Grab, Worlds
  Within Worlds, Monster Manual // Zoological Study.
- **Need-keys Phase 2: a look's pick exiled with a play permission** (2026-10-31, `b9c6d42d5`;
  `effect:look-and-choose-exile-chosen-playable`, `effect:exile-top-put-matching` (partly),
  `effect:exiled-this-way-to-library-bottom`, `effect:exile-cast-free-from-look`,
  `effect:look-and-choose-leftover-exile`) — look-and-choose's `playable` (this turn, or while
  exiled, optionally with mana of any type, on its `impulseGrant`) and `leftover: "exile"`,
  `move-exiled-this-way`'s `to: "library-bottom"`; 4 freed. Florian, Voldaren Scion, Nahiri's
  Warcrafting, Black Cat, Cunning Thief, Lord of the Void, Herald of Amity, Muse Vortex, The Key
  to the Vault, Desperate Research.
- **Need-keys Phase 2: sacrifice costs matched against their source** (2026-10-31, `14aeda7b3`;
  `cost:sacrifice-self-and-another`, `filter:not-source-clause`, `cost:sacrifice-enchanted-creature`,
  `cost:chosen-type-sacrifice-cost`) — a sacrifice cost's filter read with the ability's source
  everywhere the cost is (offer, activation check, mana plan, the pending choice), so `isSource`,
  `hostOfSource` and `ofChosenType` match; Skophos Warleader, Slaughter-Priest of Mogis and
  Skullport Merchant re-authored to "another" on one half only; 2 freed. Mold Folk, Malevolent
  Noble, Doom Cannon, Etchings of the Chosen, Betrothed of Fire, Bloodfire Infusion, Magus of the
  Order, Great Hall of Starnheim, Sandstone Deadfall.
- **Need-keys Phase 2: the card revealed for a cost** (2026-10-31, `ad8de250e`;
  `cost:reveal-card-as-additional-cost`, `cost:reveal-cards-sharing-color`) — the revealed card
  remembered on what it paid for, read by a `"revealed"` amount (from the hand, or as it was there
  once gone), `reveal.shareColor` on choose-from-zone's `together: "share"`; 4 freed. Induce
  Despair, Charge of the Forever-Beast, Calamity of the Titans, Titan's Presence, Living Destiny,
  Illuminated Folio.
- **Need-keys Phase 2: what a permanent is as it enters, beyond its own** (2026-10-31, `37782e895`;
  `effect:return-with-added-color`, `effect:enter-as-additional-card-type`,
  `effect:reanimate-as-animated-creature`, `effect:add-subtypes-if-creature-on-entry`) —
  `EnterTypes`' `addTypes`, `setColors`, `basePt`, `keywords` and `ifCreature`, and
  `put-onto-battlefield`'s own `enterAs`, one lasting effect in place before anything judges it
  (rules 611.2c, 614.12); 8 freed. Rise from the Grave, Relive the Past, Excava, the Risen Past,
  Lim-Dûl the Necromancer.
- **Need-keys Phase 2: a spell's copy with exceptions and gains** (2026-10-31, `54b8edbba`;
  `effect:copy-spell-except-nonlegendary`, `effect:copy-spell-add-types`,
  `effect:copy-spell-grants`) — `copy-spell`'s `except` as copiable values the token keeps (707.9b,
  707.10f) and `gains`, kept by the permanent it becomes (400.7a), `ifPermanent` (110.4b); 7 freed.
  Double Major, Tawnos, the Toymaker, Donal, Herald of Wings, Nalfeshnee.
- **Need-keys Phase 2: the card discarded to pay a cost** (2026-10-31, `568a9a5e2`;
  `effect:cost-discarded-card-ref`) — `LastKnownRefs.discarded` for every cost discard (602.2b,
  601.2h), read by the `"discarded"` amount ref and condition; the scaffolder reads "Discard a card"
  ability costs; 8 freed. Volrath the Fallen, Moria Scavenger, Grab the Prize, Stormscale Anarch.
- **Need-keys Phase 2: a granted ability naming its granter** (2026-10-31, `1d4cd446b`;
  `cost:granted-ability-sacrifice-granter`, `effect:granted-activated-refers-to-granter`,
  `effect:granted-trigger-refers-to-granter`) — `LastKnownRefs.granter` and the `"granter"`
  reference (201.5a; acted on while the same object, 400.7, read from LKI once gone, 608.2h),
  `from: "granter"` damage, `sacrifice: "granter"`; 7 freed. Ninja's Kunai, Trusty Boomerang,
  Archery Training, Spare Dagger. Fishing Pole (tap the granter) and Hold for Ransom (the granter's
  controller) left.
- **Need-keys Phase 2: several cards into their owners' libraries, each owner ordering**
  (2026-10-31, `2c67c7482`; `decision:owner-orders-library-placements`,
  `effect:look-at-target-player-library-reorder`, `effect:put-on-top-of-library-all`) — the
  `put-on-libraries` effect (401.4, 101.4) on scry's order decision, `owner-chooses` top or bottom,
  look-and-choose's `chooser: "that-player"` over a library; 4 freed. Plow Under, Forever Young,
  Harmonic Convergence, Aetherspouts, Ransack, Dimir Machinations, Tahngarth's Glare. Riptide
  Gearhulk's "Nth from the top together" got a narrow key.
- **Need-keys Phase 2: graveyard cards shuffled into a library by filter or target** (2026-10-31,
  `b54a0041c`; `effect:shuffle-graveyard-filter-into-library`,
  `effect:shuffle-graveyard-targets-into-library`) — `shuffle-graveyard-into-library`'s `filter`,
  `put-on-libraries`' `position: "shuffle"` and `withSource`, the `cards-shuffled-into-library`
  event and `"shuffled-into-library"` this-way kind; 5 freed. Elixir, Repopulate, Barishi, Turn the
  Earth, Serene Remembrance, Perpetual Timepiece.
- **Need-keys Phase 2: alternative costs paid from the hand** (2026-10-31;
  `cost:alt-cost-discard-cards`, `cost:alt-cost-exile-card-sets-x`, `cost:alt-cost-reveal-hand`) —
  `alternativeCost.discard` (with `others`), `exileFromHand.manaValueX` (X from the exiled card,
  rule 107.3a) and `revealHand` (701.20a), and `hand-size`'s `filter`; 6 freed. Abolish, Foil,
  Sickening Shoal, Nourishing Shoal, Land Grant.
- **Need-keys Phase 2: kicker costs that aren't mana, and life per target** (2026-10-31;
  `cost:kicker-nonmana-cost`, `cost:life-per-target`) — `kicker.also`'s `returnToHand` and
  `tapUntapped` beside its sacrifice, on a plain kicker and entwine (rule 702.33a, 702.42a), and
  `additionalCost.payLifePerTarget` (601.2f); 5 freed. Vicious Offering, Goblin Barrage, Betrayal
  of Flesh, Arctic Merfolk, Blood Tribute, Phyrexian Purge.
- **Need-keys Phase 2: one-shot grants to the next or first matching spell** (2026-10-31;
  `static:grant-cascade`, `static:grant-cascade-next-spell`, `static:grant-sunburst-to-next-artifact`,
  `static:grant-to-first-matching-spell`, `static:next-creature-spell-flash`,
  `static:next-spell-uncounterable`, `effect:next-spell-has-convoke`) — `grant-spells-this-turn`'s
  `filter` and `next` (used up as the next matching spell becomes cast, rule 601.2i) with
  `cantBeCountered`, `convoke` and `entersWithCounters`; `enters-with-counters`' granted sunburst;
  `grantsToSpells.firstEachTurn` over `castFrom`/`manaFrom`; 4 freed. Dark Apostle, Sloppity
  Bilepiper, Overmaster, Insist, Savage Summoning, Wand of the Worldsoul, Solar Array, Wild-Magic
  Sorcerer, Rain of Riches.
- **Need-keys Phase 2: prevention divided among targets, and the next N damage to you**
  (2026-10-31; `effect:prevention-divided`, `effect:prevent-next-n-damage-to-you`) — the
  `prevent-damage-divided` effect (601.2d, 615.7); the second was already `damage-rule`'s
  `players: "you"` with an amount, only marked; 11 freed (5 authored here). Remedy, Embolden,
  Conservator, Shield of the Ages, Decorated Griffin.
- **Need-keys Phase 2: a restriction over a target player's creatures, or the ones there now**
  (2026-10-31; `effect:cant-be-blocked-rule-this-turn`, `effect:restrict-controlled-by-target`,
  `effect:restrict-each-matching-at-resolution`, `effect:restrict-rule-for-player`) — `restrict`'s
  `controlledByTarget`, `exceptTarget` and `asItResolves` (611.2c); 12 freed (6 authored here).
  Concussive Bolt, Mark for Death, Joraga Invocation, Suicidal Charge, Leitmotif Composer, Veiling
  Oddity.
- **Need-keys Phase 2: "can't be the target of …" statics** (2026-10-31;
  `static:cant-be-targeted-by-filter`, `keyword:hexproof-from-multicolored`,
  `static:hexproof-from-spells-only`, `static:untargetable-by-color-any-player`) — `hexproofFrom`'s
  `spellsOnly`, `abilitiesOnly` and `anyController` qualifiers and a quality-less instance ("can't be
  the targets of spells"), judged alone (`Characteristics.hexproofFrom.qualified`), and the
  `graveyardCardsUntargetable` static ("cards in graveyards can't be the targets of spells or
  abilities"); 12 freed. Fiendslayer Paladin, Mercenary Informer, Dense Foliage, Ground Seal,
  Silent Gravestone.
- **Need-keys Phase 2: attack requirements narrowed** (2026-10-31;
  `effect:must-attack-specific-player`, `effect:target-attacks-target-player-this-turn`,
  `effect:must-attack-target-players-creatures`, `effect:must-attack-controllers-next-combat`,
  `static:must-attack-planeswalker`, `static:global-attack-requirement`) — `attack-requirement`'s
  `target`, `controlledByTarget`, `attacks` (obeyed only by attacking that player or planeswalker,
  508.1d) and `duration` (this turn, that player's next turn, its controller's next turn or next
  combat phase); 3 freed. Alluring Siren, Taunt, Dulcet Sirens, Trench Behemoth, Imaginary
  Threats, Maximum Carnage.
- **Need-keys Phase 2: creatures in a blocking relation with the source** (2026-10-31;
  `effect:target-creature-blocking-source`, `effect:target-creature-source-is-blocking`,
  `effect:target-creature-blocking-attached`, `filter:blocked-by-source`,
  `filter:blocking-or-blocked-by-source`, `filter:blocking-specific-creature`,
  `effect:damage-each-creature-blocking-source`) — `CardFilter.blockingRelation` (blocking,
  blocked by or either, the source's or its host's; a source that left read off its last-known
  blocks, 608.2b; none once removed from combat, 506.4); 21 freed. Goblin Javelineer, Tinder Wall,
  Plasma Caster, Wall of Nets, Kjeldoran Frostbeast, Coils of the Medusa, Battle-Scarred Goblin.
- **Need-keys Phase 2: P/T scaled by a hand size or a life total; base power or toughness alone**
  (2026-10-31; `static:pt-per-cards-in-hand`, `static:pt-per-life-total`, `static:cda-life-total`,
  `effect:set-base-power-only`, `effect:set-base-toughness-only`) — `grantPtPerCount.cardsInHand`
  (`true`, `"opponents"`, `"affected-controller"`), `grantPtPerCount.lifeTotal`, the CDA count
  `"your-life-total"` (604.3), `animate`'s `power` and `toughness` each optional with
  `PtModifier.setPower` (613.4b); 17 freed. Grim Strider, Enemy of Enlightenment, Righteous
  Authority, Death's Shadow, Serra Avatar, Island of Wak-Wak, Turtle-Duck, Riptide Mangler,
  Chariot of the Sun, Wall of Tombstones.
- **Need-keys Phase 2: counters this way, and distributing counters** (2026-10-31; the two
  `effect:counters-…-this-way` keys, `effect:distribute-counters-among-chosen`,
  `effect:distribute-counters-variable-total`) — a player's counters among those removed (122.1),
  `removeCounter.count: "all"` as a cost whose count is X, `removeAllCountersFrom` as it enters
  (614.1c), `counters-distributed` among permanents chosen as it resolves (608.2d, through
  `choose-permanents` and `choose-number`); 12 freed. Fangs of Kalonia, Spectacular Showdown,
  Give // Take, Leeches, Catti-brie of Mithral Hall, Thief of Blood, Undercity Upheaval, Quirion
  Beastcaller, Broodlord, Vastwood Hydra, Feast of the Victorious Dead, Blessing of Frost.
- **Need-keys Phase 2: enlist, and who crewed what** (2026-10-31; `keyword:enlist`,
  `keyword:crewed-it-this-turn`, `trigger:crews-or-saddles`, `static:cant-crew`,
  `condition:crewed-by-this-turn` partly) — `StaticAbility.enlist` asked through
  `choose-permanents` after the attackers tap (702.154, 508.1), the pump a reflexive trigger, the
  `enlists` trigger and `enlistedThisCombat`; `GameObject.crewedThisTurn`, `crewedSource`,
  `crewedBy`, `crewedBySource`, the `crews-or-saddles` trigger and a `cant-crew` restriction
  (702.122d); four manual checks; 16 freed. Coalition Warbrute, Guardian of New Benalia, Aradesh,
  the Founder, Speedway Fanatic, Veteran Motorist, Reckless Velocitaur, Subterranean Schooner,
  Getaway Car, Balthier and Fran, Revoke Privileges.
- **Need-keys Phase 2: CardFilter clauses against a reference object** (2026-10-31; the
  shared-type group of `condition:filter-dynamic-compare` and the same-name group of
  `condition:filter-card-property-clauses`) — one `ShareReference` (the sacrificed permanent, the
  trigger object, the source, the enchanted creature, a chosen or linked-exiled card, a target
  slot, the permanents you control) for `sharesCardTypeWith`, `sharesPermanentTypeWith`,
  `sharesCreatureTypeWith` (through `hasSubtype`), the new `sharesLandTypeWith`, and
  `sameNameWith` (bound in an effect, read live in a static or trigger); 11 freed. Crown of
  Vigor, Crown of Ascension, Endemic Plague, Pyre of Heroes, Coward // Killer, Counterlash,
  Reality Scramble, Hiveheart Shaman, Ixalan's Binding, Exclusion Ritual, Cornered Market,
  Mitotic Manipulation, Pattern Matcher, Cylian Sunsinger.
- **Need-keys Phase 2: attach hosts, and statics granting statics** (2026-10-31;
  `effect:attach-extensions` partly and seven riders, `static:equip-only-to-filter`,
  `static:grant-static-ability`) — `attachedTo` on put-onto-battlefield, return, search and
  look-and-choose, naming a player (303.4) or `{ among }` chosen as it enters (303.4f/g, 301.5e);
  `attach` onto `"put-this-way"` or `ontoChosen`; static `attachOnlyTo` (301.5c);
  `StaticAbility.grantsStatic` (layer 6, 613.1f; the granted static works from its holder, 113.10);
  21 freed. One Last Job, Nomad Mythmaker, Bitterheart Witch, Arachnus Spinner, Academy
  Researchers, Pre-War Formalwear, Stonehewer Giant, Aura Graft, O-Naginata, Gate Smasher,
  Inspiring Leader, Criminal Past, Sedge Sliver, Cloudsteel Kirin, Rune of Might, Rune of Speed,
  Rune of Flight, Rune of Mortality.
- **Need-keys Phase 2: a random card from a hand or a linked exile, and the linked exile onto the
  battlefield** (2026-10-31; `effect:random-card-from-hand`, `effect:random-card-from-linked-exile`,
  `effect:put-exiled-with-source-onto-battlefield`, `effect:return-other-cards-exiled-with-source`,
  `effect:exile-graveyard-linked`) — `choose-random-card`'s `zone: "hand"` (revealed, 701.20a, or
  looked at alone) and `"exiled-with-source"` (607.2a) with a `slot` for the pick;
  `look-and-choose`'s `"exiled-with-source"`; `return-exiled-by-source`'s `under`, `others`,
  `filter`; `exile-graveyard`'s `linked`; ~15 freed. Cursed Scroll, Magus of the Scroll, Hired
  Torturer, Singe-Mind Ogre, Urza's Bauble, Skyship Weatherlight, Nautiloid Ship, Chaos Shrine's
  Black Crystal, Underworld Sentinel, Mirror of Life Trapping.
- **Need-keys Phase 2: flash permissions** (2026-10-31; `effect:flash-for-each-player`,
  `effect:first-creature-spell-flash`, `effect:flash-permission-this-turn`,
  `effect:next-sorcery-as-though-flash`) — `castAsThoughFlashAnyPlayer` (every player's, read
  from the permanent's controller's side), `castAsThoughFlashFirstEachTurn` (from
  `spellsCastThisTurnAs`), a player-effect's `castAsThoughFlash { filter?, next? }` (rule 601.3b;
  `next` spent by the next matching spell, `Game.spendNextSpellFlash`), and suspend reading every
  flash permission (702.62a); 3 freed. Vernal Equinox, Quick Sliver, Tidal Barracuda, Radagast of
  Rhosgobel, The Blue Spirit, Borne Upon a Wind, Emergence Zone, Winding Canyons, Alchemist's
  Refuge, Quicken, Progenitor's Icon.
- **Need-keys Phase 2: a library search's finds card by card** (2026-10-31; the five
  `effect:search-…` keys) — `search-library.instead`: the found cards chosen first, then a second
  `choose-from-zone` over them picks which go elsewhere — by a filter, a condition, the
  searcher's choice or a split of exactly one (609.3) — to the graveyard or under another's
  control; `withCounters` (122.6) and `who: "that-player"`; a manual check for Jarad's Orders; 5
  freed. Jarad's Orders, Dina's Guidance, Ruin in Their Wake, Guidelight Pathmaker, Rootweaver
  Druid, Neoform, Magmatic Hellkite, Vision Quest.
- **Need-keys Phase 2: cards a player owns, taken from exile** (2026-10-31;
  `cost:put-opponent-exiled-card-into-graveyard`, `effect:put-exiled-card-into-graveyard`,
  `effect:put-exiled-lands-under-your-control`) — `look-and-choose`'s `zone: "exile"` (an
  `ownedBy` filter, or `from` one player), `needsMin` (all of `min` or none), `this-way:
  "chosen"` (a processor's "if you do" under Rest in Peace), `AbilityCost.putFromExile` and
  `additionalCost.putFromExile`, a face-down exiled card taken from its pile at random (406.4,
  `exiledFaceDown.group`) and picked by its back in the client's zone viewer; 8 freed. Wasteland
  Strangler, Ulamog's Nullifier, Oblivion Sower, Memory Theft, Void Attendant, Processor Assault.
- **Need-keys Phase 2: casting abilities given to the spells you cast** (2026-10-31;
  `static:grant-convoke`, `static:grant-improvise`, `static:grant-prowl-to-spells`,
  `static:grant-undaunted-to-exiled-spell`) — `grantsToSpells`' `convoke`, `improvise` and
  `prowl`, convoke and improvise together in one payment, `firstEachTurn` at cast time, and
  `allow-cast-from-exile`'s `whileExiled` and `undaunted`; 9 freed. Chief Engineer, Inspiring
  Statuary, Hunting Velociraptor, Durnan of the Yawning Portal.
- **Need-keys Phase 2: graveyard cast permissions — other graveyards, and a card's own costs**
  (2026-10-31; `zone:graveyard-cast-permissions`, `zone:cast-from-any-graveyard`,
  `zone:cast-self-from-graveyard`, `zone:graveyard-self-cast-extra-cost`,
  `cost:self-graveyard-cast-cost-increase`, `cost:self-graveyard-cast-discard-cost`,
  `zone:graveyard-cast-exile-cost`) — a resolved permission over another player's graveyard
  (`whose`), for one spell (`once`), with any-color mana for it (`spendAs`, 609.4b) and
  `exileAfterwards`; one-shot grants on cards you don't own; `cast-now` from any graveyard; a
  card's own `castSelfFromGraveyard` with `GraveyardCastCosts` (life, discard, sacrifice, exile N
  of a kind, alternative mana, {1} more per card, or from exile); 20 freed. Whispersteel Dagger,
  Spectral Arcanist, Demonic Embrace, Raffine's Guidance, Helbrute, Risen Executioner, Squee, the
  Immortal.
- **Need-keys Phase 2: cost changes for one kind of ability** (2026-10-31;
  `cost:equip-ability-cost-reduction`, `cost:ability-cost-reduction-exhaust`,
  `static:cycling-cost-reduction`, `cost:loyalty-cost-increase`) — `abilityCostModification`'s
  `abilityKind` (equip, exhaust, cycling, loyalty), `byYou`, `targetingSource` (settled by the
  chosen targets, 601.2c) and `increaseLoyalty` (Carth's additional [+1], merged into one loyalty
  cost, 606.5); 7 freed. Bureau Headmaster, Bladehold War-Whip, Dwarven Mauler, Boom Scholar,
  Fluctuator, Eidolon of Obstruction, Carth the Lion.
- **Need-keys Phase 2: each permanent of a kind deals damage** (2026-10-31; the four
  `effect:each-…-damage` keys) — `each-deals-damage`: every matching permanent deals its power or
  N to itself, a target, the trigger's object or each opponent, each its own source (120.1), what
  each deals read before any is dealt (608.2h), as one damage event (enrage once); 8 freed. Solar
  Blaze, Wave of Reckoning, Moonlight Hunt, Bartz and Boko, Signature Slam, Alpha Brawl.
- **Need-keys Phase 2: face down by an effect** (2026-10-31; `mechanic:face-down` partly,
  `effect:turn-face-down`, `effect:put-onto-battlefield-face-down`,
  `effect:manifest-from-other-library`, `static:cant-turn-face-up`) — the `"effect"` face-down
  kind (rule 708.2a, turned face up only by a morph or disguise cost, 702.37e), `turn-face-down`
  (708.2b, 712.16), `faceDown` on `put-onto-battlefield` and look-and-choose's `enterAs` with the
  characteristics an effect lists (`FaceDownAs`, `cards/face-down.ts`), `manifest`'s `from`
  (another player's library, under the manifesting player, 110.2a), `cant-turn-face-up`; the
  client's "Face-down" label; 22 freed. Cyber Conversion, Yedora, Grave Gardener, Tezzeret, Cruel
  Machinist, Orochi Soul-Reaver, Unable to Scream.
- **Need-keys Phase 2: a divided total read as it's announced** (2026-10-31;
  `effect:divided-dynamic-total`, `effect:reflexive-divided-damage`) — `divided.total` any
  `EffectAmount` on spells, activated and triggered abilities, fixed as the division is announced
  (601.2d, 602.2b, 603.3d; a dies trigger's from last-known power, 608.2h), the group capped at
  one target per point; `ReflexiveTrigger.divided` (603.12); 8 freed. Volcanic Wind, Monstrous
  Onslaught, Lukka, Bound to Ruin, Ureni, the Song Unending, Orca, Siege Demon, Death to Our
  Enemies.
- **Need-keys Phase 2: the aggregate amount over any set** (2026-10-31; `effect:amount-aggregate`,
  `effect:aggregate-over-graveyard`, `effect:aggregate-of-target-players-permanents`,
  `effect:amount-graveyard-total-mana-value`, `effect:attack-batch-aggregates`,
  `amount:count-in-exile`, `effect:aggregate-all-counters`, `effect:aggregate-all-counters-for-target`,
  `amount:greatest-mana-value-this-way`; rules 608.2h, 614.12, 406.3a, 122.1). `AggregateSpec`
  reads its set through one `aggregateMatches` (`filter.ts`): `in` the battlefield, graveyards,
  exile (a face-down card matching only an owner-only filter) or `"attackers"` — the ones that
  counted for the `attacks-batch`/`attack-with` trigger that fired, kept as
  `LastKnownRefs.attackedTogether` and read as they are, or as they last were on the battlefield —
  a list of zones, and `plus` sets with filters of their own, each object once; `aggregate:
  "count"`; `of: "counters"` for every counter of every kind; an effect amount's `forTarget`. A
  count-scaled bonus's `grantPtPerCount.aggregate`; an entering replacement's graveyard half still
  sees a card entering from it. `thisWay`'s `greatestOf` ("the greatest mana value among the
  milled cards"). The scaffolder reads "+X/+0", "enters with X +1/+1 counters" and "~'s power is
  equal to" over greatest / total / count / counters phrases (Prime Speaker Zegana's "other" now
  authored as printed). 17 freed; proving cards Carrion Grub, Emissary Escort, Ambitious
  Dragonborn, Crackling Drake, Maester Seymour, Ferrafor, Young Yew, Shriekwood Devourer, Vulpine
  Harvester, Heretic's Punishment.

- **Need-keys Phase 2: a value chosen as it enters, read by its other lines** (2026-10-31;
  `filter:chosen-color`, `decision:choose-card-type-protection`,
  `static:chosen-creature-type-reads`, `static:chosen-type-in-addition`; rules 608.2h, 702.16b,
  c, e, 205.2a). The `ofChosenColor` filter clause — the colour chosen for the permanent applying
  it (its `chosenOnEnter`), read as it last was once it has left — in target slots, trigger
  filters and counts, and in "a source of your choice of the chosen color", whose prevention
  shield fixes the colour as it's made (`fixChosenColor`); Paradise Plume, Jeweled Torque, Prism
  Ring, Diamond Knight and Diamond Mare moved onto it from five conditional triggers. A static's
  `playerProtection` — "you have protection from …" by colour, card type or a filter read off its
  own permanent (`chosenName`): no targeting by a spell or ability source with the quality, no
  Aura with it (a Curse already there falls off), its damage prevented
  (`playerProtectionBlocks`). `chosenCardType` on `playerProtection` and `protection`, over
  `chooseOnEnter: CARD_TYPE_CHOICES`. An entering replacement's and `doubleTriggersOf`'s filters
  now read their own permanent as source ("of the chosen type"), and `doubleTriggersOf.others`.
  The scaffolder reads "choose a color / a card type", the lord, replacement, doubler, cast
  trigger, target, prevention and protection lines over them; `card:parse-check` pairs a
  line's statics one to one. `decision:choose-name-and-type-on-attach` (Psychic Paper) stays
  open. Pentarch Paladin, Curse of Wizardry, Story Circle, Serra's Emissary, Runed Halo, Metallic
  Mimic, Roaming Throne.
- **Need-keys Phase 2: "has all activated abilities of …"** (2026-10-31;
  `static:gain-abilities-from-graveyard`, `static:gain-activated-abilities-of-others`,
  `static:gain-other-planeswalkers-loyalty-abilities`, `static:gain-top-card-activated-abilities`,
  rules 613.1f, 613.8, 201.5b, 113.6, 606.3). A static's `grantsActivatedOf` — the activated
  abilities of the cards in graveyards matching a filter, of the top card of its controller's
  library, or of every other matching permanent with all it has (printed unless lost, its basic
  land types', granted ones), each with its source ref so it resolves as that card's text and
  names the object that has it. Several such statics apply one at a time in rule 613.8's order:
  one whose result another would change waits for it, a loop goes by timestamp. Abilities that
  work only from another zone aren't granted; identical ones fold into one unless a per-instance
  limit tells them apart. `except: "mana" | "loyalty"`, `only: "loyalty"`; a filter's
  `sameNameAsSource`; `spendManaAs.activating` — "this" (every ability of the permanent) or
  "granted" (only those its grant gives), with the ability now on an ability's mana purpose.
  `activatedGrantSources` is memoized per cache region. The scaffolder reads the graveyard,
  battlefield, loyalty and library-top phrasings and the two spending lines. 8 freed (Nicol
  Bolas, Dragon-God's +1, Scheming Fence's chosen permanent and Cairn Wanderer's keywords still
  to check). Proving cards: Necrotic Ooze, Thranduil, the Elvenking, Skill Borrower, Experiment
  Kraj, Marvin, Murderous Mimic, Sharkey, Tyrant of the Shire, Drana and Linvala.
- **Need-keys Phase 2: a spell's own conditional flash** (2026-10-31;
  `effect:self-flash-if-condition`, `effect:conditional-flash-by-target`,
  `effect:flash-if-targets-commander`, rules 601.3b, 601.3d, 601.6, 601.6a). `flashIf` on a card:
  a `condition` ("you may cast this spell as though it had flash if you control a Human", "this
  spell has flash as long as you control a Merfolk", spell mastery) read from the caster's side as
  the cast begins, or `targets` ("…if it targets a permanent you control / a commander"), one of
  the chosen targets matching — the cast offered if some choice could, refused if the targets
  chosen don't, and, when only that permission lets it be cast now, its one fitting slot offered
  only those targets. A flashback cast keeps it. The scaffolder reads the three phrasings (a
  permanent's "~ has flash as long as" left to a person: it's a battlefield keyword too). 10
  freed; Silver Scrutiny's "if X is 3 or less" still needs an X cap. Proving cards: Hungering Yeti,
  Crashing Tide, Swift Reckoning, Flash Photography, Timely Ward.
- **Need-keys Phase 2: energy paid in a chosen, fixed or computed amount** (2026-10-31;
  `cost:pay-any-amount-of-energy`, `cost:alternative-cost-for-spells-energy`,
  `cost:pay-variable-energy`, rules 107.14, 107.1c, 118.9, 601.3c). A `may`'s `costEnergyX` —
  "you may pay one or more {E}. If you do, …" (X from 1, declined with no energy) and "you may
  pay any amount of {E}. …" (X from 0, the effect applied whatever was paid, a decline paying 0) —
  asked on `choose-modes`' existing X, the offer's `xCost` marked `energy` with `minX`, X the
  amount paid and never the spell's own; `alternativeCostForSpells`' `energy` (offered while the
  caster has it) and `flash` ("if you cast a spell this way, you may cast it as though it had
  flash"); a `cast-now`'s `byPayingEnergy`. Jolted Awake's "an amount of {E} equal to that card's
  mana value" was Confiscation Coup's `costEnergy` already. The client's "you may pay" now has an
  X field (Leyline Tyrant's "any amount of {R}" had been sent as X 0). The scaffolder reads "you
  get {E}…" and the energy-amount templates. Proving cards: Harnessed Lightning, Die Young, Wrath
  of the Skies, Territorial Aetherkite, Nissa, Worldsoul Speaker, Primal Prayers, Amped Raptor,
  Jolted Awake; 15 freed.
- **Need-keys Phase 2: counters of chosen kinds removed** (2026-10-31;
  `cost:remove-any-counter-cost`, `effect:remove-counters-any-kind`, rule 122.1). Most of it was
  already there since B254 (the `remove-counters` decision, `removeCounter.kind: "any"`, the
  `remove-counters` effect's `counter: "any"`), unmarked; what was added: a target slot's
  `orPlayer` on the `permanent` spec ("…, or opponent" / "…, or player"); a `remove-counters`
  aimed at a player, their poison, energy, experience and rad counters asked kind by kind on
  `choose-modes` and taken off together; `anyController` for "from among permanents on the
  battlefield"; the bots' plain answer taking an opponent's best counters and its own worst. The
  scaffolder reads "remove (up to) N / any number of counters from target …", "you may remove a
  counter …", the "…, or opponent" slots and the "removed this way" pump and draw. Proving cards:
  Price of Betrayal, Eventide's Shadow, Hex Parasite, Glen Elendra Guardian; 12 freed.

- **Need-keys Phase 2: meld** (2026-10-31; `mechanic:meld`, rules 701.42, 712.4, 712.8g, 712.21).
  The `meld` effect — "if you both own and control ~ and a creature named X, exile them, then meld
  them into Y" — checks that test as it resolves, exiles both (one event), and puts two cards of
  Y's pair (`CardDefinition.meldOf`, the combined back face, never a deck card) onto the
  battlefield as one new object: `GameObject.melded`, whose face (`faceName`) is Y from the moment
  it enters, its mana value the fronts' summed (202.3c; a copy's 0), the commander card the object
  if either is (903.3b). A token, a copy or a card of another pair stays in exile (701.42c).
  Several counterparts are asked on the existing `choose-permanents`. The `meld-ready` condition is
  a trigger's intervening if. Leaving, it is one permanent and two cards (712.21); `leftWith`
  names the other cards a merged or melded permanent became, which a blink, an O-Ring's exile, an
  "until it leaves" or a "with this" exile now finds too, and a library placement moves beside it
  (730.3c and the meld ruling; mutate's components gained this too). The scaffolder reads both
  meld templates and writes `meldOf` on a back face. 11 freed; proving cards Graf Rats, Chittering
  Host, Hanweir Battlements, Hanweir, the Writhing Township.
- **Need-keys Phase 2: loyalty-x** (2026-10-31; `cost:loyalty-x`, rules 606.4, 606.6, 107.3a).
  `ActivatedAbility.loyaltyCost: "-x"` is a "−X" cost: X is announced as it's activated on the
  activation's existing `xValue`, offered as `xCost` from 0 to the loyalty counters the source
  has (606.6), and that many are removed (`loyaltyDelta`, the `counter-removed` event too); the
  ability's X is that value (107.3k), read as `amount: "x"` or a filter's `n: "x"`. The offer's
  `loyalty` says `"-x"`; the client's X prompt needed nothing. v2's candidates are each X from 1
  up (X at the most spends the planeswalker); v1 keeps one counter. "+X" has no card yet. The
  scaffolder reads "−X:" lines. 12 freed; proving cards Chandra Nalaar, Chandra, Flamecaller,
  Tezzeret the Seeker.
- **Need-keys Phase 2: choices by other players** (2026-10-31; `effect:choices-by-other-players`'
  top group — `decision:opponent-chooses-target`, `decision:opponent-chooses-mode`,
  `effect:opponent-chooses-among-targets`). The `choose-among-targets` effect: as a spell
  resolves, a player (`"their-controller"` of the targets, or an opponent through
  `choose-opponent`) picks `count` of its still-legal targets (608.2b) — all of them, unasked,
  with no more than that — on the existing `choose-permanents` (battlefield) or `choose-from-zone`
  (a graveyard's, its new `keepChoice` and `prompt`), and the chosen and the rest each take a
  `PileFate`. `CardDefinition.opponentChoosesTargets` / `ActivatedAbility.opponentChoosesTargets`
  (rule 601.2c): offers come once per opponent who could choose (`otherChooser`), the caster's
  own slots only; the cast or activation waits on that opponent's `choose-targets` (an
  `OtherChoiceAsk` continuation, `targetsFor` the caster), then goes on whole or is reversed
  (rule 733.1) — a `cast-now` cast (cascade) too; a filter's `controlledBy: "chooser"` is "they
  control", checked again on resolution through the spell's `otherChooser`. `castModal.chosenBy:
  "opponent"` (rule 700.2e): the opponent answers `choose-modes` as it's cast and is "that
  player" of the modes; `add-counter-all`'s `controlledByPlayer`. The client echoes
  `otherChooser`, labels "(Bob chooses)" and logs the request; the spell is shown while they
  choose. Not yet: a trigger's "of an opponent's choice", Mogg Assassin's "that opponent", targets
  chosen after an opponent's mode (Fatal Lore). The scaffolder reads the three shapes and "gain
  control of target …". 7 freed; proving cards Incriminate, Barrin's Spite, Retribution, Wake to
  Slaughter, Evangelize, Volcanic Offering, Magus of the Arena, Library of Lat-Nam, Misfortune.
- **Need-keys Phase 2: assist** (2026-10-31; `mechanic:assist`, rule 702.132a). A card's
  `assist: true`; its cast offers come again once per other player whose mana could pay some of
  it (`assist`, `assistMax`), judged as though that player paid all they could, an `{X}` spell's
  X reaching further. A cast with `assist` raises that player's `choose-number` (0 to the most
  their mana pays of the total cost's generic — increases and reductions included, the
  rulings), the spell shown to everyone meanwhile; their answer resumes the cast, their mana
  paid first and counted as spent on it (colours, sources, expend), or reverses it whole when
  the caster can't pay the rest (rule 733.1, the caster keeping priority, 733.2). The client
  labels the variant "(assist: Bob may pay up to N)" and the log says who offered what. Bots
  never ask; v1 offers nothing, v2 searches the amounts. Not on a `cast-now` cast (Engine rules
  gaps). The scaffolder reads the keyword. 16 freed; proving cards Charging Binox, Gang Up, Out
  of Bounds.
- **Need-keys Phase 2: the turn history's graveyard tallies** (2026-10-31;
  `stat:cards-discarded-this-turn`, `stat:cards-library-to-graveyard-this-turn`,
  `stat:cards-put-into-graveyard-this-turn`,
  `stat:permanents-to-graveyard-from-battlefield-this-turn`). `TurnHistory` gains `discarded`
  (every card a player discarded, a madness card's discard into exile too — rule 702.35a) and
  `to-graveyard` (everything put into a player's graveyard, each with its origin zone: cards from
  any zone off the graveyard event, permanents and tokens from the battlefield off the leave event
  with their stint, so a filter reads them as they last existed there — 603.10a). The
  `turnHistory` amount and the `turn-history` condition take `from` / `notFrom`, the amount a
  player `target` slot. The `discardedThisTurn` filter is a card discarded this turn and unmoved
  since, kept through a declined madness card's exile-to-graveyard move (Shadow of the Grave's
  ruling). The scaffolder reads the lines. 10 freed; proving cards Change of Fortune, Gilt-Blade
  Prowler, Recalibrate, Cruel Calculations, Fraying Sanity, Structural Assault, Ichor Shade,
  Shadow of the Grave.
- **Need-keys Phase 2: can't-do effects for a duration** (2026-10-31;
  `effect:cant-be-regenerated-this-turn`, `effect:cant-become-monarch-this-turn`,
  `effect:target-player-becomes-monarch`, `effect:cant-activate-abilities-until-next-turn`).
  `prohibit`'s `regeneration` keeps a creature's regeneration shields from applying for the
  turn (rule 701.19c) — on a target, or with `dealtDamageThisWay` on every creature the
  resolution dealt damage to; `monarch` is "you can't become the monarch this turn" (a
  departing monarch's title passes to the next player who can, 725.4); `become-monarch` takes a
  target player; a target's abilities prohibition can last `until-your-next-turn`; a prevention
  replacement's `thenCountsUnprevented` still puts "that many" counters on for unpreventable
  damage (615.12). The scaffolder reads the lines (and Earthquake's "each creature without
  flying and each player"). 14 freed; proving cards Incinerate, Flamebreak, Disintegrate, Jared
  Carthalion, True Heir, Mythos of Vadrok. `effect:cant-phase-out` stays open.
- **Need-keys Phase 2: removing counters in bulk** (2026-10-31; `effect:remove-all-counters`,
  `effect:remove-counters-all`). `remove-counter`'s `amount: "all"` takes every counter of its
  kind off one permanent, and with `counter: "any"` every kind ("remove all counters from
  target permanent"); `remove-counter-all` does either, or a number, to every permanent
  matching a filter, read before any counter comes off ("remove all fate counters from all
  permanents", "remove two loyalty counters from each planeswalker"). A token stack loses them
  together, one `counter-removed` with its `tokens`, so "counters removed this way" counts
  each token's. The scaffolder reads all of them. 11 freed (Relic Amulet still needs
  `cost:remove-all-counters`); proving cards Vampire Hexmage, Blitz Leech, Enchanted River's
  Grasp, Oblivion Stone, Aether Snap, Pestilent Haze.
- **Need-keys Phase 2: revealing cards from your hand as a cost** (2026-10-30;
  `cost:additional-cost-reveal`). A `BeholdSpec` with `fromHand` and no `exile` reveals from
  the hand (rule 701.20a, the `"reveal"` destination, the cards staying there): Lorwyn's
  "reveal a Kithkin card from your hand or pay {3}" as an `additionalCost.options` branch; the
  kicker `keyword: "reveal"` with `orControls` — Dragons of Tarkir's "if you revealed a Dragon
  card or controlled a Dragon as you cast this spell", a cast kicked by control marked
  `kickedByControl` so a copy doesn't get it; the activated cost `AbilityCost.reveal` ("Reveal
  X white cards from your hand", X capped by the matches). The client's reveal prompt names the
  count; the scaffolder reads all three, and "~ deals N damage to that creature's controller".
  9 freed; proving cards Goldmeadow Stalwart, Silvergill Adept, Draconic Roar, Orator of
  Ojutai, Scaleguard Sentinels, Martyr of Sands, Martyr of Spores, Martyr of Ashes.
- **Need-keys Phase 2: combat damage as though unblocked** (2026-10-30;
  `static:assign-damage-as-though-unblocked`). The static `assignAsThoughUnblocked` and the
  `assign-as-though-unblocked` effect (`target`, or `filter` as a rule for the turn;
  `optional`, else mandatory), read by `unblockedAssignmentOf`; a blocked attacker that may is
  always asked on `assign-combat-damage` (`mayUnblocked`, the answer's `asThoughUnblocked`: all
  of it to what it's attacking, rule 510.1b), under banding first and alone (`unblockedOnly`);
  a blocked creature with no blocker left and no trample may now answer "nothing" (510.1c);
  the `blocked` filter; the bots' `damageThrough` and `prefersUnblocked`; the client's "All to
  [defender]" button and a banding yes/no bar; two manual checks; the scaffolder taught. 11
  freed (queued: 480), 5 proving cards: Thorn Elemental, Indomitable Might, Siege Behemoth,
  Outmaneuver, Predatory Focus.
- **Need-keys Phase 2: a mode chosen more than once, and shuffling zones into a library**
  (2026-10-30; `effect:modal-repeat-modes` and `effect:mode-not-chosen-this-turn`, then
  `effect:shuffle-library`'s top unit — `effect:shuffle-hand-and-graveyard-into-library`,
  `effect:shuffle-hand-draw-that-many`, `effect:shuffle-hand-and-permanents-draw-that-many`,
  `effect:shuffle-permanents-owned-into-library`). `castModal.repeatModes` (rule 700.2d: the
  cast's modes may repeat, each copy with its own target slots), read by the offer, target-count
  bounds, the bots' candidates (`modeChoicesBetween`), the drivers (`fillModes`) and the
  client's mode picker (a click adds a copy, "×N", Clear); `shuffle-graveyard-into-library`'s
  `zones` (hand, graveyard, permanents owned, in one move — rule 701.24a) and `drawThatMany`;
  Whirlpool Rider and Drake moved to it; run-check's `click:` tries the decision bar first; two
  manual checks; the scaffolder taught both. 30 freed (all queued: 469), 6 proving cards: Fiery
  Confluence, Mystic Confluence, Kimoyo Beads, Timetwister, Winds of Change, Whirlpool Warrior.
- **Need-keys Phase 2: block minimums, "all must block" and one-blocker requirements**
  (2026-10-30; `static:combat-restriction-extensions`' top two units, 8 keys —
  `static:cant-be-blocked-except-by-n`, `static:cant-be-blocked-unless-all-block`,
  `static:cant-be-blocked-unless-defender-controls-shared-type`,
  `effect:target-cant-block-source-this-turn`, `static:must-block-each-combat`, and three
  already built and only marked: `static:blockable-only-by-filter`,
  `static:unblockable-defending-player-condition`, `effect:target-must-block-source-this-turn`).
  `blockedByAtLeast` (menace's 702.111b generalised: the offer's `minBlockers`,
  `leastBlockers` in every `combat/blocking.ts` plan), `blockedOnlyByAll` and the
  `blocked-by-all` violation, the `controls` condition's `sharingACreatureType`, a `{ countOf }`
  block-filter amount, `restrict`'s `cantBlockAttacker`, the `"must-block"` restriction; the
  client's block bar names the new violations; the scaffolder taught. 32 freed (18 queued for
  `author-freed`), 14 proving cards: Troll of Khazad-dûm, Pathrazer of Ulamog, Sonorous
  Howlbonder, Neurok Spy, Hazy Homunculus, Graxiplon, Tromokratis, Kraken of the Straits,
  Gingerbrute, Kozilek's Pathfinder, Auriok Siege Sled, Razorgrass Screen, Iron Golem, Grand
  Melee.
- **Need-keys Phase 2: distinct values and player-sided counts** (2026-10-30;
  `effect:amount-new-variants`' top five units, 20 keys — `effect:count-distinct-mana-values`,
  `effect:count-distinct-powers`, `effect:distinct-names-count`, `effect:count-subtypes-among`,
  `effect:amount-color-pairs`, `effect:permanent-types-in-graveyard`,
  `effect:count-in-target-player-graveyard`, `effect:count-equipment-attached-to-source`,
  `effect:players-controlling-more-amount` and eleven already covered by `countOf`'s player
  references). `aggregate: "distinct"` with `in: "graveyards"`, read by amounts, `aggregate`
  conditions, cost reductions and a CDA's `CountSpec`; an activated ability's conditional
  `costReduction`; `countInGraveyard`'s `forTarget`/`forPlayer`; `CardFilter.isSource`;
  `countPlayers`' `where`; the scaffolder taught. 70 freed (57 queued for `author-freed`), 13
  proving cards: Lunar Insight, Golden Ratio, Aven Heartstabber, Sewer Crocodile, Awakened
  Amalgam, Corpse Augur, Roiling Terrain, Goblin Gaveleer, Kemba, Kha Regent, Oreskos Explorer,
  Priest of the Blessed Graf, Terra Ravager, Treacherous Terrain.
- **Need-keys Phase 2: a value chosen as it resolves** (2026-10-30, e8d996e60;
  `decision:choose-color-on-resolution`, `decision:choose-number-on-resolution`,
  `decision:choose-card-type`, `amount:revealed-hand-cards-of-chosen-type`,
  `decision:choose-counter-kind`, `effect:remove-counter-chosen-kind`). `choose-value`: a
  colour, a card type, a kind of counter on a target or a matching permanent, or a number chosen
  as the effect resolves, `then` run with it; the `choose-number` decision (the 31st kind, a
  stepper in the client's banner); `reveal-hand`; the whole resolution carried across the
  choice. 7 proving cards, 15 cards freed for `author-freed`.
- **Need-keys Phase 2: skipping steps** (2026-10-30, fda0164a5; `static:skip-untap-step`,
  `static:skip-draw-step`, `static:skip-step`, `effect:skip-next-draw-step`). A static's
  `skipsSteps` (untap, upkeep, draw; you, opponents or each player, timed by `condition`) and the
  one-shot `skip-step` (the next one, or this turn's); a skipped upkeep or draw step is passed in
  `Game.enterStep` as though it didn't exist (rules 500.11, 614.10), and a static's skip leaves a
  "next" one waiting (614.10a). 7 proving cards, 13 cards freed for `author-freed`.
- **Need-keys Phase 2: damage prevented to and by a target, marked built** (2026-10-30,
  e96d12c3f; `effect:prevent-combat-damage-to-and-by-target`,
  `replacement:prevent-damage-by-target-this-turn`, `replacement:prevent-damage-to-other-filter`).
  No engine code: the keys predate B250's `damage-rule` and static prevention, which run them; the
  scaffolder learned their lines. 4 proving cards, 15 cards freed.
- **Need-keys Phase 2: player-state conditions on another player** (2026-10-30, b9325a20a and
  c8e45c3db; `condition:player-state-thresholds`, `condition:defending-player-controls`). A
  `StaticCondition` `of-player` reads any condition with another player as its "you" — "that
  player" (passed to intervening-ifs as they trigger now, not only as they resolve), the active
  player, a target, the defending player (rule 802.2a); `player-compare` (more / fewer / the most
  against each or an opponent); `for-each-player`'s `whoIf` ("each player who …", fixed before
  anyone acts); `life-total`'s `{ startingPlus }`; `controls`' `anyController`; `monarch`
  `"nobody"`. 16 keys, 14 proving cards, 71 cards freed for `author-freed`.
- **Need-keys Phase 2: cards outside the game, with a real sideboard** (2026-10-30,
  5f8009a13 and 367433891; `mechanic:outside-the-game`). Decks bring a sideboard
  (`DeckList.sideboard`, rule 100.4; at most 15, 100.4a; none in a Commander game, 903.5e), kept
  as `zone: "outside"` objects only their owner sees; `search-library`'s `outside` and
  `faceUpExile` are the wishes (rule 701.23j); `learn()` is rule 701.48a whole, its Lesson from
  the sideboard. The wire, the import's `Sideboard` section and `SB:` lines, the deck editor's
  Sideboard section, the player panel's "sideboard N" and the builder's `"sideboard"` zone carry
  it; four manual checks. 16 freed for `author-freed`; proving cards Burning Wish, Living Wish,
  Coax from the Blind Eternities, Mastermind's Acquisition, Legion Angel.
- **Need-keys Phase 2: another player's library, features only** (2026-10-30, 3c66633ad;
  `effect:look-and-choose-target-opponent-library`, `effect:look-and-choose-target-player`,
  `effect:reveal-top-opponent-library-you-choose-to-graveyard`). `look-and-choose`'s `from`
  (another player's library, the effect's controller looking and choosing), a `"graveyard"`
  destination and `leftover: "top-any-order"`; the scaffolder reads "look at the top N cards of
  target player's library, then put them back in any order". 15 freed for `author-freed`; proving
  cards Architects of Will, Draugr Thought-Thief, Cruel Fate, Sealed Fate, Balshan Beguiler.
- **Need-keys Phase 2: filtered discards, features only** (2026-10-30, 21b12cf01;
  `effect:discard-all-matching`, `effect:discard-any-number-filtered`, `effect:discard-filtered`).
  `discard`'s `filter` ("discard a creature card", with `anyNumber` "any number of land cards"),
  `discard-hand`'s `filter`, `reveal` and target-slot `who` ("reveals their hand and discards all
  nonland cards"); the scaffolder reads all three lines. 15 freed for `author-freed`; proving
  cards Amnesia, Trapfinder's Trick, Shatter Assumptions, Hidden Horror, Pack Guardian, Nantuko
  Cultivator, Mind Maggots.
- **Need-keys Phase 2: the chosen creature, and choices by another player, features only**
  (2026-10-30; `decision:choose-permanent`, `decision:as-enters-choose-permanent`,
  `decision:choose-permanents-exclude-trigger-object`, `decision:that-player-chooses-permanent`).
  "As this enters, choose another creature you control" (rule 614.1c) as
  `choosePermanentOnEnter`, kept with its stint as `GameObject.chosenPermanent` and read by
  the `"chosen"` target ref and a static's `{ scope: "chosen" }` (rules 607.2d, 400.7), with
  `attach` and `counter` for what the choice does as it enters; `choose-permanents`'
  `chooser`, an amount `min` and `exceptTriggerObject`; `sharesPermanentTypeWith` (rule
  110.4); the search bot's candidates for a forced pick; the view naming the chosen permanent;
  the scaffolder's templates. Tyrannical Pitlord, Dauntless Bodyguard, Grifter's Blade,
  Phylactery Lich, Sunken Hope, Tangle Wire, Crashing Boars, Saw and Cloudstone Curio authored
  to prove it. 204 freed cards wait for `author-freed`.
- **Need-keys Phase 2: counts for one player, and its controller as the player, features
  only** (2026-10-29; `amount:count-for-chosen-player`, `amount:count-for-controller-of-target`,
  `amount:count-per-player`, `amount:count-that-player-controls`,
  `effect:discard-controller-of-target`, `effect:draw-controller-of-target`,
  `effect:player-counters-controller-of-target`). A `countOf`'s `forPlayer` (the chosen player,
  a target's controller, the trigger's player), `countInGraveyard`'s `forEachPlayer`,
  `forChosenPlayer` on `setBasePtFromCount` and `grantPtPerCount` (and the latter's
  `cardsInHand`), and `{ controllerOfTarget }` as `draw`'s, `discard`'s and
  `add-player-counters`' player; the scaffolder's templates. Lost Order of Jarkeld, Entropic
  Specter, Nyxathid, Weight of Spires, Emissary of Hope, Typhoon, Nature's Resurgence,
  Assassin's Strike, Call to Heel and Pistus Strike authored to prove it. 188 freed cards wait
  for `author-freed`.
- **Need-keys Phase 2: the chosen player, features only** (2026-10-29;
  `decision:choose-player`, `effect:choose-opponent-most-life`,
  `static:attacking-chosen-player-anthem`, `trigger:chosen-player-upkeep`). "As this enters,
  choose a player / an opponent" (rule 614.1c) and `choose-opponent { remember }` kept as
  `GameObject.chosenPlayer`, read by the `"chosen-player"` scope, step trigger subject,
  `maxHandSize` and `attackingChosenPlayer` filter; `choose-opponent`'s non-random `anyPlayer`
  and `mostLife`; the chosen player flagged on the tile and named in the log; the bots aim a
  player choice at the opponent with the most life; the scaffolder's templates. Black Vise, The
  Rack, Cursed Rack, Saskia the Unyielding, Triarch Stalker, Beckoning Will-o'-Wisp and The
  Master, Gallifrey's End authored to prove it. 10 freed cards wait for `author-freed`.
- **Need-keys Phase 2: separating into two piles, features only** (2026-10-29, `5050664c6`;
  `decision:separate-into-piles`). Rule 700.3 as the `separate-into-piles` effect and the
  `separate-piles` / `choose-pile` decisions (face-down piles, permanents token by token, each
  pile's fate a zone or an effect), a pile popup and board piles in the client, the scaffolder's
  templates; Fact or Fiction, Curator of Destinies, Liliana of the Veil and Death or Glory authored
  to prove it. 20 freed cards wait for `author-freed`.
- **Need-keys Phase 2, five families built features-only: damage by this source, power/toughness
  switches, restrictions on the defending player, other players' choices** (2026-10-29,
  `9f9770204`, `5d7521fdd`, `baa99e72e`; `trigger:dies-after-dealt-damage-by-source`,
  `filter:damaged-this-turn-by-source`, `effect:switch-pt`,
  `static:attack-restriction-defending-player-condition`, `effect:target-player-exiles-from-hand`,
  `effect:player-exiles-chosen-from-hand`, `effect:target-opponent-chooses`,
  `effect:each-opponent-exiles-choice`, `effect:target-player-hand-card-to-library-top`,
  `effect:exile-chosen-from-revealed-hand`, `effect:put-from-opponent-hand-onto-battlefield`,
  `target:chosen-by-other-player`, `decision:trigger-object-controller-chooses-target`): the
  `damagedThisTurnBy` source by stint, `switch-pt` in layer 7d, `cantAttackUnlessDefender` and
  kin, a target slot's player as chooser, `discard-chosen`'s `destination`, `targetsChosenBy`.
  Sengir Vampire, Thought-Knot Seer, Tidehollow Sculler, Twisted Image, Sea Serpent, Imperial
  Edict, Erithizon and 9 more as proving cards; 125 freed cards left for `author-freed`.

- **Need-keys Phase 2, four families in one batch: counters removed by choice, modal activated
  abilities, an Aura's lock on its host, counts in fixed fields** (2026-10-29, B254, `8fffb2969`,
  `ed61cbdb5`, `702053837`; `cost:remove-counters-from-chosen`,
  `cost:remove-counter-from-other-permanent-or-suspended-card`, `cost:remove-counter-any-kind`,
  `effect:remove-counters-up-to`, `effect:modal-activated-targeted-modes`,
  `effect:modal-activated-ability`, `static:attached-activated-abilities-prohibited`,
  `static:prohibit-tap-abilities-of-attached`, `effect:prohibit-source-of-countered-ability`,
  `effect:sacrifice-amount`, `effect:put-on-library-dynamic-position`,
  `effect:manifest-count-amount`, `effect:may-pay-x-capped`): the `remove-counters` decision (the
  28th kind) behind a chosen counter cost (rules 602.2b, 601.2h, 118.3) and the `remove-counters`
  effect, with `thisWay: "counters-removed"` and a board-picked client prompt; modal activated
  abilities chosen as they're activated (700.2b), one offer per mode set; `hostOfSource`,
  `onlyTapAbilities`, `counter`'s `lockSource`; `countOf`'s `forEachPlayer` with a per-player
  sacrifice count, `half`'s `fraction`, `beneathTop`, `manifest`'s count, `may`'s `maxX`. The
  scaffolder reads the counter costs, modal activated abilities and the Aura line (21 cards
  auto-finished). 112 authored — Umezawa's Jitte, Ghave, Koma, Breya, Smokestack, Death Cloud,
  Zodiark and 105 more; 26 blocked, 17 of them on other open keys (`B254.json`).

- **Need-keys Phase 2, four families in one batch: granted statics, land-type setting, the basic
  land type of your choice, exchanging control** (2026-10-29, B253, `20720979f`, `ed562eef4`;
  `effect:grant-static-to-permanent`, `effect:cant-be-blocked-by-filter-until-eot`,
  `static:land-type-setting`, `static:choose-basic-land-type`,
  `decision:choose-land-type-on-resolution`, `effect:set-land-type`, `effect:become-basic-land-type`,
  `effect:exchange-control`, `effect:exchange-control-all-with-target-opponent`,
  `effect:gain-control-all-target-player`, `effect:grant-keyword-all-target-player`): the
  `grant-static` effect; `restrict`'s `cantBeBlockedBy` and `CardFilter.not`; rule 305.7 (a land
  set to a basic type loses its rules-text abilities, keeps granted ones, enters with none of its
  own entering abilities) with the 613.8a dependency of a land's own type-setter and of a setter
  scoped by subtype on a later one; `setsChosenLandType`; `choose-creature-type`'s fixed `options`;
  `exchange-control` (701.12) and `exchange-control-all`. Blood Moon, Magus of the Moon, Spreading
  Seas, Reins of Power, Switcheroo, Gilt-Leaf Archdruid and 84 more; 31 still blocked (`B253.json`).
- **Jeska's Will and Akroma's Will** (2026-10-28, B252): their "if you control a commander as you
  cast this spell, you may choose both" was `castModal.maxModesIf` all along, but
  `effect:commander-conditional-mode-count` was never added to `built`, so both still read as blocked
  (the user spotted it). Built for Jeska's: `cardsInHand: { target: n }`, a target player's hand
  size for an effect that doesn't act on them.
- **Need-keys Phase 2, three families in one batch: each player chooses then all act, shared-graveyard
  targets, repeat this process** (2026-10-28, B251, `43de311f2`, `382cdf3b9`, `b53475d57`;
  `effect:hidden-simultaneous-choices`, `effect:each-player-chooses-then-all-act`,
  `effect:each-player-chooses-in-turn-order`, `effect:each-player-chooses-creature-type`,
  `effect:each-player-chooses-counters-then-goad`, `effect:targets-from-single-graveyard`,
  `effect:target-in-that-players-graveyard`, `effect:targets-from-target-players-graveyard`,
  `effect:targets-same-controller`, `effect:repeat-process`, `effect:repeat-effect-x-times`): rule
  101.4's choose-then-act beyond `each-player-may` — a scoped discard held face down until all have
  chosen, a card put from a hand or graveyard by an `each-player-may` held and entering with the
  others; "each player chooses" as a `vote` with `choose` (no extra votes, no voting triggers, a
  creature type, a permanent from the chooser's side) and `with-choices`; the `sameController` target
  relation ("from a single graveyard", "from their graveyard", "that player controls", 608.2b);
  `repeat` (times, a condition over the pass just done, "you may repeat"); `return-from-graveyard`'s
  `each-graveyard`, `shuffle-library`'s target, the `target-legal` condition; and a fix — a modal
  spell's later mode read its slot relations against the first mode's slots. The needs tool's built
  dates now come from the `built` array alone. 81 cards: Show and Tell, Ad Nauseam, Smallpox,
  Patriarch's Bidding, Harsh Mercy, Quandrix Command, Goblin Welder, Torment of Hailfire, Primal Surge,
  Decompose and the rest; 27 still blocked (`B251.json`).
- **Need-keys Phase 2, the damage-modification family: damage prevention and redirection**
  (2026-10-28, B250, `5832089cb`, `6e32eb60c`; `replacement:damage-redirection`,
  `replacement:redirect-next-damage-event`, the prevent-all-damage and prevent-combat-damage filter
  keys, the prevention-follow-up keys, the computed-amount keys, the attached keys, the by-source
  keys, `effect:damage-cant-be-prevented`, `static:damage-cant-be-prevented`,
  `effect:prevent-combat-damage-by-target` — 33 in all): static `would-deal-damage` replacements
  naming an Aura's or Equipment's host, "you and your permanents", redirecting all of it (614.9,
  once per event — 614.5) and preventing N / all but N / half (615.10); damage that can't be
  prevented (615.12) as a damage option, a turn effect and a static; `damage-rule`, one-shot
  prevention or redirection over recipient and source scopes for a duration with prevention's
  follow-up (615.5); a next-time shield covering the whole simultaneous event (615.8); scaffolder
  templates. 148 cards: Questing Beast, Comeuppance, Leyline of Punishment, Maze of Ith, Palisade
  Giant, Pariah, Inkshield, Dovin, Hand of Control, Kor Haven and the rest; 65 still blocked
  (`B250.json`).
- **Need-keys Phase 2, three families in one batch: a static loss of all abilities, block limits,
  type-setting effects** (2026-10-28, B249, `28c4865b9`, `91204a4d1`;
  `static:static-lose-all-abilities`, `static:static-loses-all-abilities`,
  `static:static-set-characteristics`, `static:set-characteristics-aura`,
  `effect:block-any-number-this-turn`, `static:block-additional-creature`,
  `static:can-block-any-number`, `effect:set-creature-type`, `effect:set-types-temporary`):
  `StaticAbility.loseAllAbilities` (layer 6) read by every "has it lost its abilities" check,
  in dependency order (613.8) with what the same static grants kept (613.7) and an applied loss
  keeping its other parts (613.6), and a permanent entering under one without its own entering
  abilities (614.12); static `addColors`, `setsChosenColor`, `loseLandTypes`; `blockAdditional`
  (static and effect, 509.1a) with the blockers offer's `maxBlocks`, the damage divided (510.1d)
  and the client's block builder taking a blocker up again; `add-types`' `setTypes` /
  `setSubtypes` (205.1a) and `choose-creature-type`'s `exclude`; scaffolder templates. 98 cards:
  Humility, Imprisoned in the Moon, Kenrith's Transformation, Frogify, Darksteel Mutation,
  Two-Headed Giant of Foriys, Hundred-Handed One, the Mistforms and the rest; 22 still blocked
  (`B249.json`).
- **Need-keys Phase 2, the search-opponent-library family** (2026-10-28, B248,
  `effect:search-opponent-library` + `effect:extract-same-name`): `search-library`'s `whose` — a
  player target, a target's controller or owner, the trigger player — with the searcher deciding,
  the library's owner shuffling and battlefield finds entering under the searcher's control;
  `zones: "graveyard-hand-library"` (the hand shown to the searcher); `all` (rule 701.23b: the
  graveyard's matches taken, the hidden zones' optional); exile destinations, face down with
  `playable` (Praetor's Grasp), and `"stay"` for a cast from the library (Knowledge
  Exploitation); `then` over the finds with the searched player as "that player". Also the
  `exiled-from-hand` this-way kind, the `sameNameAsThisWay` filter, `EffectPlayerRef`'s
  `ownerOfTarget`, a countered spell's controller kept as it leaves the stack (Counterbore's
  ruling), the `target` condition's `now`, the bots' denial picks from another player's zones,
  the client's prompt titles; scaffolder templates. 39 cards: Praetor's Grasp, Bribery, Surgical
  Extraction, Memoricide, Slaughter Games, Extirpate, Hide // Seek and the rest; 9 still blocked
  (`B248.json`).
- **Need-keys Phase 2, the banding family** (2026-10-28, B247, `keyword:banding`): rule 702.22
  whole, in `combat/banding.ts` — bands declared with the attack (`AttackerDeclaration.band`,
  banding and up to one without, or creatures of a quality one "bands with other" of, one
  defender), blocked as one (a blocker of a member blocks the band: `GameObject.blockingAlso`,
  "whenever ~ blocks" still once), a blocker dividing its damage among the band (510.1d), and the
  other side dividing combat damage when banding is among the creatures blocking or blocked
  (702.22j-k: `assign-combat-damage`'s `forOpponent`, defaulting to killing as little as it can);
  the `banding` and `bands-with-other` keywords, the `bandsWithOther` static, the
  `bandedWithSource` filter; the client's band builder ("Band…") and "Banding: you divide" prompt;
  scaffolder templates. 44 cards: Benalish Hero, Master of the Hunt, the five Legends lands,
  Icatian Skirmishers, Urza's Engine, Camel, Kjeldoran Skyknight and the rest; 2 still blocked
  (`B247.json`).
- **Need-keys Phase 2, the choose-card-name family** (2026-10-28, B246, `decision:choose-card-name`):
  rule 201.4's choice as a new decision kind (the 27th), asked as a permanent enters
  (`chooseCardNameOnEnter`, with a look at an opponent's hand or each opponent's revealed hand
  first) or as a spell or ability resolves (the `choose-card-name` effect, `CHOSEN_CARD_NAME` in
  its `then`, `remember` to keep it, `chooser` for "target player chooses"); `chosenNames` on a
  permanent; the filter clauses `hasName` (both halves of a split card) and `chosenName`;
  `prohibits` with `exceptManaAbilities`, `anyZone` and `lands`; a `player-effect`'s `cantCast`
  and `reduceSpells.allCasters`; cost statics for an enchanted player and for sources in every
  zone, cycling's cost included; a cast prohibition judged on the half being cast (rule 709.3);
  the client's searchable card-name picker; scaffolder templates. 26 cards: Pithing Needle,
  Phyrexian Revoker, Meddling Mage, Sorcerous Spyglass, Voidstone Gargoyle, Disruptor Flute,
  Council of the Absolute, Gideon's Intervention, Declaration of Naught and the rest; 27 still
  blocked on narrow keys (`B246.json`).
- **Need-keys Phase 2, the variable-target-count family** (2026-10-28, B245,
  `decision:variable-target-count` + `decision:x-targets` + `decision:target-total-mana-value` +
  `decision:any-number-targets-in-mode`): an `any-number` group's `max`/`min` as any amount on a
  triggered or activated ability, read as its targets are chosen (rules 603.3d, 601.2c, 602.2b —
  `specsWithAmounts`); `maxTotalManaValue` and `differentManaValues`; a group in a `castModal`
  mode, the bots fitting picks to X (`fitModalXGroup`) and the client asking X after a modal
  spell's modes (it cast them at X = 0); a modal triggered ability's group resolving with every
  member (it reached only the last — Oracle of Tragedy too); scaffolder templates for "(up to) X
  target …" and "… with total mana value N or less". 38 cards: Orcus, Kairi, Heroic Feast, Serra's
  Liturgy, Lost in the Maze, Patch Up, Agadeem's Awakening, Heliod's Intervention, Profane Command,
  Ancient Brass Dragon, Death Kiss, Prismabasher and the rest; 18 still blocked on narrow keys
  (`B245.json`).
- **Need-keys Phase 2, the grant-protection family** (2026-10-28, B244,
  `effect:grant-protection-choice` + `effect:grant-protection-temporary`): the `grant-protection`
  effect — protection for a duration on a target and/or a filter's matches (rule 702.16, layer
  6), from a fixed quality or one chosen as it resolves (colour, card type, "colorless or …",
  optional), a filter's "your opponents" fixed as it resolves — and the static
  `protection.chosenColor` / `doesntRemoveSource` (rule 702.16n) for the chosen-colour Auras; v1
  picks the colour that stops the opposing spell aimed at its creature, the view shows a granted
  protection, and the scaffolder reads the sentences. 62 cards: Sejiri Shelter, Giver of Runes,
  Pippin, Guard of the Citadel, Gods Willing, Brave the Elements, Flickering Ward and 56 more;
  10 still blocked on narrow keys.

- **The set walk is done** (2026-10-27, batches 89-234): every Commander-legal first printing of
  every set is authored or triaged with a blocked record — newest first from Reality Fracture,
  oldest first from Alpha, and the middle walks between, from round thirteen in parallel cloud
  sessions (`author-walks-parallel`) and finishing in rounds eighteen to twenty (B219-B234). The
  two walks' BACKLOG lines, as they stood at the end:

  - **Also: set by set, oldest first** (the `author-by-set-oldest` skill; the user's call
    2026-10-21): the same whole-set walk from Limited Edition Alpha forward in time
    (`npm run cards:sets -w engine -- --oldest --next 60`), until it meets the newest-first walk
    below. Batch 130 took Alpha whole and Beta's last card, building chosen-source prevention and
    colour setting; batch 131 Arabian Nights and Antiquities, on "you may choose not to untap" and
    "for as long as ~ remains tapped"; batches 132-133 Legends, on rampage, the world rule, "for as
    long as you control ~" and "blockable as though it didn't have landwalk"; batch 134 The Dark,
    on existing features only; batch 135 Fallen Empires, on "attacks and isn't blocked", removing
    any number of counters as a cost, and state triggers; batch 136 Ice Age whole, on cumulative
    upkeep; batch 160 Homelands whole, no feature built (33 blocked, "doesn't untap during your
    next untap step" leading with 3); batch 163 Alliances whole, on the `exileTop` cost (69 blocked,
    the lands' "if this would enter, sacrifice a … instead" — `replacement:enter-replacement-sacrifice`
    — and banding leading with 4 each, an opponent choosing the mode with 3); batch 166 Mirage's
    first half (its 110 most-played left), no feature built (70 authored, 40 blocked, nothing
    shared by more than two); batch 169 the rest of Mirage, no feature built (67 authored, 43
    blocked, its flash-and-sacrifice rider leading with 3). batch 172 Visions whole, on the Mirage block's flash-and-sacrifice (`flashThenSacrifice`) and
    "at the beginning of the next cleanup step" (67 authored, 46 blocked, nothing shared by more than
    two); batch 175 Weatherlight whole, no feature built (71 authored, 48 blocked, graveyard order
    leading with 11 — `docs/card-blockers.md`'s batch 175 has the 404.3 design question); batch 178
    Tempest's first half (its 90 most-played of 178 left), on buyback (`kicker.keyword: "buyback"`,
    mana costs only; 69 authored with six buyback cards from earlier batches, 30 blocked, nothing
    shared by more than two); batch 181 the rest of Tempest (88), on Licids (`become-licid-aura`
    and the `end-licid-effect` special action; 59 authored with Stronghold's six Licids, 29 blocked,
    "can block as though it had shadow" the only need shared, by two). Tempest is whole. Batch 184
    Stronghold whole (77), on damage redirection's one-shot shields (`prevent-damage`'s
    `redirectTo`, rule 614.9; 57 authored with four redirection cards from earlier batches, 24
    blocked, "change the target" the only need shared, by two). Stronghold is whole. Batch 187
    Exodus whole (92), on a random discard as a cost, buyback's non-mana costs (`kicker.also`) and
    the `opponent-compared` target (the Keepers; 69 authored with eight cards from earlier batches,
    31 blocked, the Oaths' "that player chooses target player who …" leading with 5 —
    `target:opponent-comparison-chosen-by-active-player`, the comparison itself built). Exodus is
    whole. Batch 190 Portal and Portal Second Age (113 left, one batch), on Portal's "only if you've
    been attacked this step" (`attacked-this-step`), "creatures attacking you" (`attackingYou`) and
    `prevent-damage-to-you` (89 authored with Scarecrow and Al-abara's Carpet, 24 blocked, "look at
    target player's hand" leading with 3 — 7 over the pool with Glasses of Urza, Clairvoyance,
    Dragon's Eye Savants and Lay Bare: a look-only view of a hidden hand, a client change). Both are
    whole. Batch 193 Urza's Saga's first half (its 90 most-played left), on echo (`echo()`, rule
    702.30; 70 authored with the set's 13 other echo creatures and four echo cards from earlier
    batches, 20 blocked, Curfew and Umbilicus's "each player returns one of their own" the only need
    shared). Batch 198 the rest of Urza's Saga (81), on "look at target player's hand" (`look-at-hand`,
    and `discard-chosen`'s `upTo`; 57 authored with five look-at-hand cards from earlier batches, 24
    blocked, "up to X targets" — `decision:x-targets`, 8 over the pool — and "becomes an enchantment"
    — `effect:set-types-temporary` — leading with three each). Urza's Saga is whole. Batch 203 Urza's Legacy
    whole (76) and Portal Three Kingdoms' 30 most-played, on horsemanship (`keyword:horsemanship`,
    rule 702.31; 90 authored with Rolling Earthquake, Herald of Hoofbeats and The Girl in the
    Fireplace from earlier batches, 16 blocked, "controls more … than each other player" and "on the
    battlefield" counts across all players leading with two each). Urza's Legacy is whole. Batch 208
    the rest of Portal Three Kingdoms (53) and Urza's Destiny's 60 most-played, on "reveal any number
    of <colour> cards in your hand" (`cost:reveal-any-number-from-hand` — `look-and-choose`'s
    `"reveal"` destination; 85 authored, 28 blocked, "target opponent chooses … destroy it" —
    `effect:target-opponent-chooses` — leading with 4 and "can't attack unless defending player
    controls an Island" — `condition:defending-player-controls` — with 3). Portal Three Kingdoms is
    whole. Batch 227 the rest of Urza's Destiny (18), Starter 1999 (7) and Mercadian Masques' 95
    most-played, on the sacrifice and return-lands alternative costs (`alternativeCost.sacrifice` /
    `.returnToHand` — Crash, Thwart, Daze, Gush, Fireblast, the Flares, the Borderposts; 109
    authored with 21 earlier cards they unblocked, 33 blocked, temporary protection —
    `effect:grant-protection-temporary`, 21 over the pool — and "search its controller's graveyard,
    hand and library" leading with two each). Urza's Destiny and Starter 1999 are whole. Batch 233 the rest of Mercadian Masques (123: 99
    authored, no engine change, 24 blocked, none shared — `B233.json`). **Mercadian Masques is whole,
    and with it this walk's range is done (2026-10-27)**: every set from Alpha to Mercadian Masques
    is walked, and the middle walks own the rest. `decision:x-targets` (8) is the feature to build first if a set adds to it. This walk's range
    ends at Mercadian Masques (1999-10-04; from 2026-10-27's seventeenth round three more middle walks own Invasion to Scourge, and the third middle walk owns Mirrodin on; from round eighteen a seventh middle walk owns Prophecy and Nemesis — `docs/plans/set-walk-last-rounds.md`). Leads over the whole pool now:
    graveyard order (`effect:top-creature-card-of-graveyard`/`effect:top-card-of-graveyard` — 14, with rule 404.3's
    simultaneous arrivals), banding (46 — needs the multi-blocking line below), cumulative upkeep's unbuilt forms
    (`keyword:cumulative-upkeep` — 15: granted to other permanents, combined costs, mana
    spendable only on it), damage redirection's static and "all damage by target" forms (~16), "can't be regenerated this turn"
    (`effect:cant-be-regenerated-this-turn` — 9), "can't attack unless defending player controls
    …" (`static:attack-restriction-defending-player-condition` — 9).
  - **Now: set by set, whole sets, newest first** (the `author-by-set` skill; the user's call
    2026-10-14, after the walk took each set's top half): every Commander-legal first printing,
    ranked ones first. Every set from Reality Fracture back to Phyrexia: All Will Be One is whole
    (batch 89 built plot and crimes for Outlaws of Thunder Junction; batch 90 rad counters and squad
    for Fallout; batch 91 collect evidence and Cases; batch 92 explore, Map tokens, discover and
    craft; batch 93 time travel, vanishing and gaining suspend; batch 94 Roles, bargain, celebration
    and "has an Adventure"; batch 95 Commander Masters' last six; batch 96 voting, keyword loss,
    removal from combat and devour for The Lord of the Rings and its Commander set; batch 97
    distributed counters and the owner's top-or-bottom choice for The Aftermath; batch 98 battles
    and Sieges, incubate, backup and convokers for March of the Machine and its Commander set; batch
    99 compleated, "has toxic" and "gains toxic N" for Phyrexia: All Will Be One and its Commander
    set; batch 100 the rest of Jumpstart 2022 and The Brothers' War Commander, no engine change;
    batch 101 the rest of The Brothers' War; batch 102 the rest of Warhammer 40,000 Commander, with
    domain and read ahead built for Dominaria United; batch 103 the rest of Dominaria United and its
    Commander set; batch 104 the rest of Commander Legends: Battle for Baldur's Gate, on the
    initiative, dungeons and venturing — `docs/plans/initiative-dungeons.md`; batch 105 Streets of
    New Capenna and its Commander set, on shield counters; batch 106 Kamigawa: Neon Dynasty, its
    Commander set and Crimson Vow Commander, on reconfigure; batch 107 Innistrad: Crimson Vow, on
    training, exploit and cleave; batch 108 Innistrad: Midnight Hunt and its Commander set, on coven
    and day/night; batch 109 Adventures in the Forgotten Realms and its Commander set, on the three
    Forgotten Realms dungeons and rule 101.4's "each player chooses, then all act"; batch 110 Modern
    Horizons 2 and Commander 2021, on madness; batch 111 Strixhaven, on learn as the rummage
    alone; batch 112 Kaldheim and its Commander set, on snow mana; batch 113 the rest of Commander
    Legends, no engine change; batch 114 Zendikar Rising and its Commander set, on party; batch
    115 the rest of Jumpstart; batch 116 the rest of Core Set 2021, on hexproof from a quality; batch 117 Ikoria,
    on mutate; batch 118 Commander 2020 and Theros Beyond Death, on devotion cost reductions and
    "enchanted creature" in an effect; batch 119 the cards that unblocked; batch 120 Throne of
    Eldraine, on "enchanted creature doesn't untap" and adamant, with the earlier cards both
    unblocked; batch 121 Commander 2019 and Core Set 2020, no engine change; batch 122 Modern
    Horizons, on pitch costs; batch 123 War of the Spark, with entwine built beside it; batch 124
    Ravnica Allegiance, on spectacle and afterlife; batch 125 Guilds of Ravnica, on jump-start;
    batch 126 Commander 2018 and Core Set 2019, with a "can't be blocked" restriction; batch 127
    Battlebond, no engine change; batch 128 Dominaria, on kicker's scaffolder template; batch 129
    Rivals of Ixalan, on ascend; batch 137 Ixalan and Commander 2017, no engine change; batch 138
    Hour of Devastation, on aftermath, exert as a cost and "shuffle your graveyard into your
    library"; batch 139 Amonkhet, on embalm, "lands you control don't untap during your next
    untap step" and "discard any number of cards"; batch 140 Aether Revolt, on improvise;
    batches 141-143 and 146-150 Commander 2016, Kaladesh, Conspiracy: Take the Crown and Eldritch
    Moon, each walked twice on two branches and merged 2026-10-25 (undaunted, "is monstrous",
    melee's count, emerge and "until end of turn, whenever …" built); batch 151 Shadows over
    Innistrad, on the werewolves' "if no spells were cast last turn" and damage to a trigger's object;
    batch 152 Oath of the Gatewatch and Commander 2015, on surge and "if that creature would die
    this turn, exile it instead" with its "dealt damage this way" form; batch 153 the rest of
    Battle for Zendikar, on awaken; batch 154 the rest of Magic Origins, on renown; batch 155
    Dragons of Tarkir, on dash and bolster; batch 156 the rest of Fate Reforged, no feature built
    but return-from-graveyard's filter now reads the spell's X; batch 157 the rest of Commander
    2014 and Khans of Tarkir, no feature built; batch 158 the rest of Magic 2015 and Conspiracy,
    on parley; batch 161 the rest of Journey into Nyx, on bestow, with the eleven earlier bestow
    cards it unblocked; batch 164 the rest of Born of the Gods, on tribute; batch 167 Commander
    2013 whole and Theros's 76 most-played left, on the Ordeals' "when you sacrifice this Aura");
    batch 170 the rest of Theros and Magic 2014 whole, no feature built (79 authored, 16 blocked,
    one or two each — `B170.json`); batch 173 the rest of Dragon's Maze, on fuse (62 authored, 21
    blocked — `B173.json`); batch 176 the rest of Gatecrash, on cipher (rule 702.99 — the
    set's nine and five cards triaged earlier on cipher alone: 96 authored, 25 blocked, one each
    — `B176.json`); batch 179 the rest of Return to Ravnica, on unleash and detain (rules
    702.98a, 701.35a — 97 authored, 25 blocked, one or two each — `B179.json`); batch 182 Magic 2013 whole and Avacyn Restored's 60 most-played left, on
    miracle (rule 702.94, with the nine earlier miracle cards it unblocked — 83 authored, 27
    blocked — `B182.json`); batch 185 the rest of Avacyn Restored and Dark Ascension's 40 most-played, on
    soulbond (rule 702.95, with the 11 soulbond cards triaged earlier — 89 authored, 28 blocked,
    one or two each — `B185.json`): Avacyn Restored is whole; batch 188 the rest of Dark Ascension
    and Innistrad's next 60, on "at the beginning of enchanted player's upkeep" (with the four
    earlier Curses it unblocked — 83 authored, 21 blocked, one to three each — `B188.json`): Dark
    Ascension is whole; batch 191 the rest of Innistrad and Magic 2012 whole, on a spell's
    additional cost of exiling cards from your graveyard (the Skaabs, with five earlier cards it
    unblocked — 77 authored, 23 blocked, one each — `B191.json`): Innistrad and Magic 2012 are
    whole; batch 194 the rest of Commander 2011 and New Phyrexia whole, no feature built (64
    authored, 35 blocked — the Chancellors' opening-hand reveal, `new:opening-hand-actions`, 5, and
    join forces, `new:join-forces`, 3, leading — `B194.json`): Commander 2011 and New Phyrexia are
    whole; batch 199 Mirrodin Besieged whole and Scars of Mirrodin's next 50, no feature built (82
    authored, 22 blocked, one or two each — `B199.json`); batch 204 the rest of Scars of Mirrodin, no
    feature built, a static's metalcraft now counting its own artifact (40 authored, 8 blocked, one
    each but `filter:attached-to-target`'s two — `B204.json`): Scars of Mirrodin is whole. **This
    walk's range (Journey into Nyx back to Scars of Mirrodin) is done**: every set from Reality
    Fracture back to Scars of Mirrodin is whole; the next range is the `author-walks-parallel`
    skill's to assign (Magic 2011 and older belong to the middle walks). Until it is, a session of
    this skill takes the newest set no running walk owns: batch 212 (2026-10-26, round sixteen)
    took the rest of Champions of Kamigawa for the third middle walk, which sat that round out,
    and batch 213 (the same round) Fifth Dawn whole, building sunburst; the third middle walk took
    Darksteel back in round seventeen (batch 214), and with Mirrodin its range is done. **A feature worth building first**: "a deck can
    have any number of cards named ~" (`mechanic:deck-any-number-copies`, `deck-validation.ts`'s
    singleton rule exempting only basic lands) is the only blocker of 9 cards and one of 12 —
    Relentless Rats, Persistent Petitioners, Shadowborn Apostle, Rat Colony, Hare Apparent, Seven
    Dwarves, Templar Knight, Tempest Hawk, Cid. The Curses' blocker left: a static over "creatures enchanted player
    controls" (`static:static-over-enchanted-player` — 4: Curses of Death's Hold, the Nightly
    Hunt, Exhaustion, Bloodletting). Every Return to Ravnica block mechanic is now in the pool (scavenge, evolve, extort,
    bloodrush, battalion, populate, overload, cipher, unleash, detain). Batch 167's blockers are one or two each (`B167.json`): "whenever a creature
    attacks enchanted player" (`trigger:creature-attacks-enchanted-player` — the Curses of
    Predation and the Forsaken) and the tempting offers' simultaneity
    (`new:each-player-may-simultaneous` — Tempt with Immortality, beside Tempt with Discovery) lead
    with two. Batch 164's blockers are one each (`B164.json`); Kraken of the Straits found a silent gap — a
    block restriction's `{ amount }` other than the source's own power, toughness or mana value
    reads as NaN in `goad.ts`'s `sourceAmount`, so the restriction never applies, with no error.
    Batch 161's blockers are one or two each ("all Auras
    attached to it", `filter:attached-to-target` — 2); bestow's unbuilt forms
    (`keyword:bestow-extensions` — Detective's Phoenix). Batch 158's: "last turn" life loss
    (`condition:lost-life-last-turn` — 2); Goblin Kaboomist waits
    only on the `damage` effect's target type taking `"source"`. **Three walks run in parallel
    cloud sessions from 2026-10-25, five from 2026-10-26's thirteenth round, three local sessions on the PC from its sixteenth**, each owning a range so none walks another's sets: this
    newest-first walk (Journey into Nyx back to Scars of Mirrodin, stopping before Magic 2011), a **middle walk** (its first range, Magic 2011 and Rise of the Eldrazi back to Shards
    of Alara — M11, ROE, WWK, ZEN, M10, ARB, CON, ALA — is done; from 2026-10-26 its second is **Eventide back to
    Time Spiral** — EVE, SHM, MOR, LRW, FUT, PLC, TSP, ~1,010 cards left — newest first, by `cards:sets -- --set <code>`),
    a **second middle walk** (from 2026-10-26: **Coldsnap back to Ravnica: City of Guilds** — CSP, DIS, GPT, RAV,
    ~500 cards left — newest first by `--set <code>`; batch 196 took Coldsnap whole, building ripple and the recover helper, 33 blocked with cumulative upkeep's other costs leading; batch 201 took Dissension whole, building forecast (the `forecast()` helper), 87 authored with Piercing Rays and Spirit en-Dal, 46 blocked with nothing shared by more than two (`effect:sacrifice-amount`, `decision:choose-card-name`); batch 206 took Guildpact whole, building haunt and replicate (`haunt()` / `hauntSpell()`, `kicker.keyword: "replicate"`), 85 authored with Shattering Spree and Lose Focus, 21 blocked, none shared; batch 229 took Ravnica: City of Guilds' ~76 most-played, building radiance (`CardFilter.sharesColorWithTarget`, taught to the scaffolder), 50 authored with Firemane Angel and Razia, 26 blocked, none shared; batch 234 took the rest of Ravnica: City of Guilds (Ravnica is whole: 53 of 77 authored, no engine change, 24 blocked, none shared). **This walk's range is done**), a **third middle walk** (from 2026-10-26: **Saviors of
    Kamigawa back to Mirrodin** — SOK, BOK, CHK, 5DN, DST, MRD, ~435 left — newest first by `--set <code>`; batch 197 took Saviors of Kamigawa's 100 most-played left, building epic and the `bushido`/`soulshift` helpers the scaffolder now reads; batch 202 took the rest of Saviors of Kamigawa (Saviors is whole) and Betrayers of Kamigawa's 72 most-played left, building splice onto Arcane with a mana cost (`keyword:splice`, read by the scaffolder; 43 blocked, the hand-size comparison `condition:more-cards-in-hand-than-each-opponent` and offering, `keyword:offering`, leading with five and four); batch 207 took the rest of Betrayers of Kamigawa (Betrayers is whole) and Champions of Kamigawa's 52 most-played left, building flip cards (rule 710, `mechanic:flip-cards` — `flip: true` halves and the `flip` effect, read by the scaffolder) and authoring 14 of the 20 flip cards (39 blocked, splice's non-mana costs and temporary protection leading); batch 212 (round sixteen, by the newest-first walk's session while this walk sat out) took the rest of Champions of Kamigawa (Champions is whole), building `tap` and `exile` reaching a damage trigger's recipient (part of `trigger:trigger-recipient-ref`) and authoring the seven earlier cards it unblocked, Kaldra Compleat among them (120 of 145 authored, 25 blocked, one or two each — `filter:damaged-this-turn-by-source` three); batch 213 (round sixteen, by a newest-first session while this walk sat out) took Fifth Dawn whole (Fifth Dawn is whole), building sunburst (rule 702.44 — `sunburst()`, and Modular—Sunburst, read by the scaffolder: sunburst had *not* been in the pool) with Pentad Prism, which it unblocked (70 of 95 authored, 25 blocked, one or two a need — `effect:remove-counters-any-kind` and `effect:mass-graveyard-to-battlefield` two each); batch 214 (round seventeen) took Darksteel whole (Darksteel is whole), building "and all other permanents with the same name as that permanent" (`condition:same-name-as-target` — `CardFilter.sameNameAsTarget`, read by the scaffolder) and authoring the Echoing cycle with it and ten earlier cards it unblocked, Maelstrom Pulse and Detention Sphere among them (68 of 102 authored, 34 blocked, none shared by more than three — `cost:unattach-equipment` three: Surestrike Trident, Leonin Bola, Heartseeker; the namesakes off the battlefield, `condition:same-name-as-target-off-battlefield`, now block 11 earlier cards — Echoing Return, Legion's End, Secret Salvage); batch 215 (round seventeen) took Mirrodin's 110 most-played left, no engine feature (one engine fix the new-cards fuzzer found: a spell's new targets, rule 115.7, are judged from the source they were offered from — Misdirection on Lay Down Arms; 71 authored, 39 blocked, one or two a need — `decision:name-a-card` and `effect:count-equipment-attached-to-source` two each); **next: the rest of Mirrodin** (21 left, `--set MRD`, one small batch), which ends this walk's range; offering, `keyword:offering`, is six across BOK and CHK and worth building whenever a walk passes it)
    a **fourth middle walk** (from 2026-10-27: **Scourge back to Onslaught** — SCG, LGN, ONS — newest first by `--set <code>`; batch 216 took Scourge whole (Scourge is whole: 59 of 90 authored, no engine change, 31 blocked, non-mana morph costs leading with four — `cost:morph-sacrifice`, `cost:morph-pay-life`, `cost:morph-return-permanent`, `cost:morph-discard-card`); batch 219 took the rest of Mirrodin (21, from the third middle walk) and Legions whole, building amplify, provoke and the `block-if-able` blocking requirement (88 of 116 authored, 28 blocked: turning face down and morph {X} lead with three and two); batch 224 took Onslaught's 105 most-played (65 of 105 authored, 40 blocked), building morph costs that aren't mana — `MorphCost.also`: pay life, sacrifice, discard, return to hand — with the six cards it unblocked (Zombie Cutthroat, Putrid Raptor, Raven Guild Initiate, Skirk Volcanist, Fathom Seer, Gathan Raiders); the Words cycle's one-shot "the next time you would draw a card this turn" replacement (`replacement:next-draw-this-turn`, five) leads its blocked, then "becomes the creature type of your choice" (`effect:set-creature-type`, four); batch 230 took the rest of Onslaught (Onslaught is whole: 62 of 94 authored, no engine change, 32 blocked, `effect:set-creature-type` leading with six — eleven across the walk — then the Crowns' `filter:shares-creature-type-with-attached` with four); `cost:morph-reveal-card` (five) is the morph cost still open. **This walk's range is done**), a **fifth middle walk** (from 2026-10-27: **Judgment back to Odyssey** — JUD, TOR, ODY — newest first by `--set <code>`; batch 217 took Judgment whole (Judgment is whole: 55 of 102 authored, no engine change, 47 blocked, "unless any player has it deal N damage" — `effect:unless-any-player-pays`, Browbeat, Breaking Point, Book Burning, Barbarian Bully, 7 cards with B134/B136's, built by batch 222 — and the Wishes, `mechanic:outside-the-game`, five, leading); batch 220 took Torment whole (Torment is whole: 85 of 115 authored, 30 blocked, building "discard X cards" as a spell's additional cost — `cost:discard-x-cost`, the seven Dreams with Firestorm and Channeled Force; temporary protection, `effect:grant-protection-temporary`, leads the blocked with four); batch 225 took Odyssey's 105 most-played (73 authored, 32 blocked, no engine feature; fixed an `each-player-may` choice's `"that-player"` when the effect's controller chooses — same-name counts and searches keyed on a trigger's object, `filter:same-name-as-trigger-spell` and its kin, lead the blocked with three: Aven Shrine, Nantuko Shrine, Verdant Succession); batch 231 took the rest of Odyssey (Odyssey is whole: 76 of the 106 left authored, 30 blocked, building "with the same name as that spell" — `CardFilter.sameNameAsTriggerObject` — for the five Shrines; a single graveyard's targets and the next damage from a chosen source to anything lead the blocked with two each). **This walk's range is done**), a **sixth middle walk** (from 2026-10-27: **Apocalypse back to Invasion** — APC, PLS, INV — newest first by `--set <code>`; Apocalypse is whole (B218), Planeshift is whole (B221: 76 of 108 authored, no engine change, 32 blocked, nothing shared by more than two but the Planeswalker's cycle's random card from an opponent's hand — `effect:random-card-from-hand` / `effect:reveal-random-card-from-hand`, four with Mirth, Favor, Scorn and Fury; Arctic Merfolk and Dralnu's Pet on `new:kicker-nonmana-cost`), batch 226 took Invasion's 100 most-played (56 authored, no engine change, 44 blocked; splitting into piles, `decision:separate-into-piles`, leads with five: Stand or Fall, Death or Glory, Bend or Break, Do or Die, Fight or Flight — then `effect:flash-for-extra-cost` with three); batch 232 took the rest of Invasion (Invasion is whole: 66 of the last 101 authored, no engine change, 35 blocked; the Djinns' "most common colour among all permanents" — `condition:most-common-color-among-all-permanents` — leads with six, then the Leeches' coloured cost increases, `static:cost-increase-colored`, with five counting Alabaster Leech). **This walk's range is done**) a **seventh middle walk** (from round eighteen: **Prophecy back to Nemesis** — PCY, NEM — newest first by `--set <code>`; batch 223 took Nemesis whole (Nemesis is whole: 67 of 104 authored, no engine change — fading is two pieces, an enters-with fade counters replacement and Cocoon's upkeep trigger — 37 blocked, the sacrifice alternative cost `cost:alt-cost-sacrifice` leading with four: Mogg Alarm, Dark Triumph, Mind Swords, Downhill Charge; it blocks 14 triaged cards in all, 10 on it alone with the Flares and Fireblast, worth building next as an `alternativeCost.sacrifice` beside `tapCreatures`); batch 222 took Prophecy whole (Prophecy is whole: 78 of 113 authored, 35 blocked, building "any player may activate this ability" and "unless any player pays" — `effect:any-player-may-activate`, `effect:unless-any-player-pays` — with 11 earlier cards; the discard-a-land-card alternative cost, `cost:alt-cost-discard-cards`, leads its blocked with four). **This walk's range is done**) and the oldest-first walk above (now Urza's Destiny forward to Mercadian Masques). **The last 1,652 cards (14 sets, 2026-10-27) are split into rounds eighteen to twenty in `docs/plans/set-walk-last-rounds.md`**: each round's walks, sets and batch numbers are decided there, so a coordinator running `author-walks-parallel` takes its round from that file instead of choosing (round eighteen: B219–B223; the fourth middle walk takes Mirrodin's last 21 from the third, whose range ends with B215). Their first batches are B158 (this walk), B159 (middle) and
    B160 (oldest); the second round's are B161 (this walk: Journey into Nyx — landed), B162 (middle: Worldwake — landed) and B163 (oldest: Alliances — landed); the third round's are B164 (this walk: Born of the Gods — landed), B165 (middle: Zendikar — landed) and B166 (oldest: Mirage's first half, its ~110 most-played — landed); the fourth round's (2026-10-26) are B167 (this walk: Commander 2013 and Theros's ~75 most-played — landed), B168 (middle: Magic 2010 and Alara Reborn — landed) and B169 (oldest: the rest of Mirage — landed); the fifth round's (2026-10-26) are B170 (this walk: the rest of Theros and Magic 2014), B171 (middle: Conflux whole and Shards of Alara's ~40 most-played — landed) and B172 (oldest: Visions whole — landed); the sixth round's (2026-10-26) are B173 (this walk: Dragon's Maze — landed), B174 (middle: the rest of Shards of Alara and Magic 2011, which the two walks' ranges had left between them — landed) and B175 (oldest: Weatherlight — landed); the seventh round's (2026-10-26) are B176 (this walk: Gatecrash — landed), B177 (middle: Eventide — landed) and B178 (oldest: Tempest's first half, its ~90 most-played — landed); the eighth round's (2026-10-26) are B179 (this walk: Return to Ravnica — landed), B180 (middle: Shadowmoor's first half, its ~90 most-played — landed) and B181 (oldest: the rest of Tempest — landed); the ninth round's (2026-10-26) are B182 (this walk: Magic 2013 whole and Avacyn Restored's ~60 most-played — landed), B183 (middle: the rest of Shadowmoor — landed) and B184 (oldest: Stronghold — landed); the tenth round's (2026-10-26) are B185 (this walk: the rest of Avacyn Restored and Dark Ascension's ~40 most-played — landed), B186 (middle: Morningtide — landed) and B187 (oldest: Exodus — landed); the eleventh round's (2026-10-26) are B188 (this walk: the rest of Dark Ascension and Innistrad's ~60 most-played — landed), B189 (middle: Lorwyn's first half, its ~90 most-played — landed) and B190 (oldest: Portal and Portal Second Age — landed); the twelfth round's (2026-10-26) are B191 (this walk: the rest of Innistrad and Magic 2012 whole — landed), B192 (middle: the rest of Lorwyn — landed) and B193 (oldest: Urza's Saga's first half, its ~90 most-played — landed); the thirteenth round's (2026-10-26, five sessions) are B194 (this walk: Commander 2011 and New Phyrexia — landed), B195 (middle: Future Sight — landed), B196 (second middle: Coldsnap — landed), B197 (third middle: Saviors of Kamigawa's ~100 most-played — landed) and B198 (oldest: the rest of Urza's Saga — landed); the fourteenth round's (2026-10-26, five sessions) are B199 (this walk: Mirrodin Besieged whole and Scars of Mirrodin's ~50 most-played — landed), B200 (middle: Planar Chaos — landed), B201 (second middle: Dissension — landed), B202 (third middle: the rest of Saviors of Kamigawa and Betrayers of Kamigawa's ~70 most-played — landed) and B203 (oldest: Urza's Legacy whole and Portal Three Kingdoms' ~30 most-played — landed); the fifteenth round's (2026-10-26, five sessions) are B204 (this walk: the rest of Scars of Mirrodin, which ends this walk's range — landed), B205 (middle: Time Spiral's first half, its ~95 most-played — landed), B206 (second middle: Guildpact whole — landed), B207 (third middle: the rest of Betrayers of Kamigawa and Champions of Kamigawa's ~50 most-played — landed) and B208 (oldest: the rest of Portal Three Kingdoms and Urza's Destiny's ~60 most-played — landed); the sixteenth round's (2026-10-26, three local sessions on the PC, the `author-walks-local` skill; this walk's range is done and the third middle walk sits it out) are B209 (middle: the rest of Time Spiral, which ends its range), B210 (second middle: Ravnica: City of Guilds' ~100 most-played) and B211 (oldest: the rest of Urza's Destiny and Mercadian Masques' ~80 most-played), and B212 (the newest-first walk's session, its own range done, on the third middle walk's next set: the rest of Champions of Kamigawa — landed) and B213 (the same, on Fifth Dawn whole — landed); the seventeenth round's (2026-10-27, five cloud sessions; round sixteen's local B209-B211 had not landed — abandoned 2026-10-27, the local sessions never started, their sets now in rounds nineteen and twenty — so the rest of Time Spiral, Ravnica: City of Guilds and Urza's Destiny/Mercadian Masques stay with them) are B214 (third middle: Darksteel whole — landed), B215 (third middle: Mirrodin's ~110 most-played — landed), B216 (fourth middle: Scourge whole — landed), B217 (fifth middle: Judgment whole — landed) and B218 (sixth middle: Apocalypse whole — landed); the eighteenth round's (2026-10-27, five cloud sessions, `docs/plans/set-walk-last-rounds.md`) are B219 (fourth middle: the rest of Mirrodin and Legions whole — landed), B220 (fifth middle: Torment whole — landed), B221 (sixth middle: Planeshift whole — landed), B222 (seventh middle: Prophecy whole — landed) and B223 (seventh middle: Nemesis whole — landed); the nineteenth round's (2026-10-27, six cloud sessions, `docs/plans/set-walk-last-rounds.md`) are B224 (fourth middle: Onslaught's ~105 most-played), B225 (fifth middle: Odyssey's ~105 most-played — landed), B226 (sixth middle: Invasion's ~100 most-played) — landed, B227 (oldest: the rest of Urza's Destiny, Starter 1999 and Mercadian Masques' ~95 most-played), B228 (middle: the rest of Time Spiral — landed) and B229 (second middle: Ravnica: City of Guilds' ~76 most-played — landed); the twentieth and last round's (2026-10-27, five cloud sessions) are B230 (fourth middle: the rest of Onslaught — landed), B231 (fifth middle: the rest of Odyssey — landed), B232 (sixth middle: the rest of Invasion) — landed, B233 (oldest: the rest of Mercadian Masques) and B234 (second middle: the rest of Ravnica: City of Guilds), which finish the walk; after those, take the highest `B<N>` on `origin/main` plus one, checked again
    just before landing (rename the record and test files if another walk took it). **The middle walk**: batch 159 took Rise of the Eldrazi whole, building level up and umbra armor (and authoring the umbras and levelers earlier batches had blocked on them); batch 162 Worldwake whole, building multikicker's "for each time it was kicked" as an amount and a static's colour setting (the Zendikons); batch 165 Zendikar whole, no feature built (26 blocked, "blocks this turn if able" — `effect:must-block-this-turn` — leading with two); batch 168 Magic 2010 and Alara Reborn (the rest of each), no feature built (38 blocked, led by the five Borderposts' "return a basic land" alternative cost — `cost:alt-cost-return-lands`, 7 cards with Daze and Gush: worth building if Conflux or Shards adds to it — they added none); batch 171 Conflux whole and Shards of Alara's 40 most-played left, no feature built (29 blocked, the devour count read back — `amount:creatures-devoured`, 4 cards with Marrow Chomper — leading); batch 174 the rest of Shards of Alara and Magic 2011, building "begin the game with it on the battlefield" (rule 103.6a — the Leylines; 27 blocked, `cost:alt-cost-sacrifice` and the devour count leading); **its first range is done** — every set from Magic 2011 back to Shards of Alara is walked whole. **Its second range**: batch 177 took Eventide whole, building retrace and the untap symbol {Q} (26 blocked, chroma over cards that aren't permanents — `amount:chroma-of-cards` — leading with four). Batch 180 took Shadowmoor's 90 most-played left and its seven other conspire cards, building conspire (rule 702.78 — `conspire: true`, `grantsToSpells.conspire`; 20 blocked, one card a need). Batch 183 took the rest of Shadowmoor (80), no feature built (60 authored, 20 blocked, nothing shared by more than two): Shadowmoor is whole. Batch 186 took Morningtide whole, building prowl and kinship (78 authored with Enigma Thief and Notorious Throng, 30 blocked, clash leading with 8): Morningtide is whole. Batch 189 took Lorwyn's 90 most-played left, building clash (rule 701.30 — the `clash` effect), champion (rule 702.72 — `champion()`) and a spell returning itself to hand as it resolves (608.2n), with eight of Morningtide's clash and champion cards (81 authored, 19 blocked, one or two each). Batch 192 took the rest of Lorwyn (80), building a "whenever you clash" trigger (`trigger:clash`; 60 authored with Gilt-Leaf Palace and Secluded Glen, 20 blocked — "reveal a card from your hand" as an additional cost, `cost:additional-cost-reveal`, leading with four, and now the only blocker of 12 cards in all: worth building next, as a `behold`-like option limited to the hand that reveals rather than exiles): Lorwyn is whole. Batch 195 took Future Sight whole, no feature built (76 authored, 45 blocked — fateseal and targets in exile two each): Future Sight is whole. Batch 200 Planar Chaos whole, no feature built (43 blocked: suspend's exile-zone triggers — `trigger:functions-while-suspended`, five — and Suspend X — `mechanic:suspend-x`, four — leading). Batch 205 took Time Spiral's 95 most-played left, building abilities that work while a card is suspended (rule 702.62b — `whileSuspended` on a trigger, `zone: "suspended"` on an activation; the exile viewer offers the activation) with Greater Gargadon and four older cards (Deep-Sea Kraken, Nihilith, Riftmarked Knight, Dinosaurs on a Spaceship); 70 of the 95 authored, 25 blocked, one or two a need. Batch 228 took the rest of Time Spiral (89), no feature built (58 authored with Triskelavus, Sarpadian Empires, Vol. VII, Phyrexian Totem and Candles of Leng; 31 blocked, two each for `effect:skip-next-turn`, `static:block-as-though-shadow`, `static:block-additional-creature` and `decision:choose-card-name`; no Suspend X card was among them): Time Spiral is whole, and **this walk's second range is done**. Checked in batch 195: suspend, split second, flashback, echo, vanishing, buyback, madness, delve, transmute and poisonous are all in the pool; frenzy is an `attacks-unblocked` trigger and grandeur a discard-named cost (Korlash); gravestorm, transfigure, aura swap, fortify (forecast is, batch 201) and absorb are not built. Its leftovers: Umbra Mystic and Lion Umbra (the umbra choice, `decision:umbra-armor-choose-aura`; enchant modified) and Venerated Teacher (`filter:has-level-up`). Batch
    157's leading blocker: a morph cost that reveals a card (`cost:morph-reveal-card` — 5), then
    "blocks this turn if able" (`effect:must-block-this-turn`) and looking at face-down
    permanents (`effect:look-at-face-down-permanents`), two each; Stitcher Geralf waits on
    `powerAmong` reading a card off the battlefield as 0 power. Batch
    156's blockers: a non-Aura enchantment becoming an Aura (`effect:enchantment-becomes-aura` —
    Cloudform, Lightform, Rageform) and "manifest" recording the card it manifested
    (`effect:manifested-this-way` — Wildcall, Formless Nurturing), the rest one each. Batch 155's
    leading blocker: the optional "you may reveal a Dragon card from your hand" additional cost
    (`cost:additional-cost-reveal` — 7); then a chosen-colour protection grant
    (`effect:grant-protection-choice`, 19 over the pool). Batch 154's blockers are one each, no leader (`docs/card-blockers.md`). Batch 153's leading blocker:
    the processors' "put a card an opponent owns from exile into that player's graveyard"
    (`cost:put-opponent-exiled-card-into-graveyard` — 12, every processor in the set, as a cost
    or a "you may … if you do"). Batch 152's leading blockers: "choose the same mode more
    than once" (`effect:modal-repeat-modes` — the three Confluences), "target opponent exiles
    cards from their hand" (`effect:target-player-exiles-from-hand` — Mindmelter, Witness the
    End). Batch 150's leading blockers:
    meld (`mechanic:meld`, 15 cards now), the Conspiracy draft's own abilities
    (`mechanic:draft-matters`, 15 — kept blocked, even the two whose draft text leaves a vanilla
    body), the secret-discard gap (`effect:hidden-simultaneous-choices`, 14) and "can block an
    additional creature" (`static:block-additional-creature`, 14). Batch 149's: undaunted
    (`keyword:undaunted`, 6) and "whenever this creature crews a Vehicle"
    (`trigger:crews-or-saddles`, 5); "pay any amount of {E}" (`cost:pay-any-amount-of-energy`) is
    at 12. The earlier improvise
    cards were rechecked in batch 144; three wait on granting it (`static:grant-improvise`). Leads: "discard up to N cards" (Daretti, Scrap Savant, Tersa, Cathartic Pyre —
    Kinetic Augur already does it as a 0/1/2 modal count, so it may already be expressible), "choose a card name" (`decision:choose-card-name`
    — Failure // Comply, Gideon's Intervention, Dispossess, Sorcerous Spyglass), "can block an
    additional creature" (`static:block-additional-creature` — 4), "your life total becomes N"
    (`effect:life-total-becomes` — 7)
    (`npm run cards:sets -w engine -- --next 60`). Counting cards in exile now blocks six (`amount:count-in-exile`). Leading blockers after M20: "you may choose not to untap" (`static:may-choose-not-to-untap`, 4) with "for as
    long as it stays tapped" (`effect:duration-while-source-tapped`, 3), an Aura's lasting "loses
    all abilities" (`static:static-lose-all-abilities`), and "put into a graveyard from the
    battlefield this turn" (`filter:put-into-graveyard-from-battlefield-this-turn` — Salvager of
    Ruin, Gerrard, Weatherlight Hero). The most shared blocks of the last three
    sets (the rest-of-turn triggered ability that led them was built in batch 147): the Mastery cycle's "if the alternative
    cost was paid" (`condition:alternative-cost-paid`, 4), "you've discarded a card this turn"
    (`stat:cards-discarded-this-turn`, 4) and an Aura granting the Equipment it enchants a static
    (`static:grant-static-ability`, 3 — the Runes).
    **Enlist** (702.154 — an optional cost to attack, 508.1g: a new choice while attackers are
    declared, so a client change with a live check) blocks 11 of Dominaria United's cards and
    Aradesh.
    The two features blocking the most of what's left: **meld** (rule 712 — `mechanic:meld`, 15 cards:
    the three BRO melded faces, Urza, Lord Protector, Mishra, Claimed by Gix, Titania, Voice of Gaea,
    Hanweir Battlements, Bruna, Gisela, Graf Rats and the Eldritch Moon results …) and **miracle** (702.94 — `keyword:miracle`, 12: Terminus,
    Entreat the Angels, Temporal Mastery, 40K's Triumph of Saint Katherine and Sister Repentia …).
    Phyrexia: All Will Be One's blocks are
    nearly all one card each — the most shared: "whenever you proliferate" (Voidwing Hybrid,
    Venser), a target's controller's poison counters (Bring the Ending, Anoint with Affliction), and
    a static scoped by "has toxic" (Skrelv's Hive). March of the Machine's leaders: one target slot for a player
    or a battle (`target:battle-or-opponent` — Invasion of Regatha, Ayara; `target:player-or-battle`;
    `target:planeswalker-or-battle-of-that-player`), "transformed permanent" and "double-faced card"
    filters (`filter:transformed`, `condition:filter-double-faced` — Overgrown Pest, Mutagen
    Connoisseur, Oculus Whelp, Invasion of Pyrulea), and backup granting a static ability
    (`effect:backup-grants-static`). The Aftermath's leaders: a variable total of counters to distribute
    (`effect:distribute-counters-variable-total`), an owner ordering several cards going to the same
    end of their library (`decision:owner-orders-library-placements` — Tolarian Contempt,
    Aetherspouts), and planeswalkers made creatures (`static:planeswalker-becomes-creature`). The Lord
    of the Rings' leaders: a voter's own choice after a vote (`effect:voter-chooses-permanent` —
    Elrond, Expropriate's `filter:owned-by-voter`), "if it would die this turn, exile it instead" on
    a target (Smite the Deathless), and secret choices that aren't votes (`mechanic:secret-choice`). Wilds of Eldraine's leaders: one Role per matching permanent
    (`effect:create-token-attached-each` 2) and tapping an opponent's creature as a trigger
    (`trigger:you-tap-opponent-creature`, 3 across both spellings). Doctor Who's leaders:
    face-down Cybermen (`mechanic:face-down`) and a spell exiling itself suspended
    (`effect:exile-self-with-time-counters` 3). Lost Caverns' leader: a craft back face reading "the exiled
    cards used to craft it" for its P/T, keywords or colours (`bug:cda-cards-exiled-with` 3). Karlov Manor's leaders:
    turning a face-down permanent face up as an effect (`effect:turn-face-up` 6) and naming the
    enchanted permanent (`effect:effect-on-enchanted-permanent` 4). MH3's leaders: paying any amount of energy (`cost:pay-any-amount-of-energy`)
    and bestow, five cards each; Fallout's a "whenever one or more nonland cards are milled" trigger
    (`trigger:mills-trigger` 3, its per-card form 2 — the engine already emits `cards-milled`) and
    naming the equipped or enchanted creature (`effect:attached-effect-ref` 3). Leading blockers now:
    `npm run cards:needs -w engine -- --rank` (attach extensions, X targets). Batches run 4-5 agents
    with more cards each; features build in parallel worktrees. Batch 68's blockers are one or
    two cards each; `effect:manifested-this-way` (Valgavoth's Onslaught, Weight Room) is the only
    one with two. Ojer Pakpatiq waits on granting rebound, Ninja Teen on granting sneak to graveyard cards.
    About 50 more Secrets of Strixhaven preparation cards below its threshold can be read now
    that prepare is built (`card:scaffold` drafts them).

- **The rest of Ravnica: City of Guilds — Ravnica is whole** (batch 234, the second middle walk's
  last batch, 2026-10-27): no engine change. 53 of the set's last 77 authored — Plague Boiler,
  Woebringer Demon, Razia's Purification, Flash Conscription, Light of Sanction, the radiance
  cards batch 229 left (Cleansing Beam, Wojek Embermage and Wojek Siren finished by the
  scaffolder; Surge of Zeal) and the "if {X} was spent" riders — by four `card-author` agents,
  and 24 blocked (`B234.json`). `set-rav-batch-2A`…`2D`. The second middle walk's range
  (Coldsnap back to Ravnica: City of Guilds) is done.
- **Invasion — Invasion is whole** (batch 232, the sixth middle walk, 2026-10-27): 66 of its
  last 101 new cards authored — the scaffolder finished the four kicker Emissaries; five
  `card-author` agents and the lead the rest: Yawgmoth's Agenda, Pure Reflection (an X/X white
  Reflection, never printed), Winnow, Metathran Aerostat, the split cards Stand // Deliver,
  Pain // Suffering and Assault // Battery, the domain cards (Kavu Scout, Strength of Unity,
  Exotic Curse, Wayfaring Giant, Ordered Migration, Wandering Stream) — and 35 blocked
  (`B232.json`), no feature built. The sixth middle walk's range (Apocalypse back to Invasion)
  is done.
- **The rest of Mercadian Masques — Mercadian Masques is whole, and the oldest-first walk's range
  is done** (batch 233, the oldest-first walk, 2026-10-27): no engine change. 99 of its last 123
  authored — Delraich, Rishadan Pawnshop, Indentured Djinn, Bifurcate, Kyren Toy, Mercadian Lift,
  Chameleon Spirit, Nether Spirit, the Legates, the Cateran and Ramosian searchers, the
  spellshapers, the Flailing three — and 24 blocked (`B233.json`). Every set from Alpha to
  Mercadian Masques is walked.
- **"With the same name as that spell", and Odyssey — Odyssey is whole** (batch 231, the fifth
  middle walk's last, 2026-10-27, `amount:count-in-graveyards-same-name-as-trigger-spell`):
  **built** `CardFilter.sameNameAsTriggerObject` — bound as the effect applies to the trigger
  object and its name (rule 201.2a), as `sameNameAsTarget` is to a target slot — so a
  `countInGraveyard` of it is the Shrines' "the number of cards in all graveyards with the same
  name as that spell" (`same-name-as-trigger-object.test.ts`): Cabal, Cephalid and Dwarven Shrine
  here, Aven and Nantuko Shrine from batch 225. 76 of the 106 left authored — Wayward Angel,
  Cabal Patriarch, the five Spheres, Life Burst, Mind Burst, Muscle Burst, Testament of Faith,
  Still Life, the Mystics, the Desires — by five `card-author` agents and the lead, and 30
  blocked (`B231.json`). With the fifth middle walk's range (Judgment, Torment, Odyssey) done.
- **The rest of Onslaught — Onslaught is whole** (batch 230, the fourth middle walk's last batch,
  2026-10-27): no engine change. 62 of the set's last 94 authored — Animal Magnetism, Tribal Golem,
  Withering Hex, Nameless One, Thunder of Hooves, Goblin Pyromancer, the Couriers and Gustcloaks —
  by five `card-author` agents and the scaffolder's Centaur Glade, and 32 blocked (`B230.json`).
  The fourth middle walk's range (Scourge back to Onslaught) is done.
- **Morph costs that aren't mana, and Onslaught's most-played** (batch 224, the fourth middle
  walk, 2026-10-27, `cost:morph-pay-life`, `cost:morph-sacrifice`, `cost:morph-discard-card`,
  `cost:morph-return-permanent`): **built** `MorphCost.also` (rule 702.37e) — "Morph—Pay 5 life",
  "Sacrifice two Mountains", "Discard a Zombie card", "Return a Bird you control to its owner's
  hand" — paid as it's turned face up, chosen while it's still face down, read by the
  scaffolder, with the six cards it unblocked (Zombie Cutthroat, Putrid Raptor, Raven Guild
  Initiate, Skirk Volcanist, Fathom Seer, Gathan Raiders). 65 of Onslaught's 105 most-played left
  authored — Exalted Angel, Rotlung Reanimator, Astral Slide, Krosan Tusker, Voice of the Woods,
  Lightning Rift, the Chains — by five `card-author` agents, and 40 blocked (`B224.json`); the
  rest of Onslaught (94) is round twenty's.
- **The rest of Time Spiral — Time Spiral is whole** (batch 228, the middle walk's last batch,
  2026-10-27): no engine change. 58 of the set's last 89 authored — Triskelavus (with its
  Triskelavite token), Sarpadian Empires, Vol. VII, Phyrexian and Weatherseed Totem, Candles of
  Leng, Cavalry Master, Plague and Quilled Sliver — by five `card-author` agents and the
  scaffolder's four echo cards, and 31 blocked (`B228.json`). The middle walk's second range
  (Eventide back to Time Spiral) is done.
- **Radiance, and Ravnica: City of Guilds' ~76 most-played** (batch 229, the second middle
  walk, 2026-10-27): **built** radiance's "target X and each other X that shares a color with it"
  (`CardFilter.sharesColorWithTarget`, rule 105.2 — bound to the target and its colors as the
  effect applies, like `sameNameAsTarget`), taught to the scaffolder (destroy/untap/tap, damage
  and +N/+N forms). 50 of the 76 authored — Brightflame, Leave No Trace, Rally the Righteous,
  Firemane Angel, Razia, Nullstone Gargoyle, Dimir Doppelganger, Loxodon Hierarch, Tolsimir
  Wolfblood, the Hunted creatures — by four `card-author` agents and the lead; 26 blocked
  (`B229.json`). `set-rav-batch-1.test.ts`.
- **Amplify and provoke, and Legions — Legions and Mirrodin are whole** (batch 219, the fourth
  middle walk, 2026-10-27, `effect:must-block-this-turn`): **built** amplify (rule 702.38 —
  `CardDefinition.amplify`, the hand's cards sharing a creature type revealed as it enters),
  provoke (702.39 — the `provoke()` helper) and the `block-if-able` effect under it, a blocking
  requirement on one creature (509.1c — `GameState.blockRequirements`, weighed beside Lure in
  `combat/blocking.ts`), which the 34 triaged "blocks (it) this turn if able" cards waited on;
  the scaffolder reads both keywords. 88 of 116 authored — the rest of Mirrodin (Arc-Slogger,
  Inertia Bubble) and Legions (Willbender, Essence Sliver, Toxin Sliver, Imperial Hellkite,
  Hunter Sliver, the amplify and provoke cards) — by five `card-author` agents and the lead, and
  28 blocked (`B219.json`).
- **"Any player may activate this ability" and "unless any player pays", and Prophecy — Prophecy
  is whole** (batch 222, the seventh middle walk, 2026-10-27, `effect:any-player-may-activate`,
  `cost:any-player-may-activate`, `effect:unless-any-player-pays`): **built**
  `ActivatedAbility.anyPlayer` (rule 602.2 — offered to every player, the activator controlling
  the ability, paying its costs and being "you" in its condition) and the rhystic `unless`
  (`chooser: "any-player"`, each player in turn from the active player, the next only once the one
  before declines; Browbeat's `takeDamage` option), both read by the scaffolder, with the eleven
  earlier cards they unblocked (Icy Prison, Browbeat, Breaking Point, Book Burning, Barbarian
  Bully, Feral Hydra, Oona's Prowler, Well of Knowledge, Deadly Designs, Aether Storm, Infinite
  Hourglass). 78 of Prophecy's 113 authored — Rhystic Tutor, Infernal Genesis, Excavation, the
  Spellshapers Alexi, Greel and Latulla, Avatar of Fury, Rhystic Lightning, Elephant Resurgence —
  by five `card-author` agents and the lead, and 35 blocked (`B222.json`).
- **Planeshift — Planeshift is whole** (batch 221, the sixth middle walk, 2026-10-27): 76 of its
  108 remaining new cards authored — the scaffolder finished the three kicker Battlemages and
  Stratadon; five `card-author` agents the rest: the five Lairs, the gating creatures (Cavern
  Harpy, Silver Drake, Horned Kavu…), the Familiars, Phyrexian Tyranny, Tahngarth, Nemata,
  Shifting Sky, Voice of All — and 32 blocked (`B221.json`), no feature built. Found and fixed:
  the five Medallions (`medallion()`) made every player's spells of their colour cost {1} less.
- **Torment — Torment is whole** (batch 220, the fifth middle walk, 2026-10-27): 85 of its 115
  remaining new cards authored — **built "discard X cards" as a spell's additional cost**
  (`cost:discard-x-cost`: `additionalCost.discard: "x"`, rules 601.2b and 601.2h, with a sacrifice
  effect's `count` and a search's `min` as amounts; the scaffolder reads the line;
  `discard-x-cost.test.ts`), on which the lead authored the seven Dreams and Firestorm (B175) and
  Channeled Force (B117); the scaffolder finished six, five `card-author` agents 72 — Grim
  Lavamancer, Faceless Butcher, Mortal Combat, Parallel Evolution, Llawan, the Possessed cycle,
  Krosan Restorer, Cephalid Aristocrat, Basking Rootwalla — and 30 blocked (`B220.json`).
- **Judgment — Judgment is whole** (batch 217, the fifth middle walk, 2026-10-27): 55 of its 102
  remaining new cards authored by five `card-author` agents — the Phantoms (Nishoba, Flock, Tiger,
  Nomad, Nantuko), the Wormfang Drake, Newt and Turtle, Valor, Seedtime, Grizzly Fate, Epic
  Struggle, Silver Seraph — and 47 blocked (`B217.json`), no feature built.
- **"And all other permanents with the same name as that permanent", and Darksteel — Darksteel
  is whole** (batch 214, the third middle walk, 2026-10-27, `condition:same-name-as-target`):
  **built** `CardFilter.sameNameAsTarget` (rule 201.2a — the target and its untargeted namesakes
  in one `-all` effect, a face-down target alone; the scaffolder reads the destroy, exile,
  return-to-hand and +N/+N forms) and authored the Echoing cycle with it and ten earlier cards:
  Maelstrom Pulse, Detention Sphere, Bile Blight, Declaration in Stone, Deputy of Detention,
  Banishment, Sever the Bloodline, Homing Lightning, Izzet Staticaster, Wake of Destruction. 68
  of Darksteel's 102 authored — Gemini Engine, Spellbinder, Vex, Furnace Dragon, Myr Matrix,
  Wirefly Hive, Pristine Angel — by five `card-author` agents and the lead, and 34 blocked
  (`B214.json`).
- **Nemesis — Nemesis is whole** (batch 223, the seventh middle walk's first batch, 2026-10-27):
  no engine change; fading authored as its two pieces (an enters-with fade counters replacement
  and an upkeep remove-or-sacrifice trigger). 67 of Nemesis's 104 left authored — Parallax Wave,
  Parallax Tide, Blastoderm, Massacre, Lin Sivvi, Ascendant Evincar, Accumulated Knowledge — by
  five `card-author` agents and the lead, and 37 blocked (`B223.json`), the sacrifice alternative
  cost (`cost:alt-cost-sacrifice`, four) leading.
- **Two kicker costs, and Apocalypse — Apocalypse is whole** (batch 218, the sixth middle walk,
  2026-10-27, `keyword:two-kicker-costs`): **built** "Kicker [A] and/or [B]" (rule 702.33b, f —
  `kicker.second`, offered as the first, the second or both; `self-kicked`'s `with` for "kicked
  with its [A] kicker" and "kicked twice"), read by the scaffolder, with the five volvers,
  Illuminate and six earlier cards (Archangel of Wrath, Ana Battlemage, Wastescape Battlemage,
  Vodalian Mindsinger, Stronghold Arena, Temporal Firestorm). 75 of Apocalypse's 100 authored —
  Fire // Ice, Spiritmonger, Prophetic Bolt, the Sanctuaries, the Penumbras, Gaea's Balance — by
  five `card-author` agents and the lead, and 25 blocked (`B218.json`). Forked Bolt, which had no
  `divided`, deals its damage again.
- **Scourge — Scourge is whole** (batch 216, the fourth middle walk's first batch, 2026-10-27):
  no engine change. 59 of Scourge's 90 authored — Decree of Justice, Karona False God, Ambush
  Commander, Pyrostatic Pillar, Xantid Swarm, Eternal Dragon, the Dragon Auras — by five
  `card-author` agents and the scaffolder, and 31 blocked (`B216.json`), non-mana morph costs
  leading with four.
- **Sunburst, and Fifth Dawn — Fifth Dawn is whole** (batch 213, the third middle walk's range
  taken by a newest-first session, 2026-10-26, `keyword:sunburst`): **built** sunburst (rule
  702.44 — the `sunburst()` helper, +1/+1 counters by its copiable creature type or charge
  counters, one per colour spent to cast it) and Modular—Sunburst, both read by the scaffolder,
  with Pentad Prism (B26). 70 of Fifth Dawn's 95 authored — Engineered Explosives, Vedalken
  Shackles, Etched Oracle, Helm of Kaldra, the Bringers, Raksha Golden Cub — by four
  `card-author` agents and the lead, and 25 blocked (`B213.json`).
- **A damage trigger's "that creature" for tap and exile, and the rest of Champions of Kamigawa —
  Champions is whole** (batch 212, the third middle walk's range taken by the newest-first
  walk's session, 2026-10-26, part of `trigger:trigger-recipient-ref`): **built** `tap` and
  `exile` taking `"trigger-recipient"` as `destroy` did — "whenever this creature deals combat
  damage to a creature, tap that creature and it doesn't untap during its controller's next
  untap step", "exile that creature" — and authored the seven earlier cards it unblocked (Kaldra
  Compleat, Queen of Ice, Frostwalk Bastion, Pit Spawn, Kashi-Tribe Elite, Matsu-Tribe Sniper and
  Birdstalker). 120 of Champions' last 145 authored — the five Zubera, Brothers Yamazaki, Hisoka's
  Guard, Shimatsu, Iname, Life Aspect, the Deceivers and the Kodama of the South Tree among them,
  by six `card-author` agents and the lead — and 25 blocked (`B212.json`).
- **Sacrifice or return lands as an alternative cost; the rest of Urza's Destiny, Starter 1999
  and Mercadian Masques' 95 most-played — Urza's Destiny and Starter 1999 are whole** (batch 227,
  the oldest-first walk, 2026-10-27, `cost:alt-cost-sacrifice`, `cost:alt-cost-return-lands`):
  **built** `alternativeCost.sacrifice` and `.returnToHand` (rule 118.9; paid as the cost is paid,
  601.2h), in the engine, the scaffolder and `alt-cost-sacrifice-return.test.ts`. 109 authored —
  Fireblast, Daze, Gush, Thwart, Crash, the five Flares, Hand of Emrakul, Demon of Death's Gate,
  the Borderposts, the storage lands, Larceny, Toymaker, the Rebels among them — and 33 blocked
  (`B227.json`).
- **Reveal any number of cards from your hand, the rest of Portal Three Kingdoms and Urza's
  Destiny's 60 most-played — Portal Three Kingdoms is whole** (batch 208, the oldest-first walk,
  2026-10-26, `cost:reveal-any-number-from-hand`): **built** "reveal any number of green cards in
  your hand" (rule 701.20a) — `look-and-choose`'s `"reveal"` destination over the hand, with
  `{ thisWay: "revealed" }` counting cards revealed from a hand — in the engine, the client's
  prompt, the scaffolder and `reveal-from-hand.test.ts`. 85 authored — Masticore, Donate, Flicker,
  Yavimaya Enchantress, Carnival of Souls, the Scents of Ivy, Jasmine and Brine, Lady Sun, Sima Yi
  among them — and 28 blocked (`B208.json`).
- **Time Spiral's first half, and abilities that work while a card is suspended** (batch 205, the
  middle walk, 2026-10-26; `trigger:functions-while-suspended`, rule 702.62b): `whileSuspended`
  triggers and `zone: "suspended"` activations — Greater Gargadon, Deep-Sea Kraken, Nihilith,
  Riftmarked Knight, Dinosaurs on a Spaceship — and the exile viewer's Activate. 70 of the set's
  95 most-played left authored (Draining Whelk, Living End, Bogardan Hellkite, the Slivers), 25
  blocked (`B205.json`).
- **Flip cards, the rest of Betrayers of Kamigawa — Betrayers is whole — and Champions of
  Kamigawa's 52 most-played** (batch 207, the third middle walk, 2026-10-26,
  `mechanic:flip-cards`): **built** flip cards (rule 710 — `flip: true` halves, the `flip` effect,
  the flipped status a copy reads by its own status, 707.3; `put-onto-battlefield`'s `flipped`;
  `flip-cards.test.ts`), taught to the scaffolder, and authored 14 of the 20 flip cards across
  Saviors, Betrayers and Champions (the ki cycle, Jushi Apprentice, Budoka Gardener, Orochi
  Eggwatcher, Initiate of Blood, Akki Lavarunner, Student of Elements, Homura, Kuon, Rune-Tail).
  80 authored with Iname, Death Aspect, the Myojin of Seeing Winds, Night's Reach, Life's Web and
  Infinite Rage, Night of Souls' Betrayal and Uyo, by five `card-author` agents and the lead; 39
  blocked (`B207.json`), splice's non-mana costs and temporary protection leading.
- **The rest of Scars of Mirrodin — Scars of Mirrodin is whole, and the newest-first walk's range
  with it** (batch 204, the newest-first walk, 2026-10-26): no feature built; an engine fix: a
  static's metalcraft condition counts its own artifact (Chrome Steed, Etched Champion and
  Razorfield Rhino needed three *other* artifacts). 40 of the 48 left authored — Rusted Relic,
  Molten-Tail Masticore, Tumble Magnet, the Trigons, Painsmith, Embersmith, Lifesmith, Rust Tick,
  Heavy Arbalest, Psychic Miasma, Glint Hawk Idol — by three `card-author` agents; 8 blocked
  (`B204.json`). Every set from Reality Fracture back to Scars of Mirrodin is whole.
- **Mirrodin Besieged whole and Scars of Mirrodin's next 50** (batch 199, the newest-first walk,
  2026-10-26): no feature built; a divided amount now survives a decision mid-resolution (Kuldotha
  Flamefiend), and Ashmouth Hound and Inferno Elemental trigger when blocked too. 82 of 104
  authored — Tezzeret, Agent of Bolas, Treasure Mage, Galvanoth, Quicksilver Gargantuan, Phyrexian
  Hydra, Hero of Oxid Ridge, Victory's Herald, Red Sun's Zenith, Mortarpod, Ratchet Bomb, the
  Spellbombs — four finished by the scaffolder, the rest by five `card-author` agents and the lead;
  22 blocked (`B199.json`), "for each Equipment attached" and "can block an additional creature"
  leading with two each. Mirrodin Besieged is whole.
- **Haunt, replicate, and Guildpact whole** (batch 206, the second middle walk, 2026-10-26,
  `keyword:haunt`, `keyword:replicate`): **built** haunt (rule 702.55 — the `haunt()` and
  `hauntSpell()` helpers exile the card haunting a target creature, `GameObject.haunting`; a
  `haunted-dies` trigger works from exile alone) and replicate (702.56 — a multikicker-style
  `kicker.keyword: "replicate"`, one cast trigger copying the spell once per payment), both taught
  to the scaffolder. 85 of Guildpact's 106 left authored — Ghost Council of Orzhova, Leyline of
  Lightning, Sky Swallower, Blind Hunter, Pyromatics, Gigadrowse, Tibor and Lumia, the Nephilim,
  the Magemarks and the bloodthirst creatures — by five `card-author` agents and the lead, with
  Shattering Spree and Lose Focus from earlier batches; 21 blocked (`B206.json`), nothing shared
  by more than one. Guildpact is whole. `haunt.test.ts`, `replicate.test.ts`.
- **Forecast, and Dissension whole** (batch 201, the second middle walk, 2026-10-26,
  `mechanic:forecast`): **built** forecast (rule 702.57 — the `forecast(ability)` helper: an
  ability of the card in its owner's hand, revealed, in their upkeep and once each turn; a
  card's once-each-turn record in a hand is now cleared each turn), taught to the scaffolder.
  85 of Dissension's 131 left authored — Momir Vig, Simic Visionary, Dovescape, Spell Snare,
  Skyscribing, Supply // Demand and the other split cards that run whole, the graft creatures and
  the Eidolons — by five `card-author` agents and the lead, with Piercing Rays and Spirit en-Dal
  from earlier batches; 46 blocked (`B201.json`), nothing shared by more than two. Dissension is
  whole. `forecast.test.ts`.
- **Horsemanship, Urza's Legacy whole and Portal Three Kingdoms' 30 most-played — Urza's Legacy
  is whole** (batch 203, the oldest-first walk, 2026-10-26, `keyword:horsemanship`): **built**
  horsemanship (rule 702.31: blocked only by creatures with it, blocks anything), in block
  legality, the bots' block math and evasion count, the scaffolder and the client's reminder;
  `horsemanship.test.ts`. 90 authored — Deranged Hermit, Bone Shredder, Second Chance, Thran Lens,
  Sun Quan, Lu Xun, Guan Yu among them, with Rolling Earthquake, Herald of Hoofbeats and The Girl in
  the Fireplace from batches 146, 30 and 93 — and 16 blocked (`B203.json`).
- **Ripple and recover, and Coldsnap whole** (batch 196, the second middle walk, 2026-10-26,
  `keyword:ripple`): **built** ripple (rule 702.60 — the `ripple(n, name)`
  helper: a `this-cast` trigger, a `may` reveal and a repeating free `cast-now` from the library
  top limited to the card's name; `cast-now`'s `repeat` now goes with `libraryTop` and `rest`, and
  `rest: "bottom-any-order"` asks the order, rule 401.4) and recover (rule 702.59 — the
  `recover(cost)` helper over the `fromGraveyard` dies trigger, a mana cost or half your life),
  both taught to the scaffolder. 79 of Coldsnap's 112 left authored — Adarkar Valkyrie, Skred,
  Soul Spike, Allosaurus Rider, Controvert, the five Surging cards and more, the "{G} or {W}"
  cumulative upkeeps as a hybrid cost — by five `card-author` agents and the lead; 33 blocked
  (`B196.json`), cumulative upkeep's other costs (six) and the Martyrs' reveal cost (five)
  leading. Coldsnap is whole. `ripple-recover.test.ts`.
- **Planar Chaos, whole** (batch 200, the middle walk's second range, 2026-10-26): no feature
  built. 73 authored — Teneb, the Harvester, Intet, the Dreamer, Life and Limb, Mirri the Cursed,
  Numot, the Devastator, the three split cards, eight Slivers and 65 more — by five `card-author`
  agents; 43 blocked (`B200.json`), suspend's exile-zone triggers and Suspend X leading.
- **Future Sight, whole** (batch 195, the middle walk's second range, 2026-10-26): no feature
  built. 76 authored — Korlash, Heir to Blackblade, Baru, Fist of Krosa, Bridge from Below,
  Narcomoeba, Storm Entity, Epochrasite, Barren Glory, Tarox Bladewing, Shah of Naar Isle and 67
  more — and 45 blocked (`B195.json`), fateseal and targets in exile leading with two each.
- **Splice onto Arcane, the rest of Saviors of Kamigawa — Saviors is whole — and Betrayers of
  Kamigawa's 72 most-played left** (batch 202, the third middle walk, 2026-10-26,
  `keyword:splice`): **built** splice with a mana cost (rule 702.47 — `CardDefinition.splice`;
  every set of splice cards in hand is its own cast variant, `splice` on the offer and the cast,
  the spliced cards' targets after the spell's own and their effects after its own, the cards
  revealed and left in hand), read by the scaffolder, with Goryo's Vengeance, Desperate Ritual,
  Everdream, Evermind, Spiritual Visit, Into the Fray and Splicer's Skill. 69 authored —
  Toshiro Umezawa, Sakiko, Mother of Summer, Shizuko, Caller of Autumn, Yomiji, Who Bars the
  Way, Oyobi, Who Split the Heavens, Genju of the Cedars and the rest — by five `card-author`
  agents and the lead; 43 blocked (`B202.json`). `keyword-splice.test.ts`.
- **Epic, and Saviors of Kamigawa's 100 most-played left** (batch 197, the third middle walk,
  2026-10-26, `keyword:epic`): **built** epic (rule 702.50 — the `epic` effect, last in the
  spell's sequence: its controller can't cast spells for the rest of the game,
  `PlayerState.cantCastSpellsForGame`, and an emblem's upkeep trigger copies the spell as it
  resolved, the copy marked `withoutEpic`), with Enduring Ideal and Endless Swarm; and the
  `bushido(n)` and `soulshift(n)` helpers, read by the scaffolder for Champions and Betrayers. 67
  authored — Sekki, Seasons' Guide, Kiyomaro, Iname as One, Skyfire Kirin, Measure of Wickedness,
  Barrel Down Sokenzan (sweep) and 61 more — by five `card-author` agents and the lead; 33 blocked
  (`B197.json`), splice onto Arcane leading with four. `keyword-epic.test.ts`.
- **"Look at target player's hand", and the rest of Urza's Saga — Urza's Saga is whole** (batch
  198, the oldest-first walk, 2026-10-26, `effect:look-at-target-player-hand`): **built** the
  `look-at-hand` effect (the hand shown to its looker alone, a `choose-from-zone` with nothing to
  pick, closed with Done) and `discard-chosen`'s `upTo` ("choose up to X cards from it"), taught
  to the scaffolder; with them Glasses of Urza, Clairvoyance, Sorcerous Sight, Talas Explorer,
  Ingenious Thief and Discordant Dirge. 57 of the set's last 81 authored — Somnophore, Electryte,
  Midsummer Revel, Torch Song, the Runes of Protection and the Hidden, Opal and Veiled enchantments
  among them — and 24 blocked (`B198.json`), "up to X targets" (`decision:x-targets`) and "becomes
  an enchantment" (`effect:set-types-temporary`) leading with three each.
- **The rest of Lorwyn — Lorwyn is whole** (batch 192, the middle walk's second range, 2026-10-26):
  **built** a "whenever you clash" trigger (rule 701.30, `trigger:clash` — each clashing player
  clashes, a `clashed` event apiece once the cards have moved, whoever started it; `won: true` for
  "clash and win"; "if you won" is the new `trigger-value` condition). 62 authored — Hostility,
  Gilt-Leaf Palace and Secluded Glen (their changeling blocker stale), Sylvan Echoes, Rebellion of
  the Flamekin, Entangling Trap, Hearthcage Giant, Gilt-Leaf Ambush and 54 more — and 20 blocked
  (`B192.json`), "reveal a card from your hand" as an additional cost leading with four.
- **The rest of Commander 2011 and New Phyrexia whole** (batch 194, the newest-first walk,
  2026-10-26): no feature built. 64 of 99 authored — Riku of Two Reflections, Tariel, Basandra,
  Jor Kadeen, Martyr's Bond, the Vows, the Splicers, Shrines and Exarchs, Whispering Specter,
  Reaper of Sheoldred, Auriok Survivors — four finished by the scaffolder, the rest by five
  `card-author` agents; 35 blocked (`B194.json`), the Chancellors' opening-hand reveal
  (`new:opening-hand-actions` — 5) and join forces (`new:join-forces` — 3) leading. Commander 2011
  and New Phyrexia are whole.
- **Echo, and Urza's Saga's 90 most-played left** (batch 193, the oldest-first walk, 2026-10-26,
  `keyword:echo`): **built** echo (rule 702.30 — the `echo(cost)` helper, a mana cost or any
  `UnlessOption`; its intervening if the `source-came-under-control-since-last-upkeep` condition,
  over `GameObject.controlSinceSeq` and `PlayerState.previousUpkeepSeq`), taught to the
  scaffolder; with it Urza's Saga's echo creatures (Crater Hellion, Albino Troll, Lightning Dragon
  and 11 more) and Karmic Guide, Mogg War Marshal, Orcish Hellraiser and Rakdos Headliner from
  earlier batches. 70 of the half's 90 authored — Lotus Blossom, Karn, Silver Golem, Confiscate,
  Ill-Gotten Gains, Thran Turbine, Barrin's Codex and more — by five `card-author` agents and the
  lead; 20 blocked, two at most per need (`B193.json`). `echo.test.ts`.
- **The rest of Innistrad and Magic 2012 whole** (batch 191, the newest-first walk, 2026-10-26):
  **built** a spell's additional cost of exiling N cards from your graveyard
  (`cost:exile-from-graveyard-additional` — `additionalCost.exileFromGraveyard`, read by the
  scaffolder), with the Skaabs: Skaab Goliath, Stitched Drake, Makeshift Mauler and five triaged
  earlier on it alone (Skaab Ruinator, Relentless Skaabs, Headless Skaab, Cobbled Lancer, Abhorrent
  Oculus). 77 authored — Chandra, the Firebrand, Master Thief, Chandra's Phoenix, the Empires
  cycle, the werewolves and bloodthirst's cards (an enters-with-counters replacement, rule
  702.54a) — and 23 blocked, one each (`B191.json`). Innistrad and Magic 2012 are whole.
- **Lorwyn's 90 most-played left** (batch 189, the middle walk's second range, 2026-10-26):
  **built** clash (rule 701.30, `mechanic:clash` — the `clash` effect: the opponent chosen, both
  top cards revealed, each player's top-or-bottom choice in APNAP order, `won` / `lost` with
  `"that-player"` the opponent, `repeat` for Hoarder's Greed), champion (rule 702.72,
  `keyword:champion` — the `champion()` helper over existing shapes, Mistbind Clique's "when a
  Faerie is championed" a reflexive trigger), a spell returning itself to its owner's hand as it
  resolves (rule 608.2n — `return-to-hand` of `"source"` from the stack), and `mill` of an object
  slot's controller. 81 authored — Mistbind Clique, Pestermite, Cloudthresher, Brion Stoutarm,
  Incendiary Command and 76 more, with eight Morningtide cards batch 186 blocked on clash or
  champion (Release the Ants, Titan's Revenge, Lightning Crafter and five more) — and 19 blocked,
  one or two each (`B189.json`).
- **The rest of Dark Ascension and Innistrad's next 60** (batch 188, the newest-first walk,
  2026-10-26): **built** "at the beginning of enchanted player's upkeep / draw step / end step"
  (`trigger:enchanted-player-step-begins` — `step-begins` with `who: "attached"`, read by the
  scaffolder), with Curse of the Bloody Tome, Curse of Oblivion and four Curses triaged earlier on
  it alone (Curse of Obsession, Curse of Unbinding, Torment of Scarabs, Cruel Reality). 83
  authored — Geist of Saint Traft, Garruk Relentless, Delver of Secrets, Helvault, Mayor of
  Avabruck and 78 more — and 21 blocked, one or two each (`B188.json`). Dark Ascension is whole.
- **The rest of Avacyn Restored and Dark Ascension's 40 most-played** (batch 185, the
  newest-first walk, 2026-10-26): **built** soulbond (rule 702.95, `keyword:soulbond` —
  `soulbond()`'s two triggers, a `{ scope: "paired" }` static, the `paired` filter clause, the
  pairing ended for good by 702.95e), with AVR's eleven soulbond cards and eleven triaged earlier
  on it alone (Deadeye Navigator, Tandem Lookout, Silverblade Paladin, Wolfir Silverheart and
  seven more). 89 authored — Falkenrath Aristocrat, Requiem Angel, Drogskol Captain, Ghoultree,
  Rite of Ruin and 84 more — and 28 blocked, one or two each (`B185.json`). Avacyn Restored is
  whole.
- **Magic 2013 whole and Avacyn Restored's 60 most-played** (batch 182, the newest-first walk,
  2026-10-26): **built** miracle (rule 702.94, `keyword:miracle` — `miracle: { cost }`: the first
  card drawn in a turn may be revealed, a `miracle-reveal` decision hidden from other seats, and
  its trigger offers the cast from hand for the miracle cost), with AVR's six miracles and nine
  triaged earlier on it alone (Temporal Mastery, Reforge the Soul, Entreat the Angels and six
  more); `damage-all` scoped to a targeted planeswalker's controller (Chandra's Fury). 83
  authored — Bonfire of the Damned, Sublime Archangel, Vexing Devil, Tibalt, Diabolic Revelation
  and 78 more — and 27 blocked, soulbond the most (`B182.json`). Magic 2013 is whole.
- **Morningtide whole** (batch 186, the middle walk's second range, 2026-10-26): **built** prowl
  (rule 702.76a, `keyword:prowl` — `prowl(mana)`, the `prowl` condition over the creature types
  each player dealt combat damage to a player with this turn, and `self-prowl-paid`) and kinship
  (`kinship()`, the `sharesCreatureTypeWith: "source"` filter), both read by the scaffolder. 78
  authored — the 12 kinship cards, Latchkey Faerie, Morsel Theft, Rhys the Exiled, Sage's
  Dousing, Stomping Slabs, the bannerets and kindred Equipment, with Enigma Thief and Notorious
  Throng from earlier batches — and 30 blocked, clash leading with 8 (`B186.json`). Morningtide is
  whole.
- **Shadowmoor, the rest of the set** (batch 183, the middle walk's second range, 2026-10-26,
  `2c35e3ea`): no feature built — hybrid mana, {Q}, -1/-1 counters, wither, persist and conspire
  (batch 180's) were all in. 60 of its last 80 authored by four `card-author` agents and the
  scaffolder — Wild Swing, Firespout, Demigod of Revenge, Tyrannize, Isleback Spawn, the Duos,
  Cohorts and Initiates and 50 more — and 20 blocked, one card a need but "attached to target
  creature" (`filter:attached-to-target`, two) (`B183.json`). With batch 180's half, Shadowmoor
  is whole.
- **Return to Ravnica, the rest of the set** (batch 179, the newest-first walk, 2026-10-26):
  **built** unleash (rule 702.98a, `keyword:unleash` — asked as it's about to enter, as riot is,
  and a `cant-block` restriction while it has any +1/+1 counter) and detain (rule 701.35a,
  `keyword:detain` — the `detain` effect: can't attack or block and no activated abilities until
  your next turn), with the set's twenty cards with either and three triaged earlier on them
  alone (Rakdos Drake, Exava, Rakdos Blood Witch, Lyev Decree). 97 of its 122 left authored —
  Niv-Mizzet, Dracogenius, Desecration Demon, Archon of the Triumvirate, Hypersonic Dragon,
  Firemind's Foresight and 92 more — and 25 blocked, one or two cards a need (`B179.json`).
  Return to Ravnica is whole.
- **Gatecrash, the rest of the set** (batch 176, the newest-first walk, 2026-10-26):
  **built** cipher (rule 702.99, `keyword:cipher` — `cipher: true`: as the spell's last step its
  controller may exile it encoded on a creature they control, which then casts a free copy
  whenever it deals combat damage to a player, for as long as the card stays exiled and the
  creature on the battlefield), with the set's nine cipher cards — Shadow Slice, Hands of Binding,
  Undercity Plague, Voidwalk and five more — and five triaged earlier on cipher alone (Hidden
  Strings, Stolen Identity, Whispering Madness, Writ of Return, Arcane Heist). 91 of its 116 left
  authored — Domri Rade, Gideon, Champion of Justice, Biovisionary, Luminate Primordial, Deathpact
  Angel and 86 more — and 25 blocked, one or two cards a need (`B176.json`). Gatecrash is whole.
- **Eventide, whole** (batch 177, the middle walk's second range, 2026-10-26): **built** retrace
  (rule 702.81a — `retrace: true`, its own `via: "retrace"` graveyard cast, a land card discarded,
  nothing exiling it; `keyword:retrace`) and the untap symbol {Q} (rule 107.6 — `AbilityCost.untap`;
  `cost:untap-symbol-cost`), both read by the scaffolder. 93 of its last 119 authored by five
  `card-author` agents and the lead — Figure of Destiny, Ashling, the Extinguisher, Dominus of
  Fealty, Nucklavee, Raven's Crime, Worm Harvest, the Hatchlings, Mimics and Hedge-Mages and 79
  more (EVE whole) — plus six elsewhere the two features unblocked (Formless Genesis, Throes of
  Chaos, Embrace the Unknown, Decaying Time Loop, Farmstead Gleaner, Umbral Mantle); 26 blocked
  (`B177.json`), chroma over cards that aren't permanents leading with four.
- **Dragon's Maze, the rest of the set** (batch 173, the newest-first walk, 2026-10-26):
  **built** fuse (rule 702.102, `keyword:fuse` — `fuse: true` on a split card's whole: from the
  hand it is cast as both halves for both costs, the left half's targets then the right's,
  resolved half by half), and authored all fifteen of its cards but Give // Take — Wear // Tear,
  Turn // Burn, Catch // Release, Beck // Call and ten more, with Gallifrey Falls // No More and
  Double Jump // Flying Kick from other sets. 62 of its 83 left authored — Voice of Resurgence,
  Aetherling, Blood Baron of Vizkopa, Tajic, Blade of the Legion, Emmara Tandris, Sire of
  Insanity, Savageborn Hydra and the Gatekeepers and Maze creatures among them: 47 by four
  `card-author` agents, the rest the lead. DGM is whole; 21 blocked (`B173.json`), unleash and
  detain two each.
- **"Only if you've been attacked this step", "creatures attacking you", "prevent all damage
  dealt to you this turn by …"** (batch 190, the oldest-first walk, 2026-10-26,
  `effect:prevent-damage-to-you-by-filter-this-turn`): the `attacked-this-step` condition (rule
  508.3b, per combat — Portal's eleven declare-attackers instants: Just Fate, Harsh Justice, Deep
  Wood, Command of Unsummoning …), the `attackingYou` filter (Blessed Reversal),
  `prevent-damage-to-you { by }` (Deep Wood, Scarecrow, Al-abara's Carpet) and
  `BEFORE_ATTACKERS_DECLARED` (Portal's eleven "activate only during your turn, before attackers
  are declared"). Fixed: a trigger's any-number group with fewer options than its minimum is
  removed (603.3d — Sea Drake), and a shuffle-into-library whose card has gone still shuffles
  (Angel of Fury). `attacked-this-step.test.ts`.
- **Portal and Portal Second Age, whole** (batch 190, the oldest-first walk, 2026-10-26): 89 of
  their 113 left authored — Flux, Exhaustion, Temporary Truce, Cruel Bargain, Harsh Justice, Sea
  Drake, Magma Giant, Return of the Nightstalkers and more — by five `card-author` agents and the
  lead; 24 blocked (`B190.json`). Both sets are whole.
- **Random-discard costs, buyback's non-mana costs, the compared-opponent target** (batch 187,
  the oldest-first walk, 2026-10-26, `cost:discard-at-random`, `cost:buyback-non-mana`,
  `target:opponent-compared`): an activated ability's `cost.discard.random` and a spell's
  `additionalCost.discardAtRandom` (Mage il-Vec, Ogre Shaman, Sonic Burst, Coral Helm, Draconian
  Cylix, Stormbind, Canyon Drake, Amok); `kicker.also` — a kicker's life, discard or sacrifice
  beside its mana, so buyback's non-mana costs (Slaughter, Pegasus Stampede, Reaping the Rewards,
  Flowstone Flood, Forbid, Constant Mists, Walk the Aeons); `{ kind: "opponent-compared", stat,
  by }` — "target opponent who has more life than you do as you activate this ability", judged
  only as chosen (Keeper of the Flame, Light, Mind and Beasts). Scaffolder templates for both
  costs; `set-exo-batch-1.test.ts`.
- **Exodus, whole** (batch 187, the oldest-first walk, 2026-10-26): 61 of its 92 left authored —
  Sphere of Resistance, Equilibrium, Slaughter, the Keepers, Mirozel, Manabond, Paroxysm, the
  spikes, Thopter Squadron and more — by five `card-author` agents and the lead; 31 blocked
  (`B187.json`). Exodus is whole.
- **Damage redirection, one-shot shields** (rule 614.9 — batch 184, the oldest-first walk,
  2026-10-26): `prevent-damage`'s and `prevent-damage-from-chosen-source`'s `redirectTo` — the
  damage dealt to another creature, planeswalker or player by the same source, doing nothing
  while that recipient is gone or no longer a creature; a scaffolder template;
  `damage-redirection.test.ts`. The five en-Kor creatures, Daughter of Autumn, Hazduhr the Abbot,
  Zhalfirin Crusader and Jade Monolith. Static redirections (Palisade Giant, Veteran Bodyguard)
  are still `replacement:damage-redirection`.
- **Stronghold, whole** (batch 184, the oldest-first walk, 2026-10-26): 53 of its last 77
  authored — Crovax the Cursed, Change of Heart, Shard Phoenix, Mind Games, the spikes, the
  en-Kor creatures, Hornet Cannon (a colorless Hornet token) and Spike Breeder (a Spike token,
  never printed) among them, by four `card-author` agents and the lead — 24 blocked (`B184.json`).
- **Licids** (batch 181, the oldest-first walk, 2026-10-26): the `become-licid-aura` effect
  (`GameObject.licid` — an Aura enchantment at its timestamp, without that ability, attached to
  the target) and the `end-licid-effect` special action (rule 116.2c), in the client's ability
  menu; a scaffolder template; `licid.test.ts`. With it Tempest's five and Stronghold's six.
- **Tempest, the rest — Tempest whole** (batch 181, the oldest-first walk, 2026-10-26): 59 of its
  last 88 authored — Unstable Shapeshifter, Magmasaur, Spirit Mirror, Flowstone Sculpture, the five
  Licids, Excavator, Commander Greven il-Vec and more, by five `card-author` agents and the lead —
  29 blocked (`B181.json`).
- **Buyback** (rule 702.27a — batch 178, the oldest-first walk, 2026-10-26): `kicker: { cost, keyword:
  "buyback" }`, the spell returned to its owner's hand as it resolves; mana costs only (Forbid,
  Constant Mists and Walk the Aeons wait on `cost:buyback-non-mana`). A scaffolder template;
  `buyback.test.ts`. With it Capsize, Reiterate, Mystic Speculation, Haze of Rage, Sprout Swarm,
  Recruit the Worthy and Tempest's six.
- **Tempest, first half** (batch 178, the oldest-first walk, 2026-10-26): its 90 most-played of
  178 left — 63 authored by five `card-author` agents and the lead (Eladamri, Lord of Leaves,
  Apocalypse, Mogg Fanatic, Starke of Rath, Rolling Thunder, Extinction, Choke, Evincar's Justice
  and 55 more), 27 blocked (`B178.json`); 88 left.
- **Weatherlight, whole** (batch 175, the oldest-first walk, 2026-10-26): no feature built. 71 of
  its last 119 authored by five `card-author` agents and the lead — Null Rod, Abduction, Angelic
  Renewal, Teferi's Veil, Aether Flash, Gallowbraid, Morinfen, Maraxus of Keld and 63 more (WTH 105
  of 161); 48 blocked (`B175.json`), graveyard order leading with 11.
- **Visions, whole** (batch 172, the oldest-first walk, 2026-10-26): **built** the Mirage block's
  "you may cast this spell as though it had flash … sacrifices it at the beginning of the next
  cleanup step" (`flashThenSacrifice`, `effect:flash-cast-sacrifice`) and the cleanup step's
  delayed triggers and priority window (`"next-cleanup"`, rule 514.3a —
  `effect:delayed-trigger-next-cleanup`), with a scaffolder template. 67 of its last 113 authored
  by five `card-author` agents and the lead — Nekrataal, Betrayal, Femeref Enchantress, Undo,
  Bogardan Phoenix, Teferi's Realm, Spider Climb and 60 more (VIS 112 of 167) — plus Mirage's
  Lightning Reflexes, Armor of Thorns, Grave Servitude and Soar and Alliances' Thawing Glaciers;
  46 blocked.
- **The rest of Shards of Alara and Magic 2011** (batch 174, the middle walk's last, 2026-10-26):
  "begin the game with it on the battlefield" (rule 103.6a, the Leylines) built. 68 authored —
  Frost Titan, Mitotic Slime, Sphinx Sovereign, Covenant of Minds, the Heralds and 59 more, with
  Leyline of Anticipation, Sanctity, the Void and Vitality and Quicksilver, Brash Blur; 27 blocked.
  The middle walk's range (M11 and ROE back to ALA) is done.
- **Conflux, whole, and Shards of Alara's most-played** (batch 171, the middle walk, 2026-10-26):
  no engine change. 80 of the 109 authored — Ranger of Eos, Kresh the Bloodbraided, Rafiq of the
  Many, Sarkhan Vol, Mayael the Anima, Goblin Assault, Wild Nacatl, Knight-Captain of Eos,
  Apocalypse Hydra, Invincible Hymn and 70 more: Gluttonous Slime and Magma Spray finished by the
  scaffolder, 78 by five `card-author` agents. CON is whole; 54 of Shards of Alara left. 29
  blocked (`B171.json`), the devour count (`amount:creatures-devoured`, 3) the most shared.
- **Theros, the rest of the set, and Magic 2014, whole** (batch 170, the newest-first walk,
  2026-10-26): no feature built. 79 of the 95 authored — Garruk, Caller of Beasts, Xathrid
  Necromancer, Ring of Three Wishes, Banisher Priest, Imposing Sovereign, Pyromancer's Gauntlet,
  the five Magus staffs, Steelform, Battle, Thorncaster and Groundshaker Sliver and 63 more: four
  finished by the scaffolder, 75 by five `card-author` agents. THS and M14 are whole; 16 blocked
  (`B170.json`), one or two each.
- **Mirage, the rest of the set** (batch 169, the oldest-first walk, 2026-10-26; its first half
  was batch 166): no feature built. 67 of its last 110 authored by five `card-author` agents and the
  lead — Catacomb Dragon, Reign of Terror, Kaervek's Hex, Tidal Wave, Reign of Chaos, Mist Dragon,
  Ventifact Bottle, Purraj of Urborg, Jungle Patrol and 58 more (MIR 227 of 312); 43 blocked,
  Mirage's flash-and-sacrifice rider (`effect:flash-cast-sacrifice`, 3) the most shared.
- **Commander 2013, whole, and Theros's most-played** (batch 167, the newest-first walk,
  2026-10-26): the `sacrifice` trigger's `selfOnly` — "when you sacrifice this Aura", however it's
  sacrificed (the Ordeals' ruling; the scaffolder's "When you sacrifice this …"). 78 of the 111
  authored — Master of Waves, Polukranos, World Eater, Fleecemane Lion, Prognostic Sphinx,
  Shipbreaker Kraken, four Ordeals, Daxos of Meletis, Sydri, Galvanic Genius and 67 more: nine
  bestow creatures finished by the scaffolder, four Ordeals by the lead, 65 by five `card-author`
  agents. C13 is whole; 35 of Theros left. 33 blocked (`B167.json`).
- **Born of the Gods, the rest of the set** (batch 164, the newest-first walk, 2026-10-25):
  **tribute** built (rule 702.104 — `tribute: N` on the card, asked as it's about to enter on the
  `choose-creature-type` decision with a prompt the client shows; the `tribute-not-paid`
  condition, kept in last-known information; the scaffolder's "Tribute N" and "if tribute wasn't
  paid"). 91 of the set's 104 left authored by five `card-author` agents and the lead — Pharagax
  Giant, Nessian Wilds Ravager, Felhide Spiritbinder, Pain Seer, Champion of Stray Souls, Searing
  Blood and 85 more; BNG is whole. 13 blocked, one each.
- **Magic 2010 and Alara Reborn, the rest of each** (batch 168, the middle walk, 2026-10-26): no
  engine change. 82 authored — Gorger Wurm finished by the scaffolder, 81 by five `card-author` agents
  (Thraximundar, Djinn of Wishes, Finest Hour, Karrthus, Slave of Bolas, Spellbreaker Behemoth,
  Anathemancer, the Sojourners); M10 and ARB are whole. 38 blocked (`B168.json`), the five
  Borderposts on `cost:alt-cost-return-lands`.
- **Zendikar, whole** (batch 165, the middle walk, 2026-10-25): no engine change. 87 authored — 8
  finished by the scaffolder, 79 by five `card-author` agents (Journey to Nowhere, Goblin Guide, Kor
  Skyfisher, Nissa Revane, Chandra Ablaze, Punishing Fire, Kalitas, Bloodchief of Ghet, the Expeditions
  and Quests, nine Traps); 26 blocked (`B165.json`).
- **Worldwake, whole** (batch 162, the middle walk, 2026-10-25): `{ timesKicked: "source" }` (a
  multikicker count as an effect amount — Spell Contortion, Wolfbriar Elemental, Bloodhusk Ritualist,
  Deathforge Shaman, Lightkeeper of Emeria) and `StaticAbility.setColors` (layer 5 — the five colored
  Zendikons) built. 60 authored by four `card-author` agents and the lead; 16 blocked (`B162.json`).
- **Journey into Nyx, the rest of the set** (batch 161, the newest-first walk, 2026-10-25):
  **bestow** built (rule 702.103 — `bestow` on the card, an `overload` variant labelled "bestow";
  `GameObject.bestowed` and `bestowedDefinition`, the scaffolder's "Bestow {cost}"). 84 of the
  set's 103 authored by five `card-author` agents and the lead — Eidolon of the Great Revel,
  Launch the Fleet, Pharika, God of Affliction, King Macar, the Gold-Cursed, Hypnotic Siren,
  Spawn of Thraxes and 78 more — and nine older bestow cards a sixth agent took (Nyxborn Hydra,
  Eidolon of Countless Battles, Nighthowler, Springheart Nantuko, Kestia, the Cultivator and four
  more); 21 blocked, none on any one feature but "all Auras attached to it" (2).
- **Rise of the Eldrazi, whole** (batch 159, the middle walk, 2026-10-25): level up and umbra armor
  built (`levelUp`/`levelBand`/`levelStatic`, the `umbra-armor` keyword, both taught to the
  scaffolder). 102 authored by five `card-author` agents and the lead — Vengevine, Student of
  Warfare, Bear Umbra, Ancient Stirrings, Estrid, the Masked, Drana, Kalastria Bloodchief,
  Lighthouse Chronologist and 95 more, among them nine umbras, Estrid and two levelers earlier batches
  had blocked; 34 blocked, none on any one feature.
- **Magic 2015 and Conspiracy, the rest of both sets** (batch 158): **parley** built (a
  `reveal-top` with `who` and the `{ thisWay: "revealed" }` amount; the `parley` helper and a
  scaffolder template). 86 authored by five `card-author` agents and the lead — Garruk, Apex
  Predator, Nissa, Worldwaker, Muzzio, Visionary Architect, Kurkesh, Onakke Ancient, Coercive
  Portal, Dack's Duplicate, Selvala's Charge and the four older parley cards it unblocked
  (Selvala, Explorer Returned, Phabine, Boss's Confidant, Storm Fleet Negotiator, Cutthroat
  Negotiator); 27 blocked, "last turn" life loss (2) the most shared (2026-10-25).
- **Alliances, whole** (batch 163, the oldest-first walk): **built** the `exileTop` cost ("Exile
  the top N cards of your library"). 48 of its last 117 authored by five `card-author` agents and
  the lead — Gorilla Shaman, Contagion, Phelddagrif, Lord of Tresserhorn, Royal Decree, Gargantuan
  Gorilla, Exile, Dystopia, Browse, Royal Herbalist; 69 blocked, the lands' "sacrifice a … instead"
  entry and banding (4 each) the most shared (2026-10-25).
- **Homelands, whole** (batch 160, the oldest-first walk): no feature built. 46 of its last 79
  authored by five `card-author` agents — Koskun Falls, Primal Order, Chain Stasis, Serrated
  Arrows, Feroz's Ban, Drudge Spell, Sengir Autocrat, Truce, Didgeridoo, Rashka the Slayer; 33
  blocked, "doesn't untap during your next untap step" (3) the most shared (2026-10-25).
- **Commander 2014 and Khans of Tarkir, the rest of both sets** (batch 157): no feature built. 90
  authored by five `card-author` agents and the lead: Murderous Cut, Wingmate Roc, Nahiri, the
  Lithomancer, Sorin, Solemn Visitor, End Hostilities, See the Unwritten, Angel of the Dire Hour,
  Butcher of the Horde and 82 more; 31 blocked, the leader a morph cost that reveals a card
  (`cost:morph-reveal-card` — five) (2026-10-25).
- **Fate Reforged, the rest of the set** (batch 156): no feature built — `return-from-graveyard`'s
  filter now reads the spell's X (Rally the Ancestors) and a filter's `colorless: false` means one
  or more colours. 83 authored by five `card-author` agents and the lead: Dromoka, the Eternal,
  Ojutai, Soul of Winter, Shu Yun, the Silent Tempest, Daghatar the Adamant, Yasova Dragonclaw,
  Temur War Shaman, Mastery of the Unseen, Supplant Form, Write into Being, the Runemarks and the
  dash and bolster commons; FRF has no card left untriaged. 20 blocked, a non-Aura enchantment
  becoming an Aura the most shared (2026-10-25).
- **Eldritch Moon, the rest of the set** (batch 143): **emerge** built (rule 702.119 — an
  alternative cost sacrificing a creature, or an artifact for "emerge from artifact", the total
  cost reduced by its mana value; one cast offer per permanent it could sacrifice), taught to the
  scaffolder; 97 authored by four `card-author` agents and the lead — Elder Deep-Fiend, Decimator
  of the Provinces, Identity Thief, Voldaren Pariah, Lone Rider, Oath of Liliana, Blessed
  Alliance, Curious Homunculus and 89 more, with Twisted Riddlekeeper (MH3) and Cresting
  Mosasaurus (REX), which emerge also unblocked; 31 blocked (`B143.json`) (2026-10-25).
- **Conspiracy: Take the Crown, whole** (batch 142): the `monstrous` filter clause (rule
  701.37b — "as long as this creature is monstrous": Domesticated Hydra, Skittering Crustacean,
  Sinuous Vermin, Chillerpillar) built, and melee's count fixed to the opponents attacked as
  declared (702.121a), not those still attacked; 45 authored by two `card-author` agents and the
  lead — Liliana, the Last Hope, Kaya, Ghost Assassin, Besmirch, Grenzo's Ruffians, Custodi
  Soulcaller, the council's dilemma cards, and the fifteen draft-matters cards as they play
  outside a draft (their rulings' "you didn't draft one" case: Archdemon of Paliano, Pyretic
  Hunter, Garbage Fire, Regicide and eleven more); CN2 has no card left untriaged. 16 blocked,
  "whenever you become the monarch" the most shared (2026-10-25).
- **Commander 2016 and Kaladesh, whole** (batch 141): **undaunted** (rule 702.125a, the
  `selfCostReduction` amount `{ opponents: true }`; the scaffolder reads it, and improvise's
  keyword line) built; 120 authored by five `card-author` agents and the lead — Saheeli Rai,
  Verdurous Gearhulk, Confiscation Coup, Depala, Pilot Exemplar, Akiri, Line-Slinger, Ludevic,
  Divergent Transformations and the other undaunted cards (Curtains' Call among them), with eight
  earlier improvise cards rechecked (Whir of Invention, Organic Extinction, Kappa Cannoneer,
  Bottle-Cap Blast and four more); C16 and KLD have no card left untriaged. 34 blocked, "crews a
  Vehicle" the most shared (2026-10-25).
- **Dragons of Tarkir, the whole set** (batch 155): dash (rule 702.109a — `dash: { cost }`, an
  alternative cast giving haste and a return to the owner's hand at the next end step, from the
  hand or the command zone) and bolster (rule 701.39a — the `bolster` effect, chosen among the
  least-toughness creatures as it resolves), both read by the scaffolder; and a command-zone
  commander with more than one way to cast it now opens a menu of them. 122 authored — four
  `card-author` agents and the lead: Ragavan, Nimble Pilferer, Kolaghan, the Storm's Fury,
  Anafenza, Kin-Tree Spirit, Flamerush Rider and four more that waited only on dash or bolster,
  Collected Company, Descent of the Dragons, Necromaster Dragon, Swift Warkite, Ojutai's Command
  and Dromoka's Gift (2026-10-24).
- **Magic Origins, the rest of it** (batch 154): renown (rule 702.112 — the `renown()` helper,
  the `renown` effect and the `renowned` designation, a filter clause, with a `becomes-renowned`
  trigger; read by the scaffolder) and `return-to-hand-all` reading X in its filter. 84
  authored — three `card-author` agents and the lead: the 20 renown cards, Constable of the
  Realm and Aragorn, Hornburg Hero (which waited only on renown), Demonic Pact, Hixus, Prison
  Warden, Kothophed, Soul Hoarder, Erebos's Titan, Displacement Wave, Sigil of Valor and Gideon's
  Phalanx (2026-10-24).
- **Battle for Zendikar, the rest of it** (batch 153): awaken (rule 702.113 — `overload` with
  `keyword: "awaken"` and the `awaken()` helper, the land the last target; read by the
  scaffolder). 108 authored — four `card-author` agents and the lead: Ruinous Path, Gideon, Ally
  of Zendikar, Kiora, Master of the Depths, Planar Outburst, Part the Waterveil, Ugin's Insight,
  Aligned Hedron Network, Veteran Warleader and the other awaken spells (2026-10-23).
- **Oath of the Gatewatch and Commander 2015, whole** (batch 152): surge (rule 702.117 —
  `alternativeCost` with `keyword: "surge"`, `self-surge-paid`) and "if that creature would die
  this turn, exile it instead" (`exile-if-dies-this-turn` — a per-object turn number read in
  `moveObject`), with its "if a creature dealt damage this way would die" form, all three read
  by the scaffolder. 121 authored — four `card-author` agents and the lead: Reality Smasher,
  Kozilek's Return, Crush of Tentacles, Mawloc, Kalemne, Disciple of Iroas, Daxos the Returned,
  Gigantoplasm, Lava Coil, Anger of the Gods, Scorching Dragonfire and the 27 other cards
  earlier batches had blocked on the exile replacement (2026-10-23).
- **Shadows over Innistrad, whole** (batch 151): the werewolves' "if no spells were cast last
  turn, transform" built (`spells-cast-last-turn`, the scaffolder reading both faces' lines),
  with damage to a trigger's object (`damage.target: "trigger-object"`) and the all-hands count;
  a double-faced card told to enter transformed is judged by its back face (Startled Awake).
  137 authored — five `card-author` agents and the lead: the eleven werewolves, Ulrich of the
  Krallenhorde, Duskwatch Recruiter, Sigarda, Heron's Grace, Olivia, Mobilized for War, Nahiri,
  the Harbinger, Prized Amalgam, Startled Awake, Ornery Goblin, Caltrops and Storm, Queen of
  Wakanda; SOI is 230 of 267. 31 blocked, "exile it instead if it would die this turn" the most
  shared (30 cards now) (2026-10-23).
- **Conspiracy: Take the Crown and Eldritch Moon, whole** (batch 150): **emerge** built (rule
  702.119 — `emerge: { cost, from? }`, one cast offer per creature that could be sacrificed, its
  mana value off the total cost after increases) and "as long as this creature is monstrous"
  (the `monstrous` filter clause); melee fixed to count the opponents attacked as declared.
  123 authored — five `card-author` agents and the lead: Elder Deep-Fiend, Wretched Gryff,
  Decimator of the Provinces, Identity Thief, Lunar Force, Noosegraf Mob, Bedlam Reveler,
  Custodi Soulcaller, Colossus of Akros and the other monstrous cards; CN2 is 34 of 67, EMN 158
  of 199. 59 blocked, meld and the draft-only cards the most shared (2026-10-23).
- **Commander 2016 and Kaladesh, whole** (batch 149): no engine change; 101 authored by five
  `card-author` agents — Aetherstorm Roc, Demon of Dark Schemes, Nissa, Nature's Artisan,
  Fateful Showdown, Architect of the Untamed and 96 more; C16 is 39 of 56, KLD 213 of 246. 34
  blocked, undaunted the most shared (2026-10-23).
- **"Until end of turn, whenever …"** (batch 147; 2026-10-23): the leading blocker
  (`effect:delayed-trigger-rest-of-turn`, 39 cards) built as a `delayed-trigger` at `{ whenever }`,
  with its own targets and "until your next turn"; 34 cards authored on it (Massacre Girl, Vraska
  the Unseen, Basri Ket, Jaya, Fiery Negotiator, Glimpse of Nature and 29 more).
- **Aether Revolt, whole** (batch 140): **improvise** (rule 702.126a, on convoke's machinery —
  artifacts, generic mana only, the client's bar saying so) built; 99 authored by five
  `card-author` agents and the lead — Herald of Anguish, Reverse Engineer, Metallic Rebuke,
  Maverick Thopterist and the other improvise cards, Ajani Unyielding, Tezzeret the Schemer,
  Yahenni's Expertise, Treasure Keeper — with five "discard any number" rechecks (Neheb,
  Dreadhorde Champion, Cavalier of Flame, Celes, Illuminate History, The Elder Dragon War); AER
  is 161 of 186. 27 blocked, "discard up to N" the most shared (2026-10-22).
- **Amonkhet, whole** (batch 139): **embalm** (`embalmAbility`, rule 702.128a), **"lands you
  control don't untap during your next untap step"** (`skip-next-untap`, later lands included —
  the Gods' Last cards) and **"discard any number of cards"** (the discard decision's `upTo`,
  with the client's discard bar) built; 136 authored by six `card-author` agents and the lead —
  Kefnet, Bontu, Hazoret, Oketra, Rhonas's cycle, Gideon, Martial Paragon,
  Liliana, Death Wielder, Cut // Ribbons and 13 more aftermath cards, Sacred Cat — with 18
  rechecked from earlier batches (Kozilek, Butcher of Truth, Ulamog, the Infinite Gyre, Primal
  Command, Feldon's Cane, The Mending of Dominaria, Pride Sovereign); AKH is 213 of 241. 28
  blocked, "choose a card name" the most shared (2026-10-22).
- **Hour of Devastation, whole** (batch 138): **aftermath** (rule 702.127a — the second half
  cast only from a graveyard, then exiled), **exert as an activation cost** (`exertSelf`, rule
  701.43, read by the scaffolder) and **"shuffle your graveyard into your library"** built; 89
  of its last 114 authored by four `card-author` agents and the lead — Hour of Devastation,
  God-Pharaoh's Gift, Nicol Bolas, the Deceiver, Samut, Champion of Wits, Imminent Doom, nine
  aftermath split cards; HOU is 152 of 186. 25 blocked; the Gods' Last cards' "lands don't
  untap" the most shared (5) (2026-10-22).
- **Ixalan and Commander 2017, whole** (batch 137): no engine change — raid, explore, enrage,
  Treasure, crew and the flip enchantments were all there already. 111 cards authored by five
  `card-author` agents and the lead (14 explore cards the scaffolder finished) — Raging
  Swordtooth, Vindictive Lich, Kindred Boon, Conqueror's Galleon, Vance's Blasting Cannons,
  Arguel's Blood Fast, Jace, Ingenious Mind-Mage, Huatli, Dinosaur Knight, Wasitora, Mathas;
  XLN is 217 of 245, C17 38 of 56. 28 blocked, none sharing a feature (2026-10-22).
- **Ice Age, whole** (batch 136): **cumulative upkeep** built (rule 702.24, the
  `cumulativeUpkeep(cost)` helper on a new `unless` option `times`), the scaffolder taught it;
  126 of its last 256 cards authored by eight `card-author` agents and the lead — Polar Kraken,
  Illusions of Grandeur, Lhurgoyf, Jokulhaups, Hydroblast, Abyssal Specter, Hecatomb, Fiery
  Justice, the depletion lands, the Talismans and Scarabs; 130 blocked, banding (11) the most
  shared (2026-10-21).
- **Fallen Empires, whole** (batch 135): **"whenever ~ attacks and isn't blocked"** (rule
  509.3g, with its delayed form and "assigns no combat damage this turn"), **removing any number
  of counters as a cost** (X announced as it's activated) and **state triggers** (rule 603.8)
  built, the scaffolder taught all three; 48 of its last 79 cards authored by two `card-author`
  agents and the lead — Hymn to Tourach, the five storage lands, the Thallids, Farrel's Zealot,
  Homarid, Delif's Cone — plus 24 earlier cards the features unblocked (Dark Depths, Darksteel
  Reactor, Endrek Sahr, Mazemind Tome, the five Mana Batteries, Guiltfeeder, Haruspex,
  Hourglass of the Lost…); 31 blocked, banding (3) the most shared (2026-10-21).
- **The Dark, whole** (batch 134): 37 of its last 82 cards authored by three `card-author` agents
  on existing features — Safe Haven, Martyr's Cry, Venom, War Barge, Angry Mob, Banshee, Eater of
  the Dead, Festival, Uncle Istvan, Gaea's Touch; 45 blocked, mostly one apiece (2026-10-21).
- **Legends, whole** (batches 132-133): **rampage**, the **world rule** (704.5k), **"for as long as
  you control ~"** and **"can be blocked as though it didn't have landwalk"** built, the scaffolder
  taught rampage and the landwalk line; 122 of its last 219 cards authored by eight `card-author`
  agents and the lead — Nicol Bolas, Chromium, Palladia-Mors, Arcades Sabboth, Vaevictis Asmadi,
  The Tabernacle at Pendrell Vale, Moat, Kismet, Rubinia Soulsinger, Hazezon Tamar — plus ten earlier
  cards "for as long as you control" unblocked (Dragonlord Silumgar, Aegis Angel, Aladdin, Roil
  Elemental…); 97 blocked, banding (11) the most shared (2026-10-21).
- **Arabian Nights and Antiquities, whole** (batch 131): **"you may choose not to untap"** (rule
  502.3 — a choice in the untap step, without priority) and the **"for as long as ~ remains
  tapped"** duration (611.2b) built and taught to the scaffolder; 45 of their last 106 cards
  authored by four `card-author` agents and the lead — Ashnod's Battle Gear, Phyrexian Gremlins,
  Bottle of Suleiman, Erhnam Djinn, Mijae Djinn, Hurkyl's Recall, Shatterstorm — plus four earlier
  cards (Immovable Rod, The Blackstaff of Waterdeep, Entrancing Lyre, Hedge Whisperer); 61 blocked,
  banding (5) the most shared (2026-10-21).
- **Limited Edition Alpha, whole** (batch 130 — the first of the oldest-first walk), and Beta's
  last card: **a source of your choice** (rule 609.7 — the Circles of Protection, Reverse Damage,
  Healing Grace) and **colour setting** (`become-color`, layer 5 — the Laces, the Wisps) built
  and taught to the scaffolder; 79 Alpha cards authored by five `card-author` agents and the lead
  — Mind Twist, Icy Manipulator, Terror, Lord of the Pit, Cockatrice, Force of Nature, Plague Rats;
  58 blocked, banding (4) the most shared (2026-10-21).
- **Rivals of Ixalan, whole** (batch 129): its last 99 cards, with **ascend** built (rule
  702.131 — the city's blessing on permanents, any time, and on spells as they resolve; a 🏛️
  badge on the player panel) and taught to the scaffolder; 73 RIX cards authored and 11 earlier
  ascend cards unblocked (Ocelot Pride, Twilight Prophet, Wayward Swordtooth, Tendershoot Dryad,
  Radiant Destiny, Arch of Orazca…) by four `card-author` agents and the lead; RIX is 147 of 178.
  A battle whose controller left the game no longer asks them for a new protector (a fuzzer
  stall) (2026-10-21).
- **Dominaria, whole** (batch 128): its last 119 cards, 84 authored by four `card-author`
  agents and 5 by the scaffolder (kicker on permanents and "if it was kicked," taught to it) —
  Teferi, Timebender, Chandra, Bold Pyromancer, Hallar, the Firefletcher, Grunn, the Lonely King,
  Kwende, Pride of Femeref, Zahid, Djinn of the Lamp; 30 blocked, one card a need but a kicker that
  sacrifices (Goblin Barrage, Vicious Offering) (2026-10-21).
- **Commander 2018 and Core Set 2019, whole** (batch 126): their last 109 cards, 76 authored by
  four `card-author` agents and 2 by the lead — the five Storms, Ajani, Adversary of Tyrants,
  Liliana, the Necromancer, Lena, Selfless Champion, Isareth the Awakener, Chromium, the Mutable;
  "can't be blocked this turn" built as a restriction, so a later loss of abilities can't take it
  (rule 611.2c — Chromium, Tezzeret's Gatebreaker, and War of the Spark's Jace, Arcane
  Strategist); 31 blocked, umbra armor the only need shared (2026-10-21).
- **Battlebond, whole** (batch 127): its last 58 cards, 26 authored by two `card-author` agents,
  "your team" read as "you" (rule 102.4) — Krav, the Unredeemed, Regna, the Redeemer, Sylvia
  Brightspear, Khorvath Brightflame, Virtus the Veiled, Archon of Valor's Reach; 32 blocked, 16 of
  them on assist and 4 on friend or foe (2026-10-21).
- **Ravnica Allegiance, whole, with spectacle and afterlife** (batch 124): RNA's last 139 cards,
  113 authored by five `card-author` agents (restarted once, after an interruption stopped
  them) and the lead, with **spectacle** (an `alternativeCost` gated on an opponent losing life;
  `self-spectacle-paid`) and **afterlife** built and the scaffolder reading adapt — Prime
  Speaker Vannifar, The Haunt of Hightower, Light Up the Stage, Skewer the Critics, Biogenic
  Ooze, Angel of Grace, Gutterbones, the guild split cards (2026-10-21).
- **Guilds of Ravnica, whole, with jump-start and mentor** (batch 125): GRN's last 131 cards, 105
  authored by five `card-author` agents and the lead (and Quasiduplicate and Start the TARDIS
  from earlier), with **jump-start** built (rule 702.133 — the flashback cast for the card's own
  mana cost plus `discard: 1`) and a `mentor()` helper, both read by the scaffolder — Arclight
  Phoenix, Lazav, the Multifarious, Ral, Caller of Storms, Vraska, Regal Gorgon, Pelt Collector,
  Aurelia, Exemplar of Justice, the guild split cards (2026-10-21).
- **War of the Spark, whole, and entwine** (batch 123): WAR's last 112 cards, 82 authored by four
  `card-author` agents and the lead (the amass cards the scaffolder finished); and **entwine**
  built (rule 702.42 — a kicker keyword with `castModal.kickedModes`; an entwined spell isn't a
  kicked spell), with Tooth and Nail, Kaya's Guile, Goblin War Party, Savage Beating, Gravedig,
  Mirage Mockery, Road of Return, Flourishing Strike and Unbounded Potential (2026-10-21).
- **Modern Horizons, whole, and pitch costs** (batch 122): MH1's last 112 cards, 86 authored by
  four `card-author` agents and the lead, with **pitch costs** built — "[if it's not your turn,]
  you may [pay 1 life and] exile a blue card from your hand rather than pay this spell's mana
  cost" and the Incarnations' "Evoke—Exile a white card from your hand" (`alternativeCost.
  exileFromHand`, `evoke.exileFromHand`), which also brought in Force of Will, Force of
  Negation, Force of Despair, Force of Vigor, Solitude, Grief, Fury, Subtlety, Snapback,
  Misdirection, Pyrokinesis and Fury of the Horde (2026-10-21).
- **Commander 2019 and Core Set 2020, whole** (batch 121): C19's last 28 cards (11 authored)
  and M20's last 89 (74 authored), by five `card-author` agents and the lead, no engine change —
  Volrath, the Shapestealer, Sevinne, the Chronoclasm, Ghired, Conclave Exile, the M20
  planeswalkers (Chandra, Flame's Fury and Novice Pyromancer, Ajani, Inspiring Leader, Sorin,
  Vampire Lord, Mu Yanling, Celestial Wind, Vivien, Nature's Avenger) with their support cards,
  and the Elementals; 32 blocked (2026-10-21).
- **Throne of Eldraine, whole** (batch 120): its last 137 cards, 107 authored, 30 blocked, by
  seven `card-author` agents and the lead, with **"doesn't untap during its controller's untap
  step"** on what a static reaches (the `"doesnt-untap"` restriction, rule 502.3 — Tractor Beam,
  Back to Basics) and **adamant** (mana spent by colour — `manaSpentOfColors`,
  `manaSpentOfOneColor`); plus 28 earlier cards the two unblocked (Ikoria's Mythos, the Lorwyn
  Incarnations Vibrance, Wistfulness, Emptiness, Catharsis and Deceit, Void Mirror, Intruder
  Alarm, T-45 Power Armor and more) (2026-10-20).
- **The cards "enchanted creature" in an effect unblocked** (batch 119): 51 earlier-triaged cards,
  39 authored by two `card-author` agents and the lead (Colossification, Pemmin's Aura, Tarrian's
  Soulcleaver, Blade of the Bloodchief, Adventuring Gear and 34 more), 12 still blocked — 7 on
  "enchanted creature doesn't untap" (`static:doesnt-untap-filter`); with an `attachedTo` filter
  fix (the host read as it is, not through the departed Aura's snapshot) (2026-10-20).
- **Commander 2020 and Theros Beyond Death, whole** (batch 118): C20's last 35 cards (19
  authored, 16 blocked) and THB's 130 (104 authored, 26 blocked), by six `card-author` agents and
  the lead, with "this spell costs {X} less to cast, where X is your devotion to [color]" built
  (rule 700.5 — Drag to the Underworld, Daybreak Chimera) and **"enchanted creature" /
  "equipped creature" in an effect** (the `"attached"` reference — what the source is attached
  to, or last was: Starlit Mantle, Warbriar Blessing, Dreadful Apathy, Wings of Hubris, Aspect of
  Manticore) (2026-10-20).
- **Ikoria: Lair of Behemoths, whole** (batch 117): its 136 cards, 101 authored, 35 blocked,
  with **mutate** built (rule 702.140 — merged permanents, rule 730: the same object, the top
  card's characteristics and every card's abilities, coming apart as it leaves) and "whenever
  you cycle a card" / "a card with a cycling ability"; plus seven mutate cards triaged earlier
  (Nethroi, Apex of Death, Gemrazer, Sawtusk Demolisher and four more) (2026-10-20).
- **Core Set 2021, whole** (batch 116): its last 88 cards, 70 authored by three `card-author`
  agents and the lead, 18 blocked, with **hexproof from a quality** built (rule 702.11d — a
  colour, a card type or a filter; Sporeweb Weaver, Garruk's Harbinger) and three earlier-triaged
  cards it unblocked (Breaker of Creation, Thrun, Breaker of Silence, Nevinyrral, Urborg
  Tyrant) (2026-10-20).
- **Jumpstart, whole** (batch 115): its last 12 cards, 10 authored by the lead, with `cast-now`'s
  `exileAfter: "instants-and-sorceries"` built for Scholar of the Lost Trove (an artifact cast
  this way isn't exiled, its ruling); Ormos and Inniaz blocked (2026-10-20).
- **Zendikar Rising and Zendikar Rising Commander, whole** (batch 114): their 146 cards, 121
  authored, 25 blocked, with **party** built (rule 700.8 — the count, the cost reduction, the
  CDA, "if you have a full party"), "is also a Cleric, Rogue, Warrior, and Wizard" (a CDA in
  every zone), "an opponent has eight or more cards in their graveyard", and "a kicked spell" /
  "a card with a kicker ability" as filters — plus ten cards triaged earlier that those
  unblocked (Burakos, Nalia de'Arnise, the four Destined cards, Coveted Prize, Expedition
  Lookout, Tenured Oilcaster, Visions of Beyond). 0.41M tokens per card handled (2026-10-20).
- **Commander Legends, whole** (batch 113): its last 62 cards, 30 authored, 32 blocked — the set's
  long tail of one-off commanders. No engine change. The first batch on the lean `card-author`
  agent type: 19K of fixed context a turn against the general-purpose agent's 57K (2026-10-20).
- **Kaldheim and Kaldheim Commander, whole** (batch 112): their last 182 cards, 116 authored, with
  snow mana built (rule 107.4h — an `{S}` pip paid only with mana from a snow source, and "the
  amount of {S} spent"), plus Search for Glory, which it unblocked; 66 blocked. The batch's
  agents batched their tool calls: 0.66M tokens per authored card against Strixhaven's 1.11M
  (2026-10-20).
- **Strixhaven: School of Mages, whole** (batch 111): its last 161 cards, 117 authored, with
  learn built as the optional rummage alone (rule 701.48a — no deck here has a sideboard, so no
  Lesson is outside the game; `learn()`, and the scaffolder reads "Learn."); 44 blocked. The
  first batch whose agents had the generated vocabulary digest (`card:digest`) (2026-10-20).
- **Modern Horizons 2 and Commander 2021, whole** (batch 110): their last 157 cards, 109
  authored, with madness built (rule 702.35 — every discard through one `discardCards`, a card
  with madness exiled instead and its trigger a `cast-now` for the madness cost), plus 4 older
  cards it unblocked (Necrogoyf, Markov Baron, Stensia Masquerade, Call to the Netherworld); 48
  blocked. "Attacks you or a planeswalker you control" no longer fires on a battle you protect
  (`attackingYou`; Kazuul's "if you're the defending player" is `youDefend`, rule 508.5)
  (2026-10-20).
- **Adventures in the Forgotten Realms and Forgotten Realms Commander, whole** (batch 109): their
  last 185 cards, 119 authored, with the three Forgotten Realms dungeons built (Lost Mine of
  Phandelver, Dungeon of the Mad Mage, Tomb of Annihilation — `sacrifice`'s `andEach`,
  `reveal-drawn`, `cast-now` from the cards drawn) and rule 101.4 for `each-player-may` (each
  player chooses, then the discards and sacrifices happen at once), plus 8 older cards they
  unblocked (Acererak, Sefris, Nadaar, Radiant Solar, Perforating Artist, Osseous Sticktwister,
  Polygraph Orb, Fandaniel); 66 blocked (2026-10-20, adc08546).
- **Innistrad: Midnight Hunt and Midnight Hunt Commander, whole** (batch 108): their last 184
  cards, 126 authored, with coven (the `coven` condition) and the day/night trigger, condition and
  "it becomes day as this enters" built and 12 cards on them, plus 4 older coven cards (Leinore,
  Redemption Choir, Collector's Cage, Augur of Autumn); 58 blocked (2026-10-20).
- **Innistrad: Crimson Vow, whole** (batch 107): its last 167 cards, 118 authored, with training
  (702.149), exploit (702.110) and cleave (702.148) built and 31 cards on them — 23 in the set and 8
  older ones (Torens, Fist of the Angels, Warrior's Resolve, Colonel Autumn, Fell Stinger…) plus Dig
  Up and Wash Away — and 49 blocked; "dies" triggers filtered by subtype alone fixed to need a
  creature (rule 700.4, 30 cards) (2026-10-19).
- **Kamigawa: Neon Dynasty, Neon Dynasty Commander and Crimson Vow Commander, all whole** (batch
  106): their last 196 cards, 133 authored, with reconfigure built (rule 702.151) and 13 cards on
  it — 8 in the set and 5 older ones (Lion Sash, Komainu Battle Armor, Tanuki Transplanter,
  Rabbit Battery, Lizard Blades) — and the filtered attacks-alone trigger ("whenever a Samurai or
  Warrior you control attacks alone") with 10 cards on it; 63 blocked (2026-10-19).
- **Streets of New Capenna, New Capenna Commander and Double Masters 2022, all whole** (batch
  105): their last 213 cards, 107 authored, with shield counters built (rule 122.1c) and 17
  cards on them — 10 in the set and 7 older ones (Captain America, Super-Soldier, Titan of
  Industry, Diamond City…) — and 96 blocked (2026-10-19).
- **Commander Legends: Battle for Baldur's Gate, whole** (batch 104): its last 167 cards, 95
  authored (the initiative's 23 — Aarakocra Sneak, Rilsa Rael, Sarevok's Tome, Tomb of Horrors
  Adventurer, Loot Dispute, From the Catacombs… — on dungeons, venturing, the initiative and
  its two conditions; then five agents' 72 and Gorion and Venture Forth) and 72 blocked
  (2026-10-19).
- **Dominaria United and Dominaria United Commander, both whole** (batch 103): their last 165
  cards, 104 authored (Jared Carthalion, Torsten, Founder of Benalia, Najal, the Storm Runner,
  Radha, Coalition Warlord and 100 more — the domain and read-ahead cards among them) and 61
  blocked (11 on enlist, five on two-kicker costs) (2026-10-19).
- **Warhammer 40,000 Commander, whole** (batch 102): its last 92 cards, 58 authored (Space Marine
  Devastator, Vanguard Suppressor, The Swarmlord, Lucius the Eternal and 54 more) and 34 blocked
  (three on miracle); with **domain** (rule 207.2c — `{ basicLandTypes: "you" }` as an effect
  amount, a cost reduction and a CDA count: Nishoba Brawler, Yavimaya Sojourner, Meria's Outrider,
  Jodah's Codex) and **read ahead** (702.155 — The Weatherseed Treaty, The Cruelty of Gix) built for
  Dominaria United; and two engine fixes the agents found — "target player creates" with an
  illegal target now makes nothing (rule 608.2b — Ashling's Command; unblocks Cybernetica
  Datasmith), and "opponents who control fewer" compares control (Voice of Many) (2026-10-19).
- **The Brothers' War, whole** (batch 101): its last 155 cards, 122 authored (Urza, Powerstone
  Prodigy, Mishra, Excavation Prodigy, Loran, Disciple of History, Arcane Proxy and 118 more) and
  33 blocked (three on meld); plus Angelic Destiny, Mishra's Factory's missing third ability, and
  Ainok Wayfarer and Ostrich-Horse taking a milled card Rest in Peace exiled (rule 701.17c)
  (2026-10-19).
- **Jumpstart 2022 and The Brothers' War Commander, both whole** (batch 100): the 52 cards their
  top halves left, 25 authored (Runadi, Behemoth Caller, Lita, Mechanical Engineer, The
  Archimandrite, Sardian Avenger and 21 more) and 27 blocked, nearly each on a need of its own;
  no engine change (2026-10-19).
- **Phyrexia: All Will Be One and its Commander set, both whole** (batch 99): 126 of their 165
  cards, with **compleated** (rule 702.150a — loyalty minus two per Phyrexian symbol paid with
  life), **"has toxic"** (the `hasToxic` filter) and **"gains toxic N"** (`grant-toxic`), and the
  scaffolder reading Toxic, For Mirrodin! and named counters; then 6 older cards the last three
  batches' features unblocked (Archpriest of Shadows, Emergent Woodwurm, Guardian Scalelord,
  Invasion of Zendikar, Necrogen Rotpriest, Jade Seedstones) (2026-10-17).
- **March of the Machine and March of the Machine Commander, both whole** (batch 98): 151 of
  their 218 cards, with **battles and Sieges** (rule 310: defense counters, a protector chosen as
  it enters and reassigned when it can't protect, attacking a battle, damage removing defense,
  "when the last defense counter is removed, exile it, then you may cast it transformed"),
  **incubate** (701.53, the double-faced Incubator token), **backup** (702.165), the hooks cards
  name battles by ("player or battle" damage, "attacks a battle", "if an opponent protects it",
  excess damage past defense) and **convoke's convokers on the permanent** ("for each creature
  that convoked it", "a spell that has convoke") (2026-10-17).
- **March of the Machine: The Aftermath, whole** (batch 97): 7 of its last 20, and 22 older
  cards unblocked by the two features built for it — distributed counters (rule 601.2d,
  `counters-divided`) and "its owner puts it on their choice of the top or bottom of their
  library" (`put-on-library`'s `ownerChooses`) (2026-10-17).
- **The Lord of the Rings: Tales of Middle-earth and its Commander set, both whole** (batch 96):
  124 of 169 cards, and 23 older ones the same features unblocked — with voting (rule 701.38: the
  `vote` effect over options, permanents and players, open or secret, additional votes, "more
  votes", "for each vote", and "whenever players finish voting"), keyword loss in layer 6 (613.7),
  removing a creature from combat (506.4) and devour (702.82) built (2026-10-17).
- **Commander Masters, whole** (batch 95): 6 of its last 12 — four Slivers' granted abilities,
  Gatewatch Beacon and Nyxborn Behemoth (2026-10-17).
- **Wilds of Eldraine and its Commander set, both whole** (batch 94): 147 of 182 cards — the 173
  left in the two sets and 9 older ones — with Roles (rule 303.7: tokens created attached, and
  704.5z), bargain (702.166), celebration and a "has an Adventure" filter (715.2a) built
  (2026-10-17).
- **Doctor Who, whole** (batch 93): 73 of 159 cards — the 144 left in the set and 15 older
  time-counter cards — with time travel (rule 701.56, a new player decision), vanishing (702.63)
  and cards gaining suspend (702.62b) built; a suspended card's last time counter coming off by
  any means now offers its play, land faces included (2026-10-17).
- **The Lost Caverns of Ixalan and its Commander set, both whole** (batch 92): 136 of 189 cards —
  the 165 left in the two sets and 24 older explore, discover and craft cards — with explore, Map
  tokens, discover and craft built (2026-10-16).
- **Murders at Karlov Manor and its Commander set, both whole** (batch 91): 137 of 227 cards —
  the 223 left in the two sets and 4 older Cases — with collect evidence and Cases built; the bots
  now aim an Aura that goads at an opponent even when it also pumps (2026-10-16).
- **Fallout and Ravnica: Clue Edition, both whole** (batch 90): 56 of 129 cards — the 109 left
  in the two sets and 20 older rad and squad cards — with rad counters and squad built; the bots no
  longer proliferate their own rad counters (2026-10-16).
- **The Big Score, Outlaws of Thunder Junction and its Commander set, all whole** (batch 89): 158
  of 194 cards — the 179 left in the three sets and 15 older plot and crime cards — with plot and
  crimes built, and an enters-with counter amount's condition now leaving out what enters with it
  (rule 614.12 — Dust Animus) (2026-10-16).
- **Wayta, Trainer Prodigy is one ability again**, priced by its targets: an activated ability's `targetCostReduction` (`count: 2` — "{2} less if it targets two creatures you control"), so "another target creature" stays any creature and a fight survives a control change in response. Raft Security Officer authored on it (2026-10-16).
- **Enter the God-Eternals gains the damage actually dealt** (the `damageDealtThisWay` amount — 8 beside Dictate of the Twin Gods), and its text has its reminder (2026-10-16).
- **Lord of the Nazgûl's "protection from Ring-bearers" works**: a `protection` static over any player's Ring-bearer (the filter's new `ringBearer: "any"`) (2026-10-16).
- **Chandra, Acolyte of Flame's Elementals gain haste rather than print it** (rule 707.2): `create-token`'s new `gainKeywords` (no end, not copiable) on the plain 1/1 red Elemental, so a copy of one has no haste; Tempt with Vengeance keeps the hasted token, now with its own art (2026-10-16).
- **The top-5000 recheck** (batch 88): the 18 cards whose blockers had all been built since triage, re-briefed — The One Ring, The Wandering Emperor, The Stasis Coffin, High Score, Solid Ground, Bolg of the North and Violent Echoes authored; the other 11 re-recorded with the precise need (a temporary player effect isn't the static the card needs; forage as a cost; counters put as a cost) (2026-10-16).
- **Modern Horizons 3 and Modern Horizons 3 Commander, both whole** (batch 87): 74 cards, and Wurmcoil Engine's two Wurms now enter as one event; Council of Reeds moved from `tokens/` to `pool/`, where `card:verify` checks it (2026-10-15).
- **Bloomburrow, Bloomburrow Commander, Mystery Booster 2 and Assassin's Creed, all whole** (batch 86): 128 cards, with three engine fixes — lore counters count as counters put on (rule 122.6), a Saga's chapter step no longer waits on a player who has left, and an additional combat phase made in the main phase after combat happens, then the end step (Grim Reaper's Sprint, rule 500.8) (2026-10-15).
- **Expend, valiant, freerunning and forage** (`keyword:expend`, `keyword:valiant`, `keyword:freerunning` rule 702.173, `keyword:forage` rule 701.61, the last as an effect only): Wandertale Mentor, Muerra, Trash Tactician, Heartfire Hero, Eagle Vision, Achilles Davenport, Treetop Sentries and 27 more; the scaffolder reads expend, forage and freerunning, and the cast menu says "(freerunning)" (2026-10-15).
- **Foundations Jumpstart, Duskmourn and Duskmourn Commander, all whole** (batch 85): 104 cards,
  with two engine fixes found while authoring — an instant or sorcery can be manifested (it enters
  face down as a 2/2; rule 400.4a doesn't stop it, 701.40a), and a delayed trigger's "sacrifice it"
  finds nothing once its source was blinked before the creating ability resolved (rule 400.7;
  Attack-in-the-Box) (2026-10-15).
- **Impending** (`keyword:impending`, rule 702.176a): the five Overlords of Duskmourn — cast for
  the impending cost, entering with time counters as a noncreature, one counter off at each of
  your end steps; the scaffolder reads the line, and the cast menu says "(impending)" (2026-10-15).
- **Aetherdrift, Aetherdrift Commander and Foundations, all whole** (batch 84): 85 cards, with an
  "ability of a permanent" trigger seeing one whose cost sacrificed its permanent — a fetchland,
  a Clue (rule 113.7a) — so Harsh Mentor and Runic Armasaur no longer miss them, and Wizened
  Mentor unblocked (2026-10-15).
- **Tarkir: Dragonstorm, whole** (batch 83): 79 cards (2026-10-15).
- **"The damage dealt this way"** (`damageDealtThisWay`, the `damage-dealt-this-way` condition,
  rule 615.1): Sonic Shrieker, The Black Arrow, Elektra, Femme Fatale, Creeping Bloodsucker, and
  Provoke the Trolls no longer pumps a creature whose damage was prevented (2026-10-15).
- **Final Fantasy and Final Fantasy Commander, both whole** (batch 82): 114 cards, with a "while
  the source is on the battlefield" play permission ended by the source leaving (rule 400.7) and
  `canDispatch` checking an activation's sacrifice choice (2026-10-15).
- **Edge of Eternities, whole** (batch 81): 84 cards, and Sledge-Class Seedship's attack trigger
  moved into its 7+ station band, where it's printed (2026-10-15).
- **"The excess damage dealt this way"** (`excessDamageThisWay`, rule 120.4a): Hell to Pay,
  Windswift Slice, Goblin Negotiation, Archaic's Agony, Razor Rings, Rhino's Rampage
  (2026-10-15).
- **Marvel's Spider-Man, whole** (batch 80): 62 cards (2026-10-15).
- **Avatar: The Last Airbender, whole** (batch 79): 90 cards, and the scaffolder reads "cards
  exiled with this" as linking the card's exiles (2026-10-15).
- **Lorwyn Eclipsed, whole** (batch 78): 70 cards, and Sneak Attack's haste made lasting, as
  printed (2026-10-15).
- **Teenage Mutant Ninja Turtles and Lorwyn Eclipsed Commander, both whole** (batch 77): 53
  cards, with a token that has left the battlefield kept from changing zones again (rule 111.8)
  (2026-10-15).
- **Secrets of Strixhaven, whole, and increment** (batch 76): 91 cards — the set's 88 and three
  earlier increment cards (Pensive Professor, Topiary Lecturer, Berta, Wise Extrapolator) — with
  increment built (rule 702.191, `increment()`, the scaffolder reads it) and the colours spent on
  a spell countered in response kept for its cast triggers (Magmablood Archaic) (2026-10-15).
- **Marvel Super Heroes and Secrets of Strixhaven Commander, both whole** (batch 75): 58 cards,
  with a trigger-object condition's mana value read from a countered spell's time on the stack
  (Prismari Pianist) and Vault Guardsman's missing return fixed, behind a pool-wide guard
  (2026-10-15).
- **Marvel Super Heroes Commander, whole, and Marvel Super Heroes' next 30** (batch 74): 82
  cards, with two engine fixes (an attacks-alone trigger's defending player; once a turn shared
  across one ability's entries) (2026-10-15).
- **The noncombat-damage-taken turn stat**: Whiplash Wordsmith, Grim Repriser (batch 73,
  2026-10-14, e4951aee).
- **"Costs {N} less if it targets …"** (`targetCostReduction`): Price of Fame, Magnificent End,
  Thing Swing, Fantastic Bounce (2026-10-14).
- **The Hobbit, whole, and Marvel Super Heroes Commander's next 78** (batch 72): 111 cards, with
  hand attack (`discard-chosen` — Duress, Thoughtseize and 8 more) and Mathemagics' 2ˣ built
  (2026-10-14).
- **Reality Fracture and its Commander set, whole** (batch 71): the rest after the walk's top
  half — 81 cards, with scry triggers and the scried-or-surveilled turn stat built (8 more)
  (2026-10-14).
- **Additive counter replacements** ("that many plus one": Hardened Scales, Conclave Mentor,
  Kami of Whispered Hopes, Ozolith, Benevolent Hydra, Mauhúr, Michelangelo, Yoshimaru,
  Caradora), and Furnace of Rath, Mechanized Warfare, Collective Inferno, Tainted Remedy
  (2026-10-14, dbc5ad27).
- **Changing a spell's or ability's targets** (rule 115.7): Bolt Bend, Deflecting Swat,
  Spellskite and 6 more (2026-10-14, cca14342).
- **The rank walk to 7178**: batch 69 (become-copy and move-counter, 2026-10-12, 2b7d5ee5),
  batch 70 (ranks 7040–7178; devotion with the Gods' type change, fc54d1bc, and phasing,
  e6ad2878; 2026-10-12, c0568051).
- **The set walk, batches 50–68**: Reality Fracture (FRA) and its Commander set (FRC), The
  Hobbit (HOB), Marvel Super Heroes Commander (MSC), Marvel Super Heroes (MSH), Secrets of
  Strixhaven Commander (SOC) and Secrets of Strixhaven (SOS), Teenage Mutant Ninja Turtles
  (TMT), Lorwyn Eclipsed and its Commander set (ECL, ECC), Avatar: The Last Airbender (TLA),
  Marvel's Spider-Man (SPM), Edge of Eternities (EOE, EOC), Final Fantasy (FIN, FIC), Tarkir:
  Dragonstorm (TDM), Aetherdrift (DFT), Foundations (FDN), Foundations Jumpstart (J25),
  Duskmourn (DSK) and Bloomburrow (BLB), each set's top half by EDHREC rank (2026-10-11 to
  2026-10-12). Built along the way: mayhem (batch 56), rebound (57), teamwork (58), the
  Nth-counter trigger (59), opus and sneak (61), blight (63), behold (64), web-slinging,
  waterbend and airbend (65), void and revolt (66), speed and saddle (67), crewing as though
  power were greater and with toughness (68), and prepare.
- **Every card the scaffolder reads whole**, reviewed (batch 60; 2026-10-11, ddd2379d).
- **Cards banned in Commander, for casual play**: 22 of them — the Moxen, Black Lotus, Mana
  Crypt, Time Walk, Tinker, Griselbrand and more (2026-10-11, 878f91e8).
- **Built for the backlog, 2026-10-09 to 2026-10-11**: crew, the Ring tempts you (7779cae6),
  dice, ninjutsu, Rooms, Class, part of the attach extensions, morph, megamorph, disguise and
  manifest dread (262724bf), random choice (B48) and the Kindred card type (B49).

## Engine rules gaps

- **A Commander companion's colour identity wasn't enforced** (903.5c, 903.4; the user's call, 2026-11-01): `companionProblem` holds a companion beside commanders to their colour identity, so `Game` doesn't offer the reveal and the deck builder marks it "companion: not met".
- **A mass destroy checked indestructible one permanent at a time** (701.8 with 608.2; 2026-10-27): `drainPendingDestruction` fixes which of its permanents are indestructible before any leaves, so a Wrath no longer kills the creatures a lord it also kills made indestructible (Sephara, Sky's Blade's flyers, Knight Exemplar's Knights). Knight Exemplar authored (batch 235, `recheck-r1-D.test.ts`).
- **Distributing up to that many counters from a trigger** (601.2d, 603.3d; 2026-10-25): a triggered ability's `divided` takes its total from the value it triggered with (`byTriggerValue`) or its controller's turn stat (`byTurnStat`), `upTo` lets the shares add up to less, and the group is capped at the total; the client's division step reads "Divide up to N" and casts at less. Lathiel, the Bounteous Dawn (#373) authored; Fire Covenant's targets capped at X (the fuzzer found a bot casting X=2 at five).
- **A control effect ending with the default controller gone** (800.4c; 2026-10-25): with no effect left giving control to a player still in the game and the permanent's default controller (who put it onto the battlefield) departed, it's exiled rather than handed to its owner (`recomputeControl`). 800.4g–h stay open.
- **A debug entry's enters trigger waited a priority round** (117.5; 2026-10-25): `debugSpawn`'s `announceEntry` and `debugApplyEffect` put what they triggered on the stack at once when a player holds priority (`debugPlaceTriggers`), as after any action; `debugAnnounceEntry` announces a silently spawned permanent. Real play always placed them at once; the tests that leaned on the delay (Yoshimaru, Clement, Gladehart, Niv-Mizzet, Ghyrson, Omnath) now follow the rules' timing.
- **A source of damage was chosen only among permanents and spells** (609.7a; 2026-10-25): the source of an ability on the stack that has left the battlefield is offered too (a dead creature's dies trigger, read as it last existed), picked in the client by clicking that ability's stack entry; a stack entry's box no longer catches clicks beyond what it draws, so a buried entry's edge can be clicked. Circle of Protection, Reverse Damage, Healing Grace. The waiting effect's object and command-zone objects stay open.
- **Phyrexian mana was paid with life only when mana couldn't pay it** (107.4f; 2026-10-25): the cast and activate actions take `phyrexianLife` (how many Phyrexian pips to pay with 2 life each), the planner pays those first (`ManaPlanningView.phyrexianLife`), offers name their `phyrexianPips`, and the client asks "Phyrexian mana — pay with life?" before the cast goes out. A compleated planeswalker cast that way enters with fewer loyalty counters. The bots still pay mana first.
- **An X total divided among targets** (601.2d; 2026-10-25): a card's `divided.x` divides the X it's cast with, and the client's division step shares out that X. Fire Covenant authored.
- **The least X a top-of-library cast allows was searched only up to the mana a player can make** (2026-10-25): `libraryTopMinX` searches up to `xPaymentCeiling` (mana, plus every permanent and graveyard card that convoke, improvise or delve could spend), and the convoke re-check prices the cost at the X being checked rather than 0 — Chord of Calling off the top under Glarb, paid wholly by convoke.
- **"Each player may" did a draw or a wheel before the next player chose** (101.4; 2026-10-25): an `each-player-may` whose effect asks nothing more (draw, discard a hand, gain or lose life) only asks, then does it for everyone who said yes at once (`applyEachPlayerMayAs`) — Will of the Jeskai's wheel and Kwain, Itinerant Meddler's draw; Snort authored. Black Mage's Rod checked: two Heroes from a doubler get the Equipment on one, as its ruling says.
- **"Whenever a creature you control deals combat damage to that player this turn"** (2026-10-25): `delayed-trigger`'s `whenever` takes `toPlayer`, a target slot fixed as it resolves, so only damage to that player fires it; "if it's your combat phase" is `your-turn` with the combat steps. Great Train Heist authored.
- **A set rule on a graveyard choice** (2026-10-25): `return-from-graveyard`'s `upTo` and `totalManaValueAtMost`, over the zone choice's `total` rule with a new `atMost` — "up to two creature cards with total mana value 4 or less". Lively Dirge authored (`effect:look-and-choose-total-mana-value`).
- **A granted leaves-the-battlefield trigger didn't look back for its grant** (603.10a; 2026-10-25): a conditional static's granted dies/leaves/sacrifice abilities are recorded just before each leave — before anything moved, for a simultaneous one (`Game.grantLookBack`) — so the permanent that met the condition leaving still triggers them. Relic Vial authored (`trigger:conditional-grant-look-back`).
- **A merged permanent's token status was its own object's** (730.2d; 2026-10-25): `isTokenNow` (`state.ts`) reads the topmost component's, and the `token` filter, `tokenOnly` statics, `notLegendaryIfToken`, last-known information and the view go through it; leaving the battlefield still goes by each component's own (730.3).
- **`deals-damage` fired once per recipient** (603.2c; 2026-10-25): with no recipient named ("whenever this deals damage") it fires once per simultaneous damage event, for the total (`withDamageBatch`'s `dealsDamage`); a trigger naming one (`to`, `toFilter`, `exactly`) is still per recipient. Armadillo Cloak, Spirit Link, Vampiric Link, Spirit Loop, Towering-Wave Mystic and Ceremonial Knife authored (`trigger:deals-damage-once-per-event`, `trigger:deals-combat-damage-once-per-event`).
- **A granted ability's dynamic filter was fixed when it was granted** (2026-10-25): `bindDynamicCompares` leaves a granted or emblem ability (`ability`, `triggered`, `activated`) for when it triggers or is activated, so "this creature's power" is the creature that has it — Guardian Scalelord's and Emergent Woodwurm's backup grants were reading the backup creature. Firja's Retribution authored (`effect:grant-activated-dynamic-target-filter").
- **A "prevent that damage and remove a counter" replacement ran once per source** (614.5, 510.2; 2026-10-24): a `perEvent` replacement ("if damage would be dealt to this creature" — Unbreathing Horde, Anti-Venom, Polukranos, Stormwild Capridor, Ugin's Conjurant; not Ironscale Hydra's per-creature wording) owes its follow-up once per combat damage pass, "that many" the total, applied after the pass (`Game.preventedThisEvent`). Oathsworn Knight authored (`replacement:prevent-once-per-damage-event`).
- **A mana ability couldn't read what its cost sacrificed** (605.3b; 2026-10-24): it resolves at once, so it's now handed the sacrificed (and tapped) permanent the way an ability on the stack is. Priest of Yawgmoth authored (`amount:mana-ability-sacrificed-object`) — activated by hand; the auto-payer doesn't reach for it, as with Krark-Clan Stoker.
- **Losing loyalty never emitted `counter-removed`** (306.8, 606.4; 2026-10-24): damage to a planeswalker (as many as it had, at most) and a minus loyalty cost emit it, and simultaneous damage removes them as one event (`withDamageBatch`'s `countersRemoved`). Chandra, Fire Artisan authored (`trigger:loyalty-counters-removed`).
- **A copy's new targets with a skipped "up to" slot couldn't be answered** (707.10c; 2026-10-24, found by the fuzzer): `stackTargetSlots` offers only the filled slots but kept each one's "other than slot n" in the old numbering, so a Twincast copy of Band Together cast with one creature of yours refused every answer; the relations are renumbered (`renumberOtherSlots`).
- **A search of library and graveyard forced a graveyard find** (701.23b; 2026-10-24): only a search of the graveyard alone must find a match there; one that takes in the library may find none (`beginLibrarySearch`). Nissa's Encouragement authored (`effect:search-library-and-graveyard-named-set`).
- **Blight ignores counter prevention** (701.68b; 2026-10-24): a blight cost, blighting kicker, ward—blight or "you may blight" is offered only with a creature a -1/-1 counter can go on (`Game.blightable`, through the `preventsCounters` statics), and a blight paid as a cost chooses among those; Lethal Sting authored.
- **"Until end of turn, whenever …" is a delayed trigger, not a granted one** (603.7c; 2026-10-23):
  the `delayed-trigger` effect's `at: { whenever: TriggerSpec, until?, targets? }`, matched against
  every event and ended by nothing that happens to its source; Dovin, Grand Arbiter's +1 moved onto
  it from `grant-triggered`.
- **An "X targets" cast offer miscounts a spell's other target slots** (601.2b–c, 115.3;
  2026-10-23): `Game.xGroupOffer`'s range counts the group's members alone, from its slot
  (`TargetCountRange.from`, read through `rangeTargetCount` by `minXForTargets`/`maxXForTargets`/
  `fitTargetCount`, the bots and the client's picker), so Spinning Wheel Kick's creature no longer
  reads as one of the X and a random or bot cast isn't refused.
- **Up to 500 tokens of one stack can block** (509.1a; 2026-10-22): a blocking stack wakes up to
  `Game.MAX_BLOCKERS_WOKEN` (500) tokens rather than `MAX_MATERIALIZED`'s 100, so a stack can block an
  attacking one two or more to a token (200 Soldiers on 100 Zombies). Still a bound for a whole stack
  of millions declared at once.
- **Stale records rechecked after tonight's fixes**: `exile-all` gains `exceptSource` and `linked` ("exile … with this", 607.2a) — Worldgorger Dragon; Darksteel Angel on `preventsCounters` (2026-10-20).
- **A `{T}` ability on a token stack taps the whole stack** (latent): the `activate-ability` dispatch splits one token off a stack before an ability that taps its source (2026-10-20).
- **Convoke with a choice of additional costs** (latent): `legalActions`' convoke re-check prices the variant's `costOption` (and `altCost`) instead of none, so such a spell is offered on convoke alone (2026-10-20).
- **"Whenever this Equipment becomes unattached from a permanent"**: the `becomes-unattached` trigger over a new `permanent-unattached` event (re-equip, an unattach effect, 704.5n, what it was on leaving) and the Equipment's own leave while attached (603.10a); Grafted Exoskeleton, Grafted Wargear and Captain's Hook authored. Stitcher's Graft also needs "it doesn't untap" without tapping (2026-10-20).
- **A card's own "if this would be put into a graveyard from anywhere, reveal it and shuffle it into its owner's library instead"** (614): `CardDefinition.shufflesIntoLibraryInstead`, from every zone, ahead of Rest in Peace, a commander still offered the command zone (903.9b); Blightsteel Colossus, Darksteel Colossus, Nexus of Fate, Progenitus and Legacy Weapon authored (2026-10-20).
- **A cast trigger's "that player" read the spell's controller as it resolved** (`trigger-controller`): the caster is recorded as the ability triggers (`LastKnownRefs.triggerSpellController`), so a spell taken from someone else's cards and countered in response still points at its caster — Forced Fruition, Ruric Thar, Spellshock, Magebane Lizard (2026-10-20).
- **Counters put as a cost skip counter prohibitions** (122): a static's `preventsCounters` ("counters can't be put on …", "players can't get counters") stops counters from effects, damage, moves, lore and entering, makes a counter cost unpayable, and reaches player counters and energy; Solemnity and Melira, Sylvok Outcast authored (2026-10-20).
- **Counters put as a cost skip counter replacements** (616.1): `putCostCounters` goes through `counterTotal` (a negative `plus` is "that many minus one", fewest first for -1/-1; `byEffectOnly` keeps Doubling Season off costs); Vizier of Remedies authored — Devoted Druid's untap costs it no counter, a persisting creature returns with none (2026-10-20). The prohibition half (Solemnity) stays open.
- **A source's chosen colour or number isn't read from last-known information** (608.2h): `chosenColorOfSource` / `chosenNumberOfSource` read the departed source's `LastKnownInfo.chosenOnEnter` in the stint the ability refers to (2026-10-20).
- **A spell cast this turn forgets where it was cast from** — already fixed: `castRecordOf` writes the cast's zone into the record's `entry.cast`; pinned by `cast-record-from.test.ts`, and Surge of Brilliance authored (2026-10-20).
- **Suspend's time-counter triggers don't use the stack** (702.62a): the upkeep's "remove a time counter" and "when the last is removed, you may play it" are the owner's triggers on the stack (`suspendTrigger`), however the last counter came off (time travel too), so players can respond to each; `pendingSuspendedCasts` is gone. Cards whose own triggers work while suspended (Deep-Sea Kraken) still wait on `trigger:functions-while-suspended` (2026-10-20).
- **"It gains 'if this would leave, exile it'" is a flag, not an ability** (613.1f): `put-onto-battlefield { exileIfItWouldLeave: "ability" }` grants it on a modifier (`grantsExileIfLeaves`, read in timestamp order by `hasExileIfLeavesAbility`), so a later loss of all abilities strips it; Geth fixed, Llanowar Greenwidow authored (2026-10-20).
- **`cast-now`'s `play` plays a land only from exile**: `whyCannotPlayLandNow` takes the land from wherever the offer found it (exile, a library's top, a hand, a graveyard); Ziatora's Envoy authored (2026-10-20).
- **A reflexive trigger's target filter reads the creating ability's `triggerValue`** (603.12): `bindDynamicCompares` binds a reflexive ability's targets with its own `value`, so `{ triggerValue: true }` there is the reflexive one's (2026-10-20).
- **A multi-target flicker's leaves aren't one batch** (603.2c): `flickerByEffect` exiles inside `withLeaveBatch`, snapshotting every target first, so each leaves trigger reads the board as it stood (Brago, Ghostly Flicker, Eerie Interlude) — ready for Aang's batched leave trigger (2026-10-20).
- **A mass effect's filter can't read a dynamic amount** — logged by mistake: `bindDynamicCompares` already binds every `{ amount }` operand as an effect applies. Pinned by `mass-effect-dynamic-filter.test.ts`; Zar Ojanen, Scion of Efrava authored (2026-10-20).
- **End-step token removal resolves without the stack** (603.7): `sacrificeAtEndStep` / `exileAtEndStep` (and encore) now set up one delayed triggered ability over the tokens made — on the stack at the next end step, respondable, counterable, copyable; the tokens are separate objects so it reaches each (2026-10-20).
- **A `turn-history` condition's `excludeSelf` compares object ids** (400.7): `died`, `exiled` and `sacrificed` entries now carry the stint they left, and `excludeSelf` leaves out only the source's current stint — White Glove Gourmand counts its own death from before it came back (2026-10-20).
- **`look-and-choose` to exile always links the card to its source** (607.2a): `unlinked: true` exiles without the link; Shadow Kin uses it (2026-10-20).
- **"Cast from your graveyard" checks the zone, not whose graveyard** (Patrician Geist, Green Goblin): a cost modification's `castFrom` of a player's own zone now needs the card to be the static's controller's (latent: nothing yet casts a paid spell from an opponent's graveyard) (2026-10-20).
- **A trigger's top-level `trigger-object` condition is always false**: it now works as an intervening-if, asked about the object whose event fired the trigger (`eventTriggerObject`, the same object the resolution-time recheck reads), last-known if it has left (2026-10-20).
- **`{ powerOf: n }` reads a target that just left in its new zone** (608.2h): a `choose-permanents` `then` now reads each chosen permanent as it last existed on the battlefield (its target zone is the battlefield), so "return it, then counters equal to its power" counts its counters (2026-10-20).
- **"Exile … until this leaves the battlefield" returns at once** (610.3): the engine returns the card as a one-shot effect right after the source leaves — no trigger, before state-based actions, though the source lost its abilities (`GameObject.exiledUntil`, `returnUntilLeft`); the 47 cards' return triggers removed. Grasp of Fate, which waited on it, can be authored (2026-10-20).
- **`canDispatch` passes a cast `dispatch` refuses** (601.2f): it now prices a `targetCostReduction` from the cast's targets, and an X offer carries `maxXUnreduced` / `reducingTargets` so a driver's X fits its target (Torch Breath crashed a 4-player fuzz game) (2026-10-20).
- **The monarch's two abilities use the stack** (rule 725.2, 2026-10-19): the end-step draw and
  the combat-damage steal are triggered abilities on a "The Monarch" object (`cards/monarch.ts`,
  `GameState.monarchAbility`, like speed's and rad counters'), controlled by the monarch as they
  trigger, so they can be responded to; they had been folded in without the stack. Step 1 of
  `docs/plans/initiative-dungeons.md`.
- **The live-game rules bugs** (2026-10-16): a loop whose every round asks a choice no longer
  runs the engine into its crash guards — answers inside a chain are part of the loop's cycle;
  the first time it repeats, the players choosing in it must choose differently (rules 732.2c,
  732.3: their "you may" becomes a no, "same for all" answers cleared), and if it goes round
  anyway it's a draw (104.4b). `canDispatch` judges an activated ability's chosen targets as
  `dispatch` does. `sacrifice-all-but` asks each player what to keep, choosing in turn and
  sacrificing together, with `upTo` for Archfiend of Depravity's "up to two" (Planetary
  Annihilation keeps exactly six). Adeline, Resplendent Cathar's Humans enter as one event
  (`for-each-player`'s `simultaneous`).
- **"Its controller may search" is theirs to decline**: Path to Exile, Assassin's Trophy, Erode, Ghost Quarter, Price of Freedom, Boseiju, Volatile Fault, Demolition Field, Sandworm, Sundering Eruption, White Orchid Phantom, every "Partner with" trigger (`partnerWithTrigger` and the nine written inline) and the parser's partner-with template ask that player (`each-player-may` around the search), so a decline neither searches nor shuffles; a v2 bot takes the land (2026-10-16).
- **A Saga's chapter ability remembers which Saga it came from**: `triggerChapters` records the Saga's stint (`lastKnownRefs.source`), so "the exiled card" is found after the Saga leaves in response (rule 607.2a). The Aesir Escape Valhalla authored on it (2026-10-16).
- **A "trigger-object" that blinked is lost** (rule 400.7) — already so (the Hero's Blade clause of `triggerObjectLost`); the backlog line was stale. Atarka, World Render's test pins it (2026-10-16).
- **A delayed trigger made by an ability whose trigger object already left no longer finds it** (rules 400.7, 603.7c): `createDelayedTrigger` carries the stint the creating ability found its trigger object in (`triggerObjectAfterLeaving`, or the battlefield one), not the object's current one — Liesa's return skips a card that left the graveyard and came back before the trigger resolved. Desert Warfare authored on it (2026-10-16).
- **"A permanent entered under your control this turn" reads it as it entered**: each turn-history `entered` entry keeps an `asEntered` snapshot, which `turnHistoryCount` matches — a land earthbent into a creature didn't enter as one (Waterspout Warden). Fixes The Prydwen's Knight and Éowyn, Shieldmaiden; Mechan Shieldmate authored on it (2026-10-16).
- **Amass 0 makes the Army** (rule 701.47a): `Game.amass` returned at 0; it now creates the 0/0 Army when you control none and gives the chosen Army the type, putting no counters (Rhovanion Rampager at 0 power) (2026-10-16).
- **Replacement and prevention effects are ordered for the affected player** (616.1): the best
  order chosen automatically — least damage, most +1/+1 and fewest -1/-1 counters, a gain
  turned to loss first. Replaces "Replacement ordering" and "Damage modifiers apply in a fixed
  order"; never asking is still a backlog item (2026-10-14, dbc5ad27).
- **A loop of mandatory actions where nobody acts is a draw** (104.4b, 732.4); a loop that asks
  a choice each round is still open (2026-10-14, fa43d342).
- **Phasing** (2026-10-12, e6ad2878), **the Ring** (2026-10-09, 7779cae6), **morph, disguise
  and manifest dread** (2026-10-10, 262724bf) — out of "Not modeled".
- **A delayed trigger carries its own last-known information** past the turn (2026-10-09).
- **An attacking token stack isn't capped at 100** (509.1a for attackers): a counted attacking
  stack, `attackingStackPart`, from a bug report of 336 Scute Swarms (2026-10-07).

## Bots

- **A target group's min in a cast's target range and the bots' picks** (2026-10-31,
  `416041552`): Reckless Spite's "two target nonblack creatures" under Hinata, Dawn-Crowned's
  per-target tax was offered at zero targets — `targetCountBoundsFor` counted every group member
  optional and let one creature fill two slots — and `firstOfEach` and the heuristic's ranked pick
  took one member whatever the group's `min` (rule 601.2c). Found by the situation fuzzer
  (Charge of the Forever-Beast, seed 42).
- **A later opponent who could kill the bot alone counts in full** (2026-10-26, the
  `crackbackKillShot` weight, 1): the crackback check weighed every opponent but the next at
  `crackbackParanoia`'s half, so 166 full swings in 198 four-player games passed it into a board
  one later opponent could finish alone, and 17% died before the bot's next turn (2026-10-05).
  Now a later opponent whose swing alone is lethal (within `crackbackMargin`) counts at least
  `crackbackKillShot`. A training scenario and `eval-bot-combat.test.ts` pin it; gate 202/202,
  `bot:diff` against main one disagreement in 12,967 decisions (a Dragon token kept home at 9
  life). Not benched with `bot:ab`.
- **A decision overruns its second, mostly fixed** (2026-10-18): in 16 four-player self-play
  games at the live 1 s, decisions past it went from 381 of 37,136 to 29 of 36,466 and the
  slowest from 3.05 s to 1.58 s. The clock now starts when the decision is asked (`onClock`), not
  after v1's own pick, which took up to 1.9 s before a land search spent its whole second too; the
  predictive stop reads the longest simulation so far, not the mean that cheap crackback checks
  dragged down (`outOfTime`); only a search's real baselines start past it (one for a land
  search, blocks or a decision); the turn plan stops on the same prediction with its simulations
  charged (`PlanClock`); `holdsTapForCombat` checks the clock; and v1's land looks are remembered
  by name and zone, not card (six graveyard Forests are one look). Without a clock nothing changes
  but speed: the gate 200/200, and `bot:diff` 0 disagreements in 12,697 v2 and 82,220 v1
  decisions. What's left is in `BACKLOG.md`.
- **The "Think longer" trial retired, and the one-second budget measured** (2026-10-18): with
  every room's bots at a second a decision, the host's "Think longer — up to 1 s a decision"
  setting (`set-bot-think-long`, 2026-10-14) only raised 200 simulations to 600, and no decision
  in 16 four-player games used more than 61, so it's gone from protocol to client with
  `EvalBotController.setSearchBudget` and `--long-bot-thinking`; `maxSimulations` stays 200. The
  load test at 300 ms and 1 s (`docs/plans/room-shards.md`, "The one-second budget"): the same
  median pace, a shard's stalls about doubled from 8 rooms up, so the box's
  `MAX_ROOMS_PER_SHARD` went from 8 to 6 (the user; its unit, restarted with no rooms open).
- **Turn planning seated** (the user, 2026-10-18): v2 plans its own turn by default
  (`plan: "turn"`, `bot/turn-plan.ts`) — lines of its moves across both main phases and through
  combat, only where a move opens up another, replayed while the board matches, on the decision's
  clock. Lookahead benchmarks 7 to 9 of 17 (Rituals into Grave Titan; Act of Treason, attack,
  sacrifice), every gate scenario, at no cost a decision. No measured strength: head to head
  (`bot:ab`, one planning seat against three of 7ae6dfe1's, 546 four-player games) it won 24.9%
  [21.3, 28.5] against an even 25%; an earlier 26.9% to 30.5% against shipped v2s (197 games)
  was noise. Kept for the sequencing it gets right; 51 of 12,218 decisions changed
  in a `bot:diff`, mostly a move held until after combat. With it: a stolen creature pays a
  sacrifice cost, a commander blinked with a delayed return stays in exile for it, and the live
  decision budget went to a second (2026-10-18).
- **One step more of the bot's own turn** (`followUps` in `engine/src/bot/eval-bot.ts`): in our
  main phase every move is played until it has resolved, and each move we'd search there is
  rolled out from that board, expanded by what a move opens up, never shortlisted by its own
  score. A follow-up can't use a card from our library. Gate 196/196; a 400-game four-player
  A/B of the uncapped version against the one-move search: 27.1% [22.9, 31.6] (even 25%), no
  worse. Capped at 24 simulations a search (`FOLLOW_UP_SIMULATIONS`) after one search ran
  126 s, bringing 16 games' bot time back to the one-move search's (995 s vs 1,005 s; p99
  2.1 s vs 1.5 s) (2026-10-14, 7ab7dcdd).
- **Bot search cost**: combat and targeting reads share one cache (12% less bot time,
  f6fe00ba); playout copies share last-known snapshots and static scans read each card's
  statics once (a8bbeac6). Every decision unchanged (2026-10-14).
- **The bot budget measured on the user's low-end laptop**: every bot action p99 433 ms, max
  1 s — the clock overshoots, it doesn't starve (2026-10-13).
- **Premium removal at weak targets in the first two rounds** (the early half of the
  autopsies' item).
- **Upgraded TDC precons for the bots** and a room's "Bot decks" setting (2026-10-07,
  0ba168d7); **fourteen precons** in `SAMPLE_DECKS`, six flagged `bench` (2026-10-02,
  8d28d037).
- **Every step of `docs/plans/bot-effect-knowledge.md`**: keep v2, give it an effect-aware
  base, retire v3 (2026-09-27).

## Client / UI

- **"Build ASAP" flags in the library** (the user, 2026-11-06): in development, each card in "Not
  in the pool yet" has a ☆ ASAP toggle, and "Show: Build ASAP (dev)" lists the flagged ones. The
  flags go to `engine/data/build-asap.json` through a dev-only Vite endpoint; `cards:needs` puts
  flagged cards first in `--by-rank`, `--next` and `--stale --next` and reports them with
  `--asap [--prune]`, and the new `author-flagged` skill works through them.
- **The library shows the cards missing from the pool** (the user, 2026-11-06): a "Show: Not in
  the pool yet" dropdown lists every Commander-legal card the pool lacks (2,825 that day) as its
  Scryfall face, linked to Scryfall, through the same search, type, colour, sort and Set filters.
  The source is `client/public/missing-cards.json` (~120 KB gzipped, fetched only when asked),
  written from the Oracle snapshot by `npm run gen:missing-cards -w engine` and refreshed by
  verify's marks step; the library also drops any name its pool has gained since.
- **Decks show their colour identity** (the user, 2026-11-06): `ui/DeckIdentityPips` draws the
  commanders' identity as mana pips on every deck in the deck builder's list and the lobby's deck
  picker, from the commanders' own shards (the lobby never loads the pool).
- **The animation and bot speed settings are dropdowns** (the user, 2026-11-06): the Settings
  panel's animation and bot speeds and the room settings' bot speed, each a `<select>` instead of
  a row of option buttons.
- **The log names a hidden card by its id** (2026-11-04): the compact log and the event log now share `logNameAt`, so a card gone somewhere hidden reads as hidden, not "obj-161". The target banner's "choose 1 target" reads singular too.
- **Learn Commander's first game** (2026-11-02: f1322a3f, 3658a8f8): a whole game for someone who
  has never played, won on turn 7 (`learn-commander`, replacing the proof lesson), which can't be
  soft-locked (a scripted lesson offers only what its card asks for) and holds still under a card
  being read, with Back, the hand raised for cards about it, a seat reading "You", and a first real
  game on a starter deck at the end.
- **Learn Commander's second game, Commander's own rules** (2026-11-03: 1df847d6, 45445909): a game joined on turn 9 at
  a table of three, won on turn 15 (`commander-rules`): whom to attack, a commander dying and coming
  back with tax, an instant in response on the stack, and 21 commander damage with life left. The
  attack banner's Clear now clears an attack already pointed at someone, in every game.
- **An opponent's whole board takes the attack click** (2026-11-02): not only their panel, once attackers
  wait for a defender. A legal planeswalker or battle is still attacked itself, and one those attackers can't
  attack is no click on its controller (`e2e/attack-board-click.spec.ts`).
- **Four small fixes from a UX pass** (2026-11-02): a card this seat never saw logs as "a card", not
  "obj-169"; a long word in a name on the stack or a hover card shrinks rather than breaking mid-word; the
  import report counts copies, so it adds up to the list; the first lesson is "The basics", not "(proof)".
- **Large live mana amounts by hand** (2026-10-22): "X mana in any combination of …" with a live X
  too large to list every split of (two colours past X = 22) offers one more variant whose split
  the player picks in the split-mana strip (`manaSplit`, `standaloneManaSplit`); choosing what
  floats past a payment is that activation made by hand before casting (rule 601.2g), the pool
  then paying.
- **A local game picked up without the room server** (a bug report, 2026-10-20; landed
  2026-10-22): a page loading into one of the tab's local rooms opens its socket from the worker
  at once (`HybridSocket`'s `startsHere`), the server's side opening behind it — a reload with the
  wifi down went to "Reconnecting" though the worker held the game.
- **One damage decision for a stack of blocked attackers** (the user, 2026-10-22): the damage
  prompt says how many attackers still to assign are in the same situation (the same attacker,
  power and blockers), and "Same for all N" gives each that split (`assign-combat-damage`'s
  `forAll`), every one still checked on its own — 100 blocked tokens were 100 prompts.
- **Blocking a token stack with a token stack** (the user, 2026-10-22): pairing your stack with an
  attacking one blocks one for one at once; the bar's row has Max and "1 / 2 / 3 each" with a line
  saying how the blocks spread; the blockers stay one tile once declared, with one arrow and the
  attacker named; and a bot's combat damage assignments go through without a frame each — 100
  Zombies each blocked by two Soldiers went from 112 s of combat to 5.4 s (dev-rooms' STKVS board).
- **Big mills, the empty library, entering attackers and the stack's label** (the user,
  2026-10-22): an empty library is an outlined slot with a red 0, not a word; during a mill the
  library's label, panel count and pile tick down together (each as a card clears the pile); the
  "−N milled" total rises from under the pile, inside the board, clear of the turned-over cards; a
  creature put onto the battlefield attacking has no arrow until its defender is chosen (the view's
  `attackingUndecided`); and the top stack entry's line is larger, on a dark pill, clear of the glow.
- **Copies of one trigger condense on the stack** (the user, 2026-10-07 and 2026-10-22; done
  2026-10-22): abilities that are copies of one another (`stackCopyKey` — one controller, the same
  ability of a same-named card, nothing chosen) show as one entry "×N"; resolving them all goes in
  one frame with one exit and one shared mill beat. Sixty Mesmeric Orb triggers: 195 s → 6.6 s
  (`client/scripts/orb-timing.mjs`).
- **One art lookup, and the artist credit on one line everywhere it fits** (the user, 2026-10-17;
  done 2026-10-22): `ui/useCardArt.ts` replaces the lookup seven components each repeated. The
  credit (`ArtCredit`'s `fit`) is one line across the art, its font sized to the text's length; it
  shows in the hand's grown card, the spotlight and reveals as well as the hover card and the stack,
  and the commander-damage and Curse chips carry it in their tooltips.
- **A forced look-and-choose no longer asks** (2026-10-22): a zone choice where every card shown
  is taken, with nothing to order or split (Dark Confidant's and Yuriko's revealed card into the
  hand), is answered by the drivers (`forcedZoneChoice` in `engine/src/auto-settle.ts`, used by
  `autoSettle` and the room's `autoAdvanceHumanSeat`) instead of opening a one-card picker.
- **A gift's opponent is one question** (2026-10-22): a `choose-modes` with a "Promise the gift to …"
  mode per opponent (each an `about-player`), and in the client any choice of one player — a gift,
  "choose an opponent" — is also picked by clicking that player's panel.
- **The phase track fits at 1024 wide** (2026-10-22): below 75rem the turn banner drops the spelled-out
  step, which the track's lit pip (and its tooltip) already says.
- **The reconnecting screen dims the last screen** (the user, 2026-10-20; done 2026-10-22): a lost
  connection keeps the board or lobby up, greyed under a "Reconnecting…" box, rather than replacing
  the page; a first visit that never connected still shows "Waiting for the server…".
- **Slow bots and slow animations by default; no "Card entrance" setting** (the user, 2026-10-13/14;
  done 2026-10-22): a new room's bots play at "Slow" and animations start at "Slow" (motion settings
  version 4 reads an older save's untouched "Normal" as the new default); the played card always
  rises in.
- **A Max button on each colour of the mana-split prompt** (the user, 2026-10-21; done 2026-10-22):
  puts everything left into that colour (`CountStepper`'s `maxButton`).

- **A lobby game with only bots across the table plays in the browser** (the user, 2026-10-18): the
  host seated, every other seat a bot and nobody watching, Start Game rebuilds the table in the
  page's worker as a blitz does (`client/src/lobby/localStart.ts`) and leaves the server's room,
  which now closes when its last person walks out; `room-joined` says how many watch a waiting
  room (`spectators`). Anything else starts on the server as before.
- **The site is "Deck Blitz", not "MTG Deck Blitz"** (the user, 2026-10-16): the brand carries no
  Wizards trademark; "Magic: The Gathering" names the game only to say what the site is for (the
  page title, the landing page's descriptor), and the notice gains a trademark line, as Scryfall
  and Moxfield do (`docs/plans/fan-content-policy.md`).
- **What the site discloses under Wizards' Fan Content Policy** (the user, 2026-10-11): the
  policy's notice in a footer on the landing page, library and deck builder, an About & legal page
  (`/about`, linked from the Game menu too), and the artist credit Scryfall asks for beside art
  crops — "Illus. {artist} · ™ & © Wizards of the Coast" on the hover card, the lobby's commander
  art and the landing hero (`ui/artistCredit.ts`). The analysis and what's left is
  `docs/plans/fan-content-policy.md` (2026-10-16).
- **The library page's "Tokens" checkbox is gone** (the user's call): tokens stay out of the gallery; a `?card=` link to one still shows them, until Clear (2026-10-16).
- **The game page on a slow laptop, mostly**: the laptop runs a blitz at ~55-57 fps with 2-20
  short freezes a minute (was ~42 fps, ~120, worst 762 ms), the same with the bots in the page
  or on the server — not CPU contention (2026-10-13/14: 34053434, d7f00bbf; measured in
  426312fe).
- **Tutorials, phases 1-3**: the coach-mark overlay, the site tour (cut down to the front page,
  ending on the offer of the board tour), the tutorial room with a scripted opponent, chapter
  goals and retry, Learn Commander playing a proof lesson (`basics-proof`), and the board tour
  (`board-tour`) (2026-10-13: 3829b039, 436dcaa1, b0b8ba2b, cf41b357).

## Code health

- **The Playwright suite split into a quick set and a full one** (2026-11-04): 18 minutes to about 11 on a push, so the E2E workflow finishes inside its 20-minute limit, which it had been hitting since 2026-11-02; the whole suite runs daily on GitHub, and `build-family`'s agents leave `test:e2e` to the coordinator.
- **`canDispatch` refuses a cast with an illegal target**, as `dispatch` does (`whyCastTargetsInvalid`: the chosen face's specs under its modes, kicker, overload and X) — a Lightning Bolt at a player with protection from everything (2026-10-16).
- **Solo games in the player's browser**, `docs/plans/local-rooms.md` steps 1-7: blitz and
  lessons in a Web Worker (e21848ab), lobbies on the server, a local game surviving a reload
  (d68fae3d), measured on the user's low-end laptop (bots and memory fine), and on by default
  on the site with a fallback to the server (e6242373) (2026-10-13).

## Tooling / docs

- **`batch-review.mjs` reads a card's own name** (2026-11-06): it searched from the
  `import { defineCard }` line, so a helper above the call could lend its `name:` (Captain Kirk,
  Boldly Going read as Starship Enterprise; 47 pool cards in all, mostly "Chandra's X" cards named
  as their planeswalker). It now takes the `defineCard({…})` call's top-level `name`, and a
  helper-built card's first argument (`painLand("Adarkar Wastes", …)`, 228 that read as "?").
- **A sacrifice cost's bare filter** (2026-11-06, checked, no change): `sacrifice: { subtype:
  "Food" }` already fails to compile against `AbilityCost` (TS2353). Batch 268's agent saw the
  runtime throw first because the card-author agents run their tests before they type-check.
- **The need-keys plan's Phase 1, steps 3 and 4** (2026-10-27, `docs/plans/need-keys-after-the-walk.md`
  → *Phase 1 progress*). The merge ran as 84 Haiku jobs. It applied 23 aliases after review,
  which took the open keys from 2,602 to 2,579, and recorded 617 generalisation groups in the
  vocabulary's `groups`. The existence check ran twice over the 333 keys of five or more cards:
  4 exist, 213 are partial (their descriptions now name what's missing) and 114 are missing.
  Each judged key is stamped `checked`. `cards:needs -- --recheck` lists step 2's 863 cards in
  batches.
- **The need-keys plan's model trial, Phase 0.5** (2026-10-27, `docs/plans/need-keys-after-the-walk.md`
  → *Trial results*): Sonnet and Haiku, two runs each, against an Opus answer key that was checked
  by hand. The existence check covered 40 keys and the merge three families. **Haiku takes both
  steps.** It made 0–1 false *exists* to Sonnet's 2, and no model made a wrong alias, at a sixth to
  a fourteenth of the cost. The existence check runs twice per page and counts *exists* only when
  both runs agree. The prompts are in `engine/scripts/needs-prompts/`.
- **The need-keys plan's tooling, Phase 0** (2026-10-27, `docs/plans/need-keys-after-the-walk.md`):
  `cards:needs -- --audit` (records with every need built, since triage or before; cards whose
  records disagree; undocumented open keys; merge candidates by family, to `needs-audit.txt` in
  the OS temp dir), `--greedy [--top N] [--family F]` (the build order over every record, a pair
  of keys as one step when two free more together, with milestones and the two-key pairs) and
  `--brief <family> [--open-only] [--page N]` (a family's open keys with counts, descriptions and
  whys, paged at ~4K tokens). `poolNames` now matches a multi-face card by any face that names no
  other card (Oracle snapshot). The numbers they report are in the plan.
- **`client/e2e/put-down.spec.ts` was flaky** (2026-10-24): not the test — a card landing froze
  short of its tile or the stack for 100–250 ms on a 4-player board. Timers ran out a frame or more
  before the flights they timed (a flight starts on a later frame), so the frame's end, and with it
  the next frame's whole-`Table` remount, and `aims.landed`'s `Table` re-render, ran ahead of the
  landing frame. A half now ends once its flights are down and that frame is painted
  (`usePlayback`'s `endWhenDrawn`, the bus's `addLanding`/`landingsDone`), and a stack landing
  notifies the same way (`afterLanding`).
