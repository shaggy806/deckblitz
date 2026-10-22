/**
 * Ice Age, group C (B136): the clause most likely to be wrong on each card
 * that is more than a stat line or a copy of a tested pattern.
 */
import { describe, expect, it } from "vitest";
import { A, B, activate, cast, destroy, enter, lands, life, pickTargets, pt, ref, settle, spawn, table, toGraveyard, toHand, toStep, zone } from "./harness.js";

describe("Lhurgoyf", () => {
  it("counts creature cards in every graveyard, toughness one more", () => {
    const { game } = table();
    const goyf = spawn(game, "Lhurgoyf");
    expect(pt(game, goyf)).toEqual({ power: 0, toughness: 1 });
    toGraveyard(game, "Grizzly Bears", A);
    toGraveyard(game, "Hill Giant", B);
    toGraveyard(game, "Island", B);
    expect(pt(game, goyf)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Hecatomb", () => {
  it("stays when four creatures are sacrificed", () => {
    const { game, a } = table();
    const creatures = [0, 1, 2, 3].map(() => spawn(game, "Grizzly Bears"));
    a.chooseModesFn = () => [0];
    a.chooseSacrificesFn = () => creatures;
    const hecatomb = enter(game, "Hecatomb");
    expect(zone(game, hecatomb)).toBe("battlefield");
    expect(creatures.every((c) => zone(game, c) === "graveyard")).toBe(true);
  });

  it("is sacrificed with only three creatures, and none of them goes", () => {
    const { game, a } = table();
    const creatures = [0, 1, 2].map(() => spawn(game, "Grizzly Bears"));
    a.chooseModesFn = () => [0];
    a.chooseSacrificesFn = () => creatures;
    const hecatomb = enter(game, "Hecatomb");
    expect(zone(game, hecatomb)).toBe("graveyard");
    expect(creatures.every((c) => zone(game, c) === "battlefield")).toBe(true);
  });
});

describe("Fiery Justice", () => {
  it("divides 5 damage as cast, then the target opponent gains 5", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    pickTargets(a, B, bears, B);
    cast(game, toHand(game, "Fiery Justice"), { targets: [ref(B), ref(bears), ref(B)], division: [2, 3] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(22);
  });

  it("still gains the opponent 5 life when every damage target is gone", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Fiery Justice"), { targets: [ref(B), ref(bears)], division: [5], settle: false });
    destroy(game, bears);
    settle(game);
    expect(life(game, B)).toBe(25);
  });
});

describe("Gangrenous Zombies", () => {
  it("deals 2 to each creature and player with a snow Swamp, 1 without", () => {
    const { game } = table();
    const zombies = spawn(game, "Gangrenous Zombies");
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Snow-Covered Swamp");
    activate(game, zombies);
    expect(zone(game, zombies)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
    expect(game.state.objects[giant].damageMarked).toBe(2);

    const second = table();
    const plain = spawn(second.game, "Gangrenous Zombies");
    spawn(second.game, "Swamp");
    activate(second.game, plain);
    expect(life(second.game, B)).toBe(19);
  });
});

describe("Kjeldoran Elite Guard", () => {
  it("only in combat; sacrificed when the pumped creature leaves this turn", () => {
    const { game } = table();
    const guard = spawn(game, "Kjeldoran Elite Guard");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, guard, 0, { targets: [ref(bears)] })).toThrow(/refused/);
    toStep(game, "begin-combat");
    activate(game, guard, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, guard)).toBe("battlefield");
    destroy(game, bears);
    settle(game);
    expect(zone(game, guard)).toBe("graveyard");
  });
});

describe("Freyalise Supplicant", () => {
  it("deals half the sacrificed red creature's power, rounded down", () => {
    const { game } = table();
    const supplicant = spawn(game, "Freyalise Supplicant");
    const giant = spawn(game, "Hill Giant"); // red 3/3
    game.dispatch({ type: "activate-ability", player: A, source: supplicant, abilityIndex: 0, targets: [ref(B)], sacrifice: giant });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });

  it("can't sacrifice a creature that is neither red nor white", () => {
    const { game } = table();
    const supplicant = spawn(game, "Freyalise Supplicant");
    spawn(game, "Grizzly Bears");
    expect(() => activate(game, supplicant, 0, { targets: [ref(B)] })).toThrow(/refused/);
  });
});

describe("Elvish Healer", () => {
  it("prevents 2 for a green creature, 1 for anything else", () => {
    const { game } = table();
    const healer = spawn(game, "Elvish Healer");
    const healer2 = spawn(game, "Elvish Healer");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    activate(game, healer, 0, { targets: [ref(bears)] });
    activate(game, healer2, 0, { targets: [ref(giant)] });
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(bears)]);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(giant)]);
    settle(game);
    expect(game.state.objects[bears].damageMarked).toBe(0);
    expect(game.state.objects[giant].damageMarked).toBe(1);
  });
});

describe("Karplusan Giant", () => {
  it("taps a snow land to grow, but not a plain one", () => {
    const { game } = table();
    const giant = spawn(game, "Karplusan Giant");
    const mountain = spawn(game, "Mountain");
    expect(() => activate(game, giant)).toThrow(/refused/);
    const snow = spawn(game, "Snow-Covered Mountain");
    activate(game, giant);
    expect(pt(game, giant)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[snow].tapped).toBe(true);
    expect(game.state.objects[mountain].tapped).toBe(false);
  });
});
