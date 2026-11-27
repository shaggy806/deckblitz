/**
 * An Aura returned from its graveyard after the creature it enchanted left:
 * Traveling Plague's "that creature's controller returns this Aura from its
 * owner's graveyard to the battlefield" (under that player's control, rule
 * 110.2a; what it enchants chosen by them as it enters, 303.4f; nothing to
 * enchant and it stays, 303.4g), and Takklemaggot's "that creature's
 * controller chooses a creature that this card could enchant. If the player
 * does, return this card to the battlefield under your control attached to
 * that creature. If they don't, return this card to the battlefield under
 * your control as a non-Aura enchantment."
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { computeCharacteristics } from "../characteristics.js";
import { A, B, cast, counters, destroy, lands, life, nextTurn, pickPermanents, ref, settle, spawn, table, toHand, zone } from "./harness.js";

function pickEnchant(seat: ScriptedController, pick: (options: readonly ObjectId[]) => ObjectId | PlayerId) {
  const seen = { options: [] as readonly ObjectId[], asked: 0 };
  seat.chooseEnchantFn = (_view, _source, options) => {
    seen.asked += 1;
    seen.options = options;
    return pick(options);
  };
  return seen;
}

describe("Traveling Plague", () => {
  it("shrinks its creature by its plague counters, one each upkeep", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 5);
    const plague = toHand(game, "Traveling Plague");
    cast(game, plague, { targets: [ref(giant)] });
    expect(game.state.objects[plague].attachedTo).toBe(giant);
    nextTurn(game); // Bob's upkeep
    expect(counters(game, plague, "plague")).toBe(1);
    nextTurn(game); // Alice's upkeep
    expect(counters(game, plague, "plague")).toBe(2);
    expect(zone(game, giant)).toBe("battlefield"); // a 3/3 at -2/-2
    nextTurn(game); // Bob's upkeep again: -3/-3
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("comes back under the dead creature's controller, who chooses what it enchants, with no counters", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant", A);
    const theirs = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 5);
    const plague = toHand(game, "Traveling Plague");
    cast(game, plague, { targets: [ref(bears)] });
    const seen = pickEnchant(b, () => mine);
    destroy(game, bears);
    expect(seen.asked).toBe(1);
    expect(seen.options).toEqual(expect.arrayContaining([mine, theirs]));
    expect(zone(game, plague)).toBe("battlefield");
    expect(game.state.objects[plague].controller).toBe(B);
    expect(game.state.objects[plague].attachedTo).toBe(mine);
    expect(counters(game, plague, "plague")).toBe(0);
  });

  it("returns when its creature leaves any way, but only from the graveyard", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 5);
    const plague = toHand(game, "Traveling Plague");
    cast(game, plague, { targets: [ref(bears)] });
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, plague)).toBe("battlefield");

    // Under Rest in Peace the Aura is exiled instead, and isn't returned from there.
    const { game: g2 } = table();
    spawn(g2, "Rest in Peace");
    const bears2 = spawn(g2, "Grizzly Bears", B);
    spawn(g2, "Hill Giant", B);
    lands(g2, "Swamp", 5);
    const plague2 = toHand(g2, "Traveling Plague");
    cast(g2, plague2, { targets: [ref(bears2)] });
    destroy(g2, bears2);
    expect(zone(g2, plague2)).toBe("exile");
  });

  it("with no creature to enchant, stays in the graveyard (303.4g) [Traveling Plague]", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    const plague = toHand(game, "Traveling Plague");
    cast(game, plague, { targets: [ref(bears)] });
    destroy(game, bears);
    expect(zone(game, plague)).toBe("graveyard");
  });
});

describe("Takklemaggot", () => {
  it("puts a -0/-1 counter on its creature at its controller's upkeep", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Takklemaggot"), { targets: [ref(giant)] });
    nextTurn(game); // Bob's upkeep
    expect(counters(game, giant, "-0/-1")).toBe(1);
    nextTurn(game); // Alice's upkeep: not the creature's controller's
    expect(counters(game, giant, "-0/-1")).toBe(1);
  });

  it("moves under its controller's control to a creature the dead one's controller chooses, protection barring", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const knight = spawn(game, "White Knight", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears", A);
    lands(game, "Swamp", 4);
    const maggot = toHand(game, "Takklemaggot");
    cast(game, maggot, { targets: [ref(bears)] });
    const seen = pickPermanents(b, giant);
    destroy(game, bears);
    expect(seen.offered).toEqual(expect.arrayContaining([giant, mine]));
    expect(seen.offered).not.toContain(knight); // protection from black (303.4)
    expect(zone(game, maggot)).toBe("battlefield");
    expect(game.state.objects[maggot].controller).toBe(A);
    expect(game.state.objects[maggot].attachedTo).toBe(giant);
  });

  it("with no creature to choose, returns as a non-Aura enchantment that pings that player each upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    const maggot = toHand(game, "Takklemaggot");
    cast(game, maggot, { targets: [ref(bears)] });
    destroy(game, bears);
    settle(game);
    expect(zone(game, maggot)).toBe("battlefield");
    expect(game.state.objects[maggot].controller).toBe(A);
    expect(game.state.objects[maggot].attachedTo).toBeNull();
    expect(computeCharacteristics(game.state, game.registry, maggot).subtypes).not.toContain("Aura");
    expect(game.state.objects[maggot].chosenPlayer).toBe(B);
    const bob = life(game, B);
    const alice = life(game, A);
    nextTurn(game); // Bob's upkeep
    expect(zone(game, maggot)).toBe("battlefield");
    expect(life(game, B)).toBe(bob - 1);
    nextTurn(game); // Alice's upkeep: nothing
    expect(life(game, A)).toBe(alice);
    expect(life(game, B)).toBe(bob - 1);
  });
});
