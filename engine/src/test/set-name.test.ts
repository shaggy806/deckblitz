/**
 * A name an effect gives a permanent: a static's for as long as it applies, a
 * one-shot's for good. Its only name, read by everything that reads a name, and
 * not a copiable value.
 *
 * Proving cards: Witness Protection, Honest Work, Awakening of Vitu-Ghazi.
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics, effectiveSupertypes } from "../characteristics.js";
import { matchesFilter } from "../filter.js";
import { nameOf } from "../state.js";
import {
  A,
  B,
  cast,
  keywords,
  lands,
  nextTurn,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";

describe("a static that names", () => {
  it("Witness Protection: one name, a 1/1 green and white Citizen with no abilities", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Witness Protection"), { targets: [ref(angel)] });
    const object = game.state.objects[angel];
    expect(nameOf(object)).toBe("Legitimate Businessperson");
    expect(game.viewFor(A).objects[angel]?.name).toBe("Legitimate Businessperson");
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect(types(game, angel)).toEqual(["creature"]);
    expect(subtypes(game, angel)).toEqual(["Citizen"]);
    expect([...computeCharacteristics(game.state, registryOf(game), angel).colors].sort()).toEqual(["G", "W"]);
    expect(keywords(game, angel).has("flying")).toBe(false);
    // Its old name is no longer one it has (rule 201.2).
    expect(matchesFilter(game.state, registryOf(game), angel, { name: "Serra Angel" }, { you: A })).toBe(false);
    expect(matchesFilter(game.state, registryOf(game), angel, { name: "Legitimate Businessperson" }, { you: A })).toBe(true);
  });

  it("the name goes with the Aura", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 1);
    const aura = toHand(game, "Witness Protection");
    cast(game, aura, { targets: [ref(angel)] });
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Disenchant"), { targets: [ref(aura)] });
    expect(zone(game, aura)).toBe("graveyard");
    expect(nameOf(game.state.objects[angel])).toBe("Serra Angel");
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
  });

  it("the legend rule goes by the name it has", () => {
    const { game, b } = table();
    const first = spawn(game, "Isamaru, Hound of Konda", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Witness Protection"), { targets: [ref(first)] });
    // Another Isamaru: the first isn't named that any more, and stays.
    const second = spawn(game, "Isamaru, Hound of Konda", B);
    settle(game);
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield");
    // Two with the name given: both legendary and named alike, one goes.
    const aura = toHand(game, "Witness Protection");
    lands(game, "Island", 1);
    b.chooseLegendToKeepFn = (_view, _name, options) => options[0];
    cast(game, aura, { targets: [ref(second)] });
    expect([zone(game, first), zone(game, second)].filter((z) => z === "graveyard")).toHaveLength(1);
  });

  it("a copy of it isn't named that, and copies what's printed (rule 707.2)", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 6);
    cast(game, toHand(game, "Witness Protection"), { targets: [ref(angel)] });
    cast(game, toHand(game, "Clone"));
    const clones = game.state.zones.shared.battlefield.filter(
      (id) => id !== angel && game.state.objects[id].cardName === "Clone",
    );
    expect(clones).toHaveLength(1);
    expect(nameOf(game.state.objects[clones[0]])).toBe("Serra Angel");
    expect(pt(game, clones[0])).toEqual({ power: 4, toughness: 4 });
  });

  it("Honest Work: tapped, no counters, a Citizen with a mana ability and its colors", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    game.state.objects[angel].counters["+1/+1"] = 3;
    lands(game, "Island", 1);
    cast(game, toHand(game, "Honest Work"), { targets: [ref(angel)] });
    const object = game.state.objects[angel];
    expect(object.tapped).toBe(true);
    expect(object.counters["+1/+1"] ?? 0).toBe(0);
    expect(nameOf(object)).toBe("Humble Merchant");
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 1 });
    expect(subtypes(game, angel)).toEqual(["Citizen"]);
    expect([...computeCharacteristics(game.state, registryOf(game), angel).colors]).toEqual(["W"]);
    expect(keywords(game, angel).has("flying")).toBe(false);
    // Its one ability pays for a spell, on its controller's next turn.
    nextTurn(game);
    const ring = toHand(game, "Sol Ring", B);
    cast(game, ring, { player: B });
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.state.objects[angel].tapped).toBe(true);
  });

  it("Honest Work can't enchant your own creature", () => {
    const { game } = table();
    const mine = spawn(game, "Serra Angel");
    lands(game, "Island", 1);
    expect(() => cast(game, toHand(game, "Honest Work"), { targets: [ref(mine)] })).toThrow();
  });
});

describe("a one-shot that names", () => {
  it("Awakening of Vitu-Ghazi: a legendary 9/9 Elemental land with haste named Vitu-Ghazi", () => {
    const { game } = table();
    const forest = spawn(game, "Forest");
    lands(game, "Forest", 5);
    cast(game, toHand(game, "Awakening of Vitu-Ghazi"), { targets: [ref(forest)] });
    expect(nameOf(game.state.objects[forest])).toBe("Vitu-Ghazi");
    expect(pt(game, forest)).toEqual({ power: 9, toughness: 9 });
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, forest)).toEqual(expect.arrayContaining(["Forest", "Elemental"]));
    expect(effectiveSupertypes(game.state, registryOf(game), game.state.objects[forest])).toContain("legendary");
    // A copiable value it doesn't have: the printed ones stay as they are.
    expect(supertypes(game, forest)).not.toContain("legendary");
    expect(keywords(game, forest).has("haste")).toBe(true);
  });

  it("two Vitu-Ghazis meet the legend rule", () => {
    const { game, a } = table();
    const first = spawn(game, "Forest");
    const second = spawn(game, "Forest");
    lands(game, "Forest", 10);
    a.chooseLegendToKeepFn = (_view, _name, options) => options[0];
    cast(game, toHand(game, "Awakening of Vitu-Ghazi"), { targets: [ref(first)] });
    cast(game, toHand(game, "Awakening of Vitu-Ghazi"), { targets: [ref(second)] });
    expect([zone(game, first), zone(game, second)].filter((z) => z === "graveyard")).toHaveLength(1);
  });
});
