/**
 * Lazotep Quarry: an activated ability whose target's filter reads the X paid,
 * from a graveyard, with a sacrifice among its costs that the land can pay with
 * itself.
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import { A, activate, destroy, lands, named, nextTurn, ref, spawn, table, toGraveyard, zone } from "./harness.js";

describe("Lazotep Quarry's graveyard copy", () => {
  it("targets only a creature card whose mana value is the X paid", () => {
    const { game } = table();
    const quarry = spawn(game, "Lazotep Quarry");
    lands(game, "Wastes", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    expect(() => activate(game, quarry, 2, { x: 3, targets: [ref(bears)], sacrifice: quarry })).toThrow();
    expect(() => activate(game, quarry, 2, { x: 1, targets: [ref(giant)], sacrifice: quarry })).toThrow();
    activate(game, quarry, 2, { x: 2, targets: [ref(bears)], sacrifice: quarry });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("is offered at each X that has a target, with that X's options, and no other", () => {
    const { game } = table();
    const quarry = spawn(game, "Lazotep Quarry");
    lands(game, "Wastes", 5);
    toGraveyard(game, "Grizzly Bears");
    const offers = game
      .legalActions(A)
      .flatMap((action) => (action.kind === "activate-ability" && action.source === quarry && action.abilityIndex === 2 ? [action] : []));
    expect(offers.map((o) => o.xCost)).toEqual([{ maxX: 2, minX: 2 }]);
    expect(offers[0].sacrifice?.choices).toEqual([quarry]);
  });

  it("makes a 4/4 black Zombie, paying with itself", () => {
    const { game } = table();
    const quarry = spawn(game, "Lazotep Quarry");
    lands(game, "Wastes", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, quarry, 2, { x: 2, targets: [ref(bears)], sacrifice: quarry });
    expect(zone(game, quarry)).toBe("graveyard");
    const [token] = named(game, "Grizzly Bears", A);
    expect(game.state.objects[token].isToken).toBe(true);
    const made = computeCharacteristics(game.state, game.registry, token);
    expect([made.power, made.toughness]).toEqual([4, 4]);
    expect([...made.colors]).toEqual(["B"]);
    expect(made.subtypes).toEqual(["Zombie"]);
  });

  it("may sacrifice another Desert, and can't sacrifice what isn't one", () => {
    const { game } = table();
    const quarry = spawn(game, "Lazotep Quarry");
    const other = spawn(game, "Lazotep Quarry");
    const [wastes] = lands(game, "Wastes", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => activate(game, quarry, 2, { x: 2, targets: [ref(bears)], sacrifice: wastes })).toThrow();
    activate(game, quarry, 2, { x: 2, targets: [ref(bears)], sacrifice: other });
    expect(zone(game, other)).toBe("graveyard");
    expect(zone(game, quarry)).toBe("battlefield");
    expect(game.state.objects[quarry].tapped).toBe(true);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });

  it("copies a mana value of 0 at X 0, its token still 4/4 though X is 0", () => {
    const { game } = table();
    const quarry = spawn(game, "Lazotep Quarry");
    lands(game, "Wastes", 2);
    const walker = toGraveyard(game, "Hangarback Walker");
    activate(game, quarry, 2, { x: 0, targets: [ref(walker)], sacrifice: quarry });
    const [token] = named(game, "Hangarback Walker", A);
    expect(zone(game, token)).toBe("battlefield");
    expect(computeCharacteristics(game.state, game.registry, token).power).toBe(4);
  });

  it("copies the card, not what it last was on the battlefield (the ruling)", () => {
    const { game, a } = table();
    a.chooseCopyFn = () => null;
    const quarry = spawn(game, "Lazotep Quarry");
    lands(game, "Wastes", 6);
    const clone = spawn(game, "Clone");
    game.state.objects[clone].copyOf = "Grizzly Bears";
    destroy(game, clone);
    expect(zone(game, clone)).toBe("graveyard");
    activate(game, quarry, 2, { x: 4, targets: [ref(clone)], sacrifice: quarry });
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(named(game, "Clone", A)).toHaveLength(1);
  });

  it("copies the card for The Scarab God too", () => {
    const { game, a } = table();
    a.chooseCopyFn = () => null;
    const god = spawn(game, "The Scarab God");
    lands(game, "Underground Sea", 4);
    const clone = spawn(game, "Clone");
    game.state.objects[clone].copyOf = "Grizzly Bears";
    destroy(game, clone);
    activate(game, god, 0, { targets: [ref(clone)] });
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(named(game, "Clone", A)).toHaveLength(1);
  });

  it("activates only as a sorcery", () => {
    const { game } = table();
    const quarry = spawn(game, "Lazotep Quarry");
    lands(game, "Wastes", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    nextTurn(game);
    expect(() => activate(game, quarry, 2, { x: 2, targets: [ref(bears)], sacrifice: quarry })).toThrow();
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Lazotep Quarry's mana", () => {
  it("taps for {C}, or for any colour with a creature sacrificed", () => {
    const { game } = table();
    const quarry = spawn(game, "Lazotep Quarry");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, quarry, 0);
    expect(game.state.players[A].manaPool).toHaveLength(1);
    game.state.objects[quarry].tapped = false;
    activate(game, quarry, 1, { sacrifice: bears });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[quarry].tapped).toBe(true);
    expect(game.state.players[A].manaPool).toHaveLength(2);
  });
});
