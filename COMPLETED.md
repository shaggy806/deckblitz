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
