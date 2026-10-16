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
