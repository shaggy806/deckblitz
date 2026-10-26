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

- **`client/e2e/put-down.spec.ts` was flaky** (2026-10-24): not the test — a card landing froze
  short of its tile or the stack for 100–250 ms on a 4-player board. Timers ran out a frame or more
  before the flights they timed (a flight starts on a later frame), so the frame's end, and with it
  the next frame's whole-`Table` remount, and `aims.landed`'s `Table` re-render, ran ahead of the
  landing frame. A half now ends once its flights are down and that frame is painted
  (`usePlayback`'s `endWhenDrawn`, the bus's `addLanding`/`landingsDone`), and a stack landing
  notifies the same way (`afterLanding`).
