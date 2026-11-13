/**
 * A `prohibits` filter's amount read for the player casting — Lavinia,
 * Azorius Renegade: "each opponent can't cast noncreature spells with mana
 * value greater than the number of lands that player controls".
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, spawn, table, toHand, toStep, zone } from "./harness.js";

const at = (player: typeof A) => ({ kind: "player" as const, player });

describe("Lavinia, Azorius Renegade", () => {
  it("an opponent with two lands can't cast a three-mana noncreature spell, however many lands you have; a third land allows it", () => {
    const { game } = table();
    spawn(game, "Lavinia, Azorius Renegade");
    lands(game, "Island", 5);
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 2, B);
    spawn(game, "Sol Ring", B);
    const temper = toHand(game, "Fiery Temper", B); // MV 3, payable with the Sol Ring
    expect(() => cast(game, temper, { player: B, targets: [at(A)] })).toThrow();
    lands(game, "Mountain", 1, B);
    cast(game, temper, { player: B, targets: [at(A)] });
    expect(zone(game, temper)).toBe("graveyard");
  });

  it("a creature spell isn't restricted", () => {
    const { game } = table();
    spawn(game, "Lavinia, Azorius Renegade");
    toStep(game, "precombat-main", B);
    lands(game, "Forest", 1, B);
    spawn(game, "Sol Ring", B);
    const beast = toHand(game, "Centaur Courser", B); // MV 3
    cast(game, beast, { player: B });
    expect(zone(game, beast)).toBe("battlefield");
  });

  it("its controller isn't restricted", () => {
    const { game } = table();
    spawn(game, "Lavinia, Azorius Renegade");
    lands(game, "Mountain", 2);
    spawn(game, "Sol Ring");
    const temper = toHand(game, "Fiery Temper");
    cast(game, temper, { targets: [at(B)] });
    expect(zone(game, temper)).toBe("graveyard");
  });
});
