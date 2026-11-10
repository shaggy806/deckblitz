# Design records

Each plan says *why* its piece is shaped the way it is. A `Status:` line at the top of each says
where it stands, and none is living documentation: the code and `docs/architecture/` are.

The index, as of the last update:

Shipped: `basic-bots` (v1 bot), `card-library-page`, `deck-builder`, `scenario-builder` (a
developer's tool: build a board from scratch, then play it — the scenario is data, and every edit
rebuilds the game in a new frozen room under the same code), `card-replacer` (reworked
onto Scryfall Tagger oracle tags), `precon-decks` (the five Tarkir: Dragonstorm starter decks and their stand-ins), `resolve-all-stack` (the one-shot "resolve the whole stack" button),
`auto-pass-interruptions` (the shared "something real happened" scan that
stops both it and auto-pass), `deck-biases` (a commander's deck reading some effects the other
way round — Teval mills itself — read off the game state by every bot).
`engine-gaps` records the engine work that unblocked most of the precons, paused with the rest
substituted. `smarter-bots` (v2, one-ply search, what live rooms seat) is the search that stays: `bot-effect-knowledge` (**in progress**) is the plan of record for the bots — v2 on an effect-aware base (which side of the table each target belongs on, a v1 that targets by it, v2's candidates ordered by it, the evaluation terms that follow, weights tuned to hand-built right answers), with v3 retired; read it before changing how a bot picks actions. `bot-v3-search` (rollout search over sampled worlds, **retired** — seated for a day, then benched, found broken and retired) records why v3 was tried and why it lost: a plan walker that cast one spell a turn, and parity at best once fixed. `token-stack-choices` (**in progress**) designs picking some members of a token stack, the last stack gap after the counting and whole-stack fixes: sacrifice N, tap costs, convoke and splitting a stack across attackers or blockers are built; choosing which of a stack proliferate touches, and naming one stack more than once for distinct targets, are not. Its "Folding back" section records how tokens split off a stack go back into one once they're identical again, as soon as nothing is waiting. `commander-replacement` records how rule 903.9 is asked (never skipped: queued when it can't be asked yet, re-asked when overwritten), the older bugs found alongside it, all since fixed, and the move from the pre-2020 replacement to the current rule, where a commander dies first and a state-based action then offers the command zone. `damage-assignment-order` (**implemented**) records that Foundations removed damage assignment order, so a blocked creature's damage is divided freely among its blockers (trample still needs lethal on each first), and how the engine dropped its `order-blockers` decision and lethal-in-order validator for it. `legibility-of-play` (**shipped**) orders BACKLOG's animation and pacing list: a frame gets a before and an after half, tile effects are CSS animations on mount, and one viewer-owned timing scale. Server-side deck save/share
is still unscoped.

`upgraded-decks` (**shipped, first pass**) records where the upgraded precons' swaps came from (EDHREC's precon pages over Moxfield's upgrade lists), the bench that measured them, and what's open.

`deck-autopsies` (**first pass done**) records the deck-against-deck win-rate run, why its v1 column is confounded, the four deck autopsies, and the bot fixes they found and left.

`tutorials` (**built** — the overlay, site tour, tutorial room and Learn Commander's two games) plans the two tutorials — Learn Commander (one or two seeded games against a scripted opponent, the lessons as chapters checked from the event log) and a site tour (coach marks over the real pages) — on a shared coach-mark overlay that blocks other clicks and a production-safe tutorial room, with the user's decisions of 2026-10-13.

`need-keys-after-the-walk` (**in progress**: tooling, model trial, and Phase 1's merge and existence check done; the recheck round next) works down the blocked records once the set walk ends: tooling (`--audit`, `--greedy`, `--brief`), a check that every record is really blocked with keys merged by family, then building in greedy order a family per session, with cheap agents for the judging and scripts for the counting.

`need-key-themes` (**plan of record**, 2026-11-07; all done by 2026-11-09) groups the 1,831 open need keys by the engine mechanism under them — object sets, declarative triggers, one duration type, cost amounts, choosers, a turn journal — and proposes a general change for each, with a build order.

`after-the-themes` (**proposed**, 2026-11-09) is the order of work once theme 15 lands: why building keys by rank stops paying (1,315 of 1,577 keys serve one card), re-attempting the top cards before building, a regression check before deploying, cutting down the manual checks, and a stopping rank for the user to set.

`bot-audit-2026-11` (**proposed**, 2026-11-10) audits the bots for speed and decision quality without changing them: measured at the live 1 s budget (24 games between the pilot's decks), on CPU profiles and with the gate run one rule off at a time, each finding checked by an independent refuter. An expired search passes rather than playing v1's move; 43% of search time goes to opponents' turns; a trigger scan on every priority event is 17-27% of an ordinary rollout; three demonstrated misplays (sacrifice fodder, the planner past the crackback guard, "payoff first"); which rules around the search still hold anything up; and where it disagrees with the other records.

`bot-audit-fixes` (**in progress**, 2026-11-10: steps 0, the tools, 1, four misplays, and 2, the clock, built and live; step 4, search that buys nothing, built: a narrower `castPayoff`, a pass memo, and a planner that keeps what a cut level paid for; step 3's parts 1 and 2, the engine's cost per tick, built: no trigger scan on the priority events and the board scans kept per mutation, 12-28% off a simulation; its part 3 too: the resolution context a plain literal, 2 ms to 5 microseconds, and an enter batch's journal snapshots taken together, a further 10-26% off; step 5, the evaluation, next) orders the audit's fixes: tools first (a clock the tests can drive, the probes as tracked scripts, fixed big-board positions), then the four small misplays, the clock, a deploy with a live test, the engine's cost per tick, search that buys nothing, and last the evaluation with the rules it would retire — each step with its change, its scenario and its check, and three choices for the user. The `bot-audit-next` skill builds the next step.

`scaling-rooms` (**planning**) plans how the server holds more rooms at once and makes use of a bigger box: measure first (a load harness, event-loop delay on `/status`), trim the one thread's work (frames with only new events), then rooms sharded across worker threads — without which a bigger box runs the same one thread — then the box, sized from the measurement, and deploys that don't end games.

`initiative-dungeons` (built 2026-10-19, but for its animation and the Forgotten Realms dungeons) designs venture into the dungeon and the
initiative — the largest engine feature left in the set walk (Baldur's Gate's ~21 initiative cards,
Forgotten Realms' venture cards): dungeons as command-zone objects with hand-authored rooms, two
new decisions, sourceless triggers (with the monarch moved onto them — today it skips the stack),
and the client's initiative chip, dungeon progress chip and map, and room picker on the map.

`room-shards` (**live**, `SHARDS=1` on the box since 2026-10-13) is phase 2 of `scaling-rooms` in detail: rooms on worker threads, the main thread loading no engine, the main↔shard message protocol, memory per worker, placement and admission, and the commit-by-commit rollout.

`local-rooms` (**built**, on by default on the site since 2026-10-13) moves solo games — blitz and the tutorials, one human against bots — into the player's browser: the same room code in a Web Worker behind a local transport, the engine's game and bots without the whole card pool, resume after a reload, bug reports uploaded; games with two humans stay on the server.

`decision-registry` records how the decision kinds (19 then, 20 with `cast-now`) became one module each under
`engine/src/decisions/`, and why `game.ts` stays binary to git.

`fan-content-policy` (**shipped**) records what Wizards' Fan Content Policy and Scryfall's image
terms ask of the site, the notice and art credits that answer them, the name kept free of Wizards'
trademark ("Deck Blitz"), and the user's call on whether a playable game is fine (yes, as a free
deck tester rather than competitive matchmaking) with what would reopen it.

`lightsail-migration` (**shipped**) moves the live site off the home box onto AWS Lightsail and
from `mtg.tobyens.com` to deckblitz.net: Cloudflare and the tunnel stay, why the instance needs
2 GB, what burstable CPU does to the bots' time budget, players' saved decks not following the
domain, the cutover order, and how deploying changes.
