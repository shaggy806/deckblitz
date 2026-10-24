# Engine rules gaps

The detail behind `BACKLOG.md`'s "Engine rules gaps": where the engine departs from the
Comprehensive Rules (`docs/rules/`), or can't yet express something real cards need, with the
rule number, the code that does it today and the cards it blocks. `BACKLOG.md` keeps one line
per gap under the same bold title; when a gap closes, delete it here and move its
`BACKLOG.md` line to `COMPLETED.md`.

- **"Until end of turn, whenever …" is a granted trigger, not a delayed one.** Rule 603.7c: an
  effect that says "until end of turn, whenever [event], [effect]" creates a delayed triggered
  ability with a duration — it belongs to no permanent, so nothing that happens to its source
  ends it. Dovin, Grand Arbiter's −1 (`pool/dovin-grand-arbiter.ts`) is authored with
  `grant-triggered` on Dovin itself, which matches only while Dovin keeps its abilities and its
  controller. The fix is a `delayed-trigger` whose `at` is an ordinary `TriggerSpec` for the
  rest of the turn (a watch like `DelayedUnblockedWatch`, checked in `detectTriggers`), then Dovin
  moved onto it. Blocks Mountain Titan ("until end of turn, whenever you cast a black spell"),
  Gaze of Pain and Battle Cry (B136, `effect:delayed-trigger-rest-of-turn`). Found by an
  authoring agent, 2026-10-21.
- **Phyrexian mana is paid with life only when mana can't pay it.** Rule 107.4f lets a Phyrexian
  symbol be paid with one mana of its colour or 2 life, the player's choice. `mana-payment.ts`'s
  pip resolution (`resolveHybridCost` and `resolveReducedTwobrid`) pays 2 life for a Phyrexian pip only when no mana can
  pay it, and `Action` has no way to ask for life instead — so a player can't keep mana open by
  paying life, and a compleated planeswalker (702.150a) is never cast with life while mana could
  pay. **Fix (outline):** a `phyrexianLife: n` on the cast and activate actions (how many pips
  to pay with life), honoured by the planner first, offered by the client beside the convoke
  picker.
- **A mana ability can't read what its cost sacrificed.** `{ manaValueOf: "sacrificed" }` works
  for a spell's additional cost (Metamorphosis, Burnt Offering) but a mana ability — which
  resolves at once, never on the stack (rule 605.3) — reads 0, so Priest of Yawgmoth ("{T},
  Sacrifice an artifact: Add an amount of {B} equal to the sacrificed artifact's mana value")
  makes no mana. **Fix (outline):** record the cost's sacrificed objects on the mana ability's
  activation the way a spell's are, before its amount is read. Found 2026-10-21 (B131).
- **A source of damage is chosen only among permanents and spells.** Rule 609.7a also allows
  any object an ability on the stack, a waiting replacement or prevention effect or a delayed
  trigger refers to (a creature that died with its "deals damage" trigger on the stack), and a
  face-up object in the command zone. `chooseDamageSource` (game.ts, the
  `prevent-damage-from-chosen-source` effect) offers the battlefield and the stack's spells only,
  and the client's stack can pick only a spell. **Fix (outline):** offer each stack ability's
  source when it isn't on the battlefield, and let the client pick it by clicking that ability's
  stack entry. Circles of Protection, Reverse Damage, Healing Grace.
- **Blitz, sneak and web-slinging are offered only from the hand and the command zone.** The same
  limit holds for sneak's and web-slinging's offers (`legalActions`' sneak and web-slinging loops,
  rules 702.190a and 702.188a allow any zone a card may be cast from). `Game.blitzCostOf` gates on
  those two zones, so a blitz card another permission lets you cast (an impulse exile, a
  graveyard grant, the top of a library) isn't offered its blitz cost there, though rule
  702.152a allows it. Henzie's discount also moves only a cost's generic number, never an `{X}`
  (no blitz cost in the pool has one yet).
- **A mana restriction reads the spell before it's cast.** `ManaRestriction.spell` is matched
  against the card in its pre-cast zone, so an ability a static grants a spell as it's cast
  (Abaddon the Despoiler's cascade) is missed: Jasmine Boreal of the Seven's "only to cast
  creature spells with no abilities" (her ruling) would wrongly pay for it. She waits on it
  (`cost:mana-restriction-at-cast` in the gaps JSON).
- **"Whenever a creature you control deals combat damage to that player this turn"** — a
  delayed trigger lasting the turn, keyed on a target player (Great Train Heist's third mode),
  and "if it's your combat phase" as a condition (its first). `DelayedCombatDamage` watches one
  creature only.
- **A set rule on a graveyard choice**: "up to two creature cards with total mana value 4 or
  less" (Lively Dirge's second mode). `together` exists only on a library search
  (`zone-choice-together.ts` takes a new rule cheaply, and the clients already read it).
- **Delve and convoke together on an {X} spell.** `xCost.maxX` is the better of the two alone
  (`xPlanFor`), so Chord of Calling under Teval, Arbiter of Virtue can't reach the X both would
  pay together, and its offer's convoke proof and delve ranges are each worked out without the
  other. Needs a joint plan: convoke the creatures, delve the rest of the generic.
- **The least X a top-of-library cast allows is searched only up to the mana a player can make**
  (`libraryTopMinX`, ceiling `manaCapacity`): an {X} spell that convoke or delve could pay up to
  Glarb, Calamity's Augur's mana value 4 isn't offered from the top.
- **Not modeled.** Battles, dungeons/Initiative, banding, Companion, snow *sources* (snow mana
  is generic), and text change that replaces words (612.2: Artificial Evolution, Mind Bend, Magical Hack, New Blood — a rework
  of the card format the user ruled not worth one cycle of cards, 2026-10-09; exchanging text
  boxes, 612.5, is built). ROADMAP's Phase 10 deferred these as large or niche. None of them
  blocks ordinary Commander play. The alt-cast long tail left by Phase 6 (retrace, Warp,
  Bestow, Prototype, …) is in AUTHORING §15 and the limitation ledger.
- **Replacement order is chosen for the affected player, never asked.** Rule 616.1 has the
  affected player (or the controller of the affected object) order the replacement and
  prevention effects that apply to one event. The engine picks the order best for them, as
  Arena does, instead of asking: damage the least dealt (then the fewest shield points spent,
  `Game.bestDamageOrder` over every order of the doublers, pluses, at-least raises, prevent-alls
  and prevention shields), counters the most +1/+1 and the fewest -1/-1 (`Game.counterTotal`:
  a "that many plus one" before a doubler, or after it for -1/-1), and a life gain turned to
  loss (Tainted Remedy) before anything grows it, a prevented one before both. A player who
  wants the worse result — more damage to their own creature for a "dealt damage" trigger, more
  -1/-1 counters for a persist loop — doesn't get it. Asking needs a decision in the middle of
  `dealDamage`/`addCounter`, which are synchronous at every call site. Only Feather's exile
  beside another exiling replacement asks today. There is also no damage redirection to a
  third object.
- **Two opponents' Notion Thieves aren't ordered by the drawing player.** At a table of three
  or more, when Thieves controlled by different opponents could each take a draw, the drawing
  player chooses which applies first (the ruling), which decides who ends up drawing;
  `Game.drawRedirectFor` takes the opponent first in turn order. Asking needs a draw that can
  stop mid-effect for a decision (`drawCard` is synchronous at every call site).
- **Toxic's last two shapes.** "Gains toxic N until end of turn" (no modifier carries toxic —
  Skrelv, Defector Mite, which also needs hexproof from a colour) and a static scoped to
  "creatures with toxic" (Skrelv's Hive: toxic is folded in the layer such a scope would have
  to wait for).
- **Pool cards the no-engine-work pass (2026-10-04) found sharing a blocked shape.** Each reviewer
  flagged these while blocking a new card for the same reason; none was re-run, so check each:
  - `each-player-may` holds only discards and sacrifices until every player has chosen (rule
    101.4, `GameState.heldChoices` — batch 109); anything else a player chose is still done before
    the next is asked: Will of the Jeskai's wheel mode, Kwain, Itinerant Meddler's draw. Snort,
    Ruin Grinder (a whole-hand discard and draw), Tempt with Discovery (searches) and Innocent
    Traveler ("if no one does") stay blocked on it.
  - `attach` to a "created" token picks one when a doubler makes two (Black Mage's Rod).
- **Static-effect dependency ordering** (rule 613.8) is implemented only for layer 4's additive
  type grants (Kudo beside Mishra's Factory, `characteristics.ts`). Every other layer applies
  its statics in timestamp order only.
- **The rest of leaving the game** (rule 800.4). 800.4a is modeled (`leaveGame`), and so is
  800.4m (a duration tied to a departed player's next turn lasts until it would have begun).
  Not yet: a decision a departed player would have made (800.4g–h: another player makes it),
  and an effect ending that hands a permanent back to a departed default controller (800.4c:
  it's exiled instead).
- **Dividing among targets: what's left.** A spell's and an ability's fixed "N damage divided as
  you choose" are built (`divided`, the `division` answer). Not yet: an X total (Fire Covenant),
  and "distribute N counters among" in general (Lathiel; Earth Crystal's "two counters among
  one or two" runs through a `target-chosen` conditional). See `neededCards-features.md`,
  "Unbounded targeting".
- **A token copy isn't asked its "as this enters" choice** (a token copy of Clone, Morophon or
  Urza's Incubator), though the gaps list marks `bug:as-enters-choices-any-entry` built. See
  AUTHORING §15.
- **Proliferate over a token stack.** A stack is one proliferate entry and every member gets the
  counter; choosing some of them isn't built. See `docs/plans/token-stack-choices.md`.
- **Distinct targets in one token stack.** An "another target" relation (`distinctTargets`, an
  `any-number` group) names a stack once (`otherSlotConflict`, `slotOptions`), so "two target
  creatures", Terastodon's three, Curse of the Swine's X or Pest Infestation's up to X can't take
  two tokens of one stack (five Treasures in one stack are one target). Needs the relation checks
  to allow a repeat up to `stackCount` and a client control for picking a stack more than once.
  See `docs/plans/token-stack-choices.md`.
- **A merged permanent's token status is its own object's.** Rule 730.2d: a merged permanent is a
  token only if its topmost component is. `GameObject.isToken` stays the original object's, so a
  card mutated on top of a token still reads as a token ("nontoken creature" filters, token
  counts), and a token mutated on top of a card as a card. Leaving the battlefield is right either
  way: each card component goes to the zone and each token component ceases to exist
  (`scatterMergedComponents`). A token-ness read through `merged` would close it.
- **A granted leaves-the-battlefield trigger doesn't look back for its grant.** Rule 603.10a:
  a leaves-the-battlefield ability triggers on the game as it was just before the event. A
  conditional `grantsTriggered` ("as long as you control a Cleric, this artifact has 'Whenever a
  creature you control dies, …'") is read after the move, so when the dying creature was the one
  meeting the condition the ability doesn't trigger — Relic Vial's ruling says it does (batch
  114, blocked as `trigger:conditional-grant-look-back`). A dying creature's *own* granted dies
  trigger is fine: the leave snapshots it first (Expedition Diviner).
- **"Enters untapped" always beats "enters tapped".** When an enters-the-battlefield replacement
  that makes a permanent enter untapped meets one that makes it enter tapped, the engine applies
  the untapped one last, so the permanent enters untapped (`game.ts`, where the enters
  replacements fold — the comment there assumes the untapped effect is the entering permanent's
  own controller's). Rule 616.1 gives the entering permanent's controller the order. Archelos,
  Lagoon Mystic (batch 113) reaches every player's permanents, so on an opponent's permanent with
  its own "enters tapped" the engine makes that player's choice for them — the one they'd make
  almost always, which is why the card is authored. A choice asked of the controller would close
  it.
- **A granted ability's dynamic filter is fixed when it's granted.** `bindDynamicCompares`
  (`effects.ts`) binds every `{ amount }` operand in an effect as it applies, skipping only the
  keys under which an effect nests another (`NESTED_EFFECT_KEYS`) — and `ability` (a
  `grant-activated`/`grant-triggered` effect's granted ability) isn't one, nor is an emblem's
  `triggered`. So a granted ability's target filter like "power less than **this creature's**
  power" is read once, at grant time, against the granting source. Firja's Retribution's chapter II
  ("Angels you control gain '{T}: Destroy target creature with power less than this creature's
  power'") is blocked on it (`effect:grant-activated-dynamic-target-filter`, batch 112); no pool card
  has such a filter yet. The fix is likely adding those keys, after checking that a granted
  ability's targets bind against its own source when it's activated or triggers.
- **`deals-damage` fires once per recipient.** Its docs say so on purpose, but an unqualified
  "whenever ~ deals damage" triggers once per simultaneous damage event, however many things it hit
  (Armadillo Cloak's ruling — rule 603.2c): a trampler or a creature dealing damage to several
  things at once would draw or gain life twice. Check each pool card on `deals-damage` without a
  `to` clause (raised by batch 109's review of Vrondiss).

- **A "prevent that damage and remove a counter" replacement runs once per source.** A
  `would-deal-damage` replacement with `prevent` and a `then` (Unbreathing Horde's "remove a +1/+1
  counter from it") is applied per damage source by `Game.dealDamage`, so combat damage from two
  blockers at once removes two counters — and with one counter left, the second blocker's damage
  isn't prevented. Combat damage is dealt simultaneously (rule 510.2), one event: Oathsworn Knight's ruling
  says all of it is prevented and one counter removed. Affects Unbreathing Horde (in the pool);
  blocks Oathsworn Knight (`replacement:prevent-once-per-damage-event`). Polukranos, Unchained's
  "remove that many" sums the same per source, so it's right.

## Latent

The engine departs from the rules here, but no pool card reaches it yet: fix each when a card
that needs it is authored.



- **Convoke with a target-dependent cost.** The offered `proof` is priced at the dearer end of
  the target-count range.

- **A ceased token's last-known information lasts only the turn.** `GameState.ceasedTokens`
  (a token that has ceased to exist, rule 704.5d, read by last-known information) is emptied as
  each turn begins. Since 2026-10-09 a delayed trigger whose trigger object was such a token keeps
  its snapshot (`DelayedTrigger.triggerObjectCeased` — Esoteric Duplicator copying a Clue
  sacrificed in an end step, at the next turn's end step), but anything else reading a ceased
  token on a later turn still loses it. Latent: no other pool card is known to.
- **A regeneration shield goes before a shield counter.** Both replace "this permanent would
  be destroyed" (rules 701.15a, 122.1c), so with both on it the permanent's controller chooses
  which applies (616.1); `Game.destroyByEffect` always spends the regeneration shield first,
  which ends with the turn anyway, keeping the lasting counter — the better choice unless being
  tapped and removed from combat matters. Latent: no pool card regenerates a shielded permanent
  on purpose (found 2026-10-19, building shield counters).
- **A debug entry's enters trigger waits a priority round.** `debugSpawn(..., { announceEntry:
  true })` (the harness's `enter()`) made while a player holds priority leaves the trigger
  pending through both players' priority; the step ends and it goes on the stack in the next
  one. Rule 117.5 puts it on the stack as the next player receives priority. Real entries come
  through `dispatch`, so this may be the debug path only — tests work around it.
