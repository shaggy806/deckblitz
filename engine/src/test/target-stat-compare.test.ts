/**
 * "…target nonland permanent an opponent controls with equal or lesser mana
 * value" (Puca's Mischief), "…target creature with power less than or equal
 * to that creature's power" (Spawnbroker): an `other` slot's `compares`, the
 * slot's stat against the slot `than` names — the pair chosen as a set (rule
 * 601.2c) and judged again as it resolves (608.2b).
 */
import { describe, expect, it } from "vitest";

import { otherSlotConflict, slotOptions, targetsFillable, type TargetSpec } from "../target.js";
import { stateTargetFacts } from "../targeting.js";
import { A, B, controller, enter, nextTurn, pickModes, pickTargets, ref, settle, spawn, table, toStep } from "./harness.js";

const pucaSpecs: readonly TargetSpec[] = [
  { kind: "permanent", whose: "you", filter: { notTypes: ["land"] } },
  {
    kind: "other",
    of: { kind: "permanent", whose: "opponent", filter: { notTypes: ["land"] } },
    than: { slot: 0 },
    compares: { stat: "mana-value", op: "lte" },
  },
];

describe("a target slot compared with another's stat", () => {
  it("offers the second slot only what keeps the comparison, and refuses a broken pair", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring"); // mana value 1
    const giant = spawn(game, "Hill Giant"); // 4
    const bears = spawn(game, "Grizzly Bears", B); // 2
    const wurm = spawn(game, "Craw Wurm", B); // 6
    const facts = stateTargetFacts(game.state, game.registry);
    const options = [
      [ref(ring), ref(giant)],
      [ref(bears), ref(wurm)],
    ];
    expect(slotOptions(pucaSpecs, options, 1, [ref(giant)], facts)).toEqual([ref(bears)]);
    expect(slotOptions(pucaSpecs, options, 1, [ref(ring)], facts)).toEqual([]);
    // Chosen as a set: the Sol Ring has no second target, so it can't be the first.
    expect(targetsFillable(pucaSpecs, [[ref(ring)], options[1]], [], 0, facts)).toBe(false);
    expect(targetsFillable(pucaSpecs, options, [], 0, facts)).toBe(true);
    expect(otherSlotConflict(pucaSpecs, [ref(giant), ref(wurm)], facts)).toEqual({ slot: 1, than: 0 });
    expect(otherSlotConflict(pucaSpecs, [ref(giant), ref(bears)], facts)).toBeNull();
  });

  it("Puca's Mischief: at your upkeep, exchanges control with a permanent of equal or lesser mana value", () => {
    const { game, a } = table();
    spawn(game, "Puca's Mischief");
    const giant = spawn(game, "Hill Giant");
    const giants = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, giant, giants);
    pickModes(a, 0);
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    settle(game);
    expect(controller(game, giants)).toBe(A);
    expect(controller(game, giant)).toBe(B);
    expect(controller(game, wurm)).toBe(B);
  });

  it("Spawnbroker: a power that's grown past the first target's by the time it resolves stops the exchange", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    pickTargets(a, bears, elves);
    pickModes(a, 0);
    enter(game, "Spawnbroker", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    // In response, the Elves grow to 3 power: no longer at most the Bears'.
    game.debugApplyEffect(B, { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" }, [ref(elves)]);
    settle(game);
    expect(controller(game, elves)).toBe(B);
    expect(controller(game, bears)).toBe(A);
  });

  it("Spawnbroker: exchanges with a creature of equal or lesser power", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    pickTargets(a, bears, elves);
    pickModes(a, 0);
    enter(game, "Spawnbroker");
    expect(controller(game, elves)).toBe(A);
    expect(controller(game, bears)).toBe(B);
    toStep(game, "end");
  });
});
