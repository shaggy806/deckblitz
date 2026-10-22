/**
 * Ixalan, the scaffolder-finished cards: the explore payoffs and the Aura.
 */
import { describe, expect, it } from "vitest";

import { B, cast, counters, enter, lands, pickTargets, pt, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Lurking Chupacabra", () => {
  it("a creature you control exploring gives an opponent's creature -2/-2", () => {
    const { game, a } = table();
    spawn(game, "Lurking Chupacabra");
    const bears = spawn(game, "Grizzly Bears", B);
    toLibrary(game, "Forest");
    pickTargets(a, bears);
    enter(game, "Merfolk Branchwalker");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("an opponent's creature exploring doesn't trigger it", () => {
    const { game } = table();
    spawn(game, "Lurking Chupacabra");
    const bears = spawn(game, "Grizzly Bears", B);
    toLibrary(game, "Forest", B);
    enter(game, "Merfolk Branchwalker", B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Shadowed Caravel", () => {
  it("gets a +1/+1 counter whenever a creature you control explores", () => {
    const { game } = table();
    const caravel = spawn(game, "Shadowed Caravel");
    toLibrary(game, "Forest");
    enter(game, "Seekers' Squire");
    expect(counters(game, caravel)).toBe(1);
  });
});

describe("Castaway's Despair", () => {
  it("taps the enchanted creature as it enters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    const aura = toHand(game, "Castaway's Despair");
    cast(game, aura, { targets: [ref(bears)] });
    expect(zone(game, aura)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});
