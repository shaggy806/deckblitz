# Engine rules gaps

The detail behind `BACKLOG.md`'s "Engine rules gaps": where the engine departs from the
Comprehensive Rules (`docs/rules/`), or can't yet express something real cards need, with the
rule number, the code that does it today and the cards it blocks. `BACKLOG.md` keeps one line
per gap under the same bold title; when a gap closes, delete it here and move its
`BACKLOG.md` line to `COMPLETED.md`.

- **Phyrexian mana is paid with life only when mana can't pay it.** Rule 107.4f lets a Phyrexian
  symbol be paid with one mana of its colour or 2 life, the player's choice. `mana-payment.ts`'s
  pip resolution (`resolveHybridCost` and `resolveReducedTwobrid`) pays 2 life for a Phyrexian pip only when no mana can
  pay it, and `Action` has no way to ask for life instead — so a player can't keep mana open by
  paying life, and a compleated planeswalker (702.150a) is never cast with life while mana could
  pay. **Fix (outline):** a `phyrexianLife: n` on the cast and activate actions (how many pips
  to pay with life), honoured by the planner first, offered by the client beside the convoke
  picker.
- **A mass effect's filter can't read a dynamic amount.** `Game.battlefieldMatching(you, filter)`
  (game.ts ~25585) calls `matchesFilter` with only `{ you }`, so a `NumCompare` whose `n` is `{
  amount: … }` has no amount resolver (`FilterContext.amount`) and matches nothing — silently.
  Every `*-all` effect that routes through it is affected (`add-counter-all`, `modify-pt-all`,
  `destroy-all` …). Zar Ojanen, Scion of Efrava ("each creature you control with toughness less
  than the number of basic land types among lands you control") waits on it (found 2026-10-19).
  **Fix (outline):** pass the resolution context's amount evaluator into `battlefieldMatching`
  from the effect callers, and audit the pool for `{ amount` inside mass-effect filters.
- **"It gains 'if this would leave the battlefield, exile it instead'" is a flag, not an
  ability.** `GameObject.exileIfItWouldLeave` is set by effects whose text grants a replacement
  ability (Geth, Thane of Contracts' returned creature; Llanowar Greenwidow), so an effect that
  removes all abilities (Humility, rule 613.1f) doesn't remove it. Greenwidow waits; Geth is
  inaccurate in that corner. **Fix (outline):** grant it as a static on a modifier, as granted
  triggers ride one, so ability loss in timestamp order applies.
- **A reflexive trigger's target filter reads the creating ability's `triggerValue`.** A
  reflexive ability's target filter (603.12) is bound when it's created, in the parent's
  resolution, so `{ amount: { triggerValue: true } }` there reads the parent trigger's value (0
  for an upkeep trigger), not the reflexive one's. Argentum Masticore reads `{ thisWay:
  "discarded", sumOf: "mana-value" }` instead, which that resolution knows. Any card that needs
  the reflexive value in a target filter is silently wrong until the filter is bound in the
  reflexive ability's own context.
- **At most 100 tokens of one stack can block.** Rule 509.1a lets the defending player block
  with any of their untapped creatures; `Game.materializeStack` wakes at most `MAX_MATERIALIZED`
  (100) tokens of a blocking stack, and the rest stay out of the combat whatever was declared (the
  client's `MEMBER_CAP` caps the block bar to match). Attacking had the same cap until 2026-10-07
  (a bug report: 336 Scute Swarms, 103 offered), fixed by a counted attacking stack
  (`attackingStackPart`: past the cap a stack attacks as one object with its count, blockers
  split off the tokens they block, and its damage is one event from that many sources).
  **Fix (outline):** a blocking stack can be counted the same way when its tokens block one-to-one
  — k tokens of one stack each blocking a token of one attacking stack is a stack of k blockers
  against a stack of k attackers, and their combat damage is damage to each stack, which the
  engine already deals to every token in it. Anything other than one-to-one (two blockers on one
  attacker) still wakes tokens up. Risk: the damage assignment and "blocked by" checks that
  assume one blocker is one object.
- **Blitz, sneak and web-slinging are offered only from the hand and the command zone.** The same
  limit holds for sneak's and web-slinging's offers (`legalActions`' sneak and web-slinging loops,
  rules 702.190a and 702.188a allow any zone a card may be cast from). `Game.blitzCostOf` gates on
  those two zones, so a blitz card another permission lets you cast (an impulse exile, a
  graveyard grant, the top of a library) isn't offered its blitz cost there, though rule
  702.152a allows it. Henzie's discount also moves only a cost's generic number, never an `{X}`
  (no blitz cost in the pool has one yet).
- **A multi-target flicker's leaves aren't one batch.** `Game.flickerByEffect` exiles each of its
  objects in turn rather than inside `withLeaveBatch`, so a batched "whenever one or more … leave"
  trigger would fire once per object for Brago or Eerie Interlude rather than once (rule 603.2c:
  one event, one trigger). Nothing in the pool reads that batch yet; Aang, Airbending Master
  (`trigger:leaves-batch-trigger`) will, so fix it with that trigger (found building airbend, batch 65).
- **A `turn-history` condition's `excludeSelf` compares object ids.** Rule 400.7 makes a permanent that left and came back a new object, but an object keeps its id across zone changes, so a `turn-history` `died` (or `left`) condition with `excludeSelf` skips the source's own earlier stints too: White Glove Gourmand that died and came back the same turn doesn't count its own death as "another Human" (Éowyn and Wary Farmer use the same shape). **Fix (outline):** record the stint (`zoneChangeCount`) with each turn-history entry and exclude only the source's current stint. Found by batch 90's agents (2026-10-16).
- **A mana restriction reads the spell before it's cast.** `ManaRestriction.spell` is matched
  against the card in its pre-cast zone, so an ability a static grants a spell as it's cast
  (Abaddon the Despoiler's cascade) is missed: Jasmine Boreal of the Seven's "only to cast
  creature spells with no abilities" (her ruling) would wrongly pay for it. She waits on it
  (`cost:mana-restriction-at-cast` in the gaps JSON).
- **Suspend's time-counter triggers don't use the stack.** Rule 702.62a makes "remove a time
  counter" and "when the last is removed, you may play it" triggered abilities; `upkeepStep` does
  both as the upkeep begins (`castSuspendedCard`), so nobody can respond between them. The last
  counter taken off by an effect (time travel) is the same: the play is offered as that effect
  finishes resolving (`pendingSuspendedCasts`, drained in `prepareForPriority`), not from the
  stack. It also blocks cards whose own triggers work while suspended (Deep-Sea Kraken, Dinosaurs
  on a Spaceship — `trigger:functions-while-suspended`).
- **"Whenever a creature you control deals combat damage to that player this turn"** — a
  delayed trigger lasting the turn, keyed on a target player (Great Train Heist's third mode),
  and "if it's your combat phase" as a condition (its first). `DelayedCombatDamage` watches one
  creature only.
- **"Whenever this Equipment becomes unattached from a permanent"** (Grafted Exoskeleton): no
  unattach event or trigger — an equip elsewhere, the Equipment leaving, the creature ceasing to
  be a creature.
- **A card's own "if this would be put into a graveyard from anywhere, reveal it and shuffle it
  into its owner's library instead"** (Blightsteel Colossus, the Darksteel Colossus family) — a
  self-replacement working from every zone, which beside Rest in Peace also needs its owner to
  choose the order (rule 616.1).
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
- **End-step token removal resolves without the stack.** "Exile it (sacrifice it) at the
  beginning of the next end step" is a delayed triggered ability (rule 603.7), but
  `create-token` / `create-token-copy`'s `exileAtEndStep` and `sacrificeAtEndStep` (Flameshadow
  Conjuring, Molten Echoes, Twinflame, Kiki-Jiki, mobilize, encore …) are a flag on the token
  that `Game.endStepActions` acts on as the step begins. So nobody can respond to it, counter it
  (Sublime Epiphany — Flameshadow Conjuring's ruling: a countered one leaves the token for good)
  or copy it (Strionic Resonator). `exileAtEndOfCombat` (myriad) already sets up a real delayed
  trigger over the tokens it made; these need the same, kept out of token stacks, and the
  sacrifice made by the token's controller then (rule 701.21a).
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
  - `each-player-may` asks one player at a time where the ruling has every player choose first,
    then all act at once: Will of the Jeskai's wheel mode, Kwain, Itinerant Meddler. Perforating
    Artist (batch 36) and Osseous Sticktwister (batch 68) are blocked on it.
  - `trigger-controller` for "that player" on a spell-cast trigger reads the spell's controller as
    the trigger resolves, so a stolen-library spell countered first points at its owner: Forced
    Fruition, Ruric Thar, Spellshock, Magebane Lizard.
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

## Latent

The engine departs from the rules here, but no pool card reaches it yet: fix each when a card
that needs it is authored.

- **A spell cast this turn forgets where it was cast from** — `Game.castRecordOf` snapshots the
  spell for `PlayerState.spellsCastThisTurnAs` a few lines before `object.castFrom` is set (and
  `takeLastKnown` doesn't copy `castFrom` anyway), so a `cast-this-turn` condition whose filter
  has `castFrom` matches no record. No pool card asks yet; Surge of Brilliance ("spells you've cast
  this turn from anywhere other than your hand") waits on it (`stat:spells-cast-not-from-hand-this-turn`,
  batch 49). Fix: record after `castFrom` is set, and carry it in the snapshot.


- **A source's chosen colour or number isn't read from last-known information** (latent). Since
  2026-10-09 `chosenOnEnter` is in `LastKnownInfo` (Outpost Siege's chosen side), but
  `chosenColorOfSource` / `chosenNumberOfSource` (`game.ts`) read only the live object, so an
  effect resolving after its source left doesn't see the chosen value. No pool card is known to
  hit it.
- **Counters put as a cost skip counter replacements and prohibitions.** `putCostCounters`
  (Wall of Roots' -0/-1, Devoted Druid's -1/-1) puts them straight on. Right for "if an effect
  would put counters" (Doubling Season), wrong for one that isn't worded so (Vizier of Remedies)
  and for "counters can't be put on" (Solemnity, top 5000), which makes the cost unpayable
  (Devoted Druid's rulings).
- **Convoke with a target-dependent cost.** The offered `proof` is priced at the dearer end of
  the target-count range.

- **A ceased token's last-known information lasts only the turn.** `GameState.ceasedTokens`
  (a token that has ceased to exist, rule 704.5d, read by last-known information) is emptied as
  each turn begins. Since 2026-10-09 a delayed trigger whose trigger object was such a token keeps
  its snapshot (`DelayedTrigger.triggerObjectCeased` — Esoteric Duplicator copying a Clue
  sacrificed in an end step, at the next turn's end step), but anything else reading a ceased
  token on a later turn still loses it. Latent: no other pool card is known to.
- **A `{T}` ability granted to a token stack taps the whole stack.** Activating a granted
  activated `{T}` ability on a compacted stack (`stackCount`) taps every token rather than
  splitting one off first. Ordinary token stacks have no activated abilities; it needs a static
  that grants one, and no pool card is known to (found 2026-10-09 with the becomes-tapped fix).
- **Convoke with a choice of additional costs.** `legalActions`' convoke re-check (`castableAt`)
  passes `costOption: undefined`, so a convoke spell with a choice of additional costs couldn't be
  convoked. No pool card has both (found 2026-10-09, fixing Eaten Alive's priced option).
- **A regeneration shield goes before a shield counter.** Both replace "this permanent would
  be destroyed" (rules 701.15a, 122.1c), so with both on it the permanent's controller chooses
  which applies (616.1); `Game.destroyByEffect` always spends the regeneration shield first,
  which ends with the turn anyway, keeping the lasting counter — the better choice unless being
  tapped and removed from combat matters. Latent: no pool card regenerates a shielded permanent
  on purpose (found 2026-10-19, building shield counters).
- **`{ powerOf: n }` reads a target that just left in its new zone.** In a `choose-permanents`
  `then`, a target returned to hand reads the card's printed power, not as it last existed on
  the battlefield (608.2h) — First Responder got 3 counters from a Hill Giant with a +1/+1
  counter. `{ thisWay: "returned-to-hand", sumOf: "power" }` reads it right.
- **A trigger's top-level `trigger-object` condition is always false.** `characteristics.ts`
  answers it only inside a `conditional` effect, so a card that puts it on the trigger never
  triggers. Obscura Ascendancy uses a trigger `filter` plus a resolution `conditional`.
- **`cast-now`'s `play` plays a land only from exile.** `whyCannotPlayLandNow` refuses a card
  not in exile, so "you may play a land from the top of your library" (Ziatora's Envoy) can't
  be written though the doc says any offered land.
- **A debug entry's enters trigger waits a priority round.** `debugSpawn(..., { announceEntry:
  true })` (the harness's `enter()`) made while a player holds priority leaves the trigger
  pending through both players' priority; the step ends and it goes on the stack in the next
  one. Rule 117.5 puts it on the stack as the next player receives priority. Real entries come
  through `dispatch`, so this may be the debug path only — tests work around it.
- **"Cast from your graveyard" checks the zone, not whose graveyard.** A `costModification` with
  `castFrom: "graveyard"` (Patrician Geist, Green Goblin) reads only the zone a spell was cast from,
  so a spell cast from an opponent's graveyard (Memory Plunder) gets the discount too.
- **`look-and-choose` to exile always links the card to its source** (rule 607.2a): `destination:
  "exile"` sets `exiledWith`, so Shadow Kin's milled-and-exiled card is linked to it, and a copied
  "return the linked card" leaves ability (Watcher for Tomorrow) would return it. Needs a
  `link: false` option.
