# Optional graveyard replacements ("you may … instead")

**Status:** done (2026-11-16, author-top-cards batch 333). Proving card: Pulmonic
Sliver ("All Slivers have 'If this permanent would be put into a graveyard, you
may put it on top of its owner's library instead.'"). Need key
`replacement:graveyard-to-library-top-optional`.

## What it is

A replacement effect (rule 614.1a: "instead") on a permanent being put into a
graveyard, which its controller may take or not each time it applies. The engine
already had the mandatory forms — Gravebane Zombie's "if this creature would die,
put it on top of its owner's library instead", Rest in Peace's "exile it instead"
— all applied inside `Game.moveObject` without a question. The optional one is a
player decision in the middle of a zone change, so it can't be answered inside
`moveObject`'s synchronous call (every decision is a dispatched action).

`GraveyardExileReplacement.optional` marks it. It's read with `self` and `from:
"battlefield"` only, off the permanent's own statics — printed, or granted by a
static's `grantsStatic` ("All Slivers have …") or a `grant-static` effect —
because "this permanent" is only ever on the battlefield, and only a permanent
can wait there for the answer.

## The rules it follows

- **Who answers.** "You" on a static ability is the controller of the object
  it's on (rule 109.5), and the affected object's controller chooses among the
  replacements that would apply (616.1). So the Sliver's controller as it would
  move decides, not its owner. Pulmonic Sliver's 2021 ruling says "If multiple
  Slivers owned by one player would die at the same time, that player chooses
  …" — written for the usual case where owner and controller are one player.
- **Order.** Cards put into one position in a library at the same time are
  arranged by their owner, who doesn't reveal the order (401.4). The controller
  picks which go, in the order picked (the first on top); when the owner isn't
  the controller and two or more of their cards go to one place in their
  library, the owner then arranges them. Those are the only two people with a
  say, and each says only what the rules give them.
- **Several players at once.** Each controller is asked about all of their
  permanents in one simultaneous event, in APNAP order (101.4, 616.1), and
  nothing moves until the last of them has answered — the moves then happen
  together, as the one event they are.
- **Other replacements.** Declined, the move goes on to whatever else would
  replace it: Rest in Peace or a finality counter still exiles it, its own
  "instead" still sends it elsewhere (616.1 — the controller is choosing among
  all of them, and declining the optional one is choosing another). Taken, it
  goes into the library, where none of those apply. The question is skipped
  only where the answer changes nothing: a permanent that's exiled "if it would
  leave the battlefield" (Whip of Erebos) goes to exile from the library move
  too, and one whose own mandatory replacement already sends it to the same
  place goes there either way.
- **What happened.** A sacrifice is still a sacrifice wherever the permanent
  ends up (701.21a), so a cost is paid and "if you do" holds. A destroyed
  permanent is announced as destroyed after its move, as `destroyByEffect`
  always has, so "if it dies this way" (Saw in Half) reads where it went.
  Taken, it never dies (700.4): no dies trigger, no "whenever one or more
  creatures die" for it.
- **Look-back.** Pulmonic Sliver's ruling: the replacement "applies to Pulmonic
  Sliver and any Slivers that would die at the same time as it". A Sliver
  waiting for its answer stays on the battlefield, so its grant keeps reaching
  the rest; a granting permanent that left in the same event without being asked
  (no longer a Sliver itself) is read as it last existed (603.10a, as Rest in
  Peace gone with a wrath still exiles its victims).

## The shape

**A deferred move, as 903.9b's commander deferral is.** `moveObject` leaves the
permanent on the battlefield, queues it on `GameState.pendingOptionalGraveyardMoves`
and returns `false`. Its snapshot (`lastKnown`) is taken as the event happens and
kept for the move. `prepareForPriority` asks before state-based actions, so a
waiting permanent is never swept up by them (and they leave it alone anyway).
`decisionOutstanding` counts the queue, so a resolution parks its remaining steps
until it's answered (608.2c), and the resolution or cost that made the move goes
on afterwards. The answer is recorded on the queue; once a group (one
simultaneous event, `leaveBatch.optionalGroup`) is answered, its moves are made
in one `withLeaveBatch` seeded with what the event had already moved
(`leftWith`, `leftMoved`, `leftDied`, `leftArrivals`), and "whenever one or more
… die / leave / are put into a graveyard / into exile" is announced once for the
whole event — held until then (`holdLeaveAnnouncements`, `withGraveyardEnterBatch`'s
`hold`), for commanders' deferred moves too where the two meet.

The alternative was the dry-run pre-ask the damage and destruction orders use
(`replacementOrdersAsked`, `destructionOrderAsked`): go through the effect once
asking, then do it. It covers only the events that have a dry run (damage,
destroy); a sacrifice as a cost, a state-based action, the legend rule and every
other path into a graveyard would each need one. Deferring in `moveObject`
catches every path at the one zone-change function.

A token stack is woken into its tokens (up to `MAX_MATERIALIZED`, the bound
combat uses) so each is answered on its own: identical tokens differ only in how
many die, which is a real choice (dies triggers).

What the deferral costs is how it looks: the rest of a wrath's victims are in
their graveyards while the Slivers wait on the battlefield for the answer, though
in the rules they all left at once. Nothing reads the board in between — the
question is the only thing that can happen — and every "one or more" trigger sees
one event, so it's a matter of the picture, as it already was for a commander's
903.9b question.

**Priority** afterwards goes to whoever `prepareForPriority` was about to give it
to when it asked (the activator of a mana ability, the caster), recorded on the
group.

## The decision

**Reused: `choose-from-zone`**, with `graveyardInstead: { group, arrange? }` — the
decision Library of Leng's optional discard replacement already uses for "which
of these, and in what order" (`discardToLibrary`). min 0, max all, destination the
replacement's (`library-top`); the arrangement is `order: true`, every card
picked. The prompt comes from the engine ("Instead of into a graveyard, you may
put any of these on top of their owner's library — the first you pick goes on
top."), so the client needed no new branch: its `choose-from-zone` popup already
shows permanents (behold, `acrossZones`) and uses the engine's prompt.

## What the bots do

v1 (`HeuristicBotController.chooseFromZone`): takes every card of its own (not a
token, not another player's) when the replacement puts it in hand or on top of
its library, the most useful on top — a card it gets again; declines the bottom
of a library or exile, which serve worse than a graveyard. Arranging, the most
useful on top. v2 inherits that answer and its rollouts change it only where they
see a better one (a dies trigger worth having).

## Left out

- An *external* optional graveyard replacement ("if a creature you control would
  die, you may exile it instead") — no card in the Oracle snapshot has one.
  `optional` is read off the permanent's own statics; another permanent's would
  go in `optionalGraveyardInstead` beside the granted read.
- An optional replacement on a card leaving a zone other than the battlefield
  (Forger's Foundry's "you may exile that spell instead of putting it into its
  owner's graveyard as it resolves" is a spell, a different event).
- Past `MAX_MATERIALIZED` tokens in one dying stack, the rest are answered as one
  (engine resource safety, as combat's bound).
