/**
 * Lorwyn (LRW; B192), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, cast, destroy, keywords, settle, lands, life, pt, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Elvish Branchbender", () => {
  it("makes any Forest an X/X Treefolk, X locked as the ability resolves", () => {
    const { game } = table();
    const bender = spawn(game, "Elvish Branchbender");
    const elf = spawn(game, "Llanowar Elves");
    const [forest] = lands(game, "Forest", 1, B);
    activate(game, bender, 0, { targets: [ref(forest)] });
    expect(pt(game, forest)).toEqual({ power: 2, toughness: 2 });
    expect(game.state.objects[forest].controller).toBe(B);
    // Losing an Elf later doesn't shrink it.
    destroy(game, elf);
    settle(game);
    expect(zone(game, elf)).toBe("graveyard");
    expect(pt(game, forest)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Wellgabber Apothecary", () => {
  it("targets only a tapped Merfolk or Kithkin and prevents all damage to it", () => {
    const { game } = table();
    const apothecary = spawn(game, "Wellgabber Apothecary");
    const untapped = spawn(game, "Kithkin Greatheart");
    const tapped = spawn(game, "Kithkin Greatheart", A, { tapped: true });
    lands(game, "Plains", 4);
    lands(game, "Mountain", 1);
    expect(() => activate(game, apothecary, 0, { targets: [ref(untapped)] })).toThrow();
    activate(game, apothecary, 0, { targets: [ref(tapped)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("battlefield");
  });
});

describe("Heal the Scars", () => {
  it("gains life equal to the target's toughness", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B); // 3/3
    lands(game, "Forest", 4);
    cast(game, toHand(game, "Heal the Scars"), { targets: [ref(giant)] });
    expect(life(game, A)).toBe(23);
  });
});

describe("Fistful of Force", () => {
  it("gives +4/+4 and trample on a win", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Fistful of Force"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bear).has("trample")).toBe(true);
  });

  it("gives just +2/+2 on a loss", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    toLibrary(game, "Wastes", A);
    toLibrary(game, "Hill Giant", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Fistful of Force"), { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bear).has("trample")).toBe(false);
  });
});

describe("Kithkin Greatheart", () => {
  it("gets +1/+1 and first strike only while you control a Giant", () => {
    const { game } = table();
    const kithkin = spawn(game, "Kithkin Greatheart");
    spawn(game, "Hill Giant", B);
    expect(pt(game, kithkin)).toEqual({ power: 2, toughness: 1 });
    spawn(game, "Hill Giant", A);
    expect(pt(game, kithkin)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, kithkin).has("first-strike")).toBe(true);
  });
});
