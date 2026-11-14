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

**494 of the 500 most-played commanders are implemented** (`top-commanders.txt`; re-mark with
`npm run cmdrs:mark -w engine`). An imported decklist usually has its commander substituted, and
that one card is the reason the deck exists. Live numbers for everything below come from
`npm run cmdrs:gaps -w engine`.

- **Ready to author, no engine work: none.** B294 (2026-11-09) re-attempted all 18 still missing
  and authored 6 (Mr. House, Hazel of the Rootbloom, Indoraptor, Orvar, Noctis, Minsc & Boo). Each
  of the other 12 waited on one narrow key, recorded in `engine/src/cards/top-commanders-gaps.json`;
  Jaws, Relentless Predator's (`trigger:destroyed`) was built 2026-11-10, Tevesh Szat's,
  Omnath, Locus of All's and Ob Nixilis, Captive Kingpin's 2026-11-12, Indominus Rex, Alpha's and
  Coram, the Undertaker's 2026-11-13.
- **The 6 left, each with its key** (`cmdrs:gaps` ranks them; when a key lands, add it to that
  file's `built` array and author its commander in the same commit): Marvo, Deep Operative
  `effect:clash-with-named-opponent`; Arna Kennerüd, Skycaptain `effect:token-copy-enters-attached`;
  Winter, Cynical Opportunist `decision:zone-choice-card-types-among`; The Mimeoplasm
  `replacement:copy-on-enter-exile-two-counters-from-other`; Magar of the Magic Strings
  `effect:noted-card-name-copy`; Jorn, God of Winter
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
  code. **The lanes run (2026-11-13, `build-family overnight lanes`, `COMPLETED.md`)** built 46 keys and 48 cards, leaving
  147 keys over 139 cards (`cards:goal`); the 7 cards it freed went through `author-freed` as **B324** (all 7 authored,
  `--stale` empty again). **The second lanes run (2026-11-13/14, `author-top-cards overnight lanes`, `COMPLETED.md`)**
  built 16 agents' shares, 79 cards (83 card files), leaving 72 keys over 68 cards; **B325** re-keyed the six cards
  its keys didn't cover (North Star, False Dawn, Oath of Kaya, Tahngarth, Deification, Curie) and recorded Pulmonic
  Sliver major (an asked optional graveyard replacement). Skipped: Spectral Searchlight and Soulfire Eruption (major),
  Lich's Mastery (one implementation group with Nicol Bolas's deferred major). The 9 cards its keys freed went
  through `author-freed` as **B326** (2026-11-14): all 9 authored, three on small pieces built there (`CardFilter.isCopy`,
  `payLife: { atMost }`, a counter-removed event off an exiled card); `--stale` is empty. **B327** (2026-11-14,
  ranks 15527–18514, `author-top-cards`) authored 77 with Attractions built (the next untriaged rank is past
  18514, `cards:needs -- --next`); its small blocked keys went to the lanes. **Next: the lanes again**
  (`build-family overnight lanes`, or `author-top-cards`). Each lane's next share is
  `rank-goal.mjs --lane <lane> --keys`; the lanes' hand-off notes are in `engine/.cache/lanes/`. The 28
  triaged cards the run's keys freed went through `author-freed` as **B314** (2026-11-12): 13
  authored, 15 given narrow keys (`B314.json`), and `cards:needs -- --stale` is empty. Past rank 10,000 the order is still EDHREC
  rank (`author-top-cards`, which since 2026-11-12 builds the small features its cards need
  rather than blocking them; `cards:needs -- --next 60` lists the next untriaged). **First, the
  top 5000 (the user's call, 2026-11-12):** the 112 cards still missing from
  `top-commander-cards.txt` (110 with B294 records, `cards:goal` at rank ≤ 5000) need 109
  different features, one each but `effect:additional-beginning-phase` (Sphinx and Shadow of the
  Second Sun, and Cyclonus). Size each against today's engine first (B294 read them on
  2026-11-09; some may run now), then build the small ones best rank first, asking once about the
  majors (likely Odric, Master Tactician; Leyline of Transformation; Teferi, Who Slows the Sunset;
  New Blood). **B310** built the first ten (ranks 2002–2870, 12 cards with Cyclonus; the user
  approved the additional beginning phase), **B311** the next ten (ranks 2441–2796, Lim-Dûl's
  Vault to The Unagi of Kyoshi Island), **B312** the next ten (ranks 2902–3108, Duplicant to
  Rottenmouth Viper, and Drach'Nyen and Phantom Carriage on the way), **B313** the next ten (ranks
  3173–3469, Autumn's Veil to Selective Obliteration; all small, no majors), **B315** eight of the
  next ten (ranks 3479–3698, Spider-Punk to Final Act; Nicol Bolas, Dragon-God's +1 left major by
  the user), **B316** eight of the next ten (ranks 3596–3964, The Masamune to Tevesh Szat; no majors), **B317** the next six (ranks 3865–4068, Metalworker to Chaos Dragon, and Essence of the Wild on Mystic Reflection's feature; no majors). **B318** five more (ranks 4075–4207, Hushbringer to Old Stickfingers; no majors). **B319** ten more (ranks 4159–4411, Shay Cormac to Animation Module; no majors — Teferi, Who Slows the Sunset's emblem, guessed major, was a draw-step hook, and Benthic Anomaly needed no engine code). **B320** six more (ranks 4407–4511, Jinnie Fay to Senu, Keen-Eyed Protector; no majors built). **B321** five more (ranks 4533–4680, Guff Rewrites History, Tasha, the Witch Queen, Mechtitan Core, Thran Portal, Blatant Thievery; no majors). **B322** (2026-11-13) re-triaged the 55 unsized records and the 50 majors: 7 run now, 93 small, 5 major, all five approved by the user (`docs/plans/rank-goal-majors.md`). **B323** authored those seven (ranks 4670–9404, Displaced Dinosaurs to Vaevictis Asmadi; four needed a small piece each, `B323.json`). **Next:** `/build-family overnight lanes` — the small keys by lane (`engine/data/lanes.json`, `cards:goal -- --lane <lane> --keys`), the majors as agents of their own, Nicol Bolas and Zilortha first. Sylvan Primordial (B52) is freed by B321's required seat slots, but its ruling reads as though an opponent with nothing to target were skipped, against Vaevictis Asmadi's (the ability removed): settle that before authoring it (`B321.json`). New Blood (4536) is a major the user approved for a later session: change-text for creature-type words. The tail past rank 10,000 waits. **After that:**
  B308 (ranks 10,246–12,810) left five small features unbuilt — Prowl's
  `trigger:plays-card-exiled-with-source`, Ian Malcolm's `zone:cast-cards-you-dont-own`, Priority
  Boarding's reveal trigger, Reckless Blaze's `effect:delayed-trigger-dealt-damage-this-way-dies`,
  Cyclonus's `effect:additional-beginning-phase` (`B308.json` says what each lacks) — and
  Starlight Spectacular's ordering decision to ask about. **B309** (ranks 12,838–15,470): 44
  authored, 16 left — 8 on majors (Attractions ×7, Malik's secret choice) and 8 small keys,
  `B309.json`. And the nine starter precons' 4 stand-ins
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

- **Opposition Agent and a search of every library** — Jace, Architect of Thought's −8 (`eachLibrary`) begins the Agent's search control, but the Agent's "may play those cards" isn't granted for a find from the searcher's own library (`docs/engine-gaps.md`).
- **A token copy skips "exile first" and "pay any amount of life" as it enters** — The Mimeoplasm's `exileFirst` and Phyrexian Processor's `payLife` are asked only of a card entering, the same gap as Vizier of Many Faces (`docs/engine-gaps.md`).
- **A `turn-history` condition with `who: "opponent"` sums over every opponent** — B327: "an opponent had two or more creatures enter" passes on one each from two opponents; and a `trigger-value` condition reads false while triggering, so it can't be an intervening "if" (`docs/engine-gaps.md`).
- **`triggerValue` reads 0 inside an `unless`'s `otherwise`** — B298: Archfiend of Spite's "loses that much life" lost none once the opponent declined; pool cards reading `triggerValue` there may be wrong (`docs/engine-gaps.md`).
- **Definition traps that fail silently** — B298: "opponent" on a `targetsChosenBy` trigger is read from the ability's controller, not the chooser; a spell's any-number bound other than a literal `"x"` becomes 0; `exile` of a card in hand without `fromHand` does nothing; `look-and-choose` over `exiled-this-way` with `max: 0` skips `leftover` (`docs/engine-gaps.md`).
- **`thenCounters` reaches tokens a replacement adds** — a token copy's `thenCounters` also lands on tokens made in addition (Chatterfang's Squirrels); `withCounters` tells them apart since 2026-11-11 (`docs/engine-gaps.md`).
- **An exile cost asks the sacrifice prohibition** — an `exilesSacrifice` cost (Food Chain, Primordial Mist) is refused under "can't sacrifice … to activate abilities", though nothing is sacrificed (`docs/engine-gaps.md`).
- **Several cards at random move one at a time** — Make a Wish's two random returns are two moves, so a "one or more cards leave your graveyard" trigger fires twice; Capricious Hellraiser waits on the fix (`effect:random-cards-exiled-together`, `docs/engine-gaps.md`).
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
- **Replacement order is chosen for the affected player, never asked** (616.1): among them two opponents' Crafty Cutpurses on one token (first in turn order), the Words cycle's next draw before a Notion Thief or a draw multiplier, and a token minted under two "enter as a copy of" effects that differ (Essence of the Wild beside Mystic Reflection). (2026-11-09: the `replacement-order` decision asks for damage, combat, destroy, and the `add-counter`, `counters-divided` and `gain-life` effects; entering counters, costs, lifelink, player counters, connive, proliferate and events that can't wait still take the best order.)
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
- **One v2 simulation can take 3-9 s on a huge board, past any decision budget** (2026-11-09) — real bracket 4 decks (`docs/plans/strong-bot-decks.md`; `STRONG_DECKS`, a room's "Strong" bot decks since 2026-11-11) reached 50-270 permanents (discover chains, 1,097 legal actions), and decisions ran 40-80 such simulations: 240-475 s unbudgeted. The wait is bounded since 2026-11-10 (the audit's step 2: a rollout is stopped at the deadline, an unscored search plays v1's cast, and the rest of that turn starts no rollout), so on such a board the bot now plays about as v1 does; **left: the cost itself**, so that it searches there at all (steps 3 and 4). No engine hot spot stood out in a profile (characteristics, triggers and SBAs, spread out); the cost is how much a rollout plays.
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
- **What the four weak upgraded decks' autopsies found in the bots** (2026-11-11; ten replayed
  losses each, `docs/plans/upgraded-decks.md`, "The four weakest decks"). None is fixed:
  - `graveyardCastable` counts only a card's own flashback, escape or `mayPlaySelf`
    (`castableFromGraveyard`, `bot/features.ts`), not a card a static `mayPlay` on our
    battlefield lets us cast: Gisa and Geralf's Zombies and Muldrotha's permanents score as
    plain graveyard cards.
  - A commander is recast in preference to a castable five- to seven-drop (Kardur in six of ten
    Chaos Incarnate replays; Felothar five times in one Abzan game, about 40 mana).
  - Sweepers into its own best board (Jeskai: Vanquish the Horde at 47:T23 and 8:T32), and
    Pongify on its own Soldier token with no opposing creature (8:T12).
  - A draw spell loses to a same-cost creature as a passive permanent did before
    `standingEffects` (Read the Bones cast in 5 of 15 games castable, Faithless Looting and
    Frantic Search held from the opening hand while stuck on three lands).
  - With Shiko out, the second spell of a turn was one she copies in 4 of 12 two-spell turns.
  - Walls sent for chip damage with no vigilance, leaving no blockers (Abzan 144:T29, 44:T20).
- **Reign of Dragons (Upgraded) fell from 40% to 17%** of its games between two runs with its
  list unchanged (2026-11-11), across the `standingEffects` change and the other decks' list
  revisions: noise, the bot change, or opponents' removal now aimed at its artifacts. To settle:
  a `bot:ab` of the term on the bench decks, and autopsies of its losses
  (`docs/plans/upgraded-decks.md`, "Open").
- **Jeskai Striker (Upgraded) is kept from the bots** (2026-11-11, `SampleDeck.bots: false`): 2
  wins in 48 games after its list fix. Back in the pool when the bot habits its autopsy found
  (the item above) are fixed. Grave Danger, Abzan Armor and Chaos Incarnate sit at 15-17%, above
  the roughly 10% at which a deck comes out (the user's allowance).
- **The About page doesn't say how a creator can have a strong deck removed** (2026-11-11): the
  site has no contact route; the user's call what it should be
  (`docs/plans/strong-bot-decks.md`).
- **`crackbackGrowth` is unbenched since its last change** (2026-10-05, merged to main on the user's call with the tests, scenario gate and a 20-game fuzzer pass clean): the scaled crackback check now applies only while holding back passes it. Still to do: rerun the paired `bot:crackback` (0.5 against `--weights '{"crackbackGrowth":0}'`, 120+ seeds) to confirm the 25 swings into a plainly lethal board are gone and the 3.5% → 2.0% holds, re-bench against main, and add a training scenario (`docs/plans/smarter-bots.md`, "Combat: the alpha strike and crackback").

## Client / UI

One line each; the detail is in **`docs/client-gaps.md`**, under the same bold title, and the
animation follow-ups in `docs/plans/legibility-of-play.md`, "Follow-ups". When an item lands,
delete its detail there and move this line to `COMPLETED.md`.

- **Attractions in the client (phase 2)** — the engine plays Attractions since B327, but no decklist, deck builder or room can give a player an Attraction deck yet, and the board doesn't draw the Attraction deck, the junkyard or lit numbers (`docs/client-gaps.md`, `docs/plans/attractions.md`).
- **Another player's target popup says "your graveyard"** — Mausoleum Turnkey's opponent picks a card in its controller's graveyard under a title written from the controller's side (`docs/client-gaps.md`).




- **Importing or blitzing a deck with no clear commander should ask which** (2026-11-12): a list with no commander section or trailing commander line (an alphabetically sorted Archidekt export) has its commander guessed (`commanderSource: null` in `server/src/import-deck.ts`); instead a pop-up should offer the list's valid potential commanders to pick from.
- **What the scenario builder can't say yet** — stolen, transformed or face-down cards (manifested ones), turn-long effects, the stack.
- **The Pass bar sits over the rightmost hand cards** (2026-11-11): at 1366x768 their lower edges and the lowered tray's last cards are under it, so the pointer reaching them leaves the hand and the raised tray drops.
- **The scenario builder can't hold the initiative or a dungeon position** — "Edit from here" drops both (`ScenarioSpec`), so a check of them has to reach them in play.
- **Quality-of-life room options (house rules)**, opt-in per room.
- **Server-side deck save and share** (decks live in `localStorage`).
- **The library and the deck builder load every card definition** (~6.3 MB at 12,089 definitions); the user's first-visit stall was two of the 32 shard requests never answering (the bar at 94%, 2026-10-14); such a shard is now asked for again, but why a request hangs is not known.
- **The game page's own rendering on a slow laptop** (2026-10-13/14): a 250-400 ms hitch when a frame's board lands on a ~50-permanent board (`Table` remounting, forced layout in `usePlayback`'s `show`); measurements and next steps in `docs/client-gaps.md`.

## Tooling / docs

- **`bot:ab` runs out of worker memory** (2026-11-11): 39 of the first 40 games ended "JS heap
  out of memory" at 18 workers, with no change to the state's shape between the two builds
  (`e62e9ba2c` against the commit after it). Each worker holds two builds, so two card pools of
  32,000 definitions, under the 768 MB cap (`scripts/worker-limits.mjs`). Until the cap or the
  pools' footprint is dealt with, an A/B across commits can't be run; `bot:diff` still works.
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
  do it on purpose. `release-date.ts` (the library's first-printing dates) wants `npm run gen:release-dates -w engine` after each `gen:oracle` or a batch of new cards: a card it doesn't list sorts last.
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
- **`resolve-arrows.spec.ts`'s 2-player creature test fails after the 4-player one** (found 2026-11-11): run as a whole file, "2p: a spell at a creature" at 1920x1080 or 2560x1440 loses its target click about every other run (the Bolt stays in hand, no error); alone it passes 12 of 12. Present before the day's client changes too. Only the daily full suite runs those sizes.
- **`room-stop.test.ts`'s "is replaced by a pass, and the game plays on" failed once in three full server runs** (2026-11-11): passes alone and on rerun; not looked into.
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
