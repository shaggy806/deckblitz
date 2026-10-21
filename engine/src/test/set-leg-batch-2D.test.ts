/**
 * Legends (LEG; B133), group D. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, destroy, lands, pickModes, pt, ref, registryOf, spawn, table, toHand, toStep, zone } from "./harness.js";

const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...computeCharacteristics(game.state, registryOf(game), id).colors];

describe("Winter Blast", () => {
  it("taps all X targets and deals 2 damage only to those with flying", () => {
    const { game } = table();
    const birds = spawn(game, "Birds of Paradise", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Winter Blast"), { x: 2, targets: [ref(birds), ref(bears)] });
    expect(zone(game, birds)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Akron Legionnaire", () => {
  it("stops your other nonartifact creatures attacking, but not itself or artifact creatures", () => {
    const { game } = table();
    const akron = spawn(game, "Akron Legionnaire");
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    const declare = (ids: readonly ObjectId[]) =>
      game.canDispatch({ type: "declare-attackers", player: A, attackers: ids.map((attacker) => ({ attacker, defender: B })) });
    expect(declare([bears])).not.toBeNull();
    expect(declare([akron, thopter])).toBeNull();
  });
});

describe("Dream Coat", () => {
  it("makes the enchanted creature the chosen combination of colours, for good", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Dream Coat"), { targets: [ref(bears)] });
    const coat = game.battlefield.find((id) => game.state.objects[id].cardName === "Dream Coat")!;
    // Modes: the five single colours (0–4), then pairs in WUBRG order — 5 is White, Blue.
    pickModes(a, 5);
    activate(game, coat);
    expect([...colorsOf(game, bears)].sort()).toEqual(["U", "W"]);
    destroy(game, coat);
    expect(zone(game, coat)).toBe("graveyard");
    expect([...colorsOf(game, bears)].sort()).toEqual(["U", "W"]);
  });
});

describe("Alchor's Tomb", () => {
  it("makes target permanent you control the colour chosen as it resolves", () => {
    const { game, a } = table();
    const tomb = spawn(game, "Alchor's Tomb");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    pickModes(a, 3);
    activate(game, tomb, 0, { targets: [ref(bears)] });
    expect(colorsOf(game, bears)).toEqual(["R"]);
    toStep(game, "precombat-main");
    expect(colorsOf(game, bears)).toEqual(["R"]);
  });
});

describe("Wall of Wonder", () => {
  it("gets +4/-4 and may attack despite defender", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Wonder");
    lands(game, "Island", 4);
    activate(game, wall);
    expect(pt(game, wall)).toEqual({ power: 5, toughness: 1 });
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    expect(game.canDispatch({ type: "declare-attackers", player: A, attackers: [{ attacker: wall, defender: B }] })).toBeNull();
  });
});

describe("Aisling Leprechaun", () => {
  it("turns each creature blocking it green, and it stays green after the Leprechaun dies", () => {
    const { game, a, b } = table();
    const leprechaun = spawn(game, "Aisling Leprechaun");
    const angel = spawn(game, "Serra Angel", B);
    b.declareBlockersFn = () => [{ blocker: angel, attacker: leprechaun }];
    a.declareAttackersFn = () => [{ attacker: leprechaun, defender: B }];
    toStep(game, "postcombat-main");
    expect(zone(game, leprechaun)).toBe("graveyard");
    expect(zone(game, angel)).toBe("battlefield");
    expect(colorsOf(game, angel)).toEqual(["G"]);
  });
});

describe("Beasts of Bogardan", () => {
  it("gets +1/+1 only while an opponent controls a nontoken white permanent", () => {
    const { game } = table();
    const beasts = spawn(game, "Beasts of Bogardan");
    spawn(game, "Savannah Lions");
    expect(pt(game, beasts)).toEqual({ power: 3, toughness: 3 });
    spawn(game, "Savannah Lions", B);
    expect(pt(game, beasts)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Hyperion Blacksmith", () => {
  it("untaps an opponent's artifact when that's chosen on resolution", () => {
    const { game, a } = table();
    const smith = spawn(game, "Hyperion Blacksmith");
    const ring = spawn(game, "Sol Ring", B, { tapped: true });
    pickModes(a, 1);
    activate(game, smith, 0, { targets: [ref(ring)] });
    expect(game.state.objects[ring].tapped).toBe(false);
  });
});
