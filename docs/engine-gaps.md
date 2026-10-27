# Engine rules gaps

The detail behind `BACKLOG.md`'s "Engine rules gaps": where the engine departs from the
Comprehensive Rules (`docs/rules/`), or can't yet express something real cards need, with the
rule number, the code that does it today and the cards it blocks. `BACKLOG.md` keeps one line
per gap under the same bold title; when a gap closes, delete it here and move its
`BACKLOG.md` line to `COMPLETED.md`.

- **A threshold-gated granted dies trigger doesn't look back.** A `grantsTriggered` static
  with a `condition` (threshold) is checked after the event when the granting permanent stays on
  the battlefield and another creature dies, so the creature whose death makes the seventh card
  in the graveyard still triggers it. Rule 603.10a says a leaves-the-battlefield trigger looks
  back to just before the event, and Decaying Soil's ruling says threshold must already be met.
  Reborn Hero is right, its own death being the event. Found by batch 225's group C; blocks
  Decaying Soil (`trigger:conditional-grant-look-back`).
- **A look-and-choose's `then` loses `"that-player"`.** Inside a `for-each-player`, a
  `look-and-choose` with `player: "that-player"` applies its `then` as the player who chose, in a
  context without the enclosing loop's player binding (game.ts, where the choice's `then` is
  applied), so `who: "that-player"` in the `then` reaches nobody and does nothing, silently.
- **`put-onto-battlefield` follows a target that changed zones during the resolution.** A
  target is checked once, as the spell or ability begins to resolve (`illegalSlot` reads the
  `illegalTargets` found then, rule 608.2b); a step of the same resolution that moves it first
  leaves the next step pointing at the new object, which rule 400.7 says it isn't. Found authoring
  Celestial Gatekeeper (batch 219, a test of group A's): "When this creature dies, exile it, then
  return up to two target Bird and/or Cleric permanent cards from your graveyard to the
  battlefield" — targeting itself, it was exiled and then returned from exile, where its ruling
  says it stays exiled. Not yet checked against other `put-onto-battlefield` /
  `return-to-hand` sequences. Blocks Celestial Gatekeeper (`bug:zone-change-object-identity`).
  Found 2026-10-26 authoring Duskmantle Seer (B176), written with `who: "you"` instead — right
  only because the step runs as the choosing player. The fix carries the binding into the
  `then`'s context.

- **A spell filter's `targets` never matches a copy of a spell.** `spellTargetsMatch`
  (filter.ts) returns false for any stack object whose `kind` isn't `"card"`, so a copy of a
  spell (rule 707.10) that targets you, or a permanent, is never "a spell that targets you": Dawn
  Charm's "counter target spell that targets you" and Shell of the Last Kappa's "exile target
  instant or sorcery spell that targets you" can't be aimed at a copy, though a copy is a spell
  (rule 707.10) with the copied targets. Found 2026-10-26 authoring Shell of the Last Kappa (B212).
  The fix reads a copy's own `targets` the same way.

- **Splice's limits.** Splice (rule 702.47, `CardDefinition.splice`, `Game.spliceFits` and
  `castSpellActions` in game.ts) is offered only onto a spell with one plain `effect` — not a
  modal (`castModal`), fused, divided or `resolve` spell, where the spliced text has no place to
  go yet — and never on an overloaded cast; every set of splice cards in hand is its own
  variant, so at most `Game.MAX_SPLICE_OFFERED` (four) are offered at once. A non-mana splice
  cost (Horobi's Whisper's "exile four cards from your graveyard", Veil of Secrecy's "return a
  blue creature you control") isn't paid: `cost:splice-non-mana`. Found building splice
  (B202, 2026-10-26).

- **Flashback never offers a split card's halves.** A split instant or sorcery in a graveyard
  that has or gains flashback (Snapcaster Mage, Past in Flames — rule 702.34a) may be cast as
  either half for that half's flashback cost (709.3: only the half cast is evaluated; Past in
  Flames' "equal to its mana cost" is the half's). The flashback offer loop in
  `Game.legalActions` (game.ts, "Flashback (rule 702.34)") casts `cardName` — the whole card,
  face 0 — rather than each of `castableFaces`, so no half is offered, and the whole is
  refused. Found 2026-10-26 while testing fuse (B173): nothing is cast wrongly, the cast is just
  never offered. The fix offers each half with its own cost when the grant's cost is
  `"mana-cost"`.

- **A source of damage: a waiting effect's object and the command zone.** Rule 609.7a also allows
  an object a waiting replacement or prevention effect or a delayed trigger refers to, and a
  face-up object in the command zone. `chooseDamageSource` (game.ts) offers permanents, spells,
  and the departed source of an ability on the stack (picked by its stack entry), not those.
  No pool card is known to need them.
- **`each-player-may` with `choices` drops the controller's own choice.** The `choices` form
  hands each chooser a `choose-modes` decision with `modesController: controller`
  (game.ts, the `each-player-may` resolver), but `beginModesChoice` keeps `modesController`
  only when it differs from the chooser (`ability.modesController !== controller`). For the
  controller's own choice it is dropped, so the resolution context gets no `player` in
  `lastKnownRefs` and an option's `"that-player"` names no one: the controller's chosen option
  does nothing. Every pool card using `choices` today is `each-opponent` (Sycorax Commander),
  so none hits it; Truce (batch 160) is authored on the `effect` form around it. The likely fix
  is to keep `modesController` whenever it's set; it needs a test with an `each-player`
  `choices` spell.
- **A cast prohibition reads the card, not the face or half being cast.** `whyProhibitedFromCasting`
  (`game.ts`) tests the card object's characteristics, so a split card's half (rule 709.3: Fire //
  Ice's half has mana value 2), an Adventure (715.3), an MDFC's back face (712.11) or a bestowed
  Aura spell is judged as the whole card. Found authoring Gaddock Teeg (batch 189,
  `static:prohibit-cast-by-face`); unverified whether Archon of Valor's Reach and Nikya of the Old
  Ways misjudge such spells today.
- **A mana-value cast prohibition reads an X spell before X is chosen.** On the stack an X
  spell's mana value counts the X chosen (rule 202.3e), and Sanctum Prelate's ruling has X
  chosen before its mana value is checked. `whyProhibitedFromCasting` (game.ts) matches a
  `prohibits.spells` filter against the card in hand, X as 0, so a `manaValue` prohibition bars
  an X spell at every X or none. No pool card's prohibition reads mana value today; Sanctum
  Prelate (`static:cant-cast-chosen-mana-value-with-x`, `B142.json`) waits on it.
- **"Each player discards" isn't chosen in secret.** Rule 101.4: when every player makes a choice
  at once, the active player chooses first, then the others in turn order, and then the choices
  take effect together; the rulings of Miasmic Mummy, Neheb, the Worthy and Delirium Skeins add
  "no one sees what the other players are discarding before deciding". A scoped `discard`
  (`GameState.pendingDiscards`, drained by `promptNextDiscard`) asks one player at a time and
  discards each player's cards before the next chooses, so a later player sees the earlier
  discards, and each discard is its own event. **Fix (outline):** collect every scoped player's
  choice first (rule 101.4's choose-then-act machinery, built for the Forgotten Realms set — batch
  109), hidden from the others, then discard them all as one graveyard batch. Miasmic Mummy and
  Neheb are in the pool on today's behaviour; blocks Delirium Skeins, Stronghold Rats and
  Cunning Lethemancer (`effect:hidden-simultaneous-choices`). Found by an authoring agent, 2026-10-23 (B144).
- **Blitz, dash, sneak and web-slinging are offered only from the hand and the command zone.** The same
  limit holds for sneak's and web-slinging's offers (`legalActions`' sneak and web-slinging loops,
  rules 702.190a and 702.188a allow any zone a card may be cast from). `Game.blitzCostOf` gates on
  those two zones, so a blitz card another permission lets you cast (an impulse exile, a
  graveyard grant, the top of a library) isn't offered its blitz cost there, though rule
  702.152a allows it; `Game.dashCostOf` the same (702.109a). Henzie's discount also moves only a cost's generic number, never an `{X}`
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
- **Not modeled.** Banding, Companion, and text change that replaces words (612.2: Artificial Evolution, Mind Bend, Magical Hack, New Blood — a rework
  of the card format the user ruled not worth one cycle of cards, 2026-10-09; exchanging text
  boxes, 612.5, is built). Battles, dungeons and the Initiative, and snow sources paying {S}, are
  built. ROADMAP's Phase 10 deferred the rest as large or niche. None of them
  blocks ordinary Commander play. The alt-cast long tail left by Phase 6 (retrace, Warp,
  Bestow, Prototype, …) is in AUTHORING §15 and the limitation ledger.
- **Protection's prevention always comes after a creature's own damage replacements.** Rule 616.1
  lets the controller apply protection's prevention (rule 702.16e) before a "prevent that damage and
  remove a +1/+1 counter" replacement, so a black source's damage to Phantom Centaur (protection
  from black) costs no counter (its ruling); `Game`'s damage path runs `damageSteps`/`bestDamageOrder`
  before the protection check, so the counter would be removed. Blocks Phantom Centaur (B217).
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
  beside another exiling replacement asks today. One-shot redirection shields exist
  (`prevent-damage`'s `redirectTo`, rule 614.9), but a redirection's order is chosen the same
  way — a plain prevention shield first, never asked.
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
  with Discovery and Tempt with Immortality stay blocked on it, and so does Innocent Traveler ("if no one does").
- **Static-effect dependency ordering** (rule 613.8) is implemented only for layer 4's additive
  type grants (Kudo beside Mishra's Factory, `characteristics.ts`). Every other layer applies
  its statics in timestamp order only.
- **The rest of leaving the game** (rule 800.4). 800.4a, 800.4c (a control effect ending with the
  default controller gone exiles the permanent — `recomputeControl`) and 800.4m are modeled, and
  a conceding player's own pending decision is answered by the server first. Not yet: a choice an
  effect would ask of a player who has already left (800.4g–h: the object's controller picks
  another player, or the next in turn order makes it) — the engine skips that player instead.
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
- **A target cost reduction two slots can earn is offered unrestricted.** Rule 601.2f fixes the
  cost once targets are chosen. `Game.targetReductionOptions` offers only the earning targets when
  the full price isn't affordable, but only when exactly one slot can hold one; with two (This Town
  Ain't Big Enough's "up to two", both slots any nonland permanent) it offers every target in both,
  so a cast naming two the caster doesn't control is offered and then refused for mana. Seen in the
  fuzzer (`random-demo.mjs --players 4 --seed 19` with batch 151's second half forced): Thorn of
  Amethyst made it {5}{U} against Carol's five mana. One offer can't say "at least one slot
  earns"; the fix narrows the first earning slot to the earners (no legal cast lost while the
  slots are alike, as here), and a skipped optional first slot still needs the cast refused or the
  random controller kept from skipping it. Found 2026-10-23, batch 151's checks.

## Latent

The engine departs from the rules here, but no pool card reaches it yet: fix each when a card
that needs it is authored.

- **A double-faced Aura put onto the battlefield transformed is asked what it enchants.** Rule
  712.14a puts it onto the battlefield back face up, so Skin Invasion returns as Skin Shedder, a
  creature with nothing to enchant. `Game.askEnterChoice` (and `nextEnterChoice`) read the card's
  current face, the front Aura's, before the move applies `transformed`: with no creature to
  enchant it stays in the graveyard (303.4g), and with one the player is asked a meaningless
  enchant choice and Skin Shedder enters unattached. The fix asks the enter choices of the face it
  will enter as. Blocks Skin Invasion (`bug:aura-enters-transformed-asks-enchant`). (The same
  front-face reading kept an instant or sorcery card from entering transformed — Startled Awake —
  until batch 151.)

- **A mana ability's discard cost is never paid.** Rule 605.3b: a mana ability's costs are paid
  as it's activated, like any other's. `Game.activateAbility` checks a `cost.discard` can be paid
  but takes the discard only on the stack path (where `discardByEffect` asks); the
  `isManaAbility` branch resolves the mana and returns first, so the mana comes free. It refuses
  a mana ability's graveyard-exile or multi-sacrifice cost outright, but not a discard. No pool
  card has one; blocks Bog Witch (`cost:mana-ability-discard`). Found by an authoring agent,
  2026-10-23 (B144).
- **A token with devour never devours.** Rule 702.82a: devour is a replacement as the permanent
  enters. It's asked through `askEnterChoice`, which a spell resolving, a reanimation and a blink
  call, but token creation (`createTokens`, `mintTokenBatch`) never does, so a `create-token` of
  a token definition with `devour` makes the token without the choice (AUTHORING §15 notes the
  same for a token copy's "as this enters" choices). No pool token has devour; blocks Dragon
  Broodmother (`mechanic:token-devour`). Found by an authoring agent, 2026-10-23 (B144).
- **Convoke with a target-dependent cost.** The offered `proof` is priced at the dearer end of
  the target-count range.

- **A ceased token's last-known information lasts only the turn.** `GameState.ceasedTokens`
  (a token that has ceased to exist, rule 704.5d, read by last-known information) is emptied as
  each turn begins. Since 2026-10-09 a delayed trigger whose trigger object was such a token keeps
  its snapshot (`DelayedTrigger.triggerObjectCeased` — Esoteric Duplicator copying a Clue
  sacrificed in an end step, at the next turn's end step), but anything else reading a ceased
  token on a later turn still loses it. Latent: no other pool card is known to.
- **Umbra armor's Aura is picked, and goes after the other shields.** With several Auras with
  umbra armor on one permanent (rule 702.89a), or a regeneration shield or a shield counter
  beside one, the permanent's controller chooses which replacement applies (616.1, the
  rulings); `Game.umbraArmorInstead` destroys the umbra of least mana value (the newest of
  equals), and `Game.destroyByEffect` tries it only after the regeneration shield and the
  shield counter — keeping the Aura's bonus, which usually matters more. Latent: no pool deck
  stacks umbras on purpose (found 2026-10-25, building umbra armor).
- **A regeneration shield goes before a shield counter.** Both replace "this permanent would
  be destroyed" (rules 701.15a, 122.1c), so with both on it the permanent's controller chooses
  which applies (616.1); `Game.destroyByEffect` always spends the regeneration shield first,
  which ends with the turn anyway, keeping the lasting counter — the better choice unless being
  tapped and removed from combat matters. Latent: no pool card regenerates a shielded permanent
  on purpose (found 2026-10-19, building shield counters).
