/**
 * "You may roll again" in a results table (rule 706.3c): a table row's
 * `mayRollAgain` — Delina, Wild Mage. Rolls come from the seeded stream, so
 * each test finds a seed that gives the row it wants and reads the rolls back.
 */
import { describe, expect, it } from "vitest";

import { effectWorth } from "../effect-worth.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import { A, B, C, life, pickTargets, spawn, supertypes, table, toStep, zone } from "./harness.js";

const rolled = (game: Game): number[] =>
  game.state.eventLog.flatMap((e) => (e.type === "dice-rolled" ? [e.results[0]] : []));

const copiesOf = (game: Game, name: string): ObjectId[] =>
  game.battlefield.filter((id) => game.state.objects[id].isToken && game.state.objects[id].cardName === name);

/** Run until the attack trigger has fully resolved. */
function toTriggerResolved(game: Game): void {
  game.advanceUntil(
    (s) =>
      s.turn.step === "declare-attackers" &&
      s.priority.holder === A &&
      s.zones.shared.stack.length === 0 &&
      s.awaiting === null &&
      s.pendingTriggers.length === 0 &&
      rolled(game).length > 0,
  );
}

/** Delina attacks with a Hill Giant at home, her trigger aimed at the Giant.
 * `again` answers "Roll again?"; `asked` counts the questions. */
function delinaAttacks(seed: number, again: boolean, players: 2 | 4 = 2, tokensAttack?: PlayerId) {
  const t = table({ seed, players });
  const { game, a } = t;
  const delina = spawn(game, "Delina, Wild Mage");
  const giant = spawn(game, "Hill Giant");
  pickTargets(a, giant);
  let asked = 0;
  a.chooseModesFn = () => {
    asked += 1;
    return again ? [0] : [];
  };
  if (tokensAttack !== undefined) {
    a.chooseAttackTargetsFn = (_view, choices) => choices.map((c) => ({ object: c.object, target: tokensAttack }));
  }
  a.declareAttackersFn = () => [{ attacker: delina, defender: B }];
  toTriggerResolved(game);
  return { ...t, delina, giant, asked: () => asked };
}

/** The first seed whose rolls satisfy `wanted`. */
function seedFor(wanted: (rolls: readonly number[]) => boolean, again: boolean): number {
  for (let seed = 1; seed < 500; seed += 1) {
    if (wanted(rolled(delinaAttacks(seed, again).game))) return seed;
  }
  throw new Error("no seed gives that roll");
}

describe("roll-dice: mayRollAgain", () => {
  it("1-14: one tapped and attacking token, nothing asked", () => {
    const seed = seedFor((r) => r[0] <= 14, false);
    const { game, giant, asked } = delinaAttacks(seed, false);
    expect(rolled(game)).toHaveLength(1);
    expect(asked()).toBe(0);
    const tokens = copiesOf(game, "Hill Giant");
    expect(tokens).toHaveLength(1);
    expect(tokens[0]).not.toBe(giant);
    expect(game.state.objects[tokens[0]].tapped).toBe(true);
    expect(game.state.objects[tokens[0]].attacking).toBe(B);
    expect(game.state.objects[giant].attacking ?? null).toBe(null);
  });

  it("15-20: the token, then the roller may decline", () => {
    const seed = seedFor((r) => r[0] >= 15, false);
    const { game, asked } = delinaAttacks(seed, false);
    expect(asked()).toBe(1);
    expect(rolled(game)).toHaveLength(1);
    expect(copiesOf(game, "Hill Giant")).toHaveLength(1);
  });

  it("a yes is another d20 on the same table and target, until a roll stops it", () => {
    // Two 15+ in a row, so the row is seen to apply to the re-rolls too.
    const seed = seedFor((r) => r[0] >= 15 && r[1] >= 15, true);
    const { game, asked } = delinaAttacks(seed, true);
    const rolls = rolled(game);
    expect(rolls.length).toBeGreaterThanOrEqual(3);
    expect(rolls.slice(0, -1).every((r) => r >= 15)).toBe(true);
    expect(rolls[rolls.length - 1]).toBeLessThanOrEqual(14);
    // One token a roll, and a question for each roll of 15 or more.
    expect(copiesOf(game, "Hill Giant")).toHaveLength(rolls.length);
    expect(asked()).toBe(rolls.length - 1);
  });

  it("the token's defender is chosen as it enters, not Delina's (rule 508.4)", () => {
    const { game, delina } = delinaAttacks(1, false, 4, C);
    expect(game.state.objects[delina].attacking).toBe(B);
    const tokens = copiesOf(game, "Hill Giant");
    expect(tokens.length).toBeGreaterThan(0);
    for (const token of tokens) expect(game.state.objects[token].attacking).toBe(C);
  });

  it("a copy of Delina isn't legendary, and wasn't declared, so it rolls nothing", () => {
    const { game, a } = table({ seed: 3 });
    const delina = spawn(game, "Delina, Wild Mage");
    pickTargets(a, delina);
    a.chooseModesFn = () => [];
    a.declareAttackersFn = () => [{ attacker: delina, defender: B }];
    toTriggerResolved(game);
    const [token] = copiesOf(game, "Delina, Wild Mage");
    expect(rolled(game)).toHaveLength(1);
    expect(supertypes(game, token)).not.toContain("legendary");
    expect(zone(game, delina)).toBe("battlefield");
    expect(zone(game, token)).toBe("battlefield");
  });

  it("a bot reads another roll as the tokens it makes", () => {
    const { game } = table();
    const token: EffectSpec = { kind: "create-token", token: "Treasure Token", count: 1 };
    const roll: EffectSpec = { kind: "roll-dice", sides: 20, table: [{ min: 1, max: 20, effect: token, mayRollAgain: true }] };
    expect(effectWorth(roll, { state: game.state, targets: [], me: A, controller: A })).toBeGreaterThan(0);
    expect(effectWorth(roll, { state: game.state, targets: [], me: B, controller: A })).toBeLessThanOrEqual(0);
  });

  it("the token exiles itself at end of combat through its own ability; the original stays", () => {
    const { game, giant } = delinaAttacks(seedFor((r) => r[0] <= 14, false), false);
    const [token] = copiesOf(game, "Hill Giant");
    expect(game.state.objects[token].zone).toBe("battlefield");
    toStep(game, "postcombat-main");
    // Delina 3 + the Giant's token 3; the Giant itself stayed home.
    expect(life(game, B)).toBe(20 - 3 - 3);
    expect(copiesOf(game, "Hill Giant")).toHaveLength(0);
    expect(zone(game, giant)).toBe("battlefield");
  });
});
