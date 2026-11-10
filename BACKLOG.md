# BACKLOG.md

What is left to do, and nothing else. Each item is one line that points to where the detail
lives. **When something lands, move its line to `COMPLETED.md`** (newest first, under the same
section, with the date and commit) and delete it here; when part of an item lands, move that
part and keep the rest. When you find something new, add one. Before starting work, check both:
this file for whether it's planned and how it's scoped, `COMPLETED.md` for whether it's already
built.

## Questions for the user

Each waits on a decision only the user can make. Once one is answered, move the work it
decides into its section below.

- **Does "dies" reach a noncreature, nonplaneswalker permanent?** Rule 700.4 says any permanent "is put into a graveyard from the battlefield"; the Glossary says "a creature or planeswalker", and so does Oracle's practice (Boggart Mischief says "Goblin creature"). The engine follows the Glossary (`dies-creature-only.test.ts`). The BACKLOG line **"A Zombie … dies" is read as a Zombie creature** waits on this: keep it, or close it.

## Commander gap (the current priority)

**488 of the 500 most-played commanders are implemented** (`top-commanders.txt`; re-mark with
`npm run cmdrs:mark -w engine`). An imported decklist usually has its commander substituted, and
that one card is the reason the deck exists. Live numbers for everything below come from
`npm run cmdrs:gaps -w engine`.

- **Ready to author, no engine work: none.** B294 (2026-11-09) re-attempted all 18 still missing
  and authored 6 (Mr. House, Hazel of the Rootbloom, Indoraptor, Orvar, Noctis, Minsc & Boo). Each
  of the other 12 waits on one narrow key, recorded in `engine/src/cards/top-commanders-gaps.json`.
- **The 12 left, each with its key** (`cmdrs:gaps` ranks them; when a key lands, add it to that
  file's `built` array and author its commander in the same commit): Omnath, Locus of All
  `effect:add-mana-combination-of-card-colors`; Ob Nixilis, Captive Kingpin
  `trigger:opponents-lose-exactly-n-life`; Indominus Rex, Alpha
  `replacement:as-enters-discard-any-number`; Coram, the Undertaker
  `static:cast-from-any-graveyard-put-from-library-this-turn`; Marvo, Deep Operative
  `effect:clash-with-named-opponent`; Arna Kennerüd, Skycaptain `effect:token-copy-enters-attached`;
  Winter, Cynical Opportunist `decision:zone-choice-card-types-among`; The Mimeoplasm
  `replacement:copy-on-enter-exile-two-counters-from-other`; Magar of the Magic Strings
  `effect:noted-card-name-copy`; Jaws, Relentless Predator `trigger:destroyed`; Tevesh Szat, Doom of
  Fools `effect:put-commanders-onto-battlefield`; Jorn, God of Winter
  `zone:play-from-graveyard-this-turn-enters-tapped`.

## Card backlog (by EDHREC rank, and the precons)

What blocks each unimplemented card, and which cards a built feature may have unblocked, is in
**`docs/card-blockers.md`** ("Open leads" first, then batch by batch and family by family, over
the per-card JSON records in `engine/data/sweep-2/` and `sweep-3/`). Card lists go there; this
section keeps only what to do next.

- **The set walk, upcoming sets first** (`author-by-set`): Star Trek (TRK) and Star Trek Commander
  (TRC) are whole from their previews (batches 266-268, `COMPLETED.md`; assimilate built,
  `ASSIMILATE` in `helpers.ts`), and so are Marvel: Darkhold Destiny's previews (MDD, MDC) and
  Mystery Booster Commander (MBC) (batch 269). **The walk is caught up**: every released and
  previewed set is whole but TRC's two below, and Nauctis (NAU, out 2027-02-05) has no cards in the
  snapshot yet. **Next: refresh the snapshot** (`npm run gen:oracle -w engine`) once new previews
  are out, then `cards:sets -- --sets` picks up what it brings. MDD's Hela and Magik wait on
  release rulings (`mechanic:vengeance`, `B269.json`). **After Star Trek's release (2026-11-13)**: `npm run gen:oracle -w engine`
  drops the `preview` lines and brings the rulings; `card:verify -- --offline` then shows any card
  whose text changed. Then author TRC's two left: Worf, Chief Tactical Officer (left out of B268:
  its preview text is only "Vigilance" on a 3-mana legendary, which looked incomplete) and
  Jean-Luc Picard, Luminary (not in the snapshot yet); and re-read the vanilla preview commons
  (Starfleet Crew, Warship Flight Crew, Defense Force Aggressor) and Võx, Child of the Collective
  (blocked, also waiting on a ruling) against the released text.
- **Need-key themes step 7 continues** (`docs/plans/need-key-themes.md`): all done (theme 15, B292, the last). Next the order in `docs/plans/after-the-themes.md` (step 2, the re-attempt, done: B294, 2026-11-09; step 3 next).
- **Next: work down the need keys** (the set walk ended 2026-10-27 with batch 234; its record moved to `COMPLETED.md`) (`docs/plans/need-keys-after-the-walk.md`,
  in progress; the tooling, the model trial, and Phase 1's merge and existence check landed
  2026-10-27): next, Phase 1 step 2, the recheck round. 863 cards were frozen 2026-10-27 into nine
  lists of about 100 (no open need, or every open need judged to exist), `engine/data/recheck/R1.txt`
  to `R9.txt`. They are worked as parallel rounds from a fresh session: `author-walks-parallel`'s
  "A recheck round", one list per child under the `author-recheck` skill. Lists done: R1 (B235, 73 authored, 27 still blocked; the token-copy as-enters gap,
  `bug:token-copy-skips-as-enters-choices`, now blocks seven), R2 (B236: 20 authored, 80 still blocked on narrow keys), R3 (B237: 23 authored, 77 still blocked on narrow keys), R5 (B239: 15 authored, 85 still blocked on narrow keys; built `skip-untap-step`), R4 (B238: 51 authored, 49 blocked on 20 new narrow keys and open ones), R7 (B241: 26 authored, 74 still blocked, 17 new narrow keys; fixed `latestByCard`'s tie on date, which had listed half of R7 on coarse first records though later ones named narrow keys), R9 (B243: 21 authored, 42 still blocked on 29 new narrow keys and open ones), R6 (B240: 25 authored, 75 still blocked, 29 new narrow keys; built the opening-hand reveal, rule 103.6b), R8 (B242: 16 authored, 84 still blocked on narrow keys — 39 new; `static:static-types-outside-battlefield` now blocks five of them, `replacement:token-creation-add-extra` four).
  All nine lists done 2026-10-28 (rounds one and two, B235–B243). **Now Phase 2: build in greedy
  order, a family per session, in series** (the `build-family` skill, from a fresh session each;
  `cards:needs -- --greedy --groups` scores the 617 generalisation groups as build units). Families
  built: grant-protection (B244, 2026-10-28: the `grant-protection` effect and chosen-colour Aura
  protection; 62 of its 72 cards authored, 10 still blocked on narrow keys), variable-target-count
  (B245, 2026-10-28: an amount as an ability's group bound, total mana value caps, groups in a modal
  mode; 38 of its 56 cards authored, 18 still blocked on narrow keys), choose-card-name (B246,
  2026-10-28: rule 201.4's choice as a new decision with a client picker, read back by `chosenName`
  filters or substituted as `hasName`; 26 of its 53 cards authored, 27 still blocked — ten on
  `effect:search-opponent-library`), banding (B247, 2026-10-28: rule 702.22 whole — bands declared
  with the attack, blocked as one, the other side dividing combat damage, "bands with other" and
  "creatures banded with it"; the client's band builder in the attack bar; 44 of its 46 cards
  authored, 2 still blocked on new narrow keys), search-opponent-library (B248, 2026-10-28:
  `search-library` over another player's library or graveyard, hand and library — the searcher
  choosing, that player shuffling, "all" vs "any number" (rule 701.23b), exile face down and
  playable, a cast from the library, `then` over the finds; 39 of its 48 cards authored, 9 still
  blocked — four on `effect:exile-chosen-from-revealed-hand`), and — **several families a session
  from here, one verify** (the user's call, 2026-10-28) — static-lose-all-abilities,
  combat-restriction-extensions and set-types (B249, 2026-10-28: a static loss of all abilities in
  dependency order and as a permanent enters, block limits with the client's block builder,
  "becomes a [type]"; 98 cards authored, 22 still blocked — three on
  `effect:set-creature-type-all`, two on `static:cant-block-by-subtype`), damage-modification
  (B250, 2026-10-28: static damage replacements over a host, "your side", redirection and computed
  prevention, unpreventable damage, the one-shot `damage-rule`, next-time shields over a whole
  event; 148 cards authored, 65 still blocked — five on `effect:prevent-next-damage-each-creature`
  /`decision:prevention-shield-allocation`, three on `decision:choose-permanent`),
  choices-by-other-players, target-spec-additions and repeat-process (B251, 2026-10-28: rule 101.4's
  held discards and entries, "each player chooses" as a `vote` with `choose`, the `sameController`
  target relation, `repeat`, and a modal spell's per-mode slot relations; 81 cards authored, 27 still
  blocked — three on `effect:repeat-until-no-player-acts`), grant-static-to-permanent,
  basic-land-type-mana, choose-land-type-on-resolution and control-change-extensions (B253,
  2026-10-29: `grant-static`, "can't be blocked by [X] this turn", rule 305.7's land-type setting
  with its 613.8a dependency, "the basic land type of your choice", `exchange-control`; 90 cards
  authored, 31 still blocked — six on `effect:targets-share-type`, three on
  `effect:set-land-types-all`), remove-counters-from-chosen, modal-activated-targeted-modes,
  cast-and-activate-restrictions' host-lock unit and amount-fields-dynamic (B254, 2026-10-29: the
  `remove-counters` decision for chosen counter costs and the `remove-counters` effect, modal
  activated abilities offered once per mode, `hostOfSource` with `onlyTapAbilities` and
  `counter`'s `lockSource`, a scoped sacrifice's count per player; 112 cards authored, 26 blocked —
  17 of them on other open keys, four new narrow keys), and — features only, from 2026-10-29
  (`build-family` builds, `author-freed` authors) — dies-after-dealt-damage-by-source,
  switch-pt, attack-restriction-defending-player-condition, the target-player chooser,
  chosen-from-revealed-hand destinations and a triggered ability's other-player targets (the
  `damagedThisTurnBy` source, layer 7d, a `PlayerTest` on the defending player,
  `ChosenPlayerRef`, `discard-chosen`'s `destination`, `targetsChosenBy`; 16 proving cards),
  separate-into-piles (2026-10-29: rule 700.3's piles as an effect and two decisions, the client's
  pile popup and board piles; 20 freed, 4 proving cards — Fact or Fiction, Curator of Destinies,
  Liliana of the Veil, Death or Glory), choose-player (2026-10-29: "as this enters, choose a
  player / an opponent" and `choose-opponent { remember }` as `GameObject.chosenPlayer`, read by
  a `"chosen-player"` scope, trigger subject, hand size and filter; `mostLife`; 10 freed, 7
  proving cards — Black Vise, The Rack, Cursed Rack, Saskia the Unyielding, Triarch Stalker,
  Beckoning Will-o'-Wisp, The Master, Gallifrey's End), count-for-chosen-player and
  player-scope-extensions (2026-10-29: `countOf`'s `forPlayer`, `forChosenPlayer` on a CDA or
  count-scaled bonus, a per-player graveyard count, `{ controllerOfTarget }` as the player who
  draws, discards or gets poison; 33 freed, 10 proving cards — Lost Order of Jarkeld, Entropic
  Specter, Nyxathid, Weight of Spires, Emissary of Hope, Typhoon, Nature's Resurgence,
  Assassin's Strike, Call to Heel, Pistus Strike), choose-permanent's first unit (2026-10-30:
  `choosePermanentOnEnter` kept as `GameObject.chosenPermanent` and read as "the chosen
  creature", `choose-permanents`' `chooser`, amount `min` and `exceptTriggerObject`; 16 freed,
  9 proving cards — Tyrannical Pitlord, Dauntless Bodyguard, Grifter's Blade, Phylactery Lich,
  Sunken Hope, Tangle Wire, Crashing Boars, Saw, Cloudstone Curio), discard-all-matching
  (2026-10-30: `discard`'s `filter`, `discard-hand`'s `filter`, `reveal` and target `who`; 15
  freed, 7 proving cards — Amnesia, Trapfinder's Trick, Shatter Assumptions, Hidden Horror, Pack
  Guardian, Nantuko Cultivator, Mind Maggots), look-and-choose-target-opponent-library
  (2026-10-30: `look-and-choose`'s `from`, a `"graveyard"` destination, `"top-any-order"`; 15
  freed, 5 proving cards — Architects of Will, Draugr Thought-Thief, Cruel Fate, Sealed Fate,
  Balshan Beguiler), outside-the-game (2026-10-30: a real **sideboard** — `DeckList.sideboard`
  as `zone: "outside"` objects, none in Commander (rule 903.5e), at most 15 (100.4a);
  `search-library`'s `outside` and `faceUpExile`; `learn()` whole, its Lesson from the
  sideboard; the wire, the import's `Sideboard` section, the deck editor, the player panel's
  "sideboard N" and the builder's zone; 16 freed, 5 proving cards — Burning Wish, Living Wish,
  Coax from the Blind Eternities, Mastermind's Acquisition, Legion Angel), player-state-thresholds
  and defending-player-controls (2026-10-30: `of-player` — any condition read from that player's,
  the active player's, a target's or the defending player's seat — `player-compare`,
  `for-each-player`'s `whoIf`, starting-life bounds, `controls`' `anyController`, "no monarch";
  71 freed, 14 proving cards — Lavaborn Muse, Septic Rats, Hidetsugu's Second Rite, Depopulate,
  Sunset Revelry, Rivalry, Tectonic Hellion, Speaker of the Heavens, Righteous Valkyrie, Planar
  Collapse, Harbor Serpent, Bouncing Beebles, Hooded Horror, Aerial Surveyor), skip-untap-step
  (2026-10-30: a static's `skipsSteps` and the one-shot `skip-step`, a skipped upkeep or draw
  step passed as though it didn't exist; 13 freed, 7 proving cards — Stasis, Eon Hub,
  Gibbering Descent, Damia, Sage of Stone, Fatigue, Molten Firebird, Elfhame Sanctuary),
  prevent-combat-damage-to-and-by-target (2026-10-30: no engine code — B250's `damage-rule`
  already ran it; the scaffolder taught; 15 freed, 4 proving cards — Ebony Horse, Awe Strike,
  Stonewise Fortifier, Tajic, Legion's Edge), the chosen-value group (2026-10-30:
  `choose-value` — a colour, card type, counter kind or number chosen as it resolves — the
  `choose-number` decision and `reveal-hand`; 22 freed, 7 proving cards — Persecute, Sudden
  Demise, Void, Blood Oath, Fertile Imagination, Ichormoon Gauntlet, Medicine Runner),
  amount-new-variants' top five units (2026-10-30: a `distinct` aggregate — different mana
  values, powers, names — over permanents or graveyard cards, also as a condition, a cost
  reduction and a CDA; `countInGraveyard`'s `forTarget`/`forPlayer`; `isSource` for "Equipment
  attached to it"; `countPlayers`' `where`; 70 freed, 13 proving cards — Lunar Insight, Golden
  Ratio, Aven Heartstabber, Sewer Crocodile, Awakened Amalgam, Corpse Augur, Roiling Terrain,
  Goblin Gaveleer, Kemba, Kha Regent, Oreskos Explorer, Priest of the Blessed Graf, Terra
  Ravager, Treacherous Terrain), combat-restriction-extensions' top two units (2026-10-30:
  `blockedByAtLeast` — "except by N or more creatures" — `blockedOnlyByAll`, the `controls`
  condition's `sharingACreatureType`, `restrict`'s `cantBlockAttacker`, the `"must-block"`
  restriction; 32 freed, 14 proving cards — Troll of Khazad-dûm, Pathrazer of Ulamog, Sonorous
  Howlbonder, Neurok Spy, Hazy Homunculus, Graxiplon, Tromokratis, Kraken of the Straits,
  Gingerbrute, Kozilek's Pathfinder, Auriok Siege Sled, Razorgrass Screen, Iron Golem, Grand
  Melee; the family's must-attack and attack-limit units still open), modal-repeat-modes
  (2026-10-30: `castModal.repeatModes`, "you may choose the same mode more than once" — the
  client's mode picker counts copies; "choose one that hasn't been chosen" was already
  `notChosenBefore`; 15 freed, 3 proving cards — Fiery Confluence, Mystic Confluence, Kimoyo
  Beads) and shuffle-library's top unit (2026-10-30: `shuffle-graveyard-into-library`'s `zones` —
  hand, graveyard, permanents owned — and `drawThatMany`; 15 freed, 3 proving cards —
  Timetwister, Winds of Change, Whirlpool Warrior) and assign-damage-as-though-unblocked
  (2026-10-30: the `assignAsThoughUnblocked` static and `assign-as-though-unblocked` effect,
  answered on `assign-combat-damage`'s `mayUnblocked` with the client's "All to [defender]";
  the `blocked` filter; 11 freed, 5 proving cards — Thorn Elemental, Indomitable Might, Siege
  Behemoth, Outmaneuver, Predatory Focus), additional-cost-reveal (2026-10-30: a `fromHand`
  behold spec without `exile` as a reveal from the hand — "reveal a Kithkin card or pay {3}",
  the kicker `keyword: "reveal"` with `orControls` ("or controlled a Dragon as you cast this
  spell", not inherited by a copy), the activated `reveal` cost's "Reveal X white cards"; 9
  freed, 8 proving cards — Goldmeadow Stalwart, Silvergill Adept, Draconic Roar, Orator of
  Ojutai, Scaleguard Sentinels, Martyr of Sands, Martyr of Spores, Martyr of Ashes),
  remove-all-counters (2026-10-31: `remove-counter`'s `amount: "all"`, with `counter: "any"`
  every kind, and `remove-counter-all` over a filter; a token stack's removal counted token by
  token this way; 11 freed — Relic Amulet still needs `cost:remove-all-counters`, and Nexus
  Mentality's draw would count its first mode's moved counters too when both modes are chosen,
  since a modal spell's modes share one "this way"; 6 proving cards — Vampire Hexmage, Blitz
  Leech, Enchanted River's Grasp, Oblivion Stone, Aether Snap, Pestilent Haze),
  cant-activate-abilities-until-next-turn (2026-10-31: `prohibit`'s `regeneration` — on a
  target or the creatures dealt damage this way, rule 701.19c — and `monarch` ("you can't
  become the monarch this turn", rule 725.4), `become-monarch`'s target slot, a target's
  abilities prohibition `until-your-next-turn`, a prevention replacement's
  `thenCountsUnprevented`; 14 freed — Bone Shaman's granted ability still needs its own key —
  `effect:cant-phase-out` left open; 5 proving cards — Incinerate, Flamebreak, Disintegrate,
  Jared Carthalion, True Heir, Mythos of Vadrok),
  turn-event-tallies' graveyard group (2026-10-31: the turn history's `discarded` list and its
  `to-graveyard` list with each arrival's origin zone — `from` / `notFrom` on the `turnHistory`
  amount and the `turn-history` condition, the amount's `target` slot — and the
  `discardedThisTurn` filter, a declined madness card keeping it; 10 freed — Follow the Bodies
  still needs gravestorm, and Dimir Strandcatcher's "opponents being attacked" wants a look; 8
  proving cards — Change of Fortune, Gilt-Blade Prowler, Recalibrate, Cruel Calculations,
  Fraying Sanity, Structural Assault, Ichor Shade, Shadow of the Grave),
  assist (2026-10-31: rule 702.132a — a cast's `assist` names the other player asked, its offer
  an assist variant per player whose mana could help; they answer a `choose-number` of how much
  of the total cost's generic mana they pay, the caster paying the rest or the cast reversed
  (rule 733.1); the client's "(assist: Bob may pay up to N)" buttons; bots never ask, v1 offers
  nothing; 16 freed, 3 proving cards — Charging Binox, Gang Up, Out of Bounds),
  choices-by-other-players' top group (2026-10-31: `choose-among-targets` — a player picks among
  a spell's own still-legal targets as it resolves, the chosen and the rest each a pile fate;
  `opponentChoosesTargets` on a spell or activated ability — the caster names the opponent (the
  cast's `otherChooser`, a variant per opponent) who answers the existing `choose-targets` for
  those slots mid-cast, `controlledBy: "chooser"` for "they control", a `cast-now` cast too;
  `castModal.chosenBy: "opponent"` — the named opponent answers `choose-modes` as it's cast and is
  "that player" of the modes; not yet: a trigger's "of an opponent's choice" (Mausoleum Turnkey),
  Mogg Assassin's "that opponent", targets after an opponent's mode (Fatal Lore); 7 freed beside
  9 proving cards — Incriminate, Barrin's Spite, Retribution, Wake to Slaughter, Evangelize,
  Volcanic Offering, Magus of the Arena, Library of Lat-Nam, Misfortune),
  loyalty-x (2026-10-31: a "−X" loyalty cost, `loyaltyCost: "-x"` — X announced as it's
  activated (rule 107.3a) on the activation's existing `xCost`, up to the loyalty it has
  (606.6), the client's X prompt unchanged; v2 weighs each X from 1 up, v1 keeps a counter;
  "+X" has no card yet; 12 freed, 3 proving cards — Chandra Nalaar, Chandra, Flamecaller,
  Tezzeret the Seeker),
  meld (2026-10-31: rules 701.42 and 712.4 — the `meld` effect exiles a meld card and its
  counterpart, both owned and controlled, and puts them onto the battlefield as one new object,
  `GameObject.melded`, with the combined back face's characteristics (a definition's `meldOf`)
  and the fronts' mana values summed; several counterparts asked on `choose-permanents`; the
  `meld-ready` intervening if; leaving, it is two cards, and a blink, an O-Ring or a "with this"
  exile finds both (`leftWith`, mutate's components too); 11 freed, 4 proving cards — Graf Rats,
  Chittering Host, Hanweir Battlements, Hanweir, the Writhing Township),
  remove-any-counter-cost (2026-10-31: counters of chosen kinds — B254's `remove-counters`
  already covered both keys' core; added a `permanent` slot's `orPlayer` for "…, or opponent", a
  player's own counters removed kind by kind on `choose-modes`, `anyController` for "from among
  permanents on the battlefield", the bots taking an opponent's best counters; 12 freed, 4
  proving cards — Price of Betrayal, Eventide's Shadow, Hex Parasite, Glen Elendra Guardian),
  may-cost-non-mana's energy group (2026-10-31: a `may`'s `costEnergyX` — "you may pay one or
  more {E}" / "any amount of {E}", X the amount paid on `choose-modes`' existing X, its offer's
  `xCost` marked `energy`, "any amount" applying its effect at X 0 when declined and never the
  spell's own X; `alternativeCostForSpells`' `energy` and `flash` (rule 601.3c); a `cast-now`'s
  `byPayingEnergy`; the client's X field on a "you may pay" — which also gives Leyline Tyrant's
  "any amount of {R}" its X, sent as 0 before; 15 freed, 8 proving cards — Harnessed Lightning,
  Die Young, Wrath of the Skies, Territorial Aetherkite, Nissa, Worldsoul Speaker, Primal
  Prayers, Amped Raptor, Jolted Awake; the family's creature-type-as-cast, nonmana-escalate and
  one-card units still open),
  cast-and-activate-restrictions' top group (2026-10-31: a spell's own conditional flash,
  `flashIf` — a `condition` read from the caster's side as the cast begins (rules 601.3d,
  601.6a), or `targets`, one chosen target matching (601.3b, 601.6), its one fitting slot offered
  only those when nothing else lets it be cast now; 10 freed — Silver Scrutiny's "if X is 3 or
  less" still needs an X cap, Colossal Rattlewurm also its battlefield flash, Fated Clash, Take
  for a Ride and Mutual Destruction conditions of their own to check; 5 proving cards — Hungering
  Yeti, Crashing Tide, Swift Reckoning, Flash Photography, Timely Ward; the family's grantee and
  prohibition units still open),
  gain-abilities-from-graveyard's top group (2026-10-31: "has all activated abilities of …",
  `grantsActivatedOf` — graveyard cards, the library's top card, or other permanents with all
  they have, two such statics reading each other applied in dependency order and a loop in
  timestamp order (rule 613.8); `except` mana/loyalty, `only` loyalty (606.3 per permanent);
  `sameNameAsSource`; `spendManaAs`' `activating` "this"/"granted"; 8 freed — Nicol Bolas,
  Dragon-God's +1 still needs a hand-or-permanent exile choice, Scheming Fence a filter for its
  chosen permanent, Cairn Wanderer's are keywords, not activated abilities; 7 proving cards —
  Necrotic Ooze, Thranduil, the Elvenking, Skill Borrower, Experiment Kraj, Marvin, Murderous
  Mimic, Sharkey, Tyrant of the Shire, Drana and Linvala; the family's exiled-card units and Grell
  Philosopher's until-end-of-turn form still open),
  choose-card-type-protection's group (2026-10-31: a value chosen as it enters read by its other
  lines — the `ofChosenColor` filter clause (targets, triggers, counts, a source of your choice,
  whose shield keeps the colour, rule 608.2h; Paradise Plume, Jeweled Torque, Prism Ring and the
  Diamonds moved onto it from five conditional copies), a player's protection from a quality,
  `playerProtection` (rule 702.16b, c, e — targeting, Curses, damage), `chosenCardType` on it and
  on `protection`, and the chosen creature type read by an entering replacement and by
  `doubleTriggersOf` (now with `others`); 8 freed — Seal of the Guildpact and Tablet of the
  Guilds still need two colours chosen, Zombie Boa a colour chosen on activation;
  `decision:choose-name-and-type-on-attach` (Psychic Paper — a choice as an Equipment attaches
  and a name-setting effect) left open; 7 proving cards — Pentarch Paladin, Curse of Wizardry,
  Story Circle, Serra's Emissary, Runed Halo, Metallic Mimic, Roaming Throne),
  amount-aggregate (2026-10-31: the aggregate amount over any set — `in` graveyards, exile, the
  attackers that fired an `attacks-batch`/`attack-with` trigger (`LastKnownRefs.attackedTogether`,
  read as it resolves or as last on the battlefield), lists of zones and `plus` sets with filters of
  their own, `aggregate: "count"`, `of: "counters"` (every kind), `forTarget`; a count-scaled
  bonus's `aggregate`; `thisWay`'s `greatestOf`; also took the next family's `amount:count-in-exile`
  and the counters group's two keys; 17 freed — Amzu's "those cards" (left a graveyard) still needs
  its own batch ref, Backstreet Bruiser a static that counts its own counters, Angrath's −11 a
  survivors-plus-destroyed sum (`thisWay` plus a target-side aggregate, each clamped);
  `effect:top-card-of-graveyard` and `effect:greatest-among-discarded` left open; 9 proving cards —
  Carrion Grub, Emissary Escort, Ambitious Dragonborn, Crackling Drake, Maester Seymour,
  Ferrafor, Young Yew, Shriekwood Devourer, Vulpine Harvester, Heretic's Punishment), and — the
  first pair built side by side in worktrees — face down by an effect (2026-10-31: the `"effect"`
  face-down kind, `turn-face-down`, `faceDown` entry with `FaceDownAs`, `manifest`'s `from`,
  `cant-turn-face-up`; `mechanic:face-down` partial; 22 freed, 5 proving cards — Cyber
  Conversion, Yedora, Grave Gardener, Tezzeret, Cruel Machinist, Orochi Soul-Reaver, Unable to
  Scream) and divide-among-targets (2026-10-31: `divided.total` any `EffectAmount`, fixed as it's
  announced, and a reflexive trigger that divides; 8 freed — Meteor Shower and Shatterskull
  Smashing still blocked on a total beyond plain X; 6 proving cards — Volcanic Wind, Monstrous
  Onslaught, Lukka, Bound to Ruin, Ureni, the Song Unending, Orca, Siege Demon, Death to Our
  Enemies), cards a player owns taken from exile (2026-10-31: `look-and-choose`'s `zone:
  "exile"`, `needsMin`, `this-way: "chosen"`, `AbilityCost.putFromExile` and
  `additionalCost.putFromExile`, a face-down exiled card taken from its pile at random (rule
  406.4) and picked by its back in the client's zone viewer; 8 freed — Ulamog's Despoiler still
  needs an optional cost as it enters; 6 proving cards — Wasteland Strangler, Ulamog's Nullifier,
  Oblivion Sower, Memory Theft, Void Attendant, Processor Assault), cost changes for one kind of
  ability (2026-10-31: `abilityCostModification`'s `abilityKind` — equip, exhaust, cycling,
  loyalty — `byYou`, `targetingSource`, `increaseLoyalty` merged into one loyalty cost (606.5); 7
  freed, 7 proving cards — Bureau Headmaster, Bladehold War-Whip, Dwarven Mauler, Boom Scholar,
  Fluctuator, Eidolon of Obstruction, Carth the Lion) and each permanent of a kind deals damage
  (2026-10-31: `each-deals-damage` — its power or N, to itself, a target, the trigger's object or
  each opponent, each permanent its own source, one damage event; 8 freed, 6 proving cards —
  Solar Blaze, Wave of Reckoning, Moonlight Hunt, Bartz and Boko, Signature Slam, Alpha Brawl),
  flash permissions (2026-10-31: `castAsThoughFlashAnyPlayer`, `castAsThoughFlashFirstEachTurn`,
  the player-effect `castAsThoughFlash { filter?, next? }` spent by the next matching spell,
  suspend reading every flash permission; 3 freed — Scout's Warning ("play") and Arlinn, the
  Pack's Hope left; 11 proving cards — Vernal Equinox, Quick Sliver, Tidal Barracuda, Radagast of
  Rhosgobel, The Blue Spirit, Borne Upon a Wind, Emergence Zone, Winding Canyons, Alchemist's
  Refuge, Quicken, Progenitor's Icon) and a library search's finds card by card (2026-10-31:
  `search-library.instead` — by the card, a condition, the searcher's choice or a split of one,
  to the graveyard or under another's control — `withCounters`, `who: "that-player"`; 5 freed, 8
  proving cards — Jarad's Orders, Dina's Guidance, Ruin in Their Wake, Guidelight Pathmaker,
  Rootweaver Druid, Neoform, Magmatic Hellkite, Vision Quest); then, three local agents at once
  with two families each, and cloud sessions (each on `COMPLETED.md`'s list for 2026-10-31): the
  shared-type and same-name filters (`ShareReference`, `sameNameWith`; 11 freed, 14 proving
  cards), attach hosts and statics granting statics (`attachedTo` with `{ among }` or a player,
  `ontoChosen`, `attachOnlyTo`; `grantsStatic`; 21 freed, 18 proving cards — Animate Dead's
  enchant swap and granted cost reductions left), a random card from a hand or a linked exile and
  the linked exile put onto the battlefield (`choose-random-card`'s `zone`, `look-and-choose`'s
  `"exiled-with-source"`; ~15 freed, 10 proving cards — Lagrella's counters left), and in the
  cloud the blocking-relation families (`blockingRelation`, attack requirements) and graveyard
  casting with keyword grants to spells; then P/T scaled by a hand size or life total and base
  power or toughness set alone (`grantPtPerCount.cardsInHand`/`lifeTotal`, a life-total CDA,
  `animate`'s lone `power`/`toughness`; 17 freed, 10 proving cards — Vhati il-Dal's either/or
  left), counters put or removed this way and distributing counters (a player's counters in
  `"counters-removed"`, a remove-all cost as X, `removeAllCountersFrom` as it enters,
  `counters-distributed` among permanents chosen on resolution (608.2d); 12 freed, 12 proving
  cards), and enlist with who crewed what (`StaticAbility.enlist` asked after attackers tap,
  `crewedThisTurn`, `crews-or-saddles`, `cant-crew`; 16 freed, 10 proving cards, four manual
  checks); then, overnight (2026-10-31, `/build-family overnight`, three local agents with two
  families each): enter-as characteristics and a spell copy's exceptions and gains
  (`EnterTypes.addTypes`/`setColors`/`basePt`/`keywords`/`ifCreature`, `copy-spell`'s `except` and
  `gains`; 15 freed, 8 proving cards), the card discarded to pay a cost and a granted ability's
  granter (`LastKnownRefs.discarded`/`granter`; 15 freed, 8 proving cards — Fishing Pole and Hold
  for Ransom left), and several cards into their owners' libraries, owner-ordered, with graveyard
  cards shuffled in by filter or target (`put-on-libraries`; 9 freed, 13 proving cards — Riptide
  Gearhulk on a narrow key), cards put into a hand this way and a look's pick exiled with a play
  permission (the `"put-into-hand"` this-way kind, `move-exiled-this-way`, look-and-choose's
  `playable` and `leftover: "exile"`; 10 freed, 13 proving cards), and sacrifice costs matched
  against their source with the card revealed for a cost (`isSource`/`hostOfSource`/`ofChosenType`
  in a cost, the `"revealed"` amount, `reveal.shareColor`; 6 freed, 15 proving cards), and one
  choice across zones with a card name chosen with a player (look-and-choose's `together`,
  `discard-chosen`'s `alsoFrom`, `revealsDraws: "chosen-player"`; 15 freed, 8 proving cards, two
  manual checks — Selective Adaptation on the stale list is still open: one card for two keywords?),
  and relations among the chosen targets with what's attached to a target or a player (`shares`,
  `equalToughness`, `differentNames`, `attachedToTarget`/`attachedToPlayer`/`attachedToThan`; 20
  freed, 9 proving cards), and a graveyard card put there this turn by its origin with a discard's
  cause (`putIntoGraveyardOn`, `putIntoGraveyardThisTurn`, `cards-discarded`'s `cause`,
  `this-discarded`, `firstTimeEachTurn`; 14 freed, 13 proving cards — Ravenous Trap on the stale
  list is wrong in multiplayer: `turn-history`'s `who: "opponent"` sums the opponents, where it
  needs one opponent's three), and text-changing effects with colours in addition (`change-text`,
  `PtModifier.textChange` through `rulesTextName`, `become-color.inAddition`, `addColors`; 13 freed,
  9 proving cards — on the stale list Swirl the Mists' static, Possessed Goat's once-ever
  activation and Hunting Wilds' `animate-all` colours are still open), and no land plays this turn
  with casts barred by zone and activations counted this turn (`prohibit`'s `lands`, `prohibits`'
  `from`/`notFrom`, `timesEachTurn` as a count, `activated-this-turn`; 11 freed, 9 proving cards —
  Memory Vessel on the stale list needs an impulse lasting until your next turn begins, Rock Jockey
  `condition:played-land-this-turn`), and (2026-11-01) a cost keyed to a spell's target and a player
  named as a target's owner (`targetedBySpellsCost`'s `payGeneric` and `targeting`, `targetTaxes`,
  `controllerGraveyardAtLeast`, `{ ownerOfTarget }`, `"trigger-owner"`, `"attached-owner"`; 9 freed,
  11 proving cards — Audacious Swap on the stale list may still need its owner's exile-and-cast), and
  keyword abilities and types for cards outside the battlefield and a static P/T bonus by each
  affected permanent's own count (`grantsToGraveyard.keywords`, `grant-graveyard-keyword`,
  `typesOutsideBattlefield`, `grantsCyclingInHand`, `grantsForetellInHand`, `grantPtPerCount`'s
  `relativeToAffected`; 28 freed, 34 proving cards — on the stale list Ghost Ark needs a "becomes
  crewed" trigger, Ethereal Valkyrie a foretell from exile, Araumi its own cost; left open:
  `static:graveyard-cast-filter-amount`, `static:pt-per-turn-history`,
  `static:pt-per-attachments-on-source`), and one choice per card type or mana value and another
  player choosing (`together.oneEachTypeAmong`, `totalManaValueAtMost`, `look-and-choose.split`,
  `SearchInstead.chooser`, `chooser: "an-opponent"`, `choicesHeld`, `discard-chosen.chooser`; 31
  freed, 17 proving cards — on the stale list Green Sun's Twilight needs its destination choice, and
  Extract Brain, Forgotten Lore, Manifold Insights, Emergent Ultimatum, Plargg and Nassari,
  Elemental Teachings, Threats Undetected and Ecological Appreciation are only partly covered), and
  limits on the untap step and restrictions keyed to the other creatures in combat (`untapLimit`,
  `untapOnlyChosenType`, `combat/company.ts`; 15 freed, 11 proving cards), and token copies of a
  linked source and impulse windows as predicates (`create-token-copy`'s `of`, `PermissionDuration`,
  `sourceDid`; 26 freed, 18 proving cards — on the stale list Osgir needs an exile cost's filter
  reading X, Tawnos a sacrifice and an exile in one cost, Phantom Steed its "Illusion" only if a
  creature, Prototype Portal and Soul Foundry an X equal to the mana value, Nahiri an attack
  requirement, Elkin Lair and Advanced Reconstruction a random exile, Gwen Stacy her back face's
  trigger), and ten more (2026-11-01; `COMPLETED.md` has each): a source of your choice over any
  recipient, protection by any source quality, choosing among revealed cards, a life total set, a
  sweep leaving out its source, attack taxes, an unless's payments, return what entered a graveyard
  this turn, turned face up by an effect, blocked or was blocked this turn (54 freed, 64 proving
  cards — on the stale list Mourner's Shield needs "shares a color with the exiled card" as a filter,
  Norn's Annex a {W/P} attack tax, Archangel of Tithes `static:block-tax`, Reservoir Kraken several
  opponents answering an unless, Shadow of Mortality a cost reduced by the difference from starting
  life, Glyph of Reincarnation, Glyph of Delusion and Cathedral Membrane their blocked-creature
  wording), and six more: spell-cast limits, next-spell cost reductions, a copy on the way in from a
  graveyard or exile, sacrifice or discard instead of entering, a card's own copy limit, companion
  (32 freed, 33 proving cards — on the stale list Obosh needs `filter:odd-mana-value`, Lurrus its X
  held to the mana-value cap, Lake of the Dead a chosen sacrifice as a mana ability, Aquamorph Entity
  "or is turned face up", Invasion of Amonkhet a back face's copy), and six more: revealing from a
  hand, a card chosen from a set, a tapped-for-mana trigger on the stack, the most common color, a
  graveyard's order, statics acting on a player (27 freed, 36 proving cards — on the stale list Vault
  13 needs per-player targets, Bane Alley Broker its looker following control, Treasure Nabber
  `gain-control` until your next end step, Spinning Darkness an alternative cost, Bösium Strip a cast
  from the graveyard's top, Phyrexian Grimoire a choice among the top two, Curses of Surveillance and
  Thirst `amount:curses-attached-to-player`), and a trigger's recipient as a reference and who may
  look at what (`"trigger-recipient"`, `DelayedTrigger.recipient`, `StaticAbility.visibility`,
  `look-at-library-top`; 7 freed, 17 proving cards — Sen Triplets on the stale list needs its "this
  turn" hand reveal and playing from another's hand); the next night's: a combat tax on particular
  creatures, can't-attack scoped to the defender, sacrifice costs in parts, tap costs counted or by
  shared type (2 freed by the first two, 11 by the last two; 29 proving cards), controlling a player
  (3 freed, 7 proving cards), held down through N untap steps and an exile's end as a parameter (7
  freed, 11 proving cards), alternative costs in life and costs that exile a chosen object (7 freed,
  12 proving cards), a player's number against yours and amounts from this turn's events (6 freed, 17
  proving cards), emblem statics and reveal-until (15 freed, 15 proving cards), same-name filters and
  damage to the source (5 freed, 13 proving cards), skip-turn and pack tactics (10 freed, 10 proving
  cards), cost reductions and cast rules (46 freed, 36 proving cards), player scopes and ability cost
  reductions (13 freed, 25 proving cards), a number a player chooses (3 freed, 7 proving cards), cycling
  variants and limited free casts (1 freed, 15 proving cards), ending the turn or combat and attack or
  block limits (6 freed, 11 proving cards), choices kept and life exchanges (4 freed, 12 proving cards),
  token replacements and damage history (12 freed, 16 proving cards), join forces, life bidding,
  opponent-caused discards and opening-hand abilities (10 freed, 16 proving cards), a reflexive
  ability naming what its parent made or targeted (3 keys, 4 freed, 5 proving cards), attack triggers
  narrowed by attackers and the player attacked (2 keys, 5 freed, 3 proving cards). **About 1381 freed cards wait for the authoring
  sweep**
  (`cards:needs -- --stale`); `author-freed` authors them next, batch by batch, and the remaining keys come after (the user's call, 2026-11-04).
  Cloud sessions are building `keyword:hexproof-from-colors`, the combat-restriction second group,
  `effect:prevent-next-n-damage-to-you`, the cascade/sunburst grants to spells,
  `cost:kicker-nonmana-cost` and `cost:alt-cost-discard-cards`. Built 2026-11-02 (third overnight
  round, 1413 freed): `trigger:lose-control-trigger`, `condition:filter-attachments`,
  `effect:search-hand-graveyard-library`, `condition:filter-card-property-clauses`,
  `cost:choose-cards-as-cost`, `mechanic:face-down`, `effect:double-counters-each-kind`,
  `decision:free-cast-choices` (not `decision:cast-one-per-card-type-from-exile`: its two-type cards
  need rulings), `effect:cast-from-linked-exile-free-this-turn`, `effect:damage-from-attached`,
  `cost:mana-spending-rules`, `replacement:damage-modification`; then the general effects
  `for-each-permanent` and `as-player`, which closed 25 keys between them, and 5 keys the vocabulary already
  covered. **Before building a key, try writing its card from `card:find`:** 360 open keys' notes say the
  vocabulary lacks an option, and the 9 tried of those all ran as it stood (`docs/plans/need-keys-after-the-walk.md`, the
  over-count pilot and its recheck, which closed 44 more). Fourth overnight round, 2026-11-02: damage prevented this way, this-way
  results, permissions over exiled cards, linked face-down exile, unattach as a cost, a keyword's non-mana cost,
  can't-have keywords, added supertypes, whole hands exiled face down, returns from every graveyard, token copies'
  as-enters choices, turn skips, durations to a later turn's point, animates setting characteristics, different-named
  choices, countering abilities, combat restrictions read as another player, animates granting abilities, alternative
  costs' non-mana parts, spells gaining abilities, one unless clause, copies per permanent, attack counts, "those
  creatures", watching delayed triggers, a spell's additional cost taking `KickerAlsoCost`, dynamic life costs, a cost paid
  N times, a look at another player's top card, random targets, skipped combat phases, the creatures blocking a trigger's object and counts of them, coloured cost
  increases, offering, secret choices, a static making a planeswalker a creature, mass type changes, a count of different
  mana costs, permanents controlled since the turn began, a may another player answers, batched dies triggers, tokens linked to
  an exiled card or their maker, "up to" in a searched public zone, an Aura tapping its host, mana abilities from a hand or a
  graveyard, attacks on a battle or an opponent, landwalk of any kind, draw replacements, mana pools, lands tapped for other
  mana, a player becoming a target, hexproof from abilities, cards in exile as targets, "this way" results, greatest of a zone, Aura-host statics, combat requirements by filter,
  batched and first-time tapping, a hand looked at as a permanent enters, protection outside the commander's identity, tokens
  created with their source, one target slot over players and permanents, the abilities of exiled cards, mana restrictions
  read at the cast, suspend X and one of each category, the greatest of an amount among players, chroma and what a permanent
  devoured, triggered mana abilities that do more, more spend-only purposes, control changes with a computed recipient and the
  active player's target against their own count, keeping some of yours by count or total power, a choice beside a spell's
  targets, comparisons between players' states, a player's combat history, effect-made blocks and a creature's record of combat,
  reselecting attackers, land mana replaced, a random mode announced, the amassed Army, odd and even, one roll's result, libraries that can't be
  searched, a damage life floor, attack costs in permanents, typecycling twice and flashback's costs, graveyard replacements for the turn, who creates a token, limits on drawing, damage amount and excess triggers, counters-put per counter and by batch, exhaust and power-up triggers, pawprint modes, friend or foe, paradigm, lands with an Adventure, a target slot over several kinds, counter all spells, spells back to hand, emblems' grants, exile face down, reads of what's exiled with a source, one instruction's zone moves, as-enters actions, damage dealt by source, forced recombat (649 proving cards; `--stale` 1,714 wait for `author-freed`). Next by `--greedy --groups`: the 5-card long tail, `condition:entry-provenance`, `cost:return-lands-cost`, `decision:choose-from-zone-extensions`, `effect:cast-during-resolution`; `effect:modifier-grants-activated` needs code of its own (activating from hand with an exile cost, a grant lasting until that card is cast from exile).
  Narrow keys `author-freed` should give: Urborg Lhurgoyf and Monstrous War-Leech (they mill as they enter), Ob Nixilis of the Black Oath (an emblem's own activated ability), Grimoire Thief (its named-counter filter is proved on no real card), Eater of Virtue and Death-Mask Duplicant (exiled cards' keywords), Toralf, Overclocked Electromancer, Sigurd and Afterburner Expert, Cannibalize (with one target illegal, does the survivor get exiled unasked? its ruling
  doesn't say), Portal Manipulator (no choice, a target slot read from another), Bribe Taker ("for each kind" is a choice), Head
  Games and Jester's Mask ("search for that many", no this-way count of cards put on a library), Sanity
  Grinding (its ten cards stay on top until after the mill), Namor (`effect:amount-mana-symbols-of-color-in-spell`), Captain America (an intervening-if read as it resolves), Ajani, Nacatl Pariah (keeps one permanent, not one per
  type), Stronghold Gambit (a secret pick from hand), The Toymaker's Trap (an unchosen number, an opponent's guess),
  Total War ("didn't attack" means that declaration, not the turn), Siren's Call (`condition:cast-timing-condition`), Tanglewalker
  (not true landwalk), Veteran's Voice (`hostOfSource: false` would fizzle if the Aura moves onto the target) and Dance of Many
  (its two leave abilities are printed); `replacement:others-enter-as-subtype` (Master Biomancer) stays open.
  Overnight 2026-11-04/05 (`cards:needs -- --by-rank` orders what's left once the 5-card units run out, the user's call: by the best
  EDHREC card a key unlocks, Gemstone Caverns first): untargeted picks from graveyards and exile (2 freed, 10 proving cards), one
  untargeted permanent or card per player (5 proving cards), restrictions for a duration (9 proving cards), goads whose end is a
  condition (9 proving cards) and become-copy for a duration (7 freed, 8 proving cards). `--stale` about 1,720. Narrow keys
  `author-freed` should give: Mirror of Fate (`look-and-choose`'s `then` doesn't run with nothing chosen, and its library exile must),
  The Day of the Doctor (chapters I-III need a while-source play permission from `reveal-until`), Assimilation Aegis (try
  `effect:choose-card-exiled-with-source`), Metamorphic Alteration (a static copy that follows the Aura), Shapeshifter's Marrow.
  Then: a countered spell's destination (1 freed, 5 proving cards), graveyard destinations and a discard put back (4 proving cards;
  `replacement:graveyard-to-library-top-optional`, Pulmonic Sliver, stays open: a "you may" that can wait on every way to a graveyard),
  exile with its own way back (1 freed, 3 proving cards; `effect:exile-until-source-untaps-with-auras`, Tawnos's Coffin, stays open),
  facts fixed as a spell is cast (7 proving cards), turn tallies (1 freed, 14 proving cards), combat trigger clauses (13 proving cards).
  More narrow keys for `author-freed`: Valki ("revealed this way" and its copy ability), Rapid Fire (`effect:grant-rampage-if-lacking`),
  Maddening Imp (`effect:destroy-those-that-didnt-attack`).
  Then: return costs (1 proving card), discard-chosen counts (5), pay or else per object (6; `effect:choices-by-other-players` has 37 units
  left, next `each-player-returns-own-permanent` and the opponent-chooses group), cast-now's terms (10), escape as a grant (8), a modifier
  granting activated abilities (6). `--stale` about 1,728. Narrow keys: Locke and The Ur-Sphinx (a cast until end of turn from among those
  cards), Tazri (`granted-mana-ability-own-colors-gated`), Dawn's Reflection authors as Market Festival does.
  Then: manifest or cloak from a chosen source, piles in exile, a return face down (10 proving cards; `mechanic:morph-land`,
  `replacement:as-turned-face-up-dynamic-counters` and `trigger:manifests-dread` stay open), time counters reaching suspended cards (8),
  names and legendary from effects (3). `--stale` about 1,731: the 5-card units are all built. Narrow keys: Phyrexian Portal, Amy Pond (two
  pairing abilities, `CardDefinition.pairing` holds one), Tenth District Hero (a granted static), The Curse of Fenric's chapter I,
  Arcum's Weathervane and Thermal Flux (snow).
  **By best EDHREC card, from here (`cards:needs -- --by-rank`):** Gemstone Caverns, Sylvan Library, Arena of Glory, Mistrise Village, Selvala,
  Rise of the Dark Realms, Field of the Dead, Birgi. Their records overstated the work more than once (Arena of Glory, Mistrise Village,
  Rise and Field needed no engine code): try the card first. Then Banner of Kinship, Opal Palace, Innkeeper's Talent, Archivist of Oghma,
  Veil of Summer, Unbreakable Formation, Opposition Agent, Tibalt's Trickery, Starting Town, Liliana, Dreadhorde General, High Tide,
  Bloodletter of Aclazotz, The Soul Stone, Tempt with Discovery, Tainted Pact, Throne of Eldraine, Padeem, Promise of Loyalty, Moraug,
  Mechanized Production, Charismatic Conqueror, K'rrik, Grasp of Fate, Tekuthal, Ojer Taq, Ezuri's Predation, Forge Anew, Primal Vigor,
  Sephiroth, Liberator, Coveted Jewel, Hedge Shredder, Vraska, Betrayal's Sting, Vigor. Left of `effect:each-player-may-held-search`: a find
  bound for a hand isn't held (Jungle Wayfinder, Weird Harvest). Left of `decision:manual-payment-choices`: paying from sources (Mr. House,
  Ozai). Narrow keys: Ludevic and Curse of Leeches (a choice while transforming, `replacement:as-transforms`'s field can't ask), Defilers of
  Vigor and Faith (an optional additional cost), Geth's Summons (`condition:per-opponent-target-slot-condition`), Valki, Halo Fountain
  (`cost:untap-cost`), Full Throttle, Final Fortune, Endurance, Cavern-Hoard Dragon, Drown in the Loch, Case of the Locked Hothouse, Feldon of the
  Third Path, Scroll Rack, Comet Storm, Baral, All Will Be One, Dour Port-Mage, Echoes of Eternity, Kozilek, Ulamog, Ashling, Phelia, Sting, The Skullspore Nexus, Ondu Spiritdancer, Open the Way, Delina, Daxos, Seize the Spotlight,
  Adaptive Automaton, Brass's Tunnel-Grinder, Valakut Exploration, March of Swirling Mist, Chainer, Renewed Solidarity, Twinning Staff, Mirror Box, Leyline of the
  Guildpact, Battle Angels of Tyr, The Aetherspark, Claim Jumper, Scheming Symmetry, Contagion Engine, Wedding Ring, Lazotep Quarry, Traveling Chocobo, Urabrask,
  Sheoldred, Commandeer, Jace's Archivist, Halo Fountain, Mutavault, Defense Grid, Anticausal Vestige. **Next: the freed cards, with `author-freed`, batch by batch
  from a fresh session; the remaining keys come after that queue is empty (the user's call, 2026-11-04).** Batches: B255 (2026-11-04: 134 of 150 authored, 16 still blocked,
  three on the new `effect:separate-exiled-cards-into-piles`, two on `effect:choose-from-revealed-hand-without-moving`, the rest one each; fixed piles naming "an opponent" too early).
  B256 (2026-11-04, not `author-freed`: the scaffolder over the whole snapshot, every finished card reviewed: 373 of 383 authored, 10 still blocked, three on the new
  `effect:text-change-token-colors`, two on the mana-ability discard cost, the rest one each; 19 need keys its review showed already run marked built). B257 (2026-11-04: 125 of 150 authored, 25 still blocked, six on `amount:attached-to-source-last-known`, two on `decision:damage-redirect-order`, the rest on keys of their own; agents of 20, 30, 40 and 60 cards, measured in `agent-batches.md`). B258 (2026-11-04: 135 of 150 authored, 15 still blocked, two on `filter:same-name-as-source-last-known`, the rest on keys of their own; agents of 50 and 100 cards; fixed a cast copy counting as a card played, a foretold card counted in exile, and each player's mill read between mills). B259 (2026-11-05: 111 of 150 authored, 39 still blocked, four on `effect:divided-total-reading-x`, the rest one each; agents of 75 and 74 cards and a blind reader; fixed a noncreature source's lifelink and deathtouch). B260 (2026-11-05: 125 of 150 authored, 25 still blocked, three on `filter:has-morph`, seven on new `mechanic:face-down` keys, two each on `filter:blocking-relation-of-target`, `effect:meld-enters-attacking` and `static:loyalty-twice-self-only`; fixed a graveyard return ignoring `enterAs.faceDown`; a cloud clone must be unshallowed first or `--stale` reads empty). B261 (2026-11-05: 102 of 150 authored, 48 still blocked on 43 new narrow keys — the most under `zone:graveyard-cast-permissions` (eleven cards: its permission covers only a plain cast of one card) and `static:grant-static-ability` (five: `grant-static` applies P/T and keywords but not a granted `costModification`, damage replacement, `combatTax` or equip), two each on `static:granted-static-replacement`, `zone:graveyard-play-once-shared-land-or-permanent` and `effect:loyalty-abilities-twice-this-turn`; fixed a card returned transformed and attached being judged as its front face, Vengeful Strangler). B262 (2026-11-05, frozen list F1: 94 of 131 authored, 37 still blocked on 36 new narrow keys, five under `effect:choices-by-other-players`, the rest one or two a family; Lurrus pulled for its X reading, `zone:graveyard-cast-mana-value-on-stack`). B265 (2026-11-05, list F4 of the parallel round: 80 of 133 authored, 53 still blocked on 40 new narrow keys and 9 existing ones — three on `trigger:aura-becomes-attached-to-permanent` (Bramble Elemental, Brood Keeper, Siona: `becomes-attached` is the Equipment's own view), two each on `amount:cards-put-on-library-this-way`, `replacement:enters-with-counter-via-static-graveyard-permission`, `static:attach-as-granted-equipment` and `cost:optional-life-additional-cost-for-spells`; fixed a look-and-choose's filter reading a bare `n: "x"` as 0 (Evershrike), a trigger for a player who left in the same event going on the stack (Valentin), and the fuzzer's random cast tapping no power for teamwork). B263 (2026-11-05, frozen list F2: 108 of 133 authored, 25 still blocked on 22 new narrow keys and three reused — three under `cost:mana-spending-rules` (white mana on X, two face-down-spell restrictions), two under `cost:choose-cards-as-cost`, the rest one each; agents of 67 and 66 cards and a blind reader; fixed a delayed "whenever … discard" watch with `perCard` firing with no trigger object (Pure Intentions), a `nextSpell` filter read without its source (`chosenName` never matched), and `choose-permanents` read without its source or X (Hand of Vecna's "equipped creature")). B264 (2026-11-05, frozen list F3: 111 of 135 authored, 24 still blocked on 22 new narrow keys and one open one, three under `zone:impulse-permission-options` (`playFromExile` takes no flash, additional cost or life payment), two each on `effect:search-finds-castable-this-turn` and `effect:face-down-linked-exile-source-controller-looks`, the rest one each; fixed `tap-all` and `return-to-hand-all` reading `isSource: false` without the effect's source, and the random answer to a choice of permanents naming a token stack only once). `--stale` 532; top-5000 4557/5000, commanders 468/500.
  **The queue is empty** (2026-11-05): its last 532 cards went in one parallel round of four cloud sessions, B262–B265 (393 authored, 139 still blocked on narrow keys; the round is in `COMPLETED.md`). **Next: the remaining need keys, with `build-family`.**
  **`/author-flagged overnight` ran 2026-11-07** (B274): 36 of the 95 flagged cards authored by twelve agents, Moonlit Meditation blocked (pausable token creation), the rest still flagged; `cards:needs -- --asap` lists them. **Need-key themes steps 1-6 done by 2026-11-08 (B275-B279)**: step 5 put every set of objects a card names on one `ObjectSetRef` (`engine/src/object-sets.ts`: what was done this way, a cost's objects, linked exile, the trigger's batch, what's attached to the source, remembered sets), taken by the aggregate, the filter (`inSet`), the share clauses and the one-object amounts; deleted the per-set shapes (nine `LastKnownRefs` fields, five `AmountRef`s, `sumOf` / `greatestOf`, `triggerBatch`, …); added the player aggregate `amongPlayers` and theme 15's captured context (a delayed ability keeps its creator's X, "that player" and `remember`ed sets); and authored 19 cards (the four flagged ones unflagged). `--stale` holds 51 cards for `author-freed` (the 33 steps 2-4 left, and 18 step 5's keys freed: Balancing Act, Captain America, Liberator, Coin of Fate, Cryptic Gateway, Jhoira of the Ghitu, Meek Attack, Osgir, Phyrexian Devourer, Restore Balance, Saheeli's Lattice, Seize the Storm, Shagrat, Soulless One, Storm Elemental, Sunbird Standard, The Eagles Are Coming!, Whiplash, Wild Pair); 35 flagged cards wait. Step 6 (B280) did the cost pipeline and one `chooser` type. **Step 7's first piece landed 2026-11-08 (B281)**: one `ObjectRef` / `PlayerRef` algebra (`engine/src/refs.ts`), relational filter clauses that take them, 18 proving cards and 18 keys built. **Next: step 7's second piece, play permissions, "instead" replacements and combat records** (build-order item 9 of `docs/plans/need-key-themes.md`; the next batch is B282); what each step left unmoved is under its theme's *As built*.
  Key building resumed 2026-11-05 by `--by-rank`: Animate Dead and Necromancy (an Aura on a graveyard card, `swap-enchant`; six proving cards, Dance of the Dead and the three Fate Reforged "-form"s with them, so `--stale` stays at 0), then Bolas's Citadel, Archway of Innovation, Plumb the Forbidden, The Darkness Crystal (with Gisa), Valgavoth, Terror Eater and Carpet of Flowers (their own keys, `--stale` still 0), then Ugin, Eye of the Storms (with Chandra, Heart of Fire), The Eternal Wanderer, Malcolm, Alluring Scoundrel and Caduceus, Staff of Hermes. Then, 2026-11-06 (overnight, five agents, stopped early at the user's call): Shatterskull Smashing (re-landed with its fix), Defiler of Vigor, Skrelv's Hive, Norn's Annex, Summon: Fenrir, Winds of Abandon, The Last Agni Kai, Aven Interrupter, Inti, Thirst for Knowledge, Abundance, Temur Sabertooth, Mutational Advantage, Tempt with Bunnies and Wild Magic Surge. Then the first cards flagged Build ASAP (B270, 2026-11-06, `author-flagged`): Liliana of the Dark Realms, Dracogenesis, Planar Nexus and Aettir and Priwen; then the mill cards (B271: a `mills` trigger and `milledThisTurn` filter) Mirelurk Queen, The Wise Mothman and Tato Farmer; then B272 (`objectTargets`, `reveal-until-count`'s `measure: "mana-value"`, `notOwnedByController`): Dragonhawk, Fate's Tempest, Improvisation Capstone, Gonti, Night Minister and Animist's Awakening, with Tasha's Hideous Laughter; then B273 (`grant-graveyard-cast`'s milled cards and `play`, an `additional-land-drop` of any amount, `player-effect`'s `entersTapped`): Loading Zone, Tablet of Discovery and Nahiri's Lithoforming; **12 flagged cards still wait** (`cards:needs -- --asap`; Locke, Treasure Hunter and Squandered Resources were looked at in B273 and need more than their records' one key suggests), and come first in `--by-rank`. **`--stale` has 15 for `author-freed`** (Defiler of Faith, Flesh and Instinct; Chaotic Transformation; Primitive Justice and Rooftop Storm, whose key turned out to be built already; the mill keys' Glowing One, Infesting Radroach, Screeching Scorchbeast, The Master, Transcendent and Zellix; B272's Dream Harvest and Over the Top; and B273's Due Respect and Pir, Imaginative Rascal). Next by rank: Rise of the Witch-king, Quartzwood Crasher, The Council of Four, Emeria Shepherd, Mycosynth Lattice.
  Narrow keys `author-freed` should give, from that last run's reports: Liberated Livestock (Auras onto each token), Splintering Wind (its token's cumulative upkeep and
  leave trigger), Cait, Cage Brawler (two simultaneous discards; no scope names "you and defending player"), The Last Agni Kai ("until end of turn" mana keeping), Curse of
  Shaken Faith (other needs), Sudden Substitution (an exchange), Chef's Kiss (a random retarget), March of Burgeoning Life and March of Reckless Joy (their own effects). To
  check, likely authorable: Invert Polarity, Foreboding Steamboat, Last Chance, Aang, Airbending Master (airbend and upkeep lines unread).
  **The re-attempt (B294, 2026-11-09):** all 245 cards still missing from the top 5,000 and the top 500 commanders, read against today's vocabulary: 120 authored, 125 blocked on 124 narrow keys (only `effect:additional-beginning-phase` serves two). So about half the blocker records were out of date. 10 of the keys are new; the rest were already true. Top 5,000: 4,885 of 5,000 (116 authored here); commanders 488 of 500. The queue (`--stale`) stays empty.
  **The queue emptied again 2026-11-09 (B293):** the 20 cards theme 15 and the last engine gaps freed, 19 authored (Forth Eorlingas!, Skirge Familiar, Screeching Scorchbeast, Xira, Evil Twin, Callidus Assassin, Human Torch, ...), Sanctum Prelate blocked (`static:choose-any-number-on-enter`). What comes next is in `docs/plans/after-the-themes.md`.
  **The freed queue is empty (B291, 2026-11-09):** the last 145 cards, 109 authored and 36 blocked on 32 narrow keys (`effect:player-cant-gain-life-bound` for Screaming Nemesis, Stigma Lasher and Flames of the Blood Hand; `amount:scavenge-power-in-graveyard`, `trigger:becomes-crewed-first-time` and `filter:directly-above-in-graveyard` two each). `cards:needs -- --stale` lists nothing until more keys land, so `next-theme` (theme 15) and then `build-family` are next. Tonight's gap agents then authored 12 of those 36 (`COMPLETED.md`, Engine rules gaps).

- **Or: more cards, in EDHREC rank order** (the `author-top-cards` skill; the priority 2026-10-13
  to 2026-10-14). `npm run cards:needs -w engine -- --next 60` lists the next
  untriaged cards by rank: rank 8207 on (batch 148 took 7949–8197). Batches run 4-5 agents, ~30 cards each, with the
  leading features built alongside in worktrees. The nine other starter precons' 5 stand-ins
  (`engine/data/sweep-3/PC-*.json`) go as their originals land.
- **Build what blocks the most.** Every card triaged so far needs engine work. **Next:**
  banding (`keyword:banding` — 36, every one on nothing else, 2026-10-23; rule 702.22, and the
  multi-blocking line under the oldest-first walk below), now "until end of turn, whenever …" is
  built (batch 147). Before it
  (`npm run cards:needs -w engine -- --rank`, cards waiting and fully unblocked, 2026-10-16):
  `cost:remove-counters-from-chosen` (21, 14), `effect:effect-on-enchanted-permanent` (21, 16),
  `decision:variable-target-count` (19, 15), `decision:owner-chooses-top-or-bottom` (19, 18),
  `effect:attach-extensions` (18, 11), `zone:graveyard-cast-permissions` (16, 10). Its
  sibling `cost:remove-counter-any-kind` ("Remove a counter from this creature", any kind — 9,
  seven of them Lorwyn Eclipsed's) needs the player to choose which counters when there are
  several kinds, so it's a new decision; build the two together. Also at five now:
  `decision:owner-chooses-top-or-bottom` — the target's owner chooses top or bottom of their
  library (eleven cards now: Trickster's Stratagem, Run Behind, Lost Days, Ice Magic, …), and
  `effect:effect-on-enchanted-permanent` (sixteen: an Aura's host named in an effect). Excess
  damage is built; of its cards, Bolg of the North waits on reading a creature sacrificed as a
  `may` resolves from its reflexive trigger, Violent Echoes on empower, Fall of Cair Andros on an
  excess-damage trigger
  (`neededCards-features.md`, "Open: the card backlog"; the cheap recurring blockers are in
  `docs/card-blockers.md`, "Open leads"). The recheck list of cards whose recorded needs have
  all been built is `cards:needs -- --stale` (High Score, Winding Constrictor, Pir, Solid
  Ground and Doc Samson after the additive counters each need more).
- **Need-key audit, after the set walk's first pass** (the user's call, 2026-10-21): sort every
  need key the blocked records use into "already expressible" (an authoring agent missed a
  shape — author the card), "a small extension of an existing effect" (an option, a field or an
  `-all` form — e.g. `effect:return-commanders-to-command-zone` is `put-in-command-zone` in an
  `-all` form, Mass Diminish's `animate-all` lacks only `controlledByTarget`, Vengeful Warchief's
  `loses-life` lacks only the `firstTimeEachTurn` `gains-life` has), and "a real feature"; merge
  near-duplicate keys (B121 proposed `replacement:dies-exile-with-counter` beside the existing
  `replacement:die-exile-with-counter`). `cards:needs -- --stale` finds only needs later built,
  not ones keyed wrong from the start.
- **Cards banned in Commander for power: 16 left, each blocked** (`B52.json`). Balance, Channel,
  Emrakul, the Aeons Torn, Erayo, Fastbond, Flash, Hullbreacher, Iona, Leovold, Limited
  Resources, Nadu, Sundering Titan, Sylvan Primordial, Time Vault, Trade Secrets and Yawgmoth's
  Bargain each wait on a feature of their own (`docs/card-blockers.md`).
- **Cards manifest and cloak may have unblocked** — recheck each: `docs/card-blockers.md`,
  "Open leads".
- **A creature blocking more than one attacker** (measured 2026-10-21, the oldest-first walk):
  banding and "bands with other" (rule 702.22h: a blocker of one band member blocks them all —
  21 Commander-legal cards, 14 triaged so far) and "can block an additional creature" / "any
  number of creatures" (509.1a; 38 cards — `static:block-additional-creature`) both need it, but
  `GameObject.blocking` is one attacker. A core combat change — block declaration, damage
  assignment by the other player (702.22j-k), removal from combat, the client's block bar, the
  bots' combat sim — so it wants a design pass and the user's go-ahead before it's built.
- **Features with a family of cards behind them**, each detailed where it points:
  the rest of "enters tapped and attacking" (`docs/card-blockers.md`); modal
  activated abilities with targeted modes, host triggers (28 cards), the EDH-popularity tiers
  (Discover, Reconfigure) and the limitation ledger (`neededCards-features.md`); the
  Incarnations' evoke by exiling a card, and the labelled abilities (Case, Forecast, Max speed)
  (`docs/card-blockers.md`, "Open leads").
- **More Oracle-parser templates.** The unread lines that recur most are the next templates
  ("Choose one —" on an ability, "You may pay {…}", "Put the rest on the bottom … in a random
  order", kicker's "if it was kicked"): `npm run card:scaffold -w engine -- --report --all` for
  today's figures; keep `npm run card:parse-check -w engine` at zero disagreements. **After a
  template lands, run `card:scaffold -- --auto-scan --all` and review what it finishes** — a
  template matches sentences, not meaning, so each new card is read against its Oracle text.

## Engine rules gaps

- **Token events a `may` replacement doesn't reach (Moonlit Meditation)** — amass, incubate, encore, myriad and populate make tokens without offering a `becomes` (`docs/engine-gaps.md`). (2026-11-09: amass, incubate, populate and encore fixed; myriad, amass with `who` and other direct `createTokens` callers are left.)

One line each; the detail (rule numbers, code sites, the cards each blocks) is in
**`docs/engine-gaps.md`**, under the same bold title. When a gap closes, delete its detail
there and move this line to `COMPLETED.md`.

- **B294's small gaps** (2026-11-09) — `notThisWay` has no player scope (Deadly Brew; Rise of the Witch-king blocked); `amounts` conditions and dynamic filter operands aren't read in static or cost contexts (Hagra Mauling, Thryx, Ensnaring Bridge, Lavinia); three more the agents reported, unverified.- **"Each player may" acts on each answer before asking the next** (rule 101.4; the tempting offers and Kwain). (2026-11-09: tokens and counters fixed; `modal` effects and `options` are left.)
- **A shuffled face-down pile keeps its object ids** (Become Anonymous, Expose the Culprit: a client reading the wire can tell which face-down card is which; needs a design call).
- **A self-replacement beside an exile: no 616.1 choice** (Gravebane Zombie's and Blightsteel's own "instead" always beat Rest in Peace or a finality counter).

- **A player can't play another player's face-down exiled card blind** (rule 406.3a; blocks Urianger Augurelt, Lobelia).
- **A token with riot is never asked** (it takes haste; blocks Spider-Punk's Spider tokens). (2026-11-09: token copies are asked; named tokens would have to go through `enterTokenCopies`. Only Spider-Punk needs it.)
- **Mulligans are declared at once, and two opening-hand rules are loose** — rule 103.5 has turn-order declarations but `beginMulligans` asks in parallel (a design call); `COMMANDER_RULES` gives the free mulligan at two players, while 103.5c names multiplayer and Brawl; a revealed opening-hand card isn't kept revealed until the first turn (103.6b). (2026-11-09: 103.5c and 103.6b settled; only turn-order declarations are left.)
- **Limited-duration control of a player** — rule 723.2's Word of Command and Opposition Agent; `player-control.ts` holds a next turn or a next combat only.
- **A targeting restriction can't last a turn, or require a target**: `hexproofFrom`'s qualifiers are statics only; Display of Dominance's "… this turn" over permanents you control, Lurker's "unless it attacked or blocked this turn" and the Flagbearers' "must choose at least one Flagbearer" (601.2c) need more (`docs/engine-gaps.md`). (2026-11-09: only the Flagbearers' "at least one if able" over a whole target set is left, and it needs a client change.)
- **A merged or melded permanent's cards go into a library or graveyard in an order nobody chose**: rule 730.3a and the meld ruling let the owner order them; and only a blink and the exile links find every card it became as "that card" (730.3c, `leftWith`, built 2026-10-31 with meld).
- **Simultaneous as-enters removals of every counter**: two Thieves of Blood at once — the player should choose which gets them (`docs/engine-gaps.md`).
- **Face-down leftovers**: Illusionary Mask, Ugin, the Ineffable, Kozilek, the Broken Reality, Ixidron, Vesuvan Shapeshifter and others, each needing its own face-down link or choice (`docs/engine-gaps.md`).
- **`put-onto-battlefield` follows a target that changed zones during the resolution** (400.7): Celestial Gatekeeper's "exile it, then return target …" returns itself from exile (`bug:moved-target-card-still-acted-on`, batches 219 and 235). (2026-11-09: moved under another name is fixed; a target moved by a mass effect and then named by its slot is left.)
- **Splice's limits** (702.47): only onto a spell with one plain `effect` (not modal, fused, divided or `resolve`), not with overload, at most four splice cards a cast, and a mana splice cost only. (2026-11-09: onto modal, fused and overloaded spells landed; a spliced card with targets onto a modal spell, divided and `resolve` spells, the four-card cap and 702.47b's order are left.)
- **Blitz, dash, sneak, web-slinging and More Than Meets the Eye are offered only from the hand and the command zone** (702.152a, 702.109a, 702.190a, 702.188a, 702.162a).
- **Not modeled**: banding, Companion, word-replacing text change (612.2).
- **Replacement order is chosen for the affected player, never asked** (616.1): among them two opponents' Crafty Cutpurses on one token (first in turn order), and the Words cycle's next draw before a Notion Thief or a draw multiplier. (2026-11-09: the `replacement-order` decision asks for damage, combat, destroy, and the `add-counter`, `counters-divided` and `gain-life` effects; entering counters, costs, lifelink, player counters, connive, proliferate and events that can't wait still take the best order.)
- **"Each player may" with a choice inside it** (101.4): a search is done before the next player is asked (Tempt with Discovery, Innocent Traveler).
- **The rest of leaving the game** (800.4g–h): a choice asked of a player who has left is skipped, not handed to another player.

Latent: the engine departs from the rules here, but no pool card reaches it yet. Fix each
when a card that needs it is authored.

- **"A Zombie … dies" is read as a Zombie creature**: rule 700.4's "dies" takes any permanent, so a noncreature Kindred permanent with that subtype is missed. The parser and the 42 pool cards agree on `type: "creature"`, so a fix changes them together.

## Bots

`docs/plans/bot-effect-knowledge.md` is the plan of record. What's open is tuning: the items
below, and the ones waiting on a live game to show a problem, listed in that plan's "Watching
live games for" (wraths since `threat`, pumping an opponent's attacker, the `"acting"` rollout,
big boards and deep stacks under count budgets, deck biases, 1/1 tokens since `smallTokens`,
Shiko or the other spell, and haste enablers in the crackback).

- **Sylvan Library's bots** (probed 2026-11-04): v2, with Lightning Bolt, Craw Wurm and Sol Ring on top, declines "draw two additional
  cards?" at every life total tried, 10 to 1000, though it pays for a land draw at 40 or more; v1 draws but never pays 4 life, even at 1000. Why not yet looked into.
- **A bot answers "as this enters, choose odd or even" with the first option** (Ashling's Prerogative, Gollum): `decisions/choose-creature-type.ts`'s candidates skip as-enters menus, so it's legal but unaimed.
- **v1's `chooseFromZone` returns its minimum** (`controller.ts`), so that controller exiles nothing for Sutured Ghoul, which dies; not checked how v2 answers.
- **A bot sacrifices at most down to three of a kind for an attack cost** (`SACRIFICE_KEEPS` in `combat/attacking.ts`): a heuristic, not measured.
- **91 targeted slots have no polarity rating** (of 12,164, 2026-11-02; `target-polarity.test.ts`' ratchet prints them): some only read their target (Biomantic Mastery), some are Roles on a slot whose spec already picks the side (Betroth the Beast), and some look like real misses ("target player draws, then discards", Cephalid Looter; `as-player`'s and `for-each-player`'s player, Wheel and Deal, Muse Vessel). A bot reads an unrated slot as `either`.

- **A bot controlling another player only passes** (2026-11-01) — `eval-bot.ts`'s stand-in makes that player's forced decisions one step ahead and casts nothing, so a bot's Mindslaver turn is legal but timid.
- **One v2 simulation can take 3-9 s on a huge board, past any decision budget** (2026-11-09) — real bracket 4 decks (`docs/plans/strong-bot-decks.md`, on the local `strong-decks-pilot` branch) reached 50-270 permanents (discover chains, 1,097 legal actions), and decisions ran 40-80 such simulations: 240-475 s unbudgeted. The live 1 s budget stops a search between simulations, not inside one, and the two baselines always run, so a live room could wait 10-20 s on one bot decision. No engine hot spot stood out in a profile (characteristics, triggers and SBAs, spread out); the cost is how much a rollout plays.
- **Bots never band, and price a band's blocker as blocking one creature** (2026-10-28, B247): a bot's attack never sets `AttackerDeclaration.band`, and `bot/combat-math.ts` judges a block as one blocker on one attacker, though a blocker of a band blocks all of it and takes all their damage (rule 702.22h). Dividing damage under banding is right already (`opposedAssignment`).
- **Play with the bots' simulation budget** (the user, 2026-10-13): v2 stops on whichever comes first,
  a count (`maxSimulations`, default 200 a decision; 12 rollouts for a non-priority decision) or the
  room's wall clock (300 ms). The clock makes strength depend on the CPU — the live box ran a searched
  decision in 152 ms typical against 37 ms on the dev PC — and matters again for solo games in the
  browser (`docs/plans/local-rooms.md` step 6). Try count-only budgets of a few sizes against the clock:
  strength (`bot:ab`), decision time p50/p99 on the box and the user's low-end laptop, and stalls
  (`npm run load-test -w server`).
- **The follow-up search's next steps** (`followUps` in `engine/src/bot/eval-bot.ts`; what it does
  is in `COMPLETED.md`): A/B the capped version (`FOLLOW_UP_SIMULATIONS` = 24), replay the chosen
  follow-up at the next window instead of searching again, and retire the shortcuts it makes
  redundant (`reducerFirst`, `hideawayFirst`, untap plans) one at a time against the gate. The v3
  record (`docs/plans/bot-v3-search.md`) is why it stays within our own turn.
- **The autopsies' open bot items** (`docs/plans/deck-autopsies.md`, "Left"): token payoffs
  beyond engines (sacrifice outlets, leaves-the-battlefield); premium removal fired at weak
  targets past the first two rounds. Probed 2026-11-09: Yawgmoth, Priest of Forgotten Gods, a
  one-sacrifice Blood Artist kill and Deadly Dispute in response to removal are right; Dispute
  and Village Rites on a spare creature now are (`isSpareFodder`). **Left: a kill that takes
  several sacrifices** — every opponent at 2 with Viscera Seer, Blood Artist and two tokens, both
  bots pass: one drain kills nobody, and nothing aims a second trigger where the first went.
- **Explore aiming bot removal by EDHREC rank or salt score** (the user, 2026-11-06): a bot picks
  removal targets by simulated board value alone; try weighting the pick by how played or how hated
  a card is (`cards/edhrec-rank.ts` has the rank, `cards/salt-score.ts` the salt score since
  2026-11-06). **Salt started 2026-11-09, unfinished**, on the local `strong-decks-pilot` branch
  only (not main: the 650 KB salt table would ship in the browser's bot bundle): a `salt` evaluation
  term (`bot/features.ts`, each nontoken permanent's salt score; weight 0). In built positions
  weight 1 tips close calls (Disenchant takes Rhystic Study over passing), 4 overrides board value
  (Vindicate takes Smothering Tithe over a Craw Wurm). The bench decks hold almost no salty cards
  (Sol Ring alone), so it's measured on the real decks: `BENCH_POOL=strong npm run bot:ab -w engine
  -- --budget 1000` (both flags new on the branch). Weight 3 against main, stopped at 55 of 400
  games: 24.1%, even, too few to say. Left: finish that A/B (about 4.5 h at 8 workers; each worker
  holds two builds, and one game hit the 768 MB heap cap), then weigh shipping against the bundle
  (a table of only the cards above about 0.5 salt would be small). EDHREC rank untried.
- **Deeper lookahead** (the user, 2026-10-18): let the bot look further ahead, a clock off, to see
  whether it finds smarter lines. The yardstick is `bot/benchmarks.ts` (`npm run bot:benchmarks -w
  engine`): seventeen hard positions played out over whole turns and judged on the outcome — goals,
  not a gate. Reading on 2026-10-18: v2 7/17, v1 7/17, `--rollout acting` 9/17; 5,000 simulations a
  decision solve no more than the default, so the limit is how far a rollout plays, not the budget.
  Built since (`--horizon round|next-turn`, `docs/architecture/engine.md` "Deep horizons"): `round`
  10/17, `next-turn` 14/17 — every combat, opponent's-turn and next-turn benchmark, the commander
  reanimations included — while passing 168 and 164 of the 178 hand-built gate scenarios v2
  passes. Left: the three "sequence" benchmarks (several moves in our own turn, which only
  `--rollout acting` solves), the ten-odd gate scenarios each horizon fails, and whether it plays
  better at all. First bench (8 four-player games, `next-turn` against three shipped v2s): 1-6 with
  one 30-minute timeout, 14% [3, 51] — no signal — at 875 ms a decision on average and 208 s at
  worst, so it needs to be made cheaper (small boards only, or only where holding mana up is in
  question) before a bench big enough to say anything.
  **Turn planning** (the user's steer: sequence our own turns, opponents barely figuring; only
  where it could change the answer — `--plan turn|next-turn`, `bot/turn-plan.ts`): `turn` 9/17
  (Rituals into Grave Titan, Act of Treason then the sacrifice), `next-turn` 10/17 (the two Bolts
  too); hand-built gate 178 and 173 of 180, `turn`'s two misses better plays the judge can't see (it attacks
  with the token before Skullclamping or Disputing it). Same seeds, 47 four-player games against
  shipped v2s: plain 25.5% [15, 40], `turn` 34.0% [22, 48], decisions no slower (105 ms average).
  `turn` is now v2's default (`COMPLETED.md`), level in strength head to head (24.9% [21.3,
  28.5], 546 games): the sequencing it fixes is too rare to move a win rate. Left here: the "sequence" benchmark it misses (Opt,
  which needs the draw known), `next-turn` (its passive opponents make held answers look idle), and
  the opponents'-turn benchmarks, which only the (unseated) deep horizons solve.
- **A decision overruns its second, what's left** (2026-10-18; the rest is in `COMPLETED.md`): 29
  of 36,466 decisions in 16 four-player self-play games at the live 1 s still ran past it, the
  slowest 1.6 s, each on a 55–90-permanent board, in three ways the clock can't cut short: one
  rollout that alone takes 0.6–1.3 s (only a rollout that could stop part-way, in `simulate.ts`,
  bounds it); a priority search's second baseline, v1's move, which only the deadline itself
  stops by design (`outOfTime`), with its tie-break against passing (two passive rollouts,
  `scoreAlone`); and v1's own land pick, up to 1.1 s with Ramunap Excavator offering 26 graveyard
  lands, each look ~90 ms (`lookAfterPlay`). Each overrun holds every other room on its shard as
  long (`docs/plans/room-shards.md`, "The one-second budget").
- **Bots and token stacks: divided damage and gang blocks** (the user, 2026-10-18). Neither bot
  ever sets a cast's `division`, so divided damage always splits evenly over distinct targets (v1
  aims a group at one target; v2's `targetCombos` spreads over 1, 2, 3 distinct ones) — Inferno
  Titan never goes 1 + 1 + 1 at three 1/1s, which the engine refuses anyway while a stack can't
  fill two slots of one target group ("Distinct targets in one token stack", Engine rules gaps).
  And neither gang-blocks with two tokens of one stack, which the engine allows (`count`): v1 keys
  blocks by blocker id at `count: 1`, v2's block climb drops a blocker once used.
- **More training scenarios.** 120 hand-built scenarios, all of them gating
  (`bot/scenarios.ts`). Not yet covered: mulligans (`mulligan-policy.test.ts`). More come from
  live games: the in-game Capture button (`--capture`) saves a position to `captures/`, which
  `bot:scenarios` and `bot:fit-scenarios` read as training scenarios, as does each blunder
  `bot:behaviour` shows. `npm run bot:captures -w engine` lists them with v2's answer today;
  once one is fixed, `-- resolve` moves it to `captures/resolved/`, where it gates.
- **A wider pool of bot decks (later — raised 2026-09-26).** `SAMPLE_DECKS` (fourteen precons,
  `docs/plans/precon-decks.md`) and the five upgraded TDC precons (`UPGRADED_DECKS`,
  `docs/plans/upgraded-decks.md`). Still unscoped: more power levels, and upgrades of the
  other nine.
- **Sultai Arisen and Jeskai Striker (Upgraded) didn't measure stronger than their precons**
  (16.7% and 8.3% against 20.8% and 14.6%, 48 games each, within noise; Temur Roar's upgrade
  went 35% to 69%). More rounds, autopsies of their losses for cards the bots misuse, and
  revised swaps: `docs/plans/upgraded-decks.md`, "Open".
- **`crackbackGrowth` is unbenched since its last change** (2026-10-05, merged to main on the user's call with the tests, scenario gate and a 20-game fuzzer pass clean): the scaled crackback check now applies only while holding back passes it. Still to do: rerun the paired `bot:crackback` (0.5 against `--weights '{"crackbackGrowth":0}'`, 120+ seeds) to confirm the 25 swings into a plainly lethal board are gone and the 3.5% → 2.0% holds, re-bench against main, and add a training scenario (`docs/plans/smarter-bots.md`, "Combat: the alpha strike and crackback").

## Client / UI

One line each; the detail is in **`docs/client-gaps.md`**, under the same bold title, and the
animation follow-ups in `docs/plans/legibility-of-play.md`, "Follow-ups". When an item lands,
delete its detail there and move this line to `COMPLETED.md`.

- **X is picked before targets, blind to a target's cost reduction** (a cast with Spellwild Ouphe's reduction can be refused after the player picks X).
- **A resolved copy's and a crime's log lines name an object id** ("obj-168"; "commits a crime with obj-88"), and a closed look says "takes nothing".
- **A countered ability's log line names its object id** ("obj-87 is countered").

- **A target group's prompt doesn't pluralise its noun** ("choose 3 creature", "any number of creature you control").

- **The die rolling animation needs adjusting** — with the loss of gradients, the vertical bounces look like the shape is just growing and shrinking (`client/src/App.css`'s `die-land`).

- **Which seat you see while controlling another player** (the user's call, after playing it) — today the table flips to the controlled player's seat; the other option is to stay in your own seat with a clear marker.
- **Too many priority stops with a land like Bountiful Landscape** (a design call) — a non-mana ability on the battlefield stopped the game about 40 times in one four-player round, and Auto-pass pauses on each opposing spell.
- **Blitz is the last thing on the landing page** — the site's main feature sits under the navigation, in the same yellow as "Create a game", with its paste form's button just below the fold at 768px.
- **Blitz starts an incomplete deck without a word** — a 4-card list went straight into a game with an empty library.
- **The lobby doesn't show that Ready is the next step** — Start Game is disabled until you press it, and it doesn't look like the thing to press.
- **Library search only matches exact phrases** — "atraxa praetors" and "flying dragon" find nothing, and the message says to try a shorter search.
- **The library can't sort by release date** — the user wants it as a sort option beside EDHREC, name, mana, color and type.
- **The history log names a hidden draw once the card is public** — "Silumgar draws Swamp" after the Swamp is played: `publicNameAt` is right, and its fallback to the current name isn't.
- **The history log's layout** — a full-screen popup you can't read beside the board, event numbers on every line, and the phase banner draws over it.
- **The hand's rules text is tiny at rest** — 8.5-9.5px and tilted at 1366×768, readable only on hover.
- **The stack's card hides a seat's board** — at 1366×768 it covers the fourth player's board while you decide whether to respond.
- **The Cycle popup is easy to miss and ignores Escape** — a small button under the hover card; Settings closes on Escape and this doesn't.
- **The pass buttons don't explain themselves** — only Auto-pass has a tooltip; "Pass (space)" and "Pass Turn" are left to guess.
- **A hover card's reminder can name a keyword the card lacks** — Dragonmaster Outcast shows a Flying reminder, from the token its text makes.
- **Deck builder rough edges** — long deck titles cut off, the hover preview covers the search box, the search box's count ignores the colour filter, re-importing makes a second deck of the same name, "1 issue(s)".
- **The game's top bar and labels stay small at 2560×1440** — judged by eye; measure before changing.
- **A cast copy logs as "a card"** — "a card resolves", "commits a crime with a card": the raw id is gone, the copy's name still isn't there; `format.ts`.
- **Two log lines read wrong** — a card beginning on the battlefield from an opening hand logs as "takes Leyline Axe", and `delayed-trigger-created` prints raw JSON (`format.ts` ~591).
- **Clear can't undo an attacker that already has a target** — at any table size: Clear only empties `attackPicks`, so once a creature is in `attackAssignments` it stays disabled and each attacker has to be clicked off.
- **The discard prompt says "any number" under a cap** — `App.tsx` (~6015) words an `atMost` discard as "any number of cards"; the cap itself is enforced (Jaya Ballard's +1).
- **The combat prompts' cost lines miss the per-creature taxes** — the attack line ignores `attackTax.perAttacker` and blocks show no cost; the engine refuses what can't be paid.
- **The tap-cost prompt doesn't check a shared creature type** — Confirm enables on count alone; `creatureTypes` is on the offer, and the engine refuses a pair that doesn't share one.
- **The attack and block Confirm doesn't check company restrictions** — a lone Mogg Flunkies is refused with a toast, and so is one attacker too many under Silent Arbiter or Crawlspace; `attackCompanyViolations`/`blockCompanyViolations` and `combat/limits.ts` are there for the client to read.
- **The X prompt and shown cost ignore a target's tax** — `App.tsx` doesn't read `xCost.targetTaxes`/`maxXUnreduced`, so a taxed target at too high an X is refused rather than never offered, and the shown cost omits the tax.
- **A hand card's types show as printed under a static outside the battlefield** — `view.ts` under `typesOutsideBattlefield` (Conspiracy, Arcane Adaptation); the filters read the new types.
- **A lands-only prohibition writes no log line** — `format.ts`'s `prohibition-imposed` names only spells and abilities, so Turf Wound's "can't play lands this turn" emits none (found 2026-11-01).
- **A human's target picks aren't narrowed by the new target relations** — `viewTargetFacts` lacks `shareTypes`, `toughnessOf`, `nameOf` and `attachedTo`, so a broken pair is refused only when sent (found 2026-10-31).
- **Cultivate's split prompt doesn't say which find goes where** — "Choose up to 2 cards"; `search-library.instead` with `pick: "one"` would ask properly (found 2026-10-31).
- **A processor's move from exile reads as "takes"** — the log says "Alice takes Hill Giant" when a processor puts an opponent's exiled card into its owner's graveyard (found 2026-10-31).
- **Playback stalls when your cast triggers your own targeted ability** — the cast showcase never ends and the target prompt never shows (found 2026-10-30 by `run-check`; Briarknit Kami, Ichormoon Gauntlet).
- **What the scenario builder can't say yet** — stolen, transformed or face-down cards (manifested ones), turn-long effects, the stack.
- **The initiative and the venture marker have no animation** — the 🗝️ chip changes hands and the dungeon marker moves with no cue (`docs/plans/initiative-dungeons.md` §6). Also: the builder's scenario can't hold the initiative or a dungeon position.
- **A soulbond pairing isn't drawn on the board** — the view carries `pairedWith` (2026-10-26); only the keywords it grants show.
- **Quality-of-life room options (house rules)**, opt-in per room.
- **Server-side deck save and share** (decks live in `localStorage`).
- **The library and the deck builder load every card definition** (~6.3 MB at 12,089 definitions); the user's first-visit stall was two of the 32 shard requests never answering (the bar at 94%, 2026-10-14); such a shard is now asked for again, but why a request hangs is not known.
- **"Same for all" covers only a trigger's yes-or-no "you may".**
- **The game page's own rendering on a slow laptop** (2026-10-13/14): a 250-400 ms hitch when a frame's board lands on a ~50-permanent board (`Table` remounting, forced layout in `usePlayback`'s `show`); measurements and next steps in `docs/client-gaps.md`.
- **A wordy card's rules text is illegible in the hand** (the user, 2026-10-15): the hovered hand card shrinks long text until it can't be read (The Dawning Archaic); no fix in mind yet.
- **Split cards look like double-faced cards in the library** (the user, 2026-10-28): the library page (`client/src/library/LibraryPage.tsx`) presents a split card as an MDFC.
- **Blitzing a deck immediately saves it to your locally stored list of decks** (the user, 2026-11-02): it shouldn't; explore offering to save the deck after the game instead.
- **No way to ask the card replacer for one card while building a deck** (the user, 2026-11-02): right-clicking a card in the deck builder should offer a "suggest replacement" button, so players can use the automatic card replacer to modify their deck.
- **Animation follow-ups** (re-measure bot speeds, static buffs, library put-backs, the exile filter, the crown's flight, merged tokens, folding tokens with counters, dies-trigger pulses, history highlights, real sounds): `docs/plans/legibility-of-play.md`, "Follow-ups".

## Tooling / docs

- **Confirm the box's room cap of 6 with a load test there** (2026-10-18): `MAX_ROOMS_PER_SHARD`
  went from 8 to 6 on the dev PC's measurement of the bots' one-second budget
  (`docs/plans/room-shards.md`, "The one-second budget"); run `npm run load-test -w server` on the
  box with nobody playing, as `DEPLOYMENT.md` describes, and adjust from its knee.
- **An on-screen progress bar for the long checks** (the user, 2026-10-06): use Claude Code's new mods feature (a plugin's live pane or status line — the `plugin-authoring` skill) to show progress for the runs we do regularly: the engine suite, `bot:scenarios`, `bot:diff`, `bot:ab`, the fuzzer and the Playwright suites.
- **The test harness's `destroy()` leaves an Aura on a dead creature** (found 2026-10-26, batch
  208): it applies the destroy and settles, but with nothing else pending no state-based actions
  run, so an Aura stays attached to a creature already in the graveyard (Chime of Night's test
  destroys the Aura itself instead). Have `destroy()` check state-based actions after it.
- **Refresh the snapshots.** The EDHREC ranking snapshots (`top-commander-cards.txt`,
  `top-commanders.txt`) and `edhrec-rank.ts` are frozen. Re-fetching them moves the roster, so
  do it on purpose.
- **Keyword-action citations on an older numbering** (found 2026-10-13, fixing 701.19b): section
  701 was renumbered in a later edition and many comments still cite the old numbers —
  regeneration as 701.15 (Goad now; regenerate is 701.19), reveal as 701.16 (Investigate; reveal
  is 701.20), transform as 701.28 (Convert; 701.27), proliferate as 701.27, counter as 701.5
  (Cast; 701.6), discard as 701.8 (Destroy; 701.9), fight as 701.12, scry/surveil, amass, populate,
  manifest's turn face up. A heuristic audit (each `701.N` against its heading's keyword) flags
  164 lines across `game.ts`, `state.ts`, tests and cards, some false hits. Sweep it against
  `docs/rules/`, and check 702 the same way.

## Code health

- **Playwright can't run in parallel yet**: 4 workers took 7.2 minutes against 18, with 19 failures, mostly different tests from run to run (2026-11-04). It needs a dev-rooms server per worker, no room shared between spec files (FOURP, TWOAA and CASTN are), and the frame-timed specs kept serial.
- **Blank target slots don't survive JSON** (found 2026-10-31 by the situation fuzzer, ~1
  scenario in 100): a blank target slot is `undefined` by design (`ResolvedTargets`, in
  `GameObject.targets`, `SpellSnapshot.targets` — `lastOnStack` — and delayed and pending
  triggers), and the engine tests for one with `=== undefined` in at least 16 places. JSON writes
  `undefined` in an array as `null`, so a state restored from JSON — a bot capture, a saved local
  game (`server/src/local-host.ts`) — reads a blank slot as chosen: `recheckTargets` (`game.ts`
  ~25157) skips a slot only when `chosen[i] === undefined`, so a spell on the stack with a declined
  "up to one" slot sends `null` to `isLegalTarget` as it resolves, and the `target-chosen`
  condition (~25435) answers yes. Fix by making holes `null` throughout (and the reads `== null`),
  or by reviving them in `Game.fromSnapshot`; then make a hole a failure again in
  `engine/scripts/situation-scenario.mjs`'s `plainProblem`, which reports them apart for now.
- **Solo games in the player's browser: bug reports** (the user, 2026-10-13;
  `docs/plans/local-rooms.md`, built steps in `COMPLETED.md`): bug-report uploads from a local
  game (only a `--capture` dev server has the panel).
- **More rooms at once, and a bigger box that pays** (the user, 2026-10-13): planned in
  `docs/plans/scaling-rooms.md` — everything runs on one Node thread today, so a bigger box adds
  little until rooms are spread across cores. Next: phase 0, measure (a load harness, event-loop
  delay on `/status`, a profile).
- **Drop the saved-deck migrations** (from about 2027). Since 2026-10-09 `client/src/deck-builder/decks.ts`
  writes a deck it migrated back on its first read (a lone `commander`, a flavor name); once old
  decks have had time to be read, `fromStorage`'s rewrites can go.
- **Two pool audits a batch 199 agent raised** (unverified): a `becomes-target` trigger whose first
  slot can hold a player is filled with the targeting spell's controller unless it sets
  `targeterNotTarget: true` (`game.ts` ~18984) — sweep the pool for any-target slots that aren't
  "that player" (Livewire Lash needed the flag); and emblem statics apply only in the
  `creatures-you-control` scope (`characteristics.ts` ~3220), so Nissa, Who Shakes the World's
  lands emblem may never apply — check it with a test.
- **Vocabulary built ahead of any card.** Effect, trigger, condition, filter and replacement
  pieces, plus optional fields, built before any card used them. Keep them for the cards they
  were built for, but review the first card that uses each. The list is in
  `neededCards-features.md`, "Built ahead", recounted 2026-10-09: about 11 pieces and 14
  optional fields remain. `painIfUntapped` is the one no real card can use.
- **A 4-player fuzzer game runs past 240 turns on lands alone** (2026-10-26, batch 180's `verify --fuzz-new`, seed 6 of the new-cards fuzzer's first half): timed out at turn 245 in an upkeep with one thing on the stack and 122 permanents, most of them basic lands (22 Islands, 18 Mountains, 17 Plains) — random play that never closes the game out, not a hang and no batch-180 card in the picture. It recurred in batch 196's post-merge `verify --only fuzzwith` (seed 20: turn 220, an upkeep with two on the stack, 91 permanents, 17 Plains, 16 Swamps, 14 Mountains — again no card of the batch in the picture; and in batch 194's `verify --fuzz-new`, seed 38: turn 259, five on the stack, 123 permanents), so it's worth a look now: `npm run play:random -w engine -- --players 4 --seed 6` (or `--seed 20`) with the batch's cards forced in; again in batch 249's `verify --fuzz-new` second half, seeds 25 (turn 137, 74 permanents, 14 Swamps) and 39 (turn 103, 76 permanents, 15 Islands), at a 120 s limit — likely the random controllers never attacking into a stalled board, which a turn ceiling in the fuzzer would settle. At 2 players too: batch 208's full verify, the plain fuzzer's seed 56 timed out at turn 144 in a draw step, nothing on the stack, 63 permanents (19 Islands, 18 Forests, 7 Plains). Again in batch 220's full verify: the plain four-player fuzzer's seed 17, turn 258 in an upkeep, nothing on the stack, 119 permanents (28 Swamps, 21 Plains, 15 Islands) — so that full run wasn't recorded in `scripts/verify-state.json`. And in batch 227's `verify --fuzz-new` (four players, under five agents' load): seed 16 at turn 120 and seed 38 at turn 191, both in an upkeep with one or two on the stack, boards mostly Plains, Swamps and Islands, no card of the batch among the most repeated. Its landing check's re-run (with batches 226, 228 and 229 merged in) timed out on seed 16 again, at turn 269 in end of combat, nothing on the stack, 58 permanents (14 Islands, 11 Mountains, 9 Plains). Batch 224's landing check (batches 225–229 merged in) timed out on seed 16 once more: turn 216 in an upkeep, two on the stack, 107 permanents (18 Plains, 17 Swamps, 14 Islands), no card of the batch among the most repeated. Batch 243's full verify: the plain two-player fuzzer's seed 46 timed out at 60 s, at turn 60 in a postcombat main with nothing on the stack and 32 permanents (9 Swamps, 5 Mountains, 4 Plains). Run alone it finishes at turn 70 in 58 s (34,736 events) with no batch-243 card in the game, so it was a long game on a loaded machine; that full run wasn't recorded in `scripts/verify-state.json`. Batch 242's full verify: the plain four-player fuzzer's seed 27 at turn 196 in a draw step, one on the stack, 91 permanents (22 Plains, 19 Mountains, 14 Swamps) — so that full run wasn't recorded in `scripts/verify-state.json` either.
- **Phoenix Fleet Airship doubles without end under random play** (2026-10-26, batch 174's `npm run verify`): its end-step "create a token that's a copy of this Vehicle" copies every Airship, so a random controller who sacrifices something each turn (Miren, the Moaning Well) runs the fleet to 161 by turn 109, with 160 copy triggers on the stack each end step and a crew activation per Airship; the new-cards fuzzer's four-player seed 24 (that batch's forced decks) times out past 600 s. The card is right; the fuzzer needs a ceiling (a token-count cap per seat, or `Game.MAX_EFFECT_INSTANCES` counting copies across triggers), or the copy trigger a cheaper path.
- **Prohibition scans are quadratic.** `abilitiesProhibited`/`prohibitionsOn` rescan the whole
  battlefield on every call, per permanent, and `recomputeControl` rescans for control Auras per
  permanent once anything has a control effect. On a land-heavy board they were 31% of a
  profile, and turns slow down steadily. Not a hang, but the fuzzer now meets it: four-player
  seed 27 (as the pool stood on 2026-09-29) is a 182-turn game of land-heavy boards that ends
  in deck-outs and takes ~32 s, past the local 30 s default (CI's four-player pass allows
  120 s), with `abilitiesProhibited`/`prohibitionsOn` ~10% of its profile and registry lookups
  another 10%. Four-player seed 10 (2026-09-30) is another: 176 turns, ~31 s. The bots' big
  boards are the same cost seen from the search (`bot-effect-knowledge.md`, "Watching live
  games for").
