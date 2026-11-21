/**
 * A permanent spell that gains a triggered ability from a resolving delayed
 * trigger keeps it as the permanent it becomes (rule 400.7a) — Cherished
 * Hatchling's "whenever you cast a Dinosaur spell this turn, it gains 'When
 * this creature enters, you may have it fight another target creature'", and
 * its Dinosaurs cast as though they had flash.
 */
import { describe, expect, it } from "vitest";
import { B, cast, destroy, lands, nextTurn, pickModes, pickTargets, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("Cherished Hatchling", () => {
  it("lets Dinosaurs be cast at instant speed that turn, and each enters with a fight trigger", () => {
    const { game, a } = table();
    const hatchling = spawn(game, "Cherished Hatchling");
    lands(game, "Forest", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, hatchling);
    expect(zone(game, hatchling)).toBe("graveyard");
    toStep(game, "end");
    const dreadmaw = toHand(game, "Colossal Dreadmaw");
    pickTargets(a, bears);
    pickModes(a, 0);
    cast(game, dreadmaw);
    expect(zone(game, dreadmaw)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[dreadmaw].damageMarked).toBe(2);
  });

  it("gives nothing to a Dinosaur cast on a later turn, nor flash", () => {
    const { game, a } = table();
    const hatchling = spawn(game, "Cherished Hatchling");
    lands(game, "Forest", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, hatchling);
    nextTurn(game);
    nextTurn(game);
    const dreadmaw = toHand(game, "Colossal Dreadmaw");
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [null];
    };
    cast(game, dreadmaw);
    expect(asked).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("can't cast a Dinosaur at instant speed before it dies", () => {
    const { game } = table();
    spawn(game, "Cherished Hatchling");
    lands(game, "Forest", 6);
    toStep(game, "end");
    const dreadmaw = toHand(game, "Colossal Dreadmaw");
    expect(() => cast(game, dreadmaw)).toThrow(/refused/);
  });
});
