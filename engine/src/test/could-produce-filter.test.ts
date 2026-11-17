/**
 * `CardFilter.couldProduce` — "a land that could produce {C}" (rule 106.7):
 * one of its mana abilities would make that type if it resolved now, whether
 * or not it could be activated (a tapped land counts — Obsidian Charmaw's
 * ruling). Read by the game playing the state (`Game.couldProduce`). Obsidian
 * Charmaw (a cost reduction's count) and Break the Ice (a target, and
 * overloaded a `destroy-all`).
 */

import { describe, expect, it } from "vitest";

import { matchesFilter } from "../filter.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, pickTargets, ref, registryOf, spawn, table, toHand, watchTargets, zone } from "./harness.js";

const couldProduceC = (game: ReturnType<typeof table>["game"], id: ObjectId): boolean =>
  matchesFilter(game.state, registryOf(game), id, { couldProduce: "C" }, { you: A });

describe("couldProduce (rule 106.7)", () => {
  it("a land with a mana ability making {C} could produce it; a basic Forest, Command Tower and a creature could not", () => {
    const { game } = table();
    expect(couldProduceC(game, spawn(game, "Wastes", B))).toBe(true);
    expect(couldProduceC(game, spawn(game, "Reliquary Tower", B))).toBe(true);
    // {T}: Add {C} beside {1}, {T}: any color.
    expect(couldProduceC(game, spawn(game, "Shimmering Grotto", B))).toBe(true);
    expect(couldProduceC(game, spawn(game, "Forest", B))).toBe(false);
    expect(couldProduceC(game, spawn(game, "Command Tower", B))).toBe(false);
    expect(couldProduceC(game, spawn(game, "Grizzly Bears", B))).toBe(false);
    expect(
      matchesFilter(game.state, registryOf(game), spawn(game, "Forest", B), { couldProduce: "G" }, { you: A }),
    ).toBe(true);
  });

  it("a tapped land still could (Obsidian Charmaw's ruling)", () => {
    const { game } = table();
    const wastes = spawn(game, "Wastes", B, { tapped: true });
    expect(couldProduceC(game, wastes)).toBe(true);
  });
});

describe("Obsidian Charmaw", () => {
  it("costs {1} less for each land its caster's opponents control that could produce {C} — tapped ones too, not its caster's own", () => {
    const { game, a } = table();
    spawn(game, "Wastes", B);
    const tower = spawn(game, "Reliquary Tower", B, { tapped: true });
    spawn(game, "Forest", B);
    // Alice's own Wastes doesn't count; tapped, it pays nothing either.
    spawn(game, "Wastes", A, { tapped: true });
    lands(game, "Mountain", 3);
    pickTargets(a, tower);
    const charmaw = toHand(game, "Obsidian Charmaw");
    cast(game, charmaw);
    expect(zone(game, charmaw)).toBe("battlefield");
  });

  it("with only one such land, three mana isn't enough", () => {
    const { game } = table();
    spawn(game, "Wastes", B);
    spawn(game, "Forest", B);
    lands(game, "Mountain", 3);
    const charmaw = toHand(game, "Obsidian Charmaw");
    expect(() => cast(game, charmaw)).toThrow(/mana|pay|afford|cost/i);
  });

  it("enters: destroys target nonbasic land an opponent controls — not a basic one, nor its controller's own", () => {
    const { game, a } = table();
    const tower = spawn(game, "Reliquary Tower", B);
    const grotto = spawn(game, "Shimmering Grotto", B);
    const wastes = spawn(game, "Wastes", B);
    const own = spawn(game, "Reliquary Tower", A);
    lands(game, "Mountain", 5);
    const seen = watchTargets(a, () => [tower]);
    cast(game, toHand(game, "Obsidian Charmaw"));
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([tower, grotto]));
    expect(seen.offered[0]).not.toContain(wastes);
    expect(seen.offered[0]).not.toContain(own);
    expect(zone(game, tower)).toBe("graveyard");
    expect(zone(game, grotto)).toBe("battlefield");
  });
});

describe("Break the Ice", () => {
  it("destroys target land that is snow, or that could produce {C}", () => {
    const { game } = table();
    const snow = spawn(game, "Snow-Covered Forest", B);
    const wastes = spawn(game, "Wastes", B);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Break the Ice"), { targets: [ref(wastes)] });
    expect(zone(game, wastes)).toBe("graveyard");
    expect(zone(game, snow)).toBe("battlefield");
    cast(game, toHand(game, "Break the Ice"), { targets: [ref(snow)] });
    expect(zone(game, snow)).toBe("graveyard");
  });

  it("can't target a plain Forest", () => {
    const { game } = table();
    const forest = spawn(game, "Forest", B);
    lands(game, "Swamp", 2);
    expect(() => cast(game, toHand(game, "Break the Ice"), { targets: [ref(forest)] })).toThrow(/target/i);
  });

  it("overloaded: destroys each land that is snow or could produce {C}, whoever controls it", () => {
    const { game } = table();
    const snow = spawn(game, "Snow-Covered Forest", B);
    const tower = spawn(game, "Reliquary Tower", B);
    const forest = spawn(game, "Forest", B);
    const ownWastes = spawn(game, "Wastes", A, { tapped: true });
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Break the Ice"), { overload: true });
    expect(zone(game, snow)).toBe("graveyard");
    expect(zone(game, tower)).toBe("graveyard");
    expect(zone(game, ownWastes)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
  });
});
