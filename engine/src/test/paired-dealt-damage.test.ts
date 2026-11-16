/**
 * "Whenever Donna Noble or a creature it's paired with is dealt damage"
 * (Donna Noble): a `dealt-damage` trigger whose filter is `anyOf` this
 * permanent (`isSource`) and the creature it's paired with by soulbond
 * (`pairedWithSource`, rule 702.95b), read as the damage is dealt. Its
 * rulings: both dealt damage at once trigger it twice, and lethal damage
 * still triggers it.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, enter, life, pickPermanents, pickTargets, ref, settle, spawn, table, zone } from "./harness.js";

/** Bob's Mountain deals `amount` damage to `to`. */
function hit(game: Game, to: ObjectId, amount: number): void {
  const mountain = spawn(game, "Mountain", B);
  game.debugApplyEffect(B, { kind: "damage", amount, target: 0 }, [ref(to)], { source: mountain });
  settle(game);
}

describe("Donna Noble — she or the creature she's paired with is dealt damage", () => {
  it("Donna dealt damage: that much to target opponent", () => {
    const { game, a } = table();
    pickTargets(a, B);
    const donna = enter(game, "Donna Noble");
    hit(game, donna, 3);
    expect(life(game, B)).toBe(17);
  });

  it("the creature she's paired with dealt damage; another creature, nothing", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, giant);
    pickTargets(a, B);
    const donna = enter(game, "Donna Noble");
    expect(game.state.objects[donna].pairedWith).toBe(giant);
    hit(game, giant, 2);
    expect(life(game, B)).toBe(18);
    hit(game, bears, 1);
    expect(life(game, B)).toBe(18);
  });

  it("unpaired: only Donna herself", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    pickPermanents(a);
    pickTargets(a, B);
    const donna = enter(game, "Donna Noble");
    expect(game.state.objects[donna].pairedWith).toBeUndefined();
    hit(game, giant, 2);
    expect(life(game, B)).toBe(20);
  });

  it("both dealt damage at once trigger it twice, lethal damage included", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    pickTargets(a, B);
    enter(game, "Donna Noble");
    const mountain = spawn(game, "Mountain", B);
    game.debugApplyEffect(B, { kind: "damage-all", filter: { type: "creature" }, amount: 2 }, [], { source: mountain });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
  });
});
