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

None open.

## Commander gap (the current priority)

**429 of the 500 most-played commanders are implemented** (`top-commanders.txt`; re-mark with
`npm run cmdrs:mark -w engine`). An imported decklist usually has its commander substituted, and
that one card is the reason the deck exists. Live numbers for everything below come from
`npm run cmdrs:gaps -w engine`.

- **Ready to author, no engine work: none.** Jasmine Boreal of the Seven was listed as ready,
  but her real blocker is the mana-restriction gap under Engine rules gaps, now recorded in her
  gaps record as `cost:mana-restriction-at-cast`.
- **Build down the greedy order.** `cmdrs:gaps` ranks every missing engine feature over
  `engine/src/cards/top-commanders-gaps.json`. When a feature lands, add its key to that file's
  `built` array and author the commanders it unblocks in the same commit. The next ones,
  engine-only, with the commanders each fully unblocks (+1 each): `replacement:as-transforms`,
  `trigger:bends`, `trigger:you-tap-opponent-creature`, `keyword:bloodthirst`,
  `effect:amount-aggregate`, `effect:repeat-process`, `effect:put-commanders-onto-battlefield`,
  `keyword:freerunning`, `replacement:mana-pool-emptying`, `static:mana-pool-reads`. Lynde, Cheerful
  Tormentor also waits on `effect:curse-attach-player` (a Curse put onto the battlefield
  attached to a player, or moved to an opponent); attaching one to a player is built
  (`attachPermanent` takes a player), but `attachedTo` on a card entering names only a
  permanent so far.
- **Most-needed features overall** (commanders needing each, 2026-10-16 after the backlog pass that
  built parts of the five-commander features — `COMPLETED.md`): `decision:variable-target-count`,
  `decision:choose-permanent`, `replacement:mana-pool-emptying` (4 each), then
  `decision:manual-payment-choices`, `decision:choose-from-zone-extensions` (Winter's "a permanent
  card from among them onto the battlefield with a finality counter"), `zone:visibility-extensions`,
  `effect:attach-extensions` and `effect:divide-among-targets` (3 each). Orvar needs `decision:choose-permanent` and
  `trigger:discards-extensions`. Ulalek needs `cost:colorless-hybrid-mana` and `keyword:devoid`.
- **UI-bound features.** These need a new client decision and a browser check:
  `effect:cast-during-resolution` (what's left after the `cast-now` effect is in its
  `top-commanders-gaps.json` description), `effect:attach-extensions`,
  `cost:sacrifice-multiple`, `decision:choose-permanent`, `decision:variable-target-count` and
  `decision:choose-from-zone-extensions`. Sen Triplets also needs
  `zone:cast-from-opponents-hand` (playing cards from the target's revealed hand), on top of
  the revealed hand itself.

## Card backlog (by EDHREC rank, and the precons)

What blocks each unimplemented card, and which cards a built feature may have unblocked, is in
**`docs/card-blockers.md`** ("Open leads" first, then batch by batch and family by family, over
the per-card JSON records in `engine/data/sweep-2/` and `sweep-3/`). Card lists go there; this
section keeps only what to do next.

- **Or: more cards, in EDHREC rank order** (the `author-top-cards` skill; the priority 2026-10-13
  to 2026-10-14). `npm run cards:needs -w engine -- --next 60` lists the next
  untriaged cards by rank: rank 8207 on (batch 148 took 7949–8197). Batches run 4-5 agents, ~30 cards each, with the
  leading features built alongside in worktrees. The nine other starter precons' 25 stand-ins
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
  two). **Next, Weatherlight** (119 left: one batch, five agents), then Tempest (178). Weatherlight's
  own flash-and-sacrifice cards now scaffold whole; nothing researched for it yet. This walk's range
  ends at Shadowmoor/Eventide (the middle walk owns Shards of Alara on). Leads over the whole pool now:
  banding (36 — needs the multi-blocking line below), cumulative upkeep's unbuilt forms
  (`keyword:cumulative-upkeep` — 15: granted to other permanents, combined costs, mana
  spendable only on it), damage redirection (13), "can't be regenerated this turn"
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
  **next, the rest of Theros** (35 left: one or two agents) — Ordeal of Nylea is authorable now
  (copy `pool/ordeal-of-heliod.ts`, the `sacrifice` trigger's `selfOnly`), and Theros's other
  mechanics are all in the pool (bestow, heroic, monstrosity, devotion); then Gatecrash, Return
  to Ravnica and on down to Scars of Mirrodin (`cards:sets -- --set <code>`), stopping before
  Magic 2011. Batch 167's blockers are one or two each (`B167.json`): "whenever a creature
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
  cloud sessions from 2026-10-25**, each owning a range so none walks another's sets: this
  newest-first walk (Journey into Nyx back to Scars of Mirrodin, stopping before Magic 2011), a **middle walk** (Rise of the Eldrazi back to Shards
  of Alara — ROE, WWK, ZEN, M10, ARB, CON, ALA — newest first, by `cards:sets -- --set <code>`)
  and the oldest-first walk above. Their first batches are B158 (this walk), B159 (middle) and
  B160 (oldest); the second round's are B161 (this walk: Journey into Nyx — landed), B162 (middle: Worldwake — landed) and B163 (oldest: Alliances — landed); the third round's are B164 (this walk: Born of the Gods — landed), B165 (middle: Zendikar — landed) and B166 (oldest: Mirage's first half, its ~110 most-played — landed); the fourth round's (2026-10-26) are B167 (this walk: Commander 2013 and Theros's ~75 most-played — landed), B168 (middle: Magic 2010 and Alara Reborn — landed) and B169 (oldest: the rest of Mirage — landed); the fifth round's (2026-10-26) are B170 (this walk: the rest of Theros and Magic 2014), B171 (middle: Conflux whole and Shards of Alara's ~40 most-played — landed) and B172 (oldest: Visions whole); after those, take the highest `B<N>` on `origin/main` plus one, checked again
  just before landing (rename the record and test files if another walk took it). **The middle walk**: batch 159 took Rise of the Eldrazi whole, building level up and umbra armor (and authoring the umbras and levelers earlier batches had blocked on them); batch 162 Worldwake whole, building multikicker's "for each time it was kicked" as an amount and a static's colour setting (the Zendikons); batch 165 Zendikar whole, no feature built (26 blocked, "blocks this turn if able" — `effect:must-block-this-turn` — leading with two); batch 168 Magic 2010 and Alara Reborn (the rest of each), no feature built (38 blocked, led by the five Borderposts' "return a basic land" alternative cost — `cost:alt-cost-return-lands`, 7 cards with Daze and Gush: worth building if Conflux or Shards adds to it — they added none); batch 171 Conflux whole and Shards of Alara's 40 most-played left, no feature built (29 blocked, the devour count read back — `amount:creatures-devoured`, 4 cards with Marrow Chomper — leading); **next, the rest of Shards of Alara** (54 left, by `cards:sets -- --set ALA`) — the last set of this walk's range, which then ends. Its leftovers: Umbra Mystic and Lion Umbra (the umbra choice, `decision:umbra-armor-choose-aura`; enchant modified) and Venerated Teacher (`filter:has-level-up`). Batch
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

One line each; the detail (rule numbers, code sites, the cards each blocks) is in
**`docs/engine-gaps.md`**, under the same bold title. When a gap closes, delete its detail
there and move this line to `COMPLETED.md`.

- **A source of damage: a waiting effect's object and the command zone** (609.7a) aren't offered.
- **A mana-value cast prohibition reads an X spell before X is chosen** (202.3e): Sanctum Prelate waits on it.
- **"Each player discards" isn't chosen in secret** (101.4): a scoped discard discards each player's cards before the next chooses, where the rulings hide the choices and discard them together — Miasmic Mummy and Neheb, the Worthy run on it; blocks Delirium Skeins, Stronghold Rats and Cunning Lethemancer (`effect:hidden-simultaneous-choices`).
- **`each-player-may` with `choices` drops the controller's own choice**: when the spell's controller is one of the choosers, `"that-player"` in their option resolves to no one (found authoring Truce, batch 160).
- **A target cost reduction two slots can earn is offered unrestricted** (601.2f): `targetReductionOptions` narrows only a lone earning slot, so This Town Ain't Big Enough under a tax it can pay only reduced is offered two non-earning targets and refused at the cast (fuzzer, batch 151's forced decks, seed 19).
- **"Enters untapped" always beats "enters tapped"**: the entering permanent's controller should order the two (rule 616.1) — Archelos, Lagoon Mystic on an opponent's permanent.
- **Umbra armor's Aura is picked, and goes after the other shields** (616.1): with several umbras on one creature, or a regeneration shield or shield counter beside one, its controller should choose; the engine destroys the umbra of least mana value, and only once neither shield applies.
- **A regeneration shield goes before a shield counter** (616.1): with both, the permanent's controller should choose which replaces an effect's destroy; the engine always spends the regeneration shield.
- **Blitz, dash, sneak and web-slinging are offered only from the hand and the command zone** (702.152a, 702.109a, 702.190a, 702.188a).
- **A mana restriction reads the spell before it's cast** (Jasmine Boreal of the Seven waits).
- **Delve and convoke together on an {X} spell** (Chord of Calling under Teval).
- **Not modeled**: banding, Companion, word-replacing text change (612.2).
- **Replacement order is chosen for the affected player, never asked** (616.1).
- **Two opponents' Notion Thieves aren't ordered by the drawing player.**
- **Toxic's last two shapes** (Skrelv, Defector Mite; Skrelv's Hive).
- **"Each player may" with a choice inside it** (101.4): a search is done before the next player is asked (Tempt with Discovery, Innocent Traveler).
- **Static-effect dependency ordering** (613.8) beyond layer 4's type grants.
- **The rest of leaving the game** (800.4g–h): a choice asked of a player who has left is skipped, not handed to another player.
- **A token copy isn't asked its "as this enters" choice.**
- **Proliferate over a token stack** gives every member a counter.
- **Distinct targets in one token stack** can't take two tokens of one stack.

Latent: the engine departs from the rules here, but no pool card reaches it yet. Fix each
when a card that needs it is authored.

- **A mana ability's discard cost is never paid** (605.3b): the mana ability path returns before the discard — Bog Witch waits (`cost:mana-ability-discard`).
- **A token with devour never devours** (702.82a): token creation never calls `askEnterChoice` — Dragon Broodmother waits (`mechanic:token-devour`).
- **Convoke with a target-dependent cost.**
- **A ceased token's last-known information lasts only the turn** (`ceasedTokens`).
- **A double-faced Aura put onto the battlefield transformed is asked what it enchants** (712.14a): `askEnterChoice` reads its front face, so Skin Invasion's back face returns only with something to enchant, unattached; blocks Skin Invasion (`bug:aura-enters-transformed-asks-enchant`).

## Bots

`docs/plans/bot-effect-knowledge.md` is the plan of record. What's open is tuning: the items
below, and the ones waiting on a live game to show a problem, listed in that plan's "Watching
live games for" (wraths since `threat`, pumping an opponent's attacker, the `"acting"` rollout,
big boards and deep stacks under count budgets, deck biases, 1/1 tokens since `smallTokens`,
Shiko or the other spell, and haste enablers in the crackback).

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
  targets past the first two rounds.
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
- **Crackback counts later opponents at half** (2026-10-05, `bot:crackback`): over 198 four-player games, 166 full swings into a board lethal with every opponent all-in passed the bot's check because `crackbackParanoia` weighs all but the next opponent at 0.5, and 17% of them died before the bot's next turn (2.7% when nothing showed lethal). `crackbackGrowth` doesn't touch it; a paranoia that rises as life falls, or as fewer opponents remain to split the attacks, is the lever (`docs/plans/smarter-bots.md`, "Combat: the alpha strike and crackback").

## Client / UI

One line each; the detail is in **`docs/client-gaps.md`**, under the same bold title, and the
animation follow-ups in `docs/plans/legibility-of-play.md`, "Follow-ups". When an item lands,
delete its detail there and move this line to `COMPLETED.md`.

- **What the scenario builder can't say yet** — stolen, transformed or face-down cards (manifested ones), turn-long effects, the stack.
- **The initiative and the venture marker have no animation** — the 🗝️ chip changes hands and the dungeon marker moves with no cue (`docs/plans/initiative-dungeons.md` §6). Also: the builder's scenario can't hold the initiative or a dungeon position.
- **Quality-of-life room options (house rules)**, opt-in per room.
- **Server-side deck save and share** (decks live in `localStorage`).
- **The library and the deck builder load every card definition** (~6.3 MB at 12,089 definitions); the user's first-visit stall was two of the 32 shard requests never answering (the bar at 94%, 2026-10-14); such a shard is now asked for again, but why a request hangs is not known.
- **"Same for all" covers only a trigger's yes-or-no "you may".**
- **Two tutorials: how to play Commander, and how to use the site** (the user, 2026-10-11/12): planned in `docs/plans/tutorials.md`, the user's decisions (2026-10-13) at its end; what's built is in `COMPLETED.md`. Next: the seeded decks and game 1's chapters (plan phase 4).
- **The game page's own rendering on a slow laptop** (2026-10-13/14): a 250-400 ms hitch when a frame's board lands on a ~50-permanent board (`Table` remounting, forced layout in `usePlayback`'s `show`); measurements and next steps in `docs/client-gaps.md`.
- **A wordy card's rules text is illegible in the hand** (the user, 2026-10-15): the hovered hand card shrinks long text until it can't be read (The Dawning Archaic); no fix in mind yet.
- **Animation follow-ups** (re-measure bot speeds, static buffs, library put-backs, the exile filter, the crown's flight, merged tokens, folding tokens with counters, dies-trigger pulses, history highlights, real sounds): `docs/plans/legibility-of-play.md`, "Follow-ups".

## Tooling / docs

- **Confirm the box's room cap of 6 with a load test there** (2026-10-18): `MAX_ROOMS_PER_SHARD`
  went from 8 to 6 on the dev PC's measurement of the bots' one-second budget
  (`docs/plans/room-shards.md`, "The one-second budget"); run `npm run load-test -w server` on the
  box with nobody playing, as `DEPLOYMENT.md` describes, and adjust from its knee.
- **An on-screen progress bar for the long checks** (the user, 2026-10-06): use Claude Code's new mods feature (a plugin's live pane or status line — the `plugin-authoring` skill) to show progress for the runs we do regularly: the engine suite, `bot:scenarios`, `bot:diff`, `bot:ab`, the fuzzer and the Playwright suites.
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
- **Vocabulary built ahead of any card.** Effect, trigger, condition, filter and replacement
  pieces, plus optional fields, built before any card used them. Keep them for the cards they
  were built for, but review the first card that uses each. The list is in
  `neededCards-features.md`, "Built ahead", recounted 2026-10-09: about 11 pieces and 14
  optional fields remain. `painIfUntapped` is the one no real card can use.
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
