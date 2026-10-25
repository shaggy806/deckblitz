# Engine rules gaps

The detail behind `BACKLOG.md`'s "Engine rules gaps": where the engine departs from the
Comprehensive Rules (`docs/rules/`), or can't yet express something real cards need, with the
rule number, the code that does it today and the cards it blocks. `BACKLOG.md` keeps one line
per gap under the same bold title; when a gap closes, delete it here and move its
`BACKLOG.md` line to `COMPLETED.md`.

- **A source of damage: a waiting effect's object and the command zone.** Rule 609.7a also allows
  an object a waiting replacement or prevention effect or a delayed trigger refers to, and a
  face-up object in the command zone. `chooseDamageSource` (game.ts) offers permanents, spells,
  and the departed source of an ability on the stack (picked by its stack entry), not those.
  No pool card is known to need them.
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
- **Delve and convoke together on an {X} spell.** `xCost.maxX` is the better of the two alone
  (`xPlanFor`), so Chord of Calling under Teval, Arbiter of Virtue can't reach the X both would
  pay together, and its offer's convoke proof and delve ranges are each worked out without the
  other. Needs a joint plan: convoke the creatures, delve the rest of the generic.
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
- **"Each player may" with a choice inside it.** Rule 101.4: every player chooses, then it all
  happens at once. `each-player-may` holds discards and sacrifices until the last answer
  (`GameState.heldChoices`), and an effect that asks nothing more (draw, discard a hand, gain or
  lose life — `asksNothing`) is done for everyone who said yes after the last answer. One that
  asks something else, a search above all, is still done before the next player is asked: Tempt
  with Discovery stays blocked on it, and so does Innocent Traveler ("if no one does").
- **Static-effect dependency ordering** (rule 613.8) is implemented only for layer 4's additive
  type grants (Kudo beside Mishra's Factory, `characteristics.ts`). Every other layer applies
  its statics in timestamp order only.
- **The rest of leaving the game** (rule 800.4). 800.4a, 800.4c (a control effect ending with the
  default controller gone exiles the permanent — `recomputeControl`) and 800.4m are modeled, and
  a conceding player's own pending decision is answered by the server first. Not yet: a choice an
  effect would ask of a player who has already left (800.4g–h: the object's controller picks
  another player, or the next in turn order makes it) — the engine skips that player instead.
- **Dividing among targets: what's left.** A spell's and an ability's fixed "N damage divided as
  you choose" are built (`divided`, the `division` answer), and so is a spell's X total
  (`divided.x` — Fire Covenant). Not yet: "distribute **up to** that many counters" from a
  trigger (Lathiel's total is its trigger's value, and fewer may be given). See
  `neededCards-features.md`, "Unbounded targeting".
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
- **"Enters untapped" always beats "enters tapped".** When an enters-the-battlefield replacement
  that makes a permanent enter untapped meets one that makes it enter tapped, the engine applies
  the untapped one last, so the permanent enters untapped (`game.ts`, where the enters
  replacements fold — the comment there assumes the untapped effect is the entering permanent's
  own controller's). Rule 616.1 gives the entering permanent's controller the order. Archelos,
  Lagoon Mystic (batch 113) reaches every player's permanents, so on an opponent's permanent with
  its own "enters tapped" the engine makes that player's choice for them — the one they'd make
  almost always, which is why the card is authored. A choice asked of the controller would close
  it.

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
