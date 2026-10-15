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

**419 of the 500 most-played commanders are implemented** (`top-commanders.txt`; re-mark with
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
  attached to a player, or moved to an opponent).
- **Most-needed features overall** (commanders needing each): `cost:sacrifice-multiple`,
  `effect:missing-tokens`, `decision:choose-from-zone-extensions`,
  `effect:cast-during-resolution`, `effect:attach-extensions` (5 each), then
  `decision:variable-target-count`, `decision:choose-permanent`,
  `replacement:mana-pool-emptying` (4 each). Orvar needs `decision:choose-permanent` and
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
  untriaged cards by rank: rank 7181 on. Batches run 4-5 agents, ~30 cards each, with the
  leading features built alongside in worktrees. The nine other starter precons' 29 stand-ins
  (`engine/data/sweep-3/PC-*.json`) go as their originals land.
- **Build what blocks the most.** Every card triaged so far needs engine work. Leading now
  (`npm run cards:needs -w engine -- --rank`, cards waiting and fully unblocked):
  `effect:attach-extensions` (20, 13), `cost:remove-counters-from-chosen` (16, 9),
  `zone:graveyard-cast-permissions` (16, 10), `mechanic:rad-counters` (15, 13),
  `decision:variable-target-count` (14, 11), `effect:repeat-process` (13, 12)
  (`neededCards-features.md`, "Open: the card backlog"; the cheap recurring blockers are in
  `docs/card-blockers.md`, "Open leads"). The recheck list of cards whose recorded needs have
  all been built is `cards:needs -- --stale` (High Score, Winding Constrictor, Pir, Solid
  Ground and Doc Samson after the additive counters each need more).
- **Cards banned in Commander for power: 16 left, each blocked** (`B52.json`). Balance, Channel,
  Emrakul, the Aeons Torn, Erayo, Fastbond, Flash, Hullbreacher, Iona, Leovold, Limited
  Resources, Nadu, Sundering Titan, Sylvan Primordial, Time Vault, Trade Secrets and Yawgmoth's
  Bargain each wait on a feature of their own (`docs/card-blockers.md`).
- **Now: set by set, whole sets, newest first** (the `author-by-set` skill; the user's call
  2026-10-14, after the walk took each set's top half): every Commander-legal first printing,
  ranked ones first. **First, the rest of the sets already walked** — Lorwyn Eclipsed (ECL,
  100 left) back to Bloomburrow, about 1,050 cards (`npm run cards:sets -w engine -- --sets
  30`; DRC, DSC and BLC too; Reality Fracture, FRC, The Hobbit, both Marvel Super Heroes sets,
  both Secrets of Strixhaven sets, Teenage Mutant Ninja Turtles and Lorwyn Eclipsed Commander
  are whole) — then
  Assassin's Creed and Outlaws of Thunder Junction onward. Leading blockers now:
  `npm run cards:needs -w engine -- --rank` (attach extensions, X targets). Batches run 4-5 agents
  with more cards each; features build in parallel worktrees. Batch 68's blockers are one or
  two cards each; `effect:manifested-this-way` (Valgavoth's Onslaught, Weight Room) is the only
  one with two. Norman Osborn still waits on granting mayhem and on a graveyard-cast cost
  reduction, Ojer Pakpatiq on granting rebound, Ninja Teen on granting sneak to graveyard cards.
  About 50 more Secrets of Strixhaven preparation cards below its threshold can be read now
  that prepare is built (`card:scaffold` drafts them).
- **Cards manifest and cloak may have unblocked** — recheck each: `docs/card-blockers.md`,
  "Open leads".
- **Lord of the Nazgûl's "protection from Ring-bearers" is still inert** (found 2026-10-14): it was
  left out because nothing made a Ring-bearer, but the Ring tempts you now (7779cae6), so the card
  runs inaccurately. Author it (`filter.ts` has `ringBearer`) or pull the card.
- **Wayta, Trainer Prodigy's cheap fight can lose a target it shouldn't** (found 2026-10-15): "costs
  {2} less if it targets two creatures you control" is split into two abilities, the {G} one
  requiring its second target be yours, so a creature that changes control in response leaves the
  fight undone where the printed "another target creature" stays legal. Needs
  `cost:ability-cost-reduction-if-targets` (spells' `targetCostReduction` for activated abilities;
  Raft Security Officer waits on it too), or pull the card.
- **Enter the God-Eternals gains a fixed 4 life**, not "life equal to the damage dealt this way":
  wrong beside Torbran, Gratuitous Violence or prevention. It needs the damage actually dealt as an
  amount (`new:damage-dealt-this-way`).
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

- **At most 100 tokens of one stack can block** (509.1a): `Game.MAX_MATERIALIZED` still caps a *blocking* stack.
- **A mandatory loop that asks a choice each round still throws instead of drawing** (104.4b, 732.4): one whose every round asks a target or a "you may" still hits the crash guards (the room stops that game).
- **Blitz, sneak and web-slinging are offered only from the hand and the command zone** (702.152a, 702.190a, 702.188a).
- **A multi-target flicker's leaves aren't one batch** (603.2c; Brago, Eerie Interlude) — matters once a batched leave trigger exists (Aang, Airbending Master).
- **A mana restriction reads the spell before it's cast** (Jasmine Boreal of the Seven waits).
- **Suspend's time-counter triggers don't use the stack** (702.62a).
- **"Whenever a creature you control deals combat damage to that player this turn"** (Great Train Heist).
- **"Whenever this Equipment becomes unattached from a permanent"** (Grafted Exoskeleton).
- **A card's own "if this would be put into a graveyard from anywhere … shuffle it into its library instead"** (Blightsteel Colossus).
- **A set rule on a graveyard choice** (Lively Dirge's total mana value 4 or less).
- **Delve and convoke together on an {X} spell** (Chord of Calling under Teval).
- **The least X a top-of-library cast allows is searched only up to the mana a player can make.**
- **Not modeled**: battles, dungeons/Initiative, banding, Companion, snow sources, word-replacing text change (612.2).
- **An O-Ring's return is a triggered ability, not rule 610.3's one-shot effect.**
- **End-step token removal resolves without the stack** (603.7, 701.21a).
- **Replacement order is chosen for the affected player, never asked** (616.1).
- **Two opponents' Notion Thieves aren't ordered by the drawing player.**
- **Toxic's last two shapes** (Skrelv, Defector Mite; Skrelv's Hive).
- **Pool cards the no-engine-work pass (2026-10-04) found sharing a blocked shape** — Will of the Jeskai, Kwain, Forced Fruition, Ruric Thar, Spellshock, Magebane Lizard, Black Mage's Rod.
- **Static-effect dependency ordering** (613.8) beyond layer 4's type grants.
- **The rest of leaving the game** (800.4c, 800.4g–h).
- **Dividing among targets: what's left** — an X total, distributing counters.
- **A token copy isn't asked its "as this enters" choice.**
- **`sacrifice-all-but` always keeps the most it may.**
- **Proliferate over a token stack** gives every member a counter.
- **Distinct targets in one token stack** can't take two tokens of one stack.
- **"Its controller may search" always searches** (Path to Exile, Assassin's Trophy, Ghost Quarter, …): a `may` asks the effect's controller, not that player.
- **A Saga's chapter ability doesn't remember which Saga it came from** (The Aesir Escape Valhalla): once the Saga leaves, "the exiled card" reads nothing.
- **A spell cast this turn forgets where it was cast from** (latent; Surge of Brilliance waits on it): `cast-this-turn` with a `castFrom` filter matches nothing.
- **A source's chosen colour or number isn't read from last-known information** (latent).
- **A "trigger-object" that blinks is still found** (400.7): Atarka's double strike lands on a Dragon Cloudshifted in response.

Latent: the engine departs from the rules here, but no pool card reaches it yet. Fix each
when a card that needs it is authored.

- **Counters put as a cost skip counter replacements and prohibitions.**
- **Convoke with a target-dependent cost.**
- **A ceased token's last-known information lasts only the turn** (`ceasedTokens`).
- **A `{T}` ability granted to a token stack taps the whole stack** without splitting one off.
- **Convoke with a choice of additional costs** (`castableAt` passes no `costOption`).

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
- **The "think longer" checkbox is a trial** (the user, 2026-10-14): Settings' "Think longer — up to 1 s a decision" (`set-bot-think-long`, `room.ts`'s `BOT_LONG_BUDGET`), offered only where a room's thinking holds up no one else — a game in the browser, or a server started with `--long-bot-thinking`. It changes only decisions the 300 ms cut short (wide boards, slow machines). Remove it, or keep it, once tried.
- **The autopsies' open bot items** (`docs/plans/deck-autopsies.md`, "Left"): token payoffs
  beyond engines (sacrifice outlets, leaves-the-battlefield); premium removal fired at weak
  targets past the first two rounds.
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

- **A forced look-and-choose still asks**: Yuriko's and Dark Confidant's "reveal the top card and put it into your hand" open a one-card picker with nothing to choose (`look-and-choose` with `count`, `min` and `max` 1); it could take the card unasked.
- **The top strip still clips the phase track at 1024 wide** (2026-10-06 UI review): with bot speed moved into Settings every step shows at 1366, but at 1024 the track stops at EC.
- **A gift's opponent is asked one opponent at a time** — one prompt naming every opponent would read better.
- **What the scenario builder can't say yet** — stolen, transformed or face-down cards (manifested ones), turn-long effects, the stack.
- **One art-crop primitive** — the art lookup is repeated in six components.
- **Large live mana amounts by hand** — a count picker past 22 splits; choosing what floats.
- **Quality-of-life room options (house rules)**, opt-in per room.
- **Server-side deck save and share** (decks live in `localStorage`).
- **The library and the deck builder load every card definition** (~6.3 MB at 12,089 definitions); the user's first-visit stall was two of the 32 shard requests never answering (the bar at 94%, 2026-10-14); such a shard is now asked for again, but why a request hangs is not known.
- **"Same for all" covers only a trigger's yes-or-no "you may".**
- **Copied triggers without targets aren't condensed on the stack** (the user, 2026-10-07): Scute Swarm's, for example.
- **What the site must disclose under Wizards' fan content rules** (the user, 2026-10-11): analyze what deckblitz.net has to show to comply with WotC's copyright / Fan Content Policy (notices, attribution, where they go).
- **Two tutorials: how to play Commander, and how to use the site** (the user, 2026-10-11/12): planned in `docs/plans/tutorials.md`, the user's decisions (2026-10-13) at its end; what's built is in `COMPLETED.md`. Next: the seeded decks and game 1's chapters (plan phase 4).
- **Remove the entrance animation options from the settings panel** (the user, 2026-10-13): the "Card entrance" row (`client/src/ui/MotionControl.tsx`, `castEntrance` in `game/motionPrefs.ts`).
- **The site should default to slow bots and slow animations** (the user, 2026-10-14): so people getting used to the site aren't overwhelmed by the speed. The defaults behind Settings' bot speed (`client/src/ui/botSpeeds.ts`, the room's `botSpeed`) and animation speed (`client/src/ui/MotionControl.tsx`, `game/motionPrefs.ts`).
- **The game page's own rendering on a slow laptop** (2026-10-13/14): a 250-400 ms hitch when a frame's board lands on a ~50-permanent board (`Table` remounting, forced layout in `usePlayback`'s `show`); measurements and next steps in `docs/client-gaps.md`.
- **A wordy card's rules text is illegible in the hand** (the user, 2026-10-15): the hovered hand card shrinks long text until it can't be read (The Dawning Archaic); no fix in mind yet.
- **Animation follow-ups** (re-measure bot speeds, static buffs, library put-backs, the exile filter, the crown's flight, merged tokens, folding tokens with counters, dies-trigger pulses, history highlights, real sounds): `docs/plans/legibility-of-play.md`, "Follow-ups".

## Tooling / docs

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
