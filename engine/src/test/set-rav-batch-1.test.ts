import { describe, expect, it } from "vitest";
import { A, B, cast, lands, life, pt, ref, spawn, table, toHand, zone } from "./harness.js";

// Ravnica: City of Guilds (RAV), batch 229: the lead's cards — radiance,
// "target X and each other X that shares a color with it"
// (`CardFilter.sharesColorWithTarget`, rule 105.2).

describe("Leave No Trace", () => {
  it("destroys the target and each other enchantment sharing a color with it, whoever controls it", () => {
    const { game } = table();
    const target = spawn(game, "Glorious Anthem", B);
    const white = spawn(game, "Glorious Anthem", A);
    const black = spawn(game, "Bad Moon", B);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Leave No Trace"), { targets: [ref(target)] });
    expect([zone(game, target), zone(game, white)]).toEqual(["graveyard", "graveyard"]);
    expect(zone(game, black)).toBe("battlefield");
  });
});

describe("Rally the Righteous", () => {
  it("untaps and pumps the creatures sharing any one color with a two-color target", () => {
    const { game } = table();
    const target = spawn(game, "Boros Swiftblade", A, { tapped: true });
    const red = spawn(game, "Raging Goblin", A, { tapped: true });
    const white = spawn(game, "Savannah Lions", B, { tapped: true });
    const green = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Plateau", 3);
    cast(game, toHand(game, "Rally the Righteous"), { targets: [ref(target)] });
    for (const id of [target, red, white]) expect(game.state.objects[id].tapped).toBe(false);
    expect(game.state.objects[green].tapped).toBe(true);
    expect(pt(game, red)).toEqual({ power: 3, toughness: 1 });
    expect(pt(game, white)).toEqual({ power: 4, toughness: 1 });
    expect(pt(game, green)).toEqual({ power: 2, toughness: 2 });
  });

  it("on a colorless target, affects that one alone", () => {
    const { game } = table();
    const target = spawn(game, "Ornithopter", A, { tapped: true });
    const other = spawn(game, "Ornithopter", A, { tapped: true });
    lands(game, "Plateau", 3);
    cast(game, toHand(game, "Rally the Righteous"), { targets: [ref(target)] });
    expect(game.state.objects[target].tapped).toBe(false);
    expect(pt(game, target)).toEqual({ power: 2, toughness: 2 });
    expect(game.state.objects[other].tapped).toBe(true);
  });
});

describe("Brightflame", () => {
  it("deals X to the target and each creature sharing its color, and gains the damage dealt", () => {
    const { game } = table();
    const target = spawn(game, "Hill Giant", B);
    const red = spawn(game, "Raging Goblin", B);
    const green = spawn(game, "Grizzly Bears", B);
    lands(game, "Plateau", 6);
    const before = life(game, A);
    cast(game, toHand(game, "Brightflame"), { targets: [ref(target)], x: 2 });
    expect(zone(game, red)).toBe("graveyard");
    expect(zone(game, target)).toBe("battlefield");
    expect(game.state.objects[target].damageMarked).toBe(2);
    expect(zone(game, green)).toBe("battlefield");
    expect(life(game, A)).toBe(before + 4);
  });
});
