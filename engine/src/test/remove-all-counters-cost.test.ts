import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, counters, lands, life, named, pt, ref, settle, spawn, table, toHand, zone } from "./harness.js";

// `removeCounter: { count: "all" }`, the cost's number the X its effect reads
// (rule 601.2h, via 602.2b): no code of its own beyond Catti-brie's, proved here
// on damage, a multiplied amount, and a token's counters.

const addCounters = (game: Game, id: ObjectId, kind: string, n: number): void => {
  game.state.objects[id].counters[kind] = n;
};

describe("Molten Hydra", () => {
  it("removes every counter as a cost, and deals that much", () => {
    const { game } = table();
    const hydra = spawn(game, "Molten Hydra");
    addCounters(game, hydra, "+1/+1", 3);
    expect(pt(game, hydra).power).toBe(4);
    activate(game, hydra, 1, { targets: [ref(B)], settle: false });
    // Paid as it's activated, before anyone can respond.
    expect(counters(game, hydra)).toBe(0);
    expect(game.state.objects[hydra].tapped).toBe(true);
    settle(game);
    expect(life(game, B)).toBe(17);
  });

  it("the number is fixed as the cost is paid: a counter added in response changes nothing", () => {
    const { game } = table();
    const hydra = spawn(game, "Molten Hydra");
    addCounters(game, hydra, "+1/+1", 2);
    lands(game, "Mountain", 3);
    activate(game, hydra, 1, { targets: [ref(B)], settle: false });
    activate(game, hydra, 0, { settle: false });
    settle(game);
    expect(counters(game, hydra)).toBe(1);
    expect(life(game, B)).toBe(18);
  });

  it("still deals it with the Hydra gone: it's read off the ability, not the permanent", () => {
    const { game } = table();
    const hydra = spawn(game, "Molten Hydra");
    addCounters(game, hydra, "+1/+1", 2);
    activate(game, hydra, 1, { targets: [ref(B)], settle: false });
    // With no counters left it's a 1/1, and a Shock kills it in response.
    const shock = toHand(game, "Shock");
    lands(game, "Mountain", 1);
    cast(game, shock, { targets: [ref(hydra)] });
    expect(zone(game, hydra)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("can be activated with none, and deals 0", () => {
    const { game } = table();
    const hydra = spawn(game, "Molten Hydra");
    activate(game, hydra, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(game.state.objects[hydra].tapped).toBe(true);
  });
});

describe("Essence Bottle", () => {
  it("gains 2 life for each counter removed", () => {
    const { game } = table();
    const bottle = spawn(game, "Essence Bottle");
    addCounters(game, bottle, "elixir", 3);
    activate(game, bottle, 1);
    expect(counters(game, bottle, "elixir")).toBe(0);
    expect(life(game)).toBe(26);
  });

  it("removes only its own kind", () => {
    const { game } = table();
    const bottle = spawn(game, "Essence Bottle");
    addCounters(game, bottle, "elixir", 1);
    addCounters(game, bottle, "charge", 4);
    activate(game, bottle, 1);
    expect(counters(game, bottle, "charge")).toBe(4);
    expect(life(game)).toBe(22);
  });
});

describe("Geometric Nexus", () => {
  it("counts each player's instants and sorceries by mana value, then makes a Fractal that big", () => {
    const { game } = table();
    const nexus = spawn(game, "Geometric Nexus");
    lands(game, "Mountain", 9);
    lands(game, "Mountain", 2, B);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(counters(game, nexus, "charge")).toBe(1);
    addCounters(game, nexus, "charge", 4);
    activate(game, nexus, 0);
    expect(counters(game, nexus, "charge")).toBe(0);
    const [fractal] = named(game, "Fractal Token", A);
    expect(pt(game, fractal)).toEqual({ power: 4, toughness: 4 });
    expect(counters(game, fractal)).toBe(4);
  });

  it("with none the token is a 0/0 and dies", () => {
    const { game } = table();
    const nexus = spawn(game, "Geometric Nexus");
    lands(game, "Mountain", 6);
    activate(game, nexus, 0);
    expect(named(game, "Fractal Token", A)).toEqual([]);
  });
});
