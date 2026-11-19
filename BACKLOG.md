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

**997 of the 1000 most-played commanders are implemented** (`top-commanders.txt`, refetched and
doubled from 500 on 2026-11-14; re-mark with `npm run cmdrs:mark -w engine`). An imported decklist
usually has its commander substituted, and that one card is the reason the deck exists. Live
numbers for everything below come from `npm run cmdrs:gaps -w engine`.

- **The 3 left**, all from ranks 501-1000 and triaged in the sweep records (`card:brief -- "Name"`):
  - **The Celestial Toymaker** (#890), `amount:pile-or-guess-effects-this-turn`: engine-only, the
    next to build. Its end-step trigger counts the spells and abilities that made a player guess
    (the `guess` effect) or group cards or permanents into piles (`separate-into-piles`) this turn —
    a journal kind recorded per resolving spell or ability, read as a turn stat; its attack trigger
    is `separate-into-piles` with a face-down pile.
  - **Clara Oswald** (#737), `mechanic:commander-chosen-color-pregame` — a major waiting on the user
    (a colour chosen before the game, which changes colour identity).
  - **Malik, Grim Manipulator** (#779), `mechanic:secret-choice` — a major waiting on the user (a
    new kind of decision).

## Card backlog (by EDHREC rank, and the precons)

What blocks each unimplemented card, and which cards a built feature may have unblocked, is in
**`docs/card-blockers.md`** ("Open leads" first, then batch by batch and family by family, over
the per-card JSON records in `engine/data/sweep-2/` and `sweep-3/`). Card lists go there; this
section keeps only what to do next.

- **The rank goal (the user's, 2026-11-11): every card to EDHREC rank 10,000, but for those needing
  a major engine change.** **Reached 2026-11-16 (B333):** `npm run -s cards:goal -w engine` lists
  nothing — the user approved all ten last cards' majors and they were built. **Past rank 10,000**
  the order is still EDHREC rank: the triaged cards' keys (`rank-goal.mjs --rank 20000 --keys`),
  through `author-top-cards` as B333 did (lead plus worktree agents, a group of four cards each)
  or `build-family overnight lanes`. **B334 (2026-11-17) reached 13755; B335 (2026-11-18, overnight,
  34 lane agents, 171 cards) took every triaged card from 13560 to 17788 but those below.** **Five
  agents at once** (B335's experiment: five built as many cards an hour as six with fewer failures;
  `docs/card-blockers.md`, batch 335; the build-family and author-flagged skills say five since). **Next by rank** (`rank-goal.mjs --rank 20000 --keys`):
  Ellywick Tumblestrum (14843, `amount:differently-named-dungeons-completed`), Blood Sun (16071),
  First Family (16094), Forbidden Crypt (16193), Darigaaz Reincarnated (16306), Vanish into Memory
  (16309), then 16688 on (Qasali Ambusher, Elvish Refueler, Blossoming Calm, Squall). Waiting on the
  user: **Drain Power** (16523, a forced mana-ability decision: B335 left it as a major), Clara Oswald
  (13608, a pregame colour for a commander), Cryptic Spires (10790, a deck-construction choice: circle
  two colours), Path of the Ghosthunter (16226, Planechase), and the majors and decisions B308, B309 and
  B334 left (Starlight Spectacular's ordering, Malik's secret choice, Exchange of Words, The Toymaker's
  Trap, Command Performance, Vedalken Squirrel-Whacker). Soul Burn wants re-keying (hybrid pips on X).
  Each lane's hand-off notes are in `engine/.cache/lanes/<lane>.md` (this PC only). New cards come
  through `author-top-cards` once a snapshot refresh brings untriaged ones (`cards:needs -- --next
  60`). **The freed-card queue** (`cards:needs -- --stale`, `author-freed`): Crown of the Ages,
  Enchantment Alteration, Lumbering Battlement, Oracle en-Vec, Vortex Elemental, and B335's Cragganwick
  Cremator, Lich and Widespread Panic; Swindler's Scheme needs more than Gandalf's key, and Mana Web and
  Search the City need re-keying first (`docs/card-blockers.md`, batches 333-335). Tallowisp, Rootwater
  Shaman and Grimoire Thief were re-keyed in `B335.json`. **Ten more are in the queue since 2026-11-18**, each
  recorded as waiting only on a key built on or before its triage day (too coarse for the card, or a
  same-day build), which nothing would ever have freed: Blaster, Combat DJ; Canker Abomination; Exchange of
  Words; Flaming Gambit; Grimoire Thief (its B335 key was already built); Lymph Sliver; Nova Pentacle;
  Spelljack; Thranduil's Decree; Touch of Moonglove (its newest record is really B257's — `B154.json` is
  dated by the merge it arrived in). Re-read each and author it or give it a narrower key. The starter precons have no stand-ins left (Explosion of Riches landed in B334).
  How the keys were worked down to here (the lanes runs, B310-B330, the freed-card batches)
  is in `COMPLETED.md`.
- **The set walk, upcoming sets first**: Star Trek (TRK) and Star Trek Commander
  (TRC) are whole from their previews (batches 266-268, `COMPLETED.md`; assimilate built,
  `ASSIMILATE` in `helpers.ts`), and so are Marvel: Darkhold Destiny's previews (MDD, MDC) and
  Mystery Booster Commander (MBC) (batch 269). **The walk is caught up**: every released and
  previewed set is whole but Star Trek's All Good Things... (below), and Nauctis (NAU, out 2027-02-05) has no cards in the
  snapshot yet. **Next: refresh the snapshot** (`npm run gen:oracle -w engine`) once new previews
  are out, then `cards:sets -- --sets` picks up what it brings. MDD's Hela and Magik wait on
  release rulings (`mechanic:vengeance`, `B269.json`). **Star Trek is complete but one** (B331-B332, `/author-by-set TRK,TRC`, 2026-11-14/15, after
  the snapshot refresh): Star Trek Commander is whole (173 of 173), Star Trek 293 of 294. **All Good
  Things...** waits on rulings (none published yet): whether "all cards exiled with this Saga share a
  card type" holds with one card or none, and whether it needs one type common to all; the
  condition (`condition:exiled-with-source-share-card-type`) is small once the ruling is out.
  Re-read the set's cards when Star Trek's rulings are published (`npm run gen:oracle -w engine`,
  then `card:text -- --offline`): Võx, Child of the Collective was authored on the text as written
  (a spell both an artifact creature and a Spacecraft has undaunted twice).
- **Cards banned in Commander for power: 4 left, each blocked** (`B52.json`). Channel, Fastbond,
  Nadu and Trade Secrets each wait on a feature of their own (`docs/card-blockers.md`); Erayo,
  Flash and Sylvan Primordial are in the pool since.
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
- **111 Wizards precons are a card or more short of playing as printed** (2026-11-16, `node
  engine/scripts/gen-tooling-precons.mjs --short`; 86 of MTGJSON's 199 play whole): 51 of them
  one card short, 171 distinct cards in all, 41 in more than one deck (Loreseeker's Stone in
  five; Death by Dragons in four; Suffer the Past, Dawnbreak Reclaimer, Dearly Departed and
  Anya, Merciless Angel in three). A deck joins the bot tools' precons on the next run of the
  script once its last card lands; nothing ranks these cards ahead of the EDHREC order.

## Engine rules gaps

- **The rules audit's next slices** (2026-11-17, `docs/plans/rules-audit-2026-11.md`): the first slice (players who leave, combat, skip rules) fixed 800.4e, 508.8 and 506.8f and recorded 603.6c below. The second slice (casting, resolving, multiplayer flow) found nothing more in the engine. Left: four uncited leads not yet probed (506.3d, 104.3f, 704.5r/t, 603.2g); more exported logs read by script, which is where both real finds came from; then keyword interactions (702), merged commanders (903) and two replacement effects on one event (616.1). `npm run rules:uncited -w engine` lists the leads.
- **A departing player's permanents don't trigger "leaves the battlefield"** — rule 603.6c: another player's "whenever a creature leaves the battlefield" (Extractor Demon) should trigger for what a departing player owned; the engine leaves those permanents on the board inert and announces nothing. A design call (`docs/engine-gaps.md`).
- **The game passes priority by itself when a special mana ability would still let the player act** (the user, 2026-11-18: "game passes priority automatically when special mana abilities like that of relic of legends still allow for actions to be taken and spells to be cast") — Relic of Legends' "Tap an untapped legendary creature you control: Add one mana of any color." Not looked into; the likely place is what counts a window as good for mana only (`Game.isDeadForMana`, read by the room's auto-pass in `server/src/room.ts`): a spell is offered only if the payment planner finds the mana, so mana that comes from tapping another permanent may not make the spell castable in its eyes, and the window then passes as one with nothing but mana in it.
- **A player leaves while someone else is choosing targets** — the open choice still offers the departed player's permanents (rule 800.4a), and picking one is refused; found by the tables fuzz, seed in `docs/engine-gaps.md`.
- **A player who loses while they owe a decision** — rules 800.4f-h (another player pays nothing or chooses for them) aren't modeled; a concession is refused until the decision is answered, so only a state-based loss with a choice open reaches it (`docs/engine-gaps.md`).
- **B335's small gaps** — what the overnight lane agents reported and left: delayed triggers not ordered among a step's triggers or by which simultaneous event fires them (603.3b, 603.7b), Goad or encore against an "at least one attacks" requirement, a few cost combinations, two JSON string matches to replace, a reversed turn order lost by the builder's export (`docs/engine-gaps.md`).
- **B334's small gaps** — what the overnight lane agents reported and left: cost exiles inside a resolution counted as "exiled this way", a few unread grants, a copied Lodestone Bauble, scaffolder lines, a 3-4 player scenario with empty libraries (`docs/engine-gaps.md`). (2026-11-17: Bleeding Effect's "hexproof from" built; the Clone beside a simultaneous reanimation didn't reproduce and is pinned; "distribute among any number" may be none, rule 107.1c.)
- **An object's own "instead" against an exile replacement isn't asked** — Blightsteel Colossus's shuffle and Gravebane Zombie's library top are applied ahead of Rest in Peace or a finality counter without the owner choosing (rule 616.1e), and a Quintorius-cast spell countered by another spell's resolution goes to the library bottom unasked (`docs/engine-gaps.md`).
- **A `trigger-value` condition reads false while triggering** — B327: it can't be an intervening "if" (rule 603.4); Atomwheel Acrobats waits on `trigger:rolls-at-most` (`docs/engine-gaps.md`).
- **A created token records no entry source** — only `moveObject` sets an entry's `by`, so "created with [this ability]" (rule 607.2c) can't be read for a token (`docs/engine-gaps.md`).
- **A door's unlock timestamp is read by some statics only** — P/T, keywords, restrictions, protection and hand size read it; a type-granting or other rule-changing door static would not (`docs/engine-gaps.md`).
- **A back face spawned by name isn't a working permanent** — `debugSpawn("The Myriad Pools")` couldn't tap for mana; test-only so far (`docs/engine-gaps.md`).
- **Token events a `may` replacement doesn't reach (Moonlit Meditation)** — tokens another player creates (`create-token` or amass with `who`, a gift's Fish, Food, Treasure or Octopus) aren't offered to that player's `becomes` (`docs/engine-gaps.md`). (2026-11-09: amass, incubate, populate and encore fixed. 2026-11-17: myriad was offered already; the token made instead now attacks the player myriad named. The direct `createTokens` callers still don't ask a token's riot, 2026-11-16: an Army or Incubator token that a static gives riot takes haste unasked, where a `create-token` effect's token is asked.)

One line each; the detail (rule numbers, code sites, the cards each blocks) is in
**`docs/engine-gaps.md`**, under the same bold title. When a gap closes, delete its detail
there and move this line to `COMPLETED.md`.

- **B294's small gaps** (2026-11-09) — reported by the agents and never checked: an `amounts` condition in a cost context (`selfCostReduction`; Hagra Mauling and Thryx are authored another way); `of-player "that-player"` in a `whileCondition` on a cast trigger; `put-into-graveyard` takes one object, not a set (`docs/engine-gaps.md`). No pool card needs any of the three. `notThisWay`'s player scope is built (`thisWayBy`, 2026-11-12), and a `would-draw` `atLeast` honours `whileHandAtMost` (2026-11-17).
- **"Each player may" acts on each answer before asking the next** (rule 101.4; the tempting offers and Kwain). (2026-11-09: tokens and counters fixed, and searches are held; `modal` effects, `options` and a find bound for a hand, Jungle Wayfinder and Weird Harvest, are left.)
- **A shuffled face-down pile keeps its object ids** (Become Anonymous, Expose the Culprit: a client reading the wire can tell which face-down card is which; needs a design call).

- **Mulligans are declared at once, and two opening-hand rules are loose** — rule 103.5 has turn-order declarations but `beginMulligans` asks in parallel (a design call); `COMMANDER_RULES` gives the free mulligan at two players, while 103.5c names multiplayer and Brawl; a revealed opening-hand card isn't kept revealed until the first turn (103.6b). (2026-11-09: 103.5c and 103.6b settled; only turn-order declarations are left.)
- **Limited-duration control of a player** — rule 723.2's Word of Command (one spell's worth of control); `player-control.ts` holds a next turn, a next combat or Opposition Agent's search only.
- **A targeting restriction can't last a turn, or require a target**: `hexproofFrom`'s qualifiers are statics only; Display of Dominance's "… this turn" over permanents you control, Lurker's "unless it attacked or blocked this turn" and the Flagbearers' "must choose at least one Flagbearer" (601.2c) need more (`docs/engine-gaps.md`). (2026-11-09: only the Flagbearers' "at least one if able" over a whole target set is left, and it needs a client change.)
- **A merged or melded permanent's cards go into a library or graveyard in an order nobody chose**: rule 730.3a and the meld ruling let the owner order them; and only a blink and the exile links find every card it became as "that card" (730.3c, `leftWith`, built 2026-10-31 with meld).
- **Simultaneous as-enters removals of every counter**: two Thieves of Blood at once — the player should choose which gets them (`docs/engine-gaps.md`).
- **Face-down leftovers: Illusionary Mask** — cast face down for X; the others the line named (Ixidron, Vesuvan Shapeshifter, Ugin, the Ineffable, Gustha's Scepter, Kozilek, the Broken Reality, Thieving Amalgam, Death in Heaven) are in the pool (`docs/engine-gaps.md`).
- **`put-onto-battlefield` follows a target that changed zones during the resolution** (400.7): Celestial Gatekeeper's "exile it, then return target …" returns itself from exile (`bug:moved-target-card-still-acted-on`, batches 219 and 235). (2026-11-09: moved under another name is fixed; a target moved by a mass effect and then named by its slot is left.)
- **Splice's limits** (702.47): only onto a spell with one plain `effect` (not modal, fused, divided or `resolve`), not with overload, and at most four splice cards a cast. (2026-11-09: onto modal, fused and overloaded spells landed, and non-mana splice costs; a spliced card with targets onto a modal spell, divided and `resolve` spells, the four-card cap and 702.47b's order are left.)
- **Blitz, dash, sneak, web-slinging and More Than Meets the Eye are offered only from the hand and the command zone** (702.152a, 702.109a, 702.190a, 702.188a, 702.162a).
- **Replacement order is chosen for the affected player, never asked** (616.1): among them two opponents' Crafty Cutpurses on one token (first in turn order), the Words cycle's next draw before a Notion Thief or a draw multiplier, and a token minted under two "enter as a copy of" effects that differ (Essence of the Wild beside Mystic Reflection). (2026-11-09: the `replacement-order` decision asks for damage, combat, destroy, and the `add-counter`, `counters-divided` and `gain-life` effects; entering counters, costs, lifelink, player counters, connive, proliferate and events that can't wait still take the best order.)
- **The rest of leaving the game** (800.4g–h): a choice asked of a player who has left is skipped, not handed to another player.
- **A Notion Thief redirect isn't keyed for rule 614.5** (2026-11-16, B333): with Chains of Mephistopheles and two Thieves of different controllers, a redirect can apply again to the card Chains makes a player draw (3+ players only; `docs/engine-gaps.md`).

Latent: the engine departs from the rules here, but no pool card reaches it yet. Fix each
when a card that needs it is authored.

- **"A Zombie … dies" is read as a Zombie creature**: rule 700.4's "dies" takes any permanent, so a noncreature Kindred permanent with that subtype is missed. The parser and the 42 pool cards agree on `type: "creature"`, so a fix changes them together.

## Bots

`docs/plans/bot-effect-knowledge.md` is the plan of record. What's open is tuning: the items
below, and the ones waiting on a live game to show a problem, listed in that plan's "Watching
live games for" (wraths since `threat`, pumping an opponent's attacker, the `"acting"` rollout,
big boards and deep stacks under count budgets, deck biases, 1/1 tokens since `smallTokens`,
and Shiko or the other spell; haste enablers in the crackback were measured and tried on
2026-11-15 and closed, `docs/plans/bot-next-steps.md` step 6).

- **The next steps, in order** (2026-11-15, `docs/plans/bot-next-steps.md`, which also says why the answer isn't a longer clock): steps 1 (real blocks where a decision turns on them), 2 (a payment priced by the turn planned after it) and 4 (`bot:losses`, the screen for losses worth reading) are built (`COMPLETED.md`). Open: **3.** the archetype passes, now read through the screen: `npm run bot:losses -w engine` over an archetype's decks, each flagged loss read with the `bot:watch` line it prints and rebuilt from `--snapshot-at` before it is called a misplay (tokens done by hand; screened so far: seeds 1-6 on six pods of the upgraded precons and the strong decks, 37 games, two misplays found and fixed, none in the last 35 games; what the screen still flags is an attack's bet on an opponent's board not growing, which is `crackbackGrowth` and `crackbackParanoia` to tune, not a fault; left: more seeds per archetype, the Krenko pod, which runs past half an hour a game, and the Jeskai/Abzan Armor pod's long games); **5.** playing to its outs (the user, 2026-11-15) is checked and half built (`COMPLETED.md`, "plays to the out in its hand"): left are an out that is an activated ability or a counterspell, a sorcery-speed wipe over its own big board, attacks that still race when dead on the board, and whether the bots wipe for a table's sake (a third player held a wipe on 12 of 58 dead turns).
- **What the bots still know that a player doesn't** (2026-11-17; the libraries' order, the game's random numbers and the other players' hands were hidden from every v2 decision that day, and the seat given a memory of what it was shown, `COMPLETED.md`): face-down cards are read as what they are (a foretold card, a morph, a manifest, a card exiled face down the seat may not look at); the bot plans as if it had read each deck's list (the hand it imagines is dealt from that player's own unseen cards), where a player has only a guess at it; one deal a turn is one sample, where several averaged would be steadier at that many times the simulations; and the memory forgets what a careful player would work out (a known card under two unknown ones, which card went back when the whole hand was known). v1 seated on its own (never in live rooms) still reads the real state. `bot/determinize.ts`'s `withHiddenCards`, `bot/seat-memory.ts`.
- **An engine's turns to come aren't priced: Terror of the Peaks left in hand all game** (2026-11-17, a live misplay, `docs/bot-misplays.md`; training scenario "casts Terror of the Peaks beside Scourge of Valkas, not Atarka"): a permanent whose trigger pays for every creature entering after it is worth, to the evaluation, its body and whatever enters under it inside the same line. Scourge then Atarka beat Scourge then Terror by 1.7. Outline: a feature beside `drawEngines` and `tokenEngines` for such permanents (`entersPayoffFilters` finds them), fitted against the scenario.
- **Which permanents a bot's removal should take: not by salt** (2026-11-15, `docs/plans/bot-next-steps.md` steps 6 and 7; `npm run bot:engines -w engine`, 93 games on the upgraded precons and 45 on the strong decks). The deaths out of a safe reading come from an engine already in play, so the question was whether salt score, EDHREC rank, the bots' `engineScore` or hand labels could say which cards to answer. Measured against what a turn brings past its board: salt sorts nothing on the strong decks (one more card adds 1.5%, 1.3%, 1.1%, 0.8% to the chance of a big turn across its bands) and neither does rank or `engineScore`; what marks a card is that it is the commander (+7.4%) and then that it makes tokens (+5.6%), both read off the game with no table, and the bots already take those two to three times as readily as a plain card. Hand labels can't be checked by this log (69 cards measurable in 93 games). **Judged 2026-11-16 and not kept as it stands** (`docs/plans/bot-next-steps.md`, step 7; `bot:judge --kind removal`): a commander and token-maker weight where a removal picks among its targets changed 17 aims in 23 games, 3 better, 4 worse, 10 even. The commander half fails (2 better, 4 worse of 12: a commander removed comes back from the command zone, so the removal is better spent on an engine that isn't one); the token-maker half has four cases (1 better, 0 worse). **Left:** token makers alone over enough games to say (about 150: a 40-game `--to-end` run takes three hours and changes six or seven such aims), and for commanders only removal that keeps one away (a tuck, a theft). The hook stays in at zero for that run (`bot/aim.ts`: `--weights '{"opposingTokenEngines":4}'`); salt or a hand list only as a choice about feel (bots that kill what players expect killed), not strength, and the user set feel aside for now. The unfinished salt term on the `strong-decks-pilot` branch (below) is the same question from the other end.
- **What step 1 left** (2026-11-15): the attack climb still scores every candidate against v1's blocks and only its answer is checked (against that answer less one attacker, and no attack); a rollout's attacker is v1 everywhere; no gate scenario holds the attack check. Its thinking time: a creature-heavy four-player pod went from 31 s to 44 s over 33 turns at the live clock.
- **Dead on the board with a wipe in hand and the mana for it, a bot does something else** (2026-11-16, `bot:losses --seeds 7-12` on four pods of the upgraded precons and the strong decks: 2 of 72 losses; the same shape as step 5's Grave Danger, which didn't reproduce on a small board). Chaos Incarnate, on 22 with one blocker in front of Tramplesaurus Rex's 27 power, held Deadly Tempest and spent eight mana on two Theater of Horrors pings (seed 7 of "Draconic Destruction, Tramplesaurus Rex, Reign of Dragons, Chaos Incarnate", turn 28); Family Matters, on 15 in front of Temur Roar's dragons, held Calamity of Cinders and cast two creatures (seed 10 of "Token Triumph, Temur Roar, First Flight, Family Matters", turn 42). Both died to the next swing. On a small two-player board the bot gets it right (the gate's "casts its board wipe when the board in front of it kills it next turn": it holds the wipe through combat, `heldForCombat`, and casts it after), and in the Chaos Incarnate game the two pings came before combat and spent the mana the wipe needed, so look first at whether the ping outscored the wipe there or the hold let it go. A likely cause, by reading: a cast is checked against the swing back only for making things worse (`tapsIntoCrackback`, and only when the board isn't lost already); nothing ranks the play that takes the bot off a lethal board above the rest, and the rollout ends with its own turn. The fix would mirror the answer check of 2026-11-16 (`OPEN_ANSWER`): in its own turn, on a board that has it dead, every candidate and line that still ends the turn dead scores below one that doesn't, the pass included, and the turn planner's lines the same. Rebuild one of the two from `bot:watch --snapshot-at` first, and judge it by playout (games have changed since: replay the seeds on the build of that day, `baa2ffcf5`, to find the turns again).
- **The rest of that screen, unread** (2026-11-16, same run): three more "attacked itself open" (Temur Roar twice, Draconic Destruction once), one "life spent" (Grave Danger spent 22 life from turn 33 and died by 3) and one loss on its own turn (Temur Roar, on 2). Two flags were read: one became the fix of that day ("dead only to three boards added up"), one was a true race (dead by one point to its last opponent whatever stayed home).
- **The out's mana goes on a play the simulation only just lives through** (2026-11-16, the tooling precons, `bot:watch --decks "Hatsune Miku,Calling All Angels,Keen Engineering,Multiverse Reforged" --seed 1 --count --turns 34-36`; probe `.scratch/precon-watch/probe-outs.mjs`): dead on board to Giada's Angels with Aetherize in hand and nine lands, Keen Engineering's tap guard kept the four mana through two plays and then let Fall from Favor spend it, because the swing back played out from that board was lived through on blocks alone (3 life, three creatures lost, against 20 life and the Angels in their owner's hand). `tapsIntoCrackback`'s outs branch asks whether a play still lives, not what living costs beside keeping the out. A comparison of the two ends (life, creatures) would say it; what margin, and what it costs in simulations, isn't worked out. The attack half of the same death is fixed (`COMPLETED.md`).
- **The tooling precons' first screen, read and unread** (2026-11-16, `bot:losses --seeds 1` on 18 pods, `.scratch/precon-watch/losses-seed1.txt`: 9 of 54 losses flagged). Fixed from it: the all-in from the last points of life, the attack past a swing it lived through, poison in the arithmetic. Read and not misplays: Counter Intelligence died holding Fumigate it couldn't cast (one white source), Arm for Battle's Deflecting Palm stopped one of 88 power, Enduring Enchantments attacked at 31 life into 26 power that grew to 30 (the margin measured on 2026-11-15). Unread: Limit Break ("tapped away; attacked itself open", killed from 69 life by an 84-power Sin), Animated Army (Starstorm uncast, sixteen cards in hand), Mutant Menace ("life spent"). Only one seed a pod has been played; the other deck tools take the pods too (`--pool tooling`). One game of a second seed ran past 15 minutes (`"Wretched Ranks,Hatsune Miku,Calling All Angels,Keen Engineering"`, seed 2, turn 55, 99 permanents; board in `.scratch/replays/watch-seed-2-t55.json`): no hang, count budgets on a wide board, 0.2 to 0.4 s a simulation, so a "pay {1} to draw" asked twice an upkeep took 17 s each time and one cast 43 s.
- **A planeswalker is valued without the loyalty ability it would use the turn it lands** (2026-11-16, the tooling precons, `bot:watch --decks "Open Hostility,Draconic Domination,Adaptive Enchantment,Exquisite Invention" --seed 1 --count`; probe `.scratch/precon-watch/probe-priority.mjs` on turn 24): Exquisite Invention never cast its commander, Saheeli, the Gifted, in nine turns, castable on three. The search scored the cast at +10.5 over passing and Chief of the Foundry at +12.3: a rollout passes our own seat once the cast resolves, so Saheeli's +1 (a Servo that turn, another every turn) is in neither figure, and the turn planner builds its lines from what is legal before the cast. A loyalty ability used right after the cast belongs in the cast's value, as a follow-up line or in the rollout. Measured since, it is not the rule: over one more game on each pod (`.scratch/precon-watch/usage-probe.mjs`, then `usage-report.mjs`) four of six planeswalker commanders were cast the turn they first could be (one two turns later, Estrid never in nine turns), a loyalty ability was used on 42 of the 53 turns one was on offer, and of 69 commanders of any kind two that could be cast never were. So this is a planeswalker cast losing a close call to a creature, in some hands.
- **Card draw and ramp sit in hand while the mana goes to the board** (2026-11-16, the same probe, one game on each tooling pod): 106 of the 865 cards a seat could cast at some point (17 games) were castable on three or more of its own turns and never cast. Removal, wipes and counters held are the hold floors working. The rest lean one way: draw spells (Harmonize, Escape to the Wilds, Tidings, Thirst for Knowledge, Light Up the Stage, Mulch), ramp and rocks (Oracle of Mul Daya ten turns in one seat, Burnished Hart, World Shaper, Arcane Signet in several seats), Black Market, Wrenn and Seven. A seat that spends all its mana on creatures each turn isn't wrong turn by turn; whether the bots are short of cards and mana because of it is a question for `deck-winrates.mjs --pool tooling --usage-min 3` over more games, and for the weight on a card in hand. Not a blind spot in the search: Myriad Landscape, never cracked in six turns on offer, is cracked at once when there is nothing else to pay for (`.scratch/precon-watch/probe-landscape.mjs`).
- **Neither the block arithmetic nor the played-out blocks use a creature that blocks any number of attackers** (2026-11-16, found building a scenario): Palace Guard counts as one blocker in `damageThrough` (each blocker is spent once), and the block search behind `survivesSwing` didn't make the multi-block either, so six 3/3s into a Palace Guard and a Hill Giant read as 12 through and played out as lethal. Avatar of Hope, Guardian of the Gateless and Hundred-Handed One are the same shape. No game has shown it cost a bot anything yet.
- **Dead to the whole table, a bot still taps its blockers for a cost** (2026-11-16, what the attack fix of that day left, `COMPLETED.md`, "takes the kill that keeps it alive through the next one"): an attack no longer leaves it dead to an opponent it would have lived through, but the tap guard (`crackbackGuard`) still stands down whenever every opponent together has it dead, unless it holds an out. The same rule there was built and taken out: in every position tried the bot already declined the tap, so nothing showed it mattering. It comes rarely: one changed attack in 19 judged games.
- **Grave Danger (Upgraded) won 0 of 20 in the upgraded pool** (2026-11-15, `deck-winrates.mjs --pool blitz --rounds 5`, 64 games; Abzan Armor (Upgraded) won 1 of 20): both were the weak decks already (15-17% on 2026-11-11), and twenty games can't tell 0% from 15%, but that day's attack check sends fewer attackers and Grave Danger wins by swarming (a judged game had its bot keep thirteen Zombies home, old better by 6.5). Play a longer run of that pool on the commit before `db0d65024` and after it before believing either way.
- **Why an Ur-Dragon bot left Stomping Ground tapped and then cast a Farseek isn't known** (2026-11-15, `bot:judge --kind payments`, old better by 7.1; `docs/plans/bot-next-steps.md`, step 2 "Left"): the payment was priced by a turn with no use for the mana, and a Farseek was then cast that wasn't in its hand as it was asked. It was put down to a card played off the top of the library, which the planner left out (fixed 2026-11-16, `COMPLETED.md`), but that list has nothing that plays from the top. To find: replay that game's turn.

- **What the bot audit's fixes left** (2026-11-10; every step of `docs/plans/bot-audit-fixes.md` is built, its step 5 A/B level) — each needs a design of its own (the plan's "What this plan does not take on"): opponents that respond inside a rollout and holding instants for a better moment (Q8); hidden information (rollouts read the real library order); a worker thread for bots. Also from step 5: a triggered ability's target chosen as it goes on the stack is scored by standings, edicts aren't wipes, `bot:ab` has no pairing by seed, and the five sequencing rules v2 dropped are still v1's (`controller.ts`), so still play in rollouts.

- **`legalActions` plans a payment for every activated ability it offers** (what the wide-board fix of 2026-11-15 left, `COMPLETED.md`): on `engine/data/bot-positions/seed-50-t40-b73.json` (356 permanents, about 1,700 offers) a call is 22 ms, most of it `whyCannotActivateAbility` → `payMana` once an ability, each plan setting up over every source (`planManaPaymentOrdered`, 3 s of a 13 s turn). An answer kept by cost for the sources that aren't mana sources themselves would cut it; not needed until a board that wide is slow in a live room.
- **The hold-for-value floors are hand-set and not measured** (2026-11-14, `COMPLETED.md`): reanimation at mana value four, removal at a Grizzly Bears, steals and Clones at a 3/3 for three, X at three. They fix what the user saw (Reanimate on a one-drop, Abrupt Decay at a 1/1 token); whether they hold too much hasn't been benched, and removal from an activated ability (a planeswalker's minus, Royal Assassin) and "return to hand" recursion (Regrowth at a one-drop) have no floor.
- **Seen in four watched bot games on the upgraded precons, not fixed** (2026-11-14, `bot:watch`; what was fixed is in `COMPLETED.md`):
  - *Life and blockers spent for cards at low life.* Grave Danger's bot, on 9 life, tapped six Zombies to Cryptbreaker for two cards and 2 life on its own turn (the same shape as the strong decks' Reanimate at 6). Looked at again 2026-11-15: it did so at the beginning of combat and then attacked with nothing, on a board where all nine creatures home were already short of the three opponents' attackers (so the crackback guard, which holds only what would save it, held nothing), and nobody attacked it. What it gave up was the attack; whether v1's attack, which stands in for its own in that window's rollouts, undersold one isn't known.
  - *Lifelink in the blocks a bot predicts.* What the watched Nullmage Shepherd turn left (2026-11-15; `COMPLETED.md`, "taps the lifelink blockers", `docs/plans/bot-effect-knowledge.md`): v1 counts no life gained when it decides how many chumps it needs, so as a rollout's defender it chumps more than a lifelink board has to; the block arithmetic doesn't read "can't gain life" (rule 119.7); and v2 tries the wide block only when its built blocks lose the game, not when they merely cost more than blocking wide would. (The blockers tapped on the attacker's turn are fixed, `COMPLETED.md`, "real blocks".)
  - *Matchups.* Temur Roar won its pod by round six in both plays of it (Ureni cheating Dragons in from the fourth turn; answered 2026-11-15 by making Eshki its commander, `COMPLETED.md`); First Flight and Token Triumph each lost a game to a keep with no early play or no green source. The precon pods are otherwise close: four games, four different winners.
- **Seen in two watched bot games on the strong decks, not fixed** (2026-11-14, `npm run bot:watch -w engine`; what was fixed is in `COMPLETED.md`):
  - *Life paid down to 1 or 2 for a body.* The Ur-Dragon's bot, on 6 life at a three-player table, cast Reanimate on a five-mana creature. `life` and `lifeDanger` price the five life at 7.5 against a 6/6's 8.5; below about five life any evasive attacker is lethal, and nothing bends the price there. Looked at again 2026-11-15: the cast followed the bot's own Crux of Fate, so both opposing boards were empty and `threat` read nothing; the same position with one attacker on each opposing board already holds the spell (cast −25.5 against pass −11.4). What's open is narrower: whether empty boards should make the last five life that cheap, with two opponents' hands still to come.
  - *The Y'shtola list has too few lands for a bot.* Two mulligans, a keep on one land, and two lands on the battlefield for all 28 turns, Mox Diamond held with no land to discard. The list leans on fast mana a bot doesn't mulligan for; it is the weakest of the eight to seat.
  - *Necropotence past the hand size.* Edgar Markov's bot paid 4 life on its second turn for four cards and discarded two at cleanup (Yawgmoth, Grave Pact), which Necropotence exiles. Which cards go is better since 2026-11-15 (a discard reads an engine for what it does, `COMPLETED.md`: Grave Pact is kept); left: a creature whose worth is an activated ability (Yawgmoth) has no rate and reads as its body, and nothing weighs the life against cards the hand size will take back.
  - *Worldslayer sat in Giada's hand all game*: a card the list carries that a bot has no use for.
- **A draw the bot can't decline can still deck it** (2026-11-14, what the library reserve leaves, `COMPLETED.md`): optional draws stop at fifteen cards, but a mandatory one doesn't ask — The Great Henge's on each creature cast, an Ancient Silver Dragon's d20. v2's search sees the cost of the creature spell that triggers it; v1, playing unscored on a board too wide to search, doesn't weigh a trigger its cast will set off.
- **Sylvan Library's bots** (probed 2026-11-04): v2, with Lightning Bolt, Craw Wurm and Sol Ring on top, declines "draw two additional
  cards?" at every life total tried, 10 to 1000, though it pays for a land draw at 40 or more; v1 draws but never pays 4 life, even at 1000. Why not yet looked into.
- **The as-enters menus a bot still answers with the first option** (what the 2026-11-17 fix left, `COMPLETED.md`, "searches a permanent's own short word menu"): a menu past five words (a card type among nine, a number up to ten), one answered from a hand it looked at (Arachne, Psionic Weaver), and the menus that name a player, a protector, a counter kind or a tribute. The searched menu is told apart by having none of the other menus' marks (`isEnterWordMenu`, `decisions/choose-creature-type.ts`), so a new marked menu kind has to be excluded there. v1, and so a rollout's seats, still take the first word, and riot's counter every time.
- **v1's `chooseFromZone` returns its minimum** (`controller.ts`), so that controller exiles nothing for Sutured Ghoul, which dies. v2 searches the answer and exiles them all (checked 2026-11-16, a gate scenario holds it); this is v1's alone, and so a rollout's seats'.
- **v1 prices "sacrifice a permanent" as one card whatever is sacrificed** (2026-11-15, what the echo fix left, `COMPLETED.md`): `effectWorth`'s `sacrifice-source` is a card and the source's mana value now, but `sacrifice` of something else (an edict's answer, "sacrifice a creature: …" as an effect) is still a flat card a permanent, since which one goes is chosen after the worth is read.
- **What a discard still can't tell apart** (2026-11-15, what the discard fix left, `COMPLETED.md`): read for what to keep, an engine, removal, a counterspell and the land a hand needs are above an average card. Still average: a creature whose worth is an activated ability (Yawgmoth) or a static with no rate (Boromir, Delney), an Aura (Ophidian Eye), and an untargeted instant `effectWorth` reads little of (Teferi's Protection, which Y'shtola's bot threw beside Boromir at cleanup). And v1's own discard (`controller.ts`), which answers a turn too slow to search, is by its own rule.
- **v2's turn isn't steady in mana, and v1's uses less of it** (2026-11-15; from judging payment answers by the turn v2 then plays, `docs/plans/bot-effect-knowledge.md`, "What a declined payment costs"). Two leads, one case each, not examined. On the strong decks (The Ur-Dragon, Lathril, Atraxa, Giada; count budgets, seed 1), Atraxa's bot at turn 27 with Vorinclex, Sunfall and Drown in Ichor in hand cast Vorinclex and ended the turn at −2.8; having paid Rhystic Study's {1} first it cast Drown in Ichor at Lathril instead and ended at 33.2, so with the mana for both lines it took the one its own evaluation scores 36 points worse. Rare by a first measure: over two strong-deck games, each main phase played out as it stood and with one land tapped, 1 turn of 32 ended more than 5 points better with the land tapped (Y'shtola on an 18-card hand, 7.6). And in the same game The Ur-Dragon's bot at turn 29 cast four spells having declined Smothering Tithe's {2} and two having paid it, where rollouts with v1 playing the turn on had scored the two answers alike: a rollout whose own seat is v1 (`"acting"`, which a cast payoff still switches on) under-prices mana.
- **Abrade's 1 damage is cast at a creature it can't kill** (2026-11-17, seen reading a decision diff; `bot:replay -- --seed 4 --slow 0 --quiet-before 22 --until 27`, Jeskai Striker's seat): on turn 26 v2 cast Abrade's "1 damage to target creature" at Lathliss, Dragon Queen, a 6/6, with an Island's mana left over, and on turn 22 the build before that day's polarity change did the same at a 3/3 Dauntless Escort. Not looked into: a cast payoff on its board (Baral and Kari Zev, Lier) may be pricing any spell cast above keeping the card.
- **A bot sacrifices at most down to three of a kind for an attack cost** (`SACRIFICE_KEEPS` in `combat/attacking.ts`): a heuristic, not measured.
- **72 targeted slots have no polarity rating** (of 14,304, 2026-11-17, after 27 real misses were read, `COMPLETED.md`; `target-polarity.test.ts`' ratchet, 0.52%, prints them): about 20 only read their target (Biomantic Mastery), about 33 are Roles or other attachments on a slot whose spec already picks the side (Betroth the Beast), and about 19 are left as misses. Of those, an Aura token or a fetched Aura put on an any-creature slot (Embereth Veteran, Estrid, The Rani, Twisted Fealty's second slot, Gryff's Boon) needs the Aura's own definition, so a registry pass in `offerPolarities` / `pendingTargetPolarities`; and `remove-from-combat` alone is left unrated on purpose (an `either` there cancelled the untap beside it: Reconnaissance, Spires of Orazca). A bot reads an unrated slot as `either`.

- **A bot controlling another player doesn't play their combat** (what the 2026-11-17 fix left, `COMPLETED.md`, "has them cast and activate"): `EvalStandIn` (`bot/eval-bot.ts`) casts and activates for the bot's good, but declares no attack and no block the rules don't require; sending their creatures into the bot's blockers needs the attack search run from the bot's seat on another player's creatures. Not checked: a table of more than two players, and what a controlled turn costs at the live clock.
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
- **Bots and token stacks: three tokens of one stack as three targets** (the user, 2026-10-18; what the divided-damage fix of 2026-11-15 left, `COMPLETED.md`, "divides damage to kill"). A bot's candidates now carry the shares of a divided amount, but Inferno Titan still never goes 1 + 1 + 1 at three 1/1s of one token stack: the engine refuses a stack filling two slots of one target group ("Distinct targets in one token stack", Engine rules gaps). v1's own answer still aims a divided group at one target (it is the floor v2's search starts from, and what a rollout's seats play). And a group's candidates are the best one, two, three… of the ranked targets, so the split that skips the best creature to kill three small ones is never listed (`decisions/shared/target-combos.ts`).
- **More training scenarios.** 291 scenarios gate (2026-11-17: the hand-built ones in
  `bot/scenarios.ts` and the resolved captures; ten opening hands among them since that day,
  `openingHand`). Not pinned: a one-lander with Sol Ring and Llanowar Elves, which the policy
  keeps; and `bot:fit-scenarios` hasn't been run over the opening hands. More come from live games: the in-game Capture button
  (`--capture`) saves a position to `captures/`, which `bot:scenarios` and `bot:fit-scenarios`
  read as training scenarios, as does each blunder `bot:behaviour` shows. `npm run bot:captures
  -w engine` lists them with v2's answer today; once one is fixed, `-- resolve` moves it to
  `captures/resolved/`, where it gates.
- **What the four weak upgraded decks' autopsies found in the bots** (2026-11-11; ten replayed
  losses each, `docs/plans/upgraded-decks.md`, "The four weakest decks"). None is fixed:
  - `graveyardCastable` counts a static `mayPlay`'s cards since 2026-11-17 (`COMPLETED.md`), by
    its filter and its per-turn cap; left: `scry-pick.ts`'s own `castableFromGraveyard` (a
    surveil choice) still reads only a card's own flashback, escape or `mayPlaySelf`, and the
    count doesn't read `yourTurnOnly` or a permission already used this turn.
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
- **B335's bot reads** (2026-11-18, from the overnight lane agents; none measured): for Head Games and Jester's Mask v2 picks which of an opponent's library cards go to their hand from candidates ordered best-first (`decisions/choose-from-zone.ts` ~155), so it may hand them their best; v1 names a creature type for Callous Oppressor by the whole board, not its own creatures; v2's attack search doesn't know it will choose the blocks under Invasion Plans; Mystic Barrier's left-or-right is worth nothing to the bots, so they pick it arbitrarily; the bots judge which side Rampaging Raptor's target is on by controller, so a battle the opponent protects but the Raptor's player controls reads as their own.
- **v2 gives up a permanent to keep a hand card in `exile-from-zones` choices** (2026-11-16, B333): in the Lich's Mastery and Nicol Bolas checks Carol exiled her Hill Giant over an uncastable Shock and Bob his only Forest; v1 picks the hand card. The evaluation's price on a hand card against a permanent, not the feature — judge with `bot:judge --kind answers`.

## Client / UI

One line each; the detail is in **`docs/client-gaps.md`**, under the same bold title, and the
animation follow-ups in `docs/plans/legibility-of-play.md`, "Follow-ups". When an item lands,
delete its detail there and move this line to `COMPLETED.md`.

- **B335's display gaps** — a "hexproof from" counter chip shows "H", Callous Oppressor's log doesn't name who chose, "Vecna Token" in the log against "Vecna" on the tile (`docs/client-gaps.md`).
- **B334's prompt and log wording** — a `choose-modes` answer logged as "chose mode(s) 2", Gorex's "choose X", the graveyard blitz offer, a few popup titles (`docs/client-gaps.md`).
- **Read through a couple of games' history logs, and let a finished game's full log be downloaded** (the user, 2026-11-15): go through the history tab's log for a couple of games and make sure everything reads sensibly (`client/src/ui/EventLog.tsx`); the 27 event types that printed as JSON are worded (2026-11-17), the reading for sense is not done. And add an option on the end screen of a game to download a full log, with all information revealed, not just what your seat could see (so it comes from the room's whole game, not the seat's redacted view). The History panel's "Export log" (2026-11-17, `client/src/ui/logExport.ts`) saves the log as the seat saw it, and its text and file name are there to reuse; what's left is the server sending a finished game's unredacted events, and the end screen's button.





- **The image fallback's type line leaves out supertypes** (2026-11-17, read in the code, not seen live): `CardImage.tsx`'s stand-in for a card whose image didn't load reads "Creature — Hamster" for Boo (`docs/client-gaps.md`).
- **What the scenario builder can't say yet** — stolen, transformed or face-down cards (manifested ones), turn-long effects, the stack.
- **The Pass bar sits over the rightmost hand cards** (2026-11-11): at 1366x768 their lower edges and the lowered tray's last cards are under it, so the pointer reaching them leaves the hand and the raised tray drops.
- **The scenario builder's damage cap ignores Zilortha** (2026-11-16, B333): `BuilderPanel.tsx`'s `selectedDamageMax` reads toughness, not lethal damage by power; the server refuses with the reason.
- **A deck can't name its sticker sheets** (2026-11-16, B333): the deck builder and import don't set `DeckList.stickerSheets` (rule 123.2a), so a deck with a sticker card brings all 48.
- **A trigger asked again doesn't say which one it is** (2026-11-16, the check of prompts beside other triggers): Panharmonicon's second trigger, or a Blood Artist's fifth, asks in the same words as the first; nothing counts them.
- **The scenario builder can't hold the initiative or a dungeon position** — "Edit from here" drops both (`ScenarioSpec`), so a check of them has to reach them in play.
- **Quality-of-life room options (house rules)**, opt-in per room.
- **Server-side deck save and share** (decks live in `localStorage`).
- **Save a game and load it later** (the user, 2026-11-18: "We will eventually want the ability to let players save and load gamestates so they can play one game across multiple sessions"): not started. `docs/plans/replicated-rooms.md`, "Saving a game to play on later", has the shape: a save is a state (`stateToJson`) with its seats, not a log, which only replays on the build that made it; loading is a table that starts from a state, which that plan's step 7 builds; and what nothing has yet — a format number on a saved state, a seat that outlives the tab, and a place to keep it (the device and a file, or the server under a code). A solo game's reload (`SavedLocalRoom`, IndexedDB) is already a save in all but name.
- **The game page's own rendering on a slow laptop** (2026-10-13/14): a 250-400 ms hitch when a frame's board lands on a ~50-permanent board (`Table` remounting, forced layout in `usePlayback`'s `show`); measurements and next steps in `docs/client-gaps.md`.

## Tooling / docs

- **The scaffolder doesn't read a d20 results table** (2026-11-18, B335): `N—M | …` lines draft nothing (Djinni Windseer, Druid of the Emerald Grove); a template would recur across the dice cards.
- **`exile-from-library.spec.ts` flakes at any load** (2026-11-18, B335): its tests at lines 181, 245 and 281 failed in four of the night's eleven Playwright quick runs, once with only two agents running, and passed alone each time; the 2026-11-13 run saw the same. Worth a look at what it waits on.
- **The watch page covers `bot:ab` alone** (2026-11-17, `engine/scripts/watch.mjs`): `bot:judge`, `bot:diff`, `bot:losses` and `bot:watch` play their games unseen; each needs `startWatch` in its main process and `watchGame` in its worker. The tiles show card names, not art, and the plays line is a few words an action, not the History's sentences (`client/src/format.ts`, which a script can't import). Full boards in miniature would go through rooms and the client's spectator view instead (the user chose the light page first).

- **`exile-from-library.spec.ts` times out under load** — its 4-player peel tests (lines 181, 245) failed three times on 2026-11-14 while four agents ran, and passed each time alone; a load flake in the Playwright quick set.
- **`bot:ab` runs out of worker memory** (2026-11-11): 39 of the first 40 games ended "JS heap
  out of memory" at 18 workers, with no change to the state's shape between the two builds
  (`e62e9ba2c` against the commit after it). Each worker holds two builds, so two card pools of
  32,000 definitions, under the 768 MB cap (`scripts/worker-limits.mjs`). Until the cap or the
  pools' footprint is dealt with, an A/B across commits can't be run. `bot:diff` had begun to
  lose games the same way (two of six, 2026-11-15) and now runs its six workers at twice the cap
  (`TWO_BUILD_LIMITS`), which all six finish under; `bot:ab`'s fourteen at that cap would be
  21 GB, so it is still open.
- **Verify's change selection has five coverage holes** (2026-11-10): listed in
  `docs/plans/verify-speed-audit.md` (quick mode skipping the server suite when its inputs changed,
  staged-then-edited cards, tokens and edited cards outside the fuzz stamp, `--landing`'s short list,
  background results lost on a main-chain failure); its item 8 (the engine tests typecheck beside
  the build) is the one speed-up left.
- **Confirm the box's room cap of 6 with a load test there** (2026-10-18): `MAX_ROOMS_PER_SHARD`
  went from 8 to 6 on the dev PC's measurement of the bots' one-second budget
  (`docs/plans/room-shards.md`, "The one-second budget"); run `npm run load-test -w server` on the
  box with nobody playing, as `DEPLOYMENT.md` describes, and adjust from its knee.
- **The test harness's `destroy()` leaves an Aura on a dead creature** (found 2026-10-26, batch
  208): it applies the destroy and settles, but with nothing else pending no state-based actions
  run, so an Aura stays attached to a creature already in the graveyard (Chime of Night's test
  destroys the Aura itself instead). Have `destroy()` check state-based actions after it.
- **Refresh the snapshots.** The EDHREC card-rank snapshot (`top-commander-cards.txt`) and
  `edhrec-rank.ts` are frozen (`top-commanders.txt` was refetched 2026-11-14). Re-fetching them
  moves the roster, so do it on purpose. `release-date.ts` (the library's first-printing dates) wants `npm run gen:release-dates -w engine` after each `gen:oracle` or a batch of new cards: a card it doesn't list sorts last.
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
- **The landing page wouldn't load for two and a half minutes in one E2E run** (2026-11-18, run
  44398983548 on `9f7ef7798`): `rematch.spec.ts`'s first two tests timed out on `page.goto('/')`,
  retries too, in both modes' part 3 over the same 21:25:40-21:28:10 UTC, and the third test
  loaded it fine half a minute later. The next run passed them on the same server code
  (`19b7689e7`), so not that push's change; cause not found. If it recurs, look at what Vite was
  doing (the two jobs start together, so the same clock time is the same place in the run).
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
  (2026-11-18: `engine/src/state-wire.ts`'s `stateToJson` / `stateFromJson` keep a blank a blank,
  for a state sent between devices; what still writes plain JSON, a bot capture among them, still
  loses it. The fuzzer's `MTG_REPLICA=1` met it in four four-player games of 150.)
- **Solo games in the player's browser: bug reports** (the user, 2026-10-13;
  `docs/plans/local-rooms.md`, built steps in `COMPLETED.md`): bug-report uploads from a local
  game (only a `--capture` dev server has the panel).
- **More rooms at once, and a bigger box that pays** (the user, 2026-10-13): `docs/plans/scaling-rooms.md`. **Games with people and bots on a player's device** (the user, 2026-11-17; explored 2026-11-18, that plan's "Rooms on a player's device"): a table of people costs the box almost nothing and the cap now weighs a room by its bots (`COMPLETED.md`), so what still fills it is games with both. To build: the whole room on the host's device (the direction, the user, 2026-11-18), the server passing messages; hidden cards on a player's device aren't an objection. The design is `docs/plans/replicated-rooms.md` (**in progress**; the user, 2026-11-18: "Start step 1"): a copy of the room on every player's device, the bots on the host's, the server putting the inputs in order — a player's own action then costs no network and the host's role passes on with nothing to hand over. Its groundwork and its step 1 are in (`COMPLETED.md`: the fuzzer's copy check, a state's exact form as text and its digest, names ordered the same everywhere, and recorded games identical in Chrome's, Firefox's and Safari's engines and on the test laptop). Step 2 is in too (2026-11-18: a `Room` as one copy of a game, 480 fuzzed games identical on every copy; `npm run copies:fuzz -w server`). Step 3 is in as well (2026-11-18: `tables.ts`, the recipe, the order of inputs and the host kept on main with no engine; scripted devices play a table over sockets on both hosts). Step 5 was built ahead of step 4 (2026-11-18, the user: "Step 5"): a device's own move takes effect at once and is undone if another input took its place, inputs made out of turn wait for the order, and `npm run tables:fuzz -w server` plays tables with every message racing. Step 4, the client, is in (2026-11-18, the user: "Start step 4"): a page with `?tables=1` plays a table, its worker holding the copy; two browsers and a bot play one end to end, and a player's own move reaches their screen in 13 ms at any delay where a game on the server takes the round trip. **Off by default**, so no game on the site is a table yet. Step 6 is in too (2026-11-18): the host's tab closed mid-game, the other player's page takes the bots and the game goes on, and the host's device passes the empty windows of a player whose device is gone, as a room on the server does (`tables:fuzz -- --leaves` races tabs closing and reopening). Step 7 is in as well (2026-11-18): the copies send a fingerprint of the game every 32 inputs, the server compares each with the host's and deals a copy that differs the host's state, and a device that joins late, reloads or reconnects is dealt from another device's state (5 ms where a late game's log took 307 to replay). Step 8's measure is in (2026-11-18): on the test laptop a table costs little beside a solo game (own moves about 8 ms, bots inside their second, a late reload back at the board in 4.5 s), and the run found and fixed two faults (a start pressed before a slow page's card pool was in fell back to the server; a refusal read by the wrong copy). **On by default since 2026-11-18** (the user, after playing it on the live site: "it plays very cleanly, I think it is good to push as the default"; `?tables=0` turns it off for a tab). Left, small, in `docs/plans/replicated-rooms.md`'s "The laptop": what a page on another build should do when the state's shape changed (a number on the shape, or refuse other builds), the lobby not saying whose page can hold a copy, a deploy ending a table as it ends a server game though every device still holds it, two tabs on a two-core machine being slow, and memory and frame smoothness not measured on the laptop. Also left, small: the host's bot speed and pause reach only the host's device, and the other pages aren't told of a pause. Steps 1 and 2 were the ones that decided whether the rest is built, and both held.
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
