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

- **The game page on a slow laptop, mostly**: the laptop runs a blitz at ~55-57 fps with 2-20
  short freezes a minute (was ~42 fps, ~120, worst 762 ms), the same with the bots in the page
  or on the server — not CPU contention (2026-10-13/14: 34053434, d7f00bbf; measured in
  426312fe).
- **Tutorials, phases 1-3**: the coach-mark overlay, the site tour (cut down to the front page,
  ending on the offer of the board tour), the tutorial room with a scripted opponent, chapter
  goals and retry, Learn Commander playing a proof lesson (`basics-proof`), and the board tour
  (`board-tour`) (2026-10-13: 3829b039, 436dcaa1, b0b8ba2b, cf41b357).

## Code health

- **Solo games in the player's browser**, `docs/plans/local-rooms.md` steps 1-7: blitz and
  lessons in a Web Worker (e21848ab), lobbies on the server, a local game surviving a reload
  (d68fae3d), measured on the user's low-end laptop (bots and memory fine), and on by default
  on the site with a fallback to the server (e6242373) (2026-10-13).
