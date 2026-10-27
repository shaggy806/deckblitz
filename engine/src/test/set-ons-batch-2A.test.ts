/**
 * Onslaught (ONS) — batch 2, group A: cycling triggers, a Beast count, the
 * "while tapped" pump, Tribal Golem's five conditions and combat-damage
 * triggers.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  quiet,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

describe("Solar Blast", () => {
  it("cycling it may deal 1 damage to any target, and still draws", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const blast = toHand(game, "Solar Blast");
    const before = hand(game).length;
    pickTargets(a, B);
    pickModes(a, 0);
    game.dispatch({ type: "cycle", player: A, card: blast });
    game.advanceUntil(quiet);
    expect(zone(game, blast)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(before);
  });
});

describe("Primal Boost", () => {
  it("cycling it may give target creature +1/+1", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    pickModes(a, 0);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Primal Boost") });
    game.advanceUntil(quiet);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Thrashing Mudspawn", () => {
  it("its controller loses life equal to the damage it's dealt", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const mudspawn = spawn(game, "Thrashing Mudspawn");
    cast(game, toHand(game, "Shock"), { targets: [ref(mudspawn)] });
    expect(life(game, A)).toBe(18);
    expect(zone(game, mudspawn)).toBe("battlefield");
  });
});

describe("Thunder of Hooves", () => {
  it("deals X to each creature without flying and each player, X the Beasts on the battlefield", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Snarling Undorak");
    spawn(game, "Snapping Thragg", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Thunder of Hooves"));
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(18);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[angel].damageMarked).toBe(0);
  });
});

describe("Snarling Undorak", () => {
  it("pumps only a Beast", () => {
    const { game } = table();
    lands(game, "Forest", 6);
    const undorak = spawn(game, "Snarling Undorak");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, undorak, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, undorak, 0, { targets: [ref(undorak)] });
    expect(pt(game, undorak)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Snapping Thragg", () => {
  it("after combat damage to a player, may deal 3 to a creature that player controls", () => {
    const { game, a } = table();
    const thragg = spawn(game, "Snapping Thragg");
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    pickTargets(a, giant);
    pickModes(a, 0);
    attack(game, a, [thragg]);
    game.advanceUntil(quiet);
    expect(life(game, B)).toBe(17);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Pearlspear Courier", () => {
  it("pumps a Soldier with vigilance only while the Courier stays tapped", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const courier = spawn(game, "Pearlspear Courier");
    const vanguard = spawn(game, "Elite Vanguard");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, courier, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, courier, 0, { targets: [ref(vanguard)] });
    expect(pt(game, vanguard)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, vanguard).has("vigilance")).toBe(true);
    // Inspirit untaps the Courier: the effects end.
    cast(game, toHand(game, "Inspirit"), { targets: [ref(courier)] });
    expect(game.state.objects[courier].tapped).toBe(false);
    expect(pt(game, vanguard)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, vanguard).has("vigilance")).toBe(false);
  });
});

describe("Tribal Golem", () => {
  it("has each ability only while you control a creature of its type", () => {
    const { game } = table();
    const golem = spawn(game, "Tribal Golem");
    expect([...keywords(game, golem)].filter((k) => k !== "regenerate")).toEqual([]);
    spawn(game, "Embermage Goblin"); // a Goblin Wizard
    expect(keywords(game, golem).has("haste")).toBe(true);
    expect(keywords(game, golem).has("flying")).toBe(true);
    expect(keywords(game, golem).has("trample")).toBe(false);
    expect(keywords(game, golem).has("first-strike")).toBe(false);
    spawn(game, "Elite Vanguard", B); // an opponent's Soldier doesn't count
    expect(keywords(game, golem).has("first-strike")).toBe(false);
    lands(game, "Swamp", 1);
    expect(() => activate(game, golem, 0)).toThrow();
    spawn(game, "Walking Corpse");
    activate(game, golem, 0);
    expect(game.state.objects[golem].regenerationShields ?? 0).toBeGreaterThan(0);
  });
});
