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

- **`canDispatch` refuses a cast with an illegal target**, as `dispatch` does (`whyCastTargetsInvalid`: the chosen face's specs under its modes, kicker, overload and X) — a Lightning Bolt at a player with protection from everything (2026-10-16).
- **Solo games in the player's browser**, `docs/plans/local-rooms.md` steps 1-7: blitz and
  lessons in a Web Worker (e21848ab), lobbies on the server, a local game surviving a reload
  (d68fae3d), measured on the user's low-end laptop (bots and memory fine), and on by default
  on the site with a fallback to the server (e6242373) (2026-10-13).

## Tooling / docs

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
