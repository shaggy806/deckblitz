# Restarting the game (rule 727)

Status: done — 2026-11-16, for author-top-cards batch 333 (Karn Liberated, EDHREC 7155; a core-rule
change the user approved that day). Engine, server, client and the bots.

Karn Liberated's −14 is the one effect in Magic that restarts the game (727.1: "One card (Karn
Liberated) restarts the game"): "Restart the game, leaving in exile all non-Aura permanent cards
exiled with Karn. Then put those cards onto the battlefield under your control." This records how
the engine does it, and why it's shaped that way.

## The rules it follows

- **727.1** — the game ends at once; nobody wins, loses or draws it. Every player *in that game when
  it ended* starts a new one by rule 103. A player who had already left (lost, conceded) isn't in
  it (800.4a; the Karn ruling "any player who left the game before it was restarted … won't be
  involved in the new game").
- **727.1a** — the starting player is the player who controlled the restarting effect. No highroll.
- **727.2** — every Magic card involved in the old game is in the new one, wherever it was, phased
  out included; a card brought in from outside the game is now part of its owner's deck (the Living
  Wish example). Ownership doesn't change.
- **727.3** — a player with fewer than seven cards drew from an empty library and loses when
  state-based actions are first checked, whatever mulligans they take.
- **727.4** — the effect finishes resolving just before the first turn's untap step: its other
  instructions ("then put those cards onto the battlefield") happen then, with no player having
  priority, and what they trigger goes on the stack in the first upkeep.
- **727.5 / 727.5a** — an exempted card isn't in its owner's deck as the new game begins; a
  commander exempted stays out of the command zone but remains that deck's commander.
- **103.2c, 103.3, 103.4, 103.5 (and 103.5c), 103.6, 103.8a** — the new game's pregame: commanders
  into the command zone, libraries shuffled, starting life, seven cards and mulligans, the opening
  hand's actions (Leylines), and a two-player game's starting player skipping their first draw.
- **607.2a** — Karn's +4 and −3 are linked to its −14: only cards exiled *by this object* count. A
  Karn that left the battlefield and came back is a new object (400.7) with nothing exiled with it.
- The rulings: commander tax and commander damage reset; counters and emblems are gone; "no actions
  taken in the game that was restarted apply to the new game" (Stigma Lasher's effect doesn't carry
  over); the permanents Karn puts onto the battlefield have been under its controller's control
  since their first turn began, so they can attack and tap that turn; one that entered tapped
  untaps in that untap step.

## The shape

**One effect, done after its resolution.** `restart-game` (`effects.ts`) has `leaveInExile: {
filter }` (over the existing `"exiled-with-source"` set — an `exile`'s `linked: true`, and a
`look-and-choose` to exile, which links by default) and `thenOntoBattlefield`. Resolving it only
records `GameState.restartPending` (the controller, the source's name, the exempt cards as read
now); `Game.endResolutionIfDone` runs `Game.restartGame` once the resolution is wholly over.
Restarting inside the effect would leave the old game's resolution — the ability leaving the stack,
`ability-resolved`, the suspended-resolution bookkeeping — running on the new game's state. What
happens in between belongs to the old game, and nothing of it survives. The effect must therefore
be its ability's last instruction; its "then" is part of the effect rather than a following
instruction, because 727.4 moves that "then" past the whole pregame (mulligans are decisions,
which a resolution can't be held open across).

**The state is rebuilt in place, not patched.** `GameState` has well over a hundred fields, many
optional and added by later features; resetting them one by one would leave behind whatever the
next feature adds. `restartGame` builds a fresh state with `createGameState` (`state.ts` — the
literal `Game.create` used, moved there so both share it), copies across only what belongs outside
the game, deletes every key of `this.state` and assigns the fresh one into the same object (the
`Game`'s decision context holds that object, and a bot's simulation clones it like any other).
What carries over:

- the seating (`turnOrder`), the rules, the seed and the random stream's position (determinism:
  same seed and controllers, same restart);
- the event log and its sequence numbers, so the server's frame deltas and every seat's log go on
  as one log; `publicStints`, each old object's open stint closed at the restart, so the log still
  names the old game's cards;
- `timestampSeq` and `nextObjectSeq`, so no new object or timestamp collides with an old one;
- the sideboards (`outside`, rule 400.11a — still outside the game);
- each player's `printings`, `commanderIdentity` and `commanders` (facts about the deck);
- a player who had left, as they left: lost, with the life and counters they lost with, no cards.

Every card is a **new object** (400.7), made by `makeCardObject`: the old objects are gone, so
nothing that remembered an object id — a delayed trigger, a replacement, a bot's memory, a
client's animation — can reach into the new game by mistake. The cards are collected from every
zone list (libraries, hands, graveyards, the battlefield, the stack, exile, the command zone,
phased-out, Attraction decks and junkyards), with each other card of a merged permanent (730.3)
or a melded one (712.21); tokens, copies of cards or spells, emblems and dungeons are not cards.

**Commanders** are the cards flagged `isCommander`, and — new — each player's deck's commanders by
name (`PlayerState.commanders`, recorded at setup), for a commander card a merged permanent
scattered without its flag. They go into the command zone, unless exempted (727.5a: then into
exile, still flagged, and onto the battlefield with Karn's "then"). An exempted commander was never
"put into" exile in the new game, so 903.9a's choice isn't offered.

**The pregame is the game's own** (`GameState.pregame`, recorded by `Game.create`): mulligans or
not, shuffled or not (a test's unshuffled deck stays in order), companion reveals or not, and which
rules `Game.create` settled from the number of players. Those are settled again for the players the
new game begins with (100.1b: a multiplayer game is one that *begins* with more than two): a
four-player game down to two restarts as a two-player game, its starter skipping the first draw
(103.8a), and its first mulligan no longer free (103.5c). Starting life, hand size and the rest
are the room's rules as they were. `playersInGame` keeps a player who had left out of the deal, the
companion reveals, the mulligans and the opening-hand actions — none of which had to consider one
before, since nobody has left at a game's start.

**727.4's "then"** is `GameState.restartHeld`, read where the pregame ends
(`beginOpeningHandActions`, after the Leylines): the cards enter together under the restarting
player, each making its "as this enters" choice first (`askEnterChoice`, parked as the
`PendingEntry` `"restart-held"` — Cavern of Souls' creature type is asked of Karn's controller at
turn 0), then `beginTurn`. That player is the starting player, so the untap step of their first
turn clears summoning sickness and untaps them, as the rulings say, with no special case.

**727.3** needs nothing: the opening draws are real draws, and a draw from an empty library sets
the flag. State-based actions aren't checked while the mulligans wait on a decision, so nobody
loses before the pregame is done — which matters: a kept Platinum Angel arrives first and its
controller doesn't lose. The engine checks the flag as the first turn's untap step ends rather than
in its upkeep (its `tick` checks every step); nobody has priority in between, so nothing can tell
the two apart.

## Server, client and bots

- **Server.** The `Room` and its `Game` carry on: the same seats, connections, frames and log. The
  bots answer the new game's mulligans through the same `nextBotDecider` path as at the start. A
  seat's auto-pass (`AutoPassUntil`) and stop key (`stepKey`) now carry the game's `restarts`
  count: an auto-pass armed in the old game ends at the restart, since "until my next turn" counted
  in old turn numbers would otherwise have carried the seat through its own new turns. The
  scenario builder can link a card in exile to a permanent (`ScenarioCard.exiledWith`), and its
  boards restart with seven cards and mulligans as a room's game would.
- **Client.** `PlayerView.restarts` keys the game screen with the room's `gameNumber`, so a restart
  starts it afresh exactly as a rematch does: the playback seeded from the new game's first frame
  rather than animating the old board into the new, and no old panel left open. The first-player
  toast says who restarted the game and with what; the log line reads "… restarts the game with
  Karn Liberated: a new game begins, … first".
- **Bots.** Nothing new: the mulligan and opening-hand decisions are the ones they already make,
  and v2's search simulates the −14 like any other effect. Their per-game memory (held plays, pass
  memos, turn plans) is keyed by turn number and object ids; the ids are all new, so a stale entry
  matches nothing.

## What it leaves out

- **Subgames (727.6)** and the **limited range of influence** option (727.7): the engine plays
  neither, so neither can be restarted.
- **A restart with further instructions after it.** Karn's "then" is the effect's own field; a
  hypothetical card with another instruction after "restart the game" would need that instruction
  carried across the pregame. No such card exists.
- **Sideboarding between the games** isn't offered — correctly: the rulings say players can't move
  cards between their deck and sideboard before the new game.
- **Sticker sheets, conspiracies, planar decks** (103.2d–e, 103.7) aren't modelled by the engine at
  all.
- The engine's existing shortcut of asking every mulligan **in parallel** rather than in turn order
  (`Game.beginMulligans`) applies to the new game as to any other.
