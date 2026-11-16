# Lethal damage determined by power

**Status:** done (2026-11-16). Built for author-top-cards batch 333, approved by the user that day as
a major feature (a core rule changed). Proving card: Zilortha, Strength Incarnate (EDHREC 8983, the
need key `static:lethal-damage-by-power`). Tests: `engine/src/test/lethal-damage-by-power.test.ts`;
the scaffolder's line is pinned in `oracle-parse.test.ts`. No player decision, no client change.

## What the card asks

Zilortha: "Trample. Lethal damage dealt to creatures you control is determined by their power rather
than their toughness." Its four rulings:

1. A creature with 0 toughness still goes to the graveyard: that state-based action isn't a
   consequence of damage, so Zilortha doesn't affect it.
2. Damage stays marked until cleanup, so nonlethal damage may become lethal (or lethal damage stop
   being so) as Zilortha enters or leaves during the turn.
3. *Any* time the game checks whether damage is lethal, or whether a creature is destroyed for
   lethal damage, use power — "This includes being assigned trample damage, damage from Flame
   Spill, and so on."
4. A creature with 0 power isn't destroyed unless it has at least 1 damage marked on it.

Ruling 3 is the shape of the build: no reader of lethal damage may be left on toughness.

## The rules it follows

- **120.6** — damage marked at or over toughness is lethal damage; the creature is destroyed as a
  state-based action. The glossary's "Lethal Damage" points at 120.4a, 120.6, 510.1 and 704.5g.
- **704.5g** — "If a creature has toughness greater than 0, it has damage marked on it, and the
  total damage marked on it is greater than or equal to its toughness, that creature has been dealt
  lethal damage and is destroyed." Under Zilortha the last comparison is against power; the other
  two conditions stay. **704.5f** (toughness 0 or less) and **704.5h** (deathtouch) are untouched.
- **702.19b** — a trampler must assign lethal damage to every blocker before any goes over, taking
  damage already marked into account; **702.19c** the same for trample over planeswalkers.
  **510.1c-d** — any other division among blockers is free, so lethal matters only to trample and
  to the default split.
- **702.2b-c** — any nonzero damage from a deathtouch source is lethal, and destroys (704.5h).
- **120.4a** and **120.10** — "excess damage" is damage past lethal damage (Flame Spill, Ram
  Through, the "dealt excess damage" triggers).
- **702.12b** — indestructible ignores the lethal-damage state-based action; lethal damage is still
  *counted* for trample and excess (Ram Through's ruling).
- **613.11** — an effect that changes game rules rather than objects. Zilortha's is one: it gives
  its controller's creatures no ability, so a creature that loses all its abilities still has its
  lethal damage measured by power, while Zilortha losing its own ability ends it.

## The one question everything asks

`characteristics.ts` holds the one reading:

- `lethalDamageOf(c)` — the least damage, with none marked, that is lethal: `c.toughness`, or under
  the static `Math.max(1, c.power)`.
- `lethalDamageLeft(c, damageMarked)` — what's left of it: `max(0, lethalDamageOf(c) - marked)`.

`Characteristics.lethalDamageByPower` is folded with the other layer-6-pass rules about a creature
(`combatDamageByToughness` beside it), from a `StaticAbility.lethalDamageByPower` reaching it through
`affects` (`creatures-you-control` for Zilortha). It is read live, like every static, which is all
ruling 2 needs: a creature with damage marked is checked again at the next state-based check, against
whatever its lethal damage is then.

### The 0-power question, and why "at least 1"

Read as bare arithmetic, the glossary's "an amount of damage greater than or equal to" a 0-power
creature's power is 0: a trampler could put nothing on a 0-power blocker and send everything over,
and Flame Spill on a 0/4 wall could deal all 4 to its controller and leave the wall untouched. The
rules never say that. 704.5g destroys a creature only once "it has damage marked on it", and ruling 4
says the same of Zilortha in so many words. Lethal damage is the damage the state-based action
destroys the creature for, so under Zilortha it is `max(1, power)`: the least amount that is both
"damage marked" and at or over its power. A 0-power blocker needs 1 before a trampler goes past it;
Flame Spill puts 1 on the wall and 3 on its controller. This is the reading the rules' own condition
gives; the literal-0 reading has no ruling behind it. Negative power reads the same as 0.

Toughness is left exactly as before (`c.toughness`, which is always at least 1 for a creature the
lethal-damage question reaches; one at 0 or less is 704.5f's).

## Every reading of lethal damage, and how each asks now

| Where | What it decides | Before | Now |
| --- | --- | --- | --- |
| `game.ts` `stateBasedGraveyardMoves` | 704.5g: destroyed for lethal damage | `damageMarked >= toughness` | `damageMarked >= lethalDamageOf(c)` (toughness > 0 still gated first by 704.5f) |
| `game.ts` `lethalDamageTo` | excess damage (120.4a, 120.10): `recordDamage`'s `excess` on the damage event and journal, and the effect context's `lethalDamageTo` | `toughness - damageMarked` | `lethalDamageLeft(c, damageMarked)`; deathtouch 1, already lethal 0, as before |
| `effects.ts` `damage` with `excessToController` | Flame Spill, Ram Through: what goes to the controller | via `ctx.lethalDamageTo` | the same, so by power |
| `combat/damage.ts` `lethalFor` | each blocker's `lethal` in the `assign-combat-damage` offer; `needsDamageAssignmentChoice`; `autoAssignForAttacker`; trample over planeswalkers' `toBlockers` (`game.ts`); banding's split; the client's damage bar (it reads the offer) | `toughness - marked`, or 1 for deathtouch | `lethalDamageLeft`, at most 1 for deathtouch, 0 once lethal is marked (the last a fix of its own, below) |
| `server/src/builder.ts` `damageProblem` | the scenario builder refuses damage that would kill on the built board | `damage >= toughness` | `damage >= lethalDamageOf(c)`, its message naming power when that's what counts |
| `bot/combat-math.ts` `CombatCreature.lethal` | new field, `lethalDamageOf(c)`; `toughness` stays for valuing | — | what every "does it die" question below reads |
| `bot/combat-math.ts` `lifelinkGain` | a first striker kills the lifelink blocker first | `damage >= toughness` | `damage >= lethal` |
| `bot/combat-math.ts` `damageThrough`, the poison pass | how much a trampler's blockers absorb, and which blocker it takes | blockers' toughness | blockers' `lethal` |
| `bot/eval-bot.ts` attack estimate, block `kills`, the block estimate's trample `stopped` and `needs`, gang pairs | v2's arithmetic ranking moves before simulating | `toughness` | `lethal` |
| `bot/features.ts` `deters` / gangs | which blockers hold an attacker off | `toughness` | `lethal` |
| `bot/features.ts` the `toughness` term | how much body a creature counts for (capped) | `c.toughness` | `lethalDamageOf(c)`: what damage it survives |
| `bot/divisions.ts` `lethalTo` | the shares of a divided amount worth trying | `toughness - damageMarked` | `lethalDamageLeft` (at least 1 a share, as before) |
| `controller.ts` (v1) sweep kills | whether a `damage-all` kills a creature | `toughness - damageMarked` | `lethalDamageLeft` |
| `controller.ts` (v1) `wouldDieAttacking` | whether an attack runs into a block that kills it | the attacker's toughness | `lethalDamageOf` |
| `controller.ts` (v1) `blockersFor` | favourable blocks, trades, gangs, free blocks | `toughness(id)` | `lethal(id)` = `lethalDamageOf` |
| `controller.ts` `gangLoss` | what an attacker kills of a gang block | toughness | `lethalDamageOf` |
| `effect-worth.ts` `sweepWorth` | what a damage sweep kills | `toughness - damageMarked` | `lethalDamageLeft` |
| `target-polarity.ts` `damageLands`, `damageToKill` | whether damage to a target kills it; how much more is needed | `toughness - damageMarked` | `lethalDamageLeft` |

Unchanged on purpose: everything else that says "toughness" — 704.5f, bolster's "least toughness",
"damage equal to its toughness", P/T conditions, and the bots' *valuations* of a body
(`creatureValue`, `blockWorth`, the hand and target-value sums), which price a creature, not what
kills it.

## A fix on the way

`lethalFor` answered 1 for any deathtouch attacker, even against an indestructible blocker that
already had lethal damage marked; 702.19b counts damage already marked, and `Game.lethalDamageTo`
already answered 0 there. It now caps what's left at 1 instead (its own commit, with a test).

## What the bots do with it

No new knowledge of Zilortha itself: the static isn't an effect kind, so it needs no polarity entry,
and casting it is valued like any creature. What changes is that every estimate of what dies reads
the same rule the engine plays by, so under Zilortha a bot sees its 7-power creatures surviving
blocks and its 0-power walls dying to 1, and its opponents' trample past them for what the rule
allows. v2's rollouts play the real engine, so they were right already wherever they play on; the
arithmetic that ranks moves before any rollout is what needed the change. The arithmetic ignores
damage already marked, as it did (its creatures are as they'll be next turn too).

## What it leaves out

- The scenario builder's client-side cap (`client/src/builder/BuilderPanel.tsx`,
  `selectedDamageMax`) still reads the view's toughness: under Zilortha it can cap a creature
  below what it could hold, or offer more than a 0-power creature can, and the server refuses the
  latter with a message saying why. The view carries no lethal number; a dev tool's convenience,
  left for the client gaps list.
- 702.19b's "damage from other creatures that's being assigned during the same combat damage step"
  is whatever the engine did before; nothing about it changed here.
- No other printed card has this rule (`cards:needs -- --feature static:lethal-damage-by-power` lists
  Zilortha alone), so there is no "toughness rather than power" mirror to build.
