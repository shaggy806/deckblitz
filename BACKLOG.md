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

**489 of the 500 most-played commanders are implemented** (`top-commanders.txt`; re-mark with
`npm run cmdrs:mark -w engine`). An imported decklist usually has its commander substituted, and
that one card is the reason the deck exists. Live numbers for everything below come from
`npm run cmdrs:gaps -w engine`.

- **Ready to author, no engine work: none.** B294 (2026-11-09) re-attempted all 18 still missing
  and authored 6 (Mr. House, Hazel of the Rootbloom, Indoraptor, Orvar, Noctis, Minsc & Boo). Each
  of the other 12 waited on one narrow key, recorded in `engine/src/cards/top-commanders-gaps.json`;
  Jaws, Relentless Predator's (`trigger:destroyed`) was built 2026-11-10.
- **The 11 left, each with its key** (`cmdrs:gaps` ranks them; when a key lands, add it to that
  file's `built` array and author its commander in the same commit): Omnath, Locus of All
  `effect:add-mana-combination-of-card-colors`; Ob Nixilis, Captive Kingpin
  `trigger:opponents-lose-exactly-n-life`; Indominus Rex, Alpha
  `replacement:as-enters-discard-any-number`; Coram, the Undertaker
  `static:cast-from-any-graveyard-put-from-library-this-turn`; Marvo, Deep Operative
  `effect:clash-with-named-opponent`; Arna Kennerüd, Skycaptain `effect:token-copy-enters-attached`;
  Winter, Cynical Opportunist `decision:zone-choice-card-types-among`; The Mimeoplasm
  `replacement:copy-on-enter-exile-two-counters-from-other`; Magar of the Magic Strings
  `effect:noted-card-name-copy`; Tevesh Szat, Doom of
  Fools `effect:put-commanders-onto-battlefield`; Jorn, God of Winter
  `zone:play-from-graveyard-this-turn-enters-tapped`.

## Card backlog (by EDHREC rank, and the precons)

What blocks each unimplemented card, and which cards a built feature may have unblocked, is in
**`docs/card-blockers.md`** ("Open leads" first, then batch by batch and family by family, over
the per-card JSON records in `engine/data/sweep-2/` and `sweep-3/`). Card lists go there; this
section keeps only what to do next.

- **The rank goal (the user's, 2026-11-11): every card to EDHREC rank 10,000, but for those needing
  a major engine change.** `npm run -s cards:goal -w engine` lists what's left, best rank first,
  each with its open need keys and its size; `-- --size small --keys` is the build list, one key a
  unit. After B296-B298 (161 cards re-attempted and authored with no engine code) 383 were left;
  the first overnight run down the small list (2026-11-11, 92 keys, 101 cards, `COMPLETED.md`)
  leaves 285: 88 sized **small** (a field, an amount, a filter clause, a trigger event), 48
  **major** (a new decision, a new subsystem, a core rule changed — flagged, not built), 149
  **unsized** (records from B291-B296, read against today's engine but before sizes were
  recorded: size each as it is picked up). Every one needs engine work; the sizes are the
  authoring agents' estimates from reading, and held well on the small list: of 95 units tried,
  three were really major (Kamahl's Will, Soulfire Eruption, Spectral Searchlight) and about one in five needed no engine
  code. The next small units are Chiss-Goria's key, then Ratchet's and Curse of Hospitality's (read, not started). 23 triaged cards
  the run's keys freed wait in `cards:needs -- --stale` for `author-freed`, which will also give
  narrow keys to the few it left half-covered (Twists and Turns, Diplomatic Escort, Light Up the
  Night, Urgent Necropsy, Consume Spirit, Soul Burn). Past rank 10,000 the order is still EDHREC
  rank (`author-top-cards`; `cards:needs -- --next 60` lists the next untriaged, `-- --by-rank` and
  `-- --rank` what blocks the most), and the nine starter precons' 4 stand-ins
  (`engine/data/sweep-3/PC-*.json`) go as their originals land. `docs/plans/after-the-themes.md`
  has the order agreed before the goal (step 3 next). How the need keys were worked down to here
  (the recheck rounds, the families, the freed-card batches, the themes) is in `COMPLETED.md`.
- **The set walk, upcoming sets first**: Star Trek (TRK) and Star Trek Commander
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
- **Cards banned in Commander for power: 7 left, each blocked** (`B52.json`). Channel, Erayo,
  Fastbond, Flash, Nadu, Sylvan Primordial and Trade Secrets each wait on a feature of their own
  (`docs/card-blockers.md`).
- **Cards manifest and cloak may have unblocked** — recheck each: `docs/card-blockers.md`,
  "Open leads".
- **Features with a family of cards behind them**: the rest of "enters tapped and attacking"
  (`docs/card-blockers.md`) and the limitation ledger (`neededCards-features.md`).
- **More Oracle-parser templates.** The unread lines that recur most are the next templates
  ("Choose one —" on an ability, "You may pay {…}", "Put the rest on the bottom … in a random
  order", kicker's "if it was kicked"): `npm run card:scaffold -w engine -- --report --all` for
  today's figures; keep `npm run card:parse-check -w engine` at zero disagreements. **After a
  template lands, run `card:scaffold -- --auto-scan --all` and review what it finishes** — a
  template matches sentences, not meaning, so each new card is read against its Oracle text.

## Engine rules gaps

- **`triggerValue` reads 0 inside an `unless`'s `otherwise`** — B298: Archfiend of Spite's "loses that much life" lost none once the opponent declined; pool cards reading `triggerValue` there may be wrong (`docs/engine-gaps.md`).
- **Definition traps that fail silently** — B298: "opponent" on a `targetsChosenBy` trigger is read from the ability's controller, not the chooser; a spell's any-number bound other than a literal `"x"` becomes 0; `exile` of a card in hand without `fromHand` does nothing; `look-and-choose` over `exiled-this-way` with `max: 0` skips `leftover` (`docs/engine-gaps.md`).
- **`thenCounters` reaches tokens a replacement adds** — a token copy's `thenCounters` also lands on tokens made in addition (Chatterfang's Squirrels); `withCounters` tells them apart since 2026-11-11 (`docs/engine-gaps.md`).
- **An exile cost asks the sacrifice prohibition** — an `exilesSacrifice` cost (Food Chain, Primordial Mist) is refused under "can't sacrifice … to activate abilities", though nothing is sacrificed (`docs/engine-gaps.md`).
- **Combat damage replaced one attacker at a time** — several Zombies under Undead Alchemist mill in separate events, so a "one or more cards are milled" trigger fires once per attacker (`docs/engine-gaps.md`).
- **A door's unlock timestamp is read by some statics only** — P/T, keywords, restrictions, protection and hand size read it; a type-granting or other rule-changing door static would not (`docs/engine-gaps.md`).
- **`sameAbilityAs` counts one way only** — two abilities naming each other never count as one; only the second naming the first does, and nothing warns (`docs/engine-gaps.md`).
- **A back face spawned by name isn't a working permanent** — `debugSpawn("The Myriad Pools")` couldn't tap for mana; test-only so far (`docs/engine-gaps.md`).
- **Token events a `may` replacement doesn't reach (Moonlit Meditation)** — amass, incubate, encore, myriad and populate make tokens without offering a `becomes` (`docs/engine-gaps.md`). (2026-11-09: amass, incubate, populate and encore fixed; myriad, amass with `who` and other direct `createTokens` callers are left.)

One line each; the detail (rule numbers, code sites, the cards each blocks) is in
**`docs/engine-gaps.md`**, under the same bold title. When a gap closes, delete its detail
there and move this line to `COMPLETED.md`.

- **B294's small gaps** (2026-11-09) — `notThisWay` has no player scope (Deadly Brew; Rise of the Witch-king blocked); `amounts` conditions and dynamic filter operands aren't read in static or cost contexts (Hagra Mauling, Thryx, Ensnaring Bridge, Lavinia); three more the agents reported, unverified.
- **"Each player may" acts on each answer before asking the next** (rule 101.4; the tempting offers and Kwain). (2026-11-09: tokens and counters fixed, and searches are held; `modal` effects, `options` and a find bound for a hand, Jungle Wayfinder and Weird Harvest, are left.)
- **A shuffled face-down pile keeps its object ids** (Become Anonymous, Expose the Culprit: a client reading the wire can tell which face-down card is which; needs a design call).
- **A self-replacement beside an exile: no 616.1 choice** (Gravebane Zombie's and Blightsteel's own "instead" always beat Rest in Peace or a finality counter).

- **A player can't play another player's face-down exiled card blind** (rule 406.3a). (2026-11-11 audit: Urianger Augurelt and Lobelia, the two cards it named, are authored since B263 and `linkedCastGrantFor` is gone; check whether any gap is left before working on it.)
- **A token with riot is never asked** (it takes haste; blocks Spider-Punk's Spider tokens). (2026-11-09: token copies are asked; named tokens would have to go through `enterTokenCopies`. Only Spider-Punk needs it.)
- **Mulligans are declared at once, and two opening-hand rules are loose** — rule 103.5 has turn-order declarations but `beginMulligans` asks in parallel (a design call); `COMMANDER_RULES` gives the free mulligan at two players, while 103.5c names multiplayer and Brawl; a revealed opening-hand card isn't kept revealed until the first turn (103.6b). (2026-11-09: 103.5c and 103.6b settled; only turn-order declarations are left.)
- **Limited-duration control of a player** — rule 723.2's Word of Command (one spell's worth of control); `player-control.ts` holds a next turn, a next combat or Opposition Agent's search only.
- **A targeting restriction can't last a turn, or require a target**: `hexproofFrom`'s qualifiers are statics only; Display of Dominance's "… this turn" over permanents you control, Lurker's "unless it attacked or blocked this turn" and the Flagbearers' "must choose at least one Flagbearer" (601.2c) need more (`docs/engine-gaps.md`). (2026-11-09: only the Flagbearers' "at least one if able" over a whole target set is left, and it needs a client change.)
- **A merged or melded permanent's cards go into a library or graveyard in an order nobody chose**: rule 730.3a and the meld ruling let the owner order them; and only a blink and the exile links find every card it became as "that card" (730.3c, `leftWith`, built 2026-10-31 with meld).
- **Simultaneous as-enters removals of every counter**: two Thieves of Blood at once — the player should choose which gets them (`docs/engine-gaps.md`).
- **Face-down leftovers**: Illusionary Mask, Ixidron, Vesuvan Shapeshifter and others, each needing its own face-down link or choice (`docs/engine-gaps.md`).
- **`put-onto-battlefield` follows a target that changed zones during the resolution** (400.7): Celestial Gatekeeper's "exile it, then return target …" returns itself from exile (`bug:moved-target-card-still-acted-on`, batches 219 and 235). (2026-11-09: moved under another name is fixed; a target moved by a mass effect and then named by its slot is left.)
- **Splice's limits** (702.47): only onto a spell with one plain `effect` (not modal, fused, divided or `resolve`), not with overload, and at most four splice cards a cast. (2026-11-09: onto modal, fused and overloaded spells landed, and non-mana splice costs; a spliced card with targets onto a modal spell, divided and `resolve` spells, the four-card cap and 702.47b's order are left.)
- **Blitz, dash, sneak, web-slinging and More Than Meets the Eye are offered only from the hand and the command zone** (702.152a, 702.109a, 702.190a, 702.188a, 702.162a).
- **Replacement order is chosen for the affected player, never asked** (616.1): among them two opponents' Crafty Cutpurses on one token (first in turn order), and the Words cycle's next draw before a Notion Thief or a draw multiplier. (2026-11-09: the `replacement-order` decision asks for damage, combat, destroy, and the `add-counter`, `counters-divided` and `gain-life` effects; entering counters, costs, lifelink, player counters, connive, proliferate and events that can't wait still take the best order.)
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

- **What the bot audit's fixes left** (2026-11-10; every step of `docs/plans/bot-audit-fixes.md` is built, its step 5 A/B level) — each needs a design of its own (the plan's "What this plan does not take on"): opponents that respond inside a rollout and holding instants for a better moment (Q8); hidden information (rollouts read the real library order); a worker thread for bots. Also from step 5: a triggered ability's target chosen as it goes on the stack is scored by standings, edicts aren't wipes, `bot:ab` has no pairing by seed, and the five sequencing rules v2 dropped are still v1's (`controller.ts`), so still play in rollouts.

- **`legalActions` takes a third of a second on a wide board with an X spell in hand** (found 2026-11-10, the audit's step 3): a v1 turn played for real from `engine/data/bot-positions/seed-50-t40-b73.json` takes 110 s for 312 acts, 89% of it under `castSpellVariants` → `maxAffordableX` → `planManaPayment` → `coverGeneric` → `byKeep` → `keepScore` → `supplyLeft` (`isTapped` alone 38%), which looks quadratic in mana sources. A rollout's stand-in doesn't hit it; a live seat on that board, and the server's view of it, would. Profile it first (`node --cpu-prof`, a v1 controller on every seat, `advanceUntil` 400 acts).
- **Sylvan Library's bots** (probed 2026-11-04): v2, with Lightning Bolt, Craw Wurm and Sol Ring on top, declines "draw two additional
  cards?" at every life total tried, 10 to 1000, though it pays for a land draw at 40 or more; v1 draws but never pays 4 life, even at 1000. Why not yet looked into.
- **A bot answers "as this enters, choose odd or even" with the first option** (Ashling's Prerogative, Gollum): `decisions/choose-creature-type.ts`'s candidates skip as-enters menus, so it's legal but unaimed.
- **v1's `chooseFromZone` returns its minimum** (`controller.ts`), so that controller exiles nothing for Sutured Ghoul, which dies; not checked how v2 answers.
- **A bot sacrifices at most down to three of a kind for an attack cost** (`SACRIFICE_KEEPS` in `combat/attacking.ts`): a heuristic, not measured.
- **91 targeted slots have no polarity rating** (of 12,164, 2026-11-02; `target-polarity.test.ts`' ratchet prints them): some only read their target (Biomantic Mastery), some are Roles on a slot whose spec already picks the side (Betroth the Beast), and some look like real misses ("target player draws, then discards", Cephalid Looter; `as-player`'s and `for-each-player`'s player, Wheel and Deal, Muse Vessel). A bot reads an unrated slot as `either`.

- **A bot controlling another player only passes** (2026-11-01) — `eval-bot.ts`'s stand-in makes that player's forced decisions one step ahead and casts nothing, so a bot's Mindslaver turn is legal but timid.
- **One v2 simulation can take 3-9 s on a huge board, past any decision budget** (2026-11-09) — real bracket 4 decks (`docs/plans/strong-bot-decks.md`, on the local `strong-decks-pilot` branch) reached 50-270 permanents (discover chains, 1,097 legal actions), and decisions ran 40-80 such simulations: 240-475 s unbudgeted. The wait is bounded since 2026-11-10 (the audit's step 2: a rollout is stopped at the deadline, an unscored search plays v1's cast, and the rest of that turn starts no rollout), so on such a board the bot now plays about as v1 does; **left: the cost itself**, so that it searches there at all (steps 3 and 4). No engine hot spot stood out in a profile (characteristics, triggers and SBAs, spread out); the cost is how much a rollout plays.
- **Bots never band, and price a band's blocker as blocking one creature** (2026-10-28, B247): a bot's attack never sets `AttackerDeclaration.band`, and `bot/combat-math.ts` judges a block as one blocker on one attacker, though a blocker of a band blocks all of it and takes all their damage (rule 702.22h). Dividing damage under banding is right already (`opposedAssignment`).
- **Play with the bots' simulation budget** (the user, 2026-10-13): v2 stops on whichever comes first,
  a count (`maxSimulations`, default 200 a decision; 12 rollouts for a non-priority decision) or the
  room's wall clock (300 ms). The clock makes strength depend on the CPU — the live box ran a searched
  decision in 152 ms typical against 37 ms on the dev PC — and matters again for solo games in the
  browser (`docs/plans/local-rooms.md` step 6). Try count-only budgets of a few sizes against the clock:
  strength (`bot:ab`), decision time p50/p99 on the box and the user's low-end laptop, and stalls
  (`npm run load-test -w server`).
- **The autopsies' open bot items** (`docs/plans/deck-autopsies.md`, "Left"): token payoffs
  beyond engines (sacrifice outlets, leaves-the-battlefield); premium removal fired at weak
  targets past the first two rounds. Probed 2026-11-09: Yawgmoth, Priest of Forgotten Gods, a
  one-sacrifice Blood Artist kill and Deadly Dispute in response to removal are right; Dispute
  and Village Rites on a spare creature now are (`isSpareFodder`). A kill that takes
  several sacrifices (every opponent at 2 with Viscera Seer, Blood Artist and two creatures) v2
  now takes, with tokens or with real creatures: the fault was the fodder choice, fixed
  2026-11-10 (the audit's Q3, `cheapestFodder`). **Left: v1 still passes there.**
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
- **More training scenarios.** About 175 hand-built scenarios, all of them gating
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


- **The die rolling animation needs adjusting** — with the loss of gradients, the vertical bounces look like the shape is just growing and shrinking (`client/src/App.css`'s `die-land`).

- **Which seat you see while controlling another player** (the user's call, after playing it) — today the table flips to the controlled player's seat; the other option is to stay in your own seat with a clear marker.
- **Too many priority stops with a land like Bountiful Landscape** (a design call) — a non-mana ability on the battlefield stopped the game about 40 times in one four-player round, and Auto-pass pauses on each opposing spell.
- **Blitz is the last thing on the landing page** — the site's main feature sits under the navigation, in the same yellow as "Create a game", with its paste form's button just below the fold at 768px.
- **Blitz starts an incomplete deck without a word** — a 4-card list went straight into a game with an empty library.
- **The lobby doesn't show that Ready is the next step** — Start Game is disabled until you press it, and it doesn't look like the thing to press.
- **Library search only matches exact phrases** — "atraxa praetors" and "flying dragon" find nothing, and the message says to try a shorter search.
- **The library can't sort by release date** — the user wants it as a sort option beside EDHREC, name, mana, color and type.
- **The history log's layout** — a full-screen popup you can't read beside the board, event numbers on every line, and the phase banner draws over it.
- **The hand's rules text is tiny at rest** — 8.5-9.5px and tilted at 1366×768, readable only on hover.
- **The stack's card hides a seat's board** — at 1366×768 it covers the fourth player's board while you decide whether to respond.
- **The Cycle popup is easy to miss and ignores Escape** — a small button under the hover card; Settings closes on Escape and this doesn't.
- **A hover card's reminder can name a keyword the card lacks** — Dragonmaster Outcast shows a Flying reminder, from the token its text makes.
- **Deck builder rough edges** — long deck titles cut off, the hover preview covers the search box, the search box's count ignores the colour filter, re-importing makes a second deck of the same name, "1 issue(s)".
- **The game's top bar and labels stay small at 2560×1440** — judged by eye; measure before changing.
- **The X prompt and shown cost ignore a target's tax** — `App.tsx` doesn't read `xCost.targetTaxes`/`maxXUnreduced`, so a taxed target at too high an X is refused rather than never offered, and the shown cost omits the tax.
- **A hand card's types show as printed under a static outside the battlefield** — `view.ts` under `typesOutsideBattlefield` (Conspiracy, Arcane Adaptation); the filters read the new types.
- **A human's target picks aren't narrowed by the new target relations** — `viewTargetFacts` lacks `shareTypes`, `toughnessOf`, `nameOf` and `attachedTo`, so a broken pair is refused only when sent (found 2026-10-31).
- **Cultivate's split prompt doesn't say which find goes where** — "Choose up to 2 cards"; `search-library.instead` with `pick: "one"` would ask properly (found 2026-10-31).
- **Playback stalls when your cast triggers your own targeted ability** — the cast showcase never ends and the target prompt never shows (found 2026-10-30 by `run-check`; Briarknit Kami, Ichormoon Gauntlet). Seen again 2026-11-11 with Wasteland Strangler's manual check, which can't be played to its end until this is fixed.
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

- **Verify's change selection has five coverage holes** (2026-11-10): listed in
  `docs/plans/verify-speed-audit.md` (quick mode skipping the server suite when its inputs changed,
  staged-then-edited cards, tokens and edited cards outside the fuzz stamp, `--landing`'s short list,
  background results lost on a main-chain failure); its item 8 (the engine tests typecheck beside
  the build) is the one speed-up left.
- **Confirm the box's room cap of 6 with a load test there** (2026-10-18): `MAX_ROOMS_PER_SHARD`
  went from 8 to 6 on the dev PC's measurement of the bots' one-second budget
  (`docs/plans/room-shards.md`, "The one-second budget"); run `npm run load-test -w server` on the
  box with nobody playing, as `DEPLOYMENT.md` describes, and adjust from its knee.
- **An on-screen progress bar for the long checks** (the user, 2026-10-06): use Claude Code's new mods feature (a plugin's live pane or status line — the `plugin-authoring` skill) to show progress for the runs we do regularly: the engine suite, `bot:scenarios`, `bot:diff`, `bot:ab`, the fuzzer and the Playwright suites. (2026-11-11 audit: the writers exist, `engine/scripts/progress.mjs` into `.claude/progress/`, wired into the engine and server suites, the bot benches, the fuzzers and Playwright; left are the mod that shows them, if it isn't on the user's machine already, and `bot:scenarios`.)
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
- **More rooms at once, and a bigger box that pays** (the user, 2026-10-13): `docs/plans/scaling-rooms.md`.
  Rooms run on worker threads now (`docs/plans/room-shards.md`, live with `SHARDS=1`), and the load
  harness (`npm run load-test -w server`) and event-loop numbers exist. Left: the same measurement
  on a bigger box, and that plan's status line, which still says nothing is built.
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
