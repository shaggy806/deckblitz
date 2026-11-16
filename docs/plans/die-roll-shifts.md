# A die's result shifted after the roll

Status: done — the engine, both proving cards, the bots' answers and the client's prompt (2026-11-16,
for author-top-cards batch 333). Vedalken Squirrel-Whacker's exchange, a reroll as a modifier and an
opponent's shift of your roll are not built.

Night Shift of the Living Dead (EDHREC 8898): "After you roll a die, you may pay 1 life. If you do,
increase or decrease the result by 1. Do this only once each turn. Whenever you roll a 6, create a 2/2
black Zombie Employee creature token." Xenosquirrels says the same with "remove a +1/+1 counter from
this creature" and no limit. The user approved the feature as a major one — a new player decision
inside every die roll — on 2026-11-16.

## The rules it follows

- **706.2**: the natural result is the die's top face; modifiers "may also come from other sources";
  "after considering all applicable modifiers, the final number is the result of the die roll". So
  the shift is part of the roll, not something done to a finished roll: nothing may read the roll —
  no `dice-rolled` event, no trigger, no results table, no `{ roll }` amount — until it's final.
- **706.2a**: "modifiers may be optional and/or have associated costs". The cost is paid as the
  modifier is chosen ("if you do").
- **706.2b**: with two or more effects modifying the result, "the player who rolled chooses one to
  apply", rerolls first, then increases and decreases. The roller is asked one shift at a time, among
  every one on offer, and picks the order.
- **706.6**: an ignored die never happened, so the shift is offered only on the dice kept (Wyll's
  extra die is thrown and its lowest dropped first).
- **119.4 / 118.3**: life can be paid only with at least that much; a counter can be removed only if
  it's there. An option that can't be paid isn't offered.
- **400.7**: "once each turn" belongs to the object; a Night Shift that left and came back is new.
- **614.1c / 614.12**: Neverwinter Hydra's "as this creature enters, roll X d6" is part of how it
  enters, and choices about that are made before it moves.
- **601.2g / 605.3a–b**: a mana ability activated while paying a cost resolves then, its roll with
  it.

And the cards' rulings: Night Shift "can affect only one die, even if you roll multiple dice at the
same time. However, you do get to see all the results before deciding whether to use it, and if so,
which result to shift"; a die rolled is "a die" one at a time (The Space Family Goblinson's ruling,
already how `rolls-die` counts), so Xenosquirrels may shift each die of a roll once, a counter
apiece. Nothing bounds the result: a 1 decreased is 0, a 6 increased 7 (706.2 sets no floor; the
engine already allowed a modifier below 1).

## The shape, and why

**One record of the roll, with what was shifted.** `RollRecord` gained `shifts` (die by die, what
the shifts added), carried on `dice-rolled` and into the journal; `total` includes them, and
`dieResults(roll)` is each die's result (natural + the instruction's modifier + its shift). Every
per-die read now goes through it — `matchingDice` ("whenever you roll a 6" reads 6 after the
shift; "a natural 20" still the natural), `rollRead` (odd/even/equals/distinct/other), "choose one
result" and stored results (Centaur of Attention's ruling: stored after any modification). No "last
result" field, per `engine/CLAUDE.md`'s rule that a die roll is a record.

**The roll waits for the answer.** `Game.rollDice` throws the dice as before (the same draws from
the seeded stream), then asks `askRollShift`: with a shift on offer it raises the decision and
returns `undefined`; otherwise it finishes at once (`finishRoll` emits the event). What the roll was
for carries on from `carryOnFromRoll` once it's final, by a `RollThen` kept on the question:

- `effect` — the rest of a `roll-dice` instruction (its table, `then`, "you may roll again"),
  resumed through `resumeResolution` as the same spec with the engine-built `rolled` (the result) —
  the pattern `choose-value` already uses. The steps after it in a `sequence` or `for-each-player`
  were parked by those effects' own handling of a step that leaves a decision (608.2c).
- `visit` — a roll to visit's visit (`visitAttractions`), from the turn-based action or Line
  Cutter's effect.
- `reroll-stored` — Centaur of Attention's reroll, the new results into their places, then the
  rolls of the other kinds of die.
- `enters` — Neverwinter Hydra. `rollAsEnters` moved from inside the entering replacement to the
  "as this enters" choices (`nextEnterChoice`'s `roll`, beside Molten Sentry's coin), rolled before
  it moves and kept as `enterChoice.rolledAsEnters`, which the replacement reads. A way in that asks
  no "as this enters" choices (a token) still rolls inside the replacement with nothing asked; no
  card reaches that today (a token copy of the Hydra has no X).

**The decision reuses `choose-modes`.** It is a pick of one option or none among labelled options —
exactly what `choose-modes` with `minModes: 0, maxModes: 1` asks, and what Centaur of Attention's
reroll (a choice about die results too) already uses through an engine-answered payload
(`rerollStored`). So the shift is the payload `shiftRoll: { roll, options }`, answered in
`applyModesChoice` by `applyRollShift`; no new kind, no new client mode. The client's banner already
renders it: "Night Shift of the Living Dead — choose one or none", a button per shift ("Pay 1 life:
5 → 6", "Remove a +1/+1 counter: die 2, 3 → 2", led by the card's name when two cards offer) and
"Choose none". A new decision kind would have bought a picture of the dice in the prompt and
nothing the rules need. Options are deduplicated only where two dice are alike in every way that
matters (same result, same source, same shifts already made to it), so the roller can always reach
every combination.

After each shift the question is asked again with what's left; none ends it, since every option was
on the table. Paying happens in the answer (life through `payLife`, a counter through
`removeCountersFrom`); "if you do" is checked there, so a cost that can no longer be paid moves
nothing. "Once each turn" is the journal's `done` for a key of the object, its stint and the
static's index — declining isn't doing it.

**A roll that can't stop is held.** Vexing Puzzlebox's mana ability rolls a d20; tapped by the
auto-payer for a spell, its roll happens inside `executePayment`, partway through casting, where no
decision may be raised. Such a roll — or one made while another question is up — goes to
`GameState.pendingRollShifts` and is asked as someone would next receive priority
(`raiseNextHeldRoll` in `prepareForPriority`, beside the shock lands' held offer). Nothing has read
it meanwhile, and its only readers (roll triggers) wait for priority anyway, so holding it changes
only the order of the log.

## The bots

v1 (`HeuristicBotController.chooseModes`) scores modes by their effects' worth; a shift's mode
carries none, so v1 declines — its standing do-nothing answer. v2 searches a `choose-modes` with its
rollouts (`bestDecision`, and nested inside rollouts — `NESTED_DECISION_KINDS`): each answer is
applied and played on, so 1 life for a 5 made a 6 and a 2/2 Zombie Employee wins, and a shift that
changes nothing loses its life. `test/roll-shift.test.ts` checks both. The fuzzer's
`RandomController` answers it as any `choose-modes`.

## Left out

- **Vedalken Squirrel-Whacker** ("you may exchange one result with this creature's base power or
  base toughness") is the same question with another kind of option: a `RollShiftOption` with an
  exchange instead of a delta would slot in.
- **Rerolls as modifiers** (706.2b's first step) — no card in the pool asks for one.
- **An opponent's modifier of your roll** — `shiftsRoll` is "after you roll" only.
- **The dice animation** plays when the roll is final, after the question: the prompt's labels say
  what was rolled.
