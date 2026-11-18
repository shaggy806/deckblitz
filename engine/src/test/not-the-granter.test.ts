/**
 * "Other than [this Equipment]" in a trigger it grants: the `notObject`
 * filter clause, `"granter"` here — the one object that grants it (rule
 * 201.5a), bound as the effect applies, and not a second permanent of the
 * same name. Dire Blunderbuss's "you may sacrifice an artifact other than
 * Dire Blunderbuss. When you do, this creature deals damage equal to its
 * power to target creature" (603.12), and its front face, Dire Flail.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import { A, B, activate, attack, lands, pickFromZone, pickModes, pickTargets, pt, spawn, table, toStep, zone } from "./harness.js";

const equipTo = (game: Game, equipment: ObjectId, creature: ObjectId): void => {
  game.state.objects[equipment].attachedTo = creature;
};

const damageOn = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

/** A Dire Flail turned to its back face. */
const blunderbuss = (game: Game): ObjectId => {
  const id = spawn(game, "Dire Flail");
  game.state.objects[id].face = 1;
  return id;
};

describe("Dire Blunderbuss — an artifact other than Dire Blunderbuss", () => {
  it("never offers the Blunderbuss itself; sacrificing another, the creature deals its power", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const gun = blunderbuss(game);
    equipTo(game, gun, bears);
    const thopter = spawn(game, "Ornithopter");
    const other = spawn(game, "Ornithopter");
    const giant = spawn(game, "Hill Giant", B);
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [thopter];
    };
    pickModes(a, 0);
    pickTargets(a, giant);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    attack(game, a, [bears]);
    expect(new Set(offered)).toEqual(new Set([thopter, other]));
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
    expect(zone(game, gun)).toBe("battlefield");
    // 5 damage: Grizzly Bears' 2 power and the +3/+0.
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("with no other artifact, nothing can be sacrificed and nothing is dealt", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const gun = blunderbuss(game);
    equipTo(game, gun, bears);
    const golem = spawn(game, "Hill Giant", B);
    a.chooseSacrificesFn = (_view, eligible) => [...eligible];
    pickModes(a, 0);
    pickTargets(a, golem);
    attack(game, a, [bears]);
    expect(zone(game, gun)).toBe("battlefield");
    expect(damageOn(game, golem)).toBe(0);
  });

  it("a second Dire Blunderbuss isn't the one granting it, so it can go", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const gun = blunderbuss(game);
    equipTo(game, gun, bears);
    const spare = blunderbuss(game);
    const thopter = spawn(game, "Ornithopter");
    const giant = spawn(game, "Hill Giant", B);
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [spare];
    };
    pickModes(a, 0);
    pickTargets(a, giant);
    attack(game, a, [bears]);
    expect(new Set(offered)).toEqual(new Set([spare, thopter]));
    expect(zone(game, spare)).toBe("graveyard");
    expect(zone(game, gun)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("declined, nothing is sacrificed", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const gun = blunderbuss(game);
    equipTo(game, gun, bears);
    const thopter = spawn(game, "Ornithopter");
    a.chooseSacrificesFn = () => [];
    attack(game, a, [bears]);
    expect(zone(game, thopter)).toBe("battlefield");
  });
});

describe("Dire Flail", () => {
  it("gives +2/+0, and crafts with an artifact into Dire Blunderbuss", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const flail = spawn(game, "Dire Flail");
    equipTo(game, flail, bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    lands(game, "Mountain", 5);
    const thopter = spawn(game, "Ornithopter");
    pickFromZone(a, thopter);
    toStep(game, "precombat-main");
    activate(game, flail, 1);
    expect(zone(game, thopter)).toBe("exile");
    expect(printedCardName(game.state.objects[flail])).toBe("Dire Blunderbuss");
    expect(game.state.objects[flail].controller).toBe(A);
  });
});
