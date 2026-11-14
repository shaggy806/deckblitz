/**
 * A planeswalker that isn't put into its owner's graveyard for having 0
 * loyalty (rule 704.5i passed over — `zeroLoyaltySurvives`): Sanctum Lurker.
 * Written from the Oracle text and its rulings.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, counters, destroy, enter, lands, life, named, ref, spawn, table, toHand, toStep, zone } from "./harness.js";

const jaceToken = (game: Game): ObjectId => {
  const [jace] = named(game, "Jace Token", A);
  if (jace === undefined) throw new Error("no Jace token");
  return jace;
};

/** A 3-loyalty `id` brought to 0 by Alice's Lightning Bolt (rule 120.3c), a
 * real spell, so the state-based actions are checked after it. */
const setLoyalty = (game: Game, id: ObjectId, n: 0): void => {
  expect(counters(game, id, "loyalty") - n).toBe(3);
  lands(game, "Mountain", 1);
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(id)] });
  expect(counters(game, id, "loyalty")).toBe(0);
};

describe("Sanctum Lurker", () => {
  it("empowers Jace 1, and the Jace token stays at 0 loyalty after its −1", () => {
    const { game } = table();
    enter(game, "Sanctum Lurker");
    const jace = jaceToken(game);
    expect(counters(game, jace, "loyalty")).toBe(1);
    toStep(game, "postcombat-main");
    // −1: Surveil 1.
    activate(game, jace, 0);
    expect(counters(game, jace, "loyalty")).toBe(0);
    expect(zone(game, jace)).toBe("battlefield");
  });

  it("a 0-loyalty planeswalker can activate the granted +2 (the ruling)", () => {
    const { game } = table();
    spawn(game, "Sanctum Lurker");
    const beleren = spawn(game, "Jace Beleren");
    setLoyalty(game, beleren, 0);
    expect(zone(game, beleren)).toBe("battlefield");
    const printed = game.registry.get("Jace Beleren").activated.length;
    activate(game, beleren, printed);
    expect(counters(game, beleren, "loyalty")).toBe(2);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });

  it("but not a loyalty ability that removes counters it doesn't have (rule 606.6)", () => {
    const { game } = table();
    spawn(game, "Sanctum Lurker");
    const beleren = spawn(game, "Jace Beleren");
    setLoyalty(game, beleren, 0);
    const minus = game.registry.get("Jace Beleren").activated.findIndex((a) => a.loyaltyCost === -1);
    expect(() => activate(game, beleren, minus)).toThrow();
    expect(zone(game, beleren)).toBe("battlefield");
  });

  it("once it leaves, a 0-loyalty planeswalker goes to the graveyard", () => {
    const { game } = table();
    const lurker = spawn(game, "Sanctum Lurker");
    const beleren = spawn(game, "Jace Beleren");
    setLoyalty(game, beleren, 0);
    expect(zone(game, beleren)).toBe("battlefield");
    destroy(game, lurker);
    // The next check of the state-based actions.
    toStep(game, "begin-combat");
    expect(zone(game, beleren)).toBe("graveyard");
  });

  it("covers only planeswalkers you control", () => {
    const { game } = table();
    spawn(game, "Sanctum Lurker");
    const theirs = spawn(game, "Jace Beleren", B);
    setLoyalty(game, theirs, 0);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});
