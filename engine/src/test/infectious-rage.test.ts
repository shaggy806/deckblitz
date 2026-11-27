/**
 * Infectious Rage: "When enchanted creature dies, choose a creature at random
 * this Aura can enchant. Return this card to the battlefield attached to that
 * creature." Nobody chooses (`choose-permanents` `random`), only among the
 * creatures it could enchant (`enchantableBy`, rule 303.4: protection from red
 * bars one, shroud doesn't — the rulings), from the graveyard only
 * (`fromGraveyard`), and with none it stays where it is (303.4g).
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, destroy, lands, ref, spawn, table, toHand, zone } from "./harness.js";

function rage(game: ReturnType<typeof table>["game"], on: ObjectId) {
  lands(game, "Mountain", 2);
  const aura = toHand(game, "Infectious Rage");
  cast(game, aura, { targets: [ref(on)] });
  return aura;
}

describe("Infectious Rage", () => {
  it("gives +2/-1 [Infectious Rage]", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    rage(game, giant);
    const c = computeCharacteristics(game.state, game.registry, giant);
    expect([c.power, c.toughness]).toEqual([5, 2]);
  });

  it("returns attached to a creature it can enchant, never one with protection from red [Infectious Rage]", () => {
    for (let seed = 1; seed <= 6; seed += 1) {
      const { game } = table({ seed });
      const bears = spawn(game, "Grizzly Bears", B);
      const paladin = spawn(game, "Paladin en-Vec", B);
      const shroud = spawn(game, "Argothian Enchantress", B);
      const mine = spawn(game, "Hill Giant", A);
      const aura = rage(game, bears);
      destroy(game, bears);
      expect(zone(game, aura)).toBe("battlefield");
      expect(game.state.objects[aura].controller).toBe(A);
      expect([shroud, mine]).toContain(game.state.objects[aura].attachedTo);
      expect(game.state.objects[aura].attachedTo).not.toBe(paladin);
    }
  });

  it("with no creature it can enchant, stays in the graveyard [Infectious Rage]", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Paladin en-Vec", B);
    const aura = rage(game, bears);
    destroy(game, bears);
    expect(zone(game, aura)).toBe("graveyard");
  });

  it("isn't returned from exile [Infectious Rage]", () => {
    const { game } = table();
    spawn(game, "Leyline of the Void", B);
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    const aura = rage(game, bears);
    destroy(game, bears);
    expect(zone(game, aura)).toBe("exile");
  });
});
