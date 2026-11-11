/**
 * "This effect doesn't remove this Aura" and "… Auras" (rule 702.16n) beyond card
 * types: White Ward's named colour, Cho-Manno's Blessing's chosen one, Pledge of
 * Loyalty's "each color among permanents you control" and Spectra Ward's every
 * Aura. Only the state-based action is spared: protection still stops targeting,
 * and another instance of the same quality still removes the Aura.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { computeCharacteristics } from "../characteristics.js";
import type { ObjectId } from "../index.js";
import { B, cast, destroy, lands, named, pt, ref, registryOf, spawn, table, toHand, zone } from "./harness.js";

const on = (game: Game, name: string, host: ObjectId): ObjectId => {
  const aura = spawn(game, name);
  game.state.objects[aura].attachedTo = host;
  return aura;
};

/** State-based actions are checked: any spell resolving does it. */
const check = (game: Game): void => {
  lands(game, "Forest", 1);
  cast(game, toHand(game, "Giant Growth"), { targets: [ref(spawn(game, "Savannah Lions"))] });
};

const colorsFrom = (game: Game, id: ObjectId): readonly string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).protectionFrom.colors].sort();

describe("White Ward", () => {
  it("stays on the creature, which has protection from white", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "White Ward"), { targets: [ref(bears)] });
    const [ward] = named(game, "White Ward");
    expect(game.state.objects[ward].attachedTo).toBe(bears);
    expect(colorsFrom(game, bears)).toEqual(["W"]);
  });

  it("another white Aura falls off, and a non-white one stays", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const pacifism = on(game, "Pacifism", bears);
    const blue = on(game, "Claustrophobia", bears);
    const ward = on(game, "White Ward", bears);
    check(game);
    expect(zone(game, ward)).toBe("battlefield");
    expect(zone(game, pacifism)).toBe("graveyard");
    expect(zone(game, blue)).toBe("battlefield");
  });

  it("still stops a white spell targeting the creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    on(game, "White Ward", bears);
    lands(game, "Plains", 1);
    expect(() => cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(bears)] })).toThrow();
  });

  it("two White Wards remove each other (the other instance)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const first = on(game, "White Ward", bears);
    const second = on(game, "White Ward", bears);
    check(game);
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
  });

  it("…and a white Equipment falls off in that same check (rule 704.3)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const maul = on(game, "Maul of the Skyclaves", bears);
    const first = on(game, "White Ward", bears);
    const second = on(game, "White Ward", bears);
    check(game);
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
    expect(zone(game, maul)).toBe("battlefield");
    expect(game.state.objects[maul].attachedTo ?? null).toBeNull();
  });
});

describe("Black Ward", () => {
  it("is spared by its own effect once it has become black", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const ward = on(game, "Black Ward", bears);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Deathlace"), { targets: [ref(ward)] });
    expect(zone(game, ward)).toBe("battlefield");
    expect(game.state.objects[ward].attachedTo).toBe(bears);
  });
});

describe("Cho-Manno's Blessing", () => {
  it("has flash, and stays on naming white", () => {
    const t = table();
    const bears = spawn(t.game, "Grizzly Bears");
    lands(t.game, "Plains", 2);
    t.a.chooseCreatureTypeFn = () => "W";
    cast(t.game, toHand(t.game, "Cho-Manno's Blessing"), { targets: [ref(bears)] });
    const [blessing] = named(t.game, "Cho-Manno's Blessing");
    expect(t.game.state.objects[blessing].attachedTo).toBe(bears);
    expect(colorsFrom(t.game, bears)).toEqual(["W"]);
  });
});

describe("Pledge of Loyalty", () => {
  it("reads each color among your permanents, itself included, as they change", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const pledge = on(game, "Pledge of Loyalty", bears);
    expect(colorsFrom(game, bears)).toEqual(["G", "W"]);
    const piker = spawn(game, "Goblin Piker");
    expect(colorsFrom(game, bears)).toEqual(["G", "R", "W"]);
    destroy(game, piker);
    expect(colorsFrom(game, bears)).toEqual(["G", "W"]);
    expect(zone(game, pledge)).toBe("battlefield");
  });

  it("is its controller's permanents, not the creature's controller's", () => {
    const { game } = table();
    const bears = spawn(game, "Goblin Piker", B);
    on(game, "Pledge of Loyalty", bears);
    expect(colorsFrom(game, bears)).toEqual(["W"]);
  });

  it("spares itself alone: another white Aura falls off", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const pacifism = on(game, "Pacifism", bears);
    const pledge = on(game, "Pledge of Loyalty", bears);
    check(game);
    expect(zone(game, pledge)).toBe("battlefield");
    expect(zone(game, pacifism)).toBe("graveyard");
  });
});

describe("Spectra Ward", () => {
  it("gets +2/+2 and leaves every Aura on, itself and another white one", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const pacifism = on(game, "Pacifism", bears);
    const ward = on(game, "Spectra Ward", bears);
    check(game);
    expect(zone(game, ward)).toBe("battlefield");
    expect(zone(game, pacifism)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(colorsFrom(game, bears)).toEqual(["B", "G", "R", "U", "W"]);
  });

  it("still stops a coloured Aura spell targeting it (the ruling)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    on(game, "Spectra Ward", bears);
    lands(game, "Plains", 2);
    expect(() => cast(game, toHand(game, "Pacifism"), { targets: [ref(bears)] })).toThrow();
  });

  it("falls off once the creature has protection from white another way (the ruling)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const ward = on(game, "Spectra Ward", bears);
    const white = on(game, "White Ward", bears);
    check(game);
    // White Ward's instance removes Spectra Ward; Spectra Ward's removes nothing.
    expect(zone(game, ward)).toBe("graveyard");
    expect(zone(game, white)).toBe("battlefield");
  });
});
